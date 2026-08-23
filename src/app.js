import { keyOf, nextGenerationWithRule, parseKey, patternInfo, patterns, translate, variations } from "./life.js";

const canvas = document.querySelector("#grid");
const context = canvas.getContext("2d");
const generationLabel = document.querySelector("#generation");
const populationLabel = document.querySelector("#population");
const playButton = document.querySelector("#play");
const speedInput = document.querySelector("#speed");
const speedLabel = document.querySelector("#speed-label");
const variationSelect = document.querySelector("#variation");

let cells = new Map([...translate(patterns.glider, 12, 18)].map((key) => [key, 1]));
let modeKey = "conway";
let specimenKey = "glider";
let ant = { row: 14, column: 20, direction: 0 };
let generation = 0;
let running = false;
let timer;
let cellSize = 22;
let originX = 0;
let originY = 0;
let drawing = false;
let drawingValue = true;
let panning = false;
let spaceDown = false;
let previousPointer = null;

const liveSet = () => new Set([...cells].filter(([, state]) => state === 1).map(([key]) => key));

function resize() {
  const box = canvas.getBoundingClientRect();
  const scale = window.devicePixelRatio || 1;
  canvas.width = Math.round(box.width * scale);
  canvas.height = Math.round(box.height * scale);
  context.setTransform(scale, 0, 0, scale, 0, 0);
  draw();
}

function drawCell(row, column, color, inset = 2) {
  const x = originX + column * cellSize;
  const y = originY + row * cellSize;
  if (x > -cellSize && y > -cellSize && x < canvas.clientWidth && y < canvas.clientHeight) {
    context.fillStyle = color;
    context.fillRect(x + inset, y + inset, cellSize - inset * 2, cellSize - inset * 2);
  }
}

function draw() {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  context.fillStyle = "#0c0f0d";
  context.fillRect(0, 0, width, height);
  context.strokeStyle = "#242925";
  context.lineWidth = 1;
  const startX = ((originX % cellSize) + cellSize) % cellSize;
  const startY = ((originY % cellSize) + cellSize) % cellSize;
  context.beginPath();
  for (let x = startX; x < width; x += cellSize) { context.moveTo(x, 0); context.lineTo(x, height); }
  for (let y = startY; y < height; y += cellSize) { context.moveTo(0, y); context.lineTo(width, y); }
  context.stroke();

  const palette = modeKey === "wireworld" ? [null, "#d7a83e", "#65d9ff", "#ef596f"] : [null, "#b8f34a", "#667068"];
  for (const [key, state] of cells) {
    const [row, column] = parseKey(key);
    drawCell(row, column, palette[state] ?? "#b8f34a");
  }
  if (modeKey === "langton") drawCell(ant.row, ant.column, "#ff6b57", Math.max(3, cellSize * 0.22));
  generationLabel.textContent = String(generation).padStart(4, "0");
  populationLabel.textContent = String(cells.size).padStart(3, "0");
}

function countNeighbours(state) {
  const counts = new Map();
  for (const [key, value] of cells) {
    if (value !== state) continue;
    const [row, column] = parseKey(key);
    for (let dr = -1; dr <= 1; dr += 1) for (let dc = -1; dc <= 1; dc += 1) {
      if (dr === 0 && dc === 0) continue;
      const neighbour = keyOf(row + dr, column + dc);
      counts.set(neighbour, (counts.get(neighbour) ?? 0) + 1);
    }
  }
  return counts;
}

function stepBrian() {
  const counts = countNeighbours(1);
  const next = new Map();
  for (const [key, state] of cells) if (state === 1) next.set(key, 2);
  for (const [key, count] of counts) if (!cells.has(key) && count === 2) next.set(key, 1);
  cells = next;
}

function stepWireworld() {
  const headCounts = countNeighbours(2);
  const next = new Map();
  for (const [key, state] of cells) {
    if (state === 2) next.set(key, 3);
    else if (state === 3) next.set(key, 1);
    else next.set(key, [1, 2].includes(headCounts.get(key) ?? 0) ? 2 : 1);
  }
  cells = next;
}

function stepAnt() {
  const key = keyOf(ant.row, ant.column);
  const black = cells.has(key);
  ant.direction = (ant.direction + (black ? 3 : 1)) % 4;
  if (black) cells.delete(key); else cells.set(key, 1);
  const moves = [[-1, 0], [0, 1], [1, 0], [0, -1]];
  ant.row += moves[ant.direction][0];
  ant.column += moves[ant.direction][1];
}

function step() {
  const mode = variations[modeKey];
  if (mode.kind === "life") cells = new Map([...nextGenerationWithRule(liveSet(), mode.birth, mode.survival)].map((key) => [key, 1]));
  else if (mode.kind === "brian") stepBrian();
  else if (mode.kind === "wireworld") stepWireworld();
  else stepAnt();
  generation += 1;
  draw();
}

function schedule() { clearInterval(timer); if (running) timer = setInterval(step, 1000 / Number(speedInput.value)); }
function setRunning(value) { running = value; playButton.innerHTML = running ? "Ⅱ <span>Pause</span>" : "▶ <span>Start</span>"; schedule(); }

