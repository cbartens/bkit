// The one way bkit lands a commit on dev: build it in a detached throwaway
// worktree off a fresh origin/dev and push it as dev. The main checkout's
// branch, index and edits are never touched, and local dev commits missing from
// origin/dev are never pushed. dev moved underneath → rebuild on the new dev and
// push again, with backoff. Used by the design / plan close, the build / debug
// roadmap mirror, and ship's close and FAILED record.

import * as fs from "node:fs";
import * as path from "node:path";
import { DEV, git, runGit } from "./lib.js";
import { TIMEOUTS } from "../shared/timeouts.js";

const REMOTE = "origin";
const UPSTREAM = `${REMOTE}/${DEV}`;

/** A dev push git rejected only because dev moved underneath: rebuild on the new dev, push again. */
export const NON_FAST_FORWARD = /\[rejected\][^\n]*\((?:fetch first|non-fast-forward)\)/;

/**
 * Milliseconds to wait before retry `retry` (1-based) of a landing: `startS`
 * doubling per retry, capped at `capS`, then jittered down by up to half so two
 * landings that collided once do not retry in step.
 */
export function landBackoffMs(
  retry: number,
  random: () => number = Math.random,
  startS: number = TIMEOUTS.LAND_BACKOFF_START_S,
  capS: number = TIMEOUTS.LAND_BACKOFF_CAP_S,
): number {
  const s = Math.min(startS * 2 ** (retry - 1), capS);
  return Math.round(s * 1000 * (0.5 + random() / 2));
}

export const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** The throwaway checkout a landing is built in, beside the feature worktrees. */
export const landDir = (root: string, fid: string) => path.join(root, ".worktrees", `_land-${fid}`);

export function dropLandTree(root: string, dir: string): void {
  if (fs.existsSync(dir)) runGit(root, ["worktree", "remove", "--force", dir]);
  runGit(root, ["worktree", "prune"]);
}

export type DevPush =
  | { kind: "landed"; sha: string; attempts: number }
  /** Refused for a reason other than dev moving (branch protection, a ruleset). */
  | { kind: "refused"; stderr: string }
  /** dev moved before every one of LAND_ATTEMPTS pushes. */
  | { kind: "exhausted"; attempts: number }
  | { kind: "fetch-failed"; stderr: string }
  | { kind: "setup-failed"; stderr: string };

/**
 * Land one commit on dev: per attempt, fetch dev, add `dir` detached at
 * origin/dev, let `build` make the commit there, push `HEAD:dev`. `build`
 * throwing stops the landing with that throw. A refusal runs `refused` on the
 * built commit first, when given. `dir` is removed on every path.
 */
export async function pushToDev(o: {
  root: string;
  dir: string;
  build: (dir: string, attempt: number) => void;
  refused?: (dir: string, stderr: string) => Promise<void>;
  log: (line: string) => void;
}): Promise<DevPush> {
  for (let attempt = 1; ; attempt++) {
    let wait = 0;
    dropLandTree(o.root, o.dir);
    try {
      const fetched = runGit(o.root, ["fetch", REMOTE, DEV]);
      if (!fetched.ok) return { kind: "fetch-failed", stderr: fetched.stderr };
      const added = runGit(o.root, ["worktree", "add", "--detach", o.dir, UPSTREAM]);
      if (!added.ok) return { kind: "setup-failed", stderr: added.stderr };
      o.build(o.dir, attempt);
      const pushed = runGit(o.dir, ["push", REMOTE, `HEAD:${DEV}`]);
      if (pushed.ok) {
        return { kind: "landed", sha: git(o.dir, ["rev-parse", "HEAD"]) ?? "", attempts: attempt };
      }
      if (!NON_FAST_FORWARD.test(pushed.stderr)) {
        await o.refused?.(o.dir, pushed.stderr);
        return { kind: "refused", stderr: pushed.stderr };
      }
      if (attempt >= TIMEOUTS.LAND_ATTEMPTS) return { kind: "exhausted", attempts: attempt };
      wait = landBackoffMs(attempt);
      o.log(
        `dev moved before push ${attempt} of ${TIMEOUTS.LAND_ATTEMPTS} — rebuilding on the new dev in ${(wait / 1000).toFixed(1)}s`,
      );
    } finally {
      dropLandTree(o.root, o.dir);
    }
    await sleep(wait);
  }
}
