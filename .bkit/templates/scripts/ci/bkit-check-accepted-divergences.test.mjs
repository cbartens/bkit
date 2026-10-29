#!/usr/bin/env node
// Example. Copy into scripts/ci/ and own it. bkit install does not write this file
// and does not overwrite a copy.
/**
 * bkit-check-accepted-divergences.test.mjs — unit tests for the accepted-divergence guard.
 *
 * Pure Node, no runner: `node scripts/ci/bkit-check-accepted-divergences.test.mjs`.
 * Exit: 0 = all tests passed, 1 = at least one test failed.
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { collectSites, checkRegistry } from "./bkit-check-accepted-divergences.mjs";

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

const WORKFLOW = [
  "name: CI",
  "on:",
  "  push:",
  "jobs:",
  "  bkit-tests-static:",
  "    steps:",
  "      - name: Check Default Branch Lags Dev",
  "        if: github.event_name == 'push' && github.ref == 'refs/heads/dev'",
  "        run: echo hi",
  "  bkit-tests-check:",
  "    if: ${{ !cancelled() }}",
  "    steps:",
  "      - name: Assert Test Plan Followed",
  "        run: node scripts/ci/assert-test-plan-followed.mjs",
  "",
].join("\n");

function withWorkflows(write, fn) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "div-guard-"));
  fs.writeFileSync(path.join(dir, "bkit-ci.yml"), write);
  try {
    fn(dir);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

test("collects every event-keyed site with its job and step", () => {
  withWorkflows(WORKFLOW, (dir) => {
    const sites = collectSites(dir);
    const keys = sites.map((s) => `${s.job}#${s.step}#${s.field}`).sort();
    assert(
      keys.includes("bkit-tests-static#Check Default Branch Lags Dev#github.event_name"),
      keys.join(", "),
    );
    assert(
      keys.includes("bkit-tests-static#Check Default Branch Lags Dev#github.ref"),
      keys.join(", "),
    );
    assert(sites.length === 2, `expected 2 sites, got ${sites.length}`);
  });
});

test("collects the workflow-level concurrency block and steps whose first key is not name/uses", () => {
  const yml = [
    "name: CI",
    "concurrency:",
    "  group: ci-${{ github.event_name }}",
    "  cancel-in-progress: ${{ github.ref != 'refs/heads/main' }}",
    "jobs:",
    "  j:",
    "    steps:",
    "      - id: first",
    "        name: Named After Id",
    "        if: github.ref_name == 'dev'",
    "      - run: echo ${{ github.base_ref }}",
    "      - if: github.head_ref",
    "        uses: actions/checkout@v4",
    "        with:",
    "          name: not-a-step-name",
    "",
  ].join("\n");
  withWorkflows(yml, (dir) => {
    const keys = collectSites(dir).map((s) => `${s.job}#${s.step}#${s.field}`);
    for (const want of [
      "(workflow)#concurrency#github.event_name",
      "(workflow)#concurrency#github.ref",
      "j#Named After Id#github.ref_name",
      "j#step-2#github.base_ref",
      "j#actions/checkout@v4#github.head_ref",
    ]) {
      assert(keys.includes(want), `missing ${want} in ${keys.join(", ")}`);
    }
    assert(keys.length === 5, `expected 5 sites, got ${keys.length}`);
  });
});

test("an unregistered site is reported missing", () => {
  const sites = [
    { file: ".github/workflows/bkit-ci.yml", job: "j", step: "s", field: "github.event_name" },
  ];
  const r = checkRegistry(sites, { decisions: ["one-run-per-branch"], sites: [] });
  assert(r.missing.length === 1, "expected one missing");
  assert(r.stale.length === 0, "expected no stale");
});

test("a registry row that no longer exists is stale", () => {
  const rows = [
    {
      file: ".github/workflows/bkit-ci.yml",
      job: "gone",
      step: "gone",
      field: "github.ref",
      decision: "one-run-per-branch",
      reason: "x",
    },
  ];
  const r = checkRegistry([], { decisions: ["one-run-per-branch"], sites: rows });
  assert(r.stale.length === 1, "expected one stale");
});

test("a row with an unknown decision or no reason is flagged", () => {
  const site = {
    file: ".github/workflows/bkit-ci.yml",
    job: "j",
    step: "s",
    field: "github.ref",
  };
  const rows = [{ ...site, decision: "not-a-decision", reason: "x" }];
  const r = checkRegistry([site], { decisions: ["one-run-per-branch"], sites: rows });
  assert(r.badDecision.length === 1, "expected one badDecision");
});

test("a registered, live, reasoned site is clean", () => {
  const site = {
    file: ".github/workflows/bkit-ci.yml",
    job: "j",
    step: "s",
    field: "github.ref",
  };
  const rows = [{ ...site, decision: "one-run-per-branch", reason: "why" }];
  const r = checkRegistry([site], { decisions: ["one-run-per-branch"], sites: rows });
  assert(
    r.missing.length === 0 && r.stale.length === 0 && r.badDecision.length === 0,
    JSON.stringify(r),
  );
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
