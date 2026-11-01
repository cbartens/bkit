Verdict: CONCERNS
Spike: true

<!-- verdict:end -->

# Design Review

Lens: Buildability — prior art, stack feasibility, library fit, integration risk.

## Prior Art Search

Every cited symbol was confirmed at the stated location: `APPEND_LEDGERS` (`.bkit/core/engine/ledgers/telemetry.ts:386`), `KIND_WRITERS` (`:412`), `identity()` (`:844`), `fold()` (`:1909`), `foldFrom()` (`:2012`), `MAX_ROWS_BEFORE_ROLLUP` (`:29`), `migrateLedgerText` / `migrateLedgers` (`.bkit/core/engine/ledgers/migrate.ts:43` / `:74`) called from `.bkit/core/engine/install/modules/core.ts:408`, `compactLedgerText` (`.bkit/core/engine/ledgers/compact.ts:54`), `clampFile` / `ledgerScan` (`.bkit/core/engine/commands/workflow/context.ts:438` / `:667`), `ASK_POINTS` / `AskSetting` (`.bkit/core/engine/shared/settings.ts:80` / `:92`), `actionHash` / `alreadyDone` (`.bkit/core/engine/ledgers/status.ts:245` / `:267`), `ledgersCommand` (`.bkit/core/engine/commands/workflow/ledgers.ts:672`), `.bkit/core/engine/audits/repo/ledger-integrity.test.ts`, `.bkit/templates/.github/workflows/bkit-cloud.yml`, `.bkit/templates/scripts/{graphify,serena}/`. No engine file imports `node:sqlite` today (text search, empty). `docs/capabilities.md` lists `LEDGERS.map` in `branches.ts` as a capability marker and nothing for search or links.

