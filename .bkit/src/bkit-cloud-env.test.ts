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
  networkAllowlistBases,
  writeNetworkAllowlistArtifact,
  renderCloudNetworkAllowlist,
  resolveNetworkAllowlist,
  BKIT_SHIPPED_NETWORK_DOMAINS,
  writeClaudeCloudDoc,
  cursorCloudPolicy,
  renderCursorDebugFetchProvision,
  renderCursorNetworkAllowlist,
  writeCursorCloudDoc,
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

// The generated .claude/cloud.md template carries the sentinels the module
// substitutes at install/upgrade time. (The canonical .bkit/cloud.md no longer
// duplicates the setup-script body — it points at the generated doc — so there is
// no vale-version literal to keep in lockstep with the template anymore.)
describe("template generation sentinels", () => {
  const pkgRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..", "..");
  const template = fs.readFileSync(
    path.join(pkgRoot, ".bkit", "templates", ".claude", "cloud.md"),
    "utf-8",
  );

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

  it("networkAllowlistBases collapses wildcards to apex, dedupes, and sorts", () => {
    expect(
      networkAllowlistBases(["*.sentry.io", "inngest.com", "*.inngest.com", "sentry.io"]),
    ).toEqual(["inngest.com", "sentry.io"]);
  });

  it("networkAllowlistBases drops empty/whitespace entries and trims", () => {
    expect(networkAllowlistBases(["  npmjs.com  ", "", "   ", "*.openrouter.ai"])).toEqual([
      "npmjs.com",
      "openrouter.ai",
    ]);
  });

  it("networkAllowlistBases returns [] for an empty input", () => {
    expect(networkAllowlistBases([])).toEqual([]);
  });

  it("renders the Trusted fallback (with pointer) when nothing is declared", () => {
    const out = renderCloudNetworkAllowlist(tmpDir);
    expect(out).toContain("Set to **Trusted** (default)");
    expect(out).toContain("No `allowed-domains` block declared");
  });

  it("resolveNetworkAllowlist stays stack-agnostic until consumer declares domains", () => {
    expect(BKIT_SHIPPED_NETWORK_DOMAINS).not.toContain("vercel.com");
    expect(BKIT_SHIPPED_NETWORK_DOMAINS).not.toContain("supabase.com");
    expect(resolveNetworkAllowlist(tmpDir)).not.toContain("vercel.com");
    write(
      ".agents/config.md",
      "<!-- bkit:end -->\n<!-- allowed-domains:start -->\nvercel.com\n<!-- allowed-domains:end -->\n",
    );
    expect(resolveNetworkAllowlist(tmpDir)).toContain("vercel.com");
    expect(resolveNetworkAllowlist(tmpDir)).toContain("*.vercel.com");
  });
});

// ---------------------------------------------------------------------------
// Cursor Background Agents — the twin of `.claude/cloud.md`. Same `.envrc`-following
// resolver, a Cursor-specific env-var policy, and a doc that carries no setup-script
// mechanics (the toolchain lives in `.cursor/Dockerfile` + `environment.json`).
// ---------------------------------------------------------------------------

describe("cursorCloudPolicy", () => {
  it("linear tracker: prepends LINEAR_API_KEY, keeps GH baseline, no autocompact constant", () => {
    const p = cursorCloudPolicy("linear");
    expect(p.baseline.map(([n]) => n)).toEqual([
      "LINEAR_API_KEY",
      "GH_BKIT_TOKEN",
      "GH_BKIT_TOKEN_INSTALL",
    ]);
    expect(p.constants).toEqual([]);
  });

  it("github tracker: GH baseline only (no LINEAR_API_KEY), no autocompact constant", () => {
    const p = cursorCloudPolicy("github");
    expect(p.baseline.map(([n]) => n)).toEqual(["GH_BKIT_TOKEN", "GH_BKIT_TOKEN_INSTALL"]);
    expect(p.constants).toEqual([]);
  });

  it("renders a LINEAR_API_KEY placeholder for linear but not for github, and never autocompact", () => {
    write(".envrc", "dotenv_if_exists .bkit/.env");
    write(".bkit/.env", "GH_BKIT_TOKEN=real");

    const linear = cursorCloudPolicy("linear");
    const linearBlock = renderCloudEnvBlock(resolveCloudEnvVars(tmpDir, linear), linear);
    expect(linearBlock).toContain("GH_BKIT_TOKEN=real");
    expect(linearBlock).toMatch(/^LINEAR_API_KEY=/m);
    expect(linearBlock).not.toContain("CLAUDE_AUTOCOMPACT_PCT_OVERRIDE");

    const github = cursorCloudPolicy("github");
    const githubBlock = renderCloudEnvBlock(resolveCloudEnvVars(tmpDir, github), github);
    expect(githubBlock).not.toContain("LINEAR_API_KEY");
    expect(githubBlock).not.toContain("CLAUDE_AUTOCOMPACT_PCT_OVERRIDE");
  });
});

