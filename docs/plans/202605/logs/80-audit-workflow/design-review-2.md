Verdict: CONCERNS

<!-- verdict:end -->

# Design Review

Lens: Operability — failure modes, observability, on-call ergonomics.
Review scope: Pass-3 delta surfaces — conditional-lens mis-detection, `--with-websearch` network surface, reference-signal down-rank contract, 16-slot fan-out blast radius + `[lenses=...]` recovery, three-state `## Missing Lenses` manifest + fixed 16/21-slot `status.json` array. Cross-check that Pass-2 C-1/C-2/C-3 resolutions are preserved by the extension.

## Failure-Mode Enumeration

### Pass-2 baseline CRITICAL resolutions — regression check

The Pass-2 design resolved three CRITICAL operability gaps. Pass-3 must not regress them.

**C-1 (confidence guard) — PRESERVED and extended.** The `confidence: low -> CONCERNS` rule on stack-detect is retained. Pass-3 adds a second trigger: non-empty `## Applicability Disagreement` also forces CONCERNS at Step 3, and the Step 3 tracker comment now surfaces a one-line applicability summary alongside `confidence`. The guard is stronger in Pass-3.

**C-2 (parse-error section) — PRESERVED unchanged.** `## Parse Errors` in `audit-v1-synthesis.md` + orchestrator gate are explicitly called out as "UNCHANGED from Pass 2" in the design's Components section. Pass-3 adds no new parsing path that bypasses this gate.

**C-3 (missing-lenses gate) — EXTENDED with a stronger contract.** Step-6 grep-assert is extended to row-per-slot validation: every one of the 16 declared slug names must appear exactly once with a `ran` | `N/A -- not applicable (` | `crashed (` state token. First absence -> synthesiser re-issue with tightening prompt; second absence -> Failure Path. Net strengthening.

No regression detected on C-1/C-2/C-3.

---

### Step 3 — Stack Detect (Pass-3 additions: `## Applicability` block, `## Applicability Disagreement`, applicability-override merge)

| What fails                                                                                                                     | How detected                                                                                                                                                                                                                                                                                                                                                                                                                                         | Blast radius                                                                                                               |
| ------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| False-negative applicability flag — `hasWebSurface: false` on a Next.js repo where signal is below depth-3 heuristic threshold | (a) `confidence: low -> CONCERNS` fires if signal is weak; (b) `## Applicability Disagreement` fires if `frameworks` contains a UI token OR `src/app/` exists. Gap: a repo with UI source files only at depth > 3 and no manifest-level signal passes both guards silently. `confidence` may still be `medium`. Outcome: UI/UX lens shows `N/A -- not applicable` with no alert beyond the applicability summary line in the Step 3 tracker comment. | UI/UX, data-layer, or ai-llm lens silently excluded; single run, silent coverage gap.                                      |
| False-positive applicability flag — `hasDb: true` on a repo with a stub `drizzle.config.ts` but no real DB integration         | Each conditional lens carries a sanity-probe-before-emit clause: if zero matching source files found when flag is true -> emit `# Not Applicable (flag=true but no surface evidence)` and exit cleanly. Correctly handled.                                                                                                                                                                                                                           | Single lens emits an N/A-like result; 25-finding cap and explicit `location:` fields bound noise if sanity probe misfires. |
| Applicability-override merge bug — `[applicability-override=hasDb=true]` not parsed from `audit-input.md` and silently ignored | No detection path. `## Applicability Overrides` would read `None.` instead of the expected override entry. Human must notice the discrepancy between their flag and the Step 3 tracker comment applicability summary.                                                                                                                                                                                                                                | One flag not overridden; conditional lens stays off for the run with no error.                                             |
| Flag-name typo in `## Applicability` block — `hasWebsurface` instead of `hasWebSurface`                                        | Each lens asserts its `requires:` flag in the block; a capitalisation mismatch means the field is not found -> treat as `false` -> lens self-no-ops. The `## Missing Lenses` row shows `N/A -- not applicable (hasWebSurface=false)` which looks legitimate. Plan-level grep-gate detects the typo only at build/plan review time, not at runtime.                                                                                                   | Silent at runtime; detectable at plan review only.                                                                         |
| `## Applicability -- Flag Inventory` enum block absent (stack-detect truncated before writing it)                              | No gate on this block's presence — orchestrator gate is artifact-exists+non-empty only. The downstream plan-level universality grep-gate silently cannot run.                                                                                                                                                                                                                                                                                        | Build-time safety net fails silently; runtime is unaffected but the universality guard is blind.                           |
| `schemaVersion` not bumped from v1 to v2 in produced `audit-stack.md`                                                          | All 16 lenses assert `schemaVersion >= 2`. A v1 schema causes each conditional lens to degrade: treat absent applicability flag as `false` and record `crashed (unknown applicability -- schema mismatch)` in `## Missing Lenses`. Correctly surfaced per design.                                                                                                                                                                                    | All 16 lenses simultaneously degrade; `## Missing Lenses` makes it visible.                                                |

