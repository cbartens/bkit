// Workflow shapes the reviews pinned: each test reads the shipped `.bkit/workflows/*.md`
// and fails when the shape a command or route depends on is gone.

import * as fs from "node:fs";
import * as path from "node:path";

import { describe, expect, it } from "vitest";

const REPO_ROOT = path.resolve(__dirname, "../../../../..");
const PHASES = ["design", "plan", "build", "debug", "ship"] as const;

const workflow = (name: string) =>
  fs.readFileSync(path.join(REPO_ROOT, ".bkit", "workflows", `bkit-${name}.md`), "utf-8");

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
    .filter((l) => l.includes(`"$BKIT" ${verb}`));

describe("Step 1 FID check", () => {
  it.each(PHASES)("%s checks the resolved FID at Step 1, outside every tracker block", (name) => {
    const step1 = section(workflow(name), /Step 1 — Start Workflow/);
    const at = step1.indexOf(`"$BKIT" fids check --fid="{FID}"`);
    expect(at, `${name}: no fids check in Step 1`).toBeGreaterThanOrEqual(0);
    // Not inside a tracker block: the last block marker before it closes one (or there is none).
    const before = step1.slice(0, at);
    const lastOpen = before.lastIndexOf("<!-- bkit:tracker");
    if (lastOpen !== -1) expect(before.slice(lastOpen)).toMatch(/^<!-- bkit:tracker \S+ end -->/);
    expect(step1).toContain("FID format checked (`bkit fids check` exit 0)");
  });
});

describe("pre-worktree commit", () => {
  it.each(["design", "plan", "build"])("%s passes the repo root explicitly", (name) => {
    const lines = commandLines(workflow(name), "ledgers commit").filter((l) =>
      l.includes("pre-worktree"),
    );
    expect(lines.length, name).toBe(1);
    expect(lines[0]).toContain(
      '--root="$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")"',
    );
  });
});

