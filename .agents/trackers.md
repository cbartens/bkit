# Trackers

> [!CAUTION]
> **Purpose:** Per-tracker definitions consumed by `bkit install --tracker=<name>` to substitute tracker-specific prose into `.agents/workflows/bkit-*.md` during the mirror pass to `.claude/commands/` and `.cursor/commands/`.
>
> **Rules:**
>
> - Token-efficient dense phrasing; agent / installer readers only.
> - Before writing, cross-check `.agents/docs.md` — verify topic does NOT belong in other doc.
> - Three trackers supported: `github` (default), `linear` (opt-in), `none` (no tracker wired).
> - Every tracker section MUST define ALL snippet IDs in the same order. Missing snippet = install-time substitution gap.
> - When a workflow gains a new tracker-specific call site, add the matching snippet ID to **every** tracker section before inserting the marker pair in the workflow source.
> - Adding a new tracker (Jira, etc.): append a `## <name>` section, add the enum value to `.agents/scripts/bkit-manifest.ts`, document the MCP server config under `mcpServers.<name>` in `.agents/templates/.mcp.json` and `.agents/templates/.cursor/mcp.json`. No workflow rewrites.

## Substitution contract

Workflow source files mark substitution points with HTML-comment marker pairs:

```markdown
<!-- bkit:tracker {snippet-id} start -->

> _Tracker not wired — skip._

<!-- bkit:tracker {snippet-id} end -->
```

At install time, the installer:

1. Reads `bkit.issueTracker` from the consumer manifest (`github` | `linear` | `none`, default `none`)
2. Finds each `<!-- bkit:tracker {snippet-id} start -->` marker in a workflow source
3. Extracts the `### {snippet-id}` sub-section body from the chosen tracker's `## {tracker}` section below
4. Replaces everything between the marker pair with that body
5. Writes the result to `.claude/commands/bkit-*.md` and `.cursor/commands/bkit-*.md`

Re-runnable: source `.agents/workflows/*.md` always has the no-tracker fallback content between markers. Switching trackers (`bkit install --tracker=linear` after running with `github`) does a fresh substitution against the source. Idempotent.

## Snippet IDs

Every tracker section MUST define these sub-sections (snippet IDs):

| Snippet ID            | What it provides                                                                     |
| --------------------- | ------------------------------------------------------------------------------------ |
| `rule-block`          | Header rule lines (Tracker / Labels / Comments) for the workflow's CAUTION block     |
| `issue-id-extraction` | Step 1 ISSUE_ID extraction patterns + fallback create-issue call                     |
| `fid-format`          | FID slug format regex and example                                                    |
| `issue-read`          | Read issue state + labels + body + comments                                          |
| `issue-update-phase`  | Set phase label + state for current workflow                                         |
| `issue-update-failed` | Failure Path label + state update                                                    |
| `issue-update-debug`  | Debug additive label + state update                                                  |
| `issue-update-merged` | Ship terminal state update                                                           |
| `comment-post-step`   | Per-step comment post (NEW comment, MCP-only, no edit)                               |
| `phase-labels`        | Mapping of workflow names to phase labels                                            |
| `kill-switch-check`   | After `issue-read`: detect missing `bkit:auto` and propagate kill switch to PR label |
| `pr-body-metadata`    | PR body marker for cross-workflow issue/FID resolution                               |

`none` defines the same snippet IDs, but every body is a single-line stub.

---

## github

GitHub Issues + Projects v2. Default tracker.

### rule-block

