package main

import (
	"fmt"
	"strconv"
)

func _20() {
	lines := getLines("20.txt")

	type node struct {
		prev  *node
		next  *node
		value int
	}

	part1 := func() {
		head := &node{}
		var q []*node
		prev := head
		for _, line := range lines {
			value, err := strconv.Atoi(line)
			if err != nil {
				panic(err)
			}
			n := &node{prev: prev, value: value}
			if prev != nil {
				prev.next = n
			}
			prev = n
			q = append(q, n)
		}
		prev.next = head
		head.prev = prev
		var gen func(n *node, isPositive bool) *node
		gen = func(n *node, isPositive bool) *node {
			var nn *node
			if isPositive {
				nn = n.next
			} else {
				nn = n.prev
			}
			if nn == head {
				return gen(nn, isPositive)
			}
			return nn
		}
		// p := func() {
		// 	var s []int
		// 	for n := head.next; n != head; n = n.next {
		// 		s = append(s, n.value)
		// 	}
		// 	fmt.Println(s)
		// }
		for _, n := range q {
			if n.value == 0 {
				continue
			}
			nn := n
			nn.prev.next = nn.next
			nn.next.prev = nn.prev
			v := n.value
			if v < 0 {
				v = -n.value + 1
			}
			for i := 0; i < v; i++ {
				nn = gen(nn, n.value > 0)
			}
			n.prev = nn
			n.next = nn.next
			nn.next.prev = n
			nn.next = n
		}
		n := head
		for {
			n = gen(n, true)
			if n.value == 0 {
				break
			}
		}
		s := 0
		for i := 0; i < 3; i++ {
			for j := 0; j < 1000; j++ {
				n = gen(n, true)
			}
			fmt.Println(n)
			s += n.value
		}
		fmt.Println(s)
	}

	part2 := func() {
		key := 811589153
		head := &node{}
		var q []*node
		prev := head
		for _, line := range lines {
			value, err := strconv.Atoi(line)
			if err != nil {
				panic(err)
			}
			n := &node{prev: prev, value: value * key}
			if prev != nil {
				prev.next = n
			}
			prev = n
			q = append(q, n)
		}
		prev.next = head
		head.prev = prev
		var gen func(n *node, isPositive bool) *node
		gen = func(n *node, isPositive bool) *node {
			var nn *node
			if isPositive {
				nn = n.next
			} else {
				nn = n.prev
			}
			if nn == head {
				return gen(nn, isPositive)
			}
			return nn
		}
		p := func() {
			var s []int
			for n := head.next; n != head; n = n.next {
				s = append(s, n.value)
			}
			fmt.Println(s)
		}
		m := len(q) - 1
		for i := 0; i < 1; i++ {
			fmt.Println(i)
			p()
			for _, n := range q {
				v := n.value
				for v < 0 {
					v += m
				}
				for v > m {
					v -= m
				}
				if v == 0 {
					continue
				}
				isPositive := v < (m / 2)
				if !isPositive {
					v = m - v
				}
				nn := n
				nn.prev.next = nn.next
				nn.next.prev = nn.prev
				for i := 0; i < v; i++ {
					nn = gen(nn, isPositive)
				}
				n.prev = nn
				n.next = nn.next
				nn.next.prev = n
				nn.next = n
			}
		}
		p()
		n := head
		for {
			n = gen(n, true)
			if n.value == 0 {
				break
			}
		}
		s := 0
		for i := 0; i < 3; i++ {
			for j := 0; j < 1000; j++ {
				n = gen(n, true)
			}
			fmt.Println(n)
			s += n.value
		}
		fmt.Println(s)
	}

	part1()
	part2()

	fmt.Println("done")
}