describe("build", () => {
  const build = workflow("build");

  it("passes each clamp flag as its own quoted argument, never through a spliced variable", () => {
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

  it("Failure Path names a lock that `workflows fail` could not remove (exit 5)", () => {
    const failure = section(build, /Failure Path/);
    expect(failure).toContain('"$BKIT" workflows fail --workflow=build');
    expect(failure).toContain("**If** exit 5 → add `Lock removal failed` to the step 3 error.");
  });

  it("commits the test log, clamped, beside the run's artifacts", () => {
    const step14 = section(build, /Step 14 — Run Tests/);
    expect(step14).toContain(
      'TEST_LOG="docs/plans/{YYYYMM}/logs/{FID}/run-tests-{TEST_ATTEMPT}.md"',
    );
    expect(step14).toContain('cp "{OUTBOX}/run-tests-{TEST_ATTEMPT}.log" "$TEST_LOG" || exit 2');
    expect(step14).toContain(
      '"$BKIT" context clamp --artifact="$TEST_LOG" --profile=debug-evidence',
    );
    expect(step14).toContain(
      '--artifact="docs/plans/{YYYYMM}/logs/{FID}/run-tests-${TEST_ATTEMPT}.md"',
    );
  });

  it("Step 15's diagnose agent reads the committed log, not the outbox copy", () => {
    const step15 = section(build, /Step 15 — Failure Diagnose/);
    const read = step15.split("\n").find((l) => l.trim().startsWith("Read:"));
    expect(read).toContain("`docs/plans/{YYYYMM}/logs/{FID}/run-tests-{TEST_ATTEMPT}.md`");
    expect(read).not.toContain("{OUTBOX}");
  });

  it("writes the challenge attempt on every row, 0 included", () => {
    for (const step of ["build-challenge", "build-challenge-reconcile"]) {
      const line = commandLines(build, "steps done").find((l) => l.includes(`--step=${step} `));
      expect(line, step).toContain('--attempt="$CHALLENGE_REMEDIATE_ATTEMPT"');
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
  it("Failure Path pushes with --mode=abort", () => {
    const failure = section(workflow("debug"), /Failure Path/);
    expect(failure).toContain('"$BKIT" branches push --mode=abort');
  });

  it("records the PR URL in artifacts, not a prUrl field", () => {
    const debug = workflow("debug");
    expect(debug).not.toContain("prUrl");
    expect(debug).toContain('set -- --step=debug-create-pr --artifact="$PR_URL"');
  });
});

describe("verdict sites re-ask on PENDING (exit 5) as well as invalid (exit 6)", () => {
  it.each(["design", "plan"])(
    "%s: every steps verdict call routes exit 5 or 6 to a re-ask",
    (name) => {
      const text = workflow(name);
      const sites = text.split('"$BKIT" steps verdict').slice(1);
      expect(sites.length, name).toBeGreaterThan(0);
      for (const after of sites) {
        // The route sits between the fence that runs the read and the next numbered sub-step.
        const route = after.split(/\n\d+\. /)[0]!;
        expect(route, after.slice(0, 120)).toContain(
          "**If** exit 5 **or** 6 → invoke offending subagent again",
        );
      }
    },
  );

  it("plan's complexity verdict is recorded as `verdict`, from the agent's own set", () => {
    const plan = workflow("plan");
    const line = commandLines(plan, "steps done").find((l) =>
      l.includes("--step=plan-complexity-check"),
    );
    expect(line).toContain("--verdict={COMPLEXITY_VERDICT} --agent=bkit-plan-complexity-check");
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

  it("prints PHASE, MODE and RUN_ID for the orchestrator to hold", () => {
    expect(auto).toContain(`printf 'PHASE=%s MODE=%s\\n' "$PHASE" "$MODE"`);
    expect(auto).toContain(`printf 'RUN_ID=%s\\n' "$RUN_ID"`);
  });

  it("Timeouts header line says 3600 seconds, like the phase workflows", () => {
    for (const name of ["auto", ...PHASES]) {
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

  it("post-merge check reads the capstone job alone", () => {
    const close = section(ship, /Step 15 — Close Workflow/);
    expect(close).toContain(
      '"$BKIT" runs gate --head="$SQUASH_SHA" --repo="{OWNER_REPO}" --capstone-only',
    );
  });

  it("cleanup removes only a workflow-created worktree and deletes the branch through the command", () => {
    const cleanup = section(ship, /Step 14 — Worktree Cleanup/);
    expect(cleanup).toContain('"$BKIT" worktrees remove --fid="{FID}" --branch="{SHIP_BRANCH}"');
    expect(cleanup).not.toContain("git branch -D");
    expect(cleanup).not.toContain("push origin --delete");
  });

  it("skill prune warns and carries on rather than stopping the ship", () => {
    const prune = section(ship, /Step 7 — Prune Skills/);
    expect(prune).toContain(
      "**If** `skipped` non-null **or** `failed` non-empty → narrate the warning → continue.",
    );
  });

  it("writes the revalidate timeout as timeout_s", () => {
    expect(ship).toContain('--field=timeout_s="$WAIT_ELAPSED_S"');
    expect(ship).not.toContain("timeoutS");
  });
});

describe("design and plan close", () => {
  it.each(["design", "plan"])(
    "%s deletes the feature branch only through `worktrees remove --branch`",
    (name) => {
      const text = workflow(name);
      expect(text).toContain('worktrees remove --fid={FID} --branch="feat/{FID}"');
      expect(text).not.toContain('git branch -D "feat/{FID}"');
      expect(text).not.toContain('git push origin --delete "feat/{FID}"');
    },
  );

  it("design skips a related issue whose comments do not parse, and names it", () => {
    const step3 = section(workflow("design"), /Step 3 — Brainstorm/);
    expect(step3.split("Skipped: comments did not parse.").length - 1).toBe(2);
    expect(step3).not.toMatch(
      /related-text block below → `text` → `RELATED_ISSUE_TEXT`\. \*\*If\*\* exit non-zero → \*\*Failure Path\*\*/,
    );
  });
});

describe("highest-version lookups", () => {
  it.each(["design", "plan"])(
    "%s never lists versions with an `ls` glob, which aborts unmatched in zsh",
    (name) => {
      expect(workflow(name)).not.toMatch(/\$\(ls /);
      expect(workflow(name)).toContain(
        `$(find docs/plans/{YYYYMM}/logs/{FID} -maxdepth 1 -type f -name '${name}-v*.md' 2>/dev/null`,
      );
    },
  );
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
