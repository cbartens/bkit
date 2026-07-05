# sync.config.sh — secret-sync scope for the bkit repo (sourced by sync-github.sh).
#
# Modelled 1:1 on gether's config-driven sync (scripts/secrets/sync.config.sh),
# trimmed to what bkit needs. bkit is the @cbartens/bkit package itself — it has
# NO deployed web app, so there are no Vercel / Supabase / Google surfaces here,
# only the GitHub Actions secret set.
#
# Semantics (see sync-github.sh):
#   - GITHUB_KEYS entry present + non-empty in a source env file → upsert on the repo.
#   - GITHUB_KEYS entry empty/absent                             → reconcile-deleted.
#   - PROTECTED_KEYS                                             → never pushed, never deleted.
# Values resolve from AGENT_ENV_FILES first, then PREVIEW_ENV_FILE.

# Source env files (agent/CI-tier secrets). bkit keeps everything in .bkit/.env.
AGENT_ENV_FILES=(
  ".bkit/.env"
)

# No web app on bkit — point the "preview" fallback at the same agent env file so
# the script's ENV_FILE existence check passes and get_val has a valid fallback.
PREVIEW_ENV_FILE=".bkit/.env"

# The GitHub Actions secrets bkit's workflows consume:
#   - ANTHROPIC_API_KEY       → claude.yml + bkit-cloud.yml (claude job)
#   - LINEAR_API_KEY          → tracker/router workflows
#   - GH_BKIT_TOKEN_INSTALL   → classic read:packages, for the cloud agent's `bkit install`
#                               (@cbartens/bkit fetch); bkit's own ci.yml needs no token
#   - GH_BKIT_TOKEN           → the general fine-grained WRITE token; self-hosted Renovate's
#                               platform auth (opens PRs, pushes renovate/* branches, edits
#                               workflow SHAs) + the GitHub MCP server (#325 / DE-35)
GITHUB_KEYS=(
  "ANTHROPIC_API_KEY"
  "LINEAR_API_KEY"
  "GH_BKIT_TOKEN_INSTALL"
  "GH_BKIT_TOKEN"
)

# Never pushed, never deleted — secrets bkit's workflows need that are NOT stored in
# .bkit/.env (generated/registered out of band).
#   - CLAUDE_CODE_OAUTH_TOKEN → `claude setup-token`; used by claude.yml. Not in .bkit/.env.
PROTECTED_KEYS=(
  "CLAUDE_CODE_OAUTH_TOKEN"
)
