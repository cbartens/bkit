Verdict: FAIL
Failures: 1

<!-- verdict:end -->

# Plan Verification

## Scope

`Single` — sub-plan 1 of 1 (`docs/plans/202607/363-widen-bkit-cloud-trigger-plan.md`), attempt 2. Whole plan re-verified fresh (14 tasks, T1-T17 matrix), not a spot-check of attempt 1's four gaps.

## Sub-Plans Verified

None (Single scope — one plan file).

## Integration Gaps

None (Single scope).

## Previously Attempted

`build-plan-verify-1-1.md` — FAIL, 4 blocking gaps (GAP-1 `deployments.md` #363 section wiped by `bkit upgrade`; GAP-2 Consumer-repo acceptance note missing + dangling xref from `security.md`; GAP-3 `pnpm test` red on `bkit-counter-prose-audit.test.ts`; GAP-4 `pnpm lint:workflows` red on two new SC2012 findings). `build-plan-gaps-remediate-1-1-log.md` — PASS, all four remediated. **All four re-verified CLOSED in this attempt** (see Notes).

## Notes

**Attempt-1 gaps — all four independently confirmed closed.**

- GAP-1/GAP-2: `.bkit/templates/docs/deployments.md` now carries `## Post-merge dev CI auto-routing (#363)` (routing table + auto-route contract + docs-only-diff precondition + Consumer-repo acceptance note), and the rendered `docs/deployments.md:190` matches — so the edit is in the canonical template and survives `bkit upgrade`. `docs/security.md:89`'s cross-reference `§ Post-merge \`dev\` CI auto-routing` now resolves. (`docs/security.md`'s own `#363`paragraph sits at line 89, OUTSIDE its`bkit:start`/`bkit:end` block, which ends at line 23 — repo-local content, not template-rendered, so it is correctly placed and not upgrade-fragile.)
- GAP-3: `pnpm test` green — 75 files, 2669 passed / 2 skipped / 1 todo. The `MAX_DEV_DISPATCH_ATTEMPTS` fenced reference landed in `.bkit/workflows/bkit-ship.md:680-682`.
- GAP-4: `pnpm lint:workflows` (actionlint) clean; the `find`-based `status_dir` rewrite is present in both jobs of both the template and the installed copy and behaves correctly under dry-run (verified below, including the seeded-cap cases that exercise the `find` path).

**Behavioural re-verification (not presence-only).** The ctx `run:` block was extracted from the installed `.github/workflows/bkit-cloud.yml` via PyYAML (both `run`/claude and `opencode` jobs) and executed under stubbed `gh`/`git` with a mktemp workspace. Results (`GITHUB_OUTPUT` contents shown):

| Case                                                                                                               | Result                                                                       |
| ------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| T3/T4 `BRANCH=dev CONCLUSION=failure COMMIT_MSG='feat(363-widen-bkit-cloud-trigger): test (#1) bkit [auto route]'` | `skip=false phase=debug arg=363-widen-bkit-cloud-trigger`                    |
| T4 `BRANCH=dev CONCLUSION=success`                                                                                 | `skip=true` + `dev CI passed — post-merge regression check OK` notice        |
| T16 `COMMIT_MSG='feat(bar-123-auth): x'` on `dev`                                                                  | `skip=false phase=debug arg=bar-123-auth` (Linear shape admitted)            |
| malformed scope (`chore: manual push`)                                                                             | `skip=true` + `Cannot derive FID by dev commit scope or linked PR` fail-safe |
| stale-run guard (`LATEST_CI_SHA != HEAD_SHA`)                                                                      | `skip=true` + stale notice                                                   |
| kill switch (`bkit:auto` absent)                                                                                   | `skip=true` + kill-switch notice                                             |
| T5 cap — 3 DISTINCT headSha rows                                                                                   | `skip=true` + operator-review notice                                         |
| T5 cap — 3 IDENTICAL headSha rows                                                                                  | `skip=false phase=debug` (distinct-cycle counting correct)                   |
| T17 fail-closed (`push` fails, row absent on `origin/dev`)                                                         | `skip=true` + fail-closed notice; NO `phase=`/`arg=` emitted                 |
| T13 `BRANCH=fix/363-widen-bkit-cloud-trigger`                                                                      | reaches dispatch; cap keyed on `FID=363` (proved by the seeded-cap case)     |
| T15 `fix/**` + failure + 3 distinct rows                                                                           | `skip=true` + cap notice                                                     |
| T15 `fix/**` + success                                                                                             | `skip=false phase=ship` (cap NOT consulted)                                  |
| T15 `feat/**` + failure + 3 distinct rows                                                                          | `skip=false phase=debug` (cap NOT consulted — no pre-merge regression)       |
| `feat/**` + success                                                                                                | `skip=false phase=ship` (unchanged)                                          |
| `workflow_dispatch phase=debug issue=363`                                                                          | `skip=false phase=debug arg=363` (manual path unregressed)                   |

