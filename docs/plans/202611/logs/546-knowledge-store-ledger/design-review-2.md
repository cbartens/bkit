Verdict: CONCERNS

<!-- verdict:end -->

# Design Review

Lens: Operability — failure modes, observability, on-call ergonomics.

Scope note: per `docs/observability.md` § Scope, bkit has no server-side telemetry. "On-call" here means the owner, a consumer's CI log grep, and agents running `bkit brain *`. Detection is CLI stderr/stdout, exit codes, `bkit check`, `bkit stats` and the `[bkit-<noun>]` prefix.

## Failure-Mode Enumeration

<!-- prettier-ignore -->
| # | Component / flow | What fails | Detection in the design | Blast radius |
| --- | --- | --- | --- | --- |
| F1 | Reader (`readBrain`) | A reader still names an old path and silently reads zero rows (e.g. `bkit stats` deferral counts) | Old-path audit test (`ledger-integrity.test.ts`), at dev time only | Every consumer of that reader; wrong numbers with no error |
| F2 | Reader on malformed or old-shape lines | Lines skipped or normalised at read time | Only counted inside `bkit brain check`, which nobody runs automatically | One repo; agents get fewer rows without knowing |
| F3 | Migration `mergeIntoBrain` | Crash between writing the brain and truncating the stubs; or truncating before the brain write lands | Idempotence plus the identity+`ts` drop. Write order is not stated | One repo; row loss if stubs are truncated first |
| F4 | Downgrade or mixed-version install | An older bkit or a pre-upgrade worktree reads the emptied stubs and sees zero rows | Legacy `--ledger` alias covers writes only; reads are not covered | One checkout or branch; silent |
| F5 | Pre-upgrade branch landing | Stub lines union in after `dev` merged | `bkit check` advisory (exit 0) | One repo; low, readers still see the lines |
| F6 | `brain context` | Clamp drops rows; a hot file matches 100+ rows | Clamp's "dropped content was NOT read" notice, `tokensEst` | One task; the agent works without a gotcha |
| F7 | `brain search` | `node:sqlite` unavailable, FTS5 missing, ExperimentalWarning, index half-built or corrupt | Fallback to `ledgerScan` with a stderr line; content-hash plus rename for the index | One command; degraded ranking |
| F8 | Recall log | Concurrent appends from several worktrees; rollup truncates while another run appends; file deleted | None stated | Lost `lastRecalled` dates cause early fades |
| F9 | Brain update, mechanical half | Two runs compact or move stragglers at once; stub truncated while a branch is appending | Deterministic ids and the `stale`/`applied` skips cover only the inferred half | One repo; possible duplicate or lost lines |
| F10 | Brain update, inferred half | Prompt proposes a wrong supersede, fade or contradiction fix; with `ask: false` it is applied directly | Report lists changes; same-`key` append is reversible | Silent loss of a live gotcha from `context` until someone notices |
| F11 | Scheduled run in `bkit-cloud.yml` | Job fails, hits no credentials, hits a push conflict, or pushes a bad change to `dev` | Normal CI red status only | Brain goes stale or is changed unseen; for the unattended run no one is watching |
| F12 | Rejection memory | Union-resurrected or wrongly pruned rejection rows; a suggestion re-offered forever or a rejected one applied | Pruning rule, id hashing | Owner annoyance; low |
| F13 | Fold change (`proposal.basedOn` rank, `lastRecalled` max) | Regression in the fold changes which row wins, `bkit stats` drifts | Success Criterion 2 compares fold winners and stats before/after migration | Whole product's stats; high impact but test-covered |
| F14 | Dead-premise and link check | Cycle, dangling key, quiet check because every backfilled link is `relatedTo` | Iterative walk with a visited set; findings in `check` | False sense of safety until brain update upgrades links |

## Observability Coverage

