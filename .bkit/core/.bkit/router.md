# Router

{{BKIT_MANAGED_MARKER}}

> [!CAUTION]
> **Purpose:** The workflow router. `AGENTS.md` sends a prompt here when the prompt names a `bkit-{command}` workflow. The router picks the workflow, then runs that workflow's command file for the current host. The workflow's steps live in that command file, not here.
>
> **Rules:**
>
> - Follow `.bkit/authoring.md` § All Agent-Read Files and § Docs when you edit this file.
> - This file ships to every project that installs bkit. Describe the current setup only.
> - Leave out internal labels, such as tracker issue numbers, ledger keys and review-finding ids, and leave out project history.

---

## Route

Commands: `design`, `plan`, `build`, `debug`, `ship`, `auto`.

### Step 1 — Find command

Hold the `{command}` of the first `bkit-{command}` in the prompt, with or without a leading `/` or `$`, as `COMMAND`.

**If** the prompt only mentions it without asking to run it (e.g. `what does bkit-build do?`) → no workflow requested; routing ends → handle the request as asked under `.agents/rules.md`.

**If** `COMMAND` != `auto` **or** a phase follows `bkit-auto` (e.g. `bkit-auto build`) → Step 4.

### Step 2 — Phase from issue labels

1. Resolve bkit and the session folder:
   ```bash
   "$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/node_modules/.bin/bkit" repo info --allow-detached
   ```
   Hold `bkit` as `BKIT` and `sessionDir` as `SESSION_DIR`.
2. Write the session prompt verbatim to `{SESSION_DIR}/prompt.md`, then read the issue it names:
   ```bash
   "{BKIT}" fids parse --prompt-file="{SESSION_DIR}/prompt.md"
   ```
   Hold `issue` as `{ISSUE_ID}`.
   - **If** exit 8 → tell the user that the prompt names more than one issue, and that they should name one as `#N`, its key or its URL. Then **STOP**.
   - **If** `ISSUE_ID` is empty → Step 3.
3. Read the issue's labels:
   ```bash
   "{BKIT}" issues fetch --issue="{ISSUE_ID}" --session-dir="{SESSION_DIR}"
   ```
   Hold `labels` as `{LABELS}`.
   - **If** exit 80 → read the labels via the configured tracker MCP.
4. Find the first label that names a phase (e.g. `bkit:build`, `next:plan`):
   - **If** there is one → hold that phase as `COMMAND` → Step 4.
   - **Else** → Step 3.

### Step 3 — No match

**If** `ISSUE_ID` is empty → drop `for issue {ISSUE_ID}` from the message below.

Emit this message, and NEVER post a tracker comment: `Workflow not found for issue {ISSUE_ID}. Valid commands: bkit-design / bkit-plan / bkit-build / bkit-debug / bkit-ship / bkit-auto {phase}.` Then **STOP**.

### Step 4 — Execute command

Read and execute `COMMAND`'s file for the current host, with the session prompt as its input:

<!-- prettier-ignore -->
| Host | Command file |
| --- | --- |
| Claude Code | `.claude/commands/bkit-{command}.md` |
| Codex | `.agents/skills/bkit-{command}/SKILL.md` |
| Antigravity | `.agents/plugins/bkit/skills/bkit-{command}/SKILL.md` |
| Cursor | `.cursor/commands/bkit-{command}.md` |
| opencode | `.opencode/commands/bkit-{command}.md` |
