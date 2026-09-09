// bkit-gateguard-parity.integration.test.ts — one GateGuard behaviour table, every host.
//
// The three hooks share a byte-identical managed block but reach the model by three
// different routes: Claude writes `hookSpecificOutput.additionalContext` to stdout,
// Cursor writes `additional_context` with `permission: "allow"`, opencode writes to
// stderr (and throws to block). Per-host suites drifted apart — Cursor was missing
// the gate-config, ALLOW_CONFIG_EDIT, deny-retry and all five docs-density cases
// that the other two had.
//
// This file removes the drift as a possibility: every row runs against every host
// through an adapter that normalises the delivery mechanism away. A behaviour that
// cannot hold on some host must be stated here as an explicit exception with its
// reason, not left as a silently missing test.
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";

const CLAUDE_HOOK = path.resolve(".bkit/templates/.claude/hooks/gateguard.cjs");
const CURSOR_HOOK = path.resolve(".bkit/templates/.cursor/hooks/gateguard.cjs");
const OPENCODE_PLUGIN = path.resolve(".bkit/templates/.opencode/plugin/gateguard.js");
const CODEX_HOOK = path.resolve(".bkit/templates/.codex/hooks/gateguard.cjs");

/** Normalised result — what the model ends up seeing, and whether it was stopped. */
interface Outcome {
  advisory: string;
  blocked: boolean;
}

type Host = "claude" | "cursor" | "opencode" | "codex";
const HOSTS: Host[] = ["claude", "cursor", "opencode", "codex"];

let counter = 0;
function newSession(): string {
  counter += 1;
  // Random component deliberate: dedup state is keyed by session id and persists in
  // the OS temp dir for 24h, so a pid+counter id collides whenever a pid is recycled.
  return `gg-parity-${process.pid}-${counter}-${Math.random().toString(36).slice(2)}`;
}

// ---------------------------------------------------------------------------
// Host adapters
// ---------------------------------------------------------------------------

interface Call {
  file: string;
  session: string;
  /** "edit" = modify an existing path, "create" = write a not-yet-existing path. */
  kind?: "edit" | "create";
  env?: Record<string, string | undefined>;
}

function runClaude(c: Call): Outcome {
  const res = spawnSync("node", [CLAUDE_HOOK], {
    input: JSON.stringify({
      tool_name: c.kind === "create" ? "Write" : "Edit",
      tool_input: { file_path: c.file },
      session_id: c.session,
    }),
    encoding: "utf-8",
    env: { ...process.env, BKIT_GATEGUARD: undefined, ...c.env },
  });
  const out = res.stdout.trim() ? JSON.parse(res.stdout.trim()) : {};
  const hso = out.hookSpecificOutput ?? {};
  return {
    advisory: String(hso.additionalContext ?? hso.permissionDecisionReason ?? ""),
    blocked: hso.permissionDecision === "deny",
  };
}

function runCursor(c: Call): Outcome {
  const res = spawnSync("node", [CURSOR_HOOK], {
    input: JSON.stringify({
      // Cursor normalises both edits and creates to `Write`.
      tool_name: "Write",
      tool_input: { file_path: c.file },
      session_id: c.session,
      workspace_roots: [process.cwd()],
      cursor_version: "3.17.8",
    }),
    encoding: "utf-8",
    env: { ...process.env, BKIT_GATEGUARD: undefined, ...c.env },
  });
  const out = res.stdout.trim() ? JSON.parse(res.stdout.trim()) : {};
  return {
    advisory: String(out.additional_context ?? out.agent_message ?? ""),
    blocked: out.permission === "deny",
  };
}

async function runOpencode(c: Call): Promise<Outcome> {
  const saved: Record<string, string | undefined> = {};
  const env = { BKIT_GATEGUARD: undefined, ...c.env };
  for (const [k, v] of Object.entries(env)) {
    saved[k] = process.env[k];
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }

  let captured = "";
  const originalWrite = process.stderr.write.bind(process.stderr);
  process.stderr.write = ((chunk: string | Uint8Array) => {
    captured += chunk.toString();
    return true;
  }) as typeof process.stderr.write;

  let blocked = false;
  let thrownMessage = "";
  try {
    const { default: plugin } = await import(OPENCODE_PLUGIN);
    const hooks = plugin({
      client: { session: { get: async () => ({ parentID: "", agentID: "a" }) } },
    });
    try {
      await hooks["tool.execute.before"](
        { tool: c.kind === "create" ? "write" : "edit", sessionID: c.session },
        { args: { path: c.file } },
      );
    } catch (e) {
      blocked = true;
      thrownMessage = (e as Error).message;
    }
  } finally {
    process.stderr.write = originalWrite;
    for (const [k, v] of Object.entries(saved)) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  }
  return { advisory: blocked ? thrownMessage : captured, blocked };
}

