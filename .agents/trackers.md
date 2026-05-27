# Trackers

> [!CAUTION]
> **Purpose:** Reference for the inline tracker-block model used by `.agents/workflows/bkit-*.md`. **Not consumed by the installer** — there is no `trackers.md` substitution. The full per-tracker call bodies (`github` / `linear` / `none`) live INLINE at each workflow call site; this file documents the marker contract and the cross-cutting per-tracker conventions only.
>
> **Rules:**
>
> - Token-efficient dense phrasing; agent / maintainer readers only.
> - Before writing, cross-check `.agents/docs.md` — verify topic does NOT belong in another doc. Label semantics live in `.agents/workflows.md` § Tracker Integration; this file is the marker contract + operational per-tracker reference.
> - Three trackers supported: `github` (default), `linear` (opt-in), `none` (no tracker wired).
> - Adding a new tracker (Jira, etc.): add the enum value to `.agents/scripts/bkit-manifest.ts`; document the MCP server config under `mcpServers.<name>` in `.agents/templates/.mcp.json` and `.agents/templates/.cursor/mcp.json`; add a `<!-- bkit:tracker <name> -->` block alongside `github`/`linear` at every tracker call site (and extend the pair resolver in `.agents/scripts/bkit-trackers.ts`). There is no `none` marker — no-tracker content is `false`.

## Marker contract

Workflow sources carry the wired tracker variants inline. The installer reads `bkit.issueTracker` from the consumer manifest and resolves the markers when mirroring to `.claude/commands/bkit-*.md` and `.cursor/commands/bkit-*.md` (see `.agents/scripts/bkit-trackers.ts`). Mirrors are clean — no markers survive.

### Per-tracker pair (`github` / `linear`)

Every tracker call site is a consecutive `github` → `linear` pair, optionally followed by a `false` block (the substantive no-tracker rendering — see below). With no `false` block, the no-tracker rendering is a single generic message inserted at resolution time.

```text
<!-- bkit:tracker github start -->
mcp__github__… call
<!-- bkit:tracker github end -->
<!-- bkit:tracker linear start -->
mcp__linear__… call
<!-- bkit:tracker linear end -->
```

Resolution: `github` → github block; `linear` → linear block; `none` → the pair's trailing `false` block if present, else collapses to **`_No tracker connected, skip step._`**. A list-number prefix (`3. `) before the pair is preserved on the kept block / stub. A lone `github` or `linear` block (no matching partner) is reported as an orphan.

### Conditional blocks (`bkit:tracker true` / `bkit:tracker false`)

Boolean tracker-presence gates for tracker-agnostic content (no per-tracker body). These are the ONLY no-tracker markers — there is no `none` marker.

