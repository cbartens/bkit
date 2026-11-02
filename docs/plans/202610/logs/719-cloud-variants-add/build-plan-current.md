Verdict: CONCERNS
Affected: 1

<!-- verdict:end -->

# Plan Currency

## Affected Tasks

### TASK 4: `codex` cloud variant

- **class:** Reword
- **Landed change:** commit `94915b0d4` "feat(741-cli-doc): list every bkit command in a generated .bkit/cli.md". `.bkit/core/engine/cli.ts:565` (origin/dev) adds `CLASSIC_VERB_HELP` (+ `classicUsage()`); `printUsage` now renders the `bkit <verb>` list from that table. The `install` and `uninstall` entries list `"--auto=<claude|cursor|opencode>"` at `cli.ts:592` and `cli.ts:648`. The docstring says `.bkit/cli.md` renders the same list, and the new byte-equal core doc `.bkit/core/.bkit/cli.md:58` / `:61` (manifest entry `.bkit/cli.md`, `manifest.ts:140`) carries the same `--auto=<claude\|cursor\|opencode>` cells. The cloud help block the plan cites at `:702-709` / `:801` now sits at `cli.ts:854-860` (`--auto=<claude|cursor|opencode>`, `OPENCODE_PROVIDER_KEY` at `:860`) and `:953`; TASK 6's `:817` comment is now `cli.ts:969`.
- **Re-run must resolve:** TASK 4's help-text `UPDATE` must name `CLASSIC_VERB_HELP` (`install` + `uninstall` `flags`) beside the cloud block at `cli.ts:854-860` / `:953`, and add `.bkit/core/.bkit/cli.md` (`:58`, `:61`) as an `UPDATE` so the rendered CLI doc lists `codex`; TASK 18's mirror list must add `.bkit/cli.md`; refresh the `cli.ts` line refs in TASK 4 (`:702-709`, `:801`) and TASK 6 (`:817` -> `:969`).
