# Verbose CI Marker Reads the Head Commit on a Manual Run Implementation Plan

## Context & Goals

A commit-message marker such as `[verbose ci]` is meant to steer a manual CI run (`workflow_dispatch`) as well as push and pull_request runs. The template's force markers already do. `[verbose ci]` does not, because the job-level `env:` of `bkit-tests-static` and `bkit-tests-unit` only reads `github.event.head_commit.message` and `github.event.pull_request.title`, and a manual run fills neither. This plan adds a manual-run step that reads the head commit and turns verbose output on, keeps bkit's own `.github/workflows/bkit-ci.yml` identical to the template, and removes the "markers are inert on `workflow_dispatch`" claim from the template comment and the docs. Decision rows: `1012-ci-markers-act-on-manual-dispatch` and `1032-owner-confirmed-the-ci-file-edit-for-the-verbose-marker`.

**Related Issues:**

- #1032 — Verbose CI head commit marker on a manual run (this issue)
- #1012 — Project Goals audit: where bkit falls short, and what to change

---

## 👤 ⚠️ Acceptance Scenario

> [!CAUTION]
> 🛑 The owner reads and confirms this section.

### Narrative

A person starts a manual CI run on a commit whose message contains `[verbose ci]`. The static and unit lanes run with verbose output, the same as a push with that marker. The template comment and the docs say markers act on a manual run.

### Success Criteria

- On a `workflow_dispatch` run whose head commit message contains `[verbose ci]`, the static and unit jobs of the template run their steps after the marker step with `VERBOSE_CI=1`, `TURBO_LOG_LEVEL=full` and `DEBUG=vercel:*,supabase:*`.
- On a `workflow_dispatch` run whose head commit has no `[verbose ci]`, none of those values is set.
- Push and pull_request runs behave exactly as today.
- No comment in either CI file and no line of `.bkit/core/.bkit/workflows.md` § Commit-message force tags says a marker is inert on `workflow_dispatch`.
- `.github/workflows/bkit-ci.yml` matches the template outside its recorded edits.

### Process Sketch

- **WHEN** a manual run starts on a head commit containing `[verbose ci]` **→ THEN** the marker step appends `VERBOSE_CI=1`, `TURBO_LOG_LEVEL=full` and `DEBUG=vercel:*,supabase:*` to `$GITHUB_ENV`, and the later steps see them.
- **WHEN** a manual run starts on a head commit without the marker **→ THEN** the marker step writes nothing.
- **WHEN** a push or pull_request run starts **→ THEN** the marker step is skipped and the job-level `env:` decides, as today.
- **IF** `git log` cannot read `$GITHUB_SHA` **→ THEN** the step fails loudly and the run stops.

### Concrete Example

**Setup:** A maintainer on `dev` whose latest commit message is `fix: flaky test [verbose ci]`.

**Steps:**

1. Maintainer starts a manual run of the CI workflow → the static and unit jobs run "Read Verbose Marker (Manual Run)" before "Configure Verbose CI".
2. The step finds `[verbose ci]` in the head commit → it writes the three values to `$GITHUB_ENV`.
3. "Configure Verbose CI" and every later step run with `VERBOSE_CI=1`, `TURBO_LOG_LEVEL=full` and `DEBUG=vercel:*,supabase:*`.

**Outcome:** The manual run's log shows the verbose output. `NODE_OPTIONS` stays unset, because GitHub refuses it from `$GITHUB_ENV`.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| Manual run, head commit contains `[verbose ci]` | The marker step writes `VERBOSE_CI=1`, `TURBO_LOG_LEVEL=full` and `DEBUG=vercel:*,supabase:*` to `$GITHUB_ENV`. |
| Manual run, head commit has no marker | The marker step writes nothing; the job-level values stay as the `env:` expression set them (off). |
| Manual run with `[verbose ci]` in the head commit, then more manual runs without a new commit | Every manual run stays verbose until a new commit lands. This is the accepted cost in the decision row. |
| Push run with `[verbose ci]` | The job-level `env:` already turns verbose on; the marker step does not run. |
| Pull request run whose title has `[verbose ci]` | Unchanged: the job-level `env:` reads the PR title. |
| Manual run with `[verbose ci]`: `NODE_OPTIONS` | Stays unset. `$GITHUB_ENV` cannot set it, and the step does not try. |
| `git log` cannot read `$GITHUB_SHA` | The step fails loudly rather than silently leaving verbose off. |

