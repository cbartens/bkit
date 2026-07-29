// bkit-ship-invariants.test.ts — #384 SP1 T3 — Tier-2 push/staging/step-key contract.
//
// The RED half of the RED→GREEN Tier-2 invariant pair. Asserts the contracts
// the rewritten `bkit-ship.md` MUST hold (landed in SP2 Task 7), against the
// CURRENT pre-rewrite `bkit-ship.md`. As of SP1, every assertion in this file
// FAILS on the current prose — proving the test would catch a half-applied
// rewrite. SP2 Task 7 turns it GREEN.
//
// Reuses `stripFencedBlocks` from bkit-counter-prose-audit.test.ts so the
// audit runs against NON-FENCED prose only (fenced shell blocks are the
// migration target, not the source of truth — the test strips them and checks
// the surrounding orchestrator directives + the fenced blocks themselves for
// the literal command shape).
//
// "Prose" = the orchestrator directives + fenced shell blocks together. Some
// assertions need to see the fenced `git add` lines themselves (the
// `git add -A` ban); others need the directive prose (BOOK_ROOT presence).
// `stripFencedBlocks` is used selectively per assertion.

import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

const REPO_ROOT = path.resolve(__dirname, "../..");
const SHIP_MD = path.join(REPO_ROOT, ".bkit/workflows/bkit-ship.md");

/**
 * Strip all fenced code blocks (``` ... ``` or wider) from a markdown string.
 *
 * Verbatim copy of bkit-counter-prose-audit.test.ts:50-52 — kept local so the
 * Tier-2 invariant file is self-contained (the design's "self-contained
 * sub-plan" rule extends to its tests).
 */
