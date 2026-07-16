# Related Issues — 341-three-runtimes

Search unavailable.

## Why (and why this matters to THIS design)

`mcp__github__search_issues` — the tool Step 3.1 specifies — returned `total_count: 0` for **every** query against this repo, including the control query `repo:cbartens/bkit is:issue is:open`. It is not that there are no related issues; the search is non-functional here.

Evidence gathered at Step 3.1:

| Probe                                                                        | Result                  |
| ---------------------------------------------------------------------------- | ----------------------- |
| `mcp__github__search_issues` `runtime cloud gh MCP fallback in:title,body`   | `total_count: 0`        |
| `mcp__github__search_issues` `cloud runtime in:title,body`                   | `total_count: 0`        |
| `mcp__github__search_issues` `worktree branch in:title,body`                 | `total_count: 0`        |
| `mcp__github__search_issues` `repo:cbartens/bkit worktree`                   | `total_count: 0`        |
| `mcp__github__search_issues` `repo:cbartens/bkit is:issue is:open` (control) | `total_count: 0`        |
| `gh search issues --repo cbartens/bkit worktree`                             | returns #341, #342, #99 |
| `gh api search/issues -f q='repo:cbartens/bkit is:issue is:open'`            | `total_count: 39`       |
| `gh repo view --json visibility`                                             | `PRIVATE`               |

Logged as `docs/failures.jsonl` key `github-mcp-search-issues-silently-returns-zero-private-repo` and `.bkit/friction.jsonl` key `design-step-3-related-issues-search-silently-empty-on-private-repo`.

### This is first-class design input, not just a workflow bug

The failure mode is **silent**: the MCP call returns a clean `0`, not an error. Step 3.1's own rule is _"0 hits → `None.`; on call error / timeout → `Search unavailable.`"_ — so the error branch never fires, and a faithful run would have written **`None.`**, quietly falsifying the design record on every private-repo consumer.

That directly stresses two things the design must answer:

1. **§6i ("trackers stay on MCP") has a silent-failure hole.** The settled direction gives the gh-covered PR/CI/merge surface a mapped gh→MCP fallback (§6b/6c) for when **gh** is down. Nothing covers the inverse — **MCP up but returning a silently-wrong result** — and tracker ops are MCP-only _by design_ with no fallback at all. gh fails loudly (exit code + stderr, which bkit's `|| Failure Path` gates can branch on); MCP here failed quietly and wrongly. §5c called MCP failures "opaque"; this shows they can also be _invisible_.
2. **The gh→MCP fallback rule (§6b) is directionally incomplete.** It is framed as `GH_OK=false → use MCP`. This incident is `MCP_WRONG=true → would need gh`. A design that only handles gh-outage leaves the tracker surface — the one surface with no fallback — exposed to exactly the class of silent bug (D1-family) that motivated this issue.

**Suggested design consideration (for `@bkit-design-generate` / reviewers):** whether the "Runtime/`MODE`" header-rule family should also carry a _result-plausibility_ rule for MCP reads that can return a benign-looking empty (search/list), e.g. a cheap control probe or a "0 hits is not authoritative without corroboration" clause — and whether §6i's MCP-only tracker constraint should admit a narrow read-path gh fallback on private repos.

## Related issues (from design-input.md context, NOT from search)

Not produced by Step 3.1's search (which is broken). These relationships are already established in `design-input.md` and are recorded here only so downstream steps do not mistake "Search unavailable." for "no related work exists":

- **#134** — design→ship artifact-trail model. **CLOSED not-planned**; superseded by the shipped per-phase ephemeral-branch model. Removes the §6h optionality.
- **#209** — state model / "design/plan feat-locate". Shipped; the reason worktrees + `feat/{FID}` now span all five phases (drives D3 scope).
- **#234** — NDJSON `status.jsonl`. Shipped; the per-step status commits that ride the phase branch.
- **#342** — Prompt-injection hardening. Open, `bkit:design`. Owns the §5a lethal-trifecta mitigation referenced by §6f; adjacent scope — this design should not duplicate it.
- **#99** — bkit workflow friction optimisation. Open, `bug`. General workflow-friction tracker.

_(Deliberately not gathered via a `gh` substitution for the specified MCP call: ad-hoc unguarded tool substitution is the D2 anti-pattern this very design exists to eliminate, and the §6b mapped-fallback rule does not exist yet. The `gh` probes above were diagnostic only.)_
