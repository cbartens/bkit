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
> 5. Edit only the text outside the `graphify:start` and `graphify:end` marker lines. Each run rewrites everything between them.
> 6. Record unresolved facts under `## Open questions`.
> 7. Add this row to the `## Project Documents` table in `.agents/docs.md`: | `docs/capabilities.md` | ● | ● | ● | — | ○ | One row per capability, with its owner module, the literal marker that finds every use of it, and whether anything bypasses the owner. |
> 8. Check the document against each completion check, then delete this introduction.
>
> **Completion checks:** the register has a row for every capability in `scripts/graphify/bkit-graph-drift-rules.json`, every responsibility in `docs/components.md` that owns a capability appears in both documents, and the text between the two marker lines no longer reads `Not built`.

# Capabilities

> [!CAUTION]
> **Purpose:** One row per capability, with its owner module, the literal marker that finds every use of it, and whether anything bypasses the owner.
>
> **Rules:**
>
> - Follow `.bkit/authoring.md` § Docs when you edit this file.
> - `pnpm bkit:graph:rollup` and `pnpm bkit:graph:refresh` rewrite everything between the `graphify:start` and `graphify:end` marker lines. Never edit between them, and keep exactly one of each.
> - The source of truth is `scripts/graphify/bkit-graph-drift-rules.json`. Each status is derived from the tree, never typed in.
> - To add a capability, add a rule there: capability, lane, owner module and one literal marker.
> - Markers are literal, never regex. A regex metacharacter in a marker matches nothing, and the row then reads as a clean result.
> - Match the mechanism, not the name, because a marker such as `createClient(` misses an owner that imports it under another name.
> - Optional `scope`: path prefixes that narrow the tree scanned, for a marker that means different things per package.
> - Optional `surface`: `product` (default), `tests` or `all`. `tests` is every `e2e/` folder and every `.test.` or `.spec.` file, and `product` is every other file.
> - Optional `budgets`: the exact non-owner site count allowed per scope prefix. Measured = declared → `budgeted`.
> - The generator reads the Overrides block before it writes. A malformed block aborts the run.
>
> **Not here:** The purpose-based view of responsibilities goes in `docs/components.md`. Implementation boundaries and deployment topology go in `docs/architecture.md`. Issue state stays in the tracker.
>
> **Update when:** A rule in `scripts/graphify/bkit-graph-drift-rules.json` is added, changed or removed, or a code change moves a status. Run `pnpm bkit:graph:refresh` in the same change.

<!-- graphify:start -->

Not built. Run `pnpm bkit:graph:rollup`.

<!-- graphify:end -->

## Overrides

Use this block to rename a node, hide a node or an edge, pin a note, or force nodes into a named group. Each `hide_nodes` entry needs a one-line reason in `hide_nodes_why`.

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

## Open questions

[Each unresolved fact, who can answer it and which section it affects.]
