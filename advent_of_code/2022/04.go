package main

import (
	"fmt"
	"strconv"
	"strings"
)

func _04() {
	lines := getLines("04.txt")

	getPair := func(raw string) []int {
		var pair []int
		for _, s := range strings.Split(raw, "-") {
			n, err := strconv.Atoi(s)
			if err != nil {
				panic(err)
			}
			pair = append(pair, n)
		}
		return pair
	}

	part1 := func() {
		num := 0
		for _, line := range lines {
			pair := strings.Split(line, ",")
			pair1 := getPair(pair[0])
			pair2 := getPair(pair[1])
			if pair1[0] > pair2[0] {
				if pair1[1] > pair2[1] {
					continue
				}
			} else if pair1[0] < pair2[0] {
				if pair1[1] < pair2[1] {
					continue
				}
			}
			num += 1
		}

		fmt.Println(num)
	}

	part2 := func() {
		num := 0
		for _, line := range lines {
			pair := strings.Split(line, ",")
			pair1 := getPair(pair[0])
			pair2 := getPair(pair[1])
			if pair1[0] > pair2[0] {
				if pair2[1] < pair1[0] {
					continue
				}
			} else if pair1[0] < pair2[0] {
				if pair1[1] < pair2[0] {
					continue
				}
			}
			num += 1
		}

		fmt.Println(num)
	}

	part1()
	part2()
}
