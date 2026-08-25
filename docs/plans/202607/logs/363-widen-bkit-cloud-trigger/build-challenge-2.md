Verdict: CONCERNS
Failures: 0

<!-- verdict:end -->

# Build Challenge

Lens: Security — auth, secrets, input validation, data exposure, OWASP, RLS / tenancy.

## Findings Log

Scope: `git diff $(git merge-base HEAD origin/dev)..HEAD` (208 files / 4628 insertions) — read in full for the security-bearing surfaces: `.github/workflows/bkit-cloud.yml` (both jobs, read whole-file at HEAD, not just hunks), `.bkit/templates/.github/workflows/bkit-cloud.yml` (verified line-identical to the live copy except the two `{{CLOUD_RUNNER}}` substitutions — every finding below applies to both), `.bkit/workflows/bkit-auto.md`, `.bkit/workflows/bkit-ship.md`, all 3 host mirrors of each, `.bkit/scripts/bkit-counter-bus-config.sh`, `docs/security.md`, `docs/deployments.md`, `docs/deferrals.jsonl`, `docs/knowledge.jsonl`. Not a partial diff. Independent re-review; prior-pass findings were re-derived from source, not taken on trust.

Verified-good (re-checked, no finding):

- **H1 slug allowlist in the YAML is sound.** `^([0-9]+|[a-z]+-[0-9]+)-[a-z0-9-]+$` is anchored both ends, admits only `[a-z0-9-]`, and therefore rejects `/`, `.`, `..`, `*`, `?`, `[`, whitespace and newlines. Every path-construction site is behind it: dev arm asserts at `:316` before `ISSUE`/`ARG`/`find`/`mkdir`; feat/fix arm asserts the marker at `:412` and re-asserts post-fallback at `:429`; `bkit_dev_dispatch_guard` re-asserts at entry (`:229`/`:582`) so both call sites (`:376`, `:457`) are covered even by an unvalidated caller. The bash `[[ =~ ]]` form is unquoted (correctly treated as ERE, not a literal).
- **M3 fork-origin guard is correctly placed and correctly written.** `github.event.workflow_run.head_repository.full_name == github.repository` sits in both jobs' job-level `if:` inside the CI-driven arm, so `workflow_dispatch` still works and every fork-PR-originated `workflow_run` is refused before checkout — closing the pwn-request shape on the newly privileged `fix/**` + `dev` rows. GHA `==` is case-insensitive, so canonical-casing skew cannot produce a false negative. The added `!(head_branch == 'dev' && conclusion == 'success')` clause is a pure no-op-avoidance narrowing and opens nothing.
- **M1 fail-closed cap.** `if ! dev_count=$(jq -s … 2>/dev/null)` genuinely distinguishes absent-file (legit 0) from unparseable (return 1). `set -e` is suppressed inside the function (invoked in a `||` list), but every failure path still terminates in an explicit `return 1`, and an unset `MAX_DEV_DISPATCH_ATTEMPTS` (missing/failed source of `bkit-counter-bus-config.sh`) aborts the step under `set -u` — fail-closed either way.
- **GHA-injection rule honoured.** `head_commit.message` / `head_sha` / `head_branch` reach the ctx step only via the step `env:` block and are consumed as `printf '%s' "$COMMIT_MSG" | grep`; nothing untrusted is inlined into `${{ }}` in a `run:` body. `ARG` is re-guarded (`^[0-9A-Za-z._/-]+$`) before it reaches the `prompt:` input / `BKIT_ARG` env. `actions/checkout` pins `ref: dev`, so the sourced `.bkit/scripts/bkit-counter-bus-config.sh` is trusted code, never PR-head code.
- **L1 kill switch.** All four call sites now use `gh issue view … --jq '.labels[].name' | grep -qxF 'bkit:auto'` — exact, line-anchored, fixed-string. `bkit:auto-paused` / `no-bkit:auto` no longer satisfy it.
- **No new secrets surface.** The diff adds no `secrets.*` reference, no `curl | bash`, no `permissions:` widening; the pre-existing opencode-installer pipe and provider-key fan-out are untouched. No PII, no token echo; `git push` stderr is suppressed on the telemetry paths.

