Verdict: CONCERNS

<!-- verdict:end -->

# Design Review

Lens: Operability — failure modes, observability, on-call ergonomics, drift surface area.

## Failure-Mode Enumeration

### 1. Workflow-Internal Failures

**Step 3 — Lens subagent crash / timeout / empty output**

- What fails: One or more of the 11 parallel `@bkit-audit-lens-{slug}` agents crashes, times out (>3600s caution limit in `bkit-debug.md`), or returns a zero-byte file.
- How detected: Design specifies (§Workflow Shape, Step 3 note): "per-lens findings persist on disk even if synthesizer timed out". But the design does NOT specify what the orchestrator does when a lens file is absent or empty BEFORE handing off to synthesize. The synthesizer verdict logic (§Synthesis, step 6) counts missing lens files as contributing to `FAIL` verdict ("lens files missing" → FAIL if > 5% of parse errors) — but this check is in the synthesizer, not the orchestrator. The orchestrator does not assert lens file presence before spawning synthesize.
- Blast radius: One or more lenses silently absent from the synthesis. The Severity × Class matrix will be incomplete; the audit ships with holes. FAIL verdict in synthesizer is the only catch, but only if ≥1 lens file is missing (threshold unclear — "5% parse errors" relates to malformed blocks, not absent files).
- Gap: No explicit gate in Step 3 close-sub-step: "assert all 11 `audit-lens-{slug}.md` files exist and are non-zero before proceeding to Step 4". Design should add this assertion before Step 4 invocation.

**Step 4 — Synthesizer fed malformed finding block**

- What fails: A lens writes a `finding` block missing a required field (e.g., no `severity` key, invalid enum, multi-line value without quoting).
- How detected: Design specifies (§Per-Finding Schema, step 3): malformed blocks go to `## Parse Errors` section, counted toward `CONCERNS` verdict. This is correct and visible.
- Blast radius: Per-block degradation only; synthesizer continues. `CONCERNS` verdict surfaces the count. Detection: review of `audit-v1-synthesis.md` `## Parse Errors` section.
- Residual gap: No minimum threshold specified. One parse error in 165 findings = CONCERNS verdict on an otherwise-clean audit. Could create alert noise on trivial malforms (e.g., a finding with a location containing a colon that breaks naive YAML parsing). Consider a 5% or absolute threshold before escalating to CONCERNS.

**Step 5 — Prioritizer producing unstable rank order**

- What fails: The self-verify gate ("every correlation_id from synthesis appears in matrix totals AND ranked list; orphan = FAIL") is specified. However, the secondary sort tie-breakers (class weight, confidence, cross-lens, file-path lexical) are deterministic by design. The design (§Synthesis) acknowledges "deterministic stable sort for reproducibility". Instability would arise only from non-deterministic confidence upgrades or floating-point in class weights — neither applies here (string-enum comparisons). This failure mode is low-probability as designed.
- Detection: FAIL verdict on orphan correlation_id. Adequate.
- Blast radius: Step 5 FAIL → Failure Path → no canonical artifact ships.

**Step 6 — Smoke-test fail with no clear remediation path**

- What fails: `--smoke-test` flag used; golden findings absent or lenses `config`/`hotpath`/`deps` fail to surface the three BAR-197 findings.
- How detected: `## Smoke-Test Attestation` section reads `FAILED`; Linear comment annotated. But the design states (§Smoke-Test Acceptance, step 3): "Step 7 still completes; the audit artifact ships; smoke-test FAIL is a signal to the developer that the lens charter regressed."
- Blast radius: Read-only workflow — the audit ships regardless. The smoke-test failure is informational with no automatic remediation path beyond "human investigates why lens charter regressed". No runbook entry specified for "smoke-test FAIL" response.
- Gap: No actionable remediation path documented. An operator seeing `Smoke-Test Attestation: FAILED` has no stated next step (is the finding schema broken? Is the pre-BAR-197 SHA inaccessible? Did a lens charter edit drop the BAR-197 probe?). The Linear comment annotation helps but the design needs a brief troubleshooting pointer.

**Linear MCP write failure**

