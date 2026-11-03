> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/703-standardise-question-option
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" .bkit/core/engine/audits/workflows/question-option-format.test.ts

RUN v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/703-standardise-question-option

❯ .bkit/core/engine/audits/workflows/question-option-format.test.ts (11 tests | 6 failed) 39ms
❯ question option format: one layout across the corpus (7)
✓ counts the option lines found per directory 24ms
× the canonical layout letters every option and recommendation 3ms
× every option line in the workflows letters every entry 2ms
× every option line in the prompts, the templates and the authoring docs letters every entry 5ms
× every recommendation line in the workflows names a letter 1ms
× every open-question rule in the prompts names the lettered option form 3ms
× the plan template letters every option of its Open Questions placeholder 0ms
✓ question option format: the rules fire on a synthetic list (4)
✓ RED-PROOF: a synthetic `Options: A / B` line fires the option rule 0ms
✓ RED-PROOF: a synthetic `Options: Accept / Fix now` line fires the option rule 0ms
✓ RED-PROOF: a synthetic letterless `Recommended:` line fires the recommendation rule 0ms
✓ a lettered list of named options passes both rules 0ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 6 ⎯⎯⎯⎯⎯⎯⎯

FAIL .bkit/core/engine/audits/workflows/question-option-format.test.ts > question option format: one layout across the corpus > the canonical layout letters every option and recommendation
AssertionError: no `Options: A) … / B) …` in .bkit/core/.bkit/workflows.md: expected '- **Question layout**, every point: t…' to contain 'Options: A)'

Expected: "Options: A)"
Received: "- **Question layout**, every point: the `{workflow} {point}: attempt {n} of {max}` line (loop questions; `turn` for the grill), then per question `**Q{n} — {title}:** {question}`, `Options: A / B`, and `Recommended: X — {reason}` or `No recommendation — {why}`; then `Reply per question. "yes" takes every recommendation. "stop" writes a handover; the run can be resumed.` Option names: `Try again` / `Decide` / `Stop`, `Accept` / `Fix now`, `Confirm` / `Reject`."

