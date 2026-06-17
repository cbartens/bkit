Verdict: CONCERNS
Failures: 3

<!-- verdict:end -->

# Build Challenge

Lens: Security — auth, secrets, input validation, data exposure, OWASP, RLS/tenancy.

## Findings Log

### F1 — Suppressor deny-list omits GitHub's `***NO_CI***` token

- Severity: LOW (pre-existing pattern, non-blocking; not introduced by this PR)
- Class: mechanical
- Location: `.bkit/workflows/bkit-build.md:1243,1262`; `.bkit/workflows/bkit-debug.md:929,948,1048,1067`
- Scenario: GitHub honors SIX skip-CI tokens: `[skip ci]` `[ci skip]` `[no ci]` `[skip actions]` `[actions skip]` and `***NO_CI***`. The gate's clean/dirty grep covers only the first five. A pushed HEAD whose message contains `***NO_CI***` would be GitHub-suppressed (no run) yet classified by the gate as CLEAN → after poll timeout it falls to the self-heal/`no-ci` (logged pass) path instead of `unresolved(timeout-dirty)` → Failure Path. This is exactly the "suppressed HEAD slips to no-ci falsely" class the review targets. Exploitability is bounded: bkit's own commit subjects never emit `***NO_CI***`, and the same 5-token list is the established repo-wide prior art (existing HEAD-Subject Assertion at `.bkit/workflows.md:1001`, ship, debug create-pr all share it), so this is a latent corpus-wide gap, not a regression this PR introduces. Fix is consistent with copying existing phrasing as the plan mandated.
- Fix: add `|\*\*\*no_ci\*\*\*` (literal `***NO_CI***`, case-insensitive) to all suppressor deny-list greps repo-wide in a separate hardening change; or scope to the 3 new gate suppressor checks here. Keep `bkit [auto route]`/`[verbose ci]`/`[force build]` passing (they remain unaffected).

### F2 — Re-trigger push exit status unchecked → un-pushed HEAD can yield a false `no-ci`

- Severity: LOW (requires concurrent remote advance; guarded by "no concurrent bkit workflows" invariant)
- Class: mechanical
- Location: `.bkit/workflows/bkit-build.md:1251`; `.bkit/workflows/bkit-debug.md` (PR-mode + LOCAL-mode re-trigger push lines)
- Scenario: the self-heal re-trigger `git push --force-with-lease origin "$B"` has no exit-status guard. If the force-with-lease is rejected (remote advanced between the lease snapshot and push), the script still sets `PUSHED_HEAD` to the local (un-pushed) SHA and re-polls a HEAD GitHub never received → poll exhausts → concludes `no-ci` (logged pass) for a HEAD that was never on the remote. The original final push at `:1213` is likewise unguarded (pre-existing pattern), and the documented single-clone serialization makes a mid-gate remote advance unlikely.
- Fix: guard the re-trigger push: `... || { CI_OUTCOME="unresolved"; CI_REASON="retrigger-push-failed"; }` and skip the re-poll when the push did not land, so a failed re-trigger routes to Failure Path rather than a silent `no-ci`.

### F3 — Debug on `dev`/`main` with `PUSH_MODE=LOCAL` runs no CI-Dispatch gate

- Severity: LOW (informational; out of documented 2-site scope, no abuse path)
- Class: architectural (mode-coverage, not a single-line fix)
- Location: `.bkit/workflows/bkit-debug.md:899-900` (gate guarded by `if [ "$PUSH_MODE" = "PR" ]`) vs `:985-988` (`CURRENT=dev|main → TRIGGER_PR=0` regardless of `PUSH_MODE`)
- Scenario: when `CURRENT=dev|main`, `TRIGGER_PR=0` so the sub-step-9 LOCAL gate is skipped; if `PUSH_MODE=LOCAL` the sub-step-3 PR-mode gate (`PUSH_MODE=PR`) is also skipped. The close-workflow commit is pushed directly to `dev` (fires CI) but no CI-Dispatch verification runs and only a plain `step-done` (no `ciDispatch`) is written. No `[skip ci]` is pushed and no extra trigger fires, so this is a verification-coverage gap, not a safety/D2 regression. The plan scopes the gate to feature-branch flows; debug-on-dev is an unusual operator mode.
- Fix: none required for this PR's scope. Optionally note the dev/main+LOCAL combination as an explicit "no gate (direct-to-dev)" case in the doctrine.
