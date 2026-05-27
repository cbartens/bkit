Verdict: CONCERNS
Failures: 0

<!-- verdict:end -->

# Build Challenge

Lens: Bugs and edge cases — null safety, off-by-one, error paths, data integrity.

## Findings Log

> Priority: the HIGH finding below (SHARED-DERIV grep under `set -euo pipefail`) is a real must-fix — it defeats the workflow's own fail-safe and turns a degraded run into a red job failure. No CRITICAL findings (verdict maps to CONCERNS; FAIL is reserved for CRITICAL). One MEDIUM must-fix (partial package.json write before mismatch check) and one MEDIUM robustness hazard (cross-block shell var). Remaining are LOW nits / one INFO.

### HIGH — mechanical — `.github/workflows/bkit-cloud.yml:160-161` (and template `:160-161`)

**What breaks:** The SHARED-DERIV grep assignments run under `set -euo pipefail` (line 135) with NO failure guard:

```
ISSUE=$(echo "$PR_BODY" | grep -oP '(?<=bkit:issue=#)\d+' | head -1)
FID=$(echo "$PR_BODY"  | grep -oP '(?<=bkit:fid=)[^\s>]+' | head -1)
```

When the PR body lacks the marker (`grep` exits 1), `pipefail` propagates the failure and `set -e` aborts the _whole step_ at the assignment line — verified locally: `set -euo pipefail; X=$(echo nope | grep -oE xyz | head -1)` exits 1 and never reaches the next line.

**Why it's a bug:** The explicit fallback (`if [ -z "$ISSUE" ] || [ -z "$FID" ]; then ...branch extraction... fi`, lines 162-166) and the fail-safe no-op (`echo "skip=true"`, lines 167-171) become DEAD CODE — the script already exited before reaching them. Instead of a clean `skip=true` no-op exit, the job ends with a **red failure**. This defeats the documented fail-safe and breaks the very error path the design intends. Triggers whenever `head_commit.message` carries `bkit [auto route]` (so the free-tier gate passed) but the PR body marker is missing/edited/malformed (human-edited PR body, PR predating the marker convention, etc.). Contrast: the kill-switch line `ISSUE_LABELS=$(gh issue view ... || echo "")` (line 174) IS guarded — the two SHARED-DERIV greps are not.

**Suggested fix:** Add a failure guard to each grep assignment, e.g. `ISSUE=$(echo "$PR_BODY" | grep -oP '...' | head -1 || true)` and same for `FID` (or `|| echo ""`). Then the existing `if [ -z ... ]` fallback runs as designed. Mirror the fix in both the canonical file and the template (they must stay byte-identical per the T3.1 test).

### MEDIUM — mechanical — `.agents/workflows/bkit-build.md:953-985` (and debug `bkit-debug.md:793-841`)

