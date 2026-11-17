<!-- bkit:anchor
baseSha: 1afb96fd32aa6bb0b20b5c349d7eb77c30cd48c5
baseRef: origin/dev
bkitVersion: 6.1.1
bkitLatest: 6.1.1
-->
Verdict: CONCERNS
<!-- verdict:end -->

# Close the Codex and OpenCode Guard Gaps Implementation Plan

> [!CAUTION]
> **Purpose:** The implementation plan: pre-flight checks, gates, the runbook, verification and rollback.

## Context & Goals

Issue #803 is planned from the owner-approved scope revision of 2026-11-03. The 2026-11-10 comment confirms that revision is the spec, the old design doc is removed, and the design-run logs are evidence only. There is no design doc, so no `Suggested Workstreams` apply. The plan also covers the three audit findings the issue names from `docs/audits/202611/deferrals.md`: `deferrals-1`, `deferrals-3` and `deferrals-11`. The rest of that audit is context only.

**What is wrong today (read at `HEAD` of `feat/803-close-codex-opencode`):**

<!-- prettier-ignore -->
| Gap | Where | Finding |
| --- | --- | --- |
| Install writes `curl *{base}*` / `wget *{base}*` = `allow` into OpenCode's `permission.bash`. OpenCode globs match the whole string with `*` crossing `/` `?` `@`, so `curl https://evil.example/?x=github.com` is allowed. | `injectOpencodeDerivedAllows` in `.bkit/core/engine/install/modules/opencode.ts:348-369` | `deferrals-1` |
| The same generator writes `*{base}*` = `allow` into `permission.webfetch`, which has the same substring assumption. This is the "related generated URL permission" the revision asks to review. Claude's `WebFetch(domain:…)` grants and the Cursor, Codex and Antigravity hooks match the host, so they do not share the flaw. The `*{base}*` shape is an ACTIVE accepted-risk decision, `551-opencode-unanchored-host-allows-accepted-risk` (`docs/decisions.jsonl:199`): the maintainer kept it for apex + subdomain parity with Claude and rejected `https://{host}/*` because "every subdomain fetch prompts". This plan proposes to reverse that decision (Open Question 4). | `.bkit/core/engine/install/modules/opencode.ts:363-368`; `.bkit/core/.bkit/providers.md:463`; `docs/decisions.jsonl:199` | `deferrals-1` |
| A grant install wrote earlier is never withdrawn: reconcile deep-merges the consumer's existing keys. | `reconcileOpencodeJson` in `opencode.ts:384-459` | `deferrals-11` (`381-opencode-bash-grants-never-revoked`) |
| Uninstall strips Claude `WebFetch(domain:…)` / `mcp__…` grants by recomputing today's derived set, not by the `claudeAllowDerived` record bkit already keeps. A grant whose domain left `allowed-domains` survives uninstall. | `.bkit/core/engine/commands/install/uninstall.ts:725-745`; `BkitVersion.claudeAllowDerived` in `.bkit/core/engine/install/version-file.ts` | `deferrals-11` (`381-webfetch-grants-survive-uninstall-after-seed-emptied`) |
| Codex classifies `*.pem`, `*.p12` and `id_rsa` shell reads as the `key` kind, then answers the whole `secret` tier with advisory `additionalContext`. `cat ~/.ssh/id_rsa` runs with a note only, while the docs group it with real gates. | `decideShell` in `.bkit/core/.codex/hooks/bkit-guardrails.cjs:60-90`; `secretFileKind` / `shellSecretRead` in `.bkit/core/hooks/guardrails-tiers.js:193-262` | `deferrals-3` |
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

## 👤 ⚠️ Acceptance Scenario

> [!CAUTION]
> 🛑 The owner reads and confirms this section.
> This is the feature's testable contract. The implementation, the tests and the verification all follow from what you confirm here, so a mistake here carries into every later step.
>
> **You only need 👤-marked sections** (Acceptance Scenario, Breaking Changes, Open Questions & Assumptions). The agent handles the rest.

### Narrative

Consumers receive safer host and cloud templates, checks that identify relevant missing or stale adoption and wiring, and concrete remediation advice. bkit stops creating unsafe convenience grants and reports accurately which protections are enforced, advisory, or unverified.

### Success Criteria

- Relevant host and cloud templates provide safe defaults, clear customization points, and specific upgrade instructions. Consumer-owned copies remain consumer-owned.
- Existing check, doctor, tips, and install/upgrade reporting surfaces identify relevant missing adoption, known obsolete unsafe configuration, and missing wiring. Recognize equivalent consumer implementations where verifiable; do not require byte-identical copies or treat every customization as drift. Each advisory names the missing protection, affected file or setting, and exact corrective action.
- Stop automatically generating permissive OpenCode curl/wget substring grants. Review related generated URL permissions for the same unsafe matching assumption. Report legacy entries with uncertain ownership for explicit owner review; preserve unrelated user-authored permissions. Use existing trustworthy ownership evidence for narrow cleanup where available, without introducing a new permission transaction system.
- Resolve the Codex private-key reporting mismatch with a narrow, real-host-verified denial correction where supported, or explicit documentation and advisories that the protection remains unenforced. Keep .env reads advisory. Never claim enforcement from a configured hook, unit test, or adoption check alone.
- Cloud bootstrap guidance exposes the expected allowlist fingerprint and exact refresh steps. Missing or differing available fingerprint evidence produces a warning and continues. Report dashboard configuration as unverified: a copied stamp is an operator assertion, not proof of the deployed allowlist.

### Process Sketch

- **WHEN** a maintainer runs `bkit upgrade` on a consumer with OpenCode **→ THEN** the regenerated `permission.bash` gains no `curl *{domain}*` / `wget *{domain}*` allow, bkit writes only exact `https://{host}` origins into `permission.webfetch`, and each legacy substring entry stays in the file and is listed in the advisories with its exact removal action.
- **WHEN** the maintainer runs `bkit check` with an adopted cloud bootstrap that never reads `BKIT_CLOUD_ALLOWLIST_FINGERPRINT` **→ THEN** an advisory names the stale copy, the missing protection and the template block to copy; a customised copy that reads the variable raises nothing.
- **WHEN** a Claude cloud session starts **→ THEN** the bootstrap compares the fingerprint in `.bkit/allowlist.json` with `BKIT_CLOUD_ALLOWLIST_FINGERPRINT`, reports a match as an operator assertion with the deployed allowlist unverified, and **IF** either value is missing or they differ **→ THEN** it logs a WARNING with the refresh steps and continues.
- **WHEN** a Codex agent runs `cat ~/.ssh/id_rsa` **→ THEN** bkit's Codex hook answers deny without echoing the command, `cat .env` stays advisory, and the docs and `codex-setup` advisory call the deny verified only when a dated real-host result shows it.
- **WHEN** a maintainer runs `bkit uninstall` **→ THEN** Claude grants listed in `claudeAllowDerived` are removed, and **IF** a derived-looking grant is unrecorded, or an OpenCode substring grant remains **→ THEN** it is kept and listed for owner review.

### Concrete Example

**Setup:** A consumer maintainer runs bkit with the OpenCode and Claude hosts and Claude Code on the web. An earlier install left `"curl *github.com*": "allow"` and `"*github.com*": "allow"` in `.opencode/opencode.json`. Their adopted `.claude/hooks/bkit-cloud-bootstrap.sh` predates the fingerprint block, and the cloud environment has no `BKIT_CLOUD_ALLOWLIST_FINGERPRINT`.

**Steps:**

1. Maintainer runs `bkit upgrade` → System writes `.opencode/opencode.json` with `https://github.com` / `https://github.com/*` webfetch allows and no new shell fetch allow. It keeps the two legacy entries, and the upgrade advisories list both under `opencode-substring-fetch-grants`, each with the exact key to delete.
2. Maintainer runs `bkit check` → System reports `cloud-bootstrap-fingerprint-missing`: the adopted bootstrap does not compare the allowlist fingerprint, with the template block to copy and the path of the template.
3. Maintainer deletes the two legacy keys, copies the fingerprint block into their bootstrap, re-pastes the list from `.claude/bkit-cloud.md` § 2 and sets `BKIT_CLOUD_ALLOWLIST_FINGERPRINT` to the stamp printed there → System's next `bkit check` shows neither advisory.
4. A cloud session starts → System's bootstrap logs that the fingerprint matches as an operator assertion, and that the deployed dashboard allowlist is unverified.
5. A Codex agent in the same repo runs `cat ~/.ssh/id_rsa` → System's Codex hook answers deny and names the file, not the command.

**Outcome:** The consumer's OpenCode permissions hold no substring fetch grant, their customised bootstrap warns when the pasted allowlist and the repo diverge, and the docs and advisories state exactly which of these protections are enforced, advisory or unverified on each host.

### Edge Cases

The issue has no Key Edge Cases rows. The plan adds these validation, error and boundary cases.

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| An OpenCode webfetch request to `https://evil.example/?x=github.com`, `https://github.com.attacker.io/` or `https://github.com@evil.example/` | The generated table answers `ask`: no derived allow matches outside the exact origin. |
| An OpenCode shell `curl https://github.com/cli/cli` after upgrade | `ask` from the template's `curl *` row (breaking: no shell fetch is pre-allowed any more). |
| A consumer-authored exact-origin allow such as `"https://api.example.com/*": "allow"`, or any non-`allow` entry | Preserved and not reported. |
| A consumer-authored `"curl *mycorp.com*": "allow"` whose author is unknown | Preserved, and reported for owner review like a bkit-written one, since authorship cannot be told apart. |
| A reported key holds URL credentials or a query string (`curl *https://user:tok@host/?k=v*`) | The advisory redacts the userinfo and query (`https://***@host/?***`) and still names the entry to remove. |
| `.opencode/opencode.json` is absent, unparseable, or has no `permission.bash` / `permission.webfetch` object | The substring detector reports nothing and does not throw. |
| A domain leaves `allowed-domains` after install wrote its `https://{d}` / `https://{d}/*` `webfetch` allows | Residual: upgrade deep-merges, so both allows stay; the substring detector does not report exact-origin keys. The `381-opencode-bash-grants-never-revoked` gap closes for shell keys only (Out of Scope). |
| A consumer-authored `"https://github.com/*": "allow"` whose key equals a derived exact-origin key | Residual: uninstall's `stripOpencodeJsonScope` removes it by recompute, since no per-key record can tell the two authors apart (Out of Scope). |
| Uninstall with a `claudeAllowDerived` grant whose domain has left `allowed-domains` | The grant is removed. |
| A full `bkit uninstall` (no module flags), which deletes `.bkit/version` in the same run | The recorded grants are still removed, because uninstall reads `claudeAllowDerived` before the delete loop. |
| Uninstall with a derived-looking `WebFetch(domain:…)` grant missing from the record, or with no record at all | The grant is kept and listed for owner review with the exact removal action. |
| An uninstall review line for a legacy OpenCode key holding URL credentials or a query string | The line redacts the userinfo and query the same way the advisory does. |
| Codex `cat ~/.ssh/id_rsa`, `cat certs/server.pem`, `openssl x509 -in cert.p12 -noout` | `deny`, and the reason names the file, not the full command. |
| Codex `cat .env ~/.ssh/id_rsa` (an env file and a key in one command) | `deny`: a key-kind path wins over an env-kind path. |
| Codex `cat .env`, `cat ~/.ssh/id_rsa.pub`, `cat .env.example` | Advisory, allow, allow (unchanged). |
| The real Codex session is not run (`not-run`), or Codex does not honour the deny (`not-shown`) | Docs and the `codex-setup` advisory say "configured to deny, not verified on a real Codex host"; nothing calls the protection enforced. |
| Bootstrap with `BKIT_CLOUD_ALLOWLIST_FINGERPRINT` unset | WARNING with the refresh steps, then the session continues and the hook exits 0. |
| Bootstrap with the two fingerprints different | WARNING naming both 8-hex values and the refresh steps; continues. |
| Bootstrap with `.bkit/allowlist.json` missing, lacking `fingerprint`, or `jq` absent | WARNING that the expected fingerprint is unavailable; continues. |
| Bootstrap with `.bkit/allowlist.json` present but not valid JSON | WARNING that the expected fingerprint is unavailable; continues and exits 0 (the `jq` read is guarded under `set -euo pipefail`). |
| Bootstrap with matching fingerprints | Logs "operator-asserted" and "deployed allowlist unverified"; never "verified". |
| `BKIT_CLOUD_ALLOWLIST_FINGERPRINT` holds something other than 8 hex characters (for example, a secret pasted by mistake) | WARNING "not an 8-hex fingerprint" without echoing the value; continues. |
| A customised adopted bootstrap that reads `BKIT_CLOUD_ALLOWLIST_FINGERPRINT` in its own way | No adoption advisory. |
| No adopted bootstrap at all | No fingerprint advisory (the existing cloud tip in `.bkit/core/engine/checks/tips/catalogue.ts` already covers the missing hook). |

### Derived Test Matrix

`Type` is a tier from `docs/testing.md`: Static, Unit, Integration, @live (golden), E2E, fresh-DB replay or Smoke. `Task` is the one runbook task that lands the row's test.

