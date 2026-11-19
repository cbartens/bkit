# Brief: group 1 — Retired list and the merge (tests)

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

- Group 1: Retired list and the merge — this group
  - TASK 1: Add the retired settings list and the pure prune and find functions — open
  - TASK 2: Prune inside `writeTier2JsonContained` and warn on an edited entry — open
- Group 2: Dry-run report, docs, built output — next
  - TASK 3: Report a retired entry in the dry run that `bkit check` is — open
  - TASK 4: Register the entry in `docs/migrations.md`, update the docs and close the deferral — open
  - TASK 5: Rebuild `dist/` and refresh the rendered copies — open

## The work

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** Add the retired settings list and the pure prune and find functions
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

- [ ] **TASK 2:** Prune inside `writeTier2JsonContained` and warn on an edited entry
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

### Derived Test Matrix rows

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
| every entry on the list has a row in `docs/migrations.md` naming its source tags | Static | `.bkit/core/engine/install/write.test.ts` | 4 |

## Deviations

- The list holds only what bkit shipped; it names no app stack and no consumer.
- Two later issues will add their own entries to this list ("Shell guard: the hook code is the only source of the deny, ask and secret rules", https://github.com/cbartens/bkit/issues/1006, and "Git rules and the shell guard disagree: Codex, push, reset, stash", https://github.com/cbartens/bkit/issues/1019). Make adding an entry one line plus one `docs/migrations.md` row; build nothing else for them.
- Files you may change: `.bkit/core/engine/install/**`, `.bkit/core/engine/shared/settings.ts` and its tests, the one engine file where `bkit check` reports settings findings and its tests, `docs/migrations.md`, the doc lines that describe the settings merge or the upgrade output (`docs/*.md`, `.bkit/core/.bkit/*.md` sources only), the built `dist/`, and the rendered copies that `pnpm tsx .bkit/core/engine/cli.ts upgrade` rewrites.
- Files you must not change: everything under `.bkit/core/engine/commands/workflow/` and `.bkit/core/engine/ledgers/` (the build of issue 958 changes most of them), `.bkit/core/engine/commands/ci/ci.ts`, `.bkit/instructions.md`, every workflow and prompt file, `.husky/*`, `.bkit/templates/.husky/*`, `.github/workflows/*`, and the shipped settings templates themselves (this build retires nothing new). If the fix cannot be done without one of these, stop and message the orchestrator with what you found.
- Word counts: no change expected. `pnpm bkit:text:ceiling check` must still pass. Never `raise`.
- Before each test or gate run, wait until the first number of `sysctl -n vm.loadavg` is below 10. Never run `pnpm bkit:text:ceiling raise`.
