with open('07.txt') as fh:
    txt = fh.read()
lines = txt.split("\n")

from collections import defaultdict
def getScore(h, isPart2):
    d = {str(i):i for i in range(2,10)}
    d['T'] = 10
    d['J'] = 1 if isPart2 else 11
    d['Q'] = 12
    d['K'] = 13
    d['A'] = 14
    cards = [d[i] for i in h[0]]
    dcards = defaultdict(int)
    for i in cards:
        dcards[i] += 1
    if isPart2:
        joker = d['J']
        jokers = dcards.pop(joker) if joker in dcards else 0
        most = 0
        for i in dcards:
            if dcards[i] > most:
                most = dcards[i]
                joker = i
        dcards[joker] += jokers
    counts = tuple(sorted(dcards.values()))
    ranks = {
        r:i for i,r in enumerate([(1,1,1,1,1), (1,1,1,2), (1,2,2), (1,1,3), (2,3), (1,4), (5,)])
    }
    power = ranks[counts]
    score = 15**power + sum([(15**(-i))*c for i,c in enumerate(cards)])
    return score

def getTotal(isPart2):
    return sum([(i+1) * int(h[1]) for i,h in enumerate(sorted([i.split(" ") for i in lines], key=lambda h: getScore(h, isPart2)))])

def part1():
    print(getTotal(False))
    
def part2():
    print(getTotal(True))

part1()
part2()
