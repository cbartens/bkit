#!/usr/bin/env node
// Example. Copy into scripts/ci/ and own it. bkit install does not write this file
// and does not overwrite a copy.
/**
 * bkit-check-dependency-audit.test.mjs — unit tests for the dependency-audit gate.
 *
 * Pure Node, no runner: `node scripts/ci/bkit-check-dependency-audit.test.mjs`.
 * Exit: 0 = all tests passed, 1 = at least one test failed.
 */

import {
  blockingFindings,
  checkAcceptances,
  classifyAuditOutput,
} from "./bkit-check-dependency-audit.mjs";

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

const REPORT = {
  advisories: {
    1: {
      id: 1,
      github_advisory_id: "GHSA-crit",
      severity: "critical",
      module_name: "proxy-addr",
      patched_versions: ">=2.0.8",
      findings: [{ version: "2.0.7" }],
    },
    2: {
      id: 2,
      github_advisory_id: "GHSA-high",
      severity: "high",
      module_name: "braces",
      patched_versions: "<0.0.0",
      findings: [{ version: "3.0.3" }],
    },
    3: {
      id: 3,
      github_advisory_id: "GHSA-mod",
      severity: "moderate",
      module_name: "nanoid",
      findings: [{ version: "3.3.7" }],
    },
  },
};
const TODAY = "2026-10-17";
const accept = (advisory, expires, extra = {}) => ({
  advisory,
  reason: "no patched release",
  expires,
  ...extra,
});

test("keeps high and critical, drops moderate", () => {
  const ids = blockingFindings(REPORT).map((f) => f.advisory);
  assert(ids.join() === "GHSA-crit,GHSA-high", `got ${ids}`);
});

test("a custom blocking table changes what blocks", () => {
  const ids = blockingFindings(REPORT, { critical: 7 }).map((f) => f.advisory);
  assert(ids.join() === "GHSA-crit", `got ${ids}`);
});

test("an advisory with no acceptance is missing", () => {
  const r = checkAcceptances(blockingFindings(REPORT), { accepted: [] }, TODAY);
  assert(r.missing.length === 2, `missing ${r.missing.length}`);
});

test("accepted, in-date advisories pass", () => {
  const registry = {
    accepted: [accept("GHSA-crit", "2026-10-24"), accept("GHSA-high", "2026-11-16")],
  };
  const r = checkAcceptances(blockingFindings(REPORT), registry, TODAY);
  const total = Object.values(r).reduce((n, rows) => n + rows.length, 0);
  assert(total === 0, JSON.stringify(r));
});

test("an acceptance is valid through its expiry day, expired the day after", () => {
  const registry = { accepted: [accept("GHSA-high", TODAY)] };
  const findings = blockingFindings(REPORT, { high: 30 });
  assert(checkAcceptances(findings, registry, TODAY).expired.length === 0, "expired on its day");
  assert(checkAcceptances(findings, registry, "2026-10-18").expired.length === 1, "not expired");
});

test("an acceptance past its severity's limit is too long", () => {
  const registry = { accepted: [accept("GHSA-crit", "2026-10-25")] };
  const r = checkAcceptances(blockingFindings(REPORT, { critical: 7 }), registry, TODAY);
  assert(r.tooLong.length === 1 && r.tooLong[0].limit === 7, JSON.stringify(r.tooLong));
});

test("an acceptance for an advisory no longer reported is stale", () => {
  const registry = { accepted: [accept("GHSA-gone", "2026-10-20")] };
  const r = checkAcceptances(blockingFindings(REPORT), registry, TODAY);
  assert(r.stale.length === 1, `stale ${r.stale.length}`);
});

test("a row with no reason, a bad date, or a repeat is invalid", () => {
  const registry = {
    accepted: [
      { advisory: "GHSA-crit", expires: "2026-10-20" },
      accept("GHSA-high", "next month"),
      accept("GHSA-crit", "2026-10-20"),
      accept("GHSA-crit", "2026-10-20"),
    ],
  };
  const r = checkAcceptances(blockingFindings(REPORT), registry, TODAY);
  assert(r.invalid.length === 3, `invalid ${r.invalid.length}`);
});

test("a report with no advisories has nothing to block", () => {
  assert(blockingFindings({ advisories: {} }).length === 0, "found something");
});

test("classifies a report as ok", () => {
  const r = classifyAuditOutput(JSON.stringify({ advisories: {} }));
  assert(r.status === "ok", `got ${r.status}`);
});

test("classifies an unreachable registry by its network code", () => {
  const r = classifyAuditOutput(
    JSON.stringify({ error: { code: "ENOTFOUND", message: "getaddrinfo ENOTFOUND" } }),
  );
  assert(r.status === "unreachable" && r.code === "ENOTFOUND", JSON.stringify(r));
});

test("a registry that answered badly is a failure, not unreachable", () => {
  for (const code of ["ERR_PNPM_AUDIT_BAD_RESPONSE", "ERR_PNPM_AUDIT_ENDPOINT_NOT_EXISTS"]) {
    const r = classifyAuditOutput(JSON.stringify({ error: { code, message: code } }));
    assert(r.status === "failed", `${code} → ${r.status}`);
  }
});

test("empty or non-JSON output is a failure", () => {
  assert(classifyAuditOutput("").status === "failed", "empty");
  assert(classifyAuditOutput("not json").status === "failed", "not json");
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