### Step 5 — 16-Slot Parallel Fan-out (Pass-3 additions: conditional gating, `[lenses=...]` escape, `--with-websearch`, `# Not Applicable` body pattern)

| What fails                                                                                              | How detected                                                                                                                                                                                                                                                                                                                                 | Blast radius                                                                                                              |
| ------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Conditional lens writes empty body instead of `# Not Applicable\n\nReason:` body when its flag is false | Orchestrator artifact-exists+non-empty gate catches an empty body -> CONCERNS or Failure Path. A minimal non-empty but malformed body (no `# Not Applicable` header) passes the gate but the synthesiser cannot classify it as `N/A` -> falls through to `crashed ({reason})`. Visible in `## Missing Lenses`.                               | Single lens row mis-classified; surfaced in coverage manifest. Not silent.                                                |
| `[lenses=slug,slug]` restricted launch without emitting `# Not Applicable` stubs for excluded slots     | Design states gated-out lenses "still emit an artifact" but does NOT explicitly state whether `[lenses=...]`-excluded lenses emit stubs. If they do not, the `status.json#steps[5].artifacts` 16-entry array has gaps. The synthesiser reads the 16-slot manifest and may classify missing artifacts as `crashed`. Not explicitly specified. | `status.json` array has fewer than 16 entries; downstream readers expecting 16 may fail or miscount. Ambiguity in design. |
| `[lenses=slug,slug]` partial re-run reuses stale lens artifacts from prior worktree run                 | If the worktree from a prior audit still exists, the Step-6 synthesiser reads all 16 lens artifacts (old and fresh mixed). `## Missing Lenses` reflects prior-run results for the 14 non-relaunched lenses. Design does not specify artifact-staleness handling for partial re-runs.                                                         | 14 of 16 lens findings potentially stale; human cannot distinguish fresh from stale in the synthesis.                     |
| `[lenses=slug]` input contains an unknown slug (typo)                                                   | No pre-validation of slug names against the 16-slot enum. The orchestrator attempts to launch the unknown slug; no matching prompt file exists; post-Step-5 gate finds the artifact missing -> CONCERNS or Failure Path. Not silent.                                                                                                         | Single lens slot missing; detectable.                                                                                     |
| All 16 lens agents fail simultaneously (e.g. `audit-stack.md v2` with `## Applicability` block absent)  | All 16 lenses degrade to CONCERNS (schema mismatch path) or crash. Worst-of-surviving verdict triggers Failure Path. `## Missing Lenses` surfaces all 16 as `crashed`.                                                                                                                                                                       | Full audit invalidated; all 16 lenses at Opus cost wasted. Blast radius bounded to single run.                            |
| `supply-chain` lens issues a non-allowlisted Bash command (prompt drift or model improvisation)         | No runtime enforcement of Bash allowlist — allowlist is prompt-body discipline only. Tool surface grants raw `Bash`. A mutation command would execute in the audit worktree.                                                                                                                                                                 | Worktree state may be corrupted. Audit is read-only by design but the sandbox cannot enforce the restriction.             |

