# Design Brainstorm & Ideas

Lens: Pass-4 reconciliation — the Pass-3 architecture (10-step orchestrator, stack-detect

- skill-install enrichment, conditional-lens keystone, finding-block schema,
  reference-signal down-rank, operator escapes) is APPROVED and OUT OF BOUNDS. "Approaches"
  below are alternative **reconciliation packages** — self-consistent bundles of answers to
  the five tasks in `design-input.md` §1 — not alternative architectures. Deepest coverage is
  on Task 1 (contract relocation) and Task 2 (WS-3 → WS-B/WS-C decomposition ratification),
  per assignment; Tasks 3–5 are covered to full closure since the version target (Task 5) is
  a hard gate.

---

## Evidence base (exhaustive, not sampled)

**Every `.agents/` / `status.json` hit in `docs/plans/202605/80-audit-workflow-design.md`**
(grepped, not recalled): lines 11, 22, 24, 34, 36, 45, 46, 49, 53, 78, 79, 81, 83, 92, 95,
103, 106, 179, 191, 256, 280, 300, 302, 315, 319, 320, 322, 328, 329, 337, 347, 353, 355,
358, 361, 372, 399, 401, 412, 415, 416, 418, 419, 420, 498, 520, 522, 577, 581, 587, 589,
592, 594, 609, 622, 623, 624, 648, 649, 670, 678, 679, 687, 688, 700, 703. Every one of
these is a mechanical `.agents/` → `.bkit/` swap **except** line 280 / 416 / 587 / 589 / 594
/ 687 (the `status.json#steps[5].artifacts` fixed-16-array cluster), which needs a real
decision, not a find-replace — see Task 1 below.

**`.bkit/workflows/bkit-design.md` conventions the orchestrator must mirror** (read in
full, both halves — Steps 1–10):

- FID: `{ISSUE_ID}-{slug}` (github: `^[0-9]+-[a-z0-9-]+$`), asserted at Step 1.
- Lock: `docs/plans/{YYYYMM}/logs/{FID}/.lock`, `set -C` acquire, stale-lock cross-check
  reads the **folded** `status.jsonl` for the lock-owning workflow's last step timestamp
  (`IN_PROGRESS` + idle <30 min → Failure Path; >=30 min → stale, clean).
