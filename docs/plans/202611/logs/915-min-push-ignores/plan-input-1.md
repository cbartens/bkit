## Session Prompt — this run's, newer than everything below

/bkit-plan #915

## Issue description — oldest

## Problem

The pre-push hook blocks a `[skip ci]` push to `dev` whose only non-plan files are an audit report that bkit itself wrote. A docs-only push then needs `--no-verify` or an empty "trigger CI" commit.

Seen in a consumer repo on bkit 6.1.1. The push carried 34 files: plan conversions under `docs/plans/**`, ledger rows, and one `bkit-audit-logs` run. The hook stopped with:

```
[bkit-ci] 2 of 34 changed files match no min-push path (first: docs/audits/{YYYYMM}/logs.md)
[pre-push] BLOCKED: <sha> carries a CI-suppressing token and changes files outside the min-push paths ...
```

## Why it happens

`bkit ci min-push` accepts what bkit writes, defined in `.bkit/templates.md` § Git hooks — Husky as "ship's `--scope=pr` allow-list plus `docs/plans/**`". `bookPathspecs` in `.bkit/core/engine/commands/workflow/ledgers.ts` holds that allow-list. It has plan logs, the `*.jsonl` ledgers, `docs/roadmap.md`, top-level `docs/*.md` and skills, but not `docs/audits/**`.

Yet `@bkit-audit-generate` writes `docs/audits/{YYYYMM}/{slug}.md`. bkit treats those reports exactly like plans elsewhere: the prettier pre-step runs on both, and the prose linter skips both as records. So bkit counts one kind of record it writes and leaves the other out. No reason for the difference is written down.

## Two files, two answers

1. **`docs/audits/**`: should count as what bkit writes**, like `docs/plans/**`. In the consumer repo no code, build or test reads it (only comments citing old reports, and the design-audit screenshot scripts, which write into it), so it meets the `minPushPaths` rule "list only files that no code, build or test reads".
2. **`docs/templates/bkit-audit-*.md`: blocking is right.** An audit run edits that template's `Project Instructions` below `bkit:end`. Templates are bkit-managed (hash-checked by `bkit check`, and `bkit-plan.md` is read by plan-check), so skipping CI on them is not safe. But this means an audit run always leaves a commit that can't take the light path. Worth deciding whether the below-`bkit:end` project section should be exempt, or whether the audit workflow should commit and push it so it is clear a full gate is expected.

Not a fix: listing `docs/**` in `minPushPaths`. `.bkit/templates.md` already warns against it, and in the consumer repo 40 test files read `docs/mockups.html`.

## Suggested change

- Add `docs/audits/**` to what bkit writes (beside `docs/plans/**`) for `bkit ci min-push`.
- Decide and document the template case (point 2).

Related: #645, #852.

## Issue comment — posted 2026-11-10T06:11:26.000Z

**Label added: `next:design`**

The issue had no `next:*` label. Point 1 (add `docs/audits/**` beside `docs/plans/**`) is settled. Point 2, the case of the `docs/templates/bkit-audit-*.md` project section, is still an open choice ("Worth deciding whether…"), and that makes it design work (`.bkit/workflows.md:58`). If the owner decides point 2 in a comment, the issue can skip design and go to `/bkit-plan 915`.

## Issue comment — posted 2026-11-10T06:56:41.000Z

### Owner decision on point 2 (design no longer needed)

**Point 1 (settled in the issue):** add `docs/audits/**` beside `docs/plans/**` to what `bkit ci min-push` counts as written by bkit.

**Point 2: allow the audit template's project section.** `bkit ci min-push` also accepts a change to `docs/templates/bkit-audit-*.md` when every changed line sits below `<!-- bkit:end -->`, in the consumer-owned `Project Instructions` section an audit run edits. A change to any line above the marker (the bkit-managed part) still needs the full gate, as today.

Why: an audit run always edits that section, so today every audit run leaves a commit that can't take the light path. The section is consumer-owned and `bkit install` never overwrites it. As far as we can tell, `bkit check` hash-checks only the managed part above the marker, so a change below it can't change a gate result. **The plan must confirm this**: list every code, build and test path that reads `docs/templates/bkit-audit-*.md`, and show that none reads the part below `<!-- bkit:end -->`. If one does, stop and bring it back to the owner.

Scope: this covers only `bkit-audit-*.md`. Other templates, such as `bkit-plan.md`, which plan-check reads, keep blocking. Not a fix, as the issue says: listing `docs/**` in `minPushPaths`.

Docs in the same change: `.bkit/templates.md` § Git hooks — Husky (the description of what bkit writes), and the `minPushPaths` guidance.

Next step: `/bkit-plan 915`.
