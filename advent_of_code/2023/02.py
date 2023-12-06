with open('02.txt') as fh:
    txt = fh.read()

def p(part, bag):
    cubes = part.split(", ")
    for c in cubes:
        number, color = c.split(" ")
        bag[color] = max(int(number), bag[color])

def power(t):
    parts = t.split(": ")[1].split("; ")
    bag = {"red": 0, "green": 0, "blue": 0}
    for part in parts:
        p(part, bag)
    s = 1
    for i,j in bag.items():
        s *= j
    return s

def part1():
    s = 0
    for i,t in enumerate(txt.split("\n")):
        s += power(t)
    print(s)


part1()