function explain() {
  const mode = variations[modeKey];
  document.querySelector("#variation-code").textContent = mode.code;
  document.querySelector("#mode-eyebrow").textContent = `CELLULAR AUTOMATA / ${mode.code.replace("/", "·")}`;
  document.querySelector("#rule-name").textContent = mode.name;
  document.querySelector("#rule-summary").textContent = mode.summary;
  document.querySelector("#rule-notation").textContent = mode.kind === "life"
    ? `B${mode.birth.join("")} = birth · S${mode.survival.join("")} = survival`
    : mode.kind === "brian" ? "Green = firing · Grey = recovering · Dark = ready"
      : mode.kind === "wireworld" ? "Gold = wire · Blue = electron head · Red = tail"
        : "Green = black trail · Red = ant · Dark = white square";
  const info = specimenKey ? patternInfo[specimenKey] : [mode.name, mode.summary];
  document.querySelector("#specimen-name").textContent = info[0];
  document.querySelector("#specimen-summary").textContent = info[1];
  document.querySelector("#state-key").textContent = mode.kind === "life" ? "Try this specimen under another rule to reveal a different future." : "This universe starts with its own demonstration.";
}

function seedSpecialMode() {
  cells.clear();
  const rows = Math.floor(canvas.clientHeight / cellSize);
  const columns = Math.floor(canvas.clientWidth / cellSize);
  if (modeKey === "brian") {
    for (let row = 0; row < rows; row += 1) for (let column = 0; column < columns; column += 1) if (Math.random() < 0.18) cells.set(keyOf(row, column), 1);
  } else if (modeKey === "wireworld") {
    const row = Math.floor(rows / 2);
    for (let column = 5; column < columns - 5; column += 1) cells.set(keyOf(row, column), 1);
    cells.set(keyOf(row, 7), 3);
    cells.set(keyOf(row, 8), 2);
  } else if (modeKey === "langton") {
    ant = { row: Math.floor(rows / 2), column: Math.floor(columns / 2), direction: 0 };
  }
}

function cellAt(event) {
  const box = canvas.getBoundingClientRect();
  return [Math.floor((event.clientY - box.top - originY) / cellSize), Math.floor((event.clientX - box.left - originX) / cellSize)];
}

function paint(event) {
  if (modeKey === "langton") return;
  const key = keyOf(...cellAt(event));
  if (drawingValue) cells.set(key, 1); else cells.delete(key);
  draw();
}

canvas.addEventListener("pointerdown", (event) => {
  canvas.setPointerCapture(event.pointerId);
  previousPointer = { x: event.clientX, y: event.clientY };
  if (spaceDown || event.button === 1) { panning = true; return; }
  drawing = true;
  drawingValue = !cells.has(keyOf(...cellAt(event)));
  paint(event);
});
canvas.addEventListener("pointermove", (event) => {
  if (panning) {
    originX += event.clientX - previousPointer.x;
    originY += event.clientY - previousPointer.y;
    previousPointer = { x: event.clientX, y: event.clientY };
    draw();
  } else if (drawing) paint(event);
});
canvas.addEventListener("pointerup", () => { drawing = false; panning = false; });
canvas.addEventListener("wheel", (event) => {
  event.preventDefault();
  const box = canvas.getBoundingClientRect();
  const x = event.clientX - box.left;
  const y = event.clientY - box.top;
  const old = cellSize;
  cellSize = Math.min(48, Math.max(8, cellSize * (event.deltaY < 0 ? 1.12 : 0.89)));
  originX = x - ((x - originX) / old) * cellSize;
  originY = y - ((y - originY) / old) * cellSize;
  draw();
}, { passive: false });

window.addEventListener("keydown", (event) => { if (event.code === "Space") { spaceDown = true; event.preventDefault(); } });
window.addEventListener("keyup", (event) => { if (event.code === "Space") spaceDown = false; });
playButton.addEventListener("click", () => setRunning(!running));
document.querySelector("#step").addEventListener("click", () => { setRunning(false); step(); });
document.querySelector("#clear").addEventListener("click", () => { setRunning(false); cells.clear(); generation = 0; draw(); });
document.querySelector("#randomize").addEventListener("click", () => {
  setRunning(false); generation = 0; seedSpecialMode();
  if (variations[modeKey].kind === "life") {
    cells.clear();
    const rows = Math.ceil(canvas.clientHeight / cellSize);
    const columns = Math.ceil(canvas.clientWidth / cellSize);
    for (let row = 0; row < rows; row += 1) for (let column = 0; column < columns; column += 1) if (Math.random() < 0.24) cells.set(keyOf(row, column), 1);
  }
  draw();
});
speedInput.addEventListener("input", () => { speedLabel.textContent = `${speedInput.value} gen/s`; schedule(); });
variationSelect.addEventListener("change", () => {
  setRunning(false); modeKey = variationSelect.value; specimenKey = null; generation = 0;
  if (variations[modeKey].kind === "life") cells = new Map([...translate(patterns.glider, 12, 18)].map((key) => [key, 1])); else seedSpecialMode();
  explain(); draw();
});
document.querySelectorAll("[data-pattern]").forEach((button) => button.addEventListener("click", () => {
  setRunning(false); generation = 0; specimenKey = button.dataset.pattern;
  if (variations[modeKey].kind !== "life") { modeKey = "conway"; variationSelect.value = modeKey; }
  const pattern = patterns[specimenKey];
  const bounds = pattern.reduce((size, [row, column]) => [Math.max(size[0], row), Math.max(size[1], column)], [0, 0]);
  const row = Math.floor((canvas.clientHeight / cellSize - bounds[0]) / 2);
  const column = Math.floor((canvas.clientWidth / cellSize - bounds[1]) / 2);
  originX = 0; originY = 0; cells = new Map([...translate(pattern, row, column)].map((key) => [key, 1])); explain(); draw();
}));

explain();
new ResizeObserver(resize).observe(canvas.parentElement);
