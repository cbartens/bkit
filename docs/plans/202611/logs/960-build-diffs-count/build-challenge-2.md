Verdict: CONCERNS
Failures: 3
Fingerprint: 557a530f6989df417cf61a8d9f4d606c179644014546495d3b5146da06c9e42d
<!-- verdict:end -->

# Build Challenge

Lens: Security — auth, secrets, input validation, data exposure, OWASP, data-access policies / tenancy.

## Scope

- Diff: `tmp/bkit-diff-960-build-diffs-count.md`, read in full (1692 lines; no `partial diff coverage` marker). Long documentation table rows were read cut to their first 500-900 characters; every engine, `dist/`, test, workflow and prompt hunk was read whole.
- Plan: `docs/plans/202611/960-build-diffs-count-plan.md`.
- Docs: `.agents/docs.md`, `docs/security.md` (§ Untrusted Content & Prompt Injection, § Scope, § Shell Injection, § PII, § RLS). `docs/data-schema.md` is listed for Build but bkit has no database, so it does not apply.
- Code read outside the diff: `startSha` output and `openSharedRecord` in `.bkit/core/engine/commands/workflow/worktrees.ts:143,1074,1255`; `fetchRemoteRef` in `.bkit/core/engine/commands/workflow/branches.ts:1047`; ship's diff readers in `.bkit/core/workflows/bkit-ship.md:109,530,537`; the new decision row `960-feature-base-start-commit` in `docs/decisions.jsonl`.

## Notes

