# Design: bkit-audit Workflow (BAR-199)

## Acceptance Scenario

### Narrative

A developer invokes `/bkit-audit` (with no argument, with a path glob, or with a Linear issue ID) and receives a Severity × Class prioritised report at `docs/audits/{FID}-audit.md` covering 11 best-practice lenses (architecture, hotpath, config, reliability, observability, debt, dead-code, deps, security, tests, docs-drift). The same workflow re-run against the bkit repo at the pre-BAR-197 dev tip surfaces the catch-all Lambda bundling + ESM-only `serverExternalPackages` debt, proving the audit tool would have caught the incident class before it shipped.

### Success Criteria

1. `/bkit-audit` ships as a top-level slash command, Linear-bound, with full 7-step orchestrator ceremony (Failure Path, lock, gates, status.json, comment-per-step).
2. 11 lens-subagent prompts + 3 pipeline prompts (synthesize, prioritize, summary) + 1 shared lens-charter doc exist under `.agents/prompts/` and are registered in `.agents/prompts.md` § Models and § Audit Phase.
3. Running `/bkit-audit` against bkit at pre-BAR-197 dev tip produces a `docs/audits/{FID}-audit.md` with smoke-test attestation PASSED — `config`, `hotpath`, `deps`, `debt` lenses surface the golden findings; `security`, `tests` lenses surface no unexpected false positives.
4. Lens prompts are stack-agnostic — no Next.js/Vercel/pnpm/esbuild references outside conditional `STACK_FLAGS` blocks; `grep -r 'Next\.js|Vercel|pnpm|esbuild' .agents/prompts/bkit-audit-lens-*.md` returns zero unconditional matches.
5. Standalone `bkit-utility-audit-{codebase,security,tests,logs}.md` carry the deprecation header pointing to `/bkit-audit` with `Deprecated since` + `Deletion target` clocks; `.agents/prompts.md` § Utility annotates the four rows with `⚠️ `.

### Key Edge Cases

- **Concurrency — same-FID re-audit:** `/bkit-audit BAR-199` while `BAR-199` already holds a feature FID lock. Resolution: FID format extended to `{ISSUE_ID-slug}-audit-{YYYYMMDD-HHmm}` for re-audits of tracked issues; locks isolate; lineage preserved via FID prefix.
- **Conflict resolution — cross-lens overlapping findings:** Same `(class, location)` from multiple lenses → dedup with severity max-wins, confidence upgraded one tier on cross-lens confirmation; same `location` + DIFFERENT classes preserved as separate entries with shared `correlation_id` to retain multi-dimensional signal.
- **Failure mode — synthesizer truncation at scale:** 11 lenses × 30-finding cap = 330-finding ceiling; if synthesizer truncates, per-lens findings persist on disk, allowing partial recovery. Lens output cap (30) + per-finding-cap-per-class are mitigations.
- **Failure mode — golden findings file absent during smoke-test:** Smoke-test attestation section reads `N/A`; canonical audit artifact still ships. Validation gap surfaces as informational, not gating.
- **Cross-feature interaction — `Audit` label collision with phase labels:** `Audit` is mutually exclusive with `Design|Plan|Build|Ship|Merged`; entering audit on a `BAR-NNN` already labelled `Design` drops `Design` and adds `Audit` — exits via `In Review` state restoring the prior phase if a follow-up workflow runs. Semantic resolution: `Audit` means "audit workflow ran"; downstream `/bkit-plan` invocation correctly drops `Audit`, adds `Plan`.

## Goal & Motivation

Ship `/bkit-audit` — a sixth peer workflow alongside `/bkit-design`/`/bkit-plan`/`/bkit-build`/`/bkit-debug`/`/bkit-ship` — that runs ~11 parallel best-practice lens audits over a codebase and synthesises them into a single Severity × Class prioritised report. Driver: BAR-197 retro — the catch-all Lambda bundling + ESM-only `serverExternalPackages` debt would not have been caught by today's single-prompt `bkit-utility-audit-codebase` because that prompt has zero probe specificity (verified by `design-brainstorm-ideate-2.md` §Friction). Multi-lens fan-out + structured-finding synthesis closes that gap; the multi-lens-then-synthesise pattern already exists in `bkit-design`/`bkit-plan` and is mechanically transposable (verified by `design-brainstorm-ideate-1.md` Approach A "~85% reuse").

## Scope

**In scope (v1):**

- New `.agents/workflows/bkit-audit.md` orchestrator — 7 steps, full FID/lock/status.json/Linear ceremony mirrored from `bkit-design.md`.
- 11 sibling lens-subagent prompts `.agents/prompts/bkit-audit-lens-{slug}.md` (taxonomy resolved below).
- 3 pipeline subagents: `bkit-audit-synthesize.md`, `bkit-audit-prioritize.md`, `bkit-audit-summary.md`.
- 1 shared probe-catalogue doc `.agents/prompts/bkit-audit-lens-charter.md` cited by every lens (mitigation per `design-brainstorm-ideate-3.md` §Risk-mitigation).
- Canonical output `docs/audits/{FID}-audit.md` + append-only `docs/audits/INDEX.md`.
- Top-level `/bkit-audit [optional-target]` slash command (per `design-brainstorm-ideate-3.md` decision table row 1).
- Linear-bound run: own issue per ad-hoc invocation; reuse `BAR-NNN` if passed; new mutually-exclusive phase label `Audit`.
- Deprecation header on existing `bkit-utility-audit-{codebase,security,tests,logs}.md`; registry footnote in `.agents/prompts.md` § Utility.
- Smoke-test golden findings file `tests/golden/bar-197-known-debt.finding.md` (per `design-brainstorm-ideate-2.md` decision table row 4).
- `.agents/skills.md` (no), `.agents/prompts.md`, `.agents/workflows.md`, `.agents/docs.md` registry updates.

**Out of scope (v1) — brief carries forward, no reconciliation needed:**

- Per-lens fixers (audit is read-only).
- CI scheduling / automated audits.
- Live runtime-signal lens (deferred — `audit-gcp-errors.sh` is GCP-specific; portability blocker per `design-brainstorm-ideate-2.md` row 3).
- Cross-repo aggregation.
- Deleting the standalone `bkit-utility-audit-*` prompts (header-only deprecation in v1).
- A11y / i18n / migrations / api-contract / rate-limiting / caching lenses.
- Cross-workflow hooks (`bkit-debug-summary` audit-queue, `bkit-design-review-*` lens-checklist cite) — deferred per `design-brainstorm-ideate-3.md` decision row 7.
- Workstream Linear sub-issue spawning (audit is terminal; no `WS-N` decomposition).

**Reconciliations against brief:**

- Brief lens count "~12"; lens-2 proposes 11 by merging Lens 4 (Error handling) + Lens 6 (Resource lifecycle) → KEPT (rationale in §Lens Taxonomy).
- Brief mentions optional Lens 13 (Live runtime); deferred per lens-2 row 3 → confirmed.
- Brief shows 7-step orchestrator; lens-1 confirms 7 vs lens-1's rejected 5 (B) / 9 (C) alternatives → 7 KEPT.

## Architecture

Two-layer separation per `.agents/workflows.md` § Two-Layer Separation Rules — orchestrator owns Linear / git / lock / status.json; subagents are leaves, write to disk, never call Linear.

```
/bkit-audit [target?]  (top-level slash command, peer to /bkit-design)
   │
   ├── Step 1 Start Workflow         (lock, FID, Linear init, Audit label)
   ├── Step 2 Worktree Setup         (.worktrees/{FID}/, audit-input.md, status init)
   ├── Step 3 Lens Audits (parallel) → 11 × @bkit-audit-lens-{slug}
   │      └── reads docs/audits/<lens-charter cite>, writes audit-lens-{slug}.md
   ├── Step 4 Synthesize             → @bkit-audit-synthesize
   │      └── reads 11 lens files, writes audit-v1-synthesis.md (dedup'd findings)
   ├── Step 5 Prioritize             → @bkit-audit-prioritize
   │      └── reads v1, writes audit-v2-ranked.md (Severity × Class matrix + ranked list)
   ├── Step 6 Summary                → @bkit-audit-summary
   │      └── reads v2 + status.json, writes audit-summary.md (500-token Linear-bound)
   └── Step 7 Close Workflow         (copy v2 → docs/audits/{FID}-audit.md, append INDEX.md,
                                      squash-merge dev, label retained, state→In Review)
```

**Components:**

