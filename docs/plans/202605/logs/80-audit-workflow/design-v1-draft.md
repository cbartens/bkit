Verdict: PASS

<!-- verdict:end -->

# Design: bkit-audit Workflow Re-design (stack-detect + skill-install + universal-pattern lenses)

## Acceptance Scenario

### Narrative

A developer invokes `/bkit-audit` (ad-hoc, like `/bkit-design`) against any repository — Node/TS, polyglot, or a stack bkit has never seen. The workflow detects the repo's stack, opportunistically installs matching audit skills, runs 11 best-practice lens audits in parallel, and hands back a single severity x class prioritised report at `docs/audits/{FID}-audit.md` plus one tracker sub-issue per finding workstream. When the sandbox is offline or the skills registry is down, the developer still receives a complete, valid audit built on the universal lens patterns alone — the run never stalls or fails for lack of network.

### Success Criteria

1. `/bkit-audit` ships as a 10-step orchestrator (peer to `/bkit-design`), with full FID / lock / status.json / gate / comment-per-step / Failure Path ceremony, ad-hoc-only and terminal at `In Review`.
2. The audit runs to full strength on universal-pattern lenses regardless of whether stack-detect produced a rich report or skill-install installed anything — degraded enrichment lowers a verdict to CONCERNS, never triggers Failure Path.
3. Lens prompts are library-name-free: a `grep` for ecosystem tokens (logger/validator/package-manager/framework names) across `.agents/prompts/bkit-audit-lens-*.md` returns zero matches; stack-specificity arrives only via `audit-stack.md` + installed skills + the target repo's docs.
4. Output is a severity x class matrix + ranked finding list + per-class appendix + a `## Missing Lenses` coverage gate, written to `docs/audits/{FID}-audit.md`, with workstream sub-issues spawned from the organise step.
5. An offline run (`[skills=false]` or registry unreachable) completes without touching the network at skill-install and still ships a valid audit artifact.

### Key Edge Cases

- **Degraded stack detection (failure mode):** `audit-stack.md` is thin, malformed, or omits fields (e.g. polyglot repo, no `package.json`). Lenses assert `schemaVersion`, fall back to `unknown`-valued fields, and run universal probes anyway; stack-detect verdict drops to CONCERNS. Never a Failure Path.
- **Network unavailable at skill-install (failure mode):** `npx skills find/add` hangs or errors on a blocked registry / air-gapped sandbox. Skill-install is non-gating; worst case is a slow Step 4 capped by the 3600s timeout, after which the run proceeds skill-less. The `[skills=false]` input escape bypasses the network entirely on re-run.
- **Single contract feeding 11 parallel readers (cross-feature interaction):** a malformed/truncated `audit-stack.md` could subtly skew every lens at once. The synthesise-time coverage manifest (`## Missing Lenses`) is the non-skippable surface where a lens that crashed on a bad report becomes visible.
- **Lens output cap at scale (failure mode):** 11 lenses x 25-finding cap = 275-finding ceiling; a large monorepo can bloat both `audit-stack.md` and lens output. Per-lens caps + a roots-summary (not per-package enumeration) in the stack report bound token cost; partial per-lens files persist on disk for recovery.
- **Concurrency — same-FID re-audit:** `/bkit-audit BAR-NNN` while the issue's feature FID lock is held → re-audit FID gains an `-audit-{YYYYMMDD-HHmm}` suffix; locks isolate, lineage preserved via FID prefix (carried from superseded design).
- **Skill provenance / reproducibility (cross-feature interaction):** community skills become part of the audit's effective logic, and two runs on the same commit can differ if the registry changed. Installed skill identities + versions are captured in `audit-install-skills.md` so a diverging audit is explainable; the build-agent 10-skill cap bounds blast radius.

## Architecture

Two-layer separation per `.agents/workflows.md` § Two-Layer Separation Rules — the orchestrator owns tracker / git / lock / status.json; all subagents are leaves that write to disk and never call the tracker.

The pipeline is a clone of `bkit-design.md`'s 10-step shape with TWO new enrichment steps inserted before the parallel fan-out:

```
/bkit-audit [target?] [skills=false?]   (top-level slash command, peer to /bkit-design)
   │
   ├── Step 1  Start Workflow        (lock, FID, tracker init, master-comment seed)
   ├── Step 2  Worktree Setup        (.worktrees/{FID}/, audit-input.md, status init; NO pnpm install)
   ├── Step 3  Stack Detect          → @bkit-audit-stack-detect → audit-stack.md
   │       └── reads manifests/configs/lockfiles/CI; emits fixed, versioned schema
   ├── Step 4  Skill Install         → @bkit-audit-install-skills → audit-install-skills.md
   │       └── reads audit-stack.md; npx skills find/add audit-{token}; best-effort, non-gating
   ├── Step 5  Lens Audits (parallel)→ 11 × @bkit-audit-lens-{slug} → audit-lens-{slug}.md
   │       └── each reads audit-stack.md + target .agents/docs.md + docs/knowledge.md + installed skills
   ├── Step 6  Synthesise            → @bkit-audit-synthesise → audit-v1-synthesis.md (cross-lens dedup)
   ├── Step 7  Organise              → @bkit-audit-organise → audit-v2-ranked.md (matrix + workstreams)
   ├── Step 8  Summary               → @bkit-audit-summary → audit-summary.md (Linear-bound; push feat)
   ├── Step 9  Workstream Issues     (spawn/sync one sub-issue per WS-N; blocked-by edges)
   └── Step 10 Close Workflow        (cp v2 → docs/audits/{FID}-audit.md; squash-merge dev; In Review; HARD STOP)
```

### Components & boundaries

- **Orchestrator** (`.agents/workflows/bkit-audit.md`) — Steps 1, 2, 9, 10 are slug-swapped clones of `bkit-design.md` Steps 1, 2, 9, 10 (`design-` → `audit-`); Steps 3–8 reuse the design fan-out / verdict-extract / status-commit / comment-append ceremony 1:1. Step 2 drops `pnpm install --frozen-lockfile` (read-only audit operates on source/manifests, keeps env + vale copy). Step 5 fan-out Context: "You are a subagent in the Audit phase running in parallel with 10 other agents."
- **Stack-detect agent** (`bkit-audit-stack-detect`) — new; reads `package.json`, `tsconfig.json`, `*.config.*`, lockfiles, `.github/workflows/`, container/IaC manifests; emits the fixed, versioned `audit-stack.md` schema with generic field names (`packageManager`, not `IS_PNPM`). Provably non-mutating tool surface (`Read, Grep, Glob, Write`). Verdict: PASS on a populated report; CONCERNS on a thin/`unknown`-heavy report. Never FAIL on degraded detection.
- **Skill-install agent** (`bkit-audit-install-skills`) — new sibling of `bkit-build-install-skills`, identical tool surface (`Read, Grep, Glob, Bash`), effort, maxTurns. Reads `audit-stack.md`, derives data-driven `audit-{detected-token}` queries (NO hardcoded skill-repo names), runs `npx skills find/add`, caps at 10, logs every find query + hit/miss + installed version. "Not found / offline → note, continue." Honours the `[skills=false]` input escape.
- **Lens subagents (11)** — each forked from the `bkit-design-brainstorm-ideate-1` read-only-reviewer skeleton (`Read, Grep, Glob, Write`; sibling-blind). Each INLINES its own universal-pattern probe block (no library names; standalone-runnable). Each reads `audit-stack.md` + target `.agents/docs.md` + `docs/knowledge.md` + any installed `.agents/skills/audit-*`. Caps at 25 findings, severity-sorted. Verdict-bearing.
- **Synthesiser** (`bkit-audit-synthesise`) — clone of `bkit-design-generate` shape (`xhigh`, opus, `Read, Grep, Glob, Write, Edit`). Cross-lens dedup; emits `audit-v1-synthesis.md` + the `## Missing Lenses` coverage manifest.
- **Organise** (`bkit-audit-organise`) — clone of `bkit-design-organise` shape (`high`, opus, `Read, Grep, Glob, Write, Edit, Bash`). Renders severity x class matrix + ranked list + per-class appendix; decomposes findings into `WS-N` workstreams with a `Requires` DAG + coverage self-verify (every finding appears in matrix; orphan → FAIL).
- **Summary** (`bkit-audit-summary`) — clone of `bkit-design-summary` (`low`, haiku, `Read, Write, Edit`); 500-token Linear-bound cap.

### Integration points

- **Tracker layer (orchestrator only)** — issue init / reuse, master comment seed + per-step append, workstream sub-issue spawn/sync (Step 9), state → `In Review` at close. Phase-label handling decided below.
- **`npx skills` CLI + `find-skills` skill** — leaned on, not rebuilt; the only network surface in the pipeline, isolated to Step 4.
- **Registry edits** — `.agents/prompts.md` (Models rows + Audit Phase section + universality invariant + two-skill-agent rationale + deprecation annotations), `.agents/workflows.md` (the existing stale `bkit-audit.md` registry block is rewritten to the new 10-step shape), `.agents/docs.md` (Workflow Matrix `Audit` column + `audit-stack.md`-class artifacts), legacy deprecation headers.
- **`bkit install`** — picks up the new workflow + prompts and regenerates `.claude/` + `.cursor/` mirrors at session end (batch, not per-edit).

