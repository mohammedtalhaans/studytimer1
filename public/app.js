// --- tiny router ---
const pages = {
  focus: document.getElementById('page-focus'),
  notes: document.getElementById('page-notes'),
  tasks: document.getElementById('page-tasks'),
};
document.querySelectorAll('nav button').forEach((b) =>
  b.addEventListener('click', () => show(b.dataset.page))
);
function show(name) {
  Object.values(pages).forEach((el) => el.classList.remove('visible'));
  pages[name].classList.add('visible');
}


// --- timer (25:00) with localStorage persistence ---
// ---------------- Robust Timer ----------------
const DEFAULT_DURATION = 25 * 60; // 25 minutes

let remaining = loadNum('timerRemaining', DEFAULT_DURATION);
let running = false;
let timerId = null;

const timeEl = document.getElementById('time');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');

function fmt(sec) {
  const m = String(Math.floor(sec / 60)).padStart(2, '0');
  const s = String(sec % 60).padStart(2, '0');
  return `${m}:${s}`;
}

function renderTime() {
  timeEl.textContent = fmt(remaining);
}

function tick() {
  if (!running) return;
  if (remaining > 0) {
    remaining -= 1;
    saveNum('timerRemaining', remaining);
    renderTime();
  } else {
    stop(); // ensure we clear the interval
    alert('Time up! Nice work.');
  }
}

function start() {
  console.log('[timer] start clicked');
  if (running) return;
  if (!Number.isFinite(remaining) || remaining <= 0) {
    remaining = DEFAULT_DURATION; // recover if bad value was stored
    saveNum('timerRemaining', remaining);
    renderTime();
  }
  running = true;
  timerId = setInterval(tick, 1000);
  console.log('[timer] started');
}

function pause() {
  console.log('[timer] pause clicked');
  if (!running) return;
  running = false;
  clearInterval(timerId);
  timerId = null;
  console.log('[timer] paused');
}

function stop() {
  running = false;
  clearInterval(timerId);
  timerId = null;
}

function reset() {
  console.log('[timer] reset clicked');
  stop();
  remaining = DEFAULT_DURATION;
  saveNum('timerRemaining', remaining);
  renderTime();
}

startBtn.addEventListener('click', start);
pauseBtn.addEventListener('click', pause);
resetBtn.addEventListener('click', reset);

renderTime();


// --- notes (localStorage) ---
const notesEl = document.getElementById('notes');
const saveNotesBtn = document.getElementById('saveNotes');
notesEl.value = localStorage.getItem('notes') || '';
saveNotesBtn.onclick = () => {
  localStorage.setItem('notes', notesEl.value);
  saveNotesBtn.textContent = 'Saved!'; setTimeout(() => (saveNotesBtn.textContent = 'Save Notes'), 800);
};

// --- tasks (localStorage) ---
const taskInput = document.getElementById('taskText');
const addTaskBtn = document.getElementById('addTask');
const taskList = document.getElementById('taskList');

let tasks = loadJSON('tasks', []);
function renderTasks() {
  taskList.innerHTML = '';
  tasks.forEach((t, i) => {
    const li = document.createElement('li');
    if (t.done) li.style.opacity = 0.6;
    li.innerHTML = `
      <span>${t.text}</span>
      <span>
        <button data-act="toggle" data-i="${i}">${t.done ? '↺' : '✓'}</button>
        <button data-act="del" data-i="${i}">🗑</button>
      </span>
    `;
    taskList.appendChild(li);
  });
}
renderTasks();

addTaskBtn.onclick = () => {
  const text = taskInput.value.trim(); if (!text) return;
  tasks.push({ text, done: false }); saveJSON('tasks', tasks);
  taskInput.value = ''; renderTasks();
};
taskList.onclick = (e) => {
  const btn = e.target.closest('button'); if (!btn) return;
  const i = Number(btn.dataset.i);
  if (btn.dataset.act === 'toggle') tasks[i].done = !tasks[i].done;
  if (btn.dataset.act === 'del') tasks.splice(i, 1);
  saveJSON('tasks', tasks); renderTasks();
};

// --- tiny storage helpers ---
function loadJSON(k, fb) { 
    try { return JSON.parse(localStorage.getItem(k)) ?? fb; } catch { return fb; } 
}
function saveJSON(k, v) { 
    localStorage.setItem(k, JSON.stringify(v)); 
}
function loadNum(k, fb) {
     const n = Number(localStorage.getItem(k)); return Number.isFinite(n) ? n : fb; 
    }
function loadNum(key, fallback) {
  const raw = localStorage.getItem(key);
  if (raw === null) return fallback;           // nothing saved yet
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : fallback; // ignore 0/NaN
}
function saveNum(key, v) {
  localStorage.setItem(key, String(v));
}