- `status.jsonl`: append-only NDJSON; write = one `jq -nc '{type:"step-done",...}' >> "$STATUS"` per step; read = `. "$WT/.bkit/scripts/bkit-status-fold.sh"` then `jq -s "$BKIT_STATUS_FOLD"' fold | ...'`. Event types actually used: `workflow-started`, `step-done` (carries `parentSha`, optional `verdict`, `artifacts`), `workflow-done`, `workflow-failed`, `runtime-resolved` (via `bkit_runtime_row`), `close-transport` (via `bkit_close_transport_row`). No `workflow-meta` event appears in the shipped file — Appendix A's comment names it, but the _live_ sibling doesn't use it; audit should follow the live file, not the comment.
- Branch placement: **feat-located** (design/plan pattern) — `$STATUS="$(git rev-parse --show-toplevel)/..."` inside the worktree at every write; Step 1's pre-worktree resume read uses the worktree-or-dev probe (`SRC="$REPO_ROOT/.worktrees/{FID}/$REL"; [ -f "$SRC" ] || SRC="$REPO_ROOT/$REL"`). Close writes `step-done`+`workflow-done` **before** `git add -A && git commit`, so they ride the squash-merge. Appendix A's comment (`issuecomment-4592535780`) already prescribes exactly this for audit — confirmed correct against the live file, not just the comment's say-so.
- `bkit_runtime_detect` / `RUNTIME_WORKTREES` / `RUNTIME_DEVPUSHES` / `RUNTIME_GITHUBCLI`: sourced from `.bkit/scripts/bkit-runtime.sh` at Step 2 and again at Close; `RUNTIME_WORKTREES=false` → adopt current branch in place (refuses to run on `dev` directly); `RUNTIME_DEVPUSHES=true` → local squash-merge with a `.bkit/.dev.lock` critical section; `false` → PR path via `gh pr create`/`merge` with `RUNTIME_GITHUBCLI`-gated MCP fallback.
- Gate blocks: one `### 🔒 Gate N` per step, checklist items, tracker-comment attempt is its own checklist row (best-effort, never gates).
- Tracker-comment cadence: exactly one NEW comment per step via inline `<!-- bkit:tracker {github|linear|true|false} start/end -->` markers (#202 convention) — never edit/paraphrase/summarise prior content.
- Failure Path: append `workflow-failed`, `git rebase --abort`, remove lock + assert removal, tracker comment with `bkit:failed` label, STOP.
- Close-workflow shape: copy highest `design-v*.md` (audit: highest `audit-v*.md`) to the canonical bucket, `close-transport` row via `bkit_close_guard_scan_body` / `bkit_close_guard_cross_check`, worktree removal, final-message hard-stop (design: do NOT invoke `/plan`; audit: do NOT invoke `/bkit-plan` — same posture).

**Drift beyond the two named relocations (found, not assumed):** `.bkit/workflows.md`
lines 782–805 carry a **third, older audit shape** that is inconsistent with _both_ the
Pass-3 design _and_ this reconciliation — a **7-step, Linear-only** orchestrator (no
github/linear/false tri-state, no FID/lock ceremony matching the current model, a 4-line
Step-3 lens fan-out implying ~4 lens groups, a single dedup-only `bkit-audit-synthesise`
with no coverage manifest, Step 5 "Organise" spawning **Linear** sub-issues directly via
`save_issue({parentId})` with no github path, no Step 9/10 split). This is Pass-1-era and
was never updated when Pass 2 → Pass 3 landed. It is **not** covered by either of the two
named relocations (`.agents/`→`.bkit/`, `status.json`→`status.jsonl`) because the problem
isn't stale paths — it's a stale _step count and tracker model_. `.bkit/prompts.md` has no
`bkit-audit-*` rows at all (only the legacy `bkit-utility-audit-*` family), consistent with
greenfield — so this is registry drift, not implementation drift, and it must be replaced
wholesale by A7, not patched line-by-line. Flagging this now because A7 is currently
scoped as "registry & metadata edits" against the _design's_ 10-step shape — without this
note, a builder pattern-matching `.bkit/workflows.md` § `/bkit-audit` — 7 steps as a
starting point would rebuild the wrong workflow.

---

## Approach A — Generalized single-source-of-truth reconciliation, one coordinated minor ⭐ Recommended

**Summary:** Retire the "16-entry" (now would-be "18-entry") literal entirely in favor of
a single canonical lens-slug list with N derived from it; re-cut `## Design Workstreams`
as three pre-chartered peer rows (WS-A #402 / WS-B #403 / WS-C #405) that explicitly opt
out of Step 9's generic auto-issue-creation since the issues already exist; ship A+B+C as
one coordinated `4.11.0`, sequencing the **builds** (A1–A5 → B,C → A6 → A7) while all three
`/bkit-plan` runs target the same version bump.

- **Task 1 resolution.** Keep the _shape_ of the invariant (every fan-out slot — universal
  or conditional — always emits an artifact, even if the body is `# Not Applicable`, so a
  missing slot is unambiguously `crashed`; this is part of the approved keystone and is not
  being redesigned). Retire the _magic number_: define the canonical list once —
  `architecture, hotpath, config, reliability, observability, debt, dead-code, deps,
security, supply-chain, tests, docs-drift, logic-dupe` (13 universal, alphabetised by the
  charter's own table) `+ ui-ux, contract-conformance, derived-data, ai-llm,
reference-signal` (5 conditional) = **18**, inlined once at the Step 6 grep-assert (R1-B1
  pattern already exists in Pass 3 — extend it, don't invent it), and require every
  downstream reader (`bkit-trackers.ts`, `.bkit/scripts/*.ts`, cloud orchestration) to treat
  `steps[N].artifacts` as **`.length`-agnostic**, not just tolerant of the literal `18`. The
  existing Pass-3 Done-When (`grep ... for === 11, === 16, .length === ...`) already half-does
  this; extend its regex to also flag a bare `=== 18` literal, so the _next_ lens-count
  change (WS-D web-product family) doesn't reopen this exact drift a third time. Under the
  NDJSON model, `status.jsonl#steps[5].artifacts` becomes: the fan-out step's `step-done`
  event carries `artifacts: [...]` as a literal JSON array field (same mechanism as
  `bkit-design.md`'s `design-brainstorm-ideate` step, which lists 3 filenames); `steps[5]`
  after fold is positional-by-declaration-order within the workflow, which holds as long as
  the 10-step order is fixed (it is — approved).
- **Task 2 resolution.** `## Design Workstreams` becomes a 3-row table (WS-A / WS-B / WS-C,
  mirroring the sub-plan tables already drafted in #402/#403/#405) with an explicit note:
  _these three issues are pre-chartered by this design and MUST NOT be re-created or
  re-diffed by Step 9's generic `WS-{N}: {NAME}` parse-and-create mechanism_ — Step 9 is
  designed for a design that invents its own workstreams from scratch (the common case);
  here the workstreams already exist with their own established body structure (A1–A7
  sub-plan tables, acceptance criteria, cross-workstream couplings), and running Step 9
  against them would either no-op uselessly (title-match finds them, appends a redundant
  "Workstream Update" comment restating what the issue body already says) or, worse, try to
  encode `blocked-by` edges that fight the hand-authored `**Requires:**` lines already in
  each issue. Document Step 9 as a **no-op-by-design** for this specific design doc (add a
  one-line note under the workstreams table: `Step 9 skipped — WS-A/B/C already exist,
pre-chartered`), not a redesign of Step 9 itself. Also land a **superseded-mapping table**
  (WS-1→A2, WS-2→A3, WS-3→dissolved into B+C, WS-4→A4, WS-5→A5, WS-6→A6, WS-7→A7,
  WS-8→A1) so a reader hitting a dead `#187`–`#193`/`#208` link in an old comment has one
  place to resolve it — this is the _only_ surviving copy of that mapping per the session
  prompt, so it must be unambiguous and complete, not "see #80".
- **Task 5 resolution.** Single coordinated `4.11.0` (next minor past `4.10.0`) for A+B+C.
  A6 (`bkit-audit.md` orchestrator) **Requires: A1–A5, #403, #405** per the existing A1–A7
  table — the orchestrator cannot be integration-tested, let alone dogfooded on bkit's own
  repo (the acceptance-mandated check), without a real lens set to fan out to. Splitting the
  release buys nothing: either A6 waits for B+C regardless of what version label is on it,
  or a ship goes out with a stub-only `/bkit-audit` that can't demonstrate the false-all-clear
  invariant (no conditional lens exists yet to render `N/A`). One version, sequenced build.

**Complexity:** MEDIUM — the generalization work (Step 6 grep-assert regex extension,
downstream-reader audit) is a real but bounded task, already half-built by Pass 3's own
Done-When items.
**Extensibility:** Best of the three — WS-D (web-product family, later) adds N more slugs
to one list; no doc anywhere needs to know the count.
**Risk:** The downstream-reader grep-assert has to be _exhaustive_ (`.bkit/scripts/*.ts`,
`.bkit/cloud/*` if it exists, `bkit-trackers.ts`) — missing one hard-compare site
reintroduces exactly the bug this pass exists to fix, just later.
**Maintenance:** Low once landed — single source of truth, one place to touch per future
lens addition.
**Friction vs ideal:** None identified — this _is_ the pattern the sibling
(`bkit-design.md`) already uses for its own variable-count artifact lists (Step 3's 3-file
list is enumerated, not counted); audit's lens fan-out is just wider.

---

## Approach B — Conservative pinned-count reconciliation, split-minor version

**Summary:** Do the minimum literal find-replace — bump "16" to "18" everywhere it
appears (same magic-number pattern, new number), author `## Design Workstreams` in the
literal `WS-{N}: {NAME}` / `Requires` / `Scope` / `Rationale` block shape so Step 9's
generic parser could in principle run against it, and ship WS-A alone in `4.11.0` with
WS-B/WS-C deferred to `4.12.0`.

- **Task 1:** Hardcode `18` in every place the design doc currently hardcodes `16`
  (`status.json#steps[5].artifacts is a fixed-length 18-entry array`, the R1-B1 canonical
  list, the Step 6 grep-assert count). Smallest diff from the Pass-3 text.
- **Task 2:** Re-author `## Design Workstreams` as `WS-A: Audit engine` / `WS-B: Universal
lens layer` / `WS-C: Conditional lens layer` blocks with `Requires: []` / `Requires:
[WS-A]` / `Requires: [WS-A]` — Step-9-shaped, even though the issues already exist and
  Step 9 will never actually run against this doc (there is no `MILESTONE` label to trigger
  it on a Pass-4 reconciliation run, and #402/#403/#405 are not being re-created).
- **Task 5:** WS-A ships alone first (mechanism only, zero lenses beyond `# Not Applicable`
  stubs for all 18 slots), WS-B/WS-C follow once "2–3 real runs are banked" against a
  live consumer — echoing the _G-workstream's_ stated design-readiness caution (from the
  #80 comment thread) that D/E/F/G should wait for A to ship and run. Applying that same
  caution to B/C here.

**Complexity:** LOW upfront.
**Extensibility:** Poor — bakes in a new magic number (`18`) that will drift again the
moment WS-D's web-product family lands (more slugs, same fixed-count disease); reproduces
the exact failure mode this reconciliation pass exists to close out.
**Risk:** The version split doesn't actually decouple anything. A6's `Requires: A1–A5,
#403, #405` is unconditional — a WS-A-only 4.11.0 release either ships an orchestrator that
can't complete Step 5 for real (every slot is a stub, so the dogfood acceptance criterion
— "conditional lenses render `N/A`, not ran-clean" — is trivially true but meaningless,
since _no_ lens is real) or A6 itself waits for 4.12.0 anyway, in which case "WS-A ships
in 4.11.0" is cosmetic: the orchestrator isn't actually usable until the same point in time
as Approach A's single-minor plan, just with two changelog entries and two `bkit upgrade`
cycles instead of one.
**Maintenance:** Ongoing — every future lens family reopens the "what's the fixed count
now" question; the Step-9-shaped workstream authoring is a permanent duplicate of content
that already lives (and will keep evolving) inside #402/#403/#405's own bodies, so the two
copies will drift from each other exactly the way #80's body drifted from its own comments.
**Friction vs ideal:** Highest of the three — the "readiness caution" this approach borrows
from the G-workstream reasoning is being misapplied: that caution is about designing D/E/F/G
_before_ A's contracts exist and stabilize through real use; B/C are not consumers of A's
contracts waiting to be proven — they _are_ the content A6 fans out to, chartered by the
same design doc, at the same design maturity. Borrowing the caution here manufactures a
gate that doesn't correspond to a real risk.

---

## Approach C — Registry-truth-first reconciliation with staggered pre-release

**Summary:** Treat `.bkit/workflows.md`'s stale 7-step/Linear-only "planned" block as a
peer reconciliation target inside the design doc itself (not a silent A7 build-time fix),
publish an explicit before/after diff table for it in `## Design Workstreams`, and stagger
the version target — an RC-style early tag for A2 (`bkit-audit-stack-detect` +
`audit-stack.md` v2) so the legacy `-logs` false-all-clear deprecation header (currently
blocked on WS-E/#83, not on this design) has _something_ to point at sooner.

- **Task 1 / Task 2:** Same generalization as Approach A, plus a dedicated
  `## Registry Reconciliation` subsection listing the exact stale-vs-current deltas found
  in `.bkit/workflows.md` (7 steps → 10, Linear-only → github/linear/false, dedup-only
  synthesiser → coverage-manifest + correlate, sub-issue-per-workstream via `save_issue`
  directly → Step 9-independent pre-chartered WS-A/B/C) as its own explicit A7 checklist,
  rather than trusting "A7 replaces the registry block" as an implicit consequence of citing
  the current design.
- **Task 5:** A single `4.11.0-rc.0`-style tag after A1–A2 land, final `4.11.0` after A1–A7
  - B + C. bkit has no shipped pre-release-tag mechanism today (`docs/decisions.md` /
    release doctrine — not checked in this pass but not evidenced anywhere in the workflows
    read) — this invents release infrastructure that isn't part of the reconciliation's
    five-task scope, and buys nothing: A7's actual legacy-deletion is explicitly blocked on
    WS-E/#83 landing the replacement log-scan path, not on a version tag existing early.

**Complexity:** MEDIUM (the registry-diff table itself is a good idea and cheap; the
pre-release staggering is not).
**Extensibility:** Same as Approach A on the count/workstream axes; the registry-diff table
adds a nice permanent record but isn't structurally required beyond what Approach A already
gets from the superseded-mapping table.
**Risk:** The RC-tag idea is scope creep on a reconciliation pass that HARD CONSTRAINS
"triggers/scheduling/gates are WS-G, out of scope" — release-cadence mechanics are adjacent
territory to that same out-of-scope boundary and shouldn't be invented here.
**Maintenance:** The registry-diff table, once landed, is a one-time cost (folds into A7);
the RC mechanism, if actually built, would need ongoing upkeep for a benefit this pass
cannot point to (nothing in A1–A7's Requires chain is actually unblocked by an early tag).

**Verdict on Approach C:** the registry-diff-table half is adopted into Approach A's Task 2
scope (see Decisions below); the RC-staggering half is rejected outright — not a legitimate
third path, just a more elaborate version of Approach B's split-minor mistake with the same
"buys no schedule" flaw, plus invented infrastructure.

---

## Decisions

| Decided                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Alternatives considered                                                                                              | Why                                                                                                                                                                                                                                                                                                                                                          |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Task 1 — retire the literal count, generalize to a single canonical 18-slug list, extend the existing Done-When grep-assert to flag any bare numeric-literal comparison against `steps[N].artifacts.length`** (Approach A)                                                                                                                                                                                                                                       | Hardcode `18` in place of `16` (Approach B)                                                                          | The "16" literal is _why_ this reconciliation exists in the first place — a fixed magic number silently went stale twice (relocation + lens-count growth) and sat unnoticed. Generalizing once removes the recurrence for WS-D's future slug additions; hardcoding a new number just resets the clock on the same bug.                                       |
| **Task 1 — `status.jsonl` NDJSON per `bkit-design.md`'s live conventions, feat-located placement, `workflow-meta` event dropped (not used by the live sibling despite Appendix A naming it)**                                                                                                                                                                                                                                                                      | Follow Appendix A's comment literally, including `workflow-meta`                                                     | Pattern-match the _shipped_ file, not a two-month-old comment describing intent — the comment predates `0359884`'s actual landed shape; the live file is ground truth.                                                                                                                                                                                       |
| **Task 2 — `## Design Workstreams` re-cut as 3 pre-chartered peer rows (WS-A #402 / WS-B #403 / WS-C #405) with an explicit "Step 9 skipped — pre-chartered" note and a superseded-mapping table for WS-1..WS-8** (Approach A, + Approach C's registry-diff table folded in)                                                                                                                                                                                       | Author it Step-9-parseable even though unused (Approach B)                                                           | The issues already exist with their own established body structure; a second Step-9-shaped copy inside the design doc would drift from the issues' own evolving content exactly the way #80's body drifted from its comments — the failure this whole reorg was meant to stop.                                                                               |
| **Task 2 (bonus finding, folds into A7 scope) — `.bkit/workflows.md` lines 782–805's stale 7-step/Linear-only "planned" audit block is drift beyond the two named relocations and must be wholesale-replaced, with an explicit before/after diff table landed as part of A7**                                                                                                                                                                                      | Leave it as an implicit consequence of A7 "rewriting the registry block"                                             | Found by grep, not assumed: the block is a _different, older_ shape (7 steps, Linear-only, no coverage manifest, no keystone) — not just stale-pathed. Naming it explicitly prevents a future builder from pattern-matching the wrong starting point.                                                                                                        |
| **Task 3 — fold via the same "charter table + amendment note" pattern the Pass-3/Pass-3.1 comments already used; net inventory 13 universal (B1–B13) + 5 conditional (C1–C5) = 18, every count in the design doc updated to match**                                                                                                                                                                                                                                | None proposed — Appendix A / #403 / #405 already carry the settled spec; this pass's job is folding, not re-deriving | #403 and #405 are explicitly chartered as "the SPEC" in Appendix A's own framing; re-deriving would violate the reconciliation-not-redesign mandate.                                                                                                                                                                                                         |
| **Task 4 — correlation is a distinct POST-dedup pass inside `bkit-audit-synthesise`, keyed on shared normalized store/surface identity across `contract-conformance` + `reliability` + `tests` finding locations, emitting a new synthetic finding class (`class: composition`, e.g. `silent-corruption-candidate`) that cites its 3 source finding IDs and is excluded from the per-lens dedup pool (it's a derived finding, not a duplicate of any single one)** | Correlate inside `bkit-audit-organise` instead                                                                       | Organise's charter is rank/render (matrix, ranked list, down-rank enforcement) — composing three lenses' findings into a new finding is a parse-time join over lens output, the same layer dedup already operates at. Doing it in organise would make organise both a renderer and a finding-author, splitting one concern across two agents' mental models. |
| **Task 5 — single coordinated `4.11.0` for WS-A + WS-B + WS-C; three `/bkit-plan` runs target the same version; build order sequenced A1–A5 → B,C → A6 → A7 per the existing Requires chain, not release-order** (Approach A)                                                                                                                                                                                                                                      | Split minors 4.11.0 (A only) / 4.12.0 (B+C) (Approach B); staggered RC tag (Approach C)                              | A6's `Requires: A1–A5, #403, #405` is unconditional in the already-approved A1–A7 table — a version split doesn't unblock anything on the critical path, it only adds changelog/upgrade-cycle overhead for a distinction (A "done" before B/C) that isn't real: A6 can't be considered shipped-and-dogfoodable without both.                                 |
