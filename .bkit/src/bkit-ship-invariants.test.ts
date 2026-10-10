// bkit-ship-invariants.test.ts — Tier-2 push / staging / step-key contract.
//
// Structural invariants of `bkit-ship.md` that hold whatever the mechanics
// underneath: which steps may push the feature branch (and which may force),
// that every bookkeeping stage goes through `bkit ledgers` and stops the step
// on failure, that every status write targets the one resolved `{STATUS}`,
// that the merge gate runs before `gh pr merge` on the same head, and the
// Failure Path's single-write contract. What the commands do internally
// (allow-lists, lock files, row shapes, rebase handling) is covered by their
// own tests in commands/workflow/*.test.ts, not here.

import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

const REPO_ROOT = path.resolve(__dirname, "../..");
const SHIP_MD = path.join(REPO_ROOT, ".bkit/workflows/bkit-ship.md");

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
  return blocks.map((block) => block.join("\n")).filter((block) => /"\$BKIT" ledgers /.test(block));
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
// FROZEN — canonical 15 ship-* step-key set
// ---------------------------------------------------------------------------
//
// Step NUMBERS may move; KEYS may not.
//
// 15 keys total (the canonical ship step set), in run order. Keys are added,
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
  "ship-worktree-cleanup",
  "ship-close-workflow",
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
    // A bare `git add docs/...` stages whatever drifted under docs/ —
    // Finding 6's docs-tree analogue.
    expect(ship).not.toMatch(/\bgit\s+add\s+--?\s+docs\/?\s*$/m);
    expect(ship).not.toMatch(/\bgit\s+add\s+docs\/(?!(plans\/\{YYYYMM\}\/logs\/\{FID\}))/);
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
  // --force-with-lease. Worktree Cleanup's post-merge `git push origin
  // --delete` carries no commit, so it is not a push this invariant covers.
  const isPush = (line: string) =>
    !/--delete\b/.test(line) &&
    (/\bgit\s+(-C\s+"[^"]+"\s+)?push\b/.test(line) || /"\$BKIT" branches push\b/.test(line));
  const isFeaturePush = (line: string) =>
    isPush(line) &&
    (/\{SHIP_BRANCH\}/.test(line) || /"\$B"/.test(line) || /--mode=feature\b/.test(line));
  const isForcedPush = (line: string) =>
    isPush(line) && (/--force/.test(line) || /--mode=feature\b/.test(line));
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
    const bare = fencedLinesByStep(readShip()).filter(
      (l) => isPush(l.line) && /--force(?!-with-lease)/.test(l.line),
    );
    expect(bare).toEqual([]);
  });

  it("the pre-merge bookkeeping push is a plain push — never forced", () => {
    const pushes = fencedLinesByStep(readShip())
      .filter((l) => l.step === "Commit + Push Bookkeeping" && isPush(l.line))
      .map((l) => l.line);
    expect(pushes).toEqual(['git push origin "{SHIP_BRANCH}"']);
  });

  it("the pre-merge bookkeeping commit stages through bkit ledgers --scope=pr, after the step-done row", () => {
    const step = section(readShip(), /^## .*Step \d+ — Commit \+ Push Bookkeeping/, /^---$/);
    expect(step, "Commit + Push Bookkeeping section not found").not.toBe("");
    const commit = step.indexOf('"$BKIT" ledgers commit');
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
    const openIdx = lines.findIndex((l) => /"\$BKIT" prs open\b/.test(l));
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
  it("the roadmap migration is complete — no docs/completed.md in the install record", () => {
    // .bkit/issues.jsonl is the feature ledger; docs/completed.md is absent. The
    // staging allow-list side lives in commands/workflow/ledgers.test.ts.
    const version = fs.readFileSync(path.join(REPO_ROOT, ".bkit/version"), "utf-8");
    expect(version).not.toContain("docs/completed.md");
  });

  it("no literal `git add` anywhere — every stage goes through bkit ledgers", () => {
    const violations = readShip()
      .split("\n")
      .filter((line) => /\bgit\s+add\b/.test(line));
    expect(violations).toEqual([]);
  });

  it("Step 1 resolves the status log through bkit status path, with --dev-pushes only when the runtime pushes dev", () => {
    // Finding 4: one variable resolving to two trees. `bkit status path`
    // picks the book root (main checkout with --dev-pushes, else the current
    // worktree — commands/lib.test.ts statusLocation); ship must pass the
    // runtime's answer, not guess.
    const step1 = section(readShip(), /^## .*Step 1 —/, /^### .*Gate 1/);
    const block = fences(step1).find((f) => /"\$BKIT" status path\b/.test(f));
    expect(block, "Step 1 bkit status path block not found").toBeDefined();
    expect(block!).toMatch(
      /DEVP="";\s*\[ "\$RUNTIME_DEVPUSHES" = "true" \] && DEVP="--dev-pushes"/,
    );
    expect(block!).toMatch(/"\$BKIT" status path --workflow=ship .*\$DEVP/);
    expect(block!).toMatch(/STATUS=\$\(printf '%s' "\$WHERE" \| jq -r \.path\)/);
  });

  it("every other STATUS assignment takes the resolved {STATUS}", () => {
    const assignments = fences(readShip())
      .flatMap((f) => f.split("\n"))
      .map((l) => l.trim())
      .filter((l) => /^STATUS=/.test(l));
    expect(assignments.length).toBeGreaterThan(1);
    const stray = assignments.filter(
      (l) => l !== 'STATUS="{STATUS}"' && !/^STATUS=\$\(printf '%s' "\$WHERE"/.test(l),
    );
    expect(stray).toEqual([]);
  });

  it("every status row and every steps done targets that status log", () => {
    const lines = fencedLinesByStep(readShip()).map((l) => l.line);
    const rows = lines.filter((l) => /"\$BKIT" status row\b/.test(l));
    expect(rows.length).toBeGreaterThan(0);
    for (const l of rows) {
      expect(l, `status row writes elsewhere: ${l}`).toMatch(/--file="\$STATUS" --workflow=ship\b/);
    }
    for (const type of [
      "ship-merged-on-entry",
      "ship-revalidate-dispatch",
      "ship-revalidate-timeout",
      "ship-gate-refusal",
      "ship-merge-ci",
    ]) {
      expect(
        rows.some((l) => l.includes(`--type=${type} `) || l.endsWith(`--type=${type}`)),
        `no bkit status row writes ${type}`,
      ).toBe(true);
    }
    // A hand-built jq row may only land in an outbox file, never status.jsonl.
    const handBuilt = lines.filter((l) => />>\s*"/.test(l) && /type:"/.test(l));
    for (const l of handBuilt) {
      expect(l, `hand-built row appended outside {OUTBOX}: ${l}`).toMatch(/>>\s*"\$OUTBOX\/[^"]+"/);
    }
    const stepsDone = lines.filter((l) => /"\$BKIT" steps done\b/.test(l));
    expect(stepsDone.length).toBeGreaterThan(0);
    for (const l of stepsDone) {
      expect(l, `steps done writes elsewhere: ${l}`).toMatch(/--file="(\{STATUS\}|\$STATUS)"/);
    }
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
        path.join(REPO_ROOT, `.bkit/workflows/bkit-${workflow}.md`),
        "utf-8",
      );
      const calls = fences(content).filter((f) =>
        new RegExp(`"\\$BKIT" workflows start --workflow=${workflow}\\b`).test(f),
      );
      expect(calls, `no bkit workflows start for "${workflow}"`).toHaveLength(1);
    });
  }
});

// ---------------------------------------------------------------------------
// NEGATIVE — no workflow hand-appends a status or ledger row
// ---------------------------------------------------------------------------

describe("no workflow bash block appends to status.jsonl or .bkit/issues.jsonl with >> (#467)", () => {
  // Status rows go through `bkit status row` / `steps done` / `workflows *` /
  // `status meta`; feature rows through `bkit roadmap feature`. A raw `>>`
  // bypasses the row shape and the fail-open contract those commands own.
  const TARGET =
    />>\s*"?[^\s"]*(?:\$STATUS\b|\{STATUS\}|status\.jsonl|issues\.jsonl|\$ISSUES_JSONL\b)/;
  for (const workflow of ["design", "plan", "build", "debug", "ship"]) {
    it(`bkit-${workflow}.md`, () => {
      const content = fs.readFileSync(
        path.join(REPO_ROOT, `.bkit/workflows/bkit-${workflow}.md`),
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
    ]) {
      expect(TARGET.test(line), line).toBe(true);
    }
    expect(TARGET.test(`jq -nc '{}' >> "$OUTBOX/pre-merge-snapshot.jsonl"`)).toBe(false);
  });
});

