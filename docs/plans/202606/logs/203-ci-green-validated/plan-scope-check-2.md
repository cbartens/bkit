Verdict: CONCERNS
Failures: 4

<!-- verdict:end -->

# Plan Scope Check

Lens: Scope, criteria, verification audit.

## CRITICAL

### C1 — Task A3a `Done when:` verification command is unreliable / unprovable

Task A3a's `Done when:` uses a `yq`-based shell snippet to extract `run:` bodies from
`.github/workflows/ci.yml` and pipe them through `bash -n`. The snippet contains a
`grep -v '^--$'` filter, but `yq` emitting multi-document separators for multi-element
arrays will produce one scalar per element separated by `---`, not `--`. The exact
`yq` output format depends on the installed `yq` version (mikefarah vs kislyuk differ).
The snippet as written would silently produce zero files to check if `yq` emits empty
output, making the verification trivially pass without actually validating any shell
bodies. The task description says "or the equivalent extraction the implementer
authors" — this escape hatch makes the `Done when:` non-binding. **A non-binding
verification criterion defeats the purpose of the gate.**

Fix required in plan: replace the yq-based snippet with a concrete, tool-agnostic
approach (e.g., extract via `python3 -c` + `yaml.safe_load`, or use `actionlint`'s
`-shellcheck` flag, or document `bash -n` extraction as a mandatory named helper
script at a fixed path that the agent must create and invoke).

---

### C2 — `bkit-ship-workflow.test.ts` does not exist; plan creates it as NEW but Task E2 `Done when:` cites it as if it already has a known Vitest filter name

The test file `.bkit/src/bkit-ship-workflow.test.ts` does not currently exist in the
repo (only `bkit-release-workflow.test.ts` is present). Task E2's `Done when:` requires
`pnpm test -- bkit-ship-workflow` to exit 0 with four named cases. This is correct for
a NEW file, but the task description says "OR extend `bkit-release-workflow.test.ts`"
as an alternative. If the agent chooses the extension path, the `Done when:` filter
`bkit-ship-workflow` will find zero tests and exit 0 vacuously — a false-green. **The
verification criterion must match the chosen host file, not be an either/or.**

Fix required in plan: remove the ambiguity. Either mandate the new file (and remove the
"OR extend" alternative), or mandate a test describe-block name that is stable across
both host files, and verify with `pnpm test -- <stable-filter>` rather than the
filename filter.

---

### C3 — Ordering provability gap: Task B4 (`--dry-run` pre-flight) runs BEFORE bkit's own `ci.yml` carries `bkit-tests-check:`

Task B4 asserts: `exit 0; output contains '"contexts": ["bkit-tests-check"]'; pre-flight
grep against .github/workflows/ci.yml passes`. The pre-flight grep in
`bkit-set-protection.sh` (current) checks `^[[:space:]]+${REQUIRED_JOB}:` in the CI
YAML. After Tasks A3 and B3, `REQUIRED_JOB` will be `bkit-tests-check` and bkit's own
`.github/workflows/ci.yml` will carry `bkit-tests-check:`. However, **Task A3 is in
Phase A, and Task B4 is in Phase B which states it "depends on Phase A landing
`bkit-tests-check` in both ci.yml files"**. If an agent executes tasks out of order or
skips A3, Task B4's pre-flight will fail. The plan's dependency statement is in the
Phase header prose, but there is no explicit `Done when:` guard in B4 that asserts A3
is complete first (e.g., `grep -c 'bkit-tests-check:' .github/workflows/ci.yml`
returns >= 1 as a precondition). This is a latent ordering trap.

Fix required in plan: add an explicit precondition check to Task B4's `Done when:` or
add an explicit task-order guard: "Verify `grep -c 'bkit-tests-check:' .github/workflows/ci.yml` returns >= 1 (A3 complete) before running `--dry-run`."

---

### C4 — Derived Test Matrix row for `bkit-decide` compat step (`Detect Direct Push`) maps ambiguously to two tasks (A2b and E1)

The Derived Test Matrix row "`bkit-decide` carries a step `name: Detect Direct Push`
so `detectRunLevelsNotComposed` preflight still fires; existing 11 tests in
`bkit-postinstall.test.ts` remain green" maps to Task A2b for verification. However,
the matrix instructions say "Each row → one Agent Execution Runbook task." Task A2b's
`Done when:` references `pnpm test -- bkit-postinstall` for the 11 existing tests, and
Task E1's `Done when:` references `pnpm test -- bkit-templates.content` for the new
content assertions. The plan's matrix-to-runbook mapping cross-references "A2b" and
"E1" separately. Strictly speaking, the matrix row covers (a) the compat step presence
in the TEMPLATE ci.yml and (b) the 11 existing tests — both. Task A2b covers only the
TEMPLATE; the BKIT-OWN ci.yml's `Detect Direct Push` compat step (A3) has no
corresponding matrix row verifying the 11 tests still pass after A3. This is a gap:
the integration test for `detectRunLevelsNotComposed` against bkit's OWN ci.yml shape
is not listed.

