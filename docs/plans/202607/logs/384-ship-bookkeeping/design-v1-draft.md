# Design: Ship Bookkeeping Off The Validated PR Head

## Related Issues

- #341 — Make workflows run in all runtimes local GH Actions claude.ai (OPEN) — **sequencing dependency, not just a naming one.** #341 is past design: `docs/plans/202607/341-three-runtimes-design.md` plus six PASS-verdict sub-plans exist in the tree. WS-8 deletes `bkit-ship.md:556`'s `sleep 30`, WS-9 rewrites the branch model across all five phases, WS-10 adds the close-guard kernel, WS-12 rewrites ship's close shape. Its own plan records the constraint: "Repo doctrine forbids concurrent bkit workflows on one clone — serialise the landing." Both issues rewrite the same file.
- #74 — Ship workflow cancels feature CI run mid-flight (CLOSED) — recurring. `ci.yml:19-21` `cancel-in-progress` on `pull_request`; a docs-only push cancelled run 29454200201 mid-flight. Second, independent justification for the frozen head.
- #68 — Stale workflow lock main repo vs worktree cwd mismatch (CLOSED) — same class as Finding 4. Two coexisting root resolvers (`--git-common-dir` vs `--show-toplevel`) writing state to two trees; #68 fixed the lock, the status file kept the split.
- #209 — Workflow state model design/plan squash to dev persistent feat branch build→ship (CLOSED) — established `status.jsonl` and "build/debug/ship state comes off the branch". This design finishes that sentence for ship, which is the phase where it never fully applied.
- #71 — Workflow optimisation commit/push reduction (CLOSED) — the per-step `git add -A && git commit --allow-empty` bookkeeping idiom this design removes from the branch side.

## Acceptance Scenario

### Narrative

A developer runs `/bkit-ship {FID}` and the feature merges to `dev` only if the exact commit that is about to be squashed is the one CI proved green — regardless of whether `dev` moved underneath the branch in the meantime. When ship has to re-integrate first, the developer sees the branch rebased and re-tested rather than merged on a stale green. When the run finishes, succeeds or fails, the full record of what happened is on `dev` in one place, and nothing ship wrote for its own bookkeeping ever touched the branch being merged.

### Success Criteria

1. Every squash-merge is immediately preceded by a passing assertion that the capstone job is **present** in a run whose `headSha` equals the current PR head, and concluded `success`. No merge path bypasses it.
2. No ship run pushes a commit to `origin/feat/{FID}` that is not a code-integration change (rebase or conflict resolution), and every head move ship causes is followed by re-validation before the merge gate.
3. Every ship run — completed, failed, or aborted — leaves exactly one `status.jsonl` for the run, in one tree, containing a terminal row and no dangling `IN_PROGRESS`.
4. A deferred-sweep FAIL produces a handover artifact and reaches the handover route, never a bare STOP.
5. Ship's staging never commits a path outside `docs/plans/{YYYYMM}/logs/{FID}/` plus a named ledger allow-list, verified mechanically rather than by review.

### Key Edge Cases

- **PR is `CONFLICTING`** — GitHub cannot compute `refs/pull/<n>/merge`, so a `pull_request` workflow fires nothing at all. Confirmed on PR #720: two pushes landed on the remote, `total_count 0`. Waiting produces nothing; only an explicit dispatch recovers.
- **Stale green** — the PR's most recent run is green at a superseded SHA, so the PR _presents_ as green while its actual head has never been tested. Any gate keyed on "latest run" or `statusCheckRollup` is satisfied by this.
- **Concurrent session on the shared `dev` checkout** — a parallel `bkit-plan` had already staged another FID's files; a blanket `git add -- docs/` would have committed them under this FID's message. Relocating ship bookkeeping onto `dev` increases exposure to exactly this.
- **Shared `.worktrees/{FID}` occupied by another phase** — the worktree is created by design or plan and resumed by all five phases. Step 12's `worktree remove --force` is safe today only because ship holds the cwd; "resume read-only" removes that ownership without removing the force-delete.
- **Mid-rebase failure** — the Failure Path appends `workflow-failed` and _then_ runs `git rebase --abort`, which discards the append. Two loss mechanisms two lines apart (wrong tree, wrong order); the ordering bug hides the evidence of the tree bug.
- **Cloud runtime cannot write the main checkout** — mode 3 has no `.worktrees/`, and the proxy restricts `git push` to the current working branch. "Bookkeeping to the dev tree" is unexecutable there.
- **Buried `[skip ci]` in branch history** — `feat/{FID}` carries a `worktree-setup … [skip ci]` commit written by build or debug. Every later push for that branch dispatches zero runs even with clean HEAD messages; the pre-push hook only inspects HEAD and structurally cannot catch it.
- **Capstone absent from the run** — an assertion phrased as "no lane concluded failure" passes _vacuously_ when the capstone never ran. Consumers on older scaffolds are known to have different job names (`ci-legacy-scaffold-job-names` advisory).

### Process Sketch

```
WHEN ship starts -> THEN the bookkeeping target is resolved once and recorded; every later record lands there, never on feat/{FID}
WHEN origin/dev is an ancestor of the PR head -> THEN no integration, no head move, straight to the merge gate
WHEN origin/dev has moved and the PR is mergeable -> THEN server-side rebase; WHEN it conflicts -> THEN worktree resolve + force-with-lease, or handover
WHEN the PR head SHA differs from the one observed at entry -> THEN dispatch CI unconditionally and wait for a run at the new head
WHEN the capstone is present in a run at the current head AND concluded success -> THEN merge; ELSE refuse, printing the required head, the head actually tested, and the run URL
WHEN the deferred sweep FAILs -> THEN a block sentinel is written and the run routes to handover, never to a bare STOP
WHEN the run ends by any route -> THEN one complete, path-scoped step record set exists in one tree, with a terminal row
```