- What fails: `save_issue`, `save_comment`, or `save_comment` (append) returns an error.
- How detected: Design (§Linear Lifecycle) specifies: "All `save_comment`/`save_issue` are best-effort; retry once after 5s, then continue." This is the same pattern as `bkit-debug.md` and is consistent.
- Blast radius: Single-run audit trail incomplete in Linear. Canonical artifact (`docs/audits/{FID}-audit.md`) still ships. INDEX.md still appended. Impact: Linear comment history has gaps; human cannot reconstruct audit steps from Linear alone.
- Gap: The design does not specify that a Linear MCP write failure is noted in `status.json` (as a warning, not FAILED). If the Step 3 comment fails, the compact lens-verdict table is lost from Linear. The artifact is recoverable from disk but the audit trail is degraded silently from the Linear perspective.

**Lock collision with concurrent `/bkit-audit` on a re-audit**

- What fails: Two operators invoke `/bkit-audit BAR-199` simultaneously. First generates FID `bar-199-audit-workflow-audit-20260515-1402`; second generates `bar-199-audit-workflow-audit-20260515-1403`. Lock keys are different (timestamp suffix) → both proceed. Both append to `docs/audits/INDEX.md`.
- How detected: Two rows in INDEX.md for the same day. No conflict; both complete. But concurrent writes to INDEX.md via sequential append could race if both reach Step 7 within the same second (extremely unlikely given the workflow's ~30min runtime, but theoretically possible).
- Detection: INDEX.md row count. Blast radius: duplicate audit rows, not data corruption. Low severity.
- Gap: Not a critical failure mode as designed — the timestamp-suffix FID design handles this cleanly. The only residual risk is two workflows appending to INDEX.md in the same second (negligible in practice).

### 2. Workflow-External Failures

**Probe catalogue rots**

- What fails: `bkit-audit-lens-charter.md` probes become stale — a framework change obsoletes a probe (e.g., Next.js drops `serverExternalPackages` in v14+); lens prompts still run the probe and emit false findings or miss true findings.
- How detected: No automated detection. Quarterly grep check suggested in brainstorm-ideate-3 is manual. No CI gate checks probe validity.
- Blast radius: All audits run against affected stacks produce stale signals. The `hotpath` and `config` lenses (BAR-197-class probes) are highest-value and highest-rotation-risk.
- Design coverage: Portability gate (synthesizer greps for stack-pinning words) catches NEW stack-pinning but does NOT catch stale probes whose probe text is already generic but whose probe logic targets an obsolete API.

**New framework version invalidates a probe**

- What fails: A STACK_FLAGS-gated probe (e.g., `HAS_NEXT` detecting `serverExternalPackages`) fires against a Next.js version where the config key has moved or been removed. Probe grep still matches (false positive) or stops matching (false negative) silently.
- How detected: Only by a human noticing unexpected findings or missing known-debt findings in the audit output. No automated probe-validity check.
- Blast radius: Lens-specific false positives/negatives. Does not crash the workflow.

**Deprecation header lingers past deletion target**

- What fails: `bkit-utility-audit-{codebase,security,tests,logs}.md` carry "Deletion target: v2.3.0" but the follow-up issue is never created or the deletion never happens. Four deprecated prompts accumulate in the registry indefinitely.
- How detected: `docs/pending.md` entry + human review. No automated staleness check.
- Blast radius: Registry drift; operators use deprecated prompts instead of `/bkit-audit`.

**`bkit install` mirror drift**

- What fails: A new lens prompt file is created in `.agents/prompts/` but `bkit install` is not run at session end. `.claude/commands/` and `.cursor/commands/` mirrors are stale — the new lens prompt is not available in Cursor/Claude's command palette.
- How detected: Operator tries to invoke `@bkit-audit-lens-architecture` in Cursor and gets "not found". The pre-push `pnpm bkit check` gate in `docs/deployments.md` § Pre-push checklist (gate 4) will catch this and abort the push.
- Blast radius: Operators using Cursor cannot invoke individual lens prompts standalone until the mirror is regenerated. Workflow invocations via `/bkit-audit` (which invoke subagents via the orchestrator) are not affected — they use `@name` via Agent tool, not the Cursor command palette.
- Design coverage: Addressed in §Architecture (bkit install note). The pre-push gate is the safety net.

## Observability Coverage

The design's observability model is almost entirely disk-based and Linear-comment-based. This is consistent with how the rest of the bkit suite works (`docs/observability.md` confirms: "Observability is limited to CLI stdout/stderr during `bkit install` / `bkit check` runs in consumer environments"). Observations per failure mode:

**Lens crash / empty output:**

- Logs: None specified at the orchestrator level. If a lens agent crashes, the failure surfaces only via the absent output file. No `[bkit-audit] lens {slug} failed` log entry specified.
- Metric: None.
- Trace: The per-step `status.json` entry captures `parentSha` and step status, but lens-level granularity within Step 3 is absent. The Step 3 status entry is ONE entry for the entire fan-out; individual lens verdicts appear only in the Linear comment table and in individual `audit-lens-{slug}.md` file headers.
- CRITICAL gap: If the orchestrator proceeds to synthesize with an absent lens file, the failure is detectable only in `audit-v1-synthesis.md` `## Parse Errors` or by the synthesizer's "lens files missing" → FAIL verdict. The orchestrator has no explicit post-Step-3 gate to assert all 11 files exist.

**Malformed finding block:**

- Logs: `## Parse Errors` section in synthesis output. Adequate for investigation.
- Metric: Count in synthesis verdict header (`{N}/{TOTAL} findings processed`).
- Sufficient for this failure mode.

**Synthesizer truncation:**

- Self-report: Design specifies synthesizer reports `{N}/{TOTAL} findings processed`. If N < TOTAL, truncation is visible.
- Metric: The `{N}/{TOTAL}` line in `audit-v1-synthesis.md`. Adequate.

**Linear write failures:**

- Logs: Retry once after 5s, then continue. No log of the failure in `status.json` or in the disk artifact.
- Gap: If the Step 3 fan-out compact comment fails, there is no disk record that the comment was attempted and failed. Status.json records step status but not MCP call outcomes. Operator reconstructing the audit from `status.json` alone would not know the Linear comment is incomplete.

**No structured `[Context]`-prefixed log lines:**

- Per `docs/observability.md` and `.agents/rules.md` § Naming Conventions, log output uses `console.error("[{Context}] {Message}", {payload})`. The bkit-audit workflow is an agent workflow (not a Node.js CLI), so `console.error` is inapplicable. The equivalent convention in agent workflows would be fenced log blocks in `status.json` or consistent prefixes in Linear comment sections.
- The design uses `### Step N — {Name}` headers in Linear comments, which is adequate for human readability but not grep-parseable in the same way the `[Context]` prefix convention is.
- For a workflow with no server-side telemetry, this is acceptable — noting it as a minor convention gap rather than a blocker.

**Audit INDEX.md as the longitudinal observability surface:**

- The INDEX.md schema (`FID | Date | Verdict | CRITICAL | HIGH | MEDIUM | LOW | Linear`) is well-specified and append-only. This is the primary operational instrument for "how are audits trending over time?"
- Gap: No pruning or archival policy for INDEX.md is specified. At 10× scale, INDEX.md becomes a large file. The brainstorm-ideate-3 §Premortems notes monthly archival (`docs/audits/{YYYYMM}/`) as a mitigation but the design does not carry this forward as a Close Workflow sub-step or a `docs/pending.md` item.

## On-Call Ergonomics

**Context:** This is a read-only workflow. The `bkit-debug.md` §Failure Path reference confirms "read-only workflow" means no code is changed, so "on-call" here means an operator running or debugging a stuck/failed audit run. There are no pager-style alerts.

**Runbook obviousness (6 months later):**

- The workflow is Linear-bound: any stuck audit has a Linear issue in `In Progress` state. An operator searching Linear for `Audit` label + `In Progress` can find it within seconds. The comment trail shows the last completed step.
- The `status.json` at `$REPO_ROOT/docs/plans/logs/{FID}/status.json` contains `step` + `status` + `parentSha`. An operator running `cat docs/plans/logs/{FID}/status.json` gets the last completed step. Resume semantics ("On start, read status.json — pick up after last DONE step") are inherited from `bkit-debug.md`.
- Gap: The design does not specify the resume path for the bkit-audit workflow explicitly. `bkit-debug.md` caution block says "On start, read status.json — pick up after last DONE step in active IN_PROGRESS workflow." The audit workflow should carry this same instruction, but the design's §Failure Path section (§124–133 of the draft) does not include a "Resume from last DONE step" sub-section. It inherits the general Failure Path ceremony but an operator looking at the audit workflow file specifically may not find explicit resume guidance.

**Recovery action — automatic vs human judgement:**

- Failure Path (crash/timeout): Automatic — lock release + status FAILED + dev push. Human sees `Failed` label in Linear. Recovery = re-run `/bkit-audit`. Idempotent since timestamp-suffix FID is new each run.
- Synthesizer truncation (partial output, CONCERNS verdict): Not automatic. Human must manually inspect `audit-v1-synthesis.md`, compare `{N}/{TOTAL}`, and decide whether to re-run or accept partial synthesis. No explicit runbook for "synthesizer produced partial output but CONCERNS (not FAIL)".
- Smoke-test fail: Informational only. Human judgement required. No runbook.
- Linear MCP fail: Silent continuation. Human judgement only if they notice incomplete comment thread.

**Alert noise — threshold tuning:**

- No automated alerts exist (read-only, no CI gate, no scheduled run in v1). Alert noise is not a concern for v1 manual invocation.
- v2 note: If scheduled audits are added (Brief Open Q 2, deferred), the CONCERNS verdict on every audit of a debt-rich codebase would create a perpetual-amber state. The design does not address what a "PASS-trending" vs "CONCERNS-stable" audit history looks like operationally.

**Slash-command discoverability:**

- `/bkit-audit [optional-target]` is self-explanatory for the bkit-familiar operator. The argument pattern (glob, path, or BAR-NNN) is less obvious — an operator who types `/bkit-audit BAR-199` expecting to audit the feature described by BAR-199 will actually re-audit the issue (reuse the Linear issue), not audit a specific code subset. The design handles this correctly but it may surprise users. No argument help/usage text is specified for the command.
- Six-months-later ergonomics: The `Audit` label definition ("workflow ran/is running, not needs audit") is only in `.agents/workflows.md` § Labels block. An operator searching Linear for "issues needing audit" will use the `Audit` label and find already-completed audits. This is a discoverable confusion point.

## Operational Dependencies

New operational artifacts introduced:

1. **`docs/audits/INDEX.md`** — append-only audit index. Operators use this to find the latest audit verdict without globbing. No dashboard, no alert — human lookup only. Burden: maintenance of the append discipline in Step 7.
2. **`docs/audits/{FID}-audit.md`** — one file per audit run. Accumulates without a pruning policy. No archival schedule specified in the design (brainstorm-ideate-3 mentions monthly archival as a mitigation at 10× scale, but the design does not carry this forward).
3. **`docs/plans/logs/{FID}/` per audit run** — per-lens markdown files + synthesis/prioritize/summary intermediates + status.json + .lock. These are worktree artifacts; the Close Workflow step removes the worktree (`worktree removed` per §Workflow Shape table). The logs under `docs/plans/logs/{FID}/` are committed to dev, not ephemeral. At 10× scale, `docs/plans/logs/` accumulates audit-specific subdirectories alongside design/plan/build subdirectories.
4. **Linear `Audit` phase label** — new label requires creation in the Linear team settings. Not automated. The design notes it as a new label but does not call out "operator must create this label in Linear before first run" as an explicit setup step.
5. **`tests/golden/bar-197-known-debt.finding.md`** — golden findings file. Requires manual maintenance if the probe definitions change. No CI gate checks golden file health (smoke-test only runs under `--smoke-test` flag, not on every CI run).
6. **No new dashboards or pager alerts** — correct for a read-only workflow. The only "alert" is a stale `IN_PROGRESS` status in Linear, which an operator would notice during normal Linear use.

New runbooks implied but not specified:

- "What to do when a lens file is absent after Step 3" — not written.
- "What to do when smoke-test returns FAILED" — not written.
- "How to recover a stuck audit (status IN_PROGRESS, last step >30min ago)" — inherited from general bkit workflow pattern but not audit-specific.

## Verdict Reasoning

The design is operationally sound for a read-only workflow with the bkit suite's established observability model (disk artifacts + Linear comments + status.json). Failure modes are largely covered. The primary gaps are:

1. No explicit post-Step-3 assertion gate before Step 4 — a crashed lens agent produces a silent hole in the synthesis without a gate to catch it at the orchestrator level.
2. No explicit resume path documented in the audit workflow's Failure Path section (inherited from debug but not stated).
3. No runbook for smoke-test FAIL response or synthesizer partial-output CONCERNS response.
4. `docs/audits/` has no pruning/archival policy specified — accumulates indefinitely.
5. Linear MCP failures leave no disk-side trace.

None of these are blocking — the workflow degrades gracefully, the Failure Path is well-specified, and the Linear + status.json trail provides adequate post-mortem material. These are addressable CONCERNS, not FAIL-class gaps.

## CRITICAL

None. No failure mode is undetectable or unrecoverable. The Failure Path ceremony (lock release, status FAILED, dev push, Linear annotation) provides a consistent recovery contract.

## OPTIONAL

1. **Add post-Step-3 lens-file assertion gate** (design-v1-draft.md §Workflow Shape, Step 3 row). Before invoking `@bkit-audit-synthesize`, the orchestrator SHOULD assert: `for slug in architecture hotpath config reliability observability debt dead-code deps security tests docs-drift; do [ -s "docs/plans/logs/{FID}/audit-lens-${slug}.md" ] || echo "MISSING: ${slug}"; done`. Any missing → CONCERNS verdict on Step 3; proceed to synthesize with a `## Missing Lenses` annotation in the synthesizer's input context. This prevents silent holes in the matrix.

2. **Explicit resume path in audit Failure Path** (draft §Failure Path, lines 122–133). Add sub-step: "On re-invocation, read status.json; if `IN_PROGRESS` and last step is DONE, resume from next step. If last step is FAILED, re-execute that step." This mirrors `bkit-debug.md` caution block resume instruction explicitly.

3. **Smoke-test FAIL runbook pointer** (draft §Smoke-Test Acceptance, step 3). Append a triage checklist: "(a) Check that `tests/golden/bar-197-known-debt.finding.md` is present and unparsed; (b) check that the pre-BAR-197 SHA was actually checked out; (c) check that lenses `config`, `hotpath`, `deps` completed without empty output; (d) if all three were present but unmatched — probe regression, update lens charter."

4. **Pruning policy for `docs/audits/`** (draft §Output Document Shape). Add a note: "Monthly archival: at 12+ rows, consider moving rows older than 6 months to `docs/audits/archive/{YYYY}/INDEX.md` and `docs/audits/archive/{YYYY}/{FID}-audit.md`." Add a `docs/pending.md` entry for this. Brainstorm-ideate-3 §Premortems identified this but the design did not carry the mitigation forward into the output artifact.

5. **Linear `Audit` label setup step** (draft §Linear Lifecycle or §Files to Create/Modify/Delete). Add a one-line setup note: "Prerequisite: create the `Audit` label in the Linear team's label settings before first run. The workflow cannot create labels via MCP; `save_issue({ labels: ["Audit"] })` will fail silently if the label does not exist in the team."

6. **Linear MCP failure trace in status.json** (draft §Linear Lifecycle). When a `save_comment` / `save_issue` call fails after retry, append a warning entry to `status.json` (e.g., `{ "step": "step-3-linear-comment", "status": "WARN", "error": "save_comment failed after retry" }`). Provides disk-side audit trail for the gap in the Linear comment history.

7. **Synthesizer partial-output CONCERNS response runbook** (draft §Risks & Open Questions risk 2). The design says `bkit-audit-synthesize` self-reports `{N}/{TOTAL} findings processed`. Add: "If N < TOTAL, the operator SHOULD inspect the per-lens files for truncation markers and consider re-running with a reduced lens set (invoke `@bkit-audit-synthesize` standalone against the subset of complete lens files)."

## OUT OF SCOPE

1. **Server-side telemetry / metrics pipeline** — bkit has no server-side telemetry (`docs/observability.md` §Scope); structured metric counters for audit-run rate, finding severity distributions, or p95 run times are a v2+ concern tied to a broader observability infrastructure decision.
2. **CI alerting on CRITICAL findings** — scheduled audits (Brief Open Q 2) would enable CI gates on CRITICAL count; deferred to v2 per the design.
3. **Cross-repo audit aggregation** — explicitly out of scope per brief §Out of scope.
4. **Pager integration** — read-only workflow with no automated scheduling in v1; no pager path is warranted until v2 scheduled audits exist.
5. **Probe validity CI gate** — automated checking that lens charter probes remain valid against current framework versions requires a test harness that is out of scope for this design.
