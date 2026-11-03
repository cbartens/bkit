Verdict: PASS
Failures: 0
Lazy: 0

<!-- verdict:end -->

# Deferred Sweep

## Planned vs Delivered

Plan: `docs/plans/202610/700-session-start-nudge-plan.md` (present). No design doc, no audit report — the `#700` issue body is the spec. Diff: `tmp/bkit-diff-700-session-start-nudge.md` (119 files). Status: `docs/plans/202610/logs/700-session-start-nudge/status.jsonl`.

<!-- prettier-ignore -->
| # | Intended deliverable (where) | Status | Evidence |
| --- | --- | --- | --- |
| 1 | Claude Code `SessionStart` advisory, IDE + cloud (plan TASK 1, Success Criterion 1) | Delivered | `.bkit/core/.claude/hooks/bkit-preflight.sh` — `emit_context` accumulates + `bkit_write_document` from `trap … EXIT`, `# {{BKIT_PART preflight-rules.sh}}` spliced above the `LINEAR_ISSUE_ID` bail (diff L4080–4160); mirror `.claude/hooks/bkit-preflight.sh` carries the advisory (grep) |
| 2 | Cursor `sessionStart` advisory, exits 0, no `python3` (plan TASK 1, edge case) | Delivered | `.bkit/core/.cursor/hooks/bkit-preflight.sh` — part moved above the `is_background_agent` grep bail, `printf`-only writer (diff L4224–4307); mirror `.cursor/hooks/bkit-preflight.sh` carries it |
| 3 | opencode first-tool advisory, once/session, fail-open (plan TASK 2) | Delivered | `.bkit/core/.opencode/plugin/bkit-rules.js` (diff L4308–4402) + mirror; shape check precedes `rulesReadAdviceOnce()` in both `bkitRulesAfterV2`/`V1` (TASK 6) |
| 4 | Codex first-tool advisory once as `additionalContext` (plan TASK 3) | Delivered | `.bkit/core/.codex/hooks/bkit-rules.cjs` (diff L4161–4223) + mirror; registered on `apply_patch` and `Bash` in `.bkit/shared/.codex/hooks.json` |
| 5 | Antigravity first-tool deny-once advisory (plan TASK 3) | Delivered | `.bkit/core/.agents/plugins/bkit/hooks/bkit-rules.cjs` (diff L3907–3977) + mirror; matcher `write_to_file\|replace_file_content\|view_file\|run_command` in `.bkit/shared/.agents/plugins/bkit/hooks.json` |
| 6 | Advisory names `.agents/rules.md` only, never `AGENTS.md` (Success Criterion 2) | Delivered | `grep -ln 'AGENTS\.md'` over the five rendered/mirror hook files → no match; test `names .agents/rules.md and never AGENTS.md` passes |
| 7 | Fail-open — malformed/empty payload, no session id, no `python3` (Success Criterion 3) | Delivered | `.bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts` + `preflight-sh.integration.test.ts` → 99 passed with `parts.test.ts` / `dogfood-templates.test.ts` (re-run this session) |
| 8 | Present on all five providers (Success Criterion 4) | Delivered | items 1–5; install wiring in `.bkit/shared/.opencode/opencode.json` (`./plugin/bkit-rules.js`), `.bkit/shared/.codex/hooks.json`, `.bkit/shared/.agents/plugins/bkit/hooks.json`, `install/modules/{opencode,codex,antigravity}.ts`, `install/manifest.ts` (diff L5567–5662, L6040–6104) |
| 9 | Rendered/installed mirrors drift-clean (plan TASK 5 `DONE WHEN`) | Delivered | `node dist/cli.js check` → `0 write(s) would occur`; `check.integration.test.ts` + `steps.test.ts` → 121 passed; `dist/install/*.js` carry `bkit-rules` |
| 10 | Challenge MEDIUM findings fixed — TASK 6 (opencode token order), 7 (`steps.ts` index rollback), 8 (`adviseOnce` hash), 9 (full C0 JSON escape) | Delivered | `bkit-rules.js` pre-consume shape checks; `steps.ts` `stagedPaths`/`unstageStaged` + rollback (diff L5243–5349); `antigravity-hook.js` sha256 digest (diff L5755–5787); `bkit_json_escape` loops U+0001–U+001F in both preflight hooks |
| 11 | Docs updated (plan TASK 4 `DONE WHEN`) | Delivered | `.bkit/core/.bkit/providers.md` § parts table + § Rules-read advisory + § GateGuard ownership (L303–341) and its `.bkit/providers.md` mirror; `docs/architecture.md:172` lists the three hooks and two parts; `docs/testing.md` new test row; `docs/knowledge.jsonl` `kn-hooks-sessionstart-stdout-is-one-json-document`; `docs/decisions.jsonl` key `700-session-start-rules-read-advisory` (3 appends) |
| 12 | Deferral rows for ideas 2–4 (plan TASK 4, `#700` § Out of Scope) | Delivered | `docs/deferrals.jsonl` keys `700-first-action-deny-gate`, `700-rules-content-hash-acknowledgement`, `700-provider-auto-load-rules` (`reason:"scope-declared"`, `status:"OPEN"`) |
| 13 | Advisory sentence is the owner-confirmed option A | **Deviation, accounted** — see Exempt Deferrals | Shipped: `[bkit] Required reading before any other action: read \`.agents/rules.md\` and follow every rule in it.`vs confirmed`[bkit] Read .agents/rules.md before any other action and follow all its rules.`Success Criteria 1/2 still hold (names only`.agents/rules.md`, "before any other action"); recorded as a LOW challenge deferral row |

