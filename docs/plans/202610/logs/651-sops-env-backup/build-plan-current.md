Verdict: CONCERNS
Affected: 3

<!-- verdict:end -->

# Plan Currency

## Affected Tasks

1. **Task 11: Documentation + ledger rows** — class `Reword`.
   - Landed change: `docs/testing.md:367` gained 8 lines (`**Local runners never touch env files**` paragraph + 5 bullets), commit `96a1fc3c docs(testing): local runners export keys and never touch env files`. Every line after `:367` shifted +8.
   - Stale cites the task executes via `Documentation Updates` row `docs/testing.md`: § Key test files `:550` → now `:558` (dev `:550` is blank); `missing-tool helper ... (:682 paragraph)` → now `:690` (dev `:682` is an unrelated opencode list item); § CI execution `:722` → now `:730`. Same `:682` cite in Pre-Flight `Testing & Quality` (`requireTsx()` pattern). Unaffected: `docs/testing.md:139`, `:143` (before `:367`); `.bkit/core/.bkit/templates.md` cites `:33`, `:69`, `:82-86`, `:202`, `:552`, `:593` (dev hunks at `:204`, `:502`, `:604-606` are 1-for-1 line replacements, no shift); no `651-` keys yet in `docs/decisions.jsonl` / `docs/deferrals.jsonl` on dev.
   - Plan re-run must resolve: re-point the `docs/testing.md` line cites to `:558`, `:690`, `:730` (or anchor on section names only).
2. **Task 12: CHANGELOG, mirror refresh, full suite, dogfood, final check** — class `Reword`.
   - Landed change: same `docs/testing.md` +8 shift, commit `96a1fc3c docs(testing): local runners export keys and never touch env files`.
   - Stale cite in `Done when`: `docs/testing.md:464` scratch-consumer shape → now `:472` (dev `:464` is blank; `2. **Smoke spawn** — bkit install --claude --cursor on scratch consumer` sits at `:472`). Unaffected: `CHANGELOG.md` `[Unreleased]` gained a `### Breaking Changes` subsection (commit `faf16cf1 feat(trackers)!: the GitHub board is bkit.github.project, the board URL`), but that heading already existed 6x at base, so the plan's "Changed" placement is a plan-time choice, not a landed contract change; `package.json` change is `bkit.githubProject` → `bkit.github.project` only; `dist/checks/tips/index.js` change is bold star / silence text only (`tips --all` untouched).
   - Plan re-run must resolve: re-point `docs/testing.md:464` to `:472`.
3. **Task 10: Shipped rule carve-out (Q7)** — class `Reword`.
   - Landed change: `.bkit/core/.agents/rules.md:16` gained a header bullet (`Where project services live ... → Project Settings`) plus a trailing `## Project Settings` section, commit `7825b3ee docs(rules): a Project Settings section says where the project's services live`. The `**Secrets:**` rule text is unchanged but moved `:93` → `:94`; the `.agents/rules.md` mirror got the same additions (outside any change to the Secrets line).
   - Stale cites: Task 10 `.bkit/core/.agents/rules.md:93`; same `:93` in Q7 and Architecture § Shipped rule. Approach (edit source inside the managed block, `upgrade` to mirror, `rules-sync.test.ts` byte-compare) holds.
   - Plan re-run must resolve: re-point `.bkit/core/.agents/rules.md:93` to `:94` in Task 10, Q7 and Architecture § Shipped rule.

Tasks 1-9: no in-scope path changed; every in-scope needle (`hasTool`, `requireTsx`, `vitest.tsx-bin`, `bkit-tests-integration`, `VALE_SHA256`, `globToRegExp`, `AGE_PUBLIC_KEY`, `NPM_STRIP_REMAP`, `post-commit`, `hooksPath`, `bkit:gate:format`, `# disk prune`, `allow-missing`, `compareExample`, `exampleRel`, `bkit-secrets`, `check-ignore`, `SETUP_TIPS`, `isCloudOrCi`, `bkit-trivy`, `sops`, `env-backup`) hit only this plan, its plan-phase logs, or plan-phase ledger rows for `651-sops-env-backup` (`.bkit/friction.jsonl`, `.bkit/issues.jsonl`, `docs/failures.jsonl` `plan-update-stub-keeps-prior-verdict-header`, `docs/roadmap.md`). Task 9 path matches (`.bkit/core/.bkit/templates.md`, `.bkit/wording.md`, `dist/`) checked: Executable. New `docs/testing.md` rule "Local runners never touch env files" is doc text only (no guard test landed); `restore`'s create-only `wx` write does not conflict.
