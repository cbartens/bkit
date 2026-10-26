Verdict: CONCERNS
Failures: 3

<!-- verdict:end -->

# Plan Review

Lens: Regression risk, design-coverage.

## Surface-Area Map

No schemas, tables, endpoints, event names or queue topics are touched (no DB, no network surface; the Linear API call in `preflight-linear.sh` is unchanged). All surfaces are hook files, hook registration JSON, install wiring and tests.

**TASK 1 — Claude Code + Cursor session-start advisory**

- CREATE `.bkit/core/hooks/preflight-rules.sh` — new shared part; consumed via `# {{BKIT_PART preflight-rules.sh}}` by both preflight hooks (2 hosts ≥ 2, satisfies `parts.test.ts:103-115`).
- UPDATE `.bkit/core/.claude/hooks/bkit-preflight.sh` — `emit_context` (currently immediate-write, python3-based, lines 33-43) becomes accumulate + `EXIT` trap; advisory spliced before the `LINEAR_ISSUE_ID` bail (lines 48-50). Consumers: `.claude/settings.json` SessionStart registration (unchanged path); installed mirror `.claude/hooks/bkit-preflight.sh` in every consumer repo (markered-text rewrite on `bkit upgrade`, manifest entry `install/manifest.ts:165`); `preflight-sh.integration.test.ts` (spawns the rendered hook); `claude.ts:129` install write (path unchanged).
- UPDATE `.bkit/core/.cursor/hooks/bkit-preflight.sh` — `emit_context` (lines 49-54) and the advisory spline move **above** the `is_background_agent` bail (lines 33-35); python3-free JSON writer on the advisory-only path (required: `failClosed: true` blocks on non-zero exit). Consumers: `.cursor/hooks.json` registration (unchanged); mirror via `cursor.ts:118`; same test file.
- READ `.bkit/core/hooks/preflight-linear.sh` — unchanged text, but its five `emit_context` calls (lines 8, 16, 35, 68, 72) silently change semantics from write-and-exit to accumulate; merged single-document output keeps the existing guard assertions (`JSON.parse(stdout)` + `toContain("HARD STOP")`) passing.
- Behaviour delta: IDE sessions emit one JSON document where stdout was previously silent — deterministically breaks 3 existing assertions (`preflight-sh.integration.test.ts:61-65` Claude IDE skip, `:79-84` Jira-session skip, `:96-100` Cursor IDE skip), acknowledged only in Verification Plan "Test Synchronization".

**TASK 2 — opencode first-tool advisory**

- CREATE `.bkit/core/hooks/session-rules-advisory.js` — shared JS part (3 host consumers ≥ 2 ✓); dedup mirrors `readguard-engine.js` 24 h OS-temp TTL (`readguard-engine.js:177-181`).
- CREATE `.bkit/core/.opencode/plugin/bkit-rules.js` — new `{{BKIT_PART}}`-splicing template in a scanned hook dir → enters the `parts.test.ts:82-101` hard-coded 16-template `toEqual` (breaks). "Fail-open top-level catch; no throw, no stderr" = the exact empty-catch shape that forced the `defensive.empty-catch` override for its sibling (`slop-scan.config.json:83-94`; ACTIVE knowledge row `fail-open-empty-catch-is-a-documented-contract-…`). Consumers: opencode plugin loader via shared `opencode.json` `plugin` array (`./plugin/…` relative spec, matches existing entries); `bkit check` owned-hook inventory (`check.integration.test.ts:346-349` hard `toEqual`, 2 → 3, breaks); uninstall decision table (data-driven from manifest, safe).
- UPDATE `install/modules/opencode.ts:519-532` plugin write loop; `install/manifest.ts` opencode block; `.bkit/shared/.opencode/opencode.json` plugin array (Tier-2 deep-contained reconverge, same path readguard took in 5.1.0).

**TASK 3 — Codex + Antigravity first-tool advisory**

