Enforced: true
Verdict: null
Gaps: 1
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/958-agents-orchestrator-write-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 27 | `.bkit/core/engine/commands/workflow/status.test.ts` "bkit status row > refuses the engine-only types decision-counts and decision-answer" | red | passed |
| 28 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions counts > writes the attempt line, progress, base check and loop question into the engine file only" | red | passed |
| 28 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions counts > recommends Decide when the last round changed no source" | red | passed |
| 28 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions counts > recommends Try again when the last round made progress" | red | passed |
| 28 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions counts > engine file recommends Stop when the base check is all and no questions are counted" | red | passed |
| 28 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions counts > engine file recommends Decide when the base check is all and questions are counted" | red | passed |
| 28 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions counts > writes Source changed and Gate into the engine file for a verify pause with no loop" | red | passed |
| 28 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions counts > prints the attempt, progress, base and loop question lines in show" | red | passed |
| 29 | `.bkit/core/engine/commands/workflow/open-decision.test.ts` "decision file readers > decisionItems reads the loop question and progress from the engine file" | red | passed |
| 29 | `.bkit/core/engine/commands/workflow/open-decision.test.ts` "decision file readers > the engine file's Decision line wins for one question" | red | passed |
| 29 | `.bkit/core/engine/commands/workflow/open-decision.test.ts` "decision file readers > openDecision reads Gate and Source changed from the engine file's header" | red | passed |
| 29 | `.bkit/core/engine/commands/workflow/open-decision.test.ts` "decision file readers > a pause whose loop answer is Try again reads DECIDED" | red | passed |
| 29 | `.bkit/core/engine/commands/workflow/open-decision.test.ts` "gateRerun > re-runs a red-gate pause laid out in two files" | red | passed |
| 29 | `.bkit/core/engine/commands/workflow/open-decision.test.ts` "skipProblem > reads Source changed and the loop answer from the engine file" | red | passed |
| 29 | `.bkit/core/engine/commands/workflow/open-decision.test.ts` "decision file readers > an owner's Fix now in the decision file wins over an engine Accept (assumed)" | red | passed |
| 29 | `.bkit/core/engine/commands/workflow/open-decision.test.ts` "decision file readers > an owner's answer in the decision file wins over an engine line applied without asking" | red | passed |
| 29 | `.bkit/core/engine/commands/workflow/open-decision.test.ts` "decision rows > the row appended last wins even when its at is earlier" | red | passed |
| 29 | `.bkit/core/engine/commands/workflow/open-decision.test.ts` "decision rows > a Decision line in a file with no Status header is not read as an answer" | red | passed |
| 30 | `.bkit/core/engine/commands/workflow/status.test.ts` "bkit status resume gate re-run > re-runs the gate of a red-gate pause laid out in two files" | red | passed |
| 30 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "bkit workflows summary > counts an assumed item in an engine file once" | red | passed |
| 30 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions skip > keeps the re-run when the owner's Fix now beats an engine Accept (assumed)" | red | passed |
| 31 | `.bkit/core/engine/commands/workflow/open-decision.test.ts` "decision rows > a decision file with no readable question reads OPEN with questions 0" | red | passed |
| 31 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions apply --by=headless > exits non-zero on a decision file with no readable question" | red | passed |
| 31 | `.bkit/core/engine/commands/workflow/tasks.test.ts` "bkit tasks tick > ticks the task an Accept row names and no task for a Fix now row" | red | passed |

## Gaps

- Task 29 `delete-still-referenced` — DELETE `mergeItems` in `.bkit/core/engine/commands/workflow/open-decision.ts` is still referenced: `docs/deferrals.jsonl:531` — Fixable: null — log: TASK 29: delete-still-referenced — Fixable: null

## Taken over

