// audits/hooks/gateguard-claude.integration.test.ts — behavioural tests for the shipped GateGuard
// PreToolUse hook (.bkit/core/.claude/hooks/bkit-gateguard.cjs). Spawns the hook as
// install generates it (shared parts spliced in) with node, feeds a PreToolUse payload
// on stdin, and asserts the stdout contract:
//   - advisory by default (additionalContext, no permissionDecision)
//   - fail-open / no-op on disabled, subagent, non-edit, malformed/empty input
//   - dedup once per (session, file)
//   - config-protection advisory + escape hatch
//   - env-gated deny flip
//
// The hook must NEVER exit non-zero (advisory; fail-open) — every case asserts
// status 0.

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { spawnSync } from "node:child_process";
import { afterAll, describe, expect, it } from "vitest";

import { readTemplate } from "../../render/parts";

const GENERATED = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-gg-claude-"));
afterAll(() => fs.rmSync(GENERATED, { recursive: true, force: true }));
const HOOK = path.join(GENERATED, "gateguard.cjs");
fs.writeFileSync(HOOK, readTemplate(path.resolve(".bkit/core/.claude/hooks/bkit-gateguard.cjs")));

let sessionCounter = 0;
// Unique per test + per run (pid) so the OS-temp dedup state never bleeds across
// cases or across repeated test runs.
function newSession(): string {
  sessionCounter += 1;
  // Dedup state is keyed by session id and lives in the OS temp dir for 24h, so a
  // pid+counter id collides with an earlier run whenever the OS recycles the pid —
  // the advisory is then suppressed and the assertion fails for no reason.
  return `gg-test-${process.pid}-${sessionCounter}-${Math.random().toString(36).slice(2)}`;
}

interface RunResult {
  status: number | null;
  out: Record<string, unknown> | null;
  raw: string;
}

function run(
  payload: unknown,
  opts: { env?: Record<string, string>; rawInput?: string } = {},
): RunResult {
  const input = opts.rawInput !== undefined ? opts.rawInput : JSON.stringify(payload);
  const res = spawnSync("node", [HOOK], {
    input,
    encoding: "utf-8",
    env: { ...process.env, ...(opts.env ?? {}) },
  });
  const raw = res.stdout ?? "";
  let out: Record<string, unknown> | null = null;
  if (raw.trim()) {
    try {
      out = JSON.parse(raw) as Record<string, unknown>;
    } catch {
      out = null;
    }
  }
  return { status: res.status, out, raw };
}

function editPayload(filePath: string, sessionId: string, extra: Record<string, unknown> = {}) {
  return {
    session_id: sessionId,
    hook_event_name: "PreToolUse",
    tool_name: "Edit",
    tool_input: { file_path: filePath },
    ...extra,
  };
}

function hookOutput(r: RunResult): Record<string, unknown> {
  return (r.out?.["hookSpecificOutput"] ?? {}) as Record<string, unknown>;
}

describe("gateguard hook — advisory (default mode)", () => {
  it("injects an investigation checklist on first edit, never blocks", () => {
    const r = run(editPayload("src/foo.ts", newSession()));
    expect(r.status).toBe(0);
    const hso = hookOutput(r);
    expect(hso["hookEventName"]).toBe("PreToolUse");
    expect(typeof hso["additionalContext"]).toBe("string");
    expect(hso["additionalContext"]).toContain("GateGuard");
    expect(hso["additionalContext"]).toContain("foo.ts");
    // Advisory carries NO permission decision.
    expect(hso["permissionDecision"]).toBeUndefined();
  });

  it("matches Write and MultiEdit too", () => {
    for (const tool of ["Write", "MultiEdit"]) {
      const r = run({
        session_id: newSession(),
        tool_name: tool,
        tool_input: { file_path: "src/bar.ts" },
      });
      expect(r.status).toBe(0);
      expect(hookOutput(r)["additionalContext"]).toContain("GateGuard");
    }
  });

  it("dedups: second edit of the same file in the same session is a no-op", () => {
    const session = newSession();
    const first = run(editPayload("src/dedup.ts", session));
    expect(first.out).not.toBeNull();
    const second = run(editPayload("src/dedup.ts", session));
    expect(second.status).toBe(0);
    expect(second.raw.trim()).toBe("");
  });

  it("warns again for a different file in the same session", () => {
    const session = newSession();
    run(editPayload("src/a.ts", session));
    const r = run(editPayload("src/b.ts", session));
    expect(hookOutput(r)["additionalContext"]).toContain("b.ts");
  });
});

