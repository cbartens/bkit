// audits/templates/auto-route-marker.integration.test.ts
//
// The `bkit [auto route]` marker is the single mechanism that admits a
// post-merge `dev` CI run through bkit-cloud.yml's free-tier gate
// (`contains(head_commit.message, 'bkit [auto route]')`). Every workflow that
// can produce a marker-bearing commit hands the labels it re-read from the
// tracker MCP to the command that writes the commit, as `{LABEL_FLAGS}` (one
// `--label=<name>` per label): bkit-ship.md to `bkit prs merge` (the squash
// subject), bkit-build.md and bkit-debug.md to `bkit workflows close` (the
// close-workflow commit) and `bkit runs dispatch` (the re-trigger commit). The
// command appends the marker on an exact `bkit:auto` match. No `gh` call is
// involved in reading labels.
//
// This file EXECUTES the real close line — sliced out of the shipped
// `.bkit/core/workflows/*.md` — against the built `bkit` in a fixture repo, and asserts
// on the subject it committed. The merge and re-trigger subjects are pinned in
// commands/workflow/prs.test.ts and runs.test.ts.

import { execFileSync, spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

const REPO_ROOT = path.resolve(__dirname, "../../../../..");
const BKIT_BIN = path.join(REPO_ROOT, "dist", "cli.js");
const MARKER = " bkit [auto route]";
const FID = "42-auto-route";
const MONTH = "202610";

const hasTools = spawnSync("bash", ["--version"]).status === 0;

const readWorkflow = (file: string) =>
  fs.readFileSync(path.join(REPO_ROOT, ".bkit", "core", "workflows", file), "utf8");

/** The one fenced line that runs `workflows close` for a phase. */
function closeLine(file: string, workflow: string): string {
  const lines = readWorkflow(file)
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.startsWith(`"{BKIT}" workflows close --workflow=${workflow} `));
  expect(lines, `${file}: one workflows close line`).toHaveLength(1);
  expect(lines[0], `${file}: the close line takes the re-read labels`).toContain("{LABEL_FLAGS}");
  return lines[0]!;
}

let tmp = "";

beforeEach(() => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-autoroute-"));
});

afterEach(() => {
  fs.rmSync(tmp, { recursive: true, force: true });
});

/** A feature checkout on feat/{FID} with a started run, the built bkit linked in. */
function fixture(workflow: string): string {
  const repo = path.join(tmp, "repo");
  execFileSync("git", ["init", "-q", "-b", `feat/${FID}`, repo]);
  execFileSync("git", ["-C", repo, "config", "user.email", "t@t.t"]);
  execFileSync("git", ["-C", repo, "config", "user.name", "t"]);
  fs.mkdirSync(path.join(repo, "node_modules/.bin"), { recursive: true });
  fs.symlinkSync(BKIT_BIN, path.join(repo, "node_modules/.bin/bkit"));
  fs.writeFileSync(path.join(repo, ".gitignore"), "node_modules/\n");
  const logs = path.join(repo, "docs", "plans", MONTH, "logs", FID);
  fs.mkdirSync(logs, { recursive: true });
  fs.writeFileSync(
    path.join(logs, "status.jsonl"),
    `${JSON.stringify({ type: "workflow-started", workflow, at: "2026-10-01T00:00:00Z", run: 1 })}\n`,
  );
  execFileSync("git", ["-C", repo, "add", "-A"]);
  execFileSync("git", ["-C", repo, "commit", "-q", "-m", "start"]);
  return repo;
}

