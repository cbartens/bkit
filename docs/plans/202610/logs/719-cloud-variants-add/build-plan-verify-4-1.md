Verdict: PASS
Failures: 0
Fixable: false
Tasks: 7
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Group 4

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

- TASK 7 satisfied against `build-diff-4-1.md`:
  - `Check runner credentials` reads `BKIT_ANTHROPIC_API_KEY` (or both federation variables), `BKIT_OPENCODE_API_KEY` / `BKIT_OPENROUTER_API_KEY` / `BKIT_OLLAMA_API_KEY` and `BKIT_OPENAI_API_KEY`, and emits only `enabled`.
  - New `Select agent job` step (`id: select`) sits after checkout, reads `bkit.cloud.agent` from `package.json` (absent reads `none`), sets one of `claude` / `opencode` / `codex` plus `agent` only when that agent's credential is set, names the missing secret, names `bkit install --auto=<claude|opencode|codex>` for an absent agent, names Cursor's native triggers, and lists ignored credentials. Outputs `dispatched` / `ignored` are exposed on the context job for TASK 9.
  - Job `if:` on `run` (`:548`) and `opencode` (`:621`) read `needs.context.outputs.claude` / `.opencode`, which now map to `steps.select.outputs.*`.
  - `run` job passes `secrets.BKIT_ANTHROPIC_API_KEY`; the opencode dispatch step maps each provider `BKIT_` secret to its same-named env var; the `OPENCODE_PROVIDER_KEY` fan-out is gone; header comments describe one agent per run.
  - `.github/workflows/bkit-cloud.yml` is identical to the template apart from `runs-on` lines (checked with `diff` after stripping `runs-on`).
- DONE WHEN, re-run by this verifier: `vitest run` on `cloud-ctx-step.integration.test.ts`, `workflow-templates.integration.test.ts` and `dogfood-templates.test.ts` gives 3 files / 141 tests passed, including all eight named tests; `git grep -n -e OPENCODE_PROVIDER_KEY -e 'secrets\.ANTHROPIC_API_KEY' -- .bkit/templates .github/workflows` prints nothing (rc 1).
- Test-first audit (`build-tests-green-4-1.md`, `Enforced: true`, 1 gap): the `not-green` gap for `recorded %s selects no router job` is resolved. The engine looked for the literal `%s` title; vitest expands the `it.each` into `recorded cursor selects no router job` and `recorded none selects no router job`, and both ran and passed in this verifier's run. No `Unproven`, `Updated tests` or `Already landed` sections.
- The gate-describe edits to existing tests (dropping `claude` / `opencode` gate outputs) follow the plan's UPDATE line for `:808-876`; the gate no longer emits those outputs, and the per-agent selection is asserted by the new `Select agent job` tests.
- Decision records `build-decision-1-*` and `build-decision-2-1` concern groups 1 and 2; none applies to group 4.
- Out of scope for this group (not a gap): the claude job header comment (`.bkit/templates/.github/workflows/bkit-cloud.yml` around `:541`) still says "Runs only when the context job found a claude credential"; TASK 17 (repo docs and code comments) may tidy it.

## Identified Gaps Log

None

