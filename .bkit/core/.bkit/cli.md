# CLI

{{BKIT_MANAGED_MARKER}}

> [!CAUTION]
> **Purpose:** Every `bkit` command — the ones people run (`bkit install`, `bkit check`) and the `bkit <noun> <verb>` commands workflow steps run — with the contract they share. Flags, output keys and exit codes per verb: `bkit help`, `bkit <noun> --help`, `bkit <noun> <verb> --help`.
>
> **Rules:**
>
> - Write this file to `.bkit/authoring.md` § All Agent-Read Files and § Docs.
> - Ships to consumers: describe the current setup only. NEVER an internal identifier (tracker issue number, ledger key, review-finding id) and NEVER project history — decisions belong in `docs/decisions.jsonl`, incidents in `docs/knowledge.jsonl`.
> - Everything between `<!-- cli:start -->` and `<!-- cli:end -->` is generated from the command specs (`.bkit/core/engine/cli.ts` `CLASSIC_VERB_HELP`, `.bkit/core/engine/commands/registry.ts`) by `pnpm cli:sync`; edit the specs, never the region.
> - A verb's `Use` is `by hand` only when running it outside a workflow run writes no run state, lock, commit, push or tracker post the next run reads.

## Contract

Mechanical step work runs as `bkit <noun> <verb> --flag=value` (also `--flag value`); `bkit help` lists the nouns, `bkit <noun> --help` / `bkit <noun> <verb> --help` list verbs, flags, output keys, exit codes. Source `.bkit/core/engine/commands/{workflow,ci,setup}/`, listed in `commands/registry.ts`; conventions enforced by `.bkit/core/engine/commands/conventions.test.ts`.

<!-- prettier-ignore -->
| Contract | Rule |
| --- | --- |
| stdout | one output object as text: `key: value` lines, nested keys indented two spaces under their parent, a list of flat rows as a markdown table; a string that would read as another type (`"null"`, `"5"`) is quoted. `--json` prints the same object as one JSON line for scripts. Keys camelCase, matching `status.jsonl` (`parentSha`, `group`). A verb's `textOmit` keys (the written ledger `row`, a `clamp` record) appear under `--json` only. |
| stderr | Human log lines, tagged `[bkit-<noun>]`. |
| Flags | kebab-case; same name for the same thing everywhere: `--workflow --step --fid --month --group --attempt --verdict --artifact` (repeatable). |
| Exit `0` / `1` / `2` | ok / the answer is no (gate failed, max attempts, lock held) / usage error or missing dependency. |
| Exit `3`-`79` | Command-specific; listed in that verb's `--help`. |
| Exit `80` / `81` / `82` | Do it via MCP (`runtimeGithubCli=false`) / hand the wait back to the agent turn loop / needs a human. |
| Month | `YYYYMM` in UTC. |
| `status.jsonl` | design / plan / build / debug: `.worktrees/{FID}/` copy when present, else main checkout. ship: current worktree top (`{WORKTREE_PATH}`). |

**Invocation:** Step 1's first block runs `repo info` through the lookup expression

```bash
"$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/node_modules/.bin/bkit" repo info --fetch
```

and holds its `bkit` key as `{BKIT}` (plus `repoRoot` as `{REPO_ROOT}`, `outboxRoot` as `{OUTBOX_ROOT}`, `bkitAdvisory` as `{BKIT_ADVISORY}`); every later block runs `"{BKIT}" <noun> <verb> …`, the orchestrator substituting the path. It is the main checkout's binary, so it works before and without a worktree `node_modules` (adopt mode never installs). The bkit repo links itself as a dev dependency so the same path exists there. A value a later step needs is held from the command's JSON by key (`hold worktreePath as {WORKTREE_PATH}`) — never re-derived by hand; model-held values reach a command as flag values (`--fid={FID}`), never through shell variables. Every command refuses (exit 2) a flag value still carrying a literal `{UPPER}` placeholder — the orchestrator passed it through unsubstituted.

**Outdated bkit:** `repo info` also reports `bkitVersion` (`.bkit/version` `pinnedVersion`), `bkitLatest` (newest published `@cbartens/bkit`), `bkitOutdated` (numeric compare; a prerelease is older than its release) and `bkitAdvisory` (one line naming the upgrade command; null unless outdated). Step 1 of every phase workflow emits a non-null `{BKIT_ADVISORY}` as `[bkit-{workflow}] …` and continues — never a stop, never a gate item. Lookup: `pnpm view`, at most once a day; answer cached in `<git common dir>/bkit-latest-version.json` (shared by worktrees, never committed); a failed lookup cached 1 hour. No answer, no pin, or `BKIT_NO_UPDATE_CHECK` set (not `0`) → `bkitLatest` / `bkitOutdated` / `bkitAdvisory` null. Same check stamps every anchored doc (`.bkit/workflows.md` § Anchor Block).

