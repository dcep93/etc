def memoize(f):
    memo = {}
    def g(*args):
        if args in memo:
            return memo[args]
        v = f(*args)
        memo[args] = v
        return v
    return g
