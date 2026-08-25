# Design Input — 341-three-runtimes

## Session prompt

`/bkit-design from https://github.com/cbartens/bkit/issues/341#issuecomment-4969039411`

**Design brief:** Design the implementation of the **minimum top-level change-set** that makes bkit's five workflows (`bkit-{design,plan,build,debug,ship}.md` + `bkit-auto.md`) run correctly in **all three runtimes** — local laptop (mode 1), GitHub-Actions runner (mode 2), and the claude.ai runner (mode 3) — following the guiding principle: **minimal, additive changes** (a mode flag + header rules + a gh→MCP fallback map + adopt-or-mint branch model), **not** a rewrite of every call site.

The **primary seed** is the "Updated scope" comment (comment 3 below): six ordered, dependency-linked top-level changes. The issue body (§1–§8) and the two prior comments are supporting context — especially the code-correction comment (comment 2), which established that design/plan already branch-isolate per phase (so worktrees now span **all five phases**, and the only mode-3-blocked git op per phase is the phase-close local squash-merge + `git push origin dev`).

**Hard constraints (must hold in the design):**

- gh stays **primary** for PR/CI/merge/repo-identity; GitHub MCP is a **controlled fallback**, only when gh is unavailable (§5 downsides: injection surface, token/verbosity bloat, remote-timeout failure mode).
- **Trackers stay on MCP** in all modes (§6i — provider symmetry with Linear which is MCP-only; rich markdown bodies; Projects v2). The gh→MCP fallback applies ONLY to the gh-covered PR/CI/merge surface, never to tracker issue/label/comment/search/projects ops.
- Changes must be **additive header rules gated on a single `MODE` flag** wherever possible — avoid per-call-site rewrites and avoid regressing mode 1 (the everyday laptop path).
- No new stack coupling; keep the shipped surface stack-agnostic.
- ASCII operators only in workflow/prompt markdown (`!=`, `>=`, `<=`).

**Scope boundary (design, not build):** produce the design for the six changes + the three localized §4 fixes. Do NOT write workflow code here. Decompose into buildable workstreams with dependency ordering (change 3 — adopt-or-mint + FID decoupling — is the structural lever; 0–2 unlock the rest; 4–5 fall out of 3).

---

## Issue #341 — body (DESCRIPTION)

**Title:** Make workflows run in all runtimes local GH Actions claude.ai
**State:** open · **Labels:** enhancement, bkit:design · **Milestone:** Managed Agents
**URL:** https://github.com/cbartens/bkit/issues/341

### Premise

bkit's workflows were authored for a **local developer laptop**, but they now run in **three materially different runtimes**, and several steps assume capabilities only the laptop has. Running the phases via **claude.ai cloud agents** (Claude Code on the web) surfaced a cluster of deviations — including a _silent CI-suppression bug_ — that trace back to conflating these runtimes.

**Guiding principle:** _make the one workflow run in all modes with **minimal, additive changes**_ — a global fallback rule + a gh→MCP tool map + retry/minimal-output rules + any-branch support — **not** a rewrite of every call site.

### §1. The three runtimes

<!-- prettier-ignore -->
| Dimension | 1. local (laptop) | 2. gh-action runner | 3. claude.ai runner |
| --- | --- | --- | --- |
| Triggered by | dev runs `/bkit-*` in IDE | CI event/label → `.github/workflows/{claude,opencode,bkit-cloud}.yml` on ubuntu-latest | user starts a session at claude.ai/code (or Auto-fix webhook) |
| gh CLI auth | `gh auth login` keychain — reliable | default `GITHUB_TOKEN`, gh reads it — reliable transport | **fragile** (§2) |
| Write / merge token | dev's own creds (full) | **GH_BKIT_TOKEN** (PAT/App) — not `GITHUB_TOKEN` (read-only + won't fire CI) | real tokens kept out of sandbox; server-side merge needs the fragile PAT |
| GitHub MCP / built-in | usually not configured | optional | proxy-managed → auth-reliable, but see §5 |
| git push | unrestricted | standard runner (branch-protection only) | **proxy-restricted to the current working branch** |
| Worktree `.worktrees/{FID}` | native | works | **breaks** — session is on `claude/…`, no worktrees |
| Network egress (debug-fetch) | full | full | **Trusted allowlist**; app backends need a Custom allowlist |
| Autonomous merge to dev | ✅ gh | ✅ gh (GH_BKIT_TOKEN/App) | ✅ gh if authed, else MCP fallback (both server-side) |

Detection primitives exist: `CLAUDE_CODE_REMOTE=true` (mode 3), `GITHUB_ACTIONS`/`CI` (mode 2), neither (mode 1).

