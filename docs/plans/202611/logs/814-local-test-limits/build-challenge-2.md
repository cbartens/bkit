Verdict: PASS
Failures: 0
Fingerprint: e48d865685f6d7b5e6f9470f68a527640f75368be6eccecb24bf54293819fa42
<!-- verdict:end -->

## Scope

- Inputs: `docs/plans/202611/814-local-test-limits-plan.md` and `tmp/bkit-diff-814-local-test-limits.md` (full coverage; the first line carries no `partial diff coverage` marker).
- Docs: `.agents/docs.md` read; `docs/security.md` present and read in full (§ Untrusted Content & Prompt Injection, § Secrets Management, § Shell Injection, § CI Auto-Route Trust, § PII, § RLS).
- The diff holds more than the #814 plan. Besides the fixed local limits (`vitest.timeout-budget.ts`, `vitest.config.ts`, `vitest.setup.ts`, `scripts/ci/bkit-test-limits.*`, `tests/shell/setup_suite.bash`, `localLimit` wraps across engine tests), it carries the pre-push PR conflict check (`.husky/pre-push`, `.bkit/templates/.husky/pre-push`, `pre-push-pr-conflict` tip), the `knowledge` ledger writer widening (`.bkit/core/engine/ledgers/telemetry.ts`), the ship MCP check-run fallback, and the Local pre-commit / Local tests first rule rewording with their rendered mirrors. All of it was challenged, because it is in the supplied diff.

## Method

- Read in full: both pre-push hook hunks (byte-identical apart from hunk offsets), `vitest.timeout-budget.ts`, `vitest.config.ts`, `vitest.setup.ts`, `scripts/ci/bkit-test-limits.*`, `tests/shell/setup_suite.bash`, `telemetry.ts` and its test, `catalogue.ts` and its test, `prs.ts`, the `.bkit/core/prompts/*` and `.bkit/core/workflows/*` hunks, `.bkit/core/.agents/rules.md`, `.bkit/core/.bkit/jsonl.md`, `.bkit/core/.bkit/templates.md`, the `husky-pre-push.integration.test.ts` fixtures (stub `gh` / `git` / `pnpm`, PATH and env handling), `tracker.integration.test.ts`, and the added and removed lines of the ledger and `docs/*` hunks.
- Rendered host mirrors (`.claude/`, `.cursor/`, `.opencode/`, `.codex/`, `.agents/`) and test bodies re-indented by the `localLimit` wraps were checked by pattern: added lines for `execSync`, `shell: true`, secret names, `Bearer`, `eval`; removed lines for security words; paired +/- lines in `cloud-env.integration.test.ts`, `ci.test.ts` and `install.integration.test.ts` differ only in indentation. Every removed test title is re-added except the deleted load-planning tests, plus `preserves substantive step results under every comment boundary fault`, which is split into one `it.each` case per boundary.

## Notes

- Time limits: `limitFactor` reads only `env.CI`. No secret, input or data boundary is involved. Longer local limits change when `vitest.child-deadline.ts` kills a hung child, not what it kills.
- Pre-push PR lookup: `PR_TARGET_OWNER` / `PR_TARGET_NAME` come from the push URL in `$2` and are allowlisted to `[A-Za-z0-9._-]` before they are spliced into the `--jq` program, so no jq or shell injection. `$BRANCH` reaches `gh` quoted, as one argument. A fork PR with the same head branch name is ignored unless its head repository is the push target, and a full page of 1000 non-matching PRs makes the `[skip ci]` guard block instead of reading "no PR".
- Pre-push base fetch and trial merge: `PR_BASE` comes from the GitHub API and is always double-quoted; git ref-name rules forbid space, `:` and control characters, so the `+refs/heads/$PR_BASE:refs/remotes/origin/$PR_BASE` refspec and the `refs/remotes/origin/$PR_BASE` merge-tree argument cannot be bent into options or extra refspecs.
- Already recorded, not re-raised (`docs/deferrals.jsonl`, LOW build-challenge rows of the earlier pre-push run): a base branch named like `base;id` turns the printed Fix line into a runnable command for an agent that pastes it; `echo "$PR_MERGE_OUT"` under a POSIX `sh` expands the `\033` that git's path quoting leaves, so a collaborator-named file can emit a terminal escape; two open same-repo PRs keep only the first. Each needs repo write access.
- `BKIT_PR_CONFLICT_CHECK=false` is a local convenience switch on a developer-side hook, not a security control; CI still reports the conflict.
- Hook tests: every case that removes `gh` uses `pathWithoutGh()` (stubs plus a fixed system-tool list), every other case installs a stub `gh`, and the work repo's `origin` is a local bare path, so the real `gh` and the developer's `GH_TOKEN` are never sent to GitHub.
- `knowledge` writers widened to `ANY_WRITER`: any agent, including one that reads untrusted CI logs or diffs, can now append rows that Plan / Build / Debug agents read under Check gotchas first. Not counted as a finding: the owner recorded it as decision `any-agent-writes-knowledge` in `docs/decisions.jsonl`, `failure` rows already allow any writer, and `by` is self-declared by the caller, so the old subagent list was never an enforced boundary. The control that matters stays the one `docs/security.md` § Untrusted Content & Prompt Injection names: rows land in committed, reviewed files.
- Ship MCP check fallback: `get_status` returns commit statuses only, so it never saw GitHub Actions check runs; `get_check_runs` now does. A repo whose only checks are commit statuses gets no check runs back, which routes to the Failure Path (fail closed), and the Step 10 merge gate still re-reads CI.
- Secrets / PII: no hardcoded key, token or connection string added (`{env:BKIT_OPENCODE_API_KEY}` in `install.integration.test.ts` is a reference placeholder). The removed `[test-timeout-budget]` warning logged only load average and core count. No RLS, tenancy or user-auth surface exists (`docs/security.md` § Scope, § RLS).
- Supply chain: no new dependency.
