Verdict: CONCERNS
Failures: 0

<!-- verdict:end -->

# Build Challenge

Lens: Bugs and edge cases — null safety, off-by-one, error paths, data integrity.

## Prior-pass verification (re-run)

- **Prior CRITICAL (fix/\*\* CI success routing to `/bkit-ship`) — GENUINELY FIXED.** `.bkit/templates/.github/workflows/bkit-cloud.yml:384-391` no-ops `fix/*` + `PHASE=ship` before the `gh pr list` lookup, in both jobs. Covered by a real spawned-bash regression test (`.bkit/src/bkit-cloud-ctx-step.integration.test.ts` "C1 regression"). No new bug in the fix itself — but the shipped header comment + `.bkit/cloud.md` routing table were NOT updated to match (see F3).
- **Prior HIGH (FID slug validation) — GENUINELY FIXED.** The allowlist `^([0-9]+|[a-z]+-[0-9]+)-[a-z0-9-]+$` is now enforced on the dev arm (`:316`), the PR-body marker path (`:412`), the post-fallback path (`:429`), and defensively inside `bkit_dev_dispatch_guard` (`:229`) before `$FID` reaches `find -path` / `mkdir -p` / `git commit -m`. `bkit-auto.md:103` asserts the same shape for CI_DEV. The full-slug retention change is correct and tested — but it introduced a new `set -e` abort path (F2).
- **Prior HIGH (dead `${LABELS:-}` read) — NOT GENUINELY FIXED.** The remediation replaced a dead shell read with a handoff whose transport (`$GITHUB_ENV`) does not cross a Bash-tool-call boundary, and left the identical dead read as the fallback. See F1 — this is the load-bearing gate for the whole feature.

## Findings Log

### F1 — HIGH — mechanical — `.bkit/workflows/bkit-ship.md:255-262` + `:686-700`

**`AUTO_ROUTE_SUFFIX` handoff cannot survive the Step 1 -> Step 5 boundary; the squash-merge marker is never threaded, so the entire #363 dev trigger ships inert.**

Exploit scenario: an operator ships a `bkit:auto` issue. Step 1 item 5 runs `echo "${LABELS:-}" | grep -q 'bkit:auto' && AUTO_ROUTE_SUFFIX=" bkit [auto route]"` in a Bash tool call — `LABELS` is an MCP-derived value never assigned _in that shell_, so it expands empty and the handoff file is written containing `""`. The path is then exported via `echo "BKIT_AUTO_ROUTE_FILE=..." >> "$GITHUB_ENV"`, but `$GITHUB_ENV` is applied by the Actions runner only _between steps_ — every agent Bash tool call in a cloud dispatch happens inside the single `claude-code-action` step, so no later call sees the variable; in a local IDE run `$GITHUB_ENV` is unset entirely and the redirect is swallowed by `2>/dev/null || true`. At Step 5 `${BKIT_AUTO_ROUTE_FILE:-}` is therefore empty, the `else` fallback fires, and it is the _exact dead read the prior pass flagged_ (`echo "${LABELS:-}"`). Net: `--subject` never carries `bkit [auto route]`, the job-level free-tier gate `contains(github.event.workflow_run.head_commit.message, 'bkit [auto route]')` (`bkit-cloud.yml:113`) never matches a `dev` push, and no dev-CI-failure dispatch can ever occur — while `CHANGELOG.md:13`, `docs/deployments.md:201` and `.bkit/cloud.md:450` all assert the feature works. The new regression test (`.bkit/src/bkit-ship-invariants.test.ts`, H2 describe) only asserts the _text shape_ (`>> "$GITHUB_ENV"` is present), so it passes on the broken mechanism — the "validate shipped config with the real tool, not string-presence" anti-pattern. The repo's own new KN row (`docs/knowledge.jsonl`, key `363-workflow-md-shell-var-does-not-survive-bash-tool-call-boundary`) names idiom (1) "re-derive the value in the SAME bash fence"; ship uses neither that nor a working transport.

Suggested fix: drop the cross-call handoff and re-derive inside the Step 5 merge fence with a call that needs no prior shell state, e.g. `AUTO_ROUTE_SUFFIX=""; gh issue view {ISSUE_ID} --json labels --jq '.labels[].name' 2>/dev/null | grep -qxF 'bkit:auto' && AUTO_ROUTE_SUFFIX=" bkit [auto route]" || true`. Replace the shape-only test with one that executes the fenced block against a `gh` stub and asserts the rendered `--subject` actually contains the marker.

### F2 — MEDIUM — mechanical — `.bkit/templates/.github/workflows/bkit-cloud.yml:427` (opencode mirror + `.github/workflows/bkit-cloud.yml` identical)

**Missing `|| true` makes the intended fail-safe no-op unreachable — the step aborts red instead.**

