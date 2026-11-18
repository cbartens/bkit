# Stale `.bkit/version` entries after upgrade Implementation Plan

> [!CAUTION]
> **Purpose:** The implementation plan for #1053: pre-flight checks, the runbook, verification and rollback.

**Header notes (from the orchestrating session):**

- No task edits a file another running build owns. The plan touches none of `.bkit/core/engine/commands/workflow/{issues,repo,tracker,workflows,worktrees}.ts`, `.bkit/core/engine/ledgers/status.ts`, `.bkit/core/.bkit/trackers.md`, `.bkit/core/workflows/bkit-design.md` or `.bkit/core/workflows/bkit-plan.md`. It needs none of them.
- Doc changes go to the sources `.bkit/core/.bkit/install.md` and `docs/testing.md`, never to the rendered `.bkit/install.md`. Each hunk is a few lines. `.bkit/core/.bkit/workflows.md` and `docs/observability.md` are not touched.
- `.bkit/core/engine/commands/workflow/branches.ts` (`recordResolve`, the merge of `.bkit/version` during `branches rebase`) is read and left alone: it already takes the side that changed an entry, and the new refresh in `upgrade` repairs what it leaves.

## Context & Goals

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

## 👤 ⚠️ Acceptance Scenario

> [!CAUTION]
> 🛑 The owner reads and confirms this section.

### Narrative

A maintainer merges `dev` into a build branch, takes `dev`'s `.bkit/version`, runs build and `upgrade`, and every entry for a rendered file matches its file. If an entry is still wrong, `bkit check` exits 1 and names the file.

### Success Criteria

- After `bkit upgrade` and after `bkit install`, each entry for a docs, allowlist or host-mirror file equals the sha256 of the file on disk, even when the file did not change in that run.
- `bkit check` exits 1 and names the path when such an entry differs from the file; it stays at exit 0 when only `package.json`, `.mcp.json` or `.cursor/mcp.json` differ.
- A recorded `.agents/*` entry is dropped by both `install` and `upgrade`.
- `.bkit/install.md` (source `.bkit/core/.bkit/install.md`) says which entries may differ from disk and why.

### Process Sketch

- **WHEN** a rendered mirror is already correct and its entry is wrong, and the maintainer runs `bkit upgrade` **→ THEN** the entry is rewritten to the file's hash.
- **WHEN** the maintainer runs `bkit check` on that state **→ THEN** it exits 1 and the output names the file.
- **IF** the entry for `package.json` differs **→ THEN** `check` stays at exit 0 (the owner edits that file).

### Concrete Example

**Setup:** A claude-only install; the entries for `.claude/commands/bkit-build.md`, `.bkit/templates.md` and `.bkit/allowlist.json` are set to a wrong hash, and the files are untouched.

**Steps:**

1. User runs `bkit check` → System exits 1 and names the three paths.
2. User runs `bkit upgrade` → System rewrites the three entries.
3. User runs `bkit check` → System exits 0.