**Step endings:** a step that writes a `step-done` row ends in one `bkit steps finish` call: it reads each `--agent`'s verdict header from the `--artifact` in the same position (worst verdict wins, `Failures` summed, the prompt's declared header fields required, `Strategy` recorded on the row), derives the attempt (`--attempt=next`, `--attempt-of=<step>:<next|current|count>`; `<attempt>` in a path or message becomes it), runs the gate's mechanical checks before writing, writes the row, commits (`--message`, `<done>` = the log's first `DONE` line), and prints the step's tracker `comment` (`--number` / `--title`); `--post` posts it first and prints `tracker`. Exit 5 / 6 print `reask` = `{agent, artifact}` for the header-only re-ask. A gate whose step ends in `steps finish` relies on that call's checks; a gate with no finish (Step 1, closes, Step 3 / 9 of ship) runs `bkit steps gate`.

**`{OUTBOX}`** = `{OUTBOX_ROOT}/{FID}` = `<main checkout>/.git/bkit-outbox/{FID}/` (git common dir): temporary command inputs and outputs — re-read issue files from `bkit issues fetch --outbox`, related-issue hits, close artifact and telemetry lines, ship's pre-merge snapshot and close worktree, the `.worktree-owned` marker. `{OUTBOX_ROOT}/error.md` carries the Failure Path's error text to `bkit workflows fail --error-file`. Outside every worktree, so it survives worktree removal; never committed.

CI check names come from `package.json` `bkit.testing.ciCapstone` (default `bkit-tests-check`) and `bkit.testing.ciWorkflow` (default `bkit-ci.yml`) — no command hard-codes a check, workflow file, or app folder.

No workflow file calls a script outside a `bkit` command; the slop plugin `bkit-slop-type-suppression.mjs` is a copy-and-own template (`scripts/slop/`). `bkit-cloud.yml` reads the debug limits from `package.json` with `jq` because its guards run before bkit is installed.

First install, upgrade and uninstall: `.bkit/install.md`. Upgrade prompt to paste into your AI: `.bkit/install.md` § Upgrade — already installed.

<!-- cli:start -->

## Commands you run

<!-- prettier-ignore -->
| Command | Flags | What it does |
| --- | --- | --- |
| `bkit install` | `--claude` `--cursor` `--codex` `--antigravity` `--opencode=<provider>` `--auto=<claude\|cursor\|opencode>` `--tracker=<name>` `--auto-revert` | Install or re-sync the named modules plus the core files. |
| `bkit check` | — | Drift gate: exit 1 when a managed file needs re-rendering. The CI gate. |
| `bkit upgrade` | `--to=<version>` `--latest` `--auto-apply` `--dry-run` | Re-render everything installed; --to / --latest bump @cbartens/bkit first. |
| `bkit uninstall` | `--claude` `--cursor` `--codex` `--antigravity` `--opencode=<provider>` `--auto=<claude\|cursor\|opencode>` `--dry-run` `--force` `--nuke` `--yes` | Remove bkit-managed files and strip managed blocks; no flags = everything. |
| `bkit doctor` | — | Preflight and advisory replay; rewrites .bkit/advisories.md only. Exits 0. |
| `bkit tips` | `--workflow=<name>` `--all` | What this repo has not set up yet, most useful first. Exits 0. |
| `bkit status` | — | Current host and provider. Writes nothing. Exits 0. |
| `bkit cursor` | — | Launch Cursor with .bkit/.env loaded into its environment. |
| `bkit opencode` | — | Launch the opencode desktop app with .bkit/.env loaded. |
| `bkit comply` | `--phase=<phase>` | Compliance grader for one workflow phase; appends stats rows. Exits 0. |
| `bkit telemetry summary` | `--phase=<workflow>` | One workflow run's metrics against the median of the previous five. Exits 0. |
| `bkit stats` | — | This repo's stats report, written to .bkit/stats.md. Exits 0. |
| `bkit help` | — | Print the usage text. |

## Workflow commands

Use: `by hand` = safe and useful outside a workflow run; `workflow` = a workflow step only (writes run state, takes locks, commits, pushes or posts). **Bold** flag = required.

### `branches`

Sync, push, land and rebase branches; stamp and read a doc's base-commit anchor.

