import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  parseEnvrc,
  parseDotenv,
  resolveConsumerPnpm,
  renderCorepackLine,
  resolveCloudEnvVars,
  renderCloudEnvBlock,
  renderCloudEnvNotes,
  extractDebugFetchProvisionRecipes,
  renderCloudDebugFetchProvision,
  renderCloudCacheBust,
  extractAllowedDomains,
  expandAllowedDomains,
  renderCloudNetworkAllowlist,
  writeClaudeCloudDoc,
} from "./bkit-cloud-env";
import type { TokenMap } from "./bkit-tokens";

let tmpDir: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-cloud-env-test-"));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

function write(rel: string, content: string): void {
  const abs = path.join(tmpDir, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, content, "utf-8");
}

describe("parseEnvrc", () => {
  it("extracts dotenv targets in order, unsets (single + multi), and exports", () => {
    const { dotenvFiles, unsets, exports } = parseEnvrc(
      [
        "# a comment",
        "dotenv_if_exists .bkit/.env",
        "dotenv_if_exists apps/web/.env.local",
        "dotenv .env.plain",
        "unset UPSTASH_REDIS_REST_URL",
        "unset FOO BAR",
        'export DIRECT="hello world"',
        "PATH_add ./bin", // ignored — not a directive we follow
      ].join("\n"),
    );
    expect(dotenvFiles).toEqual([".bkit/.env", "apps/web/.env.local", ".env.plain"]);
    expect(unsets).toEqual(["UPSTASH_REDIS_REST_URL", "FOO", "BAR"]);
    expect(exports).toEqual([["DIRECT", "hello world"]]);
  });
});

describe("parseDotenv", () => {
  it("parses KEY=value, honours quotes, export prefix, and '=' inside value", () => {
    const pairs = parseDotenv(
      [
        "# comment",
        "",
        "PLAIN=value",
        'QUOTED="with spaces"',
        "SINGLE='single'",
        "export EXPORTED=exp",
        "URL=postgres://u:p@host/db?a=b",
        "not a valid line",
      ].join("\n"),
    );
    expect(pairs).toEqual([
      ["PLAIN", "value"],
      ["QUOTED", "with spaces"],
      ["SINGLE", "single"],
      ["EXPORTED", "exp"],
      ["URL", "postgres://u:p@host/db?a=b"],
    ]);
  });
});

describe("resolveConsumerPnpm / renderCorepackLine", () => {
  it("parses the full pnpm version from packageManager", () => {
    write("package.json", JSON.stringify({ name: "x", packageManager: "pnpm@10.34.3" }));
    expect(resolveConsumerPnpm(tmpDir)).toBe("10.34.3");
    expect(renderCorepackLine(tmpDir)).toBe(
      "corepack enable && corepack prepare pnpm@10.34.3 --activate",
    );
  });

  it("degrades to bare corepack enable when packageManager is absent", () => {
    write("package.json", JSON.stringify({ name: "x" }));
    expect(resolveConsumerPnpm(tmpDir)).toBe("");
    expect(renderCorepackLine(tmpDir)).toContain("corepack enable");
    expect(renderCorepackLine(tmpDir)).not.toContain("prepare pnpm@ ");
  });
});

describe("resolveCloudEnvVars", () => {
  it("follows .envrc: last-source wins, honours unsets, drops hijack + empty, flags placeholders", () => {
    write(
      ".envrc",
      [
        "dotenv_if_exists .bkit/.env",
        "dotenv_if_exists apps/web/.env.local",
        "unset UPSTASH_REDIS_REST_URL",
      ].join("\n"),
    );
    write(
      ".bkit/.env",
      [
        "GH_BKIT_TOKEN=from_bkit_env",
        "ANTHROPIC_API_KEY=sk-should-be-dropped",
        "UPSTASH_REDIS_REST_URL=redis://dropped",
        "EMPTY_VAR=",
      ].join("\n"),
    );
    write("apps/web/.env.local", ["FOO=bar", "GH_BKIT_TOKEN=override_wins"].join("\n"));

    const res = resolveCloudEnvVars(tmpDir);
    const map = Object.fromEntries(res.included);

    expect(res.hasEnvrc).toBe(true);
    expect(res.sources).toEqual([".bkit/.env", "apps/web/.env.local"]);
    expect(map["FOO"]).toBe("bar");
    expect(map["GH_BKIT_TOKEN"]).toBe("override_wins"); // later source wins
    expect(res.unset).toContain("UPSTASH_REDIS_REST_URL");
    expect(map["UPSTASH_REDIS_REST_URL"]).toBeUndefined();
    expect(res.hijackDropped).toContain("ANTHROPIC_API_KEY");
    expect(map["ANTHROPIC_API_KEY"]).toBeUndefined();
    expect(res.emptySkipped).toContain("EMPTY_VAR");
    // GH_BKIT_TOKEN present → not a placeholder; GH_BKIT_TOKEN_INSTALL absent → placeholder.
    expect(res.placeholders).toEqual(["GH_BKIT_TOKEN_INSTALL"]);
  });

  it("returns an empty resolution (both baseline placeholders) when no .envrc exists", () => {
    write("package.json", JSON.stringify({ name: "x" }));
    const res = resolveCloudEnvVars(tmpDir);
    expect(res.hasEnvrc).toBe(false);
    expect(res.included).toEqual([]);
    expect(res.placeholders).toEqual(["GH_BKIT_TOKEN", "GH_BKIT_TOKEN_INSTALL"]);
  });
});