❯ .bkit/core/engine/audits/workflows/question-option-format.test.ts:209:75
207|
208| it("the canonical layout letters every option and recommendation", (…
209| expect(layoutBullet(), `no \`Options: A) … / B) …\` in ${CANONICAL…
| ^
210| expect(layoutBullet(), `no \`Recommended: A) X — {reason}\` in ${C…
211| "Recommended: A)",

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/6]⎯

FAIL .bkit/core/engine/audits/workflows/question-option-format.test.ts > question option format: one layout across the corpus > every option line in the workflows letters every entry
AssertionError: expected [ …(6) ] to deeply equal []

- Expected

* Received

- []

* [
* ".bkit/core/workflows/bkit-debug.md:108: `Try again` — write `A) {option}`",
* ".bkit/core/workflows/bkit-debug.md:108: `Stop` — write `B) {option}`",
* ".bkit/core/workflows/bkit-ship.md:304: `Confirm` — write `A) {option}`",
* ".bkit/core/workflows/bkit-ship.md:304: `Reject` — write `B) {option}`",
* ".bkit/core/workflows/bkit-ship.md:601: `Try again` — write `A) {option}`",
* ".bkit/core/workflows/bkit-ship.md:601: `Stop` — write `B) {option}`",
* ]

❯ .bkit/core/engine/audits/workflows/question-option-format.test.ts:216:45
214|
215| it("every option line in the workflows letters every entry", () => {
216| expect(optionViolationsIn([WORKFLOWS])).toEqual([]);
| ^
217| });
218|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/6]⎯

FAIL .bkit/core/engine/audits/workflows/question-option-format.test.ts > question option format: one layout across the corpus > every option line in the prompts, the templates and the authoring docs letters every entry
AssertionError: expected [ …(5) ] to deeply equal []

- Expected

* Received

- []

* [
* ".bkit/core/docs/templates/bkit-plan.md:107: `** A — [option, trade-off]` — write `A) {option}`",
* ".bkit/core/docs/templates/bkit-plan.md:107: `B — [option, trade-off]` — write `B) {option}`",
* ".bkit/core/docs/templates/bkit-plan.md:107: `C — [option, trade-off, optional]` — write `C) {option}`",
* ".bkit/core/.bkit/workflows.md:924: `A` — write `A) {option}`",
* ".bkit/core/.bkit/workflows.md:924: `B` — write `B) {option}`",
* ]

❯ .bkit/core/engine/audits/workflows/question-option-format.test.ts:220:65
218|
219| it("every option line in the prompts, the templates and the authorin…
220| expect(optionViolationsIn([PROMPTS, TEMPLATES, AUTHORING])).toEqua…
| ^
221| });
222|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/6]⎯

FAIL .bkit/core/engine/audits/workflows/question-option-format.test.ts > question option format: one layout across the corpus > every recommendation line in the workflows names a letter
AssertionError: expected [ …(4) ] to deeply equal []

- Expected

* Received

- []

* [
* ".bkit/core/workflows/bkit-debug.md:108: `Recommended: {Try again|Stop} — {the trend: failures falling → Try again, else Stop}` — name the recommended letter",
* ".bkit/core/workflows/bkit-design.md:243: `Recommended: {answer}` — name the recommended letter",
* ".bkit/core/workflows/bkit-design.md:263: `Recommended: yes` — name the recommended letter",
* ".bkit/core/workflows/bkit-ship.md:601: `Recommended: {Try again when the diagnosis names a cause, else Stop} — {reason}` — name the recommended letter",
* ]

❯ .bkit/core/engine/audits/workflows/question-option-format.test.ts:224:53
222|
223| it("every recommendation line in the workflows names a letter", () =…
224| expect(recommendationViolationsIn([WORKFLOWS])).toEqual([]);
| ^
225| });
226|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/6]⎯

FAIL .bkit/core/engine/audits/workflows/question-option-format.test.ts > question option format: one layout across the corpus > every open-question rule in the prompts names the lettered option form
AssertionError: expected [ …(7) ] to deeply equal []

- Expected

* Received

- []

* [
* ".bkit/core/prompts/bkit-design-generate.md:133: [Unknowns, dependencies, assumptions; plain bullets. All open questions MUST carry 2-3 concrete options with trade-offs, a `Recommended` option with one-line rationale, and a `Default if unanswered`; bare questions are not acceptable output; no options / recommendation = incomplete → resolve or drop. Initially set to `PENDING`.]",
* ".bkit/core/prompts/bkit-design-review-2.md:76: 8. Failure-mode coverage: cross-check `Risks & Open Questions` covers enumerated failure modes. Gaps → `OPTIONAL` or `CRITICAL` by `severity`. Any open questions lacking options, `Recommended` or `Default if unanswered` → `OPTIONAL` findings naming missing parts.",
* ".bkit/core/prompts/bkit-design-update.md:65: 8. **If** applied findings add / reword open questions under `Risks & Open Questions` → each MUST carry 2-3 concrete options with trade-offs, a `Recommended` option with one-line rationale, and a `Default if unanswered`; bare questions are not acceptable output. Questions in regions no finding touches stay verbatim.",
* ".bkit/core/prompts/bkit-plan-generate.md:43: - **Open questions:** Each open question gives 2-3 options with their trade-offs, a recommendation and the default if unanswered; the design's options and recommendation carry forward where it already answered. Each assumption names what breaks if it is wrong.",
* ".bkit/core/prompts/bkit-plan-review-1.md:37: - **Open questions:** Each open question gives 2-3 options with their trade-offs, a recommendation and the default if unanswered; the design's options and recommendation carry forward where it already answered. Each assumption names what breaks if it is wrong.",
* ".bkit/core/prompts/bkit-plan-scope-check.md:37: - **Open questions:** Each open question gives 2-3 options with their trade-offs, a recommendation and the default if unanswered; the design's options and recommendation carry forward where it already answered. Each assumption names what breaks if it is wrong.",
* ".bkit/core/prompts/bkit-plan-update.md:38: - **Open questions:** Each open question gives 2-3 options with their trade-offs, a recommendation and the default if unanswered; the design's options and recommendation carry forward where it already answered. Each assumption names what breaks if it is wrong.",
* ]

❯ .bkit/core/engine/audits/workflows/question-option-format.test.ts:235:17
233| .filter((r) => !LETTER.test(r.text))
234| .map((r) => `${r.file}:${r.no}: ${r.text.trim()}`);
235| expect(bad).toEqual([]);
| ^
236| });
237|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/6]⎯

FAIL .bkit/core/engine/audits/workflows/question-option-format.test.ts > question option format: one layout across the corpus > the plan template letters every option of its Open Questions placeholder
AssertionError: expected [ …(3) ] to deeply equal []

- Expected

* Received

- []

* [
* ".bkit/core/docs/templates/bkit-plan.md:107: `** A — [option, trade-off]` — write `A) {option}`",
* ".bkit/core/docs/templates/bkit-plan.md:107: `B — [option, trade-off]` — write `B) {option}`",
* ".bkit/core/docs/templates/bkit-plan.md:107: `C — [option, trade-off, optional]` — write `C) {option}`",
* ]

❯ .bkit/core/engine/audits/workflows/question-option-format.test.ts:244:69
242| `no \`Options:\` list in the ${PLAN_TEMPLATE} placeholder`,
243| ).toBeGreaterThan(0);
244| expect(optionViolations(PLAN_TEMPLATE, open.text, open.offset)).to…
| ^
245| });
246| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/6]⎯

Test Files 1 failed (1)
Tests 6 failed | 5 passed (11)
Start at 18:21:39
Duration 120ms (tests 62%, transform 27%, setup 6%, import 2%, worker 2%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-waWXkm/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
