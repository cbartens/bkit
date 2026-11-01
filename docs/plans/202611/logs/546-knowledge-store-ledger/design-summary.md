Verdict: CONCERNS
Failures: 0
<!-- verdict:end -->

# Design Summary

## Verdict

CONCERNS

- design-review CONCERNS
- design-spike FAIL, answered by design-apply-review
- design-organise CONCERNS
- 2 deferral(s) written this run

## Steps

<!-- prettier-ignore -->
| Step | Verdict | Failures | Attempts | Artifact |
| --- | --- | --- | --- | --- |
| design-start-workflow | - | - | 1 | - |
| design-worktree-setup | - | - | 1 | `docs/plans/202611/logs/546-knowledge-store-ledger/design-input-1.md` |
| design-grill | - | - | 1 | `docs/plans/202611/logs/546-knowledge-store-ledger/design-grill-1.md`, `docs/plans/202611/logs/546-knowledge-store-ledger/design-input-1.md` |
| design-brainstorm-ideate | - | - | 1 | `docs/plans/202611/logs/546-knowledge-store-ledger/design-brainstorm-ideate-1.md`, `docs/plans/202611/logs/546-knowledge-store-ledger/design-brainstorm-ideate-2.md`, `docs/plans/202611/logs/546-knowledge-store-ledger/design-brainstorm-ideate-3.md` |
| design-generate | - | - | 1 | `docs/plans/202611/logs/546-knowledge-store-ledger/design-v1-draft.md` |
| design-review | CONCERNS | - | 1 | `docs/plans/202611/logs/546-knowledge-store-ledger/design-review-1.md`, `docs/plans/202611/logs/546-knowledge-store-ledger/design-review-2.md` |
| design-spike | FAIL | - | 1 | `docs/plans/202611/logs/546-knowledge-store-ledger/design-spike.md` |
| design-apply-review | PASS | - | 1 | `docs/plans/202611/logs/546-knowledge-store-ledger/design-v2-reviewed.md` |
| design-organise | CONCERNS | - | 1 | `docs/plans/202611/logs/546-knowledge-store-ledger/design-v3-organised.md` |

## Suggested Plans

### P-1: Brain Merge, Envelope and Links (#795 with #792)

Covers: WS-1 (Codec and Envelope), WS-2 (Brain Module Core and Path Registries), WS-3 (Merge Migration and Install / Upgrade Integration), WS-4 (`bkit brain` CLI Noun and Logging Contract), WS-5 (Engine and Script Readers Moved to Kind-Filtered Reads), WS-6 (Shipped-Text Path Sweep, Doc Indexes and Old-Path Audit)
Requires: []

### P-2: Loading Rows by File (#791)

Covers: WS-7 (`bkit brain context` and the Recall Log), WS-8 (Prompt and Rule Switch to File-Scoped Loading)
Requires: [P-1]

### P-3: Keyword Search (#793)

Covers: WS-9 (`bkit brain search` and Search-Based Readers)
Requires: [P-1, P-2]

### P-4: Brain Update

Covers: WS-10 (Fold Rank, Recall Date and Suggestion Identity), WS-11 (`bkit brain update` Engine Verb, Reports and Rejections), WS-12 (Brain Update Prompt and Procedure Doc), WS-13 (Scheduled Brain Update Job Template)
Requires: [P-1, P-2]

### P-5: qmd Search-by-Meaning Template (#794)

Covers: WS-14 (qmd Search-by-Meaning Template)
Requires: [P-1]

## Open Questions

