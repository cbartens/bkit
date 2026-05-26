Verdict: PASS

<!-- verdict:end -->

# Build-Readiness Summary: bkit-cloud Rebuild on Claude GitHub App

## Overview

The completed plan losslessly covers the authoritative FINAL SCOPE comment for issue #141 (issuecomment-4542046671) and partitions it into three self-contained, correctly ordered child sub-plans for execution-session sizing.

**What the plan delivers:**

1. **Child 1 (Block 1):** D1 fix (`id-token: write` + App-auth framing), cloud-module split (`cloud=claude`/`cloud=cursor`), symmetric tracker/cloud constraint + tracker-switch hard-block, manifest split, advisory flip (App optional→required), `bkit check` consistency, and preflight reconciliation.
2. **Child 2 (Block 2 + 3):** #184 shared HEAD-subject assertion integration, D2 skip-tags (`[skip ci]` on `worktree-setup`/`create-pr`), `bkit [auto route]` marker placement (mode-dependent, ordering-fixed), two-tier CI gate with live kill switch, SHARED-DERIV FID derivation, and D3 concurrency-key reconciliation.
3. **Child 3 (Block 4 + Verification):** `@claude /bkit-<phase>` wiring (bkit-repo-only per DECISION-B), bare `Auto`→`bkit:auto` migration across preflight hooks + trackers.md, and the full automated + manual verification (13 checklist items 1:1 with FINAL SCOPE).

**Execution order:** sequential, same branch, single squashed PR. All 22 runbook tasks (T1.1–T1.11, T2.1–T2.7, T3.1, T4.1–T4.3) are present and traceable. The partition respects dependency order: Block 1 cloud-module split gates Block 2's YAML gate construction; Block 2's SHARED-DERIV FID is reused by Block 3's concurrency key; Block 3 verification exercises combined output.

---

## Plan Quality

**Scope Coverage:** Complete. The five locked decisions (A–E) are carried in full into the child(ren) that act on them; the runbook tasks directly implement the FINAL SCOPE blocks; the Architecture & Component Changes section maps 1:1 onto the in-scope surfaces table.

**Dependencies:** Correctly identified. #184 is the critical hard dependency — its exact shared HEAD-subject assertion shape is a Gate-1 prerequisite (resolved before child 2's T2.1); the assertion must treat `bkit [auto route]` as a legitimate HEAD token. The plan chains this correctly: Gate 1 (child 1) resolves #184 shape → T2.1 (child 2) lands assertion → T2.3/T2.4 use marker → T2.7 gates on marker. SHARED-DERIV is defined once in T2.7 and reused in T3.1 (no duplicate divergent logic).

**Gates:** Correct placement and clear sequencing. Gate 1 (child 1) covers human confirmations (Acceptance Scenario + Breaking Changes), #184 coordination, and preflight. Gate 2 is split per child (each child verifies its own tasks) and consolidated in child 3. Gate 3 confirms all documentation updates. Gate 4 (child 3) gates the single PR with automated tests + 13-item manual verification.

**Land-Together Constraint:** Strictly enforced. All three children explicitly state the constraint; the parent index § Land-Together Constraint forbids partial merges and mandates a single squashed PR combining children 1/2/3 + #184. No separate PRs. Merge method is locked to `--squash`.

---

## Completeness

**Losslessness Check:**

- **22-task runbook:** The master plan `plan-v3-checked.md` lists 22 T-prefixed tasks (T1.1–T1.11 = 11, T2.1–T2.7 = 7, T3.1 = 1, T4.1–T4.3 = 3). All are present in the child sub-plans:
  - Child 1: T1.1–T1.11 (11 tasks) — D1, cloud-module split, enforcement, advisory flip, consistency.
  - Child 2: T2.1–T2.7, T3.1 (8 tasks) — #184 assertion, skip-tags, marker, two-tier gate, concurrency.
  - Child 3: T4.1–T4.3 (3 tasks) — `claude.yml` wiring, `Auto`→`bkit:auto` migration, verification.
  - Total: 11 + 8 + 3 = 22 ✓