### Step 5 — Reference-Signal Lens Specific Failure Modes

| What fails                                                                                           | How detected                                                                                                                                                                                                                                                                                                                                           | Blast radius                                                                                                                                             |
| ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| WebSearch returns stale or different reference repos between two runs on the same commit             | `## Reference Repos Used` section captures repos + commit/tag + search query; reproducibility is "explainable not identical" per design. Human can compare two lens artifacts. No automated alert.                                                                                                                                                     | Single run; divergence explainable from provenance log.                                                                                                  |
| WebSearch returns empty results (no error, zero hits) without raising an exception                   | Lens may emit zero findings + `ran` state, surfacing the signal unavailability only as a zero-finding lens. Design does not specify behaviour on zero-hit WebSearch explicitly.                                                                                                                                                                        | Single lens only; no other lenses affected. The `## Missing Lenses` row shows `ran` not `crashed`, hiding the fact that no network signal was retrieved. |
| `confidence: low` or `source: reference-repo` tag accidentally omitted on a reference-signal finding | If `source:` is omitted entirely, the organise step cannot distinguish it from an internal finding and promotes it to the top section. The C-2 `## Parse Errors` gate detects malformed blocks but not missing optional fields. The organise down-rank grep-assert gates on `source: reference-repo` lines -- an omission means the fence cannot fire. | One reference-repo finding in top-critical position, polluting the audit.                                                                                |
| Reference-signal finding correctly tagged leaks into matrix top row despite grep-assert              | Organise self-verify grep-assert enforces the fence; `source: reference-repo` in top rows -> FAIL -> Failure Path. Contract is machine-enforceable and the enforcement is specified. Correctly handled.                                                                                                                                                | Single run; Failure Path re-run required.                                                                                                                |

### Step 6 — Synthesise (Pass-3 additions: three-state `## Missing Lenses`, `source:` dedup-safety)

| What fails                                                                                                           | How detected                                                                                                                                                                                                                                                                                                    | Blast radius                                                                                                                            |
| -------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `## Missing Lenses` row-per-slot validation fails (synthesiser omits a slot)                                         | Step-6 extended grep-assert catches missing row -> re-issue with tightening prompt; second absence -> Failure Path. Correctly handled per Pass-3 design.                                                                                                                                                        | Single run; correctly gated.                                                                                                            |
| Synthesiser hardcoded slug enum drifts from actual roster (new lens added in future pass, enum not updated)          | The grep-assert validates each slug in the synthesiser's own hardcoded enum, not the orchestrator's actual launch set. A slug present in the launch but absent from the enum silently disappears from the coverage manifest. Not a v1 concern but a future maintenance risk.                                    | Silent coverage gap post-future lens addition; detectable only by manually counting slots.                                              |
| `source: reference-repo` dedup-safety rule fails -- internal finding upgraded via reference-repo cross-lens presence | If the synthesiser's prompt-level dedup rule is not correctly followed, an internal LOW-confidence finding could be upgraded to MEDIUM via a reference-repo finding at the same location. The organise step cannot retroactively detect this; `source:` is preserved but `confidence` would have been upgraded. | Single finding's confidence incorrectly elevated; may surface in a top section where it would otherwise be demoted. Not directly gated. |

### Step 7 — Organise (Pass-3 addition: reference-signal down-rank grep-assert)