### Derived Test Matrix

`Type` is a tier from `docs/testing.md`. `Task` is the one runbook task that lands the row's test.

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| static and unit jobs each run a manual-run verbose marker step before Configure Verbose CI | Unit | `.bkit/core/engine/audits/templates/template-ci-yml.test.ts` | 1 |
| passes actionlint | Unit | `.bkit/core/engine/audits/templates/template-ci-yml.test.ts` | 1 |
| verbose marker step writes VERBOSE_CI, TURBO_LOG_LEVEL and DEBUG to GITHUB_ENV for a [verbose ci] head commit | Unit | `.bkit/core/engine/audits/templates/ci-scripts.test.ts` | 1 |
| verbose marker step writes nothing to GITHUB_ENV for a head commit without the marker | Unit | `.bkit/core/engine/audits/templates/ci-scripts.test.ts` | 1 |
| .github/workflows/bkit-ci.yml | Unit | `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` | 1 |
| no template comment says a marker is inert on workflow_dispatch | Unit | `.bkit/core/engine/audits/templates/templates-content.test.ts` | 2 |
| never writes NODE_OPTIONS to $GITHUB_ENV | Unit | `.bkit/core/engine/audits/templates/templates-content.test.ts` | 2 |
| verbose marker step writes the TURBO_LOG_LEVEL value the job-level env sets on a marked push | Unit | `.bkit/core/engine/audits/templates/ci-scripts.test.ts` | 4 |
| verbose marker step fixture commits under a global git config that signs commits | Unit | `.bkit/core/engine/audits/templates/ci-scripts.test.ts` | 4 |
| no template doc says markers are inert on a dispatch | Unit | `.bkit/core/engine/audits/templates/templates-content.test.ts` | 4 |

### 👤 ✅ Human Confirmation

- [ ] **Acceptance Scenario confirmed:** I have reviewed the Narrative, Success Criteria, Process Sketch, Concrete Example, Edge Cases, and Derived Test Matrix above. They correctly describe what "done" looks like.

---

## 👤 ⚠️ Breaking Changes & Naming Review

> [!CAUTION]
> 🛑 The owner reads and confirms this section.

None. Push and pull_request runs are unchanged. A manual run whose head commit already carries `[verbose ci]` becomes verbose, which is the decided behaviour. The new step is named "Read Verbose Marker (Manual Run)", in the style of the existing step names.

### 👤 ✅ Human Confirmation

- [ ] **Breaking Changes confirmed:** I have reviewed every breaking change and naming decision above.

---

## 👤 ⚠️ Open Questions & Assumptions

> [!CAUTION]
> 🛑 The owner reads and confirms this section.

- **Assumption:** a value written to `$GITHUB_ENV` replaces a job-level `env:` value of the same name for the steps after it. GitHub's workflow-commands page says `GITHUB_ENV` values reach "all subsequent steps in a job" but does not state the precedence → **if wrong**, a manual run stays off for `VERBOSE_CI` and `TURBO_LOG_LEVEL` (the job-level expression wins) while `DEBUG` still turns on. The first manual run after this lands is the proof.
- **Assumption:** `NODE_OPTIONS` (`--trace-warnings`) stays off on a manual run. GitHub refuses `NODE_OPTIONS` from `$GITHUB_ENV`, and setting it any other way needs a new job, which the owner's scope excludes → **if wrong**, a manual run lacks stack traces on deprecations only.
- **Assumption:** `.bkit/core/.bkit/workflows.md` § Commit-message force tags (the `workflow_dispatch` bullet) describes only bkit's own `.github/workflows/bkit-ci.yml`, whose "Read Markers" step sets `MSG=""` on a manual run. The template has no active planner; its "Detect Direct Push" step already reads the head commit there.
- **Assumption:** in bkit's own copy, "Read Markers" keeps ignoring the force markers on a manual run, so they do not act there. "Decide Run Level" already runs everything on a manual run, so they would change nothing.
- **Assumption:** `docs/deployments.md` carries the same wrong sentence in the `workflow_dispatch` bullet of § Commit-message force tags (line 105) and a second one at line 178 ("Markers are inert on a dispatch"), and both are fixed here, although the owner's list names only the template comment and `.bkit/core/.bkit/workflows.md` → **if wrong**, the doc keeps contradicting the template.
- **Assumption:** the new step tests for the fixed marker only and runs no text from the commit message (condition set by the orchestrator in the owner-confirmation comment) → **if wrong**, the outside review before landing rejects the change.
- The knowledge row `consumer-ci-dispatch-default-burns-build-quota` says markers are inert on `workflow_dispatch`. It is corrected through the knowledge ledger, not here.
- Consumers get the change only when they re-copy the template; it is copy-and-own, so no migration applies.

