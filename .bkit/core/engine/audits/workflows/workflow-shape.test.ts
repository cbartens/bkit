// Workflow shapes the reviews pinned: each test reads the shipped `.bkit/core/workflows/*.md`
// and fails when the shape a command or route depends on is gone.

import * as fs from "node:fs";
import * as path from "node:path";

import { describe, expect, it } from "vitest";

import { substituteWorkflow } from "../../render/trackers";

const REPO_ROOT = path.resolve(__dirname, "../../../../..");
const PHASES = ["design", "plan", "build", "debug", "ship"] as const;
const ALL = ["auto", ...PHASES] as const;

const workflow = (name: string) =>
  fs.readFileSync(path.join(REPO_ROOT, ".bkit", "core", "workflows", `bkit-${name}.md`), "utf-8");

/** The text of one `## ` section, found by a pattern on its heading line. */
function section(text: string, heading: RegExp): string {
  const lines = text.split("\n");
  const start = lines.findIndex((l) => l.startsWith("## ") && heading.test(l));
  expect(start, `no section matching ${heading}`).toBeGreaterThanOrEqual(0);
  const end = lines.findIndex((l, i) => i > start && l.startsWith("## "));
  return lines.slice(start, end === -1 ? undefined : end).join("\n");
}

/** Every line that runs a given `bkit` verb, continuation lines joined. */
const commandLines = (text: string, verb: string) =>
  text
    .replace(/\\\n\s*/g, " ")
    .split("\n")
    .filter((l) => l.includes(`"{BKIT}" ${verb}`));

/** The marker line of a tracker block still open at the end of `text`; undefined when none is. */
function unclosedTrackerMarker(text: string): string | undefined {
  const lastOpen = text.lastIndexOf("<!-- bkit:tracker");
  const tail = text.slice(lastOpen);
  const closes = /^<!-- bkit:tracker \S+ end -->/.test(tail);
  return lastOpen === -1 || closes ? undefined : tail.split("\n")[0];
}

describe("bkit lookup", () => {
  it.each(ALL)("%s resolves the binary once, in Step 1, and holds it as {BKIT}", (name) => {
    const text = workflow(name);
    expect(text).not.toContain('BKIT="$(dirname');
    expect(text).not.toContain('"$BKIT"');
    const lookups = text
      .split("\n")
      .filter((l) => l.trimStart().startsWith('"$(dirname "$(git rev-parse'));
    expect(lookups, name).toHaveLength(1);
    expect(lookups[0]).toContain('node_modules/.bin/bkit" repo info');
    expect(section(text, /Step 1 — Start Workflow/)).toMatch(/[Hh]old `bkit` as `\{BKIT\}`/);
  });
});

