# Trackers

{{BKIT_MANAGED_MARKER}}

> [!CAUTION]
> **Purpose:** Reference for inline tracker-block model in `.bkit/core/workflows/bkit-*.md` and `.bkit/core/prompts/bkit-*.md`. **Not consumed by installer** — no `trackers.md` substitution. Per-tracker call bodies (`github` / `linear` / `none`) live INLINE at each workflow call site; this file documents marker contract, cross-cutting per-tracker conventions, and the issue shapes workflows read (§ Issue shapes).
>
> **Rules:**
>
> - Use dense token-efficient phrasing; no filler / hedging / restating; tables > prose, bullets > paragraphs.
> - Describe current state / rules, not reasons / history; state what to do, not why.
> - Check `.agents/docs.md` index first and confirm topic belongs in this doc, not another. Label semantics live in `.bkit/workflows.md` § Tracker Integration; this file is the marker contract + operational per-tracker reference.
> - Ships to consumers: describe the current setup only. NEVER an internal identifier (tracker issue number, ledger key, review-finding id) and NEVER project history — decisions belong in `docs/decisions.jsonl`, incidents in `docs/knowledge.jsonl`.
> - Three trackers: `github` (default), `linear` (opt-in), `none` (no tracker wired).
> - New tracker (Jira, etc.): add enum to `.bkit/core/engine/install/manifest.ts`; document MCP under `mcpServers.<name>` in `.bkit/shared/.mcp.json` and `.bkit/shared/.cursor/mcp.json`; add `<!-- bkit:tracker <name> -->` block alongside `github`/`linear` at every call site (extend pair resolver in `.bkit/core/engine/render/trackers.ts`). No `none` marker — no-tracker content is `false`.

## Marker contract

Workflow and prompt sources carry wired tracker variants inline. Installer reads `bkit.issueTracker` from consumer manifest, resolves markers when mirroring `.bkit/core/workflows/bkit-*.md` to every host's commands / skills and `.bkit/core/prompts/bkit-*.md` to every host's agents (`.bkit/core/engine/render/trackers.ts`). Mirrors clean — no markers survive.

Prompt frontmatter `tools:` lists: every marker must be a YAML comment (`  # <!-- bkit:tracker github start -->`) — a bare `<!--` line is invalid YAML; installer strips the `# ` with the marker. A pair inside the YAML list must end with a `false` block, and every block (incl. `false`) must hold at least one list item — the `none` stub and an empty block both break the YAML. `bkit-utility-update-roadmap` carries `- Bash`, `bkit-audit-generate` `- WebSearch`, in all three blocks for this.

### Per-tracker pair (`github` / `linear`)

Every call site = consecutive `github` → `linear` pair, optionally trailing `false` block (substantive no-tracker rendering). Without `false`, no-tracker rendering = generic message at resolution time.

```text
<!-- bkit:tracker github start -->
mcp__github__… call
<!-- bkit:tracker github end -->
<!-- bkit:tracker linear start -->
mcp__linear__… call
<!-- bkit:tracker linear end -->
```

Resolution: `github` → github block; `linear` → linear block; `none` → pair's trailing `false` block if present, else **`_No tracker connected, skip step._`**. List-number prefix (`3. `) before pair preserved on kept block / stub. Lone `github` or `linear` (no partner) = orphan.

### Conditional blocks (`bkit:tracker true` / `bkit:tracker false`)

Boolean tracker-presence gates for tracker-agnostic content. only no-tracker markers — no `none` marker.

- `<!-- bkit:tracker true start/end -->` — kept when tracker connected (`github` or `linear`); **removed entirely under `none`** (no stub). Shared content e.g. comment `{BODY}` fence identical for github/linear.
- `<!-- bkit:tracker false start/end -->` — kept only under `none`; removed when wired. Substantive no-tracker behaviour (`issue-id-extraction`, `fid-format`, `pr-body-marker`, `pr-body-metadata`). `false` directly after `github`/`linear` pair = pair's `none` rendering; standalone `false` resolved on its own.

```text
<!-- bkit:tracker true start -->
… shared content (kept when wired; removed under none) …
<!-- bkit:tracker true end -->
```

Conditionals resolved after pair pass — pair nested inside kept `true` resolves first. Removed block consumes leading newline + indentation (no blank gap). Unbalanced `start`/`end` = orphan.

**Numbered-step rule:** never wrap numbered list item's NUMBER inside `true` block — under `none` whole item vanishes → numbering gap (`1, 6, 7`). Numbered step with tracker-only body: keep `N.` outside markers; pair `true` body with trailing `false` stub. Put `false` on same line as `true end`, single leading space before stub → inline (`N. _stub_`) not dangling continuation:

