Verdict: CONCERNS
Failures: 0

<!-- verdict:end -->

# Plan Verification

## Scope

Holistic (master split index + 3 sub-plans + cross-sub-plan integration).

## Sub-Plans Verified

3 of 3 — `141-cloud-app-plan-1.md` (Block 1, T1.1-T1.11), `141-cloud-app-plan-2.md` (Block 2+3, T2.1-T2.7 + T3.1), `141-cloud-app-plan-3.md` (Block 4, T4.1-T4.3) + master split index. Count matches the 3 sub-plan files. All 22 runbook tasks accounted for; 21 ticked `[x]`, 1 (`T1.11` advisories regen) `[ ]` by design (deferred end-of-session regen of a gitignored artifact). All per-sub-plan verifications PASS (build-plan-verify-1-1, -2-3 attempt 3, -3-1).

## Integration Gaps

3 non-blocking (all CONCERNS, none break cross-sub-plan cohesion). See Identified Gaps Log. The seven cross-cutting integration checks (marker chain, #184 single-source, cloud-split↔gate↔auth coherence, label consistency, D3/KN-30 consistency, consumer-ref scrub, tests+typecheck) all hold; the only consumer-ref hit (GAP-1) is pre-existing and not introduced by this PR.

## Previously Attempted

None for the holistic pass (first holistic attempt). Per-sub-plan history: sub-plan 2 went FAIL (2-1) → STANDARD remediate (gaps-remediate-2-1) → FAIL again (2-2, invalid `replace()`/false cross-surface identity) → PIVOT remediate (gaps-remediate-2-2) → PASS (2-3 attempt 3). Sub-plans 1 and 3 passed first attempt.

## Notes

Verified the WHOLE feature directly against `git diff origin/dev..HEAD`, the live files, `pnpm typecheck`, and full `pnpm test` — not from executor/verifier logs. The feature coheres end-to-end and discharges the master plan + FINAL SCOPE.

Cross-cutting integration checks (all PASS):

1. **`bkit [auto route]` marker chain end-to-end — PASS.** Producer token is the literal `" bkit [auto route]"` appended at `bkit-build.md:957/976` (close-workflow commit) and `bkit-debug.md:802/817/858` (mode-dependent: PR-mode close-workflow `:817`, local-mode create-pr `:858`). Consumer reads the SAME literal via `contains(github.event.workflow_run.head_commit.message, 'bkit [auto route]')` at `bkit-cloud.yml:100` (+ byte-identical template). The marked close-workflow commit is pushed to `feat/{FID}` as the loud HEAD (`bkit-build.md:980`); the subsequent `dev` status push carries `bkit [skip ci]` and is on `dev`, so the feat-branch HEAD that fires `workflow_run` remains the marked commit. D2 skip tags confirmed on worktree-setup (`:260`) + create-pr (`:925`). Chain closes.

2. **#184 shared HEAD-subject assertion single-sourced — PASS.** One home: `.agents/workflows.md` § "HEAD-Subject Assertion (shared, single source — #184)" (L928). `rules.md:58,64` + `docs/deployments.md:313` + `workflows.md:926` all POINT at it (no re-derivation). Build Gate 18 / Step 17 create-pr, debug Gate 12 / create-pr, ship Gate 5 + squash all invoke it. Deny-list treats `bkit [auto route]`/`[verbose ci]`/`[force build]` as legitimate (`workflows.md:529,539`). `deployments.md:324` registers `bkit [auto route]` as a non-suppressor.

3. **cloud=claude/cursor split integrates with gate/marker/auth — PASS.** `runCloudModule` branches `variant==="claude"`/`"cursor"` (`bkit-modules.ts:1958/2075`), writes single `cloudAgents` field (`:1999/:2075`), manifest split `CLOUD_MANIFEST_CLAUDE`/`_CURSOR` (`bkit-manifest.ts:219/224`). Symmetric tracker/cloud constraint (`bkit-install.ts:987-998`) runs BEFORE `dispatchModules` (`:1017`). App-auth is mutually consistent: `bkit-cloud.yml` = `ANTHROPIC_API_KEY` + `id-token: write` (OIDC App); `claude.yml` = `claude_code_oauth_token` + `id-token: write`, explicitly NOT `ANTHROPIC_API_KEY` (DECISION-A honoured). No `.agents/templates/**/claude.yml` (DECISION-B). Advisory flip + `@claude` trigger both assume the App (`bkit-modules.ts:2003-2015`).

4. **Label consistency — PASS.** `bkit:auto` is the SAME literal everywhere: two-tier gate in-job re-check (`bkit-cloud.yml:175`), both preflight hooks (templates + installed mirrors, `,bkit:auto,` guard), orchestrator (`bkit-cloud.md:145`), trackers.md (12 refs). No bare `Auto` label survives in any shipped artifact (`grep '\bAuto\b'` over templates/hooks/trackers returns only benign English: Auto-merge, Auto-trigger, migration prose).

5. **D3 concurrency restatement consistent with KN-30 + orchestrator — PASS.** `bkit-cloud.yml:73` `group: bkit-cloud-${{ inputs.issue || github.event.workflow_run.head_branch }}`; invalid `replace()` gone; comment (L58-72) accurately documents the payload-identity asymmetry and defers cross-boundary serialisation to the orchestrator stale-run guard + `status.json` lock. KN-30 (`knowledge.md:495`) D3-revised note says exactly the same; the mitigation is real (`bkit-cloud.md:145` runs the stale guard before dispatch). PIVOT was a legitimate correction of a structurally unsatisfiable criterion, not scope-shedding.

6. **Consumer-shipped issue-ref scrub — one pre-existing hit (GAP-1).** `bkit-cloud.yml` + its byte-identical template (manifest `byte-equal-text`, module `cloud` — IS shipped to consumers) carry `#119`/`#124`/`BAR-187` in comments. Confirmed PRE-EXISTING on origin/dev and NOT added/modified by this PR. Reported per prompt item 6. `claude.yml` and the migrated preflight hooks have zero issue refs.

7. **Tests + typecheck green — PASS.** `pnpm typecheck` clean. `pnpm test` (no turbo.json → full `pnpm test`): 29 files, 1064 passed, 2 skipped, 1 todo. Matches executor/per-sub-plan claims exactly.

Verdict CONCERNS (not FAIL): no blocking cross-cutting breakage. The three logged items are non-blocking — GAP-1 is pre-existing/out-of-introduced-scope, GAP-2 is a deferred regen of a gitignored (non-shipped-in-PR) artifact whose source is correct, GAP-3 is cosmetic prose. All addressable by a light gap-remediate pass before ship if desired; none block the combined #141+#184 squash.

## Identified Gaps Log

3 gaps (all CONCERNS, non-blocking) — see "Gap log entries" appended below.

- GAP-1: pre-existing internal issue refs (`#119`/`#124`/`BAR-187`) in consumer-shipped `bkit-cloud.yml` comments (not introduced by this PR).
- GAP-2: stale gitignored `.agents/advisories.md` (T1.11 deferred regen; source advisory correct; not in PR diff).
- GAP-3: cosmetic descriptive "Auto label" prose in `cloud.md:244` + template/mirror header line-8 drift; functional guard correct everywhere.

### Gap log entries (appended during verification)

GAP-1 (CONCERNS, pre-existing): consumer-shipped `bkit-cloud.yml` (+ byte-identical template, manifest 'byte-equal-text' module 'cloud') carries internal issue refs in comments — `#119` (L3), `BAR-187` (L78/L112), `#124` (L107). These PRE-EXIST on origin/dev and were NOT added/modified by this PR (verified via `git diff origin/dev..HEAD` and `git show origin/dev:...`). They are in code comments, not advisory strings. Violates the repo rule that consumer-shipped text must not cite #NNN/BAR-XXX/KN-XXX. Reported per prompt item 6 even though pre-existing, since this PR rewrites the file. Non-blocking: out of this feature's introduced scope; recommend a follow-up scrub of the shipped workflow comments.
GAP-2 (CONCERNS, deferred-by-design): T1.11 (`.agents/advisories.md` regen) is the only unchecked plan box. The working-tree `.agents/advisories.md` is STALE (still references bare `bkit install --cloud`, no `/install-github-app`/App-required/`bkit:auto`). MITIGATED: the file is gitignored/untracked (not in the PR diff, regenerated on every `bkit install`/`bkit check` from source) and the SOURCE advisory in `bkit-modules.ts:2003-2015` is correct (App required, /install-github-app, id-token, @claude /bkit-plan, no github.token framing). Recommend running the end-of-session regen before ship so `bkit check` reports no advisories drift.
GAP-3 (CONCERNS, cosmetic): `.agents/cloud.md:244` table cell still says 'Auto label' (descriptive prose) for `.cursor/hooks/preflight.sh`; the functional guard is migrated to `bkit:auto` everywhere. Descriptive drift only, no functional/shipped-label impact. Also noted in verify-3-1 (template/mirror header line-8 drift, outside markers). Optional tidy.
