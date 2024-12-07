import math
import collections

import aoc_utils

with open(f'{__file__.replace(".py", ".txt")}') as fh:
    txt = fh.read()
lines = [list(line) for line in txt.split("\n")]


def getAnswer(isPart1: bool):
    print("getAnswer", isPart1)
    rval = 0
    for line in txt.split("\n"):
        size = int(line.split(":")[0])
        components = [int(e) for e in line.split(": ")[1].split(" ")]
        ip = isPossible(size, components, isPart1)
        if ip:
            rval += size
    return rval


def isPossible(size, components, isPart1, previous=None):
    if len(components) == 0:
        return size == previous
    first, remaining = components[0], components[1:]
    if size >= first:
        if previous is None:
            return isPossible(size, remaining, isPart1, first)
        if size >= previous:
            if previous+first <= size:
                if isPossible(size, remaining, isPart1, previous+first):
                    return True
            if previous*first <= size:
                if isPossible(size, remaining, isPart1, previous*first):
                    return True
                if not isPart1 and isPossible(size, remaining, isPart1, first+(previous*(10**math.ceil(math.log10(first+1))))):
                    return True
    return False


print(getAnswer(True))
print(getAnswer(False))

# 1620690235709
# 145397611075341
