Verdict: CONCERNS
Failures: 2
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

None

## Notes

- Judged against the group diff (`build-diff-6-1.md`, tests only) plus the uncommitted code changes in `.bkit/core/engine/install/write.ts`, `dist/install/write.js`, `.bkit/core/hooks/guardrails-shell.js`, its four `bkit-guardrails.cjs` mirrors and `.bkit/version`. `build-brief-6-1.md` and `build-brief-6-2.md` are identical and carry no `Deviations` section.
- TASK 21 satisfied: `mergeManagedList` carries consumer hook entries out of a replaced bkit group into the matching template group. Probe on the rebuilt `dist/install/write.js` returns the `NotebookEdit` matcher with both `bkit-gateguard.cjs` and `node scripts/my-check.js`; a second merge is a no-op; the template object is not mutated; separate consumer groups are still kept. Both TEST FIRST tests pass.
- TASK 23 satisfied: `matchParen` skips heredoc bodies (`<<` and `<<-`). Probe `git commit -m "$(cat <<'EOF'\nFix: don't break\nEOF\n)" && sed -i s/a/b/ docs/x.md` now returns `["docs/x.md"]`. An unterminated heredoc inside `$( … )` still swallows the rest of the line; bash also reads that rest as heredoc body, so this is no gap.
- TASK 25 satisfied: `ruby fix.rb`, `perl fix.pl`, `ruby -w fix.rb`, `npx tsx scripts/gen.ts`, `pnpm exec tsx gen.ts`, `pnpm tsx gen.ts`, `yarn ts-node gen.ts`, `bun run gen.ts`, `deno run -A gen.ts`, `./x.ts` and `./x.rb` all return `unknown-script-effect`; `perl -e`, `ruby --version`, `bun install`, `npx prettier …` and `pnpm build && node dist/x.js` stay quiet.
- TASK 24 not satisfied: the planned forms (`cp` / `mv` to a named file, `curl -o` / `--output=`, `wget -O`) work and the TEST FIRST test passes, but the two gaps below leave common producer forms silent.
- TASK 22: owner-accepted by `build-decision-1-8.md` (`Decision: Accept`), not coded, left off `Tasks:` as instructed. The test-first audit's TASK 22 `not-green` gap is accepted by that record, so it is no gap.
- Test-first audit (`build-tests-green-6-1.md`): `Enforced: true`. Unproven: `.bkit/core/engine/audits/hooks/gateguard-cursor.integration.test.ts` "keeps a shell target eligible after an unverified Cursor edit reminder" (task 22; never written, by decision `build-decision-1-8.md`). No `Updated tests`, `Already landed` or `delete-still-referenced` entries.
- Tests run: the three TEST FIRST files (300 tests) and every test file under `.bkit/core/engine/audits/hooks/` and `.bkit/core/engine/install/` (39 files, 1670 tests) pass. No diagnostics on `write.ts`. `build-plan-current.md` reports no affected tasks. No new error paths, so `docs/observability.md` adds no logging requirement here.

## Identified Gaps Log

2 gaps.

TASK 24: `.bkit/core/hooks/guardrails-shell.js` `evalCommand` `case "curl"` / `case "wget"` — download producers written in their usual forms are not recorded in `st.produced`: combined short-option bundles (`curl -fsSLo /tmp/s.py https://x.example/s.py && python3 /tmp/s.py`, `wget -qO /tmp/w.py https://x.example/s.py && python3 /tmp/w.py`) and remote-name downloads (`curl -O https://x.example/s.py && python3 s.py`, bare `wget https://x.example/s.py && python3 s.py`) each return `{"targets":[],"uncertain":[],"limit":null}`, so the run falls into the `ENOENT && st.commands > 0` quiet branch the DONE WHEN restricts to files no earlier command named — Fixable: true
TASK 24: `.bkit/core/hooks/guardrails-shell.js` `markCopied` — a `cp` / `mv` into a directory destination records the directory, not the file it creates: `cp template.py /tmp/ && python3 /tmp/template.py` (where `template.py` writes `docs/x.md`) returns `{"targets":[],"uncertain":[],"limit":null}`, while `cp template.py /tmp/run.py && python3 /tmp/run.py` names `docs/x.md`; a trailing-`/` or existing-directory destination needs `{dest}/{basename(source)}` recorded per source — Fixable: true