> - **Tracker:** GitHub Issues via MCP server `github` (configured in `.mcp.json` `mcpServers.github`). Tool names: `mcp__github__issue_read` (methods: `get`, `get_comments`, `get_labels`), `mcp__github__issue_write` (methods: `create`, `update`), `mcp__github__add_issue_comment`, `mcp__github__list_issues`. All writes best-effort; NEVER gate. **If** failure → retry once after 5s, then continue.
> - **Labels:** Phase labels `bkit:design`, `bkit:plan`, `bkit:build`, `bkit:debug`, `bkit:ship`, `bkit:merged` (mutually exclusive — drop old phase before adding new). Additive labels: `bkit:auto` (CI-router trigger gate), `bkit:failed` (Failure Path), `bkit:debug` (Debug workflow active, additive — phase label persists).
> - **Comments:** NEW comment per workflow step via `mcp__github__add_issue_comment`. NEVER edit, paraphrase, summarise, truncate, deduplicate, or reorder prior content. Comment ID tracking NOT required.

### issue-id-extraction

**If** `ISSUE_ID` already set by AGENTS.md → skip. **Else** extract from prompt: `<id>{N}</id>`, `<github_issue>{N}</github_issue>`, `GitHub issue: #{N}`, `ISSUE-{N}`, or bare `#{N}` → numeric N → `ISSUE_ID`. **If** no `ID` found → create new issue → `mcp__github__issue_write({ method: "create", owner: "{OWNER}", repo: "{REPO}", title: "{task}", body: "{input}", labels: ["bkit:design", "bkit:auto"] })` → extract `number` and use as `ISSUE_ID`. **If** `number` empty → **Failure Path**.

### fid-format

**Format:** `{ISSUE_ID}-{slug}` — no prefix, slug ≤3 tokens, kebab, lowercase, no stopwords (e.g. `123-add-foo-bar`). Assert format `[[ "{FID}" =~ ^[0-9]+-[a-z0-9-]+$ ]]`. **Else** → **Failure Path**.

### issue-read

`mcp__github__issue_read({ method: "get", owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID} })` → extract `state` (`open`/`closed`), `labels[].name` → `LABELS`, `body` → `DESCRIPTION`.

`mcp__github__issue_read({ method: "get_comments", owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, perPage: 100 })` → extract comments → `COMMENTS`.

### issue-update-phase

Add `bkit:{phase}` to `{LABELS}` and drop other `bkit:design|plan|build|ship|merged` phase labels (additive `bkit:debug`, `bkit:auto`, `bkit:failed` preserved) → `mcp__github__issue_write({ method: "update", owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, labels: [{LABELS}] })`.

### issue-update-failed

Add `bkit:failed` to `{LABELS}` (prior phase label persists, additive) → `mcp__github__issue_write({ method: "update", owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, labels: [{LABELS}] })`.

### issue-update-debug

Add `bkit:debug` to `{LABELS}` (additive — phase label persists) → `mcp__github__issue_write({ method: "update", owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, labels: [{LABELS}] })`.

### issue-update-merged

Drop all `bkit:*` phase labels, add `bkit:merged`, drop `bkit:failed` if present → `mcp__github__issue_write({ method: "update", owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, labels: [{LABELS}], state: "closed", state_reason: "completed" })`.

### comment-post-step

`mcp__github__add_issue_comment({ owner: "{OWNER}", repo: "{REPO}", issue_number: {ISSUE_ID}, body: "{BODY}" })` — NEW comment, no edit. Each workflow step posts ONE new comment with its output.

### phase-labels

| Workflow      | Phase label                                    |
| ------------- | ---------------------------------------------- |
| `bkit-design` | `bkit:design`                                  |
| `bkit-plan`   | `bkit:plan`                                    |
| `bkit-build`  | `bkit:build`                                   |
| `bkit-debug`  | `bkit:debug` (additive — phase label persists) |
| `bkit-ship`   | `bkit:ship` (→ `bkit:merged` on close)         |

### kill-switch-check

After reading issue (`issue-read`): **If** `bkit:auto` NOT in `LABELS` → kill switch active → remove PR label `bkit:auto` if PR exists (`mcp__github__update_pull_request({ owner: "{OWNER}", repo: "{REPO}", pull_number: {PR_NUMBER}, labels: [labels minus bkit:auto] })`) → terminate workflow normally (current run finishes, no further automation).

### pr-body-metadata

When `bkit-build` opens the PR, the body template includes a metadata marker:

