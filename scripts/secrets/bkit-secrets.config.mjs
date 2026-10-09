// bkit-secrets.config.mjs — secret-sync scope for the bkit repo. Adopted from
// .bkit/templates/scripts/secrets/; bkit-secrets.mjs stays byte-identical to the template.
//
// bkit is the @cbartens/bkit package itself: no deployed app, so GitHub Actions is the only
// store. Values live in .bkit/.env.
//   node scripts/secrets/bkit-secrets.mjs drift          read-only: does GitHub hold what .bkit/.env holds?
//   node scripts/secrets/bkit-secrets.mjs sync --dry-run preview writes and deletes

export default {
  // No app env file: the agent env file is the only source. No production surface.
  sources: { overlays: [".bkit/.env"], preview: ".bkit/.env" },

  stores: { github: {} },

  // Not in .bkit/.env (generated out of band): never written, never deleted.
  //   CLAUDE_CODE_OAUTH_TOKEN → `claude setup-token`; read by claude.yml
  protected: ["CLAUDE_CODE_OAUTH_TOKEN"],

  // .bkit/.env.example "Optional examples": may stay empty without a `check` warning.
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

  secrets: {
    // claude.yml + bkit-cloud.yml (claude job). Stored under the BKIT_ prefix so direnv does not export the vendor name.
    ANTHROPIC_API_KEY: { to: "github", from: "BKIT_ANTHROPIC_API_KEY" },
    // Classic read:packages: the cloud agent's `bkit install` + self-hosted Renovate's npm host rule.
    BKIT_GH_TOKEN_INSTALL: "github",
    // Fine-grained WRITE token: self-hosted Renovate's platform auth (opens PRs, pushes renovate/* branches).
    BKIT_GH_TOKEN: "github",
  },
};
