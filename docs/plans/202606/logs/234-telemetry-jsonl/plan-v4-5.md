<!-- Note: Plans live at `docs/plans/{YYYYMM}/{FID}-plan.md` (canonical month bucket). Logs sit at `docs/plans/{YYYYMM}/logs/{FID}/` and are delete-eligible. -->

# Sub-Plan E (WS-5) — knowledge/decisions migration + consumer-upgrade path (P5)

**Parent Plan:** [`plan-v4-split.md`](./plan-v4-split.md)
**Master Plan (full source):** [`plan-v3-checked.md`](./plan-v3-checked.md)

> [!CAUTION]
> **CRITICAL:** Do not hallucinate plan execution state.
>
> 1. ALWAYS read this actual sub-plan file natively via the `read_file` tool _before_ executing any steps.
> 2. NEVER trust system-generated session summaries or previous conversation history to determine what has been completed.
> 3. Your source of truth is EXCLUSIVELY the literal `[x]` vs `[ ]` checkboxes in this physical document.

## Workstream Dependency

- **Requires:** Sub-plan A (WS-1) shipped to dev **+ the WS2-T1 CLI entrypoint/namespace decision recorded** (the shared `bkit-cli.ts` dispatch/parse architecture). WS-5 may BEGIN once WS2-T1 completes — even before the rest of Sub-plan B ships — because WS-5's CLI plumbing (WS5-T2) is the only part gated on WS2-T1, and everything else inherits WS-1's codec.
- **Concurrency:** May run concurrent with B and C for the non-CLI tasks; WS5-T2 (the destructive migrate CLI) is hard-gated on WS2-T1.
- **Blocks:** Nothing downstream (terminal workstream alongside WS-4).

> [!IMPORTANT]
> **WS-5 inherits the WS2-T1 CLI-substrate decision.** `bkit telemetry migrate` is net-new CLI dispatch + a sub-verb parser on the SAME `bkit-cli.ts` that WS-2 and WS-4 extend. WS-5's sub-verb parser + entrypoint wiring MUST NOT land before WS2-T1 records the entrypoint/namespace decision — otherwise the CLI architecture forks exactly where the design forbids it, and the destructive `.md`-deleting verb risks being wired into the consumer-mutating install hot path the isolation decision is meant to protect.

> [!WARNING]
> **Destructive ledger cutover.** WS-5 retires `docs/knowledge.md` → `docs/knowledge.jsonl` and `docs/decisions.md` → `docs/decisions.jsonl`. Per addendum **A5**, the migration script is **destructive** — it ports history to `.jsonl` and **DELETES the `.md`** after row-count parity is verified (transient `.md.bak`). This SUPERSEDES the design body's "opt-in, dry-run-by-default, never deletes". The destructive delete MUST be reachable ONLY via an explicit hand-invoked `bkit telemetry migrate`, NEVER from the automatic `bkit upgrade` cutover path.

## Context & Goals

WS-5 migrates bkit's `docs/knowledge.md`/`docs/decisions.md` markdown ledgers to NDJSON (`docs/knowledge.jsonl`/`docs/decisions.jsonl`) governed by the WS-1 codec, with `KN-N`/`DE-N` ids preserved only in `aliases[]` (no mass retrofit of the ~1,460 references — a generated committed lookup table resolves them auditably). The migration is destructive (A5), parity-gated, dogfood-first, and tarball-validated; the KN-8 / `611b438` bricking class is guarded mechanically. **bkit-repo tooling — NO database, API, UI, or RLS.**

**Success Criteria (this workstream):**

- `docs/knowledge.jsonl`/`docs/decisions.jsonl` exist with their own scoped `merge=union` lines + slop exemptions; legacy `KN-`/`DE-` references resolve via `aliases[]` + a generated committed lookup table.
- `bkit telemetry migrate` ports `.md` → `.jsonl`, verifies row-count parity against a transient `.md.bak`, then DELETEs the `.md` ONLY after parity (idempotent); a forced parity-mismatch / absent-`.md.bak` ABORTS with ZERO `.md` deleted.
- The destructive delete is provably unreachable from `bkit upgrade` (mechanical boundary test, KN-8 regression vector closed).

## Acceptance Scenario (scoped to WS-5)

### Narrative _(inherited from design — do not rewrite)_

