Verdict: PASS

<!-- verdict:end -->

<!-- Note: Plans live at `docs/plans/{YYYYMM}/{FID}-plan.md` (canonical month bucket). Logs sit at `docs/plans/{YYYYMM}/logs/{FID}/` and are delete-eligible. -->

# Centralise install code, templates & scripts into `.bkit/` — PARENT INDEX (split plan)

> [!CAUTION]
> **CRITICAL:** Do not hallucinate plan execution state.
>
> 1. ALWAYS read the relevant child `160-centralise-install-code-plan-N.md` natively via the `read_file` tool _before_ executing any steps.
> 2. NEVER trust system-generated session summaries or previous conversation history to determine what has been completed.
> 3. Your source of truth is EXCLUSIVELY the literal `[x]` vs `[ ]` checkboxes in the physical child documents. If a box is `[ ]`, it is NOT DONE, regardless of what the conversation context implies.

> [!IMPORTANT]
> **This is a PARENT INDEX, not an executable runbook.** All tasks, `Done when` lines, 🔒 Gates, and human-confirmation checkboxes live in the four child sub-plans (`160-centralise-install-code-plan-1.md` … `160-centralise-install-code-plan-4.md`). Execute the children in dependency order. This file retains only the shared context, the partition map, the dependency graph, and the losslessness/ordering guarantee.

## Context & Goals

Issue #160 centralises bkit's install **machinery** (engine source `.agents/scripts/bkit-*.ts` + install payload `.agents/templates/**`) into a single `.bkit/` root, while bkit's **own dogfooded runtime** (`.agents/` rules/docs/skills/workflows/prompts) stays in `.agents/` so the repo's `.agents/` keeps looking exactly like an installed consumer's. This is a **structural refactor, not a behaviour change**: a consumer who installs OR upgrades across this release must receive byte-identical content.

The work routes every source lookup (~19 inline `path.join(PKG_ROOT, ".agents", "templates", …)` call-sites + a duplicated PKG_ROOT suffix walk) through one resolver seam (`getTemplatesRoot()`), makes the dogfood no-op explicit (`isDogfood()`), then physically relocates the trees. The design decomposed it into 7 workstreams (WS-1..WS-7) tracked as #161–#167; this umbrella plan sequences them in the load-bearing order: WS-1 (guards + seam, pre-move) → WS-2 (baseline) → WS-3 (physical move) → WS-4 (two-axis verify), with WS-5 (doctor observability), WS-6 (prose/docs, merge-gated), WS-7 (rules.md CI gate).

**Success Criteria:**

- Install engine lives under `.bkit/src/`; full install payload under `.bkit/templates/`; `.agents/` retains only bkit runtime (still shipped in the tarball); `dist/` and `bin` unchanged.
- Packed-tarball install AND upgrade into a clean consumer dir produce `.bkit-version` hashes AND a recursive `.agents/` consumer-tree listing byte-identical to the pre-refactor baseline.
- In-repo `bkit install` is a zero-write no-op for `.agents/` (dogfood preserved).

## Binding Decisions (apply across all children)

- **D1 — drop + upgrade auto-clean:** Fresh consumers stop receiving `.agents/templates/`; existing consumers with a stale `.agents/templates/` have it **actively removed** on `bkit upgrade`. Untracked-output change (not part of `canonicalHashes`/`tier3Hashes`), asserted by the recursive `.agents/`-tree axis. (Child 2 implements the upgrade removal; Child 3 asserts it end-to-end; Child 1 captures the stale-consumer baseline that proves it.)
- **D2 — `dist/` stays at root:** `dist/` stays flat at repo root; `bin` stays `./dist/bkit-install.js`; `tsconfig outDir: dist` unchanged; `.bkit-version` schema unchanged (no migration). `.agents/` STAYS in `files[]`.
- **D3 — `rules.md` block-scoped gate:** the WS-7 rules.md byte-equality gate compares the managed `bkit:start`→`bkit:end` block ONLY. The `### bkit Repo Authoring` section (`.agents/rules.md:98`, after `bkit:end`) is bkit-repo-only — never ships, never compared. (Child 4.)

## Merge Method

**Merge method: always squash.** The core move (WS-1→WS-6) MUST land as a single atomic PR — the prose/docs/shipped-config updates (WS-6, Child 4) are merge-gated with the code move (Child 2). WS-2 baseline artifacts and WS-7 may be separate commits within the same PR or a follow-up PR, but the move + docs + verification ship together. No `rebase`/`merge-commit`.

## Sub-Plan Inventory

