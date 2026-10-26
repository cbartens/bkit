# Roadmap

<!-- bkit:roadmap-notes-pre start -->
## Notes

_(above the bkit list — yours, never overwritten)_
<!-- bkit:roadmap-notes-pre end -->

<!-- bkit:roadmap-status start -->
> Generated tables — do not hand-edit the `bkit` tables; append to `.bkit/issues.jsonl` instead (an `ABANDONED` row hides a FID from every section). `## Notes` blocks are yours and are never overwritten. Everything above the first marker is also yours. notes-post is last. Analysis list length: `package.json` key `bkit.prompts.roadmapNext` (positive integer; absent or invalid → 25).

> Related utilities, run on demand: `@bkit-utility-update-roadmap` ranks the next best items in `docs/roadmap.md`; `@bkit-utility-update-tracker` brings tracker issues in line with the tracker rules; `@bkit-utility-update-deferrals` and `@bkit-utility-update-failures` close ledger rows the code already resolved; `@bkit-utility-update-decisions`, `@bkit-utility-update-knowledge` and `@bkit-utility-update-documentation` correct ledgers and docs the code has since contradicted.

## bkit

_(refreshed 2026-10-26T22:49:33Z)_

### Design

<!-- prettier-ignore -->
| FID | Title | Last-transition (ts) |
| --- | --- | --- |
| 80-audit-workflow | 80-audit-workflow | 1785311294164 |

### Plan

<!-- prettier-ignore -->
| FID | Title | Last-transition (ts) |
| --- | --- | --- |
| 504-example-project | 504-example-project | 1791870640742 |
| 651-sops-env-backup | 651-sops-env-backup | 1792633642892 |
| 699-engine-run-completeness | 699-engine-run-completeness | 1793002326175 |
| 701-engine-work-build | 701-engine-work-build | 1793002272742 |

### Build

<!-- prettier-ignore -->
| FID | Title | Last-transition (ts) |
| --- | --- | --- |
| 650-workflows-prompt-alone | 650-workflows-prompt-alone | 1792720143991 |

### Debug

_(none)_

### Shipped _(last 10)_

<!-- prettier-ignore -->
| FID | Title | Last-transition (ts) |
| --- | --- | --- |
| 700-session-start-nudge | 700-session-start-nudge | 1793054973314 |
| 380-roadmap-analysis-refresh | Roadmap ledger, two-tier generated board, fold + cadence + on-demand utility | 1787868628424 |
| 342-injection-hardening | Prompt-injection hardening | 1787201470000 |
| 363-widen-bkit-cloud-trigger | Widen bkit-cloud trigger to post-merge dev CI | 1785451674356 |
| 384-ship-bookkeeping | Ship bookkeeping mutated the validated PR head | 1785303519000 |
| completed-ship-bookkeeping-path-a-b-with-tiered-quality-carriers-38-b1b1268 | Ship bookkeeping Path A/B with tiered quality carriers — #384 | 1785283200000 |
| 341-three-runtimes | Workflows run in all runtimes — local, GH Actions, claude.ai | 1785220571000 |
| completed-three-runtimes-workflow-execution-341 | Three-runtimes workflow execution — #341 | 1785196800000 |
| 58-workflow-counters | Workflow counters read decision variables from status.jsonl | 1784704423000 |
| 234-telemetry-jsonl | Unified telemetry jsonl — stats, friction, deferrals, failures, harvest | 1784092348000 |
<!-- bkit:roadmap-status end -->

<!-- bkit:roadmap-analysis start -->
_Analysis refreshed 2026-10-14. Board fold 2026-10-14T03:52:45Z. Inputs: in-flight FIDs `504-example-project` (Plan) and `80-audit-workflow` (Design); 81 open deferrals and 8 open failures, none above `MEDIUM`; 59 open tracker issues across 7 milestones; 3 audit reports for 33 templates, leaving 32 audits due. Tracker reads ran through the `gh` CLI fallback because the GitHub MCP tools are absent from this host — the same silent-empty class as failure `github-mcp-search-issues-silently-returns-zero-private-repo`._

## Next Containers

- **Milestone — #7 Audits & Maintenance** (26 open). Relevant children startable now: #345 failures triage, #344 deferrals triage, #477 security audit, #494 agent audit, #481 flake triage, #483 repo audit, #482 dependency triage, #466 issue prioritisation, #343 consumer harvesting. Priority: largest open cluster; 30 of 33 audit templates have never run over a repo carrying 81 open deferrals and 8 open failures.
- **Umbrella — #402 Audit engine: orchestrator, conditional lenses, contracts** (`bkit:design`). Relevant children: A1 (conditional-lens keystone) first, then A2, A3, A4, A5, A6, A7; the `402-*` deferrals ride along. Priority: the engine gates every audit run; its design PASSed 2026-05-31 and needs the Pass-4 contract refresh named in its body before `/bkit-plan`.

