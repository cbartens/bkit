diff --git a/.bkit/core/.bkit/workflows.md b/.bkit/core/.bkit/workflows.md
index b5d582d4c..30a2ce509 100644
--- a/.bkit/core/.bkit/workflows.md
+++ b/.bkit/core/.bkit/workflows.md
@@ -241,7 +241,7 @@ The table lists the header bullets of the 6 workflow files, block by block, in f
 | **Locks** | Contract | design, plan, build, debug, ship | Step 1 takes the per-feature `.lock` (`bkit locks acquire`); released at close and in Failure Path. Existing lock: holder `IN_PROGRESS` with a step <30min ago → **Failure Path**; any other holder's lock reclaimed. |
 | **Status branch** | Contract | design, plan, build, debug, ship | status.jsonl committed per step on the feature branch (debug: adopted `{BRANCH}`; ship: `$BOOK_ROOT`, one commit per flush block), no mid-lifecycle pushes. |
 | **Worktrees** | Contract | design, plan, build, debug, ship | Mint mode → `.worktrees/{FID}`, else adopt the current branch in place (debug never creates a branch); cwd persists; `pwd` != `{WORKTREE_PATH}` → **Failure Path**. |
-| **Foreign path** | Contract | debug | Exit 10 from `steps finish` or `workflows close` on `dev` = a file the run commits was modified before the run → **STOP** and ask the human to commit or revert it, recording the wait (`owner-pause`, `reason=foreign-path`) and the reply (`owner-answer`), never the **Failure Path**. |
+| **Foreign path** | Contract | debug | Exit 10 from `steps finish` or `workflows close` on `dev` = a file the run commits was modified before the run → **STOP** and write the `**Action needed — Foreign path:**` line (commit or revert the file, then say "continue"), recording the wait (`owner-pause`, `reason=foreign-path`) and the reply (`owner-answer`), never the **Failure Path**. |
 | **gh MCP fallback** | Contract | design, plan, build, debug, ship | `gh` primary for PR / CI / merge; exit 80 or `runtimeGithubCli` = false → mapped MCP tool, recorded with `bkit prs transport-row`; tracker reads and writes go through `bkit` verbs. One identical line in all five. |
 | **External tools** | Contract | auto | `gh` reads the PR and its CI run inside `bkit runs context`; exit 80 → **Failure Path**; tracker reads and writes go through `bkit` verbs, the tracker MCP only on `tracker.done` = false or exit 80. |
 | **Tracker** / **Labels** / **Comments** | Contract | all 6, once per tracker block | `bkit` verbs read and write the tracker; its MCP tools only when a verb exits 80 or prints `done` = false; writes best-effort, retry once after 5s. Phase labels mutually exclusive; a phase start drops `next:*` and `bkit:failed`; `bkit:auto`, `bkit:failed` additive (§ Tracker Integration); `bkit issues labels --write` writes each transition, the **Labels** line names the MCP fallback call. A step's `bkit` block posts its `comment` with `--post` before its gate and prints `tracker`; `tracker.done` = false → the tracker MCP posts it. Every gate includes `Issue comment attempted (Step N section)` without listing it; never edit prior content (§ Comment Lifecycle). |
@@ -993,7 +993,7 @@ One mechanism for every build question: verify gaps logged `Fixable: false`, a n
   - **If** `ask` is true and the run is not headless → the orchestrator asks, in session. Never a subagent, because subagents cannot reach the human.
   - **If** `ask` is false or the run is headless → `bkit decisions apply --by=headless` takes each recommendation. Exit 4 means hard blockers are left: in a session only those are asked; headless, the run takes the Failure Path.
 - **Unproven tests (Step 15):** before the summary, `bkit tests green` over the whole plan lists each planned test still `unproven` (never failed before its code existed). One pause, `Question: UNPROVEN`, one item per test, options `Accept` / `Stop`, recommended `Accept`; asked once per run (a decision file with `Question: UNPROVEN` already there skips it). Headless → `Accept (assumed)`, which ship asks the owner to confirm. Route `summary` → Step 15.
-- **Hard blockers:** the unfixable gaps (`no-test-first`, `test-first-malformed`, `test-first-unread`, `exception-refused`, and holistic gaps logged `Fixable: false`) and `**Fixable:** false` challenge findings. No recommendation; "yes" never answers one. `Fix now` on one needs the owner's direction: with none, the pause asks what the fix should do and builds no task.
+- **Hard blockers:** the unfixable gaps (`no-test-first`, `test-first-malformed`, `test-first-unread`, `exception-refused`, and holistic gaps logged `Fixable: false`) and `**Fixable:** false` challenge findings. `Recommended: none — {why}`; "yes" never answers one. `Fix now` on one needs the owner's direction: with none, the pause asks what the fix should do and builds no task.
 - **Accept** by the owner: written ONLY after explicit human approval of that item. Agents NEVER write one on their own judgement. An `exception-refused` gap or an `UNPROVEN` item → a `**TEST EXCEPTION:**` field in the task's block, committed alone (`git commit -- {plan}`) so `tests green` honours them; each entry ends `— {reason} (owner, {YYYY-MM-DD})`, and the field replaces the task's existing one, never a second, so the plan-alone commit always changes its lines and blame points at it; other → `docs/decisions.jsonl` row (`by.step` `build-decision`, `rationale` `accepted by owner: …`). Verify and `bkit challenge merge` read `build-decision-*.md` and drop accepted items. An accepted challenge task is also ticked `[x]` and its title ends ` — accepted by owner`, so the summary does not count it as unfinished. Group-gate failures are never items.
 - **Accept (assumed):** taken without the owner — `Decision: Accept (assumed) — {reason} ({ask:false|headless}, {RUNTIME}, {date})`. Settled for this build (verify, `acceptedLocations()`, gaps-remediate treat it as accepted), but it is not an acceptance: no `docs/decisions.jsonl` row, no `TEST EXCEPTION`. The build summary lists each one and keeps the verdict at CONCERNS; `/bkit-ship` asks the owner to confirm it (§ `/bkit-ship`, Confirm Assumed Items).
 - **Fix now:** a new task block with `DONE WHEN` + `TEST FIRST` and one `Derived Test Matrix` row per test in it, numbered above the plan's highest task. From verify: inside the paused group when it stays within `bkit.workflows.tasks.maxPerGroup` tasks and `bkit.workflows.tasks.maxTestsPerGroup` tests, else a new group straight after it, every later group renumbered. From holistic, tests or challenge: a new last group. The pause writes no test or fix code: Step 7 writes each test with `@bkit-build-plan-tests`, records its red with `tests red`, and only then writes the fix with `@bkit-build-plan-tasks`. Then `tests plan-check` (non-zero → Failure Path) → Step 7, whose brief picks the group holding the open task → Step 8 → onward. Fix now on a challenge task rewrites that task in place to the owner's direction (its `DONE WHEN`, `TEST FIRST` and `Derived Test Matrix` rows, keeping its number, title, group and meta line), and a challenge-originated fix reaches the challenge reviewers again through Steps 10-11. Each `Fix now` item then gets a `Fix task: {N}` line in the decision file; an item that already has one reuses its task. Step 5 writes that line right after the task block, before `tests plan-check`, so a run stopped between the two finds it on resume. Taken without asking → `Decision: Fix now — recommended; applied without asking ({RUNTIME})`.
@@ -1042,7 +1042,7 @@ Every point where a run can ask the owner has two settings under `package.json`
 
 **Goal:** diagnose and remediate a failing test or CI run, and push the fix back to the adopted branch. With `[repro]`, write a failing test before remediation, including when CI already supplies the failure.
 
-**Evidence selection (Steps 1–2):** parse the named existing branch with `branches parse --workflow=debug`, then adopt it with `worktrees setup --branch` when supplied. Resolve prompt, current human issue text and active status with `runs locate`, validating branch and commit ancestry. Exit 0 selects red CI; exit 1 selects local discovery only after an explicit local choice or a proven no-red result. Exit 80 enters the mapped read fallback and revalidates its normalized evidence; ambiguous or unavailable references and branch conflicts stop before tests or edits. `status meta --ci-selection-file` persists the validated selection atomically and `status route` rederives gates. Resolution runs before downstream resume; a changed `ciGeneration` returns to Step 3 and requires fresh context.
+**Evidence selection (Steps 1–2):** parse the named existing branch with `branches parse --workflow=debug`, then adopt it with `worktrees setup --branch` when supplied. Resolve prompt, current human issue text and active status with `runs locate`, validating branch and commit ancestry. Exit 0 selects red CI; exit 1 selects local discovery only after an explicit local choice or a proven no-red result. Exit 80 enters the mapped read fallback and revalidates its normalized evidence; ambiguous or unavailable references and branch conflicts ask the owner a formatted question (`**Q1 — CI run:**`; an ambiguous branch asks `**Q1 — Branch:**`) before tests or edits, and the answer is written to `{SESSION_DIR}/owner-answer.md` and parsed again. `status meta --ci-selection-file` persists the validated selection atomically and `status route` rederives gates. Resolution runs before downstream resume; a changed `ciGeneration` returns to Step 3 and requires fresh context.
 
 **Selected CI loop:** Step 3 passes saved `--ci-run` / `--ci-url`, records `source: ci` and `ciGeneration`, and does not run a local discovery gate until a matching-generation DONE remediation or soak row exists. Local rounds keep their clamp records; CI evidence rounds have no local clamp. The CI evidence round's `failures` is the selected run's failed job count when `runs locate` read the jobs (capstone left out), else unknown. Step 4 requires freshly checked complete selected-run logs with the matching identity receipt; partial or unavailable evidence stops diagnosis. `[repro]` routes to Step 5 once per generation: YES proceeds directly to Diagnose or Soak; NO blocks resolution. Steps 5–8 carry the selected identity and stamp their rows with `ciGeneration`. At close, every branch, including `main` without a PR, requires the configured gate and selected workflow to pass at the exact head held from the final successful push or dispatch. A missing pushed head stops before success. Original and verifying run links stay separate in the comment and final report. A red, skipped, cancelled, absent or unavailable verification blocks success.
 
diff --git a/.bkit/core/engine/audits/workflows/owner-wait-rows.test.ts b/.bkit/core/engine/audits/workflows/owner-wait-rows.test.ts
index 8e5308659..a96f72fa4 100644
--- a/.bkit/core/engine/audits/workflows/owner-wait-rows.test.ts
+++ b/.bkit/core/engine/audits/workflows/owner-wait-rows.test.ts
@@ -22,8 +22,14 @@ const workflows = fs
   .sort()
   .map((name) => ({ name, content: fs.readFileSync(path.join(WORKFLOWS_DIR, name), "utf-8") }));
 
+const PRE_STATUS_WAIT = "end turn → wait for the answer; no status file yet";
+
 const waits = (content: string) =>
-  content.split("\n").filter((l) => /end turn → wait for (answers|the answer)/.test(l));
+  content
+    .split("\n")
+    .filter(
+      (l) => /end turn → wait for (answers|the answer)/.test(l) && !l.includes(PRE_STATUS_WAIT),
+    );
 
 describe("every owner wait writes owner-pause and owner-answer", () => {
   it("finds the owner waits (not vacuous)", () => {
@@ -58,3 +64,14 @@ describe("every owner wait writes owner-pause and owner-answer", () => {
     });
   }
 });
+
+describe("a wait before the run's status file exists", () => {
+  it("a pre-status wait sits before workflows start and names no owner-pause row", () => {
+    const lines = workflows.find((w) => w.name === "bkit-debug.md")!.content.split("\n");
+    const waitAt = lines.findIndex((l) => l.includes(PRE_STATUS_WAIT));
+    expect(waitAt, "no pre-status wait found in bkit-debug.md").toBeGreaterThanOrEqual(0);
+    const startAt = lines.findIndex((l) => l.includes('"{BKIT}" workflows start'));
+    expect(startAt).toBeGreaterThan(waitAt);
+    expect(lines[waitAt]).not.toContain("owner-pause");
+  });
+});
diff --git a/.bkit/core/engine/audits/workflows/question-option-format.test.ts b/.bkit/core/engine/audits/workflows/question-option-format.test.ts
index 6b99dd0a9..7b2bff39b 100644
--- a/.bkit/core/engine/audits/workflows/question-option-format.test.ts
+++ b/.bkit/core/engine/audits/workflows/question-option-format.test.ts
@@ -650,3 +650,234 @@ describe("question option format: the reply-line clauses reach the workflows", (
     expect(missing).toEqual([]);
   });
 });
