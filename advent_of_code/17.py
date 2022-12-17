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


def pRow(index):
    return ''.join(
        ['#' if i else '.' if i is None else '@' for i in grid[index]])


def p():
    for x in range(max(grid.keys()), -1, -1):
        print(pRow(x))
    print()


def getState():
    m = max(grid.keys()) if grid else 0
    return '\n'.join([pRow(i) for i in range(m, max(0, m - 100), -1)])


dirs = getDirs()
seen = {}
gens = 1000000000000
extra = 0
i = 0
while i < gens:
    rock = rocks[i % len(rocks)]
    if extra == 0 and rock == rocks[0]:
        state = getState()
        if state in seen:
            j, old_highest = seen[state]
            m = int((gens - i - 1) / (i - j))
            extra = m * (highest - old_highest)
            i += m * (i - j)
        else:
            seen[state] = (i, highest)
    position = add(start, (highest, 0))
    for offset in rock:
        spot = add(position, offset)
        grid[spot[0]][spot[1]] = False
    # p()
    while True:
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
    i += 1

# p()
print('highest', highest + extra)  # 3065
