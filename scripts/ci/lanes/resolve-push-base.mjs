#!/usr/bin/env node
// Example. Copy into scripts/ci/lanes/ and own it. bkit install does not write this file
// and does not overwrite a copy.
/**
 * resolve-push-base.mjs — the diff base for a push run's test plan.
 *
 * A newer run on a branch cancels the older one, so the previous push's run may never have
 * finished — and `github.event.before` is that previous push. Diffing against it would leave
 * the cancelled push's changes out of every plan. The base is therefore the head of the last
 * push run on this branch that SUCCEEDED: everything since the last green run is in scope,
 * including anything a cancelled or red run carried. When there is no such run, or its head
 * is not an ancestor of HEAD (a force-push rewrote the branch), the base falls back to
 * `event.before`.
 *
 * Usage:  node scripts/ci/lanes/resolve-push-base.mjs   (env: GH_TOKEN, REPO, BRANCH, BEFORE_SHA, WORKFLOW_FILE)
 * Output: the base SHA on stdout. Exit 0 always — the fallback is itself a valid base.
 */

import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";

/** The workflow whose runs establish the base. Set WORKFLOW_FILE if your CI file has another name. */
export const WORKFLOW_FILE = process.env.WORKFLOW_FILE || "bkit-ci.yml";

/** Pure decision. `isAncestor(sha)` answers whether `sha` is an ancestor of HEAD. */
export function choosePushBase({ lastGreenSha, beforeSha, isAncestor }) {
  if (lastGreenSha && isAncestor(lastGreenSha)) {
    return { base: lastGreenSha, source: "last-green-run" };
  }
  return {
    base: beforeSha ?? "",
    source: lastGreenSha ? "event-before (last green run is not an ancestor)" : "event-before",
  };
}

/** How far back the run lookup reaches. A green run older than this falls back to event.before. */
export const LOOKBACK_DAYS = 14;

/**
 * The newest run in a list, by run number. The list's own order is NOT trusted — pick the
 * highest `run_number`, never the first row returned.
 */
export function newestRunSha(runs) {
  let newest = null;
  for (const run of runs ?? []) {
    if (typeof run?.head_sha !== "string" || !Number.isFinite(run?.run_number)) continue;
    if (!newest || run.run_number > newest.run_number) newest = run;
  }
  return newest ? newest.head_sha : "";
}

function lastGreenPushSha(repo, branch, now = new Date()) {
  const since = new Date(now.getTime() - LOOKBACK_DAYS * 86_400_000).toISOString().slice(0, 10);
  const path =
    `repos/${repo}/actions/workflows/${WORKFLOW_FILE}/runs` +
    `?branch=${encodeURIComponent(branch)}&event=push&status=success` +
    `&created=${encodeURIComponent(`>=${since}`)}&per_page=100`;
  const { status, stdout, stderr, error } = spawnSync(
    "gh",
    ["api", path, "--jq", "[.workflow_runs[] | {run_number, head_sha}]"],
    { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
  );
  // No run list (gh missing, API or auth failure) is not fatal: the caller falls back to
  // event.before. The reason is logged.
  if (error || status !== 0) {
    const reason = error ? error.message : String(stderr).split("\n")[0];
    console.error(
      `[resolve-push-base] could not list ${WORKFLOW_FILE} runs (${reason}) — using event.before`,
    );
    return "";
  }
  return newestRunSha(JSON.parse(stdout || "[]"));
}

function isAncestorOfHead(sha) {
  const { status, error } = spawnSync("git", ["merge-base", "--is-ancestor", sha, "HEAD"], {
    stdio: "ignore",
  });
  if (error) throw error;
  // 0 = ancestor. 1 = not an ancestor. 128 = the SHA is not in this clone (a force-push dropped
  // it from the branch), which is also "not an ancestor". Anything else is a real git failure.
  if (status === 0) return true;
  if (status === 1 || status === 128) return false;
  throw new Error(`git merge-base --is-ancestor ${sha} HEAD exited ${status}`);
}

export function main(env) {
  const lastGreenSha = lastGreenPushSha(env.REPO, env.BRANCH);
  const { base, source } = choosePushBase({
    lastGreenSha,
    beforeSha: env.BEFORE_SHA,
    isAncestor: isAncestorOfHead,
  });
  console.error(`[resolve-push-base] base=${base || "(none)"} source=${source}`);
  process.stdout.write(`${base}\n`);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) main(process.env);