+
+/** A workflow's text, read from the workflows directory. */
+const workflow = (name: string) => read(`${WORKFLOWS}/${name}.md`);
+
+/** One numbered step of a section: its first line to the line before the next top-level number. */
+function numberedStep(sectionText: string, n: number): string {
+  const lines = sectionText.split("\n");
+  const start = lines.findIndex((l) => l.startsWith(`${n}. `));
+  if (start < 0) return "";
+  const end = lines.findIndex((l, i) => i > start && /^\d+\. /.test(l));
+  return lines.slice(start, end === -1 ? undefined : end).join("\n");
+}
+
+/** A bullet at one indent: from its first line to the line before the next sibling bullet. */
+function bulletFrom(text: string, start: RegExp, indent: number): string {
+  const lines = text.split("\n");
+  const at = lines.findIndex((l) => start.test(l));
+  if (at < 0) return "";
+  const sibling = new RegExp(`^ {${indent}}- `);
+  const end = lines.findIndex((l, i) => i > at && sibling.test(l));
+  return lines.slice(at, end === -1 ? undefined : end).join("\n");
+}
+
+const countOf = (text: string, needle: string) => text.split(needle).length - 1;
+const STOP_EFFECT = "Stop — the run ends here with a handover; the next run resumes here";
+
+describe("question option format: the build Decision Pause in the shared shape", () => {
+  const pause = () => section(workflow("bkit-build"), /Decision Pause/);
+
+  it("bkit-build: every decision item option carries an effect", () => {
+    const step = numberedStep(pause(), 2);
+    expect(step).toContain('{"name", "effect"}');
+    expect(step).toContain(STOP_EFFECT);
+    expect(step, "a bare-string option list is still named").not.toMatch(/\["Accept", "Fix now"/);
+  });
+
+  it("bkit-build: the pause message shows the default line and Recommended: none", () => {
+    const step = numberedStep(pause(), 4);
+    expect(step).toContain("Default if unanswered:");
+    expect(step).toContain("Recommended:");
+    expect(step).toContain("Recommended: none");
+    expect(step).not.toContain("No recommendation");
+  });
+
+  it("bkit-build: a one-by-one reply asks the questions one at a time", () => {
+    const step = numberedStep(pause(), 4);
+    expect(step).toContain("one by one");
+    expect(step).toMatch(/one by one[^\n]*(?:its own message|one at a time)/);
+  });
+
+  it("bkit-build: the one-by-one offer follows the asked count", () => {
+    const step = numberedStep(pause(), 4);
+    expect(step).toMatch(/one by one[^\n]*3 or more questions|3 or more questions[^\n]*one by one/);
+  });
+});
+
+describe("question option format: the debug questions in the shared shape", () => {
+  const loop = () => numberedStep(section(workflow("bkit-debug"), /Loop Question/), 3);
+  const step1 = () => section(workflow("bkit-debug"), /Step 1 — Start Workflow/);
+  const step2 = () => section(workflow("bkit-debug"), /Step 2 — Worktree Setup/);
+  const branchQuestion = () => bulletFrom(step1(), /Q1 — Branch/, 0) || step1();
+
+  it("bkit-debug: the loop question gives each option its effect and the recommendation a reason", () => {
+    const step = loop();
+    expect(step).not.toContain("Options: A) Stop / B) Try again");
+    expect(step).toContain(`A) ${STOP_EFFECT}`);
+    expect(step).toMatch(/B\) Try again — \S/);
+    expect(step).toMatch(/Recommended: A\) Stop — \S/);
+  });
+
+  it("bkit-debug: the loop question's recommendation reason matches its trigger", () => {
+    const step = loop();
+    expect(step).toMatch(
+      /`LOOP_LIMIT` = true[\s\S]{0,300}?Recommended: A\) Stop — the attempts set aside for this are used up/,
+    );
+    expect(step).toContain("Recommended: A) Stop — the last attempt left no fewer failures");
+  });
+
+  it("bkit-debug: every question shows a Default if unanswered line", () => {
+    expect(loop()).toContain("Default if unanswered: the run waits for you");
+  });
+
+  it("bkit-debug: the branch check asks a formatted question", () => {
+    const text = step1();
+    expect(text).toContain("**Q1 — Branch:**");
+    expect(text).toContain("Name another branch");
+    expect(text).toContain("Stop — nothing changes; the run can be started again");
+    expect(text, "the branch route is still a bare STOP").not.toMatch(
+      /Exit 3 or 8 → \*\*STOP\*\* with the missing or ambiguous branch/,
+    );
+  });
+
+  it("bkit-debug: the CI-run stop asks a formatted question", () => {
+    const text = step2();
+    expect(text).toContain("**Q1 — CI run:**");
+    expect(text).toContain(
+      "Use local discovery — debug runs the tests itself instead of reading CI",
+    );
+    expect(text).toContain(STOP_EFFECT);
+    expect(text).toContain("owner-pause --field=reason=decision");
+  });
+
+  it("bkit-debug: the branch check and CI-run question show Recommended: none and a Default if unanswered line", () => {
+    expect(step1()).toContain("Recommended: none — only you know which branch you meant");
+    expect(step2()).toContain("Recommended: none — only you know which run you meant");
+    const fallback =
+      "Default if unanswered: the run waits for you; the run stops when nobody can be asked";
+    expect(step1()).toContain(fallback);
+    expect(step2()).toContain(fallback);
+  });
+
+  it("bkit-debug: the CI-run question releases the lock only on Stop", () => {
+    const route = bulletFrom(step2(), /\*\*If\*\* exit 8 or 82/, 3);
+    expect(route, "no exit 8 or 82 route found").not.toBe("");
+    const [beforeStop, afterStop] = route.split(/answer is `Stop`/);
+    expect(afterStop, "the route has no Stop answer").toBeDefined();
+    expect(beforeStop).not.toMatch(/release the workflow lock|locks release/);
+    expect(afterStop).toMatch(/locks release/);
+  });
+
+  it("bkit-debug: the foreign-path stop shows the Action needed line", () => {
+    expect(workflow("bkit-debug")).toContain(
+      '**Action needed — Foreign path:** commit or revert {file}. Then say "continue".',
+    );
+  });
+
+  it("bkit-debug: every question message ends with the reply line its point uses", () => {
+    const step1Text = step1();
+    expect(step1Text).toContain(
+      'Reply with a letter per question. "stop" ends here; nothing has changed yet, so the run can be started again.',
+    );
+    expect(step2()).toContain(
+      'Reply with a letter per question. "stop" ends here with a handover; the next run resumes here.',
+    );
+    expect(branchQuestion()).not.toContain('or "yes" to take every recommendation');
+    expect(step2()).not.toContain('or "yes" to take every recommendation');
+    expect(loop()).toContain(
+      'Reply with a letter per question, or "yes" to take every recommendation.',
+    );
+  });
+});
+
+describe("question option format: the ship questions in the shared shape", () => {
+  const assumed = () => section(workflow("bkit-ship"), /Confirm Assumed Items/);
+  const merge = () => section(workflow("bkit-ship"), /Merge Question/);
+
+  it("bkit-ship: the assumed-item question gives each option its effect", () => {
+    const text = assumed();
+    expect(text).not.toContain("Options: A) Confirm / B) Reject");
+    expect(text).toMatch(/A\) Confirm — \S/);
+    expect(text).toMatch(/B\) Reject — \S/);
+  });
+
+  it("bkit-ship: an assumed item is a hard blocker with Recommended: none", () => {
+    const text = assumed();
+    expect(text).toContain("Recommended: none — only you can accept it");
+    expect(text).not.toContain("No recommendation");
+  });
+
+  it("bkit-ship: every question shows a Default if unanswered line", () => {
+    expect(assumed()).toContain("Default if unanswered: written as a needs-decision deferral");
+    expect(merge()).toContain("Default if unanswered: the run waits for you");
+  });
+
+  it("bkit-ship: the merge question gives each option its effect", () => {
+    const text = merge();
+    expect(text).not.toContain("Options: A) Stop / B) Try again");
+    expect(text).toContain(`A) ${STOP_EFFECT}`);
+    expect(text).toMatch(/B\) Try again — \S/);
+  });
+
+  it("bkit-ship: every question message ends with the reply line its point uses", () => {
+    expect(assumed()).not.toContain("Reply per question. Ship merges either way");
+    expect(assumed()).toContain("Reply with a letter per question");
+    expect(merge()).toContain(
+      'Reply with a letter per question, or "yes" to take every recommendation.',
+    );
+  });
+});
+
+describe("question option format: the design questions in the shared shape", () => {
+  const grill = () => section(workflow("bkit-design"), /Step 3 — Grill/);
+  const oneByOneLine = (name: string) =>
+    workflow(name)
+      .split("\n")
+      .find((l) => /^7\. \*\*If\*\* user requests the open questions one by one/.test(l)) ?? "";
+
+  it("bkit-design: the grill question gives each option its effect and the recommendation a reason", () => {
+    const text = grill();
+    expect(text).toMatch(/A\) \{[^}]*\} — \{[^}]*\}/);
+    expect(text).toContain("Recommended: A) {answer} — {why}");
+  });
+
+  it("bkit-design: the draft-scenario question gives each option its effect", () => {
+    const text = grill();
+    expect(text).not.toContain("Options: A) yes / B) no");
+    expect(text).toContain("A) Yes — the draft becomes the design's starting point");
+    expect(text).toContain("B) No — the draft is revised from your reply before the design starts");
+    expect(text).toMatch(/Recommended: A\) Yes — \S/);
+  });
+
+  it("bkit-design: every question shows a Default if unanswered line", () => {
+    expect(countOf(grill(), "Default if unanswered: the design assumes A")).toBeGreaterThanOrEqual(
+      2,
+    );
+  });
+
+  it("bkit-design: the grill message ends with the reply line and the one-by-one offer", () => {
+    const text = grill();
+    expect(text).toMatch(/Reply with a letter per question[^\n]*"stop"/);
+    expect(text).toContain("one by one");
+  });
+
+  it("bkit-design: a one-by-one grill round counts as one grill turn", () => {
+    expect(grill()).toMatch(/one by one[^\n]*GRILL_TURNS|GRILL_TURNS[^\n]*one by one/);
+  });
+
+  it("the one-by-one open-questions pass forbids the host question tool in design and plan", () => {
+    for (const name of ["bkit-design", "bkit-plan"]) {
+      const line = oneByOneLine(name);
+      expect(line, `${name}: no one-by-one step found`).not.toBe("");
+      expect(line, `${name} does not forbid the host question tool`).toContain(
+        "not through a host question tool",
+      );
+      expect(line, `${name} still asks the item verbatim`).not.toContain("verbatim");
+      expect(line).toContain(
+        "keeping its options, `Recommended` and `Default if unanswered` as written",
+      );
+    }
+  });
+});
diff --git a/.bkit/core/engine/audits/workflows/workflow-shape.test.ts b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
index 4b0ec60db..5d4190461 100644
--- a/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
+++ b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
@@ -2086,7 +2086,7 @@ describe("debug on dev", () => {
     const line = debug.split("\n").find((l) => l.includes("**Foreign path:**"));
     expect(line, "no Foreign path line").toBeDefined();
     expect(line).toContain("**STOP**");
-    expect(line).toContain("ask the human");
+    expect(line).toContain("**Action needed — Foreign path:**");
     expect(line).not.toMatch(/→ \*\*Failure Path\*\*/);
   });
 });