- Task 28 `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions counts > writes the attempt line, progress, base check and loop question into the engine file only" — taken over from Task 11; recorded `red` after the rewrite

  ```diff
     it("writes the attempt line, progress, base check and loop question into the engine file only", async () => {
       const { root, logs } = checkout();
       const out = orchestratorPause(logs, ["Task 3 [src/a.ts:10]", "Task 4 [src/b.ts:2]"], 2);
       const before = fs.readFileSync(out, "utf-8");
       const base = baseFile(root, { verdict: "none", baseRed: 0, branch: 3 });
  -    const r = await counts(
  +    const r = await countsAt(
         root,
         out,
         statusOf(logs, [4, 4]),
         "--source-changed=false",
         `--base-check=${base}`,
       );
       expect(r.code).toBe(0);
       expect(fs.readFileSync(out, "utf-8")).toBe(before);
  -    const engine = fs.readFileSync(engineOf(out), "utf-8");
  -    expect(engine).toContain("Source changed: false");
  -    expect(engine).toContain("Gate: FAIL");
  -    expect(engine).toContain("build verify: attempt 2 of 2");
  -    expect(engine).toContain("## Progress");
  -    expect(engine).toContain("Problems after each round: 4 → 4");
  -    expect(engine).toContain("Also red on base abc1234: 0 of 3");
  -    expect(engine).toMatch(/\*\*Q1 — Verify:\*\* decide the items below/);
  -    expect(engine).toContain("A) Try again — one more fix round runs");
  -    expect(engine).toContain("B) Decide — ");
  -    expect(engine).not.toContain("**Q2");
  -    expect(engine).not.toMatch(/^Status:/m);
  +    expect(fs.existsSync(engineOf(out))).toBe(false);
  +    expect(fs.readdirSync(logs).filter((f) => f.endsWith(".md"))).toEqual([
  +      "build-decision-1-1.md",
  +    ]);
  +    const rows = countsRows(logs);
  +    expect(rows).toHaveLength(1);
  +    expect(rows[0]).toMatchObject({
  +      type: "decision-counts",
  +      workflow: "build",
  +      sourceChanged: false,
  +      gate: "FAIL",
  +      loop: { recommended: "Decide" },
  +    });
  +    expect(String(rows[0]!.file)).toMatch(/build-decision-1-1\.md$/);
  +    expect(JSON.stringify(rows[0])).toContain("abc1234");
  +    const shown = shownOf(r.json);
  +    expect(shown).toContain("build verify: attempt 2 of 2");
  +    expect(shown).toContain("Problems after each round: 4 → 4");
  +    expect(shown).toContain("Also red on base abc1234: 0 of 3");
  +    expect(shown).toMatch(/\*\*Q1 — Verify:\*\* decide the items below/);
  +    expect(shown).toContain("A) Try again — one more fix round runs");
  +    expect(shown).toContain("B) Decide — ");
  +    expect(shown).not.toContain("**Q2");
     });
  ```

- Task 28 `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions counts > recommends Decide when the last round changed no source" — taken over from Task 11; recorded `red` after the rewrite

  ```diff
     it("recommends Decide when the last round changed no source", async () => {
       const { root, logs } = checkout();
       const out = orchestratorPause(logs, ["Task 3 [src/a.ts:10]"], 2);
  -    const r = await counts(root, out, statusOf(logs, [4, 4]), "--source-changed=false");
  +    const r = await countsAt(root, out, statusOf(logs, [4, 4]), "--source-changed=false");
       expect(r.code).toBe(0);
  -    const engine = fs.readFileSync(engineOf(out), "utf-8");
  -    expect(engine).toContain("Source changed: false");
  -    expect(engine).toMatch(/Recommended: B\) Decide — another round is unlikely/);
  +    const rows = countsRows(logs);
  +    expect(rows[0]).toMatchObject({ sourceChanged: false, loop: { recommended: "Decide" } });
  +    expect(shownOf(r.json)).toMatch(/Recommended: B\) Decide — another round is unlikely/);
  +    expect(fs.existsSync(engineOf(out))).toBe(false);
     });
  ```

- Task 28 `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions counts > recommends Try again when the last round made progress" — taken over from Task 11; recorded `red` after the rewrite

  ```diff
     it("recommends Try again when the last round made progress", async () => {
       const { root, logs } = checkout();
       const out = orchestratorPause(logs, ["Task 3 [src/a.ts:10]"], 2);
  -    const r = await counts(root, out, statusOf(logs, [5, 2]), "--source-changed=true");
  +    const r = await countsAt(root, out, statusOf(logs, [5, 2]), "--source-changed=true");
       expect(r.code).toBe(0);
  -    const engine = fs.readFileSync(engineOf(out), "utf-8");
  -    expect(engine).toContain("Source changed: true");
  -    expect(engine).toContain("(5 → 2)");
  -    expect(engine).toMatch(/Recommended: A\) Try again — the last round made progress/);
  +    const rows = countsRows(logs);
  +    expect(rows[0]).toMatchObject({ sourceChanged: true, loop: { recommended: "Try again" } });
  +    expect(shownOf(r.json)).toContain("(5 → 2)");
  +    expect(shownOf(r.json)).toMatch(/Recommended: A\) Try again — the last round made progress/);
  +    expect(fs.existsSync(engineOf(out))).toBe(false);
     });
  ```

- Task 28 `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions counts > engine file recommends Stop when the base check is all and no questions are counted" — taken over from Task 11; recorded `red` after the rewrite

  ```diff
     it("engine file recommends Stop when the base check is all and no questions are counted", async () => {
       const { root, logs } = checkout();
       const out = orchestratorPause(logs, [], 2);
  -    const r = await counts(root, out, statusOf(logs, [4, 4]), `--base-check=${baseFile(root, {})}`);
  +    const r = await countsAt(
  +      root,
  +      out,
  +      statusOf(logs, [4, 4]),
  +      `--base-check=${baseFile(root, {})}`,
  +    );
       expect(r.code).toBe(0);
  -    const engine = fs.readFileSync(engineOf(out), "utf-8");
  -    expect(engine).toMatch(/Recommended: B\) Stop — .*fail on `dev` too/);
  -    expect(engine).toContain("Fix `dev`, then resume.");
  +    expect(countsRows(logs)[0]).toMatchObject({ loop: { recommended: "Stop" } });
  +    expect(shownOf(r.json)).toMatch(/Recommended: B\) Stop — .*fail on `dev` too/);
  +    expect(shownOf(r.json)).toContain("Fix `dev`, then resume.");
  +    expect(fs.existsSync(engineOf(out))).toBe(false);
     });
  ```

