Verdict: CONCERNS
Failures: 0
<!-- verdict:end -->

# Plan Summary

## Verdict

CONCERNS

- plan-apply-review CONCERNS
- 1 deferral(s) from this run remain open

## Steps

<!-- prettier-ignore -->
| Step | Verdict | Failures | Attempts | Artifact |
| --- | --- | --- | --- | --- |
| plan-start-workflow | - | - | 1 | - |
| plan-worktree-setup | - | - | 1 | `docs/plans/202611/logs/803-close-codex-opencode/plan-input-1.md` |
| plan-generate | - | - | 1 | `docs/plans/202611/logs/803-close-codex-opencode/plan-v1-draft.md`, `docs/plans/202611/logs/803-close-codex-opencode/plan-generate-check.md` |
| plan-fetch-context | - | - | 1 | `docs/plans/202611/logs/803-close-codex-opencode/related-deferrals.md`, `docs/plans/202611/logs/803-close-codex-opencode/related-failures.md`, `docs/plans/202611/logs/803-close-codex-opencode/related-issues.md` |
| plan-review | CONCERNS | 10 | 1 | `docs/plans/202611/logs/803-close-codex-opencode/plan-review-1.md`, `docs/plans/202611/logs/803-close-codex-opencode/plan-review-2.md`, `docs/plans/202611/logs/803-close-codex-opencode/plan-scope-check.md` |
| plan-apply-review | CONCERNS | - | 1 | `docs/plans/202611/logs/803-close-codex-opencode/plan-v2-reviewed.md`, `docs/plans/202611/logs/803-close-codex-opencode/plan-update-check.md` |

## Resolved Findings

None

## Reassessed Findings

- plan-review CONCERNS, remaining findings assessed by plan-apply-review

## Assessment History

<!-- prettier-ignore -->
| Step | Verdict | Attempt | Artifact |
| --- | --- | --- | --- |
| plan-start-workflow | - | - | - |
| plan-worktree-setup | - | - | `docs/plans/202611/logs/803-close-codex-opencode/plan-input-1.md` |
| plan-generate | - | 1 | `docs/plans/202611/logs/803-close-codex-opencode/plan-v1-draft.md`, `docs/plans/202611/logs/803-close-codex-opencode/plan-generate-check.md` |
| plan-fetch-context | - | 1 | `docs/plans/202611/logs/803-close-codex-opencode/related-deferrals.md`, `docs/plans/202611/logs/803-close-codex-opencode/related-failures.md`, `docs/plans/202611/logs/803-close-codex-opencode/related-issues.md` |
| plan-review | CONCERNS | 1 | `docs/plans/202611/logs/803-close-codex-opencode/plan-review-1.md`, `docs/plans/202611/logs/803-close-codex-opencode/plan-review-2.md`, `docs/plans/202611/logs/803-close-codex-opencode/plan-scope-check.md` |
| plan-apply-review | CONCERNS | 1 | `docs/plans/202611/logs/803-close-codex-opencode/plan-v2-reviewed.md`, `docs/plans/202611/logs/803-close-codex-opencode/plan-update-check.md` |

## Acceptance Scenario

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

## Open Questions

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

## Risks and Action Items

None

## Recommended Next Step

```text
/bkit-build #803
```

Or, to address the reasons first: `/bkit-plan #803`
