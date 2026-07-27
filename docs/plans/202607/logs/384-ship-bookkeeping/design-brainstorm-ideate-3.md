# Design Brainstorm & Ideas

Lens: Risk premortem — failure modes, scale, time, handover.

The Path A/B shape and "bookkeeping never moves the head" are settled inputs, not open questions. What is still open — and what this lens is for — is **what carries the correctness**. Every one of the seven findings is the same defect class: a load-bearing rule that lives only in prose, that no gate can check, and that each agent resolves differently. The three approaches below differ in which carrier the design bets on: **test it**, **detect it**, or **make it impossible**.

Two facts checked against the worktree that constrain all three:

- `RUNTIME_DEVPUSHES` appears **nowhere in the tree** (`rg` across the full worktree, ignore-files disabled). Comment 2's "easier after 341 lands, because the flag already exists" is not true yet — the flag is unlanded, so any wording conditioned on it is a forward reference to work that has not shipped.
- `.deferred-blocked` is specified at `.bkit/workflows.md:531` and `:751`, cleared at `bkit-ship.md:67`, read at `:114` — and written by nothing, in either the workflow or the subagent prompts. Finding 2 confirmed by search.

---

## Approach A — "Prose has no CI" — extract the merge contract into a tested executable ⭐ Recommended

**Summary.** Move the three load-bearing decisions — base-freshness detection, the head-keyed capstone assertion, and the bookkeeping-target resolution — out of `bkit-ship.md` prose into small shell functions under `.bkit/scripts/` with `.bats` coverage, so `bkit-ship.md` calls a command and branches on an exit code instead of asking an agent to interpret a paragraph.

This is not a novel pattern for this repo. `bkit-counter-bus.sh` + `counter-bus.bats`, `bkit-status-fold.sh`, `bkit-status-route.sh` already exist for exactly this reason: routing and counting logic was too load-bearing to leave in prose. Ship's merge gate is the same class of logic and is the last piece of it still uncovered — `tests/` contains five `.bats` files and not one of them references ship.

### Premortem — 10x scale

**What breaks.** The gate is `gh`-API-bound, and its queries are list-then-filter: Step 6.4 already does `gh run list --branch feat/{FID} --workflow CI --limit 5` and selects by `headSha`. That is latent-broken at 1x and certainly broken at 10x — on a branch with more than five recent runs the target run falls outside the window and the gate reports "no CI run for PR head", which is indistinguishable from the genuine case. Path B adds a poll loop per ship on top. Secondary rate limits are per-user and every consumer repo shares one operator PAT, so the limit is reached across repos, not within one. The serialisation hotspot is `.bkit/.dev.lock`: B2 holds a worktree while waiting for a re-validation run, so lock hold time goes from seconds to CI-run-minutes, and the 600s acquire deadline at `:568` starts expiring on unrelated runs.

**Observability.** Nothing samples `gh api rate_limit`. Worse, the existing message bakes in a misdiagnosis — `:596` prints `query failed (403 = PAT scope)` for any empty result, so a secondary-rate-limit 403 reads as a permissions problem forever.

**Recovery.** Query the run **by SHA** (`gh api /repos/{o}/{r}/actions/runs?head_sha=<sha>`) rather than list-and-filter — the issue's own evidence uses exactly this call, so it is already proven in this codebase's investigation. Backoff with jitter on the poll. Most importantly, make "API error" a **distinct verdict** from "no run at head", so a degraded API can never be read as an unvalidated head, and vice versa.

### Premortem — 6 months later

**What breaks.** The capstone job name drifts. `bkit-tests-check` is hard-coded in `deployments.md`, in `bkit-protect-main.sh`, and would be hard-coded again in the gate — while a `ci-legacy-scaffold-job-names` advisory already exists, meaning consumers on older scaffolds are known to have different job names. Two failure shapes: a permanent FAIL for a consumer whose capstone is named differently, or — far worse — an assertion phrased as "no lane concluded failure" that passes **vacuously** when the capstone is absent from the run entirely.

The undocumented invariant most at risk is the one that makes the whole design work: _green capstone ⇒ every lane ran_ holds only because `ci.yml:111-112` forces `run_level=full` on `pull_request`. A consumer who adds `paths-ignore`, or a docs-only short-circuit, silently converts the single load-bearing assertion into a vacuous one — and ship has no way to detect that it happened. Magic numbers that will lose their provenance: the CI-wait timeout, `--limit 5`, the 900s dev-lock staleness, 600s acquire deadline, `MAX_MERGE_ATTEMPT`.