```html
<!-- bkit:issue=#{ISSUE_ID} bkit:fid={FID} -->
```

HTML comment, invisible in rendered PR body. Downstream workflows (debug, ship, ci-router) resolve issue ID and FID by reading PR body via `mcp__github__pull_request_read({ method: "get", owner: "{OWNER}", repo: "{REPO}", pull_number: {PR_NUMBER} })` and parsing the marker.

**Fail-closed:** missing or malformed marker → terminate workflow + remove PR label `bkit:auto`.

---

## linear

Linear (opt-in). Keep available for consumers who prefer Linear as the canonical tracker.

### rule-block

> - **Tracker:** Linear via MCP server `linear` (configured in `.mcp.json` `mcpServers.linear`). Tool names: `mcp__linear__get_issue`, `mcp__linear__save_issue`, `mcp__linear__save_comment`, `mcp__linear__list_comments`, `mcp__linear__list_issues`. All `save_*` writes best-effort; NEVER gate. **If** failure → retry once after 5s, then continue.
> - **Labels:** Phase labels `bkit:design`, `bkit:plan`, `bkit:build`, `bkit:debug`, `bkit:ship`, `bkit:merged` (mutually exclusive — drop old phase before adding new). Additive labels: `bkit:auto` (CI-router trigger gate), `bkit:failed` (Failure Path), `bkit:debug` (Debug workflow active, additive — phase label persists).
> - **Comments:** NEW comment per workflow step via `mcp__linear__save_comment` (with `issueId`, no `id` — creates new comment). NEVER edit, paraphrase, summarise, truncate, deduplicate, or reorder prior content. Uniform with GitHub provider — no edit-in-place.

### issue-id-extraction

**If** `ISSUE_ID` already set by AGENTS.md → skip. **Else** extract from prompt: `<id>{ID}</id>`, `<linear_issue>{ID}</linear_issue>`, `Linear issue: {ID}`, `ISSUE-{ID}`, or scan for `[A-Z]+-\d+` pattern → first match → `ISSUE_ID`. **If** no `ID` found → create new issue → `mcp__linear__save_issue({ title: "{task}", description: "{input}", team: "{LINEAR_TEAM}", assignee: "me", state: "In Progress", labels: ["bkit:design", "bkit:auto"] })` → extract `id` and use as `ISSUE_ID`. **If** `id` empty → **Failure Path**. `LINEAR_TEAM` = `bkit.linearTeam` from manifest.

### fid-format

**Format:** `{ISSUE_ID}-{slug}` — Linear ISSUE_ID lowercased (e.g. `bar-123-add-foo`), slug ≤3 tokens, kebab, lowercase, no stopwords. Assert format `[[ "{FID}" =~ ^[a-z]+-[0-9]+-[a-z0-9-]+$ ]]`. **Else** → **Failure Path**.

> Note: Linear ISSUE_IDs carry a team prefix (e.g. `BAR-123`) — FID inherits it. GitHub FIDs are numeric-only (`123-slug`). Cross-provider scripts MUST tolerate both shapes.

### issue-read

`mcp__linear__get_issue({ id: "{ISSUE_ID}" })` → extract `state.name` → `STATE`, `labels[].name` → `LABELS`, `description` → `DESCRIPTION`.

`mcp__linear__list_comments({ issueId: "{ISSUE_ID}", orderBy: "createdAt desc", limit: 250 })` → extract comments → `COMMENTS`.

### issue-update-phase

Add `bkit:{phase}` to `{LABELS}` and drop other `bkit:design|plan|build|ship|merged` phase labels (additive `bkit:debug`, `bkit:auto`, `bkit:failed` preserved) → `mcp__linear__save_issue({ id: "{ISSUE_ID}", state: "In Progress", labels: [{LABELS}] })`.

### issue-update-failed

Add `bkit:failed` to `{LABELS}` (prior phase label persists, additive) → `mcp__linear__save_issue({ id: "{ISSUE_ID}", state: "In Review", labels: [{LABELS}] })`.

