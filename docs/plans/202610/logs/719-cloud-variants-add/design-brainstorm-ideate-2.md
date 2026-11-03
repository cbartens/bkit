# Design Brainstorm & Ideas

Lens: Optimal-tradeoff — best long-term shape ignoring legacy constraints.

Grounding: the engine already has a `readLabels(target)` helper used by `bkit issues labels --write` (`.bkit/core/engine/commands/workflow/issues.ts:413`), and `bkit issues text` already returns `{title, url, state, labels}` facts (`issues.ts:736`). So a tracker-independent label read exists internally; only a small read-only verb surface is missing.

## Approach A — One read-only "opt-in gate" verb the router calls, plus one shared guard rule ⭐ Recommended

Add a single verb (for example `bkit issues gate <id>`) that reads the issue's labels and state through `readLabels` and exits 0 only when `bkit:auto` is present and the issue is not Done/Cancelled, exits non-zero with a one-line reason otherwise (key missing, service down, not found all map to "closed gate, reason printed"). The router's two `gh issue view` checks (`bkit-cloud.yml:341,424`) and the session-start guard (generalising `preflight-linear.sh`) both call this one verb, so the kill-switch rule lives in one place for every tracker and every host. The `github`-only no-op at `:188-192` is deleted. A `codex` job is added on `openai/codex-action@v1`, gated on `OPENAI_API_KEY`, cloned from the `claude` job triggers. `CLOUD_MODES` gains `codex`, `validateCloudTrackerMatch` is deleted, and `--auto=codex` refuses without `--codex`. Advisories are built from a per-agent table x the configured tracker, so they never name another tracker.

- Complexity: MEDIUM
- Extensibility: a new tracker or agent touches one table row and one verb implementation; the router and guards never change. Fail-closed is defined once.
- Risk: the runner needs the bkit CLI available (install step, a few seconds) plus the tracker secret; a mis-set secret silently closes the gate, so the log line must say exactly which secret is missing.
- Maintenance: low; one gate verb with tests per tracker, one advisory table.
- Friction vs ideal: adds a verb (surface: `issues.ts`, its help/test, docs for verbs); rewrites the `install.test.ts` tests citing DE-21 point 3; needs a new decision row, `docs/migrations.md` entry and upgrade advisory for the copied workflow. Small friction, close to the ideal.

## Approach B — Reuse existing `bkit issues text` and parse labels in shell

Keep the router thin and add no new verb: it runs `bkit issues text <id> --json`, pipes to `jq` for `.facts.labels`, and greps `bkit:auto`. The guard script does the same. Everything else matches A (codex job, enum change, advisory table).

- Complexity: LOW
- Extensibility: fine for labels, but the "Done/Cancelled" and "unreadable means closed" rules get re-implemented in YAML and in each host's guard script, so three copies drift.
- Risk: `issues text` also fetches description and comments, so it is slower and its output shape is not a contract for gating; a format change breaks the kill switch silently into either always-open or always-closed.
- Maintenance: medium; the rule is duplicated, and any change to the fail-closed behaviour needs edits in several files.
- Friction vs ideal: least code now, no new verb; but the kill switch, the safety-critical piece, depends on an output meant for humans and briefs.

## Approach C — Router resolves tracker via a reusable composite action / script shipped in the template

Ship the gate as a small script or composite action alongside `bkit-cloud.yml` that talks to GitHub, Linear and Jira APIs directly (curl + jq), needing no bkit CLI install on the runner.

- Complexity: HIGH
- Extensibility: poor; per-tracker API code returns inside the template, which the issue explicitly decided against, and it duplicates `readLabels`.
- Risk: API drift in three places; a second source of truth for tracker semantics (state names, label markers).
- Maintenance: high; every tracker change lands twice (engine and template), and consumers must re-merge the template each time.
- Friction vs ideal: avoids a CLI install step on the runner, but contradicts the decision "router reads the label through bkit's tracker verbs". Only worth it if installing bkit on the runner proves too slow or heavy.

## Decisions

<!-- prettier-ignore -->
| Decided | Alternatives | Why |
| --- | --- | --- |
| One new read-only gate verb over `readLabels`, shared by router and session-start guard (A) | Parse `issues text` in shell (B); per-tracker API code in template (C) | Safety-critical kill switch defined once, fail-closed everywhere, matches the settled "tracker verbs, no per-tracker code in the router" decision. |
| Gate verb treats every read failure as closed and prints the reason (names the missing secret) | Fail open, or error out the whole run | Settled Q1; a clear reason line is what makes a mis-set secret debuggable. |
| Delete `validateCloudTrackerMatch` and the router's `github`-only no-op outright | Keep as warning | Settled outcome: no variant-to-tracker error remains; a warning would still imply pairing. |
| Advisories generated from agent table x configured tracker | Per-variant hard-coded text | Guarantees "no advisory names another tracker"; adding an agent is one row. |
| `codex` job cloned from `claude` job triggers, gated on `OPENAI_API_KEY`; `--auto=codex` requires `--codex` | Separate trigger set; no host prerequisite | Settled Q4, Q7, Q8. |
| Cursor gets no router job; only the refusal is removed and its native triggers are documented | Add `cursor` job | Settled Q3; the session-start guard is the only stop for `@cursor`, so guard coverage (Q5) matters most there. |
| Migration entry plus upgrade advisory for the copied `bkit-cloud.yml` | Silent change | Settled Q6; copy-and-own template does not update itself. |
