import collections

import aocutils


with open(f'{__file__.split("/")[-1].split(".py")[0]}.txt') as fh:
    txt = fh.read()
lines = txt.split("\n")

def getAnswer(isPart1: bool):
    dug = collections.defaultdict(lambda: {})
    p = (0, 0)
    m = {'R': (0, 1), 'D': (1, 0), 'U': (-1, 0), 'L': (0, -1)}
    dug[p[0]][p[1]] = []
    for line in lines:
        d, n, color = line.split(" ")
        if not isPart1:
            d = ['R', 'D', 'L', 'U'][int(color[-2])]
            n = int(color[2:-2], 16)
        s = m[d]
        if s[0] == 0:
            dug[p[0]][p[1]].append(s)
            p = list(p[i] + (int(n) * s[i]) for i in range(len(p)))
            dug[p[0]][p[1]] = [s]
        else:
            for _ in range(int(n)):
                dug[p[0]][p[1]].append(s)
                p = list(p[i] + s[i] for i in range(len(p)))
                dug[p[0]][p[1]] = [s]
    origin = dug[p[0]][p[1]]
    if len(origin) != 1:
        raise
    origin.append(m[lines[0][0]])    

    c = 0
    for y, line in sorted(dug.items()):
        yy = sorted(line.keys())
        last = None
        parity = 0
        for x, s in sorted(line.items()):
            parity += s[0][0] + s[1][0]
            if last is None:
                ss = s[0]
                last = x
            elif parity == 0:
                c += 1 + x - last
                last = None
    return c

# print(getAnswer(True))
print(getAnswer(False))
