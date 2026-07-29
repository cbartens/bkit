Verdict: FAIL
Failures: 1

<!-- verdict:end -->

# Build Challenge

Lens: Bugs and edge cases — null safety, off-by-one, error paths, data integrity.

## Findings Log

### F1 — CRITICAL — mechanical — `fix/**` CI success routes to `/bkit-ship`, which is structurally `feat/{FID}`-only

**Location:** `.bkit/templates/.github/workflows/bkit-cloud.yml:191-193` (+ mirror `:475-477`, `.github/workflows/bkit-cloud.yml`) — `case "$CONCLUSION" in success) PHASE=ship` now also fires for `BRANCH=fix/**`; consumed by `.bkit/workflows/bkit-ship.md:337-344` and `:368`.

**Exploit scenario:** `/bkit-debug` on a `bkit:auto` issue creates `fix/{FID}` (`bkit-debug.md:326`, taken whenever `feat/{FID}` is absent — every post-merge or standalone debug) and stamps `bkit [auto route]` on the CI-triggering HEAD (`bkit-debug.md:1257-1265`). CI goes GREEN. Previously `fix/**` was not in `workflow_run.branches`, so nothing happened. Now: gate passes -> `PHASE=ship` -> `bkit-auto` Step 10 (newly accepts `fix/`) -> `/bkit-ship {FID}`. Ship Step 2 has no `fix/` arm: `refs/heads/feat/{FID}` absent, `git fetch origin feat/{FID}` fails (branch deleted / never existed) -> falls to `bkit-ship.md:344` `git worktree add ... -b "feat/{FID}" origin/dev`, i.e. it works on a **freshly-created empty branch off dev that contains none of the fix commits**. Step 3.4 (`bkit-ship.md:368`) then runs `gh pr list --head "$(git branch --show-current)"` = `feat/{FID}` -> no PR -> **Failure Path**, which posts a failure comment and sets `bkit:failed` on the issue. The green fix PR is never merged. Net: every opted-in debug fix PR that goes green now fails the issue — precisely the "strictly worse than today's silence" outcome the plan itself flags for the sibling defect (plan L144-146), and the plan's Breaking-Changes claim "cloud auto-merges the fix PR" (plan L137) cannot occur. Downstream ship steps that do fire on the wrong ref are destructive-adjacent: `gh workflow run ci.yml --ref feat/{FID}` (`:545`), gate `--branch feat/{FID}` (`:668`), cleanup `git push origin --delete "feat/{FID}"` (`:1102`).

**Suggested fix:** In the ctx step `else` arm (both jobs), no-op `fix/**` + success until ship is branch-prefix aware: `case "$BRANCH" in fix/*) if [ "$PHASE" = "ship" ]; then echo "::notice::fix/** CI passed — ship not wired for fix branches, no-op exit."; echo "skip=true" >> "$GITHUB_OUTPUT"; exit 0; fi ;; esac`. (Alternative, larger: teach `bkit-ship.md` Step 2/5/13 a `feat|fix` branch-prefix variable — architectural, not a one-line change.) Either way the routing table in `.bkit/cloud.md`, `docs/deployments.md` and the plan's Breaking-Changes claim must be corrected.

### F2 — HIGH — mechanical — dispatch-cap FID key diverges between the `dev` and `fix/**` surfaces (budget not shared; phantom log dir pushed to `dev`)

**Location:** `.bkit/templates/.github/workflows/bkit-cloud.yml:338` (fix/feat branch fallback, mirror `:569`) vs `:275-289` (dev commit-scope recovery, mirror `:519-527`), consumed by `bkit_dev_dispatch_guard` at `:218-222` / `:482-486`.

