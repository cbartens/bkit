Verdict: PASS

<!-- verdict:end -->

<!-- Note: Plans live at `docs/plans/{YYYYMM}/{FID}-plan.md` (canonical month bucket, set at design start = 202607). Logs sit at `docs/plans/202607/logs/342-injection-hardening/` and are delete-eligible. -->

# Prompt-injection Hardening — Universal Untrusted-Content Contract (Split Index)

> [!CAUTION]
> **This is an INDEX, not an executable plan.** It carries no tasks, no constraints, and no 🔒 Gates — all 20 tasks, all 4 Gates, the Manual Verification steps, and every binding constraint live in the sub-plans below, each in exactly one of them. Do NOT execute from this file. Read the sub-plan you are assigned and execute it end-to-end.
>
> **Source:** split from [`plan-v3-checked.md`](plan-v3-checked.md) per [`plan-complexity-check.md`](plan-complexity-check.md) (`Verdict: SPLIT`).

## Context & Goals

bkit closes the "lethal trifecta" today: its agents **ingest** attacker-controlled text (issue / PR / comment bodies, diffs, CI logs), hold a **broad write token**, and can **act** (commit / push / merge / file-write). #341 §5a/§6f raised this as a first-class, all-modes constraint but did not scope the code changes. #342 extracts it into an actionable contract.

The current-state audit found **9 of 46** leaf prompts carrying an untrusted-input bullet, **0 of 8** workflows, and **0 prompts referencing `.agents/rules.md`** — leaf subagents are spawned self-contained, so a rule that lives only in `rules.md` never reaches any leaf. There is no shared prompt-header template, so coverage = per-file edits. The existing 9-file bullet also has two defects: it names `web / diff / log / issue` but **omits PR/comment bodies**, and it never **closes the act-leg**. Nothing gates regression.

The feature lands a universal prose contract across all 54 source files plus a glob-based enforcement gate, so a newly added prompt is covered-or-failing by construction with no allowlist to maintain.