## Architecture

### The organising choice: three carriers, matched to three blast radii

All seven findings are one defect class — a load-bearing rule that lives only in prose, that no gate can check, and that each agent resolves differently. The three exploration lenses disagreed on the remedy: rewrite the prose (pragmatic, optimal-tradeoff) versus extract it into a tested executable (risk premortem). That disagreement resolves by **not applying one carrier uniformly**, because the rules do not share a blast radius:

<!-- prettier-ignore -->
| Tier | Rule class | Worst outcome if violated | Carrier |
| --- | --- | --- | --- |
| 1 | The merge gate — capstone present + `success` at the current PR head | **Unrecoverable.** The squash lands; `ci.yml:130-131` gives merged-PR dev pushes only `run_level=light`, so the change never receives full validation at all | Executable: `.bkit/scripts/bkit-ship-gate.sh` + `tests/ship-gate.bats` with captured `gh` JSON fixtures |
| 2 | Push contract, staging scope, step-key stability | Recoverable but silently drifting — misattributed commits, lost artifacts, orphaned counters | Prose in `bkit-ship.md`, mechanically constrained by a vitest markdown-invariant test |
| 3 | Step-set completeness across a run | Post-hoc; detectable days later | Advisory detector over the existing `status.jsonl` fold |

Tier 2's carrier is cheap because the harness already exists and the exploration surfaced it: `.bkit/src/` carries `bkit-counter-prose-audit.test.ts`, `bkit-telemetry-workflow-writers.test.ts`, `bkit-ci-dispatch-gate-alignment.test.ts`, `bkit-comply-gate-wiring.test.ts` — vitest files that grep the workflow markdown for structural invariants. **The issue's claim that `tests/` is five `.bats` files and "no test parses workflow markdown" is false.** Asserting a rule about `bkit-ship.md` costs one new `*.test.ts`, not a test framework.

Tier 1's carrier is not new infrastructure either: `.bkit/scripts/` ships eight helper scripts sourced by workflow prose (`bkit-counter-bus.sh`, `bkit-status-fold.sh`, `bkit-status-route.sh`, …), each with `.bats` coverage, and they exist for precisely this reason — routing and counting were too load-bearing to leave in prose. Ship's merge gate is the same class and the last piece of it uncovered.

### Ship's shape

```
1  start          -> resolve BOOK_ROOT + BOOK_PATHS once; record them; acquire dev lock
2  verify PR       -> read PR head SHA (ENTRY_HEAD), mergeable state; NO local rebase
3  base check      -> git merge-base --is-ancestor origin/dev origin/feat/{FID}
                        ancestor      -> Path A  -> step 6
                        not ancestor  -> Path B  -> step 4
4  integrate       -> B1 mergeable:    gh pr update-branch
                      B2 conflicting:  worktree + @bkit-ship-conflict-resolve + push --force-with-lease
                      non-mechanical:  handover
5  re-validate     -> IF current head != ENTRY_HEAD: unconditional gh workflow run, then bounded poll
6  merge gate      -> bkit-ship-gate.sh assert <current head>   (the ONLY merge precondition)
6b merge           -> gh pr merge --squash. No update-branch here.
7+ close           -> docs, summary, flush outbox, one path-scoped [skip ci] commit + push
```

Three deletions ride along, because each exists only to compensate for the incompatibility being removed: ship's unconditional rebase-on-resume (four other phases keep theirs — none of them gate on head match), Step 3's prior-run diffing, and Step 8's `Update: Source files.` retry loop.

### Component boundaries

- **`.bkit/scripts/bkit-ship-gate.sh`** (new) — the merge gate and nothing else. Queries the run **by SHA** (`gh api /repos/{o}/{r}/actions/runs?head_sha=<sha>`), not `gh run list --limit 5 | filter`. One exit code per condition. `--explain` for read-only interrogation without starting a ship.
- **`tests/ship-gate.bats`** (new) — fixtures captured from real `gh` JSON across the three repos, including the PR #720 `total_count 0` case. Cases named for the property: `rejects-stale-green-at-superseded-head`, `rejects-run-missing-capstone`, `distinguishes-api-error-from-no-run`.
- **`.bkit/src/bkit-ship-invariants.test.ts`** (new) — Tier-2 prose invariants: no `git add -A` and no blanket `git add -- docs/` anywhere in `bkit-ship.md`; every `status.jsonl` write resolves via `BOOK_ROOT`; the canonical `ship-*` step-key set is present and unchanged; no `git commit`/`git push` targeting `feat/{FID}` outside the B2 block.
- **`bkit-ship.md`** (rewritten) — orchestration, routing, subagent dispatch, narration. Calls the gate; branches on its exit code.
- **`.bkit/workflows.md`** — step table re-sectioned; the `.deferred-blocked` contract at `:531`/`:751` now has a writer to point at.
- **Rendered mirrors** — `.claude/commands/bkit-ship.md` (byte-identical), `.cursor/commands/bkit-ship.md` (transformed), `.opencode/commands/`, plus the templates-content snapshot. Regenerated by `bkit install`.

### Integration points

`ci.yml` (capstone `bkit-tests-check`, `pull_request ⇒ run_level=full`, `cancel-in-progress`), the `gh` API surface, the existing dev-lock idiom, `bkit-status-fold.sh` and the counter-bus (both key on step names), and #341's capability table.