**Exploit scenario:** The dev arm validates FID against `^([0-9]+|[a-z]+-[0-9]+)-[a-z0-9-]+$`, so `guard_fid` = the full slug (`363-widen-bkit-cloud-trigger`). The `fix/**` arm reaches the branch fallback on every run (the diff's own comment: "bkit-debug's fix PR body carries NO `bkit:fid=` marker, so `fix/**` ALWAYS lands here") and `grep -oE '^[0-9]+|^[a-z]+-[0-9]+'` truncates to the leading id only (`363`) — plan T13 even asserts this. Two consequences: (a) `find docs/plans -path "docs/plans/*/logs/363"` never matches the real `logs/363-widen-bkit-cloud-trigger/`, so the guard falls through to `status_dir="docs/plans/$(date -u +%Y%m)/logs/363/"`, `mkdir -p`s it, appends the row, and **commits + pushes that orphan directory to `dev`** on every `fix/**` CI failure — repo pollution, and the operator-reset notice ("delete dev-dispatch rows in status.jsonl") points at the wrong file; (b) the two surfaces count against different keys, so the documented invariant — `.bkit/cloud.md` "One budget per FID shared across the `dev` and `fix/**` failure surfaces", plan L49/L270/L843 "one post-`feat/**` debug budget per FID however the failure surfaced" — is false: a FID can burn 3 dev dispatches **and** 3 fix dispatches, doubling the loop bound the cap exists to enforce.

**Suggested fix:** Key the guard on the same value on both surfaces. Minimal: in the `fix/**` arm derive the slug before calling the guard — `GUARD_FID=$(echo "$BRANCH" | sed -E 's#^(feat|fix)/##')` (unchanged `FID`/`ISSUE` for the existing kill-switch use) and call `bkit_dev_dispatch_guard "$GUARD_FID" "$HEAD_SHA"`. Alternatively make the guard normalise: resolve `status_dir` via `-path "docs/plans/*/logs/${guard_fid}*"` and, when no directory exists, refuse to invent one (return 1 / fail-closed) rather than creating a phantom bucket.

### F3 — HIGH — mechanical — `bkit-ship` squash-marker reads `${LABELS:-}` in a shell block that never assigns it (silent no-op of the whole feature)

**Location:** `.bkit/workflows/bkit-ship.md:683-684` (and rendered mirrors `.claude/commands/bkit-ship.md`, `.cursor/`, `.opencode/`).

**Exploit scenario:** `AUTO_ROUTE_SUFFIX=""; echo "${LABELS:-}" | grep -q 'bkit:auto' && AUTO_ROUTE_SUFFIX=" bkit [auto route]" || true` sits in a Bash block at Step 5 (~line 680), but `LABELS` is an MCP-derived model value read back at Step 1 (`:247`/`:250`) and mutated at `:267` — it is never assigned as a shell variable in this block, and shell state does not survive between Bash tool calls. The prose in the same diff hunk even states the rule ("set and used in the SAME shell block — do not assume the value survives a Bash-tool-call boundary") but the code violates it: the cited precedents both set the value adjacent to a re-read in the same step (`bkit-build.md:1253` re-reads labels via MCP immediately before the block; `bkit-debug.md:1258-1262` first tries the `BKIT_AUTO_ROUTE_FILE` handoff written by build). Here there is no re-read and no handoff file, so `${LABELS:-}` expands to empty, `AUTO_ROUTE_SUFFIX` stays empty, the squash subject carries no marker, and `bkit-cloud.yml`'s `contains(head_commit.message, 'bkit [auto route]')` gate never admits the post-merge `dev` run. The feature is inert and ship reports success — there is no HEAD-subject assertion on the merge subject to catch it (unlike build/debug, which assert their close-workflow HEAD).

**Suggested fix:** Materialise the value in the same block before use, e.g. `LABELS=$(gh issue view {ISSUE_ID} --json labels --jq '[.labels[].name] | join(",")' 2>/dev/null || echo "")` (or re-read via the tracker MCP in that same numbered step, mirroring `bkit-build.md:1253`), and add a post-merge assertion: when `bkit:auto` is present, `git log -1 --pretty=%B origin/dev | grep -qF 'bkit [auto route]'` else warn — so a future regression is loud rather than silent.

### F4 — MEDIUM — mechanical — the loop cap fails OPEN on any `jq` error over `status.jsonl`

**Location:** `.bkit/templates/.github/workflows/bkit-cloud.yml:226-231` (mirror `:490-495`).

**Exploit scenario:** `dev_count=$(jq -s ... "$status_file" 2>/dev/null || echo 0)`. `status.jsonl` is a merge=union NDJSON file appended by many workflows, subagents, and (now) two concurrent cloud jobs; a single truncated/partial line, a stray non-JSON line, or a conflict artefact makes `jq -s` exit non-zero, stderr is discarded, and `dev_count` silently becomes `0`. The cap then never trips no matter how many `dev-dispatch` rows already exist, so the cross-session debug loop this guard exists to bound (fix pushed to dev -> dev CI red -> debug dispatched -> fix pushed ...) runs unbounded, each iteration burning a full cloud agent run. Note the asymmetry: the sibling `landed` check was deliberately hardened to fail closed (`:249-259`), while the count that actually enforces the bound fails open.

**Suggested fix:** Distinguish "no rows" from "cannot parse": drop the `|| echo 0`, capture the exit status, and treat a non-zero `jq` as cap-exceeded (`return 1` with an operator `::notice::`), e.g. `if ! dev_count=$(jq -s ... "$status_file" 2>/dev/null); then echo "::notice::status.jsonl unparseable for $guard_fid — refusing to dispatch uncounted (fail-closed)."; return 1; fi`. Optionally pre-filter with `grep -E '^\{' "$status_file" | jq -s ...` so a single bad line degrades to a count, not an unbounded loop.

### F5 — MEDIUM — mechanical — `dev` CI **success** still boots both cloud jobs (full `fetch-depth: 0` checkout + vale install) to do nothing

**Location:** `.bkit/templates/.github/workflows/bkit-cloud.yml:99-105` / `:411-417` (job-level `auto-route-gate` `if:`), no-op exit at `:270-274` / `:514-517`.

**Exploit scenario:** F3 aside, once the marker lands on the squash subject **every** auto-shipped merge produces a `dev` CI run whose `head_commit.message` contains `bkit [auto route]`. The job-level gate only tests conclusion in (`success`,`failure`) + marker, so on the (overwhelmingly common) green post-merge run both the `claude` and `opencode` jobs start, run `actions/checkout` with `fetch-depth: 0`, download+verify the vale tarball, configure git, and only then reach the ctx step which exits `skip=true`. That is two runner-job boots + two full-history clones per merged PR, forever, for a guaranteed no-op — directly against the file's own header claim that the free-tier gate means "zero billable runner minutes" for non-actionable events, and a cost-amplification vector on large repos.

**Suggested fix:** Move the dev-success no-op into the job-level `if:` so the runner never starts, e.g. add `&& !(github.event.workflow_run.head_branch == 'dev' && github.event.workflow_run.conclusion == 'success')` inside the `auto-route-gate` block (both jobs, both template and mirror). Keep the ctx-step guard as defence in depth.

### F6 — MEDIUM — mechanical — `bkit-auto` CI_DEV leaves `PR_NUMBER`/`PR_URL` unusable but the Step 1 comment template still renders the PR line

**Location:** `.bkit/workflows/bkit-auto.md:85-101` (CI_DEV block) and `:163-169` (Step 1 comment body).

**Exploit scenario:** CI_DEV sets `PR_URL="(merged)"` and never sets `PR_NUMBER`, yet the body template keeps `[{OWNER_REPO}/pull/{PR_NUMBER}]({PR_URL})` and the diff's parenthetical only excuses `RUN_ID` ("`MODE` = CI_DEV has no `RUN_ID` — omit that line only"). Two bad outcomes for the dev route's very first step: (a) the orchestrator renders a broken link `[owner/repo/pull/]((merged))` into the tracker comment, or (b) it obeys the file-level Placeholders rule ("Assert `{PLACEHOLDERS}` such as … `{PR_NUMBER}` … non-empty before tool calls. **Else** → **Failure Path**") and routes the whole dev-triggered dispatch into the Failure Path before `/bkit-debug` is ever invoked — failing the issue instead of debugging it.

**Suggested fix:** Extend the CI_DEV parenthetical and the template to drop the PR line as well: "`MODE` = CI_DEV omits the PR and run lines"; set `PR_URL=""` rather than the sentinel `(merged)` so an emptiness assert is unambiguous, and add `PR_NUMBER`/`PR_URL` to the CI-only placeholder list in Gate 1.

### F7 — MEDIUM — mechanical — `bkit-auto-dev` is a single concurrency group for all FIDs; with `cancel-in-progress: false` a superseded FID's debug is silently dropped

**Location:** `.bkit/templates/.github/workflows/bkit-cloud.yml:78-86` (group `bkit-auto-${{ … head_branch }}` -> `bkit-auto-dev` for every dev trigger) interacting with the stale-run guard at `:301-307` / `:543-549`.

**Exploit scenario:** Two different FIDs merge to `dev` in quick succession and both post-merge CI runs go red. Run A is in flight, run B queues, run C arrives -> GHA cancels the pending B (documented behaviour, acknowledged in the comment). FID B's post-merge failure is never debugged and nothing records the drop. Even when B is not cancelled, it starts after A finishes and the Option-A stale guard compares `HEAD_SHA` (B's SHA) against the most-recent _completed_ dev CI head — which by then is C's SHA — so B exits `skip=true`. Either way the plan's stated criterion ("a superseding dev run is **queued** … it is NOT dropped … the operator does NOT need to manually re-trigger", plan L53, mirrored in `.bkit/cloud.md` and the comment at `:79-85`) does not hold for the multi-FID case.