describe("gateguard hook — reuse advisory (new-file Write)", () => {
  it("emits a reuse/anti-duplicate checklist for a Write to a new (nonexistent) path", () => {
    const r = run({
      session_id: newSession(),
      tool_name: "Write",
      tool_input: { file_path: "src/brand-new-does-not-exist.ts" },
    });
    expect(r.status).toBe(0);
    const ctx = hookOutput(r)["additionalContext"] as string;
    expect(ctx).toContain("Evolve existing code first");
    expect(ctx).not.toContain("First edit to");
  });

  it("a Write to an EXISTING path gets the investigation checklist, not reuse", () => {
    const r = run({
      session_id: newSession(),
      tool_name: "Write",
      tool_input: { file_path: "package.json" },
    });
    const ctx = hookOutput(r)["additionalContext"] as string;
    expect(ctx).toContain("First edit to");
    expect(ctx).not.toContain("Evolve existing code first");
  });

  it("an Edit to a nonexistent path stays on the investigation checklist (reuse is Write-only)", () => {
    const r = run(editPayload("src/edit-nonexistent.ts", newSession()));
    const ctx = hookOutput(r)["additionalContext"] as string;
    expect(ctx).toContain("First edit to");
    expect(ctx).not.toContain("Evolve existing code first");
  });
});

describe("gateguard hook — config protection (item D)", () => {
  it("emits the gate-config advisory for tsconfig.json", () => {
    const r = run(editPayload("tsconfig.json", newSession()));
    expect(r.status).toBe(0);
    expect(hookOutput(r)["additionalContext"]).toContain("quality-gate config");
  });

  it("tells agents inside /bkit-* workflows to record the block, never self-approve", () => {
    const r = run(editPayload("tsconfig.json", newSession()));
    expect(hookOutput(r)["additionalContext"]).toContain(
      "- If you are inside a `/bkit-*` workflow, where no sign-off is available:\n" +
        "  - Record the block and continue.\n" +
        "  - NEVER self-approve the opt-out.",
    );
  });

  it.each([
    "vitest.config.ts",
    "eslint.config.mjs",
    ".prettierrc",
    "slop-scan.config.json",
    ".vale.ini",
    ".lintstagedrc.json",
  ])("flags %s as a gate config", (file) => {
    const r = run(editPayload(file, newSession()));
    expect(hookOutput(r)["additionalContext"]).toContain("quality-gate config");
  });

  it("BKIT_ALLOW_CONFIG_EDIT=1 downgrades a config edit to the normal checklist", () => {
    const r = run(editPayload("tsconfig.json", newSession()), {
      env: { BKIT_ALLOW_CONFIG_EDIT: "1" },
    });
    const ctx = hookOutput(r)["additionalContext"] as string;
    expect(ctx).toContain("GateGuard");
    expect(ctx).not.toContain("quality-gate config");
  });

  it("a normal source file is not treated as a gate config", () => {
    const r = run(editPayload("src/tsconfig-helper.ts", newSession()));
    expect(hookOutput(r)["additionalContext"]).not.toContain("quality-gate config");
  });
});

describe("gateguard hook — deny flip (BKIT_GATEGUARD=deny)", () => {
  it("denies the first touch with the checklist as the reason", () => {
    const r = run(editPayload("src/deny.ts", newSession()), {
      env: { BKIT_GATEGUARD: "deny" },
    });
    expect(r.status).toBe(0);
    const hso = hookOutput(r);
    expect(hso["permissionDecision"]).toBe("deny");
    expect(hso["permissionDecisionReason"]).toContain("GateGuard");
  });

  it("allows the retry (dedup) after the first deny", () => {
    const session = newSession();
    const env = { BKIT_GATEGUARD: "deny" };
    const first = run(editPayload("src/retry.ts", session), { env });
    expect(hookOutput(first)["permissionDecision"]).toBe("deny");
    const retry = run(editPayload("src/retry.ts", session), { env });
    expect(retry.raw.trim()).toBe("");
  });
});

