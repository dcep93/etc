import collections

import aocutils

with open(f'{__file__.split("/")[-1].split(".py")[0]}.txt') as fh:
    txt = fh.read()
lines = txt.split("\n")

def accepted(w, m, ws):
    for r in ws[w]:
        if ":" not in r:
            b = r
            n = True
        else:
            a, b = r.split(":")
            v = m[a[0]]
            o = 1 if a[1] == '>' else -1
            c = int(a[2:])
            n = v * o > c * o
        if n:
            if b in ws:
                return accepted(b, m, ws)
            return b == 'A'


def getAnswer(isPart1: bool):
    print("getAnswer", isPart1)
    workflows = txt.split("\n\n")[0].split("\n")
    ws = {i:j[:-1].split(",") for i,j in [k.split("{") for k in workflows]}
    if not isPart1:
        return getAnswer2(ws)
    s = 0
    for part in txt.split("\n\n")[1].split("\n"):
        m = {i:int(j) for i,j in [k.split("=") for k in part[1:-1].split(",")]}
        if accepted('in', m, ws):
            s += sum(m.values())
    return s

def getGroups(choice, slots, existing):
    if not choice:
        return existing
    c = dict(choice)
    k = min(c.keys())
    v = c.pop(k)
    groups = []
    for vv in sorted(slots[k].keys()):
        if vv <= v[0]:
            continue
        groups += getGroups(c, slots, [((v[0], vv),) + e for e in existing])
        if vv == v[1]:
            break
        v = (vv+1, v[1])
    return groups

def getNonoverlapping(choices):
    slots = collections.defaultdict(lambda: {})
    for c in choices:
        for k,v in c.items():
            for vv in v:
                slots[k][vv] = True
    nonoverlapping = {}
    for i, c in enumerate(choices):
        for group in getGroups(c, slots, [()]):
            nonoverlapping[group] = True
    return nonoverlapping

def getNumPossibilities(c):
    x = 1
    for a,b in c:
        x *= 1 + b - a
    return x

def getAnswer2(ws):
    choices = getChoices('in', ws, {i: (1, 4000) for i in 'xmas'})
    nonoverlapping = getNonoverlapping(choices)
    s = 0
    for c in nonoverlapping.keys():
        ss = getNumPossibilities(c)
        s += ss
    return s

def getChoices(w, ws, m):
    choices = []
    m = dict(m)
    for r in ws[w]:
        if ":" not in r:
            r = f"x>0:{r}"
        a, b = r.split(":")
        c = int(a[2:])
        v = m[a[0]]

        if a[1] == '>':
            rA = (c+1, v[1])
            rN = (v[0], c)
        else:
            rA = (v[0], c-1)
            rN = (c, v[1])

        if rA[1] >= rA[0] and b != 'R':
            mA = dict(m)
            mA[a[0]] = rA
            if b in ws:
                choices += getChoices(b, ws, mA)
            else:
                choices += [mA]

        if rN[1] < rN[0]:
            break
        m[a[0]] = rN

    return choices

# print(getAnswer(True))
print(getAnswer(False))
