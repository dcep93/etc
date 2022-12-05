package main

import (
	"fmt"
	"strconv"
	"strings"
)

func _05() {
	lines := getLines("05.txt")

	part1 := func() {
		var columns [][]byte
		moving := false
		for _, line := range lines {
			if moving {
				parts := strings.Split(line, " ")
				quantity, err := strconv.Atoi(parts[1])
				if err != nil {
					panic(err)
				}
				from, err := strconv.Atoi(parts[3])
				if err != nil {
					panic(err)
				}
				to, err := strconv.Atoi(parts[5])
				if err != nil {
					panic(err)
				}
				to = to - 1
				from = from - 1
				for i := 0; i < quantity; i++ {
					columns[to] = append(append([]byte{}, columns[from][:1]...), columns[to]...)
					columns[from] = columns[from][1:]
				}
			} else {
				if line == "" {
					moving = true
					continue
				}
				parts := strings.Split(line, "")
				if columns == nil {
					for i := 0; i < len(parts); i += 4 {
						columns = append(columns, make([]byte, 0))
					}
				}
				for i := range columns {
					c := parts[4*i+1]
					if c != " " {
						columns[i] = append(columns[i], c[0])
					}
				}
			}
		}

		message := ""
		for _, m := range columns {
			message += string(m[0])
		}

		fmt.Println(message)
	}

	part2 := func() {
		var columns [][]byte
		moving := false
		for _, line := range lines {
			if moving {
				parts := strings.Split(line, " ")
				quantity, err := strconv.Atoi(parts[1])
				if err != nil {
					panic(err)
				}
				from, err := strconv.Atoi(parts[3])
				if err != nil {
					panic(err)
				}
				to, err := strconv.Atoi(parts[5])
				if err != nil {
					panic(err)
				}
				to = to - 1
				from = from - 1
				columns[to] = append(append([]byte{}, columns[from][:quantity]...), columns[to]...)
				columns[from] = columns[from][quantity:]
			} else {
				if line == "" {
					moving = true
					continue
				}
				parts := strings.Split(line, "")
				if columns == nil {
					for i := 0; i < len(parts); i += 4 {
						columns = append(columns, make([]byte, 0))
					}
				}
				for i := range columns {
					c := parts[4*i+1]
					if c != " " {
						columns[i] = append(columns[i], c[0])
					}
				}
			}
		}

		message := ""
		for _, m := range columns {
			message += string(m[0])
		}

		fmt.Println(message)
	}

	part1()
	part2()
}
