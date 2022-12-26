package main

import (
	"fmt"
	"math"
)

func _25() {
	lines := getLines("25.txt")

	vals := map[rune]int{'=': -2, '-': -1, '0': 0, '1': 1, '2': 2}

	snafuToDec := func(s string) int {
		x := 0
		for i, c := range s {
			x += int(math.Pow(5, float64(len(s)-i-1))) * vals[c]
		}
		return x
	}

	decToSnafu := func(x int) string {
		if x < 0 {
			panic("cant do neg")
		}
		s := ""
		for x > 0 {
			y := x % 5
			x /= 5
			var c string
			if y <= 2 {
				c = fmt.Sprintf("%d", y)
			} else if y == 3 {
				c = "="
				x += 1
			} else if y == 4 {
				c = "-"
				x += 1
			} else {
				panic("impossible")
			}
			s = c + s
		}
		return s
	}

	s := 0
	for _, line := range lines {
		v := snafuToDec(line)
		s += v
	}
	x := decToSnafu(s)
	c := snafuToDec(x)
	xx := decToSnafu(c)
	cc := snafuToDec(xx)
	fmt.Println(s, x, c, xx, cc)

	fmt.Println("done")
}
