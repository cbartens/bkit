# Min-Push Accepts Audit Reports and Audit-Template Project Sections Implementation Plan

> [!CAUTION]
> **Purpose:** The implementation plan: pre-flight checks, gates, the runbook, verification and rollback.

## Context & Goals

**Problem.** The pre-push hook blocks a `[skip ci]` push to `dev` whose only files outside the plans tree are the files an audit run writes. `bkit ci min-push` decides from `minPushPathspecs` in `.bkit/core/engine/commands/ci/ci.ts`: ship's `pr` bookkeeping allow-list (`bookPathspecs` in `.bkit/core/engine/commands/workflow/ledgers.ts`), plus `docs/plans/**`, plus `bkit.testing.minPushPaths`. Two files an audit run writes match none of them:

1. The report `docs/audits/{YYYYMM}/{slug}.md` that `@bkit-audit-generate` writes. bkit already treats it as a record like a plan (the prettier pre-step and the prose linter's record handling cover both trees), but the min-push floor lists only `docs/plans/**`.
2. The `Project Instructions` section below `<!-- bkit:end -->` in `docs/templates/bkit-audit-*.md`, which every audit run edits. No path rule can tell that section from the bkit-managed block above it, so every audit run leaves a commit that cannot take the light gate.

**Goals (owner decision, issue comment 2026-11-10T06:56:41Z):**

- `bkit ci min-push` counts `docs/audits/**` as written by bkit, beside `docs/plans/**`.
- `bkit ci min-push` also accepts a change to `docs/templates/bkit-audit-*.md` when every changed line sits below the file's `<!-- bkit:end -->`. A change to any line above that marker still needs the full gate.
- Only `bkit-audit-*.md` gets this exception. Other templates, such as `docs/templates/bkit-plan.md`, keep blocking. `docs/**` is not added to `minPushPaths`.
- Every caller of the min-push decision gives the same answer: `bkit ci min-push --ref` (the `[skip ci]` guard on `dev` / `main`), `bkit ci min-push --update` (the hook's choice of `bkit:gate:min`, including the receipt path in `hasVerifiedIncrement`), and the landing routine's gate choice (`checkLanding` in `.bkit/core/engine/commands/land.ts`).
- `.bkit/templates.md` § Git hooks — Husky describes what bkit writes and the `minPushPaths` guidance in the same change.

**Owner-required confirmation: every code, build and test path that reads `docs/templates/bkit-audit-*.md`.** The owner asked the plan to show that nothing reads the part below `<!-- bkit:end -->`, and to stop and bring it back if something does. One code path does read it (row 3), and the minimum gate's own tools read the whole file (row 9). Neither can change a gate result that a min push skips, so the plan proceeds on that reading, and Open Question 1 brings the finding back to the owner for confirmation.

<!-- prettier-ignore -->
| # | Reader | What it reads | Reads below `bkit:end`? | Can a below-marker change alter a gate result a min push skips? |
| --- | --- | --- | --- | --- |
| 1 | `bkit check` / `bkit install` / `bkit upgrade` core payload pass: `runCoreTemplates` → `writeTier2` (`.bkit/core/engine/install/write.ts`) → `replaceManagedBlock` (`.bkit/core/engine/install/managed-block.ts`) | `listCoreTemplateFiles` (`.bkit/core/engine/install/modules/core.ts`) lists every `docs/templates/**` file with scope `block`. The writer replaces the text between the markers and copies the text after the end-marker line unchanged, so the would-write count (`bkit check` drift) cannot see a below-marker edit. | Only to keep it byte for byte. | No. Exception: a second line-anchored `<!-- bkit:end -->` makes `replaceManagedBlock` refuse the file (`multiple`), which hides block drift. The plan refuses such a change (Edge Cases). |
| 2 | `detectManagedStale` (`.bkit/core/engine/checks/after/managed.ts`) | `readManagedBlockVersion`: the version marker inside the first block only. | No. | No. |
| 3 | `detectManagedDuplicate` (`.bkit/core/engine/checks/after/managed.ts`) | `stripManagedBlock` output, that is the text outside the block, searched for an older unmarked copy of the block. | **Yes.** | No. The finding's severity is `advisory`; `reportCheckDrift` (`.bkit/core/engine/commands/install/check.ts`) fails only on would-writes, a `bkit-managed-stale` blocker or a missing owned hook. Pre-push also runs `pnpm bkit check` on every push, min push included (`.bkit/templates/.husky/pre-push:178`). |
| 4 | `migrateTemplateNotes` / `stripRetiredTemplateNotes` (`.bkit/core/engine/install/template-notes.ts`) | Lines above `<!-- bkit:start -->`. | No. | No. |
| 5 | `bkit uninstall` (`.bkit/core/engine/commands/install/uninstall.ts`) | Deletes `docs/templates/bkit-*.md` whole. | Not a gate. | No. |
| 6 | `.bkit/version` `canonicalHashes` (`.bkit/core/engine/install/version-file.ts`) | Whole-file hash, refreshed by install and upgrade. Upgrade's whole-file `diffFile` and uninstall read it; block-scoped templates go through `writeTier2` instead, and `bkit check` does not read the hashes. | Hash only. | No. |
| 7 | `.bkit/core/engine/tools/instructions.ts` (`AUDIT_DIRS`, bkit repo only) | The installed copies under `docs/templates/`, through `proseLineIndexes`, which cuts `audit` surfaces to the managed block. Conditional clause modes read front matter, and only on prompts. `coverageIndex` skips `docs/templates/`. | No. | No. |
| 8 | bkit repo tests and scripts: `templates.test.ts`, `template-shape.test.ts`, `template-no-userpath.test.ts` (`.bkit/core/engine/audits/templates/`), `question-option-format.test.ts`, `shipped-docs-refs.test.ts`, `scripts/readme/readme-art.mjs` | The source `.bkit/core/docs/templates/`, never the installed `docs/templates/` copies. | No. | No. |
| 9 | `bkit:gate:min` steps: `format:check` (prettier), `bkit:lint:prose` (Vale), `bkit:slop:delta`; the pre-commit `lint-staged` prettier pass | Whole markdown files. | Yes. | No: they run on the min push itself. |
| 10 | `@bkit-audit-generate` (agent) | Reads and edits `Project Instructions`. | Yes. | Not code, build or test. |
| 11 | A consumer's own tests | Unknown, consumer-owned. | Unknown. | Covered by the existing guidance: a test that reads a min-push file goes into `bkit:gate:min` (`.bkit/templates.md` § Git hooks — Husky). |

**Related Issues:**

- #915 — Min-push ignores the audit reports bkit writes (OPEN)
- #645 — Pre-push: light gate for bookkeeping-only pushes (CLOSED)
- #852 — Use minimum gates for verified bookkeeping across push paths (CLOSED)

---

## 👤 ⚠️ Acceptance Scenario

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

### Concrete Example

**Setup:** An operator on a consumer repo runs `@bkit-audit-generate` for the `logs` audit, then a plan conversion. The local `dev` holds one `[skip ci]` commit on top of `origin/dev` with 34 changed files: plan conversions under `docs/plans/**`, ledger rows in `docs/*.jsonl`, the report `docs/audits/202611/logs.md`, and an edit to the `Project Instructions` section below `<!-- bkit:end -->` in `docs/templates/bkit-audit-logs.md`.

**Steps:**

1. Operator runs `git push origin dev` → the hook runs `pnpm bkit check`, which passes.
2. The hook runs `bkit ci min-push --update=<old>:<new>` → it exits 0, and its log names `docs/templates/bkit-audit-logs.md` as accepted because only its project section changed.
3. The hook's `[skip ci]` guard runs `bkit ci min-push --ref=<sha>` → it exits 0, so the guard does not print `BLOCKED`.
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

### Derived Test Matrix

`Type` is a tier from `docs/testing.md`. `Task` is the one runbook task that lands the row's test.

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| `managedHead` returns the text from the first byte through the end of the single `bkit:end` line | Unit | `.bkit/core/engine/install/managed-block.test.ts` | 1 |
| `managedHead` returns null for no markers, two `bkit:end` lines, and `bkit:end` before `bkit:start` | Unit | `.bkit/core/engine/install/managed-block.test.ts` | 1 |
| `bkit ci min-push --ref` accepts an audit report under `docs/audits/**` and lists `:(glob)docs/audits/**` in `paths` | Unit | `.bkit/core/engine/commands/ci/ci.test.ts` | 2 |
| The landing routine runs `bkit:gate:min` for an audit report | Unit | `.bkit/core/engine/commands/land.test.ts` | 2 |
| The real pre-push hook (both copies) lets a `[skip ci]` audit-report push to `dev` through on the light gate | Integration | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` | 2 |
| `bkit ci min-push --ref` accepts an audit template changed only below `bkit:end` and logs why | Unit | `.bkit/core/engine/commands/ci/ci.test.ts` | 3 |
| `bkit ci min-push --ref` refuses an audit template that changes a line above `bkit:end`, changes lines on both sides, is new, is deleted, or gains a second `bkit:end` line, while accepting a below-only template in the same push (one case each) | Unit | `.bkit/core/engine/commands/ci/ci.test.ts` | 3 |
| `bkit ci min-push --ref` refuses `docs/templates/bkit-plan.md` and a nested `docs/templates/sub/bkit-audit-x.md` changed only below `bkit:end` (one case each) | Unit | `.bkit/core/engine/commands/ci/ci.test.ts` | 3 |
| The real pre-push hook (both copies) lets a `[skip ci]` audit-template project-section push to `dev` through on the light gate | Integration | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` | 3 |
| `bkit ci min-push --update` carries a project-section increment over a full-gate receipt to the minimum gate | Unit | `.bkit/core/engine/commands/ci/push-gate.test.ts` | 4 |
| The landing routine runs `bkit:gate:min` for an audit template's project-section change | Unit | `.bkit/core/engine/commands/land.test.ts` | 4 |

### 👤 ✅ Human Confirmation

- [ ] **Acceptance Scenario confirmed:** I have reviewed the Narrative, Success Criteria, Process Sketch, Concrete Example, Edge Cases, and Derived Test Matrix above. They correctly describe what "done" looks like.

---

## 👤 ⚠️ Breaking Changes & Naming Review

> [!CAUTION]
> 🛑 The owner reads and confirms this section.

<!-- prettier-ignore -->
| Item | Kind | Who sees it | Notes |
| --- | --- | --- | --- |
| `bkit ci min-push` accepts more pushes: `docs/audits/**` and audit-template project sections | Behaviour change (gate loosened) | Every consumer's pre-push hook and landing routine | Intended by the owner's decision. A `[skip ci]` push to `dev` / `main` carrying only these files now passes; a push carrying anything else behaves as before. |
| `bkit ci min-push --json` `paths` gains `:(glob)docs/audits/**` | Output change, additive | Scripts that read `paths` | No shipped caller compares `paths` to a fixed list. |
| `managedHead` in `.bkit/core/engine/install/managed-block.ts` | New export name | Engine only | Named after the module's `extractManagedBlock` family. |
| `minPushOutside` in `.bkit/core/engine/commands/ci/ci.ts` | New export name | Engine only | Named after `minPushPathspecs` beside it. |
| `gitRaw` in `.bkit/core/engine/commands/workflow/ledgers.ts` | Becomes exported | Engine only | No behaviour change. |
| `hasVerifiedIncrement` fourth parameter: `paths: string[]` → `outsideOf` callback | Internal signature change | Engine only | One caller (`minPushUpdates`), updated in the same task. |

No database, route, file name or layout changes.

### 👤 ✅ Human Confirmation

- [ ] **Breaking Changes confirmed:** I have reviewed every breaking change and naming decision above.

---

## 👤 ⚠️ Open Questions & Assumptions

> [!CAUTION]
> 🛑 The owner reads and confirms this section.
> These are the unknowns and assumptions this plan relies on. An unresolved question is a risk, and a wrong assumption breaks what follows. **If** there are none → write `None`.

- **Open Question 1 (blocking, owner-required):** One code path reads below `<!-- bkit:end -->`: `detectManagedDuplicate` in `.bkit/core/engine/checks/after/managed.ts` (Context & Goals, row 3). The minimum gate's prettier, Vale and slop steps also read the whole file (row 9). The owner asked the plan to stop and bring back any such reader. Does the exception go ahead? → The owner answers on #915 or ticks this section.
  - **Options:** A) Proceed — the duplicate check is `advisory` and never changes `bkit check`'s exit code, `bkit check` runs on every push, min push included, and the row-9 tools run inside `bkit:gate:min`; none of them is a check a min push skips · B) Proceed, and also exclude the text below `bkit:end` from `detectManagedDuplicate` for `docs/templates/bkit-audit-*.md` — removes the read, but changes an unrelated `bkit check` advisory that exists to find stale bkit text a consumer kept below the marker · C) Drop point 2 and ship point 1 only — every audit run still leaves a full-gate commit, which is the problem the owner decided to fix.
  - **Recommended:** A) — the read cannot change a gate result that a min push skips.
  - **Default if unanswered:** A), and the build stops at its Decision Pause only if the owner has answered B) or C).
