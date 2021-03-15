import sys

from cv2 import imread, VideoWriter, VideoWriter_fourcc

fps = 10
height = 500

time_to_y = {
    250.: None,
}

def main():
    if len(sys.argv) != 3:
        print(f"usage: python3 {sys.argv[0]} <image_path> <output_path>")
        exit(1)
    image_path = sys.argv[1]
    output_path = sys.argv[2]
    source = imread(image_path)
    size = (source.shape[1], height)
    out = VideoWriter(output_path, VideoWriter_fourcc(*'DIVX'), fps, size)

    previous_time = 0.
    previous_y = height
    for target_time in sorted(time_to_y.keys()):
        y = time_to_y[target_time]
        if y is None:
            y = source.shape[0]
        distance = y - previous_y
        duration = target_time - previous_time
        frames = int(fps * duration)
        for frame in range(frames):
            offset = int(previous_y + (float(distance) * frame / frames))
            img = source[offset-height:offset]
            out.write(img)
        previous_time = target_time
        previous_y = y
    out.release()

if __name__ == "__main__":
    main()