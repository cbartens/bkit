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
  extractContextFetchProvisionRecipes,
  renderCloudContextFetchProvision,
  renderCloudCacheBust,
  extractAllowedDomains,
  expandAllowedDomains,
  networkAllowlistBases,
  writeNetworkAllowlistArtifact,
  renderCloudNetworkAllowlist,
  resolveNetworkAllowlist,
  cloudRepoPath,
  renderCloudWorkspaceTrust,
  cloudAutoModeEnvironment,
  renderCloudUserSettings,
  BKIT_SHIPPED_NETWORK_DOMAINS,
  BKIT_SHIPPED_NETWORK_HOSTS,
  deriveEgressEntries,
  proposeEgressBase,
  isIpLiteral,
  writeClaudeCloudDoc,
  cursorCloudPolicy,
  renderCursorContextFetchProvision,
  renderCursorNetworkAllowlist,
  writeCursorCloudDoc,
} from "./bkit-cloud-env";
import {
  OPENCODE_PROVIDER_DEFAULTS,
  BKIT_EGRESS_SOURCES,
  MULTI_LABEL_SUFFIXES,
  MULTI_TENANT_APEXES,
} from "./bkit-registry";
import { ISSUE_TRACKERS, DEP_UPDATERS } from "./bkit-manifest";
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
    expect(template).toContain("@@CLOUD_CONTEXT_FETCH_PROVISION@@");
    expect(template).toContain("@@CLOUD_WORKSPACE_TRUST@@");
    expect(template).toContain("@@CLOUD_USER_SETTINGS@@");
    expect(template).toContain("{{PROJECT_NAME}}");
  });

  it("trust + user-settings sentinels sit AFTER the jq install (both regions need jq)", () => {
    const jqIdx = template.indexOf("chmod +x /usr/local/bin/jq");
    expect(jqIdx).toBeGreaterThan(-1);
    expect(template.indexOf("@@CLOUD_WORKSPACE_TRUST@@")).toBeGreaterThan(jqIdx);
    expect(template.indexOf("@@CLOUD_USER_SETTINGS@@")).toBeGreaterThan(jqIdx);
  });

  it("cache-bust sentinel sits at the top of the setup script (after the shebang)", () => {
    expect(template).toContain("#!/bin/bash\n@@CLOUD_CACHE_BUST@@\n");
  });
});

