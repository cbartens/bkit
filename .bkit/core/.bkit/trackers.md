# Trackers

{{BKIT_MANAGED_MARKER}}

> [!CAUTION]
> **Purpose:** Reference for the inline tracker blocks in `.bkit/core/workflows/bkit-*.md` and `.bkit/core/prompts/bkit-*.md`. The installer does not consume this file: there is no `trackers.md` substitution. The per-tracker call bodies (`github` / `linear` / `jira`, plus `false` for no tracker) live inline at each workflow call site. This file documents the marker contract, the per-tracker conventions shared across call sites, and the issue shapes workflows read (§ Issue shapes).
>
> **Rules:**
>
> - Follow `.bkit/authoring.md` § All Agent-Read Files and § Docs when you edit this file.
> - What each label means lives in `.bkit/workflows.md` § Tracker Integration. This file holds the marker contract and the operational reference for each tracker.
> - This file ships to every project that installs bkit. Describe the current setup only.
> - Leave out internal labels, such as tracker issue numbers, ledger keys and review-finding ids, and leave out project history. Decisions go in `docs/decisions.jsonl`, and incidents go in `docs/knowledge.jsonl`.
> - The tracker takes one of four values: `github`, `linear`, `jira` or `none` (no tracker wired, the default).
> - To add a tracker:
>   - Add its value to the enum in `.bkit/core/engine/install/manifest.ts`.
>   - Document its MCP server under `mcpServers.<name>` in `.bkit/shared/.mcp.json` and `.bkit/shared/.cursor/mcp.json`.
>   - Add a `<!-- bkit:tracker <name> -->` block after the last tracker block at every call site, and extend `GROUP_RE` in `.bkit/core/engine/render/trackers.ts`.
> - There is no `none` marker. No-tracker content goes in a `false` block.

## Marker contract

Workflow and prompt sources carry the variant for each wired tracker inline. The installer reads `bkit.tracker.default` from the consumer's manifest, and resolves the markers when it mirrors `.bkit/core/workflows/bkit-*.md` to every host's commands / skills and `.bkit/core/prompts/bkit-*.md` to every host's agents (`.bkit/core/engine/render/trackers.ts`). The mirrors are clean: no marker survives.

In a prompt's frontmatter `tools:` list, every marker must be a YAML comment (`  # <!-- bkit:tracker github start -->`), because a bare `<!--` line is invalid YAML. The installer strips the `# ` along with the marker. A group inside the YAML list must end with a `false` block, and every block, `false` included, must hold at least one list item, because the `none` stub and an empty block both break the YAML. This is why `bkit-utility-update-roadmap` and `bkit-utility-update-tracker` carry `- Bash` in every block, and `bkit-audit-generate` carries `- WebSearch` in every block.

### Per-tracker group (`github` / `linear` / `jira`)

Every call site is one group of consecutive `github` → `linear` → `jira` blocks, optionally followed by a `false` block that holds a substantive no-tracker rendering. Without a `false` block, the no-tracker rendering is a generic message, written at resolution time.

```text
<!-- bkit:tracker github start -->
mcp__github__… call
<!-- bkit:tracker github end -->
<!-- bkit:tracker linear start -->
mcp__linear__… call
<!-- bkit:tracker linear end -->
<!-- bkit:tracker jira start -->
mcp__jira__… call
<!-- bkit:tracker jira end -->
```

Resolution:

- Each tracker → its own block.
- `none` → the group's trailing `false` block, or `_No tracker connected, skip step._` when the group has none.
- A list-number prefix (`3. `) before the group is kept on the kept block or stub.
- A block outside a full group is an orphan. Under `jira`, a group with no `jira` block stays whole, so its markers surface as orphans.

### Conditional blocks (`bkit:tracker true` / `bkit:tracker false`)

These blocks gate content that is the same for every tracker on whether a tracker is wired at all. They are the only markers for the no-tracker case, and there is no `none` marker.