## Data Model

### `audit-stack.md` — fixed, versioned schema (owned by `bkit-audit-stack-detect.md`)

The single contract feeding 11 parallel readers. Schema lives in the producing agent's prompt (single source of truth); lens prompts cite the field names in their Read instructions; the orchestrator validates only that the file exists and is non-empty.

```markdown
# Audit Stack Report

schemaVersion: 1

## Stack

language: typescript # known key; `unknown` permitted
runtime: node # `unknown` permitted
packageManager: pnpm # generic key — NOT `IS_PNPM`
frameworks: [next] # list; [] permitted
buildTools: [turbo, esbuild] # list; [] permitted
testRunner: vitest # `unknown` permitted
ci: [github-actions] # list; [] permitted
deployment: vercel # `unknown` permitted
db: [postgres] # list; [] permitted
orm: [drizzle] # list; [] permitted

## Detection Coverage

filesScanned: 42
packagesFound: 7
unknownFieldCount: 1
notes: dominant stack summarised; 7 workspace packages (not enumerated)
```

- Every field is a known key with `unknown` (scalars) or `[]` (lists) as the permitted empty value — no silent missing fields.
- `schemaVersion` is asserted by lenses; on mismatch they degrade (annotate context, run universal probes), never crash.
- `## Detection Coverage` makes a bloated/thin report visible; large monorepos summarise the dominant stack + a package count rather than enumerating every package.

### `audit-install-skills.md` — provenance + reproducibility log (owned by `bkit-audit-install-skills.md`)

Mirrors `bkit-build-install-skills` output, plus per-skill identity + version for reproducibility:

```markdown
# Audit Skills Installed

## Stack Tokens Queried

[Tokens derived from audit-stack.md, e.g. next, vitest, pnpm]

## Already Installed

[audit-* skill folders already present, with versions. If none then `None`]

## Newly Installed

[owner/repo + resolved version per `npx skills add`. If none then `None`]

## Not Found / Skipped

[Tokens with no match, or `skills=false` / offline. If all matched then `None`]
```

### Per-finding schema — YAML-frontmatter fenced `finding` block (reused from superseded design)

Machine-parseable at the lens-output layer; rendered to brief heading format in the final report. Reused verbatim from the superseded design (the schema is detection-mechanism-independent):

````markdown
```finding
severity: CRITICAL          # CRITICAL | HIGH | MEDIUM | LOW
class: reliability          # maintainability | performance | compatibility | reliability | operability | security | testability
location: src/lib/db.ts:42  # file:line OR file:start-end OR pattern
what: broad catch swallows DB lock errors
why: Lock contention fails silently; user sees stale data
direction: Narrow catch to known recoverable errors; log + rethrow on others
confidence: high            # high | medium | low
```
````

Constraints (from superseded §Per-Finding Schema): `what`/`why`/`direction` single-line ≤200 chars; values may contain `:` (split on FIRST only); triple-backticks forbidden inside field values; synthesiser parses via `awk` state-machine (`/^```finding$/,/^```$/`), never `grep -A` (unbounded block length), never `jq`-on-YAML.

## Components / Flows

### Step-by-step flow (10 steps)

