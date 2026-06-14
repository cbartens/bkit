# Design Brainstorm & Ideas

Lens: Structural-minimalism — fewest new moving parts, lowest regression surface, maximum invariant reuse.

---

## Approach A — Poll-then-heal gate inlined at push site, Failure Path suppression lifted ⭐ Recommended

**Summary:** Add a single, self-contained bash block ("CI-Dispatched gate") immediately after every final loud push (`git push`) in build Step 18, debug Step 10 (both PR-mode and LOCAL-mode push sub-steps), and ship's post-merge block. The gate polls `statusCheckRollup` (PR flows) or `gh run list` (ship post-merge) for a dispatched run containing a `bkit-decide` job; if none appears within ~60s it pushes one clean `re-trigger` empty commit and polls once more; if still nothing it concludes "no CI for this event" and logs a no-op. Independently, the Failure Path (build line 95-96, debug line 96) is changed so it does NOT push `bkit [skip ci]` onto any branch that already has an open PR — it leaves the previous HEAD in place and commits the abort doc to the abort branch locally only, not to remote.

**Complexity:** MEDIUM. Two distinct changes: (1) the gate block, (2) the Failure Path conditional. The gate block is ~30 lines of inline bash repeated at three push sites (build close, debug close/create-pr, ship post-merge). No new files, no new state keys beyond what status.jsonl already captures.

**Extensibility:** The gate is a pure observer of the GitHub-side signal (`statusCheckRollup`, `gh run list`). It works for any future workflow that ends with a loud push. The no-CI consumer path (self-heal dispatches nothing) falls through silently, so adding a CI workflow later requires no gate change. The `bkit-decide` job name is the discriminator — if that job is ever renamed, one grep pattern changes in one place per workflow.

**Risk:**

- The poll adds up to ~120s (6×10s initial + 6×10s after re-trigger) to every close-workflow on repos with slow GitHub webhook fanout. On fast repos this collapses to one or two iterations.
- The re-trigger commit must carry `bkit [auto route]` when `AUTO_ROUTE_SUFFIX` is set — if the commit message is assembled before `AUTO_ROUTE_SUFFIX` is resolved, the marker is dropped and the cloud auto-router misses the event. Mitigation: the re-trigger commit is emitted inside the same shell block that already holds `AUTO_ROUTE_SUFFIX`, so it can copy the suffix verbatim.
- On the Failure Path side, the "leave HEAD in place" logic requires a `gh pr list` call before the abort commit to decide whether an open PR exists. This call can fail if the token scope is narrow; the gate must treat a failed check as "no PR" (safe fallback: the current behaviour, a `[skip ci]` push, is the worse outcome).
- EC-3 (interrupted build between Step 17 and Step 18) is NOT fixed by this approach; it becomes less catastrophic because the gate's self-heal re-trigger recovers it without human intervention.

**Maintenance:** The gate bash block is copy-pasted verbatim across three workflow files (build, debug, ship). Any future change to the poll logic or job-name discriminator must be applied identically to all three. This is friction identical to the existing HEAD-Subject Assertion, which already uses this multi-copy discipline. The authoring constraint ("align shared lines across ALL workflows, reuse closest existing phrasing verbatim") is satisfied by treating the gate block as a named shared snippet that must stay byte-identical across sites.

**Friction vs ideal:**

- Migration cost: LOW. The gate is additive — no existing step is removed or reordered.
- Surfaces touched: build close-workflow block, debug close-workflow + create-pr (LOCAL-mode) push block, ship post-merge block, Failure Path block (build line 95-96, debug line 96), `deployments.md` § "CI trigger on final workflow push" (KN-11 annotation + gate contract description), `docs/knowledge.md` (KN-11 update, new KN entry for gate design). Mirror re-render: `.claude/`, `.cursor/`, `.opencode/` after editing `.bkit/workflows/`.
- EC-1 (build lacks PR-exists detection) is NOT addressed here — build still unconditionally calls `gh pr create`; the retry-then-Failure-Path path on create failure is unchanged. EC-1 is descoped because fixing it D2-safely requires the approach in Approach B/C.
- D2 constraint: SATISFIED. The gate fires after the final loud push, adds no mid-build synchronize, and the re-trigger commit is emitted at the same position in the commit graph as the existing close-workflow commit would occupy if it were the trigger.

---

