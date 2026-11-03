## #693 — Group the package.json bkit settings into named sections (closed)

## Why

The `bkit` block in `package.json` is a flat list of 20 keys. Related settings sit far apart: the tracker choice is `issueTracker`, but its boards are `github` / `linear` / `jira`. Some names don't say what they're for, like `depUpdater` and `shipGateRequiredLanes`. Grouping the keys by what they control makes the block readable and makes it obvious where a new setting belongs.

## New layout (this repo's values)

```json
"bkit": {
  "tracker": {
    "default": "github",
    "github": {
      "project": "https://github.com/users/cbartens/projects/1",
      "progress": "In progress",
      "review": "In review"
    },
    "linear": { "team": "", "project": "", "progress": "started", "review": "In Review" },
    "jira":   { "site": "", "project": "", "progress": "In Progress", "review": "In Review" }
  },
  "cloud": { "agent": "claude" },
  "providers": {
    "opencode": { "default": "openrouter", "installed": ["opencode-go", "openrouter"] }
  },
  "testing": {
    "minPushPaths": ["docs/**", ".bkit/*.jsonl", "CHANGELOG.md", "README.md"],
    "ciCapstone": "bkit-tests-check",
    "ciWorkflow": "bkit-ci.yml",
    "shipGate": []
  },
  "workflows": {
    "loopPause": true,
    "minFreeGb": 40,
    "worktree": { "copy": [".env", ".env.local"], "install": true },
    "tasks": { "maxPerGroup": 3, "maxTestsPerGroup": 15, "maxTestsPerTask": 10, "maxTestFilesPerTask": 3 }
  },
  "prompts": { "roadmapNext": 25 },
  "dependencies": { "updater": "" },
  "advisories": { "ignore": [] }
}
```

## Old key to new key

<!-- prettier-ignore -->
| Old | New |
| --- | --- |
| `issueTracker` | `tracker.default` |
| `github.*` | `tracker.github.*` |
| `linear.*` | `tracker.linear.*` |
| `jira.*` | `tracker.jira.*` |
| `cloudAgents` | `cloud.agent` |
| `opencodeProvider` | `providers.opencode.default` |
| `opencodeProviders` | `providers.opencode.installed` |
| `minPushPaths` | `testing.minPushPaths` |
| `capstoneJob` | `testing.ciCapstone` |
| `ciWorkflow` | `testing.ciWorkflow` |
| `shipGateRequiredLanes` | `testing.shipGate` (name under discussion) |
| `loopPause` | `workflows.loopPause` |
| `disk.minFreeGb` | `workflows.minFreeGb` |
| `worktree.copy` / `worktree.install` | `workflows.worktree.copy` / `workflows.worktree.install` |
| `tasks.*` | `workflows.tasks.*` |
| `roadmapNext` | `prompts.roadmapNext` |
| `depUpdater` | `dependencies.updater` |
| `ignoreAdvisories` | `advisories.ignore` |

## What the change involves

- **Parser.** Every setting is read in one place, `readBkitConfig` in `.bkit/core/engine/shared/settings.ts` (made the single reader in #602). The parser reads only the new layout. The `BkitConfig` fields the rest of the engine uses can keep their current names, so the parser change itself stays small.
- **Migration for existing repos.** bkit is public, so other repos have the old layout. On install/upgrade, rewrite each old key to its new place once and delete the old key. If the new key is already there, it wins. Keep the file's original indent. Follow the pattern of `migrateLinearTeamKey` / `migrateGithubProjectKey` in `.bkit/core/engine/install/modules/core.ts`. Register it in `docs/migrations.md` and cover it with a fixture in `core.integration.test.ts`.
- **Seeding.** Install writes every bkit setting (since 992747a69), so the seeder has to write the new layout.
- **Everything that names the keys.** About 100 files outside `docs/plans/**` mention the old key names: engine code and its tests, checks/tips advice text, agent and workflow prompts, the CI templates in `.github/workflows` and `.bkit/templates/.github/workflows`, `docs/*.md`, `README.md`, and the rebuilt `dist/`. Old names in archived plans and ledgers stay as they are.

## Ordering

Start this only after the large staged wave that is in the tree now (it adds the `tasks` block) has been committed. Both changes touch `settings.ts`, `settings.test.ts`, `install/modules/core.ts`, `docs/migrations.md` and `package.json`.

### Add the #671 per-point settings to the `workflows` section and replace `loopPause`

#671 — Decision Pause: headless runs go ahead on the recommendation — https://github.com/cbartens/bkit/issues/671 adds a setting to every point where a run can stop and ask you. The full design is in https://github.com/cbartens/bkit/issues/671#issuecomment-6392368785. Each point gets:

- `ask`: stop and ask, or carry on with the recommendation
- a hard limit: `maxAttempts`, or `maxTurns` for the grill

These replace `loopPause`. #671 writes them straight into this layout.

**`workflows` section, with the #671 keys added:**

```json
"workflows": {
  "minFreeGb": 40,
  "worktree": { "copy": [".env", ".env.local"], "install": true },
  "tasks": { "maxPerGroup": 3, "maxTestsPerGroup": 15, "maxTestsPerTask": 10, "maxTestFilesPerTask": 3 },
  "design": {
    "grill":     { "ask": true, "maxTurns": 6 }
  },
  "build": {
    "verify":    { "ask": true, "maxAttempts": 2 },
    "challenge": { "ask": true, "maxAttempts": 2 },
    "tests":     { "ask": true, "maxAttempts": 2 }
  },
  "debug": {
    "fix":       { "ask": true, "maxAttempts": 2 },
    "soak":      { "ask": true, "maxAttempts": 2 }
  },
  "ship": {
    "merge":     { "ask": true, "maxAttempts": 2 }
  }
}
```

**Changes to this issue:**

- **`workflows.loopPause` goes from the new layout.** In the old-key table, the `loopPause` row changes to:

<!-- prettier-ignore -->
| Old | New |
  | --- | --- |
  | `loopPause: true` | `ask: true` on every point under `workflows.design`, `.build`, `.debug` and `.ship` |
  | `loopPause: false` | `ask: false` on every point under those sections |

An `ask` value that's already set wins, the same as for every other key in this migration.

- **No migration for the new keys themselves.** They're new, and install already adds missing keys (`install/modules/core.ts:470-484`).
- **Release them together.** If #671 is released first, a repo with `loopPause: false` would start being asked again until this migration runs. Shipping both in one release avoids that gap.
- **About 100 files to touch.** Add the `loopPause` mentions #671 leaves behind to that list. #671 rewrites the ones in workflows, prompts and `.bkit/README.md`.

### Final layout

This comment replaces the layout and the old-key table in the issue description. It folds in the #671 per-point settings from the comment above, plus these decisions made since:

- **`tracker.name` becomes `tracker.default`.**
- **`cloud.agent` becomes `agents.cloud`**, and the `agents` section gains `autoCompact` (see the section on it below).
- **`testing` becomes `ci`.** Nothing left in that section is about running tests. All three keys describe the CI setup, and `/bkit-build`, `/bkit-debug`, `/bkit-ship`, `bkit setup`, `bkit check`, the pre-push hook and the shipped `bkit-ci.yml` template all read them. So they don't belong under any one workflow.
- **`shipGateRequiredLanes` is removed, not renamed.** It lists CI jobs that must not be skipped. The capstone job (`bkit-tests-check`) already turns red when a job that should have run was skipped. So the list only did something for a repo whose capstone doesn't check that job, and the fix for that is to add the job to the capstone (`bkit-ci.yml:967` already says so). The list was also applied unevenly. Only `/bkit-ship`'s check before merging used it. `/bkit-build` never runs that check, and `/bkit-debug` (`.bkit/core/workflows/bkit-debug.md:641`) and `/bkit-ship`'s check after merging both run it with `--capstone-only`, which skips the list. So a job on the list could be skipped and still pass `/bkit-debug`, then block `/bkit-ship`. Nobody sets it: it's empty in bkit, `app-gether-life` and `visitfrasercoast-com`, and `.bkit/core/engine/audits/repo/config-keys.test.ts:34` keeps it empty in bkit.
- **The task limits move to `workflows.plan.tasks`.** They limit how big a plan's tasks and groups may be; the engine calls them "the plan caps" (`.bkit/core/engine/commands/workflow/repo.ts:178`). `/bkit-build` reads them too, but only on tasks it writes into the plan. Its challenge step groups fix tasks by them (`challenge.ts:269`) and turns down a fix batch bigger than 4 × `maxPerGroup` (`challenge.ts:39`).

```json
"bkit": {
  "tracker": {
    "default": "github",
    "github": {
      "project": "https://github.com/users/cbartens/projects/1",
      "progress": "In progress",
      "review": "In review"
    },
    "linear": { "team": "", "project": "", "progress": "started", "review": "In Review" },
    "jira":   { "site": "", "project": "", "progress": "In Progress", "review": "In Review" }
  },
  "agents": {
    "cloud": "claude",
    "autoCompact": 300000
  },
  "providers": {
    "opencode": {
      "default": "openrouter",
      "installed": ["opencode-go", "openrouter"]
    }
  },
  "ci": {
    "capstone": "bkit-tests-check",
    "workflow": "bkit-ci.yml",
    "minPushPaths": ["docs/**", ".bkit/*.jsonl", "CHANGELOG.md", "README.md"]
  },
  "workflows": {
    "minFreeGb": 40,
    "worktree": { "copy": [".env", ".env.local"], "install": true },
    "design": {
      "grill":     { "ask": true, "maxTurns": 6 }
    },
    "plan": {
      "tasks": {
        "maxPerGroup": 3,
        "maxTestsPerGroup": 15,
        "maxTestsPerTask": 10,
        "maxTestFilesPerTask": 3
      }
    },
    "build": {
      "verify":    { "ask": true, "maxAttempts": 2 },
      "challenge": { "ask": true, "maxAttempts": 2 },
      "tests":     { "ask": true, "maxAttempts": 2 }
    },
    "debug": {
      "fix":       { "ask": true, "maxAttempts": 2 },
      "soak":      { "ask": true, "maxAttempts": 2 }
    },
    "ship": {
      "merge":     { "ask": true, "maxAttempts": 2 }
    }
  },
  "prompts": {
    "roadmapNext": 25
  },
  "dependencies": {
    "updater": ""
  },
  "advisories": {
    "ignore": []
  }
}
```

### Old key to new key

<!-- prettier-ignore -->
| Old | New |
| --- | --- |
| `issueTracker` | `tracker.default` |
| `github.*` / `linear.*` / `jira.*` | `tracker.github.*` / `tracker.linear.*` / `tracker.jira.*` |
| `cloudAgents` | `agents.cloud` |
| (new) | `agents.autoCompact`, default `300000`. No migration: install adds missing keys. |
| `opencodeProvider` | `providers.opencode.default` |
| `opencodeProviders` | `providers.opencode.installed` |
| `capstoneJob` | `ci.capstone` |
| `ciWorkflow` | `ci.workflow` |
| `minPushPaths` | `ci.minPushPaths` |
| `shipGateRequiredLanes` | Removed. An empty list is deleted. A non-empty list is deleted with a printed warning that names the jobs and says to add them to the capstone's `needs:` and assertion, so those skips don't silently stop being caught. |
| `loopPause` | Removed. `true` / `false` becomes `ask: true` / `ask: false` on every point under `workflows.design`, `.build`, `.debug` and `.ship`. An `ask` that's already set wins. |
| `disk.minFreeGb` | `workflows.minFreeGb` |
| `worktree.copy` / `worktree.install` | `workflows.worktree.copy` / `workflows.worktree.install` |
| `tasks.*` | `workflows.plan.tasks.*` |
| `roadmapNext` | `prompts.roadmapNext` |
| `depUpdater` | `dependencies.updater` |
| `ignoreAdvisories` | `advisories.ignore` |

As for every other key, a new key that's already set wins over the old one.

### `agents.autoCompact`

This is the token count at which an agent summarises its conversation so far, so it can keep going without running out of room. Today `300000` is written by hand in three places. This setting becomes the one place the number comes from:

- **Subagents, on hosts that have a per-agent setting.** Today every `bkit-*` agent carries `autoCompactWindow: 300000` in its source frontmatter, and `.bkit/core/engine/render/hosts.test.ts:897` checks for exactly that number. Instead, the render step writes `agents.autoCompact` into each Claude Code subagent's `autoCompactWindow`. Claude Code is the only host with a per-agent setting. Codex, opencode, Cursor and Antigravity have none, and their agents keep dropping the field (`.bkit/core/.bkit/providers.md:148`, `:421-423`). Change the test to check for the configured number.
- **The tip.** `.bkit/core/engine/checks/tips/catalogue.ts:283-290` tells you to add `"autoCompactWindow": 300000` to `.claude/settings.json` and `model_auto_compact_token_limit = 300000` to `.codex/config.toml`. Both get the configured number instead.
- **Docs.** `.bkit/core/.bkit/prompts.md:93` and `:135`, and `.bkit/core/.bkit/providers.md:416-421`, describe the number as fixed. Point them at the setting.

Rules:

- **Valid range: 100,000 to 1,000,000.** That's Claude Code's limit for the per-agent field (`providers.md:421`). A value outside it, or one that isn't a plain integer, falls back to the default. `300k` or `"300000"` doesn't count.
- **Don't set it too low.** `providers.md:427` warns that a window too close to the size of one big tool result makes Claude Code stop the agent (`Autocompact is thrashing`). The 100,000 lower limit is Claude Code's. bkit has no recorded floor of its own.
- **The tip also fires on a different number, not just a missing one.** Today it checks only that the setting exists (`claudeSettingsHas`, `codexTopLevelHas` in `.bkit/core/engine/checks/tips/detect.ts`). That's not enough: change `agents.autoCompact` and the subagents follow, but a session-wide `autoCompactWindow` you added earlier keeps the old number. So the tip fires when the Claude setting (`.claude/settings.json` or `.claude/settings.local.json`, the same files `claudeSettingsHas` reads today) or Codex's top-level `model_auto_compact_token_limit` is **missing or holds a different number** from `agents.autoCompact`. The tip text names the number it found and the number to change it to. That needs value-reading versions of both helpers, plus tests in `detect.test.ts` and `catalogue.test.ts` for the missing, equal and different cases.

### Extra work from removing `shipGateRequiredLanes`

- `.bkit/core/engine/commands/workflow/runs.ts`: remove refusal code 16, the `--required-lanes` flag and the `requiredLanes` reads (around `:659` and `:964`), plus their tests in `runs.test.ts`.
- `.bkit/core/engine/shared/settings.ts`: remove the `shipGateRequiredLanes` field and its parsing.
- Remove `.bkit/core/engine/audits/repo/config-keys.test.ts:34`, the test that keeps the list empty.
- Docs: rewrite the "Code 16 is opt-in" paragraph at `docs/deployments.md:287` and its copy in `.bkit/shared/docs/deployments.md:287`. Remove the code-16 row at `docs/observability.md:118`.

Implemented on `dev`. Not committed or pushed yet. Part of the work is staged, and the rest still needs restaging in another session.

**New `package.json` `bkit` layout**

- `tracker.{default,github,linear,jira}`
- `cloud.agent`
- `providers.opencode.{default,installed}`
- `testing.{ciWorkflow,ciCapstone,minPushPaths,shipGate}`
- `workflows.{minFreeGb,worktree,tasks}` and the #671 ask points
- `prompts.roadmapNext`
- `dependencies.updater`
- `advisories.ignore`

**Migration:** `migrateBkitLayout` runs on install and upgrade. It moves every old key to its new place. If a value already exists at the new place, it is kept, and blocks are merged. It also turns the old `loopPause` setting into `ask` on every ask point. It is safe to run more than once, it has a dry-run mode, and it has tests for the old layout. It is registered in `docs/migrations.md`.

**Unchanged on purpose:** the code-side config field names (`BkitConfig`, and install fields such as `issueTracker` / `opencodeProvider`). Only the keys stored in `package.json` moved.

**Also updated:**

- Every engine read and test fixture.
- The workflow and prompt files, docs and rules that name these keys.
- The shipped CI templates.
- bkit's own `package.json`, which `bkit upgrade` migrated.

## Follow-up: are the `package.json` `bkit` settings actually used? (2026-10-25)

After the regrouping, we checked every key under `bkit` in `package.json`. Two questions: does bkit read it, and does anything use a hard-coded copy of the default instead? The goal is that a user can edit any of these and every part of bkit honours the new value.

### What holds up

- The engine reads every key through `readBkitConfig` (`.bkit/core/engine/shared/settings.ts`). A missing or invalid value falls back to the built-in default.
- The workflows take their limits from the engine at run time. Plan caps are held at Step 1 from `bkit repo info`. Ask points and attempt limits come from `counters route` / `counters max --point=...`. No workflow hard-codes a limit.
- No key is unused. `prompts.roadmapNext` is read by the roadmap agent, and `advisories.ignore` by `checks/after/suppression.ts`.

### Fixed in the uncommitted #663 change set

Status: code and tests are written, and scoped test runs pass. The full suite, `bkit install` and `bkit check` have not run yet, and nothing is committed.

1. **Plan caps reach every agent that judges plan size.**
   - The shared plan rules (`plan-runbook-tasks`, `plan-test-first` in `.bkit/instructions.md`) now say "the plan caps your Context names", with no default numbers.
   - Every step that calls plan-generate, plan-update, the three plan reviewers, plan-convert, execute or verify now passes the four `bkit.workflows.tasks` values in its Context (`bkit-plan.md`, `bkit-build.md`).
   - A test in `.bkit/core/engine/commands/workflow/tests.test.ts` fails if a prompt goes back to a fixed number, or if a call to one of these agents leaves the caps out.
2. **The numbers in the issue form are tested.**
   - A test in the same file checks that each "(default N)" in the shipped `.github/ISSUE_TEMPLATE/bkit-change.yml`, `trackers.md` and `README.md` matches the engine default, and that bkit's own copy matches bkit's own `package.json`.
   - A new `bkit check` advisory, `bkit-tasks-form-stale` (`.bkit/core/engine/checks/before/repo.ts`), names the number to change when a consumer's form disagrees with their `package.json`.
3. **The tracker-update agent reads the right keys.**
   - `bkit-utility-update-tracker.md` read `bkit.<tracker>.progress` / `.review`, the path from before the regrouping, so it always fell back to the built-in state names.
   - `bkit repo info` now prints `trackerProgress` and `trackerReview`, worked out from `bkit.tracker.<tracker>.progress/review` with the defaults as fallback. The prompt takes the states from that output, and its hard-coded names are gone.
   - `lite.md` names the settings instead of the literal states.
4. **The CI checks honour `testing.ciWorkflow` and `testing.ciCapstone`.**
   - A new helper, `ciWorkflowPath()` in `settings.ts`, gives the path of the configured CI file.
   - The actionlint, run-injection, capstone-drift, run-levels, playwright-reporter and stub advisories now read the configured file and name it in their text (`checks/after/ci-yml.ts`, `checks/after/tools.ts`, `checks/before/files.ts`).
   - The capstone drift check matches the configured job name.
   - The manual branch-protection steps (`checks/after/index.ts`) and the `ci-workflow` tip name the configured values.
   - Each fix has a test with a custom file and job name that failed before the change.
5. **Catalogue:** the challenge note in `.bkit/core/.bkit/workflows.md` now refers to the last round `bkit.workflows.build.challenge.maxAttempts` allows, instead of "round 2".

### Left as is

- Template files that name the CI file, such as `.bkit/templates/.github/workflows/bkit-cloud.yml:39,349,354` and `resolve-push-base.mjs:36`, are files the consumer copies and owns, and they can't read `package.json`. `bkit-cloud.yml:240` does read the debug limits at run time.
- Job names from the template's own scaffold (`bkit-tests-scope`) in advisory text are not the capstone setting, so they stay.
- `TrackerTarget.linearTeam` (`.bkit/core/engine/shared/tracker.ts:170`) is filled but never read.
- `install/modules/cloud.ts:77` falls back to `"claude"` when install runs without `--auto=<variant>`.
- bkit's own `package.json` sets `testing.minPushPaths` to `docs/**`, against the warning at `settings.ts:159-160`.
- `docs/decisions.jsonl` key `489-templates-carry-no-bkit-blocks` still says the capstone drift check "keys on the `bkit-tests-check` job". It now keys on `bkit.testing.ciCapstone`, so that decision row needs correcting.

## #724 — Machine-wide test lock: one test run at a time across agents (open)

### Narrative

When several agents run test suites at the same time on one laptop, the machine grinds to a halt. One vitest run already sizes its worker pool to every core, and many bkit tests start their own `git`, `tsx` and `bkit` child processes. Measured on a 10-core MacBook (4 performance + 6 efficiency cores, 32 GB) during parallel agent runs: `uptime` load average 78.01 over 5 minutes, about eight runnable processes per core. The pain crosses repos: agents in bkit, app-gether-life and other consumer repos compete for the same CPU. `vitest.timeout-budget.ts` only stretches time limits so slow tests stop failing; runs still pile up.

This change adds a machine-wide **tests lock**: a full test gate takes it before it starts; a second gate waits its turn and says who it is waiting for (that waiting line is the "another agent is already running tests" warning). It ships to consumers as a script template, built by extending the existing stack lock, not by adding a second lock script.

Decisions already made:

1. **Fixed slots, not live load.** Default 1 heavy run per machine; `BKIT_TEST_SLOTS` overrides it. Each holder exports `BKIT_TEST_WORKERS` = cores / slots for its test runner. Live load average lags (two agents checking at once both see a quiet machine), so it never decides who runs.
2. **Agent tool timeouts.** `bkit tests run` waits for the lock up to `--lock-wait-s` (default 60, the same budget `bkit runs dispatch` polls with), then exits 81 naming the holder. 81 is the existing "hand the wait back to the agent's turn loop" code: the workflow ends its turn and re-runs the block. A raw `pnpm test` in bkit's repo just waits and prints the holder once a minute.
3. **Light runs skip the lock.** Single-file runs (`bkit tests red`, `bkit tests green`, `bkit:test:file`, a raw `vitest run` naming only existing test files) never wait. They use about one core; queuing an agent's write-test-then-fix loop behind a multi-minute gate costs more than the load.
4. **Rename the script** to `bkit-machine-lock.sh` and generalise it with named locks. The named-lock API comes from app-gether-life's adopted copy (`scripts/ci/local/local-stack-lock.sh`: `take_local_stack_lock "<who>" [name]`, `LOCAL_STACK_LOCK_OWNER_<name>`), which already runs a second named lock (`e2e-phones`) beside the stack lock. No migration: the script is copy-and-own, consumers keep their copies at paths and names of their own (app-gether-life's lives at `scripts/ci/local/local-stack-lock.sh`), and `syncTemplateCopies` already prunes the old name from `.bkit/templates/` and prints `removed:` on upgrade.
5. **Lock order.** A run that needs several locks takes the tests lock first, then any other named lock, then the unnamed stack lock. One fixed order means two runs can never each hold one lock and wait forever for the other.

