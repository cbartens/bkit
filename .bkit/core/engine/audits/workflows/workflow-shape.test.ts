// Workflow shapes the reviews pinned: each test reads the shipped `.bkit/core/workflows/*.md`
// and fails when the shape a command or route depends on is gone.

import * as fs from "node:fs";
import * as path from "node:path";

import { describe, expect, it } from "vitest";

import { callWords, stepSections } from "../../checks/status-holes";
import { COMMANDS } from "../../commands/registry";
import { WORKFLOW_STEPS } from "../../commands/workflow/step-table";
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

/** The text of one `## ` or `### ` step, found by a pattern on its heading line, its gate included. */
function stepBody(text: string, heading: RegExp): string {
  const lines = text.split("\n");
  const start = lines.findIndex((l) => /^#{2,3} /.test(l) && heading.test(l));
  expect(start, `no step matching ${heading}`).toBeGreaterThanOrEqual(0);
  const end = lines.findIndex((l, i) => i > start && /^#{2,3} (?!🔒)/.test(l));
  return lines.slice(start, end === -1 ? undefined : end).join("\n");
}

/** Every line that runs a given `bkit` verb, continuation lines joined. */
const commandLines = (text: string, verb: string) =>
  text
    .replace(/\\\n\s*/g, " ")
    .split("\n")
    .filter((l) => l.includes(`"{BKIT}" ${verb}`));

/** Agents whose `Read:` line, within three lines of their `Invoke`, names `file`; sorted, deduped. */
function agentsReading(text: string, file: string): string[] {
  const lines = text.split("\n");
  const agents = lines.flatMap((l, i) => {
    const agent = /Invoke `@([a-z0-9-]+)`/.exec(l)?.[1];
    const read = lines.slice(i, i + 4).find((x) => x.trim().startsWith("Read:"));
    return agent && read?.includes(file) ? [agent] : [];
  });
  return [...new Set(agents)].sort();
}

/** The marker line of a tracker block still open at the end of `text`; undefined when none is. */
function unclosedTrackerMarker(text: string): string | undefined {
  const lastOpen = text.lastIndexOf("<!-- bkit:tracker");
  const tail = text.slice(lastOpen);
  const closes = /^<!-- bkit:tracker \S+ end -->/.test(tail);
  return lastOpen === -1 || closes ? undefined : tail.split("\n")[0];
}

/** Each `"{BKIT}" noun verb --flag` call in `text` whose verb or flag the CLI lacks. */
function unknownCalls(text: string): string[] {
  const specs = new Map(COMMANDS.map((c) => [c.noun, c]));
  const problems: string[] = [];
  const joined = text.replace(/\\\n\s*/g, " ");
  for (const call of joined.split('"{BKIT}" ').slice(1)) {
    const [noun, verb, ...rest] = callWords(call);
    const spec = noun === undefined ? undefined : specs.get(noun);
    if (!spec) continue; // a top-level command (`install`, `tips`) or prose
    const verbSpec = verb === undefined ? undefined : spec.verbs[verb];
    if (!verbSpec) {
      problems.push(`${noun} ${verb}: no such verb`);
      continue;
    }
    const known = new Set(verbSpec.flags.map((f) => f.name));
    for (const word of rest) {
      const flag = /^--([a-z][a-z0-9-]*)/.exec(word)?.[1];
      if (flag && flag !== "help" && !known.has(flag))
        problems.push(`${noun} ${verb}: no --${flag}`);
    }
  }
  return problems;
}

describe("engine calls", () => {
  it.each(ALL)("%s calls only verbs and flags the CLI has", (name) => {
    expect(unknownCalls(workflow(name)), name).toEqual([]);
  });

  it("the call check reports an unknown verb and an unknown flag", () => {
    expect(
      unknownCalls('"{BKIT}" steps nosuch --x\n"{BKIT}" steps finish --nosuch-flag=1'),
    ).toEqual(["steps nosuch: no such verb", "steps finish: no --nosuch-flag"]);
  });

  it("no workflow names a removed sub-plan flag", () => {
    for (const name of ALL)
      expect(workflow(name), name).not.toMatch(/--sub-plan|--plan-source|--brief=|--children/);
  });
});

describe("bkit lookup", () => {
  it.each(ALL)("%s resolves the binary once, in Step 1, and holds it as BKIT", (name) => {
    const text = workflow(name);
    expect(text).not.toContain('BKIT="$(dirname');
    expect(text).not.toContain('"$BKIT"');
    const lookups = text
      .split("\n")
      .filter((l) => l.trimStart().startsWith('"$(dirname "$(git rev-parse'));
    expect(lookups, name).toHaveLength(1);
    expect(lookups[0]).toContain('node_modules/.bin/bkit" repo info');
    // The held name carries no braces; a clause-owned line may still brace it.
    expect(section(text, /Step 1 — Start Workflow/)).toMatch(/[Hh]old `bkit` as `\{?BKIT\}?`/);
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
      '--artifact="docs/plans/{YYYYMM}/logs/{FID}/build-group-gate-{GROUP}-{VERIFY_ATTEMPT}.md" --fid={FID} --step=build-group-gate-{GROUP} --attempt={VERIFY_ATTEMPT}',
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
      expect(text).toContain("`failures` as `TEST_FAILURES`");
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
      "`debugAttempt` as `DEBUG_ATTEMPT`",
      "`debugMode` as `DEBUG_MODE`",
      "`repro` as `REPRO`",
      "`gates` as `GATES`",
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
      expect(step1).toContain("**If** exit 0 → hold `fid` as `FID`");
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
      expect(step1).toContain("`sessionDir` as `SESSION_DIR`");
      expect(step1).toContain("Write the session prompt verbatim to `{SESSION_DIR}/prompt.md`");
      expect(step1).toContain('"{BKIT}" fids parse --prompt-file="{SESSION_DIR}/prompt.md"');
      expect(step1).toContain("Hold `fidNamed` as `FID_NAMED`");
      expect(step1).not.toContain("Extract from session prompt");
      expect(step1).not.toContain("tr '[:upper:]' '[:lower:]'");
    },
  );
});

describe("resume facts", () => {
  it("build resumes an open decision from `openDecision`, not a file scan", () => {
    const text = workflow("build");
    expect(text).toContain("**If** Step 2's `workflows start` printed `openDecision` != null");
    expect(text).not.toContain("holds `Status: OPEN` → resume");
    for (const field of [
      "decision",
      "question",
      "pauseStep",
      "group",
      "verifyAttempt",
      "testAttempt",
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

  it.each(["design", "plan", "build", "debug"])(
    "%s removes only files the run created by mistake, never other agents' changes",
    (name) => {
      const failure = section(workflow(name), /Failure Path/);
      expect(failure).not.toContain("remove unintended files");
      expect(failure).toContain(
        "on a feature branch remove only the `modified` / `untracked` files this run created by mistake, NEVER other agents' changes;",
      );
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

/** The build step table's numbers carried by more than one step, each list sorted. */
function sharedStepNumbers(): string[][] {
  const byNumber = new Map<number, string[]>();
  for (const row of WORKFLOW_STEPS.build.filter((s) => s.step !== undefined)) {
    const steps = byNumber.get(row.number) ?? [];
    steps.push(row.step!);
    byNumber.set(row.number, steps);
  }
  return [...byNumber.values()]
    .filter((steps) => steps.length > 1)
    .map((steps) => steps.sort())
    .sort((a, b) => a[0]!.localeCompare(b[0]!));
}

/** Finish lines in `text` posting a number or title the build step table's row does not carry. */
function commentNumberProblems(text: string): string[] {
  const rows = WORKFLOW_STEPS.build.filter((s) => s.step !== undefined);
  const byStep = new Map(rows.map((s) => [s.step!, s]));
  const byNumber = new Map<number, string[]>();
  for (const row of rows)
    byNumber.set(row.number, [...(byNumber.get(row.number) ?? []), row.step!]);
  return commandLines(text, "steps finish").flatMap((line) => {
    const step = /--step=([a-z0-9-]+)/.exec(line)?.[1];
    // The Decision Pause writes its own row under the paused step's number.
    if (step === undefined || step === "build-decision") return [];
    const row = byStep.get(step);
    if (row === undefined) return [`${step}: no row in the build step table`];
    if (!line.includes(`--number=${row.number}`))
      return [`${step}: posts a number other than ${row.number}`];
    // A number two steps share lets each post under its own title.
    if (byNumber.get(row.number)!.length > 1) return [];
    const title = row.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`--title="?${title}"?(?=\\s)`).test(line)
      ? []
      : [`${step}: posts a title other than "${row.title}"`];
  });
}

/** The `steps finish` lines in `text` running `step`. */
function stepFinishLines(text: string, step: string): string[] {
  return commandLines(text, "steps finish").filter((l) => l.includes(`--step=${step}`));
}

/** `lines` without the ones naming an agent. */
function withNoAgent(lines: string[]): string[] {
  return lines.filter((l) => !l.includes("--agent"));
}

/** A live doc naming a build step by number, and the build table row its sentence means. */
const LIVE_DOC_CLAIMS: ReadonlyArray<{ file: string; pattern: RegExp; step: string }> = [
  {
    file: "docs/deployments.md",
    pattern: /Gate sites \(2\):\*\* build Step (\d+)/,
    step: "build-close-workflow",
  },
  {
    file: "docs/deployments.md",
    pattern: /Open-PR pre-flight \(build Step (\d+)\)/,
    step: "build-close-workflow",
  },
  {
    file: ".bkit/cloud.md",
    pattern: /`bkit-build` Step (\d+) close-workflow/,
    step: "build-close-workflow",
  },
  {
    file: ".bkit/core/.bkit/cloud.md",
    pattern: /`bkit-build` Step (\d+) close-workflow/,
    step: "build-close-workflow",
  },
];

/** Each live-doc build-step number that disagrees with the number its table row carries. */
function staleStepRefs(
  claims: ReadonlyArray<{ file: string; pattern: RegExp; step: string }>,
): string[] {
  const numbers = new Map(
    WORKFLOW_STEPS.build.map((s): [string, number] => [s.step ?? "", s.number]),
  );
  return claims.flatMap(({ file, pattern, step }) => {
    const expected = numbers.get(step);
    const named = pattern.exec(fs.readFileSync(path.join(REPO_ROOT, file), "utf-8"))?.[1];
    if (expected === undefined) return [`${file}: the build table carries no ${step} row`];
    if (named === undefined) return [`${file}: no ${step} step number named`];
    return Number(named) === expected
      ? []
      : [`${file}: ${step} at Step ${named}, the table carries ${expected}`];
  });
}

describe("build", () => {
  const build = workflow("build");

  it("Step 13's diagnose agent reads the committed log, not the outbox copy", () => {
    const step13 = section(build, /Step 13 — Failure Diagnose/);
    const read = step13.split("\n").find((l) => l.trim().startsWith("Read:"));
    expect(read).toContain("`docs/plans/{YYYYMM}/logs/{FID}/run-tests-{TEST_ATTEMPT}.md`");
    expect(read).not.toContain("{OUTBOX}");
  });

  it("writes the challenge attempt on every row, counted from the challenge's own rows", () => {
    const line = commandLines(build, "steps finish").find((l) =>
      l.includes("--step=build-challenge "),
    );
    expect(line).toContain("--attempt=next");
    expect(build).not.toContain("ATTEMPT_FLAG");
  });

  it("Step 11 merges the findings into the plan and routes on the merge", () => {
    const step11 = section(build, /Step 11 — Build Challenge/);
    const merge = commandLines(step11, "challenge merge");
    expect(merge).toHaveLength(1);
    for (const flag of [
      '--report="docs/plans/{YYYYMM}/logs/{FID}/build-challenge-1.md"',
      '--report="docs/plans/{YYYYMM}/logs/{FID}/build-challenge-2.md"',
      '--plan="docs/plans/{YYYYMM}/{FID}-plan.md"',
      '--log="docs/plans/{YYYYMM}/logs/{FID}"',
      "--round={CHALLENGE_ROUND}",
    ])
      expect(merge[0], flag).toContain(flag);
    for (const route of [
      "`MERGE_ROUTE` = `none` → Step 12",
      "`MERGE_ROUTE` = `pause`",
      "`MERGE_ROUTE` = `fix`",
      "exit 22",
    ])
      expect(step11, route).toContain(route);
    expect(step11).toContain(
      "`PAUSE_STEP` = 11, `PAUSE_POINT` = `build.challenge`, `PAUSE_QUESTION` = `CHALLENGE`",
    );
    expect(step11).toContain("hold `route` as `MERGE_ROUTE`");
    expect(step11, "the merge route reads the held name, never the bare field").not.toMatch(
      /\*\*If\*\* `route` =/,
    );
    expect(step11).toContain(
      "**If** `CHALLENGE_ROUND` = `CHALLENGE_MAX` already → `CHALLENGE_DONE` = true.",
    );
  });

  it("Step 11 records its round on the challenge row and reads it back from status.jsonl", () => {
    const step11 = section(build, /Step 11 — Build Challenge/);
    const finish = commandLines(step11, "steps finish");
    expect(finish).toHaveLength(1);
    expect(finish[0]).toContain("--field=round={CHALLENGE_ROUND}");
    expect(commandLines(step11, "status resume")).toHaveLength(1);
    expect(step11).toContain("`CHALLENGE_ROUND` = `challengeRound`");
    expect(build, "the round is never searched for in plan files").not.toMatch(
      /grep -l '[^']*Round:/,
    );
  });

  it("a resumed challenge pause rebuilds CHALLENGE_TASKS from `challenge merge`, not the decision file", () => {
    const resumeLine = build.split("\n").find((l) => l.includes("**Resume:**"))!;
    expect(resumeLine).not.toContain("the decision file's task numbers");
    expect(resumeLine).toContain("Step 11 sub-steps 2 and 5");
    expect(resumeLine).toContain("`fixTasks` as `CHALLENGE_TASKS`");
    expect(resumeLine).toContain("NEVER sub-step 6");
  });

  it("the decision row records its route, which `status resume` maps", () => {
    const pause = section(build, /Decision Pause/);
    const finish = commandLines(pause, "steps finish");
    expect(finish).toHaveLength(1);
    expect(finish[0]).toContain("--field=route={DECISION_ROUTE}");
    for (const route of [
      "`DECISION_ROUTE` = `fix`",
      "`DECISION_ROUTE` = `verify`",
      "`DECISION_ROUTE` = `tests`",
    ])
      expect(pause, route).toContain(route);
    expect(pause.indexOf("`DECISION_ROUTE` = `fix`")).toBeLessThan(pause.indexOf("--field=route="));
  });

  it("the last allowed challenge round never runs another", () => {
    const pause = section(build, /Decision Pause/);
    expect(pause).toContain(
      "`CHALLENGE_ROUND` = `CHALLENGE_MAX` already → `CHALLENGE_DONE` = true",
    );
    expect(section(build, /Step 11 — Build Challenge/)).toContain(
      '"{BKIT}" counters max --point=build.challenge',
    );
    const step11 = section(build, /Step 11 — Build Challenge/);
    const first = step11.slice(step11.indexOf("\n1. "), step11.indexOf("\n2. "));
    expect(first).toContain("`CHALLENGE_DONE` = true → Step 12");
    expect(first).toContain("`challengeDone`");
    const resumeLine = build.split("\n").find((l) => l.includes("**Resume:**"))!;
    expect(resumeLine).toContain("`CHALLENGE_DONE` = `challengeDone`");
  });

  it("challenge merge exit 23 gets the same one retry as exit 22", () => {
    const step11 = section(build, /Step 11 — Build Challenge/);
    expect(step11).toMatch(/exit 22 \*\*or\*\* 23/);
    expect(step11).toContain("`problems`");
  });

  it("an execute cap stop is a handover, never a FAIL attempt", () => {
    const step7 = stepBody(build, /Step 7 — Plan Execute/);
    expect(step7).toContain("Hold `verdict` as `EXECUTE_VERDICT`");
    expect(step7).toContain("`EXECUTE_VERDICT` = HANDOVER");
    expect(step7).toContain("not a failed attempt");
    const prompt = fs.readFileSync(
      path.join(REPO_ROOT, ".bkit", "core", "prompts", "bkit-build-plan-execute.md"),
      "utf-8",
    );
    expect(prompt).toMatch(/^Verdict: PASS \| HANDOVER \| FAIL/m);
    expect(prompt).toContain("**If** **Create** already exists");
    expect(prompt).toContain("`HANDOVER` =");
  });

  it("build challenge runs the size gate first", () => {
    const step11 = section(build, /Step 11 — Build Challenge/);
    const gate = commandLines(step11, "challenge gate");
    expect(gate.map((l) => l.trim())).toEqual(['"{BKIT}" challenge gate --file="{STATUS}"']);
    expect(step11.indexOf("challenge gate")).toBeLessThan(
      step11.indexOf("Invoke `@bkit-build-challenge-1`"),
    );
    expect(step11).toContain("hold `size` as `CHALLENGE_SIZE`");
    const small = step11.split("\n").filter((l) => l.includes("`CHALLENGE_SIZE` = small"));
    expect(small.join("\n")).toContain("`@bkit-build-challenge-2` only");
    expect(small.join("\n")).toContain("--agent=bkit-build-challenge-1");
    expect(small.join("\n")).toContain("--report");
    expect(commandLines(step11, "steps finish")).toHaveLength(1);
    expect(commandLines(step11, "challenge merge")).toHaveLength(1);
    expect(step11).toContain("Change sized (`challenge gate`)");
  });

  it("names no removed challenge agent, step or limit", () => {
    for (const gone of [
      ...["reconcile", "remediate", "tests"].map((s) => `build-challenge-${s}`),
      `CHALLENGE_${"REMEDIATE"}`,
      "build-challenge.md`",
    ])
      expect(build, gone).not.toContain(gone);
  });

  it("Branch Sync merges docs and finishes as its own step", () => {
    const step3 = section(build, /Step 3 — Branch Sync/);
    expect(step3).toContain('"{BKIT}" branches sync --merge-docs');
    expect(step3).not.toContain("tests plan-check");
    expect(step3).not.toContain("Invoke `@bkit-build-plan-convert`");
    const finish = commandLines(step3, "steps finish");
    expect(finish).toHaveLength(1);
    expect(finish[0]).toContain("--step=build-branch-sync");
    expect(finish[0]).toContain("--number=3");
    expect(finish[0]).toContain('--post --title="Branch Sync"');
    // Its gate names the docs merge alone; the plan check gates Plan Convert.
    expect(stepBody(build, /Gate 3 — Branch Sync/)).not.toContain("plan-check");
  });

  it("Plan Convert checks the plan, converts one with no task markers, and re-checks", () => {
    const step4 = section(build, /Step 4 — Plan Convert/);
    const checks = commandLines(step4, "tests plan-check");
    expect(checks.length).toBeGreaterThanOrEqual(1);
    for (const line of checks) expect(line).toContain('--plan="docs/plans/{YYYYMM}/{FID}-plan.md"');
    const convert = step4.indexOf("Invoke `@bkit-build-plan-convert`");
    expect(convert, "no convert dispatch").toBeGreaterThan(-1);
    expect(step4.indexOf('"{BKIT}" tests plan-check')).toBeLessThan(convert);
    // The converted plan goes back through the same check before the step finishes.
    expect(step4.slice(convert)).toMatch(/re-run sub-step 1/);
    expect(step4).toContain("`markers`");
  });

  it("Plan Convert leaves a valid plan with no newer comments alone", () => {
    const step4 = section(build, /Step 4 — Plan Convert/);
    const skip =
      "**If** exit 0, `CONVERTED` is not held **and** `NEWER_COMMENTS` = 0 → sub-step 4.";
    expect(step4).toContain(skip);
    // That route skips the dispatch and writes the no-agent skip row (sub-step 4).
    expect(step4.indexOf(skip)).toBeLessThan(step4.indexOf("Invoke `@bkit-build-plan-convert`"));
    expect(commandLines(step4, "steps finish")).toHaveLength(2);
    expect(step4.indexOf("--attempt-of=build-plan-convert:next")).toBeGreaterThan(
      step4.indexOf("Invoke `@bkit-build-plan-convert`"),
    );
  });

  it("build's comment numbers match the step table", () => {
    // One number per step; only the pairs sharing a step heading share one.
    expect(sharedStepNumbers()).toEqual([
      ["build-close-workflow", "build-create-pr"],
      ["build-group-gate", "build-plan-verify"],
      ["build-group-start", "build-plan-execute"],
    ]);
    // Each finish line posts the number and title of its own table row.
    expect(commentNumberProblems(build)).toEqual([]);
  });

  it("the convert step posts under Plan Convert's number and title", () => {
    const finish = commandLines(section(build, /Step 4 — Plan Convert/), "steps finish").filter(
      (l) => l.includes("--step=build-plan-convert"),
    );
    expect(finish).toHaveLength(2);
    for (const line of finish) {
      expect(line).toContain("--number=4");
      expect(line).toContain('--post --title="Plan Convert"');
    }
    expect(section(build, /Step 3 — Branch Sync/)).not.toContain("--step=build-plan-convert");
  });

  it("Plan Convert's finish carries the plan-check log as an optional artifact", () => {
    // A plan-less run routes to the convert before the check writes its log, so the log
    // can be absent when the finish runs; a required artifact would exit 7 there and the
    // Plan Convert comment would never post. Optional records it whenever it exists.
    const finish = commandLines(section(build, /Step 4 — Plan Convert/), "steps finish")
      .filter((l) => l.includes("--step=build-plan-convert"))
      .filter((l) => l.includes("--attempt-of="));
    expect(finish).toHaveLength(1);
    expect(finish[0]).toContain(
      "--optional-artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md",
    );
    expect(finish[0]).not.toContain(
      "--artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md",
    );
    // The plan itself stays a required artifact: the finish only runs once it exists.
    expect(finish[0]).toContain("--artifact=docs/plans/{YYYYMM}/{FID}-plan.md");
  });

  it("Plan Current posts a comment whether it runs or skips", () => {
    const finish = stepFinishLines(section(build, /Step 5 — Plan Current/), "build-plan-current");
    expect(finish).toHaveLength(2);
    for (const line of finish) expect(line).toContain("--number=5");
    for (const line of finish) expect(line).toContain('--post --title="Plan Current"');
  });

  it("Plan Current's skipped comment says no plan anchor", () => {
    const step5 = section(build, /Step 5 — Plan Current/);
    const skip = withNoAgent(stepFinishLines(step5, "build-plan-current"));
    expect(skip).toHaveLength(1);
    expect(skip[0]).not.toContain("--artifact");
    expect(skip[0]).toContain('--comment-field="Status=skipped (no plan anchor)"');
    // The skip finishes at once: after the anchor read, before any dispatch.
    const anchor = step5.indexOf('"{BKIT}" branches anchor-read');
    const field = step5.indexOf('--comment-field="Status=skipped (no plan anchor)"');
    expect(anchor).toBeGreaterThan(-1);
    expect(anchor).toBeLessThan(field);
    expect(field).toBeLessThan(step5.indexOf("Invoke `@bkit-build-plan-current`"));
  });

  it("issue comments newer than a valid plan send the build through convert once", () => {
    // `workflows input` counts the comments posted after the plan's last commit; convert
    // writes them into the plan before any code, so every later agent works from it.
    expect(section(build, /Step 2 — Worktree Setup/)).toContain(
      "Hold `newerThanPlan` as `NEWER_COMMENTS`.",
    );
    const step4 = section(build, /Step 4 — Plan Convert/);
    expect(step4).toContain(
      "**If** exit 0, `CONVERTED` is not held **and** `NEWER_COMMENTS` = 0 → sub-step 4.",
    );
    expect(step4).toContain("**If** exit 0 **and** `CONVERTED` is held → Step 5.");
    expect(step4).toMatch(
      /`CONVERTED` is not held \*\*and\*\* \(exit 0 with `NEWER_COMMENTS` > 0,/,
    );
  });

  it("only convert reads the build-input file, and nothing reads a sub-plan", () => {
    // The input file holds the session prompt, the issue and the plan as it arrived — the
    // whole plan again. Every other agent works from the plan or its group's brief (#663);
    // the session prompt's run instructions reach the brief through --note-file.
    const readers = agentsReading(build, "`docs/plans/{YYYYMM}/logs/{FID}/build-input-{RUN}.md`");
    expect(readers).toEqual(["bkit-build-plan-convert"]);
    expect(build).not.toMatch(/sub-plan|SUB_PLAN|SUB_COUNT|NEW_SUB_PLAN/i);
  });

  it("Step 7 takes the next group's brief and hands execute its path", () => {
    const step7 = stepBody(build, /Step 7 — Plan Execute/);
    const brief = commandLines(step7, "context brief");
    expect(brief).toHaveLength(1);
    expect(brief[0]).toContain("--next");
    expect(brief[0]).toContain('--plan="docs/plans/{YYYYMM}/{FID}-plan.md"');
    expect(brief[0]).toContain('--note-file="{SESSION_DIR}/brief-note.md"');
    expect(step7).toContain("drop `--note-file` when `{SESSION_DIR}/brief-note.md` does not exist");
    expect(step7).toContain("`{BRIEF}`");
    expect(step7.indexOf("context brief")).toBeLessThan(
      step7.indexOf("Invoke `@bkit-build-plan-execute`"),
    );
    const finish = commandLines(step7, "steps finish");
    expect(finish).toHaveLength(1);
    expect(finish[0]).toContain("--group={GROUP}");
  });

  it("Step 8 verifies a diff cut from the group's start commit", () => {
    const step8 = stepBody(build, /Step 8 — Plan Verify/);
    const diff = commandLines(step8, "context diff");
    expect(diff).toHaveLength(1);
    expect(diff[0]).toContain("--base={GROUP_BASE}");
    expect(step8).toMatch(/status route --step=build-group-start --group=\{GROUP\}/);
    expect(step8.indexOf("context diff")).toBeLessThan(
      step8.indexOf("Invoke `@bkit-build-plan-verify`"),
    );
    const green = commandLines(step8, "tests green");
    expect(green).toHaveLength(1);
    expect(green[0]).toContain("--group={GROUP}");
  });

  it("the execute prompt logs `DONE — TASK {N}`, the line the brief and the commit check read", () => {
    const prompt = fs.readFileSync(
      path.join(REPO_ROOT, ".bkit", "core", "prompts", "bkit-build-plan-execute.md"),
      "utf-8",
    );
    expect(prompt).toMatch(/^DONE\s*[—–-]+\s*TASK\s+\{N\}/m);
    expect(prompt).not.toMatch(/\*\*Task \{?N\}?:\*\*|DONE — Task/);
    expect(prompt).toContain("build-brief-");
  });

  it("a Fix now edit is checked with plan-check before the loop goes on", () => {
    const pause = section(build, /Decision Pause/);
    const fix = pause.slice(pause.indexOf("**Fix now**"));
    expect(fix).toContain('"{BKIT}" tests plan-check');
    expect(fix).toContain("**TEST FIRST:**");
    expect(pause).toContain("**TEST EXCEPTION:**");
  });

  it("an Accept replaces the task's TEST EXCEPTION field with the owner's reason and date", () => {
    const pause = section(build, /Decision Pause/);
    const accept = pause.slice(pause.indexOf("**Accept**"), pause.indexOf("**Fix now**"));
    expect(accept).toContain("`exception-refused`");
    expect(accept).toContain("`— {human's reason} (owner, {YYYY-MM-DD})`");
    expect(accept).toContain(
      "replaces the task's existing `TEST EXCEPTION` field; NEVER add a second",
    );
  });

  it("build writes one input file with every input in Step 2, before any plan check", () => {
    const step2 = section(build, /Step 2 — Worktree Setup/);
    const input = commandLines(step2, "workflows input").find((l) =>
      l.includes("--workflow=build"),
    );
    expect(input).toBeDefined();
    for (const flag of ["--prompt-file=", "--description-file=", "--comments-file=", "--plan="])
      expect(input, flag).toContain(flag);
    expect(section(build, /Step 4 — Plan Convert/)).not.toContain("workflows input");
  });

  describe("convert and plan-generate prompts", () => {
    const prompt = (name: string) =>
      fs.readFileSync(path.join(REPO_ROOT, ".bkit", "core", "prompts", `${name}.md`), "utf-8");
    const convert = prompt("bkit-build-plan-convert");

    it("convert copies an input's TEST EXCEPTION and never writes its own", () => {
      const step5 = convert.split("\n").find((l) => l.startsWith("5. "))!;
      const rule =
        "NEVER write `TEST EXCEPTION` of your own; copy each `TEST EXCEPTION` field an input writes into its task, word for word.";
      expect(step5).toContain(rule);
      expect(prompt("bkit-plan-generate")).toContain(rule);
    });

    it("convert names no plan format but the task-block one", () => {
      // Convert takes whatever input arrives and writes the current shape; naming an
      // older field form invites the agent to keep it.
      expect(convert).not.toMatch(
        /`Done when`|`Test first`|Test-order exception|converting from the issue/,
      );
    });

    it("convert reads the whole input file; the newer text wins where it and the plan disagree", () => {
      expect(convert).not.toContain("NEVER read or use issue text");
      expect(convert).toContain(
        "**Same scope:** Every task traces to the input file or the existing plan. Add no work that they do not ask for, and drop no work that they do ask for.\n",
      );
      expect(convert).not.toContain("the plan wins");
    });
  });

  it("records the PR URL in artifacts, not a prUrl field", () => {
    expect(build).not.toContain("prUrl");
    const line = commandLines(build, "steps done").find((l) =>
      l.includes("--step=build-create-pr"),
    );
    expect(line).toContain("--artifact={PR_URL}");
  });
});

describe("live docs", () => {
  it("live docs name no build step the table does not carry", () => {
    expect(staleStepRefs(LIVE_DOC_CLAIMS)).toEqual([]);
  });
});

describe("resume", () => {
  it.each(PHASES)("%s: the Resume line calls `status resume`", (name) => {
    const line = workflow(name)
      .split("\n")
      .find((l) => l.startsWith("- **Resume:**"));
    expect(line, name).toContain(`"{BKIT}" status resume --workflow=${name} --file="{STATUS}"`);
  });

  it.each(PHASES)(
    "%s: the step table matches the step headings and their --step= calls",
    (name) => {
      const sections = stepSections(workflow(name));
      const table = WORKFLOW_STEPS[name];
      const steps = [...new Map(table.map((s) => [s.number, s.title])).entries()];
      expect(steps).toEqual(sections.map((s) => [s.number, s.title]));
      const bodies = new Map(sections.map((s) => [s.number, s.body]));
      for (const entry of table.filter((s) => s.step !== undefined)) {
        expect(String(bodies.get(entry.number)), `${name} Step ${entry.number}`).toMatch(
          new RegExp(`--step=${entry.step}(?=[\\s"]|$)`, "m"),
        );
      }
    },
  );
});

describe("plan convert skip row", () => {
  it("writes a build-plan-convert row on the no-conversion route", () => {
    const step4 = stepSections(workflow("build")).find((s) => s.number === 4)!;
    const skip = commandLines(step4.body, "steps finish").filter((l) =>
      l.includes("--step=build-plan-convert"),
    );
    expect(skip).toHaveLength(2);
    const skipRow = skip.find((l) => l.includes("--attempt=1"))!;
    expect(skipRow).toContain("--number=4");
    expect(skipRow).toContain("skipped");
    expect(skipRow).not.toContain("--attempt-of=");
    expect(skip.filter((l) => l.includes("--attempt-of=build-plan-convert:next"))).toHaveLength(1);
    // The pass route with nothing to convert reaches the skip row, not Step 5.
    expect(step4.body).toMatch(
      /exit 0, `CONVERTED` is not held \*\*and\*\* `NEWER_COMMENTS` = 0 → sub-step 4/,
    );
    expect(step4.body).toMatch(/exit 0 \*\*and\*\* `CONVERTED` is held → Step 5/);
  });
});

describe("promoted parsers", () => {
  it("holds the workflows to the step table", () => {
    const own = fs.readFileSync(__filename, "utf-8");
    expect(own).not.toMatch(/^\s*function (stepSections|callWords)\(/m);
    for (const name of PHASES)
      expect(
        stepSections(workflow(name)).map((s) => s.number),
        name,
      ).toEqual([...new Set(WORKFLOW_STEPS[name].map((s) => s.number))]);
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
      .find((l) => l.startsWith("- **Finish:**"));
    expect(finish, name).toBeDefined();
    expect(finish).toContain("Exit 5 **or** 6 → invoke `reask.agent` again");
  });

  it.each(PHASES)("%s never reads a verdict outside `steps finish`", (name) => {
    expect(commandLines(workflow(name), "steps verdict"), name).toHaveLength(0);
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
    expect(step1).toContain("`runId` as `RUN_ID`");
    expect(step1).not.toContain("gh run list");
    expect(step1).not.toContain("case ");
  });

  it("Timeouts header line says 3600 seconds, like the phase workflows", () => {
    for (const name of ALL) {
      expect(workflow(name), name).toContain(
        "- **Timeouts:** **If** workflow or subagent run > 3600 seconds → **Failure Path**.",
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
    ["build", /Step 10 — /, "build-plan-verify-holistic", ["bkit-build-plan-verify"]],
    [
      "build",
      /Step 11 — Build Challenge/,
      "build-challenge",
      ["bkit-build-challenge-1", "bkit-build-challenge-2"],
    ],
    ["debug", /Failure Path/, "abort-handover", ["bkit-debug-abort-handover"]],
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

  it("build group verify cuts its own diff from the group's start, right before the agent", () => {
    const text = stepBody(workflow("build"), /Step 8 — /);
    const [line, ...more] = commandLines(text, "context diff");
    expect(more).toEqual([]);
    expect(line).toContain(
      '"{BKIT}" context diff --reset-log --base={GROUP_BASE} --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-diff-{GROUP}-{VERIFY_ATTEMPT}.md" --fid={FID} --step=build-plan-verify',
    );
    const invoke = text.indexOf("**Subagent:** Invoke `@bkit-build-plan-verify`");
    expect(invoke).toBeGreaterThan(text.indexOf(line!));
    const read = text
      .slice(invoke)
      .split("\n")
      .find((l) => l.trim().startsWith("Read:"));
    expect(read).toContain(
      "`docs/plans/{YYYYMM}/logs/{FID}/build-diff-{GROUP}-{VERIFY_ATTEMPT}.md`",
    );
  });

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

describe("plan caps", () => {
  // A number written next to tasks, tests, test files or TEST FIRST: the caps are
  // `bkit.workflows.tasks` settings, so prose names the held value instead.
  const LITERAL_CAP =
    /(?<!Step )\b\d+(?:-\d+)?\s+(?:tasks\b|test files\b|tests\b|`TEST FIRST`|\*\*TEST FIRST\*\*)/;
  const PROMPTS = path.join(REPO_ROOT, ".bkit", "core", "prompts");

  it("no prompt or workflow states a literal group cap", () => {
    const files = [
      ...ALL.map((n) => [`bkit-${n}.md`, workflow(n)] as const),
      ...fs
        .readdirSync(PROMPTS)
        .filter((f) => f.endsWith(".md"))
        .map((f) => [f, fs.readFileSync(path.join(PROMPTS, f), "utf-8")] as const),
    ];
    const hits = files.flatMap(([name, text]) =>
      text
        .split("\n")
        .map((l, i) => [i + 1, l.match(LITERAL_CAP)?.[0]] as const)
        .filter(([, m]) => m !== undefined)
        .map(([n, m]) => `${name}:${n} ${m}`),
    );
    expect(hits).toEqual([]);
    expect("groups of <= 3 tasks and 1-10 `TEST FIRST` across <= 3 test files").toMatch(
      LITERAL_CAP,
    );
  });

  it("plan and build hold the caps `repo info` prints", () => {
    for (const name of ["plan", "build"]) {
      const step1 = section(workflow(name), /Step 1 — Start Workflow/);
      for (const key of [
        "maxPerGroup",
        "maxTestsPerGroup",
        "maxTestsPerTask",
        "maxTestFilesPerTask",
      ])
        expect(step1).toContain(`\`tasks.${key}\``);
    }
  });
});

describe("plan", () => {
  const plan = workflow("plan");
  const LOG = "docs/plans/{YYYYMM}/logs/{FID}";

  it("plan runs one review round", () => {
    const step5 = section(plan, /Step 5 — Review Plan/);
    const finish5 = commandLines(step5, "steps finish");
    expect(finish5).toHaveLength(1);
    const agents = finish5[0]!.match(/--agent=\S+/g);
    const artifacts = finish5[0]!.match(/--artifact=\S+/g);
    expect(agents).toEqual([
      "--agent=bkit-plan-review-1",
      "--agent=bkit-plan-review-2",
      "--agent=bkit-plan-scope-check",
    ]);
    expect(artifacts).toEqual([
      `--artifact=${LOG}/plan-review-1.md`,
      `--artifact=${LOG}/plan-review-2.md`,
      `--artifact=${LOG}/plan-scope-check.md`,
    ]);
    expect(finish5[0]).toContain("--step=plan-review ");

    const step6 = section(plan, /Step 6 — Apply Review/);
    expect(step6).toContain(`Create: \`${LOG}/plan-v2-reviewed.md\``);
    for (const report of ["plan-review-1.md", "plan-review-2.md", "plan-scope-check.md"])
      expect(step6, report).toContain(`${LOG}/${report}`);
    expect(step6).toContain("Review critiques present");

    const finishes = commandLines(plan, "steps finish");
    const oldScopeStep = new RegExp(`--step=plan-scope-${"check"}(?=[\\s"]|$)`);
    expect(finishes.filter((l) => oldScopeStep.test(l))).toEqual([]);
    expect(finishes.filter((l) => l.includes(`--step=plan-apply-${"scope"}`))).toEqual([]);
    expect(plan).not.toContain(`plan-v3-${"checked"}`);

    const numbers = [...plan.matchAll(/--number=(\d+)/g)].map((m) => Number(m[1]));
    expect([...new Set(numbers)].sort((a, b) => a - b)).toEqual([2, 3, 4, 5, 6, 7, 8]);
    expect(Math.max(...numbers)).toBe(8);
  });

  it("bkit-plan runs plan-check after every plan-writing step", () => {
    const writers = plan
      .split(/\n(?=## )/)
      .filter((s) => /Invoke `@bkit-plan-(generate|update)`/.test(s));
    expect(writers.length).toBe(2);
    for (const step of writers) {
      const heading = step.split("\n")[0];
      const lines = step.split("\n");
      const invoke = lines.findIndex((l) => /Invoke `@bkit-plan-(generate|update)`/.test(l));
      const created = /Create: `([^`]+)`/.exec(lines.slice(invoke).join("\n"))?.[1];
      const check =
        invoke +
        1 +
        lines.slice(invoke + 1).findIndex((l) => l.includes('"{BKIT}" tests plan-check'));
      expect(check, heading).toBeGreaterThan(invoke);
      expect(lines[check], heading).toContain(`--plan=${created}`);
      expect(lines[check], heading).toContain("--existence=refuse");
      expect(step, heading).toContain("Fix only what");
      expect(step, heading).toMatch(/second exit 1 → \*\*Failure Path\*\*/);
    }
    expect(section(plan, /Step 4 — Fetch Context/)).not.toContain("tests plan-check");
    expect(plan).not.toContain("--children");
    expect(plan).not.toContain("--brief");
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

describe("summary step", () => {
  it.each(PHASES)("%s writes its summary with `workflows summary`, no summary subagent", (name) => {
    const text = workflow(name);
    expect(text).not.toMatch(/@bkit-(plan|design|build|debug|ship)-summary/);
    const runs = commandLines(text, "workflows summary");
    expect(runs, name).toHaveLength(1);
    expect(runs[0]).toContain(`--workflow=${name}`);
    const finish = commandLines(text, "steps finish").filter((l) =>
      l.includes(`--step=${name}-summary`),
    );
    expect(finish, name).toHaveLength(1);
    expect(finish[0]).toContain("--verdict={SUMMARY_VERDICT}");
    expect(finish[0]).toContain("--failures={SUMMARY_FAILURES}");
    expect(finish[0]).not.toContain("--agent=");
  });
});

describe("locks", () => {
  it.each(PHASES)("%s's Locks header no longer waits on the lock file's age", (name) => {
    const locks = workflow(name)
      .split("\n")
      .find((l) => l.startsWith("- **Locks:**"));
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
  /"\{BKIT\}" plans comment\b/,
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
    const bullets = text.split("\n").filter((l) => l.startsWith("- **No issue:**"));
    expect(bullets, name).toHaveLength(1);
    expect(bullets[0]).toContain("Warning: no issue named — running issue-less as {FID}");
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
    // A failing summary is the final message at the Failure Path STOP, after the warning line.
    const failDisplay = lines.filter((l) =>
      /`SUMMARY_VERDICT` = FAIL → (?:display|the final message is)/.test(l),
    );
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
      expect(t).toContain("NEVER create a tracker issue");
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

  it("ship checks the plan with `fids plans`; build checks it with `tests plan-check`", () => {
    expect(workflow("build")).not.toContain("fids plans");
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
    expect(step1).toContain("Hold `auditPaths` as `AUDIT_PATHS`");
    expect(step1).toContain("hold `parentFid` as `PARENT_FID`, `parentMonth` as `PARENT_YYYYMM`");
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
      .find((l) => l.startsWith("- **Placeholders:**"));
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

  it("build 16.9 and debug 11.9 kill-switch checks skip when ISSUE_ID is empty", () => {
    for (const [name, step] of [
      ["build", /Step 16 — Close Workflow/],
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
    const step11 = section(workflow("design"), /Step 11 — Suggest Plans/);
    const trueBlock = step11.slice(step11.indexOf("bkit:tracker true start"));
    expect(trueBlock.indexOf(SKIP_NO_ISSUE), "no Skip if line in the true block").toBeGreaterThan(
      -1,
    );
    expect(trueBlock.indexOf(SKIP_NO_ISSUE)).toBeLessThan(trueBlock.indexOf("plans parse"));
    expect(trueBlock).toMatch(/Skip if\*\* `ISSUE_ID` empty → Step 12/);
  });

  it("design Step 11 posts plans", () => {
    const step11 = section(workflow("design"), /Step 11 — Suggest Plans/);
    expect(step11).toContain('"{BKIT}" plans comment --artifact=');
    expect(step11).not.toMatch(/workstreams (?:parse|comment)/);
    expect(step11).not.toMatch(/issue per workstream/i);
    expect(step11).toContain("NEVER create a tracker issue");
    expect(step11).toContain("or set blockers");
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
const ROUTER_MD = fs.readFileSync(
  path.join(REPO_ROOT, ".bkit", "core", ".bkit", "router.md"),
  "utf-8",
);
const ROUTED = ["design", "plan", "build", "debug", "ship", "auto"];

describe("workflow routing", () => {
  it("AGENTS.md sends only a bkit-{command} prompt to router.md", () => {
    const gate = AGENTS_MD.split("\n").find((l) => l.startsWith("- **Workflows:**"));
    expect(gate, "no workflow gate in AGENTS.md").toBeDefined();
    expect(gate).toContain("**If** the prompt contains `bkit-{command}`");
    expect(gate).toContain("read `.bkit/router.md`");
    expect(gate).toContain("**Else** → no workflow routing; handle the request as asked.");
    for (const name of ROUTED) expect(gate).toContain(`\`bkit-${name}\``);
    expect(AGENTS_MD).not.toContain("STOP");
    expect(AGENTS_MD).not.toContain("Workflow not found");
  });

  it("router.md hands back a prompt that only mentions a workflow", () => {
    expect(ROUTER_MD).toContain(
      "no workflow requested; routing ends → handle the request as asked under `.agents/rules.md`",
    );
  });

  it("router.md reads the issue through bkit verbs, never a tracker MCP tool", () => {
    expect(ROUTER_MD).toContain('fids parse --prompt-file="{SESSION_DIR}/prompt.md"');
    expect(ROUTER_MD).toContain('issues fetch --issue="{ISSUE_ID}"');
    expect(ROUTER_MD).not.toContain("mcp__");
  });

  it("router.md names an existing command file for every host and command", () => {
    const rows = ROUTER_MD.split("\n")
      .map((l) => /^\| [^|]+ \| `([^`]*bkit-\{command\}[^`]*)` \|$/.exec(l)?.[1])
      .filter((p): p is string => p !== undefined);
    expect(rows).toHaveLength(5);
    for (const row of rows)
      for (const name of ROUTED) {
        const file = row.replace("{command}", name);
        expect(fs.existsSync(path.join(REPO_ROOT, file)), `${file} missing`).toBe(true);
      }
  });

  it("phase workflows read the issue themselves, never from AGENTS.md", () => {
    for (const name of ["design", "plan", "build", "debug", "ship"])
      expect(workflow(name), `bkit-${name}`).not.toContain("AGENTS.md");
  });
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
    expect(step2).toContain("`startSha` as `DIFF_BASE`");
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

describe("input files", () => {
  const INPUT_DATES =
    "- **Input dates:** Where two sections of the `*-input-*.md` file disagree, the newer one wins; older text still counts wherever nothing newer contradicts it.";

  it("every agent that reads a `*-input-*.md` file carries the newer-wins bullet", () => {
    // `workflows input` dates each section; the bullet is what tells the agent to use the dates.
    const readers = [...new Set(PHASES.flatMap((p) => agentsReading(workflow(p), "-input-")))];
    expect(readers.length).toBeGreaterThanOrEqual(10);
    for (const agent of readers) {
      const text = fs.readFileSync(
        path.join(REPO_ROOT, ".bkit", "core", "prompts", `${agent}.md`),
        "utf-8",
      );
      expect(text, agent).toContain(INPUT_DATES);
    }
  });

  it("a re-run reads its previous design or plan as superseded context, never as a constraint", () => {
    expect(workflow("design")).toContain(
      "`docs/plans/{YYYYMM}/{FID}-design.md` (if present — superseded design, context only, not a constraint)",
    );
    expect(workflow("plan")).toContain(
      "`docs/plans/{YYYYMM}/{FID}-plan.md` (if present — superseded plan, context only, not a constraint)",
    );
  });
});

describe("fix loops ask only when the last round made no progress", () => {
  it("build takes a further test round without asking unless the trend is stuck or worse", () => {
    const step12 = section(workflow("build"), /Step 12 — Run Tests/);
    expect(commandLines(step12, "counters progress").map((l) => l.trim())).toEqual([
      '"{BKIT}" counters progress --file="{STATUS}" --workflow=build --check=build-run-tests --fix=build-failure-remediate',
    ]);
    expect(step12).toContain("**If** `TEST_TREND` = `stuck` **or** `worse` →");
    expect(step12).toContain("`PAUSE_QUESTION` = `TESTS_LOOP` → **Decision Pause**");
    expect(step12).toContain("**Else** → Step 13");
  });

  it("debug takes a further fix or soak attempt without asking unless the trend is stuck or worse", () => {
    const loop = section(workflow("debug"), /Loop Question/);
    expect(commandLines(loop, "counters progress").map((l) => l.trim())).toEqual([
      '"{BKIT}" counters progress --file="{STATUS}" --workflow=debug --check=debug-run-tests --fix={LOOP_FIX}',
    ]);
    expect(loop).toContain("**If** `LOOP_TREND` != `stuck` **and** `LOOP_TREND` != `worse` →");
    const step3 = section(workflow("debug"), /Step 3 — Run Tests/);
    expect(step3).toContain("`LOOP_POINT` = `fix`, `LOOP_FIX` = `debug-failure-remediate`");
    expect(step3).toContain("`LOOP_POINT` = `soak`, `LOOP_FIX` = `debug-failure-soak`");
  });

  it("ship takes a merge fix round without asking when the diagnosis found the cause", () => {
    const step11 = section(workflow("ship"), /Step 11 — Failure Diagnose/);
    expect(step11).toContain("Hold `verdict` as `DIAGNOSE_VERDICT`");
    expect(step11).toContain("**If** `MERGE_ASK` = false **or** `DIAGNOSE_VERDICT` = PASS →");
  });
});
