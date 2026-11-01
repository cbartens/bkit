# Design Brainstorm & Ideas

Lens: Risk premortem — failure modes, scale, time, handover.

Grounding (read this run, 2026-11-01): `.bkit/core/engine/ledgers/telemetry.ts` (`APPEND_LEDGERS` :386, `KIND_WRITERS` :412, `identity` :844, `fold` :1909, `foldFrom` :2012, `MAX_ROWS_BEFORE_ROLLUP = 5000` :29); `.bkit/core/engine/ledgers/migrate.ts:19-22` and `compact.ts:26-29` (hard-coded four paths); `.bkit/core/engine/commands/workflow/workflows.ts:974-975,1186,1588` and `challenge.ts:709` (readers opening `docs/deferrals.jsonl` / `docs/failures.jsonl` by path); `.gitattributes:17-20` (`merge=union` per file); `.bkit/jsonl.md` § Versioning / § Compaction / § Identity; `docs/migrations.md` row "Ledger rows moved to `schema: 2`" (the precedent: in-place rewrite, drop an old line whose rewrite the file already holds). 33 engine `.ts` files (tests included) name one of the four ledger paths.

The failure family this lens cares about most: the merge from four files to one is the first bkit change that **moves rows between files**. Every earlier ledger safety property (union merge, last-wins fold, the schema-2 rewrite) assumed a row never changes file. Most premortems below trace back to that.

## Approach A — Single choke-point codec, read-tolerant, deterministic migration ⭐ Recommended

**Summary.** Every brain read and write goes through one module (`readBrain(root)` / `appendBrain(root, rows)`), which reads `docs/brain.jsonl` plus any rows still landing in the four old paths, normalises both shapes into the envelope at read time, and treats every index (FTS5 database, recall log, context selection cache) as a disposable cache keyed by the brain file's content hash; the migration is a pure, byte-deterministic function of the old files, so two branches that run it independently produce identical output.

**Failure modes it is built against.**

