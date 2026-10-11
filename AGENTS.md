# AGENTS.md

<!-- bkit:start -->

<!-- bkit:managed v5.0.1 — PolyForm Noncommercial 1.0.0 / Small Business 1.0.0 (https://polyformproject.org/licenses/) — do not edit; run `bkit upgrade` to refresh -->

- **Rules:** Read `.agents/rules.md` → follow all rules.

> [!CAUTION]
> This file is a **workflow router only**. It does not execute workflows.

---

## Route

### Step 1 — Extract from prompt XML (not MCP)

**If** prompt contains `<LINEAR_ISSUE>` XML block (Linear integration):

- `ISSUE_ID` ← `<id>` tag value (e.g. `LIN-123` or team-specific prefix)
- `DESCRIPTION` ← `<description>` tag content
- `LABELS` ← all `<label name="...">` values in `<labels>` block
- `COMMENTS` ← all `<comment>` entries from `<comment_thread>` + `<other_comment_threads>`, sorted newest-first by `created` attribute

**Else** scan entire session prompt for issue ID — try patterns in order, first match wins:

1. `#\d+` → GitHub issue number (e.g. `#123`); strip `#`, set `ISSUE_ID` = `123`
2. `[A-Z]+-\d+` → prefixed issue ID (e.g. `LIN-123`, `ISSUE-123`, or team-specific prefix)
3. bare `\d+` → numeric fallback (GitHub provider only; ambiguous — prefer `#\d+`)

Set `LABELS`, `DESCRIPTION`, `COMMENTS` = empty.

**If** no `ISSUE_ID` → **STOP** with `No issue ID provided.`

### Step 2 — Route from user message

In the bottom-most `USER:` entry in `# Message history` scan for commands (case-insensitive: Ship, Debug, Build, Plan, Design) → first match → `COMMAND`. **If** matched → skip Steps 3–4.

### Step 3 — Route from XML labels

Scan `LABELS` for commands (Ship, Debug, Build, Plan, Design) → first match → `COMMAND`. **If** matched → skip Step 4.

### Step 4 — MCP fallback (labels only)

Only if Steps 2–3 yield no `COMMAND`: read current issue labels via the configured tracker MCP (GitHub: `mcp__github__issue_read({ method: "get_labels", ... })`; Linear: `mcp__linear__get_issue({ id: "{ISSUE_ID}" })`) → scan returned labels → first match → `COMMAND`. Update `LABELS`, `DESCRIPTION`.

### Step 5 — No match

Emit: `Workflow not found for issue {ISSUE_ID}. Valid commands: Design / Plan / Build / Debug / Ship.` → **STOP**. (Do not post a tracker comment — the router does not know which tracker MCP to call at this point.)

### Step 6 — Execute command

Read and execute the matched command file for the current IDE.

**Cursor** (`.cursor/commands/`):

<!-- prettier-ignore -->
| Label | Command |
| --- | --- |
| `Ship` | `.cursor/commands/bkit-ship.md` |
| `Debug` | `.cursor/commands/bkit-debug.md` |
| `Build` | `.cursor/commands/bkit-build.md` |
| `Plan` | `.cursor/commands/bkit-plan.md` |
| `Design` | `.cursor/commands/bkit-design.md` |

**Claude Code** (`.claude/commands/`):

<!-- prettier-ignore -->
| Label | Command |
| --- | --- |
| `Ship` | `.claude/commands/bkit-ship.md` |
| `Debug` | `.claude/commands/bkit-debug.md` |
| `Build` | `.claude/commands/bkit-build.md` |
| `Plan` | `.claude/commands/bkit-plan.md` |
| `Design` | `.claude/commands/bkit-design.md` |

<!-- bkit:end -->
