import collections

import aoc_utils

with open(f'{__file__.replace(".py", ".txt")}') as fh:
    txt = fh.read()
lines = [list(line) for line in txt.split("\n")]


def getAnswer(isPart1: bool):
    print("getAnswer", isPart1)
    import re
    if isPart1:
        return sum([int(match[0]) * int(match[1]) for match in re.findall("mul\((\d{1,3}),(\d{1,3})\)", txt)])
    else:
        rval = 0
        for i, subtxt in enumerate(('do()'+txt).split("don't()")):
            for j, subsubtxt in enumerate(subtxt.split("do()")):
                if j > 0:
                    rval += sum([int(match[0]) * int(match[1])
                                for match in re.findall("mul\((\d{1,3}),(\d{1,3})\)", subsubtxt)])
        return rval


# print(getAnswer(True))
print(getAnswer(False))
