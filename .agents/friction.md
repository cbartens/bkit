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

<!-- Entries up to 2026-05-18 cleaned out after capture into BAR-155 (shipped) and BAR-230 (follow-ups). Harvest evidence preserved in those issues; recovered/duplicate entries removed. -->

## Plan start blocked by pre-flight env state (unrelated branch WIP + unpushed dev) (2026-05-25)

- **Category:** human-confirm
- **Workflow:** plan
- **Step:** 1 — Start Workflow (orchestrator, pre-lock)
- **Source:** orchestrator
- **Description:** `/bkit-plan 143` invoked while HEAD was on an unrelated feature branch with uncommitted WIP, and local `dev` was 2 commits ahead of `origin/dev` (one being the #143 design revision the plan depends on). Step 1's divergence guard (`AHEAD>0 -> exit 1`) would have routed to Failure Path, which posts `bkit:failed` to the issue + writes a FAILED status — inappropriate for a pre-flight environment condition on a not-yet-started workflow. Orchestrator halted and asked the user (2 questions) instead of mechanically failing.
- **Suggested fix:** Distinguish "pre-flight environment precondition" (dev-ahead, WIP on unrelated branch) from "workflow failure" in Step 1 — surface to human + halt WITHOUT the Failure-Path issue-labelling/status-write, since no workflow run exists yet to fail. The guard's own message ("Push or reset before retrying") already implies retry-after-fix, not terminal failure.
- **Related:** 143-real-world-testing, issue #143
- **Recovery:** User pushed `dev` to origin and switched to a clean branch even with dev tip; orchestrator re-verified (0 ahead, clean tree) and proceeded. Worktree branched cleanly from the dev tip.
- **Status:** RECOVERED

## status.json written to main-repo working copy (not worktree) -> plan steps lost to mid-run reset (2026-05-25)

- **Category:** tool-failure
- **Workflow:** plan
- **Step:** orchestrator (all status-write steps 2-11)
- **Source:** orchestrator
- **Description:** In a linked worktree, `REPO_ROOT=$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")` resolves to the MAIN repo, not the worktree, so every `STATUS="$REPO_ROOT/docs/.../status.json"` write landed in the main-repo working copy — a file outside the worktree's VCS and on whatever branch the main repo happened to be on. Mid-run the main repo was switched to `dev` (working copy reset to dev's committed design-only status.json: a 1-element array). Subsequent `jq '.[-1].steps += [...]'` then appended plan-complexity-split / plan-summary / plan-close-workflow INTO the design entry (`.[-1]` = design, since the plan element no longer existed), and `.[-1] |= (.status="DONE")` hit design. The 8 earlier plan steps were lost entirely. All actual plan ARTIFACTS were unaffected (committed in the worktree branch); only status.json corrupted.
- **Suggested fix:** status.json should live in and be committed from the WORKTREE (use the worktree root, e.g. `git rev-parse --show-toplevel`, not `--git-common-dir`), OR the per-step writes must target a path that is branch/worktree-stable. As written, the "dev working copy" status model is corrupted by any concurrent `git checkout` in the main repo and by the worktree/main-repo working-tree split. Also: `jq '.[-1]'` blindly trusting the last array element is unsafe after a reset — select by `.workflow=="plan"` explicitly.
- **Related:** 143-real-world-testing, issue #143, commits f4f6061..925bb9a (plan run)
- **Recovery:** Reconstructed status.json authoritatively from dev's committed design(10) entry + the full 11-step plan workflow (verdicts/artifacts re-derived from the committed step artifacts), committed to dev at close.
- **Status:** RECOVERED

## Step 9 workstream matching breaks when a re-design renumbers WS meanings (2026-05-26)