### 👤 ✅ Human Confirmation

- [ ] **Open Questions & Assumptions confirmed:** I have resolved or explicitly accepted every open question and assumption above.

---

## Alternative Approaches & Recommendations

- Steering a manual run with inputs alone is rejected (`docs/decisions.jsonl` key `1012-ci-markers-act-on-manual-dispatch`).
- Setting `NODE_OPTIONS` on a manual run needs a planner or marker job in the template; excluded by the owner's scope.

## Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| Making `[force cache]`, `[force build]` and `[force full]` act on a manual run in bkit's own copy ("Read Markers" in `bkit-tests-scope`) | Adds to the goal; the issue is `[verbose ci]` only | Follow-up if wanted |
| The integration lane of bkit's own copy | Not part of the owner's list | Follow-up if wanted |
| A planner or marker job in the template to carry `NODE_OPTIONS` | Adds a job; excluded by the owner's scope | Follow-up if wanted |
| Correcting the knowledge row `consumer-ci-dispatch-default-burns-build-quota` | Corrected through the knowledge ledger | Knowledge ledger |
| The fixture `tests/fixtures/shipped-text/v6.1.1/docs/deployments.md` | A frozen shipped-text fixture | Left as is |

## Suggested Scope Expansion

<!-- prettier-ignore -->
| Candidate | Source | Overlaps | Recommendation |
| --- | --- | --- | --- |
| `docs/testing.md` § CI verbosity lists `TURBO_LOG_LEVEL=full`, the value a manual run also sets | This plan | The marker step in TASK 1, set to `full` by TASK 4 | Folded into TASK 4 |

## Security & Privacy

- **User Input:** the head commit message is user-controlled text. The step compares it against the fixed string `[verbose ci]` with a shell `case` match, assigns it to a shell variable and never expands it as code, never writes it to `$GITHUB_ENV` and never interpolates `${{ }}` text into the `run:` body. Only fixed literals are appended to `$GITHUB_ENV`. This is the orchestrator's condition from the owner confirmation; an outside review checks it before the change lands.
- No new API route, DB write, secret or env var.

## Pre-Flight / Dependencies

### Core

- [ ] **Package Management:** no package changes.
- [ ] **Dependency Versions:** no new dependency; actionlint (already a project check) validates the step.
- [ ] **Existing-Solution Search (reuse over duplicate):** recorded in `Reuse Inventory`.
- [ ] **User Context:** the owner confirmed the CI file edit (decision row `1032-owner-confirmed-the-ci-file-edit-for-the-verbose-marker`).
- [ ] **Project Context:** `docs/decisions.jsonl` rows `1012-ci-markers-act-on-manual-dispatch` and `1032-owner-confirmed-the-ci-file-edit-for-the-verbose-marker` are read.
- [ ] **Project Documents:** assessed through the `.agents/docs.md` index; sources in `Documentation Consultation`.
- [ ] **Prerequisite Plans:** None.

### Conditional

- [ ] **Deployments & Setup:** CI behaviour follows `docs/deployments.md` § Commit-message force tags, which TASK 3 updates.

### 🔒 Gate 1: Prerequisites Check

