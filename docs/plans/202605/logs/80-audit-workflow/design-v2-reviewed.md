Verdict: PASS

<!-- verdict:end -->

# Design: `/bkit-audit` Workflow (Pass 3, review-applied) — UI/UX + Reference-Signal + Tier-1 Domain Gaps + Conditional-Lens Keystone

> This is a **complete, self-contained** design that supersedes `docs/plans/202605/80-audit-workflow-design.md` (Pass 2). It preserves the proven 10-step / 16-agent backbone (orchestrator + 2 enrichment agents + 11 lenses + synthesise/organise/summary), the enrichment-never-gates failure-isolation contract, the YAML `finding`-block schema, the `audit-stack.md` versioned schema, the `## Parse Errors` + `## Missing Lenses` Step-6 gate, the post-copy canonical assertion at Step 10, and the read-only ad-hoc-only "terminal at In Review" posture. Pass-3 layers in: a **minimal conditional-lens keystone** (`audit-stack.md ## Applicability` flag block + per-lens `requires:` frontmatter + a new `N/A — not applicable` third coverage state), **5 new lens slots** (`ui-ux`, `supply-chain`, `data-layer`, `ai-llm`, `reference-signal`), a new opt-in `--with-websearch` orchestrator flag, and two operator escape hatches (`[lenses=...]`, `[applicability-override=flag=bool]`). Pipeline stays 10 steps; subagent count grows 16 → 21 (1 stack-detect + 1 skill-install + 16 lenses + synthesise + organise + summary).
>
> **Pass-3 review pass applied (this version v2):** five CRITICAL gaps from design-review-1 (buildability) and design-review-2 (operability) are resolved in-text. The resolution markers are embedded next to the relevant clauses so the next reviewer can verify by greppable token:
>
> - **R1-B1** — Step-6 gate canonical 16-slug list pinned (single source of truth = workflow file Step 6 inline list; synthesiser prompt enum + `## Applicability — Flag Inventory` derive from it via plan-time grep-assert). See § Components & boundaries — Orchestrator, § Data Model — `## Missing Lenses`, § Step-by-step flow, § WS-K, § WS-6Δ.
> - **R1-B2** — Reference-signal down-rank check pinned as an **in-agent `organise` self-verify** (matches the existing orphan / DAG-cycle self-verify pattern in `bkit-design-organise`; NOT an orchestrator post-step gate). See § Components — Organise, § Data Model — Down-rank rule, § WS-5Δ.
> - **R1-B3** — Rendered finding-format tokens **locked**: organise's renderer MUST echo the YAML `finding` fence verbatim into the rendered report (top-section blocks reproduce the source's `source:` / `confidence:` fields character-for-character) so the literal string match `source: reference-repo` / `confidence: low` is sound. See § Data Model — Down-rank rule, § Components — Organise, § WS-5Δ.
> - **R2-O1** — Synthesiser MUST post-process every `bkit-audit-lens-reference-signal` finding block and add any block missing `source: reference-repo` OR missing `confidence: low` to `## Parse Errors` with the raw block + reason "reference-signal finding missing required source/confidence field". Closes the field-omission bypass. See § Components — Synthesiser, § Data Model — `## Parse Errors`, § WS-4Δ.
> - **R2-O2** — `[lenses=...]` restricted-launch semantics specified: (a) excluded slots emit a `# Not Applicable (excluded by [lenses=...] operator)` stub so the fixed 16-slot `status.json` array invariant + `## Missing Lenses` row-per-slot grep-assert continue to hold; (b) orchestrator **deletes any stale `audit-lens-*.md` artifacts in the worktree before Step 5 launches** (whether full or restricted), so the synthesiser never mixes fresh and stale findings. See § Components — Orchestrator, § Step-by-step flow Step 5, § WS-6Δ.
>
> OPTIONAL items merit-applied in this review pass: universality grep-gate regex extended for the 5 new lenses' lexical surfaces (review-1 OPTIONAL #1 — UI framework / design-system / LLM-provider tokens); `requires:` key documented under `.agents/prompts.md` § Frontmatter Conventions (review-1 OPTIONAL #3); `[lenses=...]` recovery-hint added to the Step-5 Failure Path comment (review-2 O-3); `supply-chain` Bash allowlist tightened (drop `awk`) + honest-caveat "discipline-not-sandbox" wording added in prompt body and registry row (review-1 OPTIONAL #2). Other OPTIONAL items (review-1 OPTIONAL #4–6, review-2 O-1/O-2/O-4/O-5/O-6) are accepted on merit; see § Optional Items Applied vs Declined for per-item disposition.

## Acceptance Scenario

### Narrative

A developer invokes `/bkit-audit` (ad-hoc, peer to `/bkit-design`) on any repository — a UI-less library like bkit itself, a Next.js + Postgres web app with an LLM integration, or a polyglot monorepo. The workflow detects the stack, raises applicability flags, opportunistically installs matching `audit-*` skills, and fans 16 lenses out in parallel — conditional lenses self-no-op (recorded as **N/A — not applicable**, distinct from "ran clean") when their surface is absent, the optional reference-signal lens runs only when `--with-websearch` is passed and emits findings ranked strictly below internal-evidence. The run terminates at `In Review` with a single severity x class report at `docs/audits/{FID}-audit.md` and one tracker sub-issue per workstream.

### Success Criteria

1. `/bkit-audit` ships as a **10-step** orchestrator (peer to `/bkit-design`) with full FID / lock / status.json / gate / per-step tracker comment / Failure Path ceremony; ad-hoc-only; terminal at `In Review`.
2. Step 5 fans out **16 lens slots**; the orchestrator launches all 16, gated lenses self-no-op when their `requires:` flag is false, and `## Missing Lenses` records every slot in one of three explicit states (`ran` | `N/A — not applicable ({flag}=false)` | `crashed`).
3. Lens prompts are library-name-free: `grep` for ecosystem tokens across `.agents/prompts/bkit-audit-lens-*.md` returns zero matches; stack-specificity arrives only via `audit-stack.md` + installed `audit-*` skills + the target repo's `.agents/docs.md`. **Pass-3 (review-1 OPTIONAL #1):** the regex set is extended to cover the new lenses' lexical surfaces — Pass-2 set (`pino|winston|zod|joi|pnpm|vitest|next|esbuild` etc.) PLUS UI framework / design-system names (`react|vue|svelte|solid|lit|preact|tailwind|bootstrap|material|chakra|shadcn|mui|radix|antd`), DB-platform names (`postgres|mysql|sqlite|mongo|redis|prisma|drizzle|sequelize|kysely|typeorm|knex`), LLM-provider names (`openai|anthropic|cohere|langchain|ollama|together|replicate`), and CI-platform names that aren't intrinsic semantic tokens (`actions|github-actions|gitlab|jenkins|circleci|bitbucket` — but allowing intrinsic CI semantic tokens like `pull_request_target` / `workflow_dispatch` as documented exceptions for the `supply-chain` lens only, since they describe a CI feature surface universally, not a vendor name). Grep gate FAILs at plan time on any match outside the documented exceptions.
4. Reference-signal findings (when present) are demonstrably ranked **strictly below all internal-evidence findings** — never top/critical in the matrix top row, never in the ranked-list top three, never in the executive summary — and the constraint is enforced by a grep-assertion at the organise self-verify.
5. An audit run on bkit's own repo (no UI, no DB, no LLM, no public web surface) **no-ops cleanly**: `ui-ux`, `data-layer`, `ai-llm` rows in `## Missing Lenses` read `N/A — not applicable ({flag}=false)`, NOT `ran clean`; the `supply-chain` lens runs (CI present); the audit terminates with a valid report.

### Key Edge Cases

- **False-negative applicability flag (silent miss):** stack-detect mis-reads a Next.js repo as `hasWebSurface: false` → UI/UX lens is gated off → `## Missing Lenses` shows `N/A — not applicable (hasWebSurface=false)` on a repo the operator knows has a UI. Mitigations layered: (a) `confidence: low` from stack-detect already routes Step 3 to CONCERNS; (b) inverse-evidence guard — if a flag is false but `audit-stack.md frameworks: []` contains a known UI-shaped token OR `public/` / `src/app/` / `src/pages/` paths exist, stack-detect raises CONCERNS with a `## Applicability Disagreement` note; (c) `[applicability-override=hasWebSurface=true]` re-invocation lets the operator force the lens to run without hand-editing artifacts.
- **False-positive applicability flag (noise findings):** flag is true on a repo where the surface is absent → lens runs, emits noise findings against non-existent files. Each conditional lens carries a `**Lens discipline:**` sanity probe — if its first-pass probe finds zero matching files even though the flag is true, it emits empty body + `# Not Applicable\n\nReason: flag=true but no surface evidence` and exits, instead of inventing findings. The 25-finding cap and explicit `location:` fields make noise identifiable to the human reader if any leaks through.
- **Reference-signal non-reproducibility (network signal):** two `--with-websearch` runs on the same commit can consult different popular reference repos and surface different divergences. The reference-signal lens captures (a) which repos were consulted + their commit/tag, (b) the search query used, in a `## Reference Repos Used` section of its output — same provenance discipline as `audit-install-skills.md`. Reproducibility is "explainable", not "identical".
- **Supply-chain lens needs `Bash`, no other lens does (tool-surface heterogeneity):** the new `supply-chain` lens is the only Step-5 leaf with `Bash` in its tool surface (for git-history secret-scan and lockfile-integrity walks). Its prompt body pins `Bash` to a documented read-only allowlist (`git log`, `git rev-parse`, `git cat-file`, `cat`, `jq`, `grep`; explicitly NO `git checkout` / `reset` / `push` / `commit`; **review-1 OPTIONAL — `awk` dropped from the allowlist (full-Turing; `grep` + `jq` cover the parsing surface)**) and the universality-of-tool-surface invariant is relaxed for this single lens, justified once in `.agents/prompts.md` § Tool set patterns. **Honest caveat: the allowlist is prompt-author discipline, NOT a runtime sandbox** — the host tool surface still grants raw `Bash`; if a future lens author adds `git push` to the allowlist body, the runtime will not reject it. This caveat is written into the lens prompt body AND into the `.agents/prompts.md` § Tool set patterns sub-row, so a future edit can't silently widen the allowlist without an in-prompt warning marker (review-1 OPTIONAL #2).
- **AI/LLM lens self-reference on bkit:** running the `ai-llm` lens on a repo whose own source ships LLM prompt files (e.g. `.agents/prompts/*.md`) could mis-classify those prompts as "unvalidated model I/O surfaces". The lens prompt explicitly scopes its probes to runtime LLM-integration paths (model SDK calls, prompt-construction in product code) and excludes agent/skill/prompt assets in `.agents/**`, `.cursor/**`, `.claude/**`. Documented exclusion expectation lives in the lens prompt body.
- **Fan-out width vs Opus cost (scale):** 16 lens slots all at `opus / effort: high` is roughly 4.5× the design-triplet token cost (acknowledged by comment 4539759063 §2). The Sonnet-downgrade lever stays the documented future escape if cost binds; not exercised this pass.
- **Concurrent / re-audit:** `/bkit-audit BAR-NNN` while the issue's feature FID lock is held → re-audit FID gains an `-audit-{YYYYMMDD-HHmm}` suffix; lineage preserved via FID prefix (carried from Pass 2).
- **Ship-prune transience of installed `audit-*` skills:** `.agents/skills.md` is curated manually and `/bkit-ship` Step 10 "Prune Skills" removes unlisted `.agents/skills/*`. Auto-installed `audit-*` skills are transient by design — reproducibility relies on `audit-install-skills.md` version capture, not on skill persistence. Pass 3 surfaces 4+ new conditional skill-token classes (`audit-{ui,db,llm,supply-chain}-*`) without changing the prune posture.

## Architecture

Two-layer separation per `.agents/workflows.md` § Two-Layer Separation Rules — orchestrator owns tracker / git / lock / status.json; **all** subagents are leaves that write to disk and never call the tracker. Pipeline is a 10-step clone of `/bkit-design`'s shape with two enrichment steps before the parallel fan-out — preserved verbatim from Pass 2. Pass-3 changes are localised to (a) stack-detect's output schema (`schemaVersion` bumps to 2; new `## Applicability` block), (b) Step 5 fan-out width (11 → 16 slots + conditional gating + opt-in network slot), (c) synthesise/organise/summary's down-rank + N/A handling, (d) orchestrator input parsing (new `--with-websearch`, `[lenses=...]`, `[applicability-override=...]` flags).

```
/bkit-audit [target?] [skills=false?] [--with-websearch?] [lenses=slug,slug?] [applicability-override=flag=bool?]
   │
   ├── Step 1  Start Workflow         (lock, FID, tracker init, master-comment seed)
   ├── Step 2  Worktree Setup         (.worktrees/{FID}/, audit-input.md, status init; NO pnpm install)
   ├── Step 3  Stack Detect           → @bkit-audit-stack-detect → audit-stack.md (now incl. ## Applicability block)
   │       └── reads manifests/configs/lockfiles/CI; emits schemaVersion: 2; sets applicability flags + applicability-override merge
   ├── Step 4  Skill Install          → @bkit-audit-install-skills → audit-install-skills.md
   │       └── reads audit-stack.md; npx skills find/add audit-{token}; best-effort, non-gating; 10-skill cap
   ├── Step 5  Lens Audits (parallel) → 16 × @bkit-audit-lens-{slug} → audit-lens-{slug}.md
   │       └── orchestrator launches ALL 16 slots; each lens self-no-ops if its `requires:` flag is false
   │       └── --with-websearch flips hasNetwork=true ⇒ reference-signal lens activates
   ├── Step 6  Synthesise             → @bkit-audit-synthesise → audit-v1-synthesis.md
   │       └── cross-lens dedup + ## Missing Lenses (3 states) + ## Parse Errors + reference-signal down-rank
   ├── Step 7  Organise               → @bkit-audit-organise → audit-v2-ranked.md
   │       └── matrix + ranked list + per-class appendix + WS-N DAG + below-internal grep-assert
   ├── Step 8  Summary                → @bkit-audit-summary → audit-summary.md (500-token cap; push feat)
   ├── Step 9  Workstream Issues      (spawn/sync one sub-issue per WS-N; blocked-by edges)
   └── Step 10 Close Workflow         (cp v2 → docs/audits/{FID}-audit.md; post-copy assert; squash-merge dev; In Review; HARD STOP)
```

### Components & boundaries

