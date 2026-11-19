Enforced: true
Verdict: CONCERNS
Gaps: 1
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/958-agents-orchestrator-write-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 32 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions apply --by=headless > writes assumed decisions into the engine file and leaves the decision file unchanged" | updated | passed |
| 32 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions apply --by=owner and pending > writes a confirmation into the engine file" | updated | not passed |
| 32 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions apply --by=rerun > records the re-run as a Q1 row and the pause reads DECIDED" | passed-accepted | passed |
| 32 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions apply --by=owner and pending > pending --defer keeps the answer and marks it needs-decision" | red | passed |
| 33 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions apply --by=owner and pending > --answer writes the loop answer under the engine file's Q1" | red | passed |
| 33 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions apply --by=owner and pending > --answer reads the owner's reason from --reason-file" | red | passed |
| 33 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions apply --by=owner and pending > --answer=Q2=B --fix-task=Q2=31 records Fix now with its task" | red | passed |
| 33 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions apply --by=owner and pending > refuses an --answer that is not Q{n} and an option letter" | red | passed |
| 33 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions apply --by=owner and pending > refuses --reason as an unknown flag" | red | passed |
| 33 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions apply --by=owner and pending > a multi-line --reason-file reaches only the decisions.jsonl rationale" | red | passed |
| 34 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions check > refuses Q1 when the engine file holds the loop question" | updated | passed |
| 34 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions check > accepts questions numbered from Q1 when the pause has no engine file" | updated | passed |
| 34 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions check > refuses a decision file whose question count no longer matches the engine file's loop options" | updated | passed |
| 34 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions check > refuses a Decision, Fix task, Rejected or Deferred line in the orchestrator's file" | red | passed |
| 35 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions answers > prints the last appended answer per question with its writer" | red | passed |
| 35 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions answers > prints an old single-file decision's in-file answers" | red | passed |

## Gaps

