// bkit-preflight.integration.test.ts — BAR-186 SessionStart hook (preflight.sh)
// runtime behaviour. Spawns the real bash hook as a child process; the
// source-level (no-subprocess) check for the same hook stays in
// bkit-preflight.test.ts.
//
// The bash hook at .bkit/templates/.claude/hooks/preflight.sh runs as a
// Claude SessionStart hook (a different surface from the install-time TS
// preflight). Covered behaviour (BAR-186):
//   - IDE-skip path (empty LINEAR_ISSUE_ID exits 0 silently).
//   - Missing BKIT_LINEAR_API_KEY hard-stops when a Linear issue is present.

import { spawnSync } from "node:child_process";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

const SESSIONSTART_HOOK_PATH = path.join(
  __dirname,
  "..",
  "templates",
  ".claude",
  "hooks",
  "preflight.sh",
);

function runSessionStartHook(env: Record<string, string | undefined>): {
  status: number | null;
  stdout: string;
  stderr: string;
} {
  // Strip undefined keys so we don't leak the parent process env back in.
  const cleanEnv: Record<string, string> = {};
  for (const [k, v] of Object.entries(env)) {
    if (v !== undefined) cleanEnv[k] = v;
  }
  const result = spawnSync("bash", [SESSIONSTART_HOOK_PATH], {
    env: { PATH: process.env.PATH ?? "", ...cleanEnv },
    input: "{}",
    encoding: "utf-8",
    timeout: 10_000,
  });
  return {
    status: result.status,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
  };
}

describe("BAR-186 — SessionStart preflight.sh runtime behaviour", () => {
  it("exits 0 silently when LINEAR_ISSUE_ID is empty (existing IDE-skip preserved)", () => {
    const result = runSessionStartHook({});
    expect(result.status).toBe(0);
    expect(result.stdout).toBe("");
  });

  it("missing BKIT_LINEAR_API_KEY hard-stops when LINEAR_ISSUE_ID is present (regression guard)", () => {
    const result = runSessionStartHook({
      LINEAR_ISSUE_ID: "BAR-186-test",
      // no BKIT_LINEAR_API_KEY
    });
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("BKIT_LINEAR_API_KEY not set");
  });
});
