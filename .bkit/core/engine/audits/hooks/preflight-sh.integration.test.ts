// audits/hooks/preflight-sh.integration.test.ts — SessionStart hook (preflight.sh)
// runtime behaviour. Spawns the hook as install generates it (the host template with
// the shared Linear guard spliced in) as a bash child process, plus one source-level
// (no-subprocess) check of the Claude hook.
//
// The Claude hook runs as a Claude SessionStart hook, the Cursor one as a Cursor Cloud
// sessionStart hook (a different surface from the install-time TS preflight). Covered:
//   - IDE sessions (Claude: empty LINEAR_ISSUE_ID; Cursor: no is_background_agent) exit 0
//     carrying the rules-read advisory, built without python3.
//   - Missing BKIT_LINEAR_API_KEY / LINEAR_ISSUE_ID hard-stop, in each host's own
//     output shape, with the advisory riding the same one JSON document.
//   - Neither hook calls bkit: both run with no node_modules at all.
//   - Jira has no preflight guard: a Jira session passes through, and neither hook
//     reads the Jira token or calls Atlassian.

import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { readTemplate } from "../../render/parts";

const HOOK_SOURCES = path.join(__dirname, "..", "..", "..", "..", "core");
const GENERATED = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-preflight-"));
afterAll(() => fs.rmSync(GENERATED, { recursive: true, force: true }));
const [CLAUDE_HOOK, CURSOR_HOOK] = ["claude", "cursor"].map((host) => {
  const out = path.join(GENERATED, `${host}-preflight.sh`);
  fs.writeFileSync(
    out,
    readTemplate(path.join(HOOK_SOURCES, `.${host}`, "hooks", "bkit-preflight.sh")),
  );
  return out;
});

function runPreflight(
  hook: string,
  env: Record<string, string | undefined>,
  input = "{}",
  opts: { path?: string } = {},
): { status: number | null; stdout: string; stderr: string } {
  // Strip undefined keys so we don't leak the parent process env back in.
  const cleanEnv: Record<string, string> = {};
  for (const [k, v] of Object.entries(env)) {
    if (v !== undefined) cleanEnv[k] = v;
  }
  // cwd outside any git repo: Cursor's runtime marker write is skipped.
  const result = spawnSync("bash", [hook], {
    cwd: GENERATED,
    env: { PATH: opts.path ?? process.env.PATH ?? "", ...cleanEnv },
    input,
    encoding: "utf-8",
    timeout: 10_000,
  });
  return {
    status: result.status,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
  };
}

// A `python3` that behaves like a missing one (127 = command not found), so a PATH
// holding it is a python3-less session. The advisory path must build its JSON without
// python3: Cursor's `failClosed: true` blocks a session on a non-zero exit, and Claude
// would lose the advisory silently.
const NO_PYTHON_BIN = path.join(GENERATED, "no-python-bin");
fs.mkdirSync(NO_PYTHON_BIN, { recursive: true });
const NO_PYTHON_STUB = path.join(NO_PYTHON_BIN, "python3");
fs.writeFileSync(NO_PYTHON_STUB, "#!/bin/sh\nexit 127\n");
fs.chmodSync(NO_PYTHON_STUB, 0o755);
const NO_PYTHON_PATH = `${NO_PYTHON_BIN}${path.delimiter}${process.env.PATH ?? ""}`;

/** The context string a rendered hook writes, in that host's own stdout envelope. */
function emittedContext(stdout: string): string {
  const doc = JSON.parse(stdout);
  return doc.hookSpecificOutput?.additionalContext ?? doc.additional_context;
}

describe("BAR-186 — Claude SessionStart preflight.sh runtime behaviour", () => {
  it("emits the rules advisory on a Claude IDE session", () => {
    const result = runPreflight(CLAUDE_HOOK, {});
    expect(result.status).toBe(0);
    expect(emittedContext(result.stdout)).toContain(".agents/rules.md");
  });

  it("a cloud session prints one JSON document carrying the advisory and the Linear guard result", () => {
    const result = runPreflight(CLAUDE_HOOK, { LINEAR_ISSUE_ID: "BAR-186-test" });
    expect(result.status).toBe(1);
    expect(result.stdout.trim().split("\n")).toHaveLength(1);
    const context = emittedContext(result.stdout);
    expect(context).toContain(".agents/rules.md");
    expect(context).toContain("HARD STOP");
  });

  it("missing BKIT_LINEAR_API_KEY hard-stops when LINEAR_ISSUE_ID is present (regression guard)", () => {
    const result = runPreflight(CLAUDE_HOOK, {
      LINEAR_ISSUE_ID: "BAR-186-test",
      // no BKIT_LINEAR_API_KEY
    });
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("BKIT_LINEAR_API_KEY not set");
    expect(JSON.parse(result.stdout).hookSpecificOutput.additionalContext).toContain("HARD STOP");
  });

  it("a context carrying a control character still yields one parseable JSON document", () => {
    // The Linear guard interpolates LINEAR_ISSUE_ID verbatim into the key-missing FAIL
    // message. A control byte in it must not yield a document the host discards whole,
    // which would silently drop the HARD STOP and the advisory with it.
    const result = runPreflight(CLAUDE_HOOK, { LINEAR_ISSUE_ID: "BAR-186-\u000b-test" });
    expect(result.status).toBe(1);
    const doc = JSON.parse(result.stdout);
    expect(doc.hookSpecificOutput.additionalContext).toContain("HARD STOP");
  });
});

