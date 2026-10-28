diff --git a/.agents/plugins/bkit/skills/bkit-build/SKILL.md b/.agents/plugins/bkit/skills/bkit-build/SKILL.md
index b1067d81a..4d3ef38ae 100644
--- a/.agents/plugins/bkit/skills/bkit-build/SKILL.md
+++ b/.agents/plugins/bkit/skills/bkit-build/SKILL.md
@@ -337,7 +337,8 @@ description: "Build Feature — Autonomous implementation"
    "{BKIT}" tests plan-check --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --existence=report --log="docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md"
    ```
    Route:
-   - **If** exit 0 **and** (`NEWER_COMMENTS` = 0 **or** `CONVERTED` is held) → Step 5.
+   - **If** exit 0, `CONVERTED` is not held **and** `NEWER_COMMENTS` = 0 → sub-step 4.
+   - **If** exit 0 **and** `CONVERTED` is held → Step 5.
    - **If** `CONVERTED` is not held **and** (exit 0 with `NEWER_COMMENTS` > 0, **or** exit 2 with no `docs/plans/{YYYYMM}/{FID}-plan.md`, **or** exit 1 with a `markers`, `matrix` or `supersession` problem) → sub-step 2.
    - **If** exit 1, `CONVERTED` is held **and** `CONVERT_RETRY` is not held → `CONVERT_RETRY` = the printed `problems` → sub-step 2.
    - **Else** → **Failure Path** naming each problem in the report.
@@ -349,12 +350,18 @@ description: "Build Feature — Autonomous implementation"
    ```bash
    "{BKIT}" steps finish --workflow=build --step=build-plan-convert --file="{STATUS}" --attempt-of=build-plan-convert:next --artifact=docs/plans/{YYYYMM}/{FID}-plan.md --optional-artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md --number=4 --post --title="Plan Convert" --message="chore({FID}): plan-convert attempt <attempt>"
    ```
+4. Plan already in task-block form: finish the step with no agent and no artifact, its comment naming the skip:
+   ```bash
+   "{BKIT}" steps finish --workflow=build --step=build-plan-convert --file="{STATUS}" --attempt=1 --number=4 --post --title="Plan Convert" --comment-field="Status=skipped (plan already in task-block form)" --message="chore({FID}): plan-convert skipped"
+   ```
+   Every outcome → Step 5.
 
 ### 🔒 Gate 4 — Plan Convert
 
 - [ ] Plan checked (`tests plan-check`)
 - [ ] Converted (`@bkit-build-plan-convert`, no inline work) when it had no task markers or issue comments are newer than it
 - [ ] Converted plan checked again (`tests plan-check`)
+- [ ] Skip recorded (`steps finish`) when the plan needed no conversion
 - [ ] Mechanical checks passed (`steps finish`)
 
 ---
diff --git a/.agents/skills/bkit-build/SKILL.md b/.agents/skills/bkit-build/SKILL.md
index 2c1a75fee..e2f9d4079 100644
--- a/.agents/skills/bkit-build/SKILL.md
+++ b/.agents/skills/bkit-build/SKILL.md
@@ -337,7 +337,8 @@ description: "Build Feature — Autonomous implementation"
    "{BKIT}" tests plan-check --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --existence=report --log="docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md"
    ```
    Route:
-   - **If** exit 0 **and** (`NEWER_COMMENTS` = 0 **or** `CONVERTED` is held) → Step 5.
+   - **If** exit 0, `CONVERTED` is not held **and** `NEWER_COMMENTS` = 0 → sub-step 4.
+   - **If** exit 0 **and** `CONVERTED` is held → Step 5.
    - **If** `CONVERTED` is not held **and** (exit 0 with `NEWER_COMMENTS` > 0, **or** exit 2 with no `docs/plans/{YYYYMM}/{FID}-plan.md`, **or** exit 1 with a `markers`, `matrix` or `supersession` problem) → sub-step 2.
    - **If** exit 1, `CONVERTED` is held **and** `CONVERT_RETRY` is not held → `CONVERT_RETRY` = the printed `problems` → sub-step 2.
    - **Else** → **Failure Path** naming each problem in the report.
@@ -349,12 +350,18 @@ description: "Build Feature — Autonomous implementation"
    ```bash
    "{BKIT}" steps finish --workflow=build --step=build-plan-convert --file="{STATUS}" --attempt-of=build-plan-convert:next --artifact=docs/plans/{YYYYMM}/{FID}-plan.md --optional-artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md --number=4 --post --title="Plan Convert" --message="chore({FID}): plan-convert attempt <attempt>"
    ```
+4. Plan already in task-block form: finish the step with no agent and no artifact, its comment naming the skip:
+   ```bash
+   "{BKIT}" steps finish --workflow=build --step=build-plan-convert --file="{STATUS}" --attempt=1 --number=4 --post --title="Plan Convert" --comment-field="Status=skipped (plan already in task-block form)" --message="chore({FID}): plan-convert skipped"
+   ```
+   Every outcome → Step 5.
 
 ### 🔒 Gate 4 — Plan Convert
 
 - [ ] Plan checked (`tests plan-check`)
 - [ ] Converted (`@bkit-build-plan-convert`, no inline work) when it had no task markers or issue comments are newer than it
 - [ ] Converted plan checked again (`tests plan-check`)
+- [ ] Skip recorded (`steps finish`) when the plan needed no conversion
 - [ ] Mechanical checks passed (`steps finish`)
 
 ---
diff --git a/.bkit/authoring.md b/.bkit/authoring.md
index 2a996ce81..640847da5 100644
--- a/.bkit/authoring.md
+++ b/.bkit/authoring.md
@@ -109,6 +109,7 @@ Binds `.bkit/core/workflows/*.md`; § Prompts and Workflows applies on top. Step
 - **Variable references:** Standalone prose mention: backticked, sigil optional. Literal enum plain (**If** `VERDICT` = PASS). Fenced output blocks and unfenced output-template fragments: plain. Enforced by `.bkit/core/engine/audits/workflows/block-locality-audit.test.ts`.
   - **Argument placeholders:** never `$0` to `$9` or `$ARGUMENTS`, fenced or not, because the host substitutes slash-command arguments (`$N` = `$ARGUMENTS[N]`, zero-based) into these files before the model reads them. Awk field reference → `$(N)`. never the host `\$N` escape (Claude Code only). Shell positional parameters have no `$(N)` equivalent; logic taking arguments becomes a `bkit <noun> <verb>` command (§ Workflow commands), and a block passes a flag list through `set --` / `"$@"`. Enforced by `.bkit/core/engine/audits/workflows/slash-arg-expansion.test.ts`.
   - **Variable names:** held step output = `{LOOP}_{FIELD}` in UPPER_SNAKE; prefix names the loop, not the agent (`VERIFY_FIXED` from gaps-remediate, `CHALLENGE_TASKS` from `challenge merge`); two-value flags take lowercase `true|false`.
+- **Step conditionality and rows:** The completeness check (`checks/status-holes.ts`) reads a step as conditional only when a column-0 `**Run only if**` / `**Skip if**` line sits anywhere in its section, or its heading carries a `(Path X only)` marker; a marker indented under a numbered sub-step, or in a section no step owns, marks nothing. Every step writes its own `steps finish` / `steps done` row on every route toward the next step (a no-agent skip row where no work runs), or carries a column-0 marker; a step that routes onward with no row and no marker reads as a step hole on every run.
 - **Gate items:** `- [ ]` + general prose reminder of what the step did — never a step detail (condition, path, variable, value set, field list, exit code) — `.bkit/workflows.md` § `Gates`. `- [ ] Verdict valid`, never `- [ ] Verdict valid (\`SUMMARY_VERDICT\` in \`PASS|CONCERNS|FAIL\`)`.
 - **No internal labels, no coined guard names:** NEVER cite a bkit-internal identifier (ledger key, tracker issue number, review-finding id) or a coined guard name in workflow files. Drop the label outright; the step lead-in states what the step does. Name the behaviour, never the record of it (`open-PR pre-flight`, not a finding id).
 - **Human questions:** orchestrator only, in session, never subagents; one message = every question of the round; per question `**Q{n} — {title}:** {question}` and the lettered option list `Options: A) {option} / B) {option}`, then `Recommended: A) {answer}` on its own line; options letter `A)`, `B)`, `C)` in order, a named option included (`Options: A) Accept / B) Fix now`); number from `Q1`; word each so "yes" accepts the recommendation; state what the owner must decide and what each option does, in plain English, before naming any file, test or identifier; plain text, no emoji, no host question tool; look facts up, never ask the human; narrate the round → record the wait (`bkit status row --type=owner-pause --field=reason={decision|grill|draft|loop|assumed|merge}`) → end turn → wait for answers; each reply → `bkit status row --type=owner-answer` before anything else; a step routing on the answer states the lettered-reply clause before its branches. Asking sections are prompt text: § Prompts and Workflows and § `Notation` bind them. Copy the shape from `bkit-design.md` Step 3 or `bkit-build.md` § Decision Pause.
diff --git a/.bkit/core/.bkit/authoring.md b/.bkit/core/.bkit/authoring.md
index b23666a13..30e0b22d4 100644
--- a/.bkit/core/.bkit/authoring.md
+++ b/.bkit/core/.bkit/authoring.md
@@ -109,6 +109,7 @@ Binds `.bkit/core/workflows/*.md`; § Prompts and Workflows applies on top. Step
 - **Variable references:** Standalone prose mention: backticked, sigil optional. Literal enum plain (**If** `VERDICT` = PASS). Fenced output blocks and unfenced output-template fragments: plain. Enforced by `.bkit/core/engine/audits/workflows/block-locality-audit.test.ts`.
   - **Argument placeholders:** never `$0` to `$9` or `$ARGUMENTS`, fenced or not, because the host substitutes slash-command arguments (`$N` = `$ARGUMENTS[N]`, zero-based) into these files before the model reads them. Awk field reference → `$(N)`. never the host `\$N` escape (Claude Code only). Shell positional parameters have no `$(N)` equivalent; logic taking arguments becomes a `bkit <noun> <verb>` command (§ Workflow commands), and a block passes a flag list through `set --` / `"$@"`. Enforced by `.bkit/core/engine/audits/workflows/slash-arg-expansion.test.ts`.
   - **Variable names:** held step output = `{LOOP}_{FIELD}` in UPPER_SNAKE; prefix names the loop, not the agent (`VERIFY_FIXED` from gaps-remediate, `CHALLENGE_TASKS` from `challenge merge`); two-value flags take lowercase `true|false`.
+- **Step conditionality and rows:** The completeness check (`checks/status-holes.ts`) reads a step as conditional only when a column-0 `**Run only if**` / `**Skip if**` line sits anywhere in its section, or its heading carries a `(Path X only)` marker; a marker indented under a numbered sub-step, or in a section no step owns, marks nothing. Every step writes its own `steps finish` / `steps done` row on every route toward the next step (a no-agent skip row where no work runs), or carries a column-0 marker; a step that routes onward with no row and no marker reads as a step hole on every run.
 - **Gate items:** `- [ ]` + general prose reminder of what the step did — never a step detail (condition, path, variable, value set, field list, exit code) — `.bkit/workflows.md` § `Gates`. `- [ ] Verdict valid`, never `- [ ] Verdict valid (\`SUMMARY_VERDICT\` in \`PASS|CONCERNS|FAIL\`)`.
 - **No internal labels, no coined guard names:** NEVER cite a bkit-internal identifier (ledger key, tracker issue number, review-finding id) or a coined guard name in workflow files. Drop the label outright; the step lead-in states what the step does. Name the behaviour, never the record of it (`open-PR pre-flight`, not a finding id).
 - **Human questions:** orchestrator only, in session, never subagents; one message = every question of the round; per question `**Q{n} — {title}:** {question}` and the lettered option list `Options: A) {option} / B) {option}`, then `Recommended: A) {answer}` on its own line; options letter `A)`, `B)`, `C)` in order, a named option included (`Options: A) Accept / B) Fix now`); number from `Q1`; word each so "yes" accepts the recommendation; state what the owner must decide and what each option does, in plain English, before naming any file, test or identifier; plain text, no emoji, no host question tool; look facts up, never ask the human; narrate the round → record the wait (`bkit status row --type=owner-pause --field=reason={decision|grill|draft|loop|assumed|merge}`) → end turn → wait for answers; each reply → `bkit status row --type=owner-answer` before anything else; a step routing on the answer states the lettered-reply clause before its branches. Asking sections are prompt text: § Prompts and Workflows and § `Notation` bind them. Copy the shape from `bkit-design.md` Step 3 or `bkit-build.md` § Decision Pause.
diff --git a/.bkit/core/.bkit/workflows.md b/.bkit/core/.bkit/workflows.md
index 859382b36..8cb90e3be 100644
--- a/.bkit/core/.bkit/workflows.md
+++ b/.bkit/core/.bkit/workflows.md
@@ -875,7 +875,7 @@ Each subsection documents command behaviour — steps, subagents, artifacts, ver
 | 1 — Start Workflow | — | Pre-flight: fetch `origin/dev`. Issue recovery as in design Step 1 (issue-less: tracker reads, labels, comments and the blocker check skipped). Set label `Build`, `In Progress`. Check `relations.blocked_by` — any blocker not in `{Done, Cancelled}` → Failure Path with `Blocked by {BLOCKER_ID}`. Resolve `FID`, then lock (missing month bucket → current month). no commits on `dev` — `start-workflow` step entry deferred to Step 2 inside the worktree. |
 | 2 — Worktree Setup | — | `bkit worktrees setup` (create / resume / adopt; dependencies installed). No path moves — plan stays at canonical bucket from design close. `bkit workflows input` writes `build-input-{RUN}.md`: session prompt, issue text and the plan as it arrived — the whole plan again, so only `@bkit-build-plan-convert` reads it; it stays as the record of what the run was given. Every other build agent reads the plan or its group's brief, and run instructions in the session prompt (a redo, a resume, a constraint) reach the brief's `Deviations` section through `--note-file` (Step 7). |
 | 3 — Branch Sync | — | `bkit branches sync --merge-docs`: fetch `origin/dev`; when commits touching `docs/` are behind, merge it — ledger conflicts union, other `docs/` conflicts take `dev`, a conflict outside `docs/` aborts the merge (exit 11 → Failure Path). |
