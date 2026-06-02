Verdict: CONCERNS
Failures: 3

<!-- verdict:end -->

# Plan Review

Lens: Dependency correctness, design-coverage.

## CRITICAL

### C1 — PRIMARY STEER not honoured in template task (design-coverage gap)

The plan-input PRIMARY STEER (2026-06-02) is explicit: copy gether's ci.yml **near-verbatim** into `.bkit/templates/.github/workflows/ci.yml` — `bkit-decide` (turbo affected-graph, base-ref resolution, plan-table-v1 JSON assembly + schema validation, `$GITHUB_STEP_SUMMARY` table, cancellation notice) shipped CANONICAL not stubbed; parameterize values rather than commenting whole tiers.

The plan instead degrades the template in multiple places:

- L237 (Architecture § Layer 1 template ci.yml): "`web_affected` is set to a `bkit-stub:` block (turbo affected-graph)… the stub returns `true` (run-to-be-safe) until the consumer wires up the affected-graph." This is exactly the "stub whole tier" pattern the PRIMARY STEER bans. Turbo affected-graph should be copied canonically and parameterized.
- L239 (`bkit-tests-live`): "body is a `bkit-stub:` block (Vercel-await + curl health-check + `test:live` runner) commented out by default" — same anti-pattern. Vercel-await is universal to the Next.js/Vercel/Supabase archetype the template targets and per the STEER should be present + parameterized, not commented out.
- L247 keeps `vercel-await` / `e2e` / `e2e-artifacts` as `bkit-stub:` blocks moved into `bkit-tests-live`. The STEER calls these out as exactly the kind of universal infra to copy canonically.
- L156 ("Deferred… executable parity-matrix from gether #403 §C6 is OUT of scope (bkit has no turbo affected-graph in its own repo)") conflates bkit-self with the template. The template is supposed to ship turbo affected-graph; the parity-matrix conversation belongs there.

