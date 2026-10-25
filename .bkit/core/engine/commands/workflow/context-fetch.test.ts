import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { runCommand } from "../lib";
import { FENCE_CLOSE, FENCE_INSTRUCTION_LINES, FENCE_OPEN, contextCommand } from "./context";

/** Set to a reason to make the table check refuse every table (a forced mismatch). */
const force = vi.hoisted(() => ({ mismatch: null as string | null }));
vi.mock("../../shared/text", async (importOriginal) => {
  const real = await importOriginal<typeof import("../../shared/text")>();
  return {
    ...real,
    checkedTable: (value: unknown) =>
      force.mismatch === null ? real.checkedTable(value) : { ok: false, reason: force.mismatch },
  };
});

const CONTEXT_MD = [
  "# Context",
  "<!-- bkit:end -->",
  "",
  "<!-- context-fetch:start github context=ci -->",
  "```bash",
  "echo ci",
  "```",
  "<!-- context-fetch:end -->",
  "",
].join("\n");

const ARTIFACT = "docs/plans/202608/logs/681-x/context-ci-github-1.md";
const RAW = ".git/bkit-outbox/681-x/context-ci-github-1.raw.md";
const BASE = ["--idx=1", "--script=block.sh", "--fid=681-x", "--month=202608", "--attempt=1"];

let tmpDir: string;
beforeAll(() => {
  tmpDir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-context-fetch-")));
});
afterAll(() => fs.rmSync(tmpDir, { recursive: true, force: true }));
afterEach(() => {
  force.mismatch = null;
});

/** A git repo whose one consumer block runs `block.sh`, which prints `payload` byte for byte. */
function workspace(payload: string): string {
  const dir = fs.mkdtempSync(path.join(tmpDir, "ws-"));
  spawnSync("git", ["init", "-q"], { cwd: dir });
  fs.mkdirSync(path.join(dir, ".agents"));
  fs.writeFileSync(path.join(dir, ".agents/context.md"), CONTEXT_MD);
  fs.writeFileSync(path.join(dir, "payload"), payload);
  fs.writeFileSync(path.join(dir, "block.sh"), 'cat "$REPO_ROOT/payload"\n');
  return dir;
}

async function fetch(dir: string, ...extra: string[]) {
  const out: string[] = [];
  const err: string[] = [];
  const code = await runCommand(
    ["context", "fetch", ...BASE, ...extra, "--json"],
    [contextCommand],
    {
      classicVerbs: new Set(),
      cwd: dir,
      io: { stdout: (t) => out.push(t), stderr: (t) => err.push(t) },
    },
  );
  return { code, json: JSON.parse(out.join("")), err: err.join("") };
}

/** The artifact's content between the fence lines. */
function body(dir: string): string[] {
  const lines = fs.readFileSync(path.join(dir, ARTIFACT), "utf-8").trimEnd().split("\n");
  expect(lines.slice(0, FENCE_INSTRUCTION_LINES.length + 1)).toEqual([
    ...FENCE_INSTRUCTION_LINES,
    FENCE_OPEN,
  ]);
  expect(lines.at(-1)).toBe(FENCE_CLOSE);
  return lines.slice(FENCE_INSTRUCTION_LINES.length + 1, -1);
}

describe("bkit context fetch", () => {
  it("renders a JSON array of flat objects as a table and keeps the raw output in the outbox", async () => {
    const payload = '[{"id":1,"title":"a"},{"id":2,"title":"b"}]';
    const dir = workspace(payload);
    const r = await fetch(dir);
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ outcome: "checked", artifact: ARTIFACT, render: "table" });
    expect(body(dir)).toEqual(["| id | title |", "| --- | --- |", "| 1 | a |", "| 2 | b |"]);
    expect(r.json.clamp).toMatchObject({
      render: "table",
      raw: RAW,
      source: 'cat "$REPO_ROOT/payload"\n',
    });
    expect(r.json.clamp.fetchedAt).toMatch(/Z$/);
  });

  it("keeps the raw copy byte-identical, outside logs/", async () => {
    const payload = ' [{"id":1,"note":"x"}]\n\n\n';
    const dir = workspace(payload);
    await fetch(dir);
    expect(fs.readFileSync(path.join(dir, RAW))).toEqual(Buffer.from(payload));
    const logs = path.join(dir, "docs/plans/202608/logs/681-x");
    expect(fs.readdirSync(logs).filter((f) => f.includes(".raw"))).toEqual([]);
  });

  it("round-trips a value holding a pipe", async () => {
    const dir = workspace('[{"cmd":"a | b","n":"5"}]');
    const r = await fetch(dir);
    expect(r.json.render).toBe("table");
    expect(body(dir)).toEqual(["| cmd | n |", "| --- | --- |", '| a \\| b | "5" |']);
  });

  it.each([
    ["nested JSON", '[{"id":1,"tags":["x"]}]', "item 0 key tags is nested"],
    ["plain text", "build failed at step 3\n", "not JSON"],
    ["a JSON object", '{"id":1}', "not an array"],
  ])("leaves %s raw and says why", async (_name, payload, reason) => {
    const dir = workspace(payload);
    const r = await fetch(dir);
    expect(r.json.render).toBe("raw");
    expect(r.err).toContain(`render: raw (${reason})`);
    expect(body(dir).join("\n")).toBe(payload.trimEnd());
    expect(r.json.clamp).toMatchObject({ render: "raw", raw: null });
  });

  it("falls back to raw when the table does not read back as the input", async () => {
    force.mismatch = "table parses back to different rows";
    const payload = '[{"id":1}]';
    const dir = workspace(payload);
    const r = await fetch(dir);
    expect(r.json.render).toBe("raw");
    expect(r.err).toContain("render: raw (table parses back to different rows)");
    expect(body(dir)).toEqual([payload]);
  });

  it("--render=raw writes the output as it came", async () => {
    const payload = '[{"id":1}]';
    const dir = workspace(payload);
    const r = await fetch(dir, "--render=raw");
    expect(r.json.render).toBe("raw");
    expect(r.err).not.toContain("render: raw (");
    expect(body(dir)).toEqual([payload]);
  });

  it("rejects an unknown --render", async () => {
    const dir = workspace("[]");
    const out: string[] = [];
    const code = await runCommand(
      ["context", "fetch", ...BASE, "--render=yaml"],
      [contextCommand],
      { classicVerbs: new Set(), cwd: dir, io: { stdout: (t) => out.push(t), stderr: () => {} } },
    );
    expect(code).toBe(2);
  });
});