- [ ] **Acceptance Scenario confirmed:** the `👤 ⚠️ Acceptance Scenario` checkbox is `[x]`, ticked by a human.
- [ ] **Breaking Changes confirmed:** the `👤 ⚠️ Breaking Changes & Naming Review` checkbox is `[x]`, ticked by a human.
- [ ] **Open Questions confirmed:** the `👤 ⚠️ Open Questions & Assumptions` checkbox is `[x]`, ticked by a human.
- [ ] **Security & Privacy checked:** every applicable row is verified, or `None` is justified.
- [ ] **Reuse Inventory complete:** every capability has a row with `Search performed` and `Decision` filled in.
- [ ] **Reuse reasons:** every `NEW` row cites its reason.
- [ ] **Gate 1 — Verified:** every item above, every Core item and every applicable Conditional item is checked.

## Documentation Consultation

<!-- prettier-ignore -->
| Topic | Recommended path | Applies | Source used (path and section) | Coverage | Gap and action |
| --- | --- | --- | --- | --- | --- |
| architecture | `docs/architecture.md` | yes — the GitHub Actions runner component | `docs/architecture.md` component table (GitHub Actions runner row) | covered | None. |
| technology | `docs/technology.md` | yes — actionlint checks the workflow | `docs/technology.md` stack table (GitHub Actions and actionlint rows) | covered | None. |
| security | `docs/security.md` | yes — commit message is untrusted input | `docs/security.md` § Untrusted Content & Prompt Injection and the CI permissions rows | covered | None. The step's fixed-marker-only rule is in `Security & Privacy`. |
| testing | `docs/testing.md` | yes — CI verbosity | `docs/testing.md` § CI verbosity (`[verbose ci]`) and the test-file index row for `templates-content.test.ts` | partial | The section lists `TURBO_LOG_LEVEL=full`, which the manual run also sets after TASK 4. |
| deployments | `docs/deployments.md` | yes — CI marker behaviour | `docs/deployments.md` § Commit-message force tags | covered | Two wrong "inert" sentences, fixed in TASK 3. |
| data-schema | `docs/data-schema.md` | no — no database change | none | none | Not applicable. |
| design | `docs/design.md` | no — no UI | none | none | Not applicable. |
| observability | `docs/observability.md` | no — no logging change | none | none | Not applicable. |
| setup | `docs/setup.md` | no — no local-setup change | none | none | Not applicable. |
| noise | `docs/noise.md` | no — no noise change | none | none | Not applicable. |

Required reads and doc updates sit in TASK 1 to TASK 3 (`READ:` and `UPDATE:` lines).

## Documentation Warnings

None

## Data Schema Integration

None — no database change.

### Data Schema Usage

None

### Data Schema Changes

None

## Reuse Inventory

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| Read the head commit on a manual run and turn verbose on | `.bkit/templates/.github/workflows/bkit-ci.yml` | `grep -n 'verbose ci\|Configure Verbose CI\|Detect Direct Push' .bkit/templates/.github/workflows/bkit-ci.yml`; read lines 36-95 and 303-335 | "Detect Direct Push" reads the head commit with `git log -1 --pretty=%B "$GITHUB_SHA"`; "Configure Verbose CI" sets `DEBUG` | EXTEND | Add one step before "Configure Verbose CI" in each of the two jobs; same `git log` read as "Detect Direct Push". |
| The same step in bkit's own copy | `.github/workflows/bkit-ci.yml` | `grep -n 'Configure Verbose CI\|verbose ci' .github/workflows/bkit-ci.yml`; read `ADOPTED[".github/workflows/bkit-ci.yml"]` in `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` | The static and unit jobs, outside the recorded edits | EXTEND | The copy must match the template there, so the same step is added byte for byte. |
| Reword the "inert" template comment and guard it | `.bkit/core/engine/audits/templates/templates-content.test.ts` | `grep -n 'NODE_OPTIONS\|dispatch' .bkit/core/engine/audits/templates/templates-content.test.ts` | `[verbose ci] NODE_OPTIONS knob` tests | EXTEND | Add one test next to them. |
| Tests for the step | `.bkit/core/engine/audits/templates/ci-scripts.test.ts` | `grep -n 'describe(\|capstoneOf\|spawnSync' .bkit/core/engine/audits/templates/ci-scripts.test.ts` | `capstoneOf`, `WORKFLOWS`, the capstone step runner using `spawnSync("sh", ["-c", step.run])` | EXTEND | Add a describe that picks the new step from the static and unit jobs and runs its script against a fixture git repo. |
| Structure and actionlint test for the step | `.bkit/core/engine/audits/templates/template-ci-yml.test.ts` | `grep -n 'actionlint\|describe(' .bkit/core/engine/audits/templates/template-ci-yml.test.ts` | `filledTemplate()`, `parseYaml()`, the actionlint test | EXTEND | Add one ordering test; the existing actionlint test already covers the new step. |
| Say markers act on a manual run (framework docs) | `.bkit/core/.bkit/workflows.md` | `grep -n 'inert' .bkit/core/.bkit/workflows.md` | § Commit-message force tags and § CI / Vercel commit tags bullets | EXTEND | Rewrite the `workflow_dispatch` bullet and align neighbours. |
| Same sentence in the project doc | `docs/deployments.md` | `grep -n 'inert' docs/deployments.md` | § Commit-message force tags bullet (line 105) and line 178 | EXTEND | Same rewrite. |

