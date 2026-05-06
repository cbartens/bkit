// bkit-tier1-defaults.ts — Versioned-defaults source-of-truth for Tier-1 JSON templates (P3.T6a)
//
// Purpose: Migration prerequisite for migrateTier1JsonToTier2 (P3.T6).
// Snapshots the bkit-shipped shape of .claude/settings.json and .cursor/hooks.json
// at each prior version. Used by migrateTier1JsonToTier2 to identify which keys
// were bkit-owned (vs consumer-added) when a consumer installed an older bkit version.
//
// Source of truth: `git show <tag>:.agents/templates/.claude/settings.json` and
// `git show <tag>:.agents/templates/.cursor/hooks.json` at each tag.
//
// Extracted from: v0.5.0 and v0.5.1 tags (the only Tier-1 versions before v0.8.0 reclass).
// Versions 0.6.x and 0.7.x use the same template shape as 0.5.x (no template changes landed).
//
// Design: Record keyed by semver string → per-file defaults object.
// Lookup: find the latest version <= consumer's .bkit-version on disk.
// Note: v0.1.x–v0.4.x shipped hooks as a separate module (different structure);
// Tier-1 classification for .claude/settings.json and .cursor/hooks.json started at v0.5.0.

import type { JsonValue } from "./bkit-tiers.js";

export interface Tier1VersionDefaults {
  ".claude/settings.json": Record<string, JsonValue>;
  ".cursor/hooks.json": Record<string, JsonValue>;
}

// ---------------------------------------------------------------------------
// v0.5.0 — first Tier-1 classification of these files
// Extracted from: git show v0.5.0:.agents/templates/.claude/settings.json
//                 git show v0.5.0:.agents/templates/.cursor/hooks.json
// ---------------------------------------------------------------------------

const CLAUDE_SETTINGS_V050: Record<string, JsonValue> = {
  $schema: "https://json.schemastore.org/claude-code-settings.json",
  permissions: {
    allow: [
      "Skill(*)",
      "Bash(*)",
      "Edit(*)",
      "Write(*)",
      "mcp__claude_ai_Linear__get_issue",
      "mcp__claude_ai_Linear__list_issues",
      "mcp__claude_ai_Linear__save_issue",
      "mcp__claude_ai_Linear__list_comments",
      "mcp__claude_ai_Linear__save_comment",
      "WebSearch",
      "WebFetch(domain:github.com)",
      "WebFetch(domain:api.github.com)",
      "WebFetch(domain:linear.app)",
      "WebFetch(domain:docs.anthropic.com)",
      "WebFetch(domain:docs.claude.com)",
      "WebFetch(domain:cursor.com)",
    ],
    deny: [
      "Bash(rm -rf /*)",
      "Bash(rm -rf ~/*)",
      "Bash(rm -rf $HOME/*)",
      "Bash(chmod -R 777 /:*)",
      "Read(./.env)",
      "Read(./.env.*)",
      "Read(./apps/*/.env)",
      "Read(./apps/*/.env.*)",
      "Read(./packages/*/.env)",
      "Read(./packages/*/.env.*)",
      "Read(./**/secrets/*.env*)",
      "Read(./**/*.pem)",
      "Read(./**/*.p12)",
      "Read(./**/id_rsa)",
    ],
    ask: [
      "Bash(sudo:*)",
      "Bash(curl:*)",
      "Bash(wget:*)",
      "Bash(brew install:*)",
      "Bash(pnpm publish:*)",
      "Bash(npm publish:*)",
      "Bash(bun publish:*)",
      "Bash(git push --force:*)",
      "Bash(git push -f:*)",
      "Bash(git reset --hard:*)",
      "Bash(git clean -fd:*)",
      "Bash(git clean -fdx:*)",
      "Bash(git filter-branch:*)",
      "Bash(gh repo delete:*)",
      "Bash(gh pr close:*)",
      "Bash(gh release delete:*)",
      "Bash(vercel rm:*)",
      "Bash(vercel remove:*)",
      "Bash(supabase db reset:*)",
      "Bash(supabase projects delete:*)",
    ],
    defaultMode: "default",
  },
  mcpServers: {
    linear: {
      url: "https://mcp.linear.app/mcp",
    },
  },
  hooks: {
    SessionStart: [
      {
        hooks: [
          {
            type: "command",
            command: "bash .claude/hooks/preflight.sh",
          },
        ],
      },
    ],
  },
};

