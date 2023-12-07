with open('07.txt') as fh:
    txt = fh.read()
lines = txt.split("\n")

d = {str(i):i for i in range(2,10)}
d['T'] = 10
d['J'] = 11
d['Q'] = 12
d['K'] = 13
d['A'] = 14
def part1():
    from collections import defaultdict
    def v(cards):
        return sum([(15**(len(cards)-1-i))*c for i,c in enumerate(cards)])
    def s(h):
        cards = [d[i] for i in h[0]]
        dcards = defaultdict(int)
        for i in cards:
            dcards[i] += 1
        counts = tuple(sorted(dcards.values()))
        power = 7 + len(cards)
        if counts == (5,):
            return 15**power + v(cards)
        power -= 1
        if counts == (1,4):
            return 15**power + v(cards)
        power -= 1
        if counts == (2,3):
            return 15**power + v(cards)
        power -= 1
        if counts == (1,1,3):
            return 15**power + v(cards)
        power -= 1
        if counts == (1,2,2):
            return 15**power + v(cards)
        power -= 1
        if counts == (1,1,1,2):
            return 15**power + v(cards)
        power -= 1
        return 15**power + v(cards)
        
    hands = sorted([i.split(" ") for i in lines], key=s)
    print(sum([(i+1) * int(h[1]) for i,h in enumerate(hands)]))
    

def part2():
    d['J'] = 1
    from collections import defaultdict
    def v(cards):
        return sum([(15**(len(cards)-1-i))*c for i,c in enumerate(cards)])
    def s(h, p=False):
        cards = [d[i] for i in h[0]]
        dcards = defaultdict(int)
        for i in cards:
            dcards[i] += 1
        #
        x = d['J']
        j = dcards[x]
        del dcards[x]
        xx = 0
        for i in dcards:
            if dcards[i] > xx:
                xx = dcards[i]
                x = i
        dcards[x] += j
        if p:
            print(dcards, j, x, xx)
        #
        counts = tuple(sorted(dcards.values()))
        power = 7 + len(cards)
        if counts == (5,):
            return 15**power + v(cards)
        power -= 1
        if counts == (1,4):
            return 15**power + v(cards)
        power -= 1
        if counts == (2,3):
            return 15**power + v(cards)
        power -= 1
        if counts == (1,1,3):
            return 15**power + v(cards)
        power -= 1
        if counts == (1,2,2):
            return 15**power + v(cards)
        power -= 1
        if counts == (1,1,1,2):
            return 15**power + v(cards)
        power -= 1
        return 15**power + v(cards)
        
    hands = sorted([i.split(" ") for i in lines], key=s)
    print(sum([(i+1) * int(h[1]) for i,h in enumerate(hands)]))

part1()
part2()
