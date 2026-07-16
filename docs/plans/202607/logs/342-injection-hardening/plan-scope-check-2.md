Verdict: CONCERNS
Failures: 3

<!-- verdict:end -->

# Plan Scope Check

Lens: Scope, criteria, verification audit.

## CRITICAL

1. **T1.2 `Done when` ships an unrunnable `grep -c` command — no file argument.** Line 468: `` `grep -c '| \`docs/security.md\` |'`returns 1 for each) ``. As literally written this `grep -c` has NO target file(s) supplied — it would read stdin and hang, never returning a count against `.agents/docs.md` / `.bkit/templates/.agents/docs.md` as the surrounding prose claims ("per file"). This is the exact "verify commands rather than eyeballing them" defect class the design/build phases already fixed once (see the sibling correct forms at T1.1 line 465 and T2.1 line 473, both of which correctly pass two explicit file paths to `grep -c` and correctly describe the resulting per-file output). Fix: `grep -c '| \`docs/security.md\` |' .agents/docs.md .bkit/templates/.agents/docs.md` returns 1 for each.

2. **T4.1 `Done when` has the same defect — `grep -c` with no target files.** Line 493: `` `grep -c 'Flag injection attempts in output'` returns 1 per file ``. No file/glob is supplied, so the command cannot be run as stated against the 6 phase workflows it's meant to check. Fix: name the 6 files explicitly (or note it must be run once per file in a loop, matching the "check with `grep -n`" pattern already used earlier in the same bullet).

3. **T4.2's own `Done when` requires an artifact that does not exist until 3 workstreams later, contradicting the runbook's own Step-Isolation rule.** T4.2 (WS-4) closing criteria include: "the bullet renders as a **list item** (verify the rendered `.claude/commands/bkit-worktree-{prune,sync}.md` **after T7.1**, not just the source)" (line 505). But the runbook header mandates: _"Step Isolation: Do NOT jump ahead. Complete each task fully (including its verification and checking its box) before starting the exact next task."_ T7.1 (mirror regen) is in WS-7, gated `Requires: WS-2..WS-6` and explicitly "MUST be last." An executing agent following Step Isolation literally cannot check T4.2's box until T7.1 has run — yet T7.1 cannot start until WS-3 through WS-6 (including T4.2 itself) are done. This is an unresolvable ordering deadlock as written, not merely a style nit: either (a) split T4.2's Done-when into an immediately-checkable subset (byte content + blank-`>`-line shape) plus a separate, explicitly-deferred rendered-mirror confirmation folded into T7.2's verification (Test Matrix row 8 / cross-provider parity already covers rendered output), or (b) add an explicit Step-Isolation carve-out note on T4.2 itself. As written, a literal-minded executing agent has no valid path to close T4.2 on schedule.

## OPTIONAL

1. **Markdown inline-code formatting glitches around several `Done when` lines** (missing space after a closing backtick before the following word) — e.g. line 468 `` `docs/security.md`|'`returns 1 for each) ``, and elsewhere on the same lines: `` bkit:start`→`bkit:end` ``, `` `pnpm bkit check`exits 0 ``, `` 0;`pnpm format:check`+`pnpm lint:prose` ``. Purely cosmetic (prettier/Vale will likely just complain or silently tolerate it), but worth a cleanup pass alongside fixing CRITICAL #1/#2 above since they're on the same lines.
2. Consider explicitly cross-linking T4.2's deferred-render check to T7.2 / Manual Verification Step 4 (which already re-verifies rendered output post-regen) once CRITICAL #3 is resolved, so the "after T7.1" language has a concrete landing spot rather than dangling inside T4.2's own criteria.

## OUT OF SCOPE

None identified. The plan's own boundary discipline holds up well on inspection:

- Structural mitigations owned by #341 (narrowest-scoped token §6f; skip-token-free merge-body/squash-body scan §6d/D1; push-restricted-to-current-branch) are consistently named only as doc-content to _describe_ ("deferred, not dropped") in `docs/security.md`'s new section (T1.1) and never surface as an implementation task anywhere in the Runbook, Architecture, or Data Schema sections — correctly cross-referenced, not re-tracked.
- Two genuine scope-adjacent items surfaced during design/plan generation were correctly routed to `docs/deferrals.jsonl` rather than absorbed into the Runbook (`untrusted-input-bullet-render-time-partial-expansion`, `create-security-github-label-for-injection-hardening`), and T5.2 correctly treats them as verify-only, not re-append.
- The 3 hand-authored `.claude/agents/utility-*.md` files (no `.bkit/prompts/` source, unreachable by the glob) are explicitly carved out of Success Criterion 5's "covered-or-failing by construction" claim and their potential inclusion in the threat model is deferred to a follow-up issue rather than silently expanding #342's glob — correct scope discipline, nothing further to add here.
- `.bkit/workflows.md`'s pre-existing "five workflow files" drift (for the _other_ 16 invariant rows) is correctly identified and explicitly deferred rather than folded into this already-54-file PR.
