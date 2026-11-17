Verdict: CONCERNS
Failures: 0
<!-- verdict:end -->

# Plan Summary

## Verdict

CONCERNS

- plan-apply-review CONCERNS

## Steps

<!-- prettier-ignore -->
| Step | Verdict | Failures | Attempts | Artifact |
| --- | --- | --- | --- | --- |
| plan-start-workflow | - | - | 1 | - |
| plan-worktree-setup | - | - | 1 | `docs/plans/202611/logs/915-min-push-ignores/plan-input-1.md` |
| plan-generate | - | - | 1 | `docs/plans/202611/logs/915-min-push-ignores/plan-v1-draft.md`, `docs/plans/202611/logs/915-min-push-ignores/plan-generate-check.md` |
| plan-fetch-context | - | - | 1 | `docs/plans/202611/logs/915-min-push-ignores/related-deferrals.md`, `docs/plans/202611/logs/915-min-push-ignores/related-failures.md`, `docs/plans/202611/logs/915-min-push-ignores/related-issues.md` |
| plan-review | CONCERNS | 4 | 1 | `docs/plans/202611/logs/915-min-push-ignores/plan-review-1.md`, `docs/plans/202611/logs/915-min-push-ignores/plan-review-2.md`, `docs/plans/202611/logs/915-min-push-ignores/plan-scope-check.md` |
| plan-apply-review | CONCERNS | - | 1 | `docs/plans/202611/logs/915-min-push-ignores/plan-v2-reviewed.md`, `docs/plans/202611/logs/915-min-push-ignores/plan-update-check.md` |

## Resolved Findings

None

## Reassessed Findings

- plan-review CONCERNS, remaining findings assessed by plan-apply-review

## Assessment History

<!-- prettier-ignore -->
| Step | Verdict | Attempt | Artifact |
| --- | --- | --- | --- |
| plan-start-workflow | - | - | - |
| plan-worktree-setup | - | - | `docs/plans/202611/logs/915-min-push-ignores/plan-input-1.md` |
| plan-generate | - | 1 | `docs/plans/202611/logs/915-min-push-ignores/plan-v1-draft.md`, `docs/plans/202611/logs/915-min-push-ignores/plan-generate-check.md` |
| plan-fetch-context | - | 1 | `docs/plans/202611/logs/915-min-push-ignores/related-deferrals.md`, `docs/plans/202611/logs/915-min-push-ignores/related-failures.md`, `docs/plans/202611/logs/915-min-push-ignores/related-issues.md` |
| plan-review | CONCERNS | 1 | `docs/plans/202611/logs/915-min-push-ignores/plan-review-1.md`, `docs/plans/202611/logs/915-min-push-ignores/plan-review-2.md`, `docs/plans/202611/logs/915-min-push-ignores/plan-scope-check.md` |
| plan-apply-review | CONCERNS | 1 | `docs/plans/202611/logs/915-min-push-ignores/plan-v2-reviewed.md`, `docs/plans/202611/logs/915-min-push-ignores/plan-update-check.md` |

## Acceptance Scenario

> [!CAUTION]
> 🛑 The owner reads and confirms this section.
> This is the feature's testable contract. The implementation, the tests and the verification all follow from what you confirm here, so a mistake here carries into every later step.
>
> **You only need 👤-marked sections** (Acceptance Scenario, Breaking Changes, Open Questions & Assumptions). The agent handles the rest.

### Narrative

⚠️ MISSING: no design doc, no issue Narrative and no audit report — human must provide before plan proceeds

### Success Criteria

⚠️ MISSING: no design doc, no issue Narrative and no audit report — human must provide before plan proceeds

### Process Sketch

- **WHEN** an operator pushes a `[skip ci]` commit to `dev` whose files outside the plans tree are an audit report under `docs/audits/**` and the `Project Instructions` section of a `docs/templates/bkit-audit-*.md` **→ THEN** `bkit ci min-push` accepts every file, the hook runs `bkit:gate:min` and the push goes through.
- **WHEN** the landing routine (`pushToDev`) lands the same files **→ THEN** it picks `bkit:gate:min` too.
- **IF** the push changes any line at or above an audit template's `<!-- bkit:end -->` **→ THEN** `bkit ci min-push` lists the template under `outside`, and the `[skip ci]` push to `dev` stays blocked.
- **IF** the audit template is new or deleted at the pushed commit, or either version lacks exactly one line-anchored `<!-- bkit:start -->` and one `<!-- bkit:end -->` in that order **→ THEN** the template counts as outside.
- **IF** the template is not `docs/templates/bkit-audit-*.md` (for example `docs/templates/bkit-plan.md`) **→ THEN** any change to it counts as outside.
- **IF**, in the bkit repo, a below-marker edit drops an audit template's `## Project Instructions` heading or writes an absolute home path **→ THEN** `bkit ci min-push` still accepts the file, and bkit's own `bkit:gate:min` fails the push.

