Verdict: CONCERNS
Failures: 0

<!-- verdict:end -->

# Build Challenge

Lens: Security — auth, secrets, input validation, data exposure, OWASP, data-access policies / tenancy.

Coverage: partial diff coverage — `origin/dev...HEAD` = 15290 diff lines across 204 files; the input showed the 20 largest files only. Input-handling and file-handling files not shown whole were challenged through `git diff origin/dev...HEAD -- <file>`: `.bkit/core/engine/commands/workflow/status.ts`, `.bkit/core/engine/shared/settings.ts`, `.bkit/core/engine/checks/before/repo.ts`, `.bkit/core/engine/checks/before/index.ts`, `.bkit/core/engine/commands/workflow/workflows.ts`, `.bkit/core/engine/commands/workflow/summary.ts`, `.bkit/core/engine/ledgers/{status,telemetry}.ts`, `.bkit/core/engine/install/modules/core.ts` (migration that writes and deletes files), `.bkit/core/engine/commands/install/uninstall.ts`, `.bkit/core/engine/install/manifest.ts`, `.bkit/core/engine/checks/after/tools.ts`, `.bkit/core/engine/commands/stats.ts`, `scripts/harvest/bkit-harvest.mjs`, `scripts/cleanup/bkit-disk-prune.mjs`, `.bkit/templates/scripts/cleanup/bkit-disk-prune.mjs`, `.bkit/templates/scripts/ci/bkit-local-stack-lock.sh`, `package.json`, `skills-lock.json`, and the push / publish lines of `.bkit/core/workflows/bkit-build.md`. The shown `disk.ts`, `analysis.ts` and the two integration-test shims were read in the input. The vitest skill (`antfu/skills`, hash-pinned in `skills-lock.json`, no install scripts, no `allowed-tools` or hooks) was scanned for embedded directives, secrets and outbound commands: none found. The whole diff was grepped for secret patterns and consumer names: none found. No database or RLS surface exists (docs/security.md § RLS). `dist/` and host mirrors were not read line by line.

## Findings Log

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** A `publish=false` build that hits the Failure Path or a Decision Pause runs `workflows handover --push`, which `git add -A`s, commits and pushes `feat/{FID}` to `origin`, so code the owner chose to hold (e.g. an embargoed fix in a public repo) is published irreversibly
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/workflows/bkit-build.md:92`
  - **DONE WHEN:** Failure Path step 5 (`.bkit/core/workflows/bkit-build.md:90-92`) and the Decision Pause owner-wait step 8 (`.bkit/core/workflows/bkit-build.md:228-230`) branch on `{PUBLISH}`: when it is false they commit the record locally (or link it with `--ref`) and never pass `--push`, so no step of a held run pushes `feat/{FID}`; the publish=true path keeps `--push` unchanged; `.bkit/core/engine/audits/workflows/workflow-shape.test.ts:310` is updated to match.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `bkit-build.md: a held run's Failure Path and Decision Pause never push the feature branch` fails on both handover fences calling `--push` with no `{PUBLISH}` = false branch, so a held run pushes `feat/{FID}`

<!-- bkit:task 1 end -->
<!-- bkit:task 2 start -->

- [ ] **TASK 2:** A `publish=true` substring anywhere in the verbatim session prompt (pasted issue text, a log excerpt, or a negation such as "do not use publish=true") overrides a durable `bkit.workflows.build.publish.local: false`, so untrusted pasted text flips a held local build into a push and an open PR
      **Severity:** LOW · **Class:** architectural · **Fixable:** false · **Location:** `.bkit/core/engine/commands/workflow/status.ts:269`
  - **DONE WHEN:** The owner decides whether prompt text may raise a configured hold to a publish. No agent can settle it, because the confirmed plan (Breaking Changes, "Session token (new)" row, and Edge Cases "Token and config disagree") makes the substring token win over config, and docs/security.md § Untrusted Content & Prompt Injection treats pasted content as untrusted. The decision to make: either a token may only lower `publish` (a `publish=true` token cannot override `publish.local: false`), or the token must stand alone (its own line or the bracket form) so text embedded in pasted content does not match; `publishRoute` then follows that rule.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/status.test.ts` `publishRoute keeps a configured hold when publish=true appears only inside pasted text` fails on `publishRoute(rows, "fix this:\n> log: publish=true\n", { remote: true, local: false })` returning `{ publish: true, publishSource: "token" }`

<!-- bkit:task 2 end -->