```text
N. <!-- bkit:tracker true start -->
   … tracker-only body (github/linear pairs allowed inside) …
   <!-- bkit:tracker true end --><!-- bkit:tracker false start --> _No tracker connected, skip step._<!-- bkit:tracker false end -->
```

Renders `N. <body>` when wired, `N. _No tracker connected, skip step._` under `none` — number survives, one line. Bare-`true` "removed, no stub" form = **checklist `- [ ]` gate items** (vanishing correct — stub bullet = noise).

## Interaction catalog

Per-tracker call sites referenced across `.bkit/workflows.md` by these names. Each = inline `github`/`linear` pair; authoritative bodies inline in workflows. `none` column: most sites collapse to generic `_No tracker connected, skip step._`; few carry substantive trailing `false` block (shown) for no-tracker function.

<!-- prettier-ignore -->
| Interaction | Purpose | github | linear | none |
| --- | --- | --- | --- | --- |
| `rule-block` | CAUTION-block tracker/labels/comments rules | rules prose | rules prose | "not configured" stub |
| `issue-id-extraction` | Step 1 `ISSUE_ID` resolution. No match → stop. Never creates an issue | session prompt scan; no match → stop | session prompt scan; no match → stop | scan session prompt; else `ISSUE_ID=""` |
| `fid-format` | FID slug regex assertion | `^[0-9]+-[a-z0-9-]+$` | `^[a-z]+-[0-9]+-[a-z0-9-]+$` | no strict assert |
| `issue-read` | Read state + labels + body + comments | `issue_read` `get` / `get_comments` | `get_issue` / `list_comments` | skip (vars empty) |
| `issue-scan` | Bounded related-issue scan at design/plan/debug entry — writes each hit's body + comments under a `## #{number} — {title} ({state})` heading to a file (advisory, top 10, never gates); broad keyword search in title+body, all states | `search_issues` for ranking only + per-hit `issue_read` `get` / `get_comments` | `list_issues` + per-hit `list_comments` | skip stub (no scan) |
| `issue-update-phase` | Step 1: set phase label + active state | `issue_write` labels | `save_issue` state+labels | skip |
| `issue-update-review` | phase Close hand-off (non-terminal) | no-op (label carries) | `save_issue` In Review | skip |
| `issue-update-failed` | Failure Path additive `bkit:failed` | `issue_write` labels | `save_issue` In Review | skip |
| `issue-update-debug` | `/bkit-debug` Step 1 additive `bkit:debug` | `issue_write` labels | `save_issue` In Review | skip |
| `issue-update-merged` | Ship terminal — `bkit:merged` + In Review (issue left open; human closes) | `issue_write` `bkit:merged` (no close) | `save_issue` In Review | skip |
| `issue-update-status` | Projects v2 board status (best-effort) | `projects_write` add/update item | no-op (state carries) | skip |
| `comment-post-step` | new comment per workflow step | `add_issue_comment` | `save_comment` | skip |
| `issue-blockers-check` | Gate on open blockers | parse body marker → read states | `get_issue` relations | skip |
| `kill-switch-check` | Terminate if `bkit:auto` absent | label check | label check | inactive |
| `pr-body-metadata` | Parse PR-body issue/FID marker | `pull_request_read` + parse | same (GitHub PR) | FID-only, no fail-closed |
| `pr-body-marker` | Literal PR-body marker line | `<!-- bkit:issue=#{ISSUE_ID} bkit:fid={FID} -->` | `<!-- bkit:issue={ISSUE_ID} bkit:fid={FID} -->` | `<!-- bkit:fid={FID} -->` |

Phase-label set + additive-label semantics: `.bkit/workflows.md` § Tracker Integration.

## Issue shapes

Workflows read issue body + comments (`bkit issues text`), never title (title → FID slug only). Three shapes; human-filed via example forms (`.bkit/templates.md` § Issue forms); agent-drafted issues (human-confirmed only, `.agents/rules.md` § Tracker issue creation) use same section names as `###` headings.

<!-- prettier-ignore -->
| Shape | When | Next command | Sections (**required**) |
| --- | --- | --- | --- |
| idea | how it should work still open | `/bkit-design #N` | **Problem**, **Outcome**, Success criteria, Constraints and non-goals, Decisions already made, Open questions, References |
| change | what to build + how to tell done both known | `/bkit-plan #N`; or `/bkit-build #N` / `lite:build` straight from issue | **Narrative**, **Success Criteria**, Edge Cases, **Derived Test Matrix**, **Tasks**, Open Questions & Assumptions, Breaking Changes & Naming, Out of Scope, References |
| bug | worked / should work, does not | test or CI run already fails → `/bkit-debug #N` on branch fix lands on (`[soak]` if intermittent); nothing fails → `/bkit-debug #N [repro]` (failing test first; `[soak]` too if intermittent) | **Failing test or CI run** (`none yet` allowed), **What happened**, **What should happen**, **Steps to reproduce**, How often, Affected area, Where and when, Evidence, References |

