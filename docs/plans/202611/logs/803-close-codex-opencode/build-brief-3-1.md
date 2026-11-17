# Brief: group 3 — Codex private-key shell reads (`deferrals-3`)

Plan: Close the Codex and OpenCode Guard Gaps Implementation Plan

## Why and what

### Context & Goals

Issue #803 is planned from the owner-approved scope revision of 2026-11-03. The 2026-11-10 comment confirms that revision is the spec, the old design doc is removed, and the design-run logs are evidence only. There is no design doc, so no `Suggested Workstreams` apply. The plan also covers the three audit findings the issue names from `docs/audits/202611/deferrals.md`: `deferrals-1`, `deferrals-3` and `deferrals-11`. The rest of that audit is context only.

**What is wrong today (read at `HEAD` of `feat/803-close-codex-opencode`):**

<!-- prettier-ignore -->
| Gap | Where | Finding |
| --- | --- | --- |
| Install writes `curl *{base}*` / `wget *{base}*` = `allow` into OpenCode's `permission.bash`. OpenCode globs match the whole string with `*` crossing `/` `?` `@`, so `curl https://evil.example/?x=github.com` is allowed. | `injectOpencodeDerivedAllows` in `.bkit/core/engine/install/modules/opencode.ts:348-369` | `deferrals-1` |
| The same generator writes `*{base}*` = `allow` into `permission.webfetch`, which has the same substring assumption. This is the "related generated URL permission" the revision asks to review. Claude's `WebFetch(domain:…)` grants and the Cursor, Codex and Antigravity hooks match the host, so they do not share the flaw. The `*{base}*` shape is an ACTIVE accepted-risk decision, `551-opencode-unanchored-host-allows-accepted-risk` (`docs/decisions.jsonl:199`): the maintainer kept it for apex + subdomain parity with Claude and rejected `https://{host}/*` because "every subdomain fetch prompts". The owner reviewed this shape at plan review and kept it as an accepted risk (answer to Open Question 4: "Keep *host* (551 stands)"). That review meets the success criterion's review of related generated URL permissions, so this plan leaves the `webfetch` allows as they are. | `.bkit/core/engine/install/modules/opencode.ts:363-368`; `.bkit/core/.bkit/providers.md:510`; `docs/decisions.jsonl:199` | `deferrals-1` |
| A grant install wrote earlier is never withdrawn: reconcile deep-merges the consumer's existing keys. | `reconcileOpencodeJson` in `opencode.ts:384-459` | `deferrals-11` (`381-opencode-bash-grants-never-revoked`) |
| Uninstall strips Claude `WebFetch(domain:…)` / `mcp__…` grants by recomputing today's derived set, not by the `claudeAllowDerived` record bkit already keeps. A grant whose domain left `allowed-domains` survives uninstall. | `.bkit/core/engine/commands/install/uninstall.ts:705-725`; `BkitVersion.claudeAllowDerived` in `.bkit/core/engine/install/version-file.ts` | `deferrals-11` (`381-webfetch-grants-survive-uninstall-after-seed-emptied`) |
| Codex classifies `*.pem`, `*.p12` and `id_rsa` shell reads as the `key` kind, then answers the whole `secret` tier with advisory `additionalContext`. `cat ~/.ssh/id_rsa` runs with a note only, while the docs group it with real gates. | `decideShell(cmd, dirs, ctx, session)` in `.bkit/core/.codex/hooks/bkit-guardrails.cjs:66-110`; `secretFileKind` / `shellSecretRead` in `.bkit/core/hooks/guardrails-tiers.js:208-277` | `deferrals-3` |
| The cloud paste doc prints a "Derived set fingerprint", but the bootstrap hook never compares one, and the stamp ignores consumer `allowed-domains`, the commonest reason a pasted dashboard list goes stale. | `egressFingerprint` / `renderCloudNetworkAllowlist` in `.bkit/core/engine/install/cloud-env.ts:655-712`; `.bkit/templates/.claude/hooks/bkit-cloud-bootstrap.sh` | `deferrals-11` (`381-cloud-allowlist-staleness-detector`) |

**The revision's three open questions, answered by lookup:**