### issue-update-debug

Add `bkit:debug` to `{LABELS}` (additive — phase label persists) → `mcp__linear__save_issue({ id: "{ISSUE_ID}", state: "In Review", labels: [{LABELS}] })`.

### issue-update-merged

Drop all `bkit:*` phase labels, add `bkit:merged`, drop `bkit:failed` if present → `mcp__linear__save_issue({ id: "{ISSUE_ID}", state: "Done", labels: [{LABELS}] })`.

### comment-post-step

`mcp__linear__save_comment({ issueId: "{ISSUE_ID}", body: "{BODY}" })` — no `id` field → NEW comment. Each workflow step posts ONE new comment with its output.

### phase-labels

| Workflow      | Phase label                                    |
| ------------- | ---------------------------------------------- |
| `bkit-design` | `bkit:design`                                  |
| `bkit-plan`   | `bkit:plan`                                    |
| `bkit-build`  | `bkit:build`                                   |
| `bkit-debug`  | `bkit:debug` (additive — phase label persists) |
| `bkit-ship`   | `bkit:ship` (→ `bkit:merged` on close)         |

### kill-switch-check

After reading issue (`issue-read`): **If** `bkit:auto` NOT in `LABELS` → kill switch active → if a tracking GitHub PR exists for this work, remove PR label `bkit:auto` via `mcp__github__update_pull_request` → terminate workflow normally (current run finishes, no further automation).

> Cross-provider note: Linear is the tracker but the CI dispatch surface is still GitHub. Kill switch must propagate to the GitHub PR label so PR-label-triggered ci-router stops firing.

### pr-body-metadata

When `bkit-build` opens the GitHub PR, the body template includes a metadata marker:

```html
<!-- bkit:issue={ISSUE_ID} bkit:fid={FID} -->
```

(Linear ISSUE_ID like `BAR-123` — no `#` prefix since it's not a GitHub issue number.) HTML comment, invisible in rendered PR body. Downstream workflows resolve via `mcp__github__pull_request_read` + marker parsing.

**Fail-closed:** missing or malformed marker → terminate workflow + remove PR label `bkit:auto`.

---

## none

No tracker wired. Base `bkit install` (without `--tracker=`) lands this. Workflows run, but every tracker call is a no-op + one-line log.

### rule-block

> - **Tracker:** not configured. Run `bkit install --tracker=github` (or `--tracker=linear`) to enable tracker integration. Workflows will continue to run without tracker comments / state updates.

### issue-id-extraction

**If** `ISSUE_ID` already set by AGENTS.md → skip. **Else** scan prompt for `<id>{ID}</id>` or `ISSUE-{ID}` → first match → `ISSUE_ID`. **If** no `ID` found → set `ISSUE_ID=""` and log `Tracker not wired — proceeding without issue ID.` Workflow continues with FID derived from branch name.

### fid-format

**Format:** `{ISSUE_ID}-{slug}` if `ISSUE_ID` set, else `{branch-suffix}-{slug}`. Slug ≤3 tokens, kebab, lowercase. No strict regex assert.

### issue-read

_Tracker not wired — skip issue read. Log `Tracker not wired — STATE/LABELS/DESCRIPTION/COMMENTS empty.`_

### issue-update-phase

_Tracker not wired — skip._

### issue-update-failed

_Tracker not wired — skip._

### issue-update-debug

_Tracker not wired — skip._

### issue-update-merged

_Tracker not wired — skip._

### comment-post-step

_Tracker not wired — skip comment post._

### phase-labels

_Tracker not wired — phase labels not applied._

### kill-switch-check

_Tracker not wired — kill switch inactive (workflow proceeds unconditionally)._

### pr-body-metadata

PR body still gets the marker, just without verified issue resolution:

```html
<!-- bkit:fid={FID} -->
```

(`bkit:issue=` omitted when `ISSUE_ID` is empty.) Downstream workflows read FID; tracker calls remain no-ops.
