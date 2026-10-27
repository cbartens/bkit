Verdict: CONCERNS
Failures: 0

<!-- verdict:end -->

# Build Challenge

Lens: Bugs and edge cases — null safety, off-by-one, error paths, data integrity.

## Findings Log

Three findings, none `CRITICAL`: worst first. One is a design-review criterion this change silently narrowed while the
two design prompts still demand it and the prompts index still says the review checks it; two are holes in the new
corpus audit — a false negative (any `X)` in a reason satisfies the recommendation rule) and a false positive (any `/`
inside an option's own text splits the entry). Evidence: `git diff origin/dev` read in full; the round-1 fixes
re-verified by reverting each guarded line and watching the audit fail; the two audit holes reproduced with the audit's
own helpers via throwaway probes under `tmp/` (both removed); `decisions`, `challenge`, `steps`, `render/trackers`,
`tools/instructions`, `audits/workflows` and `bkit check` (`0 write(s) would occur`) green, and a full `pnpm test` green
(199 files, 7869 passed, 1 skipped).

**Round 1's three MEDIUM fixes hold.** Reverted each guarded line in turn on this tree: the second `Options:` list on
`.bkit/core/.bkit/authoring.md:114` now yields two violations (`Accept`, `Fix now` — zero before the fix); the plan
template's `**Recommended:** [A] — [why, 1 line]` yields `bkit-plan.md:108: … name the recommended letter`; and
`.bkit/core/.bkit/prompts.md:267` yields its own violation plus `.bkit/prompts.md is stale — run the dogfood install`
when the mirror is the stale side, so the mirror assertion is live, not decorative.

**Both deferred LOWs are still present, unchanged** (`docs/deferrals.jsonl` rows
`703-standardise-question-option-challenge-low-…decisions-ts-52` and `…steps-ts-463`): `letterAt`
(`decisions.ts:52`) still walks past `Z` into `[` for a 27-option item, and `writeStepRow`'s rollback
(`steps.ts:463-472`) still truncates to the pre-append offset — and still `rmSync`s the whole file when it did not
exist before the call — so a row another writer appended in that window is lost while the exit code says nothing was
written. Not re-raised here; no new task.

**One unreproducible full-suite failure.** The first full `pnpm test` on this tree failed one test —
`upgrade.integration.test.ts` `an adopted copy of every template survives upgrade and check`, its `bkit check` reporting
4 writes (`.claude/commands/bkit-plan.md`, `.cursor/commands/bkit-build.md`, `.cursor/commands/bkit-plan.md`, the
version pin). The same file passes standalone (54/54) and a second full `pnpm test` was green, so I cannot attribute it
to this diff and do not raise it as a finding; it is recorded here because the mirrors it named are the two workflows
this run edited, and because this repo already carries four `docs/failures.jsonl` rows of the same "green standalone,
red under the full suite" shape.

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** The design review's open-question criterion dropped `Default if unanswered`, so a design whose open question carries options and a lettered `Recommended` but no default passes `bkit-design-review-2` while `bkit-design-generate` and `bkit-design-update` still demand that default and the prompts index still tells a reader the review checks it
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/prompts/bkit-design-review-2.md:76`
  - **DONE WHEN:** the design review enumerates every part the design prompts require of an open question — lettered options, a lettered `Recommended`, and `Default if unanswered` — so an open question missing its default is flagged again; `.bkit/core/.bkit/prompts.md:257`, the regenerated `.bkit/prompts.md` and `.claude/agents/bkit-design-review-2.md`, `.cursor/`, `.codex/` and `.opencode/` mirrors carry the same three parts, and `bkit check` stays drift-clean after the install.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `the design review names every part the design prompts require` fails while `.bkit/core/prompts/bkit-design-review-2.md:76` reads ``lacking lettered options (`A)`, `B)`, `C)`) or a lettered `Recommended` `` and never names `Default if unanswered`, which `.bkit/core/prompts/bkit-design-generate.md:133` and `.bkit/core/prompts/bkit-design-update.md:65` still require.

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** The recommendation rule passes on any `X)` anywhere in the tail, so a line can revert to a letterless `Recommended:` and stay green — `Recommended: Fix now — the A) path already caps it` reports zero violations
      **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/audits/workflows/question-option-format.test.ts:55`
  - **DONE WHEN:** the rule requires the tail to name the recommended option's own letter — a leading `{letter}) `, as `Recommended: A) Fix now — …` writes it — so `Recommended: Fix now — the A) path already caps it` fails, and the corpus's four real `Recommended:` tails (`.bkit/core/workflows/bkit-debug.md:108`, `bkit-ship.md:601`, `bkit-design.md:243` and `:263`) plus the plan template's still pass.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `RED-PROOF: a letterless Recommended: whose reason carries a stray A) still fires the rule` fails while `LETTER = /[A-Z]\)/` matches the `A)` inside the reason, so `recommendationViolations` returns `[]` for the line (probe output: `tails: ["Fix now — the A) path already caps it"]`, `violates: []`).

<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->

- [ ] **TASK 3:** Every `/` inside an option's own text splits that entry, so a legitimate list such as `Options: A) keep the read/write split · B) merge them` reports two bogus violations and tells the writer to letter entries `B)` and `C)` that do not exist
      **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/audits/workflows/question-option-format.test.ts:50`
  - **DONE WHEN:** an entry whose own text carries `/` (`A) n/a`, `A) read/write`) reads as one entry, while `A) Accept / B) Fix now` and `` `Options: A) {option} — {trade-off} · B) …` `` still read as two, and the four corpus assertions plus the not-vacuous guard stay green.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `an option entry whose own text carries a slash is one entry` fails while `ENTRY_SEPARATOR = /\s*(?:\/|·)\s*/` splits `A) keep the read/write split · B) merge them` into `["A) keep the read", "write split", "B) merge them"]`, yielding `` write split — write `B) {option}` `` and `` B) merge them — write `C) {option}` `` (probe output).

<!-- bkit:task 3 end -->
