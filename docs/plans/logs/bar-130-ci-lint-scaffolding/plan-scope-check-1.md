Verdict: CONCERNS
Failures: 4

<!-- verdict:end -->

# Plan Scope Check

## CRITICAL

1. **Test-matrix row without runbook task: "Hash-comment marker variant round-trips for YAML/INI/shell"** — the matrix row points at `.agents/scripts/bkit-install.test.ts`, and Task 2.1 *does* extend that file, but Task 2.1 ALSO bundles the html-comment backward-compat assertion into the same task without giving the matrix row a unique acceptance bullet. Acceptable by 1:1 mapping standards (one row → one task is satisfied) but verify the runbook explicitly enumerates "round-trip both marker styles on YAML/INI/shell AND markdown/.gitignore". Currently Task 2.1 reads as one combined assertion. **Fix:** Split Task 2.1 acceptance criteria into two enumerated bullets ((a) hash-comment round-trip on YAML/INI/shell, (b) html-comment round-trip on markdown/.gitignore + default-arg backward-compat) so reviewers can tick each test-matrix row off independently.

2. **DoD bullet 12 ("Seeded ci.yml includes auth-shim step; README documents BKIT_READ_TOKEN secret setup") — verification missing for the auth-shim being inside the bkit-managed block.** Task 6.1 lists `auth-shim` in the template body and Task 8.1 covers the README. The Test Matrix row "Token-substituted `ci.yml` template renders auth-shim step inside bkit block" is mapped to `bkit-install.test.ts (extend)`, but no runbook task explicitly asserts that test. Phase 6 Task 6.1's verification only says "bkit block appended; consumer jobs preserved" — it does NOT assert the auth-shim step is rendered between markers nor that `BKIT_READ_TOKEN` secret reference is present. **Fix:** Add an acceptance bullet to Task 6.1 (or a sibling Task 6.1b) requiring an automated test in `bkit-install.test.ts` that loads the rendered template after `applyTokens` and asserts the auth-shim line `git config --global url."https://x-access-token:${{ secrets.BKIT_READ_TOKEN }}@github.com/"` is present *between* `# bkit:start` and `# bkit:end`.

3. **DoD bullet 9 ("Token substitution: seeded ci.yml has node-version: <consumer's .nvmrc value> and branches: [<consumer's default branch>]") — automated assertion missing in runbook tasks.** Manual Verification Step 4 covers it manually, and Phase 1 tests the resolver in isolation, but no integration-level runbook task asserts the *integrated path* (resolveTokens → applyTokens → Tier 2 write → final on-disk `ci.yml` content has the substituted values). The Phase 5 dry-run-parity tests don't assert content equality, only writeset equality. **Fix:** Add an integration test row + matching Task (e.g., Task 4.1 sub-bullet or new Task 6.1c) asserting that after `runCiModule` against a tmpdir pre-seeded with `.nvmrc: 22\n` and `package.json` with `packageManager: "pnpm@10.4.1"`, the resulting `ci.yml` contains `node-version: 22` and `branches: [main]` literally.

4. **Task 0.2 / "Test files scaffolded with todo stubs" loophole — undermines Reproduce-first.** Task 0.2 creates the five test files with `it.todo(...)`. Subsequent phases (1.1, 2.3, 3.1, 4.1, 5.1) replace them with real failing tests. But there is no audit task that confirms "every `it.todo()` from Phase 0.2 has been promoted to a real `it()` before Gate 2 closes". An agent could leave todos behind and still claim phase-gate completion. **Fix:** Add a task at Gate 3 (or in "Mandatory Tasks (Testing & Documentation)") explicitly running `grep -n "it\.todo\|test\.todo" .agents/scripts/*.test.ts .agents/scripts/*.integration.test.ts` and asserting zero hits except where the stub is intentionally deferred (with documented reason).

## OPTIONAL

1. **Task 7.4 lint:prose script — multi-platform brittleness.** The chosen "preferred alternative" (`bash -c 'if command -v vale; then vale ...; else echo skipping; fi'`) is well-reasoned but assumes `bash` is installed on the developer's shell environment. Most macOS / Linux dev machines have it, but Windows/WSL edge cases or `nix`-style minimal shells may not. Consider documenting "developer must have bash" as a pre-flight assumption, OR use a tiny Node helper to make the lint:prose script truly portable.

2. **Task 4.5 (.bkit-version write-order regression test) — order-of-writes is asserted but ENV concurrency / async write semantics are not.** If `runCoreModule` ever becomes async with parallel writes, the "last write" guarantee for `.bkit-version` could regress silently. Recommend the test mock `fs.writeFileSync` capture in array order AND asserts no `await Promise.all(...)` style parallelism is used (e.g., assert all writes happen synchronously, or assert the final entry is `.bkit-version` regardless of execution model).

3. **Phase 5 dry-run parity — `WriteSet` accumulator is mentioned but never explicitly defined as a deliverable.** Tasks 5.2 / 4.5 / 4.3 reference "the shared `WriteSet` accumulator (introduced in this phase)" but no task says "create `WriteSet` type/class, location: file path, exported from `bkit-tiers.ts` or `bkit-modules.ts`". This is a load-bearing primitive — it should have its own task or sub-bullet specifying the file/module that owns it.

4. **Task 6.1 ci.yml template — "auth-shim sits inside bkit-managed block before pnpm install" ordering not asserted in tests.** The plan-input requires the shim BEFORE `pnpm install`. Add an acceptance bullet asserting line-ordering of the auth-shim step relative to the install step.