<!-- prettier-ignore -->
| Sub-plan | File | Sub-issues | Workstreams | Tasks | Gates | Est. tokens |
| --- | --- | --- | --- | --- | --- | --- |
| 1 — Seam + Baseline | [`160-centralise-install-code-plan-1.md`](./160-centralise-install-code-plan-1.md) | #161, #162 | WS-1, WS-2 | 12 (7 + 5) | Gate WS-1, Gate WS-2 | ~70K |
| 2 — Physical Move + Observability | [`160-centralise-install-code-plan-2.md`](./160-centralise-install-code-plan-2.md) | #163, #165 | WS-3, WS-5 | 12 (11 + 1) | Gate WS-3 | ~95K |
| 3 — Two-Axis Verification | [`160-centralise-install-code-plan-3.md`](./160-centralise-install-code-plan-3.md) | #164 | WS-4 | 6 | Gate WS-4 | ~55K |
| 4 — Docs/Prose + rules.md gate | [`160-centralise-install-code-plan-4.md`](./160-centralise-install-code-plan-4.md) | #166, #167 | WS-6, WS-7 | 5 (3 + 2) | Gate WS-6, Gate 2, Gate 3 | ~60K |

**Total WS-T execution tasks across children: 12 + 12 + 6 + 5 = 35** (== umbrella's 35 — lossless).

The human-confirmation checkboxes (Acceptance Scenario + Breaking Changes) and Gate 1 (Prerequisites) live in **Child 1** (the root) and stay `[ ]` for the human reviewer — they gate the entire workstream. Gate 4 (Automated Verification) is folded into Child 2's Gate WS-3 (build/test green) plus Child 3's Gate WS-4 (the two-axis oracle). Gate 2 / Gate 3 (final code + docs checkpoints) live in **Child 4** as the last children to land.

## Dependency Graph

```
Child 1 (WS-1 seam + WS-2 baseline) ── root, no deps
        │
        │ produces: getTemplatesRoot()/isDogfood()/BKIT_SRC_SUBPATH seam (pointing at OLD .agents paths),
        │           fail-loud guard + path-agnostic test, dogfood-noop + getPkgRoot 3-context tests,
        │           baseline artifacts (bkit-version-hashes.json, agents-tree.txt, pack-filelist.txt,
        │           stale-consumer-setup.md) under baseline/
        ▼
Child 2 (WS-3 move + WS-5 doctor) ── requires Child 1 green + committed
        │  (git mv CANNOT run until Child 1's seam is green AND baseline captured —
        │   mid-state self-overwrite hazard)
        │
        │ produces: .bkit/src/ + .bkit/templates/ trees, flipped seam (.bkit forms),
        │           re-pointed config (tsconfig/vitest/package.json), D1 upgrade orphan-removal,
        │           doctor templates-root line, build + tests green post-move
        ├──────────────────────────────┐
        ▼                              ▼
Child 3 (WS-4 verify) ──┐    Child 4 (WS-6 docs + WS-7 gate) ──┐
  requires Child 2      │      requires Child 2 (merge-gated)  │
  AND Child 1 baseline  │      same PR as the move             │
                        ▼                                      ▼
            byte-identical oracle             docs atomic + rules.md gate + decisions entry
            (install AND upgrade axes)         (Gate WS-6, Gate 2, Gate 3)
```

**Load-bearing ordering (do NOT reorder):**

1. **Child 1 before Child 2.** WS-1 seam must be green and WS-2 baseline captured (from a packed tarball, NOT the source tree) BEFORE any `git mv`. Running the move first would self-overwrite the live `.agents/` mid-state and destroy the baseline oracle.
2. **Child 2 before Child 3.** WS-4 verification needs both the WS-2 baseline (from Child 1) AND the completed move + re-points (Child 2). The hash/tree diff is meaningless before the move is done.
3. **Child 2 before Child 4, same PR.** WS-6 docs are merge-gated with the WS-3 move — stale paths would ENOENT setup commands and silently drift consumer `rules.md`. Child 4 edits prose that references the relocated paths, so it must run after the paths exist (Child 2) and ship in the SAME squash PR.
4. **Child 3 and Child 4 both depend on Child 2 but are independent of each other** — they may run in either order after Child 2, but BOTH must complete before merge (Gate WS-4 is the byte-identical quality gate; Gate 2/3 are the final checkpoints).

## Hand-off Artifacts (cross-child contract)

A build agent executing one child reads ONLY the named hand-off artifacts produced by its dependency — it does NOT need to read the other children's full text.

<!-- prettier-ignore -->
| Artifact | Produced by | Consumed by | Purpose |
| --- | --- | --- | --- |
| `bkit-paths.ts` seam: `BKIT_SRC_SUBPATH`, `getTemplatesRoot()`, `isDogfood()` (OLD `.agents` form) | Child 1 (WS1-T1, WS1-T2) | Child 2 (WS3-T2 flips them) | The single resolver seam Child 2 re-points to `.bkit`. |
| Fail-loud guard + path-agnostic test (`bkit-modules.ts`, `bkit-modules.test.ts`) | Child 1 (WS1-T5) | Child 2 (WS3-T2 re-verifies post-flip) | Must still fire for ANY non-existent root after the move. |
| `bkit-paths.test.ts` (getPkgRoot 3-context) + dogfood-noop integration test | Child 1 (WS1-T6, WS1-T7) | Child 2 (WS3-T2 re-verifies post-flip) | Both lands under `.agents/scripts/` pre-move, move with WS3-T1 `git mv`. |
| `baseline/bkit-version-hashes.json` | Child 1 (WS2-T2) | Child 3 (WS4-T1, WS4-T3) | Axis-1 install/upgrade hash oracle. |
| `baseline/agents-tree.txt` | Child 1 (WS2-T3) | Child 3 (WS4-T2, WS4-T4) | Axis-2 recursive `.agents/` tree oracle. |
| `baseline/pack-filelist.txt` | Child 1 (WS2-T4) | Child 3 (WS4-T5) | `npm pack --dry-run` removals-only oracle. |
| `baseline/stale-consumer-setup.md` | Child 1 (WS2-T5) | Child 3 (WS4-T4) | Deterministic stale-consumer construction for D1 orphan-removal upgrade assertion. |
| `.bkit/src/` + `.bkit/templates/` relocated trees, flipped seam, re-pointed config | Child 2 (WS3-T1..T11) | Child 3 (all), Child 4 (WS-6 prose targets) | The completed move all downstream children operate on. |
| D1 upgrade orphan-removal in `bkit upgrade` | Child 2 (WS3-T5) | Child 3 (WS4-T4 asserts orphan gone) | The behaviour Child 3's axis-2 upgrade diff confirms. |
| `.agents/rules.md` managed block + `.bkit/templates/.agents/rules.md` | Child 4 (WS6-T1) | Child 4 (WS7-T1 byte-equality gate) | The two-way sync the CI gate enforces (block-scoped, D3). |

## Byte-Identical Guarantee & Load-Bearing Ordering — preservation across the split

The split preserves the umbrella's central oracle without loss:

- **The baseline is captured once (Child 1) and consumed once (Child 3).** Because Child 1 fully completes (Gate WS-2: artifacts committed, no `git mv` run) before Child 2 starts, the baseline reflects the true pre-move tarball. Child 3 diffs the post-move tarball against those same committed artifacts → the byte-identical guarantee is intact across the child boundary.
- **The move is atomic within Child 2.** WS3-T1 (`git mv`) through WS3-T11 (string/comment re-points) plus Gate WS-3 (build + tests + source-grep green) all live in one child, so no half-moved state can leak into another child.
- **The two axes stay together in Child 3.** Both axis-1 (hash) and axis-2 (recursive tree) for BOTH install and upgrade live in Child 3 under Gate WS-4 — neither axis is orphaned.
- **Merge-gating is encoded in the dependency graph.** Child 4 (docs + shipped `renovate.json5` + rules.md gate) declares `requires Child 2 (merge-gated, same PR)` so the prose ships in lockstep with the move per the umbrella's Merge Method.
- **Flag-parity invariant is carried into both Child 1 and Child 3.** The default (non-`--renovate`) flow rule — baseline (Child 1 WS2-T1) and verify (Child 3 WS4-T1/T3) use identical flags so the WS-6 `renovate.json5` source edit never perturbs the default-flow hashed set — appears verbatim in both children's tasks.

## Out of Scope

- Relocating `dist/` to `.bkit/dist/` (D2 — explicitly out of scope this release).
- Any `.bkit-version` schema migration (keys are destination-relative; nothing changes).
- Auto-registration of installed skills into `.agents/skills.md` (curated manually by design).
- Rewriting historic `KN-*` incident narrative or commit-hashed `Related:` refs in `docs/knowledge.md` (only forward-looking rules text is updated).

## Rollback Strategy

<!-- prettier-ignore -->
| Axis | Action | Notes |
| --- | --- | --- |
| **DB** | N/A | No database. |
| **Code** | `git revert {squash-merge SHA}` | Single squashed PR → one revert restores `.agents/scripts`/`.agents/templates` and all re-points atomically. |
| **Risk window** | None within a release | Consumers only see the new layout after they `pnpm update`; `.bkit-version` schema unchanged. D1 auto-clean is one-directional but harmless on rollback. |