Prioritized findings (5): 0 CRITICAL, 1 HIGH, 1 MEDIUM, 3 LOW.

### F1 — HIGH · mechanical · `.claude/commands/bkit-auto.md:75-88`, `.cursor/commands/bkit-auto.md:72-85`, `.opencode/commands/bkit-auto.md:78-91` (source: `.bkit/workflows/bkit-auto.md:90-106`)

**The M2 remediation (CI_DEV FID slug allowlist) landed only in the `.bkit/workflows/` source — all three shipped host mirrors, which are the artifacts the runner actually executes, still carry the pre-remediation unvalidated version.**

`git log -1` shows `.bkit/workflows/bkit-auto.md` last written by `2f75142c` (build-challenge-remediate) but `.claude/commands/bkit-auto.md` by `16dbb299` (plan-execute), i.e. the mirrors were never regenerated after remediation. Concretely, the source has:

```bash
MODE=CI_DEV
FID="$ARG"
if ! [[ "$FID" =~ ^([0-9]+|[a-z]+-[0-9]+)-[a-z0-9-]+$ ]]; then
  echo "Invalid CI_DEV FID: $FID" >&2; exit 1
fi
```

while all three mirrors go straight from `FID="$ARG"` to `ISSUE_ID=$(printf '%s' "$FID" | …)` with no assertion, and their Gate-1 checklist still reads `CI_DEV placeholders non-empty` rather than the source's `slug-asserted`. The mirrors are not decorative: `claude-code-action@v1` resolves `/bkit-auto` from `.claude/commands/`, `opencode run "/bkit-auto …"` from `.opencode/commands/`, both checked out from `ref: dev`. So the control asserted by `docs/security.md` ("every FID resolution site MUST assert a strict slug allowlist before path construction") and claimed DONE in `build-challenge-remediate-log.md` is absent from the executed artifact. (The stale mirrors also still carry the M5 `PR_URL="(merged)"` sentinel the remediation replaced.)

**Exploit scenario:** the CI-driven route pre-validates `FID` in the YAML, but `workflow_dispatch` does not — `inputs.issue` is filtered only by `ARG =~ ^[0-9A-Za-z._/-]+$` (`bkit-cloud.yml:467`/`:757`), which deliberately permits `.` and `/`. A user with only `write` (no admin) dispatches `phase=debug`, `issue=363-a/../../../../tmp/pwn`. `MODE`=CI, non-numeric → CI_DEV. The mirror's `ISSUE_ID` grep matches the leading `363`, so the non-empty assert passes (a bare `../../x` would fail-safe here, but any valid-looking prefix defeats that accidental guard). `FID` is then handed unvalidated to `/bkit-debug {FID}` (Step 2), which builds `docs/plans/{YYYYMM}/logs/{FID}/`, `.worktrees/{FID}` and commits/pushes from a session holding `contents: write`, `issues: write` and the provider key — writes land outside the plan-log tree, potentially outside `$GITHUB_WORKSPACE`. Beyond the direct traversal, shipping this state means every consumer who runs `bkit install` off this release gets prompts whose FID handling contradicts the security doc.

**Suggested fix:** regenerate the four rendered mirrors from `.bkit/workflows/` (`pnpm bkit install` / `bkit upgrade`) and re-verify `.claude/`, `.cursor/`, `.opencode/` copies of `bkit-auto.md` **and** `bkit-ship.md` (the H2 `BKIT_AUTO_ROUTE_FILE` handoff is likewise absent from all three ship mirrors) before this branch leaves the build phase. Note `pnpm bkit check` should surface this as `totalWrites > 0` drift, which is not branch-scoped — treat a green check as the acceptance signal, not the remediation log.

### F2 — MEDIUM · mechanical · `.github/workflows/bkit-cloud.yml:313-314` (+ `:645-646`, + `.bkit/templates/.github/workflows/bkit-cloud.yml`)

