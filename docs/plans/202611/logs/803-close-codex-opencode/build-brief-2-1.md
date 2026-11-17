# Brief: group 2 — Uninstall cleanup by recorded evidence (`deferrals-11`)

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
- Group 2: Uninstall cleanup by recorded evidence (`deferrals-11`) — this group
  - TASK 3: Strip Claude derived grants by the `claudeAllowDerived` record and list unattributable grants for review (`deferrals-11` rows `381-webfetch-grants-survive-uninstall-after-seed-emptied` and `381-opencode-bash-grants-never-revoked`) — open
- Group 3: Codex private-key shell reads (`deferrals-3`) — next
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

<!-- bkit:task 3 start -->

- [ ] **TASK 3:** Strip Claude derived grants by the `claudeAllowDerived` record and list unattributable grants for review (`deferrals-11` rows `381-webfetch-grants-survive-uninstall-after-seed-emptied` and `381-opencode-bash-grants-never-revoked`)
  - **UPDATE:** `.bkit/core/engine/commands/install/uninstall.ts`: read `readBkitVersion(versionFilePath)?.claudeAllowDerived ?? []` once beside `canonicalHashes` (`:411`, in `buildDecisionTable`), before the decision-table loop that deletes `.bkit/version` on a full or core uninstall (`:476-490`), and pass it into the `.claude/settings.json` strip in `runUninstall` (`:705-725`) in place of `resolveClaudeDerivedAllows(ctx.cwd)` (`:719`); then log one `ctx.logPrefix` review line per remaining derived-looking row the record lacks; for `.opencode/opencode.json`, log one review line per legacy substring grant left after `stripOpencodeJsonScope`, using the Task 2 matcher and Task 2's exported `redactUrlParts` on each key
  - **READ:** `readBkitVersion` in `.bkit/core/engine/install/version-file.ts`: reads `claudeAllowDerived`, the record (absent → `[]`)
  - **READ:** `resolveClaudeDerivedAllows` in `.bkit/core/engine/install/cloud-env.ts`: which rows look derived
  - **READ:** `enrichClaudeSettingsAllows` in `.bkit/core/engine/install/modules/claude.ts`: what the record holds
  - **READ:** `.bkit/core/engine/commands/install/uninstall.integration.test.ts`: the `#864 — full uninstall keeps project documents` describe, whose real `install` → `uninstall` run through `spawnSync(requireTsx(), ...)` the full no-flag uninstall test can reuse
  - **UPDATE:** `.bkit/core/engine/commands/install/uninstall.integration.test.ts`: five tests
  - **UPDATE:** `.bkit/core/engine/commands/install/uninstall.test.ts`: the existing test `strips allow/deny/ask together, including install's WebFetch enrichment` (`:1150`) writes `WebFetch(domain:github.com)` and `WebFetch(domain:npmjs.com)` with no `.bkit/version` and expects `.claude/settings.json` deleted; seed `claudeAllowDerived` with those two rows so it still asserts the full strip
  - **UPDATE:** `.bkit/core/.bkit/providers.md`: `:523` Claude row — uninstall removes only the rows `claudeAllowDerived` records
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

### Earlier tasks this group depends on

- TASK 1 (group 1, done): Stop the OpenCode shell fetch grants (`deferrals-1`; `deferrals-11` row `381-opencode-bash-grants-never-revoked`) — `.bkit/core/engine/install/modules/opencode.ts`, `.bkit/core/engine/install/modules/opencode.integration.test.ts`, `.bkit/core/engine/install/modules/index.integration.test.ts`, `.bkit/core/.bkit/providers.md`, `.bkit/core/.bkit/workflows.md`, `.bkit/core/engine/install/cloud-env.integration.test.ts`, `.opencode/opencode.json`, `dist/cli.js`
- TASK 2 (group 1, done): Report legacy OpenCode substring fetch grants for owner review (`deferrals-1`; `deferrals-11` row `381-opencode-bash-grants-never-revoked`) — `.bkit/core/engine/checks/before/files.ts`, `.bkit/core/engine/checks/before/index.ts`, `dist/cli.js`, `.bkit/core/engine/checks/before/files.test.ts`, `.bkit/core/engine/commands/install/upgrade.integration.test.ts`, `.bkit/core/.bkit/providers.md`

### Reuse Inventory rows

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| Strip Claude derived grants by recorded evidence at uninstall | `.bkit/core/engine/commands/install/uninstall.ts` | read `uninstall.ts:705-725`; `readBkitVersion` / `claudeAllowDerived` in `version-file.ts`; `enrichClaudeSettingsAllows` in `claude.ts:239` | the `.claude/settings.json` branch that recomputes `resolveClaudeDerivedAllows`; the `claudeAllowDerived` record | EXTEND | Read `claudeAllowDerived` once before the decision-table loop, beside `canonicalHashes`, and fold the recorded rows instead of the recomputed ones; list unrecorded derived-looking grants and legacy OpenCode substring grants (reusing Task 2's matcher and `redactUrlParts`) for owner review. |

### Architecture entries

#### [MODIFY] `.bkit/core/engine/commands/install/uninstall.ts`

- **Existence Check:** exists; the `.claude/settings.json` branch in `runUninstall` at `:705-725`, with the `resolveClaudeDerivedAllows(ctx.cwd)` recompute at `:719`; `stripOpencodeJsonScope` at `:150`; `canonicalHashes` read before the decision-table loop in `buildDecisionTable` at `:411`; `.bkit/version` deleted inside that loop on a full or core uninstall (`:476-490`), and core's `.bkit/version` (`manifest.ts:129`) comes before `.claude/settings.json` (`manifest.ts:165`).
- Read `const claudeAllowDerived = readBkitVersion(versionFilePath)?.claudeAllowDerived ?? []` once beside `canonicalHashes`, before the loop, so a full `bkit uninstall` that deletes `.bkit/version` mid-loop still strips by the record. Pass it into the `.claude/settings.json` strip.
- Replace `resolveClaudeDerivedAllows(ctx.cwd)` in that strip with the pre-read `claudeAllowDerived` (Supersession Inventory row 2, `DELETE`).
- After the strip, log one review line per remaining `WebFetch(domain:…)` / `mcp__…` row that `resolveClaudeDerivedAllows(ctx.cwd)` would produce but the record lacks. Each line names the file, the row and "remove it by hand if bkit added it". Use `ctx.logPrefix`.
- For `.opencode/opencode.json`, run the Task 2 key matcher on the stripped document and log one review line per legacy substring grant with its removal action, each key passed through the exported `redactUrlParts`.
