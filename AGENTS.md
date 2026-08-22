# Repository Guidelines

## Project Structure & Module Organization

This is a dependency-free, single-page Conway’s Game of Life application.

- `index.html` defines the controls, status display, and simulation canvas.
- `styles.css` contains all responsive layout and visual styling.
- `src/life.js` is the pure simulation engine: cell keys, B3/S23 generation logic, translation, and preset patterns.
- `src/app.js` owns canvas rendering, animation, pointer input, zoom/pan, and UI state.
- `test/life.test.js` verifies the engine independently of the browser.
- `README.md` contains quick-start instructions.

Keep reusable simulation logic in `src/life.js`. Browser APIs and DOM manipulation belong in `src/app.js`.

## Build, Test, and Development Commands

- `npm test` runs the complete suite with Node’s built-in test runner.
- `npm start` serves the repository at `http://localhost:4173` using Python’s static HTTP server.

There is no compile or bundle step. Do not open `index.html` directly because ES modules require an HTTP origin. The project has no runtime npm dependencies.

## Coding Style & Naming Conventions

Use modern JavaScript ES modules, two-space indentation, semicolons, and double-quoted strings. Prefer `const`; use `let` only for changing state. Name functions and variables in `camelCase`, exported pattern collections in lowercase, and DOM IDs in kebab-case where multiple words are needed.

Favor small pure functions in the engine. Represent live cells as `Set<string>` values using the `"row,column"` format and create keys through `keyOf()`. No formatter or linter is configured, so match the surrounding style.

## Testing Guidelines

Tests use `node:test` and `node:assert/strict`. Add tests under `test/` with the `*.test.js` suffix. Describe observable behavior, for example `"a blinker oscillates with period two"`. Cover rule changes with known still lifes, oscillators, spaceships, and edge cases. Run `npm test` before every pull request.

## Commit & Pull Request Guidelines

This repository currently has no accessible commit history, so use short imperative commit subjects such as `Add pulsar preset` or `Fix zoom origin calculation`. Keep each commit focused.

Pull requests should explain the behavior changed, identify tests added or updated, and link any relevant issue. Include a screenshot or short recording for visible UI changes. Confirm both automated tests and a local browser smoke test in the description.

## Scope & Configuration

Preserve the project’s intentionally small, dependency-free architecture. Avoid adding frameworks or packages unless they provide a clear benefit that cannot be achieved cleanly with browser or Node standard APIs.