- Task 28 `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions counts > engine file recommends Decide when the base check is all and questions are counted" — taken over from Task 11; recorded `red` after the rewrite

  ```diff
     it("engine file recommends Decide when the base check is all and questions are counted", async () => {
       const { root, logs } = checkout();
       const out = orchestratorPause(logs, ["Task 3 [src/a.ts:10]", "Task 4 [src/b.ts:2]"], 2);
  -    const r = await counts(root, out, statusOf(logs, [4, 4]), `--base-check=${baseFile(root, {})}`);
  +    const r = await countsAt(
  +      root,
  +      out,
  +      statusOf(logs, [4, 4]),
  +      `--base-check=${baseFile(root, {})}`,
  +    );
       expect(r.code).toBe(0);
  -    const engine = fs.readFileSync(engineOf(out), "utf-8");
  -    expect(engine).toMatch(/Recommended: B\) Decide — .*fail on `dev` too/);
  +    expect(countsRows(logs)[0]).toMatchObject({ loop: { recommended: "Decide" } });
  +    expect(shownOf(r.json)).toMatch(/Recommended: B\) Decide — .*fail on `dev` too/);
  +    expect(fs.existsSync(engineOf(out))).toBe(false);
     });
  ```

- Task 28 `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions counts > writes Source changed and Gate into the engine file for a verify pause with no loop" — taken over from Task 11; recorded `red` after the rewrite

  ```diff
     it("writes Source changed and Gate into the engine file for a verify pause with no loop", async () => {
       const { root, logs } = checkout();
       const out = orchestratorPause(logs, ["Task 3 [src/a.ts:10]"], 1);
       const before = fs.readFileSync(out, "utf-8");
  +    fs.writeFileSync(
  +      path.join(logs, "status.jsonl"),
  +      `${JSON.stringify({ type: "workflow-started", workflow: "build", at: "2026-10-01T00:00:00Z" })}\n`,
  +    );
       const r = await run(
         [
           "decisions",
           "counts",
  -        `--out=${out}`,
  +        `--decision=${out}`,
           "--source-changed=true",
           `--base-check=${baseFile(root, {})}`,
         ],
         root,
       );
       expect(r.code).toBe(0);
       expect(fs.readFileSync(out, "utf-8")).toBe(before);
  -    const engine = fs.readFileSync(engineOf(out), "utf-8");
  -    expect(engine).toContain("Source changed: true");
  -    expect(engine).toContain("Gate: FAIL");
  -    expect(engine).not.toContain("## Progress");
  -    expect(engine).not.toContain("**Q1");
  +    const rows = countsRows(logs);
  +    expect(rows).toHaveLength(1);
  +    expect(rows[0]).toMatchObject({ sourceChanged: true, gate: "FAIL" });
  +    expect(rows[0]!.loop).toBeUndefined();
  +    expect(shownOf(r.json)).not.toContain("**Q1");
  +    expect(fs.existsSync(engineOf(out))).toBe(false);
     });
  ```

