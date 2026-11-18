# Brief: group 1 — Rendered outputs are re-recorded and checked

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

- Group 1: Rendered outputs are re-recorded and checked — this group
  - TASK 1: Add `listRenderedOutputs`, the one list of files bkit force-renders — open
  - TASK 2: `upgrade` re-records the entry of every rendered output, written or not — open
  - TASK 3: `install` re-records the same entries, and `check` fails on a wrong one — open
  - TASK 4: Drop the leftover `.agents/` entries in the one shared merge — open
- Group 2: Docs, build output and this repo's own record — next
  - TASK 5: Say in the docs which entries may differ from the file, and why — open
  - TASK 6: Rebuild `dist/` and re-render this repo's own install record — open

## The work

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** Add `listRenderedOutputs`, the one list of files bkit force-renders
  - **READ:** `renderManagedOutputs` in `.bkit/core/engine/install/modules/index.ts`: what the render step writes whole
  - **READ:** `getInstallManifest` in `.bkit/core/engine/install/manifest.ts`: `.bkit/prompts.md` is `markered-text`, `.bkit/allowlist.json` is `byte-equal-text`
  - **UPDATE:** `listStampedFiles` in `.bkit/core/engine/install/modules/index.ts`: its mirror listing moves into a shared function
  - **UPDATE:** `.bkit/core/engine/install/modules/index.ts`: adds the exported function `listRenderedOutputs` (an `EXTEND` of this file, no new file)
  - **UPDATE:** `runBkitDocs` in `.bkit/core/engine/install/modules/core.ts`: reads the write mode (merge or overwrite) of each doc from one shared function that `listRenderedOutputs` also uses
  - **UPDATE:** `dispatchModules` in `.bkit/core/engine/install/modules/index.ts`: sets the new optional `ModuleContext.renderedOutputs` after the modules ran and before the `postDispatch` callbacks
  - **DONE WHEN:** `listRenderedOutputs` returns the non-markered `.bkit/*.md` docs, `.bkit/allowlist.json` and the installed hosts' agent/command mirrors that exist, and no `.agents/` path, `package.json`, `.mcp.json` or `.bkit/prompts.md`; `listStampedFiles` returns the same set as before; `dispatchModules` sets `ctx.renderedOutputs`
  - **TEST FIRST:**
    - `.bkit/core/engine/install/modules/index.integration.test.ts` `lists the force-rendered outputs of a claude install and nothing the owner shares` fails on the list being empty, "expected to contain .bkit/templates.md"
    - `.bkit/core/engine/install/modules/index.integration.test.ts` `names no other host's mirror for a claude-only install` fails on `.claude/commands/bkit-build.md` missing from the list

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** `upgrade` re-records the entry of every rendered output, written or not
  - **READ:** `updateCanonicalHashesAfterUpgrade` in `.bkit/core/engine/commands/install/upgrade.ts`: `seedablePaths` is `updated` ∪ `skippedSeedable`, hashed from disk
  - **UPDATE:** `runUpgradeCommand` in `.bkit/core/engine/commands/install/upgrade.ts`: its call to `updateCanonicalHashesAfterUpgrade` adds `listRenderedOutputs(process.cwd())` to the `updated` list beside `renderedDocPaths`
  - **DEPENDS ON:** 1
  - **DONE WHEN:** after `bkit upgrade`, the entries for `.claude/commands/bkit-build.md`, `.bkit/templates.md` and `.bkit/allowlist.json` equal the sha256 of each file even when the file did not change in the run, and a wrong `package.json` entry is not rewritten
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/install/upgrade.integration.test.ts` `re-records a stale entry for a rendered mirror, doc and allowlist that are already current` fails on the entry still holding the wrong hash, "expected the entry to equal the file's sha256"

<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->

- [ ] **TASK 3:** `install` re-records the same entries, and `check` fails on a wrong one
  - **READ:** `reportCheckDrift` in `.bkit/core/engine/commands/install/check.ts`: a write in the write set exits 1
  - **UPDATE:** `runCoreModule` in `.bkit/core/engine/install/modules/core.ts`: its `.bkit/version` `postDispatch` hashes every path in `ctx.renderedOutputs`; an existing entry that differs adds a `.bkit/version` write and one log line naming the paths; the `.agents/` skip is not touched here (TASK 4)
  - **DEPENDS ON:** 1
  - **DONE WHEN:** a core install run rewrites a stale entry for a rendered output whose file is current; `bkit check` exits 1 and prints the path when such an entry differs, and exits 0 when only the `package.json` entry differs and on a clean install of each host the existing check tests cover
  - **TEST FIRST:**
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `re-records a stale entry for a rendered output whose file is already current` fails on the entry still holding the wrong hash
    - `.bkit/core/engine/commands/install/check.integration.test.ts` `a wrong entry for a rendered mirror fails check and names the file, a wrong package.json entry does not` fails on check exiting 0, "expected status 1"

<!-- bkit:task 3 end -->

<!-- bkit:task 4 start -->

- [ ] **TASK 4:** Drop the leftover `.agents/` entries in the one shared merge
  - **READ:** `updateCanonicalHashesAfterUpgrade` in `.bkit/core/engine/commands/install/upgrade.ts`: holds one of the two `.agents/` skips this task removes
  - **UPDATE:** `mergeCanonicalHashes` in `.bkit/core/engine/install/version-file.ts`: prunes an existing `.agents/` entry (counted in `pruned`) and drops a fresh one
  - **UPDATE:** `runCoreModule` in `.bkit/core/engine/install/modules/core.ts`: the `.agents/` skip in its `.bkit/version` `postDispatch` is deleted
  - **UPDATE:** `updateCanonicalHashesAfterUpgrade` in `.bkit/core/engine/commands/install/upgrade.ts`: `.agents/` skip deleted
  - **DEPENDS ON:** 2, 3
  - **DONE WHEN:** `mergeCanonicalHashes` returns no `.agents/` entry from either input; both writers drop a recorded `.agents/docs.md` entry; the two writer-side skips are gone
  - **TEST FIRST:**
    - `.bkit/core/engine/install/version-file.test.ts` `prunes an existing .agents/ entry and counts it` fails on the entry being kept, "pruned 0"
    - `.bkit/core/engine/install/version-file.test.ts` `drops a fresh .agents/ entry` fails on the entry being kept
    - `.bkit/core/engine/install/version-file.integration.test.ts` `updateCanonicalHashesAfterUpgrade drops a recorded .agents/docs.md entry` fails on the entry staying in `.bkit/version`
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `a core install run drops a recorded .agents/docs.md entry` fails on the entry staying in `.bkit/version`

<!-- bkit:task 4 end -->

### Reuse Inventory rows

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| Name the files bkit force-renders (docs, allowlist, host mirrors) | `.bkit/core/engine/install/modules/index.ts` | `grep -n "RENDERED_MIRRORS\|listStampedFiles\|renderManagedOutputs"` in `.bkit/core/engine`; read `runBkitDocs` in `core.ts` | `listStampedFiles` (already lists the rendered mirrors on disk), `runBkitDocs` (decides merge vs overwrite per doc) | EXTEND | Pull the mirror listing out of `listStampedFiles` and the per-doc write mode out of `runBkitDocs` so one definition feeds the stamp scan, the renderer and the new function. |
| Re-record hashes of rendered outputs on upgrade | `.bkit/core/engine/commands/install/upgrade.ts` | `grep -rn "canonicalHashes" .bkit/core/engine`; read `updateCanonicalHashesAfterUpgrade` and its caller | `updateCanonicalHashesAfterUpgrade` (already refreshes `updated` ∪ `skippedSeedable` from disk) | EXTEND | Pass the rendered outputs in beside `renderedDocPaths`; the function already hashes disk. |
| Re-record hashes on install and report a stale one under `check` | `.bkit/core/engine/install/modules/core.ts` | read the `postDispatch` that writes `.bkit/version`; `grep -n "needsWrite\|ws.writes.push" core.ts`; `reportCheckDrift` in `check.ts` | the `.bkit/version` `postDispatch` (its write is already a counted would-write in `check`) | EXTEND | Add the rendered outputs to the hashed set and a stale one to `needsWrite`; `check` then fails through the existing path. |
| Prune leftover `.agents/` entries | `.bkit/core/engine/install/version-file.ts` | read `mergeCanonicalHashes`; `grep -rn 'startsWith(".agents"' .bkit/core/engine` | `mergeCanonicalHashes` (already prunes template-set paths and ledgers) | EXTEND | Add the `.agents/` rule there and delete the two writer-side copies. |

Reuse Inventory rows left out: 0; Architecture entries left out: 4 — read them in docs/plans/202611/1053-upgrade-leaves-stale-plan.md § Reuse Inventory and § Architecture & Component Changes.
