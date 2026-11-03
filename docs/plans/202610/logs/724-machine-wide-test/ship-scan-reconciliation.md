# Disabled-test scan reconciliation

> [!CAUTION]
> **Purpose:** Reconcile the 107 findings in `ship-deferred-sweep.md` against actual removed assertions and their surviving owners or approved retirement.
> **Rules:** Preserve the original finding IDs and source coordinates. This report is evidence for review, not a blanket waiver of future test removals.

## Result

All 107 findings are accounted for: 94 assertions have surviving coverage, 12 findings are resolved by restoring their original guards, and one unused-fixture existence check is intentionally retired. The restorations add eight test cases and restore one assertion to an existing case across five files. No assertions were weakened.

The reviewed comparison is `origin/dev` at `3d1b8f1e8ee7b1833edd5ecba33da2dfa47280e8` against HEAD `8543394a21a5e65de7f97c8fcc1d737e1562a3e6`. The repository is not shallow. Every removed assertion was read from this comparison, including both deleted files in full. The original reported names and coordinates remain unchanged in `ship-deferred-sweep.md`; this table uses the actual assertion because the scanner sometimes labels deletions with an adjacent test.

The 68 non-lock hits originate in cleanup commit `1d458933f4bbfd6714509ff7e1ff753aa9fa5c78`. Its scope and acceptance criteria are recorded in `docs/plans/202611/844-migration-test-cleanup-plan.md`, Tasks 1–3 and Verification Record. Task 3 permits historical-check removal only when proven redundant; it does not approve blanket retirement. Review found that current catalog and vocabulary checks did not establish equivalence for 12 findings, so their original guards are restored. Task 2 specifically authorizes removing the unused fixture. B103 and B104 have concrete surviving set-equality and prompt-existence assertions.

The 39 lock hits originate in renaming the compatibility suite to `machine-lock.integration.test.ts`. The old cases remain, with explicit caller cwd fixtures matching the new lock-resolution contract. No tests are skipped or disabled by the rename.

## Evidence paths

All paths are relative to this worktree. A shorthand followed by a colon gives the current source line or range.

<!-- prettier-ignore -->
| Key | Source |
| --- | --- |
| P | `.bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.test.mjs` |
| A | `.bkit/templates/scripts/ci/bkit-check-accepted-divergences.test.mjs` |
| C | `.bkit/core/engine/audits/templates/ci-scripts.test.ts` |
| D | `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` |
| M | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` |
| H | `.bkit/core/engine/audits/hooks/gateguard-parity.integration.test.ts` |
| HC | `.bkit/core/engine/audits/hooks/gateguard-claude.integration.test.ts` |
| HU | `.bkit/core/engine/audits/hooks/gateguard-cursor.integration.test.ts` |
| HO | `.bkit/core/engine/audits/hooks/gateguard-opencode.test.ts` |
| T | `.bkit/core/engine/audits/templates/templates-content.test.ts` |
| T2 | `.bkit/core/engine/audits/templates/templates.test.ts` |
| K | `.bkit/core/engine/audits/workflows/catalog-parity.test.ts` |
| V | `.bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts` |
| W | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` |
| S | `.bkit/core/engine/commands/workflow/steps.test.ts` |
| I | `.bkit/core/engine/install/write.integration.test.ts` |

C:121–135 enumerates and executes every shipped standalone test file as a real Node child process and requires exit zero. P executes 17 cases and A executes six, using throwing assertions and a nonzero failure exit. D:333–334 enforces byte parity for the adopted push-base implementation and its standalone tests. Consequently, removing the duplicate Vitest wrappers does not stop these behaviors from running in the normal suite.

## Finding-by-finding mapping