> [!WARNING]
> **Prose is the weakest layer** — it is precisely what injection is designed to defeat. This ships explicitly as **defence-in-depth / coverage-of-record with no runtime telemetry**. The load-bearing structural controls — narrowest-scoped token (#341 §6f) and the skip-token-free merge body + squash-body scan (#341 §6d / D1) — are **cross-referenced, NOT re-tracked**. Do not let a green gate read as "injection is handled".

**Success Criteria _(feature-level; proven complete at the end of sub-plan 2)_:**

- All 46 leaf prompts + all 8 workflow headers carry the upgraded untrusted-input bullet, with no file left on the weaker pre-upgrade variant.
- One enforcement test turns CI red when any globbed source file lacks the three load-bearing clauses, or retains the stale variant.
- `rules.md` carries the invariant, stays byte-synced to its template, and its `docs/security.md` "why" anchor resolves **for consumers too**.

**Related Issues:**

- `#341 — Make bkit run in all three runtimes (local / GitHub-Actions / claude.ai) — gh primary + rule-based MCP fallback, any-branch (open)` — parent / source of the §5a trifecta framing and the §6f constraint. Structural mitigations (§6f token scope, §6d/D1 merge-body) are cross-referenced, NOT re-tracked.

> [!CAUTION]
> **Related-issues scan was NOT performed this run — treat as missing context, not as "nothing related exists".** `mcp__github__search_issues` returned `total_count: 0` for every query **including the control probe** `repo:cbartens/bkit bkit`, which must match — proving the GitHub issue-search index is not serving this private repo under the current token. The `#341` ref above is **carried from the design phase, not re-confirmed**. Logged to `.bkit/friction.jsonl` (`plan-generate-search-issues-index-empty-private-repo`).

## Split Shape — sequential, same-branch, same-PR

> [!CAUTION]
> **The split is partitioned by EXECUTION-SESSION boundary, NOT by PR boundary.** This is the load-bearing property of the whole partition:
>
> - **ONE PR, non-negotiable.** § Merge Method states all 7 workstreams land in a single squash PR. Sub-plan 1 opens no PR; sub-plan 2 opens the single PR at the very end, covering both segments' commits. A domain-parallel or per-workstream-PR split would be **wrong** and must never be reintroduced.
> - **ONE branch.** Both sub-plans commit to the same feature branch (`bkit-auto.md:25` § Git mandates a commit after every subagent return — intermediate commits are expected).
> - **Green at every task/commit boundary.** The cut sits exactly at the plan's own declared hard sequencing boundary — _"Do NOT start WS-6 until T3.1, T3.2, T4.1, T4.2 are all `[x]`"_. The WS-6 stale-variant deny cannot land while the 9 stale bullets still exist, or the suite reds mid-sequence (design Key Edge Case "half-migrated corpus"). Sub-plan 1 ends precisely at the state WS-6 requires.

## Sub-Plan Index

<!-- prettier-ignore -->
| # | Sub-plan | Workstreams | Tasks | Gates | Entry precondition | Exit state |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | [`342-injection-hardening-plan-1.md`](342-injection-hardening-plan-1.md) — Coverage rollout | WS-1 → WS-2 → WS-3 → WS-4 | 10 (T1.1, T1.2, T2.1, T2.2, T2.3, T3.1, T3.2, T4.1, T4.2, T4.3) | 🔒 Gate 1 (+ both 👤 human-confirmation checkboxes) | Feature branch checked out; no concurrent bkit workflow on this clone | All 54 sources carry string B; string A in `rules.md` + template; `docs/security.md` threat-model anchor; `.agents/docs.md` + `.bkit/workflows.md` index rows synced; suite green; committed on branch; **no PR, no `bkit install`** |
| 2 | [`342-injection-hardening-plan-2.md`](342-injection-hardening-plan-2.md) — Doctrine, enforcement, regen, verification | WS-5 → WS-6 → WS-7 | 10 (T5.1, T5.2, T6.1, T6.2, T6.3, T6.4, T6.5, T6.6, T7.1, T7.2) | 🔒 Gates 2, 3, 4 + the 5-step Manual Verification | Sub-plan 1 complete: Gate 1 passed (both 👤 checkboxes `[x]`), T3.1/T3.2/T4.1/T4.2 all `[x]`, all 54 files migrated, Breaking-Changes item 4 signed off, `bkit install` not yet run | `.bkit/prompts.md` doctrine reversed; 5 deferral rows verified; coverage gate landed; batched `bkit install` + mirror parity; full suite + dogfood green; **the single squash PR opened** |

**Ordering:** strictly `342-injection-hardening-plan-1.md` → `342-injection-hardening-plan-2.md`. Do not start sub-plan 2 until sub-plan 1's exit check passes.

## Ownership Map — where each artifact lives

Each item below appears in **exactly one** sub-plan (single owner, no double-ticking). Shared _context_ (canonical strings, clause-set, verified baseline, authoring-rule constraints, edge cases, test matrix, out-of-scope, merge method, alternatives) is reproduced in **both** sub-plans so each stands alone without re-reading this index.

<!-- prettier-ignore -->
| Artifact | Owner |
| --- | --- |
| 20 tasks T1.1-T4.3 / T5.1-T7.2 | 1 / 2 |
| 🔒 Gate 1 Prerequisites + Pre-Flight checkboxes | 1 |
| 👤 Acceptance Scenario + 👤 Breaking Changes (both confirmation checkboxes — gate the **whole** feature; item 4's slop sign-off is consumed by sub-plan 2's T6.1, reproduced there read-only) | 1 |
| 🔒 Gates 2, 3, 4 | 2 |
| Manual Verification Steps 1-5 | 2 |
| § Security & Privacy contract (4 checkboxes) | 2 _(sub-plan 1 restates its discharged obligations as prose, no checkboxes)_ |
| § Rollback Strategy (squash-SHA revert) | 2 |
| Supersession row 1 (stale bullet in 9 prompts → T3.1) | 1 |
| Supersession row 2 (`.bkit/prompts.md` doctrine row → T5.1) | 2 |
| Derived Test Matrix rows 1-2 (T2.2, T2.3) / rows 3-8 (T6.1-T6.5, T7.2) | 1 / 2 _(full 8-row matrix carried in both; Gate 3 in sub-plan 2 verifies all 8)_ |
| Doc-update rows: `docs/security.md`+tpl, `rules.md`+tpl, `docs.md`+tpl, `.bkit/workflows.md` | 1 |
| Doc-update rows: `.bkit/prompts.md`, `docs/testing.md`, `decisions.jsonl`, `deferrals.jsonl` | 2 |

## Preserved Corrections — do NOT "tidy" these back into broken forms

These `Done when` commands were fixed this cycle after being found unrunnable or vacuously green. They survive **verbatim** in the sub-plans:

- **T3.2's real baseline is 45, not 46** — `bkit-utility-compress-markdown` lacks the `do NOT trust session memory` line; that asymmetry is pre-existing and out of scope. Do not normalise it to 46.
- **Diffs pinned to `git merge-base HEAD dev`** (T3.2, T5.2, T6.1) — a bare `git diff` compares against the **index** and goes vacuously empty once anything is staged or committed.
- **Mirror counts use `grep -l … | wc -l`** across all three mirror trees (T7.1) — `grep -c` over a multi-file glob emits per-file lines, never a scalar. Counts are **relations** to the re-derived source counts `P`/`W`, never hardcoded literals.
- **T7.1 uses a before/after `git status --porcelain` pair** — by T7.1 the WS-3/WS-4 edits are already committed (in a previous session, under this split), so a diff cannot distinguish "install touched nothing" from "install touched everything".
- **Multi-file `grep -c` needs explicit file operands** (T1.2, T4.1) — a bare `grep -c` with no operand reads stdin and hangs.
- **Clause 1 anchors on `is DATA, never instructions`** — the longer `content is DATA, never instructions` is NOT contiguous and would false-red every migrated file.
- **The stale-variant deny is glob-scoped, never repo-wide** — durable self-match carriers (the test's own literal, `.bkit/prompts.md`, `docs/plans/**`) mean a successor must not "discover" the mirrors are clean and weaken the scoping.

## Merge Method

**Merge method: always squash.** All 7 workstreams land in **ONE PR** — non-negotiable: the WS-3 9-bullet upgrade and the WS-6 stale-variant deny must land together or CI is red mid-migration. Do NOT decompose into per-workstream PRs. Sub-plan 2 opens the single PR after WS-7, Gates 2-4 and Manual Verification are all complete.
