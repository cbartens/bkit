# Design Brainstorm & Ideas

Lens: Pragmatic — existing code, minimal new infra, ship fastest.

> Scope note: the locked decisions (shared envelope + `kind` discriminator + typed/prose payload; ms `ts` id; event-sourced append + fold; agent-read JSONL; `references[]` + `aliases[]`; deterministic grader; advisory-never-gates; phasing P1–P5) are FIXED. These approaches do NOT relitigate them. They vary the things still open: **(a) one combined file vs per-purpose files**, **(b) where the writer/reader code lives and how much TS vs inline-jq**, **(c) the migration mechanics for the markdown ledgers**, **(d) how workflow close/summary steps write+aggregate**, and **(e) how the new runtime-data files earn their install/mirror/slop/Vale exemptions**. Grounding: `.bkit/src/bkit-status.ts` (canonical NDJSON fold reducer + `appendLine`), `.gitattributes` (markered `merge=union` block, manifest `markered-text` entry), `slop-scan.config.json` (`ignores[]` + per-dir `overrides[]`), `.bkit/workflows/bkit-ship.md` lines 300–780 (inline `jq -nc … >> "$STATUS"` close-step pattern + the fold-to-array jq at L302), `.bkit/src/bkit-manifest.ts` CORE_MANIFEST (canonical `.bkit/*` docs as `byte-equal-text` mirrors). The whole machine should be the SAME shape the repo already proved with `status.jsonl`.

---

## Approach A — Mirror the proven `status.jsonl` machine: per-purpose files + one canonical TS contract module + inline-jq writers ⭐ Recommended

**Summary.** Treat the telemetry family as a direct generalisation of the existing per-FID `status.jsonl` pattern that already ships and works: four (later six) **per-purpose** append-only NDJSON files at repo root `.bkit/` (`stats.jsonl`, `friction.jsonl`, `deferrals.jsonl`, `failures.jsonl`; later `knowledge.jsonl`, `decisions.jsonl`), each governed by ONE canonical TS contract+reducer module (`.bkit/src/bkit-telemetry.ts`) that defines the shared envelope, the `kind` union per file, the `fold` (current-state derivation by logical key), and an `appendLine` serializer — exactly mirroring `bkit-status.ts`. Workflows write rows with the SAME `jq -nc … >> "$FILE"` idiom they already use for `status.jsonl`; the TS module is the unit-tested source of truth that the inline jq mirrors. The grader (`bkit-comply.ts`) and analysis/harvest CLIs are downstream readers of these files via the same module's `fold`.

