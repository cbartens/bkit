// audits/hooks/gateguard-opencode.test.ts — behavioural tests for the opencode GateGuard
// plugin (.bkit/core/.opencode/plugin/bkit-gateguard.js).
//
// Tests the plugin function directly by importing it and simulating the opencode
// plugin API (client.session.get + hook inputs). No stdin/stdout — the plugin is
// async ES module, not a stdin-based CLI hook.
//
// Required test cases (plan-v4-3 Task 3.1 Done when):
//   1. Advisory injects context on first edit
//   2. Deny blocks first touch then allows retry
//   3. Off mode no-op (no injection, no block, no dedup write)
//   4. Subagent payload exempt — fixture mirrors spike-recorded real payload shape
//   5. Gate-config path → config advisory
//   6. Malformed/missing args → fail-open (no throw)

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { pathToFileURL } from "node:url";
import { afterAll, afterEach, beforeEach, describe, expect, it } from "vitest";

import { readTemplate } from "../../render/parts";

// ---------------------------------------------------------------------------
// Load plugin (ES module import)
// ---------------------------------------------------------------------------

// The plugin as install generates it (shared parts spliced in). `.mjs`: it is an ES
// module, and the temp dir has no package.json saying so.
const GENERATED = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-gg-opencode-"));
afterAll(() => fs.rmSync(GENERATED, { recursive: true, force: true }));
const PLUGIN_PATH = path.join(GENERATED, "gateguard.mjs");
fs.writeFileSync(
  PLUGIN_PATH,
  readTemplate(path.resolve(".bkit/core/.opencode/plugin/bkit-gateguard.js")),
);

// Dynamic import used to allow env var injection before the module runs.
// The plugin is a pure object — it reads env vars at call time, and exports the dual
// shape OpenCode 1.x (`server()`) and 2.0 (`setup(ctx)`) each drive.
async function loadPlugin() {
  const { default: plugin } = await import(pathToFileURL(PLUGIN_PATH).href);
  return plugin;
}

// ---------------------------------------------------------------------------
// Mock client factory
// ---------------------------------------------------------------------------

function makeClient(parentID: string) {
  return {
    client: {
      session: {
        get: async (_opts: { sessionID: string }) => ({ parentID, agentID: "test-agent" }),
      },
    },
  };
}

/** Orchestrator client: no parent session */
function orchestratorClient() {
  return makeClient("");
}

/** Subagent client: has a parent session ID (spike-recorded real shape) */
function subagentClient() {
  // Spike-recorded: subagent session ses_151a398c0ffeeQ2FvAEXuBvm8W has
  // parentID = "ses_151a3b415ffeo5QG5V8WN8rceC" (the orchestrator).
  return makeClient("ses_151a3b415ffeo5QG5V8WN8rceC");
}

// ---------------------------------------------------------------------------
// Hook input factory (mirrors spike-recorded real payload shape)
// ---------------------------------------------------------------------------

let sessionCounter = 0;

function newSession(): string {
  sessionCounter += 1;
  return `gg-oc-test-${process.pid}-${sessionCounter}`;
}

/**
 * Real subagent `bash` call payload shape (opencode v1.16.x):
 *   input_full: { tool: "bash", sessionID: "ses_151a398c...", callID: "toolu_01Hf..." }
 *   output_args: { command: "echo ...", description: "..." }
 */
function spikeSubagentPayload(sessionID: string) {
  return {
    hookInput: {
      tool: "bash",
      sessionID,
      callID: "toolu_01HfGgMJfUGA3gRNFr6pUrXB",
    },
    output: {
      args: {
        command: 'echo "Hello from spike-claude-writer subagent!" > /tmp/spike-test.txt',
        description: "Write spike output",
      },
    },
  };
}

function writeHookInput(filePath: string, sessionID: string) {
  return {
    hookInput: { tool: "write", sessionID, callID: "toolu_test_write" },
    output: { args: { path: filePath, content: "test content" } },
  };
}

function editHookInput(filePath: string, sessionID: string) {
  return {
    hookInput: { tool: "edit", sessionID, callID: "toolu_test_edit" },
    output: { args: { path: filePath } },
  };
}

// ---------------------------------------------------------------------------
// Invoke hook helper
// ---------------------------------------------------------------------------

interface HookResult {
  threw: boolean;
  error: Error | null;
  /** The checklist the host surfaces to the model in the tool result, or "". */
  advice: string;
}

