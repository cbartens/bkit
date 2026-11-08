Verdict: CONCERNS
Affected: 1

<!-- verdict:end -->

# Plan Currency

## Affected Tasks

### TASK 12: Router `codex` job; `opencode` job dependency install

- **class:** Reword
- **Landed change:** Commit `20b00c4bd` (`feat(748-brand-every-consumer): brand every consumer-facing script, check and style name bkit-* (#829)`) renamed every router job display name to a `bkit-cloud-` prefix: `.bkit/templates/.github/workflows/bkit-cloud.yml:96` `bkit-cloud-context`, `:472` `bkit-cloud-claude`, `:547` `bkit-cloud-opencode`. The same commit moved `.github/workflows/bkit-cloud.yml` out of the shared `it.each` in `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` into its own case (`:846-853`). That case asserts that `unprefixedDisplayNames` (`:788-799`, `BRANDED_WORKFLOWS` `:781-785`) is empty for both the template and the adopted copy. A job with no `name:` falls back to its id, so a job shown as `codex` fails it. TASK 12 adds the `codex` job without giving it a display name, and its `DONE WHEN` requires `dogfood-templates.test.ts` to pass.
- **Re-run must resolve:** Give the new `codex` job the display name `bkit-cloud-codex (${{ github.event_name }})`, and keep the job id `codex` that the `needs.context.outputs.codex` gate and the concurrency suffix use. Point the dogfood reference at the dedicated `.github/workflows/bkit-cloud.yml` case (`:846`) instead of the `it.each` `%s` (`:703`). Keep the `runs-on` count change from 3 to 4 in the `ADOPTED` entry (`:222-233`). The job shape, the action inputs and the planned tests are still executable.