- `<!-- bkit:tracker true start/end -->` — kept when a tracker is connected (`github`, `linear` or `jira`), and removed entirely under `none`, with no stub. It holds shared content, such as a comment's `{BODY}` fence, that is identical for every tracker.
- `<!-- bkit:tracker false start/end -->` — kept only under `none`, and removed when a tracker is wired. It holds substantive no-tracker behaviour (`issue-id-extraction`, `fid-format`, `pr-body-marker`, `pr-body-metadata`). A `false` block directly after a tracker group is that group's `none` rendering. A standalone `false` block is resolved on its own.

```text
<!-- bkit:tracker true start -->
… shared content (kept when wired; removed under none) …
<!-- bkit:tracker true end -->
```

Conditionals are resolved after the group pass, so a group nested inside a kept `true` block resolves first. A removed block consumes its leading newline and indentation, so it leaves no blank gap. An unbalanced `start`/`end` is an orphan.

**Inline form:** a `true` block may sit inside a line to add wired-only words to text `none` shares, e.g. `before<!-- bkit:tracker true start --> wired-only words<!-- bkit:tracker true end --> after`. A removed block also consumes the whitespace right before its marker, so keep exactly one separating space on each side of the inserted words: inside the block, with the `start` marker glued to the text before it, or before the marker, with a space after the `end` marker (`N. <start>words<end> rest` keeps its list number). A `false` block placed right after the `true` block carries the `none` wording when it differs. The `none` render then stays equal to the text outside the blocks (`render/trackers.test.ts` § none render baselines).

**Numbered-step rule:** Never wrap a numbered list item's number inside a `true` block, because under `none` the whole item vanishes and leaves a numbering gap (`1, 6, 7`). For a numbered step whose body is tracker-only:

- Keep `N.` outside the markers.
- Pair the `true` body with a trailing `false` stub.
- Put the `false` block on the same line as `true end`, with a single leading space before the stub, so the stub renders inline (`N. _stub_`) rather than as a dangling continuation:

```text
N. <!-- bkit:tracker true start -->
   … tracker-only body (tracker groups allowed inside) …
   <!-- bkit:tracker true end --><!-- bkit:tracker false start --> _No tracker connected, skip step._<!-- bkit:tracker false end -->
```

This renders `N. <body>` when a tracker is wired, and `N. _No tracker connected, skip step._` under `none`, so the number survives on one line. The bare-`true` "removed, no stub" form is for checklist `- [ ]` gate items, where vanishing is correct because a stub bullet would be noise.

## Interaction catalog

`.bkit/workflows.md` refers to the per-tracker call sites by these names. Each one is an inline `github` / `linear` / `jira` group, and the authoritative bodies are inline in the workflows. In the `none` column, most sites collapse to the generic `_No tracker connected, skip step._`. A few carry a substantive trailing `false` block, shown in the table, for their no-tracker function.

