// audits/workflows/ci-dispatch-gate-alignment.test.ts — workflow-side wiring of the
// CI-Dispatch Gate and of ship's own re-validate poll.
//
// The gate itself — poll, one clean re-trigger, the four outcomes, every
// unresolved sub-reason (retrigger-suppressed, ci-declared-no-run,
// gh-error), the agent turn-loop hand-off, the capstone namespace, the
// auto-route suffix from `--label`, the local verdict row, and "nothing is
// pushed after the verdict" — is `bkit runs dispatch`, covered in
// commands/workflow/runs.test.ts. Ship's probe-first re-validate is `bkit runs
// revalidate`, covered there too. What stays here is what the workflows must
// do around them:
//   - build and debug each run the gate after their last push, with labels
//     re-read from the tracker and the row's file and step named;
//   - nothing is committed or pushed after the gate in its block (KN-11);
//   - ship stays out of the gate, re-validates through `runs revalidate`, and
//     bounds a gate-refusal re-entry.

import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";
import { getWorkflowsRoot } from "../../shared/package-roots";

const REPO_ROOT = path.resolve(__dirname, "../../../../..");
const WORKFLOWS_DIR = getWorkflowsRoot();

function readWorkflow(name: string): string {
  return fs.readFileSync(path.join(WORKFLOWS_DIR, name), "utf-8");
}

const buildMd = readWorkflow("bkit-build.md");
const debugMd = readWorkflow("bkit-debug.md");
const shipMd = readWorkflow("bkit-ship.md");

/** Fenced bash bodies, `\`-continuations joined so one command is one line. */
function fences(content: string): string[] {
  return [...content.matchAll(/^[ \t]*```bash\n([\s\S]*?)^[ \t]*```/gm)].map((m) =>
    m[1]!.replace(/\\\n\s*/g, " "),
  );
}

const dispatchFences = (md: string) =>
  fences(md).filter((f) => /"\{BKIT\}" runs dispatch\b/.test(f));

