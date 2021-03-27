const v_delay = 2000; // ms
const select_delay = 2000; // ms
const post_delay = 2000; // ms
const maybe_loop_delay = 2000; // ms
const ensure_delay = 100; // ms

function v() {
  if (location.href === "https://myturn.ca.gov/") {
    ensure(advance, v_delay);
  } else {
    location.href = "https://myturn.ca.gov/";
  }
}

function ensure(f, delay: number) {
  delay = (Math.random() / 2 + 1) * delay;
  setTimeout(() => ensureH(f), delay);
}

function ensureH(f, retries: number = 3) {
  console.log(f.name);
  Promise.resolve()
    .then(f)
    .then(() => console.log("done", f.name))
    .catch((err) => {
      console.error(err);
      if (retries > 0) {
        setTimeout(() => ensureH(f, retries - 1), ensure_delay);
      }
    });
}

function advance() {
  Array.from(document.getElementsByTagName("button"))
    .find((e) => e.innerText == "Register and check my eligibility")
    .click();

  ensure(select, select_delay);
}

function clickableSelects() {
  const script = document.createElement("script");
  script.innerHTML = `${subscript.toString()};subscript();`;
  document.body.appendChild(script);
}

function subscript() {
  Array.from(document.getElementsByTagName("select")).forEach((e) => {
    e.onclick = () => {
      const key = Object.keys(e).find((k) => k.indexOf("__reactProps$") === 0);
      e[key].onChange({ target: e });
    };
  });
}

function select() {
  clickableSelects();
  fields.eligibilityQuestionResponse.forEach((obj) => {
    const elem = document.getElementById(obj.id.replace(/\./g, "-"));
    if (obj.type === "multi-select") {
      elem.click();
    } else if (elem.tagName === "SELECT") {
      (elem as HTMLSelectElement).value = obj.value as string;
      elem.click();
    } else if (obj.type === "single-select") {
      Array.from(elem.parentElement.getElementsByTagName("input"))
        .find((e) => e.value == obj.value)
        .click();
    } else if (obj.type === undefined) {
    }
  });

  ensure(post, post_delay);
}

function post() {
  Array.from(document.getElementsByTagName("button"))
    .find((e) => e.innerText == "Continue")
    .click();

  ensure(maybe_loop, maybe_loop_delay);
}

function maybe_loop() {
  if (location.href === "https://myturn.ca.gov/ineligible-register") {
    location.href = "https://myturn.ca.gov/";
  } else if (location.href === "https://myturn.ca.gov/error") {
    location.href = "https://myturn.ca.gov/";
  } else {
    alert(new Date());
  }
}

var fields = {
  eligibilityQuestionResponse: [
    {
      id: "q.screening.18.yr.of.age",
      value: ["q.screening.18.yr.of.age"],
      type: "multi-select",
    },
    {
      id: "q.screening.health.data",
      value: ["q.screening.health.data"],
      type: "multi-select",
    },
    {
      id: "q.screening.accuracy.attestation",
      value: ["q.screening.accuracy.attestation"],
      type: "multi-select",
    },
    {
      id: "q.screening.privacy.statement",
      value: ["q.screening.privacy.statement"],
      type: "multi-select",
    },
    {
      id: "q.screening.eligibility.age.range",
      value: "16 - 49",
      type: "single-select",
    },
    {
      id: "q.screening.underlying.health.condition",
      value: "No",
      type: "single-select",
    },
    { id: "q.screening.disability", value: "No", type: "single-select" },
    {
      id: "q.screening.eligibility.industry",
      value: "Communications and IT",
      type: "single-select",
    },
    {
      id: "q.screening.eligibility.county",
      value: "San Francisco",
      type: "single-select",
    },
    { id: "q.screening.accessibility.code", type: "text" },
  ],
  url: "https://myturn.ca.gov/screening",
};

v();