### Success Criteria

- Two full test gates started at once on one machine (same repo, two worktrees, or two different repos) never run at the same time; the second waits and prints the first one's holder line.
- `bkit tests run` that cannot get the lock within `--lock-wait-s` exits 81 with the holder printed, never a hang past the agent's tool timeout.
- `bkit tests red` / `green`, `bkit:test:file` and the gate's own child processes never wait on the tests lock.
- `CI=true` / `CI=1`: no lock is taken anywhere.
- A consumer's existing copy of the stack lock and the new template still exclude each other on the unnamed stack lock (same lock file path, same function and env names).

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| Holder process killed mid-gate | Lock frees within a second (perl holder sees its parent change); the waiter starts |
| `BKIT_TEST_SLOTS=2`, three gates start | Two run, each with `BKIT_TEST_WORKERS` = cores / 2; the third waits naming both holders |
| `BKIT_TEST_SLOTS` not a whole number >= 1 | Falls back to 1 and says so once on stderr |
| Gate run inside `bkit tests run` reaches vitest's global setup | Sees `LOCAL_STACK_LOCK_OWNER_tests` alive, does not wait on its own parent |
| `vitest run integration.test` (a filter, not a file path) | Heavy run: takes the tests lock |
| `vitest run path/to/one.test.ts` (every filter is an existing file) | Light run: no lock |
| Run needs tests lock and the stack lock | Takes tests first, then stack; never the reverse |
| Consumer still on the old copy, bkit upgraded | Old copy keeps working; its unnamed stack lock and the new script's share one lock file |
| Lock dir `~/.cache/bkit/machine-lock/` not writable | Gate refuses with the path and the reason; exit 4 (could not run), not a test failure |

### Derived Test Matrix

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| a named lock is machine-wide: checkouts of two different repos wait on the same named lock | integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 1 |
| one process holds a named lock and the unnamed stack lock side by side | integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 1 |
| a runner started by a named-lock holder does not wait on that named lock | integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 1 |
| the unnamed stack lock keeps its lock file path, so an older copy and this one exclude each other | integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 1 |
| with N slots, N runs hold a named lock at once and run N+1 waits naming every holder | integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 1 |
| a slots value that is not a whole number >= 1 falls back to 1 and says so | integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 1 |
| the tests lock exports BKIT_TEST_WORKERS as cores divided by slots | integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 1 |
| `run --lock` holds the named lock for the command and passes its exit status on | integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 1 |
| `run` exits 75 when the wait gives up, distinct from the command's own failure | integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 1 |
| tests run waits for a held tests lock and runs the gate once the holder finishes | integration | `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` | 3 |
| tests run exits 81 naming the holder when the lock stays held past --lock-wait-s | integration | `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` | 3 |
| tests run holds the tests lock for the whole gate, so a second tests run waits | integration | `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` | 3 |
| tests red runs its test file without waiting for a held tests lock | integration | `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` | 3 |
| tests run under CI=true never waits on a held tests lock | integration | `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` | 3 |
| tests run with an unwritable lock dir exits 4 naming the path | integration | `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` | 3 |
| a run whose every filter is an existing test file is light and takes no lock | unit | `.bkit/core/engine/audits/repo/vitest-test-lock.test.ts` | 5 |
| a run with no filters, or a pattern filter, is heavy and takes the tests lock | unit | `.bkit/core/engine/audits/repo/vitest-test-lock.test.ts` | 5 |
| a run started under a live tests-lock owner takes no lock | unit | `.bkit/core/engine/audits/repo/vitest-test-lock.test.ts` | 5 |
| CI=true takes no lock | unit | `.bkit/core/engine/audits/repo/vitest-test-lock.test.ts` | 5 |
| BKIT_TEST_WORKERS sets maxWorkers when present | unit | `.bkit/core/engine/audits/repo/vitest-test-lock.test.ts` | 5 |

### Tasks

<!-- bkit:group 1 start -->

