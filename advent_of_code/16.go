package main

import (
	"fmt"
	"strconv"
	"strings"
)

func _16() {
	lines := getLines("16.txt")

	type tunnel struct {
		next []string
		flow int
	}
	tunnels := make(map[string]tunnel)

	for _, line := range lines {
		flow, err := strconv.Atoi(strings.Split(strings.Split(line, "rate=")[1], ";")[0])
		if err != nil {
			panic(err)
		}
		var next []string
		parts := strings.Split(line, " ")
		if parts[len(parts)-2] == "valve" {
			next = []string{parts[len(parts)-1]}
		} else {
			next = strings.Split(strings.Split(line, "valves ")[1], ", ")
		}
		tunnels[strings.Split(line, " ")[1]] = tunnel{
			next: next,
			flow: flow,
		}
	}

	type node struct {
		pos  string
		flow int
		open map[string]bool
	}

	part1 := func() {
		getKey := func(n node) string {
			return fmt.Sprintf("%v", n)
		}
		duration := 30
		start := node{pos: "AA", flow: 0, open: make(map[string]bool)}
		search := make(map[string]node)
		search[getKey(start)] = start
		flow := 0
		for i := duration - 1; i >= 0; i-- {
			nextSearch := make(map[string]node)
			for _, s := range search {
				t := tunnels[s.pos]
				if !s.open[s.pos] {
					nextNode := node{pos: s.pos, flow: s.flow + (i * t.flow), open: make(map[string]bool)}
					for p := range s.open {
						nextNode.open[p] = true
					}
					if nextNode.flow > flow {
						flow = nextNode.flow
					}
					nextNode.open[s.pos] = true
					nextSearch[getKey(nextNode)] = nextNode
				}
				for _, p := range t.next {
					nextNode := node(s)
					nextNode.pos = p
					key := getKey(nextNode)
					nextSearch[key] = nextNode
				}

			}
			search = nextSearch
		}
		fmt.Println(flow)
	}

	part2 := func() {
	}

	part1()
	part2()
	fmt.Println("done")
}
