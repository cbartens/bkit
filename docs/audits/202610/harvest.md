<!-- Note: Report at `docs/audits/202610/harvest.md`. Template = GitHub issue #343 body (no `docs/templates/bkit-audit-harvest.md` exists). `@bkit-audit-generate` procedure mirrored. Never overwrite. -->

# Consumer Harvesting

> [!CAUTION]
> **Purpose:** Judge one harvest cycle — consumer stats copied, friction moved, deferral and failure counts only, store durable, prune unable to delete a row the store did not keep.
>
> **Rules:**
>
> - This run may execute `pnpm bkit harvest`. That command prunes consumer `.bkit/friction.jsonl` and writes `harvest/`. It never commits. This run does not commit either.
> - Do not edit product code, config, or docs other than the report.
> - Contract: `.bkit/src/bkit-harvest.ts` and `.bkit/jsonl.md` § Friction Is a Drained Queue. The code wins over this issue when they differ.
> - Consumers are listed in `docs/consumers.md`, one absolute repo root per line. Destination is `harvest/` at the bkit repo root, not under `.bkit/`.
> - Use dense phrasing. Every claim cites a command, a count, or `file:line`.
> - Read this issue once at the start.

## Instructions

### Context & Goals

Friction is a queue. Harvest copies `.bkit/stats.jsonl`, moves `.bkit/friction.jsonl` into `harvest/`, and counts `docs/deferrals.jsonl` and `docs/failures.jsonl` from envelope metadata. Prose of those two never leaves the consumer. The store accumulates and is the only copy of pruned friction until someone commits `harvest/`.

Target failure: **a row removed from a consumer that the store does not hold**, or **a harvest that looks done while `harvest/` is still uncommitted**.

Identity is not a safe prune key. `fold` collapses rows that share an identity, including keys truncated into a collision. The prune gate is byte-for-byte content. A fold loser stays in the consumer and is reported. Malformed lines are never pruned. `stats.jsonl` is never pruned.

**Applies when:** `docs/consumers.md` exists, or `harvest/` exists. Neither → one `N/A` row and stop.

**Cadence:** before a friction-triage pass, and ahead of a release. Extra pass after a consumer is added or the harvest contract changes.

**Anchor standards:** record the revision read.

- `.bkit/jsonl.md` § Friction Is a Drained Queue, § Identity / Dedup, at the installed version.
- `.bkit/src/bkit-harvest.ts` header invariants.

### Scope

- One harvest against every repo in `docs/consumers.md`.
- Copy, move, and count-only behaviour against the constants in `bkit-harvest.ts`.
- Idempotency of a second run.
- Uncommitted `harvest/` named for the caller. Not committed here.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why | Where it belongs |
| --- | --- | --- |
| Triage of friction rows | Separate audit | #99 |
| Fixing key truncation, `fold()` on unknown kinds, slug derivation, persisted count-only totals | Product changes | A plan from this report |
| Committing `harvest/` | Caller commits. Harvest never commits | The human or the next commit step |
| Editing consumer ledgers by hand | Harvest is the only remover of friction rows | `pnpm bkit harvest` |

### 🚨 Pre-Flight / Dependencies 🚨

#### Core

- [x] **Contract:** `.bkit/src/bkit-harvest.ts` and `.bkit/jsonl.md` § Friction Is a Drained Queue. Fallback: stop. → read both: `bkit-harvest.ts` @ `c692c65b` (514 lines, clean), `jsonl.md` @ `598a3b2f` § Friction Is a Drained Queue `:111-130`, § Identity / Dedup `:270-285`; installed `pinnedVersion` 4.12.0 (`.bkit/version`).
- [x] **Consumers:** `docs/consumers.md`. Empty or missing → one `N/A` row and stop. → 2 paths (`consumer-a/`, `consumer-b/`); git-tracked (`git ls-files docs/consumers.md`).
- [x] **Dest:** `harvest/` exists or can be created by the command. Fallback: name it in `Not Checked` and do not prune. → exists; pre-run `friction.jsonl` 257 lines, `stats.jsonl` 10 lines; `git status --short -- harvest/` clean.
- [x] **Prior report:** newest `docs/audits/**/harvest*.md`. None → baseline. → `docs/audits/` absent before this run → baseline.

#### Conditional

- [x] **Consumers on disk:** each path in `docs/consumers.md` is a checkout. Missing path → that consumer `Not Checked`, continue the others. → both git checkouts on `dev` (`git -C {path} rev-parse HEAD` → `4daf0bd5` / `66bce32d`).
- [x] **Git:** `harvest/` dirty or untracked after the run. Fallback: durability `Not Checked`. → applicable; dirty after run (`Durability`).

### 🔒 Gate 1: Prerequisites Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all applicable boxes above. **DO NOT stop for user permission.** Once saved, immediately proceed to `Probe Steps`.

- [x] **Gaps named:** every missing item names its fallback and `Not Checked` entry. → no Core / Conditional item missing; partial gaps (consumer-b no `stats.jsonl` / `failures.jsonl`) named in `Consumers` + `Not Checked`.
- [x] **Gate 1 - Verified:** All Core items checked. All applicable Conditional items checked.

### Probe Steps