**Recovery.** Resolve the capstone from one config key (`package.json` `bkit.capstoneJob`, default `bkit-tests-check`) rather than a literal in three files. Assert the capstone is **present** in the run before reading its conclusion — absent must be FAIL, never PASS. Put every timeout and limit in one config file with units in the identifier, matching the `bkit-counter-bus-config.sh` precedent.

### Premortem — on-call at 3am

**Page shape.** Ship failures are agent transcripts, not pages. Under A they become an exit code with a message, which is progress, but the diagnosis still collapses six distinct conditions into two strings at `:596-602`: no run / run pending / run failed / capstone absent / API error / green run at a superseded SHA.

**Diagnosability and the real hazard.** The dangerous 3am action is not a bad script — it is the human overriding the script. The evidence describes the exact trap: run 29454436704 stayed the PR's most recent run while the actual HEAD had never been tested, so _the PR presented as green_. An operator looking at a green PR and a refusing gate will conclude the gate is broken and merge in the UI. That is a merge of untested code to `dev`, arrived at rationally.

**Recovery.** One exit code per condition. Every rejection must print **both SHAs** — the head it required and the head the green run actually tested — plus the run URL, so the green-looking PR is self-refuting on screen. Add a read-only `--explain` mode so an operator can interrogate the gate without starting a ship.

### Premortem — author leaves

**Knowledge concentration.** The chain of reasoning from CI-config facts (`ci.yml:111` full-on-PR, `:602` capstone `needs` all lanes, `:130` light on merged dev pushes, `:19-21` `cancel-in-progress`) to "therefore one assertion is strictly stronger than all of Step 3" exists only in this issue thread. Lose it and the next maintainer does one of two things, both regressions: hardens the gate by re-adding per-lane checks (recreating Step 3), or softens it to `statusCheckRollup` (recreating the stale-green hole).

**Recovery.** The reasoning belongs in `docs/decisions.jsonl` with the discarded alternatives named — `statusCheckRollup`, per-lane re-assertion, `[force full]` escalation on a stale base, carry-to-dev at Step 9 — so a future reader finds the rejected paths before rediscovering them. Then make the test the documentation: bats cases named for the property (`rejects-stale-green-at-superseded-head`, `rejects-run-missing-capstone`) with fixtures captured from real `gh` JSON across the three repos, including the CONFLICTING-zero-runs case from PR #720.

### Risk-mitigation guidance (layer onto A)

- **Land the script and its bats before touching the prose.** The old workflow keeps running while the gate is proven against captured fixtures. This is the direct antidote to `01f8b8d9`, where the worktree model and the head-match gate arrived in one commit and neither was reviewed against the other.
- **Fail closed, but make overrides visible.** A single logged escape (`BKIT_SHIP_GATE_OVERRIDE=<sha>`, recorded as a `status.jsonl` row) is better than a gate that gets bypassed by hand-merging in the UI, which leaves no trace at all.
- **Ship it through `.bkit/scripts/`** so consumers receive it on `bkit upgrade` rather than needing to re-read prose.

---

## Approach B — "Nobody diffs expected against actual" — keep the prose, gate it from the outside

**Summary.** Rewrite `bkit-ship.md` to the A/B shape in prose (the minimal change the issue already specifies) and buy durability from the verification gap instead: a detector that folds each `status.jsonl`, diffs the observed step set against the expected set, and flags runs with holes.

The sharpest version of B is not a hand-written expected-set table — it is **deriving the expected set from `bkit-ship.md` itself**, by parsing the `## … Step N — Name` headings and the `step:"ship-…"` literals inside the fenced blocks. That turns the detector into a test of the prose, which is the cheapest available way to get "prose has CI" without extracting any logic.

### Premortem — 10x scale

**What breaks.** Not throughput — 148 log dirs today, ~1500 at 10x, a fold each, trivially fine. What breaks is **signal**. A detector run against a corpus that is 25–65% holey emits several hundred findings on day one and is muted inside a week. Compounding it, legitimately short runs are indistinguishable from losses unless expectations are path-conditional: Path A skips steps 4–5 by design, a MERGED-on-entry resume skips 3–8 via the route at `:314`, and an aborted run stops at Failure Path step 12.

**Observability.** The deeper problem is that none of the three repos reads its own telemetry today — "All real telemetry lives in consumer repos and nothing reads it." Adding another producer without a consumer repeats the failure being fixed.

