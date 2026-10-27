
> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/703-standardise-question-option
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" .bkit/core/engine/audits/workflows/question-option-format.test.ts


 RUN  v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/703-standardise-question-option

 ❯ .bkit/core/engine/audits/workflows/question-option-format.test.ts (15 tests | 1 failed) 152ms
   ❯ question option format: one layout across the corpus (9)
     ✓ counts the option lines found per directory 94ms
     ✓ the canonical layout letters every option and recommendation 2ms
     ✓ every option line in the workflows letters every entry 5ms
     ✓ every option line in the prompts, the templates and the authoring docs letters every entry 23ms
     ✓ every recommendation line in the workflows names a letter 2ms
     ✓ every recommendation line in the templates and the prompts names a letter 10ms
     ✓ every open-question rule in the prompts names the lettered option form 7ms
     × every open-question rule in the prompts index names the lettered option form 6ms
     ✓ the plan template letters every option of its Open Questions placeholder 1ms
   ✓ question option format: the rules fire on a synthetic list (6)
     ✓ RED-PROOF: a synthetic `Options: A / B` line fires the option rule 0ms
     ✓ RED-PROOF: a synthetic `Options: Accept / Fix now` line fires the option rule 0ms
     ✓ RED-PROOF: a synthetic letterless `Recommended:` line fires the recommendation rule 0ms
     ✓ RED-PROOF: a second Options: list on one line still fires the option rule 0ms
     ✓ an option list whose entries span code spans letters every entry 0ms
     ✓ a lettered list of named options passes both rules 0ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/workflows/question-option-format.test.ts > question option format: one layout across the corpus > every open-question rule in the prompts index names the lettered option form
AssertionError: expected [ …(6) ] to deeply equal []

- Expected
+ Received