As a bkit maintainer, I run a workflow (design/plan/build/debug/ship) and at its close it appends machine-readable telemetry rows to `.bkit/*.jsonl` / `docs/*.jsonl` — compliance grades, run outcomes, deterministic attempt/failure counts, friction, deferrals, and discovered bugs — without me writing prose ledgers by hand. At ship, the summary step shows me an aggregate rollup of the whole design→plan→build→debug→ship chain (counts, rates, elapsed times, compliance violations) read straight from those logs. Later, I run a harvest CLI that copies the same telemetry from my consumer repos on this machine and an analysis CLI tells me where compliance is regressing and whether change size predicts PR error rate — all without ever mutating a consumer's files.

### Success Criteria _(inherited from design — do not rewrite)_

5. The data files stay OUT of the manifest (git-tracked runtime content), each has its own explicit scoped `merge=union` line (never a blanket `*.jsonl` glob), is exempt from install/mirror + slop-scan, and is committed at close with `[skip ci]`; legacy `KN-`/`DE-` references resolve via `aliases[]` with no mass retrofit of the ~1,460 existing references.

### Concrete Example _(WS-5 slice)_

**Setup:** A bkit maintainer on the bkit repo itself, post WS-1 ship + WS2-T1 decision recorded, with `dist/` built.

**Steps:**

1. The maintainer runs `bkit telemetry migrate` → it ports `docs/knowledge.md`/`docs/decisions.md` → `docs/{knowledge,decisions}.jsonl` with `aliases[…]`, verifies row-count parity against a transient `.md.bak`, then DELETEs the `.md` (idempotent).
2. A `bkit upgrade` run over a fixture consumer holding `.md` ledgers leaves ALL `.md` byte-identical + mtime-unchanged (only an explicit `bkit telemetry migrate` deletes `.md`, post-parity).

**Outcome:** Migration ported the corpus with every id in an `aliases[]`, the `.md` deleted only post-parity, and the destructive path is unreachable from `bkit upgrade`.

### Edge Cases _(WS-5 slice)_

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| P5 consumer migration deletes `.md` history | Migration ports to `.jsonl`, verifies row-count parity against a transient `.md.bak`, deletes `.md` ONLY after parity confirmed (idempotent); dogfood bkit's repo first + packed-tarball-validate |
| Forced parity mismatch OR absent `.md.bak` during migrate | ABORTS with ZERO `.md` deleted (delete unreachable under partial failure) |
| `bkit upgrade` over a consumer holding `.md` ledgers | ALL `.md` byte-identical + mtime-unchanged; no `upgrade` code path reaches the migrate-delete fn (only explicit `bkit telemetry migrate` deletes `.md`) |
| LLM rewords a knowledge/decision description | Logical key = explicit written-once `key` slug, NOT a free-text hash; a reword does NOT fork the key; recurrence collapses to same identity |

### Derived Test Matrix _(WS-5 portion)_

<!-- prettier-ignore -->
| Test description | Type | Target file |
| --- | --- | --- |
| Migration parses bkit's REAL `knowledge.md`/`decisions.md` corpus → `.jsonl` with `aliases[]`; row-count parity before `.md` delete | Integration **boundary: filesystem + real corpus** (Vitest) | `.bkit/src/bkit-telemetry-migrate.integration.test.ts` |
| Migration validated via packed tarball in a clean consumer dir (`pnpm pack` → fresh install → run) | Integration **boundary: packed tarball install** (Vitest) | `.bkit/src/bkit-telemetry-migrate.integration.test.ts` |
| Migrate destructive-abort safety + idempotency: a forced parity-mismatch fixture ABORTS with ZERO `.md` deleted, an absent-`.md.bak` fixture ABORTS with ZERO `.md` deleted, AND re-running migrate is a no-op (idempotent) | Integration **boundary: filesystem/consumer repo** (Vitest) | `.bkit/src/bkit-telemetry-migrate.integration.test.ts` |
| KN-8 regression guard: `bkit upgrade` over a fixture consumer holding `.md` ledgers leaves ALL `.md` byte-identical + mtime-unchanged AND no `upgrade` code path reaches the migrate-delete fn (only an explicit `bkit telemetry migrate` deletes `.md`, post-parity) | Integration **boundary: filesystem/consumer repo** (Vitest) | `.bkit/src/bkit-telemetry-migrate.integration.test.ts` |
| `.gitattributes` resolves `merge=union` for `docs/knowledge.jsonl`/`docs/decisions.jsonl` (consumer-inherited — INSIDE the managed block) | Integration **boundary: git check-attr** (Vitest/bats) | `.bkit/src/bkit-telemetry-gitattributes.integration.test.ts` (extend) |