- **Open Question 2:** Narrative and Success Criteria are missing, because #915 is not in the change shape and has no design. → The owner writes them into this plan.
  - **Options:** A) The owner writes both sections — the contract is the owner's words · B) The owner copies the two goals of the 2026-11-10 decision comment as the Narrative and adopts the Edge Cases' first, second, third and eighth rows as the Success Criteria — fastest, but the plan then has no outcome measured from the operator's side (no `--no-verify`, no trigger commit).
  - **Recommended:** A) — the plan may not write them itself.
  - **Default if unanswered:** none; Gate 1 stays open until both sections hold the owner's text.
- **Open Question 3:** Should the upgrade migration `pruneMinPushPaths` (`MIN_PUSH_FLOOR_ENTRIES` in `.bkit/core/engine/install/modules/core.ts`) also drop a consumer's own `docs/audits/**` entry from `bkit.testing.minPushPaths`, now that the floor covers it? → The owner decides; `.agents/rules.md` § Migrations requires the owner's confirmation for any migration change.
  - **Options:** A) Leave the migration alone — a repeated entry is harmless, because `bkit ci min-push` only unions the lists · B) Add `docs/audits/**` to `MIN_PUSH_FLOOR_ENTRIES` and update the `docs/migrations.md` row — consumer lists stay minimal, at the cost of rewriting consumers' `package.json` on upgrade for no behaviour change.
  - **Recommended:** A) — nothing breaks for old installs, so no migration is due.
  - **Default if unanswered:** A).
