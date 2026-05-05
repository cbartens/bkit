Verdict: CONCERNS
Failures: 2

<!-- verdict:end -->

# Plan Scope Check

## CRITICAL

**GAP 1 — Matrix row 1 has no test task (broken matrix↔runbook mapping).**

Derived Test Matrix row 1 reads:

> `package.json` manifest fields render correctly: `private:false`, `publishConfig.registry`, `publishConfig.access`, bare HTTPS `repository.url`, refreshed `description`. Type: Unit (Vitest). Target: `.agents/scripts/bkit-modules.test.ts` (extend) or new `.agents/scripts/package-manifest.test.ts`

No runbook task creates or extends a Vitest test for `package.json` manifest fields. Task A2 edits the manifest and its verification is a `node -e` one-liner plus a `git diff` inspection — not a persisted automated test. Task C1 covers print constants only. The matrix row is unmatched by any Phase C test task. This means the staleness or misconfiguration of `publishConfig`, `private`, or `repository.url` is not caught by `pnpm test`.

**Fix required:** Add a runbook task (e.g. `Task C0`) that extends a Vitest test file to assert the four manifest-field invariants, and update Gate 2's "Verify test coverage against Derived Test Matrix" checklist item to include this task.

---

**GAP 2 — Matrix row 2 has no test task (broken matrix↔runbook mapping).**

Derived Test Matrix row 2 reads:

> `release.yml` triggers on tag-push (`v*`) and contains: setup-node 20 + registry-url + scope, full check suite, `npm publish` with `NODE_AUTH_TOKEN: GITHUB_TOKEN`, `permissions: packages: write`. Type: Schema/lint (yamllint + structural assertion). Target: `.agents/scripts/release-workflow.test.ts` (new)

No runbook task creates `.agents/scripts/release-workflow.test.ts`. Task A3 verifies `release.yml` via `yamllint` and a visual diff at execution time, which is manual and ephemeral. The matrix explicitly names an automated structural-assertion test file that the runbook never instantiates. Without it, a future edit that drops a required step or permission from `release.yml` goes undetected by `pnpm test`.

**Fix required:** Add a runbook task (e.g. `Task C2.5` or rename existing `C2` to cover both templates) that creates `.agents/scripts/release-workflow.test.ts` with Vitest structural assertions, and update Gate 2 accordingly.

## OPTIONAL

1. **`CI_YML_MERGE_INSTRUCTIONS` missing from Derived Test Matrix.** Task C1 asserts substrings in `CI_YML_MERGE_INSTRUCTIONS` but no matrix row lists this constant. The test exists but is orphaned from the matrix, making the matrix incomplete as a coverage reference. Adding a row for this constant would make the matrix↔runbook bidirectional mapping fully clean.

2. **Tag-push timing gotcha documented in Task A4 but no automated guard.** The race between branch-index and tag-fire is well described; the recovery steps are clear. A `gh run list` poll loop (even a manual one scripted in the runbook) would make the recovery less error-prone than a 30-second eyeball.

3. **`tmp/bar-138-smoke/` git-ignore assertion is in Task C3 scope but never formally verified.** Task C3 says "verify against `.gitignore`" but no acceptance criterion captures the actual `grep` result. If `tmp/` is not in `.gitignore`, the scratch repo's `node_modules` and lockfile could accidentally be staged during Task B14's commit. Low probability but worth an explicit `grep -F 'tmp/' .gitignore` assertion in C3's Acceptance line.

4. **`docs/pending.md` consumer list may be incomplete.** Task B11 says "Add others if discovered during build" with no discovery mechanism specified. No grep or `gh repo list` step is mandated to find undiscovered consumers before closing B11.

5. **ADR `DE-3` append boundary.** Task B10 instructs appending below the `<!-- bkit:end -->` boundary. If the boundary comment does not exist, the agent will append in an unspecified location. The acceptance criterion (`grep -F '## DE-3:'`) passes regardless of placement. Consider adding a guard: `grep -F '<!-- bkit:end -->' docs/decisions.md` exits 0 before append.

## OUT OF SCOPE

1. Per-consumer migration plans (`app-gether-life`, `www-visitfrasercoast-com`) — correctly deferred to follow-up PRs; tracked via `docs/pending.md` entries added in B11.

2. Node 22 upgrade for `ci.yml` and `release.yml` — explicitly excluded in Out of Scope section; any future bump requires lock-step `dist/` regeneration.

3. `workflow_run` enforcement gating `release.yml` on prior `ci.yml` pass — rejected in design; `release.yml` re-runs the full suite inline.

4. `npm deprecate` runbook for bad-version retraction — referenced in Rollback Strategy but not built into this plan; appropriate as a future-phase note only.
