Verdict: CONCERNS
Strategy: STANDARD
Fixed: 3

<!-- verdict:end -->

# Plan Gaps

## Remediation Log

DONE — Gap 2: Task 12 build, scratch install, check and cold-start evidence — `pnpm build` exit 0 (node v24.16.0, darwin, 10 CPUs). Fresh scratch consumer under tmp/ (since removed): `node dist/cli.js install --claude --cursor --codex --antigravity --opencode=openrouter` exit 0; on disk: `.claude/settings.json` has NotebookEdit, `.cursor/hooks.json` has `Write|Delete`, `.agents/plugins/bkit/hooks.json` has `multi_replace_file_content`, the four host hook copies exist, `.bkit/authoring.md` exists, `docs/templates/bkit-plan.md` carries the authoring pointer; `bkit check` in the scratch consumer exit 0. `pnpm bkit check` in the repo exits 1 (244 writes, drift) because installed mirrors are stale until the orchestrator's end-of-session `bkit upgrade`. Serial cold-start run: `vitest run gateguard-parity.integration.test.ts --no-file-parallelism`, 3 repetitions, 349/349 passed each, 31.0s / 32.4s / 42.3s, no other audit or test workers started by this run; load averages 3.4/6.9/9.7 before, 5.2/6.1/9.0 after, so the machine was not idle and the runs are not a clean-machine measure (docs/plans/202611/logs/787-show-authoring-rules/build-plan-gaps-remediate-3-1-log.md)
DONE — Gap 3: Task 10 providers.md diagnostic signatures — doc now says the hooks emit no signature string and names the prose that exists for three of the six, with the other three as recovery guidance only (.bkit/core/.bkit/providers.md)
DONE — Gap 4: Task 10 docs/testing.md rows — detector text moved to the guardrails-cursor.integration row, install/upgrade text to a new core.integration row, dogfood row scope restored (docs/testing.md)
BLOCKED — Gap 1: Task 11 upgrade from shipped layout drops consumer hook registrations (array-replacing JSON merge) — Fixable: false; needs an owner decision on the merge model, a migration or a restated DONE WHEN