- Task 29 `.bkit/core/engine/commands/workflow/open-decision.test.ts` "decision file readers > decisionItems reads the loop question and progress from the engine file" — taken over from Task 9; recorded `red` after the rewrite

  ```diff
     it("decisionItems reads the loop question and progress from the engine file", () => {
  -    const { read, rel } = pauseDir(orchestratorFile(), engineFile());
  +    const { read, rel, logDir } = rowDir(orchestratorFile(), [countsRow()]);
  +    expect(fs.existsSync(path.join(logDir, "build-decision-1-1-engine.md"))).toBe(false);
       const items = decisionItems(read, rel);
       expect(items.map((i) => [i.n, i.title])).toEqual([
         [1, "Verify"],
         [2, "Task 3 [src/a.ts:10]"],
       ]);
       expect(items[0]!.options).toEqual(["Try again", "Decide"]);
       expect(items[0]!.recommended).toBe("Decide");
       expect(items[1]!.options).toEqual(["Accept", "Fix now"]);
       expect(items[1]!.recommended).toBe("Accept");
     });
  ```

- Task 29 `.bkit/core/engine/commands/workflow/open-decision.test.ts` "decision file readers > the engine file's Decision line wins for one question" — taken over from Task 9; recorded `red` after the rewrite

  ```diff
     it("the engine file's Decision line wins for one question", () => {
  -    const { read, rel } = pauseDir(
  -      orchestratorFile({ answer: "Accept — the orchestrator wrote this" }),
  -      engineFile({ q2: "Fix now — the engine file wrote this" }),
  +    const { read, rel } = rowDir(
  +      `Status: OPEN\n${orchestratorFile({ answer: "Accept — the orchestrator wrote this" })}`,
  +      [countsRow(), answerRow(2, "Fix now — the row wrote this")],
       );
       const q2 = decisionItems(read, rel).find((i) => i.n === 2)!;
  -    expect(q2.decision).toBe("Fix now — the engine file wrote this");
  +    expect(q2.decision).toBe("Fix now — the row wrote this");
       expect(q2.options).toEqual(["Accept", "Fix now"]);
     });
  ```

- Task 29 `.bkit/core/engine/commands/workflow/open-decision.test.ts` "decision file readers > openDecision reads Gate and Source changed from the engine file's header" — taken over from Task 9; recorded `red` after the rewrite

  ```diff
     it("openDecision reads Gate and Source changed from the engine file's header", () => {
  -    const { tree, logDir } = pauseDir(
  -      orchestratorFile(),
  -      engineFile({ headers: ["Source changed: true", "Gate: FAIL"] }),
  -    );
  +    const { tree, logDir } = rowDir(orchestratorFile(), [countsRow({ sourceChanged: true })]);
       const open = openDecision(logDir, tree, "build", 1);
       expect(open).toMatchObject({
         file: "logs/build-decision-1-1.md",
         from: "verify",
         question: "CHALLENGE",
         group: 1,
         gate: "FAIL",
         sourceChanged: "true",
         status: "OPEN",
       });
     });
  ```