**Recovery.** Baseline it as a **delta**, exactly as `slop:delta` already does in this repo to avoid fix-the-world gates: report holes new since a pinned watermark, not holes in aggregate. Declaring expectations per path (A / B1 / B2 / resume / abort) is forced work — and a genuine side benefit, because it makes the design name its paths explicitly rather than leaving them implicit in prose.

### Premortem — 6 months later

**What breaks.** A hand-maintained expected-set table is a second source of truth about step names, living in a different file from the workflow. Finding 7 is precisely this drift signature: agents wrote `ship-resume-human-override` and `ship-post-failure-migration-fix`, names that exist nowhere. Under a table-based B those invented names become CI failures in an unrelated repo, and the cheapest resolution — edit the table to match observed reality — is also the wrong one. The table converges on reality instead of reality converging on the contract.

**Recovery.** Generate the expected set from the workflow markdown; never maintain a parallel table. Then a step rename in the workflow updates the contract atomically, and an invented step name is a real finding rather than a table-maintenance chore.

### Premortem — on-call at 3am

**Page shape.** There is no page. The detector is post-hoc by construction and never fires during a ship. The 3am failure under B is the live one it does not prevent: an agent reads the new prose, resolves a residual ambiguity its own way, and the divergence surfaces days later in a detector report.

**Recovery.** Mean-time-to-detect improves from months to days — real, but this is also the argument against B as the _primary_ carrier. For a workflow whose worst outcome is "merged an untested head to `dev`", days is not good enough, because after the fact there is nothing to recover: the squash has landed and `ci.yml:130-131` gives merged-PR dev pushes only `run_level=light`, so the change never receives full validation at all. Mitigate by keeping exactly one thing executable even under B — the head-keyed capstone assertion — since it is the only assertion whose failure is unrecoverable.

### Premortem — author leaves

**Knowledge concentration.** Lower than A: no new script surface. But two things become tribal — which holes are legitimate path-skips versus real losses, and why the baseline watermark sits where it does. Both live in the head of whoever surveyed the corpus.

**Recovery.** Encode path-conditional expectations as data beside the fixtures, and commit the three repos' historical `status.jsonl` corpus as the fixture set. The issue already notes the test data exists in the consumer repos; capturing it now, while the survey is fresh, is the cheap moment. Once pinned, the detector's behaviour on real holes is a test rather than a memory.

### Risk-mitigation guidance (layer onto B)

- **Advisory first, gate second.** Emit through the existing fail-open advisory channel (`bkit check` / postinstall) for one release, the pattern `bkit comply` already established, then promote once the baseline is clean.
- **Derive, never duplicate.** Expected sets come from `bkit-ship.md`; a parallel table is the drift that produced finding 7.
- **Keep the capstone assertion executable regardless.** It is the one gate whose failure cannot be repaired after the fact.

---

## Approach C — "You cannot violate a rule you cannot express" — remove ship's write access to the branch

**Summary.** Ship never holds a writable checkout of `feat/{FID}` except inside the B2 conflict window: everything else runs from the dev tree plus `gh` API calls, so "bookkeeping never moves the head" stops being a rule an agent must remember and becomes a state that cannot be reached.

### Premortem — 10x scale

**What breaks.** The premise. B2 is treated as the escape hatch, but the evidence says it is the **common** case — long-lived branches accumulate `docs/architecture.md` / `testing.md` / `navigation.md` edits from plan-execute commits and collide on the same lines. So C concentrates all remaining worktree usage in the path that gets exercised most and tested least, while every other path loses its checkout. On-demand materialisation also re-pays `pnpm install --frozen-lockfile` (`:308`), which at 10x becomes the pole.

The genuinely new hazard is **destruction**. `.worktrees/{FID}` is created by design or plan and resumed by all five phases; ship's `worktree add` fires only on a pruned or cross-machine run. Step 12 currently runs `worktree remove --force`, which is safe today only because ship happens to be the sole occupant while it holds the cwd. The moment ship stops owning that worktree — which both C and Path A's explicit "resume read-only" do — Step 12 is force-removing a workspace another phase may be sitting in.

**Recovery.** Step 12 must remove only a worktree **this run created**, or not remove at all. This is not optional under C, and as noted below it is a risk in every approach.

### Premortem — 6 months later

**What breaks.** C hard-codes the assumption that the runtime can write the main checkout — the exact assumption comment 2 identifies as false for cloud runtimes, and `RUNTIME_DEVPUSHES` is not in the tree. So C either blocks on #341 or has to invent the flag itself, and inventing it re-opens the byte-identical local-path question #341 just closed. Six months on, a cloud-run ship silently writes bookkeeping somewhere else and the hole detector, if it exists, reads that as loss.