- **Schema shape.** Per-purpose file (decision #1: "one file per purpose"). Shared envelope `{ ts, repo, bkitVersion, workflow, subagent?, severity?, references[], aliases[] }` + `kind` discriminator + per-`kind` payload mixing typed fields and prose (decision #1). `stats.jsonl` carries `kind ∈ {compliance, run-outcome, counter}`; `friction.jsonl` / `deferrals.jsonl` / `failures.jsonl` each a small kind set. `fold` keys friction/knowledge rows by a logical key (e.g. normalized `category+scope+description-hash`, or an explicit `key` field written once) so the instinct loop (decision #3) = append a new row with the same key; `fold` reduces to current state and computes `confidence`/`lastConfirmed`/recurrence-count/interval-between for free, identical to how `status.jsonl` folds repeated `step-done` rows.

- **Complexity: LOW.** It is the pattern already in the tree. `bkit-status.ts` is 147 lines and directly templatable; the `.gitattributes` union block, the slop `overrides[]`, and the inline-jq close-step idiom all already exist and just get extended by N lines each. No new abstraction the repo hasn't already validated in production.

- **Extensibility.** New file = new `kind` union + new fold key + one `.gitattributes` line + one manifest exemption + one `ignores` entry. Adding `knowledge.jsonl`/`decisions.jsonl` in P5 is purely additive and needs no rework of P1 files. New record types inside an existing file = new `kind` arm, no new file. This is the most future-proof axis because each file evolves independently.

- **Risk.** Main failure mode: **inline-jq writer drifts from the TS contract** (the known `status.jsonl` hazard — the jq filter must mirror `fold`/`appendLine` exactly). Mitigation is the existing one: TS is canonical + unit-tested; a render-parity / fixture test asserts a representative jq-written row parses under the TS reader. Secondary: per-purpose files multiply the number of close-step writes (more jq blocks across 5 workflows) — bounded, mechanical, and each is copy-of-an-existing-pattern.

- **Maintenance.** LOW-MEDIUM. Same maintenance surface the team already carries for `status.jsonl` (keep jq ≡ TS). One module to own the contract; the per-file proliferation is the only added cost and it's linear and shallow.

- **Reuse vs new.** Maximal reuse. Reuses: `bkit-status.ts` reducer shape, `appendLine` pattern, `.gitattributes` union block + manifest `markered-text` entry, slop `overrides[]`, the inline-jq close-step convention, the `utility-harvest-friction` agent model for the harvest CLI. Net-new: one `bkit-telemetry.ts` module, `bkit-comply.ts` (P2, already specced), the analysis CLI verb (P4), the #58 shell counter helper (P3). No new infra category.

---

## Approach B — Single combined `.bkit/telemetry.jsonl` with one universal envelope + top-level `kind`

**Summary.** Collapse all purposes into ONE append-only file at `.bkit/telemetry.jsonl`. Every row is the shared envelope + a top-level `kind` that spans the full universe (`compliance | run-outcome | counter | friction | deferral | failure | knowledge | decision`). One file, one `.gitattributes` line, one exemption, one fold that partitions by `kind` then by logical key. Readers filter by `kind`.

- **Schema shape.** Identical envelope to A; the difference is physical layout — one file instead of four/six. Fold partitions on `kind` first. The instinct loop works the same way (append same-key row, fold to current).

- **Complexity: LOW-MEDIUM.** Slightly simpler plumbing (one file → one gitattributes line, one exemption, one harvest glob) but a more complex single fold that must branch on the full `kind` space, and a single hot file every workflow step appends to.

- **Extensibility.** New record type = new `kind` arm only — no new file, no new exemption. BUT the file's schema becomes a monolith: every consumer of any subset pays to understand the whole union, and P5's knowledge/decisions migration mutates the same file P1 ships, raising coupling between phases.

- **Risk.** Main failure mode: **the locked decision #1 explicitly says "one file per purpose"** — a single combined file contradicts the brief and is likely out of remit. Beyond that: one ever-growing file is harder to prune/rollup per-purpose (unbounded-growth open question from #232 gets worse), a single corrupt/oversized line risks the whole telemetry stream, and harvest can't selectively pull just friction. Union-merge churn concentrates on one file across concurrent reads (single-clone serialisation mitigates but the file is bigger).

- **Maintenance.** MEDIUM. One file is fewer things to wire but a bigger blast radius per change and a coarser pruning/retention story.

- **Reuse vs new.** Same reuse profile as A (status.jsonl pattern, jq idiom, exemption mechanics). The only delta is fewer-but-fatter wiring points. Net-new code is the same set as A.

> Honest read: B is the strictly-simpler-plumbing alternative but it **violates locked decision #1** ("one file per purpose"). Included as the documented road-not-taken; recommend only if the team reopens that decision (e.g. to minimise gitattributes/exemption surface).

---

## Approach C — Thick TS writer: a `bkit telemetry append` CLI verb that all workflows shell out to (no inline jq)

**Summary.** Per-purpose files like A, but workflows STOP writing rows with inline `jq -nc` and instead call a new CLI verb, e.g. `pnpm bkit telemetry append --file friction --kind … --field …` (or pipe JSON to stdin). The verb lives in `bkit-telemetry.ts` and is the single code path that constructs the envelope (stamps `ts`/`repo`/`bkitVersion`), validates the `kind` payload, and appends — eliminating the jq-vs-TS drift risk by making the TS the ONLY writer. `status.jsonl` could later adopt the same path; the fold/reader stays shared.

- **Schema shape.** Same per-purpose, same envelope+`kind` as A. The change is purely the write mechanism: one validated TS writer instead of N hand-written jq filters.

- **Complexity: MEDIUM.** New CLI surface (arg parsing for arbitrary typed payloads, or a stdin-JSON contract), and every close step in 5 workflows changes from a jq line to a `bkit telemetry append` invocation. More upfront wiring than A; the payoff is no drift.

- **Extensibility.** Good — new `kind` = new validated arm in one place, and workflows pass `--kind newthing`. But a CLI that must express every typed payload as flags gets unwieldy fast (decision #1's "typed + prose fields" means rich payloads); a stdin-JSON contract is cleaner but then the workflow is back to constructing JSON (with jq), partially defeating the purpose.

- **Risk.** Main failure mode: **introduces a hard runtime dependency on the built `bkit` CLI inside the workflow hot path** — every telemetry write now requires `dist/` to be built and resolvable in the consumer/worktree, where today the workflows are self-contained shell+jq. A build/resolution failure turns "log telemetry" (must be best-effort, never-gate per decision #6/advisory rule) into a potential hard stop. Also diverges from the established, working `status.jsonl` inline-jq convention — inconsistent with the rest of the runtime.

- **Maintenance.** MEDIUM-HIGH. New CLI contract to version and keep stable across consumer upgrades; the flag/stdin schema becomes another compatibility surface. Heavier than A's "keep one jq line ≡ one TS reducer."

- **Reuse vs new.** Reuses the fold/reader and exemption mechanics, but DISCARDS the proven inline-jq writer convention in favour of net-new CLI plumbing. Highest net-new of the three; lowest reuse of the existing write path.

---

## Decisions

| Decided                                                                                                                                                                                                                                    | Alternatives                                       | Why                                                                                                                                                                                                                                                                                                                 |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Recommend Approach A** (per-purpose files + one canonical `bkit-telemetry.ts` contract/reducer + inline-jq writers mirroring it)                                                                                                         | B (single combined file); C (thick CLI writer)     | A is a 1:1 generalisation of the already-shipped `status.jsonl` machine — lowest risk, lowest new infra, honours locked decision #1 ("one file per purpose") and #3 (fold-for-state). It reuses the union-merge block, slop `overrides[]`, manifest mirror exemptions, and the inline-jq close-step idiom verbatim. |
| Per-purpose JSONL (`stats`/`friction`/`deferrals`/`failures`; later `knowledge`/`decisions`)                                                                                                                                               | Single `telemetry.jsonl` (B)                       | Locked decision #1 mandates per-purpose; also enables per-purpose pruning/retention, selective harvest, and additive P5 without touching P1 files.                                                                                                                                                                  |
| Writers = inline `jq -nc … >> "$FILE"`, TS = canonical unit-tested reducer the jq mirrors                                                                                                                                                  | Thick `bkit telemetry append` CLI (C)              | Keeps telemetry writes self-contained shell (best-effort, never-gate per decision #6) with no hard dependency on a built CLI in the hot path; consistent with `status.jsonl`. Drift risk mitigated by the existing TS-is-canonical + parity-test discipline.                                                        |
| Migration off markdown ledgers = clean break: new entries get `ts` ids + empty `aliases[]`; legacy `KN-`/`DE-` ids preserved only via `aliases[]` on migrated rows; ~1,460 cross-refs NOT retrofitted                                      | Mass find-replace of all KN-/DE- refs to new ids   | Locked decision #5: `aliases[]` makes old refs resolve unambiguously without touching engine source / archived plans / CHANGELOG / closed issues / consumer repos. Mass retrofit is high-blast-radius and explicitly rejected.                                                                                      |
| Exemptions = extend EXISTING mechanisms: one `.gitattributes merge=union` line per file (in the markered block), one slop `ignores`/`overrides` entry, manifest entry that marks the files as runtime-data NOT install-mirrored, Vale skip | Invent a new "runtime data" exemption category/dir | The repo already exempts `status.jsonl`, the `.md` ledgers, and `.bkit/src` from these engines via the same three knobs. Reuse > new (and per memory: per-file opt-out, never blanket category).                                                                                                                    |
| Fold-for-current-state keyed by a logical key per row (instinct loop = append same-key row; fold derives confidence/lastConfirmed/recurrence)                                                                                              | Mutate-in-place / separate "current state" file    | Locked decision #3 (event-sourced append + fold), and it's exactly what `status.jsonl`'s `fold` already does; preserves `merge=union` safety.                                                                                                                                                                       |
| `ts` = unix **milliseconds**, primary id + timestamp                                                                                                                                                                                       | seconds; separate id+timestamp fields              | Locked decision #2: ms avoids same-second collisions when a close step writes several rows; doubles as elapsed-time source. (Note: `status.jsonl` uses ISO `at` strings — telemetry's ms-`ts` is an intentional, brief divergence the reducer must handle.)                                                         |

</content>
</invoke>
