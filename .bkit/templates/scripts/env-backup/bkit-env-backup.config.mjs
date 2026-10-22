// Example. Copy into the repo and own it.
// bkit install does not write this file and does not overwrite a copy.
// bkit-env-backup.config.mjs — the only per-repo file in scripts/env-backup/. Read by bkit-env-backup.mjs.
//
// skip: gitignored env files that never get an encrypted copy (generated files, other checkouts).
// Glob syntax over `/`-separated paths from the repo root: `*` and `?` stay inside one folder, `**` crosses
// folders. A pattern without a leading `/` matches at any depth; a leading `/` anchors it to the repo root.

export default {
  skip: [
    ".vercel/**",
    "supabase/.temp/**",
    ".worktrees/**",
    ".claude/worktrees/**",
    "node_modules/**",
    "tmp/**",
  ],
};
