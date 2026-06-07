Verdict: CONCERNS

<!-- verdict:end -->

# Design Review

Lens: Buildability — stack feasibility, library fit, integration risk.

This design generalises the already-shipped `status.jsonl` machine. The substrate (P1) and grader (P2) sit squarely on proven, in-repo patterns and are buildable as written. The CLI-surface assumptions (comply/harvest/analysis/migrate verbs), the GateGuard install-time codegen, and one part of the exemption surface (Vale) rest on claims that do not match the current code. None is fatal, but several "EXISTING pattern" justifications in the Decisions table are factually wrong and the plan must not inherit them uncorrected. Hence CONCERNS, not PASS.

## Ecosystem Search

This is bkit's own repo dogfooding its stack; "ecosystem" here = the existing in-repo machinery the design proposes to reuse. Per capability:

- **Append-only NDJSON ledger + fold reducer.** What exists: `.bkit/src/bkit-status.ts` (`fold`, `parseStatus`, `appendLine`, `identity`, `validateInvariants`) + `docs/plans/**/status.jsonl merge=union`. Maturity: shipped, production, unit-tested, dogfooded every workflow run. Fit: near-exact match — the design is a 1:1 generalisation. Gap: the new envelope adds `kind`-discriminated union payloads, per-`kind` identity, `foldFrom(paths[])`, and a `validate()` that REJECTS unknown `kind` (status.ts has no reject-on-write path). Recommendation: **ADAPT** `bkit-status.ts` (clone + extend), as the design states.
- **Inline-jq close-step writer.** What exists: `jq -nc --arg … '{…}' >> "$STATUS"` throughout `.bkit/workflows/bkit-ship.md` (lines 58, 311-317, 384, 432). Maturity: shipped. Fit: exact. Recommendation: **USE-AS-IS** idiom. Note the existing rows use ISO `at` (`date -u +%FT%TZ`); the new rows use ms `ts` (`date +%s%3N` or jq `now*1000`) — a real divergence (see below).
- **Advisory / fail-open deterministic gate.** What exists: `.claude/hooks/gateguard.cjs` (`7732d69`) — advisory-by-default, deny-ramp behind env, fail-open top-level catch, `GATE_CONFIG_PATTERNS` table. Maturity: shipped + behavioural test suite (`bkit-gateguard.test.ts`). Fit: precedent for grader's advisory/fail-open posture. Gap: GateGuard is a `.cjs` hook installed by **byte-equal copy** (`writeTier1`, `bkit-modules.ts:697-701`), NOT codegen — see Stack Feasibility. Recommendation: **ADAPT** the posture; **BUILD-CUSTOM** the shared-table mechanism (no existing codegen precedent).
- **Exemption surface (gitattributes / slop / Vale / manifest).** What exists: `.gitattributes` scoped-union block (markered, `merge=union` per explicit path, with the explicit anti-blanket-glob comment), `slop-scan.config.json` `ignores[]`, `.vale.ini` scoped path blocks, manifest `format` classification. Maturity: shipped. Fit: gitattributes + slop + manifest fit cleanly. Gap: **Vale never sees `.jsonl`** (see below). Recommendation: **USE-AS-IS** for gitattributes/slop/manifest; **DROP** the Vale exemption (unneeded).
- **bkit CLI verb dispatch.** What exists: `bkit-cli.ts` `Verb = "install" | "check" | "doctor" | "uninstall" | "upgrade" | "help"`; bin → `dist/bkit-install.js`; unknown verb → `process.exit(1)`. Maturity: shipped install-engine. Fit: POOR for `comply`/`harvest`/`analysis`/`telemetry migrate` — these are NOT install-engine verbs and there is no sub-verb parser today. Recommendation: **BUILD-CUSTOM** the new verb plumbing (feasible but genuinely new surface, not "register one line").

## Stack Feasibility

Buildable with the approved stack (TypeScript + Vitest + jq + the install engine). No new infra category. Three feasibility corrections the plan must absorb:

1. **CLI verbs are net-new plumbing, not a one-liner.** The design says "Register the `comply` verb in `bkit-cli.ts` (`Verb` union) + usage" and proposes `harvest`/`analysis`/`bkit telemetry migrate`. The current CLI (`bkit-cli.ts`) hard-codes the five install-engine verbs, has NO sub-verb (`telemetry migrate`) parser, and the `bkit` bin points at `dist/bkit-install.js`. Adding read/grade/migrate verbs means: extend `Verb`, add value/sub-verb parsing, add dispatch, decide whether these live in the same binary as the install engine (mixing "mutate consumer repo" with "grade a diff" / "harvest other repos" in one entrypoint is an architectural choice the design does not make). Feasible, but it is real design+build work that P2/P4/P5 understate.

2. **GateGuard shared-table "install-time generation" has no existing precedent.** The Decisions table asserts "Install-time codegen is the EXISTING bkit pattern for mirrors." It is not. `gateguard.cjs` is installed by byte-equal copy of a pre-written template (`bkit-modules.ts:697`, `writeTier1`). The mirror engine DOES support a `transform(content)` hook (`installFile`, `bkit-modules.ts:90-109`), but every existing transform rewrites `.agents` markdown into a mirror dialect — none reads a TS-exported constant and injects it into a `.cjs`. So this is BUILD-CUSTOM, not reuse. The lower-risk, in-idiom alternative the design under-weights: generate `gateguard.cjs` (or a `gate-paths.generated.cjs`) from the TS table as a committed, checked-in artifact with a parity/drift test (the same discipline used for the TS-canonical / inline-jq parity), and keep install as a byte-equal copy. The plan should pick the committed-generated-file route and not assume an install-time codegen path exists.

3. **`merge=union` per-`kind` composite dedup is sound and matches `bkit-status.ts`.** `status.ts:62-65` dedupes `step-done` by `(workflow, step, parentSha, at)` — a composite tuple, exactly the model the design generalises. The per-`kind` identity tuples in the Data Model (`compliance` by `(repo, workflow, parentSha, rule)`, `counter` by `(repo, workflow, parentSha, counterName)`, `run-outcome` by `(repo, prNumber)`) are buildable and pinnable by unit test as proposed. One latent risk the plan must close: `friction`/`deferral`/`failure`/`knowledge` identity is "logical key (e.g. normalized category+scope+description-hash OR an explicit written-once key)" — that is still an OPEN QUESTION in the design, and the entire instinct-loop fold (confidence/recurrence) depends on it. A hash over LLM-authored free text is fragile (any reword forks the key); the explicit written-once `key` field is the only robust option and should be decided before P1 build, not deferred.

## Library / API Evaluation

No new third-party libraries. Stays within existing deps:

