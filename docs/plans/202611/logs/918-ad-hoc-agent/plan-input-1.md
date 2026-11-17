## Session Prompt — this run's, newer than everything below

#918

## Issue description — oldest

## What goes wrong

Agents working **outside** a `/bkit-*` workflow are posting their ordinary progress and research comments through `bkit issues comment`. That command stamps every body with `###### bkit:generated {hash}` on the first line. Workflows read an issue through `bkit issues text`, which throws away every comment carrying that marker (`.bkit/workflows.md` § Tracker context filtering). So real content (research, agendas, decisions, links) disappears from the next design, plan or build run on that issue. Nothing warns anyone.

## Evidence

Reported case: [fcte-com-au/visitfrasercoast-com#710 — Review and approve partner policy and listing benefits](https://github.com/fcte-com-au/visitfrasercoast-com/issues/710#issuecomment-6782222061). Codex (ChatGPT Codex connector, as `cbartens-fcte`) posted a long discussion agenda headed `###### bkit:generated bcdb6be7a6bf` / `### Step 1 — Suggested internal discussion agenda`. Codex posted the same thing to #708 and #709.

**This was the CLI, not Codex copying the format.** The 12-character hash is the first 12 hex digits of the sha256 of everything below the first line (`stampMarker` in `.bkit/core/engine/commands/workflow/tracker.ts:441`). Recomputing it from the posted comment gives `bcdb6be7a6bf`, an exact match. A model cannot produce that by hand. The `### Step 1 — {title}` line is exactly what `--kind=step --step-number=1 --step-title=…` builds (`buildComment`, `.bkit/core/engine/commands/workflow/issues.ts:587`). Codex most likely ran the command without `--post` and posted the printed body through its GitHub connector. That would explain why the comment shows the connector app rather than a `gh` token user.

**It is not Codex-only.** Comments with invented "Step N" titles and the marker, outside any workflow run, also exist from local agents (Claude Code / others):

- [#710](https://github.com/fcte-com-au/visitfrasercoast-com/issues/710) (5 Nov, `lholmstrom-fcte`): "Step 1 — Review issue created", "Step 2 — Parent links and launch metadata verified"
- [#706 — Personal development: Website project management](https://github.com/fcte-com-au/visitfrasercoast-com/issues/706), [#707 — Personal development: Software engineering practices](https://github.com/fcte-com-au/visitfrasercoast-com/issues/707): "Step 1 — Learning resources"
- [#713 — Install Archify and generate architecture map](https://github.com/fcte-com-au/visitfrasercoast-com/issues/713): "Step 1 — Archify installation and final architecture diagram"
- [#283 — Plan milestone: Launch-readiness](https://github.com/fcte-com-au/visitfrasercoast-com/issues/283): "Step 1 — Levi onboarding issues created"
- [#666 — Transfer Gether design tooling and CI with minimal Fraser examples](https://github.com/fcte-com-au/visitfrasercoast-com/issues/666): 14 comments on 7 Nov, "Step 1 — Capture failure investigation…" through "Step 14 — Verify CI passes…", mixed in with that issue's real ship-workflow steps.

## Why agents do this

1. `.agents/rules.md` § Tracker work comments tells every agent to post a work comment after each major turn **outside** workflows. It does not say how, and it does not say the marker must stay off.
2. The only comment-posting tool an agent sees in the repo is `bkit issues comment`. Every workflow file shows it, and `.bkit/cli.md` lists it as "The exact body of a ###### bkit:generated step … comment". Its `Use` column says `workflow`, but agents treat that as a hint, not a rule.
3. The command itself has no check. It builds and posts a marked comment for any `--issue`, whether or not a workflow run is in progress.

## Suggested fix

Fix it in the engine first, because the rule alone won't stop agents that never read the docs (Codex cloud here):

1. **Engine guard: `bkit issues comment` refuses outside a workflow run.** If no in-progress run can be resolved for the issue (held lock or an `IN_PROGRESS` `status.jsonl` for the FID), exit with a usage error that says: "this command is for workflow steps only; post ordinary comments as plain markdown through the tracker MCP". `--kind=audit` needs its own condition, because `bkit-audit-generate` posts without a workflow lock. For example, require the report file named by `--audit-slug` to exist. Pin it with a test in `.bkit/core/engine/commands/workflow/issues.test.ts`. Open question for planning: how does the step-comment call (which passes `--issue` but no `--fid`) resolve its run today? The guard must reuse that same lookup, not add a second one.
2. **Rule wording:** extend `.agents/rules.md` § Tracker work comments to say these comments are posted as plain markdown through the tracker MCP and never through `bkit issues comment`, and must never start with a `bkit:generated` line. Add the `.bkit/instructions.md` entry first, then sync, per the shared-clause process.
3. **CLI doc:** in the `comment` row of `.bkit/cli.md`, add "workflow steps only; never for ad-hoc comments" so the doc says it before the refusal does.
4. **Host parity:** the rule reaches every host through the rendered mirrors. The engine guard covers Codex, OpenCode, Cursor and Antigravity equally, because they all call the same CLI.

## Already-posted comments

The affected visitfrasercoast-com comments stay hidden from workflow input until their first line is removed. Decision needed: fix those by hand once (about 20 comments, listed above), or ship a small `bkit issues` check that lists marked comments whose step heading matches no step of the workflow it claims to come from, so consumers can find and unmark their own.
