// audits/hooks/gateguard-parity.integration.test.ts — one GateGuard behaviour table, every host.
//
// bkit generates the four hooks at install from one shared engine
// (`.bkit/core/hooks/`) plus per-host parts, and they reach the model by
// different routes: Claude writes `hookSpecificOutput.additionalContext` to stdout,
// Cursor writes `additional_context` with `permission: "allow"`, opencode writes to
// stderr (and throws to block), Codex is Claude-shaped.
//
// Every row runs against every host's GENERATED hook (the template as install renders
// it) through an adapter that normalises the delivery mechanism away. A behaviour that
// cannot hold on some host is stated here as an explicit exception.
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { afterAll, describe, expect, it } from "vitest";

import { readTemplate } from "../../render/parts";

const GENERATED = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-gg-parity-"));
afterAll(() => fs.rmSync(GENERATED, { recursive: true, force: true }));
const [CLAUDE_HOOK, CURSOR_HOOK, OPENCODE_PLUGIN, CODEX_HOOK] = [
  [".claude/hooks/bkit-gateguard.cjs", "claude.cjs"],
  [".cursor/hooks/bkit-gateguard.cjs", "cursor.cjs"],
  // `.mjs`: the plugin is an ES module, and the temp dir has no package.json saying so.
  [".opencode/plugin/bkit-gateguard.js", "opencode.mjs"],
  [".codex/hooks/bkit-gateguard.cjs", "codex.cjs"],
].map(([rel, name]) => {
  const out = path.join(GENERATED, name);
  fs.writeFileSync(out, readTemplate(path.resolve(".bkit/core", rel)));
  return out;
});

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
  // Random component: dedup state is keyed by session id and persists in the OS temp dir
  // for 24h, and pids are recycled.
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
    const { default: plugin } = await import(pathToFileURL(OPENCODE_PLUGIN).href);
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
 * `tool_input.command`, so the adapter builds a real envelope.
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

      // Non-JS ecosystems: their linters / formatters gate the same way, so an
      // edit to their config gets the same advisory.
      it.each([
        "pyproject.toml",
        "ruff.toml",
        ".ruff.toml",
        ".flake8",
        "mypy.ini",
        ".golangci.yml",
        ".golangci.toml",
        "clippy.toml",
        "rustfmt.toml",
      ])("a %s gate config gets the weaken-the-gate advisory", async (file) => {
        const r = await run(host, { file, session: newSession() });
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

describe("gateguard behaviour parity — template copies", () => {
  function repo(name: string): string {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "gg-parity-repo-"));
    fs.writeFileSync(path.join(dir, "package.json"), JSON.stringify({ name }));
    return dir;
  }
  const consumer = repo("consumer-app");
  const dogfood = repo("@cbartens/bkit");

  for (const host of HOSTS) {
    it(`${host}: a consumer's .bkit/templates/.vale.ini is not a gate config`, async () => {
      const file = path.join(consumer, ".bkit/templates/.vale.ini");
      const r = await run(host, { file, session: newSession() });
      expect(r.advisory).toContain("[bkit GateGuard]");
      expect(r.advisory).not.toContain("quality-gate config");
    });

    it(`${host}: a consumer's root .vale.ini is a gate config`, async () => {
      const file = path.join(consumer, ".vale.ini");
      const r = await run(host, { file, session: newSession() });
      expect(r.advisory).toContain("quality-gate config");
    });

    it(`${host}: bkit's own .bkit/templates/.vale.ini is a gate config`, async () => {
      const file = path.join(dogfood, ".bkit/templates/.vale.ini");
      const r = await run(host, { file, session: newSession() });
      expect(r.advisory).toContain("quality-gate config");
    });
  }
});

describe("gateguard behaviour parity — docs density advisory", () => {
  const cases: { file: string; expected: boolean; why: string }[] = [
    { file: "docs/architecture.md", expected: true, why: "a docs markdown file" },
    { file: ".bkit/shared/docs/architecture.md", expected: true, why: "nested docs tree" },
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

  it("every host's generated block carries the shared engine verbatim", () => {
    const engine = fs
      .readFileSync(path.resolve(".bkit/core/hooks/gateguard-engine.js"), "utf-8")
      .trimEnd();
    for (const host of HOSTS) expect(block(FILES[host]), host).toContain(engine);
  });

  // Documented deviation, same class as opencode's. Codex shares Claude's stdin/stdout
  // contract but NOT its payload: edits arrive as `apply_patch` with a V4A patch envelope
  // in `tool_input.command` and no file path at all, so the block carries an extra parser
  // and a different tool vocabulary. The advisory texts are the same.
  it("the codex block carries the same advisory texts as the claude twin", () => {
    const codex = block(CODEX_HOOK);
    const claude = block(CLAUDE_HOOK);
    for (const marker of ["[bkit GateGuard]", "First edit to", "New file", "quality-gate config"]) {
      expect(claude).toContain(marker);
      expect(codex).toContain(marker);
    }
  });

  // The block matches the `apply_patch` tool name and parses the envelope.
  it("the codex block matches apply_patch and parses the V4A envelope", () => {
    const b = block(CODEX_HOOK);
    expect(b).toContain('"apply_patch"');
    expect(b).toContain("parseApplyPatchTargets");
    expect(b).toMatch(/Add\|Update\|Delete/);
  });

  it("the opencode block carries the same advisory texts as the CJS twins", () => {
    // Documented deviation: opencode's block is NOT byte-identical to the other two.
    // It is an ES module with its own tool vocabulary (write/edit/patch vs
    // Write/Edit/MultiEdit) and no `require`; the advisory builders are compared
    // instead of the whole block.
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
// Documented deviations — behaviours that differ by host.
// ---------------------------------------------------------------------------

describe("gateguard parity — documented deviations", () => {
  it("only Claude distinguishes Edit from Write for the new-file nudge", () => {
    // Claude ships Edit / Write / MultiEdit and reserves the reuse checklist for
    // Write. Cursor normalises every edit and create to `Write`, and opencode uses
    // write/edit/patch, so neither can make Claude's distinction. Asserted on Claude
    // alone in audits/hooks/gateguard-claude.integration.test.ts; the create/edit rows above use
    // each host's own vocabulary instead.
    const r = runClaude({ file: "src/nope-parity.ts", session: newSession() });
    expect(r.advisory).toContain("First edit to");
    expect(r.advisory).not.toContain("New file");
  });

  it("blocking is expressed differently per host but means the same thing", () => {
    // Claude: permissionDecision "deny". Cursor: permission "deny" + agent_message.
    // opencode: a thrown Error (its hook has no non-throwing block primitive). The
    // adapters above normalise all three to `blocked`.
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
