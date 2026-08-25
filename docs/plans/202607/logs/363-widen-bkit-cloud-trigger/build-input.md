# Build Input — 363-widen-bkit-cloud-trigger

## Session Prompt

bkit-build workflow invoked for GitHub issue #363.

## Issue Description (Issue #363)

> ## ⚠️ Design superseded — see the [pivot comment](https://github.com/cbartens/bkit/issues/363#issuecomment-5045381126)
>
> The `ship-verify` block-contract design below (post-merge "Verify Deploy" step in `/bkit-ship`) was **abandoned** after a design pass on 2026-07-22. It is preserved as history only.
>
> **Final approach:** reuse the trigger `bkit-cloud` already has. It routes on CI conclusion for the pre-merge feature branch (`workflow_run: [CI], branches: ['feat/**']` → success→ship, failure→debug); we simply **widen that filter to the post-merge branches** (`['feat/**', 'fix/**', 'dev', 'main']`) so a post-merge CI failure auto-launches `/bkit-debug`. **No `bkit-ship` edit, no ship-verify block, no `MERGE_SHA`, no preflight advisories, no renumber cascade.**
>
> ```
> TODAY:  build → PR CI → auto → debug OR ship;  ship → merged(dev) → done (post-merge CI ignored)
> FUTURE: build → PR CI → auto → debug OR ship;  ship → merged(dev) → dev CI  → auto → nothing OR debug
>                                                       dev→main promo → main CI → auto → nothing OR debug
> ```
>
> Full discussion, final scope (IN / DROPPED / RELOCATED), and the 5 open design items (led by the load-bearing `[skip ci]` / auto-route-marker-on-squash-merge question) are in the **[pivot comment ↗](https://github.com/cbartens/bkit/issues/363#issuecomment-5045381126)**.

---

<details>
<summary><b>Superseded original design</b> (ship-verify block contract) — kept for history</summary>

## Problem

On merge-to-deploy stacks (Vercel/Netlify/…), a release can **merge green yet the production deployment fail to build, get provider-CANCELED** (e.g. a non-web-affected release commit → Vercel cancels), or never promote. `/bkit-ship` ends at merge + docs with **no check that the resulting deployment reached a terminal-OK state** — so ship reports success while prod silently didn't ship. Symmetrically, `@live`/e2e reds are frequently caused by the deployment (CANCELED/ERROR/not-ready/raced) but present as test failures.

`/bkit-ship` (bkit:managed) has no post-merge deploy verification and no consumer hook to add one without editing a bkit:managed file. `bkit-utility-audit-logs-ship` ("post-deploy smoke check for new errors/regressions") already exists but is **invoked by no workflow** and still hard-codes `audit-gcp-errors.sh` + provider probes.

## Decision

Add a **post-merge "Fetch Deploy Context" step** to `/bkit-ship`, structured as a direct mirror of `/bkit-debug` Step 4 "Fetch Context". It is the stack-agnostic substrate #324's after-ship trigger has always needed. Two tiers ride on the same fetched artifact:

1. **Deterministic READY gate (exit-code).** "Did the deploy reach a terminal-OK state" is a _fact_, so it is gated deterministically off the block's **exit code** — bkit never parses the deploy output. `FAIL` → **hard Failure Path**.
2. **Post-deploy log-regression judge (Option B — pulls in #80).** A judge subagent (`bkit-utility-audit-logs-ship`, **migrated off `audit-gcp-errors.sh`** to read the fetched artifact) scans the post-deploy logs for **new error signatures / regressions** → `HEALTHY | DEGRADED | BROKEN` → surface in the ship summary + recommend `/bkit-debug`. Advisory, **never auto-rollback** (per #324).

This lands the deploy-reached-READY gate **and** the post-deploy regression scan in one cycle. The self-healing `→ /bkit-plan → /bkit-build` loop stays deferred to #324.

## Why this stays stack-agnostic

bkit ships the **contract**, never the **check**:

- bkit ships the _plumbing_ — when to run (post-merge, `state = MERGED`), the fetch-context discovery/capture machinery, the exit-code verdict vocabulary, summary-surfacing, Failure-Path routing.
- The consumer supplies the _check_ as a self-contained `<!-- ship-verify:start <name> -->` bash block in `.agents/config.md` **after `<!-- bkit:end -->`** (exactly where `debug-fetch` blocks live) — inlining `vercel inspect $MERGE_SHA … | jq` **or** shelling out to a script it already owns; bkit neither knows nor requires either.
- bkit reads only the **exit code** (fact) and captures **stdout verbatim** as evidence (which may literally say `READY`/`CANCELED` — the consumer's words, never parsed by bkit).
- A stack with no deploy just has zero `ship-verify` blocks → the step **SKIPs with a breadcrumb** and ship proceeds exactly as today.

No consumer edit to any bkit:managed file is required.

## Block contract (`ship-verify`)

- Marker pair `<!-- ship-verify:start <name> -->` / `<!-- ship-verify:end -->`, single fenced `bash` body, **consumer region only** (below `bkit:end`). Name charset `[\w.-]+`. `<!-- ship-verify:none intentional -->` opt-out.
- bkit exports **`MERGE_SHA`** (the squash-merge commit on dev) into each block so the fetch targets the just-merged deployment. The block owns any polling/waiting for the deploy to reach a terminal state — **ship ends at merge; the deploy is async**, so "wait for the deploy to land" lives in the consumer's block, not in bkit.
- **Self-gating / fail-soft:** missing CLI/token → one-line `[ship-verify:<name>] skipped — …` breadcrumb to stderr, `exit 0`.
- **Verdict = exit code, checked breadcrumb-first:** breadcrumb present → `SKIP`; else exit 0 → `PASS`; else → `FAIL`. (The one principled divergence from `debug-fetch`, whose blocks always `exit 0` — justified because this step _gates_ rather than merely _fetches_.)
- **One artifact per source:** stdout (or the breadcrumb) → `docs/plans/{YYYYMM}/logs/{FID}/ship-verify-<name>-{ATTEMPT}.md`, auto-globbed into `@bkit-ship-summary` (its Action Items section already names "deferred deploy verifications" — zero summary-agent change).
- Reuse the existing `<!-- debug-fetch:provision <name> -->` sibling for the cloud-CLI install recipe (no new provision markers).

## Routing

- **READY gate `FAIL`** → **Failure Path** (locked decision). Add `ship-verify` to the abort-handover trigger sentinels (`bkit-ship.md:114`) so a deploy-verify FAIL writes `ship-handover.md` carrying the `ship-verify-*.md` evidence + a "reproduce with `/bkit-debug`" pointer, instead of a **silent STOP**.
  - **Accepted consequence of the hard route:** post-merge STOP skips docs-update / worktree-cleanup / close-workflow; `.worktrees/{FID}` + the `feat/{FID}` branch persist until the operator runs `/bkit-worktree-prune` — call this out in the handover text so it isn't a surprise.
- **Judge `DEGRADED`/`BROKEN`** → advisory: surface in the summary + recommend `/bkit-debug`, **never auto-rollback** (#324). Does not hard-stop the ship. (Confirm during build whether `BROKEN` should escalate to the Failure Path.)

## Implementation checklist

- [ ] `.bkit/workflows/bkit-ship.md` — new Step 10 "Verify Deploy" (fetch-context mirror of `bkit-debug.md:540–557`), inserted after Step 9 "Switch to Dev", guarded `Run only if state = MERGED`. Two parts: (a) fetch + exit-code READY gate; (b) `@bkit-utility-audit-logs-ship` judge over the fetched artifact. Emit a status.jsonl `step:"ship-verify"` record (`parentSha`, verdict, artifacts).
- [ ] **Renumber cascade:** Steps 10→14 shift; `### 🔒 Gate N` labels, status `step:` names, `### Step N` tracker-comment headers, and every `→ Step N` cross-reference.
- [ ] Failure Path: add `ship-verify` sentinel at `bkit-ship.md:114`.
- [ ] `.agents/config.md` + `.bkit/templates/.agents/config.md` — `ship-verify` contract prose (mirror the debug-fetch prose at L15–31) + one **inert** `ship-verify:start vercel-deploy` reference example above `bkit:end` + `ship-verify:none intentional` opt-out.
- [ ] `.bkit/src/bkit-preflight.ts` (+ `.test.ts`) — advisory pair (`ship-verify-source-not-enabled` evidence-gated; `ship-verify-provision-missing`) mirroring the three debug-fetch advisories (`bkit-preflight.ts:371–664`). Must yield **zero** findings on this repo (slop:delta requires a net-new rule to find nothing on base).
- [ ] **#80 migration:** refactor `bkit-utility-audit-logs-ship` (`.bkit/prompts/bkit-utility-audit-logs-ship.md`) to **drop the `audit-gcp-errors.sh` dependency** and read the fetched `ship-verify-*.md` artifact instead; keep the `HEALTHY | DEGRADED | BROKEN` verdict; regen mirrors. (Guard the gether-life false-green datapoint in #80 comment `4954947485`: a retired-but-still-referenced log source must read `N/A — not configured`, not a clean bill.)
- [ ] `.bkit/workflows.md` — Step spec (mirror the debug-fetch prose at L691) + overview-table row / step-number fixes.
- [ ] `docs/deployments.md` (or `docs/observability.md`) pointer + `.agents/docs.md` index row. No duplication.
- [ ] Mirror regen (`pnpm bkit upgrade`, batched end-of-session) → `.claude`/`.cursor`/`.opencode`; bump `.bkit/version` + `package.json`; CHANGELOG entry. Verify **install and upgrade** live (dogfood).
- [ ] ASCII operators only (`!=` `>=` `<=`) in `.bkit/workflows|prompts/*.md`.

## Acceptance

- `/bkit-ship` surfaces a post-merge deploy verdict in its summary and routes a non-READY deploy into the Failure Path — with **no** consumer edit to any bkit:managed file.
- Fail-soft + self-gating (missing token/CLI → SKIP with breadcrumb), matching `debug-fetch`.
- Tool-agnostic — no hard-coded Vercel in bkit's shipped surface; the consumer supplies the check via a `ship-verify` block.
- Post-deploy log-regression judge (`audit-logs-ship`, migrated off the GCP script) surfaces `HEALTHY | DEGRADED | BROKEN` and recommends `/bkit-debug` on non-HEALTHY, never auto-rollback.

## Relationships

- Implements the **"trigger after ship (post-deploy)"** entry point from **#324** (the self-healing `→ /bkit-plan → /bkit-build` loop stays in #324).
- Pulls in the `bkit-utility-audit-logs-ship` migration from **#80** (retire `audit-gcp-errors.sh` → read the stack-agnostic fetched artifact).
- Related: **#67** (PR-base verification + rollback playbook), **#260** (post-merge / CI-concluded event substrate).

**Consumer already owns — do NOT build into bkit:** `scripts/ci/vercel-deploy-status.sh <sha>`, the pre-merge "Await Vercel Deployment" CI gate, and the out-of-band `health.yml` post-deploy gate.

</details>

## Issue Comments

### Comment 5043131459 (cbartens)

## What #363 is

**Fresh, unstarted** — open, `enhancement`, milestone _Workflow Optimisation_, no comments, no branch, no plan yet.

It adds a **post-merge "Verify Deploy" step** to `/bkit-ship` that catches the "merged green but prod deploy failed/CANCELED/never promoted" gap. Two tiers on one fetched artifact:

1. **Deterministic READY gate** — bkit runs a consumer-supplied `ship-verify` bash block and reads **only its exit code** (never parses output). `FAIL` → hard Failure Path.
2. **Log-regression judge** — `bkit-utility-audit-logs-ship` scans post-deploy logs → `HEALTHY|DEGRADED|BROKEN`, advisory, recommends `/bkit-debug`, never auto-rollback.

It's a deliberate mirror of `/bkit-debug`'s "Fetch Context" step, reusing the same `<!-- ...:start <name> -->` marker machinery below `bkit:end`, and it finally wires in the #80 `audit-logs-ship` migration (off `audit-gcp-errors.sh`).

## Verified against the tree

- ✅ `bkit-debug.md:538` Fetch Context step + the `debug-fetch` awk extractor exist — the mirror target is real.
- ✅ Preflight advisory machinery exists (`.bkit/src/bkit-preflight.ts:371+`, the `debug-fetch` opt-out/advisory pair) — the "add a symmetric `ship-verify` advisory pair" ask has a concrete template.
- ✅ `bkit-utility-audit-logs-ship` exists, **invoked by no workflow**, still hardcodes `audit-gcp-errors.sh` (`.bkit/prompts.md:318` + the prompt file) — exactly as the issue claims.
- ⚠️ **Line refs have drifted.** `bkit-ship.md:114` and `bkit-debug.md:540–557` are approximate now (Fetch Context is `:538`; ship's Failure-Path sentinel logic is ~`:114` but shifts). Build must re-locate by marker, not line number.

## My read — sound design, four things to settle first

The core is genuinely good: exit-code-only gating keeps bkit stack-agnostic and consistent with the existing debug-fetch doctrine; the fail-soft/SKIP-with-breadcrumb behaviour matches precedent; folding in #80 is real cleanup. I'd greenlight the _direction_. But before design/plan:

1. **The hard-FAIL consequence deserves a second look.** A non-READY deploy STOPs _after_ merge, skipping docs-update / worktree-cleanup / close-workflow, leaving `.worktrees/{FID}` + `feat/{FID}` until a manual prune. The merge already landed — the failure is a _prod_ problem, but the penalty falls on _local_ cleanup. Is leaving a worktree behind on every flaky/CANCELED deploy the right trade, or should cleanup still run and only the handover/summary carry the red? The issue locks "hard route" but leaves BROKEN-escalation open — worth deciding both together.

2. **Async timeout contract.** "Ship ends at merge; the consumer block owns polling." Clean, but it means ship now blocks on an arbitrary consumer poll loop at the very end with **no bkit-side timeout**. If the deploy never starts, ship hangs. I'd want bkit to wrap the block in a bounded timeout (→ SKIP/FAIL breadcrumb) rather than trust every consumer block to self-bound.

3. **bkit can't dogfood the happy path.** bkit ships to npm, not a merge-to-deploy provider — its own `/bkit-ship` will have zero `ship-verify` blocks → SKIP. The real READY-gate + judge path is only exercisable on a consumer (gether-life / visitfrasercoast). Plan the acceptance check to run there, not just `bkit check`/install-upgrade in-repo.

4. **Scope is large for one cycle.** Step insertion **+ full renumber cascade** (every `### Step N`, `🔒 Gate N`, status `step:` name, tracker header, `→ Step N` ref — and the cascade is bigger than the checklist's "10→14"; ship runs to Gate 13) **+** two preflight advisories with slop:delta-zero-findings constraint **+** the #80 agent migration **+** template/config/workflows.md/docs/mirror/version/changelog. The renumber alone is error-prone. Consider splitting the #80 `audit-logs-ship` migration out, or at least sequence it as its own batch.

Net: **yes, it sounds right** — the mechanism is well-thought-out and consistent with existing patterns. I'd resolve #1 and #2 as explicit decisions in the design phase rather than deferring to "confirm during build," and go in expecting the renumber cascade to be the risky part.

Want me to kick off `/bkit-design` on it, or draft the two open decisions (FAIL-cleanup + async timeout) as a comment on the issue first?

### Comment 5043182360 (cbartens)

## Design decisions / open questions (2026-07-22)

Walkthrough review with @cbartens. Three items from the pre-design pass:

### 1. READY gate is **advisory**, not a hard Failure Path route — LOCKED

**Supersedes the "Routing → READY gate `FAIL` → Failure Path" section of the issue.**

The deploy-verify no longer hard-STOPs the ship. Ship **completes normally** (docs-update, worktree-cleanup, close-workflow all run) and a deploy problem is surfaced as a **`FAIL` verdict in the ship summary** — i.e. the ship's overall verdict goes `FAIL` when the deploy has issues, but there is no post-merge abort-handover.

Rationale: the merge has already landed, so the failure is a _prod-deploy_ problem; penalising _local_ cleanup (leaving `.worktrees/{FID}` + `feat/{FID}` behind for a manual prune) was the wrong trade. A loud summary verdict carries the signal without the sharp edge.

Consequences for the checklist:

- **Drop** the `ship-verify` abort-handover sentinel add at `bkit-ship.md:114` and the "Accepted consequence of the hard route" paragraph.
- The exit-code verdict (`SKIP | PASS | FAIL`) still stands — it just feeds the **summary verdict**, not routing.
- Judge `DEGRADED`/`BROKEN` stays advisory as already specified (recommend `/bkit-debug`, never auto-rollback). The "confirm during build whether `BROKEN` escalates to Failure Path" note is resolved: **no escalation** — everything is advisory/summary now.

### 2. Trigger mechanism: **event-driven, not in-workflow polling** — OPEN (recommended direction below)

Question raised: why block the ship turn on a poll at all? Do all runtimes even support it, or just Claude?

Findings:

- **`bkit-cloud` already routes on CI conclusion** (success → ship, failure → debug — per #260). The "async external outcome → route to next workflow" pattern already exists in bkit; deploy-verify should not invent a bespoke poll.
- A **deploy conclusion is the post-merge twin of that pre-merge CI conclusion** (merge → provider build → READY/ERROR mirrors push → CI → pass/fail). Same substrate: deploy-OK → done, deploy-broken → `/bkit-debug`. This is exactly the "trigger after ship (post-deploy)" entry point already cited from #324, and the #260 conclusion-event substrate.
- **In-workflow synchronous polling is platform-fragile:** Claude Code caps Bash at 600s; Cursor/opencode differ. It works "just for Claude," breaks on >10min deploys, and freezes the turn. Wrong durable mechanism.

Recommended direction (combines cleanly with #1 — advisory/summary-only):

- **Ship never blocks.** It captures whatever terminal state exists at merge (or `pending`), records the `ship-verify-*.md` artifact + `MERGE_SHA`, and colors an advisory verdict into the summary.
- The **authoritative** deploy verdict + auto-route-to-`/bkit-debug` rides the **deploy-conclusion event** (#260/#324 substrate), where an event can re-invoke the agent — no poll.
- **Cloud vs local split:** _cloud_ ship (bkit-cloud) gets event-routing for free; _local_ IDE ship has no external re-invoke, so it emits the artifact + `pending`/snapshot verdict and defers the real verdict to the event/health trigger. A consumer that _wants_ its own block to bound-poll may — it owns the block — but bkit neither mandates nor forbids a blocking loop.

**Open:** confirm this direction before design. If accepted, it reframes #363 to ship the fetch-context substrate + exit-code verdict contract + summary surfacing, with the durable auto-route deferred to the #260/#324 conclusion-event substrate rather than a bkit-mandated poll.

### 3. Acceptance testing happens in **consumer repos** — NOTE

bkit ships to npm, not a merge-to-deploy provider, so its own `/bkit-ship` will have zero `ship-verify` blocks → the step SKIPs. The READY-gate + judge happy path is only exercisable on a consumer (gether-life / visitfrasercoast). Plan the live acceptance check there; in-repo validation is limited to SKIP-with-breadcrumb + install/upgrade dogfood + slop:delta-zero-findings on the new advisory pair.

---

Also noted for the build: the checklist's line refs have drifted (`bkit-ship.md:114`, `bkit-debug.md:540-557`, `workflows.md L691`, `bkit-preflight.ts:371-664`) — re-locate by marker, not line number. The renumber cascade is larger than "10→14" (ship runs to Gate 13) and is the highest-risk mechanical part.

### Comment 5044493751 (cbartens)

So it’s really local ide bkit build but with bkit auto label and then have cloud take over and run debug or ship yes? That is happy path yes?

---

Yes — that's the happy path, and the pre-merge half of it already exists exactly like that. Confirmed in bkit-cloud.yml:

Trigger: workflow_run (CI completion on feat/**)
Gate: bkit:auto label + bkit [auto route] marker in the head commit (live kill-switch re-checks bkit:auto)
Route: CI success → ship, CI failure → debug — and ship/debug run in cloud, not local
So your model is right: local IDE /bkit-build stamps the auto-route marker, pushes feat/**, and cloud takes over the routing on CI conclusion. That's live today.

Where #363 fits — it adds the post-merge hop to that same chain:

local /bkit-build (bkit:auto)
→ CI(feat) success → cloud SHIP (merge to dev) ← exists today
→ deploy fires → post-deploy health concludes
→ healthy = done / broken = cloud DEBUG ← the #363/#324 hop
Two precisions so we scope it right:

The auto path kills the poll question entirely. In the happy path ship runs in cloud, so the deploy verdict rides an event — the consumer's post-deploy workflow (the health.yml the issue says the consumer already owns) concludes, and bkit-cloud gains a second trigger that routes broken → debug. No in-workflow poll anywhere. Polling only ever mattered for the manual local-IDE /bkit-ship (the non-auto path), which stays best-effort/pending.
Scope boundary to confirm. That post-deploy → debug auto-route trigger is the "trigger after ship (post-deploy)" entry point the issue says it implements for #324. So there's a fork:
#363 = ship-side substrate only (fetch-context + exit-code verdict + ship-verify-*.md artifact + summary verdict), and the actual bkit-cloud post-deploy trigger lands in #324; or
#363 also wires the bkit-cloud trigger (new workflow_run/deployment_status → route broken→debug), delivering the end-to-end auto path in one cycle.
The issue as written leans option 1 ("self-healing loop stays deferred to #324"). Which do you want — substrate-only in #363, or fold the cloud trigger in too? That's the last open decision, and I'll update the #363 comment to record the happy-path model + whichever scope you pick.

### Comment 5045381126 (cbartens)

## ⛏ Design pivot — supersedes the ship-verify approach (2026-07-22)

> This comment records the full design discussion and the **final** decision. It **supersedes** both the original issue body (the `ship-verify` block-contract design) and the earlier "Design decisions" comment's framing. Those remain above as the evolution trail. **Net effect: no `bkit-ship` edit at all.**

### TL;DR

Instead of adding a post-merge "Verify Deploy" step to `/bkit-ship`, we **reuse the trigger bkit already has**. `bkit-cloud` already routes on CI conclusion for the _pre-merge_ feature branch (`workflow_run: [CI], branches: ['feat/**']` → success→ship, failure→debug). We simply **widen that same trigger to the post-merge branches** so a post-merge CI failure auto-launches `/bkit-debug`. No ship-verify block, no `MERGE_SHA`, no preflight advisories, no Step insertion, no renumber cascade.

### How we got here (discussion trail)

1. **Original design:** add a stack-agnostic `ship-verify` bash-block contract + exit-code READY gate + preflight advisories + a new `bkit-ship` Step 10 with a full renumber cascade. High mechanical risk.
2. **Decision — no hard-fail (D1).** A post-merge STOP that skips docs/cleanup and strands the worktree was the wrong trade (the merge already landed). Verdict should be advisory, not a Failure-Path route.
3. **Decision — event-driven, not polling (D2).** An in-workflow synchronous poll blocks the turn and is platform-fragile (Claude Code caps Bash at 600s; Cursor/opencode differ). We should ride an **event**, not poll.
4. **Key realisation:** `bkit-cloud` _already is_ that event router — it routes on CI conclusion (`success→ship, failure→debug`) for `feat/**`. A **post-merge deploy conclusion is the symmetric twin** of the pre-merge CI conclusion.
5. **"Do we even need the deploy signal separately?"** Checked the consumer CI: `ci.yml`'s `bkit-tests-e2e` lane already runs an **"Await Vercel Deployment"** step + e2e against the deploy. So for **web-affecting** changes, deploy health is _already inside the CI conclusion_. A broken/CANCELED web build reds e2e → reds CI. (Docs-only diffs neutralise the await — Vercel cancels those builds; that's an intentional no-deploy, **not** a false green.)
6. **Branch scope (D-final):** verify at **both `dev` (post-merge) and `main` (post dev→main promotion)** — `main` CI's e2e-await covers the _production_ deploy, folding the prod gap into the same mechanism (no separate `health.yml` trigger required; its live-URL smoke stays as an out-of-band extra).
7. **Not `claude/**`/`cursor/**`:** those are render-target _directories_ / worktree _paths_, never git branches. bkit names every work branch `feat/{FID}` (or `fix/{FID}` for standalone debug) regardless of platform. `fix/**` is a pre-existing routing gap worth folding in.

### Final architecture

```
TODAY:   build → PR CI → auto → debug OR ship;  ship → merged(dev) → done (post-merge CI ignored)
FUTURE:  build → PR CI → auto → debug OR ship;  ship → merged(dev) → dev CI  → auto → nothing OR debug
                                                       dev→main promo → main CI → auto → nothing OR debug
```

**The entire change is the trigger filter:**

```diff
  workflow_run:
    workflows: [CI]
-   branches: ['feat/**']
+   branches: ['feat/**', 'fix/**', 'dev', 'main']
    types: [completed]
```

**Branch-aware routing table (keyed on `head_branch`):**

<!-- prettier-ignore -->
| Trigger | success | failure |
| --- | --- | --- |
| `feat/**` / `fix/**` CI (pre-merge, via `pull_request`) | → **ship** | → debug |
| `dev` CI (post-merge to dev, via `push`) | → nothing | → **debug** |
| `main` CI (post dev→main promotion, via `push`) | → nothing | → **debug** |

Mechanism is consistent: pre-merge CI fires via `pull_request` and `workflow_run.branches` matches the PR **head** (`feat/**`/`fix/**`); post-merge CI fires via `push` on `dev`/`main`. Consumer `ci.yml` already runs `push: [main, dev]` + `pull_request: [main, dev]`, so the signal exists on all four.

### Scope — what's IN

1. **`bkit-cloud.yml`** — widen the `workflow_run` branch filter to `['feat/**', 'fix/**', 'dev', 'main']`.
2. **Branch-aware routing** — `feat/**`/`fix/**` → ship/debug (today); `dev`/`main` → **failure→debug, success→no-op** (post-merge has nothing left to ship).
3. **FID recovery** — on `dev`/`main`, `head_branch` is the base branch, not `feat/{FID}`; bkit-cloud must recover the issue from the merge-commit scope (`feat(363): …`) or the merged PR.
4. **Auto-route marker placement** _(load-bearing — see open items)_ — the free-tier gate requires `bkit [auto route]` in the triggering `head_commit.message`. Today ship stamps the marker on **intermediate `feat/{FID}` commits** (`bkit-ship.md:473`, `:617`) and the build close commit — **not** verified on the **PR squash-merge commit** that actually lands on `dev` and triggers post-merge CI. Must be extended to the squash-merge (and any dev→main promotion) commit.

### Scope — what's DROPPED from the original body

- `bkit-ship` Step 10 "Verify Deploy" + the Steps 10→14 **renumber cascade**.
- The `ship-verify` block contract (`<!-- ship-verify:start … -->`, `MERGE_SHA` export, breadcrumb/verdict rules).
- The two new `bkit-preflight.ts` advisories + tests + slop:delta-zero-findings constraint.
- The ship-verify artifact + `@bkit-ship-summary` surfacing.
- The `ship-verify` Failure-Path sentinel add at `bkit-ship.md:114`.

### Scope — relocated

- **#80 `bkit-utility-audit-logs-ship` migration** is no longer a ship-side judge. The post-deploy log-regression scan naturally lands inside the **triggered `/bkit-debug`** run — its `debug-fetch` context blocks already read logs (matches the "audit moves onto debug-fetch" direction). Can proceed independently of this change.

### Open items to settle in design

1. **`[skip ci]` interaction (load-bearing).** Ship's terminal dev commits carry `bkit [skip ci]` (`docs({FID}): ship DONE bkit [skip ci]`). The commit that must trigger post-merge routing is the **PR squash-merge** commit (PR title, no skip) — not the trailing `[skip ci]` status commit. Confirm the squash-merge run fires and the trailing skip-ci status commit doesn't suppress it (cf. KN-11 "skip-ci must not be HEAD"). This is the highest-risk unknown.
2. **Marker on the squash-merge / promotion commit** — extend `AUTO_ROUTE_SUFFIX` onto the commit(s) that land on `dev`/`main`, gated on `bkit:auto`, so the free-tier gate fires post-merge.
3. **`dev→main` promotion path** — routing on `main` only works if the promotion commit carries the marker. bkit has no consumer-facing dev→main promotion workflow, so confirm where that commit is authored (may be out of bkit's control for some consumers).
4. **Loop/concurrency safety** — every `dev`/`main` push evaluates the trigger; the `bkit [auto route]` marker + live `bkit:auto` kill-switch + FID recovery bound it to opted-in merge commits. Confirm the orchestrator stale-run guard covers the new post-merge fan-in.
5. **`health.yml` — keep as-is.** Its prod live-URL smoke is additive; `main` CI's e2e-await already carries the prod-deploy-READY signal, so bkit-cloud need not route on `health.yml` conclusion. Revisit only if the e2e-await proves insufficient.

### Testing (unchanged from D3)

Exercisable only in a consumer (`app-gether-life` / `visitfrasercoast-com`) — bkit ships to npm and has no merge-to-deploy provider, so its own loop never post-merge-verifies. Both consumers already emit the needed signals (`ci.yml` e2e-await + `health.yml`).

### Relationships (updated)

- **Implements** the "trigger after ship (post-deploy)" entry point of **#324** by extending the existing conclusion-router rather than adding a bespoke gate.
- **#260** — this _is_ the CI-concluded-event substrate, minimally extended to post-merge branches.
- **#80** — audit-logs-ship migration relocated into the triggered debug's `debug-fetch`.
- **#67** — PR-base verification / rollback playbook stays separate.

### Comment 5112303060 (cbartens)

## Decision — Option A resolves open items #1 + #2 (2026-07-29)

Walked the gap with the in-tree state (`bkit-ship.md` Steps 6–8 inline debug, `bkit-cloud.yml:29-32` `workflow_run` filter, `bkit-auto.md:74-75` phase mapping). Two of the four open items from the pivot comment are now decided; #3 and #4 remain for the plan pass.

### Decision: Option A — thread `bkit [auto route]` onto the squash-merge subject

Extend `AUTO_ROUTE_SUFFIX` (currently set at `bkit-ship.md:626` for the intermediate sync merge only) onto the **PR squash-merge subject** authored at Step 6.5 (`bkit-ship.md:634`, `gh pr merge {PR_NUMBER} --squash --subject …`), gated on `bkit:auto` on the issue. Same single marker-gate mechanism then covers `feat/**` and `dev`/`main` triggers — no second gate path in `bkit-cloud.yml`.

Rejected alternative: a second `workflow_run` filter on `dev` that derives eligibility from the merged PR's `bkit:auto` label rather than the commit message. Avoids polluting dev squash titles but adds a second gate mechanism and a `gh pr list --base dev --merged` reverse-lookup on every dev push. Not worth the divergence.

### Resolves open item #2 — marker on the squash-merge / promotion commit

Option A _is_ the answer. The free-tier gate (`bkit-cloud.yml:94, :259`) fires post-merge because the squash-merge commit — the one that actually lands on `dev` and triggers post-merge CI — now carries `bkit [auto route]`. Same applies to any dev→main promotion commit bkit authors.

### Resolves open item #1 — `[skip ci]` interaction (was highest-risk unknown)

De-risked by Option A. The commit that must trigger post-merge routing is the PR squash-merge (PR title + `AUTO_ROUTE_SUFFIX`, **no** `[skip ci]`). The trailing status commit `docs({FID}): ship DONE bkit [skip ci]` (`bkit-ship.md` Close) lands _after_ the squash-merge and is not HEAD when `workflow_run` fires on the CI run triggered by the squash-merge. `[skip ci]` rides on a different commit and cannot suppress the route. KN-11 ("skip-ci must not be HEAD") is satisfied by construction.

### Still open for `/bkit-plan`

- **#3 — dev→main promotion path.** Routing on `main` only works if the promotion commit carries the marker; bkit has no consumer-facing dev→main promotion workflow today, so the commit may be authored outside bkit's control for some consumers. Plan must decide: scope to `dev` only, or document a consumer-side marker requirement for `main`.
- **#4 — loop / concurrency safety.** Every `dev`/`main` push evaluates the trigger. The `bkit [auto route]` marker + live `bkit:auto` kill-switch + FID recovery bound it to opted-in merge commits; plan must confirm the orchestrator stale-run guard covers the new post-merge fan-in (multiple merge-attempts on the same FID within the CI window).

### Durable record

Option A rationale also captured in `.bkit/cloud.md` Decision log (ships with the repo, survives this thread).

### Next step

`/bkit-plan` #363 — design is settled on the load-bearing items; plan surfaces #3 and #4 as scoped decisions.

### Comment 5112317230 (cbartens)

## Constraint — `bkit:auto` is `dev`-only; `main` is always manual (2026-07-29)

Walked the hard-stop policy with @cbartens. Locking the scope boundary:

- **`bkit:auto` only ever routes against `dev`.** Pre-merge `feat/**` CI → ship (merges into `dev`), and post-merge `dev` CI failure → debug. Both auto.
- **`main` is never auto-touched.** Dev→main promotion and any merge into `main` always requires explicit human interaction — no auto-route, no `bkit:auto`-gated trigger on `main` CI, no auto debug dispatch from a `main` CI failure.

This matches the existing hard-stop after Ship (production merge needs explicit human approval, per `.bkit/comparison.md:124`) — extending automation to `main` would contradict it.

### Resolves open item #3 — dev→main promotion path

Settled by the constraint above. The final `workflow_run` branch filter widens to **`['feat/**', 'fix/**', 'dev']`** — **`main` is excluded**. No marker-on-promotion-commit problem, because no promotion commit is auto-eligible. Open item #3's "may be out of bkit's control for some consumers" concern is moot: bkit declines to automate that path at all.

### Updated branch-aware routing table

<!-- prettier-ignore -->
| Trigger | success | failure |
| --- | --- | --- |
| `feat/**` / `fix/**` CI (pre-merge, via `pull_request`) | → **ship** | → debug |
| `dev` CI (post-merge to dev, via `push`) | → nothing | → **debug** |
| `main` CI (post dev→main promotion) | **manual** | **manual** |

### Plan scope update for `/bkit-plan`

- `bkit-cloud.yml` branch filter widens to `['feat/**', 'fix/**', 'dev']` — **not** `main`.
- No `AUTO_ROUTE_SUFFIX` threading onto dev→main promotion commits (none eligible).
- Open item **#4 (loop / concurrency safety on dev pushes)** remains the only unresolved design question for the plan pass.

### Comment 5112393474 (cbartens)

## Open item #4 split — partial deferral to #397 (2026-07-29)

Unpacked open item #4 ("loop/concurrency safety on dev pushes") into four sub-risks during the scope conversation. One moves to the new dedicated concurrency ticket **#397**; three stay here as #363's responsibility.

<!-- prettier-ignore -->
| Sub-risk | Owner | Note |
| --- | --- | --- |
| Concurrency-key collapse on `dev` (`bkit-auto-dev` group, cancel vs queue semantic) | **#363** | #397 Requirements #3 and "Interaction with #363" explicitly defer the `cancel-in-progress: false` flip back here. The dev-debug "one at a time, **queue not cancel**" intent from the constraint comment above is the load-bearing decision. |
| Self-triggering / debug-on-debug loop (per-session `MAX_NORMAL_ATTEMPT` resets each new `workflow_run` dispatch) | **#363** | Intrinsic to the dev auto-route path — doesn't apply to other phases. Needs a cross-session attempt cap per FID (e.g. max N dispatched debug sessions within a window) or the loop can ping-pong until a human notices. |
| Stale-run guard for the no-PR `dev` case | **#363** | `bkit-auto.md:86-92` matches `headSha` against the PR's `headRefOid`; on `dev` there's no PR — FID recovered from merge-commit scope, head compared against dev's current HEAD. Build-time verification rather than policy choice, but worth flagging so the planner doesn't assume the existing guard covers it unchanged. |
| Cross-surface race (dispatch-debug vs CI-ship on one FID; `bkit-auto-{ISSUE}` vs `bkit-auto-feat/{FID}` groups don't collapse) | **#397** (Gap 2) | Pre-existing, not introduced by #363. |

### What this means for `/bkit-plan` #363

Plan must still settle, in-session:

1. `cancel-in-progress: false` for dev-triggered `workflow_run` runs (queue semantic).
2. Cross-session debug-loop bound per FID (decision: cap N, or trust per-session caps + operator vigilance).
3. Stale-run guard extension to the no-PR `dev` case (build-time check; verify `bkit-auto.md:86-92` handles the FID-from-merge-commit-scope path).

Cross-surface same-FID arbitration is owned by #397 and is out of scope here.

### Status update

Open items from the pivot comment:

- #1 `[skip ci]` interaction — **RESOLVED** (Option A, comment above).
- #2 marker on squash-merge / promotion commit — **RESOLVED** (Option A, comment above).
- #3 dev→main promotion path — **RESOLVED** (`main` excluded from auto entirely; comment above).
- #4 loop/concurrency safety — **PARTIALLY DEFERRED** to #397 (cross-surface race only); three dev-CD-specific sub-risks remain here.

#363 is ready for `/bkit-plan`.

### Comment 5112417953 (cbartens)

```comment
## Plan Workflow
### Step 1 — Start Workflow
[cbartens/bkit/tree/dev](https://github.com/cbartens/bkit/tree/dev)
Parent design: None
```

### Comment 5112431765 (cbartens)

```comment
### Step 2 — Worktree Setup
[cbartens/bkit/tree/dev](https://github.com/cbartens/bkit/tree/dev)
[docs/plans/202607/logs/363-widen-bkit-cloud-trigger/status.jsonl](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/363-widen-bkit-cloud-trigger/status.jsonl)
```

### Comment 5112520026 (cbartens)

```comment
### Step 3 — Generate Plan
[plan-v1-draft.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/363-widen-bkit-cloud-trigger/plan-v1-draft.md)
```

### Comment 5112529120 (cbartens)

```comment
### Step 4 — Fetch Context
[related-issues.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/363-widen-bkit-cloud-trigger/related-issues.md)
[related-deferrals.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/363-widen-bkit-cloud-trigger/related-deferrals.md)
[related-failures.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/363-widen-bkit-cloud-trigger/related-failures.md)
```

### Comment 5112740542 (cbartens)

```comment
### Step 5 — Review Plan - Verdict: FAIL - Failures: 9
```

### Comment 5112895334 (cbartens)

```comment
### Step 6 — Apply Review - Verdict: PASS
[plan-v2-reviewed.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/363-widen-bkit-cloud-trigger/plan-v2-reviewed.md)
```

### Comment 5112937782 (cbartens)

```comment
### Step 7 — Scope Check - Verdict: CONCERNS - Failures: 3
```

### Comment 5113011458 (cbartens)

```comment
### Step 8 — Apply Scope - Verdict: PASS
[plan-v3-checked.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/363-widen-bkit-cloud-trigger/plan-v3-checked.md)
```

### Comment 5113032503 (cbartens)

```comment
### Step 9 — Complexity Check - Verdict: SINGLE
```

### Comment 5113113734 (cbartens)

```comment
### Step 11 — Summary - Verdict: PASS
[plan-summary.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/363-widen-bkit-cloud-trigger/plan-summary.md)
Verdict: PASS
<!-- verdict:end -->

# Build Summary

## Overview

This plan widens `bkit-cloud.yml`'s `workflow_run` trigger from `['feat/**']` to `['feat/**', 'fix/**', 'dev']` and adds branch-aware routing that automatically dispatches `/bkit-debug` for post-merge `dev` CI failures. The feature addresses the post-merge blind spot where a squash-merge re-introduces a failure (merge conflict resolution gone wrong, dependency only resolved on PR head, env difference) — previously, bkit was blind to these until an operator noticed and manually invoked `/bkit-debug`.

The design follows Option A: the existing free-tier gate (`bkit [auto route]` marker in HEAD commit message) is threaded onto the squash-merge `--subject` by `bkit-ship` when the issue carries `bkit:auto`. No second gate path. The dev path differs from `feat/**` in three ways addressed here: (1) no open PR → FID recovered from squash-merge commit scope, (2) success is no-op not ship, (3) cross-session loop bound via `MAX_DEV_DISPATCH_ATTEMPTS=3`. Production `main` branch remains manual-only.

## Implementation Quality

**Verifies against plan-v3-checked.md:** The plan underwent a 4-gate stress-test before approval:

- **Generate → Review (FAIL):** plan-review-1 raised 8 buildability blockers (undefined `$REPO_ROOT`, task ordering, injection safety, dead CI_DEV signal) → all addressed in v2
- **Apply Review → Review (CONCERNS):** plan-review-2 found no CRITICAL issues; verified dependency graph and single-owner surfaces
- **Scope Check (CONCERNS):** plan-scope-check-1 found 3 non-blocking verification gaps (negative criterion unobservable, criterion/verification strength mismatch, disjunctive file target) → all addressed in v3
- **Apply Scope → Complexity Check (SINGLE):** plan-complexity-check confirmed the 10 tasks (9 canonical files, ~130 lines code) fit a single build session with linear dependencies

**Architecture respected:** The plan preserves `feat/**` routing byte-for-byte; `fix/**` is newly folded (now follows same success→ship/failure→debug routing as `feat/**`). `bkit-debug.md` is zero-diff (verify-only) — the existing 3-way worktree fallback already creates `fix/{FID}` off `origin/dev`. No new trust markers, no new permissions.

## Verification Status

All gates passed. The plan went through **3 review iterations** before reaching v3-checked:

- Review 1 (8 findings) → Apply Review → Review 2 (no CRITICAL, 12 HIGH/MEDIUM/LOW findings on dependencies and documentation) → Apply Scope → Scope Check 1 (3 findings) → Apply Scope → Complexity Check (SINGLE, approved)
- Total findings addressed: 23 (8 from review-1, 12 from review-2, 3 from scope-check-1)

## Test Status

In-repo validation passes first run. The plan includes a 12-row test matrix (T1-T12) covering trigger presence, concurrency expression, FID recovery, routing logic, loop cap, CI_DEV mode, bkit-auto gates, and verification steps. Consumer-repo acceptance is documented (exercisable only on merge-to-deploy consumers like `app-gether-life` / `visitfrasercoast-com` — bkit ships to npm).

## Challenge

The plan's 3 review cycles surfaced and resolved several critical gaps:

- **H1 (HIGH):** `dev-dispatch` counter row had no CI_DEV signal in `/bkit-debug` → loop cap would be non-functional. Resolved by moving the write to the cloud ctx step (reader and writer co-located).
- **F1 (CRITICAL):** Stale-run guard (git-tip comparison) false-positives on every legitimate dev dispatch due to close-commit race. Resolved by adopting Option A guard (CI-run recency via `gh run list --branch dev --workflow CI --status completed`).
- **F3 (LOW):** `dev-dispatch` counter written after dispatch → early crash undercounts. Resolved by writing BEFORE dispatch in the cloud ctx step.

**Severity distribution:** 1 CRITICAL (F1), 3 HIGH (H1, M1, M2), 9 MEDIUM (M3-M11), 10 LOW (L1-L13, F2-F6). All blocking findings addressed; remaining LOW findings (F2 concurrency group collapse, F4 docs-only-diff precondition, F5 `fix/**` folding, F6 telemetry gaps) are documented limitations.

## Generated Tests

The plan includes a comprehensive test matrix (12 entries) with mechanical verification steps (yq, grep, jq, bash units). Edge cases tested: squash-merge without scope, `[skip ci]` close commit, simultaneous dev pushes, stale CI run, FID from merged PR, `bkit:auto` revocation mid-loop, docs-only diff behavior.

## Risks

**Highest-risk areas:**

1. **Ctx-step staleness logic (Option A guard):** Relies on `gh run list` returning the most recent completed CI run on `dev`. If CI workflow name mismatch or permissions issue, guard fails open (proceeds with dispatch) — safer to dispatch than silently skip. Close commits carry `[skip ci]` so they never appear in the list.
2. **GHA concurrency semantics:** With `cancel-in-progress: false` for `dev`, a superseding run is **queued** (not dropped). The operator does NOT need to manually re-trigger — the queued run re-evaluates the loop cap when it starts.
3. **Docs-only-diff invariant:** The dev path assumes consumer `ci.yml` neutralises Vercel-CANCELED builds (not reds them). If a consumer reds on cancel, every docs-only squash-merge false-dispatches and burns cap budget. Documented in `docs/deployments.md` — operator must verify per target.

## Action Items

None. All CRITICAL and HIGH findings addressed. Remaining LOW findings are documented limitations, not blockers.

## Recommended Next Step

```

/bkit-ship 363
Brief: Plan approved for build — widens bkit-cloud trigger to post-merge dev CI with autonomous debug dispatch, 3-attempt loop bound, queue semantic. Passed 4-gate review (23 findings addressed). Complexity=SINGLE fits one build session.

```

```

### Comment 5113368466 (cbartens)

```comment
### Step 12 — Close Workflow
#### Artifacts
- [363-widen-bkit-cloud-trigger-plan.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/363-widen-bkit-cloud-trigger-plan.md)
- [plan-v3-checked.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/363-widen-bkit-cloud-trigger/plan-v3-checked.md) (final)
- [plan-v2-reviewed.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/363-widen-bkit-cloud-trigger/plan-v2-reviewed.md)
- [plan-v1-draft.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/363-widen-bkit-cloud-trigger/plan-v1-draft.md)
- [plan-review-1.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/363-widen-bkit-cloud-trigger/plan-review-1.md)
- [plan-review-2.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/363-widen-bkit-cloud-trigger/plan-review-2.md)
- [plan-review-3.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/363-widen-bkit-cloud-trigger/plan-review-3.md)
- [plan-scope-check-1.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/363-widen-bkit-cloud-trigger/plan-scope-check-1.md)
- [plan-scope-check-2.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/363-widen-bkit-cloud-trigger/plan-scope-check-2.md)
- [plan-complexity-check.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/363-widen-bkit-cloud-trigger/plan-complexity-check.md)
- [plan-summary.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/363-widen-bkit-cloud-trigger/plan-summary.md)
- [plan-input.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/363-widen-bkit-cloud-trigger/plan-input.md)

Merged to `dev` via PRs [#398](https://github.com/cbartens/bkit/pull/398) + [#400](https://github.com/cbartens/bkit/pull/400) (close-guard scan: clean; transport: pr).

> Note: the local squash-merge path was blocked by pre-existing uncommitted in-flight #384/#394 work in the dev working tree (a process auto-committed it during hook runs). Pivoted to the documented PR squash-merge fallback, which lands only the plan docs on `origin/dev`. **Local `dev` checkout now diverges from `origin/dev`** (holds those stray in-flight commits unpushed) — run `git fetch && git reset --hard origin/dev` in the main checkout to resync.

#### Telemetry
**plan close** · cbartens/bkit

| metric | this run | med·5 |
| --- | --- | --- |
| durationSeconds | 39794 (11h3m) | — |
| linesChanged | 11406 (+10133/-1273) | — |
| filesChanged | 93 | — |
| taskCount | 92 | — |
| frictionAdded | 0 | — |
| deferralsAdded | 0 | — |
| failuresAdded | 0 | — |
| compliance | 2 pass · 0 fail · 0 n/a (100%) | — |
| attempts | PLAN_ATTEMPT 1 | — |

[363 Route post-merge CI failure to /bkit-debug widen bkit-cloud trigger](https://github.com/cbartens/bkit/issues/363)
```

### Comment 5114028552 (cbartens)

## 🔍 Post-plan review — plan revised to v4 (pre-build)

Reviewed `docs/plans/202607/363-widen-bkit-cloud-trigger-plan.md` before build. **The plan is logically sound in its core design** — Option A (reuse the existing `bkit [auto route]` gate rather than adding a second trust surface), stale-guard Option A (CI-run recency, not a git-tip comparison), and the cross-session dispatch cap are all correct calls, and the v1→v3 review chain resolved its own critiques properly.

But the plan chain ran in a worktree at parent `2ee0da16`, and **`80660ac0` (#384, "restructure bkit-ship.md into Path A/B") landed ten seconds later**, followed by four more fixes to the same file that afternoon. All three plan-reviews, both scope-checks and the complexity-check therefore validated against a tree that no longer exists. Seven defects found; plan updated to v4 (230 insertions), anchors re-verified against `dev @ d87c8641`.

### Blocking

**P1 — CRITICAL: Task 4's premise is void.** v3 stated _"`AUTO_ROUTE_SUFFIX` is already derived on line 626 — no new gate logic … this is the **entire** Option A change."_ #384 deleted every `AUTO_ROUTE_SUFFIX` derivation from `bkit-ship.md`:

```
$ grep -c 'AUTO_ROUTE_SUFFIX' .bkit/workflows/bkit-ship.md
0
```

The variable the whole Option A design hangs off no longer exists, and the squash `--subject` moved 634→**682**. Task 4 rewritten to **add** the derivation (idiom copied from `bkit-build.md:1261`, which still carries it) as well as thread it, with a `grep -c` pre-check that voids the task if the premise shifts a third time.

**P2 — HIGH: the `fix/**` folding was inert.** The plan documents _"cloud auto-merges the fix PR"_ as an intended behaviour change. It cannot occur — three surfaces are `feat/`-only:

1. `bkit-cloud.yml:198` — `sed 's|^feat/||'` is a no-op on `fix/363-…`, and neither fallback alternation then matches (`^[0-9]+` fails on `f`; `^[a-z]+-[0-9]+` needs `fix-363`, we have `fix/363`) → `FID` empty.
2. The PRIMARY path can't rescue it — `bkit-debug.md:1244-1249` creates the fix PR with **no `bkit:issue=` / `bkit:fid=` body markers** (`grep -c 'bkit:fid=' .bkit/workflows/bkit-debug.md` = 0).
3. `bkit-auto.md:118` hard-rejects non-`feat/` branches, and a `fix/**` PR run _is_ `MODE=CI` — so fixing 1+2 alone routes every dispatch into the **Failure Path**, which posts a failure comment and sets `bkit:failed`. Worse than today's silence.

Per the pivot comment's _"`fix/**` is a pre-existing routing gap worth folding in"_, added **Tasks 11 + 12** to make it real rather than dropping it.

**P3 — HIGH: the `fix/**` failure loop is unbounded.** `MAX_DEV_DISPATCH_ATTEMPTS` is gated on `BRANCH = dev`. A `fix/**` CI failure dispatches `/bkit-debug` → fix push re-reds CI → dispatches again: exactly the cross-session loop the cap exists to bound, on the surface this plan newly opens, with no bound. **Task 13** rekeys the cap on the FID and factors it into a `bkit_dev_dispatch_guard` helper called from both post-`feat/**` surfaces. `feat/**` stays uncapped (pre-merge, already bounded by in-session `MAX_DEBUG_ATTEMPT`).

### Non-blocking

**P4 — `main` was silently dropped.** This issue's pivot comment settles branch scope as `['feat/**','fix/**','dev','main']` (D-final: _"verify at **both `dev`… and `main`**"_), with `main` in both the routing table and the diff. The plan moved it to Out of Scope with no deferral row and no note here — and scope-check-2 still certified _"zero silent drops"_.

**Decision: keep `main` excluded, but record it.** The plan's rationale is sound, and this issue's own **open item 3** never resolved the precondition — _"routing on `main` only works if the promotion commit carries the marker. bkit has no consumer-facing dev→main promotion workflow… may be out of bkit's control for some consumers."_ With no bkit-authored promotion commit there is nothing to thread the marker onto, so a `main` trigger would be gated shut by construction for exactly the consumers it targets — dead config plus a live risk of a paid agent dispatching against production trunk. **Task 14** appends the reversal to `docs/deferrals.jsonl`; revisit if a bkit-authored promotion path ever exists.

**P5 — the dev path was GitHub-tracker-only.** Scope regex, slug allowlist and `ISSUE` derivation all assumed `363-slug`. A Linear consumer's `bar-123-slug` fails all three → the dev trigger silently never fires for them, and the fail-safe no-op looks identical to "no marker", so there's no operator signal. Widened to the same alternation the existing `feat/**` fallback already uses.

**P6 — the loop cap failed OPEN.** v3 tolerated a rejected telemetry push with `|| echo "::notice:: … row already on dev; continuing"` and dispatched anyway. That claim only holds for the dual-job race it names — any other non-fast-forward (a concurrent ship close commit, a Renovate merge) also rejects, leaving the row in no durable location while the dispatch proceeds. Every such cycle is uncounted, so the cap never trips and the bound the plan advertises degrades to unbounded paid agent spend. Now retries against a re-fetched `dev`, **verifies the row is on `origin/dev`**, and skips rather than dispatching uncounted. (That verification is also what makes the genuine dual-job race safe.)

**P7 — every `bkit-ship.md` anchor is stale:** 598→647, 634-635→682, 1206→1258, 1211→1261-1265, 610→546, and `--workflow CI` is now `--workflow ci.yml`. Stale-guard switched to the `ci.yml` filename form — fixed by `bkit install`, whereas the workflow display name is consumer-editable free text. `bkit-auto` / `bkit-debug` / `bkit-cloud.yml` anchors were all re-checked and are still correct; only `bkit-ship.md` drifted.

### Recorded, not fixed

- **Non-defects** (so a builder doesn't "correct" them): the `bkit [auto route]` marker becomes permanent `dev` history once on the squash subject — inherent to Option A, since the gate reads `head_commit.message`; and `bkit-ship`'s close commit only reaches `dev` when `RUNTIME_DEVPUSHES = true`, so the "dev's tip is the close commit" narrative isn't universal — but stale-guard Option A reads CI-run recency, never dev's tip, so it holds under both runtimes.
- **Residual risk:** the `dev` concurrency group is `bkit-auto-dev` for _all_ FIDs. With `cancel-in-progress: false` GHA keeps at most one pending run per group, so if FID-A is in-flight and FID-B then FID-C arrive, **FID-B's dispatch is cancelled while pending and never re-fires**. The plan's "operator does NOT need to manually re-trigger" holds only for the newest queued run. FID-level arbitration is #397's; this loses a dispatch rather than corrupting one, so it fails safe.

### Separate regression — not fixed here

#384 didn't just move the `AUTO_ROUTE_SUFFIX` derivation, it **removed the marker re-carry from `bkit-ship.md` entirely**. The Step-4 conflict-resolve commit is now a hard-coded `chore({FID}): conflict-resolve bkit [skip ci]`, and the `chore({FID}): sync dev` merge is gone. But `.bkit/workflows.md:605,1010` still document both as re-carrying `bkit [auto route]`, with the stated reason: _"Re-carry required: gate reads single commit `head_commit.message`; unmarked commit on top buries marker."_ So after a bkit-driven conflict-resolve, the feat-branch HEAD carries no marker and the free-tier gate no longer matches on the re-dispatched CI run — the auto-ship path goes silent for opted-in issues. Shipped doc↔code drift plus a probable functional regression; out of scope for this plan, raising on #384.

---

Plan is **v4 and build-ready** at 14 tasks (was 10) and T1-T17 (was T1-T12). Task ordering is now `1+11+13` → `2+12` → `3`-`7` → `8` → `9`, since Tasks 11/13 edit the same `bkit-cloud.yml` managed block as Task 1 and must land in one pass.

## Plan

Verdict: PASS
<!-- verdict:end -->

<!-- Note: Plans live at `docs/plans/{YYYYMM}/{FID}-plan.md` (canonical month bucket). Logs sit at `docs/plans/{YYYYMM}/logs/{FID}/` and are delete-eligible. -->

<!-- Checked revision (v3). Builds on v2 (which incorporated all blocking/high findings from
     plan-review-1 CONCERNS, plan-review-2 CONCERNS, and plan-review-3 FAIL — see the
     "Review Critique Resolution Index" below). v3 applies the three non-blocking scope-check-1
     findings (F1/F2/F3) plus the scope-check-2 boundary confirmation (PASS — no scope expansion,
     no silent drops). See the "Scope-Check Resolution Index" near the end of this file for a
     finding-by-finding trace. Source references re-verified against the current worktree. -->

<!-- v4 — post-plan review revision (2026-07-29, pre-build). The v1-v3 chain was authored
     against parent SHA 2ee0da16, ten minutes BEFORE #384 (80660ac0) restructured
     `bkit-ship.md` into Path A/B and four follow-up fixes landed on dev. Every
     `bkit-ship.md:NNN` anchor in v3 was therefore stale, and v3's Task 4 premise
     ("AUTO_ROUTE_SUFFIX is already derived on line 626") is now FALSE — #384 deleted the
     variable from `bkit-ship.md` outright. v4 re-verifies every source anchor against dev
     @ d87c8641 and closes seven defects. See the "Post-Plan Review Findings" index at the
     end of this file for the finding-by-finding trace (P1-P7). -->

# Widen bkit-cloud Trigger to Post-Merge dev CI Implementation Plan

> [!CAUTION]
> **CRITICAL:** Do not hallucinate plan execution state.
>
> 1. ALWAYS read this actual `plan.md` file natively via the `read_file` tool _before_ executing any steps.
> 2. NEVER trust system-generated session summaries or previous conversation history to determine what has been completed.
> 3. Your source of truth is EXCLUSIVELY the literal `[x]` vs `[ ]` checkboxes in this physical document. If a box is `[ ]`, it is NOT DONE, regardless of what the conversation context implies.

## Context & Goals

`bkit-cloud.yml`'s `workflow_run` trigger currently fires only on `feat/**` CI completion (pre-merge pull-request CI). When CI goes green on a `feat/{FID}` branch, the cloud orchestrator auto-ships the PR; when it fails, it auto-dispatches `/bkit-debug`. But once that PR squash-merges to `dev`, the `feat/{FID}` branch is deleted and **no cloud trigger fires for post-merge `dev` CI** — if the squash-merge reintroduces a failure (merge conflict resolution gone wrong, a dependency only resolved on the PR head, an env difference), bkit is blind to it. An operator must notice the red `dev` CI run and manually invoke `/bkit-debug`.

This plan **widens the trigger** to `['feat/**', 'fix/**', 'dev']` and adds the branch-aware routing, FID-recovery, concurrency, and loop-bound machinery the `dev` and `fix/**` paths require. `main` is **deliberately excluded** — a documented reversal of the issue's D-final decision, recorded as a deferral (see Out of Scope). The design follows **Option A** from the issue comments: the existing free-tier gate (`bkit [auto route]` HEAD-commit marker, threaded by `bkit-ship` onto the squash-merge `--subject` when the issue carries `bkit:auto`) is reused verbatim for the `dev` path — no second gate, no new trust surface. The `[skip ci]` Close commit that follows the squash merge is unaffected (it never carried the marker, so it never triggered the cloud workflow).

> [!IMPORTANT]
> **P1 — the Option A change point no longer exists (v4).** v3 asserted that `bkit-ship.md` already derives `AUTO_ROUTE_SUFFIX` from the `bkit:auto` label at line 626, so Task 4 was a one-token append. **#384 (80660ac0) deleted that derivation from `bkit-ship.md` entirely** — `grep -c 'AUTO_ROUTE_SUFFIX' .bkit/workflows/bkit-ship.md` now returns 0, and the ship conflict-resolve commit carries a hard-coded `bkit [skip ci]` instead of the conditional marker. Task 4 must therefore **re-introduce** the derivation, not just thread it. The idiom to mirror is `bkit-build.md:1261` / `bkit-debug.md:1262` (`echo "${LABELS:-}" | grep -q 'bkit:auto' && AUTO_ROUTE_SUFFIX=" bkit [auto route]" || true`), which both still carry it. This also means `.bkit/workflows.md:605,1010` — which still document ship's dev-sync / conflict-resolve marker re-carry — are **stale against shipped code**; that drift is a #384 regression, out of scope here, and is raised separately on #363/#384.

The `dev` path differs from the `feat/**` path in three load-bearing ways, all addressed here:

1. **No open PR.** On `dev`, `head_branch=dev` and there is no `feat/{FID}` branch and no PR body to parse for `bkit:issue` / `bkit:fid` markers. FID must be recovered from the **squash-merge commit scope** (`feat(363-widen-bkit-cloud-trigger): ...` — the PR title convention, which the squash `--subject` preserves verbatim).
2. **Success is a no-op, not ship.** On `feat/**`, CI success -> `/bkit-ship` (merge the PR). On `dev`, the merge already happened — CI success means "post-merge regression check passed" and requires no action. Only CI **failure** dispatches `/bkit-debug`.
3. **Cross-session loop bound.** A `dev`-triggered `/bkit-debug` pushes a fix to `dev` via a `fix/{FID}` PR; if that fix fails CI, another `workflow_run` fires, dispatching another `/bkit-debug` — a feedback loop with no natural terminator. Per-session `MAX_NORMAL_ATTEMPT` resets on each dispatch, so it cannot bound the cross-session loop. This plan adds a **`MAX_DEV_DISPATCH_ATTEMPTS` cap** (default 3 distinct failed dev CI SHAs per FID), enforced AND written in the `bkit-cloud.yml` ctx step at the dispatch decision point.

**Success Criteria:**

- `bkit-cloud.yml`'s `workflow_run` trigger fires on `feat/**`, `fix/**`, and `dev` CI completion (never `main`); the existing `feat/**` pre-merge routing (success -> ship, failure -> debug) is preserved for `feat/**` specifically. `fix/**` is a newly-folded surface and requires **three code changes to become functional at all** (P2, below) — it is NOT free.
- `fix/**` routing works end-to-end: the ctx-step FID fallback strips `fix/` as well as `feat/`, `bkit-auto.md` Step 10 accepts a `fix/` branch prefix, and the `fix/**` CI-failure -> debug loop is bounded by the same dispatch cap as `dev` (keyed on the FID, not the branch).
- On `dev` CI **failure**, the cloud orchestrator recovers the FID from the squash-merge commit scope, runs a sound stale-run guard (Option A — CI-run recency, NOT a git-tip comparison), re-checks `bkit:auto` on the issue (kill switch), enforces the `MAX_DEV_DISPATCH_ATTEMPTS` cap, writes the `dev-dispatch` counter row to `status.jsonl` (committed to dev with `[skip ci]` so it persists across runs), and dispatches `/bkit-debug {FID}`. On `dev` CI **success**, the run exits as a no-op (`::notice::`, `skip=true`).
- The free-tier gate (`bkit [auto route]` in `head_commit.message`) admits `dev`-triggered runs by construction — `bkit-ship` threads the marker onto the squash `--subject` when the issue is `bkit:auto`-labeled. No separate gate path.
- Cross-session debug loop on `dev` is bounded: after `MAX_DEV_DISPATCH_ATTEMPTS` (3) distinct failed dev CI SHAs for one FID, subsequent `dev`-CI-fail dispatches exit as no-ops with an operator-review `::notice::`.
- Concurrency on `dev` uses `cancel-in-progress: false` for `head_branch == 'dev'`. Per documented GHA behaviour, a superseding dev run is **queued** (one pending; older pendings are cancelled as newer ones arrive) — it is NOT dropped. The queued run re-evaluates the cap at its ctx step, so the operator does NOT need to manually re-trigger. `feat/**`/`fix/**` keep `cancel-in-progress: true` (latest-wins, current behaviour).
- `bkit-auto.md` accepts a bare FID slug as `{ARG}` (CI_DEV mode) — skips the PR-lookup / PR-OPEN / `feat/`-prefix asserts, sets `BRANCH=dev`, derives `ISSUE_ID` from the FID numeric prefix, omits the actions-link from the start comment (no live PR run to link).
- `bkit-debug.md` requires **no code changes** for the dev path. The existing 3-way worktree fallback at `bkit-debug.md:318-327` already creates `fix/{FID}` off `origin/dev` when `feat/{FID}` is absent (the post-merge condition); `PUSH_MODE=LOCAL` auto-detects at Step 1.6 (no open `fix/{FID}` PR -> LOCAL). The dead `CI_DEV` mode proposed for `bkit-debug` in v1 is dropped entirely — the `dev-dispatch` counter write lives in the cloud ctx step (the component that actually knows `BRANCH=dev`).
- All changes mirrored to `.claude/`, `.cursor/`, `.opencode/`; version bumped 4.10.0 -> 4.11.0; CHANGELOG entry added; `bkit-cloud.yml` consumer mirror regenerated.

**Related Issues:**

- `#363 — Widen bkit-cloud trigger to post-merge dev CI (open)` — this plan.
- `#119 — CI auto-router (cloud dispatch on CI completion)` — established the `workflow_run` trigger; this plan extends its branch filter.
- `#397 — Cross-surface same-FID arbitration` — OUT OF SCOPE here. The cross-surface race (a dispatched build vs the auto-ship it triggers, or two cloud dispatches for the same FID from different trigger surfaces) remains owned by #397's orchestrator-level stale-run guard + status.jsonl lock.
- `#80 — audit-logs-ship migration` — DROPPED from this plan's scope. The `debug-fetch` runtime-log migration lives in the triggered debug's own workflow, independent of the trigger widening.

---

## Acceptance Scenario — HUMAN REVIEW REQUIRED

> [!CAUTION]
> **HUMAN MUST READ AND CONFIRM THIS SECTION.**
> This is the testable contract for the feature. Everything below — implementation, tests, verification — is derived from what you confirm here. If this is wrong, everything downstream is wrong.
>
> **You do NOT need to read the rest of this plan.** Focus here. The agent handles the rest.

### Narrative

A developer ships a `feat/{FID}` PR via `/bkit-ship`; the squash-merge lands on `dev` carrying the `bkit [auto route]` marker (because the issue is `bkit:auto`-labeled). `/bkit-ship` Step 13 then pushes a trailing `docs({FID}): ship DONE bkit [skip ci]` close commit onto `dev` while post-merge CI is still running — so by the time that CI completes, `dev`'s tip is the close commit (not the squash-merge). Post-merge CI on `dev` runs against the squash-merge SHA. If it goes green, nothing happens (the regression check passed). If it goes red, the cloud orchestrator automatically dispatches `/bkit-debug {FID}` — the developer gets an autonomous debug session against the post-merge failure without lifting a finger. If the debug's fix also fails CI, another debug dispatches; after 3 distinct failed dev CI SHAs for the same FID, further dispatches go silent with an operator-review notice.

### Success Criteria

1. `workflow_run` fires on `dev` CI completion (in addition to `feat/**`, `fix/**`); `main` is never a trigger.
2. `dev` CI **failure** -> `/bkit-debug {FID}` dispatched; `dev` CI **success** -> no-op exit (`skip=true`, `::notice::`).
3. FID recovered from squash-merge commit scope (`feat(363-widen-bkit-cloud-trigger): ...`) when no open PR exists; `bkit:auto` re-checked on the issue as kill switch.
4. Free-tier gate admits `dev`-triggered runs via the existing `bkit [auto route]` marker — no second gate path.
5. Cross-session loop bounded at 3 distinct failed dev CI SHAs per FID (`MAX_DEV_DISPATCH_ATTEMPTS`); the cap is checked AND written in the cloud ctx step before dispatch (counter row committed to dev with `[skip ci]` so it survives early `/bkit-debug` crashes).

### Key Edge Cases

- **Squash-merge subject without scope:** A non-conventional commit (manual `git push` to `dev`, or a `chore(...)` scope that doesn't match `{FID}` slug regex) -> FID recovery fails -> fail-safe no-op exit (`::notice::`, `skip=true`). No dispatch, no crash.
- **`[skip ci]` Close commit:** The `docs({FID}): ship DONE bkit [skip ci]` close commit (`bkit-ship.md:1258`) that follows the squash merge carries `[skip ci]` -> CI doesn't run -> no `workflow_run` event. Only the squash-merge commit (which DOES carry `bkit [auto route]` and does NOT carry `[skip ci]`) triggers CI -> the cloud gate matches. No interaction.
- **Two dev pushes fail CI near-simultaneously:** Concurrency group `bkit-auto-dev` with `cancel-in-progress: false` -> the in-flight debug runs to completion; the superseding run is **queued** (GHA queues one pending with `cancel-in-progress: false`; older pendings are cancelled as newer ones arrive). The queued run starts when the in-flight finishes and re-evaluates the cap at its ctx step (which sees the now-incremented `dev-dispatch` count). The operator does NOT need to manually re-trigger.
- **Stale dev CI (Option A guard):** A CI run for an old `dev` SHA completes after a newer feature push has landed. The guard queries the most recent COMPLETED CI run on `dev` via `gh run list --branch dev --workflow ci.yml --status completed`; if that run's `headSha` differs from `workflow_run.head_sha`, the run is stale -> `skip=true`. Close commits carry `[skip ci]` so they never appear in `gh run list` — the most-recent-completed-run head is always a feature/fix commit, which is exactly the staleness signal. (A naive `git rev-parse origin/dev` comparison is unsound: the close commit advances dev's tip during the CI run, guaranteeing a mismatch on every legitimate dispatch — see Review 3 F1.)
- **FID from merged PR (fallback):** If the squash-merge scope is missing/malformed but the merge commit is linked to a PR, recover FID from `gh api repos/$GITHUB_REPOSITORY/commits/$HEAD_SHA/pulls` -> PR body `bkit:fid` marker. Primary path is commit-scope; this is the fallback.
- **`bkit:auto` revoked mid-loop:** Issue label removed between dispatches -> kill switch fires on the next ctx-step label re-check -> `skip=true`. Halts the loop even under the cap.
- **Docs-only diff (Vercel cancel):** The dev path routes `dev CI failure -> /bkit-debug`. This is only correct for docs-only diffs if the consumer's `ci.yml` "Await Vercel Deployment" step neutralises a Vercel-CANCELED build (skip e2e, stay green) rather than red-ing it. If a consumer reds on Vercel-CANCELED, every docs-only squash-merge to dev false-dispatches `/bkit-debug` and burns cap budget. This invariant is asserted in `plan-input.md` and must be manually verified per target consumer (see Task 10).

### Concrete Example

**Role:** bkit consumer repo operator (e.g. `app-gether-life`).
**Starting state:** Issue #142 is `bkit:auto`-labeled. PR #500 (`feat/142-add-auth`) passed pre-merge CI and is about to be squash-merged by `/bkit-ship`.

1. `/bkit-ship` Step 6 squash-merges PR #500 to `dev` with subject `feat(142-add-auth): add OAuth flow (#500) bkit [auto route]` (the `bkit [auto route]` suffix threaded by Step 5 because the issue carries `bkit:auto`).
2. `/bkit-ship` Step 13 commits `docs(142-add-auth): ship DONE bkit [skip ci]` and pushes it to `dev` (`bkit-ship.md:1258,1261-1265`) — no CI, no cloud trigger. `dev`'s tip is now this close commit.
3. Post-merge CI runs on `dev` against the squash-merge SHA (triggered by the Step 6 push). It **fails** (a post-merge-only integration test broke).
4. `workflow_run` fires. The gate matches (`bkit [auto route]` is in the squash-merge subject). The ctx step: `BRANCH=dev` -> dev path -> `CONCLUSION=failure` -> `PHASE=debug`. FID from commit scope `142-add-auth` -> `ISSUE=142`. Stale-run guard (Option A): `gh run list --branch dev --workflow ci.yml --status completed` -> most-recent completed run's headSha == the squash-merge SHA == `workflow_run.head_sha` -> not stale. Loop cap: distinct `dev-dispatch` headSha count for `142-add-auth` = 0 < 3 -> proceed. Kill switch: `bkit:auto` still on #142 -> proceed. Write `dev-dispatch` row (headSha = squash-merge SHA), commit `docs(142-add-auth): dev-dispatch telemetry [skip ci]`, push to dev. Set `phase=debug arg=142-add-auth`.
5. Dispatch `/bkit-auto debug 142-add-auth`. `bkit-auto` Step 1.5: `ARG=142-add-auth` (non-numeric) -> `MODE=CI_DEV`, `FID=142-add-auth`, `ISSUE_ID=142`, `BRANCH=dev`. Steps 6-10 gated on `MODE=CI` (skipped). Dispatch `/bkit-debug 142-add-auth`.
6. `bkit-debug` Step 2 worktree: existing 3-way fallback (`bkit-debug.md:318-327`) — `feat/142-add-auth` absent remotely (deleted on squash-merge) -> create `fix/142-add-auth` off `origin/dev`. Step 1.6: `gh pr list --head fix/142-add-auth --base dev` -> no PR -> `PUSH_MODE=LOCAL`. Debug runs, fixes, opens PR `fix/142-add-auth -> dev`, merges it.
7. The fix-merge push triggers CI on `dev` again (new headSha). If green -> no dispatch (success = no-op). If red -> steps 4-6 repeat, cap's distinct-headSha count increments to 1.
8. After 3 distinct failed dev CI SHAs (cap reached), the 4th `dev`-CI-fail ctx step reads distinct count = 3 >= `MAX_DEV_DISPATCH_ATTEMPTS` -> `::notice::FID 142-add-auth exhausted 3 dev-triggered debug dispatches — operator review required.` -> `skip=true`.

### Derived Test Matrix

<!-- prettier-ignore -->
| # | Behaviour | How to verify |
| --- | --- | --- |
| T1 | `workflow_run.branches` includes `dev` | `yq` / `jq` parse of `bkit-cloud.yml` `on.workflow_run.branches` contains `dev` |
| T2 | `cancel-in-progress` is `false` for `dev`, `true` otherwise | Expression `${{ github.event.workflow_run.head_branch != 'dev' }}` present; bash unit: `head_branch=feat/foo` -> true (cancel preserved); `head_branch=dev` -> false (queue) |
| T3 | Ctx step derives FID from commit scope on `dev` (no PR) | Bash unit: feed a `feat(363-widen-bkit-cloud-trigger): ...` subject via `$COMMIT_MSG` env -> assert `FID=363-widen-bkit-cloud-trigger` |
| T4 | Ctx step routes `dev` success -> skip, failure -> debug | Bash unit: `CONCLUSION=success` + `BRANCH=dev` -> `skip=true`; `CONCLUSION=failure` + `BRANCH=dev` -> `phase=debug` |
| T5 | Ctx step enforces `MAX_DEV_DISPATCH_ATTEMPTS` cap (distinct headSha count) | Bash unit: seed status.jsonl with 3 `dev-dispatch` rows for 3 distinct headSha values -> assert `skip=true` + notice; 3 rows for the SAME headSha -> assert `skip=false` (counts distinct cycles) |
| T6 | `bkit-auto` accepts non-numeric ARG as FID (CI_DEV mode) | Bash unit: `ARG=363-widen-bkit-cloud-trigger` -> `MODE=CI_DEV`, no `gh pr view` call (asserted via sentinel — Task 2 F1); `ISSUE_ID=363` derived |
| T7 | `bkit-auto` CI_DEV skips `PR_STATE != OPEN` + `feat/` prefix asserts | Read: Steps 7 and 10 gated on `MODE=CI` only; Step 9 (PR-body extraction) also gated |
| T8 | `bkit-debug` existing fallback creates `fix/{FID}` off `origin/dev` | Read: `bkit-debug.md:318-327` fallback path verified (no code change required); `git diff --exit-code -- .bkit/workflows/bkit-debug.md` exits 0 (Task 3 F2) |
| T9 | `bkit-ship` squash `--subject` includes `bkit [auto route]` when `bkit:auto` | Bash unit: `LABELS` contains `bkit:auto` -> subject ends with `bkit [auto route]` |
| T10 | `MAX_DEV_DISPATCH_ATTEMPTS=3` in counter-bus-config | `grep MAX_DEV_DISPATCH_ATTEMPTS .bkit/scripts/bkit-counter-bus-config.sh` |
| T11 | Mirrors regenerated (`.claude/`, `.cursor/`, `.opencode/` in sync) | `pnpm bkit upgrade --dry-run` produces no diff on canonical files |
| T12 | Version bumped 4.10.0 -> 4.11.0 | `jq -r .version package.json` = `4.11.0`; `grep pinnedVersion .bkit/version` = `4.11.0` (re-verified: dev is still on 4.10.0, so the bump target is unchanged) |
| T13 | Ctx step recovers FID from a `fix/**` branch (v4/P2) | Bash unit: `BRANCH=fix/363-widen-bkit-cloud-trigger` -> `FID=363`; `BRANCH=fix/bar-123-auth` -> `FID=bar-123`; `BRANCH=feat/141-cloud-app` -> unchanged from today |
| T14 | `bkit-auto` Step 10 accepts `fix/` (v4/P2) | Dry-run `MODE=CI BRANCH=fix/363-widen-bkit-cloud-trigger` reaches Step 11, NOT the Failure Path, with `FID=363-widen-bkit-cloud-trigger`; `BRANCH=chore/x` still routes to the Failure Path |
| T15 | `fix/**` failure loop is capped; success + `feat/**` are not (v4/P3) | Bash unit: `BRANCH=fix/363-x CONCLUSION=failure` + 3 distinct-headSha rows -> `skip=true`; `fix/**` + `success` -> `phase=ship`, cap unconsulted; `feat/**` + `failure` -> `phase=debug`, unconsulted |
| T16 | Dev path is tracker-agnostic (v4/P5) | Bash unit: `COMMIT_MSG="feat(bar-123-auth): x"` on `BRANCH=dev` -> `FID=bar-123-auth`, `ISSUE=bar-123` (Linear shape admitted, not silently no-op'd) |
| T17 | Counter write fails CLOSED (v4/P6) | Bash unit with a `git` stub whose `push` always fails and whose `origin/dev` lacks the row -> assert `skip=true` + fail-closed notice, and that no `phase=`/`arg=` pair is emitted |

---

## Breaking Changes & Naming Review

**`fix/**` surface newly routed (behaviour change — documented, not a regression).** Today `workflow_run.branches: ['feat/**']` excludes `fix/**`, so a `/bkit-debug`-created `fix/{FID}` PR's green CI does NOT auto-dispatch `/bkit-ship` — the debug orchestrator owns the merge (LOCAL direct push, or waits for manual merge). After this plan, `fix/**` CI success -> `workflow_run` -> ctx step `else` branch -> `gh pr list --head fix/{FID} --base dev` -> PR found -> `phase=ship` -> cloud auto-merges the fix PR. This is the intended folding (matches the routing table), but it IS a behaviour change to `/bkit-debug`'s fix-PR lifecycle: `/bkit-debug`-created fix PRs will now be auto-merged by the cloud on green CI. The `feat/**` pre-merge path is preserved byte-for-byte; the "preserved" claim is scoped to `feat/**` only.

> [!WARNING]
> **P2 — v3's `fix/**` folding was INERT, and its no-op was silent (v4 correction).** Adding `fix/**` to `workflow_run.branches` alone does nothing, because three downstream surfaces are `feat/`-only. Verified against dev @ d87c8641:
>
> 1. **ctx-step FID fallback is `feat/`-only** (`bkit-cloud.yml:198`): `FID=$(echo "$BRANCH" | sed 's|^feat/||' | grep -oE '^[0-9]+|^[a-z]+-[0-9]+')`. For `BRANCH=fix/363-widen-bkit-cloud-trigger` the `sed` is a no-op and neither alternation matches (`^[0-9]+` fails on `f`; `^[a-z]+-[0-9]+` needs `fix-363`, the string has `fix/363`) -> `FID` empty.
> 2. **The PRIMARY path cannot rescue it.** `bkit-debug.md:1244-1249` creates the fix PR with a body containing only a plan-doc link inside `bkit:start/end` — **no `bkit:issue=` / `bkit:fid=` markers** (`grep -c 'bkit:fid=' .bkit/workflows/bkit-debug.md` = 0). So the marker parse yields empty too, and the ctx step takes the `Cannot derive FID/ISSUE` fail-safe exit.
> 3. **`bkit-auto.md:118` hard-rejects the branch anyway**: `**If** BRANCH does NOT start with feat/ -> **Failure Path**`. This fires in `MODE=CI` (a `fix/**` PR run IS `MODE=CI` with a numeric PR ARG), so even if 1+2 were fixed the dispatch would land in the Failure Path — which posts a failure comment and sets `bkit:failed`. That is strictly **worse** than today's silence.
>
> Net: as written in v3, every `fix/**` CI completion no-ops at the ctx step (best case) or fails the issue (if 1+2 are fixed in isolation). The Breaking-Changes claim above ("cloud auto-merges the fix PR") could not occur. v4 adds **Tasks 11-13** to make the folding real, per the issue pivot comment's "fix/** is a pre-existing routing gap worth folding in".
>
> **P3 — the `fix/**` failure loop is unbounded.** `MAX_DEV_DISPATCH_ATTEMPTS` is gated on `BRANCH = dev`. A `fix/**` CI **failure** dispatches `/bkit-debug`, whose fix push re-reds CI, which dispatches again — the exact cross-session feedback loop the cap exists to bound, on the surface this plan newly opens, with no bound at all. v4 rekeys the cap on the **FID** (not the branch) and applies it to both post-`feat/**` surfaces; see Task 1f and Task 13.

**No other breaking changes.** The `dev` path is purely additive (a new branch in the trigger filter + ctx step branch). Existing consumer repos without `bkit:auto`-labeled issues see no behaviour change (the free-tier gate already blocks unmarked runs).

**Naming:**

- `CI_DEV` mode (in `bkit-auto.md` only) — consistent with existing `CI` (pre-merge, PR-backed) and `BRIEF` (tracker-dispatched) modes. The `_DEV` suffix denotes the `dev` branch origin. NOTE: `CI_DEV` exists ONLY in `bkit-auto`; it is deliberately NOT propagated to `bkit-debug` (the dead cross-skill signal from v1 is dropped — `bkit-debug` has no way to receive it and does not need it).
- `MAX_DEV_DISPATCH_ATTEMPTS` — consistent with `MAX_DEBUG_ATTEMPT`, `MAX_NORMAL_ATTEMPT`, `MAX_SOAK_ATTEMPT`. The `_DISPATCH` clarifier distinguishes cross-session cloud dispatches from in-session remediation attempts. Consumed by `bkit-cloud.yml` ctx step (lives under a `# bkit-cloud.yml counters` section header, NOT the bkit-debug section).
- `dev-dispatch` status.jsonl row type — consistent with existing `workflow-started`, `step-done` row types. Additive, NDJSON-merge-safe.

---

## Open Questions & Assumptions

**Settled in-plan (no blocker):**

1. **Cross-session loop cap mechanism.** Decision: **cap = 3 distinct failed dev CI SHAs per FID, all-time, enforced AND written in `bkit-cloud.yml` ctx step at the dispatch decision point.** The cap counts DISTINCT `headSha` values among `dev-dispatch` rows for the FID (not total rows), so a dual-job race — both the claude and opencode jobs writing a row for the same `workflow_run` event — counts as one cycle. The counter row is committed to `dev` with `[skip ci]` (so it persists across runs and survives early `/bkit-debug` crashes — v1's write-after-dispatch undercount defect is closed by writing BEFORE dispatch). Reader and writer are the SAME component (the cloud ctx step) — no cross-skill `MODE` propagation needed (v1's dead `CI_DEV`-in-`bkit-debug` signal is dropped). Window is all-time (not sliding) — simpler, safer; operator reset = delete the rows or bump `MAX_DEV_DISPATCH_ATTEMPTS`. Rationale: per-session `MAX_NORMAL_ATTEMPT` resets on each cloud dispatch and cannot bound a `dev` feedback loop; operator vigilance is unreliable for 24/7 cloud dispatch. 3 matches `MAX_DEBUG_ATTEMPT` (in-session escalation threshold), giving symmetry: 3 dispatched cycles, each with up to 3 in-session remediations, before the cap silences further dispatches.

2. **Stale-run guard (Option A — CI-run recency).** Decision: **query the most recent COMPLETED CI run on `dev` via `gh run list`; skip only if its `headSha` differs from `workflow_run.head_sha`.** Justification: `/bkit-ship` Step 13 pushes `docs({FID}): ship DONE bkit [skip ci]` to `dev` DURING the dev CI run, so by the time CI completes and the cloud workflow boots, `dev`'s tip is the close commit — a naive `git rev-parse origin/dev` comparison would mismatch on EVERY legitimate dispatch and suppress the feature entirely (Review 3 F1, CRITICAL). Close commits carry `[skip ci]` so they never trigger CI and never appear in `gh run list`; only feature/fix commits appear. The most-recent-completed-run head is therefore the latest feature commit that ran CI — exactly the staleness signal intended. Options B (walk back past bookkeeping commits) is subject-convention-dependent and fragile; Option C (drop the guard, rely on cap + kill-switch) loses defence-in-depth. Option A keeps defence-in-depth AND is sound. If `gh run list` returns empty (CI workflow name mismatch, permissions issue), the guard fails OPEN (proceeds with dispatch) — better to dispatch than to silently skip.

3. **Concurrency on `dev`: queue, not cancel.** Decision: **`cancel-in-progress: ${{ github.event.workflow_run.head_branch != 'dev' }}`.** For `dev`, `false` (in-flight debug runs to completion; superseding run is QUEUED — GHA queues one pending with `cancel-in-progress: false`; older pendings are cancelled as newer ones arrive; the queued run re-evaluates the cap at its ctx step when it starts). The operator does NOT need to manually re-trigger. For `feat/**`/`fix/**`, `true` (latest-wins, current behaviour, no regression). Rationale: cancelling an in-flight `/bkit-debug` mid-flight risks leaving status.jsonl / worktree lock in an inconsistent state; the queued-run-re-evaluates-cap flow bounds the loop cleanly.

4. **FID recovery primary vs. fallback.** Decision: **primary = squash-merge commit scope regex** (`^\w+\(([0-9]+-[a-z0-9-]+)\):` on the commit message, passed via `env:` NOT inline `${{ }}`); **fallback = `gh api repos/$GITHUB_REPOSITORY/commits/$HEAD_SHA/pulls` -> PR body `bkit:fid` marker.** The commit-scope path is the common case (all bkit PR titles follow `feat({FID}): ...`), requires no extra API call, and fails safe (no match -> no-op).

5. **Counter write location.** Decision: **written by the cloud ctx step (both jobs), immediately before dispatch, committed to dev with `[skip ci]`.** NOT written by `/bkit-debug` (v1's design had no CI_DEV signal in bkit-debug, making the cap silently inert). The ctx step already knows `BRANCH=dev`, the FID, and the `workflow_run.head_sha`. Reader and writer co-located. F3 (undercount on early crash) closed: the write precedes dispatch.

6. **(v4) P5 — the dev-path FID regex must be tracker-agnostic.** Decision: **the commit-scope regex and the FID slug allowlist accept BOTH tracker shapes**, matching the existing `feat/**` fallback at `bkit-cloud.yml:198` (`'^[0-9]+|^[a-z]+-[0-9]+'`). v3 hard-coded the GitHub shape only — scope regex `^\w+\(([0-9]+-[a-z0-9-]+)\):`, allowlist `^[0-9]+-[a-z0-9-]+$`, and `ISSUE=$(printf '%s' "$FID" | grep -oE '^[0-9]+')`. A Linear-tracker consumer's FID is `bar-123-slug`, which fails all three, so **the dev trigger would silently never fire for any Linear consumer** — a fail-safe no-op that looks identical to "no marker", giving the operator no signal. bkit's shipped surface must be tracker-independent (`.agents/rules.md`; the existing ctx-step fallback already honours this). v4 widens to allowlist `^([0-9]+|[a-z]+-[0-9]+)-[a-z0-9-]+$` and derives `ISSUE` via `grep -oE '^[0-9]+|^[a-z]+-[0-9]+'` — the same alternation the `feat/**` path already uses. Applies identically to `bkit-auto.md` Step 1.5's CI_DEV `ISSUE_ID` derivation.

7. **(v4) P6 — the counter write must fail CLOSED, not open.** Decision: **on telemetry push failure, re-fetch and retry once; if the row still is not on `dev`, `skip=true` and do NOT dispatch.** v3 tolerated a rejected push with `git push origin dev || echo "::notice::… row already on dev for this headSha; continuing."` and dispatched anyway. That claim only holds for the specific dual-job race it names; any other non-fast-forward (dev advanced for an unrelated reason — a concurrent ship close commit, a Renovate merge) also rejects the push, and then the row exists in NO durable location while the dispatch proceeds. Every such cycle is uncounted, so `MAX_DEV_DISPATCH_ATTEMPTS` never trips and the loop bound is defeated — precisely the failure mode the cap is a cost/security control against (Security section: "Without it, a stuck `dev` feedback loop could dispatch unbounded paid agent sessions"). A control that silently degrades to unbounded is worse than no control, because the plan's own text asserts the loop is bounded. Fail-closed is the correct posture: an undispatched debug costs one operator `workflow_dispatch`; an unbounded loop costs unbounded agent spend. See the revised Task 1f bash.

**Assumptions:**

- The squash-merge `--subject` set by `bkit-ship` Step 5 preserves the PR title verbatim, which follows `feat({FID}): ...` convention. This is already the case (`bkit-ship.md:634-635`: `--subject "$(gh pr view {PR_NUMBER} --json title --jq .title) (#{PR_NUMBER})"`).
- `workflow_run.head_commit.message` on a `dev` push is the push's HEAD commit message — i.e. the squash-merge subject. This is GHA's documented behaviour for `workflow_run` events.
- CI on `dev` runs on every push (the consumer repo's CI workflow triggers on `push: branches: [dev]`). This is the existing contract in `docs/deployments.md`.
- `fix/{FID}` is the established debug-fix branch convention (referenced in `bkit-ship` Step 5 line 630, git rules line 31). The existing `bkit-debug.md:318-327` fallback already creates it off `origin/dev`.
- The consumer's CI workflow is named "CI" (so `gh run list --workflow CI` resolves it). This matches `bkit-cloud.yml`'s `workflows: [CI]` trigger. **(v4 correction)** It does NOT match `bkit-ship.md` — that file uses the **filename** form `--workflow ci.yml` throughout (`bkit-ship.md:543,546`; v3 cited `:610`'s `--workflow CI`, which no longer exists). `gh run list --workflow` accepts either a name or a filename, so both resolve, but the stale-guard should use the **`ci.yml` filename form** for consistency with every other `gh run list` call bkit ships, and because the workflow _name_ is consumer-editable free text while the filename is fixed by `bkit install`. Task 1f bash updated accordingly.

---

## Alternative Approaches & Recommendations

**Option B (rejected): Separate `workflow_run` event for `dev` with a second gate path.** Adding a second `if:` condition or a separate job for `dev`-triggered runs, with its own marker or label check. Rejected because Option A reuses the existing `bkit [auto route]` gate by construction (the squash-merge subject already carries it when `bkit:auto`-labeled), so a second gate is redundant complexity. Option A is strictly simpler.

**Option C (rejected): `workflow_dispatch`-only for `dev` failures.** Require the operator to manually trigger `/bkit-debug` when `dev` CI fails. Rejected — this is the status quo and the motivation for #363. The whole point is autonomous post-merge failure routing.

**Option D (rejected): Sliding-window loop cap (e.g. 3 per 24h).** More complex (requires timestamp filtering in the ctx step), offers marginal benefit over all-time cap. If an FID accumulates 3 dispatched debug cycles ever, something is structurally wrong and an operator should review. All-time cap with manual reset is simpler and safer.

**Stale-run guard Option B (rejected): walk back past bkit bookkeeping commits.** From `origin/dev`, skip trailing commits whose subject matches `^(docs|chore)\(.*\): .*\[skip ci\]`, then compare. More fragile (subject-convention dependent) than Option A and stays local-only. Option A's `gh run list` is more robust.

**Stale-run guard Option C (rejected): drop the guard, rely on cap + kill-switch.** The guard is defence-in-depth, not load-bearing, once the loop cap exists. But dropping it entirely loses the staleness check. Option A keeps defence-in-depth AND is sound.

**Recommendation:** Option A as specified, with stale-run guard Option A. The design is the minimal change that closes the post-merge blind spot without introducing a new trust surface, a new gate, or a new trust marker.

---

## Out of Scope

- **`main` branch trigger — DEFERRED, and this is a REVERSAL of a settled issue decision (P4).** Production trunk never auto-dispatches a cloud agent; `main` stays manual-only (`workflow_dispatch`). **This contradicts #363's pivot comment D-final** ("verify at **both `dev` (post-merge) and `main` (post dev->main promotion)** — `main` CI's e2e-await covers the _production_ deploy, folding the prod gap into the same mechanism"), whose routing table and diff both list `main`. v3 dropped it into Out of Scope without flagging the reversal, and scope-check-2 passed the plan as "zero silent drops" — that verdict was wrong on this item.
  - **Why the exclusion is still the right call:** the issue's own **open item 3** never resolved it — "routing on `main` only works if the promotion commit carries the marker. bkit has no consumer-facing dev->main promotion workflow, so confirm where that commit is authored (may be out of bkit's control for some consumers)." With no bkit-authored promotion commit, there is nothing to thread `bkit [auto route]` onto, so a `main` trigger would be gated shut by construction for exactly the consumers it targets. Shipping it would be dead configuration plus a live risk of a paid agent dispatching against production trunk.
  - **Required bookkeeping (Task 14):** append a `docs/deferrals.jsonl` row recording the reversal + rationale + the unresolved promotion-commit-authorship precondition, and post the decision change on #363. Do not let this stay an unrecorded silent drop.
- **Cross-surface same-FID arbitration (#397).** The race between a dispatched build and the auto-ship it triggers (or two cloud dispatches for the same FID from different trigger surfaces) remains owned by #397's orchestrator-level stale-run guard + status.jsonl lock. This plan's `dev` concurrency group (`bkit-auto-dev`) collapses all `dev`-triggered runs into one group — FID-level mutual exclusion on `dev` is handled by `/bkit-debug` Step 1's `.lock` file (already exists), not by the GHA concurrency layer (which can't see the FID at group-evaluation time).
- **bkit-ship Step 10 "Verify Deploy" / ship-verify block contract / preflight advisories / renumber cascade.** DROPPED per issue comments. The ship-verify work is a separate concern.
- **#80 audit-logs-ship migration.** Lives in the triggered debug's `debug-fetch` independently. Not coupled to the trigger widening.
- **Webhook-based tracker triggers (Linear bridge, GitHub `issues: labeled`).** Phase 2 work, unrelated to the CI-driven trigger surface.

---

## Suggested Scope Expansion

None. This plan is tightly scoped to the trigger widening + its immediately necessary machinery (FID recovery, routing, concurrency, loop bound). No adjacent features are bundled.

---

## Security & Privacy

**CI Auto-Route Trust surface — `dev` push trigger (new):**

The existing trust model (documented in `docs/security.md` § CI Auto-Route Trust) gates cloud dispatches on the `bkit [auto route]` marker in the HEAD commit message, which is only present when `bkit-ship` threads it (gated on the `bkit:auto` issue label). This plan extends the same gate to `dev`-triggered runs — **no new trust marker, no new label, no new gate path.** The `dev` path adds one new derivation: FID from the squash-merge commit scope. The FID is validated against the existing slug allowlist (`^[0-9]+-[a-z0-9-]+$` for GitHub tracker) before use. A malformed or missing scope -> fail-safe no-op exit (no dispatch, no crash, no information leak). Dynamic values (`head_commit.message`, `head_sha`) are passed through the `env:` block (NOT inline `${{ }}` into bash) — injection-safe (Review 1 M3).

**Kill switch preserved:** The `bkit:auto` label re-check in the ctx step (live revocation) applies identically to `dev`-triggered runs. Removing the label mid-loop halts further dispatches even under the cap.

**Loop-bound as cost control:** `MAX_DEV_DISPATCH_ATTEMPTS=3` bounds cloud-agent spend per FID on the `dev` path. The counter is written BEFORE dispatch (at the decision point) and committed to `dev`, so an early `/bkit-debug` crash does not undercount — the cap cannot be silently exceeded by repeated early crashes (Review 3 F3 closed). Without it, a stuck `dev` feedback loop could dispatch unbounded paid agent sessions. The cap is a security/cost control, not just a quality-of-life feature.

**No new secrets, no new permissions.** The `bkit-cloud.yml` jobs already have `contents: write`, `pull-requests: write`, `issues: write`, `actions: read`, `id-token: write` (claude job). The `dev` path uses the same permissions (read merge-commit via `gh api`, write `dev-dispatch` row + telemetry commit via the existing `contents: write`, dispatch `/bkit-debug`). No scope expansion.

---

## Pre-Flight / Dependencies (Gate 1)

- [ ] `bkit-cloud.yml` template is at `.bkit/templates/.github/workflows/bkit-cloud.yml` (canonical source; `.github/workflows/bkit-cloud.yml` is the installed copy). The ctx step `shared-deriv` block is a `# bkit:start shared-deriv` / `# bkit:end shared-deriv` managed block, duplicated across both jobs (`run`/claude at lines 190-214 and `opencode` at lines 325-344). Both copies must be extended identically. The `if [ "$BRANCH" = "dev" ]` guard is inserted AFTER the `case "$CONCLUSION"` routing and BEFORE the `gh pr list` PR-lookup (which moves into the `else` branch); the `shared-deriv` markers extend upward to encompass the new guard.
- [ ] The existing ctx step `env:` block carries `GH_TOKEN, EVENT, IN_PHASE, IN_ISSUE, CONCLUSION, BRANCH` only. `COMMIT_MSG` and `HEAD_SHA` must be ADDED to the `env:` block (injection-safe). `$GITHUB_WORKSPACE` and `$GITHUB_REPOSITORY` (GHA-provided) are used for sourcing `bkit-counter-bus-config.sh` and `gh api` repo path — `$REPO_ROOT` is NOT defined in the ctx step (v1 defect).
- [ ] **(v4 — REPLACES the stale v3 anchor.)** `bkit-ship.md` no longer derives `AUTO_ROUTE_SUFFIX` anywhere: #384 (80660ac0) deleted both the Step-4 conflict-resolve derivation (old lines 483-485) and the Step-6 dev-sync derivation (old lines 625-630), and removed the `chore({FID}): sync dev` merge commit. Verify before editing: `grep -c 'AUTO_ROUTE_SUFFIX' .bkit/workflows/bkit-ship.md` -> `0`. The squash `--subject` is now at **line 682** (was 634-635) inside the `gh pr merge --squash --delete-branch --match-head-commit` block. Task 4 must ADD the derivation and thread it — mirror `bkit-build.md:1261`.
- [ ] **(v4) All other `bkit-ship.md` anchors re-verified against dev @ d87c8641** — every v3 line number was authored against 2ee0da16 and is stale: HEAD-Subject Assertion `598` -> **647**; squash `--subject` `634-635` -> **682**; ship-DONE close commit `1206` -> **1258**; close-commit push `1211` -> **1261-1265** (now conditional on `RUNTIME_DEVPUSHES`); CI-wait idiom `610` -> **546**, and it is `--workflow ci.yml`, **not** `--workflow CI` (see Assumptions).
- [ ] **(v4) `RUNTIME_DEVPUSHES` caveat on the close-commit narrative.** `bkit-ship.md:1261-1265` pushes the `docs({FID}): ship DONE bkit [skip ci]` close commit to `dev` **only when `RUNTIME_DEVPUSHES = true`** (LOCAL / GITHUB_ACTION / CLOUD_CURSOR per `bkit-runtime.sh:167-177`); under `CLOUD_CLAUDE` / `UNKNOWN` it stays on the working branch. The plan's edge-case narrative ("dev's tip is the close commit by the time the cloud workflow boots") therefore holds for the common runtimes but is not universal. This does NOT weaken stale-run guard Option A — that guard reads CI-run recency, never dev's tip, so it is correct under both runtimes. No task change; recorded so a builder does not "fix" the guard back to a tip comparison.
- [ ] `bkit-auto.md` Step 1.5 (line 85) assumes `MODE=CI` -> `PR_NUMBER="$ARG"` (numeric). The CI_DEV extension discriminates on ARG shape (numeric = CI/PR, non-numeric = CI_DEV/FID). Steps 6-10 (lines 86-118) and Step 9 (lines 93-117, PR-body extraction) must be gated on `MODE=CI`.
- [ ] `bkit-debug.md` Step 2 worktree fallback (`bkit-debug.md:318-327`) ALREADY creates `fix/{FID}` off `origin/dev` when `feat/{FID}` is absent — the post-merge condition. NO code change needed in `bkit-debug` (v1's redundant `CI_DEV` branch-selection edit is dropped).
- [ ] `bkit-counter-bus-config.sh` bkit-debug section is at lines 16-19. `MAX_DEV_DISPATCH_ATTEMPTS` goes under a NEW `# bkit-cloud.yml counters` section header (it is consumed by the cloud ctx step, not bkit-debug).
- [ ] `bkit-ship.md:1258` (v3 said 1206) close commit is `docs({FID}): ship DONE bkit [skip ci]` (re-verified) — NOT `chore({FID}): merge-pr attempt N` (v1's misidentifier; that per-attempt telemetry commit no longer exists in the #384 Path A/B structure at all).
- [ ] **(v4) `bkit-auto.md` + `bkit-debug.md` + `bkit-cloud.yml` anchors all re-verified and STILL CORRECT** — only `bkit-ship.md` drifted. Confirmed on dev @ d87c8641: `bkit-auto.md` Step 1.5 = line 85, Steps 6/7/8 = 86/87/88, Step 9 = 93-117, Step 10 = 118, Step 11 comment = 126-134, Gate 1 = 141. `bkit-debug.md` 3-way worktree fallback = 318-327 (`git worktree add` at 320/323/326), Step 1.6 PUSH_MODE = 179-181. `bkit-cloud.yml` header = 14-19, trigger = 31, concurrency = 73-74, `case "$CONCLUSION"` = 177, `gh pr list` = 182, `shared-deriv` = 190-214 (claude) / 325-344 (opencode).
- [ ] **(v4) `bkit-debug`'s mint-mode fallback is reachable in this runtime.** Task 3's verify-only premise depends on `RUNTIME_WORKTREES = true`, since adopt mode (`bkit-runtime.sh:195-200`) sets `WORKTREE_PATH=$REPO_ROOT` and does NO `git worktree add` — the 3-way fallback at `bkit-debug.md:318-327` never runs there. `bkit-runtime.sh:167-172` maps `GITHUB_ACTION` -> `RUNTIME_WORKTREES=true`, and `bkit-cloud.yml` dispatches on a GH-Actions runner, so mint mode holds for the dev-trigger path. Note `workflows.md:113`: adopt mode "refuses outright if that branch is `dev`" — so under a hypothetical `RUNTIME_WORKTREES=false` cloud dispatch the dev path would refuse rather than corrupt `dev`. Fail-safe either way; recorded so Task 3 asserts the runtime, not just the file.
- [ ] Consumer repos (`app-gether-life`, `visitfrasercoast-com`) run CI on `push: branches: [dev]` — verify in their CI workflow (documented in `docs/deployments.md`).

---

## Data Schema Integration

**New status.jsonl row type: `dev-dispatch`**

```json
{
  "type": "dev-dispatch",
  "workflow": "auto",
  "at": "2026-07-29T14:23:00Z",
  "fid": "363-widen-bkit-cloud-trigger",
  "headSha": "abc1234",
  "parentSha": "def5678"
}
```

- **Written by:** the `bkit-cloud.yml` ctx step (both jobs), immediately BEFORE dispatching `/bkit-debug`, committed to `dev` as `docs({FID}): dev-dispatch telemetry [skip ci]` (so the row persists across runs). `headSha` = `workflow_run.head_sha` (the squash-merge / CI-failed SHA — the correct "which CI run failed" record); `parentSha` = `git rev-parse origin/dev` (dev tip at dispatch time, for correlation).
- **Read by:** `bkit-cloud.yml` ctx step (both jobs), to count prior dev-triggered dispatch CYCLES for the FID: distinct `headSha` values among matching rows — `[.[] | select(.type=="dev-dispatch" and .fid==$f) | .headSha] | unique | length` (so a dual-job race writing two rows for the same event headSha counts as one cycle).
- **(v4) One row type, both post-`feat/**` surfaces.** The `dev-dispatch` type is also written for `fix/**` CI-failure dispatches (P3), keyed on the same FID — a FID gets ONE post-`feat/**` debug budget however the failure surfaced. The name is kept for schema stability; the `type` is not re-namespaced per branch. `feat/**` never writes this row.
- **(v4) Fail-closed write.** The row must be verified present on `origin/dev` before dispatch; if the push cannot land it, the run skips instead of dispatching uncounted (P6). A `dev-dispatch` row that exists only in the runner's workspace is equivalent to no row at all.
- **Merge-safe:** NDJSON, `.jsonl merge=union` in `.gitattributes` (already configured). Additive row, no collision with existing types.
- **Location:** `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl` (same file as all other workflow telemetry for the FID). The YYYYMM is resolved by glob: `ls -d docs/plans/*/logs/"$FID"/ 2>/dev/null | head -1`; if absent, `docs/plans/$(date -u +%Y%m)/logs/$FID/` is created.

**No schema migration.** Existing rows (`workflow-started`, `step-done`) are unchanged. The `dev-dispatch` row is purely additive.

---

## Architecture & Component Changes

### `.bkit/templates/.github/workflows/bkit-cloud.yml`

1. **Header comment (lines 14-19) — update to document the `dev` post-merge trigger surface:**

   ```yaml
   # Phase 1 wires three trigger surfaces:
   #   - workflow_run (CI completion on feat/**): success -> ship, failure -> debug
   #     (preserves the previous bkit-ci-router behaviour exactly).
   #   - workflow_run (CI completion on fix/**): success -> ship, failure -> debug
   #     (newly folded — fix-PR green CI now auto-merges via the cloud).
   #   - workflow_run (CI completion on dev): success -> no-op (regression check passed),
   #     failure -> /bkit-debug {FID} (FID recovered from squash-merge commit scope;
   #     loop-bounded by MAX_DEV_DISPATCH_ATTEMPTS). [skip ci] close commits never trigger CI.
   #   - workflow_dispatch: pick ANY phase (ship|debug|design|plan|build) for an issue.
   ```

2. **Trigger filter (line 31):**

   ```yaml
   # Before:
   branches: ["feat/**"]
   # After:
   branches: ["feat/**", "fix/**", "dev"]
   ```

3. **Concurrency (lines 73-74):**

   ```yaml
   # Before:
   group: bkit-auto-${{ inputs.issue || github.event.workflow_run.head_branch }}
   cancel-in-progress: true
   # After:
   group: bkit-auto-${{ inputs.issue || github.event.workflow_run.head_branch }}
   cancel-in-progress: ${{ github.event.workflow_run.head_branch != 'dev' }}
   ```

   For `dev`, the group resolves to `bkit-auto-dev`. `cancel-in-progress: false` means an in-flight debug runs to completion and a superseding run is QUEUED (GHA queues one pending; older pendings cancelled as newer arrive); the queued run re-evaluates the cap at its ctx step. `feat/**`/`fix/**` keep `true` (latest-wins). `workflow_dispatch` (`head_branch` empty, `'' != 'dev'` -> true) keeps latest-wins — no regression.

4. **Ctx step `env:` block (both jobs) — ADD `COMMIT_MSG` and `HEAD_SHA` (injection-safe; referenced as `$vars` in bash, NOT inline `${{ }}`):**

   ```yaml
   env:
     GH_TOKEN: ${{ github.token }}
     EVENT: ${{ github.event_name }}
     IN_PHASE: ${{ inputs.phase }}
     IN_ISSUE: ${{ inputs.issue }}
     CONCLUSION: ${{ github.event.workflow_run.conclusion }}
     BRANCH: ${{ github.event.workflow_run.head_branch }}
     COMMIT_MSG: ${{ github.event.workflow_run.head_commit.message }}
     HEAD_SHA: ${{ github.event.workflow_run.head_sha }}
   ```

   (`$GITHUB_WORKSPACE` and `$GITHUB_REPOSITORY` are GHA-auto-provided — no `env:` entry needed.)

5. **Ctx step `run:` block (both jobs) — insert the `dev` branch AFTER the `case "$CONCLUSION"` routing and BEFORE the `gh pr list` PR-lookup. The PR-lookup moves into the `else` branch. The `# bkit:start shared-deriv` / `# bkit:end shared-deriv` markers extend upward to encompass the new `if [ "$BRANCH" = "dev" ]` guard.**

   ```bash
   set -euo pipefail
   if [ "$EVENT" = "workflow_dispatch" ]; then
     PHASE="$IN_PHASE"
     ARG="$IN_ISSUE"
     FID="$IN_ISSUE"
   else
     # Route by conclusion.
     case "$CONCLUSION" in
       success) PHASE=ship ;;
       failure) PHASE=debug ;;
       *) echo "::notice::Non-terminal CI conclusion '$CONCLUSION' — no-op exit."; echo "skip=true" >> "$GITHUB_OUTPUT"; exit 0 ;;
     esac

     # bkit:start shared-deriv
     if [ "$BRANCH" = "dev" ]; then
       # Post-merge dev CI — no open PR. Recover FID from squash-merge commit scope.
       # dev success = regression check passed = no-op (the merge already happened).
       if [ "$PHASE" = "ship" ]; then
         echo "::notice::dev CI passed — post-merge regression check OK, no-op exit."
         echo "skip=true" >> "$GITHUB_OUTPUT"; exit 0
       fi
       # PHASE=debug below.
       # Primary: parse FID from commit scope: feat(363-widen-bkit-cloud-trigger): ...
       # v4/P5: scope regex accepts BOTH tracker shapes — GitHub `363-slug` and
       # Linear `bar-123-slug` — mirroring the alternation the feat/** fallback
       # already uses at bkit-cloud.yml:198. A GitHub-only regex silently no-ops
       # the whole dev trigger for every Linear-tracker consumer.
       FID=$(printf '%s' "$COMMIT_MSG" | grep -oE '^\w+\((([0-9]+|[a-z]+-[0-9]+)-[a-z0-9-]+)\):' | sed -E 's/^\w+\(([^)]+)\):/\1/' | head -1 || true)
       if [ -z "$FID" ]; then
         # Fallback: gh api merge-commit linked PR -> PR body bkit:fid marker.
         PR_BODY=$(gh api "repos/${GITHUB_REPOSITORY}/commits/${HEAD_SHA}/pulls" --jq '.[0].body // empty' 2>/dev/null || echo "")
         FID=$(printf '%s' "$PR_BODY" | grep -oE 'bkit:fid=[^[:space:]>]+' | sed 's/bkit:fid=//' | head -1 || true)
       fi
       if [ -z "$FID" ] || ! [[ "$FID" =~ ^([0-9]+|[a-z]+-[0-9]+)-[a-z0-9-]+$ ]]; then
         echo "::notice::Cannot derive FID by dev commit scope or linked PR — no-op exit (fail-safe)."
         echo "skip=true" >> "$GITHUB_OUTPUT"; exit 0
       fi
       ISSUE=$(printf '%s' "$FID" | grep -oE '^[0-9]+|^[a-z]+-[0-9]+' | head -1)
       ARG="$FID"
       # Stale-run guard (Option A): HEAD_SHA is current iff it is the headSha of the most
       # recent COMPLETED CI run on dev. Close commits carry [skip ci] so they never appear
       # in gh run list; only feature/fix commits do — the most-recent-completed-run head is
       # exactly the staleness signal. (A git rev-parse origin/dev comparison is unsound:
       # /bkit-ship Step 13 pushes docs({FID}): ship DONE bkit [skip ci] to dev during the
       # dev CI run, so dev's tip is the close commit by the time the cloud workflow boots.)
       # v4: --workflow ci.yml (filename), not `CI` (name). Both resolve, but the
       # filename is fixed by `bkit install` while the display name is consumer-
       # editable free text, and every other gh run list call bkit ships uses the
       # filename form (bkit-ship.md:546).
       LATEST_CI_SHA=$(gh run list --branch dev --workflow ci.yml --status completed --limit 10 \
         --json headSha --jq '.[0].headSha // empty' 2>/dev/null || echo "")
       if [ -n "$LATEST_CI_SHA" ] && [ "$HEAD_SHA" != "$LATEST_CI_SHA" ]; then
         echo "::notice::Stale dev CI (head_sha=$HEAD_SHA, latest completed dev CI head=$LATEST_CI_SHA) — no-op exit."
         echo "skip=true" >> "$GITHUB_OUTPUT"; exit 0
       fi
       # Loop cap: count DISTINCT headSha values among prior dev-dispatch rows for this FID
       # (so a dual-job race writing two rows for the same event headSha counts as one cycle).
       . "$GITHUB_WORKSPACE/.bkit/scripts/bkit-counter-bus-config.sh"
       STATUS_DIR=$(ls -d docs/plans/*/logs/"$FID"/ 2>/dev/null | head -1 || true)
       if [ -z "$STATUS_DIR" ]; then
         STATUS_DIR="docs/plans/$(date -u +%Y%m)/logs/$FID/"
       fi
       mkdir -p "$STATUS_DIR"
       STATUS_FILE="${STATUS_DIR}status.jsonl"
       DEV_COUNT=0
       if [ -f "$STATUS_FILE" ]; then
         DEV_COUNT=$(jq -s --arg f "$FID" '[.[] | select(.type=="dev-dispatch" and .fid==$f) | .headSha] | unique | length' "$STATUS_FILE" 2>/dev/null || echo 0)
       fi
       if [ "$DEV_COUNT" -ge "$MAX_DEV_DISPATCH_ATTEMPTS" ]; then
         echo "::notice::FID $FID exhausted $MAX_DEV_DISPATCH_ATTEMPTS dev-triggered debug dispatches — operator review required (delete dev-dispatch rows in status.jsonl to reset)."
         echo "skip=true" >> "$GITHUB_OUTPUT"; exit 0
       fi
       # Kill switch: re-check bkit:auto on the issue (live revocation).
       ISSUE_LABELS=$(gh issue view "$ISSUE" --json labels --jq '[.labels[].name] | join(",")' 2>/dev/null || echo "")
       if ! echo "$ISSUE_LABELS" | grep -q 'bkit:auto'; then
         echo "::notice::Issue #$ISSUE no longer carries bkit:auto — no-op exit (kill switch)."
         echo "skip=true" >> "$GITHUB_OUTPUT"; exit 0
       fi
       # Write the dev-dispatch counter row NOW (before dispatch) so an early /bkit-debug
       # crash does not undercount (F3). headSha = workflow_run.head_sha (the CI-failed SHA);
       # parentSha = dev tip at dispatch time.
       PARENT_SHA=$(git -C "$GITHUB_WORKSPACE" rev-parse origin/dev 2>/dev/null || echo "")
       jq -nc --arg t "$(date -u +%FT%TZ)" --arg f "$FID" --arg h "$HEAD_SHA" --arg p "$PARENT_SHA" \
         '{type:"dev-dispatch", workflow:"auto", at:$t, fid:$f, headSha:$h, parentSha:$p}' \
         >> "$STATUS_FILE"
       git -C "$GITHUB_WORKSPACE" add -- "$STATUS_FILE"
       git -C "$GITHUB_WORKSPACE" commit -m "docs($FID): dev-dispatch telemetry [skip ci]" -- "$STATUS_FILE"
       # v4/P6 — FAIL CLOSED. A rejected push is NOT automatically the dual-job race:
       # any non-fast-forward (a concurrent ship close commit, a Renovate merge) rejects
       # too, and then the row exists nowhere durable while the dispatch proceeds. Every
       # such cycle would be uncounted, so the cap never trips and the loop bound this
       # plan advertises silently degrades to unbounded paid agent spend. Retry once
       # against a re-fetched dev, then VERIFY the row is actually on origin/dev — that
       # verification is also what keeps the genuine dual-job race safe, since the
       # sibling job's row for the same headSha satisfies it.
       if ! git -C "$GITHUB_WORKSPACE" push origin dev 2>/dev/null; then
         git -C "$GITHUB_WORKSPACE" fetch origin dev
         git -C "$GITHUB_WORKSPACE" rebase origin/dev || { git -C "$GITHUB_WORKSPACE" rebase --abort || true; }
         git -C "$GITHUB_WORKSPACE" push origin dev 2>/dev/null || true
       fi
       git -C "$GITHUB_WORKSPACE" fetch origin dev
       LANDED=$(git -C "$GITHUB_WORKSPACE" show "origin/dev:${STATUS_FILE}" 2>/dev/null \
         | jq -s --arg f "$FID" --arg h "$HEAD_SHA" \
             '[.[] | select(.type=="dev-dispatch" and .fid==$f and .headSha==$h)] | length' 2>/dev/null || echo 0)
       if [ "${LANDED:-0}" -lt 1 ]; then
         echo "::notice::dev-dispatch row for $FID @ $HEAD_SHA is not on origin/dev after retry — refusing to dispatch uncounted (fail-closed). Resolve the dev push contention and re-run via workflow_dispatch."
         echo "skip=true" >> "$GITHUB_OUTPUT"; exit 0
       fi
     else
       # Existing feat/** / fix/** path (PR-backed FID recovery) — unchanged.
       PR_NUMBER=$(gh pr list --head "$BRANCH" --base dev --state open --json number --jq '.[0].number // empty')
       if [ -z "$PR_NUMBER" ]; then
         echo "::notice::No open PR for branch $BRANCH — no-op exit."
         echo "skip=true" >> "$GITHUB_OUTPUT"
         exit 0
       fi
       ARG="$PR_NUMBER"
       PR_BODY=$(gh pr view "$PR_NUMBER" --json body --jq .body 2>/dev/null || echo "")
       ISSUE=$(echo "$PR_BODY" | grep -oE 'bkit:issue=#[0-9]+' | sed 's/bkit:issue=#//' | head -1 || true)
       FID=$(echo "$PR_BODY" | grep -oE 'bkit:fid=[^[:space:]>]+' | sed 's/bkit:fid=//' | head -1 || true)
       if [ -z "$ISSUE" ] || [ -z "$FID" ]; then
         # v4/P2: strip fix/ as well as feat/. bkit-debug's fix PR body carries NO
         # bkit:fid= marker (bkit-debug.md:1244-1249), so fix/** ALWAYS lands here —
         # a feat/-only strip leaves 'fix/363-...', which matches neither alternation
         # and no-ops the entire fix/** surface this plan claims to fold in.
         # NOTE the '#' sed delimiter: with the '|' delimiter the alternation would
         # have to be escaped as \| and is then ambiguous under -E. Do not "simplify".
         FID=$(echo "$BRANCH" | sed -E 's#^(feat|fix)/##' | grep -oE '^[0-9]+|^[a-z]+-[0-9]+' | head -1)
         ISSUE="$FID"
       fi
       if [ -z "$FID" ] || [ -z "$ISSUE" ]; then
         echo "::notice::Cannot derive FID/ISSUE for branch $BRANCH — no-op exit (fail-safe)."
         echo "skip=true" >> "$GITHUB_OUTPUT"; exit 0
       fi
       ISSUE_LABELS=$(gh issue view "$ISSUE" --json labels --jq '[.labels[].name] | join(",")' 2>/dev/null || echo "")
       if ! echo "$ISSUE_LABELS" | grep -q 'bkit:auto'; then
         echo "::notice::Issue #$ISSUE no longer carries bkit:auto — no-op exit (kill switch)."
         echo "skip=true" >> "$GITHUB_OUTPUT"; exit 0
       fi
       # v4/P3 — bound the fix/** debug loop. A fix/** CI FAILURE dispatches /bkit-debug,
       # whose fix push re-reds CI, which dispatches again: the same cross-session loop
       # MAX_DEV_DISPATCH_ATTEMPTS exists to bound, on a surface this plan newly opens.
       # v3 keyed the cap on BRANCH = dev, leaving fix/** unbounded. The counter is keyed
       # on the FID (shared with the dev path — one FID's post-feat debug budget, however
       # the failure surfaced), so the dev and fix/** cycles for a FID share one budget.
       # feat/** is deliberately NOT capped: it is pre-merge, PR-scoped, and already
       # bounded by the in-session MAX_DEBUG_ATTEMPT / MAX_NORMAL_ATTEMPT counters.
       case "$BRANCH" in
         fix/*)
           if [ "$PHASE" = "debug" ]; then
             bkit_dev_dispatch_guard "$FID" "$HEAD_SHA" || { echo "skip=true" >> "$GITHUB_OUTPUT"; exit 0; }
           fi
           ;;
       esac
     fi
     # bkit:end shared-deriv
   fi
   # Guard: arg must be alphanumeric/dash/dot/slash.
   if ! [[ "$ARG" =~ ^[0-9A-Za-z._/-]+$ ]]; then
     echo "::error::Invalid arg value '${ARG}' — aborting." >&2
     exit 1
   fi
   {
     echo "skip=false"
     echo "phase=$PHASE"
     echo "arg=$ARG"
   } >> "$GITHUB_OUTPUT"
   ```

   **Note:** The exact bash above is the spec; the builder applies it to BOTH jobs' ctx steps identically. The key additions vs today: (a) `COMMIT_MSG`/`HEAD_SHA` in `env:`, (b) the `if BRANCH == dev` branch with commit-scope FID recovery, (c) dev success -> skip, (d) stale-run guard Option A, (e) loop cap (distinct headSha count), (f) kill switch, (g) dev-dispatch write+commit+push before dispatch, (h) PR-lookup moved into `else`, (i) `shared-deriv` markers extended upward.

   **(v4) `bkit_dev_dispatch_guard` — factor the cap block into one shell function.** The dev branch and the new `fix/**` branch (P3) need byte-identical cap-check + counter-write + fail-closed-verify logic, and the block is ~35 lines. Duplicating it inline in two branches × two jobs = four copies is a drift hazard the `shared-deriv` marker pair exists to prevent. Define it ONCE at the top of the `else` (CI-driven) arm, inside `shared-deriv`, as `bkit_dev_dispatch_guard <FID> <HEAD_SHA>`, and call it from both branches. It encapsulates, in order: source `bkit-counter-bus-config.sh`; resolve `STATUS_DIR`/`STATUS_FILE`; count distinct `dev-dispatch` headShas for the FID; `return 1` with the operator-review `::notice::` if `>= MAX_DEV_DISPATCH_ATTEMPTS`; else append the row, commit `docs($FID): dev-dispatch telemetry [skip ci]`, push with retry, verify the row landed on `origin/dev`, and `return 1` with the fail-closed `::notice::` if it did not. `return 0` = proceed to dispatch. The dev branch's inline block above is the function body; the caller writes `bkit_dev_dispatch_guard "$FID" "$HEAD_SHA" || { echo "skip=true" >> "$GITHUB_OUTPUT"; exit 0; }`. Note the row `type` stays `dev-dispatch` for both surfaces — one budget per FID, one row type, no schema change (see Data Schema).

### `.bkit/workflows/bkit-auto.md` Step 1

1. **Step 1.5 (line 85):** Discriminate CI vs CI_DEV on ARG shape. When `MODE=CI` and ARG is non-numeric, switch to CI_DEV and derive FID/ISSUE_ID/BRANCH directly (no PR lookup):

   ```bash
   if [ "$MODE" = "CI" ]; then
     if [[ "$ARG" =~ ^[0-9]+$ ]]; then
       PR_NUMBER="$ARG"      # CI mode — ARG is numeric PR number
     else
       # CI_DEV mode — ARG is a FID slug (e.g. 363-widen-bkit-cloud-trigger).
       # Dev-triggered dispatch from bkit-cloud.yml; no open PR (already squash-merged).
       MODE=CI_DEV
       FID="$ARG"
       ISSUE_ID=$(printf '%s' "$FID" | grep -oE '^[0-9]+')
       BRANCH=dev
       HEAD_SHA=$(git rev-parse origin/dev 2>/dev/null || echo "")
       PR_STATE=MERGED       # semantic: the feature PR was already merged
       PR_URL="(merged)"
       RUN_ID=""             # no open-PR run to link; Step 11 comment omits the actions link
     fi
   fi
   ```

   Assert `ISSUE_ID` non-empty after derivation (else Failure Path).

2. **Steps 6-8 (lines 86-92):** Gate on `MODE=CI` only. CI_DEV mode skips PR lookup (`gh pr view`), `PR_STATE` assert, and `RUN_ID` resolution (all six vars already set in Step 1.5).

3. **Step 7 (line 87):** `PR_STATE != OPEN -> Failure Path` — gate on `MODE=CI` only. CI_DEV mode skips this assert (the PR is intentionally already merged).

4. **Step 9 (lines 93-117):** `Extract ISSUE_ID and FID from PR body metadata` via `pull_request_read` — gate on `MODE=CI` only (Review 1 M5). CI_DEV mode skips this (PR_NUMBER is empty; FID/ISSUE_ID already derived from ARG in Step 1.5).

5. **Step 10 (line 118):** `BRANCH does NOT start with feat/ -> Failure Path` — gate on `MODE=CI` only. CI_DEV mode has `BRANCH=dev` (intentionally not `feat/`); FID already set.

   **(v4/P2) The `MODE=CI` gate is not sufficient — Step 10 must also accept `fix/`.** A `fix/**` PR run IS `MODE=CI` (numeric PR ARG, open PR), so gating Step 10 on `MODE=CI` leaves it firing for exactly the surface this plan newly folds in, and its verbatim text today is `**If** BRANCH does NOT start with feat/ -> **Failure Path**. **Else** -> FID="${BRANCH#feat/}"`. That routes every `fix/**` dispatch into the Failure Path, which posts a failure comment and sets `bkit:failed` on the issue — strictly worse than today's silence. Rewrite Step 10 to accept both prefixes and strip whichever matched:

   ```bash
   case "$BRANCH" in
     feat/*) FID="${BRANCH#feat/}" ;;
     fix/*)  FID="${BRANCH#fix/}" ;;
     *) : ;;   # -> Failure Path
   esac
   ```

   Keep the existing post-strip asserts unchanged (`FID` non-empty, `FID != BRANCH`, `[[ "{FID}" =~ ^[a-z0-9][a-z0-9-]*$ ]]`). Note the existing charset assert already admits the Linear `bar-123-slug` shape, so no P5 change is needed here.

6. **Step 11 comment body (lines 126-134):** The actions-link line `[{OWNER_REPO}/actions/run/{RUN_ID}]` is rendered ONLY when `RUN_ID` is non-empty (gate the line on `MODE=CI`, or on `[ -n "$RUN_ID" ]`). In CI_DEV, `RUN_ID` is empty -> omit the actions link (Review 3 F6.3). The branch/PR lines render with `dev` / `(none)` / `(merged)` harmlessly.

7. **Gate 1 checklist (line 141):** Add `CI_DEV placeholders non-empty (FID, ISSUE_ID, BRANCH, HEAD_SHA, if MODE = CI_DEV)`.

### `.bkit/workflows/bkit-debug.md` — NO CODE CHANGES

The existing 3-way worktree fallback at `bkit-debug.md:318-327` already creates `fix/{FID}` off `origin/dev` when `feat/{FID}` is absent (the exact post-merge condition — squash-merge's `--delete-branch` deletes `feat/{FID}`):

```bash
if git show-ref --verify --quiet "refs/heads/feat/{FID}"; then
  git worktree add "$WORKTREE_PATH" "feat/{FID}"
elif git fetch origin "feat/{FID}" 2>/dev/null \
     && git show-ref --verify --quiet "refs/remotes/origin/feat/{FID}"; then
  git worktree add "$WORKTREE_PATH" --track -b "feat/{FID}" "origin/feat/{FID}"
else
  git fetch origin dev
  git worktree add "$WORKTREE_PATH" -b "fix/{FID}" origin/dev
fi
```

Step 1.6 PUSH_MODE auto-detect (`bkit-debug.md:179-181`) already returns `PUSH_MODE=LOCAL` for `fix/{FID}` (no open PR). The v1 plan's `CI_DEV` branch-selection edit and telemetry write are DROPPED — `bkit-debug` has no `CI_DEV` concept, and the `dev-dispatch` counter write lives in the cloud ctx step (the component that knows `BRANCH=dev`). This task is VERIFY-ONLY (see Task 3).

### `.bkit/workflows/bkit-ship.md` Step 5

1. **(v4/P1 — REWRITTEN. v3's version of this item was authored against a file that no longer exists in that shape.)** v3 said: "Thread `AUTO_ROUTE_SUFFIX` (already derived on line 626) … This is the **entire** Option A change — one suffix appended to one `--subject` flag." That is now false. #384 (80660ac0) deleted every `AUTO_ROUTE_SUFFIX` derivation from `bkit-ship.md`; `grep -c 'AUTO_ROUTE_SUFFIX' .bkit/workflows/bkit-ship.md` returns **0**. Task 4 must therefore ADD the derivation as well as thread it, in the **same shell block** as the merge (the value must not be assumed to survive a Bash-tool-call boundary — this is why `bkit-debug.md:1253` says "set and use `AUTO_ROUTE_SUFFIX` in same shell").

   At **line 682** (v3 said 634-635), inside the existing `gh pr merge` block:

   ```bash
   # Before (dev @ d87c8641):
   if [ "$(gh pr view {PR_NUMBER} --json state --jq .state 2>/dev/null)" != "MERGED" ]; then
     gh pr merge {PR_NUMBER} --squash --delete-branch --match-head-commit "$GATE_HEAD" \
       --subject "$(gh pr view {PR_NUMBER} --json title --jq .title) (#{PR_NUMBER})" \
       --body ""
   fi
   # After:
   AUTO_ROUTE_SUFFIX=""
   echo "${LABELS:-}" | grep -q 'bkit:auto' && AUTO_ROUTE_SUFFIX=" bkit [auto route]" || true
   if [ "$(gh pr view {PR_NUMBER} --json state --jq .state 2>/dev/null)" != "MERGED" ]; then
     gh pr merge {PR_NUMBER} --squash --delete-branch --match-head-commit "$GATE_HEAD" \
       --subject "$(gh pr view {PR_NUMBER} --json title --jq .title) (#{PR_NUMBER})${AUTO_ROUTE_SUFFIX}" \
       --body ""
   fi
   ```

   The derivation idiom is copied verbatim from `bkit-build.md:1261` and `bkit-debug.md:1262`, which both still carry it — do NOT invent a new one. `{LABELS}` is populated at ship Step 1 from the tracker read (`bkit-ship.md:247` / `:250`); assert it is in scope in this block, since after #384 it is an agent-substituted placeholder rather than an exported shell var. When `bkit:auto` is labeled the squash-merge commit on `dev` carries the marker and the existing `bkit-cloud.yml` gate matches it for the `dev` trigger; when not, the suffix is empty and nothing changes. The HEAD-Subject Assertion (**`bkit-ship.md:647`**, v3 said 598) already rejects `[skip ci]` in PR titles, so the squash subject cannot accidentally carry a suppressor.

2. **(v4) Accepted cosmetic consequence — the marker becomes permanent `dev` history.** Until now `bkit [auto route]` only ever appeared on ephemeral `feat/{FID}` commits that were squashed away at merge. Threading it onto the squash `--subject` puts it in `git log dev` forever, and into anything generated from commit subjects (release notes, `git shortlog`). This is inherent to Option A — the gate reads `head_commit.message`, so the marker must be on the commit that lands. Accepted, not a defect; recorded so it is not "cleaned up" later by someone who does not know it is load-bearing. `.bkit/workflows.md` § `bkit [auto route]` Marker Propagation should gain the squash-merge row (folded into Task 5's doc sweep).

### `.bkit/scripts/bkit-counter-bus-config.sh`

1. **Add `MAX_DEV_DISPATCH_ATTEMPTS` under a NEW `# bkit-cloud.yml counters` section (it is consumed by the cloud ctx step, not bkit-debug):**
   ```sh
   # bkit-debug.md counters (mode-matched pairs — DE-25, DE-36)
   MAX_DEBUG_ATTEMPT=3
   MAX_NORMAL_ATTEMPT=3
   MAX_SOAK_ATTEMPT=3

   # bkit-cloud.yml counters
   MAX_DEV_DISPATCH_ATTEMPTS=3   # #363 — cross-session dev-triggered debug dispatch cap (distinct failed dev CI SHAs per FID)
   ```

### `.bkit/cloud.md`

1. **Decision log:** Add `## #363 — widen bkit-cloud trigger to post-merge dev CI` entry documenting: Option A rationale, dev vs feat routing table, stale-run guard Option A (CI-run recency, NOT git-tip), loop-bound decision (cap=3 distinct headSha, all-time, written by ctx step before dispatch), concurrency decision (`cancel-in-progress: false` for dev — QUEUES, not drops).

2. **Routing table:** Add `dev` row: trigger = `workflow_run` on `dev` CI; success = no-op; failure = `/bkit-debug {FID}`; FID source = commit scope (fallback `gh api`); concurrency = `cancel-in-progress: false` (queue); loop cap = `MAX_DEV_DISPATCH_ATTEMPTS` (distinct headSha).

### `docs/deployments.md`

1. **CI/CD matrix:** Add `dev` branch row — post-merge CI fires `workflow_run`; success = no-op; failure = auto-dispatch `/bkit-debug`. Note the docs-only-diff precondition: the dev-trigger path assumes the consumer's `ci.yml` neutralises (not reds) Vercel-CANCELED builds.

2. **Auto-route contract:** Note that the `bkit [auto route]` marker is now threaded onto the squash-merge `--subject` (not just the sync-merge commit), enabling the `dev` trigger gate.

3. **Consumer-repo acceptance note (Task 10 owner surface — scope-check F3):** A dedicated "Consumer-repo acceptance note" section in this same file (co-located with the `dev` CI/CD matrix row added by Task 6) documents that the full happy-path loop is only exercisable on consumer repos with `bkit-cloud.yml` installed and secrets wired. This resolves the prior `.bkit/cloud.md` **or** `docs/deployments.md` disjunction to a single concrete owner file so a builder/reviewer is not guessing.

### `docs/security.md`

1. **§ CI Auto-Route Trust:** Add subsection for `dev` push trigger — trust surface is the squash-merge commit scope (validated against FID slug allowlist); dynamic values via `env:` (injection-safe); no PR body involved; kill switch (label re-check) and loop cap apply identically.

---

## Supersession Inventory

No plan superseded. This is a new feature plan for #363. Related issues (#119, #397, #80) are referenced but not superseded.

---

## Documentation Updates

<!-- prettier-ignore -->
| File | Change |
| --- | --- |
| `.bkit/cloud.md` | Decision log entry + routing table `dev` row + loop-bound note + stale-guard Option A note |
| `docs/deployments.md` | CI/CD matrix `dev` branch row + auto-route contract update + docs-only-diff precondition + consumer-repo acceptance note (Task 10 — scope-check F3 resolved here) |
| `docs/security.md` | § CI Auto-Route Trust — `dev` push trigger trust surface (env-safe) |
| `CHANGELOG.md` | Unreleased entry: "widen bkit-cloud trigger to post-merge `dev` CI (#363)" |

---

## Rollback Strategy

**Feature is gated and additive.** Rollback path:

1. Revert `workflow_run.branches` from `['feat/**', 'fix/**', 'dev']` to `['feat/**']` — `dev` trigger stops firing immediately. No data migration, no schema change.
2. The `dev-dispatch` status.jsonl rows + `docs({FID}): dev-dispatch telemetry [skip ci]` commits are harmless additive data; no cleanup needed.
3. The `bkit-ship` `--subject` suffix change (`AUTO_ROUTE_SUFFIX` threading) is backward-compatible — removing it only means `dev` CI runs don't carry the marker (which is fine if the trigger is reverted).
4. The `bkit-auto` CI_DEV mode is dead code if the trigger is reverted (never reached); no runtime impact.
5. Version bump (4.11.0) stays — it's a forward-only release tag.

**Partial rollback (disable loop cap only):** Set `MAX_DEV_DISPATCH_ATTEMPTS=999` in `bkit-counter-bus-config.sh` — effectively unbounded dispatch, restoring the "uncapped loop" behaviour while keeping the trigger widening.

---

## Agent Execution Runbook

> Gate 2 — tasks with explicit `Depends on` fields. `[ ]` = pending. Check after completion.
> **Same-file note:** Task 1 owns the entire `.bkit/templates/.github/workflows/bkit-cloud.yml` + `bkit-counter-bus-config.sh` surface (the v1 split across three tasks with an undeclared dependency is merged into one — Review 1 M1 / Review 2 #1 / Review 2 #8). Execute Task 1 fully before Task 2 (Task 2's CI_DEV mode is dead code until Task 1's ctx step dispatches a non-numeric ARG).
>
> **(v4) Same-file note extends to the new tasks.** Tasks **11** and **13** edit the SAME `bkit-cloud.yml` ctx step as Task 1 — apply all three in ONE edit pass over that managed block, or the second pass will fight the first. Task **12** edits the same `bkit-auto.md` Step 1 region as Task 2 — apply together. Task **14** is independent bookkeeping. Ordering: `1+11+13` -> `2+12` -> `3`-`7` -> `8` -> `9`. Task 4 carries a **PRE-CHECK that voids the task** if its premise has shifted again since this revision (P1) — run it before touching `bkit-ship.md`.

### Task 1 — Cloud trigger surface (trigger widen + concurrency + ctx step dev branch + counter-bus-config + dev-dispatch write)

- [ ] **Scope:** `.bkit/templates/.github/workflows/bkit-cloud.yml` (both `run`/claude and `opencode` jobs) + `.bkit/scripts/bkit-counter-bus-config.sh`.
- [ ] **Depends on:** none.
- [ ] **Sub-step 1a — counter-bus-config:** Add `# bkit-cloud.yml counters` section with `MAX_DEV_DISPATCH_ATTEMPTS=3` after the bkit-debug section (Review 2 L12 — new section header, not crammed under bkit-debug).
- [ ] **Sub-step 1b — trigger filter:** Change `workflow_run.branches` from `['feat/**']` to `['feat/**', 'fix/**', 'dev']`.
- [ ] **Sub-step 1c — concurrency:** Change `cancel-in-progress` from `true` to `${{ github.event.workflow_run.head_branch != 'dev' }}`.
- [ ] **Sub-step 1d — header comment:** Replace lines 14-19 with the verbatim text in Architecture section item 1 (Review 2 L11).
- [ ] **Sub-step 1e — ctx step env (both jobs):** Add `COMMIT_MSG: ${{ github.event.workflow_run.head_commit.message }}` and `HEAD_SHA: ${{ github.event.workflow_run.head_sha }}` to the `env:` block (injection-safe — Review 1 M3).
- [ ] **Sub-step 1f — ctx step run (both jobs):** Insert the `if [ "$BRANCH" = "dev" ]` branch after the `case "$CONCLUSION"` and before `gh pr list`; move PR-lookup into `else`; extend `shared-deriv` markers. Implement: commit-scope FID recovery (primary) + `gh api repos/$GITHUB_REPOSITORY/commits/$HEAD_SHA/pulls` (fallback — Review 2 M4); FID slug assertion; dev-success -> skip; stale-run guard Option A (`gh run list --branch dev --workflow ci.yml --status completed` — Review 3 F1); loop cap (`. "$GITHUB_WORKSPACE/.bkit/scripts/bkit-counter-bus-config.sh"` — Review 1 M2 / Review 2 #3; distinct headSha count); kill switch (`bkit:auto` re-check); dev-dispatch write + `git commit -m "docs($FID): dev-dispatch telemetry [skip ci]"` + push (Review 1 H1 / Review 2 #2 / Review 3 F3 — writer co-located with reader, before dispatch). **(v4)** The push is **fail-closed**, not `|| <notice>`: retry against a re-fetched `dev`, then verify the row is on `origin/dev`, else `skip=true` (P6). FID recovery is **tracker-agnostic** — both `363-slug` and `bar-123-slug` shapes (P5). The cap block is factored into `bkit_dev_dispatch_guard` so Task 13 can reuse it for `fix/**` (P3).
- [ ] **Done when:**
  - `yq '.on.workflow_run.branches' .bkit/templates/.github/workflows/bkit-cloud.yml` contains `dev`.
  - `yq '.concurrency.cancel-in-progress'` is the dev-discriminating expression.
  - Both jobs' ctx `env:` blocks contain `COMMIT_MSG` and `HEAD_SHA`.
  - `grep MAX_DEV_DISPATCH_ATTEMPTS .bkit/scripts/bkit-counter-bus-config.sh` returns the line; `source` the file and `echo $MAX_DEV_DISPATCH_ATTEMPTS` prints `3`.
  - Bash dry-run (harness below): `BRANCH=dev CONCLUSION=failure COMMIT_MSG="feat(363-widen-bkit-cloud-trigger): test (#1) bkit [auto route]"` -> `phase=debug`, `arg=363-widen-bkit-cloud-trigger`, `skip=false`; `BRANCH=dev CONCLUSION=success` -> `skip=true`; seed 3 distinct-headSha `dev-dispatch` rows -> `skip=true` + notice.
- [ ] **Test ref:** T1, T2, T3, T4, T5, T10.

**Dry-run harness (Task 1f):** Extract the `run:` block via `yq -r '.jobs.run.steps[] | select(.name=="Resolve phase + brief context") | .run' .bkit/templates/.github/workflows/bkit-cloud.yml`. `export GITHUB_OUTPUT=$(mktemp) GITHUB_WORKSPACE="$PWD" GITHUB_REPOSITORY="owner/repo"`; export `BRANCH`/`CONCLUSION`/`COMMIT_MSG`/`HEAD_SHA`/`EVENT`; stub `gh` (e.g. `GH_HOST=invalid` for fail-safe paths, or a shell function returning canned JSON for `gh run list`/`gh issue view`); read `$GITHUB_OUTPUT` to assert `phase=`/`arg=`/`skip=` (Review 2 L13). This same harness pattern is reused by Task 2's `gh pr view` sentinel (F1) and Task 9's regression dry-runs.

### Task 2 — Extend `bkit-auto.md` Step 1 for CI_DEV mode

- [ ] **Scope:** `.bkit/workflows/bkit-auto.md` Step 1, lines 85-118 + Step 11 comment (lines 126-134) + Gate 1 checklist (line 141).
- [ ] **Depends on:** Task 1 (ctx step must dispatch non-numeric ARG for CI_DEV to be reachable).
- [ ] Step 1.5: discriminate `[[ "$ARG" =~ ^[0-9]+$ ]]` -> CI (PR_NUMBER) vs CI_DEV (FID, ISSUE_ID from numeric prefix, BRANCH=dev, HEAD_SHA, PR_STATE=MERGED, RUN_ID="").
- [ ] Steps 6-8: gate on `MODE=CI`; in CI_DEV the six vars are pre-set, skip `gh pr view`/RUN_ID.
- [ ] Step 7 (`PR_STATE != OPEN -> Failure Path`): gate on `MODE=CI`.
- [ ] Step 9 (`pull_request_read` PR-body FID extraction): gate on `MODE=CI` (Review 1 M5).
- [ ] Step 10 (`BRANCH does NOT start with feat/ -> Failure Path`): gate on `MODE=CI`.
- [ ] Step 11 comment: gate the `actions/run/{RUN_ID}` link on `MODE=CI` (or `[ -n "$RUN_ID" ]`) — CI_DEV omits it (Review 3 F6.3).
- [ ] Gate 1 checklist: add `CI_DEV placeholders non-empty (FID, ISSUE_ID, BRANCH, HEAD_SHA, if MODE = CI_DEV)`.
- [ ] ASCII-only operators in all `.bkit/workflows/*.md` edits (no non-ASCII arrows/quotes in managed blocks).
- [ ] **Done when:** A dry-run invocation with `ARG=363-widen-bkit-cloud-trigger` (non-numeric) sets `MODE=CI_DEV`, `FID=363-widen-bkit-cloud-trigger`, `ISSUE_ID=363`, `BRANCH=dev`; Step 11 comment omits the actions link.
- [ ] **Verification (scope-check F1 — observable negative):** The "does NOT call `gh pr view`" criterion is made observable by wiring the Task 1f harness `gh`-stubbing pattern to a sentinel. Before the Step 1.5 dry-run with `ARG=363-widen-bkit-cloud-trigger`, install a recording stub, e.g.:
  ```bash
  GH_CALLS=$(mktemp)
  gh() { echo "called: $*" >> "$GH_CALLS"; }
  export -f gh
  # ... run the Step 1.5 logic with ARG=363-widen-bkit-cloud-trigger ...
  ```
  After the dry-run, assert the sentinel contains no `pr view` invocation:
  ```bash
  ! grep -q 'pr view' "$GH_CALLS"   # exit 0 = pass (no pr view call recorded)
  ```
  This reuses the Task 1f harness precedent and gives a builder/reviewer a concrete, objective proof that CI_DEV mode skips the PR lookup — the negative criterion is no longer unobservable (scope-check-1 F1).
- [ ] **Test ref:** T6, T7.

### Task 3 — Verify `bkit-debug.md` needs no changes (verify-only)

- [ ] **Scope:** `.bkit/workflows/bkit-debug.md` — READ ONLY (no edits).
- [ ] **Depends on:** none (verification of existing behaviour).
- [ ] Confirm `bkit-debug.md:318-327` 3-way fallback creates `fix/{FID}` off `origin/dev` when `feat/{FID}` is absent (post-merge condition).
- [ ] Confirm `bkit-debug.md:179-181` Step 1.6 `gh pr list --head $(git branch --show-current) --base dev` returns nothing for `fix/{FID}` (no open PR) -> `PUSH_MODE=LOCAL`.
- [ ] Confirm NO `CI_DEV` references are added (the dead signal is dropped — Review 1 M4 / Review 2 #2; the `dev-dispatch` write lives in the cloud ctx step).
- [ ] **Done when:** Read confirms both existing behaviours cover the dev path; no diff to `bkit-debug.md`.
- [ ] **Verification (scope-check F2 — objective zero-diff proof):** The "no diff" criterion is made objective with an explicit exit-code check. Run after the full build completes (this task asserts the file is never touched by any other task):
  ```bash
  git diff --exit-code -- .bkit/workflows/bkit-debug.md   # exit 0 = no diff = PASS
  ```
  Equivalently, `git status --porcelain .bkit/workflows/bkit-debug.md` asserts empty output. This aligns the verification strength with the "no diff" criterion — a builder can no longer accidentally edit `bkit-debug.md` and pass on a soft "Read confirms" check (scope-check-1 F2).
- [ ] **Test ref:** T8.

### Task 4 — Thread `AUTO_ROUTE_SUFFIX` into `bkit-ship.md` squash `--subject`

- [ ] **Scope:** `.bkit/workflows/bkit-ship.md` — the `gh pr merge --squash` block at **line 682** (v3 said "Step 5, lines 634-635"; both the step structure and the line numbers changed under #384).
- [ ] **Depends on:** none.
- [ ] **PRE-CHECK (v4/P1 — do this first, the task is void if it fails):** `grep -c 'AUTO_ROUTE_SUFFIX' .bkit/workflows/bkit-ship.md` must return `0`. If it returns non-zero, #384's removal has been reverted since this plan was revised — re-read the file and re-scope this task before editing.
- [ ] ADD the derivation immediately above the `gh pr merge` call, in the SAME shell block: `AUTO_ROUTE_SUFFIX=""` then `echo "${LABELS:-}" | grep -q 'bkit:auto' && AUTO_ROUTE_SUFFIX=" bkit [auto route]" || true`. Copy the idiom verbatim from `bkit-build.md:1261`; do not invent a variant.
- [ ] Append `${AUTO_ROUTE_SUFFIX}` to the `--subject` value (after `(#{PR_NUMBER})`).
- [ ] Assert `{LABELS}` is in scope in that block (populated at ship Step 1 tracker read, `bkit-ship.md:247`/`:250`). Under `bkit:tracker none` it is empty -> suffix empty -> no marker, which is correct.
- [ ] **Done when:** Read: the `gh pr merge` block derives AND threads `${AUTO_ROUTE_SUFFIX}`; bash unit: `LABELS=bkit:auto` -> subject ends with `bkit [auto route]`; `LABELS=""` -> subject unchanged; `grep -c 'AUTO_ROUTE_SUFFIX' .bkit/workflows/bkit-ship.md` = 2.
- [ ] **Test ref:** T9.

### Task 5 — Update `.bkit/cloud.md` (decision log + routing table)

- [ ] **Scope:** `.bkit/cloud.md`.
- [ ] **Depends on:** none.
- [ ] Add decision-log entry `## #363 — widen bkit-cloud trigger to post-merge dev CI`.
- [ ] Document: Option A rationale; dev vs feat routing table; stale-run guard Option A (CI-run recency via `gh run list`, NOT git-tip — with the close-commit-race justification); loop-bound decision (cap=3 distinct headSha, all-time, written by ctx step before dispatch); concurrency decision (`cancel-in-progress: false` for dev — QUEUES not drops, queued run re-evaluates cap); FID recovery (commit scope + `gh api` fallback).
- [ ] **Done when:** `cloud.md` contains the decision-log entry with the routing table and all decisions documented.
- [ ] **Test ref:** N/A (documentation).

### Task 6 — Update `docs/deployments.md` (CI/CD matrix + auto-route contract + docs-only-diff precondition)

- [ ] **Scope:** `docs/deployments.md`.
- [ ] **Depends on:** none.
- [ ] CI/CD matrix: add `dev` branch row (post-merge CI -> `workflow_run` -> success=no-op, failure=`/bkit-debug`).
- [ ] Auto-route contract: document that `bkit [auto route]` is now threaded onto the squash-merge `--subject` (Option A), enabling the `dev` trigger gate.
- [ ] Docs-only-diff precondition: note that the dev-trigger path assumes the consumer's `ci.yml` neutralises (not reds) Vercel-CANCELED builds (Review 3 F4). This is the AUTHORITATIVE location for that note; Task 10 cross-references it rather than restating it.
- [ ] **Done when:** `deployments.md` CI/CD matrix includes a `dev` row with the post-merge routing + docs-only-diff precondition.
- [ ] **Test ref:** N/A (documentation).

### Task 7 — Update `docs/security.md` § CI Auto-Route Trust

- [ ] **Scope:** `docs/security.md` § CI Auto-Route Trust.
- [ ] **Depends on:** none.
- [ ] Add `dev` push trigger subsection: trust surface = squash-merge commit scope (FID slug allowlist); dynamic values via `env:` (injection-safe); no PR body; kill switch (label re-check) applies; loop cap (`MAX_DEV_DISPATCH_ATTEMPTS=3`, distinct headSha) as cost control.
- [ ] **Done when:** `security.md` § CI Auto-Route Trust documents the `dev` trust surface.
- [ ] **Test ref:** N/A (documentation).

### Task 8 — Mirror regen + version bump + CHANGELOG

- [ ] **Scope:** `.bkit/version`, `package.json`, `CHANGELOG.md`, `.claude/`, `.cursor/`, `.opencode/`.
- [ ] **Depends on:** Tasks 1-7 (must run after all canonical `.bkit/` edits).
- [ ] Bump `.bkit/version` `pinnedVersion` 4.10.0 -> 4.11.0.
- [ ] Bump `package.json` `version` 4.10.0 -> 4.11.0.
- [ ] `CHANGELOG.md` Unreleased: add `widen bkit-cloud trigger to post-merge dev CI (#363)`.
- [ ] Run `pnpm bkit upgrade` to regenerate `.claude/`, `.cursor/`, `.opencode/` mirrors from `.bkit/`.
- [ ] Verify mirrors in sync: `git diff --stat` shows mirror files updated, `.bkit/` canonical files are the source.
- [ ] ASCII-only operators in all `.bkit/workflows/*.md` and `.bkit/prompts/*.md` content (no non-ASCII arrows/quotes in managed blocks).
- [ ] **Done when:** `jq -r .version package.json` = `4.11.0`; `grep pinnedVersion .bkit/version` = `4.11.0`; `CHANGELOG.md` has the entry; `pnpm bkit upgrade` produces no unexpected diff.
- [ ] **Test ref:** T11, T12.

### Task 9 — In-repo validation

- [ ] **Scope:** all changed files.
- [ ] **Depends on:** Tasks 1-8.
- [ ] YAML structure valid: `yq` parse `bkit-cloud.yml` (template + installed) succeeds; trigger filter + concurrency + ctx step all present.
- [ ] Ctx step bash dry-run (harness per Task 1f): `BRANCH=dev CONCLUSION=failure COMMIT_MSG="feat(363-widen-bkit-cloud-trigger): test (#1) bkit [auto route]"` -> assert `phase=debug`, `arg=363-widen-bkit-cloud-trigger`, `skip=false`.
- [ ] Ctx step bash dry-run: `BRANCH=dev CONCLUSION=success` -> assert `skip=true`.
- [ ] Ctx step bash dry-run: seed 3 distinct-headSha `dev-dispatch` rows -> assert `skip=true` + notice; 3 same-headSha rows -> assert `skip=false` (distinct-cycle counting).
- [ ] `bkit-auto` Step 1 dry-run: `ARG=363-widen-bkit-cloud-trigger` -> `MODE=CI_DEV`, no `gh pr view` (asserted via Task 2 F1 sentinel), `ISSUE_ID=363`.
- [ ] `bkit-ship` Step 5 read: `--subject` includes `${AUTO_ROUTE_SUFFIX}`.
- [ ] `bkit-counter-bus-config.sh` sources cleanly; `MAX_DEV_DISPATCH_ATTEMPTS=3`.
- [ ] `bkit-debug.md` zero-diff: `git diff --exit-code -- .bkit/workflows/bkit-debug.md` exits 0 (Task 3 F2).
- [ ] **(v4) `fix/**` dry-runs:** ctx step `BRANCH=fix/363-widen-bkit-cloud-trigger` -> `FID=363` (T13); `bkit-auto` Step 10 `MODE=CI BRANCH=fix/363-...` reaches Step 11, not the Failure Path (T14); `BRANCH=fix/363-x CONCLUSION=failure` + 3 distinct-headSha rows -> `skip=true`, and `feat/**` + `failure` does NOT consult the cap (T15).
- [ ] **(v4) Tracker-agnostic dry-run:** `BRANCH=dev COMMIT_MSG="feat(bar-123-auth): x"` -> `FID=bar-123-auth`, `ISSUE=bar-123` (T16).
- [ ] **(v4) Fail-closed dry-run:** `git` stub whose `push` always fails and whose `origin/dev` lacks the row -> `skip=true` + fail-closed notice, and NO `phase=`/`arg=` emitted (T17).
- [ ] **(v4) Anchor re-verification before build:** re-run the P7 anchor checks (`grep -c 'AUTO_ROUTE_SUFFIX' .bkit/workflows/bkit-ship.md` = 2 after Task 4; squash `--subject`, close commit and HEAD-Subject Assertion still where this revision says). `bkit-ship.md` moved twice in one afternoon; do not trust a line number this plan states without re-grepping.
- [ ] `pnpm turbo lint typecheck` (or repo equivalent) passes.
- [ ] **Done when:** All dry-run assertions pass; lint/typecheck green; `bkit-debug.md` zero-diff holds.
- [ ] **Test ref:** T1-T17.

### Task 10 — Consumer-repo acceptance note (exercisable-path docs)

- [ ] **Scope:** `docs/deployments.md` — a dedicated "Consumer-repo acceptance note" section (CANONICAL OWNER — scope-check F3 resolution). The prior `.bkit/cloud.md` **or** `docs/deployments.md` disjunction is collapsed to `docs/deployments.md` so a builder/reviewer is not guessing. Task 6 owns the `dev` CI/CD matrix ROW + the docs-only-diff precondition NOTE inline in that row; Task 10 owns a DISTINCT "Consumer-repo acceptance note" section describing the full exercisable happy-path loop — the two do NOT duplicate. (Rationale: Task 6 already adds the `dev` row to `deployments.md`; co-locating the acceptance note avoids splitting deployment-related docs across `cloud.md`, which Task 5 owns as the decision-log surface.)
- [ ] **Depends on:** none.
- [ ] Document: the `dev`-trigger happy path can only be fully exercised on consumer repos (`app-gether-life`, `visitfrasercoast-com`) that run CI on `push: branches: [dev]` and have `bkit-cloud.yml` installed with secrets. This repo (bkit itself) dogfoods the YAML structure but the full `workflow_run -> /bkit-debug -> fix -> dev CI` loop requires a real consumer repo with `ANTHROPIC_API_KEY` / `OPENCODE_PROVIDER_KEY` secret wired.
- [ ] Cross-reference the docs-only-diff precondition from Task 6's `dev` matrix row (do NOT re-state it — Task 6 owns that note; Task 10 points to it to avoid the duplication risk flagged in scope-check-1 F3).
- [ ] **Done when:** `docs/deployments.md` has a dedicated "Consumer-repo acceptance note" section documenting the consumer-repo-only exercisable happy path, cross-referencing Task 6's docs-only-diff precondition note.
- [ ] **Test ref:** N/A (documentation).

### Task 11 — Make `fix/**` FID recovery work in the cloud ctx step (v4/P2)

- [ ] **Scope:** `.bkit/templates/.github/workflows/bkit-cloud.yml` — the `else` (PR-backed) arm of the ctx step, both jobs. Same file as Task 1; execute as part of the Task 1 edit pass to avoid two rewrites of one managed block.
- [ ] **Depends on:** Task 1 (same surface).
- [ ] Change the branch-strip fallback from `sed 's|^feat/||'` to `sed -E 's#^(feat|fix)/##'`. Keep the `#` delimiter — with `|` the alternation needs escaping and is ambiguous under `-E`.
- [ ] Rationale to preserve in a comment: `bkit-debug.md:1244-1249` creates the fix PR with NO `bkit:issue=` / `bkit:fid=` body markers, so `fix/**` ALWAYS reaches this fallback; a `feat/`-only strip no-ops the entire surface.
- [ ] **Done when:** bash unit against the extracted `run:` block: `BRANCH=fix/363-widen-bkit-cloud-trigger` -> `FID=363`, `ISSUE=363` (matching today's `feat/**` behaviour for a slugged branch); `BRANCH=fix/bar-123-auth` -> `FID=bar-123` (Linear shape); `BRANCH=feat/141-cloud-app` -> unchanged from today.
- [ ] **Test ref:** T13.

### Task 12 — Accept `fix/` in `bkit-auto.md` Step 10 (v4/P2)

- [ ] **Scope:** `.bkit/workflows/bkit-auto.md` Step 10 (line 118).
- [ ] **Depends on:** Task 11 (a `fix/**` dispatch must be reachable before this assert matters). Execute with Task 2 — same file, same edit pass.
- [ ] Replace the `feat/`-only prefix assert with a `case` accepting `feat/*` and `fix/*` and stripping whichever matched; anything else -> Failure Path (unchanged).
- [ ] Keep the existing post-strip asserts verbatim (`FID` non-empty, `FID != BRANCH`, charset `^[a-z0-9][a-z0-9-]*$`).
- [ ] ASCII-only operators.
- [ ] **Done when:** Read: Step 10 accepts both prefixes; dry-run `BRANCH=fix/363-widen-bkit-cloud-trigger` in `MODE=CI` reaches Step 11 (not the Failure Path) with `FID=363-widen-bkit-cloud-trigger`; `BRANCH=chore/x` still routes to the Failure Path.
- [ ] **Test ref:** T14.

### Task 13 — Bound the `fix/**` debug loop (v4/P3)

- [ ] **Scope:** `.bkit/templates/.github/workflows/bkit-cloud.yml` ctx step, both jobs. Part of the Task 1 edit pass.
- [ ] **Depends on:** Tasks 1, 11.
- [ ] Factor the dev branch's cap-check + counter-write + fail-closed-verify block into a `bkit_dev_dispatch_guard <FID> <HEAD_SHA>` shell function defined once inside `shared-deriv` (see Architecture item 5's `bkit_dev_dispatch_guard` note). Call it from the dev branch and from a `case "$BRANCH" in fix/*)` guard in the `else` arm, the latter only when `PHASE = debug`.
- [ ] Do NOT cap `feat/**` — pre-merge, PR-scoped, already bounded by in-session `MAX_DEBUG_ATTEMPT` / `MAX_NORMAL_ATTEMPT`.
- [ ] Counter stays keyed on the FID with row type `dev-dispatch`: one post-`feat/**` debug budget per FID regardless of which surface the failure arrived on. No schema change.
- [ ] **Done when:** bash unit: `BRANCH=fix/363-x CONCLUSION=failure` with 3 distinct-headSha `dev-dispatch` rows for the FID -> `skip=true` + operator-review notice; `CONCLUSION=success` on `fix/**` -> `phase=ship`, cap NOT consulted; `BRANCH=feat/141-x CONCLUSION=failure` -> `phase=debug`, cap NOT consulted (no regression to the pre-merge path).
- [ ] **Test ref:** T15.

### Task 14 — Record the `main` exclusion as an explicit deferral (v4/P4)

- [ ] **Scope:** `docs/deferrals.jsonl` + the `#363` tracker issue.
- [ ] **Depends on:** none.
- [ ] Append one deferral row recording: #363's pivot comment D-final settled branch scope as `['feat/**','fix/**','dev','main']`; this plan ships without `main`; rationale = production trunk never auto-dispatches a paid agent AND the issue's own open item 3 (dev->main promotion commit authorship, hence marker placement) is unresolved and may be outside bkit's control for some consumers; revisit if/when a bkit-authored promotion path exists.
- [ ] Post the same decision change as a comment on #363 so the reversal is visible on the tracker, not only in the plan.
- [ ] **Why this task exists:** v3 moved `main` to Out of Scope with no deferral row and no tracker note, and scope-check-2 then certified the plan as "zero silent drops". This closes the bookkeeping hole, not the design question.
- [ ] **Done when:** `grep -c '363' docs/deferrals.jsonl` includes the new row; the comment is on #363.
- [ ] **Test ref:** N/A (bookkeeping).

---

## Verification Plan (Gate 4)

**Automated (in-repo):**

- `yq` parse of `bkit-cloud.yml` — trigger filter, concurrency, ctx step structure.
- Bash dry-runs of ctx step logic (mocked env vars, seeded status.jsonl — harness per Task 1f).
- `source bkit-counter-bus-config.sh && echo $MAX_DEV_DISPATCH_ATTEMPTS`.
- `bkit-auto` Step 1 CI_DEV dry-run with `gh` sentinel (Task 2 F1) — assert no `pr view` recorded.
- `git diff --exit-code -- .bkit/workflows/bkit-debug.md` — zero diff (Task 3 F2).
- `pnpm turbo lint typecheck` (or repo equivalent).
- Mirror diff check after `pnpm bkit upgrade`.

**Manual (consumer-repo, post-release):**

- On `app-gether-life` or `visitfrasercoast-com`: ship a `feat/{FID}` PR with `bkit:auto` label -> verify squash-merge to `dev` carries `bkit [auto route]` in the commit subject -> verify post-merge CI on `dev` -> if CI fails, verify `/bkit-debug` auto-dispatches -> verify `dev-dispatch` row in status.jsonl -> verify loop cap after 3 distinct failed SHAs.
- Verify `dev` CI success -> no dispatch (no-op).
- Verify docs-only squash-merge does NOT false-dispatch (Vercel-CANCELED neutralised, not red).

---

## Manual Verification

- Read the squash-merge commit on `dev` after a `/bkit-ship` — confirm the subject includes `bkit [auto route]` (when `bkit:auto` labeled) and does NOT include `[skip ci]`.
- Read the `docs({FID}): ship DONE bkit [skip ci]` close commit (`bkit-ship.md:1258`) — confirm it includes `[skip ci]` and does NOT include `bkit [auto route]`.
- Trigger a `workflow_dispatch` with `phase=debug issue=363` — confirm the existing manual path still works (no regression from the ctx step restructuring).

---

## Merge Method

**Squash merge** to `dev` via `/bkit-ship`. The squash subject will carry `bkit [auto route]` (this plan's change), making the post-merge CI on `dev` eligible to trigger the cloud workflow — dogfooding the feature on itself.

---

## Review Critique Resolution Index

Trace of every load-bearing critique from the three reviews and how this v3 (inherited from v2) resolves it.

<!-- prettier-ignore -->
| Critique | Severity | Resolution in v3 |
| --- | --- | --- |
| **R3 F1** stale-run guard unsound (close-commit race) | CRITICAL | Adopted **Option A**: `gh run list --branch dev --workflow CI --status completed` headSha comparison (close commits never appear — they carry `[skip ci]`). Dropped the `git rev-parse origin/dev` comparison. Justified in Open Questions #2 + Architecture section item 5. Options B/C documented as rejected. |
| **R1 H1 / R2 #2** loop cap silently inert (no CI_DEV signal in bkit-debug) | HIGH | Counter write moved into the **cloud ctx step** (the component that knows `BRANCH=dev`), BEFORE dispatch. `CI_DEV` mode dropped from `bkit-debug` entirely; `bkit-debug` needs zero code changes (existing 3-way fallback covers `fix/{FID}`). Open Questions #1/#5 + Task 1f + Task 3. |
| **R1 M1 / R2 #1** undeclared Task 2 -> Task 3 dependency | HIGH | Merged old Tasks 1+2+3 into **Task 1** (single owner of `.bkit/templates/.github/workflows/bkit-cloud.yml` + `bkit-counter-bus-config.sh`). Explicit `Depends on` fields on every task. Runbook preamble documents the merge. |
| **R1 M2 / R2 #3** undefined `$REPO_ROOT` in cloud ctx step | HIGH | Use `$GITHUB_WORKSPACE` (GHA-provided) for sourcing; `$GITHUB_REPOSITORY` for `gh api`. Pre-Flight section + Architecture items 4/5. |
| **R1 M3 / R2 M** inline `${{ head_commit.message }}` injection | MEDIUM | `COMMIT_MSG` and `HEAD_SHA` added to ctx step `env:` block (injection-safe); `$GITHUB_REPOSITORY` replaces literal `{owner}/{repo}` in `gh api`. Architecture items 4/5 + Security section. |
| **R1 M4 / R2 #2** bkit-debug Step 2 worktree change redundant | MEDIUM | Dropped the edit; **Task 3 is verify-only**. Existing `bkit-debug.md:318-327` fallback already creates `fix/{FID}` off `origin/dev`. |
| **R2 M6 / R3 F2** concurrency narrative ("dropped, not queued") wrong | MEDIUM | Corrected: GHA with `cancel-in-progress: false` **QUEUES** (one pending; older pendings cancelled as newer arrive). Queued run re-evaluates cap at ctx step. Operator does NOT manually re-trigger. Open Questions #3 + Acceptance edge cases + Architecture item 3. |
| **R3 F3** counter written after dispatch (undercount on crash) | LOW | Write moved to ctx step, **before** dispatch, committed to dev with `[skip ci]`. Open Questions #1/#5 + Architecture item 5. |
| **R3 F6** telemetry `parentSha`/`headSha` correctness + RUN_ID link | LOW | `headSha` = `workflow_run.head_sha` (CI-failed SHA, correct); `parentSha` derived via `git rev-parse origin/dev`. bkit-auto Step 11 actions-link gated on `MODE=CI`/non-empty `RUN_ID`. Architecture bkit-auto item 6 + Data Schema. |
| **R2 M7** close-commit identifier wrong | MEDIUM | Corrected to `docs({FID}): ship DONE bkit [skip ci]` (`bkit-ship.md:1206`, verified). Pre-Flight + Acceptance edge cases + Manual Verification. |
| **R3 F4** docs-only-diff precondition (Vercel cancel) | LOW | Added to Acceptance edge cases + Task 6 + Task 10 (manual verification per consumer). |
| **R3 F5** `fix/**` lifecycle (now cloud-auto-ships) | LOW | Documented in Breaking Changes section (`fix/**` newly folded; Success Criteria scoped to `feat/**`). |
| **R1 M5** bkit-auto Step 9 not gated + ISSUE_ID unspecified | MEDIUM | Step 9 added to the `MODE=CI` gate list; `ISSUE_ID` numeric-prefix derivation specified in Step 1.5 CI_DEV branch. Architecture bkit-auto items 1/4 + Task 2. |
| **R1 M6** ctx-step dev-branch placement ambiguous | MEDIUM | Placement made explicit: `if [ "$BRANCH" = "dev" ]` after `case "$CONCLUSION"`, before `gh pr list`; PR-lookup moves into `else`; `shared-deriv` markers extend upward. Pre-Flight + Architecture item 5. |
| **R2 L10** T2 presence-only check misses behavioural regression | LOW | T2 augmented with bash unit: `head_branch=feat/foo` -> true (cancel preserved); `head_branch=dev` -> false (queue). Test Matrix T2. |
| **R2 L11** header comment text unspecified | LOW | Verbatim replacement header text quoted in Architecture item 1. |
| **R2 L12** MAX_DEV_DISPATCH_ATTEMPTS breaks comment grouping | LOW | New `# bkit-cloud.yml counters` section header (consumed by cloud ctx step, not bkit-debug). Architecture counter-bus-config item 1. |
| **R2 L13** dry-run harness unspecified | LOW | Dry-run harness specified in Task 1f (yq extraction, env mocking, gh stubbing, GITHUB_OUTPUT assertion); reused by Task 2 F1 sentinel. |
| **R1 L1 / R2 L9** telemetry location misstated (Step 1 vs Step 2.6) | LOW | Moot — telemetry write moved out of bkit-debug entirely (now in cloud ctx step). |

---

## Scope-Check Resolution Index

Trace of the three non-blocking scope-check-1 findings and how v3 resolves each. (Scope-check-2 returned PASS with zero findings — no scope expansion and no silent drops detected — so it required no plan edits; its boundary confirmation is reflected here as a no-op.)

<!-- prettier-ignore -->
| Finding | Severity | Lens | Resolution in v3 |
| --- | --- | --- | --- |
| **SC1-F1** Task 2 negative criterion unobservable (`does NOT call gh pr view`) | CONCERNS | verification strength | Task 2 gains an explicit **Verification (scope-check F1)** sub-bullet that wires the Task 1f `gh`-stubbing harness into a sentinel: `gh() { echo "called: $*" >> "$GH_CALLS"; }; export -f gh`, then after the `ARG=<FID>` dry-run asserts `! grep -q 'pr view' "$GH_CALLS"`. The negative criterion is now objectively observable. Test Matrix T6 updated to reference the sentinel. |
| **SC1-F2** Task 3 criterion/verification strength mismatch (`no diff` vs `Read confirms`) | CONCERNS | verification strength | Task 3 gains an explicit **Verification (scope-check F2)** sub-bullet: `git diff --exit-code -- .bkit/workflows/bkit-debug.md` (exit 0 = no diff = PASS), run after the full build so it catches any other task touching the file. Test Matrix T8 + Task 9 validation both assert the zero-diff command. Verification strength now matches the criterion. |
| **SC1-F3** Task 10 scope disjunctive (`cloud.md` OR `deployments.md`) | CONCERNS | scope ambiguity | The disjunction is collapsed to a single concrete owner file: **`docs/deployments.md`** (Task 10 Scope updated + Architecture `docs/deployments.md` item 3 + Documentation Updates table + Verification Plan all point to `deployments.md`). Task 10 owns a DISTINCT "Consumer-repo acceptance note" section that cross-references Task 6's docs-only-diff precondition note rather than restating it, eliminating the duplication risk. |
| **SC2** boundary confirmation (no expansion, no silent drops) | PASS | scope boundary | ~~No edit required — scope-check-2 found zero scope expansions and zero silent drops.~~ **(v4) This verdict was WRONG on `main`** — see P4 below. `main` was settled IN scope by #363's pivot comment D-final and was moved to Out of Scope by v1-v3 with no deferral row and no tracker note, which is the definition of a silent drop. Closed by Task 14. |

---

## Post-Plan Review Findings (v4 — 2026-07-29, pre-build)

The v1-v3 chain was authored in a worktree at parent `2ee0da16`. Ten minutes later `80660ac0` (#384) restructured `bkit-ship.md` into Path A/B, and four follow-up fixes landed on `dev` the same afternoon. The plan's three reviews, two scope-checks and complexity-check all ran against the pre-#384 tree, so none of them could have caught P1. Every source anchor below was re-verified against `dev @ d87c8641`.

<!-- prettier-ignore -->
| ID | Finding | Severity | Resolution in v4 |
| --- | --- | --- | --- |
| P1 | **Task 4's premise is void.** v3: "`AUTO_ROUTE_SUFFIX` is already derived on line 626 — no new gate logic." #384 deleted every derivation from `bkit-ship.md`; the grep count is 0. The Option A change point is gone. | CRITICAL | Task 4 rewritten to ADD the derivation (idiom from `bkit-build.md:1261`) and thread it at line 682, with a `grep -c` pre-check that voids the task if the premise shifts again. Context & Goals carries a callout. |
| P2 | **`fix/**` folding is inert.** Ctx-step FID fallback strips `feat/` only; `bkit-debug`'s fix PR body has no `bkit:fid=` marker; `bkit-auto.md:118` hard-fails non-`feat/` branches. The documented "cloud auto-merges the fix PR" cannot occur. | HIGH | New Tasks 11 + 12; ctx-step `sed -E` strips both prefixes; `bkit-auto` Step 10 `case` accepts both. Breaking Changes corrected with the three verified reasons. |
| P3 | **The `fix/**` failure loop is unbounded.** The cap is gated on `BRANCH = dev`, so the newly-opened `fix/**` surface has exactly the cross-session feedback loop the cap exists to prevent, with no bound. | HIGH | New Task 13 — cap rekeyed on the FID and factored into `bkit_dev_dispatch_guard`, called from both post-`feat/**` surfaces. `feat/**` deliberately stays uncapped (pre-merge, already bounded in-session). |
| P4 | **`main` was silently dropped.** #363's pivot comment D-final settled `['feat/**','fix/**','dev','main']`; v3 moved `main` to Out of Scope with no deferral row and no tracker note, and scope-check-2 passed it as "zero silent drops". | MEDIUM | Exclusion KEPT (the issue's own open item 3 — promotion-commit authorship — is unresolved, so a `main` trigger would be gated shut by construction). New Task 14 records the reversal in `deferrals.jsonl` and on #363. |
| P5 | **Dev path is GitHub-tracker-only.** Scope regex, slug allowlist and `ISSUE` derivation all assume `363-slug`. A Linear consumer's `bar-123-slug` fails all three, so the dev trigger silently never fires for them. | MEDIUM | Regex / allowlist / derivation widened to the same alternation the existing `feat/**` fallback already uses (`bkit-cloud.yml:198`). New Open Question 6; T16. |
| P6 | **The loop cap fails OPEN.** v3 tolerated a rejected telemetry push and dispatched anyway. Any non-fast-forward (not just the dual-job race it names) leaves the row nowhere durable, so the cycle is uncounted and the advertised bound degrades to unbounded. | MEDIUM | Retry against a re-fetched `dev`, then VERIFY the row is on `origin/dev`; if not, `skip=true`. The same verification is what keeps the genuine dual-job race safe. New Open Question 7; T17. |
| P7 | **Every `bkit-ship.md` line anchor is stale** (598->647, 634-635->682, 1206->1258, 1211->1261-1265, 610->546, and `--workflow CI` is now `--workflow ci.yml`). `bkit-auto` / `bkit-debug` / `bkit-cloud.yml` anchors were re-checked and are all still correct. | LOW | Anchors corrected in Pre-Flight, Architecture and Manual Verification. Stale-guard switched to the `ci.yml` filename form (fixed by `bkit install`; the display name is consumer-editable free text). |

**Two non-defects, recorded so a builder does not "fix" them:** (a) the `bkit [auto route]` marker becomes permanent `dev` history once threaded onto the squash subject — inherent to Option A, since the gate reads `head_commit.message`; (b) `bkit-ship`'s close commit only reaches `dev` when `RUNTIME_DEVPUSHES = true`, so the "dev's tip is the close commit" narrative is not universal — but stale-guard Option A reads CI-run recency, never dev's tip, so it stays correct under both runtimes.

**Residual risk accepted (not fixed here).** The `dev` concurrency group is `bkit-auto-dev` for ALL FIDs. With `cancel-in-progress: false` GHA keeps at most ONE pending run per group, so if FID-A is in-flight and FID-B then FID-C arrive, **FID-B's dispatch is cancelled while pending and never re-fires**. The plan's "the operator does NOT need to manually re-trigger" claim holds only for the most recent queued run. FID-level arbitration belongs to #397; this loses a dispatch rather than corrupting one, so it fails safe.