<!-- prettier-ignore -->
| ID | Original reported source | Disposition | Actual removed check | Concrete evidence |
| --- | --- | --- | --- | --- |
| B001 | `.bkit/core/engine/audits/hooks/gateguard-parity.integration.test.ts:450` | Survives | Ordinary package.json edit emits GateGuard; removed name claimed subagents but supplied no subagent marker. | H:225–230 repeats the identical five-host input and advisory assertion; actual marked subagents remain in HC:225, HU:156, HO:488. |
| B002 | `.bkit/core/engine/audits/repo/resolve-push-base.test.ts:58` | Survives | green head and source | P:87–88; executed by C:130–135; adopted script and test parity D:333–334. |
| B003 | `.bkit/core/engine/audits/repo/resolve-push-base.test.ts:63` | Survives | no-green before head and source | P:93–94; executed by C:130–135; adopted script and test parity D:333–334. |
| B004 | `.bkit/core/engine/audits/repo/resolve-push-base.test.ts:72` | Survives | force-push fallback head | P:103; executed by C:130–135; adopted script and test parity D:333–334. |
| B005 | `.bkit/core/engine/audits/repo/resolve-push-base.test.ts:73` | Survives | force-push fallback source | P:104; executed by C:130–135; adopted script and test parity D:333–334. |
| B006 | `.bkit/core/engine/audits/repo/resolve-push-base.test.ts:78` | Survives | no base gives empty string | P:109; executed by C:130–135; adopted script and test parity D:333–334. |
| B007 | `.bkit/core/engine/audits/repo/resolve-push-base.test.ts:87` | Survives | newest run number wins | P:118; executed by C:130–135; adopted script and test parity D:333–334. |
| B008 | `.bkit/core/engine/audits/repo/resolve-push-base.test.ts:97` | Survives | lookup failure base and source | P:156–157; executed by C:130–135; adopted script and test parity D:333–334. |
| B009 | `.bkit/core/engine/audits/repo/resolve-push-base.test.ts:107` | Survives | local fallback source names origin/dev | P:167; executed by C:130–135; adopted script and test parity D:333–334. |
| B010 | `.bkit/core/engine/audits/repo/resolve-push-base.test.ts:111` | Survives | HTTPS .git URL | P:171; executed by C:130–135; adopted script and test parity D:333–334. |
| B011 | `.bkit/core/engine/audits/repo/resolve-push-base.test.ts:112` | Survives | HTTPS URL | P:172; executed by C:130–135; adopted script and test parity D:333–334. |
| B012 | `.bkit/core/engine/audits/repo/resolve-push-base.test.ts:113` | Survives | SCP URL and newline | P:173; executed by C:130–135; adopted script and test parity D:333–334. |
| B013 | `.bkit/core/engine/audits/repo/resolve-push-base.test.ts:114` | Survives | SSH URL | P:174; executed by C:130–135; adopted script and test parity D:333–334. |
| B014 | `.bkit/core/engine/audits/repo/resolve-push-base.test.ts:115` | Survives | empty URL | P:175; executed by C:130–135; adopted script and test parity D:333–334. |
| B015 | `.bkit/core/engine/audits/repo/resolve-push-base.test.ts:116` | Survives | undefined URL | P:176; executed by C:130–135; adopted script and test parity D:333–334. |
| B016 | `.bkit/core/engine/audits/repo/resolve-push-base.test.ts:120` | Survives | explicit local/branch/head arguments | P:181; executed by C:130–135; adopted script and test parity D:333–334. |
| B017 | `.bkit/core/engine/audits/repo/resolve-push-base.test.ts:125` | Survives | default arguments | P:183; executed by C:130–135; adopted script and test parity D:333–334. |
| B018 | `.bkit/core/engine/audits/repo/resolve-push-base.test.ts:129` | Survives | empty run list | P:122; executed by C:130–135; adopted script and test parity D:333–334. |
| B019 | `.bkit/core/engine/audits/repo/resolve-push-base.test.ts:130` | Survives | undefined run list | P:123; executed by C:130–135; adopted script and test parity D:333–334. |
| B020 | `.bkit/core/engine/audits/repo/resolve-push-base.test.ts:131` | Survives | malformed run entries | P:124; executed by C:130–135; adopted script and test parity D:333–334. |
| B021 | `.bkit/core/engine/audits/repo/resolve-push-base.test.ts:167` | Survives | git failure exits zero | P:131; executed by C:130–135; adopted script and test parity D:333–334. |
| B022 | `.bkit/core/engine/audits/repo/resolve-push-base.test.ts:168` | Survives | git failure prints before SHA | P:132; executed by C:130–135; adopted script and test parity D:333–334. |
| B023 | `.bkit/core/engine/audits/repo/resolve-push-base.test.ts:169` | Survives | git failure source | P:133; executed by C:130–135; adopted script and test parity D:333–334. |
| B024 | `.bkit/core/engine/audits/repo/resolve-push-base.test.ts:174` | Survives | bad gh JSON exits zero | P:138; executed by C:130–135; adopted script and test parity D:333–334. |
| B025 | `.bkit/core/engine/audits/repo/resolve-push-base.test.ts:175` | Survives | bad gh JSON prints before SHA | P:139; executed by C:130–135; adopted script and test parity D:333–334. |
| B026 | `.bkit/core/engine/audits/repo/resolve-push-base.test.ts:176` | Survives | bad gh JSON source | P:140; executed by C:130–135; adopted script and test parity D:333–334. |
| B027 | `.bkit/core/engine/audits/repo/resolve-push-base.test.ts:181` | Survives | green ancestor status/head/source | P:145–146; executed by C:130–135; adopted script and test parity D:333–334. |
| B028 | `.bkit/core/engine/audits/repo/resolve-push-base.test.ts:186` | Survives | unreadable CI run status/head | P:188; executed by C:130–135; adopted script and test parity D:333–334. |
| B029 | `.bkit/core/engine/audits/repo/resolve-push-base.test.ts:187` | Survives | unreadable CI run source | P:189; executed by C:130–135; adopted script and test parity D:333–334. |
| B030 | `.bkit/core/engine/audits/repo/resolve-push-base.test.ts:206` | Survives | local green ancestor status/head/source | P:207–208; executed by C:130–135; adopted script and test parity D:333–334. |
| B031 | `.bkit/core/engine/audits/repo/resolve-push-base.test.ts:207` | Survives | local query uses origin repository | P:209; executed by C:130–135; adopted script and test parity D:333–334. |
| B032 | `.bkit/core/engine/audits/repo/resolve-push-base.test.ts:208` | Survives | local query branch/event/status | P:210; executed by C:130–135; adopted script and test parity D:333–334. |
| B033 | `.bkit/core/engine/audits/repo/resolve-push-base.test.ts:213` | Survives | ancestry checks requested head and returns origin SHA | P:219; executed by C:130–135; adopted script and test parity D:333–334. |
| B034 | `.bkit/core/engine/audits/repo/resolve-push-base.test.ts:214` | Survives | wrong-head fallback source | P:220; executed by C:130–135; adopted script and test parity D:333–334. |
| B035 | `.bkit/core/engine/audits/repo/resolve-push-base.test.ts:219` | Survives | local gh failure status/head | P:230; executed by C:130–135; adopted script and test parity D:333–334. |
| B036 | `.bkit/core/engine/audits/repo/resolve-push-base.test.ts:220` | Survives | local gh failure source | P:231; executed by C:130–135; adopted script and test parity D:333–334. |
| B037 | `.bkit/core/engine/audits/repo/resolve-push-base.test.ts:221` | Survives | local gh failure stderr reason | P:232; executed by C:130–135; adopted script and test parity D:333–334. |
| B038 | `.bkit/core/engine/audits/repo/resolve-push-base.test.ts:222` | Survives | local gh failure queries origin repository | P:233; executed by C:130–135; adopted script and test parity D:333–334. |
| B039 | `.bkit/core/engine/audits/templates/ci-scripts.test.ts:20` | Survives | event_name site key | A:66–69; executed by C:130–135. |
| B040 | `.bkit/core/engine/audits/templates/ci-scripts.test.ts:20` | Survives | ref site key | A:70–73; executed by C:130–135. |
| B041 | `.bkit/core/engine/audits/templates/ci-scripts.test.ts:20` | Survives | exactly two sites | A:74; executed by C:130–135. |
| B042 | `.bkit/core/engine/audits/templates/ci-scripts.test.ts:20` | Survives | workflow concurrency event_name key | A:99–106; executed by C:130–135. |
| B043 | `.bkit/core/engine/audits/templates/ci-scripts.test.ts:20` | Survives | workflow concurrency ref key | A:99–106; executed by C:130–135. |
| B044 | `.bkit/core/engine/audits/templates/ci-scripts.test.ts:20` | Survives | step named after id | A:99–106; executed by C:130–135. |
| B045 | `.bkit/core/engine/audits/templates/ci-scripts.test.ts:20` | Survives | unnamed step base_ref key | A:99–106; executed by C:130–135. |
| B046 | `.bkit/core/engine/audits/templates/ci-scripts.test.ts:20` | Survives | uses fallback step head_ref key | A:99–106; executed by C:130–135. |
| B047 | `.bkit/core/engine/audits/templates/ci-scripts.test.ts:20` | Survives | exactly five sites | A:108; executed by C:130–135. |
| B048 | `.bkit/core/engine/audits/templates/ci-scripts.test.ts:20` | Survives | one missing site | A:117; executed by C:130–135. |
| B049 | `.bkit/core/engine/audits/templates/ci-scripts.test.ts:20` | Survives | zero stale sites | A:118; executed by C:130–135. |
| B050 | `.bkit/core/engine/audits/templates/ci-scripts.test.ts:20` | Survives | one stale registry row | A:133; executed by C:130–135. |
| B051 | `.bkit/core/engine/audits/templates/ci-scripts.test.ts:20` | Survives | one unknown-decision error | A:145; executed by C:130–135. |
| B052 | `.bkit/core/engine/audits/templates/ci-scripts.test.ts:20` | Survives | clean registry has no missing/stale/bad decision | A:157–160; executed by C:130–135. |
| B053 | `.bkit/core/engine/audits/templates/local-stack-lock.integration.test.ts:83` | Survives | git fixture command succeeds | M:102; same assertion after rename. |
| B054 | `.bkit/core/engine/audits/templates/local-stack-lock.integration.test.ts:92` | Survives | busy try status | M:555; same assertion after rename. |
| B055 | `.bkit/core/engine/audits/templates/local-stack-lock.integration.test.ts:93` | Survives | busy try holder name | M:556; same assertion after rename. |
| B056 | `.bkit/core/engine/audits/templates/local-stack-lock.integration.test.ts:94` | Survives | busy try checkout | M:557; same assertion after rename. |
| B057 | `.bkit/core/engine/audits/templates/local-stack-lock.integration.test.ts:104` | Survives | killed holder permits acquisition | M:567; same assertion after rename. |
| B058 | `.bkit/core/engine/audits/templates/local-stack-lock.integration.test.ts:105` | Survives | killed holder acquisition status | M:568; same assertion after rename. |
| B059 | `.bkit/core/engine/audits/templates/local-stack-lock.integration.test.ts:106` | Survives | killed holder recovery time | M:569; same assertion after rename. |
| B060 | `.bkit/core/engine/audits/templates/local-stack-lock.integration.test.ts:115` | Survives | waiting runner acquires | M:578; same assertion after rename. |
| B061 | `.bkit/core/engine/audits/templates/local-stack-lock.integration.test.ts:116` | Survives | wait identifies waiter | M:579; same assertion after rename. |
| B062 | `.bkit/core/engine/audits/templates/local-stack-lock.integration.test.ts:117` | Survives | wait identifies holder | M:580; same assertion after rename. |
| B063 | `.bkit/core/engine/audits/templates/local-stack-lock.integration.test.ts:118` | Survives | wait lasts until holder release | M:581; same assertion after rename. |
| B064 | `.bkit/core/engine/audits/templates/local-stack-lock.integration.test.ts:129` | Survives | timeout status | M:592; same assertion after rename. |
| B065 | `.bkit/core/engine/audits/templates/local-stack-lock.integration.test.ts:130` | Survives | timeout names budget and holder | M:593; same assertion after rename. |
| B066 | `.bkit/core/engine/audits/templates/local-stack-lock.integration.test.ts:141` | Survives | release permits successor | M:604; same assertion after rename. |
| B067 | `.bkit/core/engine/audits/templates/local-stack-lock.integration.test.ts:142` | Survives | release exits successfully | M:605; same assertion after rename. |
| B068 | `.bkit/core/engine/audits/templates/local-stack-lock.integration.test.ts:150` | Survives | set -e caller survives busy try | M:613; same assertion after rename. |
| B069 | `.bkit/core/engine/audits/templates/local-stack-lock.integration.test.ts:158` | Survives | set -e caller survives dead-holder release | M:621; same assertion after rename. |
| B070 | `.bkit/core/engine/audits/templates/local-stack-lock.integration.test.ts:167` | Survives | nested runner succeeds | M:630; same assertion after rename. |
| B071 | `.bkit/core/engine/audits/templates/local-stack-lock.integration.test.ts:168` | Survives | nested runner does not wait | M:631; same assertion after rename. |
| B072 | `.bkit/core/engine/audits/templates/local-stack-lock.integration.test.ts:179` | Survives | explicit stack succeeds | M:642; same assertion after rename. |
| B073 | `.bkit/core/engine/audits/templates/local-stack-lock.integration.test.ts:180` | Survives | explicit stack path | M:643–645; same assertion after rename. |
| B074 | `.bkit/core/engine/audits/templates/local-stack-lock.integration.test.ts:199` | Survives | main checkout lock path | M:662; same assertion after rename. Fixture now passes the caller checkout explicitly, matching the specified cwd contract. |
| B075 | `.bkit/core/engine/audits/templates/local-stack-lock.integration.test.ts:200` | Survives | worktree lock path | M:663; same assertion after rename. Fixture now passes the caller checkout explicitly, matching the specified cwd contract. |
| B076 | `.bkit/core/engine/audits/templates/local-stack-lock.integration.test.ts:205` | Survives | worktree contends | M:668; same assertion after rename. |
| B077 | `.bkit/core/engine/audits/templates/local-stack-lock.integration.test.ts:206` | Survives | worktree names main holder | M:669; same assertion after rename. |
| B078 | `.bkit/core/engine/audits/templates/local-stack-lock.integration.test.ts:218` | Survives | outside checkout refuses | M:682; same assertion after rename. |
| B079 | `.bkit/core/engine/audits/templates/local-stack-lock.integration.test.ts:219` | Survives | outside checkout diagnostic | M:683; same assertion after rename. |
| B080 | `.bkit/core/engine/audits/templates/local-stack-lock.integration.test.ts:220` | Survives | outside checkout makes no cache | M:684; same assertion after rename. |
| B081 | `.bkit/core/engine/audits/templates/local-stack-lock.integration.test.ts:226` | Survives | holder-crash fixture locates Perl | M:690; same assertion after rename. |
| B082 | `.bkit/core/engine/audits/templates/local-stack-lock.integration.test.ts:229` | Survives | holder-crash refusal status | M:696; same assertion after rename. |
| B083 | `.bkit/core/engine/audits/templates/local-stack-lock.integration.test.ts:230` | Survives | holder-crash diagnostic | M:697; same assertion after rename. |
| B084 | `.bkit/core/engine/audits/templates/local-stack-lock.integration.test.ts:231` | Survives | holder-crash fails promptly | M:698; same assertion after rename. |
| B085 | `.bkit/core/engine/audits/templates/local-stack-lock.integration.test.ts:236` | Survives | CI mode command succeeds | M:703; same assertion after rename. |
| B086 | `.bkit/core/engine/audits/templates/local-stack-lock.integration.test.ts:237` | Survives | CI mode status zero | M:704; same assertion after rename. |
| B087 | `.bkit/core/engine/audits/templates/local-stack-lock.integration.test.ts:238` | Survives | CI mode makes no cache | M:705; same assertion after rename. |
| B088 | `.bkit/core/engine/audits/templates/local-stack-lock.integration.test.ts:255` | Survives | run forwards exit 3 | M:722; same assertion after rename. |
| B089 | `.bkit/core/engine/audits/templates/local-stack-lock.integration.test.ts:256` | Survives | run command sees holder | M:723; same assertion after rename. |
| B090 | `.bkit/core/engine/audits/templates/local-stack-lock.integration.test.ts:261` | Survives | missing command usage status 2 | M:728; same assertion after rename. |
| B091 | `.bkit/core/engine/audits/templates/local-stack-lock.integration.test.ts:262` | Survives | missing command usage text | M:729; same assertion after rename. |
| B092 | `.bkit/core/engine/audits/templates/templates-content.test.ts:97` | Survives | CI template contains frozen-lockfile installation. | T:89–94 already finds the exact command, asserts its index is nonnegative, and rejects registry authentication. |
| B093 | `.bkit/core/engine/audits/templates/templates.test.ts:419` | Restored | Change forms do not mention historical lite workflow names. | Restored the original assertion over both issue forms in T2:419–425. Current catalog coverage alone did not enforce this prohibition. |
| B094 | `.bkit/core/engine/audits/templates/templates.test.ts:419` | Restored | Reference-doc directory contains no lite.md. | Restored the original directory-entry assertion in T2:430. |
| B095 | `.bkit/core/engine/audits/templates/templates.test.ts:419` | Restored | Reference-doc index contains no lite.md. | Restored the original index assertion in T2:431. |
| B096 | `.bkit/core/engine/audits/templates/templates.test.ts:419` | Restored | Reference README contains no lite.md or :lite. | Restored the original shipped README assertion in T2:432. |
| B097 | `.bkit/core/engine/audits/templates/templates.test.ts:420` | Restored | Root README contains no historical lite spelling. | Restored the original prohibition in T2:436, alongside the existing current-entrypoint assertion. |
| B098 | `.bkit/core/engine/audits/workflows/catalog-parity.test.ts:56` | Restored | All non-history tracked files exclude eight retired plan-agent/step/file names. | Restored the complete removedNameHits helper, its original historical-path exclusions, and assertion in K:64–106. |
| B099 | `.bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts:405` | Restored | Workflow/prompt text excludes UPDATE_DOCS_VERDICT. | Restored the original assertion in V:408. Current naming constraints did not prove equivalent whole-text coverage. |
| B100 | `.bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts:405` | Restored | Workflow/prompt text excludes REMEDIATE_CHALLENGE_VERDICT. | Restored the original assertion in V:409. |
| B101 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts:587` | Restored | Build text excludes retired challenge agents/step/limit spellings. | Restored the original complete banned-name list and assertion in W:587–595. |
| B102 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts:1086` | Restored | All shipped prompt/workflow lines exclude lite workflow spellings. | Restored the original full directory scan and assertion in W:1095–1115. |
| B103 | `.bkit/core/engine/commands/workflow/steps.test.ts:918` | Survives | ROW_FIELDS excludes the three removed challenge steps. | S:912–915 requires exact equality between ROW_FIELDS and all current workflow row-writing calls. None uses the removed steps. Reintroducing an obsolete table entry produces an extra key and fails this assertion. |
| B104 | `.bkit/core/engine/commands/workflow/steps.test.ts:929` | Survives | Ledger writer lists exclude the three removed challenge agents. | S:919–929 requires every configured writer to have a real prompt file. The three removed agents have no prompt files, so each obsolete reference fails the surviving assertion. |
| B105 | `.bkit/core/engine/install/write.integration.test.ts:44` | Retired | Unused heavy-customised-consumer fixture directory exists. | Cleanup plan Task 2 specifically authorizes deletion of this unused fixture manifest; commit 1d458933f removes it. The fixture was not consumed by the surrounding behavior tests. I:45–75 preserves actual Stop-hook/custom-key checks; I:103–172 preserves provider customization and idempotence. |
| B106 | `.bkit/core/engine/tools/instructions-sources.test.ts:174` | Restored | Rules/prompts exclude historical next:*:lite labels and lite paths. | Restored the original rules/prompt scan and assertion in .bkit/core/engine/tools/instructions-sources.test.ts:175–184. |
| B107 | `.bkit/core/engine/tools/instructions-sources.test.ts:174` | Restored | Clause store excludes historical lite text outside retired fences. | Restored the original clause-store scan and assertion in .bkit/core/engine/tools/instructions-sources.test.ts:187–190. |

