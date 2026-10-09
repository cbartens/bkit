// bkit-ci-dispatch-gate-alignment.test.ts — workflow-side wiring of the
// CI-Dispatch Gate (#261) and of ship's own re-validate poll.
//
// The gate itself — poll, one clean re-trigger, the four outcomes, every
// unresolved sub-reason (retrigger-suppressed, autoroute-mismatch,
// ci-declared-no-run, gh-error), the agent turn-loop hand-off, the capstone
// namespace, and "nothing is pushed after the verdict" — is `bkit runs
// dispatch`, covered in commands/workflow/runs.test.ts. What stays here is
// what the workflows must do around it:
//   - build and debug each run it after their last push, with the auto-route
//     suffix read from the tracker in the same block;
//   - the verdict is recorded as a local step-done row and never committed or
//     pushed (a pushed `[skip ci]` record would empty the PR's check rollup —
//     KN-11);
//   - a hand-off (80 / 81) records nothing;
//   - ship stays out of the gate and re-validates with a probe-first,
//     bounded poll.

import * as fs from "node:fs";
import * as path from "node:path";
import { execFileSync } from "node:child_process";
import * as os from "node:os";
import { afterEach, describe, expect, it } from "vitest";

const REPO_ROOT = path.resolve(__dirname, "../..");
const WORKFLOWS_DIR = path.resolve(REPO_ROOT, ".bkit/workflows");

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

