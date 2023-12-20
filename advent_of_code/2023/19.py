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

def getOverlapping(k, c):
    o = ()
    for a,b in k:
        r = (max(b[0], c[a][0]), min(b[1], c[a][1]))
        if r[1] < r[0]:
            return None
        o += ((a, r),)
    return o

def getNonoverlapping(choices):
    nonoverlapping = collections.defaultdict(int)
    for i, c in enumerate(choices):
        cc = tuple((a, c[a]) for a in sorted(c.keys()))
        overlaps = collections.defaultdict(int)
        for k in nonoverlapping:
            o = getOverlapping(k, c)
            if o is not None:
                overlaps[o] += nonoverlapping[k]
        if cc in overlaps:
            continue
        for o in overlaps.keys():
            if overlaps[o] != 0:
                nonoverlapping[o] -= overlaps[o]
            if nonoverlapping[o] == 0:
                del nonoverlapping[o]
        if cc in nonoverlapping:
            raise
        nonoverlapping[cc] = 1

    return nonoverlapping

def getAnswer2(ws):
    choices = getChoices('in', ws, {i: (1, 4000) for i in 'xmas'})
    nonoverlapping = getNonoverlapping(choices)
    s = 0
    for c in nonoverlapping.keys():
        ss = 1
        for a,b in [cc[1] for cc in c]:
            ss *= 1 + b - a
        s += ss * nonoverlapping[c]
        # print(ss, nonoverlapping[c], c)
    # print(nonoverlapping)
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
