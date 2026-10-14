// audits/hooks/guardrails-antigravity.integration.test.ts — Antigravity shell gates on the
// host's live-verified contract: stdin `{ conversationId, toolCall: { name: "run_command",
// args: { CommandLine, Cwd } } }`, stdout `{ decision, reason }`. Runs the hook as install
// generates it (shared parts spliced in).
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { spawnSync } from "node:child_process";
import { afterAll, describe, expect, it } from "vitest";
import { readTemplate } from "../../render/parts";

const GENERATED = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-gr-antigravity-"));
afterAll(() => fs.rmSync(GENERATED, { recursive: true, force: true }));
const HOOK = path.join(GENERATED, "guardrails.cjs");
fs.writeFileSync(
  HOOK,
  readTemplate(path.resolve(".bkit/core/.agents/plugins/bkit/hooks/bkit-guardrails.cjs")),
);

let counter = 0;
function newConversation(): string {
  counter += 1;
  return `gr-ag-${process.pid}-${counter}-${Math.random().toString(36).slice(2)}`;
}

function run(
  command: string,
  conversationId = newConversation(),
  tool = "run_command",
): { decision?: string; reason?: string } {
  const res = spawnSync("node", [HOOK], {
    input: JSON.stringify({
      conversationId,
      toolCall: { name: tool, args: { CommandLine: command, Cwd: GENERATED, toolAction: "Run" } },
      workspacePaths: [GENERATED],
    }),
    encoding: "utf-8",
  });
  expect(res.status).toBe(0);
  return JSON.parse(res.stdout.trim()) as { decision?: string; reason?: string };
}

describe("antigravity guardrails.cjs — Antigravity contract", () => {
  it("denies the deny tier every time", () => {
    const conversation = newConversation();
    expect(run("git push --force origin main", conversation).decision).toBe("deny");
    expect(run("git push --force origin main", conversation).decision).toBe("deny");
    expect(run("rm -rf /").reason).toContain("Blocked by bkit Antigravity guardrails");
  });

  it("hands the ask tier to Antigravity's own approval prompt", () => {
    const r = run("git reset --hard HEAD~1");
    expect(r.decision).toBe("ask");
    expect(r.reason).toContain("PROHIBITED list");
  });

  it("delivers an advisory tier by denying once; the identical retry passes", () => {
    const conversation = newConversation();
    const first = run("sed -i '' 's/a/b/' src/index.ts", conversation);
    expect(first.decision).toBe("deny");
    expect(first.reason).toContain("edits files through the shell");
    expect(first.reason).toContain("repeat the same call to proceed");
    expect(run("sed -i '' 's/a/b/' src/index.ts", conversation)).toEqual({ decision: "allow" });
  });

  it("allows ordinary commands and other tools", () => {
    expect(run("pnpm test")).toEqual({ decision: "allow" });
    expect(run("rm -rf /", newConversation(), "view_file")).toEqual({ decision: "allow" });
  });

  it("fails open on malformed stdin", () => {
    const res = spawnSync("node", [HOOK], { input: "{not json", encoding: "utf-8" });
    expect(res.status).toBe(0);
    expect(JSON.parse(res.stdout)).toEqual({ decision: "allow" });
  });
});