**The new `dev` arm's FID fallback reads a PR body fetched from inside the trusted job — and that PR can be a fork's, which the job-level `head_repository` guard does not cover.**

```bash
PR_BODY=$(gh api "repos/${GITHUB_REPOSITORY}/commits/${HEAD_SHA}/pulls" --jq '.[0].body // empty' …)
FID=$(printf '%s' "$PR_BODY" | grep -oE 'bkit:fid=[^[:space:]>]+' | sed 's/bkit:fid=//' | head -1 || true)
```

`GET /repos/{o}/{r}/commits/{sha}/pulls` returns PRs _associated_ with the commit, and for a commit not yet on the default branch (`dev` commits, since bkit's default is `main`) it returns **open** associated PRs. The legitimate feature PR is already merged/closed by then, so an outsider's open fork PR branched at that `dev` SHA can be the `.[0]` result. `head_repository == github.repository` (F-verified above) gates the _trigger_, but this is an outbound API call made after the gate, so it re-imports untrusted content into the privileged job. `docs/security.md`'s FID paragraph justifies marker trust with "the PR body is collaborator-trusted" — that premise does not hold for this lookup.

**Exploit scenario:** on a public consumer repo, an outsider forks, branches from a `dev` commit whose squash subject is non-conventional (no `type(scope):` — exactly the case this fallback exists for) and carries `bkit [auto route]`, opens a PR, and puts `bkit:fid=<some-other-in-flight-FID>` in the body. When that `dev` CI reds, the trusted job resolves `FID` from the attacker's body, derives `ISSUE` from it, and — if that (unrelated, legitimately opted-in) issue carries `bkit:auto` — burns a `dev-dispatch` slot against it, pushes a counter commit to `dev`, and dispatches a paid `/bkit-debug` session onto a feature the attacker chose. The slug allowlist bounds the _shape_ of the redirection but not the _fact_ of it: an unauthenticated outsider steers a privileged, billable agent run and consumes another FID's loop budget.

**Suggested fix:** restrict the lookup to same-repo, merged PRs — e.g. `--jq --arg r "$GITHUB_REPOSITORY" '[.[] | select(.head.repo.full_name == $r and .merged_at != null)] | .[0].body // empty'` — or drop the fallback entirely and rely on the commit-scope primary (which is bkit-authored by construction, since the `bkit [auto route]` marker only reaches `dev` via `/bkit-ship`'s `--subject`). Then correct the "PR body is collaborator-trusted" premise in `docs/security.md` to name the fork-PR exception for commit-associated lookups.

### F3 — LOW · mechanical · `.github/workflows/bkit-cloud.yml:344-365` (+ `:666-687`, + template)

**The new `dev-dispatch-dropped` telemetry commits and pushes to `dev` before the `bkit:auto` kill switch is consulted.**

In the `dev` arm the order is: derive+validate FID (`:310-319`) → stale-run guard, which `mkdir -p`s, appends a row, `git add`/`git commit`/`git push origin dev` (`:355-363`) → **then** the kill-switch label check (`:371`). A run whose automation the operator has revoked therefore still performs a write to the integration branch as `bkit-auto[bot]`. `docs/security.md`'s new #363 paragraph states "The kill switch (live `bkit:auto` re-check on the issue) applies identically to `dev`-triggered runs" — which is true for dispatch but not for this side effect, so the doc overstates the control.

**Exploit scenario:** an operator removes `bkit:auto` to halt a misbehaving loop. Each subsequent red `dev` CI on that FID whose head SHA is stale still creates `docs/plans/{YYYYMM}/logs/{FID}/` (creating the directory if absent), appends a row, and pushes it to `dev` — repeatedly, with no cap (this path is deliberately not fail-closed), producing unwanted `[skip ci]` commits on the integration branch after automation was believed disabled.

**Suggested fix:** move the `gh issue view … grep -qxF 'bkit:auto'` kill-switch block above the `LATEST_CI_SHA` / stale-run guard in both jobs (it has no dependency on `LATEST_CI_SHA`), so no write of any kind happens once the label is gone; alternatively keep the `::warning::` but skip the commit/push when the label check fails.

### F4 — LOW · mechanical · `.bkit/workflows/bkit-ship.md:258` and `:696` (+ `.claude/commands/bkit-ship.md:584`, `.cursor/commands/bkit-ship.md:581`, `.opencode/commands/bkit-ship.md:587`)

**The L1 exact-match hardening was applied to the kill switch but not to the enabling side — the marker-threading decision still uses an unanchored substring match.**

`echo "${LABELS:-}" | grep -q 'bkit:auto' && AUTO_ROUTE_SUFFIX=" bkit [auto route]"` matches any label _containing_ `bkit:auto` — `bkit:auto-disabled`, `bkit:auto-paused`, `no-bkit:auto` — the exact set of names `bkit-cloud.yml` was just fixed (`grep -qxF`) to stop honouring. The two halves of the same control now disagree.

**Exploit scenario:** an operator marks an issue `bkit:auto-paused` (a natural revocation convention, and the one L1 was written for). `/bkit-ship` still threads ` bkit [auto route]` onto the squash subject, so it becomes permanent `dev` history (the workflow explicitly says "do not clean it up later"). Every post-merge `dev` CI failure on that commit then satisfies the free-tier `contains()` gate and boots both cloud jobs — checkout, vale download, ctx step — before the hardened kill switch no-ops them. Fail-safe in outcome, but it silently spends runner minutes on a route the operator believes is off, and permanently mislabels the commit as auto-routed.

**Suggested fix:** mirror the YAML idiom — derive `LABELS` as newline-separated and test `grep -qxF 'bkit:auto'`, or re-derive in the same block with `gh issue view "$ISSUE_ID" --json labels --jq '.labels[].name' | grep -qxF 'bkit:auto'` (which also removes the cross-tool-call `${LABELS:-}` fragility the H2 handoff works around). Apply to both the Step-1 materialisation and the Step-5 fallback, plus all three mirrors.

### F5 — LOW · architectural · `.github/workflows/bkit-cloud.yml:236-266` + `.bkit/scripts/bkit-counter-bus-config.sh:24` + `docs/security.md` (#363 paragraph)

**The `MAX_DEV_DISPATCH_ATTEMPTS` cap is still enforced from a file the principal it bounds can rewrite, and the security doc still presents it as an unqualified control.**

Re-confirmed unchanged from the prior pass (correctly logged BLOCKED and recorded in `docs/deferrals.jsonl` as `363-dev-dispatch-cap-self-resettable-by-controlled-principal`, severity LOW, status OPEN — so this is an accepted residual risk, reported here for completeness of current state). The count is `jq`'d from `dev-dispatch` rows in `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl` on `origin/dev`; the dispatched `/bkit-debug` session writes that same file every run with `contents: write`, and the operator reset procedure is literally "delete dev-dispatch rows in status.jsonl". The `landed`-verification added for P6 protects against under-counting from lost pushes, not against a reset. What has **not** been closed is the documentation half: `docs/security.md` still asserts the cap "is itself a cost/security control: without it, a stuck `dev`/`fix/**` feedback loop could dispatch unbounded paid agent sessions" with no mention that the bound is self-resettable — an operator reading only that doc will over-trust it.

**Exploit scenario:** a dispatched `/bkit-debug` session is steered by a poisoned failure log or test fixture it reads as context into rewriting `status.jsonl` (a file it legitimately edits every run), dropping the `dev-dispatch` rows. The budget silently returns to 3 and the failure → debug → push → failure cycle continues indefinitely, billing agent minutes and repeatedly pushing to `dev`.

**Suggested fix:** as deferred — derive the count from a source the session cannot rewrite (`gh run list --workflow bkit-cloud.yml` filtered by FID, or an append-only tracker comment written with a token the session does not hold), taking the max of file-derived and API-derived counts. Minimally, and in this diff: qualify the `docs/security.md` sentence to state that the cap is advisory against a cooperating agent and self-resettable by any principal with `dev` write, pointing at the deferral row.
