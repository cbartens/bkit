#!/usr/bin/env node
// Example. Copy into scripts/ci/lanes/ and own it. bkit install does not write this file
// and does not overwrite a copy.
/**
 * check-tree-cache.mjs — whether a pull request lane may skip its suite.
 *
 * A pull request lane skips when the files it would test are exactly the files a push run
 * already tested green. "The files" is the git tree of the checked-out commit (for a pull
 * request, GitHub's merge preview). A push run tests its head commit's tree, so a green push
 * run whose head has the same tree proved this lane — provided that run's job of the same name
 * concluded `success` (a `[skip ci]` or `run_level=none` push concludes green with every lane
 * skipped, which proves nothing).
 *
 * Push and dispatch runs never skip: the run on a push to dev or the default branch is the
 * record of what that branch holds, so it always runs the suite. `[force build]` /
 * `[force cache]` in the pull request title skip nothing either.
 *
 * Usage:  node scripts/ci/lanes/check-tree-cache.mjs >> "$GITHUB_OUTPUT"
 *         (env: GH_TOKEN, REPO, EVENT_NAME, JOB, PR_TITLE; optional WORKFLOW_FILE)
 * Output: `skip=true` or `skip=false` on stdout; the reason on stderr. Exit 0 always — every
 *         failure (gh, git, unparseable output) resolves to `skip=false`, which runs the suite.
 */

import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";

/** The workflow whose runs count. Set WORKFLOW_FILE if your CI file has another name. */
export const WORKFLOW_FILE = process.env.WORKFLOW_FILE || "bkit-ci.yml";

/** How far back the run lookup reaches. */
export const LOOKBACK_DAYS = 7;

/** At most this many tree-matching runs have their jobs read before giving up. */
export const MAX_JOB_LOOKUPS = 3;

const FORCE_MARKERS = ["[force build]", "[force cache]"];

/**
 * Pure decision. `runs` are green push runs (`{ id, run_number, tree }`); `jobConclusion(id)`
 * returns the conclusion of this lane's job in run `id` ("" when unknown).
 */
export function decideTreeSkip({ eventName, title, headTree, runs, jobConclusion }) {
  if (eventName !== "pull_request") {
    return { skip: false, reason: `${eventName || "unknown"} event — only a pull request skips` };
  }
  const marker = FORCE_MARKERS.find((m) => (title ?? "").includes(m));
  if (marker) return { skip: false, reason: `${marker} in the title` };
  if (!headTree) return { skip: false, reason: "no tree for HEAD" };
  const matches = (runs ?? [])
    .filter((r) => r?.tree === headTree && Number.isFinite(r?.id))
    .sort((a, b) => (b.run_number ?? 0) - (a.run_number ?? 0))
    .slice(0, MAX_JOB_LOOKUPS);
  for (const run of matches) {
    const conclusion = jobConclusion(run.id);
    if (conclusion === "success") {
      return { skip: true, reason: `tree ${headTree} passed in push run ${run.id}` };
    }
  }
  return {
    skip: false,
    reason: matches.length
      ? `tree ${headTree} matched ${matches.length} push run(s), none with this job green`
      : `no green push run in ${LOOKBACK_DAYS} days has tree ${headTree}`,
  };
}

function gh(args) {
  const { status, stdout, stderr, error } = spawnSync("gh", args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  if (error || status !== 0) {
    throw new Error(error ? error.message : String(stderr).split("\n")[0]);
  }
  return stdout;
}

function greenPushRuns(repo, now = new Date()) {
  const since = new Date(now.getTime() - LOOKBACK_DAYS * 86_400_000).toISOString().slice(0, 10);
  const path =
    `repos/${repo}/actions/workflows/${WORKFLOW_FILE}/runs` +
    `?event=push&status=success&created=${encodeURIComponent(`>=${since}`)}&per_page=100`;
  const out = gh([
    "api",
    path,
    "--jq",
    "[.workflow_runs[] | {id, run_number, tree: .head_commit.tree_id}]",
  ]);
  return JSON.parse(out || "[]");
}

function jobConclusionIn(repo, job) {
  return (runId) => {
    try {
      const out = gh([
        "api",
        `repos/${repo}/actions/runs/${runId}/jobs?per_page=100`,
        "--jq",
        `[.jobs[] | select(.name == ${JSON.stringify(job)}) | .conclusion] | first // ""`,
      ]);
      return out.trim();
    } catch (err) {
      console.error(`[check-tree-cache] could not read jobs of run ${runId} (${err.message})`);
      return "";
    }
  };
}

function headTree() {
  const { status, stdout } = spawnSync("git", ["rev-parse", "HEAD^{tree}"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  });
  return status === 0 ? stdout.trim() : "";
}

export function main(env) {
  let result;
  try {
    const isPr = env.EVENT_NAME === "pull_request";
    result = decideTreeSkip({
      eventName: env.EVENT_NAME,
      title: env.PR_TITLE,
      headTree: isPr ? headTree() : "",
      runs: isPr ? greenPushRuns(env.REPO) : [],
      jobConclusion: jobConclusionIn(env.REPO, env.JOB),
    });
  } catch (err) {
    result = { skip: false, reason: `lookup failed (${err.message}) — running the suite` };
  }
  console.error(`[check-tree-cache] skip=${result.skip} — ${result.reason}`);
  process.stdout.write(`skip=${result.skip}\n`);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) main(process.env);