## Approach B — Build PUSH_MODE detection parity + gate, eliminating EC-1 and EC-2 together

**Summary:** Port debug's `PUSH_MODE` / `EXISTING_PR` detection (debug Step 1, line 172-174) into build Step 17, immediately before `gh pr create`. If an open PR already exists for `feat/{FID}` against `dev`, set `PUSH_MODE=PR` and skip PR creation entirely — the close-workflow commit in Step 18 becomes the synchronize event that triggers CI (which is exactly what already happens when build is resumed on a branch that already had a PR from a prior run and the prior run succeeded). The Failure Path no-push-on-open-PR rule (EC-2) is added identically to Approach A. The CI-Dispatched gate from Approach A is added at the final push site as well. This addresses EC-1 + EC-2 + the gate in one plan.

**Complexity:** HIGH. The `PUSH_MODE` variable is used to branch the Step 17 sub-flow (create PR vs skip) and must be threaded through to Step 18 (the close-workflow block already uses it implicitly via the single final push, but the checklist assertions and status.jsonl artifact recording differ between "created new PR" and "pushed to existing PR"). Additionally, build's Step 17 currently does not extract `PR_NUMBER` from an existing PR — that extraction must be added so the CI-Dispatched gate can query `statusCheckRollup` with the right PR number. Debug's PUSH_MODE block was designed when `PR_NUMBER` was in scope from Step 1; build must synthesize it at Step 17.

**Extensibility:** This aligns build and debug on a shared branch/PR contract, so future changes to PR management need only one mental model. The `PUSH_MODE` state can be recorded in status.jsonl for observability. A future "ship from existing PR" path is cleaner if build reliably carries `PR_NUMBER` throughout.

**Risk:**

- The most significant risk is the D2 mid-build synchronize: if `PUSH_MODE=PR` and the close-workflow push lands while a prior CI run is still queued (e.g. from the `summary` commit push in a broken prior run), the `pull_request: synchronize` fires the cloud auto-router while the new close-workflow run is starting. The D2 concurrency group (`bkit-auto-{issue}` for dispatch, `bkit-auto-{head_branch}` for CI-completion) means a stale dispatched run and a fresh CI-triggered run can coexist under different concurrency groups. This is the D3 race that KN-30 documents. Mitigation: the existing stale-run guard in `bkit-cloud.yml` is supposed to handle this, but KN-30 confirms D3 is a "latent race" not yet hardened.
- If `gh pr list` returns an unexpected number (e.g. a draft PR) the flow silently skips create and may push to a draft PR. Need to filter `--state open` and `--draft false`.
- Build checklist assertions must be updated — the existing assertion "If `gh pr create` fails" becomes "If `PUSH_MODE=PR`, assert `PR_NUMBER` extracted; else..." adding branching complexity to an already long checklist.

**Maintenance:** Two codepaths through build Step 17 (create-new PR vs detect-existing PR) must both be tested and maintained. The phrasing diverges from debug's Step 1 because build's detection happens at a different point in the workflow (after the large body of work is done, not at setup). Future authors editing the create-PR flow must remember to check both branches.

**Friction vs ideal:**

- Migration cost: MEDIUM-HIGH. Step 17 is restructured; checklist is extended; `PR_NUMBER` must be available in scope for Step 18's gate.
- D2 risk: present but manageable if the stale-run guard in `bkit-cloud.yml` is confirmed to handle the D3 race before this ships. That confirmation is a prerequisite, not an assumption.
- Ideal shape: build and debug are symmetric on branch/PR management. This approach moves toward that ideal but takes on D3 risk as the cost.

---

## Approach C — Gate-only with EC-2 suppression and explicit EC-1 Failure Path escalation (conservative subset)

**Summary:** Implement only the CI-Dispatched gate (identical to Approach A) and the Failure Path no-push-on-open-PR rule (EC-2 fix). For EC-1, instead of silently avoiding the problem, add an explicit pre-flight check at the start of build Step 17: `gh pr list --head {branch} --base dev --json number --jq '.[0].number'`; if a PR already exists, immediately go to Failure Path with a clear message ("PR already exists for this branch — resume is not supported without the branch-PR alignment fix; run bkit-debug on the existing PR or close it and re-run build"). This makes EC-1 visible and fail-fast instead of silently erroring on `gh pr create` and falling through a retry to an undocumented Failure Path.

