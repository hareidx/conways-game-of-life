export const keyOf = (row, column) => `${row},${column}`;

export function parseKey(key) {
  return key.split(",").map(Number);
}

export function nextGenerationWithRule(liveCells, birth = [3], survival = [2, 3]) {
  const neighbourCounts = new Map();

  for (const key of liveCells) {
    const [row, column] = parseKey(key);
    for (let rowOffset = -1; rowOffset <= 1; rowOffset += 1) {
      for (let columnOffset = -1; columnOffset <= 1; columnOffset += 1) {
        if (rowOffset === 0 && columnOffset === 0) continue;
        const neighbour = keyOf(row + rowOffset, column + columnOffset);
        neighbourCounts.set(neighbour, (neighbourCounts.get(neighbour) ?? 0) + 1);
      }
    }
  }

  const next = new Set();
  for (const [cell, neighbours] of neighbourCounts) {
    if (birth.includes(neighbours) || (liveCells.has(cell) && survival.includes(neighbours))) {
      next.add(cell);
    }
  }
  return next;
}

export function nextGeneration(liveCells) {
  return nextGenerationWithRule(liveCells);
}

export const variations = {
  conway: { name: "Conway’s Life", code: "B3/S23", kind: "life", birth: [3], survival: [2, 3], summary: "The original. Crowds and loneliness kill; just enough company keeps life going." },
  highlife: { name: "HighLife", code: "B36/S23", kind: "life", birth: [3, 6], survival: [2, 3], summary: "Conway’s rules plus one extra birth condition. That tiny change allows self-copying patterns." },
  seeds: { name: "Seeds", code: "B2/S", kind: "life", birth: [2], survival: [], summary: "Two neighbours create a cell, but nothing survives. The world sparkles and explodes outward." },
  dayNight: { name: "Day & Night", code: "B3678/S34678", kind: "life", birth: [3, 6, 7, 8], survival: [3, 4, 6, 7, 8], summary: "Living and empty space follow nearly mirrored rules, forming competing islands and continents." },
  maze: { name: "Maze", code: "B3/S12345", kind: "life", birth: [3], survival: [1, 2, 3, 4, 5], summary: "Cells survive more easily, so growth settles into winding walls and maze-like corridors." },
  replicator: { name: "Replicator", code: "B1357/S1357", kind: "life", birth: [1, 3, 5, 7], survival: [1, 3, 5, 7], summary: "Odd numbers rule. Small patterns can repeatedly make larger copies of themselves." },
  brian: { name: "Brian’s Brain", code: "B2/S/C3", kind: "brian", summary: "Cells fire, become tired for one turn, then rest. Moving waves resemble signals in a brain." },
  wireworld: { name: "Wireworld", code: "4 states", kind: "wireworld", summary: "Copper cells carry electron heads and tails. Arranged carefully, they become working circuits." },
  langton: { name: "Langton’s Ant", code: "LR", kind: "langton", summary: "An ant flips each square and turns left or right. After chaos, it builds a repeating highway." }
};

export function translate(pattern, rowOffset, columnOffset) {
  return new Set(pattern.map(([row, column]) => keyOf(row + rowOffset, column + columnOffset)));
}

export const patterns = {
  glider: [[0, 1], [1, 2], [2, 0], [2, 1], [2, 2]],
  blinker: [[0, 0], [0, 1], [0, 2]],
  block: [[0, 0], [0, 1], [1, 0], [1, 1]],
  toad: [[0, 1], [0, 2], [0, 3], [1, 0], [1, 1], [1, 2]],
  beacon: [[0, 0], [0, 1], [1, 0], [1, 1], [2, 2], [2, 3], [3, 2], [3, 3]],
  rPentomino: [[0, 1], [0, 2], [1, 0], [1, 1], [2, 1]],
  acorn: [[0, 1], [1, 3], [2, 0], [2, 1], [2, 4], [2, 5], [2, 6]],
  pulsar: [
    [0, 2], [0, 3], [0, 4], [0, 8], [0, 9], [0, 10],
    [2, 0], [2, 5], [2, 7], [2, 12], [3, 0], [3, 5], [3, 7], [3, 12],
    [4, 0], [4, 5], [4, 7], [4, 12], [5, 2], [5, 3], [5, 4], [5, 8], [5, 9], [5, 10],
    [7, 2], [7, 3], [7, 4], [7, 8], [7, 9], [7, 10],
    [8, 0], [8, 5], [8, 7], [8, 12], [9, 0], [9, 5], [9, 7], [9, 12],
    [10, 0], [10, 5], [10, 7], [10, 12], [12, 2], [12, 3], [12, 4], [12, 8], [12, 9], [12, 10]
  ]
};

export const patternInfo = {
  glider: ["Glider", "A five-cell spaceship that walks diagonally across Conway’s universe."],
  blinker: ["Blinker", "The smallest oscillator: a line that flips between horizontal and vertical."],
  block: ["Block", "A still life. Every cell has the perfect number of neighbours, so nothing changes."],
  toad: ["Toad", "Six cells that rock between two shapes, repeating every second generation."],
  beacon: ["Beacon", "Two small blocks whose inner corners blink on and off together."],
  rPentomino: ["R-pentomino", "Only five cells, yet it stays busy for 1,103 generations in Conway’s Life."],
  acorn: ["Acorn", "Seven cells that grow into a huge, long-lived population before settling down."],
  pulsar: ["Pulsar", "A large, symmetrical oscillator that repeats every three generations."]
};
