from collections import defaultdict
import typing


def main():
    with open('./10000_common_words.txt') as fh:
        a = fh.read()
    b = a.split('\n')
    c = [i.lower() for i in b]
    d = set(c)
    c = sorted(d)
    e = defaultdict(list)
    for i in c:
        if not i.isalpha():
            continue
        if len(i) < 3:
            continue
        for j in range(1, len(i) - 1):
            k = i[:j] + i[j + 1:]
            if k in d:
                if i not in e[k]:
                    e[k].append(i)
    f: typing.List[typing.Tuple[str, typing.List[typing.Any, ], ], ] = list(
        e.items(), )
    g = sorted(f, key=lambda i: -len(i[0]))
    for i, [j, k] in enumerate(g):
        print(f'{i+1}/{len(e)}')
        input(f'word: {j} -> {len(k)}\n')
        print(k)
        print()
        print()
        print()


if __name__ == "__main__":
    main()
