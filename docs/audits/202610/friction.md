<!-- Note: Report at `docs/audits/202610/friction.md`. Template = GitHub issue #99 body (no `docs/templates/bkit-audit-friction.md` exists). `@bkit-audit-generate` procedure mirrored. Never overwrite. -->

# Friction Triage

> [!CAUTION]
> **Purpose:** Verdict on harvested friction — already fixed, still open, superseded, or the same row twice.
>
> **Rules:**
>
> - Read-only. Do not edit code, config, ledgers, or `harvest/`. Do not run harvest. Do not delete a friction row.
> - Correction and close text live in `Expected` only.
> - Canonical sources are `.bkit/` (prompts, workflows, `src`). A hit only under `.claude/`, `.cursor/`, or `.opencode/` is a mirror, not the source.
> - Use dense phrasing. Every claim cites `file:line` or a command. Empty search is not absence.
> - Read this issue once at the start.
> - Ledger rules: `.bkit/jsonl.md` § Friction Is a Drained Queue, § Severity, § Categories `friction`.

## Instructions

### Context & Goals

Consumers append `.bkit/friction.jsonl`. `bkit harvest` moves those rows into `harvest/` and prunes the consumer. Nothing in that path decides whether the friction is still true. Target failure: **an open friction the code already fixed, or two distinct frictions collapsed into one key**.

A dated fix list is not this procedure. Re-verify against the tree at `HEAD`. Paths in old comments (`.agents/prompts`, `.agents/workflows`) are historical; the source tree is `.bkit/prompts` and `.bkit/workflows`.

