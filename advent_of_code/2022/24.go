package main

import (
	"fmt"
)

func _24() {
	lines := getLines("24.txt")

	width := len(lines[0])
	height := len(lines)

	var start int
	for i := 0; i <= width; i++ {
		if lines[0][i] == '.' {
			start = i
			break
		}
	}
	var target int
	for i := 0; i <= width; i++ {
		if lines[height-1][i] == '.' {
			target = i
			break
		}
	}
	search := map[string][]int{"": {start, 0}}

	bs := [][]int{}
	dMap := map[rune]int{'>': 0, 'v': 1, '<': 2, '^': 3}
	for j, line := range lines {
		for i, cell := range line {
			if cell == '#' || cell == '.' {
				continue
			}
			direction := dMap[cell]
			bs = append(bs, []int{i, j, direction})
		}
	}

	directions := [][]int{
		{1, 0},
		{0, 1},
		{-1, 0},
		{0, -1},
		{0, 0},
	}

	bigSeen := make(map[string]bool)
	for steps := 1; steps < 10000; steps++ {
		fmt.Println(steps, len(search))
		if len(search) == 0 {
			panic("impossible")
		}
		seen := make(map[string]bool)
		for _, b := range bs {
			d := directions[b[2]]
			for i, x := range d {
				b[i] += x
			}
			if b[0] == 0 {
				b[0] = width - 2
			}
			if b[0] == width-1 {
				b[0] = 1
			}
			if b[1] == 0 {
				b[1] = height - 2
			}
			if b[1] == height-1 {
				b[1] = 1
			}
			bb := []int{b[0], b[1]}
			seen[v(bb)] = true
		}
		bbs := v(bs)
		nextSearch := make(map[string][]int)
		for _, s := range search {
			vv := v(s) + bbs
			if bigSeen[vv] {
				continue
			}
			bigSeen[vv] = true
			for _, d := range directions {
				ss := append([]int{}, s...)
				for i, x := range d {
					ss[i] += x
				}
				if ss[0] == start && ss[1] == 0 {
					if len(ss) == 3 {
						ss = append(ss, steps)
					}
				} else if ss[0] == target && ss[1] == height-1 {
					if len(ss) == 2 {
						ss = append(ss, steps)
						// fmt.Println(steps, ss)
						// return
					}
					if len(ss) == 4 {
						ss = append(ss, steps)
						fmt.Println(steps, ss)
						return
					}
				} else {
					if ss[0] <= 0 || ss[0] >= width-1 {
						continue
					}
					if ss[1] <= 0 || ss[1] >= height-1 {
						continue
					}
				}
				key := v([]int{ss[0], ss[1]})
				if seen[key] {
					continue
				}
				nss := nextSearch[key]
				if len(nss) > len(ss) {
					continue
				}
				nextSearch[key] = ss
			}
		}
		search = nextSearch
	}
	panic("failed")

	part1 := func() {
	}

	part2 := func() {
	}

	part1()
	part2()

	fmt.Println("done")
}
