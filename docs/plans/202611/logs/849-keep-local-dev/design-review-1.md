Verdict: CONCERNS
Spike: true

<!-- verdict:end -->

# Design Review

Lens: Buildability — prior art, stack feasibility, library fit, integration risk.

## Prior Art Search

Repo searches used the language server (`find_referencing_symbols` on `pushToDev`) and text search across `.bkit/core/engine/**/*.ts`, `.bkit/core/workflows/`, `.bkit/core/prompts/` and `docs/capabilities.md`. Absence claims were re-checked by text search: no non-test use of `update-ref`, `dev-backup`, `cherry` or `patch-id` in the engine, which confirms the design's search notes.

<!-- prettier-ignore -->
| Capability | What exists | Fit | Recommendation |
| --- | --- | --- | --- |
| Safe automatic move of local `dev` | `fastForwardDev` (`branches.ts:2863`), mature, called by `landVerb` (`:2996`) and `syncDevVerb` (`:2461`), covered by `branches.test.ts:3179-3708` | Covers the move with `merge --ff-only` on the main checkout or a non-forced `fetch . sha:refs/heads/dev` elsewhere. Gaps: targets the landed SHA rather than the fetched tip, collapses ahead / divergent / git-refused into `skipped`, prints `git pull --rebase` advice. Since the "protect branches checked out in all worktrees" change in git, `fetch` refuses a branch checked out in any worktree, so the occupied case is a git refusal, as the design says. | `EXTEND-EXISTING`: covers well over 80%. The gap is the typed result, the fetched-tip target and the reason classification. |
| Post-move frozen install | `install` (`branches.ts:2469`) | Used as is. | `USE-AS-IS` |
| Dev fetch with ref-lock race | `fetchDev`, `devRefRace`, `landBackoffMs`, `TIMEOUTS.LAND_ATTEMPTS` (`land.ts:43-71`) | Exactly the retry the sync needs. | `USE-AS-IS` |
| Throwaway build, gate, push | `pushToDev` (`land.ts:222`), `checkLanding` (`land.ts:188`), `withoutHooks` (`land.ts:104`) | Covers isolation, validation and hook-off push. Gaps: no stop-before-push mode; `checkLanding` throws on gate failure rather than returning an exit; it picks `bkit:gate:min` when the diff is docs-only. `pushToDev` needs a FID-shaped `dir` (`landDir` validates against `SAFE_FID`), so recovery needs a fixed id such as `sync-dev`. | `EXTEND-EXISTING`: `push: false`, forced full gate, and a gate result returned rather than thrown. |
| Replay chosen commits | `replayBuild` (`branches.ts:1150`) | Covers cherry-picking oldest first and conflict reporting. It always passes `--allow-empty --keep-redundant-commits`. Git's `cherry-pick --empty=drop` drops commits that become empty, but its docs say commits that were empty from the start "will still cause the cherry-pick to fail unless one of `--empty=keep` or `--allow-empty` are specified". Merge commits fail without `-m`. | `EXTEND-EXISTING`: add the drop-empty mode, and spell out how it treats commits that were empty from the start and merge commits (see CRITICAL). |
| Deepest gate | `requiredPushGate` (`ci/push-gate.ts:37`) returns `bkit:gate:static-unit-integration`, else `bkit:gate:static-unit`. `resolveGate` (`workflow/tests.ts:104`) takes the candidates its caller passes, so `bkit tests run` has no fixed "deepest" of its own. Debug Step 3 passes the e2e and live gates too. | The push gate is the right choice: `.bkit/workflows.md:1540` says the e2e and live gates need a deployed boundary and run only in debug Step 3. The design's statement that this is "the same one `bkit tests run` picks" is inaccurate (see OPTIONAL). | `USE-AS-IS` |
| "Already on GitHub" proof | `notOnDev` (`branches.ts:2903`), `localDevCopies` (`:2927`); git built-ins `git cherry`, `git patch-id`, `diff-tree --stdin`, `cat-file --batch-check` | `notOnDev` holds the right per-file rule (blob equality, `.jsonl` added-line rule) but is branch-scoped and skips deletions (`--diff-filter=d`). `git cherry` supplies patch-id matching with no custom hashing. Ecosystem tools that detect squash merges use the same two git primitives, so a third-party library adds nothing. | `EXTEND-EXISTING`: generalise the rule to "one commit's paths compared with `origin/dev`", and add deletion handling. |
| Read-only classifier verb (`dev-status`) | `inheritedDevCommits` (`worktrees.ts:231`) lists the unpushed `dev` commits a branch carries, with no publish proof. `sync-dev` makes changes. | The candidate covers well under 80% (listing only). The design gives a functional reason for `NEW`, not a cleaner fresh start, and builds the verb on the extended classifier. | `BUILD-CUSTOM` (thin verb over the shared classifier). No reuse caveat. |
| Staged reconcile (`dev-reconcile`) | `pushOwnCommits` (`branches.ts:1175`) replays and pushes immediately; nothing splits prepare, approval and push. | Close but different. The design composes `replayBuild`, `pushToDev` and `withoutHooks` rather than forking them. | `BUILD-CUSTOM` on top of the `EXTEND` rows. No reuse caveat. |
| Recovery prompt | 8 `bkit-utility-*` prompts (`.bkit/core/prompts/`), catalogued in `.bkit/prompts.md:412` | Shape fits: a subagent that runs verbs and returns. | `ADAPT` the existing utility shape. |
| Guard that each dev push reports sync | `docs/capabilities.md` register (marker-count budgets, CI-guarded). No test pins `pushToDev` callers. | The register guards "one implementation" by counting markers. It does not guard "every caller then calls X". A custom test is justified. | `BUILD-CUSTOM`, but its shape needs fixing (see CRITICAL). |
| Step-key retirement | Decision `ship-close-removes-worktree-after-landing` (`docs/decisions.jsonl:262`). `SHIP_STEP_ORDER` (`status-holes.ts:45`) is described as "the frozen schema", mirrored in `ship-invariants.test.ts`. | A precedent exists. | `EXTEND-EXISTING` |