- `<!-- bkit:tracker true start/end -->` — kept when a tracker IS connected (`github` or `linear`); **removed entirely under `none`** (no stub). Used for shared content like a comment `{BODY}` fence that is identical for github and linear.
- `<!-- bkit:tracker false start/end -->` — kept ONLY under `none`; removed when wired. For substantive no-tracker behaviour (`issue-id-extraction`, `fid-format`, `pr-body-marker`, `pr-body-metadata`). A `false` block placed directly after a `github`/`linear` pair is consumed by the pair (it is the pair's `none` rendering); a standalone `false` block is resolved on its own.

```text
<!-- bkit:tracker true start -->
… shared content (kept when wired; removed under none) …
<!-- bkit:tracker true end -->
```

Conditionals are resolved AFTER the pair pass, so a pair nested inside a kept `true` block is resolved first. A removed block consumes its leading newline + indentation so no blank gap remains. An unbalanced `start`/`end` is reported as an orphan.

**Numbered-step rule:** never wrap a numbered list item's NUMBER inside a `true` block — under `none` the whole item (number included) vanishes and leaves a numbering gap (`1, 6, 7`). For a numbered step whose entire body is tracker-only, keep the `N.` outside the markers and pair a `true` body with a trailing `false` stub:

```text
N. <!-- bkit:tracker true start -->
   … tracker-only body (github/linear pairs allowed inside) …
   <!-- bkit:tracker true end -->
   <!-- bkit:tracker false start -->
   _No tracker connected, skip step._
   <!-- bkit:tracker false end -->
```

Renders `N. <body>` when wired, `N. _No tracker connected, skip step._` under `none` — the number always survives. (The bare-`true` "removed, no stub" form is for **checklist `- [ ]` gate items**, where vanishing is correct — a stub bullet would be noise.)

## Interaction catalog

The per-tracker call sites are referenced across `.agents/workflows.md` by these names. Each is an inline `github`/`linear` pair at its call site; this table maps the name to its tracker tooling (reference only — the authoritative bodies are inline in the workflows). The `none` column shows the no-tracker rendering: most sites have no `false` block and collapse to the generic `_No tracker connected, skip step._`; a few carry a substantive trailing `false` block (shown) because they must still function without a tracker.

<!-- prettier-ignore -->
| Interaction | Purpose | github | linear | none |
| --- | --- | --- | --- | --- |
| `rule-block` | CAUTION-block tracker/labels/comments rules | rules prose | rules prose | "not configured" stub |
| `issue-id-extraction` | Step 1 `ISSUE_ID` resolution + create-issue fallback | prompt scan / `issue_write` create | prompt scan / `save_issue` create | scan prompt; else `ISSUE_ID=""` |
| `fid-format` | FID slug regex assertion | `^[0-9]+-[a-z0-9-]+$` | `^[a-z]+-[0-9]+-[a-z0-9-]+$` | no strict assert |
| `issue-read` | Read state + labels + body + comments | `issue_read` get / get_comments | `get_issue` / `list_comments` | skip (vars empty) |
| `issue-update-phase` | Step 1: set phase label + active state | `issue_write` labels | `save_issue` state+labels | skip |
| `issue-update-review` | phase Close hand-off (non-terminal) | no-op (label carries) | `save_issue` In Review | skip |
| `issue-update-failed` | Failure Path additive `bkit:failed` | `issue_write` labels | `save_issue` In Review | skip |
| `issue-update-debug` | `/bkit-debug` Step 1 additive `bkit:debug` | `issue_write` labels | `save_issue` In Review | skip |
| `issue-update-merged` | Ship terminal close | `issue_write` `bkit:merged` + closed | `save_issue` Done | skip |
| `issue-update-status` | Projects v2 board status (best-effort) | `projects_write` add/update item | no-op (state carries) | skip |
| `comment-post-step` | NEW comment per workflow step | `add_issue_comment` | `save_comment` | skip |
| `comment-on-issue` | NEW comment on an arbitrary issue | `add_issue_comment` (`{TARGET_ISSUE_ID}`) | `save_comment` (`{TARGET_ISSUE_ID}`) | skip |
| `list-sub-issues` | Enumerate sub-issues of a parent | `issue_read` get_sub_issues | `list_issues` parentId | empty |
| `create-sub-issue` | Create + attach a sub-issue | `issue_write` create + `sub_issue_write` add | `save_issue` parentId | skip |
| `set-blocked-by` | Set `blockedBy` edges | issue-body marker block | `save_issue` blockedBy | skip |
| `issue-blockers-check` | Gate on open blockers | parse body marker → read states | `get_issue` relations | skip |
| `kill-switch-check` | Terminate if `bkit:auto` absent | label check | label check | inactive |
| `pr-body-metadata` | Parse PR-body issue/FID marker | `pull_request_read` + parse | same (GitHub PR) | FID-only, no fail-closed |
| `pr-body-marker` | Literal PR-body marker line | `<!-- bkit:issue=#{ISSUE_ID} bkit:fid={FID} -->` | `<!-- bkit:issue={ISSUE_ID} bkit:fid={FID} -->` | `<!-- bkit:fid={FID} -->` |

Phase-label set + additive-label semantics are documented in `.agents/workflows.md` § Tracker Integration.

## github — Projects v2 board (optional, #137)

The `issue-update-status` block reads `package.json` `bkit.githubProject` = `{ owner (org login), number, statusFieldId, progressOptionId, reviewOptionId, doneOptionId }` (non-secret, committed). Absent → board sync skipped (best-effort, never gates). Discover the ids once: `gh api /orgs/{owner}/projectsV2/{number}/fields` (Status field's numeric `id` → `statusFieldId`; each option's raw `id` → the option id, e.g. `47fc9ee4`). Requires the `projects` toolset in `.mcp.json` (`X-MCP-Toolsets`) + `GH_TOKEN` org Projects R/W. Org-owned boards only — fine-grained PATs cannot reach user-owned projects. `value` is the single-select **option id**, not the option name. On failure → retry once after 5s, then continue.

## linear — notes

Linear `ISSUE_ID`s carry a team prefix (e.g. `BAR-123`) — FID inherits it (`bar-123-slug`). GitHub FIDs are numeric-only (`123-slug`). Cross-provider scripts MUST tolerate both shapes. `LINEAR_TEAM` = `bkit.linearTeam` from manifest. Linear has no separate project board — issue state (`In Progress` / `In Review` / `Done`) carries the status, so `issue-update-status` is a no-op.
