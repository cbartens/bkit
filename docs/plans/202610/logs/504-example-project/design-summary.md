Verdict: CONCERNS

<!-- verdict:end -->

# Design Summary

## Overview

Issue #504: a versioned example project under `examples/` that demos the whole bkit pipeline and doubles as a repeatable benchmark. Approach: three separable layers — an immutable **fixture** (`examples/bkit-explainer/`, fixed inputs only: `package.json` contract, `FEATURE-REQUEST.md` with four planted traps as plain requirements, classic-script `data.js`, `.gitignore`), a bkit-side **runner** (`scripts/example/new-run.mjs`: preflight incl. `delete_repo` scope, private repo create + pushed `dev`, verbatim fixture copy, `pnpm install`, `bkit install --claude --tracker=github` + tracker read-back, gate-chain assertion, guarded teardown), and an independent **gate** (the throwaway repo's `node --test` plus the merged PR — never measurement). Key decisions: hand-written ~40-line `bkit-ci.yml` with a single `bkit-tests-check` capstone job on literal `main`/`dev` triggers (never the ~1065-line copy-and-own template); pre-declared Node-stdlib gate stubs (never weakened); exact `@cbartens/bkit` pin bumped only after a 1-run canary; benchmark as a documented manual N-run with harvest-before-teardown and a README median table (no `--runs N`, no report script); cost recorded as unmeasured (no source exists); one additive smoke job in bkit's own CI guarded by a `bkit-only` dogfood-templates entry.

## Design Quality

Well-reasoned: the layering turns "measurement never fails a run" into a boundary rather than a convention; every decision carries alternatives and an explicit trade-off; all four review-1 CRITICALs (pushed `dev`, literal CI triggers, `dogfood-templates.test.ts` ledger entry, named runner verification) and all three review-2 CRITICALs (setup-time gate-chain assertion, smoke-job static classic-script assertion, structural teardown refusal) are absorbed into v3, as is the spike's corrected install command. Gap: one boundary the design itself flags unresolved — WS-6's static classic-script assertion targets `index.html`, which WS-1's "fixed inputs only" fixture deliberately does not ship (and the fixture's `node --test` has no tests), so the smoke job's subject does not exist at bkit-CI time; settlement is deferred to "before build" with two options given but none chosen. The human hard stops make N runs inherently human-in-loop — acknowledged and priced in, not hidden.

## Acceptance Scenario

**Narrative** (verbatim):

> A maintainer runs one command and gets a fresh private repo — `main` as the default branch, a pushed `dev` — with bkit installed for a named host and a feature request already filed. They start the pipeline and watch bkit design, plan and build an interactive page that explains bkit's own phases and loops, stopping twice for their sign-off and merging the result. They then repeat the run a few times and compare wall time and counters, to see whether a change to the prompts actually made bkit faster, cheaper or more reliable.

**Success Criteria** (verbatim):

1. `node scripts/example/new-run.mjs` creates a fresh private GitHub repo with `main` as its default branch and a pushed `dev`, whose root is copied byte-identically from `examples/bkit-explainer/` (byte-identical _before_ install; install then adds managed `.gitignore` blocks, `.agents/` and `.bkit/`), with bkit installed via `bkit install --claude --tracker=github`, the `github` tracker confirmed by a post-install read-back, and the start command printed.
2. A run reaches a merged PR in that repo with `node --test` green, and the built page opens by double-clicking `index.html` with no server.
3. The throwaway repo's `bkit-ci.yml` reports a `bkit-tests-check` job present and green at PR head, so `/bkit-ship`'s merge gate is satisfied.
4. Repeating the setup script N times yields N independent throwaway repos that each start from the same fixture; wall time and counters are readable from the harvested `status.jsonl` and `.bkit/stats.jsonl`.
5. Nothing measured can fail a run: pass/fail is `node --test` green plus merged PR, and nothing else.

**Key Edge Cases** (verbatim):

