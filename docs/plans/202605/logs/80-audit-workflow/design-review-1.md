Verdict: CONCERNS

<!-- verdict:end -->

# Design Review

Lens: Buildability — stack feasibility, library fit, integration risk.

This repo IS the bkit tooling repo. The design's deliverables are `.agents/workflows/bkit-audit.md` + 16 `.agents/prompts/bkit-audit-*.md` files + registry edits. "Stack" = the bkit authoring conventions (`.agents/rules.md`, `.agents/workflows.md`, `.agents/prompts.md`) and the existing skills tooling. Buildability is judged against those, not a runtime library stack.

## Ecosystem Search

Searched the bkit repo itself for each capability the design needs — every one already has a battle-tested in-repo precedent. No external libraries are introduced; this is doc-authoring, so the relevant "ecosystem" is the existing `.agents/` corpus.

| Capability design needs                                                 | What exists in-repo                                                                                                                                                                     | Fit                                                             | Recommendation                                                                                                                                                   |
| ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 10-step orchestrator with FID/lock/status/comment/Failure-Path ceremony | `bkit-design.md` (628 lines, 10 steps); Steps 1/2/9/10 confirmed to do exactly start-workflow / worktree-setup / workstream-issues / close+squash-merge                                 | >95% — slug-swap clone is mechanical                            | USE-AS-IS (clone + `design-`→`audit-` rename). Remaining gap: Step 2 `pnpm install` removal, Step 10 close uses `issue-update-review` not `issue-update-merged`. |
| Parallel sibling-blind fan-out (11 lenses)                              | `bkit-design-brainstorm-ideate-*` (triplet) + `bkit-build-challenge-*` (pair) patterns; `dispatching-parallel-agents` skill installed                                                   | >90% — established to N=3; N=11 is new scale but same mechanism | ADAPT (proven pattern, untested at 11-wide; see Integration Risk).                                                                                               |
| Read-only reviewer prompt skeleton                                      | `bkit-design-brainstorm-ideate-1` (`Read, Grep, Glob, Write`) — the exact non-mutating tool surface the lenses need                                                                     | 100%                                                            | USE-AS-IS as the lens skeleton.                                                                                                                                  |
| Skill install via `npx skills find/add`                                 | `bkit-build-install-skills.md` — already wraps `npx skills find [tech]` + `npx skills add <owner/repo> -y`, caps at 10, treats not-found as non-blocking, `Read,Grep,Glob,Bash` surface | >90%                                                            | USE-AS-IS as the sibling template; remaining 10% = data-driven `audit-{token}` query derivation + provenance/version log + `[skills=false]` escape.              |
| Workstream → sub-issue spawning + DAG                                   | `bkit-design-organise` + Step 9 `design-workstream-issues` (sub-issue create/list, `blockedBy` edges)                                                                                   | >90%                                                            | USE-AS-IS (charter re-cut is mechanical).                                                                                                                        |
| Severity×class matrix / finding schema / `## Missing Lenses`            | Superseded design (on `dev`) + the stale `workflows.md` audit block                                                                                                                     | Reusable but format-divergent (see below)                       | ADAPT — reuse the matrix/dedup intent, but resolve the finding-format conflict (YAML `finding` block vs the stale block's `^## [sev][class]…$` regex).           |

Searched `{npx skills install scope}`: `.agents/skills.md` confirms `npx skills add <owner/repo> -y` installs **project-local** to `.agents/skills/`. Because all 11 lenses run inside the same `.worktrees/{FID}` cwd (Worktree invariant), a skill installed in Step 4 is on-disk and readable by every Step 5 lens. The design's "installed skills augment the lenses" claim is therefore mechanically sound — provided the lenses read `.agents/skills/audit-*` by directory listing (not by a hardcoded skill name, which they correctly avoid).

## Stack Feasibility

Buildable with the approved authoring stack. Confirmed against the real files:

- **10-step shape** maps 1:1 onto `bkit-design.md`. Steps 1, 2, 9, 10 are slug-swap clones (verified the design Step 9 spawns sub-issues with `blockedBy`; Step 10 does `cp v{N} → canonical`, squash-merge to `dev`, worktree remove, lock-absent assert, `issue-update-review` → `In Review` preserving label). Steps 3–8 reuse the verdict-extract / status-append / comment-post ceremony.
- **status.json `workflow` enum already includes `audit`** (workflows.md lines 154, 194) — no schema change needed. Design correctly notes this.
- **Two-Layer Separation** is honoured: all 16 agents are leaves with non-tracker tool surfaces; only the orchestrator touches the tracker. The two new agents (`stack-detect` = `Read,Grep,Glob,Write`; `install-skills` = `Read,Grep,Glob,Bash`) match existing tool-set-pattern rows verbatim. Provably non-mutating for the lenses + stack-detect (no `Edit`/`Bash`).
- **Models/effort/maxTurns table** is internally consistent with `.agents/prompts.md` § Models conventions: `low→haiku`, `medium→sonnet`, `high/xhigh→opus-4-7`, maxTurns tiers S/M = 25/50. The `bkit-audit-install-skills` row (medium/sonnet/S-25/`Read,Grep,Glob,Bash`) is byte-identical to the existing `bkit-build-install-skills` row — clean reuse.
- **ASCII operators**: design prose uses `>`, `>=` correctly; the produced workflow/prompt files must keep ASCII (`!=`, `>=`, `<=`) per the project rule. The draft's `severity×class` uses `×` (multiplication sign) in prose, which is fine in a design doc but MUST become `x` or `severity-class` inside the shipped `.agents/*` files. Flag for the plan.
- **Standalone-runnable lenses**: design correctly INLINES each lens's universal probe block rather than citing a shared charter (rejecting lens-1 C). This is the only way to satisfy the Standalone-runnable rule; the choice is correct and buildable.

No blocker at the stack level. The architecture is a faithful clone of an existing, shipping workflow.

## Library / API Evaluation

The only external surface is the `npx skills` CLI, reached only at Step 4.

- **Maturity / adoption**: `npx skills` is already a load-bearing dependency of the shipping `/bkit-build` (Step via `bkit-build-install-skills`) and `/bkit-ship` (Step 10 "Prune Skills"). It is the established bkit skill manager. No new dependency is introduced.
- **API shape**: `find-skills/SKILL.md` confirms `npx skills find [query]`, `npx skills add <owner/repo[@skill]> -y` (`-g` global / `-y` skip-confirm). The design's `npx skills find audit-{token}` / `npx skills add` usage is valid against this API.
- **License / bundle / types**: N/A — no code dependency added; CLI invoked at author/run time only.
- **Gap — quality-gate bypass**: `find-skills/SKILL.md` Step 4 _mandates_ human verification of install-count + source-reputation + GitHub stars before recommending a skill. An automated `npx skills add` in Step 4 bypasses that human judgement. The design acknowledges this (Risks §"Skill provenance/trust") and hedges with the 10-skill cap + version capture, but inherits the same automation gap `bkit-build-install-skills` already carries — so it is no worse than the live precedent. Acceptable, not novel risk.
- **Gap — the `audit-{stack}` skills do not exist yet**. `find-skills` searches the public skills.sh registry; there is no evidence that `audit-nextjs`, `audit-vitest`, `audit-pnpm` etc. exist there today. The design's enrichment value in v1 is therefore largely aspirational until those skills are authored (explicitly out of scope per the brief: "author audit-skills" is named but the prompt-inventory create-list does NOT include any skill authoring). v1 will almost always hit the "Not Found / Skipped" branch. This is fine for buildability (the non-gating design absorbs it) but means Phase 2's headline benefit is latent until skills ship. Flag as OPTIONAL clarification.

## Integration Risk

Monorepo fit is clean (single `.agents/` surface, `bkit install` regenerates mirrors). Notable blast-radius items:

1. **Stale `bkit-audit.md` registry block in `workflows.md` (lines 678–699) is Linear-specific AND format-divergent.** It documents a 7-step shape, references Linear/`save_issue`/`save_comment` directly, and — critically — specifies a _different_ finding format: standard markdown headings parsed by regex `^## \[(\w+)\]\[(\w+)\] (.+) — (.+)$`, dedup on `(class, normalized_location)` 5-line bucket. The new draft uses a YAML-frontmatter `finding` block parsed by an `awk` state-machine. The rewrite is not just a step-count bump — the entire Step-4/5 contract prose must be replaced, and the Linear-direct phrasing must be re-expressed via tracker snippets (the live workflows are MCP-snippet-based, tracker-agnostic). Larger surface than "rewrite the block" implies. Also the File Layout tree comment (line 25) + the `/bkit-audit` File Layout table row (lines 39) need updating in lockstep.
2. **`/bkit-audit` already appears in the File Layout table (line 39)** with output `docs/audits/{FID}-audit.md + one Linear sub-issue per workstream` — but there is NO `bkit-audit.md` file in `.agents/workflows/`. The registry currently advertises a workflow that does not exist. Building it closes that drift; the design must also reconcile the "Linear sub-issue" wording to tracker-agnostic phrasing.
3. **Skill-registry curation tension.** `.agents/skills.md` says "Discover via `npx skills find` — do NOT hand-curate" yet carries a curated `## Universal Skills` / `## Project Skills` list, and `/bkit-ship` Step 10 "Prune Skills" removes unlisted `.agents/skills/*`. Auto-installed `audit-*` skills are transient: they will be pruned by the next ship unless registered. The design's reproducibility hedge (version capture in `audit-install-skills.md`) is the right call, but the interaction with ship-prune should be stated so a reader does not expect installed audit skills to persist. Low blast radius (audit is read-only + terminal), but worth a sentence.
4. **11-wide parallel fan-out is 3.6× the largest existing fan-out (3).** Mechanism is identical (`@agent` invocations in one step), but token cost, context-window pressure on the synthesiser (reading 11 × up-to-25 findings + the stack report), and the per-step 3600s timeout envelope are untested at this width. The design's 25-finding cap + roots-summary stack report are the right bounds. No correctness blocker; cost/throughput is a plan-time validation item.
5. **`bkit install` mirror regen** picks up 1 new workflow + 16 new prompts + registry edits → regenerates `.claude/` + `.cursor/`. Standard, batch-at-session-end (per memory). No risk.

## PoC Approach

Minimal proof, under 200 words, to de-risk the two genuinely new mechanisms before full build (do NOT build now):

1. **Clone-and-slug-swap smoke test**: `cp bkit-design.md bkit-audit.md`, `sed design-→audit-`, drop `pnpm install` from Step 2, drop the canonical-copy target from `docs/plans/` to `docs/audits/`. Read the result against `workflows.md` § Common Workflow Anatomy to confirm the ceremony survives the swap. Proves the orchestrator backbone (the ~80% reuse claim).
2. **Skill-install dry-run**: author `bkit-audit-install-skills.md` from the build sibling, hand-run `npx skills find audit-pnpm` / `audit-nextjs` to confirm (a) the CLI responds, (b) whether any `audit-*` skills actually exist in the registry today, (c) install lands in `.agents/skills/`. This single command resolves the latent-benefit and provenance questions.
3. **Universality grep-gate**: write one lens (`reliability`) with no library names; `grep -iE 'pino|winston|zod|joi|pnpm|vitest|next|esbuild' bkit-audit-lens-reliability.md` returns zero. Proves the no-library-names lens is expressible.

If all three pass, the full 16-prompt build is mechanical.

## Unknowns & Blockers

- **Do `audit-*` skills exist in the skills.sh registry today?** (Resolvable in one `npx skills find audit-*` command.) If none exist, Step 4 is a near-permanent no-op in v1 and the enrichment value is deferred to whenever community/bkit authors them. Not a blocker (non-gating), but it reframes Phase 2's headline benefit as latent.
- **Finding-format reconciliation**: the stale registry block's regex format vs the new YAML `finding` block. Pick one at plan time and rewrite the registry contract to match; do not ship two formats.
- **`severity×class` glyph**: the `×` in the design doc must become ASCII inside shipped `.agents/*` files (project rule). Mechanical, plan-time.
- **11-wide token/timeout envelope**: needs an empirical run during build to confirm the synthesiser ingesting 11 lens outputs + the stack report stays inside context + 3600s. No design change anticipated; flag as a build-time validation.
- **Cursor passthrough of the new tool surfaces**: both new agents use tool sets that already exist on shipping agents (`Read,Grep,Glob,Write` and `Read,Grep,Glob,Bash`), so `bkit install` T3 passthrough is proven. No experiment needed.

## Verdict Reasoning

**CONCERNS** (feasible with caveats — design proceeds, findings are addressable).

Everything load-bearing is a clone of a shipping precedent: the orchestrator (`bkit-design.md`), the skill-installer (`bkit-build-install-skills.md`), the read-only lens skeleton (`bkit-design-brainstorm-ideate-1`), and the workstream-issue machinery (`design-organise` + Step 9). The `npx skills find/add` step is feasible — it reuses the exact CLI and agent pattern already in `/bkit-build`, and project-local install means the 11 same-worktree lenses can read the result. The universal-pattern "no library names" lens is expressible and grep-checkable. No FAIL-level infeasibility exists.

It is not a clean PASS because two integration realities need resolution before the design proceeds to plan: (1) the existing `workflows.md` audit block is not merely "stale step count" — it carries a _conflicting finding format_ and Linear-direct phrasing that the rewrite must reconcile, and (2) the headline Phase-2 enrichment benefit depends on `audit-*` skills that may not yet exist in the registry, making Step 4 a likely no-op in v1. Both are addressable; neither breaks buildability.

## CRITICAL

- **Reconcile the finding-format conflict before plan.** The live `workflows.md` audit block (lines 688–697) specifies a standard-markdown finding-heading regex + `(class, normalized_location)` dedup; the new draft specifies a YAML `finding` block + `awk` state-machine. The synthesiser/organise contract and the registry rewrite must use ONE format. Pick the YAML block (it is what the draft's Data Model commits to) and rewrite the registry Step-4/5 contract prose to match — do not leave the regex format documented.
- **The `workflows.md` rewrite is larger than "update step count + table row."** It must (a) replace the 7-step block with the 10-step shape, (b) strip Linear-direct `save_issue`/`save_comment` phrasing in favour of tracker-agnostic snippet references (live workflows are MCP-snippet-based), (c) update the File Layout tree comment (line 25) and the `/bkit-audit` File Layout table row (line 39), all in lockstep. Scope this explicitly in the plan or the registry will diverge from the shipped workflow.

## OPTIONAL

- **State whether `audit-*` skills exist in the registry today** (one `npx skills find` resolves it). If they do not, add a one-line note that Step 4 is expected to no-op in v1 and the enrichment benefit lands when those skills ship — so the value claim is not over-stated. This does not change the design (non-gating is correct regardless).
- **Note the ship-prune interaction**: `/bkit-ship` Step 10 prunes unlisted `.agents/skills/*`; auto-installed `audit-*` skills are transient and reproducibility relies on the version log, not persistence. One sentence in the install-step contract or Risks section.
- **Use the `dispatching-parallel-agents` skill's guidance** (already installed) when authoring the 11-wide Step 5, since it is the only existing fan-out at >3 width is untested; lean on the skill's batching/return-handling advice.

## OUT OF SCOPE

- Authoring the `audit-*` community/bkit skills themselves (named in the brief's knowledge-layering but not in the prompt create-list; the enrichment they provide is what makes Phase 2 valuable but is downstream work).
- Phase 3 WebSearch augmentation (`--with-websearch`) — explicitly deferred by the brief; the design correctly leaves a slot only.
- Empirical 11-wide token/timeout tuning — a build/run-time validation, not a design decision.
- Deletion of the legacy `bkit-utility-audit-*` prompts (deprecation header only in v1).
- `Audit` phase-label creation — design defaults to no label, matching the live registry block; resolve at organise/build per the live `workflows.md` § Phase labels convention.