const dispatchFences = (md: string) => fences(md).filter((f) => /"\$BKIT" runs dispatch\b/.test(f));

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

  it("reads the auto-route suffix from the tracker in the same block, exact-matched", () => {
    const f = dispatchFences(md)[0]!;
    const derive = f.search(
      /gh issue view \{ISSUE_ID\} --json labels --jq '\.labels\[\]\.name' .*grep -qxF 'bkit:auto' && AUTO_ROUTE_SUFFIX=" bkit \[auto route\]"/,
    );
    const call = f.search(/"\$BKIT" runs dispatch .*--auto-route-suffix="\$AUTO_ROUTE_SUFFIX"/);
    expect(derive, `${name}: AUTO_ROUTE_SUFFIX not derived in the dispatch block`).toBeGreaterThan(
      -1,
    );
    expect(call, `${name}: runs dispatch does not take the derived suffix`).toBeGreaterThan(derive);
  });

  it("records the ciDispatch verdict as a local step-done row, after a hand-off exit is passed out", () => {
    const f = dispatchFences(md)[0]!;
    const call = f.indexOf('"$BKIT" runs dispatch');
    const record = f.search(/"\$BKIT" steps done [^\n]*--field=?"?ciDispatch=/);
    expect(record, `${name}: no steps done --field=ciDispatch after the gate`).toBeGreaterThan(
      call,
    );
    expect(f.slice(record)).toMatch(/^[^\n]*--commit=none/);
    // 80 / 81 (hand the poll to the agent's turn loop) leave before the row is
    // written; the block is re-run with the turn loop's result.
    const between = f.slice(call, record);
    expect(between).toMatch(/case "\$RC" in [^\n]*\bexit "\$RC"/);
  });

  it("never commits or pushes after the gate — the verdict stays local (KN-11)", () => {
    const f = dispatchFences(md)[0]!;
    const after = f.slice(f.indexOf('"$BKIT" runs dispatch'));
    expect(after).not.toMatch(/\bgit\s+(-C\s+"[^"]+"\s+)?(push|commit)\b/);
    expect(after).not.toMatch(/"\$BKIT" (branches push|ledgers commit)\b/);
    expect(after).not.toMatch(/--commit=(?!none)/);
  });

  it("the push the gate polls refuses a skip-CI HEAD (--require-ci)", () => {
    // A `[skip ci]` HEAD would fire no run, so the gate would only ever see
    // its own suppression.
    expect(
      fences(md).some((f) => /"\$BKIT" branches push --mode=feature [^\n]*--require-ci/.test(f)),
    ).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 2. Ship has NO CI-Dispatch gate
// ---------------------------------------------------------------------------
describe("bkit-ship.md — no CI-Dispatch gate", () => {
  it("never calls bkit runs dispatch", () => {
    expect(shipMd).not.toMatch(/"\$BKIT" runs dispatch\b/);
  });
});

// ---------------------------------------------------------------------------
// 3. Ship Step 9 probes before dispatching (no duplicate CI run)
//
// Step 9 re-validate can FOLLOW a head move (Path B `gh pr update-branch`) that
// already fired a `pull_request` run at that same SHA; dispatching
// unconditionally produced a second, redundant run every time. The probe
// targets VALIDATED_HEAD, not the PR head — the PR head is ship's own
// `[skip ci]` bookkeeping commit, which never gets a run. `bkit runs wait
// --dispatch-if-absent` owns probe-then-dispatch (commands/workflow/runs.test.ts);
// the probe is never a pass condition — the completion poll and `bkit runs gate`
// at Step 10 own the verdict.
// ---------------------------------------------------------------------------
describe("bkit-ship.md — Step 9 probes before dispatching (no duplicate CI run)", () => {
  const step9 = fences(shipMd).find((f) => /"\$BKIT" runs wait [^\n]*--dispatch-if-absent/.test(f));

  it("dispatches only through the probe — no hand-rolled gh workflow run anywhere", () => {
    expect(step9, "Step 9 probe-then-dispatch block not found").toBeDefined();
    expect(shipMd).not.toMatch(/gh workflow run\b/);
  });

  it("never names a hard-coded ci.yml (the CI file comes from bkit.ciWorkflow)", () => {
    expect(shipMd).not.toMatch(/\bci\.yml\b/);
  });

  it("probes for a run at VALIDATED_HEAD, then polls completion at the same head", () => {
    const probe = step9!.search(
      /"\$BKIT" runs wait --head="\$VALIDATED_HEAD" [^\n]*--until=present [^\n]*--dispatch-if-absent/,
    );
    const poll = step9!.search(
      /"\$BKIT" runs wait --head="\$VALIDATED_HEAD" [^\n]*--until=completed/,
    );
    expect(probe).toBeGreaterThan(-1);
    expect(poll).toBeGreaterThan(probe);
  });

  it("records the probe outcome in a ship-revalidate-dispatch row", () => {
    expect(step9!).toMatch(/type:"ship-revalidate-dispatch"[^\n]*dispatched:\.dispatched/);
  });

  it("keeps ship free of the gate's outcome vocabulary (probe is never a pass condition)", () => {
    expect(shipMd).not.toContain('"self-healed"');
    expect(shipMd).not.toContain('"no-ci"');
  });
});

// ---------------------------------------------------------------------------
// 4. Step 10 gate refusal re-enters Step 9 as a POLL, and is bounded.
//
// Codes 10/11/14/17 route back to Step 9. Before this, the poll was gated on
// `CURRENT_HEAD != ENTRY_HEAD` alone, so a refusal at an UNCHANGED head skipped
// the poll entirely — for code 10 an unbounded loop with nothing in it able to
// change the gate's answer.
// ---------------------------------------------------------------------------
describe("bkit-ship.md — Step 10 gate-refusal re-entry is a bounded poll", () => {
  it("Step 9 also polls on a gate-refusal re-entry, not head movement alone", () => {
    expect(shipMd).toContain(
      'if [ "$VALIDATED_HEAD" != "$ENTRY_HEAD" ] || [ "$REVALIDATE_REASON" = "gate-refusal" ]; then',
    );
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
      /"\$BKIT" counters route --name=REVALIDATE_ATTEMPT --value="\$REVALIDATE_ATTEMPT" --limit=MAX_REVALIDATE_ATTEMPT --continue=step-9 --exceeded=failure-path/,
    );
    // The value lives in `bkit counters max` (commands/workflow/counters.ts).
    expect(shipMd).not.toMatch(/^\s*MAX_REVALIDATE_ATTEMPT=/m);
  });

  describe("the attempt counts only re-validate rows written since this run started", () => {
    // An all-runs count would carry a prior ship's spent budget into a resumed
    // run and refuse a legitimate first poll. Runs the derivation as written.
    const dirs: string[] = [];
    afterEach(() => {
      for (const d of dirs.splice(0)) fs.rmSync(d, { recursive: true, force: true });
    });

    function attempt(rows: object[]): string {
      const block = fences(shipMd).find((f) => /^\s*REVALIDATE_ATTEMPT=\$\(jq -s/m.test(f));
      expect(block, "REVALIDATE_ATTEMPT derivation block not found").toBeDefined();
      const derive = block!
        .split("\n")
        .filter((l) => !/"\$BKIT" counters route\b/.test(l))
        .join("\n");
      const dir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-revalidate-"));
      dirs.push(dir);
      const status = path.join(dir, "status.jsonl");
      fs.writeFileSync(status, rows.map((r) => `${JSON.stringify(r)}\n`).join(""));
      return execFileSync(
        "bash",
        ["-c", `${derive.replaceAll("{STATUS}", status)}\nprintf '%s' "$REVALIDATE_ATTEMPT"`],
        { encoding: "utf-8" },
      );
    }

    const start = (at: string) => ({
      type: "step-done",
      workflow: "ship",
      step: "ship-start-workflow",
      at,
    });
    const dispatch = (at: string) => ({ type: "ship-revalidate-dispatch", workflow: "ship", at });

    it("a resumed run does not inherit the previous run's re-validate rows", () => {
      expect(
        attempt([
          start("2026-10-01T00:00:00Z"),
          dispatch("2026-10-01T00:10:00Z"),
          dispatch("2026-10-01T00:20:00Z"),
          start("2026-10-02T00:00:00Z"),
        ]),
      ).toBe("1");
    });

    it("counts this run's re-validate rows", () => {
      expect(
        attempt([
          start("2026-10-02T00:00:00Z"),
          dispatch("2026-10-02T00:10:00Z"),
          dispatch("2026-10-02T00:20:00Z"),
        ]),
      ).toBe("3");
    });
  });
});