<!-- prettier-ignore -->
| Verb | Use | Flags | What it does |
| --- | --- | --- | --- |
| `sync` | workflow | `--head` `--merge-docs` | Fetch origin/dev; report whether it is an ancestor of HEAD (Path A/B) and how far docs/ is behind; optionally merge it in. |
| `push` | workflow | **`--mode`** `--set-upstream` `--ahead-of` `--commit` `--label` `--file` `--workflow` `--require-ci` `--open-pr` `--fid` | Push the current branch with exactly one git push: plain for dev/main, --force-with-lease otherwise. |
| `fast-forward` | workflow | **`--onto`** | Fetch a remote branch and fast-forward the checkout onto it; refuse when diverged. |
| `scan-diff` | by hand | **`--base`** `--paths` `--marker` `--code` `--disabled-tests` `--expect-none` | Exit 0 when the branch's diff from --base matches (paths, an added marker line, a source change, or a disabled test); 1 when not — --disabled-tests turns that round: 1 when a test was disabled or lost an assertion, 0 when none was. |
| `force-build` | workflow | **`--fid`** **`--file`** **`--workflow`** `--label` `--open-pr` `--title-set` | Force a full CI build: put [force build] on the open PR's title, then push an empty marker commit (once per run). |
| `rebase` | workflow | `--log-file` `--sentinel` | Drive a rebase to completion, auto-resolving ledger (union) and lockfile (regenerate) conflicts; refuse and abort on anything else. |
| `sync-dev` | workflow | — | After a merge, fast-forward local dev to origin/dev without checking it out or pushing; frozen install when the main checkout is on dev and moved. |
| `land` | workflow | **`--workflow`** **`--fid`** `--month` `--token` `--issue` `--branch` `--pr` `--merged-sha` | Design / plan close: squash the branch onto origin/dev in a throwaway worktree and push it as dev (retrying with backoff when dev moved), else the PR squash-merge; then audit it, fast-forward local dev on a laptop and release the lock. |
| `anchor-stamp` | workflow | **`--file`** **`--base-sha`** `--base-ref` `--design` | Put a <!-- bkit:anchor --> block recording the base commit and bkit release on top of a design/plan doc or audit report (idempotent). |
| `anchor-read` | by hand | **`--file`** `--field` `--against` | Read a doc's anchor fields; with --against, decide whether anything landed since its baseSha. |

### `challenge`

Size the build challenge (gate) and fold its reports into the plan (merge): findings become plan tasks or LOW deferrals.

<!-- prettier-ignore -->
| Verb | Use | Flags | What it does |
| --- | --- | --- | --- |
| `gate` | workflow | **`--file`** `--base` | Size the run's diff ({base}...HEAD, docs/plans/** excluded) and name the reviewers: small runs challenge-2 alone, large runs both. Writes a challenge-gate status row. |
| `merge` | workflow | **`--report`** **`--plan`** **`--log`** **`--round`** | Merge the challenge reports' findings into the plan as tasks (LOW → deferral rows); prints the route: fix \| pause \| none. |

### `ci`

Gates CI and the git hooks run.

<!-- prettier-ignore -->
| Verb | Use | Flags | What it does |
| --- | --- | --- | --- |
| `slop` | by hand | `--base` | Fail when the working tree adds or worsens slop on net against a base ref. |
| `prose` | by hand | `--glob` | Run Vale over the markdown files the globs select; skip when vale is not installed. |
| `skip-token` | by hand | `--ref` | Whether a commit message carries a GitHub skip-CI token ([skip ci] and kin). |
| `min-push` | by hand | `--ref` `--base` | Exit 0 when every file a push changes matches bkit.testing.minPushPaths (the pre-push light gate). |
| `pins` | by hand | `--file` | Download each *_VERSION + *_SHA256 pinned tool in the files and fail when a hash differs. |

### `context`

Clamp context artifacts; scan ledgers; write the run's diff and a build group's brief; list, run and record consumer context-fetch blocks.

<!-- prettier-ignore -->
| Verb | Use | Flags | What it does |
| --- | --- | --- | --- |
| `clamp` | workflow | **`--artifact`** **`--profile`** `--source` `--log` `--fid` `--step` `--attempt` | Clamp an artifact to a size profile in place (a backstop, not a routine cap). |
| `clamp-log` | workflow | `--log` `--fid` `--step` `--attempt` `--reset` | Read a step's clamp records (the status row's clamped array), or reset the log. |
| `ledger-scan` | workflow | **`--terms`** **`--source`** **`--artifact`** `--log` `--fid` `--step` `--attempt` `--reset-log` | Write a ledger's lines matching query terms, strongest first, then clamp (ledger profile). |
| `diff` | workflow | **`--artifact`** `--base` `--log` `--fid` `--step` `--attempt` `--reset-log` | Write the run's diff ({base}...HEAD, docs/plans/** excluded) as one artifact — whole, or a per-file budget past the guard — and print its numbers. |
| `brief` | workflow | **`--plan`** `--group` `--next` **`--dir`** `--file` `--note-file` | Write one group's brief (why and what, where it fits, its open task blocks, the earlier tasks they depend on, the Reuse Inventory rows and Architecture entries for their files, deviations) as build-brief-{group}-{n}.md, and print only its path and sizes. |
| `list-blocks` | by hand | — | Enumerate the consumer's context-fetch blocks and narrate coverage per context. |
| `provision` | by hand | — | Run each context-fetch:provision recipe below bkit:end on its own and list the failed ones in .bkit/.unavailable. |
| `run-block` | workflow | **`--idx`** **`--script`** **`--fid`** **`--month`** `--attempt` `--file` | Run one customised block; write its output fenced (clamped first), its skip line, or nothing. |
| `fetch` | workflow | **`--idx`** **`--script`** **`--fid`** **`--month`** `--attempt` `--file` `--render` | run-block, with a JSON array of flat objects written as a markdown table; the raw output stays in the outbox. |
| `finalise` | workflow | **`--fid`** **`--month`** `--attempt` `--file` `--record` `--message` `--number` `--title` `--link-ref` `--owner-repo` | The context-fetch status row's fields: verdict, artifacts, contexts configured, clamped; --record writes and commits the row and prints the step comment. |

