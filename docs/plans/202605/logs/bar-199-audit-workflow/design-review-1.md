Verdict: CONCERNS

<!-- verdict:end -->

# Design Review

Lens: Buildability — stack feasibility, library fit, integration risk; workflow/prompt author-rules compliance for the bkit-audit workflow design (BAR-199).

## Ecosystem Search

Stack is purely the bkit convention surface (markdown workflows + subagent prompts + slash commands + Linear MCP + git worktrees + `jq` on `status.json` + `bkit install` mirrors). No new third-party libraries proposed. Investigation focuses on whether each design element maps onto an existing bkit pattern.

- **Multi-lens fan-out** — exists. `/bkit-design` Step 3 (triplet) and `/bkit-plan` Step 4 (triplet) + Step 6 (pair) demonstrate the pattern. Recommendation: USE-AS-IS for the fan-out plumbing; gap = 11-way parallel (vs current 2-3-way) is untested for token budget and Linear-comment size.
- **YAML-frontmatter fenced blocks** — analogous to existing frontmatter parsing in `bkit install`. `awk`/`sed`/`Read` per-line scan is feasible in bash; `jq` does NOT parse YAML directly (would need an external tool). Recommendation: ADAPT — implement parser as a hand-rolled bash/awk scanner in `bkit-audit-synthesize.md`, NOT `jq`. Design §Per-Finding Schema correctly proposes "extract YAML key:value pairs by line" which is bash-feasible; no new tool required.
- **`grep -A 10 '^\`\`\`finding$'`** — works but fragile if a finding body exceeds 10 lines or contains a triple-backtick. Recommendation: ADAPT — switch to awk state machine matching ` ``finding ` → ` `` ` end fence for variable-length blocks. Gap noted.
- **Linear-bound output cap (500 token)** — exists via `.agents/prompts.md` § Special Behaviors row "Linear-bound output". Recommendation: USE-AS-IS for `bkit-audit-summary`.
- **Stub + verdict + PENDING-placeholder protocol** — exists across all multi-section verdict-bearing agents. Recommendation: USE-AS-IS for all 11 lens prompts + synthesize/prioritize/summary.
- **Append-only INDEX.md via `merge=union`** — `.gitattributes` template at `.agents/templates/gitattributes`. Recommendation: USE-AS-IS — add `docs/audits/INDEX.md merge=union` row to the template so multi-FID audits never conflict. Design §Output Document Shape does not call this out explicitly — gap.
- **Lock semantics for re-audit of tracked issue** — design proposes FID suffix `-audit-{YYYYMMDD-HHmm}`. `.agents/workflows.md` § Locks rule says lock key = `{FID}`; suffix mechanically isolates locks. Recommendation: ADAPT with FID-format regression caveat below.
- **`bkit install` T1/T2/T3 transform** — mirrors `.agents/workflows/` and `.agents/prompts/` byte-identically (T1) or with Cursor T2/T3 transforms. New `bkit-audit.md` + 15 prompts auto-mirror at session end. Deprecation header on existing utility audit prompts also mirrors (verified — `.claude/agents/bkit-utility-audit-codebase.md` is byte-identical to source).

## Stack Feasibility

Buildable as designed; all components map onto existing bkit primitives. Five buildability concerns require resolution before build phase.

### 1. Acceptance coverage vs `design-input.md`

Maps each Acceptance bullet (lines 91-100 of `design-input.md`) to the design draft:

<!-- prettier-ignore -->
| Acceptance | Design coverage | Status |
| --- | --- | --- |
| `bkit-audit.md` 7-step orchestrator | `design-v1-draft.md` §Workflow Shape (lines 99-121) | OK |
| 12 lens + 3 pipeline prompts | §Architecture (lines 82-90); §Files (lines 522-536) — but design ships **11 lens** prompts, not 12 (merge of error+resource → reliability). Reconciliation explicit at lines 56-58 | OK with rationale |
| Lens prompts portable | §Per-lens probe specificity (lines 158-164) — stack-signal detection + STACK_FLAGS | OK |
| Severity × Class matrix + ranked list + per-class appendix | §Output Document Shape (lines 247-307) | OK |
| Smoke-test against pre-BAR-197 dev tip → lenses 1,2,3,7 surface debt | §Smoke-Test Acceptance (lines 412-479). Design RE-MAPS brief's "1,2,3,7" → `config`/`hotpath`/`deps`/`debt` (slugs). Justification given (lines 471-477) but this is a scope shift that should be flagged to the brief author. | CONCERN — see Risks |
| `.agents/skills.md` registers new workflow | Design §Files line 556 EXPLICITLY rejects this per user memory `project_skills_md_manual.md` — "registers the workflow" reinterpreted to mean `.agents/workflows.md`. This contradicts the brief's literal wording. | CONCERN — see Risks |
| `.agents/prompts.md` registers new prompts | §Files line 554 — 15 rows + new `## Audit Phase` section | OK |
| 4 standalone audit prompts get deprecation header | §Standalone Prompt Deprecation (lines 378-410) | OK |
| `bkit install` regenerates mirrors at session end | §Architecture line 97 — explicit, cites user memory | OK |

