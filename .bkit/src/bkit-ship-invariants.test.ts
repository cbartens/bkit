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