- Task 29 `.bkit/core/engine/commands/workflow/open-decision.test.ts` "decision file readers > a pause whose loop answer is Try again reads DECIDED" — taken over from Task 9; recorded `red` after the rewrite

  ```diff
     it("a pause whose loop answer is Try again reads DECIDED", () => {
  -    const { tree, logDir, rel } = pauseDir(
  -      orchestratorFile(),
  -      engineFile({ loop: "Try again — one more round" }),
  -    );
  +    const { tree, logDir, rel } = rowDir(orchestratorFile(), [
  +      countsRow(),
  +      answerRow(1, "Try again — one more round"),
  +    ]);
       expect(openDecision(logDir, tree, "build", 1, [rel])).toBeNull();
       // The same pause with its loop question unanswered is still open.
  -    const unanswered = pauseDir(orchestratorFile(), engineFile());
  +    const unanswered = rowDir(orchestratorFile(), [countsRow()]);
       expect(
         openDecision(unanswered.logDir, unanswered.tree, "build", 1, [unanswered.rel]),
       ).toMatchObject({
         status: "OPEN",
       });
     });
  ```

- Task 29 `.bkit/core/engine/commands/workflow/open-decision.test.ts` "gateRerun > re-runs a red-gate pause laid out in two files" — taken over from Task 9; recorded `red` after the rewrite

  ```diff
     it("re-runs a red-gate pause laid out in two files", () => {
       const orchestrator = ["Question: VERIFY_GAPS", "From: verify", "Group: 1", ""].join("\n");
  -    const { tree, logDir, read, rel } = pauseDir(orchestrator, engineFile());
  +    const { tree, logDir, read, rel } = rowDir(orchestrator, [countsRow()]);
       const open = openDecision(logDir, tree, "build", 1);
       expect(open).not.toBeNull();
  -    const engine = read("logs/build-decision-1-1-engine.md")!;
  -    expect(gateRerun(open, read(rel)!, engine)).toEqual({ gateRerun: true, rerunFrom: "verify" });
  +    expect(gateRerun(open, read, rel)).toEqual({ gateRerun: true, rerunFrom: "verify" });
     });
  ```

- Task 29 `.bkit/core/engine/commands/workflow/open-decision.test.ts` "skipProblem > reads Source changed and the loop answer from the engine file" — taken over from Task 9; recorded `red` after the rewrite

  ```diff
     it("reads Source changed and the loop answer from the engine file", () => {
  -    const orchestrator = orchestratorFile({ answer: "Accept — the caller caps it" });
  -    const decided = engineFile({ headers: ["Source changed: false"], loop: "Decide" });
  -    expect(skipProblem(orchestrator, decided)).toBeNull();
  -    const again = engineFile({ headers: ["Source changed: false"], loop: "Try again" });
  -    expect(skipProblem(orchestrator, again)).toBe(
  +    const orchestrator = orchestratorFile();
  +    const decided = rowDir(orchestrator, [
  +      countsRow({ gate: undefined }),
  +      answerRow(2, "Accept — the caller caps it"),
  +      answerRow(1, "Decide"),
  +    ]);
  +    expect(skipProblem(decided.read, decided.rel)).toBeNull();
  +    const again = rowDir(orchestrator, [
  +      countsRow({ gate: undefined }),
  +      answerRow(2, "Accept — the caller caps it"),
  +      answerRow(1, "Try again"),
  +    ]);
  +    expect(skipProblem(again.read, again.rel)).toBe(
         'the loop question Q1 is "Try again", not Decide',
       );
     });
  ```

- Task 29 `.bkit/core/engine/commands/workflow/open-decision.test.ts` "decision file readers > an owner's Fix now in the decision file wins over an engine Accept (assumed)" — taken over from Task 18; recorded `red` after the rewrite

  ```diff
     it("an owner's Fix now in the decision file wins over an engine Accept (assumed)", () => {
  -    const { read, rel } = pauseDir(
  -      orchestratorFile({ answer: "Fix now — the owner chose a fix" }),
  -      engineFile({ q2: "Accept (assumed) — cosmetic (no owner, LOCAL, 2026-11-17)" }),
  -    );
  +    const { read, rel } = rowDir(orchestratorFile(), [
  +      countsRow(),
  +      answerRow(2, "Accept (assumed) — cosmetic (no owner, LOCAL, 2026-11-17)", {
  +        assumed: true,
  +        by: "headless",
  +      }),
  +      answerRow(2, "Fix now — the owner chose a fix"),
  +    ]);
       const q2 = decisionItems(read, rel).find((i) => i.n === 2)!;
       expect(q2.decision).toBe("Fix now — the owner chose a fix");
  +    expect(q2.assumed).toBe(false);
     });
  ```