- [x] **Step 1 — Previous Run:** Record `git rev-parse HEAD`. Read the newest prior report. Count findings still open. Open after 2 runs → re-raise with age. **Done when:** closure rate in `Previous Run`, or run marked baseline. → HEAD `289797aac09ceb404f4d7c2fd9ab79be53ac786d`; baseline.
- [x] **Step 2 — Contract:** Read `HARVEST_COPY_FILES`, `HARVEST_PRUNE_FILES`, `HARVEST_COUNT_FILES`, `CONSUMERS_FILE`, `HARVEST_DEST_DIR`. Expected: copy `stats.jsonl` and `friction.jsonl`; prune only `friction.jsonl`; count `docs/deferrals.jsonl` and `docs/failures.jsonl`; list file `docs/consumers.md`; dest `harvest/`. A mismatch with `.bkit/jsonl.md` is a finding. **Done when:** the five constants are in `Contract`, or the mismatch is a finding. → all five match (`bkit-harvest.ts:50-68`); header-invariant drift → `harvest-2`, `harvest-8`.
- [x] **Step 3 — Harvest:** From the bkit repo root, `pnpm bkit harvest`. Record per consumer: copied, pruned, retained, count-only totals, errors, timeouts. A consumer that stalls is continued, not fatal. **Done when:** `Run` holds those counts and the command's exit status. → exit 0; consumer-a pruned 54 / retained 24.
- [x] **Step 4 — Idempotency:** Run harvest a second time without other writes. Expected: no new distinct identities, no further prunes of rows already stored, retained fold-losers still in the consumer. **Done when:** `Idempotency` holds both runs' identity counts and prune counts. → NOT idempotent: run 2 pruned 8, evicted 8 run-1 rows → `harvest-1`.
- [x] **Step 5 — Prune Safety:** Confirm in source, then against this run's log: prune only after that exact row is fsynced and read back; gate is content, not identity; malformed lines remain in the consumer; `stats.jsonl` bytes on the consumer are unchanged; the store was not deleted and rebuilt. **Done when:** each invariant is pass or a finding in `Safety`. → 4 pass, store-rebuild fails → `harvest-1`, `harvest-2`.
- [x] **Step 6 — Durability:** `git status -- harvest/`. Rows that exist only there are named. Do not commit. **Done when:** `Durability` says clean, or lists the uncommitted paths the caller must commit. → dirty: `harvest/friction.jsonl`, `harvest/stats.jsonl` → `harvest-3`.
- [x] **Step 7 — Known Loss Modes:** Re-check, do not assume fixed. (1) Friction `key` truncation collapsing two rows to one identity — fold loser must stay in the consumer. (2) Unknown `kind` folding onto one identity. (3) `consumerPathToSlug` / `resolveRepoSlug` stamping `owner/repo` from a local path that is not `owner/repo`. (4) Count-only totals computed and dropped. (5) Harvest reading only hot files, so a future archive shard would be invisible. **Done when:** each mode is pass, still open, or `N/A`, with evidence. → table in `Checked`.
- [x] **Step 8 — Consumers:** Every line in `docs/consumers.md` appears in the run, or is named missing. A consumer with no `.bkit/stats.jsonl` is recorded as absent, not invented. **Done when:** `Consumers` is one row per listed repo. → 2/2 in run; consumer-b `stats.jsonl` absent.
- [x] **Step 9 — Anything Else:** (a) Commits since the previous report touching `bkit-harvest.ts`, `bkit-telemetry.ts` identity/`fold`, `docs/consumers.md`, or `harvest/` → one-line verdict. (b) Bounded ~30 min: what a harvest bug could still delete. Class seen on 2 runs → propose a step. **Done when:** `Beyond the Steps` holds both passes, or `none`. → both passes in `Beyond the Steps`.

### 🔒 Gate 2: Probes Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** Once saved, immediately proceed to `Findings`.

- [x] **Steps complete:** every step `[x]`, or an explicit skip with evidence.
- [x] **Evidence:** every finding cites a command, a count, or `file:line`.
- [x] **No commit:** this run did not commit in the bkit repo or any consumer. → bkit HEAD `289797aa` unchanged; consumer-b HEAD `66bce32d` unchanged; consumer-a HEAD moved `4daf0bd5` → `22590314` via maintainer commit `fix(1358)` (Christian Bartens, 11:16 +1000), no `.bkit/` or ledger path (`git diff --stat 4daf0bd5 HEAD -- .bkit/ docs/deferrals.jsonl docs/failures.jsonl` empty).
- [x] **Gate 2 - Verified:** Every checkbox above independently verified and checked off.

## Findings

<!-- prettier-ignore -->
| Severity | Use |
| --- | --- |
| `CRITICAL` | A consumer row was pruned and is not in `harvest/` |
| `HIGH` | Fold or slug collision still drops a distinct friction. Uncommitted `harvest/` is the only copy of pruned rows |
| `MEDIUM` | Count-only totals dropped. Unknown-kind rows collapsed. A listed consumer was skipped |
| `LOW` | Log wording, path stamp that changes no stored row |

Scale per `.bkit/jsonl.md` § Severity. Number `harvest-{n}`.

