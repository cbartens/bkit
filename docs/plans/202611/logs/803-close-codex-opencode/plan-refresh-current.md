Verdict: CONCERNS
Affected: 4

<!-- verdict:end -->

# Plan Currency

## Affected Tasks

### 1. TASK 4: Deny Codex shell reads of private-key files, `.env` advisory

- **Class:** `Reword`
- **Decided by:**
  - `.bkit/core/hooks/guardrails-tiers.js:249` `shellSecretRead` (was `:234-262`, now `:249-277`, body unchanged); `secretFileKind` now `:208`; `classifyShell` now `:292` with signature `classifyShell(c, dirs, ctx)`; new shared `TESTS_JUMP_RE` and `IS_CODEX_HOOK` (`:191`) with a Codex-only `deny` tier for `bkit tests jump` inside `classifyShell`. Commits `872abbdca feat(916-tests-lock-waiting): serve runs waiting for the tests lock in arrival order` and `e4377aad7 feat(787-show-authoring-rules): show authoring rules before every edit, including shell edits`.
  - `.bkit/core/.codex/hooks/bkit-guardrails.cjs:66` `decideShell(cmd, dirs, ctx, session)` (was `decideShell(cmd, dirs)` at `:60-90`); the `case "secret"` advisory `ask(...)` is now `:78-81` (was `:76-79`), text unchanged; the managed block now also splices `gateguard-engine.js` before `guardrails-shell.js` and `guardrails-tiers.js`; the `fetch` and default cases now call `shellEditContext(...)`. Commit `e4377aad7`.
  - `.bkit/instructions.md` § Hook Text Codex entries now `:9089-9152` (was `:8888-8937`); `guardrails-codex-secret-shell` now `:9126-9139` (was `:8913-8925`); new sibling `guardrails-codex-tests-jump` at `:9100`. Commits `872abbdca`, `e4377aad7`.
  - `.bkit/core/engine/install/modules/index.integration.test.ts:889` the `shell reads of secret files — script hosts gate, permission tables do not` describe (was `:809`); `SHELL_SECRET_READS` at `:636`, `codexVerdict` at `:736`. Commits `872abbdca`, `e4377aad7`.
- **Re-run must resolve:** update the cited lines in Task 4, the `[MODIFY] guardrails-tiers.js`, `[MODIFY] bkit-guardrails.cjs`, `[MODIFY] .bkit/instructions.md` entries and the `Reuse Inventory` rows (`guardrails-tiers.js:193-281`, `shellSecretRead:234-262`, `decideShell` `:60-90`, `bkit-guardrails.cjs:76-79`, `:8888-8937`, `:8916-8925`, describe `:809`); name the four-argument `decideShell` and the three-argument `classifyShell`; state that the key deny lives in `decideShell` `case "secret"` and not beside the new shared `IS_CODEX_HOOK` deny in `classifyShell`, because the shared tier is spliced into the Cursor and Antigravity hooks too; and place the new `guardrails-codex-key-shell-deny` entry beside `guardrails-codex-tests-jump`, the existing precedent for a Codex-only deny message.

### 2. TASK 3: Strip Claude derived grants by the `claudeAllowDerived` record and list unattributable grants for review

- **Class:** `Reword`
- **Decided by:** `.bkit/core/engine/commands/install/uninstall.ts` lost `coreDocEntries()` and the docs strip-block path (net -21 lines above the loop): `canonicalHashes` read now `:411` (was `:430-431`); the `.bkit/version` delete row now `:476-490` in `buildDecisionTable` (was `:497-511`); the `.claude/settings.json` branch now `:705-725`, with the `resolveClaudeDerivedAllows(ctx.cwd)` recompute at `:719` (was `:725-745` / `:738-744`); `stripOpencodeJsonScope` stays at `:150`. `.bkit/core/engine/commands/install/uninstall.test.ts:1150` `strips allow/deny/ask together, including install's WebFetch enrichment` (was `:1170`). `.bkit/core/.bkit/providers.md:523` Claude row (was `:476`). Commits `d51b44bc4 chore(864-move-project-docs): plan-execute group 1 attempt 1`, `e4377aad7`, `872abbdca`.
- **Re-run must resolve:** update the line references in Task 3, the `[MODIFY] uninstall.ts` entry, the Supersession Inventory row 2 (`uninstall.ts:738-744`) and the `Reuse Inventory` row (`uninstall.ts:715-760`) to the lines above; the approach (pre-read `claudeAllowDerived` beside `canonicalHashes`, replace the recompute at the settings branch) is unchanged. The new `#864 — full uninstall keeps project documents` test in `uninstall.integration.test.ts` already drives a real `install` → `uninstall` through `spawnSync(requireTsx(), ...)`, which the full no-flag uninstall test can reuse.

### 3. TASK 1: Stop the OpenCode shell fetch grants

- **Class:** `Reword`
- **Decided by:** `.bkit/core/.bkit/providers.md` gained the § GateGuard "Shell edits, host coverage and delivery limits" subsection (+47 lines above the cited rows): § Permissions Network fetch cell now `:488` (was `:438-441`), § Network allowlist OpenCode row now `:510` (was `:463`). `.bkit/core/.bkit/workflows.md` OpenCode `curl https://{host}/*` claim now `:1618` (was `:1437`). `.bkit/core/engine/install/modules/index.integration.test.ts` comments now `:1075` and `:1088-1092` (were `:961`, `:974-978`), parity test `every derived base reaches BOTH fetch surfaces on every host (fetch tool + shell)` now `:1301` (was `:1187`). `.opencode/opencode.json` gained `*bkit*tests jump*` / `*cli.js tests jump*` / `*cli.ts tests jump*` = `ask` rows directly above the legacy `curl *12factor.net*` allows. Commits `e4377aad7`, `872abbdca`, `203f0b7a3 feat(922-pre-push-load): pre-push hook loads .envrc itself and blocks fast if untrusted`, `b46431c0d fix(911-ship-failed-merge): ...`.
- **Re-run must resolve:** update the cited lines in Task 1, the Documentation Updates rows for `providers.md` (`:438-441`, `:463`) and `workflows.md` (`:1437`), the Open Questions assumption (`providers.md:463`) and Context table (`providers.md:463`); `opencode.ts`, `cloud-env.ts`, `opencode.integration.test.ts` and `cloud-env.integration.test.ts` are unchanged, so their references stand.

### 4. TASK 10: Refresh mirrors and `dist/`, clean bkit's own OpenCode copy, and record the new tests in `docs/testing.md`

- **Class:** `Reword`
- **Decided by:** `.husky/pre-push` graphify register gate now starts at `:309` and runs to about `:398` (was `:282-348`). Commits `203f0b7a3 feat(922-pre-push-load): pre-push hook loads .envrc itself and blocks fast if untrusted`, `b46431c0d`. Also `docs/testing.md` no longer has a `bkit:start` / `bkit:end` managed block (commit `d51b44bc4`, #864 project documents belong to the project), so the `[MODIFY] docs/testing.md` Existence Check (`bkit:end` at `:553`, sections at `:652`, `:844`, `:857`) is stale; the sections now sit at `:660`, `:867` and `:880`.
- **Re-run must resolve:** update `.husky/pre-push:282-348` in Task 10 to the current register-gate range, and rewrite the `[MODIFY] docs/testing.md` Existence Check: the whole file is project-owned, so there is no managed block to stay outside of, and the cited section lines move as above. The `.opencode/opencode.json` hand edit still holds: the new `*bkit*tests jump*` `ask` keys do not match `^(curl|wget) \*[^*\s]+\*$`, so the Task 10 `jq` check is unaffected.
