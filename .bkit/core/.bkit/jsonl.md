# JSONL Entry Format

{{BKIT_MANAGED_MARKER}}

> [!CAUTION]
> **Purpose:** How to format a new row for any bkit JSONL ledger (`docs/deferrals.jsonl`, `docs/failures.jsonl`, `docs/knowledge.jsonl`, `docs/decisions.jsonl`, `.bkit/issues.jsonl`, `.bkit/friction.jsonl`, `.bkit/stats.jsonl`). The codec is `.bkit/core/engine/ledgers/telemetry.ts`. Which `kind` goes to which ledger, and when each workflow writes it, is in `.bkit/workflows.md` § Telemetry Ledgers.
>
> **Rules:**
>
> - Follow `.bkit/authoring.md` § All Agent-Read Files and § Docs when you edit this file.
> - This file ships to every project that installs bkit. Describe the current setup only.
> - Leave out internal labels, such as tracker issue numbers, ledger keys and review-finding ids, and leave out project history. Decisions go in `docs/decisions.jsonl`, and incidents go in `docs/knowledge.jsonl`.
> - Write one row per line.
> - NEVER edit, reorder or delete a prior line. Change a row through a same-`key` append (§ Updating a Row). The only exceptions are the `bkit install` / `bkit upgrade` schema migration (§ Versioning), `bkit ledgers compact` (§ Compaction), and bkit's harvest (`pnpm harvest`, bkit repo only), which prunes a `.bkit/friction.jsonl` row or a `chat` / `run` row of `.bkit/stats.jsonl` only after the exact row is stored in `harvest/` and read back, and never prunes a malformed line (§ Friction Is a Drained Queue).
> - Before you append, read the file. Skip the append only if a row with the same identity exists and nothing has changed. A changed field makes the new row an update, not a duplicate.
> - Appends are best-effort: always exit 0. Never gate a workflow on telemetry success.

## Write Idiom

**Engine and workflow writers:** `bkit ledgers append --ledger=<decisions|deferrals|failures|knowledge|friction|stats> --rows=<file|->`. The rows are a JSON array without `schema` / `ts` / `bkit`.

- **Fills:** `schema: 3`, a minted `ts` per row, `repo` when absent, and `bkit.version` from `.bkit/version`. On `deferral` / `failure` / `knowledge` / `decision` rows, it also fills `firstTs` and `updates` from the entry's earlier rows (§ Compaction), replacing any supplied values.
- **Checks** every row before writing any: validation, and the author against § Ledgers & Writers. One refused row → exit 8, and nothing is written.
- **Refused:** a supplied `schema` / `ts` / `bkit`; a flat `bkitVersion` / `workflow` / `step` / `subagent` / `model`, since those live in `bkit` / `by`; a kind the ledger does not take; and a total that does not match its parts.
- `--ledger=stats` takes `compliance` / `counter` / `outcome` rows. `bkit workflows close` writes through it.
- A subagent with no shell hands its rows to the orchestrator as that JSON, with `by.subagent` and `by.model` already set.
- `bkit roadmap feature` writes `feature` rows, and fills `firstTs` and `updates` the same way. bkit's harvest script writes `chat` / `run` rows, into `harvest/stats.jsonl` only.

**Humans and scripts:** the `jq` idiom:

```bash
jq -c -n '{ schema: 3, ts: null, kind: "deferral", repo: $REPO, bkit: { version: $VER }, by: { step: $STEP }, … } | .ts = (now*1000|floor)' \
  >> "$FILE" || echo "[bkit-telemetry] append failed: $FILE"
```

- **`ts`:** Unix ms, always minted by `jq`'s `now` at append time: `jq '… | .ts = (now*1000|floor)'`. The `ts: null` placeholder only holds the field's place in the order, and the pipe overwrites it. Without the pipe, the row fails validation instead of landing a fake value. Never seed the placeholder with a number.
- **`ts` is never a literal.** Do not hand-type it, copy it from an example row or the line above, or take it from `date +%s%3N`, which does not work on BSD / macOS. A fabricated past `ts` looks the same as a real one, and it silently reorders the last-wins fold that every reader, the harvest and every age report depend on. Whole-second values (`ts % 1000 == 0`) fail the live-ledger gate, because a real mint is never round: `bkit ledgers append` moves such a value 1 ms on, and a `jq` append that lands on one is re-run.
- **`firstTs` / `updates`:** Omit them. The next compaction stamps them (§ Compaction).
- **Log prefix:** Every telemetry log line starts with `[bkit-telemetry]`, because log-drain greps match on it.

## Ledgers & Writers

Each `kind` goes to one file. Its writers:

<!-- prettier-ignore -->
| Kind | File | Written by |
| --- | --- | --- |
| `compliance` | `.bkit/stats.jsonl` | `bkit workflows close` of design / plan / build / debug / ship (its grader, one row per rule); utility orchestrator (a direct chat outside any workflow, the owner deciding in it) |
| `outcome` | `.bkit/stats.jsonl` | `bkit workflows close` of design / plan / build / debug / ship (one row per workflow run, keyed by `repo`+`by.workflow`+`run.parentSha`); re-appended by the close's CI dispatch (§ Per-Kind Fields); utility orchestrator (a direct chat outside any workflow, the owner deciding in it) |
| `counter` | `.bkit/stats.jsonl` | `bkit workflows close` of design / plan / build / debug / ship (attempt counters); utility orchestrator (a direct chat outside any workflow, the owner deciding in it) |
| `chat` | `harvest/stats.jsonl` (bkit repo only) | bkit's harvest script: per agent chat on the maintainer's machine, any repo or host |
| `run` | `harvest/stats.jsonl` (bkit repo only) | Same script: per workflow run in the run logs of every repo a chat ran in |
| `friction` | `.bkit/friction.jsonl` | orchestrator workflows (design / plan / build / debug / ship / auto) on observed friction; utility orchestrator (a direct chat outside any workflow that meets friction) |
| `deferral` | `docs/deferrals.jsonl` | `@bkit-design-generate`, `@bkit-plan-generate`, `@bkit-plan-update`, `@bkit-debug-abort-handover`, `@bkit-ship-deferred-sweep` (adjudication only), `@bkit-utility-update-deferrals` (close / triage / locator), build orchestrator (`LOW` challenge finding → `low-severity`, through `bkit challenge merge`), ship orchestrator (assumed accept nobody confirmed → `needs-decision`, through `bkit decisions pending --defer`), utility orchestrator (a direct chat outside any workflow, the owner deciding in it) |
| `failure` | `docs/failures.jsonl` | any agent on a discovered bug; `@bkit-debug-abort-handover`; `@bkit-audit-generate` (`MEDIUM`+ findings; rerun closes rows it no longer finds); `@bkit-utility-update-failures` (close / triage / locator) |
| `knowledge` | `docs/knowledge.jsonl` | `@bkit-build-plan-execute`, `@bkit-build-plan-gaps-remediate`, `@bkit-debug-failure-remediate` (after verified fix), `@bkit-utility-update-knowledge` (supersede / correct), utility orchestrator (a direct chat outside any workflow, the owner deciding in it) |
| `decision` | `docs/decisions.jsonl` | `@bkit-debug-failure-remediate` (forced arch), `@bkit-plan-generate`, `@bkit-plan-update` (decision changed by review), `@bkit-utility-update-decisions` (supersede / correct), build orchestrator (Decision Pause accept), design orchestrator (owner's answer to an open question after close), plan orchestrator (open question answered after close), ship orchestrator (assumed accept confirmed by the owner, through `bkit decisions apply --by=owner`), utility orchestrator (a direct chat outside any workflow, the owner deciding in it); orchestrators ONLY after explicit human approval |
| `feature` | `.bkit/issues.jsonl` | design / plan / build / debug orchestrators at their phase close; ship Step 6 into the worktree ledger (rides the PR); `ABANDONED` only by a human, or an agent on explicit human instruction |

**Writers are exhaustive:** Only the agents listed as writers for a kind may write that kind, with no exceptions. For the five `bkit ledgers append` kinds, this column is `KIND_WRITERS` in `.bkit/core/engine/ledgers/telemetry.ts`, the check that `append` runs. `telemetry.test.ts` fails when either side changes alone.

## Generic Fields (all kinds)

Every row opens with the same top section, in this order:

<!-- prettier-ignore -->
| Field | Type | Meaning |
| --- | --- | --- |
| `schema` | `3` | Row format. `2` = older `plan` block (§ Shared Blocks); row without it = older shape, read through `normalize()` (§ Versioning). |
| `ts` | `number` | Unix milliseconds — primary id. Minted at append, never a literal (§ Write Idiom). |
| `firstTs` | `number?` | `deferral` / `failure` / `knowledge` / `decision` / `feature` only: `ts` of the entry's first row, never later than `ts`. Filled by the writer and by compaction (§ Compaction). |
| `updates` | `number?` | Same kinds: rows the entry has had, this one included (integer >= 1). Same-`ts` rows count once. |
| `kind` | `string` | Closed enum: `compliance`, `outcome`, `counter`, `friction`, `deferral`, `failure`, `knowledge`, `decision`, `feature`, `chat`, `run`. |
| `key` | `string?` | Keyed kinds only (`friction` / `deferral` / `failure` / `knowledge` / `decision` / `feature` / `chat` / `run`). See § Key & References. |
| `repo` | `string` | Origin repo slug, e.g. `cbartens/bkit`; its fingerprint on `chat` / `run` rows (§ Per-Kind Fields). |
| `bkit` | `{version}` | `version` = bkit version that emitted the row (`null` on `chat` / `run` when none found). `chat` adds its bkit-use fields. |
| `by` | `{workflow?, step, subagent?, model?}` | Who wrote it — § Who Wrote It. `workflow`: `design` / `plan` / `build` / `debug` / `ship` / `auto` / `audit`; `utility` for a direct chat outside any workflow; `chat-stats` on `chat` (the harvest script's scan); the run's workflow on `run`. |
| `references` | `string[]?` | Pointers that place the row: feature ids, tracker ids, PRs, commit SHAs, paths, a sibling `ts`. See § Key & References. |

Values in every kind:

- **Absent vs `null`:** Absent = the field does not apply. `null` = it applies but could not be measured.
- **Units:** Durations are in minutes, with the unit in the name (`totalMinutes`, `activeMinutes`). Timestamps are unix ms.
- **Totals beside parts:** Fixed parts (`code` / `tests` / `docs`) have a `total` next to them. Open-ended parts have a `total` next to a `by<What>` map (`byStep`, `byModel`, `byAgent`, `byTool`, `byCategory`, `byVerb`). The writer computes every total from its parts just before the write. `validate()` refuses a row whose total does not match, with minute totals allowed within 0.1 per part.
- **Run join key:** `run.parentSha` = HEAD at the run's close. It is also on the run's `workflow-done` status row. Every `compliance` / `counter` / `outcome` row of one run carries it, and `chat` carries `run.parentShas`.

## Shared Blocks

These blocks have the same name and the same shape on `outcome` and `run`:

<!-- prettier-ignore -->
| Block | Shape |
| --- | --- |
| `time` | `{start, end, totalMinutes}` (`end` - `start`); `chat` / `run` add `activeMinutes`, `lastActivity`. |
| `lines` | `{total:{added,deleted,changed,files}, code, tests, docs, merges}`; each part `{added,deleted,files}`; `changed` = `added` + `deleted`. git `--numstat` from the run's first to last commit, first-parent, cut at merges (dev syncs out); `docs/plans/**`, `docs/*.jsonl`, `.bkit/*.jsonl` out. `null` = git lacks the commits or the first is not an ancestor of the last. |
| `steps` | `{total:{n,totalMinutes,activeMinutes?}, byStep:{<step>:{n,totalMinutes,activeMinutes?}}}`; minutes since the previous status row, `session` / `owner-pause` / `owner-answer` rows skipped (they mark a chat or an owner wait, not a step); time before the first step only in `time.totalMinutes`. `activeMinutes` on `run` only. |
| `ci` | `[{status,reason,attempts}]`, one per close-step CI dispatch (`status` e.g. `dispatched` / `unresolved`). |
| `plan` | `{source:"file"\|"converted", total:{tasks,kb}, groups:[{tasks:[{tests,testFiles}]}]}`. `converted` = the build rewrote its input into `{FID}-plan.md` (a `build-plan-convert` status row). `total.tasks` = the sum over `groups`; `tests` / `testFiles` `null` = task has no `TEST FIRST`. `schema: 2` rows hold `source:"file"\|"brief"` (`brief` = no plan file, carries only `source`), `subPlans:[{kb, tasks}]` in place of `groups` and `complexity:{verdict,tasksChecked,reasons?}` — read as stored; the `workflowTelemetry` baseline counts `brief` as `converted`. |
| `build` | `{verify:[{group,attempt,verdict,failures,testOrderGaps}], gapsRemediate:[{group,attempt,verdict,strategy}], holistic:{verdict,failures}\|null, challenge:{verdict, findings:{total,CRITICAL,HIGH,MEDIUM,LOW}\|null, gate?:{size,linesChanged,filesChanged,skipped}}\|null, redTests}`; `gate` = the run's latest `challenge-gate` status row (`bkit challenge gate`; `skipped` = challenge-1 left out on a small change), absent when the run has none; `findings` = plan tasks `bkit challenge merge` appended (by `**Severity:**`) plus its `LOW` deferral rows this run (`by.step` `build-challenge`); `redTests` = `build-task-red` step rows. |

## Per-Kind Fields

<!-- prettier-ignore -->
| Kind | Fields (beyond the top section) |
| --- | --- |
| `counter` | `run:{parentSha}`, `counter:{name, value:number, source:"model-self-report"\|"shell-bus"}`. |
| `outcome` | `run:{parentSha, pr?}` (`pr` ship-only), `time` (`null` = no start row), `ending:"done"\|"close-failed"` (`close-failed` = work done, its close's CI never started), `lines?\|null`, `steps?`, `ci?`, `ledgers:{deferrals:{repo,added?}, failures:{repo,added?}, friction:{added?}}` (`repo` = the repo's distinct folded entries at close, not lines; `added` = distinct keys this run added — rows of `by.workflow` at or after its start; absent when the start is unknown), `plan?` (plan / build / ship), `build?` (build), `context?:{host:"claude-code", byAgent:{<agent type>:{peak, runs}}}` (the run's subagents per agent type: `runs` = subagents with a model call in the run, `peak` = largest input + cache write + cache read tokens of one model call in the run; read at close from the subagent transcripts of the closing Claude Code chat and of every chat the run's `session` status rows name, each call counted when its own timestamp falls between the run's start and the close; absent on other hosts or with no data; `bkit stats` judges peaks against 160,000 tokens), `ship?:{coverage?:{unit?,integration?,e2e?}}` (each `{lines,branches,functions,statements}` %; a tier absent when its coverage report is not produced). The close's CI dispatch re-appends it: dispatch added to `ci`, `ending` `close-failed` when CI never started; newer row supersedes (§ Identity / Dedup). |
| `compliance` | `run:{parentSha}`, `rule:{id, verdict:"pass"\|"fail"\|"n/a", evidence?}` (`evidence` on fail rows). |
| `friction` | `key`, `category` (§ Categories), `scope:"bkit-repo"\|"consumer"\|"universal"`, `severity`, `summary?`, `description`, `remediation?`, `source?`, `status:"OPEN"\|"TRIAGED"\|"CLOSED"\|string?` (see § Updating a Row), `confidence?:number`, `lastConfirmed?:number`, `recurrenceCount?:number`. |
| `deferral` | `key`, `type:"issue"\|"feature"`, `category` (§ Categories), `severity`, `reason` (§ Deferral Reason), `summary?`, `description`, `remediation?`, `source?`, `status:"OPEN"\|"TRIAGED"\|"CLOSED"?`. |
| `failure` | `key`, `category?` (§ Categories; `"testing"` = flaky / intermittent test), `summary?`, `severity`, `description`, `rootCause?`, `remediation?`, `status:"OPEN"\|"TRIAGED"\|"CLOSED"\|string?`. |
| `knowledge` | `key`, `summary`, `description?`, `rootCause?`, `remediation?`, `status:"ACTIVE"\|"SUPERSEDED"?`. |
| `decision` | `key`, `summary`, `description?`, `rationale?`, `alternatives?`, `status:"ACTIVE"\|"SUPERSEDED"?`. |
| `chat` | `key` (`<platform>:<session id>`); `bkit` adds `versionSource:"repo-history"\|"prompt"\|"none"` (`prompt` = an expanded workflow command's managed marker), `via` (`command` / `subagent`; empty = no bkit; `command` only when the chat ran a `/bkit-*` command itself), `workflows`, `prompts` (bkit prompt families, audit and utility included), `cli:{total, byVerb}`; `session:{platform, id, hostVersion?, entrypoint?, prompts}` (`platform` `claude-code` / `codex` / `opencode` / `cursor` / `antigravity`; `prompts` = messages the human typed); `time:{start, end, totalMinutes, activeMinutes, spans, lastActivity}` (`ts` = `end`; `spans` = `[[startMs,endMs]]`, chat + subagents, split at gaps over 5 min; `activeMinutes` = their sum; `lastActivity` = last write to the chat's files); `issue:{id, all, mentioned, source:"command"\|"summary"\|"mention"\|"none"}` (fingerprints; named only in the host's summary of an earlier chat → `summary`); `run:{parentShas}` (printed by `bkit workflows close` — exact join to `run.parentSha`); `effort` (turns per level); `usage:{total:{turns, tokens, context:{start,peak}, compactions}, main:{turns, tokens, context:{peak}, compactions, mix}, byModel:{<model>:{turns, tokens}}, byRun:{<run key>:{main:{turns, tokens}, agents:{turns, tokens}}}\|null}` (`tokens` = `{input, cacheWrite, cacheRead, output, outputEst, read}`, `read` = the three sent types; `mix` = calls by kind `{read, edit, grep, shellRead, shellList, tests, serena}`; `byRun` = the chat's model calls per run it worked on — a run's `session` rows name the chat, or same repo, the run's issue in `issue.all` and overlapping time — each call to the run whose first-to-last status row window holds its time, the later-started run when two do; `{}` = no run, `null` = a call has no time, e.g. Cursor, Antigravity); `agents:{total:{n, errors}, byAgent:{<agent type>:{n, errors, instances:[{turns, contextPeak, contextAt10}], usage, mix, planReads:{full, partial}}}}` (`contextAt10` = context read by the instance's 10th model call, `null` under 10; `planReads` = reads of a `docs/plans/<YYYYMM>/<FID>-plan(-N).md` file, `partial` = a line range or `sed` / `head` / `tail`); `tools:{total:{calls, errors}, byTool:{<tool>:{calls, errors, byCategory?}}, filesRead}`; `scan:{files, bytes, settled, tokensRecorded}` (`settled` = unchanged for the settle window, `false` = open: counted and marked, not in medians; `tokensRecorded` false = host records none, e.g. Cursor). New same-`key` row when `scan.bytes` or `scan.settled` changes, or the stored row has no `usage.byRun`. `schema: 2` chat rows hold `ctx` / `ctxPeak`; readers rename them to `context` / `contextPeak`. `repo` and issues are fingerprints: `fp:` + 12 hex of sha256(`owner/repo` / `owner/repo#N`); no paths, branch names or prompt text. Field reference: the script's header. |
| `run` | `key` (`<fid>:<workflow>:<start>`); `run:{fid, issue, n, parentSha, parentShas}` (`fid` = fingerprint of `owner/repo:<FID>`; `issue` = fingerprint of the FID's leading number, else `null`; `n` = nth run of that workflow in the log; `parentSha` = its last `workflow-done` row's, else its last close step's, else `null` — exact join to the run's `outcome` / `counter` / `compliance`; `parentShas` = every commit its status rows name); `time:{start, end, totalMinutes, activeMinutes, activeFrom:{chats,bytes}, lastActivity}` (first / last status row; `activeMinutes` = run time inside the spans of counted chats naming its issue by command or summary, `null` = none yet; `lastActivity` = log's last row, after-end rows included); `ending:"done"\|"close-failed"\|"failed"\|"decision-pause"\|"stopped"` (last end row; `close-failed` = after `workflow-done` only the close failed: last close's CI dispatch `unresolved`, or a `workflow-failed` row with no close after it; no end row → `decision-pause` if its `build-decision-*.md` is `Status: OPEN`, else `stopped`); `ci`, `steps` (with `activeMinutes`), `lines` (build, debug), `plan` (a feature's last plan run), `build` (build; `testOrderGaps` `null` = round's report gone — an earlier build's counts only if written before the next build started) — § Shared Blocks; `owner:{waitBeforeMinutes, total:{stops, minutes}, stops:[{minutes, open, reason}]}` (owner waits from `owner-pause` → next `owner-answer` status rows, pauses before an answer joined into one stop; `open` = no answer yet, `minutes: null`; `reason` `decision` / `grill` / `draft`; `waitBeforeMinutes` = the same log's previous run's last row to this run's first, `null` for the first); `usage:{total, main, agents}\|null` (each `{turns, tokens}`; sum of the matched chats' `usage.byRun[key]`; `null` = no chat matched, or one has no `byRun`); `scan:{rows, afterEnd, settled}` (`afterEnd` = rows after the end row, e.g. a hand rewind; `settled` = last row older than the settle window). `ts` = scan time. New same-`key` row when `scan.rows`, `time.activeFrom`, `scan.settled`, `usage` or `owner` changes. No limits applied; no FID text, paths or branch names. |
| `feature` | `key` (the FID), `category` (§ Categories), `summary?`, `description`, `status:"DESIGNED"\|"PLANNED"\|"BUILT"\|"DEBUGGED"\|"SHIPPED"\|"ABANDONED"` (required — no severity; see `docs/roadmap.md`), `shippedAt:number?` (§ Ship Date). |

## Who Wrote It — `by.step` vs `by.subagent` vs `by.model`

<!-- prettier-ignore -->
| Row written by | `by.workflow` | `by.step` | `by.subagent` | `by.model` |
| --- | --- | --- | --- | --- |
| **The orchestrator** (a workflow itself) | `ship` | `ship-close-workflow` | (absent) | (absent) |
| **A subagent** it invoked | `build` | the step that invoked it, e.g. `build-plan-gaps-remediate` | `bkit-build-plan-gaps-remediate` | that prompt's own `model:` |
| **A direct chat** outside any workflow | `utility` | `manual` | (absent) | (absent) |

Subagent: set these on every row you append, from your prompt file:

- **`by.subagent`** = your frontmatter `name:`.
- **`by.model`** = your frontmatter `model:`.
- **`by.step`** = the invoking workflow step, named in your Context. Never an agent name.
- **`by.workflow`** = the invoking workflow.

Orchestrator: omit `by.subagent` and `by.model`.

## Key & References

`key` = a stable slug, written once. A recurrence is a same-`key` append.

- **Mint it from the content, never from a counter.** Use a descriptive slug (`gh-mcp-401-after-token-rotation`), optionally prefixed with the issue (`681-e2e-parallelism-via-runner-matrix`). Counter-derived ids collide under concurrency: two workflows read the same maximum off their base commit, mint the same id, and collide silently.
- **Cite the `key`.** It is the identity for other rows, docs and memory, and `ts` is the tiebreaker. Content slugs avoid counter collisions.

`references` = the pointers that place this row:

<!-- prettier-ignore -->
```jsonl
"references": ["681", "ISSUE-217", "PR-412", "a1b2c3d", "docs/plans/202607/681-e2e-parallelism-design.md", "gh-mcp-401-after-token-rotation"]
```

- A pointer is a feature id / `{FID}`, a tracker id (`ISSUE-217`), a PR, a commit SHA, a file path, or a row's `key` in the same or another ledger.
- Keep each item as the source wrote it. A trailing qualifier (`ISSUE-142 §A2`) is meaning, not noise.
- There is no separate identity field: `key` is the identity, and `references` holds pointers only.
- Omit the field when there is nothing to point at.
- Pointers between ledgers never need rewriting: a correction is a same-`key` append. When a correction affects rows in other ledgers that point at it, the ledger updater (`@bkit-utility-update-decisions`, `-knowledge`, `-deferrals`, `-failures`) reports those rows under `Cross-Ledger Impact`. Each row's own ledger writer appends any change.

## Friction Is a Drained Queue — the non-append-only rows

`.bkit/friction.jsonl` is a drained work queue. The `chat` / `run` rows in `.bkit/stats.jsonl` are drained too, because they belong in `harvest/`. No other row is ever removed, apart from the superseded keyed-ledger rows that `bkit ledgers compact` drops (§ Compaction):

<!-- prettier-ignore -->
| Actor | May do |
| --- | --- |
| **A consumer repo** | append only. |
| **bkit's harvest** (`pnpm harvest`, bkit repo only, unshipped) | moves rows out: copies each into bkit's `harvest/` store, then prunes it from the repo. |

A row that vanishes from `.bkit/friction.jsonl` was banked centrally by the harvest.

The prune gates, in order:

- **Durability first:** Prune a row only after the exact row is fsync'd to the store and read back.
- **Content, never identity:** Gate byte-for-byte on the row's `normalize()` shape. An old-shape row matches its migrated copy. `fold` collapses same-identity rows, so an identity gate deletes rows the store does not hold.
- **Malformed lines:** Never pruned.
- **Store accumulates:** The store keeps every distinct row, deduped by content only. It is never cleared, and never rewritten from `fold`, because the winners shift between runs. Readers fold it. `harvest` never commits, in either repo.

`stats.jsonl` is copied whole, and only its `chat` / `run` rows are pruned. `deferrals` / `failures` are count-only, from their top-section metadata. Their prose never leaves the repo.

## Summary vs Description

On the kinds with both (`friction` / `deferral` / `failure` / `knowledge` / `decision` / `feature`), `summary` = a short title and `description` = the prose. When the text is one sentence, write `description` only.

## Severity

`severity` is required on `friction` / `deferral` / `failure`, and must not appear on any other kind. `knowledge` / `decision` / `feature` have no triage severity: `feature` tracks its phase through `status`, not how badly something is broken. `compliance` / `outcome` / `counter` are machine-generated by `bkit workflows close`, or written by a direct chat (`by.workflow` `utility`). `severity` is a closed enum of exactly these four values, in uppercase:

<!-- prettier-ignore -->
| Value | Means |
| --- | --- |
| `CRITICAL` | Data loss, security hole, or a broken workflow with no workaround. Triage before the next release. |
| `HIGH` | Real damage or a blocked path, but a workaround exists. |
| `MEDIUM` | Degraded behaviour or a repeated cost; safe to schedule. |
| `LOW` | Cosmetic, nit, or a speculative future idea. |

- It is the same enum the challenge prompts assign. When a finding becomes a row (e.g. `bkit challenge merge` `LOW` → `docs/deferrals.jsonl`), carry its severity unchanged.
- It is not the `bkit install` preflight's `blocker` / `advisory`, which measure a different axis.
- Pick the level the row earns. A ledger where every row is `LOW` is as useless as one with no severity.

## Deferral Reason

`reason` is required on `deferral`, and absent on every other kind. It says why the work is deferred, which is distinct from `status` (how far) and `severity` (how much). It is a closed enum, in lowercase:

<!-- prettier-ignore -->
| Value | Means | Also required |
| --- | --- | --- |
| `scope-declared` | design / plan called it out of scope before work started. | `references` to that doc §. |
| `hard-blocked` | external blocker (credential, upstream fix, feature) blocks it now. | Name blocker in `description`. |
| `needs-decision` | human decision missing; guessing worse than waiting. | State decision + options. |
| `own-cycle` | plan-sized — new architecture, not a mechanical fix. | Say what makes it plan-sized. |
| `low-severity` | `LOW` challenge finding, written by `bkit challenge merge`. | Name the finding. |
| `unjustified` | adjudicator-only — in-scope work that should have been finished. | Which test it failed. |

- **If** one of the first four fits, or `low-severity` where it applies → it is a deferral.
- **Else** → it is unfinished work, so do it (`.agents/rules.md` § "Finish over deferrals").
- `unjustified` is never self-assigned. The writer picks from the first four. A reviewer adjudicating another agent's deferral sets it through a same-`key` append.
- It is set once and carried verbatim by every later row, because the rate it feeds counts the deferral that should not have been written.
- It is never free prose. A reason nobody can adjudicate reads as a justification while being none, and the closed enum prevents that.

**The four tests.** A reviewer marks a row `unjustified` when all four hold. The tests never apply to a `low-severity` row:

1. `remediation` names specific files and a bounded edit, not a new architecture.
2. The surface is inside files the cycle already touched.
3. There is no external blocker: no missing decision, credential, upstream fix or confirmation.
4. The row is `scope-declared` with no pre-existing declaration: the row is the only place the work was called out of scope.

Test 4 carries the weight. A genuine deferral was declared out of scope before the work started. An unjustified one was declared at the moment of avoidance. The ledger holds both timestamps.

## Ship Date

`shippedAt` is optional on `feature`, and absent on every other kind. It is the Unix ms when the feature shipped. `docs/roadmap.md` § Shipped ranks on `shippedAt // ts`.

- Set it only on `status:"SHIPPED"` rows, and only when the ship predates the append, as in a backfill. At a live phase close, omit it, because `ts` already is the ship time.
- It may be a literal, unlike `ts` (§ Write Idiom), because it is not row identity. Source it from the issue's `closed_at` or the merge-commit date.
- Never guess it. **If** there is no defensible source → omit it, and accept the `ts` ordering.

## Categories

Categories are free-form. Use the closest term, or `other` if none fits. `deferral` and `failure` use the domain set, and `friction` uses the friction set. Do not mix them.

**Domain — `deferral` + `failure`:**

<!-- prettier-ignore -->
| Term | Covers |
| --- | --- |
| `agentic` | agent / workflow / prompt / orchestration behaviour |
| `correctness` | logic / behaviour bugs in shipped code |
| `testing` | tests, coverage, flaky / intermittent tests (see note below) |
| `infra` | CI, build, packaging, distribution, deploy, environment |
| `tooling` | CLI, dev scripts, local tooling |
| `observability` | logging, telemetry, tracing, metrics |
| `security` | auth, secrets, input validation, data exposure |
| `architecture` | structural / design |
| `docs` | documentation |
| `other` | none of the above |

**Flaky / intermittent tests** = `failure` rows with `category:"testing"`. Their `key` = the spec path + the test title, minted once. Each re-observation is a same-`key` append (§ Updating a Row), so the flake count = the winner's `updates`. `firstTs` / `ts` = first seen / last seen. Do not add a pass-rate or counter field.

**Friction — `friction`:**

<!-- prettier-ignore -->
| Term | Covers |
| --- | --- |
| `human-confirm` | human confirmation prompt |
| `permission-prompt` | tool / permission approval prompt |
| `agent-rework` | agent redo / self-correction |
| `manual-install` | manual dependency / tool install |
| `tool-failure` | tool / command error |
| `destructive-backout` | reverted a destructive action |
| `other` | none of the above |

## Updating a Row

Fields that change after the first write:

<!-- prettier-ignore -->
| Field | Changes when |
| --- | --- |
| `status` | work closes (`OPEN` → `CLOSED`), or a decision or knowledge row is `SUPERSEDED`. |
| `reason` | `deferral` only: a reviewer adjudicates → `unjustified`, naming the failed test in `description` and setting `status` → `TRIAGED`. One-way: never rewritten, and carried verbatim by every later row. Fold is last-wins, so omitting it erases the verdict and its rate. Gated on the live ledger. |
| `remediation` | the fix is known — usually after the row was logged mid-workflow. |
| `severity` | re-triage says it was worse or milder than first thought. |
| `confidence` | `friction` only: the same thing recurs (raise) or is contradicted (lower). |
| `lastConfirmed` | `friction` only: re-observed. |
| `recurrenceCount` | `friction` only: it happens again. |

**Update by appending a new row with the same `key`, never by editing the old line.** `fold()` takes the last row by `ts`, and older rows are history. A recurrence is an update.

**Hard, not stylistic:** `.gitattributes` sets `merge=union` on every append-only ledger, so merges concatenate and never conflict. Union keeps both sides of a conflicting hunk. Edit a line, and the stale copy survives beside its replacement. `fold` takes the last row by `ts`, so the stale copy wins whenever its `ts` is later.

- NEVER edit, reorder or delete a prior line. Change a row through a same-`key` append (§ Updating a Row). The only exceptions are the `bkit install` / `bkit upgrade` schema migration (§ Versioning), `bkit ledgers compact` (§ Compaction), and bkit's harvest (`pnpm harvest`, bkit repo only), which prunes a `.bkit/friction.jsonl` row or a `chat` / `run` row of `.bkit/stats.jsonl` only after the exact row is stored in `harvest/` and read back, and never prunes a malformed line (§ Friction Is a Drained Queue).
- **Never hand-write `ts`, in either direction:** Mint it at write time (§ Write Idiom). A future value outranks every later correction permanently, so the row can never be superseded. A backdated value loses to the rows it actually followed, so the correction it was meant to be silently never applies.

`.bkit/friction.jsonl` is excluded, because rows are removed from it (§ Friction Is a Drained Queue) and union would resurrect a drained row.

To update a row, copy the prior row, change what changed, and append it. Through `bkit ledgers append`, drop `schema` / `ts` / `bkit` (`firstTs` / `updates` are recomputed), and set `by` to the writer of the new row. Carry `key` verbatim, because a reworded `key` forks the entry. Same `key` = one entry. `fold` returns the last row, so "how long open" / "time to fix" = its `ts` - `firstTs`.

**Triage** = sweeping `docs/deferrals.jsonl` / `docs/failures.jsonl` for work that has moved on, and appending a same-`key` row with `status: "CLOSED"`, the current `references` (PR, commit, closing issue) and a re-triaged `severity` where earned.

**`TRIAGED`** = the middle state of the triaged trio (`friction` / `deferral` / `failure`, the kinds with `severity`). The ladder: `OPEN` (raised, cause unknown) → `TRIAGED` (analysed, disposition known, not fixed) → `CLOSED` (fixed, refuted, or not ours). Append it the same way as a close, with the disposition in `references`: an issue, a mapped `Fix N`, or why it is not ours.

**`TRIAGED` is still open work.** Open-entry counts (the audit debt lens, the age report) test `status != "CLOSED"`. Only `CLOSED` is done.

The ladder is not used on `knowledge` or `decision`: both use `ACTIVE` / `SUPERSEDED`. An absent `status` = `ACTIVE`.

**Readers** of either ledger: Fold by `key`, with the highest `ts` winning. Read only the winning rows whose `status` is `ACTIVE` or absent, and never read any other rows.

Readers count entities, never lines, so `fold` first.

## Compaction

`bkit ledgers compact [--ledger=<knowledge|decisions|deferrals|failures|issues|all>] [--dry-run]` rewrites `docs/knowledge.jsonl`, `docs/decisions.jsonl`, `docs/deferrals.jsonl`, `docs/failures.jsonl`, `.bkit/issues.jsonl` to their fold winners:

- **Drops** each row that a same-identity row with a higher `ts` supersedes. With equal `ts`, the later line wins, as in `fold`. The winner stays on its line.
- **Stamps** each winner with `firstTs` (the earliest `firstTs` / `ts` across the entry) and `updates` (a stamped row counts as its `updates`, each later row adds 1, and same-`ts` rows count once). Stale values are corrected.
- **Keeps byte-for-byte:** malformed, non-object, blank and keyless lines; rows of other kinds; a winner already carrying the right values.
- **Reader-invisible:** `fold` returns the same winners, apart from `firstTs` / `updates`.
- **Idempotent:** A second run changes nothing. When `merge=union` brings dropped rows back, the next run drops them again, with the counts unchanged.
- **Writes** through a temp file and a rename, only when something changes. `--dry-run` only counts.
- **Runs** at the end of each ledger's updater, best-effort, on its own ledger: `@bkit-utility-update-knowledge` / `-decisions` / `-deferrals` / `-failures`, `@bkit-utility-update-roadmap` → `issues`. Never at append, and never at install / upgrade.
- No schema change: `firstTs` / `updates` are optional, and a row without them is a one-row entry.

## These Ledgers Are Inputs, Not a Diary

`docs/deferrals.jsonl` and `docs/failures.jsonl` are the backlog: deferred scope and known bugs. `severity` ranks them, and `firstTs` ages them (`ts` when absent). Read them:

- **Before designing or planning:** Grep for an existing entry or a past deferral reason.
- **On a triage sweep:** Walk the open entries against the tracker and the codebase. For each one, close it, mark it `TRIAGED` or re-set its `severity`, through an append (§ Updating a Row).
- **When a bug looks familiar:** A same-`key` `failure` is a recurrence.

Rank the existing entries `severity: CRITICAL` first, then by oldest `firstTs` (`ts` when absent).

## Identity / Dedup

Identity is a tuple, not a bare `ts`:

<!-- prettier-ignore -->
| Kind | Identity tuple |
| --- | --- |
| `compliance` | `(repo, by.workflow, run.parentSha, rule.id)` |
| `outcome` | `(repo, by.workflow, run.parentSha)` — `run.pr` / `ts` fallback on rows without `run.parentSha`; newest `ts` wins, so a re-appended outcome supersedes |
| `counter` | `(repo, by.workflow, run.parentSha, counter.name)` |
| `friction` \| `deferral` \| `failure` \| `knowledge` \| `decision` \| `feature` \| `chat` \| `run` | `(kind, repo, key)` |

An identity match means the same thing, not an automatic skip:

- **Nothing changed** → skip.
- **Something changed** → append (§ Updating a Row).

## `engine-action` rows

This is not a ledger but a row in a run's `status.jsonl` (`.bkit/workflows.md` § `status.jsonl`). An engine action unsafe to repeat — a tracker comment, a marker commit, a CI re-trigger, a PR open — appends one once it is done, and checks for it first, so a re-run of the same block does not act twice. Actions safe to repeat (a label already set) record nothing.

<!-- prettier-ignore -->
| Field | Value |
| --- | --- |
| `type` | `engine-action` |
| `action` | what was done: `comment`, `commit`, `dispatch`, `pr-open`, … |
| `key` | the moment: workflow, run, step, sub-plan, attempt, kind, joined by `/`; an absent part is `-` (`build/2/build-plan-verify/1/3/comment`) |
| `hash` | sha256 hex of the body or payload acted on |
| `ref` | what the action made (comment URL, commit SHA, run id); `null` when it names none |
| `at` | UTC, whole seconds |

- **Same `key`, same `hash`** → already done: skip, print `deduped: true`.
- **Same `key`, new `hash`** → a deliberate edit: act again, append another row.
- **Helpers:** `actionKey`, `actionHash`, `alreadyDone`, `recordAction` in `.bkit/core/engine/ledgers/status.ts`. The row has no `workflow`; the fold, `runStatusRows`, `counters rows` and the status-holes audit all read by `type`, so they skip it.

## Versioning

`schema: 3` = the row format, and `bkit.version` = the bkit that wrote it. `schema: 2` rows differ only in the `plan` block (§ Shared Blocks). They are read as stored and never rewritten.

- **Readers normalize every row:** `normalize()` in `.bkit/core/engine/ledgers/telemetry.ts` returns a `schema` row as is. It turns a row without one into the `schema: 2` shape: `bkitVersion` → `bkit.version`, `workflow` / `step` / `subagent` / `model` → `by.*` (`null` / empty dropped), any kind's `parentSha` → `run.parentSha`, flat run fields → their blocks, `chat` total tokens summed from its models, and fields with no place dropped. `merge=union` can bring an old-shape line back from a branch, so no reader assumes a migrated file. A reader comparing rows across ledgers compares them normalized.
- **No version gating:** Readers ingest every well-formed row and report counts per `bkit.version`. An unexpected version surfaces for triage.
- **Migration:** `bkit install` / `bkit upgrade` rewrite each ledger line without `schema` through `normalize()`, in place. The rewrite is idempotent: a `schema` line, a malformed line or a non-object line stays byte-for-byte. An old line whose rewrite the file already holds is dropped (`merge=union` of a branch from before the rewrite doubles every row). This migration is a sanctioned edit of a prior line (§ Updating a Row), beside § Compaction. `bkit check` counts each ledger still holding such a line as a pending write, which is drift: exit 1 until `bkit upgrade` runs. Ledgers carry no canonical hash, so appended rows are never drift.

## Examples

The rows are indented here for readability. On disk, each row is a single physical line (§ Write Idiom). There is one example per ledger. Each shows the kind's fields, with the optional ones included where they apply to its workflow (§ Per-Kind Fields). The `build` block appears in the `run` example.

`.bkit/stats.jsonl` (`compliance` / `outcome` / `counter`); `harvest/stats.jsonl` (`chat` / `run`):

<!-- prettier-ignore -->
```jsonl
{
  "schema": 3,
  "ts": 1718900000000,
  "kind": "compliance",
  "repo": "cbartens/bkit",
  "bkit": { "version": "5.6.0" },
  "by": { "workflow": "ship", "step": "ship-close-workflow" },
  "run": { "parentSha": "a1b2c3d" },
  "rule": { "id": "skip-ci-not-head", "verdict": "fail", "evidence": "HEAD a1b2c3d carries [skip ci]" }
}
{
  "schema": 3,
  "ts": 1718900000100,
  "kind": "outcome",
  "repo": "cbartens/bkit",
  "bkit": { "version": "5.6.0" },
  "by": { "workflow": "ship", "step": "ship-close-workflow" },
  "run": { "parentSha": "a1b2c3d", "pr": 412 },
  "time": { "start": 1718897600000, "end": 1718900000000, "totalMinutes": 40 },
  "ending": "done",
  "lines": { "total": { "added": 120, "deleted": 34, "changed": 154, "files": 7 }, "code": { "added": 80, "deleted": 20, "files": 4 }, "tests": { "added": 30, "deleted": 10, "files": 2 }, "docs": { "added": 10, "deleted": 4, "files": 1 }, "merges": 0 },
  "steps": { "total": { "n": 2, "totalMinutes": 32.5 }, "byStep": { "ship-deferred-sweep": { "n": 1, "totalMinutes": 12.5 }, "ship-merge": { "n": 1, "totalMinutes": 20 } } },
  "ci": [{ "status": "dispatched", "reason": null, "attempts": 1 }],
  "ledgers": { "deferrals": { "repo": 14, "added": 1 }, "failures": { "repo": 9, "added": 0 }, "friction": { "added": 1 } },
  "plan": { "source": "file", "total": { "tasks": 3, "kb": 48 }, "groups": [{ "tasks": [{ "tests": 2, "testFiles": 1 }, { "tests": 3, "testFiles": 2 }] }, { "tasks": [{ "tests": null, "testFiles": null }] }] },
  "ship": { "coverage": { "unit": { "lines": 87.4, "branches": 79.1, "functions": 90.2, "statements": 87.0 }, "integration": { "lines": 68.3 }, "e2e": { "lines": 41.5 } } }
}
{
  "schema": 3,
  "ts": 1718900000200,
  "kind": "counter",
  "repo": "cbartens/bkit",
  "bkit": { "version": "5.6.0" },
  "by": { "workflow": "build", "step": "build-close-workflow" },
  "run": { "parentSha": "a1b2c3d" },
  "counter": { "name": "BUILD_ATTEMPT", "value": 2, "source": "shell-bus" }
}
{
  "schema": 3,
  "ts": 1718903600000,
  "kind": "chat",
  "key": "claude-code:8f9f0a84-6f5a-503d-8484-d56d75424d11",
  "repo": "fp:9f86d081884c",
  "bkit": { "version": "5.6.0", "versionSource": "repo-history", "via": ["command", "subagent"], "workflows": ["build"], "prompts": ["build"], "cli": { "total": 10, "byVerb": { "steps finish": 6, "counters derive": 3, "workflows close": 1 } } },
  "by": { "workflow": "chat-stats", "step": "scan" },
  "session": { "platform": "claude-code", "id": "8f9f0a84-6f5a-503d-8484-d56d75424d11", "hostVersion": "2.1.299", "entrypoint": "sdk-cli", "prompts": 14 },
  "time": { "start": 1718900000000, "end": 1718903600000, "totalMinutes": 60, "activeMinutes": 47.5, "spans": [[1718900000000, 1718902400000], [1718903150000, 1718903600000]], "lastActivity": 1718903600000 },
  "issue": { "id": "fp:2c26b46b68ff", "all": ["fp:2c26b46b68ff"], "mentioned": [], "source": "command" },
  "run": { "parentShas": ["a1b2c3d4e5f60718293a4b5c6d7e8f9012345678"] },
  "effort": { "high": 118, "medium": 2 },
  "usage": {
    "total": { "turns": 120, "tokens": { "input": 900, "cacheWrite": 410000, "cacheRead": 9399100, "output": 52000, "outputEst": 48000, "read": 9810000 }, "context": { "start": 21000, "peak": 180000 }, "compactions": 1 },
    "main": { "turns": 60, "tokens": { "input": 400, "cacheWrite": 210000, "cacheRead": 4189600, "output": 31000, "outputEst": 27000, "read": 4400000 }, "context": { "peak": 180000 }, "compactions": 1, "mix": { "read": 4, "edit": 6, "grep": 12, "shellRead": 9, "shellList": 1, "tests": 5, "serena": 0 } },
    "byModel": { "claude-opus-5-5": { "turns": 120, "tokens": { "input": 900, "cacheWrite": 410000, "cacheRead": 9399100, "output": 52000, "outputEst": 48000, "read": 9810000 } } },
    "byRun": { "fp:5d41402abc4b:build:1718900000000": { "main": { "turns": 60, "tokens": { "input": 400, "cacheWrite": 210000, "cacheRead": 4189600, "output": 31000, "outputEst": 27000, "read": 4400000 } }, "agents": { "turns": 60, "tokens": { "input": 500, "cacheWrite": 200000, "cacheRead": 5209500, "output": 21000, "outputEst": 21000, "read": 5410000 } } } }
  },
  "agents": { "total": { "n": 1, "errors": 2 }, "byAgent": { "bkit-build-plan-execute": { "n": 1, "errors": 2, "instances": [{ "turns": 60, "contextPeak": 150000, "contextAt10": 64000 }], "usage": { "turns": 60, "tokens": { "input": 500, "cacheWrite": 200000, "cacheRead": 5209500, "output": 21000, "outputEst": 21000, "read": 5410000 }, "context": { "peak": 150000 }, "compactions": 0 }, "mix": { "read": 7, "edit": 19, "grep": 20, "shellRead": 11, "shellList": 0, "tests": 8, "serena": 0 }, "planReads": { "full": 1, "partial": 4 } } } },
  "tools": { "total": { "calls": 100, "errors": 3 }, "byTool": { "Bash": { "calls": 80, "errors": 3, "byCategory": { "git": 30, "grep / rg": 25, "test runner": 15, "bkit cli": 10 } }, "Read": { "calls": 20, "errors": 0 } }, "filesRead": 14 },
  "scan": { "files": 5, "bytes": 4812345, "settled": true, "tokensRecorded": true }
}
{
  "schema": 3,
  "ts": 1718910000000,
  "kind": "run",
  "key": "fp:4e07408562be:build:1718900000000",
  "repo": "fp:9f86d081884c",
  "bkit": { "version": "5.6.0" },
  "by": { "workflow": "build", "step": "scan" },
  "run": { "fid": "fp:4e07408562be", "issue": "fp:2c26b46b68ff", "n": 1, "parentSha": "a1b2c3d4e5f60718293a4b5c6d7e8f9012345678", "parentShas": ["a1b2c3d4e5f60718293a4b5c6d7e8f9012345678"] },
  "time": { "start": 1718900000000, "end": 1718910000000, "totalMinutes": 166.7, "activeMinutes": 98.4, "activeFrom": { "chats": 1, "bytes": 4812345 }, "lastActivity": 1718910000000 },
  "ending": "done",
  "ci": [{ "status": "dispatched", "reason": null, "attempts": 1 }],
  "steps": { "total": { "n": 6, "totalMinutes": 63.7, "activeMinutes": 45.2 }, "byStep": { "build-plan-execute": { "n": 1, "totalMinutes": 41.2, "activeMinutes": 30.1 }, "build-plan-verify": { "n": 2, "totalMinutes": 18.5, "activeMinutes": 12 }, "build-task-red": { "n": 3, "totalMinutes": 4, "activeMinutes": 3.1 } } },
  "lines": { "total": { "added": 1172, "deleted": 120, "changed": 1292, "files": 23 }, "code": { "added": 200, "deleted": 2, "files": 4 }, "tests": { "added": 938, "deleted": 104, "files": 14 }, "docs": { "added": 34, "deleted": 14, "files": 5 }, "merges": 1 },
  "build": { "verify": [{ "group": 1, "attempt": 1, "verdict": "FAIL", "failures": 2, "testOrderGaps": 0 }, { "group": 1, "attempt": 2, "verdict": "PASS", "failures": 0, "testOrderGaps": 0 }], "gapsRemediate": [{ "group": 1, "attempt": 1, "verdict": "PASS", "strategy": "STANDARD" }], "holistic": null, "challenge": { "verdict": "CONCERNS", "findings": { "total": 5, "CRITICAL": 0, "HIGH": 0, "MEDIUM": 2, "LOW": 3 } }, "redTests": 3 },
  "scan": { "rows": 31, "afterEnd": 0, "settled": true }
}
```

`.bkit/friction.jsonl`:

<!-- prettier-ignore -->
```jsonl
{
  "schema": 3,
  "ts": 1718900000300,
  "kind": "friction",
  "key": "ship-dev-commit-blocked-by-pre-commit-hook",
  "repo": "cbartens/bkit",
  "bkit": { "version": "5.6.0" },
  "by": { "workflow": "ship", "step": "ship-bookkeeping-push" },
  "category": "tool-failure",
  "scope": "bkit-repo",
  "severity": "HIGH",
  "summary": "ship bookkeeping commit on dev blocked by the pre-commit hook",
  "description": "the ship bookkeeping commit runs on dev, but the pre-commit hook refuses dev/main commits unless $PWD matches *.worktrees/*; git -C REPO_ROOT commit does not pass the guard and --no-verify is prohibited",
  "remediation": "commit via a temp branch (docs/ship-{FID}) from dev in a temp worktree, then FF-merge dev",
  "source": "orchestrator",
  "status": "OPEN",
  "confidence": 0.9,
  "lastConfirmed": 1721578400000,
  "recurrenceCount": 2,
  "references": ["342", "docs/plans/202607/342-injection-hardening-plan.md"]
}
```

`docs/deferrals.jsonl`:

<!-- prettier-ignore -->
```jsonl
{
  "schema": 3,
  "ts": 1718900000400,
  "kind": "deferral",
  "key": "pnpm-tag-drop-readme-note",
  "repo": "cbartens/bkit",
  "bkit": { "version": "5.6.0" },
  "by": { "workflow": "design", "step": "design-generate", "subagent": "bkit-design-generate", "model": "claude-opus-5-5" },
  "type": "issue",
  "category": "infra",
  "severity": "LOW",
  "reason": "scope-declared",
  "summary": "pnpm tag-drop README note for the install snippet",
  "description": "pnpm normaliser strips the #vX.Y.Z pin from github:cbartens/bkit git-dep entries in package.json; document the workaround in README or fix upstream",
  "remediation": "note the pin workaround in the README install snippet",
  "source": "phase",
  "status": "OPEN",
  "references": ["ISSUE-131", "ISSUE-130", "README.md", "docs/plans/202607/131-install-snippet-design.md § Non-goals"]
}
```

`docs/failures.jsonl`:

<!-- prettier-ignore -->
```jsonl
{
  "schema": 3,
  "ts": 1718900000500,
  "kind": "failure",
  "key": "hook-git-dir-leaks-into-temp-repo-tests",
  "repo": "cbartens/bkit",
  "bkit": { "version": "5.6.0" },
  "by": { "workflow": "debug", "step": "debug-failure-diagnose", "subagent": "bkit-debug-failure-diagnose", "model": "claude-opus-5-5" },
  "category": "tooling",
  "summary": "Tests run from a git hook act on the real repo",
  "severity": "HIGH",
  "description": "after a pre-push run, git config core.bare=true on the main checkout, which breaks git checkout/status",
  "rootCause": "git exports GIT_DIR to hooks; a test running `git init --bare` with no path in its temp folder re-initialises the real repo as bare",
  "remediation": "delete every GIT_* variable in the test setup before any test spawns git",
  "status": "OPEN",
  "references": ["176", "a1b2c3d", "vitest.setup.ts"]
}
```

`docs/knowledge.jsonl`:

<!-- prettier-ignore -->
```jsonl
{
  "schema": 3,
  "ts": 1718900000600,
  "kind": "knowledge",
  "key": "gh-mcp-401-after-token-rotation",
  "repo": "cbartens/bkit",
  "bkit": { "version": "5.6.0" },
  "by": { "workflow": "debug", "step": "debug-failure-remediate", "subagent": "bkit-debug-failure-remediate", "model": "claude-sonnet-5-5" },
  "summary": "GitHub MCP / gh 401 immediately after a token rotation",
  "description": "401 from the GitHub MCP server or gh despite a freshly-rotated, valid, correctly-scoped PAT in .bkit/.env",
  "rootCause": "the MCP server captures GH_MCP_TOKEN at process launch, so a mid-session rotation leaves it holding the dead token",
  "remediation": "restart/reload the MCP server after rotating; for a one-off CLI, prefix `direnv exec . gh …`",
  "status": "ACTIVE",
  "references": ["ISSUE-137", ".bkit/.env"]
}
```

`docs/decisions.jsonl`:

<!-- prettier-ignore -->
```jsonl
{
  "schema": 3,
  "ts": 1718900000700,
  "kind": "decision",
  "key": "bkit-distribution-via-npmjs",
  "repo": "cbartens/bkit",
  "bkit": { "version": "5.6.0" },
  "by": { "workflow": "plan", "step": "plan-generate", "subagent": "bkit-plan-generate", "model": "claude-opus-5-5" },
  "summary": "publish @cbartens/bkit publicly on npmjs",
  "description": "publish @cbartens/bkit publicly on npmjs; consumers install with no registry mapping, PAT, or CI/Vercel env",
  "rationale": "public install needs no registry mapping or token; release.yml publishes from CI via npm OIDC trusted publishing",
  "alternatives": "private registry with a read token, git-dependency install, Releases tarball, vendor per-consumer",
  "status": "ACTIVE",
  "references": ["ISSUE-138", "ISSUE-130", "package.json", ".github/workflows/release.yml"]
}
```

`.bkit/issues.jsonl`:

<!-- prettier-ignore -->
```jsonl
{
  "schema": 3,
  "ts": 1718900000800,
  "kind": "feature",
  "key": "412-export-csv",
  "repo": "cbartens/bkit",
  "bkit": { "version": "5.6.0" },
  "by": { "workflow": "build", "step": "build-close-workflow" },
  "category": "correctness",
  "summary": "CSV export for the reporting page",
  "description": "adds a bounded CSV export button to the reporting page, streamed server-side",
  "status": "BUILT",
  "references": ["412", "docs/plans/202607/412-export-csv-plan.md"]
}
```
