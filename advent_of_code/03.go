package main

import (
	"fmt"
)

func _03() {
	lines := getLines("03.txt")

	getPriority := func(item byte) int {
		i := int(item)
		if i > int('a') {
			return i - int('a') + 1
		} else {
			return i - int('A') + 27
		}
	}

	part1 := func() {
		s := 0
		for _, line := range lines {
			halfSize := len(line) / 2
			firstHalf := make(map[byte]bool)
			for c := 0; c < len(line); c++ {
				item := line[c]
				if c < halfSize {
					firstHalf[item] = true
				} else if firstHalf[item] {
					s += getPriority(item)
					break
				}
			}

		}
		fmt.Println(s)
	}

	part2 := func() {
		s := 0
		var seen map[rune]bool
		for i, line := range lines {
			if i%3 == 0 {
				seen = make(map[rune]bool)
			}
			for _, item := range line {
				if i%3 == 0 {
					seen[item] = false
				} else if i%3 == 1 {
					if _, ok := seen[item]; ok {
						seen[item] = true
					}
				} else {
					if seen[item] {
						s += getPriority(byte(item))
						break
					}
				}
			}
		}
		fmt.Println(s)
	}

	part1()
	part2()

}
