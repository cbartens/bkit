# Pre-push refuses audit files in `[skip ci]` pushes to `main` Implementation Plan

## Context & Goals

The pre-push hook lets an audit report (`docs/audits/**`) or an audit template's project section reach `dev` or `main` under a `[skip ci]` head, so no workflow runs on that push. The owner accepted that for `dev` only. Goal: the hook adds one check for `main` that refuses such a push before any gate, names the file and gives the trigger-commit fix; `dev` and every other `main` push behave as today; the three docs say the allowance covers `dev` only.

**Related Issues:**

- #1031 — pre-push refuses audit files in `[skip ci]` pushes to `main`
- #920 — Build agents run folder-wide tests mid-step and block other worktrees

---

## 👤 ⚠️ Acceptance Scenario

### Narrative

A maintainer pushes to `main` a commit whose message carries `[skip ci]` and which brings an audit report or an audit template's project section onto `main`. The hook stops the push before any gate and says which file caused it and how to fix it with a trigger commit. The same push to `dev` still goes through on the light gate.

### Success Criteria

- A push to `main` whose last commit carries `[skip ci]` and brings a file under `docs/audits/**` onto `main` exits non-zero before any gate, and the message names the file and the trigger-commit fix.
- A push to `main` whose last commit carries `[skip ci]` and brings only an audit template's project-section change onto `main` is refused the same way.
- The same two pushes to `dev` are still allowed with the light gate.
- A `[skip ci]` push to `main` that brings no audit file onto `main` behaves exactly as today, including a promotion whose range looks empty against `origin/dev`.
- `docs/security.md`, `docs/deployments.md` and `.bkit/core/.bkit/templates.md` say the audit allowance covers `dev` only.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| Audit report to `main` under a `[skip ci]` head | Blocked before any gate; message names the audit path. |
| Audit-template project section to `main` under a `[skip ci]` head | Blocked before any gate. |
| Audit report already on `origin/dev` but not on `origin/main`, promoted to `main` under a `[skip ci]` head | Blocked: the audit check compares with `origin/main`, so it finds the report even though the range against `origin/dev` is empty. |
| Audit report to `dev` under a `[skip ci]` head | Allowed, light gate (unchanged). |
| Audit report to `main` with no skip token | Not affected by this guard; the normal gate runs. |
| `[skip ci]` promotion to `main` with no audit file, whose range looks empty against `origin/dev` | As today: the existing min-push check decides; the audit check finds nothing. |
| One push updates both `dev` and `main` with the same audit-only `[skip ci]` SHA | Blocked, because the `main` update is refused. |
| The repo's `bkit.testing.minPushPaths` also matches `docs/audits/**` (bkit's own `package.json` lists `docs/**`) | Still blocked on `main`; the audit check does not read `minPushPaths`. |
| `origin/main` does not resolve | The audit check cannot prove the push safe, so it blocks, as the existing guard does when no base resolves. |

### Derived Test Matrix

