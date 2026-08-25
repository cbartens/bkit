# Design Brainstorm & Ideas

Lens: Pragmatic — existing code, minimal new infra, ship fastest.
Assigned emphasis: **Task 4 — synthesiser dedup→correlate.** Tasks 1/2/3/5 covered in § Decisions.

> **Scope guard.** Nothing here proposes an alternative to the 10-step shape, the enrichment model, the
> conditional-lens keystone, the reference-signal down-rank contract, or the escape hatches. The finding
> block stays the YAML-fenced Pass-2 schema; the only schema motion considered is **additive optional
> fields**, which is the extension mechanism the schema already sanctions (Pass 2 permits `lenses`,
> `lenses_expected`, `correlation_id`; Pass 3 added `source:` and explicitly REJECTED a migrating
> `tier:` field for that reason — 80-design § Approaches Considered).

## The constraint that decides Task 4

The three legs of the silent-corruption composition are **not co-located**:

<!-- prettier-ignore -->
| Leg | Lens | Natural `location:` | Class |
| --- | --- | --- | --- |
| "subject S is privilege-restricted" | `contract-conformance` (WS-C) | grant/policy/migration declaration | security |
| "write to S discards its outcome" | `reliability` (WS-B) | request-path write site in product code | reliability |
| "S's critical path is mock-collapsed" | `tests` (WS-B) | a test file | testability |

Three files, three classes. The shipped dedup key `(class, normalized_location)` with a 5-line bucket
**cannot express this join** — it is same-location/same-class by construction, and the Pass-2 cross-class
pass (shared `correlation_id`) is same-location/different-class. Correlation therefore needs a **join
dimension that is not location**. That is the whole design question; everything else in Task 4 follows.

Second constraint: the join must be expressible without naming a stack. The vocabulary is **subject**
(an addressable resource: a store, queue, endpoint, job) and **signal** (what a lens observed about it) —
both stack-agnostic, both greppable, neither naming a product.

---

## Approach A — Subject-keyed declarative correlation pass inside the synthesiser ⭐ Recommended

**Summary.** Add two additive-optional lens-authored fields — `subject:` (normalized resource key,
`{kind}:{name}`) and `signal:` (controlled token from a per-lens vocabulary) — and run a declarative,
rule-table-driven correlation pass **after** dedup inside `bkit-audit-synthesise`, emitting composed
findings into a new `## Correlated Findings` section plus a per-rule `## Correlation Coverage` manifest
that is a structural twin of `## Missing Lenses`.

**Inputs (the contract this pins on WS-B and WS-C).**

- `subject:` — emitted by any lens whose finding is _about a named resource_. Value `{kind}:{name}`,
  kind from a documented open set (`store`, `queue`, `endpoint`, `job`, `flag`); name casefolded,
  non-alphanumerics collapsed to `_`. Absent ⇒ finding is un-correlatable, never an error.
- `signal:` — controlled token naming the observation, e.g. `restricted-subject`,
  `unchecked-write`, `non-discriminating-test`, `dual-source-writer`. Declared per lens in WS-B/WS-C,
  unioned into a canonical enum whose home is the `bkit-audit.md` Step-6 inline block — reusing the
  R1-B1 single-source-of-truth pattern already used for the slug enum, with the same plan-time
  grep-assert on the synthesiser's derived copy.
- Existing fields the rule also reads: `lenses:` (post-dedup provenance), `class:`, `severity:`,
  `confidence:`, `source:`, `location:`.

**Identifier divergence (three lenses, three names for one store).** Two-tier resolution, cheapest first:
(1) normalized exact match on `{kind}:{name}`; (2) alias resolution through `subject-aliases:` — an
optional single-line field the _derivation_ lens emits (`contract-conformance` already builds the grant
matrix and enumerates every write site, so it is the only lens that empirically knows
`occurrence_cache == occurrenceCache == cache client handle X`). No new artifact, no new agent: the
alias map rides the finding block that already exists. If no alias field is present, unmatched subjects
are reported, not guessed — see `unevaluable (no subject match)` below.

**Rule table (canonical: `bkit-audit.md` Step 6; derived copy in the synthesiser prompt).**

<!-- prettier-ignore -->
| rule id | subject kind | required legs (lens · signal) | amplifier legs | severity | class |
| --- | --- | --- | --- | --- | --- |
| `silent-corruption-candidate` | `store` | `contract-conformance · restricted-subject` + `reliability · unchecked-write` | `tests · non-discriminating-test` | CRITICAL with amplifier, HIGH without | reliability |

