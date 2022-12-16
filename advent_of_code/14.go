package main

import (
	"fmt"
	"strings"
)

func _14() {
	lines := getLines("14.txt")

	sX := 500

	getXY := func(part string) (int, int) {
		ints := getInts(part)
		return ints[0], ints[1]
	}

	getL := func(x, y int) string {
		return fmt.Sprintf("%d,%d", x, y)
	}

	part1 := func() {
		maxY := 0
		cave := make(map[string]bool)
		for _, line := range lines {
			parts := strings.Split(line, " -> ")
			x, y := getXY(parts[0])
			for _, part := range parts[1:] {
				x_, y_ := getXY(part)
				if x == x_ {
					a, b := y, y_
					if a > b {
						b, a = a, b
					}
					for i := a; i <= b; i++ {
						l := getL(x, i)
						cave[l] = true
					}
				} else if y == y_ {
					if y > maxY {
						maxY = y
					}
					a, b := x, x_
					if a > b {
						b, a = a, b
					}
					for i := a; i <= b; i++ {
						l := getL(i, y)
						cave[l] = true
					}
				} else {
					panic(line)
				}
				x, y = x_, y_
			}
		}
		dirs := []int{0, -1, 1}
		for i := 0; ; i++ {
			x := sX
			for y := 0; ; y++ {
				if y == maxY {
					fmt.Println(i)
					return
				}
				blocked := true
				for _, d := range dirs {
					l := getL(x+d, y+1)
					if !cave[l] {
						x += d
						blocked = false
						break
					}
				}
				if blocked {
					l := getL(x, y)
					cave[l] = true
					break
				}
			}
		}
	}

	part2 := func() {
		maxY := 0
		cave := make(map[string]bool)
		for _, line := range lines {
			parts := strings.Split(line, " -> ")
			x, y := getXY(parts[0])
			for _, part := range parts[1:] {
				x_, y_ := getXY(part)
				if x == x_ {
					a, b := y, y_
					if a > b {
						b, a = a, b
					}
					for i := a; i <= b; i++ {
						l := getL(x, i)
						cave[l] = true
					}
				} else if y == y_ {
					if y > maxY {
						maxY = y
					}
					a, b := x, x_
					if a > b {
						b, a = a, b
					}
					for i := a; i <= b; i++ {
						l := getL(i, y)
						cave[l] = true
					}
				} else {
					panic(line)
				}
				x, y = x_, y_
			}
		}
		dirs := []int{0, -1, 1}
		for i := 0; ; i++ {
			x := sX
			for y := 0; ; y++ {
				blocked := true
				if y < maxY+1 {
					for _, d := range dirs {
						l := getL(x+d, y+1)
						if !cave[l] {
							x += d
							blocked = false
							break
						}
					}
				}
				if blocked {
					if y == 0 {
						fmt.Println(i + 1)
						return
					}
					l := getL(x, y)
					cave[l] = true
					break
				}
			}
		}
	}

	part1()
	part2()
}
