#!/usr/bin/env node
// Example. Copy into scripts/ci/lanes/ and own it. bkit install does not write this file
// and does not overwrite a copy.
/**
 * check-tree-cache.test.mjs — unit tests for the pull request tree cache.
 *
 * Pure Node, no runner: `node scripts/ci/lanes/check-tree-cache.test.mjs`.
 * Exit: 0 = all tests passed, 1 = at least one test failed.
 */

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { decideTreeSkip } from "./check-tree-cache.mjs";

const SCRIPT = fileURLToPath(new URL("./check-tree-cache.mjs", import.meta.url));

/** Run the script with fake `gh` / `git` binaries first on PATH. */
function runWithFakes({ gh, git, eventName = "pull_request", title = "feat: x" }) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "tree-cache-"));
  try {
    fs.writeFileSync(path.join(dir, "gh"), `#!/bin/sh\n${gh}\n`, { mode: 0o755 });
    fs.writeFileSync(path.join(dir, "git"), `#!/bin/sh\n${git}\n`, { mode: 0o755 });
    const r = spawnSync(process.execPath, [SCRIPT], {
      encoding: "utf8",
      env: {
        ...process.env,
        PATH: `${dir}${path.delimiter}${process.env.PATH}`,
        REPO: "o/r",
        EVENT_NAME: eventName,
        JOB: "bkit-tests-unit",
        PR_TITLE: title,
      },
    });
    return { status: r.status, stdout: r.stdout.trim(), stderr: r.stderr };
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

const TREE = "t".repeat(40);
const OTHER = "o".repeat(40);
const green = () => "success";
const base = { eventName: "pull_request", title: "feat: x", headTree: TREE };

test("a pull request whose files a green push run tested skips", () => {
  const r = decideTreeSkip({
    ...base,
    runs: [{ id: 7, run_number: 3, tree: TREE }],
    jobConclusion: green,
  });
  assert(r.skip === true, r.reason);
});

test("a push run never skips, even with the same files green", () => {
  for (const eventName of ["push", "workflow_dispatch"]) {
    const r = decideTreeSkip({
      ...base,
      eventName,
      runs: [{ id: 7, run_number: 3, tree: TREE }],
      jobConclusion: green,
    });
    assert(r.skip === false, `${eventName}: ${r.reason}`);
  }
});

test("[force build] / [force cache] in the title run the suite", () => {
  for (const title of ["feat: x [force build]", "[force cache] feat: x"]) {
    const r = decideTreeSkip({
      ...base,
      title,
      runs: [{ id: 7, run_number: 3, tree: TREE }],
      jobConclusion: green,
    });
    assert(r.skip === false, `${title}: ${r.reason}`);
  }
});

test("other files → no skip", () => {
  const r = decideTreeSkip({
    ...base,
    runs: [{ id: 7, run_number: 3, tree: OTHER }],
    jobConclusion: green,
  });
  assert(r.skip === false, r.reason);
});

test("same files, but that run skipped this lane ([skip ci] / run_level=none) → no skip", () => {
  const r = decideTreeSkip({
    ...base,
    runs: [{ id: 7, run_number: 3, tree: TREE }],
    jobConclusion: () => "skipped",
  });
  assert(r.skip === false, r.reason);
});

test("a later matching run with the lane green is found past one that skipped it", () => {
  const seen = [];
  const r = decideTreeSkip({
    ...base,
    runs: [
      { id: 1, run_number: 1, tree: TREE },
      { id: 2, run_number: 2, tree: TREE },
    ],
    jobConclusion: (id) => {
      seen.push(id);
      return id === 1 ? "success" : "skipped";
    },
  });
  assert(r.skip === true, r.reason);
  assert(seen.join(",") === "2,1", `newest first, got ${seen}`);
});

test("no tree for HEAD → no skip", () => {
  const r = decideTreeSkip({
    ...base,
    headTree: "",
    runs: [{ id: 7, run_number: 3, tree: "" }],
    jobConclusion: green,
  });
  assert(r.skip === false, r.reason);
});

const RUNS = `echo '[{"id":7,"run_number":3,"tree":"${TREE}"}]'`;
const GH_OK = `case "$2" in *jobs*) echo success ;; *) ${RUNS} ;; esac`;

test("end to end: matching green push run prints skip=true", () => {
  const r = runWithFakes({ gh: GH_OK, git: `echo ${TREE}` });
  assert(r.status === 0 && r.stdout === "skip=true", JSON.stringify(r));
});

test("end to end: a push event prints skip=false without calling gh", () => {
  const r = runWithFakes({ gh: "exit 9", git: `echo ${TREE}`, eventName: "push" });
  assert(r.status === 0 && r.stdout === "skip=false", JSON.stringify(r));
});

test("a gh failure exits 0 with skip=false", () => {
  const r = runWithFakes({ gh: "exit 4", git: `echo ${TREE}` });
  assert(r.status === 0 && r.stdout === "skip=false", JSON.stringify(r));
});

test("unparseable gh output exits 0 with skip=false", () => {
  const r = runWithFakes({ gh: "echo 'not json'", git: `echo ${TREE}` });
  assert(r.status === 0 && r.stdout === "skip=false", JSON.stringify(r));
});

test("a failed job lookup does not count the run: skip=false", () => {
  const r = runWithFakes({
    gh: `case "$2" in *jobs*) echo boom >&2; exit 1 ;; *) ${RUNS} ;; esac`,
    git: `echo ${TREE}`,
  });
  assert(r.status === 0 && r.stdout === "skip=false", JSON.stringify(r));
});

test("a git failure exits 0 with skip=false", () => {
  const r = runWithFakes({ gh: GH_OK, git: "exit 128" });
  assert(r.status === 0 && r.stdout === "skip=false", JSON.stringify(r));
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