Required/amplifier split is load-bearing: the _harm_ is (restricted subject × discarded write outcome);
the tests leg explains _why it stayed green_ and raises severity but is not a precondition. It also
absorbs the 25-finding-per-lens cap risk — a severity-sorted cap can plausibly drop a MEDIUM tests
finding, and dropping an amplifier degrades severity instead of silently deleting the correlation.

**Ordering — correlate AFTER dedup.** (a) Dedup collapses six write sites for one store into one
reliability entity, so correlation fires once per subject rather than six times; (b) dedup is what
populates `lenses:` provenance, which leg identity reads; (c) the R2-O1 reference-signal drop already
runs pre-dedup, so by correlation time no external-signal block is in the pool. Pipeline:
parse → R2-O1 post-process → dedup → **correlate** → render manifests.

**Output shape — compose additively, never destructively.** Legs are retained at their own severity and
locations (the reader still needs the six write sites), and gain the shared `correlation_id`; the composed
finding is a normal `finding` block plus three synthesiser-authored optional fields:

````markdown
```finding
severity: CRITICAL
class: reliability
location: src/actions/occurrence.ts:88
subject: store:occurrence_cache
what: silent-corruption candidate — outcome-discarding write into a privilege-restricted store
why: Composition of three lens findings; no single lens observes it
direction: Check the write outcome; re-grant or re-route the caller; make the test discriminate
confidence: high
composed: silent-corruption-candidate
legs: contract-conformance=present@db/policy.sql:12; reliability=present@src/actions/occurrence.ts:88; tests=absent
correlation_id: corr-3
```
````

`composed:` and `legs:` are written by the synthesiser only — **the lens-side contract change is exactly
two optional fields.** `legs:` obeys the existing ≤200-char single-line schema constraint. Composed
findings render in a dedicated `## Correlated Findings` block above the ranked list, so they do **not**
double-count in the severity×class matrix (legs are counted once, as atoms). Confidence is not invented:
reuse the shipped rule — `min(leg confidences)` upgraded one tier on cross-lens confirmation — which
guarantees a multi-leg composed finding never lands at `confidence: low` and so never trips the
down-rank fence into demotion. `source: reference-repo` findings are **ineligible as legs**: external
signal must not be launderable into a top-slot red finding.

**Partial correlation + degradation — the false-all-clear half.** Per-leg state uses the keystone's own
three-state vocabulary: `present` · `absent` (lens ran, no matching finding) · `unobserved` (lens is
`N/A — not applicable` or `crashed` or operator-excluded). Policy: required legs all `present` ⇒ emit;
a required leg `absent` ⇒ no composed finding and no noise; a required leg `unobserved` ⇒ **no composed
finding but a mandatory coverage row.** A rule that cannot fire because a leg's lens never ran is exactly
the false-all-clear the keystone exists to prevent, one level up, so it gets the same treatment:

```markdown
## Correlation Coverage

- silent-corruption-candidate: fired (2)
- derived-data-divergence: unevaluable (derived-data: N/A — not applicable (hasDerivedStore=false))
```