| #   | Step              | Subagents                      | Parallelism   | Output                                                    | Verdict role                                       |
| --- | ----------------- | ------------------------------ | ------------- | --------------------------------------------------------- | -------------------------------------------------- |
| 1   | Start Workflow    | —                              | —             | FID, lock, tracker init, master-comment seed              | none                                               |
| 2   | Worktree Setup    | —                              | —             | `.worktrees/{FID}/`, `audit-input.md`, status init        | none                                               |
| 3   | Stack Detect      | `@bkit-audit-stack-detect`     | sequential    | `audit-stack.md`                                          | PASS/CONCERNS (never FAIL)                         |
| 4   | Skill Install     | `@bkit-audit-install-skills`   | sequential    | `audit-install-skills.md`                                 | PASS/CONCERNS (never gates)                        |
| 5   | Lens Audits       | 11 × `@bkit-audit-lens-{slug}` | full parallel | 11 × `audit-lens-{slug}.md`                               | worst-of-surviving lenses                          |
| 6   | Synthesise        | `@bkit-audit-synthesise`       | sequential    | `audit-v1-synthesis.md` + `## Missing Lenses`             | PASS/CONCERNS/FAIL                                 |
| 7   | Organise          | `@bkit-audit-organise`         | sequential    | `audit-v2-ranked.md`                                      | PASS/CONCERNS; FAIL on coverage orphan / DAG cycle |
| 8   | Summary           | `@bkit-audit-summary`          | sequential    | `audit-summary.md` (+ push feat)                          | PASS/CONCERNS/FAIL                                 |
| 9   | Workstream Issues | —                              | —             | one sub-issue per `WS-N`; blocked-by edges                | —                                                  |
| 10  | Close Workflow    | —                              | —             | `docs/audits/{FID}-audit.md`; squash-merge dev; In Review | —                                                  |

### Enrichment-degradation contract (Steps 3–4, the core new behaviour)

Both enrichment steps are wrapped so a degraded/empty result lowers the step verdict to CONCERNS and annotates downstream context — never the Failure Path:

- **Stack-detect** writes `audit-stack.md`. The orchestrator's only gate is artifact-existence-and-non-empty (the universal `workflows.md` gate). A thin/`unknown`-heavy report is the agent's own CONCERNS verdict, not an orchestrator FAIL. Lenses degrade on it.
- **Skill-install** is fully non-gating. `skills found: 0` → SKIP branch (not Failure Path). Offline / `[skills=false]` → SKIP. Only a true subagent crash or the 3600s timeout routes to Failure Path, attributed to Step 4.
- **Coverage manifest at Step 6** is the non-skippable surface: the synthesiser records which of the 11 lenses returned non-empty in a `## Missing Lenses` section (reused from superseded design). A lens that crashed on a malformed report is visible here, not silently lost.

### Lens prompt inventory (11 universal-pattern lenses)

Charter reused verbatim from the superseded design — only the detection mechanism changes (upstream `audit-stack.md` + installed skills, instead of per-lens `STACK_FLAGS` blocks). All library names stripped; probes are purely abstract patterns.

| WS    | Slug            | Class           | Universal-pattern probe (no library names)                                                                                                |
| ----- | --------------- | --------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| WS-2  | `architecture`  | maintainability | Import-graph fan-in/out hotspots; layering breaks; circular deps; chokepoint entrypoints.                                                 |
| WS-3  | `hotpath`       | performance     | Top-level static imports in entrypoints; sync I/O in async paths; heavy init eagerly loaded.                                              |
| WS-4  | `config`        | compatibility   | Build/runtime/deploy config vs actual code shape; manifest divergence; env assumptions in shared modules.                                 |
| WS-5  | `reliability`   | reliability     | Silent swallows; broad catches; unhandled rejections; unclosed handles; unbounded queues/caches; races; missing transactional boundaries. |
| WS-6  | `observability` | operability     | Failure surfaces with no logs/metrics; missing context tags; PII in logs; absent tracing on critical paths.                               |
| WS-7  | `debt`          | maintainability | TODO/FIXME/HACK/XXX + ticket-ID grep; markers vs closed tickets; workarounds without exit conditions.                                     |
| WS-8  | `dead-code`     | maintainability | Unreferenced exports; orphan files; dupe utilities; single-caller wrappers; speculative generality.                                       |
| WS-9  | `deps`          | compatibility   | Manifest-driven dep hygiene; workspace cross-version drift; module-system interop traps; unmaintained packages; types out of sync.        |
| WS-10 | `security`      | security        | Auth holes; input validation; secrets handling; API exposure; data leakage; dep CVE surface; shell injection.                             |
| WS-11 | `tests`         | testability     | Mocked-only critical paths; missing integration tests; flakes/skips without exit; assertion strength.                                     |
| WS-12 | `docs-drift`    | maintainability | `.agents/docs.md` + project docs vs actual code domains; stale invariants; broken refs.                                                   |

Each lens prompt carries: (1) a `Role:` line `Senior auditor — {slug} lens.`; (2) an inlined `**Lens discipline:**` clause forbidding library names (the universality invariant, made checkable per-prompt); (3) its inlined universal probe block; (4) Read instructions for `audit-stack.md` + target `.agents/docs.md` + `docs/knowledge.md` + installed `audit-*` skills; (5) the YAML `finding`-block output format capped at 25 findings; (6) a `Lens: {slug} — {one-line probe summary}.` line under the H1.

