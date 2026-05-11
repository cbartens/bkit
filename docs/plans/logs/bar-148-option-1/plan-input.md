# Plan Input — bar-148-option-1

## Session Prompt

```
bar-148 option 1
```

Plan Option 1 of the BAR-148 design: **GitHub Actions → `claude-code-action`** (Claude runs inside the GHA runner).

## Issue Description (BAR-148)

# bkit-ci-router

Design exploration. Mull-it-over state — no commitment yet.

## Problem

Today `bkit-build` ends at Step 17 (`close-workflow`), pushes a CI-triggering commit, and exits. Then there's a manual gap: operator watches CI, decides ship or debug, invokes the matching skill. Question: can Claude wait for CI and auto-route — green → `bkit-ship`, red → `bkit-debug` (`DEBUG_MODE=pr`)?

The state machine for this already exists:

- `bkit-ship` Step 1 already gates on `gh pr view --json statusCheckRollup` and fails fast if CI is red.
- `bkit-debug` already has `DEBUG_MODE=pr` that pulls CI logs via `gh run view --log-failed`.

So the routing decision is plumbing; the architecture is the real question.

## Architecture decision: separate workflow, not a Step 18 in `bkit-build`

Rejected: extending `bkit-build` with a wait-and-route step.

Reason: orchestrator context-window pressure. `bkit-build` is 17 steps with cumulative `COMMENT_BODY` appended each step, status.json re-reads, and gate verifications. Chaining `bkit-ship` (~12 more steps) or `bkit-debug` (loops!) into the same session triggers auto-compaction; gate checks that quote earlier SHAs/PR numbers verbatim get fragile.

Chosen shape:

- `bkit-build` closes as today. Releases lock, pushes trigger commit, exits cleanly.
- `bkit-ci-router` is a new tiny workflow that runs in a **fresh session**.
- Router context is small by design: read `status.json` + PR rollup + Linear comment-id from `status.json`, decide green/red, invoke `bkit-ship` or `bkit-debug` skill — which themselves run as fresh orchestrators that pick up state from disk via the existing `Resume` rule (`pick up after last DONE step in active IN_PROGRESS workflow`).

Contract that makes this work is already there: `status.json` + Linear comment-id + plan files on disk are canonical state; nothing critical lives in orchestrator memory. Each workflow's first step reads what it needs and rebuilds context. Router only needs `{FID}` and `{PR_NUMBER}`, both of which are in `status.json`.

Implementation note: `bkit-debug` `DEBUG_MODE=pr` already expects a stale CI run on the current branch, so the router needs to ensure the PR's _latest_ CI run has completed (not just any run) before routing — `gh run list --branch {BRANCH} --limit 1 --json databaseId,conclusion,headSha` matched against the PR head SHA.

## Prior art (gether)

`app-gether-life` had a working version of this: `.github/workflows/ci-complete.yml`. Last live at commit `03b0c502` (BAR-120), removed in `7475b499` (BAR-124/125 "logs-via-status.json + decommission cloud-agent automation").

What it did:

- `workflow_run` trigger on completed CI, branch-filtered (`feat/**`)
- Found PR by `head_branch` + base=`dev`
- Routed by `github.event.workflow_run.conclusion`: `success` → `/ship $ISSUE_ID`, else → `/debug $ISSUE_ID`
- Linear `Automated` label gate to opt PRs in
- Posted session URL back to Linear

Reusable for bkit version:

- ✅ `workflow_run` trigger pattern
- ✅ PR lookup by `head_branch` + base ref
- ✅ Linear label-gating (likely renamed to `bkit:auto-route`)
- ✅ Comment session URL back to Linear

What changed in gether after — and informs the bkit version:

- `AGENT_METADATA` HTML-comment in PR body was replaced by `status.json` (DE-87, "logs-via-status.json"). bkit already follows this pattern, so the router reads `status.json` (FID, debugAttempt, agent) — **not** PR body metadata.
- `Automated` label was removed when cloud runtime was decommissioned. For bkit, likely want it back as opt-in per-feature.

What killed gether's version (don't repeat):

- Dispatch target was Anthropic Managed Agents Sessions API (`anthropic-beta: managed-agents-2026-04-01`). Decommission commit calls it "never functional." Workflow logic was sound; **the API surface wasn't.** Router pattern is fine; **the dispatch mechanism is the real design decision.**

## Dispatch options

Two axes: where Claude actually runs, and what triggers it.

