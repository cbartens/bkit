# Brief: group 2 — Challenge round 1 findings (tests)

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

- On a `workflow_dispatch` run whose head commit message contains `[verbose ci]`, the static and unit jobs of the template run their steps after the marker step with `VERBOSE_CI=1`, `TURBO_LOG_LEVEL=full` and `DEBUG=vercel:*,supabase:*`.
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

- Group 1: Read `[verbose ci]` from the head commit on a manual run — done
  - TASK 1: Add a manual-run verbose marker step to the template's static and unit jobs and to bkit's own copy — done
  - TASK 2: Reword the template comment that says markers are inert on a manual run — done
  - TASK 3: Say in the docs that markers act on a manual run — done
- Group 2: Challenge round 1 findings — this group
  - TASK 4: A manual `[verbose ci]` run sets `TURBO_LOG_LEVEL=debug`, a value the push path never sets, so a consumer that passes the knob to turbo `--output-logs` gets a red lane only on manual runs — open

## The work

<!-- bkit:task 4 start -->

- [ ] **TASK 4:** A manual `[verbose ci]` run sets `TURBO_LOG_LEVEL=debug`, a value the push path never sets, so a consumer that passes the knob to turbo `--output-logs` gets a red lane only on manual runs
      **Severity:** MEDIUM · **Class:** architectural · **Fixable:** false · **Location:** `.bkit/templates/.github/workflows/bkit-ci.yml:87` · **Round:** 1
  - **DONE WHEN:** The "Read Verbose Marker (Manual Run)" step writes `TURBO_LOG_LEVEL=full`, the value the job-level `env:` sets on a marked push, in the static and unit jobs of both `.bkit/templates/.github/workflows/bkit-ci.yml` and `.github/workflows/bkit-ci.yml`, and the two copies of the step stay byte-identical. That literal is the only change to either CI file. The sentence in `.bkit/templates/docs/deployments.md` that says markers are inert on a dispatch reads "Markers act on a dispatch through the head commit, and inputs steer it without a new commit (`.bkit/workflows.md` § Commit-message force tags).", and nothing else in that file changes. Every doc line that states the manual-run value says `full`: `.bkit/core/.bkit/workflows.md`, `docs/deployments.md`, `docs/testing.md` and `.bkit/templates/docs/testing.md`. The marker-step fixture in `ci-scripts.test.ts` makes its commits with `-c commit.gpgsign=false` and fails the test on any git call that exits non-zero. The LOW deferral row `1032-verbose-ci-head-challenge-low-bkit-core-engine-audits-templates-ci-scripts-test-ts-372` is closed with `bkit ledgers append`. `pnpm vitest run .bkit/core/engine/audits/templates/ci-scripts.test.ts .bkit/core/engine/audits/templates/templates-content.test.ts .bkit/core/engine/audits/templates/template-ci-yml.test.ts .bkit/core/engine/audits/repo/dogfood-templates.test.ts` passes.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/ci-scripts.test.ts` `verbose marker step writes VERBOSE_CI, TURBO_LOG_LEVEL and DEBUG to GITHUB_ENV for a [verbose ci] head commit` fails on the step writing `TURBO_LOG_LEVEL=debug` where the assertion expects `TURBO_LOG_LEVEL=full`
    - `.bkit/core/engine/audits/templates/ci-scripts.test.ts` `verbose marker step writes the TURBO_LOG_LEVEL value the job-level env sets on a marked push` fails on the step writing `TURBO_LOG_LEVEL=debug` while the job-level `env:` expression of the same job yields `full` under the marker (the test reads the `&& '...' ||` on-value from the parsed job `env:` and compares it to the line in the `GITHUB_ENV` file)
    - `.bkit/core/engine/audits/templates/ci-scripts.test.ts` `verbose marker step fixture commits under a global git config that signs commits` fails on the fixture inheriting a global git config with `commit.gpgsign=true` and a failing signing program, so its empty commit fails unnoticed and the step exits 128 (the test points `HOME` / `GIT_CONFIG_GLOBAL` at a temp config that turns signing on)
    - `.bkit/core/engine/audits/templates/templates-content.test.ts` `no template doc says markers are inert on a dispatch` fails on `.bkit/templates/docs/deployments.md` holding the sentence "Markers are inert on a dispatch"

<!-- bkit:task 4 end -->

### Derived Test Matrix rows

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| verbose marker step writes VERBOSE_CI, TURBO_LOG_LEVEL and DEBUG to GITHUB_ENV for a [verbose ci] head commit | Unit | `.bkit/core/engine/audits/templates/ci-scripts.test.ts` | 1 |
| verbose marker step writes nothing to GITHUB_ENV for a head commit without the marker | Unit | `.bkit/core/engine/audits/templates/ci-scripts.test.ts` | 1 |
| no template comment says a marker is inert on workflow_dispatch | Unit | `.bkit/core/engine/audits/templates/templates-content.test.ts` | 2 |
| never writes NODE_OPTIONS to $GITHUB_ENV | Unit | `.bkit/core/engine/audits/templates/templates-content.test.ts` | 2 |
| verbose marker step writes the TURBO_LOG_LEVEL value the job-level env sets on a marked push | Unit | `.bkit/core/engine/audits/templates/ci-scripts.test.ts` | 4 |
| verbose marker step fixture commits under a global git config that signs commits | Unit | `.bkit/core/engine/audits/templates/ci-scripts.test.ts` | 4 |
| no template doc says markers are inert on a dispatch | Unit | `.bkit/core/engine/audits/templates/templates-content.test.ts` | 4 |

### Planned tests taken over from earlier tasks

- TASK 4 `.bkit/core/engine/audits/templates/ci-scripts.test.ts` `verbose marker step writes VERBOSE_CI, TURBO_LOG_LEVEL and DEBUG to GITHUB_ENV for a [verbose ci] head commit` — taken over from TASK 1; rewrite that test case so it fails until this task's code exists