const CURSOR_HOOKS_V050: Record<string, JsonValue> = {
  hooks: [
    {
      event: "sessionStart",
      command: "echo '[bkit] session started'",
    },
    {
      event: "sessionStop",
      command: "echo '[bkit] session stopped'",
    },
  ],
};

// ---------------------------------------------------------------------------
// v0.5.1 — identical template shapes to v0.5.0 (no template changes)
// Extracted from: git show v0.5.1:.agents/templates/...
// ---------------------------------------------------------------------------

const CLAUDE_SETTINGS_V051 = CLAUDE_SETTINGS_V050;
const CURSOR_HOOKS_V051 = CURSOR_HOOKS_V050;

// ---------------------------------------------------------------------------
// BKIT_TIER1_DEFAULTS_BY_VERSION — public SoT
//
// Keys are semver strings. Lookup: find the latest key <= consumer's installed version.
// Versions 0.6.x and 0.7.x shipped the same template shapes as 0.5.x.
// ---------------------------------------------------------------------------

export const BKIT_TIER1_DEFAULTS_BY_VERSION: Record<string, Tier1VersionDefaults> = {
  "0.5.0": {
    ".claude/settings.json": CLAUDE_SETTINGS_V050,
    ".cursor/hooks.json": CURSOR_HOOKS_V050,
  },
  "0.5.1": {
    ".claude/settings.json": CLAUDE_SETTINGS_V051,
    ".cursor/hooks.json": CURSOR_HOOKS_V051,
  },
  // 0.6.x: same template shapes as 0.5.1 (sub-plan-1 changes don't touch these templates)
  "0.6.0": {
    ".claude/settings.json": CLAUDE_SETTINGS_V051,
    ".cursor/hooks.json": CURSOR_HOOKS_V051,
  },
  // 0.7.x: same template shapes as 0.5.1 (sub-plan-2 changes don't touch these templates)
  "0.7.0": {
    ".claude/settings.json": CLAUDE_SETTINGS_V051,
    ".cursor/hooks.json": CURSOR_HOOKS_V051,
  },
};

// ---------------------------------------------------------------------------
// lookupTier1Defaults — find the defaults for a given on-disk bkit version
//
// Returns the defaults for the latest registered version <= onDiskVersion.
// Returns null if no registered version is <= onDiskVersion (very old pre-0.5.0 install).
// ---------------------------------------------------------------------------

export function lookupTier1Defaults(onDiskVersion: string): Tier1VersionDefaults | null {
  const versions = Object.keys(BKIT_TIER1_DEFAULTS_BY_VERSION);
  // Sort descending by semver
  const sorted = versions.sort((a, b) => {
    const pa = a.split(".").map(Number);
    const pb = b.split(".").map(Number);
    for (let i = 0; i < 3; i++) {
      const av = pa[i] ?? 0;
      const bv = pb[i] ?? 0;
      if (av !== bv) return bv - av; // descending
    }
    return 0;
  });

  for (const v of sorted) {
    if (semverLte(v, onDiskVersion)) {
      return BKIT_TIER1_DEFAULTS_BY_VERSION[v]!;
    }
  }
  return null;
}

// Semver comparison: returns true if a <= b
function semverLte(a: string, b: string): boolean {
  const pa = a.replace(/^v/, "").split(".").map(Number);
  const pb = b.replace(/^v/, "").split(".").map(Number);
  for (let i = 0; i < 3; i++) {
    const av = pa[i] ?? 0;
    const bv = pb[i] ?? 0;
    if (av < bv) return true;
    if (av > bv) return false;
  }
  return true; // equal
}