/** Run `fn` with `env` applied; restore the environment afterwards. */
async function withEnv<T>(
  env: Record<string, string | undefined>,
  fn: () => Promise<T>,
): Promise<T> {
  const savedEnv: Record<string, string | undefined> = {};
  for (const [k, v] of Object.entries(env)) {
    savedEnv[k] = process.env[k];
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
  try {
    return await fn();
  } finally {
    for (const [k, v] of Object.entries(savedEnv)) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  }
}

function toError(err: unknown): Error {
  return err instanceof Error ? err : new Error(String(err));
}

type HookFn = (input: unknown, output: unknown) => Promise<void>;

/**
 * The plugin as OpenCode 2.0 drives it. Registers whatever `setup()` declares, then
 * runs the pair the host runs around one tool call: `execute.before` (block or allow)
 * then, on success, `execute.after` with a fresh `result`. The advisory is the text
 * the after hook appends to `event.result.content` — the model's tool result.
 */
async function invokeHook(
  plugin: { setup: (ctx: object) => Promise<void> },
  _client: object,
  hookInput: { tool: string; sessionID: string; callID?: string },
  output: { args?: unknown },
  env: Record<string, string | undefined> = {},
): Promise<HookResult> {
  return withEnv(env, async () => {
    const hooks: Record<string, HookFn> = {};
    const ctx = {
      tool: {
        hook: async (name: string, cb: HookFn) => {
          hooks[name] = cb;
        },
      },
    };
    await plugin.setup(ctx);
    const event = {
      tool: hookInput.tool,
      sessionID: hookInput.sessionID,
      id: hookInput.callID,
      input: (output?.args as object | undefined) ?? {},
    };
    try {
      if (hooks["execute.before"]) await hooks["execute.before"](event, {});
    } catch (err) {
      return { threw: true, error: toError(err), advice: "" };
    }
    const result: { content: { type: string; text: string }[] } = { content: [] };
    if (hooks["execute.after"]) {
      await hooks["execute.after"]({ ...event, status: "completed", result }, {});
    }
    return {
      threw: false,
      error: null,
      advice: result.content.map((part) => part.text).join(""),
    };
  });
}

/**
 * The plugin as OpenCode 1.x drives it: `server()` → `tool.execute.before` (args on
 * `output.args`) then `tool.execute.after` (args on `input.args`, result text on
 * `output.output`).
 */
async function invokeHookV1(
  plugin: { server: () => Promise<Record<string, unknown>> },
  _client: object,
  hookInput: object,
  output: object,
  env: Record<string, string | undefined> = {},
): Promise<HookResult> {
  return withEnv(env, async () => {
    const hooks = (await plugin.server()) as Record<string, HookFn>;
    try {
      const before = hooks["tool.execute.before"];
      if (typeof before === "function") await before(hookInput, output);
    } catch (err) {
      return { threw: true, error: toError(err), advice: "" };
    }
    const afterOutput = { title: "", output: "", metadata: {} };
    const afterInput = {
      ...(hookInput as Record<string, unknown>),
      args: (output as { args?: unknown }).args,
    };
    const after = hooks["tool.execute.after"];
    if (typeof after === "function") await after(afterInput, afterOutput);
    return { threw: false, error: null, advice: afterOutput.output };
  });
}

// ---------------------------------------------------------------------------
// Dedup state file helpers
// ---------------------------------------------------------------------------

function stateDir() {
  return path.join(os.tmpdir(), `bkit-gateguard-${process.getuid!()}`);
}

function stateFile(sessionId: string) {
  const safe = sessionId.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 128) || "no-session";
  return path.join(stateDir(), safe + ".json");
}