// ---------------------------------------------------------------------------
// 1. Build and debug run the gate, once each, and record its verdict locally
// ---------------------------------------------------------------------------
describe.each([
  ["bkit-build.md", buildMd],
  ["bkit-debug.md", debugMd],
] as const)("%s — CI-Dispatch gate wiring", (name, md) => {
  it("runs bkit runs dispatch in exactly one block", () => {
    // Debug's PR-mode close and its created-PR path share one block.
    expect(dispatchFences(md)).toHaveLength(1);
  });

  it("passes the re-read labels, so the re-trigger subject carries the auto-route suffix", () => {
    const f = dispatchFences(md)[0]!;
    expect(f, name).toMatch(/"\{BKIT\}" runs dispatch [^\n]*\{LABEL_FLAGS\}/);
    expect(f).not.toContain("--auto-route-suffix");
  });

  it("passes the held PR number, so a runtime without gh never needs it to find the PR", () => {
    // Without --pr, runs dispatch asks gh for the PR and exits 80 before it
    // reads the turn loop's --poll-result, so every re-entry exits 80 again.
    const f = dispatchFences(md)[0]!;
    expect(f).toMatch(/"\{BKIT\}" runs dispatch [^\n]*--pr="?\{PR_NUMBER\}"?/);
  });

  it("names the status file and the step whose row records the ciDispatch verdict", () => {
    const f = dispatchFences(md)[0]!;
    expect(f).toMatch(/"\{BKIT\}" runs dispatch [^\n]*--file="\{STATUS\}"/);
    expect(f).toMatch(/"\{BKIT\}" runs dispatch [^\n]*(--step=[a-z-]+|\{DISPATCH_ROW\})/);
    expect(f).not.toMatch(/steps done [^\n]*ciDispatch/);
  });

  it("never commits or pushes after the gate — the verdict stays local (KN-11)", () => {
    const f = dispatchFences(md)[0]!;
    const after = f.slice(f.indexOf('"{BKIT}" runs dispatch'));
    expect(after).not.toMatch(/\bgit\s+(-C\s+"[^"]+"\s+)?(push|commit)\b/);
    expect(after).not.toMatch(/"\{BKIT\}" (branches push|ledgers commit)\b/);
    expect(after).not.toMatch(/--commit=(?!none)/);
  });

  it("the push the gate polls refuses a skip-CI HEAD (--require-ci)", () => {
    // A `[skip ci]` HEAD would fire no run, so the gate would only ever see
    // its own suppression.
    expect(
      fences(md).some((f) => /"\{BKIT\}" branches push --mode=feature [^\n]*--require-ci/.test(f)),
    ).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 2. Ship has NO CI-Dispatch gate
// ---------------------------------------------------------------------------
describe("bkit-ship.md — no CI-Dispatch gate", () => {
  it("never calls bkit runs dispatch", () => {
    expect(shipMd).not.toMatch(/"\{BKIT\}" runs dispatch\b/);
  });
});

// ---------------------------------------------------------------------------
// 3. Ship Step 9 re-validates through `bkit runs revalidate`
//
// Step 9 can FOLLOW a head move (Path B `bkit prs update-branch`) that already
// fired a run at that SHA, so the command probes first and dispatches only when
// none is present; it probes at VALIDATED_HEAD, not the PR head (ship's own
// `[skip ci]` bookkeeping commit never gets a run). All of that is pinned in
// commands/workflow/runs.test.ts; here: the workflow hands it what it needs.
// ---------------------------------------------------------------------------
describe("bkit-ship.md — Step 9 re-validates through runs revalidate", () => {
  const step9 = fences(shipMd).find((f) => /"\{BKIT\}" runs revalidate\b/.test(f));

  it("runs it once, with the entry head, the code head, the branch and the status file", () => {
    expect(step9, "Step 9 runs revalidate block not found").toBeDefined();
    for (const flag of [
      '--pr="{PR_NUMBER}"',
      '--entry-head="{ENTRY_HEAD}"',
      '--code-head="{CODE_HEAD}"',
      '--branch="{SHIP_BRANCH}"',
      '--file="{STATUS}"',
      '--reason="{REVALIDATE_REASON}"',
    ]) {
      expect(step9!).toContain(flag);
    }
    expect(fences(shipMd).filter((f) => /"\{BKIT\}" runs revalidate\b/.test(f))).toHaveLength(1);
  });

  it("dispatches only through the command — no hand-rolled gh workflow run anywhere", () => {
    expect(shipMd).not.toMatch(/gh workflow run\b/);
  });

  it("never names a hard-coded ci.yml (the CI file comes from bkit.ciWorkflow)", () => {
    expect(shipMd).not.toMatch(/\bci\.yml\b/);
  });

  it("keeps ship free of the gate's outcome vocabulary (probe is never a pass condition)", () => {
    expect(shipMd).not.toContain('"self-healed"');
    expect(shipMd).not.toContain('"no-ci"');
  });
});

// ---------------------------------------------------------------------------
// 4. Step 10 gate refusal re-enters Step 9 as a POLL, and is bounded.
//
// Codes 10/11/14/17 route back to Step 9 with REVALIDATE_REASON = gate-refusal,
// which makes `runs revalidate` poll even at an unchanged head — for code 10 an
// unbounded loop otherwise, with nothing in it able to change the gate's answer.
// ---------------------------------------------------------------------------
describe("bkit-ship.md — Step 10 gate-refusal re-entry is a bounded poll", () => {
  it("a refusal re-enters Step 9 as gate-refusal", () => {
    expect(shipMd).toContain("set `{REVALIDATE_REASON}` = `gate-refusal` → Step 9");
  });

  it("re-validate sits after the deferred sweep and the bookkeeping commit, before the merge gate", () => {
    // The refusal route jumps straight to Step 9, so the sweep and the
    // bookkeeping commit stay first-pass-only.
    const order = [
      /^## .*Step \d+ — Deferred Sweep$/m,
      /^## .*Step \d+ — Commit \+ Push Bookkeeping$/m,
      /^## .*Step \d+ — Re-validate$/m,
      /^## .*Step \d+ — Merge Gate/m,
    ];
    const idx = order.map((h) => shipMd.search(h));
    expect(
      idx.every((i) => i > -1),
      `missing heading in ${JSON.stringify(idx)}`,
    ).toBe(true);
    expect([...idx].sort((a, b) => a - b)).toEqual(idx);
  });

  it("bounds the re-entry by MAX_REVALIDATE_ATTEMPT through bkit counters route, never a local value", () => {
    expect(shipMd).toMatch(
      /"\{BKIT\}" counters route --name=REVALIDATE_ATTEMPT --value="\$REVALIDATE_ATTEMPT" --limit=MAX_REVALIDATE_ATTEMPT --continue=step-9 --exceeded=failure-path/,
    );
    // The value lives in `bkit counters max` (commands/workflow/counters.ts).
    expect(shipMd).not.toMatch(/^\s*MAX_REVALIDATE_ATTEMPT=/m);
  });

  it("derives the attempt from this run's ship-revalidate-dispatch rows via bkit counters rows", () => {
    // Run scoping (a resumed run does not inherit a prior run's rows) is
    // pinned in commands/workflow/counters.test.ts 'bkit counters rows'.
    const block = fences(shipMd).find((f) =>
      /"\{BKIT\}" counters route --name=REVALIDATE_ATTEMPT\b/.test(f),
    );
    expect(block, "REVALIDATE_ATTEMPT routing block not found").toBeDefined();
    expect(block!).toContain(
      'REVALIDATE_ATTEMPT=$("{BKIT}" counters rows --file="{STATUS}" --workflow=ship --type=ship-revalidate-dispatch --position=next | jq -er .value) || exit 2',
    );
    expect(block!).not.toMatch(/REVALIDATE_ATTEMPT=\$\(jq\b/);
  });
});

// ---------------------------------------------------------------------------
// 5. Debug's close decides PR-creation from LIVE PR state, not Step-1 PUSH_MODE
//
// `PUSH_MODE` is written once at Step 1: it cannot see a PR opened mid-run and
// drifts under context compaction. The close probes `bkit prs probe` and sets
// `TRIGGER_PR` from the answer, adopts a PR that appeared with
// `bkit prs open --existing=reuse`, and runs the gate on every feature-branch
// close so a missing run trips the Failure Path instead of passing silently.
// ---------------------------------------------------------------------------
describe("bkit-debug.md — close decides from live PR state", () => {
  it("probes the live PR for the close branch on any base, before the close commit", () => {
    const blocks = fences(debugMd);
    const probeAt = blocks.findIndex(
      (f) => /"\{BKIT\}" prs probe\b/.test(f) && /--head="?\{BRANCH\}"?/.test(f),
    );
    expect(probeAt, "close `bkit prs probe` block not found").toBeGreaterThan(-1);
    // A PR into another base must read as open, or `prs open --existing=reuse` opens a second.
    expect(blocks[probeAt]!).not.toContain("--base");
    const closeAt = blocks.findIndex((f) => /"\{BKIT\}" workflows close\b/.test(f));
    expect(closeAt).toBeGreaterThan(probeAt);
  });

  it("adopts a PR opened mid-run instead of blind-creating", () => {
    const open = fences(debugMd).find((f) => /"\{BKIT\}" prs open\b/.test(f));
    expect(open, "close `bkit prs open` block not found").toBeDefined();
    expect(open!).toContain("--existing=reuse");
  });

  it("sets TRIGGER_PR from {PR_OPEN}, never from the Step-1 PUSH_MODE", () => {
    const start = debugMd.indexOf("Set `TRIGGER_PR`");
    expect(start, "TRIGGER_PR decision block not found").toBeGreaterThan(-1);
    const block = debugMd.slice(start, start + 400);
    expect(block).toContain("`{PR_OPEN}` = 1");
    expect(block).not.toContain("`PUSH_MODE` = PR");
    expect(block).not.toContain("`PUSH_MODE` = LOCAL");
  });

  it("runs the CI-Dispatch gate on every feature-branch close", () => {
    expect(debugMd).toMatch(/\*\*Run only if\*\* `\{PR_OPEN\}` = 1 \*\*or\*\* `TRIGGER_PR` = 1/);
  });
});