`ISSUE=$(printf '%s' "$FID" | grep -oE '^[0-9]+|^[a-z]+-[0-9]+' | head -1)` is the only derivation in the block without `|| true` (contrast `:314`, `:410`, `:411`, `:236`). Under the step's `set -euo pipefail`, a `$FID` with no numeric/alpha id — reachable whenever the PR body carries no `bkit:fid=` marker and the branch is e.g. `feat/add-oauth`, `fix/hotfix-login`, `fix/renovate-bump` — makes `grep` exit 1, `pipefail` propagates it, the assignment fails and `set -e` kills the step. Verified empirically: `set -euo pipefail; ISSUE=$(printf '%s' add-oauth | grep -oE '^[0-9]+|^[a-z]+-[0-9]+' | head -1)` exits 1 without reaching the next line. Consequence: the guard three lines below (`if [ -z "$FID" ] || [ -z "$ISSUE" ] ... "::notice::Cannot derive FID/ISSUE for branch $BRANCH — no-op exit (fail-safe)."`, `:429-433`) is dead code for the empty-`ISSUE` case, and a branch that should silently no-op instead produces a red `bkit-cloud` run on every CI completion.

Suggested fix: `... | head -1 || true)` in both jobs + both mirrors; add a ctx-step test with `BRANCH=feat/add-oauth`, `STUB_PR_BODY=""` asserting `status === 0` and `skip=true`.

### F3 — MEDIUM — mechanical — `.bkit/templates/.github/workflows/bkit-cloud.yml:17-18` and `.bkit/cloud.md:457`

**Shipped, consumer-facing docs promise `fix/**` green CI auto-merges; the shipped code deliberately no-ops it.**

The C1 remediation (`:384-391`) made `fix/**` + `success` exit with `::notice::fix/** CI passed — ship not wired for fix branches yet, no-op exit.`, but the workflow header a consumer reads in their own installed `.github/workflows/bkit-cloud.yml` still says `workflow_run (CI completion on fix/**): success -> ship, failure -> debug` / `(newly folded — fix-PR green CI now auto-merges via the cloud)`, and `.bkit/cloud.md`'s decision-log routing table still reads `| feat/** / fix/** CI (pre-merge, via pull_request) | -> ship | -> debug |`. Exploit scenario: an operator trusts the documented contract, leaves a green `fix/{FID}` PR unmerged expecting the cloud to merge it, and the fix silently never lands on `dev` — the same silent-stall class the widening exists to remove. (`docs/deployments.md` is clean — it documents only the `dev` row.)

Suggested fix: change both to `fix/**: success -> no-op (ship is not fix/**-aware — /bkit-ship Step 2 has feat/{FID} worktree arms only), failure -> debug (capped)`.

### F4 — MEDIUM — mechanical — `.bkit/templates/.github/workflows/bkit-cloud.yml:355-364`

**The M6 `dev-dispatch-dropped` telemetry is push-best-effort with no retry, so it is lost in exactly the scenario it exists for — while the operator warning points at it as durable evidence.**

The block commits the row on the job's start-of-run checkout of `dev` and runs `git push origin dev >/dev/null 2>&1 || true`. The branch is only reached when a _newer_ completed CI run exists on `dev`, i.e. `dev` has advanced — so the push is frequently a non-fast-forward and is silently discarded (no `fetch`/`rebase`/verify, unlike `bkit_dev_dispatch_guard`, which does all three). The emitted `::warning::` nevertheless instructs: "review `docs/plans/*/logs/$FID/status.jsonl` (type `dev-dispatch-dropped`) if this FID does not otherwise recover" — directing the operator to evidence that will usually not exist, for a post-merge failure genuinely dropped by the shared `bkit-auto-dev` concurrency group. The existing test only asserts the row in the _local workspace_, so it cannot catch this.

Suggested fix: reuse the guard's `fetch` + `rebase` + re-push + `git show origin/dev:` verification for the drop row, or drop the commit/push entirely and emit the payload into `$GITHUB_STEP_SUMMARY` + the warning text.

### F5 — LOW — mechanical — `.bkit/templates/.github/workflows/bkit-cloud.yml:344-374`

**The stale-run drop path writes and pushes commits to `dev` before the `bkit:auto` kill switch is consulted.**

The kill-switch re-check sits at `:371`, _after_ the stale-guard branch has already run `mkdir -p`, appended a row, committed, pushed to `dev` (`:357-363`) and `exit 0`ed. An operator who revokes `bkit:auto` to stop all automation for an issue still gets bkit-bot commits pushed to `dev` for that FID on every superseded dev CI run. Same ordering issue applies to a FID already past `MAX_DEV_DISPATCH_ATTEMPTS`.

Suggested fix: move the `gh issue view … | grep -qxF 'bkit:auto'` kill-switch check above the stale-run guard (one cheap API call, already the documented "halts the loop even under the cap" control), or gate the drop-row write on it.

### F6 — LOW — mechanical — `.bkit/templates/.github/workflows/bkit-cloud.yml:310`

**Dev-arm FID recovery scans the whole multi-line commit message, not the subject.**

