# Trackers

{{BKIT_MANAGED_MARKER}}

> [!CAUTION]
> **Purpose:** Reference for inline tracker-block model in `.bkit/core/workflows/bkit-*.md` and `.bkit/core/prompts/bkit-*.md`. **Not consumed by installer** — no `trackers.md` substitution. Per-tracker call bodies (`github` / `linear` / `jira`, plus `false` for no tracker) live INLINE at each workflow call site; this file documents marker contract, cross-cutting per-tracker conventions, and the issue shapes workflows read (§ Issue shapes).
>
> **Rules:**
>
> - Use dense token-efficient phrasing; no filler / hedging / restating; tables > prose, bullets > paragraphs.
> - Describe current state / rules, not reasons / history; state what to do, not why.
> - Check `.agents/docs.md` index first and confirm topic belongs in this doc, not another. Label semantics live in `.bkit/workflows.md` § Tracker Integration; this file is the marker contract + operational per-tracker reference.
> - Ships to consumers: describe the current setup only. NEVER an internal identifier (tracker issue number, ledger key, review-finding id) and NEVER project history — decisions belong in `docs/decisions.jsonl`, incidents in `docs/knowledge.jsonl`.
> - Four values: `github`, `linear`, `jira`, `none` (no tracker wired, the default).
> - New tracker: add enum to `.bkit/core/engine/install/manifest.ts`; document MCP under `mcpServers.<name>` in `.bkit/shared/.mcp.json` and `.bkit/shared/.cursor/mcp.json`; add `<!-- bkit:tracker <name> -->` block after the last tracker block at every call site (extend `GROUP_RE` in `.bkit/core/engine/render/trackers.ts`). No `none` marker — no-tracker content is `false`.

## Marker contract

Workflow and prompt sources carry wired tracker variants inline. Installer reads `bkit.tracker.default` from consumer manifest, resolves markers when mirroring `.bkit/core/workflows/bkit-*.md` to every host's commands / skills and `.bkit/core/prompts/bkit-*.md` to every host's agents (`.bkit/core/engine/render/trackers.ts`). Mirrors clean — no markers survive.

Prompt frontmatter `tools:` lists: every marker must be a YAML comment (`  # <!-- bkit:tracker github start -->`) — a bare `<!--` line is invalid YAML; installer strips the `# ` with the marker. A group inside the YAML list must end with a `false` block, and every block (incl. `false`) must hold at least one list item — the `none` stub and an empty block both break the YAML. `bkit-utility-update-roadmap` and `bkit-utility-update-tracker` carry `- Bash`, `bkit-audit-generate` `- WebSearch`, in every block for this.

### Per-tracker group (`github` / `linear` / `jira`)

Every call site = consecutive `github` → `linear` → `jira` group, optionally trailing `false` block (substantive no-tracker rendering). Without `false`, no-tracker rendering = generic message at resolution time.

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

Resolution: each tracker → its own block; `none` → group's trailing `false` block if present, else **`_No tracker connected, skip step._`**. List-number prefix (`3. `) before group preserved on kept block / stub. A block outside a full group = orphan; under `jira`, a group with no `jira` block stays whole, so its markers surface as orphans.

### Conditional blocks (`bkit:tracker true` / `bkit:tracker false`)

Boolean tracker-presence gates for tracker-agnostic content. only no-tracker markers — no `none` marker.

- `<!-- bkit:tracker true start/end -->` — kept when tracker connected (`github`, `linear` or `jira`); **removed entirely under `none`** (no stub). Shared content e.g. comment `{BODY}` fence identical for every tracker.
- `<!-- bkit:tracker false start/end -->` — kept only under `none`; removed when wired. Substantive no-tracker behaviour (`issue-id-extraction`, `fid-format`, `pr-body-marker`, `pr-body-metadata`). `false` directly after a tracker group = group's `none` rendering; standalone `false` resolved on its own.

```text
<!-- bkit:tracker true start -->
… shared content (kept when wired; removed under none) …
<!-- bkit:tracker true end -->
```

Conditionals resolved after group pass — group nested inside kept `true` resolves first. Removed block consumes leading newline + indentation (no blank gap). Unbalanced `start`/`end` = orphan.