**Outcome:** The three entries equal the hash of their files, and `.bkit/version` needed no hand edit.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| An entry for `package.json`, `.mcp.json` or `.cursor/mcp.json` differs from the file | `check` stays clean; the install doc names these as allowed to differ. |
| An owner-edited whole-file payload file keeps its old hash | Unchanged: upgrade keeps the entry so a later template change is a conflict, not an overwrite (#459 test stays green). |
| A rendered output has no entry at all | `upgrade` and `install` add it; `check` does not fail on a missing entry, only on a wrong one. |
| A recorded `.agents/*` entry | Pruned by both writers; no migration, nothing reads it. |

### Derived Test Matrix

`Type` is a tier from `docs/testing.md`. `Task` is the one runbook task that lands the row's test.

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| `listRenderedOutputs` on a claude install returns the force-rendered docs, allowlist and claude mirrors, and none of `package.json`, `.mcp.json`, `.bkit/prompts.md`, `.claude/settings.json` or `.agents/` files | Integration | `.bkit/core/engine/install/modules/index.integration.test.ts` | 1 |
| `listRenderedOutputs` on a claude-only install names no `.cursor/` mirror | Integration | `.bkit/core/engine/install/modules/index.integration.test.ts` | 1 |
| `bkit upgrade` rewrites a stale entry for a mirror, doc and allowlist that are already current, and leaves a wrong `package.json` entry alone | Integration | `.bkit/core/engine/commands/install/upgrade.integration.test.ts` | 2 |
| a core install run rewrites a stale entry for a rendered output whose file is already current | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 3 |
| `bkit check` exits 1 and names the mirror when its entry is wrong, and exits 0 when only the `package.json` entry is wrong | Integration | `.bkit/core/engine/commands/install/check.integration.test.ts` | 3 |
| `mergeCanonicalHashes` prunes an existing `.agents/` entry and counts it | Unit | `.bkit/core/engine/install/version-file.test.ts` | 4 |
| `mergeCanonicalHashes` drops a fresh `.agents/` entry | Unit | `.bkit/core/engine/install/version-file.test.ts` | 4 |
| `updateCanonicalHashesAfterUpgrade` drops a recorded `.agents/docs.md` entry | Integration | `.bkit/core/engine/install/version-file.integration.test.ts` | 4 |
| a core install run drops a recorded `.agents/docs.md` entry | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 4 |

### 👤 ✅ Human Confirmation

- [ ] **Acceptance Scenario confirmed:** I have reviewed the Narrative, Success Criteria, Process Sketch, Concrete Example, Edge Cases, and Derived Test Matrix above. They correctly describe what "done" looks like.

---

## 👤 ⚠️ Breaking Changes & Naming Review

> [!CAUTION]
> 🛑 The owner reads and confirms this section.

- **`bkit check` gets stricter.** A repo whose `.bkit/version` holds a wrong hash for a docs, allowlist or mirror file now fails `check` until one `bkit upgrade` re-records it. Bkit's own repo is such a repo today (`.bkit/templates.md`, `.bkit/allowlist.json`); TASK 6 refreshes it.
- No new names: no new file, command, flag or finding id. One new exported function, `listRenderedOutputs`, in an existing file.

### 👤 ✅ Human Confirmation

- [ ] **Breaking Changes confirmed:** I have reviewed every breaking change and naming decision above.

---

## 👤 ⚠️ Open Questions & Assumptions

> [!CAUTION]
> 🛑 The owner reads and confirms this section.

- **Assumption:** Dropping the leftover `.agents/*` entries needs no migration entry in `docs/migrations.md` → it is the same prune `mergeCanonicalHashes` already does for template-set paths and ledgers, and nothing reads those entries (uninstall treats `.agents/*.md` as `markered-text`, strips the block, never reads a hash). If wrong, add a migration row on your confirmation.
- **Assumption:** `check` should fail only on an entry that exists and differs, not on a missing one → a missing entry has no wrong hash to report, and failing on it could flag installs that predate a file. `upgrade` and `install` still add the missing entry.
- **Assumption:** Entries for `package.json`, `.mcp.json` and `.cursor/mcp.json` stay in `.bkit/version` and are documented as allowed to differ, rather than removed. Removing them is a separate change.

### 👤 ✅ Human Confirmation

- [ ] **Open Questions & Assumptions confirmed:** I have resolved or explicitly accepted every open question and assumption above.

---

## Alternative Approaches & Recommendations

- **Re-hash every entry on upgrade:** rejected. It would overwrite the drift record of an owner-edited whole-file payload file (#459) and of merged files.
- **A new `check` finding in `checks/after/managed.ts`:** rejected. The `.bkit/version` writer already runs in `check`'s dry run and already counts as a would-write; a second reporting path would be a parallel way to say the same thing.
- **Fix `recordResolve` in `branches.ts`:** rejected. The merge there is right for entries (side that changed); the stale entry arises in a hand merge it never sees, and the refresh after `upgrade` repairs both.

## Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| Removing the unread entries for `package.json`, `.mcp.json`, `.cursor/mcp.json` | The goal is entries that match for rendered files; these are documented as allowed to differ. | Follow-up if wanted. |
| A rendered-file hash check in `bkit doctor` | `check` is the gate the issue names. | Not planned. |

## Suggested Scope Expansion

None.

## Security & Privacy

None — no new routes, DB writes, secrets, or user input. The change reads files bkit already owns and hashes them.

## Pre-Flight / Dependencies

- [ ] **Prerequisite Plans:** None.

## Documentation Consultation

<!-- prettier-ignore -->
| Topic | Recommended path | Applies | Source used (path and section) | Coverage | Gap and action |
| --- | --- | --- | --- | --- | --- |
| architecture | `docs/architecture.md` | yes | `docs/architecture.md` install flow (L91: the installer records the version and managed hashes in `.bkit/version`) | covered | None. No component or topology change. |
| technology | `docs/technology.md` | yes | `docs/technology.md` § Build & Output, § Conventions (canonical sources; test placement) | covered | None. `dist/` is rebuilt in TASK 6. |
| security | `docs/security.md` | yes | `docs/security.md` L186 (machine-local files are never hashed) | covered | None. No new secret, input or route. |
| testing | `docs/testing.md` | yes | `docs/testing.md` § Tiers this project has, § Which tier does a behaviour need?, the `version-file.test.ts` row (L911) | covered | One row extended in TASK 5. |
| data-schema | `docs/data-schema.md` | no — no database | none | none | None. |
| design | `docs/design.md` | no — no UI | none | none | None. |
| observability | `docs/observability.md` | yes | `docs/observability.md` log prefixes (`[bkit-check]`, `[bkit-install]`, `[bkit-upgrade]`) | covered | None. The new log line reuses the owning prefix. |
| deployments | `docs/deployments.md` | yes | `docs/deployments.md` L699 (`check` exits 1 on Tier-1 / Tier-2 drift; `upgrade` re-renders docs and mirrors) | covered | None. The new drift case sits under the existing sentence. |
| noise | `docs/noise.md` | no — no log level, alert or archive change | none | none | None. |
| setup | `docs/setup.md` | no — no setup change | none | none | None. |

## Documentation Warnings

None.

## Data Schema Integration

None — no database. `.bkit/version` keeps its shape (`pinnedVersion`, `canonicalHashes`, `claudeAllowDerived`).

## Reuse Inventory

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| Name the files bkit force-renders (docs, allowlist, host mirrors) | `.bkit/core/engine/install/modules/index.ts` | `grep -n "RENDERED_MIRRORS\|listStampedFiles\|renderManagedOutputs"` in `.bkit/core/engine`; read `runBkitDocs` in `core.ts` | `listStampedFiles` (already lists the rendered mirrors on disk), `runBkitDocs` (decides merge vs overwrite per doc) | EXTEND | Pull the mirror listing out of `listStampedFiles` and the per-doc write mode out of `runBkitDocs` so one definition feeds the stamp scan, the renderer and the new function. |
| Re-record hashes of rendered outputs on upgrade | `.bkit/core/engine/commands/install/upgrade.ts` | `grep -rn "canonicalHashes" .bkit/core/engine`; read `updateCanonicalHashesAfterUpgrade` and its caller | `updateCanonicalHashesAfterUpgrade` (already refreshes `updated` ∪ `skippedSeedable` from disk) | EXTEND | Pass the rendered outputs in beside `renderedDocPaths`; the function already hashes disk. |
| Re-record hashes on install and report a stale one under `check` | `.bkit/core/engine/install/modules/core.ts` | read the `postDispatch` that writes `.bkit/version`; `grep -n "needsWrite\|ws.writes.push" core.ts`; `reportCheckDrift` in `check.ts` | the `.bkit/version` `postDispatch` (its write is already a counted would-write in `check`) | EXTEND | Add the rendered outputs to the hashed set and a stale one to `needsWrite`; `check` then fails through the existing path. |
| Prune leftover `.agents/` entries | `.bkit/core/engine/install/version-file.ts` | read `mergeCanonicalHashes`; `grep -rn 'startsWith(".agents"' .bkit/core/engine` | `mergeCanonicalHashes` (already prunes template-set paths and ledgers) | EXTEND | Add the `.agents/` rule there and delete the two writer-side copies. |
| Say which entries may differ | `.bkit/core/.bkit/install.md` | `grep -ln "canonicalHashes" docs/*.md .bkit/core/.bkit/*.md` | the `byte-equal-text` row of § Format semantics during uninstall (says `check` does not verify entries) | EXTEND | Rewrite that row's sentences; no new doc. |

## Architecture & Component Changes

**Ledger rows:** None.

### Install engine

#### [MODIFY] `.bkit/core/engine/install/modules/index.ts`

- **Existence Check:** the file exists; `listStampedFiles`, `RENDERED_MIRRORS` and `renderManagedOutputs` are there.
- Extract the rendered-mirror listing from `listStampedFiles` into a shared function; add `listRenderedOutputs(cwd)`: consumer-relative paths of the force-rendered whole files that exist on disk (non-markered `.bkit/*.md` docs, `.bkit/allowlist.json`, host agent/command mirrors), with no `.agents/` path. `dispatchModules` sets `ctx.renderedOutputs` after the modules ran and before the `postDispatch` callbacks.

#### [MODIFY] `.bkit/core/engine/install/modules/core.ts`

- **Existence Check:** the file exists; `runBkitDocs` and the `.bkit/version` `postDispatch` are there.
- `runBkitDocs` and `listRenderedOutputs` share one per-doc write-mode function. The `postDispatch` hashes every path in `ctx.renderedOutputs`, counts an existing entry that differs as a reason to write `.bkit/version`, and logs `[bkit-…] core: .bkit/version records a different hash for: {paths}` (it prints only in that case). The `.agents/` skip there is removed.

#### [MODIFY] `.bkit/core/engine/commands/install/upgrade.ts`

- **Existence Check:** the file exists; `updateCanonicalHashesAfterUpgrade` and its caller are there.
- The caller passes `listRenderedOutputs(process.cwd())` in beside the written paths. The `.agents/` skip in `updateCanonicalHashesAfterUpgrade` is removed.

#### [MODIFY] `.bkit/core/engine/install/version-file.ts`

- **Existence Check:** the file exists; `mergeCanonicalHashes` is there.
- `mergeCanonicalHashes` prunes an existing `.agents/` entry (counted in `pruned`) and drops a fresh one, as it does for ledgers.

### Documentation

#### [MODIFY] `.bkit/core/.bkit/install.md` and `docs/testing.md`

- **Existence Check:** both exist.
- Install doc source: the `byte-equal-text` row says which entries equal the file after upgrade and are checked (rendered docs, allowlist, host mirrors), which may differ (merged files, owner-edited payload files) and which are not recorded (`.agents/*`, template copies, ledgers). Testing doc: the `version-file.test.ts` row names the `.agents/` rule.

### Cron Jobs & Scheduled Tasks

None.

## Supersession Inventory

<!-- prettier-ignore -->
| Existing artifact | Replaced by | Decision | Justification |
| --- | --- | --- | --- |
| The `.agents/` skip in `core.ts` postDispatch and in `upgrade.ts` `updateCanonicalHashesAfterUpgrade` | the `.agents/` rule in `mergeCanonicalHashes` | DELETE | One home for the rule; the merge also prunes the entries the skips left behind. |
| The sentence "`canonicalHashes` is internal state `bkit check` does not verify" in the install doc | the entry classes in the same row | DELETE | `check` now verifies the entries for rendered files. |

## Documentation Updates

<!-- prettier-ignore -->
| Doc | Change required |
| --- | --- |
| `.bkit/core/.bkit/install.md` | The `byte-equal-text` row: which entries are checked, which may differ and why, which are not recorded. |
| `docs/testing.md` | The `version-file.test.ts` row (L911): the `.agents/` rule in `mergeCanonicalHashes`; and that the two hash writers also re-record rendered outputs. |

## Rollback Strategy

<!-- prettier-ignore -->
| Axis | Action | Notes |
| --- | --- | --- |
| **DB** | None | No database. |
| **Code** | `git revert {COMMIT}` | Code-only. A consumer's `.bkit/version` keeps the entries a run wrote; they are valid hashes. |
| **Risk window** | None | The check only fails on a wrong entry, and `bkit upgrade` fixes it. |

## Agent Execution Runbook

<!-- bkit:group 1 start -->

### TASK GROUP 1: Rendered outputs are re-recorded and checked

<!-- bkit:task 1 start -->

- [x] **TASK 1:** Add `listRenderedOutputs`, the one list of files bkit force-renders
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

- [x] **TASK 2:** `upgrade` re-records the entry of every rendered output, written or not
  - **READ:** `updateCanonicalHashesAfterUpgrade` in `.bkit/core/engine/commands/install/upgrade.ts`: `seedablePaths` is `updated` ∪ `skippedSeedable`, hashed from disk
  - **UPDATE:** `runUpgradeCommand` in `.bkit/core/engine/commands/install/upgrade.ts`: its call to `updateCanonicalHashesAfterUpgrade` adds `listRenderedOutputs(process.cwd())` to the `updated` list beside `renderedDocPaths`
  - **DEPENDS ON:** 1
  - **DONE WHEN:** after `bkit upgrade`, the entries for `.claude/commands/bkit-build.md`, `.bkit/templates.md` and `.bkit/allowlist.json` equal the sha256 of each file even when the file did not change in the run, and a wrong `package.json` entry is not rewritten
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/install/upgrade.integration.test.ts` `re-records a stale entry for a rendered mirror, doc and allowlist that are already current` fails on the entry still holding the wrong hash, "expected the entry to equal the file's sha256"

<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->

- [x] **TASK 3:** `install` re-records the same entries, and `check` fails on a wrong one
  - **READ:** `reportCheckDrift` in `.bkit/core/engine/commands/install/check.ts`: a write in the write set exits 1
  - **UPDATE:** `runCoreModule` in `.bkit/core/engine/install/modules/core.ts`: its `.bkit/version` `postDispatch` hashes every path in `ctx.renderedOutputs`; an existing entry that differs adds a `.bkit/version` write and one log line naming the paths; the `.agents/` skip is not touched here (TASK 4)
  - **DEPENDS ON:** 1
  - **DONE WHEN:** a core install run rewrites a stale entry for a rendered output whose file is current; `bkit check` exits 1 and prints the path when such an entry differs, and exits 0 when only the `package.json` entry differs and on a clean install of each host the existing check tests cover
  - **TEST FIRST:**
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `re-records a stale entry for a rendered output whose file is already current` fails on the entry still holding the wrong hash
    - `.bkit/core/engine/commands/install/check.integration.test.ts` `a wrong entry for a rendered mirror fails check and names the file, a wrong package.json entry does not` fails on check exiting 0, "expected status 1"

<!-- bkit:task 3 end -->

<!-- bkit:task 4 start -->

- [x] **TASK 4:** Drop the leftover `.agents/` entries in the one shared merge
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

<!-- bkit:group 1 end -->

<!-- bkit:group 2 start -->

### TASK GROUP 2: Docs, build output and this repo's own record

<!-- bkit:task 5 start -->

- [x] **TASK 5:** Say in the docs which entries may differ from the file, and why
  - **READ:** `.bkit/authoring.md`: § All Agent-Read Files and § Docs, before editing
  - **READ:** `.bkit/core/.bkit/install.md`: the `byte-equal-text` row in § Format semantics during uninstall
  - **UPDATE:** `.bkit/core/.bkit/install.md`: that row. Entries for rendered `.bkit/*.md` docs, `.bkit/allowlist.json` and host mirrors equal the file after install and upgrade, and `check` fails on a difference. They may differ: `package.json`, `.mcp.json`, `.cursor/mcp.json` and block-merged files (the owner's content shares the file), and a whole-file payload file the owner edited (upgrade keeps its hash so a template change is a conflict). Not recorded: `.agents/*`, template copies, ledgers. The sentence that `check` does not verify entries is removed
  - **UPDATE:** `docs/testing.md`: the `version-file.test.ts` row (L911) names the `.agents/` rule; keep the hunk to a few lines
  - **DEPENDS ON:** 4
  - **DONE WHEN:** the install doc source states the three entry classes and no longer says `check` does not verify entries; the `docs/testing.md` row names the `.agents/` rule; the rendered `.bkit/install.md` is not edited by hand
  - **TEST FIRST:** n/a — docs only, no behaviour change

<!-- bkit:task 5 end -->

<!-- bkit:task 6 start -->

- [x] **TASK 6:** Rebuild `dist/` and re-render this repo's own install record
  - **UPDATE:** `dist/cli.js`: and the rest of `dist/`, rebuilt with `pnpm build` (the committed engine build)
  - **UPDATE:** `.bkit/version`: rewritten by `pnpm tsx .bkit/core/engine/cli.ts upgrade`; the `.agents/*` entries drop out and the `.bkit/templates.md` and `.bkit/allowlist.json` entries are re-recorded
  - **UPDATE:** `.bkit/install.md`: re-rendered from the source by the same upgrade, not edited by hand
  - **DEPENDS ON:** 5
  - **DONE WHEN:** `.bkit/version` has no `.agents/` entry; its entries for `.bkit/templates.md` and `.bkit/allowlist.json` equal the sha256 of the files; the only entries left that differ from disk are `.mcp.json`, `.cursor/mcp.json` and `package.json`; `node dist/cli.js check` exits 0; `.bkit/install.md` matches its source
  - **TEST FIRST:** n/a — regenerated build output and install record (a baseline), no behaviour change

<!-- bkit:task 6 end -->

<!-- bkit:group 2 end -->

### 🔒 Gate 2: Code Implementation Check

- [ ] **No bolt-on:** no `[NEW]` file; every capability is an `EXTEND`.
- [ ] **Extensions landed:** every `EXTEND` landed in the file its row names.
- [ ] **No gate weakened:** no gate was weakened.
- [ ] **Gate 2 — Verified:** every box above is checked.

**Mandatory Tasks (Testing & Documentation):**

- [ ] **Verify test coverage against Derived Test Matrix:** each row's test is in one task's `DONE WHEN`.
- [ ] **Sweep existing tests:** broken tests are fixed, and the full suite passes (the #459 hand-edited whole-file test and the check parity tests stay green).
- [ ] **Update documentation:** the affected docs are rewritten to match.

## Verification Plan

### Automated Tests

- [ ] **Full Local Gate Suite:** the deepest declared `bkit:gate:*` script and `bkit check` pass.
- [ ] **Run all tests:** `pnpm test` and `pnpm test:integration` pass.

### Manual Verification

- [ ] **Step 1:** On a scratch consumer, install with `--claude`, set the `.claude/commands/bkit-build.md` entry in `.bkit/version` to a wrong hash, run `bkit check` (exit 1, names the file), run `bkit upgrade`, run `bkit check` (exit 0).