- Task 29 `.bkit/core/engine/commands/workflow/open-decision.test.ts` "decision file readers > an owner's answer in the decision file wins over an engine line applied without asking" — taken over from Task 18; recorded `red` after the rewrite

  ```diff
     it("an owner's answer in the decision file wins over an engine line applied without asking", () => {
  -    const { read, rel } = pauseDir(
  -      orchestratorFile({ answer: "Fix now — the owner chose a fix" }),
  -      engineFile({ q2: "Accept — recommended; applied without asking (GITHUB_ACTION)" }),
  -    );
  +    const { read, rel } = rowDir(orchestratorFile(), [
  +      countsRow(),
  +      answerRow(2, "Accept — recommended; applied without asking (GITHUB_ACTION)", {
  +        by: "headless",
  +      }),
  +      answerRow(2, "Fix now — the owner chose a fix"),
  +    ]);
       const q2 = decisionItems(read, rel).find((i) => i.n === 2)!;
       expect(q2.decision).toBe("Fix now — the owner chose a fix");
     });
  ```

- Task 30 `.bkit/core/engine/commands/workflow/status.test.ts` "bkit status resume gate re-run > re-runs the gate of a red-gate pause laid out in two files" — taken over from Task 9; recorded `red` after the rewrite

  ```diff
     it("re-runs the gate of a red-gate pause laid out in two files", async () => {
  +    const root = tmp();
  +    spawnSync("git", ["init", "-q", "-b", "dev"], { cwd: root });
  +    fs.writeFileSync(path.join(root, "package.json"), "{}");
  +    const logs = path.join(root, "logs");
  +    fs.mkdirSync(logs);
       const orchestrator = [
         "Question: VERIFY_GAPS",
         "From: verify",
         "Group: 1",
         "",
         "**Q2 — Task 3 gap:** accept it?",
         "A) Accept — the item is recorded as accepted",
         "B) Fix now — a fix task is added to the plan",
         "Recommended: A) Accept — minor",
         "Default if unanswered: the run waits for you; taken as A when nobody can be asked",
  -      "Decision: Accept — minor",
         "",
       ].join("\n");
  -    const engine = [
  -      "Source changed: false",
  -      "Gate: FAIL",
  -      "",
  -      "build verify: attempt 3 of 3",
  -      "",
  -      "## Progress",
  -      "",
  -      "**Q1 — Verify:** another fix round?",
  -      "A) Try again — another fix round runs",
  -      "B) Stop — the run ends here",
  -      "Recommended: A) Try again — the last round made progress",
  -      "",
  -    ].join("\n");
  -    const file = stopped(orchestrator);
  -    fs.writeFileSync(path.join(path.dirname(file), "build-decision-1-1-engine.md"), engine);
  -    const r = await resume(file);
  +    fs.writeFileSync(path.join(logs, "build-decision-1-1.md"), orchestrator);
  +    const decision = "logs/build-decision-1-1.md";
  +    const rows = [
  +      started("build", "2026-11-01T00:00:00Z"),
  +      done("build", "build-plan-verify", "2026-11-01T00:10:00Z", { group: 1, verdict: "PASS" }),
  +      {
  +        type: "decision-counts",
  +        workflow: "build",
  +        at: "2026-11-01T00:11:00Z",
  +        file: decision,
  +        sourceChanged: false,
  +        gate: "FAIL",
  +        loop: {
  +          title: "Verify",
  +          options: ["Try again", "Stop"],
  +          recommended: "Try again",
  +          reason: "the last round made progress",
  +        },
  +      },
  +      {
  +        type: "decision-answer",
  +        workflow: "build",
  +        at: "2026-11-01T00:12:00Z",
  +        file: decision,
  +        q: 2,
  +        answer: "Accept — minor",
  +        by: "owner",
  +      },
  +    ];
  +    const status = path.join(logs, "status.jsonl");
  +    fs.writeFileSync(status, rows.map((r) => JSON.stringify(r)).join("\n") + "\n");
  +    expect(fs.existsSync(path.join(logs, "build-decision-1-1-engine.md"))).toBe(false);
  +    const r = await run(["status", "resume", "--workflow=build", `--file=${status}`], root);
       expect(r.code).toBe(0);
       expect(r.json).toMatchObject({ gateRerun: true, rerunFrom: "verify" });
     });
  ```

