function loop() {
  Promise.resolve()
    .then(main)
    .then(() => setTimeout(loop, 1000));
}

function main() {
  return Promise.resolve()
    .then(() => document.getElementsByClassName("Posting"))
    .then(Array.from)
    .then((postings) =>
      postings
        .map((posting) => ({
          posting,
          query: posting.onclick.toString().split("'")[1],
        }))
        .filter(({ query }) => query)
        .map(({ posting, query }) => {
          posting.onclick = () =>
            window.open(
              `https://www.buildinglink.com/v2/tenant/Postings/PostingAreas.aspx?${
                query.split("?")[1]
              }`
            );
        })
    );
}

loop();
