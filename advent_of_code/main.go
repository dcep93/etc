package main

// fswatch . | grep --line-buffered -v '\.tmp$' | (while read f; do clear; python3 17.py ; done )
// fswatch . | grep --line-buffered -v '\.tmp$' | (while read f; do clear; go run . ; done )

func main() {
	_20()
}