**Inline form:** a `true` block may sit inside a line to add wired-only words to text `none` shares, e.g. `before<!-- bkit:tracker true start --> wired-only words<!-- bkit:tracker true end --> after`. A removed block also consumes the whitespace right before its marker, so keep exactly one separating space on each side of the inserted words: inside the block, with the `start` marker glued to the text before it, or before the marker, with a space after the `end` marker (`N. <start>words<end> rest` keeps its list number). A `false` block placed right after the `true` block carries the `none` wording when it differs. The `none` render then stays equal to the text outside the blocks (`render/trackers.test.ts` § none render baselines).

**Numbered-step rule:** never wrap numbered list item's NUMBER inside `true` block — under `none` whole item vanishes → numbering gap (`1, 6, 7`). Numbered step with tracker-only body: keep `N.` outside markers; pair `true` body with trailing `false` stub. Put `false` on same line as `true end`, single leading space before stub → inline (`N. _stub_`) not dangling continuation:

```text
N. <!-- bkit:tracker true start -->
   … tracker-only body (tracker groups allowed inside) …
   <!-- bkit:tracker true end --><!-- bkit:tracker false start --> _No tracker connected, skip step._<!-- bkit:tracker false end -->
```

Renders `N. <body>` when wired, `N. _No tracker connected, skip step._` under `none` — number survives, one line. Bare-`true` "removed, no stub" form = **checklist `- [ ]` gate items** (vanishing correct — stub bullet = noise).

## Interaction catalog

Per-tracker call sites referenced across `.bkit/workflows.md` by these names. Each = inline `github` / `linear` / `jira` group; authoritative bodies inline in workflows. `none` column: most sites collapse to generic `_No tracker connected, skip step._`; few carry substantive trailing `false` block (shown) for no-tracker function.

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
| `issue-update-status` | Projects v2 board status (best-effort) | `projects_write` add/update item | no-op (state carries) | no-op (status carries) | skip |
| `comment-post-step` | new comment per workflow step | `add_issue_comment` | `save_comment` | `addOrEditJiraIssueComment` | skip |
| `issue-blockers-check` | Gate on open blockers | parse body marker → read states | `get_issue` relations | JQL `linkedIssues(KEY, "is blocked by") AND statusCategory != Done` | skip |
| `kill-switch-check` | Terminate if `bkit:auto` absent; skipped when `ISSUE_ID` empty | label check | label check | label check | inactive |
| `pr-body-metadata` | Parse PR-body issue/FID marker; FID-only marker (no issue) → `issueId: null`, `/bkit-auto` fails closed | `pull_request_read` + parse | same (GitHub PR) | same (GitHub PR) | FID-only, no fail-closed |
| `pr-body-marker` | Literal PR-body marker line; no issue → `<!-- bkit:fid={FID} -->` alone | `<!-- bkit:issue=#{ISSUE_ID} bkit:fid={FID} -->` | `<!-- bkit:issue={ISSUE_ID} bkit:fid={FID} -->` | `<!-- bkit:issue={ISSUE_ID} bkit:fid={FID} -->` | `<!-- bkit:fid={FID} -->` |

Phase-label set + additive-label semantics: `.bkit/workflows.md` § Tracker Integration.

## Issue shapes

Workflows read issue body + comments (`bkit issues text`), never title (title → FID slug only). Three shapes; human-filed via example forms (`.bkit/templates.md` § Issue forms); agent-drafted issues (human-confirmed only, `.agents/rules.md` § Tracker issue creation) use same section names as `###` headings.

<!-- prettier-ignore -->
| Shape | When | Next command | Sections (**required**) |
| --- | --- | --- | --- |
| idea | how it should work still open | `/bkit-design #N` | **Problem**, **Outcome**, Success criteria, Constraints and non-goals, Decisions already made, Open questions, References |
| change | what to build + how to tell done both known | `/bkit-plan #N`; or `/bkit-build #N` / `build:lite` straight from issue | **Narrative**, **Success Criteria**, Edge Cases, **Derived Test Matrix**, **Tasks**, Open Questions & Assumptions, Breaking Changes & Naming, Out of Scope, References |
| bug | worked / should work, does not | test or CI run already fails → `/bkit-debug #N` on branch fix lands on (`[soak]` if intermittent); nothing fails → `/bkit-debug #N [repro]` (failing test first; `[soak]` too if intermittent) | **Failing test or CI run** (`none yet` allowed), **What happened**, **What should happen**, **Steps to reproduce**, How often, Affected area, Where and when, Evidence, References |

**Change shape syntax** (plan keeps it word for word):

