import aocutils

with open(f'{__file__.split("/")[-1].split(".py")[0]}.txt') as fh:
    txt = fh.read()
lines = txt.split("\n")

def swap(rows):
    return [''.join([row[i] for row in rows]) for i in range(len(rows[0]))]

def tilt(rows, isVertical, isForward):
    if isVertical:
        rows = swap(rows)
    rows = ['#'.join([''.join(sorted(j, reverse=isForward)) for j in i.split("#")]) for i in rows]
    if isVertical:
        rows = swap(rows)
    return rows

def getAnswer(isPart1: bool):
    rows = lines
    if isPart1:
        rows = tilt(rows, True, True)
    else:
        import hashlib
        d = {}
        i = 1000000000
        while i > 0:
            md5 = hashlib.md5("\n".join(rows).encode()).hexdigest()
            if md5 in d:
                i = i % (d[md5] - i)
            d[md5] = i
            i -= 1
            rows = tilt(rows, True, True)
            rows = tilt(rows, False, True)
            rows = tilt(rows, True, False)
            rows = tilt(rows, False, False)
    load = sum([(len(rows) -i) * len([j for j in row if j == 'O']) for i, row in enumerate(rows)])
    print(load)
    return load

for isPart1 in [True, False]:
    getAnswer(isPart1)
