with open("19.txt") as fh:
    text = fh.read()
bps = [[[
    j.split(" ") for j in i.split(".")[0].split("costs ")[-1].split(" and ")
] for i in bp.split("\n")][1:] for bp in text.split("\n\n")][:1]


def buy(bank, cost, robots, waited):
    indices = {"ore": 0, "clay": 1, "obsidian": 2, "geode": 3}
    newBank = list(bank)
    for i in cost:
        index = indices[i[1]]
        newBank[index] -= int(i[0])
        if newBank[index] < 0:
            return None
    if waited:
        for i in range(len(robots)):
            if newBank[i] < robots[i]:
                return newBank
        return None
    for i in range(len(robots)):
        newBank[i] += robots[i]
    return newBank


def getBest(minutes, m, bank, robots, bp, history):
    skip = 'skip'
    m, h = bank[-1], history
    expected = [None, skip, skip, 1, skip, 1, skip, 1]
    for i in range(min(len(expected), len(history)) - 1):
        if expected[i] != history[i]:
            return (m, h)
    print(minutes, m, history)
    if minutes == 0:
        return (m, h)
    if minutes * (robots[-1] + (int(minutes / 2))) <= m:
        return (m, history)
    for i in reversed(range(len(bp))):
        newBank = buy(bank, bp[i], robots, history[-1] == skip)
        if newBank != None:
            newRobots = [
                robots[j] + 1 if j == i else robots[j]
                for j in range(len(robots))
            ]
            (mm, hh) = getBest(
                minutes - 1,
                m,
                newBank,
                newRobots,
                bp,
                history + [i],
            )
            if mm > m:
                # print(minutes, robots, bank, newBank, bp[1])
                m, h = mm, hh
    (mm, hh) = getBest(
        minutes - 1,
        m,
        buy(bank, [], robots, False),
        robots,
        bp,
        history + [skip],
    )
    if mm > m:
        # print(minutes, robots, bank, newBank, bp[1])
        m, h = mm, hh
    return (m, h)


minutes = 25


def getNum(bp):
    for i in bp[-1]:
        if i[1] == 'geode':
            print("geodes cant spawn geodes")
            exit(1)
    (m, h) = getBest(
        minutes,
        0,
        [0 for _ in bp],
        [1 if i == 0 else 0 for i in range(len(bp))],
        bp,
        [None],
    )
    print(m, h)
    return m


s = 0
for i, bp in enumerate(bps):
    num = getNum(bp)
    print(i, num)
    s += (i + 1) * num
print(s)