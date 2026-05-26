# Design Brainstorm & Ideas

Lens: Risk premortem — failure modes, scale, time, handover.

Scope frame: revised `/bkit-audit` orchestrator = `bkit-design`-shaped pipeline with TWO new pre-fan-out steps (stack-detect, skill-install) feeding an 11-lens parallel fan-out of universal-pattern prompts, then synthesise -> organise -> summary -> close. v1 = Phases 1+2. Phase 3 (WebSearch), fixers, CI scheduling, cross-repo, #83/#94 are OUT and not designed here. All three approaches below share the lens charter (WS-2..WS-12), the per-finding schema, severity x class matrix + ranked list + per-class appendix output, the master-issue/sub-issue/master-comment-per-step tracker shape, and the authoring constraints (`rules.md`, `workflows.md`, `prompts.md`) carried forward unchanged. They differ ONLY in how the stack signal flows from detect -> skills -> lenses, and how failure of the two new steps degrades.

The dominant new risk vs. the superseded design: the two new steps add a **hard runtime dependency on the network** (`npx skills find/add` hits a registry) and a **new contract surface** (`audit-stack.md`) that 11 downstream agents parse. Both are single points that can poison or stall the entire fan-out. The approaches are ranked by how cleanly they isolate that blast radius.

---

## Approach A — Best-effort enrichment, never a gate ⭐ Recommended

Summary: stack-detect and skill-install are strictly **additive enrichment** steps — every lens runs to full strength on the universal patterns alone, treating `audit-stack.md` and any installed skills as optional context that sharpens findings but is never required for the lens to produce output.

Shape: Step 3 (`@bkit-audit-stack-detect`, single agent, medium) reads manifests/configs/lockfiles/CI and writes a structured `audit-stack.md` with a fixed schema (language / runtime / package-manager / frameworks / build / CI / deploy / db / orm, each a known key with `unknown` as a permitted value). Step 4 (`@bkit-audit-install-skills`, single agent, medium — a sibling of `bkit-build-install-skills`) reads `audit-stack.md`, derives `audit-{stack}` queries, runs `npx skills find/add`, writes `audit-install-skills.md`. Step 5 fans out 11 `@bkit-audit-lens-{slug}` agents in parallel; each reads `audit-stack.md` + target `.agents/docs.md` + `docs/knowledge.md` + whatever skills landed. Both new steps are wrapped so a degraded/empty result lowers a verdict to CONCERNS and annotates the lens context — never Failure Path.

Premortems:

- **10x scale (large monorepo, many manifests):** stack-detect is the hotspot — a 50-package monorepo can produce a sprawling `audit-stack.md` that, fanned out to 11 agents, multiplies token cost and risks per-lens truncation of the stack context. Observability: stack-detect emits a `## Detection Coverage` block (files scanned / packages found / `unknown` field count); a bloated report is visible there. Recovery: cap `audit-stack.md` at a per-section finding count and a roots-summary (don't enumerate every package — summarise the dominant stack + note "N workspace packages"). Blast radius stays contained because lenses degrade gracefully on a thin report.
- **6 months later (drift):** the fixed `audit-stack.md` schema is the load-bearing contract — if a new lens or a new skill expects a field the detector never emits, the coupling is silent. Magic risk: the `audit-{stack}` -> skill-name mapping (`next` -> `audit-nextjs`) is a convention that drifts as the skills registry renames packages. Observability: skill-install logs every `find` query + hit/miss in `audit-install-skills.md`, so a systematically-missing skill family is visible across runs. Recovery: keep the schema documented in `prompts.md` (rationale lives there, per authoring rules) and keep the mapping data-driven (query = `audit-{detected-token}`, no hardcoded skill repo names in the prompt).
- **On-call at 3am (someone runs `/bkit-audit` and it hangs):** the realistic page is `npx skills add` hanging on a slow/blocked registry or a sandbox with no network. Because skill-install is non-gating, the worst case is a slow Step 4, not a dead workflow. Diagnosability: the universal 3600s subagent timeout caps the hang -> Failure Path with a clear `Step 4` attribution. Recovery: add an explicit `[skills=false]` input flag (mirrors `bkit-build` Step 4's skip) so a re-run can bypass the network entirely; document that audit findings are still valid without skills.
- **Author leaves (bus factor):** the genuinely tribal knowledge is "why are there two skill-install agents" (build vs audit) and "what makes a lens prompt 'universal' vs 'leaky'". Concentration risk: the universality discipline lives only in reviewers' heads. Recovery: encode universality as a checkable rule — lens prompts carry a self-contained `**Lens discipline:**` clause forbidding library names, and a `prompts.md` note states the invariant so a future editor doesn't reintroduce `pino`/`zod` lists. The two-skill-agent split is justified once in `prompts.md`.

Risk-mitigation guidance (fold into whichever approach is chosen):

- Make `audit-stack.md` a **versioned, schema-fixed** artifact with an explicit `schemaVersion` line; lenses assert the version and degrade (not crash) on mismatch. This is the single highest-leverage hedge against the new contract surface drifting silently.
- Gate the fan-out on a **coverage manifest**, not on stack-detect success: Step 5 records which of the 11 lenses returned non-empty (reuse the superseded design's `## Missing Lenses` / coverage-check gate). A lens that crashed on a malformed stack report is then visible at synthesise time, not lost.
- Pin both new agents to read-only-plus-Bash tool surfaces deliberately: stack-detect is `Read, Grep, Glob, Write` (provably non-mutating to source); skill-install is `Read, Grep, Glob, Bash` (Bash only for `npx skills`), exactly mirroring `bkit-build-install-skills`. This keeps the "audit is read-only" invariant provable on both hosts.
- Add a one-line `[skills=false]` escape in audit input so air-gapped / offline runs never touch the network.

---

## Approach B — Detect-and-skills as a gating preflight (fail-fast)

Summary: treat stack-detect + skill-install as a **mandatory preflight** that must succeed before the fan-out — if the stack can't be identified or required skills won't install, the workflow stops early with a clear handover rather than producing a stack-blind audit.

Shape: same agents as A, but Step 3/4 emit PASS/FAIL verdicts that gate Step 5. FAIL -> Failure Path with a handover explaining the audit can't run reliably on this repo.

Premortems:

- **10x scale:** same detection hotspot as A, but worse — a partially-parseable monorepo that yields an ambiguous stack now FAILs the whole run instead of degrading. The blast radius is the entire audit. Observability: the handover names the unresolved fields. Recovery is human-in-the-loop (re-run with hints), which defeats the "behaves like `/bkit-design`, autonomous" carry-forward.
- **6 months later:** the gate's pass criteria become brittle invariants — "must detect a package manager" silently excludes any repo that doesn't have one (Go, Rust, polyglot). Six months on, someone audits a non-Node repo and it FAILs at preflight for a stack that the universal lenses could have audited fine. This contradicts the entire point of the re-design (genuine stack-agnosticism).
- **On-call at 3am:** the page is sharper (fails early, clear cause) BUT fires far more often — every transient registry blip or unusual stack becomes a Failure Path. High page volume erodes trust in the workflow.
- **Author leaves:** the gate thresholds (what counts as "detected enough") are pure tribal knowledge with no natural home; a successor will either loosen them to nothing or tighten them into constant false failures.

Risk-mitigation guidance: if any gating is kept, gate ONLY on stack-detect producing a non-empty file (artifact-existence, the universal `workflows.md` gate pattern), NEVER on skill-install or on stack-classification confidence. Skill-install must stay best-effort even here. Provide the `[skills=false]` escape regardless.

---

## Approach C — Skills-first lenses (skills carry detection, prompts are thin)

Summary: push the stack-specific intelligence almost entirely into installed skills — lens prompts become extremely thin universal-pattern stubs, and the audit's depth scales with how many `audit-{stack}` skills the registry happens to have.

Shape: stack-detect still runs, but its main consumer is skill-install; lens prompts read mostly the installed skills (and `audit-stack.md` only as a pointer to which skills to lean on). On a stack with rich skills, audits are deep; on a bare stack, lenses fall back to thin universal probes.

Premortems:

- **10x scale:** fan-out cost now depends on skill payload sizes (community-authored, unbounded) injected into 11 agents — a few heavy skills blow the context budget and truncate lens reasoning. Hardest hotspot of the three.
- **6 months later:** audit quality silently regresses or improves as the **external** skills registry changes — bkit's own audit output is no longer reproducible from bkit's own source. This is the worst drift profile: the load-bearing knowledge lives outside the repo's version control.
- **On-call at 3am:** "the audit got worse and we changed nothing" — because an upstream skill was yanked or renamed. Near-undiagnosable without per-run skill-version capture.
- **Author leaves:** bkit's audit value becomes a function of community skill coverage; no internal owner can guarantee a baseline. Highest external-dependency bus factor.

Risk-mitigation guidance: only viable if lens prompts retain a **complete, self-sufficient universal-pattern baseline** (skills are pure augmentation, exactly the layering table's intent) — at which point C collapses into A. Capture installed skill versions in `audit-install-skills.md` for reproducibility either way.

---

## Decisions

| Decided                                                                                                                                                    | Alternatives                                                   | Why                                                                                                                                                                                                                                                                 |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Stack-detect + skill-install are best-effort enrichment, never gates (Approach A)                                                                          | B fail-fast preflight; C skills-first                          | A preserves the "autonomous, runs on any stack, behaves like `/bkit-design`" carry-forward; B re-introduces human-in-loop on edge stacks and contradicts stack-agnosticism; C makes bkit's audit non-reproducible from bkit's source.                               |
| Revised step order: 1 Start, 2 Worktree, 3 Stack-detect, 4 Skill-install, 5 Lens fan-out, 6 Synthesise, 7 Organise, 8 Summary, 9 Sub-issue spawn, 10 Close | Keep prior 7-step numbering; merge detect+skills into one step | Two extra steps before fan-out per the brief; one agent per step keeps gates/comments/status entries one-per-step per `workflows.md`; mirrors `bkit-design`'s 10-step shape so the orchestrator is pattern-matchable.                                               |
| One lens agent per slug (11 distinct `bkit-audit-lens-{slug}.md`)                                                                                          | One parameterised lens agent invoked 11x                       | Distinct files let each lens carry a slug-specific Process + `Lens:` line and pin per-slot effort/model, matching the existing parallel-fan-out convention; a single parameterised agent can't pin per-lens reasoning depth and muddies the sibling-blind contract. |
| `audit-stack.md` = fixed-schema, versioned artifact with `unknown`-permitted fields + `schemaVersion`                                                      | Free-form prose stack report                                   | A parsed contract for 11 consumers must be schema-stable; free-form prose drifts and each lens re-interprets it differently.                                                                                                                                        |
| `[skills=false]` audit-input escape; skill-install mirrors `bkit-build-install-skills` tool surface (`Read, Grep, Glob, Bash`)                             | Always attempt skills; no escape                               | Offline/air-gapped/registry-down runs must still produce a valid audit; the build phase already establishes this exact skip + tool pattern to reuse.                                                                                                                |
| Skill -> query mapping is data-driven (`audit-{detected-token}`), no hardcoded skill repo names in prompts                                                 | Hardcode `next->audit-nextjs` table in the prompt              | Hardcoded mapping is exactly the stack-leakiness the re-design exists to remove; keep prompt files free of library/skill names, rationale in `prompts.md`.                                                                                                          |

## Cross-Approach Risks

Surface these in the final design's `Risks & Open Questions` section regardless of approach:

- **Network dependency at audit time is brand new.** `/bkit-design` never hit the network; `/bkit-audit` now can via `npx skills`. Any sandbox/CI/offline run must degrade cleanly. Decide the timeout posture for `npx skills add` explicitly (the 3600s step timeout is a backstop, not a fast fail).
- **`audit-stack.md` is a single point feeding 11 parallel readers.** A malformed or truncated report can subtly skew every lens at once with no single failing signal. The coverage manifest at synthesise time is the only place this becomes visible — make that gate non-skippable.
- **Skill provenance / trust.** `find-skills` SKILL.md mandates install-count + source-reputation checks before recommending; an automated audit skill-install step bypasses that human judgement. Decide whether to constrain installs to reputable sources or cap count (mirror the build agent's 10-skill cap) — unvetted community skills become part of the audit's effective logic.
- **Reproducibility.** Two runs of `/bkit-audit` on the same commit can differ if the skills registry changed between them. Capture installed skill identities + versions in `audit-install-skills.md` so a diverging audit is explainable.
- **Universality is unenforceable by tooling.** "No library names in lens prompts" is a review-time discipline with no lint gate; it WILL erode. The only durable hedge is an explicit invariant statement in `prompts.md` plus the per-prompt `**Lens discipline:**` clause — call this out as an accepted residual risk.
- **Legacy `bkit-utility-audit-*` deprecation-header-only.** Four standalone audit prompts get a deprecation header but stay live in v1; until deletion they duplicate coverage and can confuse a maintainer about which audit path is canonical. Flag the deletion as a tracked follow-up, not silent.
- **Stack-detect on polyglot/non-Node repos.** The brief reuses a charter authored against a Node/TS mental model; verify the universal lenses + `unknown`-tolerant schema genuinely hold for a repo with no `package.json` (the whole premise of the re-design), or the stack-agnostic claim is aspirational.
