Verdict: CONCERNS
<!-- verdict:end -->

# Design Review (re-review 1)

Lens: Buildability — stack feasibility, library fit, integration risk. Scope: the REVISED design (#380 body + `## Addendum — Canonical-home revision`, addendum wins), with extra scrutiny on the four new surfaces the original review never saw.

Overall: the inversion (roadmap.md canonical, tracker as downstream mirror) is **buildable with the existing stack** — every new surface has a concrete precedent in the repo (the dev-lock critical-section idiom, existing MCP label-write tools + the #202 inline-marker model, the `deferrals.jsonl` shipped-ledger shape). But the four new surfaces each carry an unresolved buildability hazard the plan MUST resolve before it proceeds; two are CRITICAL. Hence CONCERNS, not PASS.

## Ecosystem Search

No new external capability is introduced by the revision — it is entirely internal bkit plumbing (shell/jq folds, git critical sections, MCP tracker tool calls, JSONL ledgers). All four new surfaces reuse existing in-repo primitives; the correct recommendation is USE-AS-IS / ADAPT of the existing idioms, never BUILD-CUSTOM:

- **Dev-located writes** — USE-AS-IS the existing dev-lock idiom. `docs/plans/{YYYYMM}/{FID}` design/plan closes already do exactly a "checkout dev in the main checkout under `$REPO_ROOT/.bkit/.dev.lock` -> `pull --ff-only` -> commit -> `git push origin dev`" critical section (`bkit-design.md:773-802`, `bkit-plan.md:847-858`), and ship's Failure Path shows the lighter `git -C "$REPO_ROOT" add/commit/push origin dev` single-file variant (`bkit-ship.md:79-85`). Build/debug dev-writes (addendum C) are an ADAPT of these, not new invention.
- **Reverse tracker-label sync** — USE-AS-IS the existing MCP label-write tools: `mcp__github__issue_write({method:"update", labels:[...]})` and `mcp__linear__save_issue({..., labels:[...]})` already appear in the ship Failure Path (`bkit-ship.md:94/97`) and Step 9, templated per-provider via the `<!-- bkit:tracker github|linear|true -->` inline markers (#202). ADAPT that block for roadmap->tracker reconciliation.
- **`completed.jsonl` ledger** — USE-AS-IS the `deferrals.jsonl`/`failures.jsonl` shape: seeded, `merge=union` (`.bkit/templates/.gitattributes`, workflows.md:578), append-only, `.bkit/jsonl.md` codec (`.bkit/src/bkit-telemetry.ts`), a `.agents/docs.md` row. This is the correct model to copy.
- **The fold** — USE-AS-IS: `bkit-roadmap-fold.sh` sources `BKIT_STATUS_FOLD` from `bkit-status-fold.sh` (single confirmed reducer, `.bkit/scripts/bkit-status-fold.sh:34`). No re-inline. Correct as designed.

## Stack Feasibility

Feasible with the approved stack (POSIX sh + jq + git + MCP + the mirror-regen pipeline). No new runtime, library, or service. The revision's cost is concentrated in git-topology and migration blast-radius, not in any missing capability. Constraints that bite:

1. **Build/debug do not currently touch `dev` at all.** Both are worktree workflows: cwd = `.worktrees/{FID}`, HEAD = `feat/{FID}`, and their banner explicitly states "status.jsonl is committed on `feat/{FID}`; per-step commits, **NO `dev` push**" (`bkit-build.md:28`, `bkit-debug.md:28`). Addendum C adds a brand-new `dev` critical section to two workflows whose entire design premise is that they never reach `dev` until ship squash-merges. Buildable (the idiom exists), but it is a genuinely new surface for these two files, not a one-line hook.

2. **`dev` is unprotected on this repo** (branch-protection API returns 403 "Upgrade to GitHub Pro" — private free-tier), so a direct `git push origin dev` of a roadmap row from build/debug is not blocked by branch protection, and it is consistent with the existing `[skip ci]` direct-dev doc pushes design/plan already do. So the "bypasses PR/CI" objection is already accepted doctrine here — not a new blocker. (Note: a consumer whose `dev` _is_ protected to require PRs would have build/debug dev-writes rejected; the plan should account for that consumer, but it is out of the bkit-repo blast radius.)

## Library / API Evaluation

No new library. Two internal-API observations material to buildability:

- **`.bkit/version` manifest.** `docs/completed.md` is a hash-gated managed file (`.bkit/version:52`), unlike `deferrals.jsonl`/`failures.jsonl` which are seeded-but-not-hashed. The `completed.md -> completed.jsonl` migration (G) must **drop `completed.md` from `.bkit/version`** and register `completed.jsonl` in the `deferrals.jsonl` (ungated, merge=union) shape. Addendum G leaves the fate of `completed.md` open ("kept or generated from the ledger") — if it is kept AND stays hash-gated while ALSO being generated from the ledger, `bkit check` drift-gating will fight the generator every ship. Resolve to exactly one of: delete from manifest / keep as pure-human generated view outside the hash.
- **No leaf subagent gets tracker MCP tools.** `grep mcp__github|mcp__linear .bkit/prompts/*.md` = 0 hits — all tracker writes live in the _orchestrator_ workflow files, per-provider inline-marker-templated. This directly constrains where the reverse sync (D) can run (see Integration Risk).

## Integration Risk

Surface-by-surface, per the mandated extra scrutiny:

**(1) Reverse tracker-label sync (roadmap -> tracker) — MEDIUM.** MCP write tools exist, so it is buildable. But: (a) it CANNOT live inside the `@bkit-roadmap-refresh` opus leaf — leaf prompts have no tracker MCP tools and the tracker-agnostic #202 inline-marker templating is an orchestrator-file mechanism; it must be an **orchestrator-mediated** block (ship Step 10 body and the `/bkit-roadmap` utility body), mirroring Step 9's per-provider `github|linear|true` blocks, and a no-op under `tracker: none`. Addendum D's "on the cadence trigger (and at analysis)" is ambiguous on this and must be pinned to the orchestrator. (b) The "reconcile only settled drift, not a phase actively transitioning" guard has **no lock on tracker labels** — there is no existing signal that distinguishes "drifted" from "a concurrent workflow is mid-transition." With the no-concurrent-workflows-per-clone rule this is mostly moot, but the heuristic needs a concrete definition (e.g. skip any FID whose `.lock` exists / whose folded status is IN_PROGRESS) or it will occasionally fight an in-flight Step-9 label write.

**(2) Build/debug dev-located roadmap writes + dev-lock concurrency — MEDIUM.** The idiom is proven (design/plan close, ship Failure Path), so buildable. Risks the plan must handle: (a) the ship Failure-Path variant does `git -C "$REPO_ROOT" commit`/`push origin dev` **without a `git checkout dev` first** (`bkit-ship.md:79-82`) — it assumes the main checkout HEAD is on `dev`. Design/plan close instead does an explicit `git checkout dev` + `"$(git branch --show-current)" = dev` assertion (`bkit-design.md:784-785`). Build/debug run from a worktree while the main checkout may be on any branch; the plan must use the _checkout-and-assert_ form, not the assume-on-dev form, or it will commit a roadmap row onto the wrong branch. (b) Adding a dev critical section to build/debug increases `.bkit/.dev.lock` contention (a long debug soak now competes with a ship's merge lock); the 600s deadline / 900s staleness reaper already handle this, but per-close dev pushes from build/debug are a new source of lock traffic worth stating. (c) These are `[skip ci]`-class direct dev pushes; they must carry the `bkit [skip ci]` token like the existing dev doc commits, or they will trigger CI churn on `dev`.

**(3) Canonical-source vs regenerate-on-conflict + per-FID upsert-vs-full-regenerate — HIGH (see CRITICAL).** This is the deepest hazard. A full regenerate reads _dev-visible_ on-disk artifacts, but a build/debug FID's phase lives in `status.jsonl` **on `feat/{FID}`, which is not on `dev`** — so a full regenerate on `dev` literally cannot reconstruct build/debug phase from on-disk sources. Hence build/debug must **per-FID upsert** their own row (they alone know their phase). But then the _next_ design/plan/ship full-regenerate rebuilds from dev-visible sources and would revert those build/debug rows to their last dev-visible phase (plan-done). When a tracker is wired the label read re-enriches and masks this; under `tracker: none` (an explicitly first-class, required mode) there is **no recovery source** and a full regenerate silently reverts canonical build/debug state. To avoid this the regenerate must become "read existing status block -> preserve rows it cannot re-derive -> upsert" — which re-introduces the parse-the-shared-unstructured-file fragility the body rejected as resurrecting #209 Defect A. The addendum flags "the plan must specify the per-FID upsert-vs-full-regenerate mechanism," so it is acknowledged, but from a buildability lens this is the item most likely to be under-specified into a data-loss bug, and it directly weakens the headline "-X ours / regenerate is a non-event" safety claim.

**(4) `completed.md -> completed.jsonl` migration + `@bkit-ship-update-docs` edit — MEDIUM (one CRITICAL reader).** Blast radius enumerated from the repo: `@bkit-ship-update-docs` step 6 writer (`.bkit/prompts/bkit-ship-update-docs.md:43`); **the ship Step 10 verdict gate** `COMPLETED_HIT=$(grep -c ... docs/completed.md)` at `bkit-ship.md:902-903` (this drives `UPDATE_DOCS_VERDICT`; if the writer moves to jsonl but this reader still greps `completed.md`, **every ship goes FAIL** — CRITICAL, easily missed); `.bkit/version` manifest (drop completed.md hash); `.bkit/templates/.gitattributes` merge=union row; `.agents/docs.md` + `.bkit/templates/.agents/docs.md` rows; doc references in `.bkit/README.md:321`, `.bkit/prompts.md:175/301`, `.bkit/workflows.md:578/756/1213`; the docs-must-match-code rule forces all of those in the same change; the fold's exclude-completed scan (E) and shipped-FID detection now read the new ledger. Every piece has a `deferrals.jsonl` precedent, so buildable, but it is a wide surface and adds `@bkit-ship-update-docs` + the ship Close step to WS-6's mirror-regen + install/upgrade dogfood (correctly noted in the addendum).

**Mirror-regen surface grows** (already a body RISK): build/debug now edited (C), the reverse-sync orchestrator block added (D), and `@bkit-ship-update-docs` edited (G) — so all five workflows + two agents + the utility need claude/cursor/opencode regen, batched at session end, and both `install` AND `upgrade` dogfooded (mirrors are force-overwritten and NOT drift-gated).

## PoC Approach

Minimal proof, in dependency order (do not build): (a) a `git`-topology spike — from a `feat/{FID}` worktree, take the dev-lock, `checkout dev` + assert in the main checkout, upsert a single roadmap row, `commit --allow-empty`? no — commit the row, `push origin dev` with `[skip ci]`, release lock; confirm it does not disturb the worktree HEAD and survives a concurrent design close taking the same lock. (b) a fold spike proving the exclude-completed scan reads `completed.jsonl` and that a full-regenerate on dev preserves an upserted build/debug row (the surface-3 hazard) — this is the spike that most needs to exist before the plan commits to a mechanism. (c) a one-issue reverse-label-sync spike in an orchestrator block confirming idempotent no-op when label already matches. If (b) cannot be made loss-free under `tracker: none` with a clean (non-`sed`-parse) mechanism, escalate to a design revision. This is describable in <200 words, so no auto-CONCERNS on PoC-length grounds; the CONCERNS verdict comes from the surface hazards.

## Unknowns & Blockers

- **Surface 3 mechanism (blocking the plan):** exact per-FID upsert vs full-regenerate rule that does not lose build/debug rows under `tracker: none`, without re-introducing shared-file `sed` parsing.
- **Surface 1 placement:** confirm reverse sync is orchestrator-mediated (ship Step 10 + utility), not the leaf; define the "settled drift" guard concretely.
- **Surface 4 `completed.md` fate:** deleted from `.bkit/version`, or retained as a generated human view outside the hash — pick one.
- **Surface 2 idiom:** checkout-and-assert (design/plan form), not assume-on-dev (ship Failure-Path form); `[skip ci]` token on the dev push.
- Consumer with a PR-protected `dev` (out of bkit-repo scope but affects the shipped surface's universality).

## Verdict Reasoning

CONCERNS. The revision is feasible in the current stack with no new dependency, and every new surface maps onto an existing, proven in-repo idiom (dev-lock critical section, MCP label writes + inline-marker templating, the `deferrals.jsonl` ledger shape, the single-source fold). Nothing is un-buildable. But two findings are hard blockers the design/plan must address before build (data-loss on full-regenerate under `tracker: none`; the ship-verdict `completed.md` reader that fails every ship if the migration misses it), and three more are real integration hazards (reverse-sync placement/guard, build/debug's new dev critical section, `completed.md`'s manifest fate). These are addressable within the current approach, so the design proceeds — CONCERNS, not FAIL.

## CRITICAL

Findings the design/plan MUST address before it can proceed:

1. **Full-regenerate data-loss under `tracker: none` (surface 3).** Build/debug phase is not dev-visible (status.jsonl on `feat/{FID}`), so a full regenerate on `dev` cannot reconstruct it and will silently revert build/debug FIDs to their last dev-visible phase; with no tracker there is no recovery source. The plan MUST specify a regenerate/upsert mechanism that preserves rows it cannot re-derive, without resurrecting the shared-file `sed`-parse fragility (#209 Defect A) the body rejected. This also weakens the headline "regenerate-on-conflict makes `-X ours` a non-event" guarantee and that weakening must be stated.
2. **Ship Step 10 verdict reader must migrate with the writer (surface 4).** `bkit-ship.md:902-903` derives `UPDATE_DOCS_VERDICT` from `grep -c ... docs/completed.md`. If `@bkit-ship-update-docs` moves the append to `completed.jsonl` but this grep is not migrated in the same change, `UPDATE_DOCS_VERDICT` = FAIL on every ship and blocks all shipping. Migrate the reader and the writer atomically.

## OPTIONAL

- Reverse sync (D): pin placement to the orchestrator (ship Step 10 body + `/bkit-roadmap` utility), mirror Step 9's `github|linear|true` inline-marker blocks, and give the "settled drift" guard a concrete definition (skip FIDs with a live `.lock` or IN_PROGRESS folded status).
- Build/debug dev-write (C): use the design/plan checkout-and-assert idiom (explicit `git checkout dev` + `branch --show-current` assertion), not the ship Failure-Path assume-on-dev form; stamp the dev push `bkit [skip ci]`.
- `completed.md` fate (G): decide delete-from-`.bkit/version` vs keep-as-generated-view-outside-the-hash; do not leave it hash-gated AND generated (drift-check will fight the generator).
- Enumerate the full `completed.md` reference set (`.bkit/README.md`, `.bkit/prompts.md`, `.bkit/workflows.md` x3, both `docs.md` copies, `.gitattributes`) in the plan so docs-match-code lands in one change.

## OUT OF SCOPE

- Consumers whose `dev` is PR-protected (branch protection unavailable on this private free-tier repo, so untestable here); build/debug direct dev-writes would be rejected there — a shipped-surface universality question, deferrable to a follow-up.
- #260 actuator/contract and any persisted `roadmap.jsonl` event log — explicitly deferred by the body; the revision does not change that.
- #80 lens-engine dependency for audit-candidate injection — unchanged by the revision.
