import sys

import numpy

import cv2

import make_sheet

guitar_height = 540

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

    movie = get_video(movie_path, 0, 19.28)
    guitar = get_video(guitar_path)

    print('getting sheet')

    sheet = get_sheet(sheet_path, 0, 18.1)

    print('stitching')

    out_matrix = get_out(movie, guitar, sheet)

    print('saving')

    make_sheet.save_out(output_path, out_matrix)

    print('saved')

def get_video(video_path, pad_left=0, pad_right=0):
    cap = cv2.VideoCapture(video_path)
    video_fps = cap.get(cv2.CAP_PROP_FPS)
    ratio = make_sheet.fps / video_fps
    video = []
    frame_number = pad_left * video_fps
    while cap.isOpened():
        ret, frame = cap.read()
        frame_number += 1
        if not ret:
            for _ in range(int(pad_right * make_sheet.fps)):
                video.append(numpy.zeros(video[-1].shape))
            break
        if not video:
            print(video_path, frame.shape)
            for _ in range(int(pad_left * make_sheet.fps)):
                video.append(numpy.zeros(frame.shape))
        while len(video) < frame_number * ratio:
            video.append(frame[:])
    return video

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

def get_out(movie, guitar, sheet):
    assert len(movie) == len(guitar) and len(movie) == len(sheet), f'{len(movie)} {len(guitar)} {len(sheet)}'
    out_matrix = []

    guitar_width = movie_width = int(guitar_height * guitar[0].shape[1] / guitar[0].shape[0])
    movie_height = int(movie_width * movie[0].shape[0] / movie[0].shape[1])
    sheet_height = guitar_height + movie_height
    sheet_width = int(sheet_height * sheet[0].shape[1] / sheet[0].shape[0])

    print('guitar', guitar_height, guitar_width)
    print('movie', movie_height, movie_width)
    print('sheet', sheet_height, sheet_width)

    for i, raw_movie_frame in enumerate(movie):
        movie_frame = resize(raw_movie_frame, (movie_width, movie_height))
        guitar_frame = resize(guitar[i], (guitar_width, guitar_height))
        sheet_frame = resize(sheet[i], (sheet_width, sheet_height))

        out_frame = numpy.hstack([sheet_frame, numpy.vstack([movie_frame, guitar_frame])])

        out_matrix.append(out_frame)
    
    return numpy.array(out_matrix, dtype=numpy.uint8)

def resize(raw, dsize):
    return cv2.resize(raw, dsize=dsize, interpolation=cv2.INTER_CUBIC)

if __name__ == "__main__":
    main()