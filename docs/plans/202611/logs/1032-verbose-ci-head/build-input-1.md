## Session Prompt — this run's, newer than everything below

#1032 publish=false

## Issue description — oldest

### Narrative

A commit-message marker such as `[verbose ci]` steers a CI run. Every marker, `[verbose ci]` included, is meant to act on a manual run (`workflow_dispatch`) as well as on push and pull_request.

In the consumer template `.bkit/templates/.github/workflows/bkit-ci.yml`, the force markers already do. The "Detect Direct Push" step (lines 86-109 and 335-358) reads the PR title on `pull_request` and the head commit with `git log -1 --pretty=%B "$GITHUB_SHA"` on every other event, so `[force cache]`, `[force build]` and `[force full]` work on a manual run.

`[verbose ci]` does not. It is read in the job-level `env:` blocks of `bkit-tests-static` (lines 54-57) and `bkit-tests-unit` (lines 311-314) with `contains(github.event.head_commit.message, '[verbose ci]') || contains(github.event.pull_request.title, '[verbose ci]')`. A manual run's payload carries neither field, so `VERBOSE_CI`, `TURBO_LOG_LEVEL`, `NODE_OPTIONS` and the `DEBUG` value written by "Configure Verbose CI" all stay off.

The comment at template line 926 says the opposite of the decision: "a marker cannot, because markers are inert on workflow_dispatch". `.bkit/core/.bkit/workflows.md:1252` says the same for every marker, which is already wrong for the template's force markers.

Once done, a manual run whose head commit carries `[verbose ci]` runs the static and unit lanes with verbose output, the template comment and the workflows doc say markers act on a manual run, and bkit's own adopted copy `.github/workflows/bkit-ci.yml` stays identical to the template.

A job-level `env:` cannot run git, so the head commit has to be read by a step. A step can turn `VERBOSE_CI`, `TURBO_LOG_LEVEL` and `DEBUG` on for later steps by writing them to `$GITHUB_ENV`. GitHub refuses `NODE_OPTIONS` from `$GITHUB_ENV`, so `--trace-warnings` stays off on a manual run.

### Success Criteria

- On a `workflow_dispatch` run whose head commit message contains `[verbose ci]`, the static and unit jobs of the template run their steps after the marker step with `VERBOSE_CI=1`, `TURBO_LOG_LEVEL=debug` and `DEBUG=vercel:*,supabase:*`.
- On a `workflow_dispatch` run whose head commit has no `[verbose ci]`, none of those values is set.
- Push and pull_request runs behave exactly as today.
- No comment in either CI file and no line of `.bkit/core/.bkit/workflows.md` § Commit-message force tags says a marker is inert on `workflow_dispatch`.
- `.github/workflows/bkit-ci.yml` matches the template outside its recorded edits.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| Manual run, head commit contains `[verbose ci]` | The marker step writes `VERBOSE_CI=1`, `TURBO_LOG_LEVEL=debug` and `DEBUG=vercel:*,supabase:*` to `$GITHUB_ENV`. |
| Manual run, head commit has no marker | The marker step writes nothing; the job-level values stay as the `env:` expression set them (off). |
| Manual run with `[verbose ci]` in the head commit, then more manual runs without a new commit | Every manual run stays verbose until a new commit lands. This is the accepted cost in the decision row. |
| Push run with `[verbose ci]` | The job-level `env:` already turns verbose on; the marker step does not run. |
| Pull request run whose title has `[verbose ci]` | Unchanged: the job-level `env:` reads the PR title. |
| Manual run with `[verbose ci]`: `NODE_OPTIONS` | Stays unset. `$GITHUB_ENV` cannot set it, and the step does not try. |
| `git log` cannot read `$GITHUB_SHA` | The step fails loudly rather than silently leaving verbose off. |

### Derived Test Matrix