@@ -2145,10 +2145,12 @@ describe("fix loops ask only when the last round made no progress", () => {
   it("debug Loop Question states the engine's trend line, never a fixed claim", () => {
     const loop = section(workflow("debug"), /Loop Question/);
     expect(loop).toContain("`trendLine` as `LOOP_TREND_LINE`");
-    expect(loop).not.toContain("left no fewer failures");
     const questions = loop.split("\n").filter((l) => l.includes("**Q1 — "));
     expect(questions.length).toBeGreaterThanOrEqual(4);
-    for (const q of questions) expect(q, q).toContain("{LOOP_TREND_LINE}");
+    for (const q of questions) {
+      expect(q, q).toContain("{LOOP_TREND_LINE}");
+      expect(q, q).not.toContain("left no fewer failures");
+    }
     expect(loop).toMatch(/taken without asking \([^\n]*\{LOOP_TREND_LINE\}/);
   });
 
@@ -2157,7 +2159,7 @@ describe("fix loops ask only when the last round made no progress", () => {
     expect(loop).toMatch(
       /`LOOP_LIMIT` = true.*\*\*Q1 — Soak:\*\* The soak attempts are used up[^\n]*\{LOOP_TREND_LINE\}/,
     );
-    expect(loop).toContain("`Recommended: A) Stop`");
+    expect(loop).toContain("`Recommended: A) Stop — the attempts set aside for this are used up`");
   });
 
   it("ship asks the Merge Question only when the merge attempts are used up", () => {
diff --git a/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt b/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt
index 875b371ca..bb307be28 100644
--- a/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt
+++ b/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt
@@ -110,21 +110,21 @@ _No tracker connected, skip step._
    "{BKIT}" counters derive --file="{STATUS}" --workflow=build --step=build-decision --position=next
    ```
    Hold `value` as `DECISION`.
-2. Write `{OUTBOX}/decision-items.json` = one JSON object per item, in item order — `{"title", "question", "options", "recommended", "reason"}`, or a hard blocker `{"title", "question", "options", "noRecommendation"}` (why no agent can settle it); never a recommendation on a hard blocker. Per `question`: word each so "yes" accepts the recommendation. State what the owner must decide, what each option does and the reason for the recommendation, in plain English, before naming any file, test or identifier. Items:
+2. Write `{OUTBOX}/decision-items.json` = one JSON object per item, in item order — `{"title", "question", "options", "recommended", "reason"}`, or a hard blocker `{"title", "question", "options", "noRecommendation"}` (why no agent can settle it); never a recommendation on a hard blocker. Each option is `{"name", "effect"}`: `name` is the bare option name and `effect` says what happens if the owner picks it. The default effects are `Accept` = `the item is recorded as accepted and the build moves on`, `Fix now` = `one more fix round runs before the build moves on` and `Stop` = `Stop — the run ends here with a handover; the next run resumes here`, each sharpened to the item when that helps. Per `question`: word each so "yes" accepts the recommendation. State what the owner must decide, what each option does and the reason for the recommendation, in plain English, before naming any file, test or identifier. Items:
    - **If** `PAUSE_QUESTION` = `VERIFY_GAPS` **and** `PAUSE_STEP` = 10 → write one item per `Identified Gaps Log` line of `build-plan-verify-holistic-{HOLISTIC_ATTEMPT}.md`. Add the gap's last `BLOCKED` reason from `build-plan-gaps-remediate-holistic-*-log.md` when it has one.
    - **If** `PAUSE_QUESTION` = `VERIFY_GAPS` → write one item per `Identified Gaps Log` line of `build-plan-verify-{GROUP}-{VERIFY_ATTEMPT}.md`. Add the gap's last `BLOCKED` reason from `build-plan-gaps-remediate-{GROUP}-*-log.md` when it has one.
    - For either `VERIFY_GAPS` list:
-     - A fixable gap → options `["Accept", "Fix now"]`, with a recommendation per item.
-     - Any unfixable gap (`no-test-first`, `test-first-malformed`, `test-first-unread`, `exception-refused`, `test-loosened`, or a holistic gap, logged `Fixable: false`) → a hard blocker with options `["Accept", "Fix now", "Stop"]`.
+     - A fixable gap → options `Accept` and `Fix now`, with a recommendation per item.
+     - Any unfixable gap (`no-test-first`, `test-first-malformed`, `test-first-unread`, `exception-refused`, `test-loosened`, or a holistic gap, logged `Fixable: false`) → a hard blocker with options `Accept`, `Fix now` and `Stop`.
      - A group-gate failure is never an item: no item option can settle it, and the loop question carries it.
    - **If** `PAUSE_QUESTION` = `CHALLENGE`:
      - **If** `CHALLENGE_OVERFLOW` is set → the merge wrote nothing to the plan. Write one item per `Location` of each `CRITICAL`, `HIGH` or `MEDIUM` finding in the merged reports: `build-challenge-2.md`, plus `build-challenge-1.md` when the change is large.
      - **Else** → write one item per task of `CHALLENGE_TASKS` whose block in the plan says `**Fixable:** false`, at any severity.
      - Title each item with its task number, when it has one, followed by its `Location` in brackets.
-     - **If** the item is `**Fixable:** false` → a hard blocker with options `["Accept", "Fix now", "Stop"]`.
-     - **Else** → options `["Accept", "Fix now"]`, with a recommendation per finding.
+     - **If** the item is `**Fixable:** false` → a hard blocker with options `Accept`, `Fix now` and `Stop`.
+     - **Else** → options `Accept` and `Fix now`, with a recommendation per finding.
    - **If** `PAUSE_QUESTION` = `TESTS_LOOP` → write no items: a failing suite test is never an item, and the loop question carries it.
-   - **If** `PAUSE_QUESTION` = `UNPROVEN` → write one item per entry of `UNPROVEN_TESTS`, titled with its task number and test name. Each item is a planned test that never failed before its code existed, so nothing shows it can catch the bug it was written for. Options `["Accept", "Stop"]`, recommended `Accept`. Its question ends `Accept it? You write the reason, and it is recorded as your TEST EXCEPTION.`
+   - **If** `PAUSE_QUESTION` = `UNPROVEN` → write one item per entry of `UNPROVEN_TESTS`, titled with its task number and test name. Each item is a planned test that never failed before its code existed, so nothing shows it can catch the bug it was written for. Options `Accept` and `Stop`, recommended `Accept`. Its question ends `Accept it? You write the reason, and it is recorded as your TEST EXCEPTION.`
 
    Check a red gate against the base commit, the commit the branch started from. **If** `PAUSE_QUESTION` = `TESTS_LOOP` **or** `GATE_VERDICT` = FAIL → `GATE_LOG` = `{OUTBOX}/run-tests-{TEST_ATTEMPT}.log` for `TESTS_LOOP`, else `{OUTBOX}/build-group-gate-{GROUP}-{VERIFY_ATTEMPT}.log`:
 
@@ -163,10 +163,10 @@ _No tracker connected, skip step._
    - **If** exit 4 → step 4, asking only the printed `hardBlockers` questions.
    - **Else** → **Failure Path**.
 4. Ask the owner in this session; NEVER hand questions or acceptances to subagents:
-   - One message = the attempt line and `## Progress` block (loop questions only), then each `Q{n}` question still without a `Decision:` line, each with its lettered `Options:` and `Recommended:` / `No recommendation` lines, then the file's last line; plain text, not through a host question tool.
+   - One message = the attempt line and `## Progress` block (loop questions only), then each `Q{n}` question still without a `Decision:` line, each with its option lines, its `Recommended:` line (`Recommended: none — {why}` on a hard blocker) and its `Default if unanswered:` line, then the file's last line; plain text, not through a host question tool.
    - Offer only the file's options for each question; NEVER add an `Accept` or any other option the file does not list.
    - Look up facts in the repo, docs and tools, and never ask the owner for them.
-   - Decide nothing on the owner's behalf. Reply with a letter per question, or "yes" to take every recommendation. "yes" never answers a `No recommendation` question. Narrate `Decision pause {DECISION}: {count} question(s)` → record the wait → end turn → wait for answers:
+   - Decide nothing on the owner's behalf. Reply with a letter per question, or "yes" to take every recommendation. "yes" never answers a `Recommended: none — {why}` question. Show the `Or say "one by one" and I'll ask them one at a time.` line only when the message asks 3 or more questions (after a headless apply it asks only the `hardBlockers` subset). **If** the owner replies "one by one" → ask each unanswered question in its own message, per § Human questions. Narrate `Decision pause {DECISION}: {count} question(s)` → record the wait → end turn → wait for answers:
      ```bash
      "{BKIT}" status row --file="{STATUS}" --workflow=build --type=owner-pause --field=reason=decision >/dev/null || exit 1
      ```
diff --git a/.bkit/core/engine/render/__snapshots__/bkit-debug.none.txt b/.bkit/core/engine/render/__snapshots__/bkit-debug.none.txt
index 108dadd32..8518351ba 100644
--- a/.bkit/core/engine/render/__snapshots__/bkit-debug.none.txt
+++ b/.bkit/core/engine/render/__snapshots__/bkit-debug.none.txt
@@ -51,7 +51,7 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
 - **Locks:** Step 1 takes `$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.lock` with `bkit locks acquire --kind=workflow` (hold `token`); Close Workflow and Failure Path release it and exit non-zero while it is still present. **If** existing lock — its owning workflow's folded status.jsonl decides: `IN_PROGRESS` and last step <30min idle → **Failure Path**; any other holder (`DONE`, `FAILED`, `IN_PROGRESS` idle >=30min, no run) → reclaimed.
 - **Status branch:** status.jsonl committed on the adopted branch `{BRANCH}` (`{STATUS}`, held from Step 2); per-step commits, no pushes.
 - **Worktrees:** Debug NEVER creates a branch. Step 2 resumes `.worktrees/{FID}`; **Else** → adopts an existing `feat/{FID}` (local or origin, not the session's own branch) into it when the runtime mints worktrees; **Else** → adopts the session's current branch in place (`worktreePath` = main checkout); no `-b`. `main` is the one ineligible branch. cwd persists across subsequent Bash calls. **If** steps ever find `pwd` != `{WORKTREE_PATH}` → **Failure Path**.
-- **Foreign path:** Exit 10 from `steps finish` or `workflows close` on `dev` = a file the run commits was modified before the run; nothing written → **STOP**; ask the human to commit or revert the named file, record the wait with `"{BKIT}" status row --file="{STATUS}" --workflow=debug --type=owner-pause --field=reason=foreign-path` → end turn; on the reply, record it first with `"{BKIT}" status row --file="{STATUS}" --workflow=debug --type=owner-answer` → re-run the block; NEVER the **Failure Path**.
+- **Foreign path:** Exit 10 from `steps finish` or `workflows close` on `dev` = a file the run commits was modified before the run; nothing written → **STOP**; write `**Action needed — Foreign path:** commit or revert {file}. Then say "continue".` with the named file, record the wait with `"{BKIT}" status row --file="{STATUS}" --workflow=debug --type=owner-pause --field=reason=foreign-path` → end turn; on the reply, record it first with `"{BKIT}" status row --file="{STATUS}" --workflow=debug --type=owner-answer` → re-run the block; NEVER the **Failure Path**.
 - **gh MCP fallback:** `gh` primary for PR / CI / merge surface. **If** a command exits 80, **or** `runtimeGithubCli` = false in the `runtime-resolved` row of `{STATUS}` → use mapped MCP tool (needs `actions` toolset in `.mcp.json`): `bkit prs open` / `bkit branches land` stage `open` → `create_pull_request` with the printed `title` / `base` / `head` and the content of the printed `bodyFile` as `body`, byte-for-byte; `bkit prs probe --number` → `pull_request_read` (`get`, minimal fields); `bkit prs probe --head` / `bkit workflows handover --push` → `list_pull_requests`; `bkit prs merge` / `bkit branches land` stage `merge` → `merge_pull_request` (printed skip-token-free `subject` as `commit_message`, empty body; `--match-head` SHA as `sha`); `bkit prs verbose-ci` → `update_pull_request`; `bkit prs update-branch --number` → `update_pull_request_branch`; `bkit prs checks --number` → `pull_request_read` (`get_check_runs`, the check-run conclusions for the PR head; or `actions_list` runs for the head SHA), never `get_status`; `bkit runs wait` / `bkit runs dispatch` / `bkit runs revalidate` / `bkit runs gate` → `actions_list`; `gh run view {id} --json jobs` → `actions_get`; `gh run view --log-failed` → `get_job_logs` (`failed_only=true`). Max 1 transition per run, recorded as a `transport-fallback` row via `bkit prs transport-row --file={STATUS} --kind=fallback --from=<gh command> --to=<MCP tool> --reason=<why> --asserted-by=<re-read>` — **Skip if** `{STATUS}` not set. Tracker reads and writes go through `bkit` verbs; the tracker MCP ONLY when a verb prints `tracker.done: false` or exits 80.
 
 _No tracker connected, skip step._
@@ -114,7 +114,15 @@ _No tracker connected, skip step._
      - **If** `LOOP_POINT` = `fix` → `**Q1 — Fix:** {LOOP_TREND_LINE} Stop here instead of trying again?`.
      - **If** `LOOP_POINT` = `soak` **and** `{LOOP_ATTEMPT}` = 1 → `**Q1 — Soak:** The fix attempts are used up. {LOOP_TREND_LINE} Stop here instead of starting soak (a slower, step-by-step investigation)?`.
      - **Else** → `**Q1 — Soak:** {LOOP_TREND_LINE} Stop here instead of trying again?`.
-   - `Options: A) Stop / B) Try again`, then `Recommended: A) Stop`.
+   - The two answers, one per line:
+     ```text
+     A) Stop — the run ends here with a handover; the next run resumes here
+     B) Try again — one more attempt runs
+     ```
+   - The recommendation, first match wins:
+     - **If** `LOOP_LIMIT` = true → `Recommended: A) Stop — the attempts set aside for this are used up`.
+     - **Else** → `Recommended: A) Stop — the last attempt left no fewer failures`.
+   - `Default if unanswered: the run waits for you`.
    - The line `Reply with a letter per question, or "yes" to take every recommendation. "stop" ends here with a handover; the next run resumes here.`
      Record the wait → end turn → wait for the answer:
    ```bash
@@ -170,7 +178,16 @@ _No tracker connected, skip step._
    ```bash
    "{BKIT}" branches parse --workflow=debug --prompt-file="{SESSION_DIR}/prompt.md"
    ```
-   Hold `branch` as `NAMED_BRANCH`; `{BRANCH_FLAG}` = `--branch="{NAMED_BRANCH}"` when non-null, else empty. Exit 3 or 8 → **STOP** with the missing or ambiguous branch and ask the owner to name one existing branch; no tests or edits.
+   Hold `branch` as `NAMED_BRANCH`; `{BRANCH_FLAG}` = `--branch="{NAMED_BRANCH}"` when non-null, else empty. **If** exit 3 or 8 → ask the owner in this session; plain text, not through a host question tool. One message, no tests or edits:
+   - `**Q1 — Branch:** {the missing or ambiguous branch the engine printed}. Which existing branch did you mean?`
+   - One option line per printed candidate (`Use branch {x} — debug adopts {x} and runs its tests there`), then `Name another branch — reply with its name` and `Stop — nothing changes; the run can be started again`, lettered in that order.
+   - `Recommended: none — only you know which branch you meant`.
+   - `Default if unanswered: the run waits for you; the run stops when nobody can be asked`.
+   - The line `Reply with a letter per question. "stop" ends here; nothing has changed yet, so the run can be started again.`
+   - Write no status row (none exists yet); end turn → wait for the answer; no status file yet.
+   - On the reply, write `branch={x}` with the file-write tool to `{SESSION_DIR}/owner-answer.md` and re-run `branches parse` on it with `--prompt-file="{SESSION_DIR}/owner-answer.md"`.
+   - A reply that names a letter (`B`, `B)` or `B) {option}`) means the option that letter labels.
+   - **If** the answer is `Stop` → **STOP**, no further downstream steps; never the **Failure Path**.
    Log `Tracker not wired — proceeding without issue ID.`
 3.
    No tracker wired → `STATE`, `LABELS`, `DESCRIPTION`, `COMMENTS` all empty; input artifact built from session prompt alone.