| What fails                                                                                                              | How detected                                                                                                                                                                                                                                                                       | Blast radius                                                                        |
| ----------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Down-rank grep-assert specification is too narrow (greps only `source: reference-repo`, omits `confidence: low` branch) | Design specifies "any `source: reference-repo` OR `confidence: low` line in those blocks => FAIL". If the prompt body omits the `confidence: low` branch, internal low-confidence findings can leak into the top section without triggering the assert. Not detectable at runtime. | Internal low-confidence findings in top-critical position.                          |
| Reference-signal finding passes the fence because `source:` field was lost during dedup                                 | Synthesiser dedup-safety rule specifies reference-repo findings dedup only against each other. If the field is collapsed during dedup, organise receives the finding without `source: reference-repo` and cannot identify it for down-ranking.                                     | Reference-repo finding in top-critical position; down-rank contract silently fails. |

### Cross-cutting: `status.json` Fixed 16-Slot Array Shape

| What fails                                                                                                     | How detected                                                                                                                                                                                                                                 | Blast radius                                                                          |
| -------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Downstream reader hard-compares `steps[5].artifacts.length` to 11 or 16                                        | Design explicitly states downstream readers MUST treat as a list. `bkit-trackers` and cloud orchestration are called out. Not verifiable at design time; latent break surfaces on first Pass-3 audit run if external tooling is not updated. | External tooling breaks on first audit run post-ship.                                 |
| `[lenses=...]` partial launch produces fewer than 16 artifact entries with no stub emission for excluded slots | Design ambiguity: gated-out lenses emit stubs, but it is not specified whether `[lenses=...]`-excluded lenses also emit stubs. Gap in the 16-entry guarantee for partial re-runs.                                                            | `status.json` array inconsistent; downstream readers that expect 16 entries may fail. |

---

## Observability Coverage

The project's observability infrastructure is CLI stdout/stderr only (`docs/observability.md` Scope: "bkit has no server-side telemetry pipeline, log drains, or tracing infrastructure"). All observability for `/bkit-audit` is on-disk artifacts + tracker comments. The `[{Context}]` bracketed log prefix convention applies to the `bkit install` CLI, not to workflow agent logs.

Per Pass-3 delta failure mode:

| Failure mode                                                                          | Structured log at failure point                                                                                                                                                                                                                                                                 | Metric/counter | Trace/correlation id      | Assessment                                                                                 |
| ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- | ------------------------- | ------------------------------------------------------------------------------------------ |
| False-negative applicability flag (silent N/A on real surface)                        | Step 3 tracker comment carries one-line applicability summary (e.g. `hasWebSurface=false`) — human-visible but not machine-alertable. `## Applicability Disagreement` block fires if inverse evidence is present. Gap: deep-signal repos below depth-3 threshold produce no disagreement block. | None           | FID threads all artifacts | CONCERN — partial mitigation; depth-limited heuristic miss is undetectable                 |
| Applicability-override parsing failure (override silently ignored)                    | `## Applicability Overrides` reads `None.` when override was intended. Human must compare input flag to Step 3 tracker comment. No structured parse-failure log.                                                                                                                                | None           | FID via tracker comment   | CONCERN — no proactive signal; human must know to look                                     |
| `confidence: low` guard fires correctly                                               | Step 3 CONCERNS verdict + tracker comment surface confidence explicitly. ACCEPTABLE.                                                                                                                                                                                                            | None           | FID                       | ACCEPTABLE                                                                                 |
| `## Applicability Disagreement` fires correctly                                       | Step 3 CONCERNS verdict + `## Applicability Disagreement` block in `audit-stack.md`. ACCEPTABLE.                                                                                                                                                                                                | None           | FID                       | ACCEPTABLE                                                                                 |
| `source:` tag accidentally omitted on reference-signal finding (finding leaks to top) | No detection path before organise self-verify grep-assert runs. If the omission results in `source:` being absent (not malformed), `## Parse Errors` does not flag it; the organise grep-assert only fires on findings that ARE tagged. An omitted tag is invisible to both gates.              | None           | N/A                       | CRITICAL -- reference-repo finding can reach top-critical position without any gate firing |
| `confidence: low` omitted from reference-signal finding (same scenario)               | Same gap as above -- the organise grep-assert keys on the field being present with value `low`, not on absence.                                                                                                                                                                                 | None           | N/A                       | CRITICAL -- finding promotes to top without detection                                      |
| `[lenses=...]` excluded slots without stubs (artifact array gap)                      | `status.json` array short; downstream readers may fail or miscount. No structured log at the exclusion point.                                                                                                                                                                                   | None           | FID via status.json       | CONCERN -- ambiguity in design; array inconsistency is latent                              |
| WebSearch zero-hit without error (reference-signal lens no-ops silently)              | Lens shows `ran` in `## Missing Lenses`; no distinction from genuinely clean result. No structured log of zero-hit network call.                                                                                                                                                                | None           | FID                       | CONCERN -- signal unavailability indistinguishable from "no divergence found"              |
| Synthesiser hardcoded slug enum drift (future lens addition)                          | Detectable only by manually counting `## Missing Lenses` rows. No structured log.                                                                                                                                                                                                               | None           | N/A                       | OPTIONAL -- not a v1 concern; future maintenance risk                                      |
| Downstream reader hard-compares artifact count to 11 or 16                            | External tooling error on first Pass-3 audit run. Surfaced by the tool's own error output, not by the workflow.                                                                                                                                                                                 | None           | FID via status.json       | CONCERN -- latent break; no pre-ship gate to verify downstream compat                      |
| `supply-chain` non-allowlisted Bash execution                                         | No runtime enforcement; worktree corruption may be discovered on next git operation or by the human inspecting the worktree.                                                                                                                                                                    | None           | N/A                       | CONCERN -- prompt-discipline-only allowlist; no sandbox enforcement                        |

