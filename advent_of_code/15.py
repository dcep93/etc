with open("15.txt") as fh:
    text = fh.read()


def near(s, a, b):
    return s.split(a)[1].split(b)[0]


sensors = []
for line in text.split("\n"):
    s, b = line.split(':')
    sx = int(near(s, "x=", ","))
    sy = int(near(s, "y=", ","))
    bx = int(near(b, "x=", ","))
    by = int(near(b, "y=", ","))
    distance = abs(sx - bx) + abs(sy - by)
    sensors.append(((sx, sy), distance))
for s in sensors:
    print(s)

print("begin")
r = 4000000
# r = 20
i = -1
while i < r:
    i += 1
    j = -1
    ss = [(
        sy,
        sx,
        distance,
        distance - abs(sx - i),
    ) for (sx, sy), distance in sensors]
    ss.sort()
    while j < r:
        j += 1
        for sy, sx, distance, d in ss:
            if d < 0: continue
            if j < sy - d: continue
            jj = sy + d
            if j <= jj:
                j = jj + 1
                if j > r:
                    break
        if i <= r and j <= r:
            print(i, j)  # 3403960 3289729
            print(i * r + j)
            exit()
print("fail")
