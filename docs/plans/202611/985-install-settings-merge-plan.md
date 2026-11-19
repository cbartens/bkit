# Install: settings merge cannot take back a permission bkit shipped Implementation Plan

## Context & Goals

`bkit install` and `bkit upgrade` merge bkit's JSON settings files into the project's copy and keep every entry the project already holds, so a permission bkit used to ship and later dropped stays in the project for good. Decided by the owner (issue #985 comment of 2026-11-17, decision row `985-retired-settings-entries-fixed-list`): each release ships a fixed list of the exact entries it retired, each with a row in `docs/migrations.md`; an entry the person edited no longer matches, so it is kept and the upgrade output warns; nothing is recorded in `.bkit/version`. `bkit check` reports a retired entry that is still present.

**Related Issues:**

- #985 — Install: settings merge cannot take back a permission bkit shipped (open)
- #1006 — Shell guard: the hook code is the only source of the deny, ask and secret rules (open; adds its own list entries later)
- #1019 — Git rules and the shell guard disagree: Codex, push, reset, stash (open; adds its own list entries later)
- #787 — Show authoring rules before every edit, including shell edits (the merge came from it)

**Source of the first list entry:** `git rev-parse --is-shallow-repository` is `false`. Comparing `.bkit/shared/.claude/settings.json`, `.bkit/shared/.codex/hooks.json`, `.bkit/shared/.cursor/hooks.json`, `.bkit/shared/.agents/plugins/bkit/{hooks,plugin}.json` between every release tag and `HEAD` finds one plain-value entry a release shipped and a later one dropped: `mcp__claude_ai_Linear__*` in `permissions.allow` of `.claude/settings.json`. It is in `.bkit/templates/.claude/settings.json` / `.bkit/shared/.claude/settings.json` from `v3.0.0` through `v5.4.0` (`git show v5.4.0:.bkit/shared/.claude/settings.json` line 8) and absent from `v5.5.0` (dropped by commit `f57bc5942`; `git diff v5.4.0 v5.5.0 -- .bkit/shared/.claude/settings.json`). Nothing in the engine derives it (no match in `.bkit/core/engine/**/*.ts`), so it is not re-added. The other differences found are hook-group object lists (Antigravity `hooks.json` commands, Claude `PreToolUse` matcher), which the existing hook-group merge already replaces and the issue puts out of scope, and `.cursor/mcp.json` `Authorization`, which goes through `reconcileMcpJson`, not this merge.

**Hosts.** The pruning sits in `writeTier2JsonContained`, so every file that function writes is covered: `.claude/settings.json` (`claude.ts`), `.cursor/hooks.json` (`cursor.ts`), `.codex/hooks.json` (`codex.ts`), `.agents/plugins/bkit/hooks.json` and `plugin.json` (`antigravity.ts`) and every `format: "json"` candidate in `runUpgrade` (`upgrade.ts`). Not through this merge, named in the final message: `.opencode/opencode.json` (`reconcileOpencodeJson`, `deepMergeJson`, template provider blocks replace the project's) and `.mcp.json` / `.cursor/mcp.json` (`reconcileMcpJson`, per-entry ownership of one tracker key).

**Files this build must not change:** everything under `.bkit/core/engine/commands/workflow/` and `.bkit/core/engine/ledgers/`, `.bkit/core/engine/commands/ci/ci.ts`, `.bkit/instructions.md`, workflow and prompt files, `.husky/*`, `.bkit/templates/.husky/*`, `.github/workflows/*` and the shipped settings templates. The brief names `.bkit/core/engine/shared/settings.ts` as the settings merge; that file reads the `bkit` block of `package.json` and holds no merge, so it is not touched. `bkit check` is install in dry-run mode, so its report comes from the install write path (the write set plus one advisory); nothing under `.bkit/core/engine/checks/` changes.

---

## 👤 ⚠️ Acceptance Scenario

### Narrative

A person upgrades a project that installed bkit 5.4.x. Their `.claude/settings.json` still holds `mcp__claude_ai_Linear__*`, a grant bkit stopped shipping. After `bkit upgrade` the grant is gone and their own entries beside it are untouched; before upgrading, `bkit check` names the grant and the line to delete.

### Success Criteria

- A test seeds a settings file holding `mcp__claude_ai_Linear__*` plus a person-added entry; after upgrade the retired entry is gone and the person's entry is unchanged.
- The retired list is registered in `docs/migrations.md` with a row per entry that names its source tags.
- `bkit check` reports a retired entry that is still present.
- An entry the person edited is kept and the upgrade output warns about it.
- A dry run computes the same writeset as the real run, and a second run writes nothing.

### Process Sketch

- **WHEN** `bkit upgrade` or `bkit install` merges a JSON settings file listed in `RETIRED_SETTINGS_ENTRIES` **→ THEN** each exact retired string in the named list is removed before the template merge, and the file is written (or recorded as an update in a dry run).
- **WHEN** the list also holds a string that starts with a retired entry's stem but is not equal to it **→ THEN** it is kept and a warning names the file, the entry and the line to delete.
- **WHEN** `bkit check` (install in dry-run mode) runs **→ THEN** the settings file is in the write set as drift, and one `retired-settings-entry` advisory per file names each retired entry it would remove and each edited entry it would keep.
- **IF** the settings file is malformed JSON **→ THEN** the existing refusal to merge applies unchanged.

### Concrete Example

**Setup:** `.claude/settings.json` holds `permissions.allow: ["Bash(*)", "mcp__claude_ai_Linear__*", "Bash(my-own-tool:*)", "mcp__claude_ai_Linear__my_own_tool"]`.

**Steps:**

1. Person runs `bkit check` → `.claude/settings.json` is reported as drift, and advisory `retired-settings-entry` lists `mcp__claude_ai_Linear__*` in `permissions.allow` and says `bkit upgrade` removes it (or delete the line).
2. Person runs `bkit upgrade` → `mcp__claude_ai_Linear__*` removed; `Bash(my-own-tool:*)` kept; `mcp__claude_ai_Linear__my_own_tool` kept with a warning that it no longer matches what bkit shipped.

**Outcome:** The retired grant is gone, both of the person's entries remain, and a second `bkit upgrade` changes nothing.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| Template is otherwise fully contained in the project's file | The retired entry is still removed (pruning runs before the containment check). |
| Dry run | The same write is recorded, the file is not touched. |
| Entry equals a string the current template ships | Never removed or reported as edited. |
| Person-added entry in another list or another file | Untouched. |
| Destination path is relative (install) or absolute (upgrade) | Matched by repo-relative path either way. |

### Derived Test Matrix

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| the shipped list holds `mcp__claude_ai_Linear__*` for `.claude/settings.json` `permissions.allow` | Unit | `.bkit/core/engine/install/write.test.ts` | 1 |
| a retired entry is removed and the person's entries beside it stay | Unit | `.bkit/core/engine/install/write.test.ts` | 1 |
| a document without the retired entry is returned unchanged, and a second prune changes nothing | Unit | `.bkit/core/engine/install/write.test.ts` | 1 |
| an edited variant of a retired entry is kept and reported as edited | Unit | `.bkit/core/engine/install/write.test.ts` | 1 |
| an entry the template ships is never reported as edited | Unit | `.bkit/core/engine/install/write.test.ts` | 1 |
| the file is matched by repo-relative path whether the destination is relative or absolute | Unit | `.bkit/core/engine/install/write.test.ts` | 1 |
| a retired entry is pruned in any host file the list names (Codex `hooks.json`) | Unit | `.bkit/core/engine/install/write.test.ts` | 1 |
| a retired entry is dropped even when the template is otherwise contained | Unit | `.bkit/core/engine/install/write.test.ts` | 2 |
| a dry run records the same write and leaves the file untouched | Unit | `.bkit/core/engine/install/write.test.ts` | 2 |
| a second run after pruning writes nothing | Unit | `.bkit/core/engine/install/write.test.ts` | 2 |
| an edited variant is kept and the warning names the file and the entry | Unit | `.bkit/core/engine/install/write.test.ts` | 2 |
| `bkit upgrade` over a seeded old-shape settings file removes the retired grant and keeps the person's | Integration | `.bkit/core/engine/commands/install/upgrade.integration.test.ts` | 2 |
| `bkit upgrade --dry-run` over the same file lists the settings update and leaves the grant | Integration | `.bkit/core/engine/commands/install/upgrade.integration.test.ts` | 2 |
| a dry run (the `bkit check` path) over a seeded old-shape settings file reports the file as drift and the advisory names the retired entry | Integration | `.bkit/core/engine/install/modules/claude.integration.test.ts` | 3 |
| a dry run over a clean settings file records no drift and no `retired-settings-entry` advisory | Integration | `.bkit/core/engine/install/modules/claude.integration.test.ts` | 3 |
| a dry run names an edited variant as kept in the advisory | Integration | `.bkit/core/engine/install/modules/claude.integration.test.ts` | 3 |
| every entry on the list has a row in `docs/migrations.md` naming its source tags | Static | `.bkit/core/engine/install/write.test.ts` | 4 |
| keeps a retired value the mcp-servers block derives and records no drift on the next dry run | Integration | `.bkit/core/engine/install/modules/claude.integration.test.ts` | 6 |
| does not remove a deny rule named by an injected retired list | Unit | `.bkit/core/engine/install/write.test.ts` | 7 |
| removes every Linear connector tool grant bkit shipped in v0.4.0-v2.2.3 and reports none as edited | Unit | `.bkit/core/engine/install/write.test.ts` | 8 |
| dry run over a v2.2.3 settings file names the Linear connector write grants as retired, not kept | Integration | `.bkit/core/engine/install/modules/claude.integration.test.ts` | 8 |
| Take over shipped list holds mcp__claude_ai_Linear__* for .claude/settings.json permissions.allow from TASK 1 | Unit | `.bkit/core/engine/install/write.test.ts` | 9 |
| Take over reports an edited variant as edited and never removes it from TASK 1 | Unit | `.bkit/core/engine/install/write.test.ts` | 10 |
| Take over does not report an entry the template ships as edited from TASK 1 | Unit | `.bkit/core/engine/install/write.test.ts` | 11 |
| Take over keeps an edited variant and warns with the file and the entry from TASK 2 | Unit | `.bkit/core/engine/install/write.test.ts` | 12 |
| Take over dry run names an edited variant as kept from TASK 3 | Integration | `.bkit/core/engine/install/modules/claude.integration.test.ts` | 13 |

### 👤 ✅ Human Confirmation

- [ ] **Acceptance Scenario confirmed:** I have reviewed the Narrative, Success Criteria, Process Sketch, Concrete Example, Edge Cases, and Derived Test Matrix above. They correctly describe what "done" looks like.

---

## 👤 ⚠️ Breaking Changes & Naming Review

`bkit upgrade` and `bkit install` now remove each string on `RETIRED_SETTINGS_ENTRIES` from the project's JSON settings files. A person who added `mcp__claude_ai_Linear__*` by hand loses it too, because an exact match cannot tell bkit's copy from theirs; the owner accepted this in the 2026-11-17 decision. New names: `RETIRED_SETTINGS_ENTRIES`, `pruneRetiredSettingsEntries`, `findRetiredSettingsEntries` (in `write.ts`), `detectRetiredSettingsEntries` (in `files.ts`) and the advisory id `retired-settings-entry`.

### 👤 ✅ Human Confirmation

- [ ] **Breaking Changes confirmed:** I have reviewed every breaking change and naming decision above.

---

## 👤 ⚠️ Open Questions & Assumptions

- **Assumption:** An edited entry is recognised as a string in the same list that starts with the retired entry's stem (the value without trailing `*`) and is not equal to it → if wrong, an edit that shares no prefix is kept silently without a warning.
- **Assumption:** `mcp__claude_ai_Linear__*` was shipped by every release from `v3.0.0` through `v5.4.0` and by none since → the release range in the migration row is wrong if a tag is missing; the `git grep` over every tag found it in each.

### 👤 ✅ Human Confirmation

- [ ] **Open Questions & Assumptions confirmed:** I have resolved or explicitly accepted every open question and assumption above.

---

## Alternative Approaches & Recommendations

Rejected by the owner: a record in `.bkit/version` of what bkit wrote. `claudeAllowDerived` already records derived grants there and stays as it is.

## Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| Entries for #1006 and #1019 | `Exempt`: each adds one list line and one migration row in its own build | #1006, #1019 |
| Retired hook groups (object lists) | `Exempt`: the existing hook-group merge replaces bkit's own groups; the issue excludes them | issue #985 non-goals |
| `.opencode/opencode.json`, `.mcp.json`, `.cursor/mcp.json` | `Exempt`: they do not go through `mergeManagedJson` | named in the final message |

## Suggested Scope Expansion

None.

## Security & Privacy

None — no new routes, DB writes, secrets, or user input. The change removes a permission grant from a project's settings and never widens one.

## Documentation Consultation

<!-- prettier-ignore -->
| Topic | Recommended path | Applies | Source used (path and section) | Coverage | Gap and action |
| --- | --- | --- | --- | --- | --- |
| architecture | `docs/architecture.md` | yes | `docs/architecture.md` (install modules); `.bkit/core/.bkit/install.md` § JSON ownership model | partial | `docs/architecture.md` does not describe the settings merge; the install doc is the home and gets the update in task 5. |
| technology | `docs/technology.md` | no — no framework or library change | `none` | none | None. |
| security | `docs/security.md` | yes | `docs/security.md` § Trust boundaries | covered | None — only removes grants. |
| testing | `docs/testing.md` | yes | `docs/testing.md` § Repository test patterns (rows for `write.test.ts`, `upgrade.integration.test.ts`) | covered | Test inventory rows updated in task 5. |
| deployments | `docs/deployments.md` | no — no release or CI change | `none` | none | None. |
| migrations | `docs/migrations.md` | yes | `docs/migrations.md` § Migrations (rules and rows) | covered | Row added in task 5. |
| data-schema, design, observability, noise, setup | `docs/*.md` | no — no database, UI, logging or setup change | `none` | none | None. |

## Documentation Warnings

None

## Data Schema Integration

None — no database. `.bkit/version` is not changed.

## Reuse Inventory

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| Retired settings list and pruning | `.bkit/core/engine/install/write.ts` | `grep -rn "mergeManaged\|RETIRED_DRIVER_HASHES" .bkit/core/engine`; `git diff <tag> <tag>` over the shipped settings templates; `claudeAllowDerived` in `.bkit/core/engine/install/modules/claude.ts` | `RETIRED_DRIVER_HASHES` and `writeTier2JsonContained` in `write.ts` — fixed retired list and the one JSON merge path; `enrichClaudeSettingsAllows` — recorded-grant design the owner rejected | EXTEND | Add `RETIRED_SETTINGS_ENTRIES` beside `RETIRED_DRIVER_HASHES` and prune inside `writeTier2JsonContained`; no second merge. |
| Warning for an edited entry | `.bkit/core/engine/install/write.ts` | `grep -n "console.warn" .bkit/core/engine/install/write.ts` | `writeTier2` edited-driver `console.warn` (`write.ts` line 554) | EXTEND | Same `console.warn` channel in `writeTier2JsonContained`; no signature change for the five callers. |
| `bkit check` report of a retired entry | `.bkit/core/engine/install/write.ts` | `grep -rn "detectTier2JsonDrift" .bkit/core/engine`; `grep -n "dryRun\|advisories" .bkit/core/engine/commands/install/check.ts`; `enrichClaudeSettingsAllows` in `claude.ts` | `writeTier2JsonContained` already records the write set in a dry run; `enrichClaudeSettingsAllows` pushes `derived-grants-pruned` through the module `advisories` channel | EXTEND | `bkit check` is install in dry-run mode, so the prune in `writeTier2JsonContained` is the drift signal and it pushes one advisory through the same channel; the four host modules pass `advisories` in. |
| Migration register | `docs/migrations.md` | read § Migrations rules | the existing rows | EXTEND | One new row per list entry. |

## Architecture & Component Changes

**Ledger rows:** `985-retired-settings-entries-fixed-list`

### Install write path

#### [MODIFY] `.bkit/core/engine/install/write.ts`

- **Existence Check:** the file exists.
- Add `RETIRED_SETTINGS_ENTRIES` (one line per entry: `{ file, path, value }`), `findRetiredSettingsEntries`, `pruneRetiredSettingsEntries`, and call the prune in `writeTier2JsonContained` before `deepContains`.

### `bkit check`

#### [MODIFY] `.bkit/core/engine/install/modules/{claude,cursor,codex,antigravity}.ts`

- **Existence Check:** the four files exist.
- Each passes its module `advisories` to `writeTier2JsonContained`, which pushes the `retired-settings-entry` advisory; nothing under `.bkit/core/engine/checks/` changes.

### Docs

#### [MODIFY] `docs/migrations.md`, `.bkit/core/.bkit/install.md`, `docs/testing.md`

- Migration row, the plain-value list sentence in § JSON ownership model, the test inventory rows.

## Supersession Inventory

None.

## Documentation Updates

<!-- prettier-ignore -->
| Doc | Change required |
| --- | --- |
| `docs/migrations.md` | Row for `mcp__claude_ai_Linear__*` with source tags. |
| `.bkit/core/.bkit/install.md` | The list-merge paragraph says retired entries are removed and edited ones kept with a warning. |
| `docs/testing.md` | Inventory rows for the new tests. |
| `docs/deferrals.jsonl` | CLOSED row for `787-show-authoring-rules-challenge-low-bkit-core-engine-install-write-ts-256`, appended with `bkit ledgers append`. |

## Rollback Strategy

Code-only — `git revert` sufficient. A removed grant is not restored by a revert; the person re-adds it to `permissions.allow`.

## Agent Execution Runbook

<!-- bkit:group 1 start -->

### TASK GROUP 1: Retired list and the merge

<!-- bkit:task 1 start -->

- [x] **TASK 1:** Add the retired settings list and the pure prune and find functions
  - **UPDATE:** `RETIRED_DRIVER_HASHES` in `.bkit/core/engine/install/write.ts`: add `RETIRED_SETTINGS_ENTRIES` below it (one line per entry, first entry `.claude/settings.json` `permissions.allow` `mcp__claude_ai_Linear__*`), `findRetiredSettingsEntries(rel, doc, template?, list?)` returning `{ retired, edited }`, and `pruneRetiredSettingsEntries(rel, doc, list?)` returning the document without the exact retired strings
  - **READ:** `mergeManagedJson` in `.bkit/core/engine/install/write.ts`: plain-value list shape the prune sits in front of
  - **READ:** `docs/migrations.md`: the rules at the top (idempotent, release range per row)
  - **DONE WHEN:** the two functions exist and are exported; the list holds the one entry; the file is matched by repo-relative path (equal, or ending in `/` plus the path); an edited entry is a string in the same list that starts with the retired value minus trailing `*`, is not equal to it and is not shipped by the template; `pnpm bkit:test:file .bkit/core/engine/install/write.test.ts` passes
  - **TEST FIRST:**
    - `.bkit/core/engine/install/write.test.ts` `shipped list holds mcp__claude_ai_Linear__* for .claude/settings.json permissions.allow` fails on `RETIRED_SETTINGS_ENTRIES` being undefined, "expected undefined"
    - `.bkit/core/engine/install/write.test.ts` `removes a retired entry and keeps the person's entries beside it` fails on the retired string still being in `permissions.allow`
    - `.bkit/core/engine/install/write.test.ts` `returns a document without the retired entry unchanged and a second prune changes nothing` fails on the prune throwing or returning a different document
    - `.bkit/core/engine/install/write.test.ts` `reports an edited variant as edited and never removes it` fails on `edited` being empty
    - `.bkit/core/engine/install/write.test.ts` `does not report an entry the template ships as edited` fails on a template-shipped entry in `edited`
    - `.bkit/core/engine/install/write.test.ts` `matches the file by repo-relative path whether the destination is relative or absolute` fails on an absolute destination not matching
    - `.bkit/core/engine/install/write.test.ts` `prunes a retired entry in any host file the list names` fails on a `.codex/hooks.json` entry from an injected list not being removed

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [x] **TASK 2:** Prune inside `writeTier2JsonContained` and warn on an edited entry
  - **UPDATE:** `writeTier2JsonContained` in `.bkit/core/engine/install/write.ts`: after the existing file parses, prune the retired entries from the base before the `deepContains` check, treat a changed document as a write (recorded as `update` in a dry run too, written only when not a dry run), pass the pruned base to `mergeManagedJson`, and `console.warn` one line per edited entry naming the file, the list, the entry and the line to delete
  - **READ:** `.bkit/core/engine/commands/install/upgrade.ts`: the `format === "json"` branch that reaches `writeTier2JsonContained` with an absolute path
  - **READ:** `.bkit/core/engine/install/write.test.ts`: the `writeTier2JsonContained` describe block (tmp-dir tests)
  - **DEPENDS ON:** 1
  - **DONE WHEN:** a seeded old-shape `.claude/settings.json` loses the retired entry through `writeTier2JsonContained` and through `bkit upgrade`, the person's entries remain, a dry run records the same `update` and leaves the file, a second run records nothing, and `pnpm bkit:test:file` passes for `write.test.ts` and `upgrade.integration.test.ts`
  - **TEST FIRST:**
    - `.bkit/core/engine/install/write.test.ts` `drops a retired entry even when the template is otherwise contained` fails on the file being unchanged and no write recorded
    - `.bkit/core/engine/install/write.test.ts` `dry run records the same write and leaves the file untouched` fails on no `update` recorded for the dry run
    - `.bkit/core/engine/install/write.test.ts` `a second run after pruning writes nothing` fails on a second `update` being recorded
    - `.bkit/core/engine/install/write.test.ts` `keeps an edited variant and warns with the file and the entry` fails on `console.warn` not being called
    - `.bkit/core/engine/commands/install/upgrade.integration.test.ts` `upgrade over a seeded old-shape settings file removes the retired grant and keeps the person's` fails on "mcp__claude_ai_Linear__*" still being in `permissions.allow` after upgrade
    - `.bkit/core/engine/commands/install/upgrade.integration.test.ts` `upgrade dry run lists the settings update and leaves the retired grant` fails on the settings file not being in the dry-run `updated` list

<!-- bkit:task 2 end -->

<!-- bkit:group 1 end -->

<!-- bkit:group 2 start -->

### TASK GROUP 2: Dry-run report, docs, built output

<!-- bkit:task 3 start -->

- [x] **TASK 3:** Report a retired entry in the dry run that `bkit check` is
  - **UPDATE:** `writeTier2JsonContained` in `.bkit/core/engine/install/write.ts`: take an optional trailing `advisories` list; when the prune removes an entry or finds an edited one, push one `PreflightFinding` `retired-settings-entry` (severity `advisory`) naming the file, the list, each entry removed or to be removed and each edited entry kept, and the line to delete; with no list given (the `runUpgrade` path) keep task 2's `console.warn` for edited entries
  - **UPDATE:** `runClaudeModule` in `.bkit/core/engine/install/modules/claude.ts`: pass `advisories` to its `writeTier2JsonContained` call
  - **UPDATE:** `runCursorModule` in `.bkit/core/engine/install/modules/cursor.ts`: pass `advisories` to its `writeTier2JsonContained` call
  - **UPDATE:** `runCodexModule` in `.bkit/core/engine/install/modules/codex.ts`: pass `advisories` to its `writeTier2JsonContained` call
  - **UPDATE:** `runAntigravityModule` in `.bkit/core/engine/install/modules/antigravity.ts`: pass `advisories` to each of its two `writeTier2JsonContained` calls
  - **READ:** `enrichClaudeSettingsAllows` in `.bkit/core/engine/install/modules/claude.ts`: the write-set push outside the dry-run guard and the `derived-grants-pruned` advisory this follows
  - **READ:** `.bkit/core/engine/commands/install/check.ts`: `bkit check` is install in dry-run mode and reads `ws.writes`
  - **DEPENDS ON:** 2
  - **DONE WHEN:** a dry-run `runClaudeModule` over a settings file holding the retired grant has the settings path in `ws.writes` and one `retired-settings-entry` advisory naming `mcp__claude_ai_Linear__*`, a clean file has neither, and every `writeTier2JsonContained` call in the four host modules passes `advisories`; nothing under `.bkit/core/engine/checks/` changed; `pnpm bkit:test:file` passes for `claude.integration.test.ts` and `write.test.ts`
  - **TEST FIRST:**
    - `.bkit/core/engine/install/modules/claude.integration.test.ts` `dry run over a seeded old-shape settings file reports the file as drift and names the retired entry` fails on no `retired-settings-entry` advisory being pushed
    - `.bkit/core/engine/install/modules/claude.integration.test.ts` `dry run over a clean settings file records no drift and no retired-settings-entry advisory` fails on an advisory being pushed for a clean file
    - `.bkit/core/engine/install/modules/claude.integration.test.ts` `dry run names an edited variant as kept` fails on the edited variant not being named in the advisory

<!-- bkit:task 3 end -->

<!-- bkit:task 4 start -->

- [x] **TASK 4:** Register the entry in `docs/migrations.md`, update the docs and close the deferral
  - **UPDATE:** `docs/migrations.md`: add a row "Retired settings entries removed" (Where: `write.ts` `RETIRED_SETTINGS_ENTRIES`, `writeTier2JsonContained`, `files.ts` `detectRetiredSettingsEntries`; rewrites `mcp__claude_ai_Linear__*` in `.claude/settings.json` `permissions.allow`; shipped `v3.0.0` through `v5.4.0`, last in `v5.4.0`, dropped in `v5.5.0` by `f57bc5942`; releases "up to 5.4.x"; tests named); say an edited entry is kept with a warning
  - **UPDATE:** `.bkit/core/.bkit/install.md`: the list-merge paragraph in § JSON ownership model (plain-value lists) says retired entries are removed before the merge and an edited one is kept with a warning
  - **UPDATE:** `docs/testing.md`: rows for the new tests beside the `write.test.ts` (`mergeManagedJson`), `upgrade.integration.test.ts` and `claude.integration.test.ts` inventory lines
  - **UPDATE:** `docs/deferrals.jsonl`: append a CLOSED row for `787-show-authoring-rules-challenge-low-bkit-core-engine-install-write-ts-256` with `bkit ledgers append`, never editing a line
  - **DEPENDS ON:** 2, 3
  - **DONE WHEN:** `docs/migrations.md` holds the row with its source tags, `install.md` states the rule, the deferral key has a CLOSED row, and the list-versus-migrations test passes
  - **TEST FIRST:**
    - `.bkit/core/engine/install/write.test.ts` `every entry on the retired settings list has a docs/migrations.md row naming its source tags` fails on "mcp__claude_ai_Linear__*" not being found in `docs/migrations.md`

<!-- bkit:task 4 end -->

<!-- bkit:task 5 start -->

- [x] **TASK 5:** Rebuild `dist/` and refresh the rendered copies
  - **UPDATE:** `dist/cli.js`: `pnpm build` output for the changed engine files
  - **UPDATE:** `.bkit/install.md`: rendered copy rewritten by `pnpm tsx .bkit/core/engine/cli.ts upgrade`
  - **DEPENDS ON:** 4
  - **DONE WHEN:** `pnpm build` exits 0, `pnpm tsx .bkit/core/engine/cli.ts upgrade` has run, `pnpm bkit:text:ceiling check` passes and `bkit check` reports no drift
  - **TEST FIRST:** n/a — built output and rendered copies only, no behaviour change

<!-- bkit:task 5 end -->

<!-- bkit:group 2 end -->

<!-- bkit:group 3 start -->

### TASK GROUP 3: Challenge round 1 findings

<!-- bkit:task 6 start -->

- [x] **TASK 6:** A consumer who lists the claude.ai connector `Linear` in the `.agents/context.md` `mcp-servers` block gets `mcp__claude_ai_Linear__*` pruned and re-added on every install and upgrade, so `bkit check` exits 1 with drift forever
      **Severity:** HIGH · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/install/write.ts:492` · **Round:** 1
  - **DONE WHEN:** a retired value that `resolveClaudeDerivedAllows(cwd)` (`.bkit/core/engine/install/cloud-env.ts:607-612`) derives for the checkout is neither pruned nor reported as retired, on both the install path (`runClaudeModule`) and the upgrade path (`runUpgrade` JSON branch, then `enrichClaudeSettingsAllows` at `upgrade.ts:1008-1014`). With `Linear` in `mcp-servers`, a real run followed by a dry run records no `.claude/settings.json` write and no `retired-settings-entry` advisory, and the grant stays in `permissions.allow`.
  - **TEST FIRST:**
    - `.bkit/core/engine/install/modules/claude.integration.test.ts` `keeps a retired value the mcp-servers block derives and records no drift on the next dry run` fails on the dry run recording an `update` for `.claude/settings.json` and pushing a `retired-settings-entry` advisory. Setup: `.agents/context.md` = `<!-- bkit:end -->` plus a `mcp-servers` block holding `Linear`; settings `allow: ["Bash(ls)"]`; one real `runClaudeModule(makeCtx())`, then `runClaudeModule(makeCtx({ dryRun: true }))`.

<!-- bkit:task 6 end -->
<!-- bkit:task 7 start -->

- [x] **TASK 7:** A later retired-list entry on `permissions.deny` or `permissions.ask` silently deletes a person's own identical deny or ask rule on `bkit upgrade`, so agents run a command the project chose to block or confirm
      **Severity:** MEDIUM · **Class:** architectural · **Fixable:** false · **Location:** `.bkit/core/engine/install/write.ts:416` · **Round:** 1
  - **DONE WHEN:** The retired list is limited to `permissions.allow`. `pruneRetiredSettingsEntries` and `findRetiredSettingsEntries` throw an error naming the entry and its path when any list entry (shipped `RETIRED_SETTINGS_ENTRIES` or an injected list) names a path other than `permissions.allow`, and remove nothing for it. The refusal is loud at build and test time, never a silent skip at install time. How allow entries are retired does not change. Whether a release may ever take back a deny or ask rule stays an open owner question (issue #1006); this task does not answer it.
  - **TEST FIRST:**
    - `.bkit/core/engine/install/write.test.ts` `does not remove a deny rule named by an injected retired list` fails on `pruneRetiredSettingsEntries(".claude/settings.json", { permissions: { deny: ["Bash(rm -rf ~/*)", "Bash(mine)"] } }, [{ file: ".claude/settings.json", path: "permissions.deny", value: "Bash(rm -rf ~/*)" }])` returning `permissions.deny` without `"Bash(rm -rf ~/*)"` instead of throwing an error that names `permissions.deny` and `Bash(rm -rf ~/*)`

<!-- bkit:task 7 end -->
<!-- bkit:group 3 end -->

<!-- bkit:group 4 start -->

### TASK GROUP 4: Challenge round 2 findings

<!-- bkit:task 8 start -->

- [x] **TASK 8:** A consumer upgrading from bkit v0.4.0-v2.2.3 keeps the Linear connector grants bkit shipped (`mcp__claude_ai_Linear__save_issue`, `save_comment`, `list_issues` and seven more), and the upgrade tells them each is their own edit, so an agent steered by issue text still reads and writes their claude.ai Linear workspace without asking
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/install/write.ts:419` · **Round:** 2
  - **DONE WHEN:** `RETIRED_SETTINGS_ENTRIES` holds each of the ten `mcp__claude_ai_Linear__<tool>` strings that `.agents/templates/.claude/settings.json` shipped (`git show v2.2.3:.agents/templates/.claude/settings.json` lines 9-18: `list_teams`, `list_projects`, `list_issues`, `list_issue_labels`, `list_issue_statuses`, `get_issue`, `get_issue_status`, `save_issue`, `list_comments`, `save_comment`; `get_issue`, `list_issues`, `save_issue`, `list_comments`, `save_comment` from `v0.4.0`, the rest from `v2.0.5`, all last in `v2.2.3`), each with a `docs/migrations.md` row naming its source tags. `findRetiredSettingsEntries` reports them as `retired`, never `edited`, and `writeTier2JsonContained` removes them. Every test and doc that uses `mcp__claude_ai_Linear__get_issue` as the person's edited example (`write.test.ts:952`, `claude.integration.test.ts:208`, the `docs/migrations.md` row, the plan's Concrete Example) uses a string no release shipped instead, and the `toHaveLength(1)` assertion in `shipped list holds mcp__claude_ai_Linear__* for .claude/settings.json permissions.allow` follows the list length.
  - **TEST FIRST:**
    - `.bkit/core/engine/install/write.test.ts` `removes every Linear connector tool grant bkit shipped in v0.4.0-v2.2.3 and reports none as edited` fails on `pruneRetiredSettingsEntries(".claude/settings.json", { permissions: { allow: [<the ten strings>, "mcp__mine__*"] } })` keeping all ten strings, and `findRetiredSettingsEntries` returning them in `edited` instead of `retired`
    - `.bkit/core/engine/install/modules/claude.integration.test.ts` `dry run over a v2.2.3 settings file names the Linear connector write grants as retired, not kept` fails on the `retired-settings-entry` advisory `detect` listing `mcp__claude_ai_Linear__save_issue` under "edited copies of a retired entry, kept" (seed `allow: ["Bash(ls)", "mcp__claude_ai_Linear__save_issue", "mcp__claude_ai_Linear__save_comment"]`, no `mcp-servers` block, `runClaudeModule(makeCtx({ dryRun: true }))`)

<!-- bkit:task 8 end -->
<!-- bkit:group 4 end -->

<!-- bkit:group 5 start -->

### TASK GROUP 5: Planned tests the build took over

<!-- bkit:task 9 start -->

- [x] **TASK 9:** Take over `shipped list holds mcp__claude_ai_Linear__* for .claude/settings.json permissions.allow` from TASK 1
  - **DEPENDS ON:** 8
  - **DONE WHEN:** `.bkit/core/engine/install/write.test.ts` `shipped list holds mcp__claude_ai_Linear__* for .claude/settings.json permissions.allow` passes
  - **TEST FIRST:**
    - `.bkit/core/engine/install/write.test.ts` `shipped list holds mcp__claude_ai_Linear__* for .claude/settings.json permissions.allow` fails until TASK 8's code exists: the ten Linear tool strings are now retired, so the old example (get_issue) is no longer an edited or template-shipped value and the old length 1 no longer holds; length assertion now 11 as the task DONE WHEN requires

<!-- bkit:task 9 end -->

<!-- bkit:task 10 start -->

- [x] **TASK 10:** Take over `reports an edited variant as edited and never removes it` from TASK 1
  - **DEPENDS ON:** 8
  - **DONE WHEN:** `.bkit/core/engine/install/write.test.ts` `reports an edited variant as edited and never removes it` passes
  - **TEST FIRST:**
    - `.bkit/core/engine/install/write.test.ts` `reports an edited variant as edited and never removes it` fails until TASK 8's code exists: the ten Linear tool strings are now retired, so the old example (get_issue) is no longer an edited or template-shipped value and the old length 1 no longer holds; example now mcp__claude_ai_Linear__my_own_tool as the task DONE WHEN requires

<!-- bkit:task 10 end -->

<!-- bkit:task 11 start -->

- [x] **TASK 11:** Take over `does not report an entry the template ships as edited` from TASK 1
  - **DEPENDS ON:** 8
  - **DONE WHEN:** `.bkit/core/engine/install/write.test.ts` `does not report an entry the template ships as edited` passes
  - **TEST FIRST:**
    - `.bkit/core/engine/install/write.test.ts` `does not report an entry the template ships as edited` fails until TASK 8's code exists: the ten Linear tool strings are now retired, so the old example (get_issue) is no longer an edited or template-shipped value and the old length 1 no longer holds; example now mcp__claude_ai_Linear__my_own_tool

<!-- bkit:task 11 end -->

<!-- bkit:task 12 start -->

- [x] **TASK 12:** Take over `keeps an edited variant and warns with the file and the entry` from TASK 2
  - **DEPENDS ON:** 8
  - **DONE WHEN:** `.bkit/core/engine/install/write.test.ts` `keeps an edited variant and warns with the file and the entry` passes
  - **TEST FIRST:**
    - `.bkit/core/engine/install/write.test.ts` `keeps an edited variant and warns with the file and the entry` fails until TASK 8's code exists: the ten Linear tool strings are now retired, so the old example (get_issue) is no longer an edited or template-shipped value and the old length 1 no longer holds; example now mcp__claude_ai_Linear__my_own_tool

<!-- bkit:task 12 end -->

<!-- bkit:task 13 start -->

- [x] **TASK 13:** Take over `dry run names an edited variant as kept` from TASK 3
  - **DEPENDS ON:** 8
  - **DONE WHEN:** `.bkit/core/engine/install/modules/claude.integration.test.ts` `dry run names an edited variant as kept` passes
  - **TEST FIRST:**
    - `.bkit/core/engine/install/modules/claude.integration.test.ts` `dry run names an edited variant as kept` fails until TASK 8's code exists: the ten Linear tool strings are now retired, so the old example (get_issue) is no longer an edited or template-shipped value and the old length 1 no longer holds; example now mcp__claude_ai_Linear__my_own_tool

<!-- bkit:task 13 end -->

<!-- bkit:group 5 end -->

### 🔒 Gate 2: Code Implementation Check

- [ ] **No bolt-on:** no new file; every change extends the artifact its `Reuse Inventory` row names.
- [ ] **Gate 2 — Verified:** every box above is checked.