<!-- prettier-ignore -->
| Interaction | Purpose | github | linear | jira | none |
| --- | --- | --- | --- | --- | --- |
| `rule-block` | CAUTION-block tracker/labels/comments rules | rules prose | rules prose | rules prose | "not configured" stub |
| `issue-id-extraction` | Step 1 `ISSUE_ID` resolution: `bkit fids parse --prompt-file` reads the session prompt. No match → `bkit fids parse --branch` on the named `FID` / `feat/{FID}` branch (issue id counts only with a `.bkit/issues.jsonl` feature row); none → `ISSUE_ID=""`, no-issue warning, issue-tied calls skipped; non-slug branch suffix → stop. Never creates an issue | `<id>`, `<github_issue>`, `GitHub issue:`, `ISSUE-N`, `#N`, `owner/repo#N` and `/issues/N` links into the `origin` repo; then FID / branch recovery | `<id>`, `<linear_issue>`, `Linear issue:`, `issue KEY`, `ISSUE-KEY`, `/issue/KEY` links with the `bkit.tracker.linear.team` prefix, a bare key only with `bkit.tracker.linear.team` set; then FID / branch recovery | `<id>`, `<jira_issue>`, `Jira issue:`, `issue KEY`, `ISSUE-KEY`, `/browse/KEY` links on the `bkit.tracker.jira.site` host with the `bkit.tracker.jira.project` prefix, a bare key only with `bkit.tracker.jira.project` set; then FID / branch recovery | no issue; `ISSUE_ID=""` |
| `fid-format` | FID slug regex assertion. `ISSUE_ID` empty (any tracker) → any lowercase slug; a minted FID has no all-digit word; a finished minted name repeats as `-b`, `-c`, … (`bkit fids resolve`) | `^[0-9]+-[a-z0-9-]+$` | `^[a-z]+-[0-9]+-[a-z0-9-]+$` | `^[a-z][a-z0-9]+-[0-9]+-[a-z0-9-]+$` | no strict assert |
| `issue-read` | Read state + labels + body + comments; skipped when `ISSUE_ID` empty | `issue_read` `get` / `get_comments` | `get_issue` / `list_comments` | `getJiraIssue` `view: "evidence"` / `executeRead` `listJiraIssueComments` | skip (vars empty) |
| `issue-scan` | Bounded related-issue scan at design/plan/debug entry — writes each hit's body + comments under a `## #{number} — {title} ({state})` heading to a file (advisory, top 10, never gates); broad keyword search in title+body, all states | `search_issues` for ranking only + per-hit `issue_read` `get` / `get_comments` | `list_issues` + per-hit `list_comments` | `searchJiraIssuesUsingJql` (`text ~` per keyword, inside `bkit.tracker.jira.project`) + per-hit `listJiraIssueComments` | skip stub (no scan) |
| `issue-update-phase` | Step 1: set phase label (`bkit:debug` included; drops `next:*`, `bkit:failed`) + active state | `issue_write` labels | `save_issue_label` per new label, then `save_issue` labels, then `save_issue` state `bkit.tracker.linear.progress` | `editJiraIssue` full label set, then transition to `bkit.tracker.jira.progress` | skip |
| `issue-update-review` | phase Close hand-off (non-terminal) | no-op (label carries) | `save_issue` state `bkit.tracker.linear.review` | transition to `bkit.tracker.jira.review` | skip |
| `issue-update-failed` | Failure Path additive `bkit:failed` | `issue_write` labels | `save_issue_label` per new label, then `save_issue` labels, then `save_issue` state `bkit.tracker.linear.review` | `editJiraIssue` full label set, then transition to `bkit.tracker.jira.review` | skip |
| `issue-update-merged` | Ship terminal — `bkit:merged` + In Review (issue left open; human closes) | `issue_write` `bkit:merged` (no close) | `save_issue_label` per new label, then `save_issue` labels, then `save_issue` state `bkit.tracker.linear.review` | `editJiraIssue` full label set, then transition to `bkit.tracker.jira.review` | skip |
| `issue-update-status` | Projects v2 board status (best-effort) | `projects_write` add / update item | no-op (state carries) | no-op (status carries) | skip |
| `comment-post-step` | new comment per workflow step | `add_issue_comment` | `save_comment` | `addOrEditJiraIssueComment` | skip |
| `issue-blockers-check` | Gate on open blockers | parse body marker → read states | `get_issue` relations | JQL `linkedIssues(KEY, "is blocked by") AND statusCategory != Done` | skip |
| `kill-switch-check` | Terminate if `bkit:auto` absent; skipped when `ISSUE_ID` empty | label check | label check | label check | inactive |
| `pr-body-metadata` | Parse PR-body issue / FID marker; FID-only marker (no issue) → `issueId: null`, `/bkit-auto` fails closed | `pull_request_read` + parse | same (GitHub PR) | same (GitHub PR) | FID-only, no fail-closed |
| `pr-body-marker` | Literal PR-body marker line; no issue → `<!-- bkit:fid={FID} -->` alone | `<!-- bkit:issue=#{ISSUE_ID} bkit:fid={FID} -->` | `<!-- bkit:issue={ISSUE_ID} bkit:fid={FID} -->` | `<!-- bkit:issue={ISSUE_ID} bkit:fid={FID} -->` | `<!-- bkit:fid={FID} -->` |

The set of phase labels, and how additive labels work, are in `.bkit/workflows.md` § Tracker Integration.

## Issue shapes

Workflows read an issue's body and comments (`bkit issues text`), never its title. The title feeds only the FID slug. An issue takes one of three shapes. People file them through the example forms (`.bkit/templates.md` § Issue forms). An issue an agent drafts is filed only once a person confirms it (`.agents/rules.md` § Tracker issue creation), and uses the same section names as `###` headings.

