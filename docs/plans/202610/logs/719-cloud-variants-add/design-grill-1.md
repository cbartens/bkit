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
