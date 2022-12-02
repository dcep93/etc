package main

import (
	"bufio"
	"os"
)

func getLines(fileName string) []string {
	readFile, err := os.Open("01.txt")
	if err != nil {
		panic(err)
	}

    fileScanner := bufio.NewScanner(readFile)
 
    fileScanner.Split(bufio.ScanLines)

	var lines []string
    for fileScanner.Scan() {
        line := fileScanner.Text()
		lines = append(lines, line)
    }


    readFile.Close()

	return lines
}