@@ -268,7 +285,17 @@ _No tracker connected, skip step._
    - **If** exit 0 → hold `runId` as `CI_RUN_ID`, `runUrl` as `CI_RUN_URL`, `runAttempt` as `CI_RUN_ATTEMPT`, `workflowId` as `CI_WORKFLOW_ID`, `workflowPath` as `CI_WORKFLOW_PATH`, `headSha` as `CI_HEAD_SHA`.
    - **If** exit 1 → the validated selection explicitly chooses local discovery or proves no red run; clear the held CI identity.
    - **If** exit 80 → use the existing mapped metadata/jobs read fallback, retaining the printed request identity, exact repository, attempt, workflow and commit. Write its normalized `request`, `run`, complete `jobs` and `complete: true` to `{OUTBOX}/ci-evidence.json`; rerun the same `runs locate` command with `--evidence-file="{OUTBOX}/ci-evidence.json"`. Record the transport with `prs transport-row`. Never substitute local discovery for unavailable reads.
-   - **If** exit 8 or 82 → record `status row --file="{STATUS}" --workflow=debug --type=owner-pause --field=reason=decision`, release the workflow lock, and **STOP**, naming the ambiguous references, branch conflict or unavailable evidence and its reference. Record `owner-answer` before retrying after an owner reply.
+   - **If** exit 8 or 82 → ask the owner in this session; plain text, not through a host question tool. One message, `**Q1 — CI run:**` with the engine's message carried word for word (it names the ambiguous references, the branch conflict such as `Supply branch={x} in its checkout`, or the unavailable evidence and its reference):
+     - One option line per printed candidate reference: `A) Use {reference} — debug reads that run's failures instead of running the tests itself`. Exit 82 with no candidate lists none.
+     - Then `Use local discovery — debug runs the tests itself instead of reading CI` and `Stop — the run ends here with a handover; the next run resumes here`, lettered after the candidates.
+     - `Recommended: none — only you know which run you meant`.
+     - `Default if unanswered: the run waits for you; the run stops when nobody can be asked`.
+     - The line `Reply with a letter per question. "stop" ends here with a handover; the next run resumes here.`
+     - Record the wait with `status row --file="{STATUS}" --workflow=debug --type=owner-pause --field=reason=decision` → end turn → wait for the answer. The workflow lock stays held while the owner answers.
+     - Record `status row --file="{STATUS}" --workflow=debug --type=owner-answer` first. A reply that names a letter (`B`, `B)` or `B) {option}`) means the option that letter labels.
+     - **If** the answer is `Stop` → release the workflow lock (`locks release --kind=workflow --workflow=debug --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN}`) → **STOP**, no further downstream steps.
+     - **If** the answer is `Use local discovery` → treat the run as exit 1: local discovery, no CI identity.
+     - **Else** the answer names a reference → write it with the file-write tool to `{SESSION_DIR}/owner-answer.md` and re-run `runs locate` with `--prompt-file="{SESSION_DIR}/owner-answer.md"`, the other flags as above → route the new exit code again.
    - **Else**, or fallback still unavailable → **Failure Path** with the unresolved evidence reference.
      Persist only the validated file, then rederive gates and current-generation state:
    ```bash
diff --git a/.bkit/core/engine/render/__snapshots__/bkit-design.none.txt b/.bkit/core/engine/render/__snapshots__/bkit-design.none.txt
index a159834ec..a8879791f 100644
--- a/.bkit/core/engine/render/__snapshots__/bkit-design.none.txt
+++ b/.bkit/core/engine/render/__snapshots__/bkit-design.none.txt
@@ -196,12 +196,13 @@ _No tracker connected, skip step._
    - Map the open decisions as a tree: each decision branches into the decisions that depend on it. The frontier is every unsettled decision whose prerequisites are settled.
    - Ask the whole frontier as one turn, in one message. A question that depends on another in the same turn waits for a later turn.
    - For each question:
-     - Write `**Q{n} — {title}:** {question}` and its options lettered `A)`, `B)`, `C)`, then `Recommended: A) {answer}` on its own line.
+     - Write `**Q{n} — {title}:** {question}`, then one option per line, lettered `A)`, `B)`, `C)` (`A) {option} — {what happens if you pick it}`), then `Recommended: A) {answer} — {why}` and `Default if unanswered: the design assumes A`, each on its own line.
      - Number the questions from `Q1` across turns, and word each so "yes" accepts the recommendation.
      - Ask in plain text, not through a host question tool.
      - State what the owner must decide, what each option does and the reason for the recommendation, in plain English, before naming any file, test or identifier.
    - Look up facts in the repo, docs and tools, and never ask the owner for them. Pending lookups hold back only the questions that depend on them.
    - Decide nothing on the owner's behalf.
+   - End the turn's message with the line `Reply with a letter per question, or "yes" to take every recommendation. "stop" ends the interview; the design goes on with what is settled.` Add `Or say "one by one" and I'll ask them one at a time.` when the turn asks 3 or more questions. **If** the owner replies "one by one" → ask each question of the turn in its own message; the whole round counts as the single turn of `GRILL_TURNS` it replaces.
    - Narrate `design grill: turn {k} of {GRILL_TURNS}` → record the wait → end turn → wait for answers:
      ```bash
      "{BKIT}" status row --file="{STATUS}" --workflow=design --type=owner-pause --field=reason=grill >/dev/null || exit 1
@@ -222,7 +223,7 @@ _No tracker connected, skip step._
      - `Process Sketch` — 3-7 `WHEN X → THEN Y` lines with the same examples: outcomes, not implementation steps.
    - Show the whole draft.
    - Then ask one question per item the draft inferred instead of taking it from the context or an answer, in the step 2 format, with the recommended answer = as drafted.
-   - Ask last: `**Q{n} — Draft acceptance scenario:** accept the draft with the answers above as the design's starting point?` with `Options: A) yes / B) no` and `Recommended: A) yes`.
+   - Ask last: `**Q{n} — Draft acceptance scenario:** accept the draft with the answers above as the design's starting point?` with the option lines `A) Yes — the draft becomes the design's starting point` and `B) No — the draft is revised from your reply before the design starts`, then `Recommended: A) Yes — {why}` and `Default if unanswered: the design assumes A`.
    - Narrate `design grill: turn {k} of {GRILL_TURNS} — draft acceptance scenario` → record the wait (step 2 block with `reason=draft`) → end turn → wait for answers.
    - Record each reply per step 2.
    - Fold the answers into the draft. Route:
@@ -483,7 +484,7 @@ _No tracker connected, skip step._
 4.
 5. Final return: display `{FINAL_RETURN}` verbatim as the final message to the user; do not summarise or trim; do not auto-invoke. **HARD STOP** — do not invoke `/bkit-plan`.
 6. **If** user requests plain English explanation → restate the summary in plain English; name terms and say what they mean; identifiers stay verbatim; plainness lives in sentences, not nouns; do not re-run any step.
-7. **If** user requests the open questions one by one → ask each `Open Questions` item on its own, verbatim, with its options lettered `A)`, `B)`, `C)`, `Recommended` and `Default if unanswered`; wait for the answer before asking the next; do not re-run any step.
+7. **If** user requests the open questions one by one → ask each `Open Questions` item on its own, in the shared question shape, in plain text, not through a host question tool, keeping its options, `Recommended` and `Default if unanswered` as written; wait for the answer before asking the next; do not re-run any step.
 8. **If** the user answers one or more `Open Questions` items (in the one-by-one pass, once its last question is answered, or in any chat message) → record the round in this order:
    - Obtain the round's invocation id and keep the printed `invocation` as `INVOCATION`:
      ```bash
diff --git a/.bkit/core/engine/render/__snapshots__/bkit-plan.none.txt b/.bkit/core/engine/render/__snapshots__/bkit-plan.none.txt
index fee52c32b..ffd48a47c 100644
--- a/.bkit/core/engine/render/__snapshots__/bkit-plan.none.txt
+++ b/.bkit/core/engine/render/__snapshots__/bkit-plan.none.txt
@@ -419,7 +419,7 @@ Before generating, ask the engine for this step's invocation id and keep the pri
 4.
 5. Final return: display `{FINAL_RETURN}` verbatim as the final message to the user; do not summarise or trim; do not auto-invoke. **HARD STOP** — do not invoke `/bkit-build`.
 6. **If** user requests plain English explanation → restate the summary in plain English; name terms and say what they mean; identifiers stay verbatim; plainness lives in sentences, not nouns; do not re-run any step.
-7. **If** user requests the open questions one by one → ask each `Open Questions` item on its own, verbatim, with its options lettered `A)`, `B)`, `C)`, `Recommended` and `Default if unanswered`; wait for the answer before asking the next; do not re-run any step. State what the owner must decide, what each option does and the reason for the recommendation, in plain English, before naming any file, test or identifier.
+7. **If** user requests the open questions one by one → ask each `Open Questions` item on its own, in the shared question shape, in plain text, not through a host question tool, keeping its options, `Recommended` and `Default if unanswered` as written; wait for the answer before asking the next; do not re-run any step. State what the owner must decide, what each option does and the reason for the recommendation, in plain English, before naming any file, test or identifier.
 8. **If** the user answers one or more `Open Questions` items (in the one-by-one pass, once its last question is answered, or in any chat message) → record the round in this order:
    - Obtain the round's invocation id and keep the printed `invocation` as `INVOCATION`:
      ```bash
diff --git a/.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt b/.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt
index c3bca8a26..980c42b3e 100644
--- a/.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt
+++ b/.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt
@@ -304,8 +304,11 @@ _No tracker connected, skip step._
    - **If** `RUNTIME_HEADLESS` = true → step 4, since there is no one to ask.
    - **Else** → step 2.
 2. Ask the owner in this session. Write in plain text, not through a host question tool. NEVER hand the questions to subagents. State what the owner must decide, what each option does and the reason for the recommendation, in plain English, before naming any file, test or identifier. Send one message:
-   - For each entry of `ASSUMED_ITEMS`, in order, numbered from 1: `**Q{n} — {title}:** accepted without you during build ({reason}). Confirm it?`, then `Options: A) Confirm / B) Reject`, then `No recommendation — only you can accept it`.
-   - End the message with the line `Reply per question. Ship merges either way; anything not confirmed is written as a needs-decision deferral.`
+   - For each entry of `ASSUMED_ITEMS`, in order, numbered from 1: `**Q{n} — {title}:** accepted without you during build ({reason}). Confirm it?`, then the option lines, each on its own line:
+     A) Confirm — the accept is recorded as yours, as a decision row
+     B) Reject — the item is written as a needs-decision deferral
+   - Then `Recommended: none — only you can accept it`, then `Default if unanswered: written as a needs-decision deferral`.
+   - End the message with the line `Reply with a letter per question. Ship merges either way; anything you do not confirm is written as a needs-decision deferral.`
 
    Then record the wait → end turn → wait for answers:
 
@@ -733,7 +736,12 @@ Asked from Step 9 or Step 10 when `ship.merge.maxAttempts` is used up (`LIMIT_NE
 
 1. Ask the human in this session, in plain text, in one message:
    - `ship merge: attempt {MERGE_ROUNDS} of {MERGE_MAX}`, then `**Q1 — Merge:** The merge attempts are used up ({the last refusal or failure in one line}). Stop here instead of trying one more set of attempts?`
-   - `Options: A) Stop / B) Try again`, then `Recommended: A) Stop — {reason}`.
+   - The merge options:
+     ```text
+     A) Stop — the run ends here with a handover; the next run resumes here
+     B) Try again — one more set of merge attempts runs
+     ```
+   - Then `Recommended: A) Stop — {reason}`, then `Default if unanswered: the run waits for you`.
    - End the message with the line `Reply with a letter per question, or "yes" to take every recommendation. "stop" ends here with a handover; the next run resumes here.`
 
    Record the wait → end turn → wait for the answer:
diff --git a/.bkit/core/workflows/bkit-build.md b/.bkit/core/workflows/bkit-build.md
index fc0c705f4..cdfd54981 100644
--- a/.bkit/core/workflows/bkit-build.md
+++ b/.bkit/core/workflows/bkit-build.md
@@ -137,21 +137,21 @@ description: "Build Feature — Autonomous implementation"
    "{BKIT}" counters derive --file="{STATUS}" --workflow=build --step=build-decision --position=next
    ```
    Hold `value` as `DECISION`.