<!-- prettier-ignore -->
| Question | Answer from the code |
| --- | --- |
| Which existing checks and adoption signals cover the host and cloud setups? | `runPreflight` in `.bkit/core/engine/checks/before/index.ts` collects detectors from `files.ts` and others. Install (Phase 3), upgrade (`runUpgradeAdvisories`), `bkit check` and `bkit doctor` (`.bkit/core/engine/commands/install/doctor.ts:167`) all report its advisories. `.bkit/core/engine/install/template-copies.ts` only reports template refreshes against a template copy and has no consumer-content signal. The plan adds two `runPreflight` detectors to `files.ts`. Each one recognises an equivalent consumer copy by its contract (the env var it reads, the key shape it holds), never by byte identity. |
| Which legacy grants can be attributed from evidence already recorded? | Claude: `claudeAllowDerived` in `.bkit/version` records the grants bkit wrote, so uninstall strips by that record. OpenCode: no per-entry record exists. `canonicalHashes` covers `.opencode/opencode.json` as a whole file after consumer keys were merged in, so it cannot attribute one key. Legacy OpenCode substring grants are therefore reported for owner review and preserved. |
| Can the Codex key-read denial be shown in a real Codex session? | A build task (Task 5) runs it on codex-cli and records the outcome. Every outcome is decided: shown (`denied`) → the deny ships as enforced on that version; Codex ran the read despite the deny (`not-shown`), or no real session could be run (`not-run`) → the deny code stays, and the docs and the `codex-setup` advisory say "configured to deny, not verified on a real Codex host". |

**Goals:** stop the unsafe OpenCode grants and report the legacy ones; strip Claude grants by the record bkit already keeps; deny Codex private-key shell reads and report the status honestly; let the cloud bootstrap compare an expected allowlist fingerprint and warn on a mismatch; and keep every advisory self-contained (protection, file or setting, exact corrective action).

**Related Issues:**

- #58 — Workflow counters and decisions read/written via status.json (closed)
- #234 — bkit telemetry: one jsonl for stats, friction, failures (closed)
- #341 — Make workflows run locally, in GH Actions and on claude.ai (closed)
- #342 — Prompt-injection hardening (closed)
- #344 — Deferrals triage (open)
- #381 — Auto-derive cloud-egress domains from the provider registry (closed)
- #384 — Ship bookkeeping mutates validated PR head (closed)
- #397 — bkit-cloud concurrency: global ship lock, FID arbitration (open)
- #402 — Audit engine: orchestrator, conditional lenses, contracts (open)
- #405 — Conditional lens prompts: UI/UX, contracts, derived data, AI (closed)
- #441 — Enforce shell-as-edit rule; settle the curl/wget divergence (closed)
- #442 — Run only the workflow steps a task actually needs (closed)
- #458 — Cloud permissions inert: auto mode drops Bash(*), curl rows (closed)
- #504 — Example project, design to ship: explainer, demo and benchmark (open)
- #628 — Add empty-read, shared-checkout and host-shell rules to audit prompt (closed)
- #650 — Run workflows from the prompt alone, without issue, design or plan (closed)
- #653 — Pre-push slop scan uses the same base as CI (closed)
- #700 — Session-start nudge: read .agents/rules.md on every platform (closed)
- #703 — Standardise question and option labels in prompts and workflows (closed)
- #705 — Build: plan-convert plan-current get their own numbered steps comments (closed)
- #715 — Retire lite workflows; add build publish true/false (closed)
- #719 — Cloud variants: add --auto=codex and allow any tracker (closed)
- #724 — Machine-wide test lock: one test run at a time across agents (closed)
- #744 — Build agents re-run the whole unit suite after every change (closed)
- #747 — Prompting practice: align authoring.md with tier-1 makers' guides (closed)
- #788 — Build and debug PRs conflict on GitHub over union-merged ledgers (closed)
- #792 — Typed supersedes and dependsOn links plus a dead-premise check (closed)
- #796 — Build: test-writer subagent runs before the code subagent, and engine proves each red (closed)
- #798 — Record owner answers to open questions after design and plan close (closed)
- #799 — Ship Step 4 cannot integrate dev into a Path B PR (closed)

---

### Narrative

Consumers receive safer host and cloud templates, checks that identify relevant missing or stale adoption and wiring, and concrete remediation advice. bkit stops creating unsafe convenience grants and reports accurately which protections are enforced, advisory, or unverified.

### Success Criteria