- **Orchestrator** (`bkit-audit.md`) — clone of `bkit-design.md` Steps 1–2, 7–8, 10 verbatim; Steps 3–6 are new but follow the fan-out / verdict-extract / status-commit / comment-append pattern lifted from `bkit-design.md` § Step 3 + § Step 7.
- **Lens-charter doc** (`bkit-audit-lens-charter.md`) — single-source-of-truth probe catalogue table (11 rows) cited by every lens. Prevents drift per `design-brainstorm-ideate-3.md` §Risk-mitigation row 1.
- **Lens-subagents (11)** — each forked from `bkit-design-brainstorm-ideate-1.md` skeleton (read-only-reviewer tool pattern `Read, Grep, Glob, Write, Bash`; effort `high`; opus). Each runs stack-signal detection first then lens-specific probes from the charter; emits findings as fenced YAML-frontmatter blocks (per `design-brainstorm-ideate-2.md` decision row 2).
- **Synthesizer** (`bkit-audit-synthesize`) — clone of `bkit-design-generate.md` shape; `xhigh` effort, opus, `Read, Grep, Glob, Write, Edit`. Greps fenced `finding` blocks, parses YAML, dedupes on `(class, location ±5 lines)`; severity max-wins; cross-lens confirmation upgrades `confidence` one tier.
- **Prioritizer** (`bkit-audit-prioritize`) — clone of `bkit-design-organise.md` shape; `high` effort, opus, `Read, Grep, Glob, Write, Edit, Bash`. Renders Severity × Class matrix + single ranked list + per-class appendix. Self-verify gate: every input finding appears in matrix (no orphans).
- **Summary** (`bkit-audit-summary`) — clone of `bkit-design-summary.md`; `low` effort, haiku, `Read, Write, Edit`; 500-token Linear-paste cap (per `.agents/prompts.md` § Linear-bound output row).

**Integration points:**

- Linear MCP (orchestrator only) — `save_issue`, `save_comment`, `list_comments`, `get_issue`; new phase label `Audit` (mutually exclusive with Design/Plan/Build/Ship/Merged, additive to Failed/Debug).
- `.agents/prompts.md` § Models table — 11 new lens rows + 3 pipeline rows + a new "Audit Phase" Agent table.
- `.agents/workflows.md` § File Layout — new row `/bkit-audit | yes | yes | docs/audits/{FID}-audit.md` and rationale block.
- `.agents/docs.md` Workflow Matrix — new `Audit` column (or extend `Design`/`Plan` columns where audit-relevant — see §Files).
- `bkit install` — picks up `.agents/workflows/bkit-audit.md` and all 14 new prompts; regenerates `.claude/commands/` + `.cursor/commands/` mirrors at session end (NOT per-edit; per user memory `feedback_bkit_install_batching.md`).

## Workflow Shape

7 steps. Steps 1, 2, 7 verbatim from `bkit-design.md` Steps 1, 2, 10 (replace `design-` slug with `audit-`; drop `pnpm install --frozen-lockfile` per `design-brainstorm-ideate-1.md` Approach A — read-only); Steps 3–6 are audit-specific but copy ceremony from `bkit-design.md` Steps 3 and 7 (fan-out / verdict / commit / comment).