**Recovery.** State the invariant as **push timing**, not tree location: _no bookkeeping commit reaches `origin/feat/{FID}` before the merge_. That is true in both runtimes, needs no flag, and demotes location to a runtime detail — which unblocks 384 from #341 entirely. Pair it with a durable outbox outside every worktree (`$GIT_COMMON_DIR/bkit-outbox/{FID}/`) so a local-only run's artifacts survive Step 12's removal, which is the loss mechanism finding 6 describes.

### Premortem — on-call at 3am

**Page shape.** An API-only ship leaves no local evidence. When `gh pr merge` returns something ambiguous, there is no checkout to inspect, no `git log` to read, and the operator's first instinct — `cd` into the worktree and look — no longer works. Diagnosability is strictly worse than today.

**Recovery.** Write a pre-merge snapshot to the outbox before the merge fires: PR head SHA, `origin/dev` SHA, the `merge-base --is-ancestor` verdict, the capstone run id and URL, and `mergeable`. That makes a post-mortem possible from the log dir alone. Cheap, and worth layering onto any of the three approaches.

### Premortem — author leaves

**Knowledge concentration.** "Why does ship have no worktree?" is an inviting question with a convenient wrong answer. Capability removal that is not asserted is a temporary property — the next maintainer adds a checkout back for a good local reason and the invariant silently dies.

**Recovery.** Assert the absence mechanically: a test that greps `bkit-ship.md` for `git commit` / `git push` outside the B2 block. Same trick as B's prose-parsing, applied to a different property, and it is the only thing that makes a removed capability stay removed.

### Risk-mitigation guidance (layer onto C)

- **Sequence C after A's gate exists.** C is a big-bang rewrite of the most dangerous workflow in the set; doing it while verification is still prose-only reproduces the `01f8b8d9` pattern.
- **Scope Step 12 to ownership** before anything else changes, since it is the live destruction hazard.
- **Define the invariant as push timing** so #341 is not a blocker and the cloud runtime is covered by construction.

---

## Decisions

<!-- prettier-ignore -->
| Decided | Alternatives | Why |
| --- | --- | --- |
| Primary carrier = tested executable helper (**Approach A**) | Prose-only rewrite (B); post-hoc detector alone; capability removal first (C) | All seven findings are prose-drift defects. The repo already solved this class for routing and counting via `.bkit/scripts/*.sh` + `.bats`; ship's merge gate is the last load-bearing logic left uncovered. A prose fix re-runs the bet that already lost. |
| Merge gate = capstone **present and concluded `success` at the current PR head**, resolved by SHA-keyed query | `statusCheckRollup` (today's Step 2.7 at `:316`); per-lane re-assertion (today's Step 3); `gh run list --limit 5` filter | Rollup is satisfiable by a stale green — evidenced by run 29454436704 presenting green while HEAD was untested. List-and-filter misses under load. Capstone `needs` all lanes with `if: !cancelled()`, so one assertion is strictly stronger than Step 3. "Present" matters as much as "success": absent capstone must FAIL, never pass vacuously. |
| Bookkeeping invariant stated as **push timing**, not tree location | "Dev tree from Step 1" as written; "dev tree when `RUNTIME_DEVPUSHES`, else current branch" | `RUNTIME_DEVPUSHES` does not exist in the tree — verified. Conditioning on it blocks 384 on #341 for no correctness gain. Push-timing is true in both runtimes and makes location a runtime detail. |
| Bookkeeping durability via an outbox outside every worktree | Write to the branch and rely on the merge; write to the dev tree only | Step 12's `worktree remove --force` is the loss mechanism in finding 6. An outbox survives it in both runtimes and is what makes the deferred flush safe. |
| Path B2 dispatch is **unconditional** `gh workflow run` after any head move | Wait-then-dispatch with a timeout fallback | A CONFLICTING PR has no `refs/pull/<n>/merge`, so nothing fires by construction — confirmed on PR #720 with `total_count 0`. A buried `[skip ci]` in branch history poisons dispatch the same way. A timeout only adds latency to a certainty. |
| Finding 2 (`.deferred-blocked` writer) — **in scope** | Split to a follow-up issue | The `rm -f` at `:67` and the read at `:114` are inside the Failure Path this design already rewrites; the writer is two lines. Deferring leaves the sweep's only FAIL route dead at exactly the moment the sweep becomes load-bearing. |
| Verification gap (hole detector) — **in scope as an advisory**, gate deferred | Full gate now; fully deferred | The corpus is 25–65% holey, so a day-one gate is muted within a week. Advisory-first matches the `bkit comply` fail-open rollout. Build it now while the fixture survey is fresh; promote to a gate once the delta baseline is clean. |
| Expected step set **derived from `bkit-ship.md`**, never a parallel table | Hand-maintained table in `workflows.md` | A second source of truth about step names is the drift that produced finding 7; a table converges on observed reality instead of the contract. |
| `ship-*` step keys treated as a **stable schema**; prose renumbering must not rename them | Renumber freely per the issue's "Resulting shape" | Counter-bus, the fold reducer, resume (`:25`), and every historical row key on step names. Renaming breaks in-flight resume across three repos and invalidates the only corpus the detector can be tested against. |
| Issue-body hygiene — **do it** | Leave corrections in comments | Three corrections (general non-firing `pull_request`, `cancel-in-progress` as second justification, B2 as the common case) are load-bearing for the design and currently reachable only by reading five comments in order. |

