package main

import (
	"fmt"
	"sort"
	"strconv"
)

func main() {
	lines := getLines("01.txt")
  
	current := 0
	var sums []int
    for i := 0; i < len(lines); i++ {
        line := lines[i]
		if line == "" {
			sums = append(sums, current)
			current = 0
		} else {
			val, err := strconv.Atoi(line)
			if err != nil {
				panic(err)
			}
			current += val
		}
    }

	sort.Ints(sums)
	
	for i, j := 0, len(sums)-1; i < j; i, j = i+1, j-1 {
		sums[i], sums[j] = sums[j], sums[i]
	}
	
	fmt.Println(sums[0])
	fmt.Println(sums[0] + sums[1] + sums[2])
}
