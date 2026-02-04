// -------------------- Data --------------------
const VIDEO = {
  "Goblet Squat": "MeIiIdhvXT4",
  "DB Romanian Deadlift": "hQgFixeXdZo",
  "Walking DB Lunges": "ReNofXwy_js",
  "Lateral Lunges": "4NlJdSzHeUg",
  "Calf Raises": "k8ipHzKeAkQ",

  "Neutral-Grip DB Bench": "Oq5MMAbUE2o",
  "Incline DB Press": "8iPEnn-ltC8",
  "Single-Arm Landmine Press": "hhQdExaLUuU",
  "DB Lateral Raises": "3VcKaXpzqRo",
  "Core Rotation (woodchop/med-ball)": "yPvAj_X_5NM",

  "Neutral-Grip Lat Pulldown": "4P3-TXbH4tw",
  "1-Arm DB Row": "PgpQ4-jHiq4",
  "Seated Cable Row (neutral handle)": "qqZHnqzvbXs",
  "Face Pulls": "eFxMixk_qPQ",
  "Hammer Curls": "zC3nLlEvin4",
  "Farmer Carries": "lLAw6fUccKA"
};

const program = {
  day1: {
    title: "Day 1 — Lower Body Power",
    lifts: [
      { name: "Goblet Squat", sets: 4, repRange: "6–10" },
      { name: "DB Romanian Deadlift", sets: 3, repRange: "8–10" },
      { name: "Walking DB Lunges", sets: 3, repRange: "10/leg" },
      { name: "Lateral Lunges", sets: 3, repRange: "8/side" },
      { name: "Calf Raises", sets: 3, repRange: "15–20" }
    ],
    noteHint: "Off-season: build strength + clean technique. RPE 7–8 most sets."
  },
  day2: {
    title: "Day 2 — Upper Push + Rotation",
    lifts: [
      { name: "Neutral-Grip DB Bench", sets: 4, repRange: "6–10" },
      { name: "Incline DB Press", sets: 3, repRange: "8–12" },
      { name: "Single-Arm Landmine Press", sets: 3, repRange: "6–8/side" },
      { name: "DB Lateral Raises", sets: 3, repRange: "12–15" },
      { name: "Core Rotation (woodchop/med-ball)", sets: 3, repRange: "8–12/side" }
    ],
    noteHint: "Neutral grips only (wrist-friendly). Stop any set if wrist pain."
  },
  day3: {
    title: "Day 3 — Pull + Core + Grip",
    lifts: [
      { name: "Neutral-Grip Lat Pulldown", sets: 4, repRange: "8–12" },
      { name: "1-Arm DB Row", sets: 3, repRange: "8–12/side" },
      { name: "Seated Cable Row (neutral handle)", sets: 3, repRange: "10–12" },
      { name: "Face Pulls", sets: 3, repRange: "12–15" },
      { name: "Hammer Curls", sets: 3, repRange: "10–12" },
      { name: "Farmer Carries", sets: 3, repRange: "30–45 sec" }
    ],
    noteHint: "Posture wins: ribs down, shoulders controlled, no swinging."
  }
};

// -------------------- Storage Keys --------------------
function keyFor(day){ return `lifttracker:draft:${day}`; }
function histKey(){ return `lifttracker:history`; }
function profileKey(){ return `lifttracker:profile`; }

// -------------------- Helpers --------------------
function today(){
  const d = new Date();
  return d.toISOString().slice(0,10);
}

function loadDraft(day){
  const raw = localStorage.getItem(keyFor(day));
  if (!raw) return { date: today(), rpe: "7", entries: {}, notes: "" };
  return JSON.parse(raw);
}

function saveDraft(day, draft){
  localStorage.setItem(keyFor(day), JSON.stringify(draft));
}

function loadProfile(){
  const raw = localStorage.getItem(profileKey());
  if (!raw){
    return {
      name: "",
      age: "",
      height: "",
      weight: "",
      footballPosition: "",
      golfHanded: "Right",
      hockeyPosition: "",
      season: "Off-season",
      wristNote: "No straight bars (wrist mobility)"
    };
  }
  return JSON.parse(raw);
}

function saveProfile(p){
  localStorage.setItem(profileKey(), JSON.stringify(p));
  updateProfileBadge(p);
}

function updateProfileBadge(p){
  const badgeName = document.getElementById("badgeName");
  const badgeMeta = document.getElementById("badgeMeta");
  badgeName.textContent = (p.name && p.name.trim()) ? p.name.trim() : "Player";
  badgeMeta.textContent = p.season || "Off-season";
}

// -------------------- Video Modal --------------------
const modal = document.getElementById("videoModal");
const videoFrame = document.getElementById("videoFrame");
const videoTitle = document.getElementById("videoTitle");
const videoClose = document.getElementById("videoClose");
const videoCloseBtn = document.getElementById("videoCloseBtn");