<!-- prettier-ignore -->
| Capability | What exists | Fit | Recommendation |
| --- | --- | --- | --- |
| One brain file, many kinds | `APPEND_LEDGERS` + `foldFrom(paths)`; mature, every ledger reader uses it | `foldFrom` already concatenates files; `fold()` is a stable sort by `ts` then last-write-wins per `identity()`. Gap: `KIND_WRITERS` is typed `Record<AppendKind, KindWriters>`, so `assumption`, `summary` and `rejection` each need a writer set before `tsc` passes. | `EXTEND-EXISTING` (agrees with design) |
| Identity `(repo, key)` for brain kinds | `identity()` switch; keyed kinds share one branch today | A new `case` group is a few lines. | `EXTEND-EXISTING` |
| Kind transitions | `writerProblem()` / `KIND_WRITERS` pass in `append` | Same pass, same refusal exit. | `EXTEND-EXISTING` |
| Merge migration | `migrateLedgers` (temp file + rename, drop of union-resurrected copies, dry run) | Covers the write mechanics and idempotence; the new part is the cross-file mapping and collision rule. | `EXTEND-EXISTING` |
| Ledger path registries | `SCHEMA_LEDGERS` (`migrate.ts:15`), `LEDGERS` (`branches.ts:160`), `UNION_PATHSPECS` (`ledgers.ts:104`, globs `docs/*.jsonl` and `.bkit/*.jsonl`), `.bkit/shared/.gitattributes:17-20`, root `.gitattributes`, `CLOSE_DOCS` regex (`branches.ts:1743`) | The globs and regex already cover new `docs/*.jsonl` / `.bkit/*.jsonl` files. `SCHEMA_LEDGERS` and `LEDGERS` are literal lists: see CRITICAL 3. | `EXTEND-EXISTING` |
| Link graph, dead-premise list, cycles, dangling keys | None in repo (text search of `telemetry.ts`, `ledgers.ts`, `context.ts`). Ecosystem: spool-memory and agent-soul use the same JSONL `supersedes` pattern; none is a Node library bkit could depend on | Design verdict `NEW` holds: no candidate covers it, and the logic is a reverse index over fold winners. | `BUILD-CUSTOM` |
| `bkit brain check` | `bkit ledgers check --plan` (`ledgers.ts:833`, `EXIT_ROWS_MISSING = 11`) | Moves under the new noun with its contract. | `EXTEND-EXISTING` |
| `bkit brain context --files` | `clampFile(..., "ledger", ...)`, `CLAMP_PROFILES` (`context.ts:181`) | The clamp, its "not read" notice and artifact plumbing cover output; selection is new code. | `EXTEND-EXISTING` |
| Keyword search | `ledgerScan` (`context.ts:667`): case-insensitive term overlap, strongest first, top 40, truncation notice. Node built-in `node:sqlite` with FTS5 compiled in for every platform (`deps/sqlite/sqlite.gyp` at v24.0.0 lists `'SQLITE_ENABLE_FTS5',` with no `conditions` block) | `ledgerScan` already searches ledger text on Node alone; what it lacks is fold awareness (it scans raw lines, superseded rows included) and per-field weighting. Feeding it the serialised fold winners closes the first gap with no new contract. Design verdict `NEW` with a "would change the output contract" reason is a close-but-different reason: see CRITICAL 1. | `ADAPT` `ledgerScan` first; FTS5 only on a measured ranking need |
| Brain update, deterministic half | `compactLedgerText` | Compaction becomes the cleanup step. | `EXTEND-EXISTING` |
| Brain update, inferred half | Four `bkit-utility-update-*` prompts; dispatched ad hoc from a direct chat, from no workflow (text search of `.bkit/core/workflows/` for them is empty) | The per-kind steps merge cleanly. Gap: brain update adds an orchestration loop (engine step, per-cluster fan-out, report, apply) that no file owns: see CRITICAL 4. | `EXTEND-EXISTING` |
| `bkit.brain.update.ask` | `readBkitConfig` (`settings.ts`), `ASK_POINTS` | `AskSetting` carries `ask` + `max` and `ASK_POINTS` is `<workflow>.<point>`; brain update has no `max` and is no workflow, so this is a new `BkitConfig` field, not an `ASK_POINTS` entry. | `EXTEND-EXISTING` (of `readBkitConfig`) |
| Rejection memory | `APPEND_LEDGERS` codec (the design itself adds a `rejections` entry); `actionHash` content-hash idea | Built on the codec, so the label `NEW` overstates it; nothing to reuse beyond that. | `EXTEND-EXISTING` |
| Recall log | Clamp-log helpers (`467-clamp-log-helpers-in-ledgers`), gitignored `tmp/**` (`.bkit/shared/gitignore:32`) | Same append-a-JSON-line shape under `tmp/`; the file is new. | `ADAPT` |
| Scheduled run | `bkit-cloud.yml` (595 lines; `workflow_run` + `workflow_dispatch`; prompt is `/bkit-auto <phase> <arg>`); `bkit-trivy.yml` cron | Credential detection and jobs are reusable; the phase route is not (CRITICAL 4). | `ADAPT` |
| Search by meaning | qmd (`@tobilu/qmd` 2.8.3, MIT); copy-and-own template shape of `scripts/graphify/` | Fits the opt-in slot; project-local `.qmd/index.yml` exists via `qmd init`. | `USE-AS-IS` behind a template |
| Old-path guard | `ledger-integrity.test.ts` | One assertion; scope must reach workflow bash blocks and templates (CRITICAL 2). | `EXTEND-EXISTING` |

## Stack Feasibility

Feasible on the approved stack: Node `>=24` (`package.json:42-43`), TypeScript 7, ESM, no runtime dependencies (`docs/technology.md` § Build & Output), Vitest 5 with real-filesystem fixtures. Every core piece is pure TypeScript over the existing codec, plus `node:crypto` (sha256) and `node:sqlite` (only if FTS5 is kept), both built in.

Constraints:

- **`node:sqlite` stability and warning.** Node docs: "Stability: 1.2 - Release candidate", with the change note "v24.15.0 … SQLite is now a release candidate." PR nodejs/node#61262 is described as "Mark the SQLite module as release candidate and remove the experimental warning." So 24.0 to 24.14 (allowed by `>=24`) still print an `ExperimentalWarning`; 24.15+ do not. This settles the design's "unverified" risk by reading, not by a spike: either raise `engines` to `>=24.15` or keep the in-process filter (design option A).
- **FTS5 on non-official Node builds.** Official builds bundle SQLite with FTS5 on every platform. Homebrew's `node` links Homebrew's `sqlite` (`depends_on "sqlite"`), whose formula sets `-DSQLITE_ENABLE_FTS5=1`. Distro builds that use a system SQLite are not verified. The local machine runs v24.16.0 with `node_shared_sqlite` false and SQLite 3.53.0. The design's `ledgerScan` fallback covers a build without FTS5; the probe should be a `CREATE VIRTUAL TABLE … USING fts5` on `:memory:`, not a catch-all on open.
- **Types.** `@types/node` 24.19.2 ships `sqlite.d.ts` (`DatabaseSync`, `DatabaseSyncOptions`), so `tsc` covers it.
- **Size headroom.** The four ledgers hold 885 lines, about 1.55 MB (`wc` on 2026-11-01); `.bkit/issues.jsonl` stays out. That is far below `MAX_ROWS_BEFORE_ROLLUP = 5000`, and a full parse per `context` call is milliseconds.
- **Host parity.** Some subagents that carry "Check gotchas first" have no shell (`bkit-plan-review-1` tools: Read, Grep, Glob, Serena, Write, Edit). The design's orchestrator-runs-context answer is buildable, but it means dispatch edits in `bkit-plan.md`, `bkit-build.md` and `bkit-debug.md`, and the rule is a shared clause, so it changes through `pnpm instructions:sync`.

## Library / API Evaluation

<!-- prettier-ignore -->
| Library / API | Maturity | Footprint | Types | License |
| --- | --- | --- | --- | --- |
| `node:sqlite` (`DatabaseSync`) | Added v22.5.0; unflagged v22.13 / v23.4; Stability 1.2 release candidate since v24.15.0 | Built in, zero install | `@types/node` 24.19.2 `sqlite.d.ts` | Node: MIT; SQLite: public domain |
| SQLite FTS5 (bundled) | Long-standing SQLite module; enabled in Node's `sqlite.gyp` for all platforms | Built in; the index for ~1.5 MB of text is a few MB under gitignored `tmp/` | SQL strings, untyped results (cast at the boundary) | Public domain |
| `ledgerScan` (in repo) | Used by `bkit-plan.md:293-294` and `bkit-ship.md:481` | None | TypeScript | Repo |
| `node:crypto` sha256 | Stable | Built in | Full | MIT |
| qmd `@tobilu/qmd` 2.8.3 (template only) | Active; MCP server; tests run on Bun, package runs on Node `>=22.0.0` | Native deps `better-sqlite3` ^13.0.3, `node-llama-cpp` 3.20.0, `sqlite-vec` 0.1.9, tree-sitter grammars; models auto-downloaded on first use (about 2 GB per the input); macOS needs Homebrew SQLite | TypeScript source | MIT |

No runtime dependency is added to `package.json`, which keeps the "no runtime dependency" line in `docs/technology.md` true. qmd stays outside the package.

## Integration Risk

Not a monorepo: one package, flat CI DAG (`docs/technology.md` § CI/CD).

