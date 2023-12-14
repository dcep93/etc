import aocutils

with open(f'{__file__.split("/")[-1].split(".py")[0]}.txt') as fh:
    txt = fh.read()
lines = txt.split("\n")

def getSplit(rows: list[str], isPart1: bool) -> int | None:
    for i in range(1, len(rows)):
        allowance = 0 if isPart1 else 1
        for j in range(min(i, len(rows)-i)):
            allowance -= sum([1 if rows[i+j][k] != rows[i-j-1][k] else 0 for k in range(len(rows[i+j]))])
            if allowance < 0:
                break
        if allowance == 0:
            return i

def getSummary(rows: list[str], isPart1: bool) -> int:
    rowSplit = getSplit(rows, isPart1)
    if rowSplit is not None:
        return rowSplit * 100
    colSplit = getSplit([''.join([row[i] for row in rows]) for i in range(len(rows[0]))], isPart1)
    return colSplit

def getAnswer(isPart1: bool):
    s = sum([getSummary(pattern.split("\n"), isPart1) for pattern in txt.split("\n\n")])
    print(s)
    return s

for isPart1 in [True, False]:
    getAnswer(isPart1)
