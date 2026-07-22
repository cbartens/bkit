Verdict: CONCERNS
Failures: 1

<!-- verdict:end -->

# Plan Review

Lens: Regression risk, design-coverage.

## Surface-Area Map

Per-task touched surface and its consumers (verified against live source, not plan prose):

- **T1 — `docs/plans/template.md` (+ `.bkit/templates/` mirror + `:575` repo copy).** Shipped-to-every-consumer surface (macOS path). Consumers: every `bkit install`/`upgrade`. Contained (string removal); guarded by row 11.
- **T2 — `.bkit/workflows/bkit-auto.md` FID resolution (`:86-87` reject deleted, `:93-112` marker hoisted).** Consumers: mode-2 CI (`bkit-cloud.yml`), every `bkit-auto` invocation. **High blast radius** — deletes a hard-reject the existing mode-1/2 `feat/` path relies on. Verified `MODE=CI|BRIEF` collision at `bkit-auto.md:70-84` is real (confirms the D1 `RUNTIME`-not-`MODE` naming mandate).
- **T3 — [NEW] `.bkit/scripts/bkit-runtime.sh` (+ template).** Shared utility sourced by all 6 workflows — **highest-risk shared surface**. `.bkit/version` `canonicalHashes` must gain the shim (verified counter-bus pair is tracked at `:64-65`). `RUNTIME` token census confirmed clean (`.bkit` has only `RUNTIME_LOGS` in debug + `# RUNTIME GATING` comment in `bkit-cloud.yml` — no bare-`RUNTIME` collision). Consumers: every phase Step 1. Covered by bats rows 1-4.
- **T4 — `.mcp.json` + `.bkit/templates/.mcp.json` (`X-MCP-Toolsets` gains `actions`).** Behaviour change on `dev`, all modes (adds MCP tools). Additive. Byte-identity guarded by row 10.
- **T5 — `.claude/hooks/cloud-bootstrap.sh` (+ template).** Verified **cloud-only** (`CLAUDE_CODE_REMOTE != true → exit 0` at `:26`), so mode-1/2 laptop sessions are NOT touched. SessionStart hooks cannot block (`:13-15`). Consumers: every mode-3 session start. Covered by bats row 13.
- **T6 — `.agents/rules.md` (bkit:start/end block + template mirror).** Invariant surface reaching all 6 workflows. Prose-only; guarded by rules-sync + row 15 presence + live.
- **T7 — `bkit_wait_ci` extraction from the CI-Dispatch Gate shared kernel in `bkit-build.md` + `bkit-debug.md` (confirmed present in both) + `bkit-ci-dispatch-gate-alignment.test.ts` (exists).** **High-risk**: the extracted kernel is the #261/KN-11 CI-dispatch enforcement. Byte-identity guarded by row 6; timeout cap by row 5.
- **T8 — Step 2 of all five phase workflows (13 coupled sites, one commit — D7).** **Highest structural blast radius**; partial landing breaks every step in adopt mode. Consumers: all phases mode 1/2/3. Only row-4 (WORKTREE_PATH) + row-15 presence + live cover it.
- **T9 — [NEW] close-guard helpers in the shim (D23/D24/D25) + `docs/deployments.md` dependency.** Transport-agnostic guards over real git + `status.jsonl`. This is the automated mitigation for the design's biggest accepted risk (mode-1 never exercises mode-3). Covered by bats rows 7-9.
- **T10/T11 — `bkit-build.md`/`bkit-debug.md` (shape B) + `bkit-ship.md` (shape C, dev-sync block gated).** Verified `bkit-ship.md` `git push origin dev` at `:840` and `core.bare` flip at `:816` (unconditional, Risk 8 kept). Serialise vs T7 (shared files). Inherit rows 7-9 + live.
- **T12 — `[skip ci]` removal from close + intermediate status-commit subjects across `.bkit/workflows/*.md`.** See CRITICAL below — under-enumerated coupled sites.
- **T13 — shape-A close (`bkit-design.md`/`bkit-plan.md` close) + STRAY guard.** OQ-A-gated (D5(a) PR-close vs D5 push_files). Covered by rows 7/12 + live.
- **T14 — gh→MCP fallback lane (prose in headers, §6c map under C1 names).** Consumers: mode-3 gh-outage path. Prose + row-8 (D25) + live.
- **T15 — `bkit-worktree-{prune,sync}.md`, `.agents/config.md` debug egress, Playwright seam.** Peripheral gating; live + build-resolved.
- **T16 — prose audit (`bkit-runtime-prose-audit.test.ts`) + mirror regen + @live-manual runs.** Terminal; row 14 (@live, no CI harness) + row 15.

Design-coverage: the settled design (`docs/plans/202607/341-three-runtimes-design.md`) sections all map to tasks T1-T16 (shim, rules, headers, mcp, cloud-bootstrap, close shapes A/B/C, fallback, peripherals, D20 path, FID). Spikes A/B/C correctly folded (not re-planned). Declared non-goals parked in `Out of Scope` with ledger mirrors. No touched design surface is silently dropped.

## CRITICAL

