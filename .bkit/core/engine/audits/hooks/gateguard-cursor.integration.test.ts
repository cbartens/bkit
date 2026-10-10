// audits/hooks/gateguard-cursor.integration.test.ts — Cursor GateGuard hook, spawned as a
// real process, plus the three-way managed-block parity that keeps the hosts honest.
//
// Payload shapes here are verbatim from the live Cursor 3.17.8 spike: Cursor
// normalises both edits and creates to `tool_name: "Write"` with
// `tool_input: { file_path, content }`, sends a workspace-RELATIVE file_path on
// writes, carries `session_id` (equal to `conversation_id`), and carries no
// subagent marker of any kind.
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { spawnSync } from "node:child_process";
import { afterAll, afterEach, beforeEach, describe, expect, it } from "vitest";

import { readTemplate } from "../../render/parts";

// Both hooks as install generates them (shared parts spliced in).
const GENERATED = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-gg-cursor-"));
afterAll(() => fs.rmSync(GENERATED, { recursive: true, force: true }));
const HOOK = path.join(GENERATED, "cursor.cjs");
const CLAUDE_HOOK = path.join(GENERATED, "claude.cjs");
fs.writeFileSync(HOOK, readTemplate(path.resolve(".bkit/core/.cursor/hooks/bkit-gateguard.cjs")));
fs.writeFileSync(
  CLAUDE_HOOK,
  readTemplate(path.resolve(".bkit/core/.claude/hooks/bkit-gateguard.cjs")),
);

let workspace: string;

beforeEach(() => {
  workspace = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-cursor-gg-"));
});

afterEach(() => {
  fs.rmSync(workspace, { recursive: true, force: true });
});

function newSession(): string {
  return `cur-${Math.random().toString(36).slice(2)}`;
}

function writePayload(relPath: string, session: string, extra: Record<string, unknown> = {}) {
  return {
    conversation_id: session,
    session_id: session,
    generation_id: "gen-1",
    model: "grok-4.6",
    tool_name: "Write",
    tool_input: { file_path: relPath, content: "x\n" },
    tool_use_id: "call-1",
    hook_event_name: "preToolUse",
    cursor_version: "3.17.8",
    workspace_roots: [workspace],
    ...extra,
  };
}

function run(payload: unknown, env: Record<string, string | undefined> = {}) {
  const res = spawnSync("node", [HOOK], {
    input: JSON.stringify(payload),
    encoding: "utf-8",
    env: { ...process.env, BKIT_GATEGUARD: undefined, ...env },
  });
  let parsed: Record<string, unknown> = {};
  try {
    parsed = JSON.parse(res.stdout.trim());
  } catch {
    parsed = {};
  }
  return { status: res.status, raw: res.stdout, out: parsed };
}

describe("cursor gateguard — advisory delivery", () => {
  it("emits permission allow with additional_context (never blocks by default)", () => {
    fs.writeFileSync(path.join(workspace, "foo.ts"), "existing\n", "utf-8");
    const r = run(writePayload("foo.ts", newSession()));
    expect(r.status).toBe(0);
    expect(r.out["permission"]).toBe("allow");
    expect(String(r.out["additional_context"])).toContain("bkit GateGuard");
  });

  it("dedups per (session, file) — second touch is a bare allow", () => {
    fs.writeFileSync(path.join(workspace, "foo.ts"), "existing\n", "utf-8");
    const session = newSession();
    expect(run(writePayload("foo.ts", session)).out["additional_context"]).toBeDefined();
    const second = run(writePayload("foo.ts", session));
    expect(second.out["permission"]).toBe("allow");
    expect(second.out["additional_context"]).toBeUndefined();
  });

  it("emits exactly one JSON document", () => {
    fs.writeFileSync(path.join(workspace, "foo.ts"), "existing\n", "utf-8");
    const r = run(writePayload("foo.ts", newSession()));
    expect(() => JSON.parse(r.raw.trim())).not.toThrow();
    expect(r.raw.trim().split("}{")).toHaveLength(1);
  });
});

