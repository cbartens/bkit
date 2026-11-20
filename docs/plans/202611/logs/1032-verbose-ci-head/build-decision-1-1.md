Question: CHALLENGE
From: challenge
Pause step: 11
Plan: docs/plans/202611/1032-verbose-ci-head-plan.md

**Q1 — Task 4 (`.bkit/templates/.github/workflows/bkit-ci.yml:87`):** A manual run with the verbose marker sets turbo's log setting to `debug`, but a push with the same marker sets it to `full`, and the docs describe `full`. Turbo's own `--output-logs` option accepts `full` but not `debug`, so a consumer who passes the setting through to turbo gets a red lane on manual runs only. The issue and the plan's Success Criteria ask for `debug`, while the plan's Narrative says a manual run behaves like a marked push. Which should win? The places affected are `TURBO_LOG_LEVEL` in the new step of both CI files (template lines 87 and 357, bkit copy lines 377 and 620) and the test in `.bkit/core/engine/audits/templates/ci-scripts.test.ts` that asserts `TURBO_LOG_LEVEL=debug`.
A) Accept — the item is recorded as accepted and the build moves on: a manual run keeps `debug`, unlike a push, and the mismatch is left as it is
B) Fix now — one more fix round runs before the build moves on: it does what your direction says, for example writing `full` on a manual run so it matches a push, with the plan text and the test assertion changed to match
C) Stop — the run stops and hands over; the next run resumes here
Recommended: none — the issue's acceptance criteria name `debug` while the plan's Narrative promises the same behaviour as a marked push, and only the owner can say which one is meant
Default if unanswered: the run waits for you; the run stops when nobody can be asked

Owner (2026-11-20):
> Answer given by the v6.3 orchestrator session under the away rule, as its assumption, not the owner's own words.
> Q1: B, Fix now. A manual run with the verbose marker writes `full`, the same as a marked push.
> 1. In the new "Read Verbose Marker (Manual Run)" step of both CI files write `TURBO_LOG_LEVEL=full` where it writes `TURBO_LOG_LEVEL=debug`. Nothing else in either CI file changes.
> 2. Change the plan text (Success Criteria, Edge Cases, TASK 1 wherever they say `debug`) and the assertion in `.bkit/core/engine/audits/templates/ci-scripts.test.ts` to `full`. See the changed assertion red against the current step before the CI files change.
> 3. Docs: every place that states the value on a manual run says `full`; check none of the new sentences says `debug`.
> 4. `.bkit/templates/docs/deployments.md:213`, this sentence only: give it the wording `docs/deployments.md:178` has ("Markers act on a dispatch through the head commit, and inputs steer it without a new commit (§ Commit-message force tags)."), keeping the template's own link form. Touch nothing else in that file.
> 5. Include the LOW fix in the same round and close its deferral row: `-c commit.gpgsign=false` plus a status check on the git calls in the test's fixture.
> Why `full`: decision row `1012-ci-markers-act-on-manual-dispatch` says markers take effect on a manual run as they do on a push; the job-level expression in both CI files gives `'full' || 'errors-only'`; every doc says `full`; turbo's `--output-logs` accepts `full` and not `debug`.