<!-- prettier-ignore -->
| Shape | When | Next command | Sections (**required**) |
| --- | --- | --- | --- |
| idea | how it should work still open | `/bkit-design #N` | **Problem**, **Outcome**, Success criteria, Constraints and non-goals, Decisions already made, Open questions, References |
| change | what to build + how to tell done both known | `/bkit-plan #N`; or `/bkit-build #N` / `build:lite` straight from issue | **Narrative**, **Success Criteria**, Edge Cases, **Derived Test Matrix**, **Tasks**, Open Questions & Assumptions, Breaking Changes & Naming, Out of Scope, References |
| bug | worked / should work, does not | test or CI run already fails → `/bkit-debug #N` on branch fix lands on (`[soak]` if intermittent); nothing fails → `/bkit-debug #N [repro]` (failing test first; `[soak]` too if intermittent) | **Failing test or CI run** (`none yet` allowed), **What happened**, **What should happen**, **Steps to reproduce**, How often, Affected area, Where and when, Evidence, References |

**Change shape syntax** (the plan keeps it word for word):

- Success Criteria: <=5 bullets, each an observable outcome.
- Edge Cases: `| Scenario | Expected Behavior |`.
- Derived Test Matrix: `| Test description | Type | Target file |`. Type = the lowest tier that exercises the test, named as in `docs/testing.md`. Exactly one task covers each row.
- Tasks, in build order, as task group and task blocks (`docs/templates/bkit-plan.md` § Agent Execution Runbook), sized by `package.json` `bkit.workflows.tasks`:
  - Each group holds <= `bkit.workflows.tasks.maxPerGroup` tasks (default 3) and <= `bkit.workflows.tasks.maxTestsPerGroup` `TEST FIRST` tests (default 15).
  - Each task has 1 to `bkit.workflows.tasks.maxTestsPerTask` tests (default 10) across <= `bkit.workflows.tasks.maxTestFilesPerTask` test files (default 3), or `n/a — {reason}` for docs, config, a pure refactor, or E2E / @live only.
  - The fields are the plan's: `CREATE` / `READ` / `UPDATE` / `DELETE` (`` `{symbol}` in `{file}`: {what} `` or `` `{file}`: {what} ``, one line per reference), `DEPENDS ON` (task numbers, in the same or an earlier group), `DONE WHEN`, `TEST FIRST`, and `TEST EXCEPTION` (owner only), which counts once it is committed alone in the plan.
  - An issue's `TEST EXCEPTION` is a request. Convert copies it word for word, `bkit tests green` refuses it (`exception-refused`, or its test-order gaps), and the owner confirms it at the build's Decision Pause, where Accept rewrites it with the owner's reason and date.
  - With a plan file, the build reads both. Where the issue and the plan disagree, the newer text wins, and comments posted after the plan's last commit send the build through convert before any code.

  The form `.github/ISSUE_TEMPLATE/bkit-change.yml` shows the same fields:

  ```text
  <!-- bkit:group 1 start -->
  ### TASK GROUP 1: {title}
  <!-- bkit:task 1 start -->
  - [ ] **TASK 1:** {change}
    - **UPDATE:** `{symbol}` in `{file}`: {what}
    - **READ:** `{file}`: {what}
    - **DONE WHEN:** {verifiable check}
    - **TEST FIRST:**
      - `{test file}` `{test name}` fails on {what goes wrong}
  <!-- bkit:task 1 end -->
  <!-- bkit:task 2 start -->
  - [ ] **TASK 2:** {change}
    - **CREATE:** `{new file}`: {what}
    - **DELETE:** `{symbol}` in `{file}`: {what}
    - **DEPENDS ON:** 1
    - **DONE WHEN:** {verifiable check}
    - **TEST FIRST:**
      - `{test file}` `{test name}` fails on {what goes wrong}
    - **TEST EXCEPTION:**
      - `{test file}` `{test name}` — {owner's reason}
  <!-- bkit:task 2 end -->
  <!-- bkit:group 1 end -->
  ```