## Data Model

### `BOOK_ROOT` and `BOOK_PATHS` — the two named conventions

The push contract and the staging scope are today unwritten conventions. Each becomes one named variable, resolved once in Step 1, read by every later step, and asserted by the Tier-2 test.

```
BOOK_ROOT   = the single tree every status/artifact write in this run targets.
              Resolved once. Recorded in the Step 1 status row.
              A single variable cannot resolve to two trees — Finding 4 dissolves.

BOOK_PATHS  = the staging allow-list, expanded literally into every git add:
              docs/plans/{YYYYMM}/logs/{FID}/
              docs/completed.md docs/deferrals.jsonl docs/failures.jsonl
              docs/knowledge.jsonl docs/decisions.jsonl .bkit/friction.jsonl
              .agents/skills skills-lock.json
              Never `-A`. Never a bare `docs/`.
```

### The bookkeeping invariant is stated as push timing, not tree location

This is the design's sharpest departure from the issue text, and it is what decouples 384 from #341.

> **Invariant:** no ship bookkeeping commit reaches `origin/feat/{FID}` before the merge.

That is true in every runtime, needs no capability flag, and demotes _where_ `BOOK_ROOT` points to a runtime detail. The issue's wording — "status.jsonl and ship artifacts go to the dev tree from Step 1" — is unexecutable in mode 3, which has no main checkout to write and a proxy that restricts `git push` to the current branch.

`BOOK_ROOT`'s _value_ is then selected by #341's `CAN_PUSH_DEV`, named exactly as #341's capability table names it:

<!-- prettier-ignore -->
| `CAN_PUSH_DEV` | `BOOK_ROOT` | Flush |
| --- | --- | --- |
| `true` (worktree exists — modes 1, 2) | main checkout / dev tree | Step 13's single `[skip ci]` commit + push, path-scoped to `BOOK_PATHS` |
| `false` (mode 3, unknown) | current working branch (adopt tree) | Landed with the phase-close PR, per #341 shape A |

**The `git push --dry-run origin dev` probe is rejected.** #341's design already rejected it with a mechanism: `--dry-run` performs auth and ref advertisement but sends no ref-update, so the server-side pre-receive hook never runs and branch protection is never evaluated — it returns success where a real push would be rejected. A false-positive `CAN_PUSH_DEV=true` in mode 3 then fires `git checkout dev` on the live session. Until #341 lands, 384 uses `CAN_PUSH_DEV`'s identity-derived default (worktree present ⇒ `true`, optimistic; the real push fails loud) so that #341 replaces a default with a table lookup and touches nothing else.

### The outbox — durability independent of both trees

```
$(git rev-parse --path-format=absolute --git-common-dir)/bkit-outbox/{FID}/
```

Outside every worktree, so it survives Step 12's `worktree remove`, which is the loss mechanism Finding 6 describes. Ship writes step artifacts and the pre-merge snapshot here first, then flushes to `BOOK_ROOT` at close. In mode 3 the flush target changes; the durability does not.

**Pre-merge snapshot** (written before the merge fires, so a post-mortem is possible from the log dir alone): PR head SHA, `origin/dev` SHA, the `merge-base --is-ancestor` verdict, the capstone run id and URL, `mergeable`, and the gate's exit code.

### Canonical `ship-*` step keys — a stable schema

`counter_next`/`counter_current`, the fold reducer, Resume (`:25`), the lock-staleness cross-check (`:27`), and every historical consumer row key on step **names**. Step **numbers** may move; keys may not.

```
ship-start-workflow      ship-worktree-setup      ship-regression-guard
ship-conflict-resolve    ship-deferred-sweep      ship-merge-pr
ship-failure-diagnose    ship-failure-remediate   ship-switch-to-dev
ship-update-docs         ship-summary             ship-prune-skills
ship-worktree-cleanup    ship-close-workflow
```

Renaming resets attempt counters silently, breaks in-flight resume across three repos, and orphans the only corpus the Tier-3 detector can be tested against. Publishing the set is also what makes Finding 7 (`ship-resume-human-override`, `ship-post-failure-migration-fix` — names that exist nowhere) detectable rather than invisible.

### Gate exit codes — one per condition, never collapsed

Today `:596-602` collapses six distinct conditions into two strings, and bakes in a misdiagnosis: it prints `query failed (403 = PAT scope)` for any empty result, so a secondary-rate-limit 403 reads as a permissions problem forever.

<!-- prettier-ignore -->
| Code | Condition | Merge |
| --- | --- | --- |
| 0 | Capstone present at head, concluded `success` | proceed |
| 10 | No run exists at head | refuse |
| 11 | Run at head still in progress | refuse (caller may poll) |
| 12 | Run at head concluded failure | refuse |
| 13 | Run at head exists but capstone job **absent** | refuse — never vacuous pass |
| 14 | Green run exists, but at a **superseded** SHA | refuse, print both SHAs + run URL |
| 20 | API error / rate limit / auth | refuse, **distinct from "no run"** |

Codes 10–14 mean "not validated". Code 20 means "unknown". Conflating them lets a degraded API read as an unvalidated head, and — far worse — lets an unvalidated head read as an API blip.

### Configuration, not literals

