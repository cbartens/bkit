Verdict: CONCERNS
Affected: 1

<!-- verdict:end -->

# Plan Currency

## Affected Tasks

### TASK 4: `codex` cloud variant

- **class:** Reword
- **Landed change:** Commit `94915b0d4` (`feat(741-cli-doc): list every bkit command in a generated .bkit/cli.md`) added `CLASSIC_VERB_HELP` in `.bkit/core/engine/cli.ts:581`. Its install and uninstall `flags` still list `--auto=<claude|cursor|opencode>` at `:592` and `:648`. The table supplies the generated CLI documentation as well as usage text; `.bkit/core/engine/install/manifest.ts:143` now installs `.bkit/cli.md`. The plan names only the older help-text locations and omits this new help surface.
- **Re-run must resolve:** Include both `CLASSIC_VERB_HELP` flag entries when adding `codex`, regenerate the CLI reference from its source, and carry its installed copy through TASK 18. Keep the existing cloud usage block and validation message aligned. The variant approach and planned behavioral tests remain executable.