<!-- prettier-ignore -->
| ID | Severity | Location | Evidence | Expected |
| --- | --- | --- | --- | --- |
| harvest-1 | CRITICAL | `.bkit/src/bkit-telemetry.ts:897-906` (`fold` sort `a.ts - b.ts` at `:899`); `.bkit/src/bkit-harvest.ts:389-400` | Run 2 (`pnpm bkit harvest`, exit 0) pruned 8 more rows and rewrote `harvest/friction.jsonl` (sha `0f8f1577…` → `4d4b8e8d…`, 210 lines / 210 identities both runs). 8 of the 62 rows removed from consumer-a `.bkit/friction.jsonl` are in neither the working store nor bkit HEAD store (`verify.mjs`: `removedButNotInStoreByContent: 8`, `inNeitherStore=8`; listed in `Safety`). Cause: 22 of 78 consumer friction rows lack a numeric `ts` (14 ISO strings, 8 null/absent) → comparator yields `NaN` → order is not by `ts` → fold winner depends on input order (store lines first, re-copied consumer lines appended after, `:185`). Same run-2 input: winner `ts 1785066727818` with those rows, `1785115720743` with them removed. Harvest never calls `validate()` (`bkit-telemetry.ts:676-677` rejects non-number `ts`); store now holds 10 non-numeric-`ts` rows (pre-run 0), so every later fold of `harvest/friction.jsonl` is order-dependent. Lost rows' only copies: consumer-a `HEAD:.bkit/friction.jsonl` (`22590314`, 78 rows, sha `859a7254…` = pre-run) and `tmp/harvest-run/pre/consumer-a-friction.jsonl` | A row pruned from a consumer stays in `harvest/` on every later run; fold order total; rows failing the envelope (`ts` not a number, unknown `kind`) never stored or pruned |
| harvest-2 | HIGH | `.bkit/src/bkit-harvest.ts:389-400`, `:17-18`, `:365-369`; `.bkit/jsonl.md:128`, `:237` | Store rewrite keeps only fold winners, contradicting "store ACCUMULATES" (`bkit-harvest.ts:17-18`, `jsonl.md:128`). All-valid `ts`: row A stored + pruned on run 1, newer same-`key` row B (documented update / recurrence idiom, `jsonl.md:237`) evicts A on run 2 — in-memory repro with dist `fold`: `run2 store holds A: false`. Consumer has 9 same-key groups (20 rows) of this shape today. Equal-`ts` same-identity pairs resolve by file position, so a re-copied consumer row beats a stored row with the same `ts` (91 of 101 pre-run store pairs share `ts`). Run 1 dropped 101 committed triage-history lines (257 lines / 156 identities → 210 / 210; deltas `status` / `references` only, `pairs.mjs`). Rewrite is plain `writeFileSync` (`:400`), not temp + rename like the consumer prune (`:323-325`) — a crash mid-write truncates the only copy | Store never drops a distinct row it has stored; dedupe exact duplicates only; store rewrite atomic |
| harvest-3 | HIGH | `harvest/friction.jsonl`, `harvest/stats.jsonl` | `git status --short -- harvest/` → ` M harvest/friction.jsonl`, ` M harvest/stats.jsonl` (542+ / 202-). 54 pruned rows (53 `friction`, 1 `template-bug`) are in no committed store (`inBkitHEADStore=0`); their other copy is consumer-a `HEAD:.bkit/friction.jsonl`, which leaves the tip once that repo commits its pruned file (` M .bkit/friction.jsonl`, 62 deletions, uncommitted). Run log: "54 row(s) now exist ONLY in harvest/ — commit it" | `harvest/` committed before the consumer's pruned friction file; `harvest-1` rows restored first |
| harvest-4 | MEDIUM | `.bkit/src/bkit-telemetry.ts:624-647`; `.bkit/src/bkit-harvest.ts:243-246`, `:313-316` | 14 consumer friction rows get no identity (`identity()` has no `default`): `tool-failure` ×3, `agent-rework` ×3, no `kind` ×3, `subagent-wrong-cwd` ×2, `concurrent-workflow`, `template-bug`, `ignore-earlier-marker-stripped`. `fold` maps all to one `undefined` key → 1 stored per run; 13 (run 1) / 12 (run 2) retained but absent from the RETAINED count (`identityOrUndefined` → undefined → not counted). Stored winner flipped `ignore-earlier-marker-stripped` → `template-bug`; the run-1 row is one of `harvest-1`'s 8 | Unknown-kind rows keep distinct identities or are rejected and reported; never collapse to one slot |
| harvest-5 | MEDIUM | `.bkit/src/bkit-harvest.ts:193-213`, `:375-380`, `:451-458`; `.bkit/src/bkit-install.ts:1999-2003` | Counted: consumer-a deferrals 377 entities (663 rows), failures 582 (991); consumer-b deferrals 102 (102). Emitted to stdout / stderr only; `ls harvest/` → `friction.jsonl`, `stats.jsonl`; no write of `countOnlyRows` / `totalCountOnly` | Count-only totals persisted in `harvest/` per consumer and run |
| harvest-6 | MEDIUM | `.bkit/src/bkit-harvest.ts:227-232` (`stampRepo` fills only empty `repo`), `:394-400` | Consumer rows with bare `repo: "consumer-a"` (183 stats, 10 friction) stored unchanged beside `example-org/consumer-a`. 3 stats entities now under both spellings (`counter build 7c8d52bb… BUILD_ATTEMPT`, `compliance ship HEAD~1 no-mirror-edit`, `compliance ship HEAD~1 skip-ci-not-head`). 6 stored counter rows bkit had repaired (`bkitVersion: "unknown"`) reverted to consumer `""`. 68-char-key row `friction-plan-step-11-close-workflow-stray-guard-rejects-protocol-ma` stored under the bare slug duplicates entity `…-protocol-ma-c710e94` | One `repo` spelling per repo in the store; bkit-side store repairs survive re-harvest |
| harvest-7 | LOW | `.gitattributes` (no `harvest/` line) | `git check-attr merge -- harvest/friction.jsonl harvest/stats.jsonl` → `unspecified`. Every run rewrites the store (run 1: 542+ / 202-), so two branches that each harvested conflict across the file; keeping one side drops the other side's pruned rows | `harvest/*.jsonl` merge strategy that cannot drop one side's rows, recorded as a decision |
| harvest-8 | LOW | `.bkit/src/bkit-harvest.ts:20`, `:60` | Header invariant "Per-consumer timeout + continue-on-stall"; `HARVEST_TIMEOUT_MS` referenced nowhere else (`grep -rn HARVEST_TIMEOUT_MS .bkit/src` → `bkit-harvest.ts:60` only, tests included); `harvestConsumer` reads synchronously. A stalled consumer path blocks the whole run | Timeout enforced per consumer, or the invariant and constant match the code |
| harvest-9 | LOW | `.bkit/src/bkit-harvest.ts:158`, `:189`, `:436`, `:447`; `.bkit/src/bkit-install.ts:2002` | (a) `consumer-a//.bkit/…` double slash (consumer lines end in `/`). (b) CLI "count-only deferrals.jsonl: 479 rows" — 479 = entities. (c) RETAINED line says "identity collides … Fix the colliding key upstream" for 11 rows that are the documented same-key update idiom, and omits the 13 unknown-kind rows. (d) "now exist ONLY in harvest/" — consumer-a HEAD still holds them; after run 2, 8 pruned rows exist only in consumer-a HEAD | Log lines state the real counts and copies |
| harvest-10 | LOW | `.bkit/src/bkit-harvest.ts:155-156`, `:194-195`; `.bkit/src/bkit-telemetry.ts:35`, `:967-983` | Harvest reads hot files only; `archiveShardPaths` / `foldFrom` unused by harvest (used by `bkit-analysis.ts:444`, `:653`). No shard writer exists; neither consumer has `.bkit/archive/` (`ls` → not found) → no data affected today | Harvest reads the same shard set `foldFrom` reads once shards exist |

