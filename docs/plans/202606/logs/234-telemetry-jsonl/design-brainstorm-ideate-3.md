# Design Brainstorm & Ideas

Lens: Risk premortem — failure modes, scale, time, handover.

> Scope note: I treat the locked decisions in `design-input.md` (one-line metric+prose, `ts`=ms id, event-sourced fold, agent-read, `references`/`aliases`, deterministic advisory grader) as approved and do NOT relitigate them. These approaches differ on **how the substrate, schema-evolution, install/upgrade migration, and consumer-harvest plumbing are structured** — the parts the locked decisions leave open and where the repo-bricking failure class lives.

Grounding facts I am building on (verified in-repo, not assumed):

- `merge=union` is already in use, scoped via `.gitattributes` markered block to `docs/plans/**/status.jsonl` with an **explicit warning against a blanket `*.jsonl`** ("union would corrupt a consumer's non-append-only .jsonl data on merge"). `.gitattributes` is `format: "markered-text"` in the manifest (consumers append outside the block).
- `bkit-status.ts` is the canonical fold/dedupe reducer (`fold`, `parseStatus`, `validateInvariants`, identity-by-tuple) with a tolerant reader that already accepts both `status.jsonl` and legacy `status.json`. This is the proven pattern the new substrate should clone.
- The manifest (`bkit-manifest.ts`) drives install/upgrade/uninstall by `format` (`markered-text` | `byte-equal-text` | `json`) + `seedOrPrint`. The append-only ledger files are NOT manifest entries today (only `.gitattributes` is) — they are git-tracked content, not engine-managed payload. That is exactly the exemption the grader spec demands.
- GateGuard (`gateguard.cjs`) is the proven "deterministic advisory, fail-open, dogfood-gated deny ramp behind an env var" precedent the grader should mirror.
- `utility-harvest-friction` reads `docs/bkit-consumers.md` → `git worktree list --porcelain` per consumer → harvests content after `<!-- bkit:end -->`, **truncates source, caller commits**. The JSONL harvest replaces this.
- The pinnedCommit bricking (`611b438` revert) and MEMORY's "install != upgrade — verify both live" + "dogfood via packed tarball, not the repo" are the load-bearing scars for P5.

---

## Approach A — Single library + per-purpose files, schema-versioned envelope, harvest never writes consumer repos ⭐ Recommended

**Summary (one sentence):** One `bkit-telemetry.ts` library owns the envelope/`kind`/fold/append/validate contract (cloned from `bkit-status.ts`), four sibling files (`.bkit/{stats,friction,deferrals,failures}.jsonl`) each carry a `schemaVersion` on every row, the grader is a GateGuard-style advisory script, and the harvest collector is **copy-only (never truncates/writes consumer repos)** so the consumer-blast-radius failure class is structurally impossible.

### Premortems

**10x scale (10x consumers, 10x rows/file, 10x harvest fan-out):**

- _What breaks:_ Per-file append stays O(1) write; the risk is **read-side fold cost** — analysis CLI and per-workflow summary re-read+fold the whole file each run. At 10x, `stats.jsonl` grows fastest (every workflow×step writes counters+compliance). The harvest fan-out (N consumers × M worktrees × 4 files) is the other hotspot; a single slow/locked consumer repo stalls the whole pass.
- _Observability:_ Emit row-count + byte-size + fold-time per file in the workflow summary step (cheap, already reading the file). Harvest logs per-consumer (files found, rows copied, skipped+reason) so a stall is attributable.
- _Recovery:_ Bounded growth handled by a **rollup/archive** step at ship (fold→snapshot oldest rows into `.bkit/archive/{file}.{YYYYMM}.jsonl`, keep tail hot) — deferred to P4 but designed-for now via a `foldFrom(paths[])` signature that reads archive+hot. Harvest stall → per-consumer timeout + continue (skip, record `harvest-skip` row), never blocks the whole pass.

**6 months later (drift, undocumented invariants, magic numbers):**

