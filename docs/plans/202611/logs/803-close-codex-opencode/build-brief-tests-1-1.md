# Brief: group 1 — OpenCode generated fetch grants (`deferrals-1`, `deferrals-11`) (tests)

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

- Group 1: OpenCode generated fetch grants (`deferrals-1`, `deferrals-11`) — this group
  - TASK 1: Stop the OpenCode shell fetch grants (`deferrals-1`; `deferrals-11` row `381-opencode-bash-grants-never-revoked`) — open
  - TASK 2: Report legacy OpenCode substring fetch grants for owner review (`deferrals-1`; `deferrals-11` row `381-opencode-bash-grants-never-revoked`) — open
- Group 2: Uninstall cleanup by recorded evidence (`deferrals-11`) — next
  - TASK 3: Strip Claude derived grants by the `claudeAllowDerived` record and list unattributable grants for review (`deferrals-11` rows `381-webfetch-grants-survive-uninstall-after-seed-emptied` and `381-opencode-bash-grants-never-revoked`) — open
- Group 3: Codex private-key shell reads (`deferrals-3`) — later
  - TASK 4: Deny Codex shell reads of private-key files, `.env` advisory (`deferrals-3`) — open
  - TASK 5: Run the Codex private-key deny in a real Codex session and record the outcome (`deferrals-3`) — open
  - TASK 6: State the Codex key-read protection status in the advisory and docs from the recorded outcome (`deferrals-3`) — open
- Group 4: Cloud allowlist fingerprint (`deferrals-11`) — later
  - TASK 7: Record the allowlist fingerprint in `.bkit/allowlist.json` and print it with the env-var step in the Claude paste section (`deferrals-11` row `381-cloud-allowlist-staleness-detector`) — open
  - TASK 8: Compare the fingerprint in the cloud bootstrap template, warn and continue (`deferrals-11` row `381-cloud-allowlist-staleness-detector`) — open
  - TASK 9: Detect an adopted cloud bootstrap without the fingerprint compare (`deferrals-11` row `381-cloud-allowlist-staleness-detector`) — open
- Group 5: Mirrors, bkit's own copies and test docs — later
  - TASK 10: Refresh mirrors and `dist/`, clean bkit's own OpenCode copy, and record the new tests in `docs/testing.md` (`deferrals-1`, `deferrals-3`, `deferrals-11`) — open