- `/bkit-build` with no plan converts the issue into a plan first. `build:lite` checks neither `DONE WHEN` nor `TEST FIRST`. Nothing ticks issue boxes.

**Machine-read lines** — exact syntax, anywhere in the body. Nothing else in References is fetched:

<!-- prettier-ignore -->
| Line | Read by | Effect |
| --- | --- | --- |
| `**Parent design:** [{FID}-design.md](https://github.com/{OWNER_REPO}/blob/dev/docs/plans/{YYYYMM}/{FID}-design.md)` | plan Step 1 | sets `PARENT_FID` → design = spec source; absent → the design made on the same issue (`bkit fids design`) |
| `**Workstreams:** WS-1, WS-2` | plan Step 1 (`bkit fids design`) | the `WS-N` ids the plan covers → plan-generate Context; plan scoped to those workstreams of the parent design; absent → the whole design |
| `**Audit reports:** docs/audits/{YYYYMM}/{slug}.md (findings {ids})` | plan Step 1 | each path → `AUDIT_PATHS`; path not a file → Failure Path |
| `###### bkit:blocked-by start` · `- #{N}` per line · `###### bkit:blocked-by end` | build `issue-blockers-check` (github; linear / jira → native relations) | any listed issue open → build stops |
| `###### bkit:ignore-earlier` | `bkit issues text` | drops all earlier content; human-placed only |
| `###### bkit:generated {hash}` (comment first line; Jira HTML `<h6>bkit:generated {hash}</h6>`) | `bkit issues text`; `--post` dedup | comment dropped from input; same hash on the issue → not posted again |

**References** — exact strings agents can search: an issue as `#N — {title}` (linear / jira `KEY-N — {title}`), a doc as `{path} § {section}`, and a ledger row as `docs/{ledger}.jsonl` key `` `{key}` ``. Labels: one type label and one `next:*` label (`.agents/rules.md` § Tracker next labels). The type label is `enhancement` / `bug` on github, and the team's own on linear (default `Improvement` / `Feature` / `Bug`). Jira has none, because the issue type carries the type. Never add a phase label or a `bkit:*` label, because workflows set them (`.bkit/workflows.md` § Tracker Integration).

**Drafting from bkit output** — suggest only. File an issue only after a person confirms it:

<!-- prettier-ignore -->
| Source | Shape | Carry |
| --- | --- | --- |
| audit run, tracker wired, no open audit parent for its template (`Parent: missing`) | audit parent (below) | template path line |
| audit `Suggested Issues` row | by `Next Step`: `/bkit-design` → idea; `/bkit-plan`, `/bkit-build`, `build:lite` → change; `/bkit-debug`, `debug:lite` → bug; `manual` → plain task | `**Audit reports:**` line with row's finding IDs; sub-issue of the template's audit parent (linear → `parentId`; jira → `parent`) |
| design `Suggested Plans` (`P-N`; 2+ → design summary next step; 1 → planned on the design's own issue) | one issue per plan, never per workstream; title = plan name; body = its deliverable and covered workstream scopes, spec left to design; filed in `Requires` order | `**Parent design:**` line; `**Workstreams:**` line = its `Covers` ids; blocked-by block = plan issues filed for its `Requires` (linear → `blockedBy` relation; jira → `Blocks` link, `inwardIssue` = blocker) |
| roadmap item with no issue (ledger row, audit candidate) | by recommended command, as audit row | ledger `key` / report path in References |

**Audit parent** — one standing issue per audit template, shared by every run of that template. There is never one per run, and never one across templates.

<!-- prettier-ignore -->
| Field | Value |
| --- | --- |
| Title | template H1 (`Security Audit`) |
| Body | names `docs/templates/bkit-audit-{slug}.md` verbatim (`@bkit-audit-generate` finds the parent by this path); run line `@bkit-audit-generate docs/templates/bkit-audit-{slug}.md #{N}` (linear / jira `KEY-N`); report path `docs/audits/{YYYYMM}/{slug}.md` |
| Labels | project's own (e.g. `maintenance`); no workflow, `next:*` or `bkit:*` label — it runs no workflow |
| Milestone | project's own, the way the repo already assigns milestones; none fits → empty |
| State | stays open; runs never close it; filed issues reference it as `#N — {title}`, never `Closes #N` |
| Children | every issue filed from its runs' `Suggested Issues`, always (github sub-issues; linear `parentId`; jira `parent`) |
| Comments | one `### Audit Summary: {slug}` comment per run — posted by the run when named or found; a newly filed parent gets the run's saved `parent-comment.md` as its first comment |

## github — Projects v2 board (optional)

`issue-update-status` reads `package.json` `bkit.tracker.github` = `{ project, progress, review }`, which is non-secret and committed, and has the same shape as `bkit.tracker.linear` / `bkit.tracker.jira`:

<!-- prettier-ignore -->
| Key | Value | Default |
| --- | --- | --- |
| `project` | Board URL as the browser shows it: `https://github.com/orgs/<org>/projects/<n>` or `https://github.com/users/<login>/projects/<n>`; a trailing `/views/<n>` is fine. `false` = board sync off (silences `github-project-board-sync-unconfigured`). | absent → board sync skipped |
| `progress` | Status option name set when a phase starts | `In progress` |
| `review` | Status option name set on hand-off | `In review` |

The defaults match GitHub's Kanban and Team planning board templates. A `/orgs/` URL → MCP `owner_type: "org"`, and a `/users/` URL → `"user"`.

Board sync needs the `projects` toolset in `.mcp.json` (`X-MCP-Toolsets`) and a `BKIT_GH_TOKEN` that reaches the board:

- An org board needs a fine-grained PAT with org Projects R/W.
- A personal board, or a token spanning owners, needs a classic PAT with `project`.

`update_project_item` finds the item by `item_owner` / `item_repo` / `issue_number`, and sets Status by option name. The sync is best-effort and never gates: a failure is retried once after 5s, and then the workflow continues. `Done` is never written: the ship terminal sets `review`, and a human moves the item to Done on acceptance (§ `issue-update-merged` in `.bkit/workflows.md`).

## linear — notes

Linear `ISSUE_ID`s carry the team prefix (e.g. `TEAM-123`), and the FID inherits it (`team-123-slug`). GitHub FIDs are numeric-only (`123-slug`). With no issue, the FID is a lowercase slug (a minted one has no all-digit word), and the PR marker is FID-only. Cross-provider scripts must tolerate all three shapes. `bkit repo info` prints `trackerTeam` / `trackerProject` from `package.json` `bkit.tracker.linear.team` / `bkit.tracker.linear.project`. When they are null, the related search is unscoped. Linear has no separate project board: the issue state carries the status, so `issue-update-status` is a no-op.

Linear `save_issue` is all-or-nothing: one state or label name the team lacks rejects the whole call, valid fields included, and Linear never creates the missing name. A default team has states Backlog / Todo / In Progress / Done / Canceled / Duplicate and labels Improvement / Feature / Bug. Workflows therefore write labels and state in separate calls, labels first. Each label the transition adds (`add` from `bkit issues labels` / `bkit workflows fail`) is created first with `save_issue_label({ name })`, as a workspace label. An `already exists` answer counts as done. Phase start sets state `bkit.tracker.linear.progress` (default `started`, a state type every team has). Hand-off, Failure Path and ship terminal set state `bkit.tracker.linear.review` (default `In Review`); on a team without it the state call fails alone, is logged `Unapplied`, and the issue keeps its started state while `bkit:merged` / `bkit:failed` carry the hand-off. Label names resolve case-insensitively.

## jira — setup and notes

bkit supports Jira Cloud only. `ISSUE_ID` is the issue key (`PROJ-123`), which gives the FID `proj-123-slug`. With no issue, the FID is a lowercase slug (a minted one has no all-digit word), and the PR marker is FID-only. The MCP server `jira` is the Atlassian Rovo MCP at `https://mcp.atlassian.com/v2/mcp`, with the header `Authorization: Bearer ${BKIT_JIRA_API_KEY}`. The engine speaks to the same server over HTTP with the same key (`initialize` → `Mcp-Session-Id` → `tools/call`), through `getJiraIssue`, `executeRead`, `addOrEditJiraIssueComment`, `editJiraIssue`, `transitionJiraIssue` and `searchJiraIssuesUsingJql`. The `jira` MCP server is the fallback when a verb prints `tracker.done: false`. Workflows run locally, and no Jira-side trigger starts cloud runs.

<!-- prettier-ignore -->
| `package.json` `bkit.tracker.jira` key | Value |
| --- | --- |
| `site` | `https://<site>.atlassian.net` — every call's `cloudId`; bare `<site>` rejected |
| `project` | project key (`PROJ`); scopes related search + `bkit-utility-update-tracker`; absent → unscoped |
| `progress` | status phase start moves to; default `In Progress` |
| `review` | status hand-off, Failure Path and ship terminal move to; default `In Review` |

**Setup** (once):

1. An org admin opens https://admin.atlassian.com → the org that owns `<site>.atlassian.net` → **Rovo** → **Rovo MCP server** (or searches the admin for `mcp`) → **Authentication**, and turns **Allow API token authentication** on. Under **Permissions**, allow **Read**, **Write** and **Search**. **Delete** and **Manage** are not needed. **Connectors** is the wrong page, and **Domains** applies to OAuth only.
2. Each person opens https://id.atlassian.com/manage-profile/security/api-tokens → **Create API token with scopes** (not classic) → app **Atlassian MCP V2** (not **Jira**, not **Atlassian MCP**) → the Jira read / write / search scopes (`read:jira:agent-interface`, `write:jira:agent-interface`, `search:jira:agent-interface`). Copy the token, which is shown once, into `BKIT_JIRA_API_KEY` in `.bkit/.env`, then run `direnv allow`. The token works on MCP only, and the Jira REST API answers 401.
3. Run `bkit install --tracker=jira`, then set `bkit.tracker.jira.site` and `bkit.tracker.jira.project`. In Claude Code, approve the project `.mcp.json` once in an interactive `claude` session. Until then, `claude mcp list` shows "Pending approval".

**Behaviour workflows rely on:**

- Status changes only by transition. Workflows list the issue's transitions (`executeRead` `listJiraIssueTransitions`) and fire the one whose `to.name` = the target status. When none matches, the status change is `Unapplied`, and the labels still land. Basic team-managed boards may lack `In Review`, so set `bkit.tracker.jira.review` to a status the board has.
- Labels: `getJiraIssue` returns them only with `view: "evidence"` (or `"full"`). `editJiraIssue` replaces the whole set. Jira creates a label on first use. Stored labels are case-sensitive, and JQL search is not.
- Comments are posted as markdown, stored as Atlassian Document Format, and read back as markdown with the same meaning but not the same bytes (`-` bullets → `*`, `*em*` → `_em_`, extra blank lines; checkboxes and `> [!NOTE]` alerts come back escaped). One comment that Jira cannot express in markdown (a mention, an image, a panel) turns its whole page to HTML (`appliedContentFormat: "html"`), so reads by the engine and by the MCP fallback re-read that page one comment per call. A comment holds at most 32,767 characters, so the engine splits a longer one at line breaks into consecutive comments, each opening with `###### bkit:generated` and then `_(part i/n)_`.
- Blockers use the native `Blocks` link. `createJiraIssueLink` reads backwards: `inwardIssue` = the blocker, and `outwardIssue` = the blocked issue.
- There are no type labels: the issue type (Bug / Task / Story) carries the type.

<!-- prettier-ignore -->
| Symptom | Fix |
| --- | --- |
| Only 4 tools listed (`getTeamworkGraphContext` …), no Jira tools | URL `/v2/mcp`, not `/v1/mcp` |
| Every call: `Cloud id: … isn't explicitly granted by the user` | Scoped **Atlassian MCP V2** token sent as `Bearer`, not classic token or `Basic` |
| `missing the scope claim` | Classic token → create token with scopes |
| `Failed to fetch cloud ID for: <site>` | `bkit.tracker.jira.site` = full `https://<site>.atlassian.net` |
| `Request must be an initialize request if no session ID is provided` (scripted call) | `initialize` first, then send `Mcp-Session-Id` |
| HTTP 403 Cloudflare 1010 (scripted call) | Send a non-default `User-Agent` |