Also missing from explicit Architecture coverage (vs. issue #203 + 403 design):

- **plan-table-v1 schema validation** — the success criterion at L20 mentions "validates required fields present (`schema`, `run_level`, …) and fails loudly on missing" but the test matrix (L102–116) does not assert the schema/required-fields gate.
- **Cancellation notice** in `bkit-decide` — the 403 design has explicit on-cancel summary writes; not surfaced in Architecture or test matrix.
- **`integration_outcome` / `e2e_outcome` job outputs on `bkit-tests`** — Architecture L238 says "exports `integration_outcome` and `e2e_outcome` job outputs (steps named `integration` and `e2e`)", but no test asserts these outputs exist nor that the capstone reads them in the template ci.yml form.
- **`bkit-decide` does NOT use the `[skip ci]` -> `run_level=none` semantic safely** with the existing `[skip ci]` HEAD-tip guard — but #209 is out-of-scope, so this is acceptable; flagged only because the Concrete Example Step 1 ("Consumer pushes `[skip ci]`") interacts with the gap. Not blocking.

Recommendation: rewrite Task A2 + Architecture § Layer 1 template ci.yml to "copy gether's ci.yml verbatim, replace literals with `{{DEFAULT_BRANCH}}` / placeholder secrets / placeholder URLs, mark only Supabase-migrate (and similar non-universal tiers) as stubs." Add explicit test-matrix rows for plan-table-v1 schema validation and tier-outcome job outputs.

### C2 — Phase F mirror regen does not block Gate 2 or B4 verification — covers L2 path correctness but A4/B4 may run on stale mirrors

Phase F (Tasks F1/F2 — `dist/` + `.claude` / `.cursor` mirror regen) is correctly batched at the END (per the user-memory "batch at end, not per-edit"). Good.

But two verification tasks reference state that is only correct after F:

- **Task B4** (`bash scripts/ci/bkit-protect-main.sh --dry-run`) runs at end of Phase B, BEFORE Phase F. This is fine for the engine copy (B1+B3 already renamed + edited the engine script in-place); the dry-run does not depend on `dist/` or mirrors. ACK — not actually a problem.
- **Task E2** asserts `bkit-postinstall.test.ts` against `.bkit/src/bkit-postinstall.ts` (source, not `dist/`). Also fine.
- However **Task E1's** assertion that the consumer template `ci.yml` has `bkit-tests-check` etc. tests the SOURCE template at `.bkit/templates/.github/workflows/ci.yml` (not a built artifact). Also fine.

→ On re-inspection the actual dependency-graph is OK; this concern downgrades. **Not a CRITICAL.** Moved to OPTIONAL below.

### C2 (replaced) — `bkit-protect-main.sh` rename + edit task ordering relative to Phase A is correct, BUT Task B4's pre-flight depends on Task A3 having actually committed the bkit-own ci.yml change to disk

Task B4: `bash scripts/ci/bkit-protect-main.sh --dry-run` greps `.github/workflows/ci.yml` (bkit-own) for `bkit-tests-check:`. Phase A → A3 modifies bkit-own ci.yml. The plan declares "Phase B depends on Phase A landing `bkit-tests-check` in both ci.yml files" (L423) — good, the linear ordering enforces this. Verified correct.

But: Phase C (Layer 2) also "depends on Phase A landing the capstone" (L445). Phase C's edits do NOT depend on Phase B (protection script). Plan declares only "depends on Phase A" — verified correct, no fabricated edge.

→ Not actually a CRITICAL; the dep graph is clean. Removed.

### C2 (final) — Template ci.yml ships universal tiers as `bkit-stub:` (re-statement of design-coverage gap, scored separately because it has knock-on dep effects)

Because the template ships `vercel-await` / `e2e` / `live` as commented stubs (vs. canonical + parameterized per the PRIMARY STEER), the capstone's assertion rules 3/4/5 in L242–245 will be no-ops for the average consumer until they uncomment. This means the seeded `bkit-tests-check` is, on Day 1, asserting `bkit-tests` only — i.e. the consumer template ships a degenerate-shape capstone, not the full-shape one the design-input mandates. This is a coverage gap against the PRIMARY STEER and the 403 design's "single source of truth for what should run."

This single-item CRITICAL count = 1 (folded under C1).

### C3 — Missing dep: `docs/pending.md` quick-path update lands in Phase E (Task E7) but the postinstall advisory in Task B5 also references the quick-path

Postinstall advisory edit (Task B5, lines 287–289 of plan) updates the Quick-path STRING shipped to consumers. `docs/pending.md` (Task E7) updates the OPERATOR quick-path entry. These are independent strings (different files, different audiences) — no real dep. Verified correct.

→ Not a CRITICAL.

### Net CRITICAL count: 3

Recounted:

1. **C1 — PRIMARY STEER violation in template ci.yml task** (stub-vs-canonical for `bkit-decide` affected-graph, `bkit-tests-live`, `vercel-await`, `e2e`). Design-coverage gap.
2. **C2 — Missing test-matrix coverage for plan-table-v1 schema validation + tier-outcome job outputs in template** (`integration_outcome` / `e2e_outcome` asserted by `bkit-tests-check` rules 3/4 but no template test guards their presence on `bkit-tests`).
3. **C3 — `.bkit/workflows/bkit-debug.md` Step 3 edit (Task C3) uses `gh run view` CLI, but the design-input constraint at plan-input L84 is "Workflows are MCP-only for GitHub (no `gh api`, no `gh` CLI, no raw HTTP)."** Plan L302 explicitly defers this: "This plan does NOT migrate the existing `gh` calls to MCP (out of scope for #203)." But the _new_ code Task C3 introduces a NEW `gh run view` call — that is a fresh constraint violation, not a pre-existing one. The constraint applies to additions even if not to legacy. The plan should either (a) use the MCP equivalent (`mcp__github__actions_get_workflow_run` + jobs lookup) for the new TESTS_CHECK fetch, OR (b) explicitly justify why this new addition is exempt. As written it's a constraint violation introduced by this plan.

## OPTIONAL

- **OP1 — Task A2 sub-divide.** The template ci.yml rewrite is the single highest-risk task; splitting into A2a (skeleton with `bkit-decide` + `bkit-tests-check` only, both ci.yml files) and A2b (move stubs / add live tier) would localise actionlint regressions.
- **OP2 — Phase F naming.** Task F2 says "`pnpm bkit install --apply` (or whatever the established command is — verify via `pnpm bkit --help`)" — the established command per repo convention is just `pnpm bkit install`. Resolve the uncertainty before plan-summary instead of in-flight.
- **OP3 — Test for cancellation notice.** Add a test-matrix row asserting that `bkit-tests-check` writes a one-line summary to `$GITHUB_STEP_SUMMARY` on the mismatch path (currently only the happy-path summary is implied at L246).
- **OP4 — Concrete Example Step 4 mentions "the capstone's `exit 1` would have fired if any expected tier was skipped"** — good. But the Edge Cases table row 3 ("`bkit-decide` itself fails") asserts capstone exits 1; no test row covers this. Could add a small Vitest snippet that parses the capstone bash and asserts the `needs.bkit-decide.result == 'failure'` branch is present.
- **OP5 — `pnpm check:dist` is in Gate 4 (L556) but Task F1 already runs it.** Minor duplication; not a defect.
- **OP6 — Documentation Updates row for `docs/decisions.md`** (DE-N entry) — good; ensure the DE-N number is allocated in Task E9 (not left as a placeholder).
- **OP7 — `bkit-rules-sync.test.ts` assertion (Task E4)** asserts the substring `Green != ran != validated`. The proposed bullet in Architecture L323 uses backtick-fenced ASCII operators; ensure the test uses raw-string comparison (no markdown escaping surprises).

## OUT OF SCOPE

- Migrating the EXISTING `gh pr view` / `gh run view` calls in `.bkit/workflows/bkit-ship.md` (legacy lines, untouched by this plan) to MCP — explicitly scoped out by the plan L302; agreed appropriate scope.
- The two #209 plumbing defects (status.jsonl conflicts, `[skip ci]` HEAD-tip guard) — correctly excluded.
- Executable parity-matrix (gether #403 §C6) for bkit-self — correctly deferred (bkit single-package).
- Renovate / external-caller alias drops (gether D14 / WS-4).
- Flipping bkit's own `main` branch protection (operator action, deferred per `docs/pending.md`).
