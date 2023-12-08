with open('08.txt') as fh:
    txt = fh.read()
lines = txt.split("\n")

d = {}
for line in lines[2:]:
    d[line.split(" ")[0]] = [line.split("(")[1].split(",")[0], line.split(", ")[1].split(")")[0]]

def getSteps(start, isEndF):
    c = 0
    location = start
    while True:
        for i in lines[0]:
            c += 1
            location = d[location][0 if i == "L" else 1]
            if isEndF(location):
                return c

def part1():
    print(getSteps("AAA", lambda location: location == "ZZZ"))

def part2():
    import math
    c = 1
    for s in [getSteps(l, lambda location: location.endswith("Z")) for l in d if l.endswith("A")]:
        c = c * s // math.gcd(c, s)
    print(c)

part1()
part2()
