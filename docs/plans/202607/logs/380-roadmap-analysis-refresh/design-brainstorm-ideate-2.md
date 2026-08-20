# Design Brainstorm & Ideas

Lens: Optimal-tradeoff — best long-term shape ignoring legacy constraints.

## Approach A — Ledger-backed generated roadmap ⭐ Recommended

**Summary:** `docs/roadmap.jsonl` is the append-only source of truth (one `phase-transition` event per FID per workflow close — mirrors the `status.jsonl`/`stats.jsonl` NDJSON doctrine); `docs/roadmap.md` is a **fully regenerated file**, split into a deterministic status-board section (jq/node fold over the ledger + a bounded tracker-issue read, no LLM) and an LLM-authored "Best Next Step / Prompt Suggestions" section (written only by the ship-close / on-demand `bkit-roadmap-refresh` subagent).

- **Complexity:** MEDIUM — new ledger format + a fold-reducer + a renderer script; but the pattern (NDJSON envelope, `merge=union` in `.gitattributes`, canonical-fold-in-TS-mirrored-as-jq) already exists for `status.jsonl`/`stats.jsonl` (#209) — this is precedent-reuse, not a new doctrine.
- **Extensibility:** HIGH — structured, queryable events are the natural sensing substrate #260's tick step 1 ("reconstruct the frontier") wants to consume directly, without re-deriving state from markdown. New analysis dimensions (audit-injection cadence, ledger-review cadence) are additive event kinds, not format renegotiation.
- **Risk:** main failure mode = **write contention on `docs/roadmap.md` itself** when multiple issues close workflows concurrently on the same clone (already a known no-concurrent-workflows-per-clone hazard) — mitigated because the _ledger_ append is `merge=union`-safe like `status.jsonl`, and only the regenerated `.md` (a build artifact, not hand-edited) needs last-writer-wins semantics.
- **Maintenance:** LOW once shipped — mechanical updates are a deterministic script (no LLM cost, no subagent invocation) at every close; only the ship-close/on-demand pass costs a model turn.
- **Existing-codebase friction:** new ledger file + `.gitattributes merge=union` scope entry + a renderer script (new `.bkit/` tooling surface, akin to `bkit-status.ts`'s fold reducer) + mirror regen across all 5 workflows' Close steps (mechanical hook) plus a new subagent + new `/bkit-roadmap` utility command (cross-provider claude/cursor/opencode render). Non-trivial shipped-surface addition but each piece has a direct precedent to copy.

## Approach B — Single markdown file, sed-edited mechanically + subagent-rewritten narratively

**Summary:** No new ledger — `docs/roadmap.md` is the only artifact; every workflow's Close step does an inline mechanical edit (sed/awk row-update, matching the issue owner's literal "move issues from design → plan → build → debug → ship" ask) of one table row, and a new `bkit-roadmap-refresh` subagent fully rewrites the narrative sections on ship-close/on-demand.

- **Complexity:** LOW — no new file format, reuses plain-markdown editing patterns already common in bkit prompts (e.g. tracker comment bodies).
- **Extensibility:** MEDIUM — future consumers (a human, or #260's sensing step) must regex/table-parse markdown rather than read structured JSON; brittle as the table format evolves (new columns, grouped rows for scope-aware clustering break simple sed patterns).
- **Risk:** main failure mode = **the same file (unstructured, hand-formatted) is both mechanically sed-edited by 5 workflows and LLM-rewritten by ship** — no `merge=union` semantics apply to markdown, so concurrent closes race the same table more sharply than in Approach A, and a sed edit landing between the LLM's read and its rewrite can be silently clobbered.
- **Maintenance:** MEDIUM — the markdown table format is a de facto contract between the sed step (5 places) and the subagent's rewrite; any format drift (e.g. an issue owner hand-edits the file) breaks the mechanical step silently.
- **Existing-codebase friction:** smaller than A (no new ledger, no `.gitattributes` change) but the mirror-regen footprint (5 workflows + new subagent + new utility) is identical, and this approach reinvents an ad hoc partial-persistence format bkit already moved away from for `status.json → status.jsonl` (#209) — a straight repeat of the exact problem that migration fixed.

## Approach C — On-demand/ship-only, no mechanical per-workflow step

**Summary:** Drop the mechanical per-workflow update entirely; the roadmap agent (ship-close + on-demand utility only) does a fresh bulk re-read of all open tracker issues + labels each time it runs and reconstructs the whole status board from scratch — smallest possible shipped-surface change (touches only `bkit-ship.md` + one new utility, not design/plan/build/debug).

- **Complexity:** LOW — no ledger, no cross-workflow hook; one new subagent + one new utility command.
- **Extensibility:** MEDIUM — coarser cadence; correct for the "best next step" analysis use case, but weaker as a live sensing substrate since state is only ever as fresh as the last ship or manual run.
- **Risk:** main failure mode = **staleness contradicts an already-confirmed requirement** — the issue owner explicitly asked (comment 2) for other agents to see live phase status in `docs/roadmap.md` between ships; a design/build agent reading a roadmap that's stale by N in-flight issues risks duplicating or missing work.
- **Maintenance:** LOWEST — one file touched, zero mirror-regen expansion into design/plan/build/debug.
- **Existing-codebase friction:** least of the three (no `.gitattributes`, no ledger, no touch on 4 of 5 workflows) — but it's flagged as conflicting with a decision already locked in (the "two-tier model" in the design-input's Resolved decisions section), not a neutral trade-off; carrying it forward would need to relitigate that confirmation.

## Decisions

<!-- prettier-ignore -->
| Decided | Alternatives | Why |
| --- | --- | --- |
| Lead with Approach A (ledger-backed `docs/roadmap.jsonl` + generated `docs/roadmap.md`) | B (single sed-edited markdown), C (ship/on-demand-only, no mechanical step) | Matches the issue owner's confirmed two-tier model (mechanical every-close + full analysis on ship/on-demand) while avoiding B's known failure class (unstructured concurrent-write contention on one markdown file — the exact problem #209 already fixed once for `status.json → status.jsonl`) and C's conflict with the already-confirmed "other agents can see status in roadmap.md" requirement. |
| Ledger format reuses the `status.jsonl`/`stats.jsonl` NDJSON envelope + `merge=union` pattern | A bespoke roadmap-specific schema | Precedent-reuse per rules (`improve over duplicate`); keeps a single "how bkit persists append-only workflow facts" doctrine instead of a second one. |
| Mechanical status write is a deterministic script/inline step (no subagent, no LLM turn) at every workflow close | Subagent-authored mechanical updates (an LLM turn per close, per B/C's implicit framing) | Issue owner explicitly called the mechanical tier "cheap, deterministic, no LLM analysis required" — a subagent invocation for a row update contradicts that and multiplies the 5-workflow mirror-regen cost. |
| Full analysis pass stays a single new subagent (`bkit-roadmap-refresh`) invoked at ship-close + via a new `/bkit-roadmap` on-demand utility, reading the ledger as its sense step | Folding the analysis into an existing subagent (e.g. ship's summary step) | Keeps the "opus writes the roadmap analysis" concern isolated and reusable as-is by #260's sensing tick later — a dedicated, composable subagent rather than logic buried inside ship's Close step. |
| Relationship to #260: design the ledger explicitly as the shared sensing primitive (design proper should state this, not silently duplicate) | Treat #380 as fully standalone, revisit sensing-sharing later | Issue #260 comment (`#260-4724691125`) already named #380's exact requirement as part of its own tick step 1; building a second, incompatible sensing engine now is the "reinventing the wheel" failure mode #260's own comments flag as a thing the orchestrator itself is meant to prevent. |
| Cadence for ledger/audit integration (#80 injection, deferrals/failures.jsonl review) stays an **open design question**, not resolved in brainstorm | — | Design-input explicitly leaves this open ("Still open for design to resolve"); brainstorm's job is approach-shape, not filling in a threshold number — design doc should propose a concrete trigger (count- or staleness-based) grounded in whichever approach above is chosen. |

```

```
