package main

import (
	"bufio"
	"fmt"
	"os"
	"strconv"
	"strings"
)

// fswatch . | grep --line-buffered -v '\.tmp$' | (while read f; do clear; ls *.py | sort | tail -n 1 | xargs python3 ; done )
// fswatch . | grep --line-buffered -v '\.tmp$' | (while read f; do clear; go run . ; done )

func main() {
	_25()
}

func getLines(fileName string) []string {
	readFile, err := os.Open(fileName)
	if err != nil {
		panic(err)
	}
	defer readFile.Close()

	fileScanner := bufio.NewScanner(readFile)

	fileScanner.Split(bufio.ScanLines)

	var lines []string
	for fileScanner.Scan() {
		line := fileScanner.Text()
		lines = append(lines, line)
	}

	return lines
}

func getInts(s string) []int {
	parts := strings.Split(s, ",")
	var ints []int
	for _, part := range parts {
		i, err := strconv.Atoi(part)
		if err != nil {
			panic(err)
		}
		ints = append(ints, i)
	}
	return ints
}

func v(o interface{}) string {
	return fmt.Sprintf("%v", o)
}
