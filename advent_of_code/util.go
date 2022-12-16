package main

import (
	"bufio"
	"os"
	"strconv"
	"strings"
)

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
