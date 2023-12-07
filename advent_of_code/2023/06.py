with open('06.txt') as fh:
    txt = fh.read()
lines = txt.split("\n")

def part1():
    def ways(time, distance):
        w = 0
        for i in range(time):
            d = (time - i)*i
            if d > distance:
                w += 1
        return w
    times = [int(i) for i in lines[0].split(":")[1].split(" ") if i]
    distances = [int(i) for i in lines[1].split(":")[1].split(" ") if i]
    p = 1
    for i in range(len(times)):
        p *= ways(times[i], distances[i])
    print(p)

def part2():
    time = int(lines[0].split(":")[1].replace(" ", ""))
    distance = int(lines[1].split(":")[1].replace(" ", ""))
    s = (time*time - (4 * distance)) ** 0.5
    i0 = (time - s)/2
    i1 = (time + s)/2
    print(int(i1-i0))

# part1()
part2()