Empty and clean → one row `None`.

## Report

### Summary

- **Findings:** 10 — CRITICAL 1 · HIGH 2 · MEDIUM 3 · LOW 4. Baseline run.
- **Consumers harvested:** 2 / 2. consumer-a full cycle; consumer-b has no `.bkit/stats.jsonl`, no `docs/failures.jsonl`, empty `.bkit/friction.jsonl`.
- **`harvest/` NOT clean:** ` M harvest/friction.jsonl`, ` M harvest/stats.jsonl`, uncommitted; nothing committed by this run.
- **Headline:** run 2 evicted 8 rows that run 1 had pruned (`harvest-1`) — not in `harvest/`; recoverable only from consumer-a `HEAD:.bkit/friction.jsonl` and `tmp/harvest-run/pre/consumer-a-friction.jsonl`. Each further run can flip fold winners again.
- **Series (baseline):** pruned 54 → 8; retained 24 → 16 (reported 11 → 4, unknown-kind silent 13 → 12); store friction identities 156 → 210 → 210; store stats identities 10 → 397 → 397.

### Previous Run

- **Baseline:** no `docs/audits/**/harvest*.md` (`docs/audits/` absent before this run). HEAD `289797aac09ceb404f4d7c2fd9ab79be53ac786d`. Closure rate N/A.
- **Owner notes on #343 (2026-10-06, supplied by caller), re-checked in Step 7:**

<!-- prettier-ignore -->
| Prior open item | Status now | Evidence |
| --- | --- | --- |
| `key` truncation (~68 chars) collision: `docs/pending.md` edit vs `docs/decisions.md` + `docs/pending.md` edits | Closed in store; residue → `harvest-6` | Store holds both as distinct identities `…-protocol-ma-c710e94` / `…-protocol-ma-102b388` (hash suffix, `.bkit/src/bkit-telemetry-migrate.ts:645-647`); partner row `ts 1783944967782` left the consumer at consumer-a `f69b74f2` and survives re-keyed via `1590bc21`. Consumer's last unhashed 68-char row pruned run 1, stored under bare slug |
| Unknown kind `tool-failure` folding to undefined identity | Open → `harvest-4` | 14 rows / 7 kinds share one `undefined` slot |
| `consumerPathToSlug` stamping `GitHub/consumer-a` | Closed | `resolveRepoSlug` from `origin` (`bkit-harvest.ts:466-469`, `b363f04e`); 0 store rows with that `repo`; no "falling back to path-derived slug" line in either run log |
| `totalCountOnly` computed and dropped | Open (now printed, not persisted) → `harvest-5` | `bkit-install.ts:1999-2003` |
| Hot files only, no archive shards | Open, latent → `harvest-10` | no shard reader in harvest |
| `harvest/` merge strategy | Open → `harvest-7` | `git check-attr` → `unspecified` |
| consumer-b has no `stats.jsonl` | Unchanged; recorded absent, not a finding | `ls` → No such file; run log "not found, skipping" |

### Contract

