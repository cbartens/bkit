## Session Prompt — this run's, newer than everything below

Run design

ARGUMENTS: #719

## Issue description — oldest

### Problem

`bkit install --auto=<variant>` turns on cloud agents. Codex is not a variant, and each variant only installs with one tracker:

<!-- prettier-ignore -->
| Where | What it does |
| --- | --- |
| `.bkit/core/engine/install/manifest.ts:104` | `CLOUD_MODES` is `["claude","cursor","opencode","none"]`, so `--auto=codex` is rejected and `bkit.cloud.agent` cannot record codex |
| `.bkit/core/engine/commands/install/install.ts:123-138` (`validateCloudTrackerMatch`, exit at `:400`) | hard-fails unless claude/opencode run with the GitHub tracker or cursor runs with Linear |
| `.bkit/templates/.github/workflows/bkit-cloud.yml:188-192` | the router no-ops whenever `bkit.tracker.default` is not `github` |
| `.bkit/templates/.github/workflows/bkit-cloud.yml:341,424` | the `bkit:auto` opt-in and kill-switch checks read labels with `gh issue view`, so a Linear or Jira issue always reads as not opted in |
| `.bkit/core/engine/install/modules/cloud.ts:76-189` (`runCloudModule`) | each variant's setup advisories hard-code one tracker; no codex branch |
| `.bkit/cloud.md:6,22,52` | the support matrix pairs each agent with one tracker |

