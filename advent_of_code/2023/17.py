import collections

import aocutils


with open(f'{__file__.split("/")[-1].split(".py")[0]}.txt') as fh:
    txt = fh.read()
lines = txt.split("\n")

def getHeat(lower, upper):
    start = (0, 0)
    seen = collections.defaultdict(dict)
    best = {}
    best[start] = None
    paths = [(0, ((0, 0),), start, 0)]
    for ii in range(1000000):
        if not paths:
            print(ii)
            return best[start]
        score, path, position, recent = paths.pop()
        b = best[start]
        if b is not None:
            if position in best:
                b -= best[position]
            if score >= b:
                continue
        if position == (len(lines)-1, len(lines[-1])-1):
            best[start] = score
            iposition = position
            iscore = 0
            for i, ip in enumerate(path[:-1]):
                if ip != path[i+1]:
                    best[iposition] = min(best[iposition], iscore) if iposition in best else iscore
                iscore += int(lines[iposition[0]][iposition[1]])
                iposition = (iposition[0] - ip[0], iposition[1] - ip[1])
            if iscore != score:
                raise
            continue
        for np in [(-1, 0), (0, -1), (0, 1), (1, 0)]:
            n = (position[0]+np[0], position[1]+np[1])
            if n[0] < 0 or n[0] >= len(lines) or n[1] < 0 or n[1] >= len(lines[0]):
                continue
            if path[0][0] == -np[0] and path[0][1] == -np[1]:
                continue
            nrecent = 1 if np != path[0] else recent + 1
            if recent < lower and nrecent == 1 and path != ((0, 0),):
                continue
            if nrecent > upper:
                continue
            key = (n, np)
            ns = score + int(lines[n[0]][n[1]])
            if nrecent in seen[key] and seen[key][nrecent] <= ns:
                continue
            seen[key][nrecent] = ns
            paths.append((ns, (np,) + path, n, nrecent))
        if b is not None:
            paths.sort(reverse=True)
    print(len(paths), best)
    raise

def getAnswer(isPart1: bool):
    return getHeat(1, 3) if isPart1 else getHeat(4, 10)

# print(getAnswer(True))
print(getAnswer(False))
