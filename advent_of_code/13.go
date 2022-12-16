package main

import (
	"fmt"
	"sort"
	"strconv"
)

func _13() {
	lines := getLines("13.txt")

	type value struct {
		isInt    bool
		intVal   int
		children []value
		tagged   bool
	}

	var toValue func(s string) value
	toValue = func(s string) value {
		if s[0] != '[' {
			intVal, err := strconv.Atoi(s)
			if err != nil {
				panic(err)
			}
			return value{isInt: true, intVal: intVal}
		}
		var children []value
		start := 1
		opens := 0
		for end := 1; end < len(s); end++ {
			if end != len(s)-1 {
				if s[end] != ',' {
					if s[end] == '[' {
						opens++
					} else if s[end] == ']' {
						opens--
					}
					continue
				}
				if opens != 0 {
					continue
				}
			}
			if end > start {
				children = append(children, toValue(s[start:end]))
			}
			start = end + 1
		}
		return value{children: children}
	}

	// 0 for wrong
	// 1 for right
	// 2 for continue
	var orderedCorrect func(left value, right value) int
	orderedCorrect = func(left value, right value) int {
		if left.isInt {
			if right.isInt {
				if left.intVal > right.intVal {
					return 0
				} else if left.intVal < right.intVal {
					return 1
				} else {
					return 2
				}
			} else {
				left = value{children: []value{left}}
			}
		} else if right.isInt {
			right = value{children: []value{right}}
		}
		for i := 0; ; i++ {
			if len(left.children) <= i {
				if len(right.children) > i {
					return 1
				}
				return 2
			}
			if len(right.children) <= i {
				return 0
			}
			sub := orderedCorrect(left.children[i], right.children[i])
			if sub < 2 {
				return sub
			}
		}
	}

	part1 := func() {
		s := 0
		for i := 0; i < len(lines); i++ {
			left := toValue(lines[i])
			right := toValue(lines[i+1])
			i += 2
			if orderedCorrect(left, right) == 1 {
				index := (i / 3) + 1
				s += index
			}
		}
		fmt.Println(s)
	}

	part2 := func() {
		dividers := []string{"[[2]]", "[[6]]"}
		var ordered []value
		for _, divider := range dividers {
			v := toValue(divider)
			v.tagged = true
			ordered = append(ordered, v)
		}
		for _, line := range lines {
			if line != "" {
				v := toValue(line)
				ordered = append(ordered, v)
			}
		}
		sort.Slice(ordered, func(i, j int) bool {
			return orderedCorrect(ordered[i], ordered[j]) == 1
		})
		s := 1
		for i, v := range ordered {
			if v.tagged {
				s *= i + 1
			}
		}
		fmt.Println(s)
	}

	part1()
	part2()
}