---

## On-Call Ergonomics

This is an ad-hoc, human-invoked, read-only audit workflow with no production service impact. "On-call" in this context means the human invoker discovering a stalled, silent-failure, or mis-fired run and understanding what happened.

### Per anticipated failure state

**Silent false-negative N/A (conditional lens gated off on a real surface):**

- Detection: human reads the Step 3 tracker comment applicability summary + `audit-stack.md ## Applicability Disagreement`. If no disagreement block fired, the human has no in-band signal.
- Recovery action: `[applicability-override=hasWebSurface=true]` re-invocation. Idempotent. Escape hatch is documented.
- Runbook obviousness: the one-line applicability summary in the Step 3 tracker comment makes the flag value visible, but the human must know to look for it and know its implications. Not self-evident from a `ran` vs `N/A` row alone.
- Verdict: PARTIAL -- the escape hatch exists and is correct; the detection path relies on human attention to the tracker comment rather than an alert.

**Reference-signal finding in top-critical position (down-rank contract failure):**

- Detection: organise self-verify grep-assert fires -> FAIL -> Failure Path. Human receives a Failure Path comment with organise step + reason.
- Recovery: fix the finding's `source:` or `confidence:` field and re-run from Step 7 (`[lenses=...]` escape does not cover Step-7-only re-runs; human must re-run the full audit or manually patch the synthesis artifact). Recovery path for Step-7-only re-run is not specified.
- Verdict: GOOD for the grep-assert path. GAP: if `source:` was omitted entirely (not misspelled), neither `## Parse Errors` nor the grep-assert catches it -- the finding silently appears in the top section with no alert at all.

**Applicability-override parsing failure (override silently ignored):**

- Detection: human compares the intended override to the `## Applicability Overrides` block in `audit-stack.md` (reads `None.`).
- Recovery: re-invoke with corrected override syntax.
- Runbook obviousness: not obvious. The Step 3 tracker comment shows the applicability summary but does not distinguish "override applied" from "auto-detected". A human who supplied `[applicability-override=...]` and sees the wrong flag value must know to check `## Applicability Overrides`.
- Verdict: POOR -- no error signal; human must manually cross-check an artifact section.

**`[lenses=...]` partial re-run with stale artifacts:**

