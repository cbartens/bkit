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

// #446: the frozen staging allow-list moved out of bkit-ship.md's prose and
// into bkit-book-commit.sh (git ls-files-built pathspec, never shell
// word-splitting / an `ls` glob that aborts under zsh when unmatched).
const BOOK_SCRIPT = path.join(REPO_ROOT, ".bkit/templates/.bkit/scripts/bkit-book-commit.sh");

function readBookScript(): string {
  return fs.readFileSync(BOOK_SCRIPT, "utf-8");
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
// FROZEN — bookkeeping staging allow-list
// ---------------------------------------------------------------------------
//
// Verbatim from the design (§ `BOOK_ROOT` / `BOOK_PATHS`). Every stage/commit
// in bkit-ship.md MUST resolve via this list (now built inside
// bkit-book-commit.sh, #446) — never `-A`, never a bare `docs/`. Published in
// the test as the frozen list the rewrite must match. The FID/YYYYMM log-dir
// entry is checked separately below in its script form (`$MONTH`/`$FID`
// shell variables + a trailing `/*` glob, not the literal `{YYYYMM}`/`{FID}`
// template placeholders bkit-ship.md's own prose still uses).

export const BOOK_PATHS_ALLOW_LIST: readonly string[] = [
  // Generated roadmap board — a .md, so the script's `docs/*.jsonl` glob does
  // not reach it and it must be named literally. Its ledger source
  // (.bkit/issues.jsonl) is covered by that glob and is asserted as the glob
  // below, not as a literal path.
  "docs/roadmap.md",
  "docs/deferrals.jsonl",
  "docs/failures.jsonl",
  "docs/knowledge.jsonl",
  "docs/decisions.jsonl",
  ".bkit/friction.jsonl",
  // Close telemetry — the close step appends compliance/counter/outcome rows to
  // .bkit/stats.jsonl BEFORE the close commit, so an allow-list without it wrote
  // them and never staged them (they stranded dirty after every ship). Pairs with
  // .bkit/friction.jsonl; same ledger pair as the pre-worktree allow-list.
  ".bkit/stats.jsonl",
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

  it("wires bookkeeping staging through bkit-book-commit.sh (#446 — frozen allow-list moved into the script)", () => {
    const ship = readShip();
    expect(ship).toMatch(/bkit-book-commit\.sh/);
  });

  it("bkit-book-commit.sh resolves to the frozen allow-list (positive presence)", () => {
    const script = readBookScript();
    // Every path in the design's frozen list must appear in the script that
    // now builds the pathspec (git ls-files, never shell globbing).
    for (const p of BOOK_PATHS_ALLOW_LIST) {
      expect(script).toContain(p);
    }
    // FID/YYYYMM log-dir entry, in the script's own form ($MONTH/$FID shell
    // variables + a trailing glob, not bkit-ship.md's literal placeholders).
    expect(script).toContain('"docs/plans/$MONTH/logs/$FID/*"');
    // .bkit/issues.jsonl reaches the pathspec via this glob, never as a literal
    // path — assert the glob so the ledger's staging route stays covered.
    expect(script).toContain('"docs/*.jsonl"');
  });

  it("the roadmap migration is complete — no docs/completed.md anywhere in the staging seam", () => {
    // #380 deleted docs/completed.md in favour of .bkit/issues.jsonl. A merge
    // with a branch predating that deletion silently reintroduces the path
    // (it did, on 2026-08-26); these assertions fail loudly if it happens again.
    expect(readBookScript()).not.toContain("docs/completed.md");
    expect(BOOK_PATHS_ALLOW_LIST).not.toContain("docs/completed.md");
    const repoBookScript = fs.readFileSync(
      path.join(REPO_ROOT, ".bkit/scripts/bkit-book-commit.sh"),
      "utf-8",
    );
    expect(repoBookScript).not.toContain("docs/completed.md");
    const version = fs.readFileSync(path.join(REPO_ROOT, ".bkit/version"), "utf-8");
    expect(version).not.toContain("docs/completed.md");
  });

  it("every `git add` in bkit-ship.md resolves via bkit-book-commit.sh (no literal path adds)", () => {
    const ship = readShip();
    // After #446, fenced `git add` lines in bkit-ship.md must not exist at
    // all — every stage/commit routes through bkit-book-commit.sh instead of
    // a literal `git add <path>` in the workflow markdown.
    const violations = ship.split("\n").filter((line) => /\bgit\s+add\b/.test(line));
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
// POSITIVE — ship verdict reader resolves .bkit/issues.jsonl under BOOK_ROOT
// ---------------------------------------------------------------------------

describe("bkit-ship.md — SHIPPED_HIT verdict reader resolves under BOOK_ROOT (#380)", () => {
  it("the SHIPPED_HIT jq read targets $BOOK_ROOT/.bkit/issues.jsonl, never a bare relative path", () => {
    const ship = readShip();
    const lines = ship.split("\n");
    const shippedHitLine = lines.find((l) => /SHIPPED_HIT=\$\(/.test(l));
    expect(shippedHitLine, "SHIPPED_HIT assignment line not found").toBeTruthy();
    // Every other book-path read/write in this file resolves via $BOOK_ROOT
    // (status.jsonl, .deferred-blocked). The ship-verdict reader must not be
    // the one path that reads a bare relative `.bkit/issues.jsonl` — that
    // silently resolves against the CURRENT WORKING DIRECTORY (worktree),
    // not the dev tree the writer targets, and would FAIL to find a row the
    // writer correctly wrote.
    expect(shippedHitLine!).toMatch(/\$BOOK_ROOT\/\.bkit\/issues\.jsonl/);
    expect(shippedHitLine!).not.toMatch(/[^/$]\.bkit\/issues\.jsonl/);
  });

  it("the SHIPPED feature-row append is mechanical at Step 10, not the update-docs prompt", () => {
    const ship = readShip();
    expect(ship).toMatch(/--arg step "ship-update-docs"/);
    expect(ship).toMatch(/ISSUES_JSONL="\$BOOK_ROOT\/\.bkit\/issues\.jsonl"/);
    expect(ship).toMatch(/\.status="SHIPPED"/);
    const prompt = fs.readFileSync(
      path.join(REPO_ROOT, ".bkit/prompts/bkit-ship-update-docs.md"),
      "utf-8",
    );
    expect(prompt).not.toMatch(/issues\.jsonl/);
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
  // files the conflict-resolve subagent wrote. Fix: stage tracked
  // modifications first, then bookkeeping, before the single commit. #446
  // moved this into bkit-book-commit.sh's `--stage-tracked-updates` flag
  // (runs `git add -u` internally before building the bookkeeping pathspec).
  it("F1: B2 conflict-resolve stages tracked source modifications before bookkeeping", () => {
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
    // Must stage tracked source modifications (`--stage-tracked-updates`)
    // AND bookkeeping (`bkit-book-commit.sh`) before the commit/push.
    expect(window).toMatch(/--stage-tracked-updates/);
    expect(window).toMatch(/bkit-book-commit\.sh/);
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
    // One lead-in lists all three poll-able codes; the block it introduces owns
    // the Step 5 route, so the destination sits on the exit-code bullets below.
    const idx = lines.findIndex((l) => /code\s+11/.test(l));
    expect(idx, "code 11 must have a routing lead-in").toBeGreaterThan(-1);
    expect(lines[idx]).toMatch(/14/);
    expect(lines[idx]).toMatch(/\b10\b/);
    const block = lines.slice(idx, idx + 20).join("\n");
    expect(block, "codes 10/11/14 must route to Step 5, not Failure Path").toMatch(
      /\*\*If\*\* exit 0 \(printed `step-5`\).*Step 5\./,
    );
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
// H2 (HIGH): threading `bkit [auto route]` onto the squash-merge `--subject`
// originally read `${LABELS:-}` inside the Step 5 merge Bash block. `{LABELS}`
// is an MCP-derived TEMPLATE value — it is never assigned as a shell variable
// anywhere in `.bkit/`, so `${LABELS:-}` expanded empty in every runtime,
// `AUTO_ROUTE_SUFFIX` was always "", and the squash-merge commit NEVER carried
// the marker. That is the entire mechanism #363 depends on to admit a
// post-merge `dev` CI run through bkit-cloud.yml's free-tier gate — the
// feature would have shipped silently inert.
//
// The first repair attempt (a `mktemp` + `$GITHUB_ENV` handoff written next to
// the Step 1 read) did NOT fix it: `$GITHUB_ENV` is applied by the Actions
// runner only BETWEEN workflow steps, and every agent Bash tool call in a
// cloud dispatch runs inside the single `claude-code-action` step, so the
// variable never reappeared at Step 5. The tests that guarded it asserted only
// that the handoff TEXT was present, so they passed on a wholly inert
// mechanism.
//
// Fixed by removing cross-call state entirely: Step 5 re-derives the label
// from the tracker in the SAME fence that consumes it
// (docs/knowledge.jsonl, key
// `363-workflow-md-shell-var-does-not-survive-bash-tool-call-boundary`,
// idiom 1). These assertions are shape-level guards only — the behavioural
// proof (execute the fence against a `gh` stub, assert the rendered
// `--subject`) lives in bkit-auto-route-marker.integration.test.ts.
describe("bkit-ship.md — #363 build-challenge H2 regression: the auto-route marker is derived where it is used", () => {
  it("no cross-Bash-tool-call handoff survives anywhere in the workflow", () => {
    const ship = readShip();
    // $GITHUB_ENV does not bridge Bash tool calls inside one Action step, and
    // a mktemp path published through it is the exact idiom that shipped inert.
    expect(ship).not.toContain("BKIT_AUTO_ROUTE_FILE");
    expect(ship).not.toMatch(/>>\s*"\$GITHUB_ENV"/);
  });

  it("the marker is never derived from the dead ${LABELS:-} shell read", () => {
    const ship = readShip();
    // Prose may *explain* the trap; no executable fence may re-introduce it.
    const fences = ship.match(/```bash\n([\s\S]*?)```/g) ?? [];
    const offenders = fences.filter((f) =>
      /^\s*[^#\n]*\$\{LABELS:-\}/m.test(f.replace(/```bash\n|```/g, "")),
    );
    expect(offenders, "a fenced block still reads ${LABELS:-}").toEqual([]);
  });

  it("Step 5 derives AUTO_ROUTE_SUFFIX from the tracker, exact-matched, in the subject's own fence", () => {
    const ship = readShip();
    const lines = ship.split("\n");
    let inFence = false;
    let fenceLines: string[] = [];
    let target: string[] | undefined;
    for (const line of lines) {
      if (/^\s*```/.test(line)) {
        if (!inFence) {
          inFence = true;
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
    expect(target, "no single fenced block derives AND consumes AUTO_ROUTE_SUFFIX").toBeDefined();
    const block = target!.join("\n");
    // Initialised empty (fail-safe), then re-derived from the tracker here.
    expect(block).toMatch(/AUTO_ROUTE_SUFFIX=""/);
    expect(block).toMatch(/gh issue view \{ISSUE_ID\} --json labels --jq '\.labels\[\]\.name'/);
    // -qxF: whole-line fixed match, so `bkit:auto-paused` / `no-bkit:auto`
    // cannot arm the route (mirrors bkit-cloud.yml's kill switch).
    expect(block).toMatch(/grep -qxF 'bkit:auto'/);
    // ...and the suffix actually reaches the squash subject.
    expect(block).toContain("${AUTO_ROUTE_SUFFIX}");
  });
});
