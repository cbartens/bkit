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

<!-- bkit:end -->

## Plan-split sub-plan internal links broken (2026-05-04)

- **Category:** agent-rework
- **Workflow:** plan
- **Step:** plan-complexity-split (master + sub-plan write)
- **Source:** subagent (`bkit-plan-complexity-split`)
- **Description:** When a plan is split into a master index + N sub-plans, the splitter writes cross-reference links using its internal version-numbered working titles (`plan-v3-checked.md`, `plan-v4-split.md`, `plan-v4-1.md`, `plan-v4-2.md`, `plan-v4-3.md`) baked into link text inside both the master index and every sibling-link section of each sub-plan. The persistence layer then renames files to FID-based on-disk filenames (`{FID}-plan{,-1,-2,-3}.md`) at save time but does **NOT** rewrite the embedded links. Net result: every `[plan-v4-2.md](./plan-v4-2.md)` style link in the produced `drafts/` files is dead — the `plan-v4-*.md` filenames never exist on disk. Additionally, intermediate planning artifacts (`plan-v3-checked.md`, `plan-complexity-check.md`) are referenced from the children but never persisted to `drafts/` at all, so those links are dead-on-arrival regardless of rename.
- **Suggested fix:** After the persistence-layer rename in `bkit-plan-complexity-split` (and any orchestrator step that materialises the file tree), run a sweep pass over every emitted `.md` file that (a) rewrites `(./plan-v[0-9]+(?:-(?:split|[0-9]+))?\.md)` link targets to the FID-based filenames actually used on disk, and (b) either persists `plan-v3-checked.md` / `plan-complexity-check.md` alongside the sub-plans, or strips/comments-out their references in the children. Belt-and-braces: a final guardrail step that does `for f in drafts/{FID}*.md; do for link in $(extract md links); do test -f drafts/$link || warn; done; done` and FAILS the workflow on any dangling internal `.md` link target.
- **Related:** BAR-111, `docs/plans/drafts/bar-111-bkit-npm-package-plan{,-1,-2,-3}.md`
- **Recovery:** Master plan rewritten as a trimmed manual runbook (`bar-111-bkit-npm-package-plan.md`) that supersedes the index + sub-plans; sub-plans `-1.md` / `-2.md` / `-3.md` banner-marked as superseded / off-repo. Internal links not fixed in the orphaned children since the children themselves are no longer the source of truth.
- **Status:** OPEN (workflow defect — recurs on next plan-complexity-split run)
