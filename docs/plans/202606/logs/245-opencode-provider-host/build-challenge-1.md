Verdict: CONCERNS
Failures: 0

<!-- verdict:end -->

# Build Challenge 1 — Bugs

Lens: Bugs and edge cases — null safety, off-by-one, error paths, data integrity.

PARTIAL DIFF COVERAGE: Large Diff Guard triggered (>10k lines). Only the 4
highest-risk files were reviewed in full (bkit-cloud.yml, gateguard.js,
bkit-install.ts opencode/cloud regions, bkit-modules.ts opencode/cloud regions),
cross-referenced with bkit-cli.ts, bkit-manifest.ts, opencode.json template, and
git history. Findings limited to that scope. No CRITICAL found; max severity HIGH.

## Findings

### HIGH

#### Secret fan-out only covers 3 of the providers the installer accepts

File: .bkit/templates/.github/workflows/bkit-cloud.yml:341-344 (cross-ref .bkit/src/bkit-cli.ts:274-283, .bkit/src/bkit-modules.ts:1064-1068)
Class: mechanical
Description: `--opencode=<provider>` accepts ANY provider string. `parseArgs`
does no allowlist validation, and `renderOpencodeJson` has a generic fallback
(`${PROVIDER.toUpperCase()}_API_KEY`) for unknown providers. The installer's own
doctor PROVIDER_KEYS table (bkit-install.ts:1086) explicitly lists `openai` and
`anthropic` in addition to nvidia/openrouter/gemini, and the modules fallback
admits arbitrary providers (groq, cerebras, etc.). But the cloud workflow only
fans `OPENCODE_PROVIDER_KEY` out to `NVIDIA_API_KEY`, `OPENROUTER_API_KEY`,
`GEMINI_API_KEY`.
Reproduction / impact: `bkit install --opencode=openai` then
`bkit install --cloud=opencode --tracker=github`. The committed
.opencode/opencode.json references `${OPENAI_API_KEY}`. In the cloud job that var
is never set (only the 3 fanned names are), so opencode boots with an empty
apiKey → provider auth failure at runtime. Same for any provider outside the 3.
The setup advisory (bkit-modules.ts:2512) even claims the workflow maps to "all
known provider env var names", which is false for openai/anthropic/custom.
Suggested fix: Either (a) add OPENAI_API_KEY/ANTHROPIC_API_KEY (and any other
PROVIDER_KEYS entry) to the fan-out block, plus a generic note; or (b) at install
time validate the provider against the fan-out set when `--cloud=opencode` is
requested and hard-error on an uncovered provider; or (c) render the workflow's
fan-out from the consumer's configured provider envVar instead of a static list.

### MEDIUM

#### Orphan-rename of bkit-auto.yml mishandled — cloud workflow lost on upgrade for dev/dogfood snapshots

File: .bkit/src/bkit-install.ts:1222-1233 (cross-ref :1186-1219, :1166-1170)
Class: architectural
Description: The orphan block deletes `.github/workflows/bkit-auto.yml` on every
upgrade. The replacement `bkit-cloud.yml` is an OPT-IN module path (cloud is in
OPTIN_MODULES), so the candidate collector at line 1198 SKIPS it when the dest is
absent. A consumer who has only the old `bkit-auto.yml` therefore loses it AND
does not receive `bkit-cloud.yml` — the rename is treated as deletion, not
migration. They silently lose their cloud workflow until they re-run
`bkit install --cloud=...`. Git history shows the `bkit-cloud → bkit-auto` rename
(0bc0779) never reached main, so RELEASED consumers always have `bkit-cloud.yml`
(unaffected — it updates normally). The affected population is dev/dogfood/internal
repos installed from the unreleased dev snapshot — which is exactly where this is
dogfooded. The orphan-removal targeting `bkit-auto.yml` is effectively dead code
for the public, and silently destructive for the internal cohort.
Reproduction / impact: On a clone that installed from 0bc0779 (has bkit-auto.yml,
no bkit-cloud.yml), run `pnpm bkit install` (upgrade) without `--cloud`. Result:
bkit-auto.yml deleted, bkit-cloud.yml never seeded → cloud automation disabled.
Suggested fix: Treat the rename as a migration: if `bkit-auto.yml` exists and the
consumer is opted into cloud (or just before the opt-in skip), seed
`bkit-cloud.yml` from the rendered template before/instead of only deleting the
old file. Or gate the orphan delete behind "bkit-cloud.yml now present".

#### --cloud=opencode precondition passes for an ollama-configured .opencode/ that cannot run in cloud