/** Run one close line with `{LABEL_FLAGS}` filled from `labels`; the committed subject. */
function runClose(file: string, workflow: string, labels: string[]) {
  const repo = fixture(workflow);
  const flags = labels.map((l) => `--label='${l}'`).join(" ");
  const script = closeLine(file, workflow)
    .replaceAll("{BKIT}", path.join(repo, "node_modules/.bin/bkit"))
    .replaceAll("{LABEL_FLAGS}", flags)
    .replaceAll("{FID}", FID)
    .replaceAll("{YYYYMM}", MONTH)
    .replaceAll("{OWNER_REPO}", "test/repo")
    .replaceAll("{OUTBOX}", path.join(tmp, "outbox"))
    .replaceAll("{STATUS}", `docs/plans/${MONTH}/logs/${FID}/status.jsonl`)
    .replaceAll("{BRANCH}", `feat/${FID}`);
  expect(script).not.toMatch(/\{[A-Z_]+\}/);
  const r = spawnSync("bash", ["-c", script], { encoding: "utf8", cwd: repo });
  const subject =
    r.status === 0
      ? execFileSync("git", ["-C", repo, "log", "-1", "--format=%s"], { encoding: "utf8" }).trim()
      : "";
  return { status: r.status, stderr: r.stderr, subject };
}

describe.skipIf(!hasTools)("bkit [auto route] marker comes from the re-read labels", () => {
  const CLOSES = [
    ["bkit-build.md", "build"],
    ["bkit-debug.md", "debug"],
  ] as const;

  it("the built CLI is present", () => {
    expect(fs.existsSync(BKIT_BIN), "dist/cli.js missing — run the build").toBe(true);
  });

  for (const [file, workflow] of CLOSES) {
    describe(file, () => {
      it("threads the marker onto the close subject when the issue carries bkit:auto", () => {
        const r = runClose(file, workflow, ["bkit:build", "bkit:auto"]);
        expect(r.status, `nonzero exit: ${r.stderr}`).toBe(0);
        expect(r.subject).toBe(`chore(${FID}): close-workflow${MARKER}`);
      });

      it("leaves the subject unchanged when bkit:auto is absent", () => {
        const r = runClose(file, workflow, ["bkit:build"]);
        expect(r.status, `nonzero exit: ${r.stderr}`).toBe(0);
        expect(r.subject).toBe(`chore(${FID}): close-workflow`);
      });

      // The kill switch in bkit-cloud.yml is an exact label match; so is the command's.
      it.each([["bkit:auto-paused"], ["no-bkit:auto"]])(
        "does not arm the route on the near-miss label %s",
        (label) => {
          const r = runClose(file, workflow, [label]);
          expect(r.status, `nonzero exit: ${r.stderr}`).toBe(0);
          expect(r.subject).toBe(`chore(${FID}): close-workflow`);
        },
      );

      // No tracker wired: `{LABEL_FLAGS}` is empty.
      it("leaves the subject unchanged when no labels are passed", () => {
        const r = runClose(file, workflow, []);
        expect(r.status, `nonzero exit: ${r.stderr}`).toBe(0);
        expect(r.subject).toBe(`chore(${FID}): close-workflow`);
      });

      it("hands the same labels to the CI-Dispatch Gate's re-trigger", () => {
        expect(readWorkflow(file)).toMatch(/"\{BKIT\}" runs dispatch [^\n]*\{LABEL_FLAGS\}/);
      });
    });
  }

  it("bkit-ship.md hands the re-read labels to the squash merge", () => {
    expect(readWorkflow("bkit-ship.md")).toMatch(/"\{BKIT\}" prs merge [^\n]*\{LABEL_FLAGS\}/);
  });

  it("no workflow reads labels through gh or carries a cross-tool-call handoff for the marker", () => {
    // $GITHUB_ENV only propagates BETWEEN Action steps; agent Bash tool calls
    // all live inside one.
    for (const file of ["bkit-ship.md", "bkit-build.md", "bkit-debug.md"]) {
      const md = readWorkflow(file);
      expect(md, `${file} reads labels through gh`).not.toContain("gh issue view");
      expect(md, `${file} carries a mktemp/GITHUB_ENV marker handoff`).not.toContain(
        "BKIT_AUTO_ROUTE_FILE",
      );
    }
  });
});
