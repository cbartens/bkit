<!-- bkit:start -->

# Friction

> [!CAUTION]
> **Purpose:** Friction log — moments where orchestrator or subagents needed human action, rework, or recovery. Drives prompt and guardrail refinement.
> **Categories:** `human-confirm | permission-prompt | agent-rework | manual-install | tool-failure | destructive-backout | other`.
>
> **Rules:**
>
> - Token-efficient dense phrasing; agent readers only.
> - Before writing, cross-check `.agents/docs.md` — verify topic does NOT belong in other doc.
> - Append-only at EOF, do NOT overwrite.
> - Once written, ONLY edit `Recovery` / `Status` as required; NEVER edit `Description` / `Suggested fix`.
>
> **Format:**
>
> ```markdown
> ## {Title} (YYYY-MM-DD)
>
> - **Category:** {one of above}
> - **Workflow:** design | plan | build | debug | ship
> - **Step:** {N} — {Step Name} (or `orchestrator` if outside a step)
> - **Source:** orchestrator | {subagent-name}
> - **Description:** what happened, what action was needed
> - **Suggested fix:** prompt/guardrail change to consider (omit if none)
> - **Related:** {FID}, Linear IDs BAR-{N}, PRs PR-{N}, Commits {SHA}, paths, etc
> - **Recovery:** what unblocked it (manual fix, subagent retry, workaround in commit `{SHA}`, n/a)
> - **Status:** `OPEN` (default) | `RECOVERED` | `FIXED-IN: {REF}`
> ```

<!-- bkit:end -->

<!-- Entries 2026-04-27 → 2026-04-28 captured in BAR-117 (Appendix B) and cleared 2026-04-28. -->

## Plan Step 1 — gitignored status.json + .lock contradiction (2026-05-01)

- **Category:** tool-failure
- **Workflow:** plan
- **Step:** 1 — Start Workflow
- **Source:** orchestrator
- **Description:** Workflow scripts run `git add "$STATUS"` then `git commit` for `docs/plans/logs/{FID}/status.json`, but `.gitignore:65` ignores `status.json` globally. Result: explicit `git add` exits non-zero ("paths are ignored"), and the follow-up commit has nothing to stage. Earlier FIDs silently no-op'd. Worse, the preceding `git add -A` swept `docs/plans/logs/{FID}/.lock` into the work commit (`06fa2e3` here) — `.lock` is meant to be ephemeral and is removed in Step 11/Failure Path, but tracked-then-deleted churns history.
- **Suggested fix:** Either (a) carve `!docs/plans/logs/*/status.json` and `!docs/plans/logs/*/.lock` exceptions in `.gitignore` and update workflow to `git add -f`, or (b) drop the `git add "$STATUS" && git commit` pair in every workflow file (status.json stays purely local) and replace `git add -A` with explicit safelist that excludes `.lock`.
- **Related:** bar-111-bkit-npm-package, BAR-111, commit 06fa2e3, `.gitignore:65`, all `.agents/prompts/bkit-*.md` orchestrator files
- **Status:** FIXED-IN: BAR-129 (Fix 2)

## Plan Step 5 — apply-review subagent left PENDING verdict (2026-05-01)

- **Category:** agent-rework
- **Workflow:** plan
- **Step:** 5 — Apply Review
- **Source:** @bkit-plan-update (agent id ab746c0ccee72735e, attempt 1)
- **Description:** Subagent applied 9 surgical plan edits (mostly canonicalising `## Project Rules` heading literal + dropping init version-mismatch hard-fail). Plan diff shows clean targeted patches. But the summary file `plan-apply-review.md` remained as the early-state placeholder with `Verdict: PENDING` and `Items applied: PENDING`. Agent terminated mid-stream after 67s with truncated tool-output text `R1.C2 - Drop init version-mismatch hard-fail:`. Verdict `PENDING` is not in workflow rubric (PASS|CONCERNS|FAIL).
- **Suggested fix:** Add an explicit "FINAL STEP: rewrite the entire `plan-apply-review.md` file with verdict + items list — do not exit until this final write completes" instruction to `bkit-plan-update.md` subagent prompt. Or have the orchestrator validate verdict ∈ {PASS,CONCERNS,FAIL} immediately on return and re-issue with a tighter prompt rather than continuing to status commit.
- **Related:** bar-111-bkit-npm-package, BAR-111, agent ab746c0ccee72735e
- **Recovery:** operator manually completed `plan-apply-review.md` to verdict PASS in same commit 65fe1e4
- **Status:** FIXED-IN: BAR-129 (Fix 4 — single versioned output supersedes the dual-write that caused the truncation)