- Task 30 `.bkit/core/engine/commands/workflow/workflows.test.ts` "bkit workflows summary > counts an assumed item in an engine file once" — taken over from Task 9; recorded `red` after the rewrite

  ```diff
     it("counts an assumed item in an engine file once", async () => {
  -    const cwd = tree(
  -      [done("ship-merge-pr", "2020-01-01T00:10:00Z", { workflow: "ship" })],
  +    const decisionRel = `${SREL}/build-decision-1-1.md`;
  +    const orchestrator = [
  +      "Question: CHALLENGE",
  +      "From: challenge",
  +      "",
  +      "**Q1 — Task 3 [src/a.ts:10]:** MEDIUM: the retry has no cap. Accept it?",
  +      "A) Accept — the item is recorded as accepted",
  +      "B) Fix now — a fix task is added to the plan",
  +      "Recommended: A) Accept — the caller already caps it",
  +      "Default if unanswered: the run waits for you",
  +      "",
  +    ].join("\n");
  +    const answer = (workflow: string, at: string, extra: object) => ({
  +      type: "decision-answer",
  +      workflow,
  +      at,
  +      file: decisionRel,
  +      q: 1,
  +      ...extra,
  +    });
  +    const assumedRow = answer("build", "2020-01-01T00:05:00Z", {
  +      answer: "Accept (assumed) — the caller already caps it (headless, GITHUB_ACTION, 2026-10-28)",
  +      by: "headless",
  +      assumed: true,
  +    });
  +    const shipRow = answer("ship", "2020-01-01T00:11:00Z", {
  +      answer: "Accept — confirmed at ship",
  +      by: "owner",
  +    });
  +
  +    // A ship summary: the assumed item is read once, from its row, with no -engine.md file.
  +    const shipTree = tree(
  +      [assumedRow, done("ship-merge-pr", "2020-01-01T00:10:00Z", { workflow: "ship" })],
         undefined,
         "ship",
       );
  -    const item = (decision: string) =>
  -      [
  -        "**Q1 — Task 3 [src/a.ts:10]:** MEDIUM: the retry has no cap. Accept it?",
  -        "A) Accept — the item is recorded as accepted",
  -        "B) Fix now — a fix task is added to the plan",
  -        "Recommended: A) Accept — the caller already caps it",
  -        `Decision: ${decision}`,
  -        "",
  -      ].join("\n");
  -    const assumed =
  -      "A) Accept (assumed) — the caller already caps it (headless, GITHUB_ACTION, 2026-10-28)";
  -    write(
  -      cwd,
  -      `${SREL}/build-decision-1-1.md`,
  -      `Question: CHALLENGE\nFrom: challenge\n\n${item(assumed)}`,
  -    );
  -    write(cwd, `${SREL}/build-decision-1-1-engine.md`, `Source changed: false\n\n${item(assumed)}`);
  -    const r = await summarize(cwd, "ship");
  +    write(shipTree, decisionRel, orchestrator);
  +    const r = await summarize(shipTree, "ship");
       expect(r.code).toBe(0);
       expect(r.json.reasons).toContain("shipped with 1 assumed item(s) the owner did not confirm");
  +    expect(fs.existsSync(path.join(shipTree, `${SREL}/build-decision-1-1-engine.md`))).toBe(false);
  +
  +    // A build summary: a ship answer row for the same question is not a build answer, so the
  +    // item stays assumed and is counted once as accepted without the owner.
  +    const buildTree = tree(
  +      [
  +        done("build-plan-verify", "2020-01-01T00:04:00Z", { verdict: "PASS", failures: 0 }),
  +        done("build-decision", "2020-01-01T00:06:00Z", { artifacts: [decisionRel] }),
  +        assumedRow,
  +        shipRow,
  +      ],
  +      planOf(task(1, true)),
  +    );
  +    write(buildTree, decisionRel, orchestrator);
  +    const b = await summarize(buildTree);
  +    expect(b.code).toBe(0);
  +    expect(b.json.reasons).toContain(
  +      "1 item(s) accepted without the owner (assumed; ship asks to confirm)",
  +    );
  +    expect(b.json.reasons).not.toContain("1 item(s) accepted at the Decision Pause");
     });
  ```

