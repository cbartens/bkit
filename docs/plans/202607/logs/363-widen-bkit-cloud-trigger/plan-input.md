# Plan Input — #363 Route post-merge CI failure to /bkit-debug widen bkit-cloud trigger

**FID:** 363-widen-bkit-cloud-trigger
**Issue:** https://github.com/cbartens/bkit/issues/363
**Title:** Route post-merge CI failure to /bkit-debug widen bkit-cloud trigger
**State:** open
**Labels:** enhancement, bkit:plan
**Milestone:** Workflow Optimisation

---

## Session Prompt

> 363 from comment onwards https://github.com/cbartens/bkit/issues/363#issuecomment-5045381126

The plan scope is defined by the **pivot comment** (5045381126) and the three subsequent decision comments (5112303060, 5112317230, 5112393474). The original issue body below is **superseded history** — the load-bearing decisions are in the comments.

---

## Issue Description (superseded original body — kept for history)

> ⚠️ Design superseded — see the pivot comment.
> The `ship-verify` block-contract design below (post-merge "Verify Deploy" step in `/bkit-ship`) was **abandoned** after a design pass on 2026-07-22. It is preserved as history only.
>
> **Final approach:** reuse the trigger `bkit-cloud` already has. It routes on CI conclusion for the pre-merge feature branch (`workflow_run: [CI], branches: ['feat/**']` → success→ship, failure→debug); we simply **widen that filter to the post-merge branches** so a post-merge CI failure auto-launches `/bkit-debug`. **No `bkit-ship` edit, no ship-verify block, no `MERGE_SHA`, no preflight advisories, no renumber cascade.**

### Superseded original design (ship-verify block contract) — kept for history

## Problem

On merge-to-deploy stacks (Vercel/Netlify/…), a release can **merge green yet the production deployment fail to build, get provider-CANCELED** (e.g. a non-web-affected release commit → Vercel cancels), or never promote. `/bkit-ship` ends at merge + docs with **no check that the resulting deployment reached a terminal-OK state** — so ship reports success while prod silently didn't ship. Symmetrically, `@live`/e2e reds are frequently caused by the deployment (CANCELED/ERROR/not-ready/raced) but present as test failures.

`/bkit-ship` (bkit:managed) has no post-merge deploy verification and no consumer hook to add one without editing a bkit:managed file. `bkit-utility-audit-logs-ship` ("post-deploy smoke check for new errors/regressions") already exists but is **invoked by no workflow** and still hard-codes `audit-gcp-errors.sh` + provider probes.

(The rest of the original body — the full ship-verify block contract, routing, implementation checklist — is **superseded and dropped** per the pivot comment below. See issue body for full historical text.)

---

## Comments (newest-last; pivot comment + decisions are load-bearing)

### Comment 1 — 5043131459 (2026-07-22) — Pre-design pass review

Summary of what #363 is, verified against tree, and a read on the original ship-verify design with four things to settle. **Superseded by the pivot** but documents the evolution.

Key verifications (still relevant):

- `bkit-debug.md` Fetch Context step + `debug-fetch` awk extractor exist — the mirror target was real (for the dropped approach).
- `bkit-utility-audit-logs-ship` exists, invoked by no workflow, still hardcodes `audit-gcp-errors.sh`.
- Line refs in the original checklist drifted; build must re-locate by marker, not line number.

### Comment 2 — 5043182360 (2026-07-22) — Design decisions / open questions

Three items from the pre-design pass:

