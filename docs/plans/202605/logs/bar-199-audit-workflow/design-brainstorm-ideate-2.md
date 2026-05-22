# Design Brainstorm & Ideas

Lens: Optimal-tradeoff — best long-term shape ignoring legacy constraints.

---

## Approach A — Strict Schema-First Lens Prompts with Inline Probe Catalogue ⭐ Recommended

Each lens prompt carries an explicit **probe catalogue** section — a compact table of `grep`/`glob`/`bash` patterns the agent MUST run, plus stack-signal detection logic that selects variant probes. Findings are emitted as fenced markdown blocks with YAML frontmatter fields (`severity`, `class`, `location`, `what`, `why`, `direction`, `confidence`). The synthesize step parses those fenced blocks structurally rather than free-text. Golden findings file for BAR-197 debt classes is checked into the workflow tests directory.

**Complexity:** MEDIUM

**Extensibility:** New lens = new prompt file + one row in the workflow parallel-subagents table. Probe catalogue is self-contained per file — no shared registry to update. Swapping finding schema requires editing all 12 prompt files but they're shallow.

**Risk:** Probe catalogue drift — an agent ignores half the probes or fabricates grep results without running them. Mitigation: each probe step has a `Verify every return` gate; the fenced-block schema forces structural output the synthesizer can reject if malformed.

**Maintenance:** Each prompt is ~100 lines; 12 lenses = ~1,200 lines total. Catalogue updates require touching individual prompt files. Schema changes propagate manually across all prompts — a friction point but bounded.

**Friction vs ideal:** Existing `bkit-utility-audit-codebase.md` (line 39-42) has zero probe specificity — it says "cross-check domains against docs" with no grep patterns. Existing `bkit-utility-audit-security.md` (line 38-46) has step-by-step but still prose-level, not structured-output. Full replacement of all four existing prompts is required. The four standalone prompts get deprecation headers pointing to `/bkit-audit` (per approved decision 5), which is low friction. New schema (fenced YAML frontmatter) is net-new — no existing downstream parser exists, so synthesize and prioritize prompts are written from scratch.

### Lens count and composition