**Suggested fix:** Include the FID/head_sha in the dev concurrency group so distinct FIDs do not collapse (e.g. `bkit-auto-${{ inputs.issue || github.event.workflow_run.head_branch }}-${{ github.event.workflow_run.head_sha }}` for dev, or move the group derivation into a per-FID key once the FID is known), or emit an explicit `::warning::` + a `dev-dispatch-dropped` status row when the stale guard skips a run that carries an unconsumed failure, so the drop is visible rather than silent. At minimum, correct the "NOT dropped" claim in the plan, `.bkit/cloud.md` and the YAML comment.

### F8 — LOW — mechanical — the dev path's "tracker-agnostic" FID recovery is dead: the kill switch is still GitHub-only

**Location:** `.bkit/templates/.github/workflows/bkit-cloud.yml:280-286` (Linear-shape alternation, mirror `:519-523`) vs `:308-313` / `:550-553` (`gh issue view "$ISSUE"`).

**Exploit scenario:** P5 widened the commit-scope regex to admit `bar-123-slug` on the grounds that "a GitHub-only regex would silently no-op the dev trigger for every Linear-tracker consumer". But the very next guard runs `gh issue view "bar-123" --json labels … || echo ""`, which cannot resolve a Linear id; `ISSUE_LABELS` comes back empty, the `grep -q 'bkit:auto'` fails, and the run no-ops at the kill switch anyway — the identical silent no-op, three lines later. (The workflow is in any case declared GitHub-tracker-only at `:392-394`.) Net effect is dead complexity plus a comment that documents a fix which does not exist.

