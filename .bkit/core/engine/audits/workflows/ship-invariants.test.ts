// audits/workflows/ship-invariants.test.ts — Tier-2 push / staging / step-key contract.
//
// Structural invariants of `bkit-ship.md` that hold whatever the mechanics
// underneath: which steps may push the feature branch (and which may force),
// that every bookkeeping stage goes through `bkit ledgers` and stops the step
// on failure, that every status write targets the one resolved `{STATUS}`,
// that the merge gate runs before `bkit prs merge` on the same head, and the
// Failure Path's single-write contract. What the commands do internally
// (allow-lists, lock files, row shapes, rebase handling, the throwaway dev
// checkouts of `workflows close --flush` and `workflows handover --flush`, the
// fast-forward of `branches sync-dev`) is covered by their own tests in commands/workflow/*.test.ts, not here.

import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

const REPO_ROOT = path.resolve(__dirname, "../../../../..");
const SHIP_MD = path.join(REPO_ROOT, ".bkit/core/workflows/bkit-ship.md");

function readShip(): string {
  return fs.readFileSync(SHIP_MD, "utf-8");
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
 * Fenced bash regions that call `bkit ledgers`. A region runs from its opening
 * ```bash through the line before the next ```bash.
 */
function ledgersBlocks(ship: string): string[] {
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
    .filter((block) => /"\{BKIT\}" ledgers /.test(block));
}

/** True for a line that appends a hand-built `type:"..."` jq row to a file. */
function isHandBuiltRowAppend(line: string): boolean {
  return />>\s*"/.test(line) && /type:"/.test(line);
}

/** Step keys the ship workflow writes, including `ship-close-workflow` from a `--flush` close. */
function writtenStepKeys(lines: string[]): Set<string> {
  const keys = lines
    .map((l) => /"\{BKIT\}" steps (?:done|finish)\b.*--step=(ship-[a-z-]+)/.exec(l)?.[1])
    .filter((k): k is string => k !== undefined);
  const flushes = lines.some((l) =>
    /"\{BKIT\}" workflows close --workflow=ship\b.*--flush\b/.test(l),
  );
  return new Set(flushes ? [...keys, "ship-close-workflow"] : keys);
}

/** Ledger stage/commit commands that neither exit-guard themselves nor end their fence. */
function unguardedLedgerCalls(ship: string): string[] {
  const out: string[] = [];
  for (const f of fences(ship)) {
    const lines = f
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    lines.forEach((l, i) => {
      const isLedgerCall = /"\{BKIT\}" ledgers (commit|union)\b/.test(l);
      const guarded = /\|\|\s*\{[^}]*exit 1;?\s*\}/.test(l) || i === lines.length - 1;
      if (isLedgerCall && !guarded) out.push(`unguarded: ${l}`);
    });
  }
  return out;
}

/** Fenced bash bodies, `\`-continuations joined so one command is one line. */
function fences(content: string): string[] {
  return [...content.matchAll(/^[ \t]*```bash\n([\s\S]*?)^[ \t]*```/gm)].map((m) =>
    m[1]!.replace(/\\\n\s*/g, " "),
  );
}

/** Fenced command lines grouped by the `## … Step N — <title>` (or Failure Path) they sit under. */
function fencedLinesByStep(ship: string): Array<{ step: string; line: string }> {
  const out: Array<{ step: string; line: string }> = [];
  let step = "";
  let inFence = false;
  let pending = "";
  for (const line of ship.split("\n")) {
    const heading = /^## .*?(?:Step \d+ — (.+)|(Failure Path))$/.exec(line);
    if (heading) step = (heading[1] ?? heading[2])!.trim();
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (!inFence) continue;
    const joined = pending + line.trim();
    if (joined.endsWith("\\")) {
      pending = `${joined.slice(0, -1)} `;
      continue;
    }
    pending = "";
    out.push({ step, line: joined });
  }
  return out;
}

// ---------------------------------------------------------------------------
// FROZEN — canonical 14 ship-* step-key set
// ---------------------------------------------------------------------------
//
// Step NUMBERS may move; KEYS may not.
//
// 14 keys total (the canonical ship step set), in run order. Keys are added,
// never renamed.

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
  "ship-close-workflow",
] as const;

// ---------------------------------------------------------------------------
// NEGATIVE assertions — banned patterns
// ---------------------------------------------------------------------------