- Relevant host and cloud templates provide safe defaults, clear customization points, and specific upgrade instructions. Consumer-owned copies remain consumer-owned.
- Existing check, doctor, tips, and install/upgrade reporting surfaces identify relevant missing adoption, known obsolete unsafe configuration, and missing wiring. Recognize equivalent consumer implementations where verifiable; do not require byte-identical copies or treat every customization as drift. Each advisory names the missing protection, affected file or setting, and exact corrective action.
- Stop automatically generating permissive OpenCode curl/wget substring grants. Review related generated URL permissions for the same unsafe matching assumption. Report legacy entries with uncertain ownership for explicit owner review; preserve unrelated user-authored permissions. Use existing trustworthy ownership evidence for narrow cleanup where available, without introducing a new permission transaction system.
- Resolve the Codex private-key reporting mismatch with a narrow, real-host-verified denial correction where supported, or explicit documentation and advisories that the protection remains unenforced. Keep .env reads advisory. Never claim enforcement from a configured hook, unit test, or adoption check alone.
- Cloud bootstrap guidance exposes the expected allowlist fingerprint and exact refresh steps. Missing or differing available fingerprint evidence produces a warning and continues. Report dashboard configuration as unverified: a copied stamp is an operator assertion, not proof of the deployed allowlist.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| An OpenCode guardrails plugin for the shell-as-edit-channel gate and URL-host matching (`deferrals-11`, row `opencode-has-no-script-hook-so-two-gates-are-inexpressible-there`) | The #803 owner revision of 2026-11-03 (§ Constraints and non-goals) declares "new OpenCode enforcement plugin" out of scope. No success criterion needs it: removing the generated shell substring allows closes the shell URL-host bypass, since shell fetches now ask, and the owner kept the fetch-tool `*{base}*` allows as the accepted risk of decision `551-opencode-unanchored-host-allows-accepted-risk`. Deferral row, `reason: scope-declared`. | A future issue, if OpenCode needs the shell-as-edit gate. |
| The fingerprint compare in the Cursor and Codex cloud setup scripts (Open Question 2, option B) | Success criterion 5 names the cloud bootstrap guidance. Docs-only status for Cursor and Codex (option A) meets it. Deferral row `803-cursor-codex-cloud-fingerprint-compare`, `reason: needs-decision`. Under option A the Cursor and Codex paste notes keep a derived-set stamp that ignores consumer `allowed-domains`, so their fingerprint does not describe the full list those dashboards hold; Task 7's `cloud.md` edit says so. | If the owner picks option B at plan review: this plan's runbook, as a new task in Group 4. Otherwise: a follow-up issue for Cursor and Codex cloud setup-script fingerprint parity, which needs its own shell test harness for both generated setup scripts. |

## Where it fits

- Group 1: OpenCode generated fetch grants (`deferrals-1`, `deferrals-11`) — done
  - TASK 1: Stop the OpenCode shell fetch grants (`deferrals-1`; `deferrals-11` row `381-opencode-bash-grants-never-revoked`) — done
  - TASK 2: Report legacy OpenCode substring fetch grants for owner review (`deferrals-1`; `deferrals-11` row `381-opencode-bash-grants-never-revoked`) — done
- Group 2: Uninstall cleanup by recorded evidence (`deferrals-11`) — done
  - TASK 3: Strip Claude derived grants by the `claudeAllowDerived` record and list unattributable grants for review (`deferrals-11` rows `381-webfetch-grants-survive-uninstall-after-seed-emptied` and `381-opencode-bash-grants-never-revoked`) — done
- Group 3: Codex private-key shell reads (`deferrals-3`) — this group
  - TASK 4: Deny Codex shell reads of private-key files, `.env` advisory (`deferrals-3`) — open
  - TASK 5: Run the Codex private-key deny in a real Codex session and record the outcome (`deferrals-3`) — open
  - TASK 6: State the Codex key-read protection status in the advisory and docs from the recorded outcome (`deferrals-3`) — open
- Group 4: Cloud allowlist fingerprint (`deferrals-11`) — next
  - TASK 7: Record the allowlist fingerprint in `.bkit/allowlist.json` and print it with the env-var step in the Claude paste section (`deferrals-11` row `381-cloud-allowlist-staleness-detector`) — open
  - TASK 8: Compare the fingerprint in the cloud bootstrap template, warn and continue (`deferrals-11` row `381-cloud-allowlist-staleness-detector`) — open
  - TASK 9: Detect an adopted cloud bootstrap without the fingerprint compare (`deferrals-11` row `381-cloud-allowlist-staleness-detector`) — open
