# Design: Brain — one knowledge ledger with typed links, file-scoped loading, keyword search and brain update

## Related Issues

- #795 — Merge the four docs/ ledgers into docs/brain.jsonl with a migration (open)
- #792 — Typed links and dead-premise check (open, sub-issue of #546)
- #791 — Load ledger rows by path overlap (open, sub-issue of #546)
- #793 — FTS5 keyword search over the ledgers (open, sub-issue of #546)
- #794 — qmd template for search by meaning (open, sub-issue of #546)
- #710 — Ledger compaction: drop superseded rows, preserve age (closed)

## Acceptance Scenario

Built from the input's `Draft Acceptance Scenario` (accepted in Q29). Changes against the draft are recorded as `Decisions` rows D-AS1 to D-AS4.

### Narrative

Before I change some files, my agent runs one command and gets back the brain rows that name those files or a folder above them, plus a short capped summary, instead of reading a whole ledger. When I replace, close or falsify a row, the append prints every current row that rested on it, and `bkit brain check` lists all of them whenever I ask. On demand or on an opt-in schedule, brain update tidies the brain, re-tests rows against the code, proposes links, summaries, contradiction fixes, pattern rows and fades, and, depending on `bkit.brain.update.ask`, either offers them to me for approval or applies them and lists what it applied.

### Success Criteria

1. The pre-code ledger read costs measurably fewer tokens: characters / 4 of what the agent is told to read, before (every current `docs/knowledge.jsonl` row) and after (`bkit brain context` output), on the same three recorded tasks. No shipped prompt, rule or doc index tells an agent to read a whole ledger file.
2. `bkit upgrade` turns the four ledgers into `docs/brain.jsonl` envelope rows with no line lost. Running it twice, or on two branches from the same base, gives byte-identical output. Fold winners (under the new identity), `bkit stats` figures and the `docs/roadmap.md` render are unchanged.
3. Every link is followed by a tool: a `SUPERSEDED` row's successor is found through the reverse of `links.supersedes`. Superseding, closing or falsifying a row prints every current row whose `links.dependsOn` names it, at write time and in `bkit brain check`. A `SUPERSEDED` row with no successor link is listed as a check finding.
4. Keyword search runs on Node alone (`node:sqlite` FTS5, gitignored index). Search by meaning is the opt-in qmd template, off by default.
5. With `ask: true`, brain update changes nothing beyond mechanical cleanup without owner approval, and a rejected suggestion is not offered again until one of its target rows changes. With `ask: false`, it applies the same changes directly and lists each one in its run report. Two concurrent runs never apply one change twice, and a brain-update row never outranks content it did not see.

### Key Edge Cases

- **Pre-upgrade branch:** a branch opened before the upgrade appends old-shape rows to `docs/knowledge.jsonl` after `dev` merged. The zero-byte stub union-merges the branch's lines in. Readers fold `[docs/brain.jsonl, the four stubs]` and drop any stub line whose identity and `ts` the brain already holds. The next brain update moves the new lines into the brain and empties the stub again. A pre-upgrade worktree whose prompts still call `bkit ledgers append --ledger=knowledge` writes to the brain through the legacy alias.
- **Migration run twice or on two branches:** the migration is a pure line-by-line function of its input, so both sides produce identical lines and union keeps one copy.
- **Same key in two old files** (none in this repo today): the row with the earlier first `ts` keeps the key, and the other becomes `{key}-{oldkind}` with a `relatedTo` link to it. The same rule maps later stragglers of that old kind.
- **Kind change off the allowed list** (e.g. `decision` → `deferral`): refused with exit 8, nothing written.
- **Bad links:** a link names a key that does not exist, or `dependsOn` links form a loop. `bkit brain check` reports both and never crashes or recurses without bound.
- **Concurrent brain updates (no lock):** two runs propose the same change under the same deterministic suggestion id, so the second append is skipped as already applied. A brain-update row based on an older version of an entry yields in the fold to a newer row it did not see, for example a content change landed later from a feature branch.
- **Recall across branches and people:** two branches write different `lastRecalled` dates for one entry. The fold takes the newest date across all of the entry's rows, so a merge never loses a recent recall.
- **Subagent with no shell:** the orchestrator runs `bkit brain context` and passes the rows in, the way subagents hand rows back for `append` today.

### Process Sketch

- WHEN an agent starts a task touching files F → THEN it gets the current rows whose `references` name F or a folder above F, plus the capped always-loaded summary, with a token estimate.
- WHEN a row is appended as `SUPERSEDED`, `CLOSED` or `FALSIFIED` → THEN the append prints the current rows whose `dependsOn` names it, and `bkit brain check` lists them too.
- WHEN `bkit upgrade` runs on an old install → THEN the four ledgers become `docs/brain.jsonl` envelope rows, exact-key references become `relatedTo` links, the old files become zero-byte stubs, and the fold result is unchanged.
- WHEN a pre-upgrade branch lands rows in a stub → THEN readers still see them, and the next brain update moves them into the brain.
- WHEN brain update runs with `ask: true` → THEN cleanup is applied and a `Suggested Changes` report is written; only approved rows are appended, and rejections are recorded until a target row changes.
- WHEN brain update runs with `ask: false` → THEN the same changes are applied directly and listed in the report.
- WHEN a row is old, has no inbound link and was not recalled by anyone for the fade window → THEN brain update proposes it to fade.

## Reuse & Prior Art

