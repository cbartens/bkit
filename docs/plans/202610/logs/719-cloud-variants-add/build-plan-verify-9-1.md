Verdict: CONCERNS
Failures: 1
Fixable: true
Tasks: none
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Group 9

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

- Mode `Group`, one task (TASK 18, `TEST FIRST: n/a`). The group diff (`build-diff-9-1.md`) is empty outside `docs/plans/**`: the mirrors and `dist/` had already landed in groups 1-8, so TASK 18 is judged on the current tree.
- Test-first audit (`build-tests-green-9-1.md`): `Enforced: true`, `Gaps: 0`, `Unproven: 0`; no `Updated tests` or `Already landed` sections, so nothing to decide.
- Decision records `build-decision-1-1.md`, `1-2.md`, `1-3.md` (group 1) and `2-1.md` (group 3) do not cover group 9.
- Checked independently on the tree:
  - `git grep -n -e OPENCODE_PROVIDER_KEY -e 'secrets\.ANTHROPIC_API_KEY' -- docs/security.md` prints nothing (exit 1).
  - `node dist/cli.js check` exits 0, reports `0 write(s) would occur` and raises no drift finding (13 advisories, 0 blockers).
  - `.bkit/{providers,cloud,templates,install,README}.md`, `.bkit/.env.example` and the `docs/security.md` managed block match their `.bkit/core/.bkit/` / `.bkit/shared/` sources except for the rendered `bkit:managed` marker line.
  - The managed blocks of `.claude/hooks/bkit-preflight.sh` and `.cursor/hooks/bkit-preflight.sh` match their sources, with `preflight-rules.sh` and `preflight-tracker.sh` inlined. The headers outside the markers are stale (see the gap).
  - `dist/` is current: every branch commit that touches non-test `.bkit/core/engine/**/*.ts` also touches `dist/`; no engine source is newer than `dist/cli.js`; `dist/install/manifest.js` `CLOUD_MODES` includes `codex`; `dist/checks/after/auth.js` carries `cloud-router-secret-renamed`; `dist/commands/install/install.js` carries the wired-tracker refusal.
- Taken from the build log without re-running, because they are slow: `pnpm vitest run` (229 files, 9215 passed, 2 skipped); the packed-consumer dogfood (`--tracker=jira --codex --auto=codex` exit 0 recording `codex`; `--auto=claude` with tracker `none` exit 1 naming `--tracker=`; stub `gh` consumer raises `cloud-router-secret-renamed`).
- TASK 18's DONE WHEN conditions hold. It stays off `Tasks` because its UPDATE work on the two preflight hook mirrors is incomplete: the headers are stale and no gate catches them (one gap, `Fixable: true`).

## Identified Gaps Log

1 gap.

- TASK 18: `.claude/hooks/bkit-preflight.sh` and `.cursor/hooks/bkit-preflight.sh` — the header comment outside `bkit:start` / `bkit:end` (lines 1-20 / 1-18) was not hand-synced from `.bkit/core/.claude/hooks/bkit-preflight.sh` / `.bkit/core/.cursor/hooks/bkit-preflight.sh`; it still says "Validates Linear issue state", "Trigger: LINEAR_ISSUE_ID env var present" (Claude), "issue state not in {Cancelled, Done}", "See `.bkit/README.md` § Linear setup" and names the deleted `hooks/preflight-linear.sh`. The task's UPDATE field made the sync conditional on "the parity test", but no parity test covers the preflight hooks (the T6 parity test in `guardrails-cursor.integration.test.ts` covers the guardrails hooks only), so the stale header passes every gate. Fix: copy each source header (everything above `# <!-- bkit:start -->`) into the installed copy, leaving the managed block untouched — Fixable: true
