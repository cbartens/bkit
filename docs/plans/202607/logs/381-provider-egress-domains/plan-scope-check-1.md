Verdict: CONCERNS
Failures: 6

<!-- verdict:end -->

# Plan Scope Check

Lens: Scope, criteria, verification audit.

Audited: `docs/plans/202607/logs/381-provider-egress-domains/plan-v2-reviewed.md` (875 lines, 34 tasks / 8 phases, 15 matrix rows), against `docs/plans/template.md`, `.agents/rules.md`, and the worktree source every `Done when` grep targets.

**Structure — clean.** Every mandated `docs/plans/template.md` section is present and populated (`Context & Goals` → `Manual Verification`, all four Gates). Every one of the 34 tasks carries a scope statement and a `Done when` line; no task is scopeless. `Supersession Inventory` carries 7 `DELETE` rows and each is mirrored by an owning task (Tasks 7, 10, 11, 13, 15, 17, 22) — no missing entry, no `RETAIN-WITH-REASON` needed. All 8 `Out of Scope` rows are genuinely `Exempt`: none is required by a `Success Criteria` bullet, a matrix row, or an `Architecture` change, and each carries a `docs/deferrals.jsonl` key. Ledger accounting verified live: `docs/deferrals.jsonl` carries exactly 9 `381-*` lines across 8 unique keys with `381-webfetch-grants-survive-uninstall-after-seed-emptied` appearing twice (`:78` original, `:80` correction) — Task 31's `Done when` is accurate and reachable.

