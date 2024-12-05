import collections

import aoc_utils

with open(f'{__file__.replace(".py", ".txt")}') as fh:
    txt = fh.read()
lines = [list(line) for line in txt.split("\n")]


def getAnswer(isPart1: bool):
    print("getAnswer", isPart1)
    pairs = [[int(i) for i in l.split("|")]
             for l in txt.split("\n\n")[0].split("\n")]
    rows = [[int(i) for i in l.split(",")]
            for l in txt.split("\n\n")[1].split("\n")]
    if isPart1:
        rval = sum([i[(len(i)-1)//2] for i in rows if isCorrect(i, pairs)])
    else:
        rval = sum([fixed(i, pairs)[(len(i)-1)//2]
                   for i in rows if not isCorrect(i, pairs)])

    return rval


def fixed(row, pairs):
    if len(row) == 0:
        return []
    for i in range(len(row)):
        r = row[i]
        canBeLast = True
        for needed, rr in pairs:
            if r == needed and rr in row:
                canBeLast = False
                break
        if canBeLast:
            return fixed([row[j] for j in range(len(row)) if j != i], pairs) + [r]
    print(row, pairs)


def isCorrect(row, pairs):
    seen = set()
    missing = set()
    for r in row:
        if r in missing:
            return False
        for needed, rr in pairs:
            if r == rr:
                if needed not in seen:
                    missing.add(needed)
        seen.add(r)
    return True


# print(getAnswer(True))
print(getAnswer(False))
