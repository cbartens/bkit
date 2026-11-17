// Workflow shapes the reviews pinned: each test reads the shipped `.bkit/core/workflows/*.md`
// and fails when the shape a command or route depends on is gone.

import * as fs from "node:fs";
import * as path from "node:path";

import { describe, expect, it } from "vitest";

import { callWords, stepSections } from "../../checks/status-holes";
import { COMMANDS } from "../../commands/registry";
import { WORKFLOW_STEPS } from "../../commands/workflow/step-table";
import { blockedTests } from "../../commands/workflow/tests";
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
  // step's clamp log and trims it in one call; no workflow does it by hand. `--file`
  // appends the run's test-run row to status.jsonl.
  const ARTIFACTS: Array<[string, string]> = [
    [
      "build",
      '--artifact="docs/plans/{YYYYMM}/logs/{FID}/build-group-gate-{GROUP}-{VERIFY_ATTEMPT}.md" --fid={FID} --file="{STATUS}" --workflow=build --step=build-group-gate-{GROUP} --attempt={VERIFY_ATTEMPT}',
    ],
    [
      "build",
      '--artifact="docs/plans/{YYYYMM}/logs/{FID}/run-tests-{TEST_ATTEMPT}.md" --fid={FID} --file="{STATUS}" --workflow=build --step=build-run-tests --attempt={TEST_ATTEMPT}',
    ],
    [
      "debug",
      '--artifact="docs/plans/{YYYYMM}/logs/{FID}/context-tests-local-{DEBUG_ATTEMPT}.md" --fid={FID} --file="{STATUS}" --workflow=debug --step=debug-run-tests --attempt={NORMAL_ATTEMPT}',
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
    expect(text).toContain(
      '**If** Step 2\'s `workflows start --session-dir="{SESSION_DIR}"` printed `openDecision` != null',
    );
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

  it("build re-runs a red gate pause instead of asking it", () => {
    const text = workflow("build");
    const resume = text.split("\n").filter((l) => l.startsWith("- **Resume:**"))[0];
    expect(resume).toBeDefined();
    expect(resume).toContain("decisions apply --by=rerun");
    expect(resume).toContain("`gateRerun` = true");
    expect(resume).toContain("steps finish");
    expect(resume.indexOf("steps finish")).toBeLessThan(
      resume.indexOf("decisions apply --by=rerun"),
    );
    expect(resume).toContain("counters grant");
  });

  it("Resume asks every other open pause at Decision Pause step 3", () => {
    const text = workflow("build");
    const resume = text.split("\n").filter((l) => l.startsWith("- **Resume:**"))[0];
    expect(resume).toBeDefined();
    const route = resume.slice(resume.indexOf("**If** `gateRerun` = true"));
    expect(route).toContain("Decision Pause** step 3");
  });

  it("build leaves the red-gate re-run conditions to status resume", () => {
    const text = workflow("build");
    const resume = text.split("\n").filter((l) => l.startsWith("- **Resume:**"))[0];
    expect(resume).toBeDefined();
    // `status resume` decides the re-run; the line restates none of its conditions.
    expect(resume).not.toMatch(/only undecided question/);
    expect(resume).not.toContain("OPEN_GATE");
  });

  it("bkit-build.md no longer mentions GATE_RERUN", () => {
    expect(workflow("build")).not.toContain("GATE_RERUN");
  });

  it("the Resume rule reads gateRerun and rerunFrom from status resume", () => {
    const resume = workflow("build")
      .split("\n")
      .find((l) => l.startsWith("- **Resume:**"));
    expect(resume, "no Resume line").toBeDefined();
    const line = String(resume);
    expect(line).toContain('"{BKIT}" status resume --workflow=build --file="{STATUS}"');
    expect(line).toContain("`gateRerun`");
    expect(line).toContain("`rerunFrom`");
    // Each place the engine can name has its own target.
    expect(line).toMatch(/`rerunFrom` = `verify` → [^;]*Step 8 sub-step 8/);
    expect(line).toMatch(/`rerunFrom` = `holistic` → [^;]*Step 10 sub-step 5/);
    expect(line).toMatch(/`rerunFrom` = `tests` → Step 12/);
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
      const calls = commandLines(failure, "workflows handover")
        .map((l) => l.trim())
        .filter((l) => l.includes("--push"));
      expect(calls, name).toEqual([
        `"{BKIT}" workflows handover --post --workflow=${name} --fid={FID} --month={YYYYMM} --push --worktree="{WORKTREE_PATH}"`,
      ]);
      expect(failure).toContain("**Skip if** `{WORKTREE_PATH}` is not set");
      expect(failure).not.toContain("branches push --mode=abort");
      expect(failure).not.toMatch(/HANDOVER_NEEDED` = true → step 4\. \*\*Else\*\* → step 6/);
    },
  );

  it.each(["build", "debug"])(
    "%s prints the not-pushed line for every handover exit that pushed nothing (9, 10, 11)",
    (name) => {
      const routes = section(workflow(name), /Failure Path/)
        .split("\n")
        .filter((l) => l.includes("`Record not pushed:"));
      expect(routes, name).toHaveLength(1);
      expect(routes[0]!.trim()).toMatch(
        /^- \*\*If\*\* exit 9, 10 \*\*or\*\* 11 → the record did not reach the remote:/,
      );
    },
  );

  it("bkit-build.md: a held run's Failure Path and Decision Pause never push the feature branch", () => {
    const build = workflow("build");
    for (const part of [section(build, /Failure Path/), section(build, /Decision Pause/)]) {
      const calls = commandLines(part, "workflows handover").map((l) => l.trim());
      const pushing = calls.filter((l) => l.includes("--push"));
      const local = calls.filter((l) => !l.includes("--push"));
      expect(pushing).toHaveLength(1);
      expect(local).toHaveLength(1);
      const at = part.indexOf(pushing[0]!);
      const before = part.slice(0, at);
      expect(before).toMatch(/`PUBLISH` = false[^\n]*NEVER pass `--push`/);
      expect(part.indexOf(local[0]!)).toBeLessThan(at);
    }
  });

  it("bkit-build.md: a Failure Path reached before publish is resolved never pushes the feature branch", () => {
    const failure = section(workflow("build"), /Failure Path/);
    const calls = commandLines(failure, "workflows handover").map((l) => l.trim());
    const pushing = calls.filter((l) => l.includes("--push"));
    expect(pushing).toHaveLength(1);
    const before = failure.slice(0, failure.indexOf(pushing[0]!));
    const guard = before
      .trimEnd()
      .split("\n")
      .filter((l) => l.includes("**Else**"))
      .pop()!;
    expect(guard).toMatch(/^\s*- \*\*Else\*\* →/);
    expect(before).toMatch(
      /`PUBLISH` = false \*\*or\*\* `PUBLISH` is not held yet[^\n]*NEVER pass `--push`/,
    );
  });

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
    expect(step7).toContain("Hold `verdict` as `TASKS_VERDICT`");
    expect(step7).toContain("`TASKS_VERDICT` = HANDOVER");
    expect(step7).toContain("not a failed attempt");
    const prompt = fs.readFileSync(
      path.join(REPO_ROOT, ".bkit", "core", "prompts", "bkit-build-plan-tasks.md"),
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
      "**If** exit 0 **and** `CONVERTED` is not held **and** `NEWER_COMMENTS` = 0 → sub-step 4.";
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
      ["build-group-start", "build-plan-tasks", "build-plan-tests"],
      ["build-holistic-gate", "build-plan-gaps-remediate-holistic", "build-plan-verify-holistic"],
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
      "**If** exit 0 **and** `CONVERTED` is not held **and** `NEWER_COMMENTS` = 0 → sub-step 4.",
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
    expect(brief).toHaveLength(2);
    expect(brief[0]).toContain("--next");
    for (const line of brief) {
      expect(line).toContain('--plan="docs/plans/{YYYYMM}/{FID}-plan.md"');
      expect(line).toContain('--note-file="{SESSION_DIR}/brief-note.md"');
    }
    expect(step7).toContain("drop `--note-file` when `{SESSION_DIR}/brief-note.md` does not exist");
    expect(step7).toContain("`{BRIEF}`");
    expect(step7.indexOf("context brief")).toBeLessThan(
      step7.indexOf("Invoke `@bkit-build-plan-tasks`"),
    );
    const finish = commandLines(step7, "steps finish");
    expect(finish).toHaveLength(2);
    for (const line of finish) expect(line).toContain("--group={GROUP}");
  });

  it("Step 7 writes a group's tests with their own subagent, records them red and only then invokes execute", () => {
    const step7 = stepBody(build, /Step 7 — Plan Execute/);
    const [, testsBrief] = commandLines(step7, "context brief");
    expect(testsBrief).toContain("--tests-only");
    expect(testsBrief).toContain("--group={GROUP}");
    expect(testsBrief).toContain('--file="{STATUS}"');
    const tests = step7.indexOf("Invoke `@bkit-build-plan-tests`");
    const red = step7.indexOf('"{BKIT}" tests red');
    const execute = step7.indexOf("Invoke `@bkit-build-plan-tasks`");
    expect(tests).toBeGreaterThan(0);
    expect(red).toBeGreaterThan(tests);
    expect(execute).toBeGreaterThan(red);
    const [testsFinish, executeFinish] = commandLines(step7, "steps finish");
    expect(testsFinish).toContain("--step=build-plan-tests");
    expect(testsFinish).toContain('--plan="docs/plans/{YYYYMM}/{FID}-plan.md"');
    expect(executeFinish).toContain("--step=build-plan-tasks");
    expect(step7).toContain("**If** exit 15");
    expect(step7).toContain("**If** exit 11");
    expect(commandLines(step7, "tests red")[0]).toContain(
      '--log="docs/plans/{YYYYMM}/logs/{FID}/build-tests-red-{GROUP}-{RED_ATTEMPT}.md"',
    );
    expect(step7).not.toContain("--task=");
  });

  it("a re-run gate that is still red reaches the Decision Pause through the round count", () => {
    const step8 = stepBody(build, /Step 8 — Plan Verify/);
    const step12 = section(build, /Step 12 — Run Tests/);
    // A re-run follows the same routes as any gate run: a used-up limit asks again.
    for (const [name, text] of [
      ["Step 8", step8],
      ["Step 12", step12],
    ] as const) {
      expect(text, name).toMatch(
        /(`LIMIT_ASK` = true[^\n]*exit 1|exit 1[^\n]*`LIMIT_ASK` = true)[^\n]*\*\*Decision Pause\*\*/,
      );
      expect(text.indexOf("`LIMIT_ASK` = true"), name).toBeGreaterThan(
        text.indexOf("counters route"),
      );
    }
  });

  it("a green re-run gate continues without asking", () => {
    const step8 = stepBody(build, /Step 8 — Plan Verify/);
    expect(step8).toMatch(
      /`VERIFY_VERDICT` = PASS \*\*and\*\* `GATE_VERDICT` != FAIL → Step 7 without asking/,
    );
    expect(section(build, /Step 12 — Run Tests/)).toContain(
      "**If** `TEST_VERDICT` = PASS → Step 15.",
    );
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

  it("the Decision Pause checks a red gate against the base commit before composing", () => {
    const pause = section(build, /Decision Pause/);
    const base = commandLines(pause, "tests base");
    expect(base).toHaveLength(1);
    expect(base[0]).toContain("tests base --log=");
    const compose = commandLines(pause, "decisions compose");
    expect(compose).toHaveLength(1);
    expect(compose[0]).toContain("{BASE_FLAGS}");
    expect(pause.indexOf("tests base --log=")).toBeLessThan(pause.indexOf("decisions compose"));
    expect(pause).toContain("GATE_LOG");
    expect(pause).toContain("--base-check");
    expect(pause).toContain("Gate=FAIL");
    // The check runs only for a red-gate or TESTS_LOOP pause, and a failed check is a Failure Path.
    expect(pause).toMatch(
      /`GATE_VERDICT` = FAIL[^\n]*`TESTS_LOOP`|`TESTS_LOOP`[^\n]*`GATE_VERDICT` = FAIL/,
    );
    expect(pause).toMatch(/tests base[\s\S]{0,900}non-zero → \*\*Failure Path\*\*/);
    // The Decision Pause gate checklist names the base check.
    const gate = stepBody(build, /Gate — Decision Pause/);
    expect(gate).toMatch(/base/i);
  });

  it("a red holistic gate routes to the holistic fix round with a Holistic gate Context line", () => {
    const step10 = stepBody(build, /Step 10 — Plan Verify Holistic/);
    // Step 11 is reached only with no red holistic gate.
    const toStep11 = step10.split("\n").filter((l) => l.includes("→ Step 11"));
    expect(toStep11.length).toBeGreaterThan(0);
    for (const l of toStep11) expect(l, l).toContain("`GATE_VERDICT` != FAIL");
    // A red gate goes to the round count, however the verify came out.
    expect(step10).toMatch(/\*\*If\*\* `GATE_VERDICT` = FAIL[^\n]*→ sub-step \d+/);
    expect(step10).toContain("**If** `GATE_VERDICT` = FAIL → add `Holistic gate`:");
    expect(step10.indexOf("add `Holistic gate`")).toBeGreaterThan(
      step10.indexOf("counters route --name=HOLISTIC_ATTEMPT"),
    );
  });

  it("a holistic pause with a red gate asks the loop question and never routes continue", () => {
    const step10 = stepBody(build, /Step 10 — Plan Verify Holistic/);
    // A used-up limit with ask on pauses with the loop question.
    expect(step10).toMatch(/`LIMIT_ASK` = true \*\*and\*\* exit 1 → `PAUSE_LOOP` = `holistic`/);
    // A no-progress round after a red gate pauses with the loop question too.
    const noProgress = step10.slice(step10.lastIndexOf("branches scan-diff"));
    expect(noProgress).toMatch(/`GATE_VERDICT` = FAIL[^\n]*`PAUSE_LOOP` = `holistic`/);
    // Step 10 sets no route of its own; the pause's continue route is the engine's.
    expect(step10).not.toContain("`DECISION_ROUTE`");
    const pause = section(build, /Decision Pause/);
    expect(pause).toMatch(/\{BASE_FLAGS\}` = `--header=Gate=FAIL` when the base check ran/);
    expect(pause).toMatch(/decisions skip[\s\S]*exit 0 → `DECISION_ROUTE` = `continue`/);
  });

  it("the Decision Pause reads a red holistic gate's log for the base check", () => {
    const log = "{OUTBOX}/build-holistic-gate-{HOLISTIC_ATTEMPT}.log";
    const step10 = stepBody(build, /Step 10 — Plan Verify Holistic/);
    const gate = commandLines(step10, "tests run").filter((l) =>
      l.includes("--step=build-holistic-gate "),
    );
    expect(gate).toHaveLength(1);
    expect(gate[0]).toContain(`--log="${log}"`);
    const pause = section(build, /Decision Pause/);
    const gateLog = pause.split("\n").find((l) => l.includes("`GATE_LOG` ="));
    expect(gateLog, "no GATE_LOG line").toBeDefined();
    expect(gateLog).toContain(`\`${log}\` when \`PAUSE_STEP\` = 10`);
  });

  it("Step 10 reads no cleanBase and holds no HOLISTIC_BASE", () => {
    const step10 = stepBody(build, /Step 10 — Plan Verify Holistic/);
    expect(step10).not.toContain("cleanBase");
    expect(build).not.toContain("HOLISTIC_BASE");
    expect(commandLines(step10, "status route").filter((l) => !l.includes("--require="))).toEqual(
      [],
    );
  });

  it("a no-progress round after a red gate pauses with the loop question", () => {
    const step9 = stepBody(build, /Step 9 — Plan Gaps Remediate/);
    const route = step9.slice(step9.indexOf("5. Check that the attempt changed source files"));
    expect(route).toContain("`GATE_VERDICT` = FAIL");
    expect(route).toContain("`PAUSE_LOOP` = `verify`");
    expect(route.indexOf("`PAUSE_LOOP` = `verify`")).toBeLessThan(
      route.indexOf("**Decision Pause**"),
    );
  });

  it("a failing gate or suite test is never a pause item", () => {
    const pause = section(build, /Decision Pause/);
    expect(pause).not.toContain("because it is always fixed");
    expect(pause).not.toContain("because failing suites are always fixed");
    expect(pause).toMatch(/group.gate[^\n]*never an item/i);
    expect(pause).toMatch(/TESTS_LOOP[^\n]*(no items|never an item)/);
    const step4 = pause.slice(
      pause.indexOf("4. Ask the owner in this session"),
      pause.indexOf("5. Apply each decision"),
    );
    expect(step4).toMatch(/only (the )?(file's|decision file's) options/i);
  });

  it("group-mode verify logs no gap for a test the group gate runs", () => {
    const prompt = fs.readFileSync(
      path.join(REPO_ROOT, ".bkit", "core", "prompts", "bkit-build-plan-verify.md"),
      "utf-8",
    );
    const start = prompt.indexOf("6. **If** `Mode` = `Group`");
    const end = prompt.indexOf("7. **If** `Mode` = `Holistic`");
    expect(start).toBeGreaterThanOrEqual(0);
    expect(end).toBeGreaterThan(start);
    const groupStep = prompt.slice(start, end);
    expect(groupStep).toMatch(/not a gap/);
    expect(groupStep).toMatch(/group gate/i);
    expect(groupStep).toMatch(/Step 12|final run|holistic/i);
    // Holistic mode keeps logging each failing test as a gap.
    const holistic = prompt.slice(end, end + 1500);
    expect(holistic).not.toMatch(/not a gap/);
  });

  it("the execute prompt logs `DONE — TASK {N}`, the line the brief and the commit check read", () => {
    const prompt = fs.readFileSync(
      path.join(REPO_ROOT, ".bkit", "core", "prompts", "bkit-build-plan-tasks.md"),
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

  it("a Fix now challenge task is rewritten to the owner's direction in place", () => {
    const pause = section(build, /Decision Pause/);
    const fixNow = pause.slice(pause.indexOf("- **Fix now**:"));
    const start = fixNow.indexOf("**If** the item is a challenge task");
    expect(start).toBeGreaterThanOrEqual(0);
    const branch = fixNow.slice(start, fixNow.indexOf("**Else** → write a new task block"));
    expect(branch).toContain("**DONE WHEN:**");
    expect(branch).toContain("**TEST FIRST:**");
    expect(branch).toContain("`Derived Test Matrix`");
    expect(branch).toContain("meta line");
    expect(branch).toContain("**Fixable:** false");
    expect(branch).not.toContain("runs as it is");
  });

  it("a hard blocker answered Fix now with no direction is asked again", () => {
    const pause = section(build, /Decision Pause/);
    const from = pause.indexOf("Route — first match wins");
    const route = pause.slice(from, pause.indexOf("5. Apply each decision"));
    const missing = route.slice(route.indexOf("still lacks a decision"));
    expect(missing).toMatch(/hard blocker/);
    expect(missing).toContain("`Fix now`");
    expect(missing).toMatch(/no direction/);
    expect(missing).toContain("End the turn and wait");
  });

  it("each Fix now item records its Fix task line before the decision row is finished", () => {
    const pause = section(build, /Decision Pause/);
    const step5 = pause.slice(
      pause.indexOf("5. Apply each decision"),
      pause.indexOf("6. Write the decisions"),
    );
    expect(step5).toContain("`Fix task:`");
    expect(step5).toMatch(/already has a `Fix task:` line/);
    expect(step5).toMatch(/reuse/i);
    const step6 = pause.slice(
      pause.indexOf("6. Write the decisions"),
      pause.indexOf("Set the route"),
    );
    expect(step6).toContain("Fix task: {N}");
    expect(pause.indexOf("Fix task: {N}", pause.indexOf("6. Write the decisions"))).toBeLessThan(
      pause.indexOf("--step=build-decision", pause.indexOf("6. Write the decisions")),
    );
  });

  it("Decision Pause step 5 records each Fix now item's Fix task line before tests plan-check", () => {
    const pause = section(build, /Decision Pause/);
    const step5 = pause.slice(
      pause.indexOf("5. Apply each decision"),
      pause.indexOf("6. Write the decisions"),
    );
    expect(step5).toContain("Fix task: {N}");
    expect(step5).toContain("tests plan-check");
    expect(step5.indexOf("Fix task: {N}")).toBeLessThan(step5.indexOf("tests plan-check"));
    const step6 = pause.slice(
      pause.indexOf("6. Write the decisions"),
      pause.indexOf("--step=build-decision", pause.indexOf("6. Write the decisions")),
    );
    expect(step6).toMatch(/still missing/);
  });

  it("the owner decisions contract names the task block as the Fix now carrier", () => {
    const bullet = build.split("\n").find((l) => l.startsWith("- **Owner decisions:**"));
    expect(bullet).toBeDefined();
    expect(bullet).toContain("task block");
    expect(bullet).toContain("`Fix now`");
    expect(bullet).not.toContain("only by reading the decision file");
    expect(bullet).toContain("NEVER restate, summarise or paraphrase an owner's answer");
    const gate = build.slice(build.indexOf("### 🔒 Gate — Decision Pause"));
    expect(gate.slice(0, gate.indexOf("---"))).toContain("Fix task");
  });

  it("Decision Pause step 5 writes no second acceptance for a reopened DECIDED or ASSUMED pause", () => {
    const pause = section(build, /Decision Pause/);
    const step5 = pause.slice(
      pause.indexOf("5. Apply each decision"),
      pause.indexOf("6. Write the decisions"),
    );
    expect(step5).toMatch(/reopened `DECIDED` \/ `ASSUMED`/);
    expect(step5).toMatch(/no second `docs\/decisions\.jsonl` row/);
    expect(step5).toMatch(/no second title suffix/);
    const step6 = pause.slice(
      pause.indexOf("6. Write the decisions"),
      pause.indexOf("--step=build-decision", pause.indexOf("6. Write the decisions")),
    );
    expect(step6).toMatch(/only under an item that has none/);
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
      /exit 0 \*\*and\*\* `CONVERTED` is not held \*\*and\*\* `NEWER_COMMENTS` = 0 → sub-step 4/,
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

/**
 * Each `status route --require=strategy` site of a workflow: the hold line under its
 * code fence, and the first agent Context line after it that names `Strategy`.
 */
const strategySites = (name: string): Array<{ name: string; hold: string; context: string }> => {
  const lines = workflow(name).split("\n");
  const isStrategyContext = (l: string) =>
    l.trimStart().startsWith("Context:") && l.includes("`Strategy`:");
  return lines
    .map((l, i) => ({ l, i }))
    .filter(({ l }) => l.includes("status route") && l.includes("--require=strategy"))
    .map(({ i }) => ({
      name,
      hold: lines[i + 2] ?? "",
      context: lines.slice(i + 1).find(isStrategyContext) ?? "",
    }));
};

describe("status route --require=strategy", () => {
  it("status route --require=strategy is used at exactly the four strategy-routing sites", () => {
    const sites = ["build", "debug", "ship"].flatMap((name) =>
      commandLines(workflow(name), "status route")
        .filter((l) => l.includes("--require=strategy"))
        .map((l) => /--step=([a-z0-9-]+)/.exec(l)?.[1]),
    );
    expect(sites.sort()).toEqual([
      "build-failure-diagnose",
      "build-plan-gaps-remediate",
      "build-plan-gaps-remediate-holistic",
      "debug-failure-diagnose",
    ]);
  });

  it("every strategy route site holds repeatTests and passes Repeat tests in the agent Context", () => {
    const sites = ["build", "debug"].flatMap(strategySites);
    expect(sites).toHaveLength(4);
    for (const { name, hold, context } of sites) {
      expect(hold, name).toContain(
        "Hold `nextStrategy` as `STRATEGY` and `repeatTests` as `REPEAT_TESTS`.",
      );
      expect(context, name).toContain(
        "`Strategy`: `{STRATEGY}`. **If** `REPEAT_TESTS` is not empty → add `Repeat tests`: `{REPEAT_TESTS}`.",
      );
    }
  });

  it("gaps remediate and failure diagnose apply PIVOT and FINAL to Repeat tests only", () => {
    const prompt = (name: string) =>
      fs.readFileSync(path.join(REPO_ROOT, ".bkit", "core", "prompts", `${name}.md`), "utf-8");
    expect(prompt("bkit-build-plan-gaps-remediate")).toContain(
      "**If** Context names `Repeat tests` → apply `PIVOT` or `FINAL` only to the gaps of the tests it names, and give every other gap the `STANDARD` treatment.",
    );
    const diagnose = prompt("bkit-debug-failure-diagnose");
    expect(diagnose).toContain(
      "**If** Context names `Repeat tests` → apply `PIVOT` or `FINAL` only to the failures of the tests it names, and give every other failure the `STANDARD` treatment.",
    );
    expect(diagnose).toContain(
      "[Under `PIVOT` or `FINAL`: the tests `Repeat tests` names, then what was tried for them and why it failed.",
    );
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

  it("workflows impose no blanket runtime deadline on workflows or subagents", () => {
    for (const name of ALL) {
      expect(workflow(name), name).not.toMatch(/workflow or subagent run > \d+ seconds/);
    }
  });
});

describe("diff per reader", () => {
  // Every agent that reads the run's diff gets a fresh `tmp/bkit-diff-{FID}.md`,
  // written by `context diff` in the same sub-step, just before the agent.
  // Debug runs on dev, so its diff names the base the run started from.
  const BASE_FLAG: Record<string, string> = {
    build: "",
    debug: " {BASE_FLAG}",
    ship: " --base=origin/dev",
  };
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

  it("ship has no Failure Diagnose or Failure Remediate step and runs Steps 1-12", () => {
    expect(ship).not.toContain("Failure Diagnose");
    expect(ship).not.toContain("Failure Remediate");
    expect(ship).not.toContain("ship-failure");
    const numbers = ship
      .split("\n")
      .filter((l) => /^## \S+ Step \d+ — /.test(l))
      .map((l) => Number(/Step (\d+) —/.exec(l)![1]));
    expect(numbers).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    expect(section(ship, /Step 12 — /)).toContain("Close Workflow");
    expect(section(ship, /Step 11 — /)).toContain("Update Local Dev");
  });

  it("post-merge check reads the capstone job alone, at the squash commit", () => {
    const close = section(ship, /Step 12 — Close Workflow/);
    expect(close).toContain(
      '"{BKIT}" runs gate --squash-of="{PR_NUMBER}" --repo="{OWNER_REPO}" --capstone-only --record="{STATUS}"',
    );
  });

  it("the close removes the worktree and deletes the branch through the command, then leaves it", () => {
    const close = section(ship, /Step 12 — Close Workflow/);
    expect(close).toContain('--branch="{SHIP_BRANCH}"');
    expect(close).toContain('cd "{REPO_ROOT}"; exit $rc');
    expect(ship).not.toContain('"{BKIT}" worktrees remove');
    expect(ship).not.toContain("git worktree remove");
    expect(ship).not.toContain("git branch -D");
    expect(ship).not.toContain("push origin --delete");
  });

  it("brings local dev level through `branches sync-dev`, never a checkout", () => {
    const step11 = section(ship, /Step 11 — Update Local Dev/);
    expect(step11).toContain('"{BKIT}" branches sync-dev || exit 1');
    expect(step11).not.toContain('cd "{REPO_ROOT}"');
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
    const close = section(ship, /Step 12 — Close Workflow/);
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
    expect(writers.length).toBe(3);
    for (const step of writers) {
      const heading = step.split("\n")[0];
      const lines = step.split("\n");
      const invoke = lines.findIndex((l) => /Invoke `@bkit-plan-(generate|update)`/.test(l));
      // The close step edits the canonical plan in place (Update); the run's steps write a new version (Create).
      const written = /(?:Create|Update): `([^`]+)`/.exec(lines.slice(invoke).join("\n"))?.[1];
      const check =
        invoke +
        1 +
        lines.slice(invoke + 1).findIndex((l) => l.includes('"{BKIT}" tests plan-check'));
      expect(check, heading).toBeGreaterThan(invoke);
      expect(lines[check], heading).toContain(`--plan=${written}`);
      expect(lines[check], heading).toContain("--existence=refuse");
      expect(step, heading).toContain("Fix only what");
    }
    // After close the run has landed: a failed check is reported to the owner, never routed to the Failure Path.
    const isClose = (s: string) => /Close Workflow/.test(s.split("\n")[0]!);
    const closeSteps = writers.filter(isClose);
    expect(closeSteps).toHaveLength(1);
    expect(closeSteps[0]).toMatch(/second exit 1 → tell the user/);
    expect(closeSteps[0]).toContain("commit nothing from this round");
    for (const step of writers.filter((s) => !isClose(s)))
      expect(step, step.split("\n")[0]).toMatch(/second exit 1 → \*\*Failure Path\*\*/);
    expect(section(plan, /Step 4 — Fetch Context/)).not.toContain("tests plan-check");
    expect(plan).not.toContain("--children");
    expect(plan).not.toContain("--brief");
  });

  it("carries draft formatting findings through review and update, with a strict final check", () => {
    const generate = section(plan, /Step 3 — Generate Plan/);
    const review = section(plan, /Step 5 — Review Plan/);
    const update = section(plan, /Step 6 — Apply Review/);
    const close = section(plan, /Step 8 — Close Workflow/);
    const formatRoute = generate.split("\n").find((line) => line.includes("every `kind`"));
    expect(formatRoute).toContain("**If** exit 1");
    expect(formatRoute).toContain("`problems` is nonempty");
    expect(formatRoute).toContain("every `kind` is `format|stray`");
    expect(formatRoute).toContain("`existence` is empty");
    expect(formatRoute).toContain("→ sub-step 3");
    expect(generate.indexOf(formatRoute!)).toBeLessThan(generate.indexOf("second exit 1"));
    expect(review).toContain("`REVIEW_CHECK` = `plan-generate-check.md`");
    expect(review).toContain("`REVIEW_CHECK` = `plan-update-check.md`");
    const scopeCall = review.split("Invoke `@bkit-plan-scope-check`")[1];
    expect(scopeCall).toContain("/{REVIEW_CHECK}`");
    const scopePrompt = fs.readFileSync(
      path.join(REPO_ROOT, ".bkit/core/prompts/bkit-plan-scope-check.md"),
      "utf8",
    );
    const updatePrompt = fs.readFileSync(
      path.join(REPO_ROOT, ".bkit/core/prompts/bkit-plan-update.md"),
      "utf8",
    );
    expect(scopePrompt).toContain("`CRITICAL` plan-edit finding");
    expect(updatePrompt).toContain(
      "Apply the supplied plan-check findings with the review critiques",
    );
    expect(update).toContain(
      "plan-v1-draft.md`, `docs/plans/{YYYYMM}/logs/{FID}/plan-generate-check.md`",
    );
    expect(updatePrompt).toContain(
      "Preserve every task, requirement, dependency, acceptance criterion and planned test",
    );
    for (const step of [update, close]) {
      expect(step).toContain("--existence=refuse");
      expect(step).toContain("second exit 1");
      expect(step).not.toContain("every `kind`");
    }
    expect(update).toContain("**If** exit 0 → sub-step 5.");
    expect(close).toContain("**If** exit 0 → the commit below.");
    expect(plan).not.toContain("PLAN_CHECK_REPAIRS");
    expect(plan).not.toContain("PLAN_CHECK_LIMIT");
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

  it.each(["design", "plan"])("%s close names the file that holds the open questions", (name) => {
    const lines = section(workflow(name), /Close Workflow/).split("\n");
    const file = `\`## Open Questions\` in \`docs/plans/{YYYYMM}/logs/{FID}/${name}-summary.md\``;
    const offer = lines.filter((l) => l.includes("open questions one by one"));
    expect(offer, name).toHaveLength(2);
    for (const l of offer) expect(l, name).toContain(file);
  });
});

describe("PR fallback", () => {
  it.each(ALL)("%s: every create_pull_request step passes the printed bodyFile", (name) => {
    const lines = workflow(name)
      .split("\n")
      .filter((l) => l.includes("`create_pull_request`"))
      .filter((l) => l.includes("printed"));
    for (const l of lines) {
      expect(l, name).toContain("the content of the printed `bodyFile` as `body`");
      expect(l, name).not.toMatch(/printed `title`(?: \/|,) `body`/);
    }
  });
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

const FINAL_RETURN_CLOSES = { design: 1, plan: 1, build: 2, debug: 1, ship: 1 } as const;

describe("final return at the close", () => {
  it.each(PHASES)(
    "%s builds its final message in `workflows close` and displays it verbatim",
    (name) => {
      const text = workflow(name);
      const lines = text.split("\n");
      const close = commandLines(text, "workflows close").filter((l) =>
        l.includes("--final-return"),
      );
      // Build closes two ways: the publish close and the held close.
      expect(close, name).toHaveLength(FINAL_RETURN_CLOSES[name]);
      for (const line of close) expect(line).toContain('--session-dir="{SESSION_DIR}"');
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
  lines.flatMap((l, i) =>
    /^\s*(?:BKIT_PR_CONFLICT_CHECK=false )?"\{BKIT\}" branches push\b/.test(l) ? [i] : [],
  );

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
        .filter((t) => t.includes("fids parse --branch"));
      expect(recover, name).toHaveLength(1);
      const t = recover[0]!;
      expect(t).toContain('"{BKIT}" fids parse --branch="feat/{FID}"');
      expect(t).toContain("**If** exit 0 and `issueId` non-null → hold `issueId` as `ISSUE_ID`");
      expect(t).toContain('**If** exit 0 and `issueId` null → set `ISSUE_ID=""`');
      expect(t).toContain("→ as exit 0 with `issueId` null");
      expect(t).toContain("NEVER create a tracker issue");
      expect(t.indexOf("fids parse")).toBeLessThan(t.indexOf("no-issue warning"));
      // A branch suffix that is not a slug asks the owner to rename it before anything starts.
      const stop = t.split("\n").find((l) => l.includes("**If** exit 3"));
      expect(stop, name).toContain("**Action needed — Branch name:**");
      expect(stop).toContain("rename `BRANCH` to `feat/{lowercase-slug}`, or name an issue");
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

  it("ship's merge MCP fallback proves the scoped dev base through the engine before merging", () => {
    const ship = workflow("ship");
    const baseProof = ship.indexOf("The engine must establish `base.ref` = `dev`");
    const mergeProof = ship.indexOf("run that engine gate again before mutation");
    const mutation = ship.indexOf("Only exit 0 authorizes `merge_pull_request`");
    expect(baseProof).toBeGreaterThan(-1);
    expect(mergeProof).toBeGreaterThan(baseProof);
    expect(mutation).toBeGreaterThan(mergeProof);
    expect(ship.slice(baseProof, mergeProof)).toContain(
      '--facts-file="{OUTBOX}/ship-gate-facts.json"',
    );
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
        /^- \[ \] (?:Issue update attempted|Artifact link list|Blocker check attempted|Labels re-read after the push|Auto-label presence|Marker `bkit \[auto route\]`)/.test(
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

  it.each(PHASES)("%s: the no-issue warning flag sits outside every issue-only span", (name) => {
    const lines = workflow(name).split("\n");
    const blocks = trackerBlocks(lines);
    const at = lines
      .map((l, i) => [l, i] as const)
      .filter(([l]) => l.includes("the no-issue warning was emitted → add `--warning="))
      .map(([, i]) => i);
    expect(at.length, name).toBeGreaterThan(0);
    for (const i of at) {
      const block = innermostBlock(blocks, i);
      expect(block, `${name}:${i + 1}`).toBeDefined();
      expect(
        lines.slice(block!.start, i).some((l) => l.includes(SKIP_NO_ISSUE)),
        `${name}:${i + 1}: the warning flag follows a Skip if ISSUE_ID empty line`,
      ).toBe(false);
    }
  });

  it("build 16.9 and debug 11.9 post-push label re-reads skip when ISSUE_ID is empty", () => {
    for (const [name, step] of [
      ["build", /Step 16 — Close Workflow/],
      ["debug", /Step 11 — Close Workflow/],
    ] as const) {
      const lines = section(workflow(name), step).split("\n");
      const at = lines.findIndex((l) =>
        /^9\. .*re-read the issue's labels after the push/i.test(l),
      );
      expect(at, `${name}: post-push label re-read sub-step 9`).toBeGreaterThanOrEqual(0);
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

  it("build 16.9 and debug 11.9 report a removed bkit:auto and stop nothing", () => {
    for (const [name, step] of [
      ["build", /Step 16 — Close Workflow/],
      ["debug", /Step 11 — Close Workflow/],
    ] as const) {
      const lines = section(workflow(name), step).split("\n");
      const at = lines.findIndex((l) => /^9\. /.test(l));
      const [from, to] = itemRange(lines, at);
      const item = lines.slice(from, to).join("\n");
      expect(item, name).not.toMatch(/terminate|kill switch active/i);
      expect(item, name).toContain(
        "**If** `bkit:auto` not in `LABELS` → the run ends as it would anyway, because its push is done → add the line `Label bkit:auto removed during this run: the cloud gate starts no new run on this issue until it is added back` after `{FINAL_RETURN}` in the final message.",
      );
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

  it("debug passes --base only when it runs in place on dev, outside the no-leak scan", () => {
    expect(debug).not.toContain("origin/dev..HEAD");
    expect(debug).not.toContain("DIFF_BASE");
    for (const line of commandLines(debug, "context diff")) expect(line).toContain("{BASE_FLAG}");
    for (const line of commandLines(debug, "branches scan-diff").filter(
      (l) => !l.includes('--marker="[DEBUG-OBSERVE]"'),
    ))
      expect(line).toContain("{BASE_FLAG}");
    const step2 = section(debug, /Step 2 — Worktree Setup/);
    expect(step2).toContain("`{BASE_FLAG}` = `--base={startSha}` when `startSha` is present");
    expect(step2).not.toContain("`origin/dev` when null");
  });

  it("build migration scan and debug off-dev no-leak scan pass --base=origin/dev", () => {
    const migration = commandLines(workflow("build"), "branches scan-diff").filter((l) =>
      l.includes("--paths="),
    );
    expect(migration.length).toBeGreaterThan(0);
    for (const line of migration) expect(line).toContain("--base=origin/dev");
    const noLeak = commandLines(debug, "branches scan-diff").filter((l) =>
      l.includes('--marker="[DEBUG-OBSERVE]"'),
    );
    expect(noLeak.length).toBeGreaterThan(0);
    for (const line of noLeak) expect(line).not.toContain("{BASE_FLAG}");
    expect(debug).toContain("--base=origin/dev");
    expect(debug).toContain("--base={startSha}");
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
    expect(line).toContain("**Action needed — Foreign path:**");
    expect(line).not.toMatch(/→ \*\*Failure Path\*\*/);
  });
});

describe("ship deferred sweep base", () => {
  it("ship sweep and Failure Path context diff lines pass --base=origin/dev", () => {
    const ship = workflow("ship");
    const lines = commandLines(ship, "context diff");
    for (const step of ["ship-deferred-sweep", "abort-handover"]) {
      const hit = lines.filter((l) => l.includes(`--step=${step}`));
      expect(hit.length, step).toBeGreaterThan(0);
      for (const line of hit) expect(line, step).toContain("--base=origin/dev");
    }
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
    expect(loop).toContain(
      "**If** `LOOP_LIMIT` is not held **and** `LOOP_TREND` != `stuck` **and** `LOOP_TREND` != `worse` →",
    );
    const step3 = section(workflow("debug"), /Step 3 — Run Tests/);
    expect(step3).toContain("`LOOP_POINT` = `fix`, `LOOP_FIX` = `debug-failure-remediate`");
    expect(step3).toContain("`LOOP_POINT` = `soak`, `LOOP_FIX` = `debug-failure-soak`");
  });

  it("debug Loop Question states the engine's trend line, never a fixed claim", () => {
    const loop = section(workflow("debug"), /Loop Question/);
    expect(loop).toContain("`trendLine` as `LOOP_TREND_LINE`");
    const questions = loop.split("\n").filter((l) => l.includes("**Q1 — "));
    expect(questions.length).toBeGreaterThanOrEqual(4);
    for (const q of questions) {
      expect(q, q).toContain("{LOOP_TREND_LINE}");
      expect(q, q).not.toContain("left no fewer failures");
    }
    expect(loop).toMatch(/taken without asking \([^\n]*\{LOOP_TREND_LINE\}/);
    expect(loop).not.toContain("left no fewer failures");
  });

  it("debug Loop Question at the used-up soak limit states the trend line", () => {
    const loop = section(workflow("debug"), /Loop Question/);
    expect(loop).toMatch(
      /`LOOP_LIMIT` = true.*\*\*Q1 — Soak:\*\* The soak attempts are used up[^\n]*\{LOOP_TREND_LINE\}/,
    );
    expect(loop).toContain("`Recommended: A) Stop — the attempts set aside for this are used up`");
  });

  it("ship asks the Merge Question only when the merge attempts are used up", () => {
    const question = section(workflow("ship"), /Merge Question/);
    expect(question).toContain("when `ship.merge.maxAttempts` is used up");
    expect(question).not.toContain("diagnosis");
    expect(question).not.toContain("Step 11");
    expect(question).not.toContain("return to the calling step");
    expect(question).not.toMatch(/`Try again`\s+\*\*and\*\*\s+`LIMIT_NEXT`/);
    expect(question).toContain("counters grant");
  });
});

// ---------------------------------------------------------------------------
// Build's ending: `publish` resolved once in Step 2, the held close in Step 16.
// ---------------------------------------------------------------------------

describe("build publish ending", () => {
  const build = workflow("build");
  const step2 = () => section(build, /Step 2 — Worktree Setup/);
  const step15 = () => section(build, /Step 15 — Summary/);
  const step16 = () => section(build, /Step 16 — Close Workflow/);
  /** The held fence and the publish path of Step 16, split at the two path labels. */
  const paths = () => {
    const text = step16();
    expect(text).toMatch(
      /\*\*If\*\* `PUBLISH` = false → \*\*Held close\*\*\.\n\*\*Else\*\* → \*\*Publish close\*\*\./,
    );
    const held = text.indexOf("**Held close:**");
    const pub = text.indexOf("**Publish close:**");
    expect(held, "no **Held close** label").toBeGreaterThanOrEqual(0);
    expect(pub, "no **Publish close** label").toBeGreaterThan(held);
    return {
      held: text.slice(held, pub),
      publish: text.slice(pub, text.indexOf("### 🔒 Gate 16")),
      gate: text.slice(text.indexOf("### 🔒 Gate 16")),
    };
  };

  it("resolves publish through status route", () => {
    const text = step2();
    const route = commandLines(text, "status route");
    expect(route).toHaveLength(1);
    expect(route[0]).toContain("--workflow=build");
    expect(route[0]).toContain('--file="{STATUS}"');
    expect(route[0]).toContain('--prompt-file="{SESSION_DIR}/prompt.md"');
    expect(text).toContain("`publish` as `PUBLISH`");
    expect(text).toContain("`publishSource` as `PUBLISH_SOURCE`");
    const assert = commandLines(text, "runtime assert");
    expect(assert).toHaveLength(1);
    expect(assert[0]).not.toContain("/dev/null");
  });

  it("re-derives publish on resume", () => {
    // Steps 1-2 run again on every resume, so the only place `PUBLISH` is set is Step 2,
    // after `runtime row`, and nothing reads it before except the Failure Path and Decision
    // Pause, which treat an unset value as publish true.
    const reads = build
      .replace(section(build, /Failure Path/), "")
      .replace(section(build, /Decision Pause/), "");
    const first = reads.search(/`\{?PUBLISH\}?`|=\{PUBLISH\}/);
    expect(first).toBeGreaterThan(reads.indexOf("## 🤖 Step 2 — Worktree Setup"));
    const text = step2();
    expect(text.indexOf("status route --workflow=build")).toBeGreaterThan(
      text.indexOf("runtime row"),
    );
    expect(build).toMatch(/Steps 1-2 always run again/i);
  });

  it("warns when a non-LOCAL run resolves publish false", () => {
    const text = step2();
    expect(text).toContain("`PUBLISH_SOURCE` = coerced");
    expect(text).toMatch(/Warning: publish=false[^\n]*publishes/);
  });

  it("skips push, PR and CI on a held close", () => {
    const { held } = paths();
    for (const verb of [
      "branches push",
      "prs probe",
      "prs open",
      "runs dispatch",
      "branches scan-diff",
      "branches force-build",
    ])
      expect(commandLines(held, verb), verb).toEqual([]);
    const close = commandLines(held, "workflows close");
    expect(close).toHaveLength(1);
    expect(close[0]).toContain("--ending=held --publish=false --record-step");
    expect(commandLines(held, "locks release")).toHaveLength(1);
    expect(commandLines(held, "issues labels")[0]).toContain("--board=review");
    expect(held).toContain("built locally, not published");
  });

  it("keeps the publish=true close path", () => {
    const { publish } = paths();
    for (const verb of ["prs probe", "branches scan-diff", "prs open", "runs dispatch"])
      expect(commandLines(publish, verb).length, verb).toBeGreaterThan(0);
    expect(commandLines(publish, "branches push").join("\n")).toContain("--require-ci");
    expect(publish).toContain("Final return: display `{FINAL_RETURN}` verbatim");
  });

  it("appends the held roadmap row without roadmap mirror", () => {
    const { held, publish } = paths();
    const row = commandLines(held, "roadmap feature");
    expect(row).toHaveLength(1);
    expect(row[0]).toContain('--root="{WORKTREE_PATH}" --workflow=build --fid={FID}');
    expect(held).not.toContain("roadmap mirror");
    expect(commandLines(publish, "roadmap mirror")).toHaveLength(1);
  });

  it("makes Gate 15 conditional on the held path", () => {
    const text = step15();
    expect(commandLines(text, "workflows summary")[0]).toContain("--publish={PUBLISH}");
    const gate = text.slice(text.indexOf("### 🔒 Gate 15"));
    expect(gate).toMatch(/- \[ \] Open-PR probe ran before any push/);
    expect(gate).toMatch(/- \[ \] Summary commit pushed, or kept local on a held run/);
    const body = text.slice(0, text.indexOf("### 🔒 Gate 15"));
    expect(body).toMatch(/\*\*If\*\* `PUBLISH` = false → sub-step 5\.\n[\s\S]*prs probe/);
  });

  it("runs only the close gate on the held path", () => {
    const { gate } = paths();
    const closeAt = gate.indexOf("--step=build-close-workflow");
    const prAt = gate.indexOf("--step=build-create-pr");
    expect(closeAt).toBeGreaterThanOrEqual(0);
    expect(prAt).toBeGreaterThan(closeAt);
    expect(gate.slice(closeAt, prAt)).toMatch(/\*\*If\*\* `PUBLISH` = true → also run:/);
    expect(gate).toMatch(
      /\*\*If\*\* `PUBLISH` = false → tick only[^\n]*\n\*\*Else\*\* → tick every item\./,
    );
  });
});

describe("build Decision Pause continue route", () => {
  const pause = () => section(workflow("build"), /Decision Pause/);
  /** The line number and text of the rule that sets `DECISION_ROUTE` to `route`. */
  const routeRule = (text: string, route: string) => {
    const lines = text.split("\n");
    const at = lines.findIndex((l) => l.includes(`\`DECISION_ROUTE\` = \`${route}\``));
    expect(at, `no rule setting DECISION_ROUTE = ${route}`).toBeGreaterThanOrEqual(0);
    return { at, line: lines.at(at) ?? "" };
  };
  /** The routing lines of step 7 that mention `continue`, continuation lines joined. */
  const continueRoutes = (text: string) =>
    text
      .slice(text.indexOf("7. Route"))
      .replace(/\\\n\s*/g, " ")
      .split("\n")
      .filter((l) => l.includes("`continue`"));

  it("a verify or holistic pause routes continue before the verify and holistic re-runs", () => {
    const text = pause();
    const cont = routeRule(text, "continue");
    expect(cont.at).toBeGreaterThan(routeRule(text, "retry").at);
    expect(cont.at).toBeLessThan(routeRule(text, "holistic").at);
    expect(cont.at).toBeLessThan(routeRule(text, "verify").at);
  });

  it("the Decision Pause continue route is taken only through decisions skip", () => {
    const text = pause();
    const skip = commandLines(text, "decisions skip");
    expect(skip).toHaveLength(1);
    expect(skip[0]).toContain(
      'decisions skip --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md"',
    );
    const lines = text.split("\n");
    const call = lines.findIndex((l) => l.includes('"{BKIT}" decisions skip'));
    const cont = routeRule(text, "continue");
    // The route is set on the skip's exit 0, right below the call.
    expect(cont.at).toBeGreaterThan(call);
    expect(cont.line).toMatch(/exit 0 → `DECISION_ROUTE` = `continue`/);
    expect(lines.slice(call, call + 8).join("\n")).toMatch(/exit 1 →[^\n]*re-run/);
    // The conditions live in the engine, not in the prose.
    expect(text).not.toContain("Accept (assumed)`, the loop question");
    expect(text).not.toMatch(/no `Gate: FAIL` header/);
    expect(text).not.toMatch(/holds `Source changed: false` \(read from the file/);
  });

  it("continue sends holistic to Step 11 and verify to the decision tick then Step 7", () => {
    const routes = continueRoutes(pause()).join("\n");
    expect(routes).toMatch(/holistic[^\n]*Step 11/);
    expect(routes).toMatch(/verify[^\n]*"\{BKIT\}" tasks tick[^\n]*--decision=[^\n]*Step 7/);
  });

  it("the continue decision tick runs before the build-decision row is recorded", () => {
    const lines = pause().split("\n");
    const tick = lines.findIndex((l) => /tasks tick[^\n]*--decision=/.test(l));
    const record = lines.findIndex((l) =>
      l.includes("steps finish --workflow=build --step=build-decision"),
    );
    expect(tick, "no tasks tick --decision line").toBeGreaterThanOrEqual(0);
    expect(record, "no build-decision steps finish line").toBeGreaterThanOrEqual(0);
    expect(tick).toBeLessThan(record);
  });

  it("the holistic continue tick runs without --group before the build-decision row is recorded", () => {
    const lines = pause().split("\n");
    const tick = lines.findIndex((l) => /"\{BKIT\}" tasks tick --plan="[^"]*" --decision=/.test(l));
    const record = lines.findIndex((l) =>
      l.includes("steps finish --workflow=build --step=build-decision"),
    );
    expect(tick, "no holistic tasks tick --decision line").toBeGreaterThanOrEqual(0);
    expect(tick).toBeLessThan(record);
    expect(lines.slice(Math.max(0, tick - 4), tick).join("\n")).toContain("From: holistic");
  });

  it("both VERIFY_GAPS lists title an item Task {N} for the decision tick", () => {
    const text = pause();
    expect(text).not.toContain("For the verify list, title each item");
    expect(text).toMatch(
      /For either `VERIFY_GAPS` list:\n\s+- Title each item `Task \{N\}` from its `TASK \{N\}` gap line/,
    );
  });

  it("a verify or holistic decision file records Source changed and a resume holds it", () => {
    const text = pause().replace(/\\\n\s*/g, " ");
    expect(text).toContain('--header="Source changed={SOURCE_CHANGED}"');
    const headerLines = text
      .split("\n")
      .filter((l) => l.includes('--header="Source changed={SOURCE_CHANGED}"'));
    expect(headerLines.join("\n")).toMatch(/verify/);
    expect(headerLines.join("\n")).toMatch(/holistic/);
    const resume = workflow("build")
      .split("\n")
      .find((l) => l.startsWith("- **Resume:**"));
    expect(resume, "no Resume line").toBeDefined();
    expect(resume).toMatch(/`sourceChanged` as `SOURCE_CHANGED`/);
  });

  it("the continue decision tick routes a non-zero exit to the Failure Path", () => {
    const verifyRoute = continueRoutes(pause())
      .filter((l) => /From: verify/.test(l))
      .join("\n");
    expect(verifyRoute).not.toBe("");
    expect(verifyRoute).toMatch(/non-zero|exit/i);
    expect(verifyRoute).toContain("Failure Path");
  });
});

describe("questions never re-run a check without a change", () => {
  it("debug and ship questions offer no answer that re-runs a check without a change", () => {
    const allowed = new Set(["Stop", "Try again", "Confirm", "Reject"]);
    for (const name of ["debug", "ship"]) {
      // Each option of a mid-run question sits on its own line: `{L}) {name} — {effect}`.
      const offered = [...workflow(name).matchAll(/^[ \t]*[A-Z]\) ([^\n]+?) — /gm)].map((m) =>
        String(m[1]).trim(),
      );
      expect(offered.length, `${name} has no option lines`).toBeGreaterThan(0);
      expect(
        offered.filter((o) => !allowed.has(o)),
        `${name} offers an unexpected answer`,
      ).toEqual([]);
    }
  });
});

describe("planned tests a code step changed", () => {
  const prompt = (name: string) =>
    fs.readFileSync(path.join(REPO_ROOT, ".bkit", "core", "prompts", `${name}.md`), "utf-8");
  /** A BLOCKED test line form (`{N}`, `{file}`, `{name}`, `{why}`) filled in the way an agent fills it. */
  const filled = (form: string) =>
    form
      .replaceAll("{N}", "1")
      .replaceAll("{file}", "src/a.test.ts")
      .replaceAll("{name}", "adds a row")
      .replaceAll("{why}", "the new setup line");
  const FORM = (kind: "TASK" | "Gap") =>
    new RegExp(`BLOCKED — ${kind} \\{N\\}: test \`\\{file\\}\` \`\\{name\\}\` — \\{why\\}`);
  /** The line holding the keep-and-log case (a correct code change forces a planned-test edit), with the lines under it. */
  const keepCase = (text: string) => {
    const lines = text.split("\n");
    const at = lines.findIndex((l) => /\bkeep\b/i.test(l) && /\bforces?\b|\bforced\b/i.test(l));
    expect(
      at,
      "no line says a code change that forces a planned-test edit keeps the edit",
    ).toBeGreaterThanOrEqual(0);
    return lines.slice(at, at + 5).join("\n");
  };

  it("an exit 11 re-ask offers the BLOCKED test line the engine reads", () => {
    const reasks = workflow("build")
      .split("\n")
      .filter((l) => l.includes("**If** exit 11 →"))
      .filter((l) => l.includes("planned test case"));
    expect(reasks).toHaveLength(3);
    const kinds = ["TASK", "Gap", "Gap"] as const;
    /** The task a filled line names: `TASK {N}` names task 1, a `Gap {N}` line names none. */
    const taskOf = { TASK: 1, Gap: null } as const;
    reasks.forEach((line, i) => {
      const kind = kinds[i]!;
      const form = FORM(kind).exec(line.replaceAll("``", ""));
      expect(form, `exit 11 re-ask ${i + 1} offers no ${kind} test line form`).not.toBeNull();
      expect(blockedTests(filled(form![0]))).toEqual([
        {
          test: "src/a.test.ts",
          name: "adds a row",
          reason: "the new setup line",
          task: taskOf[kind],
        },
      ]);
      // The agent appends its DONE line again after the BLOCKED one.
      const after = line.slice(line.indexOf(form![0]) + form![0].length);
      expect(after).toMatch(new RegExp(`DONE — ${kind} \\{N\\}`));
      expect(after).toMatch(/again/);
    });
  });

  it("Step 15 asks once about planned tests a code step changed, before the unproven ones", () => {
    const step = stepBody(workflow("build"), /Step 15 — Summary/);
    const skip = step.split("\n").find((l) => l.includes("**Skip if**"))!;
    expect(skip).toContain("`Question: CHANGED_TESTS`");
    expect(skip).toContain("`Question: UNPROVEN`");
    expect(step).toMatch(/Hold `changed` as `CHANGED_TESTS`/);
    const changedAt = step.indexOf("`PAUSE_QUESTION` = `CHANGED_TESTS`");
    const unprovenAt = step.indexOf("`PAUSE_QUESTION` = `UNPROVEN`");
    expect(changedAt).toBeGreaterThanOrEqual(0);
    expect(unprovenAt).toBeGreaterThan(changedAt);
    // A CHANGED_TESTS answer alone never skips `tests green`: the opening skip needs both answers.
    expect(skip).toMatch(/both/i);
  });

  it("a changed-test item offers Accept or Stop, recommended Accept", () => {
    const pause = section(workflow("build"), /Decision Pause/);
    const rule = pause.split("\n").find((l) => l.includes("`PAUSE_QUESTION` = `CHANGED_TESTS`"));
    expect(rule, "§ Decision Pause has no CHANGED_TESTS item rule").toBeDefined();
    expect(rule).toContain("Options `Accept` and `Stop`");
    expect(rule).toMatch(/recommended `Accept`/);
  });

  it("the execute prompt's BLOCKED test line is one the engine reads", () => {
    const text = keepCase(prompt("bkit-build-plan-tasks"));
    const form = FORM("TASK").exec(text.replaceAll("``", ""));
    expect(form, "the keep-and-log case has no TASK test line form").not.toBeNull();
    expect(blockedTests(filled(form![0]))).toHaveLength(1);
    expect(text).toMatch(/DONE/);
    expect(text).toMatch(/prettier/);
  });

  it("the remediate prompt's BLOCKED test line is one the engine reads", () => {
    const whole = prompt("bkit-build-plan-gaps-remediate");
    const text = keepCase(whole);
    const form = FORM("Gap").exec(text.replaceAll("``", ""));
    expect(form, "the keep-and-log case has no Gap test line form").not.toBeNull();
    expect(blockedTests(filled(form![0]))).toHaveLength(1);
    expect(text).toMatch(/DONE/);
    expect(text).toMatch(/prettier/);
    const log = whole.slice(whole.indexOf("## Remediation Log"));
    expect(FORM("Gap").test(log.replaceAll("``", ""))).toBe(true);
  });

  it("a changed-test item shows the test's line diff since its baseline", () => {
    const pause = section(workflow("build"), /Decision Pause/);
    const rule = pause.split("\n").find((l) => l.includes("`PAUSE_QUESTION` = `CHANGED_TESTS`"));
    expect(rule, "§ Decision Pause has no CHANGED_TESTS item rule").toBeDefined();
    expect(rule).toMatch(/\bdiff\b/);
    expect(rule).toMatch(/baseline/);
  });

  it("the code prompts say a BLOCKED line lets through only a change that adds lines", () => {
    for (const name of ["bkit-build-plan-tasks", "bkit-build-plan-gaps-remediate"]) {
      const text = keepCase(prompt(name));
      expect(text, `${name}: no add-only guidance`).toMatch(/adds? lines|only adds|additive/i);
      expect(text, `${name}: no refusal of removed lines`).toMatch(
        /(removes?|rewrites?)[^.\n]*(planned test's lines|lines)[^.\n]*refused|refused[^.\n]*(removes?|rewrites?)/i,
      );
    }
  });

  it("the verify prompt notes a planned test a code step changed and raises no gap", () => {
    const lines = prompt("bkit-build-plan-verify").split("\n");
    const at = lines.findIndex((l) => l.includes("`Changed by a code step` section"));
    expect(at, "no `Changed by a code step` section rule").toBeGreaterThanOrEqual(0);
    const rule = lines.slice(at, at + 2).join("\n");
    expect(rule).toContain("`Notes`");
    expect(rule).toMatch(/No gap/);
    expect(rule).not.toMatch(/append ``?TASK/);
  });

  it("the verify prompt reads a changed test's added lines for a skip, an early return or a reassignment", () => {
    const lines = prompt("bkit-build-plan-verify").split("\n");
    const at = lines.findIndex((l) => l.includes("`Changed by a code step` section"));
    expect(at, "no `Changed by a code step` section rule").toBeGreaterThanOrEqual(0);
    const rule = lines
      .slice(at)
      .join("\n")
      .split(/\n {3}- `Updated tests`/)[0]!;
    expect(rule).toMatch(/added lines?/);
    expect(rule).toMatch(/\bdiff\b/);
    expect(rule).toMatch(/early `?return/);
    expect(rule).toMatch(/skip/);
    expect(rule).toMatch(/reassign/);
    expect(rule).toContain("test-loosened");
  });
});

describe("build planned-test takeovers", () => {
  const build = workflow("build");
  /** The lines of the build that start a given route, continuation lines not joined. */
  const routes = (start: string) => build.split("\n").filter((l) => l.includes(start));

  it("the build routes a tests-step exit 11 once, and leaves the takeover write to the engine", () => {
    // A tests step that edits an earlier task's planned test is re-asked once, then fails.
    const testsStep = routes("**If** exit 11 →").filter((l) =>
      l.includes("@bkit-build-plan-tests"),
    );
    expect(testsStep).toHaveLength(1);
    expect(testsStep[0]).toContain("<tests>");
    expect(testsStep[0]).toMatch(/\*\*Failure Path\*\*/);
    // Step 9's restore routes its exits the same way, by pointing at Step 7 sub-step 5.
    expect(stepBody(build, /Step 9 — Plan Gaps Remediate/)).toContain(
      "Route exit 15 and exit 11 as Step 7 sub-step 5 routes them",
    );
    // `steps finish` adds the takeover task itself: no step routes on `contradicts` or
    // writes a takeover, and the only `tasks takeover` call reads the pending group.
    expect(build).not.toContain("`contradicts`");
    expect(commandLines(build, "tasks takeover")).toEqual([
      expect.stringContaining("tasks takeover --pending"),
    ]);
  });

  it("Step 8 runs pending takeovers first, and a holistic fix goes back through Step 7", () => {
    const pending = section(build, /Pending takeovers/);
    expect(pending).toContain('"{BKIT}" tasks takeover --pending');
    expect(pending).toMatch(/Step 7 sub-steps 3-6/);
    const step8 = stepBody(build, /Step 8 — Plan Verify/);
    const first = step8.split("\n").findIndex((l) => /^1\. /.test(l));
    expect(step8.split("\n").slice(0, first).join("\n")).toContain("§ Pending takeovers");
    // Step 7 runs a takeover group the holistic fix added: its code, verify and tick.
    const step10 = stepBody(build, /Step 10 — Plan Verify Holistic/);
    expect(step10).not.toContain("§ Pending takeovers");
    const [fixed] = step10.split("\n").filter((l) => l.includes("**If** exit 0 → Step 7"));
    expect(fixed).toContain("goes straight to Step 10 when no group is open");
    expect(step10).not.toContain("re-run Step 10");
    expect(build).toContain(
      "- **If** `DECISION_ROUTE` = `holistic` → Step 7, which runs a takeover group",
    );
    // A resumed gate re-run records the pending takeover's tests before the gate runs.
    const [resume] = build.split("\n").filter((l) => l.startsWith("- **Resume:**"));
    expect(resume).toBeDefined();
    const rerun = resume!.slice(resume!.indexOf("`gateRerun` = true"));
    expect(rerun.indexOf("§ Pending takeovers")).toBeGreaterThan(-1);
    expect(rerun.indexOf("§ Pending takeovers")).toBeLessThan(rerun.indexOf("decisions apply"));
  });
});