### §2. Root cause — why gh auth is flaky on the claude.ai runner (mode 3)

Three auth lanes; gh is disadvantaged by design: **git** (scoped proxy credential, push restricted to current branch), **built-in GitHub tools** (proxy-brokered, token never enters container), and **gh CLI** (needs a real PAT inside the sandbox). Ranked reasons gh is flaky in mode 3:

1. gh needs a real token the platform deliberately withholds (works only if `GH_BKIT_TOKEN`/`GH_TOKEN` present + valid this session; dashboard env vars invisible to snapshot setup script; KN-CORE-1: 401 after rotation).
2. **Env-var precedence** (the reported "invalid GH_TOKEN"): gh reads `GH_TOKEN`→`GITHUB_TOKEN`, an env token overrides `gh auth login` creds. bkit uses `gh auth login --with-token` with a differently-named `GH_BKIT_TOKEN` (`cloud-bootstrap.sh:56-64`); a placeholder `GH_TOKEN` beats it.
3. Go-binary TLS/proxy trust (`x509: certificate signed by unknown authority`); `api.github.com` is allowlisted, so it's a trust/proxy-auth failure, not a domain block.
4. Silent, non-blocking bootstrap — `cloud-bootstrap.sh` swallows failure with `|| log`; SessionStart hooks can't block.

**Takeaway:** gh auth is _fixable_ in mode 3 → harden gh + fall back to MCP when still unavailable, not abandon gh.

### §3. Observed deviations (tagged by mode)

- **D1 — `[skip ci]` leaked into the squash-merge body → CI suppressed on dev** (mode 3). Ship of #703: 16 commit messages concatenated into merge body; one carried `[skip ci]`. Actions scans subject AND body → dev ran no CI. Chain: gh unauthed (D2) → ad-hoc MCP `merge_pull_request` → MCP used default concatenated body. Step 6.3 scans only PR title; backstop is a `gh run list`.
- **D2 — ad-hoc, unguarded tool substitution** (mode 3). Only gh-outage branch is `gh-error → abort`; improvised fallback is uncontrolled (→ D1). Fix: explicit, mapped, rule-governed fallback.
- **D3 — worktree model vs. single session branch** (mode 3). `git worktree add .worktrees/{FID}` + "pwd outside worktree → Failure Path"; claude.ai session has no `.worktrees/`.
- **D4 — FID coupled to the `feat/` branch name** (mode 3). `bkit-auto.md:86-87` rejects non-`feat/` branches (`FID="${BRANCH#feat/}"`); ship 2.4 + `bkit-cloud.yml` too. Proxy restricts `git push` to current branch → `git push origin dev` / feat push / `--delete` fail (infrastructure, not policy).
- **D5 — `sleep`-based CI polling stalls** (mode 3). bkit polls CI with `sleep` (`bkit-ship.md:556`; build/debug gates); claude.ai Bash blocks foreground `sleep` → needs condition/event-driven wait.

### §4. Secondary breakage (mode 3)

- `/bkit-debug` egress blindness — external-CLI/backend fetches behind Trusted egress self-skip `exit 0` → silent "no runtime errors" (`.agents/config.md:18-126`, `bkit-debug.md:551-565`). Fix = allowlist + loudness.
- e2e Playwright-report artifact seam — `bkit-debug.md:528` `gh run download -n playwright-report`; no MCP artifact-download tool. Failure signal is in job logs (`get_job_logs`); only the rich report is lost.
- Hard-coded macOS paths — `docs/plans/template.md:191`, `.agents/skills/using-git-worktrees/SKILL.md:191`.

### §5. Downsides of GitHub MCP (why it's a fallback, not the default)