Bats files are Unit: per `docs/testing.md` § Tiers, a Unit test may drive real `bash` / `node` subprocesses against a throwaway folder. The @live row is a manual real-host experiment, outside CI (`tests/experiments/hooks/`), since bkit has no deployed `@live` lane.

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| `deferrals-1`: the rendered OpenCode `permission.bash` holds no `curl *{base}*` / `wget *{base}*` allow for shipped or declared domains | Integration | `.bkit/core/engine/install/modules/opencode.integration.test.ts` | 1 |
| `deferrals-1`: the rendered `permission.webfetch` holds only exact `https://{host}` and `https://{host}/*` allows, and the force-push and permission-map shape assertions still hold | Integration | `.bkit/core/engine/install/modules/opencode.integration.test.ts` | 1 |
| `deferrals-1`: against the rendered table (last match wins), `https://evil.example/?x=github.com`, `https://github.com.attacker.io/` and `https://github.com@evil.example/` ask, and `https://github.com/cli/cli` is allowed | Integration | `.bkit/core/engine/install/modules/index.integration.test.ts` | 1 |
| `deferrals-1`: every derived base reaches the Claude fetch tool, the OpenCode fetch tool (exact origin) and the hook allowlist, and an OpenCode shell `curl` to it asks | Integration | `.bkit/core/engine/install/modules/index.integration.test.ts` | 1 |
| `deferrals-1` / `deferrals-11`: a legacy substring `curl` / `wget` / `webfetch` allow is reported with its key and exact removal action | Unit | `.bkit/core/engine/checks/before/files.test.ts` | 2 |
| `deferrals-11`: exact-origin, non-`allow` and unrelated consumer permission entries are neither reported nor touched | Unit | `.bkit/core/engine/checks/before/files.test.ts` | 2 |
| A reported key with URL credentials or a query string is redacted in the advisory | Unit | `.bkit/core/engine/checks/before/files.test.ts` | 2 |
| The detector never writes `.opencode/opencode.json`, and an absent or unparseable file reports nothing | Unit | `.bkit/core/engine/checks/before/files.test.ts` | 2 |
| `deferrals-11` (`381-opencode-bash-grants-never-revoked`): a real `bkit upgrade` over a legacy file keeps the entries, reports `opencode-substring-fetch-grants`, writes the exact-origin `webfetch` keys through `reconcileOpencodeJson` and adds no new `curl *…*` / `wget *…*` key | Integration | `.bkit/core/engine/commands/install/upgrade.integration.test.ts` | 2 |
| `deferrals-11` (`381-webfetch-grants-survive-uninstall-after-seed-emptied`): uninstall removes a recorded `WebFetch(domain:…)` grant whose domain left `allowed-domains` | Integration | `.bkit/core/engine/commands/install/uninstall.integration.test.ts` | 3 |
| A full `bkit uninstall` (no module flags) after a real install removes a recorded `WebFetch(domain:…)` grant whose domain left `allowed-domains`, although the same run deletes `.bkit/version` | Integration | `.bkit/core/engine/commands/install/uninstall.integration.test.ts` | 3 |
| Uninstall keeps a derived-looking grant missing from `claudeAllowDerived` and lists it for owner review | Integration | `.bkit/core/engine/commands/install/uninstall.integration.test.ts` | 3 |
| Uninstall with no `claudeAllowDerived` record removes no `WebFetch` grant and lists them | Integration | `.bkit/core/engine/commands/install/uninstall.integration.test.ts` | 3 |
| Uninstall leaves legacy OpenCode substring grants in place and lists them for owner review, with URL credentials and query strings redacted | Integration | `.bkit/core/engine/commands/install/uninstall.integration.test.ts` | 3 |
| `deferrals-3`: the rendered Codex hook denies `cat ~/.ssh/id_rsa`, `cat certs/server.pem` and `openssl x509 -in cert.p12 -noout`, while Cursor and Antigravity still ask and `.env` rows stay advisory on Codex | Integration | `.bkit/core/engine/install/modules/index.integration.test.ts` | 4 |
| `deferrals-3`: Codex denies `cat .env ~/.ssh/id_rsa`, because a key-kind path wins over an env-kind path | Integration | `.bkit/core/engine/install/modules/index.integration.test.ts` | 4 |
| The Codex private-key deny reason names the file and does not echo the command | Integration | `.bkit/core/engine/install/modules/index.integration.test.ts` | 4 |
| After the key-first `shellSecretRead` change, the existing `SHELL_SECRET_READS` allow rows (`cat .env.example`, `cat .envrc`, `cp .env.example .env`, `grep -rn ".env" docs`) and the search-pattern row `rg -l "id_rsa" src` keep their verdicts on every host, and `cat ~/.ssh/id_rsa.pub` is allowed on Codex | Integration | `.bkit/core/engine/install/modules/index.integration.test.ts`, `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` (existing rows) | 4 |
| Every Codex hook message, the new private-key deny and the narrowed `.env` advisory included, has a § Hook Text entry in `.bkit/instructions.md`, and every entry is still emitted | Unit | `.bkit/core/engine/tools/instructions-sources.test.ts` (existing test) | 4 |
| `deferrals-3`: a real codex-cli session with the installed project hooks trusted refuses `cat` of a synthetic `id_rsa`; the dated result records `denied`, `not-shown` or `not-run` | @live (golden) | `tests/experiments/hooks/results/{YYYY-MM-DD}/bkit-codex-key-deny.json` (manual, outside CI) | 5 |
| `deferrals-3`: a real `bkit install --codex` prints the `codex-setup` advisory stating the private-key shell-read status Task 5 recorded ("not verified on a real Codex host" unless the result is `denied`) and `.env` shell reads as advisory, each with its corrective action | Integration | `.bkit/core/engine/commands/install/install.integration.test.ts` | 6 |
| `deferrals-11` (`381-cloud-allowlist-staleness-detector`): `.bkit/allowlist.json` records `fingerprint`, the 8-hex stamp of its own `domains` list | Unit | `.bkit/core/engine/install/network-allowlist.test.ts` | 7 |
| The fingerprint moves when `allowed-domains` in `.agents/context.md` changes | Unit | `.bkit/core/engine/install/network-allowlist.test.ts` | 7 |
| The Claude paste section names the same fingerprint as `.bkit/allowlist.json`, the `BKIT_CLOUD_ALLOWLIST_FINGERPRINT` step and that the dashboard list is unverified | Unit | `.bkit/core/engine/install/cloud-env.test.ts` | 7 |
| `deferrals-11`: the bootstrap warns with the refresh steps and exits 0 when `BKIT_CLOUD_ALLOWLIST_FINGERPRINT` is unset | Unit | `tests/shell/bkit-cloud-bootstrap-preflight.bats` | 8 |
| The bootstrap warns naming both fingerprints when they differ, and continues | Unit | `tests/shell/bkit-cloud-bootstrap-preflight.bats` | 8 |
| The bootstrap reports a match as an operator assertion with the deployed allowlist unverified | Unit | `tests/shell/bkit-cloud-bootstrap-preflight.bats` | 8 |
| The bootstrap warns and continues when `.bkit/allowlist.json` has no fingerprint, or `jq` is absent | Unit | `tests/shell/bkit-cloud-bootstrap-preflight.bats` | 8 |
| The bootstrap warns and exits 0 when `.bkit/allowlist.json` is not valid JSON | Unit | `tests/shell/bkit-cloud-bootstrap-preflight.bats` | 8 |
| The bootstrap never echoes a `BKIT_CLOUD_ALLOWLIST_FINGERPRINT` value that is not 8 hex characters | Unit | `tests/shell/bkit-cloud-bootstrap-preflight.bats` | 8 |
| bkit's adopted `.claude/hooks/bkit-cloud-bootstrap.sh` stays byte-identical to the template | Unit | `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` (existing, unchanged) | 8 |
| An adopted bootstrap that never reads `BKIT_CLOUD_ALLOWLIST_FINGERPRINT` is reported with the template block to copy | Unit | `.bkit/core/engine/checks/before/files.test.ts` | 9 |
| A customised bootstrap that reads the variable raises nothing, and no adopted bootstrap raises nothing | Unit | `.bkit/core/engine/checks/before/files.test.ts` | 9 |
| A real `bkit check` on a consumer with a stale adopted bootstrap prints `cloud-bootstrap-fingerprint-missing` | Integration | `.bkit/core/engine/commands/install/check.integration.test.ts` | 9 |
| A real `bkit doctor` on the same consumer lists `cloud-bootstrap-fingerprint-missing` | Integration | `.bkit/core/engine/commands/install/doctor.integration.test.ts` | 9 |
| Mirrors, `dist/` and the docs match the canonical sources; `bkit check` exits 0 on bkit itself with no `opencode-substring-fetch-grants` advisory | Static | `pnpm bkit check`, `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` (T6 mirror parity) | 10 |

### 👤 ✅ Human Confirmation

- [ ] **Acceptance Scenario confirmed:** I have reviewed the Narrative, Success Criteria, Process Sketch, Concrete Example, Edge Cases, and Derived Test Matrix above. They correctly describe what "done" looks like.

---

## 👤 ⚠️ Breaking Changes & Naming Review

> [!CAUTION]
> 🛑 The owner reads and confirms this section.

**Breaking changes:**

<!-- prettier-ignore -->
| Change | Who notices | How |
| --- | --- | --- |
| OpenCode shell `curl` / `wget` to an allowlisted host now asks (no generated `curl *{domain}*` / `wget *{domain}*` allow). | OpenCode users, and the `opencode run` cloud job (see the non-interactive assumption) | A prompt, or a refused call in a non-interactive run, where it ran silently before. The fetch tool stays prompt-free for exact allowlisted origins. |
| OpenCode fetch-tool calls to a subdomain of a declared apex (e.g. `api.vercel.com` under `vercel.com`) now ask. | OpenCode users with declared apexes | Declare the exact host in `.agents/context.md` `allowed-domains` to pre-allow it. This reverses the ACTIVE accepted-risk decision `551-opencode-unanchored-host-allows-accepted-risk`, which kept subdomains prompt-free; confirming this row approves superseding it (Open Question 4). |
| `bkit uninstall` no longer removes Claude `WebFetch(domain:…)` / `mcp__…` grants that the `claudeAllowDerived` record does not list. It lists them for review instead. | Consumers whose `.bkit/version` predates the record | Review lines in the uninstall output. |
| Codex hook answers `deny` on private-key shell reads where it gave a note before. | Codex users and agents | The read is refused, if Codex honours the deny (Task 5). |
| The Claude paste note's "Derived set fingerprint" becomes "Allowlist fingerprint" of the full list, so its value changes. | Operators who copied the old stamp | The bootstrap warns until `BKIT_CLOUD_ALLOWLIST_FINGERPRINT` is set to the new stamp. |
| `.bkit/allowlist.json` gains `fingerprint`. | `bkit check` on every consumer | Reports the file stale until install or upgrade rewrites it, as for any core-owned artifact change. |
| bkit's own `.opencode/opencode.json` loses its legacy substring entries by hand edit. | bkit maintainers only | Confirming this section approves that one hand edit. No consumer file is edited. |

**Names introduced:**

- Advisory ids: `opencode-substring-fetch-grants`, `cloud-bootstrap-fingerprint-missing`.
- Functions: `detectOpencodeSubstringFetchGrants`, `detectCloudBootstrapFingerprintMissing` (in `files.ts`).
- Env var: `BKIT_CLOUD_ALLOWLIST_FINGERPRINT`, operator-set in the Claude cloud environment and not a secret. It carries the `BKIT_` prefix like the other bkit tooling variables.
- JSON field: `fingerprint` in `.bkit/allowlist.json`.
- Experiment files: `bkit-codex-key-deny.json`, `bkit-codex-key-deny-{YYYY-MM-DD}.md`.

### 👤 ✅ Human Confirmation

- [ ] **Breaking Changes confirmed:** I have reviewed every breaking change and naming decision above.

---

## 👤 ⚠️ Open Questions & Assumptions

> [!CAUTION]
> 🛑 The owner reads and confirms this section.
> These are the unknowns and assumptions this plan relies on. An unresolved question is a risk, and a wrong assumption breaks what follows. **If** there are none → write `None`.

The revision's three open questions are answered by lookup in `Context & Goals`. The questions below are the ones this plan raises.

- **Open Question 1:** What does the cloud fingerprint cover? → The owner answers at plan review.
  - **Options:** A) The exact list the Claude dashboard should hold: the `domains` of `.bkit/allowlist.json`, which equal the Claude paste list. The paste note shows this stamp instead of the derived-set stamp. — It moves when the consumer edits `allowed-domains` as well as when bkit's registry changes, so both reasons to re-paste are caught. It replaces the stamp text in the Claude paste note. · B) Keep the existing derived-set stamp (`egressFingerprint()`), shipped hosts only. — No change of meaning, but it never moves on a consumer edit, the commonest stale case.
  - **Recommended:** A) The dashboard holds the full list, so the stamp must describe the full list.
  - **Default if unanswered:** A.
- **Open Question 2:** Do the Cursor and Codex cloud setups get the same fingerprint compare? → The owner answers at plan review.
  - **Options:** A) Docs only: `cloud.md` and the Cursor and Codex paste notes state that the dashboard list is an operator assertion and unverified, and keep their derived-set stamp. — Meets the success criterion, which names the cloud bootstrap guidance, and adds no new setup-script code. · B) Add the compare to the Cursor and Codex setup-script renders too. — Same warning everywhere, but it changes two more generated scripts that have no bats harness today.
  - **Recommended:** A) The Claude SessionStart bootstrap is the only bkit-shipped cloud hook that runs every session.
  - **Default if unanswered:** A. The deferral row `803-cursor-codex-cloud-fingerprint-compare` records B.