describe("bkit-ship.md — Step 6 SHIPPED row and docs verdict come from bkit roadmap feature (#380)", () => {
  const step6 = () => section(readShip(), /^## .*Step 6 —/, /^### .*Gate 6/);

  it("appends the SHIPPED row mechanically into the worktree ledger, not through the update-docs prompt", () => {
    const block = fences(step6()).find((f) => /"\$BKIT" roadmap feature\b/.test(f));
    expect(block, "Step 6 bkit roadmap feature block not found").toBeDefined();
    expect(block!).toMatch(/WT="\{WORKTREE_PATH\}"/);
    expect(block!).toMatch(
      /ROADMAP=\$\("\$BKIT" roadmap feature --root="\$WT" --workflow=ship --fid="\{FID\}" --step=ship-update-docs\)/,
    );
    const prompt = fs.readFileSync(
      path.join(REPO_ROOT, ".bkit/prompts/bkit-ship-update-docs.md"),
      "utf-8",
    );
    expect(prompt).not.toMatch(/issues\.jsonl/);
  });

  it("DOCS_VERDICT is PASS only when the command appended a SHIPPED row — no re-grep of the ledger", () => {
    // A BUILT row from the build close must not green it, and a failed append
    // (fail-open, `appended: false`) must not either.
    const block = fences(step6()).find((f) => /"\$BKIT" roadmap feature\b/.test(f))!;
    expect(block).toMatch(
      /jq -e '\.appended == true and \.row\.status == "SHIPPED"'[^\n]*then DOCS_VERDICT=PASS; else DOCS_VERDICT=FAIL; fi/,
    );
    expect(block).not.toMatch(/SHIPPED_HIT|issues\.jsonl|roadmap fold/);
  });
});

// ---------------------------------------------------------------------------
// POSITIVE — canonical 15 ship-* step-key set
// ---------------------------------------------------------------------------

describe("bkit-ship.md — canonical 15 ship-* step-key set", () => {
  it("publishes the canonical 15 ship-* step-key set (no invented names)", () => {
    // Finding 7: agents invent step names. Every canonical key is written, and
    // nothing else is.
    // Each key must be written by a `bkit steps done --step=<key>` call.
    const written = new Set(
      fencedLinesByStep(readShip())
        .map((l) => /"\$BKIT" steps done\b.*--step=(ship-[a-z-]+)/.exec(l.line)?.[1])
        .filter((k): k is string => k !== undefined),
    );
    expect(CANONICAL_SHIP_STEP_KEYS.filter((k) => !written.has(k))).toEqual([]);
    expect([...written].filter((k) => !CANONICAL_SHIP_STEP_KEYS.includes(k))).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// POSITIVE — gh pr merge always carries --match-head-commit
// ---------------------------------------------------------------------------

describe("bkit-ship.md — gh pr merge carries --match-head-commit", () => {
  it("every `gh pr merge` carries --match-head-commit (no SHA drift on merge)", () => {
    const ship = readShip();
    // SC 1: the merge call refuses a head other than the validated one.
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

  it("the merge gate runs before gh pr merge, at the head the merge is pinned to", () => {
    const step = section(readShip(), /^## .*Step \d+ — Merge Gate \+ Merge PR/, /^### .*Gate/);
    expect(step, "Merge Gate + Merge PR section not found").not.toBe("");
    const gate = step.indexOf('"$BKIT" runs gate --head="{GATE_HEAD}"');
    const merge = step.indexOf("gh pr merge {PR_NUMBER}");
    expect(gate, "bkit runs gate at {GATE_HEAD} not found").toBeGreaterThan(-1);
    expect(merge, "gh pr merge {PR_NUMBER} not found").toBeGreaterThan(-1);
    expect(gate).toBeLessThan(merge);
    const mergeBlock = fences(step).find((f) => f.includes("gh pr merge {PR_NUMBER}"))!;
    expect(mergeBlock).toMatch(/GATE_HEAD="\{GATE_HEAD\}"/);
    expect(mergeBlock).toMatch(/--match-head-commit "\$GATE_HEAD"/);
  });
});

// ---------------------------------------------------------------------------
// POSITIVE — every dev-lock window releases on exit
// ---------------------------------------------------------------------------

describe("bkit-ship.md — every dev-lock window releases on exit", () => {
  it("every fence that takes the dev lock releases it via trap ... EXIT", () => {
    // The lock file and its staleness rules live in `bkit locks`
    // (commands/workflow/locks.test.ts).
    const windows = fences(readShip()).filter((f) => /"\$BKIT" locks acquire --kind=dev\b/.test(f));
    expect(windows.length).toBeGreaterThan(0);
    for (const f of windows) {
      expect(f).toMatch(/trap '"\$BKIT" locks release --kind=dev\b[^']*' EXIT/);
    }
  });
});

// ---------------------------------------------------------------------------
// Workflow-markdown invariants of the merge path
// ---------------------------------------------------------------------------
//
// The merge gate's own behaviour is covered in commands/workflow/runs.test.ts
// (bkit runs gate). The gate call stands alone in its fence and the orchestrator
// routes on its exit code.

describe("bkit-ship.md — build-challenge remediation regressions", () => {
  // B2 stages tracked modifications (`--stage-tracked-updates`, `git add -u` inside
  // `bkit ledgers commit`) before the single commit, including the resolved source files
  // the conflict-resolve subagent wrote.
  it("F1: B2 conflict-resolve stages tracked source modifications before its commit and push", () => {
    const b2 = fences(readShip()).find((f) => /"\$BKIT" branches push --mode=feature\b/.test(f));
    expect(b2, "B2 conflict-resolve push block not found").toBeDefined();
    const stage = b2!.search(
      /"\$BKIT" ledgers commit [^\n]*--mode=stage [^\n]*--stage-tracked-updates/,
    );
    const commit = b2!.indexOf("git commit ");
    const push = b2!.indexOf('"$BKIT" branches push --mode=feature');
    expect(stage, "B2 does not stage tracked updates through bkit ledgers").toBeGreaterThan(-1);
    expect(stage).toBeLessThan(commit);
    expect(commit).toBeLessThan(push);
  });

  // Finding 2 (HIGH): jq rejects a single-quoted program containing
  // `${SHIP_CI_WAIT_TIMEOUT_S:-1800}` (shell does not expand inside single quotes,
  // and `${` is a jq syntax error), so the row is never written. Values reach jq
  // programs through --arg / --argjson or stdin.
  it("F2: no single-quoted jq program carries a shell ${...} expansion", () => {
    const programs = fences(readShip())
      .flatMap((f) => f.split("\n"))
      .filter((l) => /\bjq\b/.test(l))
      .flatMap((l) => [...l.matchAll(/'([^']*)'/g)].map((m) => m[1]!));
    expect(programs.length).toBeGreaterThan(5);
    expect(programs.filter((p) => p.includes("${"))).toEqual([]);
  });

  // `gh pr update-branch` carries an `|| { echo ...; exit 1; }` guard that routes a
  // 403/network/protection failure to Failure Path.
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

  // Finding 4a (MEDIUM): if the status path never reaches the gate, its override
  // audit row lands in a literal-brace junk path. The gate takes the run's status
  // log explicitly.
  it("F4a: the merge gate is handed the run's status log", () => {
    const gate = fencedLinesByStep(readShip()).find((l) =>
      /"\$BKIT" runs gate --head="\{GATE_HEAD\}"/.test(l.line),
    );
    expect(gate, "merge gate invocation not found").toBeDefined();
    expect(gate!.line).toMatch(/--file="\{STATUS\}"/);
  });

  // Finding 5 (MEDIUM): gate code 11 (in progress — poll) must route to the poll
  // step alongside the other poll-able codes, not fall through to Failure Path.
  it("F5: gate code 11 (poll) routes to Step 9 alongside codes 10, 14 and 17", () => {
    const ship = readShip();
    const lines = ship.split("\n");
    // One lead-in lists all four poll-able codes; the counter routing block it
    // introduces continues to step-9.
    const idx = lines.findIndex((l) => /code\s+11/.test(l));
    expect(idx, "code 11 must have a routing lead-in").toBeGreaterThan(-1);
    expect(lines[idx]).toMatch(/\b14\b/);
    expect(lines[idx]).toMatch(/\b10\b/);
    expect(lines[idx]).toMatch(/\b17\b/);
    const block = lines.slice(idx, idx + 12).join("\n");
    expect(block, "codes 10/11/14/17 must route to Step 9, not Failure Path").toMatch(
      /"\$BKIT" counters route --name=REVALIDATE_ATTEMPT .*--continue=step-9 /,
    );
  });
});

// ---------------------------------------------------------------------------
// The `AUTO_ROUTE_SUFFIX` handoff
// ---------------------------------------------------------------------------
//
// The squash-merge `--subject` carries `bkit [auto route]`, which admits a post-merge
// `dev` CI run through bkit-cloud.yml's free-tier gate. `{LABELS}` is an MCP-derived
// TEMPLATE value, never a shell variable, and `$GITHUB_ENV` applies only BETWEEN
// workflow steps. The merge step re-derives the label from the tracker in the SAME
// fence that consumes it (docs/knowledge.jsonl, key
// `363-workflow-md-shell-var-does-not-survive-bash-tool-call-boundary`, idiom 1).
// Shape-level guards only — the behavioural check (execute the fence against a `gh`
// stub, assert the rendered `--subject`) lives in bkit-auto-route-marker.integration.test.ts.
describe("bkit-ship.md — #363 build-challenge H2 regression: the auto-route marker is derived where it is used", () => {
  it("no cross-Bash-tool-call handoff survives anywhere in the workflow", () => {
    const ship = readShip();
    // $GITHUB_ENV does not bridge Bash tool calls inside one Action step, and
    // a mktemp path published through it is inert.
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
    // Derived here from the labels Step 10 sub-step 5 re-read through the
    // tracker MCP; `bkit issues labels` exact-matches `bkit:auto` (mirrors
    // bkit-cloud.yml's kill switch), pinned in commands/workflow/issues.test.ts.
    expect(block).toMatch(
      /AUTO_ROUTE_SUFFIX=\$\("\$BKIT" issues labels \{LABEL_FLAGS\} \| jq -er \.autoRouteSuffix\)/,
    );
    expect(block).not.toContain("gh issue view");
    // ...and the suffix actually reaches the squash subject.
    expect(block).toContain("${AUTO_ROUTE_SUFFIX}");
  });
});

// ---------------------------------------------------------------------------
// Failure Path — markdown contract
// ---------------------------------------------------------------------------

describe("bkit-ship.md — Failure Path single-write contract", () => {
  // The state half (workflow-failed row, rebase abort, lock release, sentinel
  // clearing) is `bkit workflows fail` — commands/workflow/workflows.test.ts.
  it("records the failure through bkit workflows fail, booked where the runtime books", () => {
    const fence = fences(failurePathBlock(readShip())).find((f) =>
      /"\$BKIT" workflows fail --workflow=ship\b/.test(f),
    );
    expect(fence, "no bkit workflows fail in the Failure Path").toBeDefined();
    expect(fence!).toMatch(
      /DEVP="";\s*\[ "\$RUNTIME_DEVPUSHES" = "true" \] && DEVP="--dev-pushes"/,
    );
    expect(fence!).toMatch(/workflows fail .*--token="\{LOCK_TOKEN\}".*\$DEVP/);
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

  it("contains exactly one git push", () => {
    expect(countLines(failurePathBlock(readShip()), /git (-C "[^"]+" )?push/)).toBe(1);
  });

  it("contains exactly one bookkeeping commit (--mode=commit --message)", () => {
    expect(countLines(failurePathBlock(readShip()), /--mode=commit --message/)).toBe(1);
  });

  it("makes no 'ship aborted' second commit", () => {
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

  it("wires bkit ledgers into exactly 5 bash regions", () => {
    // Failure Path flush + union, B2 stage, Commit + Push Bookkeeping,
    // Re-validate's only-bookkeeping check, Close flush + close-worktree union.
    expect(ledgersBlocks(readShip())).toHaveLength(5);
  });

  it("guards every bkit ledgers stage / commit / union so a non-zero exit stops the step", () => {
    // `only-bookkeeping` is exempt: its non-zero exit is an answer ("code
    // moved"), which falls back to validating at the PR head.
    const calls = fencedLinesByStep(readShip())
      .map((l) => l.line)
      .filter((l) => /"\$BKIT" ledgers (commit|union)\b/.test(l));
    expect(calls.length).toBeGreaterThanOrEqual(5);
    const unguarded = calls.filter(
      (l) => !/\|\|\s*\{[^}]*exit 1;?\s*\}/.test(l) && !/^if "\$BKIT" ledgers /.test(l),
    );
    expect(unguarded).toEqual([]);
  });
});