- Detection: none. Human sees a synthesis that blends fresh and stale findings with no provenance differentiation.
- Recovery: re-run with the full fan-out (remove `[lenses=...]`) or manually delete stale lens artifacts before re-invoking. Neither action is obvious from the synthesis output.
- Verdict: POOR -- no staleness signal; stale findings are invisible in the final synthesis.

**`supply-chain` Bash prompt drift (non-allowlisted command executed):**

- Detection: only if the worktree is in a modified state after the audit, discovered during the close-workflow git operations.
- Recovery: manual worktree inspection + reset. Not specified in the design.
- Verdict: POOR for detection; the risk is acknowledged in the design's Risks section but no detection or recovery path is specified.

**Downstream tooling hard-comparing artifact count (post-ship break):**

- Detection: first Pass-3 audit run after ship fails in external tooling (`bkit-trackers`, cloud orchestration) with a count-mismatch error from those tools, not from the workflow itself.
- Recovery: update the external tooling to treat the artifact array as a list. Not specified in the design as a pre-ship gate.
- Verdict: LATENT -- detectable at first run post-ship; the design flags it as a "verify at build/plan time" action but provides no enforcement.

---

## Operational Dependencies

New on-call burden introduced by Pass-3 extensions:

1. **No new alerts or dashboards.** The workflow remains ad-hoc and human-invoked; no scheduled runs, no CI integration, no metric emission. Zero new alerting infrastructure required.

2. **Applicability summary literacy.** Operators who invoke `/bkit-audit` on any repo must now understand the Step 3 tracker comment's applicability summary (`hasWebSurface=true, hasDb=false, ...`), know when an N/A row is expected vs suspicious, and know how to use `[applicability-override=flag=bool]` for correction. This is new knowledge not required in Pass-2.

3. **`[applicability-override=...]` and `[lenses=...]` escape-hatch knowledge.** Two new operator escape hatches, neither of which is surfaced in Failure Path comments or tracker gate output. An operator who encounters a mis-detected flag or wants a partial re-run must have read the design doc to know these escapes exist.

4. **Reference-signal provenance log (`## Reference Repos Used`).** When two `--with-websearch` audit runs on the same commit produce different findings, the operator is expected to compare `## Reference Repos Used` sections across lens artifacts. No tooling assists this comparison.

5. **`--with-websearch` reproducibility posture.** Operators must understand that `--with-websearch` audit runs are intentionally non-reproducible ("explainable not identical") and that the provenance log is the forensic record. This is a new mental model vs the skill-install reproducibility posture.

6. **`status.json` artifact array shape change (11 -> 16) requires external tooling update.** Any tooling that reads `status.json#steps[5].artifacts` must be verified to treat it as a list before Pass-3 ships. The design calls this out as a "verify at build/plan time" action; it is not a workflow-internal gate.

7. **`supply-chain` Bash allowlist as prompt discipline.** The allowlist is documented in the lens prompt body and in `.agents/prompts.md` § Tool set patterns, but is not enforced at runtime. Future prompt edits to `bkit-audit-lens-supply-chain.md` must respect the allowlist manually.

---

## Verdict Reasoning

The Pass-3 design is a coherent, well-structured extension of the PASS'd Pass-2 baseline. The core conditional-lens keystone (inlined `## Applicability` block, `requires:` frontmatter, launch-and-self-no-op, three-state `## Missing Lenses`) is operationally sound: belt-and-braces gating ensures flag bugs leave visible telltales rather than silent drops; the Step-6 extended grep-assert closes the coverage manifest gap; operator escape hatches (`[lenses=...]`, `[applicability-override=...]`) address the 3am recovery scenario; and the Pass-2 C-1/C-2/C-3 resolutions are verified preserved.

Three operability gaps of lesser severity than the Pass-2 criticals remain and are surfaced as CRITICAL and OPTIONAL below:

1. The reference-signal `source:` / `confidence:` omission path (not misspelling — complete absence) bypasses both the `## Parse Errors` gate and the organise grep-assert. A reference-repo finding can reach top-critical position with no alert. This is CRITICAL because the down-rank contract is stated as machine-enforceable but has an enforcement blind spot.

