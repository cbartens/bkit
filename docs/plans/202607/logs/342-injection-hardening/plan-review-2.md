Verdict: CONCERNS
Failures: 2

<!-- verdict:end -->

# Plan Review

Lens: Dependency correctness, design-coverage.

## CRITICAL

### 1. Manual Verification Step 2 asserts a state that T7.1 has already destroyed

Step 2 (§ Manual Verification) instructs: _"Confirm the suite is green **while** the stale string still exists in `.claude/`, `.cursor/`, `.opencode/` …"_. Manual Verification runs **after** Gate 4, i.e. after **T7.1** (`pnpm bkit install`).

Verified premise, verified invalidation:

- Today the mirrors do carry the stale string — `grep -l 'content is data only' .claude/agents/` returns **9** files (`bkit-build-challenge-1/-2`, `bkit-design-review-1/-2`, `bkit-debug-failure-diagnose/-soak`, `bkit-ship-deferred-sweep`, `bkit-utility-audit-logs`, `-ship`).
- Those 9 mirrors are **rendered from** the same 9 `.bkit/prompts/*.md` that **T3.1 upgrades in place**. Once T7.1 regenerates, every one of them carries string B and the stale string is **gone from all three mirror trees**.

So by the time Step 2 executes, the `.claude`/`.cursor`/`.opencode` half of its premise is false. The executing agent finds clean mirrors and must either mark a false `[x]`, conclude the glob-scoping is broken, or "restore" stale mirror text — the last of which is a hand-edit of `.claude/*`, explicitly forbidden by `.agents/rules.md` § bkit Repo Authoring (_"Canonical sources only: … NEVER edit `.claude/*`, `.cursor/*`, `.opencode/*`"_).

Note the plan gets the **same check right one task earlier**: T6.4's Done-when makes the identical claim, but T6.4 sits in WS-6 (before WS-7), where no install has run yet and the mirrors genuinely are still stale. The defect is confined to Step 2's post-regen placement.