- **Open Question 3:** If the real Codex session does not show the deny, does the deny code stay? → Decided by the 2026-11-10 owner comment for the docs. This question covers the code only. Read the comment's sentence "If it can be shown, the denial ships. If not, the limitation is documented and advised" before you answer: read literally, it leans towards option B (no deny on `not-shown` or `not-run`), and the plan recommends A.
  - **Options:** A) Keep the deny in the adapter, and say "configured to deny, not verified on a real Codex host" in the docs and the `codex-setup` advisory. — The deny is harmless where Codex ignores it and real where it honours it, and the docs never claim enforcement. · B) Revert the adapter to advisory. — The docs and the hook agree on "advisory", but a Codex build that honours `deny` loses the protection.
  - **Recommended:** A) The status text, not the code, carries the honesty requirement.
  - **Default if unanswered:** A.
- **Open Question 4:** How narrow are the derived OpenCode `webfetch` allows? → The owner answers at plan review.
  - **Options:** A) Exact origins: `https://{name}` and `https://{name}/*` for each base and each shipped exact host. Subdomains of a declared apex then ask. — Safe with OpenCode's whole-string glob, where `*` crosses `/` `?` `@`. It reverses the ACTIVE decision `551-opencode-unanchored-host-allows-accepted-risk`, which rejected this shape because "every subdomain fetch prompts". · B) Drop the derived `webfetch` allows too. — Every OpenCode fetch-tool call prompts, including context-fetch hosts. · C) Keep `*{base}*`, the shape decision 551 accepted as a risk. — Keeps apex + subdomain parity with Claude, but fails the success criterion on related URL permissions.
  - **Recommended:** A) It keeps the allowlisted origins prompt-free with no glob that matches a name inside another URL. On approval, `@bkit-plan-update` appends a `551-opencode-unanchored-host-allows-accepted-risk` row with `status: "SUPERSEDED"` that names `803-opencode-webfetch-exact-origin`, and adds its key to the `**Ledger rows:**` line.
  - **Default if unanswered:** A.
- **Assumption:** OpenCode matches `permission.webfetch` keys against the full requested URL with `*` → `.*` and last match wins, as `.bkit/core/.bkit/providers.md:463` and `globToRe` / `opencodeVerdict` in `index.integration.test.ts:702-715` model it. → If OpenCode matched differently, an exact-origin allow could miss (more prompts, still safe) or a prefix could match more than intended. The fallback is Open Question 4 option B. Knowledge row `kn-34-opencode-spec-churn-pin-the-probed-version-not-a-naive-ne` says to probe the installed `opencode --version` before relying on config semantics, so Manual Verification Step 2 records the dated result on `opencode v2.1.4`; no CI test runs the real binary.
- **Assumption:** In a non-interactive `opencode run` (the `bkit-cloud.yml` `opencode` job), a shell `curl` / `wget` that now hits `curl *: ask` is refused or stalls rather than running. → If it stalls, cloud OpenCode runs that shell out to fetch slow down until the agent switches to the fetch tool. This is listed under Breaking Changes, and the fetch tool keeps exact-origin allows.
- **Assumption:** No trustworthy per-entry ownership evidence exists for `.opencode/opencode.json` permission keys: `canonicalHashes` hashes the whole file after consumer keys merge in. → If evidence existed, legacy entries could be removed instead of reported. Reporting is still safe.
- **Assumption:** The exact-origin `webfetch` keys keep two lifecycle gaps, accepted as residuals because closing them needs the per-key ownership record the revision declares a non-goal. Upgrade deep-merges, so `https://{d}` / `https://{d}/*` stay after `d` leaves `allowed-domains`. Uninstall removes OpenCode keys by recompute, so a consumer-authored key equal to a derived one is deleted. → If either gap matters to the owner, the deferral `803-opencode-webfetch-exact-origin-never-revoked` carries it; meanwhile `381-opencode-bash-grants-never-revoked` closes for shell keys only, and its close row must say so.
- **Assumption:** `claudeAllowDerived` is trustworthy evidence. `enrichClaudeSettingsAllows` (`.bkit/core/engine/install/modules/claude.ts:239-280`) records the whole needed set, including a row a consumer had already written identically before bkit added it. → Such a row is removed at uninstall, which is what the recompute does today, so this is no regression.
- **Assumption:** Codex delivers `permissionDecision: "deny"` from a project `PreToolUse` hook on its shell tool once the `.codex/` layer is trusted. → If it does not, Task 5 records `not-shown`, and Open Question 3 applies. If no real session can be run, Task 5 records `not-run`, and the docs carry the same "not verified" status.
- **Assumption:** `jq` is present in Claude cloud sessions, because the bootstrap's trust check already uses it. → If absent, the fingerprint block warns that the expected fingerprint is unavailable and continues (Edge Cases).
- **Assumption:** `runPreflight` feeds install, upgrade, `bkit check` and `bkit doctor` (`.bkit/core/engine/commands/install/doctor.ts:13,167`), so both new detectors reach every surface success criterion 2 names with no extra caller; Task 9 asserts the doctor surface once. The cloud tip in `.bkit/core/engine/checks/tips/catalogue.ts:290-306` already covers a missing bootstrap. → If `bkit doctor` filtered `runPreflight` findings, the doctor test in Task 9 would fail and the doctor surface would need its own wiring.

### 👤 ✅ Human Confirmation

- [ ] **Open Questions & Assumptions confirmed:** I have resolved or explicitly accepted every open question and assumption above.

---

## Alternative Approaches & Recommendations

<!-- prettier-ignore -->
| Rejected path | Why |
| --- | --- |
| A curl/wget command parser in an OpenCode `tool.execute.before` plugin (`deferrals-1`'s "blocker lifted" route; the old design's workstream) | A declared non-goal of the 2026-11-03 revision ("No comprehensive curl/wget command parser, new OpenCode enforcement plugin"). Stopping the grant closes the bypass with no parser. |
| Anchored shell globs such as `curl https://{host}/*` | `*` crosses spaces, so `curl https://github.com/x https://evil.example/` still matches. No shell glob pins the host. |
| Remove legacy OpenCode grants that match today's derived bases | Blanket removal of ambiguous historic grants is a declared non-goal, and no per-entry record says bkit wrote them. |
| A per-key ownership record or recovery journal for OpenCode permissions | A declared non-goal ("permission recovery journal, durable transaction/locking subsystem"). |
| Read the deployed cloud allowlist back from the dashboard | A declared non-goal ("dashboard-readback integration"), and no provider exposes it to the session. |
| Deny `.env` shell reads on Codex | The success criterion says "Keep .env reads advisory". |
| A `TEMPLATE_CHANGE_CONSEQUENCES` entry in `template-copies.ts` for the bootstrap | It fires only when bkit refreshes a template copy and compares against the template, so a customised copy reads as drift. A contract detector recognises an equivalent consumer copy. |
| Narrow `enrichClaudeSettingsAllows` so the record never claims a row the consumer had written first | Not needed for any success criterion: uninstall by the record removes no more than the recompute does today (see the `claudeAllowDerived` assumption). |

**Recommendations for a future phase:**

- `secretFileKind` knows `.pem`, `.p12` and `id_rsa` only. Other private-key names (`id_ed25519`, `id_ecdsa`, `*.key`) are a shared-tier change for every script host, and need their own issue.
- If OpenCode documents a host-matching permission key, revisit pre-allowing shell fetches to allowlisted hosts.

## Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| An OpenCode guardrails plugin for the shell-as-edit-channel gate and URL-host matching (`deferrals-11`, row `opencode-has-no-script-hook-so-two-gates-are-inexpressible-there`) | The #803 owner revision of 2026-11-03 (§ Constraints and non-goals) declares "new OpenCode enforcement plugin" out of scope. No success criterion needs it: removing the generated substring allows closes the URL-host bypass, since shell fetches now ask. Deferral row, `reason: scope-declared`. | A future issue, if OpenCode needs the shell-as-edit gate. |
| The fingerprint compare in the Cursor and Codex cloud setup scripts (Open Question 2, option B) | Success criterion 5 names the cloud bootstrap guidance. Docs-only status for Cursor and Codex (option A) meets it. Deferral row `803-cursor-codex-cloud-fingerprint-compare`, `reason: needs-decision`. Under option A the Cursor and Codex paste notes keep a derived-set stamp that ignores consumer `allowed-domains`, so their fingerprint does not describe the full list those dashboards hold; Task 7's `cloud.md` edit says so. | If the owner picks option B at plan review: this plan's runbook, as a new task in Group 4. Otherwise: a follow-up issue for Cursor and Codex cloud setup-script fingerprint parity, which needs its own shell test harness for both generated setup scripts. |
| Revoking exact-origin `webfetch` keys after a domain leaves `allowed-domains`, and telling a consumer-authored exact-origin key from a derived one at uninstall (the part of `381-opencode-bash-grants-never-revoked` this plan leaves) | Both need a per-key ownership record for OpenCode permission keys. The 2026-11-03 revision (§ Constraints and non-goals) declares a "permission recovery journal, durable transaction/locking subsystem" out of scope, and success criterion 3 asks for cleanup only "where available". No success criterion, Acceptance Scenario line or Derived Test Matrix row needs it; Edge Cases list it as a residual. Deferral row `803-opencode-webfetch-exact-origin-never-revoked`, `reason: scope-declared`. | A future issue for an OpenCode permission-key ownership record, if the residual proves costly. |

## Suggested Scope Expansion

Candidates for the owner. None of them is a runbook task.

<!-- prettier-ignore -->
| Candidate | Source | Overlaps | Recommendation |
| --- | --- | --- | --- |
| The `bkit-cloud.yml` OpenCode job never installs repo dependencies | `docs/failures.jsonl` `bkit-cloud-opencode-job-never-installs-repo-deps` (HIGH) | The non-interactive `opencode run` job that Breaking Changes says now meets `curl *: ask` | Keep separate; fix on its own failure row. |
| A unified runtime allowlist artifact for all hosts | `docs/deferrals.jsonl` `381-unified-runtime-allowlist-artifact-all-hosts` (LOW, hard-blocked) | `.bkit/allowlist.json`, which gains `fingerprint` in Task 7 | Keep deferred. |
| A Codex Cloud session-start guard | `docs/deferrals.jsonl` `719-codex-cloud-session-start-guard` (MEDIUM); audit `deferrals-9` | Codex cloud setup, the Open Question 2 surface | Keep deferred, in the `deferrals-9` live-verification issue. |
| One live-verification pass for runs an agent cannot start alone | Audit `deferrals-9` | Task 5, the real Codex session | Needs a design decision: Task 5 could be recorded in that pass's issue as one more run. |
| A per-host hook that wraps raw test runners in the tests lock | Audit `deferrals-16`; `docs/deferrals.jsonl` `724-host-hook-catches-raw-test-runners` | The host guard adapters (`bkit-guardrails.cjs` per host) | Keep deferred; its own issue per the audit. |
| Drop the decorative Cursor `sessionStop` echo hook | Audit `deferrals-19`; `docs/deferrals.jsonl` `pending-drop-decorative-cursor-hooks-json-echo-commands-deferre` | Host hook config | Keep deferred (LOW). |
| Both cloud agent jobs start when both secrets are set | Audit `deferrals-2`; `docs/deferrals.jsonl` `397-dual-agent-same-run-double-ship-when-both-secrets-set` | The `bkit-cloud.yml` OpenCode and Codex jobs | Keep separate; the audit routes it to the #719 follow-up. |
| A tracker MCP fallback for the cloud runner agent jobs | `docs/deferrals.jsonl` `719-runner-tracker-mcp-fallback` (LOW, OPEN), via `related-deferrals.md` | The `bkit-cloud.yml` runner agent jobs that Breaking Changes names for `opencode run` | Keep separate: it is a tracker-auth topic, not a permission one. |
| The session-start nudge wording in the shared hook preflight | `docs/deferrals.jsonl` `700-session-start-nudge-challenge-low-bkit-core-hooks-preflight-rules-sh-6` (LOW, `low-severity`), via `related-deferrals.md` | `.bkit/core/hooks/` shared parts and the host hook mirrors that Task 4 re-renders | Keep separate: a different file and a wording decision. |

`related-failures.md` was truncated to 1 of 9 lines at review, and that line is a CLOSED row (`audit-security-operator-gh-pat-classic-no-expiry-overscoped`); the other failure rows were not screened for overlap.

## Security & Privacy

Checked against `docs/security.md` (§ Untrusted Content & Prompt Injection, § Secrets Management, § Shell Injection, § PII). This plan is itself a security change: it removes a permission bypass (`deferrals-1`) and turns an advisory into a deny (`deferrals-3`).

- [ ] **New API Route** — N/A: no route.
- [ ] **New DB Table/Column** — N/A: no database.
- [ ] **Role-Gated Mutation** — N/A.
- [ ] **User Input** — applies. The detectors read consumer files (`.opencode/opencode.json`, `.claude/hooks/bkit-cloud-bootstrap.sh`) as untrusted data. JSON goes through `readJsonFile` with object-shape guards; an absent or unparseable file yields no finding and no throw. The bootstrap reads `.bkit/allowlist.json` through `jq -r '.fingerprint // empty'`, compares quoted strings with `[ "$a" = "$b" ]`, and never `eval`s either value.
- [ ] **PII** — applies, as sanitized diagnostics (an issue constraint and § PII "NEVER log consumer repo content verbatim"). The substring-grant advisory names each key, since that key is the setting to change, with URL userinfo and query strings redacted. The Codex deny reason names the file, not the command. The bootstrap prints `BKIT_CLOUD_ALLOWLIST_FINGERPRINT` only when it is 8 hex characters, and otherwise says "not an 8-hex fingerprint", so a secret pasted there by mistake is never echoed. The Task 5 evidence uses a synthetic key file and records no transcript, credential or key content.
- [ ] **Redirect URL** — N/A.
- [ ] **Webhook** — N/A.
- [ ] **New Secret/Env Var** — applies: `BKIT_CLOUD_ALLOWLIST_FINGERPRINT` is a non-secret operator-set variable (a hash of a public domain list), documented in `.bkit/core/.bkit/cloud.md`. It does not belong in `.bkit/.env` (§ Secrets Management scope) and needs no secret-manager entry.

