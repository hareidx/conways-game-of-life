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
  conway: { name: "Conway’s Life", code: "B3/S23", kind: "life", birth: [3], survival: [2, 3], summary: "A dead cell is born with exactly 3 neighbours. A living cell survives with 2 or 3; otherwise it dies from loneliness or crowding." },
  highlife: { name: "HighLife", code: "B36/S23", kind: "life", birth: [3, 6], survival: [2, 3], summary: "A dead cell is born with exactly 3 or 6 neighbours; living cells still survive with 2 or 3. Adding birth at 6 allows self-copying patterns." },
  seeds: { name: "Seeds", code: "B2/S", kind: "life", birth: [2], survival: [], summary: "A dead cell is born with exactly 2 neighbours. No living cell survives, so the world sparkles and explodes outward." },
  dayNight: { name: "Day & Night", code: "B3678/S34678", kind: "life", birth: [3, 6, 7, 8], survival: [3, 4, 6, 7, 8], summary: "A dead cell is born with 3, 6, 7, or 8 neighbours; a living cell survives with 3, 4, 6, 7, or 8. These nearly mirrored rules form competing islands and continents." },
  maze: { name: "Maze", code: "B3/S12345", kind: "life", birth: [3], survival: [1, 2, 3, 4, 5], summary: "A dead cell is born with exactly 3 neighbours; a living cell survives with 1 through 5. Easy survival leaves winding walls and maze-like corridors." },
  replicator: { name: "Replicator", code: "B1357/S1357", kind: "life", birth: [1, 3, 5, 7], survival: [1, 3, 5, 7], summary: "Dead and living cells both continue with an odd number—1, 3, 5, or 7—of neighbours. Small patterns can grow into repeated copies." },
  brian: { name: "Brian’s Brain", code: "B2/S/C3", kind: "brian", summary: "A resting cell fires beside exactly 2 firing neighbours, then every cell cycles firing → recovering → resting. The moving waves resemble signals in a brain." },
  wireworld: { name: "Wireworld", code: "4 states", kind: "wireworld", summary: "An electron head becomes a tail, a tail becomes copper, and copper becomes a head beside 1 or 2 electron heads. Those moving signals can form working circuits." },
  langton: { name: "Langton’s Ant", code: "LR", kind: "langton", summary: "On white, the ant turns right and makes the square black; on black, it turns left and makes it white. It flips the colour, moves forward, and eventually builds a repeating highway." }
};

export function translate(pattern, rowOffset, columnOffset) {
  return new Set(pattern.map(([row, column]) => keyOf(row + rowOffset, column + columnOffset)));
}

export function parseRlePattern(rle) {
  const pattern = [];
  let row = 0;
  let column = 0;
  let count = "";
  for (const symbol of rle.replace(/\s/g, "")) {
    if (/\d/.test(symbol)) { count += symbol; continue; }
    const amount = Number(count || 1);
    count = "";
    if (symbol === "o") {
      for (let index = 0; index < amount; index += 1) pattern.push([row, column + index]);
      column += amount;
    } else if (symbol === "b") column += amount;
    else if (symbol === "$") { row += amount; column = 0; }
    else if (symbol === "!") break;
  }
  return pattern;
}

export const patterns = {
  glider: [[0, 1], [1, 2], [2, 0], [2, 1], [2, 2]],
  blinker: [[0, 0], [0, 1], [0, 2]],
  block: [[0, 0], [0, 1], [1, 0], [1, 1]],
  beehive: parseRlePattern("b2o$o2bo$b2o!"),
  loaf: parseRlePattern("b2o$o2bo$bobo$2bo!"),
  toad: [[0, 1], [0, 2], [0, 3], [1, 0], [1, 1], [1, 2]],
  beacon: [[0, 0], [0, 1], [1, 0], [1, 1], [2, 2], [2, 3], [3, 2], [3, 3]],
  rPentomino: [[0, 1], [0, 2], [1, 0], [1, 1], [2, 1]],
  acorn: [[0, 1], [1, 3], [2, 0], [2, 1], [2, 4], [2, 5], [2, 6]],
  clock: parseRlePattern("2bo$obo$bobo$bo!"),
  figureEight: parseRlePattern("2o$2obo$4bo$bo$2bob2o$4b2o!"),
  koksGalaxy: parseRlePattern("2bo2bobob$2obob3ob$bo6bo$2o5bob2$bo5b2o$o6bob$b3obob2o$bobo2bo!"),
  pentadecathlon: parseRlePattern("2bo4bo2b$2ob4ob2o$2bo4bo!"),
  queenBeeShuttle: parseRlePattern("9bo$7bobo$6bobo11b2o$2o3bo2bo11b2o$2o4bobo$7bobo$9bo!"),
  lightweightSpaceship: parseRlePattern("bo2bo$o4b$o3bo$4o!"),
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
  glider: ["Glider", "A five-cell spaceship that repeats its shape every 4 generations, one diagonal square farther along. It is the smallest pattern that travels through Conway’s universe."],
  blinker: ["Blinker", "The smallest oscillator: a three-cell line that flips between horizontal and vertical. It returns after 2 generations."],
  block: ["Block", "A four-cell still life. Each live cell has exactly 3 neighbours and no nearby empty cell has 3, so nothing changes."],
  beehive: ["Beehive", "A six-cell still life shaped like a tiny ring. Each cell has 2 neighbours and no empty cell has exactly 3, so it remains balanced."],
  loaf: ["Loaf", "A lopsided seven-cell still life. Every live cell has 2 or 3 neighbours and no empty cell has exactly 3, so it stays still."],
  toad: ["Toad", "Six cells that rock between two shapes, repeating every second generation."],
  beacon: ["Beacon", "Two small blocks whose inner corners blink on and off together. This period-2 oscillator returns after 2 generations."],
  rPentomino: ["R-pentomino", "This five-cell methuselah stays active for 1,103 generations, then settles into 116 cells, including 6 escaping gliders."],
  acorn: ["Acorn", "This seven-cell methuselah grows for 5,206 generations before settling into a final population of 633. A tiny seed creates a vast, long-lived world."],
  clock: ["Clock", "A six-cell oscillator whose centre seems to rotate. It repeats every two generations."],
  figureEight: ["Figure eight", "Two tiny three-by-three islands trade places in an eight-generation loop."],
  koksGalaxy: ["Kok’s galaxy", "A 28-cell period-8 oscillator in which every cell changes during the cycle."],
  pentadecathlon: ["Pentadecathlon", "A famous 12-cell oscillator that takes 15 generations to return."],
  queenBeeShuttle: ["Queen bee shuttle", "A moving core travels between two blocks and back again every 30 generations."],
  lightweightSpaceship: ["Lightweight spaceship", "A nine-cell craft that repeats every four generations while travelling sideways."],
  pulsar: ["Pulsar", "A large, symmetrical oscillator that repeats every three generations."]
};