State tokens `fired (N)` | `no match` | `unevaluable (`, one row per declared rule id, validated by a
Step-6 grep-assert cloned from the existing row-per-slot assert (same shape, same failure handling:
first absence re-issues with a tightening prompt, second absence ⇒ Failure Path). Verdict mapping:
`unevaluable` caused by `N/A — not applicable ({flag}=false)` ⇒ PASS (a repo with no store genuinely
cannot silently corrupt one — bkit's dogfood run reads this way); `unevaluable` caused by `crashed`
⇒ CONCERNS; `unevaluable (excluded by [lenses=...] operator)` ⇒ CONCERNS, so the escape hatch cannot
silently disable correlation; `unevaluable (no subject match)` when all leg lenses ran but no subject
resolved ⇒ CONCERNS, which is what catches a lens that forgot to emit `subject:`.

**Complexity:** MEDIUM. Two optional fields, one post-dedup pass, one rule table, one manifest section,
one cloned grep-assert. No new agent, no new step, no new artifact file.
**Extensibility:** HIGH. `derived-data`'s dual-source rule (two writers, one subject, different files)
is a second row in the same table with no mechanism change — and it is the reason `signal:` is worth
paying for now rather than retrofitting into already-authored lens prompts later.
**Risk:** a contributing lens omits `subject:`/`signal:` and correlation silently never fires. Mitigated
structurally by the `unevaluable (no subject match)` row (silence becomes a visible state) and by making
"emits `subject:` + declared `signal:` on eligible findings" a WS-B/WS-C acceptance criterion with a
fixture grep-assert, not prose.
**Maintenance:** one enum + one rule table under the existing R1-B1 sync assert; adding a rule is a
one-row edit in two files that the assert keeps honest.
**Reuse vs new:** reuses the finding fence, the additive-optional-field precedent, `correlation_id`,
the cross-lens confidence-upgrade rule, the three-state coverage vocabulary, the row-per-slot grep-assert
pattern, R1-B1 canonical-enum-plus-derived-copy. Net-new: two lens fields, two synthesiser fields, one
report section, one manifest section.

## Approach B — Location-anchored correlation reusing the existing `correlation_id` cross-class pass

**Summary.** No subject vocabulary. Each contributing lens adds one optional `related:` field citing the
**product-code** location it concerns (`related: src/actions/occurrence.ts:88`); the synthesiser widens
the shipped cross-class pass so findings sharing a normalized location bucket across the rule's declared
classes compose into one finding under the shared `correlation_id` they already receive.

**Complexity:** LOW — the join code path exists verbatim (Pass-2 § Synthesis step 4); the delta is a rule
table plus a render section.
**Extensibility:** LOW. It cannot express any rule whose legs are inherently _not_ co-located —
`derived-data`'s "two independent writers of one derived store" is two locations by definition, so the
next rule needs Approach A anyway. It also cannot express "the subject is restricted" at all: a grant
declaration has a location, but its location has nothing to do with the write site.
**Risk:** silent non-fire through bucket mismatch. The conformance leg must cite every write site to
join (multiplying its findings), and the tests leg's "product location it is about" is a judgement call
per finding. Worse than A's failure mode because there is no subject to report as unmatched — the
degradation is invisible, which is precisely the failure class in scope.
**Maintenance:** LOW day-to-day, but a future change to the 5-line dedup bucket silently changes
correlation behaviour, because dedup and correlate share one code path.
**Reuse vs new:** maximal reuse (one optional field, zero new join machinery); net-new is only the rule
table and the render section.

_Best use: keep B as A's **fallback join** — when `subject:` is absent on both legs but locations bucket
together, compose at reduced confidence and mark the leg `present (location-matched)`. Cheap, and it
softens A's forgot-to-emit failure._

## Approach C — Dedicated correlation agent reading lens artifacts as prose

**Summary.** Leave the finding schema completely untouched. Add a second sequential agent inside Step 6
(`@bkit-audit-correlate`, after `@bkit-audit-synthesise` — inside the existing step, since an 11th step
would be an architecture change and is out of bounds) that reads the lens artifacts and the synthesis and
reasons semantically over `what:`/`why:` prose to compose the write-up a human would have composed.

**Complexity:** MEDIUM-HIGH — new agent, new `.bkit/prompts.md` § Models row, new tool-set row, new
artifact, new Step-6 sub-gate, subagent count 23 → 24.
**Extensibility:** HIGH in principle (any composition a reader can describe), but the "rule" is prose
and therefore not reviewable, not diffable, and not assertable.
**Risk:** non-determinism. Two runs on the same repo produce different compositions; nothing can be
grep-asserted, so the down-rank/coverage discipline that the entire design leans on has no purchase here.
The composed finding also cannot honestly report _why_ it did not fire, which forfeits the false-all-clear
protection that is the point of the exercise.
**Maintenance:** highest — a prompt-tuning surface with no test hook, plus a per-run token cost on top of
an already 23-subagent fan-out.
**Reuse vs new:** reuses the reviewer skeleton only. Its one genuine merit, worth recording: it requires
**zero** contract handshake with WS-B/WS-C, so it could ship in a later minor than the lens layer without
re-editing lens prompts.

---

## Decisions

<!-- prettier-ignore -->
| Decided | Alternatives | Why |
| --- | --- | --- |
| **T4 · Approach A** — subject-keyed declarative correlation in the synthesiser, with B's location join as fallback | B (location-anchored), C (correlation agent) | The legs are structurally non-co-located; only a subject join expresses the shipped rule, and only a rule *table* stays reviewable. B cannot express rule #2 (`derived-data`); C forfeits every machine-enforceable guarantee the design is built on. |
| **T4 · Two lens-authored optional fields** — `subject:`, `signal:` | one field (`subject:` only, predicate inferred from `what:` prose); a required field on all lenses | Additive-optional is the sanctioned extension path (`source:` precedent; migrating `tier:` was REJECTED). `signal:` is not YAGNI-violating: `derived-data` gives `reliability` a second signal immediately, and retrofitting means re-editing lens prompts right after authoring them — the exact waste that motivated the WS-3 split. |
| **T4 · Correlate after dedup** | before dedup; interleaved | Dedup collapses N write sites into one entity (else severity depends on duplicate count) and is what populates `lenses:` provenance; R2-O1's reference-repo drop is already upstream of it. |
| **T4 · Compose additively; legs retained + back-linked via `correlation_id`; composed findings in `## Correlated Findings`, excluded from the matrix | legs replaced by the composite; composite counted in the matrix | Replacing legs destroys per-site actionability and breaks matrix arithmetic; a separate section structurally prevents double-count and gives organise a block that is internal-evidence-only, so it may legally occupy top slots under the down-rank contract. |
| **T4 · Required-leg / amplifier-leg split; required all-present ⇒ emit, one required `absent` ⇒ silent, one required `unobserved` ⇒ coverage row | emit every 2-of-3 at reduced severity; suppress every partial | Suppressing partials reinstates the false negative; emitting all partials floods. The harm is the (restricted subject × discarded write) pair; `tests` explains the greenness. Also makes the 25-finding cap degrade severity rather than delete the correlation. |
| **T4 · New `## Correlation Coverage` manifest, one row per rule, tokens `fired (N)` / `no match` / `unevaluable (`, Step-6 grep-assert cloned from the row-per-slot assert | fold rows into `## Missing Lenses`; no manifest | A rule that cannot fire because a leg's lens was N/A, crashed or operator-excluded is the same false-all-clear as a lens that did not run. `## Missing Lenses` is keyed per lens slot and its assert counts slugs — a sibling section keeps both asserts simple. |
| **T4 · Verdict mapping: N/A-caused `unevaluable` ⇒ PASS; crashed / operator-excluded / no-subject-match ⇒ CONCERNS | all `unevaluable` ⇒ CONCERNS; all ⇒ PASS | bkit's own dogfood run must stay green on "no store exists"; a crashed leg or an operator exclusion is a real blind spot in *that run*, and `no subject match` is the only signal that a lens forgot to emit `subject:`. |
| **T4 · `source: reference-repo` findings ineligible as correlation legs** | allow with confidence floor | Otherwise external low-confidence signal launders into a CRITICAL top-slot finding, defeating the down-rank contract the design spent a review pass pinning. |
| **T1 · `.agents/` → `.bkit/` is SELECTIVE, not a blanket sed** — `.agents/prompts/` → `.bkit/prompts/`, `.agents/workflows/` → `.bkit/workflows/`, `.agents/workflows.md`/`prompts.md` → `.bkit/`; **`.agents/docs.md`, `.agents/rules.md`, `.agents/skills.md`, `.agents/config.md` stay put** | blanket rewrite of every `.agents/` token | Verified on the working tree: those four files exist in `.agents/` today and `.bkit/docs.md` does **not** exist (design-input §2 lists it in error). A blanket sed would point A7's registry edits and the lens Read-instructions at nonexistent paths. Knock-on: the `ai-llm` self-reference exclusion becomes `.bkit/** + .agents/** + .claude/** + .cursor/** + .opencode/**`. |
| **T1 · `status.json#steps[5].artifacts` "fixed-length 16-entry array" restated as: the lens-fan-out `step-done` event carries an `artifacts` array with exactly one entry per declared lens slot (18)** | keep a fixed-length claim; drop the invariant | NDJSON has no `steps[]` to index — the array lives on the appended `step-done` line (`bkit-design.md` idiom). The invariant that matters survives: one artifact per slot, so a flag-bug-induced missing slot surfaces as `crashed`. The Pass-3 Done-When that greps for hardcoded `=== 11` / `=== 16` comparisons stays, retargeted at the event shape. |
| **T1 · Audit is feat-located, close-reorder applied** — status writes resolve via `$(git rev-parse --show-toplevel)`, Step-1 resume does the worktree-or-dev probe, `step-done` + `workflow-done` appended **before** the close commit, Close STRAY guard widened to `docs/audits/**`, Failure Path appends `workflow-failed` with no dev push, all 23 subagent `Context:` lines pin `cd "{WORKTREE_PATH}"` | dev-located/no-worktree (what `.bkit/workflows.md`'s branch-placement table currently says) | Audit has a Step-2 worktree and squash-merges its artifact, so it is design/plan-shaped. The stale table row is a shipped-doc defect the reconciliation must name; `cloud` is the only genuinely dev-located workflow. |
| **T2 · Re-cut `## Design Workstreams` to A1–A7 + WS-B + WS-C as peer sections; keep the design-doc-origin mapping (WS-1→A2, WS-2→A3, WS-4→A4, WS-5→A5, WS-6→A6, WS-7→A7, WS-8→A1, WS-3→dissolved into B/C) but cite **no** `#187`–`#193`/`#208` links | keep the WS-1..WS-8 numbering; assert the split in a comment only | The sub-issues are HTTP 410 — live links become dead ends and the doc is the only surviving copy. Traceability is preserved by the origin column, not by URLs. Same rule for the stale `#80` comment IDs cited in #403/#405: cite the amendment content, not the dead IDs. |
| **T2 · Resolve the dangling `WS-K`** — its plan-time grep-asserts (canonical-enum equality, extended universality regex, absolute-path convention) land in **A7** alongside the registry surfaces, with the enum-equality assert re-pointed at 18 slugs + the signal enum + the correlation-rule ids | leave `WS-K` as-is; invent a WS-A8 | `WS-K` is referenced four times in the Pass-3 doc and has no `### WS-K` section — an unowned obligation. A7 already owns the greppable-registry surface. |
| **T3 · 13 universal + 5 conditional = 18 slots**; every `16` becomes `18`, subagent count 21 → 23, Step-5 fan-out width 18, canonical Step-6 enum re-cut with `data-layer` → `contract-conformance` and `+logic-dupe`, `+derived-data` | keep 16 and treat the new lenses as follow-ups | The enum is R1-B1 single-source-of-truth: a stale count silently breaks the row-per-slot assert, the artifacts-array invariant and the `[lenses=...]` stub count in one move. |
| **T3 · Flag inventory grows to 6** — `hasWebSurface`, `hasDb`, `hasLLM`, `hasCi`, `hasNetwork`, **`hasDerivedStore`** (gate for `derived-data`) | reuse `hasDb` for `derived-data`; name it `hasCache` | The `requires:`-value ⊆ flag-inventory assert forces a declared flag. `hasDerivedStore` is stack-agnostic where `hasCache` leans product-shaped, and a derived store can exist without a database (materialized files, in-memory read models). |
| **T3 · Flag `supply-chain`'s `requires:` conflict for resolution at design** — Pass 3 says `requires: hasCi` (default true); #403 lists it among 13 lenses "each `requires: always`". Recommend `requires: always` **plus** the sanity-probe-before-emit clause (no CI surface ⇒ `# Not Applicable (flag=true but no surface evidence)`) | silently pick either | Picking `always` without the sanity clause reintroduces a false all-clear on a repo with no pipeline — the exact invariant under protection. Picking `hasCi` keeps the flag but contradicts the count #403 ships against. This must be decided in the doc, not left to the plan. |
| **T3 · `tests`' `detected-static-only, runtime-unverified` stays a per-finding annotation on a `ran` slot, never a fourth slot state; synthesiser preserves it on pass-through | promote to a slot state | Pass-3.1 already froze this; a fourth state would break the three-token grep-assert. Note the interaction: a hollow-boundary finding so annotated is still a valid `tests` amplifier leg, but the composed finding inherits the annotation into `why:`. |
| **T5 · Target `4.11.0` — A, B and C ship in the **same** minor** | A in 4.11.0, B/C in 4.12.0; a 5.0.0 major | A6's acceptance (fan-out wired, dogfood run showing conditional lenses `N/A`) is unmeetable without B and C existing — a minor shipping A alone ships a workflow whose Step 5 invokes prompts that do not exist. Additive workflow + additive prompts + no consumer-breaking contract change ⇒ minor, not major. Three plans, one release train. |
| **T5 · Legacy `bkit-utility-audit-*` deprecation header resolves `Deprecated since` against `package.json#version` at build time; deletion stays blocked on WS-E1 | pin `4.11.0` in the header | The no-pinning decision is already frozen in the Pass-3 doc, and the doc's own `v2.2.0`/`v2.3.0` numbers are the drift this task exists to remove. |
| **Out of remit, recorded** — `.bkit/workflows.md` § `/bkit-audit` still documents a **7-step**, Linear-flavoured workflow that parses findings by `^## \[(\w+)\]\[(\w+)\]` heading regex rather than the YAML fence | fix opportunistically | It is a shipped registry surface contradicting the design on step count, tracker model (pre-#202 inline markers) and parse contract. A7 owns rewriting it; naming it here stops the plan from treating it as already-correct. |