-2. Write `{OUTBOX}/decision-items.json` = one JSON object per item, in item order — `{"title", "question", "options", "recommended", "reason"}`, or a hard blocker `{"title", "question", "options", "noRecommendation"}` (why no agent can settle it); never a recommendation on a hard blocker. Per `question`: word each so "yes" accepts the recommendation. State what the owner must decide, what each option does and the reason for the recommendation, in plain English, before naming any file, test or identifier. Items:
+2. Write `{OUTBOX}/decision-items.json` = one JSON object per item, in item order — `{"title", "question", "options", "recommended", "reason"}`, or a hard blocker `{"title", "question", "options", "noRecommendation"}` (why no agent can settle it); never a recommendation on a hard blocker. Each option is `{"name", "effect"}`: `name` is the bare option name and `effect` says what happens if the owner picks it. The default effects are `Accept` = `the item is recorded as accepted and the build moves on`, `Fix now` = `one more fix round runs before the build moves on` and `Stop` = `Stop — the run ends here with a handover; the next run resumes here`, each sharpened to the item when that helps. Per `question`: word each so "yes" accepts the recommendation. State what the owner must decide, what each option does and the reason for the recommendation, in plain English, before naming any file, test or identifier. Items:
    - **If** `PAUSE_QUESTION` = `VERIFY_GAPS` **and** `PAUSE_STEP` = 10 → write one item per `Identified Gaps Log` line of `build-plan-verify-holistic-{HOLISTIC_ATTEMPT}.md`. Add the gap's last `BLOCKED` reason from `build-plan-gaps-remediate-holistic-*-log.md` when it has one.
    - **If** `PAUSE_QUESTION` = `VERIFY_GAPS` → write one item per `Identified Gaps Log` line of `build-plan-verify-{GROUP}-{VERIFY_ATTEMPT}.md`. Add the gap's last `BLOCKED` reason from `build-plan-gaps-remediate-{GROUP}-*-log.md` when it has one.
    - For either `VERIFY_GAPS` list:
-     - A fixable gap → options `["Accept", "Fix now"]`, with a recommendation per item.
-     - Any unfixable gap (`no-test-first`, `test-first-malformed`, `test-first-unread`, `exception-refused`, `test-loosened`, or a holistic gap, logged `Fixable: false`) → a hard blocker with options `["Accept", "Fix now", "Stop"]`.
+     - A fixable gap → options `Accept` and `Fix now`, with a recommendation per item.
+     - Any unfixable gap (`no-test-first`, `test-first-malformed`, `test-first-unread`, `exception-refused`, `test-loosened`, or a holistic gap, logged `Fixable: false`) → a hard blocker with options `Accept`, `Fix now` and `Stop`.
      - A group-gate failure is never an item: no item option can settle it, and the loop question carries it.
    - **If** `PAUSE_QUESTION` = `CHALLENGE`:
      - **If** `CHALLENGE_OVERFLOW` is set → the merge wrote nothing to the plan. Write one item per `Location` of each `CRITICAL`, `HIGH` or `MEDIUM` finding in the merged reports: `build-challenge-2.md`, plus `build-challenge-1.md` when the change is large.
      - **Else** → write one item per task of `CHALLENGE_TASKS` whose block in the plan says `**Fixable:** false`, at any severity.
      - Title each item with its task number, when it has one, followed by its `Location` in brackets.
-     - **If** the item is `**Fixable:** false` → a hard blocker with options `["Accept", "Fix now", "Stop"]`.
-     - **Else** → options `["Accept", "Fix now"]`, with a recommendation per finding.
+     - **If** the item is `**Fixable:** false` → a hard blocker with options `Accept`, `Fix now` and `Stop`.
+     - **Else** → options `Accept` and `Fix now`, with a recommendation per finding.
    - **If** `PAUSE_QUESTION` = `TESTS_LOOP` → write no items: a failing suite test is never an item, and the loop question carries it.
-   - **If** `PAUSE_QUESTION` = `UNPROVEN` → write one item per entry of `UNPROVEN_TESTS`, titled with its task number and test name. Each item is a planned test that never failed before its code existed, so nothing shows it can catch the bug it was written for. Options `["Accept", "Stop"]`, recommended `Accept`. Its question ends `Accept it? You write the reason, and it is recorded as your TEST EXCEPTION.`
+   - **If** `PAUSE_QUESTION` = `UNPROVEN` → write one item per entry of `UNPROVEN_TESTS`, titled with its task number and test name. Each item is a planned test that never failed before its code existed, so nothing shows it can catch the bug it was written for. Options `Accept` and `Stop`, recommended `Accept`. Its question ends `Accept it? You write the reason, and it is recorded as your TEST EXCEPTION.`
 
    Check a red gate against the base commit, the commit the branch started from. **If** `PAUSE_QUESTION` = `TESTS_LOOP` **or** `GATE_VERDICT` = FAIL → `GATE_LOG` = `{OUTBOX}/run-tests-{TEST_ATTEMPT}.log` for `TESTS_LOOP`, else `{OUTBOX}/build-group-gate-{GROUP}-{VERIFY_ATTEMPT}.log`:
 
@@ -190,10 +190,10 @@ description: "Build Feature — Autonomous implementation"
    - **If** exit 4 → step 4, asking only the printed `hardBlockers` questions.
    - **Else** → **Failure Path**.
 4. Ask the owner in this session; NEVER hand questions or acceptances to subagents:
-   - One message = the attempt line and `## Progress` block (loop questions only), then each `Q{n}` question still without a `Decision:` line, each with its lettered `Options:` and `Recommended:` / `No recommendation` lines, then the file's last line; plain text, not through a host question tool.
+   - One message = the attempt line and `## Progress` block (loop questions only), then each `Q{n}` question still without a `Decision:` line, each with its option lines, its `Recommended:` line (`Recommended: none — {why}` on a hard blocker) and its `Default if unanswered:` line, then the file's last line; plain text, not through a host question tool.
    - Offer only the file's options for each question; NEVER add an `Accept` or any other option the file does not list.
    - Look up facts in the repo, docs and tools, and never ask the owner for them.
-   - Decide nothing on the owner's behalf. Reply with a letter per question, or "yes" to take every recommendation. "yes" never answers a `No recommendation` question. Narrate `Decision pause {DECISION}: {count} question(s)` → record the wait → end turn → wait for answers:
+   - Decide nothing on the owner's behalf. Reply with a letter per question, or "yes" to take every recommendation. "yes" never answers a `Recommended: none — {why}` question. Show the `Or say "one by one" and I'll ask them one at a time.` line only when the message asks 3 or more questions (after a headless apply it asks only the `hardBlockers` subset). **If** the owner replies "one by one" → ask each unanswered question in its own message, per § Human questions. Narrate `Decision pause {DECISION}: {count} question(s)` → record the wait → end turn → wait for answers:
      ```bash
      "{BKIT}" status row --file="{STATUS}" --workflow=build --type=owner-pause --field=reason=decision >/dev/null || exit 1
      ```
diff --git a/.bkit/core/workflows/bkit-debug.md b/.bkit/core/workflows/bkit-debug.md
index 1b91c41cc..13d05c530 100644
--- a/.bkit/core/workflows/bkit-debug.md
+++ b/.bkit/core/workflows/bkit-debug.md
@@ -51,7 +51,7 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
 - **Locks:** Step 1 takes `$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.lock` with `bkit locks acquire --kind=workflow` (hold `token`); Close Workflow and Failure Path release it and exit non-zero while it is still present. **If** existing lock — its owning workflow's folded status.jsonl decides: `IN_PROGRESS` and last step <30min idle → **Failure Path**; any other holder (`DONE`, `FAILED`, `IN_PROGRESS` idle >=30min, no run) → reclaimed.
 - **Status branch:** status.jsonl committed on the adopted branch `{BRANCH}` (`{STATUS}`, held from Step 2); per-step commits, no pushes.
 - **Worktrees:** Debug NEVER creates a branch. Step 2 resumes `.worktrees/{FID}`; **Else** → adopts an existing `feat/{FID}` (local or origin, not the session's own branch) into it when the runtime mints worktrees; **Else** → adopts the session's current branch in place (`worktreePath` = main checkout); no `-b`. `main` is the one ineligible branch. cwd persists across subsequent Bash calls. **If** steps ever find `pwd` != `{WORKTREE_PATH}` → **Failure Path**.
-- **Foreign path:** Exit 10 from `steps finish` or `workflows close` on `dev` = a file the run commits was modified before the run; nothing written → **STOP**; ask the human to commit or revert the named file, record the wait with `"{BKIT}" status row --file="{STATUS}" --workflow=debug --type=owner-pause --field=reason=foreign-path` → end turn; on the reply, record it first with `"{BKIT}" status row --file="{STATUS}" --workflow=debug --type=owner-answer` → re-run the block; NEVER the **Failure Path**.<!-- bkit:tracker true start --> Line 1 of the final message = the no-issue warning, when one was emitted.<!-- bkit:tracker true end -->
+- **Foreign path:** Exit 10 from `steps finish` or `workflows close` on `dev` = a file the run commits was modified before the run; nothing written → **STOP**; write `**Action needed — Foreign path:** commit or revert {file}. Then say "continue".` with the named file, record the wait with `"{BKIT}" status row --file="{STATUS}" --workflow=debug --type=owner-pause --field=reason=foreign-path` → end turn; on the reply, record it first with `"{BKIT}" status row --file="{STATUS}" --workflow=debug --type=owner-answer` → re-run the block; NEVER the **Failure Path**.<!-- bkit:tracker true start --> Line 1 of the final message = the no-issue warning, when one was emitted.<!-- bkit:tracker true end -->
 - **gh MCP fallback:** `gh` primary for PR / CI / merge surface. **If** a command exits 80, **or** `runtimeGithubCli` = false in the `runtime-resolved` row of `{STATUS}` → use mapped MCP tool (needs `actions` toolset in `.mcp.json`): `bkit prs open` / `bkit branches land` stage `open` → `create_pull_request` with the printed `title` / `base` / `head` and the content of the printed `bodyFile` as `body`, byte-for-byte; `bkit prs probe --number` → `pull_request_read` (`get`, minimal fields); `bkit prs probe --head` / `bkit workflows handover --push` → `list_pull_requests`; `bkit prs merge` / `bkit branches land` stage `merge` → `merge_pull_request` (printed skip-token-free `subject` as `commit_message`, empty body; `--match-head` SHA as `sha`); `bkit prs verbose-ci` → `update_pull_request`; `bkit prs update-branch --number` → `update_pull_request_branch`; `bkit prs checks --number` → `pull_request_read` (`get_check_runs`, the check-run conclusions for the PR head; or `actions_list` runs for the head SHA), never `get_status`; `bkit runs wait` / `bkit runs dispatch` / `bkit runs revalidate` / `bkit runs gate` → `actions_list`; `gh run view {id} --json jobs` → `actions_get`; `gh run view --log-failed` → `get_job_logs` (`failed_only=true`). Max 1 transition per run, recorded as a `transport-fallback` row via `bkit prs transport-row --file={STATUS} --kind=fallback --from=<gh command> --to=<MCP tool> --reason=<why> --asserted-by=<re-read>` — **Skip if** `{STATUS}` not set. Tracker reads and writes go through `bkit` verbs; the tracker MCP ONLY when a verb prints `tracker.done: false` or exits 80.
 
 <!-- bkit:tracker github start -->
@@ -141,7 +141,15 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
      - **If** `LOOP_POINT` = `fix` → `**Q1 — Fix:** {LOOP_TREND_LINE} Stop here instead of trying again?`.
      - **If** `LOOP_POINT` = `soak` **and** `{LOOP_ATTEMPT}` = 1 → `**Q1 — Soak:** The fix attempts are used up. {LOOP_TREND_LINE} Stop here instead of starting soak (a slower, step-by-step investigation)?`.
      - **Else** → `**Q1 — Soak:** {LOOP_TREND_LINE} Stop here instead of trying again?`.
-   - `Options: A) Stop / B) Try again`, then `Recommended: A) Stop`.
+   - The two answers, one per line:
+     ```text
+     A) Stop — the run ends here with a handover; the next run resumes here
+     B) Try again — one more attempt runs
+     ```
+   - The recommendation, first match wins:
+     - **If** `LOOP_LIMIT` = true → `Recommended: A) Stop — the attempts set aside for this are used up`.
+     - **Else** → `Recommended: A) Stop — the last attempt left no fewer failures`.
+   - `Default if unanswered: the run waits for you`.
    - The line `Reply with a letter per question, or "yes" to take every recommendation. "stop" ends here with a handover; the next run resumes here.`
      Record the wait → end turn → wait for the answer:
    ```bash
@@ -203,7 +211,16 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
    ```bash
    "{BKIT}" branches parse --workflow=debug --prompt-file="{SESSION_DIR}/prompt.md"
    ```
-   Hold `branch` as `NAMED_BRANCH`; `{BRANCH_FLAG}` = `--branch="{NAMED_BRANCH}"` when non-null, else empty. Exit 3 or 8 → **STOP** with the missing or ambiguous branch and ask the owner to name one existing branch; no tests or edits.
+   Hold `branch` as `NAMED_BRANCH`; `{BRANCH_FLAG}` = `--branch="{NAMED_BRANCH}"` when non-null, else empty. **If** exit 3 or 8 → ask the owner in this session; plain text, not through a host question tool. One message, no tests or edits:
+   - `**Q1 — Branch:** {the missing or ambiguous branch the engine printed}. Which existing branch did you mean?`
+   - One option line per printed candidate (`Use branch {x} — debug adopts {x} and runs its tests there`), then `Name another branch — reply with its name` and `Stop — nothing changes; the run can be started again`, lettered in that order.
+   - `Recommended: none — only you know which branch you meant`.
+   - `Default if unanswered: the run waits for you; the run stops when nobody can be asked`.
+   - The line `Reply with a letter per question. "stop" ends here; nothing has changed yet, so the run can be started again.`
+   - Write no status row (none exists yet); end turn → wait for the answer; no status file yet.
+   - On the reply, write `branch={x}` with the file-write tool to `{SESSION_DIR}/owner-answer.md` and re-run `branches parse` on it with `--prompt-file="{SESSION_DIR}/owner-answer.md"`.
+   - A reply that names a letter (`B`, `B)` or `B) {option}`) means the option that letter labels.
+   - **If** the answer is `Stop` → **STOP**, no further downstream steps; never the **Failure Path**.
    <!-- bkit:tracker false start -->
    Log `Tracker not wired — proceeding without issue ID.`
    <!-- bkit:tracker false end -->