**Matrix — 15 rows, every type and target real.** All named target files exist on disk (`bkit-cloud-env.test.ts`, `bkit-modules.test.ts`, `bkit-install.integration.test.ts`, `bkit-upgrade.integration.test.ts`, `bkit-guardrails-cursor.integration.test.ts`); the two marked `_(new)_` (`bkit-cloud-env.integration.test.ts`, the T6 `describe`) are correctly marked. Types are `Unit` / `Integration` only, matching `docs/testing.md`. Runbook → matrix direction is complete: T1→8, T2→8, T3→6, T4→26, T5→7, T6→32, T7→9, T8→23, T9→12, T10→24, T11→17, T12→13, T13→11, T14→28, T15→23. The T6→Task 32 re-homing (mirror only exists after Task 32's `bkit install`) is correct and the reasoning holds. The matrix → runbook direction has a gap (C6 below).

The two defect shapes the previous round found are **mostly** fixed — Task 14 now carries `--glob '!docs/plans/**'`, and Task 17's `rg -n 'SHIPPED_NETWORK_BASES' .bkit/src/` is reachable (only live match today is `bkit-permissions-parity.integration.test.ts:176`, inside the block Task 17 deletes). But both shapes recur elsewhere, verified against source below.

## CRITICAL

### C1 — Task 33 `Done when` can never go green as written

```
for each of the four hosts, `rg -c "<host>" tmp/<scratch>/.claude/cloud.md tmp/<scratch>/.cursor/allowlist.json
tmp/<scratch>/.claude/settings.json tmp/<scratch>/.opencode/opencode.json` is non-zero in every file
```

Two of the four hosts are `api.githubcopilot.com` and `api.tavily.com`. By the plan's own design none of those four files ever contains those strings: `.claude/cloud.md`, `.cursor/allowlist.json`, `.claude/settings.json` and `.opencode/opencode.json` all carry **bases** (`githubcopilot.com`, `tavily.com`, plus `*.` forms), never the exact API host. The only surface that emits exact hosts is `.cursor/cloud.md` (`renderCursorNetworkAllowlist`, `BKIT_SHIPPED_NETWORK_HOSTS`) — and `.cursor/cloud.md` **is absent from the file list**. The parenthetical "(bases for the wildcard surfaces, exact hosts for the Cursor cloud list)" names a file the command does not open, so the criterion is simultaneously unexecutable and self-contradictory. Since Task 33 is the task that closes Success Criterion 1 end-to-end, this is the most load-bearing `Done when` in the plan.

Fix: split the assertion — bases (`githubcopilot.com`, `models.dev`, `skills.sh`, `tavily.com`) against the four wildcard surfaces, exact hosts (`api.githubcopilot.com`, `models.dev`, `skills.sh`, `api.tavily.com`) against `tmp/<scratch>/.cursor/cloud.md`.

### C2 — Task 14 `Done when` grep can never return zero: two unowned matches

```
rg -n --glob '!docs/plans/**' 'renders from THIS block alone|LOCAL host permissions|Trusted.*enough|Trusted-egress' .agents/ .bkit/ docs/
```

Run against the worktree today, after excluding every spot Task 14 owns (`.agents/config.md` `:36 :260 :281 :283`, its template twin, `.bkit/cloud.md:113`), two matches survive that **no task in the runbook owns**:

- `.agents/config.md:391` — a **second** `debug-fetch:tavily` skip breadcrumb carrying the identical `"000 = host unreachable (add tavily.com to the cloud Trusted-egress allowlist)"` string. It sits **below** `<!-- bkit:end -->` (`:300`), i.e. in bkit's own dogfood region, so it is not regenerated from the template and has no twin — the template copy only has `:36`, `:260`, `:283`. Task 14 enumerates `:36, :260, :281, :283, :292, :310` and stops.
- `docs/observability.md:149` — `"a host blocked by the cloud Trusted-egress allowlist, .agents/config.md § Cloud allowed domains"`. Task 14 and the `Documentation Updates` table both name `docs/observability.md:20` only.

Same task's second clause fails on the same line: `rg -n 'tavily' .agents/config.md .bkit/templates/.agents/config.md` is required to match "only the `api.tavily.com` call and its `Authorization` header" — `:391`'s breadcrumb matches `tavily` and is neither.

Fix: add `.agents/config.md:391` and `docs/observability.md:149` to Task 14's scope and to the `Documentation Updates` rows, or the criterion is unreachable and a builder will either weaken the grep or edit archived artifacts to satisfy it.

### C3 — Task 5 `Done when` passes trivially with zero implementation

Task 5's scope is "implement the proposer and `isIpLiteral`". Its `Done when` asserts only (a) `rg -n 'try \{' .bkit/src/bkit-cloud-env.ts` shows no new occurrence versus the baseline SHA and (b) `pnpm slop:delta` reports no net-new `defensive.error-obscuring` finding. Both are **absence** checks that are green on an untouched file. A builder who writes nothing at all passes Task 5, ticks the box, and the gap only surfaces four tasks later at Task 9/T7. The baseline-SHA discipline in the criterion is good and should be kept — but a positive existence/behaviour clause is missing.

Fix: add a positive clause, e.g. `deriveEgressEntries`-adjacent proposer exists and, for the fixture set, `https://openrouter.ai/api/v1` → `openrouter.ai` while `http://localhost:11434/v1` / `https://1.2.3.4:8080/v1` / `https://[::1]/v1` contribute nothing (a temporary local assertion is fine; T7 formalises it in Task 9).

### C4 — Task 25 `Done when` is not codebase-verifiable

> **Done when:** both files read correctly against the new behaviour, or are edited to; `pnpm lint:prose` passes.

"Read correctly" is a human judgment with no mechanical check, and `pnpm lint:prose` passes on the tree today, so the whole criterion is green before the task starts. This is the only `Done when` in the runbook with no verifiable predicate at all. Every other doc task (14, 18, 29) carries concrete greps — Task 25 should too.

Fix: name the decision explicitly, e.g. `rg -n 'network allowlist' .bkit/workflows.md` still matches at the `WebFetch` permission row and the row does not name the template seed; `rg -n 'tooling defaults' .bkit/README.md` returns nothing (or is edited to the derived-registry wording).

### C5 — Task 20's writer count contradicts the tree, and a third `.bkit/version` writer is unenumerated

> `rg -n 'writeBkitVersion' .bkit/src/` still shows exactly two writers (`bkit-modules.ts` postDispatch, `bkit-upgrade.ts`)

Run today, that grep returns the definition, the imports, ~25 test-side lines, `bkit-modules.ts:955` — and **two** distinct call sites in `bkit-upgrade.ts`: `:500` (inside `updateCanonicalHashesAfterUpgrade`, the one the plan threads in Task 21) and **`:547`**, `writeBkitVersion(versionFile, { ...bkitVersion, canonicalHashes })`. `bkit-upgrade.ts:547` appears nowhere in the plan: `Data Schema Integration § Invariant Conformance` asserts "`.bkit/version` has exactly **one writer per path**" and enumerates only `bkit-modules.ts:955-959` and `bkit-upgrade.ts:465-501`. The spread at `:547` most likely preserves `webFetchDerived` — but "most likely" is exactly what Phase 0 exists to eliminate, and no task owns proving it.

Fix (two parts): (a) restate Task 20's criterion as a checkable one — the exact expected non-test call sites, by symbol/file, not a bare count; (b) add the `bkit-upgrade.ts:547` write to `Data Schema Integration` and give Task 21 a clause that a version payload round-tripped through that path keeps `webFetchDerived`.

### C6 — Matrix ↔ runbook is not bidirectional: two new tests with no row

The runbook mandates two test assertions that the `Derived Test Matrix` never carries:

- **Task 19** — "a `.bkit/version` payload with no `webFetchDerived` parses to `[]` (asserted in `.bkit/src/bkit-version.test.ts`)". `bkit-version.test.ts` is named in no matrix row.
- **Task 21** — "an upgrade whose only change is the derived set writes `.bkit/version` (asserted in `.bkit/src/bkit-upgrade.integration.test.ts`)". T14 is the only row on that file and asserts the opposite condition (0 writes on a clean tree); it cannot subsume this.

`Verification Plan § Unit` half-acknowledges the first ("the `webFetchDerived` parser default") without a T-number. Per the spec line in this plan's own `Spec` block — "One row per testable behaviour … Each row → exactly one task" — these two need rows (T16, T17) so Gate 2's "Every matrix row owned" checklist and Gate 3's "every T-row has a corresponding checked-off task" actually cover the delivered test surface.

## OPTIONAL

- **Task 2's control-flow grep is narrower than its own prose.** Scope says "zero `if` / `?:` / `&&` / `||`"; the grep is `rg -n 'import |if \(|\?\?|&&'` — `||` and `?:` are absent, and `\?\?` catches nullish coalescing, not the conditional operator. An `||` or a ternary would slip through the gate that Task 4 then re-runs. Add `\|\||\? ` (or drop `?:` from the prose).
- **Task 27's sweep is judgment-laden.** "returns only `.bkit/src/bkit-registry.ts` and generated artifacts" has no closed expected set, so any surprise match can be rationalised as "generated". Also `--glob '!dist/'` is inert: `dist/` is at repo root, outside the `.bkit/` search path. Name the exact expected file list.
- **Two `Done when` greps are point-in-time and go false later in the same runbook.** Task 22's `rg -c 'WebFetch\(domain:' .bkit/src/*.test.ts .bkit/src/*.integration.test.ts` "returns exactly `bkit-uninstall.test.ts:6`" stops holding the moment Task 23 (T8/T15) and Task 24 (T10) add their literals; Task 3's "definition only in `bkit-registry.ts` and four call sites plus one import" stops holding when Task 8's T1 imports `OPENCODE_PROVIDER_DEFAULTS` into `bkit-cloud-env.test.ts`. Both are legitimate as at-task-time checks — say so in the line, or a later re-verification pass reads them as regressions.
- **Task 9's "no surface anywhere contains the string `localhost`" is unbounded.** `localhost` occurs legitimately across the repo. Scope it to the rendered outputs (cloud paste fences, `.cursor/allowlist.json`, `permissions.allow`, `permission.bash`).
- **Task 14 edits inside a `bkit:start`/`bkit:end` block, and the ordering deserves one sentence.** `.agents/config.md` `:36 / :260 / :281 / :283` are all above `<!-- bkit:end -->` (`:300`), i.e. inside the managed block; `:310` (dogfood `allowed-domains`) is below it. Editing the managed half is correct **only** because the template twin is edited in the same task and Task 32 regenerates — which is exactly what the cited `managed-block-doc-edits-must-sync-template-or-bkit-check-drifts` gotcha covers. Worth stating explicitly so a builder does not hand-edit the runtime copy alone and read Task 32's regeneration as drift.
- **Verified, no action:** Task 32's "`.cursor/allowlist.json` carries exactly … 30 entries" is reachable. bkit's own dogfood `allowed-domains` block (`.agents/config.md:307-312`) declares `github.com` + `tavily.com`; Task 14 removes `tavily.com`, and `github.com` is already a derived base, so the union lands on exactly the 15 derived bases → 30 entries. Also verified reachable: Task 11 (`nothing extra is required here` exists at `bkit-cloud-env.ts:650`, and the `dist/` twin is outside the grep scope), Task 15 (`keep in sync` is the sole occurrence in the template hook, `:114`), Task 16 (`fail-OPEN` is the sole occurrence, `slop-scan.config.json:184`), Task 18 (`falls back to tooling defaults`, `providers.md:277`), Task 29 (`tooling ∪ consumer`, `providers.md:256`).

## OUT OF SCOPE

- A machine check that no `Done when` grep can match `docs/plans/**` (Gate 2 already asserts this by human reading; the C2 class is the same failure mode one level out — an unowned match in a _live_ file). A small repo test over the plan template's runbook greps would catch both shapes at plan time rather than at build time.
- `.agents/config.md` carries the `debug-fetch:tavily` skip breadcrumb twice (`:260` managed, `:391` dogfood) with byte-identical prose. Deduplicating that is a separate cleanup; this plan only needs both edited.
- The `bkit-upgrade.ts:547` write path (C5) may be a genuine second-writer defect predating this issue. If Task 21's added clause shows it clobbering, that is a `docs/failures.jsonl` row plus its own fix, not scope for #381.