### `counters`

Attempt counters derived from status.jsonl, and the ask points' limits.

<!-- prettier-ignore -->
| Verb | Use | Flags | What it does |
| --- | --- | --- | --- |
| `derive` | workflow | **`--file`** **`--workflow`** **`--step`** `--group` **`--position`** `--all-runs` | Count a step's DONE rows in the active run, at one of three positions. |
| `run` | workflow | **`--file`** **`--workflow`** | Which run of the workflow this invocation is (1-based; a resume keeps its number). |
| `route` | workflow | **`--name`** `--value` `--of` `--rows` `--file` `--workflow` `--group` `--all-runs` `--max` `--point` `--continue` `--exceeded` | Compare a counter to its max: exit 0 continue, exit 1 exceeded; with --point, also whether to ask. |
| `max` | workflow | `--point` | The ask points' limits and ask settings: one by --point, or all. |
| `progress` | workflow | **`--file`** **`--workflow`** **`--check`** **`--fix`** `--group` | Progress report for a fix loop in the active run: counts per round, code change, strategy, trend. |
| `rows` | workflow | **`--file`** **`--workflow`** **`--type`** **`--position`** | Count rows of one audit type in the active run (since its workflow-started row). |

### `decisions`

Build decision files: write questions, apply recommendations, list assumed items.

<!-- prettier-ignore -->
| Verb | Use | Flags | What it does |
| --- | --- | --- | --- |
| `compose` | workflow | **`--out`** `--header` `--items` `--loop` `--file` `--group` `--attempt` `--max` | Write a decision file in the one question layout, with loop progress when asked. |
| `apply` | workflow | **`--file`** **`--by`** `--q` `--confirm` `--reject` `--reason` `--root` | Settle a decision file's items: --by=headless takes each recommendation; --by=owner confirms or rejects one assumed item. |
| `pending` | workflow | **`--fid`** **`--month`** `--root` `--defer` | List the feature's assumed Accepts nobody confirmed; --defer writes one needs-decision deferral per item. |

### `disk`

Free disk with your own cleanup steps; bkit itself deletes nothing.

<!-- prettier-ignore -->
| Verb | Use | Flags | What it does |
| --- | --- | --- | --- |
| `prune` | by hand | **`--mode`** `--dry-run` `--auto` | Run the min or max steps from scripts/cleanup/bkit-disk-prune.mjs and ~/.config/bkit/disk-prune.mjs. |

### `fids`

Feature-id format per tracker; the issue, FID, plan files and plan inputs Step 1 resolves; FID recovery from a branch or PR-body marker.

<!-- prettier-ignore -->
| Verb | Use | Flags | What it does |
| --- | --- | --- | --- |
| `check` | by hand | **`--fid`** `--tracker` `--issue` | Validate a FID for the tracker: exit 0 valid, exit 1 not. |
| `parse` | by hand | `--prompt-file` `--marker` `--branch` `--tracker` | --prompt-file: the issue and the FID a session prompt names. --marker / --branch: recover FID and issue id, the PR-body marker first, then a feat/{FID} branch (any slug; its issue id counts only when .bkit/issues.jsonl has a feature row for it, else the run is issue-less). |
| `resolve` | workflow | **`--prompt-file`** `--issue` `--title-file` **`--workflow`** `--tracker` | The run's FID, first hit wins: a FID the prompt names, the feat/{FID} branch, a FID logged for the issue on dev, a mint from the title (or prompt), a free -b, -c, ... suffix when a finished run used the mint; then the format check (exit 0 resolved, exit 1 fails the check). |
| `plans` | by hand | **`--fid`** **`--month`** | A feature's plan in a month bucket: docs/plans/{YYYYMM}/{FID}-plan.md, or none. |
| `design` | by hand | **`--fid`** `--month` `--description-file` `--prompt-file` | The plan's parent design: the **Parent design:** link in the description or prompt, else the feature's own docs/plans/{YYYYMM}/{FID}-design.md; plus the audit reports and the **Workstreams:** ids they name (exit 0 a parent, exit 1 none). |
| `find` | by hand | **`--issue`** | The feature already logged for an issue: exit 0 one, exit 1 none, exit 4 several. |

