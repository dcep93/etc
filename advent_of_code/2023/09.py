with open('09.txt') as fh:
    txt = fh.read()
lines = txt.split("\n")

def part1():
    def getNext(sequence):
        if all(i == 0 for i in sequence):
            return 0
        return sequence[-1] + getNext([sequence[i+1] - sequence[i] for i in range(len(sequence)-1)])
    print(sum([getNext([int(i) for i in line.split(" ")]) for line in lines]))

def part2():
    def getPrevious(sequence):
        if all(i == 0 for i in sequence):
            return 0
        return sequence[0] - getPrevious([sequence[i+1] - sequence[i] for i in range(len(sequence)-1)])
    print(sum([getPrevious([int(i) for i in line.split(" ")]) for line in lines]))

# part1()
part2()
