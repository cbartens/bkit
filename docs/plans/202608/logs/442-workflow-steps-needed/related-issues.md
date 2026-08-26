## #402 — Audit engine orchestrator conditional-lens keystone pipeline contracts (open)

**Workstream A** of the Recurring Audits milestone. **Tracker + workstream map:** #80.

## Scope — mechanism only, zero lens charter content

This workstream builds the `/bkit-audit` pipeline: the orchestrator, the enrichment steps, the contracts every lens conforms to, and the synthesis/reporting layer. **It does not author lens probe content** — that is WS-B (#403, universal lenses), WS-C (#405, conditional lenses) and WS-D (#207, web-product family).

This is the re-cut of the engine spec that previously lived in #80&#39;s body. #80 is now the milestone tracker.

**Canonical spec:** [`docs/plans/202605/80-audit-workflow-design.md`](https://github.com/cbartens/bkit/blob/dev/docs/plans/202605/80-audit-workflow-design.md) (Pass 3, verdict PASS, merged `f99cf5e`) + the Pass-2 lens charter in [`bar-199-audit-workflow-design.md`](https://github.com/cbartens/bkit/blob/dev/docs/plans/202605/bar-199-audit-workflow-design.md).

**Reference snapshot:** a substantially-built earlier attempt is preserved on `feat/bar-199-audit-workflow` (`581b0e0`) — workflow + 11 lens prompts + 3 pipeline prompts + stack-detect/skill-install. Cherry-pick source, never merged.

## Sub-plans

| Sub-plan | Deliverable                                                                                                                                                                                                                         | Design-doc origin                                                                                               | Requires          |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ----------------- |
| **A1**   | Conditional-lens keystone — `## Applicability` block, `requires:` frontmatter contract, three-state `## Missing Lenses` (`ran` / `N/A — not applicable` / `crashed`), operator escapes (`[lenses=…]`, `[applicability-override=…]`) | WS-8 (#208, deleted)                                                                                            | —                 |
| **A2**   | `bkit-audit-stack-detect` — `audit-stack.md` v2 schema + applicability flags + inverse-evidence guard                                                                                                                               | WS-1 (#187, deleted)                                                                                            | A1                |
| **A3**   | `bkit-audit-install-skills` — skill install/uninstall reusing build/ship machinery, provenance log                                                                                                                                  | WS-2 (#188, deleted)                                                                                            | A2                |
| **A4**   | `bkit-audit-synthesise` — dedup, coverage manifest, parse errors, **plus the dedup→correlate upgrade** (compose contract + reliability + tests findings into one &#34;silent-corruption candidate&#34;)                             | WS-4 (#190, deleted) + [2026-07-06 comment](https://github.com/cbartens/bkit/issues/80#issuecomment-5006018836) | A1                |
| **A5**   | `bkit-audit-organise` + `bkit-audit-summary` — severity×class matrix, ranked list, workstream DAG, reference-signal down-rank grep-assert                                                                                           | WS-5 (#191, deleted)                                                                                            | A4                |
| **A6**   | `bkit-audit.md` orchestrator — 10-step workflow, FID/lock/`status.jsonl`/gates/tracker comments/Failure Path, lens fan-out slots                                                                                                    | WS-6 (#192, deleted)                                                                                            | A1–A5, #403, #405 |
| **A7**   | Registry &amp; metadata — `.bkit/prompts.md` (Models + Audit Phase + tool-set rows), `.bkit/workflows.md`, `.bkit/docs.md` Workflow Matrix, legacy `bkit-utility-audit-*` deprecation headers                                       | WS-7 (#193, deleted)                                                                                            | A1–A6             |

**The design doc&#39;s WS-3 (16 lens prompts) is deliberately NOT here** — it has been extracted into WS-B (#403) and WS-C (#405). Rationale in the [reorg record on #80](https://github.com/cbartens/bkit/issues/80#issuecomment-5113784208): a single &#34;16 lens prompts&#34; workstream is exactly the lump that could not absorb ten post-design charter amendments, which is why they accumulated as comments for two months instead of landing.

## Reconciliation required before `/bkit-plan` (Pass-4)

The design PASSed 2026-05-31 and has drifted. None of this is a redesign — it is contract refresh:

1. **`.agents/` → `.bkit/`** relocation (#204) — every path in the design doc and its workstream sections.
2. **`status.json` → `status.jsonl`** NDJSON + branch-local state placement (#209, shipped in `0359884`). Pattern-match the _current_ `.bkit/workflows/bkit-design.md`, which carries every convention.
3. **Workstream sub-issues #187–#193 and #208 were deleted** (HTTP 410). The design doc&#39;s § Design Workstreams is the only surviving copy — re-cut against the A1–A7 table above.
4. **Lens layer extracted** to #403 / #405 — update the design&#39;s WS-3 accordingly.
5. **Version target** — the body previously said v2.2.0; bkit is now on the 4.x line. Confirm the real target before plan.

## Acceptance

- `.bkit/workflows/bkit-audit.md` exists — 10-step orchestrator, ad-hoc-only, terminal at In Review, full FID/lock/`status.jsonl`/gate/tracker-comment/Failure-Path ceremony.
- Pipeline agents exist and are wired: `bkit-audit-stack-detect`, `bkit-audit-install-skills`, `bkit-audit-synthesise`, `bkit-audit-organise`, `bkit-audit-summary`.
- Conditional-lens keystone present: applicability flags in `audit-stack.md` v2, `requires:` frontmatter honoured, three-state coverage manifest.
- **Dogfood check:** an audit run on bkit&#39;s own repo shows conditional lenses as `N/A — not applicable ({flag}=false)`, NOT &#34;ran clean&#34;. A false all-clear here fails the workstream.
- Reference-signal findings rank strictly below internal-evidence findings — enforced by organise self-verify grep-assert, not prose.
- Output: `docs/audits/{FID}-audit.md` + one tracker sub-issue per workstream cluster.
- `bkit install` regenerates `.claude/` / `.cursor/` / `.opencode/` mirrors at session end.

## Out of scope

Lens probe content (→ #403, #405, #207), runtime/rendered evidence (→ #83), red-team (→ #309), scheduling and auto-dispatch (→ #324). Per-lens fixers — audit is read-only.

**Legacy deletion is blocked:** A7 ships the `bkit-utility-audit-*` deprecation header only. Actually deleting them requires WS-E (#83, sub-plan E1) to land the replacement stack-agnostic log-scan path first — `-logs` / `-logs-ship` are the only shipped audit surface today and one of them is currently emitting a false all-clear.

### Comment 2026-07-29T06:39:48Z

## ▶️ Next step — `/bkit-design` Pass 4 (reconciliation), then `/bkit-plan`

**Status: this is the first workstream to move.** Everything except WS-E&#39;s sub-plan E1 is blocked on it.

### Why a design pass and not straight to plan

The Pass-3 design PASSed and its **architecture is not in question**. But three things have to be settled in the design doc before any plan can consume it:

1. Contracts drifted — `.agents/` → `.bkit/` (#204), `status.json` → `status.jsonl` (#209).
2. The **WS-3 → WS-B/WS-C decomposition split** is an architecture-decomposition change and should be reviewed, not asserted by a comment.
3. **Ten charter amendments** filed after the design PASSed have never been folded into it. The doc says 16 lenses; the thread has grown it to ~18 plus three probe rewrites and a synthesiser dedup→correlate upgrade that changes a load-bearing contract.

Planning against a doc with ten unfolded amendments produces a plan that is wrong on arrival.

### One design, three plans

This pass charters **A + B + C** — B (#403) and C (#405) were extracted from this design&#39;s WS-3, so they must be chartered by the same doc. Three separate `/bkit-plan` runs then consume it. D/E/F/G get their own designs **later**, against the shipped contract rather than the designed one.

### Prompt

```
/bkit-design

#402 — Pass 4: reconcile the /bkit-audit design with two months of drift, and
ratify the lens-layer decomposition split. THIS IS A RECONCILIATION PASS, NOT A
REDESIGN.

APPROVED AND OUT OF BOUNDS — do not re-litigate:
The Pass-3 architecture in docs/plans/202605/80-audit-workflow-design.md carries
verdict PASS. The 10-step orchestrator shape, the stack-detect + skill-install
enrichment model, the conditional-lens keystone (applicability flags + `requires:`
frontmatter + three-state `## Missing Lenses`), the finding-block schema, the
reference-signal down-rank contract, and the operator escape hatches are all
settled. Brainstorm and review MUST NOT propose alternative architectures for
these. Scope your exploration to the five reconciliation tasks below.

READ FIRST:
- docs/plans/202605/80-audit-workflow-design.md (Pass 3, canonical architecture)
- docs/plans/202605/bar-199-audit-workflow-design.md (Pass 2, canonical 11-lens charter)
- Issue #80 body (workstream map) and its two 2026-07-29 comments (reorg record +
  consolidation record) — these carry full idea-to-workstream traceability
- Issues #402 (this, WS-A engine), #403 (WS-B universal lenses), #405 (WS-C
  conditional lenses) — the three issues this design must charter
- .bkit/workflows/bkit-design.md — the closest living sibling; it carries every
  current convention the audit orchestrator must mirror

FIVE RECONCILIATION TASKS:

1. CONTRACT RELOCATION. Every `.agents/` path becomes `.bkit/` (#204). Every
   `status.json` reference becomes `status.jsonl` — append-only NDJSON, folded to
   derive the run array, branch-local placement (#209, shipped in 0359884).
   Pattern-match .bkit/workflows/bkit-design.md, do not invent. Note the design&#39;s
   &#34;status.json#steps[5].artifacts is a fixed-length 16-entry array&#34; statement is
   affected by both the format change and the lens-count change in task 3.

2. RATIFY THE DECOMPOSITION SPLIT. The design&#39;s WS-3 (&#34;16 lens prompts&#34;) is
   dissolved: universal always-on lenses move to WS-B (#403), flag-gated lenses to
   WS-C (#405). WS-A retains mechanism only and owns no probe content. Rationale:
   a single 16-prompt workstream is the lump that could not absorb ten charter
   amendments, which is why they sat as comments for two months. Re-cut the
   design&#39;s `## Design Workstreams` section against #402&#39;s A1-A7 table, and
   charter B and C as peer workstreams. Also note WS-1..WS-8 sub-issues #187-#193
   and #208 were DELETED (HTTP 410) — the design doc is the only surviving copy of
   the decomposition, which is exactly why it must be correct.

3. FOLD THE TEN POST-PASS AMENDMENTS into the lens charter. All are already
   consolidated into #403 and #405 with source links; use those issues as the
   spec and the #80 comments as the rationale. Summary of what changes:
   - tests lens: doctrine-graded tiering against the target repo&#39;s docs/testing.md,
     coverage-% AND coverage-scope, three discrimination probes (mock-collapse,
     status-only assertions, proxy-surface), hollow-boundary probe annotated
     `detected-static-only, runtime-unverified`
   - debt lens: reads docs/deferrals.jsonl + docs/failures.jsonl (fold same-key
     rows, TRIAGED is open work, rank CRITICAL then oldest ts, cross-check against
     tracker and code, read-only); suppression/escape-hatch debt reusing the slop
     rule&#39;s blanket-vs-targeted distinction; leftover cruft
   - dead-code lens: extends to unreferenced config entries and pinned feature flags
   - reliability lens: privilege-aware up-rank of swallowed writes into a
     restricted store
   - observability lens: double-blind failure probe (discarded AND unlogged)
   - security lens: record the stated non-catch (it reads a restrictive grant as
     correct least-privilege)
   - NEW universal lens `logic-dupe`: divergent inline logic duplication, plus
     per-rule CI guard generation as a first-class deliverable
   - data-layer lens SHARPENED into `contract-conformance`: a derivation (build the
     grant matrix, enumerate write sites, resolve client role at each, flag
     role-mismatched writes and unchecked errors into restricted stores), not a scan
   - NEW conditional lens `derived-data`: dual-source consistency for caches,
     denormalized columns and materialized stores
   - ai-llm lens: enrich with the four agentic-audit dimensions (tool/capability
     sandboxing, prompt-as-code integrity, agent-framework supply chain,
     deterministic logging + blast radius + cost caps)
   Net lens inventory: 13 universal + 5 conditional. Update every count in the doc.

4. SYNTHESISER UPGRADE — DEDUP TO CORRELATE. This is the one genuine contract
   change and needs the most design attention. bkit-audit-synthesise currently
   dedups on (class, normalized_location). It must additionally CORRELATE: when
   contract-conformance flags &#34;store S is role-restricted&#34; AND reliability flags
   &#34;swallowed write to S&#34; AND tests flags &#34;S&#39;s critical path is mock-collapsed&#34;,
   co-located, those compose into one red &#34;silent-corruption candidate&#34; finding.
   No single lens produces that write-up — a human composed three. Design the
   correlation rule, its inputs, its output shape, and how it interacts with dedup
   and with the existing coverage manifest.

5. VERSION TARGET. The old scope targeted v2.2.0. bkit is on the 4.x line. Decide
   and record the real target, including whether B and C ship in the same minor as
   A or a follow-up. This is a HARD GATE on /bkit-plan — do not leave it open.

HARD CONSTRAINTS:
- Stack-independence: the shipped surface names no app stack. Lens probes reason
  about stores, privileges, authority and affected surfaces — never a database
  product, UI framework or model provider by name. Stack specifics arrive only via
  audit-stack.md and installed audit-{token} skills. The universality grep-gate
  (zero library-name matches across bkit-audit-lens-*.md) is an acceptance criterion.
- The false-all-clear invariant is load-bearing: a conditional lens on an absent
  surface renders `N/A — not applicable ({flag}=false)`, NEVER &#34;ran clean&#34;. An
  audit run on bkit&#39;s own repo is the dogfood check.
- Audit stays read-only and ad-hoc, terminal at In Review. Triggers, scheduling
  and gates are WS-G (#324) and explicitly out of scope here.
- Any .bkit/workflows/*.md edit follows .agents/rules.md and the workflow
  authoring rules; any .bkit/prompts/*.md edit follows the prompt authoring rules.

EXPLICITLY OUT OF SCOPE (each has its own workstream issue — do not design these):
- Runtime and rendered evidence, log-scan onto debug-fetch → WS-E (#83)
- Web-product lens family (SEO/AIO/IA, analytics, web-perf, DX) → WS-D (#207)
- Red-team / dynamic adversarial testing → WS-F (#309)
- Recurring loop, ship/milestone gates, model-tier-scoped audit → WS-G (#324)

DELIVERABLE: a reconciled canonical design doc that charters WS-A (#402), WS-B
(#403) and WS-C (#405) tightly enough that three independent /bkit-plan runs can
consume it without re-reading this comment thread.
```

### After this design PASSes

Three `/bkit-plan` runs, in this order — serial, since concurrent bkit workflows on one clone collide:

1. `/bkit-plan` #402 — engine (complexity-split will cut A1–A7)
2. `/bkit-plan` #403 — universal lenses (will split; 13 prompts)
3. `/bkit-plan` #405 — conditional lenses

A6 (orchestrator integration) needs #403 and #405 built, so sequence the _builds_ accordingly even though the plans can be written up front.

### Comment 2026-07-29T06:49:15Z

## Design Workflow

### Step 1 — Start Workflow

[cbartens/bkit/tree/dev](https://github.com/cbartens/bkit/tree/dev)

### Comment 2026-07-29T06:53:24Z

### Step 2 — Worktree Setup

[cbartens/bkit/tree/dev](https://github.com/cbartens/bkit/tree/dev)
[docs/plans/202607/logs/402-audit-engine-orchestrator/status.jsonl](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/402-audit-engine-orchestrator/status.jsonl)

### Comment 2026-07-29T07:03:49Z

### Step 3 — Brainstorm &amp; Ideate

Three parallel agents, distinct lenses: correlation contract (task 4) · contract relocation + decomposition + version (tasks 1/2/5) · lens-charter amendments (task 3).

**Convergent — both version-relevant agents independently recommend `4.11.0` with A+B+C in one minor.** Rationale is the same from both: A6&#39;s acceptance (dogfood run showing conditional lenses as `N/A`) is unmeetable if Step 5 fans out to 18 prompts that do not exist — A alone would produce 18 `crashed` rows, not a clean dogfood.

**Defects found in the working tree that the reconciliation must absorb:**

- **The `.agents/` → `.bkit/` relocation is selective, not a blanket sed.** `.agents/config.md`, `docs.md`, `rules.md`, `skills.md` still exist, and **`.bkit/docs.md` does not**. Two agents caught this independently. It is cited by #402&#39;s A7 row _and_ by #403&#39;s B12 row — and B12 is a probe target inside a lens charter, so the bad path would ship into a prompt. (Verified against the tree; my own design-input note had the same error and has been corrected.)
- **A third, stale `/bkit-audit` spec is live in `.bkit/workflows.md`** — Pass-1-era, 7-step, Linear-only, parsing findings by `^## \[(\w+)\]\[(\w+)\]` heading regex rather than the YAML fence. It contradicts the approved Pass-3 design on step count, tracker model and parse contract. A7 must replace it wholesale, not patch it.
- **`WS-K` is a dangling reference** — cited eight times in the Pass-3 doc (lines 18, 79, 97, 323, 666, 677, 682, 701) as the home of several plan-time grep-asserts, but the workstream sections run WS-1..WS-8 and no `WS-K` section exists. Those obligations are currently unowned.
- **`supply-chain` `requires:` conflict** — Pass 3 says `requires: hasCi`; #403 lists it among 13 lenses each `requires: always`. Consequence flagged: resolving it to `always` orphans `hasCi` (zero consumers), which is precisely the dead-config class B7&#39;s own new amendment probes for.
- **`derived-data` has no flag named** — #405 says &#34;`hasCache` / derived-store flag&#34;, undecided. `/bkit-plan` on #405 is blocked until this design names it.
- **Two #403 amendments are unsatisfiable as written**, both carrying live acceptance criteria: `debt`&#39;s &#34;cross-check each row against the tracker&#34; (lens tools are `Read, Grep, Glob, Write` — no MCP, no Bash, no network; also `isOpenWork()` does not exist in `.bkit/src/**`), and `logic-dupe`&#39;s copy-pasteable CI guard (`direction:` is single-line ≤200 chars, and fenced blocks are forbidden inside finding fields).

**On task 4, the substantive result:** the three correlation legs are structurally _non_-co-located — grant declaration, product-code write site, and test file, in three different classes. The shipped dedup key `(class, normalized_location)` provably cannot express that join, so correlation needs a join dimension that is not location. Both agents that looked at it converged on an additive-optional `subject:` field carrying store identity, which means the WS-B and WS-C lens charters must each emit it — a real cross-workstream contract obligation, not an A4-local change.

Two further false-all-clear vectors surfaced, one layer up from the keystone: a correlation that cannot fire because a contributing lens was `N/A`/`crashed`/cap-evicted currently reads as &#34;no silent-corruption candidates&#34;; and the `tests` hollow-boundary marker must not be expressed as `confidence: low`, or it trips the reference-signal down-rank fence and bars genuine boundary gaps from the top row.

Artifacts: [1](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/402-audit-engine-orchestrator/design-brainstorm-ideate-1.md) · [2](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/402-audit-engine-orchestrator/design-brainstorm-ideate-2.md) · [3](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/402-audit-engine-orchestrator/design-brainstorm-ideate-3.md)

### Comment 2026-07-29T07:20:36Z

### Step 4 — Generate Design

[design-v1-draft.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/402-audit-engine-orchestrator/design-v1-draft.md)

799 lines. All five reconciliation tasks close; every defect from Step 3 carries a decision with a named owner sub-plan rather than a restatement.

Highlights worth review attention:

- **Relocation caught more drift than the two named items** — beyond `.agents/`→`.bkit/` and `status.json`→`status.jsonl`, the sweep found `docs/knowledge.md`→`.jsonl`, `docs/decisions.md`→`.jsonl`, `docs/pending.md`→`docs/deferrals.jsonl`, `.agents/scripts/*.ts`→`.bkit/src/*.ts`, and a stale `claude-opus-4-7` model pin. `.agents/{config,docs,rules,skills}.md` explicitly stay put.
- **The fixed 16-entry artifacts array is retired, not renumbered** — count derives from the canonical enum, and the Done-When regex is widened to flag a bare `=== 18` so WS-D (#207) cannot silently reopen the same hardcoding.
- **`WS-K`&#39;s orphaned grep-asserts land in A7**, promoted from plan-time ritual to a shipped parity test. That is a recorded amendment to the Pass-3 out-of-scope boundary, not a silent widening.
- **`supply-chain` resolved to `requires: always` with `hasCi` deleted outright** (CI signal survives in `## Stack ci:`) plus a bidirectional flag gate — so the fix does not itself create the orphaned-flag defect it was closing.
- **`hasDerivedStore` named**, with detection heuristics and an inverse-evidence rule. That unblocks `/bkit-plan` on #405.
- **Correlation:** `subject:`/`signal:` are the only lens-side changes; two-tier subject resolution via `## Subject Aliases`; correlate strictly after dedup; composition is additive into a matrix-excluded `## Correlated Findings` with legs retained; required vs amplifier legs; a mandatory `## Correlation Coverage` manifest whose `unevaluable` row closes the second-order false all-clear.
- **Version: `4.11.0`, A+B+C in one minor.**
- Two #403 acceptance criteria are amended rather than accepted as written: `debt`&#39;s tracker cross-check narrows to `references[]`-vs-code with tracker reconciliation deferred to WS-G, and `logic-dupe`&#39;s guards move to a `## Suggested Guards` section with a `guard-ref:` pointer. Both were unsatisfiable under the lens tool-set.
- `ai-llm`&#39;s dogfood expectation is corrected to `N/A — not applicable (hasLLM=true but no surface evidence)`, with an explicit instruction not to weaken the detection heuristic to force the old expectation.

Three out-of-scope items appended to `docs/deferrals.jsonl` (all LOW): a second correlation rule for derived-divergence, a subclass axis for the severity×class matrix at 18 lenses, and the `audit-{token}` skill seed-set authoring.

### Comment 2026-07-29T07:31:18Z

### Step 5 — Design Review - Verdict: CONCERNS

Both reviewers returned CONCERNS (worst-of-two = CONCERNS). Ten CRITICAL findings between them, all local corrections inside sections this pass already owns — none proposes an alternative architecture, so the approved Pass-3 shape holds.

**Review 1 — buildability** (verified against the tree, not the doc&#39;s assertions). Confirms the reconciliation is substantially correct: the selective `.agents/`→`.bkit/` call is right path-by-path, the `status.jsonl` pattern-match is faithful (`workflow-meta` genuinely is design-absent — only `bkit-debug.md` emits it), the lens arithmetic reconciles, `hasCi` leaves no dangling consumer, and the version decision is closed. Its six CRITICALs:

1. **`supply-chain` cannot write its own artifact** — the draft has it swap `Write` for allowlisted `Bash`. Now that it is `requires: always`, that is a `crashed` row on every run, including the dogfood. Inherited from Pass 3 and restated rather than closed.
2. **Synthesiser tool set never stated** — the draft pins an awk state machine for parsing, but the stated skeleton ships `Read, Grep, Glob, Write, Edit` with no `Bash`. A4 names no tool set at all.
3. **A7&#39;s `Requires: A1–A6` makes a shipped test red for three plan runs** — `bkit-catalog-parity.test.ts` asserts every `.bkit/prompts/*.md` appears in `.bkit/prompts.md`, and the build order lands 22 prompts before A7 touches the registry.
4. **A false claim about the shipped tree** — the draft says `.bkit/workflows.md`&#39;s branch-placement table groups `audit` with `cloud`. It has no `audit` row at all; the obligation is additive, not corrective.
5. **Tally miscount drops an amendment** — &#34;7 unchanged · 7 amended&#34; against a table whose own Status column gives 6 and 8. The hidden eighth is `ai-llm`, and WS-C&#39;s acceptance carries no criterion for it, so one of the ten amendments would ship with no acceptance criterion anywhere.
6. **A dogfood assert depends on an unspecified format string** — the doc is split 3–3 between literal `flag=true…` and substituted `{flag}=true…`, and the dogfood row asserts the substituted form. Silent, because the Step-6 assert is prefix-matched.

**Review 2 — operability**, attacking the false-all-clear invariant. Its four CRITICALs:

1. **Manifest propagation gap** — Step 6 produces `## Missing Lenses` and `## Correlation Coverage`, but Step 7&#39;s owned-sections list never carries either forward into the ranked artifact that Step 10 publishes. As written, the headline safety mechanism may only ever exist in an intermediate artifact nobody reads.
2. **Signal-token contract has no on-disk enforcement leg** — the signal-enum parity check compares WS-A&#39;s own copy against WS-A&#39;s own copy. A spelling drift in a WS-B or WS-C lens&#39;s `signal:` token would never be caught; the correlation would simply never fire and read as a clean `no match` → PASS.
3. **Cap eviction is invisible to the correlator** — the 5-slot reserve is explicitly not a hard guarantee, so a lens can report a subject &#34;absent&#34; when its correlation-eligible finding was merely evicted, degrading a genuine silent-corruption candidate to PASS instead of the mandatory `unevaluable`.
4. **The override escape hatch is textually indistinguishable from genuine absence** — `[applicability-override=hasDb=false]` on a repo that genuinely has the surface renders the same string as auto-detected absence.

Findings 2 and 3 are the same shape as the bug the whole milestone exists to catch: a check that cannot detect its own failure to look. Proceeding to Step 6 to apply.

### Comment 2026-07-29T07:50:48Z

### Step 6 — Apply Review - Verdict: PASS

[design-v2-reviewed.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/402-audit-engine-orchestrator/design-v2-reviewed.md)

1000 lines. All ten CRITICALs closed and all fourteen OPTIONALs applied (one in spirit); none rejected, none deferred, so `docs/deferrals.jsonl` gains no further rows. A disposition table covers every finding from both reviews with a pointer to the section now carrying it.

The two findings that mattered most — review 2&#39;s signal-token and cap-eviction gaps, both instances of &#34;a check that cannot detect its own failure to look&#34; — got enforcement legs rather than clauses:

- **Signal tokens** now have an on-disk leg via a `signals:` frontmatter key, so A7&#39;s parity assertion reaches the shipped WS-B/WS-C lens files instead of comparing two WS-A-authored copies. The residual asymmetry (slug contract machine-enforced end-to-end, signal contract partly self-graded) is named explicitly rather than left implicit.
- **Cap eviction** now resolves to `unevaluable (… leg evicted at cap)` ⇒ CONCERNS, never `absent` ⇒ `no match` ⇒ PASS, with a conservative fallback so a non-compliant lens degrades to honest silence rather than a false all-clear. The 5-slot reserve is restated as a bound, not a guarantee.

Three fixes interlocked instead of stacking: the `{flag}` substitution inconsistency, the override-indistinguishability defect and universal-lens scope-blindness all collapsed into one **reason-string contract** — five reason shapes under the existing token prefix, no new state token and no fourth manifest state.

Two claims were **retracted rather than restated**. The v1 assertion that `.bkit/workflows.md`&#39;s branch-placement table groups `audit` with `cloud` was false on two counts — there is no `audit` row to correct, and `cloud` is stateless rather than dev-located. The retraction is explicit so a builder does not hunt for the row and invent an edit to justify the instruction.

Worth carrying into the plan runs: the `7 unchanged · 7 amended` miscount was not cosmetic. The total only survived by cancellation, and the hidden eighth amendment was `ai-llm` — which, because WS-B&#39;s fixture criterion is scoped to its own seven, would have shipped with no acceptance criterion in either workstream. WS-C now carries a per-dimension `ai-llm` criterion plus an off-dogfood validation requirement, since bkit&#39;s own repo can only ever exercise that lens&#39;s no-surface-evidence branch.

One item deliberately held for Step 7: the doc carries four Unicode `≥` operators in text destined for workflow and prompt bodies. All 54 shipped `.bkit/workflows/*.md` and `.bkit/prompts/*.md` files are Unicode-operator-free, so these would violate the authoring convention if copied verbatim.

### Comment 2026-07-29T08:00:55Z

### Step 7 — Design Organise - Verdict: PASS

[design-v3-organised.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/402-audit-engine-orchestrator/design-v3-organised.md)

1157 lines. v2&#39;s body preserved verbatim — the agent diffed v3 against v2 and confirmed the only deltas are the intended fixes.

**Decomposition**, chartered against the surviving issues rather than the deleted numbering: `WS-A (#402)` `Requires: []` · `WS-B (#403)` and `WS-C (#405)` each `Requires: [WS-A]`. No `WS-1`…`WS-8` ids emitted anywhere — that numbering died with sub-issues #187–#193 and #208 (HTTP 410) and re-using it would collide with the live charter. A1–A7 appear only as WS-A&#39;s internal sub-plan table.

One structural point the plan runs need: A6 and A7 require WS-B and WS-C **built**, while the peers require only A1 + A2. That interleave cannot be expressed in a workstream-level `Requires` field without creating a cycle, so it is modelled at sub-plan granularity — the declared graph is acyclic — and called out explicitly so no plan run re-widens `Requires: A1 + A2` back to `Requires: #402`. Build order: `A1 → A2, A3, A4, A5 → WS-B, WS-C → A6 → A7`.

**Cross-workstream contract made independently consumable.** A new X1–X4 contract table opens the workstreams section, and each obligation is then _restated inside the owning charter_ — so a plan agent reading only its own section still ships something that composes. The two that matter: WS-B/WS-C must emit `subject:`, `signal:` and the `signals:` frontmatter key (fixture-asserted), and the `reliability` privilege up-rank is brokered by A4 off WS-C&#39;s grant matrix rather than self-assessed.

**Counts recounted programmatically** from the inventory table&#39;s own Owner/Status columns: 18 rows = 13 `B*` + 5 `C*`; 6 unchanged · 8 amended · 1 reclassified · 1 renamed+rewritten · 2 new. Every surviving `7 unchanged` / `16 lenses` / `11 universal` string sits in explicitly corrective or historical context. Given the earlier tally error hid an entire amendment, this was verified rather than trusted.

**Two glyph fixes, one of which corrected me.** The four Unicode `≥` are now ASCII `&gt;=`. Separately, the agent challenged my claim that `⇒` already appears in shipped files — it does not: a census of all 54 `.bkit/workflows/*.md` + `.bkit/prompts/*.md` returns zero `⇒` against 1422 `→`. I verified that independently and had it normalised: 55 `⇒` → `→`, confirmed byte-identical to the pre-edit file modulo the glyph. The affected text is precisely the state-mapping and reason-string material destined for prompt bodies (`unobserved → unevaluable (… leg evicted at cap) → CONCERNS`, `absent → no match → PASS`), so leaving it would have made these the first shipped files to introduce a new glyph — and pushed a trivial fix onto three independent plan runs, which is the exact failure mode this pass exists to correct.

All nine open questions now have a named owner or an explicit out-of-bounds verdict; WS-D (#207), WS-E (#83), WS-F (#309) and WS-G (#324) are restated as hard boundaries.

### Comment 2026-07-29T08:07:07Z

### Step 8 — Summary - Verdict: PASS

[design-summary.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/402-audit-engine-orchestrator/design-summary.md)

# Design Summary

## Overview

This is Pass 4 (reconciliation) of the `/bkit-audit` engine design, chartering three peer workstreams (WS-A #402, WS-B #403, WS-C #405) for three independent `/bkit-plan` runs. The design carries forward the Pass-3 architecture (10-step orchestrator, stack-detect + skill-install enrichment, conditional-lens keystone, YAML finding schema, reference-signal down-rank, operator escapes) unchanged and reconciles five post-PASS drifts: contract paths and state format (Task 1: `.agents/` → `.bkit/`, `status.json` → `status.jsonl`); workstream decomposition (Task 2: WS-1..WS-8 → A1..A7 + WS-B + WS-C); lens charter (Task 3: 11 universal + 5 conditional → 13 universal + 5 conditional = 18 total, absorbing 10 post-design amendments); synthesiser upgrade (Task 4: dedup → **correlate**, adding the silent-corruption-candidate rule); version target (Task 5: `4.11.0` with A+B+C in one minor).

The design is self-contained: the three plan runs do not read each other or the issue thread. WS-A (#402) owns the contract declaration and the orchestrator; WS-B (#403) owns 13 always-on lenses; WS-C (#405) owns 5 flag-gated lenses. The cross-workstream contract is restated inside each charter (X1–X4 handshakes). WS-B and WS-C require only A1 + A2 from WS-A; the A6/A7 interleave awaits both peers, resolving the issue-level cycle into a sub-plan DAG.

## Design Quality

The design is thorough and mechanically rigorous. Every amendment has an executable landing site (subject:, signal:, evidence:, ## Suggested Guards, narrowed debt clause). The false-all-clear invariant — the design&#39;s load-bearing property — is enforced at three separate points: organise self-verify (refuses verdict if manifests missing), Step-7 orchestrator gate, and Step-10 post-copy assert on the published file. Reason-string contract is pinned to substituted form only, guarded by a dedicated parity assertion to catch literal-`flag=` drift. Signal-enum parity is now three-way (workflow enum ↔ synthesiser enum ↔ on-disk `signals:` frontmatter) and bidirectional (every canonical token declared by &gt;=1 lens; every declared token in canonical enum).

The specification is dense and precise. Every count in the document derives from a single 18-row inventory table; all four-way slug parity assertions and eight parity assertions (on the shipped test) are named in the review disposition. The design explicitly identifies which edge cases are addressed (manifests carried verbatim through three steps, cap eviction tracked by subject/signal pairs resolving to `unevaluable`, override-caused visibility via `## Run Scope`&#39;s `complete:` boolean) and which are residual (hasDb=false false-negative is silent by construction; a lens emitting wrong subject produces wrong join not no join; reference-signal non-reproducible; universality gate is denylist).

Weaknesses: complexity is high — 10 tasks, 23 subagents, 18 lenses, 5 manifest sections, 8 parity assertions. Tool-surface heterogeneity persists (supply-chain Bash allowlist, reference-signal WebSearch); described as &#34;discipline, not sandbox.&#34; Cost trajectory keeps climbing (5× design triplet at 18 Opus lenses); Sonnet downgrade lever documented but frozen NO. One correlation rule ships, not two (derived-divergence-candidate deferred).

## Acceptance Scenario

The scenario narrative is concrete: run `/bkit-audit` ad-hoc, get one ranked report at `docs/audits/{FID}-audit.md` plus tracker sub-issues, no code touched. Every lens names itself and its reason (`N/A — not applicable (hasDb=false)`, never silent); truncated/crashed lenses say so. Three separate lenses seeing one problem compose into one red silent-corruption-candidate at top. Success criteria span 6 points: 10-step orchestrator, 18 slots, coverage honest (every slot exactly one state token), correlation fires with coverage manifest, ranking discipline holds (ref-signal and low-confidence below), manifests reach published report. Key edge cases cover all five false-all-clear failure modes (flag false, flag true no surface, universal lens empty scope, override indistinguishability, correlation leg never ran, cap eviction indistinguishability, signal typo). Dogfood acceptance specifies manifest rows read from published file, not ranked list. The scenario adheres to template § Acceptance Scenario (concrete narrative, success criteria with testable assertions, edge cases with mitigations identified).

## Breaking Changes

None at the language-contract level. Operator API additions: `[applicability-override=flag=bool]`, `--with-websearch` (both in Step 2 already). Skill machinery call site change (prune entry point added to A3). Event schema addition (Step 5 `step-done` carries variable-length `artifacts` array, not fixed 16; seven event types instead of six, adding `transport-fallback` which is Close-gating). Registry surface: `.bkit/prompts.md` § Audit Phase new, § Tool set patterns four sub-rows new, § Frontmatter Conventions updated, `/bkit-audit` section wholesale replaced. Legacy `.bkit/workflows.md` stale 7-step block eliminated. `.agents/docs.md` Audit column updated. No breaking changes to data model; all additions are additive-optional (subject:, signal:, evidence:, guard-ref: fields; signals: and requires: frontmatter).

## Feasibility

Both Step-5 and Step-6 reviews returned CONCERNS with ten CRITICAL findings. All ten are APPLIED (none deferred, none rejected). Review 1 (buildability): supply-chain tool-set resolved to additive Bash, synthesiser tool set stated explicitly with Pass-3 lens-allowlist argument distinguished, models rows landing per sub-plan instead of batched, branch-placement additive claim corrected, lens tally corrected exposing hidden 8th amendment, reason-string contract pinned to substituted form, `transport-fallback` event added, `--git-common-dir` scope narrowed, `docs/audits/` mkdir added, hollow-boundary confidence:medium clause added, issue-level requires cycle narrowed, universality denylist extended, canonicalHashes regen added, `legs:` length policy pinned. Review 2 (operability): manifest propagation contract with three enforcement points, `signals:` frontmatter for three-way enum parity, per-eviction (subject, signal) records for cap-eviction leg-state resolution, `## Run Scope` with complete:boolean and (operator override) reason modifier, universal lens sanity-probe-before-emit extended via Reviewed:N=0 rule, Failure Path skill cleanup clarified, ai-llm off-dogfood validation added, debt three-way cap split with per-group truncation. One PoC recommendation applied in spirit (one-lens vertical slice as A4&#39;s first task). No findings rejected or deferred to future cycles.

The design is implementable. No specification gap remains open (all edge cases either addressed or explicitly noted as residual with mitigation). WS-A&#39;s A1–A7 form a connected sub-DAG inside one plan run; WS-B and WS-C fork from the same two sub-plans (A1+A2) narrowing true dependency. Build order is clear: A1→A2,A3,A4,A5→WS-B,WS-C→A6→A7.

## Synthesis Coverage

Not a brainstorm-synthesis design; this is a reconciliation pass. The design explicitly states that &#34;the Pass-3 architecture carries verdict PASS and is not re-litigated here&#34; and lists what does not change (10-step shape, stack-detect+skill-install model, keystone structure, finding schema, reference-signal down-rank, operator escapes). Synthesis is addressed in one sentence per task: ten post-PASS charter amendments are folded in below the named sections. Every amendment&#39;s rationale is traceable (either to #80 comment thread or to #403/#405 bodies; the 7 dead comment IDs are not to be cited). The Pass-3 decisions carried forward are not re-argued; focus is narrowly on the five drift items.

## Scope Alignment

The design explicitly bounds scope. In-scope: WS-A (contract + orchestrator + five pipeline agents + registry), WS-B (13 always-on lenses), WS-C (5 flag-gated lenses). Out-of-scope (each with own issue): WS-E #83 (runtime/log evidence), WS-D #207 (web-product lens family), WS-F #309 (red-team), WS-G #324 (triggers/automation). Audit stays read-only, ad-hoc, terminal at In Review. The design does not build anything (design-only mandate). The version target `4.11.0` is closed (no hedging). Three peer-issue amendments are identified as superseding the filed issue lines (ai-llm dogfood, debt tracker-cross-check narrow, both Requires narrow). No creep beyond the five Task boundaries is present.

## Risks

**Real, addressed, explicit:**

- `hasDerivedStore` is weakest flag (hardest to detect, false-negative exposed); inverse-evidence guard carries weight. Plan should seed positive and negative fixtures.
- 25-finding cap can still bite (5-slot reserve bounds but doesn&#39;t eliminate); residual now visible via per-eviction (subject, signal) records and truncation state.
- Lens that forgets subject:/signal: makes correlation silently never fire; mitigated by unevaluable(no subject match)→CONCERNS and fixture asserts in WS-B/WS-C acceptance, but residual remains (wrong subject produces wrong join not no join).
- Signal-enum typo was the exact false-all-clear shape the design exists to catch, reintroduced at lens level; now caught by three-way parity assertion + fixture criteria.
- Universality gate is denylist, cannot catch library names it has never heard of; token set extended in same edit adding new lenses.
- Conformance-vs-reliability privilege-aware up-rank requires correct subject on both legs; a missing or wrong-subject reliability finding degrades silent-corruption-candidate to silence (mitigated by coupling-1 document and fixture asserts).
- Author-leaves / bus factor: ten amendments rationale in 50-comment thread with 7 cited IDs now 404; **this document is the only surviving copy**. Three &#34;why&#34; items explicitly decided to resist deletion.
- Tool-surface heterogeneity (Bash allowlist on supply-chain, WebSearch on reference-signal) is permanent and discipline-based, not sandboxed; documented in prompt body.
- Cost keeps climbing (5× design triplet); Sonnet downgrade re-affirmed as future lever, frozen NO.
- Concurrency not supported on same clone; concurrent bkit workflows collide on shared dev / working tree / .git/config — use separate clones.

**Open, assigned, tracked:**

- Which hasDerivedStore heuristics actually fire on consumer repos (WS-C, fixture both directions, expect one revision after contact).
- Sub-class axis for matrix at 18 lenses (out of scope, flagged for WS-D).
- Skill authoring audit-{token} (separate follow-up, Step 4 mostly no-ops).
- Who owns scheduling WS-G vs #260 (product decision, settled before WS-G design, not here).
- One-lens vertical slice de-risking (A4 first task, not separate workstream).
- Derived-divergence-candidate second rule (deferred, recorded in deferrals.jsonl).

## Action Items

None. All ten CRITICAL findings from both reviews are APPLIED. No deferred items. The design is ready to proceed. Three amendments to peer issue bodies are superseded by this document (dogfood, debt narrow, Requires narrow), but those can be applied during plan phase or the plans can simply cite this doc as ground truth.

Procedural note (advisory): the three `/bkit-plan` runs must be serial (shared clone constraint). Build order: A1→A2,A3,A4,A5→WS-B,WS-C→A6→A7. Model rows land per sub-plan (not batched), keeping bkit-catalog-parity.test.ts green at every point. WS-B and WS-C require only A1+A2 (narrowed dependency). A4&#39;s first task should be the one-lens vertical slice (subject normalisation + alias resolution + rule table + leg-state assignment, hand-written fixtures, single run through synthesiser). No human confirmation gate is open; this design is the ground truth for all three plan runs.

## Outstanding Questions

- **Q: Which of derived-data&#39;s heuristics actually fire on real consumer repos?** — **Recommended:** Expect the flag to need one revision after first contact with real repos. The plan should seed both a positive (has derived store + recompute path) and a negative (no derived store) fixture in WS-C acceptance.

- **Q: Do we need a sub-class axis for the matrix at 18 lenses?** — **Recommended:** Defer this to WS-D (#207), which makes the problem worse. The per-class appendix is the escape valve in 4.11.0.

- **Q: Should installs be constrained beyond the 10-skill cap?** — **Recommended:** Unchanged from Pass 2. Default is build-agent parity. Revisit if Step 4 audit-{token} skills become a material registry item.

- **Q: Who owns scheduling — WS-G (#324) or #260?** — **Recommended:** This is a product decision, not design-time. Settle before WS-G&#39;s plan phase; audit stays ad-hoc and terminal at In Review in 4.11.0. Two schedulers over one-workflow-per-clone is a collision, not redundancy.

## Suggested Workstreams

**WS-A (#402): Orchestrator, conditional-lens keystone, pipeline contracts.** Seven sub-plans (A1–A7), 23 total subagents (orchestrator + 5 pipeline agents + 18 lens prompts). Requires: none. A1 (keystone contract) → A2 (stack-detect) → A3 (skill-install), A4 (synthesiser incl. correlation), A5 (organise+summary) in parallel after A2 → A6 (10-step orchestrator) → A7 (registry+gates+tests) after WS-B and WS-C built. The A4 first task is a one-lens vertical slice (reliability + contract-conformance hand-written fixtures, no orchestrator, no workflow). Delivers contract declaration, five pipeline agents with all manifests sections, orchestrator with feat-located status.jsonl and post-copy assert, canonical enums inline, 8 parity assertions extending existing test file.

**WS-B (#403): Universal lens layer, 13 always-on lenses.** 13 × `.bkit/prompts/bkit-audit-lens-{slug}.md` (architecture, hotpath, config, reliability, observability, debt, dead-code, deps, security, supply-chain, tests, docs-drift, logic-dupe). Model: claude-opus-5, effort: high, maxTurns: 50. Requires: WS-A A1 + A2 only (A3–A7 not blockers). Composition: 4 unchanged + 7 amended + 1 reclassified (supply-chain hasCi→always) + 1 new (logic-dupe). Accepts all ten amendments into deliverable probes. Fixture asserts on subject:/signal: emission for reliability/observability/tests; signals: frontmatter on all 13; models rows per-lens in same change. Supply-chain is only exception with additive Bash.

**WS-C (#405): Conditional lens layer, 5 flag-gated lenses.** 5 × `.bkit/prompts/bkit-audit-lens-{slug}.md` (ui-ux hasWebSurface, contract-conformance hasDb, derived-data hasDerivedStore, ai-llm hasLLM, reference-signal hasNetwork). Requires: WS-A A1 + A2 only. Composition: 2 unchanged + 1 renamed+rewritten (data-layer→contract-conformance) + 1 amended (ai-llm four dimensions) + 1 new (derived-data). Hardest surface: derive hasDerivedStore flag (inverse-evidence guard; plan should fixture both directions; expect one revision). Dogfood acceptance asserts manifest rows (published file) showing 5 conditional slots as N/A, never ran. Contract-conformance emits ## Subject Aliases; all 5 emit subject: + signal: on eligible findings. AI-llm validated off-dogfood. Per-dimension probe-clause criterion for ai-llm amendments.

## Recommended Next Step

`/bkit-plan 402` - WS-A engine and orchestrator. Brief: Reconciliation Pass 4 of the audit engine; charter the contract declaration (A1–A2), five pipeline agents with correlation pass (A3–A5), orchestrator (A6), and registry gates (A7). Version target 4.11.0 with #403 and #405 in one release. Critical de-risking: one-lens vertical slice as A4 task 1 (hand-written fixtures, real synthesiser + Bash, answers subject normalisation + parsing + manifest carry-through). Ref: design-v3-organised.md § WS-A (#402).

### Comment 2026-07-29T08:13:17Z

### Step 10 — Close Workflow

Squash-merged to `dev` (`5670f160`), close-transport row recorded (`f7cf5f12`). Post-close body scan clean, transport cross-check passed, worktree removed and `feat/402-audit-engine-orchestrator` deleted. Full suite green at push: 75 files, 2667 passed.

Step 9 was **skipped by design** — it gates on a `MILESTONE` label, and #402 carries `enhancement` + `bkit:design`. Correct outcome: WS-A/B/C already exist as #402/#403/#405, so auto-creating workstream sub-issues would have collided with the live charter.

#### Artifacts

- [402-audit-engine-orchestrator-design.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/402-audit-engine-orchestrator-design.md)
- [design-brainstorm-ideate-1.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/402-audit-engine-orchestrator/design-brainstorm-ideate-1.md)
- [design-brainstorm-ideate-2.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/402-audit-engine-orchestrator/design-brainstorm-ideate-2.md)
- [design-brainstorm-ideate-3.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/402-audit-engine-orchestrator/design-brainstorm-ideate-3.md)
- [design-input.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/402-audit-engine-orchestrator/design-input.md)
- [design-review-1.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/402-audit-engine-orchestrator/design-review-1.md)
- [design-review-2.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/402-audit-engine-orchestrator/design-review-2.md)
- [design-summary.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/402-audit-engine-orchestrator/design-summary.md)
- [design-v1-draft.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/402-audit-engine-orchestrator/design-v1-draft.md)
- [design-v2-reviewed.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/402-audit-engine-orchestrator/design-v2-reviewed.md)
- [design-v3-organised.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/402-audit-engine-orchestrator/design-v3-organised.md)

#### Telemetry

**design close** · cbartens/bkit

| metric          | this run                       | med·5 |
| --------------- | ------------------------------ | ----- |
| durationSeconds | 40504 (11h15m)                 | —     |
| linesChanged    | 697 (+499/-198)                | —     |
| filesChanged    | 19                             | —     |
| frictionAdded   | 0                              | —     |
| deferralsAdded  | 3                              | —     |
| failuresAdded   | 0                              | —     |
| compliance      | 2 pass · 0 fail · 0 n/a (100%) | —     |
| attempts        | DESIGN_ATTEMPT 1               | —     |

`med·5` = median of the previous 5 design runs (— if &lt; 3) · ledger 43 rows, 0 malformed

#### Follow-ups outside this design&#39;s scope

Two record-keeping items this pass surfaced but did not have standing to fix:

1. **#403 and #405 cite seven `#80` comment IDs that return 404** (`5006018836`, `4990615398`, `5008003553`, `4699042917`, `4884166043`, `4884570758`, `4778944021`). The real amendment comments exist under different IDs and are reproduced verbatim in `design-input.md` Appendix A. The design doc is now the durable copy, so nothing is lost — but the issue bodies still point at dead links.
2. **Three filed lines in the peer issues are superseded by this design**: `ai-llm`&#39;s dogfood expectation, `debt`&#39;s tracker cross-check, and both peers&#39; `Requires` scope (narrowed to A1 + A2). The plan runs can cite the design as ground truth, or the bodies can be amended first.

### Comment 2026-07-29T08:28:02Z

## Workstream Charter — 402-audit-engine-orchestrator

**Parent issue:** #402 (this issue is both the milestone&#39;s WS-A and the design&#39;s parent)
**Canonical design (Pass 4):** [`docs/plans/202607/402-audit-engine-orchestrator-design.md`](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/402-audit-engine-orchestrator-design.md)
**Workstream:** WS-A (#402) — `/bkit-audit` engine: orchestrator, conditional-lens keystone, pipeline contracts
**Requires:** `[]`

&gt; [!IMPORTANT]
&gt; This supersedes the **Canonical spec** line in this issue&#39;s body. `docs/plans/202605/80-audit-workflow-design.md` (Pass 3) and `bar-199-audit-workflow-design.md` (Pass 2) are now **historical**. The Pass-4 doc above is self-contained and is the sole input to `/bkit-plan`; it carries the Pass-3 architecture forward unchanged and folds in the contract relocation, the decomposition re-cut, the ten charter amendments, the dedup→correlate upgrade and the version target.

### Scope

**Mechanism only, zero probe content.** WS-A authors no lens prompt and no probe clause; it authors the contracts every lens is written against, the five pipeline agents, the orchestrator and the registry/parity surface. Decomposed into seven sub-plans (full deliverable text: § WS-A (#402) — audit engine. Sub-plans A1–A7):

| Sub-plan | Owns                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Requires (internal)   |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| **A1**   | Conditional-lens keystone — the contract declaration. `## Applicability` block shape; `requires:` + `signals:` frontmatter keys; launch-and-self-no-op; sanity-probe-before-emit **extended to universal lenses** via `Reviewed: {N} files` + `always=true but no surface evidence`; the § Reason-string contract (five shapes, substituted placeholders, ` (operator override)` modifier); three-state `## Missing Lenses` row format; operator escapes `[lenses=…]`, `[applicability-override=flag=bool]`, `--with-websearch`; the finding-schema addendum (`subject:`, `signal:`, `evidence:`, `guard-ref:`) incl. the positive `confidence: medium` clause; the shared lens skeleton (25-cap, 5-slot reserve, `## Truncated` + per-eviction records, base tool set with two additive exceptions). | —                     |
| **A2**   | `bkit-audit-stack-detect` — `audit-stack.md` schemaVersion 2, the five-flag inventory incl. the new `hasDerivedStore` heuristics and its inverse-evidence guard, the greppable `## Applicability Overrides` form, `## Applicability Disagreement`, `confidence: low → CONCERNS`. Plus its § Models row.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | A1                    |
| **A3**   | `bkit-audit-install-skills` — skill machinery reuse incl. uninstall/prune, 10-skill cap, `[skills=false]`, non-gating, **plus the reusable prune entry point the Failure Path calls**. Plus its § Models row.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | A2                    |
| **A4**   | `bkit-audit-synthesise` — parse, reference-signal post-process, dedup, **the correlation pass**, and the five manifest sections. Tool set `Read, Grep, Glob, Write, Edit, Bash` (**stated, not inherited**). Subject normalisation + alias resolution; the rule table; leg-state resolution incl. the two-tier truncation → `unobserved` rule; composed-finding authoring; `## Run Scope`; `## Correlation Coverage`. Plus its § Models row.                                                                                                                                                                                                                                                                                                                                                          | A1                    |
| **A5**   | `bkit-audit-organise` + `bkit-audit-summary` — matrix/ranked list/appendix/DAG, **verbatim carry-through of the three scope-coverage sections above the matrix with a self-verify that refuses a verdict when any is missing or short-count**, the down-rank fence and its grep-assert, the 500-token summary + mandatory coverage digest. Plus both § Models rows.                                                                                                                                                                                                                                                                                                                                                                                                                                   | A4                    |
| **A6**   | `.bkit/workflows/bkit-audit.md` — the 10-step orchestrator. Feat-located `status.jsonl` with **all seven live event types incl. the Close-gating `transport-fallback`**; Failure Path incl. the best-effort `audit-*` skill prune; Step-5 pre-launch cleanup + excluded-slot stubs + 18-slot fan-out; **Step-6 canonical enums inline** (18 slugs, signal tokens, rule ids) and their grep-asserts; the Step-7 manifest-propagation gate; `{WORKTREE_PATH}` on all 23 `Context:` lines (`REPO_ROOT` keeps the `--git-common-dir` idiom); close reorder + `mkdir -p docs/audits` + the Step-10 post-copy assert on the **published** file.                                                                                                                                                             | A1–A5, **#403, #405** |
| **A7**   | Registry, metadata, gates, legacy deprecation — `.bkit/prompts.md` § Audit Phase / § Tool set patterns (four sub-rows) / § Frontmatter Conventions; **wholesale replacement** of `.bkit/workflows.md` § `/bkit-audit` plus the **additive** `audit` branch-placement row; `.agents/docs.md` Audit column + template + `.bkit/version` `canonicalHashes` regen; **the eight parity assertions, extending `.bkit/src/bkit-catalog-parity.test.ts` (not a new file)**; `bkit-utility-audit-*` deprecation headers; ledger appends.                                                                                                                                                                                                                                                                       | A1–A6                 |

**Obligations WS-A owes the peers (X1):** A1 and A2 are the _only_ things #403 and #405 block on. Their output must be complete and stable enough that a lens author never has to guess a field name, a reason string or a flag name — the reason-string contract is pinned to the **substituted** rendering, and the flag inventory is the closed set every `requires:` value must come from.

**Obligations WS-A owes itself (X2, X4):** A4&#39;s correlation and A7&#39;s parity assertions read the **shipped** WS-B/WS-C lens files, not WS-A&#39;s own second copy of the enums. A6 and A7 therefore land after both peers.

**Sequencing note that must survive into the plan:** A7 was **re-ordered during review** so `bkit-catalog-parity.test.ts` is never knowingly left red across plan runs. The § Models rows land **per sub-plan alongside each prompt** (~276 provider model-ID cells across 23 rows × 12 provider columns, distributed, not batched); A7 keeps only the surfaces no single prompt owns.

**Explicitly out of WS-A&#39;s scope:** any probe text, any lens charter wording, and legacy `bkit-utility-audit-*` **deletion** (blocked on #83/E1 — A7 ships the deprecation header only, with `Deprecated since` resolved against `package.json#version` at build time, never a pinned version).

### Rationale

WS-A is the root: it owns every contract the other two are authored against, and nothing in it depends on probe content. It is a single workstream rather than seven because A1–A7 share one artifact family (`.bkit/workflows/bkit-audit.md` + the five pipeline prompts + one registry surface), one enum set and one parity test — splitting them across issues would put the canonical enums and their asserts in different plan runs, which is the exact drift shape this pass exists to remove. Its internal A1→A7 chain, including the A6-waits-for-the-peers interleave and the A7 re-ordering, is a sub-plan-level DAG that lives inside one plan run and needs no cross-issue coordination.

### Build order and version

`A1 → A2, A3, A4, A5 → WS-B (#403), WS-C (#405) → A6 → A7`. All three plans can be written up front. Version target **`4.11.0`, WS-A + WS-B + WS-C in one minor — a closed decision**. No plan may propose splitting the release.

Design sections to read: § WS-A (#402) — audit engine (full sub-plan deliverables), § The cross-workstream contract (X1–X4), § Task 4 (the correlation pass), § Decomposition notes for the three plan runs.

### Comment 2026-07-29T08:52:54Z

## Post-design cross-check — lens inventory vs the full #80 record

Re-derived the lens arithmetic from source rather than trusting the design doc, and swept the #80 body + all 56 comments for anything lens-bearing that did not land.

**The 18 reconcile exactly.** Pass-3&#39;s canonical 16-slug list + `logic-dupe` + `derived-data`, with `supply-chain` moving universal, gives 13 + 5. No lens dropped, none double-counted. All ten amendments land on a named row; the three 2026-05-29 Phase-2 candidates all mapped (`ui-ux`, `reference-signal`, and CI-screenshot critique — explicitly rejected as a lens there and routed to WS-E/#206); every row of the reorg traceability table lands in a workstream.

### What the sweep did surface — now recorded (`b8bf1bfd`)

Pass 2 deferred **six** named lens candidates with rationale. Pass 3 resolved some by absorption and said nothing about the rest, so with Passes 2 and 3 now historical and the Pass-4 doc the sole input to three plan runs, an unrecorded defer had become indistinguishable from an oversight — the same failure shape that lost the decomposition when #187–#193 were deleted.

Added § _Task 3 (cont.) — lens candidates considered and deliberately NOT in the 18_ to the design, with the disposition of all six:

| Pass-2 candidate | Disposition                                                                                                                                |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| a11y, i18n       | **absorbed** into `ui-ux` (C1)                                                                                                             |
| migrations       | **absorbed** as a `contract-conformance` (C2) secondary probe                                                                              |
| caching          | **PARTIAL** — `derived-data` (C3) covers consistency; TTL, invalidation, stampede and key-cardinality are **not covered by any of the 18** |
| api-contracts    | **still deferred — no coverage anywhere**                                                                                                  |
| rate-limiting    | **still deferred — no coverage anywhere**                                                                                                  |

Three `docs/deferrals.jsonl` rows so the `debt` lens (B6) surfaces them on any audit of this repo — the intended feedback path: `402-api-contract-lens-still-deferred`, `402-rate-limiting-lens-still-deferred`, `402-caching-correctness-half-uncovered`. Each carries the rationale and a &#34;do not add a lens without reading this first&#34; note, because two of them have now been deferred twice on the same signal-to-noise argument.

Also recorded: **one known future delta to the WS-B count.** The reorg record left open whether **DX** graduates out of WS-D (#207) into the universal set. If it does, WS-B is 14, not 13. That belongs to WS-D&#39;s design, but a plan run should not treat 13 as permanent.

### Duplicate-closure re-check — all five covered

| Closed                        | Content now lives in                                              | Verified                                                                                                |
| ----------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| #404 `logic-dupe`             | **#403** § B13                                                    | full charter present                                                                                    |
| #406 log-scan → `debug-fetch` | **#83** sub-plan E1                                               | absorption stated in body                                                                               |
| #206 seeded-render UX         | **#83** sub-plan E3                                               | absorption stated in body                                                                               |
| #331 silent-corruption        | **#324** sub-plan G2 (gate half) + **#402/#403/#405** (lens half) | G2 carries an explicit split note; every named lens piece is in the Pass-4 inventory                    |
| #401 model-tier-scoped audit  | **#324** sub-plan G3                                              | scope, the &#34;trigger problem, not a lens problem&#34; reframe, and all four open questions preserved |

Exactly five duplicate-closures exist in the milestone — no strays.

### Correction and widening of an earlier note

I previously reported the dead `#80` comment IDs as a #403/#405 problem. Those seven are confirmed dead, but the sweep shows **the problem is wider**: `#83` (`4996146521`, `5001929244`), `#309` (`4778946123`), `#324` (`4893558194`, `5006018836`) and this issue&#39;s own body (`5006018836`) also cite IDs that 404 — 11 distinct dead references across six issues. `5007998667` on #403 is live; every other cited ID checked is not. Not blocking any plan run, since the design doc is now the durable copy, but worth a cleanup pass.

---

## #277 — Workflow artifacts overwrite on re-run decide disambiguation scheme (open)

## Problem

The per-workflow `*-input.md` artifacts (`build-input.md`, `plan-input.md`, `design-input.md`, `ship-input.md`) are written once per run with a **flat, unkeyed filename**. A second run of the same workflow on the same FID — whether a complexity-split sub-plan or just a fresh attempt — **overwrites** the previous input artifact. Last write wins; earlier inputs are lost.

Confirmed in the wild: `docs/plans/202606/logs/245-opencode-provider-host/status.jsonl` has two `build-worktree-setup` entries (`2026-06-09T11:54:54Z` and `2026-06-09T21:30:01Z`), both pointing at the same `build-input.md`.

Note `bkit-debug.md` already sidesteps this with `debug-input-{DEBUG_ATTEMPT}.md`, because debug **already maintains** a `DEBUG_ATTEMPT` counter for its NORMAL→OBSERVE→SOAK ladder. The other four workflows have no equivalent counter.

## Two collision classes (don&#39;t conflate them)

**Keyed artifacts** — already carry a disambiguator, never collide _within_ a run:

- `build-plan-execute-{N}-log.md` (sub-plan index)
- `build-plan-verify-{N}-{M}.md` (sub-plan × verify-attempt)
- `build-challenge-{1,2}.md` (reviewer id)
- `debug-failure-diagnose-{ATTEMPT}.md` (attempt)

**Unkeyed artifacts** — written once per run, no per-run key:

- `*-input.md` ← the only one actually observed colliding
- arguably `build-summary.md`, `ship-update-docs.md`, holistic verify

The keyed files only collide across a **full re-run of the same workflow on the same FID** (the same sub-plan index N is reused), not within a single run.

## Options considered

### A. Input-only timestamp / attempt suffix (cheapest)

Only `*-input.md` is genuinely unkeyed, so only fix that. Either:

- `*-input-{ts}.md` (timestamp, zero derived state, collision-proof, but not human-meaningful and diverges from debug&#39;s `{ATTEMPT}` convention), or
- `*-input-{ATTEMPT}.md` (matches debug, human-readable, but requires **inventing** an attempt counter for build/plan/design/ship — new state + new failure surface: miscount, race, resume-after-crash gaps).

Cross-run overwrite of keyed files (`verify-1`, etc.) is accepted as fine — latest run is the one you care about; `status.jsonl` records each run&#39;s `parentSha` for history.

### B. Per-file timestamp on **every** Write (rejected)

Stamp every artifact `-{ts}`. **Worst option:**

- Most edits (every Write across 5 workflows).
- Breaks within-run globs: `verify-1` from run A and run B become two files; &#34;read all verify for this run&#34; now globs **across runs** and must filter by a timestamp window to reconstruct one run. Strictly worse than today.

### C. Per-run namespace (cleanest, biggest refactor)

Stamp the run boundary **once** — a run-scoped subfolder `logs/{FID}/{run-ts}/...` (or a `RUN_ATTEMPT` counter on the dir). Inside it, every file keeps its clean keyed name (`verify-1`, `challenge-1`). One disambiguator captures the whole re-run instead of N of them; gives full re-run history.

- Cost: every read-glob in all 5 workflows changes, plus tracker links and the `status.jsonl` artifact paths.

### D. Unify debug down to timestamp

Orthogonal sub-question: debug&#39;s filename uses `{DEBUG_ATTEMPT}` but that counter exists for the **ladder**, not the filename. The filename could be timestamped while `DEBUG_ATTEMPT` stays internal. Then all five workflows share one filename scheme. Full consistency, no new counters — at the cost of debug filenames losing at-a-glance attempt readability.

## Decision needed

1. Is overwrite-on-full-rerun a real problem for the **keyed** files, or only for `*-input.md`?
   - If only input → **Option A**, done.
   - If full re-run history wanted → **Option C** (run-scoped folder), _not_ per-file suffixes.
2. **Avoid Option B** — most edits and it degrades within-run globs.
3. Timestamp vs `{ATTEMPT}`: timestamp = zero new state, collision-proof, not human-meaningful; `{ATTEMPT}` = readable + matches debug, but invents a counter (new bug surface) for the four workflows that lack one.

## Affected files

- `.bkit/workflows/bkit-build.md`
- `.bkit/workflows/bkit-plan.md`
- `.bkit/workflows/bkit-design.md`
- `.bkit/workflows/bkit-ship.md`
- `.bkit/workflows/bkit-debug.md` (only if Option D)
- Mirrors regenerated via `bkit install`: `.claude/commands/`, `.cursor/commands/`, `.opencode/commands/`

## Status

Discussed 2026-06-16. A draft input-only-timestamp implementation (Option A / timestamp) was written then **discarded** — no code currently on any branch. Picking up later.

_No comments._

---

## #405 — Conditional lens prompts UI UX contract-conformance derived-data AI LLM reference-signal (open)

**Workstream C** of the Recurring Audits milestone. **Tracker + workstream map:** #80. **Requires:** WS-A (#402) — conditional-lens keystone (applicability flags, `requires:` frontmatter, three-state coverage) + `audit-stack.md` v2.

## Scope

The **gated** lenses — those that only apply when the repo has the relevant surface. All ride the WS-A keystone; none may report &#34;ran, no findings&#34; on an absent surface.

The web-product conditional family (SEO/AIO/IA, analytics, web-perf, DX) is large enough to be its own workstream — WS-D (#207). Always-on lenses are WS-B (#403).

## Deliverable — 5 conditional lens prompts

| Slug                   | Gate                            | Status                                   | Charter                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ---------------------- | ------------------------------- | ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ui-ux`                | `hasWebSurface`                 | designed (Pass 3)                        | Responsive mechanisms (breakpoints vs fixed `px` / hardcoded heights / absolute positioning), units &amp; typography floors (`px` vs `rem`, sub-12px, tap targets), accessibility (missing `alt`, clickable non-interactive elements, unlabelled inputs, heading-order skips, focus states, `lang`), WCAG contrast **computed from design tokens**, design-system adherence (hardcoded colours/spacing off the scale), i18n (hardcoded strings, fixed widths vs longer translations), layout shift (images without dimensions). **Absorbs the a11y/i18n surface** v1 had listed out-of-scope. |
| `contract-conformance` | `hasDb`                         | **sharpened — was `data-layer`**         | See below                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `derived-data`         | `hasCache` / derived-store flag | **NEW — not in any design pass**         | See below                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `ai-llm`               | `hasLLM`                        | designed, **needs framework enrichment** | See below                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `reference-signal`     | `--with-websearch` opt-in       | designed (Pass 3)                        | Stack → popular reference repos → divergence from shared conventions as a **soft, lower-confidence external signal**. Emits `source: reference-repo`; WS-A enforces strict down-rank (never matrix top row, never ranked-list top 3, never exec summary). Capture repo names + commit/tag + query in `## Reference Repos Used` — reproducibility is &#34;explainable&#34;, not &#34;identical&#34;. Bound to top 3, structure/config/README only. The only network lens.                                                                                                                      |

## `contract-conformance` — the sharpened data-layer lens

Source: [#80 comment 2026-07-06](https://github.com/cbartens/bkit/issues/80#issuecomment-5006018836) (the lens half of the silent-corruption proposal).

The Pass-3 `data-layer` charter (N+1, missing indexes, unbounded queries, transaction/idempotency, migration safety) is **too vague to bite** on the class that motivated it. Replace with a **derivation, not a scan**:

1. Build the grant / permission matrix per store.
2. Enumerate every write site.
3. Resolve the client role at each site (route → action → helper).
4. Flag (a) **role-mismatched writes** and (b) **unchecked errors on writes into a restricted store**.

**Motivating case:** a schema hardening revoked writes on a cache table from one role; ~6 request-path write sites still ran as that role, hit a permission error, **swallowed it** (returned 2xx), and the corruption was invisible because the read surface derived from a different source. Every test tier stayed green. Per-lens grep-shaped scanning cannot catch this — every file is locally plausible; the bug is a contract violation in _composition_.

Retain the original N+1 / unbounded-query / migration-safety probes as secondary; the derivation is the primary probe.

## `derived-data` — dual-source consistency (new)

Same source. **Not present in any design pass.**

Find caches, denormalized columns, and materialized stores that have an independent recompute path. Probe:

1. Is there a single authoritative writer, or none/many?
2. Does _every_ source-mutation path also update the derived store?
3. Does any test or database constraint assert the two agree?

Generalizes well past the motivating case — applies to any cache, read model, or materialized view.

## `ai-llm` — enrich with the agentic-audit frameworks

The Pass-3 charter (prompt-injection surfaces, unvalidated model I/O, PII/secrets to providers, token-cost controls, model-version pinning, eval coverage) predates the framework survey in [#80 comment 2026-06-08](https://github.com/cbartens/bkit/issues/80#issuecomment-4778944021). Fold in the four audit dimensions:

1. **Tool &amp; capability sandboxing** — are the functions exposed to an agent restricted? Write access where read would do? Isolated execution? (OWASP Agentic Top-10, AWS agentic guidance)
2. **Prompt-as-code integrity** — are system prompts version-controlled, sanitized, and isolated from user-facing input, or hardcoded ad hoc and vulnerable to context poisoning? (MITRE ATLAS, NIST AI RMF)
3. **Agent-framework supply chain** — orchestration libraries pinned to secure versions; third-party plugins audited. (Overlaps `supply-chain` in #403 — assign ownership at design; recommend `supply-chain` owns pinning, `ai-llm` owns agent-specific plugin trust.)
4. **Deterministic logging &amp; blast radius** — hard token limits, cost caps, execution logs for post-incident forensics; no raw model output piped into an executor. (OWASP SAMM/Agentic)

Frameworks to name in the _charter_ (not the probe text, which stays stack-agnostic): OWASP Top 10 for Agentic Applications, MITRE ATLAS, AWS Secure Development Practices for Agentic AI, OWASP SAMM, NIST SSDF. **WS-F (#309) uses the same frameworks for the dynamic side — keep one shared taxonomy so static and red-team findings map onto each other.**

**Self-reference hazard:** running `ai-llm` on a repo whose own source _is_ agent prompts (bkit) requires explicit `.bkit/**` / `.claude/**` / `.cursor/**` / `.opencode/**` scope exclusion, or it mis-classifies agent assets as product LLM surfaces.

**Tooling candidates for skill-install** (evaluate, do not vendor blindly): Promptfoo, RepoAudit, LLMAudit.

## Hard requirements for every lens here

- **Honour the three-state coverage manifest.** A no-DB repo (bkit itself) must render `N/A — not applicable (hasDb=false)`, never &#34;ran, clean&#34;. This is the false-all-clear failure the keystone exists to prevent.
- **Sanity-probe before emitting.** If the flag is true but the first-pass probe finds zero relevant files, emit `# Not Applicable (flag=true but no surface evidence)` and exit rather than inventing findings.
- **Stack-agnostic probe text.** The lenses reason about _stores, privileges, authority, affected surfaces_ — never a database product, UI framework, or model provider by name. Stack specifics arrive via `audit-stack.md` + `audit-{token}` skills.

## Cross-workstream couplings

- **WS-A synthesis correlation rule** — no single lens produces the silent-corruption write-up; a human composed three. `contract-conformance` says &#34;store S is role-restricted&#34;, `reliability` says &#34;swallowed write to S&#34;, `tests` says &#34;S&#39;s critical path is mock-collapsed&#34; → co-located, those compose into one red **silent-corruption candidate**. The correlation logic belongs to WS-A (#402, sub-plan A4); this workstream owns the inputs.
- **WS-B `reliability`** (#403) consumes this workstream&#39;s grant matrix for its privilege-aware up-rank.
- **WS-G (#324, sub-plan G2)** owns the _gate_ half — ship-time contract-delta and the milestone-end behavioural proof. Static lenses only _infer_ the permission error; converting hypothesis to proof is a behavioural run, and that lives there.

## Acceptance

- 5 conditional lens prompts exist with correct `requires:` flags, wired into the WS-A fan-out.
- Dogfood on bkit: `ui-ux`, `contract-conformance`, `derived-data`, `ai-llm` all render `N/A — not applicable ({flag}=false)`.
- Validate `ui-ux` against a consumer/sample UI repo — bkit cannot dogfood it.
- `contract-conformance` reproduces the motivating case&#39;s root cause (role-mismatched writes + unchecked errors into a restricted store) on a seeded fixture.
- Universality grep-gate returns zero library-name matches across all five.

### Comment 2026-07-29T06:40:25Z

## ▶️ Next step — hold for #402's Pass-4 design, then `/bkit-plan`

**No separate `/bkit-design` for this workstream.** WS-C was extracted from the Pass-3 design's WS-3 and is chartered by the same doc. The reconciliation pass running against #402 folds this workstream's amendments in — the `data-layer` → `contract-conformance` sharpening, the new `derived-data` lens, and the `ai-llm` agentic-framework enrichment.

The one part that genuinely deserves design attention — the **synthesis correlation rule** that composes contract + reliability + tests findings into a single silent-corruption candidate — is task 4 of that pass, because the rule lives in WS-A's synthesiser. This workstream owns the inputs, not the composition.

### Blocked on

- **#402's Pass-4 design reaching PASS** — tasks 2, 3 and 4.
- **Version target confirmed** in that design. Hard gate.

### Then run

```
/bkit-plan

#405 — conditional lens layer for /bkit-audit: 5 flag-gated lens prompts riding
WS-A's applicability keystone.

Charter of record: the reconciled Pass-4 design doc produced against #402. This
issue body defines each lens's probe, its gate flag, and — for
contract-conformance and derived-data — the motivating case they must catch.

Deliverable: 5 .bkit/prompts/bkit-audit-lens-{slug}.md prompts with correct
`requires:` frontmatter values.
  ui-ux                 requires: hasWebSurface
  contract-conformance  requires: hasDb
  derived-data          requires: hasCache (or the derived-store flag the Pass-4
                        design settles on)
  ai-llm                requires: hasLLM
  reference-signal      opt-in via --with-websearch; the only network lens

Expect complexity-split. Suggested seams: (a) ui-ux, (b) contract-conformance +
derived-data (they share the derivation technique and the same motivating case),
(c) ai-llm, (d) reference-signal (different tool surface — WebSearch — plus the
down-rank contract and the `## Reference Repos Used` provenance block).

Hard constraints:
- THE FALSE-ALL-CLEAR INVARIANT IS THE POINT OF THIS WORKSTREAM. A lens on an
  absent surface renders `N/A — not applicable ({flag}=false)`, never "ran clean".
  Dogfood check: an audit run on bkit's own repo must show ui-ux,
  contract-conformance, derived-data and ai-llm all as N/A.
- Sanity-probe before emit: if the flag is true but the first-pass probe finds
  zero relevant files, emit `# Not Applicable (flag=true but no surface evidence)`
  and exit rather than inventing findings.
- contract-conformance is a DERIVATION, not a scan: build the grant/permission
  matrix per store, enumerate every write site, resolve the client role at each
  (route -> action -> helper), then flag role-mismatched writes and unchecked
  errors on writes into a restricted store. A grep-shaped implementation misses
  the motivating case entirely — every individual file is locally plausible.
- ai-llm self-reference hazard: running it on a repo whose own source IS agent
  prompts (bkit) requires explicit .bkit/** .claude/** .cursor/** .opencode/**
  scope exclusion, or it mis-classifies agent assets as product LLM surfaces.
- Universality grep-gate: zero library-name matches across all five. The lenses
  reason about stores, privileges, authority and affected surfaces — never a
  database product, UI framework or model provider by name.
- ui-ux cannot be dogfooded on bkit (no UI). Validate against a consumer or
  sample UI repo; the plan must name which.
- .bkit/prompts/*.md edits follow .agents/rules.md and the prompt authoring rules.

Verification the plan must include: contract-conformance reproduces the
motivating case's root cause (role-mismatched writes plus unchecked errors into a
restricted store) against a seeded fixture. Not a prose assertion — an executed
check.
```

### Sequencing note

Build order relative to siblings: A1–A5 (engine contracts) → #403 and #405 in either order → A6 (orchestrator integration, needs the prompts to exist) → A7.

### Comment 2026-07-29T08:29:05Z

## Workstream Charter — 402-audit-engine-orchestrator

**Parent issue:** #402
**Canonical design (Pass 4):** [`docs/plans/202607/402-audit-engine-orchestrator-design.md`](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/402-audit-engine-orchestrator-design.md)
**Workstream:** WS-C (#405) — conditional lens layer: 5 flag-gated lenses
**Requires:** `[WS-A]` — **narrowed to A1 + A2 only**, not all of #402

> [!IMPORTANT]
> **Two lines filed in this issue's body are superseded by the design doc and a plan run must not grade against them:**
>
> 1. **The `ai-llm` dogfood acceptance** (`renders N/A — not applicable (hasLLM=false)`) is **unachievable by construction** — `hasLLM` legitimately auto-detects **true** on bkit. The correct expectation is `N/A — not applicable (hasLLM=true but no surface evidence)`. **Do not weaken the heuristic to force `false`**; that re-opens the false-negative hole the keystone exists to close. Because bkit's own run exercises only the no-surface-evidence branch, `ai-llm`'s finding-emission path must be validated **off-dogfood** against a seeded fixture or a consumer repo.
> 2. **`Requires: WS-A (#402)`** is narrowed to **A1 + A2 only**. The unnarrowed form is a cycle against A6's `Requires: A1–A5, #403, #405`.
>
> Also resolved here: **`derived-data`'s flag is named `hasDerivedStore`** (this issue left it open as "`hasCache` / derived-store flag"). Its detection heuristics and inverse-evidence guard are **A2's** work, not WS-C's. That naming was the hard blocker on `/bkit-plan` for this issue.
>
> The seven `#80` comment IDs cited in this body return **404**. Cite this issue or § Amendment provenance in the design doc, which carries the true IDs.

### Scope

5 × `.bkit/prompts/bkit-audit-lens-{slug}.md` with correct `requires:` flags, wired into the Step-5 fan-out, same skeleton / model / effort / cap as WS-B. Slugs, gates and charters are rows **C1–C5** of § Task 3 — Lens inventory: the table of record:

| Sub-row | Slug                   | `requires:`       | Status                                                                 |
| ------- | ---------------------- | ----------------- | ---------------------------------------------------------------------- |
| C1      | `ui-ux`                | `hasWebSurface`   | unchanged                                                              |
| C2      | `contract-conformance` | `hasDb`           | **renamed + rewritten** (was `data-layer`)                             |
| C3      | `derived-data`         | `hasDerivedStore` | **new**                                                                |
| C4      | `ai-llm`               | `hasLLM`          | **amended** — the eighth amended lens, WS-C's                          |
| C5      | `reference-signal`     | `hasNetwork`      | unchanged (the only network lens; `+WebSearch` is additive to `Write`) |

**These 5 lenses ARE the empirical test of the keystone.** Every one of them must, on a repo lacking its surface, render `N/A — not applicable (…)` and **never** "ran, clean".

**Hard requirements for every lens here** (full text at § WS-C (#405) — conditional lens layer): honour the three-state coverage manifest; **sanity-probe before emitting** (flag true but no surface evidence → `# Not Applicable ({flag}=true but no surface evidence)`, never invented findings); **consult `## Applicability Overrides` for your own flag** and append the ` (operator override)` modifier when the value came from `[applicability-override=…]`; stack-agnostic probe text throughout. **`{flag}` / `{requires}` are always SUBSTITUTED with the lens's own `requires:` value — the published string never contains the literal token `flag`.**

**Obligations WS-C owes WS-A (X2, X4):** `contract-conformance` emits `signal: restricted-subject` / `role-mismatched-write` / `unchecked-restricted-write` with `subject:` per store **plus `## Subject Aliases`** (it is the only lens that empirically knows the identifier variants, and A4's tier-2 subject resolution depends on it); `derived-data` emits `signal: dual-source-writer` / `unsynced-derived-path` with `subject:`. Every lens carries a `signals:` frontmatter key, `Write` in its `tools:` list, and its `.bkit/prompts.md` § Models row in the same change.

**Obligations WS-C owes WS-B (X3):** `contract-conformance` is the **producer** of the restricted-subject leg that A4 uses to up-rank `reliability`'s unchecked-write finding — a missing or mis-subjected leg degrades a genuine silent-corruption candidate to silence. `ai-llm` carries the **`supply-chain` co-location convention line verbatim** (version pinning is `supply-chain`'s, both anchor `location:` at the manifest/lockfile entry) and must not re-report it.

**WS-C acceptance** is specified in full at § WS-C (#405). Load-bearing items: correct `requires:` values, all present in the Flag Inventory; **every amendment traces to a probe clause in the shipped prompt**; the **`ai-llm` per-dimension criterion** — each of the four framework-enrichment dimensions (tool & capability sandboxing, prompt-as-code integrity, agent-framework plugin trust, deterministic logging & blast radius) traces to a distinct greppable probe clause, with Pass-3's retained probes separately present; **`ai-llm` finding-emission validated off-dogfood**; `contract-conformance` reproduces the motivating root cause on a seeded fixture; `derived-data`'s heuristics and inverse-evidence rule exercised by a fixture **in both directions**; `ui-ux` validated against a consumer or sample UI repo (**bkit cannot dogfood it**); universality grep-gate clean with the **token set extended for `derived-data`** (cache / materialised-view product names); and the **dogfood acceptance on bkit's own repo**, asserted on the manifest rows read from the **published** `docs/audits/{FID}-audit.md`.

**Explicitly out of WS-C's scope:** any gating mechanism, the flag _detection_ heuristics themselves (A2 owns those, including `hasDerivedStore`), the canonical enums, and the web-product lens family (→ WS-D #207).

### Rationale

The 5 conditional lenses are the workstream where the keystone is actually exercised, and they share one obligation set that the universal lenses do not have: a `requires:` flag, an override-aware reason string, sanity-probe-before-emit against a named flag, and a dogfood row asserting N/A rather than clean. Separating them from WS-B means the applicability contract is authored, reviewed and fixture-tested in one place instead of being a minority concern inside a 18-prompt lump — and it is what surfaced that `ai-llm`, WS-C's lens, was the amendment left with no acceptance criterion in either workstream when the tally was miscounted. Like WS-B, its dependency on WS-A is **narrowed to A1 + A2 only**; the unnarrowed `Requires: #402` on the issue as filed is a cycle against A6's `Requires: A1–A5, #403, #405` and must not be carried into the plan.

### Build order and version

`A1 → A2, A3, A4, A5 → WS-B (#403), WS-C (#405) → A6 → A7`. All three plans can be written up front; WS-C's **build** starts once A1 + A2 land. Version target **`4.11.0`, WS-A + WS-B + WS-C in one minor — a closed decision**. No plan may propose splitting the release.

Design sections to read: § WS-C (#405) — conditional lens layer (full acceptance), § Task 3 — Lens inventory: the table of record (rows C1–C5), § The cross-workstream contract (X1–X4), § Decomposition notes for the three plan runs.

---

## #100 — Agentic preflight + runtime infra hardening (open)

**Linear:** [BAR-232](https://linear.app/bartens/issue/BAR-232) · **Created:** 2026-05-19 · **Linear assignee:** christian@bartens.biz

---

## Context

Two operational gaps in the autonomous bkit workflow that allow silent failure modes when the pipeline runs unattended.

Both surfaced as deferred items in `docs/pending.md` during [BAR-101](https://linear.app/bartens/issue/BAR-101/linear-depot-claude-intergration) / [BAR-110](https://linear.app/bartens/issue/BAR-110/agent-workflows-prompts-install-script) design work. Grouped together here because they share the same surface (preflight hooks + scheduled checks) and the same failure shape (&#34;agent thinks it&#39;s making progress, in fact it&#39;s stalled&#34;).

## Scope

### 1\. Branch protection rule verification in pre-flight

Ship phase merges PRs autonomously. If `dev` branch requires human approvals, ship will silently fail at merge step with no useful diagnostic.

Currently `.agents/templates/scripts/ci/bkit-set-protection.sh` exists as a one-time **applier** but there is no pre-flight **verifier** gate before ship.

**Fix:** Add a preflight check (in `.claude/hooks/preflight.sh` / `.cursor/hooks/preflight.sh` or as a `bkit-preflight.ts` subverb) that runs `gh api repos/{owner}/{repo}/branches/dev/protection` and confirms one of:

- `required_approving_review_count` is 0, OR
- Cursor Cloud Agent / GitHub Actions bot is in the bypass-actors list

Fail fast with a clear message if neither condition holds.

### 2\. Stuck-pipeline detection

When an agent launched via API fails silently, the parent Linear issue is left `In Progress` with no further activity. No alerting; the only signal is &#34;I haven&#39;t seen movement in a while.&#34;

**Fix:** Cursor scheduled automation (or GHA cron job) that queries Linear for issues:

- Status `In Progress`
- Has `Build` / `Debug` / `Ship` label
- No recent agent comment for &gt; N hours (N tunable, suggest 4h initial)

Action: post a warning comment on the issue. If stale for &gt; 2N hours, add `Blocked` label.

## Acceptance

- Pre-flight check rejects a Ship run against a `dev` branch with `required_approving_review_count &gt; 0` and no bypass actor, with a clear error.
- Scheduled automation posts a `[bkit-stuck]` warning comment on any issue idle past the threshold.
- Both gates documented in `.agents/workflows/` or equivalent.

## Out of scope

- Refactoring the workflow to use a different orchestration backend.
- Per-step heartbeat tracking (much larger lift).

## Related

- [BAR-101](https://linear.app/bartens/issue/BAR-101/linear-depot-claude-intergration) (Linear → Depot → Claude pipeline that introduced these surfaces)
- [BAR-110](https://linear.app/bartens/issue/BAR-110/agent-workflows-prompts-install-script) (in-repo bkit migration where the gaps surfaced)
- `docs/pending.md` (entries removed at issue-creation time)

**Links:**

- **Related:** [BAR-101](https://linear.app/bartens/issue/BAR-101) _(not imported)_, [BAR-110](https://linear.app/bartens/issue/BAR-110) _(not imported)_

_No comments._

---

## #56 — Build challenge remediate workflow steps prompt (closed)

**Linear:** [BAR-145](https://linear.app/bartens/issue/BAR-145) · **Created:** 2026-05-07 · **Linear assignee:** christian@bartens.biz

---

## Problem

`bkit-build` Step 9 routes asymmetrically on Challenge verdict:

- `PASS` → Step 12
- `CONCERNS` → Step 10 challenge-remediate → Step 11 challenge-tests → re-Challenge
- `FAIL` → **Failure Path** (no remediation, human re-runs from Step 1)

Justification in workflow comment: _&#34;CRITICAL finding, human review required.&#34;_ That leans on `rules.md` principles: &#34;Recommend, do NOT decide&#34; + &#34;Major changes always require human confirmation.&#34; Sound when FAIL means _architectural_ — wrong approach, wrong scope, missing layer.

But in practice (see [BAR-93](https://linear.app/bartens/issue/BAR-93/data-foundation-members-colours-tagging) build run), FAIL findings are often **mechanical**:

| Finding                                                                  | Class             | Auto-fixable?              |
| ------------------------------------------------------------------------ | ----------------- | -------------------------- |
| RLS test omits `type` column → silent no-op                              | Test bug          | Yes — one-line insert fix  |
| `items_select_policy` missing `deleted_at IS NULL`                       | Missing predicate | Yes — SQL clause           |
| `item_family_members` ex-member tags not filtered                        | Missing join      | Yes — SQL clause           |
| CDC scrub test queries `information_schema` via PostgREST → silent no-op | Test rewrite      | Yes — swap to admin client |

A challenge-remediate agent closes all four in minutes. Bouncing the user back to `/bkit-build bar-93` from Step 1 is friction without a safety benefit — the **re-Challenge is the safety net**, not the human-in-the-loop.

## Proposal

Route `CHALLENGE_VERDICT = FAIL` through challenge-remediate **once**, then re-Challenge.

### Workflow edits (`.agents/workflows/bkit-build.md`)

Step 9 routing (currently lines 491–493):

- `PASS` → Step 12 _(unchanged)_
- `CONCERNS` → Step 10 _(unchanged)_
- `FAIL` AND `CHALLENGE_REMEDIATE_ATTEMPT &lt; 1` → Step 10 (with `STRATEGY=FAIL`)
- `FAIL` AND `CHALLENGE_REMEDIATE_ATTEMPT &gt;= 1` → **Failure Path** with `Build challenge verdict: FAIL after remediation`
- Else → **Failure Path** _(unchanged)_

Step 11 challenge-tests runs as today after Step 10. Re-runs Step 9 (attempt 2). One bite at the apple — no unbounded loop.

### Agent prompt edits (`.agents/prompts/bkit-build-challenge-remediate.md`)

Teach the agent to **classify before fixing**:

1. For each finding in `build-challenge.md`, classify as `mechanical` or `architectural`.
   - **Mechanical:** missing predicate, missing join, missing column in test fixture, silent-no-op test, wrong import, missing re-export, naming mismatch, missing `deleted_at` filter.
   - **Architectural:** wrong layer, wrong abstraction, scope expansion, &#34;this approach leaks tenancy / violates X principle, redesign needed.&#34;
2. **If any finding is** `architectural` → emit `REMEDIATE_CHALLENGE_VERDICT = ESCALATE` with the architectural finding(s) quoted → orchestrator routes to **Failure Path** immediately (no auto-fix).
3. **Else** → remediate all mechanical findings → emit `REMEDIATE_CHALLENGE_VERDICT = PASS`.

Preserves the &#34;human review required&#34; intent for cases where it actually matters; removes friction for the common case where Challenge caught honest test bugs / missing predicates.

### Schema edit (`build-challenge.md` template)

Add `class: mechanical | architectural` field per finding so routing is **data-driven**, not LLM-judgment-driven on each rerun. The challenge agent decides classification once at the source, not the remediate agent inferring from prose.

## Out of scope

- Multi-attempt remediation on FAIL (stays at 1 — risk of masking architectural issues with patch-on-patch).
- Auto-routing on `ESCALATE` to a separate &#34;human review&#34; workflow — for now, Failure Path is sufficient.

## Validation

Re-run `/bkit-build bar-93` after the edits ship. Expected: Step 9 FAIL → Step 10 remediate (4 mechanical fixes) → Step 11 challenge-tests → Step 9 attempt 2 PASS → Step 12.

## References

- Workflow: `.agents/workflows/bkit-build.md` lines 469–501 (Step 9), 508–540 (Step 10), 545–570 (Step 11)
- Agent: `.agents/prompts/bkit-build-challenge-remediate.md`
- Triggering run: [BAR-93](https://linear.app/bartens/issue/BAR-93/data-foundation-members-colours-tagging) build, comment `8dc489c9-e9e0-4515-aaed-65144692f384`, branch `feat/bar-93-members-colours-tagging`
- Principles: `.agents/rules.md` § Principles (&#34;AI makes thoroughness cheap&#34;; &#34;Recommend, do NOT decide&#34;; &#34;Major changes ALWAYS require human confirmation&#34;)

**Links:**

- **Related:** #49 ([BAR-131](https://linear.app/bartens/issue/BAR-131)), [BAR-93](https://linear.app/bartens/issue/BAR-93) _(not imported)_

### Comment 2026-05-21T07:10:46Z

**@christian (Linear, 2026-05-08):**

[https://github.com/cbartens/bkit/commit/1e155ff12abcfc99e4e9f17023776086fc8a229b](<>)

### Comment 2026-05-21T07:10:47Z

**@christian (Linear, 2026-05-08):**

## Implementation Summary

Shipped as proposed, with a counter-convention refactor folded in at the user's request.

### Workflow edits — `.agents/workflows/bkit-build.md`

**Step 9 — Build Challenge** routing rewritten:

- `PASS` → Step 12 _(unchanged)_
- `CONCERNS` AND `CHALLENGE_REMEDIATE_ATTEMPT` < 1 → Step 10
- `CONCERNS` AND `CHALLENGE_REMEDIATE_ATTEMPT` >= 1 → Step 12 _(non-blocking after one remediate)_
- `FAIL` AND `CHALLENGE_REMEDIATE_ATTEMPT` < 1 → Step 10
- `FAIL` AND `CHALLENGE_REMEDIATE_ATTEMPT` >= 1 → Failure Path with `Build challenge verdict: FAIL after remediation`

**Step 10 — Build Challenge Remediate** now runs on CONCERNS _or_ FAIL (gated by `CHALLENGE_REMEDIATE_ATTEMPT < 1`). Increments counter at step entry.

**Step 11 — Build Challenge Tests** re-runs Step 9 when `CHALLENGE_VERDICT = FAIL` — re-Challenge as the safety net per "one bite at the apple" bound.

ESCALATE verdict was _not_ added — folded into FAIL with classify-gate `BLOCKED` log entries instead. Standard `PASS | CONCERNS | FAIL` vocabulary preserved across the codebase.

### Prompt edits

**`.agents/prompts/bkit-build-challenge.md`** — every finding now requires 5 fields:

- severity (`CRITICAL`/`HIGH`/`MEDIUM`/`LOW`)
- **class (`mechanical`/`architectural`)** — new
- location (file:line)
- exploit scenario
- suggested fix

Classification examples per the issue body. Routing is data-driven on `class`, not LLM judgment at remediate time.

**`.agents/prompts/bkit-build-challenge-remediate.md`** — added classify-gate as Step 4: read `class` on every finding; if any `architectural` → append `BLOCKED — Finding {N}: {name} — architectural, redesign required` to log → set Verdict `FAIL` → STOP. Else proceed to mechanical fixes. Auto-fix would mask the design defect.

### Cross-cutting refactor — attempt-counter convention

Aligned all 5 attempt counters across `bkit-build.md`, `bkit-debug.md`, `bkit-ship.md` to a single convention:

| Counter                       | Init            | Increment                           |
| ----------------------------- | --------------- | ----------------------------------- |
| `VERIFY_ATTEMPT`              | 0               | Step 6 entry                        |
| `TEST_ATTEMPT` (build)        | 0               | Step 12 entry                       |
| `CHALLENGE_REMEDIATE_ATTEMPT` | 0               | Step 10 entry                       |
| `TEST_ATTEMPT` (debug)        | 0               | Step 5 entry                        |
| `MERGE_ATTEMPT`               | 0               | Step 3 entry                        |
| `DEBUG_ATTEMPT`               | 0 (status.json) | Step 6 entry _(already conformant)_ |

Pattern: `init = 0`, increment at start of _owning step_. Counter = "completed attempts". `counter = 0` correctly means "step never ran" on PASS paths. First attempt still labeled "Attempt: 1" in status/comments — semantics preserved, only init+timing changed. Bound conditions (`<= MAX_*`) kept the same.

### Validation expectation

Re-running `/bkit-build bar-93` should now flow:

```
Step 9 attempt 1   FAIL  (4 mechanical findings, class: mechanical)
                          → Step 10 (classify gate passes; fix all 4)
Step 11            adds edge-case tests
Step 9 attempt 2   PASS (re-Challenge on fixed diff)
                          → Step 12
```

vs. the old flow which bounced to human after Step 9 FAIL with all 4 findings being mechanical edits the agent could close in seconds.

### Files touched

`.agents/workflows/bkit-build.md`, `.agents/workflows/bkit-debug.md`, `.agents/workflows/bkit-ship.md`, `.agents/workflows.md`, `.agents/prompts/bkit-build-challenge.md`, `.agents/prompts/bkit-build-challenge-remediate.md`, `.agents/prompts.md`. Mirrors regenerated under `.claude/` and `.cursor/`.

Not committed yet — pending review.

### Comment 2026-05-21T07:10:48Z

**@christian (Linear, 2026-05-08):**

original workflow history lead to issue: a `/bkit-build bar-93` run transcript, ending in Step 9 Build Challenge returning `CHALLENGE_VERDICT = FAIL` with 4 CRITICAL/HIGH findings that routed straight to the Failure Path, even though all 4 were mechanical edits an agent could have closed:

| **Severity** | **Finding**                                                                                     | **Fix needed**                                                                                                       |
| ------------ | ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| CRITICAL     | RLS test `beforeAll` omits `type` column → silent no-op                                         | Add `type: 'grocery'` (or valid enum) to items insert in `family-rls-bar93.integration.test.ts`                      |
| HIGH         | `items_select_policy` outer guard missing `deleted_at IS NULL` on carer family lookup           | Add `AND fm.deleted_at IS NULL` to `get_auth_user_family_ids()` or inline subquery                                   |
| HIGH         | `item_family_members` select policy: ex-member tags not filtered                                | Add join to verify current active family membership when resolving carer visibility                                  |
| HIGH         | CDC scrub test queries `information_schema.routines` via PostgREST (not exposed) → silent no-op | Replace with a direct assertion on the trigger payload, or use a Supabase admin client / raw SQL to verify scrubbing |

That Failure-Path bounce on all-mechanical findings is what motivated the remediate-loop change above.

---

## #216 — Friction backlog: 27 verified-open workflow/tooling gaps (P0–P3) (closed)

Backlog of friction that is **still open in current code**. Sourced from the bkit friction log + a consumer harvest (app-gether-life, visitfrasercoast-com) on 2026-06-01, then reconciled against `dev` HEAD under a **verified-fix bar**: an item is listed here only because its suggested fix is _not_ present in the code today (a one-off per-run workaround does not count). 12 already-fixed entries were pruned separately; 5 consumer-side/transient entries (husky guard, 529 overload, seed-leakage-guard-working-as-intended, Supabase IPv6, consumer `fcte` CI gate) are not bkit-actionable and were left in the log.

File:line references are against `dev` at time of writing. Grouped by shared root cause, ranked by severity.

---

## P0 — Release/CI integrity: broken or stale artifacts escape the gates

_Highest blast radius — a defect lands on `dev`/`main` or a PR merges red._

- [ ] **Pre-push hook can pass while a test fails.** `.husky/pre-push` has no `set -e`; `pnpm bkit check` and `pnpm check:dist` are separate, un-`&amp;&amp;`-chained lines after the `typecheck &amp;&amp; test &amp;&amp; format:check` group — so the hook&#39;s exit code is the _last_ command&#39;s, and a mid-script test failure is swallowed.
      _Example:_ during `/bkit-ship 141`, the pre-push vitest run exposed a failing `bkit-templates.content.test.ts` snapshot, but a hook structured this way would not have blocked the push.
      _Also in this entry:_ the ship squash gate (`bkit-ship.md:885-888`) fails only on `cancelled`/`skipped`, never `conclusion==&#34;failure&#34;` — a red merge commit passes on a technicality.
      _Fix:_ `set -e` / `&amp;&amp;`-chain all pre-push gates; make the ship squash gate fail on `conclusion==&#34;failure&#34;`.

- [ ] **Ship merges a PR with failing CI.** `bkit-ship.md:290` reads `gh pr view --json statusCheckRollup` → &#34;if any failures, Failure Path&#34;, but treats a GraphQL **403 as a pass** and never waits for the fresh CI run after a force-push.
      _Example:_ PR #70 (consumer) merged despite CI run `26353575510` reporting `conclusion: failure` — a 403 (PAT scope) silently voided the gate.
      _Fix:_ treat 403/error as FAIL; wait for the post-force-push run to complete before merging.

- [ ] **Invalid GitHub Actions expression shipped — no `actionlint`.** Workflow validation is `yaml.safe_load`-only across hooks, `package.json`, CI, and challenge-tests.
      _Example:_ `ci.yml` shipped `&#39;${{ steps.layer1.outputs.run_level == &#39;&#39;none&#39;&#39; &amp;&amp; &#39;&#39;none&#39;&#39; || steps.layer2.outputs.run_level }}&#39;` — doubled single-quotes make the whole workflow unparseable. It passed plan-execute, both challenge rounds, 22 structural regex guards, and 64/64 tests, then failed CI parse in 0s.
      _Fix:_ add `actionlint` to the local/pre-push/build gate for any change touching `.github/workflows/*`.

- [ ] **Stale `dist/` commits to `dev` — `check:dist` is pre-push only.** `.husky/pre-commit` runs only `lint-staged &amp;&amp; lint:prose &amp;&amp; lint:slop`; the `check:dist` assertion exists solely in `.husky/pre-push:29`, so stale build output can be committed on `dev`.
      _Example:_ `dev` HEAD shipped a `dist/bkit-trackers.js` whose `PAIR_RE` still used the old string-concat form while the committed `.ts` source had the new `[...].join()` form — blocking an unrelated design feat-branch push.
      _Fix:_ add a pre-commit assertion that committed `dist/` matches `tsc` output of committed source.

## P1 — Concurrency &amp; shared-clone state hazards

_Two runs on one clone, or a broad `git add`, stage/clobber each other&#39;s state. One is **OPEN**; matches the known &#34;no concurrent workflows on one clone&#34; pain._

- [ ] **Pre-worktree `git add docs/plans/` is broad, not FID-scoped.** `bkit-plan.md:212`, `bkit-design.md:208`, `bkit-build.md:255` stage the whole `docs/plans/` tree.
      _Example:_ an untracked `docs/plans/202605/logs/156-engagement-analytics/status.json` from a **concurrent IN_PROGRESS design run** would have been swept into a `/bkit-plan 77` commit.
      _Fix:_ stage by FID-scoped pathspec (`docs/plans/{YYYYMM}/logs/{FID}/ …`).

- [ ] **(OPEN) Re-plan sweep + main-checkout vale block.** Same broad add, plus the close-workflow dev commit runs `pnpm lint:prose` over the whole docs tree (`.husky/pre-commit`).
      _Example:_ main checkout held unrelated `?? docs/site-ia.md` (#163 IA WIP) + `M …bar-262…design.md`; the broad add would stage bar-262 and an unrelated `site-ia.md` vale error blocks the dev commit.
      _Fix:_ FID-scoped staging; have the close commit surface (not fail on) an unrelated untracked doc tripping `lint:prose`.

- [ ] **`git add -A` on `dev` at ship close + rebase conflict is not a human-confirm gate.** `bkit-ship.md:900` blanket-adds; conflict path (`bkit-ship.md:250-267,417-426`) routes to abort/subagent, not an explicit human gate.
      _Example:_ rebasing `feat/111` onto `origin/dev` hit 3 _semantic_ conflicts at the #101↔#111 intersection requiring human reconciliation.
      _Fix:_ treat a non-lockfile rebase conflict as a first-class human-confirm gate; stage explicitly by pathspec, never `-A`, on dev.

- [ ] **`core.bare` flip blocks the merge — no assertion/self-heal.** No `core.bare` / `is-inside-work-tree` check anywhere; `bkit-plan.md:729-730` does `cd &#34;$REPO_ROOT&#34;` then bare `git checkout dev`.
      _Example:_ by Step 11 of `/bkit-plan 160`, `git checkout dev` / `merge --squash` failed with `fatal: this operation must be run in a work tree` (main repo&#39;s `core.bare` had flipped to `true`).
      _Fix:_ assert `core.bare==false` (or `is-inside-work-tree`) and self-heal before dev ops.

- [ ] **Sibling-workflow commit on local `dev` at close — per-FID locks don&#39;t serialise `dev`.** Only a per-FID `.lock` exists (`bkit-build.md:24`).
      _Example:_ local `dev` carried an unpushed `3fc33fe docs(74-aio-nav-pages): plan DONE` from a concurrent `/bkit-plan` run, absent at this run&#39;s Step-1 divergence check, then swept into the push.
      _Fix:_ at close, detect `origin/dev..dev` commits from other FIDs and name them in the push summary.

- [ ] **Stale rebase target → 3-attempt merge.** Ship rebases the worktree (`bkit-ship.md:249-250`) but never pushes `feat/{FID}`; the merge retry loop (`:592-635`) doesn&#39;t re-fetch/re-rebase between attempts.
      _Example:_ rebased onto a stale `ef8e1ec`; three `[skip ci]` commits landed on `dev` during the ship window → &#34;Pull Request has merge conflicts&#34; on attempt 1.
      _Fix:_ push the rebased branch immediately (keep PR head current) and/or re-fetch+re-rebase between retries.

## P1 — Worktree path resolution: steps act on the main checkout, not the worktree

_Subagents/steps resolve to the wrong working tree → wrong-branch ops and misplaced artifacts. Recurring._

- [ ] **Ship Step 8 not run from `REPO_ROOT`, no branch assertion.** `bkit-ship.md:654-666` does bare `git checkout dev` (656) then `git pull --rebase origin dev` (662); cwd persists in the feature worktree (`bkit-ship.md:28`); `cd &#34;$REPO_ROOT&#34;` is absent.
      _Example:_ `git checkout dev` failed (dev already used by REPO_ROOT) but `git pull --rebase` still ran on `feat/325-multi-rule-editor`, producing add/add conflicts.
      _Fix:_ run Steps 8–12 from `REPO_ROOT`; assert `git branch --show-current == dev` before pulling.

- [ ] **`bkit-design-summary` writes to the main checkout (recurring).** The orchestrator pins cwd via `dirname &#34;$(git rev-parse … --git-common-dir)&#34;` (`bkit-design.md:538`, idiom also at 301/305/309/350/393/397/446/491), which resolves to the main checkout under a shared git-common-dir.
      _Example:_ design-summary.md written to `$REPO_ROOT/docs/plans/…` (main checkout) instead of the worktree — happened on #46 and again on #106 (self-noted: &#34;prompt pattern not yet fixed upstream&#34;).
      _Fix:_ pin the subagent cwd to an explicit absolute worktree path; drop the `--git-common-dir` idiom.

## P2 — Deterministic control-flow bugs

_Single-site logic errors; the strategy-ladder one degrades **silently**._

- [ ] **Build remediation strategy ladder silently collapses to STANDARD.** `bkit-build.md:568` queries `select(.step==&#34;plan-gaps-remediate&#34;)` but the step is recorded as `&#34;build-plan-gaps-remediate&#34;` (`:588`); same at `:923` (`&#34;failure-diagnose&#34;` vs recorded `&#34;build-failure-diagnose&#34;` `:942`). `PRIOR_STRATEGY` is always `&#34;&#34;`, so it never advances STANDARD→PIVOT→FINAL.
      _Fix:_ match the recorded names (`endswith(&#34;plan-gaps-remediate&#34;)` / add the `build-` prefix).

- [ ] **Design Step 9 matches workstreams by number, not slug.** `bkit-design.md:605-666` keys on `^WS-{N}:` numeric prefix.
      _Example:_ a re-design of #80 would post &#34;now Stack-detect&#34; Update comments onto issues still titled &#34;Workflow Orchestrator&#34; and fire Delete at live lens issues #89–93/#105.
      _Fix:_ match on title slug; on a re-cut, cancel-old-and-create-fresh.

- [ ] **Plan Step 1 routes a pre-flight env precondition to the Failure Path.** `bkit-plan.md:96-97` (`AHEAD&gt;0 → exit 1`) → `:123` Failure Path, which posts `bkit:failed` + a FAILED status.
      _Example:_ `/bkit-plan 143` with local `dev` 2 ahead of origin would label the issue failed for a run that never started.
      _Fix:_ distinguish a pre-flight precondition (halt + ask, no issue-label/status-write) from a workflow failure.

- [ ] **Debug Gate 4 rejects a valid `CONCERNS` verdict.** `bkit-debug-failure-diagnose.md:55-57,62` permit `CONCERNS`, but `bkit-debug.md:527` Gate 4 requires `PASS|FAIL`.
      _Example:_ diagnose wrote `Verdict: CONCERNS` (root cause found, with code-quality caveats) and stalled the gate.
      _Fix:_ remove `CONCERNS` from the diagnose agent&#39;s allowed set (or handle it in Gate 4).

## P2 — Subagent truncation → invalid `Verdict: PENDING`

_Most frequent cluster (8×, both consumers + bkit) but **always orchestrator-recovered** — cost is tokens + a re-invocation, no bad output ships. Cheapest systemic fix: a completion-first / valid-verdict-first directive in the agent prompts, plus extending the existing residual-`PENDING`/empty scan (already at 6 steps) to the steps below._

- [ ] `bkit-plan-update` leaves `Verdict: PENDING` (Apply-Review, `bkit-plan-update.md:41-44`; gate `bkit-plan.md:430-436`).
- [ ] `bkit-plan-update` leaves `Verdict: PENDING` (Apply-Scope, `:43`; gate `bkit-plan.md:527-533`).
- [ ] `bkit-plan-generate` emits a headings-only `PENDING` skeleton; Step-3 gate (`bkit-plan.md:333-335`) checks non-empty only (`bkit-plan-generate.md:36`).
- [ ] Build subagents truncated 4× in one run (plan-execute ×2, challenge-1); gates `bkit-build.md:494-500/703-707` lack a PENDING scan.
- [ ] `bkit-build-plan-execute` cut off before the final task + verdict (`bkit-build-plan-execute.md:40`).
- [ ] `bkit-build-plan-verify` cut off before finalising (`bkit-build-plan-verify.md`; no brevity directive).
- [ ] `bkit-build-summary` cut off before completing the file (`bkit-build-summary.md:35`; gate `bkit-build.md:1064-1068`).
- [ ] `bkit-plan-complexity-split` socket-dropped after 2 of 3 children; Step 9 (`bkit-plan.md:585-627`) + Failure Path do no partial-artifact inspection / scoped re-invoke.

## P3 — Portability &amp; scope papercuts

- [ ] **`:\!` exclusion pathspec fails on macOS git.** `bkit-ship.md:471` uses `git add -- &#39;:\!.DS_Store&#39; …` → `fatal: bad flag in pathspec`. _Fix:_ explicit `git add `.
- [ ] **No `bkit:start..bkit:end` ownership check at plan/design.** Plan/design scope-checks (`bkit-plan-scope-check-1/2.md`) and `.agents/rules.md` carry no marker-ownership guard, so edits land inside bkit-managed doc blocks and are rejected by the drift gate at push.
      _Example:_ #403&#39;s plan scoped edits to `docs/deployments.md`/`docs/testing.md` sections that live inside `…`; `pnpm bkit check` rejected the divergence at push. _Fix:_ check marker ownership before scoping doc edits; route consumer content below `bkit:end`.

---

<sub>Generated from friction reconciliation. Once an item ships, the matching friction entry is already removed from `.bkit/friction.md` (tracked here instead).</sub>

### Comment 2026-06-01T09:13:36Z

## Progress — wave 1 + actionlint (all in working tree, not yet committed)

All gates green: typecheck ✓ · **test 1196 passed** ✓ · format ✓ · vale ✓ · slop ✓ · `actionlint` ✓ · `bkit check` ✓.

### Fixed this pass

**P0 — Release/CI integrity**

- ✅ **Pre-push masks test failures** — `set -e` in `.husky/pre-push` (+ template) so a mid-script failure blocks the push.
- ✅ **Ship merges red squash** — gate now fails on `conclusion==failure` (run + bkit-tests job), not only cancelled/skipped (`bkit-ship.md`).
- ✅ **Ship merges red PR** — statusCheckRollup query error/403 → Failure Path (never silent pass).
- ✅ **Stale `dist/` commits** — pre-commit guard runs `check:dist` when `.bkit/src/*.ts` is staged.
- ✅ **Invalid GHA expression / no actionlint** — see the dedicated section below.

**P2 — Control-flow**

- ✅ **Strategy ladder stuck on STANDARD** — `PRIOR_STRATEGY` / `failure-diagnose` queries now match the recorded `build-`/`debug-` step names (fixed in **both** build and debug).
- ✅ **Diagnose `CONCERNS` rejected by gate** — kept `PASS|CONCERNS|FAIL` in the agent; taught Gate 4 (debug) + Gate 14 (build) to accept `CONCERNS`. It's observational (never branches flow) and surfaces in the step's tracker comment as the reviewer's cue to check debugging logic / rot.

**P3**

- ✅ **`:\!` pathspec breaks on macOS** — portable `:(exclude)` form in `bkit-ship.md`.

### actionlint (and a real bug it caught)

- Added a **`Run Actionlint`** step to bkit's `.github/workflows/ci.yml` **and** the consumer template `.bkit/templates/.github/workflows/ci.yml` (pinned `actionlint` v1.7.12, self-contained download+run), plus a `lint:workflows` script wired into bkit's pre-push.
- On first run, actionlint immediately caught a **shipped bug**: `bkit-cloud.yml`'s auto-route `if:` gate was a `|` block scalar wrapping `${{ }}` → GitHub Actions evaluates it to a non-empty string = **always true**, so the free-tier `bkit [auto route]` gate never fired (the job ran on every triggering event). Present in **both** bkit's own copy and the shipped template → affected every cloud consumer.
  - **Fixed** both to `if: >-` folded (no `${{ }}` wrapper). actionlint now clean.
- Because `ci.yml` / `bkit-cloud.yml` are **Tier-3 seed-or-print** (an existing consumer's copies are not rewritten by `bkit install`), added two **upgrade advisories** (`bkit-postinstall.ts`, +7 unit tests) that detect the stale state and hand the consumer the exact inline fix:
  - `bkit-cloud-yml-always-true-gate`
  - `ci-yml-missing-actionlint`

### Still open (not started)

P1 concurrency & shared-clone (×6), P1 worktree-path resolution (×2), P2 design Step 9 re-cut + pre-flight env, P2 subagent-truncation cluster (×8 — approach decided: gate-scan + completion-first), P3 marker-ownership.

_Nothing committed/pushed yet — changes are staged in the dev working tree for review._

### Comment 2026-06-01T09:21:20Z

## Wave 2 — batch 1: switch-to-dev safety (working tree, uncommitted)

- ✅ **P1 — Ship Step 8 ran from the feature worktree** (#13): the `## Step 8 — Switch to Dev` block now defines `REPO_ROOT`, `cd`s into it, and asserts `git branch --show-current == dev` before any pull — so a failed `git checkout dev` can no longer let `git pull --rebase` run on the feature branch (the add/add-conflict failure mode).
- ✅ **P1 — `core.bare` flip blocks the merge** (#4): added a guarded self-heal — `[ core.bare = true ] && [ -d $REPO_ROOT/.git ] && git config core.bare false` — at all three `git checkout dev` sites (ship Step 8, plan close, design close), so a spuriously-flipped `core.bare` on a non-bare repo is reset before the dev ops instead of erroring with `must be run in a work tree`.

Wave 1 was committed locally as `de2403e` (not pushed). Gates green: `bkit check` ✓ · format ✓ · vale ✓ · **test 1196 passed**.

Still open: P1 git-add FID-scoping (#34/#23/#41), sibling-commit warn (#16), ship rebase robustness (#24/#37), P1 design-summary worktree path (#29/#43), P2 design Step 9 re-cut (#3), P2 truncation cluster ×8, P3 marker-ownership.

### Comment 2026-06-01T09:27:18Z

## Wave 2 — batch 2: truncation detection (working tree, uncommitted)

✅ **P2 — Subagent truncation → `Verdict: PENDING`** (the 8-entry cluster), **gate-scan half**: added the verbatim `- [ ] No PENDING placeholders remain (...)` gate to the 7 verdict-bearing steps that lacked it:

- plan Step 3 (plan-generate), Step 5 (apply-review), Step 7 (apply-scope), Step 9 (complexity-split), Step 10 (summary)
- build Step 5 (plan-execute), Step 16 (summary)

That's the friction's core gap closed — _"the gap is caught only by an explicit PENDING scan"_ — every verdict-bearing step now scans (17 such gates total, up from 10). Reused the exact existing gate wording/placement per the workflow authoring rules.

**Deferred** (soft half): a completion-first directive across the 8 agent prompts. No existing phrasing to reuse and detection is now reliable, so this is an optional follow-up rather than load-bearing.

Gates green: `bkit install` ✓ · `bkit check` ✓ · format ✓ · vale ✓ · **test 1196 passed**. Uncommitted.

Remaining wave 2: P1 git-add FID-scoping (#34/#23/#41), sibling-commit warn (#16), ship rebase robustness (#24/#37), design-summary worktree path (#29/#43), P2 design Step 9 re-cut (#3, needs sign-off), P3 marker-ownership.

### Comment 2026-06-01T09:32:59Z

## Wave 3 (in progress) — pre-worktree git-add FID-scoping (working tree, uncommitted)

✅ **P1 — `git add docs/plans/` sweeps a concurrent run's status** (#34, #23, and the OPEN #41): the pre-worktree Step-2 commit in plan/design/build now stages `git add docs/plans/{YYYYMM}/logs/{FID}/ .bkit/friction.md` instead of the whole `docs/plans/` tree — so a concurrently-active run's untracked status under another `{FID}` can no longer be swept into this run's commit. Updated the §Pre-worktree git scope rationale in `workflows.md` to match.

**Flagged for separate review:** `bkit-ship.md` Step 2's pre-worktree commit uses an even broader `git add docs/` (not `docs/plans/`) — a wider version of the same hazard, outside the three sites the friction named. Left as-is pending your read on whether ship intentionally needs that breadth.

Gates green: `bkit install` ✓ · `bkit check` ✓ · format ✓ · vale ✓ · **test 1196 passed**. Uncommitted (wave 1 `de2403e` + wave 2 `9e4cb95` are the commits, both local).

Still open: sibling-commit warn (#16), ship rebase robustness (#24/#37), design-summary worktree path (#29/#43 — subtle, needs care), design Step 9 re-cut (#3 — needs sign-off), marker-ownership (#14/#17), truncation completion-first directive (soft).

### Comment 2026-06-01T10:01:25Z

## Wave 4 (in progress) — marker-ownership scope-check (working tree, uncommitted)

✅ **P3 — edits landing inside bkit-managed doc blocks** (#14/#17): added a check to **both** plan scope-check agents (`bkit-plan-scope-check-1`/`-2`, parallel verifiers) — any plan task that scopes an edit INSIDE a `bkit:start`…`bkit:end` managed block of a shipped doc (`docs/deployments.md`, `docs/testing.md`, `docs/knowledge.md`, `.agents/rules.md`, `.github/renovate.json5`) is now flagged **CRITICAL**, with the instruction that consumer/divergence content goes BELOW the `bkit:end` marker. Catches the #403 push-blocking drift class at plan time instead of at push.

Gates green: `bkit install` ✓ · `bkit check` ✓ · format ✓ · vale ✓ · **test 1196 passed**. (Design phase has no scope-check — design-review is a separate, lower-priority add.)

Commits so far (local, unpushed): wave 1 `de2403e`, wave 2 `9e4cb95`, wave 3 `b0d792d`.

### Remaining — all need a decision or careful investigation

- **design-summary worktree path (#29/#43)** — subtle: the `dirname git-common-dir` idiom across 9 design invocation sites; warrants its own focused pass.
- **design Step 9 re-cut (#3)** — needs your sign-off.
- **ship's broad `git add docs/`** — needs your intent call (wider than the three FID-scoped sites).
- **ship rebase robustness (#24/#37)** — moderate; touches the merge-retry loop.
- sibling-commit warn (#16) — low-value warning; truncation completion-first directive — soft/optional.

### Comment 2026-06-01T10:37:00Z

## Status update — #3 skipped; ship-rebase done (uncommitted); design-summary needs a call

**SKIPPED — design Step 9 re-cut (#3):** maintainer decision. The slug-match change was drafted and discarded; not pursuing. Tracker reconciliation is high-blast-radius and any change would warrant its own design review. Leaving the existing `WS-{N}` numeric matching as-is.

**DONE (uncommitted, for review) — ship rebase staleness (#24/#37):** ship Step 5 now re-fetches `dev` and runs `gh pr update-branch {PR_NUMBER}` (merges base into the PR head — **no force-push**, respecting ship's no-force rule) right before each `gh pr merge` attempt, so a base that moved during the ship window can't fail the squash. Best-effort (`|| true`) — a conflicted update falls through to the existing diagnose/remediate loop. gh CLI chosen for consistency with ship's existing `gh pr merge` flow.

**Investigated — design-summary main-checkout (#29/#43):** clarified the model — `status.jsonl` is dev-located, but design DOC artifacts are still **worktree-located** (every design subagent `cd`s into `.worktrees/{FID}`). So summary-to-main-checkout would still be a real bug. Root cause looks like the subagent `Context:` `cd` strings using the fragile `dirname git-common-dir` idiom even though the orchestrator already computes an explicit `WORKTREE_PATH` at Step 2. The clean fix (use `{WORKTREE_PATH}` in the Contexts) is the same idiom across **all** subagent invocations in **all** workflows — cross-cutting — so holding for a maintainer call: scoped (design only) vs full (all workflows) vs skip.

Commits remain local/unpushed: waves 1–5 (`de2403e`, `9e4cb95`, `b0d792d`, `e16384d`, `c0ccc42`). Design Step 9 (wave 6) was discarded.

### Comment 2026-06-01T11:42:35Z

## Update — design-summary skipped→#209; ship-rebase committed

**SKIPPED — design-summary main-checkout (#29/#43):** maintainer decision. It turned out to be a symptom of a larger inconsistency: design/plan `status.jsonl` is still **dev-located** in the code (`bkit-design.md:25,55`; `workflows.md:174`) whereas the intended model is **feat-located** (status + generated docs on `feat/{FID}`, squash-merged to dev at close; only comment-block doc links hard-code dev). That's the unfinished **#209 §3 feat-relocation** — documented there and **#209 re-opened**. The `bkit-design-summary` worktree-path bug is folded into that work, not fixed here.

**DONE — ship rebase staleness (#24/#37):** committed `4c785cc` — Step 5 re-fetches `dev` + `gh pr update-branch` (no force-push) before each merge attempt.

**Remaining in #216:** only two minor items — sibling-commit warn (#16, low-value, and it touches the close-workflow push that #209 will restructure) and the truncation completion-first directive (soft; detection is already reliable via the gate-scan). Everything substantive is fixed or migrated.

Commits (local, unpushed): `de2403e`, `9e4cb95`, `b0d792d`, `e16384d`, `c0ccc42`, `4c785cc`.

### Comment 2026-06-01T11:49:10Z

## Rejected — truncation completion-first directive

Proposed a `Contract:` bullet for the 8 truncation-prone agents (`bkit-plan-generate`, `bkit-plan-update`, `bkit-build-plan-execute`, `bkit-build-plan-verify`, `bkit-build-summary`, `bkit-build-challenge-1`/`-2`, `bkit-plan-complexity-split`), inserted after each `**Mandate:**`:

> `- **Completion-first:** Produce a complete first-pass draft of every output section early, then refine; do NOT exhaustively explore before the first full pass.`

**REJECTED** (maintainer). The gate-scan already makes truncation reliably detected/recovered, so this soft directive isn't worth the added prompt surface.

---

## Closing — friction backlog resolved

**Fixed (6 waves, local/unpushed `de2403e` `9e4cb95` `b0d792d` `e16384d` `c0ccc42` `4c785cc`):**

- P0 — pre-push `set -e`; ship squash gate `conclusion==failure`; ship statusCheckRollup error→fail; pre-commit dist guard; actionlint (bkit + consumer ci.yml) + the **`bkit-cloud.yml` always-true `if:` gate** bug it caught + 2 upgrade advisories.
- P1 — pre-worktree git-add FID-scoping (plan/design/build/ship); ship Step 8 from `REPO_ROOT` + branch assert; `core.bare` self-heal; ship PR-head refresh (`gh pr update-branch`, no force-push).
- P2 — `PRIOR_STRATEGY`/`failure-diagnose` query step-names (build+debug); diagnose `CONCERNS` accepted by gates; truncation **gate-scan** (`No PENDING placeholders remain` on 7 more steps).
- P3 — `:(exclude)` pathspec; plan scope-check rejects edits inside `bkit:start`/`bkit:end` blocks.

**Migrated → #209 (re-opened):** design/plan `status.jsonl` feat-relocation (§3) incl. the design-summary worktree-path bug (#29/#43); sibling-commit warn (#16, rides the close-workflow restructure).

**Skipped:** design Step 9 re-cut (#3). **Rejected:** completion-first directive.

Done — closing.

### Comment 2026-06-01T12:13:56Z

## Follow-up — actionlint CI gate red-dev'd on a shellcheck finding; fixed

After pushing waves 1–6, the **first CI run with the new actionlint gate failed** (run `26753181952`). Not the `if:` bug (that's fixed) — actionlint runs **shellcheck** on `run:` blocks, and the CI runner preinstalls shellcheck while local macOS does not, so the gate **passed locally but failed in CI**:

> `bkit-cloud.yml:133` → `SC2129 (style)`: trailing `echo … >> "$GITHUB_OUTPUT"` lines should be grouped.

**Fix (committed `294af01`, local-only/unpushed):**

- Grouped the redirects into `{ …; } >> "$GITHUB_OUTPUT"` in **both** bkit's own `.github/workflows/bkit-cloud.yml` and the shipped template. `brew install shellcheck` locally + re-ran actionlint → **exit 0**, and confirmed no other shellcheck findings hiding.
- Added a vale-style advisory **`workflow-lint-tools-missing`** (`bkit-postinstall.ts` + test) that recommends local `actionlint` + `shellcheck` (`brew install actionlint shellcheck`) for pre-push parity — bkit does **not** auto-install these binaries (same precedent as vale).

**Decision recorded:** kept the full actionlint+shellcheck gate (didn't disable shellcheck), and closed the local/CI gap via the advisory rather than weakening the gate. Pushing `294af01` greens dev CI.

### Comment 2026-06-01T12:14:50Z

## Cross-reference — design-summary (#29/#43) now being implemented under #209

The earlier "skipped → #209" entry for the design-summary worktree-path bug (#29/#43) is now **actively in progress**: a separate #209 process has the fix in the working tree (uncommitted; that process will commit it).

The change is exactly the root-cause fix called out here — it replaces the fragile `dirname git-common-dir` idiom with an orchestrator-resolved **`{WORKTREE_PATH}`** placeholder across **all** subagent `Context:` cwd sites in **all** workflows (build/debug/design/plan/ship):

- Execution-Protocol `{PLACEHOLDERS}` now lists `{WORKTREE_PATH}` = _"absolute worktree path set at worktree setup, required for subagent `Context` cwd."_
- Every subagent invocation `cd "$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/.worktrees/{FID}"` → `cd "{WORKTREE_PATH}"`.

So #29/#43 is resolved as part of the #209 §3 feat-relocation work, not dropped. No #216 action remains — this is just the record linking the two.

---

## #77 — Debug agent should consume gcp logs better (closed)

**Linear:** [BAR-194](https://linear.app/bartens/issue/BAR-194) · **Created:** 2026-05-13 · **Linear assignee:** christian@bartens.biz

---

## Problem

Debug workflow only fetches CI failure logs when `DEBUG_MODE=pr` (`.agents/workflows/bkit-debug.md:202-204` — `gh run view --log-failed` inlined into `debug-input-*.md`). For `DEBUG_MODE=local`, `CI_LOGS = &#34;N/A&#34;`. No path fetches **runtime** logs (application errors from deployed env via GCP / log drain) under any mode.

As a result, the diagnose subagent has no runtime evidence for deployed-app failures (error boundaries, 500s, MISSING_MESSAGE, unhandled exceptions) and must hypothesise from code alone — the failure mode seen on [BAR-192](https://linear.app/bartens/issue/BAR-192/unexpected-error-when-loading-family-page).

Secondary issue: CI logs are inlined into `debug-input-{N}.md` (the session-prompt envelope), conflating &#34;prompt context&#34; with &#34;fetched evidence&#34; and making it awkward to add a parallel runtime-logs source.

## Mental model

**CI logs** (gh actions output) and **runtime logs** (application errors from deployed env) are orthogonal sources, not mode-keyed alternatives. A given debug session may need either, both, or neither.

| Scenario                                | CI fetch runs?      | Runtime fetch runs? |
| --------------------------------------- | ------------------- | ------------------- |
| PR mode, GCP configured                 | yes                 | yes                 |
| Local mode, push exists, GCP configured | yes                 | yes                 |
| Local mode, no GCP                      | only if push exists | no                  |
| PR mode, no GCP                         | yes                 | no                  |
| Nothing available                       | no                  | no — both `N/A`     |

## Scope (bkit only)

Two changes in `bkit/`. Gether-side companion work (populating `docs/observability.md` with a fetch block + `docs/knowledge.md` entry) is **out of scope** — tracked separately.

### 1\. New orchestrator step: `Fetch Logs`

File: `.agents/workflows/bkit-debug.md`.

Insert a new orchestrator step between current Step 2 (Worktree Setup) and current Step 3 (Failure Diagnose). One step, two independent sub-fetches.

#### Sub-fetch A — CI logs

- **Source:** `gh run view &#34;$RUN_ID&#34; --log-failed`.
- **Precondition:** `gh run list --branch $BRANCH --limit 1` returns a run ID whose status is **not** `success`.
- **Runs in:** any mode (currently PR-only — extending to local mode after pushes have the same need).
- **Skip case:** no CI run found, or latest run passed → write `## CI Logs\nN/A` to artifact section.

#### Sub-fetch B — Runtime logs

- **Source:** consumer-defined query from `docs/observability.md` &#34;Debug fetch&#34; block.
- **Precondition (ALL must hold):** `docs/observability.md` has a structured &#34;Debug fetch&#34; block AND `gcloud` binary available AND `gcloud auth print-access-token` succeeds.
- **Runs in:** any mode.
- **Skip case:** any precondition fails → write `## Runtime Logs\nN/A` to artifact section.

#### Artifact

Single file `docs/plans/logs/{FID}/debug-logs-{DEBUG_ATTEMPT}.md` with two sections, always present (even if both `N/A`):

```
## CI Logs
[gh run view output, or N/A]

## Runtime Logs
[gcloud query output, or N/A]
```

Always-exists artifact keeps the subagent&#39;s glob read deterministic.

#### Common behaviour

- Both sub-fetches **fail-soft**. Never gate the workflow on a fetch error; log to `.agents/friction.md` and continue with `N/A` for the affected section.
- Single status.json entry: `step: &#34;fetch-logs&#34;`, `parentSha`, artifact link.
- Single Linear-comment line: `### Step 3 — Fetch Logs - CI: {present|N/A} - Runtime: {present|N/A}`.
- Single commit: `chore({FID}): fetch-logs`.

#### Concomitant changes to existing Step 2 (Worktree Setup)

- Drop the `gh run view --log-failed` block at lines 202–204.
- Drop the `CI_LOGS` inlining into `debug-input-{DEBUG_ATTEMPT}.md`.
- Move `RUN_ID` extraction into the new step (keeps fetch logic colocated).
- `debug-input-*.md` returns to session-prompt envelope only: `DESCRIPTION`, `COMMENTS`, plan reference.

#### Renumbering churn

Current Steps 3–11 shift to Steps 4–12. Gate numbers shift to match. Status.json `step` field values are stable strings — no migration needed. New step gets stable name `fetch-logs`.

#### Design constraints

- Query template lives in **consumer** `docs/observability.md`, never in bkit. No project IDs / logNames hard-coded in bkit.
- Reuse existing observability scaffold (`.agents/templates/docs/observability.md`); extend its structure to host the fetch block.
- Document the new block schema in the template so consumers know what to populate.

### 2\. Subagent prompt updates

Two prompts touched. Audit complete: `bkit-debug-failure-remediate`, `bkit-debug-summary`, `bkit-debug-observe-instrument` (writes instrumentation only — does not consume logs), `bkit-debug-observe-revert`, and `bkit-debug-abort-handover` need **no** changes.

#### `bkit-debug-failure-diagnose.md`

- **Line 48 — Step 9** (`Read .agents/docs.md § Observability for filter syntax (logging, traces, CDC)`): reframe purpose from &#34;issue queries&#34; → &#34;interpret correlation IDs / log schema in pre-fetched logs.&#34; Drop entirely if redundant after the new Read addition.
- **Line 49 — Step 10** (`Investigate logs, stack traces, failing tests, deployment/runtime exceptions`): keep; explicitly point at the new `debug-logs-*.md` glob as the source.
- **Line 116 — Observe block format** already says &#34;concrete output; do NOT paraphrase&#34;. Strengthen to make explicit that stack traces, error messages, and log lines from `## CI Logs` and `## Runtime Logs` sections MUST be quoted verbatim — paraphrase is not acceptable.
- **Line 51 — Step 12** (`gh run list --branch dev --status success`): **unchanged**. This is commit-range narrowing for last-green delta, not log-fetch.
- **Orchestrator-side** (`.agents/workflows/bkit-debug.md` Step 4 — renumbered Failure Diagnose): add `glob docs/plans/logs/{FID}/debug-logs-*.md` to the Read list passed to the subagent. Not a prompt edit.

#### `bkit-debug-observe-analyse.md`

- **Line 43 — Step 6** (`Read CI/CD logs from input Context (NEVER /tmp/)`): reframe to &#34;Read CI/runtime logs from `debug-logs-*.md` glob (orchestrator-provided).&#34; Input Context no longer carries them.
- **Line 100 — Observe block** already says &#34;do NOT paraphrase&#34; for `[DEBUG-OBSERVE]` values. Extend the same rule to log-line quotes pulled from `debug-logs-*.md`.
- **Orchestrator-side** (`.agents/workflows/bkit-debug.md` Step 10 — renumbered Observe Analyse): add `glob docs/plans/logs/{FID}/debug-logs-*.md` to the Read list passed to the subagent. Not a prompt edit.

No gcloud / gh branching logic in any subagent — orchestrator handles all fetching.

## Out of scope (note, do not action here)

- **PENDING self-gate in subagent:** orchestrator Gate already enforces no-PENDING placeholders. Adding subagent-side self-policing duplicates the gate and risks the worse failure of &#34;agent self-FAILs rather than investigate further.&#34; Not changing.
- **Gether-side observability fetch block** + `docs/knowledge.md` entry (&#34;Deployed-app runtime errors → GCP log drain is authoritative; never diagnose from code alone before pulling logs&#34;). File separately against the gether-life repo once bkit schema lands.
- **Verdict-enum inconsistency on Failure Diagnose gate** (`PASS|FAIL` in gate vs `PASS|CONCERNS|FAIL` in subagent output). Pre-existing, unrelated bug — file separately.

## Acceptance

- `debug-logs-{DEBUG_ATTEMPT}.md` always exists after Step 3, with `## CI Logs` and `## Runtime Logs` headers present.
- PR mode with a failed CI run → `## CI Logs` populated with `gh run view --log-failed` output.
- Any mode with populated `docs/observability.md` + `gcloud` authed → `## Runtime Logs` populated with query output.
- Either source missing its precondition → that section reads `N/A`; workflow proceeds without error.
- `debug-input-*.md` no longer carries CI logs.
- Diagnose subagent reads the new artifact and quotes lines verbatim from both sections under `#### Observe`.
- Observe-analyse subagent reads the new artifact instead of input Context.
- Status.json contains a `fetch-logs` step entry with `parentSha` and artifact link.

## Related

- [BAR-192](https://linear.app/bartens/issue/BAR-192/unexpected-error-when-loading-family-page) (root motivation — diagnosis from code alone failed because runtime logs weren&#39;t surfaced)

**Links:**

- **Related:** [BAR-192](https://linear.app/bartens/issue/BAR-192) _(not imported)_

### Comment 2026-05-21T07:13:36Z

**@christian (Linear, 2026-05-14):**

[https://github.com/cbartens/bkit/commit/83847de57128302692b0f510353f53ba1eedb261](<>)

---

> [bkit] One clamp applied: #56 comment 3 was a long verbatim `/bkit-build bar-93` run transcript; the findings table and the motivating conclusion are reproduced verbatim, the step-by-step tool log is not. Nothing else was condensed. All 7 issue bodies and every other comment are verbatim.
