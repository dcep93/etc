from numpy.fft import rfft, irfft
import warnings

warnings.filterwarnings('ignore')


def find(needle, haystack):
    n = [ord(i) - ord('a') for i in needle]
    h = [ord(i) - ord('a') for i in haystack]
    n2 = sum([i**2 for i in n])
    h2i = get_h2i(h, len(n))
    multiplied = get_multiplied_fft(n[::-1], h)
    for i in range(len(h) - len(n) + 1):
        if 2 * multiplied[i] == n2 + h2i[i]:
            return i
    return -1


def get_h2i(h, l):
    h2 = sum([i**2 for i in h[:l - 1]])
    h2i = []
    for i in range(len(h) - l + 1):
        h2 += h[i + l - 1]**2
        h2i.append(h2)
        h2 -= h[i]**2
    return h2i


def get_multiplied_fft(a, b):
    L = len(a) + len(b)
    a_f = rfft(a, L)
    b_f = rfft(b, L)
    raw = irfft(a_f * b_f)
    return [int(round(i)) for i in raw][:-1][len(a) - 1:]
