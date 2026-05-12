# AGENTS.md

<!-- bkit:start -->

**Read in full:** `.agents/rules.md`.

> [!CAUTION]
> This file is a **workflow router only**. It does NOT execute workflows.

---

## Route

### Step 1 — Extract from prompt XML (no MCP)

**If** prompt contains `<LINEAR_ISSUE>` XML block:

- `ISSUE_ID` ← `<id>` tag value
- `DESCRIPTION` ← `<description>` tag content
- `LABELS` ← all `<label name="...">` values in `<labels>` block
- `COMMENTS` ← all `<comment>` entries from `<comment_thread>` + `<other_comment_threads>`, sorted newest-first by `created` attribute

**Else** scan entire prompt for `[A-Z]+-\d+` pattern → `ISSUE_ID`. Set `LABELS`, `DESCRIPTION`, `COMMENTS` = empty.

**If** no `ISSUE_ID` → **STOP** with `No issue ID provided.`

### Step 2 — Route from user message

In the bottom-most `USER:` entry in `# Message history` scan for commands (case-insensitive: Ship, Debug, Build, Plan, Design) → first match → `COMMAND`. **If** matched → skip Steps 3–4.

### Step 3 — Route from XML labels

Scan `LABELS` for commands (Ship, Debug, Build, Plan, Design) → first match → `COMMAND`. **If** matched → skip Step 4.

### Step 4 — MCP fallback (labels only)

Only if Steps 2–3 yield no `COMMAND`: `get_issue({ id: "{ISSUE_ID}" })` → scan returned labels → first match → `COMMAND`. Update `LABELS`, `DESCRIPTION`.

### Step 5 — No match

`save_comment({ issueId: "{ISSUE_ID}", body: "Workflow not found. Reply: Design / Plan / Build / Debug / Ship." })` → **STOP**.

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
