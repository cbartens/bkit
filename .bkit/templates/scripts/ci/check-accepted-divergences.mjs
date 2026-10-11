#!/usr/bin/env node
// Example. Copy into scripts/ci/ and own it. bkit install does not write this file
// and does not overwrite a copy.
/**
 * check-accepted-divergences.mjs — the accepted-divergence guard.
 *
 * CI branches on the event in deliberate places (a PR plans against its base; a push against
 * the last green run; `@live` is push-only). Each is an ACCEPTED divergence from "one script
 * runs everywhere", and each is recorded in a registry with its decision and reason. This
 * guard reds when:
 *   - a workflow step reads an event field that no registry row covers (a new site),
 *   - a registry row names a site that no longer exists (a stale row),
 *   - a row names a decision absent from the table, or carries no reason.
 *
 * A new comparison inside an already-registered step is a new site: the site key is
 * `file#job#step#field`.
 *
 * Usage:  node scripts/ci/check-accepted-divergences.mjs [--workflows=<dir>] [--registry=<file>]
 * Exit:   0 = every site registered and every row live, 1 = drift.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/** The event reads that are a divergence when a workflow branches on them. */
const FIELD_RE =
  /github\.(?:event_name|ref_name|base_ref|head_ref|ref)\b|github\.event\.head_commit\.message|github\.event\.pull_request\.title/g;

/** Split a registry row's `field` back out of a possibly longer match. */
function normalizedField(match) {
  return match.replace(/\s+/g, " ").trim();
}

/**
 * Collect every event-keyed site in the workflow files under `workflowsDir`.
 * A line-based scan — deliberately no YAML dependency, so the guard is portable.
 * @returns {Array<{file: string, job: string, step: string, field: string, line: number}>}
 */
export function collectSites(workflowsDir, fileFilter = /\.(ya?ml)$/) {
  const sites = [];
  if (!fs.existsSync(workflowsDir)) return sites;
  for (const name of fs.readdirSync(workflowsDir).sort()) {
    if (!fileFilter.test(name)) continue;
    const file = path.join(".github", "workflows", name).split(path.sep).join("/");
    const lines = fs.readFileSync(path.join(workflowsDir, name), "utf-8").split("\n");
    let job = "";
    let step = "";
    let inJobs = false;
    const seen = new Set();
    lines.forEach((line, i) => {
      const code = line.replace(/\s+#.*$/, "");
      if (/^jobs:\s*$/.test(code)) {
        inJobs = true;
        return;
      }
      if (inJobs && /^\S/.test(code)) {
        // A new top-level key closes the `jobs:` block.
        inJobs = false;
      }
      if (!inJobs) return;
      const jobMatch = /^ {2}([A-Za-z0-9_.-]+):\s*$/.exec(code);
      if (jobMatch) {
        job = jobMatch[1];
        step = "";
        return;
      }
      const stepMatch = /^\s{4,}- (?:name|uses):\s*(.+?)\s*$/.exec(line);
      if (stepMatch) {
        step = stepMatch[1].replace(/^["']|["']$/g, "");
      }
      for (const m of code.matchAll(FIELD_RE)) {
        const field = normalizedField(m[0]);
        const key = `${file}#${job}#${step}#${field}`;
        if (seen.has(key)) continue;
        seen.add(key);
        sites.push({ file, job, step, field, line: i + 1 });
      }
    });
  }
  return sites;
}

/**
 * Compare collected sites against the registry.
 * @returns {{missing: object[], stale: object[], badDecision: object[]}}
 */
export function checkRegistry(sites, registry) {
  const known = new Set(registry.decisions ?? []);
  const rows = registry.sites ?? [];
  const siteKeys = new Set(sites.map((s) => `${s.file}#${s.job}#${s.step}#${s.field}`));
  const missing = [];
  const stale = [];
  const badDecision = [];
  for (const site of sites) {
    const key = `${site.file}#${site.job}#${site.step}#${site.field}`;
    if (!rows.some((r) => `${r.file}#${r.job}#${r.step}#${r.field}` === key)) missing.push(site);
  }
  for (const row of rows) {
    const key = `${row.file}#${row.job}#${row.step}#${row.field}`;
    if (!siteKeys.has(key)) stale.push(row);
    else if (!known.has(row.decision) || !row.reason) badDecision.push(row);
  }
  return { missing, stale, badDecision };
}

function main(argv) {
  const arg = (name, fallback) => {
    const hit = argv.find((a) => a.startsWith(`--${name}=`));
    return hit ? hit.slice(name.length + 3) : fallback;
  };
  const workflowsDir = arg("workflows", path.join(".github", "workflows"));
  const registryPath = arg("registry", path.join("scripts", "ci", "accepted-divergences.json"));

  if (!fs.existsSync(registryPath)) {
    console.error(`[accepted-divergences] no registry at ${registryPath} — nothing to check`);
    process.exit(0);
  }
  const registry = JSON.parse(fs.readFileSync(registryPath, "utf-8"));
  const sites = collectSites(workflowsDir);
  const { missing, stale, badDecision } = checkRegistry(sites, registry);

  const fmt = (s) => `  ${s.file} (job ${s.job || "?"}, step ${s.step || "?"}) reads ${s.field}`;
  let failed = 0;
  if (missing.length) {
    failed = 1;
    console.error(
      `::error::accepted-divergences: ${missing.length} unregistered event-keyed site(s):`,
    );
    for (const s of missing) console.error(fmt(s));
  }
  if (stale.length) {
    failed = 1;
    console.error(
      `::error::accepted-divergences: ${stale.length} registry row(s) no longer exist:`,
    );
    for (const s of stale) console.error(fmt(s));
  }
  if (badDecision.length) {
    failed = 1;
    console.error(
      `::error::accepted-divergences: ${badDecision.length} row(s) carry an unknown decision or no reason:`,
    );
    for (const s of badDecision) console.error(fmt(s));
  }
  if (!failed) console.error(`[accepted-divergences] ${sites.length} site(s), all registered`);
  process.exit(failed);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2));
}
