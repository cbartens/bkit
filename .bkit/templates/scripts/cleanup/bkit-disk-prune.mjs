// Example. Copy into scripts/cleanup/ and own it. bkit install does not write this file
// and does not overwrite a copy.
/**
 * bkit-disk-prune.mjs — this checkout's cleanup steps for `bkit disk prune`. bkit deletes
 * nothing itself: it runs only the steps listed here and in your machine file
 * (`~/.config/bkit/disk-prune.mjs`, from `bkit-disk-prune.machine.mjs`).
 *
 * Steps run from the top of the checkout, one at a time. Each step:
 *   name   what it frees, shown in the log
 *   mode   "min" (stale, cheap; runs from pre-commit) or "max" (everything that comes back by
 *          itself; runs after the pre-push gates pass and before a worktree is made on a low
 *          disk). `max` runs the `min` steps too.
 *   run    a shell command (`sh -c`) or a function `({ cwd, log, note }) => …`; non-zero exit
 *          or a throw = failed, logged, the next step still runs. `note(text)` = something
 *          only a person can decide; `bkit tips` lists it until the next sweep
 *   skip   optional; a shell command (exit 0 = skip) or a function returning a reason to skip
 *   paths  optional; what `bkit disk prune --dry-run` sizes, the most the step can free
 *          (relative, `~/…`, or globs)
 *
 * Keep a step only when what it deletes comes back by itself. Edit, add or drop freely:
 * paths below assume a monorepo with apps under `apps/`.
 */

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

/** True when a process whose full command line matches `pattern` is running. */
const running = (pattern) => spawnSync("pgrep", ["-f", pattern]).status === 0;

const turboRunning = () => running("(^|/)turbo( |$)") && "turbo is running";
const nextRunning = () =>
  running("(^|/)next( (dev|build|start)|-server)") && "a Next.js server or build is running";

/** `text` as JSON; null when it is not. */
function parseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/** Days since `wt`'s last commit; Infinity when unreadable. */
function idleDays(wt) {
  const r = spawnSync("git", ["-C", wt, "log", "-1", "--format=%ct"], { encoding: "utf8" });
  const at = Number(r.stdout.trim());
  return r.status === 0 && at > 0 ? (Date.now() / 1000 - at) / 86400 : Infinity;
}

/**
 * True when a merged pull request's head is exactly `sha`: a squash merge leaves the
 * branch's own commits on no remote. Needs `gh`; false when it cannot answer.
 */
function mergedPrAt(cwd, branch, sha) {
  if (branch === "") return false;
  const r = spawnSync(
    "gh",
    ["pr", "list", "--head", branch, "--state", "merged", "--json", "headRefOid"],
    { cwd, encoding: "utf8" },
  );
  const prs = r.status === 0 ? parseJson(r.stdout) : null;
  return Array.isArray(prs) && prs.some((pr) => pr.headRefOid === sha);
}

/**
 * Leftover worktree `wt` (named `fid`): `{ keep }` while in use, `{ note }` when only a
 * person can tell, else `{}` — removing it loses nothing.
 */
function judge(cwd, wt, fid) {
  const git = (...args) => spawnSync("git", ["-C", wt, ...args], { encoding: "utf8" });
  if (fs.globSync(path.join(cwd, "docs/plans/*/logs", fid, ".lock")).length > 0)
    return { keep: "a bkit workflow holds its lock" };
  if (idleDays(wt) < 2) return { keep: "committed to in the last 2 days" };
  const status = git("status", "--porcelain");
  if (status.status !== 0) return { note: "not a git worktree; delete the folder if unneeded" };
  if (status.stdout.trim() !== "")
    return { note: `uncommitted or untracked files (\`git -C .worktrees/${fid} status\`)` };
  if (git("rev-list", "HEAD", "--not", "--remotes").stdout.trim() !== "") {
    const branch = git("branch", "--show-current").stdout.trim();
    const sha = git("rev-parse", "HEAD").stdout.trim();
    if (!mergedPrAt(cwd, branch, sha))
      return { note: "commits on no remote branch, and no merged pull request ends at HEAD" };
  }
  return {};
}

/** Remove worktree `wt`; null when gone, else why not. */
function removeWorktree(cwd, wt, fid) {
  const r = spawnSync("pnpm", ["-s", "bkit", "worktrees", "remove", `--fid=${fid}`], {
    cwd,
    encoding: "utf8",
  });
  const out = parseJson(r.stdout);
  if (out?.removed === true) return null;
  if (out?.reason !== "not-owned")
    return `bkit worktrees remove failed (${out?.reason ?? `exit ${r.status}`})`;
  // No workflow made it, so bkit leaves it; nothing in it is lost, so plain git removes it.
  const g = spawnSync("git", ["-C", cwd, "worktree", "remove", wt], { encoding: "utf8" });
  return g.status === 0 ? null : `git worktree remove failed: ${g.stderr.trim()}`;
}

export default [
  {
    // Comes back: the next build re-runs the tasks it needs.
    name: "Turborepo cache entries untouched for 7 days",
    mode: "min",
    paths: [".turbo/cache"],
    skip: turboRunning,
    run: "[ ! -d .turbo/cache ] || find .turbo/cache -type f -mtime +7 -delete",
  },
  {
    // Comes back: the next `next build` / `next dev`.
    name: "Next.js cache entries untouched for 7 days",
    mode: "min",
    paths: ["apps/*/.next/cache"],
    skip: nextRunning,
    run: 'for d in apps/*/.next/cache; do [ ! -d "$d" ] || find "$d" -type f -mtime +7 -delete; done',
  },
  {
    // Comes back: the next build, slower once.
    name: "All of the Turborepo cache",
    mode: "max",
    paths: [".turbo/cache"],
    skip: turboRunning,
    run: "rm -rf .turbo/cache",
  },
  {
    // Comes back: the next web, Android or iOS build.
    name: "Next.js caches and native build output",
    mode: "max",
    paths: ["apps/*/.next/cache", "apps/*/android/app/build", "apps/*/ios/build"],
    skip: () =>
      nextRunning() || (running("GradleDaemon|xcodebuild") && "a Gradle or Xcode build is running"),
    run: "rm -rf apps/*/.next/cache apps/*/android/app/build apps/*/ios/build",
  },
  {
    // Comes back: `bkit worktrees setup` re-creates a worktree from its branch, and
    // reinstalls its node_modules. Removed only when nothing is lost: clean, and every commit
    // on a remote or at the head of a merged pull request (`gh`). Ignored files (a copied
    // `.env`) go with it; branches stay. Kept silently: a workflow's lock, a commit in the
    // last 2 days. Anything else → a note `bkit tips` lists, for a person to decide.
    name: "Leftover agent worktrees nothing would be lost from",
    mode: "max",
    paths: [".worktrees/*"],
    run: ({ cwd, log, note }) => {
      const root = path.join(cwd, ".worktrees");
      if (!fs.existsSync(root)) return;
      for (const fid of fs.readdirSync(root)) {
        const wt = path.join(root, fid);
        const v = judge(cwd, wt, fid);
        if (v.keep) log(`kept .worktrees/${fid}: ${v.keep}`);
        else if (v.note) note(`.worktrees/${fid}: ${v.note}`);
        else {
          const failed = removeWorktree(cwd, wt, fid);
          if (failed === null) log(`.worktrees/${fid}: removed`);
          else note(`.worktrees/${fid}: ${failed}`);
        }
      }
    },
  },
];