2. Two design ambiguities around the `[lenses=...]` escape hatch: (a) whether excluded slots emit `# Not Applicable` stubs (affecting the 16-entry array guarantee) and (b) whether stale artifacts from a prior run are reused without staleness markers. These are CRITICAL for the partial-re-run use case which is explicitly introduced as a recovery mechanism.

3. Several OPTIONAL gaps (override-parse failure detection, WebSearch zero-hit observability, depth-limited heuristic miss) are addressable at prompt authoring time without structural redesign.

The design does not require structural rework. The CRITICALs are prompt-level and gate-specification clarifications.

---

## CRITICAL

**C-1: Reference-signal `source:` / `confidence:` field omission bypasses all gates.**

The design enforces the down-rank contract via the organise self-verify grep-assert, which checks that top-section blocks do NOT contain `source: reference-repo` OR `confidence: low` lines. However if the reference-signal lens emits a finding with `source:` omitted entirely (not misspelled), two things happen: (a) `## Parse Errors` does not catch it because the block is structurally valid YAML; (b) the organise grep-assert cannot fire because the field it keys on is absent. The finding is then treated as an internal finding with default `confidence` and can promote to top-critical position.

Required: the synthesiser prompt must assert that any lens artifact from `bkit-audit-lens-reference-signal` (identified by its `Role:` line or artifact name) is post-processed to verify every `finding` block contains both `source: reference-repo` AND `confidence: low`. Any block missing either field is added to `## Parse Errors` with the raw block and reason "reference-signal finding missing required source/confidence field". This is additive to C-2 (Pass-2 UNCHANGED) and closes the enforcement blind spot without changing the down-rank fence logic.

**C-2: `[lenses=...]` excluded slots -- stub emission and stale-artifact behaviour are unspecified.**

The design introduces `[lenses=slug,slug]` as a recovery escape hatch for partial re-runs. Two operational questions are not answered:

(a) Do `[lenses=...]`-excluded slots emit `# Not Applicable` stubs? If not, the `status.json#steps[5].artifacts` 16-entry array has gaps, downstream readers that treat the array as fixed-length break, and the synthesiser may classify missing slots as `crashed` rather than "not launched this run". The design says gated-out lenses (flag=false) emit stubs -- it must state equally clearly whether `[lenses=...]`-excluded lenses emit stubs.

(b) If the worktree contains stale lens artifacts from a prior full run, does a `[lenses=slug,slug]` re-run overwrite only the relaunched slots? If not, the Step-6 synthesiser reads mixed fresh+stale artifacts with no provenance differentiation. The operator has no way to know which findings are from the current run.

Required: the orchestrator specification must explicitly state: (a) `[lenses=...]`-excluded slots DO emit `# Not Applicable (excluded by [lenses=...] operator)` stubs so the 16-slot array invariant holds; (b) the orchestrator deletes or archives all 16 lens artifact files at the start of Step 5 before launching the restricted set, so stale artifacts cannot be read by the synthesiser.

---

## OPTIONAL

**O-1: Applicability-override parse failure has no structured error signal.**

When `[applicability-override=hasDb=true]` is malformed or silently ignored, `## Applicability Overrides` reads `None.` and the Step 3 tracker comment shows the auto-detected flag value. The human must independently notice the discrepancy. Recommend: the orchestrator's input-parse step at Step 2 (where `audit-input.md` is written) emits an explicit "override parsed: hasDb=true" or "override parse failed: [applicability-override=hasDb] (missing =bool suffix)" line into the Step 2 tracker comment. This is a one-line addition to the input-parse block.

**O-2: WebSearch zero-hit result is indistinguishable from "no divergence found" in `## Missing Lenses`.**

