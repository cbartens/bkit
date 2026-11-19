# Brief: group 2 — Dry-run report, docs, built output

Plan: Install: settings merge cannot take back a permission bkit shipped Implementation Plan

## Why and what

### Context & Goals

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

### Narrative

A person upgrades a project that installed bkit 5.4.x. Their `.claude/settings.json` still holds `mcp__claude_ai_Linear__*`, a grant bkit stopped shipping. After `bkit upgrade` the grant is gone and their own entries beside it are untouched; before upgrading, `bkit check` names the grant and the line to delete.

### Success Criteria

- A test seeds a settings file holding `mcp__claude_ai_Linear__*` plus a person-added entry; after upgrade the retired entry is gone and the person's entry is unchanged.
- The retired list is registered in `docs/migrations.md` with a row per entry that names its source tags.
- `bkit check` reports a retired entry that is still present.
- An entry the person edited is kept and the upgrade output warns about it.
- A dry run computes the same writeset as the real run, and a second run writes nothing.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| Entries for #1006 and #1019 | `Exempt`: each adds one list line and one migration row in its own build | #1006, #1019 |
| Retired hook groups (object lists) | `Exempt`: the existing hook-group merge replaces bkit's own groups; the issue excludes them | issue #985 non-goals |
| `.opencode/opencode.json`, `.mcp.json`, `.cursor/mcp.json` | `Exempt`: they do not go through `mergeManagedJson` | named in the final message |

## Where it fits

- Group 1: Retired list and the merge — done
  - TASK 1: Add the retired settings list and the pure prune and find functions — done
  - TASK 2: Prune inside `writeTier2JsonContained` and warn on an edited entry — done
- Group 2: Dry-run report, docs, built output — this group
  - TASK 3: Report a retired entry in the dry run that `bkit check` is — open
  - TASK 4: Register the entry in `docs/migrations.md`, update the docs and close the deferral — open
  - TASK 5: Rebuild `dist/` and refresh the rendered copies — open

## The work

<!-- bkit:task 3 start -->

- [ ] **TASK 3:** Report a retired entry in the dry run that `bkit check` is
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

- [ ] **TASK 4:** Register the entry in `docs/migrations.md`, update the docs and close the deferral
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

- [ ] **TASK 5:** Rebuild `dist/` and refresh the rendered copies
  - **UPDATE:** `dist/cli.js`: `pnpm build` output for the changed engine files
  - **UPDATE:** `.bkit/install.md`: rendered copy rewritten by `pnpm tsx .bkit/core/engine/cli.ts upgrade`
  - **DEPENDS ON:** 4
  - **DONE WHEN:** `pnpm build` exits 0, `pnpm tsx .bkit/core/engine/cli.ts upgrade` has run, `pnpm bkit:text:ceiling check` passes and `bkit check` reports no drift
  - **TEST FIRST:** n/a — built output and rendered copies only, no behaviour change

<!-- bkit:task 5 end -->

### Earlier tasks this group depends on

- TASK 2 (group 1, done): Prune inside `writeTier2JsonContained` and warn on an edited entry — `.bkit/core/engine/install/write.ts`

### Reuse Inventory rows

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| Retired settings list and pruning | `.bkit/core/engine/install/write.ts` | `grep -rn "mergeManaged\|RETIRED_DRIVER_HASHES" .bkit/core/engine`; `git diff <tag> <tag>` over the shipped settings templates; `claudeAllowDerived` in `.bkit/core/engine/install/modules/claude.ts` | `RETIRED_DRIVER_HASHES` and `writeTier2JsonContained` in `write.ts` — fixed retired list and the one JSON merge path; `enrichClaudeSettingsAllows` — recorded-grant design the owner rejected | EXTEND | Add `RETIRED_SETTINGS_ENTRIES` beside `RETIRED_DRIVER_HASHES` and prune inside `writeTier2JsonContained`; no second merge. |
| Warning for an edited entry | `.bkit/core/engine/install/write.ts` | `grep -n "console.warn" .bkit/core/engine/install/write.ts` | `writeTier2` edited-driver `console.warn` (`write.ts` line 554) | EXTEND | Same `console.warn` channel in `writeTier2JsonContained`; no signature change for the five callers. |
| `bkit check` report of a retired entry | `.bkit/core/engine/install/write.ts` | `grep -rn "detectTier2JsonDrift" .bkit/core/engine`; `grep -n "dryRun\|advisories" .bkit/core/engine/commands/install/check.ts`; `enrichClaudeSettingsAllows` in `claude.ts` | `writeTier2JsonContained` already records the write set in a dry run; `enrichClaudeSettingsAllows` pushes `derived-grants-pruned` through the module `advisories` channel | EXTEND | `bkit check` is install in dry-run mode, so the prune in `writeTier2JsonContained` is the drift signal and it pushes one advisory through the same channel; the four host modules pass `advisories` in. |
| Migration register | `docs/migrations.md` | read § Migrations rules | the existing rows | EXTEND | One new row per list entry. |

### Architecture entries

#### [MODIFY] `.bkit/core/engine/install/write.ts`

- **Existence Check:** the file exists.
- Add `RETIRED_SETTINGS_ENTRIES` (one line per entry: `{ file, path, value }`), `findRetiredSettingsEntries`, `pruneRetiredSettingsEntries`, and call the prune in `writeTier2JsonContained` before `deepContains`.

#### [MODIFY] `docs/migrations.md`, `.bkit/core/.bkit/install.md`, `docs/testing.md`

- Migration row, the plain-value list sentence in § JSON ownership model, the test inventory rows.

## Deviations

- The list holds only what bkit shipped; it names no app stack and no consumer.
- Two later issues will add their own entries to this list ("Shell guard: the hook code is the only source of the deny, ask and secret rules", https://github.com/cbartens/bkit/issues/1006, and "Git rules and the shell guard disagree: Codex, push, reset, stash", https://github.com/cbartens/bkit/issues/1019). Make adding an entry one line plus one `docs/migrations.md` row; build nothing else for them.
- Files you may change: `.bkit/core/engine/install/**`, `.bkit/core/engine/shared/settings.ts` and its tests, the one engine file where `bkit check` reports settings findings and its tests, `docs/migrations.md`, the doc lines that describe the settings merge or the upgrade output (`docs/*.md`, `.bkit/core/.bkit/*.md` sources only), the built `dist/`, and the rendered copies that `pnpm tsx .bkit/core/engine/cli.ts upgrade` rewrites.
- Files you must not change: everything under `.bkit/core/engine/commands/workflow/` and `.bkit/core/engine/ledgers/` (the build of issue 958 changes most of them), `.bkit/core/engine/commands/ci/ci.ts`, `.bkit/instructions.md`, every workflow and prompt file, `.husky/*`, `.bkit/templates/.husky/*`, `.github/workflows/*`, and the shipped settings templates themselves (this build retires nothing new). If the fix cannot be done without one of these, stop and message the orchestrator with what you found.
- Word counts: no change expected. `pnpm bkit:text:ceiling check` must still pass. Never `raise`.
- Before each test or gate run, wait until the first number of `sysctl -n vm.loadavg` is below 10. Never run `pnpm bkit:text:ceiling raise`.
