Verdict: CONCERNS
Failures: 4
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
- `build-plan-verify-6-3.md` (attempt 3): `CONCERNS`, 1 gap, TASK 24 (bundled wget `-P`, wget `-o` read as output, curl bundle with attached output path). `build-plan-gaps-remediate-6-3-log.md` reports it fixed by one option reader, `readFetchOptions`.

## Notes

- Judged against `build-diff-6-4.md` (group diff, committed; the worktree has no uncommitted code changes). `build-brief-6-1.md` and `build-brief-6-2.md` are identical and carry no `Deviations` section. `build-plan-current.md` reports no affected tasks.
- The attempt-3 gap is closed: `wget -qP /tmp`, `wget -nvP /tmp`, `wget -o /tmp/log`, `wget --output-file /tmp/log`, `wget -a /tmp/log` and `curl -sLo/tmp/…` forms all give `unknown-script-effect`.
- Broad `readFetchOptions` probe (about 150 curl / wget commands, run in-process against `shellEditTargets` the way the test's evidence seam loads it). These all work: `-o` / `-O` / `--output` / `--output-document` with separate, attached or `=` values; bundles (`-so`, `-fsSLo`, `-sSfLo … --retry 3`, `-qO`, `-nvO`, `-ncO`); options after the URL; several `-o` pairs; `-O` / `-LO` / `-OL` / `--remote-name` / `--remote-name-all`; query strings for curl; `--url`; value options before `-O` (`-H`, `-A`, `--retry`, `--retry-delay`, `--cacert`, `--limit-rate`, `-t`, `-U`, `--header`, `--level`, `--tries=`); `-P` / `--directory-prefix` / `--output-dir` in every spelling; `-P` with `-O`; `-K`, `-i`, `-i -`, `-e dir_prefix=`; dynamic outputs and directories; `;`, `||`, subshells, `cd` before or after; `/usr/bin/curl`, `command`, `sudo`, `env`, `timeout`, `\curl`; runners `bash`, `sh`, `./x.sh`, `node`, `ruby`, `npx tsx`, `python -u`, `python3 < file`, `bash < file`; `wget -r -nd`. Read-only forms stay quiet (`curl … | jq .`, `curl -o out.json … && cat out.json`, `-o /dev/null`, `--spider`, `-I`, `--version`). The four remaining shapes are logged below.
- Suggestion for the remediation, since each attempt has found a new shape: when curl or wget writes a file whose local name the detector cannot derive exactly (non-`http(s)` or scheme-less URL, `-J` / `--content-disposition` / `--trust-server-names`, wget `-x` / `-r` / `-m` without `-nd`, mixed `-o` / `-O`), report `unresolved-target` instead of guessing a name. Leaving the guess unrecorded is what lands in the quiet branch.
- Out of scope for group 6 (no group 6 DONE WHEN names them; propose separately): `bash <(curl -fsSL URL)`, `sh <(wget -qO- URL)`, `source <(curl …)` and `bash <(cat fix.sh)` are silent, so process substitution as a script operand is unhandled; `source fix.sh` and `. fix.sh` are silent (the task 15 shape, group 4); `uv run template.py` is silent (not among task 25's listed runners); `install`, `rsync`, `ln -s` and `dd of=` are not recognised as writers at all, so they are not the "another non-redirect writer" the task 24 DONE WHEN extends. `curl -o - URL && python3 bkp-s.py` is correctly quiet (nothing is written).
- TASK 21, 23 and 25 still satisfied. Re-probed: `mergeManagedJson` on `dist/install/write.js` returns the `NotebookEdit` matcher with both `bkit-gateguard.cjs` and `node scripts/my-check.js`, and a second merge is a no-op; the heredoc-apostrophe commit form names `docs/x.md`; `ruby fix.rb`, `perl fix.pl`, `npx tsx scripts/gen.ts` and `pnpm exec tsx gen.ts` give `unknown-script-effect`, while `bun install` and `perl -e 1` stay quiet. `write.ts` and `dist/install/write.js` are unchanged since attempt 1.
- TASK 24 not satisfied: the planned forms work and every TEST FIRST test passes, but the four gaps below leave common download shapes silent.
- TASK 22: owner-accepted by `build-decision-1-8.md` (`Decision: Accept`), not coded, left off `Tasks:` as instructed. The test-first audit's TASK 22 `not-green` gap is accepted by that record, so it is no gap.
- Test-first audit (`build-tests-green-6-4.md`): `Enforced: true`. Unproven: `.bkit/core/engine/audits/hooks/gateguard-cursor.integration.test.ts` "keeps a shell target eligible after an unverified Cursor edit reminder" (task 22; never written, by decision `build-decision-1-8.md`). No `Updated tests`, `Already landed` or `delete-still-referenced` entries.
- Tests run: every test file under `.bkit/core/engine/audits/hooks/` and `.bkit/core/engine/install/` (39 files, 1671 tests, including all five TEST FIRST tests) pass. The first run waited on the machine-wide tests lock held by another worktree. `readFetchOptions` is byte-identical in the four `bkit-guardrails.cjs` copies (`.claude`, `.cursor`, `.codex`, `.agents/plugins/bkit`). No new error paths, so `docs/observability.md` adds no logging requirement here.

## Identified Gaps Log

4 gaps, all TASK 24, all in `.bkit/core/hooks/guardrails-shell.js` `evalCommand` `case "curl"` / `case "wget"` and `readFetchOptions`. Each listed command returns `{"targets":[],"uncertain":[],"limit":null}` and falls into the `ENOENT && st.commands > 0` quiet branch that the DONE WHEN keeps for files no earlier command named.

TASK 24: `.bkit/core/hooks/guardrails-shell.js` `evalCommand` `case "curl"` / `case "wget"` — remote-name downloads record a file only for URLs matching the lowercase `^https?:\/\/` regex, but curl and wget also take scheme-less URLs (default http) and other schemes: `curl -O x.example/bkp-s.py && python3 bkp-s.py`, `wget x.example/bkp-s.py && python3 bkp-s.py`, `curl -O HTTPS://x.example/bkp-s.py && python3 bkp-s.py`, `curl -O ftp://x.example/bkp-s.py && python3 bkp-s.py` and `wget ftp://x.example/bkp-s.py && python3 bkp-s.py` are all silent; wget also keeps the query string in the saved name (`wget "https://x.example/bkp-s.py?raw=1" && python3 "bkp-s.py?raw=1"` is silent because `bkp-s.py` is recorded) — Fixable: true
TASK 24: `.bkit/core/hooks/guardrails-shell.js` `readFetchOptions` — options that let the server choose the saved file name are not read, so the URL segment is recorded instead of reporting `unresolved-target`: `curl -OJ https://x.example/dl?id=1 && python3 bkp-s.py`, `curl -O -J https://x.example/dl && python3 bkp-s.py`, `curl --remote-header-name -O https://x.example/dl && python3 bkp-s.py`, `wget --content-disposition https://x.example/dl?id=1 && python3 bkp-s.py` and `wget --trust-server-names https://x.example/dl && python3 bkp-s.py` are all silent — Fixable: true
TASK 24: `.bkit/core/hooks/guardrails-shell.js` `readFetchOptions` — wget modes that save under `{host}/{url path}` are not read, so the file is recorded in the working directory: `wget -x https://x.example/a/bkp-s.py && python3 x.example/a/bkp-s.py`, `wget --force-directories …`, `wget -r -np …`, `wget --recursive …`, `wget -m …`, `wget --mirror …` (each followed by `python3 x.example/a/bkp-s.py`) and `wget -x -nH https://x.example/a/bkp-s.py && python3 a/bkp-s.py` are all silent; `wget -r -nd …` already works; record the host/path layout (honouring `-nH` / `--cut-dirs`) or report `unresolved-target` — Fixable: true
TASK 24: `.bkit/core/hooks/guardrails-shell.js` `evalCommand` `case "curl"` — curl pairs each `-o` / `-O` with the URLs in order, but the remote-name branch runs only when no `-o` is present, so a `-O` URL next to an `-o` URL is dropped: `curl -O https://x.example/bkp-a.py -o /tmp/bkp-b.py https://x.example/b.py && python3 bkp-a.py`, `curl -o /tmp/bkp-b.py https://x.example/b.py -O https://x.example/bkp-a.py && python3 bkp-a.py` and `curl --remote-name-all -o /tmp/bkp-b.py https://x.example/b.py https://x.example/bkp-a.py && python3 bkp-a.py` are all silent — Fixable: true
