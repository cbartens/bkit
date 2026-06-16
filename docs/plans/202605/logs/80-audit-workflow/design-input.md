# Design Input — #80 bkit-audit workflow (RE-DESIGN, pass 3)

## Session prompt

`/bkit-design #80 note this is re-design so watch for superseded comments`

## Orchestrator framing — READ FIRST

This is the **third** design pass on issue #80 ("Add bkit-audit workflow parallel best-practice lens audits"). Two designs already merged to `dev`:

1. **`bar-199-audit-workflow`** (original): 7-step / 11-lens. **Superseded.**
2. **`80-audit-workflow`** (re-design pass 2): 10-step / 16-agent, stack-detect + skill-install + universal-pattern lenses. Merged PASS @ 2026-05-26. Canonical doc on `dev`: **`docs/plans/202605/80-audit-workflow-design.md`** (present in this worktree — **READ IT; it is the baseline this pass extends, not replaces**).

**This pass (pass 3) folds the agreed post-design scope additions into that PASS'd design.** It is an _extension_, not a from-scratch redesign. Preserve the proven 10-step / failure-isolation / two-layer architecture; add the new surfaces below.

### Supersession map (the user explicitly said "watch for superseded comments")

**CURRENT / load-bearing (design against these):**

- Issue body **"Current scope (updated 2026-05-31)"** block — _authoritative current scope_.
- The canonical design doc `docs/plans/202605/80-audit-workflow-design.md` — the baseline architecture to extend.
- Comment **4580555629** (2026-05-29) — DECISION: UI/UX lens + reference-repo signal move IN SCOPE; CI-screenshot split to #206.
- Comment **4585042869** (2026-05-30) — DECISION: Tier-1 domain gaps (supply-chain/CI-CD security; data-layer/DB; AI/LLM safety) added to scope.
- Comment **4539759063** (2026-05-26) — Open-question resolutions (still valid; supersede the design doc's "Open questions").
- Comment **4552784986** (2026-05-27) — constraint: editing `.agents/workflows/*` must follow `.agents/workflows.md`; editing `.agents/prompts/*` must follow `.agents/prompts.md`.
- Comment **4571449846** (2026-05-29) — real-world broadened audit prompts/results from consumer repo `gether` (external input link).

**SUPERSEDED (do NOT design against; kept for history):**

- Issue body sections **"Scope (v1 core — original)"**, **"Workflow shape (mirrors bkit-design)"** (7-step table), **"Lens charter (11 lenses)"**, **"Workstreams (Linear sub-issues)"** — explicitly superseded by the design doc + Current scope.
- Old workstream sub-issues **#103 / #104 / #84–#93 / #105 / #106 / #107** — cancelled.
- Comment **4505659816** (architecture direction change, Phase 1/2/3 split) — Phases 1+2 are now folded into the design; the "decision pending (A vs B)" is resolved (folded in). Phase 3 WebSearch == the reference-signal now in scope.
- Comment **4574376335** (candidate Phase-2 lenses discussion) — superseded by the 4580555629 decision; rationale still useful.
- All procedural "Step 1–10" workflow comments from prior runs — navigation artifacts only.

**HISTORICAL context (informative, not a spec):**

- Comment **4539507655** (prior design Summary, PASS) — best single description of the _baseline_ 10-step/16-agent design this pass extends.
- Comment **4539601334** (prior workstream decomposition WS-1..WS-7 → #187–#193).
- Comment **4585141974** (close-off: bar-199 build snapshotted to `feat/bar-199-audit-workflow` @ `581b0e0`; worktree gone; build preserved, not merged).

### What pass 3 must add (the delta over the PASS'd design)

<!-- prettier-ignore -->
| Addition | Type | Notes |
| --- | --- | --- |
| **UI/UX lens** | conditional (frontend surface) | 12th universal-pattern lens. Static frontend-quality: responsive mechanisms, units/typography floors, a11y, WCAG contrast-from-tokens, design-system adherence, i18n, layout-shift. **Zero framework names** in the prompt; framework _how_ rides in via `audit-stack.md frameworks` + an installed `audit-{framework}` skill. Absorbs the previously-deferred a11y/i18n surface (update Out-of-scope). Classifies into existing taxonomy (responsive→compatibility, a11y→operability/reliability, design-system→maintainability). bkit's own repo has no UI → must no-op cleanly (drives the keystone below). |
| **Reference-repo signal** | universal augment (network) | The audit's ONLY outward-looking signal. Detect stack → popular reference repos → divergence as a SOFT signal. First concrete use of the reserved `--with-websearch` flag. **Hard contract: emit at `confidence: low`; synthesise/organise/summary MUST rank strictly below internal-evidence findings — never top/critical.** Recommend opt-in (network/cost/reproducibility). Capture which repos were used; bound to top-3, structure/config/README only. |
| **Supply-chain / CI-CD security** | near-universal | Pipeline hardening (unpinned action SHAs, `pull_request_target` misuse, over-broad token perms, secret-in-logs) + supply chain (lockfile integrity, postinstall scripts, typosquat/dep-confusion, committed-secret/git-history scan, SBOM/provenance). Split-new-lens vs extend `security` — decide in design/build. Likely needs `Bash` (git-history/lockfile scan). Near-universal → fits the always-on fan-out. |
| **Data-layer / DB** | conditional (DB present) | N+1, missing indexes, unbounded queries, transaction/idempotency, migration safety (locking/destructive without backfill). Partly extends `hotpath`; migration-safety new. **Gated on DB presence.** |
| **AI/LLM safety** | conditional (LLM present) | Prompt-injection surfaces, unvalidated model I/O, PII/secrets to providers, token-cost controls, model-version pinning, eval coverage. **Gated on LLM usage.** bkit can partly dogfood. |

**Keystone prerequisite — the conditional-lens model (land a minimal version HERE):**

1. `bkit-audit-stack-detect` emits **applicability flags** (`hasWebSurface`, `hasDb`, `hasLLM`, …) into `audit-stack.md`.
2. Conditional lenses **gate on their flag** and **no-op cleanly** when the surface is absent.
3. `## Missing Lenses` gains a **third coverage state — "N/A — not applicable"** — distinct from "ran, no findings" and "crashed", so a skipped-by-design lens is not read as a clean bill or a breakage.

Without this, bkit's own repo (no UI, no public web surface) would show the UI/UX lens as "ran, nothing found" — a false all-clear. **This is the load-bearing piece to get right first.** (Sequencing tension to resolve in design: comment 4585042869 originally pegged the conditional lenses' model to #207's tier, but the issue body's Current scope + keystone block ask for a **minimal** conditional-lens model landed in THIS issue. Decide the "minimal here vs full in #207" boundary explicitly.)

**Still-valid open-question resolutions (comment 4539759063 — carry into the design):**

1. **Skill trust / WS-2:** reuse the existing build/ship skill machinery _verbatim_, including **uninstall/prune** (10-skill cap, capture installed identities + versions). No new install-count/source-reputation gate. Ensure the ship-side uninstall/prune path also cleans up auto-installed `audit-*` skills.
2. **Lens fan-out models:** keep ALL lenses at `model: claude-opus-4-7`, `effort: high`. No Sonnet downgrades. (Cost is a noted ~4×; the fan-out is now growing well beyond 11 — the Sonnet-downgrade lever is the acknowledged future escape if it binds.)
3. **Version:** do NOT pin. Resolve `Deprecated since` on legacy `bkit-utility-audit-*` headers (and any version ref) against `package.json#version` at build/ship time. Repo is currently at **v2.8.4**; the body's "v2.2.0" is void. The body's "confirm version split before /bkit-plan" still applies as a plan-phase gate.

**Authoring constraints (comment 4552784986 + issue body):**

- `.agents/workflows/*.md` edits → follow `.agents/workflows.md` § Workflow Authoring Rules (Two-Layer Separation, FID/lock/status.json ceremony, Failure Path).
- `.agents/prompts/*.md` edits → follow `.agents/prompts.md` § Prompt Authoring Rules (standalone-runnable, models table, tools, effort).
- ASCII operators only in workflow/prompt files (`!=`, `>=`, `<=`).
- Pattern-match `bkit-design.md` + `bkit-design-*.md` for tone/shape; no audit-specific deviations.

---

## DESCRIPTION (issue #80 body — verbatim, entity-cleaned)

> **Canonical artifacts** (#110 retrofix — durable links on `dev`):
>
> - **Design:** `docs/plans/202605/bar-199-audit-workflow-design.md` ← NOTE: this body link points at the ORIGINAL bar-199 doc; the current canonical is `docs/plans/202605/80-audit-workflow-design.md`.
> - **Logs (delete-eligible):** `docs/plans/202605/logs/bar-199-audit-workflow/`
>   Historical comment links to `docs/plans/drafts|active|completed/` are dead post-#110.

**Linear:** BAR-199 · **Created:** 2026-05-14

### Status

**Design complete (PASS); v1 build in flight on the `bar-199` worktree.** (NOTE: now superseded — see close-off comment 4585141974: bar-199 build snapshotted to its branch, not active.) Canonical design doc: `docs/plans/202605/80-audit-workflow-design.md`.

**Scope expanded post-design** — UI/UX lens, reference-repo signal, and Tier-1 domain audits. See Current scope; decision records in comments (UI/UX + reference-signal = 4580555629; Tier-1 domain gaps = 4585042869).

### Current scope (updated 2026-05-31) — AUTHORITATIVE

> **Canonical spec = the design doc** linked above: a **10-step** orchestrator (stack-detect → skill-install → 11 parallel universal lenses → synthesise → organise → summary → workstreams → close), **16 agents**. The **Workflow shape**, **Lens charter**, and **Workstreams** sections further down are the **original pre-redesign 7-step summary**, superseded by the design doc; the #103/#104/#105/#84–93 workstream sub-issues are **cancelled**. This section is the authoritative current scope.

#### Agreed additions (post-design)

(See the delta table in the orchestrator framing above — identical content: UI/UX lens; reference-repo signal; supply-chain/CI-CD security; data-layer/DB; AI/LLM safety. Web family SEO/AIO/IA + analytics + web-perf + DX and rendered UX are tracked separately in **#207** and **#206**.)

#### Keystone prerequisite — the conditional-lens model

(See orchestrator framing above — stack-detect applicability flags + conditional gating + "N/A — not applicable" coverage state. "Without this, the bkit repo itself (no UI, no public web surface) would show the UI/UX lens as 'ran, nothing found' — a false all-clear. This is the load-bearing piece to get right first.")

#### Build surfaces (when these land via plan/build)

- **`bkit-audit.md`** Step 5 fan-out + gate counts + `status.json` artifacts (new lenses + conditional gating); `--with-websearch` flag for reference-signal.
- **`bkit-audit-stack-detect`** — applicability flags.
- **`bkit-audit-synthesise`** — down-weight reference-signal; honour the "N/A" coverage state. **`-organise`/`-summary`** — ranking (reference-signal never top/critical).
- **`.agents/prompts.md`** (Models + Audit Phase + tool-set rows — `Bash` for supply-chain/CI-CD, network for reference-signal), **`.agents/docs.md`**, and the **design doc** (lens inventory 11→N; new conditional + non-lens agents; Out-of-scope a11y/i18n update).

#### Acceptance additions

- New prompts/subagents exist + wired: UI/UX lens, reference-signal, supply-chain/CI-CD security (+ conditional data-layer / AI/LLM if landed this cycle).
- Reference-signal findings demonstrably ranked **below** internal-evidence findings in the report.
- Conditional-lens model present: stack-detect applicability flags + the "N/A — not applicable" coverage state.

#### Versioning

These exceed the original v2.2.0 target. Expect them across a follow-up minor (e.g. v2.3.0). **Confirm the version split before /bkit-plan** — not assumed here. (Repo currently v2.8.4; "don't pin" per comment 4539759063.)

---

### [SUPERSEDED — kept for history] original pre-redesign body sections

> The sections below are the ORIGINAL pre-redesign summary (7-step / 11-lens). The design doc (10-step / 16-agent) and Current scope supersede them.

**Scope (v1 core — original):** Build `/bkit-audit` running 11 parallel best-practice lens audits → one severity×class prioritised report. Audit is **ad-hoc only** (human-invoked, behaves like `/bkit-design`); NOT part of the design→plan→build→debug→ship auto-cycle. Each run produces: master issue (= report), one sub-issue per workstream, ONE master comment with per-step sections (Step 6 = `audit-summary.md` verbatim), on-disk `docs/audits/{FID}-audit.md`.

**Workflow shape (original 7-step):** 1 Start · 2 Worktree+`audit-input.md` · 3 Lens audits (11× `bkit-audit-lens-{slug}`) · 4 Synthesise · 5 Organise (+workstream sub-issues) · 6 Summary (verbatim to master comment) · 7 Close (`docs/audits/{FID}-audit.md`, → In Review). _(Superseded by 10-step design doc.)_

**Lens charter (original 11 lenses, stack-agnostic):** architecture (maintainability), hotpath (performance), config (compatibility), reliability (reliability), observability (operability), debt (maintainability), dead-code (maintainability), deps (compatibility), security (security), tests (testability), docs-drift (maintainability). Probes stack-agnostic; reports stack-aware (read target repo `.agents/docs.md`); each lens caps at 25 findings severity-sorted. _(Re-design adds stack-detect + skill-install enrichment; pass 3 adds the new lenses above.)_

**Workstreams (original):** [SUPERSEDED/CANCELLED] WS-1 (#103), WS-2..WS-12 (#104 + #84–93), WS-13 (#105); #106/#107 cancelled. Current = design doc WS-1..WS-7 (#187–#193).

### Phase 2 (deferred)

- Runtime probing lens (live error/observability): #83.
- Lens-aware diagnose hint integration with `/bkit-debug` (Pattern A): #94.
- Rendered-result UX screenshot review (full-page seeded render): #206.
- Web-product lens family (SEO/AIO/IA, analytics, web-perf) + DX, and the generic conditional-lens model: #207.

### Out of scope (v1)

- Per-lens fixers (audit is read-only). · CI scheduling / automated audits. · Live runtime-signal lens (→#83). · Cross-repo aggregation. · Deleting standalone `bkit-utility-audit-*` prompts (deprecation header only in v1; deletion target a later minor). · Migrations / api-contracts / rate-limiting / caching lenses — deferred (migrations folds into data-layer; tracked in #207). **a11y / i18n is NO LONGER out of scope — absorbed into the UI/UX lens.** · Cross-workflow hooks (audit standalone; #94 for integration). · Tests, scripts, JSON schemas, helper modules — only workflow + prompts + minimal registry edits. · No `Audit` phase label. · No per-finding Linear/issue comments — findings live on disk + in workstream sub-issue bodies; master comment carries verdicts + summary only.

### Acceptance (issue body)

- `.agents/workflows/bkit-audit.md` exists (10-step orchestrator).
- `.agents/prompts/bkit-audit-lens-{slug}.md` × N + `bkit-audit-synthesise.md` + `bkit-audit-organise.md` + `bkit-audit-summary.md` + `bkit-audit-stack-detect.md` + `bkit-audit-install-skills.md` exist (+ agreed-addition agents).
- Lens prompts portable across repos (stack-agnostic probes). · Output report tailored to encountered stack (lenses read target repo `.agents/docs.md`). · Output format: severity×class matrix + ranked list + per-class appendix + workstream decomposition.
- `.agents/prompts.md` adds Audit Phase section (after Ship, before Utility). · `.agents/docs.md` Workflow Matrix gains `Audit` column.
- Standalone `bkit-utility-audit-{codebase,security,tests,logs}.md` get `Deprecated since` / `Deletion target` header (versions resolved at build/ship against `package.json#version`).
- `bkit install` regenerates `.claude/` and `.cursor/` mirrors at session end.

**Links — Related:** BAR-197 (not imported), #79 (BAR-198), #83 (BAR-207), #94 (BAR-219), #206, #207.

---

## COMMENTS (chronological; substantive content verbatim/entity-cleaned, procedural step-comments condensed)

### [CURRENT] 4539759063 — Open-question resolutions (2026-05-26) — supersede design doc "Open questions"

1. **Skill trust / WS-2 mechanism — reuse the existing build/ship skill machinery verbatim (incl. uninstall), no new reputation gate.** `bkit-audit-install-skills` mirrors `/bkit-build` + `/bkit-ship` install AND uninstall/prune (10-skill cap, capture installed identities + versions). Do NOT add install-count/source-reputation threshold. Plan note: ensure WS-2 also covers the ship-side uninstall/prune path so auto-installed `audit-*` skills are cleaned up consistently — not just install.
2. **Lens fan-out — keep all lenses at `model: claude-opus-4-7`, `effort: high`.** No Sonnet downgrades, despite ~4× design-triplet token cost and ~3.6× the widest existing fan-out. No per-lens model tuning in the plan.
3. **Version — do not pin.** Resolve `Deprecated since` on legacy `bkit-utility-audit-*` headers (and any version reference) against `package.json#version` at build/ship time. The stale "v2.2.0" in the body is void.

### [CURRENT] 4552784986 — Authoring rules reminder (2026-05-27)

IMPORTANT: editing `.agents/workflows/` → ALWAYS follow `.agents/workflows.md` § Workflow Authoring Rules. Editing `.agents/prompts/` → ALWAYS follow `.agents/prompts.md` § Prompt Authoring Rules.

### [CURRENT] 4571449846 — Real-world consumer input (2026-05-29)

Real-world broadened audit prompts and results from consumer repo `gether`: https://github.com/gether-life/app-gether-life/issues/384 — external signal on what a real broadened audit surfaced; useful calibration for lens coverage and report shape.

### [CURRENT — load-bearing scope addition] 4580555629 — Decision: UI/UX lens + reference-repo signal IN SCOPE (2026-05-29)

Of the three candidates (discussion 4574376335), **#1 (UI/UX) and #2 (reference-repo) move into scope** (each = prompt + subagent); **#3 (CI-screenshot) → follow-up #206.**

- **UI/UX lens** = 12th universal-pattern lens (11→12). Forked from read-only-reviewer skeleton (`Read, Grep, Glob, Write`; sibling-blind), `high`/opus, wired into Step 5 fan-out. **No framework names** — audits UI layer abstractly (responsiveness, units/typography floors, a11y, contrast-from-tokens, design-system adherence, i18n, layout-shift); framework _how_ via `audit-stack.md frameworks` + installed `audit-{framework}` skill. Absorbs deferred a11y/i18n (update Out-of-scope). Findings classify into existing taxonomy. Honest ceiling: static catches mechanisms, not rendered result (#206 companion). Dogfooding gap: bkit repo has no UI → no-ops on host; validate against a consumer/sample UI repo at build.
- **Reference-repo signal** = audit's only outward-looking signal: detect stack → popular reference repos → flag shared conventions diverged from. **Not a standard read-only lens** — needs network (WebSearch / GitHub search); concrete first use of the reserved `--with-websearch` Phase-3 slot. **DECISION — must NOT be the most important signal.** Soft lower-confidence "external signal" tier: agent emits `confidence: low` (or dedicated external-signal marker); `synthesise`/`organise`/`summary` MUST rank these strictly below internal-evidence — never top/critical in matrix, ranked list, or exec summary. Confirm at build: always-on vs gated behind `--with-websearch` (recommend opt-in); capture which reference repos used (popularity drifts); bound top-3, structure/config/README only.
- **CI-screenshot → #206** (full-page seeded render across device matrix is per-project; doesn't belong in stack-agnostic audit).
- **Build impact:** Step 5 fan-out (12 lenses + reference-signal agent), gate counts + `status.json` artifacts, synthesise (new lens + down-weight reference), organise/summary (ranking), `.agents/prompts.md` (Models + Audit Phase + tool-set), `.agents/docs.md`, design doc (lens 11→12, new non-lens agent, Out-of-scope a11y/i18n).

### [CURRENT — load-bearing scope addition] 4585042869 — Decision: Tier-1 domain-audit gaps added (2026-05-30)

Three Tier-1 audit domains added; each = prompt + subagent. (Tier-2/3 in #207 — web-perf + DX folded there.)

1. **Supply-chain / CI-CD security — fits the universal fan-out.** Existing `security` lens is app-level (auth, validation, secrets-in-code); `deps` is version hygiene — neither covers pipeline + supply chain: CI/CD hardening (unpinned Action SHAs, `pull_request_target` misuse, over-broad workflow token perms, secret-in-logs); supply chain (lockfile integrity, postinstall scripts, typosquat/dep-confusion, committed-secret/git-history scan, SBOM/provenance). **Build decision:** split new lens vs extend `security`. Near-universal (most repos have CI + deps) → slots into always-on fan-out.
2. **Data-layer / database — stack-conditional.** N+1, missing indexes, unbounded queries (no LIMIT), transaction/idempotency gaps, migration safety (locking / destructive without backfill). Partly extends `hotpath`; migration-safety new. **Conditional on a DB being present.**
3. **AI/LLM safety — stack-conditional.** Prompt-injection surfaces, unvalidated model I/O, PII/secrets to providers, token-cost controls, model-version pinning, eval coverage. New domain; **conditional on LLM usage**; bkit can partly dogfood.
   **Sequencing (honest note):** Only #1 is a clean fit for #80's universal always-on fan-out. #2/#3 are stack-conditional and depend on the conditional-lens model (applicability-gating via stack-detect + "N/A — not applicable" coverage state). Recommended order: #1 now (universal); #2/#3 ride the conditional-lens tier (#207 originally, but the issue body asks for a minimal conditional-lens model landed here — reconcile in design).
   **Cost:** fan-out keeps growing — revisit per-lens model tier (Sonnet-downgrade lever) as it scales.
   **Build impact:** same surfaces as UI/UX + reference-signal additions, + `.agents/prompts.md` tool-set rows (supply-chain/CI-CD likely needs Bash for git-history/lockfile scanning).

### [HISTORICAL — baseline description] 4539507655 — prior design Summary (PASS, 2026-05-26)

Describes the baseline 10-step / 16-agent design this pass extends. Highlights: two-enrichment-step pipeline (stack-detect + skill-install) feeding 11 parallel universal-pattern lenses; enrichment failures degrade gracefully (never gate); output severity×class ranked report at `docs/audits/{FID}-audit.md` + one sub-issue per workstream. ~80% reuse of bkit patterns (bkit-design 10-step shape, bkit-build-install-skills installer, bkit-design-brainstorm-ideate lens skeleton). `audit-stack.md` schema: producer-owned, generic field names (`packageManager` not `IS_PNPM`), permits `unknown` / `[]`, `schemaVersion: 1`. Both enrichment steps non-gating; degraded/absent enrichment → CONCERNS, never Failure Path. Two-layer separation (orchestrator owns tracker/git/lock; 16 leaf agents). Universality: lens prompts carry zero library names (grep-gated). Resolved review CONCERNS: `confidence: low → CONCERNS` guard on stack-detect; `## Parse Errors` section in synthesiser + orchestrator gate; `## Missing Lenses` coverage manifest with grep-assert at Step 6; post-copy assertion on canonical artifact; intermediate progress logging on skill-install. Known limitation: `audit-*` skills don't exist in the public registry yet → Step 4 likely no-ops in v1 (absorbed by non-gating design).

### [HISTORICAL — prior workstream decomposition] 4539601334 — prior Step 9 workstreams (2026-05-26)

Baseline WS DAG (#187–#193): WS-1 #187 stack-detect agent + `audit-stack.md` schema (requires none); WS-2 #188 skill-install agent + provenance log (blocked by #187); WS-3 #189 11 universal lens prompts + `finding`-block schema (blocked #187,#188); WS-4 #190 synthesiser (dedup, coverage manifest, parse-errors) (blocked #189); WS-5 #191 organise + summary (blocked #190); WS-6 #192 `bkit-audit.md` orchestrator + `.agents/workflows.md` rewrite (blocked #187–#191); WS-7 #193 registry/metadata edits + legacy deprecation (blocked #187–#192). (Pass-3 additions will reshape WS-3 lens count and may add agents — the re-design's organise step re-cuts workstreams.)

### [HISTORICAL context] 4585141974 — Close-off: bar-199 build snapshotted (2026-05-30)

bar-199 build committed to `feat/bar-199-audit-workflow` (`581b0e0`): bkit-audit workflow + 11 lens prompts + 3 pipeline prompts (`d8156fc`) + re-design work (2 new prompts `bkit-audit-stack-detect.md`, `bkit-audit-install-skills.md` + revisions). Branch retained for reference/cherry-pick; NOT merged/pushed. Worktree removed. `/bkit-design` (folding the additions) is unblocked — no concurrency collision. Old design/plan docs remain on `dev` as reference.

### [PARTLY SUPERSEDED] 4505659816 — Architecture direction change (2026-05-18)

Proposed the stack-detect + skill-install + universal-pattern pipeline (now the baseline). Phase 1 (stack-detect) + Phase 2 (skill-install + strip stack-specific lists) are folded into the design. Phase 3 (WebSearch augmentation) == the reference-signal now in scope. The "decision pending A vs B" (pull Phase 1 into v1 vs split) is resolved — folded in.

### [HISTORICAL/TANGENTIAL] 4505659883 — Audit-hint injection: where the signal belongs (2026-05-16)

Walked design+plan workflows; concluded review/challenge prompts score what's on paper (would guess at rot). Best hook for design/plan phases = `bkit-plan-generate` (walks the actual surface to enumerate tasks). Recommendation: add `Audit Recommendation: <none|/bkit-audit "..." — rationale>` to `bkit-plan-generate` only + a slot in the plan template; leave the 8 review/challenge prompts alone. (Cross-workflow integration; #94 tracks the debug-side. Not core to this design but a related decision — note as out-of-scope/Phase-2 unless the design wants to mention it.)

### [SUPERSEDED — rationale useful] 4574376335 — Candidate Phase-2 lenses discussion (2026-05-29)

Evaluated three ideas against constraints (read-only over source not a running tree; universality invariant = zero library names; a11y/i18n/migrations/api-contracts/rate-limiting/caching already deferred): (1) Static UI/UX lens — strongest fit, identical modality to existing lenses; (2) Popular-reference-repo signal — = the reserved `--with-websearch`, soft lower-confidence tier, signal-to-noise risk ("popular != correct for your context"); (3) CI-screenshot critique — opt-in, narrowest (screenshots usually only on failed runs; only captured viewports; new network+auth surface). Recommendation became decision 4580555629: #1 + #2 in scope, #3 → #206.

### [HISTORICAL — procedural, prior runs] design workflow step comments

- 4505659978 (2026-05-14): original bar-199 design Steps 1–10; workstreams WS-1..WS-5 → #103–#107; merged dev `9b48bec`; design doc then at `docs/plans/drafts/bar-199-audit-workflow-design.md` (path dead post-#110).
- 4539270777..4539728863 (2026-05-26): re-design pass-2 Steps 1–10. Step 1 note: "Re-design for the architecture direction change … v1 now = stack-detect + skill-install + universal-pattern lens prompts (Phase 1+2). FID `80-audit-workflow`; supersedes old `bar-199-audit-workflow` design + abandoned `feat/bar-199-audit-workflow` branch." Reviews CONCERNS→PASS; organise PASS; summary PASS (full text = comment 4539507655 above). Workstreams = comment 4539601334. Close: canonical `docs/plans/202605/80-audit-workflow-design.md` merged dev `089e40f`. (Close note: a concurrent `/bkit-plan` 160-centralise-install-code shared the repo, flipped `.git/config core.bare` transiently — repaired; no artifact impact.)
