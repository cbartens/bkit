# Brief: group 2 — Docs, build output and this repo's own record

Plan: Stale `.bkit/version` entries after upgrade Implementation Plan

## Why and what

### Context & Goals

After `git merge dev` plus `build` plus `upgrade`, some `.bkit/version` entries no longer match the file on disk, and `bkit check` still exits 0. The goal: after `upgrade` (and `install`), every entry for a file bkit renders matches the file; `check` fails and names the file when one does not; the install doc says which entries may differ and why.

**Findings from the code (confirmed by reading, and by the reproduction in `tmp/1053-repro.md`):**

- Why entries stay stale: both hash writers (install's `postDispatch` in `.bkit/core/engine/install/modules/core.ts`, upgrade's `updateCanonicalHashesAfterUpgrade` in `.bkit/core/engine/commands/install/upgrade.ts`) hash only the files that reached `ws.writes` in that run. `.bkit/*.md` docs, `.bkit/allowlist.json` and host mirrors reach it only when their content changed (`installFile` returns true, `writeTier1` pushes a write). A file already rendered correctly on disk is never re-hashed, so an entry taken from another branch survives.
- What a stale entry does on the next `upgrade`: nothing to the rendered outputs. Docs and mirrors are force-overwritten and never read their entry (`.bkit/core/.bkit/install.md` § Format semantics during uninstall already says so for `.bkit/*.md`). The worry in the issue, that `upgrade` skips such a file and carries an old mirror forward, does not happen. What a stale entry does do: `bkit uninstall` reads it for `byte-equal-text` files and keeps an owned file as `skip-modified` (`.bkit/core/engine/commands/install/uninstall.ts` L502-520). For whole-file payload files (`diffFile`, `upgrade.ts` L225) a stale entry makes a changed template a conflict instead of an update, which is the intended drift record when the owner edited the file.
- The 8 entries that differ on a clean tree, each traced to its writer:
  - `.bkit/templates.md`, `.bkit/allowlist.json`: NOT by design. Both are force-rendered whole files (`runBkitDocs` via `writeTier1`; `writeNetworkAllowlist`). Disk equals today's render; the entry is an old hash left when the file changed without a re-hash (`git log`: `.bkit/templates.md` changed in 95c831142, `.bkit/allowlist.json` in f57bc5942, neither with a `.bkit/version` update). This is the #1053 bug itself.
  - `.agents/context.md`, `.agents/docs.md`, `.agents/skills.md`: NOT by design, and no current writer. Both hash writers skip every `.agents/` path (`core.ts` postDispatch, `upgrade.ts` `updateCanonicalHashesAfterUpgrade`), and `mergeCanonicalHashes` does not prune them, so a hash recorded by an older release survives forever. These files are block-merged `markered-text` (the owner writes below `bkit:end`), and nothing reads the entry (`uninstall.ts` strips the block without a hash).
  - `.mcp.json`, `.cursor/mcp.json`: by design. `reconcileMcpJson` owns only `mcpServers.<tracker>` (`manifest.ts` `format: "json"`); the entry is the hash of the whole file when bkit last wrote it, and the owner or another tool adds servers. Nothing reads it (json uninstall strips the tracker entry only while it equals the template).
  - `package.json`: by design. bkit adds missing scripts and `bkit.*` defaults (add-if-missing); the owner edits it constantly. Nothing reads the entry.

**Removes:**

- The by-hand hash comparison and entry edits after merging a build branch with `dev`.
- The write-only-when-changed rule for rendered outputs, in both hash writers.
- The `.agents/` skip, now copied in two hash writers (`core.ts` postDispatch and `upgrade.ts`), which moves into the one shared merge `mergeCanonicalHashes`.
- The 3 leftover `.agents/*` entries in `.bkit/version`, and the sentence "`canonicalHashes` is internal state `bkit check` does not verify" in the install doc.

