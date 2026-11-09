## #55 — Design organise workflow step prompts (closed)

<!-- linear-import: BAR-143 -->
**Linear:** [BAR-143](https://linear.app/bartens/issue/BAR-143) · **Created:** 2026-05-06 · **Linear assignee:** christian@bartens.biz

---

## Problem

The design docs the current `bkit-design` workflow produces don't comment on how to best organise the work. There's no guidance on how the design should be broken down for execution, so the leap from a single design doc to multiple plans is unstructured.

## Proposal

Add a new step to the design workflow — **Design Organise** (`design-organise`) — that runs as a **separate new step after design review**. It:

* Reviews the produced design doc (input: `{FID}/design-v2-reviewed.md`).
* Suggests grouping of the work into sub-steps, decided on logical grounds (domain boundaries, organisational structure, chronological dependencies) rather than token/context-window sizing. **Granularity follows the logical seams wherever they fall** — no target sub-step count.
* **Annotates dependencies between sub-steps** as a required part of the decomposition (not an optional extra). Without dependency annotations, sub-steps cannot be safely turned into plans — `bkit-plan` needs to know what each sub-step assumes already exists, what it blocks, and the order in which sub-plans should be executed.
* If the only honest decomposition has circular dependencies, **flag for human review** rather than auto-merging or silently producing a non-DAG.
* Outputs a new doc (versioning per current process): `{FID}/design-v3-organised.md`.

## Downstream usage

Each suggested sub-step becomes a candidate individual plan, which is then run through the existing `bkit-plan` process. The dependency annotations drive the order plans are produced and executed, and feed `blockedBy` / `blocks` relations between the resulting plans/issues. This gives a clean handoff from design → multiple plans, instead of one monolithic plan or ad-hoc splitting.

## Decisions

* **Name:** `design-organise` ("Design Organise").
* **Position in workflow:** Step 7 — separate new step after Apply Review (Step 6), before Summary (Step 8). Close Workflow renumbered to Step 9.
* **Input:** `{FID}/design-v2-reviewed.md`.
* **Output:** `{FID}/design-v3-organised.md`.
* **Granularity:** follow logical seams, no target count.
* **Cycles:** flag for human review.
* **Dependency annotation:** required part of the decomposition.
* **Agent:** single agent (`bkit-design-organise`) — no parallel pair. Decomposition is constrained by the design doc content; diversity of exploration adds no value here (unlike brainstorm). Depth of reasoning about DAG structure is what matters.
* **Effort:** `high` (Opus 4.7) — downstream stakes are real; bad decomposition or missed dependency edges corrupt plan ordering for everything that follows.
* **Output schema:** both inline `dependsOn` per sub-step block AND a separate `## Dependency Graph` summary table at the end. Inline keeps each block self-contained; graph section lets the orchestrator/human see the full DAG at a glance and detect cycles without reading every block.

## Open questions (resolved)

* **Schema:** inline `dependsOn` per sub-step + separate `## Dependency Graph` table. ✅
* **Single vs parallel agents:** single agent, `high` effort (Opus 4.7). ✅

<!-- linear-links-start -->
**Links:**

- **Related:** [BAR-102](https://linear.app/bartens/issue/BAR-102) _(not imported)_, #53 ([BAR-141](https://linear.app/bartens/issue/BAR-141))
<!-- linear-links-end -->

<!-- linear-comment: 964f647c-294c-4032-af41-23ab0ee91d02 -->
**@christian (Linear, 2026-05-08):**

[https://github.com/cbartens/bkit/commit/3bb2a5cfea3b59ce05d0641f38147ab46dda26c3](<https://github.com/cbartens/bkit/commit/3bb2a5cfea3b59ce05d0641f38147ab46dda26c3>)

<!-- linear-comment: 90a07881-ec1f-46f9-ae41-fe68fceb732f -->
**@christian (Linear, 2026-05-08):**

## Workstream sub-issue spec — locked design

Follow-up from session 2026-05-08. Captures the contract for translating `bkit-design-organise` workstreams into Linear sub-issues consumed by `/bkit-plan` and gated in `/bkit-build`.

### 1. Spawn step in `/bkit-design` (new Step 9)

Inserted between Summary (current Step 8) and Close Workflow (renumbered to Step 10). Runs only when `SUMMARY_VERDICT` ∈ {PASS, CONCERNS}.

For each `### WS-{N}: {NAME}` block in `design-v3-organised.md`:

- Title: `WS-{N}: {NAME}`
- `parentId`: design issue id
- Body template:

```
**Parent design:** docs/plans/drafts/{PARENT_FID}-design.md ({PARENT_ISSUE_ID})
**Workstream:** WS-{N} — {NAME}
**Requires:** WS-X, WS-Y   (or None)

## Scope
{scope}

## Rationale
{rationale}
```

After all sub-issues resolved, second pass sets `blockedBy` Linear edges from each child's `Requires` list (translating `WS-X` to the actual sub-issue ID). `save_issue.blockedBy` is append-only per Linear MCP spec — idempotent on re-run.

### 2. Idempotency / stale handling

- List children via `list_issues({ parentId: PARENT_ISSUE_ID })`.
- New workstream (no matching child) → create sub-issue with body template above.
- Existing workstream still in design v{N} → leave body as-is, post a comment with latest scope/rationale/requires from this version.
- Orphaned workstream (was in past design, removed in current) → leave body as-is, post a comment noting it is no longer in design v{N}.
- Human can unlink a sub-issue from parent. Once unlinked, AI no longer considers it.

### 3. `/bkit-plan` changes

- Step 1: parse `**Parent design:**` from issue description → set `PARENT_FID`. Absent → `PARENT_FID = FID` (preserves single-issue legacy flow).
- Step 2 step 4: read `docs/plans/drafts/{PARENT_FID}-design.md` (was `{FID}`). Fail loud if missing in worktree after rebase.

### 4. `bkit-plan-generate.md` contract

Add to Contract block:

> If input includes `**Workstream:**` directive, plan covers ONLY that workstream's scope unless stated otherwise. Treat parent design as context, not backlog. Surface `**Requires:**` at top of plan.

### 5. `/bkit-build` Requires gate

Already present at Step 1.6 (`relations.blocked_by` non-Done → Failure Path). Fix: pass `includeRelations: true` on the `get_issue` call so the field is actually populated.

### Notes

- No new prompt file — orchestrator-only step using Linear MCP tools (same shape as close-workflow's existing `save_issue` writes).
- No `WS_ID` parameter, no Linear labels, no parent-shape detection. The sub-issue body's two markdown markers (`Parent design:`, `Workstream:`) carry everything.
- Even single-workstream designs spawn one sub-issue — design and plan never share an FID.
- `save_issue.blockedBy` MCP support confirmed via tool schema — append-only semantics make the second pass safe to re-run.
- Title format: `WS-{N}: {Name}` (no parent FID prefix; Linear UI shows the parent link).

<!-- linear-comment: f2c1a956-981c-451f-ad28-7b186985fb09 -->
**@christian (Linear, 2026-05-07):**

## Real-world output assessment — design-organise on BAR-102

Compared the original single plan `docs/plans/drafts/bar-102-digital-agent-mvp-plan-1.md` (44 KB, comprehensive scope) against the four workstream plans produced via the design-organise workflow:

- `bar-102-1-ext-provision-plan.md` (61 KB)
- `bar-102-2-bootstrap-plan.md` (73 KB)
- `bar-102-3-db-schema-plan.md` (74 KB)
- `bar-102-4-vercel-ci-plan.md` (58 KB)

### Verdict

The four plans collectively cover **~70–75%** of plan-1's scope. They are **deeper per task** but **narrower in coverage** — ~270 KB across four plans vs 44 KB in plan-1, yet plan-1 still owns items the four don't.

### Coverage map

<!-- prettier-ignore -->
| Plan | Owns from plan-1 |
| --- | --- |
| WS-1 ext-provision | Operator inputs (Vercel/Supabase×2/Upstash/Resend/Tavily/Places/Firecrawl/OpenRouter), **Spike S6**, root `.env.example`, `docs/setup.md` |
| WS-2 bootstrap | **Spike S1**, Tasks 1.9–1.18 (skeleton + 7 packages + apps/web), 1.19, 1.21, 1.22, 1.28–1.29, 1.31 |
| WS-3 db-schema | **Spikes S3, S7**, Tasks 1.22 (dup), 1.23, 1.24, 1.27, 1.30 |
| WS-4 vercel-ci | **Spike S8**, Tasks 1.19 (dup), 1.20 (as runbook only), 1.21 (DELETE+REWRITE), 1.25, 1.26 |

### Gaps (no owner in any of the four plans)

- **Spike S2** — useChat + streamText + OpenRouter round-trip on Next.js 16 webpack. WS-2 defers to non-existent "WS-5".
- **Spike S4** — Firecrawl whole-site dry run + robots.txt. WS-2 defers to non-existent "WS-8".
- **Spike S5 (partial)** — WS-1 verifies keys with single curl each; the plan-1 end-to-end probe (Tavily AU ≥5 results, Places searchNearby Hervey Bay 25km lodging ≥10, Place Details with field mask, saved JSON) deferred to non-existent "WS-10".
- **`scripts/ci/secrets-sync.sh`** as a written artifact — WS-4 implements env sync as inline `vercel env add` runbook only.
- **`packages/validators/{chat,partner}.ts`** skeletons — WS-2 defers to non-existent "WS-5"/"WS-9".
- **`apps/web` runtime deps** (`@next/mdx`, `gray-matter`, `unified`, `remark-parse`, `@ai-sdk/react`, `ai`, `@openrouter/ai-sdk-provider`, `@react-email/components`, `resend`, `@firecrawl/firecrawl-js`) — deferred to phantom WS-5/6/7/8/11.
- **Pre-seeded "authoritative correction" demo chunk** — WS-3 ships as test fixture, not as remote-DB demo seed.
- **Some plan-1 DE entries** — `web_search` server tool, blocking SDK over webhook, MDX over Payload, deferral list (Inngest/apps-run/packages-api/next-intl) — no explicit owner.

### Duplication (double-writes)

- **`supabase/config.toml`** — WS-2 T13 + WS-3 Task 2 both author with same adaptations.
- **`scripts/ci/check-name-leakage.sh`** + test — WS-2 T14 + WS-4 Tasks 1/2.
- **`.github/workflows/{ci,smoke,bkit}.yml`** — WS-2 T14b authors; WS-4 then DELETE+REWRITEs ci.yml and re-authors smoke/bkit.
- **DE numbering** — all four plans append DE-{N+1..} starting from `max(grep)+1` independently → numbers will collide on merge.
- **Stale dependency mapping** — WS-2 line 166 says "S6 → WS-11", but WS-1 is the actual owner.

### Workflow-level lessons for design-organise

1. **Phantom downstream references.** WS-2's mapping table cites WS-5/6/7/8/9/10/11 as deferral targets, but design-organise emitted only four workstreams. The agent deferred items to plans that don't exist. **Fix:** require the organise step to validate that every `dependsOn` / "deferred to WS-N" reference resolves to an actual sub-step block in the same output document. Cycles already trigger human review per the spec — dangling forward references should too.
2. **No coverage check against the source design.** The agent decomposed the design into four logical workstreams without checking that the union of sub-step scopes equals the design scope. **Fix:** after decomposition, the organise agent should produce an explicit "what's NOT covered" section, or run a coverage-completeness pass (every requirement in the design appears in exactly one sub-step).
3. **No deduplication pass.** Three artifacts (`config.toml`, `check-name-leakage.sh`, GitHub workflows) are authored by two plans each. **Fix:** the organise step should produce a single "artifact ownership table" — one file → one owning sub-step. Currently the workflow specs both inline `dependsOn` and a `## Dependency Graph` table, but no artifact-ownership table.
4. **Cross-cutting numbering collisions.** Each sub-step plan independently numbers its DE entries from `max(grep)+1`, so on merge they collide. **Fix:** organise step should reserve DE-number ranges per sub-step (WS-1: DE-1..9, WS-2: DE-10..19, etc.) and write that into each sub-step block.
5. **Per-task depth ≠ per-feature completeness.** The four plans are 1.4–1.7× larger per slice than plan-1's coverage of the same slice — but together they're narrower. **Fix:** the organise step's success criterion should be "decomposition preserves total scope," not "each sub-step is well-scoped."

### Recommendation

For BAR-102 specifically: either expand WS-2 to absorb the deferred items (S2/S4/S5 spikes, `secrets-sync.sh` script, validator skeletons, full apps/web deps list) or add a fifth workstream plan that owns them. Resolve the three double-writes by picking single owners. Reserve DE-number ranges across the four plans before they go to bkit-plan.

For design-organise itself: items 1–5 above are direct, testable additions to the agent's output contract.

<!-- linear-comment: 8154fdfe-5518-4b63-9e78-7f11e54095f8 -->
**@christian (Linear, 2026-05-06):**

## First-use feedback — `bkit-design-organise` against BAR-102

Reviewed `docs/plans/drafts/bar-102-digital-agent-mvp-design.md` against the new `.claude/agents/bkit-design-organise.md` prompt. Notes for posterity / future iterations.

### What the new prompt fixes

BAR-102 was planned with the old pipeline:

1. `bkit-plan-generate` → one chronological plan (74 tasks).
2. `bkit-plan-complexity-split` → 5 sub-plans, partition driven by a ≤100K-token budget (its step 4: `Target sub-plan count = ceil(total / 100K)`).

That's *size-driven* splitting. The new `bkit-design-organise` is *logic-driven* — its step 5 explicitly forbids token/context-window size as a factor and partitions on logical seams (domain, organisational, chronological). Different shape, different boundaries.

### Concrete evidence from BAR-102 sub-plan 1

Sub-plan 1 ("Bootstrap") timed out repeatedly during execution. Re-reading it through the workstream lens, it bundles what `bkit-design-organise` would have surfaced as **at least 4–6 separate workstreams**:

- WS-A: Repo scaffold + selective copy + `@visitfrasercoast/*` sed-rename (7 packages + tooling)
- WS-B: Supabase project + `public` schema migration + `match_chunks` RPC + RLS
- WS-C: Vercel project + CI workflows + `check-name-leakage.sh`
- WS-D: External-service provisioning gate (Vercel/Supabase ×2/Upstash/Resend/Tavily/Google Places/Firecrawl) — including 24–48h Resend DNS wait
- WS-E: Spike S1–S8 execution and reporting
- WS-F: Nine doc-stub population

31 tasks across 6 logical units, plus a hard inter-human DNS gate inside the same sub-plan. The complexity-check log even flagged "7 distinct domain axes" but split on tokens anyway, because that's the tool's mandate. Sub-plans 3 and 5 show similar (smaller) over-bundling; SP2 and SP4 happen to map cleanly to single workstreams.

### Identified gap in the new flow

The prompt stops at decomposition (line 78: `STOP after decomposing design and producing output`). It does not orchestrate `bkit-plan-generate` per workstream, so a future operator could read the workstream graph and still hand the whole design to `bkit-plan-generate` once — landing back in the same single-big-plan trap.

Suggested follow-up (separate issue?): a thin orchestrator skill or doc note that ties `bkit-design-organise` → loop over `WS-{N}` → `bkit-plan-generate` so the workstream-per-plan flow is the default rather than a manual discipline.

### Decision applied to BAR-102 going forward

- SP1 is sunk cost — not re-doing it.
- SP2–SP5 (pending) will be re-organised against workstreams via `bkit-design-organise` before further plan generation. Likely outcome: SP2/SP4 stay; SP3 splits ~2 (ingest vs content+toggle); SP5 splits ~2 (summary email vs deploy/release). Per-workstream plans should be small enough to skip `bkit-plan-complexity-split` entirely.

<!-- linear-comment: de0c9658-f214-4f6b-8942-180ea2811235 -->
**@christian (Linear, 2026-05-06):**

## Implemented — [42e93b3](https://github.com/cbartens/bkit/commit/42e93b3)

### What shipped

New **Step 7 — Design Organise** in `/bkit-design` (Summary → Step 8, Close Workflow → Step 9):

- `bkit-design-organise` subagent (`high` effort, Opus 4.7) reads `design-v2-reviewed.md`, strips its existing verdict header, appends `## Design Workstreams` (WS-N ids with `Requires` dependencies), self-verifies coverage + DAG integrity, writes `design-v3-organised.md`
- Summary and Close Workflow pick up v3 automatically via `sort -V | tail -1`

### Refinements during implementation

- **Single agent, not parallel pair** — decomposition is constrained by the design doc; depth not breadth is what matters here
- **`Requires` not `dependsOn`** — cleaner field name
- **Workstreams (WS-N) not sub-steps/sections** — better reflects the concept
- **Verdict stripping** — copies v2 body only (strips existing verdict header via `awk`) before prepending fresh verdict, avoiding double verdict blocks
- **Self-verify** — modelled on `bkit-plan-complexity-split`: extracts all major design elements, confirms every element lands in at least one workstream, validates all `Requires` IDs exist, checks for cycles; max 2 fix iterations before `FAIL`
- **No dependency graph table** — removed; `Requires` inline per workstream is sufficient

### Cross-cutting fixes (same commit)

- `Produce **Create** outputs` → singular across 7 prompts
- `replace Verdict \`PENDING\` via \`Edit\`; mapping:` → `set Verdict via \`Edit\`; mapping:` across all 22 prompts — removes PENDING assumption, handles mid-process verdict sets (e.g. cycle detection in step 9)

<!-- linear-comment: 53dc5bc9-b669-405f-beac-af73d194f43b -->
**@christian (Linear, 2026-05-06):**

Schema for the sub-steps section in `design-v3-organised.md` — must include sub-step id, scope, and explicit `dependsOn` references to other sub-step ids. Decide inline-per-sub-step vs. separate graph section vs. both.

\>>> yes needs step IDs, high level scope, depends on but otherwise keep open same as design brainstorm just provide guidance on how to approach, also needs parallel subagents followed by design update step similar to plan scope check followed by split step

Confirm this stays purely logical — explicitly *not* driven by context/token budgeting (that's `bkit-plan-complexity-check`'s job downstream).

\>>> confirmed