- **Modify/delete conflict on merge.** `merge=union` only resolves content conflicts. If the migration deletes `docs/knowledge.jsonl` on `dev` while a pre-upgrade branch appends to it, git reports "deleted by us / modified by them", which union cannot settle, and the operator resolves by hand (the usual reflex is "keep the deletion", which silently drops the branch's new rows). A keeps the four old paths as zero-byte stub files (still `merge=union` in `.gitattributes`): base = old content, ours = empty, theirs = old + appended lines, so union yields exactly the appended lines, and the reader picks them up from the stub.
- **Non-deterministic migration on two branches.** Q6 says the backfill _appends_ same-`key` rows carrying links. Appended rows mint a fresh `ts`, so two worktrees that each run `bkit upgrade` produce different backfill rows; union keeps both, and every backfilled entry gets a spurious extra `updates` count and a doubled line. A folds the backfilled links into the envelope rewrite of each entry's winner row (the Q13 one-time rewrite already touches every line), so no `ts` is minted and the output is a pure function of the input. This is a departure from Q6's wording, flagged in Decisions.
- **Split-brain readers.** Six command files call `ledgerRows` / `foldFrom` directly by path today. Any one missed in the cut-over keeps reading a stub and reports zero deferrals; `outcome.ledgers.deferrals.repo` then drops to 0 and `bkit stats` figures shift, breaking Success criterion 2 without a test failing on the reader itself. The choke point makes "no engine file names `docs/{knowledge,decisions,deferrals,failures}.jsonl` outside the brain module" a lintable invariant.

**Premortems.**

- **10x scale (about 6,500 current entries, 10+ writers).**
  - _What breaks:_ `lastRecalled` churn. If brain update appends one row per recalled entry per run, a weekly run on 6,500 entries adds thousands of lines a month; `foldFrom` crosses `MAX_ROWS_BEFORE_ROLLUP = 5000` (telemetry.ts:29), which counts lines, not entries, and starts printing the warning on every read. Every reader re-parses the whole file per command, so `bkit brain context` called by seven prompts per build re-parses ~10 MB each time. Brain update is the hotspot: one pass over all kinds instead of four sweeps means one subagent context holding the whole brain, which hits the ~160,000-token peak `bkit stats` judges against long before 6,500 rows.
  - _Observability:_ the existing `[bkit-telemetry] MAX_ROWS_BEFORE_ROLLUP exceeded` line; `outcome.context.byAgent` peaks for the brain-update agent.
  - _Recovery:_ `bkit brain compact` drops superseded lines; the content-hash cache means re-parse happens once per brain change, not once per command.
- **6 months later.**
  - _What breaks:_ the stubs. Nobody remembers why four empty files sit in `docs/`, someone deletes them "as cleanup", and the next pre-upgrade branch merge hits the modify/delete conflict. Likewise the allowed-transitions list beside `KIND_WRITERS` grows by ad-hoc additions with no rationale. The always-loaded summary cap (Q7) is a bare number nobody can re-derive.
  - _Observability:_ a `bkit check` finding when a stub is missing while `.gitattributes` still lists it; a test that the transitions list matches a table in `.bkit/jsonl.md`, the way `telemetry.test.ts` holds `KIND_WRITERS` to the writer table.
  - _Recovery:_ the stub retirement is a `docs/migrations.md` row with a release range, so a later sweep removes stubs and their `.gitattributes` lines together once no supported install predates the merge.
- **On-call at 3am.**
  - _Page shape:_ "bkit stats shows 0 deferrals" or "`bkit brain context` returned nothing for a file I know has gotchas". Both look like data loss.
  - _Diagnosability:_ `bkit brain check` prints, per source file, rows read, malformed lines, old-shape rows normalised, and the content hash of the cache in use. A stale cache is the first suspect and must be visible.
  - _Recovery path:_ delete the gitignored cache directory; nothing committed depends on it. Because the migration is deterministic, re-running `bkit upgrade` on a clean checkout reproduces `docs/brain.jsonl` byte-for-byte, which turns "did the migration lose a row?" into a diff.
- **Author leaves.**
  - _Load-bearing tribal knowledge:_ why the stubs exist; why the backfill rewrites instead of appends; why identity for brain kinds is `(repo, key)` while `feature` / `friction` stay `(kind, repo, key)`. If `identity()` in telemetry.ts:844 is changed globally rather than per kind class, a `feature` key and a brain key that share a slug (both FIDs start with the issue number, e.g. `546-…`) fold into one entry wherever a reader folds both files together.
  - _Mitigation of bus factor:_ each of these lands as a `decision` row in the brain itself, with `references` to the code path, so `bkit brain context --files .bkit/core/engine/ledgers/telemetry.ts` returns them to the next maintainer. That is the feature being dogfooded on its own design.

**Risk-mitigation guidance (layer onto A).**

- Add a repo audit test (beside `.bkit/core/engine/audits/repo/ledger-integrity.test.ts`) that fails when any non-test engine file outside the brain module contains one of the four old paths.
- Golden test: run the migration on a fixture of the four files, twice and on a union-merged copy; assert byte-identical output and an unchanged fold winner set (Success criterion 2).
- Fixture test of the modify/delete case with a real `git merge` in a temp repo (the memory note on `gh mergeable` lying applies here too: test with git, not with string checks).
- Write `lastRecalled` at a coarse grain (calendar week) and only when the grain changes, so recall churn is bounded by entries recalled per week, not reads.
- Bound the brain-update agent's input: it works per kind and per path cluster, never with the whole brain in one context.
- State the per-kind-class identity rule in `.bkit/jsonl.md` § Identity / Dedup, with a test that a `feature` and a `decision` sharing a key stay two entries.

## Approach B — Fail-closed cut-over: strict schema, old shapes refused after upgrade

**Summary.** The merge bumps rows to `schema: 4`; after `bkit upgrade` the old files are deleted, any old-shape or old-path row is a `bkit check` failure (exit 1, as the schema-2 migration does today), and `bkit brain append` refuses rows that are not in the envelope, so drift is loud instead of absorbed.

**Failure mode it is built against.** Silent tolerance. A's read-time normalisation means an old writer (a consumer's copied prompt, a hand `jq` idiom from `.bkit/jsonl.md` § Write Idiom, a stale mirror) can keep writing the old shape forever and nothing tells anyone. B makes every such row a visible failure on the next check.

**Premortems.**

