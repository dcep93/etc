# ➜  etc git:(master) python3 hunt/divide.py 420 69
# 420 / 69 = 6

import sys

BASE = 2

def divide(a: int, b: int) -> int:
    if b == 0: return 0
    quotient = divide_helper(a, b, b, 1)
    return quotient
    
def divide_helper(a: int, b: int, big_b: int, previous_product: int) -> int:
    if a < b:
        return 0
    remainder = a - big_b
    if remainder > big_b:
        return divide_helper(a, b, big_b * BASE, previous_product * BASE)
    next_quotient = divide_helper(remainder, b, b, 1)
    return previous_product + next_quotient

def main():
    a, b = sys.argv[1:]
    a = int(a)
    b = int(b)
    c = divide(a, b)
    print(f'{a} / {b} = {c}')

if __name__ == "__main__":
    main()