@@ -345,7 +362,17 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
    - **If** exit 0 → hold `runId` as `CI_RUN_ID`, `runUrl` as `CI_RUN_URL`, `runAttempt` as `CI_RUN_ATTEMPT`, `workflowId` as `CI_WORKFLOW_ID`, `workflowPath` as `CI_WORKFLOW_PATH`, `headSha` as `CI_HEAD_SHA`.
    - **If** exit 1 → the validated selection explicitly chooses local discovery or proves no red run; clear the held CI identity.
    - **If** exit 80 → use the existing mapped metadata/jobs read fallback, retaining the printed request identity, exact repository, attempt, workflow and commit. Write its normalized `request`, `run`, complete `jobs` and `complete: true` to `{OUTBOX}/ci-evidence.json`; rerun the same `runs locate` command with `--evidence-file="{OUTBOX}/ci-evidence.json"`. Record the transport with `prs transport-row`. Never substitute local discovery for unavailable reads.
-   - **If** exit 8 or 82 → record `status row --file="{STATUS}" --workflow=debug --type=owner-pause --field=reason=decision`, release the workflow lock, and **STOP**, naming the ambiguous references, branch conflict or unavailable evidence and its reference. Record `owner-answer` before retrying after an owner reply.
+   - **If** exit 8 or 82 → ask the owner in this session; plain text, not through a host question tool. One message, `**Q1 — CI run:**` with the engine's message carried word for word (it names the ambiguous references, the branch conflict such as `Supply branch={x} in its checkout`, or the unavailable evidence and its reference):
+     - One option line per printed candidate reference: `A) Use {reference} — debug reads that run's failures instead of running the tests itself`. Exit 82 with no candidate lists none.
+     - Then `Use local discovery — debug runs the tests itself instead of reading CI` and `Stop — the run ends here with a handover; the next run resumes here`, lettered after the candidates.
+     - `Recommended: none — only you know which run you meant`.
+     - `Default if unanswered: the run waits for you; the run stops when nobody can be asked`.
+     - The line `Reply with a letter per question. "stop" ends here with a handover; the next run resumes here.`
+     - Record the wait with `status row --file="{STATUS}" --workflow=debug --type=owner-pause --field=reason=decision` → end turn → wait for the answer. The workflow lock stays held while the owner answers.
+     - Record `status row --file="{STATUS}" --workflow=debug --type=owner-answer` first. A reply that names a letter (`B`, `B)` or `B) {option}`) means the option that letter labels.
+     - **If** the answer is `Stop` → release the workflow lock (`locks release --kind=workflow --workflow=debug --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN}`) → **STOP**, no further downstream steps.
+     - **If** the answer is `Use local discovery` → treat the run as exit 1: local discovery, no CI identity.
+     - **Else** the answer names a reference → write it with the file-write tool to `{SESSION_DIR}/owner-answer.md` and re-run `runs locate` with `--prompt-file="{SESSION_DIR}/owner-answer.md"`, the other flags as above → route the new exit code again.
    - **Else**, or fallback still unavailable → **Failure Path** with the unresolved evidence reference.
      Persist only the validated file, then rederive gates and current-generation state:
    ```bash
diff --git a/.bkit/core/workflows/bkit-design.md b/.bkit/core/workflows/bkit-design.md
index 5ae3b04cf..db101ded2 100644
--- a/.bkit/core/workflows/bkit-design.md
+++ b/.bkit/core/workflows/bkit-design.md
@@ -273,12 +273,13 @@ description: "Design Feature — Autonomous design phase"
    - Map the open decisions as a tree: each decision branches into the decisions that depend on it. The frontier is every unsettled decision whose prerequisites are settled.
    - Ask the whole frontier as one turn, in one message. A question that depends on another in the same turn waits for a later turn.
    - For each question:
-     - Write `**Q{n} — {title}:** {question}` and its options lettered `A)`, `B)`, `C)`, then `Recommended: A) {answer}` on its own line.
+     - Write `**Q{n} — {title}:** {question}`, then one option per line, lettered `A)`, `B)`, `C)` (`A) {option} — {what happens if you pick it}`), then `Recommended: A) {answer} — {why}` and `Default if unanswered: the design assumes A`, each on its own line.
      - Number the questions from `Q1` across turns, and word each so "yes" accepts the recommendation.
      - Ask in plain text, not through a host question tool.
      - State what the owner must decide, what each option does and the reason for the recommendation, in plain English, before naming any file, test or identifier.
    - Look up facts in the repo, docs and tools, and never ask the owner for them. Pending lookups hold back only the questions that depend on them.
    - Decide nothing on the owner's behalf.
+   - End the turn's message with the line `Reply with a letter per question, or "yes" to take every recommendation. "stop" ends the interview; the design goes on with what is settled.` Add `Or say "one by one" and I'll ask them one at a time.` when the turn asks 3 or more questions. **If** the owner replies "one by one" → ask each question of the turn in its own message; the whole round counts as the single turn of `GRILL_TURNS` it replaces.
    - Narrate `design grill: turn {k} of {GRILL_TURNS}` → record the wait → end turn → wait for answers:
      ```bash
      "{BKIT}" status row --file="{STATUS}" --workflow=design --type=owner-pause --field=reason=grill >/dev/null || exit 1
@@ -299,7 +300,7 @@ description: "Design Feature — Autonomous design phase"
      - `Process Sketch` — 3-7 `WHEN X → THEN Y` lines with the same examples: outcomes, not implementation steps.
    - Show the whole draft.
    - Then ask one question per item the draft inferred instead of taking it from the context or an answer, in the step 2 format, with the recommended answer = as drafted.
-   - Ask last: `**Q{n} — Draft acceptance scenario:** accept the draft with the answers above as the design's starting point?` with `Options: A) yes / B) no` and `Recommended: A) yes`.
+   - Ask last: `**Q{n} — Draft acceptance scenario:** accept the draft with the answers above as the design's starting point?` with the option lines `A) Yes — the draft becomes the design's starting point` and `B) No — the draft is revised from your reply before the design starts`, then `Recommended: A) Yes — {why}` and `Default if unanswered: the design assumes A`.
    - Narrate `design grill: turn {k} of {GRILL_TURNS} — draft acceptance scenario` → record the wait (step 2 block with `reason=draft`) → end turn → wait for answers.
    - Record each reply per step 2.
    - Fold the answers into the draft. Route:
@@ -623,7 +624,7 @@ description: "Design Feature — Autonomous design phase"
    <!-- bkit:tracker true end -->
 5. Final return: display `{FINAL_RETURN}` verbatim as the final message to the user; do not summarise or trim; do not auto-invoke. **HARD STOP** — do not invoke `/bkit-plan`.
 6. **If** user requests plain English explanation → restate the summary in plain English; name terms and say what they mean; identifiers stay verbatim; plainness lives in sentences, not nouns; do not re-run any step.
-7. **If** user requests the open questions one by one → ask each `Open Questions` item on its own, verbatim, with its options lettered `A)`, `B)`, `C)`, `Recommended` and `Default if unanswered`; wait for the answer before asking the next; do not re-run any step.
+7. **If** user requests the open questions one by one → ask each `Open Questions` item on its own, in the shared question shape, in plain text, not through a host question tool, keeping its options, `Recommended` and `Default if unanswered` as written; wait for the answer before asking the next; do not re-run any step.
 8. **If** the user answers one or more `Open Questions` items (in the one-by-one pass, once its last question is answered, or in any chat message) → record the round in this order:
    - Obtain the round's invocation id and keep the printed `invocation` as `INVOCATION`:
      ```bash
diff --git a/.bkit/core/workflows/bkit-plan.md b/.bkit/core/workflows/bkit-plan.md
index 2c5355062..999a91f4c 100644
--- a/.bkit/core/workflows/bkit-plan.md
+++ b/.bkit/core/workflows/bkit-plan.md
@@ -535,7 +535,7 @@ Before generating, ask the engine for this step's invocation id and keep the pri
    <!-- bkit:tracker true end -->
 5. Final return: display `{FINAL_RETURN}` verbatim as the final message to the user; do not summarise or trim; do not auto-invoke. **HARD STOP** — do not invoke `/bkit-build`.
 6. **If** user requests plain English explanation → restate the summary in plain English; name terms and say what they mean; identifiers stay verbatim; plainness lives in sentences, not nouns; do not re-run any step.
-7. **If** user requests the open questions one by one → ask each `Open Questions` item on its own, verbatim, with its options lettered `A)`, `B)`, `C)`, `Recommended` and `Default if unanswered`; wait for the answer before asking the next; do not re-run any step. State what the owner must decide, what each option does and the reason for the recommendation, in plain English, before naming any file, test or identifier.
+7. **If** user requests the open questions one by one → ask each `Open Questions` item on its own, in the shared question shape, in plain text, not through a host question tool, keeping its options, `Recommended` and `Default if unanswered` as written; wait for the answer before asking the next; do not re-run any step. State what the owner must decide, what each option does and the reason for the recommendation, in plain English, before naming any file, test or identifier.
 8. **If** the user answers one or more `Open Questions` items (in the one-by-one pass, once its last question is answered, or in any chat message) → record the round in this order:
    - Obtain the round's invocation id and keep the printed `invocation` as `INVOCATION`:
      ```bash
diff --git a/.bkit/core/workflows/bkit-ship.md b/.bkit/core/workflows/bkit-ship.md
index 8d1179c42..10dcacccf 100644
--- a/.bkit/core/workflows/bkit-ship.md
+++ b/.bkit/core/workflows/bkit-ship.md
@@ -384,8 +384,11 @@ description: "Ship Feature — Autonomous merge and archive"
    - **If** `RUNTIME_HEADLESS` = true → step 4, since there is no one to ask.
    - **Else** → step 2.
 2. Ask the owner in this session. Write in plain text, not through a host question tool. NEVER hand the questions to subagents. State what the owner must decide, what each option does and the reason for the recommendation, in plain English, before naming any file, test or identifier. Send one message:
-   - For each entry of `ASSUMED_ITEMS`, in order, numbered from 1: `**Q{n} — {title}:** accepted without you during build ({reason}). Confirm it?`, then `Options: A) Confirm / B) Reject`, then `No recommendation — only you can accept it`.
-   - End the message with the line `Reply per question. Ship merges either way; anything not confirmed is written as a needs-decision deferral.`
+   - For each entry of `ASSUMED_ITEMS`, in order, numbered from 1: `**Q{n} — {title}:** accepted without you during build ({reason}). Confirm it?`, then the option lines, each on its own line:
+     A) Confirm — the accept is recorded as yours, as a decision row
+     B) Reject — the item is written as a needs-decision deferral
+   - Then `Recommended: none — only you can accept it`, then `Default if unanswered: written as a needs-decision deferral`.
+   - End the message with the line `Reply with a letter per question. Ship merges either way; anything you do not confirm is written as a needs-decision deferral.`
 
    Then record the wait → end turn → wait for answers:
 