File: .bkit/src/bkit-install.ts:1412-1421 (cross-ref bkit-modules.ts:1086-1089)
Class: architectural
Description: The precondition only checks `fs.existsSync(.opencode)`. A consumer
who ran `--opencode=ollama` has a valid `.opencode/` whose opencode.json points at
`http://localhost:11434/v1` with apiKey "ollama". `--cloud=opencode` is then
permitted. In the cloud job there is no local Ollama server on the GitHub runner,
and ollama has no key for the OPENCODE_PROVIDER_KEY gate, so the job either
no-ops (gate fails — secret absent) or, if a stray secret is set, fails trying to
reach localhost. No guard rejects ollama (a local-only provider) for the cloud
path.
Reproduction / impact: `bkit install --opencode=ollama` then
`bkit install --cloud=opencode --tracker=github` succeeds at install but the
cloud opencode job can never function.
Suggested fix: In the `--cloud=opencode` precondition, read
.opencode/opencode.json and hard-error (or warn) when the configured provider is
ollama (or any local/keyless provider), since the cloud runner has no local model
host.

### LOW

#### gateguard deny-mode silently degrades to allow on corrupt state file

File: .bkit/templates/.opencode/plugin/gateguard.js:118-126, 210-217
Class: mechanical
Description: `readState` calls `JSON.parse` without a local try/catch. A corrupt
session state file throws. In deny mode the throw is a non-GateGuard error, so the
outer catch (line 213) does NOT re-throw → fail-open (edit allowed) and the gate
is silently skipped for that session until the file is overwritten. Acceptable
under the documented fail-open contract, but deny mode is opt-in specifically to
block, and a single malformed temp file disables it without any signal.
Reproduction / impact: Corrupt/truncated
`$TMPDIR/bkit-gateguard/<session>.json` (e.g. interrupted write, disk full) →
deny mode stops blocking for that session.
Suggested fix: Wrap the `JSON.parse` in `readState` in try/catch returning
`{ files: {} }` on parse failure, so a corrupt file resets cleanly rather than
throwing into the fail-open boundary.

### INFO

#### opencode slash-command invocation via positional `run` message is unverified vs documented `--command`

File: .bkit/templates/.github/workflows/bkit-cloud.yml:346
Class: mechanical
Description: The job runs `opencode run "/bkit-auto <phase> <arg>"`, passing a
slash command as a positional message. The plan's own verify note
(build-plan-verify-5-1.md:14) records that opencode exposes a `--command` option
for slash commands, while line 15 endorses the positional form. If opencode's
`run` does not resolve a leading `/name` in the message body as a custom command
(treating it as literal prompt text instead), the orchestrator command never
fires. The plan asserts the positional form works; flagging as a runtime
dependency to confirm against opencode v1.16.x behaviour, not a confirmed bug.
Reproduction / impact: If positional slash resolution is unsupported, the cloud
opencode job runs but never invokes /bkit-auto.
Suggested fix: Confirm against the pinned opencode version; if unsupported, switch
to `opencode run --command "bkit-auto" -- <phase> <arg>` (or the documented form).

#### opencode and claude jobs may double-act on the same event

File: .bkit/templates/.github/workflows/bkit-cloud.yml:83-96, 229-237
Class: architectural
Description: Both jobs share identical `if:` gates and both run when their
respective secret is present. The header comments this is intentional ("additive").
If a repo sets BOTH ANTHROPIC_API_KEY and OPENCODE_PROVIDER_KEY, both
orchestrators run /bkit-auto for the same phase/arg concurrently. The YAML
concurrency group is workflow-level (one run hosts both jobs) so it does NOT
serialise the two agents against each other; cross-agent dedup relies entirely on
the orchestrator stale-run guard + status.json lock noted for the cross-surface
case. Flagging as a known design assumption — collision safety is delegated
outside this file.
Reproduction / impact: Both secrets set → two agents act on the same PR/issue;
correctness depends on the runtime lock, not the workflow.
Suggested fix: None required if the orchestrator lock is trusted; otherwise
document that exactly one cloud secret should be set, or gate opencode off when
ANTHROPIC_API_KEY is also present.

## Verdict: CONCERNS

No correctness-breaking CRITICAL defects. One HIGH (provider fan-out gap that
silently breaks any non-{nvidia,openrouter,gemini} cloud provider) and two MEDIUM
(rename-migration data loss for dev/dogfood cohort; ollama cloud precondition gap)
are worth fixing before ship. gateguard fail-open and arg extraction are correct
against the captured spike payload; token substitution
(@@OPENCODE_PROVIDER_ENV_VAR@@ etc.) resolves correctly including the ollama
special-case.
