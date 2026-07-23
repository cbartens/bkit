# Build Input — FID 341-three-runtimes

## Session Prompt

/bkit-build issue 341

## Issue #341 — Make workflows run in all runtimes local GH Actions claude.ai

**State:** open
**Labels:** enhancement, bkit:build
**URL:** https://github.com/cbartens/bkit/issues/341

## Description

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

**5a. Security — the "lethal trifecta" prompt-injection.** Invariant Labs (May 2025) showed a malicious **public** issue with hidden instructions can hijack an agent that later reads issues with a broad token into pulling **private**-repo data and exfiltrating it via its response. Described as **architectural, "no obvious fix."** bkit hits all three legs: `issue-scan` reads untrusted issue **bodies + comments**, holds a broad **`GH_BKIT_TOKEN`** write PAT, and can act (PR/commit/merge). _(Not strictly MCP-vs-gh — a gh agent reading the same issue is equally exposed — but it's a first-class constraint now.)_ **Mitigation: narrowest-scoped token + treat all tracker/PR/comment content as untrusted; never let it steer git/merge actions.** [Invariant](https://invariantlabs.ai/blog/mcp-github-vulnerability) · [Simon Willison](https://simonwillison.net/2025/May/26/github-mcp-exploited/) · [devclass](https://devclass.com/2025/05/27/researchers-warn-of-prompt-injection-vulnerability-in-github-mcp-with-no-obvious-fix/)

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
- **External:** [Claude Code on the web](https://code.claude.com/docs/en/claude-code-on-the-web) · [sandboxing](https://www.anthropic.com/engineering/claude-code-sandboxing) · [gh precedence](https://cli.github.com/manual/gh_help_environment) · [cli/cli#2922](https://github.com/cli/cli/issues/2922) · [claude-code#26466](https://github.com/anthropics/claude-code/issues/26466) · **MCP downsides:** [Invariant](https://invariantlabs.ai/blog/mcp-github-vulnerability) · [Willison](https://simonwillison.net/2025/May/26/github-mcp-exploited/) · [devclass](https://devclass.com/2025/05/27/researchers-warn-of-prompt-injection-vulnerability-in-github-mcp-with-no-obvious-fix/) · [github-mcp-server#1286](https://github.com/github/github-mcp-server/issues/1286) · [getunblocked](https://getunblocked.com/blog/github-mcp-token-cost/) · [mariozechner](https://mariozechner.at/posts/2025-08-15-mcp-vs-cli/) · [Scalekit](https://www.scalekit.com/blog/mcp-vs-cli-use)

_Working session record. §6 is the settled direction (fallback details to investigate, §8); not yet scoped into tasks._

## Comments (25)

### Comment by cbartens — 2026-07-14T11:21:47Z

**Relationship to #134 — kept separate on purpose.**

#134 stays open as an **independent, mode-agnostic** decision: where the design→plan→build→ship artifact trail + `status.json` live — on `dev` early (status quo **A**) vs. on the feature branch via the PR (**B**). Its live tension is rebase churn over the weeks-long design→build gap vs. design/plan docs being searchable on `dev` before ship.

This issue (§6h) deliberately **does not force** that decision: the mode-3-blocked `git push origin dev` docs/status tail is handled by the `push_files` API fallback, so cloud support works with status quo A unchanged. The two issues intersect only at that single transport point — #134 is neither a blocker for nor a dependency of the cloud work here.

---

_Generated by [Claude Code](https://claude.ai/code)_

---

### Comment by cbartens — 2026-07-14T12:03:56Z

## Update (2026-07-14): current code already branch-isolates every phase — re-scopes §1 and §6

Re-checked against the live source (`.bkit/workflows/*.md`). **§1's table is stale** on one load-bearing row, and it changes the approach.

### Correction to §1

> **§1 says:** _"design + plan (mode 1) run on the `dev` working copy — no worktree, no branch."_

**False in the current code.** Shipped via **#209** §3 ("design/plan feat-locate") + **#234** (NDJSON `status.jsonl`), design and plan now behave like build:

- Mint a **worktree + `feat/{FID}` at Step 2**, rebased on `origin/dev` — `bkit-design.md:216-229`, `bkit-plan.md:220-233`.
- Commit `status.jsonl` + docs **per-step on `feat/{FID}`**, _"NO mid-lifecycle `dev` push"_ — `bkit-design.md:27`, `bkit-plan.md:27`.
- **Close Workflow = local squash-merge to `dev` + delete branch** — `git merge --squash -X ours feat/{FID}` → `docs({FID}): design DONE bkit [skip ci]` → `git push origin dev` → delete (`bkit-design.md:795-810`, `bkit-plan.md:786-792`).

So it's a **per-phase ephemeral branch**: mint from `dev` → work isolated → squash-merge to `dev` → delete → next phase re-mints. build→debug→ship remains the one persistent PR branch.

### How this changes the approach

**1. D3 (worktrees) is now an every-phase problem, not just build/ship.** §1 assumed design/plan were worktree-free on `dev`. They're not — `git worktree add .worktrees/{FID}` runs in **design and plan** too, and worktrees break on the claude.ai runner. So the worktree-independence work (adopt-or-mint, §6e) must cover **all five phases**, not just the build-side ones §3 called out.

**2. The mode-3-blocked op is now concentrated and named: the phase-close merge.** Because everything mid-phase commits to `feat/{FID}` (= the current working branch, which the proxy _does_ let you push), the **only** proxy-blocked git op per phase is the Close Workflow's local `git merge --squash` + `git push origin dev` (`bkit-design.md:801,806`; `bkit-plan.md:792`). That's one point per phase, not per-status-write.

So the §6c fallback for the `dev` tail shifts:

- **Was framed as:** `git push origin dev` (docs/status tail) → `push_files`/`create_or_update_file`, per write.
- **Now is:** replace the per-phase **local squash-merge** with a **PR-based merge** in mode 3 — open a `feat/{FID}` → `dev` PR at Close Workflow and merge it via `gh` (primary) / `merge_pull_request` (fallback, explicit skip-token-free `commit_message` per D1). The design/plan close becomes structurally the same as the build/ship close, which already merges via PR. That's _more_ uniform than a `push_files` special-case, and it folds the design/plan `dev`-landing into the same gh-primary + MCP-fallback path as §6b/§6c.

**3. #134 is closed (not planned).** The branch-isolation #134 proposed already shipped in a better shape (per-phase ephemeral branch — see the [close comment](https://github.com/cbartens/bkit/issues/134#issuecomment-4968593061)... updated there). So §6h / §8's "handle via `push_files` **or** land via PR (#134)" collapses: there's no separate #134 artifact-trail decision to defer to — the artifact trail is **already** branch-isolated per phase, and the residual is purely the phase-close merge transport, owned here.

**4. D1 (`[skip ci]` in merge body) surface shrinks but stays relevant.** Each phase now lands as **one** squash commit whose subject carries `[skip ci]` (`docs({FID}): design DONE bkit [skip ci]`). Fewer intermediate `[skip ci]` commits on `dev`, but if a design/plan close ever merges via a PR (per change #2 above), the D1 body-scan guard (§6d) must extend to the **design/plan** close paths too, not just ship.

### Net re-scope

- §1 table: flip the design/plan row to "worktree + ephemeral `feat/{FID}`, per-phase squash-merge to `dev`."
- §6e: worktree-independence covers all five phases.
- §6c/§6h: the `dev`-tail fallback is a **PR-based phase-close merge** (design/plan close mirrors build/ship close), not per-write `push_files`; drop the #134 optionality (closed).
- §6d: extend the skip-token-free merge-body guard to the design/plan close paths.

Everything else in §6 (gh primary + MCP fallback, harden gh auth in mode 3, D5 sleep-less CI wait, security §6f, trackers stay on MCP §6i) is unchanged.

---

_Generated by [Claude Code](https://claude.ai/code)_

---

### Comment by cbartens — 2026-07-14T12:16:05Z

## Updated scope: minimum top-level changes for the claude.ai runner (mode 3)

Consolidating §6 into a concrete, ordered change-set, re-based on the [current per-phase-branch code](https://github.com/cbartens/bkit/issues/341#issuecomment-4968936721). Frame per the guiding principle: **additive header rules gated on one mode flag — not a rewrite of call sites.** "Top level" = the `>` blockquote rule-block at the head of each workflow (`bkit-{design,plan,build,debug,ship}.md` + `bkit-auto.md`), plus `cloud-bootstrap.sh` and `rules.md`. Six changes, in dependency order.

---

### 0. Mode-detection anchor _(prerequisite, ~free)_

Everything branches on runtime; the primitives exist and are already used in `cloud-bootstrap.sh:26` (`CLAUDE_CODE_REMOTE=true` → mode 3; `GITHUB_ACTIONS`/`CI` → mode 2; neither → mode 1).
**Change:** add one header rule — **Runtime:** set `MODE` once at workflow start. This is the flag every rule below reads.

### 1. Harden `gh` auth + a _loud_ preflight (§6a)

`cloud-bootstrap.sh:61-63` already does `gh auth login --with-token` from `GH_BKIT_TOKEN`, but it's silent/non-blocking (`|| log`) and hits the env-precedence bug — a placeholder `GH_TOKEN`/`GITHUB_TOKEN` overrides the login (§2.2).
**Change:** prefer the sanctioned **`GH_TOKEN`** env over `--with-token`; add a header **gh-preflight** rule that runs `gh auth status` once and records `GH_OK=true|false` (loud, never silent). Makes "gh down" a known state, not an improvised one (kills D2's trigger).

### 2. Global `gh`→MCP fallback rule + tool map (§6b/6c) — _centerpiece_

Today the only gh-outage branch is `gh-error → abort` (`bkit-build.md:1301`, `bkit-debug.md:1024`), so any improvised fallback is uncontrolled — the exact chain that produced the D1 CI-suppression bug.
**Change:** one additive header rule — _"When `GH_OK=false`, use the mapped MCP tool below; retry with backoff on timeout; request minimal output; the **merge** fallback MUST pass an explicit skip-token-free `commit_message`."_ — plus the §6c map as a reference block. Applies only to the gh-covered PR/CI/merge surface; **trackers stay on MCP** (§6i). Converts D2's improvisation into a deterministic path and closes D1 by construction.

### 3. Any-branch _adopt-or-mint_ + FID decoupling (§6e) — _the biggest one_

Two mode-3 breaks converge: worktrees don't exist on the claude.ai runner (D3 — and per the code correction, **all five phases** now `git worktree add`, not just build/ship), and `bkit-auto.md:86-87` hard-rejects any non-`feat/` branch then derives `FID="${BRANCH#feat/}"` — the session is on `claude/…`, so it aborts (D4).
**Change:** a header **Branch model** rule — _adopt-or-mint_: if `MODE=3` (or already on a non-`dev` working branch), **adopt** the current branch and **skip `git worktree add`** (work in-place); else mint `feat/{FID}` + worktree as today. Plus **decouple the FID source from the branch name** — derive from the tracker/issue, not `${BRANCH#feat/}` (`bkit-auto.md:86-87`, ship 2.4, `bkit-cloud.yml`). The one change that touches each Step-2 setup, but still one rule + one FID-source swap.

### 4. Phase-close merge via PR instead of local squash-push (D4 + re-scope)

The proxy restricts `git push` to the current branch, so `git push origin dev` is blocked. After #3, mid-phase commits go to the adopted branch (allowed) — leaving **one** blocked op per phase: the Close-Workflow local `git merge --squash` + `git push origin dev` (`bkit-design.md:806`, `bkit-plan.md:792`; ship Steps 9-13 dev push, ship header line 8).
**Change:** in `MODE=3`, replace the local squash-merge with a **PR-based merge** — open a `feat/{FID}`→`dev` PR at close and merge via the rule-2 path (gh primary / `merge_pull_request` fallback). Makes design/plan close _structurally identical_ to the build/ship close that already merges via PR — more uniform than the earlier per-write `push_files`. Docs/status tail that can't ride a PR → `push_files` per the §6c map.

### 5. `sleep`-less CI wait (D5)

The claude.ai Bash tool blocks foreground `sleep`; bkit polls with it — `bkit-ship.md:556` (`sleep 30` then `gh run list`) + the build/debug CI gates.
**Change:** a header **CI-wait** rule — never foreground-`sleep`; bounded condition/event-driven poll of `gh run list --json status,conclusion`. Localized swap at ~3 sites, governed by one rule.

---

### Also required, but _not_ top-level (localized, §4)

Call-site fixes, listed so "works in mode 3" is honest:

- **Debug egress blindness** — fetches behind Trusted egress self-skip `exit 0` → silent "no runtime errors" (`.agents/config.md`, `bkit-debug.md:551-565`): needs a **Custom allowlist + loudness**.
- **Playwright report seam** — `bkit-debug.md:528` `gh run download -n playwright-report` has no MCP equivalent → fall back to job logs (`get_job_logs`); rich report lost.
- **Hard-coded macOS paths** — `docs/plans/template.md:191`, `using-git-worktrees/SKILL.md:191`.

---

### Net / sequencing

- **0-2** are cheap, additive, and unlock the rest (mode flag → gh preflight flag → mapped fallback).
- **3** (adopt-or-mint + FID decoupling) is the real structural lever — scope it first; it's the difference between "worktrees everywhere" and "runs on whatever branch the session is on."
- **4-5** fall out once **3** lands.
- Nothing rewrites phase logic: ~5 header rules gated on `MODE` + one FID-source change + 3 localized §4 fixes.

Open items unchanged (§8): fallback mechanism detail (backoff/minimal-output shape), artifact seam (job-logs-only vs one sanctioned `gh api`), `dev` branch protection + auto-delete-head-branches.

---

_Generated by [Claude Code](https://claude.ai/code)_

---

### Comment by cbartens — 2026-07-14T22:53:14Z

## Design Workflow

### Step 1 — Start Workflow

[cbartens/bkit/tree/dev](https://github.com/cbartens/bkit/tree/dev)

---

### Comment by cbartens — 2026-07-14T22:56:45Z

### Step 2 — Worktree Setup

[cbartens/bkit/tree/dev](https://github.com/cbartens/bkit/tree/dev)
[docs/plans/202607/logs/341-three-runtimes/status.jsonl](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/341-three-runtimes/status.jsonl)

---

### Comment by cbartens — 2026-07-14T23:06:29Z

### Step 3 — Brainstorm & Ideate

---

### Comment by cbartens — 2026-07-14T23:15:49Z

### Step 4 — Generate Design

[design-v1-draft.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/341-three-runtimes/design-v1-draft.md)

---

### Comment by cbartens — 2026-07-14T23:28:10Z

### Step 5 — Design Review - Verdict: CONCERNS

---

### Comment by cbartens — 2026-07-14T23:40:01Z

### Step 6 — Apply Review - Verdict: CONCERNS

[design-v2-reviewed.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/341-three-runtimes/design-v2-reviewed.md)

---

### Comment by cbartens — 2026-07-14T23:48:58Z

### Step 7 — Design Organise - Verdict: CONCERNS

[design-v3-organised.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/341-three-runtimes/design-v3-organised.md)

---

### Comment by cbartens — 2026-07-14T23:55:09Z

### Step 8 — Summary - Verdict: CONCERNS

[design-summary.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/341-three-runtimes/design-summary.md)

Verdict: CONCERNS

<!-- verdict:end -->

# Design Summary

## Overview

This design adds three-runtime workflow execution support to bkit: laptop (mode 1), GitHub Actions runner (mode 2), and claude.ai cloud session (mode 3). The core approach establishes a capability-table-based detection (`RUNTIME` → `CAN_WORKTREE`, `CAN_PUSH_DEV`, `CAN_SLEEP`, `GH_OK`) to branch control flow on what each runtime can do rather than what it is. Layer 0 (shim bash detection) feeds Layer 1 (CI-wait primitive extraction), Layer 2 (branch model: adopt-or-mint), and Layer 3 (invariant prose). Two close transports are adopted for shape A (docs-only): `git push origin dev` for modes 1–2, and `push_files` (GitHub MCP) for mode 3 — creating a design tension: mode 1 never exercises the mode-3 path, exactly how silent-failure incident D1 occurred.

## Design Quality

**Strengths:**

- Meticulously self-aware of trade-offs and risks. The design explicitly names its own worst accepted risk and records 9 named risks plus 3 open questions.
- Highly measured and evidence-based. Every claim about existing code is re-verified: STRAY guard, MODE collision, checkout-before-push sequencing, sleep counts, worktree assignments (6 sites, verified exact), structural ops (31 counted), marker parser, counter-bus idiom.
- Repair-first philosophy: each decision corrects a prior mistake (D21 state model, D23 rejecting `--dry-run` probe, D25 mechanical audit cross-check).
- Clear register boundaries: invariants (Layer 3) → prose; mechanism (Layer 0/1) → bash; procedure (Layer 2) → headers.

**Weaknesses & Gaps:**

- **Two central mechanism claims are contradicted by live code.** The shim state model (D21) assumes sourced variables survive Bash-call boundaries—they don't (35 `REPO_ROOT` re-derivations prove the opposite). The probe alternative creates a network round-trip × 34 per-block, exploding cost. **Spike A must settle this before build proceeds**; it is the fulcrum of Layer 0/1.
- **D5 (`push_files`) is demoted from "F1 resolution" to "co-equal candidate gated on Spike B".** Its claimed equivalence to `git push` is withdrawn as false on four counts: payload (193 KB inlined, §5b token bloat), conflict semantics (branch-wins server-side vs dev-wins locally — opposite of `-X ours`), STRAY tautology (guard must run over unfiltered diff first), and canonical assert (must use `get_file_contents`, not local `git show`). Only one of the four (D1 closure via explicit message) is verified. The other three are either repaired in Flow 4 (requiring extra assertions) or unrepaired (payload inversion).
- **Three load-bearing decisions have no owning spike.** The design states "Two spikes close all four pre-build decisions"; it does not. Spike A closes (2) + (4); Spike B closes (3); **D26 (which MCP server)—marked with `[!CAUTION] Build must not proceed on §6 as written`—closes none of them.** WS-2 was created to fill the gap. Guessing wrong on D26 invalidates §6c wholesale and leaves #341's centrepiece change (the fallback lane) unreachable in mode 3.
- **Credential coupling breaks the fallback premise (D26).** Both `.mcp.json:7` and `cloud-bootstrap.sh:61` read `GH_BKIT_TOKEN`. If mode 3 withholds that token (the very reason gh is flaky in §2), then MCP fails too — `GH_OK=false → use MCP` is a fallback that dies with the thing it rescues.
- **Every layer couples work in the same files.** WS-8/11/12 all touch `bkit-build.md`, `bkit-debug.md`, `bkit-ship.md`. Repo doctrine forbids concurrent workflows on one clone, so designs must be serialized at landing.
- **D7 integration coupling is larger than named.** "Adopt-or-mint + the pwd-outside-worktree rule" is 2 items; the actual integration is **13 coupled sites across 3 classes** (Placeholders definition, 5 gate items, 3 Worktree-removed items), all same-commit. A builder reading D7 only will miss 11 of them.
- **Discovery risk is high on adoption of mode 3.** The first real mode-3 run exercises all of WS-6 (detection), WS-8 (CI-wait), WS-9 (branch model), WS-11/12/13 (all three close shapes), WS-14 (fallback lane), WS-15 (peripherals). No CI can pre-exercise the mode-3 code path without a live mode-3 session, which is exactly the rot risk the design identifies.

## Acceptance Scenario

Narrative: A developer runs any phase (design/plan/build/debug/ship) from laptop, runner, or cloud session; the phase behaves identically in all three: starts without aborting on step 1, never yanks the session onto another branch, reliably lands work on `dev`, and completes through bounded fallback (not improvisation) when gh is unavailable. Afterwards, the run's status trail shows detected runtime, capability judgment, and which transport closed.

Verdict on adherence to `docs/plans/template.md` § Acceptance Scenario spec: **PASS (content)** — narrative, success criteria (7), and key edge cases (6) all present and well-reasoned. **HOWEVER: Success Criterion 1 is aspirational, not guaranteed** — "mode-1 non-regression verified by a real end-to-end run, not a rule-text-presence test" depends on WS-16 executing, which is terminal to the plan and cannot validate the design itself.

## Breaking Changes

**API surface changes:**

- New `RUNTIME` flag + 4 `CAN_*` flags in workflow contexts. Existing `MODE=CI|BRIEF` binding at `bkit-auto.md:70-80` is unaffected (D1 collision avoided by renaming).
- New `status.jsonl` row types: `runtime-resolved`, `transport-fallback`, `close-transport` (no new artifact; existing NDJSON #234).
- FID resolution reordering (D9): marker-primary, branch-fallback (already shipped in `bkit-auto.md:93-112`; only reordering above `feat/` hard-reject).
- `WORKTREE_PATH` becomes conditional (mint-or-adopt) instead of unconditional; mint case unchanged.

**Prose changes (user-facing):**

- Branch-naming rule reframe (D17): `rules.md:71` no longer demands FID in branch name once marker-primary FID resolution ships.
- Adopt mode workflow headers must drop `Worktree created/resumed` and `Worktree removed` gate items.

**None of these break existing consumers on modes 1–2; mode-3-specific paths are additive.**

## Feasibility

**Spike-gated critical path:**

- **Spike A (D21, D22 state + sleep semantics)**: 2h observation. Blocks all of Layer 0/1. **Predicted to show sourced state does NOT survive Bash-call boundaries; current cost model is wrong.** High impact on implementation.
- **Spike B (D5 `push_files` against protected dev)**: 3h observation. Blocks shape-A transport selection. **Predicted to show payload acceptance and conflict semantics are inverse of `-X ours`.** May demote D5 to never-primary.
- **Spike C (D26 which MCP server)**: Observation from live mode-3 session. Blocks §6 map authoring. **Undiagnosed; hardest gate.** May discover MCP server or credential scope differs from assumption.

**Implementation feasibility if spikes return expected:**

- Layer 0 (detection shim): **HIGH** — sourcing idiom exists (counter-bus); bats precedent (tests/counter-bus.bats).
- Layer 1 (CI-wait extraction): **HIGH** — measured (7 sleeps in 4 constructs); test rewrite is overhead, not blocker.
- Layer 2 (adopt-or-mint): **MEDIUM-HIGH** — 13 coupled sites, same-commit constraint; branch model logic is uniform (spot-checked).
- Layer 3 (invariant prose): **HIGH** — 4 sentences into `rules.md`; no new mechanism.
- Shape A close (D5 or D5(a)): **MEDIUM** — depends on Spike B outcome. If D5(a) (PR-close), §6d scope (dropping `[skip ci]` from status-commit subjects) becomes prerequisite, not option — unbudgeted scope.

**Discovery risk:** Mode-3 code is exercised only by WS-16's real end-to-end runs, not by CI or review. Silent-failure incident D1 is the proof that prose-only verification fails.

## Synthesis Coverage

**Brainstorm produced 3 ideation streams; synthesis kept these shapes:**

1. **Ideate-1 A** (sourced shim + thin pointers) → **KEPT, D21 state model repaired**. Enables testable detection; reuses counter-bus idiom.
2. **Ideate-3 A** (capability table) → **KEPT**. Runtime is input to one table, not predicate at call sites; matches `bkit-preflight.ts:1135`.
3. **Ideate-2 A** (bash-readable artifact for MCP outcomes) → **MERGED into D13/D25**. Reused `status.jsonl` instead of sentinel schema; keeps "no new artifact type" constraint.
4. **Ideate-2 B** (shell-native MCP CLI shim) → **REJECTED, deferred**. New-tooling investment; best long-term shape but out of guiding principle scope.
5. **Ideate-1 C / Ideate-3 C** (uniform PR-close in all runtimes) → **REJECTED as uniform, D5(a) promoted to co-equal for shape A**. Breaks mode-1 constraints (offline, instant, no network), but PR-close shape returns when `push_files` payload/conflict becomes blocker.

**Good options dropped intentionally:**

- Render-time mode gating (D14 REJECTED): `bkit-trackers.ts:1` resolves at install-time; runtime unknown then.
- `--dry-run` probe (D23 REJECTED): Fails dangerous — sends no ref-update, pre-receive hook never fires, branch protection never evaluated. False-positive `CAN_PUSH_DEV=true` leads to `git checkout dev` on live session (D6, Risk 1).
- Cache file for state (D21 rejected alternative): New artifact, forbidden by D13 constraint.

## Scope Alignment

**Original brief (#341):**

- Make workflows run in all three runtimes (✓ in scope).
- End-to-end in each runtime (✓ in scope as WS-16).
- When gh is unavailable, use sanctioned fallback (✓ in scope, but D26 unresolved).

**Creep detected and managed:**

- **D20 (macOS path coupling)**: Reframed as shipped consumer bug (not mode-3 issue), kept in scope but not gated behind mode-3 milestone.
- **D7 (13 coupled sites, not 2)**: Correctly identified and called out; increases same-commit risk.
- **D26 (MCP server decision)**: Not in brainstorm, added because "two spikes close all four" is false.
- **WS-2 (Spike C)**: Not in original decomposition, added to own the unowned D26.

**Scope is disciplined.** The largest unbudgeted item is §6d (drop `[skip ci]` from status-commit subjects if D5(a) wins), which only materializes on one branch of the D5 fork and is explicitly named.

## Risks

**Nine named risks (design owns 3–5 structural mitigations):**

1. Detection misfire (env var absent) → false `CAN_PUSH_DEV=true` → checkout on live session: **Mitigated by D23 double-guard + reversible checkout** (structurally, not by probe accuracy).
2. Shim becomes load-bearing for 6 workflows; must be side-effect-free: **Mitigated by Flow 1 post-source assertion** (distinct message for unset vs false).
3. Blocked-`sleep` hang produces **zero observability**: **Mitigated by `timeout`-wrapped caps** (mechanism survives blocked primitive); **Spike A must confirm platform errors rather than blocks**.
4. Repo settings (branch protection, auto-delete-head-branches) invisible to git, break autonomous close: **Mitigated by committed assertion in close path** (`:806` already fails loudly); **dependency written into `docs/deployments.md`** (not a Step-1 preflight—lacks admin scope).
5. Flags set but read nowhere; magic-number duplication: **Mitigated by vitest prose audit** (not behaviour test; presence grep for `CAN_*` readers and foreground sleeps).
6. Extra MCP calls widen lethal-trifecta surface (§5a): **Adjacent to #342**; D13's max-1 gh→MCP bound is real mitigation; do not duplicate #342's scope.
7. Mode-1 non-regression (worst outcome: mode 1 never exercises mode 3's path): **Mitigated by real end-to-end run** (not rule-text-presence test; this is D1's exact aetiology).
8. `core.bare` flip rides along in close block (laptop-specific workaround): **Decided: leave unconditional** (no-op where already false; gating adds branch for zero gain).
9. `push_files` conflict inversion (branch-wins server-side vs dev-wins locally): **Mitigated by dev-head-unmoved precondition** (narrower than `-X ours`; only if D5 survives Spike B). **Biggest accepted risk**: two transports, mode 1 never exercises mode 3, silent divergence if heads collide.

**Spike-owned risks:**

- Spike A (D21): Predicted sourced state doesn't survive Bash-call boundary; re-probe × 34 explodes cost.
- Spike A (D22): Predicted platform errors on `sleep`; if blocked, hang produces zero observability.
- Spike B (D5): Predicted `push_files` payload accepted; conflict inversion confirmed; can be preconditioned away.

## Action Items

Design is **NOT ready for planning** in its current state. The following must be resolved before `/bkit-plan`:

1. **Spike A MUST run before building Layers 0/1.** Resolve:
   - Does sourced state survive Bash-call boundaries? (Predicted: no; current cost model is wrong.)
   - Per-block re-derivation price: time `bkit_runtime_detect` ×34.
   - Does mode-3 harness **error** on `sleep` or **block**? (If block, Risk 3 hang is real; yield branch mandatory.)
   - Does harness inspect command strings? (If yes, sourcing `sleep` in shim evades guard — shim defeats its own protection.)

2. **Spike C (D26) MUST establish which MCP server serves mode 3 under which tool names, before WS-2/14 author anything.**
   - Establish whether reachable GitHub MCP is `.mcp.json`'s `github` server (needs `GH_BKIT_TOKEN` in-sandbox) or claude.ai's proxy-brokered built-in (different names).
   - Resolve credential coupling: both `.mcp.json:7` and `cloud-bootstrap.sh:61` read `GH_BKIT_TOKEN`; if mode 3 withholds it, `GH_OK=false → use MCP` fails with its own trigger condition.
   - Enumerate actual tool names; every `mcp__github__*` name in §6c is provisional.

3. **Spike B (D5) MUST measure `push_files` before WS-13 author adopts D5 or D5(a).**
   - Confirm payload acceptance (193 KB / 9 files on GitHub MCP `push_files` against protected dev).
   - Confirm conflict semantics: does `push_files` write unconditionally (clobbering concurrent dev edits) or respect dev head unmoved precondition?
   - If D5 survives, Flow 4's prologue (STRAY guard, dev-head-unmoved check, explicit message, `get_file_contents` re-read) is load-bearing.
   - If D5 rejected, D5(a) (PR-close + drop `[skip ci]`) becomes primary, making §6d scope (status-commit subjects) prerequisite, not option.

4. **D7 (13 coupled sites) scope clarification for WS-9.** Ensure builder knows all three site classes (Placeholders definition × 5 files, gate items × 5, Worktree-removed × 3) must ship in one commit; silent partial implementation breaks adopt mode on every step.

5. **Mode-3 integration risk: WS-16 real end-to-end run is the only guarantee that consumption honours flags.** CI cannot pre-exercise mode-3 code path. Accept that Success Criterion 1's "verified non-regression" rests entirely on WS-16.

6. **Two file-level concurrency hazards must be serialized at landing.** WS-8 + WS-11/12 all touch `bkit-build.md`, `bkit-debug.md`, `bkit-ship.md`. Order and batch to prevent checkout conflicts.

## Outstanding Questions

- **OQ1: Playwright artifact seam (§8.2)**: Job-logs-only for cloud e2e, or one sanctioned `gh api`/`curl` exception? No MCP artifact-download tool exists; only the rich report is lost, not the failure signal. — **Recommended:** Job-logs-only is acceptable; adjust test expectations in WS-15 to not require rich artifacts from mode-3 runs.

- **OQ2: Narrow tracker read-path corroboration (§6i)**: Should `§6i` admit narrow `gh` read fallback for private repos outside MCP? D12 says no (doctrine forbids `gh` for tracker ops); corroborate within MCP instead. If MCP-internal corroboration proves unreliable (which D12's note explains it may), revisit. — **Recommended:** Stick with D12 (MCP-internal corroboration only). If live fallback frequency shows corroboration fails, open a follow-up; don't pre-guess. Root cause of `search_issues` zero on private repos is undiagnosed (OQ3).

- **OQ3: MCP `search_issues` zero on private repos**: Is this bkit-side config/scope or upstream MCP bug? Undiagnosed; logged in `docs/failures.jsonl`, `.bkit/friction.jsonl`. — **Recommended:** Open a separate diagnosis task post-ship. D12 mitigates the symptom (mark zero as inconclusive, corroborate via `list_*` call, log as distinct state); the root cause investigation is out of scope here.

- **OQ4: Which of 4 `CAN_*` flags earn their keep?**: `CAN_SLEEP` is structurally weakest (cannot obey D2, harness-policy-gated, unprobeable from bash); turn-yield alternative needs validation it doesn't degenerate into rate-limited tight-looping. — **Recommended:** Run Spike A's sleep-semantics probe. If harness blocks (not errors), yield branch becomes mandatory; measure whether counter-bus-based cross-turn yielding can bound the poll without degeneration. If it can, `CAN_SLEEP` earns keep; if not, fallback to pure prose prose-per-attempt orchestrator loop.

- **OQ5 (not adopted, recorded to not silently drop)**: Periodic `bkit-analysis` pass summarizing `transport-fallback` frequency against `GH_OK=false` runs. Proposed in review as ongoing reader of new rows. **Recommended:** Defer. D25 gives the rows a mechanical reader inside Close Workflow (part of design scope). Analysis/aggregation is new feature; revisit if fallback frequency becomes operational concern post-ship.

## Suggested Workstreams

**Decomposition is intricate.** Four roots (WS-1, WS-2, WS-4, WS-5); three spikes plus 16 workstreams; explicit ordering hazards and coupling constraints.

**Key sequencing notes:**

- WS-1 (Spike A) blocks Layers 0/1 (WS-6, WS-8).
- WS-2 (Spike C, D26) blocks WS-14 (fallback lane) and WS-3 (Spike B) payload/server assumptions.
- WS-3 (Spike B) blocks WS-13 (shape A close) transport selection (D5 vs D5(a)).
- WS-4 (FID reorder) is prerequisite to WS-9 (adopt-or-mint, needs marker-primary FID).
- WS-6 (shim) is prerequisite to WS-7/8/9/10/14/15 (all consume `CAN_*`).
- **WS-10 (close-guard kernel D23/D24/D25) is deliberately ordered early** (depends only on WS-6) and **off Spike-B critical path** — it mitigates the design's biggest accepted risk (mode 1 never exercises mode 3) regardless of which transport wins, so deferring it until D5 fork resolves would be the single most damaging sequencing error.
- WS-13 is not one workstream: it is a fork (D5 vs D5(a), spike-gated); each branch has different scope.

**Workstreams WS-1 through WS-16 as designed are dependency-clear; no step 9 (sub-issues) is planned since FID carries no MILESTONE label.**

## Recommended Next Step

```
/bkit-plan 341

Brief: Design ready for planning phase subject to three pre-build decision spikes (A, B, C). Spike A (shim state model, sleep semantics) is critical path and highest discovery risk; settles Layer 0/1 feasibility. Spike C (which MCP server) unowned in original design; hardest gate for #341's centrepiece change (#2 fallback lane). Spike B confirms D5 viability; if rejected, activates unbudgeted scope (§6d, PR-close + drop `[skip ci]` from status-commit subjects). All three spikes must return before WS-3/6/14 author code. Mode-3 code exercised only in WS-16 real end-to-end runs; CI pre-exercise impossible. Adoption of mode 3 carries highest mode-1 regression risk since the transport-specific paths diverge (D1's exact aetiology). See design file for 26 decisions, 9 risks, 5 open questions (3 non-blocking), 7 success criteria (1 aspirational pending WS-16).

Design doc: docs/plans/202607/logs/341-three-runtimes/design-v3-organised.md
```

---

### Comment by cbartens — 2026-07-15T00:48:48Z

### Step 10 — Close Workflow

Artifacts:

- [341-three-runtimes-design.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/341-three-runtimes-design.md)
- [design-brainstorm-ideate-1.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/341-three-runtimes/design-brainstorm-ideate-1.md)
- [design-brainstorm-ideate-2.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/341-three-runtimes/design-brainstorm-ideate-2.md)
- [design-brainstorm-ideate-3.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/341-three-runtimes/design-brainstorm-ideate-3.md)
- [design-input.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/341-three-runtimes/design-input.md)
- [design-review-1.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/341-three-runtimes/design-review-1.md)
- [design-review-2.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/341-three-runtimes/design-review-2.md)
- [design-summary.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/341-three-runtimes/design-summary.md)
- [design-v1-draft.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/341-three-runtimes/design-v1-draft.md)
- [design-v2-reviewed.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/341-three-runtimes/design-v2-reviewed.md)
- [design-v3-organised.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/341-three-runtimes/design-v3-organised.md)

Landed on `dev` as `e867af74` — `docs(341-three-runtimes): design DONE bkit [skip ci]`.

---

### Comment by cbartens — 2026-07-22T07:16:07Z

## Plan Workflow

### Step 1 — Start Workflow

[cbartens/bkit/tree/dev](https://github.com/cbartens/bkit/tree/dev)
Parent design: None (this issue's own design closed as `341-three-runtimes`)

---

### Comment by cbartens — 2026-07-22T07:22:31Z

### Step 2 — Worktree Setup

[cbartens/bkit/tree/dev](https://github.com/cbartens/bkit/tree/dev)
[docs/plans/202607/logs/341-three-runtimes/status.jsonl](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/341-three-runtimes/status.jsonl)

---

### Comment by cbartens — 2026-07-22T07:36:15Z

### Step 3 — Generate Plan

[plan-v1-draft.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/341-three-runtimes/plan-v1-draft.md)

---

### Comment by cbartens — 2026-07-22T07:38:09Z

### Step 4 — Fetch Context

[related-issues.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/341-three-runtimes/related-issues.md)
[related-deferrals.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/341-three-runtimes/related-deferrals.md)
[related-failures.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/341-three-runtimes/related-failures.md)

---

### Comment by cbartens — 2026-07-22T07:45:01Z

### Step 5 — Review Plan - Verdict: CONCERNS - Failures: 1

---

### Comment by cbartens — 2026-07-22T07:54:32Z

### Step 6 — Apply Review - Verdict: PASS

[plan-v2-reviewed.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/341-three-runtimes/plan-v2-reviewed.md)

---

### Comment by cbartens — 2026-07-22T07:57:53Z

### Step 7 — Scope Check - Verdict: CONCERNS - Failures: 3

---

### Comment by cbartens — 2026-07-22T08:02:48Z

### Step 8 — Apply Scope - Verdict: CONCERNS

[plan-v3-checked.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/341-three-runtimes/plan-v3-checked.md)

---

### Comment by cbartens — 2026-07-22T08:08:13Z

### Step 9 — Complexity Check - Verdict: SPLIT

---

### Comment by cbartens — 2026-07-22T08:20:48Z

### Step 10 — Complexity Split - Verdict: PASS

[plan-v4-split.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/341-three-runtimes/plan-v4-split.md)

---

### Comment by cbartens — 2026-07-22T08:26:14Z

### Step 11 — Summary - Verdict: PASS

[plan-summary.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/341-three-runtimes/plan-summary.md)

Verdict: PASS

<!-- verdict:end -->

# Plan Summary

## Overview

This plan implements three-runtime support (#341) for bkit's five phase workflows (`/bkit-{design,plan,build,debug,ship}`) plus `bkit-auto`, enabling execution on laptop (mode 1), GitHub Actions runner (mode 2), and claude.ai cloud session (mode 3, `CLAUDE_CODE_REMOTE=true`). The approach is minimal and additive: a single runtime shim (`bkit-runtime.sh`) emits a 4-row capability table (`RUNTIME` → `CAN_WORKTREE`/`CAN_PUSH_DEV`/`CAN_SLEEP`/`GH_OK`); workflow headers branch on these flags; invariants land in `.agents/rules.md`; the close path gains transport-agnostic guards (D23/D24/D25). **Plan consists of 16 tasks (T1–T16) organized into 6 sequential sub-plans** following a dependency DAG (T1–T5 → T6–T7 → T8–T9 → T10–T13 → T14–T15 → T16). **Three pre-build decision spikes (A/B/C) have been run and closed**; findings folded into the design (design-addendum-spikes.md). The plan directly implements the settled design (verdict CONCERNS, `docs/plans/202607/341-three-runtimes-design.md`).

## Plan Quality

**Strengths:**

- Disciplined dependency DAG with explicit serialization constraints (repo forbids concurrent workflows on one clone)
- Each sub-plan is self-contained with clear "Depends on" and "Feeds" relationships
- Four successive verification gates (Prerequisites, Code Implementation, Testing & Documentation, Automated Verification) per sub-plan
- Honest about testing limits: detection + presence tested by bats/vitest; consumption verified only by live runs (design's "honest limit" D3)
- Coupled files explicitly called out with serialization notes (e.g., T7 shared with Sub-Plan 3; T10/T11 with Sub-Plan 2)
- Contingency handling for open questions: OQ-A (transport D5(a) vs D5) explicitly picks whether T12 exists; if D5 selected, T12 dropped and T13 swapped
- Spike findings (A/B/C) are folded, not re-planned

**Weaknesses & Edge Cases:**

- High discovery risk on mode 3: the first real mode-3 run (WS-16 / Sub-Plan 6) exercises all of WS-6/8/9/11/12/13/14/15; no CI pre-exercise possible (this is exactly D1's aetiology — the silent CI-suppression bug that justified the whole effort)
- Integration coupling: 13 sites in one commit for T8 (adopt-or-mint); if partial, adopt mode breaks on every step
- Three live residuals from closed spikes remain (sleep block-vs-error, which MCP server in mode 3, push_files reject-vs-clobber on moved `dev` head) — settled only by WS-16 run
- Line anchors are acknowledged as stale (verified drift: `git push origin dev` now ~:840 in ship, `core.bare` flip ~:816; no `sleep 30` at `:556`); re-grep required at build
- Design's verdict was CONCERNS (not PASS); plan inherits those concerns

## Completeness

**Coverage:**

- All 16 tasks (T1–T16) explicitly mapped to sub-plans
- Derived Test Matrix: 16 rows, one per task (rows 1–4→T3, 5–6→T7, 7–9→T9, 10→T4, 11→T1, 12→T12 conditional, 13→T5, 14–15→T16, 16→T15). No uncovered row; no duplicated row.
- Test types: bats (integration, real subprocess/git), vitest (unit + in-process integration), manual verification (@live)
- Mitigations present for all 9 design-named risks; risk window identified (mirror regen must follow any `.bkit/` source revert)

**Documentation:**

- Each sub-plan carries `Documentation Updates` rows mapped to `docs/deployments.md`, `docs/testing.md`, `docs/observability.md`, `docs/knowledge.jsonl`, `docs/decisions.jsonl`
- New test files: `tests/bkit-runtime.bats` (rows 1–9, 16), `tests/cloud-bootstrap-preflight.bats` (row 13), `.bkit/src/bkit-mcp-toolsets.test.ts` (row 10), `bkit-template-no-userpath.test.ts` (row 11), `bkit-skip-ci-subject-audit.test.ts` (row 12, conditional), `bkit-runtime-prose-audit.test.ts` (row 15)
- Batch mirror regen (`bkit install`) deferred to Sub-Plan 6 (T16) per doctrine (not after each edit)

**Architecture changes mapped:**

- [NEW] `.bkit/scripts/bkit-runtime.sh` + template (shim, capability table, GH_OK probe, Flow 1 loud-failure)
- [NEW] `runtime-resolved`, `transport-fallback`, `close-transport` row types in `status.jsonl` (additive to #234 artifact)
- [MODIFY] 8 workflow files for adopt-or-mint (T8), CI-wait migration (T7), close shapes (T10/T11/T13), skip-ci reconciliation (T12), fallback lane prose (T14), worktree helpers self-skip (T15)
- [MODIFY] `.agents/rules.md` invariants (T6), `.mcp.json` + template (T4 `actions` toolset), `cloud-bootstrap.sh` + template (T5 gh hardening), `docs/plans/template.md` (T1 no `/Users/` path)
- [DELETE] `feat/` hard-reject (T2), inline CI-dispatch kernel blocks (T7 extracted), blind CI-wait `sleep` in ship (T7)

## Acceptance Scenario

**Narrative:** A developer runs any phase (design/plan/build/debug/ship) from laptop, GitHub Actions runner, or claude.ai cloud session; the phase behaves identically in all three: starts without aborting on step 1, never yanks the session onto another branch, reliably lands work on `dev`, and completes through bounded fallback (not improvisation) when gh is unavailable. Afterwards, the run's status trail shows detected runtime, capability judgment, and which transport closed.

**Success Criteria (7):**

1. All five phases + `bkit-auto` complete end-to-end in each of the three runtimes; mode-1 verified non-regressed by a real run (not rule-text-presence test).
2. No run mutates the session's checked-out branch in a runtime that cannot restore it (zero `git checkout dev` when dev-push capability is absent).
3. Every phase-close lands on `dev` with a commit/merge body free of CI-suppression tokens; `dev` CI-dispatch outcome is asserted (not assumed).
4. Any gh→MCP transition is bounded (max 1/run), recorded in `status.jsonl`, confirmed by independent re-read, cross-checked mechanically.
5. An MCP read returning empty/zero is never recorded as authoritative absence — corroborated or reported unavailable, with the corroboration attempt logged.
6. A shim that fails to source is loud and distinguishable from a correctly-detected least-capable runtime.
7. No wait can hang; every bounded poll's cap is enforced by a mechanism that survives a blocked `sleep`.

**Edge cases identified (6):**

- Identity-vs-reality mismatch (mode-2 read-only GITHUB_TOKEN; rotated GH_TOKEN 401) — transport selected by CAN_PUSH_DEV, real push certifies loudly
- Repo settings invisible to git (branch protection on `dev`; auto-delete-head-branches) — pre-close assertion on real push; dependency in `docs/deployments.md`
- Adopt mode collapses worktree isolation — accepted; existing `.lock` is only concurrency guard
- `--dry-run` probe fails dangerous (no ref-update, branch protection never evaluated) — rejected; replaced by double-guard + reversible checkout + real push
- Sleep block-vs-error in mode 3 (Bash tool blocks foreground `sleep`) — mitigated by `timeout`-wrapped cap; observable behavior settled in WS-16 live run
- `push_files` conflict inversion on moved `dev` head (branch-wins server-side vs dev-wins locally, inverse of `-X ours`) — mitigated by dev-head-unmoved precondition; reject-vs-clobber residual settled in WS-16

**Verdict on adherence to `docs/plans/template.md` § Acceptance Scenario spec:** PASS (content). Narrative present; 7 success criteria (3 from design, 4 own); 6 edge cases identified. **SC1 is aspirational pending WS-16**: "mode-1 non-regression verified by a real run, not a rule-text-presence test" depends on Sub-Plan 6 executing, which is terminal to the plan and cannot validate the design itself. Prose-only consumption verification is the design's accepted honest limit (D3).

## Breaking Changes

**API surface:**

- New `RUNTIME` flag + 4 `CAN_*` flags (additive; no collision with existing `MODE=CI|BRIEF` binding at `bkit-auto.md:70-80`)
- New `status.jsonl` row types: `runtime-resolved`, `transport-fallback`, `close-transport` (additive; existing NDJSON artifact #234)
- FID resolution reordering (D9): marker-primary → branch-fallback (already shipped in `bkit-auto.md:93-112`; only reordering above `feat/` hard-reject, which is deleted)
- `WORKTREE_PATH` becomes conditional (mint if `CAN_WORKTREE=true`, else `$REPO_ROOT`)

**Prose/user-facing:**

- Branch-naming rule reframe (D17): `rules.md:71` no longer demands FID in branch name once marker-primary FID resolution ships
- Adopt-mode workflow headers must drop `Worktree created/resumed` and `Worktree removed` gate items
- (OQ-D conditional) `[skip ci]` dropped from phase-close and intermediate status-commit subjects (D5(a) prerequisite) — docs-only closes now fire full CI instead of `run_level=none`

**Verdict:** None break existing consumers on modes 1–2; every mode-3-specific path is additive. FID resolution is a reorder (marker already exists), not a new mechanism. Breaking-Changes section adheres to template spec.

## Design Alignment

**Alignment check:**

- Plan's Acceptance Scenario narrative: "developer runs any phase from laptop/runner/cloud; behaves identically in all three" ✓ matches design § Acceptance Scenario
- Plan's success criteria (SC1–7): all 7 present; match design's `Success Criteria` section verbatim ✓
- Plan scope: all 5 phases + `bkit-auto` + 5 close transports + 2 new fallback lanes + 9 risk mitigations ✓ within design scope
- Design's 26 decisions (D1–D26) explicitly addressed: D1 (skip-token in body), D2–D3 (shim detection), D4–D5(a) (close transports), D6–D7 (worktree), D8–D25 (guards and assertions), D26 (MCP server — C1/C2 decisions from spikes folded)
- Spikes A/B/C findings folded (not re-planned as open spikes)

**Verdict:** Plan directly implements the design with no scope leakage. Design's CONCERNS verdict carries forward (inheritance, not plan's content issue). Three pre-build decision spikes settled; residual live-mode-3 items properly tracked for WS-16.

## Deferred & Out-of-Scope

All items properly categorized per the plan:

| Item                                                    | Designation                                                                                    | Rationale                                                                                                      |
| ------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Shell-native MCP CLI shim                               | Exempt (out-of-guiding-principle scope; deferred to future / lower priority)                   | New-tooling investment; best long-term shape but not "minimal, additive changes"                               |
| Uniform PR-close in all runtimes                        | Exempt (rejected alternate in design; breaks mode-1 constraints: offline, instant, no network) | D5(a) (PR-close) is conditional on OQ-A; D5 is fallback if human selects it                                    |
| Runtime #4 (Cursor bg agent)                            | Exempt (first-class detection not in guiding principle)                                        | Scope limited to three known runtimes; Cursor left as future expansion                                         |
| Narrow gh read-path corroboration outside MCP           | Exempt (doctrine forbids gh for tracker ops; out of scope)                                     | MCP-internal corroboration per D12; if it proves unreliable, open separate follow-up                           |
| Root cause of MCP `search_issues` zero on private repos | Exempt (undiagnosed; logged in docs/failures.jsonl OQ3)                                        | Mitigated by D12 (mark as inconclusive, corroborate, log as distinct state); root-cause investigation deferred |
| Periodic transport-fallback frequency summariser        | Exempt (new feature; not in design scope)                                                      | D25 gives rows a mechanical reader inside Close Workflow; analysis/aggregation deferred                        |
| Mode-tuned subagent fan-out pacing                      | Exempt (deferred per design §6g; only if hit; would fix rate-limited tight-looping)            | N2; revisit only if shared-account rate budget becomes operational concern                                     |
| `/Users/jesse` vendored skill "fix" (D20 correction)    | Exempt (creates skill-sync drift; ships no consumer defect)                                    | Kept as-is per D20; consumer-side fix if needed; not bkit's responsibility                                     |

**Verdict:** No BLOCKING deferrals. All out-of-scope items are properly exempted (genuinely-additive or outside guiding principle). No scope gaps. OQ-A and OQ-D are contingencies (alter T12/T13 if certain human choices made), not deferrals.

## Suggested Scope Expansion

None identified. Plan is tightly scoped to the design. OQ items are gating questions (required for build decisions), not expansion candidates.

## Risks

**Nine design-named risks (plan owns mitigations for 3–5):**

1. **Detection misfire** (env var absent → false `CAN_PUSH_DEV=true` → checkout on live session) — Mitigated by D23 double-guard + reversible checkout (structural, not probe accuracy)
2. **Shim load-bearing** (must be side-effect-free) — Mitigated by Flow 1 post-source assertion (distinct message for unset vs false)
3. **Blocked `sleep` hang** (produces zero observability) — Mitigated by `timeout`-wrapped caps; Spike A confirmed platform errors rather than blocks; unobservable behavior settled by live run
4. **Repo settings invisible to git** (branch protection, auto-delete-head-branches) — Mitigated by committed assertion in close path; dependency written into `docs/deployments.md`; Risk-4 is NOT a Step-1 preflight (lacks admin scope)
5. **Flag duplication** (flags set but read nowhere) — Mitigated by vitest prose audit (not behavior test; presence grep for `CAN_*` readers + foreground-sleep audit)
6. **Extra MCP calls widen lethal-trifecta surface** (prompt injection per §5a) — Adjacent to #342; D13's max-1 bound is real mitigation; no scope duplication
7. **Mode-1 non-regression** (mode 1 never exercises mode 3's path) — Mitigated by real end-to-end run (not rule-text-presence test); this is D1's exact aetiology
8. **`core.bare` flip** (laptop-specific workaround) — Decided: leave unconditional (no-op where already false; gating adds branch for zero gain)
9. **`push_files` conflict inversion** (branch-wins server-side vs dev-wins locally, opposite of `-X ours`) — Mitigated by dev-head-unmoved precondition (narrower than `-X ours`); biggest accepted risk; two transports, mode 1 never exercises mode 3, silent divergence if heads collide (settled by live run)

**Spike-owned residuals (to settle in WS-16):**

- Sleep block-vs-error (mitigated regardless by `timeout` cap)
- Which MCP server mode 3 loads + whether `GH_BKIT_TOKEN` in-sandbox (determines whether C2 lands decoupled or coupled; safe either way)
- `push_files` reject-vs-clobber on a moved `dev` head (mitigated by precondition guard; only if guard fails)

**Unknowns requiring resolution before build:**

- OQ-A: Transport choice D5(a) PR-close (recommended) vs D5 `push_files` — picks whether T12 exists
- OQ-B: Playwright artifact seam — job-logs-only fallback acceptable?
- OQ-C: `dev` branch-protection config permits autonomous close + auto-delete-head-branches enabled (human/admin action required)
- OQ-D: Docs-close CI cost (OQ-A=D5(a) consequence) — accept full CI or require skip-signal without surfacing token?

## Action Items

**For build to proceed, the following MUST be resolved:**

1. **Human confirmation of parent plan's `👤` gates (Gate 1 in Sub-Plan 1):**
   - [ ] Acceptance Scenario confirmed (parent checkbox)
   - [ ] Breaking Changes confirmed (parent checkbox)
   - [ ] Open Questions confirmed (parent checkbox)
   - Without these, Sub-Plan 1 (T1–T5) cannot start

2. **Explicit resolution of OQ-A (transport choice for D5(a) vs D5) BEFORE Sub-Plan 4:**
   - If **D5(a) PR-close** (recommended): proceed as planned; T12 exists; T13 uses PR-merge tail
   - If **D5 `push_files`**: drop T12 entirely; swap T13's tail to use `push_files` + `get_file_contents` assert + dev-head-unmoved precondition; re-verify Sub-Plan 4's matrix/runbook; drop matrix row 12
   - **Plan default:** D5(a) (uniform with ship, credential-decoupled, no payload bloat, no conflict inversion)

3. **Explicit resolution of OQ-D (docs-close CI cost, contingent on OQ-A=D5(a)) BEFORE Sub-Plan 4:**
   - If **accept full CI on docs-only closes**: proceed as planned; T12 removes `[skip ci]` from subjects; docs closes fire full CI
   - If **decline CI cost**: require D5(a) transport to carry skip signal WITHOUT surfacing token in merge subject (Failure Path back to OQ-A)
   - **Plan assumption:** OQ-D cost is accepted (same class as D11 sleep reversal, a knowing reversal)

4. **Confirmation of OQ-B (job-logs-only Playwright fallback) BEFORE Sub-Plan 5:**
   - [ ] Confirm `get_job_logs` is the standing default (failure signal not lost, rich report lost)
   - [ ] Verify `download_workflow_run_artifact` output shape against a real run (WS-16); adopt it ONLY if it carries rich report

5. **Confirmation of OQ-C (branch config) BEFORE Sub-Plan 3/6:**
   - [ ] Branch protection on `dev` permits the autonomous close (status-checks-only, no required human review)
   - [ ] "Automatically delete head branches" is enabled (there is no MCP `delete_branch` tool)
   - **Manual verification step 4 (Sub-Plan 6 / WS-16):** confirm this post-deployment

6. **Acknowledge design's honest limit (D3):**
   - Prose consumption cannot be verified by static analysis; SC1's "mode-1 non-regression verified by real run" rests entirely on WS-16
   - Three live residuals (sleep behavior, MCP server, `push_files` conflict) are mitigated structurally but final behavior settled only by live run

7. **Address design's CONCERNS verdict:**
   - Design identified 9 risks, 5 open questions, 7 success criteria; plan operationalizes mitigations
   - Plan cannot resolve design's CONCERNS → must be accepted as inherited precondition to build
   - Spikes A/B/C closed; findings folded; no further re-spikes planned

## Recommended Next Step

```
/bkit-build 341

Brief: Plan ready for build. Human must confirm parent's `👤` gates (Acceptance / Breaking / OQ-A/D/B/C) before Sub-Plan 1 starts. OQ-A (transport D5(a) vs D5) picks whether T12 exists; OQ-D (docs-close CI cost) gates scope of T12. Sub-Plans 1–5 land 16 tasks across 8 workflow files, `.agents/rules.md`, tests, and docs with explicit serialization (repo forbids concurrent workflows on one clone). Sub-Plan 6 (WS-16) is terminal: prose audit, batch mirror regen, live end-to-end runs in all three runtimes to settle three residuals (sleep block-vs-error, MCP server presence, push_files conflict). Plan directly implements design (verdict CONCERNS, docs/plans/202607/341-three-runtimes-design.md). Three pre-build spikes (A/B/C) closed; findings folded into sub-plans. See plan-v4-split.md (parent index) + six sub-plan children for full task breakdown.

Plan doc: docs/plans/202607/logs/341-three-runtimes/plan-v4-split.md
```

---

### Comment by cbartens — 2026-07-22T08:30:00Z

### Step 12 — Close Workflow

#### Artifacts

- [341-three-runtimes-design.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/341-three-runtimes-design.md)
- [341-three-runtimes-plan-1.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/341-three-runtimes-plan-1.md)
- [341-three-runtimes-plan-2.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/341-three-runtimes-plan-2.md)
- [341-three-runtimes-plan-3.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/341-three-runtimes-plan-3.md)
- [341-three-runtimes-plan-4.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/341-three-runtimes-plan-4.md)
- [341-three-runtimes-plan-5.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/341-three-runtimes-plan-5.md)
- [341-three-runtimes-plan-6.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/341-three-runtimes-plan-6.md)
- [341-three-runtimes-plan.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/341-three-runtimes-plan.md)
- [plan-complexity-check.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/341-three-runtimes/plan-complexity-check.md)
- [plan-input.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/341-three-runtimes/plan-input.md)
- [plan-review-1.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/341-three-runtimes/plan-review-1.md)
- [plan-review-2.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/341-three-runtimes/plan-review-2.md)
- [plan-review-3.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/341-three-runtimes/plan-review-3.md)
- [plan-scope-check-1.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/341-three-runtimes/plan-scope-check-1.md)
- [plan-scope-check-2.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/341-three-runtimes/plan-scope-check-2.md)
- [plan-summary.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/341-three-runtimes/plan-summary.md)
- [plan-v1-draft.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/341-three-runtimes/plan-v1-draft.md)
- [plan-v2-reviewed.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/341-three-runtimes/plan-v2-reviewed.md)
- [plan-v3-checked.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/341-three-runtimes/plan-v3-checked.md)
- [plan-v4-1.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/341-three-runtimes/plan-v4-1.md)
- [plan-v4-2.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/341-three-runtimes/plan-v4-2.md)
- [plan-v4-3.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/341-three-runtimes/plan-v4-3.md)
- [plan-v4-4.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/341-three-runtimes/plan-v4-4.md)
- [plan-v4-5.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/341-three-runtimes/plan-v4-5.md)
- [plan-v4-6.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/341-three-runtimes/plan-v4-6.md)
- [plan-v4-split.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/341-three-runtimes/plan-v4-split.md)

Landed on `dev` as `992f80a2` — `docs(341-three-runtimes): plan DONE bkit [skip ci]`.

#### Telemetry

**plan close** · cbartens/bkit

| metric          | this run                       | med·5 |
| --------------- | ------------------------------ | ----- |
| durationSeconds | 40042 (11h7m)                  | —     |
| linesChanged    | 4373 (+4337/-36)               | —     |
| filesChanged    | 31                             | —     |
| taskCount       | 119                            | —     |
| frictionAdded   | 1                              | —     |
| deferralsAdded  | 2                              | —     |
| failuresAdded   | 0                              | —     |
| compliance      | 2 pass · 0 fail · 0 n/a (100%) | —     |
| attempts        | PLAN_ATTEMPT 1                 | —     |

---

### Comment by cbartens — 2026-07-23T23:51:05Z

Cursor promoted to first-class Runtime 4 (design/plan updated)

Scope change (2026-07-23/24): Cursor Cloud Agents moved from deferred to a first-class Runtime 4 in the capability table (was unknown → least-capable). Profile is mode-2-equivalent (CAN_WORKTREE/CAN_PUSH_DEV true, GH_OK probed).

Detection (verify-first): the reliable Cursor-cloud signal is the stdin-JSON hook field is_background_agent (already used by .cursor/hooks/preflight.sh, shipped in #75) — not a workflow-shell env var; CURSOR_AGENT/CURSOR_REMOTE_AGENT are unconfirmed. The shim bridges that signal to a bash-visible env marker via a bkit seam (.cursor/environment.json env or a SessionStart hook export). Exact bridge + sleep-block behaviour held for live confirmation in Sub-Plan 6 before mode 4 is asserted in SC1. Non-regressive: unmatched Cursor still falls through to unknown.

Folded into T3; deferrals.jsonl entry runtime-4-cursor-… → CLOSED.

---

## Master Plan — docs/plans/202607/341-three-runtimes-plan.md

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

bkit's five phase workflows (`/bkit-{design,plan,build,debug,ship}`) + `bkit-auto` were authored for a laptop (mode 1) but now run in **three materially different runtimes**: laptop (mode 1), GitHub-Actions runner (mode 2), and a **claude.ai cloud session** (mode 3, `CLAUDE_CODE_REMOTE=true`). Several steps assume laptop-only capabilities. Running phases on the claude.ai runner surfaced a cluster of deviations culminating in a **silent CI-suppression bug (D1)**: `[skip ci]` leaked into a squash-merge _body_ on `dev` because an unauthed `gh` was replaced by an ad-hoc, unguarded MCP `merge_pull_request` that defaulted the body.

This plan implements the **settled design** (`docs/plans/202607/341-three-runtimes-design.md`, verdict CONCERNS) whose guiding principle is **minimal, additive changes gated on one capability table — not a rewrite of every call site**. The mechanism: a sourced runtime shim (`bkit-runtime.sh`) emits a 4-row capability table (`RUNTIME` → `CAN_WORKTREE`/`CAN_PUSH_DEV`/`CAN_SLEEP`/`GH_OK`); workflow headers branch on `CAN_*`; invariants land in `.agents/rules.md`; the close path gains transport-agnostic guards (D23/D24/D25). Three pre-build spikes (A/B/C) have **run and closed** (`spike-findings.md`, `design-addendum-spikes.md`) — their findings are folded, and they are NOT re-planned as open spikes; the only residuals are live-mode-3 observations owned by the terminal verification task (Sub-Plan 6).

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

1. All five phases + `bkit-auto` complete end-to-end in each of the three runtimes; the mode-1 laptop path is verified non-regressed by a real end-to-end run (not a rule-text-presence test). This run is also the only guarantee that prose rules _honour_ the capability flags — no static engine can assert that.
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

Shell-native MCP CLI shim; uniform PR-close all runtimes; Runtime-#4 (Cursor bg agent) first-class detection; narrow gh read-path corroboration outside MCP; root-cause of MCP `search_issues` zero-on-private-repo; periodic transport-fallback frequency summariser; mode-tuned subagent-fan-out pacing; the `/Users/jesse` vendored skill "fix" (D20 correction). Each mirrored in `docs/deferrals.jsonl` (OQ3 in `docs/failures.jsonl`).

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
| [341-three-runtimes-plan-6.md](./341-three-runtimes-plan-6.md) | Terminal verification: prose audit, batch mirror regen, live mode-1/2/3 runs, SC1–7 | T16 | 14, 15 | ALL (Sub-Plans 1–5) | 🔒 Gate 4 final suite; Manual Steps 1–4; OQ-C confirm |

**Derived Test Matrix → task → sub-plan map (all 16 rows, one task each):** rows 1–4→T3 (SP1), 5–6→T7 (SP2), 7–9→T9 (SP3), 10→T4 (SP1), 11→T1 (SP1), 12→T12 (SP4), 13→T5 (SP1), 14–15→T16 (SP6), 16→T15 (SP5). No uncovered row; no duplicated row.

## Merge Method

**Merge method: always squash.** Default `gh pr merge --squash --delete-branch --body ""`. Landings serialise (shared files across T7/T10/T11 and T8/T12); decompose into separate PRs per landing group rather than requesting a non-squash merge. Never `rebase`/`merge-commit` into `dev`.
