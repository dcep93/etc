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
		width := 70
		head := &node{}
		prev := head
		var q []*node
		r_anchors := map[*node]int{}
		anchors := map[int]*node{}
		as := []int{}
		for i, line := range lines {
			value, err := strconv.Atoi(line)
			if err != nil {
				panic(err)
			}
			n := &node{
				prev:  prev,
				value: value * key,
			}
			if i%width == 0 {
				fmt.Println(i, prev.value)
				anchors[i] = prev
				r_anchors[prev] = i
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
			for _, a := range as {
				n := head
				for i := 0; i < a; i++ {
					n = n.next
				}
				if anchors[a] != n {
					fmt.Println(a, n, anchors[a])
					panic("anchors")
				}
				if r_anchors[n] != a {
					panic("r_anchors")
				}
			}
		}
		m := len(q) - 1
		getNN := func(n *node) *node {
			v := n.value
			for v < 0 {
				v += m
			}
			anchor := n
			for {
				if _, ok := r_anchors[anchor]; ok {
					break
				}
				if v == 0 {
					return anchor
				}
				anchor = anchor.next
				v--
			}
			r := r_anchors[anchor]
			if anchor == head {
				v++
				r += m + 1
			}
			target := ((r + v - 1) % (m)) + 1
			closest := -1
			// fmt.Println("pre", n.value, target, r, v)
			for _, a := range as {
				if a <= target {
					if target == a {
						aa := anchors[a]
						delete(r_anchors, aa)
						aa = n
						anchors[a] = aa
						r_anchors[aa] = a
					} else {
						if r <= a {
							aa := anchors[a]
							delete(r_anchors, aa)
							aa = aa.next
							if aa == n {
								aa = aa.next
							}
							anchors[a] = aa
							r_anchors[aa] = a
						}
						closest = a
					}
				} else if r > a { // a = 3 target = 1 r = 3
					aa := anchors[a]
					delete(r_anchors, aa)
					aa = aa.prev
					if aa == n {
						aa = aa.prev
					}
					if target < a {
					} else {
					}
					anchors[a] = aa
					r_anchors[aa] = a
				} else if anchor == n && r == a {
					aa := anchors[a]
					delete(r_anchors, aa)
					aa = aa.prev
					if aa == n {
						aa = aa.prev
					}
					if target < a {
					} else {
					}
					anchors[a] = aa
					r_anchors[aa] = a
				}
			}
			nn := anchors[closest]
			diff := target - closest - 1
			// fmt.Println("diff", diff, target, closest, nn)
			for i := 0; i < diff; i++ {
				if nn == n {
					nn = nn.next
				}
				nn = nn.next
				// fmt.Println("wut", nn)
			}
			return nn
		}
		for i := 0; i < 10; i++ {
			fmt.Println(i)
			// p()
			fmt.Println()
			for j, n := range q {
				// p()
				if j%100 == 0 {
					fmt.Println(j, n.value)
				}
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
		n := head.next
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