- CREATE `.bkit/core/.codex/hooks/bkit-rules.cjs` — new `{{BKIT_PART}}` template (parts.test.ts list breaks); "fail-open catch" + cross-host twin shape → same slop-override need. Registration: new `PreToolUse` group in `.bkit/shared/.codex/hooks.json` on matcher `apply_patch|Bash` — note every existing Codex matcher is single-value; alternation is unverified on Codex (cf. OPEN deferral `codex-read-tier-gates-not-wired-…` warning about registrations that "silently never fire"). Consumers: `check.integration.test.ts:341-345` hard `toEqual` (3 → 4, breaks); manifest codex block; `codex.ts:171-181` write loop.
- CREATE `.bkit/core/.agents/plugins/bkit/hooks/bkit-rules.cjs` — same parts/slop surface. Reuses the live-verified `antigravity-hook.js` adapter (`fromAntigravityPayload`, `adviseOnce` deny-once) — correctly avoids the CLOSED failure `antigravity-hook-contract-unverified`; hooks.json registration uses proven alternation matchers and the `f=… || true` cwd shape (CLOSED failure `antigravity-hook-commands-wrong-cwd`).
- UPDATE `install/modules/codex.ts` / `antigravity.ts:201-226` hook-write loops; `install/manifest.ts` codex + antigravity blocks (uninstall/`manifest.test.ts` assertions are `find`/`toBeGreaterThan`, safe); `.bkit/shared/.agents/plugins/bkit/hooks.json`.
- Upgrade path relies on the CLOSED fix `upgrade-skips-new-optin-host-files` (upgrade.ts lets absent opt-in paths through when the module is installed) for the three new files to reach existing consumers.

**TASK 4 — References and ledgers**

- UPDATE `.bkit/core/.bkit/providers.md` (mirror `.bkit/providers.md` regenerated), `docs/architecture.md:168-184` installed-layout hook list (verified it enumerates hook files), `docs/knowledge.jsonl`. DONE WHEN carries the `bkit install` + `bkit check` drift-clean regeneration of this repo's own mirrors (`.opencode/plugin/bkit-rules.js`, `.codex/hooks/bkit-rules.cjs`, `.agents/plugins/bkit/hooks/bkit-rules.cjs`, plus the two preflight mirrors).

**Design-coverage:** no design artifact exists (`docs/plans/202610/700-*` glob empty) — the `#700` issue body is the spec. All 4 Success Criteria, all 4 issue Edge Cases (+5 plan-added), and the issue's 3 tasks are covered; every Derived Test Matrix row maps to a task. Plan caps hold: Group 1 has 3 tasks / 12 `TEST FIRST` tests; per task ≤ 4 tests in 1 file.

## CRITICAL

1. **`parts.test.ts:82-101` breaks deterministically; no task owns the fix.** The test "the hook templates that splice parts are the sixteen host hooks" asserts a hard-coded `toEqual` list of exactly 16 hook templates that contain a `{{BKIT_PART` line. Tasks 2/3 create three new templates that splice `{{BKIT_PART session-rules-advisory.js}}` inside the scanned dirs (`.opencode/plugin`, `.codex/hooks`, `.agents/plugins/bkit/hooks`), taking the rendered set to 19. The test reds the moment Task 2 lands; `parts.test.ts` appears in no task's CREATE/UPDATE and no `TEST FIRST`. Fix: add `UPDATE: .bkit/core/engine/render/parts.test.ts` (16 → 19 list) to Task 2 (or 3).
2. **`check.integration.test.ts:328-350` breaks deterministically; no task owns the fix.** "Requires the hook files of each installed host, and only those" asserts per-host hard `toEqual` lists fed by the manifest entries Tasks 2/3 add: opencode 2 → 3 (`bkit-rules.js`), codex 3 → 4 (`bkit-rules.cjs`). Both rows red once the manifest entries land. Fix: name the file in Tasks 2 and 3 and update the two lists.
3. **Slop-gate / `dogfood-templates.test.ts` pincer for the fail-open catches; no task owns it.** The plan specifies intentional fail-open catches ("Fail-open top-level catch; no throw, no stderr" for opencode; "Fail-open catch, always exit 0" for Codex / Antigravity). Precedent (`slop-scan.config.json:83-94` for the sibling opencode plugins, `:95-150` for the cross-host twin hooks) plus the ACTIVE knowledge row `fail-open-empty-catch-is-a-documented-contract-adding-console-error-triggers-defensive-error-swallowing` (empty catch must stay empty AND the file must sit in the overrides; "fixing" it with `console.error` trips `defensive.error-swallowing` instead) means the three new hook files need `defensive.empty-catch` (and likely `structure.duplicate-function-signatures`) override entries. Adding those entries changes the bkit-only `with` strings asserted byte-for-byte by `dogfood-templates.test.ts:371-385`. Without the overrides the slop gate reds; with them the dogfood test reds. Neither `slop-scan.config.json` nor `dogfood-templates.test.ts` is named in any task. Fix: add both files to Task 2/3 UPDATE lines with the override entries and the matching dogfood `with` strings.