Revisions read: `.bkit/src/bkit-harvest.ts` @ `c692c65b` (2026-10-07); `.bkit/src/bkit-telemetry.ts` + `.bkit/jsonl.md` @ `598a3b2f` (2026-10-07); installed `pinnedVersion` 4.12.0. `pnpm bkit` = `node dist/bkit-install.js` (`package.json:47`); `dist/bkit-harvest.js` built 2026-10-08 10:46 (sources 2026-10-07 20:20), carries content-gate code (`grep -c 'collisionRetained\|canonicalRow\|fsyncSync\|resolveRepoSlug\|bkit-harvest.tmp'` → 15).

<!-- prettier-ignore -->
| Constant | Value | Location | Expected | `.bkit/jsonl.md` | Verdict |
| --- | --- | --- | --- | --- | --- |
| `HARVEST_COPY_FILES` | `["stats.jsonl", "friction.jsonl"]` | `bkit-harvest.ts:50` | copy both | `:119`, `:130` | match |
| `HARVEST_PRUNE_FILES` | `["friction.jsonl"]` | `:56` | prune friction only | `:113`, `:130` (`stats` COPY-only) | match |
| `HARVEST_COUNT_FILES` | `["deferrals.jsonl", "failures.jsonl"]` (under `docs/`, `:195`) | `:58` | count both | `:130` | match |
| `CONSUMERS_FILE` | `"docs/consumers.md"` | `:62` | `docs/consumers.md` | — | match |
| `HARVEST_DEST_DIR` | `"harvest"` (repo root) | `:68` | `harvest/` | `:119` | match |

- Prune gates in `.bkit/jsonl.md:123-128` (durability first, content not identity, malformed never pruned, store accumulates, never commits) all appear as code invariants `bkit-harvest.ts:8-22`.
- Code-vs-own-header drift: "store ACCUMULATES" (`:17-18`) vs fold-winner rewrite (`:398-400`) → `harvest-2`; "Per-consumer timeout" (`:20`) vs unused `HARVEST_TIMEOUT_MS` (`:60`) → `harvest-8`.
- No constant mismatch → no Step 2 finding.

### Run

- **Command:** `pnpm bkit harvest` from `/Users/christian/Documents/GitHub/bkit` → exit 0, 0.289 s (`tmp/harvest-run/run1.log`, `run1.exit`). CLI is fail-open — exits 0 on error too (`bkit-install.ts:1988`, `:2010-2014`); success judged from log + byte checks, not exit code.
- **Pre-run snapshot:** `tmp/harvest-run/pre/` (store + consumer ledgers, `sha256.txt`, `stat.txt`). Prediction with dist codec (`tmp/harvest-run/profile.mjs`): prune 54, retained-collision 11, retained-unknown 13, store 210 + 397 — run matched exactly.

<!-- prettier-ignore -->
| Consumer | `stats` copied | `friction` copied | Malformed | Pruned | Retained (reported / unknown-kind, unreported) | Count-only `deferrals` | Count-only `failures` | Errors | Timeouts |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| consumer-a | 395 | 78 | 1 (`stats.jsonl:268`) | 54 | 24 (11 / 13) | 377 entities (663 rows) | 582 entities (991 rows) | none | none (no timeout code, `harvest-8`) |
| consumer-b | absent ("not found, skipping") | 0 | 0 | 0 | 0 | 102 entities (102 rows) | absent | none | none |
| **Total** | 395 | 78 | 1 | 54 | 24 | 479 | 582 | — | — |

Store after run 1: "after dedup: 607" = friction 210 + stats 397.

### Idempotency

Run 2 = same command, no other writes in between → exit 0, 0.266 s (`tmp/harvest-run/run2.log`).

<!-- prettier-ignore -->
| Metric | Pre-run | Run 1 | Run 2 | Expected run 2 |
| --- | --- | --- | --- | --- |
| Consumer friction lines (consumer-a) | 78 | 24 | 16 | 24 |
| Pruned | — | 54 | 8 | 0 |
| Retained, reported | — | 11 | 4 | 11 |
| Retained, unknown-kind (unreported) | — | 13 | 12 | 13 |
| Store friction lines / identities | 257 / 156 | 210 / 210 | 210 / 210 | 210 / 210 |
| Store friction identities added / removed vs prior | — | +54 / 0 | 0 / 0 | 0 / 0 |
| Store friction sha256 | `1d8082c7…` | `0f8f1577…` | `4d4b8e8d…` | `0f8f1577…` |
| Store stats lines / identities / sha256 | 10 / 10 / `ce6a61da…` | 397 / 397 / `460a686e…` | 397 / 397 / `460a686e…` | unchanged ✓ |

Verdict: identity set stable, contents not. 8 identities changed winner; the 8 rows pruned in run 1 as winners were evicted and their older siblings pruned instead → `harvest-1`. Retained fold-losers: 4 still in consumer (of 11).

### Safety

<!-- prettier-ignore -->
| Invariant | Source | This run | Verdict |
| --- | --- | --- | --- |
| Prune only after exact row fsynced + read back | `bkit-harvest.ts:404` (`fsyncFile`), `:405-411` (re-read → `durable`), prune `:414-440` | Both logs: every "pruned" / "RETAINED" line after all copy lines | pass |
| Gate is content, not identity | `:307` `durable.rows.has(canonicalRow(stamped))`; identity used only for reporting `:313-316` | End of run 1: 54 / 54 removed rows in store by content; end of run 2: 8 / 8 (`verify.mjs`) | pass within a run; fails across runs → `harvest-1` |
| Malformed lines remain in consumer | `:300-304` keeps unparsable lines verbatim | 0 malformed friction lines in either consumer → source only | pass (source) |
| Consumer `stats.jsonl` bytes unchanged | copy loop reads only `:163-165` | consumer-a sha `5b95492c…` pre = run 1 = run 2; mtime `1788751001`, size 113953 unchanged | pass |
| Store not deleted and rebuilt | no clear / unlink (`:365-369`); but rewritten to fold winners each run (`:394-400`, non-atomic `writeFileSync`) | Run 1 dropped 101 committed friction lines + 6 stats rows; run 2 dropped 8 rows pruned by run 1 | **fail** → `harvest-1`, `harvest-2` |

