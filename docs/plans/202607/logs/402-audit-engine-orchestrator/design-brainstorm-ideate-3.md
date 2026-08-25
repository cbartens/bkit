# Design Brainstorm & Ideas

Lens: Risk premortem — failure modes, scale, time, handover. Assigned emphasis: **Task 3 — folding the ten post-PASS charter amendments**. Tasks 1/2/4/5 covered at working depth; the amendment fold is worked to completion.

---

## Task 3 groundwork — the full before→after lens inventory (this is the artifact every count in the design doc must derive from)

### The arithmetic, first, because a silently-dropped lens is the worst outcome of this pass

```
Pass-3 inventory                     16   (11 universal + 5 conditional)
  minus WS-D (#207) web-product       0   ← none of SEO/AIO/IA, analytics, web-perf, DX
                                          were ever in the Pass-3 16; they are
                                          Pass-3 § Out-of-scope deferrals
  minus lenses dropped                0
  plus  NEW logic-dupe (universal)   +1
  plus  NEW derived-data (cond.)     +1
                                    ----
Post-amendment inventory             18   = 13 universal (#403) + 5 conditional (#405)  ✅
```

**It reconciles.** 16 + 2 = 18 = 13 + 5. Every Pass-3 lens lands in exactly one of #403 / #405. **No lens is in neither.** The universal/conditional split moves by one seat (`supply-chain`), which is why 11+5 becomes 13+5 rather than 12+6.

### The table of record

Owner column: **B** = #403 (WS-B, `requires: always`) · **C** = #405 (WS-C, flag-gated).

