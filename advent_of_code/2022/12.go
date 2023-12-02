package main

import "fmt"

func _12() {
	lines := getLines("12.txt")

	part1 := func() {
		seen := make(map[string]bool)
		for i := 0; i < len(lines); i++ {
			for j := 0; j < len(lines[0]); j++ {
				if lines[i][j] == 'S' {
					ns := [][]int{{i, j, int('a')}}
					for d := 1; ; d++ {
						if len(ns) == 0 {
							break
						}
						var nns [][]int
						for _, n := range ns {
							key := fmt.Sprintf("%v", n)
							if seen[key] {
								continue
							}
							seen[key] = true
							for ii := -1; ii <= 1; ii++ {
								for jj := -1; jj <= 1; jj++ {
									if ii*jj == 0 && ii+jj != 0 {
										nn := []int{n[0] + ii, n[1] + jj}
										if nn[0] >= 0 && nn[0] < len(lines) {
											if nn[1] >= 0 && nn[1] < len(lines[0]) {
												vv := lines[nn[0]][nn[1]]
												// fmt.Println(nn)
												if n[2] >= int('z')-1 && vv == 'E' {
													fmt.Println(d)
													return
												}
												if int(vv) <= n[2]+1 {
													nns = append(nns, append(nn, int(vv)))
												}
											}
										}
									}
								}
							}
						}
						ns = nns
					}
				}
			}
		}
		fmt.Println(-1)
	}

	part2 := func() {
		seen := make(map[string]bool)
		for i := 0; i < len(lines); i++ {
			for j := 0; j < len(lines[0]); j++ {
				if lines[i][j] == 'E' {
					ns := [][]int{{i, j, int('z')}}
					for d := 1; ; d++ {
						if len(ns) == 0 {
							break
						}
						var nns [][]int
						for _, n := range ns {
							key := fmt.Sprintf("%v", n)
							if seen[key] {
								continue
							}
							seen[key] = true
							for ii := -1; ii <= 1; ii++ {
								for jj := -1; jj <= 1; jj++ {
									if ii*jj == 0 && ii+jj != 0 {
										nn := []int{n[0] + ii, n[1] + jj}
										if nn[0] >= 0 && nn[0] < len(lines) {
											if nn[1] >= 0 && nn[1] < len(lines[0]) {
												vv := lines[nn[0]][nn[1]]
												// fmt.Println(nn)
												if n[2] <= int('a')+1 && (vv == 'S' || vv == 'a') {
													fmt.Println(d)
													return
												}
												if int(vv) >= n[2]-1 {
													nns = append(nns, append(nn, int(vv)))
												}
											}
										}
									}
								}
							}
						}
						ns = nns
					}
				}
			}
		}
		fmt.Println(-1)
	}

	part1()
	part2()
}