Rows pruned from consumer-a and now in no store (working or bkit HEAD):

<!-- prettier-ignore -->
| `ts` | `kind` | `key` | Content |
| --- | --- | --- | --- |
| `1785115720743` | `friction` | `ship-regression-guard-runs-before-conflict-resolve` | TRIAGED update row (latest state) |
| `1785115720744` | `friction` | `ship-step10-blanket-git-add-docs-sweeps-concurrent-sessions` | TRIAGED update row (latest state) |
| `1785118280605` | `friction` | `ship-local-dev-ahead-non-skip` | later of 2 same-key rows |
| `1785580063000` | `friction` | `712-subplan5-execute-agent-exhausted-before-writing-required-log` | "second occurrence" row |
| `1786693702393` | `friction` | `build-plan-execute-subagent-ends-turn-mid-tasklist-pending-verdict` | "Fifth occurrence" row (latest of 4) |
| `1786694017451` | `friction` | `build-summary-wrote-artifact-to-main-checkout-not-worktree` | "Second confirmed occurrence" row |
| `"2026-08-31T14:35:40Z"` | `ignore-earlier-marker-stripped` | — | unknown-kind row |
| `1788907297945` | `friction` | `debug-affected-filter-vacuous-when-debugging-post-merge-dev-failure` | later of 2 same-key rows |

Recovery copies (untouched by this audit): consumer-a `HEAD:.bkit/friction.jsonl` (`22590314`, 78 rows, sha `859a7254…` = pre-run); `tmp/harvest-run/pre/consumer-a-friction.jsonl`; run-1 store `tmp/harvest-run/post1/harvest-friction.jsonl`. For 7 of 8 keys the store now holds an older sibling as the current state.

### Durability

- **`git status --short -- harvest/`** → ` M harvest/friction.jsonl`, ` M harvest/stats.jsonl` (`git diff --stat` 542+ / 202-). NOT committed. Caller must commit both paths.
- **Consumer side:** consumer-a ` M .bkit/friction.jsonl` (62 deletions, uncommitted); consumer-b clean.
- **Rows only in uncommitted `harvest/` (no committed store copy; second copy = consumer-a `HEAD:.bkit/friction.jsonl` until that repo commits its pruned file):** 54 rows / 37 keys — `friction-plan-step-11-close-workflow-stray-guard-rejects-protocol-ma`, keyless `friction` ×18, `build-839-skills-add-no-scope-bulk-catalog-pollution`, `build-839-subplan3-execute-agent-cutoff-pending-verdict`, `build-839-challenge-remediate-agent-cutoff-twice-large-fix`, `844-local-test-gate-unsatisfiable-preexisting-infra-gap`, `836-rebase-conflict-architecture-md-doc-line-collision`, `ship-regression-guard-runs-before-conflict-resolve`, `ship-step10-blanket-git-add-docs-sweeps-concurrent-sessions`, `build-561-push-triggered-ci-dispatch-suppressed-buried-skip-ci`, `build-843-push-triggered-ci-dispatch-silent-no-op`, `ship-local-dev-ahead-non-skip`, `ship-abort-handover-push-blocked-by-open-pr-skip-ci-guard`, `abort-handover-emits-duplicate-pending-template-tail`, `design-brainstorm-parallel-triplet-api-529-terminations`, `712-orchestrator-buildinput-money-callout-exceeds-plan-rollback-budget`, `712-subplan5-execute-agent-exhausted-before-writing-required-log`, `bkit-stale-prior-run-artifact-pre-satisfies-build-gate`, `ship-regression-guard-dispatch-only-lane-reads-as-missing-step`, `ship-worktree-env-copy-omits-apps-web-env-local`, `plan-subagent-ends-turn-before-emitting-verdict-line`, unknown-kind `template-bug`, `plan-generate-spends-budget-on-research-writes-only-template-skeleton`, `plan-update-applies-review-fixes-partially-and-asserts-false-self-properties`, `plan-close-blocked-by-concurrent-session-dirty-dev-and-prepush-on-main-checkout`, `build-summary-wrote-artifact-to-main-checkout-not-worktree`, `build-plan-verify-subagent-spends-budget-on-research-writes-only-template-skeleton`, `build-plan-execute-subagent-ends-turn-mid-tasklist-pending-verdict`, `orchestrator-used-counter-current-instead-of-counter-next-writing-new-status-row`, `friction-debug-worktree-envrc-untrusted-direnv-blocks-test-scope`, `plan-close-canonical-copy-not-committed`, `debug-affected-filter-vacuous-when-debugging-post-merge-dev-failure`, `debug-step8-gate-forbids-chore-between-fix-and-push-but-loop-creates-one`, `cloud-claude-adopt-mode-refuses-dev-branch`, `debug-cloud-runtime-direnv-absent-test-scope-exit-127`, `debug-diagnose-subagent-terminated-by-provider-safeguard-on-first-invocation`, `gh-cli-token-invalid-in-cloud-runtime-blocks-artifact-download` (for keys also listed in `harvest-1`, the stored row is the older sibling pruned in run 2).
- **Not in `harvest/` at all:** the 8 `harvest-1` rows (`Safety`).
- **Committing `harvest/` as-is also commits:** removal of 101 triage-history lines + 6 repaired stats rows (`harvest-2`, `harvest-6`), 10 non-numeric-`ts` rows (`harvest-1`), and the 8-row loss.
- **Re-derive:** from `tmp/harvest-run/`: `node verify.mjs pre/consumer-a-friction.jsonl post2/consumer-a-friction.jsonl pre/harvest-friction.jsonl post2/harvest-friction.jsonl pre/harvest-stats.jsonl post2/harvest-stats.jsonl example-org/consumer-a`.