## The work

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** Stop the OpenCode shell fetch grants (`deferrals-1`; `deferrals-11` row `381-opencode-bash-grants-never-revoked`)
  - **UPDATE:** `injectOpencodeDerivedAllows` in `.bkit/core/engine/install/modules/opencode.ts`: drop the `permission.bash` `curl *${base}*` / `wget *${base}*` loop; keep the `permission.webfetch` `*${base}*` loop unchanged (decision `551-opencode-unanchored-host-allows-accepted-risk`); rewrite the doc comments at `:245-246` and `:340-347` to say only the fetch tool gets derived allows
  - **READ:** `networkAllowlistBases` in `.bkit/core/engine/install/cloud-env.ts`: the apex bases
  - **READ:** `resolveNetworkAllowlist` in `.bkit/core/engine/install/cloud-env.ts`: shipped ∪ declared domains
  - **UPDATE:** `.bkit/core/engine/install/modules/opencode.integration.test.ts`: the curl assertions of the tests at `:448` and `:541`; their `*{base}*` webfetch assertions stay
  - **UPDATE:** `.bkit/core/engine/install/modules/index.integration.test.ts`: the parity test at `:1301` and the comments at `:1075` and `:1088-1092`
  - **UPDATE:** `.bkit/core/.bkit/providers.md`: § Permissions Network fetch cells (`:488`) and § Network allowlist OpenCode row (`:510`) — no shell allow; the `*{base}*` `webfetch` allows and their accepted-risk sentence stay
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: `:1618`, OpenCode shell fetches ask
  - **UPDATE:** `.bkit/core/engine/install/cloud-env.integration.test.ts`: the comment at `:112-113` ("permission.bash curl globs") names the `*{base}*` `permission.webfetch` keys instead
  - **UPDATE:** `.opencode/opencode.json`: regenerated by `pnpm tsx .bkit/core/engine/cli.ts upgrade` (legacy keys stay until Task 10)
  - **UPDATE:** `dist/cli.js`: rebuilt with the rest of `dist/` by `pnpm build`, and staged with `git add dist/`
  - **DONE WHEN:** `renderOpencodeJson` output has no `permission.bash` key matching `^(curl|wget) \*[^*\s]+\*$`, and its `permission.webfetch` still holds `*{base}*` = `allow` for each derived base; the three tests below pass; `git grep -n 'curl \*{domain}\*' -- .bkit/core/.bkit/` returns nothing; `pnpm bkit:check:dist` exits 0
  - **TEST FIRST:**
    - `.bkit/core/engine/install/modules/opencode.integration.test.ts` `injects consumer allowed-domains into the fetch tool and never into shell allows` fails on `curl *vercel.com*` still being an `allow` in `permission.bash` (rewrites "injects consumer allowed-domains into both fetch surfaces (shell + fetch tool)")
    - `.bkit/core/engine/install/modules/opencode.integration.test.ts` `permission: opencode tool-keyed map (not Claude {rules:[...]}), force-push gated, no shell fetch allows` fails on `curl *github.com*` still being an `allow` (rewrites "permission: opencode tool-keyed map (not Claude {rules:[...]}), force-push gated": its curl assertion flips to absent)
    - `.bkit/core/engine/install/modules/index.integration.test.ts` `every derived base reaches the fetch tool on every host, and an OpenCode shell fetch asks` fails on an OpenCode shell `curl https://{base}/` answering `allow` (rewrites "every derived base reaches BOTH fetch surfaces on every host (fetch tool + shell)")

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** Report legacy OpenCode substring fetch grants for owner review (`deferrals-1`; `deferrals-11` row `381-opencode-bash-grants-never-revoked`)
  - **UPDATE:** `.bkit/core/engine/checks/before/files.ts`: add `detectOpencodeSubstringFetchGrants(cwd)` (advisory id `opencode-substring-fetch-grants`; reads `permission.bash` only, with `readJsonFile`; never writes), an exported key matcher for `uninstall.ts`, and an exported `redactUrlParts` (its callers are the detector and Task 3's uninstall review lines)
  - **UPDATE:** `runPreflight` in `.bkit/core/engine/checks/before/index.ts`: push the finding beside `detectPlaywrightReporterHostile`
  - **UPDATE:** `dist/cli.js`: rebuilt with the rest of `dist/` by `pnpm build`, and staged with `git add dist/`
  - **READ:** `readJsonFile` in `.bkit/core/engine/shared/json.ts`: the parse contract (no `JSON.parse` in a `try`)
  - **READ:** `PreflightFinding` in `.bkit/core/engine/checks/before/index.ts`: the advisory shape
  - **UPDATE:** `.bkit/core/engine/checks/before/files.test.ts`: a `detectOpencodeSubstringFetchGrants` describe
  - **UPDATE:** `.bkit/core/engine/commands/install/upgrade.integration.test.ts`: the legacy-file upgrade test
  - **UPDATE:** `.bkit/core/.bkit/providers.md`: § Network allowlist OpenCode row — legacy entries are reported by `opencode-substring-fetch-grants`, never removed. Describe them in words ("substring `curl` / `wget` allows"), not with the `curl *{domain}*` key shape, so Task 1's `git grep` check keeps holding
  - **DEPENDS ON:** 1
  - **DONE WHEN:** a real `bkit upgrade` over a temp consumer whose `.opencode/opencode.json` holds `"curl *github.com*": "allow"` keeps that key, prints `opencode-substring-fetch-grants` naming it with its removal action, keeps `*github.com*` in `permission.webfetch` without reporting it, and adds no new `curl *…*` / `wget *…*` key; the five tests below pass; `git grep -n 'curl \*{domain}\*' -- .bkit/core/.bkit/` still returns nothing; `pnpm bkit:check:dist` exits 0
  - **TEST FIRST:**
    - `.bkit/core/engine/checks/before/files.test.ts` `reports each substring curl and wget allow with its removal action` fails on no finding for a file holding `curl *github.com*` and `wget *github.com*` allows
    - `.bkit/core/engine/checks/before/files.test.ts` `ignores webfetch, non-allow and unrelated consumer entries` fails on a finding raised for a `*github.com*` or `https://api.example.com/*` webfetch allow, a `curl *x*: ask` entry or an unrelated bash key
    - `.bkit/core/engine/checks/before/files.test.ts` `redacts URL credentials and query strings in a reported key` fails on `user:tok` or `k=v` appearing in the finding's text
    - `.bkit/core/engine/checks/before/files.test.ts` `reports nothing and writes nothing for an absent, unparseable or map-less file` fails on a throw, a finding, or a changed file
    - `.bkit/core/engine/commands/install/upgrade.integration.test.ts` `upgrade keeps legacy OpenCode substring fetch grants and reports each for owner review` fails on the output lacking "opencode-substring-fetch-grants", on the upgraded `permission.webfetch` lacking `*github.com*`, or on a new `curl *…*` key in `permission.bash`

<!-- bkit:task 2 end -->

### Derived Test Matrix rows

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| `deferrals-1`: the rendered OpenCode `permission.bash` holds no `curl *{base}*` / `wget *{base}*` allow for shipped or declared domains, while `permission.webfetch` keeps its `*{base}*` allows (decision 551) | Integration | `.bkit/core/engine/install/modules/opencode.integration.test.ts` | 1 |
| `deferrals-1`: the rendered permission map keeps its OpenCode tool-keyed shape and force-push gate, with no shell fetch allow | Integration | `.bkit/core/engine/install/modules/opencode.integration.test.ts` | 1 |
| `deferrals-1`: every derived base reaches the Claude fetch tool, the OpenCode fetch tool and the hook allowlist, and an OpenCode shell `curl` to it asks | Integration | `.bkit/core/engine/install/modules/index.integration.test.ts` | 1 |
| `deferrals-1` / `deferrals-11`: a legacy substring `curl` / `wget` allow is reported with its key and exact removal action | Unit | `.bkit/core/engine/checks/before/files.test.ts` | 2 |
| `deferrals-11`: `permission.webfetch` entries (the `*{base}*` allows bkit writes included), non-`allow` entries and unrelated consumer permission entries are neither reported nor touched | Unit | `.bkit/core/engine/checks/before/files.test.ts` | 2 |
| A reported key with URL credentials or a query string is redacted in the advisory | Unit | `.bkit/core/engine/checks/before/files.test.ts` | 2 |
| The detector never writes `.opencode/opencode.json`, and an absent or unparseable file reports nothing | Unit | `.bkit/core/engine/checks/before/files.test.ts` | 2 |
| `deferrals-11` (`381-opencode-bash-grants-never-revoked`): a real `bkit upgrade` over a legacy file keeps the entries, reports `opencode-substring-fetch-grants`, keeps the `*{base}*` `webfetch` keys through `reconcileOpencodeJson` and adds no new `curl *…*` / `wget *…*` key | Integration | `.bkit/core/engine/commands/install/upgrade.integration.test.ts` | 2 |
| `deferrals-3`: the rendered Codex hook denies `cat ~/.ssh/id_rsa`, `cat certs/server.pem` and `openssl x509 -in cert.p12 -noout`, while Cursor and Antigravity still ask and `.env` rows stay advisory on Codex | Integration | `.bkit/core/engine/install/modules/index.integration.test.ts` | 4 |
| `deferrals-3`: Codex denies `cat .env ~/.ssh/id_rsa`, because a key-kind path wins over an env-kind path | Integration | `.bkit/core/engine/install/modules/index.integration.test.ts` | 4 |
| The Codex private-key deny reason names the file and does not echo the command | Integration | `.bkit/core/engine/install/modules/index.integration.test.ts` | 4 |
| After the key-first `shellSecretRead` change, the existing `SHELL_SECRET_READS` allow rows (`cat .env.example`, `cat .envrc`, `cp .env.example .env`, `grep -rn ".env" docs`) and the search-pattern row `rg -l "id_rsa" src` keep their verdicts on every host, and `cat ~/.ssh/id_rsa.pub` is allowed on Codex | Integration | `.bkit/core/engine/install/modules/index.integration.test.ts`, `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` (existing rows) | 4 |
| An adopted bootstrap that never reads `BKIT_CLOUD_ALLOWLIST_FINGERPRINT` is reported with the template block to copy | Unit | `.bkit/core/engine/checks/before/files.test.ts` | 9 |
| A customised bootstrap that reads the variable raises nothing, and no adopted bootstrap raises nothing | Unit | `.bkit/core/engine/checks/before/files.test.ts` | 9 |