@@ -820,7 +823,12 @@ Asked from Step 9 or Step 10 when `ship.merge.maxAttempts` is used up (`LIMIT_NE
 
 1. Ask the human in this session, in plain text, in one message:
    - `ship merge: attempt {MERGE_ROUNDS} of {MERGE_MAX}`, then `**Q1 — Merge:** The merge attempts are used up ({the last refusal or failure in one line}). Stop here instead of trying one more set of attempts?`
-   - `Options: A) Stop / B) Try again`, then `Recommended: A) Stop — {reason}`.
+   - The merge options:
+     ```text
+     A) Stop — the run ends here with a handover; the next run resumes here
+     B) Try again — one more set of merge attempts runs
+     ```
+   - Then `Recommended: A) Stop — {reason}`, then `Default if unanswered: the run waits for you`.
    - End the message with the line `Reply with a letter per question, or "yes" to take every recommendation. "stop" ends here with a handover; the next run resumes here.`
 
    Record the wait → end turn → wait for the answer:
diff --git a/.bkit/friction.jsonl b/.bkit/friction.jsonl
index 328e10ada..e85e08a7c 100644
--- a/.bkit/friction.jsonl
+++ b/.bkit/friction.jsonl
@@ -209,3 +209,5 @@
 {"schema":3,"ts":1794610706525,"kind":"friction","key":"owner-pause/build.decision","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"owner-pause"},"category":"human-confirm","scope":"bkit-repo","severity":"LOW","summary":"build paused for the owner at build.decision","description":"The build workflow stopped and asked the owner (`owner-pause` at build.decision).","source":"orchestrator","status":"OPEN","run":{"parentSha":"2fa3c402b5dd5e8b6637a36a686dfad63d87b394"},"recurrenceCount":17,"lastConfirmed":1794610706525}
 {"schema":3,"ts":1794616434019,"kind":"friction","key":"ledgers-append/plan-generate-deferrals","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"plan","step":"plan-generate"},"references":["887-review-doc-starters","https://github.com/cbartens/bkit/issues/887"],"category":"tool-failure","scope":"bkit-repo","severity":"MEDIUM","summary":"plan-generate cannot write deferral rows under its step invocation","description":"In /bkit-plan #887 run 2, @bkit-plan-generate ran `bkit ledgers append --ledger=deferrals` with the step invocation from `bkit status invocation --step=plan-generate`. The engine refused the batch (exit 8: the plan orchestrator does not write deferral rows) because the invocation carries no subagent, so the rows count as written by the orchestrator. Seven rows were lost: reference updates for six 887-* Out of Scope deferrals and moving 864-...-project-docs-ts-429 to TRIAGED. The decision row from the same agent landed but with no subagent or model in `by`.","source":"orchestrator","status":"OPEN","recurrenceCount":1}
 {"schema":3,"ts":1794617726109,"kind":"friction","key":"ledgers-check/plan-summary-unbackticked","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"plan","step":"plan-summary"},"references":["887-review-doc-starters","https://github.com/cbartens/bkit/issues/887"],"category":"agent-rework","scope":"bkit-repo","severity":"LOW","summary":"plan-update wrote the Ledger rows line with bare keys, which ledgers check reads as unfilled","description":"In /bkit-plan #887 run 2, @bkit-plan-update wrote `**Ledger rows:**` with 15 bare keys. `bkit ledgers check` only reads backticked keys, so it exited 11 with `is unfilled` though every key was on disk. Neither plan-check nor the update agent caught it; the orchestrator added the backticks and the check passed.","source":"orchestrator","status":"OPEN","recurrenceCount":1}
+{"schema":3,"ts":1794661059521,"kind":"friction","key":"owner-pause/build.decision","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"owner-pause"},"category":"human-confirm","scope":"bkit-repo","severity":"LOW","summary":"build paused for the owner at build.decision","description":"The build workflow stopped and asked the owner (`owner-pause` at build.decision).","source":"orchestrator","status":"OPEN","run":{"parentSha":"2fa3c402b5dd5e8b6637a36a686dfad63d87b394"},"recurrenceCount":14,"lastConfirmed":1794661059521}
+{"schema":3,"ts":1794662486235,"kind":"friction","key":"owner-pause/build.decision","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"owner-pause"},"category":"human-confirm","scope":"bkit-repo","severity":"LOW","summary":"build paused for the owner at build.decision","description":"The build workflow stopped and asked the owner (`owner-pause` at build.decision).","source":"orchestrator","status":"OPEN","run":{"parentSha":"2fa3c402b5dd5e8b6637a36a686dfad63d87b394"},"recurrenceCount":15,"lastConfirmed":1794662486235}
diff --git a/.bkit/instructions.md b/.bkit/instructions.md
index f16e5172e..7dff8f17b 100644
--- a/.bkit/instructions.md
+++ b/.bkit/instructions.md
@@ -1386,7 +1386,7 @@ Clause section lines:
 - audit:
   - specialised: `bkit-audit-annotations`, `bkit-audit-ci-performance`
 - drift:
-  - `bkit-ship:664`: "probes for a run at it first, dispatches only when none" Dispatches CI by hand (gh workflow run via --dispatch-if-absent per `.bkit/workflows.md` § CI-Dispatch Gate (shared, single source)) when no run is found; `ci` says pushes auto-trigger CI, NEVER manually
+  - `bkit-ship:667`: "probes for a run at it first, dispatches only when none" Dispatches CI by hand (gh workflow run via --dispatch-if-absent per `.bkit/workflows.md` § CI-Dispatch Gate (shared, single source)) when no run is found; `ci` says pushes auto-trigger CI, NEVER manually
     - kept: Re-validate probes for an existing run first and dispatches only when the head has none, which happens when the head commit carries `[skip ci]` or GitHub started no run
 
 ```text
@@ -1700,7 +1700,7 @@ Clause section lines:
 - audit:
   - specialised: `bkit-audit-ci-performance`
 - drift:
-  - `bkit-ship:664`: "probes for a run at it first, dispatches only when none" Dispatches CI by hand (gh workflow run via --dispatch-if-absent per `.bkit/workflows.md` § CI-Dispatch Gate (shared, single source)) when no run is found; `ci` says pushes auto-trigger CI, NEVER manually
+  - `bkit-ship:667`: "probes for a run at it first, dispatches only when none" Dispatches CI by hand (gh workflow run via --dispatch-if-absent per `.bkit/workflows.md` § CI-Dispatch Gate (shared, single source)) when no run is found; `ci` says pushes auto-trigger CI, NEVER manually
     - kept: Re-validate probes for an existing run first and dispatches only when the head has none, which happens when the head commit carries `[skip ci]` or GitHub started no run
 
 ```text
@@ -5876,7 +5876,7 @@ never `workflows fail`:
 ### workflow-question-reply-line
 
 - workflow: where-used
-- carriers: workflow `bkit-build`, `bkit-debug`, `bkit-ship`
+- carriers: workflow all except `bkit-auto`, `bkit-plan`
 
 ```text
 Reply with a letter per question, or "yes" to take every recommendation.
@@ -5888,7 +5888,7 @@ Reply with a letter per question, or "yes" to take every recommendation.
 
 ### workflow-stop-writes-handover
 
-- workflow: where-used
+- workflow: repeatable
 - carriers: workflow `bkit-debug`, `bkit-ship`
 
 ```text
@@ -7154,7 +7154,7 @@ State what the owner must decide and what each option does, in plain English, be
 
 ### workflow-plain-text-questions
 
-- workflow: where-used
+- workflow: repeatable
 - carriers: workflow all except `bkit-auto`, `bkit-plan`
 
 ```text
@@ -7212,10 +7212,11 @@ Decide nothing on the human's behalf.
 - carriers: workflow `bkit-design`, `bkit-plan`
 
 ```text
-**If** user requests the open questions one by one → ask each `Open Questions` item on its own, verbatim, with its options lettered `A)`, `B)`, `C)`, `Recommended` and `Default if unanswered`; wait for the answer before asking the next; do not re-run any step.
+**If** user requests the open questions one by one → ask each `Open Questions` item on its own, in the shared question shape, in plain text, not through a host question tool, keeping its options, `Recommended` and `Default if unanswered` as written; wait for the answer before asking the next; do not re-run any step.
 ```
 
 ```retired
+**If** user requests the open questions one by one → ask each `Open Questions` item on its own, verbatim, with its options lettered `A)`, `B)`, `C)`, `Recommended` and `Default if unanswered`; wait for the answer before asking the next; do not re-run any step.
 **If** user requests the open questions one by one → ask each `## Open Questions` item on its own, verbatim, with its options lettered `A)`, `B)`, `C)`, `Recommended` and `Default if unanswered`; wait for the answer before asking the next; do not re-run any step.
 **If** user requests the open questions one by one → ask each `## Open Questions` item on its own, verbatim, with its options, `Recommended` and `Default if unanswered`; wait for the answer before asking the next; do not re-run any step.
 **If** user requests the open questions one by one → ask each `## Outstanding Questions` item on its own, verbatim, with its options, `Recommended` and `Default if unanswered`; wait for the answer before asking the next; do not re-run any step.
@@ -9741,7 +9742,7 @@ The table lists the header bullets of the 6 workflow files, block by block, in f
 | **Locks** | Contract | design, plan, build, debug, ship | Step 1 takes the per-feature `.lock` (`bkit locks acquire`); released at close and in Failure Path. Existing lock: holder `IN_PROGRESS` with a step <30min ago → **Failure Path**; any other holder's lock reclaimed. |
 | **Status branch** | Contract | design, plan, build, debug, ship | status.jsonl committed per step on the feature branch (debug: adopted `{BRANCH}`; ship: `$BOOK_ROOT`, one commit per flush block), no mid-lifecycle pushes. |
 | **Worktrees** | Contract | design, plan, build, debug, ship | Mint mode → `.worktrees/{FID}`, else adopt the current branch in place (debug never creates a branch); cwd persists; `pwd` != `{WORKTREE_PATH}` → **Failure Path**. |
-| **Foreign path** | Contract | debug | Exit 10 from `steps finish` or `workflows close` on `dev` = a file the run commits was modified before the run → **STOP** and ask the human to commit or revert it, recording the wait (`owner-pause`, `reason=foreign-path`) and the reply (`owner-answer`), never the **Failure Path**. |
+| **Foreign path** | Contract | debug | Exit 10 from `steps finish` or `workflows close` on `dev` = a file the run commits was modified before the run → **STOP** and write the `**Action needed — Foreign path:**` line (commit or revert the file, then say "continue"), recording the wait (`owner-pause`, `reason=foreign-path`) and the reply (`owner-answer`), never the **Failure Path**. |
 | **gh MCP fallback** | Contract | design, plan, build, debug, ship | `gh` primary for PR / CI / merge; exit 80 or `runtimeGithubCli` = false → mapped MCP tool, recorded with `bkit prs transport-row`; tracker reads and writes go through `bkit` verbs. One identical line in all five. |
 | **External tools** | Contract | auto | `gh` reads the PR and its CI run inside `bkit runs context`; exit 80 → **Failure Path**; tracker reads and writes go through `bkit` verbs, the tracker MCP only on `tracker.done` = false or exit 80. |
 | **Tracker** / **Labels** / **Comments** | Contract | all 6, once per tracker block | `bkit` verbs read and write the tracker; its MCP tools only when a verb exits 80 or prints `done` = false; writes best-effort, retry once after 5s. Phase labels mutually exclusive; a phase start drops `next:*` and `bkit:failed`; `bkit:auto`, `bkit:failed` additive (§ Tracker Integration); `bkit issues labels --write` writes each transition, the **Labels** line names the MCP fallback call. A step's `bkit` block posts its `comment` with `--post` before its gate and prints `tracker`; `tracker.done` = false → the tracker MCP posts it. Every gate includes `Issue comment attempted (Step N section)` without listing it; never edit prior content (§ Comment Lifecycle). |
@@ -10051,17 +10052,17 @@ Derive the decision number:
 **If** `PAUSE_QUESTION` = `VERIFY_GAPS` **and** `PAUSE_STEP` = 10 → write one item per `Identified Gaps Log` line of `build-plan-verify-holistic-{HOLISTIC_ATTEMPT}.md`. Add the gap's last `BLOCKED` reason from `build-plan-gaps-remediate-holistic-*-log.md` when it has one.
 **If** `PAUSE_QUESTION` = `VERIFY_GAPS` → write one item per `Identified Gaps Log` line of `build-plan-verify-{GROUP}-{VERIFY_ATTEMPT}.md`. Add the gap's last `BLOCKED` reason from `build-plan-gaps-remediate-{GROUP}-*-log.md` when it has one.
 For either `VERIFY_GAPS` list:
-A fixable gap → options `["Accept", "Fix now"]`, with a recommendation per item.
-Any unfixable gap (`no-test-first`, `test-first-malformed`, `test-first-unread`, `exception-refused`, `test-loosened`, or a holistic gap, logged `Fixable: false`) → a hard blocker with options `["Accept", "Fix now", "Stop"]`.
+A fixable gap → options `Accept` and `Fix now`, with a recommendation per item.
+Any unfixable gap (`no-test-first`, `test-first-malformed`, `test-first-unread`, `exception-refused`, `test-loosened`, or a holistic gap, logged `Fixable: false`) → a hard blocker with options `Accept`, `Fix now` and `Stop`.
 A group-gate failure is never an item: no item option can settle it, and the loop question carries it.
 **If** `PAUSE_QUESTION` = `CHALLENGE`:
 **If** `CHALLENGE_OVERFLOW` is set → the merge wrote nothing to the plan. Write one item per `Location` of each `CRITICAL`, `HIGH` or `MEDIUM` finding in the merged reports: `build-challenge-2.md`, plus `build-challenge-1.md` when the change is large.
 **Else** → write one item per task of `CHALLENGE_TASKS` whose block in the plan says `**Fixable:** false`, at any severity.
 Title each item with its task number, when it has one, followed by its `Location` in brackets.
-**If** the item is `**Fixable:** false` → a hard blocker with options `["Accept", "Fix now", "Stop"]`.
-**Else** → options `["Accept", "Fix now"]`, with a recommendation per finding.
+**If** the item is `**Fixable:** false` → a hard blocker with options `Accept`, `Fix now` and `Stop`.
+**Else** → options `Accept` and `Fix now`, with a recommendation per finding.
 **If** `PAUSE_QUESTION` = `TESTS_LOOP` → write no items: a failing suite test is never an item, and the loop question carries it.
-**If** `PAUSE_QUESTION` = `UNPROVEN` → write one item per entry of `UNPROVEN_TESTS`, titled with its task number and test name. Each item is a planned test that never failed before its code existed, so nothing shows it can catch the bug it was written for. Options `["Accept", "Stop"]`, recommended `Accept`. Its question ends `Accept it? You write the reason, and it is recorded as your TEST EXCEPTION.`
+**If** `PAUSE_QUESTION` = `UNPROVEN` → write one item per entry of `UNPROVEN_TESTS`, titled with its task number and test name. Each item is a planned test that never failed before its code existed, so nothing shows it can catch the bug it was written for. Options `Accept` and `Stop`, recommended `Accept`. Its question ends `Accept it? You write the reason, and it is recorded as your TEST EXCEPTION.`
 Check a red gate against the base commit, the commit the branch started from. **If** `PAUSE_QUESTION` = `TESTS_LOOP` **or** `GATE_VERDICT` = FAIL → `GATE_LOG` = `{OUTBOX}/run-tests-{TEST_ATTEMPT}.log` for `TESTS_LOOP`, else `{OUTBOX}/build-group-gate-{GROUP}-{VERIFY_ATTEMPT}.log`:
 `{LOOP_FLAGS}` = `--loop=tests --attempt={TEST_ATTEMPT} --max={PAUSE_MAX}` when `PAUSE_QUESTION` = `TESTS_LOOP`; `--loop=verify --group={GROUP} --attempt={VERIFY_ATTEMPT} --max={PAUSE_MAX}` when `PAUSE_LOOP` = `verify`; `--loop=holistic --attempt={HOLISTIC_ROUNDS} --max={PAUSE_MAX}` when `PAUSE_LOOP` = `holistic`; empty otherwise.
 `{HEADER_FLAGS}` = `--header=Question={PAUSE_QUESTION} --header=From={verify|holistic|challenge|tests|summary} --header="Pause step={PAUSE_STEP}" --header="Plan=docs/plans/{YYYYMM}/{FID}-plan.md"`.
