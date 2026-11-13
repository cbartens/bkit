// bkit's own checkout only; never shipped. Run: node --test scripts/ci/bkit-test-limits.test.mjs
import assert from "node:assert/strict";
import { test } from "node:test";

import { batsTestTimeoutSeconds, nodeTestLimitArgs } from "./bkit-test-limits.mjs";

/** Run `fn` with CI set to `value` (or removed when undefined), then put the old value back. */
function withCi(t, value, fn) {
  const before = process.env.CI;
  t.after(() => {
    if (before === undefined) delete process.env.CI;
    else process.env.CI = before;
  });
  if (value === undefined) delete process.env.CI;
  else process.env.CI = value;
  return fn();
}

test("gives --test-timeout from the integration budget and --test-force-exit", (t) => {
  assert.deepEqual(
    withCi(t, "true", () => nodeTestLimitArgs()),
    ["--test-timeout=30000", "--test-force-exit"],
  );
  const local = withCi(t, undefined, () => nodeTestLimitArgs());
  assert.equal(local.length, 2);
  assert.match(local[0], /^--test-timeout=\d+$/);
  assert.ok(Number(local[0].split("=")[1]) >= 30000, local[0]);
  assert.equal(local[1], "--test-force-exit");
});

test("gives the bats limit in whole seconds, 30 under CI", (t) => {
  assert.equal(
    withCi(t, "true", () => batsTestTimeoutSeconds()),
    30,
  );
  const local = withCi(t, undefined, () => batsTestTimeoutSeconds());
  assert.ok(Number.isInteger(local), String(local));
  assert.ok(local >= 30, String(local));
});