- **5a. Security — lethal-trifecta prompt-injection.** A malicious public issue with hidden instructions can hijack an agent holding a broad token into exfiltrating private-repo data. Architectural, "no obvious fix." bkit hits all three legs (reads untrusted issue bodies+comments, holds broad `GH_BKIT_TOKEN`, can act). Mitigation: narrowest-scoped token + treat all tracker/PR/comment content as untrusted; never let it steer git/merge actions. (Being addressed separately in #342.)
- **5b. Context / token bloat.** ~93 tools ≈ 55k tokens schema; quality degrades past ~50 tools; verbose payloads brutal. Mitigated by ToolSearch + toolset scoping + `minimal_output`, but response verbosity still costs per call.
- **5c. Reliability, cost, debuggability.** Remote MCP fails on TCP timeouts; ~$55/mo vs ~$3 at 10k ops; MCP failures opaque (no exit code/stderr to branch on) — friction for bkit's bash `|| Failure Path` gates.

### §6. Direction (settled: gh primary, MCP fallback)

- **6a. Harden gh in mode 3** — prefer sanctioned `GH_TOKEN` env over `--with-token`; fix Go-TLS/CA + proxy trust; loud preflight `gh auth status`.
- **6b. Global gh→MCP fallback rule (workflow header)** — single additive rule: if gh unavailable/unauthed, use mapped MCP tool; retry w/ backoff on timeout; request minimal output; the merge fallback MUST pass an explicit skip-token-free `commit_message`.
- **6c. gh → MCP tool map** — repo-view→get_me/parse remote; pr create→create_pull_request; pr view→pull_request_read; pr list→list_pull_requests; pr merge→merge_pull_request (⚠ skip-free commit_message); pr edit→update_pull_request; update-branch→update_pull_request_branch; run list→actions_list; run view/log→actions_get/get_job_logs; run download playwright→none (keep gh api); `git push origin dev` tail→push_files/create_or_update_file or land via PR.
- **6d. D1 fix (all paths)** — guarantee skip-token-free merge body; extend the scan to the resulting squash body, not just PR title; consider dropping `[skip ci]` from intermediate status-commit subjects.
- **6e. Any-branch support** — adopt-or-mint: if already on a non-`dev` working branch, adopt it (no worktree); else mint `feat/{FID}` (+worktree). Requires decoupling FID from the branch name.
- **6f. Security constraint (first-class, all modes)** — narrowest-scoped token; treat tracker/PR/comment content as untrusted.
- **6g. Deferred — N2** — subagent fan-out vs shared account rate budget; revisit only if hit.
- **6h. #134 optionality** — SUPERSEDED (see comment 2): #134 closed not-planned; the artifact trail is already branch-isolated per phase; residual is the phase-close merge transport, owned here.
- **6i. Trackers stay on MCP** — provider symmetry (Linear is MCP-only), rich markdown bodies, cleaner Projects v2. gh→MCP fallback applies only to the gh-covered PR/CI/merge surface.

### §7. Prerequisites & seams

- Branch protection on dev must permit the autonomous merge (status-checks-only, no required human review).
- Head-branch cleanup has no MCP tool → rely on repo "Automatically delete head branches" setting.
- D5: replace `sleep` CI-polling with condition/event-driven wait.
- Cleared non-issues: `npm.pkg.github.com` is allowlisted; full MCP write surface present in mode 3.

### §8. Open decisions / to investigate

1. Investigate the gh→MCP fallback mechanism end-to-end: detection of "gh unavailable," retry/backoff shape, minimal-output patterns, and how mapped MCP calls fit bkit's bash-gate control flow.
2. Artifact seam: job-logs-only for cloud e2e, or one sanctioned `gh api`/`curl` exception?
3. dev config: confirm branch protection allows the autonomous merge; enable auto-delete-head-branches.

---

## Comment 1 — Relationship to #134 (kept separate)

#134 stayed open as an independent, mode-agnostic decision (artifact-trail A vs B). §6h deliberately does not force it. NOTE: superseded by comment 2 — #134 has since been closed not-planned.

---

## Comment 2 — Code-correction: current code already branch-isolates every phase (re-scopes §1 and §6)

Re-checked against live source. §1's table row _"design + plan run on the dev working copy — no worktree, no branch"_ is **FALSE in current code**. Shipped via #209 §3 + #234: design and plan now behave like build —

- Mint a **worktree + `feat/{FID}` at Step 2**, rebased on origin/dev (`bkit-design.md:216-229`, `bkit-plan.md:220-233`).
- Commit `status.jsonl` + docs **per-step on `feat/{FID}`**, NO mid-lifecycle dev push (`bkit-design.md:27`, `bkit-plan.md:27`).
- **Close Workflow = local squash-merge to dev + delete branch** (`git merge --squash -X ours feat/{FID}` → `docs({FID}): design DONE bkit [skip ci]` → `git push origin dev` → delete; `bkit-design.md:795-810`, `bkit-plan.md:786-792`).

Per-phase ephemeral branch: mint from dev → work isolated → squash-merge → delete → next phase re-mints. build→debug→ship remains the one persistent PR branch.

**How it changes the approach:**

1. **D3 is now an every-phase problem** — `git worktree add` runs in design & plan too; adopt-or-mint (§6e) must cover **all five phases**.
2. **The mode-3-blocked op is concentrated & named: the phase-close merge.** Mid-phase commits go to `feat/{FID}` (= current branch, pushable). The ONLY proxy-blocked git op per phase is the Close Workflow's local `git merge --squash` + `git push origin dev`. The §6c dev-tail fallback shifts from per-write `push_files` to a **PR-based phase-close merge** in mode 3 (open `feat/{FID}`→dev PR at close, merge via gh primary / `merge_pull_request` fallback with explicit skip-token-free commit_message). Design/plan close becomes structurally identical to build/ship close.
3. **#134 closed (not planned)** — branch isolation already shipped; residual is purely the phase-close merge transport, owned here.
4. **D1 surface shrinks but stays relevant** — each phase lands as one squash commit whose subject carries `[skip ci]`; if design/plan close merges via PR, the D1 body-scan guard (§6d) must extend to design/plan close paths, not just ship.

**Net re-scope:** §1 table flip design/plan row; §6e covers all five phases; §6c/§6h dev-tail = PR-based phase-close merge (drop #134 optionality); §6d extend guard to design/plan close.

---

## Comment 3 (PRIMARY SEED) — Updated scope: minimum top-level changes for mode 3

Six changes, in dependency order. Frame: **additive header rules gated on one MODE flag — not a rewrite of call sites.** "Top level" = the `>` blockquote rule-block at the head of each workflow + `cloud-bootstrap.sh` + `rules.md`.

**0. Mode-detection anchor** _(prerequisite, ~free)_ — primitives exist (`cloud-bootstrap.sh:26`). Add one header rule: **Runtime:** set `MODE` once at workflow start. The flag every rule below reads.

**1. Harden gh auth + a loud preflight (§6a)** — `cloud-bootstrap.sh:61-63` does `gh auth login --with-token` from `GH_BKIT_TOKEN` but silent/non-blocking + hits env-precedence bug. Change: prefer sanctioned `GH_TOKEN` env; add a header **gh-preflight** rule that runs `gh auth status` once and records `GH_OK=true|false` (loud). Makes "gh down" a known state (kills D2's trigger).

**2. Global gh→MCP fallback rule + tool map (§6b/6c) — centerpiece** — only gh-outage branch today is `gh-error → abort` (`bkit-build.md:1301`, `bkit-debug.md:1024`); improvised fallback is uncontrolled (produced D1). Change: one additive header rule — _"When GH_OK=false, use the mapped MCP tool; retry with backoff on timeout; request minimal output; the merge fallback MUST pass an explicit skip-token-free commit_message"_ — plus the §6c map as reference. Applies only to gh-covered PR/CI/merge surface; trackers stay on MCP (§6i).

**3. Any-branch adopt-or-mint + FID decoupling (§6e) — the biggest one** — two mode-3 breaks converge: worktrees don't exist on the claude.ai runner (D3, all five phases), and `bkit-auto.md:86-87` hard-rejects non-`feat/` branches then derives `FID="${BRANCH#feat/}"` (session is on `claude/…` → aborts, D4). Change: a header **Branch model** rule — adopt-or-mint: if MODE=3 (or already on a non-`dev` working branch), adopt the current branch and skip `git worktree add` (work in-place); else mint `feat/{FID}` + worktree as today. Plus decouple the FID source from the branch name — derive from the tracker/issue, not `${BRANCH#feat/}` (`bkit-auto.md:86-87`, ship 2.4, `bkit-cloud.yml`).

**4. Phase-close merge via PR instead of local squash-push (D4 + re-scope)** — proxy restricts `git push` to current branch → `git push origin dev` blocked. After #3, mid-phase commits go to the adopted branch; the ONLY blocked op per phase is the Close-Workflow local `git merge --squash` + `git push origin dev` (`bkit-design.md:806`, `bkit-plan.md:792`; ship Steps 9-13 dev push, ship header line 8). Change: in MODE=3, replace the local squash-merge with a **PR-based merge** — open `feat/{FID}`→dev PR at close and merge via the rule-2 path (gh primary / `merge_pull_request` fallback). Makes design/plan close structurally identical to build/ship close. Docs/status tail that can't ride a PR → `push_files`.

**5. `sleep`-less CI wait (D5)** — claude.ai Bash blocks foreground `sleep`; bkit polls with it (`bkit-ship.md:556` + build/debug gates). Change: a header **CI-wait** rule — never foreground-`sleep`; bounded condition/event-driven poll of `gh run list --json status,conclusion`. Localized swap at ~3 sites, governed by one rule.

**Also required (localized, §4, not top-level):** debug egress allowlist + loudness; Playwright report seam → job-logs fallback; hard-coded macOS paths.

**Net / sequencing:** 0–2 cheap & additive, unlock the rest (mode flag → gh preflight flag → mapped fallback). 3 is the real structural lever — scope first. 4–5 fall out of 3. Nothing rewrites phase logic: ~5 header rules gated on MODE + one FID-source change + 3 localized §4 fixes.

**Open items (§8):** fallback mechanism detail (backoff/minimal-output shape), artifact seam (job-logs-only vs one sanctioned `gh api`), dev branch protection + auto-delete-head-branches.
