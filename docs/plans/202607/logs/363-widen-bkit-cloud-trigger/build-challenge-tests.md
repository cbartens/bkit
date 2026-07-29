Verdict: PASS
<!-- verdict:end -->

# Build Challenge Testing

Added committed regression coverage for the highest-risk logic this build touched — the `bkit-cloud.yml` ctx-step bash (FID recovery, dev/fix/** routing, loop cap, stale-run guard, kill switch, fail-closed counter write) and the `bkit-ship.md` `AUTO_ROUTE_SUFFIX` handoff — closing the gap where build-challenge caught C1/H1/H2/M1 via manual dry-run harnesses instead of committed tests.

- **`.bkit/src/bkit-cloud-ctx-step.integration.test.ts` (new, 14 tests).** Extracts the REAL "Resolve phase + brief context" `run: |` block verbatim out of the rendered template (indentation-driven text extraction, no re-typed approximation) and spawns it via `bash` against a real git fixture (working repo + bare `origin`) with a stubbed `gh` (env-driven single stub script). Covers:
  - T3/T4 — dev-branch FID recovery from the squash-merge commit scope; success = no-op, failure = `phase=debug`.
  - T16 — Linear-shaped (`bar-123-slug`) commit scope is admitted by the FID regex (shape-tolerance).
  - T5 — `MAX_DEV_DISPATCH_ATTEMPTS` cap counts DISTINCT headSha values (3 same-SHA rows = 1 cycle, not capped; 3 distinct-SHA rows = capped, 4th dispatch no-ops with an operator-review notice and writes no 4th row).
  - **C1 regression** (CRITICAL, build-challenge): `fix/**` CI **success** no-ops instead of routing into `/bkit-ship` (which was structurally `feat/{FID}`-only and would fail an actually-green fix PR).
  - **T13/H1 regression** (HIGH): `fix/**` CI failure recovers the FULL FID slug from the branch fallback (not truncated to the leading numeric id) — asserted both via the dispatch output and by confirming the pre-H1 truncated-id directory (`docs/plans/*/logs/363/`) is never created.
  - T15 — `fix/**` failure loop shares ONE dispatch budget with the `dev` path for the same FID (seeded via the dev surface, consumed by the fix surface); `feat/**` failure is confirmed NOT subject to the cap.
  - **M1 regression** (MEDIUM): an unparseable `status.jsonl` (corrupt NDJSON line) now fails CLOSED (refuses to dispatch) instead of silently degrading `dev_count` to 0 and defeating the cap.
  - T17 — a counter write that cannot land on `origin/dev` (bare-repo `pre-receive` hook rejecting every push) fails closed: `skip=true`, no `phase`/`arg` emitted.
  - Kill switch (L1 regression): `bkit:auto-paused` does NOT satisfy the exact-match kill-switch check (would have under the pre-L1 substring `grep -q`).
  - Stale-run guard (Option A) + M6's `dev-dispatch-dropped` telemetry row on a stale/superseded run.
  - A malformed/non-conventional commit subject on `dev` fails safe (no-op, no crash).
  - Local-dev environment note: the ctx step's FID extraction relies on a GNU `sed` extension (`\w`); the harness transparently shims `sed` -> `gsed` when the native `sed` is BSD (macOS), so the suite exercises the same GNU-sed semantics the GH Actions (`ubuntu-latest`) runner uses in production — this is a test-harness portability shim, not a change to the shipped script.

- **`.bkit/src/bkit-ship-invariants.test.ts` (existing file extended, +3 tests, co-located with its established "build-challenge remediation regressions" `describe` convention).** Pins the **H2 regression** (HIGH, build-challenge): the first cut of the `bkit [auto route]` squash-marker threading read `${LABELS:-}` directly inside the Step 5 merge Bash block, but `{LABELS}` is an MCP-derived value captured several separate Bash-tool-call boundaries earlier at Step 1 and does not survive shell-state across those boundaries — `AUTO_ROUTE_SUFFIX` was always empty and the entire `dev`-trigger admission mechanism shipped inert. Asserts: (1) Step 1 materialises `AUTO_ROUTE_SUFFIX` into a `BKIT_AUTO_ROUTE_FILE` handoff via `$GITHUB_ENV` immediately adjacent to the `{LABELS}` read; (2) Step 5 reads the handoff file as the PRIMARY source (with a same-block `{LABELS}` re-check only as a gated fallback); (3) the squash `--subject` construction and the `AUTO_ROUTE_SUFFIX` derivation live in the SAME fenced Bash block (no cross-block variable reuse assumption).

All new/changed assertions run against the current (post-remediation) `bkit-cloud.yml` template and `bkit-ship.md` prose, so a future edit that reintroduces any of C1/H1/H2/M1/L1/M6 fails a test instead of requiring another challenge pass.

## Blockers

None.

## Bugs Discovered

- None beyond the C1/H1/H2/M1/L1/M6 findings already recorded and remediated in `build-challenge.md` / `build-challenge-remediate-log.md`, which this pass pins with committed regression tests.

## Verification Log

- `pnpm typecheck` — clean (`tsc --noEmit`, no errors).
- `pnpm test` (full suite, 76 files) — green (76/76, 2686 passed / 2 skipped / 1 todo) on the first and a repeated clean run. Two later runs, executed while this session was also running background/concurrent vitest invocations against the same repo, showed transient timeouts in **unrelated, pre-existing** integration tests (`bkit-workflow-telemetry-script.integration.test.ts`, `bkit-upgrade.integration.test.ts`) — real subprocess/filesystem-heavy tests that are resource-contention-sensitive under parallel load, not touched by this change. Isolated re-runs of ONLY the two new/modified files (`bkit-cloud-ctx-step.integration.test.ts`, `bkit-ship-invariants.test.ts`) passed cleanly and repeatably: 37/37 across two consecutive runs. Per process rule, failures in unrelated tests do not block this verdict.
- `npx prettier --check .` — clean after `--write` on the two new/modified test files and this log file.
- `npx slop-scan scan .` — 8 findings repo-wide (pre-existing hotspots in `.bkit/src/bkit-preflight.ts`, `bkit-templates-root.test.ts`, `bkit-postinstall.ts`, `bkit-uninstall.ts`, `bkit-modules.test.ts`); zero findings attributable to either new/modified test file.
