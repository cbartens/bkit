Verdict: FAIL

<!-- verdict:end -->

# Design Spike

## Claims

Ordered by blast radius. Sources: `design-review-1.md` § PoC Approach (items 1-4) and § Unknowns & Blockers, restated against `design-v1-draft.md`.

<!-- prettier-ignore -->
| # | Claim a probe could disprove | Design elements resting on it | Result |
| --- | --- | --- | --- |
| C1 | With `merge=union` on the old ledger, merging a pre-upgrade branch that appended rows into a `dev` whose old ledger is a zero-byte stub keeps the appended rows, with no conflict, under `git merge`, the close squash's `git merge --squash -X ours`, and the reverse merge of `dev` into the branch. | Zero-byte stubs kept with `merge=union`; Key Edge Case "Pre-upgrade branch"; Close squash "stays as is" (exit 18 check); plan 1's first task. | `SETTLED` |
| C2 | Re-keying the six brain kinds from `(kind, repo, key)` to `(repo, key)` changes no fold winner on this repo's 885 ledger lines: zero cross-file key collisions, and the `proposal` / `lastRecalled` fold additions are inert because no row carries them. | Identity `(repo, key)` decision; `fold()` additions "inert on every row that exists today"; Success Criterion 2 "fold winners unchanged". | `SETTLED` |
| C3 | The migration mapping (fixed input order, fill `status` / `summary`, exact-key `references` to `links.relatedTo`, malformed lines copied, no minted `ts`, drop a line whose identity and `ts` the brain holds) is a pure function on real data: one output line per input line, byte-identical output from two separate runs, and a second run over stubs refilled by union is a no-op except for genuine stragglers. | `mergeIntoBrain`; Success Criterion 2 "byte-identical on a second run and on two branches"; links-in-the-rewrite decision (Q6 departure); straggler mover in brain update. | `SETTLED` |
| C4a | The `docs/roadmap.md` render is unchanged after the four ledgers become the brain plus zero-byte stubs. | Success Criterion 2 "the `docs/roadmap.md` render is unchanged". | `SETTLED` |
| C4b | `bkit stats` figures are unchanged when `stats.ts` moves from `docs/deferrals.jsonl` to the brain, as Boundaries says ("each moves to `readBrain` or the `brain` ledger entry"). | Success Criterion 2 "`bkit stats` figures unchanged"; One door for engine code (stats.ts move). | `DISPROVEN` |
| C5a | `bkit brain context --files` output (path-overlap rows plus the 2,000-token always-loaded part, through the `ledger` clamp) costs fewer tokens (characters / 4) than every current `docs/knowledge.jsonl` row, on three recorded tasks. | Success Criterion 1; `bkit brain context` steps 1-7; Q7 option A. | `SETTLED` |
| C5b | Every `bkit brain context` output carries the always-loaded part, as the Narrative ("plus a short capped summary") and Process Sketch ("plus the capped always-loaded summary") state, under the design's step order (step 5 appends it, step 6 clamps). | Always-loaded part (Q7 option A); `bkit brain context` steps 5-6. | `DISPROVEN` |
| C6 | FTS5 with `bm25` over the fold winners finds rows that the engine's `ledgerScan`, fed the same serialised winners, misses or ranks out of its kept 40, on the seven recorded plan Step 4 lookups (the reason keyword search is `NEW` instead of `EXTEND` of `ledgerScan`). | Reuse row "Keyword search" `NEW`; Search index component `brain-search.ts`; content-hash `fts-{hash}.db`; Success Criterion 4 wording. | `DISPROVEN` |
| C7 | `node:sqlite` opens and runs FTS5 with `bm25` on every official Node 24 build bkit's `engines: >=24` allows, and design option A (an in-process filter installed before importing `node:sqlite`) silences the SQLite `ExperimentalWarning`, and only it, on the builds that print it. | Risk "`node:sqlite` stderr warning (unverified)" option A; clean `--json` stderr. | `SETTLED` |
| C8 | Node 24 distro builds that link the system SQLite instead of the bundled one also have FTS5. | Review Unknown "FTS5 on system-SQLite Node builds"; the FTS5 probe-and-fallback. | `SETTLED` |
| C9 | qmd 2.8.3's project-local setup (`qmd init`, `.qmd/index.yml`) keeps its index outside the repo, or in a place the template can gitignore. | qmd template (`.bkit/templates/scripts/qmd/`, `.qmd/index.yml`, "nothing binary committed"). | `BLOCKED` |

## Method

All commands ran on darwin/arm64, git 2.56.0, local Node v24.16.0, from the worktree root `/Users/christian/Documents/GitHub/bkit/.worktrees/546-knowledge-store-ledger` unless stated. Probe code is under `docs/plans/202611/logs/546-knowledge-store-ledger/spike/` (`{SPIKE}` below). Scratch data went to the session scratchpad `/private/tmp/claude-501/-Users-christian-Documents-GitHub-bkit/83bf44a7-3e17-459a-a178-079228acb829/scratchpad` (`{P}` below). `{P}/brain-run1.jsonl` is C3's migrated brain and is the input to C4-C6.

