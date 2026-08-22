export const keyOf = (row, column) => `${row},${column}`;

export function parseKey(key) {
  return key.split(",").map(Number);
}

export function nextGeneration(liveCells) {
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
    if (neighbours === 3 || (neighbours === 2 && liveCells.has(cell))) {
      next.add(cell);
    }
  }
  return next;
}

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