Fix required in plan: add a matrix row or extend Task A2b's `Done when:` to explicitly
cover bkit's OWN `.github/workflows/ci.yml` (A3 output) and run `pnpm test --
bkit-postinstall` against the post-A3 state.

---

## OPTIONAL

### O1 — Task A5 snapshot regen `Done when:` cannot be verified by a runner without manual eyeballing — gate is partially unverifiable by agent

Task A5 requires "a one-line human-acceptance note added to the commit message". The
`Done when:` condition includes a manual review step ("eyeball-review … confirm the
new 4-job shape is INTENTIONAL"). This is correct safety discipline, but the machine-
verifiable part (`pnpm test exits 0` + `git diff --stat shows non-zero diff`) does not
guarantee the human review happened. Consider adding a lightweight artefact: a YAML
comment in the snapshot file header, or a marker file at
`.bkit/src/__snapshots__/snapshot-reviewed-203.txt`, that the agent must create and
the human must sign off on via a gate checkbox — rather than relying on a commit
message convention that is invisible to automated assertion.

---

### O2 — Task A3a's self-CI shell-preview scope covers only `bkit-decide` and `bkit-tests-check` run bodies, but `bkit-tests` run bodies could also contain logic errors

The task scope says "Extract each `run: |` block, … run `bash -n` (POSIX syntax check)
on each" — but the task title and `Done when:` only name `.jobs.bkit-decide.steps` and
`.jobs.bkit-tests-check.steps`. The `bkit-tests` job body in bkit's own ci.yml also
contains shell (even in degenerate form). A logic error there (broken `case` arm) would
also wedge self-CI. Consider extending the snippet to all three jobs' step bodies.

---

### O3 — No explicit task verifies `bkit-tests-check` first appearance on CI (Manual Step 1) is gated until Phase F push

Manual Verification Step 1 ("Push the branch and open a PR; observe the next CI run
renders the new 4-job graph") is contingent on Phase F having pushed. Step 4 ("Run
`/bkit-ship` end-to-end … ONCE the new capstone has reported at least once") is also
contingent. Neither step has a `Done when:` or machine-verifiable criterion — they are
open-ended human observations. The plan acknowledges this ("depends on Phase F push
triggering CI") but provides no fallback if the CI run itself fails. This is expected
for manual verification steps but is worth noting as a risk: if the new bkit-own ci.yml
shape has an actionlint-invisible YAML error, Phase F push would immediately wedge
self-CI. The pre-push `bash -n` in A3a + actionlint in A4 partially mitigates this.

---

### O4 — Task E7 `Done when:` uses a nuanced regex that could be confused in execution

Task E7's `Done when:` includes: `grep -nE '`bkit-tests`' docs/pending.md` returns at
most the historical resolved entries (line 190-193 of the BAR-167 Phase 2 entry uses
`ci.yml` as a literal — preserve)`. The backtick-delimited pattern inside a shell grep
command is fragile (shell expands backticks as command substitution). An agent
copy-pasting this as a shell command would fail silently or produce wrong output. The
plan should use `grep -n 'bkit-tests[^-]' docs/pending.md` (or quote properly) as the
machine-verifiable form.

---

### O5 — `bkit-tests-check` existence in bkit's own `ci.yml` BEFORE Phase B's `--dry-run` pre-flight relies on Phase A being fully committed, but the plan uses a worktree — confirm no state confusion

Phase B Task B4 runs `bash scripts/ci/bkit-protect-main.sh --dry-run` which reads
`.github/workflows/ci.yml` from the REPO ROOT (not the worktree). Since this is
executing inside a worktree at `.worktrees/203-ci-green-validated`, the `ci.yml` path
`$CI_YML=".github/workflows/ci.yml"` resolves relative to the worktree's working
directory, which IS the worktree's root (the worktree shares `.git` with the main
clone but has its own file tree). This should be fine as long as the agent runs the
script from `WORKTREE_PATH`. No fix required — but worth noting the runner must `cd`
to the worktree before running B4, not to the main clone root.

---

## OUT OF SCOPE

- The plan's deferred operator action (flipping branch-protection on `cbartens/bkit`
  main to require `bkit-tests-check`) is correctly excluded from the runbook — it is
  a `docs/pending.md` entry only. No change needed.
- Migrating pre-existing `gh` CLI calls in `.bkit/workflows/bkit-ship.md` /
  `bkit-debug.md` to MCP is correctly out of scope. The plan explicitly limits MCP-
  only to NEW additions.
- Turbo affected-graph in bkit's own ci.yml (bkit is single-package) is correctly out
  of scope.
- Adding `bkit-tests-live` to bkit's own ci.yml (bkit has no deploy tier) is correctly
  out of scope.
- The `plan-table-v1` parity-matrix from gether #403 §C6 is correctly out of scope.
