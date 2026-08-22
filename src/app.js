import { keyOf, nextGeneration, patterns, translate } from "./life.js";

const canvas = document.querySelector("#grid");
const context = canvas.getContext("2d");
const generationLabel = document.querySelector("#generation");
const populationLabel = document.querySelector("#population");
const playButton = document.querySelector("#play");
const speedInput = document.querySelector("#speed");
const speedLabel = document.querySelector("#speed-label");

let liveCells = translate(patterns.glider, 12, 18);
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

function resize() {
  const box = canvas.getBoundingClientRect();
  const scale = window.devicePixelRatio || 1;
  canvas.width = Math.round(box.width * scale);
  canvas.height = Math.round(box.height * scale);
  context.setTransform(scale, 0, 0, scale, 0, 0);
  draw();
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

  context.fillStyle = "#b8f34a";
  for (const key of liveCells) {
    const [row, column] = key.split(",").map(Number);
    const x = originX + column * cellSize;
    const y = originY + row * cellSize;
    if (x > -cellSize && y > -cellSize && x < width && y < height) {
      context.fillRect(x + 2, y + 2, cellSize - 4, cellSize - 4);
    }
  }
  generationLabel.textContent = String(generation).padStart(4, "0");
  populationLabel.textContent = String(liveCells.size).padStart(3, "0");
}

function step() {
  liveCells = nextGeneration(liveCells);
  generation += 1;
  draw();
}

function schedule() {
  clearInterval(timer);
  if (running) timer = setInterval(step, 1000 / Number(speedInput.value));
}

function setRunning(value) {
  running = value;
  playButton.innerHTML = running ? "Ⅱ <span>Pause</span>" : "▶ <span>Start</span>";
  schedule();
}

function cellAt(event) {
  const box = canvas.getBoundingClientRect();
  return [Math.floor((event.clientY - box.top - originY) / cellSize), Math.floor((event.clientX - box.left - originX) / cellSize)];
}

function paint(event) {
  const [row, column] = cellAt(event);
  const key = keyOf(row, column);
  if (drawingValue) liveCells.add(key); else liveCells.delete(key);
  draw();
}

canvas.addEventListener("pointerdown", (event) => {
  canvas.setPointerCapture(event.pointerId);
  previousPointer = { x: event.clientX, y: event.clientY };
  if (spaceDown || event.button === 1) { panning = true; return; }
  drawing = true;
  drawingValue = !liveCells.has(keyOf(...cellAt(event)));
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
  const pointerX = event.clientX - box.left;
  const pointerY = event.clientY - box.top;
  const oldSize = cellSize;
  cellSize = Math.min(48, Math.max(8, cellSize * (event.deltaY < 0 ? 1.12 : 0.89)));
  originX = pointerX - ((pointerX - originX) / oldSize) * cellSize;
  originY = pointerY - ((pointerY - originY) / oldSize) * cellSize;
  draw();
}, { passive: false });

window.addEventListener("keydown", (event) => { if (event.code === "Space") { spaceDown = true; event.preventDefault(); } });
window.addEventListener("keyup", (event) => { if (event.code === "Space") spaceDown = false; });
playButton.addEventListener("click", () => setRunning(!running));
document.querySelector("#step").addEventListener("click", () => { setRunning(false); step(); });
document.querySelector("#clear").addEventListener("click", () => { setRunning(false); liveCells.clear(); generation = 0; draw(); });
document.querySelector("#randomize").addEventListener("click", () => {
  setRunning(false); liveCells.clear(); generation = 0;
  const columns = Math.ceil(canvas.clientWidth / cellSize);
  const rows = Math.ceil(canvas.clientHeight / cellSize);
  for (let row = 0; row < rows; row += 1) for (let column = 0; column < columns; column += 1) if (Math.random() < 0.24) liveCells.add(keyOf(row, column));
  draw();
});
speedInput.addEventListener("input", () => { speedLabel.textContent = `${speedInput.value} gen/s`; schedule(); });
document.querySelectorAll("[data-pattern]").forEach((button) => button.addEventListener("click", () => {
  setRunning(false); generation = 0;
  const pattern = patterns[button.dataset.pattern];
  const bounds = pattern.reduce((size, [row, column]) => [Math.max(size[0], row), Math.max(size[1], column)], [0, 0]);
  const centerRow = Math.floor((canvas.clientHeight / cellSize - bounds[0]) / 2);
  const centerColumn = Math.floor((canvas.clientWidth / cellSize - bounds[1]) / 2);
  originX = 0; originY = 0; liveCells = translate(pattern, centerRow, centerColumn); draw();
}));

new ResizeObserver(resize).observe(canvas.parentElement);
