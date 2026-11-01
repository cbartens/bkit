## Grill decisions — the owner's answers in this run, the newest text

Settled = the human's answer; the design follows it and flags any departure for the human to confirm. Assumed = unconfirmed default; override only with a stated reason. Open = unknown; the design states how it resolves each.

Facts looked up during the interview:

- Sub-issues exist: #791 (`bkit ledgers context` by path overlap, `next:plan`), #792 (typed links and dead-premise check, `next:plan`), #793 (FTS5 keyword search, `next:plan`), #794 (qmd template, `next:design`), #795 (merge into `docs/brain.jsonl`, `next:design`).
- Node 24's bundled SQLite compiles FTS5 in, and bkit requires Node >= 24: keyword search needs no dependency. The mempalace drawer question is moot because qmd was picked for the opt-in slot.
- `APPEND_LEDGERS` in `.bkit/core/engine/ledgers/telemetry.ts:386` maps one file to one kind; the merge changes that table. `.bkit/jsonl.md` § Versioning and § Compaction are the only sanctioned line rewrites.
- Six prompts plus `.bkit/core/.agents/rules.md` carry "Check gotchas first": `bkit-build-plan-execute`, `bkit-debug-failure-diagnose`, `bkit-plan-review-1`, `bkit-plan-review-2`, `bkit-utility-update-decisions`, `bkit-utility-update-knowledge`.
- Existing `ask` settings live in `package.json` under `bkit.workflows.*` (e.g. `package.json:188`).

### Settled

