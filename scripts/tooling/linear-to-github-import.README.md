# Linear → GitHub importer — handover

Instructions for an AI agent running `scripts/linear-to-github-import.ts` in **a different repo**.

## What this does

Imports one Linear project's issues into one GitHub repo + Projects v2 board. Ports labels, comments (attributed), status, priority, **project milestones** (auto-created on the GH repo), **native sub-issue parent/child links** (via GraphQL `addSubIssue`), and **relations** (blocks / blocked-by / related / duplicate) — rendered into the issue body inside `<!-- linear-links-* -->` markers. Inline `BAR-N` references in descriptions and comments are rewritten to GitHub cross-refs (`#N`) when the target is imported — handles markdown links, Linear `<issue>` tags, and bare text, while skipping code blocks, HTML comments, and the issue's own self-reference. Idempotent on re-runs and back-fills existing issues.

## Prereqs

1. **Copy two files** from the bkit repo to the target repo:
   - `scripts/linear-to-github-import.ts`
   - `docs/linear-issues.csv` (or use a fresh Linear CSV export — must include columns `ID, Title, Description, Status, Priority, Labels, Created, Assignee, Creator, UUID, Project, Parent issue`)
2. **GitHub auth**: `gh auth login` — token needs `project`, `repo` scopes. The script reads `gh auth token --secure-storage` (keyring) by default; override with `GH_PROJECT_TOKEN=…`.
3. **Linear key**: `export LINEAR_API_KEY=lin_api_…` (personal API key from linear.app/settings/api).
4. **Node**: `pnpm exec tsx` available (or `npx tsx`).
5. **GitHub Projects v2 board** must exist with single-select fields:
   - `Status` with options `Backlog, Ready, In progress, In review, Done` (rename in `STATUS_MAP` if different).
   - `Priority` with options `P0, P1, P2` (optional; rename in `PRIORITY_MAP` if different).

## Required overrides

The defaults target `cbartens/bkit`. **Always pass these**:

```bash
pnpm exec tsx scripts/linear-to-github-import.ts \
  --repo OWNER/REPO \
  --project "GH Project Title" \
  --linear-project "Linear Project Name" \
  --csv path/to/linear-export.csv
```

`--linear-project` must match the value in the CSV's `Project` column exactly.

**Sub-issue inheritance:** Linear CSV exports leave the `Project` column blank on sub-issues that inherit their project from a parent. The importer compensates by transitively including any descendant of a matching row — i.e. if a parent's `Project` matches `--linear-project`, all its children/grandchildren are imported too, even with a blank `Project` field. The startup log reports `direct ... inherited via parent` counts so you can sanity-check this.

## Run order

1. **Dry-run on 2 issues** first — confirms project discovery, token scopes, mappings:
   ```bash
   pnpm exec tsx scripts/… --repo … --project … --linear-project … --limit 2
   ```
   Verify: project found, status/priority options listed, Linear org urlKey resolved.
2. **Apply 3 as smoke test**: add `--apply --limit 3`. Open the board, spot-check one issue (body marker, comment attribution, status, priority).
3. **Full apply**: drop `--limit`. Idempotent — safe to re-run on interruption.

## Knobs in the script (edit if needed)

- `STATUS_MAP` — Linear status → board Status option name + close reason (`completed` / `not_planned`).
- `PRIORITY_MAP` — Linear priority string → board Priority option name (or `null` to leave unset).
- `LABEL_SKIPLIST` — labels to drop (defaults skip `cbartens/bkit` project marker).

## Idempotency

- Issues stamped with `<!-- linear-import: BAR-N -->` in body; re-runs detect and skip create.
- Comments stamped with `<!-- linear-comment: <uuid> -->`; re-runs only post missing ones.
- Links section in body is wrapped in `<!-- linear-links-start -->` / `<!-- linear-links-end -->` markers; re-runs strip and re-emit so prose between markers stays in sync with Linear. Any prose **outside** the markers is preserved verbatim — safe to hand-edit the rest of the body.
- Sub-issue links use GitHub's `addSubIssue` GraphQL mutation; already-linked pairs are caught and no-op'd.
- Milestone PATCH only runs when Linear's `projectMilestone` differs from the current GH milestone, so re-runs are quiet.
- Re-running over already-imported issues (no `--only`) back-fills links / milestones / sub-issue parentage onto everything in the project.
- To re-sync a subset: `--only BAR-5,BAR-7 --apply`.

## Gotchas (already handled, don't "fix")

- If the board's "Auto-close issue" workflow is enabled, the script's close-PATCH may 422 because the workflow already closed the issue. Script catches this and verifies state — don't add retries.
- `gh auth token` (no flag) may return an env-loaded fine-grained PAT that lacks `project` scope. The script uses `--secure-storage` first to get the keyring token.
