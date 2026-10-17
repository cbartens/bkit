#!/usr/bin/env node
// Example. Copy into scripts/ci/ and own it. bkit install does not write this file
// and does not overwrite a copy.
/**
 * check-dependency-audit.mjs — the dependency-audit gate.
 *
 * Runs `pnpm audit --json` and reds when a blocking advisory (by default high or critical)
 * reaches the lockfile without an acceptance in the registry. An acceptance is a row naming
 * the advisory, a reason and an expiry date. The guard reds when:
 *   - a blocking advisory has no acceptance (a new advisory),
 *   - an acceptance has expired, or runs longer than its severity allows (`blocking` days),
 *   - an acceptance names an advisory the audit no longer reports (a stale row),
 *   - a row carries no advisory, no reason, or no `YYYY-MM-DD` expiry, or repeats one,
 *   - the audit cannot run or prints no report (fails closed; never green on no answer).
 *
 * pnpm's own `auditConfig.ignoreGhsas` ignores an advisory forever and records no reason;
 * the registry makes every exception say why and come back for review.
 *
 * Reads pnpm's report shape (`advisories`: id → { github_advisory_id, severity, module_name,
 * patched_versions, findings }). Another package manager → adapt `blockingFindings()`.
 *
 * Usage:  node scripts/ci/check-dependency-audit.mjs [--registry=<file>] [--report=<file>]
 *         --report reads a saved `pnpm audit --json` instead of running the audit.
 * Exit:   0 = every blocking advisory accepted and every row live, 1 = drift or no report.
 */

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/** Severity → the most days an acceptance may run. Severities not listed never block. */
export const DEFAULT_BLOCKING = { critical: 7, high: 30 };

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const DAY_MS = 24 * 60 * 60 * 1000;

/** `YYYY-MM-DD` of a Date, in UTC. */
export function isoDay(date) {
  return date.toISOString().slice(0, 10);
}

/** Whole days from `from` to `to`, both `YYYY-MM-DD`. */
function daysBetween(from, to) {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / DAY_MS);
}

/**
 * The blocking advisories in a pnpm audit report, one per advisory id.
 * @returns {Array<{advisory: string, severity: string, module: string, patched: string, versions: string[]}>}
 */
export function blockingFindings(report, blocking = DEFAULT_BLOCKING) {
  const found = new Map();
  for (const a of Object.values(report.advisories ?? {})) {
    if (!(a.severity in blocking)) continue;
    const advisory = a.github_advisory_id || String(a.id);
    const prior = found.get(advisory);
    const versions = (a.findings ?? []).map((f) => f.version);
    if (prior) prior.versions.push(...versions);
    else
      found.set(advisory, {
        advisory,
        severity: a.severity,
        module: a.module_name,
        patched: a.patched_versions ?? "none",
        versions,
      });
  }
  return [...found.values()].sort((x, y) => x.advisory.localeCompare(y.advisory));
}

/**
 * Compare the blocking findings with the registry's acceptances on `today` (`YYYY-MM-DD`).
 * An acceptance is valid through its `expires` day.
 */
export function checkAcceptances(findings, registry, today) {
  const blocking = registry.blocking ?? DEFAULT_BLOCKING;
  const rows = registry.accepted ?? [];
  const byAdvisory = new Map(findings.map((f) => [f.advisory, f]));
  const invalid = [];
  const expired = [];
  const tooLong = [];
  const stale = [];
  const accepted = new Set();

  for (const row of rows) {
    if (!row.advisory || !row.reason || !DATE_RE.test(row.expires ?? "")) {
      invalid.push({ row, why: "needs advisory, reason and a YYYY-MM-DD expires" });
      continue;
    }
    if (accepted.has(row.advisory)) {
      invalid.push({ row, why: "listed twice" });
      continue;
    }
    accepted.add(row.advisory);
    const finding = byAdvisory.get(row.advisory);
    if (!finding) {
      stale.push({ row });
      continue;
    }
    if (row.expires < today) {
      expired.push({ row, finding });
      continue;
    }
    const limit = blocking[finding.severity];
    if (daysBetween(today, row.expires) > limit) tooLong.push({ row, finding, limit });
  }
  const missing = findings.filter((f) => !accepted.has(f.advisory));
  return { missing, invalid, expired, tooLong, stale };
}

/**
 * Run `pnpm audit --json`, retrying when it prints no report (a registry blip).
 * pnpm exits 1 whenever it finds an advisory, so the exit code is not the signal; the report is.
 * @returns {object | null} the parsed report, or null after three attempts.
 */
function runAudit() {
  for (let attempt = 1; attempt <= 3; attempt++) {
    const res = spawnSync("pnpm", ["audit", "--json"], {
      encoding: "utf-8",
      maxBuffer: 64 * 1024 * 1024,
    });
    try {
      const report = JSON.parse(res.stdout);
      if (report && typeof report.advisories === "object") return report;
    } catch {
      // not JSON — fall through to the retry
    }
    const detail = (res.stderr || res.stdout || "").trim().split("\n").slice(-3).join(" | ");
    console.error(`::warning::dependency-audit: attempt ${attempt} printed no report — ${detail}`);
  }
  return null;
}

function main(argv) {
  const arg = (name, fallback) => {
    const hit = argv.find((a) => a.startsWith(`--${name}=`));
    return hit ? hit.slice(name.length + 3) : fallback;
  };
  const registryPath = arg("registry", path.join("scripts", "ci", "accepted-advisories.json"));
  const reportPath = arg("report", null);

  const registry = fs.existsSync(registryPath)
    ? JSON.parse(fs.readFileSync(registryPath, "utf-8"))
    : { accepted: [] };
  const report = reportPath ? JSON.parse(fs.readFileSync(reportPath, "utf-8")) : runAudit();
  if (!report || typeof report.advisories !== "object") {
    console.error("::error::dependency-audit: the audit printed no report — failing closed");
    process.exit(1);
  }

  const findings = blockingFindings(report, registry.blocking ?? DEFAULT_BLOCKING);
  const today = isoDay(new Date());
  const { missing, invalid, expired, tooLong, stale } = checkAcceptances(findings, registry, today);

  const fmt = (f) =>
    `  ${f.advisory} ${f.severity} ${f.module} ${f.versions.join(", ")} (patched: ${f.patched})`;
  let failed = 0;
  const fail = (rows, title, line) => {
    if (!rows.length) return;
    failed = 1;
    console.error(`::error::dependency-audit: ${rows.length} ${title}:`);
    for (const r of rows) console.error(line(r));
  };
  fail(
    missing,
    "blocking advisory(ies) with no acceptance — upgrade, or accept with a reason and expiry",
    fmt,
  );
  fail(
    expired,
    "acceptance(s) expired — upgrade, or re-review and renew",
    (r) => `${fmt(r.finding)} expired ${r.row.expires}`,
  );
  fail(
    tooLong,
    "acceptance(s) run past their severity's limit",
    (r) => `${fmt(r.finding)} expires ${r.row.expires}, limit ${r.limit} days`,
  );
  fail(
    stale,
    "acceptance(s) for advisories the audit no longer reports — delete the row",
    (r) => `  ${r.row.advisory} ${r.row.module ?? ""}`,
  );
  fail(invalid, "invalid row(s)", (r) => `  ${JSON.stringify(r.row)} — ${r.why}`);
  if (!failed) {
    console.error(
      `[dependency-audit] ${findings.length} blocking advisory(ies), all accepted and in date`,
    );
  }
  process.exit(failed);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2));
}