`Type` is a tier from `docs/testing.md`. `Task` is the one runbook task that lands the row's test.

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| --target=main refuses a docs/audits change even when minPushPaths matches it | Unit | `.bkit/core/engine/commands/ci/ci.test.ts` | 1 |
| --target=main refuses a change to an audit template's project section only | Unit | `.bkit/core/engine/commands/ci/ci.test.ts` | 1 |
| --target=main accepts a plans-only range | Unit | `.bkit/core/engine/commands/ci/ci.test.ts` | 1 |
| --target=main finds an audit report already on origin/dev but not on origin/main | Unit | `.bkit/core/engine/commands/ci/ci.test.ts` | 1 |
| --target=main accepts a range that looks empty against origin/dev and adds no audit file | Unit | `.bkit/core/engine/commands/ci/ci.test.ts` | 1 |
| --target=main is not proven a min push when origin/main does not resolve | Unit | `.bkit/core/engine/commands/ci/ci.test.ts` | 1 |
| without --target, an audit-only range is still a min push | Unit | `.bkit/core/engine/commands/ci/ci.test.ts` | 1 |
| audit report to main under a [skip ci] head → blocked before any gate | Integration | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` | 2 |
| audit-template project section to main under a [skip ci] head → blocked before any gate | Integration | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` | 2 |
| plans-only change to main under a [skip ci] head → allowed, light gate | Integration | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` | 2 |
| one push updating dev and main with an audit-only [skip ci] head → blocked before any gate | Integration | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` | 2 |
| audit report to dev under a [skip ci] head → allowed, light gate | Integration | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` | 2 |
| audit-template project section to dev under a [skip ci] head → allowed, light gate | Integration | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` | 2 |
| --target=main refuses an audit template's project section even when minPushPaths matches docs/** | Unit | `.bkit/core/engine/commands/ci/ci.test.ts` | 4 |
| --target=main refuses a docs/audits file whose name has non-ASCII characters | Unit | `.bkit/core/engine/commands/ci/ci.test.ts` | 5 |
| --target=main refuses an audit template project section already on origin/dev when its managed block also changed since origin/main | Unit | `.bkit/core/engine/commands/ci/ci.test.ts` | 6 |
| --target=main refuses an audit template new to main whose project section was edited on origin/dev | Unit | `.bkit/core/engine/commands/ci/ci.test.ts` | 6 |

### 👤 ✅ Human Confirmation

- [ ] **Acceptance Scenario confirmed:** I have reviewed the Narrative, Success Criteria, Process Sketch, Concrete Example, Edge Cases, and Derived Test Matrix above. They correctly describe what "done" looks like.

---

## 👤 ⚠️ Breaking Changes & Naming Review

A `[skip ci]` push to `main` that brings an audit report or audit-template project section onto `main` is now refused. Every other `[skip ci]` push to `main` behaves as today. New flag `bkit ci min-push --target=main`; the default behaviour of `bkit ci min-push` is unchanged.

### 👤 ✅ Human Confirmation

- [ ] **Breaking Changes confirmed:** I have reviewed every breaking change and naming decision above.

---

## 👤 ⚠️ Open Questions & Assumptions

Decided already, so not open: audit reports under `docs/audits/**` may reach `dev` under a `[skip ci]` head; the hook refuses a `[skip ci]` audit push to `main`; a narrower skip-CI allow-list is rejected (`docs/decisions.jsonl` key `920-audit-reports-may-skip-ci-on-dev`).

- **Assumption:** the audit check compares with `origin/main` only to find audit files; today's check keeps measuring from `pushBase` (`origin/dev` first) → if wrong, other `main` pushes change behaviour.
- **Assumption:** the flag is named `--target=main` → a rename touches the verb spec, the hook and the tests.
- **Assumption:** consumers' hooks change only when they re-copy the template (copy-and-own); an old hook never passes the flag, and the engine flag ships with the next release → no migration applies.
- **Stale line numbers:** the issue and the deferral cite hook lines 115, 188 and 233-244 and doc lines `docs/security.md:25`, `docs/deployments.md:579`, `docs/testing.md:842`. At this commit the template's guard loop is at lines 233-244 and its `PUSH_SHARED_SHAS` at 107 and 124; bkit's `.husky/pre-push` copy differs from the template (guard loop at 293-302, `PUSH_SHARED_SHAS` at 164 and 181); the security text is the "Accepted risk" paragraph at `docs/security.md:101` (§ Supply-Chain → This project); the `ci.test.ts` row is `docs/testing.md:979`; `docs/deployments.md` § Pre-push checklist has no dev/main skip-CI bullet yet (the CI-suppressor HEAD guard paragraph at line 588 covers feature branches). The tasks name sections, not lines.

### 👤 ✅ Human Confirmation

- [ ] **Open Questions & Assumptions confirmed:** I have resolved or explicitly accepted every open question and assumption above.

---

## Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| The `dev` allowance for audit reports | The owner accepted it | `docs/decisions.jsonl` key `920-audit-reports-may-skip-ci-on-dev` |
| A narrower skip-CI allow-list | Rejected by the decision | `docs/decisions.jsonl` key `920-audit-reports-may-skip-ci-on-dev` |
| Refusing other `[skip ci]` pushes to `main` that look empty against `origin/dev` | Not decided | A future design decision |
| `bkit land` and `commands/workflow/tests.ts` | They use `minPushPathspecs` unchanged | Unchanged |
| Server-side branch protection on `main` | Not part of the hook change | `docs/deployments.md` |