`bkit-tests-check` is hard-coded in `docs/deployments.md`, in `bkit-protect-main.sh`, and would be hard-coded a third time in the gate — while `ci-legacy-scaffold-job-names` already advises that consumers on older scaffolds have different names. Resolve it from one key, `package.json` → `bkit.capstoneJob`, default `bkit-tests-check`. Every timeout and limit goes in one config file with units in the identifier, matching the `bkit-counter-bus-config.sh` precedent: the CI-wait timeout, the poll interval, the 900s dev-lock staleness, the 600s acquire deadline, `MAX_MERGE_ATTEMPT`.

## Components / Flows

### Flow 1 — Step 1: resolve the contract before anything can violate it

Resolve `BOOK_ROOT` and `BOOK_PATHS`; create the outbox; acquire the dev lock; write the `ship-start-workflow` row **to `BOOK_ROOT`**, carrying the resolved values so the run is self-describing. No worktree mutation, no rebase.

### Flow 2 — Steps 2–3: verify and classify

Read the PR: head SHA (`ENTRY_HEAD`), `mergeable`, base. Classify with `git merge-base --is-ancestor origin/dev origin/feat/{FID}`.

Path A is _defined_ as "base not stale", which is why the rejected `[force full]`-on-stale-base escalation is unnecessary rather than merely unused: the risk is avoided, not mitigated.

Comment 1's independently-logged friction row (`ship-regression-guard-runs-before-conflict-resolve`) records a second, distinct reason the current order cannot work — the guard evaluates a head Step 4 is about to discard. The verify → classify → integrate → re-validate → merge order fixes that by construction rather than by conditional.

### Flow 3 — Step 4: integrate (Path B only)

**B2 is the common case, not the escape hatch.** Long-lived branches accumulate `docs/architecture.md` / `docs/testing.md` / `docs/navigation.md` edits from plan-execute commits, and concurrent issues edit the same summary bullets on `dev`; same-line doc collisions are ordinary. Today's Step 2 auto-resolution only special-cases `CONFLICT_FILES == pnpm-lock.yaml`. B2 therefore gets a first-class conflict-resolution story via `@bkit-ship-conflict-resolve`, with non-mechanical conflicts exiting to handover — matching that agent's existing charter.

- **B1** (`mergeable == MERGEABLE`): `gh pr update-branch`. Server-side rebase, head moves, no worktree, no local rebase, no conflict subagent.
- **B2** (`mergeable == CONFLICTING`): resume the shared worktree, dispatch `@bkit-ship-conflict-resolve`, `git push --force-with-lease`.
- Neither resolvable mechanically: handover.

### Flow 4 — Step 5: re-validate on observed head movement

The trigger is an **observed fact, not a path label**: re-validate when the current PR head differs from `ENTRY_HEAD`. Keying on observation rather than on "we took Path B" means a head that moved for a reason ship did not cause — a concurrent push, a UI action — also triggers re-validation. This is the one idea worth keeping from the head-move-observer approach, without adopting its premise.

**Dispatch is unconditional after any head move, not a timeout fallback.** In the CONFLICTING case nothing fires _by construction_ — there is no `refs/pull/<n>/merge` for GitHub to evaluate, confirmed on PR #720 with `total_count 0`. A buried `[skip ci]` in branch history poisons push-triggered dispatch identically, and taking bookkeeping off the branch does not fix it: build and debug still write `worktree-setup … [skip ci]` onto `feat/{FID}`, so ship keeps inheriting poisoned branches. Waiting first only adds latency to a certainty.

Then poll for a run at the new head — bounded by attempt cap **and** elapsed cap, `timeout`-wrapped, with jittered backoff. Both caps matter: a blocked `sleep` primitive must fail loud rather than hang, because a hang produces zero observability (no status row, no narration — the step never completes to emit one) and ends only at an external session timeout.

### Flow 5 — Step 6: the single merge gate

```
bkit-ship-gate.sh assert --head <current PR head> [--capstone <job>]
  exit 0  -> gh pr merge --squash          (no update-branch here — :620 is deleted)
  exit !0 -> refuse; the exit code selects the message and the route
```

One assertion replaces all of Step 3, and is strictly stronger than it: `ci.yml:602`'s `bkit-tests-check` capstone `needs` all three lanes with `if: !cancelled()`, and `ci.yml:111-112` forces `run_level=full` on `pull_request` and `workflow_dispatch`. There is no "green but light" PR state, so capstone-green implies every lane ran and passed.

Path A satisfies the gate with build's or debug's existing run; Path B with the re-validation run. One assertion, one invariant, no path-specific merge logic.

**Every rejection prints both SHAs and the run URL.** The dangerous 3am action is not a bad script — it is the human overriding it. An operator looking at a PR that presents green (because a superseded run is still its most recent) and a gate that refuses will conclude the gate is broken and merge in the UI, arriving rationally at a merge of untested code to `dev`. Printing the head the gate required alongside the head the green run actually tested makes the green-looking PR self-refuting on screen. Pair it with a single logged escape (`BKIT_SHIP_GATE_OVERRIDE=<sha>`, recorded as a `status.jsonl` row) — a visible override beats a hand-merge in the UI that leaves no trace at all.

### Flow 6 — the Failure Path and `.deferred-blocked`

Three fixes, all in the block this design already rewrites:

1. **Write the sentinel.** `@bkit-ship-deferred-sweep` returning FAIL touches `$BOOK_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.deferred-blocked`. The reader (`:114`) and the `rm -f` (`:67`) already exist; only the writer is missing, and without it Failure Path step 4's condition can never be true — a sweep FAIL falls through to step 12 (**STOP**) with no handover artifact, for exactly the case the sweep exists to catch.
2. **One tree.** The Failure Path reads `BOOK_ROOT` like every other step, rather than resolving `--git-common-dir` while Steps 1–8 resolve `--show-toplevel`.
3. **Order the append after the abort.** Today `:61` appends and `:62` aborts, so a mid-rebase abort discards the append. Fix both together: the ordering bug is what hides the evidence of the tree bug.

