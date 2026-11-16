# Brief: group 6 — Challenge round 1 findings (tests)

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
- Group 3: Codex private-key shell reads (`deferrals-3`) — done
  - TASK 4: Deny Codex shell reads of private-key files, `.env` advisory (`deferrals-3`) — done
  - TASK 5: Run the Codex private-key deny in a real Codex session and record the outcome (`deferrals-3`) — done
  - TASK 6: State the Codex key-read protection status in the advisory and docs from the recorded outcome (`deferrals-3`) — done
- Group 4: Cloud allowlist fingerprint (`deferrals-11`) — done
  - TASK 7: Record the allowlist fingerprint in `.bkit/allowlist.json` and print it with the env-var step in the Claude paste section (`deferrals-11` row `381-cloud-allowlist-staleness-detector`) — done
  - TASK 8: Compare the fingerprint in the cloud bootstrap template, warn and continue (`deferrals-11` row `381-cloud-allowlist-staleness-detector`) — done
  - TASK 9: Detect an adopted cloud bootstrap without the fingerprint compare (`deferrals-11` row `381-cloud-allowlist-staleness-detector`) — done
  - TASK 11: Make the jq-absent half of the Task 8 fingerprint test run with no `jq` on PATH (owner decision `build-decision-1-4.md`) — done
- Group 5: Mirrors, bkit's own copies and test docs — done
  - TASK 10: Refresh mirrors and `dist/`, clean bkit's own OpenCode copy, and record the new tests in `docs/testing.md` (`deferrals-1`, `deferrals-3`, `deferrals-11`) — done
- Group 6: Challenge round 1 findings — this group
  - TASK 12: A Codex agent runs `sudo cat ~/.ssh/id_rsa` (or `cat id_rsa; gh pr close 1`) and the key is printed, because the ask tier wins over the new private-key deny — open
  - TASK 13: A Codex agent runs `echo gh pr close; cat ~/.ssh/id_rsa` (or `sudo cat ~/.ssh/id_rsa`, `git stash drop; cat certs/server.pem`), the ask tier wins over the secret tier in `classifyShell`, and the hook returns advisory `additionalContext`, so the private-key read runs although the docs and the `codex-setup` advisory say private-key shell reads are configured to deny — open
  - TASK 14: A legacy key `curl *user:tok@example.com*` (no scheme) prints `user:tok` verbatim into the `bkit check` / upgrade advisory and the uninstall review line — open
  - TASK 15: A consumer runs `bkit install --codex`, follows the `codex-setup` advisory to "the manual recipe in docs/testing.md", and finds no such recipe, because it lives only in bkit's own `docs/testing.md` — open

## The work

