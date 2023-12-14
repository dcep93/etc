with open(f'{__file__.split("/")[-1].split(".py")[0]}.txt') as fh:
    txt = fh.read()
lines = txt.split("\n")

def getStart():
    for i, line in enumerate(lines):
        for j, char in enumerate(line):
            if char == 'S':
                return (i, j)

def getStep(position, is_increment, within_row):
    char = lines[position[0]][position[1]]
    step = None
    if char == '|':
        if not within_row:
            step = (1, 0) if is_increment else (-1, 0)
    elif char == '-':
        if within_row:
            step = (0, 1) if is_increment else (0, -1)
    elif char == 'F':
        if not is_increment:
            step = (1, 0) if within_row else (0, 1)
    elif char == 'J':
        if is_increment:
            step = (-1, 0) if within_row else (0, -1)
    elif char == 'L':
        if is_increment:
            if not within_row:
                step = (0, 1)
        else:
            if within_row:
                step = (-1, 0)
    elif char == '7':
        if is_increment:
            if within_row:
                step = (1, 0)
        else:
            if not within_row:
                step = (0, -1)
    return step

def getAdjacents(origin):
    adjacents = []
    for increment in [-1, 1]:
        for within_row in [False, True]:
            if within_row:
                step = (0, increment)
            else:
                step = (increment, 0)
            position = (origin[0]+step[0], origin[1]+step[1])
            if position[0] >= 0 and position[0] < len(lines) and position[1] >= 0 and position[1] < len(lines[position[0]]):
                adjacents.append((position, [], sum(step) > 0, step[0] == 0))
    return adjacents

def getAnswer(isPart1, isRecursive=False):
    if not isPart1:
        pipes = getAnswer(True, True)
        def getSChar(i, j):
            if (i-1, j) in pipes:
                if (i+1, j) in pipes:
                    return '|'
                return 'J' if (i, j-1) in pipes else 'L'
            else:
                if (i+1, j) not in pipes:
                    return '-'
                return '7' if (i, j-1) in pipes else 'F'

        seen = 0
        for i, line in enumerate(lines):
            top, bottom = [False, False]
            for j, char in enumerate(line):
                if (i, j) in pipes:
                    if char == 'S':
                        char = getSChar(i, j)

                    if char in ['L', 'J']:
                        top = not top
                        continue
                    if char in ['F', '7']:
                        bottom = not bottom
                        continue
                    if char == '|':
                        top = not top
                        bottom = not bottom
                        continue
                elif top and bottom:
                    seen += 1
        print(seen)
    if not isRecursive:
        return
    start = getStart()
    seen = {start: []}
    positions = getAdjacents(start)
    for _ in range(1000000):
        if len(positions) == 0:
            break
        next_positions = []
        for position, path, is_increment, within_row in positions:
            step = getStep(position, is_increment, within_row)
            if step is not None:
                next_position = (position[0] + step[0], position[1] + step[1])
                if next_position in seen:
                    print(len(path)+1, position)
                    pipes = {p: True for p in ([start] + path + [position, next_position] + seen[next_position])}
                    return pipes
                seen[position] = list(reversed(path))
                next_positions.append((next_position, path + [position], sum(step) > 0, step[0] == 0))
        positions = next_positions
    print("no exit")
    print(positions)

for isPart1 in [True, False]:
    getAnswer(isPart1)