- **Logs:** The design says "one stderr notice" for the legacy alias and a stderr line for the FTS fallback. It names no `[bkit-brain]` prefix. `docs/observability.md` § Log Format requires one prefix per new command noun, with the brackets, because consumer CI grep depends on them. No grep-able signature is defined for F2, F3, F7, F8, F9 or F11.
- **Counters:** `bkit workflows close` already writes counter and outcome rows to `stats`. The design adds no counter for FTS fallbacks, stale or applied skips, stub stragglers moved, malformed lines, rows dropped by the clamp, or suggestions made, approved and rejected. Success Criterion 1 does measure tokens (`tokensEst`), once, by hand.
- **Correlation:** Brain update has the suggestion id and a random-suffixed report name. That is a good correlation key. The recall log and the scheduled run have none; a CI run URL is not recorded in the report.
- **Good:** `tokensEst`, clamp notice, `check` per-file counts, `--json` output, `outcome.context.byAgent` for the update agent's context, content-hash index, deterministic migration with a re-run-safe test.
- **Gaps by failure mode:**
  - F1, F13: covered by tests, no runtime signal. Acceptable.
  - F2, F5, F14: depend on a human running `bkit brain check`. Nothing surfaces them otherwise.
  - F3, F4, F8, F9, F11: no log signature or counter.

## On-Call Ergonomics

<!-- prettier-ignore -->
| Alert or signal | Runbook obvious from payload? | Recovery | Noise tuning |
| --- | --- | --- | --- |
| `bkit check` drift exit 1 (old ledger with content, no brain) | Mostly: the design commits to the fix inline (`bkit upgrade`) | Automatic and idempotent | Fires once per unmigrated repo; fine |
| `bkit check` stub advisory (exit 0) | Yes, fix inline (`bkit upgrade` or `bkit brain update`) | Idempotent | Advisory only; no paging |
| `bkit brain append` printing `dependents:` | Yes; the list is the action | Human judgement | Exit 0 always; could be long for a hub row, no cap stated |
| `bkit brain check` findings | The finding types are clear; the fix per type is not written down (what to do about a `dependsOn` cycle, or a duplicate-`ts` finding) | Human judgement | Never a gate, so no paging. Day-one volume is unknown: 45 `SUPERSEDED` rows with no successor link are listed at once |
| `brain context` clamp notice | Yes, points at `brain search` | Agent self-serves | None needed |
| Search fallback stderr line | Partial: says it fell back, not why or how to fix | Automatic, degraded | One line per call; may repeat on every search if FTS5 is missing |
| Scheduled brain-update failure | No. A red GitHub Actions run with no payload hint | Human; re-run is safe because mechanical steps are idempotent | Weekly or daily cadence not stated; no staleness alert if it silently stops running |
| Suggested Changes report (`ask: true`) | Table plus ids; approval by `--approve=<#,…>` is clear | Human judgement | Stale reports pile up in `docs/audits/`, with no expiry stated |
| `ask: false` applied changes | Report lists them, but nobody is asked | Reversible by same-`key` append, but the reversal command is not documented | Silent by design; wrong supersedes are found only by accident |

## Operational Dependencies

- New command family `bkit brain append|check|compact|context|search|update`, and a new stderr prefix (to be registered in `docs/observability.md`).
- New committed file `.bkit/brain-rejections.jsonl` and new gitignored local state `tmp/bkit-brain/` (recall log, FTS indexes, update packets). Someone must know it is safe to delete.
- A new opt-in scheduled CI job (`schedule` trigger and `brain-update` phase in `bkit-cloud.yml`), which is a new unattended thing that can fail or push.
- A new report location (`docs/audits/{YYYYMM}/brain-update-*.md`) with an owner review duty.
- A new release-range retirement chore for the four stubs and the legacy alias.
- A `docs/migrations.md` row and a changed `.bkit/jsonl.md` § Write Idiom that consumer scripts must follow.
- A runbook is needed for: downgrade after migration, a corrupt or oversized brain, and a bad `ask: false` apply. None exists yet. Because this is a docs-only dependency, the plan can add it as a task.

## Verdict Reasoning

CONCERNS. The core data path is well designed for operability: deterministic migration, content-addressed caches, idempotent updates, a choke-point module with an old-path audit test, tokens measured, and readers that fall back instead of failing. No failure mode is unrecoverable, because JSONL in git is the only store and every index is disposable. That rules out FAIL.

The gaps are signals, not structure. Several degraded states (F2, F4, F8, F11) are silent, the brain-update run has no counters, and the scheduled job has no failure or staleness signal. Both can be fixed by adding specification to the design, not by changing the architecture.

## CRITICAL

