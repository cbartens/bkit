diff --git a/.bkit/core/engine/audits/workflows/workflow-shape.test.ts b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
index fd3eb832d..366fddc10 100644
--- a/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
+++ b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
@@ -381,6 +381,16 @@ function commentNumberProblems(text: string): string[] {
   });
 }
 
+/** The `steps finish` lines in `text` running `step`. */
+function stepFinishLines(text: string, step: string): string[] {
+  return commandLines(text, "steps finish").filter((l) => l.includes(`--step=${step}`));
+}
+
+/** `lines` without the ones naming an agent. */
+function withNoAgent(lines: string[]): string[] {
+  return lines.filter((l) => !l.includes("--agent"));
+}
+
 describe("build", () => {
   const build = workflow("build");
 
@@ -580,6 +590,27 @@ describe("build", () => {
     expect(section(build, /Step 3 — Branch Sync/)).not.toContain("--step=build-plan-convert");
   });
 
+  it("Plan Current posts a comment whether it runs or skips", () => {
+    const finish = stepFinishLines(section(build, /Step 5 — Plan Current/), "build-plan-current");
+    expect(finish).toHaveLength(2);
+    for (const line of finish) expect(line).toContain("--number=5");
+    for (const line of finish) expect(line).toContain('--post --title="Plan Current"');
+  });
+
+  it("Plan Current's skipped comment says no plan anchor", () => {
+    const step5 = section(build, /Step 5 — Plan Current/);
+    const skip = withNoAgent(stepFinishLines(step5, "build-plan-current"));
+    expect(skip).toHaveLength(1);
+    expect(skip[0]).not.toContain("--artifact");
+    expect(skip[0]).toContain('--comment-field="Status=skipped (no plan anchor)"');
+    // The skip finishes at once: after the anchor read, before any dispatch.
+    const anchor = step5.indexOf('"{BKIT}" branches anchor-read');
+    const field = step5.indexOf('--comment-field="Status=skipped (no plan anchor)"');
+    expect(anchor).toBeGreaterThan(-1);
+    expect(anchor).toBeLessThan(field);
+    expect(field).toBeLessThan(step5.indexOf("Invoke `@bkit-build-plan-current`"));
+  });
+
   it("issue comments newer than a valid plan send the build through convert once", () => {
     // `workflows input` counts the comments posted after the plan's last commit; convert
     // writes them into the plan before any code, so every later agent works from it.
diff --git a/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt b/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt
index 3f25e1dbd..25df79390 100644
--- a/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt
+++ b/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt
@@ -324,26 +324,31 @@ _No tracker connected, skip step._
    "{BKIT}" branches anchor-read --file=docs/plans/{YYYYMM}/{FID}-plan.md --field=baseSha --against=origin/dev
    ```
    Route:
-   - **If** exit 12 → Step 6.
-   - **If** exit 0 → hold `value` as `{BASE_SHA}` → sub-step 2.
+   - **If** exit 12 → sub-step 2.
+   - **If** exit 0 → hold `value` as `{BASE_SHA}` → sub-step 3.
    - **Else** → **Failure Path**.
-2. **Subagent:** Invoke `@bkit-build-plan-current` using `Agent` tool:
+2. No plan anchor: finish the step with no agent and no artifact, its comment naming the skip:
+   ```bash
+   "{BKIT}" steps finish --workflow=build --step=build-plan-current --file="{STATUS}" --attempt=1 --number=5 --post --title="Plan Current" --comment-field="Status=skipped (no plan anchor)" --message="chore({FID}): plan-current skipped"
+   ```
+   Every outcome → Step 6.
+3. **Subagent:** Invoke `@bkit-build-plan-current` using `Agent` tool:
    Context: You are a subagent in the Build phase. Switch into working directory `cd "{WORKTREE_PATH}"` → verify with `pwd` → use for all subsequent file operations. The plan was written against base commit `{BASE_SHA}`; judge it against `origin/dev`.
    Read: `docs/plans/{YYYYMM}/{FID}-plan.md`.
    Create: `docs/plans/{YYYYMM}/logs/{FID}/build-plan-current.md`.
-3. Finish:
+4. Finish:
    ```bash
    "{BKIT}" steps finish --workflow=build --step=build-plan-current --file="{STATUS}" --attempt=1 --agent=bkit-build-plan-current --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-current.md --number=5 --post --title="Plan Current" --message="chore({FID}): plan-current"
    ```
-4. **If** `verdict` = CONCERNS or FAIL → emit plan-currency advisory `[bkit-build] plan currency {verdict} — {fields.Affected} affected task(s); build continues, findings carried into Step 7`. Every verdict → Step 6.
+5. **If** `verdict` = CONCERNS or FAIL → emit plan-currency advisory `[bkit-build] plan currency {verdict} — {fields.Affected} affected task(s); build continues, findings carried into Step 7`. Every verdict → Step 6.
 
 ### 🔒 Gate 5 — Plan Current
 
-- [ ] Base commit resolved
-- [ ] Subagent invoked (`@bkit-build-plan-current`, no inline work)
+- [ ] Base commit resolved, or the missing anchor named as the skip
+- [ ] Subagent invoked (`@bkit-build-plan-current`, no inline work) when the base commit resolved
 - [ ] Mechanical checks passed (`steps finish`)
 - [ ] Plan not revised
-- [ ] Advisory emitted
+- [ ] Advisory emitted when the base commit resolved
 
 ---
 
diff --git a/.bkit/core/workflows/bkit-build.md b/.bkit/core/workflows/bkit-build.md
index 2199f86d7..ca75523a6 100644
--- a/.bkit/core/workflows/bkit-build.md
+++ b/.bkit/core/workflows/bkit-build.md
@@ -407,26 +407,31 @@ description: "Build Feature — Autonomous implementation"
    "{BKIT}" branches anchor-read --file=docs/plans/{YYYYMM}/{FID}-plan.md --field=baseSha --against=origin/dev
    ```
    Route:
-   - **If** exit 12 → Step 6.
-   - **If** exit 0 → hold `value` as `{BASE_SHA}` → sub-step 2.
+   - **If** exit 12 → sub-step 2.
+   - **If** exit 0 → hold `value` as `{BASE_SHA}` → sub-step 3.
    - **Else** → **Failure Path**.
-2. **Subagent:** Invoke `@bkit-build-plan-current` using `Agent` tool:
+2. No plan anchor: finish the step with no agent and no artifact, its comment naming the skip:
+   ```bash
+   "{BKIT}" steps finish --workflow=build --step=build-plan-current --file="{STATUS}" --attempt=1 --number=5 --post --title="Plan Current" --comment-field="Status=skipped (no plan anchor)" --message="chore({FID}): plan-current skipped"
+   ```
+   Every outcome → Step 6.
+3. **Subagent:** Invoke `@bkit-build-plan-current` using `Agent` tool:
    Context: You are a subagent in the Build phase. Switch into working directory `cd "{WORKTREE_PATH}"` → verify with `pwd` → use for all subsequent file operations. The plan was written against base commit `{BASE_SHA}`; judge it against `origin/dev`.
    Read: `docs/plans/{YYYYMM}/{FID}-plan.md`.
    Create: `docs/plans/{YYYYMM}/logs/{FID}/build-plan-current.md`.
-3. Finish:
+4. Finish:
    ```bash
    "{BKIT}" steps finish --workflow=build --step=build-plan-current --file="{STATUS}" --attempt=1 --agent=bkit-build-plan-current --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-current.md --number=5 --post --title="Plan Current" --message="chore({FID}): plan-current"
    ```
-4. **If** `verdict` = CONCERNS or FAIL → emit plan-currency advisory `[bkit-build] plan currency {verdict} — {fields.Affected} affected task(s); build continues, findings carried into Step 7`. Every verdict → Step 6.
+5. **If** `verdict` = CONCERNS or FAIL → emit plan-currency advisory `[bkit-build] plan currency {verdict} — {fields.Affected} affected task(s); build continues, findings carried into Step 7`. Every verdict → Step 6.
 
 ### 🔒 Gate 5 — Plan Current
 
-- [ ] Base commit resolved
-- [ ] Subagent invoked (`@bkit-build-plan-current`, no inline work)
+- [ ] Base commit resolved, or the missing anchor named as the skip
+- [ ] Subagent invoked (`@bkit-build-plan-current`, no inline work) when the base commit resolved
 - [ ] Mechanical checks passed (`steps finish`)
 - [ ] Plan not revised
-- [ ] Advisory emitted
+- [ ] Advisory emitted when the base commit resolved
 
 ---
 
diff --git a/.bkit/instructions.md b/.bkit/instructions.md
index 8a0f7857c..399581475 100644
--- a/.bkit/instructions.md
+++ b/.bkit/instructions.md
@@ -7099,11 +7099,13 @@ Plan checked (`tests plan-check`)
 Converted (`@bkit-build-plan-convert`, no inline work) when it had no task markers or issue comments are newer than it
 Converted plan checked again (`tests plan-check`)
 Resolve plan base commit and collect code landed since:
-**If** exit 12 → Step 6.
+**If** exit 12 → sub-step 2.
+No plan anchor: finish the step with no agent and no artifact, its comment naming the skip:
+Every outcome → Step 6.
 **If** `verdict` = CONCERNS or FAIL → emit plan-currency advisory `[bkit-build] plan currency {verdict} — {fields.Affected} affected task(s); build continues, findings carried into Step 7`. Every verdict → Step 6.
-Base commit resolved
+Base commit resolved, or the missing anchor named as the skip
 Plan not revised
-Advisory emitted
+Advisory emitted when the base commit resolved
 New skills installed
 One pass of Steps 7-9 per plan group, in group order: Step 7 briefs the first group with an open task, Step 8 verifies that group's own diff, Step 9 closes its gaps. Attempt budgets count per group (`--group`). Per-group file naming: `{step}-{GROUP}-{ATTEMPT}.md`. No group left open → Step 10.
 Once per run: **If** the session prompt (`{SESSION_DIR}/prompt.md`) carries run instructions beyond naming the issue (a redo, a resume, a constraint) → write them word for word to `{SESSION_DIR}/brief-note.md`. Brief the first group with an open task — a task neither ticked `[x]` nor logged `DONE` in a `build-plan-execute-*-log.md`; drop `--note-file` when `{SESSION_DIR}/brief-note.md` does not exist:
