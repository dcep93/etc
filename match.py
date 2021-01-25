grid = [
    [1, 3, 0, 7],
    [6, 2, 3, 5],
    [2, 4, 0, 5],
    [6, 4, 8, 9],
]
targets = [3, 3, 3, 13]

allow_reuse = False
operations = {
    '+': (lambda a,b: float(a+b), True),
    '-': (lambda a,b: float(a-b), False),
    'x': (lambda a,b: float(a*b), True),
    '÷': (lambda a,b: None if b == 0 else a/float(b), False),
}

def main():
    for (g, rotations) in possible_grid_rotations():
        solution = get_solution(g)
        if solution is not None:
            solution.display(g, rotations)
            return
    print('no solution found')

# assumes 4x4 grid
def possible_grid_rotations():
    def rotate_outer(working_grid):
        (val, working_grid[0]) = (working_grid[0][-1], [working_grid[1][0]] + working_grid[0][:-1])
        (val, working_grid[1][-1]) = (working_grid[1][-1], val)
        (val, working_grid[2][-1]) = (working_grid[2][-1], val)
        (val, working_grid[3]) = (working_grid[3][0], working_grid[3][1:] + [val])
        (val, working_grid[2][0]) = (working_grid[2][0], val)
        (val, working_grid[1][0]) = (working_grid[1][0], val)
        return working_grid

    def rotate_inner(working_grid):
        val = working_grid[2][1]
        (val, working_grid[1][1]) = (working_grid[1][1], val)
        (val, working_grid[1][2]) = (working_grid[1][2], val)
        (val, working_grid[2][2]) = (working_grid[2][2], val)
        (val, working_grid[2][1]) = (working_grid[2][1], val)
        return working_grid

    working_grid = [list(i) for i in grid]
    for outer in range(3):
        for inner in range(4):
            yield ([list(i) for i in working_grid], {'outer': outer, 'inner': inner})
            working_grid = rotate_inner(working_grid)
        working_grid = rotate_outer(working_grid)

def get_solution(g):
    queue = [Solution.default()]
    while queue:
        solution = queue.pop()
        if not solution.ops:
            return solution
        queue += get_children(solution, g)
    return None

class Solution:
    def __init__(self, ops, targets, used, answer):
        self.ops = list(ops)
        self.targets = list(targets)
        self.used = set(used)
        self.answer = dict(answer)

    @classmethod
    def default(cls):
        return cls(operations.keys(), targets, set(), {})

    def display(self, g, rotations):
        widths = 4
        display_g = [[str(i).ljust(widths) for i in j] for j in g]
        for op, (group, val) in self.answer.items():
            nums = []
            for coords in group:
                num = str(g[coords[0]][coords[1]])
                display_g[coords[0]][coords[1]] = (num + ' ' + op).ljust(widths)
                nums.append(num)
            print(' '.join([nums[0], op, nums[1], '=', str(val)]), group)
        print()
        print('\n'.join(['\t'.join(i) for i in display_g]))
        print(rotations)

def get_children(solution, g):
    child_ops = list(solution.ops)
    op = child_ops.pop()
    (f, commutative) = operations[op]
    for group in get_groups(g, commutative):
        if not allow_reuse and any([i in solution.used for i in group]): continue
        nums = [g[i[0]][i[1]] for i in group]
        result = f(*nums)
        if result in solution.targets:
            child_targets = list(solution.targets)
            index = child_targets.index(result)
            val = child_targets.pop(index)
            child_used = set(solution.used)
            child_used.update(group)
            child_answer = dict(solution.answer)
            child_answer[op] = (group, val)
            yield Solution(child_ops, child_targets, child_used, child_answer)

# assumes groups of 2
def get_groups(g, commutative):
    def helper(g):
        width = len(g[0])
        for top in range(len(g)-1):
            yield [(top, 0), (top+1, 1)]
            yield [(top, width-1), (top+1, width-2)]
            for i in range(1, width-1):
                for j in [-1, 1]:
                    yield [(top, i), (top+1, i+j)]
    for group in helper(g):
        yield group
        if not commutative:
            yield group[::-1]

if __name__ == "__main__":
    main()
