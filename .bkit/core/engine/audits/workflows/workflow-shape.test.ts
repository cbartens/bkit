// Workflow shapes the reviews pinned: each test reads the shipped `.bkit/core/workflows/*.md`
// and fails when the shape a command or route depends on is gone.

import * as fs from "node:fs";
import * as path from "node:path";

import { describe, expect, it } from "vitest";

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
      expect(text.split("Skipped: comments did not parse.").length - 1, name).toBe(2);
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
