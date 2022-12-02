package main

import (
	"bufio"
	"fmt"
	"os"
	"sort"
	"strconv"
)

func main() {
    readFile, err := os.Open("01.txt")
	if err != nil {
		panic(err)
	}

    fileScanner := bufio.NewScanner(readFile)
 
    fileScanner.Split(bufio.ScanLines)
  
	current := 0
	var sums []int
    for fileScanner.Scan() {
        line := fileScanner.Text()
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
  
    readFile.Close()
}