## Architecture & Component Changes (WS-5)

**CRITICAL:** All edits land in canonical `.bkit/`, `.agents/`, root config; `.claude/*`/`.cursor/*` mirrors are regenerated by the install engine — NEVER hand-edited. Data files stay OUT of the manifest. ASCII operators only in workflow/prompt files.

#### [NEW] data files

- `docs/knowledge.jsonl` (`kind:"knowledge"`), `docs/decisions.jsonl` (`kind:"decision"`) with their OWN explicit scoped `merge=union` lines + slop exemptions (same surface as WS-1's four files). `KN-N`/`DE-N` preserved only in `aliases[]`.

#### [NEW] `bkit telemetry migrate` CLI (+ integration test) — DESTRUCTIVE per addendum A5

- **Net-new sub-verb parser** (`bkit-cli.ts` lacks one today; uses the WS2-T1-resolved entrypoint/namespace). Code cutover is automatic on upgrade (non-destructive — stops consulting `.md`). The data-migration script ports `KN-`/`DE-` ledgers → `docs/{knowledge,decisions}.jsonl` with `aliases[…]`, verifies row-count parity against a transient `.md.bak`, then **DELETES the `.md`** (idempotent). Emits a generated, committed (git-tracked + exempt) `KN-`/`DE-` → row lookup table so the ~1,460 references resolve auditably. **This SUPERSEDES the design body's "opt-in, dry-run, never deletes".**
- **KN-8 / `611b438` bricking-class guard.** KN-8 (`docs/knowledge.md:195`) records bkit upgrade silently destroying consumer config, recovered only by `git revert`. The destructive `.md` delete MUST be reachable ONLY via an explicit hand-invoked `bkit telemetry migrate`, NEVER from the automatic `bkit upgrade` cutover path; the `.md.bak`/parity-gate is unskippable under partial failure (parity mismatch or absent `.md.bak` aborts BEFORE any delete). This invariant is pinned mechanically by a boundary test (WS5-T2b), NOT asserted in prose only. Both the shipped `KN-CORE-{N}` namespace AND consumer `KN-{N}`/`DE-{N}` namespaces (`knowledge.md:35`) are preserved in `aliases[]`.

#### [MODIFY] `.gitattributes` / `.bkit/templates/.gitattributes` / `slop-scan.config.json` / `.agents/docs.md`

- Add `docs/knowledge.jsonl`/`docs/decisions.jsonl` scoped `merge=union` lines + slop ignores; update docs index. **Placement (Tier-2 discipline):** `docs/knowledge.jsonl`/`docs/decisions.jsonl` are consumer-inherited ledgers (the existing `docs/knowledge.md`/`docs/decisions.md merge=union` lines live INSIDE the managed `bkit:start/end` block today, lines 8–9). Place each `.jsonl` line in the SAME location its `.md` predecessor occupied (inside the managed block of both root `.gitattributes` and `.bkit/templates/.gitattributes`), and retire the corresponding `.md merge=union` line after the WS-5 destructive migration. This DIFFERS from WS-1's four data files (bkit-repo-only, below `bkit:end`) — verify the consumer-facing vs bkit-repo-only distinction at execution time before placing each line.

#### [DELETE] `docs/knowledge.md`, `docs/decisions.md` (parity-gated destructive delete, A5)

- Both `.md` ledgers are DELETED by `bkit telemetry migrate` ONLY after row-count parity is verified against a transient `.md.bak` (WS5-T2); `KN-N`/`DE-N` ids preserved in `aliases[]`. The destructive delete is reachable ONLY via the explicit hand-invoked `bkit telemetry migrate`, NEVER from the automatic `bkit upgrade` cutover path (WS5-T2b pins this mechanically). The `.md` remains recoverable from immutable git history (`git checkout {SHA}~1 -- docs/knowledge.md docs/decisions.md`).

#### Dogfood discipline (A5)

- bkit's own repo migrates first by hand-reviewed CLI run; validate the parser against bkit's REAL `knowledge.md`/`decisions.md` corpus (NOT synthetic fixtures) AND via a packed tarball in a clean consumer dir (`pnpm pack` → fresh install → run; `bkit check` != live migration).

## Supersession Inventory (WS-5 slice)

<!-- prettier-ignore -->
| Existing artifact | Replaced by | Decision | Justification |
| --- | --- | --- | --- |
| `docs/knowledge.md` | `docs/knowledge.jsonl` (`kind:"knowledge"`) | DELETE (WS-5; destructive migration after parity, A5) | Migration MUST run as part of rollout — agents stop reading `.md` once code reads `.jsonl`. `KN-N` preserved in `aliases[]`. |
| `docs/decisions.md` | `docs/decisions.jsonl` (`kind:"decision"`) | DELETE (WS-5; destructive migration after parity, A5) | Same as knowledge; `DE-N` preserved in `aliases[]`. |

## Security & Privacy

- Migration runs locally on bkit's own corpus + a packed-tarball consumer dir; NO secrets/tokens copied. The lookup table carries `KN-`/`DE-` → row mappings only. Consumer-facing advisory text MUST NOT cite `KN-`/`BAR-`/Linear refs (MEMORY rule).
- _Net: no new routes, DB writes, secrets, or untrusted-network input. Primary concern = the destructive `.md` delete must be parity-gated + unreachable from `bkit upgrade`._

## 🚨 Pre-Flight / Dependencies 🚨

### Core (always verify)

- [ ] **Package Management:** Verify `package.json` — no NEW runtime dependency. **Dogfood via packed tarball** (`pnpm pack` → fresh consumer install) to catch runtime-dep mis-classification (MEMORY rule).
- [ ] **Dependency Versions:** Spot-check `node --version` (>=20), `npx tsc --version`, `pnpm --version`.
- [ ] **User Context:** Verify read/write access to `docs/`, `.gitattributes`, `.bkit/templates/.gitattributes`, `slop-scan.config.json`, `.agents/docs.md`, `bkit-cli.ts`.
- [ ] **Pending Blockers:** Query tracker for open `blocker`-labelled issues relevant to the migration.
- [ ] **Project Context:** Read `docs/knowledge.md` + `docs/decisions.md`. **MANDATORY for WS-5:** read **KN-8** (`docs/knowledge.md:195` — bkit upgrade silently destroying consumer config, recovered only by `git revert`) + the `611b438` provenance-stamp-revert bricking class; the WS-5 destructive `.md` delete re-enters this exact pattern and is gated by WS5-T0/WS5-T2b.
- [ ] **Testing & Quality:** Align with `docs/testing.md`. Boundary tests (real corpus, packed tarball, filesystem/consumer-repo, `bkit upgrade` isolation) run against ground truth, NOT mocks.
- [ ] **Prerequisite Plans:** **Sub-plan A (WS-1) MUST be fully shipped+verified to dev BEFORE this sub-plan starts.** Additionally, **WS5-T2 (the migrate CLI) MUST NOT start until the WS2-T1 entrypoint/namespace decision is recorded** (WS-5 may begin its non-CLI tasks once WS-1 ships + WS2-T1 is recorded).

### Conditional

- [ ] **Architecture & UI** — Validate against `docs/architecture.md` + the canonical-source rule. No UI.
- [ ] **Observability** — Migration logs use the `[bkit-telemetry]` grep-able prefix per `docs/observability.md`.

### 🔒 Gate 1: Prerequisites Check

- [ ] **Acceptance Scenario confirmed:** Human confirmed the master `👤 Acceptance Scenario` section (`plan-v3-checked.md`). _(Unchecked → REVISE.)_
- [ ] **Breaking Changes confirmed:** Human confirmed the master `⚠️ Breaking Changes & Naming Review` section. _(Unchecked → REVISE.)_
- [ ] **Gate 1 - Verified:** All Core items checked (incl. WS-1 shipped + WS2-T1 recorded + KN-8 re-read). All applicable Conditional items checked.

## Agent Execution Runbook (WS-5)

> [!IMPORTANT]
> **Continuous Execution:** Work through this runbook autonomously. Do not pause for user permission at any Gate.
> **Blockers:** If a task cannot be completed, DO NOT fail silently — create a tracker `blocker` issue with context before stopping (and append a `kind:"failure"`/`kind:"deferral"` row).
> **Step Isolation:** Complete each task fully (including its verification + checking its box) before the next.

> Every task MUST include a `**Done when:**` line — terse, testable, codebase-verifiable. Tasks crossing an external boundary name the boundary + ground-truth signal in `Done when` (no mocks at boundary).

### WS-5 — knowledge/decisions migration (Requires: WS-1, WS-2 [scoped: WS2-T1 entrypoint/namespace decision])

- [ ] **WS5-T1: New files + exemptions.** Create `docs/knowledge.jsonl`/`docs/decisions.jsonl` + scoped `merge=union` lines + slop ignores + docs index.
  - **Done when:** both files exist; `git check-attr merge` resolves `union` for each; slop does not flag them.
- [ ] **WS5-T0: Re-confirm the KN-8 / `611b438` bricking mechanism before any destructive code.** Re-read KN-8 (`docs/knowledge.md:195` — "bkit upgrade silently overwrote `.cursor/hooks.json`/`.claude/settings.json` ... destroying the consumer's hook block ... Recovered only by `git revert` of the install commit") and the design body's `611b438` provenance-stamp-revert "repo-bricking footgun". The design walked P5 back to opt-in/dry-run/never-deletes for exactly this class; addendum A5 walks it forward to a destructive delete — so the destructive path MUST be provably unreachable from automatic `bkit upgrade`.
  - **Done when:** a durable note in `docs/decisions.md` (then `.jsonl`) cites KN-8's mechanism + `611b438` and records the explicit invariant that the destructive delete is reachable ONLY via an explicit hand-invoked `bkit telemetry migrate`, NEVER from the automatic `bkit upgrade` cutover path; this invariant is the contract WS5-T2 + WS5-T2b enforce.
- [ ] **WS5-T2: Migration CLI (destructive, A5) + lookup table.** Implement `bkit telemetry migrate` (sub-verb parser, using the WS2-T1-resolved entrypoint/namespace); port `.md` → `.jsonl` with `aliases[]`; emit committed `KN-`/`DE-`→row lookup table; parity-verify then DELETE `.md`. **MUST NOT start until WS2-T1 is recorded** (entrypoint isolation matters MOST for this destructive consumer-mutating verb). The `.md.bak`/parity-gate MUST be unskippable under partial failure (a parity mismatch or a missing `.md.bak` aborts BEFORE any delete).
  - **Done when:** running migrate on a fixture corpus produces row-count parity (logged), writes the lookup table, and deletes `.md` ONLY after parity against the transient `.md.bak`; a forced parity-mismatch / absent-`.md.bak` fixture ABORTS with no `.md` deleted (delete is unreachable under partial failure); re-running is a no-op (idempotent).
- [ ] **WS5-T2b: Prove the destructive delete is unreachable from `bkit upgrade` (boundary test).** Pin the design's claim ("code cutover is automatic on upgrade — non-destructive") with a mechanical test, NOT prose, closing the KN-8 regression vector.
  - **Done when (boundary: filesystem/consumer repo):** a test runs `bkit upgrade` over a fixture consumer that has `.md` ledgers and asserts ALL `.md` ledgers are byte-identical + mtime-unchanged afterwards (ground-truth = real filesystem stat, no mock); a complementary assertion confirms ONLY an explicit `bkit telemetry migrate` invocation deletes `.md`, and only post-parity; `Grep`/dispatch-graph confirms no `upgrade` code path reaches the migrate-delete function.
- [ ] **WS5-T3: Real-corpus + packed-tarball validation.** Validate against bkit's REAL `knowledge.md`/`decisions.md` AND a packed tarball in a clean consumer dir.
  - **Done when (boundary: real corpus + packed tarball):** `.bkit/src/bkit-telemetry-migrate.integration.test.ts` runs migrate over bkit's actual `docs/knowledge.md`/`docs/decisions.md` and asserts every id appears in an `aliases[]` across BOTH the shipped `KN-CORE-{N}` namespace AND the consumer `KN-{N}`/`DE-{N}` namespaces (the migration must preserve both — `knowledge.md:35`); a `pnpm pack` → fresh-dir install → migrate run completes without `ERR_MODULE_NOT_FOUND` and ports the consumer's `.md` (ground-truth = real files + real install, no mock).
- [ ] **WS5-T4: Dogfood migrate bkit's own repo.** Hand-reviewed CLI run on bkit; commit the `.jsonl` + lookup table; confirm agents read `.jsonl`.
  - **Done when:** `docs/knowledge.jsonl`/`docs/decisions.jsonl` are populated from bkit's history, `.md` deleted, and `.agents/docs.md` + gotcha-check sites read the `.jsonl`.

### 🔒 Gate 2 (WS-5): Code Implementation Check

- [ ] **Gate 2 (WS-5) - Verified:** Every WS-5 task verified and checked off.

## Testing & Documentation (WS-5 scope)

> [!IMPORTANT]
> **Testing Strategy (See `docs/testing.md`):** bkit-repo tooling — ALL tests are Vitest unit/integration in `.bkit/src/` or bats in `scripts/`. NO Playwright/E2E/Supabase surface. Boundary tests (real corpus, packed tarball, filesystem/consumer repo, `bkit upgrade` isolation) run against ground truth — NO mocks at the boundary.

**Mandatory Tasks (Testing & Documentation):**

- [ ] **Verify test coverage against Derived Test Matrix:** Every WS-5 Derived-Test-Matrix row maps to a checked-off runbook task above.
- [ ] **Update existing tests:** Adjust `bkit-cli.test.ts` (additive `telemetry migrate` sub-verb `it` block), the `.gitattributes` boundary test (extend for `docs/knowledge.jsonl`/`docs/decisions.jsonl`), and any gotcha-check/docs-index tests affected by the `.md`→`.jsonl` cutover.
- [ ] **Write new tests:** `.bkit/src/bkit-telemetry-migrate.integration.test.ts` (all four WS-5 integration scenarios).
- [ ] **Verify observability:** Migration `[bkit-telemetry]` log usage consistent with `docs/observability.md`.
- [ ] **Update documentation:** `docs/decisions.md` (A5 destructive migration; KN-8 bricking-class guard; both-namespace `aliases[]` preservation), `docs/knowledge.md` (migration gotchas — these docs become `.jsonl` post-migration), `docs/architecture.md` (knowledge/decisions ledgers in topology), `docs/testing.md` (packed-tarball migration validation pattern), `.agents/docs.md`.

### 🔒 Gate 3: Testing & Documentation Check

- [ ] **Docs updated:** Every WS-5 `Documentation Updates` row completed. `.agents/docs.md` accurate.
- [ ] **Gate 3 - Verified:** Every checkbox above independently verified.

## Verification Plan (WS-5)

### Automated Tests

- [ ] **Type Check & Lint:** `pnpm typecheck` (`tsc --noEmit`) + `pnpm lint:slop` clean (six data files in `ignores[]` incl. knowledge/decisions `.jsonl`); `pnpm lint:workflows` (actionlint) clean; `pnpm format:check`.
- [ ] **dist parity:** `pnpm check:dist` — `telemetry migrate` sub-verb compiled + committed.
- [ ] **Generated-file drift:** render-parity / catalog-parity tests green for `.claude`/`.cursor` mirrors after regen.
- [ ] **Test Synchronization:** Re-run the full suite; update `bkit-cli.test.ts`/`.gitattributes` boundary test/gotcha-check tests in lockstep.
- [ ] **Run all tests:** `pnpm test` green incl. all WS-5 boundary integration tests (real-corpus, packed-tarball, abort-safety/idempotency, `bkit upgrade` isolation). Fix all failures before Gate 4.

> [!IMPORTANT]
> **No Architectural Downgrades:** On build/compile/test errors, NEVER hot-fix or anti-pattern. The destructive delete MUST stay parity-gated + unreachable from `bkit upgrade`. Halt if stuck.

### 🔒 Gate 4: Automated Verification Confirmed

- [ ] **Gate 4 - Verified:** Every Automated Tests checkbox verified with explicit proof (test output, tarball-install log, `bkit upgrade` mtime/content diffs).

### Manual Verification

> [!WARNING]
> **Dashboard Ban:** Use local CLIs (`gh`, `git`, `jq`, `pnpm`) to verify, not dashboards.

- [ ] **Step 5 (WS-5):** Run `bkit telemetry migrate` on bkit's own repo; confirm row-count parity log, `.md` deleted, every `KN-`/`DE-` id present in an `aliases[]`, and a clean-dir tarball install + migrate completes.
