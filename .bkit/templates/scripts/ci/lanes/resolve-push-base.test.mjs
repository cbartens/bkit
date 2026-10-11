#!/usr/bin/env node
// Example. Copy into scripts/ci/lanes/ and own it. bkit install does not write this file
// and does not overwrite a copy.
/**
 * resolve-push-base.test.mjs — unit tests for the push-run diff base.
 *
 * Pure Node, no runner: `node scripts/ci/lanes/resolve-push-base.test.mjs`.
 * Exit: 0 = all tests passed, 1 = at least one test failed.
 */

import { choosePushBase, newestRunSha } from "./resolve-push-base.mjs";

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

const GREEN = "a".repeat(40);
const BEFORE = "b".repeat(40);
const ancestors =
  (...shas) =>
  (sha) =>
    shas.includes(sha);

test("a cancelled push's changes stay in scope: base is the last green run, not event.before", () => {
  // push 1 (GREEN) passed; push 2 (BEFORE) was cancelled by push 3 (HEAD).
  const r = choosePushBase({
    lastGreenSha: GREEN,
    beforeSha: BEFORE,
    isAncestor: ancestors(GREEN, BEFORE),
  });
  assert(r.base === GREEN, `expected the last green run's head, got ${r.base}`);
  assert(r.source === "last-green-run", r.source);
});

test("no green run on the branch yet → event.before", () => {
  const r = choosePushBase({ lastGreenSha: "", beforeSha: BEFORE, isAncestor: ancestors() });
  assert(r.base === BEFORE, r.base);
  assert(r.source === "event-before", r.source);
});

test("a force-push rewrote the branch (last green head not an ancestor) → event.before", () => {
  const r = choosePushBase({
    lastGreenSha: GREEN,
    beforeSha: BEFORE,
    isAncestor: ancestors(BEFORE),
  });
  assert(r.base === BEFORE, r.base);
  assert(r.source.startsWith("event-before"), r.source);
});

test("nothing at all → empty base (the planner's run-to-be-safe path)", () => {
  const r = choosePushBase({ lastGreenSha: "", beforeSha: undefined, isAncestor: ancestors() });
  assert(r.base === "", JSON.stringify(r));
});

test("the newest green run wins by run number, whatever order the API lists them in", () => {
  const runs = [
    { run_number: 2317, head_sha: "older" },
    { run_number: 2679, head_sha: "today" },
    { run_number: 2675, head_sha: "yesterday" },
  ];
  assert(newestRunSha(runs) === "today", newestRunSha(runs));
});

test("no usable run → empty sha (the caller falls back to event.before)", () => {
  assert(newestRunSha([]) === "", "empty list");
  assert(newestRunSha(undefined) === "", "no list");
  assert(newestRunSha([{ run_number: "x", head_sha: "a" }, { head_sha: 3 }]) === "", "malformed");
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