### 2. Workflow-author-rules compliance (`.agents/workflows.md` § Workflow Authoring Rules, lines 42-54)

The design proposes a 7-step `bkit-audit.md` that clones `bkit-design.md`. Cross-check against the binding rules:

- **Instructions only** — design's workflow file is described as a clone; no rationale-in-workflow proposed. Compliant (caveat: §Lens Taxonomy rationale must live in `.agents/workflows.md` § Audit Phase, NOT in the workflow file itself).
- **Removal = delete** — N/A for new file.
- **Self-contained** — design Step 2 drops `pnpm install --frozen-lockfile` (read-only workflow per §Workflow Shape line 101). However Step 2's worktree-setup bash includes `pnpm install --frozen-lockfile` in `bkit-design.md` line 152; if cloned verbatim and then "drop pnpm install" is applied in build phase, must NOT leave a partial conditional. Compliant assuming clean delete at build time.
- **Sibling-blind subagent Context** — design §Architecture says lens-subagents forked from `bkit-design-brainstorm-ideate-1` skeleton (sibling-blind). Workflow Step 3 fan-out Context string is NOT proposed in design. Risk: design omits canonical Context phrasing for 11 parallel siblings. Build agent must supply: "You are a subagent in the Audit phase running in parallel with 10 other agents."
- **Reuse wording and formatting** — design's Workflow Shape mirrors `bkit-design.md` table format. Compliant.
- **Cross-workflow alignment** — design proposes ZERO changes to `bkit-design.md`/`bkit-plan.md`/etc; new workflow is additive. OK.
- **Procedural conditionals** — design body uses `**If** … → …` form (lines 191, 269, etc). Compliant.
- **Variable references** — `{FID}`, `{ISSUE_ID}`, `{LABELS}` all properly backticked-bracketed. Compliant.

**Gates / status.json shape / lock semantics / comment-per-step / labels:**

- **Status.json step slugs** — design line 107 says step entries `audit-start-workflow` + `audit-worktree-setup`. Matches `bkit-design.md` Step 2 line 167-171 pattern (`design-start-workflow`/`design-worktree-setup`). Compliant.
- **Linear-bound `workflow` field** — `.agents/workflows.md` line 169 `| workflow | design, plan, build, debug, ship` enumerates only 5 values. New value `audit` must be added to that table. Design §Files line 555 mentions "add row to § File Layout" but does NOT call out the `workflow` field enum extension. Gap.
- **Comment-per-step** — design §Linear Lifecycle (lines 370-376) explicit. Step 3 fan-out consolidates 11 verdicts into ONE comment (line 373) — matches comment-per-step invariant. Compliant.
- **Phase labels** — design proposes new `Audit` label mutually exclusive with `Design|Plan|Build|Ship|Merged` (line 366). `.agents/workflows.md` § Phase labels (lines 739-752) currently lists 5 labels under the Linear workspace `workflow` parent group. Adding `Audit` requires server-side Linear label creation under the same parent group AND update of `.agents/workflows.md` table. Design §Files line 555 covers the table update; the Linear-side label creation is implicit human ops. Build agent must surface this as a manual step.
- **Lock semantics** — design §Slash Command Surface lines 341-346 retain `{FID}` lock key; new FID suffix `-audit-{YYYYMMDD-HHmm}` decouples locks for re-audits. Compliant with `.agents/workflows.md` § Locks (line 118).
- **Failure Path** — design §Workflow Shape lines 122-133 lift `bkit-design.md` Failure Path verbatim with 6 adaptations. Read-only adaptation (no `pnpm install` in Step 2, no PR cleanup) is consistent. Concern: line 130 "Skip `git rebase --abort` only when no rebase occurred (read-only Step 2 still does a rebase on resume — keep the line)" — `bkit-design.md` Failure Path line 43 unconditionally runs `git rebase --abort 2>/dev/null || true` which is harmless even when no rebase. Design line 130 wording is confusing (says "Skip … only when no rebase" → double negative). Build agent must simplify to "keep `git rebase --abort 2>/dev/null || true` line verbatim".

**Hard stop after Step 7** — design line 39 says "merge to dev" + "label retained, state→In Review". `.agents/workflows.md` design table line 524 includes "Hard stop in Step 10 caution block: 'Design requires human review. Do NOT invoke /bkit-plan.'" — design draft does NOT specify the corresponding "Audit requires human review. Do NOT invoke …" hard-stop sentence. Gap.

### 3. Prompt-author-rules compliance (`.agents/prompts.md` § Prompt Authoring Rules, lines 14-33)

11 lens prompts + 3 pipeline prompts + 1 shared `bkit-audit-lens-charter.md` cross-referenced doc.

