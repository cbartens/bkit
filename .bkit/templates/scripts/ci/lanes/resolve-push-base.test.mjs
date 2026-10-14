#!/usr/bin/env node
// Example. Copy into scripts/ci/lanes/ and own it. bkit install does not write this file
// and does not overwrite a copy.
/**
 * resolve-push-base.test.mjs — unit tests for the push-run diff base.
 *
 * Pure Node, no runner: `node scripts/ci/lanes/resolve-push-base.test.mjs`.
 * Exit: 0 = all tests passed, 1 = at least one test failed.
 */

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { choosePushBase, newestRunSha } from "./resolve-push-base.mjs";

const SCRIPT = fileURLToPath(new URL("./resolve-push-base.mjs", import.meta.url));

/** Run the script with fake `gh` / `git` binaries first on PATH. */
function runWithFakes({ gh, git }) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "push-base-"));
  try {
    fs.writeFileSync(path.join(dir, "gh"), `#!/bin/sh\n${gh}\n`, { mode: 0o755 });
    fs.writeFileSync(path.join(dir, "git"), `#!/bin/sh\n${git}\n`, { mode: 0o755 });
    const sourceFile = path.join(dir, "source");
    const r = spawnSync(process.execPath, [SCRIPT], {
      encoding: "utf8",
      env: {
        ...process.env,
        PATH: `${dir}${path.delimiter}${process.env.PATH}`,
        REPO: "o/r",
        BRANCH: "dev",
        BEFORE_SHA: "b".repeat(40),
        SOURCE_FILE: sourceFile,
      },
    });
    const source = fs.existsSync(sourceFile) ? fs.readFileSync(sourceFile, "utf8").trim() : "";
    return { status: r.status, stdout: r.stdout.trim(), source };
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

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

const RUNS = `echo '[{"run_number":1,"head_sha":"${"a".repeat(40)}"}]'`;

test("a git failure while testing ancestry exits 0 with event.before", () => {
  const r = runWithFakes({ gh: RUNS, git: "exit 3" });
  assert(r.status === 0, `exit ${r.status}`);
  assert(r.stdout === "b".repeat(40), r.stdout);
  assert(r.source.startsWith("event-before"), r.source);
});

test("unparseable gh output exits 0 with event.before", () => {
  const r = runWithFakes({ gh: "echo 'not json'", git: "exit 0" });
  assert(r.status === 0, `exit ${r.status}`);
  assert(r.stdout === "b".repeat(40), r.stdout);
  assert(r.source.startsWith("event-before"), r.source);
});

test("a green ancestor run reports last-green-run as the source", () => {
  const r = runWithFakes({ gh: RUNS, git: "exit 0" });
  assert(r.status === 0 && r.stdout === "a".repeat(40), JSON.stringify(r));
  assert(r.source === "last-green-run", r.source);
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