**Change shape syntax** (plan keeps it, `docs/templates/bkit-plan.md` § Spec):

- Success Criteria: ≤5 observable outcome bullets.
- Edge Cases: `| Scenario | Expected Behavior |`.
- Derived Test Matrix: `| Test description | Type | Target file |`; Type = lowest tier that exercises it, named per `docs/testing.md`; every row covered by exactly one task.
- Tasks, build order, one line each; `n/a — {reason}` for docs, config, pure refactor, or E2E / @live only:

  ```text
  - [ ] **Task N:** {change}. **Done when:** {verifiable check}. **Test first:** `{test file}` `{test name}` fails on {assertion}.
  ```

- `/bkit-build` with no plan builds these Tasks: each `Test first` test must fail before its code (`tests green --brief=`); missing `Done when` not a FAIL. `lite:build` checks neither. Nothing ticks issue boxes.

**Machine-read lines** — exact syntax, anywhere in body; nothing else in References is fetched:

<!-- prettier-ignore -->
| Line | Read by | Effect |
| --- | --- | --- |
| `**Parent design:** [{FID}-design.md](docs/plans/{YYYYMM}/{FID}-design.md)` | plan Step 1 | sets `PARENT_FID` → design = spec source; absent → the design made on the same issue (`bkit fids design`) |
| `**Audit reports:** docs/audits/{YYYYMM}/{slug}.md (findings {ids})` | plan Step 1 | each path → `AUDIT_PATHS`; path not a file → Failure Path |
| `###### bkit:blocked-by start` · `- #{N}` per line · `###### bkit:blocked-by end` | build `issue-blockers-check` (github; linear → native relations) | any listed issue open → build stops |
| `###### bkit:ignore-earlier` | `bkit issues text` | drops all earlier content; human-placed only |
| `###### bkit:generated` (comment first line) | `bkit issues text` | comment dropped from input |

**References** — exact strings agents can search: issue `#N — {title}` (linear `TEAM-N — {title}`); doc `{path} § {section}`; ledger row `docs/{ledger}.jsonl` key `` `{key}` ``. Labels: type label only (`enhancement` / `bug`); never phase or `bkit:*` labels — workflows set them (`.bkit/workflows.md` § Tracker Integration).

**Drafting from bkit output** (suggest only; file after human confirmation):

<!-- prettier-ignore -->
| Source | Shape | Carry |
| --- | --- | --- |
| audit `Suggested Issues` row | by `Next Step`: `/bkit-design` → idea; `/bkit-plan`, `/bkit-build`, `lite:build` → change; `/bkit-debug`, `lite:debug` → bug; `manual` → plain task | `**Audit reports:**` line with row's finding IDs |
| design `Suggested Workstreams` (2+; design summary asks) | title = workstream name; body = its scope, spec left to design; filed in `Requires` order | `**Parent design:**` line; blocked-by block = issues filed for its `Requires` (linear → `blockedBy` relation) |
| roadmap item with no issue (ledger row, audit candidate) | by recommended command, as audit row | ledger `key` / report path in References |

## github — Projects v2 board (optional)

`issue-update-status` reads `package.json` `bkit.githubProject` = `{ owner (org login), number, statusFieldId, progressOptionId, reviewOptionId, doneOptionId }` (non-secret, committed). Absent → board sync skipped (best-effort, never gates). Discover ids once: `gh api /orgs/{owner}/projectsV2/{number}/fields --jq '.[] | select(.name=="Status")'` (Status field numeric `id` → `statusFieldId`; each option raw `id` → option id, e.g. `47fc9ee4`; `PVTSSF_…` node id from `gh project field-list` is not field id — `projects_write` rejects it). Requires `projects` toolset in `.mcp.json` (`X-MCP-Toolsets`) + `BKIT_GH_TOKEN` org Projects R/W. Org-owned boards only — fine-grained PATs cannot reach user-owned projects, nor span orgs; use a classic PAT with `project` when the token must cover more than one owner. `value` = single-select **option id**, not option name. Failure → retry once after 5s, then continue. `doneOptionId` is **reserved and never written** — ship terminal sets `reviewOptionId`, and a human moves the item to Done on acceptance (§ `issue-update-merged` in `.bkit/workflows.md`).

## linear — notes

Linear `ISSUE_ID`s carry team prefix (e.g. `TEAM-123`) — FID inherits (`team-123-slug`). GitHub FIDs numeric-only (`123-slug`). Cross-provider scripts must tolerate both shapes. `LINEAR_TEAM` = `bkit.linearTeam` from manifest. No separate project board — issue state (`In Progress` / `In Review` / `Done`) carries status → `issue-update-status` no-op.