describe("cursor gateguard — relative path resolution (spike fix)", () => {
  it("an EXISTING file gets the investigation checklist, not the new-file nudge", () => {
    // Cursor sends a workspace-relative path. Resolving it against
    // workspace_roots[0] is what stops every edit reading as a new file.
    fs.writeFileSync(path.join(workspace, "existing.ts"), "content\n", "utf-8");
    const ctx = String(run(writePayload("existing.ts", newSession())).out["additional_context"]);
    expect(ctx).toContain("First edit to");
    expect(ctx).not.toContain("New file");
  });

  it("a genuinely absent file gets the new-file nudge", () => {
    const ctx = String(run(writePayload("brand-new.ts", newSession())).out["additional_context"]);
    expect(ctx).toContain("New file");
  });

  it("an absolute file_path is used as-is", () => {
    const abs = path.join(workspace, "abs.ts");
    fs.writeFileSync(abs, "content\n", "utf-8");
    const ctx = String(run(writePayload(abs, newSession())).out["additional_context"]);
    expect(ctx).toContain("First edit to");
  });
});

describe("cursor gateguard — modes", () => {
  it("deny mode routes the checklist to agent_message, not user_message alone", () => {
    // Cursor shows user_message to the human; the model reads agent_message. A
    // checklist the model never sees is not a gate.
    fs.writeFileSync(path.join(workspace, "foo.ts"), "existing\n", "utf-8");
    const r = run(writePayload("foo.ts", newSession()), { BKIT_GATEGUARD: "deny" });
    expect(r.out["permission"]).toBe("deny");
    expect(String(r.out["agent_message"])).toContain("bkit GateGuard");
  });

  it("off mode is a bare allow", () => {
    fs.writeFileSync(path.join(workspace, "foo.ts"), "existing\n", "utf-8");
    const r = run(writePayload("foo.ts", newSession()), { BKIT_GATEGUARD: "off" });
    expect(r.out["permission"]).toBe("allow");
    expect(r.out["additional_context"]).toBeUndefined();
  });
});

describe("cursor gateguard — no-op and fail-open cases", () => {
  it("non-edit tools are ignored", () => {
    const r = run({ ...writePayload("foo.ts", newSession()), tool_name: "Read" });
    expect(r.out["permission"]).toBe("allow");
    expect(r.out["additional_context"]).toBeUndefined();
  });

  it("malformed and empty stdin still emit one allow", () => {
    for (const input of ["", "not json at all"]) {
      const res = spawnSync("node", [HOOK], { input, encoding: "utf-8" });
      expect(res.status).toBe(0);
      expect(JSON.parse(res.stdout.trim())).toEqual({ permission: "allow" });
    }
  });
});

describe("cursor gateguard — subagents are NOT exempt", () => {
  it("advises on an edit even when the payload carries subagent-ish markers", () => {
    // Cursor's preToolUse payload has no subagent marker at all; subagents are included
    // even if a marker appears.
    fs.writeFileSync(path.join(workspace, "foo.ts"), "existing\n", "utf-8");
    const r = run(writePayload("foo.ts", newSession(), { agent_id: "sub-1", is_subagent: true }));
    expect(String(r.out["additional_context"])).toContain("bkit GateGuard");
  });
});

describe("gateguard managed-block parity — cursor vs claude", () => {
  function block(file: string): string {
    const src = fs.readFileSync(file, "utf-8");
    const s = src.indexOf("// bkit:start");
    const e = src.indexOf("// bkit:end");
    expect(s).toBeGreaterThanOrEqual(0);
    expect(e).toBeGreaterThan(s);
    return src.slice(s, e);
  }

  it("the Cursor and Claude managed blocks are byte-identical", () => {
    // One advisory engine, two drivers. If these ever diverge, the two hosts start
    // teaching different things — which is the failure the parity test exists for.
    expect(block(HOOK)).toBe(block(CLAUDE_HOOK));
  });

  it("the Cursor block contains no host-specific emit or stdin read", () => {
    // Match the CALLS, not the words — the block's own comments name process.stdout.
    const b = block(HOOK);
    expect(b).not.toContain("process.stdout.write");
    expect(b).not.toContain("readFileSync(0");
    expect(b).not.toContain("permission:");
  });

  it("the Cursor driver holds exactly one emitter", () => {
    const src = fs.readFileSync(HOOK, "utf-8");
    expect(src.split("process.stdout.write").length - 1).toBe(1);
  });
});