- **10x scale.** Same `lastRecalled` and context-reparse risks as A. Extra: with many contributors and long-lived branches, the share of branches opened before the upgrade grows, and every one fails `bkit check` on merge until someone runs `bkit upgrade` on it; the failure volume scales with team size. _Observability:_ high, by design. _Recovery:_ `bkit upgrade` on the branch, which is mechanical but blocks CI meanwhile.
- **6 months later.** The strict validator is easy to reason about and drifts less: there is one shape. But the deletion of the old files means the modify/delete conflict is not prevented, only detected after a human mis-resolves it; a row lost by "keep the deletion" never reaches a validator. _Observability:_ none for the lost row. _Recovery:_ `git log -p` on the deleted path on the branch, by hand.
- **On-call at 3am.** Page shape: "CI red on `bkit check` after merging a feature branch". Clear and actionable, and the advisory text can carry the fix inline (`bkit upgrade`). The bad page is the one that never fires: the lost-in-merge rows above.
- **Author leaves.** Least tribal knowledge of the three: one shape, one file, one rule. The danger is the opposite of A's: a successor who meets the strict refusal in a consumer with many old branches loosens it ad hoc, without the stub mechanism A designs in.

**Risk-mitigation guidance (layer onto B).**

- Keep the old files as stubs anyway (A's merge mitigation transplants cleanly), but have `bkit check` fail when a stub is non-empty, naming the rows to move with `bkit upgrade`.
- Conflicts with the Draft Acceptance Scenario edge case "the reader accepts them and the next brain update moves and normalises them" (settled in Q13: "the reader still accepts the old shape"). B departs from a settled answer and would need the owner to re-confirm.
- Put the full remediation command inline in the check's advisory text (`.agents/rules.md` § Advisories self-contained).

## Approach C — Derived index as the only read path

**Summary.** Every read command (`context`, `search`, `check`, `stats`, the `outcome` ledger counts) queries one gitignored `node:sqlite` database rebuilt from `docs/brain.jsonl` whenever the file's content hash changes; the JSONL stays the only store, but no command parses it directly except the rebuild.

**Failure mode it is built against.** Scale and inconsistent selection. Path-overlap selection (Q8 folder matching), keyword search (FTS5) and the dependents list are three queries over the same rows; implementing them as three ad-hoc scans risks three different notions of "current row". One indexed view gives one definition and fast queries at 10x.

**Premortems.**

- **10x scale.** Best of the three on read latency: indexed path prefixes and FTS5 instead of whole-file parses per command. Rebuild cost is paid once per brain change. Fan-out risk moves to the rebuild: two concurrent workflows on one clone (supported, per `.bkit/workflows.md` § Dev lock) both see a changed hash and rebuild the same database file at once; without a write-to-temp-then-rename, one reads a half-written index. _Observability:_ SQLite errors surface as command failures, which is better than silent wrong answers. _Recovery:_ delete the database file.
- **6 months later.** The database schema becomes a second schema next to `.bkit/jsonl.md`, and drifts from it: a new envelope field added to the JSONL and not to the table is invisible to every read. Engine-side `stats` figures computed in SQL can diverge from the fold semantics in `fold()` (last-wins by `ts`, equal-`ts` later-line wins) in edge cases nobody tests. Unverified this run: whether `node:sqlite` on the supported Node 24 line still prints an `ExperimentalWarning` to stderr, which would land in every read command's output.
- **On-call at 3am.** Page shape: "wrong rows returned" with no way to tell whether the JSONL or the index is wrong without a second code path that reads the JSONL directly, which C deliberately removed. Recovery is still cheap (delete the cache), but diagnosis is harder than A's.
- **Author leaves.** Two representations (rows and tables) and the mapping between them is knowledge concentrated in whoever wrote the rebuild. SQL is also the one language in core that nothing else in the engine uses.

**Risk-mitigation guidance (layer onto C).**

- Keep `fold()` as the single semantic definition: the rebuild inserts fold winners only, so SQL never re-implements last-wins.
- Rebuild into a temp file and rename; key the file name by content hash so concurrent readers never share a half-built file.
- Restrict the index to `search` (#793), where it is required, and keep `context` / `check` / `stats` on the fold, so the critical paths have no second schema. This collapses C into A for everything except search, which is the recommended shape anyway.

## Decisions

<!-- prettier-ignore -->
| Decided | Alternatives | Why |
| --- | --- | --- |
| Recommend A: one brain codec module, read-tolerant of old shapes and old paths, every index a disposable cache keyed by content hash. | B fail-closed strict cut-over; C derived SQLite index as the only read path. | A is the only one that keeps Q13's settled "reader still accepts the old shape" and prevents, rather than detects, merge loss. B departs from Q13. C adds a second schema on the critical read paths for a speed gain not needed at 657 entries. |
| Keep the four old paths as zero-byte stubs with `merge=union` after the migration, retired later through a `docs/migrations.md` release range. | Delete the old files (B as written); keep them full and read-only for a release. | Deletion turns every pre-upgrade branch merge into a modify/delete conflict union cannot resolve. A stub makes union yield exactly the branch's appended rows. Keeping them full duplicates every row into two files. |
| Backfill links by writing them into the one-time envelope rewrite of each entry's winner row, not by appending new rows. Departure from Q6's wording; needs owner confirmation. | Q6 as stated: append same-`key` rows with links. | Appends mint `ts`, so two branches running the migration produce different rows that union doubles. A rewrite is deterministic, and Q13 already rewrites every line once. |
| Brain kinds get identity `(repo, key)`; `feature`, `friction` and stats kinds keep their current tuples. | Change `identity()` globally. | `feature` keys are FIDs and brain keys often start with the same issue number; a global change can fold unrelated entries into one wherever both files are folded together. |
| Add a repo audit test that no engine file outside the brain module names an old ledger path. | Rely on review and the existing tests. | Six command files read the old paths directly today; a missed one reports zero rows without failing any test of its own. |
| `lastRecalled` written at week grain, only when the grain changes. | Write the exact date on every brain update. | Bounds line growth and keeps `foldFrom` under the `MAX_ROWS_BEFORE_ROLLUP = 5000` line warning at scale. The grain is a judgement to confirm; no measurement this run. |

## Cross-Approach Risks

- **Modify/delete conflict on the old files** (all approaches): any design that deletes `docs/{knowledge,decisions,deferrals,failures}.jsonl` exposes pre-upgrade branches to a merge conflict `merge=union` cannot resolve, and the common hand resolution drops rows. Needs a real-git fixture test whatever is picked.
- **Concurrent brain updates (Q28, no lock):** suggestion identity must be content-derived (for example a hash of the target keys plus the proposed change), so two runs proposing the same change produce the same suggestion and an approval or rejection recorded by one is recognised by the other. Where rejections are stored is open: a gitignored local file is not shared across people (a teammate is re-offered what the owner rejected); a committed brain row is shared and union-safe but adds a new kind. The design must pick one.
- **Rejection "until the rows it was about change" (Q20)** needs a fingerprint of those rows (their winner `ts` values) stored with the rejection; without it, "changed" is undefined.
- **Brain update is the new hotspot and the new bus factor:** it replaces four updater prompts and their `Cross-Ledger Impact` sections with one pass. Its input must be bounded per kind or per path cluster, or one agent context holds the whole brain.
- **Contradiction and pattern detection (Q22, Q23) are model judgements:** with `ask: false` they apply directly. A wrong `supersedes` link flips a live row to replaced and fires the dependents list on it. Consider holding `supersedes` and kind changes to `ask: true` even when `ask: false`, or at least logging each applied inferred change as a reversible row.
- **Always-loaded summary cap (Q7):** whatever number is chosen is a magic number; record the measurement it came from (the issue's digest table: knowledge ~5k tokens, decisions ~18k, deferrals ~5k, failures ~1k) in the decision row so it can be re-derived.
- **Token measurement (Success criterion 1)** needs a fixed method; the memory note on transcript measurement says subagent `output_tokens` read about 12x low and `grep -l` over-matches FIDs, so the before/after must use the same counting path on the same three tasks.
- **`dependsOn` loops and dangling keys:** the check must be iterative with a visited set and must report, not throw, on both (Draft edge case).
- **Kind transitions change lineage:** under `(repo, key)` identity, `firstTs` / `updates` of an entry that moves failure → knowledge count both lives. Any `bkit stats` figure that counts deferrals or failures by distinct key must filter by the winner's current kind, or the "figures unchanged" criterion fails on the first transition.
- **Consumer copies of the jq write idiom** in `.bkit/jsonl.md` § Write Idiom and in consumer scripts keep writing old-shape rows to old paths; the stubs absorb them under A, but the doc and the shipped templates must change in the same release (Q9).
- **Host parity:** `bkit brain context` replaces a "read the file" instruction in six prompts plus `.bkit/core/.agents/rules.md`; on hosts where a subagent has no shell, the orchestrator must run it and pass the rows, the way subagents hand rows back for `append` today.
