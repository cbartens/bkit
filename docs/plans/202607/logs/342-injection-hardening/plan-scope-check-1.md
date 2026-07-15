Verdict: CONCERNS
Failures: 4

<!-- verdict:end -->

# Plan Scope Check

Lens: Scope, criteria, verification audit.

**Structural checks passed.** Template adherence: all mandated sections present and populated. Matrix ↔ runbook maps 1:1 bidirectionally (8 rows → T2.2, T2.3, T6.1-T6.5, T7.2; no orphan rows, no unmapped verification tasks). Supersession Inventory: 2 rows, both `DELETE`, both mirrored in `Architecture & Component Changes` **and** as removal tasks (T3.1, T5.1). Every scope item carries a build task; every scope item except three doc-index edits carries a verification task (see OPTIONAL 3).

**Managed-block note (not a finding):** T1.1 / T1.2 / T2.1 / T5.1 all scope edits _inside_ `bkit:start`→`bkit:end`. In the bkit repo these blocks are the canonical authored source mirrored to `.bkit/templates/`, gated by `bkit check` + `bkit-rules-sync` byte-equality — the established pattern, not the consumer-side "always edit below `bkit:end`" prohibition. T1.1 correctly authors the template **first**, then mirrors.

**Deliberate deviations — both properly scoped and flagged.** (1) `docs/security.md` managed-block placement: routed to human sign-off (Breaking Changes item 2), reasoned from the dangling-consumer-pointer edge case, and — critically — _verified_, by T2.3 (matrix row 2) plus Manual Step 3, not just asserted. (2) `.bkit/workflows.md` index-drift task T4.3: explicitly marked "not in the design", scoped to the new row only, with the other 16 rows' stale "five" fenced into § Out of Scope with a stated reason for not using `deferrals.jsonl`. Both upheld.

## CRITICAL

1. **T3.2's corroborating `Done when` asserts a count that can never be returned — verified false against this tree.** The plan states: _"corroborated by `grep -l 'do NOT trust session memory' .bkit/prompts/*.md | wc -l` returning **46** (the line is universal)"_. It returns **45**. `.bkit/prompts/bkit-utility-compress-markdown.md` contains **zero** matches for even the loose substring `session memory` — the line is **not** universal. (Contrast the anchor claim, which I confirmed: `^> - \*\*No commits:\*\*` is genuinely 46/46.) This is the same defect class T3.2's own `> [!NOTE]` claims to have retired: the draft swapped an _unverifiable_ assertion for a _false_ one, and the NOTE's confident "(the line is universal)" is what makes it dangerous — a build agent hitting 45 will read a red as its own error and start "fixing" a file that was never in scope. Fix: assert **45**, or drop the corroborator entirely (it is redundant once CRITICAL 4 is fixed) — and delete the "universal" parenthetical either way.

2. **T1.2's primary `Done when` grep is unrunnable as written and would return 0, not 1.** Three compounding defects in `` `grep -c '| \`docs/security.md\` |'` ``:
   - **No file operand** → grep reads stdin and hangs. The clause says "returns 1 for each", but names no files to iterate.
   - **Backslashes land in the pattern.** Inside shell single quotes `\`` is a literal backslash+backtick, so the pattern contains backslashes absent from the real row. Verified actual row at `.agents/docs.md:29`: ``| `docs/security.md` | ● | ● | ● | ○ | ○ | Authentication, authorization, input validation, rate limiting, secrets management, PII handling. |`` → the pattern matches nothing → 0, never 1.
   - **Corrupted markdown.** A single-backtick code span cannot contain backticks, and spaces are missing throughout: `` `…|'`returns 1 for each ``, `` inside`bkit:start` ``, `` `pnpm bkit check`exits 0;`pnpm format:check`+ ``. The clause does not render as authored.
     Fix: put it in a fenced block and use `grep -cF '| `docs/security.md` |' .agents/docs.md .bkit/templates/.agents/docs.md`.

3. **T1.1 leaves the `> **Purpose:**` line un-scoped in the very file it edits — the exact index-drift class the plan elevated T1.2 to close.** Verified: both `docs/security.md` and `.bkit/templates/docs/security.md` open their managed block with `> **Purpose:** Authentication, authorization, input validation, rate limiting, secrets management, PII handling.` — the _identical sentence_ T1.2 extends in `.agents/docs.md`. So the scope sentence has **three** synced copies, and the plan scopes only two. T1.1 adds an entire new top-level domain (`## Untrusted Content & Prompt Injection`) while the doc's own purpose statement still fails to name it, and **both T1.1's and T1.2's `Done when` lines pass while this drifts**. This is not new scope: it is one line, in a file T1.1 already opens, inside the managed block T1.1 already mirrors. Add it to T1.1's scope + `Done when` (both files, byte-identical, before `bkit:end`).

