"use strict";
const test = require("node:test");
const assert = require("node:assert");

test("planted trap is caught", () => {
  assert.strictEqual(1, 2);
});