function openVideo(liftName){
  const id = VIDEO[liftName];
  if (!id){
    alert("No built-in video for this exercise yet.");
    return;
  }
  videoTitle.textContent = liftName;
  // youtube-nocookie for privacy; plays inside the app UI
  videoFrame.src = `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1`;
  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");
}

function closeVideo(){
  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden", "true");
  videoFrame.src = ""; // stop playback
}

videoClose.addEventListener("click", closeVideo);
videoCloseBtn.addEventListener("click", closeVideo);

// -------------------- App State --------------------
const state = {
  active: "day1",
  draft: loadDraft("day1"),
  profile: loadProfile()
};

updateProfileBadge(state.profile);

// -------------------- Rendering --------------------
function render(){
  document.querySelectorAll(".tab").forEach(b => {
    b.classList.toggle("active", b.dataset.day === state.active);
  });

  const view = document.getElementById("view");
  view.innerHTML = "";

  if (state.active === "history"){
    renderHistory(view);
    return;
  }

  if (state.active === "profile"){
    renderProfile(view);
    return;
  }

  renderDay(view);
}

function renderDay(view){
  const day = state.active;
  const cfg = program[day];
  const draft = state.draft;

  const top = document.createElement("section");
  top.className = "card";
  top.innerHTML = `
    <h2>${cfg.title}</h2>
    <div class="row">
      <div>
        <label>Date</label>
        <input type="date" id="date" value="${draft.date}">
      </div>
      <div>
        <label>Session RPE (avg)</label>
        <select id="rpe">
          ${["6","7","8","9"].map(v => `<option value="${v}" ${draft.rpe===v?"selected":""}>${v}</option>`).join("")}
        </select>
      </div>
      <div>
        <label>Rule</label>
        <input value="Reps → then +5 lb" disabled>
      </div>
    </div>
    <p class="small">${cfg.noteHint}</p>
  `;
  view.appendChild(top);

  cfg.lifts.forEach(lift => {
    const c = document.createElement("section");
    c.className = "card";

    const entries = draft.entries[lift.name] || [];
    const rows = Array.from({length: lift.sets}).map((_, i) => {
      const e = entries[i] || { weight:"", reps:"" };
      return `
        <div class="row">
          <div>
            <label>Set ${i+1} Weight</label>
            <input inputmode="decimal" data-lift="${lift.name}" data-set="${i}" data-field="weight" value="${e.weight}">
          </div>
          <div>
            <label>Set ${i+1} Reps</label>
            <input inputmode="numeric" data-lift="${lift.name}" data-set="${i}" data-field="reps" value="${e.reps}">
          </div>
          <div>
            <label>Target</label>
            <input value="${lift.repRange}" disabled>
          </div>
        </div>
      `;
    }).join("");

    const hasVideo = !!VIDEO[lift.name];

    c.innerHTML = `
      <div class="liftHeader">
        <h2 style="margin:0;">${lift.name}</h2>
        <button class="videoBtn" ${hasVideo ? "" : "disabled"} data-video="${lift.name}">
          ${hasVideo ? "▶︎ Video" : "No Video"}
        </button>
      </div>
      ${rows}
      <p class="small">Progression: If all sets hit top reps with clean form → add 5 lb next time.</p>
    `;
    view.appendChild(c);
  });

  const notes = document.createElement("section");
  notes.className = "card";
  notes.innerHTML = `
    <h2>Notes</h2>
    <label>Anything to remember (wrist, soreness, sports practice, sleep)</label>
    <textarea id="notes" placeholder="Example: wrist felt fine, hockey practice hard">${draft.notes||""}</textarea>
  `;
  view.appendChild(notes);

  // Bind top controls
  view.querySelector("#date").addEventListener("change", e => {
    state.draft.date = e.target.value; persist();
  });
  view.querySelector("#rpe").addEventListener("change", e => {
    state.draft.rpe = e.target.value; persist();
  });
  view.querySelector("#notes").addEventListener("input", e => {
    state.draft.notes = e.target.value; persist();
  });

  // Bind set inputs
  view.querySelectorAll("input[data-lift]").forEach(inp => {
    inp.addEventListener("input", e => {
      const liftName = e.target.dataset.lift;
      const setIdx = Number(e.target.dataset.set);
      const field = e.target.dataset.field;

      if (!state.draft.entries[liftName]) state.draft.entries[liftName] = [];
      if (!state.draft.entries[liftName][setIdx]) state.draft.entries[liftName][setIdx] = { weight:"", reps:"" };

      state.draft.entries[liftName][setIdx][field] = e.target.value;
      persist();
    });
  });

  // Bind video buttons
  view.querySelectorAll("button[data-video]").forEach(btn => {
    btn.addEventListener("click", () => openVideo(btn.dataset.video));
  });
}

