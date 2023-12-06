with open('01.txt') as fh:
    txt = fh.read()

def digit(start, line):
    if line == '':
        return None
    k = {str(i):i for i in range(10)}
    k["one"] = 1
    k["two"] = 2
    k["three"] = 3
    k["four"] = 4
    k["five"] = 5
    k["six"] = 6
    k["seven"] = 7
    k["eight"] = 8
    k["nine"] = 9
    k["zero"] = 0
    if start:
        for i in k:
            if line.startswith(i):
                return k[i]
        return digit(start, line[1:])
    else:
        for i in k:
            if line.endswith(i):
                return k[i]
        return digit(start, line[:-1])

def cal(line):
    first = digit(True, line)
    last = digit(False, line)
    if last is None:
        print(first, last, line)
        last = first
    return int(str(first)+str(last))

# 51149
# 54489

## 54452
## 54473
print(sum([cal(i) for i in txt.split("\n")]))