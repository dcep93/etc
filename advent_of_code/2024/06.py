import collections

import aoc_utils

with open(f'{__file__.replace(".py", ".txt")}') as fh:
    txt = fh.read()
lines = [list(line) for line in txt.split("\n")]


def getAnswer(isPart1: bool):
    print("getAnswer", isPart1)
    pos = getPos()
    facing = (-1, 0)
    seen = set()
    seenFacing = set()
    obstacles = set()
    for _ in range(10000):
        seen.add(pos)
        seenFacing.add((pos, facing))
        nextPos = (pos[0]+facing[0], pos[1]+facing[1])
        if nextPos[0] < 0 or nextPos[0] == len(lines) or nextPos[1] < 0 or nextPos[1] == len(lines[nextPos[0]]):
            if isPart1:
                return len(seen)
            else:
                return len(obstacles)
        if facing == (-1, 0):
            nextFacing = (0, 1)
        elif facing == (0, 1):
            nextFacing = (1, 0)
        elif facing == (1, 0):
            nextFacing = (0, -1)
        elif facing == (0, -1):
            nextFacing = (-1, 0)
        else:
            raise 'nextFacing'
        if lines[nextPos[0]][nextPos[1]] == '#':
            facing = nextFacing
        else:
            if not isPart1:
                if nextPos not in seen:
                    if isInfinite(pos, nextFacing, seenFacing, nextPos):
                        obstacles.add(nextPos)
            pos = nextPos


def isInfinite(pos, facing, seenFacing, obstacle):
    seenFacing = set(seenFacing)
    for _ in range(10000):
        if (pos, facing) in seenFacing:
            return True
        seenFacing.add((pos, facing))
        nextPos = (pos[0]+facing[0], pos[1]+facing[1])
        if nextPos[0] < 0 or nextPos[0] == len(lines) or nextPos[1] < 0 or nextPos[1] == len(lines[nextPos[0]]):
            return False
        if facing == (-1, 0):
            nextFacing = (0, 1)
        elif facing == (0, 1):
            nextFacing = (1, 0)
        elif facing == (1, 0):
            nextFacing = (0, -1)
        elif facing == (0, -1):
            nextFacing = (-1, 0)
        else:
            raise 'nextFacing'
        if lines[nextPos[0]][nextPos[1]] == '#' or nextPos == obstacle:
            facing = nextFacing
        else:
            pos = nextPos
    raise "iter"


def getPos():
    for y in range(len(lines)):
        for x in range(len(lines[y])):
            if lines[y][x] == '^':
                return (y, x)


# print(getAnswer(True))
print(getAnswer(False))