### `issues`

Tracker payloads (issue text, label transitions, comments); --post / --write send them.

<!-- prettier-ignore -->
| Verb | Use | Flags | What it does |
| --- | --- | --- | --- |
| `text` | workflow | `--description-file` `--comments-file` | ISSUE_TEXT: description + human comments, after the bkit:ignore-earlier cut. |
| `fetch` | by hand | `--fid` `--issue` `--session-dir` `--outbox` | Read the run's issue into issue-description.md, issue-comments.json and issue-facts.json; prints the facts, never the body. |
| `related` | workflow | **`--hits-file`** **`--out`** `--top` `--fid` `--issue` | Fetch each hit of the orchestrator's related-issue search and write the related-issues file. |
| `blocked-by` | by hand | `--fid` `--issue` | The issues blocking the run's issue, with their states and the ones still open. |
| `labels` | workflow | `--label` `--phase` `--failed` `--board` `--issue` `--owner-repo` `--write` `--fid` | Label arithmetic for a transition, the tracker state, and the board payload. |
| `comment` | workflow | `--kind` `--audit-slug` `--step-number` `--step-title` `--workflow` `--workflow-heading` `--verdict` `--failures` `--scope` `--group` `--group-count` `--attempt` `--strategy` `--field` `--owner-repo` `--tree` `--pr-number` `--pr-url` `--run-id` `--artifact` `--ref` `--line` `--body-file` `--section` `--sub-step` `--error` `--error-file` `--stderr-file` `--post` `--fid` `--issue` `--file` | The exact body of a ###### bkit:generated step, failure, handover, or audit comment. |

### `ledgers`

Stage and commit bookkeeping by allow-list; union ledgers; check a range is bookkeeping only; compact keyed ledgers.

<!-- prettier-ignore -->
| Verb | Use | Flags | What it does |
| --- | --- | --- | --- |
| `commit` | workflow | `--root` **`--month`** **`--fid`** `--scope` **`--mode`** `--stage-tracked-updates` `--path` `--squash-of` `--only-if-dirty-tracked` `--message` | Stage (and commit) the bookkeeping allow-list for one feature. |
| `union` | workflow | **`--src`** **`--dst`** | Append a worktree's new ledger rows into another checkout (never .bkit/issues.jsonl). |
| `only-bookkeeping` | by hand | `--root` **`--month`** **`--fid`** **`--from`** **`--to`** | Exit 0 when every path changed in from..to is on the --scope=pr allow-list. |
| `append` | by hand | `--root` **`--ledger`** **`--rows`** | Append validated rows to one ledger, minting each row's ts at append time. |
| `triage` | workflow | `--root` **`--fid`** **`--plan`** | Bucket each deferral row the FID declared by the four Deferral Reason tests, and write the unjustified ones. |
| `check` | by hand | `--root` **`--plan`** | Check that every decision / deferral key on a plan's `**Ledger rows:**` line is on disk. |
| `compact` | by hand | `--root` `--ledger` `--dry-run` | Rewrite keyed ledgers to their fold winners, stamping each winner's firstTs + updates. |

### `locks`

Acquire and release the per-feature workflow lock.