## Architecture & Component Changes

**Ledger rows:** None (the decision rows `1012-ci-markers-act-on-manual-dispatch` and `1032-owner-confirmed-the-ci-file-edit-for-the-verbose-marker` already exist).

### CI

#### [MODIFY] `.bkit/templates/.github/workflows/bkit-ci.yml`

- **Existence Check:** the file exists.
- In `bkit-tests-static` and `bkit-tests-unit`, add "Read Verbose Marker (Manual Run)" before "Configure Verbose CI", gated `if: github.event_name == 'workflow_dispatch'`. It reads the head commit message with `git log -1 --pretty=%B "$GITHUB_SHA"` (the checkout uses `fetch-depth: 0`), matches the fixed string `[verbose ci]` with a `case` and, on a match, appends `VERBOSE_CI=1`, `TURBO_LOG_LEVEL=full` and `DEBUG=vercel:*,supabase:*` to `$GITHUB_ENV`. It never writes `NODE_OPTIONS` and runs no commit text.
- Reword the JOB 2f scaffold comment (line 926): a dispatch input is how a human forces a fresh native build without a new commit; drop "markers are inert on workflow_dispatch".

#### [MODIFY] `.github/workflows/bkit-ci.yml`

- **Existence Check:** the file exists.
- The same step in `bkit-tests-static` and `bkit-tests-unit`, byte for byte. "Read Markers" in `bkit-tests-scope` and the integration lane stay unchanged.

### Tests

#### [MODIFY] `.bkit/core/engine/audits/templates/template-ci-yml.test.ts`, `.bkit/core/engine/audits/templates/ci-scripts.test.ts`, `.bkit/core/engine/audits/templates/templates-content.test.ts`

- **Existence Check:** all three exist.
- New tests as in the Derived Test Matrix. `dogfood-templates.test.ts` is read only.

### Documentation

#### [MODIFY] `.bkit/core/.bkit/workflows.md`, `docs/deployments.md`

- **Existence Check:** both exist.
- Rewrite the "inert" sentences. `.bkit/workflows.md` is re-rendered by `bkit upgrade`, never edited by hand.

## Supersession Inventory

<!-- prettier-ignore -->
| Existing artifact | Replaced by | Decision | Justification |
| --- | --- | --- | --- |
| The claim "markers are inert on `workflow_dispatch`" in the template comment, `.bkit/core/.bkit/workflows.md` and `docs/deployments.md` | The manual-run marker step and the matching docs wording | DELETE | The claim is wrong for the template's force markers and, after this change, for `[verbose ci]`. |

## Documentation Updates

<!-- prettier-ignore -->
| Doc | Change required |
| --- | --- |
| `.bkit/core/.bkit/workflows.md` | § Commit-message force tags and § CI / Vercel commit tags say markers act on a manual run through the head commit, and `NODE_OPTIONS` stays off there. |
| `docs/deployments.md` | § Commit-message force tags: the same rewrite at lines 105 and 178. |
| `docs/testing.md` | None. No new test file. |
| `docs/decisions.jsonl` | None. Rows already written. |

## Rollback Strategy