- Group 5: Mirrors, bkit's own copies and test docs — later
  - TASK 10: Refresh mirrors and `dist/`, clean bkit's own OpenCode copy, and record the new tests in `docs/testing.md` (`deferrals-1`, `deferrals-3`, `deferrals-11`) — open

## The work

<!-- bkit:task 4 start -->

- [ ] **TASK 4:** Deny Codex shell reads of private-key files, `.env` advisory (`deferrals-3`)
  - **UPDATE:** `shellSecretRead` in `.bkit/core/hooks/guardrails-tiers.js`: (`:249-277`) return the first `key`-kind part ahead of the first `env`-kind part; `classifyShell(c, dirs, ctx)` (`:292`) is unchanged, and no key-read deny goes beside its Codex-only `IS_CODEX_HOOK` deny for `bkit tests jump`, because this shared tier is also spliced into the Cursor and Antigravity hooks
  - **UPDATE:** `decideShell` in `.bkit/core/.codex/hooks/bkit-guardrails.cjs`: (`decideShell(cmd, dirs, ctx, session)`, `:66-110`) in `case "secret"` (advisory `ask(...)` at `:78-81`), `secretFileKind(v.path) === "key"` → `deny(...)` naming the file with no `Command:` echo; `env` keeps the advisory, its file description narrowed from "an env, secrets or private-key file" to "an env or secrets file"
  - **UPDATE:** `.bkit/instructions.md`: § Hook Text — add `### guardrails-codex-key-shell-deny` (hook Guardrails; fires on a shell read of a private-key file; hosts Codex; source `.bkit/core/.codex/hooks/bkit-guardrails.cjs` `decideShell`) with the exact deny text, directly after `guardrails-codex-tests-jump` (`:9100`), the existing Codex-only deny message; narrow `guardrails-codex-secret-shell` (`:9126-9139`) so its `fires` line and text block match the narrowed advisory
  - **UPDATE:** `.bkit/core/engine/install/modules/index.integration.test.ts`: `SHELL_SECRET_READS` (`:636`) key rows carry a Codex `deny` expectation and the describe `shell reads of secret files — script hosts gate, permission tables do not` at `:889` asserts it per host through `codexVerdict` (`:736`); add a `cat ~/.ssh/id_rsa.pub` → `allow` row; add the three tests below
  - **UPDATE:** `.codex/hooks/bkit-guardrails.cjs`: re-rendered by `pnpm tsx .bkit/core/engine/cli.ts upgrade`
  - **UPDATE:** `.cursor/hooks/bkit-guardrails.cjs`: re-rendered by the same upgrade (splices `guardrails-tiers.js`)
  - **UPDATE:** `.agents/plugins/bkit/hooks/bkit-guardrails.cjs`: re-rendered by the same upgrade (splices `guardrails-tiers.js`)
  - **DONE WHEN:** `codexVerdict` answers `deny` for the three key rows and `cat .env ~/.ssh/id_rsa`, `ask` for every `.env` row and `allow` for `cat ~/.ssh/id_rsa.pub`; the existing `SHELL_SECRET_READS` allow rows (`cat .env.example`, `cat .envrc`, `cp .env.example .env`, `git add .env.example`, `mv .env .env.bak`, `grep -rn ".env" docs`, `git commit -m "ignore .env"`) keep `allow` on every host; the row `rg -l "id_rsa" src` → "search pattern, not a file" (`guardrails-cursor.integration.test.ts:118`) still holds; Cursor and Antigravity verdicts are unchanged; `T6 — guardrails.cjs installed mirror is its rendered template` in `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` passes; `every hook message has an entry and every entry is still emitted` in `.bkit/core/engine/tools/instructions-sources.test.ts` passes
  - **TEST FIRST:**
    - `.bkit/core/engine/install/modules/index.integration.test.ts` `Codex denies shell reads of private-key files` fails on Codex answering with an advisory note for `cat ~/.ssh/id_rsa`
    - `.bkit/core/engine/install/modules/index.integration.test.ts` `Codex denies a command that reads .env and a private key together` fails on the `.env` path winning, so `cat .env ~/.ssh/id_rsa` gets the advisory
    - `.bkit/core/engine/install/modules/index.integration.test.ts` `the Codex private-key deny reason names the file and not the command` fails on no deny reason, or one that echoes the full command