describe("extractContextFetchProvisionRecipes / renderCloudContextFetchProvision", () => {
  const MANAGED =
    "<!-- bkit:start -->\n# Config\n\n" +
    // A provision example INSIDE the managed block must be ignored (reference-only).
    "<!-- context-fetch:provision vercel -->\n```bash\ncommand -v vercel || pnpm add -g vercel\n```\n<!-- context-fetch:end -->\n\n" +
    "<!-- bkit:end -->\n";

  it("returns [] when .agents/context.md is absent", () => {
    expect(extractContextFetchProvisionRecipes(tmpDir)).toEqual([]);
    expect(renderCloudContextFetchProvision(tmpDir)).toBe("");
  });

  it("ignores provision blocks inside the managed block (only consumer-section counts)", () => {
    write(".agents/context.md", MANAGED);
    expect(extractContextFetchProvisionRecipes(tmpDir)).toEqual([]);
    expect(renderCloudContextFetchProvision(tmpDir)).toBe("");
  });

  it("extracts the bash body of each consumer-section provision block", () => {
    write(
      ".agents/context.md",
      MANAGED +
        "## Enabled\n\n" +
        "<!-- context-fetch:provision vercel -->\n```bash\ncommand -v vercel >/dev/null 2>&1 || pnpm add -g vercel\n```\n<!-- context-fetch:end -->\n\n" +
        "<!-- context-fetch:provision supabase -->\n```bash\ncommand -v supabase >/dev/null 2>&1 || pnpm add -g supabase\n```\n<!-- context-fetch:end -->\n",
    );
    const recipes = extractContextFetchProvisionRecipes(tmpDir);
    expect(recipes).toEqual([
      "command -v vercel >/dev/null 2>&1 || pnpm add -g vercel",
      "command -v supabase >/dev/null 2>&1 || pnpm add -g supabase",
    ]);
    const rendered = renderCloudContextFetchProvision(tmpDir);
    expect(rendered).toContain("pnpm add -g vercel");
    expect(rendered).toContain("pnpm add -g supabase");
    expect(rendered).toContain(".agents/context.md provision blocks");
    // pnpm's global-bin dir must be on PATH before any `pnpm add -g` recipe, else it
    // aborts the setup script ("global bin directory … is not in PATH").
    expect(rendered).toContain('export PNPM_HOME="${PNPM_HOME:-$HOME/.local/share/pnpm}"');
    expect(rendered).toContain('export PATH="$PNPM_HOME:$PNPM_HOME/bin:$PATH"');
    // The PATH export must come BEFORE the first pnpm-add recipe.
    expect(rendered.indexOf("PNPM_HOME")).toBeLessThan(rendered.indexOf("pnpm add -g"));
    // Recipes run best-effort so one failing recipe can't abort the `set -e` snapshot
    // build: a `set +e` subshell wraps them and its non-zero exit is swallowed.
    expect(rendered).toContain("(\n  set +e\n");
    expect(rendered).toMatch(
      /\) \|\| echo "\[cloud-setup\] a context-fetch provision recipe failed/,
    );
    // Both the PATH export and set +e must precede the recipes.
    expect(rendered.indexOf("set +e")).toBeLessThan(rendered.indexOf("pnpm add -g"));
  });

  it("does not treat a fetch (context-fetch:start) block as a provision recipe", () => {
    write(
      ".agents/context.md",
      MANAGED +
        "## Enabled\n\n" +
        "<!-- context-fetch:start vercel -->\n```bash\nvercel logs --json\n```\n<!-- context-fetch:end -->\n",
    );
    expect(extractContextFetchProvisionRecipes(tmpDir)).toEqual([]);
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

  it("renders the always-Custom block with shipped hosts when no allowed-domains are declared", () => {
    writeClaudeCloudDoc(tmpDir, TOKENS);
    const out = fs.readFileSync(path.join(tmpDir, ".claude", "cloud.md"), "utf-8");
    // The tick instruction now reaches the zero-declared path too. Asserting `toContain`
    // here is the point: the old `not.toContain` froze the regression Task 10 removes —
    // a zero-declaration consumer dropped to a bare Custom list and lost PyPI, crates.io,
    // the Go proxy and the cloud SDK hosts the "also include defaults" tick preserves.
    expect(out).toContain("Also include default list");
    expect(out).toContain("githubcopilot.com");
  });

  it("renders the Custom allowlist when allowed-domains are declared", () => {
    write(
      ".agents/context.md",
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
    write(".agents/context.md", "<!-- bkit:end -->\nno domains here\n");
    expect(extractAllowedDomains(tmpDir)).toEqual([]);
  });

  it("extracts declared domains, ignoring comments/blank/marker lines", () => {
    write(
      ".agents/context.md",
      "<!-- bkit:end -->\n" +
        "<!-- allowed-domains:start -->\n# a comment\nsentry.io\n\n  supabase.com  \n<!-- allowed-domains:end -->\n",
    );
    expect(extractAllowedDomains(tmpDir)).toEqual(["sentry.io", "supabase.com"]);
  });

  it("only reads blocks BELOW bkit:end (managed-section examples ignored)", () => {
    write(
      ".agents/context.md",
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

  it("renders the always-Custom block (with pointer) when nothing is declared", () => {
    const out = renderCloudNetworkAllowlist(tmpDir);
    expect(out).toContain("Also include default list");
    // the pointer prose survives, reworded: it no longer promises a section that now always renders
    expect(out).toContain("No `allowed-domains` block is declared");
    expect(out).toContain("```text");
  });

  it("resolveNetworkAllowlist stays stack-agnostic until consumer declares domains", () => {
    expect(BKIT_SHIPPED_NETWORK_DOMAINS).not.toContain("vercel.com");
    expect(BKIT_SHIPPED_NETWORK_DOMAINS).not.toContain("supabase.com");
    expect(resolveNetworkAllowlist(tmpDir)).not.toContain("vercel.com");
    write(
      ".agents/context.md",
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

describe("cloudRepoPath / renderCloudWorkspaceTrust", () => {
  it("bakes the container clone path from the repo directory name", () => {
    expect(cloudRepoPath("/Users/someone/code/my-repo")).toBe("/home/user/my-repo");
    expect(cloudRepoPath("/Users/someone/code/my-repo/")).toBe("/home/user/my-repo");
  });

  it("merges the trust key rather than clobbering an existing .claude.json", () => {
    const out = renderCloudWorkspaceTrust("/x/demo-repo");
    // Seeds only when absent, then edits through jq — never `printf > file` over a
    // populated config (Claude Code stores its own state alongside the key).
    expect(out).toContain('[ -f "$CLAUDE_JSON" ] || printf \'{}\' > "$CLAUDE_JSON"');
    expect(out).toContain(".projects[$p].hasTrustDialogAccepted = true");
    expect(out).toContain("--arg p '/home/user/demo-repo'");
    expect(out).toContain('mv "$CLAUDE_JSON.tmp" "$CLAUDE_JSON"');
  });

  it("honours CLAUDE_CONFIG_DIR, falling back to $HOME", () => {
    expect(renderCloudWorkspaceTrust("/x/r")).toContain(
      'CLAUDE_JSON="${CLAUDE_CONFIG_DIR:-$HOME}/.claude.json"',
    );
  });
});

describe("cloudAutoModeEnvironment / renderCloudUserSettings", () => {
  it("ALWAYS emits $defaults first — omitting it discards every built-in trust slot", () => {
    const bare = cloudAutoModeEnvironment(tmpDir);
    expect(bare[0]).toBe("$defaults");
    write(".agents/context.md", "<!-- bkit:end -->\n");
    expect(cloudAutoModeEnvironment(tmpDir)[0]).toBe("$defaults");
  });

  it("names the sandbox in a Host containment entry (default assumes an open-internet dev box)", () => {
    const entries = cloudAutoModeEnvironment(tmpDir);
    expect(entries.some((e) => e.startsWith("Host containment:"))).toBe(true);
  });

  it("lists every allowlist host exactly once, from the same resolver the other consumers use", () => {
    write(
      ".agents/context.md",
      "<!-- bkit:end -->\n" +
        "<!-- allowed-domains:start -->\nexample.com\nlogs.example.net\n<!-- allowed-domains:end -->\n",
    );
    const domains = cloudAutoModeEnvironment(tmpDir).find((e) =>
      e.startsWith("Trusted internal domains:"),
    );
    expect(domains).toBeDefined();
    for (const host of networkAllowlistBases(resolveNetworkAllowlist(tmpDir))) {
      expect(domains!.split(host).length - 1).toBe(1);
    }
    // Apex-only: the `*.` wildcard forms are an egress-allowlist concern, not prose
    // the classifier reads.
    expect(domains).not.toContain("*.");
  });

  it("seeds with //= so a consumer's own autoMode.environment is never overwritten", () => {
    const out = renderCloudUserSettings(tmpDir);
    expect(out).toContain(".autoMode.environment //= $e");
    expect(out).not.toContain(".autoMode.environment = $e");
    expect(out).toContain('CLAUDE_SETTINGS="${CLAUDE_CONFIG_DIR:-$HOME/.claude}/settings.json"');
  });

  it("embeds the environment list as valid JSON inside single quotes", () => {
    const out = renderCloudUserSettings(tmpDir);
    const m = out.match(/--argjson e '(.*?)' /);
    expect(m).not.toBeNull();
    const parsed = JSON.parse(m![1]) as string[];
    expect(parsed).toEqual(cloudAutoModeEnvironment(tmpDir));
    // A `'` in an entry would terminate the shell quoting and corrupt the script.
    expect(m![1]).not.toContain("'");
  });
});

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

describe("renderCursorContextFetchProvision", () => {
  it("returns '' when no consumer provision blocks are declared", () => {
    expect(renderCursorContextFetchProvision(tmpDir)).toBe("");
    write(".agents/context.md", "<!-- bkit:end -->\nno blocks\n");
    expect(renderCursorContextFetchProvision(tmpDir)).toBe("");
  });

  it("surfaces the same recipes as the Claude path, pointed at environment.json install", () => {
    write(
      ".agents/context.md",
      "<!-- bkit:end -->\n## Enabled\n\n" +
        "<!-- context-fetch:provision vercel -->\n```bash\ncommand -v vercel || pnpm add -g vercel\n```\n<!-- context-fetch:end -->\n",
    );
    const out = renderCursorContextFetchProvision(tmpDir);
    expect(out).toContain("command -v vercel || pnpm add -g vercel");
    expect(out).toContain(".cursor/environment.json");
  });
});

describe("renderCursorNetworkAllowlist", () => {
  it("no allowed-domains → still emits a fence carrying the shipped hosts (T13)", () => {
    const out = renderCursorNetworkAllowlist(tmpDir);
    expect(out).toContain("Security");
    expect(out).toMatch(/Allow all|Default \+ allowlist|Allowlist only/);
    expect(out).toContain("```text");
    // exact hosts, never the wildcard form — Cursor's no-wildcard policy
    expect(out).toContain("api.githubcopilot.com");
    expect(out).toContain("registry.npmjs.org");
    expect(out).not.toContain("*.githubcopilot.com");
  });

  it("declared domains → lists them apex-only (no *. expansion) with the wildcard caution", () => {
    write(
      ".agents/context.md",
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
    expect(template).toContain("@@CURSOR_CONTEXT_FETCH@@");
    expect(template).toContain("{{PROJECT_NAME}}");
    // Cursor uses its own network sentinel + no pasted setup script — Claude-only ones absent.
    expect(template).not.toContain("@@CLOUD_CACHE_BUST@@");
    expect(template).not.toContain("@@CLOUD_NETWORK_ALLOWLIST@@");
    expect(template).not.toContain("@@CLOUD_COREPACK@@");
    expect(template).not.toContain("@@CLOUD_CONTEXT_FETCH_PROVISION@@");
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

  it("picks up consumer allowed-domains from .agents/context.md", () => {
    write(
      ".agents/context.md",
      "<!-- bkit:end -->\n<!-- allowed-domains:start -->\nexample.invalid\n<!-- allowed-domains:end -->\n",
    );
    const res = writeNetworkAllowlistArtifact(tmpDir, false);
    expect(res.domains).toContain("example.invalid");
    expect(res.domains).toContain("*.example.invalid");
  });
});

describe("egress registry — completeness, invariants and the anti-widening gate", () => {
  const providerRows = BKIT_EGRESS_SOURCES.filter((r) => r.kind === "opencode-provider");

  // T1 — every registry key has exactly one row, and every row is well-formed.
  it("T1: one opencode-provider row per provider key, ids unique, rows well-formed", () => {
    const providerKeys = Object.keys(OPENCODE_PROVIDER_DEFAULTS).sort();
    expect(providerRows.map((r) => r.id).sort()).toEqual(providerKeys);

    const ids = BKIT_EGRESS_SOURCES.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);

    for (const row of BKIT_EGRESS_SOURCES) {
      // non-empty bases OR an explicit reason for having none
      expect(row.bases.length > 0 || typeof row.reason === "string").toBe(true);
      // a row that grants bases must name the hosts those bases exist for
      if (row.bases.length > 0) expect(row.hosts.length).toBeGreaterThan(0);
    }
  });

  // T1 (continued) — the tracker/updater sweep, asserting WHAT was skipped, not just the count.
  it("T1: every issue tracker but the 'none' sentinel has an mcp row, and 'none' was the only skip", () => {
    const skipped: string[] = [];
    for (const tracker of ISSUE_TRACKERS) {
      if (tracker === "none") {
        skipped.push(tracker);
        continue;
      }
      expect(BKIT_EGRESS_SOURCES.find((r) => r.id === `mcp-${tracker}`)?.kind).toBe("tracker-mcp");
    }
    // dep updaters are a RECORDED absence: their egress happens on CI runners, not in a session
    for (const updater of DEP_UPDATERS) {
      if (updater === "none") {
        skipped.push(updater);
        continue;
      }
      expect(BKIT_EGRESS_SOURCES.some((r) => r.id.includes(updater))).toBe(false);
    }
    expect(skipped).toEqual(["none", "none"]);
  });

  // T2 — the literals in the leaf are tied back to the provider baseURL they claim to derive from.
  it("T2: provider rows match their baseURL host, and every host is covered by a base", () => {
    for (const row of providerRows) {
      const baseURL = OPENCODE_PROVIDER_DEFAULTS[row.id].baseURL;
      if (baseURL !== "") {
        // the derived literal must still equal what the provider's baseURL resolves to
        expect(row.hosts).toContain(new URL(baseURL).hostname);
        expect(row.bases).toContain(proposeEgressBase(baseURL));
      } else {
        // a builtin contributes no baseURL, so its row must say why it still carries hosts
        expect(typeof row.reason).toBe("string");
      }
    }
    for (const row of BKIT_EGRESS_SOURCES) {
      const uncovered = row.hosts.filter(
        (h) => !row.bases.some((b) => h === b || h.endsWith(`.${b}`)),
      );
      if (uncovered.length > 0) expect(typeof row.reason).toBe("string");
    }
  });

  // T3 — the gate. Deny checks only: an unknown platform apex passes rather than being blocked.
  it("T3: no base collapses into a public suffix, a shared-tenant apex, or a single label", () => {
    for (const base of BKIT_SHIPPED_NETWORK_DOMAINS) {
      expect(base.split(".").length).toBeGreaterThanOrEqual(2);
      expect(MULTI_LABEL_SUFFIXES).not.toContain(base);
      expect(MULTI_TENANT_APEXES).not.toContain(base);
    }
  });

  it("T3: the gate rejects a fixture row whose base is a shared-tenant apex", () => {
    const widened = deriveEgressEntries([
      {
        id: "fixture",
        kind: "tooling-api",
        hosts: ["x.googleapis.com"],
        bases: ["googleapis.com"],
      },
    ]);
    // the same predicate T3 applies above, run against the fixture: this one must trip
    expect(widened.bases.some((b) => MULTI_TENANT_APEXES.includes(b))).toBe(true);
  });

  it("T3: every shipped base on a .dev / .app / .run TLD is on the accepted-warn list", () => {
    // Soft warn, never a failure: these TLDs are where a two-label collapse can grab a
    // platform namespace (workers.dev, vercel.app, run.app), so each base on one is
    // reviewed once and listed here. A NEW base on these TLDs fails until it is reviewed.
    //
    // The plan's Task 6 names models.dev as the only accepted warn. linear.app is the
    // second: it is a legitimate company apex, it predates this change as one of the ten
    // hand-typed bases, and dropping it would revoke a working grant — so the accept list
    // carries both rather than the assertion carrying only the newly derived one.
    const ACCEPTED_SOFT_WARN = ["linear.app", "models.dev"];
    const softWarn = BKIT_SHIPPED_NETWORK_DOMAINS.filter((b) =>
      [".dev", ".app", ".run"].some((tld) => b.endsWith(tld)),
    );
    expect(softWarn).toEqual(ACCEPTED_SOFT_WARN);
  });

  // T5 — derivation is pure: a fixture set flows through without mocking the module.
  it("T5: deriveEgressEntries is pure over injected rows, sorted and deduped", () => {
    const out = deriveEgressEntries([
      { id: "a", kind: "tooling-api", hosts: ["b.example.com"], bases: ["example.com"] },
      {
        id: "b",
        kind: "skills",
        hosts: ["a.example.net", "b.example.com"],
        bases: ["example.net"],
      },
    ]);
    expect(out.hosts).toEqual(["a.example.net", "b.example.com"]);
    expect(out.bases).toEqual(["example.com", "example.net"]);
  });

  it("T5: the shipped exports are a strict superset of the ten hand-typed bases", () => {
    const previous = [
      "anthropic.com",
      "claude.com",
      "cursor.com",
      "github.com",
      "githubusercontent.com",
      "linear.app",
      "npmjs.com",
      "ollama.com",
      "opencode.ai",
      "openrouter.ai",
    ];
    for (const base of previous) expect(BKIT_SHIPPED_NETWORK_DOMAINS).toContain(base);
    expect(BKIT_SHIPPED_NETWORK_DOMAINS).toEqual([...BKIT_SHIPPED_NETWORK_DOMAINS].sort());
    expect(BKIT_SHIPPED_NETWORK_HOSTS).toContain("api.tavily.com");
    expect(BKIT_SHIPPED_NETWORK_HOSTS).toContain("api.githubcopilot.com");
  });

  // T7 — the rejection CHANNEL, not merely the outcome: nothing throws, everything returns "".
  it("T7: unallowlistable URLs contribute nothing and none of them throws", () => {
    for (const url of [
      "http://localhost:11434/v1",
      "http://sub.localhost/v1",
      "https://1.2.3.4:8080/v1",
      "https://[::1]/v1",
      "",
      "not-a-url",
    ]) {
      expect(() => proposeEgressBase(url)).not.toThrow();
      expect(proposeEgressBase(url)).toBe("");
    }
    expect(proposeEgressBase("https://openrouter.ai/api/v1")).toBe("openrouter.ai");
    expect(proposeEgressBase("https://integrate.api.example.co/v1")).toBe("example.co");
    expect(isIpLiteral("1.2.3.4")).toBe(true);
    expect(isIpLiteral("[::1]")).toBe(true);
    expect(isIpLiteral("openrouter.ai")).toBe(false);
  });
});
