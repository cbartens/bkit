// audits/repo/resolve-push-base.test.ts — unit tests for bkit's own push-run diff base
// (scripts/ci/lanes/resolve-push-base.mjs), the dogfood of the shipped template. The same
// decisions ship to consumers with the template and its standalone test.
//
// The script is ESM `.mjs`; imported dynamically so this Vitest ts file can exercise it.

import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, it } from "vitest";

const SCRIPT = path.resolve("scripts/ci/lanes/resolve-push-base.mjs");

interface PushBaseInput {
  lastGreenSha: string;
  beforeSha?: string;
  isAncestor: (sha: string) => boolean;
  fallback?: string;
  lookupFailed?: boolean;
}
const { choosePushBase, newestRunSha, parseArgs, repoFromRemoteUrl } = (await import(
  pathToFileURL(SCRIPT).href
)) as {
  choosePushBase: (input: PushBaseInput) => { base: string; source: string };
  newestRunSha: (runs: unknown) => string;
  parseArgs: (argv: string[]) => { local: boolean; branch: string; head: string };
  repoFromRemoteUrl: (url: unknown) => string;
};

const GREEN = "a".repeat(40);
const BEFORE = "b".repeat(40);
const ancestors =
  (...shas: string[]) =>
  (sha: string): boolean =>
    shas.includes(sha);