describe("Claude SessionStart preflight.sh — no Jira guard", () => {
  it("a Jira session (token set, no LINEAR_ISSUE_ID) emits the advisory and exits 0", () => {
    const result = runPreflight(CLAUDE_HOOK, { BKIT_JIRA_API_KEY: "t" });
    expect(result.status).toBe(0);
    expect(emittedContext(result.stdout)).toContain(".agents/rules.md");
    expect(result.stderr).toBe("");
  });

  it("neither generated hook reads the Jira token or calls Atlassian", () => {
    for (const hook of [CLAUDE_HOOK, CURSOR_HOOK]) {
      const text = fs.readFileSync(hook, "utf-8");
      expect(text, hook).not.toContain("BKIT_JIRA_API_KEY");
      expect(text, hook).not.toMatch(/atlassian/i);
    }
  });
});

describe("Cursor sessionStart preflight.sh runtime behaviour", () => {
  it("a Cursor session emits the advisory without python3 and exits 0", () => {
    const result = runPreflight(CURSOR_HOOK, {}, '{"is_background_agent": false}', {
      path: NO_PYTHON_PATH,
    });
    expect(result.status).toBe(0);
    expect(emittedContext(result.stdout)).toContain(".agents/rules.md");
  });

  it("a background agent without BKIT_LINEAR_API_KEY hard-stops in Cursor's shape", () => {
    const result = runPreflight(CURSOR_HOOK, {}, '{"is_background_agent": true}');
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("BKIT_LINEAR_API_KEY not set");
    expect(JSON.parse(result.stdout).additional_context).toContain("HARD STOP");
  });

  it("a background agent with a key but no LINEAR_ISSUE_ID hard-stops", () => {
    const result = runPreflight(
      CURSOR_HOOK,
      { BKIT_LINEAR_API_KEY: "k" },
      '{"is_background_agent": true}',
    );
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("LINEAR_ISSUE_ID not set");
  });
});

describe("preflight.sh — the rules-read advisory", () => {
  it("names .agents/rules.md and never AGENTS.md", () => {
    const sessions: Array<[string, string]> = [
      [CLAUDE_HOOK, "{}"],
      [CURSOR_HOOK, '{"is_background_agent": false}'],
    ];
    for (const [hook, input] of sessions) {
      const result = runPreflight(hook, {}, input);
      expect(result.status, hook).toBe(0);
      const context = emittedContext(result.stdout);
      expect(context, hook).toContain(".agents/rules.md");
      expect(context, hook).not.toContain("AGENTS.md");
      expect(fs.readFileSync(hook, "utf-8"), hook).not.toContain("AGENTS.md");
    }
  });
});

describe("preflight.sh — generated from one Linear guard", () => {
  it("both generated hooks carry the shared guard verbatim and never call bkit", () => {
    const guard = fs
      .readFileSync(path.join(HOOK_SOURCES, "hooks", "preflight-linear.sh"), "utf-8")
      .trimEnd();
    for (const hook of [CLAUDE_HOOK, CURSOR_HOOK]) {
      const text = fs.readFileSync(hook, "utf-8");
      expect(text, hook).toContain(guard);
      // Prose may name the subcommands (a comment says "no bkit runtime"); only
      // ACTIVE lines must never call one.
      const code = text
        .split("\n")
        .filter((l) => !/^\s*#/.test(l))
        .join("\n");
      expect(code, hook).not.toMatch(/\bbkit (?:runtime|context|ci)\b/);
    }
  });
});

// ---------------------------------------------------------------------------
// SessionStart hook (preflight.sh)
//
// The bash hook at .bkit/core/.claude/hooks/bkit-preflight.sh runs as a
// Claude SessionStart hook (a different surface from the install-time TS
// preflight in checks/before/). Covered behaviour:
//   - Brew-bin check is Darwin-gated (Linux sandbox / CI pass through).
//   - IDE-skip path (empty LINEAR_ISSUE_ID exits 0 silently).
//   - Missing BKIT_LINEAR_API_KEY hard-stops when a Linear issue is present.
//
// The runtime behaviour (real bash subprocess) is covered above; this is the
// source-level (no-subprocess) check.
// ---------------------------------------------------------------------------

const SESSIONSTART_HOOK_PATH = path.join(
  __dirname,
  "..",
  "..",
  "..",
  "..",
  "core",
  ".claude",
  "hooks",
  "bkit-preflight.sh",
);

describe("BAR-186 — SessionStart preflight.sh source-level checks", () => {
  it("brew-bin loop is wrapped in a Darwin OS gate", () => {
    const src = fs.readFileSync(SESSIONSTART_HOOK_PATH, "utf-8");
    // Darwin gate must precede the brew-bin loop
    expect(src).toMatch(/\[\[\s+"\$\(uname\)"\s+==\s+"Darwin"\s+\]\]/);
    const darwinIdx = src.search(/\[\[\s+"\$\(uname\)"\s+==\s+"Darwin"\s+\]\]/);
    const brewBinsIdx = src.indexOf("REQUIRED_BREW_BINS=");
    expect(darwinIdx).toBeGreaterThan(-1);
    expect(brewBinsIdx).toBeGreaterThan(-1);
    expect(darwinIdx).toBeLessThan(brewBinsIdx);
  });
});
