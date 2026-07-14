# Related Issues

## #341 — Make bkit run in all three runtimes (local / GitHub-Actions / claude.ai) — gh primary + rule-based MCP fallback, any-branch (open)

**Parent / source of the security constraint this design implements (§5a lethal trifecta, §6f mitigation).** Key excerpts:

- **§5a Security — lethal trifecta prompt-injection.** A malicious public issue with hidden instructions can hijack an agent that later reads issues with a broad token into pulling private-repo data and exfiltrating it. Architectural, "no obvious fix." bkit hits all three legs: `issue-scan` reads untrusted issue bodies + comments, holds a broad `GH_BKIT_TOKEN` write PAT, and can act (PR/commit/merge). Not strictly MCP-vs-gh — a gh agent reading the same issue is equally exposed. Mitigation: narrowest-scoped token + treat all tracker/PR/comment content as untrusted; never let it steer git/merge actions.
- **§6f Security constraint (first-class, all modes):** narrowest-scoped token; treat tracker/PR/comment content as untrusted.
- **§6d D1 fix (all paths):** guarantee a skip-token-free merge body and extend the merge scan to the resulting squash body, not just the PR title; consider dropping `[skip ci]` from intermediate status-commit subjects.
- **D1 incident:** `[skip ci]` leaked into a squash-merge body → CI suppressed on `dev`. Chain: gh unauthed → ad-hoc MCP `merge_pull_request` substitution → default concatenated body carried the token.
- **§6i Trackers stay on MCP** (resolved). GitHub MCP server present anyway (fallback needs it); Linear is MCP-only; gh-ifying breaks provider symmetry + rich markdown bodies.

### Comments on #341

**Comment 1 (relationship to #134):** #134 stays open as an independent, mode-agnostic decision about where the design→plan→build→ship artifact trail + `status.json` live. §6h does not force that decision.

**Comment 2 (2026-07-14 — current code already branch-isolates every phase):** §1 table was stale. Per #209 §3 + #234, design and plan now behave like build: mint a worktree + `feat/{FID}` at Step 2 rebased on `origin/dev`; commit `status.jsonl` + docs per-step on `feat/{FID}` with NO mid-lifecycle `dev` push; Close Workflow = local squash-merge to `dev` (`git merge --squash -X ours feat/{FID}` → `docs({FID}): design DONE bkit [skip ci]` → push → delete branch). Net: per-phase ephemeral branch. Consequences: (1) D3 worktree problem is every-phase; (2) the only proxy-blocked git op per phase is the Close-Workflow squash-merge + `git push origin dev`; (3) #134 closed; (4) D1 `[skip ci]`-in-merge-body guard must extend to design/plan close paths too if they ever merge via PR.

**Comment 3 (updated scope — minimum top-level changes for mode 3):** Consolidates §6 into six ordered, additive header-rule changes gated on one `MODE` flag (0 mode-detection anchor; 1 harden gh auth + loud preflight; 2 global gh→MCP fallback rule + tool map [centerpiece]; 3 any-branch adopt-or-mint + FID decoupling [biggest]; 4 phase-close merge via PR instead of local squash-push; 5 sleep-less CI wait). Trackers stay on MCP (§6i). Frame: additive header rules gated on one mode flag — not a rewrite of call sites.

---

_Note for this design (#342):_ #341 is the parent runtime-portability effort. #342's scope is narrower and orthogonal — the untrusted-content **contract** (prose rule + coverage + enforcement) across `rules.md`, workflow headers, and leaf prompts. #342 explicitly cross-references (does not re-track) #341's structural mitigations: narrowest-scoped token (§6f) and the D1 skip-token-free merge-body guard (§6d).
