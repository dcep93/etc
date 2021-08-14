from numpy.fft import rfft, irfft
import warnings

warnings.filterwarnings('ignore')


def find(needle, haystack):
    n = [ord(i) - ord('a') for i in needle]
    h = [ord(i) - ord('a') for i in haystack]
    multiplied = get_multiplied_fft(n[::-1], h)
    n2 = sum([i**2 for i in n])
    h2 = sum([i**2 for i in h[:len(n) - 1]])
    for i in range(len(h) - len(n) + 1):
        j = i + len(n) - 1
        h2 += h[j]**2
        if 2 * multiplied[j] == n2 + h2:
            return i
        h2 -= h[j - len(n) + 1]**2
    return -1


def get_multiplied_fft(a, b):
    L = len(a) + len(b)
    a_f = rfft(a, L)
    b_f = rfft(b, L)
    raw = irfft(a_f * b_f)
    return [int(round(i)) for i in raw][:-1]
