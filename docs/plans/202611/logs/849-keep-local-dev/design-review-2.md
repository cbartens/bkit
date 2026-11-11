Verdict: CONCERNS

<!-- verdict:end -->

# Design Review

Lens: Operability — failure modes, observability, on-call ergonomics.

Context: bkit is a CLI/workflow tool, not a service. "On-call" is the owner or an agent reading the final message and stderr. Alerts are the final-message line and non-zero exits.

## Failure-Mode Enumeration

<!-- prettier-ignore -->
| Component / flow | What fails | Detection | Blast radius |
| --- | --- | --- | --- |
| `syncLocalDev` fetch | Network error, ref-lock race | `unavailable: fetch-failed` in `localDev.line` | One clone; landing unaffected |
| `syncLocalDev` move | `dev` checked out elsewhere, edited file, other refusal | `blocked: occupied / edited-files / git-refused` | One clone |
| `syncLocalDev` catch-all | Internal exception | `unavailable: internal` + log | One clone; hides a real bug behind a soft state |
| Frozen install after fast-forward | Install fails, `node_modules` stale | `installed: false` in line; close exits 0 | One clone; later builds and tests fail confusingly |
| Parallel closes | Two syncs race on `dev` | git refuses backwards move; re-read once | One clone |
| Line display in design / plan / debug-on-dev | Workflow forgets to show `LOCAL_DEV_LINE` | Only the contract test, which checks engine output, not the workflow prose | Silent: lag returns unreported |
| Ship Step 13 retirement | Resume of an in-flight run, old logs | `status-holes` validation | Runs mid-flight when the change ships |
| `dev-status` / classifier | Wrong "published" verdict (squash edited, mode-only, rename, LFS) | Backup branch only; no detection at verdict time | Work silently dropped from the replay |
| `dev-reconcile prepare` | Replay conflict, gate failure, throwaway left behind | Stops with commit and paths; gate exit in `ReconcilePrepared` | One clone; throwaway `.worktrees/_land-*` may leak on crash |
| `dev-reconcile push` | `origin/dev` moved, prepared object garbage-collected, push partly done | `stale` exit; "missing object" report | Shared `origin/dev` if wrong SHA is pushed (bound to the approved SHA) |
| `dev-reconcile adopt` | Crash between push and adoption, `dev` occupied | Re-runnable; `blocked: occupied` | One clone |
| Backup branches | Pushed by mirror config, pile up | `publishRisk` warning, `backups` list | Shared remote if mirrored |

## Observability Coverage

- Structured result: `localDev` (`state`, `reason`, counts, `from`, `to`, `target`, `installed`) is a clear, single typed result for every close. Strong.
- Logs: the design says "log the refusal stderr" and "logs it" for internal exceptions, but names no `[bkit-...]` prefix. `docs/observability.md` requires one (workflow commands log `[bkit-<noun>]` on stderr, and a new prefix only alongside a new command noun). Gap: see OPTIONAL 1.
- Metric or counter: none. Telemetry on blocked and divergent rates is explicitly out of scope. For a tool whose whole purpose is "routine lag stops", there is no way to tell afterwards whether it worked across runs. Acceptable for now, but `.bkit/stats.jsonl` already has a `counter` kind, so the cost is low.
- Correlation: not needed (single process, local).
- Display coverage: the contract test checks that each verb emits `localDev`. It does not check that each workflow shows it. This is the exact "prose-ordering slip" the design says caused the issue.
- Classifier trust: wrong "published" verdict has no runtime signal; only the backup branch limits damage.

## On-Call Ergonomics

- Final-message lines name the recovery command (`bkit branches sync-dev`, `@bkit-utility-sync-dev`). Runbook is obvious from the payload. Good.
- Recovery: automatic sync is idempotent and automatic; reconcile stages are stateless and re-runnable; the push needs human approval. Good.
- Noise: `divergent` and `blocked: edited-files` will appear on every debug-on-dev run and every failure-record handover from `dev` (the design's own Risk). Without tuning, the owner learns to ignore the line, and then misses a real problem. The design says wording must read as bookkeeping but sets no rule for when the line is quieter.
- Exit codes: close always exits 0 on sync trouble. Correct for landing, but install failure and `unavailable: internal` are then visible only in prose. Machine consumers (CI, scripts) have no signal beyond the JSON field.
- Backups: no listing or prune guidance beyond "owner deletes it"; `dev-status` lists them. Fine.

## Operational Dependencies

- New command `bkit branches dev-status` and `dev-reconcile` (three stages): owner must learn both.
- New prompt `@bkit-utility-sync-dev` with host copies, catalog rows and a turn budget.
- New standing artefact class: `dev-backup/*` branches the owner must prune.
- One contract test whose call-site list must be edited whenever a `dev`-pushing verb is added.
- No dashboard or paging alert.

## Verdict Reasoning

The design is operable: every failure mode has a typed state, a plain-English line and a recovery command, and the landing is never failed by sync. Caveats are addressable: the contract test does not cover the workflow display half, `internal` and install failure are soft with no counter, and the routine-divergence noise has no tuning. No unrecoverable path or alert storm. CONCERNS.

## CRITICAL

None.

## OPTIONAL

1. Name the log prefix. State which `[bkit-...]` prefix `syncLocalDev`, `dev-status` and `dev-reconcile` log under (likely `[bkit-branches]`, reusing the owning module per `docs/observability.md` § Log Format), and that the refusal stderr and `unavailable: internal` stack go there at warn level.
2. Close the display gap. Add a test or render-snapshot assertion that `bkit-design.md`, `bkit-plan.md`, `bkit-debug.md` and the Failure Paths reference `localDev.line`, since the engine-side contract test cannot catch a workflow that drops it.
3. Count outcomes cheaply. Write one `counter` row to `.bkit/stats.jsonl` per sync state (it is the existing ledger). This makes "did routine lag go away" answerable and removes the need to defer telemetry entirely.
4. Tune the routine noise. Give the expected cases (`copies == ahead` after debug-on-dev; `edited-files` after a handover from `dev`) a short, distinct wording, and pin both with tests as the Risk already suggests. State that `unavailable: internal` should also write a `friction` row, so a hidden bug in the catch-all surfaces.
5. Install failure visibility. In the Risks question on install failure, Option C (exit 0 plus a `friction` row) deserves reconsideration over default A, because A leaves a broken `node_modules` visible only in one line.
6. Prepared-object survival. Rather than leaving it as an assumption, decide now whether `dev-reconcile prepare` writes a `refs/bkit/` holding ref (and removes it after push or adopt). Otherwise a long approval delay produces a confusing "missing object" failure.
7. Throwaway cleanup on crash. State how a leaked `.worktrees/_land-*` from a killed `prepare` is detected and removed (reuse the #639 sweep if one exists).
8. Open questions format. All five lettered-option questions carry `Recommended` and `Default`. Three bullets lack that shape: the object-survival assumption, the `devLocal` rename and the Step 13 retirement are listed as Assumption / Risk, not questions, so they need no options. The prepared-object assumption is the one that should become a lettered question (hold ref A / re-prepare B).
9. Backup-branch hygiene: have `dev-status` say how many backups exist and how old the oldest is, and offer the delete command.

## OUT OF SCOPE

- Telemetry dashboards for local-sync outcomes beyond the stats counter (already deferred by the design).
- Making debug-on-dev stop creating copies (already deferred).
- Feature-branch catch-up (#842).
