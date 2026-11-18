## Session Prompt — this run's, newer than everything below

/bkit-plan #1008

## Issue description — oldest

Findings D1 and N4 of [Review since v6.1.1: tech debt findings and consolidation work](https://github.com/cbartens/bkit/issues/964). Re-read on `dev` at `4205439c8` on 2026-11-17: still true. The review described it as "the comment is refused". That is not what happens: the comment is posted, but in the wrong place.

## What happens

At the end of `/bkit-plan` and `/bkit-design` the close step runs `bkit workflows close ... --session-dir="{SESSION_DIR}"` (`.bkit/core/workflows/bkit-plan.md:500`, `.bkit/core/workflows/bkit-design.md:594`). That deletes the run's session folder (the private folder that holds the run's working files).

The Owner Answers step comes after it and runs `bkit issues comment --post ... --step-title="Owner Answers" ... --session-dir="{SESSION_DIR}"` (`bkit-plan.md:561`, `bkit-design.md:646`). The command can no longer read the folder. It prints

```
[bkit-tracker] invocation association unavailable; progress may start fresh
```

and writes a friction row (a record of something that slowed a run down). The comment is still posted, but it does not join the run's progress comment. The command falls back to comparing against the latest 5 comments on the issue.

The row `tracker-comment/comment-association` in `.bkit/friction.jsonl` has 16 recurrences, all from plan runs, and is still open.

## Why

- `workflows close --session-dir` removes the folder (`.bkit/core/engine/commands/workflow/workflows.ts:1822-1836`).
- A comment's link to its run is a hash of the session folder's path and the workflow name (`sessionPublication`, `.bkit/core/engine/commands/workflow/tracker.ts:2037-2049`). It needs the folder to exist and throws when it does not.
- `postForVerb` (`tracker.ts:2147-2161`) catches that error, writes the diagnostic and carries on with no link. Without a link the post looks only at the latest 5 comments (`RECENT_COMMENTS`, `tracker.ts:1948`, used at `:2181`).
- Moving the close step after the comment cannot fix it. The owner's answers arrive after the close by design.

[Workflows: close and pull-request steps print their route](https://github.com/cbartens/bkit/issues/1005) touches the same two steps (it replaces their guards with one answers command) but does not change how the comment finds its run. Whoever takes either issue should read the other first.

## Where

- `.bkit/core/engine/commands/workflow/tracker.ts` (`sessionPublication`, `postForVerb`)
- `.bkit/core/engine/commands/workflow/workflows.ts` (the close verb's folder removal)
- `.bkit/core/workflows/bkit-plan.md:500`, `:561`; `.bkit/core/workflows/bkit-design.md:594`, `:646`

## Done when

- After `workflows close --session-dir`, a post with `--session-dir` (plan Step 8, design Step 12) joins the same progress comment as the run's earlier reports. An integration test closes a run, then posts, and checks this.
- That sequence writes no `tracker-comment/comment-association` friction row and prints no "invocation association unavailable" line.
- The run's link is kept somewhere that outlives the session folder, for example the run's `status.jsonl`, and is not worked out from the folder's path.
- A post with no proof of a run at all is still refused, and a test keeps proving it.