### Concrete Example

**Setup:** An operator on a consumer repo runs `@bkit-audit-generate` for the `logs` audit, then a plan conversion. The local `dev` holds one `[skip ci]` commit on top of `origin/dev` with 34 changed files: plan conversions under `docs/plans/**`, ledger rows in `docs/*.jsonl`, the report `docs/audits/202611/logs.md`, and an edit to the `Project Instructions` section below `<!-- bkit:end -->` in `docs/templates/bkit-audit-logs.md`.

**Steps:**

1. Operator runs `git push origin dev` → the hook runs `bkit ci min-push --update=<old>:<new>` (`.bkit/templates/.husky/pre-push:151`), which exits 0, and its log names `docs/templates/bkit-audit-logs.md` as accepted because only its project section changed.
2. The hook's `[skip ci]` guard runs `bkit ci min-push --ref=<sha>` (`:161`) → it exits 0, so the guard does not print `BLOCKED`.
3. The hook runs `pnpm bkit check` (`:178`) → it passes.
4. The hook runs `bkit:gate:min` in place of the full gate → the gate passes.

**Outcome:** The push lands on `dev` with no `--no-verify` and no empty "trigger CI" commit, and `bkit ci min-push --ref=<sha> --json` reports `minPush: true` and `outside: []`.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| A push changes only an audit report under `docs/audits/**` (any depth) | `bkit ci min-push` exits 0; `paths` lists `:(glob)docs/audits/**`. |
| An audit template changes only below its `<!-- bkit:end -->` | Accepted; `outside` stays empty and the log names the template. |
| An audit template changes a line above its `<!-- bkit:end -->`, or the marker line itself | Listed in `outside`; exit 1. |
| An audit template changes lines both above and below its `<!-- bkit:end -->` | Listed in `outside`; exit 1. |
| An audit template is absent at the base or at the pushed commit: new, deleted, or renamed (a rename counts as a delete plus an add, because the diff runs with `--no-renames`) | Listed in `outside`; exit 1. A blob that cannot be read takes the same branch, so the decision fails closed to the full gate. |
| A below-marker edit adds a second line-anchored `<!-- bkit:end -->` or `<!-- bkit:start -->` | Listed in `outside`; exit 1, because `replaceManagedBlock` would refuse the file and hide block drift. |
| Either version has no markers, or `bkit:end` before `bkit:start` | Listed in `outside`; exit 1. |
| `docs/templates/bkit-plan.md` changes only below its `<!-- bkit:end -->` | Listed in `outside`; exit 1 (the exception covers only `bkit-audit-*.md`). |
| A nested `docs/templates/{dir}/bkit-audit-x.md` | Listed in `outside`; the exception matches top-level `docs/templates/bkit-audit-*.md` only. |
| An update whose remote head carries code covered by a full-gate receipt, then a project-section increment | `hasVerifiedIncrement` accepts the increment, so the hook runs `bkit:gate:min`. |
| A push mixes a project-section edit with a file outside the paths | Exit 1, and `outside` lists only that other file; the full gate runs. |
| In the bkit repo, a below-marker edit removes an audit template's `## Project Instructions` heading, or the blank line after `<!-- bkit:end -->` | `bkit ci min-push` accepts the file (the change is below the marker); bkit's own `bkit:gate:min` fails, because it runs `templates.test.ts` (Task 6). |
| In the bkit repo, a below-marker edit writes an absolute `/Users/<name>/` or `/home/<name>/` path | `bkit ci min-push` accepts the file; bkit's own `bkit:gate:min` fails, because it runs `template-no-userpath.test.ts` (Task 6). |

## Open Questions

> [!CAUTION]
> 🛑 The owner reads and confirms this section.
> These are the unknowns and assumptions this plan relies on. An unresolved question is a risk, and a wrong assumption breaks what follows. **If** there are none → write `None`.

