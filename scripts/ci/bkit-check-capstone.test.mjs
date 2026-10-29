#!/usr/bin/env node
// Example. Copy into scripts/ci/ and own it. bkit install does not write this file
// and does not overwrite a copy.
/**
 * bkit-check-capstone.test.mjs — unit tests for the capstone gate.
 *
 * Pure Node, no runner: `node scripts/ci/bkit-check-capstone.test.mjs`.
 * Exit: 0 = all tests passed, 1 = at least one test failed.
 */

import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { checkCapstone } from "./bkit-check-capstone.mjs";

const SCRIPT = path.join(path.dirname(fileURLToPath(import.meta.url)), "bkit-check-capstone.mjs");

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    passed++;
    console.log(`  ok   ${name}`);
  } catch (err) {
    failed++;
    console.log(`  FAIL ${name} — ${err.message}`);
  }
}

function assert(cond, message) {
  if (!cond) throw new Error(message);
}

/** The environment of a capstone that watches a static lane and a counted unit lane. */
const base = (extra = {}) => ({
  LANES: "static,unit",
  STATIC_RESULT: "success",
  UNIT_RESULT: "success",
  UNIT_RAN: "12",
  ...extra,
});

/** The planner shape: scope + a run level, with a counted integration lane too. */
const planned = (extra = {}) => ({
  LANES: "static,unit,integration",
  PLAN: JSON.stringify({ run_level: "full" }),
  SCOPE_RESULT: "success",
  STATIC_RESULT: "success",
  UNIT_RESULT: "success",
  UNIT_RAN: "12",
  INTEGRATION_RESULT: "success",
  INTEGRATION_RAN: "4",
  ...extra,
});

const skipPlan = (extra = {}) =>
  planned({
    PLAN: JSON.stringify({ run_level: "none" }),
    STATIC_RESULT: "skipped",
    UNIT_RESULT: "skipped",
    UNIT_RAN: "",
    INTEGRATION_RESULT: "skipped",
    INTEGRATION_RAN: "",
    ...extra,
  });

const reds = (env, needle) => {
  const r = checkCapstone(env);
  assert(r.errors.length > 0, `expected a failure, got ${JSON.stringify(r)}`);
  if (needle) {
    assert(
      r.errors.some((e) => e.includes(needle)),
      `no error mentions ${JSON.stringify(needle)}: ${JSON.stringify(r.errors)}`,
    );
  }
  return r;
};

const greens = (env) => {
  const r = checkCapstone(env);
  assert(r.errors.length === 0, `expected a pass, got ${JSON.stringify(r.errors)}`);
  return r;
};

// ── the clean pass ───────────────────────────────────────────────────────────

test("every lane succeeded and the counted lane ran tests: passes", () => {
  const r = greens(base());
  assert(r.warnings.length === 0, `warnings ${JSON.stringify(r.warnings)}`);
});

test("with a plan: scope, every lane and every count good passes", () => {
  greens(planned());
});

// ── case 1: a lane whose result is not success ──────────────────────────────

test("a failed lane fails, naming the lane and its result", () => {
  reds(base({ STATIC_RESULT: "failure" }), "bkit-tests-static");
  const r = reds(base({ UNIT_RESULT: "failure" }), "result=failure");
  assert(
    r.errors.some((e) => e.includes("bkit-tests-unit")),
    "lane not named",
  );
});

test("a skipped or cancelled lane fails when the lane was expected to run", () => {
  reds(base({ STATIC_RESULT: "skipped" }), "result=skipped");
  reds(base({ UNIT_RESULT: "cancelled" }), "result=cancelled");
});

test("with a plan, a failed lane fails naming the run level", () => {
  reds(planned({ INTEGRATION_RESULT: "failure" }), "run_level=full");
});

test("a lane whose result was never wired in fails", () => {
  const env = base();
  delete env.STATIC_RESULT;
  reds(env, "STATIC_RESULT");
});

test("a failed scope job fails even when every lane succeeded", () => {
  reds(planned({ SCOPE_RESULT: "failure" }), "bkit-tests-scope");
});

// ── case 2: a gated lane ran although the plan said skip ────────────────────

test("run_level=none with every lane skipped passes", () => {
  greens(skipPlan());
});

test("run_level=none but a lane ran (success) fails", () => {
  reds(skipPlan({ UNIT_RESULT: "success", UNIT_RAN: "5" }), "bkit-tests-unit");
});

test("run_level=none but a lane ran (failure) fails", () => {
  reds(skipPlan({ STATIC_RESULT: "failure" }), "bkit-tests-static");
});

test("run_level=none ignores counts on skipped lanes", () => {
  greens(skipPlan({ UNIT_RAN: "0", INTEGRATION_RAN: "not-a-number" }));
});

// ── case 3: success with 0 tests, or a count that is not a number ───────────

test("a lane that succeeded having run 0 tests fails", () => {
  reds(base({ UNIT_RAN: "0" }), "0 tests");
});

test("a zero written with leading zeros is still zero", () => {
  reds(base({ UNIT_RAN: "00" }), "0 tests");
});

test("a non-numeric count fails", () => {
  reds(base({ UNIT_RAN: "abc" }), "non-numeric");
  reds(base({ UNIT_RAN: "-3" }), "non-numeric");
  reds(base({ UNIT_RAN: "1.5" }), "non-numeric");
  reds(base({ UNIT_RAN: " 4" }), "non-numeric");
});

test("an empty count fails by default", () => {
  reds(base({ UNIT_RAN: "" }), "non-numeric");
});

