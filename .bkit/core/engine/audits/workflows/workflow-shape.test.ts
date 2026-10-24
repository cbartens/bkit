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

  // `tests run --artifact` copies the log beside the run's artifacts, resets the
  // step's clamp log and trims it in one call; no workflow does it by hand.
  const ARTIFACTS: Array<[string, string]> = [
    [
      "build",
      '--artifact="docs/plans/{YYYYMM}/logs/{FID}/build-subplan-gate-{SUB_PLAN}-{VERIFY_ATTEMPT}.md" --fid={FID} --step=build-subplan-gate-{SUB_PLAN} --attempt={VERIFY_ATTEMPT}',
    ],
    [
      "build",
      '--artifact="docs/plans/{YYYYMM}/logs/{FID}/run-tests-{TEST_ATTEMPT}.md" --fid={FID} --step=build-run-tests --attempt={TEST_ATTEMPT}',
    ],
    [
      "debug",
      '--artifact="docs/plans/{YYYYMM}/logs/{FID}/context-tests-local-{DEBUG_ATTEMPT}.md" --fid={FID} --step=debug-run-tests --attempt={DEBUG_ATTEMPT}',
    ],
  ];

  it.each(ARTIFACTS)(
    "%s writes the trimmed gate log with `tests run --artifact`",
    (name, flags) => {
      const lines = commandLines(workflow(name), "tests run").filter((l) => l.includes(flags));
      expect(lines, flags).toHaveLength(1);
    },
  );

  it.each(["build", "debug"])("%s never copies or clamps a gate log by hand", (name) => {
    const text = workflow(name);
    expect(text).not.toMatch(/^\s*cp "\{OUTBOX\}\/[^"]*\.log"/m);
    for (const line of commandLines(text, "context clamp")) {
      expect(line, line).not.toContain("--profile=debug-evidence");
    }
  });

  it.each(["build", "debug"])(
    "%s routes the test failures on the engine's count, never a count from the log",
    (name) => {
      const text = workflow(name);
      expect(text).toContain("`failures` as `{TEST_FAILURES}`");
      expect(text).toContain(
        "`{FAILURES_FLAG}` = `--failures={TEST_FAILURES}`, empty when `TEST_FAILURES` = null",
      );
      expect(text).not.toContain("failing test suites");
    },
  );
});

describe("debug Step 1 start decisions", () => {
  const step1 = () => section(workflow("debug"), /Step 1 — Start Workflow/);

  it("decides attempt, mode, repro and gates with one `status route --prompt-file`", () => {
    const [line, ...more] = commandLines(step1(), "status route");
    expect(more).toEqual([]);
    expect(line).toContain('--prompt-file="{SESSION_DIR}/prompt.md"');
    for (const held of [
      "`debugAttempt` as `{DEBUG_ATTEMPT}`",
      "`debugMode` as `{DEBUG_MODE}`",
      "`soakEntry` as `{SOAK_ENTRY}`",
      "`repro` as `{REPRO}`",
      "`gates` as `{GATES}`",
    ])
      expect(step1()).toContain(held);
  });

  it("reconstructs nothing in shell or prose", () => {
    const text = step1();
    expect(text).not.toContain("jq ");
    expect(text).not.toContain("SOAK_ROWS");
    expect(text).not.toContain("counters route");
  });

  it("Step 3 reads `[live=off]` from the gates, never from the input file", () => {
    const step3 = section(workflow("debug"), /Step 3 — Run Tests/);
    expect(step3).toContain('"{BKIT}" tests run {GATE_FLAGS} ');
    expect(step3).not.toContain("live=off");
  });
});

