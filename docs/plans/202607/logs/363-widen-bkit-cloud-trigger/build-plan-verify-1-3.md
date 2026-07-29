Verdict: CONCERNS
Failures: 0

<!-- verdict:end -->

# Plan Verification

## Scope

`Single` — sub-plan 1 of 1 (`docs/plans/202607/363-widen-bkit-cloud-trigger-plan.md`), attempt 3 (final). Whole plan re-verified fresh from the codebase (Gate 1 pre-flight, 14 tasks, T1-T17 matrix, all repo gates), not a spot-check of the prior attempts' gaps.

## Sub-Plans Verified

None (Single scope — one plan file).

## Integration Gaps

None (Single scope). Cross-component chain was traced end-to-end anyway and is coherent — see Notes.

## Previously Attempted

- `build-plan-verify-1-1.md` — FAIL, 4 blocking gaps (deployments.md #363 section wiped by `bkit upgrade`; Consumer-repo acceptance note missing + dangling xref from `security.md`; `pnpm test` red on `bkit-counter-prose-audit.test.ts`; `pnpm lint:workflows` red on 2 new SC2012 findings). Remediated in `build-plan-gaps-remediate-1-1-log.md` (PASS).
- `build-plan-verify-1-2.md` — FAIL, 1 blocking gap (`.bkit/workflows.md` § `bkit [auto route]` Marker Propagation stale/contradicting shipped Task-4 code). Remediated in `build-plan-gaps-remediate-1-2-log.md` (PASS, PIVOT).
- All five prior gaps independently re-verified CLOSED in this attempt (see Notes).

## Notes

**Verdict rationale.** Every functional criterion in the plan is satisfied in the codebase. The only two checkboxes left unticked (plan lines 746, 804) hinge on a plan-text assertion that is unsatisfiable by construction (`grep -c 'AUTO_ROUTE_SUFFIX' bkit-ship.md` = 2 — the plan's OWN verbatim spec snippet contains 3 occurrences before any prose) and on a pre-build-only anchor check that Task 4's own insertion necessarily invalidates post-hoc. Both are plan-authoring defects, not implementation defects; recorded as non-blocking concerns rather than failures. No blocking gaps -> CONCERNS.

**Behavioural verification (executed, not presence-only).** The ctx `run:` block was extracted from the CANONICAL template (`.bkit/templates/.github/workflows/bkit-cloud.yml`) via PyYAML and executed under stubbed `gh`/`git` with a mktemp workspace and a GNU `sed` shim (macOS BSD `sed` does not honour `\w`; `bkit-cloud.yml` runs on `ubuntu-latest`, so this is a harness artefact — the BSD `grep -oE` in this environment DOES honour `\w`). Results:

| Case                                                                                     | `GITHUB_OUTPUT` / notice                                                     |
| ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| T3/T4 `BRANCH=dev CONCLUSION=failure COMMIT_MSG='feat(363-widen-bkit-cloud-trigger): …'` | `skip=false phase=debug arg=363-widen-bkit-cloud-trigger`                    |
| T4 `BRANCH=dev CONCLUSION=success`                                                       | `skip=true` + `dev CI passed — post-merge regression check OK` notice        |
| T16 `COMMIT_MSG='feat(bar-123-auth): x'` on `dev`                                        | `skip=false phase=debug arg=bar-123-auth` (Linear shape admitted)            |
| malformed scope (`chore: manual push`)                                                   | `skip=true` + `Cannot derive FID by dev commit scope or linked PR` fail-safe |
| stale-run guard (`LATEST_CI_SHA != HEAD_SHA`)                                            | `skip=true` + stale notice                                                   |
| kill switch (`bkit:auto` absent)                                                         | `skip=true` + kill-switch notice                                             |
| T5 cap — 3 DISTINCT headSha rows                                                         | `skip=true` + operator-review notice                                         |
| T5 cap — 3 IDENTICAL headSha rows                                                        | `skip=false phase=debug` (distinct-cycle counting correct)                   |
| T17 fail-closed (`push` fails AND row absent on `origin/dev`)                            | `skip=true` + fail-closed notice; NO `phase=`/`arg=` emitted                 |
| T13 `BRANCH=fix/363-widen-bkit-cloud-trigger` (no PR-body markers)                       | reaches dispatch; cap proved keyed on `FID=363` via seeded rows              |
| T13 `BRANCH=fix/bar-123-auth`                                                            | cap proved keyed on `FID=bar-123` via seeded rows (Linear shape)             |
| T15 `fix/**` + failure + 3 distinct rows                                                 | `skip=true` + cap notice                                                     |
| T15 `fix/**` + success                                                                   | `skip=false phase=ship` (cap NOT consulted)                                  |
| T15 `feat/**` + failure + 3 distinct rows                                                | `skip=false phase=debug` (cap NOT consulted — pre-merge path unregressed)    |
| `feat/**` + success                                                                      | `skip=false phase=ship` (unchanged)                                          |
| `workflow_dispatch phase=debug issue=363`                                                | `skip=false phase=debug arg=363` (manual path unregressed)                   |
| no open PR on `feat/**`                                                                  | `skip=true` + `No open PR for branch …` no-op                                |

**Structural / static checks.** T1 `branches: ['feat/**', 'fix/**', 'dev']` (template AND installed). T2 `cancel-in-progress: ${{ github.event.workflow_run.head_branch != 'dev' }}` (both). Ctx `env:` carries `COMMIT_MSG` + `HEAD_SHA` in both jobs (lines 180-181 / 462-463). The `run`/claude and `opencode` ctx blocks are byte-identical after comment-stripping, and the installed `.github/workflows/bkit-cloud.yml` ctx blocks are byte-identical to the template's (so the Task-8 render is faithful and the `shared-deriv` marker pair is honoured). T10 `MAX_DEV_DISPATCH_ATTEMPTS=3` present under a dedicated `# bkit-cloud.yml counters` header in BOTH `.bkit/scripts/` and the canonical `.bkit/templates/.bkit/scripts/`; sourcing prints `3`. T8 `git diff --exit-code -- .bkit/workflows/bkit-debug.md` (vs merge-base) exits 0, and `grep -c CI_DEV bkit-debug.md` = 0. T9 derivation + threading at `bkit-ship.md:683-687`, in the SAME shell block as `gh pr merge`, with `{LABELS}` scope asserted; bash unit re-run: `LABELS=bkit:auto,…` -> `Title (#500) bkit [auto route]`, `LABELS=""` -> `Title (#500)`. T11 mirrors carry the changes (`CI_DEV` x6, `AUTO_ROUTE_SUFFIX` x4, `fix/*)` x1 in each of `.claude/`/`.cursor/`/`.opencode/`); `pnpm bkit check` exits 0 (19 advisories, all pre-existing consumer-drift/env); working tree clean apart from this log. T12 `package.json` = `4.11.0`, `.bkit/version` `pinnedVersion` = `4.11.0`. T14 `bkit-auto.md` Step 10 `case` accepts `feat/*` + `fix/*`, anything else -> Failure Path, post-strip asserts unchanged.

**Task 3 (verify-only) re-confirmed.** `bkit-debug.md:319-327` 3-way worktree fallback still creates `fix/{FID}` off `origin/dev` when `feat/{FID}` is absent; Step 1.6 `gh pr list --head $(git branch --show-current) --base dev` -> empty -> `PUSH_MODE=LOCAL`; zero `CI_DEV` references; zero diff.

**Task 14 fully closed** (the execute log's self-declared BLOCKED half is done): `docs/deferrals.jsonl` carries key `363-main-branch-trigger-excluded-reversal`, and the `### Build — Decision Reversal: main excluded from trigger (Task 14)` comment is live on #363 (2026-07-29T08:45:47Z).

**Attempt-2 gap re-verified closed.** `.bkit/workflows.md` § `bkit [auto route]` Marker Propagation now states ship carries the marker on the squash-merge subject (not the feat-branch HEAD), adds the `/bkit-ship` Step 5 placement row, rescopes the "do NOT re-add" caution to the feat-branch HEAD only, corrects the Cleanup line, and adds a squash-merge row to the Marker Applications table. `.bkit/workflows.md` is hand-authored canonical with no `.bkit/templates/` counterpart, so there is no template mirror to chase.

**Integration chain traced end-to-end** (not required for Single scope, done for confidence): squash-merge subject carries ` bkit [auto route]` (ship Step 5) -> `bkit-cloud.yml` gate matches `head_commit.message` -> ctx step routes `dev`+failure -> emits `phase=debug arg={FID}` (passes the `^[0-9A-Za-z._/-]+$` ARG guard) -> `/bkit-auto debug {FID}` -> Step 1.2 sets `MODE=CI` -> Step 1.5 non-numeric ARG -> `MODE=CI_DEV`, `FID`/`ISSUE_ID`/`BRANCH=dev`/`RUN_ID=""`, skips Steps 6-10 -> Step 2 routes `debug` -> `/bkit-debug {FID}` -> Step 2 worktree fallback mints `fix/{FID}` off `origin/dev`. Both cloud jobs `actions/checkout@v4` with `ref: dev fetch-depth: 0` and configure a git user before the ctx step, so `git rev-parse origin/dev`, the telemetry commit and the fail-closed `git show origin/dev:…` verify all have what they need, and `find docs/plans …` resolves against the default working directory (`$GITHUB_WORKSPACE`).

**Repo gates (all green).** `pnpm test` 75 files / 2669 passed / 2 skipped / 1 todo; `pnpm typecheck` rc=0; `pnpm lint:workflows` (actionlint) rc=0; `pnpm check:dist` rc=0; `pnpm lint:slop` rc=0; `pnpm lint:prose` rc=0; `pnpm format:check` rc=0. `turbo.json` does not exist and `turbo` is not a dependency of this repo, so the Task 9 "repo equivalent" gate set is the six above.

**Plan updated.** Pre-Flight line 249 (consumer repos run CI on `push: branches: [dev]`) ticked — it IS assertable from this session: both consumer checkouts are additional working directories and both `ci.yml` files declare `on.push.branches: [main, dev]`. Prior attempts left it unticked as "cross-repo, not assertable"; that was over-cautious.

**Non-blocking observations (no action required).**

- Task-4-induced line drift in `bkit-ship.md` is expected and harmless: squash `--subject` 687 (plan said 682), close commit 1264 (said 1258), HEAD-Subject Assertion 644 (said 647), `gh run list --workflow ci.yml` 552 (said 546). Recorded so a later reader does not re-open P7.
- `.bkit/workflows.md` cites the derivation as `bkit-ship.md:682-687`; the actual span is 683-687. One-line-off doc anchor, cosmetic.
- The implementation orders the dev branch as stale-guard -> kill switch -> cap+counter-write, whereas Architecture item 5's spec bash orders stale-guard -> cap -> kill switch. The shipped order is strictly safer (a revoked `bkit:auto` no longer burns a counter row) and both reach identical `skip=true` outcomes; not a deviation.
- Local-harness traps (unchanged): the dev-path scope regex uses GNU `\w`, which BSD `sed` ignores (use `gsed`); and a `git` stub must assign `$*` to a scalar before pattern-stripping, else `${*##pat}` expands per-positional-parameter and spuriously fires the fail-closed branch on the happy path.
- The plan's own residual-risk note (single `bkit-auto-dev` concurrency group across all FIDs can drop a middle queued dispatch) is unchanged and explicitly deferred to #397 — not a build gap.

## Identified Gaps Log

0 blocking gaps. 2 non-blocking concerns (both plan-text defects, no code impact).

CONCERN-1 (NON-BLOCKING, plan-text defect, Task 4 Done-when @ plan line 746) — the criterion `grep -c 'AUTO_ROUTE_SUFFIX' .bkit/workflows/bkit-ship.md` = 2 is unsatisfiable by construction. `grep -c` counts matching LINES; the plan's OWN verbatim spec snippet for Task 4 (plan lines 592-597) already contains 3 such lines (`AUTO_ROUTE_SUFFIX=""`, the `echo | grep -q … &&` derivation, and the `--subject` usage), and the shipped edit adds one explanatory prose line, giving 4 (`bkit-ship.md:683,684,687,691`). Every OTHER sub-criterion in that bullet passes and was re-executed this attempt: the `gh pr merge` block derives AND threads `${AUTO_ROUTE_SUFFIX}` in the same shell block; `LABELS=bkit:auto,bkit:building` -> subject `Title (#500) bkit [auto route]`; `LABELS=""` -> subject `Title (#500)`. Box left `[ ]` to preserve the discrepancy rather than tick a literally-false statement. Remediation (optional, plan-text only): change `= 2` to `>= 3` (or drop the count criterion) at plan lines 746 and 804. NO code change is warranted — the implementation matches the plan's own spec byte-for-byte.

CONCERN-2 (NON-BLOCKING, plan-text defect, Task 9 @ plan line 804) — "(v4) Anchor re-verification before build" is a PRE-build check that cannot be satisfied post-build: Task 4's own insertion shifts every anchor it asks to confirm ("still where this revision says"), and it repeats CONCERN-1's `= 2` count. The check's real intent (confirm `bkit-ship.md` had not drifted again between plan revision and build) WAS performed and recorded by the builder — `build-plan-execute-1-log.md` Task 4 states the pre-check confirmed `grep -c AUTO_ROUTE_SUFFIX` = 0 before editing, exactly matching the P1 premise. Current anchors were re-grepped this attempt and are all accounted for by Task 4's insertion (squash `--subject` 687, close commit 1264, HEAD-Subject Assertion 644, `gh run list --workflow ci.yml` 552). Box left `[ ]`. Remediation (optional, plan-text only): none needed — the intent was met.

INFO (not a gap) — all five gaps from attempts 1 and 2 independently re-verified CLOSED: `.bkit/templates/docs/deployments.md` carries `## Post-merge dev CI auto-routing (#363)` and the rendered `docs/deployments.md:190` matches (survives `bkit upgrade`); the `Consumer-repo acceptance note` exists at `docs/deployments.md:203` and `docs/security.md:89`'s xref resolves; `pnpm test` green (the `MAX_DEV_DISPATCH_ATTEMPTS` fenced reference is in `bkit-ship.md`); `pnpm lint:workflows` clean (the `find`-based `status_dir` rewrite is in both jobs of both copies and behaves correctly under the seeded-cap dry-runs); `.bkit/workflows.md` § Marker Propagation now agrees with shipped code.

INFO (not a gap) — Pre-Flight plan line 249 ticked this attempt after direct verification against both consumer checkouts (`app-gether-life`, `visitfrasercoast-com`): both `.github/workflows/ci.yml` declare `on.push.branches: [main, dev]`, so both emit the `workflow_run`-parent CI run the dev trigger depends on.
