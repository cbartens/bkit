# Docs Update

## Files Modified

- `docs/testing.md`

## Drift Resolved

- `docs/testing.md` (all four passes): the `catalogue.test.ts` row now covers the `project-goals` tip (fires with no heading or commented-only examples; quiet for one `-`, `*` or numbered goal, a goal in a second section, or no rules file; the ask says to fill an existing section). A new row covers `rules-sync.test.ts` (`Project Goals` section order and no goal outside a comment). The `instructions.test.ts` row now names the `rules-leaf` assertions (tie-break by `Project Goals`, never lowers a severity or softens a verdict).
- `.bkit/prompts.md` and `.bkit/instructions.md` were already updated by the build (the `Central agent rules` row and the `rules-leaf` clause); no edit needed.
- No doc lists the setup tips one by one (`DETAILS.md` § Spending fewer tokens names a chosen few; `.bkit/advisories.md` § Setup tips is a one-tip format sample), so none gained a `project-goals` entry.
- `CHANGELOG.md` has no unreleased section; the release step writes it.
- `docs/decisions.jsonl` and `docs/knowledge.jsonl` untouched, by this agent's contract. The owner's limit on goals is stated in clause `rules-leaf`, which the deferral for it required.

## Unresolved Coverage

None of the ten recommended topics is touched by this ship's files except `testing` (covered and updated above). Not applicable: architecture, technology, security, data-schema, deployments, observability, design, noise, setup (no shipped file changes their subject).

Shallow check: `git rev-parse --is-shallow-repository` printed `false`.

## Pending Items

- `1011-rules-ship-project-challenge-low-bkit-core-engine-checks-tips-detect-ts-244`: `hasProjectGoalsHeading` / `hasNoProjectGoals` match the heading case-sensitively, so `## Project goals` makes the tip fire and ask for a second section.
- `1011-rules-ship-project-challenge-low-bkit-core-engine-checks-tips-detect-ts-242`: an unclosed HTML comment opener quoted outside the section can swallow the `## Project Goals` heading, so the tip fires although goals are filled.
- `1011-rules-ship-project-challenge-low-bkit-instructions-md-2573`: CLOSED by the `rules-leaf` wording "which never lower a severity or soften a verdict".

## Blockers

None
