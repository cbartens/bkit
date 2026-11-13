# Docs Update

## Files Modified

- `docs/testing.md`
- `docs/architecture.md`
- `docs/security.md`

## Drift Resolved

- `docs/testing.md` (sync, compress, cross-refs):
  - New rows for `install/write.test.ts` (`mergeManagedJson` list merge) and `install/modules/core.test.ts` (authoring pointers).
  - GateGuard rows for Claude (NotebookEdit, shared shell identity), OpenCode (identity, off, deny, state fallback) and Cursor (Delete, unconfirmed reminder) extended.
  - Antigravity guardrails row now covers shell-edit composition.
  - `steps.test.ts` row notes the plan-scoped red-test lock (`runPlanPath`).
  - New "Hook-suite temp folder" bullet for the private `TMPDIR` in `vitest.setup.ts`.
  - The build had already extended the parity row, the Cursor guardrails row and the `core.integration.test.ts` row.
- `docs/architecture.md` (sync): the guardrails entry now says its exact edit targets feed GateGuard's per-file advice. The `gateguard-engine.js` entry now names the shell-target preparation, whole-block selection within host budgets and acknowledgement keyed by normalized path, session and agent.
- `docs/security.md` (sync): new section `Shell-Edit Inspection (GateGuard hooks)`. It covers inspected text as untrusted data, no execution, bounded descriptor reads, fixed limits, no source in output or state, fail-open advisory, and the known `/tmp` state-folder limit.
- Already updated by the build, checked and left alone: `docs/capabilities.md` (regenerated counts), `.bkit/providers.md`, `.bkit/workflows.md`, `.bkit/install.md`, `DETAILS.md`.
- `docs/migrations.md` not changed: the list merge in `write.ts` is install behaviour with no rewrite step, and `.bkit/install.md` already describes it.
- Memory: `MEMORY.md` holds only pointers and has no duplicate or stale content for this ship.
- History: the repository is not shallow (`git rev-parse --is-shallow-repository` printed `false`). The squash is staged, so the scope was read from `git diff --cached`.

## Unresolved Coverage

- Of the ten recommended topics, the 787 files touch architecture, security and testing. All three exist with project content and have indexed rows in `.agents/docs.md`.
- Not applicable, with the reason:
  - `technology`: no new framework, library or convention.
  - `data-schema`: no database change.
  - `deployments`: no CI change.
  - `observability`: reuses the existing hook channels; the new diagnostic signatures are documented in `.bkit/providers.md`.
  - `design`: no interface.
  - `noise`: no signal downgrade.
  - `setup`: no local setup change.
- Residual: `docs/testing.md` (existing doc, not a new gap) does not record the untested live-model visibility boundary beyond the parity and Cursor rows. That is by design and unverified on every host.

## Documentation Warnings

None. No relevant topic is absent, empty or starter-only.

## Pending Items

- `787-show-authoring-rules-challenge-low-bkit-core-hooks-gateguard-engine-js-211`: the GateGuard state folder in `/tmp` is not created owner-only, and a planted symlink is followed.
- `787-show-authoring-rules-challenge-low-bkit-core-hooks-guardrails-shell-js-1682`: the 256 KiB command bound is cut in UTF-16 units, not bytes.
- `787-show-authoring-rules-challenge-low-bkit-core-hooks-guardrails-shell-js-841`: `git -C` or `git -c` before `apply` hides the patch's files.
- `787-show-authoring-rules-challenge-low-bkit-core-engine-install-write-ts-256`: a retired permission or hook group stays in upgraded consumers forever (needs an owner decision).
- `787-show-authoring-rules-challenge-low-bkit-core-hooks-guardrails-shell-js-1577`: the command cut at 262144 UTF-16 units lets up to about 768 KiB through.
- `787-show-authoring-rules-challenge-low-bkit-core-hooks-gateguard-engine-js-115`: a consumer checkout under a `docs/` folder triggers agent-read and docs advice for every file.
- `787-show-authoring-rules-challenge-low-bkit-core-codex-hooks-bkit-guardrails-cjs-83`: a long fetch-plus-edit command overruns the Codex and Antigravity budget.
- `787-show-authoring-rules-challenge-low-bkit-core-cursor-hooks-bkit-guardrails-cjs-84`: Cursor's fetch ask drops the edit evidence.
- `787-show-authoring-rules-challenge-low-bkit-core-hooks-guardrails-shell-js-637`: `perl -lpi` and `-0pi` in-place edits are missed.
- `787-show-authoring-rules-challenge-low-bkit-core-hooks-guardrails-shell-js-1514`: a destructured alias of a writer (`{ writeFileSync: w }`) is classified read-only.
- `787-show-authoring-rules-challenge-low-bkit-core-hooks-guardrails-shell-js-730`: `cp new.md docs/` into a directory reports nothing.
- `787-no-repo-only-rule-edits`, `787-no-prompt-workflow-header-pointers`, `787-no-after-edit-checks`, `787-no-new-shell-blocking`, `787-file-type-specific-authoring-advisories`: declared out of scope in the plan.

## Blockers

None.