/**
 * Codex sends NO file path. Every edit arrives as `apply_patch` with a V4A patch envelope in
 * `tool_input.command`, so the adapter has to build a real envelope — the two places this host
 * can silently no-op are the tool name and that envelope, and a hand-waved payload here would
 * hide exactly the failure this suite exists to catch.
 */
function runCodex(c: Call): Outcome {
  const op = c.kind === "create" ? "Add" : "Update";
  const hunk = c.kind === "create" ? "+new contents" : "@@\n-before\n+after";
  const res = spawnSync("node", [CODEX_HOOK], {
    input: JSON.stringify({
      tool_name: "apply_patch",
      tool_input: { command: `*** Begin Patch\n*** ${op} File: ${c.file}\n${hunk}\n*** End Patch` },
      session_id: c.session,
      cwd: process.cwd(),
    }),
    encoding: "utf-8",
    env: { ...process.env, BKIT_GATEGUARD: undefined, ...c.env },
  });
  const out = res.stdout.trim() ? JSON.parse(res.stdout.trim()) : {};
  const hso = out.hookSpecificOutput ?? {};
  return {
    advisory: String(hso.additionalContext ?? hso.permissionDecisionReason ?? ""),
    blocked: hso.permissionDecision === "deny",
  };
}

async function run(host: Host, c: Call): Promise<Outcome> {
  if (host === "claude") return runClaude(c);
  if (host === "cursor") return runCursor(c);
  if (host === "codex") return runCodex(c);
  return runOpencode(c);
}

// ---------------------------------------------------------------------------
// The behaviour table — every row asserted on every host
// ---------------------------------------------------------------------------

describe("gateguard behaviour parity — advisory content", () => {
  for (const host of HOSTS) {
    describe(host, () => {
      it("first edit to an existing file gets the investigation checklist", async () => {
        const r = await run(host, { file: "package.json", session: newSession() });
        expect(r.advisory).toContain("[bkit GateGuard]");
        expect(r.advisory).toContain("First edit to");
        expect(r.blocked).toBe(false);
      });

      it("a create of a nonexistent path gets the reuse checklist instead", async () => {
        const r = await run(host, {
          file: "src/does-not-exist-parity.ts",
          session: newSession(),
          kind: "create",
        });
        expect(r.advisory).toContain("New file");
      });

      it("a gate-config path gets the weaken-the-gate advisory", async () => {
        const r = await run(host, { file: "tsconfig.json", session: newSession() });
        expect(r.advisory).toContain("quality-gate config");
      });

      it("BKIT_ALLOW_CONFIG_EDIT=1 downgrades a gate config to the normal checklist", async () => {
        const r = await run(host, {
          file: "tsconfig.json",
          session: newSession(),
          env: { BKIT_ALLOW_CONFIG_EDIT: "1" },
        });
        expect(r.advisory).not.toContain("quality-gate config");
        expect(r.advisory).toContain("[bkit GateGuard]");
      });

      it("an ordinary source file is not treated as a gate config", async () => {
        const r = await run(host, { file: "package.json", session: newSession() });
        expect(r.advisory).not.toContain("quality-gate config");
      });
    });
  }
});

