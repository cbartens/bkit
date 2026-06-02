Verdict: CONCERNS
Failures: 3

<!-- verdict:end -->

# Plan Review — #203 (parallel reviewer 1)

Lens: Tightness, scope discipline, design-coverage.

## CRITICAL

### C1 — Copy-fidelity steer is NOT honored for the template ci.yml (PRIMARY STEER violation)

- **Location:** `Architecture & Component Changes` § Layer 1 § `[MODIFY] .bkit/templates/.github/workflows/ci.yml` (lines 233-250); Task A2 (lines 411-413); `Out of Scope` (line 167); `Alternative Approaches & Recommendations` (line 153 "Rejected: copy gether #403's live ci.yml verbatim ... Generalize the SHAPE; ship app-specific tiers as `bkit-stub:` blocks").
- **Problem:** The PRIMARY STEER at the top of `plan-input.md` explicitly says: "copy as much of the gether ci.yml as makes sense … Copy as CANONICAL (not stubbed): the whole `bkit-decide` job (turbo affected-graph, base-ref resolution, …), the `bkit-tests-check` capstone, and the verbose-ci wiring. These generalize and should be near-verbatim. Parameterize, don't delete. Stub ONLY the genuinely-not-universal tiers …" and explicitly inverts the previous framing: "the plan's template task(s) must reflect 'copy + parameterize,' not 'generalize + stub.'"
- The draft does the OPPOSITE in three places:
  1. Architecture L237 wires `web_affected` as a `bkit-stub:` block ("turbo affected-graph … the stub returns `true` (run-to-be-safe) until the consumer wires up the affected-graph") — the steer says turbo affected-graph should be COPIED near-verbatim into the template (Next.js/Vercel/Supabase/turbo archetype is already the template's target).
  2. Architecture L239 leaves the entire `bkit-tests-live` body as a "`bkit-stub:` block commented out by default" — steer says "Prefer 'present + parameterized' over 'commented-out `bkit-stub:` block.'"
  3. The "Rejected: copy gether #403's live ci.yml verbatim" entry at L153 directly contradicts the new steer. It must be flipped (or removed) so the plan reflects the user's 2026-06-02 directive, not the pre-steer position.
- **Suggested fix:** Rewrite the `.bkit/templates/.github/workflows/ci.yml` task so it (a) copies gether's `bkit-decide` job near-verbatim including turbo affected-graph and base-ref resolution, parameterizing only `{{DEFAULT_BRANCH}}` / action SHAs / Node version / project URLs / secret names; (b) copies `bkit-tests` (Vercel-await + E2E + integration) and `bkit-tests-live` as present-and-parameterized jobs, not commented stubs; (c) restricts `bkit-stub:` framing to genuinely-not-universal tiers (e.g. Supabase migrate). Flip the "Rejected: copy verbatim" alternative entry to "Accepted: high-fidelity copy (gether is the template archetype)" and reference the PRIMARY STEER. Update Task A2 Done-when to assert the template contains the turbo affected-graph step (literal, not stub) and a non-commented `bkit-tests-live` job body.

### C2 — Layer-2 task scope quietly preserves `gh` CLI mixing while plan-input says "Workflows are MCP-only"

- **Location:** Architecture L302 (long parenthetical "This plan does NOT migrate the existing `gh` calls to MCP (out of scope for #203; that is a separate refactor)"); Task C1 Done-when (line 449) literally specifies a `--jq` `gh pr view` invocation as the target wording; Task C3 (lines 455-457) introduces a NEW `gh run view "$RUN_ID" --json jobs …` command into `bkit-debug.md`.
- **Problem:** Plan-input L84 (and the user-memory note "Workflows are MCP-only for GitHub/Linear") states: "Workflows are MCP-only for GitHub (no `gh api`, no `gh` CLI, no raw HTTP)." This constraint applies wherever the bkit workflow files live. Task C3 actively ADDS a new `gh run view` shell command to `.bkit/workflows/bkit-debug.md`, expanding (not preserving) the gh-CLI footprint. Task C1's Done-when prescribes `gh pr view … --jq`. The plan claims the constraint only applies to a non-existent `.agents/workflows/` directory, but the constraint in plan-input is about WORKFLOWS, and the workflows ARE the `.bkit/workflows/*.md` files (the only ones that exist). Out-of-scoping the migration is defensible; ADDING new gh-CLI invocations is not.
- **Suggested fix:** Either (a) replace the prescribed `gh pr view`/`gh run view` invocations in Tasks C1 and C3 with the MCP equivalents (e.g. `mcp__github__pulls_get` / `mcp__github__workflow_runs_jobs_get` or whichever the available toolset exposes), keeping the existing gh-CLI lines that are NOT being touched by #203 unchanged; or (b) explicitly call out in `Out of Scope` that the MCP-only constraint is acknowledged-but-deferred for this plan and the existing mixed-mode is preserved, AND make sure no NEW gh-CLI calls are introduced (Task C3 must use the MCP equivalent even if existing calls stay). Resolve the contradiction; do not silently expand the gh footprint.

### C3 — Several Done-when criteria fail the "testable / codebase-verifiable" bar

- **Location:** Task A1 (lines 407-409); Task A4 (lines 419-421); Task B5 grep count (line 443: "returns three matches"); Task E2 (lines 475-477); Task F2 (line 524).
- **Problem:**
  - Task A1 Done-when says "the comment block 'scaffold: …' is present at top" — string match unspecified (exact literal? Substring? Regex?), and the task itself adds nothing executable yet ("no executable change yet — a single multi-line YAML comment block") — risk: task is busywork, not gating real progress; merge into A2 or specify the literal comment text.
  - Task A4 "render-test the template via `pnpm test -- bkit-templates.content` to confirm verbose-ci-env block tests still pass" — done-when is "both commands exit 0" but the bkit-templates.content tests are EXTENDED in Task E1; running them in A4 will run against current expectations only (a fine sanity, but the wording suggests they assert the new shape, which they don't yet). Tighten: "both commands exit 0 against the PRE-extension test set (sanity that the rewrite did not break verbose-ci-env structural tests)."
  - Task B5 Done-when prescribes a magic number ("`grep -n 'bkit-protect-main' .bkit/src/bkit-postinstall.ts` returns three matches (path constant + Quick-path string + log/example reference if any)") — the "if any" makes the count non-deterministic. Make the count exact (1 or 2 or 3) by reading the file and pinning it.
  - Task E2 Done-when: "exits 0 with new assertions reported" — does not specify WHICH assertions or how to confirm they were the new ones; a stale test run could exit 0 too. Replace with explicit assertion names (e.g. "new tests `postinstall quick-path mentions bkit-protect-main.sh` and `postinstall status-checks line mentions bkit-tests-check` both pass").
  - Task F2: "`pnpm bkit install --apply` (or whatever the established command is — verify via `pnpm bkit --help`)" — the parenthetical "or whatever" is exactly the vague "update X" the lens flags. The plan author must resolve the command name BEFORE the runbook is sealed; otherwise the executing agent guesses at runtime.
- **Suggested fix:** Sharpen each Done-when above to a single deterministic, codebase-verifiable check. Resolve the `pnpm bkit install` command name now (the repo's package.json + `.bkit/src/bkit-cli.ts` will tell you in one read), and pin every grep count to an exact integer or use `--count` with `=` not `>=`.

## OPTIONAL

### O1 — Layer-3 rules-norm wording uses backticks inside a bullet that is ALSO inside a markdown table cell in some renderings

- **Location:** Architecture L323 (the inserted bullet `- **Validation != green:** Green != ran != validated. … The required check is `bkit-tests-check`— it MUST be …`).
- **Problem:** The inserted text shows `bkit-tests-check`— with NO SPACE between the closing backtick and the em-dash-substitute "—". The plan-input + memory notes mandate ASCII operators; the em-dash is allowed in prose but the no-space backtick collision is a markdown-prose lint smell (prose-lint / write-good may flag, and a render to `.bkit/templates/.agents/rules.md` could surface differently). Add a space: `…check\` — it MUST be…`.

### O2 — Task A2's `bkit-decide` "validates required fields … fails loudly on missing" lacks a Done-when test

- **Location:** Architecture L237 ("validates required fields present … and fails loudly on missing"); Task A2 Done-when (line 413) covers actionlint + content tests but not this validation.
- **Suggested fix:** Add a sub-bullet to A2 Done-when: "the `bkit-decide` job contains an explicit `jq` (or shell `case`) check that errors out if `run_level`, `web_affected`, `should_run_e2e`, `live_should_run`, `depth_source`, `whether_reason` are missing — verifiable via `grep -nE 'run_level|web_affected|should_run_e2e|live_should_run|depth_source|whether_reason' .bkit/templates/.github/workflows/ci.yml | wc -l >= 6`." OR fold the assertion into the E1 content tests with a dedicated check.

### O3 — Edge case "Heavy-customised-ci fixture" mismatch with Task E5 scope

- **Location:** Edge Cases L95 ("only the `bkit-stub:` regions and the canonical core of `bkit-decide` carry through"); Task E5 (lines 487-489) only assigns the fixture upgrade (manual file edit), not testing the "carry through" behaviour.
- **Suggested fix:** Either drop the "carry through" wording from the edge-case row (current install logic does not auto-migrate consumer ci.yml files; bkit ships seed-or-print only), or add a test in E6 that demonstrates the asserted carry-through.

### O4 — Verification Plan Manual Step 4 may not be executable inside this plan's session

- **Location:** Manual Verification Step 4 (line 577 — "Run `/bkit-ship` end-to-end against this very PR; confirm Gate 2 reads the capstone").
- **Problem:** Step 4 requires the capstone to exist AND a PR with a full CI run — which only exists after Phase F push. Either explicitly mark Step 4 as "post-ship verification (run after the plan PR has merged)" or note the dependency.

## OUT OF SCOPE

(Plan-expansion suggestions outside current plan scope; not applied to plan.)

- None. The draft correctly scopes #209 plumbing defects out (L161); does not creep into Renovate/external-caller drops (L165); explicitly defers the parity-matrix script (L164). Out-of-scope discipline is strong; the failures above are about IN-SCOPE fidelity, not creep.

---

**Path-accuracy spot-check (lens point 3):** Verified — the plan correctly references `.bkit/workflows/bkit-ship.md` and `.bkit/workflows/bkit-debug.md` (confirmed via Glob: `.bkit/workflows/` contains both; `.agents/workflows/` does not exist). The plan EXPLICITLY notes the plan-input's `.agents/workflows/` reference is stale (line 302) — good catch. `scripts/ci/bkit-set-protection.sh` confirmed present at expected path; rename target `bkit-protect-main.sh` confirmed absent (so `git mv` will work). `.bkit/templates/.github/workflows/ci.yml` confirmed present.

**Design-coverage:** No `{FID}-design.md` exists for #203 (design phase intentionally skipped per L55, falling back to gether #403's design doc as canonical reference). The fallback is declared and the Acceptance Scenario derives Narrative + Success Criteria from issue body + #403 addendum — acceptable substitution.

**Template adherence:** All `docs/plans/template.md` mandated sections present (Context & Goals, Acceptance Scenario with Narrative/Success Criteria/Concrete Example/Edge Cases/Derived Test Matrix, Breaking Changes, Alternatives, Out of Scope, Merge Method, Supersession Inventory, Security & Privacy, Pre-Flight, Data Schema, Architecture, Documentation Updates, Rollback, Agent Execution Runbook, Gates 1-4, Verification Plan, Manual Verification). The dual top-level / bkit:start-fenced shape matches template convention.