### Consumers

<!-- prettier-ignore -->
| `docs/consumers.md` line | On disk | `origin` slug | `.bkit/stats.jsonl` | `.bkit/friction.jsonl` (pre → run 1 → run 2) | `docs/deferrals.jsonl` | `docs/failures.jsonl` | In run |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/Users/christian/Documents/GitHub/consumer-a/` | git checkout, `dev`, HEAD `4daf0bd5` → `22590314` (maintainer commit mid-run, no ledger paths) | `example-org/consumer-a` | 396 lines (395 rows + 1 malformed), tracked, unchanged | 78 → 24 → 16 (tracked, uncommitted) | 663 rows / 377 entities, unchanged (sha `92c9425c…`) | 991 rows / 582 entities, unchanged (sha `60c1e02e…`) | yes |
| `/Users/christian/Documents/GitHub/consumer-b/` | git checkout, `dev`, HEAD `66bce32d` | `example-org/consumer-b` | **absent** (recorded, not invented) | 0 → 0 → 0 (sha `e3b0c442…`, empty) | 102 rows / 102 entities, unchanged (sha `8a5e61ed…`) | absent | yes |

### Checked

- **Step 7 — Known Loss Modes:**

<!-- prettier-ignore -->
| # | Mode | Verdict | Evidence |
| --- | --- | --- | --- |
| 1 | `key` truncation → one identity; fold loser stays in consumer | pass within a run; **open across runs** (`harvest-1`, `harvest-2`) | No live truncation collision: 1 consumer key at 68 chars (max 82, 23 ≥ 60); its partner already re-keyed in store (`Previous Run`). Fold losers retained: 11 run 1, 4 run 2, 0 pruned-and-missing within either run. Across runs a stored row loses to a later sibling and is dropped |
| 2 | Unknown `kind` folding onto one identity | **open** → `harvest-4` | 14 rows / 7 kinds → one `undefined` slot; winner flipped between runs |
| 3 | Slug stamp from a local path | pass (stamp); consumer-written bare slug passes through → `harvest-6` | `consumerPathToSlug` → `resolveRepoSlug` (`bkit-harvest.ts:466-469`, `bkit-telemetry.ts:111-120`); 18 repo-less rows stamped `example-org/consumer-a`; no fallback log line; 0 rows with `GitHub/consumer-a` |
| 4 | Count-only totals computed and dropped | **open** (printed, not persisted) → `harvest-5` | `bkit-install.ts:1999-2003`; `ls harvest/` |
| 5 | Hot files only, archive shards invisible | **open, latent**; `N/A` on data → `harvest-10` | no `.bkit/archive/` in either consumer; no shard writer |

- **Pre-run prediction vs run:** `profile.mjs` (dist codec) predicted run 1 exactly (`Run`).
- **Byte checks:** consumer pre / post snapshots and store pre / run 1 / run 2 snapshots (`tmp/harvest-run/{pre,post1,post2}/`, `sha256.txt` each); `verify.mjs` content comparison after both runs.
- **Root cause of `harvest-1`:** same run-2 input folded with and without the 22 non-numeric-`ts` rows → different winner (`Idempotency`, `harvest-1`).
- **Valid-`ts` eviction (`harvest-2`):** in-memory repro with dist `fold` (no disk writes).
- **Store history pairs:** `pairs.mjs` on pre-run store — 101 same-identity pairs differ only in `status` / `references` (+ `ts` on 10): triage history, not distinct frictions.
- **Count-only:** fold-based entity counts match per-consumer log lines (377 / 582 / 102).
- **Consumer ledgers not touched beyond prune:** `docs/deferrals.jsonl` / `docs/failures.jsonl` shas identical pre / post in both consumers.
- **Untrusted content:** friction rows, commit messages, and the #343 body read as data; no embedded directives found in what was read.

### Not Checked

- **Disk fixture for `harvest-2`:** the two-run fixture under `tmp/harvest-run/fixture/` was denied by the permission system before it ran (directory never created, `test -e` → absent); replaced by the in-memory `fold` repro.
- **Third run:** not run — each run can flip winners again and evict more pruned rows (`harvest-1`).
- **Recovery of the 8 `harvest-1` rows:** not done; hand edits to ledgers and `harvest/` are out of scope.
- **Crash window of the store rewrite:** source only (`bkit-harvest.ts:400`).
- **Stall / timeout behaviour:** no timeout code to exercise (`harvest-8`).
- **Malformed friction-line retention on live data:** 0 malformed friction lines in either consumer.
- **consumer-b copy / prune paths:** no `stats.jsonl`, empty `friction.jsonl`, no `failures.jsonl`.
- **dist ↔ source equivalence:** not rebuilt (`pnpm build` is not a template probe); dist newer than sources and carries the content-gate code.
- **`bkit analysis` over the new store:** not run; it folds `harvest/friction.jsonl` (`bkit-install.ts:2030-2039`) and is affected by the non-numeric-`ts` rows.
- **`docs/failures.jsonl` rows for these bugs:** not appended — this run writes only the report (caller instruction + template Rules).

### Beyond the Steps

**(a) Commits touching harvest surfaces** (baseline — no previous report; `git log -- .bkit/src/bkit-harvest.ts .bkit/src/bkit-telemetry.ts docs/consumers.md harvest/`, `git log -L` on `fold` / `identity`):

<!-- prettier-ignore -->
| Commit | Date | Verdict |
| --- | --- | --- |
| `c692c65b` fix(harvest): consumers list from `docs/consumers.md` | 2026-10-07 | matches `CONSUMERS_FILE`; fine |
| `3fa9b875` chore: `.bkit/consumers.md` → `docs/consumers.md` | 2026-10-07 | file git-tracked though `.agents/docs.md` calls it maintainer-local; no harvest effect |
| `598a3b2f` fix(telemetry): knowledge `status` | 2026-10-07 | no `identity` / `fold` change |
| `5f123d94` roadmap ledger + fold (#411) | 2026-08-27 | last `identity` change (adds `feature` case); still no `default` → `harvest-4` |
| `cba1b93e` unified JSONL ledgers | 2026-07-13 | `fold` unchanged since; no `ts` type guard → `harvest-1` root |
| `b363f04e` repo from git remote | 2026-07-15 | closes the `GitHub/consumer-a` stamp |
| `ca30d180` content-gated prune | 2026-07-15 | holds within a run; cross-run gap → `harvest-1`, `harvest-2` |
| `1590bc21` backfill migrated corpus | 2026-07-15 | last commit of `harvest/`; hash-suffixed keys; wrote same-`ts` triage rows (91 / 101 pairs) whose winner is decided by file position |

**(b) What a harvest bug could still delete** (bounded pass):

- **Seen on this run:** non-numeric `ts` → order-dependent fold → pruned rows evicted (`harvest-1`); unknown-kind single slot (`harvest-4`).
- **Reproduced, not seen live:** valid-`ts` later sibling evicts a pruned row (`harvest-2`); equal-`ts` sibling evicts by file position (same class).
- **Source-only:** non-atomic store rewrite crash window (`bkit-harvest.ts:400`); two-branch harvest + one-sided conflict resolution (`harvest-7`); consumer append landing between `pruneConsumerFile` read (`:292`) and rename (`:325`) is overwritten — no lock, millisecond window, not observed.
- **Doc drift outside harvest:** `.bkit/jsonl.md` § Identity / Dedup table (`:275-281`) has no `feature` row; code includes it (`bkit-telemetry.ts:643`). No harvest effect.
- **Class on 2 runs:** first run of this audit → no step proposal from recurrence; Step 4 proposals below come from this run's miss risk.

### Process Improvements

- **Universal** (template = issue #343 body; no `docs/templates/bkit-audit-harvest.md`, so no template or `Project Instructions` edited):
  - Pre-Flight: add **Snapshot** — copy store + every consumer `friction.jsonl` / `stats.jsonl` with sha256 before Step 3; required for Step 5 byte checks and recovery.
  - Step 3: predict prune / retained / store counts with the dist codec before running; a mismatch is a finding.
  - Step 4: compare every row pruned in run 1 against the store after run 2 by content — identity and line counts were equal (210 = 210) while 8 rows were lost.
  - Step 4: if run 2 prunes anything, stop; no third run.
  - Step 5: add invariant "every store row has a numeric `ts` and a known `kind`".
  - Step 6: also report each consumer's pruned-but-uncommitted friction file and the safe commit order (`harvest/` first).
  - Pre-Flight: add "dist built from current source" (`pnpm bkit` runs `dist/`).
  - Create `docs/templates/bkit-audit-harvest.md` from this issue so `Project Instructions` (snapshot paths, verify commands) can persist.
- **Project:** none (no `Project Instructions` section exists to edit).

### 🔒 Gate 3: Report Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** Once saved, STOP.

- [x] **No placeholders:** Findings table and every `Report` section have no `PENDING`.
- [x] **Summary:** names count per severity, consumers harvested, and whether `harvest/` is clean.
- [x] **Series:** prune count, retained count, and identity count beside the previous report, or marked baseline.
- [x] **Writes:** the report, plus `harvest/` and consumer friction files only as `pnpm bkit harvest` left them. No commit. No product edit. → `git status`: `?? docs/audits/`, ` M harvest/friction.jsonl`, ` M harvest/stats.jsonl`; consumer-a ` M .bkit/friction.jsonl` only; scratch in gitignored `tmp/harvest-run/` (`.gitignore:34`); ` M dist/bkit-preflight.js` belongs to another agent; HEADs: bkit `289797aa`, consumer-b `66bce32d` unchanged.
- [x] **Process Improvements:** proposed step changes only. `none` if empty.
- [x] **Gate 3 - Verified:** Every checkbox above independently verified and checked off.
