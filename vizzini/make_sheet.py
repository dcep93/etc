import sys

import numpy

from cv2 import imread, VideoWriter, VideoWriter_fourcc

fps = 20
height = 2050

time_to_y = {
    10: -1,
    38: 2500,
    50: -1,
    65: 3200,
    85: -1,
    96: 3900,
    124: 4900,
    144: 5700,
    170: 7200,
    207: 8500,
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
            # if recorded % fps == 0:
            #     print(recorded / fps, offset-height)
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