<!-- prettier-ignore -->
| System touched | Blast radius | Mitigation in the design | Residual |
| --- | --- | --- | --- |
| Install / upgrade path (`mergeIntoBrain` after `migrateLedgers`) | Highest: rewrites every consumer's four ledgers on `bkit upgrade` | Pure per-line function, temp file + rename, dry run, determinism criterion, stubs kept | `SCHEMA_LEDGERS` must gain the new files, or `mergeCanonicalHashes` (`.bkit/core/engine/install/version-file.ts:189-197`) records a canonical hash for a data file (CRITICAL 3) |
| Codec `telemetry.ts` (2,273 lines; read by `bkit stats`, roadmap, harvest, triage) | Every ledger reader | Brain kinds isolated in identity; `proposal` rank inert on existing rows | The `proposal.basedOn` rank changes the shared `fold()` sort; needs a property test through compaction and chained proposals |
| Branch landing and conflict union (`branches.ts`, `ledgers.ts` `unionLedgers`) | Every design / plan close and ship conflict path | Stubs keep `merge=union` | `LEDGERS` is a literal list that must keep the stubs and gain `docs/brain.jsonl`; the "only `brain.ts` / `migrate.ts` name old paths" test would push the plan to remove them (CRITICAL 3) |
| Workflow bash blocks and templates that read one kind | plan Step 4, ship pending items, audit templates, roadmap updater | Path sweep | `--source=docs/deferrals.jsonl` turns into an empty stub read that returns `None.` with no error (CRITICAL 2) |
| 10 engine files naming old paths | As listed in the design (confirmed by text search) | Move to `readBrain` | None beyond CRITICAL 3 |
| Shipped text | 110 files and 576 mentions of `(knowledge\|decisions\|deferrals\|failures).jsonl` under `.bkit/core/` (this review's count, without the `docs/` prefix; the design counts 494 in 109) | Bulk rewrite + hand review | Also outside `.bkit/core/`: `.bkit/shared/docs/{technology,data-schema,deployments}.md`, `.bkit/shared/.gitattributes`, `.bkit/templates/.github/ISSUE_TEMPLATE/bkit-{bug,idea}.yml`, `scripts/harvest/ledgers.ts`, `scripts/readme/readme-art.mjs`, `.github/assets/*.svg` |
| `scripts/harvest/ledgers.ts` (bkit repo only) | Cross-repo stats from dogfood checkouts at mixed bkit versions | Not named | Must read both the four-file and the brain layout |
| Cloud template `bkit-cloud.yml` | Consumers who opt in | Opt-in trigger | No route for a non-workflow phase (CRITICAL 4) |

## PoC Approach

In a scratch clone, with no change to `dev`:

1. **Stub merge.** Build a real-git fixture: base = a ledger with rows, ours = the same file truncated to zero bytes, theirs = base + two appended rows, `merge=union` set. Run both `git merge` and `git merge --squash -X ours`. Record which lines survive. A reading of xdiff's hunk rule says ours' deletion and theirs' append are adjacent, so they conflict and union returns the old lines too; the fixture confirms it.
2. **Migration parity.** Run a throwaway `mergeIntoBrain` over copies of this repo's four ledgers. Assert fold-winner parity under the new identity, zero cross-file key collisions, identical `bkit stats` and roadmap output, and byte-identical output on a second run.
3. **Search.** Feed `ledgerScan` the serialised fold winners for five recorded lookups. Then build an FTS5 table over the same rows on Node 24.0 and 24.16, and compare result quality, build time and stderr.
4. **Context cost.** Run `selectForFiles` on three recorded tasks' file lists and compare characters / 4 against every current knowledge row.

## Unknowns & Blockers

- **Stub union result** (needs running code): whether `ours` emptied plus `theirs` appended gives back only the appended lines or the old lines as well, under both `git merge` and the close squash's `--squash -X ours`. Either result is safe under the identity-and-`ts` drop, but the plan relies on it (design plan 1's first task).
- **Fold parity on real data** (needs running code): that the `(kind, repo, key)` to `(repo, key)` identity change, the `relatedTo` backfill and the `proposal` rank leave fold winners, `bkit stats` and the roadmap render unchanged on this repo's 885 lines.
- **Keyword search quality** (needs running code): whether `ledgerScan` over fold winners finds the rows FTS5 with `bm25` finds on recorded lookups. This decides CRITICAL 1.
- **FTS5 on system-SQLite Node builds** (resolved by a runtime probe in code): official and Homebrew builds enable it; distro builds are unverified; the fallback covers it.
- **qmd project-local index** (resolvable by reading qmd source): whether `qmd init` writes the SQLite index under `.qmd/` (it would need a gitignore line) or under `~/.cache/qmd/index.sqlite`.
- **`ExperimentalWarning`**: resolved by reading. It prints on 24.0 to 24.14 and is gone from 24.15.0 (nodejs/node#61262).

## Verdict Reasoning

The design is buildable on the approved stack. It adds no runtime dependency, every engine extension point it names exists where it says, and its riskiest step, the upgrade migration, reuses a proven temp-file-and-rename path with idempotence. It is not a `PASS` because four addressable caveats remain. First, the keyword-search `NEW` verdict passes over an in-repo candidate (`ledgerScan`) for a close-but-different reason. Second, single-kind readers in workflow bash blocks and templates have no sanctioned read path after the merge and would silently read empty stubs. Third, two literal ledger-path registries conflict with the "only `brain.ts` / `migrate.ts` name old paths" rule. Fourth, brain update's orchestration and its scheduled route have no owning file. None of these is a `FAIL` condition: each is a design-level naming or scoping fix. Two unknowns can only be settled by running code (the stub union result and fold parity on real data), so `Spike` is `true`.

## CRITICAL

1. **Reuse caveat, keyword search:** Reuse & Prior Art marks keyword search `NEW` because "extending `ledgerScan` would change the output contract its plan-scan callers depend on". That is a close-but-different reason, and the candidate is `ledgerScan` in `.bkit/core/engine/commands/workflow/context.ts:667`. It already does Node-only keyword search over ledger text, and the design keeps it as the fallback, so it ships either way. Calling it with the serialised `readBrain` fold winners covers Success Criterion 4 without changing its contract. It needs no index, no content-hash cache, no warning filter and no FTS5 probe. The remaining gap is fold-aware filtering (`--kind`, current only) and field weighting. The design should do one of two things: make `ledgerScan` over fold winners the core `bkit brain search` and keep FTS5 for when a measured ranking gap appears, or record the measured reason that `bm25` ranking is needed at about 650 entries.
2. **Single-kind readers have no read path after the merge:** "One door for reads" names only `context` (by files), `search` (by text) and `check`. Today several readers fold one per-kind file. `bkit-plan.md:293-294` runs `bkit context ledger-scan --source=docs/deferrals.jsonl` / `--source=docs/failures.jsonl`, and `bkit-ship.md:481` runs the deferrals scan. The audit template `bkit-audit-deferrals.md:37` says "Fold `docs/deferrals.jsonl`", and `bkit-utility-update-roadmap` reads open deferrals and failures. After the migration those files are zero-byte stubs, so the scans return `None.` with exit 0, the silent-zero case the design's audit test is meant to catch. A bulk rename to `docs/brain.jsonl` mixes every kind into the result instead. The design should add a kind filter to the read verbs (for example `ledger-scan --kind=` / `bkit brain search --kind=` with no text, or a `bkit brain list --kind= [--current]`). It should also extend the old-path audit beyond engine source to `.bkit/core/workflows/*.md` bash blocks and `.bkit/core/docs/templates/`.
3. **Ledger path registries conflict with the old-path rule:** The design says only `brain.ts` and `migrate.ts` may name old paths, and the other files "each move to `readBrain` or the `brain` ledger entry". Two literal lists must keep the stubs. `LEDGERS` in `.bkit/core/engine/commands/workflow/branches.ts:160` resolves conflicts by union; dropping the stubs there turns a pre-upgrade branch's stub into a blocking conflict. `SCHEMA_LEDGERS` in `migrate.ts:15` must also gain `docs/brain.jsonl` and `.bkit/brain-rejections.jsonl`. Without them, `isSchemaLedger` returns false and `mergeCanonicalHashes` (`.bkit/core/engine/install/version-file.ts:189-197`) records a canonical hash for the migration's write to a data file. The design should name every registry (`APPEND_LEDGERS`, `SCHEMA_LEDGERS`, `LEDGERS`, both `.gitattributes` blocks) and say which gain the brain and rejection files and which keep the stubs. Ideally they import one exported constant from `brain.ts`, so the audit test holds without exceptions.
4. **Brain update's orchestration and scheduled route have no owning file:** Brain update is an orchestration loop. It runs `bkit brain update`, dispatches `@bkit-utility-update-brain` once per path cluster, writes the report, waits for approval, then runs `--apply`. The design runs it "from a direct chat", but no workflow or doc holds those steps, and the four updaters it replaces are single dispatches. The scheduled run is described as "a `brain-update` phase" in `bkit-cloud.yml`. That template's jobs run `/bkit-auto <phase> <arg>`, whose phases resolve through `bkit context --phase` against the five workflows (`WORKFLOWS` in `.bkit/core/engine/commands/workflow/worktrees.ts:51`), and its dispatch input requires an issue. The design should name where the orchestration steps live, for example a `.bkit/core/workflows/bkit-brain.md` workflow, an `.bkit/core/.bkit/*.md` procedure the direct chat follows, or an engine verb that prints the dispatch plan. It should also say how the cloud job invokes them without an issue.

## OPTIONAL

- Raise `engines.node` to `>=24.15`, where `node:sqlite` is a release candidate and prints no `ExperimentalWarning`; otherwise keep the design's in-process filter for 24.0 to 24.14. This is moot if CRITICAL 1 moves core search to `ledgerScan`.
- Probe FTS5 with `CREATE VIRTUAL TABLE t USING fts5(x)` on `:memory:` and fall back on that specific failure, so a missing module is told apart from a corrupt or locked cache file.
- Relabel the "Rejection memory" and "Recall log" rows from `NEW` to `EXTEND` / `ADAPT`: the first is an `APPEND_LEDGERS` entry on the existing codec, the second reuses the clamp-log append shape under `tmp/`.
- State that `bkit.brain.update.ask` is a new `BkitConfig` field read by `readBkitConfig`, not an `ASK_POINTS` entry: `AskSetting` also carries `max`, and points are `<workflow>.<point>`.
- Recall-log roll-up: rename the log to a run-scoped name before reading it, instead of read-then-truncate. `context` / `search` calls in other worktrees append to the same main-checkout file at the same time.
- List the writer sets for the new kinds in Data Model (`assumption`: `bkit-plan-generate`, `bkit-design-spike`, `utility`; `summary`: `bkit-utility-update-brain`; `rejection`: `utility`). `KIND_WRITERS` is an exhaustive typed record, and decision `ledger-writer-agents-carry-bash` applies. `bkit-design-spike` already carries Bash.
- Add a property test for the `proposal.basedOn` fold rank across compaction and chained proposals. The rank changes the sort every kind shares.
- Widen the path sweep beyond `.bkit/core/` to the files listed under Integration Risk. Make `scripts/harvest/ledgers.ts` read both layouts, because dogfood checkouts upgrade at different times.
- Plan the dispatch edits for subagents without a shell (for example `bkit-plan-review-1`). The orchestrator runs `bkit brain context` before dispatch in `bkit-plan.md`, `bkit-build.md` and `bkit-debug.md`, and the "Check gotchas first" rule changes through `pnpm instructions:sync`.
- qmd template: pin `@tobilu/qmd` to an exact version, and gitignore `.qmd/` index files if `qmd init` writes the database there.

## OUT OF SCOPE

- GitHub's server-side update-branch ignores `merge=union` (`.bkit/workflows.md:250`). The stubs inherit that existing limitation, and the close and ship paths already merge locally to work around it.
- The overall size of the five-plan programme and the plan 1 split are planning questions outside the buildability lens.
