import aocutils

with open(f'{__file__.split("/")[-1].split(".py")[0]}.txt') as fh:
    txt = fh.read()
lines = txt.split("\n")

def f(x):
    v = 0
    for char in x:
        v += ord(char)
        v *= 17
        v = v % 256
    return v


def getAnswer(isPart1: bool):
    if isPart1:
        return
        v = sum([f(x) for x in lines[0].split(",")])
        print(v)
    else:
        import collections
        d = [({}, []) for _ in range(256)]
        for x in lines[0].split(","):
            if x.endswith('-'):
                label = x[:-1]
                box = d[f(label)]
                if label in box[0]:
                    del box[0][label]
                    box[1].remove(label)
            else:
                label = x[:-2]
                box = d[f(label)]
                if label not in box[0]:
                    box[1].append(label)
                box[0][label] = x[-1]
        s = sum([sum([(i+1)*(j+1)*int(x[0][xx]) for j, xx in enumerate(x[1])]) for i, x in enumerate(d)])
        print(s)
                    
                
        

for isPart1 in [True, False]:
    getAnswer(isPart1)
