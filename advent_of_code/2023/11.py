with open(f'{__file__.split("/")[-1].split(".py")[0]}.txt') as fh:
    txt = fh.read()
lines = txt.split("\n")

def getAnswer(isPart2):
    size = (1000000-1) if isPart2 else 1
    space_i = []
    space = 0
    for i in range(len(lines)):
        if all(char == '.' for char in lines[i]):
            space += size
        space_i.append(space)
    space_j = []
    space = 0
    for j in range(len(lines[0])):
        if all(char == '.' for char in [line[j] for line in lines]):
            space += size
        space_j.append(space)
    galaxies = []
    for i, line in enumerate(lines):
        for j, char in enumerate(line):
            if char == '#':
                galaxies.append((i+space_i[i], j+space_j[j]))
    d = 0
    for i, start in enumerate(galaxies):
        for end in galaxies[:i]:
            d += sum([abs(end[i] - start[i]) for i in range(len(start))])
    print(d)

for isPart2 in [False, True]:
    getAnswer(isPart2)
