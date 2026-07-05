<!-- verdict:start -->

Verdict: PASS

<!-- verdict:end -->

# Debug Failure Diagnosis

## CI Run

N/A (local Build workflow `run-tests` step; no GitHub Actions run referenced in build-input.md).

## Prior Attempts Reviewed

Strategy: STANDARD — first diagnosis attempt for this build-test failure. No prior debug-diagnose artifacts exist. The failures were flagged as out-of-scope by the `challenge-tests` step (see `build-challenge-tests.md` line 34: "Pre-existing failures (out-of-scope, unrelated): templates.test.ts — 4 tests fail due to a CI template change …"), then surfaced by `run-tests` (`failures: 2` in status.json — 2 test files containing 4 failing assertions total).

## Failures

Four assertion failures across two test files, all rooted in a single regression in `.agents/templates/.github/workflows/ci.yml`:

1. `.agents/scripts/templates.test.ts` — `install step carries env: GH_BKIT_TOKEN_INSTALL block` (line 27-29). Expected substring `GH_BKIT_TOKEN_INSTALL: ${{ secrets.GH_BKIT_TOKEN_INSTALL }}` not found in template.
2. `.agents/scripts/templates.test.ts` — `env: GH_BKIT_TOKEN_INSTALL appears under the install step (after pnpm install --frozen-lockfile)` (line 31-41). `envTokenIdx` is `-1` (substring missing) so the comparison fails.
3. `.agents/scripts/templates.test.ts` — `snapshot matches expected template content (regression guard)` (line 52-54). Stored snapshot at `.agents/scripts/__snapshots__/templates.test.ts.snap` lines 26-29 still has the inline `Install Dependencies` step with `env: GH_BKIT_TOKEN_INSTALL: ${{ secrets.GH_BKIT_TOKEN_INSTALL }}`. Current template instead has a `cbartens/bkit/.github/actions/setup-auth@v1` step plus a plain `Install Dependencies` step without an `env:` block.
4. `.agents/scripts/bkit-install.test.ts` — `ci.yml template install step carries env: GH_BKIT_TOKEN_INSTALL for registry auth (BAR-138)` (line 888-901). Same missing substring as failures (1)+(2).

All four are the same upstream defect: the inline `env: GH_BKIT_TOKEN_INSTALL` block under `Install Dependencies` was deleted when sub-plan-4 P4.T8 added the composite action.

## Root Cause

**Proximate cause:** The P4.T8 implementer (commit referenced in `build-plan-execute-4-log.md` Task P4.T8) added `- uses: cbartens/bkit/.github/actions/setup-auth@v1` to `.agents/templates/.github/workflows/ci.yml` and **simultaneously removed the inline `env:` block** that previously sat under the `Install Dependencies` step:

```yaml
- name: Install Dependencies
  run: pnpm install --frozen-lockfile
  env:
    GH_BKIT_TOKEN_INSTALL: ${{ secrets.GH_BKIT_TOKEN_INSTALL }}
```

Current state (lines 32-33 of `.agents/templates/.github/workflows/ci.yml`): the step has no `env:` block; only the `setup-auth@v1` step above declares the token (via `with: token: ${{ secrets.GH_BKIT_TOKEN_INSTALL }}`).

**Plan-level violation (design fragility):** The sub-plan-4 runbook is unambiguous on this point:

- `bar-131-related-bars-suite-plan-4.md` line 99: "the multi-line bash PAT-shim block in seeded `ci.yml` is RETAIN-WITH-REASON (external contract — bash fallback retained for non-Actions CI). Kill-date: v1.1.0."
- Line 113 (Alternative Approaches): "Remove bash PAT-shim block from seeded `ci.yml` | External contract — non-Actions CI consumers rely on it. RETAIN-WITH-REASON kill-date v1.1.0."
- Line 122 (Out of Scope): "Removal of bash PAT-shim block (RETAIN-WITH-REASON kill-date v1.1.0)."
- Line 132 (Supersession Inventory): "Multi-line bash PAT-shim block in seeded `ci.yml` | `setup-auth@v1` action (P4.T8) | **RETAIN-WITH-REASON**".

P4.T8 acceptance criterion was strictly **additive** — add the composite action _alongside_ the existing inline auth, not replace it. The implementer over-cleaned, treating the composite action as a replacement instead of an additional consumer-side affordance. The retained `# RETAIN-WITH-REASON bash fallback: …` comment block (lines 26-27 of current `ci.yml`) is now a dangling reference to a block that has been deleted.

**Contributing factor:** P4.T8 verification ran only `pnpm vitest run .agents/scripts/bkit-action-yaml.test.ts` (the new offline YAML schema parse for the composite action). Neither `templates.test.ts` nor the `bkit-install.test.ts` Task 6.1 block were re-run during P4.T8, so the regression escaped to `run-tests`.

The tests themselves are CORRECT — they encode the BAR-138 + RETAIN-WITH-REASON contract. The template is wrong.