5. **Manual Verification Steps 7 and 8 (Gate 4.5) — not blocking the Gate 4 closure.** Gate 4 says "every Automated Tests checkbox checked. CI run output captured." This passes BEFORE Gate 4.5 runs. Tighten ordering: explicitly state "Gate 4 → Gate 4.5 → merge" in the runbook close-out.

6. **Task 10.3 acceptance — "smoke-install.md log committed" but no schema for the log entry.** Recommend a small fixed schema (timestamp, bkit version installed, consumer name, `git diff --stat` output, CI run URL) so reviewers can mechanically check whether the log is complete vs hand-waved.

7. **Edge Case row "Mid-install crash between Tier 1 ... Tier 2 ..."** — covered architecturally by Task 4.3 / 4.5, but no runbook task simulates the crash for `--cursor` host (a Tier 1 file) followed by `--ci` (Tier 2). Optional integration test would harden the contract.

## OUT OF SCOPE

1. **Helper auth action setup-auth@v1** — correctly listed under Out of Scope and routed to BAR-131. No plan changes needed.

2. **postflight.sh / Stop-hook wiring** — correctly listed Out of Scope. No plan changes.

3. **`--no-X` / `--force` flags, package.json automated merge, prompted token fallback, husky auto-install, reusable workflows, 3-way merge, claude.yml/ci-complete.yml/smoke.yml, VERCEL/LINEAR tokens, release-automation workflows** — all correctly listed in plan's Out of Scope section verbatim per BAR-130 description.

4. **Suggestion (do NOT add to this plan): pre-flight `bkit doctor` verb** — could surface to user when token detection falls back to defaults, but this is plan-expansion and outside BAR-130 scope. Park for v0.2.

5. **Suggestion (do NOT add): cross-OS `lint:prose` portability via Node wrapper** — plan-expansion; defer to follow-up if Windows consumers complain.

6. **Suggestion (do NOT add): dedicated `bkit upgrade` verb that diff-checks `.bkit-version` and prompts** — useful UX but outside this plan's CLI redesign scope.

## DoD Coverage Map (14 bullets)

| # | DoD Bullet | Mapped Task / Gate |
| - | - | - |
| 1 | bkit's own PRs run typecheck + vitest + Vale + slop-scan + self-test | Task 7.1, 7.4, Verification Plan §Automated Tests |
| 2 | `bkit install` (no flags) on empty repo seeds full stack | Test Matrix `--full ≡ no flags`, Manual Step 3, Task 4.1 |
| 3 | `bkit install --claude` seeds only `.claude/**` + core | Test Matrix row, Task 4.1, Manual Step 2 |
| 4 | `bkit install --ci --lint` seeds CI + lint + core | Manual Step 3, Test Matrix row, Task 4.1 |
| 5 | `bkit install --ci` on existing customised ci.yml preserves consumer jobs | Task 6.1 verification |
| 6 | `bkit install` on existing slop-scan.config.json (Tier 3) preserves + suggests | Test Matrix Tier 3 row, Task 6.3 |
| 7 | `bkit install` idempotent (post-init) | Test Matrix idempotence row, Manual Step 5 |
| 8 | `bkit check --full` ≡ `bkit install --full` writeset | Phase 5 (5.1, 5.2, 5.3) |
| 9 | Token substitution in seeded ci.yml | Phase 1 + Manual Step 4 — **CRITICAL #3 above: missing integration assertion** |
| 10 | `bkit init` deprecation | Task 3.1, 3.3, Manual Step 1 |
| 11 | `bkit install --host=claude` deprecation | Task 3.1, 3.3, Manual Step 2 |
| 12 | Seeded ci.yml auth-shim + README BKIT_READ_TOKEN | Task 6.1, 8.1 — **CRITICAL #2 above: shim-inside-block assertion missing** |
| 13 | app-gether-life re-installs at v0.1.2, CI passes | Task 10.3, Gate 4.5a |
| 14 | Second consumer onboards via `install --full`, CI green | Gate 4.5b |
| 15* | `package.json` v0.1.2 + tag pushed | Task 10.1, 10.4 |
| 16* | README + `.agents/README.md` document tier model + CLI + init deprecation | Task 8.1, 8.2 |

(*Bullets 15+16 are extra DoD bullets present in plan-input.md; both covered.)

## Out-of-Scope Cross-Check

Verified: plan does NOT silently expand into any of the OOS items from BAR-130 — `postflight.sh`, `package.json` auto-merge, prompted token fallback, husky auto-install, reusable workflows, 3-way merge, helper action, `--no-X`/`--force`, VERCEL/LINEAR tokens, claude.yml/ci-complete.yml/smoke.yml, release-automation workflows. All correctly enumerated in plan's "Out of Scope" section.

## Supersession Inventory Verification

Inventory contains 6 rows; the contradiction surfaced by prior reviewers (file `bkit-init.ts` DELETE vs verb `init` RETAIN-WITH-REASON) is resolved cleanly with the explicit caution note. Both RETAIN-WITH-REASON rows have explicit kill-date (v0.2) and Linear issue ID (BAR-200, with creation tracked in Task 9.2). Conformant.

## Verdict Rationale

Verdict = **CONCERNS** because four items above are CRITICAL gaps (test-matrix-to-runbook bullet granularity, two missing automated assertions for DoD bullets 9 and 12, and a Phase-0 todo-stub loophole). None of these break the plan's structural template conformance or matrix-to-runbook 1:1 cardinality (those map cleanly), so verdict is NOT FAIL. CRITICAL items are addressable via plan-update edits (no re-design).
