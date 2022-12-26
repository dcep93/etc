package main

import (
	"fmt"
	"strconv"
)

func _22() {
	lines := getLines("22.txt")
	board := lines[:len(lines)-2]
	path := lines[len(lines)-1]

	position := []int{-1, 0}
	for i := range board[0] {
		if board[0][i] == '.' {
			position[0] = i
			break
		}
	}

	dirs := map[string]bool{"R": true, "L": false}
	facings := [][]int{
		{1, 0},
		{0, 1},
		{-1, 0},
		{0, -1},
	}

	getInstructions := func() []string {
		var instructions []string
		var s []rune
		path = path + " "
		for _, p := range path {
			_, ok := dirs[string(p)]
			if p == ' ' || ok {
				if len(s) > 0 {
					instructions = append(instructions, string(s))
					s = []rune{}
				}
				if ok {
					instructions = append(instructions, string(p))
				}
			} else {
				s = append(s, p)
			}
		}
		return instructions
	}
	instructions := getInstructions()

	execute := func(wrap func([]int, int) ([]int, int)) ([]int, int) {
		position = append([]int{}, position...)
		facing := 0
		// position = []int{1, 179}
		// facing = 1
		// instructions = []string{instructions[212]}
		for ii, instruction := range instructions {
			_ = ii
			// fmt.Println(ii, len(instructions), instruction, position, facing)
			dir, ok := dirs[instruction]
			if ok {
				if dir {
					facing++
				} else {
					facing--
				}
				facing = (facing + len(facings)) % len(facings)
			} else {
				c, err := strconv.Atoi(instruction)
				if err != nil {
					panic(err)
				}
				pp, ff := position, facing
				wrapped := false
				for i := 0; i < c; i++ {
					// fmt.Println(position, facing)
					nextPosition := append([]int{}, position...)
					nextFacing := facing
					var val byte
					for {
						f := facings[nextFacing]
						// fmt.Println(nextPosition, f)
						for j, x := range f {
							nextPosition[j] += x
						}
						if nextPosition[1] < 0 || nextPosition[1] >= len(board) {
							wrapped = true
							nextPosition, nextFacing = wrap(nextPosition, nextFacing)
							continue
						}
						row := board[nextPosition[1]]
						if nextPosition[0] < 0 || nextPosition[0] >= 150 {
							wrapped = true
							nextPosition, nextFacing = wrap(nextPosition, nextFacing)
							continue
						}
						if nextPosition[0] >= len(row) {
							val = ' '
						} else {
							val = row[nextPosition[0]]
						}
						if val != ' ' {
							break
						}
					}
					if wrapped {
						// fmt.Println("d", nextPosition, nextFacing)
					}
					if val == '#' {
						break
					}
					position = nextPosition
					facing = nextFacing
				}
				if wrapped {
					fmt.Println(pp, ff, c, ii)
					fmt.Println(position, facing)
					fmt.Println()
				}
			}
		}
		return position, facing
	}

	part1 := func() {
		return
		// position, facing := execute(func(rowWrap bool, position []int, facing int) ([]int, int) {
		// 	f := facings[facing]
		// 	if rowWrap {
		// 		if f[1] < 0 {
		// 			position[1] = len(board)
		// 		} else if f[1] > 0 {
		// 			position[1] = -1
		// 		}
		// 	} else {
		// 		if f[0] < 0 {
		// 			position[0] = len(board[position[1]])
		// 		} else if f[0] > 0 {
		// 			position[0] = -1
		// 		}
		// 	}
		// 	return position, facing
		// })
		// score := (1000 * (position[1] + 1)) + (4 * (position[0] + 1)) + facing
		// fmt.Println(position, facing)
		// fmt.Println(score)
	}

	part2 := func() {
		position, facing := execute(func(position []int, facing int) ([]int, int) {
			f := facings[facing]
			// fmt.Println("before", position, f, rowWrap)
			if f[0] == 0 {
				if f[1] < 0 {
					if position[0] < 50 {
						return []int{49, position[0] + 50}, 0 // A
					} else if position[0] < 100 {
						return []int{-1, position[0] + 100}, 0 // B
					} else if position[0] < 150 {
						return []int{position[0] - 100, 200}, 3 // C
					}
				} else if f[1] > 0 {
					if position[0] < 50 {
						return []int{position[0] + 100, -1}, 1 // C
					} else if position[0] < 100 {
						return []int{50, position[0] + 100}, 2 // D
					} else if position[0] < 150 {
						return []int{100, position[0] - 50}, 2 // E
					}
				}
			} else {
				if f[0] < 0 {
					if position[1] < 50 {
						return []int{-1, 149 - position[1]}, 0 // F
					} else if position[1] < 100 {
						return []int{position[1] - 50, 99}, 1 // A
					} else if position[1] < 150 {
						return []int{50, 149 - position[1]}, 0 // F
					} else if position[1] < 200 {
						return []int{position[1] - 100, -1}, 1 // B
					}
				} else if f[0] > 0 {
					if position[1] < 50 {
						return []int{100, 149 - position[1]}, 2 // G
					} else if position[1] < 100 {
						return []int{position[1] + 50, 50}, 3 // E
					} else if position[1] < 150 {
						return []int{150, 149 - position[1]}, 2 // G
					} else if position[1] < 200 {
						return []int{position[1] - 100, 150}, 3 // D
					}
				}
			}
			fmt.Println(position, f)
			panic("todo")
			return position, facing
		})
		score := (1000 * (position[1] + 1)) + (4 * (position[0] + 1)) + facing
		fmt.Println(position, facing)
		fmt.Println(score)
	}

	part1()
	part2() // 134228-197055

	fmt.Println("done")
}
