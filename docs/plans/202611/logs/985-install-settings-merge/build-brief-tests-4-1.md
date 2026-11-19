# Brief: group 4 — Challenge round 2 findings (tests)

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
- Group 2: Dry-run report, docs, built output — done
  - TASK 3: Report a retired entry in the dry run that `bkit check` is — done
  - TASK 4: Register the entry in `docs/migrations.md`, update the docs and close the deferral — done
  - TASK 5: Rebuild `dist/` and refresh the rendered copies — done
- Group 3: Challenge round 1 findings — done
  - TASK 6: A consumer who lists the claude.ai connector `Linear` in the `.agents/context.md` `mcp-servers` block gets `mcp__claude_ai_Linear__*` pruned and re-added on every install and upgrade, so `bkit check` exits 1 with drift forever — done
  - TASK 7: A later retired-list entry on `permissions.deny` or `permissions.ask` silently deletes a person's own identical deny or ask rule on `bkit upgrade`, so agents run a command the project chose to block or confirm — done
- Group 4: Challenge round 2 findings — this group
  - TASK 8: A consumer upgrading from bkit v0.4.0-v2.2.3 keeps the Linear connector grants bkit shipped (`mcp__claude_ai_Linear__save_issue`, `save_comment`, `list_issues` and seven more), and the upgrade tells them each is their own edit, so an agent steered by issue text still reads and writes their claude.ai Linear workspace without asking — open

## The work

<!-- bkit:task 8 start -->
- [ ] **TASK 8:** A consumer upgrading from bkit v0.4.0-v2.2.3 keeps the Linear connector grants bkit shipped (`mcp__claude_ai_Linear__save_issue`, `save_comment`, `list_issues` and seven more), and the upgrade tells them each is their own edit, so an agent steered by issue text still reads and writes their claude.ai Linear workspace without asking
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/install/write.ts:419` · **Round:** 2
  - **DONE WHEN:** `RETIRED_SETTINGS_ENTRIES` holds each of the ten `mcp__claude_ai_Linear__<tool>` strings that `.agents/templates/.claude/settings.json` shipped (`git show v2.2.3:.agents/templates/.claude/settings.json` lines 9-18: `list_teams`, `list_projects`, `list_issues`, `list_issue_labels`, `list_issue_statuses`, `get_issue`, `get_issue_status`, `save_issue`, `list_comments`, `save_comment`; `get_issue`, `list_issues`, `save_issue`, `list_comments`, `save_comment` from `v0.4.0`, the rest from `v2.0.5`, all last in `v2.2.3`), each with a `docs/migrations.md` row naming its source tags. `findRetiredSettingsEntries` reports them as `retired`, never `edited`, and `writeTier2JsonContained` removes them. Every test and doc that uses `mcp__claude_ai_Linear__get_issue` as the person's edited example (`write.test.ts:952`, `claude.integration.test.ts:208`, the `docs/migrations.md` row, the plan's Concrete Example) uses a string no release shipped instead, and the `toHaveLength(1)` assertion in `shipped list holds mcp__claude_ai_Linear__* for .claude/settings.json permissions.allow` follows the list length.
  - **TEST FIRST:**
    - `.bkit/core/engine/install/write.test.ts` `removes every Linear connector tool grant bkit shipped in v0.4.0-v2.2.3 and reports none as edited` fails on `pruneRetiredSettingsEntries(".claude/settings.json", { permissions: { allow: [<the ten strings>, "mcp__mine__*"] } })` keeping all ten strings, and `findRetiredSettingsEntries` returning them in `edited` instead of `retired`
    - `.bkit/core/engine/install/modules/claude.integration.test.ts` `dry run over a v2.2.3 settings file names the Linear connector write grants as retired, not kept` fails on the `retired-settings-entry` advisory `detect` listing `mcp__claude_ai_Linear__save_issue` under "edited copies of a retired entry, kept" (seed `allow: ["Bash(ls)", "mcp__claude_ai_Linear__save_issue", "mcp__claude_ai_Linear__save_comment"]`, no `mcp-servers` block, `runClaudeModule(makeCtx({ dryRun: true }))`)
<!-- bkit:task 8 end -->

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
| a dry run (the `bkit check` path) over a seeded old-shape settings file reports the file as drift and the advisory names the retired entry | Integration | `.bkit/core/engine/install/modules/claude.integration.test.ts` | 3 |
| a dry run over a clean settings file records no drift and no `retired-settings-entry` advisory | Integration | `.bkit/core/engine/install/modules/claude.integration.test.ts` | 3 |
| a dry run names an edited variant as kept in the advisory | Integration | `.bkit/core/engine/install/modules/claude.integration.test.ts` | 3 |
| every entry on the list has a row in `docs/migrations.md` naming its source tags | Static | `.bkit/core/engine/install/write.test.ts` | 4 |
| keeps a retired value the mcp-servers block derives and records no drift on the next dry run | Integration | `.bkit/core/engine/install/modules/claude.integration.test.ts` | 6 |
| does not remove a deny rule named by an injected retired list | Unit | `.bkit/core/engine/install/write.test.ts` | 7 |
| removes every Linear connector tool grant bkit shipped in v0.4.0-v2.2.3 and reports none as edited | Unit | `.bkit/core/engine/install/write.test.ts` | 8 |
| dry run over a v2.2.3 settings file names the Linear connector write grants as retired, not kept | Integration | `.bkit/core/engine/install/modules/claude.integration.test.ts` | 8 |

## Deviations

- The list holds only what bkit shipped; it names no app stack and no consumer.
- Two later issues will add their own entries to this list ("Shell guard: the hook code is the only source of the deny, ask and secret rules", https://github.com/cbartens/bkit/issues/1006, and "Git rules and the shell guard disagree: Codex, push, reset, stash", https://github.com/cbartens/bkit/issues/1019). Make adding an entry one line plus one `docs/migrations.md` row; build nothing else for them.
- Files you may change: `.bkit/core/engine/install/**`, `.bkit/core/engine/shared/settings.ts` and its tests, the one engine file where `bkit check` reports settings findings and its tests, `docs/migrations.md`, the doc lines that describe the settings merge or the upgrade output (`docs/*.md`, `.bkit/core/.bkit/*.md` sources only), the built `dist/`, and the rendered copies that `pnpm tsx .bkit/core/engine/cli.ts upgrade` rewrites.
- Files you must not change: everything under `.bkit/core/engine/commands/workflow/` and `.bkit/core/engine/ledgers/` (the build of issue 958 changes most of them), `.bkit/core/engine/commands/ci/ci.ts`, `.bkit/instructions.md`, every workflow and prompt file, `.husky/*`, `.bkit/templates/.husky/*`, `.github/workflows/*`, and the shipped settings templates themselves (this build retires nothing new). If the fix cannot be done without one of these, stop and message the orchestrator with what you found.
- Word counts: no change expected. `pnpm bkit:text:ceiling check` must still pass. Never `raise`.
- Before each test or gate run, wait until the first number of `sysctl -n vm.loadavg` is below 10. Never run `pnpm bkit:text:ceiling raise`.