## Recommended Fix

**The template must be restored to include the `env: GH_BKIT_TOKEN_INSTALL` block under `Install Dependencies` while keeping the new `setup-auth@v1` step.** Tests must NOT be relaxed — they enforce the plan's RETAIN-WITH-REASON decision.

Edit `/Users/christian/Documents/GitHub/bkit/.worktrees/bar-131-related-bars-suite/.agents/templates/.github/workflows/ci.yml`. Replace the current `Install Dependencies` step (lines 32-33):

```yaml
- name: Install Dependencies
  run: pnpm install --frozen-lockfile
```

with the original RETAIN-WITH-REASON form:

```yaml
- name: Install Dependencies
  run: pnpm install --frozen-lockfile
  env:
    GH_BKIT_TOKEN_INSTALL: ${{ secrets.GH_BKIT_TOKEN_INSTALL }}
```

This satisfies all four failing assertions in one diff:

- `templates.test.ts` line 28 substring assertion -> passes.
- `templates.test.ts` line 31-41 ordering assertion (`envTokenIdx > installLineIdx` AND `envTokenIdx - installLineIdx <= 3`) -> passes; the `env:` line is line +1 and `GH_BKIT_TOKEN_INSTALL: …` is line +3 from the `pnpm install --frozen-lockfile` line.
- `bkit-install.test.ts` line 888-901 -> passes (same substring + ordering).
- `templates.test.ts` snapshot -> passes; the existing committed snapshot at `.agents/scripts/__snapshots__/templates.test.ts.snap` still includes the inline `env:` block but does NOT include the `setup-auth@v1` block. Therefore the snapshot must ALSO be updated to add the new `setup-auth@v1` step (composite action must remain in the template per P4.T8).

**Snapshot update step:** Delete and regenerate the snapshot, OR edit it manually to match the post-fix template. The recommended approach is to run `pnpm vitest run .agents/scripts/templates.test.ts -u` after the YAML fix lands; this rewrites `.agents/scripts/__snapshots__/templates.test.ts.snap` to match. Verify the regenerated snapshot still asserts:

- presence of `- uses: cbartens/bkit/.github/actions/setup-auth@v1` and its `with: token: ${{ secrets.GH_BKIT_TOKEN_INSTALL }}` block;
- presence of the inline `env: GH_BKIT_TOKEN_INSTALL: ${{ secrets.GH_BKIT_TOKEN_INSTALL }}` block under `pnpm install --frozen-lockfile`;
- both `{{DEFAULT_BRANCH}}` and `{{NODE_VERSION}}` token placeholders.

**Do NOT** modify the test files. `templates.test.ts` lines 27-41 and `bkit-install.test.ts` lines 888-901 directly encode the plan's RETAIN-WITH-REASON contract; relaxing them would silently delete the bash fallback that the plan explicitly preserves until v1.1.0.

**Cleanup nuance:** The current `ci.yml` lines 26-27 contain the comment `# RETAIN-WITH-REASON bash fallback: multi-line PAT-shim kept for / # non-Actions CI consumers. Kill-date: v1.1.0.` immediately above the `setup-auth@v1` step. After restoring the inline `env:` block, this comment is once again a true statement. No further cleanup needed.

## Suggested Tests

No new test code is required — the four existing assertions already encode the contract correctly. However, append the following knowledge entry (suggested for `docs/knowledge.md`) so the next P-level refactor does not repeat the mistake:

> **Helper-action additions to seeded templates are additive, not replacement.** When a sub-plan adds a composite GitHub Action (e.g. `setup-auth@v1`) alongside an existing inline auth pattern that is marked RETAIN-WITH-REASON in Supersession Inventory, the inline pattern MUST be preserved verbatim until its declared kill-date. Verify by re-running `pnpm vitest run .agents/scripts/templates.test.ts .agents/scripts/bkit-install.test.ts` after editing any seeded `.agents/templates/.github/workflows/*.yml` file.

Existing entries to check before appending: scan `docs/knowledge.md` for `RETAIN-WITH-REASON` and `setup-auth` to avoid duplicating prior guidance.

## Verification Commands

Run from the repo root after applying the template fix and snapshot regeneration:

```sh
cd "$(git rev-parse --show-toplevel)/.worktrees/bar-131-related-bars-suite"
pwd  # verify worktree path
pnpm vitest run .agents/scripts/templates.test.ts .agents/scripts/bkit-install.test.ts
pnpm vitest run .agents/scripts/bkit-action-yaml.test.ts  # ensure setup-auth@v1 still parses
pnpm typecheck
pnpm bkit check  # verify template still seeds cleanly
```

Expected outcome: `templates.test.ts` 8/8 passes (including snapshot); `bkit-install.test.ts` Task 6.1 block 4/4 passes; `bkit-action-yaml.test.ts` (P4.T8 offline parse) 100% passes; `pnpm typecheck` clean.
