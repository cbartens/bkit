# Router

{{BKIT_MANAGED_MARKER}}

> [!CAUTION]
> **Purpose:** Workflow router `AGENTS.md` sends a prompt to when it names a `bkit-{command}` workflow: picks the workflow, then runs its command file for the current host. never executes a workflow itself.
>
> **Rules:**
>
> - Use dense token-efficient phrasing; no filler / hedging / restating; tables > prose, bullets > paragraphs.
> - Describe current state / rules, not reasons / history; state what to do, not why.
> - Ships to consumers: describe the current setup only. NEVER an internal identifier (tracker issue number, ledger key, review-finding id) and NEVER project history.

---

## Route

Commands: `design`, `plan`, `build`, `debug`, `ship`, `auto`.

### Step 1 — Find command

First `bkit-{command}` in the prompt, with or without a leading `/` or `$` → `COMMAND`.

**If** the prompt only mentions it without asking to run it (e.g. `what does bkit-build do?`) → no workflow requested; routing ends → handle the request as asked under `.agents/rules.md`.

**If** `COMMAND` != `auto` **or** a phase follows `bkit-auto` (e.g. `bkit-auto build`) → Step 4.

### Step 2 — Phase from issue labels

1. Resolve bkit and the session folder:
   ```bash
   "$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/node_modules/.bin/bkit" repo info --allow-detached
   ```
   → hold `bkit` as `{BKIT}`, `sessionDir` as `{SESSION_DIR}`.
2. Write the session prompt verbatim to `{SESSION_DIR}/prompt.md` → read the issue it names:
   ```bash
   "{BKIT}" fids parse --prompt-file="{SESSION_DIR}/prompt.md"
   ```
   Hold `issue` as `{ISSUE_ID}`. **If** exit 8 → **STOP**; tell the user the prompt names more than one issue and to name one as `#N`, its key or its URL. **If** `ISSUE_ID` empty → Step 3.
3. Read the issue's labels:
   ```bash
   "{BKIT}" issues fetch --issue="{ISSUE_ID}" --session-dir="{SESSION_DIR}"
   ```
   Hold `labels` as `{LABELS}`. **If** exit 80 → read the labels via the configured tracker MCP.
4. First label naming a phase (e.g. `bkit:build`, `next:plan`) → that phase → `COMMAND` → Step 4. **Else** → Step 3.

### Step 3 — No match

**If** `ISSUE_ID` empty → drop `for issue {ISSUE_ID}` from the message below.

Emit: `Workflow not found for issue {ISSUE_ID}. Valid commands: bkit-design / bkit-plan / bkit-build / bkit-debug / bkit-ship / bkit-auto {phase}.` → **STOP**; do not post a tracker comment.

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
