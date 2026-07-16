Verdict: CONCERNS

<!-- verdict:end -->

# Design Summary

## Overview

This design adds three-runtime workflow execution support to bkit: laptop (mode 1), GitHub Actions runner (mode 2), and claude.ai cloud session (mode 3). The core approach establishes a capability-table-based detection (`RUNTIME` → `CAN_WORKTREE`, `CAN_PUSH_DEV`, `CAN_SLEEP`, `GH_OK`) to branch control flow on what each runtime can do rather than what it is. Layer 0 (shim bash detection) feeds Layer 1 (CI-wait primitive extraction), Layer 2 (branch model: adopt-or-mint), and Layer 3 (invariant prose). Two close transports are adopted for shape A (docs-only): `git push origin dev` for modes 1–2, and `push_files` (GitHub MCP) for mode 3 — creating a design tension: mode 1 never exercises the mode-3 path, exactly how silent-failure incident D1 occurred.

## Design Quality

**Strengths:**

- Meticulously self-aware of trade-offs and risks. The design explicitly names its own worst accepted risk and records 9 named risks plus 3 open questions.
- Highly measured and evidence-based. Every claim about existing code is re-verified: STRAY guard, MODE collision, checkout-before-push sequencing, sleep counts, worktree assignments (6 sites, verified exact), structural ops (31 counted), marker parser, counter-bus idiom.
- Repair-first philosophy: each decision corrects a prior mistake (D21 state model, D23 rejecting `--dry-run` probe, D25 mechanical audit cross-check).
- Clear register boundaries: invariants (Layer 3) → prose; mechanism (Layer 0/1) → bash; procedure (Layer 2) → headers.

**Weaknesses & Gaps:**

- **Two central mechanism claims are contradicted by live code.** The shim state model (D21) assumes sourced variables survive Bash-call boundaries—they don't (35 `REPO_ROOT` re-derivations prove the opposite). The probe alternative creates a network round-trip × 34 per-block, exploding cost. **Spike A must settle this before build proceeds**; it is the fulcrum of Layer 0/1.
- **D5 (`push_files`) is demoted from "F1 resolution" to "co-equal candidate gated on Spike B".** Its claimed equivalence to `git push` is withdrawn as false on four counts: payload (193 KB inlined, §5b token bloat), conflict semantics (branch-wins server-side vs dev-wins locally — opposite of `-X ours`), STRAY tautology (guard must run over unfiltered diff first), and canonical assert (must use `get_file_contents`, not local `git show`). Only one of the four (D1 closure via explicit message) is verified. The other three are either repaired in Flow 4 (requiring extra assertions) or unrepaired (payload inversion).
- **Three load-bearing decisions have no owning spike.** The design states "Two spikes close all four pre-build decisions"; it does not. Spike A closes (2) + (4); Spike B closes (3); **D26 (which MCP server)—marked with `[!CAUTION] Build must not proceed on §6 as written`—closes none of them.** WS-2 was created to fill the gap. Guessing wrong on D26 invalidates §6c wholesale and leaves #341's centrepiece change (the fallback lane) unreachable in mode 3.
- **Credential coupling breaks the fallback premise (D26).** Both `.mcp.json:7` and `cloud-bootstrap.sh:61` read `GH_BKIT_TOKEN`. If mode 3 withholds that token (the very reason gh is flaky in §2), then MCP fails too — `GH_OK=false → use MCP` is a fallback that dies with the thing it rescues.
- **Every layer couples work in the same files.** WS-8/11/12 all touch `bkit-build.md`, `bkit-debug.md`, `bkit-ship.md`. Repo doctrine forbids concurrent workflows on one clone, so designs must be serialized at landing.
- **D7 integration coupling is larger than named.** "Adopt-or-mint + the pwd-outside-worktree rule" is 2 items; the actual integration is **13 coupled sites across 3 classes** (Placeholders definition, 5 gate items, 3 Worktree-removed items), all same-commit. A builder reading D7 only will miss 11 of them.
- **Discovery risk is high on adoption of mode 3.** The first real mode-3 run exercises all of WS-6 (detection), WS-8 (CI-wait), WS-9 (branch model), WS-11/12/13 (all three close shapes), WS-14 (fallback lane), WS-15 (peripherals). No CI can pre-exercise the mode-3 code path without a live mode-3 session, which is exactly the rot risk the design identifies.

