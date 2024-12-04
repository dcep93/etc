import collections

import aoc_utils

with open(f'{__file__.replace(".py", ".txt")}') as fh:
    txt = fh.read()
lines = [list(line) for line in txt.split("\n")]


def getAnswer(isPart1: bool):
    print("getAnswer", isPart1)
    ls = ["".join(l).split(" ") for l in lines]
    if isPart1:
        first = sorted([line[0] for line in ls])
        last = sorted([line[-1] for line in ls])
        return sum([abs(int(first[i])-int(last[i])) for i in range(len(lines))])
    else:
        return sum([int(ls[i][0])*len([None for j in ls if j[-1] == ls[i][0]]) for i in range(len(lines))])


print(getAnswer(True))
print(getAnswer(False))
