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

## Linear MCP permission allowlist not matching actual tool names (2026-05-05)

- **Category:** permission-prompt
- **Workflow:** orchestrator
- **Step:** orchestrator
- **Source:** orchestrator
- **Description:** Despite `mcp__linear__*` and `mcp__claude_ai_Linear__*` glob entries in `.claude/settings.json` `permissions.allow`, every Linear MCP tool call still triggers a confirmation prompt. Inspecting `.claude/settings.local.json` shows accepted tools are recorded under a UUID-prefixed namespace (`mcp__5ec21b7b-4a68-41ef-84e6-7b74aff3730b__get_issue`, `__list_comments`, `__save_issue`, `__save_comment`) rather than the human-readable server name. The wildcard patterns in `settings.json` therefore never match the runtime tool identifier the harness checks against, so user must approve each tool individually and allowlist accumulates per-tool entries in `settings.local.json` instead of being covered by one glob.
- **Suggested fix:** Document/normalise MCP server identifier used for permission matching — either (a) use the stable server-name namespace consistently (`mcp__linear__*`), or (b) if UUID prefix is unavoidable, surface that UUID and update `settings.json` glob to `mcp__<uuid>__*`. Add a note to `.agents/rules.md` (or wherever permission setup is described) that `mcp__<server>__*` globs in shared `settings.json` won't match Claude Desktop / claude.ai-issued UUID-prefixed MCP tools, and that `settings.local.json` is the authoritative source after first acceptance.
- **Related:** `.claude/settings.json:9-10`, `.claude/settings.local.json:3-8`
- **Recovery:** n/a — friction persists; per-tool prompts accepted ad-hoc accumulate in `settings.local.json`.
- **Status:** `OPEN`

<!-- bkit:end -->


