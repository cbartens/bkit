// audits/hooks/session-rules-advisory.integration.test.ts — the rules-read advisory on
// the hosts with no session-start event (opencode, Codex, Antigravity): it lands at the
// first tool call, once per session.
//
// The opencode plugin is imported as install generates it (shared part spliced in) and
// driven through the dual shape OpenCode 1.x (`server()`) and 2.0 (`setup(ctx)`) load.
// The Codex and Antigravity hooks are spawned as their host runs them: rendered hook,
// JSON on stdin, JSON on stdout.

import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { pathToFileURL } from "node:url";
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { readTemplate } from "../../render/parts";

const HOOK_SOURCES = path.join(__dirname, "..", "..", "..", "..", "core");
const PARTS_DIR = path.join(HOOK_SOURCES, "hooks");

const GENERATED = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-rules-"));
afterAll(() => fs.rmSync(GENERATED, { recursive: true, force: true }));

// The plugin as install generates it. `.mjs`: it is an ES module and the temp dir has no
// package.json saying so.
const OPENCODE_PLUGIN = path.join(GENERATED, "bkit-rules.mjs");
fs.writeFileSync(
  OPENCODE_PLUGIN,
  readTemplate(path.join(HOOK_SOURCES, ".opencode", "plugin", "bkit-rules.js")),
);

// ---------------------------------------------------------------------------
// Delivered-once state — the advisory is keyed by session id and lives in the OS temp
// dir, so tests use their own ids and clear them (plus the shared no-session bucket).
// ---------------------------------------------------------------------------

const STATE_DIR_NAME = `bkit-rules-advisory-${process.getuid!()}`;
const STATE_DIR = path.join(os.tmpdir(), STATE_DIR_NAME);

/** A temp root whose state dirs `names` exist and cannot be written. */
function unwritableStateRoot(...names: string[]): string {
  const root = fs.mkdtempSync(path.join(GENERATED, "tmp-"));
  for (const name of names) fs.mkdirSync(path.join(root, name), { mode: 0o555 });
  return root;
}
const safeKey = (id: string) => id.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 128);

let sessionCounter = 0;
const usedSessions: string[] = [];
function newSession(): string {
  sessionCounter += 1;
  const id = `rules-test-${process.pid}-${sessionCounter}`;
  usedSessions.push(id);
  return id;
}

afterEach(() => {
  if (!fs.existsSync(STATE_DIR)) return;
  fs.rmSync(path.join(STATE_DIR, "no-session.json"), { force: true });
  for (const id of usedSessions.splice(0)) {
    fs.rmSync(path.join(STATE_DIR, `${safeKey(id)}.json`), { force: true });
  }
});

// ---------------------------------------------------------------------------
// The opencode plugin, driven the way each OpenCode release drives it.
// ---------------------------------------------------------------------------

interface RulesPlugin {
  id: string;
  setup: (ctx: object) => Promise<void>;
  server: () => Promise<Record<string, unknown>>;
}

async function loadPlugin(): Promise<RulesPlugin> {
  const { default: plugin } = await import(pathToFileURL(OPENCODE_PLUGIN).href);
  return plugin;
}

interface HookOutcome {
  threw: boolean;
  /** The text the host surfaces to the model in the tool result, or "". */
  advice: string;
}

type HookFn = (input: unknown, output: unknown) => Promise<void>;

/** How the 2.0 `execute.after` event is shaped when the call cannot carry the advisory. */
interface V2EventShape {
  /** Leave `result` off the event, as a call whose result never arrived. */
  omitResult?: boolean;
  /** The event's status; `"completed"` unless a test asks for another. */
  status?: string;
}

/** Drive the plugin as OpenCode 2.0 does: `setup()`, then `execute.after` with a result. */
async function runV2(
  plugin: RulesPlugin,
  hookInput: unknown,
  shape: V2EventShape = {},
): Promise<HookOutcome> {
  const hooks: Record<string, HookFn> = {};
  const ctx = {
    tool: {
      hook: async (name: string, cb: HookFn) => {
        hooks[name] = cb;
      },
    },
  };
  try {
    await plugin.setup(ctx);
  } catch {
    return { threw: true, advice: "" };
  }
  const after = hooks["execute.after"];
  if (typeof after !== "function") return { threw: false, advice: "" };
  const result: { content: { type: string; text: string }[] } = { content: [] };
  const event: Record<string, unknown> = {
    ...(typeof hookInput === "object" && hookInput !== null ? hookInput : {}),
    status: shape.status ?? "completed",
  };
  if (shape.omitResult !== true) event.result = result;
  try {
    await after(event, {});
  } catch {
    return { threw: true, advice: "" };
  }
  return { threw: false, advice: result.content.map((part) => part.text).join("") };
}

