import sys

import numpy

import cv2

import make_sheet

guitar_height = 600

def main():
    if len(sys.argv) != 5:
        print(f"usage: python3 {sys.argv[0]} <movie_path> <guitar_path> <sheet_path> <output_path>")
        exit(1)
    (
        movie_path,
        guitar_path,
        sheet_path,
        output_path,
    ) = sys.argv[1:]

    movie = get_video(movie_path, 0)
    guitar = get_video(guitar_path)

    print('getting sheet')

    sheet = get_sheet(sheet_path, 0, 18.05)

    print('stitching')

    build_out(movie, guitar, sheet, output_path)

def get_video(video_path, pad_left=0):
    # one frame is thrown away
    pad_left += 1

    cap = cv2.VideoCapture(video_path)
    video_fps = cap.get(cv2.CAP_PROP_FPS)
    ratio = make_sheet.fps / video_fps

    frame_number = 0
    yielded = 0
    frame = None
    while cap.isOpened():
        ret, _frame = cap.read()
        if not ret:
            break
        frame = _frame
        if not frame_number:
            print(video_path, frame.shape)
            for _ in range(int(pad_left * make_sheet.fps)):
                yield numpy.zeros(frame.shape)
        frame_number += 1
        while yielded < frame_number * ratio:
            yielded += 1
            yield frame[:]
    while True:
        yield numpy.zeros(frame.shape)

def get_sheet(sheet_path, pad_left=0, pad_right=0):
    sheet_raw = make_sheet.get_sheet(sheet_path)
    sheet = []
    for _ in range(int(pad_left * make_sheet.fps)):
        sheet.append(numpy.zeros(sheet_raw[0].shape))
    for frame in sheet_raw:
        sheet.append(frame)
    for _ in range(int(pad_right * make_sheet.fps)):
        sheet.append(numpy.zeros(sheet_raw[0].shape))
    return sheet

def build_out(movie, guitar, sheet, output_path):
    first_g = next(guitar)
    first_m = next(movie)
    guitar_width = movie_width = int(guitar_height * first_g.shape[1] / first_g.shape[0])
    movie_height = int(movie_width * first_m.shape[0] / first_m.shape[1])
    sheet_height = guitar_height + movie_height
    sheet_width = int(sheet_height * sheet[0].shape[1] / sheet[0].shape[0])

    height = sheet_height
    width = sheet_width + guitar_width

    out = cv2.VideoWriter(output_path, cv2.VideoWriter_fourcc(*'mp4v'), make_sheet.fps, (width, height))

    print('guitar', guitar_height, guitar_width)
    print('movie', movie_height, movie_width)
    print('sheet', sheet_height, sheet_width)

    progress = int(len(sheet) / 100)

    for i, sheet_frame_raw in enumerate(sheet):
        if i % progress == 0:
            print('0.2f' % 1. * i / len(sheet))
        movie_frame = resize(next(movie), (movie_width, movie_height))
        guitar_frame = resize(next(guitar), (guitar_width, guitar_height))
        sheet_frame = resize(sheet_frame_raw, (sheet_width, sheet_height))

        out_frame = numpy.hstack([sheet_frame, numpy.vstack([movie_frame, guitar_frame])])
        out_frame = numpy.array(out_frame, dtype=numpy.uint8)

        out.write(out_frame)

    out.release()

def resize(raw, dsize):
    return cv2.resize(raw, dsize=dsize, interpolation=cv2.INTER_CUBIC)

if __name__ == "__main__":
    main()