import collections

import aoc_utils

with open(f'{__file__.replace(".py", ".txt")}') as fh:
    txt = fh.read()
lines = [list(line) for line in txt.split("\n")]


def getAnswer(isPart1: bool):
    print("getAnswer", isPart1)
    rval = 0
    for l in lines:
        ll = [int(i) for i in "".join(l).split(" ")]
        lIsSafe = isSafe(isPart1, ll)
        if lIsSafe:
            rval += 1
    return rval


def isSafe(isPart1, l):
    if l[1] < l[0]:
        l = [-i for i in l]
    prev = l[0]
    for index, i in enumerate(l):
        if index == 0:
            continue
        if i-1 < prev or i-3 > prev:
            if not isPart1:
                if len(l) == 2:
                    return True
                for toSkip in [-2, -1, 0]:
                    sub = [
                        l[index+j] for j in range(max(-4, -index), min(4, len(l)-index)) if j != toSkip]
                    if isSafe(True, sub):
                        if index >= len(l)-2:
                            return True
                        return isSafe(True, l[index+1:])
            return False
        prev = i
    return True


# print(getAnswer(True))
print(getAnswer(False))