/** The result text a 1.x `output` carries, or "" when it is no result object at all. */
function outputText(output: unknown): string {
  if (typeof output !== "object" || output === null) return "";
  const text = "output" in output ? output.output : undefined;
  return typeof text === "string" ? text : "";
}

/**
 * Drive the plugin as OpenCode 1.x does: `server()`, then `tool.execute.after`. `output`
 * defaults to a well-formed result object; a test passes its own to drive a call whose
 * output is not an object.
 */
async function runV1(
  plugin: RulesPlugin,
  hookInput: unknown,
  output: unknown = { title: "", output: "", metadata: {} },
): Promise<HookOutcome> {
  let hooks: Record<string, HookFn>;
  try {
    hooks = (await plugin.server()) as Record<string, HookFn>;
  } catch {
    return { threw: true, advice: "" };
  }
  const after = hooks["tool.execute.after"];
  if (typeof after !== "function") return { threw: false, advice: "" };
  try {
    await after(hookInput ?? {}, output);
  } catch {
    return { threw: true, advice: "" };
  }
  return { threw: false, advice: outputText(output) };
}

describe("opencode plugin — the rules-read advisory", () => {
  let plugin: RulesPlugin;
  beforeEach(async () => {
    plugin = await loadPlugin();
  });

  it("opencode plugin appends the rules advisory to the first tool result", async () => {
    const result = await runV2(plugin, {
      tool: "read",
      sessionID: newSession(),
      id: "call-1",
      input: { path: "src/index.ts" },
    });
    expect(result.threw).toBe(false);
    expect(result.advice).toContain(".agents/rules.md");
  });

  it("opencode plugin appends nothing on the second call in the same session", async () => {
    const call = {
      tool: "read",
      sessionID: newSession(),
      id: "call-1",
      input: { path: "src/index.ts" },
    };
    const first = await runV2(plugin, call);
    expect(first.threw).toBe(false);
    expect(first.advice).toContain(".agents/rules.md");

    const second = await runV2(plugin, { ...call, id: "call-2" });
    expect(second.threw).toBe(false);
    expect(second.advice).toBe("");
  });

  it("opencode plugin fails open on a malformed hook input", async () => {
    const result = await runV2(plugin, null);
    expect(result.threw).toBe(false);
    expect(result.advice).toContain(".agents/rules.md");
  });

  it("opencode plugin keeps the advisory for the next call when the first result is missing", async () => {
    const call = {
      tool: "read",
      sessionID: newSession(),
      id: "call-1",
      input: { path: "src/index.ts" },
    };
    // No result to append to: nothing to deliver, and the session's one advisory must
    // stay unspent so the next call — the one that can carry it — still gets it.
    const first = await runV2(plugin, call, { omitResult: true });
    expect(first.threw).toBe(false);
    expect(first.advice).toBe("");

    const second = await runV2(plugin, { ...call, id: "call-2" });
    expect(second.threw).toBe(false);
    expect(second.advice).toContain(".agents/rules.md");
  });

  it("the 1.x driver delivers the same advisory once per session", async () => {
    const call = { tool: "read", sessionID: newSession(), callID: "call-1", args: {} };
    const first = await runV1(plugin, call);
    expect(first.threw).toBe(false);
    expect(first.advice).toContain(".agents/rules.md");
    const second = await runV1(plugin, { ...call, callID: "call-2" });
    expect(second.threw).toBe(false);
    expect(second.advice).toBe("");
  });

  it("the 1.x driver keeps the advisory when the first output is not an object", async () => {
    const call = { tool: "read", sessionID: newSession(), callID: "call-1", args: {} };
    // A call whose `output` is no result object cannot carry the advisory either, so the
    // session's one advisory stays unspent for the next call.
    const first = await runV1(plugin, call, null);
    expect(first.threw).toBe(false);
    expect(first.advice).toBe("");

    const second = await runV1(plugin, { ...call, callID: "call-2" });
    expect(second.threw).toBe(false);
    expect(second.advice).toContain(".agents/rules.md");
  });

  it("opencode plugin advises once per session when no state dir can be written", async () => {
    vi.stubEnv("TMPDIR", unwritableStateRoot("bkit-rules-advisory", STATE_DIR_NAME));
    try {
      const call = { tool: "read", sessionID: newSession(), id: "call-1", input: {} };
      const advice: string[] = [];
      for (let i = 0; i < 5; i += 1) advice.push((await runV2(plugin, call)).advice);
      expect(advice.filter((a) => a.includes(".agents/rules.md"))).toHaveLength(1);
    } finally {
      vi.unstubAllEnvs();
    }
  });
});