## Acceptance Scenario

Narrative: A developer runs any phase (design/plan/build/debug/ship) from laptop, runner, or cloud session; the phase behaves identically in all three: starts without aborting on step 1, never yanks the session onto another branch, reliably lands work on `dev`, and completes through bounded fallback (not improvisation) when gh is unavailable. Afterwards, the run's status trail shows detected runtime, capability judgment, and which transport closed.

Verdict on adherence to `docs/plans/template.md` § Acceptance Scenario spec: **PASS (content)** — narrative, success criteria (7), and key edge cases (6) all present and well-reasoned. **HOWEVER: Success Criterion 1 is aspirational, not guaranteed** — "mode-1 non-regression verified by a real end-to-end run, not a rule-text-presence test" depends on WS-16 executing, which is terminal to the plan and cannot validate the design itself.

## Breaking Changes

**API surface changes:**

- New `RUNTIME` flag + 4 `CAN_*` flags in workflow contexts. Existing `MODE=CI|BRIEF` binding at `bkit-auto.md:70-80` is unaffected (D1 collision avoided by renaming).
- New `status.jsonl` row types: `runtime-resolved`, `transport-fallback`, `close-transport` (no new artifact; existing NDJSON #234).
- FID resolution reordering (D9): marker-primary, branch-fallback (already shipped in `bkit-auto.md:93-112`; only reordering above `feat/` hard-reject).
- `WORKTREE_PATH` becomes conditional (mint-or-adopt) instead of unconditional; mint case unchanged.

**Prose changes (user-facing):**

- Branch-naming rule reframe (D17): `rules.md:71` no longer demands FID in branch name once marker-primary FID resolution ships.
- Adopt mode workflow headers must drop `Worktree created/resumed` and `Worktree removed` gate items.

**None of these break existing consumers on modes 1–2; mode-3-specific paths are additive.**

## Feasibility

**Spike-gated critical path:**

- **Spike A (D21, D22 state + sleep semantics)**: 2h observation. Blocks all of Layer 0/1. **Predicted to show sourced state does NOT survive Bash-call boundaries; current cost model is wrong.** High impact on implementation.
- **Spike B (D5 `push_files` against protected dev)**: 3h observation. Blocks shape-A transport selection. **Predicted to show payload acceptance and conflict semantics are inverse of `-X ours`.** May demote D5 to never-primary.
- **Spike C (D26 which MCP server)**: Observation from live mode-3 session. Blocks §6 map authoring. **Undiagnosed; hardest gate.** May discover MCP server or credential scope differs from assumption.

**Implementation feasibility if spikes return expected:**

- Layer 0 (detection shim): **HIGH** — sourcing idiom exists (counter-bus); bats precedent (tests/counter-bus.bats).
- Layer 1 (CI-wait extraction): **HIGH** — measured (7 sleeps in 4 constructs); test rewrite is overhead, not blocker.
- Layer 2 (adopt-or-mint): **MEDIUM-HIGH** — 13 coupled sites, same-commit constraint; branch model logic is uniform (spot-checked).
- Layer 3 (invariant prose): **HIGH** — 4 sentences into `rules.md`; no new mechanism.
- Shape A close (D5 or D5(a)): **MEDIUM** — depends on Spike B outcome. If D5(a) (PR-close), §6d scope (dropping `[skip ci]` from status-commit subjects) becomes prerequisite, not option — unbudgeted scope.

**Discovery risk:** Mode-3 code is exercised only by WS-16's real end-to-end runs, not by CI or review. Silent-failure incident D1 is the proof that prose-only verification fails.

## Synthesis Coverage

**Brainstorm produced 3 ideation streams; synthesis kept these shapes:**

1. **Ideate-1 A** (sourced shim + thin pointers) → **KEPT, D21 state model repaired**. Enables testable detection; reuses counter-bus idiom.
2. **Ideate-3 A** (capability table) → **KEPT**. Runtime is input to one table, not predicate at call sites; matches `bkit-preflight.ts:1135`.
3. **Ideate-2 A** (bash-readable artifact for MCP outcomes) → **MERGED into D13/D25**. Reused `status.jsonl` instead of sentinel schema; keeps "no new artifact type" constraint.
4. **Ideate-2 B** (shell-native MCP CLI shim) → **REJECTED, deferred**. New-tooling investment; best long-term shape but out of guiding principle scope.
5. **Ideate-1 C / Ideate-3 C** (uniform PR-close in all runtimes) → **REJECTED as uniform, D5(a) promoted to co-equal for shape A**. Breaks mode-1 constraints (offline, instant, no network), but PR-close shape returns when `push_files` payload/conflict becomes blocker.

**Good options dropped intentionally:**

- Render-time mode gating (D14 REJECTED): `bkit-trackers.ts:1` resolves at install-time; runtime unknown then.
- `--dry-run` probe (D23 REJECTED): Fails dangerous — sends no ref-update, pre-receive hook never fires, branch protection never evaluated. False-positive `CAN_PUSH_DEV=true` leads to `git checkout dev` on live session (D6, Risk 1).
- Cache file for state (D21 rejected alternative): New artifact, forbidden by D13 constraint.

## Scope Alignment

**Original brief (#341):**

- Make workflows run in all three runtimes (✓ in scope).
- End-to-end in each runtime (✓ in scope as WS-16).
- When gh is unavailable, use sanctioned fallback (✓ in scope, but D26 unresolved).

**Creep detected and managed:**

- **D20 (macOS path coupling)**: Reframed as shipped consumer bug (not mode-3 issue), kept in scope but not gated behind mode-3 milestone.
- **D7 (13 coupled sites, not 2)**: Correctly identified and called out; increases same-commit risk.
- **D26 (MCP server decision)**: Not in brainstorm, added because "two spikes close all four" is false.
- **WS-2 (Spike C)**: Not in original decomposition, added to own the unowned D26.

**Scope is disciplined.** The largest unbudgeted item is §6d (drop `[skip ci]` from status-commit subjects if D5(a) wins), which only materializes on one branch of the D5 fork and is explicitly named.

## Risks

**Nine named risks (design owns 3–5 structural mitigations):**

1. Detection misfire (env var absent) → false `CAN_PUSH_DEV=true` → checkout on live session: **Mitigated by D23 double-guard + reversible checkout** (structurally, not by probe accuracy).
2. Shim becomes load-bearing for 6 workflows; must be side-effect-free: **Mitigated by Flow 1 post-source assertion** (distinct message for unset vs false).
3. Blocked-`sleep` hang produces **zero observability**: **Mitigated by `timeout`-wrapped caps** (mechanism survives blocked primitive); **Spike A must confirm platform errors rather than blocks**.
4. Repo settings (branch protection, auto-delete-head-branches) invisible to git, break autonomous close: **Mitigated by committed assertion in close path** (`:806` already fails loudly); **dependency written into `docs/deployments.md`** (not a Step-1 preflight—lacks admin scope).
5. Flags set but read nowhere; magic-number duplication: **Mitigated by vitest prose audit** (not behaviour test; presence grep for `CAN_*` readers and foreground sleeps).
6. Extra MCP calls widen lethal-trifecta surface (§5a): **Adjacent to #342**; D13's max-1 gh→MCP bound is real mitigation; do not duplicate #342's scope.
7. Mode-1 non-regression (worst outcome: mode 1 never exercises mode 3's path): **Mitigated by real end-to-end run** (not rule-text-presence test; this is D1's exact aetiology).
8. `core.bare` flip rides along in close block (laptop-specific workaround): **Decided: leave unconditional** (no-op where already false; gating adds branch for zero gain).
9. `push_files` conflict inversion (branch-wins server-side vs dev-wins locally): **Mitigated by dev-head-unmoved precondition** (narrower than `-X ours`; only if D5 survives Spike B). **Biggest accepted risk**: two transports, mode 1 never exercises mode 3, silent divergence if heads collide.

**Spike-owned risks:**

- Spike A (D21): Predicted sourced state doesn't survive Bash-call boundary; re-probe × 34 explodes cost.
- Spike A (D22): Predicted platform errors on `sleep`; if blocked, hang produces zero observability.
- Spike B (D5): Predicted `push_files` payload accepted; conflict inversion confirmed; can be preconditioned away.

## Action Items

Design is **NOT ready for planning** in its current state. The following must be resolved before `/bkit-plan`:

1. **Spike A MUST run before building Layers 0/1.** Resolve:
   - Does sourced state survive Bash-call boundaries? (Predicted: no; current cost model is wrong.)
   - Per-block re-derivation price: time `bkit_runtime_detect` ×34.
   - Does mode-3 harness **error** on `sleep` or **block**? (If block, Risk 3 hang is real; yield branch mandatory.)
   - Does harness inspect command strings? (If yes, sourcing `sleep` in shim evades guard — shim defeats its own protection.)

2. **Spike C (D26) MUST establish which MCP server serves mode 3 under which tool names, before WS-2/14 author anything.**
   - Establish whether reachable GitHub MCP is `.mcp.json`'s `github` server (needs `GH_BKIT_TOKEN` in-sandbox) or claude.ai's proxy-brokered built-in (different names).
   - Resolve credential coupling: both `.mcp.json:7` and `cloud-bootstrap.sh:61` read `GH_BKIT_TOKEN`; if mode 3 withholds it, `GH_OK=false → use MCP` fails with its own trigger condition.
   - Enumerate actual tool names; every `mcp__github__*` name in §6c is provisional.

3. **Spike B (D5) MUST measure `push_files` before WS-13 author adopts D5 or D5(a).**
   - Confirm payload acceptance (193 KB / 9 files on GitHub MCP `push_files` against protected dev).
   - Confirm conflict semantics: does `push_files` write unconditionally (clobbering concurrent dev edits) or respect dev head unmoved precondition?
   - If D5 survives, Flow 4's prologue (STRAY guard, dev-head-unmoved check, explicit message, `get_file_contents` re-read) is load-bearing.
   - If D5 rejected, D5(a) (PR-close + drop `[skip ci]`) becomes primary, making §6d scope (status-commit subjects) prerequisite, not option.

4. **D7 (13 coupled sites) scope clarification for WS-9.** Ensure builder knows all three site classes (Placeholders definition × 5 files, gate items × 5, Worktree-removed × 3) must ship in one commit; silent partial implementation breaks adopt mode on every step.

5. **Mode-3 integration risk: WS-16 real end-to-end run is the **only** guarantee that consumption honours flags.** CI cannot pre-exercise mode-3 code path. Accept that Success Criterion 1's "verified non-regression" rests entirely on WS-16.

6. **Two file-level concurrency hazards must be serialized at landing.** WS-8 + WS-11/12 all touch `bkit-build.md`, `bkit-debug.md`, `bkit-ship.md`. Order and batch to prevent checkout conflicts.

## Outstanding Questions

- **OQ1: Playwright artifact seam (§8.2)**: Job-logs-only for cloud e2e, or one sanctioned `gh api`/`curl` exception? No MCP artifact-download tool exists; only the rich report is lost, not the failure signal. — **Recommended:** Job-logs-only is acceptable; adjust test expectations in WS-15 to not require rich artifacts from mode-3 runs.

- **OQ2: Narrow tracker read-path corroboration (§6i)**: Should `§6i` admit narrow `gh` read fallback for private repos outside MCP? D12 says no (doctrine forbids `gh` for tracker ops); corroborate within MCP instead. If MCP-internal corroboration proves unreliable (which D12's note explains it may), revisit. — **Recommended:** Stick with D12 (MCP-internal corroboration only). If live fallback frequency shows corroboration fails, open a follow-up; don't pre-guess. Root cause of `search_issues` zero on private repos is undiagnosed (OQ3).

- **OQ3: MCP `search_issues` zero on private repos**: Is this bkit-side config/scope or upstream MCP bug? Undiagnosed; logged in `docs/failures.jsonl`, `.bkit/friction.jsonl`. — **Recommended:** Open a separate diagnosis task post-ship. D12 mitigates the symptom (mark zero as inconclusive, corroborate via `list_*` call, log as distinct state); the root cause investigation is out of scope here.

- **OQ4: Which of 4 `CAN_*` flags earn their keep?**: `CAN_SLEEP` is structurally weakest (cannot obey D2, harness-policy-gated, unprobeable from bash); turn-yield alternative needs validation it doesn't degenerate into rate-limited tight-looping. — **Recommended:** Run Spike A's sleep-semantics probe. If harness blocks (not errors), yield branch becomes mandatory; measure whether counter-bus-based cross-turn yielding can bound the poll without degeneration. If it can, `CAN_SLEEP` earns keep; if not, fallback to pure prose prose-per-attempt orchestrator loop.

- **OQ5 (not adopted, recorded to not silently drop)**: Periodic `bkit-analysis` pass summarizing `transport-fallback` frequency against `GH_OK=false` runs. Proposed in review as ongoing reader of new rows. **Recommended:** Defer. D25 gives the rows a mechanical reader inside Close Workflow (part of design scope). Analysis/aggregation is new feature; revisit if fallback frequency becomes operational concern post-ship.

## Suggested Workstreams

**Decomposition is intricate.** Four roots (WS-1, WS-2, WS-4, WS-5); three spikes plus 16 workstreams; explicit ordering hazards and coupling constraints.

**Key sequencing notes:**

- WS-1 (Spike A) blocks Layers 0/1 (WS-6, WS-8).
- WS-2 (Spike C, D26) blocks WS-14 (fallback lane) and WS-3 (Spike B) payload/server assumptions.
- WS-3 (Spike B) blocks WS-13 (shape A close) transport selection (D5 vs D5(a)).
- WS-4 (FID reorder) is prerequisite to WS-9 (adopt-or-mint, needs marker-primary FID).
- WS-6 (shim) is prerequisite to WS-7/8/9/10/14/15 (all consume `CAN_*`).
- **WS-10 (close-guard kernel D23/D24/D25) is deliberately ordered early** (depends only on WS-6) and **off Spike-B critical path** — it mitigates the design's biggest accepted risk (mode 1 never exercises mode 3) regardless of which transport wins, so deferring it until D5 fork resolves would be the single most damaging sequencing error.
- WS-13 is not one workstream: it is a fork (D5 vs D5(a), spike-gated); each branch has different scope.

**Workstreams WS-1 through WS-16 as designed are dependency-clear; no step 9 (sub-issues) is planned since FID carries no MILESTONE label.**

## Recommended Next Step

```
/bkit-plan 341

Brief: Design ready for planning phase subject to three pre-build decision spikes (A, B, C). Spike A (shim state model, sleep semantics) is critical path and highest discovery risk; settles Layer 0/1 feasibility. Spike C (which MCP server) unowned in original design; hardest gate for #341's centrepiece change (#2 fallback lane). Spike B confirms D5 viability; if rejected, activates unbudgeted scope (§6d, PR-close + drop `[skip ci]` from status-commit subjects). All three spikes must return before WS-3/6/14 author code. Mode-3 code exercised only in WS-16 real end-to-end runs; CI pre-exercise impossible. Adoption of mode 3 carries highest mode-1 regression risk since the transport-specific paths diverge (D1's exact aetiology). See design file for 26 decisions, 9 risks, 5 open questions (3 non-blocking), 7 success criteria (1 aspirational pending WS-16).

Design doc: docs/plans/202607/logs/341-three-runtimes/design-v3-organised.md
```