The `opencode` job was spot-checked on three of these and returned identical output. A structural diff of the two `# bkit:start shared-deriv` blocks (template and installed) shows **comment-only** divergence — every executable line is byte-identical.

**Static/matrix checks.** T1 `branches: ['feat/**', 'fix/**', 'dev']`; T2 `cancel-in-progress: ${{ github.event.workflow_run.head_branch != 'dev' }}`; ctx `env:` carries `COMMIT_MSG` + `HEAD_SHA` in both jobs of both copies (lines 180-181 / 462-463); T10 `MAX_DEV_DISPATCH_ATTEMPTS=3` present under a dedicated `# bkit-cloud.yml counters` header in BOTH `.bkit/scripts/` and `.bkit/templates/.bkit/scripts/`; T8 `git diff --exit-code -- .bkit/workflows/bkit-debug.md` exits 0; T9 `AUTO_ROUTE_SUFFIX` derived + threaded at `bkit-ship.md:683-687`; T11 mirrors carry the changes (`CI_DEV` x6 and `AUTO_ROUTE_SUFFIX` x4 in all three of `.claude/`/`.cursor/`/`.opencode/`), `pnpm bkit check` exits 0 (advisories only, all pre-existing/consumer-drift), working tree clean apart from this log; T12 `package.json` = `4.11.0`, `.bkit/version` `pinnedVersion` = `4.11.0`; T14 `bkit-auto.md` Step 10 `case` accepts `feat/*` and `fix/*`, anything else -> Failure Path. Task 14 fully complete: `docs/deferrals.jsonl` key `363-main-branch-trigger-excluded-reversal` present AND the `### Build — Decision Reversal: main excluded from trigger (Task 14)` comment is on #363 (2026-07-29T08:45:47Z).

**Repo gates (all green).** `pnpm typecheck` clean; `pnpm test` 2669 passed; `pnpm lint:workflows` (actionlint) clean; `pnpm check:dist` clean; `pnpm lint:slop` exit 0; `pnpm lint:prose` exit 0 (1 pre-existing unrelated warning in `docs/testing.md`); `pnpm format:check` flags only this verification log (untracked new file, formatted on write). `pnpm turbo` is not a dependency of this repo, so the Task 9 "repo equivalent" gate set is `typecheck` + `test` + `lint:workflows` + `check:dist` + `lint:slop` + `lint:prose` — all pass. Task 9 lines 805-807 ticked accordingly.

**One blocking gap remains** — a required doc sweep that Task 5 ticked but did not perform, leaving shipped doctrine asserting the opposite of shipped code. Detail in the gaps log.

**Non-blocking observations (no action required).**

