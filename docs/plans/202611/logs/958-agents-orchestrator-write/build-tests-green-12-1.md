Enforced: true
Verdict: PASS
Gaps: 0
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/958-agents-orchestrator-write-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 43 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions check > refuses a decision file whose question count no longer matches the engine file's loop options" | red | passed |
| 44 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions apply --by=owner and pending > writes a confirmation into the engine file" | updated | passed |

## Gaps

None.

## Updated tests

- Task 44 `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions apply --by=owner and pending > writes a confirmation into the engine file" — an existing test the tests step changed since `0431e556f`; the update may add expectations, never remove or loosen one. not additive: a line of the test was removed or changed — read the diff for an expectation removed or loosened

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
  +    expect(String(confirmed?.answer)).toMatch(/^Accept — /);
  +    expect(String(confirmed?.answer)).not.toContain("fine");
  +    expect(JSON.stringify(rows.at(-1))).not.toContain("fine");
  +    expect(JSON.stringify(rows)).not.toMatch(/Status:/);
     });
  ```


## Taken over

- Task 44 `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions apply --by=owner and pending > writes a confirmation into the engine file" — taken over from Task 38; recorded `updated` after the rewrite

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
       fs.appendFileSync(
         seedStatus(logs),
         `${JSON.stringify({
           type: "decision-answer",
           workflow: "build",
           at: "2026-10-28T00:00:00Z",
           file: path.relative(root, out),
           q: 1,
           answer:
             "Accept (assumed) — the caller already caps it (headless, GITHUB_ACTION, 2026-10-28)",
           by: "headless",
           assumed: true,
         })}\n`,
       );
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
       expect(fs.existsSync(engineOf(out))).toBe(false);
       const rows = statusRows(out);
       const confirmed = rows.filter((x) => x.type === "decision-answer").at(-1);
  -    expect(confirmed).toMatchObject({ q: 1, by: "owner" });
  -    expect(String(confirmed?.answer)).toMatch(/^Accept — fine \(owner, confirmed at ship, /);
  +    expect(confirmed).toMatchObject({ q: 1, by: "owner", workflow: "ship" });
  +    expect(String(confirmed?.answer)).toMatch(/^Accept — /);
  +    expect(String(confirmed?.answer)).not.toContain("fine");
  +    expect(JSON.stringify(rows.at(-1))).not.toContain("fine");
       expect(JSON.stringify(rows)).not.toMatch(/Status:/);
     });
  ```

