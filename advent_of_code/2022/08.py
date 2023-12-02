# fswatch . | awk '!/\.tmp$/' | (while read; do python3 08.py; done)

with open("08.txt") as fh:
    text = fh.read()

trees = [[int(i) for i in j] for j in text.split("\n")]


def isVisible(tree, i, j):

    def helper(tree, i, j, position, increment):
        while True:
            if position == (i, j):
                return False
            if trees[position[0]][position[1]] >= tree:
                return True
            position = (position[0] + increment[0], position[1] + increment[1])

    for start, increment in [
        [(0, j), (1, 0)],
        [(i, 0), (0, 1)],
        [(len(trees) - 1, j), (-1, 0)],
        [(i, len(trees[0]) - 1), (0, -1)],
    ]:
        if not helper(tree, i, j, start, increment):
            return True
    return False


def score(tree, i, j):

    def helper(tree, i, j, increment):
        s = 0
        position = (i, j)
        while True:
            position = (position[0] + increment[0], position[1] + increment[1])
            if position[0] not in range(
                    len(trees)) or position[1] not in range(len(trees[0])):
                break
            s += 1
            if trees[position[0]][position[1]] >= tree:
                break
        return s

    s = 1
    for start, increment in [
        [(0, j), (1, 0)],
        [(i, 0), (0, 1)],
        [(len(trees) - 1, j), (-1, 0)],
        [(i, len(trees[0]) - 1), (0, -1)],
    ]:
        h = helper(tree, i, j, increment)
        # print(h, increment)
        s *= h
    return s


s = 0
for i, row in enumerate(trees):
    for j, tree in enumerate(row):
        s = max(s, score(tree, i, j))
print(s)