<!-- prettier-ignore -->
| Axis | Action | Notes |
| --- | --- | --- |
| **Code** | `git revert {COMMIT}` | Removes the step and restores the old wording. |

Code-only — `git revert` sufficient.

## Agent Execution Runbook

<!-- bkit:group 1 start -->

### TASK GROUP 1: Read `[verbose ci]` from the head commit on a manual run

<!-- bkit:task 1 start -->

- [x] **TASK 1:** Add a manual-run verbose marker step to the template's static and unit jobs and to bkit's own copy
  - **UPDATE:** `.bkit/templates/.github/workflows/bkit-ci.yml`: in the `bkit-tests-static` and `bkit-tests-unit` jobs, before "Configure Verbose CI", one step named "Read Verbose Marker (Manual Run)" gated `if: github.event_name == 'workflow_dispatch'` that reads `git log -1 --pretty=%B "$GITHUB_SHA"` and, when the message contains the fixed string `[verbose ci]`, appends `VERBOSE_CI=1`, `TURBO_LOG_LEVEL=full` and `DEBUG=vercel:*,supabase:*` to `$GITHUB_ENV`; it never writes `NODE_OPTIONS` and runs no commit text (both jobs already check out with `fetch-depth: 0`)
  - **UPDATE:** `.github/workflows/bkit-ci.yml`: in the `bkit-tests-static` and `bkit-tests-unit` jobs, the same two steps, byte for byte; the `bkit-tests-scope` "Read Markers" step and the integration lane stay unchanged
  - **UPDATE:** `.bkit/core/engine/audits/templates/template-ci-yml.test.ts`: a test that both jobs carry the step before "Configure Verbose CI"
  - **UPDATE:** `.bkit/core/engine/audits/templates/ci-scripts.test.ts`: tests that run the step's script against a fixture git repo with `GITHUB_SHA` and `GITHUB_ENV` pointing at temp files
  - **READ:** `.bkit/core/engine/audits/repo/dogfood-templates.test.ts`: the `ADOPTED` entry for `.github/workflows/bkit-ci.yml`; the static and unit jobs sit outside the recorded edits, so the copy must match the template there
  - **READ:** `docs/testing.md`: § CI verbosity (`[verbose ci]`), the `NODE_OPTIONS` rule the step must keep
  - **READ:** `docs/security.md`: § Untrusted Content & Prompt Injection, for the commit-message handling
  - **DONE WHEN:** `pnpm vitest run .bkit/core/engine/audits/templates/template-ci-yml.test.ts .bkit/core/engine/audits/templates/ci-scripts.test.ts .bkit/core/engine/audits/repo/dogfood-templates.test.ts` passes; the step compares the message to the fixed marker only and never expands it as code; `git log` failure fails the step
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/template-ci-yml.test.ts` `static and unit jobs each run a manual-run verbose marker step before Configure Verbose CI` fails on the step being missing, gated on another event, or placed after "Configure Verbose CI"
    - `.bkit/core/engine/audits/templates/template-ci-yml.test.ts` `passes actionlint` fails on the new step's YAML or shell being invalid
    - `.bkit/core/engine/audits/templates/ci-scripts.test.ts` `verbose marker step writes VERBOSE_CI, TURBO_LOG_LEVEL and DEBUG to GITHUB_ENV for a [verbose ci] head commit` fails on a missing or wrong value in the `GITHUB_ENV` file
    - `.bkit/core/engine/audits/templates/ci-scripts.test.ts` `verbose marker step writes nothing to GITHUB_ENV for a head commit without the marker` fails on any line written to the `GITHUB_ENV` file
    - `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` `.github/workflows/bkit-ci.yml` fails on bkit's copy differing from the template in the static or unit job

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [x] **TASK 2:** Reword the template comment that says markers are inert on a manual run
  - **UPDATE:** `.bkit/templates/.github/workflows/bkit-ci.yml`: the JOB 2f scaffold comment at line 926 says a dispatch input is how a human forces a fresh native build without a new commit, and drops "markers are inert on workflow_dispatch" (bkit's own copy does not carry this scaffold)
  - **UPDATE:** `.bkit/core/engine/audits/templates/templates-content.test.ts`: a test that no comment line in the template says a marker is inert on `workflow_dispatch`, next to the `[verbose ci] NODE_OPTIONS knob` tests
  - **DEPENDS ON:** 1
  - **DONE WHEN:** `pnpm vitest run .bkit/core/engine/audits/templates/templates-content.test.ts` passes
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/templates-content.test.ts` `no template comment says a marker is inert on workflow_dispatch` fails on the line 926 wording
    - `.bkit/core/engine/audits/templates/templates-content.test.ts` `never writes NODE_OPTIONS to $GITHUB_ENV` fails on the new marker step writing `NODE_OPTIONS` to `$GITHUB_ENV` — existing test, taken over because TASK 1 adds a `$GITHUB_ENV` writer it must still hold for