## Verification

Before restoring the historical guards, fresh verification passed: 15 test files and 1,367 tests, exit 0, duration 101.88 seconds. The command was `pnpm exec vitest run` with the 15 files below and `--maxWorkers=2`:

- H, HC, HU and HO: hook parity and actual marked-subagent coverage.
- C and M: standalone CI-script execution and the full renamed machine-lock suite.
- T, T2 and D: template contents, current guidance and adopted-script parity.
- K, V and W: catalog, verdict vocabulary and workflow contracts.
- S and I: ledger writers and actual consumer-write preservation.
- `.bkit/core/engine/tools/instructions-sources.test.ts`: current instructions-source contracts.

The run reported no failed or skipped tests. YAML parsing emitted existing placeholder-key warnings: `Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.` and the same warning for `"{ CLOUD_RUNNER }"`. These did not fail the run. This is targeted verification, not a claim that the full repository gates have run.

After restoring the guards, a fresh `pnpm exec vitest run` passed all six affected or replacement-owner files (T2, K, V, W, S and `instructions-sources.test.ts`) with `--maxWorkers=2`: 697 tests passed, zero failures or skips, exit 0, duration 18.29 seconds. The five restored test files and this report passed Prettier; changed-file Oxlint passed. All eight restored test cases executed successfully. The five files now match their complete `origin/dev` versions, so none of their original assertions remains deleted.

## Remaining work

The scanner must distinguish verified relocation and reviewed semantic deduplication or retirement from unexplained removal. The original FAIL is not silently changed by this report. Scanner regression verification, a fresh scan against the then-current base, and the ship gates belong to the parent task. The 12 restored findings require no exception; their original assertions are present again.