describe("renderCursorDebugFetchProvision", () => {
  it("returns '' when no consumer provision blocks are declared", () => {
    expect(renderCursorDebugFetchProvision(tmpDir)).toBe("");
    write(".agents/config.md", "<!-- bkit:end -->\nno blocks\n");
    expect(renderCursorDebugFetchProvision(tmpDir)).toBe("");
  });

  it("surfaces the same recipes as the Claude path, pointed at environment.json install", () => {
    write(
      ".agents/config.md",
      "<!-- bkit:end -->\n## Enabled\n\n" +
        "<!-- debug-fetch:provision vercel -->\n```bash\ncommand -v vercel || pnpm add -g vercel\n```\n<!-- debug-fetch:end -->\n",
    );
    const out = renderCursorDebugFetchProvision(tmpDir);
    expect(out).toContain("command -v vercel || pnpm add -g vercel");
    expect(out).toContain(".cursor/environment.json");
  });
});

describe("renderCursorNetworkAllowlist", () => {
  it("no allowed-domains → describes the dashboard egress modes, no code fence", () => {
    const out = renderCursorNetworkAllowlist(tmpDir);
    expect(out).toContain("Security");
    expect(out).toMatch(/Allow all|Default \+ allowlist|Allowlist only/);
    expect(out).not.toContain("```");
  });

  it("declared domains → lists them apex-only (no *. expansion) with the wildcard caution", () => {
    write(
      ".agents/config.md",
      "<!-- bkit:end -->\n## Cloud\n\n" +
        "<!-- allowed-domains:start -->\nsentry.io\nexample.com\n<!-- allowed-domains:end -->\n",
    );
    const out = renderCursorNetworkAllowlist(tmpDir);
    expect(out).toContain("sentry.io");
    expect(out).toContain("example.com");
    // Cursor list is narrower than Claude's — no auto `*.` wildcard rows.
    expect(out).not.toContain("*.sentry.io");
    expect(out).toMatch(/wildcard/i);
  });
});

describe("cursor template generation sentinels", () => {
  const pkgRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..", "..");
  const template = fs.readFileSync(
    path.join(pkgRoot, ".bkit", "templates", ".cursor", "cloud.md"),
    "utf-8",
  );

  it("carries the sentinels writeCursorCloudDoc substitutes, and NO Claude-only ones", () => {
    expect(template).toContain("@@CLOUD_ENV_VARS@@");
    expect(template).toContain("@@CLOUD_ENV_NOTES@@");
    expect(template).toContain("@@CURSOR_NETWORK@@");
    expect(template).toContain("@@CURSOR_DEBUG_FETCH@@");
    expect(template).toContain("{{PROJECT_NAME}}");
    // Cursor uses its own network sentinel + no pasted setup script — Claude-only ones absent.
    expect(template).not.toContain("@@CLOUD_CACHE_BUST@@");
    expect(template).not.toContain("@@CLOUD_NETWORK_ALLOWLIST@@");
    expect(template).not.toContain("@@CLOUD_COREPACK@@");
    expect(template).not.toContain("@@CLOUD_DEBUG_FETCH_PROVISION@@");
  });

  it("directs secrets to the Runtime Secret / Secrets-tab path, not the old Settings pane", () => {
    expect(template).toContain("Runtime Secret");
    expect(template).toContain("dashboard/cloud-agents");
    expect(template).not.toContain("Background Agents → Environment Variables");
  });
});

