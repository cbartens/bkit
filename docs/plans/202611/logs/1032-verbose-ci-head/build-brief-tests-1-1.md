# Brief: group 1 — Read `[verbose ci]` from the head commit on a manual run (tests)

Plan: Verbose CI Marker Reads the Head Commit on a Manual Run Implementation Plan

## Why and what

### Context & Goals

A commit-message marker such as `[verbose ci]` is meant to steer a manual CI run (`workflow_dispatch`) as well as push and pull_request runs. The template's force markers already do. `[verbose ci]` does not, because the job-level `env:` of `bkit-tests-static` and `bkit-tests-unit` only reads `github.event.head_commit.message` and `github.event.pull_request.title`, and a manual run fills neither. This plan adds a manual-run step that reads the head commit and turns verbose output on, keeps bkit's own `.github/workflows/bkit-ci.yml` identical to the template, and removes the "markers are inert on `workflow_dispatch`" claim from the template comment and the docs. Decision rows: `1012-ci-markers-act-on-manual-dispatch` and `1032-owner-confirmed-the-ci-file-edit-for-the-verbose-marker`.

**Related Issues:**

- #1032 — Verbose CI head commit marker on a manual run (this issue)
- #1012 — Project Goals audit: where bkit falls short, and what to change

---

### Narrative

A person starts a manual CI run on a commit whose message contains `[verbose ci]`. The static and unit lanes run with verbose output, the same as a push with that marker. The template comment and the docs say markers act on a manual run.

### Success Criteria

- On a `workflow_dispatch` run whose head commit message contains `[verbose ci]`, the static and unit jobs of the template run their steps after the marker step with `VERBOSE_CI=1`, `TURBO_LOG_LEVEL=debug` and `DEBUG=vercel:*,supabase:*`.
- On a `workflow_dispatch` run whose head commit has no `[verbose ci]`, none of those values is set.
- Push and pull_request runs behave exactly as today.
- No comment in either CI file and no line of `.bkit/core/.bkit/workflows.md` § Commit-message force tags says a marker is inert on `workflow_dispatch`.
- `.github/workflows/bkit-ci.yml` matches the template outside its recorded edits.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| Making `[force cache]`, `[force build]` and `[force full]` act on a manual run in bkit's own copy ("Read Markers" in `bkit-tests-scope`) | Adds to the goal; the issue is `[verbose ci]` only | Follow-up if wanted |
| The integration lane of bkit's own copy | Not part of the owner's list | Follow-up if wanted |
| A planner or marker job in the template to carry `NODE_OPTIONS` | Adds a job; excluded by the owner's scope | Follow-up if wanted |
| Correcting the knowledge row `consumer-ci-dispatch-default-burns-build-quota` | Corrected through the knowledge ledger | Knowledge ledger |
| The fixture `tests/fixtures/shipped-text/v6.1.1/docs/deployments.md` | A frozen shipped-text fixture | Left as is |

## Where it fits

- Group 1: Read `[verbose ci]` from the head commit on a manual run — this group
  - TASK 1: Add a manual-run verbose marker step to the template's static and unit jobs and to bkit's own copy — open
  - TASK 2: Reword the template comment that says markers are inert on a manual run — open
  - TASK 3: Say in the docs that markers act on a manual run — done

## The work

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** Add a manual-run verbose marker step to the template's static and unit jobs and to bkit's own copy
  - **UPDATE:** `.bkit/templates/.github/workflows/bkit-ci.yml`: in the `bkit-tests-static` and `bkit-tests-unit` jobs, before "Configure Verbose CI", one step named "Read Verbose Marker (Manual Run)" gated `if: github.event_name == 'workflow_dispatch'` that reads `git log -1 --pretty=%B "$GITHUB_SHA"` and, when the message contains the fixed string `[verbose ci]`, appends `VERBOSE_CI=1`, `TURBO_LOG_LEVEL=debug` and `DEBUG=vercel:*,supabase:*` to `$GITHUB_ENV`; it never writes `NODE_OPTIONS` and runs no commit text (both jobs already check out with `fetch-depth: 0`)
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

- [ ] **TASK 2:** Reword the template comment that says markers are inert on a manual run
  - **UPDATE:** `.bkit/templates/.github/workflows/bkit-ci.yml`: the JOB 2f scaffold comment at line 926 says a dispatch input is how a human forces a fresh native build without a new commit, and drops "markers are inert on workflow_dispatch" (bkit's own copy does not carry this scaffold)
  - **UPDATE:** `.bkit/core/engine/audits/templates/templates-content.test.ts`: a test that no comment line in the template says a marker is inert on `workflow_dispatch`, next to the `[verbose ci] NODE_OPTIONS knob` tests
  - **DEPENDS ON:** 1
  - **DONE WHEN:** `pnpm vitest run .bkit/core/engine/audits/templates/templates-content.test.ts` passes
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/templates-content.test.ts` `no template comment says a marker is inert on workflow_dispatch` fails on the line 926 wording
    - `.bkit/core/engine/audits/templates/templates-content.test.ts` `never writes NODE_OPTIONS to $GITHUB_ENV` fails on the new marker step writing `NODE_OPTIONS` to `$GITHUB_ENV` — existing test, taken over because TASK 1 adds a `$GITHUB_ENV` writer it must still hold for

<!-- bkit:task 2 end -->

### Derived Test Matrix rows

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

### Planned tests that already exist

- TASK 1 `.bkit/core/engine/audits/templates/template-ci-yml.test.ts` `passes actionlint` — exists at `.bkit/core/engine/audits/templates/template-ci-yml.test.ts:80`; update that test in place: add expectations, never remove or loosen one
- TASK 1 `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` `.github/workflows/bkit-ci.yml` — exists at `.bkit/core/engine/audits/repo/dogfood-templates.test.ts:73`; update that test in place: add expectations, never remove or loosen one
- TASK 2 `.bkit/core/engine/audits/templates/templates-content.test.ts` `never writes NODE_OPTIONS to $GITHUB_ENV` — exists at `.bkit/core/engine/audits/templates/templates-content.test.ts:107`; update that test in place: add expectations, never remove or loosen one