describe("bkit-ship.md — staging hygiene (banned patterns)", () => {
  it("has no `git add -A` anywhere (full content)", () => {
    // Finding 6 (commit staging whatever build/debug left dirty).
    expect(readShip()).not.toMatch(/\bgit\s+add\s+-A\b/);
  });

  it("has no literal `git add` anywhere — every stage goes through bkit ledgers", () => {
    const violations = readShip()
      .split("\n")
      .filter((line) => /\bgit\s+add\b/.test(line));
    expect(violations).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Feature-branch pushes — three steps only, force only in B2 (conflict-resolve)
// ---------------------------------------------------------------------------

describe("bkit-ship.md — push-timing invariant (feature-branch pushes before merge)", () => {
  // Ship pushes the feature branch before the merge in exactly three places:
  // opening a PR that does not exist yet (Step 2), the B2 conflict-resolve
  // integration (Step 4), and the one pre-merge bookkeeping commit (Commit +
  // Push Bookkeeping) that carries docs, summaries, ledgers and skill removals
  // onto the PR so the merge lands them on `dev`. Only B2 may force (with
  // lease): `bkit branches push --mode=feature` pushes a feature branch with
  // --force-with-lease.
  const isPush = (line: string) =>
    !/--delete\b/.test(line) &&
    (/\bgit\s+(-C\s+"[^"]+"\s+)?push\b/.test(line) || /"\{BKIT\}" branches push\b/.test(line));
  const isFeaturePush = (line: string) =>
    isPush(line) &&
    (/\{SHIP_BRANCH\}/.test(line) || /"\$B"/.test(line) || /--mode=feature\b/.test(line));
  const isForcedPush = (line: string) =>
    isPush(line) && (/--force/.test(line) || /--mode=feature\b/.test(line));
  const isBareForcePush = (line: string) => isPush(line) && /--force(?!-with-lease)/.test(line);
  const isBookkeepingPush = (l: { step: string; line: string }) =>
    l.step === "Commit + Push Bookkeeping" && isPush(l.line);
  const stepsWhere = (pred: (line: string) => boolean) =>
    [
      ...new Set(
        fencedLinesByStep(readShip())
          .filter((l) => pred(l.line))
          .map((l) => l.step),
      ),
    ].sort();

  it("pushes the feature branch only to open a missing PR, in Integrate (B2), and in Commit + Push Bookkeeping", () => {
    expect(stepsWhere(isFeaturePush)).toEqual(
      [
        "Commit + Push Bookkeeping",
        "Integrate (Path B only)",
        "Verify PR (Worktree Setup + Regression Guard)",
      ].sort(),
    );
  });

  it("force-pushes only in Integrate (B2), and never a bare --force", () => {
    expect(stepsWhere(isForcedPush)).toEqual(["Integrate (Path B only)"]);
    const bare = fencedLinesByStep(readShip()).filter((l) => isBareForcePush(l.line));
    expect(bare).toEqual([]);
  });

  it("the pre-merge bookkeeping push is a plain push — never forced", () => {
    const pushes = fencedLinesByStep(readShip())
      .filter(isBookkeepingPush)
      .map((l) => l.line);
    expect(pushes).toEqual(['git push origin "{SHIP_BRANCH}"']);
  });

  it("the pre-merge bookkeeping commit stages through bkit ledgers --scope=pr, after the step-done row", () => {
    const step = section(readShip(), /^## .*Step \d+ — Commit \+ Push Bookkeeping/, /^---$/);
    expect(step, "Commit + Push Bookkeeping section not found").not.toBe("");
    const commit = step.indexOf('"{BKIT}" ledgers commit');
    expect(commit, "no bkit ledgers commit in Commit + Push Bookkeeping").toBeGreaterThan(-1);
    expect(step.slice(commit).split("\n")[0]).toMatch(/--scope=pr --mode=commit /);
    // The step-done row is written BEFORE the commit so it rides the PR.
    const row = step.indexOf("--step=ship-bookkeeping-push");
    expect(row, "no ship-bookkeeping-push step-done row").toBeGreaterThan(-1);
    expect(row).toBeLessThan(commit);
  });

  it("pushes the branch to open a missing PR only when ahead of dev, non-force, before bkit prs open", () => {
    // The user's own commits, never ship bookkeeping, and never forced. A
    // branch with nothing ahead of dev is "nothing to ship".
    const lines = readShip().split("\n");
    const openIdx = lines.findIndex((l) => /"\{BKIT\}" prs open\b/.test(l));
    expect(openIdx, "Step 2 open-PR `bkit prs open` not found").toBeGreaterThan(-1);
    const block = lines.slice(Math.max(0, openIdx - 8), openIdx + 1).join("\n");
    expect(block).toMatch(/git push -u origin "\$B"/);
    expect(block).not.toMatch(/--force/);
    expect(block).toMatch(/AHEAD=\$\(git rev-list --count origin\/dev\.\.HEAD/);
    expect(block).toMatch(/\[ "\$AHEAD" -gt 0 \] \|\| \{.*exit 1; \}/);
  });
});

// ---------------------------------------------------------------------------
// POSITIVE — one book root, one status log
// ---------------------------------------------------------------------------

describe("bkit-ship.md — bookkeeping and status writes", () => {
  it("Step 1 resolves the status log through bkit status path, inside the worktree", () => {
    // `bkit status path` books ship in the tree it runs in (commands/lib.test.ts
    // statusLocation), so it must run after the `cd` into {WORKTREE_PATH}.
    const ship = readShip();
    const step1 = section(ship, /^## .*Step 1 —/, /^### .*Gate 1/);
    const block = fences(step1).find((f) => /"\{BKIT\}" status path\b/.test(f));
    expect(block, "Step 1 bkit status path block not found").toBeDefined();
    expect(block!.indexOf('cd "{WORKTREE_PATH}"')).toBeGreaterThanOrEqual(0);
    expect(block!.indexOf('cd "{WORKTREE_PATH}"')).toBeLessThan(block!.indexOf("status path"));
    expect(block!).not.toMatch(/--dev-pushes/);
    expect(step1).toContain("hold `path` as `{STATUS}`");
  });

  it("Step 1 opens the run in the worktree straight after the lock, before any tracker write", () => {
    // A failure after the lock then always has a book to keep its record in.
    const step1 = section(readShip(), /^## .*Step 1 —/, /^### .*Gate 1/);
    const at = (re: RegExp) => step1.search(re);
    const lock = at(/"\{BKIT\}" locks acquire --kind=workflow/);
    const setup = at(/"\{BKIT\}" worktrees setup --workflow=ship/);
    const start = at(/"\{BKIT\}" workflows start --workflow=ship/);
    const labels = at(/"\{BKIT\}" issues labels --phase=ship/);
    const preflight = at(/"\{BKIT\}" repo preflight/);
    expect(lock).toBeGreaterThan(-1);
    expect(setup).toBeGreaterThan(lock);
    expect(start).toBeGreaterThan(setup);
    expect(labels).toBeGreaterThan(start);
    expect(preflight).toBeGreaterThan(start);
  });

  it("no fence reassigns STATUS — every status write takes the resolved {STATUS}", () => {
    const lines = fencedLinesByStep(readShip()).map((l) => l.line);
    expect(lines.filter((l) => /^STATUS=/.test(l))).toEqual([]);
    const writers = lines.filter((l) =>
      /"\{BKIT\}" (status (row|meta)|steps (done|finish)|runs revalidate|workflows (start|close))\b/.test(
        l,
      ),
    );
    expect(writers.length).toBeGreaterThan(10);
    for (const l of writers) {
      expect(l, `status write elsewhere: ${l}`).toMatch(/--file="\{STATUS\}"/);
    }
  });

  it("every ship audit row is written through a command, into {STATUS}", () => {
    const lines = fencedLinesByStep(readShip()).map((l) => l.line);
    // ship-merged-on-entry: bkit status row.
    expect(
      lines.some((l) => /"\{BKIT\}" status row [^\n]*--type=ship-merged-on-entry\b/.test(l)),
    ).toBe(true);
    // ship-revalidate-dispatch / -timeout: bkit runs revalidate --file.
    expect(lines.some((l) => /"\{BKIT\}" runs revalidate [^\n]*--file="\{STATUS\}"/.test(l))).toBe(
      true,
    );
    // ship-gate-refusal (merge gate) and ship-merge-ci (capstone): bkit runs gate --record.
    const recorded = lines.filter((l) =>
      /"\{BKIT\}" runs gate [^\n]*--record="\{STATUS\}"/.test(l),
    );
    expect(recorded).toHaveLength(2);
    expect(recorded.some((l) => /--capstone-only/.test(l))).toBe(true);
    // A hand-built jq row may only land in an outbox file, never status.jsonl.
    const handBuilt = lines.filter(isHandBuiltRowAppend);
    expect(handBuilt).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// POSITIVE — every workflow opens its run with a workflow-started row
// ---------------------------------------------------------------------------

describe("every workflow writes its own workflow-started row (#492)", () => {
  // The row itself, and the skip when that workflow's run is already
  // IN_PROGRESS (a resume), live in `bkit workflows start`
  // (commands/workflow/workflows.test.ts). Each workflow must call it under
  // its own name.
  for (const workflow of ["design", "plan", "build", "debug", "ship"]) {
    it(`bkit-${workflow}.md opens its run with bkit workflows start --workflow=${workflow}`, () => {
      const content = fs.readFileSync(
        path.join(REPO_ROOT, `.bkit/core/workflows/bkit-${workflow}.md`),
        "utf-8",
      );
      const calls = fences(content).filter((f) =>
        new RegExp(`"\\{BKIT\\}" workflows start --workflow=${workflow}\\b`).test(f),
      );
      expect(calls, `no bkit workflows start for "${workflow}"`).toHaveLength(1);
    });
  }
});

// ---------------------------------------------------------------------------
// NEGATIVE — no workflow hand-appends a status or ledger row
// ---------------------------------------------------------------------------

describe("no workflow bash block appends to status.jsonl or .bkit/issues.jsonl with >> (#467)", () => {
  // Status rows go through `bkit status row` / `steps done|finish` / `workflows *` /
  // `status meta`; feature rows through `bkit roadmap feature`. A raw `>>`
  // bypasses the row shape and the fail-open contract those commands own.
  const TARGET =
    />>\s*"?[^\s"]*(?:\$STATUS\b|\{STATUS\}|status\.jsonl|issues\.jsonl|\$ISSUES_JSONL\b)/;
  for (const workflow of ["design", "plan", "build", "debug", "ship"]) {
    it(`bkit-${workflow}.md`, () => {
      const content = fs.readFileSync(
        path.join(REPO_ROOT, `.bkit/core/workflows/bkit-${workflow}.md`),
        "utf-8",
      );
      const hits = fences(content)
        .flatMap((f) => f.split("\n"))
        .filter((l) => TARGET.test(l));
      expect(hits).toEqual([]);
    });
  }

  it("RED-PROOF: the hand-append shapes are caught", () => {
    for (const line of [
      `jq -nc --arg t "$(date -u +%FT%TZ)" '{type:"ship-merged-on-entry", workflow:"ship", at:$t}' >> "$STATUS"`,
      `printf '%s\\n' "$ROADMAP_LINE" >> .bkit/issues.jsonl`,
      `printf '%s\\n' "$ROADMAP_LINE" >> "$WT/.bkit/issues.jsonl"`,
      `jq -nc '{}' >> "$ISSUES_JSONL"`,
      `jq -nc '{}' >> "{STATUS}"`,
    ]) {
      expect(TARGET.test(line), line).toBe(true);
    }
    expect(TARGET.test(`jq -nc '{}' >> "$OUTBOX/pre-merge-snapshot.jsonl"`)).toBe(false);
  });
});

describe("bkit-ship.md — Step 6 SHIPPED row comes from bkit roadmap feature --strict (#380)", () => {
  const step6 = () => section(readShip(), /^## .*Step 6 —/, /^### .*Gate 6/);

  it("appends the SHIPPED row mechanically into the worktree ledger, not through the update-docs prompt", () => {
    const block = fences(step6()).find((f) => /"\{BKIT\}" roadmap feature\b/.test(f));
    expect(block, "Step 6 bkit roadmap feature block not found").toBeDefined();
    expect(block!).toContain(
      '"{BKIT}" roadmap feature --root="{WORKTREE_PATH}" --workflow=ship --fid="{FID}" --step=ship-update-docs --strict',
    );
    const prompt = fs.readFileSync(
      path.join(REPO_ROOT, ".bkit/core/prompts/bkit-ship-update-docs.md"),
      "utf-8",
    );
    expect(prompt).not.toMatch(/issues\.jsonl/);
  });

  it("a row that did not land stops the step — no re-grep of the ledger", () => {
    // `--strict` exits 1 when nothing was appended (commands/workflow/roadmap.test.ts),
    // so a BUILT row from the build close cannot green it, nor a failed append.
    const block = fences(step6()).find((f) => /"\{BKIT\}" roadmap feature\b/.test(f))!;
    expect(block).toMatch(/--strict >\/dev\/null \|\| exit 1/);
    expect(block).not.toMatch(/SHIPPED_HIT|issues\.jsonl|roadmap fold|DOCS_VERDICT/);
  });
});

// ---------------------------------------------------------------------------
// POSITIVE — canonical 14 ship-* step-key set
// ---------------------------------------------------------------------------

describe("bkit-ship.md — canonical 14 ship-* step-key set", () => {
  it("publishes the canonical 14 ship-* step-key set (no invented names)", () => {
    // Finding 7: agents invent step names. Every canonical key is written, and
    // nothing else is. `ship-close-workflow` is written by `workflows close --flush`
    // (commands/workflow/workflows.test.ts); every other key by a
    // `bkit steps done|finish --step=<key>` call.
    const lines = fencedLinesByStep(readShip()).map((l) => l.line);
    const written = writtenStepKeys(lines);
    expect(CANONICAL_SHIP_STEP_KEYS.filter((k) => !written.has(k))).toEqual([]);
    expect([...written].filter((k) => !CANONICAL_SHIP_STEP_KEYS.includes(k))).toEqual([]);
    // Nothing anywhere names a ship step outside the set.
    const named = [...readShip().matchAll(/--step=(ship-[a-z-]+)/g)].map((m) => m[1]!);
    expect(named.filter((k) => !CANONICAL_SHIP_STEP_KEYS.includes(k))).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// POSITIVE — the merge is pinned to the gated head
// ---------------------------------------------------------------------------

describe("bkit-ship.md — the merge is pinned to the head the gate passed", () => {
  it("never merges through raw gh pr merge", () => {
    expect(readShip()).not.toMatch(/gh\s+pr\s+merge\b/);
  });

  it("the merge gate runs before bkit prs merge, which is pinned to the gate's head", () => {
    const step = section(readShip(), /^## .*Step \d+ — Merge Gate \+ Merge PR/, /^### .*Gate/);
    expect(step, "Merge Gate + Merge PR section not found").not.toBe("");
    const gate = step.indexOf('"{BKIT}" runs gate --pr="{PR_NUMBER}"');
    const merge = step.indexOf('"{BKIT}" prs merge --number="{PR_NUMBER}"');
    expect(gate, "bkit runs gate --pr not found").toBeGreaterThan(-1);
    expect(merge, "bkit prs merge not found").toBeGreaterThan(-1);
    expect(gate).toBeLessThan(merge);
    expect(step).toContain("hold `mergeHead` as `{GATE_HEAD}`");
    expect(step).toMatch(
      /"\{BKIT\}" prs merge [^\n]*--match-head="\{GATE_HEAD\}"[^\n]*--expect-merged/,
    );
  });

  it("F4a: the merge gate is handed the run's status log, and snapshots before deciding", () => {
    const gate = fencedLinesByStep(readShip()).find((l) =>
      /"\{BKIT\}" runs gate --pr="\{PR_NUMBER\}"/.test(l.line),
    );
    expect(gate, "merge gate invocation not found").toBeDefined();
    expect(gate!.line).toMatch(/--file="\{STATUS\}"/);
    expect(gate!.line).toMatch(/--snapshot="\{OUTBOX\}\/pre-merge-snapshot\.jsonl"/);
  });
});

// ---------------------------------------------------------------------------
// POSITIVE — dev writes live in commands
// ---------------------------------------------------------------------------

describe("bkit-ship.md — dev writes live in commands", () => {
  it("no fence checks out, commits to or pushes dev by hand; sync-dev, close and flush do", () => {
    const ship = readShip();
    expect(ship).not.toMatch(/locks acquire --kind=dev\b/);
    expect(ship).not.toMatch(/\btrap\b/);
    const lines = fencedLinesByStep(ship).map((l) => l.line);
    expect(lines.some((l) => /\bgit (?:checkout|switch) dev\b/.test(l))).toBe(false);
    expect(lines.some((l) => /\bgit push\b.*\bdev\b/.test(l))).toBe(false);
    expect(lines.some((l) => /"\{BKIT\}" branches sync-dev\b/.test(l))).toBe(true);
    expect(
      lines.some((l) => /"\{BKIT\}" workflows close --workflow=ship\b.*--flush\b/.test(l)),
    ).toBe(true);
    expect(
      lines.some((l) => /"\{BKIT\}" workflows handover --workflow=ship\b.*--flush\b/.test(l)),
    ).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Workflow-markdown invariants of the merge path
// ---------------------------------------------------------------------------

describe("bkit-ship.md — build-challenge remediation regressions", () => {
  // B2 stages tracked modifications (`--stage-tracked-updates`, `git add -u` inside
  // `bkit ledgers commit`) before the single commit, including the resolved source files
  // the conflict-resolve subagent wrote.
  it("F1: B2 conflict-resolve stages tracked source modifications before its commit and push", () => {
    const b2 = fences(readShip()).find((f) => /"\{BKIT\}" branches push --mode=feature\b/.test(f));
    expect(b2, "B2 conflict-resolve push block not found").toBeDefined();
    const stage = b2!.search(
      /"\{BKIT\}" ledgers commit [^\n]*--mode=stage [^\n]*--stage-tracked-updates/,
    );
    const commit = b2!.indexOf("git commit ");
    const push = b2!.indexOf('"{BKIT}" branches push --mode=feature');
    expect(stage, "B2 does not stage tracked updates through bkit ledgers").toBeGreaterThan(-1);
    expect(stage).toBeLessThan(commit);
    expect(commit).toBeLessThan(push);
  });

  // Finding 2 (HIGH): jq rejects a single-quoted program containing a shell
  // `${...}` (shell does not expand inside single quotes, and `${` is a jq
  // syntax error), so the row is never written.
  it("F2: no single-quoted jq program carries a shell ${...} expansion", () => {
    const programs = fences(readShip())
      .flatMap((f) => f.split("\n"))
      .filter((l) => /\bjq\b/.test(l))
      .flatMap((l) => [...l.matchAll(/'([^']*)'/g)].map((m) => m[1]!));
    expect(programs.filter((p) => p.includes("${"))).toEqual([]);
  });

  // B1 integrates through the tested command: the raw `gh pr update-branch` shell
  // call (with its hand-written `|| { … }` guard) is gone. A 403/network/protection
  // failure now surfaces as the command's exit 5, which the step's non-zero route
  // sends to Failure Path; exit 80 maps to `update_pull_request_branch`.
  it("F3: B1 integrates through `bkit prs update-branch`, never a raw gh call", () => {
    const lines = fencedLinesByStep(readShip()).map((l) => l.line);
    expect(lines.filter((l) => /prs update-branch\b/.test(l)).length).toBeGreaterThan(0);
    expect(lines.filter((l) => /gh\s+pr\s+update-branch\b/.test(l))).toEqual([]);
  });

  // Finding 5 (MEDIUM): gate code 11 (in progress — poll) must route to the poll
  // step alongside the other poll-able codes, not fall through to Failure Path.
  it("F5: gate code 11 (poll) routes to Step 9 alongside codes 10, 14 and 17", () => {
    const lines = readShip().split("\n");
    const idx = lines.findIndex((l) => /\bexit 11\b/.test(l));
    expect(idx, "code 11 must have a routing lead-in").toBeGreaterThan(-1);
    expect(lines[idx]).toMatch(/\b14\b/);
    expect(lines[idx]).toMatch(/\b10\b/);
    expect(lines[idx]).toMatch(/\b17\b/);
    const block = lines.slice(idx, idx + 12).join("\n");
    expect(block, "codes 10/11/14/17 must route to Step 9, not Failure Path").toMatch(
      /"\{BKIT\}" counters route --name=REVALIDATE_ATTEMPT .*--continue=step-9 /,
    );
  });
});

// ---------------------------------------------------------------------------
// The auto-route marker
// ---------------------------------------------------------------------------
//
// The squash subject carries `bkit [auto route]` when the issue holds `bkit:auto`,
// which admits a post-merge `dev` CI run through bkit-cloud.yml's free-tier gate.
// `{LABELS}` is an MCP-derived value, never a shell variable, and `$GITHUB_ENV`
// applies only BETWEEN workflow steps. Step 10 re-reads the labels from the tracker
// right before the merge and hands them to `bkit prs merge --label=`, which appends
// the suffix itself (commands/workflow/prs.test.ts); the behavioural check lives in
// audits/templates/auto-route-marker.integration.test.ts.
describe("bkit-ship.md — #363: the auto-route marker comes from labels re-read at the merge", () => {
  it("no cross-Bash-tool-call handoff survives anywhere in the workflow", () => {
    const ship = readShip();
    expect(ship).not.toContain("BKIT_AUTO_ROUTE_FILE");
    expect(ship).not.toMatch(/>>\s*"\$GITHUB_ENV"/);
    expect(ship).not.toMatch(/\$\{LABELS:-\}/);
    expect(ship).not.toContain("gh issue view");
  });

  it("Step 10 re-reads the labels through the tracker and passes them to the merge", () => {
    const step = section(readShip(), /^## .*Step \d+ — Merge Gate \+ Merge PR/, /^### .*Gate/);
    const reread = step.search(/mcp__github__issue_read\(\{ method: "get"/);
    const merge = step.indexOf('"{BKIT}" prs merge');
    expect(reread, "no tracker re-read in Step 10").toBeGreaterThan(-1);
    expect(reread).toBeLessThan(merge);
    expect(step).toMatch(/"\{BKIT\}" prs merge [^\n]*\{LABEL_FLAGS\}/);
    expect(step).toContain("never carried forward from Step 1's `{LABELS}`");
    // With no issue there is nothing to re-read: no tracker call, `{LABEL_FLAGS}` empty.
    expect(step).toContain("**Skip if** `ISSUE_ID` empty");
  });
});

// ---------------------------------------------------------------------------
// Failure Path — markdown contract
// ---------------------------------------------------------------------------

describe("bkit-ship.md — Failure Path single-write contract", () => {
  // The state half (workflow-failed row, rebase abort, lock release, sentinel
  // clearing) is `bkit workflows fail`; the one-commit, one-push flush (reconcile
  // through a throwaway origin/dev checkout, keeping the record in the book root
  // when the push is refused) is `bkit workflows handover
  // --flush` — both in commands/workflow/workflows.test.ts.
  it("records the failure through bkit workflows fail, booked where the runtime books", () => {
    const fence = fences(failurePathBlock(readShip())).find((f) =>
      /"\{BKIT\}" workflows fail --workflow=ship\b/.test(f),
    );
    expect(fence, "no bkit workflows fail in the Failure Path").toBeDefined();
    expect(fence!).toMatch(/workflows fail .*--token=\{LOCK_TOKEN\}/);
  });

  it("flushes through bkit workflows handover --flush, once", () => {
    const calls = fences(failurePathBlock(readShip())).filter((f) =>
      /"\{BKIT\}" workflows handover --workflow=ship [^\n]*--flush/.test(f),
    );
    expect(calls).toHaveLength(1);
    expect(calls[0]).toMatch(/--worktree="\{WORKTREE_PATH\}"/);
  });

  it("runs no git push, commit or second write of its own", () => {
    const block = failurePathBlock(readShip());
    expect(countLines(block, /git (-C "[^"]+" )?(push|commit)\b/)).toBe(0);
    expect(countLines(block, /ledgers (commit|union)\b/)).toBe(0);
    expect(countLines(block, /ship aborted/)).toBe(0);
    expect(countLines(block, /2>\/dev\/null \|\| true/)).toBe(0);
  });

  it("does not route any step back into the Failure Path", () => {
    expect(countLines(failurePathBlock(readShip()), /→ \*\*Failure Path\*\*/)).toBe(0);
  });

  it("writes .deferred-blocked with touch under BOOK_ROOT", () => {
    const writer = readShip()
      .split("\n")
      .find((line) => /touch.*\.deferred-blocked/.test(line));
    expect(writer, "no 'touch ... .deferred-blocked' writer").toBeTruthy();
    expect(writer).toContain("{BOOK_ROOT}");
  });

  it("gitignores routing sentinels in the rendered file and the template source", () => {
    for (const rel of [".gitignore", ".bkit/shared/gitignore"]) {
      const text = fs.readFileSync(path.join(REPO_ROOT, rel), "utf-8");
      expect(text).toContain("docs/plans/*/logs/**/.deferred-blocked");
      expect(text).toContain("docs/plans/*/logs/**/.rebase-failed");
    }
  });

  it("wires bkit ledgers into exactly 2 bash regions", () => {
    // B2 stage, Commit + Push Bookkeeping. The Failure Path flush, the
    // re-validate bookkeeping check and the close flush run inside commands.
    expect(ledgersBlocks(readShip())).toHaveLength(2);
  });

  it("every bkit ledgers stage / commit stops the step on a non-zero exit", () => {
    // Guarded with `|| { ...; exit 1; }`, or the fence's last command, whose
    // exit is the block's.
    expect(unguardedLedgerCalls(readShip())).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Issue-less runs and the main guard
// ---------------------------------------------------------------------------
//
// A ship with no issue warns and continues: no tracker read, label or board call
// runs. Ship never opens or merges into `main`: the engine refuses (`worktrees
// setup` on `dev` / `main`, `prs open --base=main`, `prs merge` of a non-dev PR),
// and the MCP merge fallback asserts the base itself.
describe("bkit-ship.md — issue-less runs and the main guard", () => {
  const SKIP = "**Skip if** `ISSUE_ID` empty";
  /** Index of the first line after `start` matching `re`. */
  const nextAfter = (lines: string[], start: number, re: RegExp) =>
    lines.findIndex((l, i) => i > start && re.test(l));
  const step10 = () =>
    section(readShip(), /^## .*Step \d+ — Merge Gate \+ Merge PR/, /^### .*Gate/);

  /** The tracker blocks (`github`, `linear`, `jira`, `true`) of a text, each as its own string. */
  const blocks = (text: string) =>
    [
      ...text.matchAll(
        /<!-- bkit:tracker (github|linear|jira|true) start -->([\s\S]*?)<!-- bkit:tracker \1 end -->/g,
      ),
    ].map((m) => ({ kind: m[1]!, text: m[0] }));

  it("Step 10 label re-read skips when ISSUE_ID is empty", () => {
    const wired = blocks(step10()).filter((b) => b.kind !== "true");
    expect(wired).toHaveLength(3);
    for (const b of wired) expect(b.text, b.kind).toContain(SKIP);
    expect(step10()).toContain("empty when no tracker is wired or `ISSUE_ID` is empty");
  });

  it("naming warning fires issue-less when the branch is not feat/FID", () => {
    const step2 = section(readShip(), /^## .*Step 2 — Verify PR/, /^### /);
    const line = step2.split("\n").find((l) => l.startsWith("2. **If** `BRANCH`"));
    expect(line, "no naming-warning line").toBeDefined();
    // An empty ISSUE_ID is contained in every branch name, so it cannot be the only test.
    expect(line).toContain("`ISSUE_ID` empty **or**");
    expect(line).toContain("does not contain `{FID}`");
  });

  it("Step 10 MCP merge asserts base dev", () => {
    const step = step10();
    const exit80 = step.indexOf("**If** exit 80");
    const merge = step.indexOf("merge_pull_request");
    expect(exit80, "no exit 80 route on the merge").toBeGreaterThan(-1);
    expect(merge).toBeGreaterThan(exit80);
    const between = step.slice(exit80, merge);
    expect(between).toContain("`base.ref` = `dev`");
    expect(between).toContain("**Failure Path**");
  });

  it("Step 14.3 labels skip when ISSUE_ID is empty", () => {
    const lines = section(readShip(), /^## .*Step 14 — Close Workflow/, /^### .*Gate/).split("\n");
    const start = lines.findIndex((l) => /^3\. /.test(l));
    const end = nextAfter(lines, start, /^4\. /);
    expect(start).toBeGreaterThanOrEqual(0);
    const item = lines.slice(start, end).join("\n");
    const all = blocks(item);
    expect(all.length, "no tracker blocks in sub-step 3").toBe(4);
    for (const b of all) expect(b.text, b.kind).toContain(SKIP);
  });

  it("a ship on dev or main prints the engine refusal and stops", () => {
    const ship = readShip();
    const at = ship.indexOf('"{BKIT}" worktrees setup --workflow=ship');
    expect(at).toBeGreaterThan(-1);
    const route = ship.slice(at, ship.indexOf("8. Enter the worktree", at));
    expect(route).toContain("**If** exit 7");
    expect(route).toContain("**STOP**");
    expect(route).toContain('"{BKIT}" locks release --kind=workflow --workflow=ship');
  });
});