describe("gateguard hook — no-op / fail-open cases", () => {
  it("BKIT_GATEGUARD=off disables the hook", () => {
    const r = run(editPayload("src/off.ts", newSession()), { env: { BKIT_GATEGUARD: "off" } });
    expect(r.status).toBe(0);
    expect(r.raw.trim()).toBe("");
  });

  it("subagents are NOT exempt — an agent_id payload still gets the checklist", () => {
    // A subagent edit gets the advisory too.
    const r = run(editPayload("src/sub.ts", newSession(), { agent_id: "subagent-123" }));
    expect(r.status).toBe(0);
    expect(hookOutput(r)["additionalContext"]).toContain("[bkit GateGuard]");
  });

  it("a subagent sharing its parent's session_id gets its own checklist, once", () => {
    const session = newSession();
    expect(hookOutput(run(editPayload("src/shared.ts", session)))["additionalContext"]).toContain(
      "[bkit GateGuard]",
    );
    const sub = editPayload("src/shared.ts", session, { agent_id: "subagent-456" });
    expect(hookOutput(run(sub))["additionalContext"]).toContain("[bkit GateGuard]");
    expect(run(sub).raw.trim()).toBe("");
    expect(run(editPayload("src/shared.ts", session)).raw.trim()).toBe("");
  });

  it("ignores non-edit tools", () => {
    const r = run({
      session_id: newSession(),
      tool_name: "Bash",
      tool_input: { command: "rm -rf build" },
    });
    expect(r.status).toBe(0);
    expect(r.raw.trim()).toBe("");
  });

  it("ignores an edit payload with no file path", () => {
    const r = run({ session_id: newSession(), tool_name: "Edit", tool_input: {} });
    expect(r.status).toBe(0);
    expect(r.raw.trim()).toBe("");
  });

  it("fails open on malformed JSON stdin", () => {
    const r = run(null, { rawInput: "{not json" });
    expect(r.status).toBe(0);
    expect(r.raw.trim()).toBe("");
  });

  it("fails open on empty stdin", () => {
    const r = run(null, { rawInput: "" });
    expect(r.status).toBe(0);
    expect(r.raw.trim()).toBe("");
  });
});

describe("gateguard hook — docs/*.md density advisory (#422)", () => {
  it("appends the density advisory for a docs/ markdown file", () => {
    const r = run(editPayload("docs/architecture.md", newSession()));
    expect(r.status).toBe(0);
    expect(hookOutput(r)["additionalContext"]).toContain("docs/*.md authoring");
  });

  it("does NOT match a Documents/ ancestor (segment match, not substring)", () => {
    const r = run(editPayload("Documents/architecture.md", newSession()));
    expect(r.status).toBe(0);
    expect(hookOutput(r)["additionalContext"]).not.toContain("docs/*.md authoring");
  });

  it("excludes docs/plans/ (plan template governs those, not the docs register)", () => {
    const r = run(editPayload("docs/plans/202608/logs/422-foo/design.md", newSession()));
    expect(r.status).toBe(0);
    expect(hookOutput(r)["additionalContext"]).not.toContain("docs/*.md authoring");
  });

  it("does NOT match docs/knowledge.jsonl (gated on .md)", () => {
    const r = run(editPayload("docs/knowledge.jsonl", newSession()));
    expect(r.status).toBe(0);
    expect(hookOutput(r)["additionalContext"]).not.toContain("docs/*.md authoring");
  });

  it("matches a nested docs/ tree via segment match (.bkit/shared/docs/architecture.md)", () => {
    const r = run(editPayload(".bkit/shared/docs/architecture.md", newSession()));
    expect(r.status).toBe(0);
    expect(hookOutput(r)["additionalContext"]).toContain("docs/*.md authoring");
  });
});

const GUARD = path.join(GENERATED, "guardrails.cjs");
fs.writeFileSync(GUARD, readTemplate(path.resolve(".bkit/core/.claude/hooks/bkit-guardrails.cjs")));

