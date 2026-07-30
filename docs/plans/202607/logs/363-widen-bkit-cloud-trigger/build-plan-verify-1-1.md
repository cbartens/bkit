Verdict: FAIL
Failures: 4

<!-- verdict:end -->

# Plan Verification

## Scope

`Single` — sub-plan 1 of 1 (`docs/plans/202607/363-widen-bkit-cloud-trigger-plan.md`), attempt 1.

## Sub-Plans Verified

None (Single scope — one plan file, 14 tasks / T1-T17 matrix).

## Integration Gaps

None (Single scope).

## Previously Attempted

None — first verification attempt. One prior execute log (`build-plan-execute-1-log.md`, verdict PASS, 14 DONE lines incl. one self-declared partial on Task 14).

## Notes

11 of 14 tasks land as specified and were verified against the codebase, not the log.

**Verified working (behavioural, not presence-only).** The ctx step was extracted from the installed `.github/workflows/bkit-cloud.yml` via PyYAML and executed under a stubbed `gh`/`git` harness. All ctx-step behaviours in the plan's matrix pass: T1 (`branches: ['feat/**','fix/**','dev']`), T2 (`cancel-in-progress: ${{ github.event.workflow_run.head_branch != 'dev' }}`), T3/T4 (dev+failure -> `phase=debug arg=363-widen-bkit-cloud-trigger`; dev+success -> `skip=true`), T5 (3 distinct headSha rows -> `skip=true` + operator notice; 3 same-headSha rows -> proceeds), T13 (`BRANCH=fix/363-…` -> `FID=363`), T15 (fix+failure capped; fix+success -> `phase=ship` uncapped; feat+failure -> `phase=debug` uncapped), T16 (`feat(bar-123-auth)` -> `arg=bar-123-auth`), T17 (push fails + row absent -> fail-closed `skip=true`, no `phase=`/`arg=` emitted). Stale-run guard, kill switch and malformed-scope fail-safe all exit `skip=true` with the specified notices. T8 (`bkit-debug.md` zero-diff) and T9 (`AUTO_ROUTE_SUFFIX` bash unit) pass. T11 (`pnpm bkit check` clean, `git status` clean) and T12 (`4.11.0` in `package.json` + `.bkit/version`) pass. The two jobs' `shared-deriv` blocks are byte-identical once comments are stripped.

**Four blocking gaps** — two unimplemented tasks and two red repo gates. Root cause of the doc gaps is the same class the builder self-caught on `bkit-counter-bus-config.sh` in Task 9: edits made inside a `bkit:managed` block of an installed file are reverted by `pnpm bkit upgrade`, and the canonical template was never touched.

**Non-blocking observation (no action required).** The plan's Task 4 / Task 9 Done-when asserts `grep -c 'AUTO_ROUTE_SUFFIX' .bkit/workflows/bkit-ship.md` = 2; the actual count is 4. The plan's own verbatim code snippet for that task already contains 3 occurrences, so `= 2` is a plan-text arithmetic error, not an implementation defect. Lines 746 and 804 are left unticked to preserve the discrepancy for the record; the functional criteria in both bullets pass.

## Identified Gaps Log

4 gaps.

GAP-1 (BLOCKING, Task 6) — `docs/deployments.md` contains ZERO #363 content. The execute log claims a "## Post-merge dev CI auto-routing (#363)" section with routing table, auto-route contract note and docs-only-diff precondition. `git diff origin/dev..HEAD -- docs/deployments.md` is a single line: the `bkit:managed v4.10.0 -> v4.11.0` marker bump. `grep -n '363' docs/deployments.md` returns only three pre-existing `bkit [auto route]` rows from the commit-tag taxonomy. Root cause: `docs/deployments.md` is a Tier-2 markered file whose managed block spans lines 1-461 (`<!-- bkit:start -->` L1 / `<!-- bkit:end -->` L461) — the CI/CD matrix sits inside it, so Task 8's `pnpm bkit upgrade` re-rendered the block from `.bkit/templates/docs/deployments.md` and discarded the edit. `git diff --stat origin/dev..HEAD -- .bkit/templates/docs/` is empty: the canonical template was never edited. Same defect class the builder self-caught for `bkit-counter-bus-config.sh` in Task 9, but uncaught here. Done-when NOT satisfied.

GAP-2 (BLOCKING, Task 10) — the "Consumer-repo acceptance note" section does not exist. `grep -n 'Consumer-repo acceptance' docs/deployments.md` returns nothing, and the template is unchanged. Same root cause as GAP-1 (the execute log folded Task 10 into the Task 6 edit, so both were wiped by the same `bkit upgrade`). Done-when NOT satisfied. Secondary consequence: the Task 7 text landed in `docs/security.md` cross-references "`docs/deployments.md` § Post-merge `dev` CI auto-routing" — a dangling pointer to a section that does not exist, shipped in a Tier-2 doc.

GAP-3 (BLOCKING, repo gate) — `pnpm test` is RED: 1 failed / 2668 passed. `.bkit/src/bkit-counter-prose-audit.test.ts` ("#58 T5.2: no MAX_* constant is left unreferenced (dead) in the workflow corpus") enumerates every `MAX_*` in `bkit-counter-bus-config.sh` and requires >=1 reference inside a fenced block across `.bkit/workflows/*.md`. Task 1a added `MAX_DEV_DISPATCH_ATTEMPTS=3` but its only consumer is `bkit-cloud.yml` (a template, not a workflow `.md`), so `fencedReferenceCount` returns 0 and the assertion `expect(count).toBeGreaterThan(0)` fails. The plan never anticipated this shipped invariant (the "Naming" section explicitly says the constant is "Consumed by `bkit-cloud.yml` ctx step, NOT the bkit-debug section"). This reds CI on the PR.

GAP-4 (BLOCKING, Task 9 Done-when) — `pnpm lint:workflows` (actionlint) is RED and this is a regression introduced by the build. Two new findings, one per job: `.github/workflows/bkit-cloud.yml:182:9` and `:463:9`, both `SC2012:info` "Use find instead of ls to better handle non-alphanumeric filenames", originating from `status_dir=$(ls -d docs/plans/*/logs/"$guard_fid"/ ...)` inside `bkit_dev_dispatch_guard`. Baseline check: `git show 4840de2b:.github/workflows/bkit-cloud.yml` linted in a scratch repo returns clean, so this did not pre-exist. Task 9's bullet "`pnpm turbo lint typecheck` (or repo equivalent) passes" and its Done-when "lint/typecheck green" are NOT satisfied. (`pnpm typecheck` alone is green; `pnpm turbo …` is not runnable here — turbo is not a dependency of this repo, so the repo-equivalent gates are `typecheck` + `lint:workflows` + `test`.) `pnpm format:check` flags only this verification log, which is expected for an untracked new file.

INFO (not a gap) — Pre-Flight item at plan line 249 ("consumer repos run CI on `push: branches: [dev]`") is left unticked: it is a cross-repo manual precondition that cannot be asserted from this worktree, and the plan itself routes it to Task 10's docs note (which is GAP-2).

INFO (not a gap) — Task 14's tracker half IS complete despite the execute log recording it as BLOCKED: comment "### Build — Decision Reversal: `main` excluded from trigger (Task 14)" is present on #363 (2026-07-29T08:45:47Z), and `docs/deferrals.jsonl` carries key `363-main-branch-trigger-excluded-reversal`. Ticked.

INFO (harness caveat, not a gap) — the dev-path scope regex uses GNU `\w` in both `grep -oE` and `sed -E`. BSD `sed` on macOS does not honour `\w`, so a local dry-run of the extracted block no-ops FID recovery; substituting `[a-zA-Z0-9_]` reproduces GNU behaviour and all assertions pass. `bkit-cloud.yml` runs on `ubuntu-latest` (GNU sed), so this is a local-harness artefact only. Recorded so a future verifier does not misread it as a defect — and so nobody "fixes" the GNU idiom without cause.
