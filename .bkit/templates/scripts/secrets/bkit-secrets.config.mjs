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
    preview: "apps/web/.env.preview",
    // No production surface → delete this line; per-environment stores then sync preview only.
    production: "apps/web/.env.production",
    // `check` reference file. Default: .env.example beside `preview`.
    // example: "apps/web/.env.example",
  },

  // Stores, synced in this order. Key = the name `secrets` rows use; `type` defaults to the key.
  // Delete stores this repo does not use. `protect` = names this store keeps that no row lists.
  stores: {
    // Repo-wide Actions secrets; values from `preview`. Write-only: parity from the state file.
    github: {},
    // `project` (default .vercel/project.json), else VERCEL_ORG_ID + VERCEL_PROJECT_ID. Token: VERCEL_TOKEN, else `vercel login`.
    vercel: {},
    // `ref` = env key holding the project ref (default SUPABASE_PROJECT_ID); token SUPABASE_ACCESS_TOKEN.
    // SUPABASE_* names are platform-reserved: never written, never deleted.
    supabase: { protect: [] },
    // `dir` = EAS-linked app; `visibility` default for rows without an option. Prefer sensitive:
    // `secret` cannot be read back, so drift falls back to the last recorded push.
    eas: { dir: "apps/mobile", visibility: "sensitive" },
    // `project` = env key holding the GCP project (default GCP_PROJECT_ID). Last: a backup no deployment reads.
    gcp: {},
  },

  // Never written, never deleted, in any store: platform-injected or integration-managed.
  protected: ["VERCEL_OIDC_TOKEN"],

  // May stay empty without a `check` warning.
  optional: [],

  // One row per secret, naming every store that holds a copy:
  //   NAME: "store" | ["store", ...]                         value from the env key NAME
  //   NAME: { to, from: "LOCAL_KEY" }                         store name differs from the env key
  //   NAME: { to, derive: "${APP_URL}/path" }                 value composed from other keys
  //   NAME: { to, manual: ["where it lives, how to update"] } copies no API reaches; listed on every run
  //   "eas:secret"                                             per-store option (EAS visibility)
  // Preview-only value: leave it out of the production env file; production stores then delete it.
  secrets: {
    DATABASE_URL: ["vercel", "gcp"],
    EXAMPLE_API_KEY: ["vercel", "supabase", "gcp"],
    VERCEL_TOKEN: "github",
    VERCEL_ORG_ID: "github",
    VERCEL_PROJECT_ID: "github",
    // EXPO_TOKEN: ["github", "eas"],
    // WEBHOOK_URL: { to: "supabase", derive: "${APP_URL}/api/webhooks/example" },
    // STRIPE_WEBHOOK_SECRET: { to: "vercel", manual: ["Stripe Dashboard → Webhooks → signing secret (value originates there)"] },
  },
};
