from numpy.fft import fft, ifft
import warnings

warnings.filterwarnings('ignore')


def find(needle, haystack):
    n = [ord(i) - ord('a') for i in needle]
    h = [ord(i) - ord('a') for i in haystack]
    multiplied = get_multiplied(n[::-1], h)
    n2 = sum([i**2 for i in n])
    h2 = sum([i**2 for i in h[:len(n) - 1]])
    for i in range(len(h) - len(n) + 1):
        j = i + len(n) - 1
        h2 += h[j]**2
        if 2 * multiplied[j] == n2 + h2:
            return i
        h2 -= h[j - len(n) + 1]**2
    return -1


def get_multiplied_basic(a, b):
    return [
        sum([
            a[j] * b[i - j]
            for j in range(max(0, i - len(b) + 1), min(i + 1, len(a)))
        ]) for i in range(len(b) + len(a) - 1)
    ]


def get_multiplied_fft(a, b):
    L = len(a) + len(b)
    a_f = fft(a, L)
    b_f = fft(b, L)
    raw = ifft(a_f * b_f)
    # print(raw)
    return [int(round(i)) for i in raw][:-1]


def get_multiplied(a, b):
    # return get_multiplied_basic(a, b)
    return get_multiplied_fft(a, b)