**No second way:** one function, `listRenderedOutputs`, names the files bkit force-renders; both hash writers and `check` use it. `check` reports the stale entry through the existing drift path (the `.bkit/version` write that install's `postDispatch` already records in the write set, counted by `reportCheckDrift`), not through a new gate or finding.

**Related Issues:**

- #1053 — `upgrade` leaves `.bkit/version` entries that do not match the file (the issue this plan converts).

---

### Narrative

A maintainer merges `dev` into a build branch, takes `dev`'s `.bkit/version`, runs build and `upgrade`, and every entry for a rendered file matches its file. If an entry is still wrong, `bkit check` exits 1 and names the file.

### Success Criteria

- After `bkit upgrade` and after `bkit install`, each entry for a docs, allowlist or host-mirror file equals the sha256 of the file on disk, even when the file did not change in that run.
- `bkit check` exits 1 and names the path when such an entry differs from the file; it stays at exit 0 when only `package.json`, `.mcp.json` or `.cursor/mcp.json` differ.
- A recorded `.agents/*` entry is dropped by both `install` and `upgrade`.
- `.bkit/install.md` (source `.bkit/core/.bkit/install.md`) says which entries may differ from disk and why.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| Removing the unread entries for `package.json`, `.mcp.json`, `.cursor/mcp.json` | The goal is entries that match for rendered files; these are documented as allowed to differ. | Follow-up if wanted. |
| A rendered-file hash check in `bkit doctor` | `check` is the gate the issue names. | Not planned. |

## Where it fits

- Group 1: Rendered outputs are re-recorded and checked — done
  - TASK 1: Add `listRenderedOutputs`, the one list of files bkit force-renders — done
  - TASK 2: `upgrade` re-records the entry of every rendered output, written or not — done
  - TASK 3: `install` re-records the same entries, and `check` fails on a wrong one — done
  - TASK 4: Drop the leftover `.agents/` entries in the one shared merge — done
- Group 2: Docs, build output and this repo's own record — this group
  - TASK 5: Say in the docs which entries may differ from the file, and why — open
  - TASK 6: Rebuild `dist/` and re-render this repo's own install record — open

## The work

<!-- bkit:task 5 start -->

- [ ] **TASK 5:** Say in the docs which entries may differ from the file, and why
  - **READ:** `.bkit/authoring.md`: § All Agent-Read Files and § Docs, before editing
  - **READ:** `.bkit/core/.bkit/install.md`: the `byte-equal-text` row in § Format semantics during uninstall
  - **UPDATE:** `.bkit/core/.bkit/install.md`: that row. Entries for rendered `.bkit/*.md` docs, `.bkit/allowlist.json` and host mirrors equal the file after install and upgrade, and `check` fails on a difference. They may differ: `package.json`, `.mcp.json`, `.cursor/mcp.json` and block-merged files (the owner's content shares the file), and a whole-file payload file the owner edited (upgrade keeps its hash so a template change is a conflict). Not recorded: `.agents/*`, template copies, ledgers. The sentence that `check` does not verify entries is removed
  - **UPDATE:** `docs/testing.md`: the `version-file.test.ts` row (L911) names the `.agents/` rule; keep the hunk to a few lines
  - **DEPENDS ON:** 4
  - **DONE WHEN:** the install doc source states the three entry classes and no longer says `check` does not verify entries; the `docs/testing.md` row names the `.agents/` rule; the rendered `.bkit/install.md` is not edited by hand
  - **TEST FIRST:** n/a — docs only, no behaviour change

<!-- bkit:task 5 end -->

<!-- bkit:task 6 start -->

- [ ] **TASK 6:** Rebuild `dist/` and re-render this repo's own install record
  - **UPDATE:** `dist/cli.js`: and the rest of `dist/`, rebuilt with `pnpm build` (the committed engine build)
  - **UPDATE:** `.bkit/version`: rewritten by `pnpm tsx .bkit/core/engine/cli.ts upgrade`; the `.agents/*` entries drop out and the `.bkit/templates.md` and `.bkit/allowlist.json` entries are re-recorded
  - **UPDATE:** `.bkit/install.md`: re-rendered from the source by the same upgrade, not edited by hand
  - **DEPENDS ON:** 5
  - **DONE WHEN:** `.bkit/version` has no `.agents/` entry; its entries for `.bkit/templates.md` and `.bkit/allowlist.json` equal the sha256 of the files; the only entries left that differ from disk are `.mcp.json`, `.cursor/mcp.json` and `package.json`; `node dist/cli.js check` exits 0; `.bkit/install.md` matches its source
  - **TEST FIRST:** n/a — regenerated build output and install record (a baseline), no behaviour change

<!-- bkit:task 6 end -->

### Earlier tasks this group depends on

- TASK 4 (group 1, done): Drop the leftover `.agents/` entries in the one shared merge — `.bkit/core/engine/install/version-file.ts`, `.bkit/core/engine/install/modules/core.ts`, `.bkit/core/engine/commands/install/upgrade.ts`

### Reuse Inventory rows

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| Say which entries may differ | `.bkit/core/.bkit/install.md` | `grep -ln "canonicalHashes" docs/*.md .bkit/core/.bkit/*.md` | the `byte-equal-text` row of § Format semantics during uninstall (says `check` does not verify entries) | EXTEND | Rewrite that row's sentences; no new doc. |

### Architecture entries

#### [MODIFY] `.bkit/core/.bkit/install.md` and `docs/testing.md`

- **Existence Check:** both exist.
- Install doc source: the `byte-equal-text` row says which entries equal the file after upgrade and are checked (rendered docs, allowlist, host mirrors), which may differ (merged files, owner-edited payload files) and which are not recorded (`.agents/*`, template copies, ledgers). Testing doc: the `version-file.test.ts` row names the `.agents/` rule.
