// Executes the Step 1 status fence from bkit-ship.md against a real git repo
// and the real status fold. The fence is extracted from the workflow and run
// as written — the test does not keep a second copy of the emit/guard logic.

import { execFileSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const SHIP_MD = path.resolve(".bkit/workflows/bkit-ship.md");
const FOLD_SH = path.resolve(".bkit/scripts/bkit-status-fold.sh");
const FID = "999-test-fid";
const YYYYMM = "202601";

const temps: string[] = [];

afterEach(() => {
  for (const dir of temps.splice(0)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

function step1StatusFence(repo: string): string {
  const lines = fs.readFileSync(SHIP_MD, "utf-8").split("\n");
  const start = lines.findIndex((line) => /^## .*Step 1 —/.test(line));
  expect(start, "Step 1 section not found").toBeGreaterThanOrEqual(0);
  const end = lines.findIndex((line, index) => index > start && /^### .*Gate 1/.test(line));
  const section = lines.slice(start, end).join("\n");
  const fence = [...section.matchAll(/```bash\n([\s\S]*?)```/g)]
    .map((m) => m[1])
    .find((body) => body.includes('step:"ship-start-workflow"'));
  expect(fence, "Step 1 ship-start-workflow fence not found").toBeTruthy();
  return fence!
    .replaceAll("{BOOK_ROOT}", repo)
    .replaceAll("{YYYYMM}", YYYYMM)
    .replaceAll("{FID}", FID);
}

function initRepo(): { repo: string; status: string } {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-ship-started-"));
  temps.push(tmp);
  const repo = path.join(tmp, "repo");
  fs.mkdirSync(repo);
  execFileSync("git", ["init", "-q", repo]);
  execFileSync("git", ["-C", repo, "config", "user.email", "t@t.t"]);
  execFileSync("git", ["-C", repo, "config", "user.name", "t"]);
  execFileSync("git", ["-C", repo, "commit", "-q", "--allow-empty", "-m", "init"]);
  fs.mkdirSync(path.join(repo, ".bkit/scripts"), { recursive: true });
  fs.copyFileSync(FOLD_SH, path.join(repo, ".bkit/scripts/bkit-status-fold.sh"));
  const logs = path.join(repo, "docs/plans", YYYYMM, "logs", FID);
  fs.mkdirSync(logs, { recursive: true });
  return { repo, status: path.join(logs, "status.jsonl") };
}

function runFence(repo: string): void {
  execFileSync("bash", ["-c", step1StatusFence(repo)], { cwd: repo, encoding: "utf-8" });
}

function rows(status: string): Array<Record<string, unknown>> {
  return fs
    .readFileSync(status, "utf-8")
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line) as Record<string, unknown>);
}

function shipStarts(status: string): Array<Record<string, unknown>> {
  return rows(status).filter((r) => r.type === "workflow-started" && r.workflow === "ship");
}

describe("bkit-ship.md Step 1 workflow-started fence (#492)", () => {
  it("opens a ship run with parentSha before the ship-start-workflow row", () => {
    const { repo, status } = initRepo();
    runFence(repo);
    const all = rows(status);
    expect(all.map((r) => r.type)).toEqual(["workflow-started", "step-done"]);
    expect(all[0].workflow).toBe("ship");
    expect(all[0].parentSha).toMatch(/^[0-9a-f]{40}$/);
    expect(all[1].step).toBe("ship-start-workflow");
  });

  it("does not open a second run when resuming an IN_PROGRESS ship run", () => {
    const { repo, status } = initRepo();
    runFence(repo);
    runFence(repo);
    expect(shipStarts(status)).toHaveLength(1);
  });

  it("opens a new run after the previous ship run FAILED", () => {
    const { repo, status } = initRepo();
    fs.writeFileSync(
      status,
      [
        { type: "workflow-started", workflow: "ship", at: "2026-01-01T00:00:00Z" },
        {
          type: "step-done",
          workflow: "ship",
          step: "ship-merge-pr",
          status: "DONE",
          at: "2026-01-01T00:01:00Z",
          parentSha: "a",
        },
        { type: "workflow-failed", workflow: "ship", at: "2026-01-01T00:02:00Z" },
      ]
        .map((r) => JSON.stringify(r))
        .join("\n") + "\n",
    );
    runFence(repo);
    expect(shipStarts(status)).toHaveLength(2);
  });

  it("opens a ship run when the latest run is a finished build", () => {
    const { repo, status } = initRepo();
    fs.writeFileSync(
      status,
      [
        { type: "workflow-started", workflow: "build", at: "2026-01-01T00:00:00Z" },
        { type: "workflow-done", workflow: "build", at: "2026-01-01T00:02:00Z" },
      ]
        .map((r) => JSON.stringify(r))
        .join("\n") + "\n",
    );
    runFence(repo);
    expect(shipStarts(status)).toHaveLength(1);
  });

  it("migrates a legacy status.json before writing the start row", () => {
    const { repo, status } = initRepo();
    fs.writeFileSync(
      path.join(path.dirname(status), "status.json"),
      JSON.stringify([
        {
          workflow: "build",
          startedAt: "2026-01-01T00:00:00Z",
          status: "DONE",
          steps: [{ step: "build-start-workflow", status: "DONE", at: "2026-01-01T00:00:00Z" }],
        },
      ]),
    );
    runFence(repo);
    const all = rows(status);
    expect(all[0]).toMatchObject({ type: "workflow-started", workflow: "build" });
    expect(all.some((r) => r.type === "workflow-done" && r.workflow === "build")).toBe(true);
    expect(shipStarts(status)).toHaveLength(1);
  });
});