- **Gate-chain growth (drift):** a bkit release adds or renames a script in the seeded `bkit:gate:*` chain, so the fixture's pre-declared scripts stop satisfying it — silently, because the advisory only fires on _missing_ names, never on a chain that grew. The runner's setup-time assertion (every script the seeded chain calls must resolve after install) is what makes it loud where it happens.
- **Tracker default (silent failure):** `bkit install` without `--tracker=github` records `issueTracker: "none"`, and every workflow renders `_No tracker connected, skip step._` with no error, no gate and a demo that never touched the tracker. The runner reads the installed `bkit.issueTracker` back and stops unless it is `github`.
- **AI non-determinism (cross-feature, #232):** a run may not catch a planted trap; the catch is measured, never gated, so the demo narrative must not promise it.
- **Human hard stops (concurrency):** design and plan end awaiting a human, so a run is never unattended and N runs are inherently human-in-loop — benchmark scheduling and cost estimates must account for this.
- **Evidence loss on teardown (failure mode):** deleting a failed throwaway repo destroys the only diagnosis surface; the runner's teardown refuses while unharvested ledger rows remain, so harvest precedes teardown by construction rather than by convention.
- **`[skip ci]` at HEAD (KN-11):** empties `statusCheckRollup`, so the merge gate sees no capstone at all and ship refuses.
- **Actions-minutes quota:** private throwaway repos consume the maintainer's own minutes; a ten-run sweep can stall mid-sweep on a free-tier account.
- **Off-disk page (cross-feature):** logic loaded as `type="module"` is blank when `index.html` is opened by double-click — the tests stay green while the demo silently breaks.
- **Default-branch mismatch (blocking first step):** `gh repo create --private` yields only `main`, but `/bkit-design` mints `feat/{FID}` off `origin/dev` and `/bkit-ship` refuses when `PR_BASE != dev`, so a repo with no pushed `dev` fails on its very first workflow step.
- **Install with no host flag (spike C5, DISPROVEN):** `bkit install --tracker=github` exits 1 _after_ the repo exists and the fixture is copied, leaving a half-seeded private repo; the runner always names a module flag (`--claude`).
- **Teardown scope (spike note):** `gh repo delete` needs the `delete_repo` scope; without a preflight assertion a sweep fails 403 midway and the throwaway repo stays behind.

**Process Sketch** (verbatim):

- WHEN the maintainer runs the setup script → THEN preflight `gh auth` (incl. the `delete_repo` scope) / Node ≥ 20 / pnpm → create a private repo with `main` as default → create and push `dev` → copy the fixture to its root → `pnpm install` → `bkit install --claude --tracker=github` → read the tracker back and assert every script the seeded `bkit:gate:*` chain calls resolves → commit → print the start command.
- WHEN the maintainer starts the pipeline with the filed issue → THEN design → human sign-off → plan → human sign-off → build → PR opened.
- WHEN CI runs `node --test` → THEN `bkit-tests-check` is green at PR head → THEN ship merges into `dev`.
- WHEN a planted trap is missed → THEN `node --test` fails → THEN the debug loop runs and retries.
- WHEN the run ends → THEN harvest `status.jsonl` + `.bkit/stats.jsonl` before teardown → teardown refuses while unharvested rows remain (or needs an explicit `--discard-unharvested`) → delete a green repo, keep a red one for N days.
- WHEN the maintainer repeats the run N times → THEN read the middle wall time and counters from the harvested raw rows.

## Breaking Changes

None — every surface is additive; nothing existing is removed, renamed, or re-typed. Proposed new naming implied by Architecture / Data Model / Decisions:

- `examples/bkit-explainer/` — new immutable fixture tree (`package.json` with absent `type` key, `FEATURE-REQUEST.md`, `data.js`, `.github/workflows/bkit-ci.yml`, `.gitignore`); sits outside the npm `files` whitelist, so it never ships.
- `scripts/example/new-run.mjs` — new runner under the existing `scripts/<area>/*.mjs` pattern.
- `examples/README.md` — new contract table + `.agents/docs.md` index row; must never be copied into the throwaway repo (leaks traps).
- `tests/example-run.bats` — new verification over the existing `tests/fixtures/gh/bin/gh` stub.
- bkit's own `.github/workflows/bkit-ci.yml` — one additive smoke job plus its `bkit-only` entry in `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` (conditional on Q3=A + explicit human confirmation; not breaking to consumers).
- `bkit-example-run-<id>` — throwaway-repo name prefix shared by runner creation and retention sweep; `[bkit-example]` — runner log prefix; `__BKIT_EXPLAINER_DATA__` — `data.js` global name.
- `docs/decisions.jsonl` — appended ADR rows (three-layer split, stub gates, 40-line CI, runner lifecycle ownership); `docs/deferrals.jsonl` rows already exist, none added.

## Feasibility

Spike ran (`design-spike.md`, verdict `FAIL`). **Disproven claim:** C5 — the design's then-documented install command `bkit install --tracker=github` exits 1 (`requires at least one module flag`), landing mid-sequence on a half-seeded private repo; it invalidated runner flow step 5 and the matching Decisions row. The current design absorbs the fix everywhere: the runner now runs `bkit install --claude --tracker=github`, names the host, adds a post-install tracker read-back, and preflights the `delete_repo` scope (both from spike operational notes). Remaining claims `SETTLED` at the live boundary: C1 worktree mint off `origin/dev` with `main` as default; C2 single-job CI satisfies `bkit runs gate` (capstone present and green at head, `GATE_*_EXIT=0`); C3 dual-load guard serves `file://` classic load and `require` (module variant blanks, confirming the trap); C4 seeded gate chain clean after install (`bkit:gate:static-unit` exit 0, no `gate-*` advisory; one warning-only `ci-yml-capstone-contract-drift` advisory, silenced by the designed `if: ${{ !cancelled() }}`). No `BLOCKED` claims; no spike element contradicts the current design text.

## Synthesis Coverage

Brainstorms proposed 9 approaches (3 per lens: Pragmatic, Optimal-tradeoff, Risk premortem). Synthesis kept 3 and dropped 6, each with a stated reason: kept — Pragmatic A (`MERGED`: repo-side runner, fixture copied to repo root, traps stated once; its `--runs N` flag and "no `package.json`" premise dropped as disproven), Optimal-tradeoff A (`KEPT`: layered fixture/runner/gate structure as the base — encodes the issue's gate-vs-measurement constraint as a boundary), Risk-premortem A (`KEPT`: zero-dependency contract stub with its mitigations layered on). Dropped — scaffolded fixture (stub tests hint the traps, shrinking what review visibly catches), split demo/benchmark tooling (two copy paths drift; YAGNI once report script dropped), self-contained portable example (under-separates gate from runner; duplicates harness per example), run-record-first harness (substrate for a cost source that does not exist), full-template consumer fidelity (flake × cost; worst copy-and-own drift surface), harness-first benchmark rig (highest bus factor; in-harness folding amplifies ledger-shape drift). Each lens's ⭐ Recommended approach survived; the drops are reasoned rejections of the lenses' own alternatives, and the risk lens's mitigations survive as additions rather than a rival architecture. Reasonable synthesis; no good option lost.

## Scope Alignment

Matches the issue's "one simple feature" rule. In scope: fixture, runner, gate, docs contract table, runner bats test, smoke job (conditional), manual benchmark procedure. Explicitly out of scope and already recorded as deferral rows: the nine #504 later ideas and the tracker-`none` install advisory; cost/token source (YAGNI — no data exists); `--runs N` flag; metrics/report layer; browser/DOM checks of the drawing layer. Additions beyond the bare issue (teardown guard, gate-chain assertion, smoke job, tracker read-back) all trace to review CRITICALs or spike findings, not opportunistic growth. The issue's stale GitHub Packages premise (later idea 7) is corrected, not silently kept.

## Risks

Informational — track, no action this cycle:

- Gate-chain growth across bkit releases breaks runs silently at use; the setup-time assertion plus smoke job make it loud but do not prevent it.
- Tracker-default-`none` has no gate; only preflight + flag + read-back stand between it and a gutted demo.
- Every run is human-in-loop (design/plan hard stops); benchmark wall-time and cost estimates must price the human, and automation cannot remove it.
- Trap catches are non-deterministic (measured, never gated); the demo narrative must not promise a catch.
- Ledger shape drift (`outcome` gained `coverage` recently) — contained by keeping raw rows and computing at report time.
- Actions-minutes quota on private throwaway repos can stall a sweep mid-way on a free-tier account.
- `delete_repo` sits outside default `gh auth` scopes; the spike's probe repo `cbartens/bkit-example-spike-20261012` still exists (manual cleanup documented in the spike).
- `data.js` slowly lies across releases without a frozen skeleton contract; the owner-check rides the per-release canary (Q7=A).
- The bkit-CI smoke job can false-red on transient registry flake during `pnpm install` (kept deterministic and download-free to bound it).
- Contract table must never travel into the fixture; a well-meaning simplification edit is the standing human risk the README guards against.

## Action Items

1. **Resolve the design's one self-declared unresolved boundary (WS-6 § Boundary).** Decide — before WS-1/WS-6 planning — whether WS-1 ships a minimal static `index.html` (and any test subject the smoke job needs), or WS-6's smoke job asserts only over `package.json`/`FEATURE-REQUEST.md`. Note the tension the choice must weigh: dropping the `index.html` assertion weakens the fix for review-2 CRITICAL 2 (silent off-disk blank page), while adding one to the fixture brushes the rejected scaffolded-fixture approach.
2. **Unchecked human-confirmation gate:** WS-6 edits `.github/workflows/*` — explicit human confirmation is required per `.agents/rules.md` § Code Changes (CI edits). Q3 defaults to A (add the smoke job) only if confirmed; if withheld, B applies (pin + manual canary carry the load alone).

## Outstanding Questions

All items verbatim from the design's `Risks & Open Questions` (options, `Recommended`, `Default if unanswered`):

- **What does one full run cost?** No token/cost source exists (`.bkit/stats.jsonl` has only `compliance`/`counter`/`outcome` rows).
  - A: Defer entirely — record wall time and counters only, report cost as unmeasured.
  - B: Build a Claude Code session-transcript reader (usage per message) and leave other hosts to their own methods.
  - C: Read host transcripts generically behind one `cost` field in a new record.
  - **Recommended:** A — the source does not exist yet, and B/C build substrate for a spec that is not settled.
  - **Default if unanswered:** A.
- **Does the benchmark ship any tooling?**
  - A: No benchmark tooling — documented manual N-run + harvest + a README median table; teardown comes from the runner's guarded path either way.
  - B: One `--runs N` flag on the existing setup script.
  - C: A separate harness that loops runs, harvests and folds medians.
  - **Recommended:** A — a run is human-in-loop regardless, so tooling cannot remove the human cost and only adds a system to maintain.
  - **Default if unanswered:** A.
- **Should bkit's own CI carry the example smoke job?** (Editing `.github/workflows/*` requires explicit human confirmation.)
  - A: Add one smoke job running the example's stub gates + the `node --test` fixture + a static classic-script assertion over `index.html`/`package.json`.
  - B: No source-side guard; rely on the version pin plus a manual canary per release.
  - C: Add it but only as a non-blocking report job first.
  - **Recommended:** A — it is the only guard that reds the breaking commit instead of the next demo user; C delays the protection the design exists to buy.
  - **Default if unanswered:** A. (B applies only if the CI-edit confirmation is withheld; the setup-time chain assertion and the version pin then carry the load alone.)
- **Which exact bkit version is pinned, and when is it bumped?**
  - A: Pin `5.0.2` and bump per bkit release only after a 1-run canary.
  - B: Pin `^5` and let minor/patch drift in.
  - C: Pin nothing; install latest at run time.
  - **Recommended:** A — the example is a version-sensitivity instrument, so an uncontrolled version contaminates benchmark medians.
  - **Default if unanswered:** A.
- **Is the drawing layer ever checked?** (The smoke job's static assertion checks the classic-script form only, never the drawn output.)
  - A: No — the watching user is the check; the layer is thin by construction.
  - B: Add a single Playwright/browser test once the benchmark needs it.
  - C: Add a DOM-snapshot test in `node --test`.
  - **Recommended:** A — keeps the pass/fail path browser-free and deterministic, matching the issue and #232.
  - **Default if unanswered:** A.
- **Should `bkit install`/`bkit doctor` warn when the tracker is `none` in a pipeline repo?**
  - A: Out of scope this cycle; recorded as a deferral row.
  - B: Add an install advisory naming `--tracker=github` as the fix.
  - C: Make `none` a hard blocker for install.
  - **Recommended:** A — it is bkit-side behaviour change, not part of the example; the deferral row keeps it visible.
  - **Default if unanswered:** A.
- **How long are failed throwaway repos kept?**
  - A: 7 days, then delete through the runner's teardown over the `bkit-example-run-*` name.
  - B: Indefinitely until a human deletes them.
  - C: Until the next successful run of the same fixture version.
  - **Recommended:** A — bounded evidence retention without unprompted repo accumulation; the sweep name makes it mechanical.
  - **Default if unanswered:** A.
- **Who re-checks `data.js` against the current skeleton, and when?**
  - A: The per-release canary run owner checks the phase list as part of the canary.
  - B: A dedicated audit template run per release.
  - C: Nobody; the smoke job covers code drift only.
  - **Recommended:** A — it rides a human-in-loop step that already exists, so it adds no new ceremony.
  - **Default if unanswered:** A, with the per-release canary owning the phase-list check.

## Suggested Workstreams

- **WS-1 — Immutable fixture:** `examples/bkit-explainer/` minus its CI workflow — `package.json` (absent `type`, exact pin, pre-declared gate tool scripts as honest one-liners, `bkit` block; seeded `bkit:gate:*` names NOT pre-declared), `FEATURE-REQUEST.md` (four traps as plain requirements), classic-script `data.js`, `.gitignore`. Data/inputs only. **Requires:** none (root of the dependency graph).
- **WS-2 — Fixture capstone CI:** ~40-line hand-written `bkit-ci.yml`, single `bkit-tests-check` job running `node --test` with `if: ${{ !cancelled() }}`, literal `main`/`dev` triggers; job/filename bound to WS-1's `bkit` block; never the copy-and-own template, never `[skip ci]`. **Requires:** [WS-1].
- **WS-3 — Runner:** `scripts/example/new-run.mjs` owning the whole throwaway-repo lifecycle — preflight (incl. `delete_repo` scope), repo create + `dev` push, verbatim fixture copy, `pnpm install`, `bkit install --claude --tracker=github` + tracker read-back, gate-chain assertion, commit, start-command print; guarded teardown as the only delete path; `[bkit-example]` transition logs; measurement inputs only. **Requires:** [WS-1].
- **WS-4 — Runner verification:** `tests/example-run.bats` over the `gh` stub covering preflight, gate-chain assertion and teardown refusal; `gh repo create`/`delete` stay on the manual canary (stub exits 1 on non-`api` argv). **Requires:** [WS-3].
- **WS-5 — bkit-side docs & ledgers:** `examples/README.md` contract table (gate stubs, capstone name, tracker flag, plain-script rule, trap inventory, harvest/median procedure, `[skip ci]` recovery, `delete_repo` fix, Actions-minutes estimate × N — must stay outside the fixture); `.agents/docs.md` registration; ADR rows; deferral-row confirmation; prettier/`slop:delta` budget; reader contract + "cost unmeasured" statement. **Requires:** [WS-1, WS-2, WS-3].
- **WS-6 — Source-side smoke job:** one job in bkit's own `.github/workflows/bkit-ci.yml` (stub gates + `node --test` + static classic-script assertion) plus the explicit `bkit-only` dogfood-templates entry; conditional on Q3=A and explicit human confirmation; exercises the published pin. Carries the design's one unresolved boundary (assertion subject vs fixture contents). **Requires:** [WS-1].
- **WS-7 — Demo canary, benchmark, owner-check:** manual human-in-loop path — end-to-end demo over a runner-created repo (also where `gh repo create`/`delete` are exercised), documented N-run harvest + README median table, 7-day red-repo retention, pin bump after 1-run canary, `data.js` per-release owner-check; no repo code beyond the pin bump. **Requires:** [WS-1, WS-2, WS-3, WS-5].

## Recommended Next Step

`CONCERNS` — the design is otherwise planning-ready (all review CRITICALs and the spike correction absorbed), but its one self-declared unresolved boundary changes the scope of two workstreams, so settle it in design before task decomposition.

```
/bkit-design #504
Brief: Revise design-v3 to settle the single unresolved WS-6 boundary — the smoke job's static classic-script assertion asserts over `index.html`, which WS-1's fixed-inputs-only fixture does not ship (and the fixture has no tests to run). Keep all other v3 content unchanged; the CI-edit human confirmation for the smoke job remains an open gate either way. Design doc: docs/plans/202610/logs/504-example-project/design-v3-organised.md
```
