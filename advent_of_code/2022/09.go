package main

import (
	"fmt"
	"math"
	"strconv"
	"strings"
)

func _09() {
	lines := getLines("09.txt")

	directions := map[string][]int{"R": {1, 0}, "L": {-1, 0}, "U": {0, 1}, "D": {0, -1}}

	add := func(a []int, b []int, direction int) []int {
		return []int{a[0] + direction*b[0], a[1] + direction*b[1]}
	}

	part1 := func() {
		return

		nextT := func(t []int, h []int) []int {
			diff := add(t, h, -1)
			if math.Abs(float64(diff[0])) == 2 {
				return []int{t[0] - diff[0]/2, h[1]}
			} else if math.Abs(float64(diff[1])) == 2 {
				return []int{h[0], t[1] - diff[1]/2}
			}
			return t
		}
		h := []int{0, 0}
		t := h
		visited := map[string]bool{}
		for _, line := range lines {
			parts := strings.Split(line, " ")
			count, err := strconv.Atoi(parts[1])
			if err != nil {
				panic(err)
			}
			direction := directions[parts[0]]
			for i := 0; i < count; i++ {
				h = add(h, direction, 1)
				t = nextT(t, h)
				key := fmt.Sprintf("%v", t)
				visited[key] = true
				// fmt.Println(parts, h, t)
			}
		}
		num_visited := len(visited)
		fmt.Println(num_visited, h, t)
	}

	part2 := func() {
		nextT := func(t []int, h []int) []int {
			t = append([]int{}, t...)
			diff := add(t, h, -1)
			if math.Abs(float64(diff[0])) == 2 {
				t[0] -= diff[0] / 2
				if math.Abs(float64(diff[1])) <= 1 {
					t[1] = h[1]
				}
			}
			if math.Abs(float64(diff[1])) == 2 {
				t[1] -= diff[1] / 2
				if math.Abs(float64(diff[0])) <= 1 {
					t[0] = h[0]
				}
			}
			return t
		}
		num_knots := 10
		h := []int{0, 0}
		var ts [][]int
		for i := 0; i < num_knots-1; i++ {
			ts = append(ts, h)
		}
		visited := map[string]bool{}
		for _, line := range lines {
			parts := strings.Split(line, " ")
			count, err := strconv.Atoi(parts[1])
			if err != nil {
				panic(err)
			}
			direction := directions[parts[0]]
			for i := 0; i < count; i++ {
				h = add(h, direction, 1)
				ts[0] = nextT(ts[0], h)
				for j := 1; j < len(ts); j++ {
					ts[j] = nextT(ts[j], ts[j-1])
				}
				key := fmt.Sprintf("%v", ts[len(ts)-1])
				visited[key] = true
				// fmt.Println(i, h, ts)
			}
			// fmt.Println(parts, h, ts)
		}
		num_visited := len(visited)
		fmt.Println(num_visited, h, ts)
	}

	part1()
	part2()
}
