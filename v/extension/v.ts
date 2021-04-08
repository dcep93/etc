const ensure_retry_delay = 3000; // ms
const v_delay = 1000; // ms
const select_delay = 100; // ms
const post_delay = 100; // ms
const maybe_loop_delay = 2000; // ms
const enter_address_delay = 300; // ms
const location_continue_delay = 1500; // ms
const check_for_appointments_delay = 1000; // ms
const find_time_delay = 1000;

function reset() {
  location.href = "https://myturn.ca.gov/";
}

function v() {
  fields.eligibilityQuestionResponse.find(
    (i) => i.id === "q.screening.eligibility.industry"
  ).value = "Education and childcare";
  if (location.href === "https://myturn.ca.gov/") {
    ensure(advance, v_delay);
  } else {
    reset();
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
        setTimeout(() => ensureH(f, retries - 1), ensure_retry_delay);
      } else {
        reset();
      }
    });
}

function advance() {
  Array.from(document.getElementsByTagName("button"))
    .find((e) => e.innerText == "Register and check my eligibility")
    .click();

  ensure(select, select_delay);
}

function runInPage(f) {
  const script = document.createElement("script");
  script.innerHTML = `${f.toString()};${f.name}();`;
  document.body.appendChild(script);
}

function updateSelects() {
  Array.from(document.getElementsByTagName("select")).forEach((e) => {
    const key = Object.keys(e).find((k) => k.indexOf("__reactProps$") === 0);
    e[key].onChange({ target: e });
  });
}

function select() {
  fields.eligibilityQuestionResponse.forEach((obj) => {
    const elem = document.getElementById(obj.id.replace(/\./g, "-"));
    if (obj.type === "multi-select") {
      elem.click();
    } else if (elem.tagName === "SELECT") {
      (elem as HTMLSelectElement).value = obj.value as string;
    } else if (obj.type === "single-select") {
      Array.from(elem.parentElement.getElementsByTagName("input"))
        .find((e) => e.value == obj.value)
        .click();
    } else if (obj.type === undefined) {
    }
  });

  runInPage(updateSelects);

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
    reset();
  } else if (location.href === "https://myturn.ca.gov/error") {
    reset();
  } else if (location.href === "https://myturn.ca.gov/location-search") {
    ensure(enter_address, enter_address_delay);
  } else {
    alert(new Date());
  }
}

function enter_address() {
  const inputE = document.getElementById(
    "location-search-input"
  ) as HTMLInputElement;
  inputE.value = "San Francisco, CA 94117, USA";
  runInPage(receiveAddress);

  ensure(location_continue, location_continue_delay);
}

function receiveAddress() {
  const e = document.getElementById("location-search-input");
  const key = Object.keys(e).find((k) => k.indexOf("__reactProps$") === 0);
  e[key].onChange({ target: e });
}

function location_continue() {
  Array.from(document.getElementsByTagName("button"))
    .find((i) => i.innerText === "Continue")
    .click();

  ensure(check_for_appointments, check_for_appointments_delay);
}

function check_for_appointments() {
  const moscone = Array.from(document.getElementsByTagName("div"))
    .filter((i) => i.getAttribute("data-testid") === "location-select-location")
    .find((i) =>
      i.getElementsByTagName("h2")[0].innerText.includes("Moscone Center")
    );
  if (!moscone) {
    reset();
    return;
  }
  moscone.parentElement.getElementsByTagName("button")[0].click();

  ensure(find_time, find_time_delay);
}

function find_time() {
  const appointment = Array.from(document.getElementsByTagName("button")).find(
    (i) => i.getAttribute("data-testid") === "appointment-select-timeslot"
  );
  if (!appointment) {
    reset();
    return;
  }
  document.title = `(!) ${document.title}`;
  console.log(appointment);
  alert(new Date());
}

function hash_code(s: string) {
  return s.split("").reduce((a, b) => {
    a = (a << 5) - a + b.charCodeAt(0);
    return a & a;
  }, 0);
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