- **Assumption:** An audit template's managed text above `<!-- bkit:end -->`, including anything above `<!-- bkit:start -->`, is compared byte for byte between the base and the pushed commit → if the owner meant "the block between the markers" only, edits above `bkit:start` would also need the full gate under this plan, which is stricter, never looser.
- **Assumption:** `bkit ci min-push` is the only command the owner meant; `bkit ci bookkeeping-push` (the open-PR guard on feature branches) and ship's `--scope=pr` allow-list stay as they are → if an audit run pushes a `[skip ci]` head to a feature branch with an open PR, that guard still blocks it, and the owner would need a follow-up issue.
- **Assumption:** `docs/audits/**` holds only records that no code, build or test reads, in bkit's shipped surface → if a consumer's test reads an audit report, that consumer adds the test to `bkit:gate:min`, per the existing guidance in `.bkit/templates.md` § Git hooks — Husky.

### 👤 ✅ Human Confirmation

- [ ] **Open Questions & Assumptions confirmed:** I have resolved or explicitly accepted every open question and assumption above.

---

## Alternative Approaches & Recommendations

<!-- prettier-ignore -->
| Approach | Verdict | Why |
| --- | --- | --- |
| Compare each audit template's text through its `bkit:end` line at the base and the pushed commit (`managedHead`), in one classifier `minPushOutside` used by every min-push caller | **Chosen** | Byte comparison of two blobs needs no diff parsing, refuses marker tricks by construction, and one function keeps `--ref`, `--update`, the receipt path and the landing routine in agreement. |
| Parse `git diff -U0` hunk ranges and compare them with the marker's line number | Rejected | A hunk that straddles the marker, or a marker line added below it, needs special cases; two blob reads per template cost less than they save. |
| Exempt `docs/templates/bkit-audit-*.md` by path | Rejected | A change to the bkit-managed block would then skip the full gate; the owner kept that part on the full gate. |
| Put the exception into `changedOutside` (`.bkit/core/engine/commands/workflow/ledgers.ts`) | Rejected | That function also backs `bkit ledgers only-bookkeeping` and ship's merge gate, so ship's bookkeeping would widen without the owner asking for it. |
| Add `docs/audits/**` to `bookPathspecs` | Rejected | That list is also ship's staging list, so ship's commit would sweep other runs' audit reports in (`docs/decisions.jsonl` `min-push-floor-is-ship-allow-list`). |
| List `docs/**` in `bkit.testing.minPushPaths` | Rejected by the issue | A doc can be test input; `.bkit/templates.md` already warns against it. |
| Let `push-gate.ts` import the classifier from `ci.ts` | Rejected | `ci.ts` imports `push-gate.ts`, so this makes an import cycle; a callback parameter keeps `push-gate.ts` free of the rule. |
| Add a `projectSections` field to the `bkit ci min-push --json` output | Not now | The log line names each accepted template, and no caller reads such a field. A future caller that needs it can add it. |

## Out of Scope

None. The open-PR `[skip ci]` guard (`bkit ci bookkeeping-push`) and ship's `--scope=pr` allow-list stay as they are by design, not as deferred work (Open Questions, second assumption; `docs/decisions.jsonl` `min-push-floor-is-ship-allow-list`).

## Suggested Scope Expansion

<!-- prettier-ignore -->
| Candidate | Source | Overlaps | Recommendation |
| --- | --- | --- | --- |
| The push-gate case "keeps the later failure when two full gates overlap on the same commit" fails in the broad unit run and passes alone | `docs/failures.jsonl` `push-gate-overlap-later-failure-intermittent` (OPEN, MEDIUM) | `.bkit/core/engine/commands/ci/push-gate.test.ts`, which Task 4 extends | Keep deferred; a flaky case in the same file can make Task 4's red or green look wrong, so the build re-runs that file alone before it trusts a failure there. |
| Pre-push lint and typecheck cover only changed packages, while CI checks the whole repo | `docs/deferrals.jsonl` `653-pre-push-lint-typecheck-scope-vs-ci-whole-repo` (TRIAGED); #818 — Decide pre-push lint/typecheck scope: CI push base or whole repo (OPEN) | The pre-push hook's gate selection, which this plan's light-gate decision feeds | Keep deferred; it needs its own decision and touches no file this plan edits. |
| Pre-push blocks in seconds when the PR conflicts | #923 — Pre-push: block in seconds when the PR conflicts (OPEN) | `.husky/pre-push` and `.bkit/templates/.husky/pre-push`, which this plan's integration tests run but do not edit | Keep separate. |
| Pre-push loads direnv itself and blocks fast when untrusted | #922 — Pre-push: load direnv itself; block in seconds if untrusted (OPEN) | The same two hooks | Keep separate. |