- Q1 Design scope: one design covers all five sub-issues (#791–#795), one plan each, ordered by dependency.
- Q2 One ledger file: merge `docs/knowledge.jsonl`, `docs/decisions.jsonl`, `docs/deferrals.jsonl`, `docs/failures.jsonl` into one file, landed together with the typed links; existing installs move over through a `bkit upgrade` migration registered in `docs/migrations.md`.
- Q3 Assumption kind: add kind `assumption` with a required `falsifiedBy` (row refused without it) and optional `validUntil`; dependents point at it through `dependsOn`.
- Q4 Which kinds get links: all kinds in the brain (knowledge, decision, deferral, failure, assumption, summary). Owner note: also consider a `relatedTo` link (settled in Q10).
- Q5 Where the premise-gone check runs: `bkit ledgers append` prints the current dependents when a row is replaced or closed, and `bkit ledgers check` lists all of them on demand; never a blocking gate; brain update acts on the list.
- Q6 Backfill: once, inside the merge migration, append same-`key` rows carrying the new link fields for references that match an existing key exactly; old lines are not hand-edited outside the migration; consumer repos get it through `bkit upgrade`.
- Q8 Folder paths: a folder in `references` matches every file under it, at any depth.
- Q9 docs/ templates: no change beyond the ledger file names and read instructions they mention.
- Q10 `relatedTo`: add a third link `relatedTo: [key]`, undirected "see also", informational only; the premise-gone check ignores it.
- Q11 File name: `docs/brain.jsonl`.
- Q12 Identity: entries are identified by repo + key, keys unique across the whole brain; `kind` is a field a later row may change only along a closed list of allowed transitions (e.g. failure → knowledge, deferral → decision), enforced beside `KIND_WRITERS`.
- Q13 Generic row format: the owner asked the design to review the `docs/brain.jsonl` structure and make it generic enough to store different item types and interlink them. Adopt one envelope (`key`, `kind`, `status`, `summary`, one `links` block holding `supersedes` / `dependsOn` / `relatedTo`, `references` for paths / commits / issues, a per-kind body). The merge migration rewrites every old row into it once; the reader still accepts the old shape for rows appended on branches opened before the upgrade.
- Q14 Other files: `.bkit/issues.jsonl` `feature` rows stay out for now (the format allows them later); `.bkit/friction.jsonl` and `.bkit/stats.jsonl` stay separate.
- Q15 Brain update replaces updaters: the owner asked the design to explore a recurring process that (a) cleans up the brain like compaction and (b) updates it like the current ledger updaters, and also makes new links and new summaries. One brain update pass replaces `@bkit-utility-update-knowledge`, `-decisions`, `-deferrals`, `-failures`; compaction becomes its cleanup step; `@bkit-utility-update-roadmap`, `-tracker`, `-documentation` stay.
- Q16 When brain update runs: on demand, plus an opt-in scheduled run; never inside a design / plan / build / debug / ship run.
- Q17 Who approves: no PR. Mechanical cleanup lands directly; inferred changes (links, summaries, closures, corrections) are suggestions the owner reviews and approves, the way audit findings are, governed by Q19.
- Q18 Summaries: `summary` rows inside the brain, linked with `relatedTo` to the rows they summarise, rebuilt by each brain update; they may feed the always-loaded summary (Q7).
- Q19 Two modes: the recurring process is named **brain update** (not "dream"). A `package.json` setting `bkit.brain.update.ask` (shaped like the existing `ask` settings) picks the mode: `true` → brain update writes a report with a `Suggested Changes` table, the owner approves rows in chat, only approved rows are appended through `bkit ledgers append` (`bkit brain append` per Q26); `false` → brain update applies the same changes directly.
- Q20 Rejections: with `ask: true`, a rejected suggestion is recorded and not offered again until the rows it was about change.
- Q21 Default: `bkit.brain.update.ask` defaults to `true`.
- Q22 Contradictions: every brain update looks for pairs of current rows that say opposite things and proposes a `supersedes` link or a correction.
- Q23 Patterns into lessons: brain update looks for repeats across brain rows and archived plans' `Open Questions & Assumptions` sections and proposes one `knowledge` or `assumption` row stating the pattern, linked with `relatedTo` to its sources; `.bkit/friction.jsonl` excluded.
- Q24 Fading: rows fade by age, no inbound links, and shared recall (refined in Q25). Owner direction: recall must be shared so a row does not fade while at least one person uses it often.
- Q25 Shared recall: store a `lastRecalled` date per entry, written only by brain update from each person's local gitignored recall log (written by `context` / `search` reads); readers take the newest date across all of the entry's rows so merges never lose a recent recall; a row is flagged to fade when old, unlinked and not recalled by anyone for a set time.
- Q26 Command names: all ledger commands move under the `bkit brain` noun (`bkit brain append`, `bkit brain check`, `bkit brain compact`, `bkit brain context`, `bkit brain search`, `bkit brain update`), not `bkit ledgers`.
- Q27 Build order: (1) merge + generic format + links (#795 with #792), (2) loading rows by file (#791), (3) keyword search (#793), (4) brain update, (5) qmd template (#794).
- Q28 Concurrency: no lock. Two brain updates may run at the same time, as two workflows can; the design supplies a mechanism to deal with conflicts between concurrent runs instead of serialising them.
- Q29 Draft acceptance scenario: accepted.

### Assumed, not confirmed

None.

### Open

- Q7 Always-loaded summary: what goes in it and its size cap is left to the design to decide, from measurement (knowledge digest ~5k tokens, decisions ~18k, deferrals ~5k, failures ~1k today).

### Draft Acceptance Scenario

> **DRAFT only:** reviewed in the design interview. Starting point for the design's Acceptance Scenario, not a fixed contract: the design may change any part, and records each change as a Decisions row.

#### Narrative

An agent about to change some files runs one command and gets back the brain rows that touch those files, plus a short summary, instead of reading the whole knowledge ledger. When the owner replaces or closes a row, bkit immediately lists the rows that rested on it. On demand or on a schedule, brain update tidies the brain, checks rows against the code, links related rows, spots contradictions and repeated patterns, and, depending on `bkit.brain.update.ask`, offers those changes for approval or applies them.

#### Success Criteria

1. The pre-code ledger read costs measurably fewer tokens (measured before and after on the same three tasks), and no prompt tells an agent to read a whole ledger file.
2. `bkit upgrade` turns the four ledgers into one `docs/brain.jsonl` in the generic row format with no row lost; fold winners, `bkit stats` figures and the `docs/roadmap.md` render are unchanged.
3. Every replaced row with a known successor can be followed to it by a tool; replacing or closing a row lists every current row whose `dependsOn` points at it, at write time and in `bkit brain check`.
4. Keyword search runs on Node alone; search by meaning (qmd) is an opt-in template, off by default.
5. With `ask: true`, brain update changes nothing but mechanical cleanup without owner approval, and a rejected suggestion is not offered again until its rows change; with `ask: false`, it applies changes directly.

#### Key Edge Cases

- A branch opened before the upgrade appends old-shape rows to the old files after the merge: the reader accepts them and the next brain update moves and normalises them.
- Two branches append to the same entry at once (including `lastRecalled`): union merge keeps both rows; recall takes the newest date across the entry's rows.
- A kind change not on the allowed list is refused.
- A link names a key that does not exist, or `dependsOn` links form a loop: the check flags both and never crashes.
- The same key exists in two of the four old files during the merge (none today): the migration needs one fixed, repeatable rule.
- Two brain updates run at the same time on the same repo (no lock): their changes and suggestion approvals must not overwrite or contradict each other.

#### Process Sketch

- WHEN an agent starts a task touching files F → THEN it gets the current rows whose `references` name F or a folder above F, plus the capped summary.
- WHEN a row is appended as `SUPERSEDED` or `CLOSED` → THEN the append prints the current rows that `dependsOn` it, and `bkit brain check` lists them too.
- WHEN `bkit upgrade` runs on an old install → THEN the four ledgers become `docs/brain.jsonl` envelope rows, links are filled from exact-key references, and the fold result is unchanged.
- WHEN brain update runs with `ask: true` → THEN cleanup is applied and a `Suggested Changes` report is written; only rows the owner approves are appended, and rejections are remembered.
- WHEN brain update runs with `ask: false` → THEN the same changes are applied directly.
- WHEN a row is old, unlinked and not recalled by anyone for the set time → THEN brain update flags it to fade.
