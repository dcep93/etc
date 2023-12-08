
with open('04.txt') as fh:
    txt = fh.read()

def part1():
    def score(line):
        x = line.split(": ")[1].split(" | ")
        y = x[0].split(" ")
        count = len([i for i in x[1].split(" ") if i in y and i])
        if count == 0:
            return 0
        return 2**(count-1)

    print(sum([score(line) for line in txt.split("\n")]))

def part2():
    from collections import defaultdict
    deck = defaultdict(int)
    for i, line in enumerate(txt.split("\n")):
        deck[i] += 1
        x = line.split(": ")[1].split(" | ")
        y = x[0].split(" ")
        count = len([i for i in x[1].split(" ") if i in y and i])
        for j in range(count):
            deck[i+j+1] += deck[i]
    print(sum(deck.values()))

part2()