## Security & Privacy

None — no new routes, DB writes, secrets, or user input. The change closes an unscanned path: an audit report that quotes a leaked token no longer reaches `main` without a workflow run.

## Documentation Consultation

<!-- prettier-ignore -->
| Topic | Recommended path | Applies | Source used (path and section) | Coverage | Gap and action |
| --- | --- | --- | --- | --- | --- |
| architecture | `docs/architecture.md` | no — the hook and one CLI verb change, no topology change | `docs/architecture.md` (searched for pre-push and min-push, no match) | covered | None |
| technology | `docs/technology.md` | no — Husky already named, no new library | `docs/technology.md` § Git hooks row | covered | None |
| security | `docs/security.md` | yes | `docs/security.md` § Supply-Chain (GitHub Actions) → This project, the "Accepted risk (audit reports and `[skip ci]`)" paragraph | covered | Task 3 rewrites the paragraph to `dev` only |
| testing | `docs/testing.md` | yes | `docs/testing.md` § Key test files, the `commands/ci/ci.test.ts` row | covered | Task 3 adds the `--target=main` cases |
| deployments | `docs/deployments.md` | yes | `docs/deployments.md` § Pre-push checklist | covered | Task 3 adds the `main` audit check |
| templates (hook contract) | `.bkit/core/.bkit/templates.md` | yes | `.bkit/core/.bkit/templates.md` § Git hooks — Husky, the `[skip ci]` guards and min-push bullets | covered | Task 3 adds the `main` audit check |
| data-schema, design, observability, noise, setup | `docs/data-schema.md` and the rest | no — no database, UI, logging, alert or local-setup change | none | none | None |

## Documentation Warnings

None

