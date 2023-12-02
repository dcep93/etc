package main

import (
	"fmt"
	"strconv"
	"strings"
)

func _21() {
	lines := getLines("21.txt")

	monkeys := make(map[string][]string)

	for _, line := range lines {
		parts := strings.Split(line, ": ")
		monkeys[parts[0]] = strings.Split(parts[1], " ")
	}

	rs := make(map[string]int)
	var getR func(string) int
	getR = func(s string) int {
		if r, ok := rs[s]; ok {
			return r
		}
		m := monkeys[s]
		if len(m) == 1 {
			r, err := strconv.Atoi(m[0])
			if err != nil {
				panic(err)
			}
			rs[s] = r
			return r
		}
		var r int
		a := getR(m[0])
		b := getR(m[2])
		if m[1] == "+" {
			r = a + b
		} else if m[1] == "-" {
			r = a - b
		} else if m[1] == "*" {
			r = a * b
		} else if m[1] == "/" {
			r = a / b
		} else {
			panic(fmt.Sprintf("%v", m))
		}
		rs[s] = r
		return r
	}

	type f struct {
		num []int
		den []int
	}

	reduce := func(ff f) f {
		primes := []int{2, 3, 5, 7}
		for _, p := range primes {
			for {
				b := false
				for _, a := range ff.num {
					if a%p != 0 {
						b = true
						break
					}
				}
				if b {
					break
				}
				for _, a := range ff.den {
					if a%p != 0 {
						b = true
						break
					}
				}
				if b {
					break
				}
				// fmt.Println("reduce", p, ff)
				for i := range ff.num {
					ff.num[i] /= p
				}
				for i := range ff.den {
					ff.den[i] /= p
				}
			}
		}
		return ff
	}

	rss := make(map[string]f)
	var getRs func(string) f
	getRs = func(s string) f {
		if rs, ok := rss[s]; ok {
			return rs
		}
		m := monkeys[s]
		if len(m) == 1 {
			r, err := strconv.Atoi(m[0])
			if err != nil {
				panic(err)
			}
			rs := f{num: []int{r}, den: []int{1}}
			rss[s] = rs
			return rs
		}
		get := func(x []int, i int) int {
			if i < 0 || i >= len(x) {
				return 0
			}
			return x[i]
		}
		mult := func(x []int, y []int) []int {
			m := len(x) + len(y) - 1
			multed := make([]int, m)
			for i := 0; i < len(x); i++ {
				for j := 0; j < len(y); j++ {
					multed[i+j] += x[i] * y[j]
				}
			}
			return multed
		}
		add := func(x []int, y []int) []int {
			var added []int
			for i := 0; i < len(x) || i < len(y); i++ {
				added = append(added, get(x, i)+get(y, i))
			}
			return added
		}
		a := getRs(m[0])
		b := getRs(m[2])
		var ff f
		if m[1] == "+" {
			anum := mult(a.num, b.den)
			bnum := mult(b.num, a.den)
			ff = f{num: add(anum, bnum), den: mult(a.den, b.den)}
		} else if m[1] == "-" {
			anum := mult(a.num, b.den)
			bnum := mult(b.num, a.den)
			bnum = mult(bnum, []int{-1})
			ff = f{num: add(anum, bnum), den: mult(a.den, b.den)}
		} else if m[1] == "*" {
			ff = f{num: mult(a.num, b.num), den: mult(a.den, b.den)}
		} else if m[1] == "/" {
			ff = f{num: mult(a.num, b.den), den: mult(a.den, b.num)}
		} else {
			fmt.Println(a)
			fmt.Println(b)
			panic(fmt.Sprintf("%v", m))
		}
		// fmt.Println("ff", ff, m, a, b)
		ff = reduce(ff)
		rss[s] = ff
		return ff
	}

	part1 := func() {
		return
		r := getR("root")
		fmt.Println(r)
	}

	part2 := func() {
		// monkeys["humn"] = []string{"humn"}
		monkeys["root"][1] = "-"
		rss["humn"] = f{num: []int{0, 1}, den: []int{1}}
		// rss["humn"] = f{num: []int{3330805295850}, den: []int{1}}
		rs := getRs("root")
		if len(rs.den) == 1 {
			rs.den = []int{0}
		}
		rs = reduce(rs)
		fmt.Println(rs)
	}

	part1()
	part2()

	fmt.Println("done")
}