Also drop the silent-failure idiom in this block. `git rebase --abort 2>/dev/null || true` plus six `2>/dev/null || true` git calls at `:79-82` let the Failure Path report success while writing nothing — and one observed instance left the worktree mid-rebase with a `UU` file and a detached HEAD.

### Flow 7 — Step 12: remove only what this run created

The shared `.worktrees/{FID}` is created by design or plan and resumed by all five phases; ship's `worktree add` fires only when it was pruned or the run is cross-machine. `worktree remove --force` is safe today only because ship happens to hold the cwd. Path A's "resume read-only" removes that ownership without removing the force-delete, so Step 12 records whether _this run_ created the worktree and removes it only then.

### Flow 8 — the status-hole detector, advisory first

Fold each `status.jsonl`, diff the observed step set against the expected set, flag holes. Two properties make it survivable:

- **Derive the expected set from `bkit-ship.md`**, by parsing the `## … Step N — Name` headings and the `step:"ship-…"` literals in the fenced blocks. Never a hand-maintained table: a parallel table is a second source of truth about step names, and Finding 7 is that drift signature. Under a table, an invented step name becomes a CI failure whose cheapest resolution — edit the table to match observed reality — is also the wrong one. Deriving also answers the objection that the detector needs stable vocabulary first: it tracks the vocabulary rather than duplicating it.
- **Report a delta against a pinned watermark**, as `bkit slop:delta` already does, and emit through the fail-open advisory channel for one release before promoting to a gate. The corpus is 25–65% holey; a day-one aggregate gate emits hundreds of findings and is muted within a week.

Expectations are path-conditional — Path A skips integration and re-validation by design, a MERGED-on-entry resume skips the middle, an aborted run stops at the Failure Path. Declaring those per path is forced work, and a genuine side benefit: it makes the design name its paths explicitly rather than leaving them implicit.

## Decisions

