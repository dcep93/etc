minutes = 32

with open("19.txt") as fh:
    text = fh.read().replace("\n", "\n\n").replace("Each", "\nEach")
bps = [[[
    j.split(" ") for j in i.split(".")[0].split("costs ")[-1].split(" and ")
] for i in bp.split("\n")][1:] for bp in text.split("\n\n")][:3]


def buy(bank, cost, robots, waited):
    indices = {"ore": 0, "clay": 1, "obsidian": 2, "geode": 3}
    newBank = list(bank)
    for i in cost:
        index = indices[i[1]]
        newBank[index] -= int(i[0])
        if newBank[index] < 0:
            return None
        if waited:
            if newBank[index] < robots[index]:
                waited = False
    if waited:
        return None
    for i in range(len(robots)):
        newBank[i] += robots[i]
    return newBank


def getBest(minutes, oldM, bank, robots, bp, history):
    skip = 'skip'
    m, h = bank[-1] + (robots[-1] * minutes), history
    if minutes == 1:
        return (m, h)
    minutes -= 1
    if minutes * (minutes + 1) <= 2 * (oldM - m):
        return (m, h)
    m = max(m, oldM)
    # print(len(history) - 1, m, oldM, bank, robots, history)
    for i in reversed(range(len(bp))):
        newBank = buy(bank, bp[i], robots, history[-1] == skip)
        if newBank != None:
            newRobots = [
                robots[j] + 1 if j == i else robots[j]
                for j in range(len(robots))
            ]
            (mm, hh) = getBest(
                minutes,
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
        minutes,
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
    print(m, len(h), h)
    print()
    return m


s = 0
p = 1
for i, bp in enumerate(bps):
    print(i)
    num = getNum(bp)
    s += (i + 1) * num
    p *= num
print(s)
print(p)