- Success Criteria: <=5 observable outcome bullets.
- Edge Cases: `| Scenario | Expected Behavior |`.
- Derived Test Matrix: `| Test description | Type | Target file |`; Type = lowest tier that exercises it, named per `docs/testing.md`; every row covered by exactly one task.
- Tasks, build order, as plan group and task blocks (`docs/templates/bkit-plan.md` § Agent Execution Runbook), sized by `package.json` `bkit.workflows.tasks`: <= `bkit.workflows.tasks.maxPerGroup` tasks (default 3) and `bkit.workflows.tasks.maxTestsPerGroup` `TEST FIRST` tests (default 15) per group, 1 to `bkit.workflows.tasks.maxTestsPerTask` tests (default 10) across <= `bkit.workflows.tasks.maxTestFilesPerTask` test files (default 3) per task; `n/a — {reason}` for docs, config, pure refactor, or E2E / @live only. Fields as in a plan: `CREATE` / `READ` / `UPDATE` / `DELETE` (`` `{symbol}` in `{file}`: {what} `` or `` `{file}`: {what} ``, one line per reference), `DEPENDS ON` (task numbers, same or earlier group), `DONE WHEN`, `TEST FIRST`, `TEST EXCEPTION` (owner only; counts once committed alone in the plan). An issue's `TEST EXCEPTION` = a request: convert copies it word for word, `bkit tests green` refuses it (`exception-refused` or its test-order gaps), the owner confirms it at the build's Decision Pause, where Accept rewrites it with the owner's reason and date. With a plan file, the build reads both: where the issue and the plan disagree, the newer text wins, and comments posted after the plan's last commit send the build through convert before any code. Form `.github/ISSUE_TEMPLATE/bkit-change.yml` shows the same fields:

  ```text
  <!-- bkit:group 1 start -->
  ### GROUP 1: {title}
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

**Machine-read lines** — exact syntax, anywhere in body; nothing else in References is fetched:

<!-- prettier-ignore -->
| Line | Read by | Effect |
| --- | --- | --- |
| `**Parent design:** [{FID}-design.md](https://github.com/{OWNER_REPO}/blob/dev/docs/plans/{YYYYMM}/{FID}-design.md)` | plan Step 1 | sets `PARENT_FID` → design = spec source; absent → the design made on the same issue (`bkit fids design`) |
| `**Audit reports:** docs/audits/{YYYYMM}/{slug}.md (findings {ids})` | plan Step 1 | each path → `AUDIT_PATHS`; path not a file → Failure Path |
| `###### bkit:blocked-by start` · `- #{N}` per line · `###### bkit:blocked-by end` | build `issue-blockers-check` (github; linear / jira → native relations) | any listed issue open → build stops |
| `###### bkit:ignore-earlier` | `bkit issues text` | drops all earlier content; human-placed only |
| `###### bkit:generated {hash}` (comment first line; Jira HTML `<h6>bkit:generated {hash}</h6>`) | `bkit issues text`; `--post` dedup | comment dropped from input; same hash on the issue → not posted again |

**References** — exact strings agents can search: issue `#N — {title}` (linear / jira `KEY-N — {title}`); doc `{path} § {section}`; ledger row `docs/{ledger}.jsonl` key `` `{key}` ``. Labels: type label (github `enhancement` / `bug`; linear the team's own, default `Improvement` / `Feature` / `Bug`; jira none — issue type carries type) + one `next:*` (`.agents/rules.md` § Tracker next labels); never phase or `bkit:*` labels — workflows set them (`.bkit/workflows.md` § Tracker Integration).

**Drafting from bkit output** (suggest only; file after human confirmation):

<!-- prettier-ignore -->
| Source | Shape | Carry |
| --- | --- | --- |
| audit run, tracker wired, no open audit parent for its template (`Parent: missing`) | audit parent (below) | template path line |
| audit `Suggested Issues` row | by `Next Step`: `/bkit-design` → idea; `/bkit-plan`, `/bkit-build`, `build:lite` → change; `/bkit-debug`, `debug:lite` → bug; `manual` → plain task | `**Audit reports:**` line with row's finding IDs; sub-issue of the template's audit parent (linear → `parentId`; jira → `parent`) |
| design `Suggested Workstreams` (2+; design summary asks) | title = workstream name; body = its scope, spec left to design; filed in `Requires` order | `**Parent design:**` line; blocked-by block = issues filed for its `Requires` (linear → `blockedBy` relation; jira → `Blocks` link, `inwardIssue` = blocker) |
| roadmap item with no issue (ledger row, audit candidate) | by recommended command, as audit row | ledger `key` / report path in References |

**Audit parent** — one standing issue per audit template, shared by every run of that template; never one per run, never one across templates.

<!-- prettier-ignore -->
| Field | Value |
| --- | --- |
| Title | template H1 (`Security Audit`) |
| Body | names `docs/templates/bkit-audit-{slug}.md` verbatim (`@bkit-audit-generate` finds the parent by this path); run line `@bkit-audit-generate docs/templates/bkit-audit-{slug}.md #{N}` (linear / jira `KEY-N`); report path `docs/audits/{YYYYMM}/{slug}.md` |
| Labels | project's own (e.g. `maintenance`); no workflow, `next:*` or `bkit:*` label — it runs no workflow |
| Milestone | one milestone holding every audit parent, when the project keeps one |
| State | stays open; runs never close it; filed issues reference it as `#N — {title}`, never `Closes #N` |
| Children | every issue filed from its runs' `Suggested Issues`, always (github sub-issues; linear `parentId`; jira `parent`) |
| Comments | one `### Audit Summary: {slug}` comment per run — posted by the run when named or found; a newly filed parent gets the run's saved `parent-comment.md` as its first comment |

## github — Projects v2 board (optional)

`issue-update-status` reads `package.json` `bkit.tracker.github` = `{ project, progress, review }` (non-secret, committed), same shape as `bkit.tracker.linear` / `bkit.tracker.jira`:

<!-- prettier-ignore -->
| Key | Value | Default |
| --- | --- | --- |
| `project` | Board URL as the browser shows it: `https://github.com/orgs/<org>/projects/<n>` or `https://github.com/users/<login>/projects/<n>`; a trailing `/views/<n>` is fine. `false` = board sync off (silences `github-project-board-sync-unconfigured`). | absent → board sync skipped |
| `progress` | Status option **name** set when a phase starts | `In progress` |
| `review` | Status option **name** set on hand-off | `In review` |

Defaults match GitHub's Kanban and Team planning board templates. `/orgs/` → MCP `owner_type: "org"`, `/users/` → `"user"`. Requires `projects` toolset in `.mcp.json` (`X-MCP-Toolsets`) + `BKIT_GH_TOKEN` that reaches the board: fine-grained PAT with org Projects R/W for an org board; classic PAT with `project` for a personal board or a token spanning owners. `update_project_item` finds the item by `item_owner` / `item_repo` / `issue_number` and sets Status by option name. Best-effort, never gates; failure → retry once after 5s, then continue. `Done` is **never written** — ship terminal sets `review`, and a human moves the item to Done on acceptance (§ `issue-update-merged` in `.bkit/workflows.md`).

## linear — notes

Linear `ISSUE_ID`s carry team prefix (e.g. `TEAM-123`) — FID inherits (`team-123-slug`). GitHub FIDs numeric-only (`123-slug`). No issue → lowercase-slug FID (minted: no all-digit word), FID-only PR marker. Cross-provider scripts must tolerate all three shapes. `bkit repo info` prints `trackerTeam` / `trackerProject` from `package.json` `bkit.tracker.linear.team` / `bkit.tracker.linear.project` (null → related search unscoped). No separate project board — issue state carries status → `issue-update-status` no-op.

Linear `save_issue` is all-or-nothing: one state or label name the team lacks rejects the whole call, valid fields included, and Linear never creates the missing name. A default team has states Backlog / Todo / In Progress / Done / Canceled / Duplicate and labels Improvement / Feature / Bug. Workflows therefore write labels and state in separate calls, labels first. Each label the transition adds (`add` from `bkit issues labels` / `bkit workflows fail`) is created first with `save_issue_label({ name })`, a workspace label; `already exists` = done. Phase start sets state `bkit.tracker.linear.progress` (default `started`, a state type every team has). Hand-off, Failure Path and ship terminal set state `bkit.tracker.linear.review` (default `In Review`); on a team without it the state call fails alone, is logged `Unapplied`, and the issue keeps its started state while `bkit:merged` / `bkit:failed` carry the hand-off. Label names resolve case-insensitively.

## jira — setup and notes

Jira Cloud only. `ISSUE_ID` = issue key (`PROJ-123`) → FID `proj-123-slug`; no issue → lowercase-slug FID (minted: no all-digit word), FID-only PR marker. MCP server `jira` = Atlassian Rovo MCP `https://mcp.atlassian.com/v2/mcp`, header `Authorization: Bearer ${BKIT_JIRA_API_KEY}`. The engine speaks the same server over HTTP with the same key (`initialize` → `Mcp-Session-Id` → `tools/call`): `getJiraIssue`, `executeRead`, `addOrEditJiraIssueComment`, `editJiraIssue`, `transitionJiraIssue`, `searchJiraIssuesUsingJql`; the `jira` MCP server is the fallback when a verb prints `tracker.done: false`. Workflows run locally; no Jira-side trigger starts cloud runs.

<!-- prettier-ignore -->
| `package.json` `bkit.tracker.jira` key | Value |
| --- | --- |
| `site` | `https://<site>.atlassian.net` — every call's `cloudId`; bare `<site>` rejected |
| `project` | project key (`PROJ`); scopes related search + `bkit-utility-update-tracker`; absent → unscoped |
| `progress` | status phase start moves to; default `In Progress` |
| `review` | status hand-off, Failure Path and ship terminal move to; default `In Review` |

**Setup** (once):

1. Org admin: https://admin.atlassian.com → org owning `<site>.atlassian.net` → **Rovo** → **Rovo MCP server** (or admin search `mcp`) → **Authentication** → **Allow API token authentication** on; **Permissions**: **Read**, **Write**, **Search** allowed (no **Delete** / **Manage** needed). **Connectors** is the wrong page; **Domains** applies to OAuth only.
2. Each person: https://id.atlassian.com/manage-profile/security/api-tokens → **Create API token with scopes** (not classic) → app **Atlassian MCP V2** (not **Jira**, not **Atlassian MCP**) → Jira read / write / search scopes (`read:jira:agent-interface`, `write:jira:agent-interface`, `search:jira:agent-interface`) → copy token (shown once) → `BKIT_JIRA_API_KEY` in `.bkit/.env` → `direnv allow`. Token works on MCP only; Jira REST API answers 401.
3. `bkit install --tracker=jira`; set `bkit.tracker.jira.site` + `bkit.tracker.jira.project`. Claude Code: approve project `.mcp.json` once in an interactive `claude` session (`claude mcp list` shows "Pending approval" until then).

**Behaviour workflows rely on:**

- Status changes only by transition: workflows list the issue's transitions (`executeRead` `listJiraIssueTransitions`) and fire the one whose `to.name` = target status; none → `Unapplied`, labels still land. Basic team-managed boards may lack `In Review` → set `bkit.tracker.jira.review` to a status the board has.
- Labels: `getJiraIssue` returns them only with `view: "evidence"` (or `"full"`); `editJiraIssue` replaces the whole set; Jira creates a label on first use; storage case-sensitive, JQL search not.
- Comments: posted as markdown, stored as Atlassian Document Format, read back as markdown with same meaning, not same bytes (`-` bullets → `*`, `*em*` → `_em_`, extra blank lines; checkboxes and `> [!NOTE]` alerts come back escaped). One comment Jira cannot express in markdown (mention, image, panel) turns its whole page HTML (`appliedContentFormat: "html"`) → the engine and MCP fallback reads re-read that page one comment per call. Max 32,767 characters → the engine splits at line breaks into consecutive comments, each opening `###### bkit:generated` then `_(part i/n)_`.
- Blockers: native `Blocks` link; `createJiraIssueLink` reads backwards — `inwardIssue` = blocker, `outwardIssue` = blocked.
- No type labels: the issue type (Bug / Task / Story) carries type.

<!-- prettier-ignore -->
| Symptom | Fix |
| --- | --- |
| Only 4 tools listed (`getTeamworkGraphContext` …), no Jira tools | URL `/v2/mcp`, not `/v1/mcp` |
| Every call: `Cloud id: … isn't explicitly granted by the user` | Scoped **Atlassian MCP V2** token sent as `Bearer`, not classic token or `Basic` |
| `missing the scope claim` | Classic token → create token with scopes |
| `Failed to fetch cloud ID for: <site>` | `bkit.tracker.jira.site` = full `https://<site>.atlassian.net` |
| `Request must be an initialize request if no session ID is provided` (scripted call) | `initialize` first, then send `Mcp-Session-Id` |
| HTTP 403 Cloudflare 1010 (scripted call) | Send a non-default `User-Agent` |
