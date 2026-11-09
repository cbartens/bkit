<!-- bkit:anchor
baseSha: deb8b25b5a2b79bc47d28fadec46f8f80ab964ce
baseRef: origin/dev
bkitVersion: 6.0.0
bkitLatest: 6.0.0
-->

Verdict: PASS
<!-- verdict:end -->

# Design: Brain — one knowledge ledger with typed links, file-scoped loading, keyword search and brain update

## Related Issues

- [#795 — Merge the four docs/ ledgers into docs/brain.jsonl with a migration](https://github.com/cbartens/bkit/issues/795)
- [#792 — Typed supersedes and dependsOn links plus a dead-premise check](https://github.com/cbartens/bkit/issues/792)
- [#791 — bkit brain context: load only the rows that touch the task's files](https://github.com/cbartens/bkit/issues/791)
- [#793 — bkit brain search: keyword search over the current brain rows](https://github.com/cbartens/bkit/issues/793)
- [#794 — qmd template: opt-in search by meaning over the brain rows](https://github.com/cbartens/bkit/issues/794)
- [#797 — bkit brain update: update, cleanup, compaction, and fading](https://github.com/cbartens/bkit/issues/797)
- [#710 — Ledger compaction: drop superseded rows, preserve age](https://github.com/cbartens/bkit/issues/710)
- [#867 — Review and adopt Claude-Mem patterns](https://github.com/cbartens/bkit/issues/867)

The six delivery children are consolidated into the parent plan and closed as not planned separately; their scope remains here. Ledger compaction supplies the existing foundation. The Claude-Mem review informs the summary-first retrieval contract.

## Acceptance Scenario

Built from the input's `Draft Acceptance Scenario` (accepted in Q29). Changes against the draft are recorded as `Decisions` rows D-AS1 to D-AS5.

### Narrative

Before I change some files, my agent receives capped summaries of entries associated with those files and general pathless entries. It selects relevant keys, fetches their complete current entries and reads them before editing. Search also matches full entries but returns summaries first. When I replace, close or falsify a row, the append prints every current row that rested on it, and `bkit brain check` lists all of them whenever I ask. On demand or on an opt-in schedule, brain update tidies the brain, re-tests rows against the code, proposes links, summaries, contradiction fixes, pattern rows and fades, and, depending on `bkit.brain.update.ask`, either offers them to me for approval or applies them and lists what it applied.

### Success Criteria

1. On the same three recorded tasks, the total pre-code read costs fewer characters / 4 than reading every current knowledge row. Count all context previews, selection handoffs and fetched details, including retries; also compare with the planned full-row context baseline. Every relevant entry in the fixture is read completely before the first edit. No shipped rule, prompt or doc index substitutes summaries for applicable facts or directs a whole-ledger read.
2. `bkit upgrade` turns the four ledgers into `docs/brain.jsonl` envelope rows with no distinct source line lost. Migration and cleanup deduplicate only equivalent normalized content; divergent rows with equal identity and timestamp remain recoverable and visible as conflicts after repeated cleanup and compaction. Source deletion follows durable destination verification, with recovery after interruption at every publication boundary. Running migration twice, or on two branches from the same base, gives byte-identical output. Fold winners (under the new identity), the whole `.bkit/stats.md` render (each reader filtered to the kinds it read before) and the `docs/roadmap.md` render are unchanged.
3. Every link is followed by a tool: a `SUPERSEDED` row's successor is found through the reverse of `links.supersedes`. Superseding, closing or falsifying a row prints every current row whose `links.dependsOn` names it, at write time and in `bkit brain check`. A `SUPERSEDED` row with no successor link is listed as a check finding.
4. Keyword search ranks complete current entries through Node-only `ledgerScan`, then returns summary previews with kind filters. Description-only matches remain discoverable. Context and agent-facing list output use the same preview fields; `get` retrieves complete selected entries by key. Previews record no recalls. Machine readers retain full kind-filtered data, and qmd remains opt-in. Writers check summary accuracy against the entry on creation/update; maintenance reviews and repairs weak summaries through the existing approval procedure.
5. With `ask: true`, brain update changes nothing beyond mechanical cleanup without owner approval, and a rejected suggestion is not offered again until one of its target versions changes. With `ask: false`, it applies the same changes directly and lists each one in its run report. All local brain writes share a short write lock; two concurrent runs never apply one change twice, no cleanup loses an append, and a chain of brain-update rows never gains priority over unseen newer content. Every applied change has a validated undo that preserves history and refuses a changed target.

### Key Edge Cases

- **Weak summary or changed entry:** if a preview cannot establish irrelevance, fetch the details. Compare the preview version with the fetched version and reassess changed content. Missing, terminal or conflicting entries are explicit unresolved results, not empty success.
- **Summary creation and maintenance:** an author checks the summary against the complete entry before append, including its conditions and exceptions. A deterministic first-sentence fallback preserves legacy compatibility but does not certify semantic accuracy. Maintenance proposes corrections through normal same-key writes.

- **Pre-upgrade branch:** a branch opened before the upgrade appends old-shape rows to `docs/knowledge.jsonl` after `dev` merged. The zero-byte stub union-merges the branch's lines in, together with the base's old lines: the spike's real-`git` fixture (C1) showed the emptied side does not win under `git merge`, `git merge --squash -X ours` or the reverse merge, with no conflict. Readers fold `[docs/brain.jsonl, the four stubs]` and deduplicate only equivalent normalized full content. The next brain update moves every distinct line durably into the brain, verifies it there and empties the stub under the shared write lock. Destructive cleanup waits until incompatible old writers have been upgraded or quiesced. When the migration found no unmerged branch or worktree touching the old files, it deleted them instead; a branch that appears later and still appends to one hits a modify/delete conflict, which bkit's ledger conflict resolution settles by keeping the branch's file. Readers fold it, `bkit brain check` reports it, and the next brain update moves its lines into the brain before deleting it again. A pre-upgrade worktree whose prompts still call `bkit ledgers append --ledger=knowledge` through the upgraded engine is refused with exit 8 and a message naming `bkit brain append`; nothing is written.
- **Migration run twice or on two branches:** the migration is a pure line-by-line function of its input, so both sides produce identical lines and union keeps one copy.
- **Same key in two old files** (none in this repo today): the row with the earlier first `ts` keeps the key, and the other becomes `{key}-{oldkind}` with a `relatedTo` link to it. The same rule maps later stragglers of that old kind.
- **Kind change off the allowed list** (e.g. `decision` → `deferral`): refused with exit 8, nothing written.
- **Bad links:** a link names a key that does not exist, or `dependsOn` links form a loop. `bkit brain check` reports both and never crashes or recurses without bound.
- **Concurrent brain updates:** AI analysis runs outside the shared write lock. Each apply acquires it, rechecks exact target fingerprints and prior suggestion ids, then appends before releasing it. A second identical apply skips as already applied. Cleanup and all other writers use that same lock through publication. Locks serialize writes to the same physical store; separate Git branches reconcile through proposal provenance and conflict preservation.
- **Chained proposals:** base content at `ts=10`, proposal P1 at `ts=100` and P2 based on P1 at `ts=200` all retain content-generation rank 10. Unseen branch content C at `ts=50` wins after every merge order, before and after compaction; P2's expected-version fingerprint still names P1 exactly.
- **Undo:** undoing an applied kind change restores the previous kind through the dedicated validated restore operation, without opening normal append to reverse transitions. Undoing a created row appends `WITHDRAWN`. A changed current fingerprint or missing verified restore evidence refuses the undo with no write.
- **Divergent duplicate version:** equal `(repo, key, ts)` with different normalized content preserves both rows and emits a conflict finding. Neither migration nor compaction silently picks one for deletion; ordinary mutation of that unresolved entry is refused until an explicit resolution names all variants.
- **Recall across branches and people:** two branches write different `lastRecalled` dates for one entry. The fold takes the newest date across all of the entry's rows, so a merge never loses a recent recall.
- **Subagent with no shell:** the orchestrator passes context previews to the subagent, receives selected keys, fetches them with `bkit brain get`, then resumes or redispatches it with the complete entries. The subagent reads those entries before editing or completing its review. Summary selection is a read-only handoff; an unresolved detail request prevents dependent edits.
- **Large selection under the clamp:** the reserved pathless previews precede path-selected previews. Both budgets apply to serialized preview bytes. Dropped keys are explicitly not read; agents retrieve potentially relevant dropped entries by key or narrow the query before editing. Detail responses contain complete rows; callers split large selections into batches and resolve host truncation before claiming a read.
- **Older bkit after the migration:** an older bkit, or a pre-upgrade worktree's engine, reads the emptied stubs, or finds the old files gone, and sees zero rows with no error. Recovery is `bkit upgrade` forward or `git revert` of the migration commit; `docs/migrations.md` records the step as one-way.

### Process Sketch

- WHEN an agent starts a task touching files F → THEN it gets pathless previews first and file-matching previews next, selects relevant keys, fetches complete current entries and reads them before editing.
- WHEN an agent browses a kind → THEN `bkit brain list --kind=… --current` returns bounded previews and it fetches relevant keys. Deterministic consumers use `readBrain` or `list --full` to retain complete kind-filtered data.
- WHEN a row is appended as `SUPERSEDED`, `CLOSED` or `FALSIFIED` → THEN the append prints the current rows whose `dependsOn` names it, and `bkit brain check` lists them too.
- WHEN `bkit upgrade` runs on an old install → THEN the four ledgers are copied durably into `docs/brain.jsonl` envelope rows and exact-key references become `relatedTo` links. After full-content verification and legacy-writer quiescence, the old files become zero-byte stubs when an unmerged branch or worktree touches them and are deleted otherwise; until quiescence, full sources remain. The fold result is unchanged.
- WHEN a pre-upgrade branch lands rows in a stub, or brings a deleted old file back → THEN readers still see them, `bkit brain check` reports the file, and the next brain update moves them into the brain.
- WHEN a pre-upgrade worktree runs `bkit ledgers append --ledger=<knowledge|decisions|deferrals|failures>` → THEN it is refused with exit 8 and a message naming `bkit brain append`.
- WHEN brain update runs with `ask: true` → THEN cleanup is applied and a `Suggested Changes` report is written; only approved rows are appended, and rejections are recorded until a target row changes.
- WHEN brain update runs with `ask: false` → THEN the same changes are applied directly and listed in the report.
- WHEN an approved change is undone → THEN `bkit brain undo` verifies its immutable apply evidence and unchanged target under the write lock, then appends a restore or withdrawal event with new provenance.
- WHEN the scheduled run executes → THEN it applies only mechanical cleanup, never an inferred change whatever `ask` says, commits the cleanup and the report to `dev` and pushes, and fails loudly with a `[bkit-brain]` line carrying the CI run id when a step fails.
- WHEN a row is old, has no inbound link and was not recalled by anyone for the fade window → THEN brain update proposes it to fade.

## Reuse & Prior Art

<!-- prettier-ignore -->
| Capability | Prior art | Verdict | Why |
| --- | --- | --- | --- |
| One file for every brain kind | `APPEND_LEDGERS` and `foldFrom(paths)` in `.bkit/core/engine/ledgers/telemetry.ts:386` / `:2012` | `EXTEND` | `foldFrom` already merges several files. The four entries become one `brain` entry taking six kinds, and readers fold `[brain, stubs]`. |
| Identity `(repo, key)` | `identity()` in `telemetry.ts:844` | `EXTEND` | A per-kind-class case: the six brain kinds return `brain {repo} {key}`. `feature`, `friction`, `chat` and `run` keep `(kind, repo, key)`, because FIDs and brain keys often share an issue-number prefix. |
| Allowed kind changes | `KIND_WRITERS` and the writer check in `append` (`telemetry.ts:412`) | `EXTEND` | `KIND_TRANSITIONS` sits beside it and runs in the same pass, with a doc-table parity test like the one `telemetry.test.ts` holds `KIND_WRITERS` to. Dedicated undo validates an exact retained historical version before allowing a reverse transition; normal append keeps the closed list. |
| Serialized brain writes and recoverable cleanup | Existing bkit lock ownership primitives and temp-file publication | `EXTEND` | A common short write lock covers all mutation paths for a physical store; destination durability and exact-content verification precede source deletion. AI work remains outside the lock. |
| Validated undo | Existing append validation, writer authorization and audit report evidence | `EXTEND` | A dedicated verb restores verified retained history, checks the current fingerprint and mints new event metadata; it never pipes an old output row back into normal append. |
| Envelope (`status`, `summary`, `links`) | `.bkit/jsonl.md` § Generic Fields; `normalize()` and `validate()` in `telemetry.ts` | `EXTEND` | `summary` already exists (required on `knowledge` / `decision`, optional elsewhere). `links` is an optional addition that § Versioning tolerates, so `schema` stays `3`. |
| `assumption` kind with a required `falsifiedBy` | `validate()` refusing a `deferral` without `reason` | `EXTEND` | The same refusal shape. Plan templates already capture assumptions (`docs/templates/bkit-plan.md:104`), so the writers gain a place to put them, not a new way to write them. |
| `summary` kind | The same codec | `EXTEND` | A sixth brain kind with `relatedTo` links to the rows it summarises; no separate store. |
| Merge migration | `migrateLedgers` / `migrateLedgerText` in `.bkit/core/engine/ledgers/migrate.ts` (the `schema: 2` rewrite and its drop of a union-resurrected copy); called from `.bkit/core/engine/install/modules/core.ts:408` | `EXTEND` | Same install / upgrade path, same idempotence rule, same temp-file-and-rename write. A row in `docs/migrations.md`. |
| `merge=union` on the brain and the stubs | `.bkit/shared/.gitattributes` managed block (`.gitattributes:17-21`) | `EXTEND` | One added line; the four old lines stay for the stubs, and for an old file a late branch brings back. |
| Stub-or-delete check at migration | `git for-each-ref` over local and remote branches, `git worktree list`, and `git merge-base` / `git diff --name-only` as the branch tooling in `.bkit/core/engine/commands/workflow/branches.ts` uses them | `EXTEND` | Lists every branch and worktree not merged into `dev` whose changes touch an old ledger path; any hit keeps the stubs. `.bkit/issues.jsonl` is not the signal: it misses non-bkit and unpushed branches and counts every designed-but-unbuilt feature as in flight. |
| Link graph, dead-premise list, cycle and dangling-key detection | None. Searched `telemetry.ts`, `ledgers.ts` (its `check` verb checks plan-named rows only), `context.ts`; the input's survey rejected TMS, Graphiti and ADR tools as dependencies | `NEW` | No link resolver exists. A reverse index over fold winners plus an iterative walk is a few dozen lines in `.bkit/core/engine/ledgers/brain.ts`, on top of the existing fold. |
| `bkit brain check` | `bkit ledgers check --plan` in `.bkit/core/engine/commands/workflow/ledgers.ts` | `EXTEND` | Moves under `brain`; `--plan` keeps its exit code `EXIT_ROWS_MISSING`; plain `check` adds the link findings and always exits 0. |
| `bkit brain context --files` | `ledgerScan` and `clampFile(..., "ledger", ...)` in `.bkit/core/engine/commands/workflow/context.ts:438` / `:667`; beads `bd prime` as the shape | `EXTEND` | Reuses the clamp, its "dropped content was NOT read" notice and the artifact plumbing; adds path-overlap selection and a `tokensEst` figure. |
| Keyword search | `ledgerScan` in `.bkit/core/engine/commands/workflow/context.ts:667` (case-insensitive term overlap, strongest first, top 40, truncation notice); `node:sqlite` FTS5 considered | `EXTEND` | `bkit brain search` calls `ledgerScan` unchanged, fed the serialised current `readBrain` winners, with a `--kind` filter applied before the scan. On the seven recorded plan Step 4 lookups, `ledgerScan` over the winners kept all of FTS5 `bm25`'s top 10 on four lookups and missed 1, 2 and 1 on the other three; 4.0% of its kept hits matched only through JSON keys (spike C6). FTS5 has no measured need at ~650 entries (Out of scope). |
| Single-kind reads | `foldFrom([file])` callers that fold one per-kind file: `stats.ts` (deferrals), `bkit context ledger-scan --source=docs/{deferrals,failures}.jsonl` in `bkit-plan.md:293-294` and `bkit-ship.md:481`, `bkit-audit-deferrals.md:37`, `bkit-utility-update-roadmap` | `EXTEND` | `readBrain(root, {kinds, current})` and `list --kind= --full` preserve complete winners for deterministic consumers. Agent readers use kind-filtered previews then selected full details. Without the filter, `bkit stats` on the brain adds `decision`, `failure` and `knowledge` rows to its Kind table and moves the `utility` Workflow count from 81 to 563; with it, the report is byte-identical (spike C4b). |
| Brain update, deterministic half | `compactLedgerText` in `.bkit/core/engine/ledgers/compact.ts` | `EXTEND` | Compaction becomes its cleanup step; adds straggler moves, recall roll-up, fade candidates and the check. |
| Brain update, inferred half | `.bkit/core/prompts/bkit-utility-update-{knowledge,decisions,deferrals,failures}.md` | `EXTEND` | Their per-kind steps merge into one `bkit-utility-update-brain` prompt; the `Cross-Ledger Impact` sections disappear because there is one file. |
| `bkit.brain.update.ask` | `readBkitConfig` in `.bkit/core/engine/shared/settings.ts`; `ASK_POINTS` / `AskSetting` (`:80` / `:92`) as the shape it borrows | `EXTEND` | A new `BkitConfig` field read by `readBkitConfig`, not an `ASK_POINTS` entry: `AskSetting` also carries `max`, and points are `<workflow>.<point>`, while brain update has no `max` and is no workflow. |
| Suggested-changes report and approval | Audit reports under `docs/audits/{YYYYMM}/` from `@bkit-audit-generate` | `EXTEND` | Q17 asks for "the way audit findings are"; the report sits beside audit reports. |
| Rejection memory | `APPEND_LEDGERS` codec; `actionHash` / `alreadyDone` in `.bkit/core/engine/ledgers/status.ts` (content-hash dedupe of engine actions) | `EXTEND` | No store of rejected suggestions exists, but the store is one more `APPEND_LEDGERS` entry on the existing codec: a small committed `.bkit/brain-rejections.jsonl` that reuses the content-hash idea. |
| Recall log | Clamp-log append helpers in `ledgers.ts`; the run-scoped gitignored clamp log (`.bkit/workflows.md:368`); gitignored `tmp/**` (`.bkit/shared/gitignore:32`) | `ADAPT` | The same append-a-JSON-line shape under `tmp/`; the file is new. |
| Brain update orchestration | The four `bkit-utility-update-*` prompts, each a single dispatch from a direct chat; `.bkit/core/.bkit/*.md` procedure docs | `EXTEND` | No file owns a multi-step loop (engine step, per-cluster fan-out, report, apply). A procedure doc `.bkit/core/.bkit/brain.md` § Brain Update holds the steps, and `bkit brain update` prints the dispatch plan the procedure follows. |
| Newest `lastRecalled` across an entry | `firstTs` stamping in the fold and in compaction (`.bkit/jsonl.md` § Compaction) | `EXTEND` | Same "computed across the entry's rows" rule, with max instead of min. |
| Scheduled run | `.bkit/templates/.github/workflows/bkit-cloud.yml` (claude-code-action and opencode jobs, credential auto-detect); cron shape of `bkit-trivy.yml` | `ADAPT` | Credential detection and the agent jobs are reused. The `/bkit-auto <phase> <arg>` route is not: its phases resolve against the five workflows (`WORKFLOWS` in `.bkit/core/engine/commands/workflow/worktrees.ts:51`) and its dispatch input requires an issue. A separate opt-in `bkit-brain-update` job prompts the agent to follow `.bkit/brain.md` § Brain Update headless, with no issue; no engine scheduler. |
| Search by meaning | qmd (MIT, Node, FTS5 + sqlite-vec, MCP server); copy-and-own shape of `.bkit/templates/scripts/graphify/` and `serena/` | `EXTEND` | Template only, with a per-row markdown export because qmd treats one file as one document. |
| Ledger path registries | `APPEND_LEDGERS` (`telemetry.ts:386`), `SCHEMA_LEDGERS` (`migrate.ts:15`), `LEDGERS` (`branches.ts:160`), `UNION_PATHSPECS` (`ledgers.ts:104`, globs), `CLOSE_DOCS` regex (`branches.ts:1743`), `.bkit/shared/.gitattributes:17-20`, root `.gitattributes` | `EXTEND` | The literal lists import one set of path constants exported from `brain.ts`, so the old-path audit holds with no exception list. The globs and the regex already match the new files. |
| Old-path regression guard | `.bkit/core/engine/audits/repo/ledger-integrity.test.ts` | `EXTEND` | Added assertions: no non-test engine file other than `brain.ts` names an old ledger path, and no fenced bash block in `.bkit/core/workflows/*.md` and no file under `.bkit/core/docs/templates/` names one. A missed reader otherwise returns zero rows with exit 0: the unchanged engine on the post-upgrade layout drops the whole Deferral discipline section of `.bkit/stats.md` with no error (spike C4b). |
| Old `--ledger=<old>` writes | `ledgersCommand` in `ledgers.ts:671` | `EXTEND` | After the migration, the four brain-kind ledger names are refused with exit 8 and a message naming `bkit brain append`; no alias. |

## Architecture

**Shape:** the brain is one more ledger inside the existing engine (brainstorm 1, Approach A), read and written through one choke-point module (brainstorm 3, Approach A), whose logic is pure functions over the folded row set with thin CLI verbs on top (brainstorm 2, Approach A). JSONL in git stays the only store; every index is a disposable, gitignored cache.

**Components** (each `NEW` traces to a `NEW` row in `Reuse & Prior Art`):

1. **Codec** (`EXTEND` `.bkit/core/engine/ledgers/telemetry.ts`):
   - `APPEND_LEDGERS`: the four entries become `brain: { file: "docs/brain.jsonl", kinds: ["knowledge", "decision", "deferral", "failure", "assumption", "summary"] }`, plus `rejections: { file: ".bkit/brain-rejections.jsonl", kinds: ["rejection"] }`.
   - `identity()`: the six brain kinds return `brain {repo} {key}`; every other kind keeps its tuple.
   - `validate()`: envelope rules, `assumption` requires `falsifiedBy`, `links` values are arrays of key strings.
   - `KIND_TRANSITIONS` beside `KIND_WRITERS`, checked in the same `append` pass.
   - `fold()`: proposal rows rank at their inherited `proposal.contentBase.ts`, with event order only within the same content base; `proposal.expectedVersion` identifies the exact row used for stale checks. Content base is inherited unchanged through proposal chains and retained by compaction. `lastRecalled` on the winner is the newest value across the entry's rows (the `firstTs` pattern, with max). These additions are inert on today's rows (spike C2: 0 of 885 lines carry `proposal`, `lastRecalled` or `links`). Property tests cover the base/P1/P2/C counterexample, merge orders and compaction. Divergent same-version rows stay available to conflict diagnostics and compaction.
   - `KIND_WRITERS` is an exhaustive typed record, so `assumption`, `summary` and `rejection` each gain a writer set (Data Model).
2. **Brain module** (`NEW` `.bkit/core/engine/ledgers/brain.ts`): the only engine file that names an old ledger path.
   - Path constants: `BRAIN_FILE` (`docs/brain.jsonl`), `REJECTIONS_FILE` (`.bkit/brain-rejections.jsonl`) and `STUB_FILES` (the four old paths). Every registry imports them (Boundaries).
   - `readBrain(root, {kinds?, current?})`: folds `[BRAIN_FILE, ...STUB_FILES]` (an absent old file is skipped), normalising old-shape rows into the envelope at read time and deduplicating only equivalent normalized full content. It retains divergent versions for diagnostics; deterministic read presentation never authorizes deleting alternatives. `kinds` keeps only winners of those kinds; `current` drops terminal winners.
   - `linkIndex(rows)`: forward and reverse maps for `supersedes`, `dependsOn` and `relatedTo`.
   - `dependentsOf(keys)`, `checkFindings(rows, now)`: dead premises, dangling keys, `dependsOn` cycles (iterative walk with a visited set), passed `validUntil`, `SUPERSEDED` rows without a successor link, stale proposals, same-identity rows with equal `ts` but different content, malformed and old-shape counts per source file.
   - `selectForFiles(rows, files)` and `alwaysLoaded(rows)`: path-overlap selection and capped previews; shared projection and exact-key helpers reuse full canonical rows.
   - `suggestionId(action, targets, payload)`: the deterministic id brain update and `append` share.
3. **Search** (`EXTEND` `ledgerScan` in `.bkit/core/engine/commands/workflow/context.ts`): rank serialized full `readBrain` winners with the existing term-overlap/top-40 behavior, then project selected rows to previews. Full content remains local until a key-selective `get`; no index or new dependency.
4. **Merge migration** (`EXTEND` `.bkit/core/engine/ledgers/migrate.ts`): `mergeIntoBrain(root, dryRun)`, called from `.bkit/core/engine/install/modules/core.ts` right after `migrateLedgers`; it imports the path constants from `brain.ts`. The caller acquires the shared write lock before either function reads or mutates old ledger sources and passes the ownership token through both, so the earlier schema rewrite cannot bypass the mutation protocol.
5. **CLI** (`EXTEND` `.bkit/core/engine/commands/workflow/ledgers.ts`; the plan may split the `brain` noun into a sibling file): `bkit brain append|check|compact|context|get|list|search|undo|update`, logging on stderr under the `[bkit-brain]` prefix (§ Logging and counters). Every brain, rejection and restore write enters the shared short write-lock protocol. `bkit ledgers` keeps `commit`, `union`, `only-bookkeeping`, `triage` and `append --ledger=friction|stats`. Once `docs/brain.jsonl` exists, `append --ledger=<knowledge|decisions|deferrals|failures>` is refused with exit 8 and the `[bkit-brain]` line naming `bkit brain append`; nothing is written. There is no alias.
6. **Brain update prompt** (`EXTEND`, from the four updaters): `.bkit/core/prompts/bkit-utility-update-brain.md`, replacing `bkit-utility-update-knowledge`, `-decisions`, `-deferrals`, `-failures`. `-roadmap`, `-tracker`, `-documentation` stay.
7. **Brain update procedure** (`EXTEND`, a new `.bkit/core/.bkit/brain.md`, mirrored to `.bkit/brain.md`, with a row in `.bkit/core/.agents/docs.md`): § Brain Update holds the orchestration steps a direct chat or the scheduled job follows (Components / Flows, Brain update). `bkit brain update` prints the dispatch plan as its stdout object: one entry per path cluster with its packet path, so the procedure never reconstructs the batches.
8. **Local files** (`ADAPT`, gitignored under the main checkout's `tmp/bkit-brain/`, resolved through `git rev-parse --git-common-dir` so a deleted worktree loses nothing): `recall.jsonl` and the `update-{run}/` packets. Every file there is safe to delete; the next `get` call or brain update recreates what it needs.
9. **Committed file** (`EXTEND`): `.bkit/brain-rejections.jsonl`, `merge=union`.
10. **Templates** (`EXTEND`): an opt-in `bkit-brain-update` job with a `schedule` trigger in `.bkit/templates/.github/workflows/bkit-cloud.yml`; a qmd template at `.bkit/templates/scripts/qmd/` (export script, `.qmd/index.yml`, README section in `.bkit/templates.md`).

**Boundaries and integration points:**

- **One door for reads:** prompts, rules and docs discover entries through `bkit brain context` (by files), `search` (by full text) or `list` (by kind), then read selected complete entries through `get` before acting. `check` supplies diagnostics. Each single-kind reader moves to a kind filter, not to a bare rename to `docs/brain.jsonl`, which would mix every kind into its result:
  - `bkit-plan.md:293-294` and `bkit-ship.md:481` (`bkit context ledger-scan --source=docs/{deferrals,failures}.jsonl --terms=…`) → `bkit brain search "<terms>" --kind=deferral` / `--kind=failure`.
  - `bkit-audit-deferrals.md:37` ("Fold `docs/deferrals.jsonl`") and `bkit-utility-update-roadmap` (open deferrals and failures) → `bkit brain list --kind=deferral,failure --current`.
  - The six prompts that carry "Check gotchas first" (`bkit-build-plan-execute`, `bkit-debug-failure-diagnose`, `bkit-plan-review-1`, `bkit-plan-review-2`, and the updaters that become `bkit-utility-update-brain`) and `.bkit/core/.agents/rules.md:116` switch to `bkit brain context --files=…`. The four ledger rows in `.bkit/core/.agents/docs.md` become one `docs/brain.jsonl` row that says to read it through those commands.
- **One door for engine code:** a repo audit test fails when a non-test engine file other than `brain.ts` contains an old ledger path, or when a fenced bash block in `.bkit/core/workflows/*.md` or a file under `.bkit/core/docs/templates/` does. Today 10 engine source files name them (`cli.ts`, `migrate.ts`, `telemetry.ts`, `stats.ts`, `challenge.ts`, `workflows.ts`, `context.ts`, `ledgers.ts`, `decisions.ts`, `branches.ts`). Each reader moves to `readBrain` with a `kinds` filter equal to the kinds it read before; a writer moves to the `brain` ledger entry. `stats.ts` passes only `deferral` winners to `runAnalysis`, and plan 1 pins the whole `.bkit/stats.md` render before and after the merge (spike C4b).
- **Ledger path registries:** each literal list imports the `brain.ts` path constants instead of naming paths.

<!-- prettier-ignore -->
| Registry | Gains `BRAIN_FILE` | Gains `REJECTIONS_FILE` | Keeps `STUB_FILES` | Why |
| --- | --- | --- | --- | --- |
| `APPEND_LEDGERS` (`telemetry.ts:386`) | yes (`brain` entry) | yes (`rejections` entry) | no | Writers append only to the brain; the engine writes no row to an old path, and `--ledger=<old>` is refused. |
| `SCHEMA_LEDGERS` (`migrate.ts:15`) | yes | yes | yes | `isSchemaLedger` must stay true for every data file, or `mergeCanonicalHashes` (`.bkit/core/engine/install/version-file.ts:189-197`) records a canonical hash for the migration's write. |
| `LEDGERS` (`branches.ts:160`) | yes | yes | yes | Conflict resolution by union; dropping the stubs turns a pre-upgrade branch's stub lines into a blocking conflict. A modify/delete conflict on an old path (deleted on `dev`, appended on the branch) resolves by keeping the branch's file, so its rows reach the brain at the next brain update. |
| `.bkit/shared/.gitattributes` managed block and root `.gitattributes` | yes | yes | yes | `merge=union` on every ledger file; the spike's control merge without it conflicts (C1, scenario D). |
| `UNION_PATHSPECS` (`ledgers.ts:104`), `CLOSE_DOCS` (`branches.ts:1743`) | already matched | already matched | already matched | Globs `docs/*.jsonl` / `.bkit/*.jsonl` and the regex cover the new files with no edit. |

- **Install / upgrade:** `mergeIntoBrain` runs in the normal write path, dry run computes the same writeset, and a row goes in `docs/migrations.md`. The caller acquires the shared lock before the preceding `migrateLedgers` schema migration as well as `mergeIntoBrain`, reusing the same ownership token throughout. No destructive old-source rewrite, including schema normalization, runs before incompatible writers are upgraded or quiesced; with unproven quiescence, normalize old rows in memory for the durable brain copy and leave original source bytes intact. The mutation protocol below covers the entire read-to-publication interval. Write order:
  1. Build the complete destination from a fresh locked read, preserving every distinct normalized source row and every malformed source line. Write a uniquely named temporary brain file, flush it, rename it into place and flush the containing directory. Publication failure leaves sources intact and exits non-zero.
  2. Re-read the published brain and verify complete normalized-content membership for every source row and exact-byte retention for malformed lines. Keep all equal-identity/timestamp variants. Add the `.gitattributes` lines.
  3. Establish that old engines and direct-file writers have upgraded or been quiesced. The branch/worktree inventory decides stub retention, not writer liveness. If writer quiescence cannot be established, keep the full source files, report deferred destructive cleanup and exit without truncating or deleting them; readers already union them safely. Otherwise run the stub-or-delete check: list every local branch, remote branch and worktree not merged into `dev` whose diff against its merge base with `dev` changes an old path. Any hit → truncate the four files to zero bytes and keep them. No hit → delete them. Flush changed source directories before success. Log `[bkit-upgrade] old ledgers {kept as stubs: {n} unmerged branches touch them | deleted: no unmerged branch touches them}`.
  - **Crash between steps:** sources stay intact until the destination is durable and verified. A crash after destination publication leaves exact duplicates beside the brain; restart deduplicates equivalent content and completes only the remaining verified operations. A crash after any subset of source removals is safe because every removed source was already verified in the durable destination. Unresolved divergent versions are retained through subsequent compaction. A re-run that finds this partial state logs `[bkit-upgrade] brain merge incomplete: {n} old lines already in docs/brain.jsonl; finishing` under the owning module's prefix.
  - **Older bkit after the migration:** it reads empty stubs or absent files and reports zero rows with no error. Recovery is `bkit upgrade` forward or `git revert` of the migration commit. `docs/migrations.md` records the merge as a one-way step, because an older engine cannot see the brain and no version-side check is feasible in an engine that predates it.
  - The same function is the straggler mover that brain update calls. `bkit check` counts an old ledger with content and no `docs/brain.jsonl` beside it as a pending write (drift, exit 1 until `bkit upgrade`), the way § Versioning treats an unmigrated line. An old-path file with content beside the brain (a filled stub, or a deleted file a late branch brought back) is an advisory only (exit 0), with the fix inline: `bkit upgrade` or `bkit brain update`. Readers already see its rows, so nothing is lost while it waits.
- **Close squash** (`.bkit/workflows.md:250`): stays as is. Old paths keep `merge=union`, so a pre-upgrade branch's stub lines union in and its "line the branch added that `origin/dev` lacks" test (exit 18) still holds at landing. Straggler moves happen later, on `dev`, inside brain update.
- **Mutation protocol:** one repository-local lock, resolved under `git rev-parse --git-common-dir`, serializes every supported writer to the brain, stubs, rejection file and shared recall log. It is a write lock, separate from workflow locks, with an ownership token and bounded acquisition. A waiter times out without writing; a live owner is never displaced merely because its lock is old. Reclamation requires proven owner death; unknown ownership is a refusal. A process that loses ownership cannot publish or release another owner's lock. Every append, apply, undo, compaction, migration, recall roll-up and conflict-resolution write acquires this lock before its authoritative read and holds it through durable publication. Nested calls reuse the same ownership token. AI analysis, report drafting and Git network operations run outside the lock. Git operations or legacy tools that write ledger files must be quiesced during a destructive transaction; the lock does not coordinate other clones or arbitrary external writes.
- **Mutation recovery and evidence:** append validation, target-version checks and applied-id checks occur inside the lock. Brain appends are complete newline-delimited records, flushed before success. A partially written final record is retained and diagnosed, never silently truncated by cleanup. Brain compaction retains unresolved divergent variants and the immutable apply/before/restore rows needed to verify every reported undo and applied suggestion id; those records remain in `docs/brain.jsonl`, while ordinary read commands still return the fold projection. Reports are an index into that retained evidence, not an authority to fabricate restore data.
- **Host parity:** all hosts follow preview → select → fetch → read → edit. Shell-capable agents call `get` themselves. For no-shell agents the orchestrator runs discovery, dispatches a read-only selection request, accepts the selected keys, calls `get`, and resumes or redispatches with the complete entries. Carry the preview and fetched version fingerprints in the handoff; no editing or final review proceeds with unresolved relevant details. Apply this to normal dispatch, resume, no-plan conversion, per-group execution and remediation in plan/build/debug. The shared "Check gotchas first" clause changes through `pnpm instructions:sync`.
- **Mirrors and indexes:** the path sweep (494 mentions of `docs/{knowledge,decisions,deferrals,failures}.jsonl` across 109 files under `.bkit/core/`; 576 mentions across 110 files without the `docs/` prefix) is a bulk mechanical rewrite, then a hand review of every reading instruction. The sweep also covers files outside `.bkit/core/`: `.bkit/shared/docs/{technology,data-schema,deployments}.md`, `.bkit/shared/.gitattributes`, `.bkit/templates/.github/ISSUE_TEMPLATE/bkit-{bug,idea}.yml`, `scripts/harvest/ledgers.ts`, `scripts/readme/readme-art.mjs` and `.github/assets/*.svg`. `scripts/harvest/ledgers.ts` reads both the four-file and the brain layout, because dogfood checkouts upgrade at different times. `.bkit/prompts.md`, `.bkit/workflows.md`, `.bkit/instructions.md`, `.bkit/templates.md`, `.bkit/cli.md`, `.bkit/jsonl.md` and `docs/observability.md` (§ `[bkit-brain]` prefix) change in the same plan as the files they index; `docs/` templates change only the ledger names and read instructions (Q9).

**Out of scope** (declared here; deferral rows reference this list):

- `.bkit/issues.jsonl` `feature` rows joining the brain (Q14: the format allows it later).
- `.bkit/friction.jsonl` and `.bkit/stats.jsonl` (stay separate, Q14).
- Retiring the four stubs where the migration kept them, once no supported install predates the merge.
- Transcript or chat-history recall.
- An FTS5 index for `bkit brain search`, until a recorded lookup shows a ranking gap `ledgerScan` cannot close. The spike settled what that step needs: FTS5 with `bm25` works on official Node 24.0.0, 24.14.0, 24.15.0 and 24.16.0 and on Alpine, Fedora and Debian builds that link the system SQLite (C7, C8). Node 24.0 to 24.14 print an `ExperimentalWarning` on import, so the step either raises `engines.node` to `>=24.15` or installs a `process.emitWarning` filter before a dynamic `import("node:sqlite")` (a static ESM import is hoisted above the filter). Its probe is `CREATE VIRTUAL TABLE t USING fts5(x)` on `:memory:`, and its fallback keys on the message `no such module: fts5`, not on `errcode` (a missing module raises the generic `1`). Its fallback logs `[bkit-brain] search fallback: {reason}; {fix}` once per process and adds a fallback counter.

## Data Model

**`docs/brain.jsonl` envelope** (`schema: 3`; § Generic Fields stays the top section, the fields below follow it):

<!-- prettier-ignore -->
| Field | Type | Rule |
| --- | --- | --- |
| `kind` | `knowledge` \| `decision` \| `deferral` \| `failure` \| `assumption` \| `summary` | Normal append changes it only along `KIND_TRANSITIONS`; validated undo alone may restore a verified prior kind. |
| `key` | `string` | Unique across the whole brain; identity is `(repo, key)`. |
| `status` | per-kind vocabulary (below) | `bkit brain append` fills the kind's default when absent; the migration fills it the same way. |
| `summary` | `string` | A nonblank, standalone statement of the entry, including its relevant condition and consequence. Authors check accuracy before every write and update it when meaning changes. Append/migration retain the deterministic missing-value fallback: first description sentence, capped at 200 characters. Semantic quality is reviewed, not certified by the fallback or shape validator. |
| `links` | `{supersedes?: string[], dependsOn?: string[], relatedTo?: string[]}?` | Keys only. `supersedes` sits on the new row and names the row it replaces; `dependsOn` names premises; `relatedTo` is undirected "see also" and the premise check ignores it. |
| `references` | `string[]?` | Paths, commits, issues, PRs, as today. Exact-key entries stay in place after the backfill. |
| `lastRecalled` | `number?` | Unix ms at UTC-day grain. Written only by brain update; the fold returns the newest value across the entry's rows. |
| `proposal` | `{id: string, expectedVersion: string\|null, contentBase: {ts: number, version: string}, targets: [string, string\|null][]}?` | Engine-validated brain-update provenance. `expectedVersion` is the exact prior target fingerprint, or `null` for creation; `targets` fingerprints every input entry used by the suggestion. `contentBase` is the underlying non-proposal content generation, inherited unchanged through a chain. The engine derives it from retained evidence rather than trusting a supplied rank. |
| `undo` | `{appliedVersion: string, restoredVersion: string\|null}?` | Engine-only provenance minted by the dedicated undo verb. It identifies the verified applied event and the prior row restored, or `null` for withdrawal of a newly created entry. Normal append refuses caller-supplied `undo`. |
| `resolves` | `string[]?` | An explicitly owner-approved normal resolution row supplies the complete set of full normalized-content SHA-256 fingerprints for the currently unresolved identity. Under the write lock, append validates exact set equality with every conflicting variant; omitted, extra or stale fingerprints refuse the whole append with exit 8. The field and named variants remain retained evidence. |
| per-kind fields | flat, as today | `rationale`, `alternatives`, `severity`, `reason`, `type`, `category`, `rootCause`, `remediation`, `source`, `description` keep their current names and places. |

**Status vocabularies.** "Current" means not in the terminal set `SUPERSEDED`, `CLOSED`, `FALSIFIED`, `FADED`, `WITHDRAWN`. `TRIAGED` is current. `WITHDRAWN` preserves the history of an entry created by an undone operation and is emitted only by validated undo.

<!-- prettier-ignore -->
| Kind | Statuses (default first) | Terminal |
| --- | --- | --- |
| `knowledge`, `decision`, `summary` | `ACTIVE`, `SUPERSEDED`, `FADED`, `WITHDRAWN` | `SUPERSEDED`, `FADED`, `WITHDRAWN` |
| `deferral`, `failure` | `OPEN`, `TRIAGED`, `CLOSED`, `FADED`, `WITHDRAWN` | `CLOSED`, `FADED`, `WITHDRAWN` |
| `assumption` | `ACTIVE`, `FALSIFIED`, `SUPERSEDED`, `FADED`, `WITHDRAWN` | `FALSIFIED`, `SUPERSEDED`, `FADED`, `WITHDRAWN` |

`failure` keeps accepting a free-string `status` as today; an unknown value counts as current.

**New per-kind fields:**

- `assumption`: `falsifiedBy` (required, the concrete observation that would break it), `validUntil?` (unix ms), `description?`. A row without `falsifiedBy` is refused with exit 8.
- `summary`: `description` (the summary text, at most 2,000 characters), `links.relatedTo` (required, the rows it summarises), `references?` (paths of the cluster; a summary with no path is always-loaded).

**Writer sets for the new kinds** (`KIND_WRITERS` rows; decision `ledger-writer-agents-carry-bash` applies, and each listed subagent carries Bash):

<!-- prettier-ignore -->
| Kind | Writers |
| --- | --- |
| `assumption` | `bkit-plan-generate`, `bkit-design-spike`, `utility` |
| `summary` | `bkit-utility-update-brain` |
| `rejection` | `utility` |

**Kind transitions** (`KIND_TRANSITIONS`; normal append refuses any other kind change with exit 8; the dedicated verified undo exception is specified under Components / Flows):

<!-- prettier-ignore -->
| From | To | Status on the new row | Fields dropped |
| --- | --- | --- | --- |
| `failure` (any status) | `knowledge` | `ACTIVE` | `severity`, `category` |
| `deferral` with `reason: "needs-decision"` | `decision` | `ACTIVE` | `reason`, `type`, `severity`, `category` |
| `assumption` `ACTIVE` | `knowledge` | `ACTIVE` | `falsifiedBy`, `validUntil` |

Readers that count a kind (`bkit stats` deferral and failure counts, `bkit ledgers triage`) count entries whose winner has that kind. The deferral-reason rate reads the entry's last row of kind `deferral`, so a transition never erases a verdict.

**Content equivalence and version fingerprints:** normalized full-content equivalence uses canonical JSON with sorted object keys after the deterministic envelope mapping; every field and array value is preserved, including timestamps, links and provenance. `contentFingerprint(row)` is the full SHA-256 of that normalized content and distinguishes every retained variant for `resolves`. Malformed/non-object source lines use exact byte membership instead. Equivalence never means identity plus timestamp. A full SHA-256 `versionFingerprint(row)` identifies the exact event for expected-version checks and undo evidence. It canonicalizes the stored row while excluding only fold-computed aggregates (`firstTs`, `updates`, `lastRecalled`), so compaction and recall aggregation cannot change the identity of an otherwise unchanged event. It includes `ts`, per-kind content, links, author and proposal/undo/resolution provenance. This fingerprint serves version checks; full normalized-content membership separately protects every stored field during destructive drains.

**Proposal content generation:** a normal content event has generation `{ts: row.ts, version: versionFingerprint(row)}`. A proposal inherits the prior winner's `proposal.contentBase` if present, otherwise that winner's normal generation. Creation with `expectedVersion: null` receives a new generation from the engine at its first successful append: its minted `ts` and a full SHA-256 of the canonical creation payload plus that timestamp, computed before adding proposal provenance to avoid a self-referential hash. Subsequent proposals inherit it. Within an identical generation, proposal event order uses engine-minted timestamps greater than the expected predecessor; a normal base precedes its proposals. Compare generation timestamps first, then event order only within an identical generation. Equal generation timestamps with different generation fingerprints, or equal identity/event timestamp with divergent content, remain explicit conflicts; a deterministic read representative is not an authorized resolution. Ordinary mutation of an unresolved identity is refused with exit 8 until an owner-approved same-key resolution names every conflicting fingerprint. That resolution is a new normal content event with a timestamp greater than every named conflict's generation. The same proposal id is one logical application after a branch merge, with all distinct evidence rows retained.

**Evidence retained by compaction:** retain all applied proposal rows, their exact prior target/input versions, and undo/explicit-conflict-resolution events and the versions they name. A create has an explicit absent-target marker. Keep unresolved variants even if one is not the fold's read representative. Retained evidence keeps its original normalized full content, so named `contentFingerprint` values survive compaction; fold aggregates are computed on the read projection rather than overwriting that evidence. This retained closure keeps stale checks, application-id deduplication, conflict resolution and undo verifiable after compaction; it does not add a second data store. Metadata-only recall copies carry engine-generated proposal provenance with the exact prior version and inherited content base, so recall cannot raise content priority; they remain mechanical changes under either approval mode.

**Example row:**

```json
{
  "schema": 3,
  "ts": 1793520000123,
  "firstTs": 1793506639496,
  "updates": 2,
  "kind": "decision",
  "key": "546-brain-identity-repo-key",
  "repo": "cbartens/bkit",
  "bkit": { "version": "6.1.0" },
  "by": {
    "workflow": "plan",
    "step": "plan-generate",
    "subagent": "bkit-plan-generate",
    "model": "claude-opus-5-5"
  },
  "references": ["546", ".bkit/core/engine/ledgers/telemetry.ts"],
  "status": "ACTIVE",
  "summary": "brain rows are identified by repo and key; kind is a field that changes only along KIND_TRANSITIONS",
  "links": {
    "supersedes": [],
    "dependsOn": ["546-jsonl-ledgers-stay-the-store-memory-tools-index-only"],
    "relatedTo": []
  },
  "rationale": "…"
}
```

**Migration mapping** (`mergeIntoBrain`, a pure function of the four files' bytes):

- Input order is fixed: `docs/decisions.jsonl`, `docs/deferrals.jsonl`, `docs/failures.jsonl`, `docs/knowledge.jsonl`. Output order equals input order.
- Each well-formed line maps to one line: fill `status` and `summary` as above; set `links.relatedTo` to the line's `references` entries that exactly equal a key present in the input; keep every other byte of meaning; never mint a `ts`.
- Malformed, blank and non-object lines are copied byte-for-byte.
- A line is dropped only when its complete normalized content is already stored in the brain. Equal identity and `ts` with different content is retained and diagnosed. This follows `migrateLedgerText`'s normalized-line membership rule and makes a second run a no-op without discarding divergent input.
- Collision rule: the same key in two old files → the entry with the earlier first `ts` keeps the key; the other becomes `{key}-{oldkind}` and gains `relatedTo` to the kept key. Later stragglers of that old kind with that key map to the renamed key.
- Afterwards, under the shared write lock and the durable-copy verification order in Boundaries (brain first, sources last), `.gitattributes` gains `docs/brain.jsonl merge=union` and `.bkit/brain-rejections.jsonl merge=union` and keeps the four old lines. Only after incompatible writers are upgraded or quiesced may the stub-or-delete check truncate the four old files to zero bytes and keep them, or delete them when no unmerged branch or worktree touches them. Otherwise it keeps full sources and reports why destructive cleanup was skipped.
- Measured on this repo (spike C2, C3): 885 lines in, 885 out, zero cross-file key collisions, 842 entries with identical winners under both identities, 136 lines gaining `relatedTo` (162 edges), byte-identical output from two separate runs.

**`.bkit/brain-rejections.jsonl`** (kind `rejection`, identity `(kind, repo, key)`): `key` = suggestion id, `summary` = the rejected suggestion in one line, `references` = target keys, `by` = the owner's chat. Because the id hashes every input's exact winner fingerprint, a changed target produces a new id and the suggestion returns; brain update prunes rows whose id no longer matches any open suggestion's inputs under the shared write lock.

**Suggestion id:** first 12 hex of sha256 over canonical JSON `{action, targets: [[key, winnerFingerprintOrNull], …] sorted by key, payload}`. `null` records an expected absent identity. Every input entry the inference used is included, not just the entry it changes; different payloads sharing a shortened id are diagnosed and refused rather than treated as already applied.

**`tmp/bkit-brain/recall.jsonl`** (main checkout, gitignored): one line per key whose complete entry `get` delivers, `{"key": "…", "at": <unix ms>}`, under the same short write lock. Preview commands, deterministic exports and maintenance reads do not record recalls. Delivery is the measurable proxy; the agent must still read the entire delivered entry before editing. Brain update renames it to `recall-{run}.jsonl`, rolls the renamed file up and deletes it under that lock. Writers open their append target after acquiring the lock, so none retains an old descriptor across rename. A recall write that cannot obtain the lock within its bounded wait remains best-effort and logs the existing recall-not-written line; failure to record recall never permits losing brain content.

**Settings** (`package.json`): `bkit.brain.update.ask` (boolean, default `true`), a new `BkitConfig` field read by `readBkitConfig`. The fade window (180 days), the always-loaded cap (2,000 tokens), the `dependents:` print cap (20 rows) and the brain-update staleness window (30 days) are engine constants in `brain.ts`, each with the decision row that records where its number came from.

## Components / Flows

**Build order** (delivery stages in the single parent implementation plan; child issues are scope history, not separate execution):

1. **Merge, envelope, links** (#795 with #792): codec changes, `brain.ts` read and link functions and path constants, the registry imports, `mergeIntoBrain`, the stub-or-delete check, the refusal of old `--ledger` names, `bkit brain append`, `bkit brain check` and `bkit brain list`, the kind-filtered readers (`stats.ts` first), `assumption` and `summary` kinds, `KIND_TRANSITIONS`, the writer-table rows, the path sweep, the widened old-path audit test, the `[bkit-brain]` prefix section in `docs/observability.md`, and the one-way-step note in `docs/migrations.md`. Its first task turns the spike's real-`git merge` fixture of the stub case (base = old content, ours = empty, theirs = old + appended lines; `git merge`, `git merge --squash -X ours` and the reverse merge) into a regression test pinning the measured result: the old lines return with the appended ones, with no conflict. A second early task pins the whole `.bkit/stats.md` and `docs/roadmap.md` renders before and after the merge.
2. **Loading rows by file** (#791): `bkit brain context` previews, the reserved pathless previews, selected full-entry `get` reads before editing, the prompt and rule switch, the no-shell selection/detail handoff, get-only recall logging, and complete retrieval-cost measurement on three recorded tasks.
3. **Keyword search** (#793): `bkit brain search` ranks full current fold winners with `ledgerScan` and `--kind`, returns previews without recalls, and moves the single-kind workflow and template readers onto preview selection followed by full-entry reads.
4. **Brain update**: `bkit brain update` and its dispatch plan, `.bkit/brain.md` § Brain Update, `bkit-utility-update-brain`, `bkit.brain.update.ask`, rejections, recall roll-up, fading, the `proposal` fold rank and its property test, the brain-update counters, the staleness finding, the opt-in `bkit-brain-update` job in `bkit-cloud.yml`, and retirement of the four updater prompts.
5. **qmd template** (#794).

**`bkit brain append --rows=<file|->`:** same contract as `bkit ledgers append` today (fills `schema`, `ts`, `repo`, `bkit.version`, `firstTs`, `updates`; refuses on any bad row, exit 8, nothing written), plus:

- Fills `status` and `summary` when absent; refuses a kind change off `KIND_TRANSITIONS` and an `assumption` without `falsifiedBy`.
- Acquires the shared write lock before its authoritative read, validation and publication. Proposal-id checks and exact expected-version checks are inside that same critical section.
- A normal conflict-resolution row supplies `resolves` through an explicitly requested `utility` owner action; inferred proposal rows, including attended `ask: false` inference, cannot supply it. Validate that its set is exactly the current unresolved variants' full `contentFingerprint` set under the lock; a row without that complete authorization/evidence is refused for an ambiguous identity. Validate all normal schema/writer rules, mint a content generation newer than the named conflicts, and retain the resolution plus every named variant during compaction. A supplied `resolves` on an identity with no matching unresolved set is refused, so it cannot bypass validation.
- A row carrying `proposal`: skipped with `applied` when the retained evidence already carries that id with the same payload and input fingerprints; otherwise skipped with `stale` when any expected input/target fingerprint differs, including absent-target checks. Neither is an error. Ambiguous input versions or a mismatched payload for an existing id are refused with exit 8. The engine verifies/inherits content-generation provenance from retained rows rather than accepting caller-chosen ranking.
- After writing, prints `dependents:` with the current rows whose `links.dependsOn` names a key this append turned terminal, at most 20, then `and {M} more, see bkit brain check` when there are more, so a hub row does not flood an agent's context. Always exit 0 for this reason.

**`bkit brain check [--plan=<file>] [--json]`:** with `--plan`, today's `bkit ledgers check --plan` contract and exit code. Without it, prints the findings from `checkFindings` grouped by type, plus per source file: rows read, malformed lines, old-shape rows normalised, stub lines waiting to move. Exit 0; it is a list for someone to act on, never a gate (Q5). Each finding type prints its fix line:

<!-- prettier-ignore -->
| Finding | Fix line printed | Day-one count on this repo |
| --- | --- | --- |
| Dead premise (current row `dependsOn` a terminal row) | Re-test the row: supersede it, or drop the link with a same-`key` append | 0 (no `dependsOn` links before brain update proposes them) |
| Dangling key | Correct the key, or drop the link | 0 (the backfill links only keys present in the input) |
| `dependsOn` cycle | Drop the link that is a citation, not a premise | 0 |
| Passed `validUntil` | Re-test the assumption: falsify, supersede or extend `validUntil` | 0 (no `assumption` rows yet) |
| `SUPERSEDED` without successor | Append `links.supersedes` on the successor row, or let brain update propose it | 45 (spike C2) |
| Same identity, equal `ts`, different content; or ambiguous equal-ranked content generations | Preserve every variant; append an owner-approved same-`key` resolution naming all conflicting fingerprints | 0 (spike C2) |
| Stale proposal | Re-run brain update; the suggestion is re-offered against the new winner | 0 |
| Brain update stale (newest committed `docs/audits/*/brain-update-*.md` older than 30 days, or none while the brain has rows) | Run brain update from a chat: follow `.bkit/brain.md` § Brain Update | 1 |

### Summary-first read contract

All agent discovery, including pre-code context, returns only `key`, `summary`, `kind`, `status`, `references`, `version` and `detailTokensEst`. `version` is the existing `versionFingerprint` of the full row; these two computed fields belong to the read projection, not the stored schema. `detailTokensEst` is the full serialized row's characters / 4. Descriptions, rationale, remediation and other full fields remain out of previews. `tokensEst` measures actual output characters / 4; omitted keys/counts and continuation guidance remain explicit.

- Authors write a short statement that lets a reader judge relevance without losing the governing condition. Example: `Retry API calls only when idempotency prevents duplicate effects`. Check it against the full content on creation and every substantive update. Presence and one-line shape are mechanical checks; accuracy and usefulness are author/reviewer checks. Preserve historical content during migration and propose improvements through maintenance, rather than silently rewriting it.
- Agents review the previews, including the reserved pathless set, and fetch every applicable entry before editing. If relevance is uncertain or a summary is vague, fetch the entry. Summaries are discovery aids, not sufficient evidence for an edit.
- Compare preview and fetched versions; read and reassess the current content if it changed. Resolve missing, terminal or ambiguous relevant keys before dependent edits. Refresh context when task files or scope change and on resume where earlier detail evidence is unavailable.
- For no-shell agents, use the Host parity handoff. Preserve a small read manifest in the existing task/context artifact: selected keys and fetched versions, pending keys, and the detail artifact paths. It records what must be read and lets verification detect edits preceding relevant detail delivery; it is not a new persistent memory store.

**`bkit brain list --kind=<k>[,<k>…] [--current] [--full] [--json]`:** keep the existing newest-first, kind/current filtering. Default output is the preview projection, capped by the ledger budget with dropped keys and a narrowing/get hint. `--full` retains the complete JSON-line contract for deterministic engine/export consumers that need all rows; agent prompts use previews then `get`, not `--full` as a discovery bypass. List and exports record no recalls.

**`bkit brain get --keys=<comma-list|-> [--all] [--json]`:** read canonical winners through `readBrain`, deduplicate requested keys and return complete rows in request order, with their version fingerprints and output token estimate. Stdin takes a JSON array of keys. Default reads current entries; `--all` explicitly permits terminal winners for historical investigation. Missing, excluded-terminal or unresolved-conflict keys are named individually, exit 1 when any is unresolved; never silently choose a conflicting variant. Resolved keys may still be returned and recalled. No entry is truncated by the command. Callers batch keys using detail estimates and read any host-truncated response completely before editing. Only fully returned rows enter the shared best-effort recall log; `get` does not mutate canonical content.

**`bkit brain context --files=<list|-> [--json]`:**

1. `readBrain`, keep current rows.
2. Normalize references by stripping leading `./`, trailing `/`, `:line` and trailing ` §…` qualifiers.
3. Select rows whose reference equals a file or is a folder above it, at any depth.
4. Rank exact file before folder, nearer folder before farther, then `failure`, `knowledge`, `assumption`, `decision`, `deferral`, `summary`, then newest `ts`.
5. Project candidates to previews. Select pathless current `summary`, `knowledge` and `assumption` previews newest first within the reserved 2,000-token budget. This protects discovery of general facts, not automatic full-body delivery.
6. Emit the reserved pathless previews first, then path previews through the existing ledger clamp in its remaining budget. Deduplicate keys, name omitted pathless/path keys as not read, and provide `get`/narrower-query guidance. Output includes the fetch-before-edit instruction and `tokensEst`.
7. Record no recalls. The agent selects relevant keys and reads their complete `get` results before editing; this includes relevant entries from the pathless set.

**`bkit brain search "<text>" [--kind=<k>[,<k>…]] [--all] [--json]`:** filter canonical winners by current/all and kind, rank their complete serialized text through `ledgerScan`, then project the strongest 40 to previews and apply the output budget. Keep the ranking and truncation notice; a match found only in a description still returns its summary. Name omitted keys/counts and the detail-fetch path. Search records no recalls; relevant details come from `get`. Preserve the candidate key/rank set for parity tests, rather than requiring full bodies in search output.

**`bkit brain compact [--dry-run]`:** compaction over `docs/brain.jsonl` under the shared write lock, using inherited content-generation rank and stamping `lastRecalled` like `firstTs`. It retains unresolved divergent variants and the evidence closure specified in Data Model, including exact prior versions needed for undo and ids needed for already-applied checks. It deduplicates only equivalent normalized full content. Dry run performs no mutation and describes the same retention policy.

**`bkit brain undo --applied=<version-fingerprint>`:** an attended, explicitly requested restore, authorized to the `utility` owner action and subject to the shared write lock. Resolve the immutable applied row and its before-version from retained brain evidence; an audit report may supply the fingerprint but cannot supply authoritative replacement content. Refuse with exit 8 and no write if evidence is missing/ambiguous, the current exact fingerprint differs from the applied event, the application was already undone, or authorization is absent. Run all normal per-kind content/schema checks. Strip prior `schema`, `ts`, `bkit`, `by`, roll-up fields, `proposal` and `undo` from the prior snapshot; mint fresh event metadata, owner attribution and engine-only `undo` provenance. A verified prior kind may be restored through this narrow internal exception to `KIND_TRANSITIONS`; ordinary append cannot invoke it. With no prior row, append a same-kind copy of the created content with terminal `WITHDRAWN`, preserving required per-kind fields and history. Undo is a new intentional content generation and prints affected dependents like append. Retain the applied row and prior row through compaction so this contract does not depend on an editable report or reflog. Tests cover all three allowed kind changes, an ordinary edit, creation, stale targets, forged evidence and compaction before undo.

**Brain update** (on demand from a direct chat, or the opt-in schedule; never inside a design / plan / build / debug / ship run, Q16). The steps below live in `.bkit/brain.md` § Brain Update, which the direct chat and the scheduled job both follow:

1. **`bkit brain update`** (engine, deterministic, always applied as mechanical cleanup):
   - Move stragglers from any old-path file into the brain (normalise, apply the collision map) under the shared write lock and durable-copy verification protocol. Deduplicate only equivalent normalized full content; retain divergent versions. Run the stub-or-delete check only after incompatible writers are upgraded or quiesced: truncate the file when an unmerged branch or worktree still touches the old paths, delete it otherwise. If quiescence is unproven, keep sources full and report skipped destructive cleanup. Log `[bkit-brain] moved {n} stub lines from {file}` per file with stragglers.
   - Compact the brain under the same mutation protocol, retaining unresolved variants, proposal provenance and restore evidence.
   - Roll the recall log up: rename it to `recall-{run}.jsonl`, append a `lastRecalled` row for an entry only when the renamed log's newest date is later than the stored value by more than half the fade window (90 days), then delete the renamed log.
   - Prune void rejection rows.
   - Write a candidate packet to `tmp/bkit-brain/update-{run}/`: the `check` findings, fade candidates (current, `max(ts, lastRecalled)` older than 180 days, no inbound link from a current row), preview rows batched by path cluster, and unseen archived-plan assumptions. Before judging or proposing a change, the updater reads the complete targeted entries and supporting linked entries through the canonical reader. Its maintenance fetches use the full packet artifacts generated locally by the engine and do not refresh usage recalls; the packet index exposes summaries and paths first.
   - Print the dispatch plan as the stdout object: `{run, batches: [{cluster, packet}], report}`.
   - Concurrency: all mechanical writes use the shared short write lock from authoritative read through durable publication. Lock contention is bounded and a timeout reports the owning operation with no write. Analysis and packet inference run after releasing the lock; apply reacquires it and rechecks exact inputs. The lock serializes competing append, cleanup and apply processes; idempotence handles retry/crash recovery and independent branch merges, not mutual exclusion.
2. **`@bkit-utility-update-brain`** (inferred), one dispatch per `batches` entry so no context holds the whole brain. When `outcome.context.byAgent` for one dispatch passes 120,000 tokens (75% of the 160,000-token line), the next run halves that cluster's batch:
   - The per-kind steps of the four retired updaters: re-test each row against docs and code; close, triage, correct, supersede.
   - Propose `dependsOn` / `supersedes` upgrades of backfilled `relatedTo` links, and successor links for `SUPERSEDED` rows that lack one.
   - Find pairs of current rows that say opposite things and propose a `supersedes` link or a correction (Q22).
   - Find repeats across rows and plan assumption sections and propose one `knowledge` or `assumption` row, `relatedTo` its sources (Q23); `.bkit/friction.jsonl` excluded.
   - Review each entry's own `summary` against its full content and propose accurate, informative replacements through the same approval path. This is separate from rebuilding `kind: summary` rows per cluster (Q18).
   - Propose fades for the candidates.
   - Output: every suggestion with its `suggestionId`, expected target/input version fingerprints and inherited content base, dropping any whose id is in the rejection log. The engine validates those against retained inputs at apply time.
3. **Mode** (`bkit.brain.update.ask`, read through the settings reader):
   - `true` (default): write `docs/audits/{YYYYMM}/brain-update-{YYYYMMDD-HHMMSS}-{4 hex}.md` with a `Suggested Changes` table (`#`, Action, Targets, Change, Why, Suggestion id) and the machine rows in a fenced JSON block. The owner approves rows in chat; the orchestrator runs `bkit brain update --apply=<report> --approve=<#,…> --reject=<#,…>`, which appends approved rows through `bkit brain append` and records rejections.
   - `false`: the same `--apply` with every row approved; the report lists what was applied.
   - Headless (the scheduled run) never asks and never applies an inferred change, whatever `ask` says: it applies step 1 and writes the report, and approval waits for a chat. This is the pause that keeps a bad prompt run from landing unseen.
   - Report header: `Status: OPEN`, then `APPLIED {date}` once `--apply` ran, or `STALE` once a later `bkit brain update` finds that any exact input/target fingerprint moved (its suggestion ids no longer match). Reports are never deleted; they are the audit trail. A scheduled run records the CI run URL in the header.
   - Undo: for every applied row the report records the exact applied fingerprint, its prior fingerprint or absent-target marker, and `bkit brain undo --applied=<fingerprint>`. The command loads and verifies immutable retained brain evidence, restores the prior content/kind or withdraws a newly created entry, and refuses a changed target. Raw historical rows are never fed into ordinary append.
4. **Commit:** mechanical cleanup and approved rows commit straight to the current branch, no PR (Q17), naming only the brain update's own paths. The scheduled run commits the cleanup and the report to `dev` and pushes (Scheduled run).
5. **Counters:** at the end of `--apply`, or of a headless run, `bkit brain update` appends `counter` rows through `bkit ledgers append --ledger=stats` (`by.workflow` `utility`, `run.parentSha` = HEAD after the commit, `counter.source` `shell-bus`), one per name: `brain-update.stragglersMoved`, `.suggestionsMade`, `.approved`, `.rejected`, `.applied`, `.staleSkipped`, `.appliedSkipped`. A failed append logs `[bkit-brain] counters not written: {reason}` and exits 0.

**Logging and counters** (`[bkit-brain]` on stderr for every `bkit brain` verb; stdout stays one output object; a section in `docs/observability.md` lists the grep patterns):

- `[bkit-brain] {file}: {n} malformed lines skipped, {m} old-shape rows normalised` — from `readBrain`, once per process, only when `n` or `m` is above 0.
- `[bkit-brain] {n} stub lines waiting in {file}; run bkit brain update` — from `readBrain`, once per process, when an old-path file holds lines the brain does not.
- `[bkit-brain] recall log not written: {path}: {reason}` — best-effort, exit 0.
- `[bkit-brain] moved {n} stub lines from {file}` — brain update straggler move.
- `[bkit-brain] write lock unavailable: {owner}; no changes written` — bounded lock wait, non-zero exit.
- `[bkit-brain] destructive cleanup skipped: incompatible writers not quiesced; sources retained` — durable copies may be present; no source truncation/deletion.
- `[bkit-brain] conflicting versions retained: {key}: {fingerprints}; resolve explicitly` — no divergent content discarded.
- `[bkit-brain] undo refused: {reason}; no changes written` — invalid, unauthorized or stale restore, exit 8.
- `[bkit-brain] counters not written: {reason}` — best-effort, exit 0.
- `[bkit-brain] --ledger={name} is part of docs/brain.jsonl; use bkit brain append` — the refusal of an old ledger name, exit 8.
- `[bkit-brain] scheduled run failed: {step}: {reason} (run {CI run id})` — scheduled job, exit 1.
- The migration's partial-state line is `[bkit-upgrade] brain merge incomplete: …` (Boundaries), under the owning module's prefix.

**Scheduled run** (opt-in `bkit-brain-update` job in `bkit-cloud.yml`):

- Trigger: `schedule` weekly (Monday 03:00 UTC) and `workflow_dispatch` with no issue input; off until the consumer uncomments the trigger.
- Prompt: follow `.bkit/brain.md` § Brain Update headless. It does not route through `/bkit-auto`.
- Failure: any failed step exits non-zero and prints `[bkit-brain] scheduled run failed: …` with the CI run id, so the run is red with a grep-able cause.
- Push: commit the cleanup and the report to `dev` with the push access `bkit-cloud.yml` jobs already hold. On a rejected push, fetch, merge `origin/dev` (the union driver resolves the ledgers) and push once more; on a second rejection exit 1. It never force-pushes.
- Staleness: the `check` finding "brain update stale" fires when the newest committed brain-update report is older than 30 days, so a schedule that silently stops is visible at the next `check`.

**Concurrency:** report names carry a random suffix, so runs never overwrite each other. All supported local writers share the repository write lock; identical applies are checked and appended in one critical section. Inference uses immutable packet versions outside the lock. An outdated expected fingerprint skips as `stale`; across branches proposals retain the underlying content generation so proposal chains cannot outrank unseen newer normal content. The base10/P1-at-100/P2-at-200/C-at-50 fixture must select C under every merge order and after compaction. Equal-ranked divergent versions remain explicit retained conflicts. Rejections recorded by either run carry the same version-derived id, so both recognise them. Compaction preserves the evidence needed for this behavior and for undo.

**qmd template:** `.bkit/templates/scripts/qmd/bkit-qmd-export.mjs` writes one gitignored markdown file per current brain row (front matter: key, kind, status, links) under `tmp/bkit-brain/qmd/`; `.qmd/index.yml` points qmd at that folder; a README section covers the ~2 GB model download and Homebrew SQLite on macOS. The install steps pin `@tobilu/qmd` to an exact version (`2.8.3` when the spike installed it) and always add a `.qmd/` gitignore line, wherever qmd turns out to write its index (spike C9 left that unverified). Off by default; nothing binary committed.

## Decisions

<!-- prettier-ignore -->
| Decided | Alternatives | Why |
| --- | --- | --- |
| The brain is one more `APPEND_LEDGERS` entry on the existing codec, read through one choke-point module (`brain.ts`) of pure functions with thin verbs | A separate brain codec; a frozen-old-files "virtual brain"; a SQLite index as the only read path | One fold, one writer check, one migration path; `bkit stats` parity is safest when the fold is not duplicated. The choke point makes "no engine file reads an old path" testable, which catches the reader that silently reports zero deferrals. |
| After durable complete-content verification and incompatible-writer quiescence, old files become zero-byte `merge=union` stubs only while an unmerged branch/worktree touches them; otherwise they are deleted. Unproven quiescence keeps full sources. A late modify/delete conflict keeps the branch's file and `check` reports it (owner decision `546-brain-old-ledger-stubs-only-while-branches-touch-them`) | Always stubs; always delete (the #795 body's wording); decide from `.bkit/issues.jsonl` | The branch inventory decides retention, not whether a writer is active. Complete content must be durable before destructive cleanup. The real-Git fixture C1 proves old and appended lines survive the three named merge shapes; it does not prove concurrent filesystem mutation safe. |
| Backfilled links are written inside the one-time envelope rewrite, not as appended same-`key` rows (owner decision `546-brain-backfilled-links-ride-the-envelope-rewrite`) | Q6 as stated: append one link row per entry | Appended rows mint a `ts`, so two branches that each run `bkit upgrade` produce different rows that union keeps both of, doubling about 650 lines and inflating `updates`. Q13 already rewrites every line once, so links ride that rewrite and the migration stays a pure function. |
| Backfilled exact-key references become `links.relatedTo` (owner decision `546-brain-backfilled-links-are-relatedto`) | Backfill as `dependsOn`; infer `supersedes`; no backfill | A reference only says "this row cites that one", not "rests on it". As `dependsOn`, citations of superseded rows would flood the dead-premise list on day one. Brain update proposes `dependsOn` / `supersedes` upgrades under owner review. |
| Q13's "per-kind body" is the flat per-kind field set beside the envelope; no nested `body` object (owner decision `546-brain-per-kind-fields-stay-flat-beside-envelope`) | A nested `body` per kind | Every current reader of `rationale`, `severity`, `reason` (`bkit stats`, `bkit ledgers triage`, `bkit decisions pending`, the roadmap render, the audit templates) keeps working. A generic reader needs only the envelope fields. A nested body adds no capability. |
| `schema` stays `3` | `schema: 4` | `links`, proposal provenance, undo provenance and `lastRecalled` are optional additions; § Versioning already makes readers tolerate absent fields. |
| Identity `(repo, key)` for the six brain kinds only | Change `identity()` for every keyed kind | FIDs and brain keys often share an issue-number prefix (`546-…`); a global change can fold a `feature` and a `decision` into one entry wherever both files are folded. A test pins this. |
| `KIND_TRANSITIONS` = three normal append pairs (failure → knowledge, needs-decision deferral → decision, active assumption → knowledge), with a dedicated verified undo exception (`546-brain-design-08`) | Free kind changes; forbid every inverse even during undo | Normal writes retain Q12's closed list. Undo may restore only the exact prior kind and content verified in retained immutable evidence, under explicit owner authorization and an unchanged-target check. |
| Q26's "all ledger commands" are the brain-row commands; `bkit ledgers` keeps `commit` / `union` / `only-bookkeeping` / `triage` and friction / stats `append`; the old brain-kind `--ledger` names are refused with exit 8 once the brain exists, with no alias (owner decision `546-brain-row-verbs-under-bkit-brain-no-legacy-alias`) | Every `ledgers` verb under `brain`; an alias mapping old names to the brain | `commit` / `union` are git bookkeeping and friction / stats are not brain files (Q14). Without the alias, a pre-upgrade worktree's mirrored prompts fail their appends loudly, naming the replacement, instead of being rerouted. |
| Summary-first context/search/list plus key-selective get; full relevant entries read before edits | Full-body pre-code exception; summaries as sufficient evidence | Owner-approved consistent retrieval. Search still ranks full content; preview projection reduces agent context while detail reads preserve conditions and exceptions. Only detail delivery counts as recall. |
| `append` and the migration fill an absent `status` with the kind's default and an absent `summary` from the first sentence of `description` (200 characters) | Refuse rows without them | No writer prompt breaks, and every brain row gets the envelope fields a generic reader needs. |
| New terminal status `FADED` on every brain kind; revivable by a same-`key` append | Reuse `SUPERSEDED` / `CLOSED`; exclude without a status | `SUPERSEDED` implies a successor and would trip the missing-successor finding; a fade with no status keeps counting as current everywhere else. |
| Always-loaded part (Q7, owner decision `546-brain-always-loaded-summary-pathless-rows-2000-tokens`): current `summary`, `knowledge`, `assumption` rows with no path in `references`, projected to previews and hard-capped at 2,000 tokens by the tool; keep the reserve unless the owner approves a measured change | Every knowledge row's key + summary (~5k tokens); knowledge + assumptions capped at ~6k; nothing always-loaded | Path overlap reaches 92.0% of current knowledge and 95.6% of current decision rows (spike C5a), so the always-loaded part only has to carry what paths cannot reach. Decisions alone are ~18k tokens. The prior full-row spike cost 2.5%, 20.1% and 20.4% of the current-knowledge read; these are baseline figures, not evidence for summary-first savings. New measurements count previews, handoffs and complete fetched entries. Design and plan runs read the gotchas for a feature, but debug runs and direct chats skip those stages, so the bundle is their net for pathless rows. |
| The always-loaded part is written first, in its own reserved 2,000-token budget, and only path rows are clamped into the rest | Append it after the path rows and clamp everything together (the draft's order) | The `ledger` clamp keeps the head of the file, so appended last the always-loaded rows were all cut on one of three recorded tasks (spike C5b). Writing them first is the order under which every output carries them, as the Narrative promises. |
| `context` ranks exact file > nearer folder > farther, then gotcha kinds first, then newest; clamps through `clampFile` `ledger` profile and prints `tokensEst` | Unranked output; a new truncation path | One recorded 18-file task selects 97 rows and the clamp keeps 26 lines of them (spike C5b), so ranking decides what survives the clamp; a single hot file matches fewer (`telemetry.ts`: 9 current rows). One number per task makes Success Criterion 1 measurable without transcript counts, which read subagent output about 12x low. |
| Keyword search = `ledgerScan` unchanged, fed the serialised current `readBrain` winners, with a `--kind` filter; no index; FTS5 deferred until a recorded lookup shows a ranking gap | `node:sqlite` FTS5 with `bm25` and a content-hash index (the draft); Orama / MiniSearch | On the seven recorded plan Step 4 lookups, `ledgerScan` over the winners missed 3 or more of FTS5's top 10 on 0 of 7 lookups, and 4.0% of its kept hits matched only through JSON keys (spike C6). It needs no index, cache, warning filter or probe, and keeps search on the one fold. |
| Single-kind readers read through a kind filter (`readBrain(root, {kinds})`, `bkit brain list --kind=`, `bkit brain search --kind=`), each with the kinds it read before | Rename their paths to `docs/brain.jsonl`; leave them on the old paths | A rename mixes every kind into their results: `bkit stats` on the brain gains `decision`, `failure` and `knowledge` rows in its Kind table and its `utility` Workflow count moves from 81 to 563. Left on the old paths they read empty stubs and go silent: the unchanged engine drops the whole Deferral discipline section with no error. With the filter the report is byte-identical (spike C4b). |
| Every literal ledger-path registry imports `BRAIN_FILE`, `REJECTIONS_FILE` and `STUB_FILES` from `brain.ts`; `SCHEMA_LEDGERS`, `LEDGERS` and both `.gitattributes` blocks keep the stubs | Let `migrate.ts` and `branches.ts` name the old paths as audit exceptions; drop the stubs from the registries | One source of paths lets the old-path audit hold with no exception list. Dropping the stubs from `LEDGERS` makes a pre-upgrade branch's stub a blocking conflict, and leaving the brain out of `SCHEMA_LEDGERS` makes `mergeCanonicalHashes` record a canonical hash for a data file. |
| Brain update's orchestration lives in a procedure doc, `.bkit/brain.md` § Brain Update, and `bkit brain update` prints the dispatch plan (owner decision `546-brain-update-procedure-doc-not-a-workflow`) | A sixth workflow `bkit-brain.md`; the engine prints the plan with no doc | Brain update has no FID, no phase and no close, so a workflow would bend the five-workflow machinery (`WORKFLOWS`, the router, `/bkit-auto` phase resolution) for one loop. A procedure doc is what the direct chat and the scheduled job can both follow, and the printed plan keeps batching in the engine. |
| The scheduled run is a separate opt-in `bkit-brain-update` job with its own prompt, not a `/bkit-auto` phase | A `brain-update` phase routed through `/bkit-auto` | `/bkit-auto` phases resolve against the five workflows and its dispatch input requires an issue; brain update has neither. |
| Headless runs never apply an inferred change, whatever `ask` says | Apply under `ask: false` headless too; a per-run cap on fades and supersedes | An unattended run has no one watching, so a bad prompt run would land unseen; holding inferred changes for a chat is a pause that needs no tuned number. Attended `ask: false` runs keep Q19's behaviour. |
| `[bkit-brain]` stderr prefix with a fixed list of grep-able lines for degraded states, and `counter` rows at the end of each brain update | No logging contract; counters only in the report | `docs/observability.md` § Log Format requires one prefix per new command noun, with the brackets, because consumer CI grep depends on them. Without the lines, "the brain read fewer rows than it should" has no detection other than an agent noticing. |
| Migration publication is locked and durable: brain flushed/renamed/verified first, `.gitattributes` next, sources removed only after exact-content membership and legacy-writer quiescence (`546-brain-design-22`) | Truncate first; identity/timestamp membership; re-read then rename without exclusion | Copy-before-delete and complete membership preserve every distinct source row through interruption; unsupported writers cannot be made safe by the new lock. An older bkit after the merge remains a recorded one-way step. |
| Recall append and roll-up share the short write lock; roll-up renames before reading (`546-brain-design-23`) | Read then truncate; retain an append descriptor across rename | Writers open the path after acquiring ownership, so roll-up cannot race a supported recall append. Recall remains best-effort on bounded lock failure. |
| Constants: `dependents:` prints at most 20 rows; brain update is stale after 30 days; a dispatch over 120,000 tokens of context halves its cluster's next batch | No caps; "watch" the context figure | A hub row otherwise floods an agent's context. 30 days is four missed weekly runs. 120,000 is 75% of the 160,000-token line, leaving room for one bad batch before the line. |
| Brain update = deterministic `bkit brain update` + one prompt `bkit-utility-update-brain`, fed one path cluster per batch | Four prompts with a shared step; all inference in the engine | Q15 settles one pass. The engine cannot judge contradictions; the prompt should not be trusted with compaction. Batching keeps one agent context from holding the whole brain, the hotspot the premortem found at 10x. |
| Proposal ranking inherits the underlying content generation; exact expected-version fingerprints separately guard apply (`546-brain-design-26`) | Rank directly at the previous proposal's minted timestamp; ordinary latest-write ordering | A proposal chain must keep rank 10 for base10/P1-at-100/P2-at-200, so unseen normal content at 50 wins. Retained provenance survives compaction, while exact fingerprints still reject stale inputs. |
| Suggestion id = hash of action, sorted input/target keys with exact version fingerprints or absent markers, and payload (`546-brain-design-27`) | Random ids; timestamp-only target ids | Equal timestamps can conceal different content. Exact versions let concurrent runs share the same suggestion id only for the same observed inputs, and target changes invalidate rejection memory. |
| Every supported brain writer uses one short repository-local write lock; analysis remains outside it (`546-brain-shared-write-lock`) | Lock-free final re-read followed by rename; locking only the cleanup caller | A read/check and later rename are not one conditional publication. All writers must participate for exclusion to hold, and all apply checks must share the append's critical section. Unknown/live ownership is never stolen on a timer. |
| `bkit brain undo` restores verified retained history, with a narrow inverse-kind exception and `WITHDRAWN` for creations (`546-brain-validated-undo`) | Feed raw prior output into normal append; permit arbitrary reverse transitions; delete created entries | Normal append refuses system metadata and forbidden inverse transitions. A dedicated owner action verifies the exact applied/current versions, sanitizes historical data and mints a new restore event without erasing history. |
| Deduplicate only equivalent normalized full content and retain unresolved variants through compaction (`546-brain-content-equivalent-dedup`) | Treat matching identity/timestamp as duplicate proof; silently discard nonwinning variants | Identity and time do not prove content preservation. A source is disposable only when all its distinct content is verified in the durable destination. |
| Rejections in a committed `merge=union` file `.bkit/brain-rejections.jsonl`, kind `rejection` | Rows inside the brain (brainstorm 2); a gitignored local list | A local list re-offers a teammate what the owner rejected. Rows in the brain would pollute `context` and `search` with process bookkeeping, against Q14's line between what the project knows and machine records. Void rows are pruned; a union-resurrected one never matches again. |
| Recall log in the main checkout's `tmp/bkit-brain/` via `git rev-parse --git-common-dir`; `lastRecalled` at day grain, written only when later than stored by over half the fade window | Worktree-local `tmp/`; write every run; week grain | Most reads run in `.worktrees/{FID}`, deleted at close. The half-window rule bounds line churn by entries, not reads, and keeps `foldFrom` well under the `MAX_ROWS_BEFORE_ROLLUP = 5000` line warning. Recall writes are mechanical cleanup, applied even with `ask: true`. |
| Fade window 180 days, an engine constant; fade = current, `max(ts, lastRecalled)` older than the window, no inbound link from a current row (owner decision `546-brain-rows-fade-after-180-days-unrecalled`) | A setting; 90 days | Q24 / Q25 ask for a set time, not a knob. A constant with its decision row is re-derivable from the first real brain update's fade list; a setting can follow if owners ask. |
| `ask: false` applies every suggestion type, `supersedes` and kind changes included, and lists each in the report (`546-brain-design-31`) | Hold `supersedes` and kind changes to approval even under `ask: false` (premortem suggestion) | Q19 settles that `false` applies the same changes directly, and the default is `true`. Each applied event retains the evidence for dedicated validated undo; a later intervening change requires a new reviewed action rather than blind restoration. |
| Scheduled run = opt-in `bkit-brain-update` job with a weekly `schedule` trigger in `bkit-cloud.yml` that commits the cleanup and the report to `dev` and pushes: merge `origin/dev` on a rejected push, one retry, never force (owner decision `546-scheduled-brain-update-pushes-to-dev`) | A new workflow template; an engine scheduler; the report as a run artifact with no push; a local launchd / cron recipe | `bkit-cloud.yml` already runs claude-code-action and opencode with credential auto-detect and already pushes for `/bkit-auto` runs. Headless never asks, so the scheduled run applies cleanup and writes the report; approval waits for a chat. Pushing matches Q17's "cleanup lands directly". |
| Brain-update reports go under `docs/audits/{YYYYMM}/` with a random-suffixed name | Under `docs/plans/`; a tracker comment | Q17 says suggestions are reviewed "the way audit findings are"; brain update has no FID. Random suffixes keep concurrent runs apart. |
| Key-collision rule: earlier first `ts` keeps the key, the other becomes `{key}-{oldkind}` with a `relatedTo` link; stragglers follow the same map | Fixed file order with a `~kind` suffix (brainstorm 2); fail the migration | Content-derived, repeatable on every run, slug-shaped like every other key, loses no row. No collision exists in this repo today. |
| `bkit check`: old ledgers with content and no brain = drift (exit 1); an old-path file with content beside the brain = advisory (exit 0) | Fail on any non-empty old-path file (fail-closed approach) | Failing on it turns every pre-upgrade branch landing red in CI, a cost that grows with team size, while readers already see its rows. An unmerged repo is genuine drift. |
| `qmd` template adds a `.qmd/` gitignore line unconditionally (owner decision `546-qmd-template-gitignores-dot-qmd-unconditionally`) | Verify qmd's index location in a scratch project first; point the index at `tmp/bkit-brain/qmd/` | Spike C9 could not run the qmd binary. "Nothing binary committed" must hold for a consumer who runs `git add -A`, and the line costs nothing. |
| Path sweep as a bulk mechanical rewrite, then a hand review of each reading instruction; a repo audit test bars old paths from engine code outside `brain.ts`, from fenced bash blocks in `.bkit/core/workflows/*.md` and from `.bkit/core/docs/templates/` | Hand-edit 109 files; rely on review; audit engine code only | `.agents/rules.md` § Edit tools allows bulk mechanical rewrites; only reading instructions change meaning. The test catches a missed reader that would otherwise report zero rows without failing anything; the workflow and template readers are where single-kind reads live today. |
| D-AS1: Success Criterion 1 names the counting method (characters / 4 of what the agent is told to read) and adds the doc index to "no whole-ledger read" | The draft's unspecified measurement | The draft left the method open; transcript counts are unreliable, and `.agents/docs.md` also tells agents to read the ledgers. |
| D-AS2: Success Criterion 2 adds byte-identical output on a second run and on two branches | The draft's "no row lost" alone | The premortem showed a non-deterministic migration doubles rows when two branches upgrade independently. |
| D-AS3: Success Criteria 3 and 5 add `FALSIFIED`, the missing-successor finding, the `ask: false` report and the concurrency outcome | The draft's criteria | The `assumption` kind adds a third terminal status; Q28 asked for a conflict mechanism, which needs an outcome to test. |
| D-AS4: Edge cases and the Process Sketch name the stub-or-delete mechanism, the refusal of old `--ledger` names, the fixed collision rule, the `proposal` rank, the `relatedTo` backfill and the no-shell host case | The draft's "the reader accepts them", "needs one fixed rule", "must not overwrite" | The draft stated the problems; the brainstorms supplied the mechanisms. |
| D-AS5: Success Criterion 2 pins the whole `.bkit/stats.md` render with each reader kind-filtered; Success Criterion 4 names `ledgerScan` and the kind-filtered read path; the Process Sketch puts the always-loaded part first and adds `bkit brain list` and the scheduled run; the edge cases add the large selection and the older bkit | The design-v1 wording (`node:sqlite` FTS5, "stats figures unchanged" under a path move, always-loaded part appended last) | The spike disproved all three as written (C4b, C5b, C6); the operability review asked for the scheduled-run and downgrade outcomes. |

## Approaches Considered

<!-- prettier-ignore -->
| Approach | Verdict | Why |
| --- | --- | --- |
| Pragmatic A: brain as one more ledger inside the existing engine, brain logic in `brain.ts` | `MERGED` | The base shape: extends `telemetry.ts`, `migrate.ts`, `compact.ts`, `ledgers.ts`, `context.ts` in place; supplies stubs, flat per-kind fields, normal `KIND_TRANSITIONS`, the rejection file, the recall-log location and the cron reuse. Proposal provenance, locked publication, exact-content preservation and validated undo follow the contracts above. |
| Optimal A: one envelope, pure-function core library, thin verbs | `MERGED` | Supplies the pure-function boundary, the deterministic suggestion id shared by concurrent runs, and the rule that the tool, not convention, enforces the digest cap. Its rejection-rows-in-the-brain and file-order collision rule were not taken. |
| Premortem A: single choke-point codec, read-tolerant, deterministic migration | `MERGED` | Supplies `readBrain` as the only door, the byte-deterministic migration, content-hash caches, the old-path audit test, the real-`git merge` stub test, per-cluster batching and the per-kind-class identity rule. |
| Pragmatic B: virtual brain (old files frozen, new rows to the brain only) | `REJECTED` | Departs from Q2 and Q13, and leaves two layouts and a permanent old-shape mapping for every grep-based prompt and audit template. |
| Pragmatic C: dedicated brain module with its own codec | `REJECTED` | Duplicates fold, validation, lineage and the writer check; puts `bkit stats` parity (Success Criterion 2) at the most risk. |
| Optimal B: keep four files, add a derived unified view and links | `REJECTED` | Contradicts Q2, Q12, Q13, Q15; keys can collide across files, so links can resolve to the wrong row. |
| Optimal C: merge without the envelope, ship checks first, brain update later | `REJECTED` | Two migrations instead of one and departs from Q13 / Q15; its one useful idea, keeping per-kind fields flat, is taken in the chosen shape. |
| Premortem B: fail-closed strict cut-over, old files deleted, old shapes refused | `REJECTED` | Departs from Q13's "reader still accepts the old shape" and detects merge loss after the fact instead of preventing it. Its inline-fix advisory is kept for the non-empty-stub case. |
| Premortem C: derived SQLite index as the only read path | `REJECTED` | A second schema on the critical read paths for speed not needed at ~650 entries. Not kept for `search` either: `ledgerScan` over the fold winners matched FTS5's retrieval on the seven recorded lookups (spike C6). |
| Recall dates in a separate committed file instead of on the entries | `REJECTED` | Would avoid row copies, but departs from Q25 ("a `lastRecalled` date per entry"); the `proposal` rank removes the copy risk that motivated it. |

## Trade-offs Accepted

- **One ledger on the existing codec:** gain one fold, one writer check and one updater instead of four, with links that are plain keys. Sacrifice: a one-time sweep of 109 shipped files, and `telemetry.ts` (over 2,000 lines) keeps growing instead of a clean brain module boundary.
- **Stubs only while branches touch the old files:** gain no lost rows from pre-upgrade branches git can see, and no empty files where none is needed. Sacrifice: a branch git cannot see at migration (someone's unpushed clone) meets a modify/delete conflict, and its rows survive only if the conflict keeps its file; readers fold up to five files instead of one.
- **No alias for old `--ledger` names:** gain one write path into the brain and no silent rerouting. Sacrifice: a pre-upgrade worktree's ledger appends fail with exit 8 until it upgrades.
- **Links in the rewrite, as `relatedTo`:** gain a deterministic migration with no added lines and no false dead-premise alarms. Sacrifice: the dead-premise check is quiet for old rows until brain update upgrades their links, and the 45 old `SUPERSEDED` rows have no successor link until then.
- **Flat per-kind fields:** gain zero reader rewrites. Sacrifice: the envelope is a convention on top-level fields, not a structural boundary, so a future kind must avoid field-name clashes.
- **Summary-first discovery:** gain smaller context/search results and deliberate detail selection. Sacrifice: one additional fetch round and dependence on accurate summaries. Fetch uncertain matches, read relevant full entries before edits, and measure complete read cost and required-key coverage. The reserved pathless preview budget remains; it is not an exception that injects full rows.
- **`ledgerScan` for search, no index:** gain zero dependencies, no cache to invalidate, and one semantic definition of "current row". Sacrifice: term-overlap ranking with no field weighting, and `context` / `search` re-parse the brain per call (about 1.55 MB across the four ledgers today), fine at this size and the first thing to revisit at 10x.
- **Headless runs hold inferred changes:** gain no unattended change lands unseen. Sacrifice: a scheduled run alone never advances links, summaries or fades; they wait for a chat.
- **Scheduled run pushes to `dev`:** gain cleanup that lands without anyone running it. Sacrifice: CI holds push access to `dev` for this job, and a bad mechanical step lands unattended (it is reversible by `git revert`).
- **The `proposal` fold rank:** gain no silently hidden content across branches. Sacrifice: a narrow exception in `fold()` that every future fold-adjacent change must respect, and an inferred change can be discarded and re-offered.
- **Short serialized writes:** gain exclusion across cooperating local writers and one critical section for stale/id checks and append. Sacrifice: contending writers wait or fail after a bounded timeout; incompatible tools must be quiesced before source deletion. AI analysis remains concurrent.
- **Retained conflicts and restore evidence:** gain recoverable divergent data and undo after compaction. Sacrifice: brain compaction retains more than one winner per entry when evidence or unresolved conflicts require it; it cannot promise a fixed minimum file size.
- **Committed rejection file:** gain shared rejections across people and branches. Sacrifice: one more ledger file and writer-table row.
- **Approval in chat, no PR:** gain a fast loop for the owner. Sacrifice: the review trail is the report file and the commit, not a PR conversation.

## Risks & Open Questions

- Open questions: none. The owner settled each one at design close, recorded in `docs/decisions.jsonl`:
  - Reserved pathless context (Q7): previews of current `summary`, `knowledge` and `assumption` rows, capped at 2,000 tokens (`546-brain-always-loaded-summary-pathless-rows-2000-tokens`). The owner-approved summary-first contract applies to this bundle; relevant full entries are fetched before editing.
  - Backfilled links ride the one-time envelope rewrite (`546-brain-backfilled-links-ride-the-envelope-rewrite`).
  - Backfilled links are `relatedTo` (`546-brain-backfilled-links-are-relatedto`).
  - Per-kind fields stay flat beside the envelope (`546-brain-per-kind-fields-stay-flat-beside-envelope`).
  - Brain-row verbs under `bkit brain`, no alias for the old `--ledger` names (`546-brain-row-verbs-under-bkit-brain-no-legacy-alias`).
  - Stubs only while an unmerged branch or worktree touches the old files, deleted otherwise (`546-brain-old-ledger-stubs-only-while-branches-touch-them`).
  - The scheduled run commits to `dev` and pushes (`546-scheduled-brain-update-pushes-to-dev`).
  - Brain update's steps live in `.bkit/brain.md` § Brain Update (`546-brain-update-procedure-doc-not-a-workflow`).
  - The qmd template always gitignores `.qmd/` (`546-qmd-template-gitignores-dot-qmd-unconditionally`).
  - `FADED` after 180 days unrecalled, recall rewritten past 90 days (`546-brain-rows-fade-after-180-days-unrecalled`).
  - Shared short write locking and fail-closed source cleanup (`546-brain-shared-write-lock`, `546-brain-design-22`).
  - Dedicated verified undo and withdrawal of created entries (`546-brain-validated-undo`, `546-brain-design-08`).
  - Exact expected versions separated from inherited proposal content generation (`546-brain-design-26`, `546-brain-design-27`).
  - Complete normalized-content deduplication and retained unresolved variants (`546-brain-content-equivalent-dedup`).
- Invisible branches at migration: the stub-or-delete check sees local branches, remote branches and worktrees, not another person's unpushed clone. When such a clone later merges an append to a deleted old file, bkit's conflict resolution keeps the file; a plain `git merge` resolved by hand with "keep the deletion" drops those rows.
- The stub union result ("ours emptied, theirs appended") is settled by the spike (C1): the old lines come back with the appended ones under all three merge shapes. Readers deduplicate equivalent normalized full content only, and a second migration run over refilled stubs is byte-identical (C3); plan 1's first task keeps the fixture as a regression test.
- Recall-log availability: append and roll-up share the lock, so supported append descriptors cannot race rename. A bounded-lock or filesystem failure can still omit a recall; it is logged and may make a fade proposed one run early, which the owner sees under `ask: true`.
- Mixed-version use: a pre-upgrade worktree's engine, or an older bkit, reads empty stubs or absent files and reports zero rows with no error. Its `--ledger=<old>` appends through a post-upgrade engine are refused with exit 8. `docs/migrations.md` records the merge as one-way.
- Scheduled-run failure: a red run carries a `[bkit-brain] scheduled run failed` line, and a schedule that stops silently surfaces as the 30-day staleness finding in `bkit brain check`, which nobody runs automatically.
- The migration is deterministic per line except one rare case: a line citing a key that exists only on one branch gets a `relatedTo` link there and not on the other. Union keeps both versions with equal `ts`. Both remain stored through cleanup and compaction, `check` reports the conflict, and ordinary mutation waits for an owner-approved resolution naming all variants. Read presentation may select a deterministic representative without resolving or deleting the alternatives.
- Plan 1 is large (codec, migration, stub-or-delete check, sweep, check). It is the owner's settled order (Q27); the plan should split it into task groups that each leave `dev` green.
- Consumer scripts using the old direct `jq` write idiom do not participate in the new lock. They must switch to the supported append command or be quiesced before destructive cleanup. Until then sources remain full, readers fold both layouts and `bkit brain check` reports the outstanding migration. `.bkit/jsonl.md` § Write Idiom must change in the same release.
- The lock protects cooperating local processes only. Git merge/rebase and unsupported file editors are quiesced during destructive mutation; independent clones reconcile with the content-generation and conflict-retention rules. A final source re-read is an additional diagnostic, not proof against an uncoordinated writer.
- Kind transitions change lineage: `firstTs` / `updates` cover both lives of an entry. Readers that count a kind must use the winner's kind, which plan 1 tests against `bkit stats`.
- Brain update's peak context is the new hotspot; `outcome.context.byAgent` for `bkit-utility-update-brain` is the figure to watch against the 160,000-token line, and a dispatch over 120,000 tokens halves its cluster's next batch.
- Success Criterion 1 depends on three recorded tasks chosen before plan 2 changes any prompt, so the "before" figure is not taken after the fact.

## Suggested Workstreams

### WS-1: Codec and Envelope

#### Scope

`.bkit/core/engine/ledgers/telemetry.ts` changes that define the brain row:

- `APPEND_LEDGERS`: the four per-kind entries become one `brain` entry (`docs/brain.jsonl`, six kinds) and a `rejections` entry (`.bkit/brain-rejections.jsonl`, kind `rejection`), with paths taken from WS-2's constants.
- Shared writer guidance requires informative summaries checked against full content at creation/update; mechanical validation checks nonblank one-line shape without certifying semantics. Migration retains deterministic fallback.
- `identity()`: `brain {repo} {key}` for the six brain kinds only; `feature`, `friction`, `chat`, `run` keep `(kind, repo, key)`; a test pins that a `feature` and a `decision` sharing a `546-…` prefix stay separate entries.
- `validate()` / `normalize()`: envelope fields (`status`, `summary`, `links`), `links` values as arrays of key strings, `assumption` refused without `falsifiedBy` (exit 8), `summary` kind requiring `links.relatedTo` and a `description` of at most 2,000 characters; `schema` stays `3`.
- Status vocabularies and the terminal set (`SUPERSEDED`, `CLOSED`, `FALSIFIED`, `FADED`, undo-only `WITHDRAWN`; `TRIAGED` current; free-string `failure` status counts as current); per-kind defaults for an absent `status`; `summary` filled from the first sentence of `description` (200 characters).
- `KIND_TRANSITIONS` (three normal pairs with their status mapping and dropped fields) checked in the same `append` pass as `KIND_WRITERS`, with a doc-table parity test like the `KIND_WRITERS` one; narrow engine-only verified undo exception and refusal of caller-supplied restore provenance.
- `KIND_WRITERS` rows for `assumption`, `summary` and `rejection` (decision `ledger-writer-agents-carry-bash`).

Excluded: inherited proposal content-generation rank and the `lastRecalled` max in `fold()` (WS-10).

#### Requires

[]

#### Rationale

Every other workstream reads or writes rows through this codec, so the row contract has to settle first. The changes are one file plus its tests, and share the single `append` validation pass.

### WS-2: Brain Module Core and Path Registries

#### Scope

- New `.bkit/core/engine/ledgers/brain.ts`: `BRAIN_FILE`, `REJECTIONS_FILE`, `STUB_FILES`; `readBrain(root, {kinds?, current?})` folding `[BRAIN_FILE, ...STUB_FILES]` (absent old files skipped), normalising old-shape rows at read time and deduplicating equivalent normalized full content only; exact version fingerprints; retained divergent versions and refusal of ambiguous writes until explicit resolution.
- `linkIndex(rows)` (forward and reverse maps for `supersedes`, `dependsOn`, `relatedTo`), `dependentsOf(keys)`.
- `checkFindings(rows, now)` for the finding types that exist at merge time: dead premise, dangling key, `dependsOn` cycle (iterative walk with a visited set, no unbounded recursion), passed `validUntil`, `SUPERSEDED` without successor link, same identity with equal `ts` and different content (also the rare branch-only `relatedTo` case in Risks), malformed and old-shape counts per source file.
- The `readBrain` stderr lines: `[bkit-brain] {file}: {n} malformed lines skipped, {m} old-shape rows normalised` and `[bkit-brain] {n} stub lines waiting in {file}; run bkit brain update`, once per process.
- Registry imports per the Boundaries table: `APPEND_LEDGERS`, `SCHEMA_LEDGERS` (`migrate.ts:15`, keeps stubs, so `mergeCanonicalHashes` records no canonical hash for data files), `LEDGERS` (`branches.ts:160`, keeps stubs, and resolves a modify/delete conflict on an old path by keeping the branch's file); confirmation that `UNION_PATHSPECS` and `CLOSE_DOCS` already match the new files.

Excluded: `selectForFiles` / `alwaysLoaded` (WS-7), `suggestionId` (WS-10), the stale-proposal and brain-update-stale findings (WS-11).

#### Requires

[WS-1]

#### Rationale

`brain.ts` is the single read door and the single source of paths the old-path audit relies on; the link functions are pure functions over the same fold, so they belong with it.

### WS-3: Merge Migration and Install / Upgrade Integration

#### Scope

- `mergeIntoBrain(root, dryRun)` in `.bkit/core/engine/ledgers/migrate.ts`, called from `.bkit/core/engine/install/modules/core.ts` right after `migrateLedgers`, with the caller holding one shared write-lock token across both functions and gating any destructive old-source schema rewrite on writer quiescence: fixed input order, one line out per line in, `status` / `summary` fill, exact-key `references` backfilled as `links.relatedTo`, malformed lines copied byte-for-byte, complete normalized-content membership dedup, the `{key}-{oldkind}` collision rule and its straggler map, no minted `ts`.
- Shared mutation lock and durable write order: fresh locked read, uniquely named brain temp file flushed and renamed, destination directory flushed and published full-content membership verified, then `.gitattributes` (`.bkit/shared/.gitattributes` managed block and root `.gitattributes` gain `docs/brain.jsonl` and `.bkit/brain-rejections.jsonl` `merge=union`, keeping the four old lines). Sources are truncated/deleted only after incompatible writers are upgraded or quiesced; otherwise keep full originals and report skipped cleanup. The stub-or-delete inventory then leaves zero-byte stubs when any unmerged branch/worktree touches an old path and deletes otherwise. Partial-state restart finishes from retained exact content; dry run computes the same writeset.
- `bkit check`: old ledgers with content and no brain = drift (exit 1); an old-path file with content beside the brain (filled stub or recreated file) = advisory with the fix inline (`bkit upgrade` or `bkit brain update`), per `.agents/rules.md` § Advisories self-contained.
- Tests: old-shape seed, second run byte-identical, two-branch determinism, interruption before/after destination publication and each source removal, incompatible-writer cleanup refusal, and the real-`git merge` stub fixture (base old, ours empty, theirs old + appended; `git merge`, `git merge --squash -X ours`, reverse merge, and the no-`merge=union` control) as plan 1's first task; the stub-or-delete check with and without a touching branch, and a modify/delete merge resolved to the branch's file. Equal identity/ts with divergent content and links must preserve both variants after repeated cleanup and compaction.
- Close squash (`.bkit/workflows.md:250`) left unchanged; a test that its exit-18 check still holds with stubs.
- `docs/migrations.md` row with release range and the one-way-step note (older bkit reads empty stubs or absent files; recovery is `bkit upgrade` forward or `git revert`).

#### Requires

[WS-1, WS-2]

#### Rationale

The migration is one install-path function with its own idempotence, ordering and crash rules; it is the step that changes consumer files, so it carries the migration register row and the merge-safety tests together.

### WS-4: `bkit brain` CLI Noun and Logging Contract

#### Scope

- The `brain` noun in `.bkit/core/engine/commands/workflow/ledgers.ts` (or a sibling file): `append` (same contract as `bkit ledgers append`, plus `status` / `summary` fill, transition and `falsifiedBy` refusals, the `dependents:` print capped at 20 with the `and {M} more` line, exit 0 for that reason), `check` (`--plan` keeps `EXIT_ROWS_MISSING`; plain `check` prints `checkFindings` grouped with each fix line and per-file counts, exit 0), `list --kind= [--current] [--full] [--json]` (default previews, full for machine consumers), `get --keys=<comma-list|-> [--all] [--json]` (complete selected entries), and `compact [--dry-run]` over `docs/brain.jsonl` on the existing compaction.
- `bkit ledgers` keeps `commit`, `union`, `only-bookkeeping`, `triage`, `append --ledger=friction|stats`; once `docs/brain.jsonl` exists, `--ledger=<knowledge|decisions|deferrals|failures>` exits 8 with `[bkit-brain] --ledger={name} is part of docs/brain.jsonl; use bkit brain append` and writes nothing.
- `[bkit-brain]` stderr prefix for every verb, stdout one output object; the `docs/observability.md` § `[bkit-brain]` section with the plan-1 grep lines (later plans add theirs); `.bkit/cli.md` rows for the verbs.
- The `dependents:` cap constant in `brain.ts` with its decision row.
- One common short write lock around every authoritative brain mutation, including append, compact, install/upgrade and conflict-resolution paths; nested calls reuse ownership. Lock timeout writes nothing and a live/unknown owner cannot be evicted by age. Real subprocess tests pause cleanup before publication while append waits, then verify both changes survive; concurrent identical applies record one logical application. Keep immutable apply/prior/undo evidence and divergent variants during compaction.

Excluded: the `proposal` `stale` / `applied` skips in `append` (WS-10); `context`, `search`, `update` verbs (WS-7, WS-9, WS-11).

#### Requires

[WS-1, WS-2]

#### Rationale

The verbs are thin wrappers over WS-1 and WS-2 and share one command file, one logging prefix and one CLI doc; `append`, `check` and `list` are the read and write doors every later reader and writer uses.

### WS-5: Engine and Script Readers Moved to Kind-Filtered Reads

#### Scope

- Every non-test engine file that names an old ledger path today (`cli.ts`, `migrate.ts`, `telemetry.ts`, `stats.ts`, `challenge.ts`, `workflows.ts`, `context.ts`, `ledgers.ts`, `decisions.ts`, `branches.ts`) moves to `readBrain` with a `kinds` filter equal to the kinds it read before, or to the `brain` ledger entry for writers; literal paths come from WS-2's constants.
- `stats.ts` passes only `deferral` winners to `runAnalysis`; kind counts (`bkit stats`, `bkit ledgers triage`) use the winner's kind; the deferral-reason rate reads the entry's last `deferral` row; `bkit decisions pending` and the roadmap render keep their output.
- Parity pins as plan 1's second early task: the whole `.bkit/stats.md` render and the `docs/roadmap.md` render byte-identical before and after the merge (spike C4b), plus fold-winner parity under the new identity.
- `scripts/harvest/ledgers.ts` reads both the four-file and the brain layout.

#### Requires

[WS-2, WS-3]

#### Rationale

These are the engine readers that would silently report zero rows on the post-upgrade layout; they move together because the parity pins compare one before / after render across all of them.

### WS-6: Shipped-Text Path Sweep, Doc Indexes and Old-Path Audit

#### Scope

- Bulk mechanical rewrite of the 494 / 576 old-path mentions across `.bkit/core/` (109 / 110 files), then a hand review of every reading instruction; files outside `.bkit/core/`: `.bkit/shared/docs/{technology,data-schema,deployments}.md`, `.bkit/templates/.github/ISSUE_TEMPLATE/bkit-{bug,idea}.yml`, `scripts/readme/readme-art.mjs`, `.github/assets/*.svg`.
- Single-kind readers in workflows and templates moved off the emptied stubs in the same change: `bkit-audit-deferrals.md:37` and `bkit-utility-update-roadmap` → `bkit brain list --kind=deferral,failure --current`; `bkit-plan.md:293-294` and `bkit-ship.md:481` → a kind-filtered read that does not open a stub file raw (WS-9 later switches them to `bkit brain search --kind`).
- The four `bkit-utility-update-{knowledge,decisions,deferrals,failures}` prompts repointed at the brain until WS-12 retires them; "Check gotchas first" and `.bkit/core/.agents/rules.md:116` repointed to a kind-filtered read until WS-8 switches them to `context`.
- `.bkit/core/.agents/docs.md`: the four ledger rows become one `docs/brain.jsonl` row naming the read commands.
- Docs that describe the ledgers: `.bkit/jsonl.md` (envelope fields, status vocabularies, links, new kinds, `KIND_TRANSITIONS` table, § Write Idiom for the brain), `docs/architecture.md` § Knowledge / Decisions JSONL Ledgers, and the indexes `.bkit/prompts.md`, `.bkit/workflows.md`, `.bkit/instructions.md`, `.bkit/templates.md`; `docs/` templates change only ledger names and read instructions (Q9).
- Widened `.bkit/core/engine/audits/repo/ledger-integrity.test.ts`: no non-test engine file other than `brain.ts`, no fenced bash block in `.bkit/core/workflows/*.md` and no file under `.bkit/core/docs/templates/` names an old ledger path.
- Deferral rows for each Out-of-scope item (feature rows joining, friction / stats separate, kept-stub retirement, transcript recall, the FTS5 index with its C7 / C8 notes).

#### Requires

[WS-4, WS-5]

#### Rationale

The sweep is one bulk rewrite plus review across agent-read text; the audit test can pass only once both engine readers (WS-5) and shipped text are clean, so it closes this workstream.

### WS-7: `bkit brain context` and the Recall Log

#### Scope

- `selectForFiles(rows, files)` and `alwaysLoaded(rows)` in `brain.ts`: normalize references, select/rank full rows by the existing path/kind/time rules, then project previews. Reserve 2,000 tokens for pathless current summary/knowledge/assumption previews. Include omitted-key diagnostics in total output accounting.
- `bkit brain context --files=<list|-> [--json]`: shared preview projection, reserved pathless previews first, path previews in the remaining clamp budget, omitted keys/not-read guidance and `tokensEst`. No full-body exception for pre-code context.
- Recall log: `tmp/bkit-brain/recall.jsonl` in the main checkout resolved through the common Git directory; one `{key, at}` per complete `get` result. Discovery, exports and maintenance do not refresh recall. Use the shared lock, best-effort warning and existing roll-up protocol.
- Tests for the large-selection case (97 rows, the always-loaded part survives the clamp).

#### Requires

[WS-2, WS-4]

#### Rationale

Preview selection and clamp order share one output contract. This workstream wires the recall helper to WS-4's detail fetch and verifies that discovery never records a read.

### WS-8: Prompt and Rule Switch to File-Scoped Loading

#### Scope

- Choose the three recorded tasks and record the "before" figure (characters / 4 of every current `docs/knowledge.jsonl` row) before any prompt changes.
- Shared summary-writing guidance and all carrying writer prompts check accuracy before append and on substantive updates; maintenance proposes quality repairs.
- The six "Check gotchas first" prompts (`bkit-build-plan-execute`, `bkit-debug-failure-diagnose`, `bkit-plan-review-1`, `bkit-plan-review-2`, and the updater prompts) and `.bkit/core/.agents/rules.md:116` switch to `bkit brain context --files=…`; the shared clause changes through `pnpm instructions:sync`; the `docs/brain.jsonl` row in `.bkit/core/.agents/docs.md` names `context`.
- No-shell host parity: preview dispatch, selected-key response, orchestrator detail fetch and resumed/redispatched full-entry read before edits. Verify the sequence on every provider, including resume, no-plan conversion, per-group execution and remediation.
- Measure complete context-preview plus selection/handoff plus detail cost on the same three tasks, with expected relevant keys fixed in advance. Compare both whole-knowledge and full-row path-context baselines. Keep the 2,000-token preview reserve unless the owner approves a measured change.

#### Requires

[WS-6, WS-7]

#### Rationale

These are the agent-facing edits that make the context verb the read door; the before / after measurement brackets exactly these edits, so they cannot be split from it.

### WS-9: `bkit brain search` and Search-Based Readers

#### Scope

- `bkit brain search "<text>" [--kind=…] [--all] [--json]`: filter and rank full canonical entries with `ledgerScan`, then project to bounded previews. Test description-only matches, ranking, omitted-key notices and zero preview recalls; measure preview plus selected detail costs after search exists.
- `bkit-plan.md:293-294` and `bkit-ship.md:481` switched to `bkit brain search "<terms>" --kind=deferral` / `--kind=failure`, with `.bkit/workflows.md` updated in the same change.
- `.bkit/cli.md` row; preserve candidate key/rank parity and related-artifact paths. Store previews and the selected-key/version manifest; after relevance selection, fetch full entries into linked detail artifacts before any decision or edit relying on them.

#### Requires

[WS-2, WS-4, WS-6, WS-7]

#### Rationale

The verb is a thin feed into an unchanged `ledgerScan`, and its only shipped callers are the two workflow lookups, so verb and caller switch ship as one unit.

### WS-10: Fold Rank, Recall Date and Suggestion Identity

#### Scope

- `fold()` additions in `telemetry.ts`: proposals carry exact `expectedVersion` and all input/target fingerprints separately from inherited `contentBase`; chains inherit that same underlying generation. The winner's `lastRecalled` is the newest value across the entry's rows, and metadata-only recalls retain content generation. Property tests cover base10/P1-at-100/P2-at-200/C-at-50 under every merge order and before/after compaction, plus equal-ranked divergent generation conflicts.
- `bkit brain compact` uses the same fold rank, stamps `lastRecalled` like `firstTs`, and retains unresolved alternatives and immutable apply/input/before/undo evidence and applied ids.
- `suggestionId(action, targets, payload)` in `brain.ts` (first 12 hex of sha256 over canonical JSON with sorted `[key, winnerFingerprintOrNull]` inputs/targets); shortened-id payload collisions are refused.
- `bkit brain append` checks id and exact expected versions under the shared write lock, skipping `applied` or `stale` as appropriate; rejects ambiguous versions and validates inherited content rank against retained evidence.

#### Requires

[WS-1, WS-2, WS-4]

#### Rationale

These are the concurrency guarantees for brain update (Success Criterion 5), and the fold rank touches the sort every kind shares, so they land as one tested change ahead of the verb that produces proposals.

### WS-11: `bkit brain update` Engine Verb, Reports and Rejections

#### Scope

- Deterministic step: straggler moves from any old-path file through `mergeIntoBrain` with the collision map, then the stub-or-delete check (`[bkit-brain] moved {n} stub lines from {file}`), compaction, recall roll-up (rename to `recall-{run}.jsonl`, write `lastRecalled` only when later than stored by more than 90 days, delete), pruning void rejection rows, candidate packet under `tmp/bkit-brain/update-{run}/` (findings, fade candidates, path-cluster batches, unseen plan `Open Questions & Assumptions` sections), the stdout dispatch plan `{run, batches: [{cluster, packet}], report}`.
- Concurrency: common short write lock from fresh authoritative read through durable publication for cleanup, append, apply and rejection writes; AI analysis outside the lock; exact input-version rechecks and applied-id checks inside it. Bounded contention fails without writing and no live/unknown owner is evicted by age. Quiesce unsupported writers before source deletion or preserve full sources.
- `--apply=<report> --approve=<#,…> --reject=<#,…>`: approved rows through `bkit brain append`, rejections into `.bkit/brain-rejections.jsonl`; report file `docs/audits/{YYYYMM}/brain-update-{YYYYMMDD-HHMMSS}-{4 hex}.md` with the `Suggested Changes` table, fenced machine rows, `Status: OPEN` / `APPLIED {date}` / `STALE` header, CI run URL for scheduled runs, and each applied fingerprint/prior fingerprint plus dedicated undo command.
- `bkit brain undo --applied=<version-fingerprint>`: explicit utility owner action, verified retained apply/before evidence, unchanged exact current fingerprint, full schema validation, sanitized fresh metadata and engine-only undo provenance; narrow inverse-kind exception, creation withdrawal via `WITHDRAWN`, append-only history. Refuse stale/forged/ambiguous evidence. Test all three kind transitions, ordinary edits, creations, stale targets and compaction-before-undo.
- `bkit.brain.update.ask` as a new `BkitConfig` field in `readBkitConfig` (default `true`); headless runs never apply inferred changes.
- Counters at the end of `--apply` or a headless run via `bkit ledgers append --ledger=stats` (seven `brain-update.*` names), best-effort with `[bkit-brain] counters not written: {reason}`.
- `checkFindings` additions: stale proposal, brain update stale (no committed report newer than 30 days).
- `FADED` fade candidates (180-day window, no inbound link from a current row); engine constants (fade window, staleness window) with their decision rows.
- Commit of cleanup and approved rows to the current branch naming only brain-update paths; `.bkit/cli.md` and `docs/observability.md` lines.

#### Requires

[WS-3, WS-7, WS-10]

#### Rationale

All deterministic, file-writing parts of brain update share one verb, one run id and one concurrency rule, and the report format is the contract the prompt (WS-12) writes into and `--apply` reads back.

### WS-12: Brain Update Prompt and Procedure Doc

#### Scope

- `.bkit/core/prompts/bkit-utility-update-brain.md`: the per-kind steps of the four retired updaters, link upgrades and successor links, contradiction pairs (Q22), repeat-to-row proposals excluding `.bkit/friction.jsonl` (Q23), entry-summary accuracy review/repair, per-cluster `summary` rebuilds (Q18), fade proposals, output suggestions with exact input/target fingerprints and inherited content-base provenance, rejected ids dropped; one dispatch per `batches` entry outside the write lock; Bash in its tool set.
- Retire `bkit-utility-update-{knowledge,decisions,deferrals,failures}.md`; update `.bkit/prompts.md` and any caller.
- New `.bkit/core/.bkit/brain.md` § Brain Update (mirrored to `.bkit/brain.md`), with a row in `.bkit/core/.agents/docs.md`: the steps a chat and the scheduled job follow, mode handling for `ask`, approval in chat, commit rule; the 120,000-token batch-halving rule on `outcome.context.byAgent`, with its decision row.

#### Requires

[WS-6, WS-11]

#### Rationale

The prompt and the procedure that dispatches it are the inferred half of brain update and are reviewed together under the agent-read authoring rules; both depend on the engine's dispatch plan and report format.

### WS-13: Scheduled Brain Update Job Template

#### Scope

- Opt-in `bkit-brain-update` job in `.bkit/templates/.github/workflows/bkit-cloud.yml`: `schedule` weekly (Monday 03:00 UTC) and `workflow_dispatch` with no issue input, off until uncommented; prompt follows `.bkit/brain.md` § Brain Update headless; not routed through `/bkit-auto`.
- Commit of the cleanup and the report to `dev`, then push with the job's existing push access: on a rejected push, merge `origin/dev` and push once more; on a second rejection exit 1; never force.
- Failure contract: non-zero exit with `[bkit-brain] scheduled run failed: {step}: {reason} (run {CI run id})`; `docs/observability.md` line; `.bkit/templates.md` install steps; root adopted copy kept byte-identical where the repo adopts the template.

#### Requires

[WS-12]

#### Rationale

A copy-and-own CI template with its own credentials, trigger and push rules; it only follows the procedure doc, so it is a separate unit.

### WS-14: qmd Search-by-Meaning Template

#### Scope

- `.bkit/templates/scripts/qmd/bkit-qmd-export.mjs`: use `list --full` for deterministic complete-row export, with no usage recalls; one gitignored markdown file per current brain row (front matter key, kind, status, links) under `tmp/bkit-brain/qmd/`.
- `.qmd/index.yml` pointing qmd at that folder; README section in `.bkit/templates.md` (model download ~2 GB, Homebrew SQLite on macOS); install steps pinning `@tobilu/qmd` to an exact version.
- Install steps always add a `.qmd/` gitignore line (spike C9 left qmd's index location unverified); nothing binary committed; off by default.

#### Requires

[WS-4]

#### Rationale

An opt-in copy-and-own template outside the engine, reading the brain only through the shipped read commands; nothing else depends on it.

## Suggested Plans

These original delivery stages are consolidated into the single parent implementation plan; they are not separate child builds.

### P-1: Brain Merge, Envelope and Links (#795 with #792)

#### Deliverable

`bkit upgrade` merges the four ledgers into `docs/brain.jsonl` under the shared write lock with complete-content durability checks and no distinct row lost. After incompatible-writer quiescence, it leaves zero-byte `merge=union` stubs only while an unmerged branch/worktree touches the old files and deletes them otherwise; unproven quiescence keeps full sources. The envelope, `assumption` / `summary` / `rejection` kinds, normal `KIND_TRANSITIONS`, conflict preservation, links and `bkit brain append|check|get|list|compact` ship, and old brain-kind `--ledger` names are refused. Every reader uses a kind filter, with `.bkit/stats.md` and `docs/roadmap.md` renders byte-identical and the old-path audit green.

#### Covers

[WS-1, WS-2, WS-3, WS-4, WS-5, WS-6]

#### Requires

[]

### P-2: Loading Rows by File (#791)

#### Deliverable

`bkit brain context --files=…` returns capped pathless and ranked path previews. Every host selects keys and reads full `get` results before editing; only get records recalls. Shared rules and prompt dispatch support this sequence, and three-task measurements count previews, handoffs and details with the Q7 reserve.

#### Covers

[WS-7, WS-8]

#### Requires

[P-1]

### P-3: Keyword Search (#793)

#### Deliverable

`bkit brain search` ranks complete current winners with kind/all filters and returns previews. Plan/ship preserve candidate artifacts, select relevant keys and fetch details before use. Search never records recalls.

#### Covers

[WS-9]

#### Requires

[P-1, P-2]

### P-4: Brain Update

#### Deliverable

`bkit brain update` (locked cleanup, dispatch plan, reports, `--apply` with approve / reject, rejections, recall roll-up, fades, counters, `bkit.brain.update.ask`) and dedicated validated `bkit brain undo`, with exact expected-version checks, inherited proposal content generation and retained evidence/conflicts through compaction; `bkit-utility-update-brain` and `.bkit/brain.md` § Brain Update replace the four updater prompts; the opt-in scheduled `bkit-brain-update` job template ships, committing its cleanup and report to `dev`.

#### Covers

[WS-10, WS-11, WS-12, WS-13]

#### Requires

[P-1, P-2]

### P-5: qmd Search-by-Meaning Template (#794)

#### Deliverable

An opt-in copy-and-own qmd template (export script, `.qmd/index.yml`, pinned install steps, README section) that indexes current brain rows from a gitignored export, off by default with nothing binary committed.

#### Covers

[WS-14]

#### Requires

[P-1]