### Prompt inventory (full create list)

**New pipeline prompts (5):** `bkit-audit-stack-detect.md`, `bkit-audit-install-skills.md`, `bkit-audit-synthesise.md`, `bkit-audit-organise.md`, `bkit-audit-summary.md`.

**New lens prompts (11):** `bkit-audit-lens-{architecture,hotpath,config,reliability,observability,debt,dead-code,deps,security,docs-drift,tests}.md`.

**Effort / model assignments** (per `.agents/prompts.md` § Models conventions):

| Agent                       | Effort | Claude model              | Tools                               | maxTurns tier |
| --------------------------- | ------ | ------------------------- | ----------------------------------- | ------------- |
| `bkit-audit-stack-detect`   | medium | claude-sonnet-4-6         | Read, Grep, Glob, Write             | M (50)        |
| `bkit-audit-install-skills` | medium | claude-sonnet-4-6         | Read, Grep, Glob, Bash              | S (25)        |
| `bkit-audit-lens-*` (×11)   | high   | claude-opus-4-7           | Read, Grep, Glob, Write             | M (50)        |
| `bkit-audit-synthesise`     | xhigh  | claude-opus-4-7           | Read, Grep, Glob, Write, Edit       | M (50)        |
| `bkit-audit-organise`       | high   | claude-opus-4-7           | Read, Grep, Glob, Write, Edit, Bash | M (50)        |
| `bkit-audit-summary`        | low    | claude-haiku-4-5-20251001 | Read, Write, Edit                   | S (25)        |

### Registry edits

- **`.agents/prompts.md`** — add the 16 new agents to § Models; add a `## Audit Phase` section (after Ship, before Utility) listing the 16 agents + scope; add a § Audit Phase rationale block stating the universality invariant ("lens prompts carry NO library names — stack-specificity arrives via `audit-stack.md` + installed skills + the audited repo's docs") and justifying the two-skill-agent split (build vs audit); annotate the 4 deprecated `bkit-utility-audit-*` rows in § Utility with leading `⚠️ ` + a `(deprecated — see /bkit-audit)` scope suffix; add the two new agents to the § Tool set patterns rows (`Read-only reviewer` gains the lenses; `Skill-installer / Bash-only utility` gains `bkit-audit-install-skills`; stack-detect joins `Read-only reviewer`).
- **`.agents/workflows.md`** — REWRITE the existing stale `bkit-audit.md` registry block (currently documents the superseded 7-step shape with workstream sub-issues at Step 5 and "No `Audit` phase label") to the new 10-step shape: update the File Layout tree comment (`bkit-audit.md  # Workflow 6/6 — 10 steps; hard stop after summary`), update the File Layout table Output cell, replace the per-step table + the Step 5/6/7 contract notes, and reconcile the phase-label decision (below). The status.json `workflow` enum already includes `audit` (no change). Add the universality invariant + enrichment-degradation rationale to the Audit Phase rationale block.
- **`.agents/docs.md`** — add an `Audit` column to the Workflow Matrix (`docs/audits/*.md` → `●`; `docs/knowledge.md`, `docs/architecture.md`, `docs/technology.md`, `docs/security.md` → `○`); add `.agents/skills.md → ○` for Audit (skill-install consults it). No new Full Catalog rows are strictly required for v1 logs artifacts (they live under `docs/plans/{YYYYMM}/logs/{FID}/`), but the canonical `docs/audits/{FID}-audit.md` location is already represented by the `docs/audits/*.md` row.

### Legacy deprecation header

Header-only deprecation in v1 (deletion deferred). Inserted as a block under the frontmatter, BEFORE the first `**Role:**` line, on the four standalone code-quality audit prompts (`bkit-utility-audit-{codebase,security,tests,logs}.md`). `bkit-utility-audit-logs-ship.md` is NOT deprecated (post-deploy health check, ship workflow).

```markdown
> [!CAUTION]
> **Deprecated — use `/bkit-audit`.** Standalone invocation still works for one-off scope; new audits SHOULD use the workflow for lens-diversity + synthesis.
> **Deprecated since:** {current package.json version at build time}.
> **Deletion target:** next minor — pending battle-test of `/bkit-audit`.
```

The `Deprecated since` version is resolved against `package.json#version` at build time (not hardcoded in this draft). Deletion is tracked as a follow-up, not silent.

## Decisions

