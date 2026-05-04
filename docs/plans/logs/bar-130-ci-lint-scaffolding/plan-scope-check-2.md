Verdict: CONCERNS
Failures: 5

<!-- verdict:end -->

# Plan Scope Check — BAR-130 plan-v2-reviewed.md

## CRITICAL

### C1 — DoD bullet 15 (`package.json` bumped to `0.1.2`; tag pushed) has no complete verification task

**DoD bullet 15:** "package.json bumped to `0.1.2`; tag pushed."

Task 10.1 covers the version bump with `jq -r .version package.json` → `0.1.2`. Task 10.4 acknowledges the tag but explicitly marks it "NOT this plan's responsibility — `bkit-ship`" and states "no agent action here." The tag-push half of DoD bullet 15 is therefore intentionally deferred to the ship workflow with no gate or handoff verification that `bkit-ship` is actually configured for `v0.1.2`. There is no task checking that `bkit-ship` inputs are aligned (Task 10.4's own verification is "no agent action here," which is not a binary pass/fail). The DoD bullet as written requires both actions; the plan only fully verifies one.

**Fix:** Task 10.4 must have a real verification step — at minimum: confirm the `bkit-ship` workflow input file or runbook references `v0.1.2`; or split the DoD bullet so "tag pushed" is explicitly the ship workflow's responsibility and the plan's scope ends at "version bumped."

---

### C2 — DoD bullet 16 (README + `.agents/README.md` documenting three-tier model, module-flag CLI, init deprecation) — `.agents/README.md` update has no measurable acceptance criterion

**DoD bullet 16:** "README + `.agents/README.md` document the three-tier model, the module-flag CLI, and the `init` deprecation."

Tasks 8.1 and 8.2 cover these docs. Task 8.1 has a concrete grep-based criterion (`grep -E '(bkit init|--host=)' README.md` returns only deprecation context; new module-flag examples present). Task 8.2 ("Doc reflects v0.1.2 surface; `bkit init` references reduced to deprecation context") is vague — there is no binary-pass check. Specifically:

- No verification that the `## Three-tier file ownership` section is actually present.
- No verification that the `### What install writes` table contains all seven new template paths.
- The criterion "Doc reflects v0.1.2 surface" is subjective, not binary.

**Fix:** Add a grep or line-count assertion covering at least the three-tier section heading and one representative new template path entry (e.g., `grep -c 'Three-tier file ownership' .agents/README.md` = 1).

---

### C3 — Derived Test Matrix row "`.bkit-version` first-run signal triggers extra logging" has no corresponding runbook task

**Matrix row (line 116):** "`.bkit-version` first-run signal triggers extra logging (BKIT_READ_TOKEN setup, package.json scripts)" — target file `bkit-modules.integration.test.ts`.

Scanning the runbook: Task 4.1 covers `--claude`, `--ci --lint`, `--full`, `--core` implicit, and idempotent second run. Task 4.5 covers `.bkit-version` write-order regression. Neither task mentions testing the first-run signal triggering extra logging (BKIT_READ_TOKEN setup instructions and package.json scripts being emitted to the print-sink on first install but not on second). The test matrix row is orphaned — it maps to no explicit runbook task.

**Fix:** Add a task in Phase 4 (e.g., Task 4.6) with scope (`.bkit-version` absent → first-run logic triggers; `.bkit-version` present → extra logging suppressed), acceptance criterion (assert print-sink contains `BKIT_READ_TOKEN` on first run; assert it does not on idempotent second run), and verification (`pnpm test bkit-modules` green).

---

### C4 — Supersession Inventory: `runHost()` in `bkit-install.ts` is marked DELETE, but no dedicated deletion/cleanup task exists in the runbook

The Supersession Inventory lists `runHost()` in `bkit-install.ts` as DELETE (body migrates to `runClaudeModule`/`runCursorModule` in `bkit-modules.ts`). However, the runbook has no task that:

1. Confirms `runHost` is removed from `bkit-install.ts` (not just shadowed).
2. Verifies with a grep (`grep -n 'runHost' .agents/scripts/bkit-install.ts` → zero hits after migration).

Task 4.2 implements `bkit-modules.ts` and moves the body, but Task 4.3 only mentions "Move `runHost` body verbatim into Claude/Cursor module fns" in the architecture section — not in a runbook task with acceptance criterion. Task 4.4 handles `bkit-init.ts` deletion with an explicit grep check but no equivalent grep is required for `runHost` removal. Per template rules: each DELETE row in the Supersession Inventory MUST be mirrored as a removal task.

**Fix:** Add an explicit acceptance criterion to Task 4.2 or 4.3: `grep -n 'runHost' .agents/scripts/bkit-install.ts` returns zero hits; `pnpm build` succeeds with no dead `runHost` export.

---

### C5 — `printUsage()` DELETE row is in Supersession Inventory but no task verifies old help string is fully removed

The Supersession Inventory lists `printUsage()` mentioning `init` + `--host=` as DELETE, replaced by new help string. Task 3.2 implements `bkit-cli.ts` with `printUsage()`, and Task 3.1h tests "Help output lists modules + compose examples." However no task verifies that the old `printUsage()` definition in `bkit-install.ts` is actually removed after extraction to `bkit-cli.ts`. Task 4.3 says "Refactor `main()`" but does not include an acceptance check confirming old `printUsage` is gone from `bkit-install.ts`.

**Fix:** Add a verification step to Task 4.3: `grep -n 'printUsage' .agents/scripts/bkit-install.ts` → zero hits (all calls now route through `bkit-cli.ts`).

---

## OPTIONAL

### O1 — Phase 6 template tasks lack unit-level test coverage; verification is manual-only

Tasks 6.1–6.6 (adding template files) each have a manual "run `bkit install --X` against tmpdir" verification, but no reference to an automated test in the test matrix or runbook. The Derived Test Matrix rows cover tier-writer behaviour (Tasks 2.3/2.4) and module dispatch (Task 4.1), but do not include a row specifically asserting that each new template file exists in `.agents/templates/` at its expected path and renders correctly after token substitution. A CI failure where a template file is absent would be caught only by a manual smoke step (Task 10.3).

**Mitigation:** Either add a test matrix row for "template inventory: all six template paths exist and parse without error" targeting `bkit-modules.integration.test.ts`, or document the gap explicitly in the plan as accepted risk.

---

### O2 — No task verifies the `pnpm pack --dry-run` check passes in CI (Task 7.1 Reviewer 2 C7 is documentation-only)

Task 7.1 includes a "(no code change)" verification for `pnpm pack --dry-run` confirming `.github/workflows/ci.yml` is excluded from the consumer package. The verification says "document the result in the task acceptance log" — i.e., it is a human-run check, not a CI gate. If a future change accidentally adds `.github/` to `package.json` `"files"`, there is no automated regression. Risk is low but non-zero.

**Mitigation:** Add `pnpm pack --dry-run | grep -v '.github'` as a check step in the CI `ci.yml` job (self-gating) or add it to `Task 10.2`'s pre-PR gate command sequence.

---

### O3 — Edge case "mid-install crash between Tier 1 and Tier 2" is covered by prose + Task 4.5, but the mock-failure assertion path is vague

Task 4.5 states "Assert that if any earlier write throws (mocked failure), `.bkit-version` is NOT written." The acceptance criterion does not specify which earlier write to mock-fail or what the test setup looks like. If the implementer mocks a write that is not actually "between Tier 1 and Tier 2," the test passes trivially without covering the edge case.

**Mitigation:** Specify the exact mock injection point (e.g., mock `fs.writeFileSync` to throw on the second call of `runCoreModule`) so the test is unambiguous.

---

### O4 — Token substitution test (Task 1.3) uses `fs.writeFileSync` mock but the plan does not specify how write-time vs read-time is distinguished in the test

Task 1.3 says "mock `fs.writeFileSync` and assert the written content has resolved tokens, while `.agents/templates/` source still has `{{TOKEN}}` placeholders." This is correct in intent but the test as described relies on the implementer remembering NOT to resolve tokens in the template-read path. There is no negative assertion (i.e., no test asserting that reading a template without calling `applyTokens` still yields raw `{{TOKEN}}`). Without the negative assertion, a "apply-at-read-time" implementation would still pass the test.

**Mitigation:** Add an explicit assertion: `readFileSync(templatePath, 'utf8')` after install still contains `{{TOKEN}}` (raw placeholder unchanged in the template).

---

### O5 — Manual Verification Step 8 (second consumer onboarding, DoD bullet 14) specifies `www-visitfrasercoast-com` as the target but does not define a fallback if that repo is unavailable

Gate 4.5b says "or other" in the gate title but the verification plan Step 8 hardcodes `www-visitfrasercoast-com`. If that repo is not accessible during the build session, the gate is blocking with no documented fallback consumer. This creates an ambiguous block condition.

**Mitigation:** Document the fallback explicitly in Step 8 (e.g., "any second repo that depends on bkit; if `www-visitfrasercoast-com` is unavailable, document the substitute repo name in `second-consumer.md`").

---

## OUT OF SCOPE

### OOS1 — Plan does not cover `claude.yml` / `ci-complete.yml` / `smoke.yml` scaffolding — this is correctly excluded

BAR-130 OOS list explicitly excludes these. The plan's Out of Scope section echoes this. No action needed; confirmed clean.

---

### OOS2 — Helper action `cbartens/bkit/.github/actions/setup-auth@v1` is correctly deferred to BAR-131

Plan references BAR-131 in both the Out of Scope section and `docs/pending.md` append task (Task 9.2). No action needed.

---

### OOS3 — `postflight.sh` and Stop-hook wiring are correctly excluded

Plan explicitly excludes these in the Out of Scope section matching BAR-130 spec. No action needed.

---

### OOS4 — Reusable-workflow distribution (`uses: cbartens/bkit/.github/workflows/gates.yml@v0.1.2`) is out of scope and correctly absent from the plan

No task touches this pattern. Confirmed clean.

---

### OOS5 — `--no-X` / `--force` flags deferred to v0.2 with `docs/pending.md` tracking via Task 9.2

Correctly excluded. The plan routes these to `docs/pending.md` with an explicit Linear issue. No action needed.