**Complexity:** LOW for the gate and EC-2 fix (same as Approach A). VERY LOW for the EC-1 pre-flight (adds one `gh pr list` call and a conditional Failure Path exit). No new PUSH_MODE branching, no new state variables.

**Extensibility:** The EC-1 pre-flight is a placeholder — it documents the gap without closing it. It is intended to be replaced by Approach B in a follow-up. The gate is identical to Approach A and equally extensible.

**Risk:**

- EC-1 is now a hard Failure Path exit instead of a silent create-error-then-retry. This is a UX regression for the (currently broken) re-run case: the user previously got a confusing retry failure; now they get a clear message. Net: better failure UX but still requires human intervention to resume.
- The EC-1 pre-flight adds a GitHub API call at Step 17 entry. If the token lacks `repo` scope, `gh pr list` can return empty (no error), causing the pre-flight to silently skip and fall through to the existing blind `gh pr create` — same as today. Mitigation: treat `gh pr list` failure as "unknown, proceed with caution" and add `|| echo "WARN: pr list failed, proceeding"` with a comment.
- The gate's self-heal re-trigger (Approach A risk) applies here identically.

**Maintenance:** This is the smallest diff. The EC-1 pre-flight is one conditional and one error message. The gate block is copy-pasted at three sites identically to Approach A. Total new text across all workflow files is roughly 60-80 lines. The EC-1 pre-flight is deliberately marked as a "TODO: replace with full PUSH_MODE detection when #261-ec1 is scoped."

**Friction vs ideal:**

- Migration cost: LOWEST of all three approaches.
- EC-1 is not fixed, only surfaced cleanly. The ideal shape (full build/debug parity) is deferred.
- D2 constraint: SATISFIED. No new loud pushes inside the build body; the gate is post-push-only; EC-2 fix removes the one `[skip ci]` synchronize that was firing on abort.
- Surfaces touched: identical to Approach A minus any build Step 17 restructuring. Fewer lines changed in build than Approach A (one new conditional at Step 17 entry vs Approach A's zero change to Step 17).

---

## Decisions

| Decided                                                                                                           | Alternatives                                                    | Why                                                                                                                                                                                                                      |
| ----------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Gate fires post-final-push only, not at intermediate steps                                                        | Gate at create-pr, gate at every push                           | Mid-push gating violates D2; intermediate commits are intentionally silent                                                                                                                                               |
| Poll `statusCheckRollup` (PR flows) / `gh run list` (ship) for `bkit-decide` job presence, not mere run existence | Poll for any run; poll for `bkit-tests` job; poll by commit SHA | `bkit-decide` is the entry job guaranteed to appear first; polling for `bkit-tests` adds latency; any-run risks false-positive from manual dispatch                                                                      |
| Self-heal cap = 1 re-trigger commit                                                                               | 0 (no self-heal), 2+ retries                                    | 0 = no recovery; 2+ = risk of commit graph noise; 1 is the discriminator between "suppressed" and "no CI"                                                                                                                |
| Re-trigger commit carries `AUTO_ROUTE_SUFFIX` from enclosing shell scope                                          | Re-trigger always clean, re-trigger always has auto-route       | Must match close-workflow's marker treatment to preserve the D2 auto-route invariant                                                                                                                                     |
| Failure Path: leave remote HEAD if open PR exists, skip remote push                                               | Always push abort commit                                        | Pushing `[skip ci]` HEAD onto an open PR is the confirmed EC-2 failure mode; leaving the prior HEAD is safe and silent                                                                                                   |
| EC-1 full PUSH_MODE parity is deferred (Approach A/C) or optional (Approach B)                                    | Fix EC-1 in the same plan                                       | EC-1 fix risks D3 regression; the gate (Approach A) independently recovers from EC-1-induced states via self-heal                                                                                                        |
| deployments.md § "CI trigger" and KN-11 updated in lockstep with workflow edits                                   | Update docs separately                                          | Authoring constraint requires lockstep; KN-11 now includes the gate as the "fix" rather than just the HEAD-Subject Assertion                                                                                             |
| Mirror re-render after every workflow edit                                                                        | Re-render at session end                                        | Auto-memory: "no per-edit bkit install in subagent prompts" — defer to orchestrator, but the constraint is on subagent prompts, not the plan step itself; the plan step should note re-render as a required final action |
