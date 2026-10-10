// bkit-gateguard-opencode.test.ts — behavioural tests for the opencode GateGuard
// plugin (.bkit/templates/.opencode/plugin/gateguard.js).
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
import { afterEach, beforeEach, describe, expect, it } from "vitest";

// ---------------------------------------------------------------------------
// Load plugin (ES module import)
// ---------------------------------------------------------------------------

// Dynamic import used to allow env var injection before the module runs.
// The plugin is a pure function of its input — it reads env vars at call time.
const PLUGIN_PATH = path.resolve(".bkit/templates/.opencode/plugin/gateguard.js");

// Resolve relative to cwd (repo root when run via pnpm test)
async function loadPlugin() {
  // Bust module cache by appending a dummy query so each test gets a fresh import
  // when needed. In practice we can reuse the same import within one test run.
  const { default: plugin } = await import(PLUGIN_PATH);
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
  stderrCaptured: string;
}

async function invokeHook(
  pluginFn: (input: object) => object,
  client: object,
  hookInput: object,
  output: object,
  env: Record<string, string | undefined> = {},
): Promise<HookResult> {
  // Apply env vars
  const savedEnv: Record<string, string | undefined> = {};
  for (const [k, v] of Object.entries(env)) {
    savedEnv[k] = process.env[k];
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }

  // Capture stderr
  let stderrCaptured = "";
  const originalStderrWrite = process.stderr.write.bind(process.stderr);
  process.stderr.write = (chunk: string | Uint8Array, ...args: unknown[]) => {
    stderrCaptured += chunk.toString();
    return true;
  };

  let threw = false;
  let error: Error | null = null;

  try {
    const hooks = pluginFn(client) as Record<string, unknown>;
    const beforeHook = hooks["tool.execute.before"] as (
      hookInput: object,
      output: object,
    ) => Promise<void>;
    if (typeof beforeHook === "function") {
      await beforeHook(hookInput, output);
    }
  } catch (err) {
    threw = true;
    error = err instanceof Error ? err : new Error(String(err));
  } finally {
    // Restore env
    for (const [k, v] of Object.entries(savedEnv)) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
    // Restore stderr
    process.stderr.write = originalStderrWrite;
  }

  return { threw, error, stderrCaptured };
}

// ---------------------------------------------------------------------------
// Dedup state file helpers
// ---------------------------------------------------------------------------

function stateDir() {
  return path.join(os.tmpdir(), "bkit-gateguard");
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

let plugin: (input: object) => object;

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
    expect(result.stderrCaptured).toContain("[bkit GateGuard]");
    expect(result.stderrCaptured).toContain("foo-does-not-exist.ts");
    expect(result.stderrCaptured).toContain("Bolt-on drift");
  });

  it("emits investigation checklist on a write to an EXISTING file", async () => {
    const session = newSession();
    const { hookInput, output } = writeHookInput("package.json", session);
    const result = await invokeHook(plugin, orchestratorClient(), hookInput, output, {
      BKIT_GATEGUARD: undefined,
    });
    expect(result.threw).toBe(false);
    expect(result.stderrCaptured).toContain("investigation");
    expect(result.stderrCaptured).not.toContain("Bolt-on drift");
  });

  it("emits investigation checklist on first edit to a file", async () => {
    const session = newSession();
    const { hookInput, output } = editHookInput("src/bar.ts", session);
    const result = await invokeHook(plugin, orchestratorClient(), hookInput, output, {
      BKIT_GATEGUARD: undefined,
    });
    expect(result.threw).toBe(false);
    expect(result.stderrCaptured).toContain("[bkit GateGuard]");
    expect(result.stderrCaptured).toContain("bar.ts");
  });

  it("dedups: second write to the same file in the same session emits nothing", async () => {
    const session = newSession();
    const { hookInput, output } = writeHookInput("src/dedup.ts", session);

    const first = await invokeHook(plugin, orchestratorClient(), hookInput, output, {
      BKIT_GATEGUARD: undefined,
    });
    expect(first.stderrCaptured).toContain("[bkit GateGuard]");

    const second = await invokeHook(plugin, orchestratorClient(), hookInput, output, {
      BKIT_GATEGUARD: undefined,
    });
    expect(second.threw).toBe(false);
    expect(second.stderrCaptured).toBe("");
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
    expect(r.stderrCaptured).toContain("b.ts");
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
    expect(retry.stderrCaptured).toBe("");
  });
});

// ---------------------------------------------------------------------------
// 3. Off mode no-op
// ---------------------------------------------------------------------------

