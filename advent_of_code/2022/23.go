package main

import (
	"fmt"
)

func _23() {
	lines := getLines("23.txt")

	elves := make(map[string][]int)

	for i, line := range lines {
		for j, c := range line {
			if c == '#' {
				elf := []int{j, i}
				elves[v(elf)] = elf
			}
		}
	}

	instructions := [][]int{
		{0, -1},
		{0, 1},
		{-1, 0},
		{1, 0},
	}

	getNext := func(elf []int) *[]int {
		adjacent := false
		for i := -1; i <= 1; i++ {
			if adjacent {
				break
			}
			for j := -1; j <= 1; j++ {
				if i == 0 && j == 0 {
					continue
				}
				next := append([]int{}, elf...)
				next[0] += i
				next[1] += j
				if _, ok := elves[v(next)]; ok {
					adjacent = true
					break
				}
			}
		}
		if !adjacent {
			return nil
		}
		for _, instruction := range instructions {
			empty := true
			for j := -1; j <= 1; j++ {
				next := append([]int{}, elf...)
				if instruction[0] == 0 {
					next[0] += j
					next[1] += instruction[1]
				} else {
					next[0] += instruction[0]
					next[1] += j
				}
				if _, ok := elves[v(next)]; ok {
					empty = false
					break
				}
			}
			if empty {
				next := append([]int{}, elf...)
				for j, x := range instruction {
					next[j] += x
				}
				return &next
			}
		}
		return nil
	}

	part1 := func() {
		return
		for i := 0; i < 10; i++ {
			proposed := make(map[string]*[][]int)
			for _, elf := range elves {
				next := getNext(elf)
				if next != nil {
					nextV := v(next)
					_, ok := proposed[nextV]
					if ok {
						proposed[nextV] = nil
					} else {
						p := [][]int{elf, *next}
						proposed[nextV] = &p
					}
				}
			}
			for _, p := range proposed {
				if p != nil {
					pp := *p
					elf, next := pp[0], pp[1]
					// fmt.Println(elf, next)
					delete(elves, v(elf))
					elves[v(next)] = next
				}
			}
			instructions = append(instructions[1:], instructions[0])
		}

		var minX int
		var maxX int
		var minY int
		var maxY int
		for _, elf := range elves {
			minX, minY = elf[0], elf[1]
			maxX, maxY = minX, minY
			break
		}
		for _, elf := range elves {
			if elf[0] < minX {
				minX = elf[0]
			}
			if elf[0] > maxX {
				maxX = elf[0]
			}
			if elf[1] < minY {
				minY = elf[1]
			}
			if elf[1] > maxY {
				maxY = elf[1]
			}
		}
		for j := minY; j <= maxY; j++ {
			s := ""
			for i := minX; i <= maxX; i++ {
				e := []int{i, j}
				if _, ok := elves[v(e)]; ok {
					s += "#"
				} else {
					s += "."
				}
			}
			fmt.Println(s)
		}
		area := (1 + maxX - minX) * (1 + maxY - minY)
		fmt.Println(len(elves), minX, maxX, minY, maxY)
		fmt.Println(area - len(elves))
	}

	part2 := func() {
		for i := 0; i < 100000; i++ {
			proposed := make(map[string]*[][]int)
			for _, elf := range elves {
				next := getNext(elf)
				if next != nil {
					nextV := v(next)
					_, ok := proposed[nextV]
					if ok {
						proposed[nextV] = nil
					} else {
						p := [][]int{elf, *next}
						proposed[nextV] = &p
					}
				}
			}
			unmoved := true
			for _, p := range proposed {
				if p != nil {
					unmoved = false
					pp := *p
					elf, next := pp[0], pp[1]
					// fmt.Println(elf, next)
					delete(elves, v(elf))
					elves[v(next)] = next
				}
			}
			if unmoved {
				fmt.Println(i + 1)
				break
			}
			instructions = append(instructions[1:], instructions[0])
		}
	}

	part1()
	part2()

	fmt.Println("done")
}