-| 4 — Plan Convert | `@bkit-build-plan-convert` _(only when the plan is missing, has no task markers, or is older than an issue comment)_ | `bkit tests plan-check --existence=report` on `{FID}-plan.md` → `build-plan-check.md`. No plan (exit 2), a plan with no task markers (exit 1, problem `markers`) or with a `matrix` / `supersession` problem, or a valid plan with issue comments posted after its last commit (`newerThanPlan` > 0 from Step 2's `workflows input`) → `@bkit-build-plan-convert` writes the plan in task-block form from `build-input-{RUN}.md` and the plan file, keeping any existing plan's other sections; where they disagree the newer text wins, so later comments change the plan before any code; convert copies each `TEST EXCEPTION` an input writes word for word and never writes its own; row `build-plan-convert`, then the check re-runs. Still failing → convert once more with the printed problems, then Failure Path. Any other problem (caps, a stray `TEST FIRST` line) → Failure Path before any code, naming each problem. A valid plan with no newer comments writes no row and posts no comment. `bkit install` / `check` / `upgrade` list each `{FID}-plan.md` with no task markers whose FID has not shipped as advisory `plan-task-markers-missing`; nothing to do by hand, this step converts it. |
+| 4 — Plan Convert | `@bkit-build-plan-convert` _(only when the plan is missing, has no task markers, or is older than an issue comment; otherwise a skip row)_ | `bkit tests plan-check --existence=report` on `{FID}-plan.md` → `build-plan-check.md`. No plan (exit 2), a plan with no task markers (exit 1, problem `markers`) or with a `matrix` / `supersession` problem, or a valid plan with issue comments posted after its last commit (`newerThanPlan` > 0 from Step 2's `workflows input`) → `@bkit-build-plan-convert` writes the plan in task-block form from `build-input-{RUN}.md` and the plan file, keeping any existing plan's other sections; where they disagree the newer text wins, so later comments change the plan before any code; convert copies each `TEST EXCEPTION` an input writes word for word and never writes its own; row `build-plan-convert`, then the check re-runs. Still failing → convert once more with the printed problems, then Failure Path. Any other problem (caps, a stray `TEST FIRST` line) → Failure Path before any code, naming each problem. A valid plan with no newer comments writes a no-agent skip row (`build-plan-convert`, `--attempt=1`, comment `Status=skipped (plan already in task-block form)`) and goes to Step 5. `bkit install` / `check` / `upgrade` list each `{FID}-plan.md` with no task markers whose FID has not shipped as advisory `plan-task-markers-missing`; nothing to do by hand, this step converts it. |
 | 5 — Plan Current | `@bkit-build-plan-current` _(skipped when the mechanical trigger clears)_ | Orchestrator trigger `bkit branches anchor-read --field=baseSha --against=origin/dev` reads the plan's `bkit:anchor` (§ Anchor Block) and exits 12 — skipping the judgement, no agent, no artifact, its own comment naming the skip — on any of: no plan, no anchor, `baseSha` unreachable in this clone, nothing landed on `origin/dev` since it. Else it prints `value` (= `BASE_SHA`) and the agent derives its own changed-path list from it, intersects that against the paths the plan's tasks depend on, and reads per-path diffs for the intersection only. `Executable` tasks are not findings; `Reword` / `Broken` are. Judges the PLAN against the codebase — the design doc is not an input, and `designPath` / `designBaseSha` have no consumer here. `CURRENT_VERDICT` is advisory on every value — PASS / CONCERNS / FAIL all → Step 6; CONCERNS / FAIL are recorded, comment-posted with `Affected`, and echoed as a console advisory, never blocking. Findings carry into Step 7 as a Read for `@bkit-build-plan-execute`; build never revises the plan, a re-run of `/bkit-plan` does. |
 | 6 — Skills | `@bkit-build-install-skills` _(skip if input contains `[skills=false]`)_ | If new skills installed → commit `chore({FID}): install skills bkit [skip ci]`. |
 | 7 — Execute Plan | `@bkit-build-plan-execute` | `bkit context brief --next` writes `build-brief-{GROUP}-{n}.md` — the group's open task blocks, the reds already recorded for them, the earlier tasks they depend on as context, and the plan's `Reuse Inventory` rows and `Architecture & Component Changes` entries naming the open tasks' `CREATE` / `UPDATE` / `DELETE` files (rows and entries past the 8 KB work cap are left out and counted; execute then reads the plan section) — and prints `group` (null → Step 10), `workBytes` and `workCap`. When the session prompt carries run instructions beyond naming the issue, the orchestrator writes them once to `{SESSION_DIR}/brief-note.md` and passes `--note-file`, so each brief ends with a `Deviations` section the agents apply to the tasks it names. A `build-group-start` row records the commit the group starts from, once per group. The orchestrator passes paths only; the agent reads the brief, not the plan and not `build-input-{RUN}.md`. Per group: `build-plan-execute-{GROUP}-log.md`. Attempt-numbered rows (`--attempt-of=build-plan-execute:next`), one log appended across attempts. Writes stub-first then incremental `DONE — TASK {N}` / `BLOCKED — TASK {N}` log entries via `Bash echo >>`; writes source. Per task naming `TEST FIRST` tests: tests + stubs first, then the red command from Context (`bkit tests red`, § Test-first) once per test before the task's code. Does not modify the plan — ticking is verify's job (per-task `Edit`-tick phase after impl is done is a known timeout vector; verify absorbs recovery). `bkit tasks open --plan= --group= --log=` names each task the plan leaves open and prints `handover`; verdict `HANDOVER` (turn cap near) or `handover` = true (a task with neither a `DONE` nor a `BLOCKED` line — the agent hit its turn cap) → Step 7 re-runs once for that group as a handover, not a failed attempt, its brief leaving out the `DONE` tasks; the tracker comment shows `HANDOVER`; after that the verify→remediate loop (Step 8 → Step 9, bounded by `build.verify.maxAttempts`) absorbs the recovery. Else → Step 8. |
diff --git a/.bkit/core/engine/audits/workflows/workflow-shape.test.ts b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
index 7a11c4204..fd6a06052 100644
--- a/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
+++ b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
@@ -6,6 +6,7 @@ import * as path from "node:path";
 
 import { describe, expect, it } from "vitest";
 
+import { callWords, stepSections } from "../../checks/status-holes";
 import { COMMANDS } from "../../commands/registry";
 import { WORKFLOW_STEPS } from "../../commands/workflow/step-table";
 import { substituteWorkflow } from "../../render/trackers";
@@ -61,28 +62,6 @@ function unclosedTrackerMarker(text: string): string | undefined {
   return lastOpen === -1 || closes ? undefined : tail.split("\n")[0];
 }
 
-/** The words of one `"{BKIT}" ...` call: shell-split, quotes kept, stopped at the first unquoted operator. */
-function callWords(rest: string): string[] {
-  const words: string[] = [];
-  let word = "";
-  let quote = "";
-  for (const ch of rest) {
-    if (quote) {
-      word += ch;
-      if (ch === quote) quote = "";
-    } else if (ch === '"' || ch === "'") {
-      word += ch;
-      quote = ch;
-    } else if ("|;&><)`".includes(ch)) break;
-    else if (/\s/.test(ch)) {
-      if (word) words.push(word);
-      word = "";
-    } else word += ch;
-  }
-  if (word) words.push(word);
-  return words;
-}
-
 /** Each `"{BKIT}" noun verb --flag` call in `text` whose verb or flag the CLI lacks. */
 function unknownCalls(text: string): string[] {
   const specs = new Map(COMMANDS.map((c) => [c.noun, c]));
@@ -601,12 +580,12 @@ describe("build", () => {
   it("Plan Convert leaves a valid plan with no newer comments alone", () => {
     const step4 = section(build, /Step 4 — Plan Convert/);
     const skip =
-      "**If** exit 0 **and** (`NEWER_COMMENTS` = 0 **or** `CONVERTED` is held) → Step 5.";
+      "**If** exit 0, `CONVERTED` is not held **and** `NEWER_COMMENTS` = 0 → sub-step 4.";
     expect(step4).toContain(skip);
-    // That route leaves the step at once: no dispatch, no row and no comment.
+    // That route skips the dispatch and writes the no-agent skip row (sub-step 4).
     expect(step4.indexOf(skip)).toBeLessThan(step4.indexOf("Invoke `@bkit-build-plan-convert`"));
-    expect(commandLines(step4, "steps finish")).toHaveLength(1);
-    expect(step4.indexOf("--step=build-plan-convert")).toBeGreaterThan(
+    expect(commandLines(step4, "steps finish")).toHaveLength(2);
+    expect(step4.indexOf("--attempt-of=build-plan-convert:next")).toBeGreaterThan(
       step4.indexOf("Invoke `@bkit-build-plan-convert`"),
     );
   });
@@ -626,9 +605,11 @@ describe("build", () => {
     const finish = commandLines(section(build, /Step 4 — Plan Convert/), "steps finish").filter(
       (l) => l.includes("--step=build-plan-convert"),
     );
-    expect(finish).toHaveLength(1);
-    expect(finish[0]).toContain("--number=4");
-    expect(finish[0]).toContain('--post --title="Plan Convert"');
+    expect(finish).toHaveLength(2);
+    for (const line of finish) {
+      expect(line).toContain("--number=4");
+      expect(line).toContain('--post --title="Plan Convert"');
+    }
     expect(section(build, /Step 3 — Branch Sync/)).not.toContain("--step=build-plan-convert");
   });
 
@@ -636,9 +617,9 @@ describe("build", () => {
     // A plan-less run routes to the convert before the check writes its log, so the log
     // can be absent when the finish runs; a required artifact would exit 7 there and the
     // Plan Convert comment would never post. Optional records it whenever it exists.
-    const finish = commandLines(section(build, /Step 4 — Plan Convert/), "steps finish").filter(
-      (l) => l.includes("--step=build-plan-convert"),
-    );
+    const finish = commandLines(section(build, /Step 4 — Plan Convert/), "steps finish")
+      .filter((l) => l.includes("--step=build-plan-convert"))
+      .filter((l) => l.includes("--attempt-of="));
     expect(finish).toHaveLength(1);
     expect(finish[0]).toContain(
       "--optional-artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md",
@@ -679,8 +660,9 @@ describe("build", () => {
     );
     const step4 = section(build, /Step 4 — Plan Convert/);
     expect(step4).toContain(
-      "**If** exit 0 **and** (`NEWER_COMMENTS` = 0 **or** `CONVERTED` is held) → Step 5.",
+      "**If** exit 0, `CONVERTED` is not held **and** `NEWER_COMMENTS` = 0 → sub-step 4.",
     );
+    expect(step4).toContain("**If** exit 0 **and** `CONVERTED` is held → Step 5.");
     expect(step4).toMatch(
       /`CONVERTED` is not held \*\*and\*\* \(exit 0 with `NEWER_COMMENTS` > 0,/,
     );
@@ -811,24 +793,6 @@ describe("live docs", () => {
 });
 
 describe("resume", () => {
-  /** Each `Step N — Title` heading, with the text up to the next step or section heading. */
-  function stepSections(text: string): Array<{ number: number; title: string; body: string }> {
-    const lines = text.split("\n");
-    const heading = /^#{2,3} \S+ Step (\d+) — (.+)$/;
-    const out: Array<{ number: number; title: string; body: string }> = [];
-    lines.forEach((l, i) => {
-      const m = heading.exec(l);
-      if (!m) return;
-      const end = lines.findIndex((x, j) => j > i && /^#{2,3} /.test(x) && !x.startsWith("### 🔒"));
-      out.push({
-        number: Number(m[1]),
-        title: m[2]!,
-        body: lines.slice(i, end === -1 ? undefined : end).join("\n"),
-      });
-    });
-    return out;
-  }
-
   it.each(PHASES)("%s: the Resume line calls `status resume`", (name) => {
     const line = workflow(name)
       .split("\n")
@@ -853,6 +817,38 @@ describe("resume", () => {
   );
 });
 
+describe("plan convert skip row", () => {
+  it("writes a build-plan-convert row on the no-conversion route", () => {
+    const step4 = stepSections(workflow("build")).find((s) => s.number === 4)!;
+    const skip = commandLines(step4.body, "steps finish").filter((l) =>
+      l.includes("--step=build-plan-convert"),
+    );
+    expect(skip).toHaveLength(2);
+    const skipRow = skip.find((l) => l.includes("--attempt=1"))!;
+    expect(skipRow).toContain("--number=4");
+    expect(skipRow).toContain("skipped");
+    expect(skipRow).not.toContain("--attempt-of=");
+    expect(skip.filter((l) => l.includes("--attempt-of=build-plan-convert:next"))).toHaveLength(1);
+    // The pass route with nothing to convert reaches the skip row, not Step 5.
+    expect(step4.body).toMatch(
+      /exit 0, `CONVERTED` is not held \*\*and\*\* `NEWER_COMMENTS` = 0 → sub-step 4/,
+    );
+    expect(step4.body).toMatch(/exit 0 \*\*and\*\* `CONVERTED` is held → Step 5/);
+  });
+});
+
+describe("promoted parsers", () => {
+  it("holds the workflows to the step table", () => {
+    const own = fs.readFileSync(__filename, "utf-8");
+    expect(own).not.toMatch(/^\s*function (stepSections|callWords)\(/m);
+    for (const name of PHASES)
+      expect(
+        stepSections(workflow(name)).map((s) => s.number),
+        name,
+      ).toEqual([...new Set(WORKFLOW_STEPS[name].map((s) => s.number))]);
+  });
+});
+
 describe("debug", () => {
   it("records the PR URL in artifacts, not a prUrl field", () => {
     const debug = workflow("debug");
diff --git a/.bkit/core/engine/checks/status-holes.test.ts b/.bkit/core/engine/checks/status-holes.test.ts
index f04bc348e..4524e241f 100644
--- a/.bkit/core/engine/checks/status-holes.test.ts
+++ b/.bkit/core/engine/checks/status-holes.test.ts
@@ -19,22 +19,31 @@ import * as os from "node:os";
 import * as path from "node:path";
 import { describe, expect, it } from "vitest";
 
+import { WORKFLOW_STEPS } from "../commands/workflow/step-table";
 import {
   SHIP_STEP_ORDER,
+  auditRun,
   auditStatusJsonl,
-  checkSourceCanonicalDrift,
+  callWords,
   classifyRun,
   computeMandatoryForPath,
-  deriveExpectedStepSetFromSource,
+  deriveContract,
   detectHoles,
   formatAdvisoryReport,
   main,
+  stepSections,
 } from "./status-holes";
 
 // __dirname-anchored (G4) — resolves regardless of vitest's invocation cwd.
 const REPO_ROOT = path.resolve(__dirname, "../../../..");
 const SHIP_MD_PATH = path.join(REPO_ROOT, ".bkit/core/workflows/bkit-ship.md");
 const shipMd = fs.readFileSync(SHIP_MD_PATH, "utf-8");
+const FLOWS = ["design", "plan", "build", "debug", "ship"] as const;
+const flowMd = (name: string) =>
+  fs.readFileSync(path.join(REPO_ROOT, ".bkit/core/workflows", `bkit-${name}.md`), "utf-8");
+const tableKeys = (name: (typeof FLOWS)[number]) => [
+  ...new Set(WORKFLOW_STEPS[name].flatMap((s) => (s.step ? [s.step] : []))),
+];
 
 // ---------------------------------------------------------------------------
 // Helpers — build synthetic status.jsonl fixtures
@@ -137,70 +146,89 @@ function retryLoopPathBStatus(): string {
 // ---------------------------------------------------------------------------
 
 describe("source derivation", () => {
-  it("derives the expected step set from bkit-ship.md headings + literals", () => {
-    const { steps, headingSteps, literalSteps } = deriveExpectedStepSetFromSource(shipMd);
-    expect(steps.length).toBeGreaterThan(0);
-    expect(headingSteps.length).toBeGreaterThan(0);
-    expect(literalSteps.length).toBeGreaterThan(0);
-  });
-
-  it("source-derived set AGREES with the frozen canonical set (no drift)", () => {
-    const { steps } = deriveExpectedStepSetFromSource(shipMd);
-    const drift = checkSourceCanonicalDrift(steps);
-    expect(drift).toEqual([]);
+  it("derives the expected step universe for every workflow", () => {
+    for (const name of FLOWS) {
+      const contract = deriveContract(flowMd(name), name);
+      expect([...contract.universe].sort(), name).toEqual([...tableKeys(name)].sort());
+      expect(contract.drift, name).toEqual([]);
+    }
+    expect(deriveContract(flowMd("ship"), "ship").orphanSteps).toEqual([]);
+    expect([...SHIP_STEP_ORDER]).toEqual(tableKeys("ship"));
   });
 
-  it("detects drift when a canonical key is missing from source", () => {
-    const fakeSource = ["ship-start-workflow", "ship-worktree-setup", "ship-invented-step"];
-    const drift = checkSourceCanonicalDrift(fakeSource);
-    // Should report every canonical key missing + the invented key
-    expect(drift.length).toBeGreaterThan(0);
-    expect(drift).toContain("source-but-not-canonical:ship-invented-step");
-    expect(drift.some((d) => d.startsWith("canonical-but-not-source:"))).toBe(true);
+  it("reports table drift without failing", () => {
+    const md = ["## 🧠 Step 1 — Start Workflow", '"{BKIT}" steps done --step=ship-invented'].join(
+      "\n",
+    );
+    const contract = deriveContract(md, "ship");
+    expect(contract.drift).toContain("source-but-not-table:ship-invented");
+    expect(contract.drift).toContain("table-but-not-source:ship-merge-pr");
   });
 
-  it("parses a synthetic md with headings + literals", () => {
-    const fakeMd = [
-      "## Step 1 — Start",
+  it("records every BKIT literal in a step as a required call", () => {
+    const md = [
+      "## Opening",
+      '"{BKIT}" runs context --workflow=x',
+      "## 🧠 Step 1 — Start",
       "```bash",
-      '  step:"ship-start-workflow"',
-      "```",
-      "## Step 2 — Setup",
-      "```bash",
-      '  step:"ship-worktree-setup"',
+      '"{BKIT}" steps finish --workflow=build --step=build-start-workflow --file="{STATUS}" --number=1 | tee x',
+      '"{BKIT}" status route --step=a \\',
+      "  --require=strategy",
       "```",
+      "### 🔒 Gate 1",
+      '"{BKIT}" prs probe',
+      "## 🧠 Step 2 — Next",
+      '"{BKIT}" branches push --remote=origin',
     ].join("\n");
-    const { steps, headingSteps, literalSteps } = deriveExpectedStepSetFromSource(fakeMd);
-    expect(steps).toContain("ship-start-workflow");
-    expect(steps).toContain("ship-worktree-setup");
-    expect(headingSteps).toEqual(["ship-start-workflow", "ship-worktree-setup"]);
-    expect(literalSteps).toEqual(["ship-start-workflow", "ship-worktree-setup"]);
+    const contract = deriveContract(md, "build");
+    expect(contract.steps.map((s) => s.number)).toEqual([1, 2]);
+    expect(contract.steps[0]!.calls).toEqual([
+      { noun: "steps", verb: "finish", flags: ["workflow", "step", "file", "number"] },
+      { noun: "status", verb: "route", flags: ["step", "require"] },
+      { noun: "prs", verb: "probe", flags: [] },
+    ]);
+    expect(contract.steps[1]!.calls).toEqual([
+      { noun: "branches", verb: "push", flags: ["remote"] },
+    ]);
+    expect(contract.workflowCalls).toEqual([
+      { noun: "runs", verb: "context", flags: ["workflow"] },
+    ]);
   });
 
-  it("parses `bkit steps done --step=` calls, the shape the workflows write rows with", () => {
+  it("derives a required call from each {BKIT} literal of every live step section", () => {
+    for (const name of FLOWS) {
+      const md = flowMd(name);
+      const contract = deriveContract(md, name);
+      const inSteps = stepSections(md).reduce((n, s) => n + s.body.split('"{BKIT}"').length - 1, 0);
+      expect(
+        contract.steps.reduce((n, s) => n + s.calls.length, 0),
+        name,
+      ).toBe(inSteps);
+      expect(inSteps, name).toBeGreaterThan(0);
+    }
+    expect(callWords('steps finish --a="x y" | tee')).toEqual(["steps", "finish", '--a="x y"']);
+  });
+
+  it("parses a synthetic md with headings + literals", () => {
     const fakeMd = [
-      "## Step 1 — Start",
+      "## 🧠 Step 1 — Start",
       "```bash",
-      '   "$BKIT" steps done --workflow=ship --step=ship-start-workflow --file="$STATUS" --commit=none',
+      '  step:"ship-start-workflow"',
       "```",
-      "## Step 2 — Setup",
+      "## 🧠 Step 2 — Setup",
       "```bash",
-      '   "$BKIT" steps done --workflow=ship --step=ship-worktree-setup --file="$STATUS"',
+      '  step:"ship-worktree-setup"',
       "```",
     ].join("\n");
-    const { headingSteps, literalSteps } = deriveExpectedStepSetFromSource(fakeMd);
-    expect(headingSteps).toEqual(["ship-start-workflow", "ship-worktree-setup"]);
-    expect(literalSteps).toEqual(["ship-start-workflow", "ship-worktree-setup"]);
+    expect(deriveContract(fakeMd, "ship").universe).toEqual([
+      "ship-start-workflow",
+      "ship-worktree-setup",
+    ]);
   });
 
   it("flags a status write that lives outside any numbered step (orphanSteps)", () => {
-    // headingSteps is a SUBSET of literalSteps by construction (both scan the
-    // same regex; the heading pass only narrows the line range), so comparing
-    // them for mutual disagreement is a tautology. The one direction that
-    // carries signal is a literal recorded outside every `## … Step N` section:
-    // a step the workflow writes but never numbers, so no gate covers it.
     const fakeMd = [
-      "## Step 1 — Start",
+      "## 🧠 Step 1 — Start",
       "```bash",
       '  step:"ship-start-workflow"',
       "```",
@@ -209,15 +237,9 @@ describe("source derivation", () => {
       '  step:"ship-orphaned-write"',
       "```",
     ].join("\n");
-    const { headingSteps, literalSteps, orphanSteps } = deriveExpectedStepSetFromSource(fakeMd);
-    expect(headingSteps).toEqual(["ship-start-workflow"]);
-    expect(literalSteps).toEqual(["ship-orphaned-write", "ship-start-workflow"]);
-    expect(orphanSteps).toEqual(["ship-orphaned-write"]);
-  });
-
-  it("the live bkit-ship.md records no step outside a numbered section", () => {
-    const { orphanSteps } = deriveExpectedStepSetFromSource(shipMd);
-    expect(orphanSteps).toEqual([]);
+    const contract = deriveContract(fakeMd, "ship");
+    expect(contract.universe).toEqual(["ship-start-workflow"]);
+    expect(contract.orphanSteps).toEqual(["ship-orphaned-write"]);
   });
 });
 
@@ -698,3 +720,131 @@ describe("CLI main() — advisory exit 0", () => {
     expect(captured).toContain("skipping");
   });
 });
+
+describe("step conditionality", () => {
+  // Step numbers whose section carries a column-0 marker (or a `(Path X only)` heading).
+  const CONDITIONAL_STEPS = {
+    design: [7, 11, 12],
+    plan: [8],
+    build: [6, 9, 13, 14, 15, 16],
+    debug: [4, 5, 6, 7, 8, 9, 10, 11],
+    ship: [4, 11, 12, 13],
+  } as const;
+
+  it("classifies a step conditional only under the column-0 marker rule", () => {
+    for (const name of FLOWS) {
+      const contract = deriveContract(flowMd(name), name);
+      expect(
+        contract.steps.filter((s) => s.conditional).map((s) => s.number),
+        name,
+      ).toEqual([...CONDITIONAL_STEPS[name]]);
+    }
+    const md = [
+      "## 🧠 Step 1 — Plain",
+      "   **Skip if** `ISSUE_ID` empty. Indented sub-step marker.",
+      "## 🧠 Step 2 — Column zero",
+      "text",
+      "**Skip if** `X` empty.",
+      "## 🧠 Step 3 — Heading marker (Path B only)",
+      "text",
+      "## 🧠 Step 4 — Run",
+      "**Run only if** `Y`.",
+      "## Failure Path",
+      "**Run only if** `Z`.",
+      "## 🧠 Step 5 — Last",
+    ].join("\n");
+    expect(deriveContract(md, "ship").steps.map((s) => [s.number, s.conditional])).toEqual([
+      [1, false],
+      [2, true],
+      [3, true],
+      [4, true],
+      [5, false],
+    ]);
+    // A marker added in a non-step section changes no verdict.
+    const base = deriveContract(md.replace("**Run only if** `Z`.", "text"), "ship");
+    expect(deriveContract(md, "ship").steps).toEqual(base.steps);
+  });
+
+  it("does not report a conditional step as a step hole", () => {
+    const md = [
+      "## 🧠 Step 1 — Start",
+      '"{BKIT}" steps done --step=build-start-workflow',
+      "## 🧠 Step 2 — Maybe",
+      "**Skip if** `X`.",
+      '"{BKIT}" steps done --step=build-maybe',
+      "## 🧠 Step 3 — Always",
+      '"{BKIT}" steps done --step=build-always',
+      "## 🧠 Step 4 — Close",
+      '"{BKIT}" steps done --step=build-close-workflow',
+    ].join("\n");
+    const rows = ["build-start-workflow", "build-close-workflow"].map((step) => ({
+      type: "step-done",
+      workflow: "build",
+      step,
+    }));
+    const report = auditRun(rows, "build", md);
+    expect(report.missing).toEqual(["build-always"]);
+  });
+});
+
+describe("CLI sweep summary", () => {
+  const capture = (args: string[]): string => {
+    const originalWrite = process.stdout.write.bind(process.stdout);
+    let captured = "";
+    process.stdout.write = ((chunk: unknown) => {
+      captured += String(chunk);
+      return true;
+    }) as typeof process.stdout.write;
+    try {
+      main(["node", "checks/status-holes.ts", ...args]);
+    } finally {
+      process.stdout.write = originalWrite;
+    }
+    return captured;
+  };
+  const flowRow = (workflow: string, step: string) =>
+    JSON.stringify({
+      type: "step-done",
+      workflow,
+      step,
+      status: "DONE",
+      at: "2026-07-29T00:00:00Z",
+    });
+
+  it("prints a sweep summary line and exits 0", () => {
+    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-shd-sweep-"));
+    try {
+      const write = (name: string, body: string) => {
+        const p = path.join(dir, name);
+        fs.writeFileSync(p, body, "utf-8");
+        return p;
+      };
+      const holeyShip = write(
+        "a.jsonl",
+        [row("ship-start-workflow"), row("ship-worktree-setup"), row("ship-close-workflow")].join(
+          "\n",
+        ),
+      );
+      // One file, two holey runs of two other workflows.
+      const mixed = write(
+        "b.jsonl",
+        [
+          flowRow("debug", "debug-start-workflow"),
+          flowRow("debug", "debug-close-workflow"),
+          flowRow("plan", "plan-start-workflow"),
+          flowRow("plan", "plan-close-workflow"),
+        ].join("\n"),
+      );
+      const junk = write("c.jsonl", "not json\n");
+      const clean = write("d.jsonl", pathAStatus());
+      const out = capture([holeyShip, mixed, junk, clean]);
+      expect(out).toContain("[bkit-status-holes] sweep: 4 file(s), 3 holey\n");
+      expect(out.match(/\[bkit-status-holes\] sweep:/g)).toHaveLength(1);
+      expect(out).toContain(`${junk}: no workflow rows`);
+      expect(out).toContain("debug");
+      expect(out).toContain("plan");
+    } finally {
+      fs.rmSync(dir, { recursive: true, force: true });
+    }
+  });
+});
diff --git a/.bkit/core/engine/checks/status-holes.ts b/.bkit/core/engine/checks/status-holes.ts
index 2df3c1389..86addfd2a 100644
--- a/.bkit/core/engine/checks/status-holes.ts
+++ b/.bkit/core/engine/checks/status-holes.ts
@@ -1,10 +1,10 @@
 // checks/status-holes.ts — Tier-3 advisory status-hole detector.
 //
-// A fail-open advisory that compares the set of ship steps RECORDED in a
-// status.jsonl against the set of steps the workflow PROSE says should be
-// there. It derives its expected set from .bkit/core/workflows/bkit-ship.md at
-// runtime (headings + step:"ship-*" literals) — NEVER a hand-maintained table
-// (decision 384-tier3-promotion).
+// A fail-open advisory that compares the steps RECORDED in each run of a
+// status.jsonl against the steps the workflow PROSE says should be there. It
+// derives the expected set from .bkit/core/workflows/bkit-{workflow}.md at
+// runtime (headings + --step= literals) — NEVER a hand-maintained table
+// (decision 384-tier3-promotion). Each run's workflow is inferred from its rows.
 //
 // ADVISORY / FAIL-OPEN: the CLI exits 0 unconditionally — even when holes are
 // found (decision 384-tier3-promotion).
@@ -20,13 +20,14 @@
 //     appear only in the merge-retry loop.
 //
 // Usage (advisory CI step or manual):
-//   npx tsx .bkit/core/engine/checks/status-holes.ts <status.jsonl> [--ship-md <path>]
+//   npx tsx .bkit/core/engine/checks/status-holes.ts <status.jsonl>...
 //   # exits 0 always; prints advisory report to stdout
 
 import * as fs from "node:fs";
 import * as path from "node:path";
 import { fileURLToPath } from "node:url";
 
+import { WORKFLOW_STEPS } from "../commands/workflow/step-table.js";
 import { parseJson } from "../shared/json.js";
 import { getWorkflowsRoot } from "../shared/package-roots.js";
 
@@ -86,7 +87,8 @@ const MERGED_ON_ENTRY_SKIP = new Set<string>([
 // Types
 // ---------------------------------------------------------------------------
 
-export type RunPath = "PATH_A" | "PATH_B" | "MERGED_ON_ENTRY" | "ABORTED" | "IN_PROGRESS";
+export type RunPath =
+  "PATH_A" | "PATH_B" | "MERGED_ON_ENTRY" | "COMPLETED" | "ABORTED" | "IN_PROGRESS";
 
 export interface StatusRow {
   type: string;
@@ -98,6 +100,8 @@ export interface StatusRow {
 }
 
 export interface HoleReport {
+  /** The workflow the run belongs to. */
+  workflow?: string;
   /** Steps the prose says should be present but were not recorded. */
   missing: string[];
   /** Steps recorded but NOT in the source-derived universe (invented names). */
@@ -115,88 +119,151 @@ export interface HoleReport {
 }
 
 // ---------------------------------------------------------------------------
-// Source derivation — parse bkit-ship.md to find the expected step universe.
+// Contract derivation — parse the workflow markdown into steps + required calls.
 // ---------------------------------------------------------------------------
 
-/**
- * Derive the universe of ship step keys from the workflow markdown.
- *
- * Strategy:
- * 1. Extract every `step:"ship-..."` literal from fenced code blocks.
- * 2. Extract every `## … Step N — Name` heading and map the heading's section
- *    to the step key(s) found within it.
- * 3. Return the union of all unique step keys.
- *
- * The two passes scan the SAME `step:"ship-*"` regex and the heading pass only
- * narrows the line range, so `headingSteps` is always a subset of `literalSteps`.
- * The detector reports `orphanSteps`: a status write that appears in the file but NOT
- * inside any `## … Step N` section.
- */
-export function deriveExpectedStepSetFromSource(shipMd: string): {
-  steps: string[];
-  headingSteps: string[];
-  literalSteps: string[];
+/** One `"{BKIT}" noun verb --flag` call the markdown names, reduced to words (flag values dropped). */
+export interface RequiredCall {
+  noun: string;
+  verb: string;
+  flags: string[];
+}
+
+export interface ContractStep {
+  number: number;
+  title: string;
+  /** The `--step=` / `step:"` row keys the section writes. */
+  keys: string[];
+  /** Every `"{BKIT}"` call in the section, in order. */
+  calls: RequiredCall[];
+  /** True under a column-0 `**Run only if**` / `**Skip if**` line, or a `(Path X only)` heading. */
+  conditional: boolean;
+}
+
+export interface Contract {
+  workflow: string;
+  steps: ContractStep[];
+  /** Deduped row keys across the step sections, sorted. */
+  universe: string[];
+  /** Calls in sections no step owns (opening lines, Failure Path, Decision Pause ...). */
+  workflowCalls: RequiredCall[];
+  /** Row keys written outside every numbered step section. */
   orphanSteps: string[];
-} {
-  const lines = shipMd.split("\n");
-
-  // 1. Collect every `step:"ship-..."` / `--step=ship-...` literal (anywhere — fenced or prose).
-  const literalSet = new Set<string>();
-  const literalRe = /(?:step:"|--step=)(ship-[a-z-]+)/g;
-  for (const line of lines) {
-    let m: RegExpExecArray | null;
-    while ((m = literalRe.exec(line)) !== null) {
-      literalSet.add(m[1]);
-    }
-    literalRe.lastIndex = 0; // reset per-line
-  }
+  /** Disagreements with the deduped `WORKFLOW_STEPS[workflow]` keys; reported, never fatal. */
+  drift: string[];
+}
 
-  // 2. Collect heading-derived steps. A `## … Step N` heading opens a section;
-  //    the step key(s) within that section's body (until the next `## ` heading)
-  //    belong to that step.
-  const headingSet = new Set<string>();
-  let inStep = false;
-  for (const line of lines) {
-    if (/^##\s+.*Step\s+\d+/i.test(line)) {
-      inStep = true;
-      continue;
-    }
-    if (/^##\s+/m.test(line) && !/Step\s+\d+/i.test(line)) {
-      inStep = false;
-      continue;
-    }
-    if (inStep) {
-      let m: RegExpExecArray | null;
-      const re = /(?:step:"|--step=)(ship-[a-z-]+)/g;
-      while ((m = re.exec(line)) !== null) {
-        headingSet.add(m[1]);
-      }
-      re.lastIndex = 0;
-    }
+// A key followed by `{` is a templated log label (`build-group-gate-{GROUP}`), not a row key.
+const STEP_KEY_RE = /(?:step:"|--step=)([a-z][a-z0-9-]*)(\{)?/g;
+
+/** The words of one `"{BKIT}" ...` call: shell-split, quotes kept, stopped at the first unquoted operator. */
+export function callWords(rest: string): string[] {
+  const words: string[] = [];
+  let word = "";
+  let quote = "";
+  for (const ch of rest) {
+    if (quote) {
+      word += ch;
+      if (ch === quote) quote = "";
+    } else if (ch === '"' || ch === "'") {
+      word += ch;
+      quote = ch;
+    } else if ("|;&><)`".includes(ch)) break;
+    else if (/\s/.test(ch)) {
+      if (word) words.push(word);
+      word = "";
+    } else word += ch;
   }
+  if (word) words.push(word);
+  return words;
+}
 
-  // 3. Union + the one asymmetry that carries signal (see the docstring).
-  const all = new Set<string>([...literalSet, ...headingSet]);
-  const orphanSteps = [...literalSet].filter((s) => !headingSet.has(s)).sort();
-  return {
-    steps: [...all].sort(),
-    headingSteps: [...headingSet].sort(),
-    literalSteps: [...literalSet].sort(),
-    orphanSteps,
-  };
+/** Each `Step N — Title` heading, with the text up to the next step or section heading. */
+export function stepSections(text: string): Array<{ number: number; title: string; body: string }> {
+  const lines = text.split("\n");
+  const heading = /^#{2,3} \S+ Step (\d+) — (.+)$/;
+  const out: Array<{ number: number; title: string; body: string }> = [];
+  lines.forEach((l, i) => {
+    const m = heading.exec(l);
+    if (!m) return;
+    const end = lines.findIndex((x, j) => j > i && /^#{2,3} /.test(x) && !x.startsWith("### 🔒"));
+    out.push({
+      number: Number(m[1]),
+      title: m[2]!,
+      body: lines.slice(i, end === -1 ? undefined : end).join("\n"),
+    });
+  });
+  return out;
+}
+
+/** Each `"{BKIT}"` call in `text` as noun / verb / flag names. */
+function requiredCalls(text: string): RequiredCall[] {
+  const joined = text.replace(/\\\n\s*/g, " ");
+  return joined
+    .split('"{BKIT}"')
+    .slice(1)
+    .map((call) => {
+      const [noun = "", verb = "", ...rest] = callWords(call.replace(/^ /, ""));
+      const flags = rest.flatMap((w) => {
+        const f = /^--([a-z][a-z0-9-]*)/.exec(w)?.[1];
+        return f ? [f] : [];
+      });
+      return { noun, verb: verb.startsWith("--") ? "" : verb, flags };
+    });
+}
+
+const stepKeys = (text: string): string[] => [
+  ...new Set([...text.matchAll(STEP_KEY_RE)].filter((m) => !m[2]).map((m) => m[1]!)),
+];
+
+/** A step is conditional under a column-0 marker line anywhere in its section, or a `(Path X only)` heading. */
+export function isConditionalSection(body: string): boolean {
+  const lines = body.split("\n");
+  return (
+    /\(Path [A-Z] only\)/.test(lines[0] ?? "") ||
+    lines.some((l) => /^\*\*(Run only if|Skip if)\*\*/.test(l))
+  );
 }
 
 /**
- * Cross-check the source-derived set against the frozen canonical set.
- * Returns the keys that disagree (present in one but not the other).
+ * Derive the contract of one workflow from its markdown: the step sections, the
+ * row keys and `"{BKIT}"` calls each holds, and the calls no step owns. The
+ * universe is cross-checked against the deduped `WORKFLOW_STEPS[workflow]`; a
+ * disagreement is reported as drift, never thrown.
  */
-export function checkSourceCanonicalDrift(sourceSteps: string[]): string[] {
-  const sourceSet = new Set(sourceSteps);
-  const canonicalSet = new Set<string>(SHIP_STEP_ORDER);
+export function deriveContract(workflowMd: string, workflow: string): Contract {
+  const sections = stepSections(workflowMd);
+  const steps: ContractStep[] = sections.map((s) => ({
+    number: s.number,
+    title: s.title,
+    keys: stepKeys(s.body),
+    calls: requiredCalls(s.body),
+    conditional: isConditionalSection(s.body),
+  }));
+  const universe = [...new Set(steps.flatMap((s) => s.keys))].sort();
+
+  // Text outside every step section: the md minus each section body.
+  let outside = workflowMd;
+  for (const s of sections) outside = outside.replace(s.body, "");
+  const table = (WORKFLOW_STEPS as Record<string, readonly { step?: string }[] | undefined>)[
+    workflow
+  ];
+  const tableKeys = new Set((table ?? []).flatMap((s) => (s.step ? [s.step] : [])));
   const drift: string[] = [];
-  for (const k of canonicalSet) if (!sourceSet.has(k)) drift.push(`canonical-but-not-source:${k}`);
-  for (const k of sourceSet) if (!canonicalSet.has(k)) drift.push(`source-but-not-canonical:${k}`);
-  return drift;
+  if (table) {
+    for (const k of tableKeys) if (!universe.includes(k)) drift.push(`table-but-not-source:${k}`);
+    for (const k of universe) if (!tableKeys.has(k)) drift.push(`source-but-not-table:${k}`);
+  }
+  return {
+    workflow,
+    steps,
+    universe,
+    workflowCalls: requiredCalls(outside),
+    orphanSteps: stepKeys(outside)
+      .filter((k) => k.startsWith(`${workflow}-`) && !universe.includes(k))
+      .sort(),
+    drift,
+  };
 }
 
 // ---------------------------------------------------------------------------
@@ -265,6 +332,10 @@ export function computeMandatoryForPath(path: RunPath, sourceUniverse: string[])
         [...universe].filter((s) => !MERGED_ON_ENTRY_SKIP.has(s) && !RETRY_LOOP_STEPS.has(s)),
       );
 
+    case "COMPLETED":
+      // Non-ship runs derive their mandatory set from the contract (auditRun)
+      return new Set(universe);
+
     case "ABORTED":
       // No mandatory steps — the run terminated; post-abort absences are expected
       return new Set();
@@ -331,15 +402,10 @@ export function detectHoles(
 }
 
 // ---------------------------------------------------------------------------
-// Full audit — parse status.jsonl + ship md, classify, detect, report
+// Full audit — parse status.jsonl + workflow md, classify, detect, report
 // ---------------------------------------------------------------------------
 
-export function auditStatusJsonl(statusJsonl: string, shipMd: string): HoleReport {
-  // Derive expected set from source
-  const { steps: sourceUniverse, orphanSteps } = deriveExpectedStepSetFromSource(shipMd);
-  const sourceCanonicalDrift = checkSourceCanonicalDrift(sourceUniverse);
-
-  // Parse status rows
+function parseRows(statusJsonl: string): StatusRow[] {
   const rows: StatusRow[] = [];
   for (const line of statusJsonl.split("\n")) {
     const trimmed = line.trim();
@@ -348,37 +414,82 @@ export function auditStatusJsonl(statusJsonl: string, shipMd: string): HoleRepor
     const row = parseJson(trimmed);
     if (row.ok) rows.push(row.value as StatusRow);
   }
+  return rows;
+}
 
-  // Filter to ship step-done rows + workflow-failed rows
-  const shipStepRows = rows.filter(
-    (r) => r.type === "step-done" && r.workflow === "ship" && typeof r.step === "string",
+/** Audit one run's rows against the contract derived from its workflow markdown. */
+export function auditRun(rows: StatusRow[], workflow: string, workflowMd: string): HoleReport {
+  const contract = deriveContract(workflowMd, workflow);
+  const stepRows = rows.filter(
+    (r) => r.type === "step-done" && r.workflow === workflow && typeof r.step === "string",
   );
-  const hasWorkflowFailed = rows.some((r) => r.type === "workflow-failed" && r.workflow === "ship");
-  const hasMergedOnEntryMarker = rows.some(
-    (r) => r.type === "ship-merged-on-entry" && r.workflow === "ship",
+  const hasWorkflowFailed = rows.some(
+    (r) => r.type === "workflow-failed" && r.workflow === workflow,
   );
-
-  // Collect observed steps
   const observed = new Set<string>();
-  for (const r of shipStepRows) {
-    if (r.step) observed.add(r.step);
+  for (const r of stepRows) if (r.step) observed.add(r.step);
+  const sorted = [...observed].sort();
+
+  if (workflow === "ship") {
+    const hasMergedOnEntryMarker = rows.some(
+      (r) => r.type === "ship-merged-on-entry" && r.workflow === "ship",
+    );
+    const runPath = classifyRun(observed, hasWorkflowFailed, hasMergedOnEntryMarker);
+    const { missing, unexpected } = detectHoles(observed, contract.universe, runPath);
+    return {
+      workflow,
+      missing,
+      unexpected,
+      path: runPath,
+      observed: sorted,
+      sourceUniverse: contract.universe,
+      sourceCanonicalDrift: contract.drift,
+      orphanSteps: contract.orphanSteps,
+    };
   }
 
-  // Classify + detect
-  const runPath = classifyRun(observed, hasWorkflowFailed, hasMergedOnEntryMarker);
-  const { missing, unexpected } = detectHoles(observed, sourceUniverse, runPath);
-
+  const closeKey = `${workflow}-close-workflow`;
+  const runPath: RunPath = observed.has(closeKey)
+    ? "COMPLETED"
+    : hasWorkflowFailed
+      ? "ABORTED"
+      : "IN_PROGRESS";
+  const missing =
+    runPath === "COMPLETED"
+      ? contract.steps
+          .filter(
+            (s) => s.keys.length > 0 && !s.conditional && !s.keys.some((k) => observed.has(k)),
+          )
+          .map((s) => s.keys[0]!)
+          .sort()
+      : [];
   return {
+    workflow,
     missing,
-    unexpected,
+    unexpected: sorted.filter((k) => !contract.universe.includes(k)),
     path: runPath,
-    observed: [...observed].sort(),
-    sourceUniverse: [...sourceUniverse].sort(),
-    sourceCanonicalDrift,
-    orphanSteps,
+    observed: sorted,
+    sourceUniverse: contract.universe,
+    sourceCanonicalDrift: contract.drift,
+    // Decision Pause / abort rows sit outside the numbered steps by design
+    orphanSteps: [],
   };
 }
 
+/** Audit a status.jsonl as a ship run against `shipMd`. */
+export function auditStatusJsonl(statusJsonl: string, shipMd: string): HoleReport {
+  return auditRun(parseRows(statusJsonl), "ship", shipMd);
+}
+
+/** The workflows a status.jsonl holds runs of, inferred from its own rows. */
+export function inferWorkflows(rows: StatusRow[]): string[] {
+  const known = new Set<string>(Object.keys(WORKFLOW_STEPS));
+  const found = new Set<string>();
+  for (const r of rows)
+    if (typeof r.workflow === "string" && known.has(r.workflow)) found.add(r.workflow);
+  return [...found].sort();
+}
+
 // ---------------------------------------------------------------------------
 // Advisory report formatter
 // ---------------------------------------------------------------------------
@@ -386,6 +497,7 @@ export function auditStatusJsonl(statusJsonl: string, shipMd: string): HoleRepor
 export function formatAdvisoryReport(report: HoleReport): string {
   const lines: string[] = [];
   lines.push("[bkit-status-holes] ADVISORY — fail-open (exit 0 regardless)");
+  if (report.workflow) lines.push(`  workflow: ${report.workflow}`);
   lines.push(`  path: ${report.path}`);
   lines.push(`  observed: ${report.observed.length} step(s)`);
 
@@ -417,37 +529,30 @@ export function formatAdvisoryReport(report: HoleReport): string {
 // ---------------------------------------------------------------------------
 
 export function main(argv: string[]): void {
-  const args = argv.slice(2);
-
-  // Resolve the ship-md override FIRST so its VALUE is never mistaken for a
-  // positional. `args.find(a => !a.startsWith("--"))` alone picks up the value
-  // of `--ship-md` when the flag is passed before the status path.
-  const mdFlagIdx = args.indexOf("--ship-md");
-  const shipMdOverride = mdFlagIdx >= 0 ? args[mdFlagIdx + 1] : undefined;
-  const consumed = new Set<number>();
-  if (mdFlagIdx >= 0) {
-    consumed.add(mdFlagIdx);
-    if (shipMdOverride) consumed.add(mdFlagIdx + 1);
-  }
-
-  // Every remaining positional is a status.jsonl to audit — one report each, so
-  // a whole corpus can be swept in one advisory CI step.
-  const statusPaths = args.filter((a, i) => !consumed.has(i) && !a.startsWith("--"));
+  // Every positional is a status.jsonl to audit — one report per file, so a
+  // whole corpus can be swept in one advisory CI step.
+  const statusPaths = argv.slice(2).filter((a) => !a.startsWith("--"));
   if (statusPaths.length === 0) {
     process.stdout.write("[bkit-status-holes] no status.jsonl path given — skipping (advisory)\n");
     return; // exit 0
   }
 
-  const shipMdPath = shipMdOverride || path.join(getWorkflowsRoot(), "bkit-ship.md");
-
-  let shipMd = "";
-  try {
-    shipMd = fs.readFileSync(shipMdPath, "utf-8");
-  } catch {
-    process.stdout.write(`[bkit-status-holes] ${shipMdPath} not found — skipping (advisory)\n`);
-    return; // exit 0
-  }
+  const mdCache = new Map<string, string | null>();
+  const loadMd = (workflow: string): string | null => {
+    if (!mdCache.has(workflow)) {
+      try {
+        mdCache.set(
+          workflow,
+          fs.readFileSync(path.join(getWorkflowsRoot(), `bkit-${workflow}.md`), "utf-8"),
+        );
+      } catch {
+        mdCache.set(workflow, null);
+      }
+    }
+    return mdCache.get(workflow) ?? null;
+  };
 
+  let holeyRuns = 0;
   for (const statusPath of statusPaths) {
     // Read inputs (advisory — missing files = skip, never fail)
     let statusJsonl = "";
@@ -458,10 +563,31 @@ export function main(argv: string[]): void {
       continue; // exit 0
     }
 
-    const report = auditStatusJsonl(statusJsonl, shipMd);
+    const rows = parseRows(statusJsonl);
+    const workflows = inferWorkflows(rows);
     process.stdout.write(`\n${statusPath}\n`);
-    process.stdout.write(formatAdvisoryReport(report) + "\n");
+    if (workflows.length === 0) {
+      process.stdout.write(
+        `[bkit-status-holes] ${statusPath}: no workflow rows — skipping (advisory)\n`,
+      );
+      continue;
+    }
+    for (const workflow of workflows) {
+      const md = loadMd(workflow);
+      if (md === null) {
+        process.stdout.write(
+          `[bkit-status-holes] bkit-${workflow}.md not found — skipping ${workflow} run (advisory)\n`,
+        );
+        continue;
+      }
+      const report = auditRun(rows, workflow, md);
+      if (report.missing.length > 0) holeyRuns += 1;
+      process.stdout.write(formatAdvisoryReport(report) + "\n");
+    }
   }
+  process.stdout.write(
+    `[bkit-status-holes] sweep: ${statusPaths.length} file(s), ${holeyRuns} holey\n`,
+  );
   // ALWAYS exit 0 — this is advisory / fail-open
 }
 
diff --git a/.bkit/core/workflows/bkit-build.md b/.bkit/core/workflows/bkit-build.md
index e6533de7b..b7fad07cf 100644
--- a/.bkit/core/workflows/bkit-build.md
+++ b/.bkit/core/workflows/bkit-build.md
@@ -378,7 +378,8 @@ description: "Build Feature — Autonomous implementation"
    "{BKIT}" tests plan-check --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --existence=report --log="docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md"
    ```
    Route:
-   - **If** exit 0 **and** (`NEWER_COMMENTS` = 0 **or** `CONVERTED` is held) → Step 5.
+   - **If** exit 0, `CONVERTED` is not held **and** `NEWER_COMMENTS` = 0 → sub-step 4.
+   - **If** exit 0 **and** `CONVERTED` is held → Step 5.
    - **If** `CONVERTED` is not held **and** (exit 0 with `NEWER_COMMENTS` > 0, **or** exit 2 with no `docs/plans/{YYYYMM}/{FID}-plan.md`, **or** exit 1 with a `markers`, `matrix` or `supersession` problem) → sub-step 2.
    - **If** exit 1, `CONVERTED` is held **and** `CONVERT_RETRY` is not held → `CONVERT_RETRY` = the printed `problems` → sub-step 2.
    - **Else** → **Failure Path** naming each problem in the report.
@@ -390,12 +391,18 @@ description: "Build Feature — Autonomous implementation"
    ```bash
    "{BKIT}" steps finish --workflow=build --step=build-plan-convert --file="{STATUS}" --attempt-of=build-plan-convert:next --artifact=docs/plans/{YYYYMM}/{FID}-plan.md --optional-artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md --number=4 --post --title="Plan Convert" --message="chore({FID}): plan-convert attempt <attempt>"
    ```
+4. Plan already in task-block form: finish the step with no agent and no artifact, its comment naming the skip:
+   ```bash
+   "{BKIT}" steps finish --workflow=build --step=build-plan-convert --file="{STATUS}" --attempt=1 --number=4 --post --title="Plan Convert" --comment-field="Status=skipped (plan already in task-block form)" --message="chore({FID}): plan-convert skipped"
+   ```
+   Every outcome → Step 5.
 
 ### 🔒 Gate 4 — Plan Convert
 
 - [ ] Plan checked (`tests plan-check`)
 - [ ] Converted (`@bkit-build-plan-convert`, no inline work) when it had no task markers or issue comments are newer than it
 - [ ] Converted plan checked again (`tests plan-check`)
+- [ ] Skip recorded (`steps finish`) when the plan needed no conversion
 - [ ] Mechanical checks passed (`steps finish`)
 
 ---
diff --git a/.bkit/version b/.bkit/version
index 24813fe66..0f39fe148 100644
--- a/.bkit/version
+++ b/.bkit/version
@@ -18,13 +18,13 @@
     ".gitignore": "9a7f418d4a8aafbddbd9995b6a9cee5b5dc54a8ec47440263a17d388652d79e3",
     "docs/security.md": "f9c50965df581f9a17774d64ef9b98bcfe986b20a70d9c6a72d2ffaed4c470f7",
     ".mcp.json": "65b29f1bb28dd6296d1dc8ea34aca4826d9ca072d7cef9d2971a7045280505d9",
-    "docs/architecture.md": "d693ad2e4ffa93e222c2ce491c23eac4ea7f8ceeaab3c79f67a071444d65a65a",
+    "docs/architecture.md": "58feb6e534ca471e13a370c5c9d9bad8b1a53747054cbde7b9b08587e24c5952",
     "docs/technology.md": "1b111b1e9bc13635adfd79726229d3fa49f19df9da96efb273d9a5b611d03507",
     ".bkit/.env.example": "3eae6dd3d96a33aed1745fc6b069000ae7272fbdab99617250015e9c233e6200",
     ".opencode/opencode.json": "06b3702dcb8968463c164b36fbc340428591f6601420cb48e95371db1d1ac958",
     "docs/design.md": "ca5146835a83d6e22e28e990b11e2df619096482b02c6d6e2567592cff2bea41",
     ".claude/commands/bkit-auto.md": "0f0a4f496d1a5f4ba274c5f47e7b53df02c8bd399d18db2bdf2e1dcc0579f85b",
-    ".claude/commands/bkit-build.md": "90f563d785a7d8c58af6442e80c6ca9333e2a625a8109f6265ee2133494adac9",
+    ".claude/commands/bkit-build.md": "b658e4a334d492912a29af4da88a1c5e946af0cc49128a70fca071260a8959a9",
     ".claude/commands/bkit-debug.md": "3ea39e60edf093c00534002025ab6228e0b43ef39525c014a73ecb5ababf306c",
     ".claude/commands/bkit-design.md": "e616b8e283a066071e38521c36b6593a9dc8ffd8d130ca9ce25e4bc1d9d4c4af",
     ".claude/commands/bkit-plan.md": "b59d51054721e7050ab6f1c6ddf4a6a840018fdf3743b75eedb9c371816b6ecd",
@@ -57,7 +57,7 @@
     ".claude/agents/bkit-utility-compress-markdown.md": "d404394530701291608ee60e0762a88562e72d5ab816e8d0a93928bd1778b7ae",
     ".claude/agents/bkit-utility-update-documentation.md": "4364b0fda303d45a20df44a7885ab9862ed628e0412784d8e8ae0452c536bafa",
     ".cursor/commands/bkit-auto.md": "c7529c630eab40cb88df138a386f7418e3edf02275344d430697c56a1d511a2e",
-    ".cursor/commands/bkit-build.md": "37133df0908796b6648665b0dc82588428747f5449cfc7a655a9c62cb1b760a0",
+    ".cursor/commands/bkit-build.md": "2ab290c476c50a389e9f2a7b494b832f7ab5db62a5710099a8e821eac705675d",
     ".cursor/commands/bkit-debug.md": "d9e943968d0e9e9706b9e5e27977f987c20df645ef87770e1aa437ffd0cc0750",
     ".cursor/commands/bkit-design.md": "541151e4a3a4e8a46e1210be648efa2acdcd84a0ca9efcb374bc3ade64e18b58",
     ".cursor/commands/bkit-plan.md": "3386890d0ac9fb808c007c27c56a41e81af0864b6d330901751ae31aa5da73d5",
@@ -117,7 +117,7 @@
     ".opencode/agents/bkit-utility-compress-markdown.md": "817e890c062a40f0826b4cce33877afbb3302a23864d27fb23288b2c5c6b018b",
     ".opencode/agents/bkit-utility-update-documentation.md": "14d0908a30b0d47e9754c1802b283478eb1b57af38236530780e06b2d46bd19b",
     ".opencode/commands/bkit-auto.md": "5e8e9b3a2092de9fca48e787c3b60c33a4d86845a063a269fc6ee7a4dea13501",
-    ".opencode/commands/bkit-build.md": "8a2ce95669970162a47472fec563d11c95d2abde0b7ecbd54e33473111a2aa49",
+    ".opencode/commands/bkit-build.md": "717fe8fdd7aaba2b7516df05e36f2f0ab66b8d071ea5a70e1d369d8bd85a25ab",
     ".opencode/commands/bkit-debug.md": "307cbdf5c06fb11d0ce23bb54a71ec01335d3a9e045babac6749a5d1860230a2",
     ".opencode/commands/bkit-design.md": "3578f6f648d3c75da8d7f688c3fb0112a5e02e0b17bb4a44d69b7c6bb7a9fb23",
     ".opencode/commands/bkit-plan.md": "1fb480720c705d161de7107fe388eee4e59cd611b1e686386782c91120f33b48",
@@ -228,7 +228,7 @@
     ".bkit/providers.md": "9b1486ca46eb2ee3c6637700ddcf7e2cadf32979e85d0336c12378de23d61ca5",
     ".bkit/prompts.md": "11073ff6c2402286452b27472d8b104d89fdf34eb50080adbc3255bd795a7c11",
     ".bkit/trackers.md": "189cac5e7f50b729b2c1a3e7b7e5bee875556a227273521d904537b748e11986",
-    ".bkit/workflows.md": "4933251df01e994c045858f81d8246a433ee158c54ef4626624967087d19e848",
+    ".bkit/workflows.md": "1a8e6bc74f3baca6f64d02e50f762aa654499669603ecc5a73fc6045cc40cfac",
     ".bkit/README.md": "530e36472878d389d8b4770ce20ff21ead9df87637da4b592e5c6c7a0be962dd",
     ".cursor/rules/bkit-rules.mdc": "164c1bc7aed517d5eca01abac2f0c0e87a1102ceb1700eae02e340ef6f9ce797",
     ".claude/hooks/bkit-gateguard.cjs": "ca5312fbfe6ae3198df0b98ca8f48ec3e640df0c7a3918271777355b8367ada9",
@@ -265,7 +265,7 @@
     ".cursor/agents/bkit-build-plan-convert.md": "684437a0a31a15c7c5722a38cd22500935d23966fcac6ce51c9d2607f707effd",
     ".opencode/agents/bkit-build-plan-convert.md": "66a904bcc7bbba81868c30200652dbf4549bc063762246461f2b22462bc49338",
     ".codex/agents/bkit-build-plan-convert.toml": "eb153d9e55bb1bf2b3cc722aab32fcd5a738790b138e5432a789ecd31c0fe3c3",
-    ".bkit/authoring.md": "e71d65a92799b533e9e5bbc9ee1c7deddf9cac757ccd6a3388cff5072b368895",
+    ".bkit/authoring.md": "e223ec7bbcc5860feb9ee63bd7704ac079dbdc23ab61e6f4302f9b40ec369b6b",
     ".codex/hooks/bkit-rules.cjs": "37b3c590ada277b78a246908dadddbb31c64798ca5d300e57b193e314620da67",
     ".opencode/plugin/bkit-rules.js": "6769eacc40fc2856faa9265c5665d5e4426b23c21e3df1e4f177ed6422221824",
     ".bkit/router.md": "a29b576543c024b483c01683fe1b81397005a85ba95367ab18326737b9c0980e"
diff --git a/.bkit/workflows.md b/.bkit/workflows.md
index 27adeac2c..0850a99ad 100644
--- a/.bkit/workflows.md
+++ b/.bkit/workflows.md
@@ -875,7 +875,7 @@ Each subsection documents command behaviour — steps, subagents, artifacts, ver
 | 1 — Start Workflow | — | Pre-flight: fetch `origin/dev`. Issue recovery as in design Step 1 (issue-less: tracker reads, labels, comments and the blocker check skipped). Set label `Build`, `In Progress`. Check `relations.blocked_by` — any blocker not in `{Done, Cancelled}` → Failure Path with `Blocked by {BLOCKER_ID}`. Resolve `FID`, then lock (missing month bucket → current month). no commits on `dev` — `start-workflow` step entry deferred to Step 2 inside the worktree. |
 | 2 — Worktree Setup | — | `bkit worktrees setup` (create / resume / adopt; dependencies installed). No path moves — plan stays at canonical bucket from design close. `bkit workflows input` writes `build-input-{RUN}.md`: session prompt, issue text and the plan as it arrived — the whole plan again, so only `@bkit-build-plan-convert` reads it; it stays as the record of what the run was given. Every other build agent reads the plan or its group's brief, and run instructions in the session prompt (a redo, a resume, a constraint) reach the brief's `Deviations` section through `--note-file` (Step 7). |
 | 3 — Branch Sync | — | `bkit branches sync --merge-docs`: fetch `origin/dev`; when commits touching `docs/` are behind, merge it — ledger conflicts union, other `docs/` conflicts take `dev`, a conflict outside `docs/` aborts the merge (exit 11 → Failure Path). |
-| 4 — Plan Convert | `@bkit-build-plan-convert` _(only when the plan is missing, has no task markers, or is older than an issue comment)_ | `bkit tests plan-check --existence=report` on `{FID}-plan.md` → `build-plan-check.md`. No plan (exit 2), a plan with no task markers (exit 1, problem `markers`) or with a `matrix` / `supersession` problem, or a valid plan with issue comments posted after its last commit (`newerThanPlan` > 0 from Step 2's `workflows input`) → `@bkit-build-plan-convert` writes the plan in task-block form from `build-input-{RUN}.md` and the plan file, keeping any existing plan's other sections; where they disagree the newer text wins, so later comments change the plan before any code; convert copies each `TEST EXCEPTION` an input writes word for word and never writes its own; row `build-plan-convert`, then the check re-runs. Still failing → convert once more with the printed problems, then Failure Path. Any other problem (caps, a stray `TEST FIRST` line) → Failure Path before any code, naming each problem. A valid plan with no newer comments writes no row and posts no comment. `bkit install` / `check` / `upgrade` list each `{FID}-plan.md` with no task markers whose FID has not shipped as advisory `plan-task-markers-missing`; nothing to do by hand, this step converts it. |
+| 4 — Plan Convert | `@bkit-build-plan-convert` _(only when the plan is missing, has no task markers, or is older than an issue comment; otherwise a skip row)_ | `bkit tests plan-check --existence=report` on `{FID}-plan.md` → `build-plan-check.md`. No plan (exit 2), a plan with no task markers (exit 1, problem `markers`) or with a `matrix` / `supersession` problem, or a valid plan with issue comments posted after its last commit (`newerThanPlan` > 0 from Step 2's `workflows input`) → `@bkit-build-plan-convert` writes the plan in task-block form from `build-input-{RUN}.md` and the plan file, keeping any existing plan's other sections; where they disagree the newer text wins, so later comments change the plan before any code; convert copies each `TEST EXCEPTION` an input writes word for word and never writes its own; row `build-plan-convert`, then the check re-runs. Still failing → convert once more with the printed problems, then Failure Path. Any other problem (caps, a stray `TEST FIRST` line) → Failure Path before any code, naming each problem. A valid plan with no newer comments writes a no-agent skip row (`build-plan-convert`, `--attempt=1`, comment `Status=skipped (plan already in task-block form)`) and goes to Step 5. `bkit install` / `check` / `upgrade` list each `{FID}-plan.md` with no task markers whose FID has not shipped as advisory `plan-task-markers-missing`; nothing to do by hand, this step converts it. |
 | 5 — Plan Current | `@bkit-build-plan-current` _(skipped when the mechanical trigger clears)_ | Orchestrator trigger `bkit branches anchor-read --field=baseSha --against=origin/dev` reads the plan's `bkit:anchor` (§ Anchor Block) and exits 12 — skipping the judgement, no agent, no artifact, its own comment naming the skip — on any of: no plan, no anchor, `baseSha` unreachable in this clone, nothing landed on `origin/dev` since it. Else it prints `value` (= `BASE_SHA`) and the agent derives its own changed-path list from it, intersects that against the paths the plan's tasks depend on, and reads per-path diffs for the intersection only. `Executable` tasks are not findings; `Reword` / `Broken` are. Judges the PLAN against the codebase — the design doc is not an input, and `designPath` / `designBaseSha` have no consumer here. `CURRENT_VERDICT` is advisory on every value — PASS / CONCERNS / FAIL all → Step 6; CONCERNS / FAIL are recorded, comment-posted with `Affected`, and echoed as a console advisory, never blocking. Findings carry into Step 7 as a Read for `@bkit-build-plan-execute`; build never revises the plan, a re-run of `/bkit-plan` does. |
 | 6 — Skills | `@bkit-build-install-skills` _(skip if input contains `[skills=false]`)_ | If new skills installed → commit `chore({FID}): install skills bkit [skip ci]`. |
 | 7 — Execute Plan | `@bkit-build-plan-execute` | `bkit context brief --next` writes `build-brief-{GROUP}-{n}.md` — the group's open task blocks, the reds already recorded for them, the earlier tasks they depend on as context, and the plan's `Reuse Inventory` rows and `Architecture & Component Changes` entries naming the open tasks' `CREATE` / `UPDATE` / `DELETE` files (rows and entries past the 8 KB work cap are left out and counted; execute then reads the plan section) — and prints `group` (null → Step 10), `workBytes` and `workCap`. When the session prompt carries run instructions beyond naming the issue, the orchestrator writes them once to `{SESSION_DIR}/brief-note.md` and passes `--note-file`, so each brief ends with a `Deviations` section the agents apply to the tasks it names. A `build-group-start` row records the commit the group starts from, once per group. The orchestrator passes paths only; the agent reads the brief, not the plan and not `build-input-{RUN}.md`. Per group: `build-plan-execute-{GROUP}-log.md`. Attempt-numbered rows (`--attempt-of=build-plan-execute:next`), one log appended across attempts. Writes stub-first then incremental `DONE — TASK {N}` / `BLOCKED — TASK {N}` log entries via `Bash echo >>`; writes source. Per task naming `TEST FIRST` tests: tests + stubs first, then the red command from Context (`bkit tests red`, § Test-first) once per test before the task's code. Does not modify the plan — ticking is verify's job (per-task `Edit`-tick phase after impl is done is a known timeout vector; verify absorbs recovery). `bkit tasks open --plan= --group= --log=` names each task the plan leaves open and prints `handover`; verdict `HANDOVER` (turn cap near) or `handover` = true (a task with neither a `DONE` nor a `BLOCKED` line — the agent hit its turn cap) → Step 7 re-runs once for that group as a handover, not a failed attempt, its brief leaving out the `DONE` tasks; the tracker comment shows `HANDOVER`; after that the verify→remediate loop (Step 8 → Step 9, bounded by `build.verify.maxAttempts`) absorbs the recovery. Else → Step 8. |
diff --git a/.claude/commands/bkit-build.md b/.claude/commands/bkit-build.md
index 755536b56..94cb71e4a 100644
--- a/.claude/commands/bkit-build.md
+++ b/.claude/commands/bkit-build.md
@@ -336,7 +336,8 @@ description: "Build Feature — Autonomous implementation"
    "{BKIT}" tests plan-check --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --existence=report --log="docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md"
    ```
    Route:
-   - **If** exit 0 **and** (`NEWER_COMMENTS` = 0 **or** `CONVERTED` is held) → Step 5.
+   - **If** exit 0, `CONVERTED` is not held **and** `NEWER_COMMENTS` = 0 → sub-step 4.
+   - **If** exit 0 **and** `CONVERTED` is held → Step 5.
    - **If** `CONVERTED` is not held **and** (exit 0 with `NEWER_COMMENTS` > 0, **or** exit 2 with no `docs/plans/{YYYYMM}/{FID}-plan.md`, **or** exit 1 with a `markers`, `matrix` or `supersession` problem) → sub-step 2.
    - **If** exit 1, `CONVERTED` is held **and** `CONVERT_RETRY` is not held → `CONVERT_RETRY` = the printed `problems` → sub-step 2.
    - **Else** → **Failure Path** naming each problem in the report.
@@ -348,12 +349,18 @@ description: "Build Feature — Autonomous implementation"
    ```bash
    "{BKIT}" steps finish --workflow=build --step=build-plan-convert --file="{STATUS}" --attempt-of=build-plan-convert:next --artifact=docs/plans/{YYYYMM}/{FID}-plan.md --optional-artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md --number=4 --post --title="Plan Convert" --message="chore({FID}): plan-convert attempt <attempt>"
    ```
+4. Plan already in task-block form: finish the step with no agent and no artifact, its comment naming the skip:
+   ```bash
+   "{BKIT}" steps finish --workflow=build --step=build-plan-convert --file="{STATUS}" --attempt=1 --number=4 --post --title="Plan Convert" --comment-field="Status=skipped (plan already in task-block form)" --message="chore({FID}): plan-convert skipped"
+   ```
+   Every outcome → Step 5.
 
 ### 🔒 Gate 4 — Plan Convert
 
 - [ ] Plan checked (`tests plan-check`)
 - [ ] Converted (`@bkit-build-plan-convert`, no inline work) when it had no task markers or issue comments are newer than it
 - [ ] Converted plan checked again (`tests plan-check`)
+- [ ] Skip recorded (`steps finish`) when the plan needed no conversion
 - [ ] Mechanical checks passed (`steps finish`)
 
 ---
diff --git a/.cursor/commands/bkit-build.md b/.cursor/commands/bkit-build.md
index 4611f75cf..a38025c74 100644
--- a/.cursor/commands/bkit-build.md
+++ b/.cursor/commands/bkit-build.md
@@ -335,7 +335,8 @@ Build Feature — Autonomous implementation
    "{BKIT}" tests plan-check --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --existence=report --log="docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md"
    ```
    Route:
-   - **If** exit 0 **and** (`NEWER_COMMENTS` = 0 **or** `CONVERTED` is held) → Step 5.
+   - **If** exit 0, `CONVERTED` is not held **and** `NEWER_COMMENTS` = 0 → sub-step 4.
+   - **If** exit 0 **and** `CONVERTED` is held → Step 5.
    - **If** `CONVERTED` is not held **and** (exit 0 with `NEWER_COMMENTS` > 0, **or** exit 2 with no `docs/plans/{YYYYMM}/{FID}-plan.md`, **or** exit 1 with a `markers`, `matrix` or `supersession` problem) → sub-step 2.
    - **If** exit 1, `CONVERTED` is held **and** `CONVERT_RETRY` is not held → `CONVERT_RETRY` = the printed `problems` → sub-step 2.
    - **Else** → **Failure Path** naming each problem in the report.
@@ -347,12 +348,18 @@ Build Feature — Autonomous implementation
    ```bash
    "{BKIT}" steps finish --workflow=build --step=build-plan-convert --file="{STATUS}" --attempt-of=build-plan-convert:next --artifact=docs/plans/{YYYYMM}/{FID}-plan.md --optional-artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md --number=4 --post --title="Plan Convert" --message="chore({FID}): plan-convert attempt <attempt>"
    ```
+4. Plan already in task-block form: finish the step with no agent and no artifact, its comment naming the skip:
+   ```bash
+   "{BKIT}" steps finish --workflow=build --step=build-plan-convert --file="{STATUS}" --attempt=1 --number=4 --post --title="Plan Convert" --comment-field="Status=skipped (plan already in task-block form)" --message="chore({FID}): plan-convert skipped"
+   ```
+   Every outcome → Step 5.
 
 ### 🔒 Gate 4 — Plan Convert
 
 - [ ] Plan checked (`tests plan-check`)
 - [ ] Converted (`@bkit-build-plan-convert`, no inline work) when it had no task markers or issue comments are newer than it
 - [ ] Converted plan checked again (`tests plan-check`)
+- [ ] Skip recorded (`steps finish`) when the plan needed no conversion
 - [ ] Mechanical checks passed (`steps finish`)
 
 ---
diff --git a/.opencode/commands/bkit-build.md b/.opencode/commands/bkit-build.md
index 7a7e263ef..eccfbd383 100644
--- a/.opencode/commands/bkit-build.md
+++ b/.opencode/commands/bkit-build.md
@@ -339,7 +339,8 @@ $ARGUMENTS
    "{BKIT}" tests plan-check --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --existence=report --log="docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md"
    ```
    Route:
-   - **If** exit 0 **and** (`NEWER_COMMENTS` = 0 **or** `CONVERTED` is held) → Step 5.
+   - **If** exit 0, `CONVERTED` is not held **and** `NEWER_COMMENTS` = 0 → sub-step 4.
+   - **If** exit 0 **and** `CONVERTED` is held → Step 5.
    - **If** `CONVERTED` is not held **and** (exit 0 with `NEWER_COMMENTS` > 0, **or** exit 2 with no `docs/plans/{YYYYMM}/{FID}-plan.md`, **or** exit 1 with a `markers`, `matrix` or `supersession` problem) → sub-step 2.
    - **If** exit 1, `CONVERTED` is held **and** `CONVERT_RETRY` is not held → `CONVERT_RETRY` = the printed `problems` → sub-step 2.
    - **Else** → **Failure Path** naming each problem in the report.
@@ -351,12 +352,18 @@ $ARGUMENTS
    ```bash
    "{BKIT}" steps finish --workflow=build --step=build-plan-convert --file="{STATUS}" --attempt-of=build-plan-convert:next --artifact=docs/plans/{YYYYMM}/{FID}-plan.md --optional-artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md --number=4 --post --title="Plan Convert" --message="chore({FID}): plan-convert attempt <attempt>"
    ```
+4. Plan already in task-block form: finish the step with no agent and no artifact, its comment naming the skip:
+   ```bash
+   "{BKIT}" steps finish --workflow=build --step=build-plan-convert --file="{STATUS}" --attempt=1 --number=4 --post --title="Plan Convert" --comment-field="Status=skipped (plan already in task-block form)" --message="chore({FID}): plan-convert skipped"
+   ```
+   Every outcome → Step 5.
 
 ### 🔒 Gate 4 — Plan Convert
 
 - [ ] Plan checked (`tests plan-check`)
 - [ ] Converted (`@bkit-build-plan-convert`, no inline work) when it had no task markers or issue comments are newer than it
 - [ ] Converted plan checked again (`tests plan-check`)
+- [ ] Skip recorded (`steps finish`) when the plan needed no conversion
 - [ ] Mechanical checks passed (`steps finish`)
 
 ---
diff --git a/dist/checks/status-holes.js b/dist/checks/status-holes.js
index 701354871..2073edb90 100644
--- a/dist/checks/status-holes.js
+++ b/dist/checks/status-holes.js
@@ -1,10 +1,10 @@
 // checks/status-holes.ts — Tier-3 advisory status-hole detector.
 //
-// A fail-open advisory that compares the set of ship steps RECORDED in a
-// status.jsonl against the set of steps the workflow PROSE says should be
-// there. It derives its expected set from .bkit/core/workflows/bkit-ship.md at
-// runtime (headings + step:"ship-*" literals) — NEVER a hand-maintained table
-// (decision 384-tier3-promotion).
+// A fail-open advisory that compares the steps RECORDED in each run of a
+// status.jsonl against the steps the workflow PROSE says should be there. It
+// derives the expected set from .bkit/core/workflows/bkit-{workflow}.md at
+// runtime (headings + --step= literals) — NEVER a hand-maintained table
+// (decision 384-tier3-promotion). Each run's workflow is inferred from its rows.
 //
 // ADVISORY / FAIL-OPEN: the CLI exits 0 unconditionally — even when holes are
 // found (decision 384-tier3-promotion).
@@ -20,11 +20,12 @@
 //     appear only in the merge-retry loop.
 //
 // Usage (advisory CI step or manual):
-//   npx tsx .bkit/core/engine/checks/status-holes.ts <status.jsonl> [--ship-md <path>]
+//   npx tsx .bkit/core/engine/checks/status-holes.ts <status.jsonl>...
 //   # exits 0 always; prints advisory report to stdout
 import * as fs from "node:fs";
 import * as path from "node:path";
 import { fileURLToPath } from "node:url";
+import { WORKFLOW_STEPS } from "../commands/workflow/step-table.js";
 import { parseJson } from "../shared/json.js";
 import { getWorkflowsRoot } from "../shared/package-roots.js";
 // ---------------------------------------------------------------------------
@@ -74,83 +75,120 @@ const MERGED_ON_ENTRY_SKIP = new Set([
     "ship-merge-pr",
     // failure-diagnose/remediate are already in RETRY_LOOP_STEPS (never expected)
 ]);
-// ---------------------------------------------------------------------------
-// Source derivation — parse bkit-ship.md to find the expected step universe.
-// ---------------------------------------------------------------------------
-/**
- * Derive the universe of ship step keys from the workflow markdown.
- *
- * Strategy:
- * 1. Extract every `step:"ship-..."` literal from fenced code blocks.
- * 2. Extract every `## … Step N — Name` heading and map the heading's section
- *    to the step key(s) found within it.
- * 3. Return the union of all unique step keys.
- *
- * The two passes scan the SAME `step:"ship-*"` regex and the heading pass only
- * narrows the line range, so `headingSteps` is always a subset of `literalSteps`.
- * The detector reports `orphanSteps`: a status write that appears in the file but NOT
- * inside any `## … Step N` section.
- */
-export function deriveExpectedStepSetFromSource(shipMd) {
-    const lines = shipMd.split("\n");
-    // 1. Collect every `step:"ship-..."` / `--step=ship-...` literal (anywhere — fenced or prose).
-    const literalSet = new Set();
-    const literalRe = /(?:step:"|--step=)(ship-[a-z-]+)/g;
-    for (const line of lines) {
-        let m;
-        while ((m = literalRe.exec(line)) !== null) {
-            literalSet.add(m[1]);
+// A key followed by `{` is a templated log label (`build-group-gate-{GROUP}`), not a row key.
+const STEP_KEY_RE = /(?:step:"|--step=)([a-z][a-z0-9-]*)(\{)?/g;
+/** The words of one `"{BKIT}" ...` call: shell-split, quotes kept, stopped at the first unquoted operator. */
+export function callWords(rest) {
+    const words = [];
+    let word = "";
+    let quote = "";
+    for (const ch of rest) {
+        if (quote) {
+            word += ch;
+            if (ch === quote)
+                quote = "";
         }
-        literalRe.lastIndex = 0; // reset per-line
-    }
-    // 2. Collect heading-derived steps. A `## … Step N` heading opens a section;
-    //    the step key(s) within that section's body (until the next `## ` heading)
-    //    belong to that step.
-    const headingSet = new Set();
-    let inStep = false;
-    for (const line of lines) {
-        if (/^##\s+.*Step\s+\d+/i.test(line)) {
-            inStep = true;
-            continue;
-        }
-        if (/^##\s+/m.test(line) && !/Step\s+\d+/i.test(line)) {
-            inStep = false;
-            continue;
+        else if (ch === '"' || ch === "'") {
+            word += ch;
+            quote = ch;
         }
-        if (inStep) {
-            let m;
-            const re = /(?:step:"|--step=)(ship-[a-z-]+)/g;
-            while ((m = re.exec(line)) !== null) {
-                headingSet.add(m[1]);
-            }
-            re.lastIndex = 0;
+        else if ("|;&><)`".includes(ch))
+            break;
+        else if (/\s/.test(ch)) {
+            if (word)
+                words.push(word);
+            word = "";
         }
+        else
+            word += ch;
     }
-    // 3. Union + the one asymmetry that carries signal (see the docstring).
-    const all = new Set([...literalSet, ...headingSet]);
-    const orphanSteps = [...literalSet].filter((s) => !headingSet.has(s)).sort();
-    return {
-        steps: [...all].sort(),
-        headingSteps: [...headingSet].sort(),
-        literalSteps: [...literalSet].sort(),
-        orphanSteps,
-    };
+    if (word)
+        words.push(word);
+    return words;
+}
+/** Each `Step N — Title` heading, with the text up to the next step or section heading. */
+export function stepSections(text) {
+    const lines = text.split("\n");
+    const heading = /^#{2,3} \S+ Step (\d+) — (.+)$/;
+    const out = [];
+    lines.forEach((l, i) => {
+        const m = heading.exec(l);
+        if (!m)
+            return;
+        const end = lines.findIndex((x, j) => j > i && /^#{2,3} /.test(x) && !x.startsWith("### 🔒"));
+        out.push({
+            number: Number(m[1]),
+            title: m[2],
+            body: lines.slice(i, end === -1 ? undefined : end).join("\n"),
+        });
+    });
+    return out;
+}
+/** Each `"{BKIT}"` call in `text` as noun / verb / flag names. */
+function requiredCalls(text) {
+    const joined = text.replace(/\\\n\s*/g, " ");
+    return joined
+        .split('"{BKIT}"')
+        .slice(1)
+        .map((call) => {
+        const [noun = "", verb = "", ...rest] = callWords(call.replace(/^ /, ""));
+        const flags = rest.flatMap((w) => {
+            const f = /^--([a-z][a-z0-9-]*)/.exec(w)?.[1];
+            return f ? [f] : [];
+        });
+        return { noun, verb: verb.startsWith("--") ? "" : verb, flags };
+    });
+}
+const stepKeys = (text) => [
+    ...new Set([...text.matchAll(STEP_KEY_RE)].filter((m) => !m[2]).map((m) => m[1])),
+];
+/** A step is conditional under a column-0 marker line anywhere in its section, or a `(Path X only)` heading. */
+export function isConditionalSection(body) {
+    const lines = body.split("\n");
+    return (/\(Path [A-Z] only\)/.test(lines[0] ?? "") ||
+        lines.some((l) => /^\*\*(Run only if|Skip if)\*\*/.test(l)));
 }
 /**
- * Cross-check the source-derived set against the frozen canonical set.
- * Returns the keys that disagree (present in one but not the other).
+ * Derive the contract of one workflow from its markdown: the step sections, the
+ * row keys and `"{BKIT}"` calls each holds, and the calls no step owns. The
+ * universe is cross-checked against the deduped `WORKFLOW_STEPS[workflow]`; a
+ * disagreement is reported as drift, never thrown.
  */
-export function checkSourceCanonicalDrift(sourceSteps) {
-    const sourceSet = new Set(sourceSteps);
-    const canonicalSet = new Set(SHIP_STEP_ORDER);
+export function deriveContract(workflowMd, workflow) {
+    const sections = stepSections(workflowMd);
+    const steps = sections.map((s) => ({
+        number: s.number,
+        title: s.title,
+        keys: stepKeys(s.body),
+        calls: requiredCalls(s.body),
+        conditional: isConditionalSection(s.body),
+    }));
+    const universe = [...new Set(steps.flatMap((s) => s.keys))].sort();
+    // Text outside every step section: the md minus each section body.
+    let outside = workflowMd;
+    for (const s of sections)
+        outside = outside.replace(s.body, "");
+    const table = WORKFLOW_STEPS[workflow];
+    const tableKeys = new Set((table ?? []).flatMap((s) => (s.step ? [s.step] : [])));
     const drift = [];
-    for (const k of canonicalSet)
-        if (!sourceSet.has(k))
-            drift.push(`canonical-but-not-source:${k}`);
-    for (const k of sourceSet)
-        if (!canonicalSet.has(k))
-            drift.push(`source-but-not-canonical:${k}`);
-    return drift;
+    if (table) {
+        for (const k of tableKeys)
+            if (!universe.includes(k))
+                drift.push(`table-but-not-source:${k}`);
+        for (const k of universe)
+            if (!tableKeys.has(k))
+                drift.push(`source-but-not-table:${k}`);
+    }
+    return {
+        workflow,
+        steps,
+        universe,
+        workflowCalls: requiredCalls(outside),
+        orphanSteps: stepKeys(outside)
+            .filter((k) => k.startsWith(`${workflow}-`) && !universe.includes(k))
+            .sort(),
+        drift,
+    };
 }
 // ---------------------------------------------------------------------------
 // Run classification + path-conditional expected sets
@@ -206,6 +244,9 @@ export function computeMandatoryForPath(path, sourceUniverse) {
         case "MERGED_ON_ENTRY":
             // Skip the entire middle + retry-loop steps
             return new Set([...universe].filter((s) => !MERGED_ON_ENTRY_SKIP.has(s) && !RETRY_LOOP_STEPS.has(s)));
+        case "COMPLETED":
+            // Non-ship runs derive their mandatory set from the contract (auditRun)
+            return new Set(universe);
         case "ABORTED":
             // No mandatory steps — the run terminated; post-abort absences are expected
             return new Set();
@@ -262,13 +303,9 @@ export function detectHoles(observed, sourceUniverse, path) {
     return { missing, unexpected };
 }
 // ---------------------------------------------------------------------------
-// Full audit — parse status.jsonl + ship md, classify, detect, report
+// Full audit — parse status.jsonl + workflow md, classify, detect, report
 // ---------------------------------------------------------------------------
-export function auditStatusJsonl(statusJsonl, shipMd) {
-    // Derive expected set from source
-    const { steps: sourceUniverse, orphanSteps } = deriveExpectedStepSetFromSource(shipMd);
-    const sourceCanonicalDrift = checkSourceCanonicalDrift(sourceUniverse);
-    // Parse status rows
+function parseRows(statusJsonl) {
     const rows = [];
     for (const line of statusJsonl.split("\n")) {
         const trimmed = line.trim();
@@ -279,35 +316,78 @@ export function auditStatusJsonl(statusJsonl, shipMd) {
         if (row.ok)
             rows.push(row.value);
     }
-    // Filter to ship step-done rows + workflow-failed rows
-    const shipStepRows = rows.filter((r) => r.type === "step-done" && r.workflow === "ship" && typeof r.step === "string");
-    const hasWorkflowFailed = rows.some((r) => r.type === "workflow-failed" && r.workflow === "ship");
-    const hasMergedOnEntryMarker = rows.some((r) => r.type === "ship-merged-on-entry" && r.workflow === "ship");
-    // Collect observed steps
+    return rows;
+}
+/** Audit one run's rows against the contract derived from its workflow markdown. */
+export function auditRun(rows, workflow, workflowMd) {
+    const contract = deriveContract(workflowMd, workflow);
+    const stepRows = rows.filter((r) => r.type === "step-done" && r.workflow === workflow && typeof r.step === "string");
+    const hasWorkflowFailed = rows.some((r) => r.type === "workflow-failed" && r.workflow === workflow);
     const observed = new Set();
-    for (const r of shipStepRows) {
+    for (const r of stepRows)
         if (r.step)
             observed.add(r.step);
+    const sorted = [...observed].sort();
+    if (workflow === "ship") {
+        const hasMergedOnEntryMarker = rows.some((r) => r.type === "ship-merged-on-entry" && r.workflow === "ship");
+        const runPath = classifyRun(observed, hasWorkflowFailed, hasMergedOnEntryMarker);
+        const { missing, unexpected } = detectHoles(observed, contract.universe, runPath);
+        return {
+            workflow,
+            missing,
+            unexpected,
+            path: runPath,
+            observed: sorted,
+            sourceUniverse: contract.universe,
+            sourceCanonicalDrift: contract.drift,
+            orphanSteps: contract.orphanSteps,
+        };
     }
-    // Classify + detect
-    const runPath = classifyRun(observed, hasWorkflowFailed, hasMergedOnEntryMarker);
-    const { missing, unexpected } = detectHoles(observed, sourceUniverse, runPath);
+    const closeKey = `${workflow}-close-workflow`;
+    const runPath = observed.has(closeKey)
+        ? "COMPLETED"
+        : hasWorkflowFailed
+            ? "ABORTED"
+            : "IN_PROGRESS";
+    const missing = runPath === "COMPLETED"
+        ? contract.steps
+            .filter((s) => s.keys.length > 0 && !s.conditional && !s.keys.some((k) => observed.has(k)))
+            .map((s) => s.keys[0])
+            .sort()
+        : [];
     return {
+        workflow,
         missing,
-        unexpected,
+        unexpected: sorted.filter((k) => !contract.universe.includes(k)),
         path: runPath,
-        observed: [...observed].sort(),
-        sourceUniverse: [...sourceUniverse].sort(),
-        sourceCanonicalDrift,
-        orphanSteps,
+        observed: sorted,
+        sourceUniverse: contract.universe,
+        sourceCanonicalDrift: contract.drift,
+        // Decision Pause / abort rows sit outside the numbered steps by design
+        orphanSteps: [],
     };
 }
+/** Audit a status.jsonl as a ship run against `shipMd`. */
+export function auditStatusJsonl(statusJsonl, shipMd) {
+    return auditRun(parseRows(statusJsonl), "ship", shipMd);
+}
+/** The workflows a status.jsonl holds runs of, inferred from its own rows. */
+export function inferWorkflows(rows) {
+    const known = new Set(Object.keys(WORKFLOW_STEPS));
+    const found = new Set();
+    for (const r of rows)
+        if (typeof r.workflow === "string" && known.has(r.workflow))
+            found.add(r.workflow);
+    return [...found].sort();
+}
 // ---------------------------------------------------------------------------
 // Advisory report formatter
 // ---------------------------------------------------------------------------
 export function formatAdvisoryReport(report) {
     const lines = [];
     lines.push("[bkit-status-holes] ADVISORY — fail-open (exit 0 regardless)");
+    if (report.workflow)
+        lines.push(`  workflow: ${report.workflow}`);
     lines.push(`  path: ${report.path}`);
     lines.push(`  observed: ${report.observed.length} step(s)`);
     if (report.sourceCanonicalDrift.length > 0) {
@@ -334,34 +414,26 @@ export function formatAdvisoryReport(report) {
 // CLI entry — always exits 0 (advisory / fail-open)
 // ---------------------------------------------------------------------------
 export function main(argv) {
-    const args = argv.slice(2);
-    // Resolve the ship-md override FIRST so its VALUE is never mistaken for a
-    // positional. `args.find(a => !a.startsWith("--"))` alone picks up the value
-    // of `--ship-md` when the flag is passed before the status path.
-    const mdFlagIdx = args.indexOf("--ship-md");
-    const shipMdOverride = mdFlagIdx >= 0 ? args[mdFlagIdx + 1] : undefined;
-    const consumed = new Set();
-    if (mdFlagIdx >= 0) {
-        consumed.add(mdFlagIdx);
-        if (shipMdOverride)
-            consumed.add(mdFlagIdx + 1);
-    }
-    // Every remaining positional is a status.jsonl to audit — one report each, so
-    // a whole corpus can be swept in one advisory CI step.
-    const statusPaths = args.filter((a, i) => !consumed.has(i) && !a.startsWith("--"));
+    // Every positional is a status.jsonl to audit — one report per file, so a
+    // whole corpus can be swept in one advisory CI step.
+    const statusPaths = argv.slice(2).filter((a) => !a.startsWith("--"));
     if (statusPaths.length === 0) {
         process.stdout.write("[bkit-status-holes] no status.jsonl path given — skipping (advisory)\n");
         return; // exit 0
     }
-    const shipMdPath = shipMdOverride || path.join(getWorkflowsRoot(), "bkit-ship.md");
-    let shipMd = "";
-    try {
-        shipMd = fs.readFileSync(shipMdPath, "utf-8");
-    }
-    catch {
-        process.stdout.write(`[bkit-status-holes] ${shipMdPath} not found — skipping (advisory)\n`);
-        return; // exit 0
-    }
+    const mdCache = new Map();
+    const loadMd = (workflow) => {
+        if (!mdCache.has(workflow)) {
+            try {
+                mdCache.set(workflow, fs.readFileSync(path.join(getWorkflowsRoot(), `bkit-${workflow}.md`), "utf-8"));
+            }
+            catch {
+                mdCache.set(workflow, null);
+            }
+        }
+        return mdCache.get(workflow) ?? null;
+    };
+    let holeyRuns = 0;
     for (const statusPath of statusPaths) {
         // Read inputs (advisory — missing files = skip, never fail)
         let statusJsonl = "";
@@ -372,10 +444,26 @@ export function main(argv) {
             process.stdout.write(`[bkit-status-holes] ${statusPath} not found — skipping (advisory)\n`);
             continue; // exit 0
         }
-        const report = auditStatusJsonl(statusJsonl, shipMd);
+        const rows = parseRows(statusJsonl);
+        const workflows = inferWorkflows(rows);
         process.stdout.write(`\n${statusPath}\n`);
-        process.stdout.write(formatAdvisoryReport(report) + "\n");
+        if (workflows.length === 0) {
+            process.stdout.write(`[bkit-status-holes] ${statusPath}: no workflow rows — skipping (advisory)\n`);
+            continue;
+        }
+        for (const workflow of workflows) {
+            const md = loadMd(workflow);
+            if (md === null) {
+                process.stdout.write(`[bkit-status-holes] bkit-${workflow}.md not found — skipping ${workflow} run (advisory)\n`);
+                continue;
+            }
+            const report = auditRun(rows, workflow, md);
+            if (report.missing.length > 0)
+                holeyRuns += 1;
+            process.stdout.write(formatAdvisoryReport(report) + "\n");
+        }
     }
+    process.stdout.write(`[bkit-status-holes] sweep: ${statusPaths.length} file(s), ${holeyRuns} holey\n`);
     // ALWAYS exit 0 — this is advisory / fail-open
 }
 // Run if invoked directly (ESM-compatible main-module detection)