- **jq** — already a hard dependency of the workflow hot path (`status.jsonl` writers). ms timestamp via jq `now` (`(now*1000|floor)`) or shell `date +%s%3N` (note: BSD/macOS `date` has no `%N`; `date +%s%3N` yields `1700000000N` literal on macOS — must use `jq 'now*1000'` or `node -e` for portability). This is a concrete, testable build detail the plan must pin (the workflows run on macOS dev machines).
- **Vitest** — existing test runner; clone `bkit-status.test.ts`. Fine.
- **slop-scan `^0.3.0`** — `lint:slop` runs `slop-scan scan .` over the whole tree, so adding the four `.jsonl` paths to `ignores[]` is correct and cheap insurance. License/maturity already accepted in-repo.
- **Vale** — `lint:prose` passes an EXPLICIT `find` list of `.md` files only (`package.json:50`); `.jsonl` is never handed to Vale. The `[*.md]` scope in `.vale.ini` cannot match `.jsonl` regardless. **The proposed per-file `.vale.ini` scope block for each `.jsonl` is dead config** — it adds four (later six) maintenance points that do nothing. Drop it from the exemption surface; the design's success-criterion #5 and the Boundaries section should both be corrected.
- **GitHub API (#183 backfill, P4)** — per MEMORY, workflows are MCP-only for GitHub; but the analysis CLI is a TS script, not a workflow, so direct API use there is acceptable. The design says "GitHub-API historical backfill" without specifying auth/rate-limit/pagination — fine to defer to P4 plan, but flag it as unspecified.

## Integration Risk

- **Manifest treatment is CORRECT.** Verified: `status.jsonl`, `friction.md`, `pending.md`, `knowledge.md`, `decisions.md` are NONE of them manifest entries (`bkit-manifest.ts`). Git-tracked ledger content is seeded via template-copy / `COPY_EXCLUDE` handling (`bkit-modules.ts:313-328`, `friction.md` listed), never via `format` entries. Keeping the four `.jsonl` files out of the manifest faithfully matches today's handling. PASS on this point.
- **`.gitattributes` blast radius.** The four explicit scoped lines go inside the `bkit:start`/`bkit:end` markered block (format `markered-text`, `bkit-manifest.ts:158`); the existing anti-blanket-glob comment (`.gitattributes:16-18`) already documents the exact footgun the design respects. Low risk; validate with the real attribute resolver per MEMORY ("validate shipped config with the real tool").
- **Template inheritance.** Consumers must inherit the new gitattributes lines + slop ignores; templates live under `.bkit/templates/`. The design notes this (P1.2) — sound.
- **P3 control-flow blast radius (highest in-repo risk).** Rewriting `*_ATTEMPT`/`MAX_*` control-flow across all 5 workflows touches the loop/escalation logic that drives every run. Staged migration + the `status.jsonl` invariant check as canary + fail-open is the right mitigation. This phase is independently shippable but is the one most likely to wedge a live run; it correctly sequences AFTER P1/P2.
- **P5 consumer migration (the bricking class).** The design's opt-in/dry-run-by-default/writes-alongside/dogfood-tarball-first stance directly answers the `611b438` pinnedCommit scar and the MEMORY entries ("verify install AND upgrade live", "dogfood via packed tarball, not the repo"). The explicit REJECTION of engine-auto-migrate-on-upgrade is the correct call. Low residual risk PROVIDED the migration CLI is NOT wired into `bkit upgrade` at all (not even a nudge that mutates) — the plan must keep it a separate, manually-invoked verb.

## PoC Approach

Minimal proof, in dependency order (do not build):

1. Clone `bkit-status.ts` → `bkit-telemetry.ts` with the envelope, ONE `kind` (`friction`), per-`kind` `identity`, `fold`, tolerant `parse`, `validate(reject unknown kind)`. Add `bkit-telemetry.test.ts` proving: fold dedupes same-key under union; an inline-`jq`-written row parses identically under `parse`; `parse` SKIPS a half-written tail line without throwing.
2. Seed `.bkit/friction.jsonl`; add ONE explicit `.gitattributes merge=union` line in the markered block + one `slop-scan ignores[]` entry; run `git check-attr merge .bkit/friction.jsonl` to prove the real resolver returns `union` and that `.bkit/*.jsonl` is NOT blanket-matched.
3. Wire one inline-jq friction writer into one workflow close step; confirm best-effort (write failure does not abort).

If green, the substrate (P1) is proven and the rest is mechanical repetition + the new CLI verbs. This is describable in under 200 words → not itself a CONCERNS trigger.

## Unknowns & Blockers

- **ms `ts` portability.** `date +%s%3N` is GNU-only; macOS dev shells need `jq 'now*1000'` or `node`. Pin the exact ms-emit expression before P1 build and parity-test it.
- **Logical-key definition (friction/deferral/failure/knowledge).** Design leaves this OPEN; the instinct-loop fold is unbuildable without it. Decide explicit-written-`key` vs free-text-hash before P1. (Recommend explicit key.)
- **`parseStatus` is NOT tolerant.** The design repeatedly claims the tolerant reader works "exactly as `parseStatus` tolerates malformed lines" — but `parseStatus` (`status.ts:139`) does `JSON.parse(l)` with no try/catch and WILL throw on a malformed line. So this is a NEW behaviour (`bkit-telemetry.parse` must catch+count per line), not an inherited one. The design's framing is wrong; the requirement is real and correct — just not "already done."
- **CLI architecture decision.** Do read/grade/harvest/migrate verbs share `dist/bkit-install.js` (the install engine binary) or get a separate entrypoint? Unresolved; affects bin, dispatch, and blast radius (a grader crash must never touch the install path).
- **GateGuard shared-table mechanism.** Committed-generated-file + drift test (recommended) vs true install-time codegen (no precedent). Decide in P2 plan.
- **Open questions already enumerated by the design** (per-phase grader rollout, rule-table location, verb namespace, GitHub-API backfill scope, rollup retention) are appropriately deferred to plan/design-organise.

## Verdict Reasoning

CONCERNS, not PASS: the design is buildable and the architecture is right, but three load-bearing "this is the EXISTING pattern" claims are inaccurate and would mislead the plan if carried verbatim — (1) the new CLI verbs are net-new plumbing, not a union-type one-liner; (2) GateGuard install-time codegen is not an existing pattern (gateguard.cjs is a byte-equal copy); (3) the Vale exemption is dead config because Vale never receives `.jsonl`, and the "tolerant like parseStatus" framing is wrong because parseStatus is not tolerant. All are addressable in plan without changing the architecture, so not FAIL. No locked decision (1-6) is dropped or contradicted; #58 is in scope with its own phase; the manifest exclusion, per-`kind` composite dedup, anti-blanket-glob, and copy-only-harvest / opt-in-P5-migration risk controls are all faithful and correct. P1-P5 sequencing is sound and each phase is independently shippable and additive.

## CRITICAL

Must be addressed before/in the plan:

- **Correct the three inaccurate "existing pattern" claims** in the Decisions/Boundaries text so the plan does not inherit them: (a) new CLI verbs (`comply`/harvest/analysis/`telemetry migrate`) are net-new dispatch+parsing work, not a `Verb`-union edit; (b) GateGuard shared table is NOT install-time-codegen-by-precedent — choose committed-generated-file + drift test (recommended) or accept it as genuinely new mechanism; (c) drop the Vale exemption entirely (Vale only lints the explicit `.md` find-list; `.jsonl` is never scanned).
- **Fix the "tolerant like `parseStatus`" premise.** `parseStatus` throws on malformed lines; `bkit-telemetry.parse` must add new per-line try/catch+count. Treat as new behaviour with its own test (half-written tail line), not inherited.
- **Decide the logical-key for friction/deferral/failure/knowledge before P1.** The instinct-loop fold (confidence/recurrence) is unbuildable without it; prefer an explicit written-once `key` over a free-text hash (LLM reword forks the key).
- **Pin the ms-`ts` emit expression** (`jq 'now*1000'` / node, NOT `date +%s%3N`) for macOS portability, and parity-test it.

## OPTIONAL

- Decide whether the read/grade/harvest/migrate verbs share the install-engine binary or get a separate entrypoint; isolating them protects the install hot path from a grader/harvest crash.
- Add `git check-attr` resolver validation of the rendered `.gitattributes` to the P1 plan acceptance (per MEMORY: validate with the real tool, not string-presence).
- The design carries both `references[]` and `aliases[]` per locked decision #5 — confirm the generated committed `KN-`/`DE-`→row lookup table (P5) is itself git-tracked + exempt, same as the data files.

## OUT OF SCOPE

- #183 GitHub-API backfill auth/rate-limit/pagination detail — defer to P4 plan (correctly deferred by the design).
- Rollup/archive retention threshold + whether `.bkit/archive/**` is committed or git-ignored — deferred to P4; `foldFrom(paths[])` shipping in P1 is the only hard requirement to keep readers forward-compatible (correctly flagged).
- Offline `pass^k` grader fixture tier — explicitly out of scope per locked decision #6; honoured.
