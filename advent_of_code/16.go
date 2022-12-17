package main

import (
	"fmt"
	"sort"
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
		path []string
	}

	getKey := func(n node) string {
		return fmt.Sprintf("%v %v", n.pos, n.open)
	}

	defaultDuration := 18
	shouldPrint := false

	part1 := func() {
		// return
		fmt.Println("part1")
		duration := defaultDuration
		start := node{pos: "AA", flow: 0, open: make(map[string]bool)}
		history := make(map[string]node)
		search := make(map[string]node)
		key := getKey(start)
		search[key] = start
		history[key] = start
		flow := 0
		for i := duration - 1; i >= 0; i-- {
			if shouldPrint {
				fmt.Println(i)
			}
			nextSearch := make(map[string]node)
			for k, s := range search {
				if shouldPrint {
					fmt.Println(s, k)
				}
				t := tunnels[s.pos]
				if t.flow > 0 && !s.open[s.pos] {
					nextNode := node{pos: s.pos, flow: s.flow + (i * t.flow), open: make(map[string]bool), path: append(append([]string{}, s.path...), "+")}
					for p := range s.open {
						nextNode.open[p] = true
					}
					nextNode.open[s.pos] = true
					if nextNode.flow > flow {
						flow = nextNode.flow
					}
					key := getKey(nextNode)
					h, ok := history[key]
					if !ok || nextNode.flow > h.flow {
						nextSearch[key] = nextNode
						history[key] = nextNode
					}
				}
				for _, p := range t.next {
					nextNode := node{pos: p, flow: s.flow, open: make(map[string]bool), path: append(append([]string{}, s.path...), p)}
					for p := range s.open {
						nextNode.open[p] = true
					}
					key := getKey(nextNode)
					h, ok := history[key]
					if !ok || nextNode.flow > h.flow {
						nextSearch[key] = nextNode
						history[key] = nextNode
					}
				}

			}
			search = nextSearch
		}
		fmt.Println(flow)
	}

	part2 := func() {
		// return // {CC 39 map[BB:true]} CC map[BB:true]
		fmt.Println("part2")
		num := 1
		duration := defaultDuration - ((num - 1) * 4)
		var posA []string
		for i := 0; i < num; i++ {
			posA = append(posA, "AA")
		}
		start := node{pos: strings.Join(posA, " "), flow: 0, open: make(map[string]bool)}
		history := make(map[string][]node)
		search := make(map[string]node)
		key := getKey(start)
		search[key] = start
		history[start.pos] = []node{start}
		flow := 0
		for i := duration - 1; i >= 0; i-- {
			if shouldPrint {
				fmt.Println(i)
			}
			for j := num - 1; j >= 0; j-- {
				nextSearch := make(map[string]node)
				for k, s := range search {
					if shouldPrint {
						fmt.Println(s, k)
					}
					pos := strings.Split(s.pos, " ")[j]
					t := tunnels[pos]
					if t.flow > 0 && !s.open[pos] {
						nextNode := node{pos: s.pos, flow: s.flow + (i * t.flow), open: make(map[string]bool), path: append(append([]string{}, s.path...), "+")}
						for p := range s.open {
							nextNode.open[p] = true
						}
						nextNode.open[pos] = true
						if nextNode.flow > flow {
							flow = nextNode.flow
						}
						key := getKey(nextNode)
						hs, skip := history[nextNode.pos]
						if skip {
							skip = false
							for _, h := range hs {
								if skip {
									continue
								}
								if h.flow >= nextNode.flow {
									hSkip := true
									for o := range nextNode.open {
										if !h.open[o] {
											hSkip = false
										}
									}
									if hSkip {
										skip = true
									}
								}
							}
						}
						if !skip {
							nextSearch[key] = nextNode
							history[nextNode.pos] = append(history[nextNode.pos], nextNode)
						}
					}
					for _, p := range t.next {
						nextP := strings.Split(s.pos, " ")
						nextP[j] = p
						if j == 0 {
							sort.Strings(nextP)
						}
						nextNode := node{pos: strings.Join(nextP, " "), flow: s.flow, open: make(map[string]bool), path: append(append([]string{}, s.path...), p)}
						// fmt.Println(nextNode.path, nextP)
						for p := range s.open {
							nextNode.open[p] = true
						}
						key := getKey(nextNode)
						hs, skip := history[nextNode.pos]
						if skip {
							skip = false
							for _, h := range hs {
								if skip {
									continue
								}
								if h.flow >= nextNode.flow {
									hSkip := true
									for o := range nextNode.open {
										if !h.open[o] {
											hSkip = false
										}
									}
									if hSkip {
										skip = true
									}
								}
							}
						}
						if !skip {
							nextSearch[key] = nextNode
							history[nextNode.pos] = append(history[nextNode.pos], nextNode)
						}
					}

				}
				search = nextSearch
			}
		}
		fmt.Println(flow)
	}

	part1()
	part2()
	fmt.Println("done")
}