## Reuse Inventory

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| Find audit files a push brings onto `main` | `.bkit/core/engine/commands/ci/ci.ts` | `grep -n "minPush\|minPushOutside\|AUDIT_TEMPLATE_RE\|pushBase" .bkit/core/engine/commands/ci/ci.ts`; read `minPush` and the `min-push` verb spec | `minPushOutside` already classifies audit templates into `sections`; `minPush` already loops refs and reports not-proven | EXTEND | Add `--target=main` to `minPush` and the verb spec: after today's check, diff each ref against its merge-base with `origin/main` and refuse `docs/audits/**` and `sections` files |
| Route `main` SHAs to the new check | `.bkit/templates/.husky/pre-push` | `grep -n "PUSH_SHARED_SHAS\|min-push\|skip-token" .bkit/templates/.husky/pre-push .husky/pre-push` | the `PUSH_SHARED_SHAS` loop already runs skip-token then min-push | EXTEND | Collect `refs/heads/main` SHAs in their own list and pass `--target=main` for them |
| Route `main` SHAs to the new check in bkit's own hook | `.husky/pre-push` | same grep | the same loop in bkit's adopted copy, which differs from the template elsewhere | EXTEND | The identical guard edit in this copy |
| Hook tests for `main` | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` | `grep -n "describe(\|min push" ...`; read `describe(".husky/pre-push min push")` | the `dev` cases and `commitFiles` / `push` helpers run for both hook copies | EXTEND | Add the `main` cases beside them |
| Unit tests for `--target=main` | `.bkit/core/engine/commands/ci/ci.test.ts` | `grep -n "min-push" ...`; read `describe("bkit ci min-push")` | existing min-push cases and repo builders | EXTEND | Add the `--target=main` cases in that describe |
| Docs say audit allowance covers `dev` only | `docs/security.md` | `grep -n "audit" docs/security.md docs/deployments.md .bkit/core/.bkit/templates.md docs/testing.md` | the "Accepted risk" paragraph and the guards bullets | EXTEND | Edit the existing paragraphs and bullets; no new doc |

## Architecture & Component Changes

**Ledger rows:** None

### CLI

#### [MODIFY] `.bkit/core/engine/commands/ci/ci.ts`

- **Existence Check:** the file exists; `minPush` is at `ci.ts:670`, the `min-push` verb spec near line 925.
- `bkit ci min-push --target=main`: today's check unchanged, then an audit check against `origin/main`. `minPushPathspecs` stays unchanged.

### Hook

#### [MODIFY] `.bkit/templates/.husky/pre-push` and `.husky/pre-push`

- **Existence Check:** both files exist.
- `main` SHAs get `--target=main`; the refusal message says audit reports may skip CI on `dev` only and gives the trigger-commit fix.

### Tests and docs

#### [MODIFY] `.bkit/core/engine/commands/ci/ci.test.ts`, `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts`, `docs/security.md`, `docs/deployments.md`, `.bkit/core/.bkit/templates.md`, `docs/testing.md`

- **Existence Check:** all exist.

## Supersession Inventory

None — the change removes an allowance (audit report or audit-template section on `main` under `[skip ci]`), not an artifact.

## Documentation Updates

<!-- prettier-ignore -->
| Doc | Change required |
| --- | --- |
| `docs/security.md` | The "Accepted risk" paragraph: the allowance covers `dev` only, `main` refuses it |
| `docs/deployments.md` | § Pre-push checklist: a `main` push also runs the audit check against `origin/main` |
| `.bkit/core/.bkit/templates.md` | § Git hooks — Husky: the same, in the `[skip ci]` guards and min-push bullets |
| `docs/testing.md` | § Key test files: the `commands/ci/ci.test.ts` row gains the `--target=main` cases |

## Rollback Strategy

Code-only — `git revert` sufficient. Consumers' hooks are copy-and-own, so an old hook never passes `--target=main` and is unaffected.

## Agent Execution Runbook

<!-- bkit:group 1 start -->

### TASK GROUP 1: Refuse audit files in `[skip ci]` pushes to `main`

<!-- bkit:task 1 start -->

- [x] **TASK 1:** Add an audit check for `main` to `bkit ci min-push`
  - **UPDATE:** `minPush` in `.bkit/core/engine/commands/ci/ci.ts`: with `--target=main`, run today's check unchanged, then diff each `--ref` against its merge-base with `origin/main`; refuse and name every changed file under `docs/audits/**` and every file `minPushOutside` puts in `sections`; when `origin/main` does not resolve, report not proven, as today's no-base path does
  - **UPDATE:** `.bkit/core/engine/commands/ci/ci.ts`: the `min-push` verb spec declares `--target` (only `main` accepted) and refuses it with `--update` as a usage error, like `--ref`
  - **READ:** `minPushPathspecs` in `.bkit/core/engine/commands/ci/ci.ts`: stays unchanged, since `land.ts:197` and `commands/workflow/tests.ts:2386` use it
  - **READ:** `docs/testing.md`: § Key test files and § Unit, for the tier of the new cases
  - **UPDATE:** `.bkit/core/engine/commands/ci/ci.test.ts`: the `--target=main` cases inside `describe("bkit ci min-push")`
  - **DONE WHEN:** `pnpm vitest run .bkit/core/engine/commands/ci/ci.test.ts` passes, and `pnpm build` then `pnpm tsx .bkit/core/engine/cli.ts upgrade` have run
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/ci/ci.test.ts` `--target=main refuses a docs/audits change even when minPushPaths matches it` fails on the audit report being accepted
    - `.bkit/core/engine/commands/ci/ci.test.ts` `--target=main refuses a change to an audit template's project section only` fails on the section exception still applying for `main`
    - `.bkit/core/engine/commands/ci/ci.test.ts` `--target=main accepts a plans-only range` fails on a non-audit min push being refused
    - `.bkit/core/engine/commands/ci/ci.test.ts` `--target=main finds an audit report already on origin/dev but not on origin/main` fails on the check measuring only from `origin/dev`
    - `.bkit/core/engine/commands/ci/ci.test.ts` `--target=main accepts a range that looks empty against origin/dev and adds no audit file` fails on the `main` check being stricter than today for non-audit files
    - `.bkit/core/engine/commands/ci/ci.test.ts` `--target=main is not proven a min push when origin/main does not resolve` fails on a missing base being treated as safe
    - `.bkit/core/engine/commands/ci/ci.test.ts` `without --target, an audit-only range is still a min push` fails on the default behaviour changing

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [x] **TASK 2:** Run the audit check for `main` SHAs in the hook template and bkit's copy
  - **UPDATE:** `.bkit/templates/.husky/pre-push`: collect SHAs pushed to `refs/heads/main` in their own list next to `PUSH_SHARED_SHAS` (set at line 107, appended at line 124); in the CI-suppressor guard loop (lines 236-244) call `bkit ci min-push --ref="$push_sha" --target=main` for those SHAs and today's call for the rest; the `main` message says audit reports may skip CI on `dev` only and gives the trigger-commit fix
  - **UPDATE:** `.husky/pre-push`: the identical edit; this copy's `PUSH_SHARED_SHAS` is at lines 164 and 181 and its guard loop at lines 293-302
  - **READ:** `docs/deployments.md`: § Pre-push checklist, for the guard's current wording
  - **UPDATE:** `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts`: the `main` cases inside `describe(".husky/pre-push min push")`, run for both hook copies, each name prefixed `${hook}: ` like its neighbours
  - **DEPENDS ON:** 1
  - **DONE WHEN:** `pnpm vitest run .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` passes for both hook copies
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `audit report to main under a [skip ci] head → blocked before any gate` fails on the push reaching the gates or succeeding
    - `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `audit-template project section to main under a [skip ci] head → blocked before any gate` fails on the section exception still applying for `main`
    - `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `plans-only change to main under a [skip ci] head → allowed, light gate` fails on a non-audit min push to `main` being blocked
    - `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `one push updating dev and main with an audit-only [skip ci] head → blocked before any gate` fails on the `dev` update hiding the `main` one
    - `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `audit report to dev under a [skip ci] head → allowed, light gate` fails on the `main` check leaking onto `dev` — existing test, taken over because this task changes the loop it runs through
    - `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `audit-template project section to dev under a [skip ci] head → allowed, light gate` fails on the `main` check leaking onto `dev` — existing test, taken over for the same reason

<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->

- [x] **TASK 3:** Say the audit allowance covers `dev` only
  - **UPDATE:** `docs/security.md`: § Supply-Chain (GitHub Actions) → This project, the "Accepted risk (audit reports and `[skip ci]`)" paragraph (line 101), says the hook lets an audit report reach `dev` under a `[skip ci]` head and refuses it on `main`
  - **UPDATE:** `docs/deployments.md`: § Pre-push checklist, adds that a `main` push also runs the audit check against `origin/main`
  - **UPDATE:** `.bkit/core/.bkit/templates.md`: § Git hooks — Husky, the `[skip ci]` guards bullet (lines 319-323) and the min-push bullets (lines 310-311), add the same
  - **UPDATE:** `docs/testing.md`: § Key test files, the `commands/ci/ci.test.ts` row (line 979), adds the `--target=main` cases
  - **DEPENDS ON:** 2
  - **DONE WHEN:** no line in those four files says an audit report may reach `main` under a `[skip ci]` head, and `pnpm build` then `pnpm tsx .bkit/core/engine/cli.ts upgrade` have refreshed rendered copies (never edited by hand)
  - **TEST FIRST:** n/a — docs only

<!-- bkit:task 3 end -->

<!-- bkit:group 1 end -->

<!-- bkit:group 2 start -->

### TASK GROUP 2: Challenge round 1 findings

<!-- bkit:task 4 start -->

- [x] **TASK 4:** In bkit's own repo (`bkit.testing.minPushPaths: ["docs/**"]`) and in any repo whose `minPushPaths` covers `docs/templates/**`, a `[skip ci]` push to `main` that changes an audit template's project section passes `--target=main`: `mainAuditFiles` hands `paths` (with `minPushPaths`) to `minPushOutside`, the template matches a min-push path, never lands in `outside`, so it never reaches `sections` and is never refused
      **Severity:** HIGH · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/ci/ci.ts:678` · **Round:** 1
  - **DONE WHEN:** the template half of the `main` check ignores `minPushPaths` / `ciSkipPaths` (for example `minPushOutside(root, mb, sha, [])`, so every changed file is classified), matching the plan's edge case "the audit check does not read `minPushPaths`", and a project-section-only template change is refused on `main` whatever `minPushPaths` holds
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/ci/ci.test.ts` `--target=main refuses an audit template's project section even when minPushPaths matches docs/**` fails on exit 0 for `pushedToMain(belowOnly.before, belowOnly.after, { bkit: { testing: { minPushPaths: ["docs/**"] } } })` with `--target=main`, where it should exit 1 and name `T1` on stderr

<!-- bkit:task 4 end -->
<!-- bkit:task 5 start -->

- [x] **TASK 5:** A `[skip ci]` push to `main` carrying `docs/audits/202611/sécurité.md` (any non-ASCII, tab, double quote or backslash in the name) passes `min-push --target=main`, because `git diff --name-only` without `-z` prints the path C-quoted (`"docs/audits/202611/s\303\251curit\303\251.md"`), which fails `startsWith("docs/audits/")`, while today's `-z` pathspec check still counts it as a min-push file
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/ci/ci.ts:676` · **Round:** 1
  - **DONE WHEN:** `mainAuditFiles` takes its audit list from NUL-delimited, unquoted names (for example `diff.changed`, which `minPushOutside` already returns from `git diff --name-only -z --no-renames`), the separate quoted `git diff --name-only` call is gone, and a non-ASCII `docs/audits/**` path is refused and named verbatim
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/ci/ci.test.ts` `--target=main refuses a docs/audits file whose name has non-ASCII characters` fails on exit 0 with `minPush: true` for `pushedToMain({}, { "docs/audits/202611/sécurité.md": "# Report\n" })` (set `GIT_CONFIG_COUNT=1`, `GIT_CONFIG_KEY_0=core.quotePath`, `GIT_CONFIG_VALUE_0=true` in `process.env` for the run so a machine with `core.quotePath=false` cannot mask it)

<!-- bkit:task 5 end -->
<!-- bkit:task 6 start -->

- [x] **TASK 6:** After a `bkit upgrade` lands on `dev` (every audit template's managed block now differs from `origin/main`), a project-section edit pushed to `dev` under `[skip ci]` and then promoted to `main` under a `[skip ci]` plans-only head passes `--target=main`: against `origin/main` the template's managed head differs (or the template is new to `main`), so `minPushOutside` files it under `outside`, not `sections`, and `mainAuditFiles` only refuses `sections`. A template with more change than section-only escapes a check that refuses section-only
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/ci/ci.ts:681` · **Round:** 1
  - **DONE WHEN:** `mainAuditFiles` refuses every changed top-level `docs/templates/bkit-audit-*.md` whose text below `<!-- bkit:end -->` differs between the `origin/main` merge-base (absent counts as empty) and the pushed commit, whether or not its managed block also changed, the same way it finds an audit report already on `origin/dev` but not on `origin/main`
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/ci/ci.test.ts` `--target=main refuses an audit template project section already on origin/dev when its managed block also changed since origin/main` fails on exit 0: `origin/main` holds `auditTemplate("block", "old")` at `T1`, `origin/dev` holds `auditTemplate("block2", "new project text")`, the head adds only `docs/plans/202611/logs/1-x/status.jsonl` under `[skip ci]`; with `--target=main` it should exit 1 and name `T1`
    - `.bkit/core/engine/commands/ci/ci.test.ts` `--target=main refuses an audit template new to main whose project section was edited on origin/dev` fails on exit 0: `origin/main` lacks `T1`, `origin/dev` holds `auditTemplate("block", "new project text")`, the head adds only a plan log under `[skip ci]`; with `--target=main` it should exit 1 and name `T1`

<!-- bkit:task 6 end -->
<!-- bkit:group 2 end -->