function runGuard(payload: unknown): { status: number | null; raw: string; context: string } {
  const res = spawnSync("node", [GUARD], {
    input: JSON.stringify(payload),
    encoding: "utf-8",
    env: { ...process.env, BKIT_GATEGUARD: undefined },
  });
  const out = res.stdout.trim()
    ? (JSON.parse(res.stdout.trim()) as { hookSpecificOutput: Record<string, unknown> })
    : { hookSpecificOutput: { additionalContext: "" } };
  expect(out.hookSpecificOutput["permissionDecision"]).toBeUndefined();
  return {
    status: res.status,
    raw: res.stdout,
    context: String(out.hookSpecificOutput["additionalContext"]),
  };
}

describe("gateguard hook — shell and notebook advice (shared identity)", () => {
  it("routes Claude notebook and shell targets through shared advice", () => {
    // Matcher and payload agree: the registered edit matcher names NotebookEdit.
    const settings = JSON.parse(
      fs.readFileSync(path.resolve(".bkit/shared/.claude/settings.json"), "utf-8"),
    ) as { hooks: { PreToolUse: { matcher?: string; hooks: { command: string }[] }[] } };
    const gate = settings.hooks.PreToolUse.find((g) =>
      g.hooks.some((h) => h.command.includes("bkit-gateguard.cjs")),
    );
    expect(String(gate?.matcher).split("|")).toEqual(
      expect.arrayContaining(["Edit", "Write", "MultiEdit", "NotebookEdit"]),
    );

    const ws = fs.mkdtempSync(path.join(GENERATED, "ws-"));
    const session = newSession();

    // NotebookEdit carries `notebook_path`, not `file_path`.
    const nb = path.join(ws, "docs", "analysis.ipynb");
    const notebook = run({
      session_id: session,
      hook_event_name: "PreToolUse",
      tool_name: "NotebookEdit",
      tool_input: { notebook_path: nb, new_source: "x = 1", edit_mode: "replace" },
    });
    expect(notebook.status).toBe(0);
    const nbCtx = String(hookOutput(notebook)["additionalContext"]);
    expect(nbCtx).toContain("analysis.ipynb");
    expect(nbCtx).toContain("First edit to");
    expect(hookOutput(notebook)["permissionDecision"]).toBeUndefined();
    // Acknowledged: the same notebook is silent next time.
    expect(
      run({
        session_id: session,
        tool_name: "NotebookEdit",
        tool_input: { notebook_path: nb, new_source: "y", edit_mode: "replace" },
      }).raw.trim(),
    ).toBe("");

    // A shell edit of two exact targets gets the per-file checklist for each, plus the
    // general authoring reminder, in one response.
    const shell = runGuard({
      session_id: session,
      tool_name: "Bash",
      cwd: ws,
      tool_input: { command: "sed -i s/a/b/ docs/one.md docs/two.md" },
    });
    expect(shell.status).toBe(0);
    expect(shell.context).toContain("edits files through the shell");
    expect(shell.context).toContain("one.md");
    expect(shell.context).toContain("two.md");
    expect(shell.context.split("First edit to")).toHaveLength(3);
    expect(shell.context).toContain(".bkit/authoring.md");
    expect(shell.context).toContain("Which Sections Apply");

    // The shell acknowledgement and the edit tool share one warning record.
    const afterShell = run(editPayload(path.join(ws, "docs", "one.md"), session));
    expect(afterShell.raw.trim()).toBe("");

    // And the other direction: an edit-tool warning silences the shell checklist.
    run(editPayload(path.join(ws, "docs", "three.md"), session));
    const again = runGuard({
      session_id: session,
      tool_name: "Bash",
      cwd: ws,
      tool_input: { command: "sed -i s/a/b/ docs/three.md" },
    });
    expect(again.context).toContain("three.md");
    expect(again.context).not.toContain("First edit to");

    // Uncertain script effects stay explicit and read-only commands stay quiet.
    const unknown = runGuard({
      session_id: newSession(),
      tool_name: "Bash",
      cwd: ws,
      tool_input: { command: "python3 gen.py" },
    });
    expect(unknown.context).toContain("cannot be determined");
    expect(unknown.context).toContain(".bkit/authoring.md");
    expect(
      runGuard({
        session_id: newSession(),
        tool_name: "Bash",
        cwd: ws,
        tool_input: { command: "cat docs/one.md" },
      }).raw.trim(),
    ).toBe("");
  });
});