- **Q7, always-loaded summary (Open):** what goes in it and its cap. Options: A) current `summary`, `knowledge` and `assumption` rows with no path in `references`, capped at 2,000 tokens — cheapest, relies on path overlap reaching 92% / 96% of rows (spike C5a) · B) key + summary of every current `knowledge` and `assumption` row, capped at ~6,000 tokens — broader safety net, three times the cost and grows with the ledger · C) nothing always-loaded — cheapest, but pathless gotchas reach an agent only by search. Recommended: A — it covers exactly what path matching cannot, and plan 2 re-sets the number from the three-task measurement. Default if unanswered: A.
- **Q6 departure, links in the rewrite:** confirm that backfilled links ride the one-time envelope rewrite. Options: A) rewrite — deterministic, no added lines · B) Q6 as stated, appended rows — each branch that upgrades mints different rows, union keeps both, ~650 extra lines and inflated `updates`. Recommended: A — Q13 already rewrites every line once. Default if unanswered: A.
- **Backfilled link type:** exact-key references carry no meaning beyond "cites". Options: A) `relatedTo` — safe, the premise check stays quiet until brain update upgrades links · B) `dependsOn` — check live at once, but citations of superseded rows flood it with false alarms · C) no backfill, brain update proposes every link — departs from Q6 and loads the first run with ~150 suggestions. Recommended: A — correctness over early coverage. Default if unanswered: A.
- **Q13 interpretation, flat per-kind fields:** confirm "per-kind body" means the per-kind field set. Options: A) flat fields beside the envelope — no reader rewrites · B) nested `body` object — clean structural boundary, but rewrites `bkit stats`, triage, decisions pending, the roadmap render and the audit templates for no new capability. Recommended: A. Default if unanswered: A.
- **Q26 interpretation, command scope:** Options: A) brain-row verbs under `bkit brain`, bookkeeping and friction / stats under `bkit ledgers`, alias for old `--ledger` names — no broken pre-upgrade worktrees · B) every `ledgers` verb under `brain` — one noun, but `brain` then also names non-brain files · C) option A without the alias — simpler, but a pre-upgrade worktree's prompts fail their appends with exit 8. Recommended: A. Default if unanswered: A.
- **Stubs left in `docs/`:** a visible layout change. Options: A) zero-byte stubs, retired by a later release-range sweep — no lost rows · B) delete the files, as #795's body says — modify/delete conflicts, rows dropped by the usual "keep the deletion" fix · C) keep full read-only copies for a release — every row lives in two files. Recommended: A. Default if unanswered: A.
- **Scheduled run push target:** Options: A) the scheduled cloud job commits cleanup and the report straight to `dev` — matches Q17, uses the push access `bkit-cloud.yml` jobs already hold · B) the scheduled job commits nothing and uploads the report as a run artifact — no push from CI, cleanup waits for the next chat run · C) a local launchd / cron recipe on the owner's machine instead of CI — no CI credentials, but tied to one machine. Recommended: A — the template already pushes for `/bkit-auto` runs. Default if unanswered: B, because a push from CI is a publishing action the owner has not approved for this job. The plan builds B; A's push rules (merge `origin/dev`, one retry, never force) ship only once the owner picks A.
- **Brain update orchestration home:** where the multi-step loop (engine step, per-cluster dispatch, report, apply) lives. Options: A) a procedure doc `.bkit/brain.md` § Brain Update plus a dispatch plan printed by `bkit brain update` — no change to the five-workflow machinery, followed the same way by chat and CI · B) a sixth workflow `.bkit/core/workflows/bkit-brain.md` — gets status rows, close and telemetry for free, but needs an FID-less path through `WORKFLOWS`, the router and `/bkit-auto` · C) the engine prints the full step list with no doc — one source, but agents then read instructions from command output instead of an indexed doc. Recommended: A — brain update has no FID, phase or close, and the doc is reachable from `.agents/docs.md`. Default if unanswered: A.
- **qmd index location (spike C9, unsettled):** whether `qmd init` writes its SQLite index under the project's `.qmd/` or under the user's cache. The spike installed `@tobilu/qmd@2.8.3` but running its binary was refused by the permission system. Options: A) the template's install steps add a `.qmd/` gitignore line regardless — safe whatever qmd does, at the cost of one line that may be unneeded · B) the owner allows running the binary in a scratch project with `HOME` pointed at a scratch folder, and plan 5 adds the line only if the index appears there — exact, but blocks plan 5 on a permission · C) point qmd's index at `tmp/bkit-brain/qmd/` through its config — keeps everything under one gitignored folder, but qmd's support for that is unverified. Recommended: A — "nothing binary committed" must hold for a consumer who runs `git add -A`, and the line costs nothing. Default if unanswered: A. Limited to plan 5.
- **`FADED` status and the 180-day window:** Options: A) `FADED`, 180 days, recall written when over 90 days stale — few writes, slow fade · B) the same with 90 days — faster pruning of the always-loaded and context sets, more recall writes · C) a `bkit.brain.fade.days` setting — tunable, one more knob. Recommended: A — re-derive from the first real brain update's fade list. Default if unanswered: A.
- The stub union result ("ours emptied, theirs appended") is settled by the spike (C1): the old lines come back with the appended ones under all three merge shapes. Readers drop the old lines by identity and `ts`, and a second migration run over refilled stubs is byte-identical (C3); plan 1's first task keeps the fixture as a regression test.
- Recall-log races: appends from other worktrees can still race the roll-up's rename in a sub-second window, losing a few recalls. The cost is a fade proposed one run early, which the owner sees in the report under `ask: true`.
- Mixed-version reads: a pre-upgrade worktree's engine, or an older bkit, reads empty stubs and reports zero rows with no error. Writes are covered by the legacy alias; reads are not, and `docs/migrations.md` records the merge as one-way.
- Scheduled-run failure: a red run carries a `[bkit-brain] scheduled run failed` line, and a schedule that stops silently surfaces as the 30-day staleness finding in `bkit brain check`, which nobody runs automatically.
- The migration is deterministic per line except one rare case: a line citing a key that exists only on one branch gets a `relatedTo` link there and not on the other. Union then keeps both versions with equal `ts`, and the later line wins; the only effect is one missing or extra `relatedTo`, which `check` reports as a duplicate-`ts` finding.
- Plan 1 is large (codec, migration, alias, sweep, check). It is the owner's settled order (Q27); the plan should split it into task groups that each leave `dev` green.
- Consumer scripts using the `jq` write idiom keep writing old-shape rows to old paths; the stubs absorb them, and `.bkit/jsonl.md` § Write Idiom must change in the same release.
- Kind transitions change lineage: `firstTs` / `updates` cover both lives of an entry. Readers that count a kind must use the winner's kind, which plan 1 tests against `bkit stats`.
- Brain update's peak context is the new hotspot; `outcome.context.byAgent` for `bkit-utility-update-brain` is the figure to watch against the 160,000-token line, and a dispatch over 120,000 tokens halves its cluster's next batch.
- Success Criterion 1 depends on three recorded tasks chosen before plan 2 changes any prompt, so the "before" figure is not taken after the fact.

## Risks and Action Items

None

## Recommended Next Step

```text
File the Suggested Plans issues, then /bkit-plan <first root plan's new issue>
```

Or, to address the reasons first: `/bkit-design #546`
