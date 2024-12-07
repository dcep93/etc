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


def concat(a, b):
    return (a*(10**math.ceil(math.log10(b+1)))) + b


def isPossible(size, components, isPart1):
    if len(components) == 0:
        return size == 0
    last, remaining = components[-1], components[:-1]
    if size >= last:
        if isPossible(size-last, remaining, isPart1):
            return True
        if size % last == 0:
            if isPossible(size//last, remaining, isPart1):
                return True
        if not isPart1:
            if str(size).endswith(str(last)):
                if isPossible(int('0'+str(size)[:-len(str(last))]), remaining, isPart1):
                    return True
    return False


print(getAnswer(True))
print(getAnswer(False))

# 1620690235709
# 145397611075341
