function main() {
  const bank = document.getElementById("wordle.txt").innerHTML;
  const m = /^[a-z]{5}$/;
  const words = bank
    .split("\n")
    .map((w) => w.toLowerCase())
    .map((w) => w.split("(")[0])
    .filter((w) => w.match(m));
  setInterval(() => run(words), 1000);
}

function a(arr) {
  alert([arr.length].concat(arr).join("\n"));
}

function run(words) {
  const board =
    document.getElementById("wordle-app-game").children[0].children[0];
  const data = Array.from(board.children)
    .map((row) => ({
      row,
      cells: Array.from(row.children)
        .map((cell) => cell.children[0])
        .map((cell) => ({
          state: cell.getAttribute("data-state"),
          value: cell.innerHTML,
        })),
    }))
    .map(({ row, cells }) => ({
      row,
      states: cells.map(({ state }) => state),
      letters: cells.map(({ value }) => value).join(""),
    }));
  data.forEach(({ row }, i) => {
    row.onclick = () =>
      a(
        words.filter(
          (word) =>
            data.slice(0, i + 1).filter(({ letters, states }) => {
              // return true if impossible
              for (let j = 0; j < states.length; j++) {
                if (states[j] === "correct") {
                  if (word[j] !== letters[j]) return true;
                  continue;
                }
                if (
                  Array.from(word)
                    .map((letter, index) =>
                      states[index] === "correct"
                        ? 0
                        : letters[index] === letters[j] &&
                          states[index] === "present"
                        ? -1
                        : letter === letters[j]
                        ? 1
                        : 0
                    )
                    .reduce((a, b) => a + b, 0) !== 0
                )
                  return true;
                if (states[j] === "present") {
                  if (word[j] === letters[j]) return true;
                }
                if (states[j] === "absent") {
                }
              }
              return false;
            }).length === 0
        )
      );
  });
}

main();