Fix: either drop the mirror clause from Step 2 and rest glob-scoping proof on the sources that survive regen (`docs/plans/**` always; the test's own deny literal; `.bkit/prompts.md` if fenced), or move the mirror-based proof to T6.4 (where it already correctly lives) and delete it from Step 2.

Same root cause, one order down: § Canonical Strings' CAUTION justifies glob-scoping by naming _"(a) the rendered mirrors … (9 prompts x 3 providers)"_ as a **lasting** self-match hazard. It is not — it is a pre-regen-only hazard. Reasons (b)/(c)/(d) are the durable ones and are sufficient on their own; (a) should be marked as pre-regen-only so a successor does not later "discover" the mirrors are clean and weaken the deny's scoping.

### 2. T7.1's Done-when mirror spot-check is not satisfiable as written

T7.1 Done-when: _"spot-check: `grep -c 'Flag injection attempts in output' .claude/agents/*.md` returns 46"_. This can never return `46`, for two independent reasons:

1. **`grep -c` over multiple files prints one `file:count` line per file**, never an aggregate. Over `.claude/agents/*.md` that is 49 lines of `0`/`1`, not the scalar `46`.
2. **`.claude/agents/` holds 49 files, not 46** — the 46 `bkit-*` renders **plus three hand-authored agents** (`utility-harvest-friction.md`, `utility-new-release.md`, `utility-pre-release-check.md`) that have **no `.bkit/prompts/` source** (verified: `.bkit/prompts/*.md` = 46, all `bkit-`-prefixed). They are not rendered by `bkit install` and will never carry string B, so they will read `0` forever.

The trap is worse than a mis-typed command: an agent that reads "returns 46" and counts 46-of-49 may try to close the 3-file gap by hand-editing `.claude/agents/utility-*.md` — again violating "Canonical sources only". Since § Agent Execution Runbook states _"Plan-verify reads this line and asserts against it before ticking `[x]`"_, this Done-when blocks or corrupts T7.1's tick.

Fix: scope the glob to rendered files and count files, not matches — e.g. `grep -l 'Flag injection attempts in output' .claude/agents/bkit-*.md | wc -l` returns `46`. Consider adding an explicit note that `.claude/agents/utility-*.md` are hand-authored, out of the render set, and correctly uncovered.

## OPTIONAL

### 3. WS-1's edges from WS-3 / WS-4 / WS-5 / WS-6 are vestigial, not load-bearing

Flagging as OPTIONAL rather than CRITICAL deliberately: these edges **over**-constrain rather than under-constrain, so they carry no correctness risk — only a false serialisation cost.

The design's WS-1 had two halves: (a) lock canonical strings A/B + the clause literals + the stale-deny string; (b) author the `docs/security.md` threat-model section. The plan **already discharges half (a) inside the plan document itself** (§ Canonical Strings & Clause-Set — "These bytes are the source of record"), leaving **T1.1 as WS-1's only task**, producing only the `docs/security.md` section.

Consequence, checked per edge:

- **WS-2 → WS-1: genuine.** String A carries `Mechanics: docs/security.md.`; T2.1 landing before T1.1 ships consumers a dangling pointer. Manual Verification Step 3 verifies exactly this. Keep.
- **WS-3 → WS-1, WS-4 → WS-1: unused.** T3.1/T3.2/T4.1/T4.2 consume string B, which comes from the plan doc, not from T1.1. They demonstrably do **not** consume `docs/security.md` — § Authoring-Rule Constraints _forbids_ a `docs/security.md` pointer in string B (_"Do NOT append … a `docs/security.md` pointer … to any of the 54 copies"_).
- **WS-5 → WS-1, WS-6 → WS-1: unused.** T5.1 consumes the universal-coverage policy (a plan decision); T6.1-T6.5 consume the clause literals from § Canonical Strings.

Recommend a one-line annotation under § Agent Execution Runbook noting that WS-1's string-locking half is pre-discharged by the plan document, so the WS-3/4/5/6 → WS-1 edges are ordering-only and those four workstreams may in fact start immediately. Otherwise a build phase that parallelises workstreams needlessly blocks four of them behind a docs edit.

(WS-7 declares `Requires: WS-2..WS-6`, omitting WS-1 — but T7.1's install re-renders `docs/security.md`, so WS-1 _is_ required. It is satisfied **transitively** via WS-2 → WS-1, so the graph is correct as-is. Noting only so a successor does not "simplify" the WS-2 → WS-1 edge away.)

### 4. T4.3's Done-when does not assert the sync property the task exists to enforce

T4.3 adds an `**Untrusted input**` row to `.bkit/workflows.md` § "Execution Protocol — canonical invariants". That table's own contract (verified, line 143) is: _"Lifted verbatim into every workflow's caution block."_ The existing `**Git**` row (line 156) honours this — its Rule cell is the workflow bullet's text verbatim.

T4.3's Done-when only requires _"the row exists in that table"_ + `lint:prose` + `format:check`. Nothing asserts the row's Rule cell **is string B verbatim**. A paraphrase satisfies the Done-when while creating exactly the index drift the task was added to prevent (`.agents/rules.md`: _"Index drift = regression"_ — verified, line 127).

Suggest: _"Done when: the row's Rule cell is byte-identical to string B minus its `> - **Untrusted input:** ` prefix."_

### 5. T3.2's "unchanged from pre-edit" Done-when has no baseline to compare against

T3.2 Done-when: _"`grep -c 'do NOT trust session memory' .bkit/prompts/*.md` is unchanged from pre-edit"_. No task captures that count **before** the edit, and by the time the Done-when is read the pre-edit state is gone. As written it is unverifiable without trusting session memory — which the plan's own header CAUTION forbids (_"NEVER trust session memory"_).

Suggest a self-contained formulation: `git diff -U0 .bkit/prompts/ | grep -c '^[-+].*do NOT trust session memory'` returns `0` — no baseline capture needed, and it proves the stronger property (the line was neither added nor removed).

## OUT OF SCOPE

- **Pre-existing count drift in `.bkit/workflows.md`.** Line 143 reads _"If you change one wording, change all five workflow files"_, but there are **6** phase workflows (`auto`, `build`, `debug`, `design`, `plan`, `ship`) lifting that table. T4.3 touches this table, so the fix is adjacent — but it is pre-existing drift unrelated to injection hardening, and correcting it would widen the diff of an already 54-file PR. Suggest a `docs/deferrals.jsonl` row rather than in-plan scope creep.

---

**Checks that passed** (recorded so they are not re-litigated downstream):

- **DAG fidelity:** the plan's declared edges reproduce the design's DAG exactly — WS-1 `[]`; WS-2/3/4/5 `[WS-1]`; WS-6 `[WS-1, WS-3, WS-4]`; WS-7 `[WS-2..WS-6]`. No divergence from `plan-input.md` §§ 374-488.
- **Cycles:** none. WS-1 → {2,3,4,5,6} → {6,7} is acyclic; the stated linear order WS-1→…→WS-7 is a valid topological sort.
- **The ordering hazard flagged by the orchestrator is correctly handled.** The 9 in-place upgrades (T3.1) and the stale-variant deny (T6.4) are bound by WS-6 `Requires: WS-3, WS-4`, reinforced by a blocking CAUTION at WS-6 (_"Do NOT start WS-6 until T3.1, T3.2, T4.1, T4.2 are all `[x]`"_) and by § Merge Method's one-PR mandate. The tree is green at every task boundary: after T3.1 no gate exists yet; the gate first appears at T6.1, by which point all 54 files are covered.
- **Design coverage:** all 7 workstreams have runbook tasks; all 7 Derived Test Matrix rows map to a task (T2.2, T6.1-T6.5, T7.2). WS-4's "optional inline seam callouts" resolves to an explicit default-drop in § Architecture — acceptable as a documented no-task decision.
- **Every runbook task carries a `Done when:` line** (T1.1 through T7.2) per `docs/plans/template.md` line 304. All template sections are present and in template order; the three additions (§ Verified Baseline, § Canonical Strings & Clause-Set, § Authoring-Rule Constraints) are additive and do not displace required sections.
- **Baseline re-verified independently against this tree:** `.bkit/prompts/*.md` = **46**; stale-bullet carriers = **9** (exactly the 9 the plan names); `.bkit/workflows/*.md` carrying any bullet = **0**. `.bkit/workflows.md` § canonical invariants does contain a `**Git**` row (line 156) as § Proposed names claims.
- **Session-brief constraint verified, not taken on trust:** `.agents/rules.md` § bkit Repo Authoring lines 125-127 do route as the plan quotes (_"Workflow edits: … ALWAYS follow `.bkit/workflows.md` § Workflow Authoring Rules"_ / _"Prompt edits: … `.bkit/prompts.md` § Prompt Authoring Rules"_ / _"Keep documentation updated … Index drift = regression"_), and lines 121/124 match the quoted "Canonical sources only" / "Template sync" rules. Every verbatim quote in § Authoring-Rule Constraints checks out against `.bkit/prompts.md` (lines 20-27) and `.bkit/workflows.md` (lines 48-54). `### Security & Data` exists at line 96 with the three bullets and `> Mechanics: docs/security.md` blockquote the plan describes.
- **Ledger claims verified, not assumed:** both deferral rows exist in `docs/deferrals.jsonl` (count = 2) and `de-36-…` exists in `docs/decisions.jsonl` (count = 1) — T5.2's verify-don't-append framing is correct.
- **Placement anchors verified:** `.bkit/workflows/bkit-ship.md` line 31 is `> - **Git:**`, with `<!-- bkit:tracker github start -->` at line 33. `bkit-worktree-prune.md` has a minimal prose-only `> [!CAUTION]` at lines 11-12 with no `Git:` bullet and no tracker marker — T4.2's fallback rule is correctly premised.
- **Glob self-match:** `.bkit/prompts.md` is a **sibling of** the `.bkit/prompts/` dir, so `readdirSync(".bkit/prompts/")` cannot enumerate it. WS-6 correctly omits a WS-5 dependency; the doctrine rewrite cannot red the gate.
- **`.bkit/prompts.md` block-merge claim verified** against `.bkit/src/bkit-modules.ts` — it is in `BKIT_CANONICAL_DOCS` (line 419) and written via `writeTier2` when its manifest format is `markered-text` (lines 448-449), so the consumer's `## Model Overrides` below `bkit:end` does survive, exactly as § Architecture states.