describe("resolve-push-base", () => {
  it("uses the last green run's head, not event.before, so a cancelled push stays in scope", () => {
    const r = choosePushBase({
      lastGreenSha: GREEN,
      beforeSha: BEFORE,
      isAncestor: ancestors(GREEN, BEFORE),
    });
    expect(r).toEqual({ base: GREEN, source: "last-green-run" });
  });

  it("falls back to event.before when there is no green run on the branch", () => {
    const r = choosePushBase({ lastGreenSha: "", beforeSha: BEFORE, isAncestor: ancestors() });
    expect(r).toEqual({ base: BEFORE, source: "event-before" });
  });

  it("falls back to event.before when the last green head is not an ancestor (force-push)", () => {
    const r = choosePushBase({
      lastGreenSha: GREEN,
      beforeSha: BEFORE,
      isAncestor: ancestors(BEFORE),
    });
    expect(r.base).toBe(BEFORE);
    expect(r.source.startsWith("event-before")).toBe(true);
  });

  it("returns an empty base when there is nothing at all (planner run-to-be-safe path)", () => {
    const r = choosePushBase({ lastGreenSha: "", beforeSha: undefined, isAncestor: ancestors() });
    expect(r.base).toBe("");
  });

  it("picks the newest run by run number, whatever order the API lists them in", () => {
    const runs = [
      { run_number: 2317, head_sha: "older" },
      { run_number: 2679, head_sha: "today" },
      { run_number: 2675, head_sha: "yesterday" },
    ];
    expect(newestRunSha(runs)).toBe("today");
  });

  it("names a run list that could not be read in the source", () => {
    const r = choosePushBase({
      lastGreenSha: "",
      beforeSha: BEFORE,
      isAncestor: ancestors(),
      lookupFailed: true,
    });
    expect(r).toEqual({ base: BEFORE, source: "event-before (run lookup failed)" });
  });

  it("names origin/<branch> as the fallback in local mode", () => {
    const r = choosePushBase({
      lastGreenSha: GREEN,
      beforeSha: BEFORE,
      isAncestor: ancestors(BEFORE),
      fallback: "origin/dev",
    });
    expect(r.source).toBe("origin/dev (last green run is not an ancestor)");
  });

  it("reads owner/repo from https, ssh and scp-style remote URLs", () => {
    expect(repoFromRemoteUrl("https://github.com/o/r.git")).toBe("o/r");
    expect(repoFromRemoteUrl("https://github.com/o/r")).toBe("o/r");
    expect(repoFromRemoteUrl("git@github.com:o/r.git\n")).toBe("o/r");
    expect(repoFromRemoteUrl("ssh://git@github.com/o/r.git")).toBe("o/r");
    expect(repoFromRemoteUrl("")).toBe("");
    expect(repoFromRemoteUrl(undefined)).toBe("");
  });

  it("reads --local, --branch and --head from argv", () => {
    expect(parseArgs(["--local", "--branch=main", `--head=${GREEN}`])).toEqual({
      local: true,
      branch: "main",
      head: GREEN,
    });
    expect(parseArgs([])).toEqual({ local: false, branch: "", head: "" });
  });

  it("returns an empty sha for a missing or malformed run list", () => {
    expect(newestRunSha([])).toBe("");
    expect(newestRunSha(undefined)).toBe("");
    expect(newestRunSha([{ run_number: "x", head_sha: "a" }, { head_sha: 3 }])).toBe("");
  });

  describe("exit 0 always", () => {
    const runWithFakes = (gh: string, git: string, args: string[] = [], env = {}) => {
      const dir = fs.mkdtempSync(path.join(os.tmpdir(), "push-base-"));
      try {
        const ghLog = path.join(dir, "gh.log");
        fs.writeFileSync(path.join(dir, "gh"), `#!/bin/sh\necho "$*" >> "${ghLog}"\n${gh}\n`, {
          mode: 0o755,
        });
        fs.writeFileSync(path.join(dir, "git"), `#!/bin/sh\n${git}\n`, { mode: 0o755 });
        const sourceFile = path.join(dir, "source");
        const r = spawnSync(process.execPath, [SCRIPT, ...args], {
          encoding: "utf8",
          env: {
            ...process.env,
            PATH: `${dir}${path.delimiter}${process.env.PATH}`,
            REPO: "o/r",
            BRANCH: "dev",
            BEFORE_SHA: BEFORE,
            SOURCE_FILE: sourceFile,
            ...env,
          },
        });
        const source = fs.existsSync(sourceFile) ? fs.readFileSync(sourceFile, "utf8").trim() : "";
        const ghCalls = fs.existsSync(ghLog) ? fs.readFileSync(ghLog, "utf8") : "";
        return { status: r.status, stdout: r.stdout.trim(), stderr: r.stderr, source, ghCalls };
      } finally {
        fs.rmSync(dir, { recursive: true, force: true });
      }
    };
    const runs = `echo '[{"run_number":1,"head_sha":"${GREEN}"}]'`;

    it("falls back to event.before when git fails unexpectedly", () => {
      const r = runWithFakes(runs, "exit 3");
      expect(r.status).toBe(0);
      expect(r.stdout).toBe(BEFORE);
      expect(r.source.startsWith("event-before")).toBe(true);
    });

    it("falls back to event.before when gh prints unparseable output", () => {
      const r = runWithFakes("echo 'not json'", "exit 0");
      expect(r.status).toBe(0);
      expect(r.stdout).toBe(BEFORE);
      expect(r.source.startsWith("event-before")).toBe(true);
    });

    it("reports last-green-run as the source when the green head is an ancestor", () => {
      const r = runWithFakes(runs, "exit 0");
      expect(r).toMatchObject({ status: 0, stdout: GREEN, source: "last-green-run" });
    });

    it("CI mode: falls back to event.before and says so when the run list is unreadable", () => {
      const r = runWithFakes("echo 'HTTP 401' >&2; exit 1", "exit 0");
      expect(r).toMatchObject({ status: 0, stdout: BEFORE });
      expect(r.source).toBe("event-before (run lookup failed)");
    });

    describe("local mode", () => {
      // origin's URL gives the repo, origin/dev the before-sha; ancestry holds only for the
      // pushed commit ($4 of `git merge-base --is-ancestor <sha> <head>`).
      const ORIGIN = "d".repeat(40);
      const PUSHED = "e".repeat(40);
      const git = `case "$1" in
  remote) echo "git@github.com:me/app.git" ;;
  rev-parse) echo "${ORIGIN}" ;;
  merge-base) [ "$4" = "${PUSHED}" ] && exit 0; exit 1 ;;
  *) exit 2 ;;
esac`;
      const args = ["--local", "--branch=dev", `--head=${PUSHED}`];
      const ciEnv = { REPO: "ci/repo", BEFORE_SHA: "f".repeat(40) };

      it("uses the last green run when it is an ancestor of --head, looked up on origin's repo", () => {
        const r = runWithFakes(runs, git, args, ciEnv);
        expect(r).toMatchObject({ status: 0, stdout: GREEN, source: "last-green-run" });
        expect(r.ghCalls).toContain("repos/me/app/actions/workflows/");
        expect(r.ghCalls).toContain("branch=dev&event=push&status=success");
      });

      it("tests ancestry against --head, not HEAD", () => {
        const r = runWithFakes(runs, git, ["--local", "--branch=dev", `--head=${"9".repeat(40)}`]);
        expect(r.stdout).toBe(ORIGIN);
        expect(r.source).toBe("origin/dev (last green run is not an ancestor)");
      });

      it("falls back to origin/dev with the reason on stderr when gh fails", () => {
        const r = runWithFakes("echo 'gh: not logged in' >&2; exit 4", git, args, ciEnv);
        expect(r).toMatchObject({ status: 0, stdout: ORIGIN });
        expect(r.source).toBe("origin/dev (run lookup failed)");
        expect(r.stderr).toContain("gh: not logged in");
        expect(r.ghCalls).toContain("repos/me/app/");
      });
    });
  });
});
