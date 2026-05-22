Verdict: CONCERNS
Failures: 4

<!-- verdict:end -->

# Plan Review

## CRITICAL

**C1 — Human confirmation checkboxes unchecked (Gate 1 blocker)**
Both `👤 Acceptance Scenario confirmed` and `👤 Breaking Changes confirmed` checkboxes at the end of their respective sections are `[ ]` (unchecked). Template rule and plan itself state: "Do NOT pass Gate 1 until this checkbox is `[x]`. Summary must issue `REVISE` if unchecked." This is a hard gate block. The plan cannot be executed until the human reviews and checks both boxes.

**C2 — Acceptance Scenario Narrative deviates from template fallback protocol**
The design doc for BAR-148 is absent (`plan-input.md` is a design-exploration issue, not a `{FID}-design.md` acceptance scenario document). The template mandates: "If `{FID}-design.md` is absent or has no `## Acceptance Scenario` section, replace the inherited Narrative and Success Criteria fields with `⚠️ MISSING: design doc has no Acceptance Scenario — human must provide before plan proceeds`." Instead, the plan labels these sections `_(plan-authored — design doc absent for this FID)_` and populates them with agent-authored content. This is not compliant: the template explicitly forbids fabricating either field when the design doc is absent and requires the fallback string to keep Gate 1 blocked. The current approach bypasses the guard. Either the fallback text must replace the fabricated narrative/success criteria OR the human must explicitly confirm Gate 1 with the understanding that the plan-authored content substitutes for a missing design doc. Without that explicit human confirmation (C1), this is a double block.

**C3 — `timeout-minutes` value inconsistent with documented constraint**
The GHA workflow skeleton sets `timeout-minutes: 350`, but the `bkit-action-yaml.test.ts` test case (Derived Test Matrix / C5) asserts `jobs.route.timeout-minutes ≤ 360`. The plan comment says `# ≤ runner 6h cap; debug × 3 attempts × ~3600s plus margin`, yet 3 × 60 min = 180 min even at generous estimates; 350 min (~5.8h) is well above any reasonable ceiling for `MAX_DEBUG_ATTEMPT = 3`. More critically, the test asserts `≤ 360`, which would pass for 350, but the yaml skeleton hard-codes a value higher than what the architecture justifies. If the value later drifts above 360, the test gates CI but the value could silently grow to the ceiling. The value should be explicitly tied to `MAX_DEBUG_ATTEMPT × per-attempt ceiling + margin` and documented — right now there is no formula, only an inline comment that does not match the Out of Scope statement ("per-step 3600s timeout caps total runtime well under 6h").

**C4 — `bkit install` Tier-3 rollback semantics stated incorrectly**
The Rollback Strategy states: "bkit will not re-create on subsequent `bkit install` runs without the `--ci-router` flag (Tier-3 seed-or-print is idempotent — template not present in canonicalHashes after delete, so `bkit upgrade` no-ops)." This conflates two DE-10/DE-13 behaviours. If the consumer deletes the file, `canonicalHashes` still contains the hash from the original install; `bkit upgrade` would re-seed (not no-op) unless the hash is explicitly removed. The rollback description is misleading and could cause confusion during a real rollback. The plan should accurately describe what actually happens under DE-13: if the consumer deletes the file, `bkit upgrade` will re-seed it (because the canonical hash still exists in `.agents/.bkit-version`), and the correct rollback instruction is to also remove the canonicalHash entry — or to document that `bkit upgrade` will re-create the file.

---

## OPTIONAL

**O1 — `cancelled` conclusion handling is implicit**
Step 5 of the orchestrator skeleton sets `CONCLUSION ∈ success|failure|cancelled` with `cancelled → no-op exit`. The GHA `if:` condition on the job already filters to `conclusion == 'success' || conclusion == 'failure'`, so a `cancelled` conclusion would never reach the job. However, the orchestrator `.md` still includes a `cancelled` branch. This is harmless but adds dead code to the orchestrator. Removing the `cancelled` branch from the orchestrator's dispatch logic would keep the `.md` clean and consistent with the GHA filter.