| Decided                                                                                                                                        | Alternatives                                                                                                                  | Why                                                                                                                                                                                                                                                                                         |
| ---------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Stack-detect + skill-install are **best-effort enrichment, never gates** (lens-3 A; aligns lens-1 A + lens-2 A)                                | lens-3 B fail-fast preflight; lens-2 A's spurious-gate risk                                                                   | Preserves "autonomous, runs on any stack, behaves like `/bkit-design`"; fail-fast re-introduces human-in-loop on edge/polyglot stacks and contradicts the stack-agnostic premise; degraded enrichment is the whole point.                                                                   |
| **Two separate enrichment steps** (detect, then install)                                                                                       | Merged `bkit-audit-preflight`/`-prepare` (lens-1 B, lens-2 C)                                                                 | Keeps `audit-stack.md` a first-class deliverable lenses depend on; lets stack-detect stay provably non-mutating; lets install track `bkit-build-install-skills` verbatim; a merged agent has no partial-progress recovery (install failure would not poison a valid stack report).          |
| **10-step pipeline** (design's 10-step shape + 2 enrichment steps absorbing the fan-out shift)                                                 | 7-step superseded shape; 8/9-step merged/no-workstream variants                                                               | Mirrors `bkit-design.md` exactly (pattern-matchable for humans), keeps one gate/comment/status entry per step, makes the workstream re-cut (#103–#107) mechanical via the design Step 9 machinery.                                                                                          |
| **Lenses INLINE their own universal-pattern probe block**                                                                                      | Charter cited as runtime dependency (lens-1 C); per-lens skill self-discovery (lens-2 B); skills-first thin lenses (lens-3 C) | Standalone-runnable rule forbids cross-file cites (superseded review-1 CRITICAL #2 settled this); per-lens `npx skills` adds a mutating `Bash` surface to 11 read-only agents and duplicates resolution logic 11×; skills-first makes bkit's audit non-reproducible from bkit's own source. |
| **`audit-stack.md` = fixed, versioned, generic-field schema** owned by `bkit-audit-stack-detect.md`                                            | Free-form prose report; schema in a charter or the orchestrator; per-lens `STACK_FLAGS`                                       | A parsed contract for 11 consumers must be schema-stable with `schemaVersion`; producing-agent owns the schema (author = maintainer); generic field names (`packageManager` not `IS_PNPM`) keep lenses library-name-free.                                                                   |
| **Skill-install reuses `bkit-build-install-skills` pattern** via an audit sibling; **data-driven `audit-{token}` mapping**                     | Bespoke install agent; inline-in-orchestrator install; hardcoded `next→audit-nextjs` table                                    | Existing agent already wraps `npx skills find/add`, caps at 10, treats not-found as non-blocking; hardcoded skill names re-introduce exactly the stack-leakiness this re-design removes.                                                                                                    |
| **`[skills=false]` input escape; skill-install tool surface = `Read, Grep, Glob, Bash`**                                                       | Always attempt skills; no escape                                                                                              | Offline / air-gapped / registry-down runs must still produce a valid audit; the build phase already establishes this skip + tool pattern.                                                                                                                                                   |
| **Drop `pnpm install --frozen-lockfile` in Step 2; keep env + vale copy**                                                                      | Keep design Step 2 verbatim                                                                                                   | Audit is read-only; lenses + stack-detect operate on source/manifests, not a built tree.                                                                                                                                                                                                    |
| Audit stays **read-only, ad-hoc-only, terminal at `In Review`**; legacy prompts get a **deprecation header only**                              | Auto-route PASS to Done; delete legacy now; CI scheduling                                                                     | Session-brief carry-forwards; uniform terminal state matches design/plan/build.                                                                                                                                                                                                             |
| **Phase 3 (WebSearch) noted as a Step-5 follow-up slot, not designed**                                                                         | Design `--with-websearch` now                                                                                                 | Explicitly deferred by the brief; the pipeline is shaped so it drops in as an optional lens-step augment without restructuring.                                                                                                                                                             |
| **Reuse the 11-lens charter, finding schema, dedup algorithm, severity×class matrix, and `## Missing Lenses` gate from the superseded design** | Re-derive from scratch                                                                                                        | These are detection-mechanism-independent; only the detection mechanism changes. Re-using them keeps the organise/synthesise output identical and the workstream re-cut mechanical.                                                                                                         |

## Approaches Considered

| Approach                                                                                                                                                                                            | Verdict                                                                           | Why                                                                                                                                                                                                                                                                                                                         |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **lens-1 A — Clone-and-extend `bkit-design` skeleton; two distinct enrichment agents; inlined-probe lenses**                                                                                        | KEPT (structural backbone)                                                        | ~80% reuse of the proven multi-lens-then-synthesise pattern; honours knowledge-layering separation; every prompt standalone-runnable.                                                                                                                                                                                       |
| **lens-2 A — Linear pipeline with strict step isolation; flat versioned `audit-stack.md`; lenses rewritten from scratch as pure universal patterns**                                                | KEPT (step-isolation discipline + clean-rewrite of lenses + flat schema)          | Single-responsibility per step; independently resumable; clean universal lenses avoid Node/TS residue from incremental stripping.                                                                                                                                                                                           |
| **lens-3 A — Best-effort enrichment, never a gate; `schemaVersion`; coverage-manifest gate; `[skills=false]` escape**                                                                               | KEPT (failure-isolation posture + risk mitigations layered onto the chosen shape) | Cleanest blast-radius isolation of the new network + contract-surface risks; mitigations (versioned schema, coverage gate, read-only-plus-Bash tool pins, offline escape) layer onto the merged backbone.                                                                                                                   |
| lens-1 B / lens-2 C — Merged detect+install preflight (`bkit-audit-preflight` / `-prepare`)                                                                                                         | REJECTED                                                                          | Conflates two knowledge layers; `audit-stack.md` becomes a side-effect of an install step; mixes read-only detection with network-install in one sandbox (no longer provably non-mutating); no partial-progress recovery when install fails after detect succeeds; diverges from the `bkit-build-install-skills` precedent. |
| lens-1 C — Charter-doc-driven thin lenses (cited shared charter)                                                                                                                                    | REJECTED                                                                          | Direct violation of the Standalone-runnable rule; re-litigates the superseded review-1 CRITICAL #2 (settled: inline probes, charter is a passive index); ad-hoc lens invocation would fail to find its probes.                                                                                                              |
| lens-2 B — Inline stack context, no skill-install step (lenses self-discover skills)                                                                                                                | REJECTED                                                                          | Adds `Bash`/network to 11 read-only auditors; 11 independent registry calls multiply stall/failure surface; duplicates skill-resolution logic across 11 files; makes lenses non-portable standalone.                                                                                                                        |
| lens-3 B — Detect+skills as a gating fail-fast preflight                                                                                                                                            | REJECTED                                                                          | FAILs the whole run on ambiguous/polyglot stacks the universal lenses could audit fine; gate thresholds become brittle tribal knowledge; high false-page volume erodes trust; contradicts stack-agnosticism.                                                                                                                |
| lens-3 C — Skills-first lenses (skills carry detection, prompts are thin stubs)                                                                                                                     | REJECTED                                                                          | bkit's audit output becomes non-reproducible from bkit's source (load-bearing knowledge lives in an external registry); community skill payloads blow the context budget across 11 agents; collapses into lens-3 A once lenses keep a self-sufficient universal baseline.                                                   |
| **MERGED — lens-1 A (skeleton + inlined lenses) + lens-2 A (step isolation + clean-rewrite + flat schema) + lens-3 A (enrichment-never-gates + versioned schema + coverage gate + offline escape)** | KEPT                                                                              | Each lens approached a different concern; the merge keeps strongest-per-concern (reuse backbone, clean universal lenses, failure isolation) rather than collapsing to consensus.                                                                                                                                            |

## Trade-offs Accepted

**What we gain (vs the rejected alternatives):**

- Genuine stack-agnosticism: lens prompts carry zero library names; new framework support = author a community/bkit `audit-{stack}` skill + maybe one detection token, with zero lens-prompt edits.
- Failure isolation: the two brand-new risk surfaces (network at audit time, a single contract feeding 11 readers) degrade gracefully — every audit still produces a valid report offline and on unseen stacks.
- ~80% reuse of `bkit-design` ceremony + the `bkit-build-install-skills` install pattern; review effort concentrates on the 11 universal probe blocks and the `audit-stack.md` schema, not orchestrator surface.
- Clean step isolation: each step independently resumable; an install failure never poisons the stack report; the coverage manifest surfaces silent lens holes at synthesise time.
- The deferred Phase 3 (WebSearch) slots into the lens step without reshaping the pipeline.

**What we sacrifice:**

- **Token cost** — 11 parallel Opus lenses (~4× the design triplet). Mitigation: 25-finding cap per lens; future lever = downgrade lower-priority lenses to Sonnet for cross-tier diversity (brief punts on model mix; revisit if cost binds).
- **No mechanical enforcement of universality** — "no library names in lens prompts" is a review-time discipline with no lint gate; it WILL erode. Durable hedges: the `prompts.md` invariant statement + the per-prompt `**Lens discipline:**` clause + a grep-gate acceptance criterion carried into the plan (`grep` for library tokens returns zero). Accepted residual risk.
- **External dependency on the skills registry** — audit depth and exact output now vary with registry state; reproducibility relies on `audit-install-skills.md` version capture, not a hard pin.
- **Two skill-install agents** (build + audit) — a small bus-factor/"why two" cost, justified once in `prompts.md`; the payoff is each agent tracking its own query seed without a shared parameterised abstraction.
- **No adversarial review of the synthesis** (audit is terminal, no downstream propagation) — relies on the human reading `docs/audits/{FID}-audit.md` and CONCERNS-triaging.

## Risks & Open Questions

**Risks (surface in plan, mitigations layered onto the chosen shape):**

- **Network dependency at audit time is brand new.** `/bkit-design` never hit the network; `/bkit-audit` can via `npx skills`. Timeout posture: the 3600s step timeout is a backstop, not a fast fail — a slow registry yields a slow Step 4, not a dead run. `[skills=false]` is the explicit fast bypass.
- **`audit-stack.md` is a single point feeding 11 parallel readers.** A malformed/truncated report can subtly skew every lens at once. The `## Missing Lenses` coverage manifest at Step 6 is the only place this becomes visible — make that gate non-skippable. `schemaVersion` assertion + `unknown`-tolerant fields are the contract hedge.
- **Skill provenance / trust.** The `find-skills` SKILL.md mandates install-count + source-reputation checks before recommending; an automated install bypasses that human judgement. Mitigation: inherit the build agent's 10-skill cap; capture installed identities + versions in `audit-install-skills.md`. Whether to constrain installs to reputable sources is an open question (below).
- **Reproducibility.** Two runs on the same commit can differ if the registry changed. Version capture in `audit-install-skills.md` makes a diverging audit explainable but does not pin.
- **Universality is unenforceable by tooling.** Accepted residual risk (see Trade-offs); hedged by the `prompts.md` invariant + per-prompt discipline clause + plan-level grep-gate.
- **Stack-detect on polyglot / non-Node repos.** The charter was authored against a Node/TS mental model; the `unknown`-tolerant schema + universal probes must genuinely hold for a repo with no `package.json`, or the stack-agnostic claim is aspirational. Validate during plan/build.
- **Legacy `bkit-utility-audit-*` deprecation-header-only.** Four standalone prompts stay live in v1 and duplicate coverage; flag deletion as a tracked follow-up, not silent.
- **Stale `bkit-audit.md` registry block in `.agents/workflows.md`** documents the superseded 7-step shape (no `Audit` label, workstream sub-issues at Step 5). This MUST be rewritten in lockstep with the new orchestrator, or the registry and the live workflow diverge.

**Open questions:**

- **Phase-label decision.** The superseded design proposed a new `Audit` phase label; the current `.agents/workflows.md` `bkit-audit.md` block explicitly states "No `Audit` phase label" (identity via title prefix + sub-issue tree + on-disk artifact). These conflict. RESOLVE at organise/build time against the current `.agents/workflows.md` § Phase labels convention — default to NO new phase label (matches the live registry block and avoids a one-time manual label-creation prerequisite per tracker), with audit identity carried by the issue title + artifact + sub-issue tree. Flag for human confirmation if the build agent finds the live block already migrated.
- **Skill source constraint.** Should installs be constrained to reputable sources (install-count / source-reputation threshold) beyond the 10-skill cap? Deferred to plan; default is the build-agent parity (cap only).
- **Phase 3 (WebSearch).** Deferred follow-up — `"{stack} {lens} best practice {year}"` as an optional augment to the lens step, gated by a `--with-websearch` flag. Note as a `docs/pending.md` entry at design-generate close; do not design here.
- **Out-of-scope, append to `docs/pending.md` at close:** legacy `bkit-utility-audit-*` deletion follow-up; Phase 3 WebSearch; per-lens fixers; CI scheduling; cross-repo aggregation; live runtime-signal lens (#83); `/bkit-debug` hint integration (#94).
- **New decisions for `docs/decisions.md` at build/ship time:** stack-detect + skill-install enrichment-never-gates posture; `audit-stack.md` fixed-versioned-schema contract; data-driven `audit-{token}` skill mapping; universal-pattern lens invariant (no library names).
