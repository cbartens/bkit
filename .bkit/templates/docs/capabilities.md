> Example output. Copy to `docs/capabilities.md`, own it. `bkit install` does not write this file and does not overwrite a copy.
>
> `pnpm graph:rollup` rewrites everything outside Overrides block; do not edit generated body. Add capability in `scripts/graphify/bkit-graph-drift-rules.json`. Running the tools: `.bkit/templates.md`.

# Capabilities

> [!CAUTION]
> **Purpose:** One row per capability — owner module, literal marker finding every use, whether anything bypasses owner.
>
> **Rules:**
>
> - GENERATED. `pnpm graph:refresh` rewrites this file.
> - Source of truth: `scripts/graphify/bkit-graph-drift-rules.json`. Status is derived from the tree, never typed.
> - Markers literal, never regex. Regex metacharacter in a marker matches nothing → reads as clean result.
> - Optional `scope`: path prefixes. Optional `surface`: `product` (default), `tests`, or `all`.
> - Optional `budgets`: exact non-owner site count allowed per scope prefix. Measured = declared → `budgeted`.
> - Only Overrides block is hand-maintained; malformed block aborts run.

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

Only hand-maintained region. Rename node, hide node / edge, pin note, force nodes into a named group. Each `hide_nodes` entry needs a one-line reason in `hide_nodes_why`.

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