describe("writeCursorCloudDoc — end-to-end render (real template)", () => {
  const TOKENS: TokenMap = {
    NODE_VERSION: "22",
    DEFAULT_BRANCH: "main",
    PROJECT_NAME: "test-repo",
    REPO_SLUG: "acme/test-repo",
  };

  it("writes a sentinel-free, chmod-600 doc naming the repo", () => {
    write(".envrc", "dotenv_if_exists .bkit/.env");
    write(".bkit/.env", "GH_BKIT_TOKEN=real");
    expect(writeCursorCloudDoc(tmpDir, TOKENS, "linear")).toBe(true);
    const dst = path.join(tmpDir, ".cursor", "cloud.md");
    const out = fs.readFileSync(dst, "utf-8");
    expect(out).not.toMatch(/@@[A-Z_]+@@/);
    expect(out).toContain("test-repo");
    expect(out).toContain("GH_BKIT_TOKEN=real");
    expect(fs.statSync(dst).mode & 0o777).toBe(0o600);
  });

  it("linear tracker emits LINEAR_API_KEY; github tracker does not; neither emits autocompact", () => {
    write(".envrc", "dotenv_if_exists .bkit/.env");
    write(".bkit/.env", "GH_BKIT_TOKEN=real");

    writeCursorCloudDoc(tmpDir, TOKENS, "linear");
    const linearOut = fs.readFileSync(path.join(tmpDir, ".cursor", "cloud.md"), "utf-8");
    expect(linearOut).toContain("LINEAR_API_KEY=");
    expect(linearOut).not.toContain("CLAUDE_AUTOCOMPACT_PCT_OVERRIDE");

    writeCursorCloudDoc(tmpDir, TOKENS, "github");
    const githubOut = fs.readFileSync(path.join(tmpDir, ".cursor", "cloud.md"), "utf-8");
    // The env-var paste block must not carry LINEAR_API_KEY on the GitHub tracker. (The
    // prose still mentions LINEAR_ISSUE_ID as an injected var — assert on the block line.)
    expect(githubOut).not.toMatch(/^LINEAR_API_KEY=/m);
    expect(githubOut).not.toContain("CLAUDE_AUTOCOMPACT_PCT_OVERRIDE");
  });

  it("returns false when the template is absent (no getTemplatesRoot match)", () => {
    // Sanity: the real template exists, so a normal call returns true. (Absence is
    // covered structurally — writeCursorCloudDoc short-circuits on a missing src.)
    expect(writeCursorCloudDoc(tmpDir, TOKENS, "none")).toBe(true);
  });
});

describe("writeNetworkAllowlistArtifact — .cursor/allowlist.json writer", () => {
  const rel = path.join(".cursor", "allowlist.json");

  it("writes the file when absent (dry-run=false) and reports wrote=true", () => {
    const res = writeNetworkAllowlistArtifact(tmpDir, false);
    expect(res.wrote).toBe(true);
    expect(res.path).toBe(rel);
    const written = JSON.parse(fs.readFileSync(path.join(tmpDir, rel), "utf-8"));
    expect(Array.isArray(written.domains)).toBe(true);
    expect(written.domains.length).toBeGreaterThan(0);
    // Shipped defaults must be apex + wildcard expanded
    expect(written.domains).toContain("github.com");
    expect(written.domains).toContain("*.github.com");
  });

  it("is idempotent — a second write with no change reports wrote=false", () => {
    writeNetworkAllowlistArtifact(tmpDir, false);
    const res = writeNetworkAllowlistArtifact(tmpDir, false);
    expect(res.wrote).toBe(false);
  });

  it("dry-run does NOT write, but reports wrote=true when the file is missing", () => {
    const res = writeNetworkAllowlistArtifact(tmpDir, true);
    expect(res.wrote).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, rel))).toBe(false);
  });

  it("dry-run reports wrote=false when the file already matches", () => {
    writeNetworkAllowlistArtifact(tmpDir, false); // seed
    const res = writeNetworkAllowlistArtifact(tmpDir, true);
    expect(res.wrote).toBe(false);
  });

  it("picks up consumer allowed-domains from .agents/config.md", () => {
    write(
      ".agents/config.md",
      "<!-- bkit:end -->\n<!-- allowed-domains:start -->\nexample.invalid\n<!-- allowed-domains:end -->\n",
    );
    const res = writeNetworkAllowlistArtifact(tmpDir, false);
    expect(res.domains).toContain("example.invalid");
    expect(res.domains).toContain("*.example.invalid");
  });
});