What is already tracker-independent: the cloud environments and generated `<host>/bkit-cloud.md` docs (#717); the agent's brief, read through bkit's tracker verbs (GitHub, Linear, Jira); the router's FID parsing, which accepts Linear-shaped FIDs (decision `cloud-dev-fid-regex-accepts-linear-shape`). The router's triggers (CI completion on GitHub Actions, `workflow_dispatch` with an issue id) do not depend on the tracker.

### Outcome

- `--auto=codex` is a valid cloud variant, recorded in `bkit.cloud.agent`, with its own setup advisories, the same way `--auto=claude` works.
- Every cloud variant (`claude`, `cursor`, `opencode`, `codex`) installs with any tracker (`github`, `linear`, `jira`). No variant-to-tracker hard error remains.
- `bkit-cloud.yml` runs for any tracker: the opt-in and kill-switch label checks go through a bkit tracker verb instead of `gh issue view`, and the `github`-only no-op is removed.
- `bkit-cloud.yml` gains a `codex` job beside `claude` and `opencode`, running `openai/codex-action@v1`, gated on its credential the same way the other two are.
- Each variant's advisories tell the consumer what to set for the tracker they actually use.

### Success criteria

- `bkit install --auto=codex` succeeds and records `bkit.cloud.agent: "codex"`.
- Every `--auto={claude,cursor,opencode,codex}` installs under `--tracker=github`, `--tracker=linear` and `--tracker=jira` without a hard error.
- With `bkit.tracker.default` set to `linear` or `jira`, a CI completion on a `feat/**` branch whose issue carries `bkit:auto` in that tracker dispatches the configured agent jobs; removing the label stops the next run (kill switch).
- The `codex` job runs only when its credential is set, and skips with zero billable minutes otherwise.
- No advisory printed for a variant names a tracker other than the configured one.
- `.bkit/cloud.md` support matrix lists each variant once, with no tracker pairing.
- DE-21 point 3 (`docs/decisions.jsonl`, key `de-21-141-bkit-cloud-rebuilt-on-the-claude-github-app`) is marked superseded by a new decision recording any-agent-any-tracker; `install.test.ts` tests citing it are rewritten to the new rule.

### Constraints and non-goals

- Builds on #717 (done) for `.codex/bkit-cloud.md` and the tracker-agnostic env blocks.
- The router runs on GitHub Actions, so the code host stays GitHub for every tracker.
- No new tracker values; marker contract (`.bkit/trackers.md` § Marker contract) untouched.
- Vendor-native triggers (Cursor's Linear integration, Codex for Linear, `@claude` / `@cursor` / `@Codex` mentions) stay vendor-managed; bkit documents them but does not install them.

### Decisions already made

- `--auto=codex` behaves like `--auto=claude`.
- Any cloud variant works with any tracker (Christian, 2026-10-29). This supersedes DE-21 point 3.
- The router reads the opt-in label through bkit's tracker verbs rather than gaining per-tracker API code of its own.

### Open questions

1. Which bkit verb does the router call for the label check? `bkit issues labels` computes label transitions; is there a read verb that returns an issue's current labels for every tracker, or does one need adding?
2. How does the router get the tracker credential on the runner (`BKIT_LINEAR_API_KEY` / `BKIT_JIRA_API_KEY` as repo secrets), and what do the advisories tell the consumer to set?
3. Cursor + GitHub: does Cursor's own documentation support starting a cloud agent from a GitHub issue (`@cursor`) or from its API, so `bkit-cloud.yml` can dispatch it? Only third-party write-ups say so today. If not, Cursor + GitHub/Jira is "launch manually" in the matrix rather than a hard error.
4. Should `--auto=codex` require the codex host (`--codex`) first, like `--auto=opencode` requires `.opencode/` (`install.ts:403-412`)?
5. Does removing the hard error need a `docs/migrations.md` row? Existing installs keep a valid recorded state; a consumer's copied `bkit-cloud.yml` (copy-and-own template) does not pick up the router change by itself.

### References

- #717 — Codex cloud doc + tracker-agnostic cloud docs (https://github.com/cbartens/bkit/issues/717)
- #141 / DE-21 — bkit-cloud rebuilt on the Claude GitHub App (https://github.com/cbartens/bkit/issues/141)
- `.bkit/core/engine/install/manifest.ts:85-113`
- `.bkit/core/engine/commands/install/install.ts:114-138,386-413`
- `.bkit/core/engine/install/modules/cloud.ts:55-189`
- `.bkit/templates/.github/workflows/bkit-cloud.yml:188-192,341,424`
- `.bkit/cloud.md:6,22,52`
- Codex GitHub Action: https://developers.openai.com/codex/github-action
- Codex autofix CI on `workflow_run`: https://developers.openai.com/codex/guides/autofix-ci
- Codex in Linear: https://developers.openai.com/codex/integrations/linear

###### bkit:blocked-by start

- #717

###### bkit:blocked-by end

## Issue comment — posted 2026-10-29T01:36:53.000Z

Narrowed the scope and rewrote the body; the title is now "Cloud variants: add --auto=codex on the GitHub tracker".

- **Decision (Christian, 2026-10-29):** the existing pairings stay as they are (Claude → GitHub, OpenCode → GitHub, Cursor → Linear), and Codex goes with GitHub. The "any variant with any tracker" outcome is gone. DE-21 point 3 gets updated to add codex → GitHub and stays active.
- Open questions that only applied to any-tracker are gone: how the router would read Linear labels, what Cursor + GitHub would look like, whether Jira is in scope, and whether a migration is needed. The two left are what `--auto=codex` routes to and whether it needs `--codex` installed first.
- Under review: whether we need the pairing at all. That is being checked now and may change this scope again.

## Issue comment — posted 2026-10-29T01:45:06.000Z

Scope changed again: every cloud agent now works with every tracker (Christian, 2026-10-29). This replaces the previous comment's "keep the pairings" decision. The title is back to "Cloud variants: add --auto=codex and allow any tracker".

**Why this works.** The cloud agents don't depend on the tracker. bkit's router (`bkit-cloud.yml`) starts on GitHub CI finishing, which every consumer has whatever their tracker. Only two parts of it are GitHub-only: the stop at `:188-192` when the tracker isn't GitHub, and the `bkit:auto` label checks at `:341` and `:424`, which use `gh issue view`. The body now has those checks go through a bkit tracker command instead. It also adds a `codex` job that runs `openai/codex-action@v1` (OpenAI's documented example is exactly this case: fixing CI failures after a run finishes).

**What's left open:** which bkit command the router calls to read labels, how the Linear or Jira key reaches the GitHub runner, whether Cursor's own docs support starting it from GitHub, whether `--auto=codex` needs `--codex` installed first, and whether a migration is needed. DE-21 point 3 gets marked as replaced by a new decision.

## Grill decisions — the owner's answers in this run, the newest text

Settled = the human's answer; the design follows it and flags any departure for the human to confirm. Assumed = unconfirmed default; override only with a stated reason. Open = unknown; the design states how it resolves each.

### Settled

- Q1 Unreadable label: when the router cannot read `bkit:auto` on a Linear / Jira issue (key missing, service down, issue not found) it starts no agent, logs why, and exits cleanly — same fail-closed behaviour as GitHub's `gh issue view` failure today.
- Q2 Tracker credential on the runner: repo secrets use the same names as `.envrc` (`BKIT_LINEAR_API_KEY`, `BKIT_JIRA_API_KEY` plus whatever Jira needs for site / user); advisories name exactly which to add.
- Q3 Cursor with GitHub / Jira: use Cursor's own triggers (`@cursor` on a GitHub issue / PR, its GitHub PR-event trigger); bkit documents them, adds no `cursor` job to `bkit-cloud.yml`, and only removes the refusal.
- Q4 Codex host prerequisite: `--auto=codex` refuses until `--codex` is installed, mirroring `--auto=opencode` → `.opencode/` (`install.ts:403-412`).
- Q5 Session-start guard: the preflight guard (today Linear-only, `.bkit/core/hooks/preflight-linear.sh`) checks `bkit:auto` and Done / Cancelled state on GitHub and Jira too, on every host whose hooks run in cloud sessions (Codex included if its hooks run in cloud tasks).
- Q6 Rollout to existing consumers: `docs/migrations.md` entry plus a `bkit upgrade` advisory telling consumers to merge the new `bkit-cloud.yml` (any-tracker kill switch + `codex` job) into their copy.
- Q7 Codex key name: the router's `codex` job gates on the `OPENAI_API_KEY` repo secret (vendor name, like `ANTHROPIC_API_KEY`).
- Q8 Codex job triggers: same events as the `claude` job — CI pass → ship, CI fail → debug, plus `workflow_dispatch` for any phase.
- Q9 Several agent keys set: every matching job starts on one CI event (additive, as claude + opencode today).
- Q10 Draft acceptance scenario: accepted.

### Assumed, not confirmed

None.

### Open

None.

### Draft Acceptance Scenario

> **DRAFT only:** reviewed in the design interview. Starting point for the design's Acceptance Scenario, not a fixed contract: the design may change any part, and records each change as a Decisions row.

#### Narrative

A team picks whichever cloud agent they like (Claude, opencode, Codex or Cursor) and whichever tracker they already use (GitHub, Linear or Jira). `bkit install --auto=<agent>` just works for that pairing, and from then on a passing or failing CI run on an opted-in feature hands the work to their agent exactly as it does today for Claude + GitHub. Removing `bkit:auto` from the issue stops it, on every tracker.

#### Success Criteria

1. Every `--auto={claude,opencode,codex,cursor}` × `--tracker={github,linear,jira}` install succeeds (codex also needs `--codex`).
2. Under Linear or Jira, a CI completion on an opted-in `feat/**` branch dispatches the configured router jobs (claude / opencode / codex); with the label removed, nothing dispatches.
3. When the router cannot read the label (key missing, service down), it starts no agent and logs why.
4. The session-start guard stops a cloud session whose issue lost `bkit:auto` or is Done / Cancelled, on GitHub, Linear and Jira.
5. Setup advisories and `.bkit/cloud.md` name only the configured tracker's keys; the matrix lists each agent once with no pairing; existing consumers get a migration entry and upgrade notice for the router.

#### Key Edge Cases

- Several runner keys set → claude, opencode and codex jobs all fire on one CI event; the existing workflow lock keeps runs from colliding.
- A consumer's copied `bkit-cloud.yml` is out of date → it keeps refusing non-GitHub trackers until they merge the change; the upgrade notice says so.
- Cursor started from `@cursor` on GitHub bypasses the router → only the session-start guard can stop it.
- Linear-shaped FID on the dev arm → the kill-switch read must target the tracker the FID belongs to.

#### Process Sketch

- WHEN CI finishes on an opted-in `feat/**` branch under Linear → THEN the router reads `bkit:auto` from Linear and starts each agent job whose key is set.
- WHEN the label is gone or cannot be read → THEN no agent starts and the run log says why.
- WHEN `bkit install --auto=codex` runs without the Codex host → THEN it refuses and names `--codex`.
- WHEN a Cursor session starts from `@cursor` on a GitHub issue without `bkit:auto` → THEN the session-start guard stops it.
- WHEN a consumer runs `bkit upgrade` → THEN they are told to merge the new router.