`printf '%s' "$COMMIT_MSG" | grep -oE '^\w+\((([0-9]+|[a-z]+-[0-9]+)-[a-z0-9-]+)\):'` is line-anchored and `head_commit.message` includes the body. A merge/squash commit whose _subject_ has no conventional scope but whose _body_ contains a line beginning `feat(999-other-fid): …` (GitHub's default squash body is the list of source commit subjects) yields the wrong FID, which then keys the cap counter, the `status.jsonl` path, the `git commit -m "docs($FID): …"` and the `/bkit-debug {FID}` dispatch — a debug session opened against an unrelated feature. Reachable only for a commit that also carries `bkit [auto route]`, which bounds the blast radius, hence LOW.

Suggested fix: anchor to the subject — `printf '%s' "$COMMIT_MSG" | head -1 | grep -oE …` (both jobs, both mirrors) — plus a ctx-step test with a scope-less subject and a scoped body line asserting `skip=true`.

### F7 — LOW — mechanical — `.bkit/templates/.github/workflows/bkit-cloud.yml:236` (`bkit_dev_dispatch_guard`)

**Nondeterministic month-bucket selection can silently reset the dispatch budget.**

`status_dir=$(find docs/plans -mindepth 3 -maxdepth 3 -type d -path "docs/plans/*/logs/$guard_fid" 2>/dev/null | head -1 || true)` takes whichever directory `find` yields first (readdir order, not sorted). A FID with log dirs under two `YYYYMM` buckets — reachable when a feature spans a month boundary or is re-opened, and guaranteed once the guard itself creates `docs/plans/$(date -u +%Y%m)/logs/$FID/` because the original bucket was pruned at ship — can have its `dev-dispatch` rows read from one file and written to another across cycles, so `dev_count` never reaches `MAX_DEV_DISPATCH_ATTEMPTS` and the cross-session loop bound (a documented cost/security control) silently degrades to unbounded.

Suggested fix: `find … | sort | head -1`, or prefer the bucket whose `status.jsonl` already contains `dev-dispatch` rows for the FID before falling back to the current month.

### F8 — LOW — mechanical — `.bkit/templates/.github/workflows/bkit-cloud.yml:233-234` (`bkit_dev_dispatch_guard`)

**Unguarded `source` of the counter-bus config bypasses the function's own fail-closed contract and hard-fails the step.**

Because the function is invoked as `bkit_dev_dispatch_guard … || { … }`, `set -e` is suppressed for its entire body, so a failing `. "$GITHUB_WORKSPACE/.bkit/scripts/bkit-counter-bus-config.sh"` (consumer on an old `bkit install`, partial checkout, renamed script) does not abort — execution falls through to `[ "$dev_count" -ge "$MAX_DEV_DISPATCH_ATTEMPTS" ]`, and `set -u` then kills the whole step on the unbound variable. Verified empirically (`f(){ . /nonexistent; [ "$MAX_X" -ge 1 ]; }; set -euo pipefail; f || echo handled` → shell exits, `handled` never printed). Result is a red job rather than the guard's designed `return 1` -> `skip=true` no-op, and the caller's `|| { echo "skip=true" …; }` branch is unreachable on this path.

Suggested fix: `. "$GITHUB_WORKSPACE/.bkit/scripts/bkit-counter-bus-config.sh" || { echo "::notice::counter-bus config unavailable — refusing to dispatch uncounted (fail-closed)."; return 1; }` and/or `: "${MAX_DEV_DISPATCH_ATTEMPTS:=3}"` immediately after.

## Verified-correct (no finding)

- Fail-closed counter write: `push` -> `fetch` -> `rebase` -> re-push -> `git show origin/dev:` verification (`:267-286`); the `(git show … || true) | jq` wrapping genuinely prevents the double-`|| echo 0` two-line `$landed` corruption its comment describes.
- Exact-match kill switch (`grep -qxF 'bkit:auto'`, `:371`/`:440`) — `bkit:auto-paused` correctly no longer satisfies it; tested.
- Distinct-`headSha` cap semantics, unparseable-`status.jsonl` fail-closed, and `feat/**` remaining uncapped — all three covered by executing tests, not string assertions.
- Both jobs' ctx steps are logic-identical (only comments differ); `.github/workflows/bkit-cloud.yml` is a byte-exact render of the template after `{{CLOUD_RUNNER}}` substitution.
- `bkit-auto.md` CI_DEV: `MODE` is derived from `PHASE` (`debug` -> `CI`) _before_ the ARG-shape discriminator, so a FID-slug ARG does reach the CI_DEV branch; Step 10 accepts both `feat/` and `fix/`; Gate 1 adds the CI_DEV assert; `bkit-debug.md` correctly untouched.
- `cancel-in-progress: ${{ github.event.workflow_run.head_branch != 'dev' }}` evaluates `true` for `workflow_dispatch` (null head_branch) — no regression to the dispatch path.
- Version bump 4.10.0 -> 4.11.0 consistent across `package.json` + `.bkit/version` `pinnedVersion`; all four host mirrors regenerated for `bkit-auto`/`bkit-ship`.