**Proposed: 10 lenses (merge 3 pairs from the brief's 12, defer 1)**

The brief's 12-lens charter has two overlap candidates and one clear defer:

<!-- prettier-ignore -->
| Brief lenses | Proposed merge/change | Rationale |
| --- | --- | --- |
| Lens 4 (Error handling) + Lens 6 (Resource lifecycle & concurrency) | **Merge → "Failure modes & resource hygiene"** | Both probe for silent failures, missing cleanup, unhandled async. The probe overlap is high: `catch` blocks, unbounded queues, unhandled rejections appear in both. A single agent covers them without dedup burden. Splitting costs one extra subagent token budget for ~15% probe uniqueness. |
| Lens 5 (Observability gaps) + Lens 12 (Documentation drift) | **Keep split** | Observation: Lens 5 is structural code analysis (missing log calls, PII in logs, absent tracing on paths). Lens 12 is doc/code coherence (`.agents/docs.md` vs actual domains). These are genuinely orthogonal — different tools, different readers of the output. |
| Lens 13 (Live runtime signal) | **Defer to v2** | Already flagged in brief. `bkit-utility-audit-logs.md` (line 38-44) depends on `audit-gcp-errors.sh` — a GCP-specific script absent from most consumer repos. Stack-agnostic portability goal conflicts with this lens without a capability-detection gate. |

Final 11-lens list (brief's 12 minus merge of 4+6, keep 13 deferred):

1. Architecture & coupling (`arch`)
2. Hot-path / cold-path discipline (`perf`)
3. Configuration & runtime-shape alignment (`config`)
4. Failure modes & resource hygiene (`reliability`) — merged 4+6
5. Observability gaps (`observability`)
6. Debt markers & expired workarounds (`debt`)
7. Dead / duplicate / over-abstracted code (`dead-code`)
8. Dependency hygiene (`deps`)
9. Security posture (`security`)
10. Test coverage & signal quality (`tests`)
11. Documentation drift (`docs-drift`)

Against a/b/c (migrations, i18n, a11y): brief correctly defers them. Migrations is a data-layer concern orthogonal to code quality; i18n and a11y require UI rendering context these agents cannot structurally probe. Not adding.

### Per-lens probe specificity

Each lens prompt includes a **Probe Catalogue** table with columns: `Tool`, `Pattern`, `What it finds`, `Stack-signal condition`. Stack signal detection block runs first — agent reads `package.json` / framework config to set `STACK_FLAGS` and conditional probes activate:

<!-- prettier-ignore -->
| Lens | Universal probes | Stack-conditional probes |
| --- | --- | --- |
| `arch` | `Grep` for circular imports via `import.*from.*['"]\.\.` fan-out analysis; `Glob` for entrypoint files matching `{index,main,app}.*{ts,js}` | If `"next"` in deps: probe `app/` vs `pages/` coexistence; server-only imports in client components |
| `perf` | `Grep` top-level `require(` / `import` for heavy modules (e.g., `moment`, `lodash`); `Grep` `fs.readFileSync\ | execSync` inside async functions | If `"next"` in deps: `Grep serverExternalPackages` in `next.config.*` — this is the BAR-197 probe |
| `config` | `Glob` `{tsconfig,package,next.config,vite.config,turbo}.{json,ts,mjs}` cross-check; `Grep` `"type": "module"` vs `.cjs` output targets | If monorepo: cross-package `tsconfig` `paths` divergence |
| `reliability` | `Grep` `catch\s*\([^)]*\)\s*\{[^}]*\}` for empty/log-only catches; `Grep` `setInterval\ | setTimeout` without `clearInterval`/`clearTimeout` | If `"ioredis"\ | "bullmq"` in deps: probe unbounded queue patterns |
| `observability` | `Grep` `console\.(log\ | error\ | warn)` vs structured-logging imports; `Grep` `password\ | token\ | secret\ | key` inside log calls (PII probe) | If `"@sentry/\ | @opentelemetry/"` in deps: probe missing `span.end()` / untraced critical paths |
| `debt` | `Grep` `TODO\ | FIXME\ | HACK\ | XXX\ | workaround\ | band-aid` with line context; cross-ref against closed ticket IDs if `.agents/docs.md` present | None — universal |
| `dead-code` | `Grep` exported symbols; `Glob` all source files; `Grep` for imports of each exported symbol (orphan detection heuristic) | If monorepo: cross-package export/import scanning |
| `deps` | `Bash pnpm outdated --json`; `Bash pnpm audit --json`; `Grep` `"resolution":` in `pnpm-lock.yaml` for dual-version same-package | If `"esm"\ | "type":"module"` detected: `Grep require(` in `.mjs`/`.mts` for CJS traps — direct BAR-197 class |
| `security` | `Grep execSync.*\$\{` for shell injection (KN-6 pattern); `Grep` `NEXT_PUBLIC_` for secrets leaked to client; `Grep` hardcoded tokens | If `"@clerk/"\ | "next-auth"` in deps: auth middleware coverage probe |
| `tests` | `Glob` `*.test.ts` count vs source files; `Grep` `it.skip\ | xit\ | xdescribe` for persistent skips; `Grep` `expect(.*).toBeTruthy()` for weak assertions | If `"vitest"` in deps: probe for `vi.mock(` on every critical path (mocked-only critical paths per brief) |
| `docs-drift` | `Grep` domains listed in `.agents/docs.md` vs source dirs; `Grep` file paths in docs that no longer exist; `Read .agents/docs.md` domain list vs actual source modules | None — universal |

### Per-finding schema

**Approach A schema:** YAML frontmatter inside fenced `finding` block:

````markdown
```finding
severity: CRITICAL
class: reliability
location: apps/web/src/lib/db.ts:42
what: broad catch swallows DB lock errors
why: Lock contention fails silently; user sees stale data
direction: Narrow catch to known recoverable errors; log + rethrow on others
confidence: high
```
````

Synthesizer greps for ` ```finding` blocks, parses YAML, deduplicates on `(class, location)` key, builds Severity × Class matrix. Prioritizer applies Severity × Class weighting. Human-readable prose rendering happens in the summary step only.

**Trade-off vs brief's proposed markdown heading format:**

Brief's format (`## [CRITICAL][reliability] file:line — title`) is human-readable but unparseable without regex extraction. It conflates presentation and data. YAML frontmatter separates schema from prose, enabling reliable synthesis without regex fragility. The heading format works for standalone utility audits (where a human reads the file directly) but breaks for automated cross-lens dedup. Both formats can coexist: the lens outputs emit fenced blocks; the summary step renders them to heading format for the final `audit-summary.md` that humans read.

**Alternative schema: JSON tagged objects.** Pure JSON is maximally parseable but hostile to agent output — agents produce prose-interrupted JSON with errors; markdown-embedded JSON blocks require double-escaping. YAML frontmatter in fenced blocks hits the sweet spot.

**Alternative schema: table rows.** Tables enforce a fixed column count, breaking for multi-line `what`/`direction` fields. Rejected.

### Prioritisation logic

Severity × Class matrix in `audit-v2-ranked.md`:

- Primary sort: `CRITICAL` > `HIGH` > `MEDIUM` > `LOW`
- Secondary sort within severity: `security` > `reliability` > `testability` > `compatibility` > `operability` > `maintainability`
- Dedup heuristic: two findings with same `location` + different `class` = cross-lens confirmation → merged to single entry, `confidence` upgraded one tier, both `class` values listed
- Confidence bucket effect on rank: `confidence: low` findings are downgraded one severity tier for ranking (but displayed at original severity with a low-confidence flag); `confidence: high` + cross-lens confirmation = promoted above same-severity single-lens findings

Cross-lens dedup logic in synthesize step: sort all findings by `(file_path, line_range)`. Findings within ±5 lines of same file from different lenses are candidates for merge. Synthesizer reads both, decides merge vs keep-separate by `class` overlap.

### Smoke-test verification (BAR-197 debt)

BAR-197 root cause (per design-input.md): catch-all Lambda bundling + ESM-only `serverExternalPackages`. The probes that would catch it:

- Lens `config` → `serverExternalPackages` set to `["@aws-sdk"]` (catch-all) in `next.config.ts` — probe: `Grep serverExternalPackages` + check value for non-specific wildcard or catch-all array
- Lens `perf` → `serverExternalPackages` with externalized ESM package causing import failure at Lambda cold start — probe: `Grep` `serverExternalPackages` value, cross-check each entry against `package.json` `"type": "module"` or `exports` field
- Lens `deps` → ESM/CJS interop trap — probe: `Grep` packages in `serverExternalPackages` for ESM-only markers in their `package.json`

Golden findings file: a `tests/golden/bar-197-known-debt.finding.md` checked into the repo containing the three expected finding blocks for a pre-BAR-197 repo state. The smoke-test acceptance criterion: running the `config`, `perf`, and `deps` lenses against the pre-BAR-197 tip produces outputs that contain at least the golden-file findings (superset match, not exact match). This is verifiable by grepping the lens output files for the `location` + `what` values in the golden file.

### Cost/runtime: 11 vs 8 vs 18 lenses

<!-- prettier-ignore -->
| Count | Token cost (est.) | Parallelism benefit | Coverage gap |
| --- | --- | --- | --- |
| 8 lenses (merge `arch`+`dead-code`, `observability`+`docs-drift`, drop `perf`) | ~40% cost reduction | Still parallelizable | Loses standalone `perf` probe — BAR-197 class debt goes to `config` only; higher miss risk |
| **11 lenses (recommended)** | **Baseline** | **Full parallel** | **Minimal; `reliability` merge reduces 5% unique findings** |
| 18 lenses (split `reliability` back to 2, add `migrations`, `i18n`, `a11y`, `ci-pipeline`, `api-contracts`, `rate-limiting`, `caching`) | +64% cost | Still parallelizable | Near-zero; catches many low-value findings |

8-lens configuration reduces Opus invocations by ~27% (3 fewer parallel subagents) but the coverage loss on `perf` means BAR-197 class issues are detected only by the `config` lens with lower confidence. The 11-lens recommendation is the minimal set where each lens has <30% probe overlap with any other.

---

## Approach B — Tiered Lens Taxonomy (Core 6 + Extended 5) with Free-Text Findings

Split lenses into a mandatory Core tier (always run) and an Extended tier (run on demand or when stack signals detected), with findings emitted as free-text markdown headings (brief's proposed format). Synthesis is human-driven: the synthesize agent reads all lens outputs as prose and writes the synthesis document through comprehension, not structural parsing.

**Complexity:** LOW

**Extensibility:** Core/Extended tier split makes it easy to add lenses to Extended without changing Core runtime cost. New lens = new file + update the workflow's tier-2 parallel block. Reducing mandatory lenses makes the workflow cheaper to invoke routinely.

**Risk:** Synthesis quality degrades with scale — a human-comprehension synthesizer reading 11 free-text reports and deduplicating in one pass will miss cross-lens confirmations and produce inconsistent severity rankings. With 11 lenses, the synthesizer agent context fills with prose; token pressure causes hallucinated dedup. Free-text findings also make smoke-test verification unreliable: comparing "contains golden finding" requires regex fragility on markdown headings.

**Maintenance:** Heading-format findings are human-readable from any lens output without tooling. No schema to maintain. But dedup logic in the synthesize prompt must be re-taught in natural language per run; there is no structural check.

**Friction vs ideal:** Close to the brief's proposed output shape (heading format is what design-input.md line 68-73 specifies). Low migration friction — existing `bkit-utility-audit-codebase.md` uses a similar severity-sorted heading list. Probe specificity is still absent from existing prompts (same gap as Approach A) — both require net-new probe catalogue authoring.

Core tier (6): `arch`, `security`, `reliability`, `deps`, `tests`, `perf` — the 6 lenses most likely to surface CRITICAL/HIGH findings in any repo.

Extended tier (5): `config`, `observability`, `debt`, `dead-code`, `docs-drift` — higher signal for established codebases, lower signal for new projects.

BAR-197 probe coverage: `config` is Extended tier, so the ESM/`serverExternalPackages` probe only runs in extended mode. This is a coverage regression vs Approach A where `config` runs in all invocations.

---

## Approach C — Single Orchestrated Agent with Internal Lens Loop (8 Lenses)

One agent runs all lenses sequentially (not in parallel), using an internal loop. Each iteration sets `CURRENT_LENS` context and emits structured findings. No per-lens prompt files — a single `bkit-audit-lens.md` template drives all 8 lenses via a filled-in lens parameter.

**Complexity:** LOW (fewer files) / HIGH (single agent doing 8× the work)

**Extensibility:** Adding a lens means updating the lens parameter table in one file. But the agent context window fills with prior-lens findings during the loop, causing drift in probe fidelity for later lenses. The parallelism benefit of the multi-lens design (core reason for the design per design-input.md line 19) is lost.

**Risk:** Context exhaustion — 8 lens iterations in a single `maxTurns: 50` agent with cumulative file reads will hit the context ceiling around lens 5-6, causing the agent to skip probes or hallucinate findings from prior-lens memory. No structural isolation between lens passes means findings from earlier passes contaminate later ones.

**Maintenance:** One prompt file to maintain vs 11-14 in Approaches A/B. But the single file must carry all 8 lens charters, making it ~800 lines of dense probe catalogue. Any lens-specific schema change touches the same file.

**Friction vs ideal:** Directly contradicts the design-input.md approved decision on parallelism (line 19: "Each lens is independent — parallelizable"). The orchestrator pattern in `bkit-design` / `bkit-plan` specifically uses parallel subagents for charter-level variation; a sequential loop replicates none of that benefit.

N/A as primary recommendation — flagged only to argue against it explicitly. The parallelism loss and context-exhaustion risk disqualify it for a 12-lens audit surface.

---

## Decisions

<!-- prettier-ignore -->
| Decided | Alternatives | Why |
| --- | --- | --- |
| 11 lenses (merge reliability lens covering both error-handling and resource-lifecycle) | 12 as in brief; 8 minimal set | Merge reduces ~5% unique findings for 1 fewer subagent; 8 loses the `perf` lens which is load-bearing for BAR-197 class detection |
| YAML frontmatter in fenced `finding` blocks for per-finding schema | Brief's markdown heading format; JSON objects; table rows | Only format that is both agent-writable without double-escaping AND structurally parseable by synthesize/prioritize prompts; heading format deferred to summary rendering |
| Stack-signal detection block in each lens prompt | Separate stack-detection step; no stack adaptation | Keeps portability without a separate pre-step; agent reads `package.json` at probe-catalogue time and activates conditionals; no extra workflow step |
| Golden findings file for BAR-197 debt checked into workflow tests | Ad-hoc smoke test in acceptance description only | Structural check that specific debt class is always detectable; prevents regression if probe catalogue is weakened |
| Core 11 lenses always run (no tier split) | Tiered Core/Extended split (Approach B) | `config` lens is load-bearing for BAR-197 detection; moving it to Extended creates a coverage gap on the highest-value use case |
| Defer live runtime signal lens to v2 (no Lens 13) | Include with capability-detection gate | `audit-gcp-errors.sh` is GCP-specific; stack-agnostic portability goal incompatible without a provider-abstraction sub-system that is out of scope for v1 |
| Migrations / i18n / a11y deferred (agree with brief) | Include as optional Extended lenses | Migrations requires live DB introspection; i18n/a11y require UI rendering context; structural code probes have low signal-to-noise for these domains |

---

## Lens summary

The 11-lens taxonomy proposed here converges the brief's 12 lenses by merging error-handling and resource-lifecycle into a single `reliability` lens (high probe overlap, marginal uniqueness loss), retains all other lenses unchanged, and defers the live-runtime lens to v2 as specified. The YAML-frontmatter-in-fenced-block finding schema is the key structural choice that separates Approach A from B: it enables the synthesize and prioritize steps to operate on data rather than prose, which is essential at 11 parallel outputs where human-comprehension synthesis becomes unreliable. Per-lens probe catalogues with stack-signal conditionals are the gap the existing utility audit prompts (all four of them at `.agents/prompts/bkit-utility-audit-{codebase,security,tests,logs}.md`) do not address — they are role/domain descriptions without grep patterns, which is why BAR-197 debt (ESM-only `serverExternalPackages` + catch-all bundling) would not have been caught by any existing audit pass; the new `config` and `perf` lens catalogues carry explicit `next.config.*` `serverExternalPackages` probes that close this gap directly.
