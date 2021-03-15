import sys

from cv2 import imread, VideoWriter, VideoWriter_fourcc

fps = 5
height = 750

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
    source = imread(image_path)
    print(source.shape)
    size = (source.shape[1], height)
    out = VideoWriter(output_path, VideoWriter_fourcc(*'mp4v'), fps, size)
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
            offset = int(previous_y + (distance * frame / float(frames-1)))
            img = source[offset-height:offset]
            out.write(img)
            recorded += 1
            if recorded % fps == 0:
                print(recorded / fps, offset)
        previous_time = float(target_time)
        previous_y = y
    out.release()

if __name__ == "__main__":
    main()