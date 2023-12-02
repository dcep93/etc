with open('06.txt') as fh:
    a = fh.read()
size = 14
seen = [''] * size
x = 0
for i in a:
    x += 1
    seen = seen[1:] + [i]
    if '' not in seen and len(set(seen)) == size:
        print(seen)
        print(x)
        exit()