- Task 30 `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions skip > keeps the re-run when the owner's Fix now beats an engine Accept (assumed)" — taken over from Task 18; recorded `red` after the rewrite

  ```diff
     it("keeps the re-run when the owner's Fix now beats an engine Accept (assumed)", async () => {
       const { root, logs } = checkout();
  -    const file = path.join(logs, "build-decision-1-1.md");
  +    const file = orchestratorPause(logs, ["Task 3 [src/a.ts:10]"], 2);
  +    const status = path.join(logs, "status.jsonl");
       fs.writeFileSync(
  -      file,
  -      [
  -        "Question: CHALLENGE",
  -        "From: verify",
  -        "Group: 1",
  -        "",
  -        "**Q2 \u2014 Task 3 [src/a.ts:10]:** MEDIUM: the retry has no cap. Accept it?",
  -        "A) Accept \u2014 the item is recorded as accepted",
  -        "B) Fix now \u2014 a fix task is added to the plan",
  -        "Recommended: A) Accept \u2014 the caller already caps it",
  -        "Decision: Fix now \u2014 the owner wants it fixed",
  -        "",
  -      ].join("\n"),
  +      status,
  +      `${JSON.stringify({ type: "workflow-started", workflow: "build", at: "2026-11-17T00:00:00Z" })}\n`,
       );
  -    fs.writeFileSync(
  -      engineOf(file),
  -      [
  -        "Source changed: false",
  -        "",
  -        "## Progress",
  -        "",
  -        "**Q1 \u2014 Verify loop:** decide the items below instead of another round?",
  -        "A) Try again \u2014 another fix round runs",
  -        "B) Decide \u2014 the questions below are asked instead of another round",
  -        "Recommended: B) Decide \u2014 another round is unlikely to help",
  -        "Decision: Decide",
  -        "",
  -        "**Q2 \u2014 Task 3 [src/a.ts:10]:** MEDIUM: the retry has no cap. Accept it?",
  -        "Decision: Accept (assumed) \u2014 the caller caps it (no owner, LOCAL, 2026-11-17)",
  -        "",
  -      ].join("\n"),
  +    const counted = await run(
  +      ["decisions", "counts", `--decision=${file}`, "--source-changed=false"],
  +      root,
       );
  +    expect(counted.code).toBe(0);
  +    const named = (
  +      JSON.parse(fs.readFileSync(status, "utf-8").trim().split("\n").at(-1)!) as { file: string }
  +    ).file;
  +    const answer = (text: string, extra: object) =>
  +      fs.appendFileSync(
  +        status,
  +        `${JSON.stringify({
  +          type: "decision-answer",
  +          workflow: "build",
  +          at: "2026-11-17T00:01:00Z",
  +          file: named,
  +          q: 2,
  +          answer: text,
  +          ...extra,
  +        })}\n`,
  +      );
  +    answer("Accept (assumed) — the caller caps it (no owner, LOCAL, 2026-11-17)", {
  +      by: "headless",
  +      assumed: true,
  +    });
  +    const settled = await run(["decisions", "skip", `--file=${file}`], root);
  +    expect(settled.code).toBe(0);
  +    expect(settled.json.route).toBe("continue");
  +    answer("Fix now — the owner wants it fixed", { by: "owner" });
       const r = await run(["decisions", "skip", `--file=${file}`], root);
       expect(r.code).toBe(1);
       expect(r.json.route).toBeNull();
       expect(r.json.problem).toContain("Fix now");
     });
  ```

