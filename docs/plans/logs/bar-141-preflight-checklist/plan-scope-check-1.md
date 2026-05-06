Verdict: CONCERNS
Failures: 4

<!-- verdict:end -->

# Plan Scope Check

Plan reviewed: `docs/plans/logs/bar-141-preflight-checklist/plan-v2-reviewed.md`. Template structural compliance verified against `docs/plans/template.md` — all mandated sections present (Context & Goals, Acceptance Scenario block with Narrative / Success Criteria / Concrete Example / Edge Cases / Derived Test Matrix / Human Confirmation, Breaking Changes & Naming Review, Alternative Approaches, Out of Scope, Merge Method, Supersession Inventory with 4 DELETE rows, Security & Privacy, Pre-Flight / Dependencies with Gate 1, Data Schema Integration, Architecture & Component Changes, Documentation Updates, Rollback Strategy, Agent Execution Runbook with Gates 2/3, Verification Plan with Gate 4 and Manual Verification).

Supersession Inventory mirroring verified: every DELETE row is mirrored in Architecture & Component Changes (`[MODIFY]` sections of `bkit-modules.ts`, `bkit-tiers.ts`, `bkit-install.ts`) AND has corresponding removal tasks in the runbook (Tasks B1, B2, B3, B4, E1, E4, G1, G2). No `RETAIN-WITH-REASON` rows; no `@deprecated`-and-still-exported anti-patterns.

Scope item ↔ build/verify pairing: every `[NEW]` and `[MODIFY]` file in Architecture & Component Changes has both a build task (Phase A–G) and a verification task (`tsc --noEmit`, unit tests Phase C–F, integration tests Phase G3, plus Verification Plan Manual Steps 1–5).

## CRITICAL

1. **Derived Test Matrix row 17 (`formatChecklist` snapshot test) has no dedicated runbook task.** The matrix lists "Output formatter renders `--- i/N [severity] id ---\nDETECT: ...\nACTION: ...` shape per issue body | Unit (Vitest) | `.agents/scripts/bkit-postinstall.test.ts`". Task A2 creates the `formatChecklist` renderer stub but no Phase B–G task writes the snapshot test. The Verification Plan mentions the snapshot only loosely under Manual Verification Step 5 (byte-for-byte match) and inside Gate-3 boilerplate ("All listed in Phase C–G above"), but Phase C–G contains no explicit `formatChecklist` snapshot task. Fix: add a runbook task (e.g., `Task F5: Write formatChecklist snapshot test against issue-body fixture in bkit-postinstall.test.ts`) so the matrix row maps 1:1 to a runbook task per template requirement.

2. **Edge case "Same finding id appears more than once within a single phase → Deduplicated within phase" has no Derived Test Matrix row and no runbook task.** This behavior is specified in Edge Cases but `runPreflight` and `runPostInstallCheck` only describe cross-phase dedupe (Phase 3 wins). No detector or wiring task implements within-phase dedupe; no test asserts it. Fix: either remove the within-phase dedupe row from Edge Cases (and document modules-must-not-double-report as the contract), or add (a) a Derived Test Matrix row, (b) implementation in `runPreflight`/`runPostInstallCheck` (Tasks C4 and F4), and (c) a unit test.