- **Category:** human-confirm
- **Workflow:** design
- **Step:** 9 — Design Workstream Issues
- **Source:** orchestrator
- **Description:** `/bkit-design 80` was a re-design of an issue that already had sub-issues from a superseded decomposition. The old run cut WS-1=orchestrator, WS-2..WS-12=one-per-lens, WS-13=pipeline-prompts (#103, #104, #84–#93, #105). The new design cut a structurally different 7-workstream set (WS-1=stack-detect, WS-2=skill-install, WS-3=all-11-lenses, …). Step 9 matches existing children to new workstreams purely by `^WS-{N}:` title-prefix, which assumes WS-{N} means the same thing across runs. It does not after a re-design: following the literal procedure would have posted "now this is Stack-detect" Update comments onto issues still TITLED "Workflow Orchestrator"/"architecture lens", and fired spurious Delete comments at real lens issues (#89–#93/#105) whose work still exists (folded into new WS-3). Orchestrator halted and asked the user how to reconcile rather than producing a tracker where titles and scope contradict.
- **Suggested fix:** Step 9 needs a re-design branch: when existing children's `WS-{N}` titles don't semantically match the new design's `WS-{N}` names (or when the new decomposition is a known re-cut), prefer cancel-old-and-create-fresh over match-by-number Update. At minimum, match on title SLUG not just the numeric prefix, and treat a name mismatch at the same number as "stale child" (cancel) rather than "reuse". Consider recording a design-supersedes-design marker so Step 9 can detect the re-cut automatically.
- **Related:** 80-audit-workflow, issue #80, cancelled #103/#104/#84–#93/#105, created #187–#193
- **Recovery:** User chose "cancel old, create 7 fresh"; orchestrator retitled+closed the 13 stale children (`not_planned`, bodies kept) and created #187–#193 with correct titles + blocked-by DAG.
- **Status:** RECOVERED

## Main repo `core.bare` flipped to `true` mid-run, blocking Close-Workflow merge (2026-05-26)

- **Category:** tool-failure
- **Workflow:** plan
- **Step:** 11 — Close Workflow (squash-merge to dev)
- **Source:** orchestrator
- **Description:** During `/bkit-plan 160`, Steps 1–2 ran fine against the main repo (`git status --porcelain` returned the untracked-file list, so `core.bare=false` then). By Step 11, `git checkout dev` / `git pull` / `git merge --squash` in the main repo all failed with `fatal: this operation must be run in a work tree`. `git rev-parse --show-toplevel` and `--is-inside-work-tree` errored identically, while `git branch --show-current` (which doesn't need a work tree) still returned `dev`. Root cause: `.git/config` `[core] bare = true` — the main repo (a non-bare checkout with `.git` as a directory and a full working tree) had `core.bare` flipped to `true` at some point after Step 2, after the worktree was created. No orchestrator step sets `core.bare`; suspected external mutation (IDE git integration — `GIT_ASKPASS` points at Cursor — or a git operation side-effect). All committed artifacts on `feat/160-...` were intact; only the main repo's work-tree operations were blocked.
- **Suggested fix:** Close-Workflow (Step 11.4) should assert `git -C "$REPO_ROOT" config --get core.bare` is `false` (or `git rev-parse --is-inside-work-tree` succeeds) before `git checkout dev`, and self-heal with `git config core.bare false` when the main repo demonstrably has a working tree (`.git` is a dir + tracked files present). Consider doing this assertion at Step 1 too, to fail fast with a clear message instead of an opaque "must be run in a work tree" at merge time. Related to the known worktree/main-repo split fragility (see the 2026-05-25 status.json entry).
- **Related:** 160-centralise-install-code, issue #160
- **Recovery:** Set `git -C "$REPO_ROOT" config core.bare false`; `git status` and `--show-toplevel` worked again; resumed the Step 11.4 squash-merge.
- **Status:** RECOVERED

## bkit-plan-update left `Verdict: PENDING` placeholder, forcing a re-invocation (2026-05-26)

- **Category:** agent-rework
- **Workflow:** plan
- **Step:** 5 — Apply Review
- **Source:** subagent (`bkit-plan-update`)
- **Description:** During `/bkit-plan 141`, the Apply-Review subagent completed the full plan edit (`plan-v2-reviewed.md`, 532 lines, all 10 CRITICAL findings resolved) but its final assistant message was truncated mid-action and it left the verdict header as the literal placeholder `Verdict: PENDING` / `<!-- verdict:end -->` at the top of the file. `PENDING` is not in `PASS|CONCERNS|FAIL`, so Gate-5 verdict extraction failed and Step 5.3's "invoke offending subagent again to re-emit ONLY the verdict header" recovery had to run. The re-invocation read the completed file, assessed it, and emitted `Verdict: PASS` — no plan rework needed, only the header was missing.
- **Suggested fix:** `bkit-plan-update` (and any subagent that owns a verdict-headed artifact) should write the verdict header FIRST as its very first file write — before the body edits — so a truncated/interrupted run still leaves a valid (if conservative) verdict rather than the `PENDING` placeholder. The orchestrator already handles this via Step 5.3, but the extra round-trip is avoidable. Step 7's apply-scope prompt mitigated this by explicitly instructing "emit the verdict header before anything else risky"; folding that instruction into the agent definition itself would close the gap for Step 5 too.
- **Related:** 141-cloud-app, issue #141
- **Recovery:** Re-invoked `bkit-plan-update` per Step 5.3 with the re-emit instruction; it read the completed `plan-v2-reviewed.md`, confirmed all 10 CRITICALs resolved, and set `Verdict: PASS`. No plan content changed.
- **Status:** RECOVERED

## Build Step 7 PRIOR_STRATEGY query never matches recorded step name (2026-05-27)

- **Category:** tool-failure
- **Workflow:** build
- **Step:** 7 — Plan Gaps Remediate (sub-step 17)
- **Source:** orchestrator
- **Description:** During `/bkit-build issue 141`, Step 7.17's `PRIOR_STRATEGY` query selects `.steps[] | select(.step=="plan-gaps-remediate" and ...)`, but Step 7.22 records the step as `"build-plan-gaps-remediate"` (with the `build-` prefix). The exact `==` match therefore NEVER finds the prior entry, so `PRIOR_STRATEGY` is always `""` and the strategy ladder collapses to STANDARD on every remediation attempt — it never advances STANDARD -> PIVOT -> FINAL as designed. Same defect class likely exists in Step 14's `failure-diagnose` query (`select(.step=="failure-diagnose")` vs recorded `"build-failure-diagnose"`).
- **Suggested fix:** Change the Step 7.17 query string to `"build-plan-gaps-remediate"` (and Step 14.1 to `"build-failure-diagnose"`) so the recorded step names match. Alternatively derive the prior strategy from `.steps[] | select(.step|endswith("plan-gaps-remediate"))`.
- **Related:** 141-cloud-app, issue #141
- **Recovery:** Orchestrator derived the next strategy from its own in-run memory (attempt 1 = STANDARD, so attempt 2 = PIVOT) rather than the buggy query result.
- **Status:** RECOVERED

## Plan T3.1 (D3 concurrency reconciliation) Done-when structurally unsatisfiable in GitHub Actions (2026-05-27)

- **Category:** agent-rework
- **Workflow:** build
- **Step:** 6/7 — Plan Verify / Gaps Remediate (sub-plan 2)
- **Source:** subagent (bkit-build-plan-gaps-remediate) + plan spec
- **Description:** Sub-plan 2 T3.1 requires the `bkit-cloud.yml` `concurrency.group` to resolve to one identical FID token across BOTH the `workflow_dispatch` path (payload exposes only the bare issue number, e.g. `141`) and the `workflow_run` CI-completion path (payload exposes only `head_branch` = `feat/{slugged-FID}`, e.g. `feat/141-cloud-app`). GitHub evaluates `concurrency.group` from trigger-payload context ONLY, before any step runs — it cannot consume a step output or do a tracker/PR lookup. GHA expression functions are limited to contains/startsWith/endsWith/format/join/toJSON/fromJSON/hashFiles (NO regex, NO split, and crucially **no `replace`**). The first remediation shipped `replace(github.event.workflow_run.head_branch, 'feat/', '')` — `replace` is not a valid GHA expression function, AND even if it were, it strips only the literal `feat/` prefix, leaving the slugged FID (`141-cloud-app`), which does not equal the dispatch's bare `141`. The accompanying render test used the unrealistic fixture `feat/141` (no slug), encoding the bug as the expectation (the "validate with the real tool" memory class). Net: T3.1's "single FID-derived token equal across both surfaces, single-sourced with the SHARED-DERIV step" is not achievable with concurrency expressions when FID contains a slug.
- **Suggested fix:** Re-scope T3.1 to the achievable reconciliation (option iii): concurrency serialises WITHIN each surface (CI path keys on `head_branch`; dispatch keys on `inputs.issue`), and the cross-boundary dispatch<->auto-ship race is mitigated by a non-concurrency mechanism (orchestrator stale-run guard / status.json lock). Document the structural limit in KN-30 and restate the plan Done-when. Replace the false-confidence test fixture with a realistic slugged branch asserting the chosen behaviour. Drop the invalid `replace()` expression. Future plans that key GHA concurrency across dispatch+`workflow_run` must account for the payload-identity asymmetry up front.
- **Related:** 141-cloud-app, issue #141, KN-30, D3
- **Recovery:** (pending PIVOT remediation — Step 7 attempt 2)
- **Status:** IN_PROGRESS
