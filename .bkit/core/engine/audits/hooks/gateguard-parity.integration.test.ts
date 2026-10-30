// audits/hooks/gateguard-parity.integration.test.ts — one GateGuard behaviour table, every host.
//
// bkit generates the four hooks at install from one shared engine
// (`.bkit/core/hooks/`) plus per-host parts, and they reach the model by
// different routes: Claude writes `hookSpecificOutput.additionalContext` to stdout,
// Cursor writes `additional_context` with `permission: "allow"`, opencode appends the
// checklist to the tool result in its after-execute hook (and throws from before to
// block), Codex is Claude-shaped.
//
// Every row runs against every host's GENERATED hook (the template as install renders
// it) through an adapter that normalises the delivery mechanism away. A behaviour that
// cannot hold on some host is stated here as an explicit exception.
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { afterAll, describe, expect, it, vi } from "vitest";

import { readTemplate } from "../../render/parts";

const GENERATED = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-gg-parity-"));
afterAll(() => fs.rmSync(GENERATED, { recursive: true, force: true }));
const [CLAUDE_HOOK, CURSOR_HOOK, OPENCODE_PLUGIN, CODEX_HOOK, ANTIGRAVITY_HOOK] = [
  [".claude/hooks/bkit-gateguard.cjs", "claude.cjs"],
  [".cursor/hooks/bkit-gateguard.cjs", "cursor.cjs"],
  // `.mjs`: the plugin is an ES module, and the temp dir has no package.json saying so.
  [".opencode/plugin/bkit-gateguard.js", "opencode.mjs"],
  [".codex/hooks/bkit-gateguard.cjs", "codex.cjs"],
  [".agents/plugins/bkit/hooks/bkit-gateguard.cjs", "antigravity.cjs"],
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

type Host = "claude" | "cursor" | "opencode" | "codex" | "antigravity";
const HOSTS: Host[] = ["claude", "cursor", "opencode", "codex", "antigravity"];

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

  let blocked = false;
  let thrownMessage = "";
  let advisory = "";
  try {
    // Drive the plugin as OpenCode 2.0 does: setup(ctx) registers the before + after
    // hooks, then the runner calls before (block/allow) and, on success, after with a
    // fresh `result`. The advisory is what the after hook appends to `result.content`,
    // which the host reads back into the model's tool result.
    const { default: plugin } = await import(pathToFileURL(OPENCODE_PLUGIN).href);
    const hooks: Record<string, (event: object) => Promise<void>> = {};
    await plugin.setup({
      tool: {
        hook: async (name: string, cb: (event: object) => Promise<void>) => {
          hooks[name] = cb;
        },
      },
    });
    const event = {
      tool: c.kind === "create" ? "write" : "edit",
      sessionID: c.session,
      id: "parity-call",
      input: { path: c.file },
    };
    try {
      if (hooks["execute.before"]) await hooks["execute.before"](event);
    } catch (e) {
      blocked = true;
      thrownMessage = (e as Error).message;
    }
    if (!blocked) {
      const result: { content: { type: string; text: string }[] } = { content: [] };
      if (hooks["execute.after"]) {
        await hooks["execute.after"]({ ...event, status: "completed", result });
      }
      advisory = result.content.map((part) => part.text).join("");
    }
  } finally {
    for (const [k, v] of Object.entries(saved)) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  }
  return { advisory: blocked ? thrownMessage : advisory, blocked };
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

/**
 * Antigravity's live-verified envelope: `write_to_file` (create/overwrite) or
 * `replace_file_content` (in-place edit) with the target in `toolCall.args.TargetFile`,
 * resolved against `workspacePaths[0]`. Its reply is `{ decision, reason }`; only a deny's
 * reason reaches the model, so an advisory arrives as a one-time deny.
 */
function runAntigravity(c: Call): Outcome {
  const res = spawnSync("node", [ANTIGRAVITY_HOOK], {
    input: JSON.stringify({
      conversationId: c.session,
      toolCall: {
        name: c.kind === "create" ? "write_to_file" : "replace_file_content",
        args: { TargetFile: c.file, toolAction: "Editing file", toolSummary: "Edit" },
      },
      workspacePaths: [process.cwd()],
    }),
    encoding: "utf-8",
    env: { ...process.env, BKIT_GATEGUARD: undefined, ...c.env },
  });
  const out = res.stdout.trim() ? JSON.parse(res.stdout.trim()) : {};
  return {
    advisory: out.decision === "deny" ? String(out.reason ?? "") : "",
    blocked: out.decision === "deny",
  };
}

async function run(host: Host, c: Call): Promise<Outcome> {
  if (host === "claude") return runClaude(c);
  if (host === "cursor") return runCursor(c);
  if (host === "codex") return runCodex(c);
  if (host === "antigravity") return runAntigravity(c);
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
        // Antigravity delivers every advisory as a one-time deny (documented deviation below).
        expect(r.blocked).toBe(host === "antigravity");
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
        "ruff.toml",
        ".ruff.toml",
        ".flake8",
        "mypy.ini",
        ".mypy.ini",
        "pylintrc",
        ".pylintrc",
        "pytest.ini",
        "jest.config.json",
        ".golangci.yml",
        ".golangci.toml",
        "clippy.toml",
        "rustfmt.toml",
        ".clippy.toml",
        ".rustfmt.toml",
      ])("a %s gate config gets the weaken-the-gate advisory", async (file) => {
        const r = await run(host, { file, session: newSession() });
        expect(r.advisory).toContain("quality-gate config");
      });

      // JS / TS ecosystem configs (and the doc linter), matched on the basename wherever the
      // file sits.
      it.each([
        "tsconfig.build.json",
        "path/to/tsconfig.build.json",
        "vitest.config.ts",
        "vite.config.mts",
        "eslint.config.js",
        ".eslintrc",
        ".eslintrc.json",
        ".prettierrc",
        ".prettierrc.json",
        "prettier.config.js",
        ".prettierignore",
        "biome.json",
        "biome.jsonc",
        ".vale.ini",
        "slop-scan.config.json",
        ".lintstagedrc.json",
        "lint-staged.config.js",
      ])("a %s gate config gets the weaken-the-gate advisory", async (file) => {
        const r = await run(host, { file, session: newSession() });
        expect(r.advisory).toContain("quality-gate config");
      });

      it.each(["README.md", "src/index.ts"])(
        "ordinary file %s is not treated as a gate config",
        async (file) => {
          const r = await run(host, { file, session: newSession() });
          expect(r.advisory).not.toContain("quality-gate config");
        },
      );

      it("BKIT_ALLOW_CONFIG_EDIT=1 downgrades a gate config to the normal checklist", async () => {
        const r = await run(host, {
          file: "tsconfig.json",
          session: newSession(),
          env: { BKIT_ALLOW_CONFIG_EDIT: "1" },
        });
        expect(r.advisory).not.toContain("quality-gate config");
        expect(r.advisory).toContain("[bkit GateGuard]");
      });

      it.each(["package.json", "pyproject.toml", "setup.cfg", "tox.ini"])(
        "mixed-purpose %s is not treated as a gate config",
        async (file) => {
          const r = await run(host, { file, session: newSession() });
          expect(r.advisory).not.toContain("quality-gate config");
        },
      );
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

    it(`${host}: a relative .bkit/templates/.vale.ini resolves against the cwd's package (this is bkit's repo)`, async () => {
      const r = await run(host, { file: ".bkit/templates/.vale.ini", session: newSession() });
      expect(r.advisory).toContain("quality-gate config");
    });

    it(`${host}: a folder that merely ends in .bkit/templates is not a template copy`, async () => {
      const file = path.join(consumer, "x.bkit/templates/.vale.ini");
      const r = await run(host, { file, session: newSession() });
      expect(r.advisory).toContain("quality-gate config");
    });
  }
});

