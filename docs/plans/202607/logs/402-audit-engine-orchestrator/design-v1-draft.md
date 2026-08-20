# Design: `/bkit-audit` engine + lens layer — Pass 4 (reconciliation)

> ### Status of this document
>
> **This is the canonical successor to `docs/plans/202605/80-audit-workflow-design.md` (Pass 3) and `docs/plans/202605/bar-199-audit-workflow-design.md` (Pass 2).** Where this doc and either predecessor disagree, this doc wins. A `/bkit-plan` run on #402, #403 or #405 needs **only this document** — it does not need the Pass-2/Pass-3 docs, the #80 comment thread, or the issue bodies.
>
> **This is a reconciliation pass, not a redesign.** The Pass-3 architecture carries verdict **PASS** and is not re-litigated here: the 10-step orchestrator shape, the stack-detect + skill-install enrichment model, the conditional-lens keystone (applicability flags + `requires:` frontmatter + three-state `## Missing Lenses`), the YAML `finding`-block schema, the reference-signal down-rank contract and the operator escape hatches are all carried forward unchanged. What changes is: contract paths and state format (Task 1), the workstream decomposition (Task 2), the lens charter (Task 3), the synthesiser's dedup→**correlate** upgrade (Task 4 — the one genuine contract change) and the version target (Task 5).
>
> **Scope of this doc:** it charters three peer workstreams — **WS-A (#402)** engine, **WS-B (#403)** universal lens layer, **WS-C (#405)** conditional lens layer — for three independent `/bkit-plan` runs.
>
> **Out of scope, each with its own workstream issue:** runtime/rendered evidence + log-scan onto `debug-fetch` → **WS-E (#83)**; web-product lens family (SEO/AIO/IA, analytics, web-perf, DX) → **WS-D (#207)**; red-team / dynamic adversarial testing → **WS-F (#309)**; recurring loop, ship/milestone gates, model-tier-scoped audit → **WS-G (#324)**. Audit stays **read-only, ad-hoc, terminal at In Review**.
>
> **Provenance note.** The ten post-PASS charter amendments are folded in below. Their rationale lives in #80's comment thread and in the bodies of #403/#405. **Do not cite the comment IDs `5006018836`, `4990615398`, `5008003553`, `4699042917`, `4884166043`, `4884570758`, `4778944021`** — they 404. Where provenance matters, cite **#403 / #405** (which carry the folded content correctly) or the true IDs in § Amendment provenance.

## Related Issues

**Search hit** (`audit lens orchestrator conditional keystone in:title,body`, repo `cbartens/bkit`):

- #80 — Plan milestone: Recurring audits (open) — **standing milestone tracker + workstream map**. Never closed by a merge; do not use closing keywords against it.

**Chartered by this design** (peer workstreams — see § Design Workstreams):

- #402 — WS-A: `/bkit-audit` engine — orchestrator, conditional-lens keystone, pipeline contracts (open)
- #403 — WS-B: universal lens layer — 13 always-on lenses with post-design charter amendments (open)
- #405 — WS-C: conditional lens layer — flag-gated lenses (open)

**Boundaries this design must respect** (do NOT design these):

- #83 — WS-E: runtime & rendered evidence — E1 log-scan → `debug-fetch`, E2 runtime lens, E3 seeded-render UX (open). **E1 is the milestone's do-first item** and gates A7's legacy _deletion_.
- #207 — WS-D: web-product lens family (open)
- #309 — WS-F: red-team workflow (open)
- #324 — WS-G: triggers & automation — recurring loop, ship/milestone gates, scoped audits (open)

**Contract sources this pass reconciles against:**

- #204 — `.agents/` → `.bkit/` relocation (shipped, **selective**)
- #209 — workflow state model: append-only NDJSON `status.jsonl` + branch-local placement (shipped in `0359884`)

**Adjacent, keep aligned (not chartered here):**

- #346 — CI gate on open `CRITICAL` failures / stale `OPEN` deferrals — the automated half of `debt`'s ledger read (see § Coupling 3)
- #374 — Test coverage — overlaps WS-B's `tests` charter
- #260 — Milestone Orchestrator composes the audit engine as its "quality brain" and is also an automated-trigger home. **Who owns scheduling — WS-G or #260 — is an open product decision**, settled before WS-G's design, not here.
- #94 — debug rot-hint (`ROT_LENS_HINT`) — marked CLOSED/COMPLETED but never built; re-open or re-file separately.

**Deleted, no live link exists** (HTTP 410): #187–#193 and #208 (the Pass-2/Pass-3 WS-1..WS-8 sub-issues). **This document is the only surviving copy of that decomposition** — see § Superseded workstream mapping.

## Acceptance Scenario

### Narrative

A developer runs `/bkit-audit` ad-hoc against any repository — their own web app, a UI-less library, or bkit itself — and gets one ranked report at `docs/audits/{FID}-audit.md` plus one tracker sub-issue per workstream cluster, without a line of their code being touched. Every lens that did not apply names itself and its reason (`N/A — not applicable (hasDb=false)`) instead of quietly reading as clean, and truncated or crashed lenses say so too. Where three separate lenses each saw one leg of the same problem, the developer reads one red "silent-corruption candidate" at the top of the report rather than three unrelated middling findings buried in three different classes.

### Success Criteria

1. `/bkit-audit` ships as a 10-step, read-only, ad-hoc orchestrator terminal at `In Review`, fanning out to **18** lens slots and producing `docs/audits/{FID}-audit.md` + one tracker sub-issue per workstream cluster.
2. Coverage is complete and honest: every one of the 18 declared slots renders exactly one state token (`ran` | `N/A — not applicable (` | `crashed (`), a truncated lens renders `ran (truncated: N)`, and a dogfood run on bkit shows every flag-gated slot under the `N/A — not applicable (` token — **never** "ran clean".
3. Correlation fires and reports its own coverage: co-subject findings from `contract-conformance` + `reliability` (+ `tests` / `observability` amplifiers) compose into one `silent-corruption-candidate`, and every declared correlation rule renders a `## Correlation Coverage` row — including `unevaluable (…)` when a leg's lens was N/A, crashed or operator-excluded.
4. Ranking discipline holds: `source: reference-repo` or `confidence: low` findings never occupy the matrix top row, the ranked-list top 3, the per-class appendix's leading entries or the executive summary — enforced by the organise self-verify grep-assert, not prose.
5. The universality and single-source-of-truth gates pass as **shipped tests**, not plan-time rituals: zero library-name matches across `.bkit/prompts/bkit-audit-lens-*.md`; the canonical 18-slug set agrees four ways (workflow Step 6 enum ↔ synthesiser enum ↔ lens `requires:` union ↔ on-disk lens-prompt file set); every `requires:` value is in the flag inventory **and** every inventory flag has at least one consumer.

### Key Edge Cases

- **Conditional lens on an absent surface (the false-all-clear the keystone exists to prevent).** Flag false ⇒ `N/A — not applicable ({flag}=false)`, never "ran, no findings".
- **Flag true but no surface evidence.** Sanity-probe-before-emit: the lens emits `# Not Applicable (flag=true but no surface evidence)` rather than inventing findings. This is the expected outcome for `ai-llm` on bkit's own repo, because `hasLLM` will auto-detect **true** there.
- **A correlation leg's lens never ran.** On `hasDb=false` no `silent-corruption-candidate` can be composed — but "no composed finding" must not read as "no silent-corruption candidates". The rule renders `unevaluable`, a second-order false all-clear one layer above the one the keystone fixed.
- **The 25-finding cap silently evicting a correlation leg.** `reliability`'s pre-up-rank swallowed-write finding is low-severity by the amendment's own argument — exactly what a severity-sorted cap drops first. A truncated leg must not be indistinguishable from a clean one.
- **Sibling-blindness vs cross-lens knowledge.** Five amendments need one lens to know something another lens found. Lens prompts are sibling-blind and standalone-runnable, and a universal lens may not depend on a conditional one — so all cross-lens knowledge is brokered by synthesis, never read directly.
- **Restricted / repeated runs.** `[lenses=…]` must still yield a full-width coverage manifest, and a re-run must never mix stale prior-run lens artifacts with fresh ones.

### Process Sketch

- WHEN `/bkit-audit` is invoked → THEN the stack is detected, applicability flags are set with an audit trail, and any operator override or inverse-evidence disagreement is visible before a single lens runs.
- WHEN all 18 slots fan out → THEN each slot yields exactly one artifact, and each artifact declares one of: findings, `# Not Applicable` with a named reason, or a crash.
- WHEN a lens's `requires:` flag is false → THEN its coverage row reads `N/A — not applicable ({flag}=false)`; WHEN the flag is true but no surface evidence exists → THEN it reads `N/A — not applicable ({flag}=true but no surface evidence)`; **never** `ran`.
- WHEN a lens drops findings at its cap → THEN its coverage row reads `ran (truncated: N)` and the dropped severity floor is stated.
- WHEN findings from `contract-conformance` and `reliability` name the same subject with the expected signals → THEN one composed `silent-corruption-candidate` is emitted with its legs back-linked and retained, up-ranked if a `tests` or `observability` amplifier is present.
- WHEN a required leg's lens was N/A, crashed or operator-excluded → THEN no composed finding is emitted **and** the rule's coverage row reads `unevaluable (…)`, with crash/exclusion routing the run to CONCERNS and flag-false routing to PASS.
- WHEN the report renders → THEN external-signal and low-confidence findings appear only below internal-evidence findings, and the run stops at `In Review` with no code changed.

## Architecture

Two-layer separation per `.bkit/workflows.md` § Two-Layer Separation Rules — the **orchestrator** owns tracker / git / lock / `status.jsonl`; **all 23 subagents are leaves** that write to disk and never call the tracker. The pipeline is a 10-step clone of `/bkit-design`'s shape with two enrichment steps before a parallel lens fan-out. Nothing in the shape changes in Pass 4; the fan-out widens 16 → 18 and the synthesiser gains a correlation pass.

```
/bkit-audit [target?] [skills=false?] [--with-websearch?] [lenses=slug,slug?] [applicability-override=flag=bool?]
   │
   ├── Step 1  Start Workflow      (lock, FID, tracker init, master-comment seed; resume read = worktree-or-dev probe)
   ├── Step 2  Worktree Setup      (.worktrees/{FID}/, audit-input.md, input-flag parse, status init; NO pnpm install)
   ├── Step 3  Stack Detect        → @bkit-audit-stack-detect      → audit-stack.md (schemaVersion: 2, ## Applicability)
   ├── Step 4  Skill Install       → @bkit-audit-install-skills    → audit-install-skills.md   (best-effort, non-gating)
   ├── Step 5  Lens Audits         → 18 × @bkit-audit-lens-{slug}  → 18 × audit-lens-{slug}.md (full parallel)
   ├── Step 6  Synthesise          → @bkit-audit-synthesise        → audit-v1-synthesis.md
   │       └── parse → reference-signal post-process → dedup → CORRELATE → manifests
   ├── Step 7  Organise            → @bkit-audit-organise          → audit-v2-ranked.md
   ├── Step 8  Summary             → @bkit-audit-summary           → audit-summary.md (+ push feat)
   ├── Step 9  Workstream Issues   (pre-chartered here — see § Step 9 is a no-op for THIS design)
   └── Step 10 Close Workflow      (cp v2 → docs/audits/{FID}-audit.md; post-copy assert; squash-merge dev; In Review; HARD STOP)
```

**Subagent count: 23** = 1 stack-detect + 1 skill-install + 18 lenses + synthesise + organise + summary. (Pass 3 said 21 at 16 lenses.)

### Components & boundaries

- **Orchestrator** — `.bkit/workflows/bkit-audit.md`. Steps 1, 2, 9, 10 are slug-swapped clones of `.bkit/workflows/bkit-design.md` (`design-` → `audit-`); Steps 3–8 reuse the design fan-out / verdict-extract / status-append / comment-append ceremony 1:1. Step 2 drops `pnpm install --frozen-lockfile` (read-only audit). Step 5 launches all 18 slots and performs the pre-launch stale-artifact cleanup + excluded-slot stub writes. Step 6 carries the **canonical enums** (lens slugs, signal tokens, correlation rule ids) inline — the single source of truth every derived copy is asserted against.
- **Stack-detect** — `bkit-audit-stack-detect`. Emits `audit-stack.md` `schemaVersion: 2` with `## Stack`, `## Detection Coverage`, `## Applicability`, `## Applicability — Flag Inventory`, `## Applicability Overrides`, `## Applicability Disagreement`. Ingests `[applicability-override=…]` and merges it **after** auto-detection with an audit-trail line. Raises CONCERNS on `confidence: low` or on a non-empty `## Applicability Disagreement`.
- **Skill-install** — `bkit-audit-install-skills`. Reuses the build/ship skill machinery verbatim (install **and** uninstall/prune); 10-skill cap; data-driven `audit-{token}` queries derived from `audit-stack.md`; per-query progress to stdout; honours `[skills=false]`; **fully non-gating**.
- **Lens subagents (18)** — each `.bkit/prompts/bkit-audit-lens-{slug}.md`, forked from the `bkit-design-brainstorm-ideate-1` read-only-reviewer skeleton. **Sibling-blind and standalone-runnable** — no lens reads another lens's artifact. Inventory, gates and probe charters: § Lens inventory — the table of record.
- **Synthesiser** — `bkit-audit-synthesise`. Parses every lens artifact (awk state machine on `/^```finding$/,/^```$/`), runs the reference-signal field-omission post-process, dedups on `(class, normalized_location)`, then runs the new **correlation pass**, then renders `## Missing Lenses`, `## Parse Errors`, `## Correlation Coverage`, `## Correlated Findings`, `## Suggested Guards`.
- **Organise** — `bkit-audit-organise`. Severity×class matrix + ranked list + per-class appendix + workstream DAG + `## Suggested Guards` appendix. Owns the reference-signal down-rank fence and its in-agent self-verify grep-assert; renders findings by **verbatim echo** of the source YAML `finding` fence so the literal-string assert is sound. Inherits `Bash` from the `bkit-design-organise` skeleton for self-verify shell commands.
- **Summary** — `bkit-audit-summary`. 500-token cap; reads `audit-v2-ranked.md`'s top-of-list, which organise has already down-ranked; pushes the feat branch.

### Integration points

- **Tracker layer (orchestrator only)** — issue init/reuse, master-comment seed + one NEW comment per step, workstream sub-issue spawn/sync at Step 9, state → `In Review` at close. **MCP-only writes** for issues/comments/labels (no `gh api`, no raw HTTP); `gh` is fine for PR/CI plumbing. Tracker call sites use the **inline `<!-- bkit:tracker {github|linear|true|false} start/end -->` marker pairs** (#202 convention) — the older substitution-from-`trackers.md` model is NOT reused. No new `Audit` phase label.
- **Network surfaces — exactly two, both opt-in.** Step 4 (`npx skills`, disabled by `[skills=false]`) and Step 5's `reference-signal` lens (enabled only by `--with-websearch` ⇒ `hasNetwork=true`). Pass-2's "the only network surface" prose is stale and A7 replaces it.
- **`bkit install`** — regenerates `.claude/` / `.cursor/` / `.opencode/` mirrors. Batched at session end, never per edit.

### Task 1 — contract relocation (`.agents/` → `.bkit/`, `status.json` → `status.jsonl`)

**The relocation is SELECTIVE, not a blanket `sed`.** Verified against this working tree: `.agents/` still holds `config.md`, `docs.md`, `rules.md`, `skills.md`, and **`.bkit/docs.md` does not exist**. A blanket prefix rewrite would point A7's registry edits and the `docs-drift` lens's probe target at nonexistent paths.

<!-- prettier-ignore -->
| Pass-2/Pass-3 reference | Reconciled target | Verified |
| --- | --- | --- |
| `.agents/workflows/bkit-audit.md` | `.bkit/workflows/bkit-audit.md` | `.bkit/workflows/` exists; the audit file does **not** — greenfield |
| `.agents/prompts/bkit-audit-*.md` | `.bkit/prompts/bkit-audit-*.md` | `.bkit/prompts/` exists |
| `.agents/workflows.md` | `.bkit/workflows.md` | exists |
| `.agents/prompts.md` | `.bkit/prompts.md` | exists |
| `.agents/scripts/bkit-trackers.ts`, `.agents/scripts/*.ts`, `.agents/cloud/*` | `.bkit/src/bkit-trackers.ts`, `.bkit/src/*.ts` (incl. `bkit-status.ts`, `bkit-status-hole-detector.ts`), `.bkit/scripts/*.sh`, `.bkit/cloud.md` | exist |
| `.agents/templates/docs/plans/template.md` | `.bkit/templates/**` | exists |
| **`.agents/docs.md`** | **UNCHANGED — stays `.agents/docs.md`** (template: `.bkit/templates/.agents/docs.md`) | `.bkit/docs.md` does **NOT** exist |
| **`.agents/rules.md`, `.agents/skills.md`, `.agents/config.md`** | **UNCHANGED** | exist at `.agents/` |
| `docs/knowledge.md` | `docs/knowledge.jsonl` | exists |
| `docs/decisions.md` | `docs/decisions.jsonl` | exists |
| `docs/pending.md` | `docs/deferrals.jsonl` (row format: `.bkit/jsonl.md`) | `docs/pending.md` does not exist |
| `ai-llm` exclusion `.agents/** .cursor/** .claude/**` | `.bkit/** .agents/** .claude/** .cursor/** .opencode/**` | all present |
| model pin `claude-opus-4-7` | `claude-opus-5` (`.bkit/prompts.md` § Effort → model: `high` = `claude-opus-5`) | current |

**`status.json` → `status.jsonl`.** State file is `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl` — an append-only NDJSON event log, folded on read. Pattern-match the **live** `.bkit/workflows/bkit-design.md`, not any comment describing it:

- **Write** = one appended line per event: `jq -nc '{type:"step-done",workflow:"audit",step:"…",…}' >> "$STATUS"`.
- **Read** = source `.bkit/scripts/bkit-status-fold.sh`, then `jq -s "$BKIT_STATUS_FOLD" 'fold | …'`. Canonical reducer + tests: `.bkit/src/bkit-status.ts`. `docs/plans/**/status.jsonl merge=union` is already in `.gitattributes`.
- **Event types actually used by the live sibling:** `workflow-started`, `step-done` (carries `parentSha`, optional `verdict`, optional `artifacts`), `workflow-done`, `workflow-failed`, `runtime-resolved` (via `bkit_runtime_row`), `close-transport` (via `bkit_close_transport_row`). **`workflow-meta` is NOT used** — an older #80 comment names it; the shipped file is ground truth.
- **Placement: audit is FEAT-located** (design/plan pattern), not dev-located. Every per-step / Step-2-init / Close write resolves `STATUS="$(git rev-parse --show-toplevel)/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"` from inside the worktree. Step 1's pre-worktree resume read uses the worktree-or-dev probe (`SRC="$REPO_ROOT/.worktrees/{FID}/$STATUS_REL"; [ -f "$SRC" ] || SRC="$REPO_ROOT/$STATUS_REL"`).
- **Close reorder:** append `step-done` + `workflow-done` **before** `git add -A && git commit`, so the events ride the feat commit and reach `dev` via `git merge --squash -X ours feat/{FID}`. Writing them after the commit makes the squash-merge drop them — the exact bug fixed in design/plan by `0359884`.
- **Close namespace / STRAY guard** widened to allow `docs/audits/**` alongside `docs/plans/**`.
- **Failure Path:** append `workflow-failed` to the worktree-or-dev copy, `git rebase --abort`, remove the lock and assert removal, tracker comment with the `bkit:failed` label, **no `dev` push**, leave the worktree for resume, STOP.
- **Subagent cwd:** all 23 `Context:` lines pin `cd "{WORKTREE_PATH}"` (orchestrator-substituted absolute path). Do **not** copy the retired `git rev-parse … --git-common-dir` idiom — it intermittently resolved to the main checkout. Register `{WORKTREE_PATH}` in the Placeholders caution bullet.
- **Runtime adaptation:** source `.bkit/scripts/bkit-runtime.sh` at Step 2 and again at Close; honour `RUNTIME_WORKTREES` / `RUNTIME_DEVPUSHES` / `RUNTIME_GITHUBCLI` exactly as `bkit-design.md` does (local squash-merge under a `.bkit/.dev.lock` critical section vs the `gh pr create`/`merge` path).
- **Locking:** `docs/plans/{YYYYMM}/logs/{FID}/.lock`, `set -C` acquire; the stale-lock cross-check reads the **folded** `status.jsonl` for the lock-owning workflow's last step timestamp (`IN_PROGRESS` + idle < 30 min ⇒ Failure Path; ≥ 30 min ⇒ stale, clean).

**The "fixed-length 16-entry array" statement is retired.** NDJSON has no `steps[]` to index, and the count is no longer 16. Restated invariant: **the Step-5 `step-done` event carries an `artifacts` array with exactly one entry per declared lens slot, and the expected count is derived from the canonical slug enum — never from a literal.** Gated-out and operator-excluded slots still emit an artifact, so a flag bug surfaces as a visible `crashed` row rather than a missing one. Downstream readers MUST treat the array as variable-length; the Pass-3 Done-When grep survives, retargeted and widened (see A7).

### Task 1 (cont.) — drift beyond the two named relocations

Two defects found by inspection, neither covered by a path or format swap. Both are A7's problem:

1. **`.bkit/workflows.md` § `/bkit-audit` carries a third, stale, Pass-1-era spec.** It documents a **7-step, Linear-only** workflow that parses findings by the heading regex `^## \[(\w+)\]\[(\w+)\] (.+) — (.+)$`, spawns Linear sub-issues directly via `save_issue({parentId})` with no GitHub path, has a dedup-only synthesiser with no coverage manifest, and no Step 9/10 split. It contradicts the approved Pass-3 design on **step count, tracker model and finding-parse contract**. It is not stale paths — it is a stale _shape_, and a builder pattern-matching it would rebuild the wrong workflow. **A7 replaces it wholesale**, together with: the File Layout tree comment (`# Workflow 6/6 — 7 steps; planned`), the Output-row cell (`planned — … one Linear sub-issue per workstream`), and the branch-placement table row that groups `audit` with `cloud` as "dev-located, no worktree" (**`cloud` is the only genuinely dev-located workflow**; audit joins the `design/plan/build/debug` feat group).
2. **`.bkit/prompts.md` has no `bkit-audit-*` rows at all** — only the legacy `bkit-utility-audit-*` family. That is consistent with greenfield; A7 authors all 23 § Models rows fresh rather than editing existing ones.

## Data Model

### `audit-stack.md` — schemaVersion 2

Owned by `bkit-audit-stack-detect`. `## Stack` (language, runtime, packageManager, frameworks, buildTools, testRunner, **ci**, deployment, db, orm — `unknown` / `[]` permitted) and `## Detection Coverage` (filesScanned, packagesFound, unknownFieldCount, `confidence: high|medium|low`, notes, optional `heuristicDepthLimit: <int>`) are unchanged from Pass 2/3. Lenses assert `schemaVersion >= 2` and degrade on v1 (annotate context, run universal probes, treat an absent flag as `false` with the manifest reason `unknown applicability — stack-detect schema mismatch`).

```markdown
## Applicability

hasWebSurface: true # UI / rendered surface present → ui-ux
hasDb: true # persistent store with a permission model → contract-conformance
hasDerivedStore: false # a store recomputable from another → derived-data
hasLLM: false # product-path model integration present → ai-llm
hasNetwork: false # orchestrator-set from --with-websearch → reference-signal

## Applicability — Flag Inventory

- hasWebSurface
- hasDb
- hasDerivedStore
- hasLLM
- hasNetwork

## Applicability Overrides

None.

## Applicability Disagreement

None.
```

**Flag inventory changes in this pass — net still 5, composition moves by two seats.**

<!-- prettier-ignore -->
| Flag | Pass-3 consumer | Pass-4 consumer | Change |
| --- | --- | --- | --- |
| `hasWebSurface` | `ui-ux` | `ui-ux` | — |
| `hasDb` | `data-layer` | `contract-conformance` | consumer renamed |
| `hasLLM` | `ai-llm` | `ai-llm` | — |
| `hasNetwork` | `reference-signal` | `reference-signal` | — |
| `hasCi` | `supply-chain` | **none** | **DELETED from the inventory** — `supply-chain` becomes `requires: always` |
| `hasDerivedStore` | — | `derived-data` | **NEW** |

`hasCi` is deleted rather than kept orphaned. An inventory flag with zero consumers is dead config — precisely the class `dead-code`'s new amendment probes for, and bkit would have shipped it. **The CI signal itself is not lost:** `## Stack`'s `ci:` field survives and is what `supply-chain`'s sanity-probe-before-emit reads. Enforcement becomes **bidirectional**: every `requires:` value must appear in the Flag Inventory **and** every Flag Inventory entry must have at least one lens consumer (see A7's parity test).

**Detection heuristics** (stack-agnostic, encoded in the stack-detect prompt body — lens authors never re-implement detection):

- `hasWebSurface` — a rendered/markup surface exists: markup or component source files, a public asset root, a route/page directory tree, or a declared UI-layer framework in `## Stack frameworks`.
- `hasDb` — a persistent store with a permission or schema model exists: a declared store/ORM in `## Stack`, a migration or schema-definition directory, or a store client configured from environment credentials.
- `hasDerivedStore` — **new; see below.**
- `hasLLM` — a product-path model integration exists: a model-provider client dependency, provider credentials in environment examples, or request-path code that submits prompts and consumes model output. **Agent-tooling assets do not count** (see the self-reference rule).
- `hasNetwork` — orchestrator-set only; auto-detection always emits `false`; `--with-websearch` flips it to `true`.

**`hasDerivedStore` detection heuristics** (this is the flag `/bkit-plan` on #405 was blocked on). True when **any** of:

1. a store object whose declaration, name or adjacent annotation marks it as derived, materialised, denormalised or cached from another store;
2. a scheduled or queued recompute path that writes a store which a request path also writes;
3. a second store client/handle configured alongside the primary store whose contents are recomputable from it;
4. a persisted artifact written by a refresh/build path and read by a request path, where the same value is independently derivable from a source store.

**Inverse-evidence guard for `hasDerivedStore`** (this flag is the hardest to detect and the most likely to false-negative): emit `## Applicability Disagreement` + CONCERNS when the flag is `false` **and** any of (a scheduled recompute path exists; a store name or annotation matches a derived/cache-shaped token; two distinct store clients are configured; a request path writes the same conceptual value to two stores). `hasDerivedStore` is **independent of `hasDb`** — a derived store can exist without a database (materialised files, in-memory read models).

**`## Applicability Overrides`** carries one audit-trail line per supplied `[applicability-override=flag=bool]`, merged **after** auto-detection. **`## Applicability Disagreement`** is the inverse-evidence guard; non-empty ⇒ Step-3 verdict CONCERNS. Both are unchanged in shape from Pass 3.

### Per-lens frontmatter — `requires:`

Existing keys (`name`, `description`, `model`, `effort`, `tools`, `maxTurns`) unchanged. `requires:` takes `always` (13 universal lenses) or one flag name from `## Applicability — Flag Inventory` (5 conditional lenses). Default `always` if omitted. Documented under `.bkit/prompts.md` § Frontmatter Conventions.

### Per-finding schema — the `finding` block

The YAML-fenced `finding` block from Pass 2 is the canonical and only format, and its **required fields are unchanged**. Pass 4 adds **additive optional** fields only — the sanctioned extension path (the `source:` precedent; a migrating `tier:` field was REJECTED in Pass 3 for exactly this reason). Parsers MUST default-tolerate absence of every optional field.

````markdown
```finding
severity: CRITICAL          # CRITICAL | HIGH | MEDIUM | LOW
class: reliability          # maintainability | performance | compatibility | reliability | operability | security | testability
location: src/lib/store.ts:42
what: broad catch swallows the write outcome
why: the caller sees success; the row was never written
direction: check the write outcome; narrow the catch; log and rethrow on unknown errors
confidence: high            # high | medium | low
source: internal            # OPTIONAL — internal (default, omitted) | reference-repo (reference-signal lens only)
subject: store:member_cache # OPTIONAL — {kind}:{name}; correlation join axis
signal: unchecked-write     # OPTIONAL — controlled token from the canonical signal enum
evidence: static            # OPTIONAL — static (default, omitted) | static-only-runtime-unverified | static-composed
guard-ref: logic-dupe-guard-1 # OPTIONAL — id of an entry in the artifact's ## Suggested Guards
```
````

**Field rules that already bind and still bind:** every field value is a **single line**; `direction:` is capped at 200 characters; **triple-backticks are forbidden inside any field value** (they would close the fence). This is why the `logic-dupe` CI guard cannot live in `direction:` — see `## Suggested Guards`.

**`subject:`** — `{kind}:{name}`. `kind` from a documented open set: `store`, `queue`, `endpoint`, `job`, `flag`, `surface`. `name` is normalised by the synthesiser: casefold, non-alphanumerics collapsed to `_`, repeats collapsed, leading/trailing `_` stripped. **Emitted by any lens whose finding is about a named addressable resource.** Absent ⇒ the finding is simply un-correlatable; that is never an error.

**`signal:`** — a controlled token naming _what was observed_, so the correlator joins on the observation and not merely on the resource. Each lens declares its own signal tokens; the union is the **canonical signal enum**, whose home is the `bkit-audit.md` Step-6 block beside the slug enum, with a derived copy in the synthesiser prompt held honest by the same parity assert. v1 enum:

<!-- prettier-ignore -->
| Emitting lens | Signal tokens |
| --- | --- |
| `contract-conformance` | `restricted-subject`, `role-mismatched-write`, `unchecked-restricted-write` |
| `reliability` | `unchecked-write`, `swallowed-error` |
| `tests` | `non-discriminating-test`, `hollow-boundary` |
| `observability` | `double-blind-failure` |
| `derived-data` | `dual-source-writer`, `unsynced-derived-path` |

**`evidence:`** — carries provenance-strength markers that must survive dedup and must **not** be expressed as `confidence: low`. `static-only-runtime-unverified` is the `tests` lens's hollow-boundary marker (Pass-3.1 froze this as a **per-finding marker on a `ran` slot, never a fourth manifest state**). `static-composed` is set by the synthesiser on composed findings. Organise echoes `evidence:` verbatim exactly as it echoes `source:`.

> **Load-bearing negative rule.** The hollow-boundary marker MUST NOT be expressed as `confidence: low`, and MUST NOT be carried as free prose in `why:`. `confidence: low` trips the reference-signal down-rank fence, which would bar a genuine boundary gap from the matrix top row and the ranked-list top 3 — the exact inverse of the intent. Free prose does not survive the first dedup merge. It must be a field.

### Per-lens artifact contract

Each `audit-lens-{slug}.md` carries one of three body shapes, plus optional sections:

- `## Findings` — zero or more `finding` fences. **Cap: 25 findings, severity-sorted.**
- `# Not Applicable` + a `Reason:` line — `{flag}=false`, `{flag}=true but no surface evidence`, `not in [lenses=...] launch set`, or `unknown applicability — stack-detect schema mismatch`.
- missing / empty / parse-failed ⇒ `crashed`.

**`## Truncated`** — emitted whenever the cap dropped findings: the dropped count and the severity floor of the dropped set. The synthesiser renders the slot as `ran (truncated: N)`. **A truncated lens must never be indistinguishable from a clean one.**

**Cap reserve.** Within the 25, up to **5 slots are reserved** for findings that carry both `subject:` and a declared `signal:`. Severity sorting applies within and outside the reserve. Rationale: `reliability`'s pre-up-rank swallowed-write finding is low-severity in isolation — exactly what a severity-sorted cap evicts first — and losing it degrades a correlation into silence. `debt` additionally divides its 25 across its three probe groups (ledger / suppression / cruft) so the ledger cannot starve the other two.

**`## Suggested Guards`** — optional; currently emitted only by `logic-dupe`. One entry per confirmed rule, id `{slug}-guard-{n}`, a one-line title, and a fenced copy-pasteable grep/lint guard. Findings reference an entry via `guard-ref:`. The synthesiser passes the section through verbatim; organise renders it as an appendix in `audit-v2-ranked.md`. **Audit stays read-only — the guard is emitted as text and never installed.** The guard body is generated against the audited repo and may contain that repo's identifiers; the _example_ inside the shipped prompt must stay stack-agnostic.

**`## Subject Aliases`** — optional; currently emitted only by `contract-conformance`. One line per resolved alias set (`store:member_cache = memberCache, member_cache_v2`), or `None.`. `contract-conformance` is the only lens that empirically knows these, because building the grant matrix and enumerating write sites is what surfaces the identifier variants. The synthesiser consumes it as tier-2 subject resolution.

### `## Missing Lenses` — three-state coverage manifest, 18 rows

One row per declared slot, always present, exactly one state token. **Row-per-slot, prefix-matched.**

```markdown
## Missing Lenses

- architecture: ran
- hotpath: ran
- config: ran
- reliability: ran
- observability: ran
- debt: ran (truncated: 12)
- dead-code: ran
- deps: ran
- security: ran
- supply-chain: ran
- tests: ran
- docs-drift: ran
- logic-dupe: ran
- ui-ux: N/A — not applicable (hasWebSurface=false)
- contract-conformance: N/A — not applicable (hasDb=false)
- derived-data: N/A — not applicable (hasDerivedStore=false)
- ai-llm: N/A — not applicable (hasLLM=true but no surface evidence)
- reference-signal: N/A — not applicable (hasNetwork=false)
```

<!-- prettier-ignore -->
| State token | Meaning | Source |
| --- | --- | --- |
| `ran` | Artifact exists, non-empty, `## Findings` body. MAY carry a ` (truncated: N)` suffix — **this is not a fourth state**; the assert matches the token as a prefix. | Lens artifact + parser |
| `N/A — not applicable (` | Lens self-no-opped (`{flag}=false`), sanity-probed to nothing (`{flag}=true but no surface evidence`), was operator-excluded (`excluded by [lenses=...] operator`), or hit a schema mismatch. All four reason strings share one token prefix. | `# Not Applicable`-headed body, written by the lens or by the orchestrator for excluded slots |
| `crashed (` | Artifact missing, empty, or parse-failed at the awk boundary. | Orchestrator artifact gate + synthesiser fallback |

The Step-6 grep-assert: each of the 18 canonical slugs MUST appear exactly once as `- {slug}: ` followed by exactly one of the three token prefixes. Missing row or unknown token ⇒ first absence re-issues the synthesiser with a tightening prompt; second absence ⇒ Failure Path.

### `## Correlation Coverage` — one row per declared correlation rule

A structural twin of `## Missing Lenses`, one layer up. A rule that _cannot fire_ because a leg's lens never ran is the same false all-clear as a lens that never ran.

```markdown
## Correlation Coverage

- silent-corruption-candidate: unevaluable (contract-conformance: N/A — not applicable (hasDb=false))
```

State tokens, prefix-matched, one row per rule id: `fired (N)` | `no match` | `unevaluable (`. Validated by a Step-6 grep-assert cloned from the row-per-slot assert (same shape, same failure handling).

### `## Correlated Findings` and `## Parse Errors`

`## Correlated Findings` holds the synthesiser-authored composed findings (shape and rules: § Task 4). It renders **above** the ranked list and is **excluded from the severity×class matrix** — legs are counted once, as atoms, so composition never double-counts.

`## Parse Errors` is unchanged: raw block + reason, body `None` when clean, non-`None` ⇒ CONCERNS. It gains one new contributor beyond the existing general-parse and reference-signal-field-omission entries: a `subject:` whose value does not match `{kind}:{name}` with `kind` in the documented set.

## Components / Flows

### Step-by-step flow (10 steps, 23 subagents)

<!-- prettier-ignore -->
| # | Step | Subagents | Parallelism | Output | Verdict role |
| --- | --- | --- | --- | --- | --- |
| 1 | Start Workflow | — | — | FID, lock, tracker init, master-comment seed | none |
| 2 | Worktree Setup | — | — | `.worktrees/{FID}/`, `audit-input.md` (parsed input flags), `workflow-started` + status init | none |
| 3 | Stack Detect | `@bkit-audit-stack-detect` | sequential | `audit-stack.md` | PASS / CONCERNS (never FAIL). CONCERNS on thin or `unknown`-heavy detection, `confidence: low`, or non-empty `## Applicability Disagreement` |
| 4 | Skill Install | `@bkit-audit-install-skills` | sequential | `audit-install-skills.md` | PASS / CONCERNS; **never gates** |
| 5 | Lens Audits | **18** × `@bkit-audit-lens-{slug}` | full parallel | **18** × `audit-lens-{slug}.md` | worst-of-surviving-lenses; `N/A` slots are not "surviving" (they ran no probe) |
| 6 | Synthesise | `@bkit-audit-synthesise` | sequential | `audit-v1-synthesis.md` + `## Missing Lenses` + `## Parse Errors` + `## Correlation Coverage` + `## Correlated Findings` + `## Suggested Guards` | PASS / CONCERNS / FAIL; gate greps all four manifest sections |
| 7 | Organise | `@bkit-audit-organise` | sequential | `audit-v2-ranked.md` | PASS / CONCERNS; FAIL on coverage orphan, DAG cycle, or down-rank violation (in-agent self-verify) |
| 8 | Summary | `@bkit-audit-summary` | sequential | `audit-summary.md` (+ push feat) | PASS / CONCERNS / FAIL |
| 9 | Workstream Issues | — | — | one sub-issue per `WS-N` cluster; blocked-by edges | — |
| 10 | Close Workflow | — | — | `docs/audits/{FID}-audit.md` (post-copy asserted); squash-merge `dev`; `In Review`; HARD STOP | — |

**Step-5 mechanics (all carried forward from Pass 3, unchanged except width):**

- **Pre-launch stale-artifact cleanup** — before ANY lens launch, full or restricted: `rm -f docs/plans/{YYYYMM}/logs/{FID}/audit-lens-*.md`. Unconditional, identical code path both ways.
- **`[lenses=…]` restricted launch** — launch only the listed slugs, and write a deterministic `# Not Applicable (excluded by [lenses=...] operator)` stub artifact directly (not via a subagent) for every excluded slot, so the one-artifact-per-slot invariant and the row-per-slot assert hold identically. Unknown slug ⇒ Step-2 FAIL with the canonical 18-slug list as the recovery hint.
- **Launch-and-self-no-op** — the orchestrator never pre-filters on a flag. Every conditional lens launches and self-no-ops, so a stack-detect flag bug still leaves a launch artifact, a `# Not Applicable` body and a flag-named manifest row.
- **Failure-Path recovery hint** — `Re-invoke with [lenses=slug,slug] …; valid slugs: {canonical 18-slug list}.` Parallels the `[skills=false]` hint.

### Task 3 — Lens inventory: the table of record

**Every lens count in this document derives from this table. Nothing else is a count source.**

```
Pass-3 inventory                     16   (11 universal + 5 conditional)
  minus lenses dropped                0
  plus  NEW logic-dupe (universal)   +1
  plus  NEW derived-data (cond.)     +1
                                    ----
Pass-4 inventory                     18   = 13 universal (WS-B) + 5 conditional (WS-C)
```

It reconciles: 16 + 2 = 18 = 13 + 5. Every Pass-3 lens lands in exactly one of WS-B / WS-C; **no lens is in neither**. The universal/conditional split moves by one seat (`supply-chain` universal), which is why 11+5 becomes 13+5 rather than 12+6.

<!-- prettier-ignore -->
| # | Pass-3 slug | Pass-3 gate | Pass-4 slug | Pass-4 gate | Owner | Status | What the amendment adds |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | `architecture` | always | `architecture` | `always` | B1 | unchanged | Import-graph fan-in/out hotspots, layering breaks, circular deps, chokepoint entrypoints. |
| 2 | `hotpath` | always | `hotpath` | `always` | B2 | unchanged | Top-level static imports in entrypoints, sync I/O in async paths, heavy eager init. |
| 3 | `config` | always | `config` | `always` | B3 | unchanged (boundary stated) | Build/runtime/deploy config vs actual code shape, manifest divergence. **Config-level *deadness* is NOT here** — it is `dead-code`'s; state the boundary in both prompts. |
| 4 | `reliability` | always | `reliability` | `always` | B4 | **amended** | Keep the swallow probe. On every unchecked/swallowed write, additionally emit `subject:` naming the target store and `signal: unchecked-write`. **Do NOT self-assess privilege** — the privilege-aware up-rank is a synthesis output, not a probe (§ Coupling 1). |
| 5 | `observability` | always | `observability` | `always` | B5 | **amended** | **Double-blind probe:** an error path both discarded (no rethrow, no propagation) AND unlogged/unmetered; rank above single-blind; emit `signal: double-blind-failure` with `subject:` when the failure concerns a named resource. Explicitly the inverse of `debt`'s leftover-debug-print probe — state the boundary in both. |
| 6 | `debt` | always | `debt` | `always` | B6 | **amended ×3** | (a) **Ledger read** — parse `docs/deferrals.jsonl` + `docs/failures.jsonl`; **fold same-`key` rows before counting**; report every row whose **`status != "CLOSED"`** (`TRIAGED` IS open work); rank `CRITICAL` first then oldest `ts`; **read-only — never append a closing row**. (b) **Suppression debt** — type-suppression comments, lint-disable line/next-line/block, unchecked type escapes, non-null assertions; report **blanket** disables only, never doctrine-sanctioned targeted per-rule opt-outs; rank by density × proximity to security/reliability surfaces. (c) **Cruft** — commented-out code blocks; stray debug-print statements in **product** code. Cap split across the three probe groups. |
| 7 | `dead-code` | always | `dead-code` | `always` | B7 | **amended** | Extend from unreferenced exports / orphan files / dupe utilities to unreferenced **config entries**: config keys and env vars with no reader; feature flags permanently pinned on or off. Explicitly NOT config shape-vs-code (that is `config`). |
| 8 | `deps` | always | `deps` | `always` | B8 | unchanged | Manifest-driven dependency hygiene, cross-version drift, module-system interop traps, unmaintained packages. |
| 9 | `security` | always | `security` | `always` | B9 | **amended (stated non-catch)** | Prompt states in-body: this lens hunts **permissive** holes; it reads a **restrictive** grant as correct least-privilege and passes it green. Privilege-break detection belongs to `contract-conformance`. **Negative clause — must be greppable** so a future author cannot quietly widen the lens back over the same ground. |
| 10 | `supply-chain` | **`hasCi`** (defaults true) | `supply-chain` | **`always`** | B10 | **RECLASSIFIED** conditional → universal | Probe text unchanged (pipeline hardening: unpinned action pins, privileged-trigger misuse, over-broad token permissions, secrets in pipeline logs; supply chain: lockfile integrity, install-time scripts, typosquat / dependency-confusion, committed-secret history scan, SBOM/provenance). **Plus:** owns **agent-framework version pinning**, evaluated at the manifest/lockfile entry (§ Coupling 2). **Plus:** sanity-probe-before-emit — no pipeline and no lockfile ⇒ `# Not Applicable (flag=true but no surface evidence)`. Carries allowlisted read-only `Bash`. |
| 11 | `tests` | always | `tests` | `always` | B11 | **amended ×4** | (a) **Doctrine-graded tiering** — read the **target repo's** `docs/testing.md`, grade against its § "Which tier does a behaviour need?" and § "What each tier must do", report **under-tiering using the doc's own tier names**; fall back to universal assertion-strength probes when the target ships no such doc. (b) **Coverage % AND coverage scope** — flag under-coverage *and* indiscriminate whole-app integration coverage. (c) **Three discrimination probes** — mock-collapse (two runtime-distinct dependencies mocked to the same instance), status-only assertions on operations that can report success *on* failure, proxy-surface (asserting surface A when the mutation targets surface B); emit `signal: non-discriminating-test` + `subject:`. (d) **Hollow-boundary probe, best-effort-static** — boundary tests whose only assertion is "did not throw"; every such finding carries **`evidence: static-only-runtime-unverified`** and points at WS-E (#83). Plus leftover focus/skip markers in committed tests. |
| 12 | `docs-drift` | always | `docs-drift` | `always` | B12 | **amended by Task 1** | Probe target is **`.agents/docs.md`** + the target repo's project docs vs actual code domains, stale invariants, broken refs. **NOT `.bkit/docs.md`** — that file does not exist; #403's B12 row and #402's A7 row are both wrong and a blanket relocation would ship the bad path into a prompt. |
| 13 | — | — | **`logic-dupe`** | `always` | B13 | **NEW** | Divergent inline logic duplication — the same conceptual rule inlined at N sites with divergent load-bearing details. Shapes: fallback chains with divergent terminal fallbacks or ordering; null-vs-falsy operator splits ± trim/guard over the same operand set; duplicated locale/format option bags; repeated inline predicate filters; the same enum/config default hardcoded across readers. Rank = blast radius (# sites) × divergence (# distinct behaviours) × user-visibility. Out of scope: coincidental similarity, single-call-site helpers, naming/terminology drift. **Second deliverable: per confirmed rule, a copy-pasteable grep/lint guard in `## Suggested Guards`** (§ Coupling 5). |
| 14 | `ui-ux` | `hasWebSurface` | `ui-ux` | `hasWebSurface` | C1 | unchanged | Responsive mechanisms (breakpoints vs fixed dimensions and absolute positioning), units and typography floors, accessibility (missing alternative text, clickable non-interactive elements, unlabelled inputs, heading-order skips, focus states, document language), contrast **computed from declared design tokens**, design-system adherence (values off the declared scale), internationalisation (hardcoded strings, fixed widths vs longer translations), layout shift (media without intrinsic dimensions). **Absorbs the a11y/i18n surface** earlier passes listed out-of-scope. |
| 15 | `data-layer` | `hasDb` | **`contract-conformance`** | `hasDb` | C2 | **RENAMED + REWRITTEN** | Primary probe is a **derivation, not a scan**: (1) build the grant/permission matrix per store; (2) enumerate every write site; (3) resolve the client role at each site (route → action → helper); (4) flag **role-mismatched writes** and **unchecked errors on writes into a restricted store**. Emits `subject:` per store and `signal: restricted-subject` / `role-mismatched-write` / `unchecked-restricted-write`, plus `## Subject Aliases`. Pass-3's N+1 / missing-index / unbounded-query / transaction-idempotency / migration-safety probes are **retained as secondary**. |
| 16 | — | — | **`derived-data`** | **`hasDerivedStore`** | C3 | **NEW** | Locate caches, denormalised columns and materialised stores with an independent recompute path. Probe: (1) is there a single authoritative writer, or none/many; (2) does **every** source-mutation path also update the derived store; (3) does any test or store-level constraint assert the two agree. Emits `signal: dual-source-writer` / `unsynced-derived-path` with `subject:`. |
| 17 | `ai-llm` | `hasLLM` | `ai-llm` | `hasLLM` | C4 | **amended (framework enrichment)** | Four dimensions: (1) **tool & capability sandboxing** — which functions are exposed to an autonomous caller; write authority where read suffices; isolated execution; (2) **prompt-as-code integrity** — system prompts version-controlled, sanitised and isolated from user-supplied input vs assembled ad hoc; (3) **agent-framework plugin trust** — third-party plugin/extension provenance (**version pinning is `supply-chain`'s**, § Coupling 2); (4) **deterministic logging & blast radius** — hard token limits, cost caps, execution logs for forensics, no raw model output piped into an executor. Retains Pass-3's prompt-injection surfaces / unvalidated model I/O / PII-to-provider / model-version pinning / eval-coverage probes. **Scope exclusion `.bkit/** .agents/** .claude/** .cursor/** .opencode/**`.** |
| 18 | `reference-signal` | `hasNetwork` | `reference-signal` | `hasNetwork` | C5 | unchanged | Detect stack → consult top-3 popular reference repos (structure / config / README only) → flag shared-convention divergence as a **soft external signal**. Always emits `confidence: low` + `source: reference-repo`; captures `## Reference Repos Used` (repo names + commit/tag + query) — reproducibility is "explainable", not "identical". A zero-hit search MUST emit a `severity: LOW` / `class: operability` finding so unavailability surfaces in the demoted section instead of masquerading as "no divergence". The only network lens. |

**Tally:** 7 unchanged · 7 amended · 1 reclassified · 1 renamed+rewritten · 2 new = **18**.

**Frameworks named in the charter, never in probe text:** OWASP Top 10 for Agentic Applications, MITRE ATLAS, AWS Secure Development Practices for Agentic AI, OWASP SAMM, NIST SSDF. WS-F (#309) uses the same taxonomy for the dynamic side; keep one shared vocabulary so static and red-team findings map onto each other.

### Task 3 (cont.) — every count in the predecessor documents that this table invalidates

Each of these is a concrete edit obligation. A stale count silently breaks the row-per-slot assert, the artifact-array invariant and the `[lenses=…]` stub arithmetic in one move.

`16 lenses` → **18** · `11 universal` → **13** · fan-out `11 → 16 slots` → **18 slots** · canonical **16-slug enum** → **18 slugs**, and the membership changes (`data-layer` out; `contract-conformance`, `derived-data`, `logic-dupe` in) · `status.json#steps[5].artifacts` fixed-length 16-entry array → a variable-length `artifacts` field on the Step-5 `step-done` NDJSON event, count derived from the enum · Step-5/Step-6 grep-assert row counts · `[lenses=…]` valid-slug validation list · Step-5 Failure-Path recovery-hint slug list · `16 - len(lenses-list)` excluded-slot stub arithmetic · `.bkit/prompts.md` § Models rows = 5 pipeline + 18 lenses = **23** · § Audit Phase agent list · "4 conditional lenses stress-test the keystone" → **5** · cost trajectory "16 opus lenses ~4.5× design triplet" → 18, ~5× · Pass-3 Decisions row "roster grows 11 → 16" → **11 → 18**, with the `supply-chain` seat move called out · flag inventory (−`hasCi`, +`hasDerivedStore`) · model pins `claude-opus-4-7` → **`claude-opus-5`** · Done-When grep targets `.agents/scripts/*.ts` → **`.bkit/src/*.ts`**.

### Charter-level couplings the amendments create

**The invariant, stated once and cited by every amendment that needs it: no lens reads another lens's artifact. All cross-lens knowledge is brokered by synthesis (A4).** Lens prompts are sibling-blind and standalone-runnable per `.bkit/prompts.md` § Prompt Authoring Rules; a direct sibling read would also break single-lens re-runs under `[lenses=…]`.

<!-- prettier-ignore -->
| Amendment | Knowledge needed | Brokered by | What the lens must emit |
| --- | --- | --- | --- |
| `reliability` privilege-aware up-rank | is store S restricted? | A4 correlation | `subject:` + `signal: unchecked-write` |
| silent-corruption composition | three findings about S | A4 correlation | `subject:` on all legs |
| `ai-llm` ↔ `supply-chain` pinning | who already reported it | existing dedup | shared `location:` anchoring convention |
| `debt` ↔ #346 CI gate | is the gate live | **nobody — settled by charter** | drift-first ranking (needs no runtime knowledge) |
| `tests` hollow-boundary ↔ WS-E | can this be proven | **nobody — annotation only** | `evidence: static-only-runtime-unverified` |

- **Coupling 1 — `reliability` (universal) needs `contract-conformance` (conditional).** A `requires: always` lens depending on a `requires: hasDb` lens inverts the keystone's dependency direction, and cannot be resolved inside a sibling-blind prompt. **Resolution: `reliability` never learns about privilege.** It emits swallowed/unchecked writes at its own honest severity plus a `subject:`; synthesis performs the up-rank when a `contract-conformance` finding marks that same subject restricted. On `hasDb=false` the up-rank never fires, `reliability` findings stand at baseline severity, and **nothing is reported as "checked and clean"** — the composed finding is recorded as _not evaluable_, not _absent_.
- **Coupling 2 — `ai-llm` vs `supply-chain` on agent-framework pinning.** Split: **version pinning → `supply-chain`** (it has the lockfile probes and the allowlisted history-scan surface); **agent-specific plugin/extension trust → `ai-llm`**. Both emit `class: security`, so double-reporting is real — dedup handles it **only if both anchor `location:` at the same place: the manifest/lockfile entry, not the import site.** That co-location convention is a shared line carried verbatim in both prompts. Without it, two high-severity findings for one problem both survive dedup and both rank.
- **Coupling 3 — `debt`'s ledger read vs #346's CI gate.** Two readers of one ledger with two fold implementations is the drift shape, and once #346 is green in a repo, `debt` re-enumerating open `CRITICAL`s is pure noise. **Charter clause: `debt`'s primary finding class is ledger _drift_** — a row fixed in reality but open in the ledger, a row owned by an open tracker issue, a row aged past a threshold — ranked **above** raw open-work enumeration. Both readers cite `.bkit/jsonl.md` as the single fold spec; neither restates it.
- **Coupling 4 — `tests`' hollow-boundary marker.** Per-finding `evidence:` field on a `ran` slot. Never a fourth manifest state (it would break the three-token assert), never free prose in `why:` (it would not survive dedup), **never `confidence: low`** (it would trip the down-rank fence). The synthesiser preserves the marker on pass-through; organise echoes it verbatim. A hollow-boundary finding so annotated is still a valid `tests` amplifier leg, and the composed finding inherits the annotation into its `why:`.
- **Coupling 5 — `logic-dupe` vs `dead-code` vs the repo's own diff-time duplication gate.** The split, stated once and carried verbatim in both prompts: `dead-code` is **reference-based** (duplicated exports / orphan files / dupe utilities); `logic-dupe` is **behaviour-based** (one rule inlined at N sites with divergent load-bearing details); the repo's diff-time duplication gate catches ≥3 _identical signatures_ and by construction sees neither. The guard deliverable does not fit the finding block (single-line fields, 200-char `direction:`, no triple-backticks) — hence `## Suggested Guards` + `guard-ref:`.

### Amendments that were unsatisfiable as written — and how they are narrowed

- **`debt`'s "cross-check each row against the tracker".** The lens tool surface is `Read, Grep, Glob, Write` — no MCP, no `Bash`, no network. As written this needs a **third** tool-surface exception, after `supply-chain`'s Bash and `reference-signal`'s WebSearch. **Narrowed shipped clause: `references[]`-versus-code reconciliation** — the row cites a PR / commit / path; does the path exist, does the described symptom still grep? A row whose symptom no longer reproduces, or whose `references[]` cite a merged fix, is itself a finding. **Tracker-state reconciliation is deferred to WS-G (#324).** #403's acceptance criterion must be amended to the narrowed form, or a build agent will either invent the check or grant the tool.
- **`isOpenWork()` does not exist** anywhere in `.bkit/src/**`. The durable invariant is `.bkit/jsonl.md` § Updating a Row: _"`TRIAGED` IS STILL OPEN WORK … test `status != "CLOSED"`"_. **Probe clauses state the predicate, never a helper name** — a prompt naming a non-existent symbol is a hallucination vector.
- **`logic-dupe`'s copy-pasteable CI guard** cannot be a `finding` field. Resolved by `## Suggested Guards` + `guard-ref:` (Coupling 5). Dropping guard generation would be a scope cut against #403's own acceptance criterion, so it is not an option here.
- **`tests`' `detected-static-only, runtime-unverified` had no carrier.** Resolved by the `evidence:` field (Coupling 4).
- **`reliability`'s "up-rank … to critical" is not a probe.** Resolved by the brokering rule (Coupling 1).

---

### Task 4 — the synthesiser upgrade: dedup → correlate

This is the one genuine contract change in Pass 4 and the section a plan run should read most carefully.

#### The constraint that decides the design

The three legs of the silent-corruption composition are **structurally non-co-located**:

<!-- prettier-ignore -->
| Leg | Lens | Natural `location:` | `class:` |
| --- | --- | --- | --- |
| "subject S is privilege-restricted" | `contract-conformance` (WS-C) | the grant / policy / migration declaration | security |
| "the write to S discards its outcome" | `reliability` (WS-B) | a request-path write site in product code | reliability |
| "S's critical path is mock-collapsed" | `tests` (WS-B) | a test file | testability |

Three files, three classes. The shipped dedup key `(class, normalized_location)` with a 5-line bucket **cannot express this join** — it is same-location/same-class by construction, and Pass-2's cross-class pass (shared `correlation_id`) is same-location/different-class. Correlation therefore needs a **join dimension that is not location**. That is the whole design question; everything else follows.

Second constraint: the join must be expressible without naming a stack. The vocabulary is **subject** (an addressable resource) and **signal** (what a lens observed about it) — both stack-agnostic, both greppable, neither naming a product.

#### Inputs — the contract this pins on WS-B and WS-C

Two additive-optional lens-authored fields, `subject:` and `signal:` (schema in § Data Model). This is the **entire lens-side contract change**; `composed:`, `legs:` and `correlation_id:` are synthesiser-authored. Emitting `subject:` plus a declared `signal:` on eligible findings is a **WS-B / WS-C acceptance criterion with a fixture assert**, not prose — otherwise a lens that forgets to emit them makes correlation silently never fire.

#### Subject resolution — three lenses, three names for one store

Two-tier, cheapest first:

1. **Normalised exact match** on `{kind}:{name}` (casefold, non-alphanumerics → `_`, repeats collapsed).
2. **Alias resolution** through the `## Subject Aliases` section, which only `contract-conformance` emits — it is the only lens that empirically knows the variants, because building the grant matrix and enumerating every write site is what surfaces them.

If neither resolves, **unmatched subjects are reported, not guessed** — see `unevaluable (no subject match)`.

#### The rule table

Canonical copy lives inline in `bkit-audit.md` Step 6 beside the slug and signal enums; the synthesiser prompt holds a derived copy kept honest by the same parity assert.

<!-- prettier-ignore -->
| Rule id | Subject kind | Required legs (lens · signal) | Amplifier legs | Severity | Class |
| --- | --- | --- | --- | --- | --- |
| `silent-corruption-candidate` | `store` | `contract-conformance · restricted-subject` **and** `reliability · unchecked-write` | `tests · non-discriminating-test`; `observability · double-blind-failure` | CRITICAL with ≥1 amplifier, HIGH without | reliability |

**The required/amplifier split is load-bearing.** The _harm_ is (restricted subject × discarded write outcome); the `tests` leg explains _why it stayed green_ and raises severity but is not a precondition. It also absorbs the cap risk: if an amplifier is evicted, severity degrades rather than the correlation vanishing.

**Exactly one rule ships in `4.11.0`.** The table is the extension point — adding a rule is a one-row edit in two files that the parity assert keeps honest. A second rule (`derived-divergence-candidate`, joining `derived-data · dual-source-writer` with `reliability · unchecked-write` on one subject across two files) is the obvious next row and is **deliberately not shipped here**: it is new probe behaviour, not reconciliation, and one rule is sufficient to prove the mechanism and to exercise the `unevaluable` path on bkit's dogfood run. Recorded as a deferral.

#### Ordering — correlate AFTER dedup

Pipeline: **parse → reference-signal field-omission post-process → dedup → correlate → render manifests.**

1. Dedup collapses N write sites for one store into one `reliability` entity, so correlation fires once per subject rather than N times — otherwise severity would depend on duplicate count.
2. Dedup is what populates the `lenses:` provenance that leg identity reads.
3. The reference-signal drop already runs pre-dedup, so by correlation time no external-signal block is in the pool.

#### Output shape — compose additively, never destructively

Legs are **retained** at their own severity and locations (the reader still needs each write site) and gain the shared `correlation_id`. The composed finding is a normal `finding` block plus three synthesiser-authored fields:

````markdown
```finding
severity: CRITICAL
class: reliability
location: src/actions/occurrence.ts:88
subject: store:occurrence_cache
what: silent-corruption candidate — outcome-discarding write into a privilege-restricted store
why: composition of three lens findings; no single lens observes it
direction: check the write outcome; re-grant or re-route the caller; make the test discriminate
confidence: high
evidence: static-composed
composed: silent-corruption-candidate
legs: contract-conformance=present@db/policy.sql:12; reliability=present@src/actions/occurrence.ts:88; tests=present@tests/occurrence.test.ts:31
correlation_id: corr-3
```
````

- `legs:` obeys the single-line, ≤200-char field rule; it lists each declared leg with its state and anchor.
- Composed findings render in **`## Correlated Findings`**, above the ranked list, and are **excluded from the severity×class matrix** so legs are counted once, as atoms. That also gives organise a block that is internal-evidence-only, so it may legally occupy the top slots under the down-rank contract.
- **Confidence is not invented:** reuse the shipped rule — `min(leg confidences)`, upgraded one tier on cross-lens confirmation. A multi-leg composed finding therefore never lands at `confidence: low` and never trips the down-rank fence into self-demotion.
- **`source: reference-repo` findings are ineligible as legs.** Otherwise external low-confidence signal launders into a CRITICAL top-slot finding, defeating the down-rank contract a whole review pass was spent pinning.

#### Partial correlation and degradation — the false-all-clear half

Per-leg state reuses the keystone's own three-state vocabulary:

- **`present`** — the lens ran and emitted a matching `(subject, signal)` finding.
- **`absent`** — the lens ran and emitted no matching finding.
- **`unobserved`** — the lens is `N/A — not applicable`, `crashed`, or operator-excluded.

Policy:

<!-- prettier-ignore -->
| Condition | Composed finding | `## Correlation Coverage` row |
| --- | --- | --- |
| all required legs `present` | **emit** | `fired (N)` |
| any required leg `absent` (all leg lenses ran) | none — and no noise | `no match` |
| any required leg `unobserved` | none | `unevaluable ({lens}: {state})` — **mandatory** |
| all leg lenses ran, but no subject resolved on any of them | none | `unevaluable (no subject match)` |

**Why the `unevaluable` row is mandatory:** on a `hasDb=false` repo the silent-corruption composition is _not evaluable_, not _evaluated-clean_. If the synthesiser simply produced no composed finding, the report would read as "no silent-corruption candidates" — a **second false all-clear, one layer above the one the keystone fixed**. The keystone's answer to that class was an explicit N/A state; the correlation layer gets the same treatment.

#### Verdict mapping

<!-- prettier-ignore -->
| Cause of `unevaluable` | Verdict | Why |
| --- | --- | --- |
| a leg lens is `N/A — not applicable ({flag}=false)` | **PASS** | a repo with no such store genuinely cannot silently corrupt one; bkit's dogfood run reads this way and must stay green |
| a leg lens `crashed` | **CONCERNS** | a real blind spot in *this run* |
| a leg lens was `excluded by [lenses=...] operator` | **CONCERNS** | the escape hatch must not silently disable correlation |
| `no subject match` with all leg lenses `ran` | **CONCERNS** | the only signal that a lens forgot to emit `subject:` |

`fired (N)` and `no match` map to PASS.

#### Cap interaction — the leg that can be evicted

The 25-finding cap evicts by severity, and `reliability`'s pre-up-rank swallowed-write finding is by the amendment's own argument low-severity in isolation — exactly the class the cap drops first. The correlator would then see two of three legs and compose nothing, indistinguishably from a clean repo. **Two mitigations, both mandatory:** the **5-slot reserve** for `subject:`+`signal:`-bearing findings inside each lens's 25, and the **`## Truncated` section → `ran (truncated: N)`** manifest suffix, so truncation is never silent. Both are specified in § Data Model — Per-lens artifact contract.

---

### Design Workstreams

Three peer workstreams, already filed as issues, chartered by this one document. WS-A owns **mechanism only and no probe content**; WS-B and WS-C own probe charters and no gating mechanism.

#### Superseded workstream mapping (the only surviving copy)

The Pass-2/Pass-3 sub-issues #187–#193 and #208 return **HTTP 410 — deleted**. No live link exists; traceability is preserved by this table, not by URLs.

<!-- prettier-ignore -->
| Pass-2/3 workstream | Deleted issue | Pass-4 owner |
| --- | --- | --- |
| WS-1 Stack-detect + `audit-stack.md` schema | #187 | **A2** |
| WS-2 Skill-install + provenance log | #188 | **A3** |
| WS-3 Lens-prompt layer (16 lenses) | #189 | **DISSOLVED → WS-B (#403) + WS-C (#405)** |
| WS-4 Synthesiser | #190 | **A4** |
| WS-5 Organise + summary | #191 | **A5** |
| WS-6 Orchestrator + registry block | #192 | **A6** |
| WS-7 Registry & metadata + legacy deprecation | #193 | **A7** |
| WS-8 Conditional-lens keystone | #208 | **A1** |
| `WS-K` — cited 8× in the Pass-3 doc, **never had a section or an issue** | — | **A7** (see below) |

**Why WS-3 dissolves.** A single "16 lens prompts" workstream is exactly the lump that could not absorb ten post-design charter amendments — which is why they sat as comments for two months instead of landing. Authoring 18 prompts and then immediately rewriting seven of them is waste. Split by applicability, each amendment is folded in at authoring time by the workstream that owns it. **This is a decomposition change, not an architecture change** — no new step types, no new agent classes, no change to the approved contracts.

**Resolving the dangling `WS-K`.** The Pass-3 doc cites `§ WS-K` eight times as the home of several plan-time grep-asserts, but its workstream sections run WS-1 … WS-8 and no `WS-K` section exists. Those obligations were unowned. **They land in A7**, which already owns the greppable registry surface: the canonical-enum equality assert (re-pointed at 18 slugs, the signal enum and the correlation rule ids), the extended universality regex, the absolute-path convention for artifacts, and the new bidirectional flag gate.

#### Step 9 is a no-op for THIS design

`/bkit-design` Step 9 parses `## Design Workstreams` and creates a tracker issue per `WS-{N}`. **It must not run against this document.** WS-A/B/C already exist as #402/#403/#405 with their own established body structure (sub-plan tables, acceptance criteria, cross-workstream couplings). Running the generic parse-and-create would either no-op uselessly or try to encode `blocked-by` edges that fight the hand-authored `Requires:` lines already in each issue. Record it in the run log as **Step 9 skipped — WS-A/B/C pre-chartered**.

#### WS-A (#402) — audit engine. Sub-plans A1–A7

<!-- prettier-ignore -->
| Sub-plan | Deliverable | Requires |
| --- | --- | --- |
| **A1** | **Conditional-lens keystone (contract declaration).** `## Applicability` block shape + field semantics; `requires:` frontmatter key, value union and default; launch-and-self-no-op pattern; sanity-probe-before-emit clause; three-state `## Missing Lenses` row format and token enumeration (incl. the `ran (truncated: N)` prefix rule); operator escapes `[lenses=…]`, `[applicability-override=flag=bool]`, `--with-websearch`; the **finding-schema addendum** (`subject:`, `signal:`, `evidence:`, `guard-ref:` as additive-optional); the shared lens-prompt skeleton incl. the 25-cap, the 5-slot correlation reserve and `## Truncated`. | — |
| **A2** | **`bkit-audit-stack-detect`.** `audit-stack.md` schemaVersion 2; the five-flag `## Applicability` block; `## Applicability — Flag Inventory`; detection heuristics for all five flags **including `hasDerivedStore`**; `## Applicability Overrides` ingest + audit trail; `## Applicability Disagreement` inverse-evidence guard **including the `hasDerivedStore` inverse rule**; optional `heuristicDepthLimit`; `confidence: low ⇒ CONCERNS`. | A1 |
| **A3** | **`bkit-audit-install-skills`.** Reuse build/ship skill machinery verbatim incl. uninstall/prune; 10-skill cap; data-driven `audit-{token}` queries; per-query progress; `[skills=false]`; provenance log with installed identities + versions; fully non-gating. | A2 |
| **A4** | **`bkit-audit-synthesise` — dedup + coverage manifest + parse errors, PLUS the correlation pass.** Subject normalisation and alias resolution; the rule table; leg-state resolution; composed-finding authoring (`composed:`, `legs:`, `correlation_id:`, `evidence: static-composed`); `## Correlated Findings`; `## Correlation Coverage` + its grep-assert; `## Suggested Guards` pass-through; `evidence:` preservation on pass-through; reference-signal field-omission post-process; three-state `## Missing Lenses` incl. truncation suffix. | A1 |
| **A5** | **`bkit-audit-organise` + `bkit-audit-summary`.** Severity×class matrix (composed findings excluded), ranked list, per-class appendix, workstream DAG, `## Suggested Guards` appendix; verbatim-echo renderer lock; the reference-signal down-rank self-verify grep-assert; coverage-orphan + DAG-cycle self-verify; 500-token summary + feat push. | A4 |
| **A6** | **`bkit-audit.md` orchestrator.** 10 steps; FID / lock / feat-located `status.jsonl` / per-step gate + tracker comment / Failure Path / In-Review terminal; input-flag parse with structured override-parse signalling; Step-5 pre-launch cleanup + excluded-slot stubs + 18-slot fan-out; Step-6 **canonical enums inline** (18 slugs, signal tokens, correlation rule ids) and their grep-asserts; `{WORKTREE_PATH}` on all 23 subagent Context lines; close reorder + `docs/audits/**` STRAY guard. | A1–A5, **#403, #405** |
| **A7** | **Registry, metadata, gates and legacy deprecation.** `.bkit/prompts.md` (23 § Models rows, § Audit Phase, § Tool set patterns sub-rows, `requires:` under § Frontmatter Conventions); **wholesale replacement** of `.bkit/workflows.md` § `/bkit-audit` + its File Layout comment + Output row + branch-placement row; `.agents/docs.md` Workflow Matrix **Audit column** (and the same edit in `.bkit/templates/.agents/docs.md`); the **inherited `WS-K` grep-asserts**, promoted to a shipped parity test; `bkit-utility-audit-*` deprecation headers; deferral/decision ledger appends. | A1–A6 |

**A7's parity test (inherited `WS-K` obligations, promoted from plan-time ritual to shipped test).** One new test file in `.bkit/src/` asserting:

1. **Four-way slug-set equality** — `bkit-audit.md` Step-6 inline enum ↔ `bkit-audit-synthesise.md` derived enum ↔ the `requires:` value union across `.bkit/prompts/bkit-audit-lens-*.md` (with `always` mapped to the 13 universal slugs) ↔ the on-disk `bkit-audit-lens-*.md` file set.
2. **Bidirectional flag gate** — every `requires:` value appears in `## Applicability — Flag Inventory` **and** every Flag Inventory entry has ≥1 lens consumer.
3. **Signal-enum and rule-id parity** — workflow Step-6 copy ↔ synthesiser derived copy.
4. **Universality regex** — zero library-name matches across `bkit-audit-lens-*.md`, with the documented semantic-CI exceptions for `supply-chain` only.
5. **No bare numeric length comparison** against the Step-5 `artifacts` array anywhere in `.bkit/src/*.ts` (notably `bkit-trackers.ts`, `bkit-status.ts`, `bkit-status-hole-detector.ts`) or `.bkit/scripts/*` — the regex flags `=== 11`, `=== 16`, `=== 18`, `.length === `, `artifacts.length === `, so the **next** lens-count change cannot reopen this drift a third time.
6. **Greppable negative clauses present** — `security`'s stated non-catch, `reliability`'s non-self-assessment, the `confidence: low` prohibition on the hollow-boundary marker, and `supply-chain`'s `NEVER git checkout` allowlist caveat.

> This deliberately amends Pass-3's out-of-scope line "tests, scripts, JSON schemas, helper modules — UNCHANGED". That line was written when the assert was a three-way _plan-time ritual_; the recurrence evidence — a magic `16` going stale twice without anyone noticing — is exactly what a ritual nobody re-runs fails to catch. It is mechanism, not architecture, so it does not re-litigate the PASS.

**Legacy deletion stays blocked.** A7 ships the `bkit-utility-audit-{codebase,security,tests,logs}.md` deprecation header only (`bkit-utility-audit-logs-ship.md` is NOT deprecated). `Deprecated since` resolves against `package.json#version` at build time — **do not pin a version in the header**. Actual deletion requires WS-E (#83, sub-plan E1) to land the replacement stack-agnostic log-scan path first; `-logs` / `-logs-ship` are the only shipped audit surface today and one of them is currently emitting a false all-clear.

#### WS-B (#403) — universal lens layer. 13 always-on lenses

Deliverable: 13 × `.bkit/prompts/bkit-audit-lens-{slug}.md`, `requires: always`, forked from the read-only-reviewer skeleton (`Read, Grep, Glob, Write`; `supply-chain` swaps `Write` for allowlisted `Bash`), sibling-blind, standalone-runnable, `model: claude-opus-5` / `effort: high` / `maxTurns: 50`, 25-finding cap with the 5-slot correlation reserve, emitting the A1 `finding` schema. Slugs and charters: rows B1–B13 of the inventory table.

**WS-B acceptance:**

- 13 lens prompts exist with `requires: always`, wired into the Step-5 fan-out.
- Universality grep-gate returns zero library-name matches.
- **Every amendment traces to a probe clause in the shipped prompt** — an amendment with no corresponding clause is a failed acceptance.
- `tests` emits `evidence: static-only-runtime-unverified` on hollow-boundary findings, and **never** expresses that marker as `confidence: low`.
- `debt` folds same-`key` ledger rows before counting, reports `status != "CLOSED"` (including `TRIAGED`) as open work, ranks ledger **drift** above raw open-work enumeration, and reconciles `references[]` against the code — **tracker-state reconciliation is explicitly out of scope** (→ WS-G).
- `logic-dupe` emits a copy-pasteable CI guard per confirmed rule in `## Suggested Guards` with `guard-ref:` on the findings, and reproduces the motivating exemplar class (one rule inlined at ~17 sites diverged into 6 fallbacks) on a regression fixture.
- `reliability`, `observability` and `tests` emit `subject:` + a declared `signal:` on correlation-eligible findings — asserted against a fixture, not prose.
- **Per-amendment regression fixture** in the Done-When of each of the seven amended lenses. A probe that was never authored otherwise looks identical to a probe that ran clean.

#### WS-C (#405) — conditional lens layer. 5 flag-gated lenses

Deliverable: 5 × `.bkit/prompts/bkit-audit-lens-{slug}.md` with correct `requires:` flags, wired into the Step-5 fan-out. Slugs, gates and charters: rows C1–C5 of the inventory table.

**Hard requirements for every lens here:**

- **Honour the three-state coverage manifest.** Flag false ⇒ `N/A — not applicable ({flag}=false)`, never "ran, clean".
- **Sanity-probe before emitting.** Flag true but the first-pass probe finds zero relevant files ⇒ `# Not Applicable (flag=true but no surface evidence)`, exit; never invent findings.
- **Stack-agnostic probe text.** Reason about stores, privileges, authority and affected surfaces — never a database product, UI framework or model provider by name.

**WS-C acceptance:**

- 5 lens prompts exist with the correct `requires:` values, all present in the Flag Inventory.
- `contract-conformance` reproduces the motivating root cause (role-mismatched writes + unchecked errors into a restricted store) on a seeded fixture, and emits `subject:` + `## Subject Aliases`.
- `derived-data` gates on `hasDerivedStore` and its detection heuristics + inverse-evidence rule are exercised by a fixture in both directions.
- `ui-ux` is validated against a consumer or sample UI repo — **bkit cannot dogfood it**.
- Universality grep-gate returns zero library-name matches across all five.
- **Dogfood on bkit** — see below.

#### Dogfood acceptance on bkit's own repo (the keystone's empirical test)

Assert on the **`## Missing Lenses` + `## Correlation Coverage` manifest rows**, NOT on the ranked list. `debt` will legitimately saturate its cap from bkit's own ledgers and dominate the `maintainability` class; a noisy-but-correct `debt` must not be able to mask a keystone regression.

<!-- prettier-ignore -->
| Slot | Expected row | Note |
| --- | --- | --- |
| `ui-ux` | `N/A — not applicable (hasWebSurface=false)` |  |
| `contract-conformance` | `N/A — not applicable (hasDb=false)` |  |
| `derived-data` | `N/A — not applicable (hasDerivedStore=false)` |  |
| `reference-signal` | `N/A — not applicable (hasNetwork=false)` | unless `--with-websearch` |
| `ai-llm` | `N/A — not applicable (hasLLM=true but no surface evidence)` | **see below** |
| `supply-chain` | `ran` | universal now; CI + lockfile both present |
| `silent-corruption-candidate` | `unevaluable (contract-conformance: N/A — not applicable (hasDb=false))` ⇒ **PASS** | correlation coverage row |

**The `ai-llm` expectation is deliberately not `hasLLM=false`.** `hasLLM`'s heuristics will very likely auto-detect **true** on bkit — it pins model IDs, selects providers and holds agent-tooling credentials. #405's acceptance line as filed ("`ai-llm` renders `N/A — not applicable (hasLLM=false)`") is therefore **unachievable by construction** and must be amended to the row above. **Do NOT weaken the `hasLLM` heuristic to force `false`** — that would re-open the false-negative hole the keystone exists to close. The honest outcome is: the flag is true, the scope exclusion removes bkit's own agent assets, no product LLM surface remains, and the sanity probe reports exactly that.

### Task 5 — version target: `4.11.0`, A + B + C in one minor

**Decision: `4.11.0` (next minor past the current `4.10.0`), shipping WS-A + WS-B + WS-C together. Three `/bkit-plan` runs, one release train.**

- **A split buys no schedule.** A6's `Requires:` is `A1–A5, #403, #405` and is unconditional. Either A6 waits for B and C regardless of the version label on it, or a minor ships with a `/bkit-audit` whose Step 5 invokes 18 prompts that do not exist — 18 `crashed` rows and an unusable workflow whose only real audit surface is still the legacy family.
- **The headline acceptance gate is unmeetable without B and C.** "The dogfood run shows conditional lenses as N/A, not ran-clean" requires conditional lenses to exist. With stub-only slots the criterion is trivially true and meaningless.
- **A safe split would cost more than shipping together** — it would require version-coupling the canonical slug enum, the coverage manifest width and the fan-out width to the shipped subset: more machinery than the split saves.
- **Additive workflow + additive prompts + no consumer-breaking contract change ⇒ minor, not major.** The finding-schema changes are additive-optional; existing parsers default-tolerate them.
- **Build order is sequenced by the `Requires:` chain, not by release order:** A1 → A2, A3, A4, A5 → **WS-B, WS-C** → A6 → A7. All three plans can be written up front.
- **Legacy `bkit-utility-audit-*` deletion is independent of the version** and stays blocked on #83/E1. `Deprecated since` resolves against `package.json#version` at build time; do not pin `4.11.0` into the header.

### Amendment provenance

The ten post-PASS amendments' rationale lives in #80's thread; #403 and #405 are the **spec**. Cite these, never the seven IDs that 404.

<!-- prettier-ignore -->
| Amendment | Folded into | True source |
| --- | --- | --- |
| Adopt #209 state model + #204 relocation when building | Task 1 | `#80` comment `4592535780` (2026-06-01) |
| `tests` doctrine-graded tiering (#263) | B11 (a) | `#80` comment `4724170720` (2026-06-16) |
| `tests` coverage-% and coverage-scope | B11 (b) | `#80` comment `4871745888` (2026-07-03) |
| Pass-3.1 `tests` amendment (hollow-boundary, per-finding marker not a 4th state) | B11 (d), Coupling 4 | `#80` comment `4872169289` (2026-07-03) |
| Agentic audit frameworks + 4 dimensions | C4 | `#80` comment `4648968746` (2026-06-08); tooling candidates `4648981792` |
| Silent-corruption lens layer: 2 new lenses, 3 probe rewrites, synthesise dedup→correlate | C2, C3, B4, B5, B9, B11 (c), **Task 4** | `#80` comment `4893806991` (2026-07-06) |
| `debt` reads `deferrals.jsonl` + `failures.jsonl` (#234) | B6 (a) | `#80` comment `4976493989` (2026-07-15) |
| `logic-dupe` lens + guard generation | B13 | `#80` comment `5007998667` (2026-07-17) |
| Suppression debt → `debt`; dead config/flags → `dead-code`; cruft → `debt`/`tests` | B6 (b,c), B7 | `#80` comment `5008028373` (2026-07-17) |
| Reorg + consolidation records (workstream map, WS-3 dissolution) | § Design Workstreams | `#80` comments `5113784208`, `5113926299` (2026-07-29) |

## Decisions

<!-- prettier-ignore -->
| Decided | Alternatives | Why |
| --- | --- | --- |
| **T1 · The `.agents/` → `.bkit/` relocation is SELECTIVE, enumerated hit-by-hit against the real tree** — `prompts/`, `workflows/`, `prompts.md`, `workflows.md`, `scripts/`→`src/`+`scripts/`, `templates/` move; **`.agents/docs.md`, `rules.md`, `skills.md`, `config.md` stay put** | blanket prefix rewrite of every `.agents/` token | Verified: those four files exist at `.agents/` today and **`.bkit/docs.md` does not exist**. A blanket sed points A7's registry edit and `docs-drift`'s probe target at nonexistent paths — and B12 is a probe target *inside a lens charter*, so the bad path would ship into a prompt. |
| **T1 · `status.jsonl` per the LIVE `bkit-design.md`; `workflow-meta` dropped** | follow the 2026-06-01 #80 comment literally, including `workflow-meta` | Pattern-match the shipped file, not a two-month-old comment describing intent. The comment predates `0359884`'s landed shape; the live sibling never emits `workflow-meta`. |
| **T1 · Audit is FEAT-located with the close-reorder applied**; status writes resolve via `git rev-parse --show-toplevel`, Step-1 resume uses the worktree-or-dev probe, `step-done`+`workflow-done` precede the close commit, STRAY guard widened to `docs/audits/**`, Failure Path appends `workflow-failed` with no dev push | dev-located / no-worktree, which is what `.bkit/workflows.md`'s branch-placement table currently says | Audit has a Step-2 worktree and squash-merges its artifact, so it is design/plan-shaped. The stale table row is a shipped-doc defect this pass names and A7 fixes; `cloud` is the only genuinely dev-located workflow. |
| **T1 · Retire the literal slot count entirely** — one canonical 18-slug enum, count derived; the Step-5 `step-done` `artifacts` array is variable-length; the Done-When regex is widened to flag a bare `=== 18` too | hardcode `18` where Pass 3 hardcoded `16` | The `16` literal is *why* this reconciliation exists — a magic number went stale twice and sat unnoticed. Hardcoding a new number resets the clock on the same bug; WS-D's future slug additions would reopen it a third time. |
| **T2 · `## Design Workstreams` re-cut as three pre-chartered peer sections (WS-A/B/C) + an A1–A7 sub-plan table + a superseded-mapping table, citing NO `#187`–`#193`/`#208` links** | keep WS-1..WS-8 numbering; assert the split in a tracker comment only; author it Step-9-parseable anyway | The sub-issues are HTTP 410 — live links become dead ends and this doc is the only surviving copy. A second Step-9-shaped copy of the workstream bodies would drift from the issues' own evolving content exactly the way #80's body drifted from its comments. |
| **T2 · Step 9 is explicitly a no-op for this design** — WS-A/B/C already exist, pre-chartered | let Step 9 run and title-match | Running the generic parse-and-create would either append a redundant "Workstream Update" restating the issue body, or encode `blocked-by` edges that fight the hand-authored `Requires:` lines. |
| **T2 · The dangling `WS-K` grep-assert obligations land in A7**, re-pointed at 18 slugs + the signal enum + the correlation rule ids, and **promoted from a plan-time ritual to a shipped parity test** | leave `WS-K` unowned; invent an A8; keep the assert plan-time | `WS-K` is cited 8× in the Pass-3 doc with no section — an unowned obligation. A7 already owns the greppable registry surface. Plan-time rituals are what failed to catch the `16` going stale; a shipped test runs on every change. |
| **T2 · `.bkit/workflows.md` § `/bkit-audit`'s stale 7-step Linear-only block is replaced WHOLESALE by A7**, together with the File Layout comment, the Output row and the branch-placement row | patch it line-by-line; treat it as an implicit consequence of "A7 rewrites the registry block" | It is a *different, older shape* — 7 steps, Linear-only `save_issue({parentId})`, heading-regex finding parse — not stale paths. Naming it explicitly stops a builder pattern-matching the wrong starting point. |
| **T3 · Net inventory 13 universal + 5 conditional = 18; arithmetic reconciles; zero lenses dropped** | keep 16 and treat the new lenses as follow-ups | 16 Pass-3 + `logic-dupe` + `derived-data` = 18; `supply-chain` moves universal, `data-layer` renames. Stated explicitly so a future reader can re-verify without the thread. A stale count breaks the row-per-slot assert, the artifact invariant and the `[lenses=…]` stub arithmetic in one move. |
| **T3 · `supply-chain` → `requires: always`, and `hasCi` is DELETED from the Flag Inventory; sanity-probe-before-emit reads `## Stack ci:`; the flag gate becomes bidirectional** | keep `requires: hasCi` (defaults true) with the flag retained | #403 ships against "all 13 `requires: always`". Leaving `hasCi` in the inventory with zero consumers ships the exact dead-config class B7's own new amendment probes for. The CI *signal* survives in `## Stack ci:`, so nothing is lost but the gate; the sanity clause prevents a repo with no pipeline from reading as a clean supply-chain pass. |
| **T3 · New flag `hasDerivedStore` gates `derived-data`**, with named detection heuristics and an inverse-evidence rule (A2 work) | `hasCache`; reuse `hasDb` | `hasCache` names a mechanism and invites stack-leak; reusing `hasDb` couples two independent surfaces and makes the N/A reason string lie (a derived store can exist without a database). Naming it here is what unblocks `/bkit-plan` on #405. |
| **T3 · `contract-conformance` class = `security`** | keep Pass-3's `performance` (from `data-layer`); `reliability` | The class-weight ladder ranks `security` first and `performance` last; keeping `performance` would rank the milestone's motivating root cause at the bottom of every tie-break. Consistent with `security`'s stated non-catch pointing here. |
| **T3 · `debt`'s tracker cross-check narrows to `references[]`-versus-code; tracker-state reconciliation → WS-G** | grant `debt` a third tool-surface exception (MCP or Bash) | A third exception in a family whose invariant is "read-only reviewer" is a bad trade for one probe. Stating the narrowing stops a build agent inventing the check or widening the tool surface. |
| **T3 · Probe clauses state predicates, never helper names** — `status != "CLOSED"`, never `isOpenWork()` | cite the helper as the amendment does | `isOpenWork()` does not exist anywhere in `.bkit/src/**`. Naming a non-existent symbol in a prompt is a hallucination vector. The durable invariant is `.bkit/jsonl.md` § Updating a Row. |
| **T3 · `docs-drift`'s probe target is `.agents/docs.md`; A7 also adds the missing `Audit` column to that file's Workflow Matrix (and to `.bkit/templates/.agents/docs.md`)** | keep `.bkit/docs.md` as filed in #402 A7 / #403 B12; assume Pass-2 already added the column | `.bkit/docs.md` does not exist. The shipped `.agents/docs.md` matrix columns are Design/Plan/Build/Debug/Ship — there is no Audit column, so Pass-3's "UNCHANGED, already correct from Pass 2" is stale. |
| **T4 · Subject-keyed declarative correlation as a POST-dedup pass inside `bkit-audit-synthesise`**, driven by a reviewable rule table | location-anchored join reusing the existing cross-class `correlation_id` pass; a dedicated `@bkit-audit-correlate` prose-reasoning agent | The three legs are structurally non-co-located across three classes, so `(class, normalized_location)` provably cannot join them. A location join cannot express "the subject is restricted" at all — a grant declaration's location has nothing to do with the write site. A prose agent forfeits every machine-enforceable guarantee the design leans on and cannot honestly report *why* it did not fire. |
| **T4 · Exactly two lens-authored additive-optional fields: `subject:` and `signal:`** | `subject:` only, with the predicate inferred from `what:` prose; a required field on all lenses; a migrating `tier:`-style field | Additive-optional is the sanctioned extension path (the `source:` precedent; a migrating `tier:` was REJECTED in Pass 3). `signal:` is load-bearing even for the single shipped rule — without it the join fires on *any* `reliability` finding that mentions the store, not specifically an unchecked write. |
| **T4 · Correlate AFTER dedup** | before dedup; interleaved | Dedup collapses N write sites into one entity (else severity depends on duplicate count) and is what populates the `lenses:` provenance that leg identity reads; the reference-signal drop already runs upstream of it. |
| **T4 · Compose additively — legs retained at their own severity and back-linked via `correlation_id`; composed findings live in `## Correlated Findings` and are excluded from the matrix** | legs replaced by the composite; composite counted in the matrix | Replacing legs destroys per-site actionability and breaks matrix arithmetic. A separate section structurally prevents double-counting and gives organise a block that is internal-evidence-only, so it may legally occupy top slots under the down-rank contract. |
| **T4 · Required-leg / amplifier-leg split** — all required `present` ⇒ emit; a required leg `absent` ⇒ silent + `no match`; a required leg `unobserved` ⇒ silent + a mandatory `unevaluable` coverage row | emit every 2-of-3 at reduced severity; suppress every partial | Suppressing partials reinstates the false negative; emitting all partials floods. The harm is (restricted subject × discarded write); `tests` explains the greenness. It also makes an evicted amplifier degrade severity rather than delete the correlation. |
| **T4 · New `## Correlation Coverage` manifest, one row per rule, tokens `fired (N)` / `no match` / `unevaluable (`, with a Step-6 grep-assert cloned from the row-per-slot assert** | fold the rows into `## Missing Lenses`; no manifest at all | A rule that cannot fire because a leg's lens was N/A, crashed or excluded is the same false all-clear as a lens that never ran — one layer up. `## Missing Lenses` is keyed per lens slot and its assert counts slugs; a sibling section keeps both asserts simple. |
| **T4 · Verdict mapping: N/A-caused `unevaluable` ⇒ PASS; crashed / operator-excluded / no-subject-match ⇒ CONCERNS** | all `unevaluable` ⇒ CONCERNS; all ⇒ PASS | bkit's own dogfood run must stay green on "no such store exists". A crashed leg or an operator exclusion is a real blind spot *in that run*, and `no subject match` is the only signal that a lens forgot to emit `subject:`. |
| **T4 · `source: reference-repo` findings are ineligible as correlation legs** | allow them with a confidence floor | Otherwise external low-confidence signal launders into a CRITICAL top-slot finding, defeating the down-rank contract a full review pass was spent pinning. |
| **T4 · Ship exactly ONE correlation rule (`silent-corruption-candidate`) in 4.11.0; the rule table is the extension point** | ship a second `derived-divergence-candidate` rule alongside `derived-data` | A second rule is new probe behaviour, not reconciliation. One rule proves the mechanism and exercises the `unevaluable` path on the dogfood run; adding the second is a one-row edit the parity assert keeps honest. Recorded as a deferral. |
| **T4 · REJECT the location-bucket fallback join** (compose at reduced confidence when both legs lack `subject:` but bucket together) | keep it as a cheap softener for the forgot-to-emit case | By the same argument that motivates the subject join, the legs are non-co-located by construction — the fallback would essentially never fire, and its failure mode is *invisible* (no subject to report as unmatched). The `unevaluable (no subject match)` row is the better mitigation because it makes silence a visible state. |
| **T3/T4 · New optional `evidence:` field; the hollow-boundary marker is NEVER `confidence: low`, never free prose, never a fourth manifest state** | overload `confidence:`; carry it in `why:`; add a 4th state token | `confidence: low` trips the reference-signal down-rank fence and would bar a genuine boundary gap from the matrix top row and the ranked-list top 3 — the exact inverse of intent. Prose does not survive dedup. A 4th token breaks the three-token Step-6 assert. |
| **T3 · `logic-dupe` guards ship in a `## Suggested Guards` artifact section with `guard-ref:` on findings** | a new single-line `guard:` field with an escaping rule; drop guard generation | Field values are single-line, `direction:` caps at 200 chars and triple-backticks are forbidden inside a fence — a guard cannot be a field value. A pass-through section leaves the PASSed schema untouched and keeps audit read-only (the guard is emitted as text, never installed). Dropping it would contradict #403's own acceptance criterion. |
| **T3 · The 25-finding cap gets a 5-slot reserve for `subject:`+`signal:` findings, and truncation is announced via `## Truncated` → `ran (truncated: N)`** | raise the cap for correlation-participant lenses; apply the cap per probe across all 18 lenses; leave it implicit | A silently truncated leg is indistinguishable from a clean one — the exact failure class this milestone exists to close. The reserve is one clause in the shared skeleton, so it costs one edit rather than 18. `debt` additionally splits its cap across its three probe groups because its ledger probe would otherwise starve the other two. |
| **T3 · The bkit dogfood expects `ai-llm` → `N/A — not applicable (hasLLM=true but no surface evidence)`; the `hasLLM` heuristic is NOT weakened** | amend the heuristic so `hasLLM` reads false on bkit; accept `ran` with findings about bkit's own model pinning | `hasLLM` will legitimately detect true on bkit. Weakening the heuristic to satisfy an acceptance line re-opens the false-negative hole the keystone exists to close. #405's acceptance line is amended instead. |
| **T5 · Target `4.11.0`; WS-A + WS-B + WS-C ship in the SAME minor** | A in 4.11.0, B/C in 4.12.0; a 5.0.0 major | A6's `Requires: A1–A5, #403, #405` is unconditional, so a split unblocks nothing on the critical path — it only adds a changelog entry and an upgrade cycle for a distinction that is not real. Shipping A alone fans out to 18 prompts that do not exist. Additive workflow + additive prompts + no consumer-breaking contract change ⇒ minor. |
| **T5 · Legacy deprecation header resolves `Deprecated since` against `package.json#version` at build time; deletion stays blocked on #83/E1** | pin `4.11.0` in the header | The no-pinning rule is already frozen, and the predecessor docs' own `v2.2.0`/`v2.8.4` numbers are precisely the drift this pass exists to remove. |

## Approaches Considered

These are alternative **reconciliation packages** and alternative **correlation mechanisms** — not alternative architectures. The Pass-3 architecture is out of bounds and every approach below assumes it.

<!-- prettier-ignore -->
| Approach | Verdict | Why |
| --- | --- | --- |
| **Generalised single-source-of-truth reconciliation, one coordinated minor** — retire the literal slot count in favour of one canonical slug enum with N derived; re-cut `## Design Workstreams` as three pre-chartered peer rows; ship A+B+C as `4.11.0` | **KEPT (lead)** | The magic `16` is *why* this pass exists; generalising once removes the recurrence for WS-D's future additions. A version split unblocks nothing on A6's `Requires:` chain. Extensibility is the best of the reconciliation packages: WS-D adds slugs to one list and no doc needs to know the count. |
| **Single 18-row inventory table of record + a finding-schema addendum** — one table every count derives from, plus `subject:` / `signal:` / `evidence:` / `## Suggested Guards` so the amendments are executable | **KEPT (lead)** | Targets the *unsatisfiable amendment* — a charter clause with no probe clause, or one the tool surface or schema cannot execute. That failure is silent: the build agent writes *something*, the "every amendment traces to a probe clause" criterion is graded by the same agent, and the gap surfaces only when a real audit misses the class the amendment existed for. Five of the ten amendments were in that state. |
| **Subject-keyed declarative correlation, post-dedup, inside the synthesiser** — two additive-optional lens fields, a rule table, `## Correlated Findings`, `## Correlation Coverage` | **KEPT (lead)** | The only shape that expresses a join whose legs sit at three locations in three classes, and the only one where the rule stays reviewable, diffable and assertable. Complexity is MEDIUM: no new agent, no new step, no new artifact file. |
| **Risk-premortem mitigation layer** — bidirectional flag gate, four-way slug parity as a shipped test, per-amendment regression fixtures, greppable negative clauses, cap reserve + truncation announcement, dogfood asserts on manifest rows | **MERGED** | Additive mitigations layered onto the three lead approaches, not a competing package. Each targets a documented recurrence: the orphaned flag, the stale count, the unauthored probe, the deleted negative clause, the evicted leg, the noisy-`debt` masking. |
| **Registry-truth-first reconciliation** — treat `.bkit/workflows.md`'s stale 7-step block as a named peer reconciliation target with an explicit before/after delta list inside the design | **MERGED (registry half only)** | The registry-diff finding is real, cheap and prevents a builder pattern-matching a Pass-1-era shape; it folds into A7's scope and § Task 1 (cont.). Its RC-staggering half is rejected below. |
| Conservative pinned-count reconciliation — bump every `16` to `18`, ship WS-A alone in `4.11.0`, defer B/C to `4.12.0` | **REJECTED** | Bakes in a new magic number that WS-D reopens, and the split does not decouple anything: A6 waits for B and C either way, so "WS-A ships first" is cosmetic — two changelog entries and two upgrade cycles for the same calendar date. It also misapplies WS-G's "wait for real runs" caution: B and C are not consumers of A's contracts waiting to be proven, they *are* the content A6 fans out to. |
| Staggered pre-release (`4.11.0-rc.0` after A1–A2, final after A1–A7 + B + C) | **REJECTED** | bkit has no shipped pre-release-tag mechanism; this invents release infrastructure inside a pass that hard-constrains release/trigger mechanics as WS-G's territory — and buys nothing, since A7's legacy *deletion* is blocked on #83/E1, not on a tag existing early. |
| Location-anchored correlation reusing the existing cross-class `correlation_id` pass — each lens emits a `related:` product-code location; join on the normalised location bucket | **REJECTED (fallback role also rejected)** | Cannot express "the subject is restricted" at all: a grant declaration has a location, but its location has nothing to do with the write site. Cannot express any rule whose legs are inherently non-co-located, so the next rule needs the subject join anyway. Its failure mode is worse than the subject join's: bucket mismatch produces silent non-fire with no unmatched subject to report — invisible degradation, precisely the failure class in scope. |
| Dedicated `@bkit-audit-correlate` agent reasoning over `what:` / `why:` prose, leaving the finding schema untouched | **REJECTED** | Non-deterministic: two runs on one repo produce different compositions, nothing can be grep-asserted, and the composed finding cannot honestly report *why* it did not fire — forfeiting exactly the false-all-clear protection this task exists to add. Also a new agent, a new § Models row, a new tool-set row, a new artifact and a new Step-6 sub-gate. Its one genuine merit, recorded: it needs zero contract handshake with WS-B/WS-C, so it could ship in a later minor — which is not a benefit here, since A+B+C ship together. |
| Amendment ledger appended to the Pass-3 doc (traceability-first, minimum edit) — keep the Pass-3 lens table intact, append an ID-keyed `## Amendments` appendix | **MERGED (provenance half only)** | Reproduces the exact failure Pass 4 was called to repair — a charter living in two places, one stale by construction — just inside one file instead of across a comment thread. But its insurance value is real and cheap, so its ID-keyed provenance table is adopted as § Amendment provenance while the charter itself lives in the single inventory table. |
| Charter by issue — the design owns mechanism + inventory, #403/#405 bodies own the probe text | **REJECTED** | Issue bodies are mutable and unversioned against the repo, and this milestone has already demonstrated the failure twice: #187–#193/#208 returned HTTP 410 and took the decomposition with them, and #403/#405's own cited comment IDs 404 today. It also puts load-bearing specification outside the repo, outside CI, outside `bkit check` and outside the squash-merge that lands the design on `dev` — and forces every plan/build agent to have tracker access to answer a probe question. |

**MERGED final shape:** the generalised single-minor reconciliation package (Tasks 1, 2, 5) + the single-inventory-table-plus-schema-addendum fold (Task 3) + subject-keyed post-dedup correlation (Task 4), with the risk-premortem mitigation layer, the registry-diff finding and the ID-keyed provenance table layered on. Each lead approach owned a different concern; the merge kept the strongest per concern rather than collapsing to consensus.

## Trade-offs Accepted

**What we gain**

- **One count source.** Every lens count in this document derives from a single 18-row inventory table, and a shipped four-way parity test binds that table to the workflow enum, the synthesiser enum and the on-disk prompt set. WS-D's future additions are a one-list edit.
- **Every amendment has an executable landing site.** Five of the ten were prose no build agent could turn into a probe. `subject:`, `signal:`, `evidence:`, `## Suggested Guards` and the narrowed `debt` clause fix that — all additive-optional, so no existing prompt needs migrating.
- **The false-all-clear invariant now extends one layer up.** A correlation rule that cannot fire says so, with its cause and a verdict mapping, instead of reading as "no candidates found".
- **Cross-lens knowledge without breaking sibling-blindness.** `reliability` never learns about privilege; synthesis brokers it. Single-lens `[lenses=…]` re-runs keep working, and a universal lens never depends on a conditional one.
- **A reviewable, diffable correlation rule.** A rule table with required/amplifier legs and a declared signal enum, not an agent's prose judgement — so the guarantees the rest of the design leans on (grep-asserts, coverage manifests, verdict routing) apply here too.
- **One release train.** Three plans, one `4.11.0`, one upgrade cycle, and a dogfood run that can actually demonstrate the keystone because the lenses exist.

**What we sacrifice**

- **A second contract handshake between WS-A and WS-B/WS-C.** `subject:` and `signal:` are lens-authored, so a lens that forgets them makes correlation silently never fire. Mitigated structurally (`unevaluable (no subject match)` ⇒ CONCERNS) and by fixture asserts in both workstreams' acceptance — but it is a real coupling that the prose-agent alternative would not have had.
- **A wider gate surface.** Four manifest sections now carry grep-asserts (`## Missing Lenses`, `## Parse Errors`, `## Correlation Coverage`, plus organise's down-rank self-verify), and a shipped parity test crosses the Pass-3 "no tests, no scripts" boundary. More to keep green.
- **Cost keeps climbing.** 18 Opus/high lenses is roughly 5× the design-triplet token cost (Pass 3 noted ~4.5× at 16). The Sonnet-downgrade lever stays the documented future escape and is again not exercised.
- **Tool-surface heterogeneity persists and is now permanent.** `supply-chain` carries allowlisted `Bash`, `reference-signal` carries `WebSearch`; the once-uniform "read-only reviewer" family has three sub-shapes. The `Bash` allowlist is prompt-author discipline, **not a runtime sandbox** — the host still grants raw `Bash`, so a future author widening the allowlist would not be rejected at runtime. Hedged only by the greppable `NEVER git checkout` caveat.
- **A flattened matrix.** 18 lenses map onto 7 classes; `maintainability` alone now carries `architecture`, `debt`, `dead-code`, `docs-drift`, `logic-dupe`, `ui-ux` and `reference-signal`. The matrix was designed at 11 lenses. Accepted; the per-class appendix is the escape valve.
- **One correlation rule, not two.** `derived-data` ships without a correlation rule consuming it, so its `dual-source-writer` signal is emitted-but-unjoined in 4.11.0. Deliberate scope discipline, deferred rather than dropped.
- **`hasDerivedStore` is the weakest flag we ship.** It is the hardest to detect and the most likely to false-negative, landing straight into the existing "conditional-lens false-negative N/A is silent by construction" risk. Its inverse-evidence guard carries more weight than any other flag's.
- **Carry-forwards still hold:** no adversarial review of the synthesis (audit is terminal); two skill-install agents (build + audit); `audit-stack.md` is a single contract feeding 23 readers (was 16); `audit-*` skills are ship-pruned so reproducibility relies on the install log, not skill persistence; `audit-{token}` skills largely do not exist in the registry yet, so Step 4 mostly no-ops.

## Risks & Open Questions

**Risks (mitigations layered onto the chosen shape; surface in the plans)**

- **Conditional-lens false-negative N/A is silent by construction.** A mis-detected flag renders as `N/A — not applicable`, which by design is _not_ a finding; the only signal is an operator noticing it on a repo they know has the surface. Layered: `confidence: low ⇒ CONCERNS`; the inverse-evidence guard; the operator-visible applicability one-liner in the Step-3 tracker comment; `[applicability-override=…]` re-invocation. **None eliminate it.** `hasDerivedStore` is the most exposed.
- **A lens that forgets `subject:` / `signal:` makes correlation silently never fire.** Mitigated by `unevaluable (no subject match)` ⇒ CONCERNS and by fixture asserts in WS-B/WS-C acceptance. Residual: a lens that emits `subject:` on the _wrong_ subject produces a wrong join rather than no join, and nothing detects that.
- **The 25-finding cap can still bite.** The 5-slot reserve and the truncation announcement bound it, but a lens with more than 5 genuine correlation legs still loses some. Recovery is a `[lenses=slug]` single-lens re-run.
- **`debt` on the dogfood run produces a large, _correct_ finding set** from bkit's own ledgers, saturating its cap and dominating `maintainability`. This is why the dogfood acceptance asserts on manifest rows rather than the ranked list; residual risk is that a human reader of the ranked list draws the wrong conclusion about the run's quality.
- **The inventory table drifts from the shipped prompts** the moment one lens is edited without touching this doc — the very drift Pass 4 exists to repair, recurring. The four-way parity test is the counter-measure, and it is why the assert is a shipped test rather than a plan-time ritual. Undocumented invariants most at risk: the `ai-llm`/`supply-chain` co-location convention, the `subject:` normalisation rule, `contract-conformance`'s class choice.
- **Negative charter clauses are deletion-bait.** `security`'s stated non-catch, `reliability`'s non-self-assessment and the `confidence: low` prohibition all read as redundant to a future author. Each gets a greppable Done-When, in the pattern already used for `NEVER git checkout`.
- **The `supply-chain` allowlist is discipline, not a sandbox.** Accepted residual, documented in the prompt body and in `.bkit/prompts.md` § Tool set patterns.
- **Reference-signal is non-reproducible across runs.** Popularity drifts; `## Reference Repos Used` makes the run explainable, not repeatable. Two opt-in network surfaces exist (Step 4 skills, Step 5 reference-signal) — the "only network surface" prose in the predecessor docs is stale and A7 replaces it.
- **Author-leaves / bus factor.** The ten amendments' rationale lives in a 50-comment tracker thread whose cited IDs already 404, and the WS-1..WS-8 decomposition exists nowhere else. **This document is the only surviving copy of both.** The three "why" items most at risk are recorded as explicit decisions: why `security` must _not_ catch restrictive grants; why `reliability` must not self-assess privilege; why the hollow-boundary marker must not be `confidence: low`.
- **Authoring-rule lock-in.** Every `.bkit/workflows/*.md` edit follows `.agents/rules.md` + the workflow authoring rules; every `.bkit/prompts/*.md` edit follows the prompt authoring rules. ASCII operators only (`!=`, `>=`, `<=`). Tracker writes MCP-only. The volume here (1 workflow, 23 prompts, 3 registry surfaces) amplifies the lint surface.
- **Concurrency.** These are three serial `/bkit-plan` runs — concurrent bkit workflows on one clone collide on shared `dev`, the working tree and `.git/config`. Use separate clones for parallelism.

**Open questions**

- **Which of `derived-data`'s heuristics actually fires on real consumer repos?** The flag is new and unvalidated; the plan should seed both a positive and a negative fixture and expect the heuristic set to need one revision after first contact.
- **Sonnet downgrade as the cost lever.** Frozen NO again this pass. Revisit after two or three real `/bkit-audit` runs at 18-lens width.
- **Do we need a sub-class axis for the matrix at 18 lenses?** Out of scope here; flagged for WS-D, which makes the problem worse.
- **Skill source constraint** — should installs be constrained beyond the 10-skill cap? Unchanged from Pass 2; default is build-agent parity.
- **`audit-{token}` skill authoring** — none exist in the public registry, so Step 4 mostly no-ops. Whether bkit authors a minimal seed set is a separate follow-up.
- **Who owns scheduling — WS-G (#324) or #260?** Both claim an automated-trigger home for the audit. A product decision, settled before WS-G's design; two schedulers over the one-workflow-per-clone constraint is a collision, not redundancy.
- **Amendments needed on the peer issues before their plan runs.** #405's dogfood line (`ai-llm` renders `hasLLM=false`) and #403's `debt` tracker-cross-check criterion are both unachievable as filed and are superseded by this document. Whether the issue bodies are edited to match, or the plans simply cite this doc, is a process choice — but a plan run must not grade against the stale lines.
- **`derived-divergence-candidate`** — the second correlation rule, deferred out of 4.11.0. Re-evaluate once one real run has produced a `dual-source-writer` signal.
