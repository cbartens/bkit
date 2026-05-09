Verdict: CONCERNS
Failures: 5

<!-- verdict:end -->

# Plan Review

## CRITICAL

1. **DE-14 / DE-15 already exist in `docs/decisions.md`** (lines 156–174) yet the plan instructs `Append DE-14: bkit-ci-router via claude-code-action (Option 1)` and `Append DE-15: Router as separate workflow (not Step 18 of bkit-build)` (Architecture & Component Changes → Documentation Surface, and Documentation Updates table row, and Phase D4). Executing the runbook as written would create duplicate ADR entries. Decisions are append-only per `.agents/docs.md`, so this is a real corruption hazard. Plan must rephrase D4 to "verify DE-14 + DE-15 already present; no further append needed" OR justify a `DE-N` follow-on entry that does not duplicate the prior decision text.

2. **Pending entries already exist in `docs/pending.md`** (lines 143–161 — `Per-PR opt-in alternative to bkit:auto-route Linear label` and `Router dead-letter / retry policy if claude-code-action@v1 crashes mid-step`). Phase D7 says "Append two deferral entries" — same duplication hazard. Rephrase to "verify both pending entries already present".

3. **`runCiRouterModule` in MODULE_REGISTRY / MODULE_DISPATCH_ORDER vs. `ModuleFlag` union — incomplete plumbing.** `.agents/scripts/bkit-cli.ts:4` defines `ModuleFlag = "core" | "claude" | "cursor" | "ci" | "lint" | "git-hooks" | "full"` and the same file maintains `MODULE_FLAGS` (line 36) and `ALL_MODULES` (line 47). The plan's Phase B touches `bkit-modules.ts` and `bkit-cli.ts` but is silent about extending the `ModuleFlag` union, the `MODULE_FLAGS` set, and `ALL_MODULES` array. Without them `--ci-router` will not parse and will not be picked up by `--full` / `bkit install`. Add explicit `[MODIFY]` entries that name the union, the parser set, and the all-modules array.

4. **`get_issue` Linear MCP call inside the runner-side orchestrator violates the Two-Layer Separation Rule** documented in `.agents/workflows.md` lines 53–65 (Linear MCP is workflow-layer exclusive; agents are leaves). The Bkit Orchestrator Step skeleton step 3 (Label Gate) calls `get_issue({ id: ISSUE_ID })` from inside `bkit-ci-router.md` — which IS a workflow file (`.agents/workflows/bkit-ci-router.md`), so this is technically allowed. BUT `{ISSUE_ID}` is not derivable from `status.json` alone in a fresh runner session — `status.json` shape (per `.agents/workflows.md` § status.json) holds `workflow`, `startedAt`, `status`, `steps[]` only. There is no `issueId`/`commentId` field. Plan must either (a) extend `status.json` shape with `issueId` + `commentId` at workflow start (and propagate to all 5 existing orchestrators that init it), or (b) recover `ISSUE_ID` from FID via the existing Linear `Build` label search pattern. Currently the plan claims `Data Schema Changes: None`, which is inconsistent with the runner needing these IDs.

5. **`workflow_run` branch filter does not work as written.** Plan's GHA workflow uses `branches: [feat/**]` under `on.workflow_run`. Per GitHub Actions docs, `workflow_run.branches` does NOT support glob expansion the same way `push.branches` does — it accepts patterns but the plan should confirm with a literal reference. The plan also redundantly re-asserts `feat/**` in the orchestrator. More importantly: the plan never specifies what the upstream workflow's `name:` is — the consumer's CI workflow may not be named exactly `CI`. The bkit dogfood `templates/.github/workflows/ci.yml` has `name: CI`, but consumers can rename. Either pin the trigger to the exact CI workflow name and document the constraint, or add a fallback / make the workflow name a token-substituted template variable.

## OPTIONAL

1. **Concrete Example labelled `BAR-260`** but the FID slug is `bar-260-foo-bar`. Confirm BAR-260 is a real (or clearly hypothetical) issue. Suggest tagging it `(hypothetical)` to avoid confusion.

2. **Stale-run guard race window.** Between `gh run list ... --limit 1` and `gh pr view ... --json headRefOid`, a new push can land. Plan should re-read both atomically once and document the race acceptance.

3. **Runner 6h ceiling math is shaky.** `350` minutes ≤ 360 (6h cap) leaves only 10 minutes of headroom; debug-x3 attempts at 3600s each = 10800s = 180 minutes plus checkout / setup / Claude warmup. Numerically this fits, but no buffer for a long-running ship. Recommend dropping to ~330 minutes or adding a per-attempt soft-cap doc note.

4. **Test matrix row "router orchestrator authoring conventions pass `bkit check`"** — `bkit check` is a drift-checker, not an authoring-conventions linter. The intended assertion belongs in `release-workflow.test.ts` (which the plan also targets). Pick one and remove the redundancy.

5. **Plan calls `claude_args` "--allowed-tools" sandbox a "lock"** but does not enumerate what `mcp__linear__*` reaches in the runner. List the explicit Linear MCP tools the router uses (`save_comment`, `get_issue`) for least-privilege auditability.

6. **Module dispatch order placement** — Plan places `ci-router` between `ci` and `lint`. Reasonable, but no rationale. If `ci-router` writes to `.github/workflows/`, ordering after `ci` makes semantic sense; document the ordering decision in the inline comment by analogy with the existing `ci → lint` rationale.

7. **CI router's `pnpm install --frozen-lockfile` step exists but the consumer router invocation does not need bkit's TS code on the runner.** If the orchestrator shells out to `gh`, `jq`, and Linear MCP only, `pnpm install` is dead weight (~30–60s per run). Either justify or drop.

8. **Phase D2 doc index update is vague** — "new workflow matrix column (or row, depending on existing shape)". Specify that `.agents/docs.md` Workflow Matrix gains a `Router` column AND a `bkit-ci-router.md` row in the catalog. Mirror to `.agents/templates/.agents/docs.md`.

## OUT OF SCOPE

1. Enforcing runner 6h ceiling beyond `MAX_DEBUG_ATTEMPT` — already explicitly out of scope.
2. Per-PR opt-in mechanism alternative to `bkit:auto-route` — already deferred to `docs/pending.md`.
3. Dead-letter queue / retry on `claude-code-action` crash — already deferred.
4. Cross-repo dispatch — explicitly out of scope.
5. Replacing `bkit-build` Step 17 with chained Step 18 dispatch — explicitly out of scope.

No additional scope-expansion suggestions required.
