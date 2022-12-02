package main

import (
	"fmt"
	"strings"
)

func _02() {
	loss_score := 0
	draw_score := 3
	win_score := 6
	shape_scores := map[string]int{"X": 1, "Y": 2, "Z": 3}
	wins := map[string]string{"A": "Y", "B": "Z", "C": "X"}
	losses := map[string]string{"A": "Z", "B": "X", "C": "Y"}
	draws := map[string]string{"A": "X", "B": "Y", "C": "Z"}

	getScore := func(p1 string, p2 string) int {
		return shape_scores[p2] + func() int {
			if wins[p1] == p2 {
				return win_score
			} else if losses[p1] == p2 {
				return loss_score
			} else {
				return draw_score
			}
		}()
	}
	lines := getLines("02.txt")

	selector := map[string]map[string]string{"X": losses, "Y": draws, "Z": wins}

	part1Score := 0
	part2Score := 0
	for _, line := range lines {
		parts := strings.Split(line, " ")
		part1Score += getScore(parts[0], parts[1])
		part2Score += getScore(parts[0], selector[parts[1]][parts[0]])
	}

	fmt.Println(part1Score)
	fmt.Println(part2Score)
}
