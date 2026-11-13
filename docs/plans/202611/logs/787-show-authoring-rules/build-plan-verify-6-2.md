Verdict: CONCERNS
Failures: 1
Fixable: true
Tasks: 21, 23, 25
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Group 6

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

- `build-plan-verify-6-1.md` (attempt 1): `CONCERNS`, 2 gaps, both TASK 24 (curl / wget option bundles and remote-name downloads; `cp` / `mv` into a directory). `build-plan-gaps-remediate-6-1-log.md` reports both fixed.

## Notes

- Judged against `build-diff-6-2.md` (group diff, committed; worktree has no uncommitted code changes). `build-brief-6-1.md` and `build-brief-6-2.md` are identical and carry no `Deviations` section. `build-plan-current.md` reports no affected tasks.
- Both attempt-1 TASK 24 gaps are closed. Probes on the current `.bkit/core/hooks/guardrails-shell.js`: `cp template.py /tmp/ && python3 /tmp/template.py`, `mv template.py /tmp/ && …` and `cp template.py docs && python3 docs/template.py` name `docs/x.md`; `curl -fsSLo`, `wget -qO`, `curl -O`, `curl -sSLO`, bare `wget`, `curl --output[=]`, `wget -O` and `wget --output-document=` each give `unknown-script-effect`. Read-only forms stay quiet (`curl … | jq .`, `curl -o out.json … && cat out.json`, `curl -s … -o /dev/null`, `pnpm build && node dist/x.js`, `bun install`).
- TASK 24 not satisfied: one remaining gap (remote-name downloads with a directory option), logged below.
- TASK 21, 23 and 25 still satisfied (re-probed: heredoc-apostrophe commit form names `docs/x.md`; `ruby fix.rb`, `perl fix.pl`, `npx tsx scripts/gen.ts` give `unknown-script-effect`). `.bkit/core/engine/install/write.ts` and `dist/install/write.js` are unchanged since attempt 1.
- TASK 22: owner-accepted by `build-decision-1-8.md` (`Decision: Accept`), not coded, left off `Tasks:` as instructed. The test-first audit's TASK 22 `not-green` gap is accepted by that record, so it is no gap.
- Test-first audit (`build-tests-green-6-2.md`): `Enforced: true`. Unproven: `.bkit/core/engine/audits/hooks/gateguard-cursor.integration.test.ts` "keeps a shell target eligible after an unverified Cursor edit reminder" (task 22; never written, by decision `build-decision-1-8.md`). No `Updated tests`, `Already landed` or `delete-still-referenced` entries.
- Tests run: every test file under `.bkit/core/engine/audits/hooks/` and `.bkit/core/engine/install/` (39 files, 1671 tests, including all five TEST FIRST tests and the remediation's added `flags a script produced by a directory copy or a bundled or remote-name download`) pass. The four `bkit-guardrails.cjs` mirrors carry the new code. No new error paths, so `docs/observability.md` adds no logging requirement here.

## Identified Gaps Log

1 gap.

TASK 24: `.bkit/core/hooks/guardrails-shell.js` `evalCommand` `case "curl"` / `case "wget"` — a remote-name download sent to another directory records the wrong produced path: the remote-name branch always records the URL's last segment in the working directory and ignores `wget -P {dir}` / `--directory-prefix={dir}` and `curl --output-dir {dir}`, so `wget -P /tmp https://x.example/s.py && python3 /tmp/s.py`, `wget --directory-prefix=/tmp https://x.example/s.py && python3 /tmp/s.py` and `curl --output-dir /tmp -O https://x.example/s.py && python3 /tmp/s.py` each return `{"targets":[],"uncertain":[],"limit":null}` and fall into the `ENOENT && st.commands > 0` quiet branch the DONE WHEN restricts to files no earlier command named; record `{dir}/{segment}` when a directory option is present (or `unresolved-target` when it is not literal) — Fixable: true