No `Planned` item is left unjudged; no item failed a blocking test.

## Blocking Deferrals

None.

- No intended deliverable is absent, stub-only, or functionally wrong: every named file exists in the diff and in the installed mirrors, and the named tests pass (99 + 121 re-run this session; build run `run-tests-1.md` PASS, `build-plan-verify-holistic.md` PASS).
- No guard removed or weakened: the two `bkit-preflight.sh` hooks keep the Linear/cloud guard and its `HARD STOP`; GateGuard/ReadGuard contracts are untouched (parity tests green); TASK 6–9 strengthened error paths (index rollback, hashed retry state, full C0 escaping).
- No shipped surface instructs consumers to run something that fails at runtime (`bkit check` drift-clean; `bkit install` paths verified in TASK 5).
- No test disabled in the supplied diff: no `.skip` / `.todo` / `.fixme` / `.only` / `xfail` / `t.Skip` / `#[ignore]` / `@Disabled` added; the three removed `expect(result.stdout).toBe("")` lines (diff L4464/4499/4515) are the IDE-skip assertions **inverted** to `toContain(".agents/rules.md")`, not deleted.

## Exempt Deferrals

Plan § **Out of Scope** (3 rows, declared in `#700` § Out of Scope before work started):

<!-- prettier-ignore -->
| Item | Not covered | Where / when declared | `reason` |
| --- | --- | --- | --- |
| Ideas 2–4 — first-action deny gate, content-hash acknowledgement, provider auto-load | All three, entirely | `#700` § Out of Scope (issue body, before work); plan § Out of Scope; deferred at plan time (2026-10-26T03:41Z) | `scope-declared` — rows `700-first-action-deny-gate`, `700-rules-content-hash-acknowledgement`, `700-provider-auto-load-rules`, each `references:["#700"]`, `status:"OPEN"` |
| Any change to `.agents/rules.md` content | The `.agents/rules.md` file body | `#700` § Out of Scope; plan § Out of Scope | Exempt — issue non-goal declared before work; no deferred work to remediate |
| Blocking behaviour of any kind | All hard gating | `#700` § Out of Scope; plan § Out of Scope | Exempt — issue non-goal declared before work; the advisory never blocks |