- **Open Question 1 (blocking, owner-required):** Four readers read below `<!-- bkit:end -->` (Context & Goals):
  - `detectManagedDuplicate` in `.bkit/core/engine/checks/after/managed.ts` (row 3): `advisory`, never changes `bkit check`'s exit code, and `bkit check` runs on every push, min push included.
  - The minimum gate's prettier, Vale and slop steps (row 9): they run on the min push itself.
  - `.bkit/core/engine/audits/templates/templates.test.ts` (row 12): asserts the text after the marker starts with `## Project Instructions`. bkit repo only; bkit's own `bkit:gate:min` does not run it.
  - `.bkit/core/engine/audits/templates/template-no-userpath.test.ts` (row 13): fails on an absolute home path anywhere in an installed audit template. bkit repo only; bkit's own `bkit:gate:min` does not run it.
  - The owner asked the plan to stop and bring back any such reader. The last two can leave `dev` with a red unit suite that nothing ran. How does the exception go ahead? → The owner answers on #915 or ticks this section.
  - **Options:** A) Proceed, and add both tests to bkit's own `bkit:gate:min` in `package.json` beside `ledger-integrity.test.ts` (Task 6) — applies the existing `.bkit/templates.md` guidance "a test that reads a min-push file goes into `bkit:gate:min`" to bkit as a consumer, and leaves `detectManagedDuplicate` as it is; the light gate runs two more unit files · B) Proceed, and narrow the two tests so they no longer read below the marker (cut `templates.test.ts`'s after-marker assertion and `template-no-userpath.test.ts`'s scan to the managed block) — removes the reads and keeps the light gate as it is, but drops the leaked-home-path check on the project section, which is the failure that test exists to catch · C) Drop point 2 and ship point 1 only — every audit run still leaves a full-gate commit, which is the problem the owner decided to fix.
  - **Recommended:** A) — it closes the gap with existing guidance and keeps both checks.
  - **Default if unanswered:** none; Gate 1 stays open until the owner answers, because the owner said to stop on such a reader. Task 6 applies only under A); under B) or C) the build stops at its Decision Pause for a plan revision.
- **Open Question 2:** Narrative and Success Criteria are missing, because #915 is not in the change shape and has no design. → The owner writes them into this plan.
  - **Options:** A) The owner writes both sections — the contract is the owner's words · B) The owner copies the two goals of the 2026-11-10 decision comment as the Narrative, and adopts the Concrete Example's outcome (the push lands on `dev` with no `--no-verify` and no empty trigger commit, and `bkit ci min-push --ref=<sha> --json` reports `minPush: true` and `outside: []`) plus the Edge Cases' first, second, third and eighth rows as the Success Criteria (five in all) — fastest, and keeps one outcome measured from the operator's side, but the contract is assembled from plan text instead of the owner's own words.
  - **Recommended:** A) — the plan may not write them itself.
  - **Default if unanswered:** none; Gate 1 stays open until both sections hold the owner's text.
- **Open Question 3:** Should the upgrade migration `pruneMinPushPaths` (`MIN_PUSH_FLOOR_ENTRIES` in `.bkit/core/engine/install/modules/core.ts`) also drop a consumer's own `docs/audits/**` entry from `bkit.testing.minPushPaths`, now that the floor covers it? → The owner decides; `.agents/rules.md` § Migrations requires the owner's confirmation for any migration change.
  - **Options:** A) Leave the migration alone — a repeated entry is harmless, because `bkit ci min-push` only unions the lists · B) Add `docs/audits/**` to `MIN_PUSH_FLOOR_ENTRIES` and update the `docs/migrations.md` row — consumer lists stay minimal, at the cost of rewriting consumers' `package.json` on upgrade for no behaviour change.
  - **Recommended:** A) — nothing breaks for old installs, so no migration is due.
  - **Default if unanswered:** A).
- **Assumption:** An audit template's managed text above `<!-- bkit:end -->`, including anything above `<!-- bkit:start -->`, is compared byte for byte between the base and the pushed commit → if the owner meant "the block between the markers" only, edits above `bkit:start` would also need the full gate under this plan, which is stricter, never looser.
- **Assumption:** `bkit ci min-push` is the only command the owner meant; `bkit ci bookkeeping-push` (the open-PR guard on feature branches) and ship's `--scope=pr` allow-list stay as they are → if an audit run pushes a `[skip ci]` head to a feature branch with an open PR, that guard still blocks it, and the owner would need a follow-up issue.
- **Assumption:** `docs/audits/**` holds only records that no code, build or test reads, in bkit's shipped surface → if a consumer's test reads an audit report, that consumer adds the test to `bkit:gate:min`, per the existing guidance in `.bkit/templates.md` § Git hooks — Husky.
- **Assumption (untested):** a blob the diff names but `git cat-file blob` cannot read makes `gitRaw` return a non-zero status, so `minPushOutside` keeps the template outside. No test builds that state, because a diff naming an unreadable blob is hard to make in a temporary repo → if `gitRaw` returned status 0 with partial text instead, two equal partial heads could accept a template whose managed block changed.

## Risks and Action Items

None

## Recommended Next Step

```text
/bkit-build #915
```

Or, to address the reasons first: `/bkit-plan #915`
