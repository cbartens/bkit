Verdict: PASS
Strategy: PIVOT

<!-- verdict:end -->

# Plan Gaps Remediation — Sub-Plan 3 (Attempt 2)

**FID:** `384-ship-bookkeeping` · **ISSUE:** cbartens/bkit#384 · **Sub-plan:** 3 of 3 · **Attempt:** 2
**Strategy:** PIVOT (prior STANDARD strategy resolved doc template drift; this attempt addresses the feature-level `slop:delta` RED directly)

## Investigation

The re-verify (`build-plan-verify-3-2.md`) returned **CONCERNS (0 failures)**. The sole concern: `pnpm slop:delta` is RED — 4 added `defensive.error-swallowing` findings (net score +4.80), all in files written by sub-plans 1–2:

- `.bkit/src/bkit-modules.ts:2724` + `:3216` (two log-and-continue catch blocks)
- `.bkit/templates/.cursor/hooks/guardrails.cjs:128` + `.cursor/hooks/guardrails.cjs:128` (template + root mirror)

Per the slop gate rule: "ONLY fix net-new slop:delta findings, NEVER the baseline." These are net-new in the `origin/dev..HEAD` diff and must be fixed.

### Root-cause analysis (PIVOT — different angle than attempt 1)

Attempt 1 (STANDARD) fixed the doc template drift and did NOT touch any slop-flagged source. The PIVOT here is to address the slop:delta findings **directly** rather than defer them to sibling sub-plans.

`git blame` + `git show 3c50f02be` revealed the **actual root cause**: the verify-3-1 step (commit `3c50f02be`, "plan-verify sub-plan 3 attempt 1") **regressed** three documented fail-open catches. It replaced the original empty-catch-with-comment shape:

```ts
} catch { /* shipped fallback only */ }   // guardrails.cjs (both files)
} catch { // Already handled above }       // bkit-modules.ts:2737
} catch { // non-fatal — surface via advisory below }  // bkit-modules.ts:3218
```

with `console.error` log-and-continue:

```ts
} catch (e) { console.error("[bkit-modules] ...:", e instanceof Error ? e.message : e); }
```

The original empty catches were **correct and explicitly documented**. `slop-scan.config.json` overrides (lines 173–193) **disable `defensive.empty-catch`** for these exact files, with written `_reason` fields:

- guardrails.cjs (line 175): _"the empty catch is the implementation of the fail-open contract"_
- bkit-modules.ts (line 184): _"the empty catch with a comment is the fail-open contract, and each is paired with an advisory emission path"_

The verify-3-1 change converted empty catches (covered by the override) into `console.error`-and-continue — which is exactly the shape `defensive.error-swallowing` flags ("catch logs only"). That is the **only** rule NOT overridden for these files, so the "improvement" turned a GREEN gate RED with zero functional benefit.

## Changes Made

Restored the documented empty-catch-with-comment shape for all 4 catches (the faithful, minimal fix). No files deleted/merged; no callers rewired; no new advisory IDs introduced (the existing `lint-package-json-malformed` + `dependabot-setup-repo-state` advisories are the documented "advisory emission path").

### 1. `.bkit/src/bkit-modules.ts:2737` — package.json re-read catch (runLintModule)

`console.error` log-and-continue → empty catch with comment. The `lint-package-json-malformed` advisory above already surfaces malformed package.json; the guard (`!lintScripts.malformed`) guarantees the first read succeeded, so a transient re-read failure only skips the no-test-script check (non-fatal).

### 2. `.bkit/src/bkit-modules.ts:3218` — chmod catch (runDependabotModule)

`console.error` log-and-continue → empty catch with comment. The `dependabot-setup-repo-state` advisory below invokes the helper via `bash <script>` (no +x bit required), so a chmod failure does not block the documented setup path.

### 3. `.cursor/hooks/guardrails.cjs:140` + `.bkit/templates/.cursor/hooks/guardrails.cjs:140` — allowlist load catch (root + template)

`console.error` log-and-continue → empty catch with comment. A corrupt/absent allowlist must not crash the Cursor editor session; `SHIPPED_NETWORK_BASES` is the correct fallback (fail-open contract).

### 4. `dist/bkit-modules.js` — rebuilt

Ran `pnpm build` so the compiled output matches the source change (dist is in slop ignores but is tracked; kept in sync).

### 5. `docs/knowledge.jsonl` — gotcha appended

Key `fail-open-empty-catch-is-a-documented-contract-adding-console-error-triggers-defensive-error-swallowing` (dedup-verified, count=1). Records the lesson so the next agent does not repeat the regression.

## Test Results

| Gate                | Result                   | Notes                                                                                                 |
| ------------------- | ------------------------ | ----------------------------------------------------------------------------------------------------- |
| `pnpm slop:delta`   | ✅ OK, 0 net-new         | **FIXED.** Was RED (4 added, +4.80). Now `added 0, resolved 0, net findings 0, net score 0.00`.       |
| `pnpm lint:slop`    | ✅ report-only           | Findings 11 → 8; repo score 36.40 → 31.60 (the 4 error-swallowing findings cleared; baseline intact). |
| `pnpm typecheck`    | ✅ GREEN                 | `tsc --noEmit` clean.                                                                                 |
| `pnpm test`         | ✅ 75 files, 2651 passed | 2 skipped / 1 todo / **0 failed.** No regression.                                                     |
| `pnpm test:bats`    | ✅ 140/140 passed        | ship-gate.bats (16), ship-failure-path.bats, ship-worktree-ownership.bats, + others.                  |
| `pnpm format:check` | ✅ GREEN                 | All matched files use Prettier code style.                                                            |
| `pnpm lint:prose`   | ✅ 0 errors, 1 warning   | Pre-existing write-good warning in `docs/testing.md:318` ("There is") — non-blocking.                 |
| `pnpm bkit check`   | ✅ 0 writes, exit 0      | No drift (advisories.md regen is normal post-install, not drift).                                     |
| `pnpm build`        | ✅ GREEN                 | `tsc && chmod +x dist/bkit-install.js` — dist synced to source.                                       |

## Anti-Pattern Scan

- No `as any` / `@ts-ignore` / `.skip` introduced.
- No files deleted/merged; no callers rewired (slop gate rule respected).
- No config overrides added/suppressed — the existing overrides already documented the correct shape; this change realigns the code with them.
- No new advisory IDs — scope-disciplined (used the documented existing advisory channels).

## Remediation Log

DONE — Concern A (bkit-modules.ts:2734): package.json re-read log-and-continue catch — Restored documented empty-catch-with-comment (regressed by verify-3-1 commit 3c50f02be); slop:delta cleared. (.bkit/src/bkit-modules.ts:2737)
DONE — Concern A (bkit-modules.ts:3218): dependabot chmod log-and-continue catch — Restored documented empty-catch-with-comment; slop:delta cleared. (.bkit/src/bkit-modules.ts:3218)
DONE — Concern A (guardrails.cjs root): allowlist load log-and-continue catch — Restored documented empty-catch-with-comment (fail-open contract); slop:delta cleared. (.cursor/hooks/guardrails.cjs:140)
DONE — Concern A (guardrails.cjs template): allowlist load log-and-continue catch — Restored documented empty-catch-with-comment (mirror sync); slop:delta cleared. (.bkit/templates/.cursor/hooks/guardrails.cjs:140)
DONE — dist sync — Rebuilt dist/bkit-modules.js via pnpm build to match source (tracked file kept in sync).
DONE — knowledge.jsonl gotcha — Appended fail-open-empty-catch-is-a-documented-contract... (dedup-verified count=1).