1. **READY gate is advisory, not a hard Failure Path route — LOCKED.** The deploy-verify no longer hard-STOPs the ship. Ship completes normally; a deploy problem is surfaced as a `FAIL` verdict in the ship summary. **Superseded** by the pivot (no ship edit at all now), but the "advisory not hard-fail" principle carried forward.
2. **Trigger mechanism: event-driven, not in-workflow polling — OPEN.** Recommended direction: ship never blocks; the authoritative deploy verdict + auto-route-to-`/bkit-debug` rides the deploy-conclusion event (#260/#324 substrate). **Became the pivot.**
3. **Acceptance testing happens in consumer repos — NOTE.** bkit ships to npm, not a merge-to-deploy provider, so its own `/bkit-ship` will have zero `ship-verify` blocks → SKIP. The READY-gate happy path is only exercisable on a consumer.

### Comment 3 — 5044493751 (2026-07-22) — Happy-path model + scope fork

Confirmed the happy path: local IDE `/bkit-build` (bkit:auto) → CI(feat) success → cloud SHIP (merge to dev) [exists today] → deploy fires → post-deploy health concludes → healthy = done / broken = cloud DEBUG [the #363/#324 hop].

Raised the scope fork: #363 = ship-side substrate only, OR fold the cloud trigger in too.

---

### ⛏ Comment 4 — 5045381126 (2026-07-22) — **DESIGN PIVOT (supersedes ship-verify approach)**

> This comment records the full design discussion and the **final** decision. It **supersedes** both the original issue body and the earlier "Design decisions" comment's framing. **Net effect: no `bkit-ship` edit at all.**

#### TL;DR

Instead of adding a post-merge "Verify Deploy" step to `/bkit-ship`, we **reuse the trigger bkit already has**. `bkit-cloud` already routes on CI conclusion for the _pre-merge_ feature branch (`workflow_run: [CI], branches: ['feat/**']` → success→ship, failure→debug). We simply **widen that same trigger to the post-merge branches** so a post-merge CI failure auto-launches `/bkit-debug`. No ship-verify block, no `MERGE_SHA`, no preflight advisories, no Step insertion, no renumber cascade.

#### How we got here (discussion trail)

1. **Original design:** add a stack-agnostic `ship-verify` bash-block contract + exit-code READY gate + preflight advisories + a new `bkit-ship` Step 10 with a full renumber cascade. High mechanical risk.
2. **Decision — no hard-fail (D1).** A post-merge STOP that skips docs/cleanup and strands the worktree was the wrong trade. Verdict should be advisory, not a Failure-Path route.
3. **Decision — event-driven, not polling (D2).** An in-workflow synchronous poll blocks the turn and is platform-fragile. We should ride an **event**, not poll.
4. **Key realisation:** `bkit-cloud` _already is_ that event router — it routes on CI conclusion (`success→ship, failure→debug`) for `feat/**`. A **post-merge deploy conclusion is the symmetric twin** of the pre-merge CI conclusion.
5. **"Do we even need the deploy signal separately?"** Checked the consumer CI: `ci.yml`'s `bkit-tests-e2e` lane already runs an **"Await Vercel Deployment"** step + e2e against the deploy. So for **web-affecting** changes, deploy health is _already inside the CI conclusion_. A broken/CANCELED web build reds e2e → reds CI. (Docs-only diffs neutralise the await — Vercel cancels those builds; that's an intentional no-deploy, **not** a false green.)
6. **Branch scope (D-final):** verify at **both `dev` (post-merge) and `main` (post dev→main promotion)**. _(Later overridden — see Comment 6: `main` excluded.)_
7. **Not `claude/**`/`cursor/**`:** those are render-target directories / worktree paths, never git branches. bkit names every work branch `feat/{FID}` (or `fix/{FID}`). `fix/**` is a pre-existing routing gap worth folding in.

#### Final architecture

```
TODAY:   build → PR CI → auto → debug OR ship;  ship → merged(dev) → done (post-merge CI ignored)
FUTURE:  build → PR CI → auto → debug OR ship;  ship → merged(dev) → dev CI  → auto → nothing OR debug
```

**The entire change is the trigger filter:**

```diff
  workflow_run:
    workflows: [CI]
-   branches: ['feat/**']
+   branches: ['feat/**', 'fix/**', 'dev', 'main']
    types: [completed]
```

_(Note: Comment 6 below overrides this to exclude `main` — final filter is `['feat/**', 'fix/**', 'dev']`.)_

**Branch-aware routing table (keyed on `head_branch`):**

<!-- prettier-ignore -->
| Trigger | success | failure |
| --- | --- | --- |
| `feat/**` / `fix/**` CI (pre-merge, via `pull_request`) | → **ship** | → debug |
| `dev` CI (post-merge to dev, via `push`) | → nothing | → **debug** |
| `main` CI (post dev→main promotion, via `push`) | → nothing | → **debug** |

_(Comment 6 overrides: `main` is manual/excluded.)_

Mechanism is consistent: pre-merge CI fires via `pull_request` and `workflow_run.branches` matches the PR **head** (`feat/**`/`fix/**`); post-merge CI fires via `push` on `dev`/`main`. Consumer `ci.yml` already runs `push: [main, dev]` + `pull_request: [main, dev]`, so the signal exists on all four.

#### Scope — what's IN

1. **`bkit-cloud.yml`** — widen the `workflow_run` branch filter to `['feat/**', 'fix/**', 'dev', 'main']`. _(→ `['feat/**', 'fix/**', 'dev']` per Comment 6.)_
2. **Branch-aware routing** — `feat/**`/`fix/**` → ship/debug (today); `dev`/`main` → **failure→debug, success→no-op** (post-merge has nothing left to ship).
3. **FID recovery** — on `dev`/`main`, `head_branch` is the base branch, not `feat/{FID}`; bkit-cloud must recover the issue from the merge-commit scope (`feat(363): …`) or the merged PR.
4. **Auto-route marker placement** _(load-bearing — see open items)_ — the free-tier gate requires `bkit [auto route]` in the triggering `head_commit.message`. Today ship stamps the marker on **intermediate `feat/{FID}` commits** and the build close commit — **not** verified on the **PR squash-merge commit** that actually lands on `dev` and triggers post-merge CI. Must be extended to the squash-merge (and any dev→main promotion) commit. _(→ Comment 5 resolves via Option A; Comment 6 removes main.)_

#### Scope — what's DROPPED from the original body

- `bkit-ship` Step 10 "Verify Deploy" + the Steps 10→14 **renumber cascade**.
- The `ship-verify` block contract.
- The two new `bkit-preflight.ts` advisories + tests + slop:delta-zero-findings constraint.
- The ship-verify artifact + `@bkit-ship-summary` surfacing.
- The `ship-verify` Failure-Path sentinel add.

#### Scope — relocated

- **#80 `bkit-utility-audit-logs-ship` migration** is no longer a ship-side judge. The post-deploy log-regression scan naturally lands inside the **triggered `/bkit-debug`** run — its `debug-fetch` context blocks already read logs. Can proceed independently of this change.

#### Open items to settle in design

1. **`[skip ci]` interaction (load-bearing).** Ship's terminal dev commits carry `bkit [skip ci]`. The commit that must trigger post-merge routing is the **PR squash-merge** commit (PR title, no skip) — not the trailing `[skip ci]` status commit. _(→ Resolved by Comment 5 / Option A.)_
2. **Marker on the squash-merge / promotion commit** — extend `AUTO_ROUTE_SUFFIX` onto the commit(s) that land on `dev`/`main`, gated on `bkit:auto`. _(→ Resolved by Comment 5 / Option A.)_
3. **`dev→main` promotion path** — routing on `main` only works if the promotion commit carries the marker. _(→ Resolved by Comment 6: `main` excluded entirely.)_
4. **Loop/concurrency safety** — every `dev`/`main` push evaluates the trigger. _(→ Partially resolved by Comment 7.)_
5. **`health.yml` — keep as-is.**

#### Testing (unchanged from D3)

Exercisable only in a consumer (`app-gether-life` / `visitfrasercoast-com`) — bkit ships to npm and has no merge-to-deploy provider, so its own loop never post-merge-verifies.

#### Relationships (updated)

- **Implements** the "trigger after ship (post-deploy)" entry point of **#324** by extending the existing conclusion-router.
- **#260** — this _is_ the CI-concluded-event substrate, minimally extended to post-merge branches.
- **#80** — audit-logs-ship migration relocated into the triggered debug's `debug-fetch`.
- **#67** — PR-base verification / rollback playbook stays separate.

---

### Comment 5 — 5112303060 (2026-07-29) — **Decision: Option A resolves open items #1 + #2**

Walked the gap with the in-tree state. Two of the four open items from the pivot comment are now decided.

#### Decision: Option A — thread `bkit [auto route]` onto the squash-merge subject

Extend `AUTO_ROUTE_SUFFIX` (currently set at `bkit-ship.md:626` for the intermediate sync merge only) onto the **PR squash-merge subject** authored at Step 6.5 (`bkit-ship.md:634`, `gh pr merge {PR_NUMBER} --squash --subject …`), gated on `bkit:auto` on the issue. Same single marker-gate mechanism then covers `feat/**` and `dev` triggers — no second gate path in `bkit-cloud.yml`.

Rejected alternative: a second `workflow_run` filter on `dev` that derives eligibility from the merged PR's `bkit:auto` label rather than the commit message. Avoids polluting dev squash titles but adds a second gate mechanism and a `gh pr list --base dev --merged` reverse-lookup on every dev push. Not worth the divergence.

#### Resolves open item #2 — marker on the squash-merge / promotion commit

Option A _is_ the answer. The free-tier gate fires post-merge because the squash-merge commit — the one that actually lands on `dev` and triggers post-merge CI — now carries `bkit [auto route]`.

#### Resolves open item #1 — `[skip ci]` interaction (was highest-risk unknown)

De-risked by Option A. The commit that must trigger post-merge routing is the PR squash-merge (PR title + `AUTO_ROUTE_SUFFIX`, **no** `[skip ci]`). The trailing status commit `docs({FID}): ship DONE bkit [skip ci]` lands _after_ the squash-merge and is not HEAD when `workflow_run` fires on the CI run triggered by the squash-merge. `[skip ci]` rides on a different commit and cannot suppress the route. KN-11 ("skip-ci must not be HEAD") is satisfied by construction.

#### Still open for `/bkit-plan`

- **#3 — dev→main promotion path.** _(→ Resolved by Comment 6.)_
- **#4 — loop / concurrency safety.** _(→ Partially resolved by Comment 7.)_

#### Durable record

Option A rationale also captured in `.bkit/cloud.md` Decision log.

---

### Comment 6 — 5112317230 (2026-07-29) — **Constraint: `bkit:auto` is `dev`-only; `main` is always manual**

Walked the hard-stop policy with @cbartens. Locking the scope boundary:

- **`bkit:auto` only ever routes against `dev`.** Pre-merge `feat/**` CI → ship (merges into `dev`), and post-merge `dev` CI failure → debug. Both auto.
- **`main` is never auto-touched.** Dev→main promotion and any merge into `main` always requires explicit human interaction — no auto-route, no `bkit:auto`-gated trigger on `main` CI, no auto debug dispatch from a `main` CI failure.

This matches the existing hard-stop after Ship (production merge needs explicit human approval) — extending automation to `main` would contradict it.

#### Resolves open item #3 — dev→main promotion path

Settled by the constraint above. The final `workflow_run` branch filter widens to **`['feat/**', 'fix/**', 'dev']`** — **`main` is excluded**. No marker-on-promotion-commit problem, because no promotion commit is auto-eligible.

#### Updated branch-aware routing table (FINAL)

<!-- prettier-ignore -->
| Trigger | success | failure |
| --- | --- | --- |
| `feat/**` / `fix/**` CI (pre-merge, via `pull_request`) | → **ship** | → debug |
| `dev` CI (post-merge to dev, via `push`) | → nothing | → **debug** |
| `main` CI (post dev→main promotion) | **manual** | **manual** |

#### Plan scope update for `/bkit-plan`

- `bkit-cloud.yml` branch filter widens to `['feat/**', 'fix/**', 'dev']` — **not** `main`.
- No `AUTO_ROUTE_SUFFIX` threading onto dev→main promotion commits (none eligible).
- Open item **#4 (loop / concurrency safety on dev pushes)** remains the only unresolved design question for the plan pass.

---

### Comment 7 — 5112393474 (2026-07-29) — **Open item #4 split — partial deferral to #397**

Unpacked open item #4 ("loop/concurrency safety on dev pushes") into four sub-risks. One moves to the new dedicated concurrency ticket **#397**; three stay here as #363's responsibility.

<!-- prettier-ignore -->
| Sub-risk | Owner | Note |
| --- | --- | --- |
| Concurrency-key collapse on `dev` (`bkit-auto-dev` group, cancel vs queue semantic) | **#363** | #397 Requirements #3 and "Interaction with #363" explicitly defer the `cancel-in-progress: false` flip back here. The dev-debug "one at a time, **queue not cancel**" intent is the load-bearing decision. |
| Self-triggering / debug-on-debug loop (per-session `MAX_NORMAL_ATTEMPT` resets each new `workflow_run` dispatch) | **#363** | Intrinsic to the dev auto-route path. Needs a cross-session attempt cap per FID (e.g. max N dispatched debug sessions within a window) or the loop can ping-pong until a human notices. |
| Stale-run guard for the no-PR `dev` case | **#363** | `bkit-auto.md:86-92` matches `headSha` against the PR's `headRefOid`; on `dev` there's no PR — FID recovered from merge-commit scope, head compared against dev's current HEAD. Build-time verification rather than policy choice. |
| Cross-surface race (dispatch-debug vs CI-ship on one FID; `bkit-auto-{ISSUE}` vs `bkit-auto-feat/{FID}` groups don't collapse) | **#397** (Gap 2) | Pre-existing, not introduced by #363. |

#### What this means for `/bkit-plan` #363

Plan must still settle, in-session:

1. `cancel-in-progress: false` for dev-triggered `workflow_run` runs (queue semantic).
2. Cross-session debug-loop bound per FID (decision: cap N, or trust per-session caps + operator vigilance).
3. Stale-run guard extension to the no-PR `dev` case (build-time check; verify `bkit-auto.md:86-92` handles the FID-from-merge-commit-scope path).

Cross-surface same-FID arbitration is owned by #397 and is out of scope here.

#### Status update (ALL open items resolved)

- #1 `[skip ci]` interaction — **RESOLVED** (Option A, Comment 5).
- #2 marker on squash-merge / promotion commit — **RESOLVED** (Option A, Comment 5).
- #3 dev→main promotion path — **RESOLVED** (`main` excluded; Comment 6).
- #4 loop/concurrency safety — **PARTIALLY DEFERRED** to #397 (cross-surface race only); three dev-CD-specific sub-risks remain here.

**#363 is ready for `/bkit-plan`.**