## OPTIONAL

1. **Task 1 rewrites three existing assertions without naming them.** `preflight-sh.integration.test.ts:61-65`, `:79-84`, `:96-100` assert empty stdout on IDE / non-Linear sessions — direct contradictions of the new `TEST FIRST` tests in the same file. The Verification Plan "Test Synchronization" checkbox acknowledges the rewrite, but Task 1's DONE WHEN ("the existing preflight guard assertions still pass") reads against it, and testing.md's red-test rule ("a weakened, removed or rewritten assertion fails the build's verify") makes an unnamed rewrite risky. Recommend Task 1 explicitly name the three IDE-skip assertions it replaces.
2. **Codex matcher alternation is unverified.** The plan registers the Codex hook on `apply_patch|Bash`; every existing Codex matcher in `.bkit/shared/.codex/hooks.json` is single-value, and the OPEN deferral `codex-read-tier-gates-not-wired-file-read-tool-name-unverified` documents the trap of a registration that "installs, exits 0 and silently never fires". Recommend two single-matcher groups (the existing shape) or a test asserting the hook fires via the registered matcher, not only direct stdin spawns.
3. **Per-session dedup inherits the documented Codex host limit.** `rulesReadAdviceOnce(sessionId)` keys per session; the CLOSED failure `gateguard-subagent-shares-session-dedup` established that Claude-family subagents share the parent `session_id` and Codex payloads carry no subagent id — so a Codex subagent can miss the advisory the parent already consumed. Unavoidable on that host; recommend one line in the Task 4 `providers.md` update recording the dedup scope, mirroring the GateGuard note.
4. **Silent reliance on the `upgrade-skips-new-optin-host-files` fix.** The three new opt-in-host files reach existing consumers on `bkit upgrade` only because that CLOSED failure's remediation lets absent opt-in paths through. Worth an explicit acknowledgement in the plan (Pre-Flight or Task 3) so a future regression of that upgrade path is linked to this feature's delivery.
5. **No matrix row for the plan-added "no session id" edge case.** Plan Edge Case row "hook payload arrives with no session id" has no Derived Test Matrix row; the fail-open rows exercise it only indirectly. A one-line assertion in the Task 3 fail-open tests (unknown-session dedup still fires once) would close it.

## OUT OF SCOPE

1. **Live host-contract probes for the new hooks.** An `@live` row per host (real Claude/Cursor SessionStart, real opencode plugin load, agy CLI PreToolUse) would prove registration end-to-end the way the Antigravity envelope probe did. The repo's established tier for hook behaviour is the spawned-hook check and the plan follows it; raising the tier is a testing-strategy decision beyond this plan.
2. **Subagent-scoped advisory delivery (agent_id-keyed dedup).** Closing the Codex subagent gap needs a subagent id in that host's payload — a host capability change, not this plan's scope (same class as the deferred first-action deny gate, `700-first-action-deny-gate`).
3. **CHANGELOG entry.** The repo convention lands `Unreleased` entries per change (e.g. `69311d20` for #684), but no gate enforces it and it is release mechanics, not this plan's regression surface.