## Security & Privacy

- [ ] **New API Route** — n/a.
- [ ] **New DB Table/Column** — n/a.
- [ ] **Role-Gated Mutation** — n/a.
- [ ] **User Input** — n/a as a schema; the only input is git data from the pushing checkout. `minPushOutside` fails closed: an unreadable blob, a missing or repeated marker, or a path outside the top-level `docs/templates/bkit-audit-*.md` pattern keeps the file outside.
- [ ] **PII** — n/a; the new log line names a repo path only.
- [ ] **Redirect URL** — n/a.
- [ ] **Webhook** — n/a.
- [ ] **New Secret/Env Var** — n/a.

None — no new routes, DB writes, secrets, or user input. The change loosens a local gate, so its threat is code skipping CI (`docs/security.md` untrusted-content model): text below `<!-- bkit:end -->` in an audit template is not code, `bkit install` never writes it, and the comparison through the end-marker line keeps every bkit-managed byte on the full gate.

## Pre-Flight / Dependencies

### Core

- [ ] **Package Management:** no package is added or removed; `package.json` and `pnpm-lock.yaml` stay as they are.
- [ ] **Dependency Versions:** `pnpm bkit:deps:outdated` (run 2026-11-11) lists dev dependencies only, none blocking: `oxlint-tsgolint` 7.0.2004 → 7.0.2005, `@vitest/coverage-v8` and `vitest` 5.0.5 → 5.1.0, `oxlint` 1.89.0 → 1.91.0, `@types/node` 24.19.2 → 26.6.6, `vite` 6.4.5 → 8.3.5. Toolchain: Node v24.16.0, pnpm 10.34.7, git 2.56.0. `dist/cli.js` and `node_modules/.bin/tsx` exist in the worktree.
- [ ] **Existing-Solution Search (reuse over duplicate):** recorded in `Reuse Inventory`.
- [ ] **User Context:** every file the runbook reads or edits is in this worktree and readable. The owner must answer Open Question 1 and write the Narrative and Success Criteria (Open Question 2).
- [ ] **Project Context:** read `docs/decisions.jsonl` `min-push-floor-is-ship-allow-list` (the floor stays out of `bookPathspecs`, because that list is also ship's staging list) and `pre-push-open-pr-guard-mirrors-ship-carry-forward`. `docs/knowledge.jsonl` has no min-push row.
- [ ] **Testing & Quality:** every behaviour is tested at the Unit tier against a real temporary git repo, and the hook boundary at the Integration tier through the real `.husky/pre-push` and `.bkit/templates/.husky/pre-push` running the built `dist/cli.js` (`docs/testing.md` § Tiers, § Which tier does a behaviour need?). No E2E or `@live` tier applies: bkit has no deployed surface.
- [ ] **Prerequisite Plans:** None.

### Conditional

- [ ] **Secrets & Env Vars:** n/a — no new secret or env var.
- [ ] **Schema State:** n/a — no database.
- [ ] **Architecture & UI:** n/a — no new file, component or UI; every change extends an existing module.
- [ ] **Observability:** one new CLI log line from `bkit ci min-push`, through `ctx.log` (printed with the command's `[bkit-ci]` prefix), naming each audit template accepted because only its project section changed.
- [ ] **Notifications:** n/a — no alert or toast.

### 🔒 Gate 1: Prerequisites Check

- [ ] **Acceptance Scenario confirmed:** the `👤 ⚠️ Acceptance Scenario` checkbox is `[x]`, ticked by a human.
- [ ] **Breaking Changes confirmed:** the `👤 ⚠️ Breaking Changes & Naming Review` checkbox is `[x]`, ticked by a human.
- [ ] **Open Questions confirmed:** the `👤 ⚠️ Open Questions & Assumptions` checkbox is `[x]`, ticked by a human.
- [ ] **Security & Privacy checked:** every applicable row is verified, or `None` is justified.
- [ ] **Reuse Inventory complete:** every capability has a row with `Search performed` and `Decision` filled in.
- [ ] **Reuse reasons:** every `NEW` row cites its reason.
- [ ] **Gate 1 — Verified:** every item above, every Core item and every applicable Conditional item is checked.

## Data Schema Integration

None — bkit has no database. The change reads git objects only: the diff of each pushed range and the two blobs of each changed audit template.

### Data Schema Usage

None.

### Data Schema Changes

None.

## Reuse Inventory

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| Count audit reports as written by bkit | `.bkit/core/engine/commands/ci/ci.ts` | `rg -l --hidden 'min-push\|minPush\|bookPathspecs'`; serena references to `minPushPathspecs` (callers: `minPush` in `ci.ts`, `checkLanding` in `land.ts`) | `minPushPathspecs` — holds the floor, missing `docs/audits/**`; `bookPathspecs` — ship's staging list, must not grow; `bkit.testing.minPushPaths` — consumer-owned | EXTEND | Add `docs/audits/**` beside `docs/plans/**` in `minPushPathspecs`; both callers pick it up. |
| Text of a file through its single `bkit:end` line | `.bkit/core/engine/install/managed-block.ts` | `grep -n '^export function' .bkit/core/engine/install/managed-block.ts`; `rg -ln 'bkit:end' .bkit/core/engine` | `extractManagedBlock` — inner text, newlines stripped, nothing above `bkit:start`; `extractFullManagedBlock` — starts at the `bkit:start` line; `stripManagedBlock` — joins the text before and after; their callers (install, upgrade, uninstall, `bkit check`) depend on those shapes | EXTEND | Add `managedHead(content, markerStyle)` to the module that owns marker parsing, reusing `findLineAnchoredMarkers` and `selectMarkers`. |
| Read a blob untrimmed | `.bkit/core/engine/commands/workflow/ledgers.ts` | `rg -n '"show", \`\|"cat-file"' .bkit/core/engine --glob '!*.test.ts'` | `runGit` / `git` in `commands/lib.ts` — trim stdout, and every caller relies on that; `gitRaw` in `ledgers.ts` — untrimmed, private | EXTEND | Export `gitRaw`; no behaviour change. |
| Classify a range for the min push, with the audit-template exception | `.bkit/core/engine/commands/ci/ci.ts` | serena references to `changedOutside` (`ci.ts`, `push-gate.ts`, `land.ts`, `checkOnlyBookkeeping` in `ledgers.ts`) | `changedOutside` — path matching only, shared with ship's bookkeeping gate, so it must not gain the exception | EXTEND | Add `minPushOutside` beside `minPushPathspecs`; it wraps `changedOutside` and filters its `outside` list. |
| The `--ref` and `--update` paths use the classifier | `.bkit/core/engine/commands/ci/ci.ts` | Read `minPush` and `minPushUpdates` (`ci.ts:626-735`) | Both call `changedOutside` directly | EXTEND | Swap the three calls for `minPushOutside`, and log each accepted template. |
| The receipt path uses the classifier | `.bkit/core/engine/commands/ci/push-gate.ts` | serena references to `hasVerifiedIncrement` (one caller: `minPushUpdates`) | `hasVerifiedIncrement(cwd, oldSha, newSha, paths)` — calls `changedOutside` itself | EXTEND | Replace `paths` with a classifier callback, so `push-gate.ts` needs no import from `ci.ts`. |
| The landing routine uses the classifier | `.bkit/core/engine/commands/land.ts` | Read `checkLanding` (`land.ts:188-210`) | Calls `changedOutside` with `minPushPathspecs` | EXTEND | Call `minPushOutside` instead. |
| Describe what bkit writes for the min push | `.bkit/core/.bkit/templates.md` | `grep -n 'min-push\|minPush\|docs/plans/\*\*' .bkit/core/.bkit/templates.md` | § Git hooks — Husky, bullets "What bkit writes" and "Min-push paths" | EXTEND | Add `docs/audits/**`, the project-section rule, and the `minPushPaths` guidance; mirror to `.bkit/templates.md` with `bkit upgrade`. |

## Architecture & Component Changes

Engine changes only, plus one shipped doc and its mirror. No new file.

**Ledger rows:** `min-push-floor-is-ship-allow-list`, `915-min-push-audit-template-project-section`

### Database Migrations

None.

### Engine — managed-block parser

#### [MODIFY] `.bkit/core/engine/install/managed-block.ts`

- **Existence Check:** the file exists and exports `findLineAnchoredMarkers`, `selectMarkers`, `extractManagedBlock`, `extractFullManagedBlock`, `stripManagedBlock` and `replaceManagedBlock`.
- Add `export function managedHead(content: string, markerStyle: MarkerStyle = "html-comment"): string | null`.
  - It returns `content` from its first byte through the end of the line holding the single line-anchored end marker (the line break included, when there is one).
  - It returns null when the file does not hold exactly one line-anchored start marker and one end marker, or when the end marker comes first: the same refusals as `replaceManagedBlock`.
- Pure string function, like the rest of the module.

### Engine — `bkit ci min-push`

#### [MODIFY] `.bkit/core/engine/commands/workflow/ledgers.ts`

- **Existence Check:** `gitRaw(cwd, args, env?, input?)` exists as a private function returning `{ status, stdout, stderr }` untrimmed.
- Export `gitRaw`. No other change; `changedOutside`, `bookPathspecs` and `checkOnlyBookkeeping` keep their contracts.

#### [MODIFY] `.bkit/core/engine/commands/ci/ci.ts`

- **Existence Check:** `minPushPathspecs`, `minPush`, `minPushUpdates` and the `min-push` command spec exist (`ci.ts:599-735`, `ci.ts:873-904`).
- `minPushPathspecs`: the glob list becomes `["docs/plans/**", "docs/audits/**", ...cfg.minPushPaths]`; its JSDoc and the file header name the audit reports and the audit-template project section.
- Add `export function minPushOutside(root: string, from: string, to: string, paths: readonly string[])`:
  - It returns what `changedOutside` returns, plus `sections: string[]`, on success.
  - It moves from `outside` into `sections` each path that matches `/^docs\/templates\/bkit-audit-[^/]+\.md$/` and for which `gitRaw(root, ["cat-file", "blob", `${from}:${path}`])` and the same at `to` both exit 0, and `managedHead` of the two blobs is non-null and equal.
  - Any other result leaves the path in `outside`, so the decision fails closed.
- `minPush` (`--ref`): calls `minPushOutside`; logs `{path}: only its project section below <!-- bkit:end --> changed` once per accepted template.
- `minPushUpdates` (`--update`): `increment` and `whole` call `minPushOutside`; passes `(a, b) => minPushOutside(cwd, a, b, paths)` to `hasVerifiedIncrement`; logs accepted templates the same way.
- The `output.paths` help names `docs/audits/**`; the command's `summary` stays as it is ("one bkit writes" covers both), so `.bkit/cli.md` does not change.

#### [MODIFY] `.bkit/core/engine/commands/ci/push-gate.ts`

- **Existence Check:** `hasVerifiedIncrement(cwd, oldSha, newSha, paths: string[])` exists; its only caller is `minPushUpdates` in `ci.ts`.
- The fourth parameter becomes `outsideOf: (from: string, to: string) => { ok: true; outside: string[] } | { ok: false }` (the shape it reads), and the receipt loop calls it in place of `changedOutside`. Drop the `changedOutside` import.

### Engine — landing routine

#### [MODIFY] `.bkit/core/engine/commands/land.ts`

- **Existence Check:** `checkLanding(root, dir, base, log)` calls `changedOutside(dir, base, head!, minPushPathspecs(readBkitConfig(dir)))` (`land.ts:197`).
- Call `minPushOutside(dir, base, head!, minPushPathspecs(readBkitConfig(dir)))` instead, and drop the `changedOutside` import.

### Engine — comments that describe the floor

#### [MODIFY] `.bkit/core/engine/install/modules/core.ts`

- **Existence Check:** the seed comment above `minPushPaths` (`core.ts:617`) and the `pruneMinPushPaths` comment (`core.ts:1526-1530`) say the floor is "ship's bookkeeping allow-list, the plans tree".
- Both comments name `docs/audits/**` as part of the floor; the `pruneMinPushPaths` comment says the prune list holds the defaults that installs used to seed. `MIN_PUSH_FLOOR_ENTRIES` stays as it is (Open Question 3).

### Docs

#### [MODIFY] `.bkit/core/.bkit/templates.md`

- **Existence Check:** § Git hooks — Husky has the bullets "What bkit writes = ship's `--scope=pr` allow-list … plus `docs/plans/**`" and "Min-push paths: list only files that no code, build or test reads".
- "What bkit writes" adds `docs/audits/**`.
- A new bullet under "Min push" states the audit-template rule:
  - A change to `docs/templates/bkit-audit-*.md` qualifies when the file's text through its single `<!-- bkit:end -->` line is the same at both ends of the range.
  - A new, deleted or renamed template, a second marker line, or any change at or above `<!-- bkit:end -->` keeps the full gate.
  - Other templates keep the full gate.
- "Min-push paths" says the floor already covers `docs/plans/**` and `docs/audits/**`, so the setting lists neither.

#### [MODIFY] `.bkit/templates.md`

- The mirror of `.bkit/core/.bkit/templates.md`, written by `pnpm tsx .bkit/core/engine/cli.ts upgrade`, never by hand.

#### [MODIFY] `dist/**`

- Rebuilt by `pnpm build` after each engine task (`.agents/rules.md` § Engine builds); the hook integration tests run `dist/cli.js`.

### Cron Jobs & Scheduled Tasks

None.

## Supersession Inventory

None — no artifact is replaced. The three `changedOutside` calls in `ci.ts`, the one in `push-gate.ts` and the one in `land.ts` are rewired to `minPushOutside` in place; `changedOutside` itself stays, because `checkOnlyBookkeeping` and `minPushOutside` call it.

## Documentation Updates

<!-- prettier-ignore -->
| Doc | Change required |
| --- | --- |
| `.bkit/core/.bkit/templates.md` (mirrored to `.bkit/templates.md`) | § Git hooks — Husky: what bkit writes adds `docs/audits/**`; a bullet for the audit-template project-section rule; the `minPushPaths` guidance says the floor already covers `docs/plans/**` and `docs/audits/**`. |
| `docs/decisions.jsonl` | Written by this plan: `min-push-floor-is-ship-allow-list` (floor now includes `docs/audits/**`) and `915-min-push-audit-template-project-section`. |
| `docs/knowledge.jsonl` | None. |
| `docs/architecture.md` | None — no topology change. |
| `docs/technology.md` | None. |
| `docs/data-schema.md` | None. |
| `docs/design.md` | None. |
| `docs/testing.md` | None — the new tests extend existing files and follow existing patterns. |
| `docs/observability.md` | None — the new line uses `ctx.log`, the command's existing log channel. |
| `docs/deployments.md` | None — § Min push points to `.bkit/templates.md` § Git hooks — Husky for what bkit writes. |
| `.bkit/core/.bkit/cli.md` | None — the `min-push` summary does not change; `pnpm cli:sync` is the check. |
| `docs/migrations.md` | None, unless the owner answers B) to Open Question 3. |

## Rollback Strategy

<!-- prettier-ignore -->
| Axis | Action | Notes |
| --- | --- | --- |
| **DB** | None. | No database. |
| **Code** | `git revert {COMMIT}` of the feature commits, then `pnpm build` so `dist/` matches. | Consumers get the old behaviour back with the next release; nothing persists. |
| **Risk window** | None. | The decision runs at push time from git data; no stored state. |

Code-only — `git revert` sufficient.

## Agent Execution Runbook

Build order: the parser helper, then the floor, then the audit-template classifier on the `--ref` and `--update` paths, then the receipt path and the landing routine, then the docs. Integration shape (advice only): one PR for all tasks is fine.

<!-- bkit:group 1 start -->

### TASK GROUP 1: Min-push decision in the engine

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** Add `managedHead` to the managed-block parser
  - **UPDATE:** `.bkit/core/engine/install/managed-block.ts`: add `export function managedHead(content: string, markerStyle: MarkerStyle = "html-comment"): string | null` — the text from the first byte through the end of the single line-anchored end-marker line; null unless there is exactly one start marker and one end marker, start first.
  - **READ:** `findLineAnchoredMarkers` in `.bkit/core/engine/install/managed-block.ts`: the line-anchored marker finder to reuse.
  - **READ:** `replaceManagedBlock` in `.bkit/core/engine/install/managed-block.ts`: the refusals (`absent`, `multiple`, `inverted`) `managedHead` mirrors.
  - **UPDATE:** `.bkit/core/engine/install/managed-block.test.ts`: a `describe("managedHead")` block with the tests below.
  - **DONE WHEN:** the four tests below pass; `pnpm typecheck` passes; `pnpm build` has run and `pnpm bkit:check:dist` passes.
  - **TEST FIRST:**
    - `.bkit/core/engine/install/managed-block.test.ts` `managedHead > returns the text through the bkit:end line` fails on `managedHead` not existing, so the file does not load
    - `.bkit/core/engine/install/managed-block.test.ts` `managedHead > returns null when the file has no markers` fails on `managedHead` not existing, so the file does not load
    - `.bkit/core/engine/install/managed-block.test.ts` `managedHead > returns null when the file has two bkit:end lines` fails on `managedHead` not existing, so the file does not load
    - `.bkit/core/engine/install/managed-block.test.ts` `managedHead > returns null when bkit:end comes before bkit:start` fails on `managedHead` not existing, so the file does not load

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** Count `docs/audits/**` as written by bkit
  - **UPDATE:** `minPushPathspecs` in `.bkit/core/engine/commands/ci/ci.ts`: glob list `["docs/plans/**", "docs/audits/**", ...cfg.minPushPaths]`; its JSDoc and the file header name the audit reports.
  - **UPDATE:** `.bkit/core/engine/commands/ci/ci.ts`: the `min-push` spec's `output.paths` help names `docs/audits/**`; `summary` unchanged.
  - **UPDATE:** `.bkit/core/engine/install/modules/core.ts`: the seed comment above `minPushPaths` and the `pruneMinPushPaths` comment name `docs/audits/**` in the floor; `MIN_PUSH_FLOOR_ENTRIES` unchanged.
  - **READ:** `checkLanding` in `.bkit/core/engine/commands/land.ts`: picks up the new floor through `minPushPathspecs` with no edit.
  - **UPDATE:** `.bkit/core/engine/commands/ci/ci.test.ts`: a test in `describe("bkit ci min-push")`.
  - **UPDATE:** `.bkit/core/engine/commands/land.test.ts`: a `docs/audits/202611/logs.md` → `min` row in the `pushToDev` gate table.
  - **UPDATE:** `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts`: an audit-report case in the per-hook loop of `describe(".husky/pre-push min push")`.
  - **DEPENDS ON:** 1
  - **DONE WHEN:** the four tests below pass; the existing `bkit ci min-push`, `pushToDev` and `.husky/pre-push min push` tests still pass; `pnpm typecheck` passes; `pnpm build` has run and `pnpm bkit:check:dist` passes; `pnpm cli:sync` leaves `.bkit/core/.bkit/cli.md` unchanged.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/ci/ci.test.ts` `bkit ci min-push > exits 0 when every changed file is an audit report under docs/audits` fails on the report being listed in `outside` and `paths` lacking `:(glob)docs/audits/**`
    - `.bkit/core/engine/commands/land.test.ts` `runs docs/audits/202611/logs.md through its declared gate in the built checkout` fails on the landing running the unit gate instead of `bkit:gate:min`
    - `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `.bkit/templates/.husky/pre-push: audit report to dev under a [skip ci] head → allowed, light gate` fails on the hook exiting 1 with the CI-suppressing-token block
    - `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `.husky/pre-push: audit report to dev under a [skip ci] head → allowed, light gate` fails on the hook exiting 1 with the CI-suppressing-token block

<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->

- [ ] **TASK 3:** Accept an audit template's project section on the `--ref` and `--update` paths
  - **UPDATE:** `gitRaw` in `.bkit/core/engine/commands/workflow/ledgers.ts`: export it; no other change.
  - **UPDATE:** `.bkit/core/engine/commands/ci/ci.ts`: add `export function minPushOutside(root, from, to, paths)` — `changedOutside` plus `sections`; moves each top-level `docs/templates/bkit-audit-*.md` from `outside` to `sections` when its blob (`gitRaw` `cat-file blob`) exists at both commits and `managedHead` is non-null and equal at both; anything else stays outside.
  - **UPDATE:** `minPush` in `.bkit/core/engine/commands/ci/ci.ts`: call `minPushOutside`; log `{path}: only its project section below <!-- bkit:end --> changed` once per accepted template.
  - **UPDATE:** `minPushUpdates` in `.bkit/core/engine/commands/ci/ci.ts`: `increment` and `whole` call `minPushOutside`, and accepted templates are logged the same way; the `hasVerifiedIncrement` call is unchanged in this task.
  - **READ:** `changedOutside` in `.bkit/core/engine/commands/workflow/ledgers.ts`: the result shape `minPushOutside` extends.
  - **UPDATE:** `.bkit/core/engine/commands/ci/ci.test.ts`: a helper that commits files at the base, and the tests below in `describe("bkit ci min-push")`.
  - **UPDATE:** `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts`: a project-section case in the per-hook loop; the test moves `refs/remotes/origin/dev` to a commit holding the template before the `[skip ci]` edit.
  - **DEPENDS ON:** 1, 2
  - **DONE WHEN:** the ten tests below pass; the existing `bkit ci min-push`, `bkit ci bookkeeping-push`, `verified incremental push gates` and `.husky/pre-push min push` tests still pass; `bkit ledgers only-bookkeeping` behaviour is unchanged (its tests in `.bkit/core/engine/commands/workflow/ledgers.test.ts` pass); `pnpm typecheck` passes; `pnpm build` has run and `pnpm bkit:check:dist` passes.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/ci/ci.test.ts` `exits 0 when an audit template changes only below its bkit:end, and says why` fails on the template being listed in `outside` and no log line naming it
    - `.bkit/core/engine/commands/ci/ci.test.ts` `refuses an audit template that changes a line above its bkit:end, beside one changed only below its bkit:end` fails on `outside` listing both templates instead of only the one changed above
    - `.bkit/core/engine/commands/ci/ci.test.ts` `refuses an audit template that changes lines on both sides of its bkit:end, beside one changed only below its bkit:end` fails on `outside` listing both templates instead of only the one changed on both sides
    - `.bkit/core/engine/commands/ci/ci.test.ts` `refuses an audit template that is new at the pushed commit, beside one changed only below its bkit:end` fails on `outside` listing both templates instead of only the new one
    - `.bkit/core/engine/commands/ci/ci.test.ts` `refuses an audit template that is deleted at the pushed commit, beside one changed only below its bkit:end` fails on `outside` listing both templates instead of only the deleted one
    - `.bkit/core/engine/commands/ci/ci.test.ts` `refuses an audit template that gains a second bkit:end line, beside one changed only below its bkit:end` fails on `outside` listing both templates instead of only the one with the extra marker
    - `.bkit/core/engine/commands/ci/ci.test.ts` `refuses docs/templates/bkit-plan.md changed only below its bkit:end, beside an audit template changed only below` fails on `outside` listing the audit template as well as `bkit-plan.md`
    - `.bkit/core/engine/commands/ci/ci.test.ts` `refuses docs/templates/sub/bkit-audit-x.md changed only below its bkit:end, beside an audit template changed only below` fails on `outside` listing the top-level audit template as well as the nested one
    - `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `.bkit/templates/.husky/pre-push: audit-template project section to dev under a [skip ci] head → allowed, light gate` fails on the hook exiting 1 with the CI-suppressing-token block
    - `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `.husky/pre-push: audit-template project section to dev under a [skip ci] head → allowed, light gate` fails on the hook exiting 1 with the CI-suppressing-token block

<!-- bkit:task 3 end -->

<!-- bkit:task 4 start -->

- [ ] **TASK 4:** Use the same classifier on the receipt path and in the landing routine
  - **UPDATE:** `hasVerifiedIncrement` in `.bkit/core/engine/commands/ci/push-gate.ts`: the fourth parameter becomes `outsideOf: (from: string, to: string) => { ok: true; outside: string[] } | { ok: false }`, called in the receipt loop in place of `changedOutside`; drop the `changedOutside` import.
  - **UPDATE:** `minPushUpdates` in `.bkit/core/engine/commands/ci/ci.ts`: pass `(a, b) => minPushOutside(cwd, a, b, paths)` to `hasVerifiedIncrement`.
  - **UPDATE:** `checkLanding` in `.bkit/core/engine/commands/land.ts`: call `minPushOutside(dir, base, head!, minPushPathspecs(readBkitConfig(dir)))`; drop the `changedOutside` import.
  - **UPDATE:** `.bkit/core/engine/commands/ci/push-gate.test.ts`: a test in `describe("verified incremental push gates")`; the template is committed with the checked code before the full gate runs.
  - **UPDATE:** `.bkit/core/engine/commands/land.test.ts`: a test in `describe("pushToDev")`; the template is on `origin/dev` before the landing.
  - **DEPENDS ON:** 3
  - **DONE WHEN:** the two tests below pass; every existing test in `push-gate.test.ts` and `land.test.ts` still passes (run `push-gate.test.ts` alone before treating a failure as real; see Suggested Scope Expansion); `pnpm typecheck` passes; `pnpm build` has run and `pnpm bkit:check:dist` passes.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/ci/push-gate.test.ts` `a full-gate receipt carries an audit template's project-section increment to the minimum gate` fails on `bkit ci min-push --update` exiting 1, because the receipt path still lists the template as outside
    - `.bkit/core/engine/commands/land.test.ts` `runs an audit template's project-section change through bkit:gate:min` fails on the landing running the unit gate instead of `bkit:gate:min`

<!-- bkit:task 4 end -->

<!-- bkit:group 1 end -->

<!-- bkit:group 2 start -->

### TASK GROUP 2: Docs

<!-- bkit:task 5 start -->

- [ ] **TASK 5:** Document the floor and the audit-template rule in § Git hooks — Husky
  - **UPDATE:** `.bkit/core/.bkit/templates.md`: § Git hooks — Husky — "What bkit writes" adds `docs/audits/**`; a new "Min push" bullet states the audit-template project-section rule and what keeps the full gate; "Min-push paths" says the floor already covers `docs/plans/**` and `docs/audits/**`.
  - **UPDATE:** `.bkit/templates.md`: re-rendered by `pnpm tsx .bkit/core/engine/cli.ts upgrade`, never edited by hand.
  - **READ:** `.bkit/instructions.md`: run `pnpm instructions:show --file templates.md` before editing sentences in the managed block.
  - **DEPENDS ON:** 4
  - **DONE WHEN:** both files carry the new text; `pnpm bkit check` exits 0; `.bkit/templates.md` equals `.bkit/core/.bkit/templates.md` apart from the managed-version marker line; `pnpm bkit:lint:prose` and `pnpm format:check` pass; `pnpm vitest run .bkit/core/engine/tools/instructions.test.ts` passes.
  - **TEST FIRST:** n/a — docs only.

<!-- bkit:task 5 end -->

<!-- bkit:group 2 end -->

### 🔒 Gate 2: Code Implementation Check

- [ ] **No bolt-on:** every `[NEW]` file traces to a `Reuse Inventory` `NEW` row.
- [ ] **Extensions landed:** every `EXTEND` landed in the artifact its row names.
- [ ] **No gate weakened:** no gate was weakened.
- [ ] **Red before code:** the tests step recorded every planned test of the group red, or as an `updated` existing test, before its code step ran.
- [ ] **Tests unchanged:** every planned test case matches the lines its red row recorded.
- [ ] **Unproven tests:** each planned test with no proven red is cleared only by a human-committed `TEST EXCEPTION` field.
- [ ] **Gate 2 — Verified:** every box above is checked.

**Mandatory Tasks (Testing & Documentation):**

- [ ] **Verify test coverage against Derived Test Matrix:** each row's test is in one task's `DONE WHEN`.
- [ ] **Sweep existing tests:** broken tests are fixed, and the full suite passes.
- [ ] **Sweep new tests:** every test a task's `DONE WHEN` names exists and passes.
- [ ] **Verify observability:** errors are logged and traced as `docs/observability.md` describes.
- [ ] **Update documentation:** the affected docs are rewritten to match.

### 🔒 Gate 3: Testing & Documentation Check

- [ ] **Docs updated:** every `Documentation Updates` row is done.
- [ ] **Docs index accurate:** `.agents/docs.md` is accurate.
- [ ] **Gate 3 — Verified:** every box above is checked.

## Verification Plan

### Automated Tests

- [ ] **Full Local Gate Suite:** `pnpm bkit:gate:static-unit-integration` and `pnpm bkit check` pass.
- [ ] **Test Synchronization:** the existing `.husky/pre-push min push`, `bkit ci min-push`, `bkit ci bookkeeping-push`, `verified incremental push gates` and `pushToDev` suites pass unchanged.
- [ ] **Build Configuration:** n/a — the new tests extend existing `*.test.ts` / `*.integration.test.ts` files, which the build already excludes.
- [ ] **Unit (`.bkit/core/engine/install/managed-block.test.ts`, `.bkit/core/engine/commands/ci/ci.test.ts`, `.bkit/core/engine/commands/ci/push-gate.test.ts`, `.bkit/core/engine/commands/land.test.ts`):** every Derived Test Matrix Unit row passes; each test builds its own temporary git repo and removes it.
- [ ] **Integration (`.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts`):** both hook copies pass the two new cases after `pnpm build`, because the suite runs `dist/cli.js`.
- [ ] **Apply local migrations:** n/a — no database.
- [ ] **Run all tests:** `pnpm test` and `pnpm test:integration` pass; `pnpm test:coverage:unit` stays above its branch floor.
- [ ] **Dist:** `pnpm bkit:check:dist` passes.

### 🔒 Gate 4: Automated Verification Check

- [ ] **Gate 4 — Verified:** every Automated Tests box is checked, with proof (test output, a CLI result or an API response).

### Manual Verification

> [!CAUTION]
> **Owner-run acceptance checks, advisory only.** An unticked box blocks nothing: not the merge, and not plan approval. This is not a Gate 1 human-confirmation section.

- [ ] **Step 1:** In a scratch consumer made with `pnpm build` and `node dist/cli.js install --claude`, set `origin/dev` to a commit holding `docs/templates/bkit-audit-logs.md`, then commit `docs/audits/202611/logs.md` and an edit below `<!-- bkit:end -->` in that template under a `[skip ci]` message. Run `node dist/cli.js ci min-push --ref=HEAD --json` and expect `minPush: true`, `outside: []`, and a log line naming the template.
- [ ] **Step 2:** In the same scratch consumer, amend the commit to also change one line above `<!-- bkit:end -->`, re-run the command, and expect exit 1 with the template in `outside`.
- [ ] **Step 3:** Push such a commit to a throwaway remote's `dev` through the adopted `.husky/pre-push` and check that `tmp/pre-push.log` shows `bkit:gate:min`, not the full gate, and no `BLOCKED` line.