describe("renderCloudEnvBlock", () => {
  it("emits resolved lines, placeholder lines for absent baseline, and appends autocompact", () => {
    write(".envrc", "dotenv_if_exists .bkit/.env");
    write(".bkit/.env", "GH_BKIT_TOKEN=real");
    const block = renderCloudEnvBlock(resolveCloudEnvVars(tmpDir));
    const lines = block.split("\n");
    expect(lines).toContain("GH_BKIT_TOKEN=real");
    expect(lines).toContain("GH_BKIT_TOKEN_INSTALL=<classic PAT with read:packages>");
    expect(lines).toContain("CLAUDE_AUTOCOMPACT_PCT_OVERRIDE=70");
  });

  it("does not append autocompact when it was resolved from a source", () => {
    write(".envrc", "dotenv_if_exists .bkit/.env");
    write(".bkit/.env", "CLAUDE_AUTOCOMPACT_PCT_OVERRIDE=50");
    const block = renderCloudEnvBlock(resolveCloudEnvVars(tmpDir));
    expect(block.match(/CLAUDE_AUTOCOMPACT_PCT_OVERRIDE=/g)).toHaveLength(1);
    expect(block).toContain("CLAUDE_AUTOCOMPACT_PCT_OVERRIDE=50");
  });
});

describe("renderCloudEnvNotes", () => {
  it("summarises dropped/unset/empty/placeholder categories", () => {
    write(".envrc", ["dotenv_if_exists .bkit/.env", "unset SECRET_DROP"].join("\n"));
    write(
      ".bkit/.env",
      ["GH_BKIT_TOKEN=x", "ANTHROPIC_API_KEY=y", "SECRET_DROP=z", "EMPTY="].join("\n"),
    );
    const notes = renderCloudEnvNotes(resolveCloudEnvVars(tmpDir));
    expect(notes).toContain("resolved");
    expect(notes).toContain("SECRET_DROP");
    expect(notes).toContain("ANTHROPIC_API_KEY");
    expect(notes).toContain("EMPTY");
    expect(notes).toContain("GH_BKIT_TOKEN_INSTALL"); // placeholder
  });

  it("emits a no-.envrc message when none exists", () => {
    write("package.json", JSON.stringify({ name: "x" }));
    expect(renderCloudEnvNotes(resolveCloudEnvVars(tmpDir))).toContain("No `.envrc` found");
  });
});

// Drift guard: the generated .claude/cloud.md template duplicates the vale-install
// block from the canonical .bkit/cloud.md. Keep the version literal in lockstep.
describe("template ↔ .bkit/cloud.md parity", () => {
  const pkgRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..", "..");
  const template = fs.readFileSync(
    path.join(pkgRoot, ".bkit", "templates", ".claude", "cloud.md"),
    "utf-8",
  );

  it("vale version in the template matches the canonical .bkit/cloud.md", () => {
    const cloudMd = fs.readFileSync(path.join(pkgRoot, ".bkit", "cloud.md"), "utf-8");
    const re = /VALE_VERSION="(\d+\.\d+\.\d+)"/;
    const tplVale = template.match(re)?.[1];
    const canonVale = cloudMd.match(re)?.[1];
    expect(tplVale).toBeDefined();
    expect(canonVale).toBeDefined();
    expect(tplVale).toBe(canonVale);
  });

  it("template carries the generation sentinels the module substitutes", () => {
    expect(template).toContain("@@CLOUD_CACHE_BUST@@");
    expect(template).toContain("@@CLOUD_NETWORK_ALLOWLIST@@");
    expect(template).toContain("@@CLOUD_ENV_VARS@@");
    expect(template).toContain("@@CLOUD_ENV_NOTES@@");
    expect(template).toContain("@@CLOUD_COREPACK@@");
    expect(template).toContain("@@CLOUD_DEBUG_FETCH_PROVISION@@");
    expect(template).toContain("{{PROJECT_NAME}}");
  });

  it("cache-bust sentinel sits at the top of the setup script (after the shebang)", () => {
    expect(template).toContain("#!/bin/bash\n@@CLOUD_CACHE_BUST@@\n");
  });
});

