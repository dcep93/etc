package main

import (
	"fmt"
	"strconv"
	"strings"
)

type obj07 interface {
	getSize() int
}

type dir07 struct {
	children map[string]obj07
	parent   *dir07
}

func (d dir07) getDirs() []dir07 {
	dirs := []dir07{d}
	for _, c := range d.children {
		child_dir, ok := c.(dir07)
		if ok {
			dirs = append(dirs, child_dir.getDirs()...)
		}
	}
	return dirs
}

func (d dir07) getSize() int {
	s := 0
	for _, c := range d.children {
		s += c.getSize()
	}
	return s
}

type file07 struct {
	size int
}

func (f file07) getSize() int {
	return f.size
}

func _07() {
	lines := getLines("07.txt")

	newDir := func(parent *dir07) dir07 {
		children := make(map[string]obj07)
		return dir07{children: children, parent: parent}
	}

	getRoot := func() dir07 {
		root := newDir(nil)
		ls := false
		current := &root
		for _, line := range lines {
			// fmt.Println(line, current.children)
			parts := strings.Split(line, " ")
			if parts[0] == "$" {
				ls = false
				if parts[1] == "ls" {
					ls = true
				} else {
					dest := parts[2]
					if dest == "/" {
						current = &root
					} else if dest == ".." {
						current = current.parent
					} else {
						cd := current.children[dest].(dir07)
						current = &cd
					}
				}
			} else if ls {
				name := parts[1]
				if _, ok := current.children[name]; !ok {
					var o obj07
					if parts[0] == "dir" {
						o = newDir(current)
					} else {
						size, err := strconv.Atoi(parts[0])
						if err != nil {
							panic(err)
						}
						o = file07{size: size}
					}
					current.children[name] = o
				}
			}
		}
		return root
	}

	part1 := func() {
		limit := 100000
		s := 0
		root := getRoot()
		for _, d := range root.getDirs() {
			size := d.getSize()
			if size <= limit {
				s += size
			}
		}
		fmt.Println(s)
	}

	part2 := func() {
		total := 70000000
		needed := 30000000
		root := getRoot()
		to_delete := root.getSize() + needed - total
		m := 0
		for _, d := range root.getDirs() {
			size := d.getSize()
			if size >= to_delete {
				if m == 0 || size < m {
					m = size
				}
			}
		}
		fmt.Println(m)
	}

	part1()
	part2()
}
