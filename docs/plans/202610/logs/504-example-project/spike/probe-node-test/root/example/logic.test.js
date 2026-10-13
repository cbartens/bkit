const test = require("node:test");
const assert = require("node:assert");
const { litBoxes } = require("./logic.js");

test("litBoxes returns the first N boxes", () => {
  assert.deepStrictEqual(litBoxes(2), ["design", "plan"]);
});
