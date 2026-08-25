Verdict: FAIL
Failures: 1

<!-- verdict:end -->

# Build Challenge

Reconciliation of the post-remediation RE-RUN. Inputs: `build-challenge-1.md` (lens: bugs and edge cases) and `build-challenge-2.md` (lens: security). Total lenses = 2. Both inputs self-reported `CONCERNS` / `Failures: 0`; this pass escalates one merged cluster to CRITICAL — justification inline at F1.

Reviewer-verified independently at reconciliation time (not taken on trust from either input): the `${LABELS:-}` / `$GITHUB_ENV` shape in `.bkit/workflows/bkit-ship.md` and all three ship mirrors; host-mirror staleness via `git log -1` per path; the `set -euo pipefail` abort on the un-`|| true`'d `grep` (empirically reproduced, exit 1, next line unreached); the `fix/**` no-op block vs the header/`cloud.md` routing text.

## Findings

### F1 — CRITICAL — mechanical — `.bkit/workflows/bkit-ship.md:255-261` + `:686-700` (+ `.claude/commands/bkit-ship.md:583-587`, `.cursor/commands/bkit-ship.md:580-584`, `.opencode/commands/bkit-ship.md:586-590`)

**Lens:** bugs/edge-cases (challenge-1 F1) + security (challenge-2 F4, and the ship half of challenge-2 F1) — `agreement: 2/2`.

**The `bkit [auto route]` squash-subject marker is never threaded. The post-merge `dev` trigger that #363 exists to ship is functionally inert, while CHANGELOG, `docs/deployments.md` and `.bkit/cloud.md` all assert it works.**

Two independent, individually-sufficient breaks:

1. _Source transport (challenge-1)._ Step 1 item 5 derives `AUTO_ROUTE_SUFFIX` from `echo "${LABELS:-}"` — a bash variable never assigned in that shell (`{LABELS}` is an MCP-derived template value), so it always expands empty and the handoff file is written containing `""`. The path is then published via `echo "BKIT_AUTO_ROUTE_FILE=$BKIT_AUTO_ROUTE_FILE" >> "$GITHUB_ENV" 2>/dev/null || true`. `$GITHUB_ENV` is applied by the Actions runner only _between steps_; every agent Bash tool call in a cloud dispatch executes inside the single `claude-code-action` step, so no later tool call ever sees the variable, and in a local IDE run `$GITHUB_ENV` is unset and the redirect is swallowed by `|| true`. At Step 5 `${BKIT_AUTO_ROUTE_FILE:-}` is therefore empty, the `else` fallback fires, and the fallback is the _identical dead read_ the prior pass flagged (`echo "${LABELS:-}" | grep -q 'bkit:auto'`, `:696`).
2. _Executed artifact (challenge-2 F1, reviewer-confirmed)._ The handoff does not exist in any host mirror at all. All three `bkit-ship.md` mirrors still carry the pre-remediation single-block form (`AUTO_ROUTE_SUFFIX=""` + `echo "${LABELS:-}" | grep -q 'bkit:auto'`) with no `BKIT_AUTO_ROUTE_FILE`, confirmed by `git log -1`: source at `2f75142c` (build-challenge-remediate), `.claude/commands/bkit-ship.md` at `e0190579` (plan-gaps-remediate). The mirrors are what `claude-code-action` and `opencode run` actually resolve, so the runner executes only the dead read.