- **C1:** `{SPIKE}/c1-stub-union.sh` builds four throwaway git repos from the first 7 real lines of `docs/knowledge.jsonl`: base = lines 1-5; `feat` appends lines 6-7; `dev` writes `docs/brain.jsonl` and truncates `docs/knowledge.jsonl` to zero bytes. `.gitattributes` carries `docs/knowledge.jsonl merge=union`. Scenario A = `git merge feat` on `dev`; B = `git merge --squash -X ours feat` on `dev` (the close squash's git call); C = `git merge dev` on `feat`; D = control with `merge=union` removed from the stub. Command: `env -u GIT_DIR -u GIT_WORK_TREE sh {SPIKE}/c1-stub-union.sh "$PWD" {P}/c1`.
- **C2:** `{SPIKE}/c2-identity-parity.ts` parses the four ledgers with the engine's `parse` / `normalizeEvent`, folds them with the engine's `fold` (old identity), folds them again with `compareTs` and a `brain {repo} {key}` identity for the six brain kinds, and compares winner sets, collisions and field presence. Command: `node_modules/.bin/tsx {SPIKE}/c2-identity-parity.ts "$PWD"`.
- **C3:** `{SPIKE}/c3-migration-determinism.ts` is a throwaway `mergeIntoBrain` that follows the design's Migration mapping (no collision branch: C2 found zero collisions, so the collision rule is not exercised by real data). Run 1 and run 2 are separate processes writing separate files, compared with `cmp` and `shasum -a 256`. Mode `second` re-runs over run 1's brain with empty stubs, with stubs refilled by every old line (what C1 shows union brings back), and with one added straggler line. Commands: `node_modules/.bin/tsx {SPIKE}/c3-migration-determinism.ts "$PWD" {P}/brain-run1.jsonl`; the same with `{P}/brain-run2.jsonl`; `cmp {P}/brain-run1.jsonl {P}/brain-run2.jsonl`; `shasum -a 256` on both; `node_modules/.bin/tsx {SPIKE}/c3-migration-determinism.ts "$PWD" {P}/brain-run1.jsonl second`.
- **C4a / C4b:** `{SPIKE}/c4-stats-roadmap-parity.ts` uses the engine's real `runAnalysis`, `renderStatsMarkdown`, `buildRepoStats` and `foldRoadmap`. C4b renders the stats report from `[.bkit/stats.jsonl, .bkit/friction.jsonl, X]` with X = `docs/deferrals.jsonl` (before), X = the migrated brain (the path move Boundaries describes), and X = the brain's `deferral` rows only (a kind-filtered reader). It also runs the unchanged engine's `buildRepoStats` on a scratch root in the post-upgrade layout (brain plus zero-byte stubs). C4a runs `foldRoadmap` on scratch roots in the before and after layouts and compares `docs/roadmap.md`. Commands: `node_modules/.bin/tsx {SPIKE}/c4-stats-roadmap-parity.ts "$PWD" {P}/brain-run1.jsonl {P}/c4`, then `diff -u {P}/c4/stats-before.md {P}/c4/stats-brain-source.md`.
- **C5a / C5b:** `{SPIKE}/c5-context-cost.ts` implements `bkit brain context` steps 1-7 as the design writes them (fold the brain, keep current rows, normalise references, select by exact file or folder above, rank, append the always-loaded part capped at 2,000 tokens, clamp through the engine's real `clampFile(..., "ledger", ...)`). The "before" figure is characters / 4 of every current `docs/knowledge.jsonl` fold winner. The three recorded tasks are the file lists of three landed commits, picked before measuring: `3107d10ac` (#766, engine), `98726574b` (#742, one test), `8f857fd5e` (#748, templates and docs), written with `git show --name-only --format= {sha} > {P}/c5tasks/{name}`. C5b then greps each output for the three always-loaded keys. Commands: `node_modules/.bin/tsx {SPIKE}/c5-context-cost.ts "$PWD" {P}/brain-run1.jsonl {P}/c5out {P}/c5tasks`; then the key grep shown in Evidence.
- **C6:** `{SPIKE}/c6-search-quality.ts` takes the seven distinct `--terms` strings recorded in committed `status.jsonl` files under `docs/plans/202610/logs/` (extracted with `grep -rho --include='status.jsonl' 'ledger-scan --source=[^"]*--terms=\\"[^\\]*\\"' docs/plans | sort -u`). The corpus is the 659 current brain winners. FTS5 uses the design's table `rows(key UNINDEXED, kind UNINDEXED, status UNINDEXED, summary, body, refs)` on `:memory:`, an `OR` of the quoted terms, and `bm25(rows, 0, 0, 0, 10.0, 1.0, 1.0)` (summary weighted highest). `ledgerScan` is the engine's real function from `context.ts`, fed the same winners serialised one per line. Decision rule, written into the probe before the run: the claim holds when, on 2 or more of 7 lookups, `ledgerScan`'s kept output misses 3 or more of FTS5's top 10, or when 25% or more of `ledgerScan`'s kept hits match their terms only through JSON keys or metadata. Command: `node_modules/.bin/tsx {SPIKE}/c6-search-quality.ts "$PWD" {P}/brain-run1.jsonl 2>&1`.
- **C7:** official darwin-arm64 tarballs of Node 24.0.0, 24.14.0 and 24.15.0 were downloaded from `nodejs.org/dist` into `{SPIKE}/node-dl/`, checked against each release's `SHASUMS256.txt` (`shasum -a 256 -c`: `OK` for all three), and extracted. `{SPIKE}/c7-sqlite-fts5.mjs` imports `node:sqlite`, creates an FTS5 table on `:memory:`, runs a `bm25` `MATCH`, and provokes a missing-module error with `USING fts9`. `{SPIKE}/c7b-warning-filter.mjs` installs a `process.emitWarning` filter, then imports `node:sqlite` dynamically, then emits an unrelated `ExperimentalWarning`. Each ran with stderr captured to a file, from `{P}`: `"$n" {SPIKE}/c7-sqlite-fts5.mjs 2>err.txt` for `n` in the three downloaded binaries and the local v24.16.0; `"$n" {SPIKE}/c7b-warning-filter.mjs 2>err.txt` for 24.0.0 and 24.14.0.
- **C8:** Docker 29.8.2 (linux/aarch64) ran `{SPIKE}/c7-sqlite-fts5.mjs`, mounted read-only, in `alpine:edge` (`apk add nodejs`), `fedora:latest` (`dnf install nodejs24`) and `debian:testing` (`apt-get install nodejs`), with `ldd` on the node binary to show which SQLite it links. The three images were pulled for this probe and removed afterwards with `docker rmi`.
- **C9:** `@tobilu/qmd@2.8.3` was installed into `{SPIKE}/qmd/` with `npm install --no-audit --no-fund @tobilu/qmd@2.8.3` (154 packages, exit 0). Running its binary (`{SPIKE}/qmd/node_modules/.bin/qmd --help`, from a scratch project folder) was refused by the session's permission system, twice. Nothing about qmd's index location was observed.

Cleanup: `{SPIKE}/qmd/` and `{SPIKE}/node-dl/` were deleted with `rm -rf qmd node-dl` before the verdict was set; `ls -la {SPIKE}` afterwards lists only the eight probe files. `git status --porcelain` lists only this file and `{SPIKE}/`.

## Evidence

### C1

```text
git: git version 2.56.0
== A: git merge feat (on dev)
exit=0
stub bytes: 17622
stub lines: 7
conflict markers: 0
stub line keys (in order):
  kn-core-9-agent-shell-misses-direnv-repo-env-vars-appear-unset
  kn-20-release-workflow-silently-skipped-after-chore-release-tag
  kn-28-turbo-query-affected-exit-code-returns-0-in-every-path
  kn-37-gha-workflow-injection-never-expand-context-outputs-inside
  migrated-friction-rows-are-not-evidence-on-every-axis
  380-list-issues-not-search-issues-zero-is-inconclusive
  kn-2-npmignore-still-applies-inside-files-listed-directories
expected appended keys:
  380-list-issues-not-search-issues-zero-is-inconclusive
  kn-2-npmignore-still-applies-inside-files-listed-directories
base keys:
  kn-core-9-agent-shell-misses-direnv-repo-env-vars-appear-unset
  kn-20-release-workflow-silently-skipped-after-chore-release-tag
  kn-28-turbo-query-affected-exit-code-returns-0-in-every-path
  kn-37-gha-workflow-injection-never-expand-context-outputs-inside
  migrated-friction-rows-are-not-evidence-on-every-axis
git status --porcelain:
== B: git merge --squash -X ours feat (on dev)
exit=0
stub bytes: 17622
stub lines: 7
conflict markers: 0
stub line keys (in order):
  kn-core-9-agent-shell-misses-direnv-repo-env-vars-appear-unset
  kn-20-release-workflow-silently-skipped-after-chore-release-tag
  kn-28-turbo-query-affected-exit-code-returns-0-in-every-path
  kn-37-gha-workflow-injection-never-expand-context-outputs-inside
  migrated-friction-rows-are-not-evidence-on-every-axis
  380-list-issues-not-search-issues-zero-is-inconclusive
  kn-2-npmignore-still-applies-inside-files-listed-directories
expected appended keys:
  380-list-issues-not-search-issues-zero-is-inconclusive
  kn-2-npmignore-still-applies-inside-files-listed-directories
base keys:
  kn-core-9-agent-shell-misses-direnv-repo-env-vars-appear-unset
  kn-20-release-workflow-silently-skipped-after-chore-release-tag
  kn-28-turbo-query-affected-exit-code-returns-0-in-every-path
  kn-37-gha-workflow-injection-never-expand-context-outputs-inside
  migrated-friction-rows-are-not-evidence-on-every-axis
git status --porcelain:
  M  docs/knowledge.jsonl
Automatic merge went well; stopped before committing as requested
== C: git merge dev (on feat)
exit=0
stub bytes: 17622
stub lines: 7
conflict markers: 0
stub line keys (in order):
  kn-core-9-agent-shell-misses-direnv-repo-env-vars-appear-unset
  kn-20-release-workflow-silently-skipped-after-chore-release-tag
  kn-28-turbo-query-affected-exit-code-returns-0-in-every-path
  kn-37-gha-workflow-injection-never-expand-context-outputs-inside
  migrated-friction-rows-are-not-evidence-on-every-axis
  380-list-issues-not-search-issues-zero-is-inconclusive
  kn-2-npmignore-still-applies-inside-files-listed-directories
expected appended keys:
  380-list-issues-not-search-issues-zero-is-inconclusive
  kn-2-npmignore-still-applies-inside-files-listed-directories
base keys:
  kn-core-9-agent-shell-misses-direnv-repo-env-vars-appear-unset
  kn-20-release-workflow-silently-skipped-after-chore-release-tag
  kn-28-turbo-query-affected-exit-code-returns-0-in-every-path
  kn-37-gha-workflow-injection-never-expand-context-outputs-inside
  migrated-friction-rows-are-not-evidence-on-every-axis
git status --porcelain:
== D (control, no merge=union on stub): git merge feat (on dev)
exit=1
stub bytes: 17656
stub lines: 10
conflict markers: 3
stub line keys (in order):
  kn-core-9-agent-shell-misses-direnv-repo-env-vars-appear-unset
  kn-20-release-workflow-silently-skipped-after-chore-release-tag
  kn-28-turbo-query-affected-exit-code-returns-0-in-every-path
  kn-37-gha-workflow-injection-never-expand-context-outputs-inside
  migrated-friction-rows-are-not-evidence-on-every-axis
  380-list-issues-not-search-issues-zero-is-inconclusive
  kn-2-npmignore-still-applies-inside-files-listed-directories
expected appended keys:
  380-list-issues-not-search-issues-zero-is-inconclusive
  kn-2-npmignore-still-applies-inside-files-listed-directories
base keys:
  kn-core-9-agent-shell-misses-direnv-repo-env-vars-appear-unset
  kn-20-release-workflow-silently-skipped-after-chore-release-tag
  kn-28-turbo-query-affected-exit-code-returns-0-in-every-path
  kn-37-gha-workflow-injection-never-expand-context-outputs-inside
  migrated-friction-rows-are-not-evidence-on-every-axis
git status --porcelain:
  UU docs/knowledge.jsonl
script exit=0
```

Observed: in A, B and C the union result is the base's 5 lines plus the 2 appended lines (7 lines), with no conflict. The emptied side does not win: the old lines come back as well, which settles the review's open question (old lines return). `-X ours` does not override the union driver. Without `merge=union` (D) the same merge conflicts (`UU`, exit 1).

### C2

```text
rows read: 885, malformed: 0
rows per file:kind {"docs/decisions.jsonl:decision":469,"docs/deferrals.jsonl:deferral":163,"docs/failures.jsonl:failure":128,"docs/knowledge.jsonl:knowledge":125}
rows per repo {"cbartens/bkit":885}
rows without a string key: 0
entries under (kind, repo, key): 842
entries under (repo, key): 842
(repo, key) collisions across file or kind: 0
winners only under old identity: 0
winners only under new identity: 0
rows carrying 'proposal': 0
rows carrying 'lastRecalled': 0
rows carrying 'links': 0
same-entry rows sharing one ts: 0
SUPERSEDED winners: 45
PARITY: HOLDS
exit=0
```

### C3

```text
--- run 1
input lines (wc -l sum): 885
output lines: 885
output sha256/16: c40db9a59052f609
{"lines":885,"malformed":0,"blank":0,"statusFilled":57,"summaryFilled":28,"linked":136,"linkEdges":162,"dropped":0,"copiedVerbatim":668,"selfRefs":0}
entries old: 842, entries new: 842, winners equal (added fields stripped): 842, differ: 0
exit=0
--- run 2 (separate process, same base)
exit=0
cmp: byte-identical
c40db9a59052f60909d33b63fbd4c5cbc4affaa35d33b2825944d1dae49dd3fa  /private/tmp/claude-501/-Users-christian-Documents-GitHub-bkit/83bf44a7-3e17-459a-a178-079228acb829/scratchpad/brain-run1.jsonl
c40db9a59052f60909d33b63fbd4c5cbc4affaa35d33b2825944d1dae49dd3fa  /private/tmp/claude-501/-Users-christian-Documents-GitHub-bkit/83bf44a7-3e17-459a-a178-079228acb829/scratchpad/brain-run2.jsonl
--- second run over run 1 output
brain sha256/16 before: c40db9a59052f609
second run, empty stubs: identical=true
second run, stubs refilled with every old line: identical=true
second run, refilled + 1 straggler: added lines=1, prefix identical=true
{"lines":1771,"malformed":0,"blank":0,"statusFilled":1,"summaryFilled":0,"linked":0,"linkEdges":0,"dropped":1770,"copiedVerbatim":0,"selfRefs":0}
exit=0
```

### C4a and C4b

```text
stats report bytes before: 5044, with brain as the deferral source: 5147
stats report identical (brain as source): false
stats report identical (brain, deferral kind only): true
unchanged engine, buildRepoStats identical before/after upgrade layout: false
  before deferral lines: ["> **Purpose:** This repo's workflow statistics, computed from `.bkit/stats.jsonl`, `.bkit/friction.jsonl`, `docs/deferrals.jsonl`. Workflow closes append the rows; rows a direct chat wrote (`utility`) are reported apart.","| deferral | 79 | 81 |","## Deferral discipline","Deferrals adjudicated unjustified, by the writer that deferred.","| Writer | Model | Deferrals | Unjustified | Rate | Reasons |","| bkit-utility-update-deferrals | claude-opus-5-5 | 23 | 0 | 0.0% | hard-blocked=3 low-severity=5 needs-decision=6 own-cycle=3 scope-declared=6 |"]
  after deferral lines:  ["> **Purpose:** This repo's workflow statistics, computed from `.bkit/stats.jsonl`, `.bkit/friction.jsonl`, `docs/deferrals.jsonl`. Workflow closes append the rows; rows a direct chat wrote (`utility`) are reported apart."]
roadmap fold before: {"written":true,"counts":{"designed":1,"planned":5,"built":3,"debugged":0,"shipped":10},"malformed":0}
roadmap fold after:  {"written":true,"counts":{"designed":1,"planned":5,"built":3,"debugged":0,"shipped":10},"malformed":0}
roadmap.md bytes before=13870 after=13870 identical=true
exit=0
```

`diff -u {P}/c4/stats-before.md {P}/c4/stats-brain-source.md` (header paths shortened to `{P}`; the body is verbatim):

```diff
--- {P}/c4/stats-before.md	2026-11-01 16:26:33
+++ {P}/c4/stats-brain-source.md	2026-11-01 16:26:33
@@ -7,22 +7,27 @@
 <!-- prettier-ignore -->
 | Kind | Workflow rows | Direct-chat rows |
 | --- | --- | --- |
+| decision | 140 | 304 |
 | deferral | 79 | 81 |
 | compliance | 71 | 0 |
 | counter | 40 | 0 |
 | outcome | 35 | 0 |
+| failure | 34 | 80 |
+| knowledge | 26 | 98 |
 | friction | 16 | 0 |

 <!-- prettier-ignore -->
 | Workflow | Rows |
 | --- | --- |
-| plan | 88 |
-| utility | 81 |
-| design | 51 |
-| build | 46 |
-| ship | 41 |
-| migrate | 13 |
-| unknown | 2 |
+| utility | 563 |
+| plan | 164 |
+| build | 119 |
+| design | 75 |
+| ship | 49 |
+| migrate | 18 |
+| audit | 8 |
+| unknown | 7 |
+| manual | 1 |

 ## Workflow runs

diff exit=1
```

Observed: pointing the stats source at the brain adds `decision`, `failure` and `knowledge` rows to the Kind table and changes every Workflow row count; the rest of the report, the Deferral discipline section included, is unchanged. With only the brain's `deferral` rows the report is byte-identical. The unchanged engine on the post-upgrade layout drops the `deferral` row and the whole Deferral discipline section with no error or warning (the "after deferral lines" list holds only the header line).

### C5a and C5b

```text
brain entries: 842, current: 659
current knowledge: 112, with >=1 path reference: 103 (92.0%)
current decision: 411, with >=1 path reference: 393 (95.6%)
current rows matching .bkit/core/engine/ledgers/telemetry.ts: 9
BEFORE: whole docs/knowledge.jsonl = 69934 tokens (279735 chars); current knowledge rows (112) = 61643 tokens
TASK 742-prepush: files=1 selected=2 (exact=1) pathless-candidates=9 always-loaded=3 (893 tok) pre-clamp=1563 tok, clamped=false, origLines=5, keptLines=5, AFTER=1563 tok, ratio after/before(current knowledge)=0.025
TASK 748-health: files=18 selected=97 (exact=94) pathless-candidates=9 always-loaded=3 (893 tok) pre-clamp=48170 tok, clamped=true, origLines=100, keptLines=26, AFTER=12369 tok, ratio after/before(current knowledge)=0.201
TASK 766-stats: files=14 selected=25 (exact=23) pathless-candidates=9 always-loaded=3 (893 tok) pre-clamp=12600 tok, clamped=false, origLines=28, keptLines=28, AFTER=12600 tok, ratio after/before(current knowledge)=0.204
exit=0
```

Tail of the clamped `748-health` output:

```text
> [bkit] TRUNCATED — kept 26 of 100 lines (48 KB of 189 KB); the rest is NOT in this file, re-run the source to see it.
> Dropped content was NOT read. Its absence is not evidence.
```

Always-loaded keys per output (`grep -c` of each key in each task's output):

```text
new-raw-gate-log-name-must-join-prettierignore in 742=1 766=1 748=0
wording-retired-prefix-of-new-text-and-loose-list-items in 742=1 766=1 748=0
tracker-true-block-between-group-and-false-block-breaks-none-render in 742=1 766=1 748=0
```

Observed: the after figure is 2.5%, 20.1% and 20.4% of the before figure. On `748-health` the `ledger` clamp keeps the first 26 lines (`selectLedger` keeps a head of `rows.slice(0, keep)`), so the always-loaded rows that step 5 appended at the end are dropped. Side measurements against the design's figures: path reach is 92.0% / 95.6% (design: 93% / 96%); `telemetry.ts` matches 9 current rows (design: "over a hundred"); one task still selects 97 rows, so ranking does decide what survives the clamp.

### C6

```text
corpus: 659 current winners; FTS5 build 29.7 ms
LOOKUP "branding migration vale workflow scripts prefix": ledgerScan total=139 kept=40; FTS5 matches=344; FTS5 top10 missed by ledgerScan kept=0/10; ledgerScan kept hits matching only via keys/metadata=4/40
  FTS5 top5: 748-rename-unprefixed-template-script-files | 748-names-outside-the-branding-rule | 748-consumer-facing-names-carry-bkit-prefix | 748-brand-migration-rewrites-adopted-copies-exact-shipped-text | 724-machine-lock-script-named-locks-no-migration
  ledgerScan top5: 748-rename-unprefixed-template-script-files | 748-names-outside-the-branding-rule | 748-consumer-facing-names-carry-bkit-prefix | 748-upgrade-moves-unedited-ci-script-copies | 748-brand-migration-rewrites-adopted-copies-exact-shipped-text
LOOKUP "codex cloud router tracker guard": ledgerScan total=103 kept=40; FTS5 matches=247; FTS5 top10 missed by ledgerScan kept=0/10; ledgerScan kept hits matching only via keys/metadata=0/40
  FTS5 top5: 719-codex-cloud-session-start-guard | 719-codex-cloud-no-session-guard | 719-router-stale-copy-detect-only | 719-router-secret-findings-per-variant | 719-any-cloud-agent-any-wired-tracker
  ledgerScan top5: 719-router-stale-copy-detect-only | 719-codex-cloud-session-start-guard | de-21-141-bkit-cloud-rebuilt-on-the-claude-github-app | 719-cursor-guard-tracker-unset-advisory | 719-live-checks-deferred-to-owner-use
LOOKUP "completeness friction status-holes engine-call journal": ledgerScan total=14 kept=14; FTS5 matches=51; FTS5 top10 missed by ledgerScan kept=0/10; ledgerScan kept hits matching only via keys/metadata=0/14
  FTS5 top5: 699-completeness-check-module-and-seam-files | 699-pre-journal-carve-out-with-heartbeat | 699-engine-journal-stays-in-status-jsonl | 699-completeness-verdict-no-success-axis | 699-completeness-seam-first-behind-flag
  ledgerScan top5: 699-completeness-check-module-and-seam-files | 699-completeness-verdict-no-success-axis | 699-follow-up-scoping-one-issue-one-plan | 699-engine-call-attribution-positional-with-unattributable-bucket | 699-pre-journal-carve-out-with-heartbeat
LOOKUP "lite workflow retire publish build PR push prompt": ledgerScan total=563 kept=40; FTS5 matches=411; FTS5 top10 missed by ledgerScan kept=1/10; ledgerScan kept hits matching only via keys/metadata=0/40
  FTS5 top5: 715-build-publish-setting | 715-debug-publish-mode-unchanged | 715-consumer-lite-content-migration | 715-lite-workflows-retired | 715-build-verification-unchanged
  ledgerScan top5: 715-build-publish-setting | 715-lite-workflows-retired | 715-debug-publish-mode-unchanged | 715-no-batch-publish-verb | 666-instructions-store-masters
  missed: ship-cloud-failure-path-after-merge-has-no-publish-channel [On a cloud runtime, a ship Failure Path entered AFTER the merge (red squash-merge CI, Swit]
LOOKUP "machine lock vitest tests-lock slots": ledgerScan total=37 kept=37; FTS5 matches=83; FTS5 top10 missed by ledgerScan kept=0/10; ledgerScan kept hits matching only via keys/metadata=1/37
  FTS5 top5: 724-tests-lock-fixed-slots-not-live-load | 724-host-hook-catches-raw-test-runners | 724-vitest-global-setup-holds-tests-lock | 724-timeout-budget-and-ci-serialisation-unchanged | 724-light-runs-skip-tests-lock
  ledgerScan top5: 724-vitest-global-setup-holds-tests-lock | 724-light-runs-skip-tests-lock | 724-tests-lock-fixed-slots-not-live-load | 724-lock-script-short-wait-without-tty | 724-gate-templates-pass-test-workers
LOOKUP "session-start advisory rules-read hook preflight": ledgerScan total=48 kept=40; FTS5 matches=122; FTS5 top10 missed by ledgerScan kept=2/10; ledgerScan kept hits matching only via keys/metadata=2/40
  FTS5 top5: 700-session-start-rules-read-advisory | kn-hooks-sessionstart-stdout-is-one-json-document | 700-session-start-nudge-challenge-low-bkit-core-hooks-preflight-rules-sh-6 | 719-codex-cloud-session-start-guard | 719-tracker-guard-no-issue-id-not-verified
  ledgerScan top5: 700-session-start-nudge-challenge-low-bkit-core-hooks-preflight-rules-sh-6 | 700-session-start-rules-read-advisory | 700-session-start-nudge-challenge-low-bkit-core-claude-hooks-bkit-preflight-sh-46 | kn-hooks-sessionstart-stdout-is-one-json-document | 719-cursor-guard-tracker-unset-advisory
  missed: antigravity-advisories-deny-once [On Antigravity, hook advisories (GateGuard checklist, ReadGuard note, guardrails fetch / s] || readguard-repeat-read-hook [ReadGuard: advisory repeat-read hook on all five hosts, file reads only, log per (session,]
LOOKUP "tests verdict fixable tasks ledgers scan-diff": ledgerScan total=44 kept=40; FTS5 matches=197; FTS5 top10 missed by ledgerScan kept=1/10; ledgerScan kept hits matching only via keys/metadata=3/40
  FTS5 top5: 701-currency-range-three-dot | 656-660-engine-counts-plan-test-first | 701-green-always-prints-verdict | 701-verdict-precedence | 701-verify-header-rollup
  ledgerScan top5: 656-660-engine-counts-plan-test-first | 701-verify-header-rollup | 701-verdict-precedence | 701-not-green-fixable-true | 701-green-always-prints-verdict
  missed: 467-reask-on-pending-or-invalid-header-everywhere [Every workflow re-asks the agent when its verdict header is PENDING (exit 5) or invalid (e]
SUMMARY lookups where ledgerScan missed >=3 of FTS5 top10: 0/7; metadata-only share of ledgerScan kept hits: 10/251 = 4.0%
CLAIM (FTS5 adds retrieval ledgerScan lacks): DOES NOT HOLD
exit=0
```

No `ExperimentalWarning` appeared in the merged stdout and stderr on v24.16.0.

### C7

```text
=== .../node-dl/node-v24.0.0-darwin-arm64/bin/node
node=v24.0.0 sqlite=3.49.1 node_shared_sqlite=false platform=darwin/arm64
fts5=ok rows=1 bm25=number
missing-module error: code=ERR_SQLITE_ERROR errcode=1 errstr=SQL logic error message=no such module: fts9
exit=0
stderr:
  (node:84236) ExperimentalWarning: SQLite is an experimental feature and might change at any time
  (Use `node --trace-warnings ...` to show where the warning was created)
=== .../node-dl/node-v24.14.0-darwin-arm64/bin/node
node=v24.14.0 sqlite=3.51.2 node_shared_sqlite=false platform=darwin/arm64
fts5=ok rows=1 bm25=number
missing-module error: code=ERR_SQLITE_ERROR errcode=1 errstr=SQL logic error message=no such module: fts9
exit=0
stderr:
  (node:84285) ExperimentalWarning: SQLite is an experimental feature and might change at any time
  (Use `node --trace-warnings ...` to show where the warning was created)
=== .../node-dl/node-v24.15.0-darwin-arm64/bin/node
node=v24.15.0 sqlite=3.51.3 node_shared_sqlite=false platform=darwin/arm64
fts5=ok rows=1 bm25=number
missing-module error: code=ERR_SQLITE_ERROR errcode=1 errstr=SQL logic error message=no such module: fts9
exit=0
stderr:
=== /Users/christian/.local/state/fnm_multishells/17129_1793294912430/bin/node
node=v24.16.0 sqlite=3.53.0 node_shared_sqlite=false platform=darwin/arm64
fts5=ok rows=1 bm25=number
missing-module error: code=ERR_SQLITE_ERROR errcode=1 errstr=SQL logic error message=no such module: fts9
exit=0
stderr:
```

(The `.../node-dl/` prefix stands for `{SPIKE}/node-dl/` under the worktree; the rest of each line is verbatim.)

`c7b-warning-filter.mjs`:

```text
=== .../node-dl/node-v24.0.0-darwin-arm64/bin/node
node=v24.0.0 imported node:sqlite with filter installed
exit=0
stderr:
  (node:85677) ExperimentalWarning: an unrelated warning still prints
  (Use `node --trace-warnings ...` to show where the warning was created)
=== .../node-dl/node-v24.14.0-darwin-arm64/bin/node
node=v24.14.0 imported node:sqlite with filter installed
exit=0
stderr:
  (node:85679) ExperimentalWarning: an unrelated warning still prints
  (Use `node --trace-warnings ...` to show where the warning was created)
```

Observed: the filter works only because the probe imports `node:sqlite` dynamically after installing it. A static `import` is hoisted above module code in ESM, so it would run before the filter. A missing module raises the generic `errcode=1` (`SQL logic error`); only the message `no such module: <name>` tells it apart from other SQLite errors.

### C8

```text
### alpine:edge
nodejs: JavaScript runtime built on V8 engine - LTS version
	libsqlite3.so.0 => /usr/lib/libsqlite3.so.0 (0xffffa2234000)
node=v24.22.1 sqlite=3.54.1 node_shared_sqlite=true platform=linux/arm64
fts5=ok rows=1 bm25=number
missing-module error: code=ERR_SQLITE_ERROR errcode=1 errstr=SQL logic error message=no such module: fts9
exit=0
stderr:
### fedora:latest
Fedora release 44 (Forty Four)
bin=/usr/sbin/node-24
nodejs24-24.18.0-1.fc44.aarch64
	libsqlite3.so.0 => /lib64/libsqlite3.so.0 (0x0000ffff8b830000)
node=v24.18.0 sqlite=3.51.2 node_shared_sqlite=true platform=linux/arm64
fts5=ok rows=1 bm25=number
missing-module error: code=ERR_SQLITE_ERROR errcode=1 errstr=SQL logic error message=no such module: fts9
exit=0
stderr:
### debian:testing
Version: 24.21.0+dfsg+~cs24.13.4-1
	libsqlite3.so.0 => /usr/lib/aarch64-linux-gnu/libsqlite3.so.0 (0x0000ffffb1d60000)
node=v24.21.0 sqlite=3.53.4 node_shared_sqlite=true platform=linux/arm64
fts5=ok rows=1 bm25=number
missing-module error: code=ERR_SQLITE_ERROR errcode=1 errstr=SQL logic error message=no such module: fts9
exit=0
stderr:
```

(The `### <image>` labels were printed by the calling shell; Docker pull progress lines were filtered out with `grep -v`.)

### C9

Install:

```text
added 154 packages in 24s
exit=0
qmd
```

Both attempts to run the binary were refused. Second refusal, verbatim:

```text
Permission for this action was denied by the Claude Code auto mode classifier. Reason: The server-side auto mode classifier judged this action dangerous (it gave no explanation).
```

## Design Impact

- **C4b, `bkit stats` move to the brain:** this invalidates Boundaries' "each moves to `readBrain` or the `brain` ledger entry" as applied to `.bkit/core/engine/commands/stats.ts`, and Success Criterion 2's "`bkit stats` figures unchanged" under that move. `runAnalysis` counts every fold winner in its sources in the Kind and Workflow tables, so the brain's decision, failure and knowledge winners show up there (Kind table rows `| decision | 140 | 304 |`, `| failure | 34 | 80 |`, `| knowledge | 26 | 98 |`; Workflow row `utility` 81 to 563). The evidence supports a reader that passes only `deferral` winners to `runAnalysis`: a kind filter on `readBrain` or `skipKinds` for the other five brain kinds. With that filter the report is byte-identical. Plan 1 needs a test that pins the whole `.bkit/stats.md` render before and after the merge. Separately, the unchanged engine on the post-upgrade layout drops the whole Deferral discipline section with no error. That is concrete evidence for the review's CRITICAL 2 and 3 (a missed reader goes silent), and for widening the old-path audit test.
- **C5b, the always-loaded part:** this invalidates the `bkit brain context` step order (step 5 appends the always-loaded part, step 6 clamps) and the Narrative / Process Sketch promise that every output carries "the capped always-loaded summary". The `ledger` clamp keeps the head of the file, so on a large selection (97 rows on `748-health`) all three always-loaded rows are cut. The evidence supports one of two orders: write the always-loaded part first, or reserve its 2,000-token budget and clamp only the path-selected rows into the rest of the clamp budget. The design's existing "list dropped rows by key" notice then covers only path rows.
- **C6, keyword search as `NEW` on FTS5:** this invalidates the Reuse verdict `NEW` for keyword search, the `brain-search.ts` component, the `tmp/bkit-brain/fts-{hash}.db` cache and Success Criterion 4's "`node:sqlite` FTS5" wording, as a need at this repo's size. On the seven recorded lookups, `ledgerScan` over the current fold winners kept all of FTS5's top 10 on 4 lookups and missed 1, 2 and 1 on the other three (0 of 7 lookups at 3 or more missed). Only 4.0% of its kept hits matched through JSON keys alone. The evidence supports the review's CRITICAL 1 option: make `bkit brain search` = `ledgerScan` over `readBrain` current winners, with a `--kind` filter, and add FTS5 only when a measured ranking gap appears. C7 and C8 stay valid for that later step: FTS5 works on every tested build, the warning filter must run before a dynamic `import("node:sqlite")`, and the fallback must key on the `no such module` message, not on `errcode`.

## Unsettled

- **C9, qmd index location:** to settle it, the owner must allow running the third-party `qmd` binary (`@tobilu/qmd@2.8.3`, installed in the spike folder; its native dependencies include `better-sqlite3` and `node-llama-cpp`). The probe would run `qmd init` in a scratch project with `HOME` pointed at a scratch folder, then list where the index file appears. Risk carried into the design: if `qmd init` writes its SQLite index under the project's `.qmd/`, the template needs a gitignore line there. Otherwise "nothing binary committed" fails for a consumer who runs `git add -A`. This is limited to plan 5, the opt-in template, and does not touch plans 1-4.

## Verdict Reasoning

`FAIL`, because three claims are `DISPROVEN` by captured output. C4b: moving `bkit stats` to the brain changes the Kind and Workflow tables. C5b: the clamp drops the always-loaded part on one of three recorded tasks. C6: `ledgerScan` over fold winners matches FTS5's retrieval on the seven recorded lookups, so the `NEW` FTS5 search component has no measured need. Each has a narrow, evidence-backed fix: a `deferral` kind filter for stats, an always-loaded-first order in `context`, and `ledgerScan` as core search. The highest-risk claims held. The stub union keeps the branch's rows under all three merge shapes (C1), the `(repo, key)` re-key changes no winner (C2), the migration is byte-deterministic and a no-op on a second run (C3), the roadmap render is unchanged (C4a), the context output costs 0.025, 0.201 and 0.204 of the whole-knowledge read on the three recorded tasks (C5a), and FTS5 works on every tested official and distro Node 24 build (C7, C8). C9 is `BLOCKED` on a refused permission and affects only the qmd template.
