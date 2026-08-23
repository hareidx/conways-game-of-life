import test from "node:test";
import assert from "node:assert/strict";
import { keyOf, nextGeneration, nextGenerationWithRule, patterns, translate, variations } from "../src/life.js";

const cells = (...coordinates) => new Set(coordinates.map(([r, c]) => keyOf(r, c)));

test("a block is a still life", () => {
  const block = cells([0, 0], [0, 1], [1, 0], [1, 1]);
  assert.deepEqual(nextGeneration(block), block);
});

test("Seeds births cells with two neighbours and preserves none", () => {
  const seed = cells([0, 0], [0, 1]);
  const next = nextGenerationWithRule(seed, variations.seeds.birth, variations.seeds.survival);
  assert.equal(next.has(keyOf(0, 0)), false);
  assert.equal(next.has(keyOf(-1, 0)), true);
});

test("all named variations provide an explanation", () => {
  assert.equal(Object.keys(variations).length, 9);
  for (const variation of Object.values(variations)) assert.ok(variation.name && variation.summary && variation.code);
});

test("a blinker oscillates with period two", () => {
  const horizontal = cells([0, -1], [0, 0], [0, 1]);
  const vertical = cells([-1, 0], [0, 0], [1, 0]);
  assert.deepEqual(nextGeneration(horizontal), vertical);
  assert.deepEqual(nextGeneration(vertical), horizontal);
});

test("a glider returns translated after four generations", () => {
  const glider = [[0, 1], [1, 2], [2, 0], [2, 1], [2, 2]];
  let state = translate(glider, 0, 0);
  for (let generation = 0; generation < 4; generation += 1) state = nextGeneration(state);
  assert.deepEqual(state, translate(glider, 1, 1));
});

test("lonely and overcrowded cells die", () => {
  assert.deepEqual(nextGeneration(cells([0, 0])), new Set());
  const crowded = cells([0, 0], [-1, -1], [-1, 0], [-1, 1], [0, -1]);
  assert.equal(nextGeneration(crowded).has(keyOf(0, 0)), false);
});

test("the pattern library exposes each preset with the expected population", () => {
  assert.deepEqual(
    Object.fromEntries(Object.entries(patterns).map(([name, pattern]) => [name, pattern.length])),
    { glider: 5, blinker: 3, block: 4, toad: 6, beacon: 8, rPentomino: 5, acorn: 7, pulsar: 48 }
  );
});
