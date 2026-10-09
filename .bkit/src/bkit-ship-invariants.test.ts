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

/** Inclusive range: first line matching `start`, through the next line matching `end`. */
function section(content: string, start: RegExp, end: RegExp): string {
  const lines = content.split("\n");
  const startIdx = lines.findIndex((line) => start.test(line));
  if (startIdx < 0) return "";
  let endIdx = lines.length - 1;
  for (let i = startIdx + 1; i < lines.length; i++) {
    if (end.test(lines[i])) {
      endIdx = i;
      break;
    }
  }
  return lines.slice(startIdx, endIdx + 1).join("\n");
}

function failurePathBlock(ship: string): string {
  return section(ship, /^## .*Failure Path/, /^---$/);
}

function countLines(block: string, pattern: RegExp): number {
  return block.split("\n").filter((line) => pattern.test(line)).length;
}

/**
 * Fenced bash regions that invoke bkit-book-commit.sh. A region runs from
 * its opening ```bash through the line before the next ```bash, so a guard
 * on a continuation line still counts.
 */
function bookCommitBlocks(ship: string): string[] {
  const blocks: string[][] = [];
  let current: string[] | null = null;
  for (const line of ship.split("\n")) {
    if (line.includes("```bash")) {
      current = [];
      blocks.push(current);
    }
    if (current) current.push(line);
  }
  return blocks
    .map((block) => block.join("\n"))
    .filter((block) => block.includes("bkit-book-commit.sh"));
}

// ---------------------------------------------------------------------------
// FROZEN — canonical 15 ship-* step-key set
// ---------------------------------------------------------------------------
//
// Step NUMBERS may move; KEYS may not. Renaming resets attempt counters across
// three repos and orphans the Tier-3 detector corpus. Published here as the
// source of truth the rewrite (SP2 T7) must match. Verbatim from the design
// (§ Canonical `ship-*` step keys — stable schema).
//
// 15 keys total (the canonical ship step set), in run order. Keys are added,
// never renamed: `ship-bookkeeping-push` arrived when docs, summaries and
// ledgers moved onto the PR ahead of the merge (#452).

export const CANONICAL_SHIP_STEP_KEYS: readonly string[] = [
  "ship-start-workflow",
  "ship-worktree-setup",
  "ship-regression-guard",
  "ship-conflict-resolve",
  "ship-deferred-sweep",
  "ship-update-docs",
  "ship-summary",
  "ship-prune-skills",
  "ship-bookkeeping-push",
  "ship-merge-pr",
  "ship-failure-diagnose",
  "ship-failure-remediate",
  "ship-switch-to-dev",
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
  // Project docs the ship docs sync edits — `--scope=pr` only, top level only
  // (`:(glob)` keeps git's `*` from crossing into docs/plans/** or
  // docs/templates/**). Ride the PR in the pre-merge bookkeeping commit.
  ":(glob)docs/*.md",
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
// NEGATIVE — no {SHIP_BRANCH} commit/push outside the B2 (conflict-resolve) block
// ---------------------------------------------------------------------------

describe("bkit-ship.md — push-timing invariant ({SHIP_BRANCH} pushes before merge)", () => {
  // Ship pushes the feature branch before the merge in exactly two places: the
  // B2 conflict-resolve integration (Step 4) and the one pre-merge bookkeeping
  // commit (Commit + Push Bookkeeping) that carries docs, summaries, ledgers
  // and skill removals onto the PR so the merge lands them on `dev`. Every
  // other step must leave the branch alone. Fences in this workflow are
  // indented under list items, so the fence match allows leading whitespace —
  // a column-0-only match never sees a fence and passes vacuously.
  function branchPushesByStep(ship: string): Map<string, string[]> {
    const byStep = new Map<string, string[]>();
    let step = "";
    let inFence = false;
    for (const line of ship.split("\n")) {
      const heading = /^## .*Step \d+ — (.+)$/.exec(line);
      if (heading) step = heading[1]!.trim();
      if (/^\s*```/.test(line)) {
        inFence = !inFence;
        continue;
      }
      // Worktree Cleanup's post-merge `git push origin --delete` removes the
      // branch; it carries no commit, so it is not a push this invariant covers.
      if (/git\s+push\b.*--delete/.test(line)) continue;
      if (inFence && /git\s+(commit|push)\b.*\{SHIP_BRANCH\}/.test(line)) {
        byStep.set(step, [...(byStep.get(step) ?? []), line.trim()]);
      }
    }
    return byStep;
  }

  it("commits / pushes {SHIP_BRANCH} only in Integrate (B2) and Commit + Push Bookkeeping", () => {
    const byStep = branchPushesByStep(readShip());
    expect([...byStep.keys()].sort()).toEqual(
      ["Commit + Push Bookkeeping", "Integrate (Path B only)"].sort(),
    );
  });

  it("the pre-merge bookkeeping push is a plain push — never forced", () => {
    const pushes = branchPushesByStep(readShip()).get("Commit + Push Bookkeeping") ?? [];
    expect(pushes).toEqual(['git push origin "{SHIP_BRANCH}"']);
  });

  it("the pre-merge bookkeeping commit stages through bkit-book-commit.sh --scope=pr as [skip ci]", () => {
    const step = section(readShip(), /^## .*Step \d+ — Commit \+ Push Bookkeeping/, /^---$/);
    expect(step, "Commit + Push Bookkeeping section not found").not.toBe("");
    expect(step).toMatch(/bkit-book-commit\.sh" --root="\$\(pwd\)" .*--scope=pr --mode=commit /);
    expect(step).toContain('--message="docs({FID}): ship bookkeeping bkit [skip ci]"');
    // The step-done row is written BEFORE the commit so it rides the PR.
    expect(step.indexOf('step:"ship-bookkeeping-push"')).toBeLessThan(
      step.indexOf("bkit-book-commit.sh"),
    );
  });

  it("pushes the branch outside B2 only to open a missing PR — non-force, and only when ahead of dev", () => {
    // Ship ships a branch that has no PR yet by opening one (Step 2). That is
    // the one non-B2 push: the user's own commits, never ship bookkeeping, and
    // never forced. A branch with nothing ahead of dev is "nothing to ship".
    const lines = readShip().split("\n");
    const createIdx = lines.findIndex((l) => /gh pr create --base dev --head "\$B"/.test(l));
    expect(createIdx, "Step 2 open-PR `gh pr create` not found").toBeGreaterThan(-1);
    const block = lines.slice(Math.max(0, createIdx - 8), createIdx + 1).join("\n");
    expect(block).toMatch(/git push -u origin "\$B"/);
    expect(block).not.toMatch(/--force/);
    expect(block).toMatch(/rev-list --count origin\/dev\.\.HEAD/);
    expect(block).toMatch(/Nothing to ship/);
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
// POSITIVE — every workflow opens its run with a workflow-started row (#492)
// ---------------------------------------------------------------------------

describe("every workflow writes its own workflow-started row (#492)", () => {
  for (const workflow of ["design", "plan", "build", "debug", "ship"]) {
    it(`bkit-${workflow}.md appends workflow-started for "${workflow}", skipped when that run is IN_PROGRESS`, () => {
      const content = fs.readFileSync(
        path.join(REPO_ROOT, `.bkit/workflows/bkit-${workflow}.md`),
        "utf-8",
      );
      const lines = content.split("\n");
      const emitIdx = lines.findIndex(
        (l) =>
          l.includes(`'{type:"workflow-started", workflow:"${workflow}", at:$t, parentSha:$p}'`) &&
          /^\s*jq -nc .*>> "\$STATUS"$/.test(l),
      );
      expect(emitIdx, `no workflow-started append for "${workflow}"`).toBeGreaterThan(0);
      const guard = lines[emitIdx - 1];
      expect(guard).toContain(`.workflow // ""')" != "${workflow}"`);
      expect(guard).toContain(`.status // ""')" != "IN_PROGRESS"`);
    });
  }
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

describe("bkit-ship.md — SHIPPED_HIT verdict reader resolves the ledger the writer wrote (#380)", () => {
  it("the SHIPPED_HIT jq read targets $ISSUES_JSONL, never a bare relative path", () => {
    const ship = readShip();
    const lines = ship.split("\n");
    const shippedHitLine = lines.find((l) => /SHIPPED_HIT=\$\(/.test(l));
    expect(shippedHitLine, "SHIPPED_HIT assignment line not found").toBeTruthy();
    // The writer appends to $ISSUES_JSONL (the worktree ledger, so the SHIPPED
    // row rides the PR). The reader must resolve the SAME variable — a bare
    // relative `.bkit/issues.jsonl` silently resolves against whatever the
    // current working directory is and would FAIL to find a row the writer
    // correctly wrote.
    expect(shippedHitLine!).toMatch(/"\$ISSUES_JSONL"/);
    expect(shippedHitLine!).not.toMatch(/[^/$]\.bkit\/issues\.jsonl/);
  });

  it("the SHIPPED feature-row append is mechanical at Step 6, into the worktree ledger, not the update-docs prompt", () => {
    const ship = readShip();
    expect(ship).toMatch(/--arg step "ship-update-docs"/);
    expect(ship).toMatch(/WT="\{WORKTREE_PATH\}"/);
    expect(ship).toMatch(/ISSUES_JSONL="\$WT\/\.bkit\/issues\.jsonl"/);
    expect(ship).toMatch(/\.status="SHIPPED"/);
    const prompt = fs.readFileSync(
      path.join(REPO_ROOT, ".bkit/prompts/bkit-ship-update-docs.md"),
      "utf-8",
    );
    expect(prompt).not.toMatch(/issues\.jsonl/);
  });
});

// ---------------------------------------------------------------------------
// POSITIVE — canonical 15 ship-* step-key set
// ---------------------------------------------------------------------------

describe("bkit-ship.md — canonical 15 ship-* step-key set", () => {
  it("publishes the canonical 15 ship-* step-key set (no invented names)", () => {
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
    // The B2 block is the ONLY fenced block that force-pushes {SHIP_BRANCH}.
    // Match the shell command form (`... origin "{SHIP_BRANCH}"`) — the prose
    // blockquote also mentions the flag but without `origin`.
    const forcePushIdx = lines.findIndex((l) =>
      /git\s+push\s+--force-with-lease\s+origin\b.*\{SHIP_BRANCH\}/.test(l),
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
  it("F5: gate code 11 (poll) routes to Step 9 alongside codes 10, 14 and 17", () => {
    const ship = readShip();
    const lines = ship.split("\n");
    // One lead-in lists all three poll-able codes; the block it introduces owns
    // the Step 9 route, so the destination sits on the exit-code bullets below.
    const idx = lines.findIndex((l) => /code\s+11/.test(l));
    expect(idx, "code 11 must have a routing lead-in").toBeGreaterThan(-1);
    expect(lines[idx]).toMatch(/14/);
    expect(lines[idx]).toMatch(/\b10\b/);
    expect(lines[idx]).toMatch(/\b17\b/);
    const block = lines.slice(idx, idx + 20).join("\n");
    expect(block, "codes 10/11/14/17 must route to Step 9, not Failure Path").toMatch(
      /\*\*If\*\* exit 0 \(printed `step-9`\).*Step 9\./,
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

// ---------------------------------------------------------------------------
// Failure Path — markdown contract
// ---------------------------------------------------------------------------

describe("bkit-ship.md — Failure Path single-write contract", () => {
  it("orders rebase --abort before the workflow-failed status append", () => {
    const lines = failurePathBlock(readShip()).split("\n");
    const abort = lines.findIndex((line) => line.includes("git rebase --abort"));
    const append = lines.findIndex((line) => line.includes("workflow-failed"));
    expect(abort, "no 'git rebase --abort' in Failure Path").toBeGreaterThanOrEqual(0);
    expect(append, "no 'workflow-failed' append in Failure Path").toBeGreaterThanOrEqual(0);
    expect(abort).toBeLessThan(append);
  });

  it("resolves STATUS via BOOK_ROOT, not a bare --git-common-dir", () => {
    expect(failurePathBlock(readShip())).toMatch(/STATUS=.*BOOK_ROOT/);
  });

  it("resolves BOOK_ROOT from RUNTIME_DEVPUSHES inside the Failure Path", () => {
    const block = failurePathBlock(readShip());
    expect(block).toContain("BOOK_ROOT");
    expect(block).toContain("RUNTIME_DEVPUSHES");
  });

  it("has no '2>/dev/null || true' silencing inside the Failure Path", () => {
    expect(countLines(failurePathBlock(readShip()), /2>\/dev\/null \|\| true/)).toBe(0);
  });

  it("writes .deferred-blocked with touch under BOOK_ROOT", () => {
    const writer = readShip()
      .split("\n")
      .find((line) => /touch.*\.deferred-blocked/.test(line));
    expect(writer, "no 'touch ... .deferred-blocked' writer").toBeTruthy();
    expect(writer).toContain("BOOK_ROOT");
  });

  it("does not rm -f .deferred-blocked in the Failure Path state block", () => {
    const block = failurePathBlock(readShip());
    const fence = block.match(/```bash[\s\S]*?```/)?.[0] ?? "";
    expect(fence).not.toMatch(/rm -f.*\.deferred-blocked/);
  });

  it("contains exactly one git push", () => {
    expect(countLines(failurePathBlock(readShip()), /git (-C "[^"]+" )?push/)).toBe(1);
  });

  it("contains exactly one bookkeeping commit (--mode=commit --message)", () => {
    expect(countLines(failurePathBlock(readShip()), /--mode=commit --message/)).toBe(1);
  });

  it("does not keep the retired 'ship aborted' second commit", () => {
    expect(countLines(failurePathBlock(readShip()), /ship aborted/)).toBe(0);
  });

  it("makes the push target RUNTIME_DEVPUSHES-conditional", () => {
    const block = failurePathBlock(readShip());
    expect(block).toContain('if [ "$RUNTIME_DEVPUSHES" = "true" ]');
    expect(block).toContain('push origin "$TARGET"');
  });

  it("refuses an empty push target", () => {
    expect(failurePathBlock(readShip())).toContain('[ -n "$TARGET" ]');
  });

  it("detects runtime inside the Failure Path, at least twice", () => {
    expect(countLines(failurePathBlock(readShip()), /bkit_runtime_detect/)).toBeGreaterThanOrEqual(
      2,
    );
  });

  it("asserts the checkout is actually on dev before dev ops", () => {
    const block = failurePathBlock(readShip());
    expect(block).toContain("checkout dev");
    expect(block).toContain('branch --show-current)" = "dev"');
  });

  it("does not route any step back into the Failure Path", () => {
    expect(countLines(failurePathBlock(readShip()), /→ \*\*Failure Path\*\*/)).toBe(0);
  });

  it("reconciles branch-side artifacts into BOOK_ROOT before staging", () => {
    const block = failurePathBlock(readShip());
    expect(block).toContain("SRC_WT");
    expect(block).toContain("LOGDIR_REL");
  });

  it("gitignores routing sentinels in the rendered file and the template source", () => {
    for (const rel of [".gitignore", ".bkit/templates/gitignore"]) {
      const text = fs.readFileSync(path.join(REPO_ROOT, rel), "utf-8");
      expect(text).toContain("docs/plans/*/logs/**/.deferred-blocked");
      expect(text).toContain("docs/plans/*/logs/**/.rebase-failed");
    }
  });

  it("has no fenced bash block that stages via raw 'git add $BOOK_PATHS'", () => {
    expect(countLines(readShip(), /git .*add \$\{?BOOK_PATHS\}?/)).toBe(0);
  });

  it("wires bkit-book-commit.sh into exactly 5 bash regions", () => {
    // Failure Path flush + union-ledgers, B2 stage, Commit + Push Bookkeeping,
    // Re-validate's only-bookkeeping check, Close flush + close-worktree union.
    expect(bookCommitBlocks(readShip())).toHaveLength(5);
  });

  it("guards every bkit-book-commit.sh region so a non-zero exit stops the step", () => {
    const unguarded = bookCommitBlocks(readShip()).filter(
      (block) =>
        !block
          .split("\n")
          .some((line) => /\|\|.*exit 1/.test(line) || /if bash .*bkit-book-commit\.sh/.test(line)),
    );
    expect(unguarded).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Step 12 ownership — markdown contract. The fence itself runs in
// bkit-ship-worktree-ownership.integration.test.ts.
// ---------------------------------------------------------------------------

describe("bkit-ship.md — Step 14 worktree ownership prose", () => {
  it("gates worktree remove --force on the ownership marker", () => {
    const step12 = section(readShip(), /^## .*Step 14 —/, /^---$/);
    expect(step12, "Step 14 section not found").not.toBe("");
    expect(step12).toContain("worktree-owned");
    expect(step12).toContain("worktree remove");
    expect(step12).toMatch(/if.*worktree-owned|-f.*worktree-owned/);
  });

  it("writes the ownership marker into the outbox when the worktree is created", () => {
    const step2 = section(readShip(), /^## .*Step 2/, /^###.*Gate/);
    expect(step2, "Step 2 section not found").not.toBe("");
    expect(step2).toContain("worktree-owned");
    expect(step2).toContain("bkit-outbox");
  });

  it("treats a missing marker as not mine and skips removal", () => {
    const step12 = section(readShip(), /^## .*Step 14 —/, /^---$/);
    expect(step12).toMatch(/not mine|ownership.*absent|skipping removal/i);
  });
});