describe("extractDebugFetchProvisionRecipes / renderCloudDebugFetchProvision", () => {
  const MANAGED =
    "<!-- bkit:start -->\n# Config\n\n" +
    // A provision example INSIDE the managed block must be ignored (reference-only).
    "<!-- debug-fetch:provision vercel -->\n```bash\ncommand -v vercel || pnpm add -g vercel\n```\n<!-- debug-fetch:end -->\n\n" +
    "<!-- bkit:end -->\n";

  it("returns [] when .agents/config.md is absent", () => {
    expect(extractDebugFetchProvisionRecipes(tmpDir)).toEqual([]);
    expect(renderCloudDebugFetchProvision(tmpDir)).toBe("");
  });

  it("ignores provision blocks inside the managed block (only consumer-section counts)", () => {
    write(".agents/config.md", MANAGED);
    expect(extractDebugFetchProvisionRecipes(tmpDir)).toEqual([]);
    expect(renderCloudDebugFetchProvision(tmpDir)).toBe("");
  });

  it("extracts the bash body of each consumer-section provision block", () => {
    write(
      ".agents/config.md",
      MANAGED +
        "## Enabled\n\n" +
        "<!-- debug-fetch:provision vercel -->\n```bash\ncommand -v vercel >/dev/null 2>&1 || pnpm add -g vercel\n```\n<!-- debug-fetch:end -->\n\n" +
        "<!-- debug-fetch:provision supabase -->\n```bash\ncommand -v supabase >/dev/null 2>&1 || pnpm add -g supabase\n```\n<!-- debug-fetch:end -->\n",
    );
    const recipes = extractDebugFetchProvisionRecipes(tmpDir);
    expect(recipes).toEqual([
      "command -v vercel >/dev/null 2>&1 || pnpm add -g vercel",
      "command -v supabase >/dev/null 2>&1 || pnpm add -g supabase",
    ]);
    const rendered = renderCloudDebugFetchProvision(tmpDir);
    expect(rendered).toContain("pnpm add -g vercel");
    expect(rendered).toContain("pnpm add -g supabase");
    expect(rendered).toContain(".agents/config.md provision blocks");
    // pnpm's global-bin dir must be on PATH before any `pnpm add -g` recipe, else it
    // aborts the setup script ("global bin directory … is not in PATH").
    expect(rendered).toContain('export PNPM_HOME="${PNPM_HOME:-$HOME/.local/share/pnpm}"');
    expect(rendered).toContain('export PATH="$PNPM_HOME:$PNPM_HOME/bin:$PATH"');
    // The PATH export must come BEFORE the first pnpm-add recipe.
    expect(rendered.indexOf("PNPM_HOME")).toBeLessThan(rendered.indexOf("pnpm add -g"));
    // Recipes run best-effort so one failing recipe can't abort the `set -e` snapshot
    // build: a `set +e` subshell wraps them and its non-zero exit is swallowed.
    expect(rendered).toContain("(\n  set +e\n");
    expect(rendered).toMatch(/\) \|\| echo "\[cloud-setup\] a debug-fetch provision recipe failed/);
    // Both the PATH export and set +e must precede the recipes.
    expect(rendered.indexOf("set +e")).toBeLessThan(rendered.indexOf("pnpm add -g"));
  });

  it("does not treat a fetch (debug-fetch:start) block as a provision recipe", () => {
    write(
      ".agents/config.md",
      MANAGED +
        "## Enabled\n\n" +
        "<!-- debug-fetch:start vercel -->\n```bash\nvercel logs --json\n```\n<!-- debug-fetch:end -->\n",
    );
    expect(extractDebugFetchProvisionRecipes(tmpDir)).toEqual([]);
  });
});

describe("renderCloudCacheBust", () => {
  it("starts the counter at 1 when no prior doc exists", () => {
    expect(renderCloudCacheBust(tmpDir, "2026-07-14")).toBe("# cache-bust 2026-07-14-1");
  });

  it("increments the counter when the prior doc has today's date", () => {
    write(".claude/cloud.md", "#!/bin/bash\n# cache-bust 2026-07-14-1\nset -euo pipefail\n");
    expect(renderCloudCacheBust(tmpDir, "2026-07-14")).toBe("# cache-bust 2026-07-14-2");
  });

  it("resets the counter to 1 when the prior doc is from an earlier date", () => {
    write(".claude/cloud.md", "#!/bin/bash\n# cache-bust 2026-07-13-5\nset -euo pipefail\n");
    expect(renderCloudCacheBust(tmpDir, "2026-07-14")).toBe("# cache-bust 2026-07-14-1");
  });

  it("starts at 1 when the prior doc has no cache-bust line (pre-feature doc)", () => {
    write(".claude/cloud.md", "#!/bin/bash\nset -euo pipefail\n");
    expect(renderCloudCacheBust(tmpDir, "2026-07-14")).toBe("# cache-bust 2026-07-14-1");
  });
});