<!-- prettier-ignore -->
| Decided | Alternatives | Why |
| --- | --- | --- |
| **Carrier is tiered, not uniform:** merge gate → tested executable; push contract / staging / step keys → prose + vitest invariant; step-set completeness → advisory detector | One carrier for everything: all-prose (cheapest); all-executable (most durable) | The rules do not share a blast radius. The merge gate's failure is unrecoverable — the squash lands and `ci.yml:130-131` gives the merged dev push only `run_level=light`, so the change never gets full validation at all. Staging scope drifting is annoying; merging an untested head is not. All-prose re-runs the bet that already lost; all-executable pays HIGH complexity on rules whose failure is cheap. |
| Restructure `bkit-ship.md` into verify → base-check → integrate → re-validate → merge → close | Surgical patch keeping the 13-step skeleton; head-move observer with no explicit base check | Findings 1/3/4/5/6 and the guard-ordering defect dissolve structurally instead of each needing a conditional. A patch leaves the correctness property distributed across steps — reconstructable only by holding several steps in your head, which is the exact failure mode that produced this issue. |
| **Bookkeeping invariant stated as push timing** — no ship bookkeeping commit reaches `origin/feat/{FID}` before the merge | "Dev tree from Step 1" as the issue writes it; "dev tree when `RUNTIME_DEVPUSHES`, else current branch" as comment 2 writes it | Location is unexecutable in mode 3 (no main checkout, proxy restricts push to the current branch). Push timing is true in every runtime, needs no flag, and is what actually protects the head. It also unblocks 384 from #341 for zero correctness loss. |
| `BOOK_ROOT`'s **value** selected by #341's `CAN_PUSH_DEV`, with #341's identity-derived default until it lands | Block 384 on #341; invent a synonym flag; **probe push capability at Step 1** | #341 is designed and planned (six PASS sub-plans), so the flag name and semantics are settled even though the code is not in `.bkit/workflows/`. A synonym desyncs on landing. **The probe is rejected outright:** #341's design already rejected `git push --dry-run origin dev` with a mechanism — it sends no ref-update, so branch protection is never evaluated and it returns success where a real push fails, yielding a false-positive that fires `git checkout dev` on a live mode-3 session. |
| One status tree per run, enforced by every path reading `BOOK_ROOT` | Fix only the divergent Failure Path call site | Finding 4 is a symptom of two resolvers coexisting, not of one bad line. Fixing the one divergent site leaves the next one free to reappear — same class as closed #68, which fixed the lock and left the status file split. A single variable cannot resolve to two trees. |
| **Outbox** at `$GIT_COMMON_DIR/bkit-outbox/{FID}/` for artifacts + a pre-merge snapshot | Write to the branch and rely on the merge; write only to `BOOK_ROOT` | Step 12's `worktree remove --force` is the loss mechanism in Finding 6; an outbox outside every worktree survives it in both runtimes. The snapshot is also the only post-mortem source once ship stops holding a local checkout of the merged state. |
| Path-scoped staging via a named `BOOK_PATHS` allow-list, plus a test banning `git add -A` and blanket `git add -- docs/` | Rely on the existing dev lock; inline per-command path lists | The dev lock was held during the observed misattribution and did not prevent it — a concurrent plan-amend had already staged another FID's files. One named variable is greppable, testable, reviewable; six inline lists drift. Relocating bookkeeping onto `dev` *increases* this exposure, so it must ship with the relocation, not after it. |
| Merge gate = capstone **present** and concluded `success` at the **current** PR head, resolved by a SHA-keyed query | `statusCheckRollup` (today's `:316`); per-lane re-assertion (today's Step 3); `gh run list --limit 5` then filter | Rollup and "latest run" are both satisfiable by a stale green — run 29454436704 presented green while HEAD had never been tested. List-and-filter is latent-broken at 1x and certainly broken on a branch with >5 recent runs, where the miss is indistinguishable from a genuine absence. "Present" matters as much as "success": an absent capstone must FAIL, never pass vacuously. |
| Re-validation triggered by **observed head movement** (`current head != ENTRY_HEAD`), not by path label | Trigger on "we took Path B" | An observed fact also covers head moves ship did not cause — a concurrent push, a UI action. Keying on the path label leaves those merging on a stale green. |
| Path B dispatch is **unconditional** `gh workflow run` after any head move | Wait-then-dispatch with a timeout fallback; branch on repo config | A CONFLICTING PR has no `refs/pull/<n>/merge`, so nothing fires by construction — PR #720, `total_count 0`. Buried `[skip ci]` poisons dispatch identically, and ship keeps inheriting it because build and debug still write `worktree-setup … [skip ci]`. A timeout adds latency to a certainty. |
| Explicit `merge-base --is-ancestor` base check retained as a named fork | Always attempt `gh pr update-branch` and classify by whether the head moved | The observer collapses a forecast into an observation, which is genuinely elegant, but its own analysis names the fatal case: mis-reading a *failed* `update-branch` as "unchanged" merges a stale base. It also spends an API call on every ship and softens vocabulary humans already agreed on. The observation half is kept — as the re-validation trigger, above. |
| Distinct exit code per gate condition; API error ≠ no run at head | Today's two-string collapse at `:596-602` | Six conditions currently collapse into two messages, one of which asserts `403 = PAT scope`, so a secondary-rate-limit 403 reads as a permissions problem forever. Conflating "unknown" with "unvalidated" is dangerous in both directions. |
| Capstone job name resolved from `package.json` → `bkit.capstoneJob` (default `bkit-tests-check`) | Hard-code the literal in the gate as a fourth copy | Already hard-coded in `docs/deployments.md` and `bkit-protect-main.sh`, and `ci-legacy-scaffold-job-names` advises consumers have different names. A permanent FAIL for those consumers is the good outcome; the bad one is a vacuous pass. |
| Finding 2 (`.deferred-blocked` writer) **in scope** | Split to a follow-up issue | Unanimous across all three lenses. The `rm -f` at `:67` and the read at `:114` sit inside the Failure Path this design already rewrites; the writer is two lines. Deferring leaves the sweep's only FAIL route dead at exactly the moment the sweep becomes load-bearing — a dead condition that silently routes to a bare STOP is worse than no condition. |
| Status-hole detector **in scope as a fail-open advisory**, gate deferred, expected set **derived from `bkit-ship.md`** | Full gate now; fully deferred to a follow-up; hand-maintained expected-set table | Deferring entirely was argued on the grounds that the detector needs stable step vocabulary — deriving the set from the workflow answers that, since it tracks the vocabulary instead of duplicating it. A day-one gate over a 25–65% holey corpus is muted within a week; advisory-first matches the `bkit comply` fail-open rollout, and the fixture survey is fresh now. |
| Preserve existing `ship-*` step **keys** where step **numbers** move; publish the canonical set | Renumber and rename freely for clarity | Counter-bus, the fold, Resume (`:25`), the lock-staleness cross-check (`:27`) and every historical row key on names. Renaming silently resets attempt counters, breaks in-flight resume across three repos, and orphans the only corpus the detector can be tested against. Publishing the set is what makes Finding 7 detectable. |
| Ship never edits source files — drop Step 8's `Update: Source files.`; code-level merge failures route back to build | Keep the remediate loop and add the missing push | Under a frozen head a source edit cannot reach the merge, so the loop re-merges identical remote content until `MAX_MERGE_ATTEMPT` exhausts. Routing to build earns a fresh full CI run, which is the validation the merge gate requires anyway. |
| Step 12 removes the worktree only if **this run created it** | Keep `worktree remove --force` unconditional | `.worktrees/{FID}` is created by design or plan and shared by all five phases. Force-removal is safe today only because ship holds the cwd; "resume read-only" removes that ownership. This is the live destruction hazard and it is not optional. |
| Land `bkit-ship-gate.sh` + its bats **before** rewriting the prose | One atomic change | Direct antidote to `01f8b8d9`, where the worktree model and the head-match gate arrived in one commit and neither was reviewed against the other. The old workflow keeps running while the gate is proven against captured fixtures. |
| Write the Tier-2 vitest invariant **before** the prose rewrite | Rewrite first, test after | A half-applied rewrite — the file carrying both the head-mutating and the frozen-head model — is worse than either, and is the main risk of restructuring. A red test is the only thing that makes it visible. |
| **Serialise 384 after #341's ship-touching workstreams, or explicitly carve the overlap** | Land 384 first; land in parallel | Newly surfaced, and not visible from the issue text: #341's WS-8 deletes `bkit-ship.md:556`, WS-9 rewrites the branch model in all five phases, WS-10 adds the close-guard kernel, WS-12 rewrites ship's close shape. #341's own plan records "Repo doctrine forbids concurrent bkit workflows on one clone — serialise the landing." Two unreviewed rewrites of one file is the `01f8b8d9` pattern again. |
| Leave design / plan / build / debug worktree conventions untouched | Make read-only resume universal across phases | None of those phases gate on the local branch matching a validated remote head, so their unconditional rebase is harmless. Revisit only if head-match gating spreads. |
| Record the CI-config reasoning chain in `docs/decisions.jsonl` with discarded alternatives named | Leave it in the issue thread | The chain from `ci.yml:111`/`:602`/`:130`/`:19-21` to "one assertion is strictly stronger than all of Step 3" exists only in this thread. Lose it and the next maintainer either hardens the gate back into Step 3 or softens it to `statusCheckRollup` — both regressions, both reached by good-faith reasoning. |
| Fold the three comment corrections into the issue body | Leave them in comments | Cheap, and it stops the next reader re-deriving that non-firing `pull_request` is general rather than a bkit token quirk, that `cancel-in-progress` is a second justification for the frozen head, and that B2 is the common case. |