## Stack Feasibility

The design can be built with the approved stack: Node `>=24`, TypeScript and the git CLI through `runGit`. It needs no new runtime dependency (`docs/technology.md` lists `cross-spawn` as the only one).

- Every git mechanism the design names exists and does what the design says:
  - A non-forced `fetch . <sha>:refs/heads/dev` refuses both a non-fast-forward and a `dev` checked out in another worktree.
  - `merge --ff-only` refuses when the move would overwrite an edited file.
  - `update-ref <ref> <new> <old>` is a compare-and-swap. An empty `<old>` means create-only, and the command does not check worktrees.
  - `git cherry` marks patch-equivalent commits `-`.
  - `diff-tree -r --stdin` and `cat-file --batch-check` batch the work.
  - The hook-off push already exists as `withoutHooks` (`GIT_CONFIG_*`, git >= 2.31).
- The engine shape fits.
  - `landVerb` already emits a `localDev` field (`branches.ts:3072`). Today it is a string, as the spec at `:3631` shows.
  - `shipClose` returns before `finalReturnText` runs (`workflows.ts:2507-2520`), so the line can be folded in after the landing.
  - `roadmap mirror`, `landFailedRecord` and `pushOwnCommits` each end in a switch over `DevPush` with a clean place after it for a non-throwing call.
- Constraints:
  - Today `landVerb` calls `fastForwardDev` inside its `try` and before the audit throws (`branches.ts:2996`). The design's "outside the landing's `try`" rule means moving the call after the audit and the lock release. That is feasible, and it changes when `dev` moves relative to an `EXIT_LANDED_UNVERIFIED` stop.
  - The design leaves the minimum git version unstated. `fetch`'s other-worktree refusal arrived with the upstream "protect branches checked out in all worktrees" change. The local git is 2.56.0. If drop-empty uses `cherry-pick --empty=drop`, check the minimum version for that flag; I did not verify it. Otherwise detect the "now empty" stop and run `cherry-pick --skip`.
  - git's stderr is localised, and `gitEnv()` (`ledgers/telemetry.ts:62`) does not pin `LC_ALL`. Classifying refusals by stderr text (`occupied` / `edited-files`) therefore fails on a non-English git and falls through to `git-refused`. The existing `MOVED_BEFORE` / `REFUSED` regexes in `land.ts` share this weakness.