describe("Step 1 FID check", () => {
  it.each(PHASES)(
    "%s resolves the FID at Step 1 with `fids resolve`, outside every tracker block",
    (name) => {
      const step1 = section(workflow(name), /Step 1 — Start Workflow/);
      const at = step1.indexOf(`"{BKIT}" fids resolve --prompt-file="{SESSION_DIR}/prompt.md"`);
      expect(at, `${name}: no fids resolve in Step 1`).toBeGreaterThanOrEqual(0);
      // Not inside a tracker block: the last block marker before it closes one (or there is none).
      expect(
        unclosedTrackerMarker(step1.slice(0, at)),
        `${name}: fids resolve sits inside a tracker block`,
      ).toBeUndefined();
      const [line] = commandLines(step1, "fids resolve");
      expect(line).toContain(`--workflow=${name}`);
      expect(step1).toContain("**If** exit 0 → hold `fid` as `{FID}`");
      expect(step1).toContain("**If** exit 4 → **Failure Path** listing `fids`");
      // The chain, the suffixing and the format check all live in the engine.
      for (const gone of ["fids find", "fids free", '"{BKIT}" fids check']) {
        expect(step1, `${name}: ${gone}`).not.toContain(gone);
      }
      // Gate 1 re-checks the FID shape and the lock mechanically.
      const gate = commandLines(step1, "steps gate");
      expect(gate, name).toHaveLength(1);
      expect(gate[0]).toContain("--fid={FID}");
      expect(gate[0]).toContain("--token={LOCK_TOKEN}");
    },
  );

  it.each(PHASES)(
    "%s writes the session prompt to a file and reads it with `fids parse`",
    (name) => {
      const step1 = section(workflow(name), /Step 1 — Start Workflow/);
      expect(step1).toContain("`sessionDir` as `{SESSION_DIR}`");
      expect(step1).toContain("Write the session prompt verbatim to `{SESSION_DIR}/prompt.md`");
      expect(step1).toContain('"{BKIT}" fids parse --prompt-file="{SESSION_DIR}/prompt.md"');
      expect(step1).toContain("Hold `fidNamed` as `{FID_NAMED}`");
      expect(step1).not.toContain("Extract from session prompt");
      expect(step1).not.toContain("tr '[:upper:]' '[:lower:]'");
    },
  );
});

