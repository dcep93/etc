import collections

import aocutils

with open(f'{__file__.split("/")[-1].split(".py")[0]}.txt') as fh:
    txt = fh.read()
lines = [list(line) for line in txt.split("\n")]

for i in range(50):
    lines[i] = list(lines[0])
    lines[-i-1] = list(lines[0])
for _ in range(0):
    lines = [l[1:-1] for l in lines[1:-1]]

# lines = '''
# #.....#..
# #....#...
# #........
# ####.####
# ....S....
# .........
# .........
# .........
# .........
# '''.strip().split("\n")


l = ['.' for _ in range(5)]
lines = [list(l) for _ in range(len(l))]
lines[len(l)//2] = ['.' if i != len(l)//2 else 'S' for i in range(len(l))]

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

    def getSpots():
        next_spots = []
        for s in spots:
            for d in [(0, 1), (0, -1), (1, 0), (-1, 0)]:
                n = tuple(s[i] + d[i] for i in range(len(s)))
                if n in seen:
                    continue
                v = get(n, lines, False) # isPart1)
                if v == 'S':
                    v = '.'
                if n in targets:
                    targets[n] = ii
                if v != '.':
                    continue
                seen[n] = True
                next_spots.append(n)
        return next_spots

    def scaleSpots():
        print("scaleSpots")
        import math
        lcm = 1
        for iii in targets.values():
            lcm = (lcm * iii) // math.gcd(lcm, iii)
        # print(ii, lcm, targets)
        if any(v != lcm for v in targets.values()):
            raise
        # if ii != lcm:
        #     raise
        for i, line in enumerate(lines):
            for j, char in enumerate(line):
                if (char == '#') == (i, j) in seen:
                    raise


        factor = lcm // 5
        radius = factor // 2
        scale = steps // factor
        remainder = (steps - (scale * factor))

        r = False
        print(radius)
        for i in range(radius):
            vs = [memo[i + radius * j] - memo[i-1 + radius * j] for j in range(5)]
            base = memo[i] - memo[i-1]
            v1 = memo[i+radius]-memo[i+radius-1]
            v2 = memo[i+2*radius]-memo[i+2*radius-1]
            v3 = memo[i+3*radius]-memo[i+3*radius-1]
            v4 = memo[i+4*radius]-memo[i+4*radius-1]
            d1 = v1 - base
            d2 = v2 - v1
            if d1 != d2:
                r = True
                print(i, base, vs)
                print(max(memo), radius, steps, len(lines))
                # raise
        if r:
            raise
        

        extracted = [(memo[i]-memo[i-1], memo[i+radius]-memo[i+radius-1], scale + (0 if remainder >= i else -1), (remainder-i) % radius) for i in range(radius)]
        x = [radius * count * (base + (diff * (count - 1) // 2)) + (extra * (base + (diff * (count*+1)))) for base, diff, count, extra in extracted]
        return sum(x)

        # 606822764898251 too low
        # 615479116147000 too high

    steps = 12*len(lines)+3
    if isPart1 and steps > 100000:
        raise
    start = getPosition()
    targets = {tuple(start[i] + 8*nn[i] for i in range(len(start))): False for nn in [
        (len(lines), 0),
        (-len(lines), 0),
        (0, len(lines[0])),
        (0, -len(lines[0])),
    ]}
    spots = [start]
    seen = {start: True}
    
    ii = 0
    parity = (sum(start) + steps) % 2
    if parity == 1:
        ii += 1
        spots = getSpots()

    total = 0
    memo = {-1:0}
    while True:
        num = len(spots)
        memo[(ii-1)//2] = num
        total += num

        if ii >= steps:
            break

        if not isPart1 and all(targets.values()):
            return scaleSpots()

        if not spots:
            print(ii)
            raise

        for _ in range(2):
            ii += 1
            spots = getSpots()

    return total

# print(getAnswer(True))
print(getAnswer(False))