function renderProfile(view){
  const p = state.profile;

  const card = document.createElement("section");
  card.className = "card";
  card.innerHTML = `
    <h2>Player Profile</h2>

    <div class="row">
      <div>
        <label>Name</label>
        <input id="p_name" placeholder="e.g., Jake" value="${p.name}">
      </div>
      <div>
        <label>Age</label>
        <input id="p_age" inputmode="numeric" placeholder="e.g., 15" value="${p.age}">
      </div>
      <div>
        <label>Season</label>
        <select id="p_season">
          ${["Off-season","In-season"].map(v => `<option value="${v}" ${p.season===v?"selected":""}>${v}</option>`).join("")}
        </select>
      </div>
    </div>

    <div class="row">
      <div>
        <label>Height</label>
        <input id="p_height" placeholder="e.g., 5'10&quot;" value="${p.height}">
      </div>
      <div>
        <label>Weight</label>
        <input id="p_weight" placeholder="e.g., 155 lb" value="${p.weight}">
      </div>
      <div>
        <label>Wrist note</label>
        <input id="p_wrist" value="${p.wristNote}">
      </div>
    </div>

    <div class="row">
      <div>
        <label>Football position</label>
        <input id="p_fb" placeholder="e.g., RB, LB, OL" value="${p.footballPosition}">
      </div>
      <div>
        <label>Hockey position</label>
        <input id="p_hk" placeholder="e.g., C, W, D" value="${p.hockeyPosition}">
      </div>
      <div>
        <label>Golf handed</label>
        <select id="p_golf">
          ${["Right","Left"].map(v => `<option value="${v}" ${p.golfHanded===v?"selected":""}>${v}</option>`).join("")}
        </select>
      </div>
    </div>

    <p class="small">
      This info is stored only on this iPhone (local storage). No accounts needed.
      For off-season, keep most sets at RPE 7–8 and progress weekly.
    </p>

    <button id="profileSave" class="primary" style="width:100%;">Save Profile</button>
  `;

  view.appendChild(card);

  view.querySelector("#profileSave").addEventListener("click", () => {
    const updated = {
      name: view.querySelector("#p_name").value,
      age: view.querySelector("#p_age").value,
      height: view.querySelector("#p_height").value,
      weight: view.querySelector("#p_weight").value,
      season: view.querySelector("#p_season").value,
      wristNote: view.querySelector("#p_wrist").value,
      footballPosition: view.querySelector("#p_fb").value,
      hockeyPosition: view.querySelector("#p_hk").value,
      golfHanded: view.querySelector("#p_golf").value
    };
    state.profile = updated;
    saveProfile(updated);
    alert("Profile saved ✅");
  });
}

function persist(){
  saveDraft(state.active, state.draft);
}

function saveWorkoutToHistory(){
  const hist = JSON.parse(localStorage.getItem(histKey()) || "[]");
  hist.unshift({
    day: state.active,
    ...state.draft,
    profileSnapshot: state.profile,
    savedAt: new Date().toISOString()
  });
  localStorage.setItem(histKey(), JSON.stringify(hist.slice(0, 200)));
}

function renderHistory(view){
  const hist = JSON.parse(localStorage.getItem(histKey()) || "[]");
  const card = document.createElement("section");
  card.className = "card";
  card.innerHTML = `<h2>History</h2><p class="small">Saved workouts live only on this iPhone.</p>`;
  const list = document.createElement("div");
  list.className = "list";

  if (hist.length === 0){
    list.innerHTML = `<div class="item">No saved workouts yet. Save one from a Day tab.</div>`;
  } else {
    list.innerHTML = hist.map(w => `
      <div class="item">
        <b>${program[w.day]?.title || w.day} — ${w.date}</b>
        <div class="small">
          RPE: ${w.rpe} • Player: ${(w.profileSnapshot?.name||"Player")} • Saved: ${new Date(w.savedAt).toLocaleString()}
        </div>
        <div class="small">${(w.notes||"").slice(0,120)}${(w.notes||"").length>120?"…":""}</div>
      </div>
    `).join("");
  }

  card.appendChild(list);
  view.appendChild(card);
}

// -------------------- Nav & Buttons --------------------
document.querySelectorAll(".tab").forEach(b => {
  b.addEventListener("click", () => {
    state.active = b.dataset.day;

    if (state.active === "history") {
      state.draft = null;
    } else if (state.active === "profile") {
      state.draft = null;
    } else {
      state.draft = loadDraft(state.active);
    }

    render();
  });
});

document.getElementById("saveWorkout").addEventListener("click", () => {
  if (state.active === "history" || state.active === "profile") return;
  saveWorkoutToHistory();
  alert("Workout saved to History ✅");
});

document.getElementById("resetDay").addEventListener("click", () => {
  if (state.active === "history" || state.active === "profile") return;
  if (!confirm("Reset this day? This clears the draft for this day.")) return;
  localStorage.removeItem(keyFor(state.active));
  state.draft = loadDraft(state.active);
  render();
});

// Tap badge to go to Profile
document.getElementById("profileBadge").addEventListener("click", () => {
  state.active = "profile";
  render();
});

render();
