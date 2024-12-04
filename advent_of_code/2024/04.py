import collections

import aoc_utils

with open(f'{__file__.replace(".py", ".txt")}') as fh:
    txt = fh.read()
lines = [list(line) for line in txt.split("\n")]


def getAnswer(isPart1: bool):
    print("getAnswer", isPart1)
    if isPart1:
        count = 0
        for dx in [-1, 0, 1]:
            for dy in [-1, 0, 1]:
                if dx == 0 and dy == 0:
                    continue
                count += getCount(isPart1, dx, dy)

        return count
    else:
        count = 0
        for y in range(len(lines)):
            if y >= 1 and y < len(lines)-1:
                for x in range(len(lines[y])):
                    if x >= 1 and x < len(lines[y])-1:
                        if lines[y][x] == "A":
                            if isXMas(y, x):
                                count += 1
        return count


def isXMas(y, x):
    if lines[y-1][x-1] == "M" and lines[y-1][x+1] == "M" and lines[y+1][x-1] == "S" and lines[y+1][x+1] == "S":
        return True
    if lines[y-1][x-1] == "M" and lines[y-1][x+1] == "S" and lines[y+1][x-1] == "M" and lines[y+1][x+1] == "S":
        return True
    if lines[y-1][x-1] == "S" and lines[y-1][x+1] == "S" and lines[y+1][x-1] == "M" and lines[y+1][x+1] == "M":
        return True
    if lines[y-1][x-1] == "S" and lines[y-1][x+1] == "M" and lines[y+1][x-1] == "S" and lines[y+1][x+1] == "M":
        return True
    return False


def getCount(isPart1, dx, dy):
    count = 0
    for sx in range(len(lines[0])):
        for sy in range(len(lines)):
            found = ''
            for i in range(len("XMAS")):
                if sy+(dy*i) >= 0 and sy+(dy*i) < len(lines):
                    if sx+(dx*i) >= 0 and sx+(dx*i) < len(lines[0]):
                        found += lines[sy+(dy*i)][sx+(dx*i)]
            if found == "XMAS":
                count += 1
    return count


print(getAnswer(True))
print(getAnswer(False))
