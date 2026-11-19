Verdict: PASS
Failures: 0
Fingerprint: 7907aae3b50c348786cc4b9d3d53c5904517bb3b62934a6be2888b80e9873acd
<!-- verdict:end -->

# Build Challenge

Lens: Security — auth, secrets, input validation, data exposure, OWASP, data-access policies / tenancy.

## Findings Log

None

## Scope

- Diff: `tmp/bkit-diff-1063-fix-loop-pause.md`, full coverage (no `partial diff coverage` line). Seven files: `.bkit/core/engine/commands/workflow/counters.ts`, `.bkit/core/engine/commands/workflow/counters.test.ts`, `dist/commands/workflow/counters.js`, `.bkit/core/.bkit/workflows.md`, `.bkit/workflows.md`, `.bkit/version`, `docs/testing.md`. The list equals `git diff $(git merge-base HEAD dev) HEAD` with `docs/plans` left out.
- Plan: `docs/plans/202611/1063-fix-loop-pause-plan.md`, tasks 1-3.
- Docs: `docs/security.md` (whole file), `.agents/docs.md`, `.bkit/workflows.md` § ask points, the `counters progress` field table and the `Loop question` bullet, `docs/data-schema.md` (status log row), `docs/architecture.md` and `docs/capabilities.md` (counters module). Code read for the consumer path: the `compose --loop` block of `.bkit/core/engine/commands/workflow/decisions.ts` and `runGit` in `.bkit/core/engine/commands/lib.ts`.

## Notes

- Authentication and authorisation: no change. `loopProgress` and `gateFailuresOf` count `status.jsonl` rows locally; the diff adds no token, session, permission or tracker call.
- Data-access control and tenancy: not applicable, because bkit has no database (`docs/security.md` § RLS). Row scoping is unchanged: `gateFailuresOf` still reads only the active run's rows for one workflow, step and attempt. The new `gateRanAnywhere` reads `activeDoneSteps(runs, workflow, { step: check, group })`, so it stays inside the active run and the one group.
- Input validation: the new code reads the same row fields as before (`failures` still `typeof`-checked, `verdict`, `scope`, `attempt`). The new `trendLine` sentence interpolates only the fixed words `ran` and `not run`, so no row text reaches the decision file through it. In the gate-mixed case it replaces the different-scopes sentence that quotes `scope`, so less row text reaches the agent-read pause. Every new field access is optional-chained, so a malformed row cannot throw.
- Secrets: none added. The `.bkit/version` change is the content hash of `.bkit/workflows.md`, and it equals `shasum -a 256 .bkit/workflows.md`.
- Data exposure: the only new output is `?`, counts, and `ran` / `not run`. No personal data, path or id is added.
- Gate stays fail-closed: the new `clean` in `loopProgress` is never looser than the old one. Before, a missing gate row read as 0, so a clean verify with no gate row was clean. Now, a gate row must count 0. With no gate row, a round is clean only when the gate ran in no round of the active run, which is the old result. A `sinceClean` loop can no longer close on a gate that did not run, and no path newly treats a red or missing gate as passing. `gateCounts` prints `0` only for a row that ran and counted 0.
- Unattended runs: `decisions.ts:428` maps every `recommend` other than `stop` to `Try again`, and `ask: false` or headless takes it. In the plan's issue shape a headless run therefore takes another fix round where it used to take `Decide`. That is bounded: rounds are capped at `maxAttempts x (1 + grants)`, `counters grant` refuses with `ask` false (`ask-off`), and a used-up limit with `ask` false goes to the Failure Path (`.bkit/workflows.md` § ask points). An `unknown` trend from different scopes already took this path before the diff. No unbounded paid-session loop, so no finding.
- Loops without a gate: every `gateRan` entry is false, so `firstIndex`, `gateMixed` and the trend reduce to the old same-scope rule.
- Supply chain: no dependency, lockfile, script or install-hook change. The `dist/commands/workflow/counters.js` hunks match the `counters.ts` hunks one for one, with no extra code in the shipped build.
- Cost: `gateRanAnywhere` re-reads `status.jsonl` for each round on each call, so the work grows with the square of the rounds. Rounds are capped by `maxAttempts`, so this is not a denial of service.
- Outside this diff: one input-handling observation in lines this diff leaves unchanged predates the change and is not a task here. It went to the caller for private triage, as `docs/security.md` § Public repo content requires for an unconfirmed weakness in a published version.