## Next Items

1. **Build `504-example-project`** (board FID at Plan). The plan carries PASS plus scope checks, so build starts now; build's convert step rewrites it into task blocks. It lands the demo and the workflow benchmark, and launch items #505 and #535 rest on it. `/bkit-build`. opus tier.
2. **Plan `80-audit-workflow`** (board FID at Design). Design closed as DESIGNED. Run the Pass-4 contract refresh from #402 first (`.agents/` to `.bkit/`, `status.json` to `status.jsonl`, the A1-A7 re-cut, version target), then plan. It unblocks all 32 due audits. `/bkit-plan`. opus tier.
3. **Fix failure `steps-placeholder-gate-false-positive-on-derived-issue-dump`** (`MEDIUM`, tooling). The `steps finish` placeholder gate fires on the derived `related-issues.md` dump, and it fired inside the active 504 cycle. Bounded fix: exempt `--optional-artifact` context dumps from the placeholder scan. `/bkit-debug`. sonnet tier.
4. **Close the MCP tracker-read gap** — failure `github-mcp-search-issues-silently-returns-zero-private-repo` (`TRIAGED`, `MEDIUM`) plus deferrals `tracker-read-path-corroboration-outside-mcp-private-repo` and `shell-native-mcp-cli-bridge-real-exit-codes`. A clean `0` from an MCP read passes as authoritative, which drops related-issue context from every private-repo design. `/bkit-build`. opus tier.
5. **Audit `bkit-audit-agents`** (#494) — never run, monthly cadence. It covers the permission, hook and tool-server surface across all five hosts, which is where the open security deferrals sit. `@bkit-audit-generate`. opus tier.
6. **Audit `bkit-audit-security`** (#477) — never run, monthly cadence. Auth, secrets, validation and the untrusted-content boundary. `@bkit-audit-generate`. opus tier.
7. **Audit `bkit-audit-failures`** (#345) — never run. It re-verifies the 8 open failure entities, four of them `MEDIUM`. `@bkit-audit-generate`. opus tier.
8. **Fix failure `ship-cloud-failure-path-after-merge-has-no-publish-channel`** (`MEDIUM`). A ship Failure Path entered after the merge has no publish channel on a cloud runtime, so FAILED bookkeeping can land nowhere. `/bkit-debug`. sonnet tier.
9. **Add the ledger-integrity validators** — failure `telemetry-validate-does-not-enforce-ts-mint-or-duplicate-line-invariants` (`MEDIUM`) plus `block-locality-audit-quote-mask-pairs-comment-apostrophe-across-lines` (`LOW`). Both are bounded validator and selector fixes that stop silent ledger and audit drift. `/bkit-build`. sonnet tier.
10. **Fix the flake and timeout cluster** — failures `install-upgrade-integration-tests-flake-on-default-5s-timeout` (`MEDIUM`), `subprocess-integration-tests-time-out-at-5000ms-under-high-load` (`LOW`) and `release-workflow-tarball-test-intermittent-under-full-suite` (`LOW`). One root cause: default 5s / 10s hook timeouts under load. `/bkit-debug`. sonnet tier.
11. **Settle the host egress and permission allowlist cluster** — the eight `381-*` deferrals (`381-opencode-bash-grants-never-revoked`, `381-opencode-curl-glob-substring-bypass`, `381-webfetch-grants-survive-uninstall-after-seed-emptied`, `381-provider-registry-key-mirror-consolidation`, `381-cloud-allowlist-staleness-detector`, `381-upgrade-does-not-write-advisories-artifact`, `381-unified-runtime-allowlist-artifact-all-hosts`, `381-cursor-hook-ask-rate-signal`), plus `opencode-has-no-script-hook-so-two-gates-are-inexpressible-there` and `codex-read-tier-gates-not-wired-file-read-tool-name-unverified`. Host security posture needs one design before code. `/bkit-design`. opus tier.
12. **Repair the run-boundary accounting** — deferrals `58-status-jsonl-run-boundary-keys-on-last-run-overall` (`MEDIUM`, correctness), `58-debug-run-tests-parentsha-advances-only-transitively` and `58-counter-row-countername-value-pairing-unverified`. An interleaved debug run can reset a resuming build attempt budget. `/bkit-build`. sonnet tier.
13. **Verify the host close paths live** — deferrals `341-live-run-verification-mode-1-and-mode-3` (`MEDIUM`) and `384-mode-3-bookkeeping-e2e-deferred-to-341-live-run` (`TRIAGED`). No real design or plan close has run on a laptop (mode 1) or a cloud session (mode 3) since the close path changed. `/bkit-build`. sonnet tier.
14. **Extend and promote the status-hole detector** — deferral `442-status-hole-detector-beyond-ship` (`MEDIUM`) plus `384-promote-status-hole-detector-from-advisory-to-gate`. Today the detector covers ship as an advisory only. `/bkit-build`. sonnet tier.
15. **Define a per-workflow rollback path** — deferral `per-workflow-rollback-path-for-shipped-bkit-workflow-changes` (`MEDIUM`). Consumers pin `@cbartens/bkit` and hold no per-workflow revert. `/bkit-design`. opus tier.
16. **Restore the main-branch cloud trigger** — deferral `363-main-branch-trigger-excluded-reversal` (`MEDIUM`). The current filter drops `main`, a reversal of the #363 decision. `/bkit-build`. sonnet tier.
17. **Adopt release-PR mirror mode in bkit CI** — deferral `528-release-pr-mirror-not-adopted-in-bkit-own-ci` (`MEDIUM`). A promotion PR can reuse the dev push run. `/bkit-build`. sonnet tier.
18. **Settle bkit-cloud concurrency** — deferrals `397-dual-agent-same-run-double-ship-when-both-secrets-set` (`MEDIUM`) and `397-ship-lane-reconciler-for-depth-1-queue-eviction` (`MEDIUM`), with tracker #397. Two set secrets launch two agents against one PR. `/bkit-design`. opus tier.
19. **Unify the PR-based phase close** — deferral `uniform-pr-based-phase-close-all-runtimes` (`TRIAGED`, `MEDIUM`). Close behaviour still differs by runtime. `/bkit-design`. opus tier.
20. **Bring repo protection and tracker hygiene to parity** — deferrals `pending-enable-main-branch-protection-ruleset-on-cbartens-bkit` (`MEDIUM`) and `384-required-status-checks-on-dev-via-bkit-protect-main` (`MEDIUM`), plus `create-security-github-label-for-injection-hardening`. `/bkit-build` for the protection work; the label takes the `lite:build` lite workflow. sonnet tier.
21. **Write the hand-authored-agent threat model** — deferral `untrusted-input-threat-model-hand-authored-utility-agents` (`MEDIUM`). The #342 hardening covers workflow agents; utility agents hold no model. `/bkit-design`. opus tier.
22. **Pin the capability-register determinism** — deferral `444-capability-register-gate-ubuntu-determinism` (`MEDIUM`) plus `444-capability-register-pr-time-enforcement`. The macOS-built register needs a Linux comparison before the gate blocks. `/bkit-build`. sonnet tier.
23. **Amend the workflow scaffold follow-ons** — six `442-*` deferrals: build-challenge width, unconditional `build-plan-current`, debug and ship step counts, the scale dial, the design ideate predicates and the plan-template fallback; `442-plan-complexity-check-predicate` names a plan step that does not exist and closes. `/bkit-build`. sonnet tier.
24. **Land the workflow-optimisation trackers** — #546 Knowledge store ledger upgrade and #543 bkit tips at workflow close. Both change workflow surfaces. `/bkit-design`. opus tier.
25. **Drain the legacy install and upgrade backlog** — the 15 `pending-*` deferrals (factory reset, three-way merge UI, staging primitives, router dead-letter retry, bar-155 items, Cursor schema, upgrade prune flag, decoration removal, CI lint guard, Renovate local json5, script naming, soak cap, per-PR opt-in, bkitignore drift). `/bkit-build`. sonnet tier.

## Groupings

- **504 cycle** — item 1 with the nine `504-*` follow-ons (before-vs-after, local diff, replay viewer, your-repo report, additional apps, how-this-was-built, second example, time saved, external suite) and `504-install-advisory-when-tracker-is-none`. One plan owns the fixture, so the follow-ons ship or defer as a set.
- **Audit engine** — item 2 with the six `402-*` deferrals and `conditional-lens-vocabulary-alignment-across-workflow-and-audit`. Items 5, 6 and 7 run on the same `@bkit-audit-generate` pipeline and share one report month, so they batch.
- **Security boundary** — items 4, 11, 20 and 21. Tracker reads, host permissions, repo protection and the utility-agent threat model form one surface; one design settles 11 and 21.
- **Bookkeeping integrity** — items 3, 8, 9, 12 and 14. All five read or write `status.jsonl` and the ledgers; land them together to keep the fold consistent.
- **Cloud dispatch and close** — items 16, 17, 18 and 19. The bkit-cloud trigger, promotion mirror, ship lock and phase close share one code path.
- **Infra hygiene** — items 20, 22 and 25. Branch rules, the capability register and the `pending-*` backlog all touch CI or the install surface.
<!-- bkit:roadmap-analysis end -->

<!-- bkit:roadmap-notes-post start -->
## Notes

_(end of the board — yours, never overwritten)_
<!-- bkit:roadmap-notes-post end -->