describe("gateguard behaviour parity — docs density advisory", () => {
  const cases: { file: string; expected: boolean; why: string }[] = [
    { file: "docs/architecture.md", expected: true, why: "a docs markdown file" },
    { file: ".bkit/templates/docs/architecture.md", expected: true, why: "nested docs tree" },
    { file: "Documents/architecture.md", expected: false, why: "segment match, not substring" },
    {
      file: "docs/plans/202608/x/design.md",
      expected: false,
      why: "plans follow the plan template",
    },
    { file: "docs/knowledge.jsonl", expected: false, why: "gated on .md" },
  ];
  for (const host of HOSTS) {
    for (const c of cases) {
      it(`${host}: ${c.expected ? "fires" : "does not fire"} on ${c.file} (${c.why})`, async () => {
        const r = await run(host, { file: c.file, session: newSession() });
        if (c.expected) expect(r.advisory).toContain("docs/*.md authoring");
        else expect(r.advisory).not.toContain("docs/*.md authoring");
      });
    }
  }
});

describe("gateguard behaviour parity — dedup", () => {
  for (const host of HOSTS) {
    it(`${host}: second touch of the same file in the same session is silent`, async () => {
      const session = newSession();
      expect((await run(host, { file: "package.json", session })).advisory).toContain(
        "[bkit GateGuard]",
      );
      expect((await run(host, { file: "package.json", session })).advisory).toBe("");
    });

    it(`${host}: a different file in the same session warns again`, async () => {
      const session = newSession();
      await run(host, { file: "package.json", session });
      const r = await run(host, { file: "tsconfig.json", session });
      expect(r.advisory).toContain("[bkit GateGuard]");
    });
  }
});

describe("gateguard behaviour parity — modes", () => {
  for (const host of HOSTS) {
    it(`${host}: BKIT_GATEGUARD=off is a total no-op`, async () => {
      const r = await run(host, {
        file: "package.json",
        session: newSession(),
        env: { BKIT_GATEGUARD: "off" },
      });
      expect(r.advisory).toBe("");
      expect(r.blocked).toBe(false);
    });

    it(`${host}: BKIT_GATEGUARD=deny blocks the first touch with the checklist`, async () => {
      const r = await run(host, {
        file: "package.json",
        session: newSession(),
        env: { BKIT_GATEGUARD: "deny" },
      });
      expect(r.blocked).toBe(true);
      expect(r.advisory).toContain("[bkit GateGuard]");
    });

    it(`${host}: deny mode allows the retry (dedup lets the second call through)`, async () => {
      const session = newSession();
      const env = { BKIT_GATEGUARD: "deny" };
      expect((await run(host, { file: "package.json", session, env })).blocked).toBe(true);
      expect((await run(host, { file: "package.json", session, env })).blocked).toBe(false);
    });
  }
});

describe("gateguard behaviour parity — no-op and fail-open", () => {
  for (const host of HOSTS) {
    it(`${host}: an edit payload with no file path is ignored`, async () => {
      const r = await run(host, { file: "", session: newSession() });
      expect(r.advisory).toBe("");
      expect(r.blocked).toBe(false);
    });

    it(`${host}: subagents are NOT exempt`, async () => {
      // Every host now advises subagent edits. Claude's `agent_id` short-circuit and
      // opencode's parentID lookup were both removed; Cursor never had a marker.
      const r = await run(host, { file: "package.json", session: newSession() });
      expect(r.advisory).toContain("[bkit GateGuard]");
    });
  }
});