Plan § **Suggested Scope Expansion** (7 candidates, all `keep deferred`): `#699` completeness check; ReadGuard nudge (`668-readguard-nudge-out-of-scope`); decoupled preflight posture (`341-c1-c2-mcp-actions-toolset-and-decoupled-preflight-posture`); `650-preflight-linear-issue-less` (OPEN, LOW); `codex-read-tier-gates-not-wired-file-read-tool-name-unverified` (OPEN, MEDIUM); `504-install-advisory-when-tracker-is-none` (OPEN, MEDIUM); `bkit upgrade` drifted managed block (`related-issues.md` § Re-check of `aea3c813`). None is a `#700` deliverable — `Exempt`.

`docs/deferrals.jsonl` rows for this feature — `reason` verified to hold at ship time:

<!-- prettier-ignore -->
| `key` | severity / reason | Verdict at ship time | Note |
| --- | --- | --- | --- |
| `700-first-action-deny-gate` | LOW / `scope-declared` | Holds → Exempt | idea 2; referenced to `#700` |
| `700-rules-content-hash-acknowledgement` | LOW / `scope-declared` | Holds → Exempt | idea 3; blocked on the deny gate |
| `700-provider-auto-load-rules` | LOW / `scope-declared` | Holds → Exempt | idea 4; context-budget trade-off |
| `700-session-start-nudge-challenge-low-bkit-core-hooks-preflight-rules-sh-6` | LOW / `low-severity` | Holds → Exempt | **Live.** The advisory sentence shipped on all five hosts is not the owner-confirmed option A (`docs/decisions.jsonl:721` "advisory wording A"); no test pins the exact sentence, and Success Criteria 1/2 are still met. The row names both resolutions — re-word both parts to option A and re-install, or amend the plan's § Open Questions / § Concrete Example and re-append the decision row with the shipped text. Owner/per-deferral follow-up, not a merge gate (`low-severity` holds without the four tests). |
| `700-session-start-nudge-challenge-low-agents-skills-hook-development-scripts-test-hook-sh-190` | LOW / `low-severity` | Holds → Exempt | **Live.** Vendored `.agents/skills/hook-development/scripts/test-hook.sh:190` interpolates paths into `bash -c`; new executable content vendored via `skills-lock.json`, outside the `#700` sources. |
| `700-session-start-nudge-challenge-low-bkit-core-claude-hooks-bkit-preflight-sh-46` | LOW / `low-severity` | Holds → Exempt (row now stale) | control-character escaping — **already fixed** by plan TASK 9 (`bkit_json_escape` escapes U+0001–U+001F in both preflight hooks; test `a context carrying a control character still yields one parseable JSON document` passes). Row can be CLOSED by the deferrals housekeeping pass. |
| `700-session-start-nudge-challenge-low-bkit-core-hooks-antigravity-hook-js-63` | LOW / `low-severity` | Holds → Exempt (row now stale) | raw `adviseOnce` signature — **already fixed** by plan TASK 8 (`crypto.createHash("sha256")` digest; test `the antigravity retry store never persists a raw command line` passes). Row can be CLOSED. |

Reported-but-not-filed items (declared in execute logs, no `deferrals.jsonl` row, no plan deliverable → `Exempt`, non-blocking): three cosmetic label stalenesses recorded in `build-plan-execute-2-log.md:12` and `build-plan-verify-holistic.md:42` — `parts.test.ts` it-name still reads "the sixteen host hooks" (list holds 19), `docs/testing.md`'s `parts.test.ts` row still says "the nine host hook templates", and `preflight-sh.integration.test.ts`'s header comment still says the IDE-skip path "exits 0 silently". Each is a one-line label fix; none gates a `DONE WHEN` and every named test passes.

## Lazy Deferrals

None.

## Handover Notes

None.