<!-- bkit:task 12 start -->
- [ ] **TASK 12:** A Codex agent runs `sudo cat ~/.ssh/id_rsa` (or `cat id_rsa; gh pr close 1`) and the key is printed, because the ask tier wins over the new private-key deny
  **Severity:** HIGH · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/.codex/hooks/bkit-guardrails.cjs:67` · **Round:** 1
  - **DONE WHEN:** On the Codex hook, a command that reads a `key`-kind path is denied even when the same command also hits an ask-tier rule (`sudo`, `gh pr close`, `git stash drop`, `git reset --hard`, ...); Cursor and Antigravity keep their `ask`. Probe on the rendered `.codex/hooks/bkit-guardrails.cjs` today: `sudo cat ~/.ssh/id_rsa`, `cat ~/.ssh/id_rsa; gh pr close 1` and `git stash drop && cat certs/server.pem` all return `additionalContext` (advisory, command runs), not `deny`, because `classifyShell` (`.bkit/core/hooks/guardrails-tiers.js:308`) returns `{ tier: "ask" }` before it ever calls `shellSecretRead`.
  - **TEST FIRST:**
    - `.bkit/core/engine/install/modules/index.integration.test.ts` `Codex denies a private-key read combined with an ask-tier command` fails on `codexVerdict("sudo cat ~/.ssh/id_rsa")` returning `ask` instead of `deny`
    - `.bkit/core/engine/install/modules/index.integration.test.ts` `Codex denies a private-key read after a destructive git ask` fails on `codexVerdict("git stash drop && cat certs/server.pem")` returning `ask` instead of `deny`
<!-- bkit:task 12 end -->

<!-- bkit:task 13 start -->
- [ ] **TASK 13:** A Codex agent runs `echo gh pr close; cat ~/.ssh/id_rsa` (or `sudo cat ~/.ssh/id_rsa`, `git stash drop; cat certs/server.pem`), the ask tier wins over the secret tier in `classifyShell`, and the hook returns advisory `additionalContext`, so the private-key read runs although the docs and the `codex-setup` advisory say private-key shell reads are configured to deny
  **Severity:** HIGH · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/.codex/hooks/bkit-guardrails.cjs:73` · **Round:** 1
  - **DONE WHEN:** `decideShell` in `.bkit/core/.codex/hooks/bkit-guardrails.cjs` denies, with the existing file-naming private-key reason, every command for which `shellSecretRead(c)` returns a path whose `secretFileKind` is `key`, whatever tier `classifyShell` returns below `deny` (`ask`, `fetch`, `edit`); the `deny` tier and the Codex `bkit tests jump` deny keep their own reasons; Cursor and Antigravity verdicts are unchanged (`guardrails-tiers.js` precedence untouched, or changed for Codex only); the rendered `.codex/hooks/bkit-guardrails.cjs` mirror matches. Verified by hand on the installed `.codex/hooks/bkit-guardrails.cjs`: `cat ~/.ssh/id_rsa` → deny, but `echo gh pr close; cat ~/.ssh/id_rsa`, `sudo cat ~/.ssh/id_rsa` and `git stash drop; cat certs/server.pem` → advisory only.
  - **TEST FIRST:**
    - `.bkit/core/engine/install/modules/index.integration.test.ts` `Codex denies a private-key shell read chained after an ask-tier command` fails on `codexVerdict("echo gh pr close; cat ~/.ssh/id_rsa")`, `codexVerdict("sudo cat ~/.ssh/id_rsa")` and `codexVerdict("git stash drop; cat certs/server.pem")` returning `ask` instead of `deny`
<!-- bkit:task 13 end -->

<!-- bkit:task 14 start -->
- [ ] **TASK 14:** A legacy key `curl *user:tok@example.com*` (no scheme) prints `user:tok` verbatim into the `bkit check` / upgrade advisory and the uninstall review line
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/checks/before/files.ts:117` · **Round:** 1
  - **DONE WHEN:** `redactUrlParts` strips user-info whether or not a `scheme://` precedes it (any `[^/@\s*]+@` run before the host inside the glob body), so both `detectOpencodeSubstringFetchGrants` and the `uninstall.ts` review line never print credentials. Today the first replace only matches `//...@`: probed, `redactUrlParts("curl *user:tok@example.com*")` returns the key unchanged, while `isOpencodeSubstringFetchKey` accepts it, so it is reported in the clear.
  - **TEST FIRST:**
    - `.bkit/core/engine/checks/before/files.test.ts` `redacts schemeless user-info in a reported key` fails on `detectOpencodeSubstringFetchGrants` output for `curl *user:tok@example.com*` containing `user:tok`
    - `.bkit/core/engine/checks/before/files.test.ts` `redactUrlParts drops user-info with no scheme` fails on `redactUrlParts("wget *user:tok@example.com/p*")` containing `user:tok`
<!-- bkit:task 14 end -->

<!-- bkit:task 15 start -->
- [ ] **TASK 15:** A consumer runs `bkit install --codex`, follows the `codex-setup` advisory to "the manual recipe in docs/testing.md", and finds no such recipe, because it lives only in bkit's own `docs/testing.md`
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/install/modules/codex.ts:226` · **Round:** 1
  - **DONE WHEN:** Item 4 of the `codex-setup` advisory carries its corrective action inline (the few steps of the real-host check: trust `.codex/`, run `cat` on a synthetic `id_rsa`, confirm a control such as `bkit tests jump` is also denied) or points only at a file bkit installs into the consumer. Today `## Manual recipe — Codex key-read deny` exists only at bkit's `docs/testing.md:907`; `.bkit/templates/docs/testing.md` has no such section, and a consumer's `docs/testing.md` is their own copy, so the action points at nothing (`.agents/rules.md` Advisories self-contained). The new test `a --codex install tells the reader how to act on the private-key status` asserts the dangling `docs/testing.md` pointer, so it keeps the bug in place.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/install/install.integration.test.ts` `the codex-setup private-key action is self-contained in a fresh consumer` fails on the advisory naming `docs/testing.md` while the seeded consumer has no file holding `Codex key-read deny`