<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->

- [x] **TASK 3:** Say in the docs that markers act on a manual run
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: § Commit-message force tags, the `workflow_dispatch` bullet (line 1254) says the template reads the head commit on a manual run, so every marker acts there and keeps acting on every manual run until a new commit lands, and that `NODE_OPTIONS` stays off on a manual run because `$GITHUB_ENV` cannot set it
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: § Commit-message force tags, the "Both surfaces are checked by `contains()` in the env block" bullet (line 1252) names the manual-run marker step for `[verbose ci]`
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: § CI / Vercel commit tags, the line 1499 precedence sentence, agrees with the new bullets
  - **UPDATE:** `docs/deployments.md`: § Commit-message force tags, the identical `workflow_dispatch` bullet at line 105 gets the same rewrite, and the sentence "Markers are inert on a dispatch, so steer it with inputs" at line 178 is corrected to match
  - **DEPENDS ON:** 1
  - **DONE WHEN:** no line in `.bkit/core/.bkit/workflows.md` or `docs/deployments.md` says a marker is inert on `workflow_dispatch`, and `pnpm build` then `pnpm tsx .bkit/core/engine/cli.ts upgrade` have re-rendered `.bkit/workflows.md` (never edited by hand)
  - **TEST FIRST:** n/a — docs only

<!-- bkit:task 3 end -->

<!-- bkit:group 1 end -->

<!-- bkit:group 2 start -->

### TASK GROUP 2: Challenge round 1 findings

<!-- bkit:task 4 start -->

