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
- `build-plan-verify-6-2.md` (attempt 2): `CONCERNS`, 1 gap, TASK 24 (remote-name downloads ignoring `wget -P` / `--directory-prefix` / `curl --output-dir`). `build-plan-gaps-remediate-6-2-log.md` reports it fixed.

## Notes

- Judged against `build-diff-6-3.md` (group diff, committed; the worktree has no uncommitted code changes). `build-brief-6-1.md` and `build-brief-6-2.md` are identical and carry no `Deviations` section. `build-plan-current.md` reports no affected tasks.
- The attempt-2 gap is closed. Probes on the current `.bkit/core/hooks/guardrails-shell.js`: `wget -P /tmp`, `wget -P/tmp`, `wget -q -P /tmp`, `wget -P /tmp/`, `wget --directory-prefix=/tmp`, `curl --output-dir /tmp -O`, `curl --output-dir=/tmp -O` and `curl --output-dir /tmp -o s.py`, each followed by `python3 /tmp/s.py`, give `unknown-script-effect`. Read-only forms stay quiet (`curl … | jq .`, `curl -o out.json … && cat out.json`, `curl -s … -o /dev/null`, `pnpm build && node dist/x.js`, `bun install`, `ls -la`, `git status`).
- TASK 24 not satisfied: one remaining gap in the same `curl` / `wget` option parsing (bundled `-P`, wget `-o` read as the output file, curl bundle with an attached output path), logged below. The planned forms (`cp` / `mv` to a file or a directory, `curl -o`, `wget -O`) work and every TEST FIRST test passes.
- TASK 21, 23 and 25 still satisfied. Re-probed: `mergeManagedJson` on `dist/install/write.js` returns the `NotebookEdit` matcher with both `bkit-gateguard.cjs` and `node scripts/my-check.js`, and a second merge is a no-op; the heredoc-apostrophe commit form names `docs/x.md`; `ruby fix.rb`, `perl fix.pl` and `npx tsx scripts/gen.ts` give `unknown-script-effect`. `write.ts` and `dist/install/write.js` are unchanged since attempt 1.
- TASK 22: owner-accepted by `build-decision-1-8.md` (`Decision: Accept`), not coded, left off `Tasks:` as instructed. The test-first audit's TASK 22 `not-green` gap is accepted by that record, so it is no gap.
- Test-first audit (`build-tests-green-6-3.md`): `Enforced: true`. Unproven: `.bkit/core/engine/audits/hooks/gateguard-cursor.integration.test.ts` "keeps a shell target eligible after an unverified Cursor edit reminder" (task 22; never written, by decision `build-decision-1-8.md`). No `Updated tests`, `Already landed` or `delete-still-referenced` entries.
- Tests run: every test file under `.bkit/core/engine/audits/hooks/` and `.bkit/core/engine/install/` (39 files, 1671 tests, including all five TEST FIRST tests) pass. The four `bkit-guardrails.cjs` mirrors carry the new code, and `.bkit/version` hashes, `DETAILS.md` and `docs/capabilities.md` graph counts were refreshed with it. No new error paths, so `docs/observability.md` adds no logging requirement here.

## Identified Gaps Log

1 gap.

TASK 24: `.bkit/core/hooks/guardrails-shell.js` `evalCommand` `case "curl"` / `case "wget"` — short-option parsing still drops downloaded scripts: (1) a wget bundle that ends in the directory option is not read as `-P` (`wget -qP /tmp https://x.example/s.py && python3 /tmp/s.py`, `wget -nvP /tmp https://x.example/s.py && python3 /tmp/s.py`), so the remote-name file is recorded in the working directory instead of `/tmp/s.py`; (2) for wget, `-o {file}` is the log file (`--output-file`), but the output loop and `hasOut` both read it as the download output, so `wget -q -o /dev/null https://x.example/s.py && python3 s.py` records `/dev/null` and skips the remote-name file `s.py` (`wget --output-file=log.txt …` already works); (3) a curl bundle with the output path attached (`curl -sLo/tmp/x.py https://x.example/s.py && python3 /tmp/x.py`) records nothing. Each returns `{"targets":[],"uncertain":[],"limit":null}` and falls into the `ENOENT && st.commands > 0` quiet branch that the DONE WHEN keeps for files no earlier command named — Fixable: true
