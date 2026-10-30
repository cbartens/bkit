<!-- bkit:start -->

{{BKIT_MANAGED_MARKER}}

# Lite Workflows

> [!CAUTION]
> **Purpose:** Opt-in prompts that run a phase's steps and subagents without the full workflow's ceremony. The full workflow is the default.
>
> **Rules:**
>
> - All `.agents/rules.md` rules still apply. Fewer steps, never fewer rules.
> - The named reference is inspiration, not a command file. Read it for its steps and subagents, take what fits, and drop the rest.
> - Assume the right repo and branch are already checked out, and do not detect them again.
> - Local project lite workflows → `Project Lite Workflows` below the bkit-managed block.

## When to use

Use the full workflow when in doubt, and a lite workflow only when it is clearly enough. Lite workflows are opt-in at your own judgement. They skip the gates, worktree isolation, PR, CI and audit trail, so they suit users who know what they are trading away.

- Add whichever full-phase step or subagent the work needs.
- Go full when the cost of being wrong is high: irreversible changes (releases, data), a blast radius past one small change, or security / secrets / PII.

NEVER use a lite workflow for schema / migrations, public API, dependencies, secrets / config, auth / security, or large multi-file refactors.

## Contract

- Read `.agents/rules.md`.
- Work on the current branch, and commit as you go.
- Push ONLY when shipping or when asked.
- **If** a tracker is wired and an issue is named:
  - At the start, move the issue to the `package.json` `bkit.tracker.<tracker>.progress` state (default github `In progress`, linear `started`, jira `In Progress`) and add the `bkit:<phase>` label. This drops the other `bkit:*` workflow labels, `next:*` and `bkit:failed`, per `.agents/rules.md` § Tracker workflow labels.
  - At the end, move the issue to the `bkit.tracker.<tracker>.review` state (default `In review` on github, `In Review` on linear and jira).
  - Post one short comment per step.
- **If** no tracker is wired, or no issue is named → skip the tracker lines.

## Paste

Start the session on the phase's model from `.bkit/prompts.md` § Orchestrators. Copy one block, whose heading is the lite workflow's name, then insert the issue or instructions at the bracketed line.

### design:lite

```text
Handle the issue below as a design. Read `.bkit/workflows.md` § Per-Phase Workflows and `.bkit/prompts.md` as inspiration only: keep the steps that fit, and skip the rest. Dispatch each kept subagent step to its `bkit-*` subagent, on the model `.bkit/prompts.md` § Models pins for it. Never do subagent work inline. If there is no subagent tool, run the subagent's prompt file in-session. Follow `.bkit/lite.md` § Contract.

[INSERT ISSUE ID / INSTRUCTIONS]
```

### plan:lite

```text
Handle the issue below as a plan. Read `.bkit/workflows.md` § Per-Phase Workflows and `.bkit/prompts.md` as inspiration only: keep the steps that fit, and skip the rest. Dispatch each kept subagent step to its `bkit-*` subagent, on the model `.bkit/prompts.md` § Models pins for it. Never do subagent work inline. If there is no subagent tool, run the subagent's prompt file in-session. Follow `.bkit/lite.md` § Contract.

[INSERT ISSUE ID / INSTRUCTIONS]
```

### build:lite

```text
Handle the issue below as a build. Read `.bkit/workflows.md` § Per-Phase Workflows and `.bkit/prompts.md` as inspiration only: keep the steps that fit, and skip the rest. Dispatch each kept subagent step to its `bkit-*` subagent, on the model `.bkit/prompts.md` § Models pins for it. Never do subagent work inline. If there is no subagent tool, run the subagent's prompt file in-session. Follow `.bkit/lite.md` § Contract.

[INSERT ISSUE ID / INSTRUCTIONS]
```

### debug:lite

```text
Handle the issue below as a debug. Read `.bkit/workflows.md` § Per-Phase Workflows and `.bkit/prompts.md` as inspiration only: keep the steps that fit, and skip the rest. Dispatch each kept subagent step to its `bkit-*` subagent, on the model `.bkit/prompts.md` § Models pins for it. Never do subagent work inline. If there is no subagent tool, run the subagent's prompt file in-session. Follow `.bkit/lite.md` § Contract.

[INSERT ISSUE ID / INSTRUCTIONS]
```

### ship:lite

```text
Handle the issue below as a ship. Read `.bkit/workflows.md` § Per-Phase Workflows and `.bkit/prompts.md` as inspiration only: keep the steps that fit, and skip the rest. Dispatch each kept subagent step to its `bkit-*` subagent, on the model `.bkit/prompts.md` § Models pins for it. Never do subagent work inline. If there is no subagent tool, run the subagent's prompt file in-session. Follow `.bkit/lite.md` § Contract.

[INSERT ISSUE ID / INSTRUCTIONS]
```

<!-- bkit:end -->

## Project Lite Workflows