describe("resume facts", () => {
  it.each(PHASES)("%s resumes from `lastDoneStep`, never a hand fold", (name) => {
    const resume = workflow(name)
      .split("\n")
      .filter((l) => l.startsWith("> - **Resume:**"));
    expect(resume, name).toHaveLength(1);
    expect(resume[0]).toContain("`workflows start` prints `lastDoneStep`");
  });

  it("build resumes an open decision from `openDecision`, not a file scan", () => {
    const text = workflow("build");
    expect(text).toContain("its `openDecision` != null");
    for (const field of [
      "decision",
      "question",
      "pauseStep",
      "subPlan",
      "verifyAttempt",
      "testAttempt",
      "plan",
    ]) {
      expect(text).toContain(`\`${field}\` as`);
    }
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
        `"{BKIT}" workflows handover --post --workflow=${name} --fid={FID} --month={YYYYMM} --push --worktree="{WORKTREE_PATH}"`,
      ]);
      expect(failure).toContain("**Skip if** `{WORKTREE_PATH}` is not set");
      expect(failure).not.toContain("branches push --mode=abort");
      expect(failure).not.toMatch(/HANDOVER_NEEDED` = true → step 4\. \*\*Else\*\* → step 6/);
    },
  );

  it("ship flushes through `workflows handover --flush`", () => {
    const failure = section(workflow("ship"), /Failure Path/);
    expect(failure).toContain('"{BKIT}" workflows handover --post --workflow=ship');
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

  it("plan's complexity verdict comes from the engine's plan-check count", () => {
    const plan = workflow("plan");
    const line = commandLines(plan, "steps finish").find((l) =>
      l.includes("--step=plan-complexity-check"),
    );
    expect(line).toContain("--verdict={COMPLEXITY_VERDICT}");
    expect(line).toContain("--allowed=SINGLE,SPLIT");
    expect(line).not.toContain("--agent=");
    expect(commandLines(plan, "tests plan-check").length).toBeGreaterThan(0);
    expect(plan).not.toContain("bkit-plan-complexity-check");
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

describe("diff per reader", () => {
  // Every agent that reads the run's diff gets a fresh `tmp/bkit-diff-{FID}.md`,
  // written by `context diff` in the same sub-step, just before the agent.
  // Debug runs on dev, so its diff names the base the run started from.
  const BASE_FLAG: Record<string, string> = { build: "", debug: " --base={DIFF_BASE}", ship: "" };
  const READERS: Array<[string, RegExp, string, string[]]> = [
    ["build", /Failure Path/, "abort-handover", ["bkit-debug-abort-handover"]],
    ["build", /Sub-Plan Loop/, "build-plan-verify", ["bkit-build-plan-verify"]],
    ["build", /Step 9 — /, "build-plan-verify-holistic", ["bkit-build-plan-verify"]],
    [
      "build",
      /Step 10 — Build Challenge/,
      "build-challenge",
      ["bkit-build-challenge-1", "bkit-build-challenge-2"],
    ],
    ["debug", /Failure Path/, "abort-handover", ["bkit-debug-abort-handover"]],
    ["debug", /Step 10 — Summary/, "debug-summary", ["bkit-debug-summary"]],
    ["ship", /Failure Path/, "abort-handover", ["bkit-debug-abort-handover"]],
    ["ship", /Step 5 — /, "ship-deferred-sweep", ["bkit-ship-deferred-sweep"]],
  ];

  it.each(READERS)(
    "%s %s writes the diff right before its agents",
    (name, heading, step, agents) => {
      const text = section(workflow(name), heading);
      const [line, ...more] = commandLines(text, "context diff");
      expect(more, `${step}: one diff call`).toEqual([]);
      expect(line).toContain(
        `context diff --reset-log --artifact="tmp/bkit-diff-{FID}.md"${BASE_FLAG[name]} --fid={FID} --step=${step}`,
      );
      for (const agent of agents) {
        const invoke = text.indexOf(`**Subagent:** Invoke \`@${agent}\``);
        expect(invoke, agent).toBeGreaterThan(text.indexOf(line!));
        const read = text
          .slice(invoke)
          .split("\n")
          .find((l) => l.trim().startsWith("Read:"));
        expect(read, agent).toContain("`tmp/bkit-diff-{FID}.md` (the run's diff");
      }
    },
  );

  it.each(["build", "debug", "ship"])("%s hands no agent a raw `git diff`", (name) => {
    const text = workflow(name);
    expect(text).not.toContain("Large Diff Guard");
    for (const read of text.split("\n").filter((l) => l.trim().startsWith("Read:")))
      expect(read).not.toMatch(/`git diff [^`]*\.\.\.HEAD`/);
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
    "%s reads its related issues through one `issues related` call",
    (name) => {
      const text = workflow(name);
      const calls = commandLines(text, "issues related");
      expect(calls, name).toHaveLength(1);
      expect(calls[0]).toContain('--hits-file="{OUTBOX}/related-hits.json"');
      expect(calls[0]).toContain("--out=");
      // Unparseable comments are the engine's to skip, not the workflow's.
      expect(text).not.toContain("Skipped: comments did not parse.");
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

describe("final return at the close", () => {
  it.each(PHASES)(
    "%s builds its final message in `workflows close` and displays it verbatim",
    (name) => {
      const text = workflow(name);
      const lines = text.split("\n");
      const close = commandLines(text, "workflows close").filter((l) =>
        l.includes("--final-return"),
      );
      expect(close, name).toHaveLength(1);
      expect(close[0]).toContain('--session-dir="{SESSION_DIR}"');
      // Setup tips are appended by the engine, never collected by the workflow.
      expect(commandLines(text, "tips"), name).toEqual([]);
      expect(text).not.toContain("{BKIT_TIPS}");
      const finalIdx = lines.findIndex((l) => /^\d+\. Final return:/.test(l));
      expect(finalIdx, name).toBeGreaterThanOrEqual(0);
      expect(lines[finalIdx]).toContain("display `{FINAL_RETURN}` verbatim");
    },
  );

  it.each(PHASES.filter((p) => p !== "ship"))("%s passes its summary file", (name) => {
    const close = commandLines(workflow(name), "workflows close").filter((l) =>
      l.includes("--final-return"),
    );
    expect(close[0]).toContain("--summary-file=");
  });

  // Ship's summary may be absent (PR merged on entry): the engine supplies the missing line.
  it("ship passes its summary path plus the missing-summary line", () => {
    const close = commandLines(workflow("ship"), "workflows close").filter((l) =>
      l.includes("--final-return"),
    );
    expect(close[0]).toContain(
      '--summary="docs/plans/{YYYYMM}/logs/{FID}/ship-summary.md" --summary-missing=',
    );
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

/**
 * A Failure Path comment post is guarded on its own line, by a Skip line in its tracker block, or
 * is the `tracker.done` = false fallback: with no issue the engine prints `skipped`, never `done`.
 */
function guardedPost(lines: string[], blocks: TrackerBlock[], i: number): boolean {
  const block = innermostBlock(blocks, i);
  return (
    /`ISSUE_ID` (?:non-)?empty/.test(lines[i]!) ||
    lines[i]!.includes("`tracker.done` = false → post `comment`") ||
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
      ["github", "linear", "jira", "true"].includes(b.kind) &&
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
    const wired = trackerBlocks(step1).filter((b) =>
      ["github", "linear", "jira", "true"].includes(b.kind),
    );
    expect(wired.length, name).toBeGreaterThan(0);
    for (const b of wired) {
      const block = step1.slice(b.start, b.end + 1);
      // A STOP here answers an engine exit (a bad branch name, a ship of dev), never a missing issue.
      for (const stop of block.filter((l) => l.includes("STOP"))) {
        expect(stop, `${name}: ${b.kind} block at Step 1 line ${b.start + 1}`).toMatch(
          /\*\*If\*\* exit \d+\b[^\n]*\*\*STOP\*\*/,
        );
        expect(stop).not.toContain("`ISSUE_ID` empty");
      }
      expect(block.join("\n")).not.toContain("No issue ID in the session prompt");
    }
  });

  it.each(PHASES)("%s: fids resolve and steps gate carry --issue in every workflow", (name) => {
    // The flag sits in a tracker block (a `none` run has no issue), so read the wired render.
    const text = substituteWorkflow(workflow(name), "github").output;
    const step1 = section(text, /Step 1 — Start Workflow/);
    expect(commandLines(step1, "fids resolve"), name).toEqual([
      expect.stringContaining('--issue="{ISSUE_ID}" --title-file="{SESSION_DIR}/issue-facts.json"'),
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
    // The close passes the warning to the engine, which puts it first in `{FINAL_RETURN}`.
    expect(final, `${name}: Final return`).toContain("`{FINAL_RETURN}` verbatim");
    expect(text, `${name}: close --warning`).toContain(
      '**If** the no-issue warning was emitted → add `--warning="<that warning>"`.',
    );
    expect(section(text, /Failure Path/), `${name}: Failure Path STOP`).toContain(FINAL_FIRST_LINE);
    const failDisplay = lines.filter((l) => l.includes("`SUMMARY_VERDICT` = FAIL → display"));
    expect(failDisplay.length, `${name}: summary-FAIL display`).toBe(1);
    expect(failDisplay[0], `${name}: summary-FAIL display`).toContain(FINAL_FIRST_LINE);
  });

  it.each(PHASES)("%s: no wired-tracker block extracts the issue from the prompt", (name) => {
    const step1 = section(workflow(name), /Step 1 — Start Workflow/).split("\n");
    const extract = trackerBlocks(step1)
      .filter((b) => ["github", "linear", "jira"].includes(b.kind))
      .map((b) => step1.slice(b.start, b.end + 1).join("\n"))
      .filter((t) => t.includes("Extract from session prompt"));
    expect(extract, name).toEqual([]);
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

  it("build counts sub-plans with `fids plans`, and ship checks the plan with it", () => {
    expect(workflow("build")).toContain('"{BKIT}" fids plans --fid={FID} --month={YYYYMM}');
    expect(workflow("build")).toContain('if [ "{PLAN_SOURCE}" = none ]; then');
    expect(workflow("ship")).toContain('"{BKIT}" fids plans --fid="{FID}" --month="{YYYYMM}"');
    expect(workflow("ship")).toContain('if [ "{PLAN_SOURCE}" = none ]; then');
    for (const name of ["build", "ship"]) {
      expect(workflow(name), name).not.toMatch(/find [^\n]*-name '\{FID\}-plan/);
    }
  });

  it("plan reads the parent design and audit reports from `fids design`", () => {
    const step1 = section(workflow("plan"), /Step 1 — Start Workflow/);
    expect(step1).toContain('--prompt-file="{SESSION_DIR}/prompt.md"');
    expect(step1).toContain('--description-file="{SESSION_DIR}/issue-description.md"');
    expect(step1).toContain("Hold `auditPaths` as `{AUDIT_PATHS}`");
    expect(step1).toContain(
      "hold `parentFid` as `{PARENT_FID}`, `parentMonth` as `{PARENT_YYYYMM}`",
    );
  });

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

  it.each(PHASES)("%s: tracker gate items name the attempt, never its skip rule", (name) => {
    const items = workflow(name)
      .split("\n")
      .filter((l) =>
        /^- \[ \] (?:Issue update attempted|Artifact link list|Blocker check attempted|Kill-switch propagation|Auto-label presence|Marker `bkit \[auto route\]`)/.test(
          l,
        ),
      );
    expect(items.length, name).toBeGreaterThan(0);
    for (const item of items) expect(item, name).not.toContain("skipped when");
    const resolved = workflow(name)
      .split("\n")
      .filter((l) => l.startsWith("- [ ] Issue resolved"));
    expect(resolved, name).toHaveLength(1);
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
    expect(blockers).toHaveLength(1);
    expect(step1.join("\n")).toContain('"{BKIT}" issues blocked-by --issue="{ISSUE_ID}"');
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
    for (const line of commandLines(debug, "context diff"))
      expect(line).toContain("--base={DIFF_BASE}");
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
    const commits = debug
      .split("\n")
      .filter((l) => /"\{BKIT\}" branches push\b.*--commit=/.test(l));
    expect(commits).toHaveLength(1);
    expect(debug).not.toContain("git add -A");
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
