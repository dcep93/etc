import aocutils

with open(f'{__file__.split("/")[-1].split(".py")[0]}.txt') as fh:
    txt = fh.read()
lines = txt.split("\n")

@aocutils.memoize
def getCombinations(chars, nums):
    if len(chars) == 0:
        return 1 if len(nums) == 0 else 0
    if chars.startswith('?'):
        s = getCombinations(chars[1:].strip("."), nums)
        if len(nums) > 0:
            s += getCombinations('#'+chars[1:], nums)
        return s
    elif chars.startswith('#'):
        if len(nums) == 0 or len(chars) < nums[0]:
            return 0
        for i in range(nums[0]):
            if chars[i] == '.':
                return 0
        if len(chars) > nums[0] and chars[nums[0]] == '#':
            return 0
        return getCombinations(chars[nums[0]+1:].strip("."), nums[1:])
    else:
        raise

def getAnswer(isPart1):
    factor = 1 if isPart1 else 5    
    s = 0
    for chars, numsStr in [line.split(" ") for line in lines]:
        chars = "?".join([chars for _ in range(factor)])
        numsStr = ",".join([numsStr for _ in range(factor)])
        # print(chars, numsStr)
        s += getCombinations(chars.strip('.'), tuple([int(i) for i in numsStr.split(",")]))
    print(s)
    # 499892352471 too low
    return s
        

for isPart1 in [True, False]:
    getAnswer(isPart1)
