with open("sowpods.txt") as fh:
    sowpods = set(fh.read().split('\n'))

green = 'LRWSBE'
orange = 'OAPINB'
blue = 'IDNWUT'
red = 'SDFNYC'
purple = 'ETRCHO'


def solve(letters, colors):
    words = list(make_words(letters[::-1], colors[::-1], ''))
    print(words)


def make_words(letters, colors, prefix):
    if len(letters) == 0:
        if prefix in sowpods:
            yield prefix
        return
    next_letters = letters[1:]
    next_colors = colors[1:]
    for letter in colors[0]:
        if letter == letters[0]:
            continue
        for word in make_words(next_letters, next_colors, prefix + letter):
            yield word


solve('OIW', [orange, blue, green])
solve('TRFWIP', [purple, purple, red, blue, blue, orange])
solve('SLDDANE', [red, green, blue, red, orange, blue, purple])
solve('OBNHF', [orange, green, orange, purple, red])