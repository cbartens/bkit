"use strict";
const test = require("node:test");
const assert = require("node:assert");
const { evaluate } = require("./logic.js");

test("evaluate maps a run position to a phase", () => {
  assert.deepStrictEqual(evaluate(1), { phase: "plan", counters: { position: 1 } });
});