3. **Edge case "Zero advisories overall → No checklist banner printed (only `Done. N write(s).`)" has no Derived Test Matrix row and no runbook task.** This is a Success Criterion (#2 in suggested narrative) and a stated edge case. `formatChecklist` behavior on empty `findings` is unspecified — does it return `""` (empty string) and the caller skips `console.log`, or does the caller guard `if (findings.length > 0)`? The contract is undefined in plan. Fix: specify in `bkit-postinstall.ts` exports section that `formatChecklist([])` returns `""`, OR add caller-side `if (findings.length > 0) console.log(...)` guards in Tasks G1 + dry-run branch, AND add a Derived Test Matrix row + unit test asserting zero-advisory silence.

4. **Edge case "Phase 1 advisories present in `bkit check` (dry-run) → still rendered via `formatChecklist(ctx.advisories)`" has no Derived Test Matrix row.** Tasks G1 and Manual Verification Step 4 cover the wiring/observation, but no automated test row asserts that `bkit check` dry-run preserves Phase 1 advisory rendering parity with the legacy `printSink` dump. Without an automated test, regressing this behavior cannot be caught in CI. Fix: add a Derived Test Matrix integration row (e.g., "Integration: `bkit check` dry-run on advisory-triggering scratch consumer renders Phase 1 advisories via formatChecklist; Phase 3 detectors NOT invoked") and a corresponding sub-task under G3.

## OPTIONAL

1. **Task B3 wording is loose for the `tier3-merge-suggested-{dst-basename}` migration.** B3 says "replace `printSink: string[]` parameter on `writeTier3`" and "Update callers in `bkit-modules.ts`", but does not enumerate "Each `printSink.push` site in `writeTier3` becomes `advisories.push({ id: 'tier3-merge-suggested-' + path.basename(dst), severity: 'advisory', detect, action })`". Architecture & Component Changes does state this for `bkit-tiers.ts`, but the runbook task would benefit from spelling it out so a future agent does not skip migrating individual push sites.

2. **`detectNpmrcAuth` "unknown when `.npmrc` absent" semantics have no test row.** Architecture specifies `unknown` produces no finding (silent skip), but the Derived Test Matrix row 10 only covers "when `.npmrc` lacks both required lines". Task E3 lists "file-absent" as a sub-case — good — but the matrix row doesn't reflect that the absent-file path is silent (no advisory emitted). Adding "and silent when .npmrc absent" to row 10 would tighten the test contract.

3. **`detectVercelEnv` "skip silently when no Vercel project" — no test row asserts the silent path.** Edge Cases mention `vercel env ls` errors return `unknown` → silent skip. Task E4 says "skip if no Vercel project" but the test row only covers "three cases each" for missing/present/unknown. Consider adding an explicit "no `vercel.json` → both detectors skipped (no findings emitted)" assertion to test row 12.

4. **Pre-Flight Core checklist items are all `[ ]` unchecked.** Plan has not yet been executed; this is acceptable but Gate 1 instructions read "Verify and check `[x]` all applicable boxes" — the agent running Build phase must mark these. Not a CRITICAL gap (plan structure is sound); just a reminder for the Build agent.

5. **`detectBkitVersionMajorDowngrade` parsing edge cases.** Plan describes parsing `MAJOR.MINOR.PATCH`, but `.bkit-version` corrupt/non-semver content (e.g., empty file, "dev", whitespace) is not specified. Default behavior should be "no finding emitted on parse failure" (don't false-positive on bad version files). Worth a brief note in `runPreflight` semantics.

6. **`detectCiYmlMissingTokenEnv` YAML-grep brittleness.** Plan acknowledges "Returns null if no ci.yml or step structure unrecognised (no false positives on bespoke layouts)" — good. Consider documenting which structural shapes are recognized (e.g., "step name matches /^Install/i AND `run` contains `pnpm install`") so the implementation has a concrete acceptance bar rather than a free-form pattern match.

## OUT OF SCOPE

1. **`bkit doctor` standalone health-check verb** — already noted in the plan's "Future phase recommendations" section. Stays out of this plan.

2. **`PreflightFinding` reuse in BAR-139 (`bkit uninstall`)** — already flagged as a future-phase opportunity; correct to defer.

3. **A `--strict` flag promoting advisories to blockers** — explicitly listed in Out of Scope. Confirmed not in plan.

4. **Telemetry / advisory snoozing / per-finding opt-out** — explicitly out of scope. Confirmed.

5. **JSON-schema export for `PreflightFinding`** — could help downstream tooling consume the structured shape programmatically (vs scraping the rendered banner). Out of scope for this plan; potential follow-up if AI-agent integrations grow.