<!-- prettier-ignore -->
| Test description | Type | Target file |
| --- | --- | --- |
| static and unit jobs each run a manual-run verbose marker step before Configure Verbose CI | Unit | `.bkit/core/engine/audits/templates/template-ci-yml.test.ts` |
| passes actionlint | Unit | `.bkit/core/engine/audits/templates/template-ci-yml.test.ts` |
| verbose marker step writes VERBOSE_CI, TURBO_LOG_LEVEL and DEBUG to GITHUB_ENV for a [verbose ci] head commit | Unit | `.bkit/core/engine/audits/templates/ci-scripts.test.ts` |
| verbose marker step writes nothing to GITHUB_ENV for a head commit without the marker | Unit | `.bkit/core/engine/audits/templates/ci-scripts.test.ts` |
| .github/workflows/bkit-ci.yml | Unit | `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` |
| no template comment says a marker is inert on workflow_dispatch | Unit | `.bkit/core/engine/audits/templates/templates-content.test.ts` |
| never writes NODE_OPTIONS to $GITHUB_ENV | Unit | `.bkit/core/engine/audits/templates/templates-content.test.ts` |

### Tasks

<!-- bkit:group 1 start -->
### TASK GROUP 1: Read `[verbose ci]` from the head commit on a manual run

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** Add a manual-run verbose marker step to the template's static and unit jobs and to bkit's own copy
  - **UPDATE:** `bkit-tests-static` and `bkit-tests-unit` in `.bkit/templates/.github/workflows/bkit-ci.yml`: before "Configure Verbose CI", one step gated `if: github.event_name == 'workflow_dispatch'` that reads `git log -1 --pretty=%B "$GITHUB_SHA"` and, when the message contains `[verbose ci]`, appends `VERBOSE_CI=1`, `TURBO_LOG_LEVEL=debug` and `DEBUG=vercel:*,supabase:*` to `$GITHUB_ENV`; it never writes `NODE_OPTIONS` (both jobs already check out with `fetch-depth: 0`)
  - **UPDATE:** `bkit-tests-static` and `bkit-tests-unit` in `.github/workflows/bkit-ci.yml`: the same two steps, byte for byte; the `bkit-tests-scope` "Read Markers" step and the integration lane stay unchanged
  - **UPDATE:** `.bkit/core/engine/audits/templates/template-ci-yml.test.ts`: a test that both jobs carry the step before "Configure Verbose CI"
  - **UPDATE:** `.bkit/core/engine/audits/templates/ci-scripts.test.ts`: tests that run the step's script against a fixture git repo with `GITHUB_SHA` and `GITHUB_ENV` pointing at temp files
  - **READ:** `ADOPTED[".github/workflows/bkit-ci.yml"]` in `.bkit/core/engine/audits/repo/dogfood-templates.test.ts`: the static and unit jobs sit outside the recorded edits, so the copy must match the template there
  - **DONE WHEN:** `pnpm vitest run .bkit/core/engine/audits/templates/template-ci-yml.test.ts .bkit/core/engine/audits/templates/ci-scripts.test.ts .bkit/core/engine/audits/repo/dogfood-templates.test.ts` passes
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

<!-- bkit:task 3 start -->
- [ ] **TASK 3:** Say in the docs that markers act on a manual run
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: § Commit-message force tags, the `workflow_dispatch` bullet at line 1252 says the template reads the head commit on a manual run, so every marker acts there and keeps acting on every manual run until a new commit lands, and that `NODE_OPTIONS` stays off on a manual run because `$GITHUB_ENV` cannot set it
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: § Commit-message force tags, the line 1250 bullet ("Both surfaces are checked by `contains()` in the env block") names the manual-run marker step for `[verbose ci]`
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: § CI / Vercel commit tags, line 1497, agrees with the new bullets
  - **UPDATE:** `docs/deployments.md`: § Commit-message force tags, the identical `workflow_dispatch` bullet at line 111 gets the same rewrite
  - **DEPENDS ON:** 1
  - **DONE WHEN:** no line in `.bkit/core/.bkit/workflows.md` or `docs/deployments.md` says a marker is inert on `workflow_dispatch`, and `pnpm build` then `pnpm tsx .bkit/core/engine/cli.ts upgrade` have re-rendered `.bkit/workflows.md` (never edited by hand)
  - **TEST FIRST:** n/a — docs only
<!-- bkit:task 3 end -->
<!-- bkit:group 1 end -->

### Open Questions & Assumptions

Decisions already made: markers, `[verbose ci]` included, act on `workflow_dispatch`; inputs alone steering a manual run is rejected (`docs/decisions.jsonl` key `1012-ci-markers-act-on-manual-dispatch`). This is settled. The owner's scope: reword the template comment, make `[verbose ci]` read the head commit on a manual run, keep bkit's own copy identical, and fix `.bkit/core/.bkit/workflows.md:1252`; nothing else in either CI file changes.

