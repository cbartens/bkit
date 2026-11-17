Verdict: FAIL
Failures: 4
Fixable: true
Tasks: none
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

None

## Notes

- **Test results (this run, node v24.16.0):** all four Group 3 named tests pass (`keeps shipped authoring pointers in their editor context`, `installs and upgrades shared hook behavior without replacing owned drivers`, `keeps rendered classification advice and acknowledgement equivalent`, `bounds rendered cold-start time and complete response size`). A wider run over `.bkit/core/engine/{audits,install,tools,render}` gave 4553 passed, 2 skipped and 40 failed.
- **The 40 failures are stale mirrors only:** 36 `templates.test.ts` dogfood cases (every installed `docs/templates/*.md` equals its source with the new editor-pointer sentence removed; 0 of 36 differ otherwise), 1 `rules-sync.test.ts` (the installed `.agents/rules.md` block differs only in the two changed rule lines), and 3 `guardrails-cursor.integration.test.ts` T6 cases (installed `.claude/.cursor/.codex` guardrails hooks predate the shared GateGuard engine, so they are stale from group 1 onwards). None is a real defect, and the end-of-session `bkit upgrade` clears them.
- **`guardrails-cursor.integration.test.ts` `stops analysis at each internal bound`:** legitimate follow-on, not loosened. The new shell introduction names up to 200 characters of targets and counts the rest. With the fixture's fixed names, 8 are shown, so ` and 56 more)` asserts exactly 64 kept targets, and both a missing bound (70 → "and 62 more") and a lower bound fail it. Group 1 Task 3's DONE WHEN still holds. The remaining `not.toContain("src/f64.ts")` is now weaker, because the introduction no longer lists late targets, but the exact count carries the check.
- **`templates.test.ts` `setup.md § Templates` entry removal:** a mechanical follow-on, not a loosened assertion (exact set equality is kept). Note that `uncoveredBkitDocSections` matches a heading title as a bare substring, so `setup.md § Templates` now counts as "named" only because every audit template says "§ Doc Templates"; no audit actually checks that section. Proposed out-of-scope fix: make `named()` match `§ {title}` instead of the bare title, then restore the entry.
- **Budget check (Task 12), measured on rendered guardrails hooks:** 80 long targets (ASCII, 2-byte multibyte and redirect forms, with and without `&& python3 gen.py`): Claude 6616-6854 chars (≤ 8000), Cursor 859-989 bytes, Codex 859-989 bytes, Antigravity 942-1072 bytes (≤ 2000). The earlier 12-target `sed -i ... && python3 gen.py` case: Claude 7825 chars, Cursor 802, Codex 802, Antigravity 885 bytes. All within budget. Byte bounds (256 KiB command, 64 KiB script, nested depth) ran 22-98 ms per call over 3 repetitions and stayed within budget. Load average was 5.2-13 on 10 CPUs. On Cursor, Codex and Antigravity no per-file block fits beside the introduction for long agent-read targets, so they get the omitted-count notice only, by design.
- **Instructions and authoring checks:** `tsx .bkit/core/engine/tools/instructions.ts` (check mode) exits 0 with no findings. Each of the 36 templates carries the editor pointer once, inside the opening note in the managed block. 39 source files carry the new Edit tools sentence once each, 9 carry the new Authoring line once each, and no old wording is left. Prettier passes on all 85 changed files, `format:tables:check` passes, and `bkit:lint:prose` gives 0 errors.
- **`gateguard-opencode.test.ts`** is still blob `7899c47631433b0a9fbc045b79a2b548d9aa3cb1`.
- **Test-first audit (`build-tests-green-3-1.md`):** `Enforced: true`, 0 gaps, 0 unproven. Already landed: Task 11 `installs and upgrades shared hook behavior without replacing owned drivers` (the tests step reports that fresh install and upgrade already keep managed shell advice, customised driver bytes and the custom Claude group). Task 12 `keeps rendered classification advice and acknowledgement equivalent` (the tests step reports that all four shell adapters already agree; OpenCode has no shell hook). The Task 11 pass is the reason the TASK 11 gap stays open: the fixture never starts from the shipped registrations.
- **Decision records:** `build-decision-1-1.md` (group 2, Task 7 test correction, owner chose "Fix now") does not touch Group 3 tasks.
- **Plan currency:** `build-plan-current.md` reports 0 affected tasks.
- **Outer drivers:** the text outside `bkit:start` / `bkit:end` in all eight gateguard and guardrails hook templates is unchanged since base `da97be38`, so the Task 11 fixture's driver bytes do equal the shipped layout. Only the registration side fails.

## Identified Gaps Log

Gaps: 4 (1 `Fixable: false`, 3 `Fixable: true`).

TASK 11: `.bkit/core/engine/install/modules/core.integration.test.ts` `installs and upgrades shared hook behavior without replacing owned drivers` — DONE WHEN not met: the upgrade fixture builds its registrations from the new template (a custom group pushed onto the fresh-install `.claude/settings.json`), not from the shipped layout, so it never reaches the drift path. Reproduced with `writeTier2JsonContained` (`.bkit/core/engine/install/write.ts:261`) on the base-commit (da97be38) registration files plus one consumer group: the matcher changes in this plan (`NotebookEdit`, Cursor `Write|Delete`, Antigravity `multi_replace_file_content`) fail `deepContains`, and `deepMergeJson` (`write.ts:157`) replaces arrays wholesale, so the consumer's custom `PreToolUse` / `preToolUse` group is dropped on Claude, Cursor and Antigravity, and a consumer-only `permissions.allow` entry in `.claude/settings.json` is dropped too. Closing it needs an owner choice the plan does not make: change the documented deep-containment merge (`.bkit/core/.bkit/install.md` § JSON ownership model), add a migration (plan says none), or accept the loss and restate the DONE WHEN — Fixable: false
TASK 12: DONE WHEN not met: `pnpm build`, the built-CLI fresh scratch-consumer install under `tmp/`, on-disk inspection and `pnpm bkit check` were not run (execution log says so), and the controlled serial cold-start run with recorded runtime, machine/load and repetition count is not recorded anywhere (the test prints its evidence string only on failure) — Fixable: true
TASK 10: `.bkit/core/.bkit/providers.md` § Diagnostic signatures says the six signatures are "local labels carried by the advisory itself", but no hook source emits any of `analysis-unavailable`, `analysis-limit`, `output-limit`, `state-fallback`, `delivery-unverified`, `driver-wiring` (`grep` over `.bkit/core/hooks` and every host hook template finds none); the advisories carry prose only for three of them ("Analysis limit reached", "omitted (output limit)", "could not be safely read") and nothing for state fallback, delivery or driver wiring. The plan's Observability item requires the signatures through the owning hook's channel, so emit them or make the doc match the code — Fixable: true
TASK 10: `docs/testing.md` — the added "Shell-edit detection and advice reach consumers through the existing tiers ..." sentence was prepended to the `gateguard-dogfood.integration.test.ts` row, which describes a different file; the `guardrails-cursor.integration.test.ts` row still lists only deny/ask, allowlist and secret-read coverage, and `core.integration.test.ts` install/upgrade evidence has no row of its own. Move the detector text to the guardrails row and the install/upgrade text to a row for `install/modules/core.integration.test.ts`, restoring the dogfood row's scope — Fixable: true