- **Self-contained** (line 20) — design §Architecture line 85 proposes `bkit-audit-lens-charter.md` "cited by every lens". This violates "Each prompt file MUST stand alone. NO cross-references to `.agents/prompts.md` or other meta docs." The charter doc is NOT a meta doc per se (it's a sibling prompt-adjacent file), but the rule is strict — "If the agent needs the rule, inline it; if it doesn't, leave it out." Charter-doc citation is a cross-reference, breaking standalone-runnability. **CRITICAL** — see CRITICAL section.
- **Standalone-runnable** (line 21) — same issue. A lens prompt that reads `bkit-audit-lens-charter.md` cannot be invoked outside the workflow without that file existing on disk. Acceptable if charter is `.agents/prompts/bkit-audit-lens-charter.md` (lives in the same dir, shipped together with the lens prompts) — design §Files line 522 places it correctly. But the cross-reference pattern itself is unusual. Build agent must justify, OR inline a per-lens probe table per prompt (worse for drift, better for rule compliance).
- **Generic Role, specific Process** (line 22) — design does not specify Role lines per lens. Build risk: lens prompts must share seniority anchor ("Senior auditor") while Process varies. Gap.
- **Standalone prompt files for synthesize/prioritize/summary** — design clones `bkit-design-generate`/`bkit-design-organise`/`bkit-design-summary`. Compliant.
- **Output Lens line** (line 32) — for parallel-sibling outputs, "one `Lens:` line directly under the H1 to identify the lens that generated the artifact". 11 lens prompts MUST carry this line. Design §Per-Finding Schema does not call this out. Gap (design level — should specify lens artifact H1 = `# Audit Lens — {slug}` + `Lens: {slug} — {one-line probe summary}.`).
- **Output section shape** (lines 28-31) — design's YAML-frontmatter fenced `finding` blocks are NOT a section heading but a repeating data block. Compatible with "freeform, multi-finding" sub-rule but the bracket-instruction template (line 30) is the canonical shape. Design's choice to use repeating fenced blocks under a `## Findings` heading is a NEW pattern in bkit. Build agent must justify in `.agents/prompts.md` rationale block.
- **Variable references** (line 27) — design's YAML schema uses bare keys (`severity`, `class`) which is correct inside fenced output-format blocks.
- **No subagent-of-subagent** (`.agents/rules.md` line 42 + `.agents/workflows.md` line 56) — design's pipeline (synth → prio → summary) is sequential orchestrator-driven, NOT subagent-invoking-subagent. Compliant.
- **Fixed read/write paths** — design Read paths are `docs/plans/logs/{FID}/audit-lens-*.md`; write paths `docs/plans/logs/{FID}/audit-v{N}-{action}.md`. Compliant with `.agents/workflows.md` § Versioned Outputs (lines 308-358).
- **Verdict-line discipline** — design §Workflow Shape line 116 "Each lens writes its own file with: header `Verdict: PASS|CONCERNS|FAIL` + `<!-- verdict:end -->`, followed by N fenced `finding` blocks." Compliant.

### 4. Schema realism — YAML-frontmatter fenced finding blocks

Design §Per-Finding Schema (lines 166-207) proposes:

```finding
severity: CRITICAL
class: reliability
location: apps/web/src/lib/db.ts:42
what: broad catch swallows DB lock errors
why: Lock contention fails silently; user sees stale data
direction: Narrow catch to known recoverable errors; log + rethrow on others
confidence: high
```

**Reliability concerns:**

- **Multi-line values** — `what:` / `why:` / `direction:` are described as single-line by example but the design doesn't constrain to single-line. Real findings will want to span multiple sentences. YAML supports `|` and `>` folded scalars, but bash line-by-line extraction does NOT. Build agent must either (a) constrain to single-line + ≤200 char per field, OR (b) ship a real YAML parser. (a) is mechanically simpler. **CONCERN**.
- **Colons in values** — `what: serverExternalPackages: catch-all` would break naive `awk -F:` parsing. Build agent must specify either (a) escape rule or (b) parser that strips only the first `:`. (b) is the right call.
- **Backticks in values** — `direction: Use \`pnpm outdated\``— fine because the fenced block uses`finding`not standard markdown. No escape needed inside`finding` fences. OK.
- **Triple-backticks in values** — if any field contained `` ` `` ``` it would close the block. Build agent must forbid via prompt instruction.
- **`grep -A 10`** (design line 191) — assumes ≤10 lines per block. Design's 7-field example fits, but field expansion or multi-line values break this. Build agent must replace with awk state-machine parser. Already flagged above.
- **synthesizer "assert all seven fields present"** (line 192) — straightforward bash check. Compliant.

**Synthesizer parsing approach** is implementable in bash + awk + standard tools. NO `jq`-on-YAML needed (`jq` requires JSON; YAML-to-JSON conversion via `yq` or equivalent would add a new dep — design correctly avoids this). Build agent confirmation needed: use awk, not `jq`.

### 5. Lens probe feasibility

Each lens needs probes runnable with `Read`/`Grep`/`Glob`/`Bash` only (design §Decisions row "11 sibling lens prompts forked from `bkit-design-brainstorm-ideate-1` skeleton" implies same tool surface). Spot-check vs §Lens Taxonomy table (lines 143-156):

<!-- prettier-ignore -->
| Lens | Probe shape | Feasibility |
| --- | --- | --- |
| `architecture` | Import-graph fan-in/out — `grep -r "from '"` + count | Bash-feasible. Lossy without AST but acceptable for "hotspot" detection. |
| `hotpath` | Top-level static imports in entrypoints — `grep -E "^import" entrypoints` | Bash-feasible. `next.config.*` probe for `serverExternalPackages` is `grep -A 10 serverExternalPackages` — feasible. |
| `config` | Manifest/code divergence — diff `package.json` keys vs file references | Bash-feasible. |
| `reliability` | `catch \(` / `unhandled rejection` / unbounded queues — grep + heuristics | Bash-feasible. False-positive prone — confidence:medium default. |
| `observability` | Failure surfaces without logs — grep `catch \(.*\) {` followed by absence of `log` | Bash-feasible but pattern-fragile. |
| `debt` | `TODO\ | FIXME\ | HACK\ | XXX\ | workaround\ | band-aid\ | recovery` + ticket-ID grep | Bash-feasible. Brief lists this verbatim. |
| `dead-code` | Unreferenced exports — `grep -L` against exported names | Bash-feasible but slow on large repos. **Cap risk** — could exceed 30-finding cap. |
| `deps` | `pnpm outdated` / `pnpm audit` — Bash + JSON output | Bash-feasible (assumes consumer repo has pnpm; portability §6 holds because `pnpm` is bkit's stack but the lens uses STACK_FLAGS to detect npm/yarn/bun and skip if not pnpm). Design line 153 says `pnpm outdated/audit` unconditionally; needs STACK_FLAG gating to remain portable. **CONCERN**. |
| `security` | Auth holes / shell injection (`execSync.*\${`) — grep | Bash-feasible. Note: `execSync.*${` example in design line 154 uses `$` which in bash double-quotes would interpolate; design draft contains this pattern in single backticks → in the actual prompt it must be in fenced block or escaped. |
| `tests` | Mocked-only critical paths — `grep -l vi.mock` against critical-path globs | Bash-feasible. |
| `docs-drift` | `.agents/docs.md` references vs actual code domains | Bash-feasible. |

**All 11 lenses implementable with `Read`/`Grep`/`Glob`/`Bash` — no new tooling required**, with two probe-specificity gaps (deps unconditional pnpm, observability log-detection fragility) addressable in build phase. PASS.

### 6. Smoke-test feasibility

**Major concern — see CRITICAL section.**

- **Golden findings file** (`tests/golden/bar-197-known-debt.finding.md`) — design §Smoke-Test Acceptance lines 418-457 specifies exact content. File creation is mechanical. OK.
- **`/bkit-audit --smoke-test` flag** — design line 461 proposes this. Slash-command flag-parsing is NOT a standard pattern in bkit; existing slash commands take positional args only (e.g. `/bkit-design BAR-NNN`). Design §Slash Command Surface lines 326-333 documents `[optional-target]` arg parsing (positional). Adding `--smoke-test` as a flag requires net-new argv parsing in Step 1 of the workflow. Build agent must specify EXACT parsing approach. **CONCERN**.
- **Pre-BAR-197 dev tip reference** — search of git log in this worktree returned NO commits matching `BAR-197`. The git history visible from `dev` does NOT include BAR-197 commits in the current branch's reachable history. Design §Risks line 660 calls this out ("worktree creation in Step 2 defaults to `origin/dev`. Open: does the workflow need a `BASE_REF` override to run smoke-test against historical SHAs? Mitigation: build phase will check out the pre-BAR-197 SHA manually"). The pre-BAR-197 SHA must be resolvable from `origin/dev` history at the time of build phase. **CRITICAL** — see below.
- **Brief acceptance maps to lens slugs** — brief line 96 says "lenses 1, 2, 3, 7 surface known debt". Brief table (Linear description) maps 1=Architecture, 2=Hotpath, 3=Config, 7=Debt. Design line 477 RE-MAPS to `config`/`hotpath`/`deps`/`debt` — removing `architecture` (which the brief asserts) and adding `deps`. Design's justification (architecture is a coupling lens, not config/build trap) is defensible but contradicts brief literal wording. Build agent must surface this remap to the brief author. **CONCERN**.

### 7. Deprecation mechanics

Design proposes header-only deprecation of 4 standalone audit prompts (`bkit-utility-audit-{codebase,security,tests,logs}.md`).

- **Mirror behavior** — verified: `.claude/agents/bkit-utility-audit-codebase.md` is byte-identical to source. `bkit install` T1 transform copies verbatim. Deprecation header → mirrors to `.claude/agents/` and `.cursor/agents/` automatically. OK.
- **Skills loading** — these prompts are not registered in `.agents/skills.md` (per user memory `project_skills_md_manual.md` they would only be there if manually added). Adding a deprecation header to the prompt frontmatter body does NOT remove them from skill registry (because they were not there). They remain invocable via `@bkit-utility-audit-codebase`. Deprecation header is informational only, NOT functional disablement. Compliant with design §Standalone Prompt Deprecation line 410 ("standalone invocation … keeps working for muscle-memory users").
- **`Deprecated since v2.2.0`** — current `package.json` version should be checked at build time. Design line 391 assumes "v2.2.0 matches the current release stream" — verify before build. Build agent must check `package.json#version` and adjust. **OPTIONAL**.
- **No deletion in v1** — design defers deletion to `BAR-200`. `docs/pending.md` append covers tracking. Compliant.
- **Mutability** — deprecation header is prepended BEFORE the first `**Role:**` line (design line 382). Verified by reading `bkit-utility-audit-codebase.md` — frontmatter ends at line 15, body starts at line 17 with `**Role:**`. Insertion point is line 16 (blank line). Mechanically straightforward; no rule violation.

### 8. Concrete file-list completeness

Design §Files (lines 508-590) summary: Create 19 files + 1 directory; Modify 4-6 prompts + 4 registry files; Delete 0. Cross-check vs workflow + lens references:

- **`bkit-audit-lens-charter.md`** — design §Architecture references it; §Files line 522 creates it. OK.
- **11 lens slugs** — §Lens Taxonomy table (lines 143-156) lists architecture/hotpath/config/reliability/observability/debt/dead-code/deps/security/tests/docs-drift. §Files lines 523-533 lists same 11 (verified one-to-one). OK.
- **`docs/audits/INDEX.md`** — §Output Document Shape line 309 references it; §Files line 563 creates it. Missing: `.gitattributes` row `docs/audits/INDEX.md merge=union` for append-only union-merge. **OPTIONAL — addable in build phase.**
- **`docs/decisions.md`** + **`docs/pending.md`** — §Files lines 565-566 append (NOT modify). `.gitattributes` template already has these as `merge=union`. OK.
- **`docs/audits/{FID}-audit.md`** — created at Step 7. §Files line 564 lists this. OK.
- **`tests/golden/bar-197-known-debt.finding.md`** — §Files line 576 creates it. OK.
- **`.agents/workflows.md` § Audit Phase rationale block** — §Files line 555 says "add § Audit Phase rationale section". Compliant with §Workflow Authoring Rules "Rationale lives here".
- **Linear server-side `Audit` label creation** — design implicit; not in file-list (because it's not a file). Build agent must execute as a manual ops step OR via `save_issue` with the label name (which auto-creates if Linear workspace permits). Gap.
- **`.agents/docs.md` Workflow Matrix update** — §Files line 557 covers. OK.

**No orphan references found between workflow body and file-list.**

### 9. Scope discipline

Brief out-of-scope (lines 102-109 of `design-input.md`):

- Per-lens fixers — design respects (audit is read-only). OK.
- CI scheduling — design defers to v2 (§Cross-Workflow Hooks line 504). OK.
- Live log lens — design defers to v2 (lens taxonomy decision). OK.
- Cross-repo aggregation — not in design. OK.
- Deleting standalone prompts — deferred (BAR-200 follow-up). OK.
- A11y / i18n / migrations — deferred. OK.

**In-scope items potentially missing:**

- Brief Acceptance line 97 `.agents/skills.md` registers the new workflow — design REJECTS this per user memory. This is a real scope conflict. The brief author may not have known about the `project_skills_md_manual.md` memory. Build agent must surface to the brief author for explicit reconciliation, OR include a sentence in the BAR-199 Linear issue confirming the reinterpretation. **CONCERN** (already flagged).
- `--smoke-test` flag is in-scope (smoke-test acceptance) but the flag's surface is a new pattern. Should be explicitly documented in design.

**Out-of-scope additions (design pulls in but brief doesn't require):**

- Portability gate (Decisions table row 12, design line 611) — synthesizer greps lens output for `Next\.js|Vercel|pnpm|esbuild` and emits `## Portability Drift` CONCERNS. This is a NEW mechanical check not in brief. Probably good, but technically scope creep. **OPTIONAL.**
- Cross-workflow citation in `bkit-design-review-*` (design §Cross-Workflow Hooks lines 491-498) — design adds 2 bullets to existing review prompts. Brief explicitly punts this as Open Question 1. Design partially adopts (citation = yes, invocation = no). Reasonable but worth surfacing.

### 10. Risk register — top 3 with mitigations

1. **CRITICAL — Smoke-test SHA resolvability.** Pre-BAR-197 dev tip is the load-bearing reference for the entire acceptance criterion. Current `dev` branch has NO `BAR-197` commits reachable by `git log --all | grep -i bar-197` in this worktree. If the pre-BAR-197 SHA is unreachable when build phase runs, the golden findings cannot be validated and the smoke-test attestation cannot pass.
   **Mitigation:** Build agent's FIRST action must be `git log --all --grep "BAR-197" --format="%H %s"` to resolve the pre-fix SHA; if empty, fall back to grep on commit body for `serverExternalPackages` or `catch-all` lambda; if still empty, downgrade smoke-test to manual checkout of a known SHA passed via env var. Document the resolved SHA in `docs/plans/logs/{FID}/smoke-test.md` per design line 479.

2. **CRITICAL — Standalone-runnable rule conflict for charter-doc citation.** Design §Architecture line 85 requires each of 11 lens prompts to cite `bkit-audit-lens-charter.md`. `.agents/prompts.md` § Prompt Authoring Rules line 20 says "NO cross-references to `.agents/prompts.md` or other meta docs … If the agent needs the rule, inline it; if it doesn't, leave it out." A charter doc is borderline (a prompt-adjacent shared file, not a "meta doc"). Either pattern violates literal rule OR forces 11× probe-table duplication with drift risk.
   **Mitigation:** Pre-build clarification with the rule author (Christian). Two options: (a) Amend §Prompt Authoring Rules to permit citation of sibling `bkit-audit-lens-charter.md` (one-time exception, documented in `.agents/prompts.md` rationale). (b) Inline the per-lens probe table inside each lens prompt — accept drift risk via mechanical check at build time (e.g., a `pnpm bkit:lint:probe-drift` script). Option (a) is cleaner; build agent should propose (a) explicitly.

3. **CONCERNS — 11-way parallel fan-out untested at orchestrator + Linear scale.** Current bkit triplets/pairs cap at 3 parallel subagents. Design proposes 11. Token budget per `Agent` tool invocation may compound non-linearly (orchestrator carries 11 result contexts). Linear comment size at 11 verdicts may exceed Linear API limits (rare but undocumented). Cost: ~4× `bkit-design` triplet (design line 643 explicit).
   **Mitigation:** Design §Risks row 2 already proposes 30-finding cap per lens. Add: (a) Test-harness in build phase that invokes lens-prompts standalone (not via orchestrator) to confirm each prompt's standalone run works AND output fits in `bkit-audit-synthesize` context window; (b) Step 3 Linear comment format defines a verdict-summary table (1 row per lens) to keep comment under ~5KB; (c) verify orchestrator parallel-tool-call limit is ≥11 on Claude Code (not documented anywhere visible to this reviewer).

## Library / API Evaluation

No third-party libraries proposed. All work happens in:

- bash + `jq` (already in stack — `.agents/workflows/*.md` use `jq` extensively for `status.json`).
- `awk` / `sed` for YAML-fenced-block parsing (POSIX, no install).
- Linear MCP tools (already wired via `.claude/settings.json`).
- `gh` CLI (already used for repo/PR introspection).
- Claude Code Agent tool (in-stack for subagent dispatch).

**No bundle/types/license concerns.** All proposed mechanisms use the existing tool surface verbatim. The only "new" technical primitive is the YAML-frontmatter fenced `finding` block format — which is markdown convention, not a library.

## Integration Risk

**Monorepo fit:** bkit is a single-package repo (per `.agents/workflows.md` line 572 — "bkit is a single-package repo"). The audit workflow operates over the entire `.agents/`, `apps/` (none in bkit itself), `scripts/`, `docs/` surface. No package-graph fanout concerns.

**Systems touched:**

- `.agents/workflows/bkit-audit.md` — additive; no other workflow touched.
- `.agents/prompts/bkit-audit-*.md` (16 new files) — additive.
- `.agents/prompts/bkit-utility-audit-*.md` (4 files) — header-only modification; preserves frontmatter and body. Mirror regeneration safe.
- `.agents/workflows.md`, `.agents/prompts.md`, `.agents/docs.md` — additive sections + table-row additions.
- `.agents/skills.md` — NO change per design (user memory). Reconcile with brief.
- `docs/audits/` — NEW directory; `INDEX.md` append-only requires `.gitattributes` row.
- `docs/decisions.md` / `docs/pending.md` — append-only (already `merge=union`).
- `tests/golden/bar-197-known-debt.finding.md` — new test artifact; `tests/golden/` directory may not exist yet. Build agent must `mkdir -p`.
- Linear workspace — NEW `Audit` label under `workflow` parent group; must be created server-side (manual ops or first-time `save_issue` auto-create).

**Blast radius:** Low. Workflow is read-only; even total workflow failure leaves no code mutations. Worst-case bad audit produces a misleading report at `docs/audits/{FID}-audit.md` which can be deleted with no side effects.

**`bkit install` mirror regeneration:** End-of-session per user memory `feedback_bkit_install_batching.md`. NEW workflow file + 16 NEW prompts + 4 modified prompts → `.claude/commands/bkit-audit.md` + `.claude/agents/bkit-audit-*.md` + Cursor equivalents auto-generated.

## PoC Approach

A 200-word PoC to confirm the riskiest two assumptions before full build:

1. **One end-to-end lens prompt** — Build `bkit-audit-lens-debt.md` as the simplest lens (pure grep over TODO/FIXME). Invoke standalone via `@bkit-audit-lens-debt` against bkit repo root. Confirm: (a) it emits a verdict line + `<!-- verdict:end -->` + N `finding` blocks; (b) all 7 fields present; (c) blocks parse via `awk '/^```finding$/,/^```$/'`.

2. **One synthesizer pass** — Build a stub `bkit-audit-synthesize.md` that reads ONE lens file (the debt output) and emits `audit-v1-synthesis.md` with deduped findings + verdict. Confirm: (a) awk-based YAML extraction works on 7+ fields; (b) `(class, location)` dedup correct; (c) verdict header preserved.

3. **`/bkit-audit` shell** — Strip `bkit-audit.md` to Steps 1, 2, 3 (one lens only), 4 (synth), 7 (close). Run end-to-end against bkit. Confirm: (a) FID creation + lock acquire; (b) Linear comment-per-step append; (c) `docs/audits/{FID}-audit.md` lands; (d) INDEX.md row appended.

If all three pass → scale to 11 lenses. If (1) fails → re-architect schema. If (2) fails → fall back to brief's heading format. If (3) fails → debug orchestrator plumbing.

## Unknowns & Blockers

1. **Pre-BAR-197 SHA resolvability** — must be resolved at build phase first action. (CRITICAL)
2. **Standalone-runnable rule reconciliation with charter-doc citation** — needs human (Christian) decision before build. (CRITICAL)
3. **`.agents/skills.md` brief-vs-memory conflict** — design rejects brief's literal acceptance; needs human reconciliation. (CONCERN)
4. **Brief lens-number → slug remap** — "lenses 1,2,3,7" → `config`/`hotpath`/`deps`/`debt` (drops `architecture`, adds `deps`). Defensible but should be surfaced. (CONCERN)
5. **Linear `Audit` label server-side creation** — manual ops step; design implicit. (CONCERN)
6. **11-way parallel fan-out scale** — orchestrator + Linear behavior untested at this count. (CONCERN)
7. **`--smoke-test` flag parsing** — net-new pattern in bkit slash commands. (CONCERN)
8. **YAML schema multi-line values** — single-line constraint vs natural finding prose. (CONCERN)
9. **Status.json `workflow` enum extension** — `.agents/workflows.md` line 169 table needs new `audit` value. (gap; addable in build phase)
10. **`status.json` field semantics for verdict-bearing Step 3 fan-out** — current pattern has ONE verdict per step. 11 sibling verdicts must be reduced; design §Workflow Shape line 108 says step has no verdict (just `chore({FID}): lens-audits` commit). Design implies a `LENS_VERDICT_WORST` extraction. NOT explicit. (gap)

## Verdict Reasoning

**Verdict: CONCERNS.**

Design is implementable as-is with the approved bkit stack; no new tooling, no new third-party deps, no new patterns that don't compose from existing primitives. The 7-step orchestrator clones `bkit-design.md` cleanly; the 11 lens-subagents fork from `bkit-design-brainstorm-ideate-1`; the synthesizer/prioritizer/summary clone `bkit-design-generate`/`bkit-design-organise`/`bkit-design-summary`. File list is complete, acceptance coverage maps point-by-point, deprecation mechanics work. Mirror regeneration via `bkit install` automatically extends to all new + modified prompts.

Concerns block PASS: (1) smoke-test SHA resolvability — load-bearing for acceptance; not verified resolvable in this worktree; (2) charter-doc citation conflicts with `.agents/prompts.md` § Prompt Authoring Rules "standalone-runnable" and "self-contained" rules; (3) `.agents/skills.md` brief-vs-memory conflict needs human reconciliation. None of these are fundamental incompatibilities — all addressable in a design-update or build-phase preflight — so FAIL is not warranted. Each concern needs an explicit decision before build starts; together they should drive a design-update pass.

## CRITICAL

1. **Smoke-test SHA must be resolvable from `origin/dev` reachable history.** Current worktree has no `BAR-197` commits visible via `git log --all --grep`. Build agent must resolve the pre-BAR-197 SHA as its first action AND embed the resolved hash in `docs/plans/logs/{FID}/smoke-test.md`; otherwise the smoke-test attestation cannot run, breaking acceptance line 96 of the brief. Reference: design `design-v1-draft.md` §Smoke-Test Acceptance lines 459-479, §Risks line 660.

2. **Charter-doc citation pattern conflicts with `.agents/prompts.md` § Prompt Authoring Rules.** "Self-contained" (line 20) and "Standalone-runnable" (line 21) rules forbid cross-references between prompt files. Design's `bkit-audit-lens-charter.md` cited by every lens (design line 85) violates literal reading. Resolve before build: either (a) amend the prompt-authoring rule with a documented exception, OR (b) inline the per-lens probe table into each of 11 lens prompts with a mechanical drift check. Reference: `design-v1-draft.md` §Architecture line 85, §Decisions row "11 sibling lens prompts forked from `bkit-design-brainstorm-ideate-1` skeleton; shared `bkit-audit-lens-charter.md`" line 601.

3. **`.agents/skills.md` registration — brief vs user memory conflict.** Brief Acceptance line 97 requires "`.agents/skills.md` index registers the new workflow"; design line 556 EXPLICITLY rejects this per user memory `project_skills_md_manual.md`. The brief author may not have known about the memory. Must be human-reconciled (either update the brief, or update the memory, or document the exception in the BAR-199 Linear issue) before build phase. Reference: `design-v1-draft.md` §Files line 556, §Decisions row "`.agents/skills.md` NOT modified in v1" line 612.

## OPTIONAL

1. **Brief "lenses 1, 2, 3, 7" → slug remap.** Design line 477 remaps to `config`/`hotpath`/`deps`/`debt`, dropping `architecture` and adding `deps`. Defensible but should be confirmed with brief author. Add to BAR-199 Linear comment thread.

2. **`docs/audits/INDEX.md` requires `.gitattributes` row** `docs/audits/INDEX.md merge=union` for append-only safety across parallel audits. Add to `.agents/templates/gitattributes`. Reference: design §Output Document Shape lines 309-320.

3. **Linear `Audit` phase label** must be created server-side under the `workflow` parent group BEFORE first `/bkit-audit` run. Add as explicit manual ops step in the BAR-199 plan, OR have Step 1's `save_issue` auto-create (verify Linear workspace permits).

4. **Status.json `workflow` enum extension.** `.agents/workflows.md` line 169 table needs new `audit` value. Add to §Files modification list (`.agents/workflows.md`).

5. **`--smoke-test` flag** is a net-new slash-command argv pattern. Pin the exact parsing approach in design (or simplify to env var `BKIT_AUDIT_SMOKE_TEST=1`). Design line 461 leaves implementation open.

6. **YAML schema multi-line values** — constrain `what`/`why`/`direction` fields to single-line ≤200 chars in the lens prompt instructions; document the constraint in `bkit-audit-lens-charter.md`. Design §Per-Finding Schema does not constrain.

7. **`grep -A 10`** (design line 191) is fragile. Switch to awk state-machine `/^\`\`\`finding$/,/^\`\`\`$/`in`bkit-audit-synthesize`. Design build agent should adopt this verbatim.

8. **Step 3 lens-verdict aggregation** — design omits explicit `LENS_VERDICT_WORST` extraction in Step 3. Add to workflow shape: `LENS_VERDICT_WORST` = worst-of-11 (`FAIL > CONCERNS > PASS`); status.json step entry carries `verdict: {LENS_VERDICT_WORST}`. Matches the design/plan pattern.

9. **Hard-stop sentence after Step 7.** "Audit requires human review. Do NOT invoke `/bkit-plan`." Mirror the `bkit-design.md` line 539 hard-stop. Design omits.

10. **Failure Path line 130 wording** — "Skip `git rebase --abort` only when no rebase occurred" is a confusing double negative. Simplify to "keep `git rebase --abort 2>/dev/null || true` line verbatim from `bkit-design.md`".

11. **`deps` lens unconditional `pnpm outdated/audit`** — gate behind `STACK_FLAGS.IS_PNPM`. Design line 153 reads unconditional; portability §6 says no stack pinning.

12. **`Deprecated since v2.2.0`** version string — verify against `package.json#version` at build time. Design assumes; may need adjustment.

## OUT OF SCOPE

1. **Live runtime lens** (`audit-gcp-errors.sh` integration) — design defers to v2; respect.
2. **CI scheduling / automated audits** — design defers to v2; respect.
3. **Cross-workflow auto-hooks** (`bkit-debug-summary` audit-queue) — design defers to v2; respect.
4. **Standalone prompt deletion** — design defers to BAR-200 follow-up; respect.
5. **A11y / i18n / migrations / api-contract / rate-limiting / caching lenses** — design defers; respect.
6. **Cross-repo aggregation** — design defers; respect.
7. **Auto-`Done` on PASS audits** — design rejects; uniform `In Review` terminal state preserved.
8. **`bkit-build-install-skills` audit-INDEX gate** — design defers to v2; respect.
9. **Skill registration of new workflow** — flagged as CRITICAL above for human reconciliation, not actioned by the build agent unilaterally.
