# Design Brainstorm & Ideas

Lens: Risk premortem — failure modes, scale, time, handover.

> Framing note. The owner has already fixed several forks (roadmap lives at `docs/roadmap.md` as a file; two-tier update = cheap mechanical status per close + opus analysis on ship-close/on-demand; reuse `plan-complexity-check` + `design→organise` grouping; treat as the #260 sensing primitive). So the _remaining_ architectural fork is not "what" but **"how does a single shared `docs/roadmap.md` survive being written by five workflows that squash-merge to `dev` with `-X ours`, concurrently, across three IDE providers, without resurrecting the Defect-A conflict class or drifting."** All three approaches below differ on exactly that seam. Everything else (agent prose contract, ledger cadence, model/IDE-agnosticism) rides on top and is largely shared.
>
> Load-bearing facts this brainstorm is built on:
>
> - `status.jsonl` never conflicts because it is **FID-namespaced** (`docs/plans/{YYYYMM}/logs/{FID}/`). `docs/roadmap.md` is a **single repo-global file with one row per issue** — the opposite of namespaced. Every workflow touching it is a potential three-way conflict on the same lines (#209's Defect A, verbatim).
> - Each phase Close does `git merge --squash -X ours "feat/{FID}"` — **dev always wins on conflict**. A feat-side roadmap edit that collides silently loses to dev. Non-halting, but also non-applied — a _silent_ drop, the worst failure shape for a "source of truth."
> - The Close **STRAY-file guard** allowlists only `^docs/plans/|^docs/(deferrals|decisions|failures)\.jsonl$|^\.bkit/friction\.jsonl$`. `docs/roadmap.md` is **not** on it → any roadmap write aborts the close until the regex is widened. This is a required, easy-to-forget edit in all five workflows × three providers.
> - The natural opus home already exists: `bkit-ship-update-docs` is an opus-4-8 subagent that already reads `.agents/docs.md`, runs `git log origin/dev..HEAD`, and greps `docs/deferrals.jsonl`. The analysis tier is a _composition_ target, not a greenfield agent.
> - `docs/roadmap.md` must be **consumer-owned** (peer of `deferrals.jsonl`), NOT a shipped managed-block template — else `bkit install` overwrites every consumer's roadmap and `bkit check` drift never goes clean.

## Approach A — Roadmap as a deterministically-regenerable derived view (regenerate-on-conflict) ⭐ Recommended

**Summary.** Make the mechanical status board a _pure projection_ of tracker labels + folded `status.jsonl` produced by a deterministic shell/jq generator (a sibling of `bkit-status-fold.sh`), so a merge conflict on `docs/roadmap.md` is a non-event — take either side, re-run the generator, done — and every workflow can safely write it; the opus "best next step + prompt suggestions" prose lives in a _separate managed-marker block_ that only ship-close and `/bkit-roadmap` rewrite, so mechanical writers physically cannot clobber the analysis and vice-versa.

**Premortems.**

- **10x scale (200+ open issues, 30-issue milestones).** The mechanical board is O(issues) jq over already-local label data — fine. The failure hotspot is the _opus analysis pass_: "read whole roadmap + all tracker issues" is a fan-out that grows linearly with tracker size and blows the subagent `maxTurns`/context budget (the exact `maxTurns`-exhaustion class already logged for release agents). Blast radius: a single ship silently produces a truncated "best next step" that looks authoritative. Observability: emit a `roadmap-analysis` record to `.bkit/stats.jsonl` with `issuesScanned` / `truncated:true` so a shrinking coverage ratio is visible. Recovery: bound the scan to _open + milestone-scoped_ issues, page it, and stamp the rendered section with `scanned N of M issues`.
- **6 months later.** Drift risk is concentrated in the **generator's projection rules** (which label → which column, how a `bkit:debug`+`bkit:build` combo renders). If those live only in the shell script as magic greps, a future contributor "fixes" a row by hand-editing `roadmap.md` and the next regenerate silently reverts it — the classic derived-view betrayal. Mitigation: put a loud `<!-- generated: do not edit above the marker; edit tracker labels instead -->` banner in the mechanical block and document the projection table in `docs/architecture.md`. Undocumented invariant to pin now: _the mechanical block is write-only-by-machine; humans edit the tracker, not the file._
- **On-call at 3am.** Page shape: a `bkit-ship` close aborts with "close-workflow staged non-doc files: docs/roadmap.md" (STRAY guard not widened) or a dev-push conflict. Diagnosability: high — the guard message names the file. Recovery path: because the board is regenerable, the safe recovery is _always_ "re-run the generator on dev and commit," never hand-reconstruct. Document that one-liner in the runbook. The dangerous 3am failure is the _silent_ one — `-X ours` ate a roadmap edit and no page fired; the regenerate-on-conflict design is what removes it (there is nothing to lose because the file is reproducible from source).
- **Author leaves.** Bus-factor lives in the projection generator + the two-block file contract. Both are small, deterministic, and testable (bats, like `bkit-status-fold`), so knowledge is _in tests_, not in the author's head. The opus prose contract is a normal subagent prompt — same maintenance surface as the other 45. Lowest tribal-knowledge load of the three.

**Risk-mitigation guidance (layer onto whichever approach wins).**

- Ship the mechanical block behind explicit `<!-- bkit:roadmap-status start/end -->` markers and the prose behind `<!-- bkit:roadmap-analysis start/end -->`; writers touch only their own block. This physically prevents the two tiers from racing each other even inside one file.
- Widen the Close STRAY-guard allowlist to include `^docs/roadmap\.md$` in **all five** workflows and regenerate all three provider mirrors in the _same_ change — add a bats/integration assertion that greps every `.bkit/workflows/*.md` for the widened regex so a missed workflow fails CI, not a consumer's close.
- Keep `docs/roadmap.md` strictly under `Project Documents` / consumer-owned; add one row to `.agents/docs.md`'s Project table, never the bkit-managed block.
- Bound the analysis scan (open + milestone-scoped, paged) and stamp coverage; reserve report budget in the subagent prompt to dodge `maxTurns` exhaustion.
- Model/IDE-agnosticism: the prompt must reference the _model-selection doctrine generically_ ("opus writes specs, sonnet subagents execute" as a role rule) and read IDE target from install config — never hardcode a model ID or IDE name (they come from live endpoints; stored strings rot).

## Approach B — Single-writer roadmap (ship-close + `/bkit-roadmap` only), phase status read live from tracker

**Summary.** Sidestep the concurrent-shared-file hazard entirely by making **exactly one writer** — the ship-close analysis pass (composed into `bkit-ship-update-docs`) plus the on-demand utility — the only things that ever touch `docs/roadmap.md`; the four non-ship workflows write _nothing_ to the file, and any agent wanting live phase status reads the tracker labels directly (which they already do), accepting that roadmap.md's status rows are a _last-ship snapshot_, refreshed each ship rather than each close.

**Premortems.**

- **10x scale.** Same opus-scan hotspot as A, but _only at ship_, so the expensive pass fires less often — strictly cheaper. The scale cost moves to **staleness**: with 30 in-flight issues and infrequent ships, roadmap.md's phase column can be many transitions behind reality. Blast radius: an agent (or human) that trusts roadmap.md instead of the tracker acts on stale phase data. Observability: stamp `as of ship {FID} @ {ts}` prominently. Recovery: `/bkit-roadmap` on demand.
- **6 months later.** _Fewer_ moving parts to drift — no per-workflow hook, no generator, one prompt. This is B's real strength: minimal shipped surface, so minimal drift. The undocumented-invariant risk is the opposite of A's: someone reads the owner's Comment 2 ("other agents can see status in roadmap.md") literally, notices the status is stale between ships, and "fixes" it by adding the per-workflow writes B deliberately omitted — reintroducing the exact conflict class B was designed to avoid. Pin the rationale in `decisions.jsonl`: _roadmap.md status is a ship-snapshot by design; live status = tracker labels._
- **On-call at 3am.** Smallest page surface of the three — only ship touches the file, so only ship can fail on it, and ship already has the richest failure path (handover subagent, abort routing). Diagnosability and recovery inherit ship's mature machinery. The 3am risk is a _judgment_ failure, not a _mechanical_ one: an autonomous consumer downstream trusts a stale "best next step." Mitigate by making staleness loud in the rendered header.
- **Author leaves.** Lowest bus factor — one prompt folded into an agent that already exists. Almost nothing net-new to hand over.

**Risk-mitigation guidance.**

- Because status is ship-snapshotted, make the staleness _un-missable_: render the file header as `Status as of last ship ({FID}, {ts}) — for live phase, read tracker labels` so no reader mistakes it for real-time.
- Still widen the STRAY guard, but only in `bkit-ship.md` — one workflow, one provider-mirror sweep, far less blast radius than A/C's five.
- Reconsider B if the owner's "other agents see status between ships" requirement proves load-bearing in practice — B trades that requirement for radical simplicity. Fold the decision explicitly into the design's Decisions table so v2 can revisit.
- This is the strongest _v1_ if the goal is "ship the analysis value fast with least risk," deferring the mechanical-per-close board to v2 once the conflict-handling design (Approach A's generator) is proven.

## Approach C — Append-only `roadmap.jsonl` event log + rendered `docs/roadmap.md` mirror

**Summary.** Mirror the primitives bkit already trusts: each workflow appends a phase-transition _event_ to a repo-global append-only `roadmap.jsonl` under `merge=union` (so it _never_ conflicts, exactly like `status.jsonl`/telemetry), and `docs/roadmap.md` becomes a **rendered mirror** regenerated from that log (mechanical board) plus the ship-time opus analysis block — making #380 a drop-in producer for #260's journal-as-event-log context-exhaustion strategy.

**Premortems.**

- **10x scale.** The append-only log scales trivially (union-merge, no conflict, O(1) writes). The hotspot moves to the **render/fold**: reconstructing current phase per issue means folding the whole event log every render, which grows unbounded over the repo's lifetime (every transition ever, forever). Blast radius: slow renders, eventually a fold that dwarfs the useful state. Observability: log render duration + event count to stats.jsonl. Recovery: periodic compaction (snapshot + truncate), which is _itself_ new machinery to build and test — the scale fix is not free.
- **6 months later.** The subtle drift: the owner said **"must be docs/roadmap.md."** In C, roadmap.md is a _derived mirror_, and `roadmap.jsonl` is the real source of truth. Six months on, a contributor edits roadmap.md directly (it's the file everyone knows), the render clobbers it, and there's a "who moved my roadmap" incident — plus a latent conflict between the owner's stated artifact and the actual source-of-truth. This must be surfaced and confirmed at design time, not discovered later. Also: two new artifacts (`roadmap.jsonl` + render script + `.gitattributes` union-merge scope + compaction) = the largest new-invariant surface of the three.
- **On-call at 3am.** Best-in-class for the _write_ path — union-merge means roadmap writes never block a close, removing the STRAY/`-X ours` failure mode almost entirely (the log is append-only and namespaced-safe). But the _render_ path is new code that can fail (bad event, fold bug, compaction race), and a broken render means roadmap.md silently stops updating while writes keep succeeding — a failure that _hides_ because the log looks healthy. Needs a render-freshness check (last-event-ts vs last-render-ts) to page on divergence.
- **Author leaves.** Highest bus factor: event schema + fold reducer + render + compaction + union-merge scoping is the most machinery to understand. Mitigated by the fact that it _rhymes_ with `status.jsonl` (same team already maintains that fold), so it's not _unfamiliar_ machinery — but it is the most of it.

**Risk-mitigation guidance.**

- If chosen, reuse `status.jsonl`'s exact idioms wholesale — event envelope, `merge=union` scoped to the _specific path_ (never blanket `*.jsonl`; the #209 lesson), TS-as-source-of-truth fold mirrored as inline jq — so it's the _same_ pattern, not a second dialect.
- Resolve the "must be docs/roadmap.md" tension explicitly: either (a) reframe roadmap.md as the confirmed rendered artifact with roadmap.jsonl as an internal implementation detail, or (b) reject C. Do not ship the ambiguity.
- Build compaction _before_ it's needed, or cap the log to open-issue events only (closed issues' history lives in `completed.md` already) so the fold stays bounded.
- C is the right substrate **only if** #260 is being built imminently and wants the journal now; for standalone #380 it over-builds. Prefer A unless the #260 timeline pulls this in.

## Decisions

<!-- prettier-ignore -->
| Decided | Alternatives | Why |
| --- | --- | --- |
| Recommend **A** (regenerable derived view + two-block file) | B (single-writer), C (event-log + mirror) | A is the only one that satisfies the owner's _full_ two-tier requirement (live per-close status **and** ship-time analysis) while making the shared-file conflict class a non-event — the central risk. B under-delivers the between-ships status; C over-builds and contests the "must be docs/roadmap.md" fact. |
| Mechanical tier = **deterministic generator**, not LLM | LLM writes status rows each close | Status is a pure projection of tracker labels + `status.jsonl`; an LLM here adds cost, nondeterminism, and hallucination risk for zero benefit. Determinism is what makes regenerate-on-conflict safe. |
| Analysis tier = **compose into `bkit-ship-update-docs`** (+ `/bkit-roadmap` utility sharing the prompt) | New standalone close-step subagent in all 5 workflows | `update-docs` is already an opus pass reading `.agents/docs.md` + `git log` + `deferrals.jsonl` at ship-close — the exact inputs. Composition avoids a 5-workflow × 3-provider new-step edit (rules: improve over duplicate; owner's #260 "reinventing the wheel" pain). |
| Two **managed-marker blocks** in one file (status vs analysis) | Single free-form file; two separate files | Physically prevents the mechanical and analysis writers from clobbering each other; keeps the owner's single `docs/roadmap.md` artifact intact. |
| `docs/roadmap.md` = **consumer-owned generated artifact** | Shipped managed-block template | A shipped template would have `bkit install` overwrite every consumer's roadmap and never let `bkit check` drift go clean. Peer of `deferrals.jsonl`. |
| Treat mechanical generator as **the #260 sensing primitive** | Build #380 standalone, rebuild sense in #260 | #260's tick step 1 ("Sense → reconstruct the frontier") _is_ this projection. Build the deterministic sense once; #260 consumes it. |
| Ledger/audit cadence = **explicit counter threshold**, not "every now and then" | Prose "periodically"; every-ship | Reuse the existing `stats.jsonl` counter bus (`counter_next`) to fire deferrals/failures review + #80 audit injection every N ship-closes / on a staleness-day threshold — a concrete, testable trigger, no new clock. |
| Model/IDE recommendations = **doctrine-reference + read-from-config**, never hardcoded | Bake current model IDs / IDE names into the prompt | Model IDs come from live endpoints and IDE targets from install config; hardcoding ships instant rot (the `cursor`/`zen`/`ollama` live-endpoint lessons). |

## Cross-Approach Risks

- **STRAY-guard + `-X ours` is a landmine for every approach that writes roadmap.md on a non-ship close.** Any per-close write needs the Close allowlist widened _and_ a conflict-safe merge story; miss either and closes abort or edits silently vanish. Surface as a first-class task with a CI assertion, not a build-time footnote.
- **Cross-provider mirror regen.** Any new/edited workflow step or agent = regenerate claude/cursor/opencode mirrors in the same change; the render-output mirrors are force-overwritten and not drift-gated, so a stale mirror ships silently. Batch the regen at session end, and dogfood `install` **and** `upgrade` live.
- **`maxTurns` / context exhaustion on the analysis pass** applies to A, B, and C alike (all three run one opus "read roadmap + tracker" pass). Bound the scan, page it, stamp coverage, reserve report budget — otherwise a truncated "best next step" ships looking authoritative.
- **Stack-independence.** The agent may read "tracker issues" generically but must bake in no stack/vendor and cite no BAR-/KN-/Linear refs in any consumer-facing roadmap text (shipped-surface rule). The prompt-suggestion content ("use bkit optimally / when NOT to use bkit") must reuse `plan-complexity-check` heuristics generically.
- **Concurrency.** roadmap.md is repo-global; the no-concurrent-workflows-per-clone constraint already forbids two workflows on one clone, but roadmap.md makes the _cost_ of violating it higher (two writers on one shared file vs FID-namespaced status). Note it; don't design for parallel writes in v1.
- **"Prompt suggestions maximise subagents" is a doctrine the roadmap must itself model, not just describe.** The safe read: the roadmap agent _emits_ recommendations in the "opus-plans / sonnet-executes" shape by referencing bkit's own phase decomposition — it must not invent a parallel orchestration vocabulary that drifts from `bkit-auto`/#260.
- **The #260 relationship is a decision, not a default.** If the design declines to make #380 the sensing substrate, it must say so explicitly and justify the duplication — otherwise two roadmap-sensing engines get built (the exact anti-pattern the owner flagged on #260).
