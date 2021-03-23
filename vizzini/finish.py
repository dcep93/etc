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

    movie = get_video(movie_path, pad=16.4) # socrates at 13.364s 2nd thump 4m07.389s
    guitar = get_video(guitar_path, fps_factor=234.025/234.258) # socrates at 29.763 2nd thump 4m24.021s

    print('getting sheet')

    sheet = get_sheet(sheet_path, 16.4, 18.05)

    print('stitching')

    build_out(movie, guitar, sheet, output_path)

def get_video(video_path, pad=0, fps_factor=1):
    cap = cv2.VideoCapture(video_path)
    video_fps = cap.get(cv2.CAP_PROP_FPS) / fps_factor
    ratio = make_sheet.fps / video_fps

    frame_number = 0
    yielded = 0
    frame = None
    pad_num = int(pad * make_sheet.fps)
    while cap.isOpened():
        ret, _frame = cap.read()
        if not ret:
            break
        frame = _frame
        if not frame_number:
            print(video_path, frame.shape, video_fps)
            for i in range(0, 1, 1/(1+pad_num)):
                yield frame * i
        frame_number += 1
        while yielded < frame_number * ratio:
            yielded += 1
            yield frame[:]
    print(video_path, frame_number + pad_num)
    while True:
        yield numpy.zeros(frame.shape)

def get_sheet(sheet_path, pad_left=0, pad_right=0):
    sheet_raw = make_sheet.get_sheet(sheet_path)
    sheet = []
    for i in range(0, 1, 1/(pad_left * make_sheet.fps)):
        sheet.append(i * sheet_raw[0])
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
            print('%0.2f%%' % (100. * i / len(sheet)))
        movie_frame = sharpen(resize(next(movie), (movie_width, movie_height)))
        guitar_frame = resize(next(guitar), (guitar_width, guitar_height))
        sheet_frame = resize(sheet_frame_raw, (sheet_width, sheet_height))

        out_frame = numpy.hstack([sheet_frame, numpy.vstack([movie_frame, guitar_frame])])
        out_frame = numpy.array(out_frame, dtype=numpy.uint8)

        out.write(out_frame)

    out.release()

def resize(raw, dsize):
    return cv2.resize(raw, dsize=dsize, interpolation=cv2.INTER_CUBIC)

def sharpen(frame):
    gaussian = cv2.GaussianBlur(frame, (0, 0), 2.0)
    alpha = 1.9
    return cv2.addWeighted(frame, alpha, gaussian, 1 - alpha, 0, frame)

if __name__ == "__main__":
    main()