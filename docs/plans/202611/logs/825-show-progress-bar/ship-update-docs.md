Verdict: PASS
Failures: 0
<!-- verdict:end -->

# Docs Update

History check: `git rev-parse --is-shallow-repository` printed `false`, so the full history was read (`origin/dev..HEAD`).

## Files Modified

None.

## Drift Resolved

None. All four passes (sync content, structure, wording, cross-references) found nothing to change. Build already updated every doc the plan's Documentation Updates table lists, and each one matches the code in `.bkit/core/engine/commands/workflow/steps.ts`, `step-table.ts` and `counters.ts`:

<!-- prettier-ignore -->
| Doc | Checked against | Result |
| --- | --- | --- |
| `.bkit/core/.bkit/cli.md` and mirror `.bkit/cli.md` | `--progress-number` flag on `steps gate` (`steps.ts:1843`, `:1902-1920`), `progressLine` output metadata (`steps.ts:1891`), `--group` on `counters max` | In sync. The "Progress output" paragraph links to `.bkit/workflows.md` § Progress Lines, which exists. |
| `.bkit/core/.bkit/workflows.md` and mirror `.bkit/workflows.md` | `runProgress` formulas, 99% clamp, sparse group ordinals, retry suffixes | In sync. The Narrate row and the new § Progress Lines match the `.bkit/instructions.md` clause. |
| `.bkit/instructions.md` | `workflow-narrate` clause, old wording under `retired` | In sync with the six workflow sources (instructions check exit 0 per `ship-deferred-sweep.md`). |
| `docs/testing.md` § Key test files (below `bkit:end`) | `step-table.test.ts`, `progress.integration.test.ts`, `hosts.test.ts` | In sync. Phone check path and "not run" nature are stated. |
| `CHANGELOG.md` | Unreleased `### Added` entry | In sync. |
| `docs/plans/202611/logs/825-show-progress-bar/phone-verification.md` | Plan Task 4 | Present, `Outcome: not run`. |
| `.agents/docs.md` | Doc index rows | No change needed. No new standalone doc was added. |

Agent memory (`MEMORY.md` and `memory/*.md`) holds no progress-line content, so there was nothing to dedupe.

## Pending Items

Two OPEN deferrals from `ship-pending-items.md`, both `scope-declared`, for human review:

- `825-live-status-bar-ui` (LOW, dx): a live status bar or app UI is separate from the chat progress lines.
- `825-duration-weighted-progress` (LOW, dx): weighting steps by elapsed time needs its own timing design.

Not a deferral row, but still open: the 375px Claude app screenshot check is `not run` (`phone-verification.md`), so that success criterion is unverified.

## Blockers

None.