- []
+ [
+   ".bkit/core/.bkit/prompts.md:255: | `bkit-design-generate` | Generate unified design draft from brainstorms and the design input; the input's `Grill decisions` section (design Step 3) holds the human's answers — `Settled` entries are strong pointers, not hard constraints — followed unless a brainstorm shows the answer fails; a departure gets a `Decisions` row and a `Risks & Open Questions` item asking the human to confirm. `Assumed, not confirmed` entries are defaults it may override with a stated reason; each `Open` entry becomes a `Risks & Open Questions` item. The section's `Draft Acceptance Scenario`, labelled `DRAFT only`, is the starting point for the design's `Acceptance Scenario`; every change to it gets a `Decisions` row, no confirmation item, because the human confirms the scenario again at the plan's `Acceptance Scenario confirmed` box. It reads the input directly because the ideate triplet may not carry every decision through. Emits `Reuse & Prior Art` (default `EXTEND`): duplication is cheapest to decide at design — net-new committed here is expensive to unwind at plan or build. Every net-new `Architecture` component traces to a `NEW` verdict; plan phase starts `Reuse Inventory` from it. Verdict only — sources, absence proof and rejected `NEW` reasons are checked by `bkit-design-review-1` and evidenced in the plan's `Search performed`. Appends `docs/deferrals.jsonl` if applicable. Does not write `docs/decisions.jsonl` — the design phase reads ADRs but never authors them (decisions land via debug remediation or build / ship doc-integration). Open questions in `Risks & Open Questions` are never bare — each carries 2-3 concrete options with trade-offs, a `Recommended` option and a `Default if unanswered`; the design phase states this requirement itself and does not read the plan template. |",
+   ".bkit/core/.bkit/prompts.md:257: | `bkit-design-review-2` | Same as `-1`; runs in parallel with cross-tier model diversity. Also audits `Risks & Open Questions` format — question missing options, `Recommended` or `Default if unanswered` → OPTIONAL. Does not emit `Spike`. |",
+   ".bkit/core/.bkit/prompts.md:259: | `bkit-design-update` | Apply CRITICAL items and OPTIONAL items judged on merit from both reviews; whole-doc rewrite of design. Open questions a finding adds or rewords carry options, `Recommended` and `Default if unanswered`; untouched regions stay verbatim. |",
+   ".bkit/core/.bkit/prompts.md:267: | `bkit-plan-generate` | Read design and / or audit reports + template + docs → write new plan draft. Design absent and audits present is valid. Neither present → the issue is the source: a change-shape issue's `Narrative`, `Success Criteria`, `Edge Cases`, matrix rows and tasks carry over verbatim (Contract `Acceptance Scenario` and `Scenario detail`). Audit contract: if input includes audit-scope directives, plan covers only those findings; the rest of each report is context only, not backlog. Workstream contract: if input includes `**Workstream:**` directive, plan covers only that workstream's `## Scope` content unless stated otherwise; surface `**Requires:**` at top of plan. Process = one step per major template section in **dependency (authoring) order, not template document order** — derived sections (Breaking Changes, Supersession, Security, Docs, Rollback) follow Architecture rather than preceding it: Context → Acceptance Scenario → Derived Test Matrix → Open Questions → Pre-Flight → Alternatives → Data Schema → Reuse Inventory → Architecture (+ `decisions.jsonl`) → Breaking Changes → Supersession → Security → Docs → Rollback → Out of Scope → Suggested Scope Expansion → Agent Execution Runbook (groups of task blocks in build order, each group and task within the `bkit.workflows.tasks` caps the workflow passes in Context; pick tests from matrix only; each row → exactly one task; every task has `DONE WHEN`; `READ` / `UPDATE` / `DELETE` only for symbols it opened; never writes its own `TEST EXCEPTION`, copies an input's word for word) → Verification. The workflow runs `bkit tests plan-check --existence=refuse` on the draft straight after; exit 1 re-invokes it once to fix only the lines the report names. Human-confirmation checkboxes stay unchecked at generate. Each section group lands in the draft before reading for the next group starts, so a turn-cap stop leaves finished groups on disk, not an all-`PENDING` stub. Every `Open Questions & Assumptions` question carries 2-3 concrete options with trade-offs, a `Recommended` option and a `Default if unanswered` (design's answer carried forward where it has one); a bare question is not acceptable output. `Out of Scope` entries must be `Exempt` (genuinely-additive), else a runbook task. `Suggested Scope Expansion` holds candidates, not tasks; no tracker / ledger scan here — surface overlaps come from the orchestrator Fetch Context step via `bkit-plan-review-1`. |",
+   ".bkit/core/.bkit/prompts.md:270: | `bkit-plan-scope-check` | Internal-completeness scope audit; one slot, parallel with both reviewers on the draft (`medium` effort, opus model — depth-sensitive lens). Owns the template checks: sections present; `Acceptance Scenario` / `Derived Test Matrix` missing or vague → CRITICAL; `Open Questions & Assumptions` question missing options, `Recommended` or `Default if unanswered` → OPTIONAL (mirrors `bkit-design-review-2` on the design side). Per-task `DONE WHEN` / `TEST FIRST` are not this lens: `bkit tests plan-check` refuses a task missing either after every plan write. `Blocking` out-of-scope deferral → CRITICAL. Duplication guard is bidirectional: `Supersession Inventory` catches code the plan replaces but never deletes; `Reuse Inventory` catches capability the plan rebuilds instead of extending. Recorded search (exact commands, not a claim) is the evidence — empty `Search performed` = unsearched, not absence; untraced `[NEW]` → CRITICAL. FAIL only for a matrix-to-runbook mapping no plan edit recovers — a broken template and every other gap is CRITICAL → CONCERNS so `bkit-plan-update` repairs it. |",
+   ".bkit/core/.bkit/prompts.md:271: | `bkit-plan-update` | Merge review / scope critique notes → in-place plan edits + record log. Invariant: every task's `**DONE WHEN:**` and `**TEST FIRST:**` fields survive critique-merge (may be tightened, `n/a` → named tests included; never removed / weakened). Writes review's `Suggested Scope Expansion` candidates into the plan section (advisory; never tasks). Open questions a finding adds or rewords carry options, `Recommended` and `Default if unanswered`; untouched regions stay verbatim. Human-confirmation checkboxes survive the merge as found — an unconditional invariant beside `DONE WHEN`, not a clause of the open-question rule. Mirrors to `docs/deferrals.jsonl` only the `Out of Scope` `Exempt` rows its merge adds; `Suggested Scope Expansion` candidates are never appended — most were read from that ledger, so appending duplicates them. Writes a `docs/decisions.jsonl` row per decision its merge adds or changes, same `key` when changed, and keeps the plan's `**Ledger rows:**` line current for plan close's `bkit ledgers check`. |",
+ ]

 ❯ .bkit/core/engine/audits/workflows/question-option-format.test.ts:284:17
    282|       .filter((rule) => !LETTER.test(rule.text))
    283|       .map((rule) => `${PROMPTS_INDEX}:${rule.no}: ${rule.text.trim()}…
    284|     expect(bad).toEqual([]);
       |                 ^
    285|     expect(
    286|       indexOpenQuestionRules(PROMPTS_INDEX_MIRROR).map((rule) => rule.…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 14 passed (15)
   Start at  06:38:54
   Duration  307ms (tests 74%, transform 19%, setup 4%, import 2%, worker 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-iKkGy4/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
