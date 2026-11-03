# Host advisory delivery — 2026-11-03

Investigation for [#787 — Show authoring rules before every edit, including shell edits](https://github.com/cbartens/bkit/issues/787). Reviewed the five result reports, target files and acknowledgement records. The generated collectors matched the original `host-kit.mjs`; the collector is now [bkit-hook-probe.mjs](bkit-hook-probe.mjs), with its usage path and formatting updated. No production hooks or original evidence were changed.

| Host (reported version)                                 | Observed result                                                                                                                                                                                                                                                                            |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Codex 0.165.0 (model/client unknown)                    | Native edits and shell: all three markers acknowledged at 1,200 and 8,000 characters. At 12,000 and 32,000, beginning and end acknowledged, middle missing. Every acknowledgement was after the edit.                                                                                      |
| Claude Code 2.1.299 (claude-opus-5-5[1m], CLI)          | Native edits and shell: all three markers acknowledged at 1,200 and 8,000 characters. Only the beginning marker acknowledged at 12,000 and 32,000. Every acknowledgement was after the edit.                                                                                               |
| Cursor 3.27.22 (Grok 4.7, IDE)                          | Hooks fired for all 12 cases. Legacy additional_context yielded all three markers at 1,200 and 8,000, acknowledged after editing. Other cases had no acknowledgement.                                                                                                                      |
| Antigravity 1.3.5 (Gemini 3.8 Flash (High), IDE)        | Shell deny-once cases acknowledged all three markers before the edit at every tested size through 32,000. Shell allow cases emitted but received no acknowledgement. All eight native-edit targets changed without a matching hook observed; observed hook tool was run_command only.      |
| OpenCode 2.1.4 (deepseek/deepseek-v4.1-flash-1017, CLI) | All three markers acknowledged in all eight after-execution controls through 32,000. Target contents deviated from the required exact AFTER sentinel (AFTER plus filler), so target timing remains UNVERIFIED_TARGET_STATE. The edited:false field does not mean the files were untouched. |

Conclusion: these runs do not demonstrate non-blocking before-edit acknowledgement. Only Antigravity's intentional deny-once shell route demonstrated acknowledgement while the target was still BEFORE. This does not change the owner's decision against new production shell blocking.

8,000 characters is the largest tested size with all three markers acknowledged for both Codex and Claude, not a measured safe maximum. Missing markers do not establish truncation; absent acknowledgements do not distinguish delivery loss from model noncompliance. After-edit acknowledgement does not prove earlier receipt impossible. These observations apply to the reported client/model/version only. OpenCode target protocol deviations and Antigravity native edit coverage remain limitations. Codex client/model were not recorded.

## Method and preserved evidence

The [run guide](bkit-hook-probe.md) describes the protocol and rerun commands. Each host tested native edits and shell edits with 1,200, 8,000, 12,000 and 32,000 ASCII characters. Cursor also tested its legacy envelope; Antigravity compared allow-only with deny-once delivery. OpenCode was an explicit after-execution control. Random markers sampled the beginning, middle and end of each advisory. Acknowledgements captured the target contents at that moment.

- [codex complete result report](results/2026-11-03/bkit-hook-results-codex.json).
- [claude complete result report](results/2026-11-03/bkit-hook-results-claude.json).
- [cursor complete result report](results/2026-11-03/bkit-hook-results-cursor.json).
- [antigravity complete result report](results/2026-11-03/bkit-hook-results-antigravity.json).
- [opencode complete result report](results/2026-11-03/bkit-hook-results-opencode.json).
- [Result checksums and original collector checksums](results/2026-11-03/bkit-hook-results-manifest.json).
- [Acknowledgement timestamps, marker matches and target-state summaries](results/2026-11-03/bkit-hook-acknowledgements.json).

The result JSON files preserve every original field and value with repository formatting applied. The manifest records both original and archived byte checksums. The acknowledgement archive is a derived summary: it omits random marker values and synthetic filler, preserving target lengths and hashes. Chat transcripts and private hook state are not archived. The [issue comment](https://github.com/cbartens/bkit/issues/787#issuecomment-6597096126) also preserves the results.

## Interpretation limits

OpenCode targets contained `AFTER` followed by filler rather than the required exact sentinel. Their recorded acknowledgement lengths were 1,199, 7,999, 11,999 and 31,999 characters. Its original `edited: false` means the exact expected final state was absent, not that the files were untouched. The timing result remains `UNVERIFIED_TARGET_STATE`.

Antigravity recorded only `run_command` hook tool names: the eight native-edit cases provide no evidence of native-edit hook delivery. Model and client metadata are reported by the runner, not independently verified. Codex left those two fields unknown. Missing marker acknowledgements cannot establish a truncation threshold. No transcript review establishes earlier model receipt or rules out protocol violations.

These are manual host observations, separate from the collector integration tests. The existing design’s conservative budgets and explicit coverage limits remain warranted.