1. **T12 under-enumerates the coupled sites of the load-bearing `[skip ci]` convention — no test asserts the dependent ship-side gates still function (regression + design-coverage gap).**
   The `[skip ci]` tokens on the docs-only close subjects are intentional and load-bearing, and several ship-side mechanisms are built ON that convention. Verified in live source:
   - `bkit-ship.md:682` gate — `HEAD on remote does NOT contain 'bkit [skip ci]'`.
   - `bkit-ship.md:833` — `AHEAD_NON_SKIP` promotion-lag counter counts dev commits _without_ `[skip ci]`.
   - Checklist items `bkit-design.md:853` / `bkit-plan.md:913` — `Changes merged to 'dev' and pushed with 'bkit [skip ci]'`.
   - The `bkit-tests-scope` planner treats `[skip ci]` → `run_level=none`; a docs-only close _with the token removed_ becomes a direct-dev-push → **full CI on a docs-only change, every design and every plan close, in ALL modes.**

   T12's scope ("remove `[skip ci]` from close + intermediate status-commit subjects") and its only test (row 12: assert the tokens are _absent_ from subjects) cover the removal but NOT the coherence of these dependents. Removing the token silently (a) turns `:682` into a trivial always-pass, (b) reclassifies design/plan DONE commits as `AHEAD_NON_SKIP` (changes the promotion-lag warning), (c) leaves `:853`/`:913` checklist prose contradicting the code, and (d) starts firing full CI on every docs-only close. This is exactly the D7 "coupled-sites larger than named" lesson the design itself raised — reproduced for the skip-ci convention rather than the worktree convention. Before this lands, T12 must (i) enumerate every site that references the `[skip ci]` docs-close convention (`:682`, `:833`, `:853`, `:913`, and the intermediate `chore(...) [skip ci]` subjects at `bkit-plan.md:740`, `bkit-design.md:567`, `bkit-build.md:349`, `bkit-ship.md:261/579/1178`), (ii) decide explicitly whether docs-only closes SHOULD now fire CI (a knowing cost reversal, human-gated like the D11 sleep reversal), and (iii) add an assertion (or update row 12) that the ship-side promotion-lag / HEAD-skip-ci gates still hold their intended meaning under the new subject convention. Note this re-enters the KN-11 / KN-20 skip-ci surface: the plan acknowledges the D1 _body_ aetiology (D24 body-scan is well-covered) but does not acknowledge that the _intentional_ skip-ci on docs-close subjects is the counterpart mechanism KN-11's fix relied on.

## OPTIONAL

- **Sleep census is stale — re-take at build and scope row 15 correctly.** T7 says "replace 7 sleeps / 4 constructs" and "delete `bkit-ship.md:556` `sleep 30`", but live source has **12** `sleep` occurrences across 5 workflow files (`bkit-ship.md` alone has 4: `:75 sleep 5`, `:573 sleep 10`, `:823 sleep 10`, `:1102 sleep 10` — there is no `sleep 30` at `:556`). Row-15's audit ("every foreground `sleep` sits under the CI-wait rule") will false-fail on legitimate backoff sleeps unless it distinguishes CI-wait polls from retry/backoff sleeps — otherwise the audit either blocks valid sleeps or gets weakened to pass (a hollow gate). Re-census before authoring T7; make row 15 assert CI-wait sleeps only.
- **cloud-bootstrap "dual-lane abort" (T5/C2) is informational-only in the hook.** SessionStart hooks cannot block (`cloud-bootstrap.sh:13-15`), so the row-13 "aborts when neither gh nor MCP can authenticate" assertion must test a loud non-blocking signal, and the _enforcing_ abort must live in the workflow Step-1 preflight, not the hook. Make the layer explicit so the plan does not imply the hook hard-stops the session.
- **T2 (FID reorder) and T8 (13 coupled sites) touch the mode-1/2 path with prose-presence + manual-live coverage only.** This is bkit's honest limit (workflow prose is not unit-testable), but these are the two highest-blast-radius edits to the _existing_ path. If a thin bats/unit harness can assert `bkit-auto` FID resolution for a non-`feat/` branch vs a `feat/` branch (the reorder's regression surface), it would convert row-14's manual guard into an automated one for the single highest-risk backwards-compat boundary.
- **Refresh stale line references before editing.** Several plan anchors no longer match source (`bkit-ship.md:556`, `:733-751`, `:746`, `:806` cited; actual `git push origin dev` is `:840`, `core.bare` flip `:816`). Re-locate at build so edits don't target the wrong lines.

## OUT OF SCOPE

- **shellcheck gate over `.bkit/scripts/*.sh`** (`docs/deferrals.jsonl` `58-no-shellcheck-gate-over-bkit-scripts`, and this plan's own Suggested Scope Expansion). The new `bkit-runtime.sh` ships un-shellchecked like its siblings; a static `shellcheck -s sh` lane would cover the shim. Correctly left as a candidate — do not fold without human sign-off.
- **OQ5 periodic transport-fallback frequency analysis** — already deferred (`docs/deferrals.jsonl` `341-periodic-transport-fallback-frequency-analysis`); D25 gives the rows a mechanical reader inside Close Workflow, which is the part in scope.
- **Root-cause of MCP `search_issues` zero-on-private-repo** — logged (`docs/failures.jsonl`); a diagnosis task, not an operability property of this change. The plan correctly corroborates via `gh` (see `related-issues.md`) rather than trusting the silent zero.
