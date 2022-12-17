with open("17.txt") as fh:
    text = fh.read()

rawRocks = '''
####

.#.
###
.#.

..#
..#
###

#
#
#
#

##
##
'''
from collections import defaultdict

rocks = []
for rawRock in rawRocks.split("\n\n"):
    lines = [i for i in rawRock.split("\n") if i]
    rock = []
    for i in range(len(lines)):
        for j in range(len(lines[i])):
            if lines[-1 - i][j] == '#':
                rock.append((i, j))
    rocks.append(rock)
    print(rock)

width = 7
start = (3, 2)
highest = 0
row = [None for _ in range(width)]
grid = defaultdict(lambda: list(row))


def getDirs():
    d = {'<': (0, -1), '>': (0, 1)}
    while True:
        for i in text:
            yield d[i]


def add(position, offset):
    return tuple([position[i] + offset[i] for i in range(len(offset))])


def moveIfPossible(rock, position, dir):
    nextPosition = add(position, dir)
    for offset in rock:
        spot = add(nextPosition, offset)
        if spot[0] < 0:
            return position
        if spot[1] < 0 or spot[1] >= width:
            return position
        if grid[spot[0]][spot[1]]:
            return position
    for offset in rock:
        spot = add(position, offset)
        grid[spot[0]][spot[1]] = None
    for offset in rock:
        spot = add(nextPosition, offset)
        grid[spot[0]][spot[1]] = dir == (0, 0)
    return nextPosition


def p():
    for x in range(max(grid.keys()), -1, -1):
        print(
            ''.join(['#' if i else '.' if i is None else '@'
                     for i in grid[x]]), )
    print()


dirs = getDirs()
for i in range(2022):
    rock = rocks[i % len(rocks)]
    position = add(start, (highest, 0))
    for offset in rock:
        spot = add(position, offset)
        grid[spot[0]][spot[1]] = False
    # p()
    while True:
        if sum([abs(i) for i in position]) > 10000:
            print("fail")
            exit()
        dir = dirs.__next__()
        position = moveIfPossible(rock, position, dir)
        nextPosition = moveIfPossible(rock, position, (-1, 0))
        if position == nextPosition:
            moveIfPossible(rock, position, (0, 0))
            highest = max(highest,
                          *[1 + offset[0] + position[0] for offset in rock])
            # p()
            break
        position = nextPosition

p()
print(highest)