### TASK GROUP 1: Machine lock script

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** Generalise the stack lock into `bkit-machine-lock.sh` with named, machine-wide, slotted locks
  - **CREATE:** `.bkit/templates/scripts/ci/bkit-machine-lock.sh`: the current script plus an optional `[name]` argument on `take_local_stack_lock` / `try_local_stack_lock` / `release_local_stack_lock` / `local_stack_lock_holder` (API as in app-gether-life's `scripts/ci/local/local-stack-lock.sh`); a named lock lives at `${XDG_CACHE_HOME:-$HOME/.cache}/bkit/machine-lock/<name>.lock` with no repo prefix, so it is machine-wide; `LOCAL_STACK_LOCK_OWNER_<name>` lets children skip; `BKIT_TEST_SLOTS` gives the `tests` lock N slot files and the holder exports `BKIT_TEST_WORKERS`; `run "<who>" [--lock <name>] -- <cmd>`; `run` exits 75 when the wait gives up; header states the lock order (tests, then other named locks, then the stack)
  - **DELETE:** `.bkit/templates/scripts/ci/bkit-local-stack-lock.sh`: replaced by `bkit-machine-lock.sh`
  - **CREATE:** `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts`: every test from `local-stack-lock.integration.test.ts`, pointed at the new script, plus the new ones below
  - **DELETE:** `.bkit/core/engine/audits/templates/local-stack-lock.integration.test.ts`: its tests move to `machine-lock.integration.test.ts`
  - **DONE WHEN:** `pnpm vitest run .bkit/core/engine/audits/templates/machine-lock.integration.test.ts` passes, including every carried-over stack-lock test unchanged in intent
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `a named lock is machine-wide: checkouts of two different repos wait on the same named lock` fails on the second repo starting at once
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `one process holds a named lock and the unnamed stack lock side by side` fails on the second take refusing
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `a runner started by a named-lock holder does not wait on that named lock` fails on the child waiting on its parent
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `the unnamed stack lock keeps its lock file path, so an older copy and this one exclude each other` fails on both copies holding at once
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `with N slots, N runs hold a named lock at once and run N+1 waits naming every holder` fails on the second run waiting with two slots
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `a slots value that is not a whole number >= 1 falls back to 1 and says so` fails on two runs holding at once
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `the tests lock exports BKIT_TEST_WORKERS as cores divided by slots` fails on the variable being unset
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `run --lock holds the named lock for the command and passes its exit status on` fails on usage error for `--lock`
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `run exits 75 when the wait gives up, distinct from the command's own failure` fails on exit 1

<!-- bkit:task 1 end -->
<!-- bkit:task 2 start -->

- [ ] **TASK 2:** Adopt the script in bkit's repo and point every doc at it
  - **CREATE:** `scripts/ci/bkit-machine-lock.sh`: byte-identical dogfood copy of the template
  - **UPDATE:** `.bkit/core/engine/audits/repo/dogfood-templates.test.ts`: the `scripts/ci/bkit-local-stack-lock.sh` "not-adopted" entry becomes `scripts/ci/bkit-machine-lock.sh` identical (bkit now uses the tests lock)
  - **UPDATE:** `.bkit/core/.bkit/templates.md`: § Local stack lock becomes § Machine lock — the stack lock, named locks, the tests lock, slots, `BKIT_TEST_WORKERS`, lock order, light vs heavy runs; a consumer's adopted copy keeps working
  - **UPDATE:** `.bkit/core/.agents/rules.md`: § Shared local stack names `.bkit/templates.md` § Machine lock
  - **UPDATE:** `.bkit/core/prompts/bkit-build-plan-execute.md`: Shared local stack line names § Machine lock
  - **UPDATE:** `.bkit/core/prompts/bkit-build-plan-gaps-remediate.md`: Shared local stack line names § Machine lock
  - **UPDATE:** `docs/testing.md`: new section on the tests lock — what takes it, what skips it, `BKIT_TEST_SLOTS`, exit 81
  - **DEPENDS ON:** 1
  - **DONE WHEN:** `pnpm vitest run .bkit/core/engine/audits/repo/dogfood-templates.test.ts` passes; `grep -rn 'local-stack-lock\|Local stack lock' .bkit/core docs/testing.md` finds nothing; `bkit install` regenerates the mirrors (`.bkit/templates.md`, `.agents/rules.md`, `.bkit/instructions.md`, agent mirrors) with no drift in `bkit check`
  - **TEST FIRST:** n/a — docs and the dogfood registry; the existing dogfood-templates test covers the copy

<!-- bkit:task 2 end -->
<!-- bkit:group 1 end -->

<!-- bkit:group 2 start -->

### TASK GROUP 2: `bkit tests run` takes the tests lock

<!-- bkit:task 3 start -->

- [ ] **TASK 3:** Gate runs take the tests lock through the packaged script; single-file runs do not
  - **UPDATE:** `testsCommand` in `.bkit/core/engine/commands/workflow/tests.ts`: the `run` verb runs the gate under `bash <getTemplatesRoot()>/scripts/ci/bkit-machine-lock.sh run "<workflow> <fid> <step>" --lock tests -- <gate>` with `LOCAL_STACK_LOCK_WAIT_S` = `--lock-wait-s` (default 60); exit 75 from the lock → exit 81 printing `lockHolder`; lock dir error → exit 4; `--lock-wait-s` flag and exit 81 added to the verb's help and `exitCodes`; `red` / `green` unchanged (no lock)
  - **READ:** `getTemplatesRoot` in `.bkit/core/engine/shared/package-roots.ts`: where the packaged template lives in a consumer install
  - **READ:** `runsCommand` in `.bkit/core/engine/commands/workflow/runs.ts`: the `--budget-s` / exit 81 pattern to mirror
  - **CREATE:** `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts`: the tests below, against a real lock script and a stub gate
  - **DEPENDS ON:** 1
  - **DONE WHEN:** `pnpm vitest run .bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` passes; `bkit tests run --help` lists `--lock-wait-s` and exit 81
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` `tests run waits for a held tests lock and runs the gate once the holder finishes` fails on the gate starting while the lock is held
    - `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` `tests run exits 81 naming the holder when the lock stays held past --lock-wait-s` fails on unknown flag
    - `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` `tests run holds the tests lock for the whole gate, so a second tests run waits` fails on both gates running at once
    - `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` `tests red runs its test file without waiting for a held tests lock` fails if red is wired to the lock
    - `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` `tests run under CI=true never waits on a held tests lock` fails if the CI no-op is lost
    - `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` `tests run with an unwritable lock dir exits 4 naming the path` fails on exit 1 counted as a test failure

<!-- bkit:task 3 end -->
<!-- bkit:task 4 start -->

- [ ] **TASK 4:** Workflows route exit 81 from the test gates back to the turn loop
  - **UPDATE:** `.bkit/core/workflows/bkit-build.md`: Step 7 sub-step 8 (group gate) and the Run-Tests block Route gain **If** exit 81 → end turn, re-run the block, before **Else** → Failure Path
  - **UPDATE:** `.bkit/core/workflows/bkit-debug.md`: the `tests run` block in Context (local tests) gains the same exit 81 route
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: § Commands names `bkit tests run` among the blocks that exit 81 (tests lock held)
  - **DEPENDS ON:** 3
  - **DONE WHEN:** every `tests run` block in `.bkit/core/workflows/*.md` routes exit 81 to a re-run; `pnpm vitest run .bkit/core/engine/audits/workflows/workflow-shape.test.ts` passes; mirrors regenerated with no `bkit check` drift
  - **TEST FIRST:** n/a — workflow prose; shape covered by the existing workflow-shape test

<!-- bkit:task 4 end -->
<!-- bkit:group 2 end -->

<!-- bkit:group 3 start -->

### TASK GROUP 3: bkit's own raw vitest runs queue too

<!-- bkit:task 5 start -->

- [ ] **TASK 5:** Vitest global setup takes the tests lock for heavy raw runs in bkit's repo
  - **CREATE:** `vitest.test-lock.ts`: a pure `testLockDecision({ filters, env, exists })` (light when every filter is an existing file; skip under CI or a live `LOCAL_STACK_LOCK_OWNER_tests`) and a global setup that takes the `tests` lock through `scripts/ci/bkit-machine-lock.sh` for heavy runs and releases it on teardown
  - **UPDATE:** `vitest.config.ts`: register the global setup; `maxWorkers` from `BKIT_TEST_WORKERS` when set
  - **CREATE:** `.bkit/core/engine/audits/repo/vitest-test-lock.test.ts`: the tests below, beside `vitest-timeout-budget.test.ts`
  - **DEPENDS ON:** 1
  - **DONE WHEN:** `pnpm vitest run .bkit/core/engine/audits/repo/vitest-test-lock.test.ts` passes; with one `pnpm test` running, a second `pnpm test` in another worktree prints the waiting line, and `pnpm bkit:test:file <one file>` does not wait
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/repo/vitest-test-lock.test.ts` `a run whose every filter is an existing test file is light and takes no lock` fails on module not found
    - `.bkit/core/engine/audits/repo/vitest-test-lock.test.ts` `a run with no filters, or a pattern filter, is heavy and takes the tests lock` fails on module not found
    - `.bkit/core/engine/audits/repo/vitest-test-lock.test.ts` `a run started under a live tests-lock owner takes no lock` fails on module not found
    - `.bkit/core/engine/audits/repo/vitest-test-lock.test.ts` `CI=true takes no lock` fails on module not found
    - `.bkit/core/engine/audits/repo/vitest-test-lock.test.ts` `BKIT_TEST_WORKERS sets maxWorkers when present` fails on maxWorkers left at vitest's default

<!-- bkit:task 5 end -->
<!-- bkit:group 3 end -->

### Reuse Inventory

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| Machine-wide named locks with slots | `.bkit/templates/scripts/ci/bkit-machine-lock.sh` | `grep -rln 'local-stack-lock' .bkit scripts`; `grep -rln flock .bkit scripts`; app-gether-life `git grep local-stack-lock` | `.bkit/templates/scripts/ci/bkit-local-stack-lock.sh` — waits, names the holder, never stale, CI no-op; missing named / machine-wide / slotted locks. app-gether-life's copy adds named locks | NEW | Rename of the existing script, extended with app-gether-life's named-lock API; the old file is deleted (Supersession Inventory) |
| Lock script tests | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | `grep -rl 'bkit-local-stack-lock' .bkit/core/engine` | `.bkit/core/engine/audits/templates/local-stack-lock.integration.test.ts` | NEW | Its tests move here with the script rename, plus the named-lock tests |
| bkit's own copy of the lock | `scripts/ci/bkit-machine-lock.sh` | `ls scripts/ci`; `dogfood-templates.test.ts` entry | None — bkit does not adopt the stack lock today | NEW | bkit's repo now takes the tests lock from vitest's global setup |
| `bkit tests run` lock tests | `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` | `ls .bkit/core/engine/commands/workflow/tests*` | `.bkit/core/engine/commands/workflow/tests.test.ts` — unit tests, no real subprocess lock | NEW | Needs real lock processes; kept apart from the unit file |
| Heavy / light decision for raw vitest runs | `vitest.test-lock.ts` | `grep -n globalSetup vitest*.ts` | None — no global setup today; `vitest.timeout-budget.ts` is the sibling pattern | NEW | Root vitest helper beside `vitest.timeout-budget.ts` |
| Heavy / light decision tests | `.bkit/core/engine/audits/repo/vitest-test-lock.test.ts` | `grep -rl timeout-budget .bkit/core/engine` | `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` — sibling | NEW | Same place the sibling helper's tests live |

### Supersession Inventory

<!-- prettier-ignore -->
| Existing artifact | Replaced by | Decision | Justification |
| --- | --- | --- | --- |
| `.bkit/templates/scripts/ci/bkit-local-stack-lock.sh` | `.bkit/templates/scripts/ci/bkit-machine-lock.sh` | DELETE | Renamed and generalised; adopted consumer copies are theirs and keep working |
| `.bkit/core/engine/audits/templates/local-stack-lock.integration.test.ts` | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | DELETE | Tests move with the script |

### Open Questions & Assumptions

- **Assumption:** the engine may run the packaged template from `getTemplatesRoot()` (`.bkit/templates/` ships in the npm package, `package.json` `files`). That is a new pattern: no other engine verb executes a copy-and-own template. Planning confirms this, or moves an engine-owned copy under `.bkit/core/`.
- **Assumption:** vitest's global setup can read the run's CLI filters (vitest exposes `filters?: string[]` on its run APIs). Planning confirms the exact field available to a global setup; if none, the light-run rule falls back to `bkit:test:file` setting a skip variable.
- **Assumption:** `--lock-wait-s` default 60 matches `bkit runs dispatch`'s poll budget and stays well under the agent's 10-minute tool-timeout ceiling.

### Breaking Changes & Naming

- Template file renamed: `.bkit/templates/scripts/ci/bkit-local-stack-lock.sh` → `bkit-machine-lock.sh`. No migration: consumers' adopted copies are their own (any path, any name) and keep working; `syncTemplateCopies` prunes the old name from `.bkit/templates/` and the upgrade report prints `removed:`.
- Function names (`take_local_stack_lock` etc.), env names (`BKIT_LOCAL_STACK`, `LOCAL_STACK_LOCK_WAIT_S`, `LOCAL_STACK_LOCK_OWNER`) and the unnamed stack lock's file path are unchanged, so an adopted copy and the new script exclude each other.
- New: `BKIT_TEST_SLOTS`, `BKIT_TEST_WORKERS`, `LOCAL_STACK_LOCK_OWNER_<name>`, `bkit tests run --lock-wait-s`, `bkit tests run` exit 81.
- Doc section renamed: `.bkit/templates.md` § Local stack lock → § Machine lock.

### Out of Scope

- Catching raw `npx vitest` (or any runner) in consumer repos with a host-level hook on Claude / OpenCode / Codex / Cursor / Antigravity: separate follow-up.
- Upstreaming app-gether-life's `scripts/ci/local/load-gate.mjs` (one runner deciding whether to overlap its own jobs, by projected load and macOS memory pressure). Related, but it solves overlap inside one runner, not between agents.
- Changing `vitest.timeout-budget.ts`, or serializing anything on CI.

### References

- `.bkit/templates.md` § Local stack lock — one run at a time on a shared stack
- `.agents/rules.md` § Shared local stack
- `.bkit/workflows.md` § Commands (exit 81 turn-loop hand-back)
- `.bkit/templates/scripts/ci/bkit-local-stack-lock.sh`
- `.bkit/core/engine/audits/templates/local-stack-lock.integration.test.ts`
- `.bkit/core/engine/commands/workflow/tests.ts` (`runToLog`, `testsCommand`)
- `.bkit/core/engine/install/template-copies.ts` (`syncTemplateCopies` prunes removed templates)
- `vitest.timeout-budget.ts`
- app-gether-life `scripts/ci/local/local-stack-lock.sh` (named locks, lock order) and `scripts/ci/local/load-gate.mjs` (lag-aware overlap check)
- `docs/failures.jsonl` key `subprocess-integration-tests-time-out-at-5000ms-under-high-load`
- `docs/failures.jsonl` key `install-upgrade-integration-tests-flake-on-default-5s-timeout`
- `docs/knowledge.jsonl` key `local-pnpm-test-full-parallelism-integration-timeouts-flake`
- `docs/roadmap.md` item 10 — Fix the flake and timeout cluster

### Proposed answer to "one run at a time, or N slots?"

**Recommendation:** fixed slots worked out from the hardware, not decided from live CPU/RAM load. Plus a split between heavy and light runs, so a single-file test run never queues behind a full gate.

**Why not decide from live load**

- **It lags.** The load average is a smoothed ~1-minute figure. Two agents that check at the same moment both see a quiet machine and both start, which is the exact pile-up this issue is about. `vitest.timeout-budget.ts` already notes the reading "sees a quiet machine before that load has built up".
- **It counts everything.** Builds, Docker, the agents themselves and the browser all feed it. A threshold that works one day misfires the next, and "waited because load was 14" is hard to explain or debug.
- **RAM is platform-specific.** macOS memory pressure and Linux `/proc/meminfo` read differently, and a shipped template must work on both. RAM belongs in the slot calculation, not in a live check.

**Proposed shape**

1. **Fixed slots from hardware.** Work out how many heavy runs fit from the core count and RAM, with an env override. Every run gets the same answer, so behaviour is predictable. Note: Apple Silicon splits cores into fast and slow (the 10-core MacBook here is 4 performance + 6 efficiency, `sysctl hw.perflevel0.physicalcpu` / `hw.perflevel1.physicalcpu`), so real capacity is below the raw core count. That machine → 1 heavy slot.
2. **Each run gets its share.** With N slots, the lock script exports a worker count (e.g. `BKIT_TEST_WORKERS` = cores / N). Each consumer's gate script passes it to its own runner (`--maxWorkers` for vitest, the equivalent setting elsewhere), which keeps the shipped part independent of the stack.
3. **Heavy vs light runs.**
   - **Heavy:** full gates (`bkit tests run`) take a slot.
   - **Light:** single-file runs (`bkit tests red`, `bkit:test:file`) skip the heavy lock or use a small separate pool. They use about one core, and queuing an agent's write-test-then-fix loop behind a multi-minute gate costs more than the extra load.
4. **Live load as a guard only (optional).** Slot free but the machine already badly overloaded by something else → wait briefly and say why. Never the main rule.

**Mechanism:** N lock files, each held the way `.bkit/templates/scripts/ci/bkit-local-stack-lock.sh` holds its lock today (a perl process holds the `flock`, so a lock frees itself within a second of its holder dying). A run takes any free slot. When all are taken it waits and names every holder.

**To measure in design, not yet measured:** for CPU-bound work, two half-width runs finish in about the same total time as one full-width run after another. Two slots only win on idle gaps, such as a run's slow last few files and its startup. Time it: one full-width gate twice in a row, versus two half-width gates at once, on the same machine.

Body rewritten as a change issue (Narrative, Success Criteria, Derived Test Matrix, 5 tasks in 3 groups); `bkit tests plan-check` on the body: 0 problems, 0 existence findings. Label `next:design` → `next:plan`.

Where it differs from the slots comment above, the body wins:

- **Slots:** default 1 heavy run per machine plus a `BKIT_TEST_SLOTS` override. No hardware formula, no live-load guard, so no up-front 1-vs-2 timing is needed.
- **Rename without migration:** the script is copy-and-own. Consumers keep their copies at their own paths (app-gether-life: `scripts/ci/local/local-stack-lock.sh`), and `syncTemplateCopies` prunes the old name from `.bkit/templates/` on upgrade.
- **Named-lock API upstreamed:** comes from app-gether-life's adopted copy, which already holds a second named lock (`e2e-phones`) beside the stack lock.

## Owner answers to the plan's open questions

The owner has answered all 10 open questions in [724-machine-wide-test-plan.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202610/724-machine-wide-test-plan.md). Three answers differ from the plan's recommended option, so the plan has to be redone before it is built.

<!-- prettier-ignore -->
| # | Question | Answer |
| --- | --- | --- |
| 1 | Which copy of the lock script `bkit tests run` executes | **Changed: none of A/B/C.** The engine never runs the script. A consumer copies `bkit-machine-lock.sh` to `scripts/ci/`, customises it, and wraps their `bkit:gate:*` scripts in `package.json` (`bash scripts/ci/bkit-machine-lock.sh run --lock tests -- <gate>`), the same as every other template. bkit's own `package.json` does the same. `bkit tests run` only turns the script's exit 75 into exit 81. |
| 2 | `/usr/bin/perl` missing | A: refuse (`run` exits 73, `bkit tests run` exits 4) |
| 3 | Lock order enforced or documented | A: enforced |
| 4 | Worker count for raw `pnpm test` with slots > 1 | A: `maxWorkers` from `BKIT_TEST_WORKERS` only when present |
| 5 | Vitest watch mode | A: takes no lock |
| 6 | Pre-push hook and subagent prompts that run gates raw | **Changed: new option D.** No change to the hook or the prompts, because the wrapped gate scripts carry the lock. TASKS 7 and 8 drop out. A raw caller that gives up waiting sees exit 75 plus the holder line. |
| 7 | Long default wait when an agent with no terminal hits the lock | **Changed: A′.** The lock script itself waits 60 s instead of 3600 s when stdin is not a terminal and `LOCAL_STACK_LOCK_WAIT_S` is unset, then exits 75 naming the holder. This covers every repo that wires the script in, not only bkit's vitest setup. |
| 8 | Host sandbox can't write `~/.cache/bkit/` | A: refuse, naming the path and the host setting |
| 9 | Limit on retries after exit 81 | A: no limit |
| 10 | `BKIT_TEST_WORKERS` at 1 slot | A: floor(cores / slots) |

Recorded in `docs/decisions.jsonl`:

- `724-engine-runs-packaged-lock-template` (Q1)
- `724-lock-order-tests-named-stack-enforced` (Q3)
- `724-shipped-gate-calls-run-through-tests-run` (Q6)
- `724-lock-script-short-wait-without-tty` (Q7, new)

These are committed on `dev` (292cb9857, 90843c6ce, 1aca511ad, f83a0e77a) and not pushed yet.

**Next step:** re-run `/bkit-plan #724` so that the plan matches these answers.

## #328 — Dependency Dashboard (open)

This issue lists Renovate updates and detected dependencies. Read the [Dependency Dashboard](https://docs.renovatebot.com/key-concepts/dashboard/) docs to learn more.

## Abandoned Dependencies

The following dependencies have not received updates for an extended period and may be unmaintained.

> [!NOTE]
> Packages are marked as abandoned when they exceed the [`abandonmentThreshold`](https://docs.renovatebot.com/configuration-options/#abandonmentthreshold) since their last release. Unlike deprecated packages with official notices, abandonment is detected by release inactivity.

<details>
<summary>View abandoned dependencies (1)</summary>

<!-- prettier-ignore -->
| Datasource | Package | Last Updated |
| --- | --- | --- |
| npm | [husky](https://redirect.github.com/typicode/husky) | `2024-11-18` |

</details>

## Pending Approval

The following branches are pending approval. To create them, click on a checkbox below.

- [ ] <!-- approve-branch=renovate/node-26.x -->chore(deps): Update dependency @types/node to v26

## Awaiting Schedule

The following updates are awaiting their schedule. To get an update now, click on a checkbox below.

- [ ] <!-- unschedule-branch=renovate/pinned-tools -->chore(deps): Update dependency renovatebot/renovate to v44.176.3
- [ ] <!-- unschedule-branch=renovate/github-actions -->chore(deps): Update github-actions (`anthropics/claude-code-action`, `astral-sh/setup-uv`, `astral-sh/uv`)
- [ ] <!-- create-all-awaiting-schedule-prs -->🔐 **Create all awaiting schedule PRs at once** 🔐

## Pending Status Checks

The following updates await pending status checks. To force their creation now, click on a checkbox below.

- [ ] <!-- unpend-branch=renovate/docker-images -->chore(deps): Update ubuntu:26.04 Docker digest to 6a06111
- [ ] <!-- unpend-branch=renovate/non-major-dependencies -->chore(deps): Update non-major dependencies (`oxlint`, `oxlint-tsgolint`, `pnpm`)
- [ ] <!-- unpend-branch=renovate/major-pinned-tools -->chore(deps): Update Node.js to v26

## Open

The following updates have all been created. To force a retry/rebase of any, click on a checkbox below.

- [ ] <!-- rebase-branch=renovate/lock-file-maintenance -->[chore(deps): Lock file maintenance](../pull/735)

## Detected Dependencies

<details><summary>dockerfile (1)</summary>
<blockquote>

<details><summary>.cursor/Dockerfile (1)</summary>

- `ubuntu 26.04@sha256:2260313b31c8c011cd2eebe728008efac1b3982be73eb71348ea2648d2c0e09b` → [Updates: `26.04`]

</details>

</blockquote>
</details>

<details><summary>github-actions (5)</summary>
<blockquote>

<details><summary>.github/workflows/bkit-ci.yml (17)</summary>

- `actions/checkout v7.0.1@3d3c42e5aac5ba805825da76410c181273ba90b1`
- `actions/checkout v7.0.1@3d3c42e5aac5ba805825da76410c181273ba90b1`
- `actions/setup-node v7.1.0@949feb2413d6458794dcd2491c4babbbce0c15c1`
- `pnpm/action-setup v6.1.0@ea17c68df8912ef543352723c149a84f56e3d413`
- `astral-sh/setup-uv v10.3.1@18d369b23da25a81e9458561248e1aafff6a70fa` → [Updates: `v10.3.2`]
- `actions/checkout v7.0.1@3d3c42e5aac5ba805825da76410c181273ba90b1`
- `actions/setup-node v7.1.0@949feb2413d6458794dcd2491c4babbbce0c15c1`
- `pnpm/action-setup v6.1.0@ea17c68df8912ef543352723c149a84f56e3d413`
- `davelosert/vitest-coverage-report-action v2.13.1@8f86cfb56ed6d5613ea8cdc5259f207fbfd51ece`
- `actions/checkout v7.0.1@3d3c42e5aac5ba805825da76410c181273ba90b1`
- `actions/setup-node v7.1.0@949feb2413d6458794dcd2491c4babbbce0c15c1`
- `pnpm/action-setup v6.1.0@ea17c68df8912ef543352723c149a84f56e3d413`
- `davelosert/vitest-coverage-report-action v2.13.1@8f86cfb56ed6d5613ea8cdc5259f207fbfd51ece`
- `actions/checkout v7.0.1@3d3c42e5aac5ba805825da76410c181273ba90b1`
- `actions/setup-node v7.1.0@949feb2413d6458794dcd2491c4babbbce0c15c1`
- `pnpm/action-setup v6.1.0@ea17c68df8912ef543352723c149a84f56e3d413`
- `astral-sh/uv 0.13.4` → [Updates: `0.13.5`, `0.13.4`]

</details>

<details><summary>.github/workflows/bkit-cloud.yml (4)</summary>

- `actions/checkout v7.0.1@3d3c42e5aac5ba805825da76410c181273ba90b1`
- `actions/checkout v7.0.1@3d3c42e5aac5ba805825da76410c181273ba90b1`
- `anthropics/claude-code-action v1.0.257@aa8a7738e48bf30a40ee499ce818bef081c5ab5e` → [Updates: `v1.0.258`]
- `actions/checkout v7.0.1@3d3c42e5aac5ba805825da76410c181273ba90b1`

</details>

<details><summary>.github/workflows/bkit-renovate.yml (1)</summary>

- `renovatebot/github-action v46.3.9@a63d9a7bc606f7336fd20b47f2f32259a35e6213` → [Updates: `v46.3.10`]

</details>

<details><summary>.github/workflows/bkit-trivy.yml (2)</summary>

- `actions/checkout v7.0.1@3d3c42e5aac5ba805825da76410c181273ba90b1`
- `ghcr.io/aquasecurity/trivy 0.75.0@sha256:af6acf9a6b85dfe389a1941505c0ce9efef52a4719635e1a962f022a3d855daa` → [Updates: `0.76.1`]

</details>

<details><summary>.github/workflows/release.yml (4)</summary>

- `actions/checkout v7.0.1@3d3c42e5aac5ba805825da76410c181273ba90b1`
- `actions/setup-node v7.1.0@949feb2413d6458794dcd2491c4babbbce0c15c1`
- `pnpm/action-setup v6.1.0@ea17c68df8912ef543352723c149a84f56e3d413`
- `node 24`

</details>

</blockquote>
</details>

<details><summary>npm (2)</summary>
<blockquote>

<details><summary>package.json (17)</summary>

- `@types/node 24.19.2` → [Updates: `26.6.5`]
- `@vitest/coverage-v8 5.0.5`
- `bats 1.13.0`
- `husky 9.1.7`
- `lint-staged 17.6.0`
- `oxlint 1.89.0` → [Updates: `1.90.0`]
- `oxlint-tsgolint 7.0.2004` → [Updates: `7.0.2005`]
- `prettier 3.9.10`
- `slop-scan 0.3.0`
- `tsx 4.23.15`
- `typescript 7.0.2`
- `vite 6.4.5` → [Updates: `8.3.5`]
- `vitest 5.0.5`
- `yaml 2.9.1`
- `node >=24`
- `pnpm 10.34.7` → [Updates: `10.34.9`, `12.15.0`]
- `esbuild ^0.28.0`

</details>

<details><summary>pnpm-workspace.yaml</summary>

</details>

</blockquote>
</details>

<details><summary>nvm (1)</summary>
<blockquote>

<details><summary>.nvmrc (1)</summary>

- `node 24` → [Updates: `26`]

</details>

</blockquote>
</details>

<details><summary>regex (12)</summary>
<blockquote>

<details><summary>.bkit/shared/.claude/bkit-cloud.md (4)</summary>

- `node 24.22.1` → [Updates: `24.22.2`, `26.13.0`]
- `errata-ai/vale 3.24.0` → [Updates: `3.25.1`]
- `cli/cli 2.103.0` → [Updates: `2.103.3`]
- `jqlang/jq 1.8.2`

</details>

<details><summary>.bkit/shared/.claude/bkit-cloud.md (4)</summary>

- `node 24.22.1` → [Updates: `24.22.2`, `26.13.0`]
- `errata-ai/vale 3.24.0` → [Updates: `3.25.1`]
- `cli/cli 2.103.0` → [Updates: `2.103.3`]
- `jqlang/jq 1.8.2`

</details>

<details><summary>.cursor/Dockerfile (4)</summary>

- `node 24.22.1` → [Updates: `24.22.2`, `26.13.0`]
- `cli/cli 2.103.0` → [Updates: `2.103.3`]
- `errata-ai/vale 3.24.0` → [Updates: `3.25.1`]
- `pnpm 10.34.7` → [Updates: `10.34.9`, `12.15.0`]

</details>

<details><summary>.cursor/Dockerfile (4)</summary>

- `node 24.22.1` → [Updates: `24.22.2`, `26.13.0`]
- `cli/cli 2.103.0` → [Updates: `2.103.3`]
- `errata-ai/vale 3.24.0` → [Updates: `3.25.1`]
- `pnpm 10.34.7` → [Updates: `10.34.9`, `12.15.0`]

</details>

<details><summary>.github/workflows/bkit-ci.yml (2)</summary>

- `errata-ai/vale 3.24.0` → [Updates: `3.25.1`]
- `rhysd/actionlint 1.7.12`

</details>

<details><summary>.github/workflows/bkit-ci.yml (2)</summary>

- `errata-ai/vale 3.24.0` → [Updates: `3.25.1`]
- `rhysd/actionlint 1.7.12`

</details>

<details><summary>.github/workflows/bkit-cloud.yml (2)</summary>

- `errata-ai/vale 3.24.0` → [Updates: `3.25.1`]
- `@opencode/cli 2.1.2` → [Updates: `2.2.1`]

</details>

<details><summary>.github/workflows/bkit-cloud.yml (2)</summary>

- `errata-ai/vale 3.24.0` → [Updates: `3.25.1`]
- `@opencode/cli 2.1.2` → [Updates: `2.2.1`]

</details>

<details><summary>.github/workflows/bkit-renovate.yml (1)</summary>

- `renovatebot/renovate 44.176.2` → [Updates: `44.176.3`]

</details>

<details><summary>.github/workflows/bkit-renovate.yml (1)</summary>

- `renovatebot/renovate 44.176.2` → [Updates: `44.176.3`]

</details>

<details><summary>scripts/graphify/bkit-graphify.sh (1)</summary>

- `graphifyy 0.9.93` → [Updates: `0.9.97`]

</details>

<details><summary>scripts/graphify/bkit-graphify.sh (1)</summary>

- `graphifyy 0.9.93` → [Updates: `0.9.97`]

</details>

</blockquote>
</details>

## #408 — Publish @cbartens/bkit publicly on npmjs; no consumer auth (closed)

**DECIDED: publish the package publicly on npmjs.org, retiring GitHub Packages distribution.** Full investigation, options considered, and rationale below. Supersedes #409 (closed as duplicate).

## Problem

`@cbartens/bkit` is a **root devDependency** in consumer repos, so every remote build installs it — and because it lives on GitHub Packages (`npm.pkg.github.com`, which requires a token _even for public packages_), every build surface needs GH Packages read-auth for a package that build never uses. Nothing in either consumer app imports bkit; only local dev, CI (`pnpm bkit check`) and Renovate (lockfile regen) actually need it.

Consumer-reported symptom: remote builds on Vercel and EAS "always include bkit and hence need special auth etc but it's not needed there" — unnecessary, annoying overhead pushed onto consumers.

### Cost inventory (per consumer repo, today)

- `apps/web/vercel.json` → `installCommand: pnpm config set "//npm.pkg.github.com/:_authToken=$GH_BKIT_TOKEN_INSTALL" && pnpm install`, plus `GH_BKIT_TOKEN_INSTALL` in Vercel preview **and** production env
- `apps/mobile/scripts/eas-build-pre-install.sh` (~60 lines, mostly incident archaeology) + `pnpm_config_verify_deps_before_run: false` in all three `eas.json` profiles + `scripts/ci/assert-eas-pnpm-hook-env.mjs` guarding the env-var spelling — three EAS builds failed in `PRE_INSTALL_HOOK` getting there
- `pnpm config set` step in `.github/actions/setup`, plus the explanatory `env:` anchor in `ci.yml` that `detectCiYmlMissingTokenEnv` matches on
- `scripts/secrets/sync-expo.sh` + `EXPO_KEYS` allowlist entry to push the token to EAS
- `RENOVATE_HOST_RULES` + host-rules blocks in `renovate.json5` / `renovate-local.json5`
- Knowledge entries KN-CORE-2, KN-CORE-4, KN-CORE-7 are all downstream of this one distribution choice

On the bkit side: **333 lines across 21 shipped source files** plus **31 lines across 8 templates** reference the token or registry host, and seven detectors exist solely to police install auth — `detectShellToken`, `detectNpmrcAuth`, `detectNpmrcLegacyAuthToken`, `detectGhSecret`, `detectVercelEnv`, `detectVercelInstallCommandMissingAuth`, `detectCiYmlMissingTokenEnv`.

## Test evidence

Throwaway pnpm workspace fixture (root pkg + `apps/web` + `apps/mobile` + `tooling/agents` carrying the real `@cbartens/bkit@4.10.0` lockfile entry with its explicit `tarball:` URL), run against a **bogus** GH Packages token so any attempted fetch surfaces as a 401. pnpm **10.34.3** and **11.17.0**.

<!-- prettier-ignore -->
| Mechanism | Result |
| --- | --- |
| bkit in **root** devDeps + `pnpm install --frozen-lockfile --filter web...` | ❌ still resolved/fetched → 401. pnpm installs the workspace root's own deps regardless of filter |
| bkit in a **non-root** workspace pkg (`tooling/*`) + `--filter web...` | ✅ never fetched; root devDeps (turbo/tsc/prettier) **still installed**; pnpm 11's `✓ Lockfile passes supply-chain policies` passed with the bogus token |
| `pnpm_config_filter=mobile...` env var (same mechanism `eas.json` already uses for `pnpm_config_verify_deps_before_run`) | ❌ ignored → 401 on bkit |
| `filter=mobile...` as an `.npmrc` config key | ⚠️ honoured on pnpm 10.34.3, **ignored on pnpm 11.17.0** — dead end; both consumers are on pnpm 11 |
| `optionalDependencies` + `--no-optional` | ❌ rejected without testing: skips *all* optional deps including the platform binaries `sharp`/`rollup`/`lightningcss` need |
| `pnpm dlx @cbartens/bkit@4.10.0 --help` | ✅ works; reads the **project `.npmrc`** for `@cbartens:registry=`. In a directory without that mapping it falls back to npmjs.org and 404s |
| `pnpm bkit <subcommand>` through a `"bkit": "pnpm dlx …"` wrapper script | ✅ args forward correctly |
| `pinnedVersion` stamping with no manifest entry | ✅ unaffected — derives from bkit's **own** `package.json` (`PKG_PACKAGE_JSON`, `bkit-modules.ts:796`), never the consumer's devDep entry |
| Packed tarball (what a build downloads) | 238 files, **1.15 MB packed / 3.97 MB unpacked** |
| Public package on GH Packages needs no token? | ❌ [GitHub docs](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry): *"You need an access token to publish, install, and delete private, internal, and public packages."* |

## Options considered

### A. Move bkit to `tooling/*` + `--filter` in `vercel.json` — Vercel only

Works and is verified, but fixes one surface. EAS has no install-command override (install is the built-in `eas/install_node_modules` step), and neither non-CLI filter path reaches it, so mobile keeps the whole token apparatus. Also needs a root `"bkit": "tooling/bkit/node_modules/.bin/bkit"` wrapper, since bkit resolves the target repo from `process.cwd()`.

### B. Drop the manifest entry, run via `pnpm dlx @cbartens/bkit@<pinned>` — all surfaces, real costs

Clears Vercel, EAS _and_ Renovate lockfile regen, and lets the EAS hook + `verify_deps_before_run` + guard script all be deleted (bkit is the only lockfile entry with an explicit `tarball:` field, which is what pnpm's supply-chain verification tries to fetch). But: no lockfile integrity pin — run-time registry trust for a tool that writes to the repo and runs in CI; Renovate bumps need a regex custom manager _and still need the host rule for the datasource lookup_; per-invocation resolve latency (`dlxCacheMaxAge` default 1440 min); the pinned version moves out of `package.json` into script strings. Worst of all, it **adds** a mode to bkit rather than removing one — `bkit upgrade --to=<version>` / `--latest` bumps `@cbartens/bkit` via `pnpm add` and re-execs the new binary (`bkit-install.ts:1750-1823`), which has nothing to bump without a manifest entry.

### C. Publish publicly on npmjs — CHOSEN

## Decision and rationale

**Publish `@cbartens/bkit` publicly on npmjs.org; retire GitHub Packages distribution.**

1. **It removes the problem class rather than routing around it.** Every item in the cost inventory above deletes. No consumer needs a token on any surface — local, CI, Renovate, Vercel, EAS.
2. **On bkit's side it is a deletion, not a new mode.** The 333 + 31 lines and seven detectors go away. Options A and B both _add_ concepts (a `tooling/*` placement convention, or an `installMode` flag gating detectors plus a reworked upgrade path).
3. **Every good property is kept:** lockfile integrity pinning, Renovate-managed bumps, the atomic `bkit upgrade --to/--latest` self-bump, no dlx resolve latency.
4. **The EAS trap dies for free.** On npmjs, download URLs are derivable from name+version, so bkit stops being the lockfile's only entry with an explicit `tarball:` field — the root cause the `eas-build-pre-install.sh` header documents.
5. **Package visibility ≠ repo visibility.** The published tarball is already curated by `files` (238 files; `.bkit/.env`, `scripts`, `version`, `advisories.md`, `friction.jsonl`, `stats.jsonl`, `consumers.md` all excluded), so going public exposes precisely what every consumer already receives. Making the repo public as well is a separate switch — and doing so additionally unlocks `npm publish --provenance`.
6. **Residual build overhead is negligible and optional to remove.** 1.15 MB / 238 files with no auth. If zero-install in remote builds is ever wanted, option A can be layered on later as a pure speed choice.

Accepted trade-offs: no access control (anyone can install; some implied support expectation); an npm account + automation token becomes release infrastructure; unscoped `bkit` on npmjs is **taken** (HTTP 200) so the package stays scoped as `@cbartens/bkit` (free on npmjs — HTTP 404).

## Implementation outline

### bkit repo

1. `package.json` — `publishConfig` → npmjs (`access: "public"`); drop "distributed via GitHub Packages npm registry" from `description`.
2. Release flow — `utility-new-release` + the Release workflow publish with an npm automation token instead of the GH Packages path; add `--provenance` only if/when the repo goes public.
3. Delete the install-auth machinery: the seven detectors above, their advisory copy (`bkit-postinstall.ts:2057-2095`), the Renovate read-auth guidance (`bkit-modules.ts:2953`, `:3131`, `:3165`), the `@cbartens:registry` line in the shipped `.npmrc` template, the `pnpm config set` step in the shipped CI template, and the host-rules anchors in the `renovate.json5` / `renovate-local.json5` templates. Drop `GH_BKIT_TOKEN_INSTALL` from `.bkit/.env.example`. **Keep `GH_BKIT_TOKEN`** — different token, powers the MCP tracker surface.
4. Add a one-time migration to `bkit install` / `bkit upgrade`: strip the now-pointless `@cbartens:registry` mapping from the consumer `.npmrc`, and warn on any residual `//npm.pkg.github.com/:_authToken=` line.
5. Docs — `setup.md`, `deployments.md` (§ Renovate read-auth, § Consumer CI auth), `security.md`, `architecture.md`, `technology.md`. KN-CORE-2 / -4 / -7 stay as incident history with a note that the distribution change retired them.

### Consumer repos (both)

- `.npmrc` → delete the scope mapping (keep `strict-peer-dependencies` / `auto-install-peers`)
- `apps/web/vercel.json` → drop the `installCommand` prefix; delete `GH_BKIT_TOKEN_INSTALL` from Vercel preview + production env
- EAS → delete `eas-build-pre-install.sh` + the `eas-build-pre-install` script entry + all three `pnpm_config_verify_deps_before_run` env blocks + `assert-eas-pnpm-hook-env.mjs` and its test wiring; drop the token from `EXPO_KEYS` / `sync-expo.sh`
- CI → drop the `pnpm config set` step from `.github/actions/setup` and the `ci.yml` token `env:` anchor
- Renovate → drop `RENOVATE_HOST_RULES` and the host-rules blocks; keep the bkit-specific `packageRule` for the upgrade flow
- Re-resolve `pnpm-lock.yaml` so bkit's entry loses its `tarball:` field
- Optional local cleanup: `pnpm config delete "//npm.pkg.github.com/:_authToken"`

### Sequencing

Publish the current version to npmjs first and keep GH Packages publishing in parallel; migrate one consumer, verify a real Vercel preview + EAS build with no token present, then the second; only then delete bkit's auth machinery and deprecate the GH Packages package with a pointer to npmjs.

## Open questions

- Is the `cbartens` npm username/scope actually available? Unverified — npm blocks unauthenticated user lookups (401 on `/-/user/org.couchdb.user:cbartens`).
- Repo visibility: public (unlocks `--provenance`) or private-with-public-package?
- Republish version history on npmjs, or start at the current version?

## Status

Investigation and decision only — no changes made to bkit or to either consumer repo.

Option 3 (drop the manifest entry, run via `pnpm dlx`) is broken out into #409 with its verified mechanics and full pros/cons — it's the preferred direction, since it's the only shape that also clears EAS. This issue stays as the investigation record for the filtering options.

## Licence follow-ups moved here from #506 (now closed)

bkit is now licensed under PolyForm Noncommercial 1.0.0 or PolyForm Small Business 1.0.0, landed in 75f67ed6. Commercial licences are requested at bkit@bartens.biz. Two things are needed before the public launch, or at the latest before the first commercial licence is sold:

- [ ] **Contributor agreement (CLA).** Add a `CONTRIBUTING.md` with a CLA, or at least a note that outside pull requests need one. Without a CLA, a contributor keeps ownership of their part, and we can't sell a commercial licence that covers it. This has to exist before the first outside pull request is merged.
- [ ] **Legal review.** An Australian lawyer reviews the commercial licence terms before any are sold. The PolyForm texts themselves are standard and don't need review.

---

_Generated by [Claude Code](https://claude.ai/code)_

## Implementation plan (written by hand, 2026-10-11)

Written in place of a bkit Plan run, at Christian's request. It folds in everything learned since the issue was opened, including drift and today's confirmations.

**Progress (last updated 2026-10-11):**

- `CONTRIBUTING.md` with the CLA — committed in `367354f0`.
- `BKIT_NPM_TOKEN` section added to `.bkit/.env.example` (committed in `367354f0`) and to the source `.bkit/shared/.bkit/.env.example` (working tree, not yet committed).
- Local `.bkit/.env` holds the token. The GitHub repo secret is not set yet — `gh secret list` shows no `BKIT_NPM_TOKEN`.

### Confirmed since the investigation

- **npm account works.** `@cbartens` is usable from https://www.npmjs.com/settings/cbartens/ — the first open question is closed. The package stays scoped: `@cbartens/bkit` (unscoped `bkit` is taken).
- **Publish token exists.** Stored as `BKIT_NPM_TOKEN`: locally in `.bkit/.env` (gitignored, loaded by direnv) and as the GitHub Actions repository secret of the same name (`gh secret set BKIT_NPM_TOKEN`). Use a granular token with read+write on packages — npm restricts tokens that bypass 2FA from Jan 2027.
- **#507 landed**, so every `.bkit/src/...` path in the issue body is now `.bkit/core/engine/...`, and #506's release hold is clear.
- **Token names changed after this issue was written:** `GH_BKIT_TOKEN_INSTALL` → `BKIT_GH_TOKEN_INSTALL`; `GH_BKIT_TOKEN` → `BKIT_GH_TOKEN`. Tasks below use the current names.

### Decisions still open

1. **Repo visibility.** Private today. Public unlocks `npm publish --provenance`. Recommendation: publish without provenance now, flip the repo public at launch, add `--provenance` then.
2. **Version history on npmjs.** Recommendation: start at the next released 4.x version. Nobody needs older versions from npmjs, and GitHub Packages keeps serving them meanwhile.

### Current state (verified in the repo, 2026-10-11)

- `package.json:5` description still says "distributed via GitHub Packages"; `publishConfig` (`package.json:29-32`) is `npm.pkg.github.com` + `restricted`.
- `.github/workflows/release.yml:32,60-63` still publishes to GitHub Packages with `GITHUB_TOKEN`.
- Every install-auth detector still exists: `detectShellToken`, `detectNpmrcAuth`, `detectNpmrcAuthTokenLine`, `detectGhSecret`, `detectVercelEnv`, `detectVercelInstallCommandMissingAuth`, `detectCiYmlMissingTokenEnv`.
- The `pnpm config set` auth step still ships in the CI template, this repo's `bkit-ci.yml`, the `.cursor/environment.json` template, and the cloud bootstrap script.
- `@cbartens/bkit` returns 404 on registry.npmjs.org.
- Both consumers still carry the `.npmrc` mapping and the full apparatus.
- Minor stale doc: `docs/deployments.md:447` still names the old detector `detectNpmrcLegacyAuthToken` (now `detectNpmrcAuthTokenLine`).

### Phase A — publish to npmjs, keep GitHub Packages in parallel

- [ ] `package.json`: `publishConfig` → `{"registry": "https://registry.npmjs.org/", "access": "public"}`; drop the GitHub Packages phrase from `description`.
- [ ] `.github/workflows/release.yml`: `registry-url` → `https://registry.npmjs.org`; publish step uses `NODE_AUTH_TOKEN: ${{ secrets.BKIT_NPM_TOKEN }}`; keep the test gates and the sliding `v{N}` tag. Add `--provenance` later, gated on repo visibility.
- [x] `BKIT_NPM_TOKEN` section added to `.bkit/.env.example` (committed in `367354f0`) and to the source `.bkit/shared/.bkit/.env.example` (working tree, not yet committed). Keep `BKIT_GH_TOKEN_INSTALL` until Phase C.
- [ ] Create the repo secret: `gh secret set BKIT_NPM_TOKEN`.
- [ ] Tag and publish the current version.
- [ ] Verify: `npm view @cbartens/bkit`; then from a clean directory with no `.npmrc` and no tokens: `pnpm add @cbartens/bkit` and `pnpm dlx @cbartens/bkit --help`. Existing consumers still resolve from GitHub Packages.

### Phase B — migrate consumers, one then the other

Apply to `app-gether-life` first, then `visitfrasercoast-com`:

- [ ] `.npmrc`: delete `@cbartens:registry=...` and its comment block.
- [ ] `apps/web/vercel.json`: drop the `pnpm config set ... &&` prefix; delete `GH_BKIT_TOKEN_INSTALL` from Vercel preview + production env.
- [ ] EAS: delete `apps/mobile/scripts/eas-build-pre-install.sh` + its script entry + all three `pnpm_config_verify_deps_before_run` blocks + `scripts/ci/assert-eas-pnpm-hook-env.mjs` and its test wiring; drop the token from `EXPO_KEYS` / `sync-expo.sh`.
- [ ] CI: drop the `pnpm config set` step and the `ci.yml` token `env:` anchor.
- [ ] Renovate: drop `RENOVATE_HOST_RULES` and the host-rules blocks; keep the bkit-specific `packageRule`.
- [ ] Re-resolve `pnpm-lock.yaml` so the bkit entry loses its `tarball:` field.
- [ ] Verify with the token removed from every surface: a real Vercel preview, a real EAS build, and a fresh local install.

### Phase C — delete bkit's install-auth machinery

- [ ] Delete the seven detectors and their advisory copy; the `pnpm config set` step in the shipped CI template, this repo's `bkit-ci.yml`, `.cursor/environment.json` (template + this repo) and `bkit-cloud-bootstrap.sh`; the Renovate hostRules anchors (template + this repo); the Vercel/EAS/CI auth advisories; and `BKIT_GH_TOKEN_INSTALL` from `.bkit/shared/.bkit/.env.example`. **Keep `BKIT_GH_TOKEN`** (MCP + Renovate platform auth).
- [ ] One-time migration in `bkit install` / `bkit upgrade`: strip the `@cbartens:registry` mapping from the consumer `.npmrc`; warn on any leftover `//npm.pkg.github.com/:_authToken=` line.
- [ ] Docs: `docs/setup.md`, `docs/deployments.md` (incl. line 447's stale detector name), `docs/security.md`, `docs/architecture.md`, `docs/technology.md`, `.bkit/install.md`, `.bkit/README.md`, root `README.md` install lines. Reword KN-CORE-2 / KN-CORE-4 / KN-CORE-7 as retired by the distribution change.
- [ ] Tests: delete or rewrite the detector suites; add migration tests.

### Phase D — retire GitHub Packages

- [ ] Deprecate the `npm.pkg.github.com` package with a pointer to npmjs.
- [ ] Optional local cleanup: `pnpm config delete "//npm.pkg.github.com/:_authToken"`.

### Phase E — licence follow-ups (moved here from #506)

- [x] `CONTRIBUTING.md` with a short CLA — committed in `367354f0`.
- [ ] Australian lawyer reviews the commercial licence terms before the first commercial licence is sold.

### Verification

- Phase A: clean-directory install from npmjs; release workflow green end to end.
- Phase B: token removed everywhere, and Vercel + EAS builds green; lockfile has no `tarball:` entry.
- Phase C: `bkit check` clean on both consumers after the migration; `pnpm test` green.

---

_Written by Claude Code_

For gether / fraser

That output is the exact symptom I flagged: that consumer is still resolving @cbartens/bkit from GitHub Packages.
The other agent verified dist-tags {"latest":"5.0.0"} against npm.pkg.github.com — so bkit upgrade --latest did what it should: it asked the registry that consumer resolves to for the latest, got 5.0.0, and correctly no-op'd. It never saw 5.0.1. Nothing is broken in bkit; the consumer just hasn't been cut over.
Its two other calls were right: don't npm i in a pnpm workspace, and don't use a bare pnpm add (it desyncs managed files).
Fix — order matters
The @cbartens:registry mapping must go first, or --latest keeps resolving 5.0.0 forever.
In that consumer repo:

1. Kill the scope mapping
   grep -n "npm.pkg.github.com" .npmrc # drop the @cbartens:registry= line (+ its comment)

# or delete .npmrc entirely if that line is all it holds

2. Drop the retired install-auth leftovers (that's the BKIT_GH_TOKEN_INSTALL in the advisory table)

- repo secret BKIT_GH_TOKEN_INSTALL → delete
- CI step pnpm config set //npm.pkg.github.com/:_authToken=… → delete
- Vercel env / Renovate hostRules install token → delete
- local: pnpm config delete //npm.pkg.github.com/:_authToken
- .bkit/.env / .envrc: remove the BKIT_GH_TOKEN_INSTALL= line

3. Bump through the supported path (now resolves npmjs)
   pnpm bkit upgrade --latest # or --to=5.0.1
   That atomically bumps the dep, rewrites the lockfile off the GH Packages URL, re-renders managed files, and re-pins .bkit/version.
4. Verify
   node -p "require('@cbartens/bkit/package.json').version" # → 5.0.1
   grep -c npm.pkg.github.com pnpm-lock.yaml # → 0
   pnpm bkit check # → exit 0, 0 blockers
   After step 3 the install-token advisories disappear on their own — 5.0.1 removed those detector rows — so the leftover secret is just dead cleanup. BKIT_GH_TOKEN stays (MCP + Renovate platform auth).
   The other agent's "remaining human actions" shrink too: the Cursor/Claude dashboards should carry only BKIT_GH_TOKEN, not any install token.
   If you point me at that repo's local path (or name it), I'll run 1–4 and verify the lockfile and version myself.

## #602 — Route package.json reads through readBkitConfig and one version reader (closed)

From the October 2026 duplication audit (#473), findings `duplication-6`, `duplication-7`, `duplication-8` (all MEDIUM). Report: `docs/audits/202610/duplication.md`, audited at `5f5a097c`.

## The problem

Three shared helpers exist for reading `package.json` and JSON files, and a lot of code reads them by hand instead. All copies give the same answers today. They are grouped into one issue because they touch the same files: the sites in the first two are a subset of the third.

### 1. The `bkit` key in a consumer's `package.json` (`duplication-6`)

`readBkitConfig` (`.bkit/core/engine/shared/settings.ts:46`) is used in 12 places. 13 other places read the key by hand.

Six of the 13 read fields `readBkitConfig` already returns:

- `issueTracker` at `checks/before/index.ts:78-89`, an exact copy of `checks/after/github.ts:75-86`
- `issueTracker` at `commands/install/install.ts:300-315` and `commands/install/upgrade.ts:689-698`
- `githubProject` at `checks/after/github.ts:159`, `:287-297`

Seven read fields `readBkitConfig` doesn't return yet:

- `opencodeProvider(s)`: `install.ts:165`, `:206`, `install/modules/opencode.ts:175-185`
- `cloudAgents`: `github.ts:329`
- the dependency-updater opt-out: `checks/after/tools.ts:380`
- "was this field explicitly set" checks: `github.ts:141`, `:343`. Three of these are exact copies (`github.ts:141-147`, `tools.ts:380-386`, `github.ts:343-349`).

### 2. The installing bkit version (`duplication-7`)

There is no shared reader for this; 8 places read it themselves:

- `install/placeholders.ts:25`
- `checks/after/managed.ts:31`
- `install/modules/core.ts:308`, `:496`
- `commands/install/install.ts:94`, `:563`
- `checks/before/index.ts:115`
- `commands/install/upgrade.ts:1005`

They disagree when the file is garbled: 6 fall back to `"0.0.0"`, while `core.ts:496` and `upgrade.ts:1005` throw.

Their comments say they are copies of each other, but point at the wrong files (`placeholders.ts:22-23`, `managed.ts:28-29`). The stated reason for copying (avoiding an import loop) no longer applies:

- `readPackageJson` (`shared/package-json.ts:16`) and `getPkgRoot` (`shared/package-roots.ts`) don't import anything that would loop.
- `checks/before/version.ts:31` already uses `readPackageJson`.

### 3. Parsing JSON that might be broken (`duplication-8`)

`parseJson` (`.bkit/core/engine/shared/json.ts:9`) is used in 23 places. 48 other places across 22 files wrap `JSON.parse` in their own `try`; for example `checks/after/github.ts` has 8 and `commands/install/install.ts` has 7.

13 unwrapped `JSON.parse` calls are deliberately left alone, and `commands/install/uninstall.ts:719` must keep failing loudly (comment at `:714-715`).

## What to change

- `BkitConfig` gains `opencodeProvider(s)`, `cloudAgents`, the dependency-updater opt-out, and a way to see which fields were explicitly set. The 13 sites switch to `readBkitConfig`.
- One `readInstallingVersion()` in `shared/`, built on `readPackageJson(getPkgRoot())`. The 8 sites switch to it.
- Decide once whether a garbled file throws or gives `"0.0.0"`.
- The 48 wrapped parses switch to `parseJson` / `readPackageJson`.
- Check in the ast-grep rule the audit used (R1) as a guard, skipping `shared/json.ts`.

## Done when

- [ ] No hand-written read of the `bkit` key outside `readBkitConfig`.
- [ ] One installing-version reader, with one documented behaviour for a garbled file.
- [ ] The R1 rule finds no `JSON.parse` inside a `try` outside `shared/json.ts`, and runs in the gate.
- [ ] Full suite green.

**Size:** L (about 30 files). **Next step:** `/bkit-plan` (the approach is settled; needs splitting into tasks).

Parent: #473

## Done: all three parts

**Part 1, `acd41949`: every read of the `bkit` key in `package.json` goes through `readBkitConfig`.**

- `BkitConfig` now also carries:
  - `opencodeProvider` and `opencodeProviders`
  - `cloudAgents`
  - the dependency-updater opt-out
  - whether the tracker and the cloud variant were set on purpose
- The 13 hand-written reads call `readBkitConfig`.

**Part 2, `9bbf0596`: one reader for the version of the bkit doing the install.**

- `readInstallingVersion` in `shared/package-json.ts` is used at all eight places.
- It stops with an error naming the file if bkit's own `package.json` is missing, isn't a JSON object, or has no version. Before this, six of the copies quietly carried on as `0.0.0`.
- `upgrade` reads the version before it writes anything.
- The reasoning is recorded in `docs/decisions.jsonl` as `602-installing-version-reader-throws-on-damaged-package`.

**Part 3, `059a61b3`: a failed JSON parse is caught in one place, `shared/json.ts`.**

- The 29 remaining places that wrapped `JSON.parse` in their own `try` now call `parseJson` or the new `readJsonFile`. `readJsonFile` treats a missing or unreadable file the same as broken JSON.
- On bad input, each place does exactly what it did before: same default, same log line, and the same hard stop where install refuses to merge a broken `.claude/settings.json` or `.opencode/opencode.json`.
- The one difference you can see: uninstall's log says "`<file>` is not valid JSON" instead of the raw parser error.
- Left alone on purpose:
  - the uninstall check that must keep failing loudly (`commands/install/uninstall.ts` ~716)
  - plain `JSON.parse` calls with no `try` around them (copying objects, reading bkit's own templates)

**The guard:** `audits/repo/json-parse-owner.test.ts` fails, naming `file:line`, if a `JSON.parse` shows up inside a `try` anywhere in the engine except `shared/json.ts`.

- It runs with the normal test suite.
- It reads the code with prettier's TypeScript parser (prettier is already a dev dependency). TypeScript 7 no longer offers a JavaScript API for reading code, and this way nothing new had to be installed.
- I checked that it catches the problem: I planted a wrapped `JSON.parse`, the test failed and named the line, then I removed it.

**How it was checked:**

- **Full suite** on the exact committed files: 174 files, 5857 tests. The only failure was a `bkit check` child process that ran out of time while the machine was busy. That file passed both times I re-ran it on its own.
- **Install, check, upgrade and uninstall** in a fresh project, using the build with this change and the build without it. Exit codes and log lines matched apart from another agent's new `pipeline.md` file. Planting a broken `.claude/settings.json` and `.opencode/opencode.json` gave the same result on both builds.

The audit rows `audit-duplication-bkit-config-reads-bypass-read-bkit-config`, `-installing-version-reader-eight-copies` and `-inline-fail-open-json-parse` are closed in `docs/failures.jsonl` (`1f79f226`).

## #737 — Fail CI when a pinned tool's version and sha256 disagree (closed)

From the 2026-10-29 dependency audit (#482 — Dependency Triage): finding `deps-2`, MEDIUM. Audited at `5bb26e7c`.

**Audit reports:** docs/audits/202610/dependencies-20261029T013827Z.md (findings deps-2)

### Narrative

Several tools are installed with a version pin plus a sha256 checksum (the fingerprint the install checks the download against): Node, gh, Vale and jq in `.bkit/shared/.claude/bkit-cloud.md` (the cloud setup script), and Node, gh and Vale in the Cursor Dockerfile (`.cursor/Dockerfile` and `.bkit/templates/.cursor/Dockerfile`).

Renovate bumps the version but leaves the checksum alone. Nothing fails when the two stop matching:

- Renovate PR #732 sets `JQ_VERSION="1.8.2"` (`bkit-cloud.md:82`) but keeps the 1.7.1 hash `JQ_SHA256="5942c9b0…"` (`:83`). The audit downloaded the jq-1.8.2 `jq-linux-amd64` asset and checked it: `jq-linux-amd64: FAILED` (actual hash `b1c22172…`, the same digest `gh release view jq-1.8.2 -R jqlang/jq --json assets` reports).
- #732 is still green. `cloud-env.test.ts:301` only compares pins that the Dockerfile also has (`NODE`, `GH`, `VALE`), and jq isn't in the Dockerfile.
- Merging #732 as it stands would make cloud setup refuse to install jq wherever it is missing.

### Success Criteria

- Every `*_VERSION` / `*_SHA256` pair in `bkit-cloud.md` and both Dockerfile copies is checked against the checksum the tool's release publishes, and a version-only bump turns CI red.
- Every `*_VERSION` that installs a download has a `*_SHA256` beside it.
- #732 carries the correct jq 1.8.2 hash before it merges.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| Version bumped, hash unchanged | CI fails and names the tool |
| Version and hash both bumped correctly | CI passes |
| A pin present in only one of `bkit-cloud.md` / Dockerfile (jq) | Still checked |
| Release download unreachable | The check fails loudly; never passes silently |
| `PNPM_VERSION` (corepack, no download) | No sha256 needed; skipped by name |

### Derived Test Matrix

<!-- prettier-ignore -->
| Test description | Type | Target file |
| --- | --- | --- |
| Every download `*_VERSION` in `bkit-cloud.md` has a matching `*_SHA256` | Unit | `.bkit/core/engine/install/cloud-env.test.ts` |
| Pins present in both files agree for every tool, not just `NODE` / `GH` / `VALE` | Unit | `.bkit/core/engine/install/cloud-env.test.ts` |

### Tasks

<!-- bkit:group 1 start -->

### TASK GROUP 1: Pair checks and live checksum check

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** Make the static pin test cover every pair
  - **UPDATE:** `shares every version + sha256 pin with the Cursor Dockerfile template` in `.bkit/core/engine/install/cloud-env.test.ts`: derive the tool list from the pins found instead of the fixed `["NODE", "GH", "VALE"]`; compare pins present in both files
  - **DONE WHEN:** the test fails when a `*_VERSION` has no `*_SHA256` beside it
  - **TEST FIRST:**
    - `.bkit/core/engine/install/cloud-env.test.ts` `pairs every download *_VERSION with a *_SHA256` fails on a version-only fixture

<!-- bkit:task 1 end -->
<!-- bkit:task 2 start -->

- [ ] **TASK 2:** Add a CI step that downloads each pinned asset and runs `sha256sum -c`
  - **UPDATE:** `.github/workflows/bkit-ci.yml`: a step that reads the pairs from `bkit-cloud.md` and the Dockerfile, downloads each asset, and runs `sha256sum -c`
  - **DEPENDS ON:** 1
  - **DONE WHEN:** CI on #732 as it stands goes red on jq, and green once its hash is fixed
  - **TEST FIRST:** n/a — CI workflow step; proven on #732

<!-- bkit:task 2 end -->
<!-- bkit:task 3 start -->

- [ ] **TASK 3:** Fix the jq 1.8.2 hash on #732
  - **UPDATE:** `JQ_SHA256` in `.bkit/shared/.claude/bkit-cloud.md`: the digest from `gh release view jq-1.8.2 -R jqlang/jq --json assets` for `jq-linux-amd64`
  - **DEPENDS ON:** 2
  - **DONE WHEN:** the new CI step passes on #732
  - **TEST FIRST:** n/a — data fix, covered by Task 2's check

<!-- bkit:task 3 end -->
<!-- bkit:group 1 end -->

### Shipped templates

**Shipped files change; the Renovate template doesn't, unless the open question below lands on "ship the check".**

- `.bkit/shared/.claude/bkit-cloud.md` is shipped. bkit generates it into consumers as `.claude/bkit-cloud.md`, which is gitignored there (`.bkit/core/engine/install/modules/claude.ts:204-213`). So the jq fix (Task 3) reaches consumers through a bkit release, not through their Renovate.
- `.bkit/templates/.cursor/Dockerfile` is a shipped template with the `NODE`, `GH` and `VALE` pairs, and it is copy-and-own. Consumers' own Renovate (from the shipped `.bkit/templates/.github/renovate.json5`, whose `customManagers` match `Dockerfile`) bumps those versions in their copy and leaves the hash old. That's the same silent break, in their repo. The comment above `customManagers` in the template already says to update the hash by hand, but nothing checks it.
- `.bkit/templates/.github/workflows/bkit-ci.yml` (shipped) is where a consumer-side check would go. Task 2 as written changes only bkit's own `.github/workflows/bkit-ci.yml`.

### Open Questions & Assumptions

- Should the checksum check also ship in `.bkit/templates/.github/workflows/bkit-ci.yml` for consumers who adopt the Cursor Dockerfile template?
  - A) Yes: same CI step in the template, reading `.cursor/Dockerfile` pairs, so consumers' version-only Renovate bumps go red too.
  - B) No: bkit-only for now. Consumers rely on the template comment and the install failing closed at image build time.
  - Recommended: A. The template comment alone already failed in this repo, and a consumer's failure shows up only when the image is rebuilt, long after the PR merged.
- Task 2 needs the network, so it can't live in a unit test (`docs/testing.md` § Tiers). Assumes a CI step is the right place; editing `.github/workflows/*` needs explicit confirmation under `.agents/rules.md`.
- Grouping pinned-tool updates into one PR is the sibling issue (#736 — Fix the Renovate schedule window and group pinned-tool updates); this check works either way.

### References

- Ledger row: `docs/failures.jsonl` key `audit-dependencies-jq-pin-checksum-unchecked`
- Report recommendation R2
- Next step: `/bkit-build` (shipped cloud setup and CI, so the full workflow, not lite)

Done in 10f5da34f on dev (not pushed yet).

**What changed.** CI now catches a version bump that leaves the old checksum behind. A new command, `bkit ci pins --file=<path>`, reads every `*_VERSION` + `*_SHA256` pair in a file, downloads each tool once, and fails if the file's hash doesn't match what the download actually is. The failure names the tool and the file. A version that no download URL uses, such as pnpm installed through corepack, is skipped because there is nothing to hash.

**Where it runs.** Both copies of `bkit-ci.yml` have a new `Check Pinned Checksums` step:

- The template that ships to consumers checks `.cursor/Dockerfile`, and skips itself when a repo doesn't have one.
- The bkit repo also checks the Dockerfile template and `.bkit/shared/.claude/bkit-cloud.md`.

So a Renovate PR that bumps only a version now goes red in that same PR, not later when the image is rebuilt.

**Test cover.** `cloud-env.test.ts` now fails if any downloaded tool in the cloud setup script or the Dockerfile template has a version with no checksum next to it.

**Proof.**

- Ran against the real files: all 10 pinned downloads match (gh, jq, node, vale), and pnpm is skipped.
- Put back the old jq hash from #732: the command fails, naming jq 1.8.2 and showing both hashes.
- `pins.test.ts` has 14 tests. When I forced the hash comparison to always pass, the tests went red.

**Docs.** `deployments.md`, `templates.md` and the comments in `renovate.json5` now say what the step does.

## #683 — Split stats: bkit stats per repo, harvest script across repos (closed)

## Target model

**Two places, two jobs.**

- **`.bkit/stats.jsonl`: one repo, written by workflows.** `bkit workflows close` keeps appending `outcome`, `compliance` and `counter` rows in the schema 2 format (#673). Nothing else writes there. No `chat` or `run` rows.
- **`harvest/stats.jsonl`: every repo, in bkit's checkout only.** Written by the harvest script alone, from two sources that never produce the same kind:
  - raw host chat history and raw run logs (`docs/plans/<YYYYMM>/logs/<FID>/status.jsonl`) → `chat` and `run` rows;
  - every listed repo's `.bkit/stats.jsonl`, bkit's own included → copied `outcome` / `compliance` / `counter` rows.

**One shipped command, one unshipped script.**

<!-- prettier-ignore -->
|  | Ships? | Reads | Writes |
| --- | --- | --- | --- |
| `bkit stats` (new CLI command) | yes, every repo | this repo's `.bkit/stats.jsonl` only. No chat history, no other repo. | `.bkit/stats.md`, **committed** (no longer gitignored) |
| harvest script, e.g. `scripts/harvest/` in bkit's repo | **no**: not in `dist`, `.bkit/core`, `.bkit/shared` or `.bkit/templates` | raw chat history from every host on the machine; run logs of every repo those chats ran in; `.bkit/stats.jsonl` and `.bkit/friction.jsonl` of every repo in `harvest/consumers.md` plus bkit itself; `docs/{deferrals,failures}.jsonl` counts as today | appends to `harvest/stats.jsonl` and `harvest/friction.jsonl`, then writes `harvest/stats.md` across all repos |

The harvest script reuses the engine's ledger helpers (`parse`, `fold`, `normalize` in `.bkit/core/engine/ledgers/telemetry.ts`) by importing them from the repo. Nothing shipped changes shape for it.

Retired:

- the `bkit harvest` CLI command (`.bkit/core/engine/commands/harvest.ts`, `dist/commands/harvest.js`). Today it ships to every consumer, yet it only works in bkit's checkout, where `harvest/consumers.md` exists;
- `scripts/stats/bkit-chat-stats.mjs` and its consumer template `.bkit/templates/scripts/stats/bkit-chat-stats.mjs`. Its host readers and cross-repo report fold into the harvest script; its per-repo report becomes `bkit stats`.

**Run check.** Every workflow run should appear twice in `harvest/stats.jsonl`: as an `outcome` row (written at close, copied by the harvest) and as a `run` row (rebuilt from the run log), joined on `run.parentSha`. A run on one side only means a close that never wrote its row, or a run log the scan missed. Only runs compare this way; chats have no close-time counterpart. The check runs inside the harvest script, so the copied rows are never older than the scan.

**Backup of `harvest/`.** None. `harvest/` stays gitignored and local; backing it up is the maintainer's business, not bkit's. Docs say plainly that after the clean-up it holds the only copy of the chat history.

## Why: how it works today

### 1. bkit's own `.bkit/stats.jsonl` holds other repos' chats

`scripts/stats/bkit-chat-stats.mjs` reads every agent chat on the machine and writes all of them into the `.bkit/stats.jsonl` of whichever checkout it runs in (`.bkit/jsonl.md:50`: "per agent chat on the machine, any repo or host"). No entry in `docs/decisions.jsonl` records why.

Rows in bkit's `.bkit/stats.jsonl` on 2026-10-23:

<!-- prettier-ignore -->
| Repo | `chat` | `run` |
| --- | --- | --- |
| cbartens/bkit (`fp:55c170f293b3`) | 351 | 9 |
| gether-life/app-gether-life (`fp:323f05b232c2`) | 184 | 27 |
| fcte-com-au/visitfrasercoast-com (`fp:4d7c3450da2e`) | 35 | 0 |
| unknown repo (`fp:140bedbf9c3f`), not in `harvest/consumers.md` | 28 | 0 |

Plus 87 close-time rows (`outcome` / `compliance` / `counter`) for bkit.

### 2. `harvest/` never includes bkit's own data

`bkit harvest` reads only the repos in `harvest/consumers.md` (app-gether-life, visitfrasercoast-com). bkit's `.bkit/stats.jsonl` and `.bkit/friction.jsonl` (68 rows) never reach `harvest/`. Today `harvest/` holds only `consumers.md`.

### 3. `bkit harvest` ships but only works in one checkout

Registered in `.bkit/core/engine/cli.ts:263`, listed in `bkit help` (`cli.ts:653`), compiled to `dist/commands/harvest.js`; `package.json` `files` includes `dist` and `.bkit/core`. Every consumer installs it; only bkit's checkout has `harvest/consumers.md`.

### 4. The chat-stats script mixes sources, has one mode, and its report is gitignored

It reads raw chats, writes them into the repo ledger, and also reads other repos' `.bkit/stats.jsonl` to link rows (`otherLedgerRows`, `scripts/stats/bkit-chat-stats.mjs:3043`). Paths are hard-wired to `.bkit/stats.jsonl` → `.bkit/stats.md` (`:4201-4202`); the report is written around "this checkout" (`:3210`, `:3236-3243`). `.bkit/stats.md` is gitignored (`.gitignore:66-67`) because it turns other repos' fingerprints back into names (`.bkit/templates.md:699`). Once `.bkit/stats.md` covers only the repo's own close-time rows, which carry plain slugs, that reason is gone.

### 5. One repo is written up to three ways in `repo`

- bkit: `cbartens/bkit` (57 rows), `@cbartens/bkit` (30), `fp:55c170f293b3` (chat / run rows).
- app-gether-life's own ledger: `gether-life/app-gether-life` (288) and bare `app-gether-life` (183, the path-derived fallback in `consumerPathToSlug`).

A per-repo grouping or the run check would split one repo into several buckets.

### 6. Smaller mismatches

- `runHarvestCommand` says to "commit" `harvest/`, but `harvest/` is gitignored (`.gitignore:126`); the stderr line says "back it up".
- The harvest header lists `friction.jsonl` under COPY (`HARVEST_COPY_FILES`) and elsewhere says MOVE. It copies, then prunes.

Both go away with the rewrite; the new script states each once, correctly.

## What needs doing

1. **`bkit stats` (new shipped CLI command).** Reads only `.bkit/stats.jsonl`, writes `.bkit/stats.md`. Report built for close-time rows: runs, outcomes, compliance, counters. Never reads chat history or another repo.
2. **Stop ignoring `.bkit/stats.md`.** Remove `.gitignore:66-67`. bkit's own `.bkit/stats.md` is committed from then on.
3. **Harvest script in bkit's repo** (e.g. `scripts/harvest/`), outside every shipped path. One run does the whole harvest:
   - move friction rows (copy → fsync → read back → prune, as `harvest.ts` does today) from every listed repo and bkit itself;
   - copy every listed repo's and bkit's `.bkit/stats.jsonl` close-time rows;
   - count `docs/{deferrals,failures}.jsonl` as today;
   - scan raw chats from all five hosts (claude-code, codex, opencode, cursor, antigravity) and run logs, keeping the current scan behaviour: settle hours, re-read only changed chats, `--dry-run`;
   - write one form of `repo` per repo on every row, matching across copied and scanned rows;
   - run the run check, print it, and write it to `harvest/stats.md`;
   - write `harvest/stats.md` across all repos, broken down per repo.
     Port the existing tests from `harvest.test.ts` / `harvest.integration.test.ts` and the chat-stats tests; they still run in bkit's CI.
4. **Remove `bkit harvest` from the CLI.** Delete `.bkit/core/engine/commands/harvest.ts` and its tests, its `cli.ts` registration and help text, and `harvest` from `BKIT_COMMANDS` in the chat-stats code. CHANGELOG entry: the command is gone; it only ever worked in bkit's own checkout.
5. **Retire the chat-stats script.** Delete `scripts/stats/bkit-chat-stats.mjs` and `.bkit/templates/scripts/stats/bkit-chat-stats.mjs`, and `.bkit/templates.md` § Chat stats.
6. **Historic clean-up, shipped as a migration** registered in `docs/migrations.md` (consumers that copied the script have the same mixed ledgers):
   - move every `chat` and `run` row out of each repo's `.bkit/stats.jsonl` into `harvest/stats.jsonl` (for bkit: 598 chat and 36 run rows). These are the only record of chats the hosts have since deleted, so they move, never get dropped;
   - same fsync-and-read-back gate the friction prune uses: a row leaves `.bkit/` only after `harvest/` holds it;
   - in a consumer repo with no `harvest/`, the migration leaves the rows in place and says so; the next harvest from bkit's checkout moves them;
   - fix the bare `app-gether-life` slug rows in app-gether-life's ledger.
7. **Docs in the same change:** `.bkit/jsonl.md` (lines 50-51, § Friction Is a Drained Queue, every `bkit harvest` mention), `.bkit/templates.md` § Chat stats (removed), `.bkit/README.md` (new `bkit stats`, `.bkit/stats.md` row, friction row), `docs/observability.md` (`[bkit-harvest]` lines move to the script; prefix for `bkit stats`), `docs/capabilities.md`, `.gitattributes` and `.bkit/shared/.gitattributes` comments that name `bkit harvest`, and the audit template in #343. Record in `docs/decisions.jsonl`: local `bkit stats` ships, cross-repo harvest is an unshipped maintainer script, no bkit-managed backup of `harvest/`.

Related: #673 (schema 2 rows at workflow close), #343 (harvest audit template; its contract text changes with this work).

## Approach

Implemented on `dev`, one change.

**Harvest script, `scripts/harvest/`, never shipped.**

- `scripts/harvest/ledgers.ts`: the ledger half, ported from `.bkit/core/engine/commands/harvest.ts`. It stays TypeScript so it can import `parse`, `fold` and `normalize` from `.bkit/core/engine/ledgers/telemetry.ts` directly. Its tests are ported from `harvest.test.ts` / `harvest.integration.test.ts` and run under vitest in CI (`vitest.config.ts` include widened to `scripts/harvest/**`).
- `scripts/harvest/bkit-harvest.mjs`: the chat half, moved from `scripts/stats/bkit-chat-stats.mjs`. It is now harvest-only and runs the whole harvest in order:
  1. ledgers: bkit itself plus every repo in `harvest/consumers.md`;
  2. chat and run-log scan;
  3. run check;
  4. `harvest/stats.md`.

  Its pure-Node test moves with it.

- Run with `pnpm harvest`, which uses `tsx`: a devDependency, present only in bkit's checkout.

**Order matters.** The ledger step runs first, so chat and run rows already in a repo's `.bkit/stats.jsonl` land in `harvest/stats.jsonl` before the scan. The scan then sees them as already counted, and doesn't append them a second time.

**Two places this deviates from the issue body:**

1. **No shipped migration for the historic move.** The `chat` / `run` rows can only go to `harvest/`, which exists only in bkit's checkout. A migration running in a consumer could do nothing but leave them there. Instead, every harvest drains `chat` / `run` rows from each harvested repo's `.bkit/stats.jsonl` through the same copy → fsync → read back → prune gate friction uses. That covers bkit's 598 chat and 36 run rows, and any consumer that ran a copy of the old script. Close-time rows in `.bkit/stats.jsonl` are copied and never pruned.
2. **Consumer ledgers are not edited to fix the bare `app-gether-life` slug.** Ledger rows are append-only, and `bkit stats` reports a single repo, so a mixed slug there changes nothing. Instead, the harvest writes `owner/repo` on every copied row: it drops a leading `@` and replaces the folder-name fallback with the repo's real slug.

`chat` / `run` rows keep their `fp:` repo fingerprint. The run check and the report match them to close-time rows through `repoFp(owner/repo)`.

**`bkit stats`** is a new engine command, `.bkit/core/engine/commands/stats.ts`. It reads `.bkit/stats.jsonl`, skips any leftover `chat` / `run` rows, and writes `.bkit/stats.md`. `.bkit/stats.md` comes out of `.gitignore`.

**Removed:**

- the `bkit harvest` command: `harvest.ts`, its tests, `cli.ts` registration and help, its `package.json` coverage entry; `dist` is rebuilt;
- `scripts/stats/` and `.bkit/templates/scripts/stats/`;
- `.bkit/templates.md` § Chat stats.

**Docs and decision record:** as listed in the issue, plus a `docs/decisions.jsonl` row.

## #629 — Add advisory, validator, baseline and batch-base checks to deps audit (closed)

### Narrative

Two runs of `bkit-audit-dependencies` (bkit 2026-10-19, consumer A 2026-10-19) hit seven gaps in the template that each run patched in its own `Project Instructions`, so the next consumer hits them again:

- **A false config error gets explained away.** Pre-Flight `Config Validator` (`.bkit/core/docs/templates/bkit-audit-dependencies.md:109`) says which config to validate ("as the default branch has it") but not in which mode. Renovate's `renovate-config-validator` treats file arguments as global self-hosted config unless given `--no-global` (docs.renovatebot.com/config-validation/, read 2026-10-19). The bkit run passed a file path, got false `allowedEnv` errors, and worked out the fix (`docs/templates/bkit-audit-dependencies.md:301`). Consumer A passed file paths, got the same `allowedEnv` error and recorded it as "validator-only" (consumer A `docs/templates/bkit-audit-dependencies.md:285`), so a real validation result was never taken. Stated stack-neutrally: validate in the mode the bot reads the config in.
- **Advisories a framework vendor publishes first are missed.** Step 13 (b) (`:140`) asks for a scanner plus host alerts; Pre-Flight `Vulnerability Scanner` (`:110`) names the "host advisory API", i.e. the global database. Consumer A's run found two critical Next.js advisories (published 2026-10-14) in `gh api repos/vercel/next.js/security-advisories` that were still 404 in the global database (`gh api advisories/<id>`) and OSV five days later, so neither `pnpm audit` nor the CI gate could see them (consumer A `docs/audits/202610/dependencies.md` findings `dependencies-1`, `dependencies-9`). It now queries vendor advisories from two templates (consumer A `docs/templates/bkit-audit-security.md:327`, `bkit-audit-dependencies.md:293`).
- **A fix-latency breach is found only after the deadline passes.** Step 13 (c) (`:140`) measures publication → land. It never asks when the bot can first open the fix, so a fix the bot cannot open until after the 7- or 30-day deadline is not flagged while there is still time.
- **A class C reproduction dirties the batch worktree.** Step 7 class C (`:130`) already says "reproduce it on the batch worktree", but not when or how. Consumer A ran it through `pnpm exec` after a PR bumped `packageManager`; the wrapper fetched that pnpm and ran an install that rewrote the worktree lockfile.
- **A red already on the audited commit fails the batch.** Step 10 (`:137`) and Verdicts (`:86`) give FAIL for "a red no single PR explains", which also fires when the red was there before any PR was merged.
- **Scorecard is an anchor standard nobody applies.** `:41` lists OpenSSF Scorecard; Step 9 — Screen (`:136`) lists new packages but records no score for them.
- **The batch is built on the wrong base when local is ahead.** Pre-Flight `Clean Worktree` (`:101`) and Step 8 (`:135`) say "detached worktree off the integration branch". When local `dev` is ahead of `origin/dev`, the landing push carries those commits too, so the batch must be verified on top of them. Both checkouts already build on the audited commit (bkit `docs/templates/bkit-audit-dependencies.md:315` `git worktree add --detach tmp/<name> <baseSha>`; consumer A `:289`).

Checked at `HEAD` (`f457082c` last touched the template): `/usr/bin/grep -n -i -F` for `repository advisor`, `vendor advisor`, `security-advisories`, `no-global`, `global config`, `deps.dev`, `baseline red`, `open date`, `earliest`, `packageManager`, `ahead` → 0 hits each in `.bkit/core/docs/templates/bkit-audit-dependencies.md`; `Scorecard` → `:41` only. All seven gaps stand.

Every addition names a tool only as an example (`e.g.`), so the shipped template stays stack-independent. No sentence is shared by 5+ audit templates, so nothing goes to `.bkit/wording.md` (`.bkit/wording.md:9`).

**Audit reports:** docs/audits/202610/audit-improvements.md (findings audit-improvements-4, audit-improvements-5, audit-improvements-34, audit-improvements-35, audit-improvements-36, audit-improvements-37, audit-improvements-38)

### Success Criteria

- A run validates the updater config in the mode the bot reads it in, and a validator error is either a real finding or gone; none is waved through as "validator-only".
- A run lists vendor repository advisories for each shipped framework beside the global database, and reports each advisory the global database lacks.
- For each open `CRITICAL` / `HIGH` advisory, the report gives the earliest date the bot can open the fix, and a date past the deadline is a finding.
- A red that already exists on the audited commit is reported as a baseline red, apart from the batch verdict; class C reproductions run without rewriting the worktree.
- The batch is built on the audited commit (`bkit:anchor` `baseSha`) and every new package carries a Scorecard score or "no score".

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| Bot ships no config validator (e.g. Dependabot) | Item unchanged: read the files; validity `Not Checked` |
| Validator still errors in repository mode | Real config finding, quoted with the command |
| Framework has no repository advisories, or the host has no such API | Global database only; that source `Not Checked` with reason |
| Vendor advisory already in the global database | Counted once; no lag finding |
| Bot opens the fix as a security update (bypasses release age, Step 13 (a)) | Earliest bot date = fixed-version publish + next bot run, no release age |
| Bot cannot see the advisory at all (vendor-only) | No bot date; the advisory itself is the finding |
| Red reproduces on the audited commit without the batch | Baseline red, reported apart; batch verdict judged on the remaining reds |
| Red does not reproduce on the audited commit | Current rule: drop suspect PR, rebuild, re-run; no single PR explains → FAIL |
| PR bumps the package-manager pin | Class C repro calls the test binary directly (e.g. `node_modules/.bin/vitest`), not the wrapper |
| Local integration branch equals the remote | Base = audited commit = remote head; no change in behaviour |
| New package has no linked source repository | Scorecard "no score", not a finding by itself |

### Derived Test Matrix

<!-- prettier-ignore -->
| Test description | Type | Target file |
| --- | --- | --- |
| Edited template lines are not near-copies of a shared audit clause and add no unlisted shared sentence | Unit | `.bkit/core/engine/tools/wording.test.ts` |
| Template carries no tracker issue number or internal label | Unit | `.bkit/core/engine/audits/repo/shipped-docs-refs.test.ts` |
| `docs/templates/bkit-audit-dependencies.md` managed block equals the canonical one bar the version stamp | Unit | `.bkit/core/engine/audits/templates/templates.test.ts` (`dogfood managed block differs only by the managed-version stamp`) |

No test names `bkit-audit-dependencies` directly (`/usr/bin/grep -rln 'audit-dependencies' --include='*.test.ts' .bkit/core/engine` → 0). No new test: each change is prose, and a string-presence test would only restate it.

### Tasks

All edits in `.bkit/core/docs/templates/bkit-audit-dependencies.md`; line numbers at `HEAD`.

- [ ] **Task 1:** Pre-Flight `Config Validator` (`:109`): after "on the config as the default branch has it", add "in the mode the bot reads it in (repository, not global / self-hosted); wrong mode reports errors the bot never hits (e.g. Renovate: copy the default-branch files into a scratch checkout and run `renovate-config-validator` there with no file argument, or pass `--no-global`; a bare path validates as global config → false `allowedEnv` errors)". Step 3 (`:123`) "Validate configs as default branch has them." → "Validate configs as default branch has them, in the bot's repository mode (Pre-Flight)." **Done when:** both lines read so at `HEAD` of the branch. **Test first:** n/a — template prose; `wording.test.ts` guards near-copies.
- [ ] **Task 2:** Pre-Flight `Clean Worktree` (`:101`) and Step 8 (`:135`): "off the integration branch" → "off the audited commit (`bkit:anchor` `baseSha`); local ahead of the remote integration ref → the landing push carries those commits, so the batch builds on them". **Done when:** `/usr/bin/grep -n 'baseSha' .bkit/core/docs/templates/bkit-audit-dependencies.md` hits `:101` and `:135`. **Test first:** n/a — template prose.
- [ ] **Task 3:** Step 7 class C (`:130`): after "reproduce it on the batch worktree", add "before Step 10, calling the test binary directly; a PR bumping the package-manager pin (e.g. `packageManager`) makes a wrapper exec (e.g. `pnpm exec`) fetch that version and install, dirtying the worktree". **Done when:** line reads so. **Test first:** n/a — template prose.
- [ ] **Task 4:** Step 10 (`:137`): before "Red check → drop suspect PR", add "Reproduce each red on the audited commit without the batch; red there = baseline red, reported apart from the batch, not a batch FAIL." Verdicts FAIL (`:86`): "a red no single PR explains" → "a red no single PR explains and the audited commit does not show". **Done when:** both lines read so. **Test first:** n/a — template prose.
- [ ] **Task 5:** Step 9 — Screen (`:136`): add "OpenSSF Scorecard score per new package's source repository (e.g. via deps.dev), or `no score`" to the list. **Done when:** line reads so. **Test first:** n/a — template prose.
- [ ] **Task 6:** Step 13 (b) (`:140`): add "vendor repository advisories for each shipped framework (e.g. `gh api repos/<owner>/<repo>/security-advisories`); global databases can lag them by days". **Done when:** line reads so. **Test first:** n/a — template prose.
- [ ] **Task 7:** Step 13 (c) (`:140`): add "per open `CRITICAL` / `HIGH`: earliest bot open date (fixed-version publish + bot release age, none for a security update, + next bot run) vs deadline; bot date past deadline = finding". **Done when:** line reads so. **Test first:** n/a — template prose.
- [ ] **Task 8:** Refresh the installed copy: `pnpm bkit upgrade`, then `git config core.bare false`. **Done when:** `pnpm exec vitest run .bkit/core/engine/tools/wording.test.ts .bkit/core/engine/audits/repo/shipped-docs-refs.test.ts .bkit/core/engine/audits/templates/templates.test.ts` and `pnpm bkit check` exit 0. **Test first:** n/a — regenerated copy; the named tests are the check.

### Open Questions & Assumptions

- Not verified by running: whether `renovate-config-validator --no-global` alone clears the `allowedEnv` error. The bkit run's working command still sets `RENOVATE_ALLOWED_ENV='PNPM_*'` (`docs/templates/bkit-audit-dependencies.md:301`), so the repo config may also need the runner's allowed env. Build should run both forms once against bkit's `.github/renovate.json5` and word Task 1 to match.
- Assumption: Scorecard per new package belongs in Step 9 (where new packages are listed) rather than Step 15 — Standards. The consumer A run proposed it under Step 15 and placed it in Step 9.
- Assumption: Step 13 (c)'s "none for a security update" matches bot behaviour (e.g. consumer A: `osvVulnerabilityAlerts: true` skips schedule and release age, consumer A `docs/templates/bkit-audit-dependencies.md:288`). Bots differ; the text keeps the bot's own rule as the input.

### Breaking Changes & Naming

None. "Baseline red" is a new report term; the batch verdicts (`PASS` / `CONCERNS` / `FAIL`) keep their names.

### Out of Scope

- The `bkit-cloud.yml` severity-row contradiction consumer A also raised: not in this row's findings.
- Editing either checkout's `Project Instructions`; the next run drops lines the template now covers (generate step 12).
- Advisory handling in `bkit-audit-security`: audit Suggested Issues row 6.

### References

- docs/audits/202610/audit-improvements.md § Clusters (C3, C4)
- `.bkit/core/docs/templates/bkit-audit-dependencies.md:41`, `:86`, `:101`, `:109`, `:110`, `:123`, `:130`, `:135`, `:136`, `:137`, `:140`
- `.bkit/lite.md` § When to use (bars dependency work, hence `/bkit-build`)
- docs.renovatebot.com/config-validation/ (file arguments = global config; `--no-global`)
- docs/setup.md § Bootstrap (`bkit upgrade` re-renders every installed module)

Landed on `dev` in 8a1dbd56 (not pushed yet). Canonical template and bkit's own copy under `docs/templates/` both updated; the issue's line numbers had drifted 1 to 2 lines, so every edit uses the lines at HEAD.

`bkit-audit-dependencies` now:

- **Validates the updater config the way the bot reads it:** repository mode plus the runner's global options. Running the real Renovate validator (v44.151.0) showed that `--no-global` alone still errors on `PNPM_*`; `RENOVATE_ALLOWED_ENV` is needed too. An error left after that is a finding, never "validator-only".
- **Builds the batch off the audited commit** (`bkit:anchor` `baseSha`), not the remote ref.
- **Re-runs each red on the audited commit first.** A red that was already there is a baseline red, reported apart from the batch verdict.
- **Reproduces class-C reds by calling the test binary directly**, so a `packageManager` bump doesn't trigger an install.
- **Adds:** vendor repository advisories (one missing from the global database is a finding), an OpenSSF Scorecard score per new package, and the earliest date the bot can open each `CRITICAL` / `HIGH` fix, compared with its deadline.

Tests: wording, templates, prompt-notation, shipped-docs-refs and dogfood parity pass; `bkit check` exits 0.

## #617 — Harden the Renovate examples: preset, runner image, majors, ignores (closed)

From the 2026-10 dependency audit (#482): findings `deps-3`, `deps-4`, `deps-8` and `deps-9` (all MEDIUM), plus `deps-14` and `deps-15` (LOW, folded in). Report: `docs/audits/202610/dependencies.md`, audited at `72baf71f`.

## What's wrong

The Renovate config and its runner workflow ship to consumers as examples, and both are weaker than Renovate's own recommended setup. Each problem below exists in the repo copy and the same way in the template copy under `.bkit/templates/`.

- **Weaker base preset (`deps-3`).** `.github/renovate.json5:22-25` extends `config:recommended`. Compared with `config:best-practices` it is missing:
  - `abandonments:recommended`: flags packages nobody maintains any more.
  - `:configMigration`: opens PRs when the config format changes.
  - `docker:pinDigests`: pins images to an exact build.
  - `:pinDevDependencies`: pins dev dependencies to exact versions.

  The dependency dashboard (#328) has no abandoned-packages section as a result.

- **Bot image floats a major behind (`deps-4`).** `.github/workflows/bkit-renovate.yml:68` sets no `renovate-version`, so it runs `ghcr.io/renovatebot/renovate:43`, whatever the newest 43.x is (run 39121442307 resolved 43.288.0). The latest version is 44.167.5. Renovate itself warns that "Renovate versions older than the latest major version are unsupported".
- **Scans archives and test fixtures (`deps-8`).** The repo's `ignorePaths` (`renovate.json5:84-90`) replaces the default list from `:ignoreModulesAndTests` instead of adding to it, and it leaves out `docs/plans/**`. That causes noise PRs:
  - The dashboard picks up `tests/fixtures/heavy-customised-consumer/package.json`.
  - #583 only touches 2 files under `docs/plans/202610/logs/504-example-project/spike/`, and #544 only 3.
  - #579 carries 2 hunks there.
- **Major versions open without approval (`deps-9`).** The majors rule (`renovate.json5:141-145`) has no `dependencyDashboardApproval`. So #583 (actions v4 → v7, archived files only) and #584 (vitest 5) opened and ran CI before anyone decided to take them.
- **Pinned CLIs nobody watches (`deps-14`, LOW).** These tools are pinned to exact versions, but they aren't in any package file and no Renovate rule tracks them, so nobody hears about new releases:

<!-- prettier-ignore -->
| Tool | Pinned | Latest at audit | Where |
  | --- | --- | --- | --- |
  | Vale | 3.9.1 | 3.24.0 | `bkit-ci.yml:478` |
  | actionlint | 1.7.12 | 1.7.12 | `bkit-ci.yml:525` |
  | graphifyy | 0.9.50 | 0.9.92 | `bkit-ci.yml:573` |
  | @opencode/cli | 2.0.26 | 2.0.32 | `bkit-cloud.yml:545` |
  | jq | 1.7.1 | 1.8.2 | `.bkit/shared/.claude/bkit-cloud.md:72` |

- **pnpm bumps open alone (`deps-15`, LOW).** The non-major group (`renovate.json5:112-129`) matches only `devDependencies` and `dependencies`. A `packageManager` bump such as #581 therefore opens as its own PR instead of joining the group.

## Fix

Apply each change to both copies (lines from the report's Recommendations):

1. `extends: ["config:best-practices", ":dependencyDashboard"]`. (R4)
2. Pin `renovate-version` to an exact 44.x, with a `# renovate: datasource=docker depName=ghcr.io/renovatebot/renovate` comment and a matching custom manager. Run the config validator on 44 first. (R5)
3. Add `dependencyDashboardApproval: true` to the majors rule. (R6)
4. Add `"docs/plans/**"`, `"**/tests/**"` and `"**/__fixtures__/**"` to `ignorePaths`. (R7)
5. Add `customManagers` regex rules for `VALE_VERSION`, `GRAPHIFY_SPEC`, `@opencode/cli@` and jq. Pins that are paired with a checksum (Vale, actionlint) still need their sha256 updated by hand when the bot bumps them (`renovate.json5:209-212`). (R15)
6. Set `matchDepTypes: ["devDependencies", "packageManager"]` on the non-major group rule. (R9)

Then close #583 and #544. Once `ignorePaths` changes, Renovate no longer needs them.

## Done when

- Both config copies extend `config:best-practices`.
- The runner pins an exact current-major image that a bot rule keeps up to date.
- Major updates wait on the dashboard.
- The dashboard's detected-file list has no archived plan or test-fixture paths.
- The dashboard lists the off-manifest CLIs, and `packageManager` bumps join the non-major group.

Logged in `docs/failures.jsonl` under keys `audit-dependencies-renovate-not-best-practices-preset`, `audit-dependencies-renovate-image-floating-major-behind`, `audit-dependencies-renovate-ignorepaths-scans-archives-fixtures` and `audit-dependencies-renovate-majors-no-dashboard-approval`.

Next step: `/bkit-build`. It changes shipped dependency config and a workflow file, so no shortcut. Editing `.github/workflows/*` needs explicit confirmation under `.agents/rules.md`.

Fixed in #622 (4ca0f71a), in both this repo's renovate.json5 and the shipped template. It extends config:best-practices (7-day npm wait kept), uses rebaseWhen conflicted, holds majors for Dependency Dashboard approval, runs lockfile maintenance monthly, repeats the preset ignorePaths plus docs/plans/**, and has one regex custom manager for # renovate: pins. bkit-renovate.yml pins renovate-version, bumped through dated GitHub releases. Checked with renovate-config-validator --strict and a local Renovate lookup run. Decision row: 617-renovate-example-hardening.

## #615 — Pin and checksum installs in the Cursor Dockerfile and cloud setup (closed)

From the 2026-10 dependency audit (#482): findings `deps-1` (HIGH), `deps-5` (MEDIUM) and `deps-6` (MEDIUM). Report: `docs/audits/202610/dependencies.md`, audited at `72baf71f`.

## What's wrong

The Cursor Dockerfile template and the cloud setup both ship to consumers, and both install tools without pinning their versions or checking the files they download.

- **Vulnerable pnpm (`deps-1`).** `.bkit/templates/.cursor/Dockerfile:54` and `.cursor/Dockerfile:54` run `corepack prepare pnpm@10.34.4 --activate`. pnpm below 10.34.5 has a HIGH advisory, GHSA-c59q-g84q-2gj5 (CVE-2026-82392), published 2026-09-02. #455 moved `package.json:45` to 10.34.5 but missed this line, although the comment at `:53` says it is "corepack-pinned to match `packageManager`". No Renovate rule watches this line, so the bot will not catch it next time either.
- **Node and gh float (`deps-5`).**
  - `Dockerfile:23` downloads the `deb.nodesource.com/setup_20.x` script and pipes it straight into `bash` with no pin. That installs whatever Node 20.x is newest, and Node 20 reached end of life on 2026-04-30. The repo itself runs Node 24 (`.nvmrc`, `release.yml:33`).
  - `gh` comes from the cli.github.com apt repo with no version.
  - The cloud setup (`.bkit/shared/.claude/bkit-cloud.md:61-62`) resolves `releases/latest` for gh.
- **No checksums (`deps-6`).** Downloads that are unpacked or installed with no sha256 check:
  - the Vale 3.9.1 tarball (`Dockerfile:46-51` and `bkit-cloud.md:47-53`)
  - the gh tarball (`bkit-cloud.md:62`)
  - the jq 1.7.1 binary (`bkit-cloud.md:72`)

  CI already checks the same Vale tarball with `sha256sum -c` (`bkit-ci.yml:478-484`, `bkit-cloud.yml:480-483`).

## Fix

Change both copies of each file. The dogfood test keeps `.cursor/Dockerfile` byte-identical to `.bkit/templates/.cursor/Dockerfile`.

1. pnpm: pin to `packageManager` (10.34.5). Add a Renovate `customManagers` regex rule so the bot moves this line together with `package.json:45`. (R1)
2. Node: take the major from `.nvmrc` (24). Use either a digest-pinned `node:24-<distro>` stage, or `ARG NODE_VERSION=24.x.y` with the tarball checked against nodejs.org `SHASUMS256.txt`. Drop the `curl | bash`. (R2)
3. gh: install a pinned release tarball with a sha256 check, both in the Dockerfile (instead of the apt package) and in the cloud setup (instead of `releases/latest`). (R2, R3)
4. Vale and jq: add `echo "${VALE_SHA256}  ..." | sha256sum -c -` using CI's value (`bkit-cloud.yml:480`), and do the same for jq. (R3)

## Done when

- No install line in either Dockerfile copy or in `.bkit/shared/.claude/bkit-cloud.md` uses a floating version, `latest`, or a piped remote script.
- Every download is checked against a sha256.
- The pnpm pin equals `packageManager`, and a Renovate rule keeps them in step.

Logged in `docs/failures.jsonl` under keys `audit-dependencies-cursor-dockerfile-vulnerable-pnpm-pin`, `audit-dependencies-build-image-floating-node20-gh` and `audit-dependencies-unchecksummed-cli-downloads`.

Next step: `/bkit-build`. It changes shipped dependency and security config, so no shortcut.

Fixed in #622 (4ca0f71a). .cursor/Dockerfile and its template install Node 24.21.0 from the nodejs.org tarball instead of the NodeSource script, and gh 2.102.0 and Vale 3.9.1 from release tarballs. Each is checked against its published sha256 before unpacking; pnpm is pinned through PNPM_VERSION. The bkit-cloud.md setup script pins and checks Vale, gh 2.102.0 (no longer releases/latest) and jq 1.7.1, and jq is installed only after its check passes. Each pin has a # renovate: comment, so Renovate opens the bump PR; the sha256 is updated by hand in that PR.