## Library / API Evaluation

No npm library is added. Every API is a git built-in run as a subprocess. Git is GPL-2.0, and running it as a subprocess creates no licensing tie. It is already a hard runtime dependency, so it adds nothing to the package size.

<!-- prettier-ignore -->
| API | Maturity | Fit / caveat |
| --- | --- | --- |
| `git cherry <upstream> <head>` | Long-standing porcelain, patch-id based | Good for the cheap tier. Undecided: how it treats merges and commits that were empty from the start. bkit's own CI re-trigger makes empty commits on local `dev` (`retriggerCommit`, `ledgers.ts:675`, `allowEmpty: true`). Settle this from git source (`builtin/log.c` `cmd_cherry`, `patch-ids.c`) or with a fixture. |
| `git cherry-pick --empty=drop` / `--allow-empty` | Documented. The docs say `--keep-redundant-commits` is a "Deprecated synonym for `--empty=keep`" | `replayBuild` uses that deprecated flag. Drop-empty mode needs `--allow-empty --empty=drop` to keep commits that were empty from the start and drop those that became empty, or an explicit rule. The minimum git version is not verified. |
| `git update-ref` (old-value compare-and-swap, `""` = create-only) | Plumbing, stable | Right for backups and adoption. It ignores worktrees, so the design's explicit "checked out nowhere" check (`worktree list --porcelain`) is required. That check should also cover a worktree mid-rebase or mid-bisect on `dev`, because git's own `branch_checked_out` treats those as in use. |
| `git diff-tree -r --stdin`, `cat-file --batch-check` | Plumbing, stable | Plain `diff-tree` prints nothing for a merge commit without `-m` / `-c`, so a merge commit would show zero touched paths. |
| `git push <sha>:refs/heads/dev` through `withoutHooks` | Existing in-repo pattern (`pushToDev`) | A server refusal (branch protection, ruleset, 403) has no route in `--stage=push`. Only `stale` (non-fast-forward) is specified. |
| TypeScript types | Internal (`LocalDevSync`, `DevStatus`, `ReconcilePrepared`) | Fully typed. Changing `localDev` from a string to an object breaks the existing assertions in `branches.test.ts` (`:3325`, `:3358`, `:3369`, `:3681`, `:3708`) and the verb spec text at `branches.ts:3631`. |

## Integration Risk

Systems touched: engine verbs `branches land / push / sync-dev`, `workflows close` (ship flush and the non-flush build / debug path), `workflows handover`, `roadmap mirror`, new `branches dev-status / dev-reconcile`; `land.ts`; the ship step table (`status-holes.ts`, `step-table.ts`, `ship-invariants.test.ts`, the `bkit-ship.none.txt` snapshot); five workflow sources; a new prompt with host copies; `.bkit/cli.md` (generated from the verb specs through `pnpm cli:sync`), `.bkit/prompts.md` and `.bkit/workflows.md`.

- **Blast radius: high in reach, low in damage.** Every close and every `dev` push gains a fetch plus a `git cherry`. Because the sync never throws and never changes the exit code, a defect degrades into a wrong line rather than a failed run. Recovery writes refs only after approval and creates the backup first.
- **The coverage gap is the main integration risk (CRITICAL 1).** `dev` is pushed through more verbs than the design lists. `pushBranch` (`branches.ts:908`) routes any shared-branch run with a record to `pushOwnCommits` (`:977`), which pushes `dev` by a plain push or a replay. Its callers include:
  - `ci dispatch-gate`'s CI re-trigger (`runs.ts:881`, an empty commit pushed after debug's `branches push --mode=dev`, so the line debug shows can already be out of date);
  - `branches force-build` (`branches.ts:1819`);
  - `workflows handover --push` in abort mode (`workflows.ts:896`).
  Separately, `pushCurrentBranch` (`runs.ts:728`) pushes a shared branch with `runGit`, not `runPush`.
  A contract test keyed on direct `pushToDev(` / `runPush` call sites maps `pushOwnCommits` to one function with six callers and never sees `pushCurrentBranch`.