The reference-signal lens currently shows `ran` in `## Missing Lenses` whether it retrieved useful reference repos or returned zero hits. A WebSearch failure that produces empty results (no exception, no error) masquerades as a clean no-divergence result. Recommend: the reference-signal lens prompt body specifies that a zero-hit WebSearch must emit a finding with `severity: LOW`, `class: operability`, `what: reference-signal WebSearch returned zero results`, `why: no popular reference repos found for this stack; signal unavailable this run`, `confidence: low`, `source: reference-repo`. This preserves the `ran` state (the lens ran) while surfacing the unavailability to the human reader in the demoted section.

**O-3: `[lenses=...]` escape hatch not surfaced in Failure Path comments or tracker gate output.**

When a full 16-slot audit fails or produces excessive cost, the operator's recovery action (`[lenses=slug,slug]` partial re-run) is not discoverable from the Failure Path comment or the tracker summary. Recommend: the Step-5 Failure Path comment body includes a one-line hint: "Re-invoke with `[lenses=slug,slug]` to audit a subset of lenses; see design doc for available slugs." Parallels the existing `[skills=false]` hint added by Pass-2 O-1 resolution.

**O-4: Depth-limited applicability heuristic threshold is not surfaced in `## Detection Coverage`.**

The `hasWebSurface` / `hasDb` detection heuristics probe at "depth <= 3" and "depth <= 4" respectively. A repo with relevant files only at depth > 4 (e.g. a large monorepo with deeply nested packages) produces `hasWebSurface: false` and `confidence: medium` (many files scanned, none matched), with no indication that the depth limit was the binding constraint. Recommend: `## Detection Coverage` adds an optional `heuristicDepthLimit: 3` field (emitted when depth-limited probes were the only probes applied) so the human and the inverse-evidence guard have visibility into the constraint.

**O-5: `status.json` 16-slot array compat has no pre-ship gate.**

The design flags downstream readers that hard-compare artifact count as a latent break and says "verify at build/plan time". No specific gate is specified (no build-time assertion, no plan-phase checklist item, no CI check). Recommend: the WS-6Δ workstream's Done-When criteria include "verify `bkit-trackers` and any cloud orchestration reads `steps[5].artifacts` as a variable-length list" as an explicit task so it is tracked rather than aspirational.

**O-6: `supply-chain` Bash allowlist is prompt-discipline only — no review gate.**

The allowlist lives in the lens prompt body. There is no plan-level or build-level assertion (e.g. a grep-gate confirming the allowlist block is present in `bkit-audit-lens-supply-chain.md`) analogous to the "zero library names" grep-gate. Recommend: the WS-3Δ workstream Done-When criteria include a grep-gate: "grep for `NEVER git checkout` in `bkit-audit-lens-supply-chain.md` returns a match" (confirming the allowlist block was not accidentally removed during prompt editing).

---

## OUT OF SCOPE

**Full Phase-3 WebSearch per-lens augmentation:** this review assessed the reference-signal lens as the first concrete use of `--with-websearch`. Future per-lens WebSearch enrichment (e.g. per-lens `"{stack} {lens} best practice {year}"` queries) is deferred to Phase 3 and not in scope for this review.

**Community skill trust / adversarial content validation:** the design acknowledges the skill-provenance risk and defers source-reputation gating. Content-level validation of installed skill payloads is a future concern (noted in the design's Open Questions).

**#207 extended conditional-lens taxonomy (`hasMobileApp`, `hasGraphQL`, `hasGRPC`, per-language sub-lenses):** all are deferred to #207 by the design. Operability of those additions is out of scope for this pass.

**Cross-audit aggregation / trending:** no mechanism for comparing finding severity trends across multiple `/bkit-audit` runs. Deferred per brief.

**`docs/audits/` pruning / archival strategy:** low urgency; bounded by the number of audit runs performed. Not a v1 concern.

**CI scheduling / automated audits:** the design is explicit that this workflow is ad-hoc only and never scheduled. On-call concerns for a scheduled run are out of scope.
