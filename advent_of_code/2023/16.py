import aocutils

with open(f'{__file__.split("/")[-1].split(".py")[0]}.txt') as fh:
    txt = fh.read()
lines = txt.split("\n")

def getEnergized(start):
    positions = [start]
    seen = {}
    energized = {}
    for ii in range(100000):  
        if not positions:
            return energized
        next_positions = []
        for p, d in positions:
            n = (p[0]+d[0],p[1]+d[1])
            if n[0] >= 0 and n[0] < len(lines):
                if n[1] >= 0 and n[1] < len(lines[n[0]]):
                    x = (n, d)
                    if x in seen:
                        continue
                    seen[x] = True
                    energized[n] = True
                    char = lines[n[0]][n[1]]
                    if char == '.':
                        next_positions.append((n, d))
                    elif char == '-':
                        if d[0] == 0:
                            next_positions.append((n, d))
                        else:
                            next_positions.append((n, (0, -1)))
                            next_positions.append((n, (0, 1)))
                    elif char == '|':
                        if d[1] == 0:
                            next_positions.append((n, d))
                        else:
                            next_positions.append((n, (-1, 0)))
                            next_positions.append((n, (1, 0)))
                    elif char == '/':
                        if d[0] == 0:
                            next_positions.append((n, (-d[1], 0)))
                        else:
                            next_positions.append((n, (0, -d[0])))
                    elif char == '\\':
                        if d[0] == 0:
                            next_positions.append((n, (d[1], 0)))
                        else:
                            next_positions.append((n, (0, d[0])))
                    else:
                        raise
        positions = next_positions
    raise

def getAnswer(isPart1: bool):
    if isPart1:
        energized = getEnergized(((0,-1), (0, 1)))
        print(len(energized))
    else:
        m = -1
        for i in range(len(lines)):
            e = getEnergized(((i, -1), (0, 1)))
            m = max(m, len(e))
        for i in range(len(lines)):
            e = getEnergized(((i, len(lines[i])), (0, -1)))
            m = max(m, len(e))
        for j in range(len(lines[0])):
            e = getEnergized(((-1, j), (1, 0)))
            m = max(m, len(e))
        for j in range(len(lines[0])):
            e = getEnergized(((len(lines), j), (-1, 0)))
            m = max(m, len(e))
        print(m)

for isPart1 in [True, False]:
    getAnswer(isPart1)