- Assumption: a value written to `$GITHUB_ENV` replaces a job-level `env:` value of the same name for the steps after it. GitHub's workflow-commands page says `GITHUB_ENV` values reach "all subsequent steps in a job" but does not state the precedence. The first manual run after this lands is the proof.
- Assumption: `NODE_OPTIONS` (`--trace-warnings`) stays off on a manual run. GitHub refuses `NODE_OPTIONS` from `$GITHUB_ENV`, and setting it any other way needs a new job, which the owner's scope excludes.
- `.bkit/core/.bkit/workflows.md:1252` describes only bkit's own `.github/workflows/bkit-ci.yml`, whose "Read Markers" step (lines 49-82) sets `MSG=""` on a manual run. The template has no active planner; its "Detect Direct Push" step already reads the head commit there.
- In bkit's own copy, "Read Markers" keeps ignoring the force markers on a manual run, so they do not act there. "Decide Run Level" already runs everything on a manual run, so they would change nothing.
- Assumption: `docs/deployments.md:111` carries the same wrong sentence and is fixed here, although the owner's list names only the template comment and `.bkit/core/.bkit/workflows.md`.
- The knowledge row `consumer-ci-dispatch-default-burns-build-quota` says markers are inert on `workflow_dispatch`. It is corrected through the knowledge ledger, not here.
- Consumers get the change only when they re-copy the template; it is copy-and-own, so no migration applies.

Removes: the claim that markers are inert on `workflow_dispatch`, from the template comment, `.bkit/core/.bkit/workflows.md` and `docs/deployments.md`.

### Breaking Changes & Naming

None. Push and pull_request runs are unchanged. A manual run whose head commit already carries `[verbose ci]` becomes verbose, which is the decided behaviour. The new step reads like the existing step names, for example "Read Verbose Marker (Manual Run)".

### Out of Scope

- Making `[force cache]`, `[force build]` and `[force full]` act on a manual run in bkit's own copy ("Read Markers" in `bkit-tests-scope`).
- The integration lane of bkit's own copy (lines 668-670).
- Adding a planner or marker job to the template to carry `NODE_OPTIONS`.
- Correcting the knowledge row `consumer-ci-dispatch-default-burns-build-quota`.
- The fixture `tests/fixtures/shipped-text/v6.1.1/docs/deployments.md`.

### References

- `docs/decisions.jsonl` key `1012-ci-markers-act-on-manual-dispatch`
- `.bkit/core/.bkit/workflows.md` § Commit-message force tags
- `.bkit/core/.bkit/workflows.md` § CI / Vercel commit tags
- `docs/deployments.md` § Commit-message force tags
- `docs/testing.md` § CI verbosity (`[verbose ci]`)
- #1012 — Project Goals audit: where bkit falls short, and what to change
- GitHub Docs, workflow commands: https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-commands
- GitHub Docs, contexts: https://docs.github.com/en/actions/reference/workflows-and-actions/contexts

## Issue comment — posted 2026-11-19T22:39:25.000Z

**Owner confirmation for the CI file edit, 2026-11-20 (v6.3 run).**

- **The question:** may the build of this issue edit bkit's CI file `.github/workflows/bkit-ci.yml` and the template `.bkit/templates/.github/workflows/bkit-ci.yml`? The rule "CI edits" in `.agents/rules.md` requires the owner's confirmation before any change under `.github/workflows/`.
- **The answer, in the owner's words:** "Yes, edit the CI file".
- **What it covers:** the edit this issue describes and nothing else. One step in the static and unit jobs of both files that, on a manual run, reads the head commit's message and turns verbose output on when it holds the `[verbose ci]` marker, plus the reworded comment. Push and pull-request runs keep their behaviour.
- **Condition set by the orchestrator:** the step tests for the fixed marker only and runs no text from the commit message. An outside review checks that before the change lands.
- **Recorded as:** decision row `1032-owner-confirmed-the-ci-file-edit-for-the-verbose-marker` in `docs/decisions.jsonl`, on local `dev`, not pushed yet. The behaviour itself is decision row `1012-ci-markers-act-on-manual-dispatch`.