<!-- bkit:task 15 end -->

### Derived Test Matrix rows

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| `deferrals-1`: every derived base reaches the Claude fetch tool, the OpenCode fetch tool and the hook allowlist, and an OpenCode shell `curl` to it asks | Integration | `.bkit/core/engine/install/modules/index.integration.test.ts` | 1 |
| `deferrals-1` / `deferrals-11`: a legacy substring `curl` / `wget` allow is reported with its key and exact removal action | Unit | `.bkit/core/engine/checks/before/files.test.ts` | 2 |
| `deferrals-11`: `permission.webfetch` entries (the `*{base}*` allows bkit writes included), non-`allow` entries and unrelated consumer permission entries are neither reported nor touched | Unit | `.bkit/core/engine/checks/before/files.test.ts` | 2 |
| A reported key with URL credentials or a query string is redacted in the advisory | Unit | `.bkit/core/engine/checks/before/files.test.ts` | 2 |
| The detector never writes `.opencode/opencode.json`, and an absent or unparseable file reports nothing | Unit | `.bkit/core/engine/checks/before/files.test.ts` | 2 |
| `deferrals-3`: the rendered Codex hook denies `cat ~/.ssh/id_rsa`, `cat certs/server.pem` and `openssl x509 -in cert.p12 -noout`, while Cursor and Antigravity still ask and `.env` rows stay advisory on Codex | Integration | `.bkit/core/engine/install/modules/index.integration.test.ts` | 4 |
| `deferrals-3`: Codex denies `cat .env ~/.ssh/id_rsa`, because a key-kind path wins over an env-kind path | Integration | `.bkit/core/engine/install/modules/index.integration.test.ts` | 4 |
| The Codex private-key deny reason names the file and does not echo the command | Integration | `.bkit/core/engine/install/modules/index.integration.test.ts` | 4 |
| After the key-first `shellSecretRead` change, the existing `SHELL_SECRET_READS` allow rows (`cat .env.example`, `cat .envrc`, `cp .env.example .env`, `grep -rn ".env" docs`) and the search-pattern row `rg -l "id_rsa" src` keep their verdicts on every host, and `cat ~/.ssh/id_rsa.pub` is allowed on Codex | Integration | `.bkit/core/engine/install/modules/index.integration.test.ts`, `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` (existing rows) | 4 |
| `deferrals-3`: a real `bkit install --codex` prints the `codex-setup` advisory stating the private-key shell-read status Task 5 recorded ("not verified on a real Codex host" unless the result is `denied`) and `.env` shell reads as advisory, each with its corrective action | Integration | `.bkit/core/engine/commands/install/install.integration.test.ts` | 6 |
| An adopted bootstrap that never reads `BKIT_CLOUD_ALLOWLIST_FINGERPRINT` is reported with the template block to copy | Unit | `.bkit/core/engine/checks/before/files.test.ts` | 9 |
| A customised bootstrap that reads the variable raises nothing, and no adopted bootstrap raises nothing | Unit | `.bkit/core/engine/checks/before/files.test.ts` | 9 |
| Codex denies a private-key read combined with an ask-tier command | Integration | `.bkit/core/engine/install/modules/index.integration.test.ts` | 12 |
| Codex denies a private-key read after a destructive git ask | Integration | `.bkit/core/engine/install/modules/index.integration.test.ts` | 12 |
| Codex denies a private-key shell read chained after an ask-tier command | Integration | `.bkit/core/engine/install/modules/index.integration.test.ts` | 13 |
| redacts schemeless user-info in a reported key | Unit | `.bkit/core/engine/checks/before/files.test.ts` | 14 |
| redactUrlParts drops user-info with no scheme | Unit | `.bkit/core/engine/checks/before/files.test.ts` | 14 |
| the codex-setup private-key action is self-contained in a fresh consumer | Integration | `.bkit/core/engine/commands/install/install.integration.test.ts` | 15 |
