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
  vi.unstubAllEnvs();
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

const pinnedSelection = () => ({
  mode: "ci",
  provider: "github",
  repo: "example/example",
  runId: "123",
  runAttempt: 2,
  runUrl: "https://github.com/example/example/actions/runs/123/attempts/2",
  workflowId: "456",
  workflowPath: ".github/workflows/consumer-ci.yml",
  headBranch: "fix/ci",
  headSha: "a".repeat(40),
  conclusion: "failure",
  redTiers: ["integration"],
  via: "prompt-run",
});
const receipt = (extra: Record<string, unknown> = {}) => ({
  provider: "github",
  repo: "example/example",
  runId: "123",
  runAttempt: 2,
  headSha: "a".repeat(40),
  workflowId: "456",
  complete: true,
  ...extra,
});
function selectedWorkspace(payload: string) {
  const dir = workspace(payload);
  fs.writeFileSync(path.join(dir, "selection.json"), JSON.stringify(pinnedSelection()));
  return dir;
}
const receiptPayload = (
  extra: Record<string, unknown> = {},
  logs = "failed job: fixture failure\n",
) => `bkit-ci-evidence: ${JSON.stringify(receipt(extra))}\n${logs}`;

describe("selected CI context evidence", () => {
  it("pins selected evidence variables and clears inherited pins without selection", async () => {
    vi.stubEnv("BKIT_CI_RUN_ID", "stale-run");
    vi.stubEnv("BKIT_CI_RUN_ATTEMPT", "9");
    vi.stubEnv("BKIT_CI_REPO", "stale/repository");
    vi.stubEnv("BKIT_CI_HEAD_SHA", "stale-sha");
    const dir = selectedWorkspace(receiptPayload());
    const printPins =
      'printf "pins=%s|%s|%s|%s\\n" "${BKIT_CI_RUN_ID:-unset}" "${BKIT_CI_RUN_ATTEMPT:-unset}" "${BKIT_CI_REPO:-unset}" "${BKIT_CI_HEAD_SHA:-unset}"\n';
    fs.writeFileSync(path.join(dir, "block.sh"), 'cat "$REPO_ROOT/payload"\n' + printPins);
    const pinned = await fetch(dir, "--ci-selection-file=selection.json");
    expect(pinned.code).toBe(0);
    expect(pinned.json.outcome).toBe("checked");
    expect(body(dir).join("\n")).toContain(`pins=123|2|example/example|${"a".repeat(40)}`);
    const unpinned = workspace("ordinary evidence\n");
    fs.writeFileSync(path.join(unpinned, "block.sh"), printPins);
    expect((await fetch(unpinned)).code).toBe(0);
    expect(body(unpinned).join("\n")).toContain("pins=unset|unset|unset|unset");
  });

  it("accepts only matching complete CI receipts with nonempty logs", async () => {
    const valid = selectedWorkspace(receiptPayload());
    expect((await fetch(valid, "--ci-selection-file=selection.json")).json.outcome).toBe("checked");
    const wrongRun = selectedWorkspace(receiptPayload({ runId: "999" }));
    expect((await fetch(wrongRun, "--ci-selection-file=selection.json")).json.outcome).not.toBe(
      "checked",
    );
    const wrongAttempt = selectedWorkspace(receiptPayload({ runAttempt: 3 }));
    expect((await fetch(wrongAttempt, "--ci-selection-file=selection.json")).json.outcome).not.toBe(
      "checked",
    );
    const wrongSha = selectedWorkspace(receiptPayload({ headSha: "b".repeat(40) }));
    expect((await fetch(wrongSha, "--ci-selection-file=selection.json")).json.outcome).not.toBe(
      "checked",
    );
    const wrongWorkflow = selectedWorkspace(receiptPayload({ workflowId: "457" }));
    expect(
      (await fetch(wrongWorkflow, "--ci-selection-file=selection.json")).json.outcome,
    ).not.toBe("checked");
    const wrongRepo = selectedWorkspace(receiptPayload({ repo: "other/repository" }));
    expect((await fetch(wrongRepo, "--ci-selection-file=selection.json")).json.outcome).not.toBe(
      "checked",
    );
    const partial = selectedWorkspace(receiptPayload({ complete: false }));
    expect((await fetch(partial, "--ci-selection-file=selection.json")).json.outcome).not.toBe(
      "checked",
    );
    const empty = selectedWorkspace(receiptPayload({}, "\n"));
    expect((await fetch(empty, "--ci-selection-file=selection.json")).json.outcome).not.toBe(
      "checked",
    );
    const missing = selectedWorkspace("failed job but no identity\n");
    expect((await fetch(missing, "--ci-selection-file=selection.json")).json.outcome).not.toBe(
      "checked",
    );
    const skipped = selectedWorkspace(
      receiptPayload({}, "[context-fetch:github] skipped — logs unavailable\n"),
    );
    expect((await fetch(skipped, "--ci-selection-file=selection.json")).json.outcome).not.toBe(
      "checked",
    );
  });

  it("validates adapted legacy and fallback context through the same receipt path", async () => {
    const legacy = selectedWorkspace("===== run 999 =====\nlegacy failure logs\n");
    const unadapted = await fetch(legacy, "--ci-selection-file=selection.json");
    expect(unadapted.json.outcome).not.toBe("checked");
    expect(fs.readFileSync(path.join(legacy, unadapted.json.artifact), "utf-8")).toContain(
      "legacy failure logs",
    );
    const adapted = selectedWorkspace(receiptPayload({}, "adapted selected-run failure logs\n"));
    fs.writeFileSync(path.join(adapted, "block.sh"), 'cat "$REPO_ROOT/payload"\n');
    expect((await fetch(adapted, "--ci-selection-file=selection.json")).json.outcome).toBe(
      "checked",
    );
    const fallback = selectedWorkspace(receiptPayload({}, "normalized fallback job logs\n"));
    fs.writeFileSync(path.join(fallback, "block.sh"), 'cat "$REPO_ROOT/payload"\n');
    expect((await fetch(fallback, "--ci-selection-file=selection.json")).json.outcome).toBe(
      "checked",
    );
    fs.writeFileSync(
      path.join(fallback, "payload"),
      receiptPayload({ runAttempt: 1 }, "normalized fallback job logs\n"),
    );
    expect((await fetch(fallback, "--ci-selection-file=selection.json")).json.outcome).not.toBe(
      "checked",
    );
  });
});

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
