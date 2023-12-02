setInterval(() => {
  if (
    document.body.innerText.includes(
      "Tickets are sold out now. Check back soon."
    )
  ) {
    document.body.innerHTML = "reloading...";
    setTimeout(() => location.reload(), 3000);
  }
});