describe("writeClaudeCloudDoc — end-to-end render (real template)", () => {
  const TOKENS: TokenMap = {
    NODE_VERSION: "22",
    DEFAULT_BRANCH: "main",
    PROJECT_NAME: "test-repo",
    REPO_SLUG: "acme/test-repo",
  };

  it("emits a cache-bust line and leaves NO unreplaced @@CLOUD_ sentinels", () => {
    expect(writeClaudeCloudDoc(tmpDir, TOKENS)).toBe(true);
    const out = fs.readFileSync(path.join(tmpDir, ".claude", "cloud.md"), "utf-8");
    // Cache-bust comment sits directly after the shebang, dated today, counter 1.
    expect(out).toMatch(/#!\/bin\/bash\n# cache-bust \d{4}-\d{2}-\d{2}-1\nset -euo pipefail\n/);
    // No sentinel leaks into the shipped paste doc.
    expect(out).not.toMatch(/@@CLOUD_/);
  });

  it("advances the counter on a same-day regeneration", () => {
    writeClaudeCloudDoc(tmpDir, TOKENS);
    writeClaudeCloudDoc(tmpDir, TOKENS);
    const out = fs.readFileSync(path.join(tmpDir, ".claude", "cloud.md"), "utf-8");
    expect(out).toMatch(/# cache-bust \d{4}-\d{2}-\d{2}-2\n/);
  });

  it("falls back to Trusted guidance when no allowed-domains are declared", () => {
    writeClaudeCloudDoc(tmpDir, TOKENS);
    const out = fs.readFileSync(path.join(tmpDir, ".claude", "cloud.md"), "utf-8");
    expect(out).toContain("Set to **Trusted** (default)");
    expect(out).not.toContain("Also include default list");
  });

  it("renders the Custom allowlist when allowed-domains are declared", () => {
    write(
      ".agents/config.md",
      "<!-- bkit:end -->\n## Cloud\n\n" +
        "<!-- allowed-domains:start -->\nsentry.io\n*.vercel.com\n<!-- allowed-domains:end -->\n",
    );
    writeClaudeCloudDoc(tmpDir, TOKENS);
    const out = fs.readFileSync(path.join(tmpDir, ".claude", "cloud.md"), "utf-8");
    expect(out).toContain("Set to **Custom**");
    expect(out).toContain("Also include default list");
    expect(out).toMatch(/sentry\.io\n\*\.sentry\.io/);
    expect(out).toMatch(/vercel\.com\n\*\.vercel\.com/);
  });
});

describe("extractAllowedDomains / expandAllowedDomains / renderCloudNetworkAllowlist", () => {
  it("returns [] when config.md is absent or has no allowed-domains block", () => {
    expect(extractAllowedDomains(tmpDir)).toEqual([]);
    write(".agents/config.md", "<!-- bkit:end -->\nno domains here\n");
    expect(extractAllowedDomains(tmpDir)).toEqual([]);
  });

  it("extracts declared domains, ignoring comments/blank/marker lines", () => {
    write(
      ".agents/config.md",
      "<!-- bkit:end -->\n" +
        "<!-- allowed-domains:start -->\n# a comment\nsentry.io\n\n  supabase.com  \n<!-- allowed-domains:end -->\n",
    );
    expect(extractAllowedDomains(tmpDir)).toEqual(["sentry.io", "supabase.com"]);
  });

  it("only reads blocks BELOW bkit:end (managed-section examples ignored)", () => {
    write(
      ".agents/config.md",
      "<!-- allowed-domains:start -->\nexample.com\n<!-- allowed-domains:end -->\n" +
        "<!-- bkit:end -->\n<!-- allowed-domains:start -->\nreal.com\n<!-- allowed-domains:end -->\n",
    );
    expect(extractAllowedDomains(tmpDir)).toEqual(["real.com"]);
  });

  it("expands each domain to apex + wildcard, normalising a leading *., deduped/sorted", () => {
    expect(expandAllowedDomains(["inngest.com", "*.sentry.io", "inngest.com"])).toEqual([
      "inngest.com",
      "*.inngest.com",
      "sentry.io",
      "*.sentry.io",
    ]);
  });

  it("renders the Trusted fallback (with pointer) when nothing is declared", () => {
    const out = renderCloudNetworkAllowlist(tmpDir);
    expect(out).toContain("Set to **Trusted** (default)");
    expect(out).toContain("No `allowed-domains` block declared");
  });
});
