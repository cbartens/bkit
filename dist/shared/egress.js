// Egress registry leaf. Pure data: zero imports, zero control flow. All branching lives
// in install/cloud-env.ts.
/**
 * Providers bkit supports for the opencode host. `--opencode=<provider>` accepts
 * ONLY these — anything else is rejected (no generic/arbitrary-endpoint fallback).
 * Keep in sync with OPENCODE_PROVIDER_DEFAULTS (below) and
 * GATEWAY_COLUMN (render/models.ts § Models lookup).
 */
export const OPENCODE_PROVIDERS = [
    // OpenAI-compatible npm driver — endpoint + key per provider.
    "openrouter",
    "ollama",
    // opencode-native gateways — two DISTINCT models.dev providers with separate catalogs.
    // CLI: opencode-zen / opencode-go. Agent model pins: opencode/<id> (Zen built-in id) and
    // opencode-go/<id>. Both auth via BKIT_OPENCODE_API_KEY. See providers.md § Models.
    "opencode-zen",
    "opencode-go",
];
// Per-provider provider key name + base URL + env var suggestions.
// These are sane defaults; consumers tune after install.
// npmPackage: set for custom OpenAI-compatible providers that use npm-based AI SDK driver.
export const OPENCODE_PROVIDER_DEFAULTS = {
    // Aggregator — one key, every model (incl :free variants). A named, pinned provider
    // (NOT an any-endpoint fallback).
    // opencode custom providers use the npm driver (NOT an "api" field, which is invalid
    // and makes opencode reject the whole config) and read keys via {env:VAR} — never
    // shell ${VAR}. See https://opencode.ai/docs/config + /docs/providers.
    openrouter: {
        envVar: "BKIT_OPENROUTER_API_KEY",
        baseURL: "https://openrouter.ai/api/v1",
        apiPlaceholder: "{env:BKIT_OPENROUTER_API_KEY}",
        npmPackage: "@ai-sdk/openai-compatible",
        displayName: "OpenRouter",
    },
    // Cloud-hosted Ollama (ollama.com). Matches opencode's own naming where built-in
    // `ollama` = the cloud service.
    ollama: {
        envVar: "BKIT_OLLAMA_API_KEY",
        baseURL: "https://ollama.com/v1",
        apiPlaceholder: "{env:BKIT_OLLAMA_API_KEY}",
        npmPackage: "@ai-sdk/openai-compatible",
        displayName: "Ollama",
    },
    // opencode-native gateways — two DISTINCT models.dev providers, both auth'd via
    // BKIT_OPENCODE_API_KEY. Built-in (apiKey only): OpenCode resolves endpoints + per-model SDK
    // from models.dev. CLI keys are opencode-zen / opencode-go; Zen's models.dev id is
    // `opencode` (agent pins opencode/<id>), Go's id is `opencode-go` (opencode-go/<id>).
    "opencode-zen": {
        envVar: "BKIT_OPENCODE_API_KEY",
        baseURL: "",
        apiPlaceholder: "{env:BKIT_OPENCODE_API_KEY}",
        builtin: true,
        providerId: "opencode",
        displayName: "OpenCode Zen",
    },
    "opencode-go": {
        envVar: "BKIT_OPENCODE_API_KEY",
        baseURL: "",
        apiPlaceholder: "{env:BKIT_OPENCODE_API_KEY}",
        builtin: true,
        providerId: "opencode-go",
        displayName: "OpenCode Go",
    },
};
/**
 * The shipped egress sources. `hosts` and `bases` are literal arrays: the leaf parses
 * no URL. For `opencode-provider` rows the literals are gate-checked against the
 * provider baseURL by the suffix-invariant test.
 *
 * Not listed:
 * - Dependency-updater hosts (Renovate, Dependabot): egress on the updater's runner,
 *   never inside an agent session.
 * - The literal "none" member of `ISSUE_TRACKERS`: a sentinel. The completeness test
 *   skips exactly "none" and asserts it was the only skip.
 * - `json.schemastore.org`: fetched by the editor JSON language server, never by an
 *   agent tool call.
 * - `kimi.com`: outside the four-provider opencode allowlist
 *   (`opencode-provider-allowlist-cut-to-four`).
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
        hosts: ["raw.githubusercontent.com"],
        bases: ["github.com", "githubusercontent.com"],
    },
    { id: "skills-sh", kind: "skills", hosts: ["skills.sh"], bases: ["skills.sh"] },
    { id: "tooling-tavily", kind: "tooling-api", hosts: ["api.tavily.com"], bases: ["tavily.com"] },
    // Audit anchor standards. Every consumer gets the `docs/templates/bkit-audit-*.md` set,
    // and each template's Standards step reads its anchors over WebFetch. Only standards
    // bodies, specs and model makers' prompting guides belong here: a vendor or platform a
    // template names as an example (Sentry, Supabase, Apple, Google Play, web.dev) is
    // stack-specific, so a consumer that uses it declares it in its own block.
    {
        id: "audit-security-ai",
        kind: "audit-standard",
        hosts: [
            "owasp.org",
            "genai.owasp.org",
            "mas.owasp.org",
            "atlas.mitre.org",
            "www.nist.gov",
            "airc.nist.gov",
            "nvlpubs.nist.gov",
            "openssf.org",
            "best.openssf.org",
            "baseline.openssf.org",
            "slsa.dev",
            "modelcontextprotocol.io",
        ],
        bases: [
            "owasp.org",
            "mitre.org",
            "nist.gov",
            "openssf.org",
            "slsa.dev",
            "modelcontextprotocol.io",
        ],
    },
    {
        id: "audit-prompting-guides",
        kind: "audit-standard",
        hosts: [
            "docs.claude.com",
            "platform.claude.com",
            "www.anthropic.com",
            "platform.openai.com",
            "cookbook.openai.com",
            "developers.openai.com",
            "ai.google.dev",
        ],
        bases: ["claude.com", "anthropic.com", "openai.com", "google.dev"],
    },
    {
        id: "audit-law-and-specs",
        kind: "audit-standard",
        hosts: [
            "www.w3.org",
            "www.iso.org",
            "www.etsi.org",
            "eur-lex.europa.eu",
            "digital-strategy.ec.europa.eu",
            "ec.europa.eu",
            "www.edpb.europa.eu",
            "ico.org.uk",
            "www.rfc-editor.org",
            "datatracker.ietf.org",
            "cabforum.org",
            "schema.org",
            "spdx.org",
            "opentelemetry.io",
        ],
        bases: [
            "w3.org",
            "iso.org",
            "etsi.org",
            "europa.eu",
            "ico.org.uk",
            "rfc-editor.org",
            "ietf.org",
            "cabforum.org",
            "schema.org",
            "spdx.org",
            "opentelemetry.io",
        ],
    },
    {
        id: "audit-engineering-practice",
        kind: "audit-standard",
        hosts: [
            "sre.google",
            "dora.dev",
            "12factor.net",
            "www.finops.org",
            "focus.finops.org",
            "c4model.com",
            "diataxis.fr",
            "www.nngroup.com",
            "scrumguides.org",
            "kanbanguides.org",
            "endoflife.date",
            "bugzilla.mozilla.org",
            "wiki.mozilla.org",
        ],
        bases: [
            "sre.google",
            "dora.dev",
            "12factor.net",
            "finops.org",
            "c4model.com",
            "diataxis.fr",
            "nngroup.com",
            "scrumguides.org",
            "kanbanguides.org",
            "endoflife.date",
            "mozilla.org",
        ],
    },
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
 * Shared-tenant apexes: a base collapse to one of these grants every tenant on the
 * platform. The gate is a DENY, never a rewriter; an apex absent from this list passes.
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