- Task 32 `not-green` — "bkit decisions apply --by=owner and pending > writes a confirmation into the engine file" failure: expected 'Accept — confirmed by the owner at sh…' to match /^Accept — fine \(owner, confirmed at …/ — Fixable: true — log: TASK 32: `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions apply --by=owner and pending > writes a confirmation into the engine file` — not-green — Fixable: true

## Already landed

- Task 32 `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions apply --by=rerun > records the re-run as a Q1 row and the pause reads DECIDED" — passed at the group's red, and the tests step accepted it: apply --by=rerun already appends the Q1 row with by rerun (decisions.ts:686); no red is due

## Updated tests

- Task 32 `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions apply --by=headless > writes assumed decisions into the engine file and leaves the decision file unchanged" — an existing test the tests step changed since `0431e556f`; the update may add expectations, never remove or loosen one. not additive: a line of the test was removed or changed — read the diff for an expectation removed or loosened

  ```diff
     it("writes assumed decisions into the engine file and leaves the decision file unchanged", async () => {
       const { root, logs } = checkout();
       const out = orchestratorPause(logs, ["Task 3 [src/a.ts:10]", "Task 4 [src/b.ts:2]"], 1);
  +    seedStatus(logs);
       const before = fs.readFileSync(out, "utf-8");
       process.env.BKIT_RUNTIME = "GITHUB_ACTION";
       const r = await run(["decisions", "apply", "--by=headless", `--file=${out}`], root);
       expect(r.code).toBe(0);
       expect(fs.readFileSync(out, "utf-8")).toBe(before);
  -    const engine = fs.readFileSync(engineOf(out), "utf-8");
  -    expect(engine).toMatch(
  -      /Decision: Accept \(assumed\) — the caller already caps it \(headless, GITHUB_ACTION, /,
  -    );
  -    expect(engine).not.toMatch(/^Status:/m);
  +    expect(fs.existsSync(engineOf(out))).toBe(false);
  +    const rows = statusRows(out);
  +    const answers = rows.filter((x) => x.type === "decision-answer");
  +    expect(answers.map((x) => x.q)).toEqual([1, 2]);
  +    for (const a of answers) {
  +      expect(a).toMatchObject({ by: "headless", assumed: true });
  +      expect(String(a.answer)).toMatch(
  +        /Accept \(assumed\) — the caller already caps it \(headless, GITHUB_ACTION, /,
  +      );
  +    }
  +    expect(JSON.stringify(rows)).not.toMatch(/Status:/);
     });
  ```

- Task 32 `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions apply --by=owner and pending > writes a confirmation into the engine file" — an existing test the tests step changed since `0431e556f`; the update may add expectations, never remove or loosen one. not additive: a line of the test was removed or changed — read the diff for an expectation removed or loosened

  ```diff
     it("writes a confirmation into the engine file", async () => {
       const { root, logs } = checkout();
       const out = path.join(logs, "build-decision-1-1.md");
       fs.writeFileSync(
         out,
         [
           "Question: CHALLENGE",
           "From: verify",
           "",
           "**Q1 — Task 3 [src/a.ts:10]:** MEDIUM: the retry has no cap. Accept it?",
           "A) Accept — the item is recorded as accepted",
           "B) Fix now — a fix task is added to the plan",
           "Recommended: A) Accept — the caller already caps it",
           "Default if unanswered: the run waits for you; taken as A when nobody can be asked",
           "Decision: A) Accept (assumed) — the caller already caps it (headless, GITHUB_ACTION, 2026-10-28)",
           "",
         ].join("\n"),
       );
  +    fs.appendFileSync(
  +      seedStatus(logs),
  +      `${JSON.stringify({
  +        type: "decision-answer",
  +        workflow: "build",
  +        at: "2026-10-28T00:00:00Z",
  +        file: path.relative(root, out),
  +        q: 1,
  +        answer:
  +          "Accept (assumed) — the caller already caps it (headless, GITHUB_ACTION, 2026-10-28)",
  +        by: "headless",
  +        assumed: true,
  +      })}\n`,
  +    );
       const before = fs.readFileSync(out, "utf-8");
       expect(fs.existsSync(engineOf(out))).toBe(false);
  +    const reasonFile = path.join(logs, "owner-reason.md");
  +    fs.writeFileSync(reasonFile, "fine\n");
       const r = await run(
  -      ["decisions", "apply", "--by=owner", `--file=${out}`, "--q=1", "--confirm", "--reason=fine"],
  +      [
  +        "decisions",
  +        "apply",
  +        "--by=owner",
  +        `--file=${out}`,
  +        "--q=1",
  +        "--confirm",
  +        `--reason-file=${reasonFile}`,
  +      ],
         root,
       );
       expect(r.code).toBe(0);
       expect(fs.readFileSync(out, "utf-8")).toBe(before);
  -    const engine = fs.readFileSync(engineOf(out), "utf-8");
  -    expect(engine).toMatch(/Decision: Accept — fine \(owner, confirmed at ship, /);
  -    expect(engine).not.toMatch(/^Status:/m);
  +    expect(fs.existsSync(engineOf(out))).toBe(false);
  +    const rows = statusRows(out);
  +    const confirmed = rows.filter((x) => x.type === "decision-answer").at(-1);
  +    expect(confirmed).toMatchObject({ q: 1, by: "owner", workflow: "ship" });
  +    expect(String(confirmed?.answer)).toMatch(/^Accept — fine \(owner, confirmed at ship, /);
  +    expect(JSON.stringify(rows)).not.toMatch(/Status:/);
     });
  ```

- Task 34 `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions check > refuses Q1 when the engine file holds the loop question" — an existing test the tests step changed since `0431e556f`; the update may add expectations, never remove or loosen one. not additive: a line of the test was removed or changed — read the diff for an expectation removed or loosened

  ```diff
     it("refuses Q1 when the engine file holds the loop question", async () => {
       const { root, logs } = checkout();
       const file = orchestratorPause(logs, ["Task 3 [src/a.ts:10]"], 1);
  -    fs.writeFileSync(
  -      engineOf(file),
  -      [
  -        "Source changed: false",
  -        "",
  -        "build verify: attempt 2 of 2",
  -        "",
  -        "## Progress",
  -        "",
  -        "**Q1 — Verify:** decide the items below instead of another round?",
  -        "A) Try again — one more fix round runs",
  -        "B) Decide — the questions below are asked instead of another round",
  -        "Recommended: B) Decide — another round is unlikely to help",
  -        "",
  -      ].join("\n"),
  -    );
  +    countsRow(logs, file, {
  +      title: "Verify",
  +      question: "decide the items below instead of another round?",
  +      options: ["Try again", "Decide"],
  +      recommended: "Decide",
  +      reason: "another round is unlikely to help",
  +    });
  +    const rows = statusRows(file);
  +    expect(rows.find((x) => x.type === "decision-counts")).toMatchObject({
  +      loop: { title: "Verify", options: ["Try again", "Decide"], recommended: "Decide" },
  +    });
  +    expect(fs.existsSync(engineOf(file))).toBe(false);
       const r = await run(["decisions", "check", `--file=${file}`], root);
       expect(r.code).toBe(6);
       expect(`${JSON.stringify(r.json)}${r.err}`).toContain("Q1");
     });
  ```

- Task 34 `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions check > accepts questions numbered from Q1 when the pause has no engine file" — an existing test the tests step changed since `0431e556f`; the update may add expectations, never remove or loosen one. additive: no line of the test was removed, so no expectation was dropped — read the added lines for one that disables an earlier expectation

  ```diff
     it("accepts questions numbered from Q1 when the pause has no engine file", async () => {
       const { root, logs } = checkout();
       const file = orchestratorPause(logs, ["Task 3 [src/a.ts:10]", "Task 4 [src/b.ts:2]"], 1);
       expect(fs.existsSync(engineOf(file))).toBe(false);
  +    fs.appendFileSync(
  +      seedStatus(logs),
  +      `${JSON.stringify({
  +        type: "decision-counts",
  +        workflow: "build",
  +        at: "2026-10-01T00:05:00Z",
  +        file: path.relative(path.resolve(logs, "../../../../.."), file),
  +        sourceChanged: true,
  +        gate: "PASS",
  +      })}\n`,
  +    );
  +    expect(statusRows(file).find((x) => x.type === "decision-counts")?.loop).toBeUndefined();
       const r = await run(["decisions", "check", `--file=${file}`], root);
       expect(r.code).toBe(0);
     });
  ```

- Task 34 `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions check > refuses a decision file whose question count no longer matches the engine file's loop options" — an existing test the tests step changed since `0431e556f`; the update may add expectations, never remove or loosen one. not additive: a line of the test was removed or changed — read the diff for an expectation removed or loosened

  ```diff
     it("refuses a decision file whose question count no longer matches the engine file's loop options", async () => {
       const { root, logs } = checkout();
       const file = orchestratorPause(logs, ["Task 3 [src/a.ts:10]"], 2);
  -    fs.writeFileSync(
  -      engineOf(file),
  -      [
  -        "Source changed: false",
  -        "",
  -        "build verify: attempt 2 of 2",
  -        "",
  -        "## Progress",
  -        "",
  -        "**Q1 \u2014 Verify:** another fix round, or stop here?",
  -        "A) Try again \u2014 one more fix round runs",
  -        "B) Stop \u2014 the run ends here with a handover; the next run resumes here",
  -        "Recommended: B) Stop \u2014 no question is left to decide",
  -        "",
  -      ].join("\n"),
  -    );
  +    countsRow(logs, file, {
  +      title: "Verify",
  +      question: "another fix round, or stop here?",
  +      options: ["Try again", "Stop"],
  +      recommended: "Stop",
  +      reason: "no question is left to decide",
  +    });
  +    expect(statusRows(file).find((x) => x.type === "decision-counts")).toMatchObject({
  +      loop: { options: ["Try again", "Stop"], recommended: "Stop" },
  +    });
  +    expect(fs.existsSync(engineOf(file))).toBe(false);
       const r = await run(["decisions", "check", `--file=${file}`], root);
       expect(r.code).toBe(6);
       expect(`${JSON.stringify(r.json)}${r.err}`).toContain("decisions counts");
     });
  ```


## Taken over

- Task 32 `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions apply --by=headless > writes assumed decisions into the engine file and leaves the decision file unchanged" — taken over from Task 12; recorded `updated` after the rewrite

  ```diff
     it("writes assumed decisions into the engine file and leaves the decision file unchanged", async () => {
       const { root, logs } = checkout();
       const out = orchestratorPause(logs, ["Task 3 [src/a.ts:10]", "Task 4 [src/b.ts:2]"], 1);
  +    seedStatus(logs);
       const before = fs.readFileSync(out, "utf-8");
       process.env.BKIT_RUNTIME = "GITHUB_ACTION";
       const r = await run(["decisions", "apply", "--by=headless", `--file=${out}`], root);
       expect(r.code).toBe(0);
       expect(fs.readFileSync(out, "utf-8")).toBe(before);
  -    const engine = fs.readFileSync(engineOf(out), "utf-8");
  -    expect(engine).toMatch(
  -      /Decision: Accept \(assumed\) — the caller already caps it \(headless, GITHUB_ACTION, /,
  -    );
  -    expect(engine).not.toMatch(/^Status:/m);
  +    expect(fs.existsSync(engineOf(out))).toBe(false);
  +    const rows = statusRows(out);
  +    const answers = rows.filter((x) => x.type === "decision-answer");
  +    expect(answers.map((x) => x.q)).toEqual([1, 2]);
  +    for (const a of answers) {
  +      expect(a).toMatchObject({ by: "headless", assumed: true });
  +      expect(String(a.answer)).toMatch(
  +        /Accept \(assumed\) — the caller already caps it \(headless, GITHUB_ACTION, /,
  +      );
  +    }
  +    expect(JSON.stringify(rows)).not.toMatch(/Status:/);
     });
  ```

- Task 32 `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions apply --by=owner and pending > writes a confirmation into the engine file" — taken over from Task 12; recorded `updated` after the rewrite

  ```diff
     it("writes a confirmation into the engine file", async () => {
       const { root, logs } = checkout();
       const out = path.join(logs, "build-decision-1-1.md");
       fs.writeFileSync(
         out,
         [
           "Question: CHALLENGE",
           "From: verify",
           "",
           "**Q1 — Task 3 [src/a.ts:10]:** MEDIUM: the retry has no cap. Accept it?",
           "A) Accept — the item is recorded as accepted",
           "B) Fix now — a fix task is added to the plan",
           "Recommended: A) Accept — the caller already caps it",
           "Default if unanswered: the run waits for you; taken as A when nobody can be asked",
           "Decision: A) Accept (assumed) — the caller already caps it (headless, GITHUB_ACTION, 2026-10-28)",
           "",
         ].join("\n"),
       );
  +    fs.appendFileSync(
  +      seedStatus(logs),
  +      `${JSON.stringify({
  +        type: "decision-answer",
  +        workflow: "build",
  +        at: "2026-10-28T00:00:00Z",
  +        file: path.relative(root, out),
  +        q: 1,
  +        answer:
  +          "Accept (assumed) — the caller already caps it (headless, GITHUB_ACTION, 2026-10-28)",
  +        by: "headless",
  +        assumed: true,
  +      })}\n`,
  +    );
       const before = fs.readFileSync(out, "utf-8");
       expect(fs.existsSync(engineOf(out))).toBe(false);
  +    const reasonFile = path.join(logs, "owner-reason.md");
  +    fs.writeFileSync(reasonFile, "fine\n");
       const r = await run(
  -      ["decisions", "apply", "--by=owner", `--file=${out}`, "--q=1", "--confirm", "--reason=fine"],
  +      [
  +        "decisions",
  +        "apply",
  +        "--by=owner",
  +        `--file=${out}`,
  +        "--q=1",
  +        "--confirm",
  +        `--reason-file=${reasonFile}`,
  +      ],
         root,
       );
       expect(r.code).toBe(0);
       expect(fs.readFileSync(out, "utf-8")).toBe(before);
  -    const engine = fs.readFileSync(engineOf(out), "utf-8");
  -    expect(engine).toMatch(/Decision: Accept — fine \(owner, confirmed at ship, /);
  -    expect(engine).not.toMatch(/^Status:/m);
  +    expect(fs.existsSync(engineOf(out))).toBe(false);
  +    const rows = statusRows(out);
  +    const confirmed = rows.filter((x) => x.type === "decision-answer").at(-1);
  +    expect(confirmed).toMatchObject({ q: 1, by: "owner", workflow: "ship" });
  +    expect(String(confirmed?.answer)).toMatch(/^Accept — fine \(owner, confirmed at ship, /);
  +    expect(JSON.stringify(rows)).not.toMatch(/Status:/);
     });
  ```

- Task 33 `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions apply --by=owner and pending > --answer writes the loop answer under the engine file's Q1" — taken over from Task 12; recorded `red` after the rewrite

  ```diff
     it("--answer writes the loop answer under the engine file's Q1", async () => {
  -    const { root, logs } = checkout();
  -    const out = orchestratorPause(logs, ["Task 3 [src/a.ts:10]"], 2);
  +    const { root, out } = loopPause();
       const before = fs.readFileSync(out, "utf-8");
  -    fs.writeFileSync(
  -      engineOf(out),
  -      [
  -        "Source changed: false",
  -        "Gate: FAIL",
  -        "",
  -        "build verify: attempt 2 of 2",
  -        "",
  -        "## Progress",
  -        "",
  -        "**Q1 — Verify:** decide the items below instead of another round?",
  -        "A) Try again — one more fix round runs",
  -        "B) Decide — the questions below are asked instead of another round",
  -        "Recommended: B) Decide — another round is unlikely to help",
  -        "",
  -      ].join("\n"),
  -    );
  -    const r = await run(
  -      [
  -        "decisions",
  -        "apply",
  -        "--by=owner",
  -        `--file=${out}`,
  -        "--q=1",
  -        "--answer=Try again",
  -        "--reason=one more round",
  -      ],
  -      root,
  -    );
  +    const r = await owner(root, out, "--answer=Q1=A");
       expect(r.code).toBe(0);
       expect(fs.readFileSync(out, "utf-8")).toBe(before);
  -    const engine = fs.readFileSync(engineOf(out), "utf-8");
  -    expect(engine.indexOf("Decision: Try again")).toBeGreaterThan(engine.indexOf("**Q1"));
  -    expect(engine).toContain("one more round");
  -    expect(engine).not.toMatch(/^Status:/m);
  +    expect(fs.existsSync(engineOf(out))).toBe(false);
  +    const rows = statusRows(out);
  +    const answer = rows.find((x) => x.type === "decision-answer");
  +    expect(answer).toMatchObject({ q: 1, by: "owner" });
  +    expect(String(answer?.answer)).toMatch(/^Try again/);
  +    expect(rows.indexOf(answer!)).toBeGreaterThan(
  +      rows.findIndex((x) => x.type === "decision-counts"),
  +    );
  +    expect(JSON.stringify(rows)).not.toMatch(/Status:/);
     });
  ```

- Task 33 `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions apply --by=owner and pending > --answer reads the owner's reason from --reason-file" — taken over from Task 24; recorded `red` after the rewrite

  ```diff
     it("--answer reads the owner's reason from --reason-file", async () => {
  -    const { root, logs } = checkout();
  -    const out = orchestratorPause(logs, ["Task 3 [src/a.ts:10]"], 2);
  -    fs.writeFileSync(
  -      engineOf(out),
  -      [
  -        "Source changed: false",
  -        "Gate: FAIL",
  -        "",
  -        "build verify: attempt 2 of 2",
  -        "",
  -        "## Progress",
  -        "",
  -        "**Q1 — Verify:** decide the items below instead of another round?",
  -        "A) Try again — one more fix round runs",
  -        "B) Decide — the questions below are asked instead of another round",
  -        "Recommended: B) Decide — another round is unlikely to help",
  -        "",
  -      ].join("\n"),
  -    );
  +    const { root, logs, out } = loopPause();
       const reasonFile = path.join(logs, "owner-reason.md");
  -    const words = "run `touch pwned` and $(echo hi) once more";
  -    fs.writeFileSync(reasonFile, `${words}\n`);
  -    const r = await run(
  -      [
  -        "decisions",
  -        "apply",
  -        "--by=owner",
  -        `--file=${out}`,
  -        "--q=1",
  -        "--answer=Try again",
  -        `--reason-file=${reasonFile}`,
  -      ],
  -      root,
  -    );
  -    expect(r.code).toBe(0);
  -    const engine = fs.readFileSync(engineOf(out), "utf-8");
  -    expect(engine).toMatch(/Decision: Try again/);
  -    expect(engine).toContain(words);
  +    fs.writeFileSync(reasonFile, "run `touch pwned` and $(echo hi) once more\n");
  +    const r = await owner(root, out, "--answer=Q1=A", `--reason-file=${reasonFile}`);
  +    expect(r.code).toBe(2);
  +    expect(answerRows(out)).toEqual([]);
  +    expect(fs.existsSync(engineOf(out))).toBe(false);
  +    expect(fs.existsSync(path.join(root, "pwned"))).toBe(false);
  +    expect((await owner(root, out, "--answer=Q1=A")).code).toBe(0);
  +    expect(answerRows(out)).toHaveLength(1);
     });
  ```

- Task 34 `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions check > refuses Q1 when the engine file holds the loop question" — taken over from Task 10; recorded `updated` after the rewrite

  ```diff
     it("refuses Q1 when the engine file holds the loop question", async () => {
       const { root, logs } = checkout();
       const file = orchestratorPause(logs, ["Task 3 [src/a.ts:10]"], 1);
  -    fs.writeFileSync(
  -      engineOf(file),
  -      [
  -        "Source changed: false",
  -        "",
  -        "build verify: attempt 2 of 2",
  -        "",
  -        "## Progress",
  -        "",
  -        "**Q1 — Verify:** decide the items below instead of another round?",
  -        "A) Try again — one more fix round runs",
  -        "B) Decide — the questions below are asked instead of another round",
  -        "Recommended: B) Decide — another round is unlikely to help",
  -        "",
  -      ].join("\n"),
  -    );
  +    countsRow(logs, file, {
  +      title: "Verify",
  +      question: "decide the items below instead of another round?",
  +      options: ["Try again", "Decide"],
  +      recommended: "Decide",
  +      reason: "another round is unlikely to help",
  +    });
  +    const rows = statusRows(file);
  +    expect(rows.find((x) => x.type === "decision-counts")).toMatchObject({
  +      loop: { title: "Verify", options: ["Try again", "Decide"], recommended: "Decide" },
  +    });
  +    expect(fs.existsSync(engineOf(file))).toBe(false);
       const r = await run(["decisions", "check", `--file=${file}`], root);
       expect(r.code).toBe(6);
       expect(`${JSON.stringify(r.json)}${r.err}`).toContain("Q1");
     });
  ```

- Task 34 `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions check > accepts questions numbered from Q1 when the pause has no engine file" — taken over from Task 10; recorded `updated` after the rewrite

  ```diff
     it("accepts questions numbered from Q1 when the pause has no engine file", async () => {
       const { root, logs } = checkout();
       const file = orchestratorPause(logs, ["Task 3 [src/a.ts:10]", "Task 4 [src/b.ts:2]"], 1);
       expect(fs.existsSync(engineOf(file))).toBe(false);
  +    fs.appendFileSync(
  +      seedStatus(logs),
  +      `${JSON.stringify({
  +        type: "decision-counts",
  +        workflow: "build",
  +        at: "2026-10-01T00:05:00Z",
  +        file: path.relative(path.resolve(logs, "../../../../.."), file),
  +        sourceChanged: true,
  +        gate: "PASS",
  +      })}\n`,
  +    );
  +    expect(statusRows(file).find((x) => x.type === "decision-counts")?.loop).toBeUndefined();
       const r = await run(["decisions", "check", `--file=${file}`], root);
       expect(r.code).toBe(0);
     });
  ```

- Task 34 `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions check > refuses a decision file whose question count no longer matches the engine file's loop options" — taken over from Task 25; recorded `updated` after the rewrite

  ```diff
     it("refuses a decision file whose question count no longer matches the engine file's loop options", async () => {
       const { root, logs } = checkout();
       const file = orchestratorPause(logs, ["Task 3 [src/a.ts:10]"], 2);
  -    fs.writeFileSync(
  -      engineOf(file),
  -      [
  -        "Source changed: false",
  -        "",
  -        "build verify: attempt 2 of 2",
  -        "",
  -        "## Progress",
  -        "",
  -        "**Q1 \u2014 Verify:** another fix round, or stop here?",
  -        "A) Try again \u2014 one more fix round runs",
  -        "B) Stop \u2014 the run ends here with a handover; the next run resumes here",
  -        "Recommended: B) Stop \u2014 no question is left to decide",
  -        "",
  -      ].join("\n"),
  -    );
  +    countsRow(logs, file, {
  +      title: "Verify",
  +      question: "another fix round, or stop here?",
  +      options: ["Try again", "Stop"],
  +      recommended: "Stop",
  +      reason: "no question is left to decide",
  +    });
  +    expect(statusRows(file).find((x) => x.type === "decision-counts")).toMatchObject({
  +      loop: { options: ["Try again", "Stop"], recommended: "Stop" },
  +    });
  +    expect(fs.existsSync(engineOf(file))).toBe(false);
       const r = await run(["decisions", "check", `--file=${file}`], root);
       expect(r.code).toBe(6);
       expect(`${JSON.stringify(r.json)}${r.err}`).toContain("decisions counts");
     });
  ```


## Runner output — `.bkit/core/engine/commands/workflow/decisions.test.ts`

```
     ✓ --answer reads the owner's reason from --reason-file 33ms
     ✓ --answer=Q2=B --fix-task=Q2=31 records Fix now with its task 31ms
     ✓ refuses an --answer that is not Q{n} and an option letter 36ms
     ✓ refuses --reason as an unknown flag 41ms
     ✓ a multi-line --reason-file reaches only the decisions.jsonl rationale 97ms
   ✓ bkit decisions apply --by=headless (1)
     ✓ exits non-zero on a decision file with no readable question 20ms
   ✓ bkit decisions answers (2)
     ✓ prints the last appended answer per question with its writer 21ms
     ✓ prints an old single-file decision's in-file answers 21ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/decisions.test.ts > bkit decisions apply --by=owner and pending > writes a confirmation into the engine file
AssertionError: expected 'Accept — confirmed by the owner at sh…' to match /^Accept — fine \(owner, confirmed at …/

- Expected:
/^Accept — fine \(owner, confirmed at ship, /

+ Received:
"Accept — confirmed by the owner at ship (owner, 2026-11-19)"

 ❯ .bkit/core/engine/commands/workflow/decisions.test.ts:1851:39
    1849|     const confirmed = rows.filter((x) => x.type === "decision-answer")…
    1850|     expect(confirmed).toMatchObject({ q: 1, by: "owner", workflow: "sh…
    1851|     expect(String(confirmed?.answer)).toMatch(/^Accept — fine \(owner,…
       |                                       ^
    1852|     expect(JSON.stringify(rows)).not.toMatch(/Status:/);
    1853|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 86 passed (87)
   Start at  15:24:21
   Duration  3.95s (tests 92%, import 4%, transform 3%, setup 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-W5bi1V/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