- **Ship step retirement:** `SHIP_STEP_ORDER` is described as "the frozen schema"; removing a key affects consumer status logs and stats corpora across repos. The design keeps old logs valid and routes Step-12 resumes to the close; an in-flight ship run upgraded mid-run between Steps 12 and 13 is the case to test.
- **Contract change:** `devLocal` → `localDev` is a rename. `branches land`'s existing `localDev` field also changes from a string to an object. No workflow or prompt source reads either field today (`grep` over `.bkit/core/workflows`, `.bkit/core/prompts`, `.bkit/core/docs/templates`: no hits), so the risk is limited to tests and the verb spec.
- **Monorepo fit:** not a monorepo. It is a single package (`docs/technology.md` § CI/CD), so there is no workspace graph to fit.
- **Provider parity:** the engine behaviour is host-neutral. Only the new prompt needs per-host copies, and those come from `bkit upgrade`.

## PoC Approach

1. Build a scratch repo with a bare `origin`, a main checkout on `dev`, and one linked worktree. Seed local `dev` with:
   - a commit replayed upstream as a copy (patch match);
   - two commits squashed upstream, one later edited;
   - an empty re-trigger commit;
   - a merge commit from `git pull`;
   - a deletion;
   - a commit whose path `origin/dev` later reverted.
2. Run the cheap tier (`rev-list --left-right --count`, `git cherry`) and a scripted full tier. Record each commit's class and the time taken on a 200-commit variant.
3. Replay the unpublished commits in a detached throwaway with `cherry-pick --allow-empty --empty=drop` (or stop-detect plus `--skip`). Confirm which commits drop.
4. Exercise the automatic move:
   - `fetch . <tip>:refs/heads/dev` with `dev` checked out in the linked worktree;
   - `merge --ff-only` with an edit on a changed path;
   - both under `LANG=de_DE.UTF-8`, to see whether stderr classification holds.
5. Run `update-ref refs/heads/dev <new> <old>` with `dev` checked out nowhere, then with a stale `<old>`.

The PoC is throwaway shell plus assertions. It touches no bkit source.

## Unknowns & Blockers

1. **How `git cherry` and the content tier treat merge commits and commits that were empty from the start.** bkit itself puts empty commits on local `dev` (`retriggerCommit`). With zero touched paths, "every touched file identical" is true by default, so the classifier would mark such a commit "already on GitHub" by accident rather than by rule. This is settled by reading git source or by the PoC fixture.
2. **The classification commit limit and the cost of the full tier.** The limit's value and whether batching keeps a 200-commit, 50-file history within an interactive budget can only be measured. Needs running code.
3. **Whether reason classification can avoid parsing localised stderr.** The PoC shows whether `occupied` / `edited-files` should come from git state instead: `worktree list --porcelain` for occupied, and the intersection of edited paths with `diff --name-only dev <target>` for edited files. Needs running code under a non-English locale.
4. **The minimum git version for `cherry-pick --empty`.** Settled by reading git release notes. If it is too new, use the stop-detect fallback.
5. **The `--stage=push` route when the server refuses** (protected `dev`). This is a design decision, not an experiment.

## Verdict Reasoning

`CONCERNS`. The design can be built with the approved stack and reuses the right engine pieces: `fastForwardDev`, `pushToDev`, `replayBuild`, `checkLanding`, `withoutHooks`, `notOnDev` and `requiredPushGate`. Every `NEW` row has a functional reason, and no in-repo candidate covers more than 80% of what it needs, so there is no reuse caveat. Its git mechanics hold.

Two addressable caveats remain:

- The list of `dev`-pushing paths, and the contract test meant to guard it, miss the `pushBranch` → `pushOwnCommits` callers and `pushCurrentBranch`. This breaks settled Q1 ("every push to `dev`").
- The recovery classifier and replay have no stated rule for merge commits or for commits that were empty from the start. bkit itself creates the empty ones on local `dev`.

Neither caveat makes the design infeasible. The PoC fits in 200 words, so there is no size caveat.

