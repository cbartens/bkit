> Generated document. `bkit install` does not write this file and does not overwrite a copy. Copy it to `docs/capabilities.md`, build it with the command below, then delete this introduction.
>
> **Fill these first:** `docs/deployments.md`.
>
> **Prerequisites:** the code exists, and the graphify templates are adopted as `.bkit/templates.md` § graphify — map describes.
>
> **Build it:**
>
> 1. Copy this starter to `docs/capabilities.md`.
> 2. Add each capability to `scripts/graphify/bkit-graph-drift-rules.json`. That file is the source of truth, and it stays hand-maintained.
> 3. Run `pnpm bkit:graph:rollup` to build the register from the working tree. Run it while you edit, when you want to see the result before staging.
> 4. Run `pnpm bkit:graph:refresh` to build the register from the staged files in a throwaway checkout. Run it before a commit, so the committed file matches the committed code.
> 5. Keep only the Overrides block by hand. Every other part is rewritten on each run, so do not edit it.
> 6. Add this row to the `## Project Documents` table in `.agents/docs.md`: | `docs/capabilities.md` | ● | ● | ● | — | ○ | One row per capability, with its owner module, the literal marker that finds every use of it, and whether anything bypasses the owner. |
> 7. Check the document against each completion check, then delete this introduction.
>
> **Completion checks:** the register has a row for every capability in `scripts/graphify/bkit-graph-drift-rules.json`, every responsibility in `docs/components.md` that owns a capability appears in both documents, and no row reads `Not built`.

# Capabilities

> [!CAUTION]
> **Purpose:** One row per capability, with its owner module, the literal marker that finds every use of it, and whether anything bypasses the owner.
>
> **Rules:**
>
> - This file is generated. `pnpm bkit:graph:refresh` rewrites it.
> - The source of truth is `scripts/graphify/bkit-graph-drift-rules.json`. Each status is derived from the tree, never typed in.
> - Markers are literal, never regex. A regex metacharacter in a marker matches nothing, and the row then reads as a clean result.
> - Optional `scope`: path prefixes.
> - Optional `surface`: `product` (default), `tests` or `all`.
> - Optional `budgets`: the exact non-owner site count allowed per scope prefix. Measured = declared → `budgeted`.
> - Only the Overrides block is hand-maintained. A malformed block aborts the run.

## Status Vocabulary

<!-- prettier-ignore -->
| Status | Meaning | Action |
| --- | --- | --- |
| `split` | Two or more implementations, no single owner | Centralise, or budget it and say why in `note` |
| `bypassed` | Owner exists, some callers skip it | Repoint the callers, or budget them |
| `dead` | A client fetches a path nothing serves | Check the call site |
| `gap` | No owner file yet | Name the owner before the first caller |
| `budgeted` | A `split` or `bypassed` whose site count matches the declared budget | None, until a site appears or disappears |
| `one` | Every caller goes through the owner | None |

## Register

Not built. Run `pnpm bkit:graph:rollup`.

## Unreachable API calls

Not scanned.

## Import-time side effects

Not scanned.

## Overrides

This is the only hand-maintained region. Use it to rename a node, hide a node or an edge, pin a note, or force nodes into a named group. Each `hide_nodes` entry needs a one-line reason in `hide_nodes_why`.

<!-- overrides:start -->

```json
{
  "rename": {},
  "note": {},
  "hide_nodes": [],
  "hide_nodes_why": {},
  "hide_edges": [],
  "group": {}
}
```

<!-- overrides:end -->

## User-facing routes → backend capabilities

No route layer yet. Run `pnpm bkit:graph:rollup`.

## Architecture — packages

Filled by `pnpm bkit:graph:rollup`.

## Architecture — modules

Filled by `pnpm bkit:graph:rollup`.