function stripFencedBlocks(content: string): string {
  return content.replace(/^([ \t]*)(`{3,})[\w]*\n[\s\S]*?^[ \t]*\2[ \t]*$/gm, "");
}

function readShip(): string {
  return fs.readFileSync(SHIP_MD, "utf-8");
}

// ---------------------------------------------------------------------------
// FROZEN — canonical 14 ship-* step-key set
// ---------------------------------------------------------------------------
//
// Step NUMBERS may move; KEYS may not. Renaming resets attempt counters across
// three repos and orphans the Tier-3 detector corpus. Published here as the
// source of truth the rewrite (SP2 T7) must match. Verbatim from the design
// (§ Canonical `ship-*` step keys — stable schema).
//
// 14 keys total (the canonical ship step set).

export const CANONICAL_SHIP_STEP_KEYS: readonly string[] = [
  "ship-start-workflow",
  "ship-worktree-setup",
  "ship-regression-guard",
  "ship-conflict-resolve",
  "ship-deferred-sweep",
  "ship-merge-pr",
  "ship-failure-diagnose",
  "ship-failure-remediate",
  "ship-switch-to-dev",
  "ship-update-docs",
  "ship-summary",
  "ship-prune-skills",
  "ship-worktree-cleanup",
  "ship-close-workflow",
] as const;

// ---------------------------------------------------------------------------
// FROZEN — BOOK_PATHS 8-path staging allow-list
// ---------------------------------------------------------------------------
//
// Verbatim from the design (§ `BOOK_ROOT` / `BOOK_PATHS`). Every `git add` in
// bkit-ship.md MUST resolve via this list — never `-A`, never a bare `docs/`.
// Published in the test as the frozen list the rewrite must match.

export const BOOK_PATHS_ALLOW_LIST: readonly string[] = [
  "docs/plans/{YYYYMM}/logs/{FID}/",
  "docs/completed.md",
  "docs/deferrals.jsonl",
  "docs/failures.jsonl",
  "docs/knowledge.jsonl",
  "docs/decisions.jsonl",
  ".bkit/friction.jsonl",
  ".agents/skills",
  "skills-lock.json",
  // Host skill mirrors — `npx skills remove` in Step 11 deletes these alongside
  // .agents/skills/<name>, so they must be stageable or the deletions leak into
  // the working tree (they sat there across two ships before this was added).
  // Appended conditionally in Step 1: present-on-disk OR tracked, because a bare
  // `git add` on a pathspec matching neither is fatal.
  ".claude/skills",
  ".cursor/skills",
  ".opencode/skills",
] as const;

// ---------------------------------------------------------------------------
// NEGATIVE assertions — banned patterns
// ---------------------------------------------------------------------------

describe("bkit-ship.md — staging hygiene (banned patterns)", () => {
  it("has no `git add -A` anywhere (full content)", () => {
    const ship = readShip();
    // The literal `git add -A` must not appear in ANY step's fenced shell —
    // Finding 6 (commit staging whatever build/debug left dirty).
    expect(ship).not.toMatch(/\bgit\s+add\s+-A\b/);
  });

  it("has no blanket `git add -- docs/` (path-scoped staging only)", () => {
    const ship = readShip();
    // A bare `git add docs/...` (without an explicit log path or BOOK_PATHS)
    // stages whatever drifted under docs/ — Finding 6's docs-tree analogue.
    expect(ship).not.toMatch(/\bgit\s+add\s+--?\s+docs\/?\s*$/m);
    expect(ship).not.toMatch(/\bgit\s+add\s+docs\/(?!(plans\/\{YYYYMM\}\/logs\/\{FID\}))/);
  });
});

// ---------------------------------------------------------------------------
// NEGATIVE — no feat/{FID} commit/push outside the B2 (conflict-resolve) block
// ---------------------------------------------------------------------------

describe("bkit-ship.md — push-timing invariant (no feat/{FID} push before merge)", () => {
  it("has no `git commit` / `git push` to feat/{FID} outside the B2 conflict-resolve block", () => {
    const ship = readShip();
    // The push-timing invariant (design's sharpest departure): no ship
    // bookkeeping commit reaches origin/feat/{FID} before the merge.
    // Permitted ONLY inside the B2 conflict-resolve step's fenced block.
    // RED on current prose because Step 2/3/4/5/8/8b all commit on {BRANCH}.
    const lines = ship.split("\n");
    let inB2Block = false;
    let inFence = false;
    const violations: string[] = [];
    for (const line of lines) {
      if (/^```/.test(line)) {
        inFence = !inFence;
        continue;
      }
      // Track whether we are inside the conflict-resolve step's shell block.
      if (/ship-conflict-resolve/.test(line) || /conflict-resolve/.test(line)) {
        inB2Block = true;
      } else if (/^##\s/.test(line) || /^###\s/.test(line)) {
        // A new step header ends the B2 step scope.
        if (!/conflict-resolve/.test(line)) inB2Block = false;
      }
      if (inFence && /git\s+(commit|push)\b.*feat\/\{FID\}/.test(line) && !inB2Block) {
        violations.push(line.trim());
      }
    }
    expect(violations).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// POSITIVE — BOOK_ROOT / BOOK_PATHS presence (design's named conventions)
// ---------------------------------------------------------------------------

describe("bkit-ship.md — BOOK_ROOT / BOOK_PATHS named conventions", () => {
  it("defines BOOK_ROOT — the single tree every status/artifact write targets", () => {
    const ship = readShip();
    // RED on current prose — BOOK_ROOT does not exist yet.
    expect(ship).toMatch(/BOOK_ROOT/);
  });

  it("defines BOOK_PATHS — the frozen staging allow-list", () => {
    const ship = readShip();
    // RED on current prose — BOOK_PATHS does not exist yet.
    expect(ship).toMatch(/BOOK_PATHS/);
  });

  it("BOOK_PATHS resolves to the frozen 8-path allow-list (positive presence)", () => {
    const ship = readShip();
    // Every path in the design's frozen list must appear. RED on current prose
    // because none of these literal paths are gathered under a BOOK_PATHS
    // definition today (they appear ad-hoc).
    for (const p of BOOK_PATHS_ALLOW_LIST) {
      // The `{YYYYMM}` / `{FID}` placeholders are literal in the design.
      expect(ship).toContain(p);
    }
  });

  it("every `git add` in bkit-ship.md resolves via BOOK_PATHS (no literal path adds)", () => {
    const ship = readShip();
    // After the rewrite, fenced `git add` lines should reference $BOOK_PATHS
    // (or expand it), never stage a literal path or `-A`. RED on current prose
    // because today every step does `git add -A`.
    const lines = ship.split("\n");
    const violations: string[] = [];
    for (const line of lines) {
      if (!/\bgit\s+add\b/.test(line)) continue;
      // `git add` MUST be followed by `$BOOK_PATHS` (the staged allow-list).
      if (!/\bgit\s+add\b.*\$?BOOK_PATHS/.test(line)) {
        violations.push(line.trim());
      }
    }
    expect(violations).toEqual([]);
  });

  it("BOOK_ROOT carries the CAN_PUSH_DEV / RUNTIME_DEVPUSHES-conditional resolution (mode-3 path)", () => {
    // Prose presence check: the rewrite must state explicitly that BOOK_ROOT is
    // the dev tree when RUNTIME_DEVPUSHES=true (modes 1–2) and the adopt tree
    // when false (mode 3). RED on current prose because BOOK_ROOT is not
    // defined at all.
    const ship = readShip();
    expect(ship).toMatch(/BOOK_ROOT/);
    expect(ship).toMatch(/RUNTIME_DEVPUSHES/);
    // The two must co-occur (the conditional resolution text).
    const prose = stripFencedBlocks(ship);
    // A single sentence tying BOOK_ROOT to RUNTIME_DEVPUSHES is the minimum.
    // RED on current prose because no such sentence exists.
    const bookRootLines = prose.split("\n").filter((l) => /BOOK_ROOT/.test(l));
    const tiedToRuntime = bookRootLines.some((l) => /RUNTIME_DEVPUSHES|CAN_PUSH_DEV/.test(l));
    expect(tiedToRuntime).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// POSITIVE — every status.jsonl write resolves via BOOK_ROOT
// ---------------------------------------------------------------------------

describe("bkit-ship.md — status.jsonl writes resolve via BOOK_ROOT", () => {
  it("every status.jsonl write target carries BOOK_ROOT (Finding 4 dissolves)", () => {
    const ship = readShip();
    // Finding 4: the Failure Path resolves REPO_ROOT via --git-common-dir (dev
    // tree) while Steps 1–8 use --show-toplevel (worktree). The rewrite must
    // route every status.jsonl write through $BOOK_ROOT so a single variable
    // cannot resolve to two trees. RED on current prose because BOOK_ROOT is
    // not defined; today writes use `$(git rev-parse --show-toplevel)` and
    // `$REPO_ROOT` interchangeably.
    const lines = ship.split("\n");
    const violations: string[] = [];
    for (const line of lines) {
      if (!/status\.jsonl/.test(line)) continue;
      // A status.jsonl write/resolve line MUST reference $BOOK_ROOT.
      if (!/BOOK_ROOT/.test(line)) {
        violations.push(line.trim());
      }
    }
    expect(violations).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// POSITIVE — canonical 14 ship-* step-key set
// ---------------------------------------------------------------------------

describe("bkit-ship.md — canonical 14 ship-* step-key set", () => {
  it("publishes the canonical 14 ship-* step-key set (no invented names)", () => {
    // Finding 7: agents invent step names. The set must be present verbatim.
    // RED on current prose because the current step set is a mix of
    // ship-{name} and chore({FID}): {name} commit subjects — only a subset of
    // the canonical 14 keys are emitted as step-done rows today.
    const ship = readShip();
    const missing = CANONICAL_SHIP_STEP_KEYS.filter((k) => !ship.includes(`step:"${k}"`));
    expect(missing).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// POSITIVE — gh pr merge always carries --match-head-commit
// ---------------------------------------------------------------------------

describe("bkit-ship.md — gh pr merge carries --match-head-commit", () => {
  it("every `gh pr merge` carries --match-head-commit (no SHA drift on merge)", () => {
    const ship = readShip();
    // SC 1: the merge call refuses a head other than the validated one.
    // RED on current prose — Step 6's `gh pr merge {PR_NUMBER} --squash
    // --delete-branch` has NO --match-head-commit flag.
    const lines = ship.split("\n");
    const violations: string[] = [];
    for (const line of lines) {
      if (!/gh\s+pr\s+merge\b/.test(line)) continue;
      if (!/--match-head-commit/.test(line)) {
        violations.push(line.trim());
      }
    }
    expect(violations).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// POSITIVE — no dev-tree write between the two lock windows
// ---------------------------------------------------------------------------

describe("bkit-ship.md — no dev-tree write between dev-lock release + re-acquire", () => {
  it("documents the two dev-lock windows (release row + re-acquire row present)", () => {
    // The rewrite must publish BOTH the lock-release (after Steps 1–8 land
    // bookkeeping on the branch) AND the re-acquire (Step 9 switches to dev)
    // rows, with no dev-tree write between them. RED on current prose because
    // the lock windows are not structured this way today.
    const ship = readShip();
    expect(ship).toMatch(/\.dev\.lock/);
    // The release row + re-acquire row must BOTH be present.
    expect(ship).toMatch(/trap.*\.dev\.lock.*EXIT/);
  });
});

// ---------------------------------------------------------------------------
// POSITIVE — .deferred-blocked writer referenced under BOOK_ROOT
// ---------------------------------------------------------------------------

describe("bkit-ship.md — .deferred-blocked writer under BOOK_ROOT", () => {
  it("references a .deferred-blocked writer (not just rm -f / read)", () => {
    // Finding 2: .deferred-blocked has NO writer — only `rm -f` and a Failure
    // Path read. The rewrite must add the writer. RED on current prose because
    // today only `rm -f` and the Step 5 conditional read exist.
    const ship = readShip();
    // Look for a write idiom (`>` redirect or `touch`) targeting .deferred-blocked.
    const hasWriter =
      /\.\.?\W*deferred-blocked\b/.test(ship) &&
      (/>[> ]?.*\.deferred-blocked/.test(ship) || /touch\b.*\.deferred-blocked/.test(ship));
    expect(hasWriter).toBe(true);
  });

  it("the .deferred-blocked writer resolves via BOOK_ROOT", () => {
    const ship = readShip();
    // Even when the writer lands, it must write under $BOOK_ROOT (not the
    // worktree) so Step 12's worktree-remove does not destroy it.
    // RED on current prose because BOOK_ROOT is not defined.
    const lines = ship.split("\n");
    const writerLines = lines.filter(
      (l) => /\.deferred-blocked/.test(l) && (/>[> ]?/.test(l) || /touch\b/.test(l)),
    );
    expect(writerLines.length).toBeGreaterThan(0);
    const underBookRoot = writerLines.some((l) => /BOOK_ROOT/.test(l));
    expect(underBookRoot).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Build-challenge remediation regressions — one assertion per fixed finding
// ---------------------------------------------------------------------------
//
// These assertions target the 6 findings whose fix landed in this workflow
// markdown (Findings 1, 2, 3, 4a, 5, 7). Each would FAIL if the original bug
// were reintroduced. The remaining 3 findings (4b/c, 6, 8) are covered by
// bats behaviour tests in tests/ship-gate.bats (gate script + gh stub).

describe("bkit-ship.md — build-challenge remediation regressions", () => {
  // Finding 1 (CRITICAL): B2 conflict resolution was silently lost —
  // `git add $BOOK_PATHS` staged only bookkeeping, not the resolved source
  // files the conflict-resolve subagent wrote. Fix: `git add -u && git add
  // $BOOK_PATHS` (stages tracked modifications first, then bookkeeping).
  it("F1: B2 conflict-resolve stages tracked source modifications via 'git add -u' before bookkeeping", () => {
    const ship = readShip();
    const lines = ship.split("\n");
    // The B2 block is the ONLY fenced block that force-pushes feat/{FID}.
    // Match the shell command form (`... origin "feat/{FID}"`) — the prose
    // blockquote also mentions the flag but without `origin`.
    const forcePushIdx = lines.findIndex((l) =>
      /git\s+push\s+--force-with-lease\s+origin\b.*feat\/\{FID\}/.test(l),
    );
    expect(forcePushIdx, "B2 conflict-resolve force-push line not found").toBeGreaterThan(-1);
    // The staging + commit lines are within a few lines above the force-push.
    // (Fenced blocks in this workflow are indented under list items, so a
    // window-based scan is more robust than fence-boundary extraction.)
    const window = lines.slice(Math.max(0, forcePushIdx - 12), forcePushIdx + 1).join("\n");
    // Must contain `git add -u` (stages resolved tracked source files).
    expect(window).toMatch(/\bgit\s+add\s+-u\b/);
    // And must still stage bookkeeping via $BOOK_PATHS.
    expect(window).toMatch(/git\s+add.*BOOK_PATHS/);
  });

  // Finding 2 (HIGH): the ship-revalidate-timeout row was NEVER written — jq
  // rejected the single-quoted program containing `${SHIP_CI_WAIT_TIMEOUT_S:-1800}`
  // (literal braces inside jq = syntax error). Fix: pass via `--argjson timeout`.
  it("F2: ship-revalidate-timeout row passes timeout via --argjson (not literal \${} in jq program)", () => {
    const ship = readShip();
    const lines = ship.split("\n");
    const timeoutIdx = lines.findIndex((l) => l.includes("ship-revalidate-timeout"));
    expect(timeoutIdx, "ship-revalidate-timeout row writer not found").toBeGreaterThan(-1);
    const window = lines.slice(Math.max(0, timeoutIdx - 3), timeoutIdx + 3).join("\n");
    // Must pass the timeout via --argjson (not as a literal ${} in the jq program).
    expect(window).toContain("--argjson timeout");
    // The jq program must reference $timeout (not ${SHIP_CI_WAIT_TIMEOUT_S}).
    expect(window).toContain("timeout_s:$timeout");
  });

  // Finding 3 (HIGH): `gh pr update-branch` had no error guard — a 403/network/
  // protection failure silently proceeded to merge an unintegrated PR. Fix: add
  // `|| { echo ...; exit 1; }` so failure routes to Failure Path.
  it("F3: every fenced 'gh pr update-branch' call carries an error guard", () => {
    const ship = readShip();
    const lines = ship.split("\n");
    let inFence = false;
    const violations: string[] = [];
    for (const line of lines) {
      // Fenced blocks in this workflow are indented under list items, so
      // allow leading whitespace before the fence marker.
      if (/^\s*```/.test(line)) {
        inFence = !inFence;
        continue;
      }
      if (!inFence) continue;
      if (!/gh\s+pr\s+update-branch\b/.test(line)) continue;
      // Every fenced update-branch call must be guarded with || { ...; exit 1; }.
      if (!/\|\|\s*\{/.test(line)) {
        violations.push(line.trim());
      }
    }
    expect(violations).toEqual([]);
  });

  // Finding 4a (MEDIUM): STATUS_PATH was never exported by the workflow — the
  // gate's override audit row landed in a literal-brace junk path (or crashed
  // under set -u). Fix: `export STATUS_PATH=...` before the gate call.
  it("F4a: Step 6 exports STATUS_PATH before invoking the gate", () => {
    const ship = readShip();
    const lines = ship.split("\n");
    const gateIdx = lines.findIndex((l) => /bash\s+"\$GATE_SH"\s+assert/.test(l));
    expect(gateIdx, "gate invocation line not found").toBeGreaterThan(-1);
    // The `export STATUS_PATH=` must appear in the preceding window (same block).
    const window = lines.slice(Math.max(0, gateIdx - 10), gateIdx).join("\n");
    expect(window).toMatch(/export\s+STATUS_PATH=/);
  });

  // Finding 5 (MEDIUM): gate code 11 (in progress — poll) was a dead branch —
  // Step 6 routed ONLY 14/10 to Step 5, so code 11 fell through to Failure Path
  // instead of polling. Fix: route 11 to Step 5 alongside 10/14.
  it("F5: gate code 11 (poll) routes to Step 5 alongside codes 10 and 14", () => {
    const ship = readShip();
    const lines = ship.split("\n");
    // The routing directive must list code 11 alongside 10/14 routing to Step 5.
    const routingLine = lines.find((l) => /code\s+11/.test(l) && /Step\s+5/.test(l));
    expect(routingLine, "code 11 must be routed to Step 5 (not Failure Path)").toBeTruthy();
    // The same routing line must also mention codes 10 and 14 (all three poll-able codes together).
    expect(routingLine!).toMatch(/14/);
    expect(routingLine!).toMatch(/\b10\b/);
  });

  // Finding 7 (MEDIUM): `GATE_EXIT=$?` was unreachable under `set -e` — a gate
  // refusal (non-zero exit) aborted the script before the routing block ran.
  // Fix: initialise `GATE_EXIT=0` and use `|| GATE_EXIT=$?` so the exit code is
  // captured before `set -e` can fire.
  it("F7: gate invocation uses '|| GATE_EXIT=$?' to survive set -e", () => {
    const ship = readShip();
    const lines = ship.split("\n");
    let inFence = false;
    let gateInvocation: string | undefined;
    for (const line of lines) {
      // Fenced blocks in this workflow are indented under list items, so
      // allow leading whitespace before the fence marker.
      if (/^\s*```/.test(line)) {
        inFence = !inFence;
        continue;
      }
      if (!inFence) continue;
      if (/bash\s+"\$GATE_SH"\s+assert/.test(line)) {
        gateInvocation = line;
        break;
      }
    }
    expect(gateInvocation, "fenced gate invocation not found").toBeTruthy();
    // Must use the || GATE_EXIT=$? pattern (not a bare invocation + GATE_EXIT=$?).
    expect(gateInvocation!).toMatch(/\|\|\s*GATE_EXIT=\$\?/);
  });
});

// ---------------------------------------------------------------------------
// #363 build-challenge H2 regression — the `AUTO_ROUTE_SUFFIX` handoff
// ---------------------------------------------------------------------------
//
// H2 (HIGH): the FIRST attempt at threading `bkit [auto route]` onto the
// squash-merge `--subject` read `${LABELS:-}` directly inside the Step 5
// merge Bash block. `{LABELS}` is an MCP-derived value captured at Step 1,
// several separate Bash-tool-call boundaries earlier — shell state does not
// survive across those boundaries, so `${LABELS:-}` always expanded empty at
// Step 5, `AUTO_ROUTE_SUFFIX` was always "", and the squash-merge commit
// NEVER carried the marker. That is the entire mechanism #363 depends on to
// admit a post-merge `dev` CI run through bkit-cloud.yml's free-tier gate —
// the feature would have shipped silently inert. Fixed by materialising
// `AUTO_ROUTE_SUFFIX` into a `BKIT_AUTO_ROUTE_FILE` handoff (via
// `$GITHUB_ENV`) immediately adjacent to the Step 1 `{LABELS}` read, mirroring
// `bkit-build.md:1261` / `bkit-debug.md:1258-1262`, and reading it back at
// Step 5 with a same-block `{LABELS}` re-check only as a fallback.
describe("bkit-ship.md — #363 build-challenge H2 regression: AUTO_ROUTE_SUFFIX handoff survives the Step1->Step5 boundary", () => {
  it("Step 1 materialises AUTO_ROUTE_SUFFIX into BKIT_AUTO_ROUTE_FILE adjacent to the {LABELS} read (not deferred)", () => {
    const ship = readShip();
    // The Step 1 handoff-write block, keyed on its own unique anchor text.
    const idx = ship.indexOf(
      'echo "${LABELS:-}" | grep -q \'bkit:auto\' && AUTO_ROUTE_SUFFIX=" bkit [auto route]"',
    );
    expect(idx, "Step 1 AUTO_ROUTE_SUFFIX derivation not found").toBeGreaterThan(-1);
    const window = ship.slice(idx, idx + 400);
    // Must write the derived value to a temp file...
    expect(window).toMatch(/BKIT_AUTO_ROUTE_FILE=\$\(mktemp\)/);
    expect(window).toMatch(/printf\s+'%s'\s+"\$AUTO_ROUTE_SUFFIX"\s+>\s+"\$BKIT_AUTO_ROUTE_FILE"/);
    // ...and export the path via GITHUB_ENV so it survives into the later
    // Step 5 Bash-tool-call (a NEW shell — plain env/shell vars do not
    // survive that boundary, only $GITHUB_ENV-persisted ones do).
    expect(window).toMatch(/>>\s*"\$GITHUB_ENV"/);
  });

  it("Step 5 reads AUTO_ROUTE_SUFFIX from BKIT_AUTO_ROUTE_FILE (not a bare ${LABELS:-} re-read as primary)", () => {
    const ship = readShip();
    const subjectIdx = ship.indexOf('--subject "$(gh pr view {PR_NUMBER}');
    expect(subjectIdx, "squash --subject line not found").toBeGreaterThan(-1);
    const window = ship.slice(Math.max(0, subjectIdx - 600), subjectIdx + 120);
    // The suffix must actually be threaded onto the squash subject.
    expect(window).toContain("${AUTO_ROUTE_SUFFIX}");
    // PRIMARY path: read the handoff file written at Step 1.
    expect(window).toMatch(/if\s+\[\s+-n\s+"\$\{BKIT_AUTO_ROUTE_FILE:-\}"\s+\]/);
    expect(window).toMatch(/AUTO_ROUTE_SUFFIX=\$\(cat\s+"\$BKIT_AUTO_ROUTE_FILE"\)/);
    // FALLBACK only: a same-block {LABELS} re-check, gated behind the
    // handoff-file-missing branch (an `else`), never as the sole source.
    const elseIdx = window.indexOf("else");
    const fallbackReadIdx = window.indexOf('echo "${LABELS:-}"');
    expect(elseIdx, "fallback else branch not found").toBeGreaterThan(-1);
    expect(fallbackReadIdx).toBeGreaterThan(elseIdx);
  });

  it("the squash --subject is built in the SAME fenced block that derives AUTO_ROUTE_SUFFIX (no cross-block var reuse)", () => {
    const ship = readShip();
    const lines = ship.split("\n");
    let inFence = false;
    let fenceStart = -1;
    let fenceLines: string[] = [];
    let target: string[] | undefined;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (/^\s*```/.test(line)) {
        if (!inFence) {
          inFence = true;
          fenceStart = i;
          fenceLines = [];
        } else {
          inFence = false;
          if (fenceLines.some((l) => l.includes("--subject") && l.includes("AUTO_ROUTE_SUFFIX"))) {
            target = fenceLines;
          }
        }
        continue;
      }
      if (inFence) fenceLines.push(line);
    }
    expect(fenceStart, "fence containing --subject...AUTO_ROUTE_SUFFIX not found").toBeGreaterThan(
      -1,
    );
    expect(
      target,
      "no single fenced block derives AND consumes AUTO_ROUTE_SUFFIX together",
    ).toBeDefined();
    expect(target!.join("\n")).toMatch(/AUTO_ROUTE_SUFFIX=""/);
  });
});