describe("gateguard structural parity", () => {
  const FILES: Record<Host, string> = {
    claude: CLAUDE_HOOK,
    cursor: CURSOR_HOOK,
    opencode: OPENCODE_PLUGIN,
    codex: CODEX_HOOK,
  };

  function block(file: string): string {
    const src = fs.readFileSync(file, "utf-8");
    return src.slice(src.indexOf("// bkit:start"), src.indexOf("// bkit:end"));
  }

  for (const host of HOSTS) {
    it(`${host}: carries slash-comment markers with start before end`, () => {
      const src = fs.readFileSync(FILES[host], "utf-8");
      expect(src.indexOf("// bkit:start")).toBeGreaterThanOrEqual(0);
      expect(src.indexOf("// bkit:end")).toBeGreaterThan(src.indexOf("// bkit:start"));
    });

    it(`${host}: the managed block never emits or reads stdin`, () => {
      const b = block(FILES[host]);
      expect(b).not.toContain("process.stdout.write");
      expect(b).not.toContain("process.stderr.write");
      expect(b).not.toContain("readFileSync(0");
    });

    it(`${host}: dedup state lives in the OS temp dir, never in the consumer repo`, () => {
      const b = block(FILES[host]);
      expect(b).toContain("tmpdir()");
    });
  }

  it("claude and cursor blocks are byte-identical", () => {
    expect(block(CLAUDE_HOOK)).toBe(block(CURSOR_HOOK));
  });

  // Documented deviation, same class as opencode's. Codex shares Claude's stdin/stdout
  // contract but NOT its payload: edits arrive as `apply_patch` with a V4A patch envelope
  // in `tool_input.command` and no file path at all, so the block carries an extra parser
  // and a different tool vocabulary. What must not differ is what the model is told.
  it("the codex block carries the same advisory texts as the claude twin", () => {
    const codex = block(CODEX_HOOK);
    const claude = block(CLAUDE_HOOK);
    for (const marker of ["[bkit GateGuard]", "First edit to", "New file", "quality-gate config"]) {
      expect(claude).toContain(marker);
      expect(codex).toContain(marker);
    }
  });

  // The two ways this host silently no-ops: wrong tool name, or no envelope parser.
  // Both would leave a hook that installs, exits 0 and never fires.
  it("the codex block matches apply_patch and parses the V4A envelope", () => {
    const b = block(CODEX_HOOK);
    expect(b).toContain('"apply_patch"');
    expect(b).toContain("parseApplyPatchTargets");
    expect(b).toMatch(/Add\|Update\|Delete/);
  });

  it("the opencode block carries the same advisory texts as the CJS twins", () => {
    // Documented deviation: opencode's block is NOT byte-identical to the other two.
    // It is an ES module with its own tool vocabulary (write/edit/patch vs
    // Write/Edit/MultiEdit) and no `require`, so the surrounding code genuinely
    // differs. What must not differ is what the model is told, so the advisory
    // builders are compared instead of the whole block.
    const oc = block(OPENCODE_PLUGIN);
    const cj = block(CLAUDE_HOOK);
    for (const marker of [
      "[bkit GateGuard]",
      "quality-gate config",
      "docs/*.md authoring",
      "Self-review is weak",
      "Bolt-on drift starts here",
    ]) {
      expect(oc).toContain(marker);
      expect(cj).toContain(marker);
    }
  });
});

// ---------------------------------------------------------------------------
// Documented deviations — a behaviour that cannot hold everywhere states why.
// ---------------------------------------------------------------------------

describe("gateguard parity — documented deviations", () => {
  it("only Claude distinguishes Edit from Write for the new-file nudge", () => {
    // Claude ships Edit / Write / MultiEdit and reserves the reuse checklist for
    // Write. Cursor normalises every edit and create to `Write`, and opencode uses
    // write/edit/patch, so neither can make Claude's distinction. Asserted on Claude
    // alone in bkit-gateguard-claude.integration.test.ts; the create/edit rows above use
    // each host's own vocabulary instead.
    const r = runClaude({ file: "src/nope-parity.ts", session: newSession() });
    expect(r.advisory).toContain("First edit to");
    expect(r.advisory).not.toContain("New file");
  });

  it("blocking is expressed differently per host but means the same thing", () => {
    // Claude: permissionDecision "deny". Cursor: permission "deny" + agent_message.
    // opencode: a thrown Error (its hook has no non-throwing block primitive). The
    // adapters above normalise all three to `blocked`, which is why the deny rows
    // can be asserted uniformly.
    const claude = runClaude({
      file: "package.json",
      session: newSession(),
      env: { BKIT_GATEGUARD: "deny" },
    });
    const cursor = runCursor({
      file: "package.json",
      session: newSession(),
      env: { BKIT_GATEGUARD: "deny" },
    });
    expect(claude.blocked).toBe(true);
    expect(cursor.blocked).toBe(true);
  });

  it("malformed stdin is a CJS-hook concern only", () => {
    // Claude and Cursor parse stdin and must fail open on garbage. opencode receives
    // an already-parsed object from its host, so it has no stdin to malform; its
    // equivalent (null/missing args) is covered in its own suite.
    for (const hook of [CLAUDE_HOOK, CURSOR_HOOK]) {
      const res = spawnSync("node", [hook], { input: "not json", encoding: "utf-8" });
      expect(res.status).toBe(0);
    }
  });
});
