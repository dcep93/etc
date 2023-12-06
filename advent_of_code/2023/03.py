from collections import defaultdict

with open('03.txt') as fh:
    txt = fh.read()

digits = '1234567890'
lines = txt.split("\n")

def part1():
    def is_symbol(i, j, len_chars):
        for ii in [-1, 0, 1]:
            xi = i+ii
            if xi < 0 or xi >= len(lines):
                continue
            line = lines[xi]
            for ij in range(len_chars+2):
                xj = j - ij
                if xj < 0 or xj >= len(line):
                    continue
                char = line[xj]
                if char not in digits and char != '.':
                    return True
        return False

    s = 0
    for i, line in enumerate(lines):
        chars = ''
        for j, char in enumerate(line+'.'):
            if char in digits:
                chars += char
            elif chars != '':
                if is_symbol(i, j, len(chars)):
                    s += int(chars)
                chars = ''
    return s

def part2():
    def get_gear(i, j, len_chars):
        for ii in [-1, 0, 1]:
            xi = i+ii
            if xi < 0 or xi >= len(lines):
                continue
            line = lines[xi]
            for ij in range(len_chars+2):
                xj = j - ij
                if xj < 0 or xj >= len(line):
                    continue
                char = line[xj]
                if char == '*':
                    return str([xi, xj])
        return False


    gears = defaultdict(lambda: [])
    for i, line in enumerate(lines):
        chars = ''
        for j, char in enumerate(line+'.'):
            if char in digits:
                chars += char
            elif chars != '':
                gear = get_gear(i, j, len(chars))
                if gear:
                    gears[gear] += [int(chars)]
                chars = ''

    s = 0
    for parts in gears.values():
        if len(parts) == 2:
            s += parts[0] * parts[1]
    return s

print(part2())