> Example output. Copy it to `docs/capabilities.md` and own it. `bkit install` does not write this file and does not overwrite a copy.
>
> `pnpm graph:rollup` rewrites everything outside the Overrides block, so do not edit the generated body. To add a capability, add it in `scripts/graphify/bkit-graph-drift-rules.json`. How to run the tools is in `.bkit/templates.md`.

# Capabilities

> [!CAUTION]
> **Purpose:** One row per capability, with its owner module, the literal marker that finds every use of it, and whether anything bypasses the owner.
>
> **Rules:**
>
> - This file is generated. `pnpm graph:refresh` rewrites it.
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

Not built. Run `pnpm graph:rollup`.

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

No route layer yet. Run `pnpm graph:rollup`.

## Architecture — packages

Filled by `pnpm graph:rollup`.

## Architecture — modules

Filled by `pnpm graph:rollup`.