function isWarned(sessionId: string, filePath: string): boolean {
  const f = stateFile(sessionId);
  if (!fs.existsSync(f)) return false;
  const state = JSON.parse(fs.readFileSync(f, "utf-8")) as {
    files: Record<string, boolean>;
  };
  return Boolean(state.files[filePath]);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

interface OpencodeGateGuardPlugin {
  id: string;
  setup: (ctx: object) => Promise<void>;
  server: () => Promise<Record<string, unknown>>;
}

let plugin: OpencodeGateGuardPlugin;

beforeEach(async () => {
  plugin = await loadPlugin();
});

afterEach(() => {
  // Clean up: delete any state files we created with our test session IDs
  // (they are namespaced by pid+counter so safe to delete them specifically)
  const dir = stateDir();
  if (!fs.existsSync(dir)) return;
  for (const name of fs.readdirSync(dir)) {
    if (name.startsWith(`gg-oc-test-${process.pid}-`)) {
      // force: ignore ENOENT if the file is already gone — no try/catch needed
      fs.rmSync(path.join(dir, name), { force: true });
    }
  }
});

// ---------------------------------------------------------------------------
// 1. Advisory injects context on first edit
// ---------------------------------------------------------------------------

describe("gateguard opencode plugin — advisory mode (default)", () => {
  it("emits reuse checklist on first write to a NEW (nonexistent) file", async () => {
    const session = newSession();
    const { hookInput, output } = writeHookInput("src/foo-does-not-exist.ts", session);
    const result = await invokeHook(plugin, orchestratorClient(), hookInput, output, {
      BKIT_GATEGUARD: undefined,
    });
    expect(result.threw).toBe(false);
    expect(result.advice).toContain("[bkit GateGuard]");
    expect(result.advice).toContain("foo-does-not-exist.ts");
    expect(result.advice).toContain("Evolve existing code first");
  });

  it("keeps the reuse checklist when the write CREATES the file (pre-write snapshot)", async () => {
    // Reproduces the live defect the after-hook channel introduced: by the time
    // execute.after runs, the write has created the file, so an existsSync new-file
    // test would wrongly report "existing" and emit the investigation checklist. The
    // pre-write snapshot captured in execute.before must survive.
    const session = newSession();
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "gg-oc-newfile-"));
    const target = path.join(dir, "created.ts");
    try {
      const hooks: Record<string, (input: unknown, output: unknown) => Promise<void>> = {};
      const ctx = {
        tool: {
          hook: async (name: string, cb: (i: unknown, o: unknown) => Promise<void>) => {
            hooks[name] = cb;
          },
        },
      };
      await plugin.setup(ctx);
      const event = {
        tool: "write",
        sessionID: session,
        id: "toolu_created_file",
        input: { path: target },
      };
      await withEnv({ BKIT_GATEGUARD: undefined }, async () => {
        // before: the file does not exist yet
        await hooks["execute.before"]!(event, {});
        // the host runs the write, which creates the file
        fs.writeFileSync(target, "export const x = 1;\n");
        const result: { content: { type: string; text: string }[] } = { content: [] };
        await hooks["execute.after"]!({ ...event, status: "completed", result }, {});
        const advice = result.content.map((part) => part.text).join("");
        expect(advice).toContain("[bkit GateGuard]");
        expect(advice).toContain("Evolve existing code first");
      });
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it("(V1) keeps the reuse checklist when the write CREATES the file (pre-write snapshot)", async () => {
    const session = newSession();
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "gg-oc-newfile-v1-"));
    const target = path.join(dir, "created.ts");
    try {
      const hooks = (await plugin.server()) as Record<
        string,
        (input: unknown, output: unknown) => Promise<void>
      >;
      const hookInput = { tool: "write", sessionID: session, callID: "toolu_created_file_v1" };
      await withEnv({ BKIT_GATEGUARD: undefined }, async () => {
        await hooks["tool.execute.before"]!(hookInput, { args: { path: target } });
        fs.writeFileSync(target, "export const x = 1;\n");
        const afterOutput = { title: "", output: "", metadata: {} };
        await hooks["tool.execute.after"]!({ ...hookInput, args: { path: target } }, afterOutput);
        expect(afterOutput.output).toContain("[bkit GateGuard]");
        expect(afterOutput.output).toContain("Evolve existing code first");
      });
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it("emits investigation checklist on a write to an EXISTING file", async () => {
    const session = newSession();
    const { hookInput, output } = writeHookInput("package.json", session);
    const result = await invokeHook(plugin, orchestratorClient(), hookInput, output, {
      BKIT_GATEGUARD: undefined,
    });
    expect(result.threw).toBe(false);
    expect(result.advice).toContain("First edit to");
    expect(result.advice).not.toContain("Evolve existing code first");
  });

  it("emits investigation checklist on first edit to a file", async () => {
    const session = newSession();
    const { hookInput, output } = editHookInput("src/bar.ts", session);
    const result = await invokeHook(plugin, orchestratorClient(), hookInput, output, {
      BKIT_GATEGUARD: undefined,
    });
    expect(result.threw).toBe(false);
    expect(result.advice).toContain("[bkit GateGuard]");
    expect(result.advice).toContain("bar.ts");
  });

  it("dedups: second write to the same file in the same session emits nothing", async () => {
    const session = newSession();
    const { hookInput, output } = writeHookInput("src/dedup.ts", session);

    const first = await invokeHook(plugin, orchestratorClient(), hookInput, output, {
      BKIT_GATEGUARD: undefined,
    });
    expect(first.advice).toContain("[bkit GateGuard]");

    const second = await invokeHook(plugin, orchestratorClient(), hookInput, output, {
      BKIT_GATEGUARD: undefined,
    });
    expect(second.threw).toBe(false);
    expect(second.advice).toBe("");
  });

  it("warns again for a different file in the same session", async () => {
    const session = newSession();
    const first = writeHookInput("src/a.ts", session);
    const second = writeHookInput("src/b.ts", session);

    await invokeHook(plugin, orchestratorClient(), first.hookInput, first.output, {
      BKIT_GATEGUARD: undefined,
    });
    const r = await invokeHook(plugin, orchestratorClient(), second.hookInput, second.output, {
      BKIT_GATEGUARD: undefined,
    });
    expect(r.advice).toContain("b.ts");
  });
});

// ---------------------------------------------------------------------------
// 2. Deny blocks first touch then allows retry
// ---------------------------------------------------------------------------

describe("gateguard opencode plugin — deny mode", () => {
  it("throws with advisory text on first write (blocks edit)", async () => {
    const session = newSession();
    const { hookInput, output } = writeHookInput("src/deny.ts", session);
    const result = await invokeHook(plugin, orchestratorClient(), hookInput, output, {
      BKIT_GATEGUARD: "deny",
    });
    expect(result.threw).toBe(true);
    expect(result.error?.message).toContain("[bkit GateGuard]");
    // Dedup should be marked
    expect(isWarned(session, "src/deny.ts")).toBe(true);
  });

  it("allows retry (second call is a no-op after dedup marked)", async () => {
    const session = newSession();
    const { hookInput, output } = writeHookInput("src/retry.ts", session);
    const env = { BKIT_GATEGUARD: "deny" };

    // First: blocks
    const first = await invokeHook(plugin, orchestratorClient(), hookInput, output, env);
    expect(first.threw).toBe(true);

    // Second: dedup'd, no throw
    const retry = await invokeHook(plugin, orchestratorClient(), hookInput, output, env);
    expect(retry.threw).toBe(false);
    expect(retry.advice).toBe("");
  });
});

// ---------------------------------------------------------------------------
// 3. Off mode no-op
// ---------------------------------------------------------------------------

describe("gateguard opencode plugin — off mode", () => {
  it("BKIT_GATEGUARD=off: no advice, no throw, no dedup state written", async () => {
    const session = newSession();
    const { hookInput, output } = writeHookInput("src/off.ts", session);
    const result = await invokeHook(plugin, orchestratorClient(), hookInput, output, {
      BKIT_GATEGUARD: "off",
    });
    expect(result.threw).toBe(false);
    expect(result.advice).toBe("");
    // No dedup state written
    expect(isWarned(session, "src/off.ts")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 4. Subagent payload exempt — spike-recorded real payload shape
// ---------------------------------------------------------------------------

describe("gateguard opencode plugin — subagents are NOT exempt", () => {
  it("spike-recorded subagent payload (bash tool) stays a no-op — because bash is not an edit tool", async () => {
    // This fixture mirrors a real recorded payload:
    //   input_full: { tool: "bash", sessionID: "ses_151a398c0ffeeQ2FvAEXuBvm8W", callID: "toolu_01HfGgMJfUGA3gRNFr6pUrXB" }
    //   output_args: { command: "echo ...", description: "..." }
    // The subagent's session has parentID = "ses_151a3b415ffeo5QG5V8WN8rceC" (orchestrator).
    const spikeSession = "ses_151a398c0ffeeQ2FvAEXuBvm8W";
    const { hookInput, output } = spikeSubagentPayload(spikeSession);

    const result = await invokeHook(plugin, subagentClient(), hookInput, output, {
      BKIT_GATEGUARD: undefined,
    });
    expect(result.threw).toBe(false);
    expect(result.advice).toBe("");
  });

  it("a subagent session editing a file DOES get the advisory (exemption removed)", async () => {
    // A subagent edit is an edit. Dedup is per (session, file) and a subagent runs in its
    // own session, so it gets the checklist once even for a file the orchestrator already
    // touched.
    const session = newSession();
    const { hookInput, output } = writeHookInput("src/subagent-write.ts", session);
    const result = await invokeHook(plugin, subagentClient(), hookInput, output, {
      BKIT_GATEGUARD: undefined,
    });
    expect(result.threw).toBe(false);
    expect(result.advice).toContain("[bkit GateGuard]");
  });

  it("orchestrator session gets the advisory too — same treatment either way", async () => {
    const session = newSession();
    const { hookInput, output } = writeHookInput("src/orch.ts", session);
    const result = await invokeHook(plugin, orchestratorClient(), hookInput, output, {
      BKIT_GATEGUARD: undefined,
    });
    expect(result.threw).toBe(false);
    expect(result.advice).toContain("[bkit GateGuard]");
  });
});

// ---------------------------------------------------------------------------
// 5. Gate-config path → config advisory
// ---------------------------------------------------------------------------

describe("gateguard opencode plugin — gate-config advisory", () => {
  it("tsconfig.json triggers config advisory", async () => {
    const session = newSession();
    const { hookInput, output } = writeHookInput("tsconfig.json", session);
    const result = await invokeHook(plugin, orchestratorClient(), hookInput, output, {
      BKIT_GATEGUARD: undefined,
    });
    expect(result.advice).toContain("quality-gate config");
  });

  it.each([
    "vitest.config.ts",
    "eslint.config.mjs",
    ".prettierrc",
    "slop-scan.config.json",
    ".vale.ini",
    ".lintstagedrc.json",
  ])("flags %s as gate config", async (file) => {
    const session = newSession();
    const { hookInput, output } = writeHookInput(file, session);
    const result = await invokeHook(plugin, orchestratorClient(), hookInput, output, {
      BKIT_GATEGUARD: undefined,
    });
    expect(result.advice).toContain("quality-gate config");
  });

  it("BKIT_ALLOW_CONFIG_EDIT=1 downgrades config edit to normal checklist", async () => {
    const session = newSession();
    const { hookInput, output } = writeHookInput("tsconfig.json", session);
    const result = await invokeHook(plugin, orchestratorClient(), hookInput, output, {
      BKIT_GATEGUARD: undefined,
      BKIT_ALLOW_CONFIG_EDIT: "1",
    });
    expect(result.advice).toContain("[bkit GateGuard]");
    expect(result.advice).not.toContain("quality-gate config");
  });

  it("source file is not treated as gate config", async () => {
    const session = newSession();
    const { hookInput, output } = writeHookInput("src/tsconfig-helper.ts", session);
    const result = await invokeHook(plugin, orchestratorClient(), hookInput, output, {
      BKIT_GATEGUARD: undefined,
    });
    expect(result.advice).not.toContain("quality-gate config");
  });
});

// ---------------------------------------------------------------------------
// 6. Malformed/missing args → fail-open (no throw)
// ---------------------------------------------------------------------------

describe("gateguard opencode plugin — fail-open cases", () => {
  it("missing file path (no args.path) is ignored — no throw, no advice", async () => {
    const session = newSession();
    const result = await invokeHook(
      plugin,
      orchestratorClient(),
      { tool: "write", sessionID: session, callID: "toolu_test" },
      { args: {} }, // no path key
      { BKIT_GATEGUARD: undefined },
    );
    expect(result.threw).toBe(false);
    expect(result.advice).toBe("");
  });

  it("null args object is ignored — no throw", async () => {
    const session = newSession();
    const result = await invokeHook(
      plugin,
      orchestratorClient(),
      { tool: "write", sessionID: session, callID: "toolu_test" },
      { args: null },
      { BKIT_GATEGUARD: undefined },
    );
    expect(result.threw).toBe(false);
    expect(result.advice).toBe("");
  });

  it("session.get() rejection → fail-open (treats as orchestrator, emits advisory)", async () => {
    // When session lookup fails, the plugin must fail-open (not crash).
    // It treats the session as orchestrator and applies the advisory.
    const failingClient = {
      client: {
        session: {
          get: async (_opts: { sessionID: string }) => {
            throw new Error("session lookup failed");
          },
        },
      },
    };
    const session = newSession();
    const { hookInput, output } = writeHookInput("src/failopen.ts", session);
    const result = await invokeHook(plugin, failingClient, hookInput, output, {
      BKIT_GATEGUARD: undefined,
    });
    // Fail-open: no unexpected throw (advisory emitted is acceptable)
    // The advisory is still emitted (fail-open = treat as orchestrator, not off)
    expect(result.threw).toBe(false);
    // In advisory mode, the tool result should contain the checklist (fail-open = apply advisory)
    expect(result.advice).toContain("[bkit GateGuard]");
  });

  it("non-edit tool (bash) is ignored", async () => {
    const session = newSession();
    const result = await invokeHook(
      plugin,
      orchestratorClient(),
      { tool: "bash", sessionID: session, callID: "toolu_test" },
      { args: { command: "rm -rf build" } },
      { BKIT_GATEGUARD: undefined },
    );
    // bash is not in EDIT_TOOLS → no advisory
    expect(result.threw).toBe(false);
    // No advisory since bash is not an edit tool
    // (note: subagent check happens first, but orchestrator session so continues to tool check)
    expect(result.advice).toBe("");
  });
});

describe("gateguard opencode plugin — multi-file patch tool", () => {
  const PATCH = [
    "*** Begin Patch",
    "*** Add File: src/patch-added.ts",
    "+export const a = 1;",
    "*** Update File: src/patch-updated.ts",
    "*** Move to: src/patch-moved.ts",
    "@@",
    "-old",
    "+new",
    "*** Delete File: src/patch-deleted.ts",
    "*** End Patch",
  ].join("\n");

  function patchInput(tool: string, session: string, patchText: unknown) {
    return {
      hookInput: { tool, sessionID: session, callID: "toolu_test_patch" },
      output: { args: { patchText } },
    };
  }

  const patchDrivers = { v2: invokeHook, v1: invokeHookV1 };

  it.each(
    ["patch", "apply_patch"].flatMap((tool) => [[tool, "v2"] as const, [tool, "v1"] as const]),
  )("%s (%s driver): checks every Add / Update / Move-to / Delete target", async (tool, drive) => {
    const session = newSession();
    const { hookInput, output } = patchInput(tool, session, PATCH);
    const result = await patchDrivers[drive](plugin, orchestratorClient(), hookInput, output);
    expect(result.threw).toBe(false);
    for (const file of [
      "src/patch-added.ts",
      "src/patch-updated.ts",
      "src/patch-moved.ts",
      "src/patch-deleted.ts",
    ]) {
      expect(isWarned(session, file)).toBe(true);
      expect(result.advice).toContain(path.basename(file));
    }
  });

  it("deny mode blocks when any patch target is a first touch, and records all of them", async () => {
    const session = newSession();
    const { hookInput, output } = patchInput("patch", session, PATCH);
    const env = { BKIT_GATEGUARD: "deny" };
    const first = await invokeHook(plugin, orchestratorClient(), hookInput, output, env);
    expect(first.threw).toBe(true);
    expect(first.error?.message).toContain("[bkit GateGuard]");
    expect(isWarned(session, "src/patch-added.ts")).toBe(true);
    expect(isWarned(session, "src/patch-deleted.ts")).toBe(true);
    const retry = await invokeHook(plugin, orchestratorClient(), hookInput, output, env);
    expect(retry.threw).toBe(false);
  });

  it("deny mode still blocks when only one of several patch targets is new to the session", async () => {
    const session = newSession();
    const env = { BKIT_GATEGUARD: "deny" };
    const warmed = patchInput(
      "patch",
      session,
      "*** Begin Patch\n*** Update File: src/p-warm.ts\n*** End Patch",
    );
    await invokeHook(plugin, orchestratorClient(), warmed.hookInput, warmed.output, env);
    const mixed = patchInput(
      "patch",
      session,
      "*** Begin Patch\n*** Update File: src/p-warm.ts\n*** Update File: src/p-cold.ts\n*** End Patch",
    );
    const result = await invokeHook(
      plugin,
      orchestratorClient(),
      mixed.hookInput,
      mixed.output,
      env,
    );
    expect(result.threw).toBe(true);
    expect(result.error?.message).toContain("p-cold.ts");
  });

  it.each([undefined, null, "", "not a patch", 42, { nested: true }])(
    "malformed patchText %j does not throw and yields no advice",
    async (patchText) => {
      const session = newSession();
      const { hookInput, output } = patchInput("patch", session, patchText);
      for (const env of [{}, { BKIT_GATEGUARD: "deny" }]) {
        const v2 = await invokeHook(plugin, orchestratorClient(), hookInput, output, env);
        const v1 = await invokeHookV1(plugin, orchestratorClient(), hookInput, output, env);
        expect(v2).toMatchObject({ threw: false, advice: "" });
        expect(v1).toMatchObject({ threw: false, advice: "" });
      }
    },
  );

  it("missing args entirely does not throw", async () => {
    const result = await invokeHook(
      plugin,
      orchestratorClient(),
      { tool: "patch", sessionID: newSession(), callID: "x" },
      {},
    );
    expect(result).toMatchObject({ threw: false, advice: "" });
  });
});

// ---------------------------------------------------------------------------
// Managed-block boundary — consumers own the driver (tool.execute.before /
// export default function plugin), bkit owns only the pure advisory engine.
// ---------------------------------------------------------------------------

describe("managed-block boundary", () => {
  it("the bkit:start/bkit:end block contains no export", () => {
    const src = fs.readFileSync(PLUGIN_PATH, "utf-8");
    const start = src.indexOf("// bkit:start");
    const end = src.indexOf("// bkit:end");
    expect(start).toBeGreaterThanOrEqual(0);
    expect(end).toBeGreaterThan(start);
    const block = src.slice(start, end);
    expect(block).not.toContain("export");
  });

  it("bkit:end precedes the driver + exported plugin declaration", () => {
    const src = fs.readFileSync(PLUGIN_PATH, "utf-8");
    const end = src.indexOf("// bkit:end");
    expect(end).toBeGreaterThanOrEqual(0);
    expect(src.indexOf("const bkitGateGuardPlugin")).toBeGreaterThan(end);
    expect(src.indexOf("export default bkitGateGuardPlugin")).toBeGreaterThan(end);
  });

  it("does NOT import a plugin package — @opencode/plugin only exists on 2.0", () => {
    // A load-time import of a 2.0-only package would crash the module on 1.x.
    const src = fs.readFileSync(PLUGIN_PATH, "utf-8");
    expect(src).not.toMatch(/from\s+["']@opencode(-ai)?\/plugin["']/);
  });
});

// ---------------------------------------------------------------------------
// Dual driver shape — the one export both OpenCode 1.x and 2.0 load.
// ---------------------------------------------------------------------------

describe("dual driver shape (OpenCode 1.x server() + 2.0 setup())", () => {
  it("default export carries id + setup + server", async () => {
    const p = await loadPlugin();
    expect(p.id).toBe("bkit-gateguard");
    expect(typeof p.setup).toBe("function");
    expect(typeof p.server).toBe("function");
  });

  it("2.0 setup() registers the before (deny) and after (advisory) hooks", async () => {
    const p = await loadPlugin();
    const calls: string[] = [];
    const ctx = {
      tool: {
        hook: async (name: string) => {
          calls.push(name);
        },
      },
    };
    await p.setup(ctx);
    expect(calls).toEqual(["execute.before", "execute.after"]);
  });

  it("1.x server() returns the tool.execute.before + tool.execute.after hooks", async () => {
    const p = await loadPlugin();
    const hooks = await p.server();
    expect(typeof hooks["tool.execute.before"]).toBe("function");
    expect(typeof hooks["tool.execute.after"]).toBe("function");
  });

  it("both drivers emit the same advisory for the same edit", async () => {
    const p = await loadPlugin();
    const v1Input = editHookInput("src/twin-driver.ts", newSession());
    const v1 = await invokeHookV1(p, orchestratorClient(), v1Input.hookInput, v1Input.output, {
      BKIT_GATEGUARD: undefined,
    });
    const v2Input = editHookInput("src/twin-driver.ts", newSession());
    const v2 = await invokeHook(p, orchestratorClient(), v2Input.hookInput, v2Input.output, {
      BKIT_GATEGUARD: undefined,
    });
    expect(v1.threw).toBe(false);
    expect(v2.threw).toBe(false);
    expect(v1.advice).toContain("[bkit GateGuard]");
    // Same checklist text either way (session id is not embedded in the advisory).
    expect(v1.advice).toBe(v2.advice);
  });

  it("V1 driver reads the real 1.x arg key `filePath`", async () => {
    // opencode 1.18.29+/1.19 send write/edit args as `{ filePath }`
    // (packages/opencode/src/tool/write.ts:22, edit.ts:48). A `path`-only read no-ops,
    // so GateGuard silently never fires on current 1.x.
    const p = await loadPlugin();
    const session = newSession();
    const hookInput = { tool: "edit", sessionID: session, callID: "toolu_test_v1_filepath" };
    const result = await invokeHookV1(
      p,
      orchestratorClient(),
      hookInput,
      { args: { filePath: "src/v1-filepath.ts" } },
      { BKIT_GATEGUARD: undefined },
    );
    expect(result.threw).toBe(false);
    expect(result.advice).toContain("[bkit GateGuard]");
    expect(isWarned(session, "src/v1-filepath.ts")).toBe(true);
  });

  it("deny mode blocks the first touch on BOTH drivers", async () => {
    const p = await loadPlugin();
    const v1Input = editHookInput("src/twin-deny-a.ts", newSession());
    const v1 = await invokeHookV1(p, orchestratorClient(), v1Input.hookInput, v1Input.output, {
      BKIT_GATEGUARD: "deny",
    });
    const v2Input = editHookInput("src/twin-deny-b.ts", newSession());
    const v2 = await invokeHook(p, orchestratorClient(), v2Input.hookInput, v2Input.output, {
      BKIT_GATEGUARD: "deny",
    });
    expect(v1.threw).toBe(true);
    expect(v1.error?.message).toContain("[bkit GateGuard]");
    expect(v2.threw).toBe(true);
    expect(v2.error?.message).toContain("[bkit GateGuard]");
  });
});

// ---------------------------------------------------------------------------
// docs/*.md density advisory — parity with the Claude twin
// ---------------------------------------------------------------------------

describe("gateguard plugin — docs/*.md density advisory (#422)", () => {
  it("appends the density advisory for a docs/ markdown file", async () => {
    const plugin = await loadPlugin();
    const session = newSession();
    const { hookInput, output } = editHookInput("docs/architecture.md", session);
    const result = await invokeHook(plugin, orchestratorClient(), hookInput, output, {
      BKIT_GATEGUARD: undefined,
    });
    expect(result.advice).toContain("docs/*.md authoring");
  });

  it("does NOT match a Documents/ ancestor (segment match, not substring)", async () => {
    const plugin = await loadPlugin();
    const session = newSession();
    const { hookInput, output } = editHookInput("Documents/architecture.md", session);
    const result = await invokeHook(plugin, orchestratorClient(), hookInput, output, {
      BKIT_GATEGUARD: undefined,
    });
    expect(result.advice).not.toContain("docs/*.md authoring");
  });

  it("excludes docs/plans/ (plan template governs those, not the docs register)", async () => {
    const plugin = await loadPlugin();
    const session = newSession();
    const { hookInput, output } = editHookInput(
      "docs/plans/202608/logs/422-foo/design.md",
      session,
    );
    const result = await invokeHook(plugin, orchestratorClient(), hookInput, output, {
      BKIT_GATEGUARD: undefined,
    });
    expect(result.advice).not.toContain("docs/*.md authoring");
  });

  it("does NOT match docs/knowledge.jsonl (gated on .md)", async () => {
    const plugin = await loadPlugin();
    const session = newSession();
    const { hookInput, output } = editHookInput("docs/knowledge.jsonl", session);
    const result = await invokeHook(plugin, orchestratorClient(), hookInput, output, {
      BKIT_GATEGUARD: undefined,
    });
    expect(result.advice).not.toContain("docs/*.md authoring");
  });

  it("matches a nested docs/ tree via segment match (.bkit/shared/docs/architecture.md)", async () => {
    const plugin = await loadPlugin();
    const session = newSession();
    const { hookInput, output } = editHookInput(".bkit/shared/docs/architecture.md", session);
    const result = await invokeHook(plugin, orchestratorClient(), hookInput, output, {
      BKIT_GATEGUARD: undefined,
    });
    expect(result.advice).toContain("docs/*.md authoring");
  });

  it("twin parity: isDocsPath + docAuthoringAdvisory are byte-identical between the two hooks", () => {
    const jsSrc = fs.readFileSync(PLUGIN_PATH, "utf-8");
    const cjsSrc = readTemplate(path.resolve(".bkit/core/.claude/hooks/bkit-gateguard.cjs"));

    const extract = (src: string, fnStart: string) => {
      const start = src.indexOf(fnStart);
      expect(start, `${fnStart} not found`).toBeGreaterThanOrEqual(0);
      const end = src.indexOf("\n}\n", start) + "\n}\n".length;
      return src.slice(start, end);
    };

    expect(extract(jsSrc, "function isDocsPath(")).toBe(extract(cjsSrc, "function isDocsPath("));
    expect(extract(jsSrc, "function docAuthoringAdvisory(")).toBe(
      extract(cjsSrc, "function docAuthoringAdvisory("),
    );
  });
});
