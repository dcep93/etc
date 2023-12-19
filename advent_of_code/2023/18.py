import collections

import aocutils

with open(f'{__file__.split("/")[-1].split(".py")[0]}.txt') as fh:
    txt = fh.read()
lines = txt.split("\n")

def getWidth(y, dug):
    xs = []
    for points in dug.values():
        for pp, p, s, ps in points:
            if s[0] != 0:
                if pp[0] == y or p[0] == y:
                    xs.append([pp[1], ps[0] + s[0]])
                elif (pp[0] < y) == (p[0] > y):
                    xs.append([pp[1], 2 * (ps[0] + s[0])])

    xs.sort()
    last = None
    parity = 0
    c = 0
    for x, p in xs:
        parity += p
        if last is None:
            ss = s
            last = x
        elif parity == 0:
            c += 1 + x - last
            last = None
    return c

def getAnswer(isPart1: bool):
    dug = collections.defaultdict(list)
    p = (0, 0)
    ps = None
    m = {'R': (0, 1), 'D': (1, 0), 'U': (-1, 0), 'L': (0, -1)}
    for line in lines:
        d, n, color = line.split(" ")
        if not isPart1:
            d = ['R', 'D', 'L', 'U'][int(color[-2])]
            n = int(color[2:-2], 16)
        s = m[d]
        pp = p
        p = tuple(p[i] + (int(n) * s[i]) for i in range(len(p)))
        dug[pp[0]].append((pp, p, s, ps))
        ps = s
    if p != (0, 0):
        raise

    cc = 0
    py = None
    for y in sorted(dug.keys()):
        c = getWidth(y, dug)
        if py is None:
            py = y - 1
        height = y - py - 1
        if height > 0:
            c += height * getWidth(y - 1, dug)
        py = y
        cc += c
    return cc


# print(getAnswer(True))
print(getAnswer(False))
