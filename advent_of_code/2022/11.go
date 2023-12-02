package main

import (
	"fmt"
	"sort"
	"strconv"
	"strings"
)

func _11() {
	lines := getLines("11.txt")

	type monkey struct {
		inspects          int
		items             []int
		operationIsSquare bool
		operationIsAdd    bool
		operationValue    int
		testDivisible     int
		ifTrue            int
		ifFalse           int
	}

	part := func(num_rounds int, worry_divider int) []*monkey {
		var monkeys []*monkey
		var err error
		lcm := 1
		for i := 0; i < len(lines); i++ {
			m := monkey{}
			i++
			itemsStrs := strings.Split(strings.Split(lines[i], "Starting items: ")[1], ", ")
			for _, itemStr := range itemsStrs {
				item, err := strconv.Atoi(itemStr)
				if err != nil {
					panic(err)
				}
				m.items = append(m.items, item)
			}
			i++
			operationStrs := strings.Split(strings.Split(lines[i], "Operation: ")[1], " ")
			if operationStrs[4] == "old" {
				m.operationIsSquare = true
			} else {
				m.operationIsAdd = operationStrs[3] == "+"
				m.operationValue, err = strconv.Atoi(operationStrs[4])
				if err != nil {
					panic(err)
				}
			}
			i++
			testStrs := strings.Split(strings.Split(lines[i], "Test: ")[1], " ")
			m.testDivisible, err = strconv.Atoi(testStrs[2])
			// not correct
			lcm *= m.testDivisible
			if err != nil {
				panic(err)
			}
			i++
			trueStrs := strings.Split(strings.Split(lines[i], "If true: ")[1], " ")
			m.ifTrue, err = strconv.Atoi(trueStrs[3])
			if err != nil {
				panic(err)
			}
			i++
			falseStrs := strings.Split(strings.Split(lines[i], "If false: ")[1], " ")
			m.ifFalse, err = strconv.Atoi(falseStrs[3])
			if err != nil {
				panic(err)
			}
			i++
			monkeys = append(monkeys, &m)
		}

		for i := 0; i < num_rounds; i++ {
			for _, m := range monkeys {
				for _, item := range m.items {
					m.inspects++
					if m.operationIsSquare {
						item *= item
					} else if m.operationIsAdd {
						item += m.operationValue
					} else {
						item *= m.operationValue
					}
					item /= worry_divider
					var dest int
					if item%m.testDivisible == 0 {
						dest = m.ifTrue
					} else {
						dest = m.ifFalse
					}
					n := monkeys[dest]
					item = item % lcm
					n.items = append(n.items, item)
				}
				m.items = []int{}
				if i == 999 {
					fmt.Println(m.inspects)
				}
			}
		}
		return monkeys
	}

	part1 := func() {
		return
		monkeys := part(20, 3)
		inspects := []int{}
		for _, m := range monkeys {
			inspects = append(inspects, m.inspects)
		}
		sort.Ints(inspects)
		for i, j := 0, len(inspects)-1; i < j; i, j = i+1, j-1 {
			inspects[i], inspects[j] = inspects[j], inspects[i]
		}
		fmt.Println(inspects, inspects[0]*inspects[1])
	}

	part2 := func() {
		monkeys := part(10000, 1)
		inspects := []int{}
		for _, m := range monkeys {
			inspects = append(inspects, m.inspects)
		}
		sort.Ints(inspects)
		for i, j := 0, len(inspects)-1; i < j; i, j = i+1, j-1 {
			inspects[i], inspects[j] = inspects[j], inspects[i]
		}
		fmt.Println(inspects, inspects[0]*inspects[1])
	}

	part1()
	part2()
}
