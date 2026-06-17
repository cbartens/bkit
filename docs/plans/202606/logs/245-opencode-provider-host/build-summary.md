Verdict: PASS

<!-- verdict:end -->

# Build Summary

## Status

<!-- prettier-ignore -->
| Dimension | Result |
| --- | --- |
| Sub-plan executions | **PASS** — SP1–SP5 all individually PASS |
| Plan verify holistic | **PASS** — all 5 sub-plans final verdicts PASS; cross-plan coherence confirmed |
| Build challenge | **PASS (post-remediation)** — P0: none; P1: 5 items found + all fixed (Step 9); P2+: 4 items deferred |
| Tests | **PASS** — 1383 passed &#124; 2 skipped &#124; 1 todo (37 test files); 14 new P1 regression tests added |
| Deferred items | **Documented** — manual live-run verification (opencode job, claude job gating, dogfood install) |

## Verdict: SHIP

> **Note:** This summary was initially generated after Step 8 (Reconcile) before P1 remediation. Updated after Step 9 (Remediate) + Step 10-11 (Tests).

All 5 P1 findings identified by the challenge have been remediated (commit `590d538`) and covered by regression tests (commit `ca5857b`).

**Rationale:** Build is structurally complete — all sub-plans execute with PASS verdicts, holistic verify passes, test suite green. However, build-challenge-reconcile identifies 5 actionable P1 findings (2 HIGH + 3 MEDIUM) that must be addressed before merge:

### P1 — Fix before merge

1. **[C2 HIGH] GHA script injection** (bkit-cloud.yml:346) — `inputs.issue` interpolated raw into `run:` via `${{ steps.ctx.outputs.* }}`. Exploit: collaborator with workflow-run permission supplies shell metacharacters (backticks / `$()`); injected code runs in a job holding repo-write token, provider keys, and OPENCODE*PROVIDER_KEY. **Fix:** pass `PHASE`/`ARG` via `env:` and reference shell variables; validate `ARG` in the ctx step against `^[0-9A-Za-z.*/-]+$`.

2. **[C1+C2 HIGH] Provider fan-out block static** (bkit-cloud.yml:341–344, cross-ref bkit-cli.ts:274–283, bkit-modules.ts:1064–1068) — workflow only fans `OPENCODE_PROVIDER_KEY` to `NVIDIA_API_KEY` / `OPENROUTER_API_KEY` / `GEMINI_API_KEY`, but installer accepts ANY provider (openai, anthropic, custom, ollama). **Correctness gap:** `bkit install --opencode=openai` then `--cloud=opencode` commits opencode.json referencing `${OPENAI_API_KEY}` which is never set → auth failure. **Security gap:** single `OPENCODE_PROVIDER_KEY` copied to all three SDK env names simultaneously + script-injection above = multi-SDK credential blast radius. **Fix:** render the workflow fan-out from the consumer's configured provider `envVar` (OPENCODE_PROVIDER_DEFAULTS, bkit-modules.ts:1028–1049); export only that single name — fixes both correctness and blast radius.

3. **[C2 MEDIUM] Unvalidated `--opencode=<provider>` injected into opencode.json** (bkit-cli.ts:282 → bkit-modules.ts:1062–1102) — provider value accepted with no allowlist/charset check; substituted into JSON template via raw `String.prototype.replace`. Exploit: `--opencode=x","evil":"` injects unescaped JSON metacharacter; malformed JSON write allows `permission.rules` widening or attacker-chosen `baseURL` (key exfiltration on next run). **Fix:** validate provider at parse time against `/^[a-z][a-z0-9-]{0,30}$/`, OR build opencode.json object programmatically via `JSON.stringify`, OR throw on parse failure instead of writing malformed string.

4. **[C1 MEDIUM] Orphan-rename data loss for dev/dogfood snapshots** (bkit-install.ts:1222–1233) — orphan block deletes `.github/workflows/bkit-auto.yml` on every upgrade; replacement `bkit-cloud.yml` is opt-in module. Consumer who installed from unreleased dev snapshot 0bc0779 (has `bkit-auto.yml`, no `bkit-cloud.yml`) runs `pnpm bkit install` without `--cloud` → old file deleted, new file never seeded: rename treated as deletion, cloud automation silently disabled. Released consumers unaffected (rename never reached main) — affected cohort is exactly dev/dogfood/internal repos where this is dogfooded. **Fix:** treat the rename as migration — if `bkit-auto.yml` exists, seed `bkit-cloud.yml` from template before deleting old file, or gate orphan delete behind "bkit-cloud.yml now present".

5. **[C1 MEDIUM] `--cloud=opencode` precondition passes for ollama-configured `.opencode/`** (bkit-install.ts:1412–1421) — precondition only checks `fs.existsSync(.opencode)`. Consumer with `--opencode=ollama` (valid locally, points at `http://localhost:11434/v1`, apiKey `"ollama"`) can run `--cloud=opencode`, but GitHub runner has no local Ollama server → cloud job either no-ops (secret absent) or fails reaching localhost. Install succeeds but cloud opencode job can never function. **Fix:** in `--cloud=opencode` precondition, read `.opencode/opencode.json` and hard-error when configured provider is ollama or any local/keyless provider.

### P2–P3 (hardening / tech-debt — can follow)

- **[C1 LOW]** gateguard deny-mode silently degrades to allow on corrupt state file (readState `JSON.parse` without local try/catch)
- **[C2 LOW]** opencode job: unpinned `curl | bash` installer, missing `set -euo pipefail`
- **[C1 INFO]** opencode positional slash-command invocation unverified vs documented `--command` option
- **[C2 INFO]** opencode and claude jobs may double-act on same event (concurrent orchestrators)

## Deferred / follow-up

### Deferred from this cycle (documented, non-blocking):

1. **Manual live-run verification** — opencode job against NVIDIA NIM; claude job gating on absent secret; requires a runner and live secrets (cannot test in CI).
2. **`bkit install --cloud=opencode` on dogfood with `.opencode/` present** — requires a consumer repo with `.opencode/` and the secret set; deferred pending P1 remediation.

### Next immediate actions:

- **P1 items resolved** — all 5 fixed in commit `590d538`; 14 regression tests added in commit `ca5857b`.
- P2 hardening (corrupt-state fail-open + unpinned curl|bash) deferred to a follow-up cycle.
- Ready to create PR → merge to `dev` for release.

## Coverage & Quality Notes

- **Test coverage:** 1383 tests green (post-remediation); 2 skipped (intentional); 1 todo (deferred manual verification). 14 new P1 regression tests added in Step 10. Covers all 5 sub-plans + holistic coherence + P1 remediation.
- **Cross-plan coherence:** All byte-identity checks, manifest assertions, orphan-cleanup references (5 intentional lines in bkit-install.ts + bkit-manifest.test.ts), and template sync verified PASS.
- **Diff coverage:** Large-diff guard applied (>10k diff lines). Four files reviewed in full (bkit-cloud.yml, gateguard.js, opencode.json, bkit-install.ts opencode/cloud regions); remaining surface partially covered. Both reviewers flagged this limit; findings scoped to reviewed files.
- **No CRITICAL defect:** Neither lens (C1: Bugs/edge-cases; C2: Security) found a ship-blocking CRITICAL within reviewed surface. Max severity HIGH → verdict CONCERNS (not FAIL).