## Approaches Considered

<!-- prettier-ignore -->
| Approach | Verdict | Why |
| --- | --- | --- |
| **Structural rewrite of `bkit-ship.md` to the A/B shape** (pragmatic A, optimal A, risk B all contain it) | KEPT — the spine | Converged across all three lenses. The findings dissolve rather than each needing a patch, and it is the shape already agreed with the issue owner. |
| **Merge contract extracted into a tested executable** (risk A) | MERGED — scoped to the gate only | The right carrier for the one rule whose failure is unrecoverable, and the repo has already solved this class for routing and counting. Applying it to the whole workflow is HIGH complexity for rules whose failure is cheap, so it is scoped rather than adopted wholesale. |
| **`BOOK_ROOT` / `BOOK_PATHS` as named variables** (pragmatic A) | KEPT | Turns the two unwritten conventions into two greppable, testable names, and collapses every divergent resolver onto one. The best single idea in the pragmatic lens. |
| **Step-1 probe for push capability** (pragmatic A's resolver body) | REJECTED | Directly contradicted by #341's design, which rejected `git push --dry-run origin dev` with a mechanism: no ref-update means branch protection is never evaluated, so it fails *dangerous*. Replaced by `CAN_PUSH_DEV`'s identity-derived default. |
| **Push-timing invariant instead of tree location** (risk A) | KEPT | The move that unblocks 384 from #341 at zero correctness cost, and the only formulation that is true in all three runtimes. |
| **Outbox outside every worktree** (risk lens, cross-cutting) | KEPT | Only lens to identify that Step 12 destroys artifacts that never merged. Durability that is independent of which tree `BOOK_ROOT` points at. |
| **Surgical patch keeping the 13-step skeleton** (pragmatic B) | REJECTED | Smallest diff, and its own analysis concedes the cost: the numbering stops describing the workflow, the guard-ordering defect survives as a conditional rather than dissolving, and "is the head frozen right now?" stays answerable only by tracing control flow. It preserves the structure whose under-specification is the root cause. |
| **Executable ship kernel, thin workflow** (pragmatic C, optimal B) | REJECTED for now — the intended end state | Best two-year shape and best testability, but it designs function boundaries against semantics still being decided in the same change, and creates two sources of truth plus a version-skew hazard between installed scripts and rendered markdown. The tiered carrier is a strict subset of the path toward it: define the contract, then extract it mechanically. Deferred. |
| **Head-move observer, no explicit Path A** (optimal C) | MERGED — the observation, not the premise | Elegant, and its "classification is an observation, not a forecast" insight is kept as the re-validation trigger. Its premise is rejected: mis-reading a failed `update-branch` as "unchanged" merges a stale base, and it softens a vocabulary humans already agreed on. |
| **Prose rewrite + hole detector as the primary durability** (risk B) | MERGED — as Tier 3, not as the primary | "Derive the expected set from the workflow, never a parallel table" is the decisive idea and is adopted. As the *primary* carrier it fails on mean-time-to-detect: days is not good enough when the worst outcome is an untested head squashed onto `dev`, after which there is nothing to recover. |
| **Remove ship's write access to the branch entirely** (risk C) | REJECTED — partially absorbed | Its premise inverts on the evidence: B2 is the common case, so it concentrates all remaining worktree usage in the path exercised most and tested least, while every other path loses its checkout and diagnosability. Its two best findings — Step 12 ownership scoping and the push-timing reformulation — are absorbed as decisions. |
| **Carry artifacts worktree → dev at Step 9** | REJECTED (pre-existing) | Workaround; moves data across a boundary that should not exist. Superseded by relocating bookkeeping in the first place. |
| **`[force full]` on the squash subject when the base is stale** | REJECTED (pre-existing) | Unnecessary once Path A is *defined* as "base not stale" — the risk is avoided rather than mitigated. |
| **Read-only `origin/feat/{FID}` inspection checkout** | REJECTED (pre-existing) | The shared worktree already has the branch checked out. Ship just needs to stop mutating it. |

## Trade-offs Accepted

**Tiered carriers (chosen) vs one uniform carrier.** We gain a durable, fixture-tested guarantee exactly where failure is unrecoverable, at LOW-MEDIUM complexity, without paying kernel-extraction cost on rules whose failure is cheap. We sacrifice: three surfaces to keep coherent instead of one (script + prose + detector), and a version-skew hazard between an installed `bkit-ship-gate.sh` and a rendered `bkit-ship.md` — a hazard the existing scripts already carry, but which matters more when the function _is_ the merge gate. Mitigated by shipping both through `bkit upgrade` in the same release and by the Tier-2 test asserting the prose calls the gate.

**Structural rewrite (chosen) vs surgical patch.** We gain findings that dissolve rather than accumulate conditionals, and a workflow whose step numbering describes what it does. We sacrifice the smallest-possible diff: a 1244-line file rewritten, four render surfaces regenerated, a larger review surface, and a window during which a half-applied rewrite is worse than either model. Bought back by writing the invariant test first.

**Push-timing invariant (chosen) vs tree-location rule.** We gain independence from #341 for correctness and a rule that holds in all three runtimes. We sacrifice the crisper sentence the issue wanted ("bookkeeping goes to the dev tree from Step 1") and accept that `BOOK_ROOT`'s value is runtime-dependent, so a reader must consult a small table rather than a constant.

**Contract defined now, kernel extracted later.** We gain a decided contract before boundaries are drawn, which makes the eventual extraction mechanical. We sacrifice the ability to unit-test the routing logic in this cycle; it stays prose-with-grep-assertions, which can verify that a rule's text is _present_ but not that a run _honoured_ it. This is a real limit, not a claim of coverage.

**Advisory detector (chosen) vs a gate now.** We gain a signal that will not be muted, on a corpus that is 25–65% holey. We sacrifice enforcement for at least one release, meaning a run with holes still completes silently in the interim.

**Explicit base check (chosen) vs pure observation.** We gain a named, human-legible fork that matches the agreement already reached, and no risk of mis-reading a failed integrate as a no-op. We sacrifice one extra decision point in the narrative and a small amount of the observer's elegance.

## Risks & Open Questions

1. **#341 and 384 both rewrite `bkit-ship.md`, and #341 is build-ready.** WS-8 (deletes `:556`'s `sleep 30` — itself a recorded reversal of "ship is OUT of scope" in `bkit-ci-dispatch-gate-alignment.test.ts`), WS-9 (branch model, all five phases), WS-10 (close-guard kernel), WS-12 (ship close shape C). #341's plan already forbids concurrent workflows on one clone. **Open: which lands first, and does the second re-derive its diff against the first?** This must be answered before either is planned, not discovered at rebase time.
2. **Step 12 destroys a worktree ship no longer owns.** `.worktrees/{FID}` is created by design or plan and shared by all five phases; `worktree remove --force` is safe today only because ship holds the cwd, and "resume read-only" removes exactly that. Scoping it to run-created worktrees is a decision above, but it is the live hazard and should land early rather than as a rewrite side-effect.
3. **The single capstone assertion is only as strong as `ci.yml` keeping `pull_request ⇒ run_level=full`.** A consumer adding `paths-ignore` or a docs-only short-circuit silently converts the load-bearing assertion into a vacuous one, and ship cannot detect it. The capstone-present check catches an absent job; it does not catch a present-but-degraded run. **Open: assert `run_level` explicitly, or publish it as a documented consumer contract?**
4. **`gh` API behaviour under load is unmeasured.** Nothing samples `gh api rate_limit`; secondary limits are per-user and every consumer repo shares one operator PAT, so the ceiling is reached across repos rather than within one. Path B adds a poll loop per ship. The SHA-keyed query and the distinct code-20 verdict are the mitigations; neither has been measured against a real limit.
5. **Dev-lock hold time grows from seconds to CI-run-minutes.** B2 holds the lock while waiting for re-validation, and the acquire deadline is 600s with 900s staleness. Unrelated runs will start expiring against a lock held legitimately. **Open: release the lock across the CI wait and re-acquire, or raise the deadlines?** Neither is obviously right — releasing re-opens the concurrent-staging window the lock exists to close.
6. **The Failure Path can still report success while writing nothing.** Six `2>/dev/null || true` git calls at `:79-82` plus the silenced `rebase --abort`. Any design that relies on the Failure Path to record loss inherits silent no-ops. Removing the silencing is in scope; verifying no path depends on it is not yet done.
7. **Every prose change multiplies across four surfaces** — `.bkit/workflows/bkit-ship.md` → byte-identical `.claude/`, transformed `.cursor/`, `.opencode/`, plus the `workflows.md` step table and the templates-content snapshot. Prose-heavy fixes pay this four times; this is a cost argument for eventually extracting the kernel, and a reason the rewrite should be one pass rather than several.
8. **No rollback story for a shipped workflow change.** Consumers pin `@cbartens/bkit` and receive workflows on `bkit upgrade`; there is no per-workflow revert. If the new gate is wrong, the recovery path for three repos is undefined. Worth answering before it is needed, and it argues for the logged-override escape hatch.
9. **A prose-invariant test verifies presence, not consumption.** The Tier-2 vitest can assert that `bkit-ship.md` contains no `git add -A` and that every status write goes through `BOOK_ROOT`. It cannot assert that a run honoured the rule. Tier 1 closes this for the merge gate only; for Tier 2 the guarantee rests on a real end-to-end ship run.
10. **One of the three evidence repos produces no signal.** `visitfrasercoast-com/.bkit/friction.jsonl` is empty across 57 log dirs and 16 ship runs, with no `docs/failures.jsonl` at all. "No reports from fraser" is not evidence of correctness — for this design, or for the detector validated against its corpus.
11. **bkit's own repo cannot dogfood the fix from its own telemetry.** 0 sweeps across 21 log dirs, and `.bkit/stats.jsonl` holds two ship rows with `parentSha: "HEAD~1"`, `prNumber: null`, `step: "close-gate"` — a step name the workflow does not write. Those are fixtures. Verification depends on consumer-repo runs, which are outside this repo's CI.