- **Orchestrator** (`.agents/workflows/bkit-audit.md`) — Steps 1, 2, 9, 10 are slug-swapped clones of `bkit-design.md` Steps 1, 2, 9, 10 (`design-` → `audit-`); Steps 3–8 reuse the design fan-out / verdict-extract / status-commit / comment-append ceremony 1:1. Step 2 drops `pnpm install --frozen-lockfile` (read-only audit). Step 5 fan-out Context: "You are a subagent in the Audit phase running in parallel with 15 other agents." Step 10 Close retains the post-copy assertion (review-2 O-4). Pass-3 deltas: input parsing for `--with-websearch` / `[lenses=...]` / `[applicability-override=...]`; Step 5 fan-out launches 16 fixed slots (not variable, even under `[lenses=...]` — excluded slots emit operator-exclusion stubs per R2-O2 below); Step 5 gate counts artifacts against the 16-slot manifest in `status.json#steps[5].artifacts`; Step 6 grep-assert extends to the third coverage state.
- **R1-B1 — Step-6 gate canonical-list source of truth.** The 16-slug list lives **inline in the `bkit-audit.md` workflow file Step 6 grep-assert block** (matches `.agents/workflows.md` § Workflow Authoring Rules: Self-contained — inline the rule). The synthesiser prompt enum and the lens-prompt `requires:` value union are **derived** views of that list: a plan-time grep-assert (added to WS-K Done-When) walks `.agents/workflows/bkit-audit.md` (Step 6 inline 16-slug enum) + `.agents/prompts/bkit-audit-synthesise.md` (hardcoded slug enum) + `.agents/prompts/bkit-audit-lens-*.md` (`requires:` frontmatter value union, with `always` mapped to the universal-11 lens slug set) and FAILs if the three lists disagree. The workflow file is the canonical source; the other two are checked as derived. This resolves the under-spec gap in review-1 CRITICAL #1 (Stack Feasibility (a)).
- **R2-O2 — Pre-Step-5 stale-artifact cleanup.** At the start of Step 5 (BEFORE launching any lens subagent — full fan-out OR `[lenses=...]` restricted launch), the orchestrator deletes every existing `audit-lens-*.md` file in the worktree (`rm -f docs/plans/{YYYYMM}/logs/{FID}/audit-lens-*.md`). This guarantees the synthesiser at Step 6 never reads a stale lens artifact from a prior run. The cleanup is unconditional — same code path full or restricted — so the operator does not need to remember to clean the worktree between re-invocations. Documented in the workflow file Step 5 pre-launch block.
- **R2-O2 (cont.) — `[lenses=...]` excluded-slot stubs.** Under a restricted launch, the orchestrator launches only the listed slugs as lens subagents AND additionally writes a deterministic `# Not Applicable (excluded by [lenses=...] operator)\n\nReason: not in [lenses=...] launch set\n` stub artifact for each of the 16 - len(lenses-list) excluded slots. The stub is generated by the orchestrator directly (not a subagent — trivial deterministic file write), so the Step 5 fan-out's launch concurrency budget covers only the launched slugs while the `status.json#steps[5].artifacts` 16-entry array invariant + Step 6 row-per-slot grep-assert continue to hold. The synthesiser parses these stubs the same as `# Not Applicable`-flag bodies but renders the `## Missing Lenses` row as `{slug}: N/A — excluded by [lenses=...] operator` (a fourth N/A reason-string variant; the state token `N/A — not applicable (` covers both `flag=false` and `excluded by`). Slug-unknown entries in `[lenses=...]` (typo) — pre-validated at Step 2 input parse: orchestrator FAILs Step 2 with `Re-invoke with [lenses=...] restricted to: {comma-separated 16-slug list}.` recovery hint.
- **Stack-detect agent** (`bkit-audit-stack-detect`) — Pass-3 changes: `schemaVersion: 2`; emits a new `## Applicability` block with five named booleans (`hasWebSurface`, `hasDb`, `hasLLM`, `hasCi`, `hasNetwork`); emits a `## Applicability — Flag Inventory` enum block (the canonical flag-name list, greppable for the plan-level universality guard); ingests `applicability-override` input flag and merges it AFTER auto-detection with an audit-trail line in `## Applicability Overrides`; raises a `## Applicability Disagreement` block + CONCERNS verdict when auto-detected flag conflicts with strong inverse evidence (e.g. `hasWebSurface=false` but `frameworks` contains a UI-shaped token).
- **Skill-install agent** (`bkit-audit-install-skills`) — UNCHANGED from Pass 2. Reuses build/ship machinery verbatim (comment 4539759063 §1); 10-skill cap; data-driven `audit-{token}` queries; intermediate progress to stdout (one line per query, review-2 O-2); honours `[skills=false]`; ship-side prune of `audit-*` skills lives in `/bkit-ship`'s Prune Skills allowlist (already covered by virtue of "removes unlisted `.agents/skills/*`"; verify at build time).
- **Lens subagents (16, +5 over Pass 2)** — each forked from the `bkit-design-brainstorm-ideate-1` read-only-reviewer skeleton. **11 universal lenses unchanged** (`architecture`, `hotpath`, `config`, `reliability`, `observability`, `debt`, `dead-code`, `deps`, `security`, `tests`, `docs-drift`). **5 new lenses added** with new `requires:` frontmatter key:

<!-- prettier-ignore -->
  | Slug | `requires:` flag | Class | Tool surface | Universal-pattern probe (no library names) |
  | --- | --- | --- | --- | --- |
  | `ui-ux` | `hasWebSurface` | maintainability | `Read, Grep, Glob, Write` | Responsive mechanisms (viewport meta, fluid units), typography floors (rem-based base, line-height), a11y (semantic landmarks, ARIA misuse, alt text, focus order), contrast-from-tokens (declared design tokens vs WCAG ratios), design-system adherence (component reuse vs ad-hoc style), i18n (string externalisation), layout-shift risks. |
  | `supply-chain` | `hasCi` (defaults true) | security | `Read, Grep, Glob, Bash` (allowlisted: `git log` / `git rev-parse` / `git cat-file` / `cat` / `jq` / `grep`; NEVER `git checkout` / `reset` / `push` / `commit`; `awk` dropped per review-1 OPTIONAL #2) | Pipeline hardening (unpinned Action SHAs, `pull_request_target` misuse, over-broad workflow token perms, secret-in-logs); supply chain (lockfile integrity, postinstall scripts, typosquat/dep-confusion signals, committed-secret git-history scan, SBOM/provenance gaps). |
  | `data-layer` | `hasDb` | performance | `Read, Grep, Glob, Write` | N+1 access patterns, missing indexes, unbounded queries (no LIMIT/pagination), transaction / idempotency gaps, migration safety (locking statements, destructive without backfill). |
  | `ai-llm` | `hasLLM` | security | `Read, Grep, Glob, Write` | Prompt-injection surfaces, unvalidated model I/O, PII/secrets to providers, token-cost controls, model-version pinning, eval coverage. EXCLUDES `.agents/**` / `.cursor/**` / `.claude/**` (agent-asset prompts are not product LLM surfaces). |
  | `reference-signal` | `hasNetwork` | maintainability | `Read, Grep, Glob, WebSearch, Write` | Detect stack → consult top-3 popular reference repos (structure / config / README only) → flag shared-convention divergence as **soft external signal**. Always emits `confidence: low` + `source: reference-repo`; captures `## Reference Repos Used` provenance. |

All 16 lens prompts: standalone-runnable, library-name-free, capped at 25 findings severity-sorted, emit YAML `finding` blocks, `model: claude-opus-4-7` / `effort: high` (comment 4539759063 §2 — no Sonnet downgrade), maxTurns tier M (50). Each carries (1) `Role:` line `Senior auditor — {slug} lens.`, (2) `**Lens discipline:**` clause forbidding library names + (for conditional lenses) sanity-probe-before-emit clause, (3) inlined universal probe block, (4) Read instructions for `audit-stack.md` (+ applicability flag assertion for conditional lenses) + target `.agents/docs.md` + `docs/knowledge.md` + installed `audit-*` skills, (5) YAML `finding`-block output format, (6) `Lens: {slug} — {one-line summary}.` line under H1.

- **Synthesiser** (`bkit-audit-synthesise`) — clone of `bkit-design-generate` shape. Pass-3 deltas: `## Missing Lenses` now renders **three explicit states** per of the 16 slots (`ran` | `N/A — not applicable ({flag-name}=false | excluded by [lenses=...] operator)` | `crashed ({reason})`); cross-lens dedup honours `source: reference-repo` so an external-signal finding never dedupes-up a legitimate internal finding's `confidence`; `## Parse Errors` section unchanged for general parsing failures (raw block + reason; body `None` when clean). **R1-B1 — Synthesiser slug enum is the derived view of the workflow Step 6 inline 16-slug list:** the synthesiser prompt body still hardcodes the 16 slugs (so it parses the lens artifact set without an external read), but a plan-time grep-assert (WS-K Done-When) verifies the synthesiser enum matches the `bkit-audit.md` Step 6 inline list character-for-character; divergence FAILs the plan-time gate. **R2-O1 — Reference-signal field-omission post-process (closes the down-rank field-omission bypass):** after parsing all 16 lens artifacts, the synthesiser identifies the `audit-lens-reference-signal.md` artifact (by filename — fixed slot) and for every `finding` YAML-block it parsed out of that artifact, asserts both (i) `source: reference-repo` is present and (ii) `confidence: low` is present. Any block missing either field is treated as a reference-signal contract violation and added to `## Parse Errors` with the raw block + reason "reference-signal finding missing required source/confidence field"; the offending block is ALSO dropped from the synthesis body (NOT silently promoted to the internal-findings pool). This guarantees a structurally-valid-but-unmarked reference-signal finding cannot reach the organise step under a default internal-finding classification. Pairs with the in-agent organise down-rank self-verify (R1-B2) — between the two, both omission AND mis-rendering are caught.
- **Organise** (`bkit-audit-organise`) — clone of `bkit-design-organise` shape. Pass-3 deltas: ranking algorithm applies a hard fence — `source == reference-repo` OR `confidence == low` findings are excluded from the matrix top row (CRITICAL/HIGH columns), from the ranked-list top 3, and from the per-class appendix's leading entries. **R1-B2 — Down-rank enforcement runs as an in-agent self-verify (mirrors the existing orphan / DAG-cycle self-verify pattern in `bkit-design-organise`, NOT an orchestrator post-step gate).** The organise prompt body adds two checklist clauses at its self-verify section: (i) after rendering `audit-v2-ranked.md`, grep the matrix top row + ranked-list top-3 + per-class appendix leading entries + executive summary "top findings" block for the literal strings `source: reference-repo` AND `confidence: low`; non-empty match in any of those blocks ⇒ self-verify FAIL → organise emits verdict FAIL with the offending line(s) cited; (ii) the orchestrator's Step-7 verdict-extract treats organise FAIL as Failure Path (no new orchestrator gate needed — the existing verdict-extract path already routes FAIL). Tool surface: organise already has `Bash` (inherited from `bkit-design-organise` for the self-verify shell commands); no tool-surface change. **R1-B3 — Rendered finding-format tokens locked.** The organise rendering MUST echo the YAML `finding` fence verbatim into the rendered `audit-v2-ranked.md` report so the literal-string self-verify match is sound. Concretely: organise renders each finding in the matrix top row, ranked-list top-3, per-class appendix leading entries, and executive summary by reproducing the source YAML block character-for-character inside a markdown `` `finding` `` fence (NOT by reformatting `source = reference-repo`, NOT by collapsing into an inline bullet, NOT by stripping fields). The prompt body specifies: "When rendering a finding in any audit report block, copy the original `finding` YAML fence verbatim from the synthesis input; preserve `source:` and `confidence:` field order and indentation; do NOT inline-reformat YAML field syntax." The self-verify grep then binds to the documented rendered surface (literal `source: reference-repo` and `confidence: low` tokens at start-of-line within fenced blocks) and cannot suffer false-negative on renderer reformatting drift. This locks the renderer-grep contract.
- **Summary** (`bkit-audit-summary`) — UNCHANGED from Pass 2; 500-token Linear-bound cap. The down-rank rule is enforced upstream by organise — summary just reads `audit-v2-ranked.md`'s top-of-list.

### Integration points

- **Tracker layer (orchestrator only)** — issue init / reuse, master-comment seed + per-step append, workstream sub-issue spawn/sync (Step 9), state → `In Review` at close. No new `Audit` phase label (Pass 2 decision preserved). MCP-only writes (no `gh api`, no raw HTTP) — per `.agents/workflows.md` § Tracker Integration.
- **`npx skills` CLI + `find-skills` skill** — leaned on at Step 4; first network surface. UNCHANGED.
- **WebSearch / GitHub-search at Step 5** — the second network surface, opt-in via `--with-websearch` ⇒ `hasNetwork=true` ⇒ `reference-signal` lens activates. Without the flag the lens self-no-ops as `N/A — not applicable (hasNetwork=false)`. Document explicitly: **network surface count grows 1 → 2** when `--with-websearch` is on (this contradicts Pass 2's "the only network surface in the pipeline, isolated to Step 4" — the prose must be updated, see WS-7Δ).
- **Registry edits** — `.agents/prompts.md` (Models rows for 5 new lenses + Audit Phase section + universality invariant + supply-chain Bash-allowlist note + reference-signal tool surface), `.agents/workflows.md` (registry block for `bkit-audit.md` — Pass-2's full 10-step shape extended to document the 16-slot fan-out + applicability gating + N/A coverage state + `--with-websearch` flag + escape hatches), `.agents/docs.md` (unchanged for Pass 3 — Workflow Matrix already has Audit column from Pass 2).
- **`bkit install`** — picks up new prompts + workflow updates at session end (batch, not per-edit — per project memory).

## Data Model

### `audit-stack.md` — schema bump from v1 → v2 (Pass-3 additions)

Owned by `bkit-audit-stack-detect.md`. Pass 2's `## Stack` and `## Detection Coverage` blocks are unchanged. Pass 3 adds four new blocks and bumps `schemaVersion: 1` → `schemaVersion: 2`. Lenses assert `schemaVersion >= 2` and degrade (annotate context, run universal probes, treat absent flag as `false` with a `## Missing Lenses` reason of `unknown applicability — stack-detect schema mismatch`) on v1.

```markdown
# Audit Stack Report

schemaVersion: 2

## Stack

[unchanged from Pass 2: language, runtime, packageManager, frameworks, buildTools, testRunner, ci, deployment, db, orm — all known keys with `unknown` / `[]` permitted]

## Detection Coverage

[unchanged from Pass 2: filesScanned, packagesFound, unknownFieldCount, confidence: high|medium|low, notes]

[**Review-2 O-4 (additive optional field, no schema bump):** stack-detect MAY emit `heuristicDepthLimit: <int>` (typically 3 or 4 — the depth at which the applicability heuristics ran). Emitted ONLY when a depth-limited probe was the binding constraint that produced an unmatched flag (e.g. probed `src/`, `pages/`, `src/app/` to depth 3, found nothing → `hasWebSurface: false` AND `heuristicDepthLimit: 3` emitted together). Consumed by the inverse-evidence guard and surfaced in the Step 3 tracker comment one-liner so the operator knows whether a deeper probe might change the answer. Absent when not relevant.]

## Applicability

hasWebSurface: true # frontend/UI present → drives ui-ux lens
hasDb: true # database present → drives data-layer lens
hasLLM: false # LLM/model integration present → drives ai-llm lens
hasCi: true # CI workflows present → drives supply-chain lens (defaults true if .github/workflows/ OR equivalent CI manifest detected)
hasNetwork: false # orchestrator-set from --with-websearch → drives reference-signal lens

## Applicability — Flag Inventory

[Canonical, greppable, enumerated list of every defined applicability flag — the universality guard. Plan-level grep-gate asserts every conditional lens's `requires:` value appears in this list.]

- hasWebSurface
- hasDb
- hasLLM
- hasCi
- hasNetwork

## Applicability Overrides

[Audit trail. Empty when no overrides supplied. One line per orchestrator-supplied `[applicability-override=flag=bool]`.]
None.

# OR

- hasWebSurface: true (override; auto-detected false; supplied via --applicability-override at {ISO_TIMESTAMP})

## Applicability Disagreement

[Inverse-evidence guard. Emitted only when auto-detected flag conflicts with strong evidence. Forces step verdict to CONCERNS.]
None.

# OR

- hasWebSurface: false (auto) but `frameworks` contains `next` AND `src/app/` exists → inverse-evidence disagreement; operator should investigate or re-invoke with --applicability-override=hasWebSurface=true.
```

**Applicability detection heuristics (evidence-based, encoded in the stack-detect prompt body):**

- `hasWebSurface`: any of (`frameworks` contains a UI-shaped token like `next` / `nuxt` / `astro` / `remix` / `sveltekit` / `vite` / `cra` / `gatsby`; OR `package.json` declares `react` / `vue` / `svelte` / `solid` / `lit` / `preact` as a direct dep; OR `public/` / `src/app/` / `src/pages/` / `pages/` directory exists; OR any `*.html` / `*.vue` / `*.svelte` / `*.astro` source file at depth <= 3).
- `hasDb`: any of (`db` field non-empty; `orm` field non-empty; `package.json` direct dep matches `pg` / `mysql2` / `sqlite3` / `better-sqlite3` / `mongodb` / `pgx` / `drizzle-orm` / `prisma` / `typeorm` / `sequelize` / `kysely` / `knex`; OR `*.sql` migration files at depth <= 4; OR `prisma/schema.prisma`).
- `hasLLM`: any of (`package.json` direct dep matches `openai` / `@anthropic-ai/sdk` / `langchain` / `@langchain/*` / `vercel/ai` / `ollama` / `together-ai` / `replicate`; OR Python pyproject/requirements equivalents; OR env vars in `.env*` examples match `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` / `OLLAMA_*`).
- `hasCi`: any of (`.github/workflows/*.yml` exists; OR `.gitlab-ci.yml`; OR `bitbucket-pipelines.yml`; OR `.circleci/config.yml`; OR `Jenkinsfile`). Defaults TRUE if any signal present — gate is permissive (most repos have one).
- `hasNetwork`: orchestrator-set only; auto-detection always emits `false`. The `--with-websearch` input flag flips it to `true`.

The detection heuristics list is part of the stack-detect prompt body (single source of truth); each lens's `requires:` frontmatter cites a flag name from `## Applicability — Flag Inventory`. Lens authors do NOT re-implement detection.

### Per-lens frontmatter — `requires:` key (Pass-3 addition)

Existing frontmatter fields per `.agents/prompts.md` § Frontmatter Conventions (`name`, `description`, `model`, `effort`, `tools`, `maxTurns`) are unchanged. One new key, **`requires:`**, lands on every lens prompt:

<!-- prettier-ignore -->
| `requires:` value | Meaning |
| --- | --- |
| `always` | Unconditional — the 11 universal lenses set this. Lens runs every invocation. |
| `hasWebSurface` | Conditional on `audit-stack.md ## Applicability hasWebSurface: true`. UI/UX lens. |
| `hasDb` | Conditional on `audit-stack.md ## Applicability hasDb: true`. Data-layer lens. |
| `hasLLM` | Conditional on `audit-stack.md ## Applicability hasLLM: true`. AI/LLM lens. |
| `hasCi` | Conditional on `audit-stack.md ## Applicability hasCi: true` (defaults true). Supply-chain lens. |
| `hasNetwork` | Conditional on `audit-stack.md ## Applicability hasNetwork: true` (set only by `--with-websearch`). Reference-signal lens. |

Pass-3 universality guard (additive to the existing zero-library-names grep-gate): every `requires:` value in `.agents/prompts/bkit-audit-lens-*.md` MUST appear in `## Applicability — Flag Inventory` (greppable assertion at build/plan time). Catches renamed/typo'd flags before they silently disable a lens.

### Per-finding schema — `finding` block (UNCHANGED contract; one Pass-3 additive field)

The YAML-frontmatter fenced `finding` block from Pass 2 is the canonical and only format. Pass 3 adds **one optional field** — `source:` — used by the `reference-signal` lens only. Existing lenses do not emit `source:`; parsers MUST default-tolerate its absence.

````markdown
```finding
severity: CRITICAL          # CRITICAL | HIGH | MEDIUM | LOW
class: reliability          # maintainability | performance | compatibility | reliability | operability | security | testability
location: src/lib/db.ts:42  # file:line OR file:start-end OR pattern
what: broad catch swallows DB lock errors
why: Lock contention fails silently; user sees stale data
direction: Narrow catch to known recoverable errors; log + rethrow on others
confidence: high            # high | medium | low
source: internal            # OPTIONAL — internal (default, omitted) | reference-repo (set only by reference-signal lens)
```
````

**Down-rank rule (machine-enforceable contract):** `source == reference-repo` OR `confidence == low` ⇒ finding NEVER appears in: matrix top row (CRITICAL/HIGH columns), ranked-list top 3, executive summary "top findings" block, per-class appendix leading entries. Enforced as an **in-agent organise self-verify grep-assert** (R1-B2 — mirrors the existing orphan / DAG-cycle self-verify discipline in `bkit-design-organise`; runs INSIDE the organise agent's prompt body, NOT as an orchestrator post-step gate). The synthesiser preserves these findings in `audit-v1-synthesis.md`; organise demotes them at render time and self-verifies the demotion before emitting its verdict.

**R1-B3 — Locked rendering surface the grep binds to.** The organise renderer emits each finding by echoing its source YAML `finding` fence verbatim — `source: reference-repo` (when present) and `confidence: low` are rendered character-for-character at the start of their respective lines inside the fenced block. The literal-string grep is sound BECAUSE the renderer is contractually pinned to this verbatim-echo shape. Any future renderer change MUST preserve the literal `source: reference-repo` and `confidence: low` tokens in rendered top blocks; the prompt body says so explicitly and the self-verify catches any rendering regression at organise-time.

**R2-O1 — Reference-signal field-omission gate.** The down-rank fence above only fires when `source:` / `confidence:` fields are PRESENT on a finding. A `bkit-audit-lens-reference-signal` finding that omits either field entirely would bypass the fence (it would look like an internal `confidence: high` finding to the renderer). The synthesiser closes this with a post-process step on the reference-signal lens artifact: every `finding` block from that artifact is checked to contain BOTH `source: reference-repo` AND `confidence: low`; any block missing either is added to `## Parse Errors` (with raw block + reason "reference-signal finding missing required source/confidence field") AND dropped from the synthesis body. The organise step therefore never receives a reference-signal finding without the fence tokens.

Parse-error surfacing (`## Parse Errors`) and `awk` state-machine parsing (`/^```finding$/,/^```$/`) are UNCHANGED from Pass 2 in their general behaviour. Pass-3 R2-O1 adds the reference-signal-specific post-process check as a new contributor of parse-error entries (with the documented reason string above); the `## Parse Errors` body `None` semantics are unchanged (None when both general parsing AND reference-signal field-omission post-process find nothing).

### `## Missing Lenses` — three explicit coverage states (Pass-3 keystone)

Pass 2's two-state manifest (`ran` vs implicit `crashed`) is replaced by a three-state, one-row-per-slot manifest. The synthesiser reads (a) the list of 16 lens slots from its own prompt body (a hardcoded enum — **R1-B1: the canonical source of truth for the 16-slug list is the `bkit-audit.md` workflow file Step 6 inline enum; the synthesiser's hardcoded copy is a derived view, kept in sync by a plan-time grep-assert that walks workflow Step 6 + synthesiser prompt + lens-prompt `requires:` value union and FAILs on divergence**), (b) each slot's artifact (`audit-lens-{slug}.md`), and (c) the `audit-stack.md ## Applicability` block as context.

```markdown
## Missing Lenses

[Fixed format. One row per of the 16 slots, always present, exactly one of three states.]

- architecture: ran
- hotpath: ran
- config: ran
- reliability: ran
- observability: ran
- debt: ran
- dead-code: ran
- deps: ran
- security: ran
- tests: ran
- docs-drift: ran
- ui-ux: N/A — not applicable (hasWebSurface=false)
- supply-chain: ran
- data-layer: N/A — not applicable (hasDb=false)
- ai-llm: N/A — not applicable (hasLLM=false)
- reference-signal: N/A — not applicable (hasNetwork=false)
```

Under `[lenses=...]` restricted launch (R2-O2), the excluded slots render as `N/A — not applicable (excluded by [lenses=...] operator)` (e.g. `- hotpath: N/A — not applicable (excluded by [lenses=...] operator)`) — same `N/A — not applicable (` state token, different reason string. The row-per-slot grep-assert below validates the state token, not the reason string.

**Three-state semantics:**

<!-- prettier-ignore -->
| State | Meaning | Source |
| --- | --- | --- |
| `ran` | Lens artifact exists, non-empty body, emitted at least one `finding` block OR explicit "no findings" verdict. | Lens artifact + parser. |
| `N/A — not applicable ({flag}=false \ | excluded by [lenses=...] operator)` | Lens self-no-opped because its `requires:` flag is false in `audit-stack.md ## Applicability`, OR the slot was excluded by the `[lenses=...]` operator escape (R2-O2). Distinct from `ran`: a UI-less repo's UI/UX lens MUST show this with `hasWebSurface=false`, not `ran`. Both reason strings live under the same `N/A — not applicable (` state-token prefix. | Lens artifact body contains the `# Not Applicable` header convention (written by the lens subagent OR by the orchestrator for `[lenses=...]`-excluded slots per R2-O2). |
| `crashed ({reason})` | Lens artifact missing, empty, OR parse-failed at the `awk` boundary; the existing artifact-exists+non-empty universal gate at Step 5 catches and routes this. | Orchestrator gate + synthesiser fallback. |

`crashed` is the existing implicit fourth state — kept implicit because the orchestrator's universal artifact-exists+non-empty gate (`.agents/workflows.md` § Common Workflow Anatomy / Artifacts row) already catches it at Step 5 and routes to Failure Path. The manifest formalises three states for downstream readers. The Step 6 orchestrator grep-assert (from Pass 2) is extended: every of the 16 declared slot slugs MUST appear exactly once in `## Missing Lenses`, with one of `ran` | `N/A — not applicable (` | `crashed (` as its state token. Missing row OR unknown state token ⇒ first absence re-issues synthesiser with tightening prompt; second absence ⇒ Failure Path.

### `audit-applicability.md` — REJECTED sidecar (decision recorded; not built)

Pass-3 brainstorm-3 proposed a separate `audit-applicability.md` sidecar. **Rejected** in favour of inlining the `## Applicability` block into `audit-stack.md` (Approach A from brainstorm-1). Rationale recorded in § Approaches Considered: one contract (one file) feeding all readers is simpler than two; the existing `audit-stack.md` schemaVersion discipline absorbs the bump cleanly.

## Components / Flows

### Step-by-step flow (10 steps; subagent count 16 → 21)

<!-- prettier-ignore -->
| # | Step | Subagents | Parallelism | Output | Verdict role |
| --- | --- | --- | --- | --- | --- |
| 1 | Start Workflow | — | — | FID, lock, tracker init, master-comment seed | none |
| 2 | Worktree Setup | — | — | `.worktrees/{FID}/`, `audit-input.md` (incl. parsed input flags), status init | none |
| 3 | Stack Detect | `@bkit-audit-stack-detect` | sequential | `audit-stack.md` (Stack + Coverage + Applicability + Inventory + Overrides + Disagreement) | PASS / CONCERNS (never FAIL); CONCERNS on thin / `unknown`-heavy OR `confidence: low` OR non-empty Disagreement |
| 4 | Skill Install | `@bkit-audit-install-skills` | sequential | `audit-install-skills.md` | PASS / CONCERNS (never gates; per Pass 2) |
| 5 | Lens Audits | **16** × `@bkit-audit-lens-{slug}` (or N excluded under `[lenses=...]`) | full parallel | **16** × `audit-lens-{slug}.md` (gated lenses contain `# Not Applicable` body; `[lenses=...]`-excluded slots get orchestrator-written stub bodies per R2-O2; stale prior-run artifacts deleted at Step-5 entry per R2-O2) | worst-of-surviving-lenses; conditional lenses N/A are NOT "surviving" (they did not run a probe) |
| 6 | Synthesise | `@bkit-audit-synthesise` | sequential | `audit-v1-synthesis.md` + `## Missing Lenses` (3 states; reasons include `flag=false` and `excluded by [lenses=...]`) + `## Parse Errors` (incl. R2-O1 reference-signal field-omission entries) | PASS / CONCERNS / FAIL; gate greps all three sections (review-2 C-2/C-3 + Pass-3 N/A row-per-slot; canonical 16-slug list from `bkit-audit.md` Step 6 inline enum per R1-B1) |
| 7 | Organise | `@bkit-audit-organise` | sequential | `audit-v2-ranked.md` | PASS / CONCERNS; FAIL on coverage orphan / DAG cycle / down-rank-violation (down-rank check is in-agent organise self-verify per R1-B2; rendering pinned per R1-B3) |
| 8 | Summary | `@bkit-audit-summary` | sequential | `audit-summary.md` (+ push feat) | PASS / CONCERNS / FAIL |
| 9 | Workstream Issues | — | — | one sub-issue per `WS-N`; blocked-by edges | — |
| 10 | Close Workflow | — | — | `docs/audits/{FID}-audit.md` (post-copy asserted); squash-merge dev; In Review | — |

`status.json#steps[5].artifacts` is a **fixed-length 16-entry array** (one slot per lens slug). Downstream readers (`bkit-trackers`, cloud orchestration) MUST treat it as a list — no hard-comparison to `11` or `16`. Gated-out lenses still emit an artifact (`# Not Applicable` body) so the count holds and a flag-bug-induced missing slot is immediately visible as `crashed`.

### Enrichment-degradation contract (UNCHANGED from Pass 2 + Pass-3 extension)

- **Stack-detect** (Step 3): artifact-exists+non-empty universal gate; `confidence: low → CONCERNS` (review-2 C-1); Pass-3 addition: non-empty `## Applicability Disagreement` ALSO routes to CONCERNS. Orchestrator surfaces `confidence` AND a one-line applicability summary in the Step 3 tracker comment (e.g. `Stack: typescript/pnpm — confidence: high — applicability: hasWebSurface=true, hasDb=true, hasLLM=false, hasCi=true, hasNetwork=false`) so the human can sanity-check both before trusting the audit.
- **Skill-install** (Step 4): fully non-gating; UNCHANGED. Failure-Path comment carries `Re-invoke with [skills=false] to bypass skill install.` recovery hint (review-2 O-1).
- **Lens fan-out** (Step 5) Failure-Path comment: **review-2 O-3** — when Step 5 fails or crosses a cost threshold, the orchestrator Failure-Path comment body includes the recovery hint `Re-invoke with [lenses=slug,slug] to audit a subset of lenses; valid slugs: architecture, hotpath, config, reliability, observability, debt, dead-code, deps, security, tests, docs-drift, ui-ux, supply-chain, data-layer, ai-llm, reference-signal. (See workflow file Step 6 inline enum — the canonical list per R1-B1.)` Parallels the `[skills=false]` hint pattern.
- **Lens fan-out** (Step 5): orchestrator launches all 16 slots in parallel. Each conditional lens's prompt body opens with: `**If** your \`requires:\` flag is false in audit-stack.md ## Applicability → write '# Not Applicable\n\nReason: {flag-name}=false' as the artifact body, exit cleanly with verdict PASS.`This is the launch-and-self-no-op pattern (Approach A from brainstorm-1). The artifact-exists+non-empty gate still passes (body is non-empty). The synthesiser distinguishes`# Not Applicable`-headed bodies from `## Findings`-headed bodies at parse time.
- **Coverage manifest at Step 6**: the non-skippable surface that distinguishes the three states. Step 6 grep-assert (extended from Pass 2):
  1. `## Missing Lenses` section heading present (Pass 2 — unchanged).
  2. `## Parse Errors` section heading present and reads `None` (Pass 2 — unchanged; non-`None` ⇒ CONCERNS). Pass-3: R2-O1 reference-signal field-omission entries land here under the documented reason string (also ⇒ CONCERNS, never silent).
  3. **Pass-3 addition (R1-B1 — canonical list inlined in this workflow file):** the 16 known slot slugs (`architecture`, `hotpath`, `config`, `reliability`, `observability`, `debt`, `dead-code`, `deps`, `security`, `tests`, `docs-drift`, `ui-ux`, `supply-chain`, `data-layer`, `ai-llm`, `reference-signal`) — **this exact enum is the canonical source of truth, inlined verbatim in `bkit-audit.md` Step 6; the synthesiser prompt's hardcoded enum and the `## Applicability — Flag Inventory` are checked against it by a plan-time grep-assert that FAILs on divergence** — MUST EACH appear exactly once in `## Missing Lenses`, prefixed by `- {slug}: ` and followed by exactly one of `ran` | `N/A — not applicable (` | `crashed (`. Missing slot row OR unknown state token ⇒ first absence re-issues with tightening prompt; second absence ⇒ Failure Path.
- **Reference-signal down-rank** at Step 7 (**R1-B2 — in-agent self-verify, NOT orchestrator post-step gate**): organise's prompt-body self-verify greps the rendered matrix top row + ranked-list top-3 + per-class appendix leading entries + executive summary "top findings" block for the literal-string tokens `source: reference-repo` AND `confidence: low`; any non-empty match in those blocks ⇒ organise self-verify FAIL → organise emits verdict FAIL with offending line(s) cited → orchestrator's existing verdict-extract routes FAIL to Failure Path. The orchestrator Step-7 gate does NOT re-grep — it only consumes organise's verdict (mirrors existing orphan / DAG-cycle self-verify discipline; reuses existing orchestrator verdict-extract code paths; no new orchestrator post-step gate added). The rendered surface the grep binds to is pinned (R1-B3): organise renders findings by verbatim-echoing the YAML `finding` fence, so `source: reference-repo` and `confidence: low` appear as literal tokens at start-of-line within fenced blocks in the rendered report. Findings still appear lower in the report — they are demoted, not deleted.

### Lens prompt inventory (16 lenses; +5 over Pass 2)

The 11 universal lenses from Pass 2 are unchanged. Each gains a one-line frontmatter addition `requires: always`. Five new lens prompts land in this pass with the conditional-lens contract (above).

**Pass-3 new prompts (5 lenses + zero new pipeline agents):** `bkit-audit-lens-ui-ux.md`, `bkit-audit-lens-supply-chain.md`, `bkit-audit-lens-data-layer.md`, `bkit-audit-lens-ai-llm.md`, `bkit-audit-lens-reference-signal.md`.

**Each new prompt carries:** (1) `Role:` line; (2) `**Lens discipline:**` clause forbidding library names + sanity-probe-before-emit clause (conditional lenses); (3) inlined universal probe block; (4) Read instructions for `audit-stack.md` (asserting `schemaVersion >= 2`, asserting `## Applicability` block presence, asserting own `requires:` flag value) + target `.agents/docs.md` + `docs/knowledge.md` + installed `audit-*` skills; (5) `requires:` frontmatter key; (6) for `supply-chain`: a Bash-allowlist block (`git log`, `git rev-parse`, `git cat-file`, `cat`, `jq`, `grep`; NEVER `git checkout` / `reset` / `push` / `commit`; **review-1 OPTIONAL #2 — `awk` dropped**) PLUS the honest "discipline-not-sandbox" caveat (the allowlist is author guidance; the host does not enforce it; widening MUST be justified in the same edit; grep `NEVER` to confirm caveat presence); (7) for `reference-signal`: a "captures provenance in `## Reference Repos Used`" block, a "always emits `confidence: low` AND `source: reference-repo` on every finding — synthesiser R2-O1 post-process FAILs the audit when either is missing" assertion, a "bounded to top-3 repos, structure/config/README only" scope clause.

### Effort / model assignments (Pass-3 additions row-by-row in `.agents/prompts.md` § Models)

UNCHANGED Pass-2 assignments for the 11 universal lenses + 5 pipeline agents. Pass-3 additions:

<!-- prettier-ignore -->
| Agent | Effort | Claude model | Tools | maxTurns tier |
| --- | --- | --- | --- | --- |
| `bkit-audit-lens-ui-ux` | high | claude-opus-4-7 | Read, Grep, Glob, Write | M (50) |
| `bkit-audit-lens-supply-chain` | high | claude-opus-4-7 | Read, Grep, Glob, Bash | M (50) |
| `bkit-audit-lens-data-layer` | high | claude-opus-4-7 | Read, Grep, Glob, Write | M (50) |
| `bkit-audit-lens-ai-llm` | high | claude-opus-4-7 | Read, Grep, Glob, Write | M (50) |
| `bkit-audit-lens-reference-signal` | high | claude-opus-4-7 | Read, Grep, Glob, WebSearch, Write | M (50) |

All new lenses honour comment 4539759063 §2 (opus / high, no Sonnet downgrade). The `supply-chain` `Bash` and `reference-signal` `WebSearch` surfaces are documented exceptions to the "Read-only reviewer" tool-set pattern in `.agents/prompts.md` § Tool set patterns (one-line addition per lens).

### Registry edits (extended from Pass 2)

- **`.agents/prompts.md`** — Pass 2 added 16 agents to § Models; Pass 3 adds 5 more lens rows (above). § Audit Phase section gains: (a) the 5 new lens slugs in its agent list; (b) the universality invariant statement updated to read "lens prompts carry NO library names — stack-specificity arrives via `audit-stack.md` (incl. `## Applicability` flags) + installed skills + the audited repo's docs"; (c) a one-paragraph note documenting the `supply-chain` Bash-allowlist exception and the `reference-signal` WebSearch network surface; (d) a one-paragraph note documenting the `requires:` frontmatter key + the launch-and-self-no-op contract. § Tool set patterns gains: a `Read-only reviewer with allowlisted Bash` sub-row noting `bkit-audit-lens-supply-chain` and the documented allowlist (`git log` / `git rev-parse` / `git cat-file` / `cat` / `jq` / `grep` / `awk`); a `Network-tier reviewer` sub-row noting `bkit-audit-lens-reference-signal` and the `confidence: low` + `source: reference-repo` discipline.
- **`.agents/workflows.md`** — Pass 2 already rewrote the stale `bkit-audit.md` registry block to the 10-step shape. Pass 3 extends:
  1. **Step 3 contract note** — document the new `## Applicability` block in `audit-stack.md`, the five flag heuristics in summary form, and the `## Applicability Disagreement → CONCERNS` rule.
  2. **Step 5 contract note** — document the 16-slot fan-out (was 11), the `requires:` gating contract, the launch-and-self-no-op pattern (`# Not Applicable` artifact body), the new `--with-websearch` flag flipping `hasNetwork`, the `status.json#steps[5].artifacts` 16-entry array, the **R2-O2 pre-launch stale-artifact cleanup**, the **R2-O2 `[lenses=...]` excluded-slot orchestrator-written stub semantics**, and the review-2 O-3 Failure-Path `[lenses=...]` recovery hint.
  3. **Step 6 contract note** — extend the grep-assert list to include the row-per-slot N/A coverage check; document the **R1-B1 canonical 16-slug list inlined verbatim** in this Step 6 block (workflow file is the source of truth; synthesiser prompt enum + lens `requires:` value union are derived, checked by WS-K plan-time grep-assert); document the R2-O1 reference-signal field-omission entries appearing in `## Parse Errors` with the documented reason string ⇒ CONCERNS.
  4. **Step 7 contract note** — document the down-rank rule (source/confidence fence on matrix top row + ranked-list top-3 + per-class appendix leading entries + summary), the **R1-B2 in-agent organise self-verify** that enforces it (NOT an orchestrator post-step gate), and the **R1-B3 renderer-output-format lock** (verbatim YAML fence echo) that pins the grep's binding surface.
  5. **Input flag table** — add `--with-websearch`, `[lenses=slug,...]`, `[applicability-override=flag=bool]` to the `/bkit-audit` input parsing description; `[skills=false]` already present from Pass 2.
  6. **File Layout tree comment** — unchanged (Pass-2's "10 steps; hard stop after summary" already correct).
  7. **Output cell row** — unchanged.
- **`.agents/docs.md`** — UNCHANGED. Workflow Matrix Audit column already correct from Pass 2.
- **`.agents/skills.md`** — UNCHANGED. Curated manually per project memory.

### Legacy deprecation header (UNCHANGED from Pass 2)

Header-only deprecation on `bkit-utility-audit-{codebase,security,tests,logs}.md`. `Deprecated since` resolved against `package.json#version` at build/ship time (comment 4539759063 §3 — repo currently v2.8.4; do NOT pin). `bkit-utility-audit-logs-ship.md` NOT deprecated.

### Ship-side prune coverage of `audit-*` skills (UNCHANGED — call-out only)

`/bkit-ship` Step 10 "Prune Skills" already removes unlisted `.agents/skills/*`. Pass 3 expands the surface (more potential `audit-*` skill matches across UI / DB / LLM / supply-chain tokens) but does NOT change the prune posture. Reproducibility relies on `audit-install-skills.md` version capture, NOT on skill persistence.

## Decisions

<!-- prettier-ignore -->
| Decided | Alternatives | Why |
| --- | --- | --- |
| **Keystone = `## Applicability` block INLINED in `audit-stack.md` + per-lens `requires:` frontmatter key + three-state `## Missing Lenses` (`ran` / `N/A — not applicable ({flag}=false)` / `crashed (...)`).** | Separate `audit-applicability.md` sidecar (brainstorm-3 A); roster artifact `audit-lens-roster.md` (brainstorm-1 C); pre-launch filter only (brainstorm-1 B) | One contract = one file; the existing `audit-stack.md schemaVersion` discipline absorbs the v1 → v2 bump cleanly. Sidecar adds a second contract surface (more readers, more drift). Roster centralises decision making (single-point-of-failure if stack-detect drops a slug). Pre-launch filter only is a footgun: a stack-detect bug silently drops a lens with no launch artifact telltale, only narrative comment text as the safety net. |
| **Conditional lenses launch-and-self-no-op (belt-and-braces), NOT pre-launched filter.** | Orchestrator skips dispatch when flag false; drop findings post-hoc | Launch-and-self-no-op means a stack-detect flag bug cannot silently lose a lens — the launch artifact + `# Not Applicable` body + `## Missing Lenses` row still appear with a flag-named reason. Cost = one trivial-no-op subagent (<1s, low token, no Bash for most). Aligns with the baseline's "never silently lose findings" posture (review-2 C-2 parse errors). |
| **Supply-chain ships as a NEW lens, NOT extending `security`.** | Extend `security` with a second probe-block (brainstorm-2 / brainstorm-1 B variant) | Tool-surface diverges: `security` is read-only `Read, Grep, Glob, Write`; `supply-chain` needs `Bash` for git-history / lockfile scan. Extending would (a) add `Bash` to a prompt that is provably non-mutating today (tool-surface regression); (b) blur lens-class boundary (one lens emitting two very different shapes of `class: security` findings); (c) make app-security and pipeline findings compete for the 25-finding cap. Split lens keeps the invariant clean and dedup readable. Body of the lens carries an explicit `Bash` allowlist (read-only commands only). |
| **Reference-signal is a LENS (slug, `requires:` flag, same `finding`-block schema), NOT a non-lens sibling agent.** | Sibling non-lens agent like stack-detect (brainstorm-3 A); fold into Step 6 synthesise | Keeps "all signals are lenses" mental model; reuses the launch ceremony, the dedup machinery, and the same fixed-slot `status.json` artifact array. The down-rank rule (`source: reference-repo` + `confidence: low`) is a simple synthesise/organise filter — no new agent class needed. Non-lens-agent treatment would duplicate stack-detect/skill-install ceremony for a finding-emitting agent. |
| **Data-layer AND AI/LLM conditional lenses land in THIS pass (`hasDb`, `hasLLM`), NOT deferred to #207.** | Defer one or both to #207 | The minimal conditional-lens model is only well-tested if at least 2-3 conditional lenses exercise it. Shipping UI/UX alone would test `hasWebSurface=false` no-op but not the model under DB / LLM detection heuristics. All three share the same no-op gating pattern; landing them together gives the model a three-lens stress test before #207 extends it. Issue body's "minimal here vs full in #207" boundary: this pass ships the gating mechanism + 4 conditional lenses; #207 extends the flag taxonomy (additive: `hasMobileApp`, `hasGraphQL`, etc.). |
| **Universal-pattern lens roster grows 11 → 16:** +`ui-ux` (`hasWebSurface`), +`supply-chain` (`hasCi`, defaults true), +`data-layer` (`hasDb`), +`ai-llm` (`hasLLM`), +`reference-signal` (`hasNetwork`). | Some new lenses become non-lens agents; defer some to #207 | All five are finding-emitting; lens shape is the right reuse target. Per comments 4580555629 + 4585042869: UI/UX + reference-signal (4580555629); supply-chain + data-layer + ai-llm (4585042869); #207 retains room for Tier-2/3 (web SEO/AIO/IA, analytics, web-perf, DX, rendered-UX). Cost trajectory (16 opus lenses ~4.5× design triplet) acknowledged; Sonnet-downgrade lever stays the documented future escape. |
| **`--with-websearch` orchestrator flag flips `hasNetwork=true`; reference-signal lens gates on `hasNetwork`.** | Always-on reference-signal; per-lens "is this network-tier?" concept | Recommend opt-in per comment 4580555629 (network / cost / reproducibility). Reuses the applicability mechanism rather than a parallel "network-tier" concept; generalises to future network-tier lenses (e.g. CVE-database query enrichment for `deps`) without re-plumbing. The doubling from 1 → 2 network surfaces is intentional and called out in § Risks (NOT hidden behind Pass-2 prose). |
| **Reference-signal findings down-ranked by a machine-enforceable contract: `source == reference-repo` OR `confidence == low` ⇒ NEVER matrix top row, NEVER ranked-list top 3, NEVER executive summary.** | Prose-only instruction (brainstorm-2 B); `tier: external\ | internal` field (brainstorm-2 C) | Prose drifts; `tier:` field requires a schema migration across all 16 existing lens prompts. The `source:` optional field is additive — parsers default-tolerate its absence on internal lenses, only the `reference-signal` lens emits it. The down-rank rule is a single greppable invariant enforced at organise self-verify (mirrors orphan / DAG-cycle self-verify). |
| **Land `[lenses=slug,...]` and `[applicability-override=flag=bool]` input escapes in THIS pass.** | Defer to follow-up | Both are direct mitigations to the 10×-scale + 3am failure modes (brainstorm-3 A premortem). Cheap (input parsing only), high payoff (recoverability: partial re-run without full audit; force lens to run without hand-editing `audit-stack.md`). No architectural commitment beyond the applicability block. |
| **`supply-chain` lens `Bash` is allowlisted in its prompt body** (`git log`, `git rev-parse`, `git cat-file`, `cat`, `jq`, `grep`, `awk`; NEVER `git checkout` / `reset` / `push` / `commit`). | Open `Bash` (matches build-side skill-installer) | The lens family is otherwise sibling-blind / read-only; an open `Bash` is a sandbox-equivalent surface in a prompt family that doesn't have it. Allowlist keeps the surface auditable and prompt-grippable. Document the allowlist in the prompt body + in `.agents/prompts.md` § Tool set patterns. |
| **All lenses remain at `model: claude-opus-4-7`, `effort: high`.** | Sonnet downgrade for conditional lenses | Frozen by comment 4539759063 §2. Cost trajectory acknowledged (~4.5× design triplet at 16 lenses); Sonnet-downgrade lever stays available unchanged. No per-lens model tuning in this pass. |
| **Reuse build/ship skill machinery verbatim, incl. ship-side prune of `audit-*` skills.** | Audit-specific install agent; pin skills (no prune) | Frozen by comment 4539759063 §1. Ship-side prune coverage of `audit-*` is the consistency leg (`.agents/skills.md` curated manually per project memory). `/bkit-ship` Step 10 already removes unlisted skills (which includes `audit-*`); confirm at build time, no new edit expected. |
| **Do NOT pin versions in deprecation headers; resolve `Deprecated since` at build/ship against `package.json#version`.** | Pin to a specific minor (e.g. v2.9.0) | Frozen by comment 4539759063 §3. Repo currently v2.8.4; body's "v2.2.0" is void. |
| **Out-of-scope a11y / i18n REMOVED — absorbed into the `ui-ux` lens.** Legacy `bkit-utility-audit-*` deletion stays a tracked follow-up. | Keep a11y / i18n out of scope; auto-delete legacy now | Per comment 4580555629: UI/UX lens covers a11y + i18n probes at the universal-pattern level (zero framework names; framework-specific depth via installed `audit-{framework}` skill). |
| **No new `Audit` phase label.** Pass-2 decision preserved; identity via title prefix + sub-issue tree + on-disk artifact. | Add `bkit:audit` phase label | Matches live `.agents/workflows.md` block; avoids one-time manual label-creation prerequisite per tracker; additive labels (`bkit:failed`, `bkit:debug`) coexist normally. |
| **Reject the `audit-applicability.md` sidecar** (brainstorm-3 A's headline mechanism). | Sidecar with `schemaVersion` + own gate | Two contract surfaces > one. The risk-premortem-3 brainstorm noted "sidecar fields drift" as a top failure mode; inlining the `## Applicability` block into `audit-stack.md` eliminates that drift surface entirely. The sidecar's value-add (richer gating logic) is not needed for the minimal model this pass ships. #207 can revisit if multi-surface gating ever justifies a sidecar. |
| **Reject the `audit-lens-roster.md` artifact** (brainstorm-1 C's headline mechanism). | Centralised lens-selection artifact | Single point of failure (stack-detect bug drops a slug → lens invisible, no launch artifact, no per-lens N/A row); two-file edit per new lens (stack-detect inventory + lens prompt); lens-inventory enum in stack-detect drifts from actual count (no compile-time check on Markdown). Approach A (flag-stamped lens roster) achieves the same explainability via the `## Missing Lenses` three-state row + the `## Applicability — Flag Inventory` greppable enum. |
| **Reject two-tier fan-out (5a always-on / 5b conditional)** (brainstorm-1 B). | Split Step 5 into 5a / 5b | Pipeline grows 10 → 11 steps; thickens the registry rewrite (the baseline risk register #1); pre-launch filter is the silent-skip footgun; two status.json artifact arrays + two tracker comments per run. UI/UX moved to 5a in that approach to keep it "always-on" still requires the same N/A machinery, so the split doesn't buy anything; meanwhile the divergence from `/bkit-design`'s flat fan-out pattern weakens pattern-match. |
| **Reject three-track Step 5 (universal / conditional / external-signal)** (brainstorm-3 C). | Restructure Step 5 into three named tracks | Triples gate logic; new track-taxonomy concept; workflow file diff churns when lenses migrate between tracks (the universality of a lens becomes a judgement call frozen into structural workflow file shape); diverges from `/bkit-design`'s flat-fan-out pattern. The strict-below-internal ranking constraint that approach enforces structurally is achievable via the grep-assert (Approach A) without structural divergence. |

## Approaches Considered

<!-- prettier-ignore -->
| Approach | Verdict | Why |
| --- | --- | --- |
| **Flag-stamped lens roster** (brainstorm-1 A) — `## Applicability` inlined in `audit-stack.md`; per-lens `requires:` frontmatter; launch-and-self-no-op; 3-state coverage. | KEPT (lead) | Smallest deviation from the PASS'd baseline; no new step type; no new artifact contract; no new agent class. ~95% reuse. The minimal keystone version the issue body asks for: one new block in `audit-stack.md`, one frontmatter key, one new coverage state. Belt-and-braces safety: lens launches + self-no-ops, so a flag bug still leaves a launch artifact telltale. |
| **Strict signal-tier separation via `source` marker on `finding` blocks** (brainstorm-2 A, merged) — additive optional field, machine-enforceable down-rank. | MERGED | The down-rank rule needs a machine-enforceable contract, not prose. The `source` field (chosen over `externalSignal:` boolean — naming aligns with future "signal source" extensibility) is additive; existing parsers ignore unknown fields; only reference-signal lens emits it. Enables the organise self-verify grep-assert. Layered onto Approach A as the down-rank mechanism. |
| **Risk-premortem mitigation layer** (brainstorm-3 A, merged) — `[lenses=...]` partial-rerun + `[applicability-override=...]` force-flag + inverse-evidence guard + 16-slot fixed-array + UI/UX no-op acceptance test. | MERGED | These are additive mitigations to Approach A, not a competing approach. Land in this pass: the operator escape hatches close 10×-scale + 3am-on-call failure modes; the inverse-evidence guard closes the false-negative-flag silent-skip; the UI/UX no-op test validates the keystone empirically on bkit itself. |
| Two-tier fan-out (5a always-on + 5b conditional) (brainstorm-1 B) | REJECTED | Pipeline grows 10 → 11 steps; registry rewrite thickens; two status.json artifact arrays; pre-launch filter is the silent-skip footgun. Divergence from `/bkit-design` pattern. UI/UX moved to 5a in that proposal still needs the N/A machinery anyway, so the split is cost without benefit. |
| Roster-as-artifact `audit-lens-roster.md` (brainstorm-1 C) | REJECTED | Two contracts feeding 16 readers; single point of decision = single point of failure; lens-inventory enum in stack-detect drifts from actual count silently; adding a lens is a two-file edit. The roster's explainability win is achievable via three-state `## Missing Lenses` rows + `## Applicability — Flag Inventory` enum without the artifact. |
| Self-gating lenses, no sidecar / no `## Applicability` block (brainstorm-3 B) | REJECTED | Gating logic distributed across N lens prompts; no single source of truth for applicability matrix; lenses can diverge on what "applicable" means (e.g. one lens treats `bitbucket-pipelines.yml` as CI, another doesn't); operator override requires touching `audit-stack.md` itself OR every lens prompt's own override flag (N escape hatches, one per lens). Worse bus factor than the centralised flag block. |
| Three-track Step 5 (universal / conditional / external-signal) (brainstorm-3 C) | REJECTED | Triples gate logic; introduces new track taxonomy concept that diverges from `/bkit-design`'s flat fan-out; the universality of a lens becomes a structural workflow-file judgement (churn on tier migration); the structural enforcement of reference-signal ranking is achievable via grep-assert without the structural divergence. |
| Flat fan-out without applicability flags (brainstorm-2 B) | REJECTED | The "false all-clear" problem the issue body explicitly identifies as the keystone risk — a conditional lens that runs on an inapplicable surface emits zero findings and `## Missing Lenses` records "ran clean", indistinguishable from "genuinely clean". Without the `N/A` state, every conditional lens produces misleading signal on inapplicable repos. Retroactive fix is a larger migration than doing it correctly here. |
| `tier: external\ | internal` field on `finding` blocks (brainstorm-2 C) | REJECTED | Schema migration across all 16 existing lens prompts. The additive `source:` field (chosen instead) is non-breaking — existing prompts don't emit it; parsers default-tolerate its absence; only the reference-signal lens emits the non-default value. |
| Merge `supply-chain` into `security` lens (brainstorm-2 C / brainstorm-1 B variant) | REJECTED | Adds `Bash` to a previously read-only lens (tool-surface regression); blurs lens-class boundary (two very different shapes of `class: security` findings competing for the 25-finding cap); app-security and pipeline probes share a prompt — high prompt length, mixed concerns, future supply-chain authors touch the security prompt. |
| Defer data-layer + AI/LLM conditional lenses entirely to #207 (brainstorm-3 C) | REJECTED | The keystone needs >1 conditional lens to be stress-tested. Shipping UI/UX alone tests `hasWebSurface=false` no-op only; landing 4 conditional lenses (UI/UX + data-layer + AI/LLM + supply-chain conditional gate even though defaults true) gives the model a four-lens stress test before #207 extends the flag taxonomy. |
| Reference-signal as non-lens sibling agent (brainstorm-3 A's choice) | REJECTED | Duplicates stack-detect / skill-install ceremony for a finding-emitting agent; breaks the "all signals are lenses" mental model; adds a new agent-class to the registry. The lens treatment (with `requires: hasNetwork` + `source: reference-repo` field) reuses all existing infrastructure. |

**MERGED final shape:** brainstorm-1 A (flag-stamped lens roster, launch-and-self-no-op, 3-state `## Missing Lenses`) + brainstorm-2 A (`source:` machine-enforceable down-rank, supply-chain as separate lens, all 3 conditional lenses land this pass) + brainstorm-3 A (operator escape hatches `[lenses=...]` / `[applicability-override=...]`, inverse-evidence guard, fixed-slot 16-entry artifact array, UI/UX-no-op acceptance test on bkit). Each contributed a different concern; merged kept strongest-per-concern rather than collapsing to consensus.

## Trade-offs Accepted

**What we gain (vs the rejected alternatives):**

- **Genuine conditional-lens model with the minimal surface area:** one new block in `audit-stack.md` + one new frontmatter key per lens + one new coverage state. No sidecar, no roster artifact, no new step. ~95% reuse of the PASS'd Pass-2 baseline.
- **Keystone correctness on bkit's own repo:** UI/UX, data-layer, AI/LLM lenses MUST show `N/A — not applicable` (not `ran clean`) — the false-all-clear problem the issue body explicitly identifies is fixed by construction.
- **Belt-and-braces gating:** lens launches + self-no-ops, so a stack-detect flag bug cannot silently lose a lens (launch artifact + `## Missing Lenses` row both persist with a flag-named reason).
- **Operator recoverability:** `[lenses=...]` partial-rerun + `[applicability-override=...]` force-flag close the 10×-scale + 3am-on-call failure modes without architectural commitment.
- **Machine-enforceable reference-signal down-rank:** the `source: reference-repo` field + organise self-verify grep-assert prevent prose drift; the network slot opens (1 → 2 surfaces) only with the explicit opt-in flag.
- **Tool-surface invariant preserved for 14 of 16 lenses:** only `supply-chain` carries `Bash` (allowlisted); only `reference-signal` carries `WebSearch`. The "Read-only reviewer" pattern remains the dominant tool-set.

**What we sacrifice:**

- **Network surface count grows 1 → 2** when `--with-websearch` is on. Documented explicitly in § Risks; the Pass-2 prose "the only network surface in the pipeline, isolated to Step 4" must be updated. Mitigation: opt-in only; reference-signal's `confidence: low` + ranked-below-internal contract bounds the impact.
- **Token cost continues to grow** — 16 opus / high lenses ~4.5× the design-triplet cost (was 11 lenses / 4× in Pass 2). Sonnet-downgrade lever stays the documented future escape; not exercised this pass.
- **Tool-surface heterogeneity** — `supply-chain` carries `Bash`, `reference-signal` carries `WebSearch`; the once-uniform "Read-only reviewer" lens family now has 3 sub-shapes. Justified once in `.agents/prompts.md` § Tool set patterns, with the per-lens prompt body carrying the allowlist + provenance discipline.
- **No mechanical enforcement of universality at compile time** — the `requires:` value vs `## Applicability — Flag Inventory` consistency is a plan-level grep-gate (review-time), not a build-time lint. Same posture as the "no library names in lens prompts" invariant from Pass 2. Accepted residual risk.
- **AI/LLM lens self-reference quirk** — running the `ai-llm` lens on a repo whose own source includes LLM prompt files needs explicit `.agents/**` / `.cursor/**` / `.claude/**` scope exclusion in the lens prompt body; mis-classification risk if the exclusion is forgotten.
- **`audit-*` skill ship-prune transience** — auto-installed audit skills are pruned by `/bkit-ship`; reproducibility relies on the version-capture log, not skill persistence. Surface area expands in Pass 3 (more potential skill matches across UI/DB/LLM/supply-chain tokens).
- **Pass-2 carry-forwards still hold:** no adversarial review of synthesis (audit is terminal); two skill-install agents (build + audit); audit-stack.md single contract feeding 16 readers; external dep on skills registry; universality unenforceable by build-time lint.

## Risks & Open Questions

**Risks (surface in plan; mitigations layered onto the chosen shape):**

- **Conditional-lens false-negative N/A is silent by construction.** A mis-detected `hasWebSurface=false` on a real frontend repo renders as `N/A — not applicable` in `## Missing Lenses` — which by design is NOT a finding. The only signal is the operator noticing the N/A on a repo they know has the surface. Layered mitigations: (a) `confidence: low → CONCERNS` already catches thin stack detection; (b) inverse-evidence guard — `audit-stack.md ## Applicability Disagreement` block flags `hasWebSurface=false but frameworks contains UI-shaped token / src/app exists` → CONCERNS at Step 3 (Pass-3 addition); (c) operator-visible Applicability summary in the Step 3 tracker comment so a wrong flag is one glance away; (d) `[applicability-override=hasWebSurface=true]` re-invocation. None eliminate the risk; documented explicitly.
- **Conditional-lens false-positive (running on absent surface).** Opposite failure: lens runs against a repo with no real surface, emits noise findings. Each conditional lens carries a sanity-probe-before-emit clause: if first-pass probe finds zero matching files even though the flag is true, emit empty body + `# Not Applicable (flag=true but no surface evidence)` and exit. Lower blast radius (explicit `location:` lines make noise identifiable; reviewer drops it). 25-finding cap means noise can crowd out real signal from sibling lenses — accepted residual.
- **Reference-signal network reproducibility.** Two `--with-websearch` runs on the same commit can return different reference repos. The `bkit-audit-lens-reference-signal` agent captures (a) which repos consulted + commit/tag, (b) the search query, in `## Reference Repos Used` — same provenance discipline as `audit-install-skills.md`. Reproducibility is "explainable", not "identical".
- **Second network surface opens** with `--with-websearch`. The Pass-2 § Risks line "the only network surface in the pipeline, isolated to Step 4" no longer holds. Update the prose in the rewritten `.agents/workflows.md bkit-audit.md` block and in `.agents/prompts.md` § Audit Phase rationale; do NOT let documented network-surface count lag the implementation.
- **UI/UX no-op on bkit's own repo (acceptance test).** bkit has no UI → UI/UX lens MUST `N/A` cleanly. Validate at build time: run `/bkit-audit` on bkit and assert the UI/UX row in `## Missing Lenses` reads `N/A — not applicable (hasWebSurface=false)`, NOT `ran clean`. If it shows `ran clean` the keystone is broken. (Comment 4580555629: "bkit has no UI → must no-op cleanly (drives the keystone below)" — this is the empirical acceptance test for the keystone.)
- **`supply-chain` "near-universal" gate must be permissive.** A repo with no `.github/workflows/` AND no `package-lock.json|pnpm-lock.yaml|yarn.lock` legitimately has nothing to scan. The `hasCi` heuristic OR `packageManager != unknown` triggers run (any one signal); over-strict gating silently skips real surfaces.
- **`supply-chain` `Bash` allowlist enforcement is prompt-level.** The lens prompt body documents the allowlist (`git log` / `git rev-parse` / `git cat-file` / `cat` / `jq` / `grep` / `awk`); the host tool surface still grants raw `Bash`. The allowlist is a discipline, not a sandbox. If a future lens author adds `git checkout` to the prompt body, the runtime won't reject it. Accepted residual; documented in the prompt body + `.agents/prompts.md` § Tool set patterns.
- **`status.json#steps[5].artifacts` array shape grows 11 → 16.** Pass-3 fixed-slot count is 16. Downstream readers (`bkit-trackers` outside-worktree progress, cloud orchestration) MUST treat as a list, NOT hard-compare length to 11 or 16. Verify at build/plan time.
- **`audit-*` skills likely don't exist in the registry yet (known Pass-2 limitation, Pass-3 surface expands).** Step 4 will likely hit "Not Found / Skipped" for most tokens in v1 — non-gating posture absorbs this; the audit runs to full strength on universal-pattern lenses regardless. The headline enrichment value lands when `audit-{ui,db,llm,supply-chain}-*` skills exist in the registry. Record as known limitation, not blocker.
- **AI/LLM lens self-reference.** Lens MUST exclude `.agents/**` / `.cursor/**` / `.claude/**` to avoid mis-classifying agent prompts as product LLM surfaces. Exclusion lives in the lens prompt body.
- **Authoring-rule lock-in.** Every workflow/prompt edit in Pass 3 lands under `.agents/workflows.md` § Workflow Authoring Rules + `.agents/prompts.md` § Prompt Authoring Rules (comment 4552784986). ASCII operators only (`!=`, `>=`, `<=`). Tracker MCP only (no `gh api` / no raw HTTP). The volume of new prompts in Pass 3 (5 new lenses, stack-detect schema bump, workflow registry-block extension) amplifies the lint surface — call out in build readiness.
- **Ship-side prune of `audit-*` skills.** `.agents/skills.md` curated manually; `/bkit-ship` Step 10 removes unlisted skills. Pass 3 expands the surface (more `audit-*` skill-token classes). Reproducibility relies on `audit-install-skills.md` version capture, NOT skill persistence; restate posture in WS-7Δ so a reader doesn't assume audit skills survive across ship cycles.
- **Cost trajectory** — 16 opus / high lenses at ~4.5× design-triplet cost. The Sonnet-downgrade lever (comment 4539759063 §2) is the acknowledged future escape; explicitly NOT exercised this pass. Open question (below).
- **Pass-2 carry-forwards still hold:** `audit-stack.md` single point feeding now 16 readers (was 11); legacy `bkit-utility-audit-*` deprecation-header-only; stack-detect on polyglot / non-Node repos; skills registry external dep; universality unenforceable by build-time lint.

**Open questions:**

- **Sonnet downgrade for selected conditional lenses (cost lever).** Frozen NO this pass (per 4539759063 §2). Revisit if the 16-lens cost trajectory binds in production usage. Track as a `docs/pending.md` candidate after one or two real-world `/bkit-audit` runs at this scale.
- **Skill source constraint.** Should installs be constrained to reputable sources beyond the 10-skill cap? Deferred to plan; default is build-agent parity (cap only). Pass-2 open question — UNCHANGED.
- **`audit-{framework}` skill authoring** — community/bkit `audit-nextjs`, `audit-vue`, `audit-prisma`, `audit-langchain`, `audit-github-actions` etc. — does not exist in the public registry today. Audit runs at full strength on universal probes regardless (non-gating); the headline enrichment value depends on these skills existing. Open question whether to author a minimal set of them as a follow-up to this pass.
- **#207 boundary** — this pass ships the gating mechanism + 4 conditional lenses (`ui-ux`, `data-layer`, `ai-llm`, `supply-chain` though always-on by default). #207 extends the flag taxonomy (`hasMobileApp`, `hasGraphQL`, `hasGRPC`, per-language sub-lenses) WITHOUT breaking existing flags. Out-of-lens of this design: what #207's extended flag schema should look like (re-derive there).
- **Phase 3 (WebSearch) full scope vs Pass-3 reference-signal lens.** This pass lands the **first concrete use** of the reserved `--with-websearch` flag (reference-signal lens). Future Phase-3 augments (e.g. `"{stack} {lens} best practice {year}"` per-lens WebSearch enrichment) remain deferred — they would use the same `hasNetwork` flag without re-plumbing. Track as `docs/pending.md`.
- **Out-of-scope, append to `docs/pending.md` at design-generate close:** legacy `bkit-utility-audit-*` deletion follow-up; per-lens fixers; CI scheduling; cross-repo aggregation; live runtime-signal lens (#83); `/bkit-debug` hint integration (#94); rendered-result UX screenshot review (#206); web SEO/AIO/IA + analytics + web-perf + DX + generic full conditional-lens model (#207).
- **New decisions for `docs/decisions.md` at build/ship time:** conditional-lens model (`## Applicability` block inlined + `requires:` frontmatter + launch-and-self-no-op + 3-state coverage); reference-signal down-rank contract (`source: reference-repo` machine-enforceable, R1-B2 in-agent self-verify + R1-B3 verbatim-echo renderer + R2-O1 synthesiser field-omission post-process); operator escape hatches (`[lenses=...]` with R2-O2 stale-artifact cleanup + excluded-slot stub, `[applicability-override=...]` with O-1 structured parse-signal); supply-chain `Bash` allowlist exception to the read-only reviewer invariant (with O-2 `awk` drop + honest discipline-not-sandbox caveat); R1-B1 single-source-of-truth canonical 16-slug list inlined in workflow Step 6 + plan-time grep-assert keeping derived views in sync. (The Pass-2 decisions — enrichment-never-gates posture, fixed-versioned-schema contract, data-driven `audit-{token}` mapping, universal-pattern lens invariant — are already either in `docs/decisions.md` from Pass-2 close, or queued for build/ship there.)

## Out-of-scope (Pass-3 boundary)

Carry-forward from Pass 2, with explicit Pass-3 updates:

- **a11y / i18n: REMOVED from out-of-scope.** Absorbed into the `ui-ux` lens (per comment 4580555629).
- **Per-lens fixers** — audit remains read-only; UNCHANGED.
- **CI scheduling / automated audits** — UNCHANGED.
- **Live runtime-signal lens (#83)** — UNCHANGED; deferred.
- **Cross-repo aggregation** — UNCHANGED.
- **Legacy `bkit-utility-audit-*` deletion** — UNCHANGED; deprecation header only in this pass; deletion follow-up tracked separately.
- **Cross-workflow hooks (`/bkit-debug` hint integration #94)** — UNCHANGED; deferred.
- **Tests, scripts, JSON schemas, helper modules** — UNCHANGED; only workflow + prompts + minimal registry edits.
- **No `Audit` phase label** — Pass-2 decision preserved.
- **No per-finding tracker comments** — Pass-2 posture preserved; findings live on disk + in workstream sub-issue bodies; master comment carries verdicts + summary only.
- **#207 deferrals (full conditional-lens model + Tier-2/3 web family + DX):** extended applicability flag taxonomy (`hasMobileApp`, `hasGraphQL`, `hasGRPC`, per-language sub-lenses); SEO/AIO/IA; analytics; web-perf; DX; rendered-result UX screenshot review (also #206). This pass ships the **minimal** conditional-lens model + 4 conditional lenses; #207 extends.
- **Authoring `audit-{framework}` community skills (`audit-nextjs`, `audit-vue`, `audit-prisma`, `audit-langchain`, `audit-github-actions`, etc.)** — out of scope for this pass; the audit runs at full strength on universal probes without them. Skills enrichment value lands as they're authored (community or bkit-side).
- **Sonnet downgrade for cost trajectory management** — out of scope this pass per comment 4539759063 §2; revisit after real-world usage.
- **Full Phase-3 WebSearch per-lens augmentation** — this pass lands ONLY the reference-signal lens as the first concrete use of `--with-websearch`; further per-lens WebSearch enrichment (e.g. `"{stack} {lens} best practice {year}"` per-lens query) is deferred.

## Design Workstreams

The Pass-2 WS-1..WS-7 decomposition stays valid as a backbone; Pass-3 ADDS to existing workstreams rather than re-cutting them, with one wholly-new conditional-lens-keystone workstream as the load-bearing prerequisite. Final workstream cut after design organise may consolidate WS-1Δ + WS-K into one, and WS-3Δ + WS-4Δ + WS-6Δ into the existing WS-3/4/6 with explicit scope notes. The decomposition below uses `Δ` suffixes to mark Pass-3 deltas vs Pass-2 scope.

### WS-K: Conditional-lens keystone — `## Applicability` block + `requires:` frontmatter key + 3-state `## Missing Lenses`

#### Scope

The load-bearing prerequisite for every Pass-3 conditional lens. Lands the minimal model:

- **`audit-stack.md` schema bump v1 → v2:** new `## Applicability` block with five named booleans (`hasWebSurface`, `hasDb`, `hasLLM`, `hasCi`, `hasNetwork`); new `## Applicability — Flag Inventory` enum block (canonical flag-name list, greppable); new `## Applicability Overrides` block (audit trail for `[applicability-override=flag=bool]` inputs); new `## Applicability Disagreement` block (inverse-evidence guard).
- **`bkit-audit-stack-detect.md` prompt update:** emit `schemaVersion: 2`; encode detection heuristics for the five flags (evidence-based — package.json deps, frameworks list, dir presence at depth <= 3-4, CI manifest file existence); ingest `[applicability-override=flag=bool]` input from orchestrator; merge override after auto-detection with audit-trail line; raise `## Applicability Disagreement` block + CONCERNS verdict on inverse-evidence conflict (e.g. `hasWebSurface=false` but `frameworks` contains a UI-shaped token). **Review-2 O-4:** emit optional `heuristicDepthLimit: <int>` field in `## Detection Coverage` when a depth-limited probe was the binding constraint behind an unmatched flag (operator visibility into whether deeper probing might change the answer).
- **`bkit-audit-synthesise.md` prompt update:** hardcoded enum of 16 known lens slugs (mirroring `## Applicability — Flag Inventory` + the 11 universal slugs); render `## Missing Lenses` as one row per slot in three explicit states (`ran` | `N/A — not applicable ({flag-name}=false)` | `crashed ({reason})`); `# Not Applicable`-bodied lens artifacts parse as N/A with reason from body's first `Reason:` line.
- **Orchestrator extension (`bkit-audit.md`):** input parsing for `--with-websearch` (flips `hasNetwork`), `[applicability-override=flag=bool]` (passed to stack-detect), `[lenses=slug,slug]` (filters Step 5 fan-out to listed slugs only); Step 3 tracker comment surfaces one-line Applicability summary; Step 6 grep-assert extended to row-per-slot check with the three-state token validation.
- **Plan-level universality guard:** grep-assert `requires:` values across `.agents/prompts/bkit-audit-lens-*.md` are a subset of the canonical flag-name list in `## Applicability — Flag Inventory` (compile-time-equivalent linting for the Markdown contract).
- **R1-B1 — Plan-level canonical-16-slug consistency guard.** New plan-time grep-assert added to WS-K Done-When: extract the inline 16-slug enum from `.agents/workflows/bkit-audit.md` Step 6 (the canonical source per R1-B1), the hardcoded slug enum from `.agents/prompts/bkit-audit-synthesise.md`, and the `requires:` value union from `.agents/prompts/bkit-audit-lens-*.md` (with `requires: always` mapped to the 11-universal-slugs subset). FAIL the plan-time gate if the three sets disagree by any slug. Workflow file is authoritative; synthesiser + lens prompts are the derived views. Also extend the universality grep-gate regex per review-1 OPTIONAL #1 (UI framework / design-system / DB platform / LLM provider names; see § Acceptance Scenario Success Criteria #3).

#### Requires

[WS-1] (Pass-2 stack-detect agent must exist before its schema bump). If WS-1 has already merged in Pass-2 build (per close-off comment 4585141974: bar-199 build snapshotted on `feat/bar-199-audit-workflow`, NOT merged; only the design merged), WS-K instead requires nothing new — it's a fresh build on top of Pass-2's design doc artifact.

#### Rationale

WS-K is the keystone the issue body explicitly identifies as the load-bearing piece. Without `## Applicability` + `requires:` + the 3-state `## Missing Lenses`, the UI/UX lens cannot ship safely on bkit's own repo (false-all-clear risk). WS-K MUST land before any Pass-3 conditional lens prompt (WS-3Δ) and before the orchestrator extension (WS-6Δ) so the contract is defined before its consumers reference it. Bundled as one workstream because the schema + producer + consumer + orchestrator gate are one indivisible contract — splitting them risks documented-vs-implemented divergence (review-1 C2 territory).

### WS-3Δ: Five new lens prompts (`ui-ux`, `supply-chain`, `data-layer`, `ai-llm`, `reference-signal`) + per-lens `requires:` frontmatter

#### Scope

The five new lens prompts under the conditional-lens contract:

- **`bkit-audit-lens-ui-ux.md`** — `requires: hasWebSurface`, class maintainability, tools `Read, Grep, Glob, Write`, opus/high, M (50). Universal-pattern probes (responsive, units/typography floors, a11y semantics + ARIA + alt + focus, WCAG contrast-from-tokens, design-system adherence, i18n string externalisation, layout-shift risk). ZERO framework names. Launch-and-self-no-op clause + sanity-probe-before-emit clause.
- **`bkit-audit-lens-supply-chain.md`** — `requires: hasCi` (defaults true), class security, tools `Read, Grep, Glob, Bash`, opus/high, M (50). Universal-pattern probes (pipeline hardening: unpinned Action SHAs, `pull_request_target` misuse, over-broad token perms, secret-in-logs; supply chain: lockfile integrity, postinstall scripts, typosquat/dep-confusion, committed-secret git-history scan, SBOM/provenance gaps). Bash allowlist block in prompt body (`git log` / `git rev-parse` / `git cat-file` / `cat` / `jq` / `grep`; NEVER `git checkout` / `reset` / `push` / `commit`; **review-1 OPTIONAL #2 — `awk` removed (Turing-complete; `grep` + `jq` cover the parse surface)**) PLUS an honest "discipline-not-sandbox" caveat block ("This allowlist is author guidance; the host does not enforce it. Any prompt edit that widens the allowlist MUST justify the addition in the same edit. Reviewers: grep for `NEVER` in this file on every audit-lens-supply-chain edit."). Launch-and-self-no-op clause. WS-3Δ Done-When adds a grep-gate per review-2 O-6: `grep 'NEVER git checkout' .agents/prompts/bkit-audit-lens-supply-chain.md` returns ≥1 match (confirms the allowlist caveat block survives prompt edits).
- **`bkit-audit-lens-data-layer.md`** — `requires: hasDb`, class performance, tools `Read, Grep, Glob, Write`, opus/high, M (50). Universal-pattern probes (N+1 access patterns, missing indexes, unbounded queries / no LIMIT, transaction / idempotency gaps, migration safety: locking statements + destructive without backfill). Launch-and-self-no-op + sanity-probe-before-emit clauses.
- **`bkit-audit-lens-ai-llm.md`** — `requires: hasLLM`, class security, tools `Read, Grep, Glob, Write`, opus/high, M (50). Universal-pattern probes (prompt-injection surfaces, unvalidated model I/O, PII/secrets to providers, token-cost controls, model-version pinning, eval coverage). Explicit `.agents/**` / `.cursor/**` / `.claude/**` scope exclusion. Launch-and-self-no-op + sanity-probe-before-emit clauses.
- **`bkit-audit-lens-reference-signal.md`** — `requires: hasNetwork`, class maintainability, tools `Read, Grep, Glob, WebSearch, Write`, opus/high, M (50). Detect stack → consult top-3 popular reference repos → flag shared-convention divergence as soft external signal. Always emits `confidence: low` + `source: reference-repo` on every finding (asserted in prompt body; synthesiser R2-O1 post-process FAILs the audit when either field is missing). Bounded to top-3 repos, structure/config/README only. Captures `## Reference Repos Used` provenance (repo names + commit/tag + search query). Launch-and-self-no-op clause. **Review-2 O-2 — zero-hit observability:** when WebSearch returns zero results (no exception, no error), the lens MUST emit a finding with `severity: LOW`, `class: operability`, `what: reference-signal WebSearch returned zero results`, `why: no popular reference repos found for this stack; signal unavailable this run`, `confidence: low`, `source: reference-repo` — preserving the `ran` state (lens ran) while surfacing unavailability in the demoted section instead of masquerading as "no divergence found".
- **11 universal lenses gain `requires: always`** as a one-line frontmatter addition each — minimum-footprint update, no probe-body changes.

#### Requires

[WS-K, WS-1, WS-2]

#### Rationale

Each new lens reads `audit-stack.md` fields (WS-1) including the new `## Applicability` block (WS-K), and any installed `audit-*` skills (WS-2). Five new lenses + 11 frontmatter-only updates bundle as one workstream because they all instantiate the same lens-prompt skeleton with the same `requires:` frontmatter contract (WS-K) and the same launch-and-self-no-op clause — authoring them together preserves the universality-of-shape discipline. The two tool-surface exceptions (`supply-chain` Bash, `reference-signal` WebSearch) are documented in this workstream's prompt bodies + carried into WS-7Δ's `.agents/prompts.md` § Tool set patterns rows.

### WS-4Δ: Synthesiser extension — `## Missing Lenses` 3-state rendering, `source` field dedup-safety

#### Scope

Extends Pass-2's WS-4 synthesiser scope:

- **`bkit-audit-synthesise.md` prompt update:** hardcode the 16 known lens slugs (mirroring `## Applicability — Flag Inventory` + 11 universal slugs); render `## Missing Lenses` one row per slot in the 3-state format; parse `# Not Applicable`-bodied lens artifacts → render `N/A — not applicable ({reason from body's Reason: line})`; parse `## Findings`-bodied artifacts as `ran`; missing/empty/parse-failed artifacts as `crashed`.
- **Dedup safety:** the existing `(class, normalized_location)` dedup key MUST NOT collapse a `source: reference-repo` finding into an internal finding's `confidence` upgrade. Add rule: when deduping across lenses, only internal findings contribute to confidence upgrades; reference-repo findings stay at `confidence: low` and dedup only against other reference-repo findings.
- **Parse-error surfacing:** UNCHANGED from Pass 2 in general behaviour.
- **R2-O1 — Reference-signal field-omission post-process (new in this review pass).** After parsing all 16 lens artifacts, the synthesiser identifies the `audit-lens-reference-signal.md` artifact (by fixed filename) and asserts every parsed `finding` block contains both `source: reference-repo` AND `confidence: low`. Any block missing either field is (a) added to `## Parse Errors` with raw block + reason "reference-signal finding missing required source/confidence field" AND (b) DROPPED from the synthesis body (NOT silently promoted to internal-findings pool). Closes the field-omission bypass that would otherwise let an unmarked reference-signal finding promote through organise to top-critical position. Step 6 `## Parse Errors` non-`None` ⇒ CONCERNS (Pass-2 contract), so the operator sees the alert in the master comment.

#### Requires

[WS-K, WS-3Δ, WS-3] (Pass-2 lens layer + Pass-3 new lens layer must exist before synthesiser parses both; WS-K defines the 3-state coverage contract).

#### Rationale

The synthesiser is the place the 3-state coverage manifest renders and the place the `source` field's dedup-safety lands. Both concerns live in one prompt; splitting them risks divergent updates. Depends on WS-K for the coverage contract and on WS-3Δ + WS-3 for the lens output universe it parses.

### WS-5Δ: Organise extension — reference-signal down-rank grep-assert

#### Scope

Extends Pass-2's WS-5 organise scope:

- **`bkit-audit-organise.md` prompt update:** down-rank rule — `source == reference-repo` OR `confidence == low` findings excluded from: matrix top row (CRITICAL/HIGH columns), ranked-list top 3, per-class appendix's leading entries, executive summary "top findings" block.
- **R1-B2 — In-agent self-verify (not orchestrator post-step gate).** Organise self-verify section adds two checklist clauses: (i) grep the rendered `audit-v2-ranked.md` matrix top row + ranked-list top-3 + per-class appendix leading entries + executive summary "top findings" block for the literal-string tokens `source: reference-repo` AND `confidence: low`; non-empty match ⇒ organise emits verdict FAIL with the offending line(s) cited in the verdict reason; (ii) the orchestrator's existing Step-7 verdict-extract code path routes organise FAIL to Failure Path (no new orchestrator post-step gate added — mirrors the orphan / DAG-cycle self-verify discipline already in `bkit-design-organise`). Organise's tool surface already includes `Bash` (inherited from `bkit-design-organise`'s self-verify) — no tool-surface bump needed.
- **R1-B3 — Renderer-output-format lock.** The organise prompt body specifies the rendering contract for findings in any audit-report block (matrix top row, ranked-list top-3, per-class appendix leading entries, executive summary "top findings" block): each rendered finding MUST be a verbatim echo of the source YAML `finding` fence — copy `source:` / `confidence:` field values character-for-character, preserve field order and indentation, do NOT inline-reformat YAML field syntax (e.g. NEVER render as `source = reference-repo`, NEVER collapse to a one-line `[source: reference-repo]` shorthand, NEVER strip optional fields). This pins the rendered surface so the literal-string self-verify (R1-B2) is sound — `source: reference-repo` and `confidence: low` appear at start-of-line within fenced blocks, greppable. Plan-level check: WS-5Δ Done-When adds a self-test — feed organise a sample synthesis containing one tagged reference-signal finding; assert the rendered output contains the literal `source: reference-repo` token within a `finding` fence (proves the verbatim-echo contract is honoured by the prompt's example output).

Summary agent (`bkit-audit-summary.md`) UNCHANGED — it reads `audit-v2-ranked.md`'s top-of-list, which organise has already enforced the down-rank on.

#### Requires

[WS-4Δ, WS-4]

#### Rationale

Organise renders the matrix + ranked list + per-class appendix; it is the right layer to enforce the down-rank contract because it owns rendering. The self-verify grep-assert is the machine-enforceable contract that prevents prose drift on the "never top/critical" constraint (a load-bearing requirement per comment 4580555629).

### WS-6Δ: Orchestrator extension — input flag parsing, 16-slot fan-out, extended Step 3/5/6 gates

#### Scope

Extends Pass-2's WS-6 orchestrator + registry-rewrite scope:

- **`bkit-audit.md` workflow update:**
  - Step 2 (Worktree Setup): parse new input flags (`--with-websearch`, `[lenses=slug,slug]`, `[applicability-override=flag=bool]`) and stage them into `audit-input.md` for downstream consumption. **`[lenses=...]` validation: each comma-separated slug MUST be one of the canonical 16 (per R1-B1 inline enum below in Step 6); on unknown slug, FAIL Step 2 with recovery hint `Re-invoke with [lenses=...] restricted to: {comma-separated canonical 16-slug list}.`** **Review-2 O-1 — override-parse structured signal:** Step 2 input-parse block emits an explicit line into the Step 2 tracker comment for each `[applicability-override=...]` flag — either `override parsed: hasDb=true` (success) OR `override parse failed: [applicability-override=hasDb] (missing =bool suffix)` (malformed). The orchestrator surfacing the line eliminates the silent-failure path where `## Applicability Overrides` reads `None.` without operator alert.
  - Step 3 (Stack Detect): pass `[applicability-override=...]` to `@bkit-audit-stack-detect`; extend gate to add `## Applicability Disagreement` block ⇒ CONCERNS; extend Step 3 tracker comment to surface one-line Applicability summary (`Stack: ... — applicability: hasWebSurface=true, hasDb=true, hasLLM=false, hasCi=true, hasNetwork=false`).
  - Step 5 (Lens Audits) — **R2-O2 pre-launch stale-artifact cleanup**: BEFORE launching any lens subagent (full OR restricted), the orchestrator runs `rm -f docs/plans/{YYYYMM}/logs/{FID}/audit-lens-*.md` to delete every prior-run lens artifact. Cleanup is unconditional and identical for full vs restricted runs. Fan-out is then **16 fixed slots** (not 11); for a full launch, orchestrator launches all 16 subagents in parallel. For a `[lenses=...]` restricted launch (R2-O2), the orchestrator (a) launches subagents for only the listed slugs AND (b) writes deterministic `# Not Applicable (excluded by [lenses=...] operator)\n\nReason: not in [lenses=...] launch set\n` stub artifacts for the 16 - len(lenses-list) excluded slots — done by the orchestrator directly (not via subagent), so the 16-entry `status.json#steps[5].artifacts` array invariant + Step 6 row-per-slot grep-assert hold for restricted runs identically to full runs. Gate counts artifacts against `status.json#steps[5].artifacts` (fixed-length 16-entry array, one slot per lens slug). Failure Path comment carries the `[lenses=slug,slug]` recovery hint (review-2 O-3) with the canonical 16-slug list inlined.
  - Step 6 (Synthesise) — **R1-B1 canonical 16-slug list inlined verbatim**: extend grep-assert to row-per-slot validation — every of the 16 declared slot slugs (`architecture, hotpath, config, reliability, observability, debt, dead-code, deps, security, tests, docs-drift, ui-ux, supply-chain, data-layer, ai-llm, reference-signal` — this enum IS the canonical source of truth per R1-B1; synthesiser prompt enum + lens `requires:` value union are checked against this list by plan-time grep-assert in WS-K Done-When) MUST appear in `## Missing Lenses` exactly once with a `ran` | `N/A — not applicable (` | `crashed (` state token. The `N/A — not applicable (` state token covers both `flag=false` and `excluded by [lenses=...] operator` reason strings.
- **`.agents/workflows.md` registry-block extension** (Pass-2 already rewrote to 10-step; Pass-3 extends):
  - **Step 3 contract note:** document the `## Applicability` block + flag inventory + override + disagreement.
  - **Step 5 contract note:** document the 16-slot fan-out, `requires:` gating, launch-and-self-no-op, `--with-websearch` flag, 16-entry `status.json` array.
  - **Step 6 contract note:** document the row-per-slot grep-assert.
  - **Step 7 contract note:** document the organise down-rank grep-assert.
  - **Input flag table:** add `--with-websearch`, `[lenses=...]`, `[applicability-override=...]` to the `/bkit-audit` input parsing description; `[skills=false]` already present from Pass 2.
- **Network-surface count update:** the Pass-2 prose "the only network surface in the pipeline, isolated to Step 4" is replaced with "two opt-in network surfaces: Step 4 (`npx skills`, gated by `[skills=false]`) and Step 5 reference-signal lens (gated by `--with-websearch`)."
- **R2-O2 — pre-launch stale-artifact cleanup + `[lenses=...]` excluded-slot stubs.** Add to Step 5 orchestrator pseudo-code: `rm -f docs/plans/{YYYYMM}/logs/{FID}/audit-lens-*.md` before any launch; if `[lenses=...]` was supplied, for each canonical slug NOT in the supplied list, write `# Not Applicable (excluded by [lenses=...] operator)\n\nReason: not in [lenses=...] launch set\n` to `docs/plans/{YYYYMM}/logs/{FID}/audit-lens-{slug}.md`.
- **R2-O1 — synthesiser post-process.** WS-4Δ owns the synthesiser prompt edit, but WS-6Δ orchestrator confirms the `## Parse Errors` non-`None` gate already routes CONCERNS (Pass-2 — no orchestrator change needed beyond verifying the routing).
- **Done-When (review-2 O-5 — downstream-reader compat pre-ship gate):** grep `.agents/scripts/bkit-trackers.ts`, `.agents/scripts/*.ts`, and any `.agents/cloud/*` files for `=== 11`, `=== 16`, `.length === `, `artifacts.length === `, or any hard-coded length comparison against `steps[5].artifacts`. FAIL the workstream if any hit is found that doesn't treat the array as variable-length.
- **Done-When (review-1 OPTIONAL #5 — #202 inline-tracker pair convention):** confirm the rewritten `bkit-audit.md` block uses inline `bkit:tracker github start/end` + `bkit:tracker linear start/end` pairs at every tracker call site (issue init, master comment seed, per-step comment, workstream sub-issue spawn/sync, In-Review state transition). Pass-2's older substitution-from-trackers.md model is NOT to be reused.

#### Requires

[WS-K, WS-3Δ, WS-4Δ, WS-5Δ, WS-1, WS-2, WS-3, WS-4, WS-5]

#### Rationale

Orchestrator + registry-block rewrite stay lockstep (Pass-2 discipline preserved). The Pass-3 extensions touch input parsing, fan-out width, gate counts, and tracker comment shapes — all changes to the same workflow file. Depends on all upstream prompts existing before they can be invoked by `@name`.

### WS-7Δ: Registry & metadata edits extension — `.agents/prompts.md` § Models + § Audit Phase + § Tool set patterns

#### Scope

Extends Pass-2's WS-7 registry-metadata scope:

- **`.agents/prompts.md` § Models** — add 5 new rows (one per Pass-3 lens) with the effort/model/tool/maxTurns assignments from § Components.
- **`.agents/prompts.md` § Audit Phase** — extend agent list to include the 5 new lens slugs; update universality invariant statement to "lens prompts carry NO library names — stack-specificity arrives via `audit-stack.md` (incl. `## Applicability` flags) + installed skills + the audited repo's docs"; add a one-paragraph note documenting the `requires:` frontmatter key + launch-and-self-no-op contract + 3-state `## Missing Lenses` coverage manifest; add a one-paragraph note documenting the `supply-chain` Bash-allowlist exception and the `reference-signal` WebSearch network surface (network count 1 → 2 with `--with-websearch`).
- **`.agents/prompts.md` § Tool set patterns** — add `Read-only reviewer with allowlisted Bash` sub-row noting `bkit-audit-lens-supply-chain` + the documented Bash allowlist (`git log` / `git rev-parse` / `git cat-file` / `cat` / `jq` / `grep`; NEVER `git checkout` / `reset` / `push` / `commit`; `awk` dropped per review-1 OPTIONAL #2) **PLUS the explicit honesty caveat: "the host does not enforce the allowlist — review the prompt body on every audit edit; do not widen the allowlist without an in-edit justification"**; add `Network-tier reviewer` sub-row noting `bkit-audit-lens-reference-signal` + the `confidence: low` + `source: reference-repo` discipline + the synthesiser R2-O1 post-process enforcement + the `## Reference Repos Used` provenance. Also extend `.agents/prompts.md` § Frontmatter Conventions with a one-row addition for `requires:` (allowed values: `always` + the five flag names from `## Applicability — Flag Inventory`; default `always` if omitted) — review-1 OPTIONAL #3 (discoverable for #207's future flag extensions).
- **`.agents/docs.md`** — UNCHANGED for Pass 3.
- **`.agents/skills.md`** — UNCHANGED (curated manually per project memory).
- **`/bkit-ship` Step 10 Prune Skills allowlist** — confirm coverage already includes `audit-*` skill removal (it does by virtue of "removes unlisted `.agents/skills/*`"); no edit needed unless current allowlist excludes `audit-*` explicitly (verify at build time).
- **Out-of-scope tracking:** append the Pass-3-deferred items to `docs/pending.md`: Sonnet-downgrade cost lever revisit; `audit-{framework}` skill authoring follow-up; #207 extended flag taxonomy (`hasMobileApp`, `hasGraphQL`, `hasGRPC`, per-language sub-lenses); Phase 3 full-WebSearch per-lens augmentation; #206 rendered-result UX screenshot review; #83 live runtime-signal lens; #94 `/bkit-debug` hint integration.
- **New decisions for `docs/decisions.md` at build/ship time:** conditional-lens model (`## Applicability` inlined + `requires:` + launch-and-self-no-op + 3-state coverage); reference-signal down-rank contract (`source: reference-repo` machine-enforceable); operator escape hatches; `supply-chain` Bash allowlist exception.
- **Legacy deprecation header** — UNCHANGED from Pass 2 (`Deprecated since` resolved against `package.json#version` at build/ship time).

#### Requires

[WS-K, WS-3Δ, WS-4Δ, WS-5Δ, WS-6Δ, WS-1, WS-2, WS-3, WS-4, WS-5, WS-6]

#### Rationale

Registry/metadata edits reference concrete artifacts: the § Models rows index the 5 new lens prompts (WS-3Δ); the § Audit Phase rationale block documents the orchestrator's input flags + gate contracts (WS-6Δ); the § Tool set patterns rows document the 5 new lenses' tool surfaces (WS-3Δ). Authoring the indexes last guarantees they reference final names, model tiers, and tool surfaces rather than drifting from in-flight prompt definitions. `bkit install` mirror regen (which picks up the new workflow + prompts) happens at session end after all of these land, so this metadata layer is the natural terminal workstream. Per project memory: batch `bkit install` at end-of-session, not per-edit.

---

## Pass-3 Review — CRITICAL Resolutions Map (review-applied this pass)

<!-- prettier-ignore -->
| ID | Source | Resolution location in this design |
| --- | --- | --- |
| **B-1** | review-1 | Step-6 gate canonical 16-slug list = `bkit-audit.md` workflow Step 6 inline enum (single source of truth). Synthesiser prompt enum + lens-prompt `requires:` value union are derived views. Plan-time grep-assert in WS-K Done-When validates equality. Cited in: § Components — Orchestrator; § Data Model — `## Missing Lenses`; § Step-by-step flow row 6; § Enrichment-degradation §6; § WS-K; § WS-6Δ Step 6. |
| **B-2** | review-1 | Reference-signal down-rank check = **in-agent organise self-verify** (mirrors `bkit-design-organise` orphan / DAG-cycle self-verify; NOT an orchestrator post-step gate). Cited in: § Components — Organise; § Data Model — Down-rank rule; § Step-by-step flow row 7; § Enrichment-degradation §7; § WS-5Δ. |
| **B-3** | review-1 | Renderer-output-format lock: organise renders findings by verbatim-echo of the source YAML `finding` fence so `source: reference-repo` and `confidence: low` appear as literal start-of-line tokens within fenced blocks. Cited in: § Components — Organise; § Data Model — Down-rank rule; § WS-5Δ. |
| **O-1** | review-2 (CRITICAL) | Synthesiser R2-O1 post-process for reference-signal field omissions: any reference-signal `finding` block missing `source: reference-repo` OR `confidence: low` is added to `## Parse Errors` AND dropped from synthesis body. Cited in: § Components — Synthesiser; § Data Model — Down-rank rule (R2-O1 block) + `## Parse Errors`; § Step-by-step flow row 6; § WS-4Δ. |
| **O-2** | review-2 (CRITICAL) | `[lenses=...]` restricted-launch semantics: (a) orchestrator writes `# Not Applicable (excluded by [lenses=...] operator)` stubs for excluded slots so the 16-slot `status.json` array + row-per-slot grep-assert hold; (b) orchestrator deletes all `audit-lens-*.md` artifacts at Step-5 entry (full OR restricted) to prevent stale/fresh mixing. Cited in: § Components — Orchestrator (R2-O2 blocks); § Data Model — `## Missing Lenses` (extra reason string + table row); § Step-by-step flow row 5; § WS-6Δ. |

## Pass-3 Review — Optional Items Applied vs Declined

<!-- prettier-ignore -->
| ID | Source | Disposition |
| --- | --- | --- |
| Extend universality grep-gate regex (UI/DB/LLM/CI tokens) | review-1 OPTIONAL 1 | **APPLIED.** § Acceptance Scenario Success Criteria #3 extended with the new regex set + documented `pull_request_target` / `workflow_dispatch` semantic-CI exception for `supply-chain`. WS-K Done-When references the extended gate. |
| `supply-chain` Bash allowlist tighten + caveat | review-1 OPTIONAL 2 | **APPLIED.** `awk` dropped from allowlist; explicit "discipline-not-sandbox" caveat written into lens prompt body AND `.agents/prompts.md` § Tool set patterns sub-row. WS-3Δ Done-When adds `grep 'NEVER git checkout'` regression gate (also satisfies review-2 O-6). |
| Document `requires:` under § Frontmatter Conventions | review-1 OPTIONAL 3 | **APPLIED.** WS-7Δ scope extended to add a one-row addition under `.agents/prompts.md` § Frontmatter Conventions documenting `requires:` (allowed values: `always` + the five flag names; default `always` if omitted). |
| Codify launch-and-self-no-op skeleton as sub-pattern | review-1 OPTIONAL 4 | **APPLIED (already partly covered).** WS-7Δ § Tool set patterns sub-row work covers the new "Conditional read-only reviewer" sub-pattern in the sub-row prose for `bkit-audit-lens-{ui-ux,data-layer,ai-llm,supply-chain,reference-signal}`. No new structural section needed. |
| Reconcile Pass-2 tracker phrasing to #202 inline-pair convention | review-1 OPTIONAL 5 | **APPLIED as a plan-time pre-build check.** Added to WS-6Δ Done-When: confirm the rewritten `bkit-audit.md` block uses inline `bkit:tracker github start/end` + `bkit:tracker linear start/end` pairs at every tracker call site (not the older substitution-from-trackers.md model). Per project memory: #202 inline-tracker refactor is the active convention. |
| Note absolute path convention for new artifacts | review-1 OPTIONAL 6 | **APPLIED in spirit.** Component & data-model references to `audit-stack.md` etc. are conventionally local to `docs/plans/{YYYYMM}/logs/{FID}/`. Plan should use fully-qualified paths; noted in WS-K + WS-3Δ Done-When (artifact filenames are bare in design prose; absolute paths inferred from `{FID}` worktree convention — same posture as Pass-2). |
| Applicability-override parse-failure structured signal | review-2 O-1 | **APPLIED.** Step 2 input-parse block specified to emit `override parsed: hasDb=true` or `override parse failed: [applicability-override=hasDb] (missing =bool suffix)` into the Step 2 tracker comment. Trivial addition to existing input-parse text; no new gate. |
| WebSearch zero-hit observability | review-2 O-2 | **APPLIED.** `bkit-audit-lens-reference-signal.md` prompt body specifies: a zero-hit WebSearch MUST emit a finding with `severity: LOW`, `class: operability`, `what: reference-signal WebSearch returned zero results`, `why: no popular reference repos found for this stack; signal unavailable this run`, `confidence: low`, `source: reference-repo` — so the unavailability surfaces in the demoted section instead of masquerading as "no divergence found". Falls under the R2-O1 field requirement (both `source: reference-repo` and `confidence: low` present). |
| `[lenses=...]` Failure-Path recovery hint | review-2 O-3 | **APPLIED.** Step 5 Failure-Path comment carries the canonical 16-slug list + `[lenses=...]` hint (cited in § Enrichment-degradation contract). Parallels existing `[skills=false]` hint. |
| `## Detection Coverage` `heuristicDepthLimit:` field | review-2 O-4 | **APPLIED as additive field.** `audit-stack.md ## Detection Coverage` block schema extended with an OPTIONAL `heuristicDepthLimit: <int>` field; emitted by stack-detect when depth-limited probes were the binding constraint (no signal found within probe depth). Consumed by the inverse-evidence guard and surfaced in the Step 3 tracker comment one-liner. No schema bump needed (additive optional field on an already-v2 block). |
| Pre-ship gate for `status.json` 16-slot array compat | review-2 O-5 | **APPLIED as Done-When.** WS-6Δ Done-When extended: "Grep `bkit-trackers.ts` + any cloud orchestration code (`.agents/scripts/*`, `.agents/cloud/*`) for `=== 11`, `=== 16`, `.length === `, or `artifacts.length === ` against `steps[5]`. Confirm no hard-coded length comparison." |
| `supply-chain` Bash allowlist review-gate grep | review-2 O-6 | **APPLIED.** WS-3Δ Done-When: `grep 'NEVER git checkout' .agents/prompts/bkit-audit-lens-supply-chain.md` returns ≥1 match. Coupled with review-1 OPTIONAL 2 above (same prompt body edit covers both). |

No OPTIONAL items declined. All accepted on individual merit; none expand scope (no new lenses, no new pipeline steps, no new agent classes, no new top-level artifacts beyond what is already in Pass-3). The R2-O2 escape-hatch handling for `[lenses=...]` does add one orchestrator-written-stub code path, but that lands inside the existing Step 5 orchestrator block — not a structural addition.

---

## Notes for `/bkit-design` Step 4 review

This draft is intended for pass-3 design review. Reviewers should focus on:

- **Keystone correctness:** does the `## Applicability` inlined + `requires:` frontmatter + launch-and-self-no-op + 3-state coverage manifest genuinely fix the false-all-clear problem? UI/UX lens MUST `N/A` on bkit's own repo.
- **Down-rank enforceability:** does the `source: reference-repo` field + organise self-verify grep-assert close the "reference-signal must never be top/critical" requirement without prose drift?
- **Tool-surface invariant:** does the `supply-chain` Bash-allowlist + `reference-signal` WebSearch carrying load fit cleanly into `.agents/prompts.md` § Tool set patterns, or do they violate the "Read-only reviewer" pattern badly enough to need a separate pattern?
- **Workstream re-cut at design organise:** WS-K + WS-3Δ + WS-4Δ + WS-5Δ + WS-6Δ + WS-7Δ — do they consolidate cleanly into the Pass-2 WS-1..WS-7 backbone, or should the build-side workstream cut treat Pass 3 as a fresh decomposition?
- **`audit-applicability.md` sidecar rejection:** brainstorm-3 A made a strong case for a sidecar. The decision to inline into `audit-stack.md` instead saves one contract surface but ties applicability to the stack-detect schema bump cadence — verify this is the right trade.
- **Network-surface count update:** Pass-2 prose says "the only network surface" — confirm the rewritten `.agents/workflows.md bkit-audit.md` block + `.agents/prompts.md` § Audit Phase rationale update both lines together.
