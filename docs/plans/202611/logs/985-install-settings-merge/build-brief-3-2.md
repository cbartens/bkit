# Brief: group 3 — Challenge round 1 findings

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
- Group 3: Challenge round 1 findings — this group
  - TASK 6: A consumer who lists the claude.ai connector `Linear` in the `.agents/context.md` `mcp-servers` block gets `mcp__claude_ai_Linear__*` pruned and re-added on every install and upgrade, so `bkit check` exits 1 with drift forever — open
  - TASK 7: A later retired-list entry on `permissions.deny` or `permissions.ask` silently deletes a person's own identical deny or ask rule on `bkit upgrade`, so agents run a command the project chose to block or confirm — open

## The work

<!-- bkit:task 6 start -->

- [ ] **TASK 6:** A consumer who lists the claude.ai connector `Linear` in the `.agents/context.md` `mcp-servers` block gets `mcp__claude_ai_Linear__*` pruned and re-added on every install and upgrade, so `bkit check` exits 1 with drift forever
      **Severity:** HIGH · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/install/write.ts:492` · **Round:** 1
  - **DONE WHEN:** a retired value that `resolveClaudeDerivedAllows(cwd)` (`.bkit/core/engine/install/cloud-env.ts:607-612`) derives for the checkout is neither pruned nor reported as retired, on both the install path (`runClaudeModule`) and the upgrade path (`runUpgrade` JSON branch, then `enrichClaudeSettingsAllows` at `upgrade.ts:1008-1014`). With `Linear` in `mcp-servers`, a real run followed by a dry run records no `.claude/settings.json` write and no `retired-settings-entry` advisory, and the grant stays in `permissions.allow`.
  - **TEST FIRST:**
    - `.bkit/core/engine/install/modules/claude.integration.test.ts` `keeps a retired value the mcp-servers block derives and records no drift on the next dry run` fails on the dry run recording an `update` for `.claude/settings.json` and pushing a `retired-settings-entry` advisory. Setup: `.agents/context.md` = `<!-- bkit:end -->` plus a `mcp-servers` block holding `Linear`; settings `allow: ["Bash(ls)"]`; one real `runClaudeModule(makeCtx())`, then `runClaudeModule(makeCtx({ dryRun: true }))`.

<!-- bkit:task 6 end -->

<!-- bkit:task 7 start -->

- [ ] **TASK 7:** A later retired-list entry on `permissions.deny` or `permissions.ask` silently deletes a person's own identical deny or ask rule on `bkit upgrade`, so agents run a command the project chose to block or confirm
      **Severity:** MEDIUM · **Class:** architectural · **Fixable:** false · **Location:** `.bkit/core/engine/install/write.ts:416` · **Round:** 1
  - **DONE WHEN:** The retired list is limited to `permissions.allow`. `pruneRetiredSettingsEntries` and `findRetiredSettingsEntries` throw an error naming the entry and its path when any list entry (shipped `RETIRED_SETTINGS_ENTRIES` or an injected list) names a path other than `permissions.allow`, and remove nothing for it. The refusal is loud at build and test time, never a silent skip at install time. How allow entries are retired does not change. Whether a release may ever take back a deny or ask rule stays an open owner question (issue #1006); this task does not answer it.
  - **TEST FIRST:**
    - `.bkit/core/engine/install/write.test.ts` `does not remove a deny rule named by an injected retired list` fails on `pruneRetiredSettingsEntries(".claude/settings.json", { permissions: { deny: ["Bash(rm -rf ~/*)", "Bash(mine)"] } }, [{ file: ".claude/settings.json", path: "permissions.deny", value: "Bash(rm -rf ~/*)" }])` returning `permissions.deny` without `"Bash(rm -rf ~/*)"` instead of throwing an error that names `permissions.deny` and `Bash(rm -rf ~/*)`

<!-- bkit:task 7 end -->

## Deviations

- The list holds only what bkit shipped; it names no app stack and no consumer.
- Two later issues will add their own entries to this list ("Shell guard: the hook code is the only source of the deny, ask and secret rules", https://github.com/cbartens/bkit/issues/1006, and "Git rules and the shell guard disagree: Codex, push, reset, stash", https://github.com/cbartens/bkit/issues/1019). Make adding an entry one line plus one `docs/migrations.md` row; build nothing else for them.
- Files you may change: `.bkit/core/engine/install/**`, `.bkit/core/engine/shared/settings.ts` and its tests, the one engine file where `bkit check` reports settings findings and its tests, `docs/migrations.md`, the doc lines that describe the settings merge or the upgrade output (`docs/*.md`, `.bkit/core/.bkit/*.md` sources only), the built `dist/`, and the rendered copies that `pnpm tsx .bkit/core/engine/cli.ts upgrade` rewrites.
- Files you must not change: everything under `.bkit/core/engine/commands/workflow/` and `.bkit/core/engine/ledgers/` (the build of issue 958 changes most of them), `.bkit/core/engine/commands/ci/ci.ts`, `.bkit/instructions.md`, every workflow and prompt file, `.husky/*`, `.bkit/templates/.husky/*`, `.github/workflows/*`, and the shipped settings templates themselves (this build retires nothing new). If the fix cannot be done without one of these, stop and message the orchestrator with what you found.
- Word counts: no change expected. `pnpm bkit:text:ceiling check` must still pass. Never `raise`.
- Before each test or gate run, wait until the first number of `sysctl -n vm.loadavg` is below 10. Never run `pnpm bkit:text:ceiling raise`.