// ---------------------------------------------------------------------------
// Codex and Antigravity — rendered hooks, spawned as their host runs them: the hook file
// install writes, the host's JSON payload on stdin, the host's JSON decision on stdout.
// ---------------------------------------------------------------------------

/**
 * The hook as install generates it (shared parts spliced in), in the temp dir. The host
 * path is flattened into the file name: both hosts' hooks are called `bkit-rules.cjs`.
 */
function renderHook(rel: string): string {
  const out = path.join(GENERATED, rel.replace(/^\./, "").split(path.sep).join("-"));
  fs.writeFileSync(out, readTemplate(path.join(HOOK_SOURCES, rel)));
  return out;
}

const CODEX_HOOK = renderHook(path.join(".codex", "hooks", "bkit-rules.cjs"));
const ANTIGRAVITY_HOOK = renderHook(
  path.join(".agents", "plugins", "bkit", "hooks", "bkit-rules.cjs"),
);

function runHook(
  hook: string,
  input: string,
  env: NodeJS.ProcessEnv = process.env,
): { status: number | null; stdout: string; stderr: string } {
  const result = spawnSync(process.execPath, [hook], {
    input,
    env,
    encoding: "utf-8",
    timeout: 10_000,
  });
  return {
    status: result.status,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
  };
}

/** The advisory a rendered hook surfaces to the model, in its host's own envelope. */
function emittedAdvisory(stdout: string): string {
  const doc = JSON.parse(stdout);
  return doc.hookSpecificOutput?.additionalContext ?? doc.reason;
}

describe("codex hook — the rules-read advisory", () => {
  it("codex hook writes the rules advisory as additionalContext once per session", () => {
    const payload = JSON.stringify({
      tool_name: "apply_patch",
      session_id: newSession(),
      cwd: "/w",
    });
    const first = runHook(CODEX_HOOK, payload);
    expect(first.status).toBe(0);
    expect(JSON.parse(first.stdout).hookSpecificOutput.additionalContext).toContain(
      ".agents/rules.md",
    );

    const second = runHook(CODEX_HOOK, payload);
    expect(second.status).toBe(0);
    expect(second.stdout.trim()).toBe("");
  });

  it("codex hook fails open on an empty payload", () => {
    const result = runHook(CODEX_HOOK, "");
    expect(result.status).toBe(0);
    expect(result.stdout).toBe("");
  });

  it("an unknown session id still yields the advisory once and never throws", () => {
    // No session id: the advisory must still reach the model (fail-open), and must not
    // repeat on the next call.
    const payload = JSON.stringify({ tool_name: "Bash", cwd: "/w" });
    const first = runHook(CODEX_HOOK, payload);
    expect(first.status).toBe(0);
    expect(JSON.parse(first.stdout).hookSpecificOutput.additionalContext).toContain(
      ".agents/rules.md",
    );

    const second = runHook(CODEX_HOOK, payload);
    expect(second.status).toBe(0);
    expect(second.stdout.trim()).toBe("");
  });

  it("an unwritable state dir returns the advisory once per session, not on every call", () => {
    // Another user's state dir on a shared temp dir (Linux `/tmp`) cannot be written.
    const env = { ...process.env, TMPDIR: unwritableStateRoot("bkit-rules-advisory") };
    const payload = JSON.stringify({ tool_name: "Bash", session_id: newSession(), cwd: "/w" });
    const runs = Array.from({ length: 5 }, () => runHook(CODEX_HOOK, payload, env));
    expect(runs.map((r) => r.status)).toEqual([0, 0, 0, 0, 0]);
    expect(runs.filter((r) => r.stdout.includes(".agents/rules.md"))).toHaveLength(1);
  });
});

