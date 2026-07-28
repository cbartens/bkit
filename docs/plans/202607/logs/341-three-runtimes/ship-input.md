# Ship Input — Issue #341

## Session Prompt

Ship workflow for issue #341 (Make workflows run in all runtimes: local, GH Actions, claude.ai).
FID: 341-three-runtimes
PR: #382 → dev

## Issue Description

## Premise

bkit's workflows were authored for a **local developer laptop**, but they now run in **three materially different runtimes**, and several steps assume capabilities only the laptop has. Running the phases via **claude.ai cloud agents** (Claude Code on the web) surfaced a cluster of deviations — including a _silent CI-suppression bug_ — that trace back to conflating these runtimes.

This issue records a working session that (a) dissected real deviations (the ship of **#703**; a `/bkit-design` run on **#616**), (b) root-caused the gh-auth flakiness, (c) researched the downsides of GitHub MCP, and (d) settled on a **direction** (§6). Still **document-only** — no code lands here.

**Guiding principle:** _make the one workflow run in all modes with **minimal, additive changes**_ — a global fallback rule + a gh→MCP tool map + retry/minimal-output rules + any-branch support — **not** a rewrite of every call site.

Related: **#134** (design→ship branch / artifact-trail model).

---

## 1. The three runtimes

| Dimension                        | **1. local** (laptop)                               | **2. gh-action runner** (bkit install cloud option)                                          | **3. claude.ai runner** (`.claude/cloud.md`)                             |
| -------------------------------- | --------------------------------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| **Triggered by**                 | dev runs `/bkit-*` in IDE                           | CI event/label → `.github/workflows/{claude,opencode,bkit-cloud}.yml` on `ubuntu-latest`     | user starts a session at claude.ai/code (or Auto-fix webhook)            |
| **gh CLI auth**                  | `gh auth login` keychain — **real token, reliable** | default `GITHUB_TOKEN` present, gh reads it — **reliable transport**                         | **fragile** (see §2)                                                     |
| **Write / merge token**          | dev's own creds (full)                              | **GH_BKIT_TOKEN** (PAT/App) or Claude App — _not_ `GITHUB_TOKEN` (read-only + won't fire CI) | real tokens kept out of sandbox; server-side merge needs the fragile PAT |
| **GitHub MCP / built-in**        | usually not configured                              | optional                                                                                     | **proxy-managed → auth-reliable, but see §5 downsides**                  |
| **git push**                     | unrestricted                                        | standard runner (branch-protection only)                                                     | **proxy-restricted to the current working branch**                       |
| **Worktree `.worktrees/{FID}`**  | native                                              | works                                                                                        | breaks — session is on `claude/…`, no worktrees                          |
| **Network egress (debug-fetch)** | full                                                | full                                                                                         | **Trusted allowlist**; app backends need a **Custom** allowlist          |
| **Autonomous merge to `dev`**    | ✅ gh                                               | ✅ gh (GH_BKIT_TOKEN/App)                                                                    | ✅ gh if authed, else MCP fallback (both server-side)                    |

Detection primitives exist: `CLAUDE_CODE_REMOTE=true` (mode 3), `GITHUB_ACTIONS`/`CI` (mode 2), neither (mode 1).

---

## 2. Root cause — why gh auth is flaky on the claude.ai runner (mode 3)

Claude Code on the web has **three auth lanes**; gh is the disadvantaged one _by design_: **git** (scoped proxy credential, push restricted to current branch), **built-in GitHub tools** (proxy-brokered, _"token never enters the container"_), and **`gh` CLI** (needs a real PAT inside the sandbox). Ranked reasons gh is flaky in mode 3:

1. **gh needs a real token the platform deliberately withholds.** Works only if `GH_BKIT_TOKEN`/`GH_TOKEN` is present + valid this session (`cloud.md`: dashboard env vars invisible to the snapshot setup script; `knowledge.jsonl` KN-CORE-1: 401 after rotation).
2. **Env-var precedence (the reported "invalid GH_TOKEN").** gh reads `GH_TOKEN`→`GITHUB_TOKEN` and an env token **overrides** `gh auth login` creds ([gh manual](https://cli.github.com/manual/gh_help_environment), [cli/cli#2922](https://github.com/cli/cli/issues/2922)). bkit uses `gh auth login --with-token` with a differently-named `GH_BKIT_TOKEN` (`cloud-bootstrap.sh:56-64`); a placeholder `GH_TOKEN` beats it.
3. **Go-binary TLS/proxy trust** — [anthropics/claude-code#26466](https://github.com/anthropics/claude-code/issues/26466) (`x509: certificate signed by unknown authority`); `api.github.com` is allowlisted, so it's a trust/proxy-auth failure, not a domain block.
4. **Silent, non-blocking bootstrap** — `cloud-bootstrap.sh` swallows failure with `|| log`; SessionStart hooks can't block.

**Takeaway:** gh's auth is _fixable_ in mode 3 (use the sanctioned `GH_TOKEN` env var, fix CA/proxy trust, add a loud preflight) — so the answer is **harden gh + fall back to MCP when it's still unavailable**, not abandon gh (the MCP downsides in §5 are why).

---

## 3. Observed deviations (tagged by mode)

**D1 — `[skip ci]` leaked into the squash-merge _body_ → CI suppressed on `dev`.** _(mode 3)_
Ship of **#703**: 16 commit messages concatenated into the merge body; one was `chore(690-header-nav-shell): worktree-setup bkit [skip ci]`. Actions scans subject **and** body, so `dev` ran no CI. **Chain:** gh unauthed (D2) → ad-hoc MCP `merge_pull_request` substitution → MCP ignored the empty `commit_message` (confirmed: no force-empty-body) → default concatenated body carried the token. Step 6.3 (`bkit-ship.md:537`) scans only the **PR title**; the backstop (`bkit-ship.md:557`) is a `gh run list`.

> **Mode-2 cousin:** default `GITHUB_TOKEN` writes **don't trigger CI** (`renovate.yml:41-44`) — why mode 2 writes via `GH_BKIT_TOKEN`/App.

**D2 — ad-hoc, unguarded tool substitution.** _(mode 3)_ gh and MCP auth independently, so cloud can have MCP-up / gh-down. Today the only gh-outage branch is `gh-error → abort` (`bkit-build.md:1301`, `bkit-debug.md:1024`), so when an agent _does_ improvise a fallback it's **uncontrolled** (→ D1). **Fix: replace ad-hoc improvisation with an explicit, mapped, rule-governed fallback** (§6), not a ban.

**D3 — worktree model vs. single session branch.** _(mode 3)_ `git worktree add .worktrees/{FID} feat/{FID}` + "`pwd` outside worktree → Failure Path" (`bkit-ship.md:30`); claude.ai session has no `.worktrees/`.

**D4 — FID coupled to the `feat/` branch name.** _(mode 3)_ `bkit-auto.md:86-87` rejects non-`feat/` branches (`FID="${BRANCH#feat/}"`); ship 2.4 (`bkit-ship.md:219`) + `bkit-cloud.yml` too. Plus the proxy restricts `git push` to the current branch, so `git push origin dev` / `feat/{FID}` push / `--delete` fail — **infrastructure, not policy**.

**D5 — `sleep`-based CI polling stalls.** _(mode 3)_ bkit polls CI with `sleep` (`bkit-ship.md:556` `sleep 30`; build/debug gates too); the claude.ai Bash tool **blocks foreground `sleep`** → needs a condition/event-driven wait.

---

## 4. Secondary breakage (mode 3)

- **`/bkit-debug` egress blindness** — external-CLI/backend fetches behind Trusted egress self-skip `exit 0` → silent "no runtime errors" (`.agents/config.md:18-126`, `bkit-debug.md:551-565`). Fix = allowlist + loudness.
- **e2e Playwright-report artifact seam** — `bkit-debug.md:528` `gh run download -n playwright-report`; **no MCP artifact-download tool**. Failure signal is in job logs (`get_job_logs`); only the rich report is lost.
- **Hard-coded macOS paths** — `docs/plans/template.md:191`, `.agents/skills/using-git-worktrees/SKILL.md:191`.

---

## 5. Downsides of GitHub MCP (why it's a fallback, not the default)

Research on the GitHub MCP server surfaced three real cost centres — the reason we do **not** standardise on it for the gh-covered surface:

**5a. Security — the "lethal trifecta" prompt-injection.** Invariant Labs (May 2025) showed a malicious **public** issue with hidden instructions can hijack an agent that later reads issues with a broad token into pulling **private**-repo data and exfiltrating it via its response. Described as **architectural, "no obvious fix."** bkit hits all three legs: `issue-scan` reads untrusted issue **bodies + comments**, holds a broad **`GH_BKIT_TOKEN`** write PAT, and can act (PR/commit/merge). _(Not strictly MCP-vs-gh — a gh agent reading the same issue is equally exposed — but it's a first-class constraint now.)_ **Mitigation: narrowest-scoped token + treat all tracker/PR/comment content as untrusted; never let it steer git/merge actions.** [Invariant](https://invariantlabs.ai/blog/mcp-github-vulnerability) · [Simon Willison](https://simonwillison.net/2025/May/26/github-mcp-exploited/) · [devclass](``https://devclass.com/2025/05/27/researchers-warn-of-prompt-injection-vulnerability-in-github-mcp-with-no-obvious-fix/``)

**5b. Context / token bloat.** ~93 tools ≈ **55k tokens** of schema; quality degrades past ~50 tools; verbose payloads are brutal (a 50-item list ≈ 100k tokens). _Mitigated here_ by deferred/searchable tools (ToolSearch) + toolset scoping + `minimal_output`, but response verbosity still costs on every call. [github-mcp-server#1286](https://github.com/github/github-mcp-server/issues/1286) · [getunblocked](https://getunblocked.com/blog/github-mcp-token-cost/) · [anthropics/claude-code#13717](https://github.com/anthropics/claude-code/issues/13717)

**5c. Reliability, cost, debuggability.** Remote MCP fails on **TCP timeouts** (one benchmark: 7/25 ≈ 72% vs gh CLI 100% — gh runs locally); ~**$55/mo vs ~$3** at 10k ops; MCP failures are **opaque** (no exit code/stderr to branch on) — friction for bkit's bash `|| Failure Path` gates. This **qualifies our earlier "MCP is the reliable lane"**: it's reliable on _auth_ in mode 3, but adds a remote-timeout failure mode gh doesn't have. [mariozechner](https://mariozechner.at/posts/2025-08-15-mcp-vs-cli/) · [Scalekit](https://www.scalekit.com/blog/mcp-vs-cli-use)

---

## 6. Direction (settled: gh primary, MCP fallback — details to investigate)

> **REVERSED from an earlier draft's "MCP everywhere."** gh remains **primary** for PR / CI / merge / repo-identity (correct `--body ""` merge semantics that avoid D1, local, debuggable, cheap, no MCP injection/verbosity amplification). MCP is a **controlled fallback**, only when gh is unavailable.

**6a. Harden gh in mode 3** so the fallback is rarely needed: prefer the sanctioned **`GH_TOKEN` env var** over `gh auth login --with-token`; fix Go-TLS/CA + proxy trust; add a **loud preflight** `gh auth status` (fail explicitly, never silent).

**6b. Global gh→MCP fallback rule (workflow header).** A single additive rule (not per-call rewrites): _"If a `gh` command is unavailable/unauthed, use the mapped MCP tool below; **retry with backoff** on timeout; request **minimal output**. The **merge** fallback MUST pass an explicit skip-token-free `commit_message`."_ This converts D2's dangerous improvisation into a deterministic, mapped path.

**6c. gh → MCP tool map** (reference):

| gh command                                      | MCP fallback                            | Notes                                                          |
| ----------------------------------------------- | --------------------------------------- | -------------------------------------------------------------- |
| `gh repo view --json nameWithOwner`             | `get_me` + context / parse `git remote` | identity                                                       |
| `gh pr create`                                  | `create_pull_request`                   |                                                                |
| `gh pr view {N} --json …`                       | `pull_request_read` (get)               | request minimal fields                                         |
| `gh pr list --head X`                           | `list_pull_requests`                    |                                                                |
| `gh pr merge {N} --squash`                      | `merge_pull_request`                    | ⚠ **pass explicit skip-free `commit_message`** (D1)            |
| `gh pr edit {N} --title`                        | `update_pull_request`                   |                                                                |
| `gh pr update-branch {N}`                       | `update_pull_request_branch`            |                                                                |
| `gh run list --branch X`                        | `actions_list`                          |                                                                |
| `gh run view {id} --json jobs` / `--log-failed` | `actions_get` / `get_job_logs`          |                                                                |
| `gh run download -n playwright-report`          | **— none —**                            | keep gh/`gh api` (§4 seam)                                     |
| `git push origin dev` (docs/status tail)        | `push_files` / `create_or_update_file`  | mode-3 only (git push to `dev` blocked); or land via PR (#134) |

**6d. D1 fix (all paths):** guarantee a skip-token-free merge body and extend Step 6.3 to scan the **resulting squash body**, not just the PR title; consider dropping `[skip ci]` from intermediate status-commit **subjects**.

**6e. Any-branch support:** _adopt-or-mint_ — if already on a non-`dev` working branch, adopt it (no worktree); else mint `feat/{FID}` (+ worktree). Requires **decoupling FID from the branch name** (`bkit-auto.md:86-87`, ship 2.4, `bkit-cloud.yml`).

**6f. Security constraint (first-class, all modes):** narrowest-scoped token; treat tracker/PR/comment content as untrusted.

**6g. Deferred — N2** (subagent fan-out vs shared account rate budget, [docs Limitations](https://code.claude.com/docs/en/claude-code-on-the-web)): revisit only if hit; fix would be mode-tuned concurrency pacing.

**6h. #134 stays optional** — the only op that truly can't be gh in mode 3 is the `git push origin dev` docs/status tail (it's git, not gh, and the proxy blocks it). Handle via the `push_files` fallback **or** by landing status/docs through the PR (#134) — but #134 is not _forced_.

**6i. Trackers stay on MCP (resolved — was §8.2).** Because the gh-primary **+ MCP-fallback** model keeps the GitHub MCP server **present anyway** (6b needs it), converting the `github` tracker blocks to `gh` would remove **no** surface (the server can't be dropped) while **losing** three real benefits:

- **Provider symmetry** — every tracker call site is a `github`/`linear` pair; **Linear is MCP-only (no CLI)**, so "everything is an MCP call" is what keeps the two providers uniform (`.bkit/trackers.md`). gh-ifying GitHub breaks the pair model + the `bkit-trackers.ts` resolver.
- **Rich markdown bodies** — MCP takes issue/comment bodies as **structured strings**; `gh` needs fragile shell-escaping for bkit's multi-line summaries/handoff blocks/comments.
- **Cleaner Projects v2** — `projects_write` vs hand-written `gh api graphql`.

Security is neutral (reading untrusted issue content is a risk with `gh` too — mitigated by 6f regardless). → **Keep tracker ops (issue/label/comment/search/projects) on MCP.** The gh→MCP fallback (6b) applies only to the gh-covered PR/CI/merge surface.

---

## 7. Prerequisites & seams (implementation-time)

- **Branch protection on `dev`** must permit the autonomous merge (status-checks-only, no required human review).
- **Head-branch cleanup has no MCP tool** (`merge_pull_request` has no `delete_branch`) → rely on the repo **"Automatically delete head branches"** setting.
- **D5:** replace `sleep` CI-polling with a condition/event-driven wait.
- Cleared non-issues: `npm.pkg.github.com` **is** allowlisted; the full MCP write surface **is** present in mode 3 (so the fallback is viable).

---

## 8. Open decisions / to investigate

1. **Investigate the gh→MCP fallback mechanism** (6b/6c) end-to-end: detection of "gh unavailable," retry/backoff shape, minimal-output patterns, and how the mapped MCP calls fit bkit's bash-gate control flow.
2. **Artifact seam:** job-logs-only for cloud e2e, or one sanctioned `gh api`/`curl` exception?
3. **`dev` config:** confirm branch protection allows the autonomous merge; enable auto-delete-head-branches.

_Resolved: "do GitHub trackers also move off MCP?" → **no**, keep on MCP (see §6i). "gh vs MCP per mode" → gh primary + MCP fallback (§6). N2 → deferred (§6g)._

---

## Evidence

- **Repo:** `cloud-bootstrap.sh:56-64`; `bkit-ship.md:30,219,537,556,557`; `bkit-auto.md:86-87`; `bkit-build.md:1301`/`bkit-debug.md:1024`; `bkit-debug.md:528,551-565`; `.agents/config.md:18-126`; `.bkit/trackers.md`; `renovate.yml:41-44`; `claude.yml:40`; `knowledge.jsonl` KN-CORE-1; `decisions.jsonl` (Claude-App/OIDC cloud tracker auth).
- **Docs (Claude Code on the web):** proxy restricts push to current branch; token never in container; `GH_TOKEN` env for gh; Trusted allowlist incl. `api.github.com` + `npm.pkg.github.com`; 30 GB disk; snapshot caches files-not-processes; shared account rate limits.
- **External:** [Claude Code on the web](https://code.claude.com/docs/en/claude-code-on-the-web) · [sandboxing](https://www.anthropic.com/engineering/claude-code-sandboxing) · [gh precedence](https://cli.github.com/manual/gh_help_environment) · [cli/cli#2922](https://github.com/cli/cli/issues/2922) · [claude-code#26466](https://github.com/anthropics/claude-code/issues/26466) · **MCP downsides:** [Invariant](https://invariantlabs.ai/blog/mcp-github-vulnerability) · [Willison](https://simonwillison.net/2025/May/26/github-mcp-exploited/) · [devclass](``https://devclass.com/2025/05/27/researchers-warn-of-prompt-injection-vulnerability-in-github-mcp-with-no-obvious-fix/``) · [github-mcp-server#1286](https://github.com/github/github-mcp-server/issues/1286) · [getunblocked](https://getunblocked.com/blog/github-mcp-token-cost/) · [mariozechner](https://mariozechner.at/posts/2025-08-15-mcp-vs-cli/) · [Scalekit](https://www.scalekit.com/blog/mcp-vs-cli-use)

_Working session record. §6 is the settled direction (fallback details to investigate, §8); not yet scoped into tasks._

---

## Recent Comments (last 10)

### Comment by null at 2026-07-24T02:27:51Z

### Step 10 — Reconcile Build Challenge - Verdict: CONCERNS - Failures: 0 - Attempt: 0

---

### Comment by null at 2026-07-24T02:33:18Z

### Step 11 — Build Challenge Remediate - Verdict: FAIL - Attempt: 1

---

### Comment by null at 2026-07-24T02:34:04Z

### Workflow Failure

Step: 11 — Build Challenge Remediate; Sub-step: 7 (routing)
Error: REMEDIATE_CHALLENGE_VERDICT = FAIL. Finding 4 (marker-primary FID reorder in `.bkit/workflows/bkit-auto.md:9-10`, D9 — untrusted PR-body FID marker flows unvalidated into `docs/plans/.../{FID}` and `.worktrees/{FID}` filesystem paths, enabling `../..` path traversal) is `class=architectural` and ended `BLOCKED` with no later `DONE`, per the remediate subagent's own verdict-mapping contract (architectural/CRITICAL findings left BLOCKED force FAIL, never silently downgraded). Findings 1-3 (D24 CI-suppression-token gap, GNU-`timeout` macOS absence, EXIT-trap command injection) were remediated DONE and verified green (typecheck, vitest 2484 passed, format:check, lint:slop, lint:prose, bats — all pass). Finding 4 logged to `docs/deferrals.jsonl`.
Stderr: n/a (verdict routing, not a tool/command failure)
---

### Comment by null at 2026-07-24T04:07:48Z

### F4 Remediation — architectural finding resolved, build resumed

The build-challenge routed to Failure Path at Step 11 because finding **F4** was `class=architectural` and left `BLOCKED` (architectural findings are never patched inline by the remediate subagent — they force `FAIL` and a human decision). That decision is made; F4 is now fixed, verified, and the build is resuming toward a PR. `bkit:failed` dropped.

**F4 — untrusted PR-body FID marker → path traversal.** `bkit-auto` step 9 (D9 marker-primary) resolved `{FID}` from the collaborator-editable PR-body marker (`<!-- bkit:fid={FID} -->`) and passed it into filesystem paths (`docs/plans/.../{FID}/`, `.worktrees/{FID}`) and downstream `/bkit-*` dispatch with **no slug validation** — the one FID-resolution site in the workflow suite that skipped the assertion the five phase workflows apply at mint time. A marker like `bkit:fid=../../elsewhere` could redirect writes.

**Fix** (commit `75434b0c`, branch `feat/341-three-runtimes`):

| Exit point              | Guard                        |
| ----------------------- | ---------------------------- |
| step 9 — github         | `^[0-9]+-[a-z0-9-]+$`        |
| step 9 — linear         | `^[a-z]+-[0-9]+-[a-z0-9-]+$` |
| step 9 — no-tracker     | `^[a-z0-9][a-z0-9-]*$`       |
| step 10 — branch-derive | `^[a-z0-9][a-z0-9-]*$`       |

All reject `/`, `.`, `..`, and shell metacharacters. Marker failing the assert → branch-derive fallback; branch-derive failing it → Failure Path.

- `docs/security.md` § CI Auto-Route Trust records the allowlist doctrine (the deferral's prescribed remediation).
- `.bkit/src/bkit-auto-fid-guard.test.ts` — 39 cases (regex rejects an 11-vector traversal/injection corpus + accepts valid FIDs; presence at every exit point).
- `docs/deferrals.jsonl` F4 row `OPEN → CLOSED`; durable `docs/knowledge.jsonl` gotcha added; `.claude`/`.cursor`/`.opencode` mirrors regenerated.

**Verification:** an independent adversarial security re-challenge returned **PASS / 0 failures / no regression** ([build-challenge-verify-f4.md](https://github.com/cbartens/bkit/blob/feat/341-three-runtimes/docs/plans/202607/logs/341-three-runtimes/build-challenge-verify-f4.md)); F1–F3 mechanical fixes confirmed intact. Full local suite green: typecheck, format, prose, vitest 2523 passed, slop:delta net 0, bats 99/99, `bkit check` clean.

Resuming build: Step 12 (Challenge Tests) → Step 13 (Run Tests) → Step 16 (Summary) → Step 17 (Create PR).
---

### Comment by null at 2026-07-24T04:16:50Z

### Step 12 — Build Challenge Tests - Verdict: PASS

9 regression tests added to `tests/bkit-runtime.bats` for F1 (all 5 CI-suppression tokens + case-insensitivity), F2 (timeout/gtimeout resolution + plain-sleep fallback), F3 (EXIT-trap injection neutralised) — each verified to fail against the pre-fix code and pass against the fix. bats 107/107.
---

### Comment by null at 2026-07-24T04:18:12Z

### Step 13 — Run Tests - Verdict: PASS - Failures: 0 - Scope: pnpm typecheck && pnpm test && pnpm format:check && pnpm lint:slop && pnpm lint:prose && pnpm test:coverage:unit - Attempt: 1

---

### Comment by null at 2026-07-24T04:22:09Z

### Step 16 — Summary - Verdict: PASS

[build-summary.md](https://github.com/cbartens/bkit/blob/feat/341-three-runtimes/docs/plans/202607/logs/341-three-runtimes/build-summary.md)

Verdict: PASS

# Build Summary

## Overview

Built #341 three-runtimes workflow execution across 6 sub-plans (T1–T16). All 16 tasks implemented to spec: Layer-0 runtime shim detection (`bkit_runtime.sh` 10 functions, `bkit_runtime_detect`/`bkit_wait_ci`/close-guard kernel), Layer-1 CI-wait primitive extraction, Layer-2 branch model (adopt-or-mint), Layer-3 invariant prose (`rules.md` updates), FID marker-primary reorder (D9), gh auth hardening + MCP fallback lane, and close-guard kernel (D23/D24/D25). All six sub-plans verified PASS; holistic verification PASS (0 integration gaps). Build-challenge surfaced 4 findings; F1–F3 (mechanical) remediated first pass + regression tested; F4 (architectural, FID path traversal validation) escalated to human per protocol, manually fixed, independently re-verified PASS (0 failures).

## Test Status

Full test suite PASS after fixes. Challenge-tests: 9 new regression tests for F1/F2/F3 (F4 already covered by `bkit-auto-fid-guard.test.ts`). Run-tests scope `pnpm typecheck && pnpm test && pnpm format:check && pnpm lint:slop && pnpm lint:prose && pnpm test:coverage:unit`, 0 failures. `pnpm test:bats` → 107/107; `pnpm test` → 2523 passed / 71 files (2 skipped, 1 todo); coverage:unit 2015 passed. slop:delta net 0.

## Challenge

4 findings, max severity HIGH → CONCERNS. All resolved.

- **F1** [HIGH]: D24 landed-body scan missed 3 of 5 CI-suppression tokens → regex widened to full case-insensitive set. Regression test PASS.
- **F2** [HIGH]: `bkit_wait_ci` hard-depended on GNU `timeout` (absent on stock macOS) → resolver detects timeout/gtimeout, falls back to plain sleep. Regression test PASS.
- **F3** [LOW]: command injection via branch name in close-guard EXIT trap → trap body single-quoted. Regression test PASS.
- **F4** [architectural]: marker-primary FID reorder → untrusted PR-body path traversal. Escalated to human, fixed with slug allowlist at every FID exit point, independent re-challenge PASS / 0 failures.

## Deferred

5 Manual Verification items (live mode-1/2/3 runs + `dev` branch-protection admin confirm + debug-egress live check) logged OPEN in `docs/deferrals.jsonl` — reachable only from live/admin sessions, not blockers per plan scope.

## Recommended Next Step

`/bkit-ship 341` — plan done, all 6 sub-plans implemented, all tests pass, challenge resolved. Plan: `docs/plans/202607/341-three-runtimes-plan.md`
---

### Comment by null at 2026-07-24T04:26:03Z

### Step 17 — Close Workflow & Create PR

[cbartens/bkit/pull/382](https://github.com/cbartens/bkit/pull/382)

CI on PR HEAD (`effbee27`): **all 5 checks pass** — bkit-tests-static, -unit, -integration, -scope, -check. mergeState: CLEAN.

#### Artifacts

- [341-three-runtimes-design.md](https://github.com/cbartens/bkit/blob/feat/341-three-runtimes/docs/plans/202607/341-three-runtimes-design.md)
- [341-three-runtimes-plan-1.md](https://github.com/cbartens/bkit/blob/feat/341-three-runtimes/docs/plans/202607/341-three-runtimes-plan-1.md)
- [341-three-runtimes-plan-2.md](https://github.com/cbartens/bkit/blob/feat/341-three-runtimes/docs/plans/202607/341-three-runtimes-plan-2.md)
- [341-three-runtimes-plan-3.md](https://github.com/cbartens/bkit/blob/feat/341-three-runtimes/docs/plans/202607/341-three-runtimes-plan-3.md)
- [341-three-runtimes-plan-4.md](https://github.com/cbartens/bkit/blob/feat/341-three-runtimes/docs/plans/202607/341-three-runtimes-plan-4.md)
- [341-three-runtimes-plan-5.md](https://github.com/cbartens/bkit/blob/feat/341-three-runtimes/docs/plans/202607/341-three-runtimes-plan-5.md)
- [341-three-runtimes-plan-6.md](https://github.com/cbartens/bkit/blob/feat/341-three-runtimes/docs/plans/202607/341-three-runtimes-plan-6.md)
- [341-three-runtimes-plan.md](https://github.com/cbartens/bkit/blob/feat/341-three-runtimes/docs/plans/202607/341-three-runtimes-plan.md)
- [build-challenge-1.md](https://github.com/cbartens/bkit/blob/feat/341-three-runtimes/docs/plans/202607/logs/341-three-runtimes/build-challenge-1.md)
- [build-challenge-2.md](https://github.com/cbartens/bkit/blob/feat/341-three-runtimes/docs/plans/202607/logs/341-three-runtimes/build-challenge-2.md)
- [build-challenge-remediate-log.md](https://github.com/cbartens/bkit/blob/feat/341-three-runtimes/docs/plans/202607/logs/341-three-runtimes/build-challenge-remediate-log.md)
- [build-challenge-tests.md](https://github.com/cbartens/bkit/blob/feat/341-three-runtimes/docs/plans/202607/logs/341-three-runtimes/build-challenge-tests.md)
- [build-challenge-verify-f4.md](https://github.com/cbartens/bkit/blob/feat/341-three-runtimes/docs/plans/202607/logs/341-three-runtimes/build-challenge-verify-f4.md)
- [build-challenge.md](https://github.com/cbartens/bkit/blob/feat/341-three-runtimes/docs/plans/202607/logs/341-three-runtimes/build-challenge.md)
- [build-input.md](https://github.com/cbartens/bkit/blob/feat/341-three-runtimes/docs/plans/202607/logs/341-three-runtimes/build-input.md)
- [build-install-skills.md](https://github.com/cbartens/bkit/blob/feat/341-three-runtimes/docs/plans/202607/logs/341-three-runtimes/build-install-skills.md)
- [build-plan-execute-1-log.md](https://github.com/cbartens/bkit/blob/feat/341-three-runtimes/docs/plans/202607/logs/341-three-runtimes/build-plan-execute-1-log.md)
- [build-plan-execute-2-log.md](https://github.com/cbartens/bkit/blob/feat/341-three-runtimes/docs/plans/202607/logs/341-three-runtimes/build-plan-execute-2-log.md)
- [build-plan-execute-3-log.md](https://github.com/cbartens/bkit/blob/feat/341-three-runtimes/docs/plans/202607/logs/341-three-runtimes/build-plan-execute-3-log.md)
- [build-plan-execute-4-log.md](https://github.com/cbartens/bkit/blob/feat/341-three-runtimes/docs/plans/202607/logs/341-three-runtimes/build-plan-execute-4-log.md)
- [build-plan-execute-5-log.md](https://github.com/cbartens/bkit/blob/feat/341-three-runtimes/docs/plans/202607/logs/341-three-runtimes/build-plan-execute-5-log.md)
- [build-plan-execute-6-log.md](https://github.com/cbartens/bkit/blob/feat/341-three-runtimes/docs/plans/202607/logs/341-three-runtimes/build-plan-execute-6-log.md)
- [build-plan-verify-1-1.md](https://github.com/cbartens/bkit/blob/feat/341-three-runtimes/docs/plans/202607/logs/341-three-runtimes/build-plan-verify-1-1.md)
- [build-plan-verify-2-1.md](https://github.com/cbartens/bkit/blob/feat/341-three-runtimes/docs/plans/202607/logs/341-three-runtimes/build-plan-verify-2-1.md)
- [build-plan-verify-3-1.md](https://github.com/cbartens/bkit/blob/feat/341-three-runtimes/docs/plans/202607/logs/341-three-runtimes/build-plan-verify-3-1.md)
- [build-plan-verify-4-1.md](https://github.com/cbartens/bkit/blob/feat/341-three-runtimes/docs/plans/202607/logs/341-three-runtimes/build-plan-verify-4-1.md)
- [build-plan-verify-5-1.md](https://github.com/cbartens/bkit/blob/feat/341-three-runtimes/docs/plans/202607/logs/341-three-runtimes/build-plan-verify-5-1.md)
- [build-plan-verify-6-1.md](https://github.com/cbartens/bkit/blob/feat/341-three-runtimes/docs/plans/202607/logs/341-three-runtimes/build-plan-verify-6-1.md)
- [build-plan-verify-holistic.md](https://github.com/cbartens/bkit/blob/feat/341-three-runtimes/docs/plans/202607/logs/341-three-runtimes/build-plan-verify-holistic.md)
- [build-summary.md](https://github.com/cbartens/bkit/blob/feat/341-three-runtimes/docs/plans/202607/logs/341-three-runtimes/build-summary.md)

#### Telemetry

```

> @cbartens/bkit@4.8.0 bkit /Users/christian/Documents/GitHub/bkit
> node dist/bkit-install.js telemetry summary --phase=build

**build close** · cbartens/bkit

| metric | this run | med·5 |
| --- | --- | --- |
| durationSeconds | 37100 (10h18m) | — |
| linesChanged | 238 (+238/-0) | — |
| filesChanged | 4 | — |
| taskCount | 119 | — |
| frictionAdded | 0 | — |
| deferralsAdded | 2 | — |
| failuresAdded | 2 | — |
| attempts | BUILD_ATTEMPT 2 | — |

`med·5` = median of the previous 5 build runs (— if < 3) · ledger 13 rows, 0 malformed
```

---

### Comment by null at 2026-07-26T23:52:13Z

I'll extract this from the actual workflow files rather than from memory.

Extracted from the current branch state. Every divergence point is a `CAN_*`/`GH_OK` branch I can point at by step.

## The capability table (everything else follows from this)

`.bkit/scripts/bkit-runtime.sh` classifies once per Bash block and writes a durable `runtime-resolved` row at Step 2:

|                | **1. local** (laptop) | **2. gh-action runner**      | **3. claude.ai / cursor cloud** |
| -------------- | --------------------- | ---------------------------- | ------------------------------- |
| detected by    | neither primitive     | `GITHUB_ACTIONS`/`CI` = true | `CLAUDE_CODE_REMOTE=true`       |
| `CAN_WORKTREE` | true                  | true                         | **false**                       |
| `CAN_PUSH_DEV` | true                  | true                         | **false**                       |
| `CAN_SLEEP`    | true                  | true                         | **false**                       |
| `GH_OK`        | probed                | probed (token present)       | probed (**often false**)        |

**Modes 1 and 2 resolve identically at every flag.** They take the same branch of every conditional in every workflow — mode 2 is not a separate path, it's mode 1 on someone else's machine. Only mode 3 (and the `unknown` fallback) diverges.

---

## `/bkit-design` — 10 steps

1 Start Workflow · **2 Worktree Setup** ⚠️ · 3 Brainstorm & Ideate · 4 Generate Design · 5 Design Review · 6 Apply Review · 7 Design Organise · 8 Summary · 9 Workstream Issues · **10 Close Workflow** ⚠️

- **Step 2** — mode 1/2: `git worktree add .worktrees/{FID}` on `feat/{FID}`, copy env files, `pnpm install`. Mode 3: no worktree; adopts the branch the session is already on, `WORKTREE_PATH=$REPO_ROOT`, refuses if that branch is `dev`.
- **Step 10** — mode 1/2: local `git merge --squash -X ours` → `docs({FID}): design DONE bkit [skip ci]` → `git push origin dev` → worktree/branch teardown. Mode 3: opens a PR, squash-merges it with that same skip-token subject, no `--delete-branch` (repo auto-delete handles it), no teardown (nothing local to tear down).

Steps 3–9 are identical in all three modes.

## `/bkit-plan` — 12 steps

1 Start · **2 Worktree Setup** ⚠️ · 3 Generate Plan · 4 Fetch Context · 5 Review · 6 Apply Review · 7 Scope Check · 8 Apply Scope · 9 Complexity Check · 10 Complexity Split · 11 Summary · **12 Close Workflow** ⚠️

Same two divergences as design, same shapes. Steps 3–11 identical.

## `/bkit-build` — 17 steps

1 Start · **2 Worktree Setup** ⚠️ · 3 Branch Sync · 4 Install Skills · 5–8 Plan Execute/Verify · 9 Build Challenge · 10 Reconcile · 11 Remediate · 12 Challenge Tests · 13 Run Tests · 14 Failure Diagnose · 15 Failure Remediate · 16 Summary · **17 Close Workflow & Create PR** ⚠️

- **Step 2** — as above.
- **Step 17** — the close pushes to the _feature_ branch and creates the PR in all three modes (no `dev` push, so no `CAN_PUSH_DEV` branch). The divergence is the **CI-Dispatch Gate**: mode 1/2 poll in bash via `bkit_wait_ci` (`timeout`-wrapped sleeps). Mode 3 (`CAN_SLEEP=false`) can't block on `sleep`, so it runs the same gate as an **agent turn-loop** — one `gh pr view` per orchestrator turn instead of a bash poll.

Steps 3–16 identical.

## `/bkit-debug` — 10 steps

1 Start · **2 Worktree Setup** ⚠️ · 3 Run Tests · **4 Fetch Context** ⚠️ · 5 Failure Diagnose · 6 Failure Remediate · 7 Remediate Soak · 8 Push Remediation · 9 Summary · **10 Close Workflow** ⚠️

- **Step 2** — as above.
- **Step 4** — the Playwright artifact seam. `gh run download -n playwright-report` is primary; when `GH_OK=false` it falls back to `get_job_logs --failed-only`, which keeps the failure signal but loses the rich HTML report. Also where debug-fetch blocks must now narrate `CHECKED` / `SELF-SKIPPED` / `NO BLOCKS CONFIGURED` distinctly — a cloud egress block self-skipping `exit 0` must never read as "no runtime errors".
- **Step 10** — same CI-Dispatch Gate split as build (bash poll vs agent turn-loop), at both the PR-mode and LOCAL-mode close sites.

## `/bkit-ship` — 13 steps

1 Start · **2 Worktree Setup** ⚠️ · 3 Regression Guard · 4 Conflict Resolve · 5 Deferred Sweep · 6 Merge PR · 7 Failure Diagnose · 8 Failure Remediate · **9 Switch to Dev** ⚠️ · 10 Update Docs & Summary · 11 Prune Skills · 12 Worktree Cleanup · **13 Close Workflow** ⚠️

- **Step 2** — as above.
- **Step 6 Merge PR** — identical in all modes. The merge is server-side (`gh pr merge --squash`), so it works everywhere; mode 3 falls back to `merge_pull_request` only if `GH_OK=false`, with an explicit skip-token-free `commit_message`.
- **Step 9** — mode 1/2: take the dev lock, `git checkout dev`, `AHEAD_NON_SKIP` guard, pull/push, `pnpm install`. Mode 3: skipped entirely — the merge already landed server-side at Step 6 and local `dev` is never ahead there. Guarded by an inline `CAN_WORKTREE && CAN_PUSH_DEV` double-assert before any local `dev` checkout.
- **Step 13** — mode 1/2: status/telemetry tail committed and pushed on `dev`. Mode 3: recorded on the current branch instead.

Ship has no `CAN_SLEEP` branch — its CI check at Step 4 is a one-shot conclusion read, not a poll.

## `/bkit-auto` — 2 steps

No runtime branch at all, but it's what makes mode 3 reachable: **Step 9 now resolves `FID` from the PR-body marker first**, with the `feat/`-prefix branch derivation as fallback. Previously a non-`feat/` branch was an immediate Failure Path, which rejected every `claude/…` cloud session branch. Both paths pass a slug allowlist before `FID` builds any filesystem path.

## `/bkit-worktree-sync`, `/bkit-worktree-prune`

Both gained a `bkit_worktree_helper_guard` self-skip at the top: `CAN_WORKTREE=false` → loud "no `.worktrees/` tree here" and stop, treated as a **no-op, not an error**. Mode 1/2 proceed unchanged.

---

## Divergence total

| workflow            | divergence points            | steps identical in all 3 modes |
| ------------------- | ---------------------------- | ------------------------------ |
| design              | 2 (Steps 2, 10)              | 8 of 10                        |
| plan                | 2 (Steps 2, 12)              | 10 of 12                       |
| build               | 2 (Steps 2, 17)              | 15 of 17                       |
| debug               | 3 (Steps 2, 4, 10)           | 7 of 10                        |
| ship                | 4 (Steps 2, 9, 13 — 9 twice) | 10 of 13                       |
| auto                | 0                            | 2 of 2                         |
| worktree-sync/prune | 1 each (self-skip)           | —                              |

Three recurring shapes cover all of it: **mint-vs-adopt** the worktree, **local push vs server-side merge** for `dev`, and **bash poll vs agent turn-loop** for CI waits. Mode 1 and mode 2 take the left side of every one.

Want me to land this as a section in `.bkit/workflows.md`? That's the companion doc for exactly this kind of reference, and it'd replace the scattered per-bullet notes I added there during the restructure.
---

### Comment by null at 2026-07-28T06:07:04Z

```comment
## Ship Workflow
### Step 1 — Start Workflow
[cbartens/bkit/tree/dev](https://github.com/cbartens/bkit/tree/dev)
```

---

---

## Plan

Verdict: PASS

<!-- verdict:end -->

# Three-Runtime Workflow Execution (#341) Implementation Plan — Parent Index

> [!IMPORTANT]
> **This is a SPLIT parent index.** The executable work (16 tasks T1–T16, its 🔒 Gates, and Manual Verification steps) has been partitioned losslessly into six self-contained sub-plans (see `Sub-Plan Index`). This file retains only shared context, goals, and the split map. Build from the sub-plans, in DAG order.

> [!CAUTION]
> **CRITICAL:** Do not hallucinate plan execution state. Read a sub-plan natively ONCE at its session start; source of truth = its literal `[x]`/`[ ]` checkboxes. `[ ]` = NOT DONE regardless of conversation context.

> [!IMPORTANT]
> **Docs & stack project-resolved.** This is the **bkit repo itself** — no app stack (no DB, no deployed URL, no browser). Test tiers reduce to **Static · Unit (vitest) · Integration (vitest, real subprocess/git) · Shell (bats)**; E2E/@live/migration/smoke are N/A (`docs/testing.md` § Stack / Tiers). "@live" here means a **real claude.ai (mode-3) session** — the only boundary that exercises the mode-3 code path, and it has no CI harness (WS-16, manual; Sub-Plan 6).

## Context & Goals

bkit's five phase workflows (`/bkit-{design,plan,build,debug,ship}`) + `bkit-auto` were authored for a laptop (mode 1) but now run in **four materially different runtimes**: laptop (mode 1), GitHub-Actions runner (mode 2), a **claude.ai cloud session** (mode 3, `CLAUDE_CODE_REMOTE=true`), and a **Cursor cloud agent** (mode 4). Several steps assume laptop-only capabilities. Running phases on the claude.ai runner surfaced a cluster of deviations culminating in a **silent CI-suppression bug (D1)**: `[skip ci]` leaked into a squash-merge _body_ on `dev` because an unauthed `gh` was replaced by an ad-hoc, unguarded MCP `merge_pull_request` that defaulted the body.

This plan implements the **settled design** (`docs/plans/202607/341-three-runtimes-design.md`, verdict CONCERNS) whose guiding principle is **minimal, additive changes gated on one capability table — not a rewrite of every call site**. The mechanism: a sourced runtime shim (`bkit-runtime.sh`) emits a 5-row capability table (`RUNTIME` → `CAN_WORKTREE`/`CAN_PUSH_DEV`/`CAN_SLEEP`/`GH_OK`; row 4 = Cursor cloud agent, mode-2-equivalent, exact detection var held for live confirmation); workflow headers branch on `CAN_*`; invariants land in `.agents/rules.md`; the close path gains transport-agnostic guards (D23/D24/D25). Three pre-build spikes (A/B/C) have **run and closed** (`spike-findings.md`, `design-addendum-spikes.md`) — their findings are folded, and they are NOT re-planned as open spikes; the only residuals are live-mode-3 observations owned by the terminal verification task (Sub-Plan 6).

> Success criteria live ONCE below; each runbook task (in the sub-plans) carries its own `Done when`.

**Related Issues:**

- `#341` — Make workflows run in all runtimes local GH Actions claude.ai (open) — this plan
- `#134` — design→ship artifact-trail model (closed, superseded)
- `#209` — state model / design-plan feat-locate (closed, shipped)
- `#234` — NDJSON `status.jsonl` (closed, shipped) — the per-step status ledger the three new row types ride
- `#342` — Prompt-injection hardening (open) — owns §5a/§6f mitigation; adjacent, do NOT duplicate
- `#99` — bkit workflow friction optimisation (open) — general friction tracker

---

## Success Criteria _(inherited from design — the shared testable contract; each sub-plan repeats the subset it owns)_

1. All five phases + `bkit-auto` complete end-to-end in each of the four runtimes (mode 4 = Cursor cloud agent, gated on live confirmation of its detection var); the mode-1 laptop path is verified non-regressed by a real end-to-end run (not a rule-text-presence test). This run is also the only guarantee that prose rules _honour_ the capability flags — no static engine can assert that.
2. No run ever mutates the session's checked-out branch in a runtime that cannot restore it — zero `git checkout dev` when dev-push capability is absent (D6). Held by a double-guard plus a reversible checkout (D23).
3. Every phase-close lands on `dev` with a commit/merge body free of CI-suppression tokens — asserted post-hoc against the landed commit on whichever transport ran (D24) — and the resulting CI-dispatch outcome on `dev` is asserted rather than assumed (D1 closed on both transports).
4. Any gh→MCP transition is bounded (max 1 per run), recorded in `status.jsonl`, confirmed by an independent re-read, and cross-checked mechanically (D25).
5. An MCP read returning empty/zero is never recorded as authoritative absence — it is corroborated or reported as unavailable, with the corroboration attempt logged as its own distinguishable state (D12).
6. A shim that fails to source is loud and distinguishable from a correctly-detected least-capable runtime (Flow 1).
7. No wait can hang. Every bounded poll's cap is enforced by a mechanism that survives a blocked `sleep` (D22).

> [!CAUTION]
> **Human review is a shared Gate-1 prerequisite for every sub-plan.** The `👤` Acceptance Scenario, Breaking Changes, and Open Questions sections (below) MUST be confirmed `[x]` before ANY sub-plan builds. Sub-Plan 4 additionally hard-depends on OQ-A (transport D5(a) vs D5 — picks whether T12 exists) and OQ-D (docs-close CI cost); Sub-Plan 5 on OQ-B (Playwright seam); Sub-Plans 3 & 6 on OQ-C (dev branch-protection config).

## 👤 Breaking Changes & Naming Review _(shared doctrine — HUMAN REVIEW REQUIRED)_

**None break existing consumers on modes 1–2; every mode-3-specific path is additive.**

> [!IMPORTANT]
> **Flag naming is non-negotiable (D1): `RUNTIME`, never `MODE`.** `bkit-auto.md:70-80` already binds `MODE=CI|BRIEF`. The shim MUST be `bkit-runtime.sh`, never `bkit-mode.sh` (retired in #245).

- **New capability flags:** `RUNTIME` + `CAN_WORKTREE`/`CAN_PUSH_DEV`/`CAN_SLEEP`/`GH_OK` (additive).
- **New shipped file:** `.bkit/scripts/bkit-runtime.sh` (+ template), rides `bkit install`; `.bkit/version` tracks it.
- **New `status.jsonl` row types (additive, #234 artifact):** `runtime-resolved`, `transport-fallback`, `close-transport`.
- **FID resolution reorder (D9):** marker-primary → branch-derive fallback; the `feat/`-prefix hard-reject at `bkit-auto.md:86-87` is **deleted**.
- **Prose/doctrine (D17):** `rules.md:71` branch-naming reframed; adopt-mode headers drop `Worktree created/resumed`/`Worktree removed` gate items and rewrite `pwd`-outside-worktree → `pwd != WORKTREE_PATH`.
- **Behaviour on `dev` (all modes):** `.mcp.json` gains `actions` (C1); `cloud-bootstrap.sh` gh-auth hardening (C2); the blind CI-wait `sleep` in `bkit-ship.md` removed (D11 reversal); §6d drops `[skip ci]` from close + intermediate status subjects under D5(a) (knowing CI-cost reversal, OQ-D).

## 👤 Open Questions & Assumptions _(shared — HUMAN REVIEW REQUIRED; resolve before build)_

- **OQ-A — Shape-A mode-3 transport: PR-close (D5(a), recommended) vs `push_files` (D5)?** Spike B: `push_files` cannot express `merge --squash -X ours`, has non-repairable payload bloat, inverts conflict semantics. D5(a) is uniform with ship, credential-decoupled — at the cost of pulling §6d into scope. Sub-Plan 4 is written for D5(a); selecting D5 DROPS T12 and swaps T13's tail. → resolve before Sub-Plan 4.
- **OQ-B — Playwright artifact seam.** `download_workflow_run_artifact` covers the seam (C1) but its output shape must be verified live (Sub-Plan 6); `get_job_logs` is the standing default. → confirm job-logs-only fallback acceptable.
- **OQ-C — `dev` branch-protection config.** Confirm branch protection permits the autonomous close + enable "Automatically delete head branches". Committed pre-close assertion + `docs/deployments.md` dependency (Sub-Plan 3); verified Manual Step 4 (Sub-Plan 6). → human/admin action.
- **OQ-D — Docs-only closes now fire full CI (knowing cost reversal; only under OQ-A=D5(a)).** Dropping `[skip ci]` reclassifies design/plan docs-only closes from `run_level=none` to full CI. → confirm cost accepted OR require the transport to carry the skip signal without surfacing the token. Reconciled in T12 (Sub-Plan 4).

**Key assumptions (→ what breaks):** Spikes A/B closed, only live residuals remain (T14/T16 re-open if contradicted, all named-and-mitigated); five phases' Step-2 branch logic uniform enough for one adopt-or-mint rule (else T8 grows variants); `CAN_SLEEP=false` yield can carry an attempt counter via the counter-bus; `RUNTIME` is a clean token; mode-3's proxy restricts `git push` to the current branch.

## Alternative Approaches & Recommendations

- **CHOSEN — Capability table from one detection + a sourced shim (D2/D3).** Buys testable detection (bats); consumption stays prose (honest limit, discharged by SC1's real run).
- **CHOSEN — Shape-A mode-3 transport = D5(a) PR-close.** Uniform with ship, credential-decoupled, no token-bloat, no conflict-inversion; §6d becomes a prerequisite.
- **REJECTED —** `push_files` as shape-A primary (D5); `git push --dry-run` probe for `CAN_PUSH_DEV` (D23, fails dangerous); uniform PR-close in all runtimes; render-time mode gating (D14, impossible); one `bkit_wait_ci` for both branches (D22); shell-native MCP CLI shim (deferred).

## Out of Scope

Shell-native MCP CLI shim; uniform PR-close all runtimes; narrow gh read-path corroboration outside MCP; root-cause of MCP `search_issues` zero-on-private-repo; periodic transport-fallback frequency summariser; mode-tuned subagent-fan-out pacing; the `/Users/jesse` vendored skill "fix" (D20 correction). Each mirrored in `docs/deferrals.jsonl` (OQ3 in `docs/failures.jsonl`). **Runtime 4 (Cursor Cloud Agent) was PROMOTED out of this list into scope (2026-07-23)** — first-class row in the capability table; detection bridges the `is_background_agent` hook signal to an env marker (bkit seam, #75), held for live confirmation (verify-first).

## Security & Privacy

- **NO new secret/env var (C2):** uses existing `GH_TOKEN`/`GH_BKIT_TOKEN`; gh-hardening prefers the sanctioned `GH_TOKEN` env; loud dual-lane preflight makes "no credential" a hard-fail.
- **Untrusted input (§6f):** tracker/PR/comment bodies untrusted; mitigation = D13's bounded fallback + narrowest token; injection hardening is `#342`'s scope — do NOT duplicate.
- Not applicable: routes/DB/RLS/Zod/PII/redirect/webhook — bkit has no app runtime.

## Architecture & Component Changes (register split, D15)

Grouped by the design's register split: **Mechanism** (`.bkit/scripts/bkit-runtime.sh` + template — shim, `bkit_wait_ci`, close-guard helpers), **Invariants** (`.agents/rules.md` + template mirror), **Procedure** (workflow headers `.bkit/workflows/bkit-{auto,design,plan,build,debug,ship,worktree-prune,worktree-sync}.md`), **Config/hook** (`.mcp.json` + template; `.claude/hooks/cloud-bootstrap.sh` + template), **Tests/docs** (2 `tests/*.bats` + 5 `.bkit/src/*.test.ts` + docs). Host-render mirrors (`.claude`/`.cursor`/`.opencode`) are force-rendered and NOT drift-gated (D19); true edit cost is the `.bkit/` sources (+ two `.bkit/templates/` mirror exceptions), batch-regenerated at the end (Sub-Plan 6). Per-sub-plan `[NEW]`/`[MODIFY]`/`[DELETE]` detail lives in each sub-plan's `Architecture & Component Changes`.

### Supersession Inventory (whole plan)

<!-- prettier-ignore -->
| Existing artifact | Replaced by | Decision | Sub-Plan |
| --- | --- | --- | --- |
| Inline `# --- CI-Dispatch Gate shared kernel ---` blocks (`bkit-build.md`, `bkit-debug.md`) | `bkit_wait_ci` in `.bkit/scripts/bkit-runtime.sh` (alignment test rewritten, not dropped) | DELETE | 2 (T7) |
| The blind CI-wait `sleep` in `bkit-ship.md` (`:556`/`sleep 30` anchor STALE) | `bkit_wait_ci` bounded `RUN_ID` poll (D11 reversal) | DELETE | 2 (T7) |
| `feat/`-prefix hard-reject `bkit-auto.md:86-87` | Marker-primary FID resolution (D9) | DELETE | 1 (T2) |
| Hard-coded `/Users/christian/...create-t3-turbo` path (template + repo copies) | Stack/host-agnostic placeholder (D20) | DELETE | 1 (T1) |

### Documentation Updates (whole plan)

<!-- prettier-ignore -->
| Doc | Change required | Sub-Plan |
| --- | --- | --- |
| `docs/decisions.jsonl` | Shape-A transport decision (D5(a)/D5 per OQ-A) + C1/C2 posture — human-gated | 4 |
| `docs/knowledge.jsonl` | Shim state-model gotcha + D1 aetiology (skip-token in merge *body*) | 2 |
| `docs/deployments.md` | `dev` branch-protection + auto-delete-head-branches dependency (Risk 4) | 3 |
| `docs/testing.md` | New bats + vitest audits; new `status.jsonl` row types | 1, 6 |
| `docs/observability.md` | Step-1 narrated line + three `status.jsonl` row types + debug-egress loudness | 1, 3, 5, 6 |
| `.bkit/workflows.md` § Status | `runtime-resolved`/`transport-fallback`/`close-transport` row shapes | 1, 3 |

## Rollback Strategy

Code-only — `git revert {COMMIT}` per landed workstream + `pnpm bkit install` to re-render mirrors, then `git config core.bare false`. Mode-3 paths are additive and gated on `CAN_*`; reverting restores mode-1/2 behaviour with no residue. `status.jsonl` rows are additive/forward-compatible. No migration, no deploy.

## Data Schema Integration

**No database.** The only stateful surface is the existing NDJSON ledger `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl` (#234). The shim is a **stateless pure function re-sourced per block** (D21). Env-only flags re-derive free per block; `GH_OK` is probed once at Step 1 and read back from the `runtime-resolved` row — no cache file. **ADD (NDJSON row types, not DB):** `runtime-resolved`, `transport-fallback`, `close-transport`. No new artifact type.

---

## Sub-Plan Index _(replaces the Agent Execution Runbook — build in DAG order)_

**Ordering (build-dependency DAG):** `T1,T2,T3,T4,T5` → `T6,T7` → `T8,T9` → `T10,T11,T12,T13` → `T14,T15` → `T16`. Repo doctrine forbids concurrent bkit workflows on one clone — land serially, never in parallel. Batch mirror regen (`bkit install`) happens once, in Sub-Plan 6.

<!-- prettier-ignore -->
| Sub-Plan | Scope | Tasks | Matrix rows | Depends on | Key gates/OQ |
| --- | --- | --- | --- | --- | --- |
| [341-three-runtimes-plan-1.md](./341-three-runtimes-plan-1.md) | Independent roots (macOS path, FID reorder, runtime shim, `actions` toolset, gh-hardening) | T1, T2, T3, T4, T5 | 1–4, 10, 11, 13 | — (DAG root) | Owns 🔒 Gate 1 (Prerequisites) + human confirmations |
| [341-three-runtimes-plan-2.md](./341-three-runtimes-plan-2.md) | Invariants + CI-wait kernel | T6, T7 | 5, 6 | Sub-Plan 1 (T3 shim) | D11 sleep reversal; kernel-alignment test rewrite |
| [341-three-runtimes-plan-3.md](./341-three-runtimes-plan-3.md) | Branch model + close-guard kernel (adopt-or-mint 13-site commit, D23/D24/D25) | T8, T9 | 7–9 | Sub-Plans 1 (T2/T3), 2 (T7 shared files) | OQ-C (branch protection, Risk 4) |
| [341-three-runtimes-plan-4.md](./341-three-runtimes-plan-4.md) | Close shapes B/C + §6d skip-ci + shape A | T10, T11, T12, T13 | 12 | Sub-Plans 2 (T7), 3 (T9 kernel) | **OQ-A** (D5(a) vs D5 — picks whether T12 exists), **OQ-D** (docs-close CI cost) |
| [341-three-runtimes-plan-5.md](./341-three-runtimes-plan-5.md) | gh→MCP fallback lane + peripherals (worktree self-skip, debug egress, Playwright seam) | T14, T15 | 16 | Sub-Plans 1 (T4 `actions`), 3 (T9 D25) | OQ-B (job-logs default); owns Manual Step 5 |
| [341-three-runtimes-plan-6.md](./341-three-runtimes-plan-6.md) | Terminal verification: prose audit, batch mirror regen, live mode-1/2/3/4 runs, SC1–7 | T16 | 14, 15 | ALL (Sub-Plans 1–5) | 🔒 Gate 4 final suite; Manual Steps 1–4; OQ-C confirm |

**Derived Test Matrix → task → sub-plan map (all 16 rows, one task each):** rows 1–4→T3 (SP1), 5–6→T7 (SP2), 7–9→T9 (SP3), 10→T4 (SP1), 11→T1 (SP1), 12→T12 (SP4), 13→T5 (SP1), 14–15→T16 (SP6), 16→T15 (SP5). No uncovered row; no duplicated row.

## Merge Method

**Merge method: always squash.** Default `gh pr merge --squash --delete-branch --body ""`. Landings serialise (shared files across T7/T10/T11 and T8/T12); decompose into separate PRs per landing group rather than requesting a non-squash merge. Never `rebase`/`merge-commit` into `dev`.
