package main

import (
	"fmt"
	"os"
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
				if maxes[i] < v {
					maxes[i] = v
				}
				if mins[i] > v {
					mins[i] = v
				}
			}
		}
		outsides := make(map[string]int)
		var isOutside func(cube []int, depth int) int
		isOutside = func(cube []int, depth int) int {
			if depth > 100 {
				fmt.Println("failed", cube, depth)
				os.Exit(0)
			}
			for i, v := range cube {
				if v > maxes[i] || v < mins[i] {
					return 1
				}
			}
			key := fmt.Sprintf("%v", cube)
			outside, ok := outsides[key]
			if ok {
				return outside
			}
			outsides[key] = 2
			unsure := false
			for i := -1; i <= 1; i += 2 {
				for j := range cube {
					c := append([]int{}, cube...)
					c[j] += i
					if _, ok := cubes[fmt.Sprintf("%v", c)]; !ok {
						outside := isOutside(c, depth+1)
						if outside == 1 {
							outsides[key] = 1
							return 1
						}
						if outside == 0 {
							outsides[key] = 0
							return 0
						}
						if outside == 2 {
							unsure = true
						}
					}
				}
			}
			if unsure {
				delete(outsides, key)
				return 2
			}
			outsides[key] = 0
			return 0
		}
		s := 0
		// for _, cube := range cubes {
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

			// fmt.Println(cube)
			for i := -1; i <= 1; i += 2 {
				for j := range cube {
					c := append([]int{}, cube...)
					c[j] += i
					if _, ok := cubes[fmt.Sprintf("%v", c)]; !ok {
						if isOutside(c, 0) == 1 {
							s += 1
						}
					}
				}
			}
		}
		// fmt.Println(s)
	}

	part1()
	part2() // 2551-4692

	fmt.Println("done")
}