1. **No logging and counter contract for the new `brain` verbs (F2, F3, F7, F8, F9).** The design never names a `[bkit-brain]` prefix, and `docs/observability.md` requires one per new command noun, with the brackets kept because consumer CI grep depends on them. Add to the design: the prefix, and a short list of grep-able lines for the degraded cases: search fallback and its reason, malformed or old-shape lines skipped by `readBrain`, stub stragglers found, recall-log write failure (best-effort, exit 0, like `[bkit-comply] append failed`), and a migration partial-state line. Add `stats` counters (or outcome fields) written at `bkit brain update` end for: stragglers moved, suggestions made, approved, rejected, applied and stale-skipped, plus search fallbacks. Without these, "the brain read fewer rows than it should" has no detection other than an agent noticing.
2. **The scheduled unattended run has no failure, staleness or kill signal (F11, F10).** The design recommends committing straight to `dev` from CI (option A) but sets the default to B, and the plan could ship either without anyone choosing. State: what makes the run fail loudly (non-zero exit, a `[bkit-brain]` line carrying the run id), what happens on a push conflict (retry once, then fail, never force), a stated cadence, and how the owner learns it stopped (e.g. a `check` finding "last brain update older than N days", derived from the newest report or a `brain-update` row). Also state a cap or a pause for an unattended run on how many rows it may fade or supersede in one pass, since a bad prompt run is otherwise applied silently when `ask: false`.
3. **Migration write order and the downgrade path are unspecified (F3, F4).** Say that the brain file is written and renamed first and the stubs are truncated last, so a crash leaves the identity+`ts` drop to finish the job, and never the reverse. Add one line saying what an older bkit sees after migration (empty files, zero rows, no error), and the recovery (`git revert` of the migration commit, or `bkit upgrade` forward). Add a `bkit check` signal on the older-version side only if feasible; if not, record it in `docs/migrations.md` as a known one-way step.

## OPTIONAL

1. **Recall log races (F8):** appends from several worktrees plus a truncating rollup can drop lines. Use rename-then-read (move `recall.jsonl` aside, then roll up) instead of read-then-truncate; losing a few recalls is acceptable but say so.
2. **Mechanical-half concurrency (F9):** state whether two simultaneous `bkit brain update` runs are safe for compaction and straggler moves, not only for suggestions. A lock-free "temp file and rename" per file with re-read just before rename, or a documented "single writer, second run exits 0 with a notice", is enough.
3. **`check` runbook:** add one fix line per finding type (dead premise, dangling key, cycle, duplicate `ts`, missing successor), as the design already does for the stub advisory. Estimate day-one finding volume (the 45 `SUPERSEDED` rows are a known figure) so the first run is not a surprise.
4. **`dependents:` cap:** print at most N rows plus a "and M more, see `bkit brain check`" line so a hub row does not flood an agent's context.
5. **Search fallback noise:** print the reason once per process and the one-line fix; consider remembering a failed FTS5 probe for the session.
6. **Reversal command for `ask: false`:** document how to undo an applied suggestion (re-append the previous content under the same `key`), and print it in the report next to each applied row.
7. **Report hygiene:** say when old `docs/audits/{YYYYMM}/brain-update-*.md` reports are pruned or considered closed, and record the CI run URL in the report header for scheduled runs.
8. **Risks section completeness:** it covers most failure modes. Add the missing ones as short bullets: recall-log races, mixed-version reads, scheduled-run failure. The open questions all have lettered options, a `Recommended` and a `Default if unanswered`, except the five bullets without options: stub union unverified, rare migration divergence, plan 1 size, `jq` write idiom, kind-transition lineage. These are statements, not decisions; no change needed, but the "Scheduled run push target" row has a `Default` (B) that differs from its `Recommended` (A) without saying which the plan should build. Spell out that B is the build default.
9. **Hot-spot figure:** name a threshold for `outcome.context.byAgent` on `bkit-utility-update-brain` that triggers splitting the batch, since the design says "watch" it without a trigger.

## OUT OF SCOPE

- Server-side telemetry, dashboards or paging for brain health: bkit has none (`docs/observability.md` § Scope), and this design should not add it.
- Observability for the optional qmd template (model download, index freshness): opt-in and off by default; its README can carry troubleshooting.
- Retiring the stubs and the legacy alias: already declared out of scope; the retirement release should then add a log line counting alias uses so the removal is evidence-based.
- Transcript or chat-history recall, `.bkit/issues.jsonl` rows joining the brain, and friction/stats ledgers.