- **FINAL SCOPE blocks (4):**
  - Block 1 (D1 + cloud-module split + enforcement + advisory flip) → child 1 ✓
  - Block 2 (#184 assertion + D2 skip-tags + marker + two-tier gate) → child 2 ✓
  - Block 3 (D3 concurrency) → child 2 (T3.1) ✓
  - Block 4 (`@claude`/`claude.yml` + `Auto`→`bkit:auto`) → child 3 ✓

- **Defects (D1/D2/D3):** All three folded:
  - D1 (`id-token: write` missing, OIDC boot failure) — child 1 T1.1 ✓
  - D2 (bookkeeping commits lack `[skip ci]`, fire router mid-build) — child 2 T2.2/T2.3/T2.4 ✓
  - D3 (incoherent concurrency key, dispatch races auto-ship) — child 2 T3.1 ✓

- **#184 hard dependency:** Explicitly recognized; Gate-1 prerequisite carries T2.1's blocking condition; shared assertion must treat `bkit [auto route]` as legitimate ✓

- **In-scope surfaces (8 layers):** Auth/install, CI trigger discipline, shared invariant, triggers, labels, docs, tests — all present in Architecture & Component Changes sections across children ✓

- **Verification checklist (13 items):** Manual Verification section (child 3, lines 170–189) maps 1:1 to FINAL SCOPE checklist rows ✓

**Testing Plan:** Derived Test Matrix (child 1, lines 97–117) carries 18 rows covering all three children. Each row maps to a runbook task and cites target file + test type (Unit/Integration/Manual/YAML review). Rows are tagged **[C1]**, **[C2]**, **[C3]** for ownership. Matrix is complete.

**Documentation Updates:** Consolidated table across all children:

- `cloud.md` (child 1 T1.7 + child 2 T2.6 reference) — App requirement, two-tier gate, `--cloud=` doc
- `deployments.md` (child 2) — CI-trigger contract, worktree-setup/create-pr skip tags, `bkit [auto route]`, #184 assertion link
- `decisions.md` (child 2) — ADR: cloud rebuild on OIDC, split, gate, marker
- `knowledge.md` (child 2) — incident: D1/D2/D3 symptom → root cause → fix
- `trackers.md` (child 3 T4.3) — `bkit:auto` consistency, no bare `Auto`
- `.agents/advisories.md` (child 1 T1.11) — regenerate after advisory edits
- No child misses a required doc update; child 3 Gate 3 consolidates the confirmation.

---

## Acceptance Scenario

The plan carries a comprehensive, testable Acceptance Scenario in child 1 (lines 39–118):

- **Narrative:** consumer workflow (GitHub tracker, `@claude /bkit-<phase>` via App-generated `claude.yml`, auto-route via `bkit-cloud.yml` gated by `bkit [auto route]` marker + live `bkit:auto` kill switch).
- **Success Criteria:** 5 testable criteria directly from FINAL SCOPE (App auth, tracker/cloud constraint, zero-runner behavior, skip-tags + marker, #184 contract + legitimate marker treatment).
- **Concrete Example:** step-by-step (comment trigger → close-workflow marker → CI auto-route → kill-switch demo).
- **Edge Cases:** 11 scenarios (skip-ci on rebuild, commit without marker, marker with lost label, concurrency race fix, tracker/cloud mismatches, tracker-switch hard-block, `bkit check` inconsistency, bare assignment out of scope, `/install-github-app` consumer path, debug re-trigger, #184 marker validity).
- **Derived Test Matrix:** 18 rows, all targeted and owned.

**Human Confirmation Gates:** Explicit checkboxes in child 1:

- [ ] Acceptance Scenario confirmed (line 121)
- [ ] Breaking Changes confirmed (line 152)

Both are **unchecked** — these are the expected pre-review human-gated items. The plan correctly flags them as Gate-1 prerequisites and notes (line 124): "Agent: Do NOT pass Gate 1 until this checkbox is `[x]`."

**Adherence to Template:** The Acceptance Scenario section fully adheres to the `docs/plans/template.md` spec: Narrative describes the feature from user perspective, Success Criteria are testable and concrete, Concrete Example walks a path, Edge Cases cover error paths, and the Derived Test Matrix is comprehensive.

---

## Design Alignment

The plan is standalone (no parent `{FID}-design.md`). The Acceptance Scenario Narrative + Success Criteria are derived directly from the FINAL SCOPE comment (lines 143–212 of `plan-input.md`) — not from an external design doc. The alignment is **exact:**

- FINAL SCOPE decision 1 (App auth via OIDC) → child 1 T1.1, DECISION-A, Security section ✓
- FINAL SCOPE decision 2 (App base requirement) → child 1 T1.7, advisory flip ✓
- FINAL SCOPE decision 3 (`cloud=claude`/`cursor` split) → child 1 T1.5, DECISION-C ✓
- FINAL SCOPE decision 4 (enforcement from `package.json`) → child 1 T1.6, DECISION-D ✓
- FINAL SCOPE decision 5 (App presence: recorded state + advisory + check) → child 1 T1.8, T1.7 ✓
- FINAL SCOPE decision 6 (triggers: `@claude /bkit-<phase>` + manual ship/debug via CI) → child 3 T4.1, T2.3/T2.4 ✓
- FINAL SCOPE decision 7 (two-tier gate) → child 2 T2.7 ✓
- FINAL SCOPE decision 8 (`bkit [auto route]` marker + ordering) → child 2 T2.3/T2.4 ✓
- FINAL SCOPE defects (D1/D2/D3) → child 1 T1.1, child 2 T2.2–T2.4, T3.1 ✓
- FINAL SCOPE #184 coupling → child 2 T2.1 (Gate-1 prerequisite) ✓

**Plan scope ⊆ design scope:** The plan's scope is derived from FINAL SCOPE; no deviations or out-of-band additions. The three children partition the blocks in order; the constraints (land-together, no separate PRs, squash merge) are enforced uniformly.

---

## Risks

### Unknowns

1. **#184's exact assertion shape and home location:** Known as a Gate-1 prerequisite but not specified in these plan artifacts. The blocking dependency is correctly identified; the builder must resolve it from GitHub issue #184 and any associated plan artifact before child 2 T2.1. Risk: **EXPECTED PRE-BUILD.** The plan gates on this (Gate 1 checkbox: "#184 coordination resolved").

2. **Live dispatch runtime-verification (Manual Verification item 1):** Explicitly noted as not automatable in-plan — requires a real GitHub Actions dispatch + Claude App installation on a test repo post-merge. **Expected post-merge human gate.** The plan correctly flags it as "HUMAN-GATED, POST-MERGE" (child 3 line 177).

### Dependencies

1. **#184 shape resolution:** Critical path. Must be done before child 2 T2.1 lands. The plan correctly sequences this as a Gate-1 prerequisite in child 1.

2. **Child 1's `bkit-cloud.yml` template edits (T1.1–T1.3):** Foundation for child 2's T2.7 (two-tier gate) and T3.1 (concurrency). Plan correctly marks this dependency (child 2 line 24: "child 1's `bkit-cloud.yml` template + rendered-copy edits").

3. **Child 2's SHARED-DERIV FID (T2.7):** Foundation for child 2 T3.1 (concurrency reuses it) and child 3's verification. Plan correctly forbids duplicate divergent logic (child 2 line 25: "do NOT introduce a second FID derivation").

### Assumptions

1. **Acceptance Scenario + Breaking Changes human confirmations will be obtained before child 1 execution.** The plan gates on Gate-1 checkboxes but does NOT assume they are pre-confirmed — it flags them as REQUIRED and instructs the agent not to proceed until checked. **Correct assumption of pre-review state.**

2. **bkit test infrastructure (Vitest) will run the named test suites without new dependencies.** Verified in Pre-Flight (child 1 line 196): "No new npm deps expected." Low risk.

3. **Render parity will be verifiable via `renderCloudWorkflow(template, "github")`:** The function exists in `bkit-modules.ts` and is tested. Low risk.

4. **The FINAL SCOPE comment is authoritative and supersedes all earlier comments.** The plan correctly asserts this (plan-input.md lines 11–27). Low risk.

### Mitigation

The plan correctly delegates the #184 shape resolution to the Gate-1 human-confirmation phase and correctly gates T2.1 on it. The land-together constraint and squash-merge requirement prevent partial shipment. Test coverage is comprehensive.

---

## Action Items

**No revisions required for build-readiness.** The plan is complete and well-formed.

**However, the following items are EXPECTED to be outstanding at plan-review time:**

1. **Human Confirmation Gates (Gate 1 in child 1, currently unchecked):**
   - [ ] Acceptance Scenario confirmed (Narrative, Success Criteria, Concrete Example, Edge Cases, Derived Test Matrix) — child 1 line 121
   - [ ] Breaking Changes confirmed (5 consumer-facing breaking changes, new names, field name lock `bkit.cloud`) — child 1 line 152
   - **Action:** Human must review and check these boxes before the agent proceeds to child 1 T1.1.

2. **#184 Coordination (Gate 1 prerequisite, currently unresolved):**
   - #184's exact shared HEAD-subject assertion shape, its bkit-managed home, and its token-allowlist contract must be resolved from GitHub issue #184 (and any associated plan artifact in `docs/plans/`).
   - The assertion must explicitly treat `bkit [auto route]` as a legitimate HEAD token (not a skip tag).
   - **Action:** Human must resolve #184's spec and record it (or the builder must fetch it from #184's issue/plan) before child 2 T2.1 is executed. This is a blocking dependency — child 2 T2.1 cannot proceed until the shape is known.

3. **Manual Verification Item (1) — Post-Merge Live Dispatch (child 3 line 177, currently deferred):**
   - Requires a real GitHub Actions dispatch on a fixture repo with the Claude App installed + `ANTHROPIC_API_KEY` set.
   - Must confirm `claude-code-action@v1` reaches a Claude turn (no OIDC boot error).
   - **Action:** Human performs this verification after the PR merges. Not automatable in-plan. The plan correctly gates it as "HUMAN-GATED, POST-MERGE."

**All action items are expected pre-build state and are correctly handled by the plan.**

---

## Summary

The plan is **build-ready.** It losslessly covers the FINAL SCOPE, partitions into three correctly ordered, self-contained child sub-plans (11 + 8 + 3 = 22 tasks, accounting for all FINAL SCOPE blocks and defects), and gates all human-decision points explicitly. The two unchecked human-confirmation gates (Acceptance Scenario + Breaking Changes) are expected at plan-review time and do not downgrade the verdict. The #184 hard dependency is correctly identified as a Gate-1 prerequisite. The live-dispatch runtime-verification item is correctly flagged as post-merge and not automatable in-plan.

**Execute in order: child 1 → child 2 → child 3, all on one branch, one squashed PR, landing together with #184's shared assertion.**