4. **T3.2's `git diff -U0` check is baseline-dependent and can go vacuously green — the NOTE's "self-contained" claim is wrong.** `git diff -U0 .bkit/prompts/ | grep -c '^[-+].*do NOT trust session memory'` does not compare against a fixed baseline; it compares against the **index**. If anything is staged or committed between T3.1 and T3.2's verification, the diff is empty and the count is 0 → the check passes having proven nothing. This is not hypothetical: `bkit-auto.md:25` § Git mandates _"Orchestrator commits right after every subgent return"_, and the runbook nowhere forbids an intermediate commit — the Merge Method section only constrains the **PR** to one squash, not the branch to one commit. So the plan's stated defence ("needs no pre-edit baseline, and proves the stronger untouched property") holds only under an execution mode the plan never pins. Fix: `git diff -U0 HEAD -- .bkit/prompts/` (or the merge-base against `dev`), which is stable across staging and intermediate commits.

## OPTIONAL

1. **T6.2 / T6.3 / T7.1 hard-code counts the plan's own § Verified Baseline says will drift.** T6.2's `Done when` says _"passes with **46** prompt cases executed (count re-derived, not asserted as a literal)"_ — but the parenthetical governs the **test**, while 46 is asserted in the **`Done when`**, which plan-verify reads literally. § Verified Baseline's CAUTION explicitly says a differing re-derived count is _"expected and fine"_ and to not "fix" the delta — so a prompt landing on `dev` before this merges makes T6.2 (47 ≠ 46), T6.3, and T7.1's five mirror counts all read false while the gate is working perfectly. Reword to a relation, not a literal: "one case per enumerated file; case count equals `ls .bkit/prompts/*.md | wc -l`". Same for T7.1's mirror counts (per-provider file count equals the source count).

2. **T1.2 is a third plan-vs-design deviation, only half-flagged.** It is argued in-task ("consistency, not scope creep" — I agree on the merits) and § Security & Privacy names the `.agents/docs.md` scope cell as shipped surface. But `.bkit/templates/.agents/docs.md` **ships to consumers**, and the Breaking Changes sign-off lists exactly four items, none of which is T1.2 (item 1 covers only rendered _prompts_). If the plan puts the `docs/security.md` deviation to a human, the same standard argues for a one-line mention here.

3. **T1.2 and T4.3 are review-verified only, without the explicit grant that T5.1 gets.** Success Criterion 6 does the honest thing for `.bkit/prompts.md` — states plainly that it sits outside both globs and is _"verified by review of the deliverable, not by the gate"_. T1.2 and T4.3 are in the identical position (no matrix row, no Success Criterion, `bkit check` covers only template↔repo drift, not content) but get that status implicitly. One sentence granting them the same explicit label would stop a successor reading their green as gate-backed.

4. **Success Criteria carries 6 bullets; `docs/plans/template.md` § Spec caps it at ≤5.** Marked _"inherited from design — do not rewrite"_, so it is not the plan's to fix unilaterally, and criterion 6 is load-bearing (it is the only thing covering the `.bkit/prompts.md` supersession). Noted for completeness, not for action.

5. **The template's `### Spec — what good looks like` block and `Tier key` table are absent from the plan's Acceptance Scenario.** Every substantive section is present and populated, and the Spec block reads as authoring guidance to the plan-generate agent rather than plan content — the plan also substitutes a stronger, change-specific tier rationale. Recording the omission, not objecting to it.

## OUT OF SCOPE

_Recorded as deferrals; not applied to the plan. Do not absorb these into #342 — the PR is already 54 files._

1. **The 3 hand-authored `.claude/agents/utility-*.md` in the threat model.** Verified: `.claude/agents/` holds 49 files — 46 `bkit-*` mirrors + `utility-harvest-friction`, `utility-new-release`, `utility-pre-release-check`, which have no `.bkit/prompts/` source and can never be reached by the glob. At least two ingest attacker-influenced text (CI output, `friction.jsonl`). The plan already routes this to a follow-up issue and T7.1's CAUTION correctly stops the runbook mis-verifying against them. Correct handling — leave as-is.

2. **`.bkit/workflows.md:143`'s "change all five workflow files" for the other 16 rows.** Pre-existing drift, independent of this change. Already fenced in § Out of Scope with a sound reason for recording it there rather than in `docs/deferrals.jsonl` (T5.2 requires that ledger be unchanged).

3. **Gating Success Criterion 6's ~4 lines** (raised as an OPTIONAL in `plan-review-3.md`). Two path-specific asserts against `.bkit/prompts.md` in the new test file would convert the plan's only ungated supersession into an enforced one without touching the glob design. Genuine expansion — record as a deferral if wanted; do not absorb.