## Plan Step 7 — apply-scope subagent also left PENDING verdict (2026-05-01)

- **Category:** agent-rework
- **Workflow:** plan
- **Step:** 7 — Apply Scope
- **Source:** @bkit-plan-update (agent id ac70679692cc3c273, attempt 1)
- **Description:** Same failure mode as Step 5 in same workflow run: subagent applied substantive plan edits (165-line diff) but exited with truncated tool-output text `Now Gates 1 & 2 (CRIT-6).` and never rewrote `plan-apply-scope.md` past the early-state placeholder. Confirms recurring pattern — `bkit-plan-update.md` subagent prompt is too long / does too much in one invocation. Two consecutive uses in the same workflow both left placeholder verdicts.
- **Suggested fix:** Two-pass split for `bkit-plan-update`: pass 1 = patch the plan + write a one-line scratch note per item to `plan-apply-{review|scope}.md` as it goes; pass 2 = synthesise the final summary header (verdict + counts) from the scratch notes. Cheaper per-pass = fewer truncations. Or: shorter orchestrator-side prompts that focus on a smaller subset of items at a time.
- **Related:** bar-111-bkit-npm-package, BAR-111, agent ac70679692cc3c273, sibling friction entry above
- **Recovery:** same shape as Entry 2 — operator manually completed `plan-apply-scope.md` in commit 6a746ac
- **Status:** FIXED-IN: BAR-129 (Fix 4 — single versioned output supersedes the dual-write that caused the truncation)

## Plan Step 10 — `[skip ci]` commit + CI-trigger gate self-contradict (2026-05-01)