describe("gateguard opencode plugin — off mode", () => {
  it("BKIT_GATEGUARD=off: no stderr, no throw, no dedup state written", async () => {
    const session = newSession();
    const { hookInput, output } = writeHookInput("src/off.ts", session);
    const result = await invokeHook(plugin, orchestratorClient(), hookInput, output, {
      BKIT_GATEGUARD: "off",
    });
    expect(result.threw).toBe(false);
    expect(result.stderrCaptured).toBe("");
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
    expect(result.stderrCaptured).toBe("");
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
    expect(result.stderrCaptured).toContain("[bkit GateGuard]");
  });

  it("orchestrator session gets the advisory too — same treatment either way", async () => {
    const session = newSession();
    const { hookInput, output } = writeHookInput("src/orch.ts", session);
    const result = await invokeHook(plugin, orchestratorClient(), hookInput, output, {
      BKIT_GATEGUARD: undefined,
    });
    expect(result.threw).toBe(false);
    expect(result.stderrCaptured).toContain("[bkit GateGuard]");
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
    expect(result.stderrCaptured).toContain("quality-gate config");
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
    expect(result.stderrCaptured).toContain("quality-gate config");
  });

  it("BKIT_ALLOW_CONFIG_EDIT=1 downgrades config edit to normal checklist", async () => {
    const session = newSession();
    const { hookInput, output } = writeHookInput("tsconfig.json", session);
    const result = await invokeHook(plugin, orchestratorClient(), hookInput, output, {
      BKIT_GATEGUARD: undefined,
      BKIT_ALLOW_CONFIG_EDIT: "1",
    });
    expect(result.stderrCaptured).toContain("[bkit GateGuard]");
    expect(result.stderrCaptured).not.toContain("quality-gate config");
  });

  it("source file is not treated as gate config", async () => {
    const session = newSession();
    const { hookInput, output } = writeHookInput("src/tsconfig-helper.ts", session);
    const result = await invokeHook(plugin, orchestratorClient(), hookInput, output, {
      BKIT_GATEGUARD: undefined,
    });
    expect(result.stderrCaptured).not.toContain("quality-gate config");
  });
});

// ---------------------------------------------------------------------------
// 6. Malformed/missing args → fail-open (no throw)
// ---------------------------------------------------------------------------

describe("gateguard opencode plugin — fail-open cases", () => {
  it("missing file path (no args.path) is ignored — no throw, no stderr", async () => {
    const session = newSession();
    const result = await invokeHook(
      plugin,
      orchestratorClient(),
      { tool: "write", sessionID: session, callID: "toolu_test" },
      { args: {} }, // no path key
      { BKIT_GATEGUARD: undefined },
    );
    expect(result.threw).toBe(false);
    expect(result.stderrCaptured).toBe("");
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
    expect(result.stderrCaptured).toBe("");
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
    // In advisory mode, stderr should contain the checklist (fail-open = apply advisory)
    expect(result.stderrCaptured).toContain("[bkit GateGuard]");
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
    expect(result.stderrCaptured).toBe("");
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

  it("bkit:end precedes the exported plugin declaration", () => {
    const src = fs.readFileSync(PLUGIN_PATH, "utf-8");
    const end = src.indexOf("// bkit:end");
    const exportIdx = src.indexOf("export default function plugin");
    expect(end).toBeGreaterThanOrEqual(0);
    expect(exportIdx).toBeGreaterThan(end);
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
    expect(result.stderrCaptured).toContain("docs/*.md authoring");
  });

  it("does NOT match a Documents/ ancestor (segment match, not substring)", async () => {
    const plugin = await loadPlugin();
    const session = newSession();
    const { hookInput, output } = editHookInput("Documents/architecture.md", session);
    const result = await invokeHook(plugin, orchestratorClient(), hookInput, output, {
      BKIT_GATEGUARD: undefined,
    });
    expect(result.stderrCaptured).not.toContain("docs/*.md authoring");
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
    expect(result.stderrCaptured).not.toContain("docs/*.md authoring");
  });

  it("does NOT match docs/knowledge.jsonl (gated on .md)", async () => {
    const plugin = await loadPlugin();
    const session = newSession();
    const { hookInput, output } = editHookInput("docs/knowledge.jsonl", session);
    const result = await invokeHook(plugin, orchestratorClient(), hookInput, output, {
      BKIT_GATEGUARD: undefined,
    });
    expect(result.stderrCaptured).not.toContain("docs/*.md authoring");
  });

  it("matches a nested docs/ tree via segment match (.bkit/templates/docs/architecture.md)", async () => {
    const plugin = await loadPlugin();
    const session = newSession();
    const { hookInput, output } = editHookInput(".bkit/templates/docs/architecture.md", session);
    const result = await invokeHook(plugin, orchestratorClient(), hookInput, output, {
      BKIT_GATEGUARD: undefined,
    });
    expect(result.stderrCaptured).toContain("docs/*.md authoring");
  });

  it("twin parity: isDocsPath + docAuthoringAdvisory are byte-identical between the two hooks", () => {
    const CJS_PATH = path.resolve(".bkit/templates/.claude/hooks/gateguard.cjs");
    const jsSrc = fs.readFileSync(PLUGIN_PATH, "utf-8");
    const cjsSrc = fs.readFileSync(CJS_PATH, "utf-8");

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