describe("gateguard behaviour parity — docs density advisory", () => {
  type DocsCase = { file: string; why: string };
  const firing: DocsCase[] = [
    { file: "docs/architecture.md", why: "a docs markdown file" },
    { file: ".bkit/shared/docs/architecture.md", why: "nested docs tree" },
  ];
  const silent: DocsCase[] = [
    { file: "Documents/architecture.md", why: "segment match, not substring" },
    { file: "docs/plans/202608/x/design.md", why: "plans follow the plan template" },
    { file: "docs/knowledge.jsonl", why: "gated on .md" },
  ];
  for (const host of HOSTS) {
    for (const c of firing) {
      it(`${host}: fires on ${c.file} (${c.why})`, async () => {
        const r = await run(host, { file: c.file, session: newSession() });
        expect(r.advisory).toContain("docs/*.md authoring");
      });
    }
    for (const c of silent) {
      it(`${host}: does not fire on ${c.file} (${c.why})`, async () => {
        const r = await run(host, { file: c.file, session: newSession() });
        expect(r.advisory).not.toContain("docs/*.md authoring");
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

// ---------------------------------------------------------------------------
// State folders — per user, and fail-open when they cannot be written
// ---------------------------------------------------------------------------

const UID = process.getuid!();

/** A private temp root (the hook's TMPDIR) whose folders `unwritable` exist read-only. */
function stateRoot(...unwritable: string[]): string {
  const root = fs.mkdtempSync(path.join(GENERATED, "tmp-"));
  for (const name of unwritable) fs.mkdirSync(path.join(root, name), { mode: 0o555 });
  return root;
}

describe("gateguard behaviour parity — state folders", () => {
  for (const host of HOSTS) {
    it(`${host}: dedup state lives in a per-user folder`, async () => {
      const tmp = stateRoot();
      await run(host, { file: "package.json", session: newSession(), env: { TMPDIR: tmp } });
      expect(fs.readdirSync(tmp)).toContain(`bkit-gateguard-${UID}`);
    });

    it(`${host}: another user's shared folder does not cost the session its dedup`, async () => {
      // On a shared Linux /tmp the first user to create the plain-named folder owns it.
      const env = { TMPDIR: stateRoot("bkit-gateguard", "bkit-antigravity-retry") };
      const session = newSession();
      expect((await run(host, { file: "package.json", session, env })).advisory).toContain(
        "[bkit GateGuard]",
      );
      expect((await run(host, { file: "package.json", session, env })).advisory).toBe("");
    });

    it(`${host}: an unwritable state folder still delivers the checklist`, async () => {
      const env = { TMPDIR: stateRoot("bkit-gateguard", `bkit-gateguard-${UID}`) };
      const r = await run(host, { file: "package.json", session: newSession(), env });
      expect(r.advisory).toContain("[bkit GateGuard]");
    });

    it(`${host}: deny mode with an unwritable state folder never blocks the retry`, async () => {
      const env = {
        TMPDIR: stateRoot("bkit-gateguard", `bkit-gateguard-${UID}`),
        BKIT_GATEGUARD: "deny",
      };
      const session = newSession();
      await run(host, { file: "package.json", session, env });
      expect((await run(host, { file: "package.json", session, env })).blocked).toBe(false);
    });
  }

  it("opencode: an unwritable state folder warns once per session, not on every edit", async () => {
    // opencode is one long-lived process, so it remembers the warning in-process.
    const env = { TMPDIR: stateRoot("bkit-gateguard", `bkit-gateguard-${UID}`) };
    const session = newSession();
    const first = await run("opencode", { file: "package.json", session, env });
    const second = await run("opencode", { file: "package.json", session, env });
    expect([first.advisory.includes("[bkit GateGuard]"), second.advisory]).toEqual([true, ""]);
  });
});

describe("antigravity deny-once delivery — retry folder", () => {
  it("another user's shared retry folder does not cost the checklist", () => {
    const env = { TMPDIR: stateRoot("bkit-antigravity-retry") };
    const session = newSession();
    const first = runAntigravity({ file: "package.json", session, env });
    const retry = runAntigravity({ file: "package.json", session, env });
    expect(first.advisory).toContain("[bkit GateGuard]");
    expect([first.blocked, retry.blocked]).toEqual([true, false]);
  });

  it("an unwritable retry folder allows the call instead of denying it with no way through", () => {
    const env = {
      TMPDIR: stateRoot(
        "bkit-gateguard",
        `bkit-gateguard-${UID}`,
        "bkit-antigravity-retry",
        `bkit-antigravity-retry-${UID}`,
      ),
    };
    const session = newSession();
    const runs = [1, 2].map(() => runAntigravity({ file: "package.json", session, env }));
    expect(runs.map((r) => r.blocked)).toEqual([false, false]);
  });

  it("adviseOnce returns allow, never throws, when the retry folder cannot be written", () => {
    // Loaded alone, without the hook driver's fail-open catch around it.
    const part = path.join(GENERATED, "antigravity-hook-part.cjs");
    fs.writeFileSync(
      part,
      'const fs = require("node:fs");\nconst os = require("node:os");\n' +
        'const path = require("node:path");\nconst crypto = require("node:crypto");\n' +
        fs.readFileSync(path.resolve(".bkit/core/hooks/antigravity-hook.js"), "utf-8") +
        "\nmodule.exports = { adviseOnce };\n",
    );
    const { adviseOnce } = createRequire(import.meta.url)(part) as {
      adviseOnce: (hook: string, session: string, signature: string, advisory: string) => unknown;
    };
    vi.stubEnv("TMPDIR", stateRoot("bkit-antigravity-retry", `bkit-antigravity-retry-${UID}`));
    try {
      expect(adviseOnce("gateguard", newSession(), "sig", "advice")).toEqual({ decision: "allow" });
    } finally {
      vi.unstubAllEnvs();
    }
  });
});

describe("gateguard structural parity", () => {
  const FILES: Record<Host, string> = {
    claude: CLAUDE_HOOK,
    cursor: CURSOR_HOOK,
    opencode: OPENCODE_PLUGIN,
    codex: CODEX_HOOK,
    antigravity: ANTIGRAVITY_HOOK,
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

  it("codex advises on the *** Move to: target of a renaming patch", () => {
    const res = spawnSync("node", [CODEX_HOOK], {
      input: JSON.stringify({
        tool_name: "apply_patch",
        tool_input: {
          command:
            "*** Begin Patch\n*** Update File: src/old-name.ts\n*** Move to: src/new-name.ts\n@@\n-a\n+b\n*** End Patch",
        },
        session_id: `gg-codex-move-${process.pid}`,
        cwd: process.cwd(),
      }),
      encoding: "utf-8",
      env: { ...process.env, BKIT_GATEGUARD: "deny" },
    });
    const reason = String(JSON.parse(res.stdout).hookSpecificOutput?.permissionDecisionReason);
    expect(reason).toContain("old-name.ts");
    // Old name is warned; the retry must still catch the move target.
    const retry = spawnSync("node", [CODEX_HOOK], {
      input: JSON.stringify({
        tool_name: "apply_patch",
        tool_input: {
          command:
            "*** Begin Patch\n*** Update File: src/old-name.ts\n*** Move to: src/new-name.ts\n@@\n-a\n+b\n*** End Patch",
        },
        session_id: `gg-codex-move-${process.pid}`,
        cwd: process.cwd(),
      }),
      encoding: "utf-8",
      env: { ...process.env, BKIT_GATEGUARD: "deny" },
    });
    expect(String(JSON.parse(retry.stdout).hookSpecificOutput?.permissionDecisionReason)).toContain(
      "new-name.ts",
    );
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
      "First edit to",
      "Evolve existing code first",
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

  it("Antigravity delivers the checklist by denying the first edit once; the retry passes", () => {
    const session = newSession();
    const first = runAntigravity({ file: "package.json", session });
    expect(first.blocked).toBe(true);
    expect(first.advisory).toContain("[bkit GateGuard]");
    expect(first.advisory).toContain("Repeat the same call to proceed.");
    expect(runAntigravity({ file: "package.json", session }).blocked).toBe(false);
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
