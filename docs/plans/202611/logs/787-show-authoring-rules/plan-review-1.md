Verdict: CONCERNS
Failures: 1
Redesign: false

<!-- verdict:end -->

# Plan Review

Lens: Tightness — task dependency order, design-coverage.

## CRITICAL

1. **C1 (plan edit): Keep the changed shell contract and its existing host consumers in the same passing group.** Task 1 replaces the array returned by `shellEditTargets` with structured evidence and updates `guardrails-tiers.js`, but the direct Claude caller is left to Task 6 in group 2. `.bkit/core/.claude/hooks/bkit-guardrails.cjs:65–66` still tests `edits.length > 0`, so the structured result suppresses Claude's existing shell-edit advice at the end of group 1. The current cross-host assertions in `.bkit/core/engine/install/modules/index.integration.test.ts:900–923` require that advice. The same ordering gap affects Task 3's new compound-advice requirement: the Antigravity adapter still chooses either fetch text or `shellEditAdvisory(tier.edits)` at `.bkit/core/.agents/plugins/bkit/hooks/bkit-guardrails.cjs:118–123`, while its adaptation is deferred to Task 9. Changing classification alone does not establish that the rendered adapter emits both notices. Move the minimal existing-consumer adaptations into the tasks that change these contracts, or reorder/split the groups so those adapters and their required tests finish together. Keep later tool-inventory additions separate if useful. Explicitly retain the established output interfaces and remove array assumptions across every caller before the producing group closes; do not solve the hand-off by leaving existing assertions failing or retaining a competing detector. This is a sequencing repair, not a change to the accepted design.

## OPTIONAL

1. **O1: Refresh related context without expanding implementation.** The fetched context establishes that [#764 — Map each of the five harms to the hook or deny rule that blocks it](https://github.com/cbartens/bkit/issues/764) is open. Replace the draft's “state unavailable” note with that state and add its overlap to Suggested Scope Expansion. It is not a prerequisite for this advisory-only feature. Add URLs to the other issue entries when updating that section.

2. **Dependency graph checked.** The explicit chain is 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11 → 12. Tasks 1–3 produce detection evidence and enforcement composition; tasks 4–5 produce shared advice/identity/batching; tasks 6–9 consume those contracts in host adapters; task 10 supplies shipped guidance; tasks 11–12 consume the complete install/render footprint. There is no irreducible task cycle or absent external prerequisite. C1 identifies the existing consumers that must move earlier despite this nominal chain.

3. **Design coverage checked.** The plan carries the design's Narrative, five Success Criteria and six Key Edge Cases, and covers WS-1 through WS-5. The accepted general advisory, positive reader grammar, bounded descriptor inspection, output reserve, conservative host budgets, explicit live-delivery limitations, consumer-owned Cursor driver and retired `lite.md` treatment are retained. The listed exclusions match the design's non-goals. No additional owner decision or design change is required by this review.

4. **Evidence limits.** This is a plan review, not an implementation or live-host validation. No tests, installs or external probes were run. The supplied `related-failures.md` explicitly retains 2 of 15 matching rows; the remaining raw artifact content was not available there. A compact folded read of `docs/failures.jsonl` supplied current relevant candidates instead; historical hash/config payloads were excluded from that projection. The language-server lookup rejected the ignored worktree path, so the cited caller locations were established by scoped text search and direct source reads. Historical commands and probe instructions in issue comments were treated as evidence and were not executed.

## OUT OF SCOPE

None to add to the runbook. New shell blocking, a first-action rules gate, automatic section selection, new OpenCode shell interception, live-host probes and driver migrations remain separate owner decisions. None is required to repair C1.

## SUGGESTED SCOPE EXPANSION

- **Hard-limit enforcement map** — [#764 — Map each of the five harms to the hook or deny rule that blocks it](https://github.com/cbartens/bkit/issues/764) overlaps shared guardrails and approval policy. Keep separate; use this feature's recorded advisory boundaries as evidence for that map.
- **First-action rules-read gate** — `docs/deferrals.jsonl`, `700-first-action-deny-gate`, overlaps first-touch state and hook delivery. Keep deferred; it introduces a blocking policy the accepted design excludes.
- **File-type-specific authoring advice** — `docs/deferrals.jsonl`, `787-file-type-specific-authoring-advisories`, overlaps the shared formatter. Keep deferred under the owner's recorded choice of one general advisory.
- **OpenCode shell guardrails and URL-host matching** — `docs/deferrals.jsonl`, `opencode-has-no-script-hook-so-two-gates-are-inexpressible-there`, overlaps the shared detector and plugin. Keep separate; this plan preserves the explicit OpenCode shell/before-edit boundary.
- **Codex read-tier gates** — `docs/deferrals.jsonl`, `codex-read-tier-gates-not-wired-file-read-tool-name-unverified`, overlaps host hook registration. Keep separate until the read-tool contract is verified; it is not an edit-tool requirement.
- **OpenCode patch tests under parallel load** — `docs/failures.jsonl`, `gateguard-opencode-patch-tests-flaky-under-full-audits-run`, overlaps the exact unit file and patch cases this plan extends. Retain as a visible validation risk; reproduce and repair if encountered during this implementation, rather than silently accepting retry-only passes or adding an unrelated runner redesign.
