// Egress registry leaf. Pure data: zero imports, zero control flow, so every module
// that needs the shipped host set can read it without a cycle and without pulling
// install machinery behind it. All branching lives in bkit-cloud-env.ts, which is the
// coverage-measured file; a base collapse or a rejection test computed here would move
// gated branches out of the measured set.
// Per-provider provider key name + base URL + env var suggestions.
// These are sane defaults; consumers tune after install.
// npmPackage: set for custom OpenAI-compatible providers that use npm-based AI SDK driver.
export const OPENCODE_PROVIDER_DEFAULTS = {
    // Aggregator — one key, every model (incl :free variants). Re-added as a named, pinned
    // provider (NOT the any-endpoint fallback #245 removed).
    // opencode custom providers use the npm driver (NOT an "api" field, which is invalid
    // and makes opencode reject the whole config) and read keys via {env:VAR} — never
    // shell ${VAR}. See https://opencode.ai/docs/config + /docs/providers.
    openrouter: {
        envVar: "OPENROUTER_API_KEY",
        baseURL: "https://openrouter.ai/api/v1",
        apiPlaceholder: "{env:OPENROUTER_API_KEY}",
        npmPackage: "@ai-sdk/openai-compatible",
        displayName: "OpenRouter",
    },
    // Cloud-hosted Ollama (ollama.com). Matches opencode's own naming where built-in
    // `ollama` = the cloud service.
    ollama: {
        envVar: "OLLAMA_API_KEY",
        baseURL: "https://ollama.com/v1",
        apiPlaceholder: "{env:OLLAMA_API_KEY}",
        npmPackage: "@ai-sdk/openai-compatible",
        displayName: "Ollama",
    },
    // opencode-native gateways — two DISTINCT models.dev providers, both auth'd via
    // OPENCODE_API_KEY. Built-in (apiKey only): OpenCode resolves endpoints + per-model SDK
    // from models.dev. CLI keys are opencode-zen / opencode-go; Zen's models.dev id is
    // `opencode` (agent pins opencode/<id>), Go's id is `opencode-go` (opencode-go/<id>).
    "opencode-zen": {
        envVar: "OPENCODE_API_KEY",
        baseURL: "",
        apiPlaceholder: "{env:OPENCODE_API_KEY}",
        builtin: true,
        providerId: "opencode",
        displayName: "OpenCode Zen",
    },
    "opencode-go": {
        envVar: "OPENCODE_API_KEY",
        baseURL: "",
        apiPlaceholder: "{env:OPENCODE_API_KEY}",
        builtin: true,
        providerId: "opencode-go",
        displayName: "OpenCode Go",
    },
};
/**
 * The shipped egress sources. `hosts` and `bases` are literal arrays: the leaf parses
 * no URL. For `opencode-provider` rows the literals are gate-checked against the
 * provider baseURL by the suffix-invariant test, so a literal that drifts from its
 * provider fails at authoring time.
 *
 * Deliberate absences, recorded so a later reader does not "fix" them:
 * - `DEP_UPDATERS` / `RENOVATE_RUNNERS` hosts. That egress happens on GitHub Actions
 *   runners, never inside an agent session.
 * - The literal "none" member of `ISSUE_TRACKERS` / `DEP_UPDATERS`. A sentinel, not a
 *   source. The completeness test skips exactly "none" and asserts it was the only skip.
 * - `json.schemastore.org`. Fetched by the editor JSON language server for the settings
 *   `$schema`, never by an agent tool call, so no WebFetch, curl or hook decision is
 *   ever taken against it.
 * - `kimi.com`. Removed when the opencode provider allowlist was cut to four; re-adding
 *   it would reverse an ACTIVE decision.
 */
export const BKIT_EGRESS_SOURCES = [
    {
        id: "openrouter",
        kind: "opencode-provider",
        hosts: ["openrouter.ai"],
        bases: ["openrouter.ai"],
    },
    { id: "ollama", kind: "opencode-provider", hosts: ["ollama.com"], bases: ["ollama.com"] },
    {
        id: "opencode-zen",
        kind: "opencode-provider",
        hosts: ["opencode.ai", "models.dev"],
        bases: ["opencode.ai", "models.dev"],
        reason: "baseURL is empty (builtin); endpoints resolved via models.dev",
    },
    {
        id: "opencode-go",
        kind: "opencode-provider",
        hosts: ["opencode.ai", "models.dev"],
        bases: ["opencode.ai", "models.dev"],
        reason: "baseURL is empty (builtin); a distinct registry key, so a distinct row",
    },
    {
        id: "mcp-github",
        kind: "tracker-mcp",
        hosts: ["api.githubcopilot.com"],
        bases: ["githubcopilot.com"],
    },
    {
        id: "mcp-linear",
        kind: "tracker-mcp",
        hosts: ["mcp.linear.app", "api.linear.app"],
        bases: ["linear.app"],
    },
    {
        id: "agent-claude",
        kind: "agent-host",
        hosts: ["console.anthropic.com"],
        bases: ["anthropic.com", "claude.com"],
    },
    { id: "agent-cursor", kind: "agent-host", hosts: ["api.cursor.com"], bases: ["cursor.com"] },
    { id: "agent-opencode", kind: "agent-host", hosts: ["opencode.ai"], bases: ["opencode.ai"] },
    {
        id: "pkg-npm",
        kind: "package-registry",
        hosts: ["registry.npmjs.org"],
        bases: ["npmjs.com", "npmjs.org"],
        reason: "the registry API host sits on a sibling TLD its .com base cannot cover on a label boundary",
    },
    {
        id: "pkg-github",
        kind: "package-registry",
        hosts: ["npm.pkg.github.com", "raw.githubusercontent.com"],
        bases: ["github.com", "githubusercontent.com"],
    },
    { id: "skills-sh", kind: "skills", hosts: ["skills.sh"], bases: ["skills.sh"] },
    { id: "tooling-tavily", kind: "tooling-api", hosts: ["api.tavily.com"], bases: ["tavily.com"] },
];
/**
 * Public-suffix shortlist. A naive last-two-labels collapse turns `app.example.co.uk`
 * into `co.uk`, allowing an entire national namespace, so a host whose final two labels
 * match one of these takes three labels instead.
 */
export const MULTI_LABEL_SUFFIXES = [
    "co.uk",
    "org.uk",
    "ac.uk",
    "gov.uk",
    "co.jp",
    "or.jp",
    "ne.jp",
    "com.au",
    "net.au",
    "org.au",
    "com.br",
    "com.cn",
    "net.cn",
    "org.cn",
    "com.mx",
    "com.tr",
    "co.nz",
    "co.za",
    "co.in",
    "com.sg",
    "com.hk",
];
/**
 * Shared-tenant apexes. A base collapse to one of these grants every tenant on the
 * platform, not just the intended one. The gate is a DENY, never a rewriter: an apex
 * absent from this list passes, so an unknown platform is allowed rather than blocked.
 */
export const MULTI_TENANT_APEXES = [
    "amazonaws.com",
    "googleapis.com",
    "azure.com",
    "azurewebsites.net",
    "cloudfront.net",
    "workers.dev",
    "vercel.app",
    "netlify.app",
    "pages.dev",
    "hf.space",
    "run.app",
    "appspot.com",
    "herokuapp.com",
    "fly.dev",
    "onrender.com",
    "supabase.co",
    "github.io",
    "gitlab.io",
];
