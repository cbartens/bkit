# Plan Input — #341

## Session prompt

```
/bkit-plan 341
```

## Issue DESCRIPTION (#341 — "Make workflows run in all runtimes local GH Actions claude.ai")

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

---

## Issue COMMENTS (verbatim, chronological)

### Comment 1 — 2026-07-14T11:21:47Z (cbartens)

**Relationship to #134 — kept separate on purpose.**

#134 stays open as an **independent, mode-agnostic** decision: where the design→plan→build→ship artifact trail + `status.json` live — on `dev` early (status quo **A**) vs. on the feature branch via the PR (**B**). Its live tension is rebase churn over the weeks-long design→build gap vs. design/plan docs being searchable on `dev` before ship.

This issue (§6h) deliberately **does not force** that decision: the mode-3-blocked `git push origin dev` docs/status tail is handled by the `push_files` API fallback, so cloud support works with status quo A unchanged. The two issues intersect only at that single transport point — #134 is neither a blocker for nor a dependency of the cloud work here.

---

_Generated by [Claude Code](https://claude.ai/code)_

### Comment 2 — 2026-07-14T12:03:56Z (cbartens)

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

### Comment 3 — 2026-07-14T12:16:05Z (cbartens)

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

### Comment 4 — 2026-07-14T22:53:14Z (cbartens)

## Design Workflow

### Step 1 — Start Workflow

[cbartens/bkit/tree/dev](https://github.com/cbartens/bkit/tree/dev)

### Comment 5 — 2026-07-14T22:56:45Z (cbartens)

### Step 2 — Worktree Setup

[cbartens/bkit/tree/dev](https://github.com/cbartens/bkit/tree/dev)
[docs/plans/202607/logs/341-three-runtimes/status.jsonl](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/341-three-runtimes/status.jsonl)

### Comment 6 — 2026-07-14T23:06:29Z (cbartens)

### Step 3 — Brainstorm & Ideate

### Comment 7 — 2026-07-14T23:15:49Z (cbartens)

### Step 4 — Generate Design

[design-v1-draft.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/341-three-runtimes/design-v1-draft.md)

### Comment 8 — 2026-07-14T23:28:10Z (cbartens)

### Step 5 — Design Review - Verdict: CONCERNS

### Comment 9 — 2026-07-14T23:40:01Z (cbartens)

### Step 6 — Apply Review - Verdict: CONCERNS

[design-v2-reviewed.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/341-three-runtimes/design-v2-reviewed.md)

### Comment 10 — 2026-07-14T23:48:58Z (cbartens)

### Step 7 — Design Organise - Verdict: CONCERNS

[design-v3-organised.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/341-three-runtimes/design-v3-organised.md)

### Comment 11 — 2026-07-14T23:55:09Z (cbartens)

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

### Comment 12 — 2026-07-15T00:48:48Z (cbartens)

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

## Post-close addendum (NOT posted as an issue comment — committed directly to `dev` at `debe85b3`)

**Location:** `docs/plans/202607/logs/341-three-runtimes/design-addendum-spikes.md` and `docs/plans/202607/logs/341-three-runtimes/spike-findings.md` (both exist in this FID's logs directory — read them directly for full detail).

**Summary:** Spikes A, B, and C (named as blockers in the Design Summary's Action Items above) have been run and resolved:

- **Spike A (state model): SETTLED.** State dies across a Bash-call boundary (only `cwd` survives) → D21 stands as written (re-source the shim per block; round-trip `GH_OK` through `status.jsonl`). Env-only re-derivation costs ~0.5ms/call — the "×34 explodes cost" worry in the design summary was overstated (it only applies to network probes, which D21 already caches). Sleep block-vs-error remains unobservable in mode 1 and is deferred to the WS-16 live mode-3 run; D22's `timeout` cap mitigates either way.
- **Spike B (push_files, reduced test — no protected-dev conflict case): mechanics settled.** `push_files` is append-only, single-parent-on-head, atomic across multiple files, full-content payload (not a diff). It **cannot express `merge --squash -X ours`** — so as a shape-A close transport it requires a dev-head-unmoved precondition (Risk 9 is load-bearing, not optional). Reject-vs-clobber behavior on a moved head is still deferred (needs a protected-dev test).
- **Spike C (static analysis): produced two decisions, C1 and C2 (both recorded in the addendum with full grounding):**
  - **C1 — ENABLE the `actions` MCP toolset.** The shipped `.mcp.json` `X-MCP-Toolsets` header omits `actions`, so the §6c CI/Actions fallback map (`gh run list` → `actions_list`, `gh run view --log-failed` → `get_job_logs`, etc.) is currently unreachable — no such tools exist in the current toolset. Verified against github/github-mcp-server that `actions_get`'s `download_workflow_run_artifact` method covers the Playwright-report seam (closes OQ1 / the "no MCP artifact-download tool" gap named in §4 of the issue body above). Decision: add `actions` to the toolset config.
  - **C2 — DECOUPLE the fallback auth; loud dual-lane preflight; NO second token.** Confirmed from source that both `.mcp.json:7` and `cloud-bootstrap.sh:61` authenticate via the _same_ `${GH_BKIT_TOKEN}` — meaning if mode 3 withholds that token (the exact reason gh is flaky per §2 above), the MCP fallback dies together with gh, defeating the `GH_OK=false → use MCP` premise. Decision: (1) prefer the platform's proxy-brokered built-in GitHub MCP in mode 3 when present (decouples from `GH_BKIT_TOKEN`; confirm presence + tool names in the first live mode-3 session), (2) loud preflight over BOTH lanes — if neither gh nor MCP can authenticate, **ABORT with a clear message**, never silently degrade, (3) do NOT add a second explicit MCP token — a token-withholding sandbox withholds it regardless, and a second secret is pure management overhead for no gain.

**Residual live-mode-3 items** (explicitly carried forward as accepted risks, to be settled by WS-16's real end-to-end run, not by further spikes): sleep block-vs-error (mitigated regardless by `timeout` cap), which MCP server mode 3 actually loads + whether `GH_BKIT_TOKEN` is in-sandbox (determines whether C2 lands as "decoupled" or "coupled/hard-fail" — safe either way), and push_files reject-vs-clobber on a moved head (mitigated by the dev-head-unmoved precondition guard).

**Plan-readiness verdict (from the addendum):** "Four 'pre-build decisions' are now resolved or converted to named-and-mitigated risks. `/bkit-plan 341` is unblocked." The addendum instructs the plan to: treat Spikes A and B as **CLOSED** (fold findings into the plan; drop them from the workstream spike list — do NOT re-plan them as open spikes), implement **C1** (one-line `actions` toolset addition; re-map §6c to the MCP tool names verified in the addendum table; drop the OQ1 / §4 "no artifact-download tool" limitation), implement **C2** (dual-lane loud preflight; prefer the proxy-brokered built-in in mode 3; keep a single shared token, no second secret), and keep **WS-16** as the single live-mode-3 validation that closes the three residual items above.
