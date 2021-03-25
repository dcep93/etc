def count(n):
    target = 2 * n
    rval = 0
    nums = list(range(1, n+1))
    for i, n1 in enumerate(nums):
        if n1 > target: break
        for j, n2 in enumerate(nums[:i]):
            a = target - (n1 + n2) # 80
            if a < 0: break
            b = abs(n2 - a) # 20
            c = n2 - b - 1 # 80
            if c < 0: continue
            d = int(c / 2)
            rval += d
    return rval

for i in range(15):
    print(i, count(2**i))

print('done')