## Pre-Flight / Dependencies

### Core

- [ ] **Package Management:** no package is added. `package.json` and `pnpm-lock.yaml` stay unchanged.
- [ ] **Dependency Versions:** `pnpm bkit:deps:outdated` (2026-11-11) lists dev-only minor or major bumps: `oxlint` 1.89.0 → 1.91.0, `oxlint-tsgolint` 7.0.2004 → 7.0.2005, `vitest` / `@vitest/coverage-v8` 5.0.5 → 5.1.0, `@types/node` 24.19.2 → 26.6.6, `vite` 6.4.5 → 8.3.5. None blocks this build. Toolchain: Node v24.16.0, pnpm 10.34.7. Host CLIs: `codex-cli 0.166.0` (the design spike recorded 0.165.0, so Task 5 records the version it runs) and `opencode v2.1.4`. `wget` is not installed locally, so the curl rows carry the shell evidence.
- [ ] **Existing-Solution Search (reuse over duplicate):** the searches are recorded in `Reuse Inventory`.
- [ ] **User Context:** every file this plan names was opened in this session. Task 5 needs the owner, or a builder with an authenticated codex-cli session, to run Codex once in a scratch consumer. No other user information is needed.
- [ ] **Project Context:** `docs/decisions.jsonl` holds the ACTIVE accepted-risk decision `551-opencode-unanchored-host-allows-accepted-risk` (`:199`), which keeps the `*{base}*` OpenCode allows that Task 1 replaces, so this plan proposes to supersede it (Open Question 4); its only fingerprint decision is this plan's `803-cloud-allowlist-fingerprint`. `docs/knowledge.jsonl` holds `kn-34-opencode-spec-churn-pin-the-probed-version-not-a-naive-ne` (probe the installed OpenCode version before relying on config semantics, applied in Manual Verification Step 2) and no Codex deny row that changes this plan. The in-scope `docs/deferrals.jsonl` rows are `381-opencode-curl-glob-substring-bypass`, `codex-read-tier-gates-not-wired-file-read-tool-name-unverified`, `381-cloud-allowlist-staleness-detector`, `381-webfetch-grants-survive-uninstall-after-seed-emptied`, `381-opencode-bash-grants-never-revoked` and `opencode-has-no-script-hook-so-two-gates-are-inexpressible-there`.
- [ ] **Testing & Quality:** tiers follow `docs/testing.md` § Which tier does a behaviour need? and § Tiers. Hook decisions are tested by spawning the rendered hooks (`codexVerdict`), and install, upgrade, uninstall and check are tested through the real CLI against temp consumer repos, with no mocked boundary.
- [ ] **Prerequisite Plans:** None.

### Conditional

- [ ] **Secrets & Env Vars:** `BKIT_CLOUD_ALLOWLIST_FINGERPRINT` is a new operator-set cloud environment variable. It is not a secret (an 8-hex stamp of a public domain list), so it needs no secret store entry or service-account role. It is documented in `.bkit/core/.bkit/cloud.md` and printed by the Claude paste section.
- [ ] **Schema State:** N/A — no database. bkit's `docs/data-schema.md` does not cover `.bkit/allowlist.json`, which gains one field (Data Schema Integration).
- [ ] **Architecture & UI:** no new component kind and no UI. The only new files are a manual experiment's result and report, under `tests/experiments/`, which `docs/architecture.md` places as "Manual experiments, outside the normal CI test suites". Every new test extends an existing test file.
- [ ] **Observability:** the bootstrap uses its existing `log` helper (stderr, `[cloud-bootstrap]` prefix). The detectors use the existing `PreflightFinding` advisory channel. No new log name, audit table or trace.
- [ ] **Notifications:** N/A — no alert or toast.

### 🔒 Gate 1: Prerequisites Check

- [ ] **Acceptance Scenario confirmed:** the `👤 ⚠️ Acceptance Scenario` checkbox is `[x]`, ticked by a human.
- [ ] **Breaking Changes confirmed:** the `👤 ⚠️ Breaking Changes & Naming Review` checkbox is `[x]`, ticked by a human.
- [ ] **Open Questions confirmed:** the `👤 ⚠️ Open Questions & Assumptions` checkbox is `[x]`, ticked by a human.
- [ ] **Security & Privacy checked:** every applicable row is verified, or `None` is justified.
- [ ] **Reuse Inventory complete:** every capability has a row with `Search performed` and `Decision` filled in.
- [ ] **Reuse reasons:** every `NEW` row cites its reason.
- [ ] **Gate 1 — Verified:** every item above, every Core item and every applicable Conditional item is checked.

## Data Schema Integration

No database. The plan changes one committed install artifact: `.bkit/allowlist.json` gains a `fingerprint` field beside `domains`. Every reader keeps working: the hooks read `doc.domains` only (`.bkit/core/hooks/guardrails-shell.js:246`), and the parity test reads `.domains`. `.bkit/allowlist.json` is install-written, so `bkit check` reports a stale copy until install or upgrade rewrites it. bkit's own `docs/data-schema.md` does not describe this file, so it needs no change.

### Data Schema Usage

None — no database tables. File inputs read: `claudeAllowDerived` in `.bkit/version`, `permission.bash` / `permission.webfetch` in `.opencode/opencode.json`, and `domains` in `.bkit/allowlist.json`.

### Data Schema Changes

None — no database tables. File shape change: `.bkit/allowlist.json` `{ domains }` → `{ domains, fingerprint }`.