test("a positive count passes", () => {
  greens(base({ UNIT_RAN: "1" }));
  greens(base({ UNIT_RAN: "0042" }));
});

test("each counted lane is checked on its own", () => {
  reds(planned({ UNIT_RAN: "9", INTEGRATION_RAN: "0" }), "bkit-tests-integration");
  reds(planned({ UNIT_RAN: "0", INTEGRATION_RAN: "9" }), "bkit-tests-unit");
});

test("a lane with no <LANE>_RAN variable is not count-checked", () => {
  const env = base();
  assert(!("STATIC_RAN" in env), "fixture sets STATIC_RAN");
  greens(env);
});

test("a count on a lane that did not succeed is not double-reported", () => {
  const r = reds(base({ UNIT_RESULT: "failure", UNIT_RAN: "0" }), "result=failure");
  assert(r.errors.length === 1, `errors ${JSON.stringify(r.errors)}`);
});

// ── case 4: a plan that will not parse ──────────────────────────────────────

test("a plan that is not JSON fails", () => {
  reds(planned({ PLAN: "{not json" }), "plan");
});

test("an empty plan fails (a planner that emitted nothing)", () => {
  reds(planned({ PLAN: "" }), "plan");
});

test("a plan that is not an object, or has no run_level, fails", () => {
  reds(planned({ PLAN: "[]" }), "plan");
  reds(planned({ PLAN: "null" }), "plan");
  reds(planned({ PLAN: '"full"' }), "plan");
  reds(planned({ PLAN: "{}" }), "plan");
  reds(planned({ PLAN: '{"run_level":""}' }), "plan");
  reds(planned({ PLAN: '{"run_level":3}' }), "plan");
});

test("an unparseable plan never lets a skipped lane pass as 'nothing planned'", () => {
  reds(skipPlan({ PLAN: "{not json" }), "plan");
});

// ── the exemptions ──────────────────────────────────────────────────────────

test("a <LANE>_CACHE_SKIP variable excuses no count", () => {
  reds(base({ UNIT_CACHE_SKIP: "true", UNIT_RAN: "0" }), "0 tests");
  reds(planned({ INTEGRATION_CACHE_SKIP: "true", INTEGRATION_RAN: "0" }), "0 tests");
});

test("EMPTY_COUNT=warn turns an unreported count into a warning, not a failure", () => {
  const r = greens(base({ EMPTY_COUNT: "warn", UNIT_RAN: "" }));
  assert(r.warnings.length === 1, `warnings ${JSON.stringify(r.warnings)}`);
  assert(r.warnings[0].includes("bkit-tests-unit"), "lane not named in the warning");
});

test("EMPTY_COUNT=warn still fails a zero or non-numeric count", () => {
  reds(base({ EMPTY_COUNT: "warn", UNIT_RAN: "0" }), "0 tests");
  reds(base({ EMPTY_COUNT: "warn", UNIT_RAN: "abc" }), "non-numeric");
});

test("an EMPTY_COUNT value other than warn is the strict default", () => {
  reds(base({ EMPTY_COUNT: "ignore", UNIT_RAN: "" }), "non-numeric");
});

// ── the wiring ──────────────────────────────────────────────────────────────

test("no LANES fails: a gate that watches nothing proves nothing", () => {
  reds({}, "LANES");
  reds({ LANES: "" }, "LANES");
  reds({ LANES: " , " }, "LANES");
});

test("a lane name that cannot be an env prefix fails", () => {
  reds({ LANES: "unit;rm", UNIT_RESULT: "success" }, "unit;rm");
});

test("a hyphenated lane reads <LANE>_ variables with underscores", () => {
  greens({
    LANES: "e2e-web",
    E2E_WEB_RESULT: "success",
    E2E_WEB_RAN: "3",
  });
  reds({ LANES: "e2e-web", E2E_WEB_RESULT: "success", E2E_WEB_RAN: "0" }, "bkit-tests-e2e-web");
});

test("lane names tolerate spaces around the commas", () => {
  greens(base({ LANES: " static , unit " }));
});

// ── the command line ────────────────────────────────────────────────────────

function run(env) {
  const r = spawnSync(process.execPath, [SCRIPT], { env, encoding: "utf-8" });
  return { status: r.status, out: `${r.stdout}${r.stderr}` };
}

test("exits 0 and prints a pass line when the lanes are good", () => {
  const r = run(base());
  assert(r.status === 0, `status ${r.status}: ${r.out}`);
  assert(r.out.includes("bkit-tests-check passed"), `output ${r.out}`);
});

test("exits 1 and prints ::error:: lines when a lane failed", () => {
  const r = run(base({ UNIT_RESULT: "failure" }));
  assert(r.status === 1, `status ${r.status}`);
  assert(r.out.includes("::error::bkit-tests-unit"), `output ${r.out}`);
  assert(r.out.includes("bkit-tests-check FAILED"), `output ${r.out}`);
});

test("exits 1 on a zero count, and prints ::warning:: for an unreported one", () => {
  assert(run(base({ UNIT_RAN: "0" })).status === 1, "zero count passed");
  const r = run(base({ EMPTY_COUNT: "warn", UNIT_RAN: "" }));
  assert(r.status === 0, `status ${r.status}: ${r.out}`);
  assert(r.out.includes("::warning::bkit-tests-unit"), `output ${r.out}`);
});

test("exits 1 on a plan that will not parse", () => {
  const r = run(planned({ PLAN: "{not json" }));
  assert(r.status === 1, `status ${r.status}`);
  assert(r.out.includes("::error::"), `output ${r.out}`);
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