<!-- prettier-ignore -->
| Capability | Prior art | Verdict | Why |
| --- | --- | --- | --- |
| One file for every brain kind | `APPEND_LEDGERS` and `foldFrom(paths)` in `.bkit/core/engine/ledgers/telemetry.ts:386` / `:2012` | `EXTEND` | `foldFrom` already merges several files. The four entries become one `brain` entry taking six kinds, and readers fold `[brain, stubs]`. |
| Identity `(repo, key)` | `identity()` in `telemetry.ts:844` | `EXTEND` | A per-kind-class case: the six brain kinds return `brain {repo} {key}`. `feature`, `friction`, `chat` and `run` keep `(kind, repo, key)`, because FIDs and brain keys often share an issue-number prefix. |
| Allowed kind changes | `KIND_WRITERS` and the writer check in `append` (`telemetry.ts:412`) | `EXTEND` | `KIND_TRANSITIONS` sits beside it and runs in the same pass, with a doc-table parity test like the one `telemetry.test.ts` holds `KIND_WRITERS` to. |
| Envelope (`status`, `summary`, `links`) | `.bkit/jsonl.md` § Generic Fields; `normalize()` and `validate()` in `telemetry.ts` | `EXTEND` | `summary` already exists (required on `knowledge` / `decision`, optional elsewhere). `links` is an optional addition that § Versioning tolerates, so `schema` stays `3`. |
| `assumption` kind with a required `falsifiedBy` | `validate()` refusing a `deferral` without `reason` | `EXTEND` | The same refusal shape. Plan templates already capture assumptions (`docs/templates/bkit-plan.md:104`), so the writers gain a place to put them, not a new way to write them. |
| `summary` kind | The same codec | `EXTEND` | A sixth brain kind with `relatedTo` links to the rows it summarises; no separate store. |
| Merge migration | `migrateLedgers` / `migrateLedgerText` in `.bkit/core/engine/ledgers/migrate.ts` (the `schema: 2` rewrite and its drop of a union-resurrected copy); called from `.bkit/core/engine/install/modules/core.ts:408` | `EXTEND` | Same install / upgrade path, same idempotence rule, same temp-file-and-rename write. A row in `docs/migrations.md`. |
| `merge=union` on the brain and the stubs | `.bkit/shared/.gitattributes` managed block (`.gitattributes:17-21`) | `EXTEND` | One added line; the four old lines stay for the stubs. |
| Link graph, dead-premise list, cycle and dangling-key detection | None. Searched `telemetry.ts`, `ledgers.ts` (its `check` verb checks plan-named rows only), `context.ts`; the input's survey rejected TMS, Graphiti and ADR tools as dependencies | `NEW` | No link resolver exists. A reverse index over fold winners plus an iterative walk is a few dozen lines in `.bkit/core/engine/ledgers/brain.ts`, on top of the existing fold. |
| `bkit brain check` | `bkit ledgers check --plan` in `.bkit/core/engine/commands/workflow/ledgers.ts` | `EXTEND` | Moves under `brain`; `--plan` keeps its exit code `EXIT_ROWS_MISSING`; plain `check` adds the link findings and always exits 0. |
| `bkit brain context --files` | `ledgerScan` and `clampFile(..., "ledger", ...)` in `.bkit/core/engine/commands/workflow/context.ts:438` / `:667`; beads `bd prime` as the shape | `EXTEND` | Reuses the clamp, its "dropped content was NOT read" notice and the artifact plumbing; adds path-overlap selection and a `tokensEst` figure. |
| Keyword search | `node:sqlite` FTS5 (Node built-in: `deps/sqlite/sqlite.gyp` at v24.0.0 sets `SQLITE_ENABLE_FTS5`; bkit requires `node >=24`, this machine runs v24.16.0); `ledgerScan` as fallback | `NEW` | Nothing in the engine indexes ledger text (no `node:sqlite` import today). Extending `ledgerScan` would change the output contract its plan-scan callers depend on, so search is a new command on a runtime built-in, and `ledgerScan` stays the fallback. |
| Brain update, deterministic half | `compactLedgerText` in `.bkit/core/engine/ledgers/compact.ts` | `EXTEND` | Compaction becomes its cleanup step; adds straggler moves, recall roll-up, fade candidates and the check. |
| Brain update, inferred half | `.bkit/core/prompts/bkit-utility-update-{knowledge,decisions,deferrals,failures}.md` | `EXTEND` | Their per-kind steps merge into one `bkit-utility-update-brain` prompt; the `Cross-Ledger Impact` sections disappear because there is one file. |
| `bkit.brain.update.ask` | `ASK_POINTS` / `AskSetting` in `.bkit/core/engine/shared/settings.ts:80` (`bkit.workflows.*.ask`) | `EXTEND` | Same boolean shape, read by the same reader, in a `bkit.brain` section because brain update is not a workflow. |
| Suggested-changes report and approval | Audit reports under `docs/audits/{YYYYMM}/` from `@bkit-audit-generate` | `EXTEND` | Q17 asks for "the way audit findings are"; the report sits beside audit reports. |
| Rejection memory | `actionHash` / `alreadyDone` in `.bkit/core/engine/ledgers/status.ts` (content-hash dedupe of engine actions) | `NEW` | No store of rejected suggestions exists. A small committed `.bkit/brain-rejections.jsonl` reuses the content-hash idea. |
| Recall log | The run-scoped gitignored clamp log (`.bkit/workflows.md:368`) | `NEW` | A new gitignored file under the main checkout's `tmp/`; the pattern is reused, the file is new. |
| Newest `lastRecalled` across an entry | `firstTs` stamping in the fold and in compaction (`.bkit/jsonl.md` § Compaction) | `EXTEND` | Same "computed across the entry's rows" rule, with max instead of min. |
| Scheduled run | `.bkit/templates/.github/workflows/bkit-cloud.yml` (claude-code-action and opencode jobs); cron shape of `bkit-trivy.yml` | `EXTEND` | Adds an opt-in `schedule` trigger and a brain-update phase to the existing cloud-agent template; no engine scheduler. |
| Search by meaning | qmd (MIT, Node, FTS5 + sqlite-vec, MCP server); copy-and-own shape of `.bkit/templates/scripts/graphify/` and `serena/` | `EXTEND` | Template only, with a per-row markdown export because qmd treats one file as one document. |
| Old-path regression guard | `.bkit/core/engine/audits/repo/ledger-integrity.test.ts` | `EXTEND` | One added assertion: no non-test engine file outside the brain module names an old ledger path. |
| Legacy `--ledger=<old>` writes | `ledgersCommand` in `ledgers.ts:671` | `EXTEND` | Old ledger names map to the brain for the stub release range. |

## Architecture

**Shape:** the brain is one more ledger inside the existing engine (brainstorm 1, Approach A), read and written through one choke-point module (brainstorm 3, Approach A), whose logic is pure functions over the folded row set with thin CLI verbs on top (brainstorm 2, Approach A). JSONL in git stays the only store; every index is a disposable, gitignored cache.

**Components** (each `NEW` traces to a `NEW` row in `Reuse & Prior Art`):

1. **Codec** (`EXTEND` `.bkit/core/engine/ledgers/telemetry.ts`):
   - `APPEND_LEDGERS`: the four entries become `brain: { file: "docs/brain.jsonl", kinds: ["knowledge", "decision", "deferral", "failure", "assumption", "summary"] }`, plus `rejections: { file: ".bkit/brain-rejections.jsonl", kinds: ["rejection"] }`.
   - `identity()`: the six brain kinds return `brain {repo} {key}`; every other kind keeps its tuple.
   - `validate()`: envelope rules, `assumption` requires `falsifiedBy`, `links` values are arrays of key strings.
   - `KIND_TRANSITIONS` beside `KIND_WRITERS`, checked in the same `append` pass.
   - `fold()`: two narrow additions, both inert on every row that exists today: a row carrying `proposal.basedOn` ranks at its `basedOn`, not its `ts`; `lastRecalled` on the winner is the newest value across the entry's rows (the `firstTs` pattern, with max).
