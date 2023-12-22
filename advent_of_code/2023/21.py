import collections

import aocutils

with open(f'{__file__.split("/")[-1].split(".py")[0]}.txt') as fh:
    txt = fh.read()
lines = [list(line) for line in txt.split("\n")]

# for i in range(63):
#     lines[i] = list(lines[0])
#     lines[-i-1] = list(lines[0])
# for _ in range(61):
#     lines = [l[1:-1] for l in lines[1:-1]]

lines = '''
.........
.........
#........
.##......
....S....
.........
.........
.........
.........
'''.strip().split("\n")


# l = ['.' for _ in range(5)]
# lines = [list(l) for _ in range(len(l))]
# lines[len(l)//2] = ['.' if i != len(l)//2 else 'S' for i in range(len(l))]

# lines[1][1] = '#'
# lines[0][0] = '#'

# print("\n".join([''.join(l) for l in lines]))

def getAnswer(isPart1: bool):
    print("getAnswer", isPart1)
    def getPosition():
        for i, line in enumerate(lines):
            for j, char in enumerate(line):
                if char == 'S':
                    return (i, j)

    def get(s, v, isPart1):
        if not s:
            return v
        p, s = s[0], s[1:]
        if not isPart1:
            while p < 0: p += len(v)
            while p >= len(v): p -= len(v)
        if p < 0 or p >= len(v):
            return None
        return get(s, v[p], isPart1)
        
    steps = 8*len(lines)+3 # 26501365
    start = getPosition()
    spots = [start]
    seen = {start: True}
    starts = {tuple(start[i] + 2*nn[i] for i in range(len(start))): False for nn in [
        (len(lines), 0),
        (-len(lines), 0),
        (0, len(lines[0])),
        (0, -len(lines[0])),
    ]}

    scale = None
    oldseen = {}
    oldspots = []
    corners = None

    memo = {}

    def f(ii, isFinal=False):
        parity = (sum(start) + ii) % 2
        counts = [sum([1 for s in ss if (sum(s) % 2) == parity]) for ss in [seen.keys(), oldseen.keys(), spots, oldspots]]
        if isFinal:
            print('counts', counts)
            # print(seen)
        if scale is None:
            return counts[0]
        if counts[3] > 0:
            raise
        s_old = counts[1] * scale * scale
        s_new = (counts[0] - counts[1]) * scale - (corners * (scale - 1))
        total = s_old + s_new
        print('t', scale, corners, 'total', total, s_old, s_new)
        # 
        return total
        # 606822764898251 too low
        # 615479116147000 too high

    ii = 0
    while ii < steps:
        if scale is None:
            memo[ii] = f(ii)
        if all(starts.values()):
            import math
            lcm = 1
            for iii in starts.values():
                lcm = (lcm * iii) // math.gcd(lcm, iii)
            # print(ii, lcm, starts)
            if any(v != lcm for v in starts.values()):
                raise
            if ii != lcm:
                raise
            for i, line in enumerate(lines):
                for j, char in enumerate(line):
                    if (char == '#') == (i, j) in seen:
                        raise
            starts = {start: False}
            oldseen = {i: True for i in seen.keys()}
            oldspots = spots
            if isPart1:
                continue # 318804 318800
            if steps <= lcm * 2:
                continue
            scale = ((steps-1) // lcm)
            ii = scale * lcm
            corners = memo[steps - ii]
            print('remaining', steps - ii, corners, {i: memo[i] for i in range(steps-ii-1, steps-ii+2)})
            print('lcm', lcm, steps - ii, steps)
            continue
        ii += 1
        if not spots:
            raise
        next_spots = []
        for s in spots:
            for d in [(0, 1), (0, -1), (1, 0), (-1, 0)]:
                n = tuple(s[i] + d[i] for i in range(len(s)))
                if n in seen:
                    continue
                v = get(n, lines, False)
                if v == 'S':
                    v = '.'
                if n in starts:
                    starts[n] = ii
                if v != '.':
                    continue
                seen[n] = True
                next_spots.append(n)
        spots = next_spots

    return f(steps, True)

print(getAnswer(True))
print(getAnswer(False))