### Option 1 — GitHub Actions → `claude-code-action` (Claude runs _inside_ the GHA runner) ← SELECTED

- **Trigger:** `workflow_run` on CI completion (the gether `ci-complete.yml` pattern, untouched).
- **Dispatch:** GHA job runs `anthropics/claude-code-action@v1` with `prompt: "/bkit-ship $FID"` or `/bkit-debug $FID`.
- **Runtime:** Claude Code executes on the runner — uses runner's checkout, `gh` token, and an `ANTHROPIC_API_KEY` secret. Can edit files, push commits, comment on Linear.
- **Cost:** charged to API key.
- **Pros:** Self-contained, no webhook bridge, no claude.ai dependency. Consumer adds two GHA secrets and a workflow file. Truly autonomous. Anthropic actively maintains this path.
- **Cons:** Runner has a 6-hour ceiling per job (likely fine for ship; debug loops _could_ exceed). Each session starts cold — no shared `~/.claude` cache, no IDE state. State lives in `status.json` already, so this is mostly ok. Operator can't watch it happen in their IDE.

### Option 2 — GitHub Actions → Anthropic Managed Agents Sessions API

The gether attempt. **Decommissioned because never functional** in their hands. Skip unless Anthropic ships a working v2.

### Option 3 — GitHub Actions → `RemoteTrigger` to operator's claude.ai session

(Not selected)

### Option 4 — `schedule` skill — cron poll from claude.ai

(Not selected)

### Option 5 — Manual gate — GHA writes routing decision, operator dispatches

(Not selected)

## Recommendation

Option 1 (`claude-code-action`) is genuinely the most reusable across consumers — Anthropic actively maintains the path, doesn't depend on operator presence, and gether's deleted `ci-complete.yml` already has 80% of the YAML scaffolding (PR lookup, Linear comment-back, label gate). The only swap is the dispatch step: replace the Sessions API POST with a `claude-code-action` step. The 6-hour runner cap is the only real concern, and it's a non-issue for ship and probably for debug too.

## Open questions

- **Label gate naming:** `bkit:auto-route`? Per-PR opt-in or per-issue opt-in? (Per-issue means the label survives across debug iterations.)
- **Debug loop ceiling:** if option 1, what's the bkit-side guardrail to keep the GHA run under 6h? Existing `MAX_DEBUG_ATTEMPT` already caps debug iterations from `status.json`, so probably fine — verify.
- **Failure mode if dispatch itself fails:** GHA job hits API limit / claude-code-action crashes. Retry policy? Dead-letter to a Linear comment?
- **Concurrency:** two CI runs complete on the same PR (e.g., debug pushed a new commit). Concurrency group on `${{ github.workflow }}-${{ github.event.workflow_run.head_branch }}` with `cancel-in-progress: true` (gether's `bkit.yml` pattern) — but cancelling mid-ship is bad. Probably want `cancel-in-progress: false` for the router specifically.
- **Stale CI runs:** `bkit-debug` `DEBUG_MODE=pr` reads "the latest run on branch." Need to ensure the router only routes on the run matching the PR's _current_ head SHA, not a stale earlier run.
- **Bkit-as-framework concern:** consumer repos must own dispatch. The `.github/workflows/bkit-ci-router.yml` ships through `bkit install` mirror like other consumer artifacts; consumer adds `ANTHROPIC_API_KEY` themselves. Document the secret requirement clearly.

## Next steps when ready

1. Pick dispatch option. ← **Option 1 chosen**
2. Draft `.agents/workflows/bkit-ci-router.md` (the orchestrator).
3. Draft `.github/workflows/bkit-ci-router.yml` (the trigger half) — port from gether `03b0c502`'s `ci-complete.yml`, swap dispatch step.
4. Decide installer behaviour: does `bkit install` write the GHA workflow into the consumer repo, or is it opt-in per-consumer?

## References

- gether `ci-complete.yml` (deleted): `git -C app-gether-life show 03b0c502:.github/workflows/ci-complete.yml`
- Decommission rationale: `git -C app-gether-life show 7475b499` (BAR-124/125, "logs-via-status.json + decommission cloud-agent automation")
- bkit-build close-workflow: `.agents/workflows/bkit-build.md` Step 17
- bkit-ship CI gate: `.agents/workflows/bkit-ship.md:178`
- bkit-debug PR mode: `.agents/workflows/bkit-debug.md:186`

## Comments

(none)