<!-- prettier-ignore -->
| # | Pass-3 slug | Pass-3 gate | After: slug | After: gate | Owner | Status | Probe clause the amendment adds |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | `architecture` | always | `architecture` | always | B1 | **unchanged** | — |
| 2 | `hotpath` | always | `hotpath` | always | B2 | **unchanged** | — |
| 3 | `config` | always | `config` | always | B3 | **unchanged** | — (note: config-level *deadness* explicitly NOT here — it goes to `dead-code`; state the boundary in both prompts) |
| 4 | `reliability` | always | `reliability` | always | B4 | **amended** | Emit, on every unchecked/swallowed write, a machine-readable **subject** naming the target store + a `write-unchecked` marker. Do **not** self-assess privilege — the up-rank is a synthesis output, not a probe (see § Coupling 1). |
| 5 | `observability` | always | `observability` | always | B5 | **amended** | **Double-blind probe:** an error path that is BOTH discarded (no rethrow, no propagation to caller) AND unlogged/unmetered. Rank above single-blind. Explicitly the inverse of `debt`'s leftover-`console.log` cruft probe — state the boundary in both. |
| 6 | `debt` | always | `debt` | always | B6 | **amended ×3** | (a) **Ledger read:** parse `docs/deferrals.jsonl` + `docs/failures.jsonl`; fold same-`key` rows before counting; report every row whose `status != "CLOSED"` (**`TRIAGED` is open work**); rank `CRITICAL` first then oldest `ts`; cross-check each row's `references[]` against the code; **read-only, never append a closing row**. (b) **Suppression debt:** `@ts-ignore` / `@ts-expect-error` / lint-disable line+block / `any` / non-null `!` / `as unknown as`; report **blanket** disables only, never doctrine-sanctioned targeted per-rule opt-outs; rank by density × proximity to security/reliability surfaces. (c) **Cruft:** commented-out code blocks; stray debug-print statements in **product** code. |
| 7 | `dead-code` | always | `dead-code` | always | B7 | **amended** | Extend from unreferenced *exports / orphan files* to unreferenced **config entries**: config keys and env vars with no reader; feature flags permanently pinned on/off. Explicitly NOT config shape-vs-code (that is `config`). |
| 8 | `deps` | always | `deps` | always | B8 | **unchanged** | — |
| 9 | `security` | always | `security` | always | B9 | **amended (stated non-catch)** | Prompt states in-body: this lens hunts **permissive** holes; it reads a *restrictive* grant as correct least-privilege and passes it green. Privilege-break detection is `contract-conformance`'s. This is a negative clause — it must be greppable so a future author cannot quietly widen the lens back over the same ground. |
| 10 | `supply-chain` | **`hasCi`** (defaults true) | `supply-chain` | **`always`** | B10 | **RECLASSIFIED** (conditional → universal) | Probe text unchanged; gate changes. Plus: **owns agent-framework version pinning** (from the `ai-llm` fold) — orchestration libraries pinned to secure versions, evaluated at the manifest/lockfile entry, not the import site. |
| 11 | `tests` | always | `tests` | always | B11 | **amended ×4** | (a) **Doctrine-graded tiering** — read the *target repo's* `docs/testing.md`, grade against its § "Which tier does a behaviour need?" + § "What each tier must do", report **under-tiering using the doc's own tier names**; fall back to universal assertion-strength probes when the target ships no such doc. (b) **Coverage % AND coverage scope** — flag under-coverage *and* indiscriminate whole-app integration coverage. (c) **Three discrimination probes** — mock-collapse (two runtime-distinct dependencies mocked to the same instance), status-only assertions on operations that can return success *on* failure, proxy-surface (asserting surface A when the mutation targets surface B). (d) **Hollow-boundary probe, best-effort-static** — boundary tests whose only assertion is "did not throw"; every such finding carries `detected-static-only, runtime-unverified` and points at WS-E. Plus leftover `.only` / `.skip` / `xit` in committed tests. |
| 12 | `docs-drift` | always | `docs-drift` | always | B12 | **amended (by Task 1, inside a probe)** | Probe target string is `.agents/docs.md`, **not** `.bkit/docs.md`. #403's B12 row and #402's A7 row both say `.bkit/docs.md`; that file does not exist (see § Task 1). A blanket `.agents/`→`.bkit/` sed corrupts this probe. |
| 13 | — | — | **`logic-dupe`** | always | B13 | **NEW** | Divergent inline logic duplication. Shapes: fallback chains with divergent terminal fallbacks/ordering; null-vs-falsy operator + trim/guard splits over the same operand set; duplicated locale/format option bags; repeated inline predicate filters; the same enum/config default hardcoded across readers. Rank = blast radius (#sites) × divergence (#distinct behaviours) × user-visibility. Out of scope: coincidental similarity, single-call-site helpers, naming/terminology drift. **Second deliverable: per confirmed rule, emit a copy-pasteable grep/lint guard** (see § Coupling 5 — the finding schema cannot currently carry it). |
| 14 | `ui-ux` | `hasWebSurface` | `ui-ux` | `hasWebSurface` | C1 | **unchanged** | — |
| 15 | `data-layer` | `hasDb` | **`contract-conformance`** | `hasDb` | C2 | **RENAMED + REWRITTEN** | Primary probe is a **derivation, not a scan**: (1) build the grant/permission matrix per store; (2) enumerate every write site; (3) resolve the client role at each site (route → action → helper); (4) flag **role-mismatched writes** and **unchecked errors on writes into a restricted store**. Emits the per-store **subject** identity that `reliability` and `tests` join against. Pass-3's N+1 / unbounded-query / migration-safety probes are retained as **secondary**. |
| 16 | `ai-llm` | `hasLLM` | `ai-llm` | `hasLLM` | C4 | **amended (framework enrichment)** | Four dimensions: (1) **tool & capability sandboxing** — what functions are exposed to an autonomous caller; write authority where read suffices; isolated execution; (2) **prompt-as-code integrity** — system prompts version-controlled, sanitized, isolated from user-supplied input vs assembled ad hoc; (3) **agent-framework plugin trust** — third-party plugin/extension provenance (**pinning is `supply-chain`'s**, § Coupling 2); (4) **deterministic logging & blast radius** — hard token limits, cost caps, execution logs for forensics, no raw model output piped into an executor. Charter (not probe text) names OWASP Agentic Top-10 / MITRE ATLAS / AWS agentic guidance / OWASP SAMM / NIST SSDF, shared with WS-F. Scope exclusion `.bkit/** .claude/** .cursor/** .opencode/**` (§ Self-reference). |
| 17 | — | — | **`derived-data`** | **NEW FLAG** | C3 | **NEW** | Locate caches, denormalized columns and materialized stores that have an independent recompute path. Probe: (1) is there a single authoritative writer, or none/many; (2) does *every* source-mutation path also update the derived store; (3) does any test or store-level constraint assert the two agree. |
| 18 | `reference-signal` | `hasNetwork` | `reference-signal` | `hasNetwork` | C5 | **unchanged** | — |

**Tally:** 7 unchanged · 7 amended · 1 reclassified · 1 renamed+rewritten · 2 new = **18**.

### Counts in the Pass-3 doc that this table invalidates (checklist — every one must change)

`16 lenses` → 18 · `11 universal` → 13 · fan-out `11 → 16 slots` → `→ 18 slots` · R1-B1 canonical **16-slug enum** → 18 slugs, and the slug list itself changes (`data-layer` out, `contract-conformance` / `derived-data` / `logic-dupe` in) · `status.json#steps[5].artifacts` fixed-length **16-entry array** → 18 entries **and** a `status.jsonl` event field (Task 1) · Step-5 / Step-6 grep-assert row counts · `[lenses=...]` valid-slug validation list · Step-5 Failure-Path recovery-hint slug list · `16 - len(lenses-list)` excluded-slot stub arithmetic · `.bkit/prompts.md` § Models rows (5 pipeline + 18 lenses = 23) · § Audit Phase agent list · "4 conditional lenses stress-test the keystone" → 5 · cost trajectory "16 opus lenses ~4.5× design triplet" → 18 (~5×) · Pass-3 § Decisions row "roster grows 11 → 16" → 11 → 18 with the `supply-chain` seat move called out · model pins `claude-opus-4-7` → `claude-opus-5` (current `.bkit/prompts.md` § Effort → model mapping).

### Applicability flag inventory — the two defects the fold creates

<!-- prettier-ignore -->
| Flag | Pass-3 consumer | After | Verdict |
| --- | --- | --- | --- |
| `hasWebSurface` | `ui-ux` | `ui-ux` | fine |
| `hasDb` | `data-layer` | `contract-conformance` | fine (consumer renamed) |
| `hasLLM` | `ai-llm` | `ai-llm` | fine |
| `hasNetwork` | `reference-signal` | `reference-signal` | fine |
| `hasCi` | `supply-chain` | **nobody** | **ORPHANED** by the B10 reclassification |
| *(none)* | — | `derived-data` | **MISSING** — the flag does not exist |

1. **`hasCi` becomes dead config.** The Pass-3 grep-gate only asserts one direction (every `requires:` value ∈ Flag Inventory). Nothing catches an inventory flag with zero consumers. Delicious symmetry: this is precisely the class B7 `dead-code`'s new amendment probes for, and bkit would ship it. Two options — (a) keep `supply-chain` on `requires: hasCi` and treat "universal" as "defaults true", which preserves the flag and the permissive-gate rationale but contradicts #403's "each … `requires: always`"; (b) flip to `always` and **delete `hasCi` from the Flag Inventory**, accepting that a repo with no CI gets `supply-chain` findings about a lockfile only. Recommend (b) plus a **bidirectional** grep-gate (every inventory flag has ≥1 consumer). Decide in this design — a plan run cannot.
2. **`derived-data` has no flag.** #405 says "`hasCache` / derived-store flag" — undecided. This is a **WS-C→WS-A dependency**: naming the flag, writing its evidence-based detection heuristics, adding it to `## Applicability`, `## Applicability — Flag Inventory` and the inverse-evidence guard are all A2 (stack-detect) work. `/bkit-plan` on #405 is blocked until the design names it. Recommend **`hasDerivedStore`** (concept, not mechanism — `hasCache` names an implementation and invites stack-leak). Heuristic sketch, stack-agnostic: presence of ≥1 store the repo both writes and recomputes — schema objects whose name/comment marks them materialized, scheduled recompute jobs, or a key-value client alongside a primary store. **This flag is the hardest to detect and the most likely to false-negative**, which puts it straight into the "conditional-lens false-negative N/A is silent by construction" risk already in Pass-3 § Risks.

### Amendments with no probe clause, or a clause the lens cannot execute (the fold's real hazards)

- **`debt` cannot cross-check the tracker.** #403's clause says "cross-check each row against **the tracker** and the code". Lens tool surface is `Read, Grep, Glob, Write` — no MCP, no `Bash`, no network. As written this acceptance criterion is unsatisfiable without a **third** tool-surface exception (after `supply-chain` Bash and `reference-signal` WebSearch). Recommend narrowing the shipped clause to **`references[]`-vs-code reconciliation** (the row cites a PR / commit / path — does the path exist, does the described symptom still grep) and explicitly deferring tracker reconciliation to WS-G. Design must say so; otherwise a build agent either invents the check or grants the tool.
- **`isOpenWork()` does not exist.** Grepped `.bkit/src/**` — no such symbol. The amendment cites it as if it were an API. The durable invariant is `.bkit/jsonl.md` § Updating a Row: _"`TRIAGED` IS STILL OPEN WORK … test `status != "CLOSED"`"_. The probe clause must state the predicate, never a function name — a prompt naming a non-existent helper is a hallucination magnet.
- **`logic-dupe`'s guard cannot fit the finding block.** `direction:` is single-line, ≤200 chars, and triple-backticks are **forbidden** inside any field value (they close the fence). A copy-pasteable CI guard is neither. See § Coupling 5.
- **`tests`' `detected-static-only, runtime-unverified` has no carrier field.** See § Coupling 4.
- **`reliability`'s "up-rank … to critical" is not a probe.** See § Coupling 1.

### Charter-level couplings the amendments create — the fragile part

**Coupling 1 — `reliability` (universal) consumes `contract-conformance` (conditional).**
A `requires: always` lens depending on a `requires: hasDb` lens inverts the dependency direction of the keystone. It cannot be resolved inside the lens: prompts are **sibling-blind** and **standalone-runnable** (`.bkit/prompts.md` § Prompt Authoring Rules — "Each prompt MUST stand alone. NO cross-refs"). Reading a sibling's artifact violates both.
Resolution: `reliability` never learns about privilege. It emits swallowed/unchecked writes at its own honest severity, plus a **subject** naming the target store. WS-A synthesis performs the up-rank when a `contract-conformance` finding marks that same subject restricted.
**`hasDb=false` behaviour:** the up-rank never fires; `reliability` findings stand at baseline severity; **nothing is reported as "checked and clean"**. Critically, the composed silent-corruption finding must be recorded as _not evaluable_, not as _absent_ — see § Task 4.

**Coupling 2 — `ai-llm` vs `supply-chain` on agent-framework pinning.**
`supply-chain` is now universal, `ai-llm` conditional. Split: **pinning → `supply-chain`** (it has the lockfile probes and the allowlisted `Bash` git-history surface), **agent-specific plugin/extension trust → `ai-llm`**. Both emit `class: security`. Double-report risk is real and the existing dedup key handles it _only if both anchor `location:` to the same place — the manifest/lockfile entry, not the import site_. State that co-location convention as a shared line in both prompts (§ Cross-prompt alignment rule). Without it: two high-severity findings for one problem, both survive dedup, both rank.

**Coupling 3 — `debt`'s ledger read vs #346's CI gate.**
#346 gates CI on open `CRITICAL` failures and stale `OPEN` deferrals. Two readers of one ledger with two implementations of fold + open-work predicate is the drift shape. Also, once #346 is green in a repo, `debt` re-enumerating open `CRITICAL`s is pure noise. Charter clause: **`debt`'s primary finding class is ledger _drift_** — a row fixed in reality but open in the ledger, a row owned by an open tracker issue, a row aged past a threshold — ranked above raw open-work enumeration, which a gate already surfaces where one exists. Both readers cite `.bkit/jsonl.md` as the single fold spec; neither re-states it.

**Coupling 4 — `tests`' hollow-boundary marker vs WS-E (#83) and the down-rank fence.**
Pass-3.1 is explicit that `detected-static-only, runtime-unverified` is a **per-finding marker on `ran` output, NOT a fourth manifest state**. Two failure modes if that is fumbled:

- Implemented as a 4th state token → breaks the Step-6 row-per-slot grep-assert, which enumerates exactly three tokens.
- Carried as free prose in `why:` → destroyed the first time dedup merges the finding with a sibling's. It must be a **field on the finding block** or it does not survive the pipeline.
  And the trap: **do not express it as `confidence: low`.** `confidence: low` triggers the reference-signal down-rank fence — the finding would be banned from the matrix top row and ranked-list top-3. Barring a genuine boundary gap from the top of the report is the exact inverse of the intent. Recommend a new optional field (`evidence: static | static-only-runtime-unverified | static-composed`), default-tolerated absent, echoed verbatim by organise like `source:`.

**Coupling 5 — `logic-dupe` vs `dead-code` vs `slop:delta`, and the guard-generation schema conflict.**
Three duplication detectors, adjacent scopes. The split, stated once and carried verbatim in both prompts: `dead-code` is **reference-based** (duplicated exports / orphan files / dupe utilities); `logic-dupe` is **behaviour-based** (the same rule inlined at N sites with divergent load-bearing details); the repo's own diff-time slop gate catches ≥3 _identical signatures_ and by construction sees neither of the above.
The guard deliverable breaks the schema: `direction:` is single-line ≤200 chars and forbids triple-backticks. Options — (a) new optional `guard:` field with a defined single-line escaping rule (ugly, lossy); (b) a `## Suggested Guards` section in the lens artifact, passed through by synthesise and rendered by organise as an appendix, with each finding carrying `guard-ref: {id}`; (c) drop guard generation from this milestone. Recommend **(b)**: it keeps the finding block untouched (a load-bearing PASSed contract), keeps audit read-only (the guard is emitted as text, never installed), and gives synthesise a well-defined pass-through. **(c) is a scope cut, not a design choice — #403's acceptance criterion names the guard explicitly, so dropping it needs a recorded decision.**

### Sibling-blindness vs correlation — what each lens must emit for the broker to work

The invariant to state once, in the design, at charter level: **no lens reads another lens's artifact. All cross-lens knowledge is brokered by WS-A synthesis (A4).** Five amendments require cross-lens knowledge; all five are brokered, none are lens-local:

<!-- prettier-ignore -->
| Amendment | Knowledge needed | Brokered by | Lens must emit |
| --- | --- | --- | --- |
| `reliability` privilege-aware up-rank | is store S restricted? | A4 | `subject` + `write-unchecked` marker |
| silent-corruption composition | 3 findings about S co-located | A4 | `subject` on all three |
| `ai-llm` ↔ `supply-chain` pinning | who already reported it | dedup (existing) | shared `location:` anchoring convention |
| `debt` ↔ #346 gate | is the gate live | **nobody — decide by charter** | drift-first ranking (no runtime knowledge) |
| `tests` hollow-boundary ↔ WS-E | can this be proven | **nobody — annotation only** | `evidence:` field |

**The join key is the gap.** Today's dedup key is `(class, normalized_location)` — file path + 5-line bucket. The silent-corruption triple has **three different classes at three different locations**: `contract-conformance` at the grant/migration definition, `reliability` at the write call site, `tests` at the spec file. The existing key would **never** join them. Correlation therefore needs a second, orthogonal join axis: a normalized **subject** — the store/resource identity — emitted as a new optional finding field and normalized (case/qualifier-stripped) by the synthesiser. Stack-agnostic form, e.g. `subject: store:{identifier}`. This is the single most consequential contract change Task 3 forces on Task 4, and it is what turns "correlate" from prose into machinery.

**Second-order hazard: the 25-finding cap can evict the correlation's inputs.** Lenses cap at 25, severity-sorted. `reliability`'s pre-up-rank swallowed-write finding is, by the amendment's own argument, _low severity in isolation_ — exactly the class the cap evicts first. The correlator then sees two of three legs and composes nothing. Mitigations to choose between: reserve slots within `reliability` for `subject`-bearing `write-unchecked` findings; apply the cap per-probe rather than per-lens; or raise the cap for the three correlation-participant lenses. **Do not leave this implicit** — a silently truncated leg is indistinguishable from a clean one.

### Self-reference hazards on the bkit dogfood run

**`ai-llm` — the scope exclusion is what makes the acceptance criterion satisfiable, not a nicety.**
Pass-3's exclusion list is `.agents/** .cursor/** .claude/**`; post-#204 + opencode it must be `.bkit/** .claude/** .cursor/** .opencode/**` (and `.agents/**` is now docs/rules, still worth excluding). But the deeper problem: `hasLLM`'s detection heuristics (model-provider SDK deps, `*_API_KEY` env patterns) are very likely to fire **true** on bkit — it pins model IDs, selects providers, and holds agent tooling credentials. #405's acceptance says _"Dogfood on bkit: `ui-ux`, `contract-conformance`, `derived-data`, `ai-llm` all render `N/A — not applicable ({flag}=false)`."_ If `hasLLM` auto-detects true, that line is **unachievable by construction**, and the honest outcome is either `# Not Applicable (flag=true but no surface evidence)` after exclusion, or `ran` with a handful of findings about bkit's own model pinning. **The design must settle which of the three the dogfood expects**, because "the dogfood shows N/A" is the milestone's headline acceptance gate and a wrong expectation there will be "fixed" by weakening the heuristic — re-opening the false-negative hole the keystone exists to close.

**`debt` — bkit's own ledgers are the input.**
`docs/deferrals.jsonl` + `docs/failures.jsonl` in this repo carry ~50 folded keys. On the dogfood run `debt` will produce a large, _correct_ finding set that saturates its 25-finding cap and dominates the `maintainability` class in the matrix — crowding out the keystone signal the dogfood exists to validate. Two consequences to fold in: (a) the dogfood acceptance must assert on the **`## Missing Lenses` manifest rows**, not on the ranked list, so a noisy-but-correct `debt` cannot mask a keystone regression; (b) `debt`'s cap allocation should be split across its three sub-probes (ledger / suppression / cruft) so the ledger cannot starve the other two.

---

## Approach A — Single charter table of record + a schema addendum that makes the amendments executable ⭐ Recommended

**Summary.** The design doc carries **one** canonical 18-row lens inventory table (the table above) from which every count in the document is derived, and a short **finding-schema addendum** (`subject:`, `evidence:`, plus a `## Suggested Guards` artifact section) without which five of the ten amendments are prose that no build agent can turn into a probe.

The failure mode it targets: **the unsatisfiable amendment** — a charter clause with no probe clause, or a probe clause the lens's tool surface or the finding schema cannot execute. That failure is silent: the build agent writes _something_, the acceptance criterion ("every amendment traceable to a probe clause") is graded by the same agent, and the gap surfaces only when a real audit fails to catch the class the amendment existed for.

**Premortems.**

- **10× scale (18 lenses → a 40-lens family once WS-D lands; 500-finding ceiling).** _Breaks:_ the 25-cap evicts correlation legs before A4 sees them (§ above); the severity×class matrix flattens — 18 lenses map onto 7 classes, so `maintainability` alone now carries `architecture`, `debt`, `dead-code`, `docs-drift`, `logic-dupe`, `ui-ux`, `reference-signal` and becomes unreadable; the R1-B1 canonical enum is now maintained in three places (workflow Step 6, synthesiser prompt, `requires:` union) × 18 rows. _Observability:_ the plan-time three-way enum grep-assert already exists and scales; matrix flattening is visible only to a human reading the report. _Recovery:_ `[lenses=...]` restricted re-run; the per-class appendix is the escape valve for a flat matrix.
- **6 months later.** _Breaks:_ the inventory table drifts from the shipped prompts the moment one lens is edited without touching the doc — the exact drift this Pass-4 exists to repair, recurring. Undocumented invariants at risk: the co-location convention (Coupling 2), the `class` choice for `contract-conformance`, the `subject:` normalization rule. Magic numbers: 25-cap, 18 slots, top-3 down-rank, ±5-line dedup bucket. _Observability:_ none by default — Markdown has no compile step. _Recovery:_ the plan-time grep-assert must be widened from "three enums agree" to "the doc's inventory table, the workflow enum, the synthesiser enum and the on-disk `bkit-audit-lens-*.md` set all agree on the same 18 slugs" — four-way, and it can run in CI as a shipped test rather than a plan-time ritual.
- **On-call at 3am.** _Page shape:_ there is no page — audit is ad-hoc and terminal. The realistic 3am equivalent is _"the audit says clean and I don't believe it."_ _Diagnosability:_ good on the mechanism (three-state manifest, `## Parse Errors`, per-lens artifacts on disk), **weak on the amendments** — a probe that was never authored looks identical to a probe that ran clean. _Recovery:_ `[lenses=slug]` single-lens re-run against a known-bad fixture. **Fold in:** each of the seven amended lenses gets a named regression fixture in its Done-When (§403 already does this only for `logic-dupe`'s 17-site exemplar) — that is what converts "ran clean" from unfalsifiable to falsifiable.
- **Author leaves.** _Concentration:_ the ten amendments' rationale lives in a 50-comment tracker thread whose cited comment IDs **already 404**. The design doc becomes the only surviving copy of the _why_, exactly as it already is for the deleted WS-1..WS-8 sub-issues. _Bus factor:_ one. _Load-bearing tribal knowledge:_ why `security` must NOT catch restrictive grants (reads as a bug otherwise); why `reliability` must not self-assess privilege; why `confidence: low` must not carry the hollow-boundary marker. **Fold in:** each of those three goes into the doc as a one-line negative decision row with its consequence, not as prose.

**Risk-mitigation guidance (layer onto whichever approach is picked).**

1. Make the inventory table the sole count source, and add a **four-way slug-set assertion** (doc table ↔ workflow Step 6 enum ↔ synthesiser enum ↔ on-disk lens prompt set) as a shipped test, not a plan-time ritual.
2. Add the **bidirectional** flag-inventory gate (every `requires:` value ∈ inventory **and** every inventory flag has ≥1 consumer) — it is what catches the orphaned `hasCi`.
3. Land the schema addendum (`subject:`, `evidence:`, `## Suggested Guards`) as **additive optional** fields, matching the precedent set by `source:` — parsers default-tolerate absence, no migration across the other prompts.
4. Per-amendment regression fixture in Done-When, for all seven amended lenses.
5. Record the three negative decisions (security non-catch, reliability non-self-assessment, no `confidence: low` for hollow-boundary) as greppable one-liners in the prompt bodies, because negative rules are the first thing a future author deletes as redundant.
6. State the "no lens reads a sibling artifact; A4 brokers" invariant once at charter level, and cite it in each of the five brokered amendments.

---

## Approach B — Amendment ledger appended to the Pass-3 doc (traceability-first, minimum edit)

**Summary.** Leave the Pass-3 §§ Lens prompt inventory / Design Workstreams structurally intact; append an `## Amendments` appendix — one row per amendment, keyed by its true comment ID, with target-lens, probe-clause and status columns — and update counts in place.

The failure mode it targets: **losing the amendment→rationale trail**. Given #403/#405 already cite seven comment IDs that 404, an in-repo, versioned, ID-keyed ledger is real insurance, and it is the cheapest possible edit.

**Premortems.**

- **10× scale.** _Breaks:_ the charter now lives in two places — the Pass-3 lens table (stale by construction) and the appendix (authoritative). At 18 lenses × 10 amendments that is tolerable; at WS-D's 40 lenses × N it is the same lump problem this reorg just dismantled, one level down. _Observability:_ none — a reader landing on the lens table has no signal that an appendix amends it. _Recovery:_ fold the appendix into the table, i.e. become Approach A, later and more expensively.
- **6 months later.** _Breaks:_ this is the _documented_ failure mode of the whole milestone — the Pass-3 doc plus an unfolded comment thread is exactly the state Pass-4 was called to repair. Reproducing that shape inside a single file changes the blast radius, not the mechanism. _Recovery:_ only a re-fold.
- **On-call at 3am.** _Diagnosability:_ better than A on _why_ (IDs preserved, rationale adjacent), worse on _what ships_ — an operator asking "does `tests` check coverage scope?" must read two sections and reconcile them.
- **Author leaves.** _Best of the three on rationale survival, worst on spec clarity._ A successor inherits an accurate history and an ambiguous specification.

**Risk-mitigation guidance.** If picked: put a hard `> [!CAUTION]` pointer at the top of the Pass-3 lens table stating it is superseded by the appendix for all amended rows; make the appendix the four-way-assertion target; carry the true comment IDs (from Appendix A of the design input) and never the 404'ing ones. **Better still: adopt A's table and keep B's ID-keyed ledger as a small `## Amendment provenance` section** — the two are not exclusive, and the ledger is cheap.

---

## Approach C — Charter by issue: design owns mechanism + inventory, #403/#405 bodies own probe text

**Summary.** The design doc charters the mechanism, the keystone, the schema and the 18-row inventory (slug / gate / class / owner / status), and delegates full probe text to the #403 and #405 issue bodies, which are already written and already consolidated. Three `/bkit-plan` runs read design + their own issue.

The failure mode it targets: **doc/issue divergence through duplication** — copying 18 probe charters into the design creates a second copy of text that already exists, and two copies drift.

**Premortems.**

- **10× scale.** _Breaks:_ fine at 18; at WS-D scale the design becomes an index and every probe question routes to a tracker read. _Blast radius:_ every plan/build agent now needs tracker access to answer a probe question — a network + auth dependency on a surface that was previously a file read.
- **6 months later.** _Breaks:_ **issue bodies are mutable and unversioned against the repo.** This milestone has already demonstrated the failure twice — WS-1..WS-8 sub-issues #187–#193/#208 returned HTTP 410 and took the decomposition with them; #403/#405's own source-link comment IDs 404 today. Delegating the charter to that surface after both events is knowingly rebuilding the failure. _Recovery:_ none, once deleted.
- **On-call at 3am.** _Diagnosability:_ an operator in a worktree cannot answer "what does this lens probe" without network. Every other bkit contract is a file read.
- **Author leaves.** _Worst of the three._ Load-bearing specification sits outside the repo, outside CI, outside `bkit check` drift detection, and outside the squash-merge that lands the design on `dev`.

**Risk-mitigation guidance.** If picked for cost reasons: at minimum snapshot the two issue bodies verbatim into `docs/plans/202607/logs/402-audit-engine-orchestrator/` as frozen artifacts and cite the snapshot, not the live issue — which is most of A's cost with none of A's integration. C is recorded here mainly to be rejected explicitly, because "the issues already say it" is the tempting shortcut this pass will be offered.

---

## Decisions

<!-- prettier-ignore -->
| Decided | Alternatives | Why |
| --- | --- | --- |
| **Approach A** — one 18-row inventory table of record in the design doc + additive schema addendum | B (appendix ledger), C (issue-as-charter) | A is the only shape where every count in the doc has one source and every amendment has an executable landing site. Keep B's ID-keyed provenance section as a cheap add-on; reject C on the demonstrated 410/404 evidence. |
| **Net inventory = 13 universal + 5 conditional = 18; arithmetic reconciles, zero lenses dropped** | — | 16 Pass-3 + `logic-dupe` + `derived-data` = 18; `supply-chain` moves universal, `data-layer` renames to `contract-conformance`. Stated explicitly so a future reader can re-verify without the thread. |
| **`supply-chain` → `requires: always`; DELETE `hasCi` from the Flag Inventory** | Keep `requires: hasCi` (defaults true) | #403 states `requires: always` for all 13. Leaving the flag in the inventory with no consumer ships the exact dead-config class B7 now probes for. Add a bidirectional inventory gate. |
| **New flag `hasDerivedStore` for `derived-data`** | `hasCache`; reuse `hasDb` | `hasCache` names a mechanism and invites stack-leak; reusing `hasDb` couples two independent surfaces and makes the N/A reason string lie. Naming it here unblocks `/bkit-plan` on #405. |
| **`contract-conformance` class = `security`** | keep Pass-3's `performance`; `reliability` | The class-weight ladder ranks `security` first and `performance` last. Keeping `performance` would rank the milestone's motivating root cause at the bottom of every tie-break. Consistent with `security`'s stated non-catch pointing here. |
| **Cross-lens knowledge is brokered by A4 only; no lens reads a sibling artifact** | `reliability` reads `contract-conformance`'s matrix directly | Sibling-blind + standalone-runnable are shipped prompt-authoring rules. A direct read also inverts the keystone (universal depending on conditional) and breaks single-lens re-runs under `[lenses=...]`. |
| **Add optional `subject:` to the finding schema as the correlation join axis** | join on `(class, normalized_location)` only; `correlation_id` assigned by lenses | The silent-corruption triple sits at three locations in three classes — the existing key provably cannot join it. `correlation_id` cannot be minted sibling-blind. Additive-optional matches the `source:` precedent. |
| **Add optional `evidence:` field; hollow-boundary marker is NEVER `confidence: low`** | overload `confidence`; free prose in `why:`; a 4th manifest state | `confidence: low` triggers the reference-signal down-rank fence, which would bar genuine boundary gaps from the top of the report. Prose does not survive dedup. A 4th state token breaks the three-token Step-6 grep-assert. |
| **`logic-dupe` guards ship in a `## Suggested Guards` artifact section with `guard-ref:` on findings** | new single-line `guard:` field; drop guard generation | The finding block forbids triple-backticks and caps fields at 200 chars — a guard cannot be a field value. A pass-through section keeps the PASSed schema untouched and audit read-only. |
| **`debt` cross-check narrows to `references[]`-vs-code; tracker reconciliation → WS-G** | grant `debt` a tool-surface exception | A third tool exception in a family whose invariant is "read-only reviewer" is a bad trade for one probe. State the narrowing so a build agent does not invent the check. |
| **Probe clauses state predicates, never helper names (`status != "CLOSED"`, not `isOpenWork()`)** | cite the helper | `isOpenWork()` does not exist in `.bkit/src/**`. Naming a non-existent symbol in a prompt is a hallucination vector. |
| **Version target: A + B + C in ONE minor — `4.11.0`** | A in 4.11.0, B/C in 4.12.0 | Shipping A alone fans out to 18 lens prompts that do not exist → 18 `crashed` rows → an unusable workflow whose only shipped audit surface is still the legacy family. A split is safe only by version-coupling the canonical slug enum, the manifest and the fan-out width to the shipped subset — more machinery than shipping together. Legacy `bkit-utility-audit-*` **deletion** stays blocked on #83/E1 independent of the version. `Deprecated since` resolves against `package.json#version` at build time; do not pin in the header. |
| **Relocation is targeted, NOT a blanket `.agents/` → `.bkit/` sed** | blanket replace | `.agents/docs.md`, `.agents/rules.md`, `.agents/skills.md`, `.agents/config.md` **still exist at `.agents/`**. Only `prompts/`, `workflows/`, `prompts.md`, `workflows.md` moved. #402's A7 row and #403's B12 row both say `.bkit/docs.md`, which does not exist — and B12 is a **probe target inside a lens charter**, so the error would ship into a prompt. |
| **Cite Appendix A of the design input or #403/#405 for amendment provenance; never the 404'ing `#80` comment IDs** | cite the IDs as given | Seven cited IDs return 404. Propagating them into the canonical doc manufactures dead references in the one surviving copy. |

---

## Cross-Approach Risks

Surface these in the design's `Risks & Open Questions` regardless of which fold shape is picked.

1. **`hasLLM` very likely auto-detects TRUE on bkit**, which makes #405's dogfood acceptance line (`ai-llm` renders `N/A — not applicable (hasLLM=false)`) unachievable. The design must state the expected dogfood outcome for `ai-llm` (N/A-by-flag vs `# Not Applicable (flag=true but no surface evidence)` vs `ran`). Getting this wrong invites "fixing" the heuristic — re-opening the false-negative hole the keystone exists to close.
2. **The false-all-clear invariant does not yet extend to the correlation rule.** On a `hasDb=false` repo the silent-corruption correlation is _not evaluable_, not _evaluated-clean_. If A4 simply produces no composed finding, the report reads as "no silent-corruption candidates" — a second false all-clear, one layer above the one the keystone fixed. The coverage manifest (or a sibling `## Correlations` section) must carry a `not evaluable ({flag}=false)` state for each correlation rule whose inputs include an N/A lens.
3. **The 25-finding cap can silently evict a correlation leg**, and the evicted leg is by construction the low-severity one. A truncated leg is indistinguishable from a clean one.
4. **`derived-data`'s flag is the hardest to detect and the most likely to false-negative**, landing straight in the existing "conditional-lens false-negative N/A is silent by construction" risk. Its inverse-evidence guard needs as much thought as the flag itself.
5. **Two amendments are currently unsatisfiable as written** — `debt`'s tracker cross-check (tool surface) and `logic-dupe`'s CI guard (finding schema). Both have acceptance criteria in #403 today.
6. **`debt` on the dogfood run will saturate its cap with true positives from bkit's own ledgers** and dominate the `maintainability` class, masking keystone signal. Dogfood acceptance must assert on manifest rows, not on the ranked list.
7. **Model pins are stale across the whole design** (`claude-opus-4-7` → `claude-opus-5` per current `.bkit/prompts.md`), as are the `.agents/scripts/*.ts` Done-When grep targets (now `.bkit/src/**`). Same contract-refresh family as Task 1 but not named in the session prompt's Task-1 list.
8. **18 lenses over 7 finding classes flattens the severity×class matrix** — `maintainability` alone now carries 7 lenses. The matrix was designed at 11 lenses. Either accept it, or introduce a sub-class axis (out of scope here — flag it).
9. **The R1-B1 canonical slug enum now has four copies** (doc table, workflow Step 6, synthesiser prompt, on-disk prompt set), up from three. The plan-time grep-assert must widen to four-way, and it belongs in CI rather than in a plan-time ritual nobody re-runs.
10. **Negative charter clauses are deletion-bait.** `security`'s stated non-catch, `reliability`'s non-self-assessment and the `confidence: low` prohibition all read as redundant to a future author. Each needs a greppable Done-When, in the pattern already used for `grep 'NEVER git checkout'` on `supply-chain`.
