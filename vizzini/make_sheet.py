import sys

import numpy

from cv2 import imread, VideoWriter, VideoWriter_fourcc

fps = 30
height = 1750

time_to_y = {
    25: 1400,
    32: 1800,
    50: -1,
    65: 2400,
    85: -1,
    96: 2700,
    124: 4000,
    144: 5050,
    160: 5900,
    180: 6900,
    192: 7450,
    207: 7750,
    220: -1,
    240: 8460,
    250: None,
}

def main():
    if len(sys.argv) != 3:
        print(f"usage: python3 {sys.argv[0]} <image_path> <output_path>")
        exit(1)
    image_path = sys.argv[1]
    output_path = sys.argv[2]

    sheet = get_sheet(image_path)
    save_out(output_path, sheet)

def get_sheet(image_path):
    source = imread(image_path)
    size = (source.shape[1], height)
    sheet = []

    recorded = 0
    previous_time = 0.
    previous_y = height
    for target_time in sorted(time_to_y.keys()):
        y = time_to_y[target_time]
        if y is None:
            y = source.shape[0]
        elif y == -1:
            y = previous_y
        distance = y - previous_y
        duration = target_time - previous_time
        frames = int(fps * duration)
        for frame in range(frames):
            offset = max(height, int(previous_y + (distance * frame / float(frames-1))))
            img = source[offset-height:offset]
            sheet.append(img)
            recorded += 1
        previous_time = float(target_time)
        previous_y = y
    return sheet

def save_out(output_path, out_matrix):
    out = VideoWriter(output_path, VideoWriter_fourcc(*'mp4v'), fps, (out_matrix.shape[2], out_matrix.shape[1]))

    for frame in out_matrix:
        out.write(frame)
    out.release()


if __name__ == "__main__":
    main()