---

## Cross-Approach Risks

These hold regardless of which approach is chosen, and belong in the final design's `Risks & Open Questions`.

1. **Step 12 destroys a worktree ship no longer owns.** `.worktrees/{FID}` is created by design/plan and shared by all five phases; ship's `worktree add` (`:291-302`) fires only when pruned or cross-machine. `worktree remove --force` is safe today only because ship holds the cwd. Path A's "resume read-only" removes that ownership without removing the force-delete. Scope Step 12 to worktrees this run created, or drop the removal.
2. **`RUNTIME_DEVPUSHES` is unlanded.** Absent from the entire tree. Any wording conditioned on it is a forward reference; the design must either define it or avoid needing it.
3. **`.deferred-blocked` is read and cleared but never written.** Specified at `workflows.md:531`/`:751`, cleared at `bkit-ship.md:67`, read at `:114`. Whichever scope decision lands, the spec and the read must not outlive the missing writer — a dead condition that silently routes a sweep FAIL to a bare STOP is worse than no condition.
4. **The single capstone assertion is only as strong as `ci.yml` keeping `pull_request ⇒ run_level=full`.** A consumer adding `paths-ignore` or a docs-only short-circuit silently makes it vacuous, and ship cannot detect it. Needs a capstone-present assertion plus either a run-level assertion or an explicit, documented consumer contract.
5. **The Failure Path has two independent status-loss mechanisms two lines apart.** `:59-61` writes to the dev tree while Steps 1–8 write the worktree copy, and `:61`→`:62` appends before `git rebase --abort`, which discards the append on a mid-rebase failure. Fix both together — the ordering bug is what hides the evidence of the tree bug.
6. **The Failure Path can report success while writing nothing.** `git rebase --abort 2>/dev/null || true` (`:62`) plus six `2>/dev/null || true` git calls in the dev-commit block (`:79-82`). Any design relying on the Failure Path to record loss inherits silent no-ops — and the observed case where a silenced failed abort left the worktree mid-rebase with a `UU` file and detached HEAD.
7. **Unconditional B2 dispatch is load-bearing, not defensive.** Taking bookkeeping off the branch removes ship's own `[skip ci]` commit at `:261`, but build and debug still write `worktree-setup … [skip ci]` onto `feat/{FID}`. Ship will keep inheriting branches whose history poisons auto-dispatch, so the unconditional dispatch is the only thing that recovers them.
8. **Every prose change multiplies across four surfaces.** `.bkit/workflows/bkit-ship.md` → byte-identical `.claude/commands/bkit-ship.md` + transformed `.cursor/commands/bkit-ship.md`, plus the `workflows.md` step table and the templates-content snapshot. Prose-heavy fixes pay this four times; an executable fix concentrates in one script plus its test.
9. **No rollback story for a shipped workflow change.** Consumers pin `@cbartens/bkit` and receive workflows on `bkit upgrade`; there is no per-workflow revert. If the new ship gate is wrong, the recovery path for three repos is undefined — worth answering explicitly before it is needed.
10. **One of the three evidence repos produces no friction signal.** `visitfrasercoast-com/.bkit/friction.jsonl` is empty across 57 log dirs and 16 ship runs, with no `docs/failures.jsonl` at all. "No reports from fraser" is not evidence of correctness, for this design or for the detector validating against it.