**Suggested fix:** Either state plainly in the comment that the alternation is shape-tolerance only and the surface remains GitHub-tracker-gated (and keep `bkit:tracker`-conditional rendering in mind for the Linear case), or drop the Linear alternation on this path so the constraint is enforced in one place instead of implied in two.

### F9 — LOW — mechanical — stale-run guard is inert whenever `gh run list --workflow ci.yml` errors

**Location:** `.bkit/templates/.github/workflows/bkit-cloud.yml:301-307` (mirror `:543-549`).

**Exploit scenario:** `LATEST_CI_SHA=$( … || echo "")` followed by `if [ -n "$LATEST_CI_SHA" ] && …` means any error — a consumer whose CI workflow file is not literally `ci.yml`, a missing `actions: read` scope, an API hiccup, or a repo whose completed-run list is empty — silently disables the staleness check for that run rather than surfacing it. `.bkit/cloud.md` documents this as a deliberate fail-open, but the permanent-misconfiguration case (workflow filename drift) is indistinguishable from the transient one, so a consumer can run for months with the guard never engaged and dispatch debugs against superseded SHAs.

**Suggested fix:** Distinguish the two: emit `::warning::` (not silence) when the query returns empty, and once per run verify the workflow file exists (`gh workflow view ci.yml` or `gh run list … --limit 1` returning any row) so a filename mismatch is reported instead of degrading to a no-guard state.