Challenge-2 rated its half LOW because it framed the defect as unanchored matching (`grep -q 'bkit:auto'` also matching `bkit:auto-paused` / `no-bkit:auto`), but it names the same root cause at the same lines — "the cross-tool-call `${LABELS:-}` fragility" — and prescribes the same fix (re-derive via `gh issue view` in the same block). Both lenses therefore substantively agree the read is non-functional; they diverge only on consequence framing. **Escalation justification (above both lenses' labels):** merged, the two lenses' evidence shows the marker is never emitted on _any_ path in _any_ runtime — not a degraded control but a wholly inert feature — so the job-level free-tier gate `contains(github.event.workflow_run.head_commit.message, 'bkit [auto route]')` (`.bkit/templates/.github/workflows/bkit-cloud.yml:113`) can never match a `dev` push and no dev-CI-failure dispatch can ever occur. This is the load-bearing mechanism of the whole build, and shipped docs claim it as delivered.

**Exploit scenario:** an operator ships a `bkit:auto` issue; the squash subject lands on `dev` without the marker; post-merge `dev` CI reds; both cloud jobs' job-level `if:` gate fails; nothing dispatches. The operator, per `docs/deployments.md:201` and `.bkit/cloud.md:450`, believes the self-healing loop is armed and stops watching — restoring exactly the silent-stall class #363 was opened to remove. The unanchored-match half additionally means that once the mechanism is repaired without anchoring, a `bkit:auto-paused` issue still gets ` bkit [auto route]` written into permanent `dev` history and burns runner minutes on a route the operator believes is off.

**Suggested fix:** delete the cross-call `$GITHUB_ENV` handoff entirely and re-derive inside the Step 5 merge fence with a call that depends on no prior shell state, exact-matched — `AUTO_ROUTE_SUFFIX=""; gh issue view {ISSUE_ID} --json labels --jq '.labels[].name' 2>/dev/null | grep -qxF 'bkit:auto' && AUTO_ROUTE_SUFFIX=" bkit [auto route]" || true` — which closes the transport break and the anchoring break together, and matches idiom (1) of the repo's own new KN row (`docs/knowledge.jsonl:70`, key `363-workflow-md-shell-var-does-not-survive-bash-tool-call-boundary`, "re-derive the value in the SAME bash fence"). Then regenerate all three mirrors (see F2). Replace the shape-only regression test in `.bkit/src/bkit-ship-invariants.test.ts` (H2 describe) — it asserts only that `>> "$GITHUB_ENV"` is present in the text, so it passes on the broken mechanism — with one that executes the fenced block against a `gh` stub and asserts the rendered `--subject` actually contains `bkit [auto route]`.

### F2 — HIGH — mechanical — `.claude/commands/bkit-auto.md:75-88`, `.cursor/commands/bkit-auto.md:72-85`, `.opencode/commands/bkit-auto.md:78-91` (source: `.bkit/workflows/bkit-auto.md:96-106`)

**Lens:** security (challenge-2 F1) — `agreement: 1/2` (challenge-1 asserted the opposite in its verified-correct list: "all four host mirrors regenerated for `bkit-auto`/`bkit-ship`"; reviewer independently confirmed challenge-2 is correct and challenge-1's claim is false).

**The M2 remediation (CI_DEV FID slug allowlist) landed only in `.bkit/workflows/` — every shipped host mirror, which is the artifact the runner executes, still carries the pre-remediation unvalidated version.**

Reviewer-confirmed: source has `MODE=CI_DEV; FID="$ARG"` followed by `if ! [[ "$FID" =~ ^([0-9]+|[a-z]+-[0-9]+)-[a-z0-9-]+$ ]]; then echo "Invalid CI_DEV FID: $FID" >&2; exit 1; fi`; all three mirrors go straight from `FID="$ARG"` to `ISSUE_ID=$(printf '%s' "$FID" | grep -oE ...)` with no assertion, and still carry the M5 `PR_URL="(merged)"` sentinel the remediation removed. `git log -1` confirms drift (`.bkit/workflows/bkit-auto.md` at `2f75142c`, `.claude/commands/bkit-auto.md` at `16dbb299`/plan-execute). The control asserted by `docs/security.md` ("every FID resolution site MUST assert a strict slug allowlist before path construction") and marked DONE in `build-challenge-remediate-log.md` is therefore absent from the executed artifact.

**Exploit scenario:** the CI-driven route pre-validates `FID` in the YAML, but `workflow_dispatch` does not — `inputs.issue` is filtered only by `ARG =~ ^[0-9A-Za-z._/-]+$` (`bkit-cloud.yml:467`/`:757`), which deliberately permits `.` and `/`. A principal with plain `write` (no admin) dispatches `phase=debug`, `issue=363-a/../../../../tmp/pwn`. `MODE`=CI, non-numeric → CI_DEV. The mirror's `ISSUE_ID` grep matches the leading `363`, so the only surviving assert (non-empty `ISSUE_ID`) passes. `FID` reaches `/bkit-debug {FID}` unvalidated, which builds `docs/plans/{YYYYMM}/logs/{FID}/` and `.worktrees/{FID}` and commits/pushes from a session holding `contents: write`, `issues: write` and the provider key — writes land outside the plan-log tree, potentially outside `$GITHUB_WORKSPACE`. Secondary blast radius: every consumer who runs `bkit install` off this release receives prompts whose FID handling contradicts the shipped security doc.

**Suggested fix:** regenerate the rendered mirrors from `.bkit/workflows/` and re-verify the `.claude/`, `.cursor/`, `.opencode/` copies of `bkit-auto.md` **and** `bkit-ship.md` (F1's handoff is likewise absent from all three ship mirrors) before this branch leaves the build phase. Treat a green `pnpm bkit check` (`totalWrites === 0`) as the acceptance signal, not the remediation log — mirror drift is not branch-scoped and is not caught by `bkit check` on the host-render dirs alone, so diff the two trees explicitly.

### F3 — MEDIUM — mechanical — `.bkit/templates/.github/workflows/bkit-cloud.yml:427` (+ `.github/workflows/bkit-cloud.yml`, both jobs)

**Lens:** bugs/edge-cases (challenge-1 F2) — `agreement: 1/2`.

**Missing `|| true` makes the intended fail-safe no-op unreachable — the step aborts red instead.**

`ISSUE=$(printf '%s' "$FID" | grep -oE '^[0-9]+|^[a-z]+-[0-9]+' | head -1)` is the only derivation in the `fix/**` fallback block without `|| true` (contrast `:314`, `:410`, `:411`, `:236`). Under the step's `set -euo pipefail` (`:191`/`:558`), a `$FID` with no numeric/alpha id — reachable whenever the PR body carries no `bkit:fid=` marker and the branch is e.g. `feat/add-oauth`, `fix/hotfix-login`, `fix/renovate-bump` — makes `grep` exit 1, `pipefail` propagates, the assignment fails and `set -e` kills the step. Reviewer-reproduced: `bash -c 'set -euo pipefail; ISSUE=$(printf "%s" add-oauth | grep -oE "^[0-9]+|^[a-z]+-[0-9]+" | head -1); echo REACHED'` → exit 1, `REACHED` never printed. Note the dev-arm twin at `:320` is safe only because the slug allowlist at `:316` runs first and guarantees a match; the `fix/**` path validates _after_ this line.

**Exploit scenario:** a consumer opens any non-FID-shaped branch (Renovate, a hotfix, a hand-named feature branch). Every CI completion on it produces a red `bkit-cloud` run instead of the designed silent no-op, and the guard three lines below (`::notice::Cannot derive FID/ISSUE for branch $BRANCH — no-op exit (fail-safe).`, `:429-433`) is dead code for the empty-`ISSUE` case. Persistent red checks train operators to ignore `bkit-cloud` failures, masking real dispatch faults.

**Suggested fix:** `... | head -1 || true)` in both jobs and both mirrors; add a ctx-step test with `BRANCH=feat/add-oauth`, `STUB_PR_BODY=""` asserting `status === 0` and `skip=true`.

### F4 — MEDIUM — mechanical — `.github/workflows/bkit-cloud.yml:313-314` (+ `:645-646`, + `.bkit/templates/.github/workflows/bkit-cloud.yml`)

**Lens:** security (challenge-2 F2) — `agreement: 1/2`.

**The `dev` arm's FID fallback reads a PR body fetched from inside the trusted job — and that PR can be a fork's, which the job-level `head_repository` guard does not cover.**

`PR_BODY=$(gh api "repos/${GITHUB_REPOSITORY}/commits/${HEAD_SHA}/pulls" --jq '.[0].body // empty' ...)` then `FID=$(... grep -oE 'bkit:fid=[^[:space:]>]+' ...)`. `GET /repos/{o}/{r}/commits/{sha}/pulls` returns PRs _associated_ with the commit; for a commit not on the default branch (`dev`, since bkit's default is `main`) it returns **open** associated PRs. The legitimate feature PR is merged/closed by then, so an outsider's open fork PR branched at that `dev` SHA can be `.[0]`. `head_repository == github.repository` gates the _trigger_, but this is an outbound API call made after the gate, re-importing untrusted content into the privileged job. `docs/security.md` justifies marker trust with "the PR body is collaborator-trusted", a premise that does not hold for this lookup.

**Exploit scenario:** on a public consumer repo an outsider forks, branches from a `dev` commit whose squash subject is non-conventional (exactly the case this fallback exists for) and carries `bkit [auto route]`, opens a PR, and puts `bkit:fid=<another-in-flight-FID>` in the body. When that `dev` CI reds, the trusted job resolves `FID` from the attacker's body, derives `ISSUE` from it, and — if that unrelated but legitimately opted-in issue carries `bkit:auto` — burns a `dev-dispatch` slot against it, pushes a counter commit to `dev`, and dispatches a paid `/bkit-debug` session onto a feature the attacker chose. The slug allowlist bounds the _shape_ of the redirection, not the _fact_ of it.

**Suggested fix:** restrict the lookup to same-repo merged PRs — `--jq --arg r "$GITHUB_REPOSITORY" '[.[] | select(.head.repo.full_name == $r and .merged_at != null)] | .[0].body // empty'` — or drop the fallback and rely on the commit-scope primary (bkit-authored by construction, since ` bkit [auto route]` only reaches `dev` via `/bkit-ship`'s `--subject`). Correct the "PR body is collaborator-trusted" premise in `docs/security.md` to name the fork-PR exception for commit-associated lookups.

### F5 — MEDIUM — mechanical — `.bkit/templates/.github/workflows/bkit-cloud.yml:17-18` and `.bkit/cloud.md:457`

**Lens:** bugs/edge-cases (challenge-1 F3) — `agreement: 1/2`.

**Shipped, consumer-facing docs promise `fix/**` green CI auto-merges; the shipped code deliberately no-ops it.**

Reviewer-confirmed: the C1 remediation at `:384-391` makes `fix/*` + `PHASE=ship` exit with `::notice::fix/** CI passed — ship not wired for fix branches yet, no-op exit.`, but the workflow header a consumer reads in their own installed `.github/workflows/bkit-cloud.yml` still says `workflow_run (CI completion on fix/**): success -> ship, failure -> debug` / `(newly folded — fix-PR green CI now auto-merges via the cloud)`, and `.bkit/cloud.md:457` still tabulates `| feat/** / fix/** CI (pre-merge, via pull_request) | -> ship | -> debug |`. (`docs/deployments.md` is clean — it documents only the `dev` row.)

**Exploit scenario:** an operator trusts the documented contract, leaves a green `fix/{FID}` PR unmerged expecting the cloud to merge it, and the fix silently never lands on `dev` — the same silent-stall class the widening exists to remove, now induced by bkit's own docs.

**Suggested fix:** change both to `fix/**: success -> no-op (ship is not fix/**-aware — /bkit-ship Step 2 has feat/{FID} worktree arms only), failure -> debug (capped)`.

### F6 — MEDIUM — mechanical — `.bkit/templates/.github/workflows/bkit-cloud.yml:355-364` (+ `:686-687`, both jobs)

**Lens:** bugs/edge-cases (challenge-1 F4) — `agreement: 1/2`. Distinct root cause from F7 despite overlapping lines (lost push vs. ordering).

**The M6 `dev-dispatch-dropped` telemetry is push-best-effort with no retry, so it is lost in exactly the scenario it exists for — while the operator warning points at it as durable evidence.**

The block commits the row on the job's start-of-run checkout of `dev` and runs `git push origin dev >/dev/null 2>&1 || true`. The branch is only reached when a _newer_ completed CI run exists on `dev`, i.e. `dev` has advanced — so the push is frequently a non-fast-forward and is silently discarded (no `fetch`/`rebase`/verify, unlike `bkit_dev_dispatch_guard`, which does all three at `:267-286`). The emitted `::warning::` nevertheless instructs the operator to "review `docs/plans/*/logs/$FID/status.jsonl` (type `dev-dispatch-dropped`)".

**Exploit scenario:** a post-merge failure is genuinely dropped by the shared `bkit-auto-dev` concurrency group. The operator follows the warning to `status.jsonl`, finds no row (the push lost the race), concludes nothing was dropped, and the FID stalls unnoticed. The existing test only asserts the row in the _local workspace_, so it cannot catch this.

**Suggested fix:** reuse the guard's `fetch` + `rebase` + re-push + `git show origin/dev:` verification for the drop row, or drop the commit/push entirely and emit the payload into `$GITHUB_STEP_SUMMARY` plus the warning text.

### F7 — LOW — mechanical — `.bkit/templates/.github/workflows/bkit-cloud.yml:344-374` (+ `:666-687`, both jobs)

**Lens:** bugs/edge-cases (challenge-1 F5) + security (challenge-2 F3) — `agreement: 2/2`.

**The stale-run drop path writes and pushes commits to `dev` before the `bkit:auto` kill switch is consulted.**

Reviewer-confirmed order in the `dev` arm: derive+validate FID (`:310-319`) → stale-run guard, which `mkdir -p`s, appends a row, `git add`/`git commit`/`git push origin dev` (`:355-363`) and `exit 0`s → **then** the kill-switch label check (`:371`). `docs/security.md`'s #363 paragraph states "The kill switch ... applies identically to `dev`-triggered runs" — true for dispatch, false for this side effect. The same ordering applies to a FID already past `MAX_DEV_DISPATCH_ATTEMPTS`.

**Exploit scenario:** an operator removes `bkit:auto` to halt a misbehaving loop. Each subsequent red `dev` CI on that FID with a stale head SHA still creates `docs/plans/{YYYYMM}/logs/{FID}/`, appends a row, and pushes a `bkit-auto[bot]` `[skip ci]` commit to the integration branch — repeatedly and uncapped (this path is deliberately not fail-closed) — after automation was believed disabled.

**Suggested fix:** move the `gh issue view ... | grep -qxF 'bkit:auto'` kill-switch block above the `LATEST_CI_SHA` / stale-run guard in both jobs (it has no dependency on `LATEST_CI_SHA`), so no write of any kind occurs once the label is gone; alternatively keep the `::warning::` but skip the commit/push when the label check fails.

### F8 — LOW — mechanical — `.bkit/templates/.github/workflows/bkit-cloud.yml:310` (+ dev arm of both jobs)

**Lens:** bugs/edge-cases (challenge-1 F6) — `agreement: 1/2`.

**Dev-arm FID recovery scans the whole multi-line commit message, not the subject.**

`printf '%s' "$COMMIT_MSG" | grep -oE '^\w+\((([0-9]+|[a-z]+-[0-9]+)-[a-z0-9-]+)\):'` is line-anchored (`^`), and `head_commit.message` includes the body.

**Exploit scenario:** a merge/squash commit whose _subject_ has no conventional scope but whose _body_ contains a line beginning `feat(999-other-fid): ...` (GitHub's default squash body is the list of source commit subjects) yields the wrong FID, which then keys the cap counter, the `status.jsonl` path, the `git commit -m "docs($FID): ..."` and the `/bkit-debug {FID}` dispatch — a paid debug session opened against an unrelated feature and a budget slot burned on it. Reachable only for a commit that also carries `bkit [auto route]`, which bounds the blast radius to opted-in repos, hence LOW.

**Suggested fix:** anchor to the subject — `printf '%s' "$COMMIT_MSG" | head -1 | grep -oE ...` (both jobs, both mirrors) — plus a ctx-step test with a scope-less subject and a scoped body line asserting `skip=true`.

### F9 — LOW — mechanical — `.bkit/templates/.github/workflows/bkit-cloud.yml:236` (`bkit_dev_dispatch_guard`)

**Lens:** bugs/edge-cases (challenge-1 F7) — `agreement: 1/2`.

**Nondeterministic month-bucket selection can silently reset the dispatch budget.**

`status_dir=$(find docs/plans -mindepth 3 -maxdepth 3 -type d -path "docs/plans/*/logs/$guard_fid" 2>/dev/null | head -1 || true)` takes whichever directory `find` yields first (readdir order, not sorted).

**Exploit scenario:** a FID with log dirs under two `YYYYMM` buckets — reachable when a feature spans a month boundary or is re-opened, and guaranteed once the guard itself creates `docs/plans/$(date -u +%Y%m)/logs/$FID/` because the original bucket was pruned at ship — has its `dev-dispatch` rows read from one file and written to another across cycles. `dev_count` never reaches `MAX_DEV_DISPATCH_ATTEMPTS`, and the cross-session loop bound (a documented cost control) silently degrades to unbounded paid dispatches.

**Suggested fix:** `find ... | sort | head -1`, or prefer the bucket whose `status.jsonl` already contains `dev-dispatch` rows for the FID before falling back to the current month.

### F10 — LOW — mechanical — `.bkit/templates/.github/workflows/bkit-cloud.yml:233-234` (`bkit_dev_dispatch_guard`)

**Lens:** bugs/edge-cases (challenge-1 F8) — `agreement: 1/2`. Divergence retained deliberately: challenge-2 evaluated the same code path (its M1 verified-good note) and judged the `set -u` abort acceptable as "fail-closed either way". Both lenses agree on the mechanism; they differ on whether a red step is an acceptable outcome. Kept at challenge-1's LOW rather than dropped, because the coded intent (`return 1` → `skip=true`) is unreachable.

**Unguarded `source` of the counter-bus config bypasses the function's own fail-closed contract and hard-fails the step.**

Because the function is invoked as `bkit_dev_dispatch_guard ... || { ... }`, `set -e` is suppressed for its entire body, so a failing `. "$GITHUB_WORKSPACE/.bkit/scripts/bkit-counter-bus-config.sh"` (consumer on an old `bkit install`, partial checkout, renamed script) does not abort — execution falls through to `[ "$dev_count" -ge "$MAX_DEV_DISPATCH_ATTEMPTS" ]`, and `set -u` then kills the whole step on the unbound variable. Challenge-1 reproduced this (`f(){ . /nonexistent; [ "$MAX_X" -ge 1 ]; }; set -euo pipefail; f || echo handled` → shell exits, `handled` never printed).

**Exploit scenario:** a consumer on a stale `bkit install` gets a red `bkit-cloud` job on every `dev`/`fix` CI completion instead of the guard's designed `skip=true` no-op, and the caller's `|| { echo "skip=true" ...; }` branch is unreachable on this path — indistinguishable from a genuine dispatch fault.

**Suggested fix:** `. "$GITHUB_WORKSPACE/.bkit/scripts/bkit-counter-bus-config.sh" || { echo "::notice::counter-bus config unavailable — refusing to dispatch uncounted (fail-closed)."; return 1; }` and/or `: "${MAX_DEV_DISPATCH_ATTEMPTS:=3}"` immediately after.

### F11 — LOW — architectural — `.github/workflows/bkit-cloud.yml:236-266` + `.bkit/scripts/bkit-counter-bus-config.sh:24` + `docs/security.md` (#363 paragraph)

**Lens:** security (challenge-2 F5) — `agreement: 1/2`.

**The `MAX_DEV_DISPATCH_ATTEMPTS` cap is enforced from a file the principal it bounds can rewrite, and the security doc still presents it as an unqualified control.**

The mechanism half is an accepted residual risk — reviewer-confirmed present in `docs/deferrals.jsonl:56` as `363-dev-dispatch-cap-self-resettable-by-controlled-principal`, severity LOW, status OPEN. The count is `jq`'d from `dev-dispatch` rows in `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl` on `origin/dev`; the dispatched `/bkit-debug` session writes that same file every run with `contents: write`, and the operator reset procedure is literally "delete `dev-dispatch` rows in `status.jsonl`". The `landed` verification added for P6 protects against under-counting from lost pushes, not against a reset. **Not** closed: `docs/security.md` still asserts the cap "is itself a cost/security control: without it, a stuck `dev`/`fix/**` feedback loop could dispatch unbounded paid agent sessions" with no mention that the bound is self-resettable.

**Exploit scenario:** a dispatched `/bkit-debug` session is steered by a poisoned failure log or test fixture it reads as context into rewriting `status.jsonl` (a file it legitimately edits every run), dropping the `dev-dispatch` rows. The budget silently returns to 3 and the failure → debug → push → failure cycle continues indefinitely, billing agent minutes and repeatedly pushing to `dev`. An operator reading only `docs/security.md` over-trusts the bound and does not watch for it.

**Suggested fix:** in this diff, qualify the `docs/security.md` sentence to state that the cap is advisory against a cooperating agent and self-resettable by any principal with `dev` write, pointing at the deferral row. As deferred (out of scope here): derive the count from a source the session cannot rewrite (`gh run list --workflow bkit-cloud.yml` filtered by FID, or an append-only tracker comment written with a token the session does not hold), taking the max of file-derived and API-derived counts.

## Reconciliation notes

- **Merged:** challenge-1 F1 + challenge-2 F4 (+ ship half of challenge-2 F1) → F1, same lines (`bkit-ship.md:258`/`:696`), same root cause (`${LABELS:-}` never populated across a tool-call boundary). Challenge-1 F5 + challenge-2 F3 → F7, identical lines and root cause, both LOW.
- **Kept separate despite line overlap:** F6 (lost push) vs F7 (kill-switch ordering) at `:344-374` — distinct root causes and distinct fixes. F4 (fork PR body) vs F8 (commit-message scan) on the dev-arm FID derivation — distinct sources of the wrong FID.
- **Divergences resolved:** challenge-1's verified-correct claim that all host mirrors were regenerated is factually wrong (reviewer-verified via `git log -1` and content diff); challenge-2 F1 stands as F2. Challenge-2's verified-good M1 note conflicts with challenge-1 F8 on whether the `set -u` abort is acceptable; retained as F10 at LOW with the divergence recorded.
- **Prior-pass items confirmed genuinely fixed** (both lenses, no finding): the `fix/**`-success → `/bkit-ship` mis-route (`:384-391`, spawned-bash regression test); the FID slug allowlist in the YAML at all four sites (`:229`, `:316`, `:412`, `:429`) — but see F2, the equivalent `bkit-auto` control is missing from the executed mirrors; the fork-origin `head_repository` job-level guard; the exact-match `grep -qxF 'bkit:auto'` kill switch in the YAML; the fail-closed counter write with `git show origin/dev:` verification; GHA-injection hygiene (untrusted payload reaches the step only via `env:`); version bump 4.10.0 → 4.11.0 consistent across `package.json` and `.bkit/version`.
