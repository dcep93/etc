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
		return
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
		width := 3
		head := &node{}
		prev := head
		var q []*node
		r_anchors := map[*node]int{head: 0}
		anchors := map[int]*node{0: head}
		var as []int
		for i, line := range lines {
			value, err := strconv.Atoi(line)
			if err != nil {
				panic(err)
			}
			n := &node{
				prev:  prev,
				value: value * key,
			}
			if i != 0 && i%width == 0 {
				anchors[i] = n
				r_anchors[n] = i
				as = append(as, i)
			}
			if prev != nil {
				prev.next = n
			}
			prev = n
			q = append(q, n)
		}
		prev.next = head
		head.prev = prev
		p := func() {
			var s []int
			for n := head.next; n != head; n = n.next {
				s = append(s, n.value)
			}
			fmt.Println(s)
		}
		m := len(q) - 1
		getNN := func(n *node) *node {
			v := n.value
			for v < 0 {
				v += m
			}
			anchor := n
			for {
				if v == 0 {
					return anchor
				}
				if _, ok := r_anchors[anchor]; ok {
					break
				}
				anchor = anchor.next
				v--
			}
			r := r_anchors[anchor]
			target := (r + v) % m
			closest := -1
			for _, a := range as {
				if a <= target {
					closest = a
					if r < a {
						aa := anchors[a]
						delete(r_anchors, aa)
						aa = aa.next
						anchors[a] = aa
						r_anchors[aa] = a

					}
				} else if r > a {
					aa := anchors[a]
					delete(r_anchors, aa)
					aa = aa.prev
					anchors[a] = aa
					r_anchors[aa] = a
				}
			}
			nn := anchors[closest]
			diff := target - closest
			for i := 0; i < diff; i++ {
				nn = nn.next
			}
			return nn
		}
		for i := 0; i < 10; i++ {
			fmt.Println(i)
			p()
			fmt.Println()
			for _, n := range q {
				nn := getNN(n)
				if nn == n {
					continue
				}
				n.prev.next = n.next
				n.next.prev = n.prev
				n.prev = nn
				n.next = nn.next
				nn.next.prev = n
				nn.next = n
			}
		}
		p()
		n := head
		for n.value != 0 {
			n = n.next
		}
		s := 0
		for i := 0; i < 3; i++ {
			for j := 0; j < 1000; j++ {
				n = n.next
				if n == head {
					n = n.next
				}
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
