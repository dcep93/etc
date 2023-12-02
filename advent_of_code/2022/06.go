package main

import (
	"fmt"
)

func _06() {
	lines := getLines("06.txt")

	run := func(size int) {
		counts := make(map[rune]int)
		multiples := make(map[rune]bool)
		for i, c := range lines[0] {
			count, ok := counts[c]
			if ok {
				counts[c]++
				if count > 0 {
					multiples[c] = true
				}
			} else {
				counts[c] = 1
			}
			old_index := i - size
			if old_index >= 0 {
				old := rune(lines[0][old_index])
				counts[old]--
				old_count := counts[old]
				if old_count <= 1 {
					delete(multiples, old)
				}
			}
			if old_index >= -1 {
				if len(multiples) == 0 {
					fmt.Println(size, i+1)
					return
				}
			}
		}
	}

	run(4)
	run(14)
}