<!-- prettier-ignore -->
| Verb | Use | Flags | What it does |
| --- | --- | --- | --- |
| `acquire` | workflow | **`--kind`** **`--workflow`** **`--fid`** `--month` | Take the workflow lock, reclaiming a dead holder's. |
| `release` | workflow | **`--kind`** **`--workflow`** **`--fid`** `--month` `--token` | Remove a lock this caller owns (and the feature's shared-checkout record); another owner's lock is left in place. |

### `plans`

Parse the organised design's suggested plans and workstreams and build the advisory comment.

<!-- prettier-ignore -->
| Verb | Use | Flags | What it does |
| --- | --- | --- | --- |
| `parse` | by hand | **`--artifact`** | List each P-{N} with its name, Covers and Requires; one plan per workstream when the design has no Suggested Plans. |
| `comment` | workflow | **`--artifact`** **`--fid`** **`--month`** **`--owner-repo`** | The Step 11 comment body for the feature's own issue (posted via MCP by the workflow). |

### `prs`

Open and probe pull requests, and audit the close transport.

<!-- prettier-ignore -->
| Verb | Use | Flags | What it does |
| --- | --- | --- | --- |
| `open` | workflow | **`--fid`** **`--title`** `--issue` `--base` `--head` `--plan` `--note` `--existing` `--file` `--workflow` | Open a PR whose body carries the bkit:issue / bkit:fid marker (exit 80: use MCP). |
| `probe` | by hand | `--head` `--base` `--state` `--number` | The open (or open-then-merged) PR for a branch, or one PR by number. |
| `merge` | workflow | **`--number`** `--subject` `--match-head` `--delete-branch` `--label` `--expect-merged` | Squash-merge a PR with an empty body (skipped when already MERGED) and read its state back. |
| `update-branch` | workflow | **`--number`** `--only-if-required` | Refresh a PR's head from its base server-side (exit 80: use update_pull_request_branch). |
| `checks` | by hand | **`--number`** | A PR's check rollup, classified: green when present and none failed or pending (exit 80: use MCP). |
| `verbose-ci` | workflow | **`--number`** **`--state`** | Add ` bkit [verbose ci]` to a PR title, or strip it (with an optional `bkit ` prefix); a no-op when already so. |
| `scan-body` | by hand | **`--sha`** `--remote-ref` | Check a landed commit's body (not its subject) for a CI-suppressing token. |
| `cross-check` | workflow | **`--file`** **`--transport`** | An mcp close with gh recorded unavailable must have a transport-fallback row. |
| `transport-row` | workflow | **`--file`** **`--kind`** `--from` `--to` `--reason` `--asserted-by` `--shape` `--sha` `--scan-result` `--scan` `--remote-ref` `--cross-check` | Append a transport-fallback or close-transport audit row to status.jsonl. |

### `repo`

Repo facts for Step 1: owner/repo, current branch, and how far it trails dev.

<!-- prettier-ignore -->
| Verb | Use | Flags | What it does |
| --- | --- | --- | --- |
| `info` | by hand | `--fetch` `--allow-detached` | owner/repo (gh, else the origin remote), the current branch, and commits behind origin/dev. |
| `preflight` | by hand | `--owner-repo` | Advisory: whether gh can read the repo's Actions permissions (dispatch may 403 without them). |

### `roadmap`

Re-render docs/roadmap.md's generated region from .bkit/issues.jsonl (fail-open).

<!-- prettier-ignore -->
| Verb | Use | Flags | What it does |
| --- | --- | --- | --- |
| `fold` | by hand | `--root` | Rewrite the status tables; carry notes, analysis and the consumer's head through. |
| `feature` | workflow | `--root` `--workflow` `--fid` `--status` `--step` `--row` `--strict` | Append the feature's roadmap row to .bkit/issues.jsonl, then re-render the board (fail-open). |
| `mirror` | workflow | **`--workflow`** **`--fid`** | Build / debug close: append the feature row in the worktree, then land the same row on dev through a throwaway origin/dev checkout (fail-open). |

### `runs`

CI runs: wait for one, prove one was dispatched, re-validate and gate a merge on one; auto's start context.

<!-- prettier-ignore -->
| Verb | Use | Flags | What it does |
| --- | --- | --- | --- |
| `wait` | by hand | `--pr` `--head` `--branch` `--until` `--budget-s` `--interval-s` `--once` `--dispatch-if-absent` | Bounded poll for a CI check on a PR (--pr) or a CI run at a head (--head --branch), present or completed. |
| `dispatch` | workflow | `--pr` `--sha` **`--fid`** `--label` `--file` `--workflow` `--step` `--artifact` `--field` `--budget-s` `--interval-s` `--poll-result` `--attempts` `--all-errored` `--retriggered` | CI-Dispatch Gate after the last push: poll, one clean re-trigger, the ciDispatch verdict, and the body scan. A run in place on dev has no PR: it polls the push-event run at the pushed sha, and its re-trigger commits and pushes only the run's own work. |
| `gate` | workflow | `--head` `--pr` `--squash-of` `--snapshot` `--record` `--validated` `--month` `--fid` `--repo` `--branch` `--fetch` `--event` `--file` `--capstone-only` | Ship merge gate: the capstone job present and green at the head (exit 0), or why not. |
| `revalidate` | workflow | **`--pr`** **`--entry-head`** **`--code-head`** **`--branch`** **`--month`** **`--fid`** **`--file`** `--reason` `--repo` | Ship: pick the head CI must pass at, probe for a run there, dispatch only when none, wait for it to complete. |
| `mirror` | workflow | **`--head`** `--branch` `--repo` `--ci-workflow` `--capstone` `--absent-minutes` `--max-minutes` `--interval-s` | Release PR: wait for the branch's push run at the head and copy its capstone verdict. |
| `context` | workflow | **`--phase`** **`--arg`** `--marker` | /bkit-auto Step 1: the phase and mode, the repo, and the issue / FID / PR / run the dispatch carries. |
| `declared` | by hand | — | Whether the repo declares a CI workflow: .github/workflows/<bkit.testing.ciWorkflow> exists (exit 0) or not (exit 1). |

### `runtime`

Detect the runtime and its default capabilities; write and read the runtime-resolved row.

<!-- prettier-ignore -->
| Verb | Use | Flags | What it does |
| --- | --- | --- | --- |
| `detect` | by hand | **`--fid`** | Classify the runtime, its default capabilities, gh auth, and the worktree path. |
| `row` | workflow | **`--workflow`** `--base-sha` `--file` | Detect, then build the runtime-resolved row (and append it with --file). |
| `assert` | workflow | **`--file`** `--workflow` | Read back the latest runtime-resolved row and fail unless every field is resolved. |

### `setup`

One-off repository setup an operator runs.

<!-- prettier-ignore -->
| Verb | Use | Flags | What it does |
| --- | --- | --- | --- |
| `protect-main` | by hand | `--dry-run` `--print` | Apply bkit's branch protection to main, requiring the capstone check. |

### `skills`

Prune feature-specific skills before ship merges.

<!-- prettier-ignore -->
| Verb | Use | Flags | What it does |
| --- | --- | --- | --- |
| `prune` | workflow | — | Uninstall every non-bkit skill .agents/skills.md does not list (ship Step 7). |

### `status`

Read and annotate a workflow's status.jsonl.

<!-- prettier-ignore -->
| Verb | Use | Flags | What it does |
| --- | --- | --- | --- |
| `path` | by hand | **`--workflow`** **`--fid`** **`--month`** | Where this workflow's status.jsonl lives. |
| `route` | workflow | `--file` **`--workflow`** `--step` `--group` `--require` `--expect` `--prompt-file` `--fid` `--month` | Routing state: last verdict / failures / strategy of a step, debug and push mode; with --prompt-file, debug's start decisions. |
| `resume` | by hand | **`--file`** **`--workflow`** | The step a stopped run continues at: after its last DONE step, setup steps and retired rows aside. |
| `meta` | workflow | **`--file`** **`--workflow`** `--debug-mode` `--push-mode` `--debug-attempt` `--opened-pr` | Append a workflow-meta row (run-level routing state). |
| `row` | workflow | **`--file`** **`--workflow`** **`--type`** `--field` | Append a typed audit row the fold does not model (ship's gate refusals, CI probes, merge CI). |

### `steps`

Write a step's status row, finish a step in one call, read a verdict header, check a gate, seed an artifact header.

<!-- prettier-ignore -->
| Verb | Use | Flags | What it does |
| --- | --- | --- | --- |
| `done` | workflow | **`--file`** **`--workflow`** **`--step`** `--status` `--verdict` `--agent` `--allowed` `--failures` `--attempt` `--group` `--strategy` `--artifact` `--field` `--parent-sha` `--commit` `--message` | Append a step-done row and commit it (parentSha captured first). |
| `finish` | workflow | **`--file`** **`--workflow`** **`--step`** `--artifact` `--optional-artifact` `--agent` `--verdict` `--allowed` `--failures` `--attempt` `--attempt-of` `--count-field` `--group` `--strategy` `--scope` `--field` `--clamp-log` `--docs-only` `--parent-sha` `--commit` `--message` `--done-fallback` `--verbose-ci-local` `--number` `--title` `--post` `--group-count` `--link-ref` `--tree` `--owner-repo` `--comment-body` `--comment-field` | End a step: read the verdict header(s), derive the attempt, check the gate, write the row, commit, print the tracker comment. |
| `verdict` | by hand | **`--file`** `--agent` `--allowed` `--field` | Read an artifact's header down to <!-- verdict:end -->. |
| `gate` | workflow | `--file` `--ref` **`--workflow`** **`--step`** `--group` `--attempt` `--attempt-of` `--artifact` `--verdict-required` `--agent` `--allowed` `--placeholder` `--fid` `--issue` `--month` `--token` | Mechanical gate checks for one step: placeholders, FID, lock, artifacts, verdict, status row (with its attempt / strategy / scope where the step writes them). |
| `stub` | workflow | **`--from`** **`--to`** `--strip-header` | Seed a versioned artifact: copy the prior version, then put a PENDING verdict header on top. |

### `tasks`

Tick a plan's task boxes, from the tasks a verify judged satisfied.

<!-- prettier-ignore -->
| Verb | Use | Flags | What it does |
| --- | --- | --- | --- |
| `tick` | workflow | **`--plan`** **`--group`** `--tasks` `--green` | Tick the named tasks of one task group, less those a `tests green` report gaps; exit 0 ticked (including none), 1 a plan with no task blocks, 2 a bad flag value or plan. |
| `open` | by hand | **`--plan`** **`--group`** **`--log`** | Print the group's tasks holding neither a `DONE` nor a `BLOCKED` line in the plan-execute log, and whether any is open; exit 0 (including none), 1 a plan with no task blocks, 2 a missing file or group. |
| `currency` | by hand | **`--plan`** `--base` `--against` | Print each task whose CREATE / READ / UPDATE / DELETE paths or symbols moved between --base and --against, with its matched paths, needles and diff hunks; exit 0 (including no match), 1 a plan with no task blocks, 2 a bad plan. |

### `tests`

Run the deepest declared local gate, or one test file to record a red and audit a green.

<!-- prettier-ignore -->
| Verb | Use | Flags | What it does |
| --- | --- | --- | --- |
| `run` | by hand | **`--gate`** **`--log`** `--tail` `--artifact` `--fid` `--step` `--attempt` | Run the first declared --gate; exit 0 PASS, 1 FAIL, 4 could not run. |
| `red` | workflow | **`--file`** **`--workflow`** `--group` **`--task`** **`--test`** **`--name`** **`--log`** | Lint a task's new test with bkit:lint:file when declared, then run it before its code exists; exit 0 red recorded, 1 not a red (the test failed lint, or the named test did not run, passed, or was skipped). |
| `green` | workflow | **`--file`** **`--workflow`** `--group` **`--plan`** **`--log`** | Audit a plan's test-first evidence (a red per TEST FIRST test recorded before the task's code commit, or its red run already passing on another task's overlapping code; the test's own lines and the code it runs unchanged since; the named test passing now); exit 0 no gaps, 1 gaps or a plan with no task markers. |
| `plan-check` | by hand | **`--plan`** `--existence` **`--log`** | Check a plan's group and task blocks: the block format, DONE WHEN and TEST FIRST on every task, DEPENDS ON order, the caps from package.json `bkit.workflows.tasks` (defaults: 3 tasks and 15 TEST FIRST tests per group; 10 tests across 3 test files per task), a Reuse Inventory NEW row per CREATE file, a Supersession Inventory row per DELETE, a `Task` on every Derived Test Matrix row and a row per test-bearing task, and that each READ / UPDATE / DELETE file and symbol exists; exit 0 no problems, 1 refused. |

### `workflows`

Start, fail, hand over, summarize and close a phase workflow run; promote and link its documents.

<!-- prettier-ignore -->
| Verb | Use | Flags | What it does |
| --- | --- | --- | --- |
| `start` | workflow | **`--workflow`** **`--fid`** `--month` `--file` `--lock-held` `--token` `--branch` | Take the feature lock and open a run (workflow-started unless resuming). |
| `fail` | workflow | **`--workflow`** `--fid` `--month` `--file` `--token` `--max-exceeded` `--label` `--pr` `--step-number` `--step-title` `--sub-step` `--error-file` `--error` `--stderr-file` `--post` `--issue` `--session-dir` | Failure Path: workflow-failed row, abort rebase, release lock, clear sentinels (with --token); the bkit:failed labels and the failure comment. |
| `handover` | workflow | **`--workflow`** **`--fid`** `--month` `--push` `--flush` `--open-pr` `--ref` `--list-stray` `--worktree` `--owner-repo` `--post` | Keep a failed run's record: commit and push it on the feature branch, or land its logs and ledgers on dev (--push from dev / main, ship's --flush); print the handover comment. |
| `close` | workflow | **`--workflow`** **`--fid`** `--month` `--file` `--pr-number` `--squash-sha` `--ref` `--owner-repo` `--outbox` `--record-step` `--message` `--label` `--verbose-ci-local` `--number` `--title` `--post` `--tree` `--flush` `--token` `--branch` `--session-dir` `--final-return` `--summary-file` `--summary` `--summary-missing` `--warning` `--line` `--suggest` | Grade compliance, workflow-done row, counter + outcome telemetry, report, artifact links; --flush lands ship's close on dev. |
| `input` | workflow | **`--workflow`** **`--fid`** `--month` `--file` **`--run`** **`--prompt-file`** `--description-file` `--comments-file` `--plan` `--design` `--audit` | Write logs/{FID}/{workflow}-input-{run}.md: the session prompt, the issue description and each human comment, then the plan, design and audit reports, each section dated. |
| `promote` | workflow | **`--workflow`** **`--fid`** `--month` `--file` `--resolve` | Design / plan close: the highest versioned draft becomes the canonical doc (anchor stamped, a changed canonical archived). |
| `links` | workflow | **`--workflow`** **`--fid`** `--month` `--ref` `--owner-repo` `--outbox` `--number` `--title` `--post` | The feature's docs and this workflow's logs on a ref as markdown links; optionally the close comment. |
| `summary` | workflow | **`--workflow`** **`--file`** `--plan` `--pr` | The Summary step: write {workflow}-summary.md next to --file with the run's verdict, reasons and next command. |

### `worktrees`

Set up and remove the per-feature worktrees under .worktrees/.

<!-- prettier-ignore -->
| Verb | Use | Flags | What it does |
| --- | --- | --- | --- |
| `setup` | workflow | **`--workflow`** **`--fid`** **`--month`** `--worktrees` `--detect` `--branch` `--issue` | Create, resume or adopt the feature's worktree (Step 2 — Worktree Setup). |
| `remove` | workflow | **`--fid`** `--branch` | Remove .worktrees/{fid} when a workflow created it, prune stale entries, and delete the feature branch. |

<!-- cli:end -->
