# Design Input — 261-ci-trigger-gate

## Session Prompt

Issue: #261 — CI-trigger gate is blind: build/debug/ship can leave a `[skip ci]` HEAD on a PR → bkit-tests never run (vacuously green)

Design workflow invoked by user via `/bkit-design #261`.

---

## Issue Body

# CI-trigger gate is blind: build/debug/ship can leave a `[skip ci]` HEAD on a PR → bkit-tests never run (vacuously green)

> **Design-ready spec.** This body is the canonical input; the comments hold the analysis/audit trail. **Hard constraint:** the fix must NOT regress the D2 cloud-auto-route concurrency design (§ Constraint).

## Symptom

A build or debug workflow finishes, the PR exists, but **bkit-tests never run** because the PR's HEAD commit carries `[skip ci]`. GitHub suppresses _both_ `pull_request` and `push` runs (substring match on the HEAD message), `gh pr view --json statusCheckRollup` comes back **empty**, and fail-fast gates admit a **vacuously green PR** (KN-11). Recurs intermittently; primarily **build**.

## Root cause — the safeguard checks a string we typed, not what GitHub did

The shared **HEAD-Subject Assertion** (`workflows.md:938`, #184) is a deny-list string check `invoked by orchestrators` that runs `git log -1 --pretty=%B` on the commit the orchestrator **just constructed** (clean by construction) and at create-pr only checks the **PR title**, not the HEAD. So it **never reads the real remote HEAD** GitHub evaluates and **never confirms a run was dispatched**. Whenever the clean final commit does not end up as the dispatched HEAD, the PR sits on a `[skip ci]` HEAD with no CI — and nothing notices.

**build != debug:** debug's create-pr commit (`bkit-debug.md:944`) is **clean** and is itself the trigger push; build's is `[skip ci]` (`bkit-build.md:1128`) and bets on a clean trailer.

## Confirmation status

- **Mechanism: conclusively confirmed** — `workflows.md:943` states _"HEAD is the `[skip ci]` create-pr commit by D2 design… only PR title is checked"_; `deployments.md:338`; KN-11 (`deployments.md:317`).
- **Historical artifacts found** in both consumers (gether `a557a739` _"create-pr status + workflow DONE [skip build] [skip ci]"_, fraser `61854a42`). Transient failures self-heal/merge, leaving no frozen ref.
- **Live Actions frequency not retrievable** — `gh`/REST/GraphQL 404 on `gether-life` / `fcte-com-au` under the current token (org scope).

## Constraint — preserve D2 (fire CI exactly once; no mid-build auto-router)

The `[skip ci]` on `worktree-setup` / `create-pr` is **load-bearing**, not bookkeeping (KN-11, decisions §141/#184, the 141-cloud-app plans):

> Build/debug fire CI **exactly once**, on the loud `close-workflow` (build) / `create-pr`-or-`close` (debug) commit. Intermediate commits carry `[skip ci]` **specifically** so a mid-build push to a branch with an open PR does NOT fire a `pull_request: synchronize` event that triggers the cloud auto-router **mid-build** (the exact D2 defect that was fixed).

Tuned build shape: `worktree-setup [skip ci]` → `summary` **(clean — the CI-triggering commit at PR-open, `:1048`)** → `create-pr [skip ci]` (buried) → `close-workflow` **(clean — the final loud trigger)**. **Any fix must keep "exactly once, no mid-build auto-router."**

## Branch/PR edge-case audit

- **EC-1 — build lacks debug's PR-exists detection.** Build unconditionally `gh pr create --base dev` (`:1092`); no `gh pr list --head` / `PUSH_MODE` check. On a re-run/resume where `feat/{FID}` already has an open PR → create errors → retry fails (`:1108`) → **Failure Path**.
- **EC-2 — Failure Path pushes a `[skip ci]` HEAD onto the live PR.** `build:95-96` (+ shared `workflows.md:506`) commits `docs({FID}): build aborted bkit [skip build] bkit [skip ci]` and pushes → `synchronize` with a `[skip ci]` HEAD → CI suppressed on the PR. **EC-1 → EC-2 is the most likely "build ends in a PR not running tests."**
- **EC-3 — create-pr `[skip ci]` trailer bet** (`:1128`) relies on `close-workflow` (`:1179`) landing as HEAD; interruption between Step 17 and the Step 18 push breaks it.
- **Handled:** no feat branch → build creates `feat/{FID}` from HEAD (`:292`); detached/empty branch → `Assert non-empty` (`:158/:303/:374`); `BRANCH=dev/main` → `gh pr create` fails → Failure Path.
- **Ship = backstop, not source:** requires an existing PR (`ship:290`) + **non-empty `statusCheckRollup`** (`ship:291`) → else Failure Path. It _catches_ a suppressed PR but converts the silent skip into a ship failure needing human intervention (the observed pain). Ship's own `ship DONE bkit [skip ci]` dev-HEAD (`:951`) is the intentional post-merge status commit (must batch, not strand).

## The fix — reclassified against D2

### D2-safe kernel (the robust core — land this)

1. **Outcome-based CI-Dispatched gate** at the _final loud push_ (shared single source in `workflows.md`, inlined per workflow): after the final push, confirm a run was **dispatched for the pushed HEAD** — at least a **`bkit-decide`** run (build/debug: `gh pr view --json statusCheckRollup`; ship: post-merge `gh run list`). If none after a bounded poll **and** HEAD is clean → **self-heal**: push a clean empty `re-trigger` commit and re-confirm. This only _verifies the one intended dispatch fired_ — adds no mid-build runs, so it is D2-safe.
2. **EC-2 option (b)** — on Failure Path, do NOT push a `[skip ci]` HEAD onto a branch that has an open PR; leave the last validated HEAD. (Also "don't fire CI on abort" → D2-aligned.)

### D2-risky (must be designed, not hand-edited)

- **build/debug branch-PR alignment (EC-1/EC-3).** The goal: build should **detect an existing PR** to avoid the `gh pr create` _failure_ → Failure Path chain — but **without** introducing a mid-build loud push (a `synchronize` on a clean HEAD is exactly the D2 auto-router defect). This needs a design that reconciles "idempotent re-run" with "fire CI exactly once."

## Design decisions / recommendations

- **Confirm a `bkit-decide` run is dispatched** for the final HEAD (gate on the outcome, not a typed string).
- **No PUSH_MODE no-op** — `LOCAL` still dispatches CI (it _creates_ a PR; `debug:172`). The only legitimate no-op is **"repo has no CI workflow for the event"** (bkit's degenerate setup / no-`ci`-module consumer) — detected when even a **clean re-trigger** dispatches nothing (the self-heal _is_ the discriminator). No mode branch needed.
- **Poll budget:** ~60s (6×10s) before self-heal.
- **Self-heal cap:** 1 re-trigger → run appears = fixed; still nothing = no-op-if-no-CI, else Failure Path.

## Authoring constraints (`.bkit/workflows.md`)

- **Instructions-only**, no rationale in workflow files (rationale → `workflows.md`); **self-contained, NO cross-references** to `workflows.md` (inline the gate bash at each site); **align shared lines across ALL workflows**; **reuse closest existing phrasing/formatting verbatim** (`grep .bkit/workflows/` first); deny-list markers (`bkit [auto route]` / `[verbose ci]` / `[force build]` pass); Two-Layer Separation; status.jsonl ceremony.
- **Re-render** `.claude/`/`.cursor/`/`.opencode/` mirrors after edits; update `deployments.md` (D2 record + KN-11) + the `workflows.md` § HEAD-Subject Assertion in lockstep.

## Open design questions

- How to make build's re-run idempotent (detect existing PR) **without** a mid-build loud `synchronize` — push-suppressed detection only? short-circuit Step 17 when a PR exists and HEAD is already pushed?
- Does the gate's self-heal `re-trigger` commit on the _final_ HEAD interact with the auto-route marker (`bkit [auto route]`)? It should carry the same marker treatment as `close-workflow`.
- Ship post-merge: confirm the `ship DONE [skip ci]` dev-HEAD batches and never strands `dev`.

## Related

- KN-11 (`deployments.md:317`) — `[skip ci]` HEAD → empty rollup.
- #279 — squash-body `[skip ci]` leak (same class, ship side).
- #184 — the shared HEAD-Subject Assertion (being augmented).
- §141 / KN-30 — the D2/D3 cloud auto-route concurrency design (the constraint).
- Suggested milestone: **Workflow Agent Optimisation**.

---

## Comments

### Comment 1 — Design lock-in + branch/PR edge-case audit (build & ship)

Corrected outcome-gate design (supersedes the "local-mode no-op" idea):
`PUSH_MODE=LOCAL` does **not** mean "no CI" — it means _no PR existed, so create one_ (`debug:172-174`); both PR and LOCAL modes dispatch CI. So there is **no PUSH_MODE-based no-op**. The only legitimate no-op is **"repo has no CI workflow for the event"** (bkit's own degenerate setup / a no-`ci`-module consumer), and the self-heal step _is_ the discriminator:

> Poll the real signal for the pushed HEAD (build/debug: `gh pr view --json statusCheckRollup`; ship: post-merge `gh run list`). If none after ~60s (6×10s) **and** HEAD is clean → push a clean empty `re-trigger` commit → poll again. If the re-trigger **also** dispatches nothing → conclude _no CI for this event_ → **no-op (log)**. If it dispatches a run → original HEAD was suppressed → **fixed**. Cap: 1 re-trigger, else Failure Path.

Confirm at least a **`bkit-decide`** run is dispatched (per maintainer suggestion) — gate on the dispatched-run _outcome_, not a typed string.

Branch/PR edge cases — build is the primary culprit:

- **EC-1 — build lacks debug's PR-exists detection.** Build unconditionally `gh pr create --base dev` (`build:1092`) with no `gh pr list --head` / `PUSH_MODE` check. On a re-run/resume where `feat/{FID}` already has an open PR, create errors → retry fails (`:1108`) → **Failure Path**.
- **EC-2 — Failure Path pushes a `[skip ci]` HEAD onto the live PR.** `build:95-96` (+ shared `workflows.md:506`) commits `docs({FID}): build aborted bkit [skip build] bkit [skip ci]` and pushes → `synchronize` with a `[skip ci]` HEAD → **CI suppressed on the PR**. EC-1 → EC-2 is the most likely "build ends in a PR not running tests"; debug never blindly-creates, so never hits this.
- **EC-3 — create-pr `[skip ci]` trailer bet** (`build:1128`) — relies on `close-workflow` (`:1179`) being the pushed HEAD; interruption between Step 17 and the Step 18 push breaks it.
- **Handled:** no feat branch → build creates `feat/{FID}` from HEAD (`:292`); detached/empty branch → caught by `Assert non-empty` (`:158/:303/:374`); `BRANCH=dev/main` → `gh pr create` fails → Failure Path (caught, not silent).
- **Ship = backstop, not source:** requires an existing PR (`ship:290`) and **non-empty `statusCheckRollup`** (`ship:291`) → else Failure Path. It _catches_ a suppressed PR but converts the silent skip into a ship failure needing human intervention (the observed pain). Ship's own `ship DONE bkit [skip ci]` dev-HEAD (`:951`) is the intentional post-merge status commit (must batch, not strand).

Expanded fix scope:

1. **Give build debug's `PUSH_MODE`/`EXISTING_PR` detection** — if `feat/{FID}` has an open PR, push to it (synchronize); don't blind-create. Kills EC-1 → EC-2.
2. **Make build's create-pr commit clean** (EC-3).
3. **Shared outcome-based CI-Dispatched gate** at the final success push (build/debug/ship), per the corrected design above.
4. **Failure-Path decision:** prefer **not** pushing a `[skip ci]` HEAD onto a branch that has an open PR (leave the last validated HEAD intact); plain abort-commit elsewhere is fine.

All edits to follow `.bkit/workflows.md` authoring rules (shared single-source assertion, deny-list markers, Two-Layer Separation, status.jsonl ceremony), and to **align build/debug/ship** on one branch/PR + CI-trigger contract.

### Comment 2 — Pivotal finding — fix is entangled with D2

Investigating callers before editing surfaced that the `[skip ci]` on `worktree-setup` / `create-pr` is **not cosmetic bookkeeping** — it's load-bearing for the **D2/D3 cloud auto-route serialization** (`knowledge.md:495` KN-11, decisions.md DE §141/#184, the 141-cloud-app plans). The invariant:

> Build/debug fire CI **exactly once**, on the loud `close-workflow` (build) / `create-pr`-or-`close` (debug) commit. Every intermediate commit carries `[skip ci]` **specifically** so a mid-build push to a branch with an open PR does NOT fire a `pull_request: synchronize` event that would trigger the cloud auto-router **mid-build** (the exact D2 defect that was fixed).

The tuned shape (build): `worktree-setup [skip ci]` → `summary` **(clean — the CI-triggering commit at PR-open)** → `create-pr [skip ci]` (buried) → `close-workflow` **(clean — the final loud trigger)**.

Reclassifying the fix against D2:

**D2-COMPATIBLE (safe to pursue):**

- The outcome-based CI-Dispatched gate at the _final loud push_ — only verifies the one intended dispatch actually fired and self-heals if not. Adds no mid-build CI.
- EC-2 / Failure-Path option (b) — on abort, don't push a new `[skip ci]` HEAD onto a branch with an open PR; leave the last validated HEAD. This is also "don't fire CI on abort," D2-aligned.

**D2-RISKY (regression hazard — needs full design):**

- EC-1 (build pushes to an existing PR mid-flow) — a mid-build synchronize on a clean HEAD fires the auto-router prematurely (the D2 defect). Needs rethink.
- EC-3 (clean create-pr) — changes the documented D2 contract; don't change in isolation.

**Decision:** No workflow changes applied — the speculative create-pr edit was reverted; tree is clean. This change touches a carefully-tuned concurrency system (KN-11/KN-30/D2/D3) and must be **designed**, not hand-edited.

**Recommended path:** run this through bkit's own design → plan → build (dogfood) with #261 as input. The validated, D2-safe kernel to carry in: the **outcome-based CI-Dispatched gate** + **EC-2 option (b)**. The build/debug branch-PR alignment must be designed so it does not introduce a mid-build synchronize.