- Vectors with no finding: authentication and authorisation, RLS and tenancy (`docs/security.md` § RLS: bkit has no database), secrets (no key, token or credential added; the new log line in `featureBase` prints only a commit sha), PII (none logged), supply chain (no new dependency), and shell injection (every new git call goes through `git` / `runGit` with an argument array; the refs are constants or engine-produced shas; `{BASE_FLAG}` expands only to `--base={startSha}`, a sha the engine wrote).
- `dist/commands/workflow/feature-base.js` matches `.bkit/core/engine/commands/workflow/feature-base.ts` line for line, so the shipped build carries no logic the source review did not see.
- An explicit `--base` value is still interpolated into the `git rev-parse` and `git diff` ranges, but every verb checks it with `rev-parse --verify {base}^{commit}` first. This diff does not change that, so it is out of scope.
- In-place `/bkit-debug` on `dev` always gets a `startSha` (`openSharedRecord` writes the shared-checkout record for every adopted run on `dev`), so its no-leak scan keeps `--base={startSha}` and is unchanged. The exposure in Task 1, Task 2 and Task 3 is the off-`dev` path, where `{BASE_FLAG}` is empty.
- Task 1 cross-reference: `docs/security.md` § Untrusted Content & Prompt Injection says the load-bearing controls are structural, including scanning any text that reaches a privileged action. The debug no-leak scan and the security challenge are such controls. The only remaining guard against unpushed `dev` commits riding a feature PR is an advisory log line in `devBase`. The new decision row `960-feature-base-start-commit` records no accepted risk for what the PR publishes.
- Task 1 also reaches ship, which this diff does not edit: ship Step 5 (`.bkit/core/workflows/bkit-ship.md:530`) calls `context diff` with no `--base`, so its diff now starts at `featureBase`, while the same agent's Context says the diff base is `origin/dev` (`.bkit/core/workflows/bkit-ship.md:537`).
- Task 2 and Task 3 cross-reference: `challenge gate` keeps `git fetch origin dev` so a stale or rewritten remote ref cannot shrink the measured range. `featureBase` now also reads `refs/heads/dev`, which no fetch refreshes, and `scan-diff` without `--base` skips the fetch entirely.
- The plan's Documentation Consultation marks `docs/security.md` as not applicable ("no credential or permission change"). The diff does change what the security review and the no-leak scan see, which is in this lens.
- Each TEST FIRST entry was read against the code the diff leaves: each test fails there and cannot already pass. No existing plan task or test covers these findings; plan Task 2's `scan-diff` test asserts the opposite of Task 1's.

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** Unpushed local `dev` commits ride the feature push and PR into `origin/dev`, but the default-base gates no longer see them: a failed in-place `/bkit-debug` on `dev` leaves `[DEBUG-OBSERVE]` instrumentation commits on local `dev`, the next branch is cut from local `dev`, and the off-`dev` debug no-leak scan, the migration `FORCE_BUILD` scan, the challenge size gate, the security reviewer's diff and ship Step 5's diff all measure from `featureBase`, so the marker lines and migrations reach `origin/dev` unreviewed and unscanned
  **Severity:** HIGH · **Class:** architectural · **Fixable:** false · **Location:** `.bkit/core/engine/commands/workflow/branches.ts:1692` · **Round:** 1
  - **DONE WHEN:** No agent can settle this, because plan Task 2 deliberately makes `scan-diff` without `--base` leave out unpushed local `dev` commits, and its test `scan-diff without --base ignores a match that only an unpushed local dev commit adds` asserts that. The owner decides one of: (a) the readers that guard what gets published (the `scan-diff` no-leak and migration scans, the security challenge diff, ship's pre-merge diff) measure what the push publishes (`origin/dev...HEAD`), while only the attribution readers (the size gate, the holistic test base) use `featureBase`; (b) an engine guard refuses the feature push or `prs open` while the branch carries commits that are on local `dev` but not on `origin/dev`; or (c) an accepted-risk decision recorded in `docs/decisions.jsonl` and `docs/security.md`.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `scan-diff --expect-none without --base fails when the branch carries an unpushed local dev commit adding a [DEBUG-OBSERVE] line` fails on `scan-diff` exiting 0, because `featureBase` returns the unpushed commit and the range `{sha}..HEAD` leaves its marker line out
<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->
- [ ] **TASK 2:** Moving local `dev` onto the branch tip (`git update-ref refs/heads/dev HEAD`, or a local merge of the feature into `dev`) makes `featureBase` return HEAD, so every default diff is empty with no log line: `challenge gate` sizes 0 lines as small, the security reviewer reads an empty diff, and the migration and no-leak scans pass; the `git fetch origin dev` the gate runs to resist a stale or forged base no longer helps, because the never-fetched local ref wins whenever it is later
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/feature-base.ts:22` · **Round:** 1
  - **DONE WHEN:** `featureBase` uses the local `dev` meeting point only when local `dev` does not contain HEAD (HEAD is not an ancestor of `refs/heads/dev`); otherwise it returns the `origin/dev` meeting point and logs one line naming the reason, so `defaultRange` gives `origin/dev...HEAD` and the branch's own commits stay in the diff
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/feature-base.test.ts` `featureBase ignores a local dev that already contains HEAD and returns the origin/dev meeting point` fails on `featureBase` returning HEAD, because `isAncestor(o, l)` is true when the merge-base of HEAD and `dev` is HEAD itself
    - `.bkit/core/engine/commands/workflow/context.test.ts` `context diff without --base keeps the branch's commits when local dev points at HEAD` fails on the artifact reporting `filesChanged: 0`
<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->
- [ ] **TASK 3:** `branches scan-diff` without `--base` no longer fetches `origin/dev` before it measures, so a stale or locally rewritten `refs/remotes/origin/dev` (`git update-ref refs/remotes/origin/dev HEAD`) makes `featureBase` return HEAD and the debug no-leak scan (`--marker="[DEBUG-OBSERVE]" --expect-none`) and the build migration scan pass on an empty range; before this diff, `--base=origin/dev` force-fetched the ref and overwrote the rewritten value
  **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/branches.ts:1694` · **Round:** 1
  - **DONE WHEN:** `scanDiffVerb` with no `--base` runs `fetchRemoteRef(top, "origin/dev")` before it calls `defaultRange`, and logs a failed fetch the way the explicit-base path does, so the default range is measured from the fetched `origin/dev`
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `scan-diff without --base fetches origin/dev before it measures the default range` fails on `scan-diff --marker=[DEBUG-OBSERVE] --expect-none` exiting 0 after the test points `refs/remotes/origin/dev` at a branch HEAD that adds a marker line, because no fetch restores the remote ref and the range `origin/dev...HEAD` is empty
<!-- bkit:task 3 end -->
