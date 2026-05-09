Verdict: FAIL
Failures: 1

<!-- verdict:end -->

# Build Challenge

## Findings

### CRITICAL — C9f test will fail: `MAX_DEBUG_ATTEMPT` documented in router contradicts negative assertion

- **Severity:** CRITICAL
- **Class:** mechanical
- **Location:**
  - Test: `.agents/scripts/release-workflow.test.ts:412-415` (describe `C9f — router dispatches /bkit-debug unconditionally (no MAX_DEBUG_ATTEMPT pre-check) (matrix row 17)`)
  - Orchestrator: `.agents/workflows/bkit-ci-router.md:31`, `:294`, `:314`
- **Exploit / failure scenario:**
  - The router orchestrator INTENTIONALLY documents the constraint in three places:
    - Line 31: `> - **No MAX_DEBUG_ATTEMPT pre-check:** Router dispatches /bkit-debug unconditionally; the debug orchestrator's existing ceiling enforces handover. Router MUST NOT pre-empt by reading MAX_DEBUG_ATTEMPT.`
    - Line 294: `**Constraint:** Router MUST NOT check MAX_DEBUG_ATTEMPT before dispatching /bkit-debug. The debug orchestrator's own ceiling enforces the limit.`
    - Line 314: `- [ ] No MAX_DEBUG_ATTEMPT pre-check performed (debug ceiling is debug orchestrator's responsibility)`
  - The test asserts `expect(routerContent).not.toContain("MAX_DEBUG_ATTEMPT")` — this is a literal substring match against the entire orchestrator file.
  - On the very first `pnpm test` run after the router is authored, the test will fail with an AssertionError. This blocks the unit-test gate and prevents PR merge.
  - The test is logically inverted: it tries to enforce "no pre-check" by forbidding any mention of the constant — but documenting "do NOT use this" naturally requires naming it.
- **Suggested fix (mechanical, no design change):**
  - Replace the negative substring check with a structural assertion. For example, scan the `Step 6 — Dispatch` body and assert no shell read of `MAX_DEBUG_ATTEMPT` (i.e., no `${MAX_DEBUG_ATTEMPT}` or `[ "$MAX_DEBUG_ATTEMPT" …` pattern) rather than banning the literal token from documentation prose.
  - Concretely:
    ```ts
    // Permit documentation references; forbid actual shell read.
    expect(routerContent).not.toMatch(/\$\{?MAX_DEBUG_ATTEMPT\}?/);
    expect(routerContent).not.toMatch(/MAX_DEBUG_ATTEMPT[^A-Z_]\s*[<>=!-]/); // arithmetic/comparison usage
    ```
  - Alternatively, scope the check to a slice of the file delimited by `## 🤖 Step 6` heading and the next `---` rule, then run the substring check only against that slice (the constraint is documented OUTSIDE that slice in plain prose; the dispatch step body has no actual code reference).

## Other Areas Audited (no blocking issues)

- **`.github/workflows/bkit-ci-router.yml` permissions hardening:** present and minimal — `contents: read`, `pull-requests: write`, `issues: write`, `actions: read`. No write to contents. OK.
- **Concurrency guard:** `concurrency.group: bkit-ci-router-${{ github.event.workflow_run.head_branch }}` with `cancel-in-progress: true`. OK for matrix row 16 (C9e).
- **Stale-run guard in orchestrator:** present in `bkit-ci-router.md` Step 4 — compares `gh run list … headSha` against `gh pr view … headRefOid`, no-op exits on mismatch. OK for matrix row 13 (C9b).
- **`issueId` / `commentId` writes in 5 orchestrators (C8 / matrix row 11):** verified present in `bkit-plan.md:84`, `bkit-build.md:104`, `bkit-ship.md:103`, `bkit-debug.md:114`, `bkit-design.md:83` — all with `--arg iid "{ISSUE_ID}" --arg cid "{COMMENT_ID}"` and `issueId:$iid, commentId:$cid` in the status init JSON. OK.
- **Byte-identity test (C5b / matrix row 7):** `.github/workflows/bkit-ci-router.yml` and `.agents/templates/.github/workflows/bkit-ci-router.yml` are both 46 lines and identical on inspection. The test uses `Buffer.equals` over `fs.readFileSync(...)` (no encoding arg → returns Buffer). Feasible and currently green. OK.
- **`anthropics/claude-code-action@v1` env passthrough:** `CI_RUN_CONCLUSION`, `CI_RUN_HEAD_SHA`, `CI_RUN_HEAD_BRANCH`, `CI_RUN_URL` all wired through; matches the `process.env`-style reads inside `bkit-ci-router.md` Step 1. OK.
- **`.router-lock` namespacing:** distinct from `.lock` per orchestrator preamble; lock-age check uses 7200s threshold consistent with the 2h preamble note. OK.
- **No git writes from router:** orchestrator preamble explicitly forbids commit/push; status.json append + `.router-lock` only. OK.

## Risk-Adjacent Observations (non-blocking, FYI)

- **C8 substring window is fragile:** the test uses `content.slice(initIdx - 200, initIdx + 500)` to grep for `issueId` / `commentId`. If a future edit adds a long comment block before the JSON literal, the window may miss the field even though the orchestrator is correct. Not a current bug — fields are within window today. Consider tightening to a regex over the same statement (`'\. \+ \[\{workflow:"plan"[^}]*issueId:\$iid[^}]*commentId:\$cid'` etc.) in a follow-up.
- **C5b byte-identity is brittle by design:** any whitespace-only edit to either copy will fail the suite. This is the intended dogfood gate — flagging only because future maintainers may try to "format" one side without the other.

## Coverage

Full diff coverage: orchestrator `.agents/workflows/bkit-ci-router.md`, template `.agents/templates/.github/workflows/bkit-ci-router.yml`, dogfood `.github/workflows/bkit-ci-router.yml`, test file `.agents/scripts/release-workflow.test.ts` (BAR-148 sections), and the 5 status-init blocks in `bkit-{plan,build,ship,debug,design}.md` were all read. The C5/C5b template-side test was cross-referenced in `bkit-action-yaml.test.ts:215-339`.