## Reuse Inventory

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| Stop OpenCode shell fetch grants; exact-origin `webfetch` allows | `.bkit/core/engine/install/modules/opencode.ts` | `grep -n -e 'curl' -e 'WebFetch(' -e 'Shell('` over `cloud-env.ts` and `install/modules/*.ts`; read `injectOpencodeDerivedAllows`, `renderOpencodeJson`, `reconcileOpencodeJson`; OpenCode glob semantics in `providers.md:463` | `injectOpencodeDerivedAllows` — the one generator of both grant kinds | EXTEND | Drop the `bash` loop; emit `https://{name}` and `https://{name}/*` in the `webfetch` loop from `networkAllowlistBases(...)` ∪ `BKIT_SHIPPED_NETWORK_HOSTS`. |
| Report legacy substring grants with their exact removal action | `.bkit/core/engine/checks/before/files.ts` | `grep -n 'export function detect' files.ts`; read `runPreflight` wiring in `checks/before/index.ts:90-175`; read `template-copies.ts`; `git grep -n derived-grants-pruned` | `detectPlaywrightReporterHostile`-style `PreflightFinding` detectors in `files.ts`; `runPreflight` already feeds install, upgrade and `bkit check` | EXTEND | Add `detectOpencodeSubstringFetchGrants` beside the other file detectors and wire it in `runPreflight`. |
| Redact URL credentials and query strings in a reported key | `.bkit/core/engine/checks/before/files.ts` | `git grep -n -i -e 'function redact' -e 'userinfo' -e 'stripCredentials'` over engine and hooks | `redact` in `.bkit/core/engine/commands/workflow/tracker.ts:102` — replaces configured env secret values, not URL parts; `guardrails-shell.js:271` strips userinfo only to parse a host | EXTEND | A `redactUrlParts` helper in `files.ts`, exported beside the key matcher, because it has two callers: the detector and the uninstall review lines (`uninstall.ts`, Task 3). Widening `redact` would change the `TrackerError` text its callers emit (`tracker.ts:96`, `:1601`, `issues.ts:712`). |
| Strip Claude derived grants by recorded evidence at uninstall | `.bkit/core/engine/commands/install/uninstall.ts` | read `uninstall.ts:715-760`; `readBkitVersion` / `claudeAllowDerived` in `version-file.ts`; `enrichClaudeSettingsAllows` in `claude.ts:239` | the `.claude/settings.json` branch that recomputes `resolveClaudeDerivedAllows`; the `claudeAllowDerived` record | EXTEND | Read `claudeAllowDerived` once before the decision-table loop, beside `canonicalHashes`, and fold the recorded rows instead of the recomputed ones; list unrecorded derived-looking grants and legacy OpenCode substring grants (reusing Task 2's matcher and `redactUrlParts`) for owner review. |
| Deny Codex private-key shell reads | `.bkit/core/.codex/hooks/bkit-guardrails.cjs` | read `decideShell`; `secretFileKind`, `shellSecretRead`, `classifyShell` in `guardrails-tiers.js:193-281`; `classifyRead` in `guardrails-read.js` | the `secret` case of `decideShell`; `secretFileKind` already returns `key` | EXTEND | Branch on `secretFileKind(v.path) === "key"` → `deny`; keep the advisory for `env`. Register the new deny message and the narrowed advisory in `.bkit/instructions.md` § Hook Text, which `instructions-sources.test.ts` holds every `HOOK_SOURCES` message to. |
| A key-kind path wins over an env-kind path in one command | `.bkit/core/hooks/guardrails-tiers.js` | read `shellSecretRead:234-262` (returns the first secret path) | `shellSecretRead` | EXTEND | Scan every word and return a `key` path ahead of an `env` path. Cursor and Antigravity still ask for both kinds, so only the named path in their reason changes. |
| State the Codex key-read protection status and corrective action | `.bkit/core/engine/install/modules/codex.ts` | read the `codex-setup` advisory at `codex.ts:211-221`; `git grep -l codex-setup -- '*.test.ts'` (empty) | the `codex-setup` advisory | EXTEND | Add a fourth item: private-key shell reads configured to deny, not verified on a real Codex host; `.env` shell reads advisory, use direnv. |
| Real-host evidence for the Codex deny | `tests/experiments/hooks/results/{YYYY-MM-DD}/bkit-codex-key-deny.json` | `ls tests/experiments/hooks/` and `results/`; read `bkit-hook-probe.md` | `bkit-hook-probe.mjs` and its dated `results/` + `reports/` layout | NEW | Reason (b): the probe kit's contract is "does not launch an agent ... or modify production hooks" (`bkit-hook-probe.md`), and its caller `bkit-hook-probe.test.mjs` validates only the collector. This run installs the production hook, so it gets its own result beside the probe's, in the same dated layout. |
| Report of the real-host Codex run | `tests/experiments/hooks/reports/bkit-codex-key-deny-{YYYY-MM-DD}.md` | same as above | `reports/bkit-hook-probe-report-2026-11-03.md` (probe-kit report) | NEW | Reason (b), the same probe-kit contract: that report covers the synthetic advisory probe, not a production-hook deny. |
| Fingerprint of the exact paste list | `.bkit/core/engine/install/cloud-env.ts` | `git grep -n -e egressFingerprint -e 'Derived set fingerprint'`; read `cloud-env.ts:640-712`, `:905-945` | `egressFingerprint()` — derived set only; callers `renderCloudNetworkAllowlist:706`, `renderWidenedNetworkList:935` | EXTEND | Optional `entries` parameter; with none it keeps the derived set, so the Cursor and Codex callers are unchanged. |
| Expected fingerprint available in a cloud clone | `.bkit/core/engine/install/network-allowlist.ts` | read `renderNetworkAllowlist` / `writeNetworkAllowlist`; reader `guardrails-shell.js:246` | `.bkit/allowlist.json` — committed, core-owned, written by install and upgrade | EXTEND | Write `{ domains, fingerprint }`, with `fingerprint = egressFingerprint(domains)`. |
| Paste guidance names the stamp and the env-var step | `.bkit/core/engine/install/cloud-env.ts` | read `renderCloudNetworkAllowlist`, `renderCloudEnvBlock` (shared by Claude, Cursor and Codex docs) | `renderCloudNetworkAllowlist` count note | EXTEND | Print "Allowlist fingerprint" of the paste list plus the step to set `BKIT_CLOUD_ALLOWLIST_FINGERPRINT`. `renderCloudEnvBlock` stays unchanged because the Cursor and Codex docs share it. |
| Bootstrap compares and warns | `.bkit/templates/.claude/hooks/bkit-cloud-bootstrap.sh` | `git grep -n -i fingerprint` on the template (no hit); read lines 1-40 and 140-186 | the template's baseline section and its `log` helper | EXTEND | Add a fingerprint block to the baseline section; mirror it byte-for-byte into bkit's adopted `.claude/hooks/bkit-cloud-bootstrap.sh`. |
| Detect an adopted bootstrap without the compare | `.bkit/core/engine/checks/before/files.ts` | read `tips/catalogue.ts:290-306` (fires on a missing hook only); `template-copies.ts` | `runPreflight` detectors; the cloud tip | EXTEND | Add `detectCloudBootstrapFingerprintMissing`, matching the env-var name, never byte identity. |
| Manual recipe for the Codex real-host run | `docs/testing.md` | read § OpenCode host test coverage and § Manual recipe — OpenCode E2E (`:844-870`) | § Manual recipe — OpenCode E2E | EXTEND | Add § Manual recipe — Codex key-read deny in the same shape. |

## Architecture & Component Changes

Derived from `Reuse Inventory`. Every change extends an existing file. The only new files are the Task 5 experiment result and report.

**Ledger rows:** `803-opencode-stop-shell-fetch-grants`, `803-opencode-webfetch-exact-origin`, `803-legacy-fetch-grants-report-only`, `803-uninstall-strips-by-claude-record`, `803-codex-key-shell-read-deny`, `803-cloud-allowlist-fingerprint`, `803-adoption-detectors-in-preflight`, `opencode-has-no-script-hook-so-two-gates-are-inexpressible-there`, `803-cursor-codex-cloud-fingerprint-compare`, `803-opencode-webfetch-exact-origin-never-revoked`

### Database Migrations

None — no database.

### Install engine — generated permissions

#### [MODIFY] `.bkit/core/engine/install/modules/opencode.ts`

- **Existence Check:** exists; `injectOpencodeDerivedAllows` at `:348-369`, called by `renderOpencodeJson` (`:250`) and reconcile (`:384-459`, called from `upgrade.ts:842`).
- Remove the `permission.bash` loop that writes `curl *${base}*` / `wget *${base}*` (Supersession Inventory row 1, `DELETE`).
- Replace `webfetch[`*${base}*`]` (Supersession Inventory row 2, `DELETE`) with `webfetch[`https://${name}`]` and `webfetch[`https://${name}/*`]` = `"allow"` for each `name` in the sorted union of `networkAllowlistBases(resolveNetworkAllowlist(cwd))` and `BKIT_SHIPPED_NETWORK_HOSTS`.
- Rewrite the doc comments at `:245-246` and `:340-347` to the new key shapes.
- Reconcile still deep-merges existing keys, so legacy entries stay. The detector reports them (`803-legacy-fetch-grants-report-only`).

#### [MODIFY] `.bkit/core/engine/install/cloud-env.ts`

- **Existence Check:** exists; `egressFingerprint` at `:655`, `renderCloudNetworkAllowlist` at `:687`, `renderWidenedNetworkList` at `:915`.
- `egressFingerprint(entries?: readonly string[])`: with `entries`, it hashes `[...new Set(entries)].sort()`; without, it keeps today's derived set, so `renderWidenedNetworkList` (Cursor, Codex) is unchanged.
- `renderCloudNetworkAllowlist` replaces ". Derived set fingerprint `…`" (Supersession Inventory row 4, `DELETE`) with ". Allowlist fingerprint `{egressFingerprint(domains)}`", then adds a numbered step: set `BKIT_CLOUD_ALLOWLIST_FINGERPRINT={fp}` in the environment's variables, and re-paste and reset it whenever the stamp changes. It also adds one sentence: the stamp you set is your assertion of what the dashboard holds, and bkit cannot read the dashboard back.

#### [MODIFY] `.bkit/core/engine/install/network-allowlist.ts`

- **Existence Check:** exists; `renderNetworkAllowlist` at `:20`.
- Body becomes `{ domains, fingerprint }` with `fingerprint = egressFingerprint(domains)`. Update the header comment and the `renderNetworkAllowlist` doc comment.

#### [MODIFY] `.bkit/core/engine/install/modules/codex.ts`

- **Existence Check:** exists; `codex-setup` advisory at `:211-221`.
- "Three things" → "Four things", adding item 4: "PRIVATE-KEY SHELL READS are configured to deny (`*.pem`, `*.p12`, `id_rsa`), not verified on a real Codex host — see .bkit/providers.md § Guardrails. `.env` shell reads stay advisory: load env through direnv (`.envrc`) instead of reading the file." Task 6 writes it, and the status phrase becomes "denied (verified on codex-cli {version}, {date})" only when Task 5 recorded `denied`.

### Install engine — uninstall

#### [MODIFY] `.bkit/core/engine/commands/install/uninstall.ts`

- **Existence Check:** exists; the `.claude/settings.json` branch at `:725-745`; `stripOpencodeJsonScope` at `:150`; `canonicalHashes` read before the decision-table loop at `:430-431`; `.bkit/version` deleted inside that loop on a full or core uninstall (`:497-511`), and core's `.bkit/version` (`manifest.ts:129`) comes before `.claude/settings.json` (`manifest.ts:165`).
- Read `const claudeAllowDerived = readBkitVersion(versionFilePath)?.claudeAllowDerived ?? []` once beside `canonicalHashes`, before the loop, so a full `bkit uninstall` that deletes `.bkit/version` mid-loop still strips by the record. Pass it into the `.claude/settings.json` strip.
- Replace `resolveClaudeDerivedAllows(ctx.cwd)` in that strip with the pre-read `claudeAllowDerived` (Supersession Inventory row 3, `DELETE`).
- After the strip, log one review line per remaining `WebFetch(domain:…)` / `mcp__…` row that `resolveClaudeDerivedAllows(ctx.cwd)` would produce but the record lacks. Each line names the file, the row and "remove it by hand if bkit added it". Use `ctx.logPrefix`.
- For `.opencode/opencode.json`, run the Task 2 key matcher on the stripped document and log one review line per legacy substring grant with its removal action, each key passed through the exported `redactUrlParts`.

### Shared guards and host adapters

#### [MODIFY] `.bkit/core/hooks/guardrails-tiers.js`

- **Existence Check:** exists; `shellSecretRead` at `:234-262`.
- Keep scanning after the first secret part. Return the first `key`-kind part when one exists, else the first `env`-kind part. `classifyShell` and the return shape `{ tier: "secret", path }` are unchanged.

#### [MODIFY] `.bkit/core/.codex/hooks/bkit-guardrails.cjs`

- **Existence Check:** exists; `decideShell` at `:60-90`; the managed block splices `guardrails-shell.js` and `guardrails-tiers.js`, so `secretFileKind` is in scope.
- `case "secret"`: `secretFileKind(v.path) === "key"` → `deny("Blocked by bkit Codex guardrails: reading ${v.path} would expose private-key material. Use ssh-agent or your secret manager instead of reading the key file.")`, with no `Command:` echo (Supersession Inventory row 5, `DELETE`). `env` → the current advisory, with its file description narrowed from "an env, secrets or private-key file" to "an env or secrets file", since key-kind paths no longer reach it.

#### [MODIFY] `.bkit/instructions.md`

- **Existence Check:** exists; § Hook Text Codex entries at `:8888-8937`, among them `guardrails-codex-secret-shell` (`:8916-8925`). `instructions-sources.test.ts:241-244` (`every hook message has an entry and every entry is still emitted`) checks every message a `HOOK_SOURCES` file (`instructions-sources.ts:304-314`) emits, the Codex guardrails hook included. Hook text is fixed by hand (`instructions-sources.ts:9`): no sync or upgrade writes it.
- Add `### guardrails-codex-key-shell-deny` (hook Guardrails; fires on a shell read of a private-key file; hosts Codex; source `.bkit/core/.codex/hooks/bkit-guardrails.cjs` `decideShell`) with the exact deny text.
- Narrow `guardrails-codex-secret-shell`: `fires` becomes a shell read of an env or secrets file, and its text block matches the narrowed advisory.

#### [MODIFY] host mirrors (rendered, not hand-edited)

- `.codex/hooks/bkit-guardrails.cjs`, `.cursor/hooks/bkit-guardrails.cjs`, `.agents/plugins/bkit/hooks/bkit-guardrails.cjs`: re-rendered by `pnpm tsx .bkit/core/engine/cli.ts upgrade` (T6 parity in `guardrails-cursor.integration.test.ts:228-236`).
- `dist/`: rebuilt by `pnpm build` and staged (`git add dist/`) in every task that edits a non-test `.bkit/core/engine/**/*.ts` file (Tasks 1, 2, 3, 6, 7, 9), because `.husky/pre-commit:18-23` runs `pnpm bkit:check:dist` on such a commit and refuses a stale `dist/` (`.agents/rules.md` § Engine builds).

### Checks — preflight detectors

#### [MODIFY] `.bkit/core/engine/checks/before/files.ts`

- **Existence Check:** exists; detectors such as `detectPlaywrightReporterHostile` at `:84`.
- `detectOpencodeSubstringFetchGrants(cwd)`: reads `.opencode/opencode.json` with `readJsonFile`. Returns null when the file is absent or unparseable, or when neither map is an object. Matches `permission.bash` keys `^(curl|wget) \*[^*\s]+\*$` and `permission.webfetch` keys `^\*[^*]+\*$` whose value is `"allow"`. Returns `{ id: "opencode-substring-fetch-grants", severity: "advisory", detect, action }`:
  - `detect` names the missing protection (the host is not pinned, so any URL containing the name is allowed) and lists each redacted key.
  - `action` says to delete each listed key from `permission.bash` / `permission.webfetch` in `.opencode/opencode.json`, that bkit no longer writes them and will not remove them because it cannot tell who added them, and that allowlisted fetch-tool origins are now written as `https://{host}/*`.
  - It exports the key matcher for `uninstall.ts`.
- An exported `redactUrlParts(key)` replaces URL userinfo with `***@` and everything after `?` with `?***`. Its callers are the detector and the uninstall review lines.
- `detectCloudBootstrapFingerprintMissing(cwd)`: when `.claude/hooks/bkit-cloud-bootstrap.sh` exists and its text never names `BKIT_CLOUD_ALLOWLIST_FINGERPRINT`, it returns `{ id: "cloud-bootstrap-fingerprint-missing", severity: "advisory", ... }`:
  - `detect` names the file and the missing protection (no warning when the pasted cloud allowlist and the repo diverge).
  - `action` says to copy the fingerprint block from `.bkit/templates/.claude/hooks/bkit-cloud-bootstrap.sh` into the adopted copy, then set `BKIT_CLOUD_ALLOWLIST_FINGERPRINT` per `.claude/bkit-cloud.md` § 2.

#### [MODIFY] `.bkit/core/engine/checks/before/index.ts`

- **Existence Check:** exists; `runPreflight` at `:90`.
- Import both detectors and push their findings beside `detectPlaywrightReporterHostile`.

### Cloud template

#### [MODIFY] `.bkit/templates/.claude/hooks/bkit-cloud-bootstrap.sh`

- **Existence Check:** exists (186 lines); copy-and-own; `log` helper at `:30`.
- Add a block to the baseline section, after provisioning and before the `.bkit/.unavailable` stdout:
  - It reads `expected=$(jq -r '.fingerprint // empty' .bkit/allowlist.json 2>/dev/null || printf '')` when `jq` and the file exist. The `|| printf ''` guard follows the trust check at `:48-51`: the hook runs under `set -euo pipefail` (`:22`), so an unguarded `jq` failure on malformed JSON would end the hook non-zero before its `.bkit/.unavailable` stdout notice. A malformed file therefore takes the "expected fingerprint is unavailable" branch.
  - Unset `BKIT_CLOUD_ALLOWLIST_FINGERPRINT`, or no expected value → `log "WARNING: …"` with the refresh steps: run `bkit upgrade` locally, re-paste the Allowed domains list from `.claude/bkit-cloud.md` § 2, and set `BKIT_CLOUD_ALLOWLIST_FINGERPRINT` to the stamp printed there.
  - Different values → WARNING naming both 8-hex values and the same steps.
  - Equal → `log "allowlist fingerprint {fp} matches BKIT_CLOUD_ALLOWLIST_FINGERPRINT (operator-asserted; the deployed allowlist is unverified)"`.
  - No branch exits non-zero.
- The header comment gains one customisation line: keep the `BKIT_CLOUD_ALLOWLIST_FINGERPRINT` compare if you rewrite this section, since `bkit check` looks for it.

#### [MODIFY] `.claude/hooks/bkit-cloud-bootstrap.sh`

- **Existence Check:** exists; bkit's adopted copy, byte-identical to the template per `.bkit/core/engine/audits/repo/dogfood-templates.test.ts:72`.
- The same block, byte-for-byte.

### bkit's own install artifacts

#### [MODIFY] `.bkit/allowlist.json`

- Regenerated by `pnpm tsx .bkit/core/engine/cli.ts upgrade` with the `fingerprint` field.

#### [MODIFY] `.opencode/opencode.json`

- Regenerated by the same upgrade with exact-origin `webfetch` keys. The legacy `curl *{domain}*` / `wget *{domain}*` / `*{domain}*` entries in bkit's own copy are deleted by hand per the new advisory. This is the owner's approval for bkit's own file, given in `Breaking Changes`; no consumer file is rewritten.

### Experiment evidence

#### [NEW] `tests/experiments/hooks/results/{YYYY-MM-DD}/bkit-codex-key-deny.json`

- **Reuse Check:** `Reuse Inventory` row "Real-host evidence for the Codex deny", reason (b).
- `{ host: "codex", cliVersion, date, command: "cat <synthetic>/id_rsa", outcome: "denied" | "not-shown" | "not-run", observed, reason }`. `not-shown` = Codex ran the read despite the deny; `not-run` = no real session could be run, and `reason` says why. Synthetic key only; no secret value, model transcript or credential.

#### [NEW] `tests/experiments/hooks/reports/bkit-codex-key-deny-{YYYY-MM-DD}.md`

- **Reuse Check:** `Reuse Inventory` row "Report of the real-host Codex run", reason (b).
- The setup (scratch consumer outside the checkout, `node dist/cli.js install --codex`, trusted `.codex/` layer), the observed outcome and the doc status it sets.

### Docs

Listed under `Documentation Updates`. The host mirrors of `.bkit/core/.bkit/*.md` (`.bkit/providers.md`, `.bkit/cloud.md`, `.bkit/templates.md`, `.bkit/workflows.md`, `.bkit/prompts.md`) are re-rendered by the upgrade.

#### [MODIFY] `docs/testing.md`

- **Existence Check:** exists; § Runtime detection + gh-preflight test coverage at `:652`, § OpenCode host test coverage at `:844` and § Manual recipe — OpenCode E2E at `:857` all sit below `<!-- bkit:end -->` at `:553`, so the edits stay outside the managed block.
- Reuse: `Reuse Inventory` row "Manual recipe for the Codex real-host run", `EXTEND`.
- Task 5 adds § Manual recipe — Codex key-read deny after § Manual recipe — OpenCode E2E, in the same shape.
- Task 10 adds § OpenCode host test coverage rows for the exact-origin `webfetch` and the substring-grant detector, and § Runtime detection + gh-preflight test coverage text for the fingerprint cases in `tests/shell/bkit-cloud-bootstrap-preflight.bats`.

### Cron Jobs & Scheduled Tasks

None.

## Supersession Inventory

There are no `[DELETE]` files. The replaced artifacts are code paths and generated text inside files that stay, so each `DELETE` row is mirrored by a sentence in its file's `[MODIFY]` entry that names the row (rows 1 and 2 in `opencode.ts`, row 3 in `uninstall.ts`, row 4 in `cloud-env.ts`, row 5 in `bkit-guardrails.cjs`).

<!-- prettier-ignore -->
| Existing artifact | Replaced by | Decision | Justification |
| --- | --- | --- | --- |
| The `permission.bash` `curl *{base}*` / `wget *{base}*` generator loop in `injectOpencodeDerivedAllows` (`opencode.ts:355-361`) | Nothing: the template's `curl *` / `wget *` ask applies | DELETE | The loop is the `deferrals-1` bypass. Removed in Task 1. |
| `webfetch["*{base}*"]` in `injectOpencodeDerivedAllows` (`opencode.ts:363-368`) | `webfetch["https://{name}"]` / `["https://{name}/*"]` | DELETE | Same substring flaw. Removed in Task 1. |
| The `resolveClaudeDerivedAllows` recompute in uninstall's `.claude/settings.json` branch (`uninstall.ts:738-744`) | The `claudeAllowDerived` record | DELETE | Recomputation is the `deferrals-11` gap (`381-webfetch-grants-survive-uninstall-after-seed-emptied`). Removed in Task 3. |
| The "Derived set fingerprint" stamp in `renderCloudNetworkAllowlist` (`cloud-env.ts:706-708`) | "Allowlist fingerprint" of the paste list | DELETE | Two stamps on one list would confuse operators. The derived-set stamp stays in `renderWidenedNetworkList` for Cursor and Codex, which this plan does not supersede. Removed in Task 7. |
| The advisory `ask(...)` for key-kind paths in Codex `decideShell` (`bkit-guardrails.cjs:76-79`) | `deny(...)` for `key`; `ask` kept for `env` | DELETE | Removed in Task 4. |
| Legacy substring entries already written to consumer `.opencode/opencode.json` files | The `opencode-substring-fetch-grants` advisory | RETAIN-WITH-REASON | (a) External contract: these lines live in consumer-owned files that bkit cannot attribute, and the revision forbids blanket removal without owner approval. Each consumer removes them on the advisory; bkit's own copy is cleaned in Task 10. |

## Documentation Updates

<!-- prettier-ignore -->
| Doc | Change required |
| --- | --- |
| `docs/knowledge.jsonl` | No row from planning. A build agent adds one if Task 5 finds a Codex deny behaviour worth keeping (for example, deny ignored on a named codex-cli version). |
| `docs/decisions.jsonl` | The seven `803-*` decision rows listed on the `Ledger rows` line (written; `803-opencode-webfetch-exact-origin` rewritten at plan review to name decision 551). On approval of Open Question 4, a `551-opencode-unanchored-host-allows-accepted-risk` row with `status: "SUPERSEDED"`. |
| `.bkit/instructions.md` | § Hook Text: a new `guardrails-codex-key-shell-deny` entry and the narrowed `guardrails-codex-secret-shell` entry. Task 4. |
| `.bkit/core/.bkit/prompts.md` | § Hook-injected text, Guardrails row (`:435`): Codex `.env` shell reads stay advisory, and Codex private-key shell reads are denied with the Task 5 status phrase. Task 6. |
| `docs/architecture.md` | No change: no new component kind, and the new files sit under `tests/experiments/`, which it already places. |
| `docs/technology.md` | No change: no new library or convention. |
| `docs/data-schema.md` | No change: no database. |
| `docs/design.md` | No change: no UI. |
| `docs/testing.md` | Add § Manual recipe — Codex key-read deny (Task 5). Add rows to § OpenCode host test coverage for the exact-origin `webfetch` and the substring-grant detector, and to § Runtime detection + gh-preflight test coverage for the fingerprint cases in `tests/shell/bkit-cloud-bootstrap-preflight.bats` (Task 10). |
| `docs/observability.md` | No change: no new log name. The bootstrap uses its existing `[cloud-bootstrap]` stderr prefix. |
| `.bkit/core/.bkit/providers.md` | § Guardrails "Secret files" row (`:271`): Codex denies private-key shell reads (status per the Task 5 result, written in Task 6), `.env` advisory. § Permissions Network fetch cells (`:438-441`) and § Network allowlist OpenCode row (`:463`): no shell allow, exact-origin `webfetch`, legacy entries reported, the accepted-risk sentence removed. Shared parts table (`:307-308`): `shellSecretRead` key-first. § Network allowlist OpenCode row: legacy entries reported (Task 2). Claude row (`:476`): uninstall strips by `claudeAllowDerived` (Task 3). Tasks 1, 2, 3 and 6. |
| `.bkit/core/.bkit/cloud.md` | § In-repo side (`:103`) and § Network access (`:116-126`): the fingerprint in `.bkit/allowlist.json`, the `BKIT_CLOUD_ALLOWLIST_FINGERPRINT` step, the bootstrap's warning, that every cloud's dashboard list (Claude, Cursor, Codex) is an operator assertion, unverified, and that the Cursor and Codex paste-note stamp is the derived set only, so it ignores consumer `allowed-domains`. Task 7. |
| `.bkit/core/.bkit/templates.md` | Contract row for the cloud SessionStart hook (`:79`): the fingerprint compare and the `cloud-bootstrap-fingerprint-missing` advisory. Task 9. |
| `.bkit/core/.bkit/workflows.md` | `:1437`: drop the stale `curl https://{host}/*` claim for OpenCode and say shell fetches ask. Task 1. |
| `.bkit/shared/.claude/bkit-cloud.md` | No template text change: § 2 renders through `@@CLOUD_NETWORK_ALLOWLIST@@`, which Task 7 extends. |
| Host mirrors (`.bkit/providers.md`, `.bkit/cloud.md`, `.bkit/templates.md`, `.bkit/workflows.md`, `.bkit/prompts.md`) | Re-rendered by `pnpm tsx .bkit/core/engine/cli.ts upgrade`. Task 10. |
| Cron / scheduled-jobs doc | No change: no scheduled task. |

## Rollback Strategy

<!-- prettier-ignore -->
| Axis | Action | Notes |
| --- | --- | --- |
| **DB** | None | No database. |
| **Code** | `git revert {COMMIT}` of the build commits, then `pnpm build` and `pnpm tsx .bkit/core/engine/cli.ts upgrade` to re-render mirrors and `.bkit/allowlist.json` | A consumer that upgraded keeps the new `fingerprint` field until its next upgrade on the reverted version. Readers ignore the extra field. |
| **Risk window** | None | No migration or deploy sequencing. |

Code-only — `git revert` sufficient.

## Agent Execution Runbook

Build order: generated permissions first (they feed the detectors), then uninstall, then the Codex guard, then the cloud fingerprint, then mirrors and bkit's own copies. Every task names the audit finding ids it closes. Every task that edits a non-test `.bkit/core/engine/**/*.ts` file rebuilds and stages `dist/` (`pnpm build && git add dist/`) in its own change, because the pre-commit hook refuses a commit with a stale `dist/`, and a test that runs `dist/cli.js` needs the build too. Mirrors re-render with `pnpm tsx .bkit/core/engine/cli.ts upgrade`. **Integration shape (advice only):** one PR for all ten tasks is fine.

<!-- bkit:group 1 start -->

### TASK GROUP 1: OpenCode generated fetch grants (`deferrals-1`, `deferrals-11`)

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** Stop the OpenCode shell fetch grants and pin fetch-tool allows to exact origins (`deferrals-1`; `deferrals-11` row `381-opencode-bash-grants-never-revoked`)
  - **UPDATE:** `injectOpencodeDerivedAllows` in `.bkit/core/engine/install/modules/opencode.ts`: drop the `permission.bash` `curl *${base}*` / `wget *${base}*` loop; write `https://{name}` and `https://{name}/*` = `allow` into `permission.webfetch` for each name in `networkAllowlistBases(resolveNetworkAllowlist(cwd))` ∪ `BKIT_SHIPPED_NETWORK_HOSTS`; rewrite the doc comments at `:245-246` and `:340-347`
  - **READ:** `networkAllowlistBases` in `.bkit/core/engine/install/cloud-env.ts`: the apex bases
  - **READ:** `resolveNetworkAllowlist` in `.bkit/core/engine/install/cloud-env.ts`: shipped ∪ declared domains
  - **READ:** `BKIT_SHIPPED_NETWORK_HOSTS` in `.bkit/core/engine/install/cloud-env.ts`: the shipped exact hosts
  - **UPDATE:** `.bkit/core/engine/install/modules/opencode.integration.test.ts`: the curl / webfetch assertions of the tests at `:448` and `:541`
  - **UPDATE:** `.bkit/core/engine/install/modules/index.integration.test.ts`: the parity test at `:1187` and the comments at `:961` and `:974-978`; add the exact-origin test, built on `globToRe` with last-match-wins over the rendered `webfetch` table
  - **UPDATE:** `.bkit/core/.bkit/providers.md`: § Permissions Network fetch cells (`:438-441`) and § Network allowlist OpenCode row (`:463`) — no shell allow, exact-origin `webfetch`, accepted-risk sentence removed
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: `:1437`, OpenCode shell fetches ask
  - **UPDATE:** `.bkit/core/engine/install/cloud-env.integration.test.ts`: the comment at `:112-113` ("permission.bash curl globs") names the exact-origin `permission.webfetch` keys instead
  - **UPDATE:** `.opencode/opencode.json`: regenerated by `pnpm tsx .bkit/core/engine/cli.ts upgrade` (legacy keys stay until Task 10)
  - **UPDATE:** `dist/cli.js`: rebuilt with the rest of `dist/` by `pnpm build`, and staged with `git add dist/`
  - **DONE WHEN:** `renderOpencodeJson` output has no `permission.bash` key matching `^(curl|wget) \*[^*\s]+\*$` and no `permission.webfetch` key matching `^\*[^*]+\*$`; the four tests below pass; `git grep -n 'curl \*{domain}\*' -- .bkit/core/.bkit/` returns nothing; `pnpm bkit:check:dist` exits 0
  - **TEST FIRST:**
    - `.bkit/core/engine/install/modules/opencode.integration.test.ts` `injects consumer allowed-domains into the fetch tool as exact origins and never into shell allows` fails on `curl *vercel.com*` still being an `allow` in `permission.bash` (rewrites "injects consumer allowed-domains into both fetch surfaces (shell + fetch tool)")
    - `.bkit/core/engine/install/modules/opencode.integration.test.ts` `permission: opencode tool-keyed map (not Claude {rules:[...]}), force-push gated, no shell fetch allows` fails on `curl *github.com*` still being an `allow` (rewrites "permission: opencode tool-keyed map (not Claude {rules:[...]}), force-push gated": its curl assertion flips to absent)
    - `.bkit/core/engine/install/modules/index.integration.test.ts` `every derived base reaches the fetch tool on every host, and an OpenCode shell fetch asks` fails on an OpenCode shell `curl https://{base}/` answering `allow` (rewrites "every derived base reaches BOTH fetch surfaces on every host (fetch tool + shell)")
    - `.bkit/core/engine/install/modules/index.integration.test.ts` `an OpenCode webfetch allow matches only its exact https origin` fails on `https://evil.example/?x=github.com` matching the `*github.com*` allow

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** Report legacy OpenCode substring fetch grants for owner review (`deferrals-1`; `deferrals-11` row `381-opencode-bash-grants-never-revoked`)
  - **UPDATE:** `.bkit/core/engine/checks/before/files.ts`: add `detectOpencodeSubstringFetchGrants(cwd)` (advisory id `opencode-substring-fetch-grants`; reads with `readJsonFile`; never writes), an exported key matcher for `uninstall.ts`, and an exported `redactUrlParts` (its callers are the detector and Task 3's uninstall review lines)
  - **UPDATE:** `runPreflight` in `.bkit/core/engine/checks/before/index.ts`: push the finding beside `detectPlaywrightReporterHostile`
  - **UPDATE:** `dist/cli.js`: rebuilt with the rest of `dist/` by `pnpm build`, and staged with `git add dist/`
  - **READ:** `readJsonFile` in `.bkit/core/engine/shared/json.ts`: the parse contract (no `JSON.parse` in a `try`)
  - **READ:** `PreflightFinding` in `.bkit/core/engine/checks/before/index.ts`: the advisory shape
  - **UPDATE:** `.bkit/core/engine/checks/before/files.test.ts`: a `detectOpencodeSubstringFetchGrants` describe
  - **UPDATE:** `.bkit/core/engine/commands/install/upgrade.integration.test.ts`: the legacy-file upgrade test
  - **UPDATE:** `.bkit/core/.bkit/providers.md`: § Network allowlist OpenCode row — legacy entries are reported by `opencode-substring-fetch-grants`, never removed. Describe them in words ("substring `curl` / `wget` / `webfetch` allows"), not with the `curl *{domain}*` key shape, so Task 1's `git grep` check keeps holding
  - **DEPENDS ON:** 1
  - **DONE WHEN:** a real `bkit upgrade` over a temp consumer whose `.opencode/opencode.json` holds `"curl *github.com*": "allow"` keeps that key, prints `opencode-substring-fetch-grants` naming it with its removal action, writes `https://github.com` / `https://github.com/*` into `permission.webfetch` and adds no new `curl *…*` / `wget *…*` key; the five tests below pass; `git grep -n 'curl \*{domain}\*' -- .bkit/core/.bkit/` still returns nothing; `pnpm bkit:check:dist` exits 0
  - **TEST FIRST:**
    - `.bkit/core/engine/checks/before/files.test.ts` `reports each substring curl, wget and webfetch allow with its removal action` fails on no finding for a file holding `curl *github.com*`, `wget *github.com*` and `*github.com*` allows
    - `.bkit/core/engine/checks/before/files.test.ts` `ignores exact-origin, non-allow and unrelated consumer entries` fails on a finding raised for `https://api.example.com/*`, a `curl *x*: ask` entry or an unrelated bash key
    - `.bkit/core/engine/checks/before/files.test.ts` `redacts URL credentials and query strings in a reported key` fails on `user:tok` or `k=v` appearing in the finding's text
    - `.bkit/core/engine/checks/before/files.test.ts` `reports nothing and writes nothing for an absent, unparseable or map-less file` fails on a throw, a finding, or a changed file
    - `.bkit/core/engine/commands/install/upgrade.integration.test.ts` `upgrade keeps legacy OpenCode substring fetch grants and reports each for owner review` fails on the output lacking "opencode-substring-fetch-grants", on the upgraded `permission.webfetch` lacking `https://github.com/*`, or on a new `curl *…*` key in `permission.bash`

<!-- bkit:task 2 end -->

<!-- bkit:group 1 end -->

<!-- bkit:group 2 start -->

### TASK GROUP 2: Uninstall cleanup by recorded evidence (`deferrals-11`)

<!-- bkit:task 3 start -->

- [ ] **TASK 3:** Strip Claude derived grants by the `claudeAllowDerived` record and list unattributable grants for review (`deferrals-11` rows `381-webfetch-grants-survive-uninstall-after-seed-emptied` and `381-opencode-bash-grants-never-revoked`)
  - **UPDATE:** `.bkit/core/engine/commands/install/uninstall.ts`: read `readBkitVersion(versionFilePath)?.claudeAllowDerived ?? []` once beside `canonicalHashes` (`:430-431`), before the decision-table loop that deletes `.bkit/version` on a full or core uninstall, and pass it into the `.claude/settings.json` strip (`:725-745`) in place of `resolveClaudeDerivedAllows(ctx.cwd)`; then log one `ctx.logPrefix` review line per remaining derived-looking row the record lacks; for `.opencode/opencode.json`, log one review line per legacy substring grant left after `stripOpencodeJsonScope`, using the Task 2 matcher and Task 2's exported `redactUrlParts` on each key
  - **READ:** `readBkitVersion` in `.bkit/core/engine/install/version-file.ts`: reads `claudeAllowDerived`, the record (absent → `[]`)
  - **READ:** `resolveClaudeDerivedAllows` in `.bkit/core/engine/install/cloud-env.ts`: which rows look derived
  - **READ:** `enrichClaudeSettingsAllows` in `.bkit/core/engine/install/modules/claude.ts`: what the record holds
  - **UPDATE:** `.bkit/core/engine/commands/install/uninstall.integration.test.ts`: five tests
  - **UPDATE:** `.bkit/core/engine/commands/install/uninstall.test.ts`: the existing test `strips allow/deny/ask together, including install's WebFetch enrichment` (`:1170`) writes `WebFetch(domain:github.com)` and `WebFetch(domain:npmjs.com)` with no `.bkit/version` and expects `.claude/settings.json` deleted; seed `claudeAllowDerived` with those two rows so it still asserts the full strip
  - **UPDATE:** `.bkit/core/.bkit/providers.md`: `:476` Claude row — uninstall removes only the rows `claudeAllowDerived` records
  - **UPDATE:** `dist/cli.js`: rebuilt with the rest of `dist/` by `pnpm build`, and staged with `git add dist/`
  - **DEPENDS ON:** 1, 2
  - **DONE WHEN:** uninstall over a temp consumer removes a recorded `WebFetch(domain:gone.example)` grant, keeps an unrecorded derived-looking grant and prints its review line, and prints a redacted review line for a legacy OpenCode substring grant it leaves; a bare `bkit uninstall` (no module flags) after a real install removes the recorded grants; the five tests below pass; `strips allow/deny/ask together, including install's WebFetch enrichment` in `uninstall.test.ts` passes; `pnpm bkit:check:dist` exits 0
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/install/uninstall.integration.test.ts` `removes a recorded WebFetch grant whose domain left allowed-domains` fails on the recorded grant surviving uninstall
    - `.bkit/core/engine/commands/install/uninstall.integration.test.ts` `keeps an unrecorded WebFetch grant and lists it for owner review` fails on the unrecorded grant being removed by the recompute
    - `.bkit/core/engine/commands/install/uninstall.integration.test.ts` `removes no WebFetch grant when .bkit/version has no claudeAllowDerived record` fails on currently-derived grants being removed with no record
    - `.bkit/core/engine/commands/install/uninstall.integration.test.ts` `leaves legacy OpenCode substring fetch grants in place and lists them for owner review` fails on no review line naming `curl *github.com*`, or on a review line for `curl *https://user:tok@host/?k=v*` that shows `user:tok` or `k=v`
    - `.bkit/core/engine/commands/install/uninstall.integration.test.ts` `a full bkit uninstall removes a recorded WebFetch grant whose domain left allowed-domains` fails on that grant surviving a no-flag uninstall, either through the recompute or because the record was read after the loop deleted `.bkit/version`

<!-- bkit:task 3 end -->

<!-- bkit:group 2 end -->

<!-- bkit:group 3 start -->

### TASK GROUP 3: Codex private-key shell reads (`deferrals-3`)

<!-- bkit:task 4 start -->

- [ ] **TASK 4:** Deny Codex shell reads of private-key files, `.env` advisory (`deferrals-3`)
  - **UPDATE:** `shellSecretRead` in `.bkit/core/hooks/guardrails-tiers.js`: return the first `key`-kind part ahead of the first `env`-kind part
  - **UPDATE:** `decideShell` in `.bkit/core/.codex/hooks/bkit-guardrails.cjs`: in `case "secret"`, `secretFileKind(v.path) === "key"` → `deny(...)` naming the file with no `Command:` echo; `env` keeps the advisory, its file description narrowed from "an env, secrets or private-key file" to "an env or secrets file"
  - **UPDATE:** `.bkit/instructions.md`: § Hook Text — add `### guardrails-codex-key-shell-deny` (hook Guardrails; fires on a shell read of a private-key file; hosts Codex; source `.bkit/core/.codex/hooks/bkit-guardrails.cjs` `decideShell`) with the exact deny text, and narrow `guardrails-codex-secret-shell` (`:8916-8925`) so its `fires` line and text block match the narrowed advisory
  - **UPDATE:** `.bkit/core/engine/install/modules/index.integration.test.ts`: `SHELL_SECRET_READS` key rows carry a Codex `deny` expectation and the describe at `:809` asserts it per host; add a `cat ~/.ssh/id_rsa.pub` → `allow` row; add the three tests below
  - **UPDATE:** `.codex/hooks/bkit-guardrails.cjs`: re-rendered by `pnpm tsx .bkit/core/engine/cli.ts upgrade`
  - **UPDATE:** `.cursor/hooks/bkit-guardrails.cjs`: re-rendered by the same upgrade (splices `guardrails-tiers.js`)
  - **UPDATE:** `.agents/plugins/bkit/hooks/bkit-guardrails.cjs`: re-rendered by the same upgrade (splices `guardrails-tiers.js`)
  - **DONE WHEN:** `codexVerdict` answers `deny` for the three key rows and `cat .env ~/.ssh/id_rsa`, `ask` for every `.env` row and `allow` for `cat ~/.ssh/id_rsa.pub`; the existing `SHELL_SECRET_READS` allow rows (`cat .env.example`, `cat .envrc`, `cp .env.example .env`, `git add .env.example`, `mv .env .env.bak`, `grep -rn ".env" docs`, `git commit -m "ignore .env"`) keep `allow` on every host; the row `rg -l "id_rsa" src` → "search pattern, not a file" (`guardrails-cursor.integration.test.ts:117`) still holds; Cursor and Antigravity verdicts are unchanged; `T6 — guardrails.cjs installed mirror is its rendered template` in `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` passes; `every hook message has an entry and every entry is still emitted` in `.bkit/core/engine/tools/instructions-sources.test.ts` passes
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

<!-- bkit:group 3 end -->

<!-- bkit:group 4 start -->

### TASK GROUP 4: Cloud allowlist fingerprint (`deferrals-11`)

<!-- bkit:task 7 start -->

- [ ] **TASK 7:** Record the allowlist fingerprint in `.bkit/allowlist.json` and print it with the env-var step in the Claude paste section (`deferrals-11` row `381-cloud-allowlist-staleness-detector`)
  - **UPDATE:** `egressFingerprint` in `.bkit/core/engine/install/cloud-env.ts`: optional `entries` parameter; no argument keeps the derived set
  - **UPDATE:** `renderCloudNetworkAllowlist` in `.bkit/core/engine/install/cloud-env.ts`: "Allowlist fingerprint" of the paste list, the `BKIT_CLOUD_ALLOWLIST_FINGERPRINT` step, and the operator-assertion sentence, replacing the derived-set stamp
  - **UPDATE:** `renderNetworkAllowlist` in `.bkit/core/engine/install/network-allowlist.ts`: `{ domains, fingerprint }`; update the header and doc comments
  - **UPDATE:** `.bkit/core/engine/install/network-allowlist.test.ts`: two tests in `writeNetworkAllowlist — .bkit/allowlist.json`
  - **UPDATE:** `.bkit/core/engine/install/cloud-env.test.ts`: one test in `extractAllowedDomains / expandAllowedDomains / renderCloudNetworkAllowlist`
  - **UPDATE:** `.bkit/core/.bkit/cloud.md`: § In-repo side (`:103`) and § Network access (`:116-126`): the fingerprint, the env-var step, the bootstrap warning, that each cloud's dashboard list is an unverified operator assertion, and that the Cursor and Codex paste-note stamp is the derived set only, so it ignores consumer `allowed-domains`
  - **UPDATE:** `.bkit/allowlist.json`: regenerated by `pnpm tsx .bkit/core/engine/cli.ts upgrade`
  - **UPDATE:** `dist/cli.js`: rebuilt with the rest of `dist/` by `pnpm build`, and staged with `git add dist/`
  - **DONE WHEN:** `.bkit/allowlist.json` holds `fingerprint` equal to `egressFingerprint(domains)`; the rendered Claude § 2 prints that stamp and the env-var step; `renderWidenedNetworkList` output is unchanged; the three tests below pass; `pnpm bkit:check:dist` exits 0
  - **TEST FIRST:**
    - `.bkit/core/engine/install/network-allowlist.test.ts` `records the fingerprint of its own domains list` fails on `.bkit/allowlist.json` having no `fingerprint` field
    - `.bkit/core/engine/install/network-allowlist.test.ts` `moves the fingerprint when allowed-domains changes` fails on the stamp staying the same after a declared domain is added
    - `.bkit/core/engine/install/cloud-env.test.ts` `renderCloudNetworkAllowlist names the .bkit/allowlist.json fingerprint and the BKIT_CLOUD_ALLOWLIST_FINGERPRINT step` fails on the output still carrying the derived-set stamp and no env-var step

<!-- bkit:task 7 end -->

<!-- bkit:task 8 start -->

- [ ] **TASK 8:** Compare the fingerprint in the cloud bootstrap template, warn and continue (`deferrals-11` row `381-cloud-allowlist-staleness-detector`)
  - **UPDATE:** `.bkit/templates/.claude/hooks/bkit-cloud-bootstrap.sh`: the fingerprint block in the baseline section (unset, missing-expected, malformed `.bkit/allowlist.json` or `jq`-absent, differ, not-8-hex → WARNING with the refresh steps; equal → operator-asserted, deployed allowlist unverified; never non-zero), plus the header customisation line. The `jq` read is guarded with `2>/dev/null || printf ''`, as the trust check at `:48-51` is, because the hook runs under `set -euo pipefail` (`:22`)
  - **UPDATE:** `.claude/hooks/bkit-cloud-bootstrap.sh`: the same block, byte-for-byte
  - **UPDATE:** `tests/shell/bkit-cloud-bootstrap-preflight.bats`: six fingerprint tests; its header comment names the fingerprint block too
  - **DEPENDS ON:** 7
  - **DONE WHEN:** the six tests below pass when `pnpm bkit:test:file tests/shell/bkit-cloud-bootstrap-preflight.bats` runs the file as its own invocation (knowledge row `384-bats-tmpdir-collision-when-running-multiple-bats-files-in-one-invocation`); `cmp .claude/hooks/bkit-cloud-bootstrap.sh .bkit/templates/.claude/hooks/bkit-cloud-bootstrap.sh` exits 0; `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` passes
  - **TEST FIRST:**
    - `tests/shell/bkit-cloud-bootstrap-preflight.bats` `fingerprint: warns with the refresh steps and exits 0 when BKIT_CLOUD_ALLOWLIST_FINGERPRINT is unset` fails on no WARNING naming the variable
    - `tests/shell/bkit-cloud-bootstrap-preflight.bats` `fingerprint: warns naming both fingerprints when they differ, and continues` fails on no WARNING carrying both 8-hex values
    - `tests/shell/bkit-cloud-bootstrap-preflight.bats` `fingerprint: reports a match as operator-asserted with the deployed allowlist unverified` fails on the stderr lacking "operator-asserted"
    - `tests/shell/bkit-cloud-bootstrap-preflight.bats` `fingerprint: warns and continues when .bkit/allowlist.json has no fingerprint or jq is absent` fails on no WARNING that the expected fingerprint is unavailable
    - `tests/shell/bkit-cloud-bootstrap-preflight.bats` `fingerprint: rejects a value that is not 8 hex characters without echoing it` fails on the stderr lacking "not an 8-hex fingerprint"
    - `tests/shell/bkit-cloud-bootstrap-preflight.bats` `fingerprint: warns and continues when .bkit/allowlist.json is not valid JSON` fails on a non-zero exit, or on no WARNING that the expected fingerprint is unavailable

<!-- bkit:task 8 end -->

<!-- bkit:task 9 start -->

- [ ] **TASK 9:** Detect an adopted cloud bootstrap without the fingerprint compare (`deferrals-11` row `381-cloud-allowlist-staleness-detector`)
  - **UPDATE:** `.bkit/core/engine/checks/before/files.ts`: add `detectCloudBootstrapFingerprintMissing(cwd)` (advisory id `cloud-bootstrap-fingerprint-missing`), matching the `BKIT_CLOUD_ALLOWLIST_FINGERPRINT` name, never byte identity
  - **UPDATE:** `runPreflight` in `.bkit/core/engine/checks/before/index.ts`: push the finding
  - **UPDATE:** `.bkit/core/engine/checks/before/files.test.ts`: a `detectCloudBootstrapFingerprintMissing` describe
  - **UPDATE:** `.bkit/core/engine/commands/install/check.integration.test.ts`: one test
  - **UPDATE:** `.bkit/core/engine/commands/install/doctor.integration.test.ts`: one test in `bkit doctor — integration`
  - **UPDATE:** `.bkit/core/.bkit/templates.md`: Contract row for the cloud SessionStart hook (`:79`): the compare, the env var, and the `cloud-bootstrap-fingerprint-missing` advisory
  - **UPDATE:** `dist/cli.js`: rebuilt with the rest of `dist/` by `pnpm build`, and staged with `git add dist/`
  - **DEPENDS ON:** 8
  - **DONE WHEN:** `bkit check` and `bkit doctor` on a temp consumer whose `.claude/hooks/bkit-cloud-bootstrap.sh` lacks the variable print `cloud-bootstrap-fingerprint-missing` with the template path to copy from; bkit's own `bkit check` does not print it; the five tests below pass; `pnpm bkit:check:dist` exits 0
  - **TEST FIRST:**
    - `.bkit/core/engine/checks/before/files.test.ts` `reports an adopted bootstrap that never reads BKIT_CLOUD_ALLOWLIST_FINGERPRINT` fails on no finding for a bootstrap copied from the pre-fingerprint template
    - `.bkit/core/engine/checks/before/files.test.ts` `accepts a customised bootstrap that reads the variable` fails on a finding raised for a rewritten bootstrap that compares the variable its own way
    - `.bkit/core/engine/checks/before/files.test.ts` `stays silent when no bootstrap is adopted` fails on a finding raised with no `.claude/hooks/bkit-cloud-bootstrap.sh`
    - `.bkit/core/engine/commands/install/check.integration.test.ts` `bkit check reports a stale adopted cloud bootstrap with the template block to copy` fails on the output lacking "cloud-bootstrap-fingerprint-missing"
    - `.bkit/core/engine/commands/install/doctor.integration.test.ts` `bkit doctor lists a stale adopted cloud bootstrap` fails on the doctor output lacking "cloud-bootstrap-fingerprint-missing"

<!-- bkit:task 9 end -->

<!-- bkit:group 4 end -->

<!-- bkit:group 5 start -->

### TASK GROUP 5: Mirrors, bkit's own copies and test docs

<!-- bkit:task 10 start -->

- [ ] **TASK 10:** Refresh mirrors and `dist/`, clean bkit's own OpenCode copy, and record the new tests in `docs/testing.md` (`deferrals-1`, `deferrals-3`, `deferrals-11`)
  - **UPDATE:** `.opencode/opencode.json`: delete the legacy `curl *{domain}*` / `wget *{domain}*` / `*{domain}*` allows by hand, as the `opencode-substring-fetch-grants` advisory lists them (approved through `Breaking Changes`)
  - **UPDATE:** `.bkit/providers.md`: re-rendered by `pnpm tsx .bkit/core/engine/cli.ts upgrade`
  - **UPDATE:** `.bkit/cloud.md`: re-rendered by the same upgrade
  - **UPDATE:** `.bkit/templates.md`: re-rendered by the same upgrade
  - **UPDATE:** `.bkit/workflows.md`: re-rendered by the same upgrade
  - **UPDATE:** `.bkit/prompts.md`: re-rendered by the same upgrade
  - **UPDATE:** `dist/cli.js`: final freshness check only — Tasks 1, 2, 3, 6, 7 and 9 each rebuild and stage `dist/`; rebuild with `pnpm build` here only if the check finds drift
  - **UPDATE:** `docs/capabilities.md`: the graphify register, refreshed by `pnpm bkit:graph:refresh` on the staged tree, because Task 3 adds an import from `uninstall.ts` to `checks/before/files.ts` and Tasks 2 and 9 export new detectors, and the pre-push register gate (`.husky/pre-push:282-348`) blocks a stale register
  - **UPDATE:** `docs/testing.md`: § OpenCode host test coverage rows for the exact-origin `webfetch` and the substring-grant detector; § Runtime detection + gh-preflight test coverage rows for the fingerprint cases in `tests/shell/bkit-cloud-bootstrap-preflight.bats`
  - **DEPENDS ON:** 1, 2, 3, 4, 5, 6, 7, 8, 9
  - **DONE WHEN:** `pnpm bkit check` exits 0 on bkit and prints neither `opencode-substring-fetch-grants` nor `cloud-bootstrap-fingerprint-missing`; `jq -r '.permission.bash | keys[]' .opencode/opencode.json` shows no `curl *…*` / `wget *…*` key other than `curl *` / `wget *`; the T6 mirror parity test passes; `pnpm build` exits 0, `pnpm bkit:check:dist` exits 0 and `git grep -l detectCloudBootstrapFingerprintMissing -- dist/` lists a file; `pnpm bkit:graph:check` exits 0 after the refresh is committed
  - **TEST FIRST:** n/a — no behaviour change: generated mirrors, a `dist/` freshness check, a graph register refresh, a config hand edit and docs

<!-- bkit:task 10 end -->

<!-- bkit:group 5 end -->

### 🔒 Gate 2: Code Implementation Check

- [ ] **No bolt-on:** every `[NEW]` file traces to a `Reuse Inventory` `NEW` row.
- [ ] **Extensions landed:** every `EXTEND` landed in the artifact its row names.
- [ ] **No gate weakened:** no gate was weakened.
- [ ] **Red before code:** the tests step recorded every planned test of the group red, or as an `updated` existing test, before its code step ran.
- [ ] **Tests unchanged:** every planned test case matches the lines its red row recorded.
- [ ] **Unproven tests:** each planned test with no proven red is cleared only by a human-committed `TEST EXCEPTION` field.
- [ ] **Gate 2 — Verified:** every box above is checked.

**Mandatory Tasks (Testing & Documentation):**

- [ ] **Verify test coverage against Derived Test Matrix:** each row's test is in one task's `DONE WHEN`.
- [ ] **Sweep existing tests:** broken tests are fixed, and the full suite passes.
- [ ] **Sweep new tests:** every test a task's `DONE WHEN` names exists and passes.
- [ ] **Verify observability:** errors are logged and traced as `docs/observability.md` describes.
- [ ] **Update documentation:** the affected docs are rewritten to match.

### 🔒 Gate 3: Testing & Documentation Check

- [ ] **Docs updated:** every `Documentation Updates` row is done.
- [ ] **Docs index accurate:** `.agents/docs.md` is accurate.
- [ ] **Gate 3 — Verified:** every box above is checked.

## Verification Plan

### Automated Tests

- [ ] **Full Local Gate Suite:** `pnpm bkit:gate:static-unit-integration` (the deepest declared `bkit:gate:*` script with integration; `bkit:gate:install-static-unit-build` adds `pnpm build`) and `pnpm bkit check` pass.
- [ ] **Test Synchronization:** the existing tests the plan rewrites stay green: `opencode.integration.test.ts` (`:448`, `:541`), the parity test and `SHELL_SECRET_READS` describe in `index.integration.test.ts`, the T6 mirror parity and the `rg -l "id_rsa" src` search-pattern row (`:117`) in `guardrails-cursor.integration.test.ts`, `dogfood-templates.test.ts`, the gh-preflight cases already in `tests/shell/bkit-cloud-bootstrap-preflight.bats`, `strips allow/deny/ask together, including install's WebFetch enrichment` in `uninstall.test.ts` (`:1170`, reseeded with a `claudeAllowDerived` record in Task 3), `every hook message has an entry and every entry is still emitted` in `instructions-sources.test.ts` (§ Hook Text entries added in Task 4), and `cloud-env.integration.test.ts` (comment at `:112-113` updated in Task 1).
- [ ] **Build Configuration:** no test-only file is added to a shipped path. The new tests extend existing `*.test.ts`, `*.integration.test.ts` and `.bats` files, which the build already excludes. The Task 5 experiment files sit under `tests/experiments/`, outside the package.
- [ ] **Integration (`opencode.integration.test.ts`, `index.integration.test.ts`):** rendered OpenCode permissions hold no substring fetch allow; exact-origin `webfetch` rejects a name in another URL's path, query or userinfo; rendered Codex hook denies key-kind shell reads with a sanitized reason (Tasks 1, 4).
- [ ] **Unit (`checks/before/files.test.ts`):** both detectors, including redaction and the no-write guarantee, against temp directories (Tasks 2, 9).
- [ ] **Integration (`upgrade`, `uninstall`, `check`, `doctor`, `install` integration tests):** the real CLI over temp consumer repos: legacy grants kept and reported, exact-origin keys written on upgrade; uninstall by record, a full no-flag uninstall included; the stale bootstrap advisory in `bkit check` and `bkit doctor`; the Codex status advisory (Tasks 2, 3, 6, 9).
- [ ] **Unit (`network-allowlist.test.ts`, `cloud-env.test.ts`, `bkit-cloud-bootstrap-preflight.bats`):** the fingerprint field, the paste guidance, and every bootstrap warn-and-continue branch through `pnpm bkit:test:file tests/shell/bkit-cloud-bootstrap-preflight.bats` (Tasks 7, 8).
- [ ] **Apply local migrations:** N/A — no database.
- [ ] **Run all tests:** `pnpm test`, `pnpm test:integration` and `pnpm bkit:test:bats` pass.

### 🔒 Gate 4: Automated Verification Check

- [ ] **Gate 4 — Verified:** every Automated Tests box is checked, with proof (test output, a CLI result or an API response).

### Manual Verification

> [!CAUTION]
> **Owner-run acceptance checks, advisory only.** An unticked box blocks nothing: not the merge, and not plan approval. This is not a Gate 1 human-confirmation section.

- [ ] **Step 1:** In a scratch consumer, run `node dist/cli.js install --opencode=openrouter --claude`, add `"curl *github.com*": "allow"` to `.opencode/opencode.json`, then run `node dist/cli.js upgrade`. Confirm the key is still there, `opencode-substring-fetch-grants` names it, and `permission.webfetch` holds `https://github.com/*`.
- [ ] **Step 2:** In OpenCode (`opencode v2.1.4`) in that consumer, ask for `curl -sI https://github.com` and confirm the prompt. Then use the fetch tool on `https://github.com/` and confirm there is no prompt, and on `https://evil.example/?x=github.com` and confirm the prompt. Record `opencode --version`, the date and the three outcomes in the Task 5 report, since this is the only check of the `webfetch` matching assumption against the real binary.
- [ ] **Step 3:** Follow § Manual recipe — Codex key-read deny in `docs/testing.md` on the current codex-cli, if Task 5 recorded `not-run` because no session was available, and add the dated result.
- [ ] **Step 4:** In a Claude Code on the web session for a consumer with the new bootstrap, start once with `BKIT_CLOUD_ALLOWLIST_FINGERPRINT` unset and once set to the stamp in `.claude/bkit-cloud.md` § 2. Confirm the WARNING in the first, the "operator-asserted ... unverified" line in the second, and that both sessions start.
- [ ] **Step 5:** Run `node dist/cli.js uninstall` in the Step 1 consumer and confirm the review lines for the legacy OpenCode key and any unrecorded `WebFetch(domain:…)` grant.
