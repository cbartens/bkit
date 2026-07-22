// bkit-ci-dispatch-gate-alignment.integration.test.ts — ciDispatch FOLD reducer
// round-trip. A step-done record carrying ciDispatch folds cleanly through the
// #209 FOLD reducer — the additive field survives del(.type,.workflow) unchanged.
// Runs the reducer via real bash + jq subprocess against the jq string extracted
// verbatim from bkit-build.md.

import * as fs from "node:fs";
import * as path from "node:path";
import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";

const WORKFLOWS_DIR = path.resolve(".bkit/workflows");

function readWorkflow(name: string): string {
  return fs.readFileSync(path.join(WORKFLOWS_DIR, name), "utf-8");
}

const buildMd = readWorkflow("bkit-build.md");

// Extract the single-sourced FOLD reducer. #58 moved it out of bkit-build.md's
// inline `FOLD='...'` into BKIT_STATUS_FOLD in the shipped bkit-status-fold.sh;
// bkit-build.md now sources that script, so read the blob from the single source.
function extractFoldJq(_content: string): string | null {
  const foldShPath = path.resolve(".bkit/templates/.bkit/scripts/bkit-status-fold.sh");
  if (!fs.existsSync(foldShPath)) return null;
  const scriptContent = fs.readFileSync(foldShPath, "utf-8");
  const m = scriptContent.match(/BKIT_STATUS_FOLD='(def lastIdx[^']+)'/);
  return m ? m[1] : null;
}

describe("ciDispatch field — #209 FOLD reducer round-trip", () => {
  it("ciDispatch.outcome / .head / .attempts survive the FOLD reducer unchanged", () => {
    const foldJq = extractFoldJq(buildMd);
    expect(foldJq).not.toBeNull();

    const testSha = "abc123def456";
    // Fabricate a minimal status.jsonl with one workflow-started + one step-done carrying ciDispatch.
    const statusNdjson = [
      JSON.stringify({
        type: "workflow-started",
        workflow: "build",
        at: "2026-06-16T10:00:00Z",
      }),
      JSON.stringify({
        type: "step-done",
        workflow: "build",
        step: "build-close-workflow",
        status: "DONE",
        at: "2026-06-16T10:01:00Z",
        parentSha: testSha,
        artifacts: [],
        ciDispatch: {
          outcome: "dispatched",
          head: testSha,
          attempts: 1,
          retrigger: false,
        },
      }),
    ].join("\n");

    // Run the FOLD reducer via bash + jq, extract the ciDispatch field from the folded step.
    const script = `
echo '${statusNdjson.replace(/'/g, "'\\''")}' | jq -rs '
  ${foldJq}
  fold |
  [.[] | select(.workflow=="build")] | last |
  .steps[] | select(.step=="build-close-workflow") |
  .ciDispatch
'`;

    const result = execFileSync("bash", ["-c", script], { encoding: "utf-8" }).trim();
    const ciDispatch = JSON.parse(result) as {
      outcome: string;
      head: string;
      attempts: number;
      retrigger: boolean;
    };

    // Assert full values survive — not just key presence.
    expect(ciDispatch.outcome).toBe("dispatched");
    expect(ciDispatch.head).toBe(testSha);
    expect(ciDispatch.attempts).toBe(1);
    expect(ciDispatch.retrigger).toBe(false);
  });
});
