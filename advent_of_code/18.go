package main

import (
	"fmt"
	"strconv"
	"strings"
)

func _18() {
	lines := getLines("18.txt")

	cubes := make(map[string][]int)

	for _, line := range lines {
		var cube []int
		parts := strings.Split(line, ",")
		for _, part := range parts {
			point, err := strconv.Atoi(part)
			if err != nil {
				panic(err)
			}
			cube = append(cube, point)
		}
		cubes[fmt.Sprintf("%v", cube)] = cube
	}

	part1 := func() {
		return
		s := 0
		for _, cube := range cubes {
			for i := -1; i <= 1; i += 2 {
				for j := range cube {
					c := append([]int{}, cube...)
					c[j] += i
					if _, ok := cubes[fmt.Sprintf("%v", c)]; !ok {
						s += 1
					}
				}
			}
		}
		fmt.Println(s)
	}

	part2 := func() {
		var mins []int
		var maxes []int
		for _, cube := range cubes {
			maxes = append(maxes, cube...)
			mins = append(mins, cube...)
			break
		}
		for _, cube := range cubes {
			for i, v := range cube {
				if maxes[i] <= v {
					maxes[i] = v + 1
				}
				if mins[i] >= v {
					mins[i] = v - 1
				}
			}
		}
		outsides := make(map[string]bool)
		search := [][]int{mins}
		for gen := 0; len(search) > 0; gen++ {
			// fmt.Println(len(search))
			var nextSearch [][]int
			for _, cube := range search {
				key := fmt.Sprintf("%v", cube)
				if outsides[key] {
					continue
				}
				outsides[key] = true
				for i := -1; i <= 1; i += 2 {
					for j := range cube {
						c := append([]int{}, cube...)
						c[j] += i
						if c[j] < mins[j] || c[j] > maxes[j] {
							continue
						}
						if _, ok := cubes[fmt.Sprintf("%v", c)]; !ok {
							nextSearch = append(nextSearch, c)
						}
					}
				}
			}
			search = nextSearch
		}
		s := 0
		for _, cube := range cubes {
			// fmt.Println(cube)
			for i := -1; i <= 1; i += 2 {
				for j := range cube {
					c := append([]int{}, cube...)
					c[j] += i
					if _, ok := outsides[fmt.Sprintf("%v", c)]; ok {
						s += 1
					}
				}
			}
		}
		fmt.Println(s)
	}

	part1()
	part2() // 2551-4692

	fmt.Println("done")
}