- [x] **TASK 4:** A manual `[verbose ci]` run sets `TURBO_LOG_LEVEL=debug`, a value the push path never sets, so a consumer that passes the knob to turbo `--output-logs` gets a red lane only on manual runs
      **Severity:** MEDIUM · **Class:** architectural · **Fixable:** false · **Location:** `.bkit/templates/.github/workflows/bkit-ci.yml:87` · **Round:** 1
  - **DONE WHEN:** The "Read Verbose Marker (Manual Run)" step writes `TURBO_LOG_LEVEL=full`, the value the job-level `env:` sets on a marked push, in the static and unit jobs of both `.bkit/templates/.github/workflows/bkit-ci.yml` and `.github/workflows/bkit-ci.yml`, and the two copies of the step stay byte-identical. That literal is the only change to either CI file. The sentence in `.bkit/templates/docs/deployments.md` that says markers are inert on a dispatch reads "Markers act on a dispatch through the head commit, and inputs steer it without a new commit (`.bkit/workflows.md` § Commit-message force tags).", and nothing else in that file changes. Every doc line that states the manual-run value says `full`: `.bkit/core/.bkit/workflows.md`, `docs/deployments.md`, `docs/testing.md` and `.bkit/templates/docs/testing.md`. The marker-step fixture in `ci-scripts.test.ts` makes its commits with `-c commit.gpgsign=false` and fails the test on any git call that exits non-zero. The LOW deferral row `1032-verbose-ci-head-challenge-low-bkit-core-engine-audits-templates-ci-scripts-test-ts-372` is closed with `bkit ledgers append`. `pnpm vitest run .bkit/core/engine/audits/templates/ci-scripts.test.ts .bkit/core/engine/audits/templates/templates-content.test.ts .bkit/core/engine/audits/templates/template-ci-yml.test.ts .bkit/core/engine/audits/repo/dogfood-templates.test.ts` passes.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/ci-scripts.test.ts` `verbose marker step writes VERBOSE_CI, TURBO_LOG_LEVEL and DEBUG to GITHUB_ENV for a [verbose ci] head commit` fails on the step writing `TURBO_LOG_LEVEL=debug` where the assertion expects `TURBO_LOG_LEVEL=full`
    - `.bkit/core/engine/audits/templates/ci-scripts.test.ts` `verbose marker step writes the TURBO_LOG_LEVEL value the job-level env sets on a marked push` fails on the step writing `TURBO_LOG_LEVEL=debug` while the job-level `env:` expression of the same job yields `full` under the marker (the test reads the `&& '...' ||` on-value from the parsed job `env:` and compares it to the line in the `GITHUB_ENV` file)
    - `.bkit/core/engine/audits/templates/ci-scripts.test.ts` `verbose marker step fixture commits under a global git config that signs commits` fails on the fixture inheriting a global git config with `commit.gpgsign=true` and a failing signing program, so its empty commit fails unnoticed and the step exits 128 (the test points `HOME` / `GIT_CONFIG_GLOBAL` at a temp config that turns signing on)
    - `.bkit/core/engine/audits/templates/templates-content.test.ts` `no template doc says markers are inert on a dispatch` fails on `.bkit/templates/docs/deployments.md` holding the sentence "Markers are inert on a dispatch"

<!-- bkit:task 4 end -->
<!-- bkit:group 2 end -->

### 🔒 Gate 2: Code Implementation Check

- [ ] **No bolt-on:** every `[NEW]` file traces to a `Reuse Inventory` `NEW` row (this plan creates none).
- [ ] **Extensions landed:** every `EXTEND` landed in the artifact its row names.
- [ ] **No gate weakened:** no gate was weakened.
- [ ] **Red before code:** the tests step recorded every planned test of the group red, or as an `updated` existing test, before its code step ran. A later task that names an earlier task's test takes it over: the build reports the takeover and does not refuse it.
- [ ] **Tests unchanged:** every planned test case matches the lines its red row recorded, or a code step's `BLOCKED` line names the change for the owner.
- [ ] **Unproven tests:** each planned test with no proven red is cleared only by a human-committed `TEST EXCEPTION` field.
- [ ] **Gate 2 — Verified:** every box above is checked.

**Mandatory Tasks (Testing & Documentation):**

- [ ] **Verify test coverage against Derived Test Matrix:** each row's test is in one task's `DONE WHEN`.
- [ ] **Sweep existing tests:** broken tests are fixed, and the full suite passes.
- [ ] **Sweep new tests:** every test a task's `DONE WHEN` names exists and passes.
- [ ] **Verify observability:** None — no logging change.
- [ ] **Update documentation:** the affected docs are rewritten to match.

### 🔒 Gate 3: Testing & Documentation Check

- [ ] **Docs updated:** every `Documentation Updates` row is done.
- [ ] **Docs index accurate:** `.agents/docs.md` is accurate.
- [ ] **Gate 3 — Verified:** every box above is checked.

## Verification Plan

### Automated Tests

- [ ] **Full Local Gate Suite:** the deepest declared `bkit:gate:*` script and `bkit check` pass.
- [ ] **Test Synchronization:** `.bkit/core/engine/audits/templates/template-ci-yml.test.ts`, `ci-scripts.test.ts`, `templates-content.test.ts` and `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` pass together.
- [ ] **Build Configuration:** no new test-only files.
- [ ] **Run all tests:** `pnpm test` passes.

### 🔒 Gate 4: Automated Verification Check

- [ ] **Gate 4 — Verified:** every Automated Tests box is checked, with proof (test output, a CLI result or an API response).

### Manual Verification

> [!CAUTION]
> **Owner-run acceptance checks, advisory only.** An unticked box blocks nothing: not the merge, and not plan approval. This is not a Gate 1 human-confirmation section.

- [ ] **Step 1:** after the change lands, start a manual CI run on a commit whose message holds `[verbose ci]` and check that the static and unit logs show `VERBOSE_CI=1`, `TURBO_LOG_LEVEL=full` and `DEBUG=vercel:*,supabase:*`. This also proves the `$GITHUB_ENV` precedence assumption.
