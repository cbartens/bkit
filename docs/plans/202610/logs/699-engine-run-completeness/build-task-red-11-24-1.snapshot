import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { runCommand } from "../lib";
import { completenessCommand } from "./completeness";

const dirs: string[] = [];
afterEach(() => {
  for (const d of dirs.splice(0)) fs.rmSync(d, { recursive: true, force: true });
});

function tmp() {
  const d = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-completeness-cmd-")));
  dirs.push(d);
  return d;
}

async function run(argv: string[]) {
  const out: string[] = [];
  const err: string[] = [];
  const code = await runCommand([...argv, "--json"], [completenessCommand], {
    classicVerbs: new Set(),
    cwd: process.cwd(),
    io: { stdout: (t) => out.push(t), stderr: (t) => err.push(t) },
  });
  return { code, json: out.length ? JSON.parse(out.join("")) : undefined, err: err.join("") };
}

const AT = "2026-10-29T00:00:00.000Z";
const SHA = "a".repeat(40);

/** A closed build run that journaled one call and recorded only its closing step. */
function holeyFile(workflow = "build") {
  const rows = [
    { type: "workflow-started", workflow, at: AT },
    { type: "engine-call", workflow, noun: "status", verb: "path", at: AT },
    {
      type: "step-done",
      workflow,
      step: `${workflow}-close-workflow`,
      status: "DONE",
      at: AT,
      parentSha: SHA,
      artifacts: [],
    },
  ];
  const file = path.join(tmp(), "status.jsonl");
  fs.writeFileSync(file, rows.map((r) => JSON.stringify(r)).join("\n") + "\n");
  return file;
}

describe("bkit completeness check", () => {
  it("always exits 0 on a holey run", async () => {
    const r = await run(["completeness", "check", `--file=${holeyFile()}`, "--workflow=build"]);
    expect(r.code).toBe(0);
    expect(r.json.verdicts[0]).toMatchObject({ workflow: "build", verdict: "HOLEY", holey: true });
    expect(r.json.verdicts[0].stepHoles.length).toBeGreaterThan(0);
  });

  it("infers each run's workflow when --workflow is absent", async () => {
    const r = await run(["completeness", "check", `--file=${holeyFile("debug")}`]);
    expect(r.code).toBe(0);
    expect(r.json.verdicts.map((v: { workflow: string }) => v.workflow)).toEqual(["debug"]);
    expect(r.json.report).toContain("debug");
  });

  it("exits 0 with no verdict when the file or the workflow markdown is unreadable", async () => {
    const missing = await run([
      "completeness",
      "check",
      `--file=${path.join(tmp(), "nope.jsonl")}`,
      "--workflow=build",
    ]);
    expect(missing.code).toBe(0);
    expect(missing.json.verdicts).toEqual([]);

    const noMd = await run([
      "completeness",
      "check",
      `--file=${holeyFile()}`,
      "--workflow=not-a-workflow",
    ]);
    expect(noMd.code).toBe(0);
    expect(noMd.json.verdicts).toEqual([]);
  });

  it("a file holding two runs of one workflow is checked per run", async () => {
    const step = (step: string) => ({
      type: "step-done",
      workflow: "build",
      step,
      status: "DONE",
      at: AT,
      parentSha: SHA,
      artifacts: [],
    });
    const rows = [
      { type: "workflow-started", workflow: "build", at: "2026-10-29T00:00:00.000Z" },
      { ...step("build-worktree-setup"), at: "2026-10-29T00:00:01.000Z" },
      { type: "workflow-started", workflow: "build", at: "2026-10-29T01:00:00.000Z" },
      {
        type: "engine-call",
        workflow: "build",
        noun: "status",
        verb: "path",
        at: "2026-10-29T01:00:01.000Z",
      },
      { ...step("build-close-workflow"), at: "2026-10-29T01:00:02.000Z" },
    ];
    const file = path.join(tmp(), "status.jsonl");
    fs.writeFileSync(file, rows.map((r) => JSON.stringify(r)).join("\n") + "\n");
    const r = await run(["completeness", "check", `--file=${file}`, "--workflow=build"]);
    expect(r.json.verdicts).toHaveLength(2);
    expect(r.json.verdicts[0].preJournal).toBe(true);
    expect(r.json.verdicts[0].evidenceHoles).toEqual([]);
    expect(r.json.verdicts[1].preJournal).toBe(false);
    expect(r.json.verdicts[1].evidenceHoles.map((h: { step: string }) => h.step)).not.toContain(
      "build-worktree-setup",
    );
  });

  it("the verdicts output is described as one verdict per checked run", () => {
    const desc = completenessCommand.verbs.check.output?.verdicts;
    expect(desc).toContain("per checked run");
    expect(desc).not.toContain("per checked workflow");
  });
});
