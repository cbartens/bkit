"use strict";
const test = require("node:test");
const assert = require("node:assert");
const { evaluate } = require("./logic.js");

test("guard exports evaluate under require", () => {
  assert.strictEqual(typeof evaluate, "function");
  assert.deepStrictEqual(evaluate(2), { phase: "build", counters: { attempts: 2 } });
});
