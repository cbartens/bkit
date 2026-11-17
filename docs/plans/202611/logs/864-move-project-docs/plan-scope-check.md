Verdict: CONCERNS
Failures: 1
Redesign: false

<!-- verdict:end -->

# Plan Scope Check

Lens: Scope audit — scope, criteria, verification.

## CRITICAL

1. **Untraced extension of the template-copy module (plan edit).** In `plan-v1-draft.md:189`, the `Refresh the optional template payload` reuse row decides `EXTEND` for `.bkit/core/engine/install/template-copies.ts`, but Architecture & Component Changes has no corresponding `[MODIFY]`, and Task 1 only reads that file (`:276`). The row actually proposes extending regression coverage, while the plan's Gate 2 requires the extension to land in the named implementation. Align the row with the actual extension and its task: name the existing integration test files that receive the coverage, retain `syncTemplateCopies` as an unchanged reused candidate, and trace those files to Task 1. Alternatively, name a necessary implementation change and its task if the copy mechanism needs one. Do not introduce an unnecessary production edit just to satisfy the row.

## OPTIONAL

1. **Make the warning format concrete.** Architecture & Component Changes and Task 6 name structured warnings, topic/gap keys, attribution and deduplication, but give no filled report row. Add one example with the exact fields and how missing or malformed fields are treated. That would make the producer prompts and summary parser easier to implement consistently without changing the agreed behavior.

2. **Record the supplied context limit.** `related-failures.md` explicitly says it retained one of eight matching lines and that the dropped content was not read. Its visible entry is closed. Treat this as partial historical context, not evidence that no other related failures exist. The scope verdict rests on the complete issue requirements, draft, template and supplied plan-check report.

## OUT OF SCOPE

None. All five success criteria have implementation and verification coverage. The approved ownership migration remains in scope. The instruction changes target producer sources, and project index registration targets the consumer-owned section; no task requires hand-editing an installed managed block. The supplied plan check reports zero format problems and zero existence findings. The seven tasks respect the stated group and test caps, and every new file has a reuse reason and a task.
