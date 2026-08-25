# Related Issues — 341-three-runtimes (plan phase)

Search unavailable.

## Why (recurrence of an already-logged bug)

`mcp__github__search_issues` returned `total_count: 0` for `runtime capability shim fallback worktree in:title,body` — the same silent-zero failure the design phase already diagnosed and logged (`docs/failures.jsonl` key `github-mcp-search-issues-silently-returns-zero-private-repo`, surfaced again in this run's own `related-failures.md`). Per that entry's remediation, a bare `0 hits -> None.` is not authoritative on this repo without corroboration, so this file corroborates via `gh` rather than repeating the design phase's mistake of trusting the zero.

<!-- prettier-ignore -->
| Probe | Result |
| --- | --- |
| `mcp__github__search_issues` `runtime capability shim fallback worktree in:title,body` | `total_count: 0` |
| `gh search issues --repo cbartens/bkit worktree runtime` | 20 results (incl. #341, #342, #99, #134, #209) |
| `gh api search/issues -f q='repo:cbartens/bkit is:issue is:open'` | `404 Not Found` (endpoint needs `q=` not `-f q=`; not re-diagnosed here, out of scope for this plan) |

Still logged under the same failures.jsonl key — not duplicated.

## Related issues (from `gh search`, filtered to genuinely related)

- **#134** — Unify design→ship artifact trail onto same feature branch. **CLOSED**; superseded by the shipped per-phase ephemeral-branch model (already reflected in plan-v1-draft.md's Related Issues and §6h).
- **#209** — Workflow state model design/plan squash to dev persistent feat branch build→ship. **CLOSED, shipped**; the reason worktrees + `feat/{FID}` span all five phases (drives D3 scope).
- **#342** — Prompt-injection hardening. **Open**, `bkit:plan`. Owns the §5a lethal-trifecta / §6f mitigation; adjacent — this plan's T14 fallback cap (D13) must not duplicate #342's scope.
- **#99** — Friction triage. **Open**, `bug`. General workflow-friction tracker; not #341-specific.
- **#324** — Recurring self-healing audit loop. **Open**, `enhancement`. Not directly related to runtime detection; surfaced by the `worktree` keyword only.
- **#80** — Add bkit-audit workflow parallel best-practice lens audits. **Open**, `bkit:design`. Not related; surfaced by `worktree`/`runtime` keyword overlap only.

No new relationships beyond what `plan-v1-draft.md`'s own "Related Issues" section (and the design phase's prior corroborated search) already captured — this confirms that set, it does not expand it.