@@ -10353,11 +10354,23 @@ PR created
 
 ```text
 **Resume:** Resolve and persist the evidence selection in Steps 1–2 before resuming. Explicit references and `[local]` override saved evidence. After Step 2, `"{BKIT}" status resume --workflow=debug --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up; a changed `CI_GENERATION` always returns to Step 3, then collects current-generation context before diagnosis. Steps 1–2 ALWAYS run again; otherwise continue at Step `number`.
-Hold `branch` as `NAMED_BRANCH`; `{BRANCH_FLAG}` = `--branch="{NAMED_BRANCH}"` when non-null, else empty. Exit 3 or 8 → **STOP** with the missing or ambiguous branch and ask the owner to name one existing branch; no tests or edits.
+`**Q1 — Branch:** {the missing or ambiguous branch the engine printed}. Which existing branch did you mean?`
+One option line per printed candidate (`Use branch {x} — debug adopts {x} and runs its tests there`), then `Name another branch — reply with its name` and `Stop — nothing changes; the run can be started again`, lettered in that order.
+`Recommended: none — only you know which branch you meant`.
+`Default if unanswered: the run waits for you; the run stops when nobody can be asked`.
+The line `Reply with a letter per question. "stop" ends here; nothing has changed yet, so the run can be started again.`
+Write no status row (none exists yet); end turn → wait for the answer; no status file yet.
+On the reply, write `branch={x}` with the file-write tool to `{SESSION_DIR}/owner-answer.md` and re-run `branches parse` on it with `--prompt-file="{SESSION_DIR}/owner-answer.md"`.
 Resolve evidence before any downstream resume. `{CI_SELECTION_FILE}` = `{OUTBOX}/ci-selection.json`, outside the disposable session directory. Read the old generation before changing metadata:
 **If** exit 1 → the validated selection explicitly chooses local discovery or proves no red run; clear the held CI identity.
 **If** exit 80 → use the existing mapped metadata/jobs read fallback, retaining the printed request identity, exact repository, attempt, workflow and commit. Write its normalized `request`, `run`, complete `jobs` and `complete: true` to `{OUTBOX}/ci-evidence.json`; rerun the same `runs locate` command with `--evidence-file="{OUTBOX}/ci-evidence.json"`. Record the transport with `prs transport-row`. Never substitute local discovery for unavailable reads.
-**If** exit 8 or 82 → record `status row --file="{STATUS}" --workflow=debug --type=owner-pause --field=reason=decision`, release the workflow lock, and **STOP**, naming the ambiguous references, branch conflict or unavailable evidence and its reference. Record `owner-answer` before retrying after an owner reply.
+One option line per printed candidate reference: `A) Use {reference} — debug reads that run's failures instead of running the tests itself`. Exit 82 with no candidate lists none.
+Then `Use local discovery — debug runs the tests itself instead of reading CI` and `Stop — the run ends here with a handover; the next run resumes here`, lettered after the candidates.
+`Recommended: none — only you know which run you meant`.
+`Default if unanswered: the run waits for you; the run stops when nobody can be asked`.
+Record the wait with `status row --file="{STATUS}" --workflow=debug --type=owner-pause --field=reason=decision` → end turn → wait for the answer. The workflow lock stays held while the owner answers.
+**If** the answer is `Use local discovery` → treat the run as exit 1: local discovery, no CI identity.
+**Else** the answer names a reference → write it with the file-write tool to `{SESSION_DIR}/owner-answer.md` and re-run `runs locate` with `--prompt-file="{SESSION_DIR}/owner-answer.md"`, the other flags as above → route the new exit code again.
 **Else**, or fallback still unavailable → **Failure Path** with the unresolved evidence reference.
 With selected CI, adapt legacy blocks only in this temporary script to honor all selection pins and emit the identity receipt plus complete nonempty logs. A mapped fallback writes normalized metadata/job/log evidence through the same `context fetch` validator. Require `outcome: checked` for the selected CI block collected in this generation; unchecked, skipped, missing, partial or mismatched CI evidence → **Failure Path** before diagnosis. Older context artifacts cannot satisfy this check.
 **If** CI is selected **and** `REPRO` = true **and** `CI_REPRODUCED` != true → Step 5 once for this generation, including a CI evidence FAIL.
@@ -10375,7 +10388,11 @@ Read the loop's progress:
 **If** `LOOP_POINT` = `fix` → `**Q1 — Fix:** {LOOP_TREND_LINE} Stop here instead of trying again?`.
 **If** `LOOP_POINT` = `soak` **and** `{LOOP_ATTEMPT}` = 1 → `**Q1 — Soak:** The fix attempts are used up. {LOOP_TREND_LINE} Stop here instead of starting soak (a slower, step-by-step investigation)?`.
 **Else** → `**Q1 — Soak:** {LOOP_TREND_LINE} Stop here instead of trying again?`.
-`Options: A) Stop / B) Try again`, then `Recommended: A) Stop`.
+The two answers, one per line:
+The recommendation, first match wins:
+**If** `LOOP_LIMIT` = true → `Recommended: A) Stop — the attempts set aside for this are used up`.
+**Else** → `Recommended: A) Stop — the last attempt left no fewer failures`.
+`Default if unanswered: the run waits for you`.
 The line `Reply with a letter per question, or "yes" to take every recommendation. "stop" ends here with a handover; the next run resumes here.`
 Record the wait → end turn → wait for the answer:
 Record the reply before anything else:
@@ -10513,7 +10530,7 @@ Ask only what they leave open, or what the issue text has changed since.
 Map the open decisions as a tree: each decision branches into the decisions that depend on it. The frontier is every unsettled decision whose prerequisites are settled.
 Ask the whole frontier as one turn, in one message. A question that depends on another in the same turn waits for a later turn.
 For each question:
-Write `**Q{n} — {title}:** {question}` and its options lettered `A)`, `B)`, `C)`, then `Recommended: A) {answer}` on its own line.
+Write `**Q{n} — {title}:** {question}`, then one option per line, lettered `A)`, `B)`, `C)` (`A) {option} — {what happens if you pick it}`), then `Recommended: A) {answer} — {why}` and `Default if unanswered: the design assumes A`, each on its own line.
 Narrate `design grill: turn {k} of {GRILL_TURNS}` → record the wait → end turn → wait for answers:
 **If** the human says stop → write the draft scenario per step 4 without asking → step 5.
 **If** frontier empty **or** `GRILL_TURNS` - 1 turns asked → step 4.
@@ -10525,7 +10542,7 @@ Draft the acceptance scenario from the whole context: `docs/plans/{YYYYMM}/logs/
 `Process Sketch` — 3-7 `WHEN X → THEN Y` lines with the same examples: outcomes, not implementation steps.
 Show the whole draft.
 Then ask one question per item the draft inferred instead of taking it from the context or an answer, in the step 2 format, with the recommended answer = as drafted.
-Ask last: `**Q{n} — Draft acceptance scenario:** accept the draft with the answers above as the design's starting point?` with `Options: A) yes / B) no` and `Recommended: A) yes`.
+Ask last: `**Q{n} — Draft acceptance scenario:** accept the draft with the answers above as the design's starting point?` with the option lines `A) Yes — the draft becomes the design's starting point` and `B) No — the draft is revised from your reply before the design starts`, then `Recommended: A) Yes — {why}` and `Default if unanswered: the design assumes A`.
 Narrate `design grill: turn {k} of {GRILL_TURNS} — draft acceptance scenario` → record the wait (step 2 block with `reason=draft`) → end turn → wait for answers.
 Record each reply per step 2.
 Fold the answers into the draft. Route:
@@ -10663,8 +10680,9 @@ Entry head read, PR CI checked
 List the build's assumed Accepts nobody has confirmed, and read the runtime:
 **If** `ASSUMED_COUNT` = 0 → return to Step 2.
 **If** `RUNTIME_HEADLESS` = true → step 4, since there is no one to ask.
-For each entry of `ASSUMED_ITEMS`, in order, numbered from 1: `**Q{n} — {title}:** accepted without you during build ({reason}). Confirm it?`, then `Options: A) Confirm / B) Reject`, then `No recommendation — only you can accept it`.
-End the message with the line `Reply per question. Ship merges either way; anything not confirmed is written as a needs-decision deferral.`
+For each entry of `ASSUMED_ITEMS`, in order, numbered from 1: `**Q{n} — {title}:** accepted without you during build ({reason}). Confirm it?`, then the option lines, each on its own line:
+Then `Recommended: none — only you can accept it`, then `Default if unanswered: written as a needs-decision deferral`.
+End the message with the line `Reply with a letter per question. Ship merges either way; anything you do not confirm is written as a needs-decision deferral.`
 Then record the wait → end turn → wait for answers:
 Record each reply before anything else, then write each answer. `{FILE}` and `{Q}` = the entry's `file` and `q`. "yes" answers no question here:
 **If** the answer is `Confirm` → write it:
@@ -10726,7 +10744,8 @@ Used-up merge step sent to the **Merge Question** in a session, or to the Failur
 A red CI run regenerated only when every failed step is a generated file (`branches regenerate`)
 PR merge attempted (`prs merge`)
 Ask the human in this session, in plain text, in one message:
-`Options: A) Stop / B) Try again`, then `Recommended: A) Stop — {reason}`.
+The merge options:
+Then `Recommended: A) Stop — {reason}`, then `Default if unanswered: the run waits for you`.
 Asked only in a session with `ship.merge.ask` = true
 Wait and reply recorded (`status row`)
 Used-up limit given one more allowance only on `Try again` (`counters grant`)
diff --git a/docs/failures.jsonl b/docs/failures.jsonl
index 91d19bbe2..bd6df812a 100644
--- a/docs/failures.jsonl
+++ b/docs/failures.jsonl
@@ -351,3 +351,4 @@
 {"schema":3,"ts":1794620219191,"firstTs":1794620219191,"updates":1,"kind":"failure","key":"audit-dependencies-cross-spawn-the-first-runtime-dependency-has-had","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"audit","step":"audit:dependencies"},"references":["docs/audits/202611/dependencies.md","dependencies-5","bcd1b8fc3fae7ec6e8f61fcd39ac0bd67802e1cc"],"summary":"cross-spawn, the first runtime dependency, has had no release for 726 days and has no recorded decision","severity":"MEDIUM","description":"cross-spawn, the first runtime dependency, has had no release for 726 days and has no recorded decision (package.json:246); audit dependencies finding dependencies-5","status":"OPEN"}
 {"schema":3,"ts":1794620219192,"firstTs":1794620219192,"updates":1,"kind":"failure","key":"audit-dependencies-release-age-check-never-clears-for-updates-with-","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"audit","step":"audit:dependencies"},"references":["docs/audits/202611/dependencies.md","dependencies-6","bcd1b8fc3fae7ec6e8f61fcd39ac0bd67802e1cc"],"summary":"Release-age check never clears for updates with no release timestamp (lock file maintenance #735, ubuntu digest #898)","severity":"LOW","description":"Release-age check never clears for updates with no release timestamp (lock file maintenance #735, ubuntu digest #898) (.github/renovate.json5:75); audit dependencies finding dependencies-6","status":"OPEN"}
 {"schema":3,"ts":1794620219193,"firstTs":1794620219193,"updates":1,"kind":"failure","key":"audit-dependencies-trivy-0-76-2-is-detected-on-the-dashboard-but-ne","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"audit","step":"audit:dependencies"},"references":["docs/audits/202611/dependencies.md","dependencies-7","bcd1b8fc3fae7ec6e8f61fcd39ac0bd67802e1cc"],"summary":"Trivy 0.76.2 is detected on the dashboard but never reaches a PR","severity":"LOW","description":"Trivy 0.76.2 is detected on the dashboard but never reaches a PR (.github/workflows/bkit-trivy.yml:64); audit dependencies finding dependencies-7","status":"OPEN"}
+{"schema":3,"ts":1794654675254,"firstTs":1793715051563,"updates":3,"kind":"failure","key":".bkit/core/engine/commands/land.test.ts pushToDev > dev moved before every push: exhausted, nothing landed","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-plan-gaps-remediate"},"references":[".bkit/core/engine/commands/land.test.ts"],"summary":"git worktree unlock timed out under machine load in the 895 group-2 gate; passes alone","severity":"MEDIUM","status":"OPEN","description":"Failed once in bkit:gate:static-unit (spawnSync git ETIMEDOUT at dropLandTree, land.ts:90) while another worktree held the machine busy; the file passes 45/45 on a solo rerun with no code change."}
