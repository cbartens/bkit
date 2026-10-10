// audits/hooks/preflight-sh.integration.test.ts — SessionStart hook (preflight.sh)
// runtime behaviour. Spawns the hook as install generates it (the host template with
// the shared Linear guard spliced in) as a bash child process, plus one source-level
// (no-subprocess) check of the Claude hook.
//
// The Claude hook runs as a Claude SessionStart hook, the Cursor one as a Cursor Cloud
// sessionStart hook (a different surface from the install-time TS preflight). Covered:
//   - IDE-skip paths (Claude: empty LINEAR_ISSUE_ID; Cursor: no is_background_agent)
//     exit 0 silently.
//   - Missing BKIT_LINEAR_API_KEY / LINEAR_ISSUE_ID hard-stop, in each host's own
//     output shape.
//   - Neither hook calls bkit: both run with no node_modules at all.

import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { readTemplate } from "../../render/parts";

const TEMPLATES = path.join(__dirname, "..", "..", "..", "..", "templates");
const GENERATED = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-preflight-"));
afterAll(() => fs.rmSync(GENERATED, { recursive: true, force: true }));
const [CLAUDE_HOOK, CURSOR_HOOK] = ["claude", "cursor"].map((host) => {
  const out = path.join(GENERATED, `${host}-preflight.sh`);
  fs.writeFileSync(out, readTemplate(path.join(TEMPLATES, `.${host}`, "hooks", "preflight.sh")));
  return out;
});

function runPreflight(
  hook: string,
  env: Record<string, string | undefined>,
  input = "{}",
): { status: number | null; stdout: string; stderr: string } {
  // Strip undefined keys so we don't leak the parent process env back in.
  const cleanEnv: Record<string, string> = {};
  for (const [k, v] of Object.entries(env)) {
    if (v !== undefined) cleanEnv[k] = v;
  }
  // cwd outside any git repo: Cursor's runtime marker write is skipped.
  const result = spawnSync("bash", [hook], {
    cwd: GENERATED,
    env: { PATH: process.env.PATH ?? "", ...cleanEnv },
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

describe("BAR-186 — Claude SessionStart preflight.sh runtime behaviour", () => {
  it("exits 0 silently when LINEAR_ISSUE_ID is empty (existing IDE-skip preserved)", () => {
    const result = runPreflight(CLAUDE_HOOK, {});
    expect(result.status).toBe(0);
    expect(result.stdout).toBe("");
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
});

describe("Cursor sessionStart preflight.sh runtime behaviour", () => {
  it("exits 0 silently when the session is not a background agent", () => {
    const result = runPreflight(CURSOR_HOOK, {}, '{"is_background_agent": false}');
    expect(result.status).toBe(0);
    expect(result.stdout).toBe("");
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

describe("preflight.sh — generated from one Linear guard", () => {
  it("both generated hooks carry the shared guard verbatim and never call bkit", () => {
    const guard = fs
      .readFileSync(path.join(TEMPLATES, "hook-parts", "preflight-linear.sh"), "utf-8")
      .trimEnd();
    for (const hook of [CLAUDE_HOOK, CURSOR_HOOK]) {
      const text = fs.readFileSync(hook, "utf-8");
      expect(text, hook).toContain(guard);
      expect(text, hook).not.toMatch(/\bbkit (?:runtime|context|ci)\b/);
    }
  });
});

// ---------------------------------------------------------------------------
// SessionStart hook (preflight.sh)
//
// The bash hook at .bkit/templates/.claude/hooks/preflight.sh runs as a
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
  "templates",
  ".claude",
  "hooks",
  "preflight.sh",
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
