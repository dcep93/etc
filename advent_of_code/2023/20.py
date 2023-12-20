import collections

import aocutils

with open(f'{__file__.split("/")[-1].split(".py")[0]}.txt') as fh:
    txt = fh.read()
lines = txt.split("\n")

class RXException(Exception):
    pass

def send(toSend, config, resp):
    for ii in range(1000000):
        if not toSend:
            return
        # print(toSend)
        (origin, isHigh, module), toSend = toSend[0], toSend[1:]
        if module == "rx" and not isHigh:
            raise RXException()
        if isHigh:
            if len(resp[module][isHigh]) < 25:
                resp[module][isHigh][origin].append(glob.ii)
        if module not in config:
            continue
        v = config[module]
        if v[0] == "%":
            if isHigh:
                continue
            isHigh = v[2][None]
        elif v[0] == "&":
            isHigh = not all(ih for ih in v[2].values())
        for dd in v[1]:
            if dd in config:
                vv = config[dd]
                if vv[0] == "%":
                    if not isHigh:
                        vv[2][None] = not vv[2][None]
                elif vv[0] == "&":
                    vv[2][module] = isHigh
            toSend += ((module, isHigh, dd),)
    raise

def getAnswer(isPart1: bool):
    print("getAnswer", isPart1)
    config = {}
    for line in lines:
        s,d = line.split(" -> ")
        dd = d.split(", ")
        if s.startswith("%"):
            config[s[1:]] = ("%", dd, {None: False})
        elif s.startswith("&"):
            config[s[1:]] = ("&", dd, {})
        else:
            config[s] = ("", dd)
    for k, v in config.items():
        if v[0] == "&":
            for kk, vv in config.items():
                if k in vv[1]:
                    v[2][kk] = False

    resp = collections.defaultdict(lambda: collections.defaultdict(lambda: collections.defaultdict(list)))
    if isPart1:
        for _ in range(1000):
            send([("button", False, "broadcaster")], config, resp)
        resps = [sum([v[b] for v in resp.values()]) for b in [False, True]]
        return resp[False] * resp[True]
    else:
        try:
            for ii in range(1, 100000000000):
                if ii % 10000 == 0:
                    print("processing", ii)
                    for k, v in resp.items():
                        if k != "zh":
                            continue
                        print(k, dict(v[True]))
                        print(3823*3847*3877*4001)
                        input()
                glob.ii = ii
                send([("button", False, "broadcaster")], config, resp)
        except RXException:
            return ii
        raise

class glob:
    pass

# print(getAnswer(True))
print(getAnswer(False))
