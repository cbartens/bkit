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
 * Local mode gives the pre-push hook the same base, so a local slop scan compares against the
 * commit CI's does: the repo comes from `git remote get-url origin`, `origin/<branch>` stands
 * in for `event.before`, and ancestry is tested against the pushed commit (`--head`), which is
 * not always the checked-out one. gh uses its own login.
 *
 * Usage:  node scripts/ci/lanes/resolve-push-base.mjs
 *         (env: GH_TOKEN, REPO, BRANCH, BEFORE_SHA, WORKFLOW_FILE; optional SOURCE_FILE)
 *         node scripts/ci/lanes/resolve-push-base.mjs --local --branch=dev --head=<pushed sha>
 *         (env: optional WORKFLOW_FILE, SOURCE_FILE)
 * Output: the base SHA on stdout; the chosen source (`last-green-run`, `event-before`, ...;
 *         `origin/<branch>` in place of `event-before` in local mode) on stderr, and in
 *         SOURCE_FILE when that env var names a file. A source ending `(run lookup failed)` or
 *         `(resolver failed)` means the run list could not be read. Exit 0 always — every
 *         failure (gh, git, unparseable output) falls back to `event.before`, itself a valid base.
 */

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import { pathToFileURL } from "node:url";

/** The workflow whose runs establish the base. Set WORKFLOW_FILE if your CI file has another name. */
export const WORKFLOW_FILE = process.env.WORKFLOW_FILE || "bkit-ci.yml";

/**
 * Pure decision. `isAncestor(sha)` answers whether `sha` is an ancestor of the pushed commit.
 * `fallback` names the before-sha in the source (`event-before`, or `origin/<branch>` locally);
 * `lookupFailed` marks a run list that could not be read.
 */
export function choosePushBase({
  lastGreenSha,
  beforeSha,
  isAncestor,
  fallback = "event-before",
  lookupFailed = false,
}) {
  if (lastGreenSha && isAncestor(lastGreenSha)) {
    return { base: lastGreenSha, source: "last-green-run" };
  }
  let source = fallback;
  if (lookupFailed) source = `${fallback} (run lookup failed)`;
  else if (lastGreenSha) source = `${fallback} (last green run is not an ancestor)`;
  return { base: beforeSha ?? "", source };
}

/** `owner/repo` from a GitHub remote URL (https, ssh, scp-style), or "" when it has no such path. */
export function repoFromRemoteUrl(url) {
  const match = /[/:]([^/:\s]+)\/([^/\s]+?)(?:\.git)?\/?$/.exec(String(url ?? "").trim());
  return match ? `${match[1]}/${match[2]}` : "";
}

/** `--local`, `--branch=`, `--head=` from argv; anything else is ignored. */
export function parseArgs(argv) {
  const args = { local: false, branch: "", head: "" };
  for (const arg of argv) {
    if (arg === "--local") args.local = true;
    else if (arg.startsWith("--branch=")) args.branch = arg.slice("--branch=".length);
    else if (arg.startsWith("--head=")) args.head = arg.slice("--head=".length);
  }
  return args;
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

/** `{ sha, failed }`: the newest green push run's head, and whether the run list was unreadable. */
function lastGreenPushSha(repo, branch, fallbackName, now = new Date()) {
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
      `[resolve-push-base] could not list ${WORKFLOW_FILE} runs (${reason}) — using ${fallbackName}`,
    );
    return { sha: "", failed: true };
  }
  // Unparseable output throws; main() catches it and falls back to event.before.
  return { sha: newestRunSha(JSON.parse(stdout || "[]")), failed: false };
}

/** True only when `sha` is an ancestor of `head`; any git failure is "not an ancestor" (logged). */
function isAncestorOf(sha, head, fallbackName) {
  const { status, error } = spawnSync("git", ["merge-base", "--is-ancestor", sha, head], {
    stdio: "ignore",
  });
  // 0 = ancestor. 1 = not an ancestor. 128 = the SHA is not in this clone (a force-push dropped
  // it from the branch), which is also "not an ancestor". Anything else is a real git failure.
  if (!error && status === 0) return true;
  if (!error && (status === 1 || status === 128)) return false;
  const reason = error ? error.message : `git exited ${status}`;
  console.error(
    `[resolve-push-base] cannot test ancestry of ${sha} (${reason}) — using ${fallbackName}`,
  );
  return false;
}

/** stdout of a git command, or "" when it fails. */
function gitOut(args) {
  const { status, stdout, error } = spawnSync("git", args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  });
  return !error && status === 0 ? stdout.trim() : "";
}

/**
 * The resolver's inputs. CI: env vars, ancestry against HEAD. Local (`--local`): repo from
 * origin's URL, before-sha from `origin/<branch>`, ancestry against `--head`.
 */
export function resolveInputs(env, argv) {
  const args = parseArgs(argv);
  if (!args.local) {
    return {
      repo: env.REPO,
      branch: env.BRANCH,
      beforeSha: env.BEFORE_SHA,
      head: "HEAD",
      fallback: "event-before",
      fallbackName: "event.before",
    };
  }
  const branch = args.branch || "dev";
  return {
    repo: repoFromRemoteUrl(gitOut(["remote", "get-url", "origin"])),
    branch,
    beforeSha: gitOut(["rev-parse", "--verify", "--quiet", `origin/${branch}^{commit}`]),
    head: args.head || "HEAD",
    fallback: `origin/${branch}`,
    fallbackName: `origin/${branch}`,
  };
}

export function main(env, argv = []) {
  const input = resolveInputs(env, argv);
  let result;
  try {
    const lastGreen = lastGreenPushSha(input.repo, input.branch, input.fallbackName);
    result = choosePushBase({
      lastGreenSha: lastGreen.sha,
      beforeSha: input.beforeSha,
      isAncestor: (sha) => isAncestorOf(sha, input.head, input.fallbackName),
      fallback: input.fallback,
      lookupFailed: lastGreen.failed,
    });
  } catch (err) {
    console.error(
      `[resolve-push-base] unexpected failure (${err.message}) — using ${input.fallbackName}`,
    );
    result = { base: input.beforeSha ?? "", source: `${input.fallback} (resolver failed)` };
  }
  const { base, source } = result;
  console.error(`[resolve-push-base] base=${base || "(none)"} source=${source}`);
  process.stdout.write(`${base}\n`);
  if (env.SOURCE_FILE) {
    // Callback form: a failed write is logged and never changes the exit code.
    fs.writeFile(env.SOURCE_FILE, `${source}\n`, (err) => {
      if (err) console.error(`[resolve-push-base] could not write SOURCE_FILE (${err.message})`);
    });
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main(process.env, process.argv.slice(2));
}