**What breaks:** `AUTO_ROUTE_SUFFIX` is assigned in the Step-18 sub-step-2 fenced bash block (`:953-958`) but consumed in two SEPARATE fenced bash blocks — the HEAD-Subject assertion (`:960-966`) and the commit block (`:976`). Shell variables do not survive across independently-executed fenced blocks. If the orchestrator agent runs each ```bash block in a fresh shell (bkit's normal block-granular execution model), `AUTO_ROUTE_SUFFIX`is unset in the commit block → the`bkit [auto route]` marker is silently dropped → an opted-in build's close-workflow commit never carries the marker → the free-tier CI gate (`contains(head_commit.message,'bkit [auto route]')`) never fires for that build.

**Why it's a bug:** Silent no-op of the entire opt-in path. No error is raised (without `set -u`, `${AUTO_ROUTE_SUFFIX}` expands to empty). The same multi-block split exists in debug Step 12 (`AUTO_ROUTE_SUFFIX` set at `:471-472`, consumed at the close-workflow commit `:486` and the create-pr commit `:540` — even further apart, across the PR-creation branch).

**Suggested fix:** Either (a) compute `AUTO_ROUTE_SUFFIX` inside the SAME fenced block that builds the commit (re-derive from `${LABELS:-}` immediately before the `git commit` line), or (b) add an explicit instruction that these blocks share one shell session / persist the value to a file (e.g. write to `$REPO_ROOT/.../.auto-route` and read it back). Option (a) is the smaller, more robust edit.

### LOW (nit) — mechanical — `.agents/scripts/bkit-manifest.ts:219-235` + `bkit-install.ts:759`/`bkit-uninstall.ts:181`

**What:** DECISION-D states uninstall must "remove ONLY the recorded variant's files" so the split is "mechanical." But the variant-split exports `CLOUD_MANIFEST_CLAUDE` / `CLOUD_MANIFEST_CURSOR` are referenced ONLY by `bkit-manifest.test.ts`; the live uninstall path resolves `cloud` → the combined union `CLOUD_MANIFEST` (all 4 files) via `MODULE_MANIFESTS.cloud` and never reads `bkit.cloudAgents`. **Why it's only a nit:** the union-removal direction is safe — uninstall removes whichever variant's files are present and silently skips absent ones (a claude install never created `.cursor/*`, so removing the absent `.cursor/*` is a no-op). No orphaning, no wrong-file deletion in practice. The split achieves variant-correct _install_ (the real win) but the stated variant-correct _uninstall_ is unrealized; the exported per-variant manifests are effectively test-only. **Suggested fix (optional):** either wire uninstall to read `readConsumerCloudAgents(cwd)` and pass the matching per-variant manifest, or update the DECISION-D note / comments to state that uninstall intentionally removes the union (zero-footprint) and the split exists for install emission.

### LOW (nit) — mechanical — `.github/workflows/bkit-cloud.yml:185`

**What:** `echo "fid=${FID:-$ARG}" >> "$GITHUB_OUTPUT"` sets a `fid` step output that no downstream step consumes (the dispatch step uses only `outputs.phase` and `outputs.arg`). Dead output. **Why it's only a nit:** harmless; costs nothing at runtime. **Suggested fix:** drop the line, or wire `fid` into the prompt/run-name if it was intended to be used.

### INFO (not a defect) — job-level `if: |` + `${{ }}` wrapper — `.github/workflows/bkit-cloud.yml:95-102`

Verified the job `if:` parses to the string `"${{ \n ... \n }}\n"`. GitHub Actions strips a whole-value `${{ }}` wrapper (surrounding whitespace/newline tolerated) and evaluates the boolean — this multi-line wrapped form is valid and returns a real boolean (NOT the "string is always truthy" footgun, which only bites unwrapped string literals). Fail-closed semantics confirmed by trace: non-`workflow_dispatch` + marker-absent → `false` → job skipped, zero runner minutes. Deny-list grep (`\[skip ci\]|\[ci skip\]|\[no ci\]|\[skip actions\]|\[actions skip\]`) correctly passes `bkit [auto route]`/`bkit [verbose ci]`/`bkit [force build]` (none contain a suppressor substring) and catches all `[skip ci]` variants. `contains()` substring match for `bkit [auto route]` survives the `bkit [verbose ci]` co-suffix. No over/under-match found. `claude.yml` `if:` uses the bare (un-wrapped) `if: |` form, which is also valid — the two files differ in style but both are correct.

### MEDIUM — mechanical — `.agents/scripts/bkit-install.ts:964-983` vs `:990-1002`

**What breaks:** The `--tracker=` value is persisted to `package.json` (`bkit.issueTracker`, lines 964-983) BEFORE the symmetric cloud/tracker constraint check (lines 990-1002). For a mismatched command like `bkit install --tracker=github --cloud=cursor`: the tracker-switch block passes (first-set/matching), `bkit.issueTracker="github"` is WRITTEN to package.json, then the cloud/tracker constraint fires (`cursor` requires `linear` != resolved `github`) and `process.exit(1)`.

**Why it's a bug:** The constraint comment at :989 claims "Mismatch is a hard error before any module dispatch — no files written," but package.json IS mutated before the exit. Net effect: a failed install leaves the tracker recorded. The next attempt `bkit install --cloud=cursor --tracker=linear` then trips the tracker-switch hard-block (now `github` is recorded, switching to `linear` needs `--force`) — so a single user typo strands the consumer into needing `--force`, and they may not understand why. The state write is non-atomic w.r.t. the overall command outcome.

**Suggested fix:** Hoist the cloud/tracker constraint check (lines 990-1002) ABOVE the package.json persistence (move it before line 944's `if (tracker !== null)` write, computing `issueTracker` from `tracker ?? recorded ?? default` first, validating, and only persisting after all hard-error gates pass). Keep the "no state written on hard error" invariant the comment already promises.

### LOW (nit) — mechanical — `.agents/scripts/bkit-cli.ts:214-220` + `bkit-install.ts` (no recorded-variant read for check)

**What:** Bare `--cloud` now hard-errors for every verb except `uninstall` (`:215`). For `check`/`upgrade`, the variant is required explicitly (`--cloud=claude`), but unlike `uninstall` the check/upgrade flow never reads `bkit.cloudAgents` from package.json — so `bkit check --cloud=claude` run against a cursor-installed repo would dry-run the _claude_ writeset and report phantom drift, while bare `bkit check --cloud` (the old idiom) is simply rejected. **Why it's only a nit:** the load-bearing drift gate is `bkit check` / `bkit check --full` (no `--cloud`), and `runCloudModule` defaults `cloudVariant ?? "claude"`, so the full-stack check still behaves. **Suggested fix:** mirror uninstall — for `check`/`upgrade`, accept bare `--cloud` and resolve the variant from recorded `bkit.cloudAgents` (claude/cursor) so drift detection matches what is actually installed.

### LOW (nit) — doc staleness — `docs/decisions.md:291`

DE-21 still cites a "new `bkit.cloud` variant field" for enforcement state, but DECISION-C AMENDED (2026-05-27) collapsed presence+variant into the single `bkit.cloudAgents` (`claude`|`cursor`|`none`) field and explicitly says "NO separate `bkit.cloud` field." The shipped code (`parseCloudAgents`, `CLOUD_MODES`) uses only `bkit.cloudAgents`. **Suggested fix:** update DE-21's parenthetical to `bkit.cloudAgents` to match the amended decision and the code.
