import aocutils

with open(f'{__file__.split("/")[-1].split(".py")[0]}.txt') as fh:
    txt = fh.read()
lines = txt.split("\n")

def getAnswer(isPart1: bool):
    if isPart1:
        target = (len(lines)-1, len(lines[-1])-1)
        mx = lambda p: target[0]-p[0]+target[1]-p[1]
        m = 1 + 9 * mx((0, 0))
        paths = [(((0, 0),), (0, 0),  0)]
        for ii in range(10000):
            if not paths:
                print(ms[target])
                break
            ds, p, score = paths.pop()
            # print(ii, len(paths), len(ds), ds[-4:], p, score)
            for d in [(-1, 0), (0, -1), (0, 1), (1, 0)]:
                n = (p[0]+d[0], p[1]+d[1])
                if (ds[-1][0] + d[0], ds[-1][1] + d[1]) != (0, 0):
                    if any(dd != d for dd in ds[-3:]):
                        if n[0] >= 0 and n[0] < len(lines) and n[1] >= 0 and n[1] < len(lines[0]):
                            s = score + int(lines[n[0]][n[1]])
                            if s + mx(n) < m:
                                paths.append((ds + (d,), n, s))
                                if n == target:
                                    m = s
    else:
        pass

for isPart1 in [True, False]:
    getAnswer(isPart1)