describe("antigravity hook — the rules-read advisory", () => {
  it("antigravity hook denies the first call once with the advisory and allows the retry", () => {
    const payload = JSON.stringify({
      conversationId: newSession(),
      toolCall: { name: "view_file", args: { AbsolutePath: "/tmp/x.ts" } },
      workspacePaths: ["/w"],
    });
    const first = runHook(ANTIGRAVITY_HOOK, payload);
    expect(first.status).toBe(0);
    const decision = JSON.parse(first.stdout);
    expect(decision.decision).toBe("deny");
    expect(decision.reason).toContain(".agents/rules.md");

    const retry = runHook(ANTIGRAVITY_HOOK, payload);
    expect(retry.status).toBe(0);
    expect(JSON.parse(retry.stdout).decision).toBe("allow");
  });

  it("the antigravity retry store never persists a raw command line", () => {
    const session = newSession();
    const marker = `AWS_SECRET_ACCESS_KEY=secret-${session}`;
    const payload = JSON.stringify({
      conversationId: session,
      toolCall: { name: "run_command", args: { CommandLine: `export ${marker}`, Cwd: "/w" } },
      workspacePaths: ["/w"],
    });
    const retryFile = path.join(
      os.tmpdir(),
      "bkit-antigravity-retry",
      `rules.${safeKey(session)}.json`,
    );
    try {
      const first = runHook(ANTIGRAVITY_HOOK, payload);
      expect(first.status).toBe(0);
      expect(JSON.parse(first.stdout).decision).toBe("deny");

      // The deny-once store is world-readable, has no TTL and is left behind when the
      // agent rephrases instead of retrying, so it must hold a one-way digest of the
      // call signature — never the command line, which can carry an inline secret.
      const stored = fs.readFileSync(retryFile, "utf-8");
      expect(stored).not.toContain(marker);
      expect(stored).not.toContain("AWS_SECRET_ACCESS_KEY");

      const retry = runHook(ANTIGRAVITY_HOOK, payload);
      expect(retry.status).toBe(0);
      expect(JSON.parse(retry.stdout).decision).toBe("allow");
    } finally {
      fs.rmSync(retryFile, { force: true });
    }
  });
});

describe("every rendered advisory hook", () => {
  it("every rendered advisory hook names .agents/rules.md and not AGENTS.md", () => {
    const sessions: Array<[string, string]> = [
      [
        CODEX_HOOK,
        JSON.stringify({ tool_name: "apply_patch", session_id: newSession(), cwd: "/w" }),
      ],
      [
        ANTIGRAVITY_HOOK,
        JSON.stringify({ conversationId: newSession(), toolCall: { name: "view_file", args: {} } }),
      ],
    ];
    for (const [hook, payload] of sessions) {
      expect(fs.readFileSync(hook, "utf-8"), hook).not.toContain("AGENTS.md");
      const result = runHook(hook, payload);
      expect(result.status, hook).toBe(0);
      const advisory = emittedAdvisory(result.stdout);
      expect(advisory, hook).toContain(".agents/rules.md");
      expect(advisory, hook).not.toContain("AGENTS.md");
    }
  });
});

// ---------------------------------------------------------------------------
// The shared advisory text — one sentence, declared once per language, held together by
// these two assertions.
// ---------------------------------------------------------------------------

/** The advisory sentence the shell part declares. */
function shellAdvisory(): string {
  const src = fs.readFileSync(path.join(PARTS_DIR, "preflight-rules.sh"), "utf-8");
  const m = /^BKIT_RULES_ADVISORY='([^']*)'$/m.exec(src);
  expect(m, "BKIT_RULES_ADVISORY not found in preflight-rules.sh").not.toBeNull();
  return m![1]!;
}

/** The advisory sentence the JS part declares. */
function jsAdvisory(): string {
  const src = fs.readFileSync(path.join(PARTS_DIR, "session-rules-advisory.js"), "utf-8");
  const m = /^const RULES_READ_ADVISORY =\s*"([^"]*)";$/m.exec(src);
  expect(m, "RULES_READ_ADVISORY not found in session-rules-advisory.js").not.toBeNull();
  return m![1]!;
}

describe("the shared rules-read advisory", () => {
  it("the shared advisory names .agents/rules.md and not AGENTS.md", () => {
    for (const [name, advisory] of [
      ["shell", shellAdvisory()],
      ["js", jsAdvisory()],
    ] as const) {
      expect(advisory, name).toContain(".agents/rules.md");
      expect(advisory, name).not.toContain("AGENTS.md");
    }
  });

  it("the shell part and the JS part hold the byte-identical advisory string", () => {
    expect(jsAdvisory()).toBe(shellAdvisory());
  });
});
