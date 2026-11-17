Verdict: FAIL
Failures: 1
Fixable: false
Tasks: 10, 12
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Group 3

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

- `build-plan-verify-3-1.md`: FAIL, 4 gaps (Task 11 `Fixable: false`; Task 12 evidence, Task 10 `providers.md` signatures, Task 10 `docs/testing.md` rows `Fixable: true`).
- `build-plan-gaps-remediate-3-1-log.md`: 3 DONE, Task 11 BLOCKED for an owner decision.

## Notes

- **Round-1 fixes, judged against the round-1 gap text:**
  - Task 12 evidence: closed. The remediate log records `pnpm build` exit 0, a built-CLI fresh scratch-consumer install under `tmp/` on all five hosts with on-disk inspection (NotebookEdit, Cursor `Write|Delete`, Antigravity `multi_replace_file_content`, four host hook copies, `.bkit/authoring.md`, the `bkit-plan.md` pointer), scratch `bkit check` exit 0, and a serial cold-start run (`--no-file-parallelism`, node v24.16.0, darwin, 10 CPUs, 3 repetitions, 349/349 each, load 3.4-9.7). Per-adapter elapsed and size figures are in the round-1 notes; the test asserts elapsed < 1000 ms and size within budget for every adapter and case (`gateguard-parity.integration.test.ts:1311-1316`). The machine was not idle: other agents shared it, so the run controls this run's own workers only.
  - Task 10 `providers.md` signatures: closed. § Diagnostic signatures now says the hooks emit no signature string and names the prose for three of the six. Each quoted string exists in the source: "could not be safely read" and "Analysis limit reached" in `.bkit/core/hooks/guardrails-shell.js`, "omitted (output limit)" in `.bkit/core/hooks/gateguard-engine.js`. No hook carries the six labels. The doc now matches the code, which the round-1 gap allowed.
  - Task 10 `docs/testing.md` rows: closed. The detector text is on the `guardrails-cursor.integration.test.ts` row, a new `install/modules/core.integration.test.ts` (shell advice) row carries install/upgrade, and the dogfood row is back to its own scope. The new row says honestly that upgrade from the shipped registrations is not covered, which matches the open Task 11 gap. Prettier passes on both files.
- **Repo `pnpm bkit check` drift (Task 12 DONE WHEN):** verified as stale mirrors only. It exits 1 with 244 writes: 190 agent files (38 prompts x `.claude`, `.cursor`, `.codex` (`.toml`), `.opencode`, `.agents/plugins`), 36 `docs/templates/*`, `.agents/rules.md`, `.bkit/workflows.md`, `.bkit/providers.md`, 9 host hook copies, 5 Antigravity plugin files (`bkit-readguard.cjs` and `bkit-rules.cjs` carry the changed `antigravity-hook.js` part), 3 JSON registrations, and the `.bkit/version` pin. Every path maps to a source this branch changed since base `da97be38` (38 prompts, 36 templates, rules/providers/workflows, `.bkit/core/hooks/*`, the host hook templates, `.bkit/shared/*` registrations). The end-of-session `bkit upgrade` clears it. Task 12 is judged satisfied on that basis, and the repo-level check passes only after that upgrade. The repo's own installed registrations hold only bkit-owned groups, so that upgrade will not hit the Task 11 array-replacement loss here.
- **Tests (this run, node v24.16.0, load 12-14 on 10 CPUs):** all four named Group 3 cases pass. Fourteen related files (the group-3 files plus every test reading `testing.md` or `providers.md`) give the same 40 failures as round 1, all stale mirrors: 36 `templates.test.ts` dogfood cases, 1 `rules-sync.test.ts`, 3 `guardrails-cursor.integration.test.ts` "mirror matches its template". Not gaps. `tsx .bkit/core/engine/tools/instructions.ts` check exits 0.
- **`gateguard-opencode.test.ts`** is still blob `7899c47631433b0a9fbc045b79a2b548d9aa3cb1`.
- **Test-first audit (`build-tests-green-3-2.md`):** `Enforced: true`, 0 gaps, 0 unproven, no updated tests. Already landed: Task 11 `installs and upgrades shared hook behavior without replacing owned drivers` (the tests step's reason: fresh install and upgrade already keep the managed shell advice, customised driver bytes and the custom Claude group). Task 12 `keeps rendered classification advice and acknowledgement equivalent` (the tests step's reason: all four shell adapters already agree; OpenCode has no shell hook). The Task 11 pass is why its gap stands: the fixture never starts from the shipped registrations.
- **Decision records:** `build-decision-1-1.md` covers group 2 Task 7 only. No record accepts the Task 11 gap.
- **Plan currency:** `build-plan-current.md` reports 0 affected tasks.

## Identified Gaps Log

Gaps: 1 (1 `Fixable: false`, 0 `Fixable: true`).

TASK 11: `.bkit/core/engine/install/modules/core.integration.test.ts` `installs and upgrades shared hook behavior without replacing owned drivers` — DONE WHEN not met, unchanged since round 1 (no change to `core.integration.test.ts` or `.bkit/core/engine/install/write.ts` since `84c496bba`; the remediate round logged it BLOCKED): the upgrade fixture builds its registrations from the new template, not from the shipped layout, so it never reaches the drift path. On the base-commit (da97be38) registrations plus one consumer group, the matcher changes (`NotebookEdit`, Cursor `Write|Delete`, Antigravity `multi_replace_file_content`) fail `deepContains`, and `deepMergeJson` (`write.ts:157`) replaces arrays wholesale, so a consumer's custom `PreToolUse` / `preToolUse` group and a consumer-only `permissions.allow` entry are dropped on upgrade. Closing it needs an owner choice the plan does not make: change the deep-containment merge (`.bkit/core/.bkit/install.md` § JSON ownership model), add a migration (the plan says none), or accept the loss and restate the DONE WHEN — Fixable: false