## CRITICAL

1. **Some `dev`-pushing paths are not covered (settled Q1).**
   - Add the uncovered paths to the caller list and the workflow integration:
     - every `pushBranch` route that reaches `pushOwnCommits`: `ci dispatch-gate` re-trigger (`runs.ts:881`), `branches force-build` (`branches.ts:1819`), `workflows handover --push` abort mode (`workflows.ts:896`);
     - `pushCurrentBranch`'s shared-branch push (`runs.ts:728`), or a stated reason it never targets `dev`.
   - The simplest fix within the design's own rules: call `syncLocalDev` at the end of `pushOwnCommits` after the switch, without throwing. That covers every `pushBranch` caller in one place and leaves `pushToDev` untouched.
   - Reshape the contract test to check reachability. Starting from `pushToDev`, `runPush` to `dev` and any `runGit` `push` to a shared branch, every verb must emit `localDev`. Pinning direct call sites is not enough.
   - For debug-on-dev, say which line is final when the CI re-trigger pushes after `branches push --mode=dev`.
2. **No rule for merge commits or for commits that were empty from the start.**
   - Define how the classifier and `replayBuild`'s drop-empty mode treat:
     - merge commits on local `dev` (from `git pull` without rebase): `cherry-pick` needs `-m`, and `diff-tree` prints no paths without `-m` / `-c`;
     - commits that were empty from the start (bkit's own `retriggerCommit`): content-match would hold for them only because they touch no files, and `--empty=drop` alone fails on them.
   - Recommended rule:
     - Classify merges as `unpublished` and leave them out of the replay. Their non-merge parents carry the changes, and the backup branch keeps the merge.
     - Treat empty commits as a named class (`empty`). Exclude them from the replay, list them, and do not count them as "already on GitHub".
   - Add both to the edge-case tests.

## OPTIONAL

- Correct the Reuse row "`requiredPushGate` … the same one `bkit tests run` picks". `bkit tests run` runs whichever candidates its caller passes (`resolveGate`). State that "deepest" means the deepest full push gate. The e2e and live gates are excluded because `.bkit/workflows.md:1540` says they need a deployed boundary. Record this as how the design reads Q9.
- Work out `blocked` reasons from git state rather than from stderr text, or run those calls with `LC_ALL=C`. Otherwise every refusal on a non-English git becomes `git-refused`.
- `--stage=push`: add a `refused` outcome for a server refusal (branch protection, ruleset, 403). The outcome should print the PR route or the manual step. Today only `stale` is specified.
- `--stage=prepare` runs a full gate. Say whether it waits on the machine-wide tests lock and returns exit 81 like `branches push`. Name the fixed throwaway id it passes to `landDir` (it must match `SAFE_FID`).
- When drop-empty leaves `HEAD` equal to the base, stop with "nothing to publish" before `checkLanding`. Otherwise `checkLanding` runs `bkit:gate:min` on an empty diff.
- Advice text: `inheritedDevRefusal` and the base-branch log in `worktrees.ts` (around lines 218 and 251) also say "publish `dev` (git push origin dev)". Point them at `bkit branches dev-status` together with `unpushedDevCause`.
- `.bkit/cli.md` is generated from the verb specs (`pnpm cli:sync`, `docs/architecture.md:86`). Update the specs, not the doc rows by hand.
- Adoption's "checked out nowhere" check should also treat a worktree mid-rebase or mid-bisect on `dev` as occupied, the same as git's `branch_checked_out` does.
- `replayBuild` uses `--keep-redundant-commits`, which git now documents as a "Deprecated synonym for `--empty=keep`". Switch to the current flag in the same change.

## OUT OF SCOPE

- Pinning `LC_ALL` for every engine git call: `land.ts`'s `MOVED_BEFORE` / `REFUSED` regexes have the same locale weakness today.
- A documented minimum git version for bkit as a whole. `land.ts` and `ledgers.ts` assume different minimums (2.31, 2.25), and no doc states one.
- Registering local-`dev` movement as a `docs/capabilities.md` capability (a marker on `refs/heads/dev` writes), so a second implementation is flagged by CI.