**Applies when:** `harvest/friction.jsonl` exists, or any checkout still has `.bkit/friction.jsonl`. Neither → one `N/A` row and stop. Harvest first (#343) when the consumer queues are the input and have not been harvested.

**Cadence:** after a harvest, and at least monthly. Extra pass after a workflow or prompt rewrite that would obsolete a cluster.

**Anchor standards:** record the revision read.

- `.bkit/jsonl.md` § Severity and the `friction` category enum, at the installed version.

### Scope

- Rows in `harvest/friction.jsonl`, plus any `.bkit/friction.jsonl` not yet harvested. Say which file each row came from.
- Cluster by `category` and by the same workflow, prompt, or path.
- One verdict per cluster verified this pass.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why | Where it belongs |
| --- | --- | --- |
| Running harvest or committing `harvest/` | Different audit | #343 |
| Implementing the fix | Audit reports only | A plan from this report |
| Deferrals and failures | Other ledgers | `bkit-audit-deferrals`, `bkit-audit-failures` |
| Rows only in a mirror directory | Generated | The `.bkit/` source |

### Verdicts

One per verified cluster.

- **FIXED:** the behaviour is gone at `HEAD`. Cite `file:line`. `Expected` = no code change.
- **OPEN:** still true. `Expected` = the change, the file, and the severity.
- **SUPERSEDED:** the surface moved or was removed, so the row no longer applies. Cite what replaced it.
- **DUPLICATE:** same behaviour as another row, including two texts that share one truncated `key`. Name both.
- **NEEDS HARVEST:** still only on a consumer `.bkit/friction.jsonl`. `Expected` = run #343. Do not harvest here.
- **OTHER:** say what it is and where it goes.

**FIXED is the verdict most likely to be wrong.** A closed issue or a commit message is not evidence. Read the source.

### 🚨 Pre-Flight / Dependencies 🚨

#### Core

- [x] **Ledger spec:** `.bkit/jsonl.md` § Friction Is a Drained Queue (`:111`), § Severity (`:136`), § Categories `friction` (`:209-220`), read at `HEAD` `289797aa` (file last changed `598a3b2f`; working copy differs only at `:42`, `feature` writers). Installed version `4.12.0` (`.bkit/version` `pinnedVersion`). Fallback: stop.
- [x] **Store:** `harvest/friction.jsonl` — 210 lines, 0 malformed, uncommitted (` M`, `git status --short -- harvest/`). Committed copy `HEAD:harvest/friction.jsonl` = 257 lines / 156 keys; per-key folded `status` / `severity` identical to the working store (0 differences).
- [x] **Prior report:** `find docs/audits -name 'friction*'` → none. Baseline.

#### Conditional

- [x] **Unharvested:** `docs/consumers.md` lists `consumer-a/` and `consumer-b/`. `consumer-a/.bkit/friction.jsonl` 16 lines; `consumer-b/.bkit/friction.jsonl` 0 lines. Added: 8 rows lost by `harvest-1` (`docs/audits/202610/harvest.md`), recovered from `tmp/harvest-run/pre/consumer-a-friction.jsonl` (78 lines = consumer-a `HEAD:.bkit/friction.jsonl`); identified as snapshot rows absent by content from store and consumer. Added: bkit's own `.bkit/friction.jsonl` (44 lines, `cbartens/bkit`), never harvested (bkit not in `docs/consumers.md`; `.bkit/src/bkit-harvest.ts:109` reads consumers only).
- [x] **Source tree:** `.bkit/prompts`, `.bkit/workflows`, `.bkit/scripts`, `.bkit/src` read at `HEAD` via `git show HEAD:` / `git grep … HEAD --` (working tree carries other agents' uncommitted edits to 23 source files, incl. `.bkit/workflows/bkit-ship.md`; not used).

### 🔒 Gate 1: Prerequisites Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all applicable boxes above. **DO NOT stop for user permission.** Once saved, immediately proceed to `Probe Steps`.

- [x] **Gaps named:** every missing item names its fallback and `Not Checked` entry.
- [x] **Gate 1 - Verified:** All Core items checked. All applicable Conditional items checked.

### Probe Steps

- [x] **Step 1 — Previous Run:** Record `git rev-parse HEAD`. Read the newest prior report. Findings still open after 2 runs → re-raise with age. **Done when:** closure rate in `Previous Run`, or run marked baseline. → HEAD `289797aac09ceb404f4d7c2fd9ab79be53ac786d`; no prior `friction*.md`; baseline.
- [x] **Step 2 — Fold:** Parse `harvest/friction.jsonl` and any unharvested consumer friction files. Group by `key`. A `key` shared by byte-different `summary` or `description` values is a collision, not one event. Order: `CRITICAL`, then `HIGH`, then oldest `ts`. Missing `severity` → assign one with the verdict. Record count, age, missing `severity`, missing `category`, and rows verified / rows seen. A large set may be a partial pass. **Done when:** `Trend` holds those numbers, or `N/A` and stop. → 278 rows / 255 entities; 166 open (`status` != `CLOSED`); partial pass, numbers in `Trend`.
- [x] **Step 3 — Source:** No verdict before this step. For each cluster verified this pass, open the `.bkit/` file the row names. If the path is a retired `.agents/` path, search the same basename under `.bkit/`. Mirror copies do not count. Re-run an empty search before calling the row fixed. **Done when:** every verified cluster has `file:line` or a named search that was re-run. → every verdict row in `Findings` cites `HEAD` `file:line`; empty searches re-run: literal `$0` / `[$][0-9]` in workflows, `direnv` in `.bkit/workflows` + `.bkit/scripts`, `docs/pending.md` / `docs/decisions.md` in workflows + prompts.
- [x] **Step 4 — Classify:** One verdict per cluster. Collisions are DUPLICATE plus a finding that the `key` is lossy. A row whose workaround is the only remaining trace is still OPEN if the behaviour remains. Do not edit the ledger. **Done when:** every verified cluster has one verdict. → 161 of 166 open entities classified; 5 seen only (`Not Checked`).
- [x] **Step 5 — Clusters:** Three or more OPEN rows on the same workflow, prompt, or path → one change in `Expected`, not one per row. **Done when:** `Clusters` lists those groups, or `none`. → 9 open clusters of 3+ entities.
- [x] **Step 6 — Anything Else:** (a) Commits since the previous report touching `.bkit/prompts`, `.bkit/workflows`, harvest, or friction writers → one-line verdict each. (b) Bounded ~30 min: a friction shape no step asks about. Class seen on 2 runs → propose a step. **Done when:** `Beyond the Steps` holds both passes, or `none`. → (a) baseline, no window; (b) 4 shapes recorded.

### 🔒 Gate 2: Probes Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** Once saved, immediately proceed to `Findings`.

- [x] **Steps complete:** every step `[x]`, or an explicit skip with evidence.
- [x] **Evidence:** every FIXED and SUPERSEDED cites `file:line` or a re-run search, not a closed-issue title.
- [x] **Read-only:** no ledger line, `harvest/` file, or product file changed. → `shasum -a 256 harvest/friction.jsonl` = `4d4b8e8d…` (= harvest run-2 output); consumer `.bkit/friction.jsonl` 16 lines, unchanged; no Bash call wrote a file (inline `node -` on stdin, `git show` / `git grep` reads).
- [x] **Gate 2 - Verified:** Every checkbox above independently verified and checked off.

## Findings

<!-- prettier-ignore -->
| Severity | Use |
| --- | --- |
| `CRITICAL` | Friction is data loss, a security hole, or a broken workflow with no workaround |
| `HIGH` | Still-open behaviour with a workaround. A truncated `key` hiding a second event |
| `MEDIUM` | Repeated cost. A cluster of three or more on one surface |
| `LOW` | Cosmetic, or a row whose surface is gone |

Scale per `.bkit/jsonl.md` § Severity. Carry the row's severity when it is already set and still accurate. Number `friction-{n}`.

<!-- prettier-ignore -->
| ID | Severity | Verdict | Location | Evidence | Expected |
| --- | --- | --- | --- | --- | --- |
| friction-1 | CRITICAL | OPEN | `.bkit/workflows/bkit-plan.md:962`, `:991`, `:992`, `:997-999`, `:1040`; `.bkit/workflows/bkit-design.md:837`, `:866`, `:868`, `:872-874`; `.bkit/workflows.md:235` | S:198 (`HIGH`), S:51: plan close blocked because a concurrent session left the main checkout dirty. Source read at `HEAD`, not reproduced: `git merge --squash -X ours "feat/{FID}"` has no exit check; the next commit `git commit --allow-empty -m "docs({FID}): plan DONE bkit [skip ci]"` has no pathspec (contradicts `.bkit/workflows.md:235` "Main-checkout staging"); then `git push origin dev`, worktree `--force` removal, `git branch -D` and `git push origin --delete "feat/{FID}"`; the canonical-plan check runs only afterwards (`:1040`). A squash refused by local changes therefore pushes a `plan DONE` commit carrying only bookkeeping rows (no plan) and deletes the local and remote branch refs; the plan commits survive only as unreachable objects until gc. Design checks the canonical at `:868` before cleanup, but that check passes on a re-run whose older canonical is already on `dev` | Both close blocks: stop before commit when the squash exits non-zero or the main checkout has tracked changes; commit only the squash's own file list; assert this run's canonical on `dev` before worktree removal and branch deletion. `CRITICAL` |
| friction-2 | HIGH | OPEN | `.bkit/workflows.md:584-605` (re-issue text `:602`), `:228` (`Failures` → Failure Path); gates "No PENDING placeholders remain", e.g. `.bkit/workflows/bkit-build.md:630`, `:755`, `.bkit/workflows/bkit-plan.md:388`; stub-first prompts, e.g. `.bkit/prompts/bkit-plan-generate.md:39`, `:42`, `.bkit/prompts/bkit-build-plan-verify.md:38` | 43 entities: subagent stops early (turn cap, context, mid-sentence end, API error) leaving the artifact missing, all-`PENDING`, or verdict `PENDING`. Incl. B:19/B:33/B:35/B:36 (`HIGH`), S:196 (`HIGH`), S:199 (`HIGH`), C:14 (`high`), C:15/C:16/S:201/R:67 (R = lost by `harvest-1`, recovered from snapshot), S:191/R:52, S:173, S:158 + S:163 (`RESOLVED`), 20 Fix-13 `TRIAGED` rows, B:16 + S:197 (complete-looking artifact, work unfinished), B:21/B:23/S:166/S:170 (no Write call), B:44. Rows report one working recovery: resume the same agent from its transcript. `git grep -n -i sendmessage HEAD -- .bkit/workflows/` → none. The only retry (`:602`) asks for the verdict header and says "the body is already in place", false for an all-`PENDING` stub. Raising caps (`bkit-ship-deferred-sweep` `maxTurns` 100, B:44 hit 50) does not add a route | One change in `.bkit/workflows.md` § Verdict Validation, carried into the 5 workflow caution blocks: a return whose Create file is missing, still holds `PENDING`, or is unchanged since dispatch is INCOMPLETE → continue the same agent once from its transcript with the artifact path restated (fresh dispatch only where the host has no continuation) → then **Failure Path**; drop the "body is already in place" wording. `HIGH` |
| friction-3 | HIGH | OPEN | `.bkit/workflows/bkit-build.md:1099-1100` (Step 13); same fixed names for `build-challenge.md`, `build-challenge-remediate-log.md`, `build-plan-verify-holistic.md`, `build-summary.md`; per-sub-plan and per-attempt names carry no run id | S:192 (`HIGH`): truncated `@bkit-build-challenge-tests` left the previous run's `Verdict: PASS` file, which passed every gate (exists, non-empty, under worktree, verdict parses). S:187 (3 agents, same). S:159 (`RESOLVED`): re-plan into an existing FID reuses every prior artifact. `git grep -n -i "stale\|newer\|mtime" HEAD -- .bkit/workflows/bkit-build.md` → lock lines only, no freshness check | Every artifact gate also asserts the file changed in this run (`git status --porcelain -- {path}` non-empty, or delete before dispatch). `HIGH` |
| friction-4 | HIGH | OPEN | `.bkit/workflows/bkit-debug.md:451-455` (`bkit_resolve_gate` + `eval "$TEST_SCOPE"`), `:466` (`TEST_EXIT` = 0 → PASS); consumer `consumer-a/package.json` `bkit:gate:static-unit` (`--filter='...[origin/dev]'`) | S:207/R:75 (`high`), S:179, S:180: debugging a failure already merged to `dev` → branch has no diff vs `origin/dev` → "No tasks were executed", exit 0 → PASS, Steps 4-7 skipped. bkit's default gate is the full suite (`.bkit/src/bkit-manifest.ts:453`); the empty run comes from the consumer's affected filter, but Step 3 still trusts the exit code alone | Step 3 records PASS only when tests ran; zero executed tests, or no diff vs `origin/dev`, → INCONCLUSIVE → Step 4. `HIGH` |
| friction-5 | HIGH | OPEN | `.bkit/workflows/bkit-debug.md:321-328`, `:361`; `.bkit/workflows/bkit-build.md:296-303`, `:333`; `.bkit/scripts/bkit-rebase-resolve.sh` `BKIT_REBASE_LEDGERS` (lockfile and ledgers only) | B:32/B:41 (`high`): content conflicts in `.bkit/src/bkit-manifest.test.ts`, `.bkit/workflows.md` and a modify/delete → sentinel → **Failure Path** before any test. S:175: one additive doc-line collision in `docs/architecture.md`. S:70: branch reused after its sub-plan was squash-merged. `@bkit-ship-conflict-resolve` exists, used only by ship (`.bkit/workflows/bkit-ship.md:608`) | Build and debug Step 2 send conflicts `bkit_rebase_resolve` refuses to `@bkit-ship-conflict-resolve` before writing the sentinel. `HIGH` |
| friction-6 | HIGH | NEEDS HARVEST | consumer-a `.bkit/friction.jsonl` (16 lines); `tmp/harvest-run/pre/consumer-a-friction.jsonl` (8 recovered rows); bkit `.bkit/friction.jsonl` (44 lines); `.bkit/src/bkit-harvest.ts:109`; `.agents/docs.md:66` | 12 consumer-only rows (C:1-2, C:5-14) have an unknown or missing `kind` and cannot be banked (`harvest-4`); C:3, C:4, C:15, C:16 are fold losers of stored keys. The 8 `harvest-1` rows exist only in consumer-a `HEAD:.bkit/friction.jsonl` (78 lines at `27f546f0a`; working file pruned, uncommitted) and `tmp/` (gitignored, `.gitignore:34`). bkit's own 44 rows are off the harvest path (consumers only), though `.agents/docs.md:66` says "Drained by `bkit harvest`" | Restore the 8 rows per `harvest-1` before consumer-a commits its pruned file; run #343 after `harvest-1` and `harvest-4` land; decide whether bkit's own queue is harvested or triaged in place. `HIGH` |
| friction-7 | MEDIUM | OPEN | 46 dispatch sites with `Switch into working directory cd "{WORKTREE_PATH}"` (`git grep -c` → build 15, debug 5, design 10, plan 11, ship 5) and relative Read / Create paths, e.g. `.bkit/workflows/bkit-build.md:1355-1357`; 20 prompts have no `Bash` tool, incl. `bkit-build-summary`, `bkit-design-summary`, `bkit-plan-summary`, `bkit-design-brainstorm-ideate-1`..`3`, `bkit-plan-scope-check-1`, `-2` | 9 entities: S:11, S:31, S:37, S:43, S:49 (Fix 20), C:1, C:2, B:22, S:202/R:68 (2026-08-12, after the July detection change). Detection holds (`.bkit/workflows.md:234`; `.bkit/workflows/bkit-build.md:1358`; `.bkit/workflows/bkit-plan.md:959-960`; `.bkit/workflows/bkit-design.md:834-835`); prevention does not. S:202: the summary agent has Read / Write / Edit only, so the `cd` sentence cannot be executed | Substitute absolute `{WORKTREE_PATH}/…` into every Read / Create / Update path at dispatch; keep the `cd` sentence only for agents with `Bash`. `MEDIUM` |
| friction-8 | MEDIUM | OPEN | `.bkit/workflows/bkit-ship.md:1078-1086` (Step 9; runs only when `state` = MERGED, `:1052`) | S:152 (Fix 18), B:24, B:25, S:178/R:29: local `dev` ahead with non-`[skip ci]` commits → `exit 1` after the PR has merged; recovery is a manual reconcile and re-run | Run the same ahead-of-`origin/dev` check in ship Step 1, before any merge. `MEDIUM` |
| friction-9 | MEDIUM | OPEN | `.bkit/workflows/bkit-build.md:52`, `:654`, `:896`, `:900` (`git diff origin/dev..HEAD`); Branch Sync merges `docs/` drift only (`:419`) | S:16, S:19, S:21 (Fix 19): `dev` advanced mid-build → the two-dot diff shows dev's new commits as reversions to verify and challenge agents (S:16: ~21 unrelated files) | Use three-dot `origin/dev...HEAD` in the Large Diff Guard and every Read line. `MEDIUM` |
| friction-10 | MEDIUM | OPEN | `.bkit/workflows/bkit-build.md:319`, `.bkit/workflows/bkit-debug.md:345`, `.bkit/workflows/bkit-design.md:257`, `.bkit/workflows/bkit-plan.md:264`, `.bkit/workflows/bkit-ship.md:439` (literal `.env .env.local apps/web/.env.preview apps/web/.env.production`) | S:194 (`apps/web/.env.local` not copied), S:186, S:189 (`apps/mobile/.env.local` not copied, so `eas` is unauthenticated in every worktree). Shipped workflows hard-code one consumer's stack paths | One shared copy list derived from the consumer (its `.envrc` `dotenv_if_exists` lines or a `package.json` `bkit` key), used by all 5 Step 2 blocks. `MEDIUM` |
| friction-11 | MEDIUM | OPEN | `.bkit/prompts/bkit-build-install-skills.md:41` (`npx skills add <owner/repo> -y`; "Cap at 10" is prose) | S:59 (33-skill pack), S:67 (82-skill catalog), S:168 (~170 skills; row: "omitted the @skill suffix on the source arg"). Prune side fixed (friction-24) | Install one named skill per gap (the `<owner/repo>@<skill>` form the row names) and assert the installed count afterwards. `MEDIUM` |
| friction-12 | MEDIUM | OPEN | `.bkit/workflows/bkit-ship.md:875` before the append at `:877`; `.bkit/scripts/bkit-counter-bus.sh:175-182` | B:42: `MERGE_ATTEMPT=$(counter_current "$STATUS" ship ship-merge-pr) \|\| exit 2` runs before the `ship-merge-pr` row exists; `counter_current` returns 2 on a count of 0, so a first attempt exits 2 after a successful merge and the status row is never written | Reuse `MERGE_ATTEMPT` from `counter_next` (`:793`) or move the call after the append. `MEDIUM` |
| friction-13 | MEDIUM | OPEN | `.bkit/workflows/bkit-design.md:265`, `.bkit/workflows/bkit-plan.md:272`, `.bkit/workflows/bkit-build.md:327` | S:206: cloud runtime (`RUNTIME_WORKTREES` = false) starting on `dev` exits 1 with no route to `feat/{FID}`. Ship switches first (`.bkit/workflows/bkit-ship.md:447`), so B:43 is fixed there (friction-31) | Same `git switch` to the feature branch before the `dev` refusal in design, plan and build. `MEDIUM` |
| friction-14 | MEDIUM | OPEN | `.bkit/workflows/bkit-plan.md:409`, `.bkit/workflows/bkit-design.md:353`, `.bkit/workflows/bkit-debug.md:706` | B:13/B:14/B:17, C:5: search returned 0 for every query while `gh search issues` found 9. Query is now one natural-language sentence (`.bkit/workflows/bkit-plan.md:401`), but 0 hits still writes `None.`; no control query | On 0 hits run a control query that must match; control also 0 → `Search unavailable.`. `MEDIUM` |
| friction-15 | MEDIUM | OPEN | `.bkit/workflows/bkit-build.md:1544`, `:1566` (suppressor check reads `git log -1` only), `:1572-1573` (re-trigger) | S:167/C:3, S:172/C:4: an early worktree commit carried a `[skip ci]`-class token; later clean-HEAD pushes dispatched no runs (tracked #384). `git grep -n -i "buried\|origin/dev\.\.HEAD.*skip" HEAD -- .bkit/workflows/bkit-build.md .bkit/workflows/bkit-debug.md .bkit/scripts/` → none | Before the first push, scan `git log origin/dev..HEAD --format=%B` for suppressor tokens. `MEDIUM` |
| friction-16 | MEDIUM | OPEN | `.bkit/prompts/bkit-plan-generate.md:54`, `:62` (appends to `docs/decisions.jsonl`, `docs/deferrals.jsonl`); its frontmatter has no `Bash` (same for `bkit-design-generate`); `.bkit/jsonl.md:23-24` | B:37: a plan-phase subagent wrote round future `ts` values (1787745600000, 1787745601000); the ledger-integrity test blocked the push. A Bash-less writer cannot run the mandated `jq … now` idiom. `git grep -c "now\*1000" HEAD -- .bkit/prompts/` → none | Ledger-writing prompts get `Bash`, or return rows for the orchestrator to append with `jq` `now`. `MEDIUM` |
| friction-17 | MEDIUM | OPEN | `.bkit/workflows/bkit-build.md:313-314`; `.bkit/workflows/bkit-ship.md:430-431` | B:30/B:39: `git fetch origin dev` is unchecked, then `git worktree add … -b "feat/{FID}" origin/dev` branched from a stale `refs/remotes/origin/dev` (6 commits behind); unrelated plan files showed as deletions at verify | Stop on fetch failure and assert `origin/dev` equals `git ls-remote origin dev` before `worktree add`. `MEDIUM` |
| friction-18 | MEDIUM | OPEN | `.bkit/workflows/bkit-build.md:336-337`, `:584` (loops every `{FID}-plan-*.md`) | S:26: sub-plan 2 declared it starts only after sub-plan 1 is merged to `dev`; build loops both into one PR. S:161 (`RESOLVED`): the loop conflicts with the complexity-split plan | Stop the loop at the first sub-plan whose declared prerequisite is unmet. `MEDIUM` |
| friction-19 | MEDIUM | OPEN | `.bkit/workflows/bkit-ship.md:186-188`; `.bkit/templates/.husky/pre-push:34-37` | S:183: Failure Path commits `chore({FID}): ship FAILED bkit [skip ci]` and pushes `$TARGET`; the shipped pre-push hook rejects a suppressor HEAD while a PR is open. At `HEAD` `$TARGET` = `dev` when `RUNTIME_DEVPUSHES` = true, so only the `RUNTIME_DEVPUSHES` = false path still collides | On the branch-push path, commit without a suppressor token or skip the push and rely on the verbatim comment. `MEDIUM` |
| friction-20 | MEDIUM | OTHER | Friction writers: `.bkit/workflows/bkit-build.md:19` (model appends "in `.bkit/jsonl.md` format", same line in the other 4 caution blocks); `.bkit/jsonl.md:69`, `:138-146` | 22 entities lack `severity`, 27 lack `category`; non-enum `status` `RESOLVED` x6 (S:158-163) and `open`; severity `WARN` and lowercase values; unknown `kind` (`subagent-wrong-cwd`, `tool-failure`, `agent-rework`, `template-bug`, `concurrent-workflow`, `ignore-earlier-marker-stripped`); prose in `issue` / `workaround` / `note` / `detail`; 22 non-numeric `ts`. `RESOLVED` rows S:158, S:159, S:163 describe behaviour still open (friction-2, friction-3) | Friction appends pass the envelope validation `.bkit/src/bkit-telemetry.ts` applies, rejecting non-enum `kind` / `status` / `severity` and non-numeric `ts` at write time. `MEDIUM` |
| friction-21 | LOW | OPEN | `.bkit/workflows/bkit-ship.md:122-123` (handover Create, non-empty assert only); ship Gate 7 has the check at `:974` | S:184: `ship-handover.md` held the full document plus a second all-`PENDING` copy of every heading | Add "No PENDING placeholders remain" to the Failure Path handover assert. `LOW` |
| friction-22 | LOW | DUPLICATE | `harvest/friction.jsonl:93` and `:64` (`:69` distinct) | `friction-plan-step-11-close-workflow-stray-guard-rejects-protocol-ma` (68-char truncated slug, `repo` `consumer-a`, no hash) is the same event as `…-protocol-ma-c710e94` (`example-org/consumer-a`). `…-protocol-ma-102b388` is a second event kept apart only by its hash suffix (104 store keys carry `-[0-9a-f]{7}`). Both copies `CLOSED` | No code change; the `key` is lossy without its hash suffix; repo-spelling cause is `harvest-6`. `LOW` |
| friction-23 | LOW | FIXED | `.bkit/workflows/bkit-ship.md:28`; Step 10 `:1135-1202` | S:177/R:25 (`HIGH`, blanket `git add -- docs/` swept a concurrent session). `:28`: path-scoped staging via `bkit-book-commit.sh`, never `-A` or blanket `docs/`, one commit per run; Step 10 has no `git add` or `git commit` (`sed -n 1135,1202p` + `grep "git add\|git commit"` → none) | No code change. |
| friction-24 | LOW | FIXED | `.bkit/workflows/bkit-ship.md:1229-1230`, `:1234` | S:32, S:68 (Fix 21): prune reconciles dirs and `skills-lock.json` keys and matches with word boundaries. C:11 (BSD grep false negative) not reproduced: `/usr/bin/grep` 2.6.0-FreeBSD matches `pnpm` in consumer-a `.agents/skills.md` and in a `vitest, pnpm` table cell (rc 0) | No code change. |
| friction-25 | LOW | FIXED | `.bkit/workflows/bkit-plan.md:430`, `:452`; `.bkit/src/bkit-slash-arg-expansion.test.ts` | B:34 (`HIGH`), S:165: slash-command expansion replaced `$0` in plan's awk. Now `$(0)`; `git grep -c -E '[$][0-9]' HEAD -- .bkit/workflows/` → rc 1, re-run `git grep -F '$0'` → none; 9 `$(N)` forms | No code change. |
| friction-26 | LOW | FIXED | `.bkit/.env.example:51`; `.bkit/workflows/bkit-ship.md:495`; `.bkit/workflows.md:233`; `.bkit/scripts/bkit-ship-gate.sh:133-137` | 10 entities (Fix 23): S:2 (merged with failing CI), S:10, S:12, S:13, S:17, S:35, S:46, S:75, S:76, S:81 (last 3 title-only). The MCP PAT is `BKIT_GH_TOKEN`, so shell `gh` keeps its keyring login; an unreadable PR head or check query stops the merge; the capstone is read at the current PR head | No code change. |
| friction-27 | LOW | FIXED | `.bkit/workflows/bkit-plan.md:963`, `:1011`; `.bkit/workflows/bkit-design.md:838`, `:886` | S:50, S:54, S:65, S:69, S:87 (Fix 11), B:9: STRAY allowlist now `^docs/plans/`, `^docs/roadmap\.md$`, `^docs/[^/]+\.jsonl$`, `^\.bkit/[^/]+\.jsonl$`; `docs/pending.md` and `docs/decisions.md` unreferenced (`git grep "pending\.md\|decisions\.md" HEAD -- .bkit/workflows/ .bkit/prompts/` → none, re-run) | No code change. |
| friction-28 | LOW | FIXED | `.bkit/workflows/bkit-ship.md:1364` | S:45, S:72, S:77, S:89 (Fix 17): a live-tier failure is reported as "post-merge canary, not a merge gate" | No code change. |
| friction-29 | LOW | FIXED | `.bkit/workflows/bkit-build.md:195`, `:215`; `.bkit/workflows/bkit-debug.md:180`, `:200` | S:18, S:23 (Fix 16): per-FID lock acquire is `(set -C; printf … > "$LOCK")` | No code change. |
| friction-30 | LOW | FIXED | `.bkit/prompts/bkit-plan-scope-check-1.md:50`, `.bkit/prompts/bkit-plan-scope-check-2.md:50` | S:8, S:148 (Fix 24): "No task scopes edits inside `bkit:start` / `bkit:end` blocks". S:148 (design close) is title-only; the check covers plan scope | No code change. |
| friction-31 | LOW | FIXED | `.bkit/workflows/bkit-ship.md:1360`, `:447`; `.bkit/workflows/bkit-build.md:770`, `:1556-1557`; `.bkit/workflows/bkit-plan.md:991`, `:1040`; `.bkit/workflows/bkit-debug.md:469`, `:1053`; `.bkit/workflows/bkit-design.md:136-300`, `:874`; `.bkit/templates/slop-scan.config.json:9`; `.agents/rules.md:44` | 11 single-row fixes: S:153 exact capstone name `bkit-tests-check`; B:43 ship adopt mode switches to the feature branch; B:20 Step 8 guard admits CONCERNS; C:9 `GH_ALL_ERRORED` set outside `$(...)`; S:181 + S:204 canonical plan committed and checked (side effect in friction-1); S:205 Step 3 status row not committed, so Gate 8 holds; S:47 no `git add` / `git commit` before the design worktree; S:48 design close deletes remote `feat/{FID}`; S:42 slop ignores `**/.agents/skills/**`; B:27 scratch goes to repo `tmp/` | No code change. |
| friction-32 | LOW | SUPERSEDED | `.bkit/workflows/bkit-ship.md:398`, `:528-530`, `:577-583`, `:604-612` | S:193 (`HIGH`), S:176/R:24, S:27, S:40: Step 2 no longer rebases ("NO rebase — Path A") and writes `ship-regression-guard` with a fixed `PASS`, no lane comparison; Step 3 picks Path A or B by `merge-base --is-ancestor`; textual conflicts go to `@bkit-ship-conflict-resolve` (B2), which pushes a fresh head | No code change. |
| friction-33 | LOW | SUPERSEDED | `.bkit/workflows/bkit-plan.md:234`, `.bkit/workflows/bkit-design.md:227`, `.bkit/workflows/bkit-build.md:283` | S:24, S:41, S:53 (Fix 18): Step 1 divergence guards are gone; "primary checkout dirty / unpushed → NOT blocker". `git grep -n -i "diverg\|ahead"` over plan / debug / design → none; re-run with `"unpushed\|rev-list --count"` → only the two "NOT blocker" lines. Ship Step 9 is friction-8 | No code change. |
| friction-34 | LOW | SUPERSEDED | `.bkit/workflows/bkit-debug.md:451-455` | S:203, S:208: Step 3 now runs `pnpm {bkit:gate:*}` via `bkit_resolve_gate`; `git grep -i direnv HEAD -- .bkit/workflows/ .bkit/scripts/` → none (re-run over `.bkit/` → env docs and install code only) | No code change. |
| friction-35 | LOW | SUPERSEDED | `.bkit/jsonl.md:96`; `.bkit/templates/docs/templates/bkit-plan.md:3`, `:451`; `.bkit/workflows/bkit-build.md:324-328`; `.bkit/workflows.md:151`; `.bkit/src/bkit-ship-worktree-ownership.integration.test.ts:39` | S:34 (DE / KN counter collision) → content-slug keys; S:63 (Fix 15, plan body emitted twice) → one body, one managed block (`grep -n -i "mirror\|compressed"` on the template → unrelated lines `:71`, `:193`, `:337` only); S:149 (session branch vs `feat/{FID}`) → adopt mode; R:74 (HTML `bkit:ignore-earlier` comment stripped by GitHub) → h6 heading marker; B:26 (`ship-worktree-ownership.bats` in the real repo) → integration test on `mkdtempSync` | No code change. |
| friction-36 | LOW | OTHER | Host, provider, or consumer surfaces; no `.bkit/` source | 19 entities. Provider: S:52, S:185 (API 529), S:209 (safeguard). Host: C:6-8 (Task tool timeout), S:22 (Write before Read), B:28 (`grep` is ugrep and skips ignored `.worktrees/`), B:7 (opencode not installed). Consumer: S:174 (local Inngest infra), S:188 (`eas` stub `app.json`), S:190 (spend allowance in build input), S:210 (ux-audit is not a bkit workflow), S:164, S:182 (consumer slop config), S:162 (orchestrator-made CI cycle). As designed: B:29/B:38 (verify caught a false green), C:10 (human-authorised overlap), C:11 (friction-24) | Close as not bkit's; B:28 → `docs/knowledge.jsonl`; recovery after provider deaths rides friction-2. `LOW` |

Empty and clean → one row `None`.

## Report

### Summary

- **Sources** (row labels in `Findings`): `S:n` = `harvest/friction.jsonl` line n; `C:n` = consumer-a `.bkit/friction.jsonl` line n (unharvested); `R:n` = lost by `harvest-1`, recovered from snapshot `tmp/harvest-run/pre/consumer-a-friction.jsonl` line n; `B:n` = bkit `.bkit/friction.jsonl` line n (never harvested). consumer-b: 0 rows.
- **Findings by severity:** `CRITICAL` 1, `HIGH` 5, `MEDIUM` 14, `LOW` 16 (36 rows).
- **Findings by verdict:** OPEN 19, NEEDS HARVEST 1, OTHER 2, DUPLICATE 1, FIXED 9, SUPERSEDED 4.
- **Open entities by verdict** (166 with `status` != `CLOSED`): OPEN 88, FIXED 40, SUPERSEDED 14, OTHER 19, seen only 5. 40 + 14 + 19 = 73 entities are still open in the ledger but no longer true at `HEAD` or not bkit's.
- **Partial pass:** 169 of 255 entities verified (161 open + 8 closed); 278 rows seen.
- **Top open:** friction-1 (plan close can push a `DONE` commit with no plan and delete `feat/{FID}` after a failed squash; source read, not reproduced), friction-2 (43 entities: no route for a subagent that stops early), friction-3 (previous run's artifact passes the gate), friction-4 (debug PASS with zero tests run), friction-5 (any non-ledger rebase conflict ends build / debug before work starts).

### Previous Run

Baseline. No `docs/audits/**/friction*.md` before this run. July 2026 triage passes were posted as comments on #99 (not read; their "Fix N" tags survive in row `references` and were re-verified at `HEAD`, not trusted).

### Trend

Baseline, no series yet.

<!-- prettier-ignore -->
| Measure | Value |
| --- | --- |
| Rows seen | 278: `S` 210, `C` 16, `R` 8, `B` 44 |
| Entities (fold by `key`; keyless rows one each) | 255 |
| `CLOSED` | 89 |
| Open (`status` != `CLOSED`, `.bkit/jsonl.md:252`) | 166: `TRIAGED` 82, `OPEN` 51, `open` 1, `RESOLVED` 6, none 26 |
| Open by row `severity` | `HIGH` 11, `MEDIUM` 120, `LOW` 13, `WARN` 1, missing 21 |
| Missing `severity` / `category` (all entities) | 22 / 27 |
| Non-numeric `ts` | 22 rows: `S` ISO string 10, `C` ISO string 8, `C` `at` only 3, `R` `at` only 1; all parsed, ordered by parsed time |
| Oldest open | first seen 2026-05-24 (137 d), S:2 `friction-ship-step-5-merged-pr-with-failing-ci-run` (FIXED, friction-26) |
| Open age | median 84 d; 70 entities older than 90 d |
| Newest row | 2026-09-10 |
| Entities verified / seen | 169 / 255 (rows 278) |
| Open clusters of 3+ entities | 9 |
| Keys with byte-different `summary` / `description` | 12. 8 are status rewrites of one event (S:1/B:1, S:167/C:3, S:172/C:4, S:176/R:24, S:177/R:25, B:10/B:18, B:12/B:15, B:13/B:14/B:17); 4 are same-class recurrences (S:191/R:52, S:202/R:68, B:19/B:33/B:35/B:36, and `build-plan-execute-subagent-ends-turn-mid-tasklist-pending-verdict`, whose winner R:67 is a `build-summary` event under a `build-plan-execute` key). Truncated-key duplicate: friction-22 |
| Committed vs working store | `HEAD:harvest/friction.jsonl` 257 lines / 156 keys vs working 210 / 210; folded `status` / `severity` per key identical |

### Clusters

<!-- prettier-ignore -->
| Cluster | Entities | Surface | One change |
| --- | --- | --- | --- |
| friction-2 Subagent stops early | 43 | `.bkit/workflows.md` § Verdict Validation (`:584-605`) + 5 workflow caution blocks | INCOMPLETE return class → continue same agent once → **Failure Path** |
| friction-7 Artifact lands in main checkout | 9 | Dispatch Context / Read / Create lines in all 5 workflows (46 sites) | Absolute `{WORKTREE_PATH}/…` paths at dispatch; `cd` sentence only for agents with `Bash` |
| friction-8 Ship dev-ahead guard fires after merge | 4 | `.bkit/workflows/bkit-ship.md:1078-1086` | Move the check to ship Step 1 |
| friction-3 Previous run's artifact passes gate | 3 | `.bkit/workflows/bkit-build.md` artifact gates (e.g. `:1099-1100`) | Assert the artifact changed in this run |
| friction-4 Debug PASS with zero tests | 3 | `.bkit/workflows/bkit-debug.md:451-466` | Zero tests or no diff → INCONCLUSIVE |
| friction-5 Rebase conflict ends run | 3 | Step 2 of build / debug (`bkit-build.md:296-303`, `bkit-debug.md:321-328`) | Route refused conflicts to `@bkit-ship-conflict-resolve` |
| friction-9 Two-dot diff while `dev` moves | 3 | `.bkit/workflows/bkit-build.md:52`, `:654`, `:896`, `:900` | `origin/dev...HEAD` |
| friction-10 Worktree env copy list | 3 | Step 2 of all 5 workflows | One copy list derived from the consumer |
| friction-11 install-skills bulk install | 3 | `.bkit/prompts/bkit-build-install-skills.md:41` | Install by named skill, assert count |

Step 2 worktree setup is one surface across friction-5, friction-10, friction-13 and friction-17 (8 entities): the same block is copied into 5 workflows (env loop at `bkit-build.md:319`, `bkit-debug.md:345`, `bkit-design.md:257`, `bkit-plan.md:264`, `bkit-ship.md:439`). One shared Step 2 helper in `.bkit/scripts/` would carry the fetch assert, adopt-mode switch, env copy, and conflict routing once. friction-1 (2 entities) is below the 3-entity threshold but `CRITICAL`.

### Checked

- All 278 rows parsed (0 JSON errors); fold by `key`, last wins by parsed `ts`; open = `status` != `CLOSED`.
- The 8 `harvest-1` rows: snapshot rows absent by content (repo field ignored, keys sorted) from both store and consumer = 8, matching the orchestrator's key list; consumer-a `HEAD` (`27f546f0a`) still holds them (78 lines); working file pruned, uncommitted.
- Committed vs working store folded per key: 0 `status` / `severity` differences.
- Every open entity mapped to a cluster; 161 classified with `HEAD` `file:line` or a re-run search (`Findings`).
- Re-run empty searches: literal `$0` and `[$][0-9]` in `.bkit/workflows/`; `direnv` in `.bkit/workflows/` + `.bkit/scripts/`, then all of `.bkit/`; `pending\.md` / `decisions\.md` in workflows + prompts; `sendmessage` in workflows; `now\*1000` in prompts.
- Prompt frontmatter `tools:` at `HEAD` for all 48 prompts (20 without `Bash`); `maxTurns` for all 48.
- Consumer gate scripts (read-only): consumer-a `package.json` `bkit:gate:*`.
- BSD grep claim (C:11) run with `/usr/bin/grep` 2.6.0-FreeBSD on consumer-a `.agents/skills.md`: match.
- Closed spot-check, 6 of 89 `CLOSED`, all consistent at `HEAD`: B:1 (shipped `.bkit/templates/.husky/pre-commit` runs only `pnpm bkit:gate:format`; the `*.worktrees/*` guard was consumer-owned); S:96 (vale `write-good` copied, `.bkit/workflows/bkit-build.md:322`); S:108 (`docs/pending.md` retired, search above); S:120 (drift, friction-30 surface); S:132 (`CONCERNS` is a valid verdict, `.bkit/workflows.md:584-605`); S:62 (consumer slop placeholder, consumer-scoped). Plus the S:64 / S:93 pair (friction-22).
- Read-only: `harvest/friction.jsonl` sha256 `4d4b8e8d…` = harvest run-2 output; consumer queue 16 lines unchanged.

### Not Checked

- 81 `CLOSED` entities not re-verified (sample above only).
- 5 open entities seen, no verdict: S:28 (challenge whack-a-mole, 1-pass remediate cap), S:57 (plan-summary misread a locked decision), S:61 (cross-sub-plan mock regression), S:73 (CRITICALs classed as `BLOCKED`; title only), S:160 (`RESOLVED`, plan-summary four round trips). Note: `.bkit/prompts/bkit-build-challenge-remediate.md:45` sends every `architectural` finding to `BLOCKED`, relevant to S:73 / S:171.
- Title-only rows verified at cluster level only: S:75, S:76, S:81, S:148.
- friction-1 not reproduced (source read only); friction-15 mechanism taken from the row's own root-cause, not re-run.
- Tracker state of #384 and other referenced issues not queried; #99 July comments not read.
- Consumer-side hooks and scripts beyond `package.json` `bkit:gate:*` not read.
- Host mirrors (`.claude/`, `.cursor/`, `.opencode/`) not read; source only.

### Beyond the Steps

- **(a) Commits:** baseline, no prior report, so no window. Context: 92 commits since the last #99 triage commit `67e427b6` (2026-07-16) touch `.bkit/prompts`, `.bkit/workflows`, `bkit-harvest.ts`, `bkit-telemetry.ts` or `harvest/`; the only harvest-path change is `c692c65b` (consumers read from `docs/consumers.md`) → bkit's own queue stays off the harvest path (friction-6).
- **(b) Shapes no step asks about** (first sighting; no step proposed from them yet):
  1. In-run `RESOLVED` / lowercase `open` statuses and non-enum `kind` / `severity` from free-form friction appends (friction-20). Three `RESOLVED` rows describe behaviour still open at `HEAD`.
  2. A prompt told to follow a ledger idiom it has no tool for: Bash-less writers vs `.bkit/jsonl.md:23-24` (friction-16); Bash-less agents told to `cd` (friction-7).
  3. bkit text contradicting bkit code: `.bkit/workflows.md:235` vs plan / design close commits (friction-1); `.agents/docs.md:66` vs harvest reading consumers only (friction-6); `docs/knowledge.jsonl:1`, `:8` (`kn-core-1`, `kn-core-8`) name `GH_BKIT_TOKEN`, `.bkit/.env.example:51` ships `BKIT_GH_TOKEN` (knowledge ledger → `bkit-audit-documentation`).
  4. Same-key recurrences across different subagents and steps: R:67 (a `build-summary` stop) wins the fold under a `build-plan-execute` key, so last-wins readers see the wrong step.

### Process Improvements

**Universal** (proposed changes to the #99 procedure; template is the issue body, not edited by this run):

- Step 2 — Fold: define a collision as one `key` whose rows differ in `step`, `subagent` or defect class. Same-key status rewrites and recurrences are the documented update idiom (`.bkit/jsonl.md:237`), not collisions.
- Step 2 — Fold: count any `status` other than `CLOSED` as open (`.bkit/jsonl.md:252`) and list non-enum values (e.g. `RESOLVED`) separately.
- Pre-Flight — Conditional: add the bkit repo's own `.bkit/friction.jsonl` (not in `docs/consumers.md`, so never harvested), and any recovery snapshot a harvest audit names, each with its own source label.
- Step 3 — Source: when the working tree is dirty, read sources with `git show HEAD:` / `git grep … HEAD --` so verdicts anchor to `HEAD`.

**Project:** none applied. The template has no `## Project Instructions` and lives in issue #99, which this run does not edit. Proposed lines for the caller to add:

- Step 2 — Fold: fold with an inline `node -` script over the four sources; find harvest-lost rows by content (drop `repo`, sort keys) against the store and the consumer; compare per-key status with `git show HEAD:harvest/friction.jsonl`.
- Step 3 — Source: `git grep -n PATTERN HEAD -- .bkit/workflows/ .bkit/prompts/ .bkit/scripts/`; Bash-less prompts from each prompt's frontmatter `tools:`; BSD grep checks via `/usr/bin/grep` (session `grep` is a shell function).
- Step 4 — Classify: "Fix N" in row `references` are earlier #99 triage dispositions; treat as hints, re-verify.
- Tool gaps: large Bash / Read output is persisted to a file — read it back in parts; quote `"=="` in zsh `echo`.

### 🔒 Gate 3: Report Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** Once saved, STOP.

- [x] **No placeholders:** Findings table and every `Report` section have no `PENDING`. → `grep -nE "^PENDING$|\| PENDING \|"` → none; remaining `PENDING` tokens quote row text.
- [x] **Summary:** names count per severity and count per verdict.
- [x] **Series:** row count and open-cluster count beside the previous report, or marked baseline. → baseline; 278 rows, 9 open clusters.
- [x] **Writes:** only this report. `harvest/` and ledgers unchanged. → sha256 unchanged: `harvest/friction.jsonl` `4d4b8e8d…`, bkit `.bkit/friction.jsonl` `2c74275c…`, consumer-a `.bkit/friction.jsonl` `12318994…`. `docs/decisions.jsonl` / `docs/failures.jsonl` show ` M` from other agents in the shared tree; this run made no write to them (every Write / Edit targeted this report; Bash calls were reads).
- [x] **Process Improvements:** proposed step changes only. `none` if empty.
- [x] **Gate 3 - Verified:** Every checkbox above independently verified and checked off.