- _What breaks:_ The dangerous drift is **schema drift without a version** — someone adds a field to a `failures` row, the analysis CLI silently mis-buckets old rows. Magic numbers: `MAX_*` thresholds (#58) and `graderVersion` rule IDs.
- _Observability:_ `schemaVersion` on **every** row makes drift visible and the CLI can branch/warn on unknown versions instead of silently coercing. `graderVersion` + `bkitVersion` stamped on every grader row makes "regression appeared at release X" answerable. One config file for all `MAX_*` (per #58 acceptance) + all grader rule specs co-located with the grader source.
- _Recovery:_ Unknown `schemaVersion` → CLI surfaces "N rows at unknown schema vX, run `bkit telemetry migrate`" rather than crashing or lying. The fold reducer is unit-tested (clone `bkit-status.test.ts`), so the "current state" derivation can't silently rot.

**On-call at 3am (page shape, diagnosability, recovery):**

- _What breaks:_ This substrate is **advisory and never gates**, so it should never page directly. The realistic 3am page is _adjacent_: the #58 counter refactor (P3) rewrites loop/escalation control-flow across all 5 workflows — a bad `check_max`/`decide_next` could wedge a workflow mid-run, or `merge=union` interleaving could produce a malformed line that crashes the fold a workflow depends on.
- _Observability:_ `validateInvariants`-style guard on append (reject malformed before write); the fold reader is **tolerant** (skip unparseable lines, count them, never throw) exactly like `parseStatus`. The #58 invariant check (`counters.verifyAttempt == count of plan-verify rows` via jq) is the canary.
- _Recovery:_ Because rows are immutable append-only, recovery is "delete the bad tail line and re-run" — never a state-mutation rollback. The grader/summary failing must **degrade to a warning**, never abort the workflow (GateGuard fail-open contract). Document the "malformed line → which line → delete + re-append" runbook in `docs/knowledge.md`.

**Author leaves (bus factor, tribal knowledge):**

- _What breaks:_ The envelope/`kind`/`schemaVersion` contract and the grader rule-spec semantics are the concentrated knowledge. If undocumented, a successor adds a `kind` the CLI doesn't understand, or grades a rule that no longer maps to a real prohibition.
- _Observability/handover:_ Single `bkit-telemetry.ts` as the **one canonical contract** (like `bkit-status.ts` is "the CANONICAL reference reducer") + an exported TS type per `kind` payload + a doc section in `docs/architecture.md` enumerating files, `kind`s, and per-`kind` required fields. Grader rule specs are data (one table), each row citing the rule it grades.
- _Recovery:_ New `kind` or rule is a typed, unit-tested addition with a fixture row — the test suite is the executable spec.

### Risk-mitigation guidance (fold onto whichever approach is picked)

- **Harvest is copy-only, dedup-by-`ts`+`repo`, never truncates or writes consumer repos.** This is the single most important divergence from `utility-harvest-friction` (which truncates source). The friction-truncate model made sense for prose moved into bkit; for telemetry, the consumer's own `.bkit/*.jsonl` is the consumer's data and analysis history — copying (not moving) it means a harvest bug can never destroy consumer data. This structurally pre-empts the pinnedCommit-class bricking on the read side.
- **Scope `merge=union` to the exact four paths, never `.bkit/*.jsonl`.** The existing `.gitattributes` comment already forbids the blanket glob; reuse that discipline. Knowledge/decisions JSONL (P5) get their own explicit lines when added.
- **Keep the four ledger files OUT of the manifest** (git-tracked content, not engine payload) — only `.gitattributes` (markered) and the rules.md/template blocks are engine-managed. This is what "exempt from install/mirror + slop + Vale" means concretely: do not add `format` entries for them, and add their paths to the slop-scan + Vale ignore configs (per the per-file opt-out rule, not a blanket "skip .jsonl").
- **`schemaVersion` on every row from day one** — cheapest insurance against the silent-mis-bucket failure; retrofitting it later is impossible (rows are immutable).
- **Append via a single shared shell helper** (the jq/printf path the workflows call), mirroring the `bkit-status.ts` "TS is source of truth, workflows run an inline jq filter that mirrors fold exactly" split — so prose-written rows can't drift from the typed contract.

---

## Approach B — Unified `telemetry.jsonl` single file, `kind` does all partitioning

**Summary:** Collapse stats/friction/deferrals/failures into **one** `.bkit/telemetry.jsonl`; `kind` (already the locked discriminator) is the only partition; analysis/harvest filter by `kind`. Fewer files, one `.gitattributes` line, one append path, one harvest copy.

### Premortems

**10x scale:**

- _What breaks:_ One file is the contention + growth hotspot — every workflow step appends to the same file, and at 10x every read folds _all_ kinds even when the summary only needs `stats`. `merge=union` interleave is now across all record types, so a malformed `failures` row can wedge a fold that the `stats` summary needs. Blast radius of one bad writer is the whole telemetry surface.
- _Observability:_ Harder — can't eyeball "friction is growing fast" without a per-`kind` count pass.
- _Recovery:_ Rollup must partition-by-`kind` before archiving, which is more complex than per-file tail-archive.

**6 months later:**

- _What breaks:_ The single file becomes a junk drawer; the temptation to add ad-hoc `kind`s with no schema is higher because there's no file-level boundary forcing a decision about _where_ a record type lives. Rules.md "any bug → failures" + "never drop → deferrals" lose their clean file mapping — the rule now points at "a `kind` inside the big file," weaker affordance for both humans and the grader.
- _Observability:_ Same `schemaVersion` mitigation applies, but drift is harder to spot per-kind.

**On-call at 3am:**

- _What breaks:_ A malformed line has maximal blast radius — every consumer of telemetry shares one fold. Tolerant reader mitigates but the coupling is real.
- _Recovery:_ Same delete-bad-line, but you must find it among all kinds.

**Author leaves:**

- _What breaks:_ Lower file-count is _easier_ to hand over at first glance, but the implicit "what kinds live here and what's their schema" knowledge is heavier and entirely in one place.
- _Observability/handover:_ Mitigated only by a strong `kind` registry doc.

### Risk-mitigation guidance

- If chosen, make `kind` a **closed enum validated on append** (reject unknown kinds) so the junk-drawer failure is gated.
- Per-`kind` count + size in the summary step to restore the observability that per-file naturally gives.
- Same copy-only harvest, same `schemaVersion`, same union-scope discipline as Approach A.

_Trade-off vs A:_ B is simpler plumbing (one file, one attribute line, one append path) and the `kind` discriminator is already locked, so it's not adding a concept. But it concentrates blast radius, weakens the rules.md→file affordance ("bug → failures.jsonl" is a clearer instruction than "bug → a row in telemetry.jsonl"), and complicates per-purpose rollup. The design-input explicitly says "one file per purpose," so A honours the locked intent; B would reopen that decision. **A preferred.**

---

## Approach C — Engine-managed migration of consumer ledgers (P5 as a first-class install/upgrade transform)

**Summary:** Frame P5 (knowledge/decisions → JSONL) as a **manifest-driven, upgrade-engine migration**: the upgrade engine reads each consumer's `docs/knowledge.md`/`decisions.md`, parses KN-/DE- entries, and writes `docs/{knowledge,decisions}.jsonl` with `aliases:[KN-14]`, in-place, during `bkit upgrade`. This is the "do the migration _for_ the consumer" approach.

> This is **not** a competing whole-feature approach — it's a specific stance on P5 only, surfaced because P5 is where the design-input flags the highest blast radius ("touches every consumer's own knowledge.md/decisions.md with their own KN-/DE- ids; beware the install↔dogfood divergence class that just bricked the repo"). I include it to argue _against_ it as the default and define the safer fold-in.

### Premortems

**10x scale:** A parser bug now runs across 10x consumer repos automatically on upgrade — the pinnedCommit failure class, exactly. One malformed `docs/knowledge.md` (consumers hand-edit these) crashes or corrupts the migration for that repo.

**6 months later:** The KN-/DE- parser is a permanent liability: it must keep understanding every historical prose shape consumers ever wrote. ~1,460 references across engine source, plans, CHANGELOG, consumer repos depend on `aliases` resolving — a parser that drops one alias silently breaks reference resolution months later.

**On-call at 3am:** "bkit upgrade corrupted my knowledge.md" is a consumer-facing page with no bkit-side telemetry (it happened in the consumer's repo). Diagnosis requires their git history.

**Author leaves:** The parser's tolerance heuristics are deep tribal knowledge; a successor can't safely touch it.

### Risk-mitigation guidance (this is the recommended P5 stance)

- **Do NOT auto-migrate consumer ledgers in the upgrade engine.** Instead: ship a **`bkit telemetry migrate` opt-in CLI** the consumer runs deliberately, that is **dry-run-by-default**, writes the new `.jsonl` **alongside** (never deletes the `.md`), and prints a diff/summary. Clean-break is honoured: the `.md` stays read-only-legacy, new entries go to `.jsonl`; `aliases` bridge old refs. This matches MEMORY's "verify install AND upgrade live, separate engines" + "dogfood via packed tarball, not the repo" — the migration must be exercised against a packed tarball in a clean consumer dir before it touches anyone.
- **bkit's own repo migrates first, by hand-reviewed CLI run, as the dogfood** — and the parser is validated against bkit's real `knowledge.md`/`decisions.md` corpus (the "validate with the real tool, not string-presence tests" rule), not synthetic fixtures.
- Keep KN-/DE- → `aliases` mapping as a **generated, committed lookup table** the CLI emits, so reference resolution is auditable, not a runtime re-parse.

---

## Decisions

| Decided                                                                                                          | Alternatives                                | Why                                                                                                                                                   |
| ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Four per-purpose files (A)                                                                                       | Single `telemetry.jsonl` (B)                | Honours locked "one file per purpose"; isolates blast radius; clean rules.md→file affordance ("bug → failures.jsonl"); per-file rollup simpler.       |
| One `bkit-telemetry.ts` canonical library, workflows run a mirroring jq append (clone of `bkit-status.ts` split) | Each workflow hand-writes JSON inline       | Proven pattern in-repo; prevents prose-written rows drifting from typed contract; unit-testable fold/validate.                                        |
| Grader = GateGuard-style deterministic advisory, fail-open, dogfood-gated deny behind env var                    | Grader gates the close step                 | Locked "advisory never gates"; GateGuard is the proven precedent; a gating grader re-introduces flakiness risk into the workflow it measures.         |
| Harvest = copy-only, dedup by `ts`+`repo`, never writes/truncates consumer repos                                 | Truncate-source (friction model)            | Telemetry is the consumer's own analysis history; copy makes a harvest bug non-destructive; pre-empts the consumer-bricking class on the read side.   |
| P5 consumer migration = opt-in dry-run-by-default CLI, writes alongside `.md`                                    | Engine auto-migrates on `bkit upgrade` (C)  | Auto-migration is the pinnedCommit bricking class at consumer scale; opt-in + dogfood-first + tarball-validated is the scarred-lesson-compliant path. |
| `schemaVersion` on every row from P1                                                                             | Add versioning later                        | Rows are immutable append-only — retrofitting is impossible; cheapest drift insurance.                                                                |
| Keep ledger files out of the manifest; only `.gitattributes`/rules/template blocks are engine-managed            | Add `format` entries for the `.jsonl` files | Concretely realises "exempt from install/mirror + slop + Vale"; matches how status.jsonl is handled today.                                            |

## Cross-Approach Risks

- **`merge=union` blanket-glob footgun.** Under no approach may union be applied as `.bkit/*.jsonl` — the existing `.gitattributes` comment forbids it (corrupts consumers' non-append-only jsonl). Each file gets an explicit line. Surface in Risks & Open Questions.
- **Prose-written rows are still LLM-authored for free-text fields.** The locked "metric+prose in one line" means `description`/`root_cause` are model-written; only the _typed_ fields (#58 counters) are deterministic. The compliance/attempt **stats** are trustworthy only after P3; until then, attempt counts are the model's self-report. Don't report attempt-rate analysis as trustworthy pre-P3.
- **`ts`=ms collision under union merge.** Two branches writing rows at the same ms with the same logical key both survive union (no dedupe at git level). The fold reducer must dedupe by a composite identity (like `bkit-status.ts` does by tuple), not by `ts` alone. Locked-decision §3's "same logical key" needs an explicit identity function defined per `kind`.
- **`aliases` reference-resolution correctness is load-bearing for ~1,460 refs.** Any approach that touches KN-/DE- must guarantee every old id resolves; a generated committed lookup table (not runtime re-parse) is the safe form.
- **Unbounded growth + rollup is deferred (P4) but must be designed-for in P1** via a `foldFrom(paths[])` signature reading archive+hot, or the migration to archived storage later breaks every reader.
- **`graderVersion` + `bkitVersion` must be on every grader/stats row** for the #183 release-attributed-regression join (`bkitVersion` → CHANGELOG) to work; missing either makes regression attribution impossible after the fact.
- **Install↔dogfood divergence (P5).** The migration CLI must be exercised via packed tarball in a clean consumer dir AND on bkit's own repo, separately — `bkit check` != live migration, per the scarred lesson that just bricked the repo.
- **No-concurrent-workflows + single-clone serialisation** already enforced (MEMORY + locked §6) — but harvest reading consumer worktrees while a consumer runs its own workflow could read a half-written tail line; harvest's tolerant reader must skip unparseable trailing lines.
