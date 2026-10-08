// Per-run input files (#277). Runs the real run_number helper and the real
// worktree-setup status fences from bkit-build.md / bkit-plan.md /
// bkit-design.md against a scratch git repo — the fences are extracted from
// the workflows and run as written, so the test keeps no copy of their logic.

import { execFileSync, spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const SCRIPTS = path.resolve(".bkit/templates/.bkit/scripts");
const FOLD_SH = path.join(SCRIPTS, "bkit-status-fold.sh");
const BUS_SH = path.join(SCRIPTS, "bkit-counter-bus.sh");
const FID = "999-test-fid";
const YYYYMM = "202601";
const SETUP_WORKFLOWS = ["build", "plan", "design"] as const;
const INPUT_WORKFLOWS = ["build", "plan", "design", "ship"] as const;

type Row = Record<string, unknown>;

const temps: string[] = [];

afterEach(() => {
  for (const dir of temps.splice(0)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

function tmpDir(prefix: string): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  temps.push(dir);
  return dir;
}

function writeRows(file: string, rows: Row[]): void {
  fs.writeFileSync(file, rows.map((r) => JSON.stringify(r)).join("\n") + (rows.length ? "\n" : ""));
}

function runNumber(
  status: string,
  workflow: string,
  sourceFold = true,
): { code: number; out: string } {
  const prelude = sourceFold ? `. '${FOLD_SH}'; ` : "";
  const r = spawnSync("sh", ["-c", `${prelude}. '${BUS_SH}'; run_number '${status}' ${workflow}`], {
    encoding: "utf-8",
  });
  return { code: r.status ?? -1, out: r.stdout.trim() };
}

const started = (workflow: string, at: string): Row => ({ type: "workflow-started", workflow, at });
const done = (workflow: string, at: string): Row => ({ type: "workflow-done", workflow, at });
const failed = (workflow: string, at: string): Row => ({ type: "workflow-failed", workflow, at });

describe("run_number (#277)", () => {
  function statusWith(rows: Row[]): string {
    const file = path.join(tmpDir("bkit-run-number-"), "status.jsonl");
    writeRows(file, rows);
    return file;
  }

  it("is 1 for a feature with no runs yet", () => {
    expect(runNumber(statusWith([]), "build")).toEqual({ code: 0, out: "1" });
  });

  it("keeps the current number while this workflow's run is IN_PROGRESS (resume)", () => {
    const status = statusWith([started("build", "2026-01-01T00:00:00Z")]);
    expect(runNumber(status, "build")).toEqual({ code: 0, out: "1" });
  });

  it("moves to the next number after a DONE or FAILED run", () => {
    const afterDone = statusWith([
      started("build", "2026-01-01T00:00:00Z"),
      done("build", "2026-01-01T00:01:00Z"),
    ]);
    expect(runNumber(afterDone, "build").out).toBe("2");
    const afterFailed = statusWith([
      started("build", "2026-01-01T00:00:00Z"),
      failed("build", "2026-01-01T00:01:00Z"),
    ]);
    expect(runNumber(afterFailed, "build").out).toBe("2");
  });

  it("gives the same number before and after the workflow-started row is written", () => {
    const status = statusWith([
      started("build", "2026-01-01T00:00:00Z"),
      done("build", "2026-01-01T00:01:00Z"),
    ]);
    const before = runNumber(status, "build").out;
    fs.appendFileSync(status, JSON.stringify(started("build", "2026-01-02T00:00:00Z")) + "\n");
    expect(runNumber(status, "build").out).toBe(before);
    expect(before).toBe("2");
  });

  it("counts only this workflow's runs, and a later run of another workflow is not a resume", () => {
    const status = statusWith([
      started("plan", "2026-01-01T00:00:00Z"),
      done("plan", "2026-01-01T00:01:00Z"),
      started("build", "2026-01-02T00:00:00Z"),
      done("build", "2026-01-02T00:01:00Z"),
      started("debug", "2026-01-03T00:00:00Z"),
    ]);
    expect(runNumber(status, "build").out).toBe("2");
    expect(runNumber(status, "plan").out).toBe("2");
    expect(runNumber(status, "ship").out).toBe("1");
    expect(runNumber(status, "debug").out).toBe("1");
  });

  it("does not count rows duplicated by a union merge twice", () => {
    const rows = [started("build", "2026-01-01T00:00:00Z"), done("build", "2026-01-01T00:01:00Z")];
    expect(runNumber(statusWith([...rows, ...rows]), "build").out).toBe("2");
  });

  it("refuses (exit 2, nothing on stdout) on a missing file or an unsourced fold", () => {
    expect(runNumber("/nonexistent/status.jsonl", "build")).toEqual({ code: 2, out: "" });
    expect(runNumber(statusWith([]), "build", false)).toEqual({ code: 2, out: "" });
  });
});

function setupStatusFence(workflow: string): string {
  const lines = fs
    .readFileSync(path.resolve(`.bkit/workflows/bkit-${workflow}.md`), "utf-8")
    .split("\n");
  const start = lines.findIndex((line) => /^## .*Step 2 —/.test(line));
  expect(start, `${workflow}: Step 2 section not found`).toBeGreaterThanOrEqual(0);
  const end = lines.findIndex((line, index) => index > start && /^### .*Gate 2/.test(line));
  const section = lines.slice(start, end).join("\n");
  const fence = [...section.matchAll(/```bash\n([\s\S]*?)```/g)]
    .map((m) => m[1])
    .find((body) => body.includes(`step:"${workflow}-worktree-setup"`));
  expect(fence, `${workflow}: worktree-setup status fence not found`).toBeTruthy();
  return fence!.replaceAll("{YYYYMM}", YYYYMM).replaceAll("{FID}", FID);
}

function initRepo(): { repo: string; logs: string; status: string } {
  const repo = path.join(tmpDir("bkit-input-run-"), "repo");
  fs.mkdirSync(repo);
  execFileSync("git", ["init", "-q", repo]);
  execFileSync("git", ["-C", repo, "config", "user.email", "t@t.t"]);
  execFileSync("git", ["-C", repo, "config", "user.name", "t"]);
  execFileSync("git", ["-C", repo, "commit", "-q", "--allow-empty", "-m", "init"]);
  fs.mkdirSync(path.join(repo, ".bkit/scripts"), { recursive: true });
  fs.copyFileSync(FOLD_SH, path.join(repo, ".bkit/scripts/bkit-status-fold.sh"));
  fs.copyFileSync(BUS_SH, path.join(repo, ".bkit/scripts/bkit-counter-bus.sh"));
  const logs = path.join(repo, "docs/plans", YYYYMM, "logs", FID);
  fs.mkdirSync(logs, { recursive: true });
  const status = path.join(logs, "status.jsonl");
  fs.writeFileSync(status, "");
  return { repo, logs, status };
}

function runFence(repo: string, workflow: string): { code: number; stderr: string } {
  const r = spawnSync("bash", ["-c", setupStatusFence(workflow)], { cwd: repo, encoding: "utf-8" });
  return { code: r.status ?? -1, stderr: r.stderr };
}

function setupArtifacts(status: string, workflow: string): unknown[] {
  return fs
    .readFileSync(status, "utf-8")
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line) as Row)
    .filter((r) => r.step === `${workflow}-worktree-setup`)
    .map((r) => (r.artifacts as string[])[0]);
}

describe.each(SETUP_WORKFLOWS)("bkit-%s.md worktree-setup fence (#277)", (workflow) => {
  const inputPath = (n: number) => `docs/plans/${YYYYMM}/logs/${FID}/${workflow}-input-${n}.md`;

  it("records the run's own input file, and a re-run records a new one without touching the old", () => {
    const { repo, logs, status } = initRepo();
    fs.writeFileSync(path.join(logs, `${workflow}-input-1.md`), "run one\n");
    expect(runFence(repo, workflow).code).toBe(0);
    const now = new Date().toISOString().replace(/\.\d+Z$/, "Z");
    fs.appendFileSync(status, JSON.stringify(done(workflow, now)) + "\n");

    fs.writeFileSync(path.join(logs, `${workflow}-input-2.md`), "run two\n");
    expect(runFence(repo, workflow).code).toBe(0);

    expect(setupArtifacts(status, workflow)).toEqual([inputPath(1), inputPath(2)]);
    expect(fs.readFileSync(path.join(logs, `${workflow}-input-1.md`), "utf-8")).toBe("run one\n");
  });

  it("a resume of an IN_PROGRESS run keeps the same input file", () => {
    const { repo, logs, status } = initRepo();
    fs.writeFileSync(path.join(logs, `${workflow}-input-1.md`), "run one\n");
    expect(runFence(repo, workflow).code).toBe(0);
    expect(runFence(repo, workflow).code).toBe(0);
    expect(setupArtifacts(status, workflow)).toEqual([inputPath(1), inputPath(1)]);
  });

  it("fails when this run's input file was not written", () => {
    const { repo, logs } = initRepo();
    fs.writeFileSync(path.join(logs, `${workflow}-input.md`), "old fixed name\n");
    const r = runFence(repo, workflow);
    expect(r.code).toBe(1);
    expect(r.stderr).toContain(`${workflow}-input-1.md missing or empty`);
  });
});

describe.each(INPUT_WORKFLOWS)("bkit-%s.md input file naming (#277)", (workflow) => {
  const content = () =>
    fs.readFileSync(path.resolve(`.bkit/workflows/bkit-${workflow}.md`), "utf-8");

  it("never names the fixed, run-less input file", () => {
    expect(content()).not.toMatch(new RegExp(`${workflow}-input\\.md`));
  });

  it("creates the input file under the run number and derives that number with run_number", () => {
    expect(content()).toContain(
      `Create: \`docs/plans/{YYYYMM}/logs/{FID}/${workflow}-input-{RUN}.md\``,
    );
    expect(content()).toMatch(
      new RegExp(`run_number "[^"]*status\\.jsonl" ${workflow} \\|\\| exit 2`),
    );
  });
});
