with open("10.txt") as fh:
    data = fh.read()


class X:
    x = 1
    s = 0


def getCycles():
    cycle = 0
    for line in data.split("\n"):
        # print(cycle, X.x, X.s, line)
        if line == "noop":
            cycle += 1
            yield cycle
        else:
            count = int(line.split(" ")[1])
            for _ in range(2):
                cycle += 1
                yield cycle
            X.x += count


pixels = 3
wide = 40
high = 6
grid = [['-' for _ in range(wide)] for _ in range(high)]
for cycle in getCycles():
    # if cycle in [20, 60, 100, 140, 180, 220]:
    #     # print(cycle, X.x)
    #     X.s += cycle * X.x
    pos = (int((cycle - 1) / 40), (cycle - 1) % 40)
    grid[pos[0]][pos[1]] = '#' if abs(pos[1] - X.x) <= 1 else '.'
    # print("\n".join([''.join(row) for row in grid]))
    # print(cycle, X.x, pos)
    # print()
    # if cycle > 4:
    #     exit()

print("\n".join([''.join(row) for row in grid]))
