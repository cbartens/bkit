// Example. Copy into the repo and own it.
// bkit install does not write this file and does not overwrite a copy.
// bkit-secrets.config.mjs — the only per-repo file in scripts/secrets/. Read by bkit-secrets.mjs.
// Replace the example rows below.
//
// Model: local gitignored env files are the source of truth; every store is made to match.
//   listed for a store, non-empty in source → written there when it differs
//   listed, empty / absent in source       → deleted there
//   live in a store, not listed for it     → deleted there, unless protected
// Preview first:  node scripts/secrets/bkit-secrets.mjs sync --dry-run
// Prove parity:   node scripts/secrets/bkit-secrets.mjs drift

export default {
  sources: {
    // Checked first for every key (first non-empty wins). Env-agnostic keys only: a key here
    // pins one value for preview and production alike, with no warning.
    // .bkit/.env → agent / bkit tooling secrets only; app and stack credentials stay in app env files.
    overlays: [".bkit/.env"],
    preview: ".bkit/.env",
    // `check` reference file. Default: .env.example beside `preview`.
    // example: "apps/web/.env.example",
  },

  // Stores, synced in this order. Key = the name `secrets` rows use; `type` defaults to the key.
  // Delete stores this repo does not use. `protect` = names this store keeps that no row lists.
  stores: {
    // Repo-wide Actions secrets; values from `preview`. Write-only: parity from the state file.
    github: {},
  },

  // Never written, never deleted, in any store: platform-injected or integration-managed.
  // CLAUDE_CODE_OAUTH_TOKEN comes from `claude setup-token`; claude.yml reads it.
  protected: ["CLAUDE_CODE_OAUTH_TOKEN"],

  // May stay empty without a `check` warning.
  optional: [
    "BKIT_GH_TOKEN",
    "BKIT_LINEAR_API_KEY",
    "BKIT_ANTHROPIC_API_KEY",
    "BKIT_CURSOR_API_KEY",
    "BKIT_OPENCODE_API_KEY",
    "BKIT_OPENROUTER_API_KEY",
    "BKIT_OLLAMA_API_KEY",
    "BKIT_TAVILY_API_KEY",
  ],

  // One row per secret, naming every store that holds a copy:
  //   NAME: "store" | ["store", ...]                         value from the env key NAME
  //   NAME: { to, from: "LOCAL_KEY" }                         store name differs from the env key
  //   NAME: { to, derive: "${APP_URL}/path" }                 value composed from other keys
  //   NAME: { to, manual: ["where it lives, how to update"] } copies no API reaches; listed on every run
  //   "eas:secret"                                             per-store option (EAS visibility)
  // Preview-only value: leave it out of the production env file; production stores then delete it.
  secrets: {
    // Read by claude.yml and the bkit-cloud.yml claude job; the env key carries the BKIT_ prefix.
    ANTHROPIC_API_KEY: { to: "github", from: "BKIT_ANTHROPIC_API_KEY" },
    // Classic read:packages: the cloud agent's `bkit install` + self-hosted Renovate's npm host rule.
    BKIT_GH_TOKEN_INSTALL: "github",
    // Fine-grained write token: self-hosted Renovate's platform auth (opens PRs, pushes renovate/* branches).
    BKIT_GH_TOKEN: "github",
    // npm automation token (read + write on the @cbartens scope): release.yml publishes @cbartens/bkit to npmjs.
    BKIT_NPM_TOKEN: "github",
  },
};
