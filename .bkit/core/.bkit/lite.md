<!-- bkit:start -->

{{BKIT_MANAGED_MARKER}}

# Lite Workflows

> [!CAUTION]
> **Purpose:** Opt-in prompts that run a phase's steps and subagents without the full workflow's ceremony. The full workflow is the default.
>
> **Rules:**
>
> - All `.agents/rules.md` rules still apply. Fewer steps, never fewer rules.
> - The named reference is **inspiration, not a command file**: read it for its steps and subagents, take what fits, drop the rest.
> - Assume the right repo and branch are already checked out; do not re-detect them.
> - Local project lite workflows → `Project Lite Workflows` below the bkit-managed block.

## When to use

Full workflow when in doubt; a lite workflow only when it is clearly enough. These are opt-in at your own judgement — they skip the gates, worktree isolation, PR, CI and audit trail, so they suit users who know what they are trading away. Add whichever full-phase step or subagent the work needs; go full when the cost of being wrong is high — irreversible changes (releases, data), blast radius past one small change, security / secrets / PII.

NEVER a lite workflow for: schema / migrations, public API, dependencies, secrets / config, auth / security, large multi-file refactors.

## Contract

Read `.agents/rules.md`. Work on the current branch; commit as you go; push only when shipping or when asked. Tracker-wired: issue → **In progress** + `bkit:<phase>` label at start (drops other `bkit:*` workflow labels, `next:*`, `bkit:failed` per `.agents/rules.md` § Tracker workflow labels), **In review** at end, one short comment per step. No tracker: skip the tracker lines.

## Paste

Start the session on the phase's model from `.bkit/prompts.md` § Orchestrators. Copy one block — its heading is the lite workflow's name — then insert the issue or instructions at the bracketed line.

### design:lite

```text
Handle the issue below as a design. Read `.bkit/workflows.md` § Per-Phase Workflows and `.bkit/prompts.md` as inspiration only — keep the steps that fit, skip the rest. Dispatch each kept subagent step to its `bkit-*` subagent on the model `.bkit/prompts.md` § Models pins for it; NEVER do subagent work inline. No subagent tool → run its prompt file in-session. Follow `.bkit/lite.md` § Contract.

[INSERT ISSUE ID / INSTRUCTIONS]
```

### plan:lite

```text
Handle the issue below as a plan. Read `.bkit/workflows.md` § Per-Phase Workflows and `.bkit/prompts.md` as inspiration only — keep the steps that fit, skip the rest. Dispatch each kept subagent step to its `bkit-*` subagent on the model `.bkit/prompts.md` § Models pins for it; NEVER do subagent work inline. No subagent tool → run its prompt file in-session. Follow `.bkit/lite.md` § Contract.

[INSERT ISSUE ID / INSTRUCTIONS]
```

### build:lite

```text
Handle the issue below as a build. Read `.bkit/workflows.md` § Per-Phase Workflows and `.bkit/prompts.md` as inspiration only — keep the steps that fit, skip the rest. Dispatch each kept subagent step to its `bkit-*` subagent on the model `.bkit/prompts.md` § Models pins for it; NEVER do subagent work inline. No subagent tool → run its prompt file in-session. Follow `.bkit/lite.md` § Contract.

[INSERT ISSUE ID / INSTRUCTIONS]
```

### debug:lite

```text
Handle the issue below as a debug. Read `.bkit/workflows.md` § Per-Phase Workflows and `.bkit/prompts.md` as inspiration only — keep the steps that fit, skip the rest. Dispatch each kept subagent step to its `bkit-*` subagent on the model `.bkit/prompts.md` § Models pins for it; NEVER do subagent work inline. No subagent tool → run its prompt file in-session. Follow `.bkit/lite.md` § Contract.

[INSERT ISSUE ID / INSTRUCTIONS]
```

### ship:lite

```text
Handle the issue below as a ship. Read `.bkit/workflows.md` § Per-Phase Workflows and `.bkit/prompts.md` as inspiration only — keep the steps that fit, skip the rest. Dispatch each kept subagent step to its `bkit-*` subagent on the model `.bkit/prompts.md` § Models pins for it; NEVER do subagent work inline. No subagent tool → run its prompt file in-session. Follow `.bkit/lite.md` § Contract.

[INSERT ISSUE ID / INSTRUCTIONS]
```

<!-- bkit:end -->

## Project Lite Workflows
