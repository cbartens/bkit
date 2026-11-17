Verdict: CONCERNS

<!-- verdict:end -->

# Design Review

Lens: Operability — failure modes, observability, on-call ergonomics.

Scope: `design-v1-draft.md` against `design-input-1.md`. `docs/observability.md` and `docs/deployments.md` exist; I did not need more than the design's own text for this lens.

## Failure-Mode Enumeration

<!-- prettier-ignore -->
| Flow | What fails | Detection in the design | Blast radius |
| --- | --- | --- | --- |
| Landing lock | Holder alive but hung; wait hits `LAND_LOCK_WAIT` (15 min) | Run stops, holder named; 30 s "waiting" lines | Every parallel local run on this clone |
| Landing lock | Holder dead | Reclaimed at once (host + PID + start time) | None |
| Scratch checkout `.worktrees/_land-{FID}` | Process killed between `worktree add` and cleanup | Not specified | The next landing of that FID; stray worktree |
| `advanceLocalDev` | `blocked` (dirty overlap, `dev` held by another worktree) | Run stops, names paths or worktree | One run; `dev` untouched |
| `advanceLocalDev` | `moved` repeatedly (owner hand-commits) | `LAND_ATTEMPTS` budget | One run |
| Pre-land checks | Red on combined result | Run stops, routes to `/bkit-debug` | One run |
| Pre-land checks | `bkit:gate:changed` undeclared | Narrated fallback | None |
| Frozen mode | Row differs from fresh resolution on resume | One warning | One run |
| Tracker | `bkit:merged` on code only on one machine | Ahead count at Step 1 | One issue; lost laptop loses the batch |
| Batch push | Hook refuses `[skip ci]` tail | Hook message | One push |
| Batch push | Stale copy-and-own hook lacks the guard | `bkit check` advisory (only while a `publish.local` is `false`) | One batch skips CI |
| Post-push CI follow-up | No previous run, unreachable base, range over cap | No-op with a summary row | One batch gets no automatic issue mapping |
| Post-push CI follow-up | Red `dev` run maps to many FIDs | Dispatch policy (open item 3) | Cloud cost; parallel fixers |
| Wrong ref read | A later call site names `origin/dev` in local mode | Audit test, `runGit` spy, dogfood run | Silent wrong base |

## Observability Coverage

- Good: the `landing` log line records `DEV_AT`, `NEW`, gate, exit and changed-file count. This is a solid rollback pointer.
- Gap: that line is written only at Step 6, after a successful advance. Lock timeout, `blocked`, `moved` exhaustion and red checks have no specified log line, no `[Context]`-prefixed message and no `outcome` row reason. On-call (the owner) sees only the run's last words.
- Gap: no counter for local-landing outcomes (`advanced`, `moved`, `blocked`, `lock-timeout`, `checks-red`). `outcome` gains `publish?` but not a failure reason.
- Gap: no correlation between the local landing sha and the later pushed sha. After `git pull --rebase` (recommended in open item 4) the shas change, and the design says the telemetry joins on worktree shas. That holds, but the `landing` line's `NEW` becomes unfindable. State this in the docs, or log the FID in the commit trailer-free subject (it is already there), and make sure the FID is in every `landing` line.
- The CI follow-up no-op writes a summary row, which is good. It is silent to the owner, though: the owner who pushes a batch gets no visible "nothing was mapped" signal outside the Actions summary.

## On-Call Ergonomics

- Lock timeout: message names the holder and the stop is fail-closed. Recovery is a human judgement (is the holder hung?). The design does not say how the owner clears a hung but live holder safely. Add the runbook line (kill the PID, then re-run; the lock is reclaimed).
- Orphan `_land-{FID}`: no recovery step. A re-run should detect and remove a stale scratch tree for its own FID before `worktree add`, or it fails on an existing path.
- `blocked`: the message carries paths; recovery is clear and idempotent (re-run the same workflow).
- Red checks: routes to `/bkit-debug` on the held branch; clear.
- Manual undo of a bad landing: `DEV_AT` is only in a log line. Dev is never reset by bkit, so the owner needs a documented command in `docs/deployments.md`. #813 (rollback path) is open and related; link it.
- Alert noise: the 30 s "waiting" lines are narration, not pages. No pager alerts exist here. The CI follow-up fan-out is the one alert-storm vector (item 3); the design already picks B (one dispatch).
- Hook refusal: message tells the owner what to do. Good.

## Operational Dependencies

- Owner runbook in `docs/deployments.md`: batch push, `origin/dev` moved (rebase), revert to `DEV_AT`, clear a hung lock.
- `bkit check` advisory for a stale pre-push hook (new alert surface, text carries the fix).
- `bkit-cloud.yml` dev arm range read (CI change needing owner sign-off), with its summary row.
- Audit test and no-push spy test to keep alive.
- A dashboard: none. Reads of `status.jsonl` and `.bkit/stats.jsonl` only.

## Verdict Reasoning

CONCERNS. The success path is well instrumented, and the dangerous operation (moving the owner's `dev`) is last, compare-and-swap, and logged with a rollback sha. The failure paths are the thin part: no specified log, outcome reason or counter for stopped landings, and no cleanup for a crashed scratch checkout. These are fixable inside the design and do not block it.

## CRITICAL

- Failed or stopped landings are unobserved. Specify a `[Context]`-prefixed log line plus an `outcome` reason for each stop (`lock-timeout`, `blocked`, `moved-exhausted`, `checks-red`), each carrying FID, `DEV_AT` and the holder or paths. The success-only `landing` line (Components / Flows, step 6) is not enough for the severe failure mode of the owner's `dev`.
- Crashed landing leaves `.worktrees/_land-{FID}` behind with the lock possibly reclaimed. Specify that the next landing for the FID removes a stale scratch tree (after the lock is held) and says so. Without it, a re-run, which the design relies on as the recovery action, can fail on an existing path.

## OPTIONAL

- Add a recovery runbook to `docs/deployments.md` for: a hung live lock holder, reverting to `DEV_AT`, and the sha change after a rebase. Link #813.
- Open item "Lock wait value" has no lettered options, `Recommended` or `Default if unanswered`. Add them (for example A) 15 min, B) 5 min, C) configurable; default A).
- The "CI sign-off" item and the other risk bullets are statements, not questions, so they need no options; the four numbered owner questions are complete.
- Print a visible "no batch mapping" line for the owner when the CI follow-up no-ops.
- Put the FID in every `landing` line and say the local sha may change after a rebase.
- Count `moved` retries in the `landing` line so a busy batch is visible before it exhausts `LAND_ATTEMPTS`.

## OUT OF SCOPE

- A tool to reconcile a split `dev` (#849).
- A batch-push command (#715's closed decision).
- Protection against a lost laptop holding unpushed features, which the owner accepts.