- **Category:** tool-failure
- **Workflow:** plan
- **Step:** 10 — Summary
- **Source:** orchestrator (workflow doc itself)
- **Description:** Step 10.4 commits the summary work as `docs({FID}): summary work [skip build] [skip ci]`. Step 10.5 then pushes the branch and asserts CI was triggered (`RUN_ID` non-empty within 60s of push). When the HEAD commit of a push carries `[skip ci]`, GitHub Actions skips the entire push — no `RUN_ID` ever materialises. Gate 10 ("CI run triggered on {BRANCH}") is therefore unreachable when the head commit is the summary commit. Same contradiction in Step 11.1 (close-workflow pushes a `[skip build] [skip ci]` commit to dev and asserts CI triggered).
- **Suggested fix:** Either (a) drop `[skip ci]` from the summary/close-workflow commits so the CI gate can actually run, or (b) drop the CI-trigger assertion from those gates entirely (it's incoherent with the commit messaging). Option (a) preferred because the existing assertion's intent — "verify pushed work goes through CI" — is the right invariant; just the commit-skip directive contradicts it.
- **Related:** bar-111-bkit-npm-package, BAR-111, commit 390bbcf (`[skip ci]` summary commit), `.agents/prompts/bkit-plan.md` Step 10.4 + 10.5 + Step 11.1
- **Status:** FIXED-IN: BAR-129 (Fix 1 — option (b) chosen: dropped CI-trigger gates from the `[skip ci]`-tagged commits; intentional CI-trigger commits keep their gates)

## Plan Step 11 — Linear MCP write rate-limit blocked final issue update (2026-05-01)

- **Category:** tool-failure
- **Workflow:** plan
- **Step:** 11 — Close Workflow
- **Source:** orchestrator + Linear MCP
- **Description:** `mcp__claude_ai_Linear__save_issue` and `mcp__claude_ai_Linear__save_comment` returned `{"error":"rate_limited"}` repeatedly (10+ retries spanning ~30 min, including a 10-min ScheduleWakeup). Reads (`get_issue`, `list_comments`) continued to succeed concurrently, so the limit is on writes only. Final state: BAR-111 stuck at `state="In Progress"`, `labels=["Plan"]`; the workflow comment thread is missing per-step appends from Steps 7, 8, 9, 10, 11. Plan workflow status is `DONE` locally and on `dev` (commit `390bbcf`); only Linear surface state is stale.
- **Suggested fix:** Linear MCP write quota appears stricter than the read quota and resets on a longer window than 10 min. Workflow should treat sustained Linear write rate-limit as a non-fatal closure: log + continue. Today's behaviour (orchestrator stalls indefinitely) blocks Step 11 gates that depend on Linear surface state. Recommendation: relax Gate 11's "issue state In Review and label Review set" check to "attempted ≥3 times, document failure" when MCP is the blocker.
- **Workaround used here:** Step 11 closure committed and merged to `dev`; worktree removed; Linear update will need to be re-run by hand or by a follow-up agent. The plan summary in `docs/plans/logs/bar-111-bkit-npm-package/bar-111-bkit-npm-package-plan-summary.md` is the authoritative artifact.
- **Related:** bar-111-bkit-npm-package, BAR-111, comment id 48b6503f-959e-47c5-bcef-774b83272149
- **Recovery:** workflow closed manually; Linear updated by hand
- **Status:** FIXED-IN: BAR-129 (Fix 3 — Linear writes are now best-effort: retry once after 5s, then `LINEAR_DEFERRED=true` and continue)

## Plan Step 7 — apply-scope subagent appended to parent-repo pending.md instead of worktree (2026-05-03)

- **Category:** agent-rework
- **Workflow:** plan
- **Step:** 7 — Apply Scope
- **Source:** bkit-plan-update
- **Description:** Subagent received explicit `Working directory: <worktree path>` in its prompt and successfully wrote `plan-v3-checked.md` inside the worktree, but appended its 6 new `docs/pending.md` entries to the parent repo's `docs/pending.md` (size 14974) rather than the worktree's copy (size 10635). This caused an unintended modification on `dev` while the feature branch lacked the updates. Risk: if the orchestrator had merged feat → dev without noticing, the parent's stray edit would have collided with the merge or been silently committed by a future operation.
- **Suggested fix:** Strengthen subagent prompt template (and/or `bkit-plan-update.md` agent definition) to either (a) re-pwd before every Edit/Write call and reject paths that escape the worktree root, or (b) require all "Update:" / "Create:" instructions in orchestrator prompts to be supplied as absolute paths anchored at the worktree, eliminating any chance the subagent resolves a relative path against a parent shell cwd. Root cause is most likely that the subagent shell session inherits the orchestrator's pre-worktree cwd for some Edit/Write calls — even though `Read` and `Write` resolved the worktree path correctly for the plan file.
- **Related:** bar-111-bkit-npm-package, BAR-111, parent docs/pending.md (uncommitted +60 lines), worktree docs/pending.md (unchanged), `.agents/prompts/bkit-plan-update.md`
- **Recovery:** orchestrator copied the 60-line append from parent → worktree, restored parent via `git restore docs/pending.md`, committed in worktree as part of Step 7
- **Status:** FIXED-IN: BAR-129

## Plan Step 11 — drafts copied in worktree but never committed before `git worktree remove --force` (2026-05-03)

- **Category:** tool-failure
- **Workflow:** plan
- **Step:** 11 — Close Workflow
- **Source:** orchestrator (workflow doc itself)
- **Description:** Step 11.1 copies `${PLAN_FINAL}` and `plan-v4-N.md` children into `docs/plans/drafts/{FID}-plan*.md` inside the worktree but does NOT commit them. Step 11.3 then `git merge "$BRANCH"` (which only sees committed feat-branch state) and immediately `git worktree remove "...{FID}" --force` (which wipes any uncommitted file in the worktree). Result: `docs/plans/drafts/{FID}-plan*.md` are silently lost — the canonical drafts are missing on `dev` after close. Gate 11 ("Canonical plan copied") cannot detect this because by then the worktree no longer exists to inspect.
- **Suggested fix:** Re-order Step 11 so the drafts are committed in the worktree (with a `docs({FID}): close-workflow drafts` commit) BEFORE the merge to dev — i.e. add a `git add docs/plans/drafts/ && git commit` between current 11.1 and the merge in 11.3. Alternative: copy the drafts directly on `dev` (after checkout) using the `docs/plans/logs/{FID}/plan-*.md` files that already exist there post-merge — this avoids needing the worktree at all.
- **Related:** bar-111-bkit-npm-package, BAR-111, `.agents/prompts/bkit-plan.md` Step 11.1 + 11.3 + 11.4, commit 65e47cd2 (last feat commit before merge — does not include drafts)
- **Recovery:** orchestrator regenerated drafts on `dev` directly from `docs/plans/logs/{FID}/plan-v4-*.md` files (which DID make it into the merge), committed as part of Step 11 close-workflow status push
- **Status:** FIXED-IN: BAR-129