- Plan lines 746 / 804 assert `grep -c 'AUTO_ROUTE_SUFFIX' .bkit/workflows/bkit-ship.md` = `2`; the actual count is `4`. The plan's OWN verbatim spec snippet for Task 4 contains 3 occurrences before any prose, so `= 2` is unsatisfiable by construction — a plan-text arithmetic error, not an implementation defect. Both boxes left unticked to preserve the discrepancy; every functional criterion in those two bullets passes (derivation + threading present, `LABELS=bkit:auto` -> subject ends ` bkit [auto route]`, `LABELS=""` -> subject unchanged).
- Task-4-induced line drift in `bkit-ship.md`: squash `--subject` is now at 687 (plan said 682), close commit 1264 (said 1258), HEAD-Subject Assertion 644 (said 647), `gh run list --workflow ci.yml` 552 (said 546). Expected — Task 4 inserted lines above them. Recorded so a later reader does not re-open P7.
- The implementation orders the dev branch as stale-guard -> kill switch -> cap+counter-write, whereas Architecture item 5's spec bash orders it stale-guard -> cap -> kill switch. The implementation order is strictly safer (a revoked `bkit:auto` no longer burns a counter row) and both orders reach the same `skip=true` outcomes; not treated as a deviation.
- Pre-Flight item at plan line 249 (consumer repos run CI on `push: branches: [dev]`) stays unticked: a cross-repo manual precondition not assertable from this worktree. The precondition is now documented in the shipped `deployments.md` Consumer-repo acceptance note.
- Local-harness caveat (unchanged from attempt 1): the dev-path scope regex uses GNU `\w`; BSD `sed`/`grep` on macOS do not honour it, so a local dry-run must substitute `[a-zA-Z0-9_]` (done here). `bkit-cloud.yml` runs on `ubuntu-latest` (GNU) — harness artefact only, not a defect. A second harness-only trap: bash expands `${*##pat}` per-positional-parameter, so a `git` stub must assign `$*` to a scalar first; getting this wrong makes the fail-closed branch fire spuriously on the happy path.

## Identified Gaps Log

1 gap.

GAP-1 (BLOCKING, Task 5 doc sweep) — `.bkit/workflows.md` § `bkit [auto route]` Marker Propagation was never updated and now contradicts the shipped code this build landed. Three statements are false as of Task 4: line 607 "**Ship does NOT carry the marker (#384).** … Ship carries the marker on no commit at all today."; line 616 "`/bkit-ship`: no placement — see 'Ship does NOT carry the marker (#384)' above."; line 622 "ship carries it on nothing — #384". `bkit-ship.md:683-687` now derives `AUTO_ROUTE_SUFFIX` and threads it onto the squash `--subject`, so ship DOES carry the marker — on the one commit that lands on `dev`, which is the entire mechanism admitting the new trigger. The plan assigned this fix explicitly: Architecture § `.bkit/workflows/bkit-ship.md` item 2 (plan line 603) states "`.bkit/workflows.md` § `bkit [auto route]` Marker Propagation should gain the squash-merge row (folded into Task 5's doc sweep)". Task 5 is ticked `[x]` and its Done-when ("cloud.md contains the decision-log entry…") is satisfied, but the workflows.md half of its sweep was not done — `git diff origin/dev..HEAD -- .bkit/workflows.md` is empty. Impact is not cosmetic: `.bkit/workflows.md` is a hand-authored canonical file shipped verbatim to consumers and read by agents as doctrine, and line 609's "do NOT 'fix' it by re-adding a marker-carrying local merge" plus line 607's flat denial invite a future agent to revert Task 4 as drift. Remediation: edit `.bkit/workflows.md` (canonical — there is no `.bkit/templates/workflows.md`, so no template mirror to chase) to (a) restate 607 as "ship carries the marker on the squash-merge subject only, never on a feat-branch HEAD — the #384 invariant that ship never mutates a validated head is unchanged", (b) add a `/bkit-ship` Step 5 row to the Placement list at 611-616, (c) correct the Cleanup note at 622; then `pnpm bkit upgrade` to refresh host mirrors.

INFO (not a gap) — attempt 1's four gaps are all verified closed; the `pnpm bkit upgrade` that gaps-remediate re-ran produced no knock-on regressions (mirrors, `.bkit/version` canonicalHashes, installed `bkit-cloud.yml`, counter-bus-config installed copy and template all consistent; `bkit check` exit 0; full gate set green).