2. **Brain module** (`NEW` `.bkit/core/engine/ledgers/brain.ts`): the only engine file besides `migrate.ts` that names an old ledger path.
   - `readBrain(root)`: folds `[docs/brain.jsonl, docs/knowledge.jsonl, docs/decisions.jsonl, docs/deferrals.jsonl, docs/failures.jsonl]`, normalising old-shape rows into the envelope at read time and dropping a stub line whose identity and `ts` the brain already holds.
   - `linkIndex(rows)`: forward and reverse maps for `supersedes`, `dependsOn` and `relatedTo`.
   - `dependentsOf(keys)`, `checkFindings(rows, now)`: dead premises, dangling keys, `dependsOn` cycles (iterative walk with a visited set), passed `validUntil`, `SUPERSEDED` rows without a successor link, stale proposals, same-identity rows with equal `ts` but different content, malformed and old-shape counts per source file.
   - `selectForFiles(rows, files)` and `alwaysLoaded(rows)`: path-overlap selection and the capped summary.
   - `suggestionId(action, targets, payload)`: the deterministic id brain update and `append` share.
3. **Search index** (`NEW` `.bkit/core/engine/ledgers/brain-search.ts`): builds a `node:sqlite` FTS5 database from `readBrain` winners; never re-implements the fold.
4. **Merge migration** (`EXTEND` `.bkit/core/engine/ledgers/migrate.ts`): `mergeIntoBrain(root, dryRun)`, called from `.bkit/core/engine/install/modules/core.ts` right after `migrateLedgers`.
5. **CLI** (`EXTEND` `.bkit/core/engine/commands/workflow/ledgers.ts`; the plan may split the `brain` noun into a sibling file): `bkit brain append|check|compact|context|search|update`. `bkit ledgers` keeps `commit`, `union`, `only-bookkeeping`, `triage` and `append --ledger=friction|stats`, and accepts `append --ledger=<knowledge|decisions|deferrals|failures>` as a legacy alias that writes to the brain with one stderr notice, for the stub release range.
6. **Brain update prompt** (`EXTEND`, from the four updaters): `.bkit/core/prompts/bkit-utility-update-brain.md`, replacing `bkit-utility-update-knowledge`, `-decisions`, `-deferrals`, `-failures`. `-roadmap`, `-tracker`, `-documentation` stay.
7. **Local files** (`NEW`, gitignored under the main checkout's `tmp/bkit-brain/`, resolved through `git rev-parse --git-common-dir` so a deleted worktree loses nothing): `recall.jsonl` and `fts-{hash}.db`.
8. **Committed file** (`NEW`): `.bkit/brain-rejections.jsonl`, `merge=union`.
9. **Templates** (`EXTEND`): an opt-in `schedule` trigger and `brain-update` phase in `.bkit/templates/.github/workflows/bkit-cloud.yml`; a qmd template at `.bkit/templates/scripts/qmd/` (export script, `.qmd/index.yml`, README section in `.bkit/templates.md`).

**Boundaries and integration points:**

- **One door for reads:** prompts, rules and docs read the brain only through `bkit brain context`, `search` and `check`. The six prompts that carry "Check gotchas first" (`bkit-build-plan-execute`, `bkit-debug-failure-diagnose`, `bkit-plan-review-1`, `bkit-plan-review-2`, and the updaters that become `bkit-utility-update-brain`) and `.bkit/core/.agents/rules.md:116` switch to `bkit brain context --files=…`. The four ledger rows in `.bkit/core/.agents/docs.md` become one `docs/brain.jsonl` row that says to read it through those commands.
- **One door for engine code:** a repo audit test fails when a non-test engine file other than `brain.ts` and `migrate.ts` contains an old ledger path. Today 10 engine source files name them (`cli.ts`, `migrate.ts`, `telemetry.ts`, `stats.ts`, `challenge.ts`, `workflows.ts`, `context.ts`, `ledgers.ts`, `decisions.ts`, `branches.ts`); each moves to `readBrain` or the `brain` ledger entry.
- **Install / upgrade:** `mergeIntoBrain` runs in the normal write path, dry run computes the same writeset, and a row goes in `docs/migrations.md`. The same function is the straggler mover that brain update calls. `bkit check` counts an old ledger with content and no `docs/brain.jsonl` beside it as a pending write (drift, exit 1 until `bkit upgrade`), the way § Versioning treats an unmigrated line. A non-empty stub beside the brain is an advisory only (exit 0), with the fix inline: `bkit upgrade` or `bkit brain update`. Readers already see stub rows, so nothing is lost while it waits.
- **Close squash** (`.bkit/workflows.md:250`): stays as is. The stubs keep `merge=union`, so a pre-upgrade branch's stub lines union in and its "line the branch added that `origin/dev` lacks" test (exit 18) still holds at landing. Straggler moves happen later, on `dev`, inside brain update.
- **Host parity:** where a subagent has no shell, its orchestrator runs `bkit brain context` and passes the rows in the prompt input, as subagents hand rows back for `append` today.
- **Mirrors and indexes:** the path sweep (494 mentions across 109 files under `.bkit/core/`) is a bulk mechanical rewrite, then a hand review of every reading instruction; `.bkit/prompts.md`, `.bkit/workflows.md`, `.bkit/instructions.md`, `.bkit/templates.md`, `.bkit/cli.md` and `.bkit/jsonl.md` change in the same plan as the files they index; `docs/` templates change only the ledger names and read instructions (Q9).

**Out of scope** (declared here; deferral rows reference this list):

- `.bkit/issues.jsonl` `feature` rows joining the brain (Q14: the format allows it later).
- `.bkit/friction.jsonl` and `.bkit/stats.jsonl` (stay separate, Q14).
- Retiring the four stubs and the legacy `--ledger=<old>` alias, once no supported install predates the merge.
- Transcript or chat-history recall.

## Data Model

**`docs/brain.jsonl` envelope** (`schema: 3`; § Generic Fields stays the top section, the fields below follow it):

<!-- prettier-ignore -->
| Field | Type | Rule |
| --- | --- | --- |
| `kind` | `knowledge` \| `decision` \| `deferral` \| `failure` \| `assumption` \| `summary` | May change only along `KIND_TRANSITIONS`. |
| `key` | `string` | Unique across the whole brain; identity is `(repo, key)`. |
| `status` | per-kind vocabulary (below) | `bkit brain append` fills the kind's default when absent; the migration fills it the same way. |
| `summary` | `string` | One line. Required on every brain row; `append` and the migration fill an absent one from the first sentence of `description`, capped at 200 characters. |
| `links` | `{supersedes?: string[], dependsOn?: string[], relatedTo?: string[]}?` | Keys only. `supersedes` sits on the new row and names the row it replaces; `dependsOn` names premises; `relatedTo` is undirected "see also" and the premise check ignores it. |
| `references` | `string[]?` | Paths, commits, issues, PRs, as today. Exact-key entries stay in place after the backfill. |
| `lastRecalled` | `number?` | Unix ms at UTC-day grain. Written only by brain update; the fold returns the newest value across the entry's rows. |
| `proposal` | `{id: string, basedOn: number}?` | Only on rows brain update writes. `id` = suggestion id; `basedOn` = `ts` of the winner it was computed from. The fold ranks the row at `basedOn`. |
| per-kind fields | flat, as today | `rationale`, `alternatives`, `severity`, `reason`, `type`, `category`, `rootCause`, `remediation`, `source`, `description` keep their current names and places. |

**Status vocabularies.** "Current" means not in the terminal set `SUPERSEDED`, `CLOSED`, `FALSIFIED`, `FADED`. `TRIAGED` is current.

<!-- prettier-ignore -->
| Kind | Statuses (default first) | Terminal |
| --- | --- | --- |
| `knowledge`, `decision`, `summary` | `ACTIVE`, `SUPERSEDED`, `FADED` | `SUPERSEDED`, `FADED` |
| `deferral`, `failure` | `OPEN`, `TRIAGED`, `CLOSED`, `FADED` | `CLOSED`, `FADED` |
| `assumption` | `ACTIVE`, `FALSIFIED`, `SUPERSEDED`, `FADED` | `FALSIFIED`, `SUPERSEDED`, `FADED` |

`failure` keeps accepting a free-string `status` as today; an unknown value counts as current.

**New per-kind fields:**

- `assumption`: `falsifiedBy` (required, the concrete observation that would break it), `validUntil?` (unix ms), `description?`. A row without `falsifiedBy` is refused with exit 8.
- `summary`: `description` (the summary text, at most 2,000 characters), `links.relatedTo` (required, the rows it summarises), `references?` (paths of the cluster; a summary with no path is always-loaded).

**Kind transitions** (`KIND_TRANSITIONS`; any other kind change exits 8):

<!-- prettier-ignore -->
| From | To | Status on the new row | Fields dropped |
| --- | --- | --- | --- |
| `failure` (any status) | `knowledge` | `ACTIVE` | `severity`, `category` |
| `deferral` with `reason: "needs-decision"` | `decision` | `ACTIVE` | `reason`, `type`, `severity`, `category` |
| `assumption` `ACTIVE` | `knowledge` | `ACTIVE` | `falsifiedBy`, `validUntil` |

Readers that count a kind (`bkit stats` deferral and failure counts, `bkit ledgers triage`) count entries whose winner has that kind. The deferral-reason rate reads the entry's last row of kind `deferral`, so a transition never erases a verdict.

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
- A line whose identity and `ts` the brain already holds is dropped (the `migrateLedgerText` rule), which makes a second run a no-op.
- Collision rule: the same key in two old files → the entry with the earlier first `ts` keeps the key; the other becomes `{key}-{oldkind}` and gains `relatedTo` to the kept key. Later stragglers of that old kind with that key map to the renamed key.
- Afterwards each old file is truncated to zero bytes and kept; `.gitattributes` gains `docs/brain.jsonl merge=union` and keeps the four old lines.

**`.bkit/brain-rejections.jsonl`** (kind `rejection`, identity `(kind, repo, key)`): `key` = suggestion id, `summary` = the rejected suggestion in one line, `references` = target keys, `by` = the owner's chat. Because the id hashes each target's winner `ts`, a changed target produces a new id and the suggestion returns; brain update prunes rows whose id no longer matches any open suggestion's inputs.

**Suggestion id:** first 12 hex of sha256 over canonical JSON `{action, targets: [[key, winnerTs], …] sorted by key, payload}`.

**`tmp/bkit-brain/recall.jsonl`** (main checkout, gitignored): one line per returned key, `{"key": "…", "at": <unix ms>}`, appended by `context` and `search`; brain update rolls it up and truncates it.

**`tmp/bkit-brain/fts-{12-hex content hash}.db`:** FTS5 table `rows(key UNINDEXED, kind UNINDEXED, status UNINDEXED, summary, body, refs)`, where `body` joins `description`, `rationale`, `rootCause`, `remediation`, `falsifiedBy`; ranked by `bm25` with `summary` weighted highest. Built to a temp name, then renamed; older `fts-*.db` files are deleted after a successful build.

**Settings** (`package.json`): `bkit.brain.update.ask` (boolean, default `true`). The fade window (180 days) and the always-loaded cap (2,000 tokens) are engine constants in `brain.ts`, each with the decision row that records where its number came from.

## Components / Flows

**Build order** (Q27; one plan each, each plan shippable on its own):

1. **Merge, envelope, links** (#795 with #792): codec changes, `brain.ts` read and link functions, `mergeIntoBrain`, stubs, legacy alias, `bkit brain append` and `bkit brain check`, `assumption` and `summary` kinds, `KIND_TRANSITIONS`, the writer-table rows, the path sweep, the old-path audit test. Its first task is a real-`git merge` fixture test of the stub case (base = old content, ours = empty, theirs = old + appended lines), because the plan relies on the union result.
2. **Loading rows by file** (#791): `bkit brain context`, the always-loaded summary, the prompt and rule switch, the recall-log write, and the before / after token measurement on three recorded tasks.
3. **Keyword search** (#793): `bkit brain search`, the FTS5 index, the `ledgerScan` fallback, the recall-log write.
4. **Brain update**: `bkit brain update`, `bkit-utility-update-brain`, `bkit.brain.update.ask`, rejections, recall roll-up, fading, the `proposal` fold rank, the opt-in schedule in `bkit-cloud.yml`, and retirement of the four updater prompts.
5. **qmd template** (#794).

**`bkit brain append --rows=<file|->`:** same contract as `bkit ledgers append` today (fills `schema`, `ts`, `repo`, `bkit.version`, `firstTs`, `updates`; refuses on any bad row, exit 8, nothing written), plus:

- Fills `status` and `summary` when absent; refuses a kind change off `KIND_TRANSITIONS` and an `assumption` without `falsifiedBy`.
- A row carrying `proposal`: skipped with `stale` when the entry's winner `ts` is not `proposal.basedOn`; skipped with `applied` when any row of the entry already carries that `proposal.id`. Neither is an error.
- After writing, prints `dependents:` with every current row whose `links.dependsOn` names a key this append turned terminal. Always exit 0 for this reason.

**`bkit brain check [--plan=<file>] [--json]`:** with `--plan`, today's `bkit ledgers check --plan` contract and exit code. Without it, prints the findings from `checkFindings` grouped by type, plus per source file: rows read, malformed lines, old-shape rows normalised, stub lines waiting to move. Exit 0; it is a list for someone to act on, never a gate (Q5).

**`bkit brain context --files=<list|-> [--json]`:**

1. `readBrain`, keep current rows.
2. Normalise each `references` entry: strip a leading `./`, a trailing `/`, a `:line` suffix and a trailing ` §…` qualifier.
3. Select rows where a normalised reference equals a file or is a folder above it at any depth (Q8).
4. Rank: exact file before folder, nearer folder before farther; then kind order `failure` (current), `knowledge`, `assumption`, `decision`, `deferral`, `summary`; then newest `ts`.
5. Append the always-loaded part: current `summary`, `knowledge` and `assumption` rows with no path in `references`, newest first, hard-capped at 2,000 tokens (characters / 4).
6. Write through `clampFile(..., "ledger", ...)`; list dropped rows by key under the clamp's "not read" notice, with `bkit brain search` as the way in.
7. Print `tokensEst`; append each returned key to the recall log.

**`bkit brain search "<text>" [--kind=] [--all] [--limit=20] [--json]`:** hash the brain and stub bytes; open `tmp/bkit-brain/fts-{hash}.db` or build it; query FTS5 with `bm25`; current rows only unless `--all`. On a `node:sqlite` open or FTS5 error, fall back to `ledgerScan` over the fold winners and say so on stderr. Append returned keys to the recall log.

**`bkit brain compact [--dry-run]`:** today's compaction over `docs/brain.jsonl`, using the same fold rank (so a `proposal` row ranks at `basedOn`), stamping `lastRecalled` like `firstTs`.

**Brain update** (on demand from a direct chat, or the opt-in schedule; never inside a design / plan / build / debug / ship run, Q16):

1. **`bkit brain update`** (engine, deterministic, always applied as mechanical cleanup):
   - Move stub stragglers into the brain (normalise, apply the collision map), then truncate the stubs.
   - Compact the brain.
   - Roll the recall log up: append a `lastRecalled` row for an entry only when the log's newest date is later than the stored value by more than half the fade window (90 days), then truncate the log.
   - Prune void rejection rows.
   - Write a candidate packet to `tmp/bkit-brain/update-{run}/`: the `check` findings, fade candidates (current, `max(ts, lastRecalled)` older than 180 days, no inbound link from a current row), rows batched by path cluster, and the `Open Questions & Assumptions` sections of archived plans not yet seen.
2. **`@bkit-utility-update-brain`** (inferred), one batch per path cluster so no context holds the whole brain:
   - The per-kind steps of the four retired updaters: re-test each row against docs and code; close, triage, correct, supersede.
   - Propose `dependsOn` / `supersedes` upgrades of backfilled `relatedTo` links, and successor links for `SUPERSEDED` rows that lack one.
   - Find pairs of current rows that say opposite things and propose a `supersedes` link or a correction (Q22).
   - Find repeats across rows and plan assumption sections and propose one `knowledge` or `assumption` row, `relatedTo` its sources (Q23); `.bkit/friction.jsonl` excluded.
   - Rebuild `summary` rows per cluster (Q18).
   - Propose fades for the candidates.
   - Output: every suggestion as a row with its `suggestionId` and `proposal.basedOn`, dropping any whose id is in the rejection log.
3. **Mode** (`bkit.brain.update.ask`, read through the settings reader):
   - `true` (default): write `docs/audits/{YYYYMM}/brain-update-{YYYYMMDD-HHMMSS}-{4 hex}.md` with a `Suggested Changes` table (`#`, Action, Targets, Change, Why, Suggestion id) and the machine rows in a fenced JSON block. The owner approves rows in chat; the orchestrator runs `bkit brain update --apply=<report> --approve=<#,…> --reject=<#,…>`, which appends approved rows through `bkit brain append` and records rejections.
   - `false`: the same `--apply` with every row approved; the report lists what was applied.
   - Headless (the scheduled run) never asks: it applies step 1 and writes the report, and approval waits for a chat.
4. **Commit:** mechanical cleanup and approved rows commit straight to the current branch, no PR (Q17), naming only the brain update's own paths.

**Concurrency without a lock** (Q28): report names carry a random suffix, so runs never overwrite each other. Identical suggestions share an id, so `append` skips the second as `applied`. A suggestion computed from an outdated winner is skipped as `stale` on the same checkout, and across branches the fold ranks it at its `basedOn`, so newer content from another branch wins and the next run re-proposes against it. Rejections recorded by either run carry the same id, so both recognise them.

**qmd template:** `.bkit/templates/scripts/qmd/bkit-qmd-export.mjs` writes one gitignored markdown file per current brain row (front matter: key, kind, status, links) under `tmp/bkit-brain/qmd/`; `.qmd/index.yml` points qmd at that folder; a README section covers the ~2 GB model download and Homebrew SQLite on macOS. Off by default; nothing binary committed.

## Decisions

<!-- prettier-ignore -->
| Decided | Alternatives | Why |
| --- | --- | --- |
| The brain is one more `APPEND_LEDGERS` entry on the existing codec, read through one choke-point module (`brain.ts`) of pure functions with thin verbs | A separate brain codec; a frozen-old-files "virtual brain"; a SQLite index as the only read path | One fold, one writer check, one migration path; `bkit stats` parity is safest when the fold is not duplicated. The choke point makes "no engine file reads an old path" testable, which catches the reader that silently reports zero deferrals. |
| Old files become zero-byte stubs, kept with `merge=union`; retired later through a `docs/migrations.md` release range | Delete them (the #795 body's wording); keep them full for a release | Deleting turns every pre-upgrade branch merge into a modify/delete conflict that neither `merge=union` nor the close squash's `-X ours` resolves, and "keep the deletion" drops the branch's rows. Departs from #795's "delete the four files", not from a grill answer; the union result must be proven by a real `git merge` test before the plan relies on it. |
| Departs from Q6: backfilled links are written inside the one-time envelope rewrite, not as appended same-`key` rows | Q6 as stated: append one link row per entry | Appended rows mint a `ts`, so two branches that each run `bkit upgrade` produce different rows that union keeps both of, doubling about 650 lines and inflating `updates`. Q13 already rewrites every line once, so links ride that rewrite and the migration stays a pure function. Owner to confirm (Risks). |
| Backfilled exact-key references become `links.relatedTo` | Backfill as `dependsOn`; infer `supersedes` | A reference only says "this row cites that one", not "rests on it". As `dependsOn`, citations of superseded rows would flood the dead-premise list on day one. Brain update proposes `dependsOn` / `supersedes` upgrades under owner review. Interprets Q6, which names no link type. |
| Reads Q13's "per-kind body" as the flat per-kind field set beside the envelope; no nested `body` object | A nested `body` per kind | Every current reader of `rationale`, `severity`, `reason` (`bkit stats`, `bkit ledgers triage`, `bkit decisions pending`, the roadmap render, the audit templates) keeps working. A generic reader needs only the envelope fields. A nested body is a cost Q13 did not surface, with no new capability. Owner to confirm (Risks). |
| `schema` stays `3` | `schema: 4` | `links`, `proposal`, `lastRecalled` are optional additions; § Versioning already makes readers tolerate absent fields. |
| Identity `(repo, key)` for the six brain kinds only | Change `identity()` for every keyed kind | FIDs and brain keys often share an issue-number prefix (`546-…`); a global change can fold a `feature` and a `decision` into one entry wherever both files are folded. A test pins this. |
| `KIND_TRANSITIONS` = three pairs (failure → knowledge, needs-decision deferral → decision, active assumption → knowledge), each with its status mapping and dropped fields | Free kind changes; a longer list | Q12 asks for a closed list enforced beside `KIND_WRITERS`. The three pairs are the lifecycles the input names. Counts use the winner's kind; the deferral-reason rate reads the entry's last `deferral` row, so a transition never erases a verdict. |
| Reads Q26's "all ledger commands" as the brain-row commands; `bkit ledgers` keeps `commit` / `union` / `only-bookkeeping` / `triage` and friction / stats `append`, and accepts `--ledger=<old name>` as an alias to the brain for the stub range | Every `ledgers` verb under `brain`; no alias | `commit` / `union` are git bookkeeping and friction / stats are not brain files (Q14). Without the alias, a pre-upgrade worktree's mirrored prompts fail their appends. Owner to confirm (Risks). |
| `append` and the migration fill an absent `status` with the kind's default and an absent `summary` from the first sentence of `description` (200 characters) | Refuse rows without them | No writer prompt breaks, and every brain row gets the envelope fields a generic reader needs. |
| New terminal status `FADED` on every brain kind; revivable by a same-`key` append | Reuse `SUPERSEDED` / `CLOSED`; exclude without a status | `SUPERSEDED` implies a successor and would trip the missing-successor finding; a fade with no status keeps counting as current everywhere else. |
| Always-loaded part (Q7, provisional): current `summary`, `knowledge`, `assumption` rows with no path in `references`, hard-capped at 2,000 tokens by the tool; the number is re-set from plan 2's three-task measurement and recorded with its source figures | Every knowledge row's key + summary (~5k tokens); knowledge + assumptions capped at ~6k; nothing always-loaded | Path overlap already reaches 93% of knowledge and 96% of decision rows, so the always-loaded part only has to carry what paths cannot reach. Decisions alone are ~18k tokens. Q7 stays open for the owner (Risks). |
| `context` ranks exact file > nearer folder > farther, then gotcha kinds first, then newest; clamps through `clampFile` `ledger` profile and prints `tokensEst` | Unranked output; a new truncation path | A hot file (`telemetry.ts`) can match over a hundred rows, so ranking decides what survives the clamp. One number per task makes Success Criterion 1 measurable without transcript counts, which read subagent output about 12x low. |
| Keyword search on `node:sqlite` FTS5, index named by content hash, built to a temp file and renamed; `ledgerScan` fallback; `context` / `check` / `stats` stay on the fold | Orama / MiniSearch; the index as the only read path | Zero dependencies on Node >= 24. Content-hash names mean two concurrent workflows never read a half-built index. Keeping critical reads on the fold avoids a second schema that drifts from `.bkit/jsonl.md`. |
| Brain update = deterministic `bkit brain update` + one prompt `bkit-utility-update-brain`, fed one path cluster per batch | Four prompts with a shared step; all inference in the engine | Q15 settles one pass. The engine cannot judge contradictions; the prompt should not be trusted with compaction. Batching keeps one agent context from holding the whole brain, the hotspot the premortem found at 10x. |
| A row carrying `proposal.basedOn` ranks at `basedOn` in the fold; `append` also skips `stale` and `applied` proposals | No fold change, a fork finding plus re-heal on the next run (brainstorm 1); deterministic ids only (brainstorm 2) | Without it, a brain-update copy minted on `dev` outranks a content change landed later from a feature branch whose rows were minted earlier, and the content is silently hidden until a human notices. The rank rule touches only rows with `proposal`, none of which exist at migration, so Success Criterion 2 is unaffected. The proposal itself is re-offered against the new content. |
| Suggestion id = hash of action, sorted target keys with their winner `ts`, and payload | Random ids; ids without target `ts` | Two concurrent runs produce the same id for the same change (Q28), and any change to a target produces a new id, which is exactly Q20's "until the rows it was about change". |
| Rejections in a committed `merge=union` file `.bkit/brain-rejections.jsonl`, kind `rejection` | Rows inside the brain (brainstorm 2); a gitignored local list | A local list re-offers a teammate what the owner rejected. Rows in the brain would pollute `context` and `search` with process bookkeeping, against Q14's line between what the project knows and machine records. Void rows are pruned; a union-resurrected one never matches again. |
| Recall log in the main checkout's `tmp/bkit-brain/` via `git rev-parse --git-common-dir`; `lastRecalled` at day grain, written only when later than stored by over half the fade window | Worktree-local `tmp/`; write every run; week grain | Most reads run in `.worktrees/{FID}`, deleted at close. The half-window rule bounds line churn by entries, not reads, and keeps `foldFrom` well under the `MAX_ROWS_BEFORE_ROLLUP = 5000` line warning. Recall writes are mechanical cleanup, applied even with `ask: true`. |
| Fade window 180 days, an engine constant; fade = current, `max(ts, lastRecalled)` older than the window, no inbound link from a current row | A setting; 90 days | Q24 / Q25 ask for a set time, not a knob. A constant with its decision row is re-derivable; a setting can follow if owners ask. |
| `ask: false` applies every suggestion type, `supersedes` and kind changes included, and lists each in the report | Hold `supersedes` and kind changes to approval even under `ask: false` (premortem suggestion) | Q19 settles that `false` applies the same changes directly, and the default is `true`. Every applied change is an ordinary same-`key` append, so it is reversible, and the report names it. |
| Scheduled run = opt-in `schedule` trigger and `brain-update` phase in `bkit-cloud.yml` | A new workflow template; an engine scheduler | `bkit-cloud.yml` already runs claude-code-action and opencode with credential auto-detect. Headless never asks, so the scheduled run applies cleanup and writes the report; approval waits for a chat. Push target is open (Risks). |
| Brain-update reports go under `docs/audits/{YYYYMM}/` with a random-suffixed name | Under `docs/plans/`; a tracker comment | Q17 says suggestions are reviewed "the way audit findings are"; brain update has no FID. Random suffixes keep concurrent runs apart. |
| Key-collision rule: earlier first `ts` keeps the key, the other becomes `{key}-{oldkind}` with a `relatedTo` link; stragglers follow the same map | Fixed file order with a `~kind` suffix (brainstorm 2); fail the migration | Content-derived, repeatable on every run, slug-shaped like every other key, loses no row. No collision exists in this repo today. |
| `bkit check`: old ledgers with content and no brain = drift (exit 1); a non-empty stub beside the brain = advisory (exit 0) | Fail on any non-empty stub (fail-closed approach) | Failing on stubs turns every pre-upgrade branch landing red in CI, a cost that grows with team size, while readers already see stub rows. An unmerged repo is genuine drift. |
| Path sweep as a bulk mechanical rewrite, then a hand review of each reading instruction; a repo audit test bars old paths from engine code outside `brain.ts` / `migrate.ts` | Hand-edit 109 files; rely on review | `.agents/rules.md` § Edit tools allows bulk mechanical rewrites; only reading instructions change meaning. The test catches a missed reader that would otherwise report zero rows without failing anything. |
| D-AS1: Success Criterion 1 names the counting method (characters / 4 of what the agent is told to read) and adds the doc index to "no whole-ledger read" | The draft's unspecified measurement | The draft left the method open; transcript counts are unreliable, and `.agents/docs.md` also tells agents to read the ledgers. |
| D-AS2: Success Criterion 2 adds byte-identical output on a second run and on two branches | The draft's "no row lost" alone | The premortem showed a non-deterministic migration doubles rows when two branches upgrade independently. |
| D-AS3: Success Criteria 3 and 5 add `FALSIFIED`, the missing-successor finding, the `ask: false` report and the concurrency outcome | The draft's criteria | The `assumption` kind adds a third terminal status; Q28 asked for a conflict mechanism, which needs an outcome to test. |
| D-AS4: Edge cases and the Process Sketch name the stub mechanism, the legacy alias, the fixed collision rule, the `proposal` rank, the `relatedTo` backfill and the no-shell host case | The draft's "the reader accepts them", "needs one fixed rule", "must not overwrite" | The draft stated the problems; the brainstorms supplied the mechanisms. |

## Approaches Considered

<!-- prettier-ignore -->
| Approach | Verdict | Why |
| --- | --- | --- |
| Pragmatic A: brain as one more ledger inside the existing engine, brain logic in `brain.ts` | `MERGED` | The base shape: extends `telemetry.ts`, `migrate.ts`, `compact.ts`, `ledgers.ts`, `context.ts` in place; supplies stubs, flat per-kind fields, `KIND_TRANSITIONS`, `basedOn`, the rejection file, the recall-log location and the cron reuse. |
| Optimal A: one envelope, pure-function core library, thin verbs | `MERGED` | Supplies the pure-function boundary, the deterministic suggestion id shared by concurrent runs, and the rule that the tool, not convention, enforces the digest cap. Its rejection-rows-in-the-brain and file-order collision rule were not taken. |
| Premortem A: single choke-point codec, read-tolerant, deterministic migration | `MERGED` | Supplies `readBrain` as the only door, the byte-deterministic migration, content-hash caches, the old-path audit test, the real-`git merge` stub test, per-cluster batching and the per-kind-class identity rule. |
| Pragmatic B: virtual brain (old files frozen, new rows to the brain only) | `REJECTED` | Departs from Q2 and Q13, and leaves two layouts and a permanent old-shape mapping for every grep-based prompt and audit template. |
| Pragmatic C: dedicated brain module with its own codec | `REJECTED` | Duplicates fold, validation, lineage and the writer check; puts `bkit stats` parity (Success Criterion 2) at the most risk. |
| Optimal B: keep four files, add a derived unified view and links | `REJECTED` | Contradicts Q2, Q12, Q13, Q15; keys can collide across files, so links can resolve to the wrong row. |
| Optimal C: merge without the envelope, ship checks first, brain update later | `REJECTED` | Two migrations instead of one and departs from Q13 / Q15; its one useful idea, keeping per-kind fields flat, is taken in the chosen shape. |
| Premortem B: fail-closed strict cut-over, old files deleted, old shapes refused | `REJECTED` | Departs from Q13's "reader still accepts the old shape" and detects merge loss after the fact instead of preventing it. Its inline-fix advisory is kept for the non-empty-stub case. |
| Premortem C: derived SQLite index as the only read path | `REJECTED` | A second schema on the critical read paths for speed not needed at ~650 entries; kept only for `search`, where it is required. |
| Recall dates in a separate committed file instead of on the entries | `REJECTED` | Would avoid row copies, but departs from Q25 ("a `lastRecalled` date per entry"); the `proposal` rank removes the copy risk that motivated it. |

## Trade-offs Accepted

- **One ledger on the existing codec:** gain one fold, one writer check and one updater instead of four, with links that are plain keys. Sacrifice: a one-time sweep of 109 shipped files, and `telemetry.ts` (over 2,000 lines) keeps growing instead of a clean brain module boundary.
- **Zero-byte stubs:** gain no lost rows from pre-upgrade branches and no modify/delete conflicts. Sacrifice: four empty files in `docs/` until a later retirement sweep, and a read path that folds five files instead of one.
- **Links in the rewrite, as `relatedTo`:** gain a deterministic migration with no added lines and no false dead-premise alarms. Sacrifice: the dead-premise check is quiet for old rows until brain update upgrades their links, and the 45 old `SUPERSEDED` rows have no successor link until then.
- **Flat per-kind fields:** gain zero reader rewrites. Sacrifice: the envelope is a convention on top-level fields, not a structural boundary, so a future kind must avoid field-name clashes.
- **Path overlap plus a small always-loaded part:** gain a read that scales with the files touched, not the ledger size. Sacrifice: a row with no path and no summary coverage reaches an agent only through search.
- **FTS5 only for search:** gain zero dependencies and one semantic definition of "current row". Sacrifice: `context` re-parses the brain per call (about 1 MB today), fine at this size and the first thing to revisit at 10x.
- **The `proposal` fold rank:** gain no silently hidden content across branches. Sacrifice: a narrow exception in `fold()` that every future fold-adjacent change must respect, and an inferred change can be discarded and re-offered.
- **Committed rejection file:** gain shared rejections across people and branches. Sacrifice: one more ledger file and writer-table row.
- **Approval in chat, no PR:** gain a fast loop for the owner. Sacrifice: the review trail is the report file and the commit, not a PR conversation.

## Risks & Open Questions

- **Q7, always-loaded summary (Open):** what goes in it and its cap. Options: A) current `summary`, `knowledge` and `assumption` rows with no path in `references`, capped at 2,000 tokens — cheapest, relies on path overlap reaching 93% / 96% of rows · B) key + summary of every current `knowledge` and `assumption` row, capped at ~6,000 tokens — broader safety net, three times the cost and grows with the ledger · C) nothing always-loaded — cheapest, but pathless gotchas reach an agent only by search. Recommended: A — it covers exactly what path matching cannot, and plan 2 re-sets the number from the three-task measurement. Default if unanswered: A.
- **Q6 departure, links in the rewrite:** confirm that backfilled links ride the one-time envelope rewrite. Options: A) rewrite — deterministic, no added lines · B) Q6 as stated, appended rows — each branch that upgrades mints different rows, union keeps both, ~650 extra lines and inflated `updates`. Recommended: A — Q13 already rewrites every line once. Default if unanswered: A.
- **Backfilled link type:** exact-key references carry no meaning beyond "cites". Options: A) `relatedTo` — safe, the premise check stays quiet until brain update upgrades links · B) `dependsOn` — check live at once, but citations of superseded rows flood it with false alarms · C) no backfill, brain update proposes every link — departs from Q6 and loads the first run with ~150 suggestions. Recommended: A — correctness over early coverage. Default if unanswered: A.
- **Q13 interpretation, flat per-kind fields:** confirm "per-kind body" means the per-kind field set. Options: A) flat fields beside the envelope — no reader rewrites · B) nested `body` object — clean structural boundary, but rewrites `bkit stats`, triage, decisions pending, the roadmap render and the audit templates for no new capability. Recommended: A. Default if unanswered: A.
- **Q26 interpretation, command scope:** Options: A) brain-row verbs under `bkit brain`, bookkeeping and friction / stats under `bkit ledgers`, alias for old `--ledger` names — no broken pre-upgrade worktrees · B) every `ledgers` verb under `brain` — one noun, but `brain` then also names non-brain files · C) option A without the alias — simpler, but a pre-upgrade worktree's prompts fail their appends with exit 8. Recommended: A. Default if unanswered: A.
- **Stubs left in `docs/`:** a visible layout change. Options: A) zero-byte stubs, retired by a later release-range sweep — no lost rows · B) delete the files, as #795's body says — modify/delete conflicts, rows dropped by the usual "keep the deletion" fix · C) keep full read-only copies for a release — every row lives in two files. Recommended: A. Default if unanswered: A.
- **Scheduled run push target:** Options: A) the scheduled cloud job commits cleanup and the report straight to `dev` — matches Q17, uses the push access `bkit-cloud.yml` jobs already hold · B) the scheduled job commits nothing and uploads the report as a run artifact — no push from CI, cleanup waits for the next chat run · C) a local launchd / cron recipe on the owner's machine instead of CI — no CI credentials, but tied to one machine. Recommended: A — the template already pushes for `/bkit-auto` runs. Default if unanswered: B, because a push from CI is a publishing action the owner has not approved for this job.
- **`FADED` status and the 180-day window:** Options: A) `FADED`, 180 days, recall written when over 90 days stale — few writes, slow fade · B) the same with 90 days — faster pruning of the always-loaded and context sets, more recall writes · C) a `bkit.brain.fade.days` setting — tunable, one more knob. Recommended: A — re-derive from the first real brain update's fade list. Default if unanswered: A.
- **`node:sqlite` stderr warning (unverified):** whether Node 24.x prints an `ExperimentalWarning` on import. Options: A) filter that one warning in-process before importing — clean `--json` stderr, no child process · B) run search in a child `node --no-warnings` — isolated, slower start · C) accept the line — callers that parse stderr break. Recommended: A. Default if unanswered: A.
- The stub union result ("ours emptied, theirs appended") is not verified; brainstorms disagree on whether old lines come back. Either outcome is safe under the identity-and-`ts` drop, but plan 1's first task proves it with a real `git merge`.
- The migration is deterministic per line except one rare case: a line citing a key that exists only on one branch gets a `relatedTo` link there and not on the other. Union then keeps both versions with equal `ts`, and the later line wins; the only effect is one missing or extra `relatedTo`, which `check` reports as a duplicate-`ts` finding.
- Plan 1 is large (codec, migration, alias, sweep, check). It is the owner's settled order (Q27); the plan should split it into task groups that each leave `dev` green.
- Consumer scripts using the `jq` write idiom keep writing old-shape rows to old paths; the stubs absorb them, and `.bkit/jsonl.md` § Write Idiom must change in the same release.
- Kind transitions change lineage: `firstTs` / `updates` cover both lives of an entry. Readers that count a kind must use the winner's kind, which plan 1 tests against `bkit stats`.
- Brain update's peak context is the new hotspot; `outcome.context.byAgent` for `bkit-utility-update-brain` is the figure to watch against the 160,000-token line.
- Success Criterion 1 depends on three recorded tasks chosen before plan 2 changes any prompt, so the "before" figure is not taken after the fact.