**O2 — FID resolution strategy in Start Workflow step is under-specified**
Step 1 of the orchestrator skeleton says "parse `{FID}` slug from `docs/plans/logs/` (single `IN_PROGRESS` or last `DONE` entry on `BRANCH`)." This is ambiguous when multiple IN_PROGRESS entries exist on a branch (e.g., a debug run did not clean up). The concrete example resolves `{FID}` via `docs/plans/logs/bar-260-foo-bar/status.json` which implies a 1:1 branch-to-FID mapping, but the branch name alone is the FID slug — the plan should clarify that the router derives `{FID}` from the branch name itself (`feat/{FID}` → slug after `feat/`), not from scanning `docs/plans/logs/` directory. This avoids the ambiguity entirely and matches the branch naming convention.

**O3 — Secret advisory `bkit-ci-router-secret-missing` is best-effort with no clear fallback**
The installer module is specified to emit an advisory if `ANTHROPIC_API_KEY` cannot be detected via `gh secret list`. The qualifier "best-effort — `gh secret list` for repos where consumer has gh CLI auth; otherwise emit advisory unconditionally" means the advisory fires on every install where the consumer lacks `gh` auth, creating noise. Consider making the advisory always-print (unconditional) rather than attempting gh CLI detection, aligning with how other secrets are documented. This avoids a noisy false-positive in CI environments where `gh` is not authenticated.

**O4 — Derived Test Matrix row for `release-workflow.test.ts` target file is vague**
Row 8 of the Derived Test Matrix targets `.agents/scripts/release-workflow.test.ts` with description "Router orchestrator (`bkit-ci-router.md`) authoring conventions pass `bkit check`" but notes `(or new check)`. The parenthetical indicates the implementor may need to create a new test file, which is not reflected in the Runbook (C7 says "add … check for `bkit-ci-router.md`" to the existing file). If the existing file cannot host this check, a new test file must be declared explicitly — both in the Derived Test Matrix and in the Architecture section.

**O5 — `docs/architecture.md` is not in the Documentation Updates table**
The plan adds a new GHA-resident orchestrator and a new installer module, both of which represent architectural changes (new component boundary, new trigger surface). `.agents/docs.md` Workflow Matrix marks `docs/architecture.md` as `●` (always read) for Build phase. The Documentation Updates table does not include `docs/architecture.md`. If this file documents the bkit component topology, it should be updated, or explicitly noted as not applicable with rationale.

**O6 — `cbartens/bkit/.github/actions/setup-auth@v1` reference in template**
The plan states the consumer template is byte-identical to the bkit-repo workflow. However, `cbartens/bkit/.github/actions/setup-auth@v1` is a bkit-repo-internal action reference. Consumer repos would reference the same action (they depend on bkit), so this is likely intentional — but the plan does not explicitly confirm that this action is publicly accessible from consumer repos. A sentence confirming that `setup-auth` is a composite action in the public bkit repo (not bkit-repo-only) would close this gap.

---

## OUT OF SCOPE

**S1 — Per-PR opt-in alternative to per-issue `bkit:auto-route` label**
The plan correctly defers this to `docs/pending.md`. No action needed in this plan.

**S2 — Dead-letter queue / exponential backoff retry for `claude-code-action` crash**
Correctly deferred to Out of Scope. The failure surfaces in the GHA run log and Linear comment, which is sufficient for v1.

**S3 — Runner 6h ceiling enforcement beyond `MAX_DEBUG_ATTEMPT` + per-step timeout**
Correctly scoped out. The existing `MAX_DEBUG_ATTEMPT = 3` bound keeps total runtime well under the ceiling for observed runs.

**S4 — Step 18 in `bkit-build` (chained orchestrator)**
Correctly deferred pending context-window budget growth. No action in this plan.