<!-- prettier-ignore -->
| # | Step | Subagents | Parallelism | Output | Commit msg |
| --- | --- | --- | --- | --- | --- |
| 1 | Start Workflow | — | — | FID, lock, Linear issue init, `Audit` label, comment seed | none (no dev commit; deferred to Step 2 per BAR-184) |
| 2 | Worktree Setup | — | — | `.worktrees/{FID}/`, `audit-input.md`, status.json with `audit-start-workflow` + `audit-worktree-setup` entries | `chore({FID}): worktree-setup` (feat branch) |
| 3 | Lens Audits | 11 × `@bkit-audit-lens-{slug}` | full parallel | 11 × `docs/plans/logs/{FID}/audit-lens-{slug}.md` | `chore({FID}): lens-audits` |
| 4 | Synthesize | `@bkit-audit-synthesize` | sequential (xhigh, single agent) | `audit-v1-synthesis.md` (dedup'd, verdict line) | `chore({FID}): synthesize` |
| 5 | Prioritize | `@bkit-audit-prioritize` | sequential | `audit-v2-ranked.md` (Severity × Class matrix + ranked list + per-class appendix; verdict line) | `chore({FID}): prioritize` |
| 6 | Summary | `@bkit-audit-summary` | sequential | `audit-summary.md` (500-token Linear-bound; verdict line) | `chore({FID}): summary [skip build] [skip ci]` + push feat |
| 7 | Close Workflow | — | — | `docs/audits/{FID}-audit.md` (cp from v2), `docs/audits/INDEX.md` appended, dev squash-merge, worktree removed | `docs({FID}): audit DONE [skip ci]` (dev) |

**What each step outputs:**

- **Step 3** — Each lens writes its own file with: header `Verdict: PASS|CONCERNS|FAIL` + `<!-- verdict:end -->`, followed by N fenced `finding` blocks (per-finding schema below). Lens output cap: 30 findings (top by severity); per `design-brainstorm-ideate-3.md` §Risk-mitigation row 2 — prevents synthesizer OOM at scale.
- **Step 4** — `audit-v1-synthesis.md` = single flat list of deduped findings (each finding's `lenses:` field cites all source lenses), severity-sorted. Verdict.
- **Step 5** — `audit-v2-ranked.md` = Severity × Class matrix (header table) → ranked list (CRITICAL → HIGH → MEDIUM → LOW, secondary sort by class weight per §Synthesis below) → per-class appendix. Self-verify gate: every input finding appears in output. Verdict.
- **Step 6** — `audit-summary.md` = exec summary, top-3 CRITICAL, total counts per class, Coverage Check (which lenses returned findings). 500-token cap.
- **Step 7** — `docs/audits/{FID}-audit.md` (cp from v2) + `docs/audits/INDEX.md` appended with `| {FID} | YYYY-MM-DD | VERDICT | CRITICAL count | HIGH count |`.

**Failure Path (read-only workflow adaptation):**

Lifted verbatim from `bkit-design.md` §36–60 with these adaptations:

1. Lock release + status FAILED + dev push of FAILED commit — UNCHANGED.
2. Linear: `Failed` additive to `{LABELS}` (prior phase label `Audit` persists); state `In Review` — UNCHANGED.
3. Comment append `### Workflow Failure` fenced block — UNCHANGED.
4. NO `docs/audits/{FID}-audit.md` artifact written on failure (no canonical artifact ships).
5. Skip `git rebase --abort` only when no rebase occurred (read-only Step 2 still does a rebase on resume — keep the line).
6. No PR cleanup (no PR exists).

Per `design-brainstorm-ideate-1.md` Decisions row 6.

## Lens Taxonomy

**Final count: 11 lenses.** Decision: merge brief Lens 4 (Error handling) + Lens 6 (Resource lifecycle & concurrency) → single `reliability` lens. Source: `design-brainstorm-ideate-2.md` decision row 1 (probe overlap is high — `catch` blocks, unbounded queues, unhandled rejections all appear in both; one agent covers both for ~15% probe-uniqueness saved at one fewer Opus subagent). Reject lens-1's implicit "12 verbatim" because it inherited the brief uncritically; lens-2's merge argument is grounded.

**Live runtime lens (brief's optional 13th): DEFER to v2.** Source: brief decision §5 + `design-brainstorm-ideate-2.md` row 3 — `audit-gcp-errors.sh` is GCP-specific, breaks portability decision §6 without a capability-detection sub-system that is out of scope for v1.

**A11y / i18n / migrations / api-contracts / rate-limiting / caching: DEFER.** Brief out-of-scope + `design-brainstorm-ideate-2.md` ledger: structural code probes have low signal-to-noise for these domains (UI rendering context required for a11y/i18n; live DB introspection for migrations).

<!-- prettier-ignore -->
| # | Slug | Class | One-line probe summary |
| --- | --- | --- | --- |
| 1 | `architecture` | maintainability | Import-graph fan-in/out hotspots; layering breaks; circular deps; chokepoint entrypoints. |
| 2 | `hotpath` | performance | Top-level static imports in entrypoints; sync I/O in async paths; heavy init eagerly loaded. Carries BAR-197 `serverExternalPackages` ESM-trap probe. |
| 3 | `config` | compatibility | Build/runtime/deploy config vs actual code shape; manifest divergence; env assumptions in shared modules. Carries BAR-197 `next.config.*` catch-all probe. |
| 4 | `reliability` | reliability | Silent swallows; broad catches; unhandled rejections; unclosed handles; unbounded queues/caches; races; missing transactional boundaries. (Merged: brief Lens 4 + Lens 6.) |
| 5 | `observability` | operability | Failure surfaces with no logs/metrics; missing context tags; PII in logs; absent tracing on critical paths. |
| 6 | `debt` | maintainability | `TODO | FIXME | HACK | XXX | workaround | band-aid | recovery` + ticket-ID grep; markers vs closed tickets; workarounds without exit conditions. |
| 7 | `dead-code` | maintainability | Unreferenced exports; orphan files; dupe utilities; single-caller wrappers; speculative generality. |
| 8 | `deps` | compatibility | `pnpm outdated/audit`; workspace cross-version drift; ESM/CJS interop traps; unmaintained packages; types out of sync. |
| 9 | `security` | security | Auth holes; input validation; secrets handling; API exposure; data leakage; dep CVE surface; shell injection (`execSync.*${`). |
| 10 | `tests` | testability | Mocked-only critical paths; missing integration tests; flakes/skips without exit; assertion strength. |
| 11 | `docs-drift` | maintainability | `.agents/docs.md` + project docs vs actual code domains; stale invariants; broken refs. |

**Per-lens probe specificity** (lens-2's contribution) — each lens prompt contains:

1. **Stack-signal detection block** — runs first; reads `package.json` / framework config; sets `STACK_FLAGS` (e.g., `HAS_NEXT`, `HAS_VITEST`, `IS_MONOREPO`, `IS_TYPE_MODULE`).
2. **Universal probes** — grep/glob patterns that run on every repo (table per lens in `bkit-audit-lens-charter.md`).
3. **Stack-conditional probes** — activate only when corresponding `STACK_FLAGS` set (e.g., `hotpath` lens probes `serverExternalPackages` in `next.config.*` only `IF HAS_NEXT`).

Maintains portability decision §6 (no Next.js/Vercel/pnpm pinning) without sacrificing detection power on stacks where pinning matters. Each lens emits at most 30 findings (top by severity) per `design-brainstorm-ideate-3.md` risk-mitigation row 2.

## Per-Finding Schema

**Decision: YAML frontmatter inside fenced `finding` block** (per `design-brainstorm-ideate-2.md` decision row 2). Reject brief's heading format (`## [CRITICAL][reliability] file:line — title`) at the lens-output layer because it conflates presentation and data; regex extraction across 11 lens files × ~15 findings each = ~165 regex matches with line-spanning fields, fragile.

Both formats coexist by layer:

- **Lens output (Steps 3–5)** = YAML frontmatter fenced blocks (machine-parseable; synthesizer/prioritizer operate on data).
- **Final report (Step 7 → `docs/audits/{FID}-audit.md`)** = brief's human-readable heading format, rendered by `bkit-audit-prioritize` from the parsed blocks.

**Schema:**

````markdown
```finding
severity: CRITICAL          # CRITICAL | HIGH | MEDIUM | LOW
class: reliability          # one of: maintainability | performance | compatibility | reliability | operability | security | testability
location: apps/web/src/lib/db.ts:42   # file:line OR file:start-end OR pattern (e.g. "next.config.* line 12")
what: broad catch swallows DB lock errors
why: Lock contention fails silently; user sees stale data
direction: Narrow catch to known recoverable errors; log + rethrow on others
confidence: high            # high | medium | low
```
````

**Synthesizer parsing approach** (in `bkit-audit-synthesize.md`):

1. `Bash grep -A 10 '^```finding$' docs/plans/logs/{FID}/audit-lens-*.md` (or `Read` each file directly and scan).
2. For each block: extract YAML key:value pairs by line; assert all seven fields present.
3. **If** any block malformed (missing field, invalid enum value) → that block is collected into a `## Parse Errors` section and counted toward `CONCERNS` verdict; do NOT abort.
4. Group findings by `(class, location)` key; within a group apply ±5-line proximity merge (per `design-brainstorm-ideate-2.md` §Prioritisation logic).
5. Severity max-wins on merge; `confidence: low` floors carry forward unchanged; cross-lens confirmation upgrades `confidence` one tier (e.g., `medium` + `medium` from different lenses → `high`).
6. Emit deduped findings as fenced blocks with an added field `lenses: [arch, perf]` listing all source lenses.

**Rendered heading format** (for `docs/audits/{FID}-audit.md` per-class appendix and ranked list):

```
## [CRITICAL][reliability][lenses: reliability,observability] apps/web/foo.ts:42 — broad catch swallows DB lock errors
**Why it matters:** Lock contention currently fails silently; user sees stale data.
**Direction of fix:** Narrow catch to known recoverable errors; log + rethrow on others.
**Confidence:** high — cross-lens confirmation (reliability + observability).
```

Extends brief's heading by adding `[lenses: ...]` segment so cross-lens provenance survives into the human-readable output.

## Synthesis & Prioritisation

**Step 4 — `bkit-audit-synthesize` algorithm (dedup):**

1. Parse all fenced `finding` blocks from 11 lens files (algorithm in §Per-Finding Schema above).
2. Build `findings_by_key` map keyed by `(class, normalized_location)` where `normalized_location` = `file_path` + `line // 5 * 5` (5-line bucket).
3. For each key with >1 finding: merge — severity max-wins, append source lens to `lenses:` array, upgrade `confidence` one tier on cross-lens confirmation.
4. Cross-class dedup pass: findings at SAME `file:line` from DIFFERENT classes are kept as separate entries but cross-referenced via shared `correlation_id` — preserves multi-dimensional signal (e.g., a file:line tagged `reliability` AND `security` is more interesting than either alone).
5. Severity assertion: `severity` ∈ `CRITICAL|HIGH|MEDIUM|LOW`; invalid → `CONCERNS` verdict + log to `## Parse Errors`.
6. Verdict: `PASS` if 0 CRITICAL + 0 HIGH; `CONCERNS` if any CRITICAL/HIGH but synth healthy; `FAIL` if parse errors > 5% or lens files missing.

**Step 5 — `bkit-audit-prioritize` algorithm (Severity × Class matrix + ranking):**

Matrix layout (header table at top of `audit-v2-ranked.md`):

```
| Class \ Severity | CRITICAL | HIGH | MEDIUM | LOW | Total |
|------------------|----------|------|--------|-----|-------|
| security         | 1        | 2    | 0      | 0   | 3     |
| reliability      | 2        | 1    | 3      | 1   | 7     |
| ...              | ...      | ...  | ...    | ... | ...   |
| **Total**        | 3        | 3    | 3      | 1   | 10    |
```

Ranking order (primary → tie-breakers):

1. **Severity** — `CRITICAL > HIGH > MEDIUM > LOW`.
2. **Class weight** within same severity — `security > reliability > testability > compatibility > operability > maintainability > performance` (per `design-brainstorm-ideate-2.md` §Prioritisation logic, with `performance` floored because perf findings tend to be optimisations, not correctness bugs).
3. **Confidence** within same severity + class — `high > medium > low`. `confidence: low` findings are displayed at original severity with a `(low-confidence)` annotation but ranked one tier lower (e.g., a low-confidence CRITICAL ranks among HIGHs).
4. **Cross-lens confirmation** — multi-lens findings rank above single-lens findings at same severity + class + confidence.
5. **File path lexical** — deterministic stable sort for reproducibility.

**Confidence handling on output:** Lens emits raw `confidence`. Synthesizer upgrades on cross-lens confirmation. Prioritizer DOES NOT mutate confidence further; only uses it for ranking. Final report displays the upgraded value with provenance: `Confidence: high — cross-lens confirmation (reliability + observability).`

**Self-verify gate** (in `bkit-audit-prioritize.md`): every `correlation_id` from synthesis appears in matrix totals AND in ranked list; orphan = FAIL verdict (drives Failure Path).

Per `design-brainstorm-ideate-1.md` Decisions row 4: "Severity × Class matrix rendered by `bkit-audit-prioritize` (cloned `bkit-design-organise` self-verify shape)".

## Output Document Shape

`docs/audits/{FID}-audit.md` — assembled by Step 7 as `cp docs/plans/logs/{FID}/audit-v2-ranked.md docs/audits/{FID}-audit.md`. Document sections in order:

```markdown
# Audit: {FID}

## Header

- **FID:** {FID}
- **Linear:** {ISSUE_ID} ({Audit label}; state In Review)
- **Run date:** YYYY-MM-DD HH:MM
- **Repo:** {OWNER_REPO}@{parentSha-of-Step-2}
- **Scope:** {SCOPE_GLOB or "repo root"}
- **Lenses run:** 11 ({slug list})
- **Verdict:** {SUMMARY_VERDICT}
- **Smoke-test attestation:** {PASSED|N/A|FAILED} — see "## Smoke-Test Attestation" below.

## Severity × Class Matrix

[Table from §Synthesis & Prioritisation]

## Ranked Findings

[CRITICAL → HIGH → MEDIUM → LOW; secondary sort by class weight; one heading per finding in brief format]

### [CRITICAL][security][lenses: security] {location} — {title}

**Why it matters:** {why}
**Direction of fix:** {direction}
**Confidence:** {confidence} — {provenance note if cross-lens}
...

## Appendix A — Per-Class Listings

### security

[All security findings, severity-sorted]

### reliability

[...]

### ...

[Repeat per class with ≥1 finding]

## Appendix B — Lens Coverage

[Table: lens slug | verdict | finding count | top-class | parse errors]

## Smoke-Test Attestation

[Populated only when run against pre-BAR-197 dev tip. See §Smoke-Test Acceptance for mechanism.]

## Run Manifest

- Steps and verdicts (from status.json)
- Token usage (if surfaced by Claude Code)
- Failed lenses (if any)
```

`docs/audits/INDEX.md` (append-only, created on first audit run; per `design-brainstorm-ideate-3.md` §Approach A "Output location" + §Risk-mitigation row 5):

```markdown
# Audit Index

| FID                    | Date       | Verdict | CRITICAL | HIGH | MEDIUM | LOW | Linear                            |
| ---------------------- | ---------- | ------- | -------- | ---- | ------ | --- | --------------------------------- |
| bar-199-audit-workflow | 2026-05-15 | PASS    | 0        | 0    | 2      | 5   | [BAR-199](https://linear.app/...) |
| ...                    | ...        | ...     | …        | …    | …      | …   | …                                 |
```

Update mechanism: Step 7 sub-step appends one row before `cp` to canonical path; row contents read from `audit-v2-ranked.md` matrix totals + status.json verdict.

## Slash Command Surface

**Command:** `/bkit-audit [optional-target]` (top-level, peer to `/bkit-design`/`/bkit-plan`/etc). Source: `design-brainstorm-ideate-3.md` decision row 1; rejected `/audit` (collides with common tooling and breaks `bkit install` Cursor T1/T2/T3 transforms which expect `bkit-` prefix) and `/bkit-design --audit` (Approach B; overloads design semantics).

**Argument behaviour:**

- No argument → audit repo root; `SCOPE_GLOB` = `**`.
- Argument is a glob/path → passed into `audit-input.md` as `SCOPE_GLOB`; each lens intersects its probes with this glob. Examples:
  - `/bkit-audit apps/web/` → audit web app only.
  - `/bkit-audit "**/*.ts"` → audit TypeScript only.
  - `/bkit-audit BAR-199` → reuse existing Linear issue, audit repo root (issue-ID pattern detected before glob pattern).
- Argument is a `BAR-NNN` Linear ID → reuse that issue (drop prior phase label, add `Audit`); audit scope = repo root unless additional argument provided. Source: `design-brainstorm-ideate-3.md` §Approach A "Slash-command surface" bullet 3.

**FID generation:**

- **If** argument matches `^[A-Z]+-[0-9]+$` (Linear ID) → `FID` = lowercase issue ID + kebab-from-title (existing `bkit-design.md` Step 1.7 pattern). Example: `bar-199-audit-workflow`.
- **Else** (no Linear issue) → `save_issue({ title: "Audit run {YYYY-MM-DD HH:MM} ({repo-slug})", team: "Bartens", state: "In Progress", labels: ["Audit"] })` (per `design-brainstorm-ideate-3.md` §Approach A "Slash-command surface" — creates issue so comment-per-step trail persists). FID derived from returned issue ID + kebab title.
- **Lock-collision safety:** Audit FID derived from new issue ID never collides with feature FIDs because issue IDs are unique. If user runs `/bkit-audit BAR-199` while `/bkit-build BAR-199` holds the lock for the same FID — reject with "Workflow already running for {FID}" (existing lock semantics in `bkit-design.md` Step 1.1 unchanged).

**Concurrency rules** (per `design-brainstorm-ideate-3.md` decision row 8):

- Lock key = `{FID}` (existing pattern; no audit-specific lock).
- Cross-FID parallelism unrestricted: `/bkit-build bar-200-x` and `/bkit-audit bar-201-y` coexist freely.
- Same-FID `/bkit-audit BAR-NNN` while another `/bkit-*` workflow holds the same FID's lock → "Workflow already running" rejection (no special audit override).
- **Open question (lens-3 §Cross-Approach Risks row 8):** Should re-audit of `BAR-199` always create a new audit-FID (`bar-199-audit-{timestamp}`) to decouple from feature work? **Resolution:** YES — FID format extended to allow a `-audit-{YYYYMMDD-HHmm}` suffix when re-auditing a tracked issue. Example: `/bkit-audit BAR-199` (when `BAR-199` already has a feature FID `bar-199-audit-workflow` shipped) → new FID `bar-199-audit-workflow-audit-20260515-1402`. Avoids brief's silent ambiguity. Locks isolated; lineage preserved via FID prefix.

## Linear Lifecycle

Linear-bound per `design-brainstorm-ideate-3.md` decision row 2. Rejected B (Linear-skipped subroutine) and C (top-level but Linear-skipped) because lens-3 §Premortems show both fail at 6-month horizon: audit findings die in `drafts/` with no Linear trail, label/state queryability lost, comment-per-step audit history absent.

**Issue creation/reuse:**

- `/bkit-audit BAR-NNN` (matches `^[A-Z]+-[0-9]+$`) → reuse existing issue: `get_issue({ id: "{ISSUE_ID}" })` → extract current `STATE`, `LABELS`, `DESCRIPTION` → drop prior phase label (Design/Plan/Build/Ship/Merged are mutually exclusive) → add `Audit`.
- `/bkit-audit` (no arg) OR `/bkit-audit <glob>` (non-issue-ID arg) → `save_issue({ title: "Audit run {timestamp} ({repo-slug})", team: "Bartens", state: "In Progress", labels: ["Audit"], assignee: "me" })` → capture returned `id` as `{ISSUE_ID}`.

**State transitions** (matches `bkit-design.md` lifecycle):

- Step 1 — `Todo` → `In Progress` (Step 1.8 `save_issue({ state: "In Progress" })`).
- Step 7 — `In Progress` → `In Review` (Step 7 `save_issue({ state: "In Review" })`). Phase label `Audit` persists per `workflows.md` § Labels rule "Failed (Failure Path) and Debug (Debug Workflow) are additive — phase label persists".
- **No auto-`Done`** — reject `design-brainstorm-ideate-3.md` §Approach A "PASS audits with zero CRITICAL findings auto-route to Done" because (a) it diverges from the design/plan/build pattern (which all end at `In Review`), (b) "zero CRITICAL" is not a strong enough acceptance signal for a read-only artifact (humans should still glance at the matrix), (c) it complicates the Step 7 verdict-routing logic. Keep terminal state uniform.
- Failure Path — `In Review` + `Failed` additive label.

**Label choice:**

- New phase label: **`Audit`** (mutually exclusive with `Design|Plan|Build|Ship|Merged`). Per `design-brainstorm-ideate-3.md` decision row 3 — matches `.agents/workflows.md` § Labels semantics; workflow state machine stays consistent.
- Additive labels (`Failed`, `Debug`, `Auto`) UNCHANGED — they coexist with `Audit` exactly as they coexist with other phase labels.
- **Semantic resolution** (lens-3 §Cross-Approach Risks row 4): `Audit` means "audit workflow is running OR was last to touch this issue". Not "issue needs audit". Mirrors `Design`/`Plan` semantics — they mean "workflow run", not "needs". Document this canonical definition in `.agents/workflows.md` § Labels block when adding the row.

**Comment-per-step contract** (matches `bkit-design.md` § Comments invariant):

- ONE Linear comment per workflow run. First step creates (`save_comment` → capture `COMMENT_ID`); all later steps ONLY append (`save_comment({ id: "{COMMENT_ID}", body: COMMENT_BODY + new fenced section })`).
- Step 3 fan-out: ONE compact comment with a table of all 11 lens verdicts (NOT 11 individual comments). Per `design-brainstorm-ideate-3.md` decision row 9.
- Step 6 summary: comment body = `### Step 6 — Summary - Verdict: {SUMMARY_VERDICT}` + verbatim `audit-summary.md` content (500-token cap enforced at the agent layer per `.agents/prompts.md` § Linear-bound output row).
- Comments fenced as `comment` per `bkit-design.md` body pattern (NOT `markdown` fence — the orchestrator pastes contents into a Linear comment body, not into a markdown file).
- All `save_comment`/`save_issue` are best-effort per `.agents/workflows.md` invariant; retry once after 5s, then continue.

## Standalone Prompt Deprecation

Header-only deprecation per `design-brainstorm-ideate-3.md` §Approach A "Standalone prompt deprecation" + brief decision §5. Deletion deferred until workflow is battle-tested.

**Exact deprecation header text** (insert as a block under the frontmatter, BEFORE the first `**Role:**` line):

```markdown
> [!CAUTION]
> **Deprecated — use `/bkit-audit`.** Standalone invocation supported for one-off scope; new audits SHOULD use the workflow for lens-diversity + synthesis.
> **Deprecated since:** v2.2.0 (BAR-199).
> **Deletion target:** v2.3.0 (next minor) — pending battle-test of `/bkit-audit`.
```

Three lines: deprecation pointer; `Deprecated since` clock (per `design-brainstorm-ideate-3.md` §Premortem "6 months later" recovery — gives future agents a clock so the deprecation note doesn't live forever); `Deletion target` placeholder. The version-string `v2.2.0` matches the current release stream (assumes BAR-199 is the next 2.x minor; adjust in build phase if a release lands first).

**Files receiving the header (4):**

- `.agents/prompts/bkit-utility-audit-codebase.md`
- `.agents/prompts/bkit-utility-audit-security.md`
- `.agents/prompts/bkit-utility-audit-tests.md`
- `.agents/prompts/bkit-utility-audit-logs.md`

`.agents/prompts/bkit-utility-audit-logs-ship.md` is NOT deprecated — it is a post-deploy health check (per `.agents/prompts.md` § Utility row), not a code-quality audit; lives in the ship workflow.

**Registry footnote in `.agents/prompts.md`:**

§ Utility (Ad-hoc) table — prepend a leading `⚠️ ` to each of the 4 deprecated rows AND change the Scope cell to suffix `(deprecated — see /bkit-audit; deletion target v2.3.0)`. Source: `design-brainstorm-ideate-3.md` §Approach A "Standalone prompt deprecation" bullet 2.

Add a new sub-section header `### Deprecated Utility Audits` under § Utility (Ad-hoc) listing the four files + the canonical pointer to `/bkit-audit` for discoverability.

**Deletion timing:** Defer to a follow-up Linear issue (`BAR-200` candidate) scheduled for the release AFTER `/bkit-audit` ships. Concrete trigger: ≥ 5 successful real-world `/bkit-audit` runs OR 1 release cycle, whichever comes first. Tracked in `docs/pending.md` per design-doc step 10 (this design will append a `pending.md` row at session end).

**No registry entry deletion in v1.** The deprecation header is the only change to the standalone prompt files; their `name`/`description`/`tools`/etc remain unchanged so standalone invocation (`@bkit-utility-audit-codebase`) keeps working for muscle-memory users.

## Smoke-Test Acceptance

**Mechanism: build-time validation (one-shot), not runtime gate.** Source: `design-brainstorm-ideate-1.md` decision row 7 — "Smoke-test verifies the audit tool catches known debt; it is a one-time validation of the design, not a per-run gate. Embedding it as runtime would couple the workflow to a specific repo snapshot." Reject lens-1's earlier Approach A bullet ("verdict criterion baked into `bkit-audit-summary.md`") and lens-2's loose "smoke-test acceptance criterion" wording — both ambiguous on run-time vs build-time.

**Golden findings file:** `tests/golden/bar-197-known-debt.finding.md` — checked into the repo at workflow-ship time. Contains the 3 expected finding blocks the audit MUST surface against pre-BAR-197 dev tip. Source: `design-brainstorm-ideate-2.md` decision row 4.

**Exact golden file content (per `design-brainstorm-ideate-2.md` §Smoke-test verification):**

````markdown
# Golden findings — BAR-197 known debt (pre-fix dev tip)

Run `/bkit-audit` against the bkit repo at the SHA immediately before BAR-197 landed. The following three findings (or stronger supersets, by `(class, location)` key) MUST appear in `audit-v2-ranked.md`:

```finding
severity: HIGH
class: compatibility
location: apps/web/next.config.ts:* (serverExternalPackages)
what: serverExternalPackages contains catch-all/wildcard externalising every @aws-sdk subpackage
why: Lambda cold start fails when externalised packages are ESM-only with no CJS fallback
direction: Enumerate externalised packages explicitly; verify each against package.json exports field
confidence: high
lenses_expected: [config]
```

```finding
severity: HIGH
class: performance
location: apps/web/next.config.ts:* (serverExternalPackages)
what: serverExternalPackages externalises ESM-only package causing import failure at Lambda cold start
why: Cold-start failure manifests as 500s on first request to a fresh Lambda
direction: Inline the package (remove from serverExternalPackages) OR pin to CJS-publishing version
confidence: high
lenses_expected: [hotpath]
```

```finding
severity: MEDIUM
class: compatibility
location: package.json + apps/web/next.config.ts (ESM/CJS interop)
what: serverExternalPackages entries with ESM-only package.json "type": "module" and no exports CJS fallback
why: Same ESM/CJS interop trap as the cold-start finding above; surfaces at deploy
direction: Audit each serverExternalPackages entry for CJS publish path before externalising
confidence: medium
lenses_expected: [deps]
```
````

**`/bkit-audit` self-verification mechanism:**

When invoked WITH `--smoke-test` flag (build phase only; not a default mode) AND `tests/golden/bar-197-known-debt.finding.md` present at `$REPO_ROOT/tests/golden/`:

1. Step 7 (Close Workflow) adds a sub-step `## Smoke-Test Attestation` to the canonical audit:
   - Parse each `finding` block from the golden file.
   - For each golden `(class, location-substring)` key → grep `audit-v2-ranked.md` for at least one finding with matching class + location-substring + severity ≥ golden severity.
   - Compute pass: each golden finding has at least one match (superset, not exact match).
2. **If** all 3 golden findings have a match → `## Smoke-Test Attestation` section reads `PASSED` + matched finding citations. Step 7 verdict UNCHANGED (smoke-test is informational; does NOT gate canonical-artifact creation).
3. **If** any golden finding has NO match → `## Smoke-Test Attestation` reads `FAILED` + listing of unmatched expectations. Linear comment is annotated. Step 7 still completes (the audit artifact ships); the smoke-test FAIL is a signal to the human developer that the lens charter regressed.
4. Without `--smoke-test` flag OR golden file absent: section reads `N/A` and no validation runs.

**Passing acceptance criterion** (brief §Acceptance line 96 + lens-2 §Smoke-test verification):

- Lenses **`config`** (brief #3), **`hotpath`** (brief #2), **`deps`** (brief #9) surface the three golden findings.
- Lenses **`security`**, **`tests`** surface nothing unexpected (false-positive count = 0; checked manually first run).
- Lens **`debt`** (brief #7) surfaces TODO/FIXME debt that does exist in the pre-BAR-197 dev tip (count ≥ 1).

**Note on brief acceptance vs lens taxonomy:** Brief acceptance line 96 mentions "lenses 1, 2, 3, 7" — these map to architecture/hotpath/config/debt in the brief's table. Lens 2 merges error+resource into reliability so the merged taxonomy has different numbering. Smoke-test is keyed on **slugs**, not lens numbers: `architecture`, `hotpath`, `config`, `debt`. Verified by `design-brainstorm-ideate-2.md` §Smoke-test verification — only `config`, `hotpath`, `deps` carry the BAR-197 probes; `architecture` would NOT surface BAR-197 debt (it's a config/build trap, not a coupling issue), so the brief's acceptance list is corrected here to `config`, `hotpath`, `deps`, `debt`.

**Storage of smoke-test artifact:** Per `design-brainstorm-ideate-1.md` decision row 7 — recorded in `docs/plans/logs/{FID}/smoke-test.md` during the BAR-199 build phase as a one-time validation artifact. Persistent golden file lives at `tests/golden/bar-197-known-debt.finding.md`.

## Cross-Workflow Hooks

**Explicit deferral to v2.** Source: `design-brainstorm-ideate-3.md` decision row 7 and §Approach A "Cross-workflow hooks" — three reasons:

1. **Side-effect risk.** `bkit-debug-summary` queueing an audit on workaround-close would silently create Linear issues from inside a debug loop. This violates the "agents NEVER touch Linear" workflow-only rule (see `.agents/workflows.md` § Two-Layer Separation Rules). Cross-workflow auto-dispatch belongs at the orchestrator (CI-router) layer, not inside another workflow's summary subagent.
2. **Premature coupling.** v1 lens charters are not yet stable; coupling debug-summary or design-review into them now creates rework debt when lens names/slugs shift between v1.0 and v1.x. lens-3 §Premortems §"6 months later" identifies the brittleness explicitly.
3. **Recommendation-only suffices.** A future `bkit-debug-summary` v2 enhancement can emit a `recommended-followup: audit` field in its Linear-bound verdict body when `CONCERNS` + workaround applied. The human reads the recommendation and decides whether to dispatch `/bkit-audit BAR-NNN`. No auto-coupling needed.

**Non-coupling enhancement allowed in v1** (per `design-brainstorm-ideate-3.md` §Approach A "Cross-workflow hooks" bullet 2):

`bkit-design-review-1` and `bkit-design-review-2` MAY append two bullets to their § Process Step 5 (ecosystem search) referencing the lens charter for dep/perf hotspot probes:

```
- For new dependency additions: cross-check against `bkit-audit-lens-charter.md` § deps probes; flag CVE surface and ESM/CJS interop traps before recommendation.
- For new performance-critical paths: cross-check against `bkit-audit-lens-charter.md` § hotpath probes; flag synchronous I/O or eager heavy imports.
```

This is a **reference** to the shared charter doc, NOT an invocation of `/bkit-audit`. No workflow integration. Justified because the lens-charter doc becomes a single source of truth for probe wording (per `design-brainstorm-ideate-3.md` §Risk-mitigation row 1) and `bkit-design-review-*` already does ecosystem search — adding two charter citations is in-scope for those prompts.

**v2 hooks (designed, not implemented):**

- `bkit-debug-summary` emits `recommended-followup: audit` in verdict body when `CONCERNS` + workaround. Human-dispatched.
- `bkit-build-install-skills` consults latest `docs/audits/INDEX.md` row CRITICAL count before letting build proceed (gating idea from lens-3 §Cross-Approach Risks row 7). Deferred — only viable once audits are routinely run.
- Scheduled audits (cron) — brief Open Question #2. Defer to v2; manual `/bkit-audit` only in v1.

Per `design-brainstorm-ideate-3.md` "hardest-to-reverse decisions are the FID format extension, the new Audit label semantics, and the docs/audits/ canonical location — these define the audit's identity in the bkit ecosystem and should be locked first; cross-workflow hooks, scheduled audits, and standalone-prompt deletion can all be deferred to v2 without backtracking."

## Files to Create / Modify / Delete

Grouped by location. Feeds Step 7 (Organise) workstream decomposition directly.

### `.agents/workflows/`

**Create (1):**

- `.agents/workflows/bkit-audit.md` — 7-step orchestrator. Clone from `bkit-design.md` Steps 1-2, 7-8, 10 (replace `design-` → `audit-`, drop pnpm install, drop `bkit-design-review` ceremony); Step 3 = lens fan-out (11 parallel); Step 4 = synthesize; Step 5 = prioritize; Step 6 = summary; Step 7 = close (cp v2 → `docs/audits/{FID}-audit.md` + append INDEX.md + squash-merge dev).

### `.agents/prompts/`

**Create (15):**

- `.agents/prompts/bkit-audit-lens-charter.md` — shared probe-catalogue doc (1 source of truth; per `design-brainstorm-ideate-3.md` §Risk-mitigation row 1).
- `.agents/prompts/bkit-audit-lens-architecture.md`
- `.agents/prompts/bkit-audit-lens-hotpath.md`
- `.agents/prompts/bkit-audit-lens-config.md`
- `.agents/prompts/bkit-audit-lens-reliability.md` (merged Lens 4 + Lens 6)
- `.agents/prompts/bkit-audit-lens-observability.md`
- `.agents/prompts/bkit-audit-lens-debt.md`
- `.agents/prompts/bkit-audit-lens-dead-code.md`
- `.agents/prompts/bkit-audit-lens-deps.md`
- `.agents/prompts/bkit-audit-lens-security.md`
- `.agents/prompts/bkit-audit-lens-tests.md`
- `.agents/prompts/bkit-audit-lens-docs-drift.md`
- `.agents/prompts/bkit-audit-synthesize.md` (xhigh, opus, clone of `bkit-design-generate.md`)
- `.agents/prompts/bkit-audit-prioritize.md` (high, opus, clone of `bkit-design-organise.md`)
- `.agents/prompts/bkit-audit-summary.md` (low, haiku, clone of `bkit-design-summary.md`, 500-token cap)

**Modify (4 — deprecation headers):**

- `.agents/prompts/bkit-utility-audit-codebase.md` — prepend deprecation block (per §Standalone Prompt Deprecation).
- `.agents/prompts/bkit-utility-audit-security.md` — same.
- `.agents/prompts/bkit-utility-audit-tests.md` — same.
- `.agents/prompts/bkit-utility-audit-logs.md` — same.

**Modify (optional, non-coupling enhancement — see §Cross-Workflow Hooks):**

- `.agents/prompts/bkit-design-review-1.md` — append 2 bullets to § Process Step 5 referencing lens-charter probes for deps/hotpath.
- `.agents/prompts/bkit-design-review-2.md` — same.

### Registry files

**Modify:**

- `.agents/prompts.md` — add 15 rows to § Models table (11 lens + synthesize + prioritize + summary + charter doc); add new `## Audit Phase` § (between Plan and Build, OR after Utility — orchestrator decides at build time); annotate 4 deprecated rows in § Utility with leading `⚠️ ` + `(deprecated — see /bkit-audit; deletion target v2.3.0)` Scope suffix; add new sub-section `### Deprecated Utility Audits`; verify `## Audit Phase` rationale block captures BAR-197 retro link as historical justification (per `design-brainstorm-ideate-3.md` §Premortem "Author leaves" recovery).
- `.agents/workflows.md` — add row to § File Layout table (`/bkit-audit | yes | yes | docs/audits/{FID}-audit.md`); add `bkit-audit.md         # Workflow 6/6 — 7 steps; hard stop after summary` to the file-tree ASCII; add canonical `Audit` label definition to § Labels block; add § Audit Phase rationale section explaining 11 lenses, BAR-197 anchor.
- `.agents/skills.md` — NO change in v1. Per user memory `project_skills_md_manual.md` — manual curation only; new skill registration only if `obra/superpowers` or similar adds an audit-aligned skill (none currently). The brief's "registers the new workflow" wording refers to `.agents/workflows.md`, not `.agents/skills.md`.
- `.agents/docs.md` — update Workflow Matrix: add `Audit` column with assignments per doc (`docs/audits/*.md` → `●` for Audit; `docs/knowledge.md` → `○`; `docs/architecture.md`/`docs/technology.md`/`docs/security.md` → `○`; etc); add `docs/audits/INDEX.md` row + `tests/golden/bar-197-known-debt.finding.md` entry to Full Catalog § Audits.

### `docs/`

**Create (directory + 2 files):**

- `docs/audits/INDEX.md` — append-only audit index (header + table; first run appends BAR-199's own audit row if `/bkit-audit BAR-199` is the smoke test).
- `docs/audits/{FID}-audit.md` — canonical artifact (one per audit run; first instance created by the BAR-199 smoke-test run against bkit's own repo).
- `docs/decisions.md` — append ADR for: (a) 11-lens taxonomy + merge rationale, (b) Audit label semantics, (c) FID format extension `audit-{timestamp}` suffix, (d) `docs/audits/` canonical location, (e) YAML-frontmatter `finding` block schema.
- `docs/pending.md` — append: standalone `bkit-utility-audit-*` deletion follow-up (target v2.3.0); v2 cross-workflow hooks; v2 scheduled audits; v2 live-runtime lens.

**Modify (1):**

- `docs/completed.md` — appended by `/bkit-ship` (NOT this design); listed here for traceability only.

### `tests/`

**Create (1):**

- `tests/golden/bar-197-known-debt.finding.md` — golden findings file (per §Smoke-Test Acceptance).

### `.claude/commands/` and `.cursor/commands/`

NO direct edits. Both directories are mirrors regenerated by `bkit install` at session end (per user memory `feedback_bkit_install_batching.md` — batch end, not per-edit; never edit mirrors directly per `.agents/workflows.md` § File Layout).

### Delete

NONE in v1. Standalone `bkit-utility-audit-*` deletion deferred to follow-up issue (target v2.3.0).

### Summary count

- **Create:** 1 workflow + 15 prompts + 2 docs (INDEX + first audit) + 1 golden test = 19 files + 1 directory.
- **Modify:** 4 prompts (deprecation) + optionally 2 prompts (review-cite) + 4 registry files = 8–10 files.
- **Delete:** 0.

## Decisions

<!-- prettier-ignore -->
| Decided | Alternatives | Why |
| --- | --- | --- |
| 7-step workflow (Start, Worktree, Lens-fanout, Synthesize, Prioritize, Summary, Close) | 5-step merged synth+prio+summary (lens-1 Approach B); 9-step with review/apply (lens-1 Approach C) | Single-responsibility per step; per-step verdict-recovery preserved; ~85% reuse from `bkit-design.md`. Per `design-brainstorm-ideate-1.md` Decisions row 2. |
| 11 lenses (merge brief Lens 4 Error-handling + Lens 6 Resource-lifecycle into `reliability`) | 12 verbatim from brief; 8 minimal (drop `perf`); 18 expanded | Probe overlap of 4+6 is high; merge saves one Opus subagent for ~15% probe-uniqueness loss; 8 loses BAR-197 detection in `hotpath`. Per `design-brainstorm-ideate-2.md` Decisions row 1. |
| Defer Lens 13 (Live runtime) to v2 | Include with capability-detection gate | `audit-gcp-errors.sh` is GCP-specific; portability §6 blocker without provider abstraction. Brief decision §5 + `design-brainstorm-ideate-2.md` row 3. |
| YAML frontmatter in fenced `finding` blocks at lens-output layer; brief's heading format at final-report rendering layer | Heading format throughout (brief); JSON; table rows | Structurally parseable for synthesizer dedup; heading rendering happens at prioritizer step for human readability. Per `design-brainstorm-ideate-2.md` Decisions row 2. |
| 11 sibling lens prompts forked from `bkit-design-brainstorm-ideate-1` skeleton; shared `bkit-audit-lens-charter.md` for probe catalogue | Single templated prompt with lens-as-argument; sequential single-agent loop | Standalone-runnable per `.agents/prompts.md` Authoring Rules; forking is the established pattern; shared charter prevents drift. Per `design-brainstorm-ideate-1.md` Decisions row 3 + `design-brainstorm-ideate-3.md` Risk-mitigation row 1. |
| Top-level `/bkit-audit` command, Linear-bound, FID `{ISSUE_ID-slug}` or `audit-{YYYYMMDD-HHmm}-{repo-slug}` | `/bkit-design --audit` subroutine (lens-3 B); Linear-skipped (lens-3 B and C); non-prefixed `/audit` | Preserves `/bkit-*` namespace; comment-per-step audit trail + label-based queryability; reuses orchestrator plumbing. Per `design-brainstorm-ideate-3.md` Decisions rows 1, 2, 5. |
| New phase label `Audit` (mutually exclusive with Design/Plan/Build/Ship/Merged) | Reuse `Design` label; additive label | Mutually-exclusive matches existing `.agents/workflows.md` § Labels semantics. Per `design-brainstorm-ideate-3.md` Decisions row 3. |
| Canonical output → `docs/audits/{FID}-audit.md` + append-only `docs/audits/INDEX.md` | `docs/plans/drafts/` (lens-3 C); ephemeral in logs (lens-3 B) | Domain separation (audits vs designs/plans); discovery via INDEX without globbing. Per `design-brainstorm-ideate-3.md` Decisions row 4 + Risk-mitigation row 5. |
| Header-only deprecation on standalone `bkit-utility-audit-*` with `Deprecated since` + `Deletion target` clocks; deletion deferred to follow-up issue (target v2.3.0) | File move; immediate deletion; no clocks | Brief decision §5; clocks prevent indefinite deprecation drift. Per `design-brainstorm-ideate-3.md` §Premortem "6 months later" recovery. |
| No `Done` auto-routing on `PASS` audit | Auto-`Done` on PASS + 0 CRITICAL (lens-3 Approach A) | Diverges from design/plan/build pattern which all end at `In Review`; zero CRITICAL is not strong enough to skip human review of a read-only artifact. Rejects lens-3's optimistic auto-Done. |
| Smoke-test = build-time one-shot validation against pre-BAR-197 tip; golden file `tests/golden/bar-197-known-debt.finding.md`; `--smoke-test` flag triggers verification step in Step 7 | Runtime gate in `bkit-audit-summary` (lens-1 Approach A bullet 5); ad-hoc only (brief acceptance line) | Couples one-shot proof to a specific snapshot without making it a per-run gate. Per `design-brainstorm-ideate-1.md` Decisions row 7 + `design-brainstorm-ideate-2.md` Decisions row 4. |
| All-Opus lens-subagents (no Sonnet diversity in v1) | Mix Opus/Sonnet across 11 lenses (parallel to `bkit-design-brainstorm-ideate-2`) | Brief decision §4; revisit if cost binds. Lens-1's note to flag this for the synthesiser is layered onto Risks below. |
| Lens output cap = 30 findings (top by severity) per lens | No cap; cap by class | Prevents synthesizer truncation at scale (11 × 30 = 330 ceiling). Per `design-brainstorm-ideate-3.md` Risk-mitigation row 2. |
| No cross-workflow hooks in v1; `bkit-design-review-*` MAY cite lens-charter for deps/hotpath (non-coupling reference, not invocation) | Wire `bkit-debug-summary` audit-queue; wire `bkit-build-install-skills` audit-INDEX gate | Brief Open Q 1 resolved; surprises and side-effects compound risk in v1. Per `design-brainstorm-ideate-3.md` Decisions row 7. |
| Portability gate: synthesizer greps lens-output text for `Next\.js | Vercel | pnpm | esbuild` stack-pinning words; CONCERNS + `## Portability Drift` if found | No mechanical enforcement (today's state) | Brief portability decision §6 lacks teeth; mechanical gate enforces. Per `design-brainstorm-ideate-3.md` Risk-mitigation row 6. |
| `.agents/skills.md` NOT modified in v1 | Add workflow row to skills.md | User memory `project_skills_md_manual.md` — manual curation only; no skill registration needed. Brief's "registers the workflow" refers to `.agents/workflows.md` registry, not skills.md. |

## Approaches Considered

<!-- prettier-ignore -->
| Approach | Verdict | Why |
| --- | --- | --- |
| **A1 (lens-1) — 7-step faithful mirror of `bkit-design` skeleton + 12 sibling lens prompts** | KEPT (structural backbone) | Maximises reuse (~85%) of orchestrator ceremony; Failure Path, gates, status.json, comment append discipline lifted verbatim. Lens count tuned to 11 by merging A2's reliability merge. |
| **A2 (lens-2) — Schema-first lens prompts with YAML-frontmatter `finding` blocks + 11 lenses + golden findings file** | KEPT (lens taxonomy + finding schema + smoke-test mechanism) | Structural finding schema is load-bearing for synthesizer reliability at 11-output scale; merge of error+resource into `reliability` reduces token cost without losing detection power; golden file makes smoke-test mechanical. |
| **A3 (lens-3) — Full-Ceremony Sixth Workflow with Linear-bound `Audit` label + `docs/audits/{FID}-audit.md` + INDEX.md** | KEPT (integration + lifecycle) | Audit identity in bkit ecosystem; comment-per-step queryability; INDEX as discovery surface; FID-format extension `-audit-{timestamp}` for re-audits. |
| B1 (lens-1) — Collapsed 5-step merged synth+prio+summary mega-agent | REJECTED | Violates single-responsibility; truncation risk at 12-lens input; no fine-grained verdict recovery; defeats per-step Stubbed-output pattern. |
| C1 (lens-1) — 9-step with adversarial review/apply round on synthesis | REJECTED | Over-engineered for terminal read-only workflow with no downstream propagation; review stage exists in design because errors propagate to plan+build — audit has no downstream. |
| B2 (lens-2) — Tiered Core 6 + Extended 5 with free-text heading findings | REJECTED | `config` lens (load-bearing for BAR-197 detection) lands in Extended tier — coverage regression on the highest-value use case; free-text synthesis unreliable at 11-output scale. |
| C2 (lens-2) — Single orchestrated agent with internal lens loop (8 lenses) | REJECTED | Context exhaustion at lens 5-6 in single agent; parallelism loss directly contradicts brief decision §1 ("Each lens is independent — parallelizable"). |
| B3 (lens-3) — Lightweight subroutine of `/bkit-design --audit`, no Linear, ephemeral `docs/plans/logs/` output | REJECTED | Zero institutional memory at 6-month horizon; no Linear trail = audits become disposable and operators stop running them; overloads design semantics. |
| C3 (lens-3) — Top-level command but Linear-skipped, output to `docs/plans/drafts/` | REJECTED | Mixes audit artifacts with plan/design drafts; no Linear queryability; orphan command in workflow registry; recovery from this position = retrofit Linear plumbing = restart from A. |
| MERGED ALL THREE — A1 (skeleton) + A2 (lens taxonomy + schema + smoke-test) + A3 (Linear/output/FID/INDEX) | KEPT | Each lens approached a different concern; merging stays strongest-per-concern rather than collapsing to consensus. |

## Trade-offs Accepted

**What we gain (vs alternatives B1/C1/B2/C2/B3/C3):**

- Full reuse of `bkit-design.md` orchestrator ceremony — workflow file is ~85% mechanical clone; review-time effort goes into lens-charter content, not orchestrator surface.
- Structured finding schema enables mechanical dedup and Severity × Class matrix render — no prose-comprehension fragility at 11-output scale.
- Linear-bound runs preserve audit history queryable by label/state/comment; INDEX.md prevents `docs/audits/` globbing.
- Stack-signal detection in each lens preserves portability §6 across consumer repos without sacrificing BAR-197-class detection on stacks where pinning matters.
- Smoke-test golden file provides mechanical regression guard against future lens-charter weakening.
- FID format extension `-audit-{timestamp}` decouples re-audits from feature work locks; lineage preserved via prefix.

**What we sacrifice:**

- **Token cost** (~4× `bkit-design`'s triplet — 11 parallel Opus subagents). Mitigation: 30-finding cap per lens; future lever = downgrade lower-priority lenses to Sonnet for cross-tier diversity (brief decision §4 punts; revisit if cost binds).
- **No adversarial review of synthesis** (rejected C1). If synthesizer produces a poor matrix, no automated catch — relies on human reading `docs/audits/{FID}-audit.md` and CONCERNS-triaging. Acceptable because audit is terminal (no downstream propagation).
- **No auto-`Done` on PASS audits** (rejected lens-3 approach A optimisation). Every audit ends `In Review`; humans must hand-close. Adds 1 Linear interaction per clean audit; preserves uniform workflow lifecycle.
- **Lens count locked at 11** for v1; adding Lens 12 (logs) or new domain lenses requires a follow-up workflow revision. Single-prompt addition is cheap (1 file + 1 fan-out row + 1 charter row) but coordinated nonetheless.
- **No cross-workflow hooks in v1** — `bkit-debug-summary` workaround-close does NOT auto-queue audits; humans dispatch manually. Some audits will be missed.
- **Comment-per-step cost** — ~7 Linear writes/run. At 10× scale (~120 audits/week across repos) approaches rate-limit territory; mitigation = lens-3 Step 3 fan-out consolidation (one comment per fan-out, not 11) already locked in.
- **Standalone `bkit-utility-audit-*` linger** — 4 deprecated prompts live in `.agents/prompts/` until follow-up issue lands; muscle-memory invocations keep working but registry table accumulates `⚠️ ` rows.
- **Smoke-test scope locked to BAR-197 debt class** — golden file proves the audit catches one specific incident class; doesn't prove it catches future debt classes. Acceptable as v1 acceptance bar; broader regression coverage = follow-up.

## Risks & Open Questions

**Risks** (carry forward from `design-brainstorm-ideate-3.md` §Cross-Approach Risks; mitigations layered into Decisions table):

1. **Lens-prompt portability drift** — without mechanical gate, individual lens-prompt edits will re-pin to Next.js/pnpm over time. Mitigation in Decisions table: synthesizer greps for stack-pinning words and emits `## Portability Drift` CONCERNS. Source: `design-brainstorm-ideate-3.md` Risk-mitigation row 6.
2. **Synthesizer scale-out** — 11 lenses × ~15 findings ≈ 165 inputs to one `xhigh` Opus agent; truncation risk at debt-rich codebases. Mitigation: 30-finding cap per lens; `bkit-audit-synthesize` self-reports `{N}/{TOTAL} findings processed` in verdict header. Source: `design-brainstorm-ideate-3.md` Cross-Approach Risks row 2.
3. **Deprecation half-life** — `bkit-utility-audit-*` deprecation note has explicit `Deprecated since` + `Deletion target` annotations, but the actual deletion needs a triggering event. Mitigation: append entry to `docs/pending.md` (this design's session-end side-effect per `bkit-design-generate` Process step 10).
4. **`Audit` label semantic ambiguity** — "issue under audit" vs "issue needs audit". Mitigation: canonical definition added to `.agents/workflows.md` § Labels block: "Audit = workflow ran/is running, NOT 'needs audit'". Source: `design-brainstorm-ideate-3.md` Cross-Approach Risks row 4.
5. **Smoke-test reproducibility** — golden file validates against a specific SHA (pre-BAR-197); worktree creation in Step 2 defaults to `origin/dev`. Open: does the workflow need a `BASE_REF` override to run smoke-test against historical SHAs? Mitigation: smoke-test is build-phase one-shot; build phase will check out the pre-BAR-197 SHA manually in a sibling worktree and run `/bkit-audit --smoke-test` from there. Documented in `docs/plans/logs/{FID}/smoke-test.md` artifact during BAR-199 build.
6. **Comment-per-step cost at 10× scale** — ~7 writes/run × 120 runs/week = 840 writes/week. Mitigation: Step 3 fan-out consolidates 11 lens verdicts into one comment (locked in §Linear Lifecycle); future option = batch close-workflow + summary into one write (deferred to v2).
7. **Downstream consumers of `docs/audits/{FID}-audit.md`** — Brief Open Q 3. v1 = static artifact for humans; INDEX.md enables future tooling consumers. Resolution-in-design: keep as static for v1; v2 hook (`bkit-build-install-skills` consults INDEX CRITICAL count before build) deferred.

**Open Questions:**

<!-- prettier-ignore -->
| Question | Status | Resolution / Defer |
| --- | --- | --- |
| Brief Open Q 1 — Cross-workflow hooks (`bkit-debug-summary` audit-queue; `bkit-design-review-*` lens-checklist) | **Resolved-in-design** | No hooks in v1; non-coupling lens-charter citation in `bkit-design-review-*` allowed (optional). Per `design-brainstorm-ideate-3.md` Decisions row 7. |
| Brief Open Q 2 — CI integration / scheduled audits | **Defer-to-build** (v2) | Manual `/bkit-audit` only in v1. Brief decision. |
| Brief Open Q 3 — Downstream consumers of `docs/audits/{FID}-audit.md` | **Resolved-in-design** | Static artifact for v1; `docs/audits/INDEX.md` is the discovery surface; v2 may add `bkit-build-install-skills` consultation. |
| Lens-3 Cross-Approach Risk 5 — `BASE_REF` override for smoke-test | **Resolved-in-design** | Build phase runs `/bkit-audit --smoke-test` from a sibling worktree manually checked out to pre-BAR-197 SHA; no workflow argument added in v1. |
| Lens-3 Cross-Approach Risk 8 — Audit FID lineage tie when re-auditing tracked issue | **Resolved-in-design** | FID format extended to `{ISSUE_ID-slug}-audit-{YYYYMMDD-HHmm}` for re-audits; lineage preserved via prefix; locks decoupled via timestamp suffix. |
| Lens-3 Cross-Approach Risk 4 — `Audit` label canonical semantics | **Resolved-in-design** | "Audit" = workflow ran/is running, NOT "needs audit". Document in `.agents/workflows.md` § Labels block (modify line in Files list). |
| Brief decision §4 — Model strategy revisit (all-Opus vs cross-tier diversity) | **Defer-to-build** | Lens-1 flags this for synthesiser attention; not blocking v1 ship. Revisit after first 10 audit runs if cost binds. |
| Where in `.agents/prompts.md` does the new "Audit Phase" Agent table go? Between `## Plan Phase` and `## Build Phase`, OR after `## Utility (Ad-hoc)`? | **Defer-to-build** | Either position works; build agent picks based on grep/section-ordering convention. Lean toward "between Plan and Build" for chronological workflow ordering (`/bkit-design` → `/bkit-plan` → `/bkit-audit` → `/bkit-build`) — but audits can run at any time, so ordering is partly arbitrary. |
| Will `.agents/docs.md` Workflow Matrix add a new `Audit` column, or extend existing `Design`/`Plan` columns? | **Defer-to-build** | Add `Audit` column (cleanest); 7 doc rows need `●`/`○` assignments. Build agent picks per-doc relevance. |
| Should the `--smoke-test` flag be exposed in v1 or v2? | **Resolved-in-design** | v1 — needed for BAR-199 acceptance criterion to be verifiable; otherwise the workflow ships without a self-validation path. Default off; opt-in via flag. |
| Does the workflow ship with `bar-199-audit-workflow` already audited (i.e., is BAR-199's own `/bkit-audit` smoke run the seed of `docs/audits/`)? | **Defer-to-build** | Yes — first audit run during build phase against pre-BAR-197 SHA creates the first `docs/audits/` artifact + first INDEX row. Documented in `docs/plans/logs/{FID}/smoke-test.md`. |