describe("gate logs", () => {
  it.each(ALL)(
    "%s writes every gate log to the outbox, outside the tree the gate's format check reads",
    (name) => {
      for (const line of commandLines(workflow(name), "tests run")) {
        expect(line, line).toMatch(/--log="\{OUTBOX\}\//);
      }
    },
  );

  it("build copies the boundary gate log beside the run's artifacts before clamping it", () => {
    expect(workflow("build")).toContain(
      'cp "{OUTBOX}/build-subplan-gate-{SUB_PLAN}-{VERIFY_ATTEMPT}.log" "docs/plans/{YYYYMM}/logs/{FID}/build-subplan-gate-{SUB_PLAN}-{VERIFY_ATTEMPT}.md" || exit 2',
    );
  });

  it("debug copies the test log beside the run's artifacts before clamping it", () => {
    const step3 = section(workflow("debug"), /Step 3 — Run Tests/);
    expect(step3).toContain(
      'cp "{OUTBOX}/context-tests-local-{DEBUG_ATTEMPT}.log" "$TEST_LOG" || exit 2',
    );
  });
});

describe("Step 1 FID check", () => {
  it.each(PHASES)("%s checks the resolved FID at Step 1, outside every tracker block", (name) => {
    const step1 = section(workflow(name), /Step 1 — Start Workflow/);
    const at = step1.indexOf(`"{BKIT}" fids check --fid="{FID}"`);
    expect(at, `${name}: no fids check in Step 1`).toBeGreaterThanOrEqual(0);
    // Not inside a tracker block: the last block marker before it closes one (or there is none).
    const before = step1.slice(0, at);
    expect(
      unclosedTrackerMarker(before),
      `${name}: fids check sits inside a tracker block`,
    ).toBeUndefined();
    // Gate 1 re-checks the FID shape and the lock mechanically.
    const gate = commandLines(step1, "steps gate");
    expect(gate, name).toHaveLength(1);
    expect(gate[0]).toContain("--fid={FID}");
    expect(gate[0]).toContain("--token={LOCK_TOKEN}");
  });

  it.each(PHASES)("%s finds an already-logged FID with `fids find --issue`", (name) => {
    const step1 = section(workflow(name), /Step 1 — Start Workflow/);
    expect(step1).toContain('"{BKIT}" fids find --issue="{ISSUE_ID}"');
    expect(step1).not.toContain("tr '[:upper:]' '[:lower:]'");
  });
});

describe("pre-worktree commit", () => {
  it.each(["design", "plan", "build"])("%s passes the repo root explicitly", (name) => {
    const lines = commandLines(workflow(name), "ledgers commit").filter((l) =>
      l.includes("pre-worktree"),
    );
    expect(lines.length, name).toBe(1);
    expect(lines[0]).toContain('--root="{REPO_ROOT}"');
  });
});

describe("Failure Path", () => {
  it.each(PHASES)("%s records the failure through one `workflows fail` call", (name) => {
    const failure = section(workflow(name), /Failure Path/);
    const calls = commandLines(failure, "workflows fail");
    expect(calls, name).toHaveLength(1);
    expect(calls[0]).toContain(`--workflow=${name}`);
    expect(calls[0]).toContain('--error-file="{OUTBOX_ROOT}/error.md"');
    expect(failure).not.toContain("BKIT_ERROR");
    expect(failure).not.toContain("cat <<");
  });

  it.each(["design", "plan", "build", "debug"])(
    "%s always keeps its record through one `workflows handover --push` in the run's worktree",
    (name) => {
      const failure = section(workflow(name), /Failure Path/);
      const calls = commandLines(failure, "workflows handover").map((l) => l.trim());
      expect(calls, name).toEqual([
        `"{BKIT}" workflows handover --workflow=${name} --fid={FID} --month={YYYYMM} --push --worktree="{WORKTREE_PATH}"`,
      ]);
      expect(failure).toContain("**Skip if** `{WORKTREE_PATH}` is not set");
      expect(failure).not.toContain("branches push --mode=abort");
      expect(failure).not.toMatch(/HANDOVER_NEEDED` = true → step 4\. \*\*Else\*\* → step 6/);
    },
  );

  it("ship flushes through `workflows handover --flush`", () => {
    const failure = section(workflow("ship"), /Failure Path/);
    expect(failure).toContain('"{BKIT}" workflows handover --workflow=ship');
    expect(failure).toContain("--flush");
    expect(failure).not.toContain("ledgers union");
  });

  it("build routes exit 5 (lock left in place) on, like exit 0", () => {
    const failure = section(workflow("build"), /Failure Path/);
    expect(failure).toContain("**If** exit 0 **or** 5 →");
  });
});

describe("build", () => {
  const build = workflow("build");

  it("passes each clamp flag as its own argument, never through a spliced variable", () => {
    const lines = [
      ...commandLines(build, "context clamp "),
      ...commandLines(build, "context clamp-log"),
    ];
    expect(lines.length).toBeGreaterThan(0);
    for (const line of lines) {
      for (const flag of ["--fid=", "--step=", "--attempt="]) {
        expect(line.split(flag).length - 1, `${flag} once in: ${line}`).toBe(1);
      }
      // An unquoted $VAR standing alone would word-split a flag list.
      expect(line, line).not.toMatch(/\s\$[A-Za-z_][A-Za-z0-9_]*(?=\s|$)/);
    }
  });

  it("commits the test log, clamped, beside the run's artifacts", () => {
    const step14 = section(build, /Step 14 — Run Tests/);
    expect(step14).toContain(
      'cp "{OUTBOX}/run-tests-{TEST_ATTEMPT}.log" "docs/plans/{YYYYMM}/logs/{FID}/run-tests-{TEST_ATTEMPT}.md" || exit 2',
    );
    expect(step14).toContain(
      '"{BKIT}" context clamp --artifact="docs/plans/{YYYYMM}/logs/{FID}/run-tests-{TEST_ATTEMPT}.md" --profile=debug-evidence',
    );
    expect(step14).toContain('--artifact="docs/plans/{YYYYMM}/logs/{FID}/run-tests-<attempt>.md"');
  });

  it("Step 15's diagnose agent reads the committed log, not the outbox copy", () => {
    const step15 = section(build, /Step 15 — Failure Diagnose/);
    const read = step15.split("\n").find((l) => l.trim().startsWith("Read:"));
    expect(read).toContain("`docs/plans/{YYYYMM}/logs/{FID}/run-tests-{TEST_ATTEMPT}.md`");
    expect(read).not.toContain("{OUTBOX}");
  });

  it("writes the challenge attempt on every row, 0 included", () => {
    for (const step of ["build-challenge", "build-challenge-reconcile"]) {
      const line = commandLines(build, "steps finish").find((l) => l.includes(`--step=${step} `));
      expect(line, step).toContain("--attempt-of=build-challenge-remediate:count");
    }
    expect(build).not.toContain("ATTEMPT_FLAG");
  });

  it("records the PR URL in artifacts, not a prUrl field", () => {
    expect(build).not.toContain("prUrl");
    const line = commandLines(build, "steps done").find((l) =>
      l.includes("--step=build-create-pr"),
    );
    expect(line).toContain("--artifact={PR_URL}");
  });
});

describe("debug", () => {
  it("records the PR URL in artifacts, not a prUrl field", () => {
    const debug = workflow("debug");
    expect(debug).not.toContain("prUrl");
    expect(debug).toContain("`--step=debug-create-pr --artifact={PR_URL}");
  });
});

describe("verdict headers re-ask on PENDING (exit 5) as well as invalid (exit 6)", () => {
  it.each(PHASES)("%s: the Finish header line routes exit 5 or 6 to a re-ask", (name) => {
    const finish = workflow(name)
      .split("\n")
      .find((l) => l.startsWith("> - **Finish:**"));
    expect(finish, name).toBeDefined();
    expect(finish).toContain("Exit 5 **or** 6 → invoke `reask.agent` again");
  });

  it.each(PHASES)("%s never reads a verdict outside `steps finish`", (name) => {
    expect(commandLines(workflow(name), "steps verdict"), name).toHaveLength(0);
  });

  it("plan's complexity verdict is read from the agent's own set", () => {
    const plan = workflow("plan");
    const line = commandLines(plan, "steps finish").find((l) =>
      l.includes("--step=plan-complexity-check"),
    );
    expect(line).toContain("--agent=bkit-plan-complexity-check");
    expect(line).not.toContain("--verdict=");
    expect(plan).not.toContain("--field=complexity=");
  });
});

describe("status route --require=strategy", () => {
  it("is used at exactly the four strategy-routing sites", () => {
    const sites = ["build", "debug", "ship"].flatMap((name) =>
      commandLines(workflow(name), "status route")
        .filter((l) => l.includes("--require=strategy"))
        .map((l) => /--step=([a-z0-9-]+)/.exec(l)?.[1]),
    );
    expect(sites.sort()).toEqual([
      "build-failure-diagnose",
      "build-plan-gaps-remediate",
      "debug-failure-diagnose",
      "ship-failure-remediate",
    ]);
  });
});

describe("auto", () => {
  const auto = workflow("auto");

  it("resolves phase, mode and the CI context with one `runs context` call", () => {
    const step1 = section(auto, /Step 1 — Start Workflow/);
    expect(step1).toContain('"{BKIT}" runs context --phase="{PHASE}" --arg="{ARG}"');
    expect(step1).toContain("`runId` as `{RUN_ID}`");
    expect(step1).not.toContain("gh run list");
    expect(step1).not.toContain("case ");
  });

  it("Timeouts header line says 3600 seconds, like the phase workflows", () => {
    for (const name of ALL) {
      expect(workflow(name), name).toContain(
        "> - **Timeouts:** **If** workflow or subagent run > 3600 seconds → **Failure Path**.",
      );
    }
  });
});

describe("Large Diff Guard", () => {
  it.each(["build", "debug", "ship"])("%s carries it as its own header line", (name) => {
    const lines = workflow(name).split("\n");
    const guard = lines.filter((l) => l.includes("**Large Diff Guard:**"));
    expect(guard, name).toHaveLength(1);
    expect(guard[0]).toMatch(/^> - \*\*Large Diff Guard:\*\* /);
    // Nothing else shares the line: one labelled bullet only.
    expect(guard[0]!.match(/\*\*[A-Z][A-Za-z -]+:\*\*/g)).toHaveLength(1);
  });
});

describe("ship", () => {
  const ship = workflow("ship");

  it("post-merge check reads the capstone job alone, at the squash commit", () => {
    const close = section(ship, /Step 14 — Close Workflow/);
    expect(close).toContain(
      '"{BKIT}" runs gate --squash-of="{PR_NUMBER}" --repo="{OWNER_REPO}" --capstone-only --record="{STATUS}"',
    );
  });

  it("the close removes the worktree and deletes the branch through the command, then leaves it", () => {
    const close = section(ship, /Step 14 — Close Workflow/);
    expect(close).toContain('--branch="{SHIP_BRANCH}"');
    expect(close).toContain('cd "{REPO_ROOT}"; exit $rc');
    expect(ship).not.toContain('"{BKIT}" worktrees remove');
    expect(ship).not.toContain("git worktree remove");
    expect(ship).not.toContain("git branch -D");
    expect(ship).not.toContain("push origin --delete");
  });

  it("brings local dev level through `branches sync-dev`, never a checkout", () => {
    const step13 = section(ship, /Step 13 — Update Local Dev/);
    expect(step13).toContain('"{BKIT}" branches sync-dev || exit 1');
    expect(step13).not.toContain('cd "{REPO_ROOT}"');
  });

  it("skill prune warns and carries on rather than stopping the ship", () => {
    const prune = section(ship, /Step 7 — Prune Skills/);
    expect(prune).toContain(
      "**If** `skipped` non-null **or** `failed` non-empty → narrate the warning → continue.",
    );
  });

  it("re-validates through `runs revalidate` and merges through `prs merge --match-head`", () => {
    expect(section(ship, /Step 9 — Re-validate/)).toContain(
      '"{BKIT}" runs revalidate --pr="{PR_NUMBER}"',
    );
    const merge = section(ship, /Step 10 — Merge Gate/);
    expect(merge).toContain('--snapshot="{OUTBOX}/pre-merge-snapshot.jsonl" --record="{STATUS}"');
    expect(merge).toContain('"{BKIT}" prs merge --number="{PR_NUMBER}" --match-head="{GATE_HEAD}"');
    expect(merge).toContain("--expect-merged");
    expect(ship).not.toContain("gh pr merge");
  });

  it("closes through `workflows close --flush`", () => {
    const close = section(ship, /Step 14 — Close Workflow/);
    expect(close).toContain('"{BKIT}" workflows close --workflow=ship');
    expect(close).toContain('--flush --token="{LOCK_TOKEN}"');
    expect(close).not.toContain("gh pr create");
  });
});

describe("design and plan close", () => {
  it.each(["design", "plan"])("%s lands on dev through `branches land`", (name) => {
    const close = section(workflow(name), /Close Workflow/);
    expect(close).toContain(`"{BKIT}" workflows promote --workflow=${name}`);
    expect(close).toContain(`"{BKIT}" branches land --workflow=${name}`);
    expect(close).toContain(`"{BKIT}" workflows links --workflow=${name}`);
    expect(close).not.toContain("git merge --squash");
    expect(close).not.toContain("git ls-tree");
    expect(close).not.toContain('git branch -D "feat/{FID}"');
    expect(close).not.toContain('git push origin --delete "feat/{FID}"');
  });

  it.each(["design", "plan", "debug"])(
    "%s skips a related issue whose comments do not parse, and names it",
    (name) => {
      const text = workflow(name);
      // One per tracker: github, linear, jira.
      expect(text.split("Skipped: comments did not parse.").length - 1, name).toBe(3);
    },
  );
});

describe("highest-version lookups", () => {
  it.each(["design", "plan"])("%s never lists versions with an `ls` glob", (name) => {
    expect(workflow(name)).not.toMatch(/\$\(ls /);
  });
});

describe("locks", () => {
  it.each(PHASES)("%s's Locks header no longer waits on the lock file's age", (name) => {
    const locks = workflow(name)
      .split("\n")
      .find((l) => l.startsWith("> - **Locks:**"));
    expect(locks, name).toBeDefined();
    expect(locks).not.toMatch(/30 minutes old|>=30min old|lock file is at least/);
  });
});

describe("setup tips at the close", () => {
  it.each(PHASES)("%s runs bkit tips in the step before Final return, which appends it", (name) => {
    const lines = workflow(name).split("\n");
    const finalIdx = lines.findIndex((l) => /^\d+\. Final return:/.test(l));
    const collectIdx = lines.findIndex((l) => /^\d+\. Collect setup tips:/.test(l));
    expect(collectIdx, name).toBeGreaterThanOrEqual(0);
    expect(collectIdx, name).toBeLessThan(finalIdx);
    const collect = lines.slice(collectIdx, finalIdx).join("\n");
    expect(commandLines(collect, "tips"), name).toEqual([
      expect.stringContaining(`"{BKIT}" tips --workflow=${name}`),
    ]);
    expect(collect).toContain("`{BKIT_TIPS}`");
    // The whole Final return step: its indented lines, up to the next unindented line.
    const final = lines
      .slice(finalIdx)
      .join("\n")
      .split(/\n(?=\S)/)[0];
    expect(final).toContain("Append `{BKIT_TIPS}`");
  });
});

// ---------------------------------------------------------------------------
// Issue-less runs: a missing issue warns and the run continues; no issue-tied
// tracker call runs without an issue.
// ---------------------------------------------------------------------------

const SKIP_NO_ISSUE = "**Skip if** `ISSUE_ID` empty";
/** A guard line: `Skip if ISSUE_ID empty`, or an `If ISSUE_ID empty` branch whose Else holds the call. */
const isIssueGuard = (l: string) =>
  l.includes(SKIP_NO_ISSUE) || l.includes("**If** `ISSUE_ID` empty →");
const FINAL_FIRST_LINE =
  "Line 1 of the final message = the no-issue warning, when one was emitted.";

interface TrackerBlock {
  kind: string;
  start: number;
  end: number;
}

/** Every tracker block (nested and inline ones too) as a line range, markers included. */
function trackerBlocks(lines: string[]): TrackerBlock[] {
  const stack: { kind: string; start: number }[] = [];
  const out: TrackerBlock[] = [];
  lines.forEach((line, i) => {
    for (const m of line.matchAll(
      /<!-- bkit:tracker (github|linear|jira|true|false) (start|end) -->/g,
    )) {
      if (m[2] === "start") stack.push({ kind: m[1]!, start: i });
      else {
        const open = stack.pop();
        if (open) out.push({ ...open, end: i });
      }
    }
  });
  return out;
}

/** The smallest block that holds line `i`. */
const innermostBlock = (blocks: TrackerBlock[], i: number) =>
  blocks
    .filter((b) => b.start <= i && i <= b.end)
    .sort((a, b) => a.end - a.start - (b.end - b.start))[0];

/** A line tied to the run's issue: a tracker call naming it, a board call, or an issue write. */
const ISSUE_TIED = [
  /mcp__\w+__\w+\(.*(?:issue_number: \{ISSUE_ID\}|(?:issueId|issueIdOrKey|id): "\{ISSUE_ID\}")/,
  /mcp__github__projects_write\(\{BOARD\}/,
  /"\{BKIT\}" issues (?:labels|comment)\b/,
  /"\{BKIT\}" issues text --description-file="\{OUTBOX\}\/issue-description\.md"/,
  /"\{BKIT\}" workstreams comment\b/,
  /\*\*Tracker\*\* status change/,
];

/** The body of a workflow: everything from the Failure Path on (the header only defines the tracker). */
const bodyStart = (lines: string[]) => lines.findIndex((l) => l.startsWith("## 🤖 Failure Path"));

/** One numbered item: its first line to the line before the next top-level number. */
function itemRange(lines: string[], at: number): [number, number] {
  const next = lines.findIndex((l, i) => i > at && /^\d+\. /.test(l));
  return [at, next === -1 ? lines.length : next];
}

/**
 * Issue-tied call lines from `from` on that no `Skip if ISSUE_ID empty` line guards. The line sits
 * in a tracker block: the guard is in that block. A `false` block renders only with no tracker
 * wired, so it holds no issue-tied call. The line sits in no block (a call that also runs under
 * `none`): the guard is in its numbered item.
 */
function unguardedIssueCalls(lines: string[], from: number): string[] {
  const blocks = trackerBlocks(lines);
  return lines.flatMap((line, i) => {
    if (i < from || !ISSUE_TIED.some((re) => re.test(line))) return [];
    const block = innermostBlock(blocks, i);
    if (block?.kind === "false") return [];
    const guardFrom =
      block?.start ??
      lines
        .map((l, n) => (n <= i && /^\d+\. /.test(l) ? n : -1))
        .reduce((a, b) => Math.max(a, b), -1);
    const guarded = guardFrom >= 0 && lines.slice(guardFrom, i + 1).some(isIssueGuard);
    return guarded ? [] : [`${i + 1}: ${line.trim().slice(0, 100)}`];
  });
}

/** Line indexes of the `issues labels --board=` fences. */
const boardFences = (lines: string[]): number[] =>
  lines.flatMap((l, i) =>
    l.includes('"{BKIT}" issues labels') && l.includes("--board=") ? [i] : [],
  );

/** Line indexes that post a Failure Path `comment`. */
const commentPosts = (lines: string[]): number[] =>
  lines.flatMap((l, i) => (/[Pp]ost `comment`/.test(l) ? [i] : []));

/** A Failure Path comment post is guarded on its own line or by a Skip line in its tracker block. */
function guardedPost(lines: string[], blocks: TrackerBlock[], i: number): boolean {
  const block = innermostBlock(blocks, i);
  return (
    /`ISSUE_ID` (?:non-)?empty/.test(lines[i]!) ||
    (block !== undefined && lines.slice(block.start, i + 1).some((l) => l.includes(SKIP_NO_ISSUE)))
  );
}

/** Tracker blocks lying wholly inside the line range. */
const blocksWithin = (lines: string[], from: number, to: number): TrackerBlock[] =>
  trackerBlocks(lines).filter((b) => b.start >= from && b.end <= to);

/** The wired-tracker blocks of Step 1 that read blockers. */
const blockerBlocks = (step1: string[]): TrackerBlock[] =>
  trackerBlocks(step1).filter(
    (b) =>
      ["github", "linear", "jira"].includes(b.kind) &&
      /blocked|blockers/.test(step1.slice(b.start, b.end + 1).join("\n")),
  );

/** Line indexes of `branches push` fences. */
const pushFences = (lines: string[]): number[] =>
  lines.flatMap((l, i) => (/^\s*"\{BKIT\}" branches push\b/.test(l) ? [i] : []));

describe("issue-less runs", () => {
  it.each(PHASES)(
    "%s: every tracker MCP call and bkit issues fence is guarded by ISSUE_ID empty",
    (name) => {
      const lines = workflow(name).split("\n");
      const from = bodyStart(lines);
      expect(from, name).toBeGreaterThan(0);
      const unguarded = unguardedIssueCalls(lines, from);
      expect(unguarded, `${name}: issue-tied calls with no Skip if ISSUE_ID empty`).toEqual([]);
    },
  );

  it.each(PHASES)(
    "%s: every issues labels --board fence has a Skip if ISSUE_ID empty line",
    (name) => {
      const lines = workflow(name).split("\n");
      const blocks = trackerBlocks(lines);
      const fences = boardFences(lines);
      expect(fences.length, `${name}: no issues labels --board fence found`).toBeGreaterThanOrEqual(
        2,
      );
      for (const i of fences) {
        const block = innermostBlock(blocks, i);
        expect(block?.kind, `${name}:${i + 1} fence sits in a true block`).toBe("true");
        expect(
          lines.slice(block!.start, i).some((l) => l.includes(SKIP_NO_ISSUE)),
          `${name}:${i + 1} fence has no Skip if ISSUE_ID empty line`,
        ).toBe(true);
      }
    },
  );

  it.each(PHASES)("%s: no wired-tracker block STOPs on a missing issue", (name) => {
    const step1 = section(workflow(name), /Step 1 — Start Workflow/).split("\n");
    const wired = trackerBlocks(step1).filter((b) => ["github", "linear", "jira"].includes(b.kind));
    expect(wired.length, name).toBeGreaterThan(0);
    for (const b of wired) {
      const text = step1.slice(b.start, b.end + 1).join("\n");
      expect(text, `${name}: ${b.kind} block at Step 1 line ${b.start + 1}`).not.toContain("STOP");
      expect(text).not.toContain("No issue ID in the session prompt");
    }
  });

  it.each(PHASES)("%s: fids check and steps gate carry --issue in every workflow", (name) => {
    // The flag sits in a tracker block (a `none` run has no issue), so read the wired render.
    const text = substituteWorkflow(workflow(name), "github").output;
    const step1 = section(text, /Step 1 — Start Workflow/);
    expect(commandLines(step1, "fids check"), name).toEqual([
      expect.stringContaining('--fid="{FID}" --issue="{ISSUE_ID}"'),
    ]);
    const gate = commandLines(step1, "steps gate");
    expect(gate, name).toHaveLength(1);
    expect(gate[0]).toContain('--issue="{ISSUE_ID}"');
    expect(text).not.toMatch(/--placeholder[ =]ISSUE_ID/);
    // An empty ISSUE_ID must reach the engine as an empty value, never a bare flag.
    for (const verb of ["prs open", "branches land"]) {
      for (const line of commandLines(text, verb).filter((l) => l.includes("--issue"))) {
        expect(line, `${name}: ${verb}`).toContain('--issue="{ISSUE_ID}"');
      }
    }
  });

  it.each(PHASES)("%s: the No issue bullet sits in a tracker true block", (name) => {
    const text = workflow(name);
    const bullets = text.split("\n").filter((l) => l.startsWith("> - **No issue:**"));
    expect(bullets, name).toHaveLength(1);
    expect(bullets[0]).toContain("WARNING: no issue named — running issue-less as {FID}");
    const before = text.slice(0, text.indexOf(bullets[0]!));
    expect(unclosedTrackerMarker(before), `${name}: bullet is not inside a block`).toContain(
      "bkit:tracker true start",
    );
    expect(text.indexOf(bullets[0]!), name).toBeLessThan(text.indexOf("## 🤖 Failure Path"));
  });

  it.each(PHASES)("%s: final messages start with the no-issue warning clause", (name) => {
    const text = workflow(name);
    const lines = text.split("\n");
    const finalAt = lines.findIndex((l) => /^\d+\. Final return:/.test(l));
    expect(finalAt, name).toBeGreaterThanOrEqual(0);
    const final = lines
      .slice(finalAt)
      .join("\n")
      .split(/\n(?=\S)/)[0];
    expect(final, `${name}: Final return`).toContain(FINAL_FIRST_LINE);
    expect(section(text, /Failure Path/), `${name}: Failure Path STOP`).toContain(FINAL_FIRST_LINE);
    const failDisplay = lines.filter((l) => l.includes("`SUMMARY_VERDICT` = FAIL → display"));
    expect(failDisplay.length, `${name}: summary-FAIL display`).toBe(1);
    expect(failDisplay[0], `${name}: summary-FAIL display`).toContain(FINAL_FIRST_LINE);
  });

  it.each(PHASES)("%s: the wired Extract lines leave the recovery to the true block", (name) => {
    const step1 = section(workflow(name), /Step 1 — Start Workflow/).split("\n");
    const extract = trackerBlocks(step1)
      .filter((b) => ["github", "linear", "jira"].includes(b.kind))
      .map((b) => step1.slice(b.start, b.end + 1).join("\n"))
      .filter((t) => t.includes("Extract from session prompt"));
    expect(extract, name).toHaveLength(3);
    for (const t of extract) {
      expect(t).not.toContain("fids parse");
      expect(t).not.toContain("STOP");
    }
  });

  it.each(PHASES)(
    "%s: Step 1 recovers ISSUE_ID from the branch in the true block, with a Route for every exit",
    (name) => {
      const step1 = section(workflow(name), /Step 1 — Start Workflow/).split("\n");
      const recover = trackerBlocks(step1)
        .filter((b) => b.kind === "true")
        .map((b) => step1.slice(b.start, b.end + 1).join("\n"))
        .filter((t) => t.includes("fids parse"));
      expect(recover, name).toHaveLength(1);
      const t = recover[0]!;
      expect(t).toContain('"{BKIT}" fids parse --branch="feat/{FID}"');
      expect(t).toContain("**If** exit 0 and `issueId` non-null → hold `issueId` as `ISSUE_ID`");
      expect(t).toContain('**If** exit 0 and `issueId` null → set `ISSUE_ID=""`');
      expect(t).toContain("→ as exit 0 with `issueId` null");
      expect(t).toContain("never create a tracker issue");
      expect(t.indexOf("fids parse")).toBeLessThan(t.indexOf("no-issue warning"));
      // A branch suffix that is not a slug stops the run before anything starts.
      const stop = t.split("\n").find((l) => l.includes("**If** exit 3"));
      expect(stop, name).toContain("**STOP**");
      expect(stop).toContain("rename `BRANCH` to `feat/{lowercase-slug}` or name an issue");
      expect(stop).toContain("never the **Failure Path**");
      // The route ends in a Failure Path for any other exit.
      expect(t).toContain("**Else** → **Failure Path**");
    },
  );

  it.each(PHASES)("%s: sub-step 5.2 compares a held ISSUE_ID to the branch FID", (name) => {
    const line = workflow(name)
      .split("\n")
      .find((l) => l.includes("`BRANCH` = `feat/{FID}` → that `FID`"));
    expect(line, name).toBeDefined();
    expect(line).toContain("with `ISSUE_ID` non-empty, only when `FID` starts with `ISSUE_ID`");
  });

  it.each(PHASES)(
    "%s: a minted issue-less FID goes through fids free, which re-mints on exit 1",
    (name) => {
      const step1 = section(workflow(name), /Step 1 — Start Workflow/);
      const lines = step1.split("\n");
      const at = lines.findIndex((l) => l.includes("fids free"));
      expect(at, name).toBeGreaterThan(0);
      expect(lines[at]).toContain(`--workflow=${name}`);
      const block = lines.slice(at - 3, at + 8).join("\n");
      expect(block).toContain("**Run only if** sub-step 4 minted `FID` with `ISSUE_ID` empty");
      expect(block).toContain("`{FID}` = the printed `fid`");
      expect(block).toContain("**If** exit 1 → re-mint once");
      expect(block).toContain("**Failure Path**");
      // The suffix check comes before the format check on the resolved FID.
      expect(step1.indexOf("fids free")).toBeLessThan(step1.indexOf('"{BKIT}" fids check'));
    },
  );

  it.each(["design", "plan"])(
    "%s: the merge MCP fallback asserts base.ref = dev before merging",
    (name) => {
      const line = workflow(name)
        .split("\n")
        .find((l) => l.includes("**If** exit 80 at `stage` = merge"));
      expect(line, name).toBeDefined();
      expect(line!.indexOf("assert `base.ref` = `dev`")).toBeGreaterThan(0);
      expect(line!.indexOf("assert `base.ref` = `dev`")).toBeLessThan(
        line!.indexOf("merge_pull_request"),
      );
    },
  );

  it("ship's merge MCP fallback asserts base.ref = dev before merging", () => {
    const line = workflow("ship")
      .split("\n")
      .find((l) => l.includes("`pull_request_read` (`get`) and assert `base.ref` = `dev`"));
    expect(line).toBeDefined();
    expect(line!.indexOf("assert")).toBeLessThan(line!.indexOf("merge_pull_request"));
  });

  it.each(PHASES)("%s: Placeholders rule lets ISSUE_ID be empty in every workflow", (name) => {
    const rule = workflow(name)
      .split("\n")
      .find((l) => l.startsWith("> - **Placeholders:**"));
    expect(rule, name).toBeDefined();
    expect(rule).toContain("`{ISSUE_ID}` may be empty");
  });

  it.each(["design", "plan", "debug"])(
    "%s: the Jira related-issues query drops key != when ISSUE_ID is empty",
    (name) => {
      const lines = workflow(name)
        .split("\n")
        .filter((l) => l.includes("key != {ISSUE_ID}"));
      expect(lines, name).toHaveLength(1);
      expect(lines[0]).toContain("drop `AND key != {ISSUE_ID}` when `ISSUE_ID` empty");
    },
  );

  it.each(PHASES)("%s: tracker gate items read skipped when ISSUE_ID empty", (name) => {
    const items = workflow(name)
      .split("\n")
      .filter((l) =>
        /^- \[ \] (?:Issue update attempted|Artifact link list|Blocker check attempted|Kill-switch propagation|Auto-label presence|Marker `bkit \[auto route\]`)/.test(
          l,
        ),
      );
    expect(items.length, name).toBeGreaterThan(0);
    for (const item of items) expect(item, name).toContain("skipped when `ISSUE_ID` empty");
    const resolved = workflow(name)
      .split("\n")
      .filter((l) => l.startsWith("- [ ] Issue resolved"));
    expect(resolved, name).toHaveLength(1);
    expect(resolved[0]).toContain("no-issue warning emitted");
  });

  it.each(PHASES)("%s: every Failure Path comment post sits behind the ISSUE_ID guard", (name) => {
    const failure = section(workflow(name), /Failure Path/).split("\n");
    const blocks = trackerBlocks(failure);
    const posts = commentPosts(failure);
    expect(posts.length, name).toBeGreaterThan(0);
    for (const i of posts) {
      expect(
        guardedPost(failure, blocks, i),
        `${name}: Failure Path line ${i + 1}: ${failure[i]!.trim()}`,
      ).toBe(true);
    }
  });

  it("build 18.9 and debug 11.9 kill-switch checks skip when ISSUE_ID is empty", () => {
    for (const [name, step] of [
      ["build", /Step 18 — Close Workflow/],
      ["debug", /Step 11 — Close Workflow/],
    ] as const) {
      const lines = section(workflow(name), step).split("\n");
      const at = lines.findIndex((l) => /^9\. .*(?:post-push|kill-switch)/i.test(l));
      expect(at, `${name}: kill-switch sub-step 9`).toBeGreaterThanOrEqual(0);
      const [from, to] = itemRange(lines, at);
      const blocks = blocksWithin(lines, from, to);
      expect(blocks.length, name).toBeGreaterThan(0);
      for (const b of blocks) {
        expect(
          lines.slice(b.start, b.end + 1).some((l) => l.includes(SKIP_NO_ISSUE)),
          `${name} sub-step 9: ${b.kind} block at line ${b.start + 1} has no Skip if ISSUE_ID empty`,
        ).toBe(true);
      }
    }
  });

  it("build Step 1 blocker check skips when ISSUE_ID is empty", () => {
    const step1 = section(workflow("build"), /Step 1 — Start Workflow/).split("\n");
    const blockers = blockerBlocks(step1);
    expect(blockers).toHaveLength(3);
    for (const b of blockers) {
      expect(step1.slice(b.start, b.end + 1).join("\n")).toContain(SKIP_NO_ISSUE);
    }
  });

  it("design Step 11 requires an issue", () => {
    const step11 = section(workflow("design"), /Step 11 — Suggest Workstreams/);
    const trueBlock = step11.slice(step11.indexOf("bkit:tracker true start"));
    expect(trueBlock.indexOf(SKIP_NO_ISSUE), "no Skip if line in the true block").toBeGreaterThan(
      -1,
    );
    expect(trueBlock.indexOf(SKIP_NO_ISSUE)).toBeLessThan(trueBlock.indexOf("workstreams parse"));
    expect(trueBlock).toMatch(/Skip if\*\* `ISSUE_ID` empty → Step 12/);
  });

  it("debug Step 1 never probes for a PR on dev or main", () => {
    const step1 = section(workflow("debug"), /Step 1 — Start Workflow/).split("\n");
    const at = step1.findIndex((l) => l.includes('"{BKIT}" prs probe'));
    expect(at, "no prs probe fence in Step 1").toBeGreaterThan(0);
    const intro = step1.slice(Math.max(0, at - 3), at).join("\n");
    expect(intro).toContain("`BRANCH` = `dev` **or** `main`");
    expect(intro).toContain("`PUSH_MODE` = LOCAL → step 7. **Else** → find the open PR");
  });
});

const AGENTS_MD = fs.readFileSync(path.join(REPO_ROOT, ".bkit", "core", "AGENTS.md"), "utf-8");

it("AGENTS.md router does not STOP on a missing issue", () => {
  expect(AGENTS_MD).not.toContain("No issue ID provided");
  const router = AGENTS_MD.split("\n").find((l) => l.startsWith("**If** no `ISSUE_ID`"));
  expect(router, "no router line for a missing ISSUE_ID").toBeDefined();
  expect(router).not.toContain("STOP");
  expect(router).toContain("keep `ISSUE_ID` empty → Step 2");
});

// ---------------------------------------------------------------------------
// Debug on dev: works in place, own paths, own commits, waits for the dev CI run.
// ---------------------------------------------------------------------------

describe("debug on dev", () => {
  const debug = workflow("debug");

  it("debug diffs against DIFF_BASE on dev", () => {
    expect(debug).not.toContain("origin/dev..HEAD");
    const guard = debug.split("\n").find((l) => l.includes("**Large Diff Guard:**"));
    expect(guard).toContain("git diff {DIFF_BASE}...HEAD");
    const step2 = section(debug, /Step 2 — Worktree Setup/);
    expect(step2).toContain("`startSha` as `{DIFF_BASE}`");
    expect(step2).toContain("`origin/dev` when null");
  });

  it("debug Steps 9 and 10 push nothing on dev", () => {
    for (const heading of [/Step 9 — Push Remediation/, /Step 10 — Summary/]) {
      const lines = section(debug, heading).split("\n");
      const pushes = pushFences(lines);
      expect(pushes.length, `${heading}: no branches push fence`).toBeGreaterThan(0);
      for (const i of pushes) {
        // Opening fence at i - 1; the line above it carries the dev skip.
        expect(lines[i - 2], `${heading}: push at line ${i + 1}`).toContain(
          "**Skip if** `BRANCH` = `dev`",
        );
      }
    }
  });

  it("the TRIGGER_PR commit is unreachable on dev", () => {
    const adds = debug.split("\n").filter((l) => l.includes("git add -A"));
    expect(adds).toHaveLength(1);
    const step11 = section(debug, /Step 11 — Close Workflow/);
    expect(step11).toMatch(
      /`BRANCH` = `dev` \*\*or\*\* `main` → push to trigger branch \(CI fires\) → `TRIGGER_PR` = 0/,
    );
    expect(
      step11.indexOf("**If** `TRIGGER_PR` = 1 → commit and push the CI-triggering head"),
    ).toBeGreaterThan(-1);
    expect(debug).not.toContain("git push origin");
  });

  it("debug stops and asks on a foreign path", () => {
    const line = debug.split("\n").find((l) => l.includes("**Foreign path:**"));
    expect(line, "no Foreign path line").toBeDefined();
    expect(line).toContain("**STOP**");
    expect(line).toContain("ask the human");
    expect(line).not.toMatch(/→ \*\*Failure Path\*\*/);
  });
});