<!-- bkit:task 4 end -->

<!-- bkit:task 5 start -->

- [ ] **TASK 5:** Run the Codex private-key deny in a real Codex session and record the outcome (`deferrals-3`)
  - **CREATE:** `tests/experiments/hooks/results/{YYYY-MM-DD}/bkit-codex-key-deny.json`: `{ host, cliVersion, date, command, outcome: "denied" | "not-shown" | "not-run", observed, reason }`, synthetic key only (`not-shown` = Codex ran the read despite the deny; `not-run` = no real session could be run)
  - **CREATE:** `tests/experiments/hooks/reports/bkit-codex-key-deny-{YYYY-MM-DD}.md`: the setup, the observed outcome and the doc status it sets
  - **UPDATE:** `docs/testing.md`: add § Manual recipe — Codex key-read deny after § Manual recipe — OpenCode E2E. Steps: `pnpm build`; `node dist/cli.js install --codex --tracker=none` in a new scratch consumer outside the checkout; trust the `.codex/` layer through Codex's normal flow; write a synthetic `id_rsa`; ask Codex to `cat` it; record the outcome and `codex --version`
  - **READ:** `tests/experiments/hooks/bkit-hook-probe.md`: the dated `results/` + `reports/` layout and its rule "Do not infer support from a generated hook response alone"
  - **DEPENDS ON:** 4
  - **DONE WHEN:** the result file exists with `outcome` `denied`, `not-shown` or `not-run` and a `cliVersion`. A `not-shown` or `not-run` result fills `reason` (for example, `not-run` because no authenticated Codex session was available to the builder). The report names the doc status Task 6 must write.
  - **TEST FIRST:** n/a — @live (golden) tier only: a manual real-host experiment outside CI

<!-- bkit:task 5 end -->

<!-- bkit:task 6 start -->

- [ ] **TASK 6:** State the Codex key-read protection status in the advisory and docs from the recorded outcome (`deferrals-3`)
  - **UPDATE:** `runCodexModule` in `.bkit/core/engine/install/modules/codex.ts`: the `codex-setup` advisory becomes "Four things", adding the private-key shell-read status and the `.env` advisory line, each with its corrective action. The status is "configured to deny, not verified on a real Codex host" unless Task 5 recorded `denied`, in which case it is "denied (verified on codex-cli {version}, {date})"
  - **UPDATE:** `.bkit/core/.bkit/providers.md`: § Guardrails "Secret files" row (`:271`) and shared parts table (`:307-308`): Codex denies private-key shell reads with the same status phrase; `.env` advisory; `shellSecretRead` prefers a key-kind path
  - **UPDATE:** `.bkit/core/.bkit/prompts.md`: § Hook-injected text, Guardrails row (`:435`): name Codex `.env` shell reads among the advisories, and state that Codex private-key shell reads are denied, with the same status phrase
  - **UPDATE:** `.bkit/core/engine/commands/install/install.integration.test.ts`: one test in a Codex describe, beside `Scenario — Codex + Antigravity install side by side without conflict (#534)`
  - **UPDATE:** `dist/cli.js`: rebuilt with the rest of `dist/` by `pnpm build`, and staged with `git add dist/`
  - **DEPENDS ON:** 5
  - **DONE WHEN:** `bkit install --codex` prints the four-item `codex-setup` advisory with the status phrase that matches the Task 5 result; `providers.md` and `prompts.md` use the same phrase; no doc or advisory says "enforced" or "verified" for the Codex key read unless the result is `denied`; `pnpm bkit:check:dist` exits 0
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/install/install.integration.test.ts` `a --codex install reports the private-key and .env shell-read protection status` fails on the advisory lacking the private-key status phrase and the `.env` direnv action

<!-- bkit:task 6 end -->

### Reuse Inventory rows

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| A key-kind path wins over an env-kind path in one command | `.bkit/core/hooks/guardrails-tiers.js` | read `shellSecretRead:249-277` (returns the first secret path) | `shellSecretRead` | EXTEND | Scan every word and return a `key` path ahead of an `env` path. Cursor and Antigravity still ask for both kinds, so only the named path in their reason changes. |

Reuse Inventory rows left out: 5; Architecture entries left out: 7 — read them in docs/plans/202611/803-close-codex-opencode-plan.md § Reuse Inventory and § Architecture & Component Changes.
