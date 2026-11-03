import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  UNAVAILABLE_RELPATH,
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
  writeCursorCliPermissionsArtifact,
  extractMcpServers,
  resolveClaudeDerivedAllows,
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
  extractCloudToolchainScript,
  renderCursorContextFetchProvision,
  renderCursorNetworkAllowlist,
  writeCursorCloudDoc,
  renderCodexNetworkAllowlist,
  writeCodexCloudDoc,
  SESSION_HIJACK_KEYS,
} from "./cloud-env";
import {
  OPENCODE_PROVIDER_DEFAULTS,
  BKIT_EGRESS_SOURCES,
  MULTI_LABEL_SUFFIXES,
  MULTI_TENANT_APEXES,
  type OpencodeProvider,
} from "../shared/egress";
import { isOpencodeProvider } from "../render/models";
import { parsePins } from "../commands/ci/pins";
import { ISSUE_TRACKERS } from "./manifest";
import type { TokenMap } from "./placeholders";

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
        "BKIT_GH_TOKEN=from_bkit_env",
        "BKIT_ANTHROPIC_API_KEY=sk-should-be-dropped",
        "UPSTASH_REDIS_REST_URL=redis://dropped",
        "EMPTY_VAR=",
      ].join("\n"),
    );
    write("apps/web/.env.local", ["FOO=bar", "BKIT_GH_TOKEN=override_wins"].join("\n"));

    const res = resolveCloudEnvVars(tmpDir);
    const map = Object.fromEntries(res.included);

    expect(res.hasEnvrc).toBe(true);
    expect(res.sources).toEqual([".bkit/.env", "apps/web/.env.local"]);
    expect(map["FOO"]).toBe("bar");
    expect(map["BKIT_GH_TOKEN"]).toBe("override_wins"); // later source wins
    expect(res.unset).toContain("UPSTASH_REDIS_REST_URL");
    expect(map["UPSTASH_REDIS_REST_URL"]).toBeUndefined();
    expect(res.hijackDropped).toContain("BKIT_ANTHROPIC_API_KEY");
    expect(map["BKIT_ANTHROPIC_API_KEY"]).toBeUndefined();
    expect(res.emptySkipped).toContain("EMPTY_VAR");
    // BKIT_GH_TOKEN present → not a placeholder; no other baseline key.
    expect(res.placeholders).toEqual([]);
  });

  it("drops exactly the three documented session-hijack keys (docs/security.md)", () => {
    expect([...SESSION_HIJACK_KEYS]).toEqual([
      "ANTHROPIC_API_KEY",
      "BKIT_ANTHROPIC_API_KEY",
      "ANTHROPIC_AUTH_TOKEN",
    ]);
  });

  it.each(SESSION_HIJACK_KEYS)("never lets %s into the paste block", (key) => {
    write(".envrc", "dotenv_if_exists .bkit/.env");
    write(".bkit/.env", ["BKIT_GH_TOKEN=real", `${key}=sk-must-not-leak`].join("\n"));

    const res = resolveCloudEnvVars(tmpDir);
    const block = renderCloudEnvBlock(res);

    expect(res.hijackDropped).toContain(key);
    expect(res.included.map(([k]) => k)).not.toContain(key);
    expect(block).not.toContain(key);
    expect(block).not.toContain("sk-must-not-leak");
    expect(block).toContain("BKIT_GH_TOKEN=real");
  });

  it("returns an empty resolution (the sole baseline placeholder) when no .envrc exists", () => {
    write("package.json", JSON.stringify({ name: "x" }));
    const res = resolveCloudEnvVars(tmpDir);
    expect(res.hasEnvrc).toBe(false);
    expect(res.included).toEqual([]);
    expect(res.placeholders).toEqual(["BKIT_GH_TOKEN"]);
  });
});

describe("renderCloudEnvBlock", () => {
  it("emits only the resolved lines when every baseline token resolved", () => {
    write(".envrc", "dotenv_if_exists .bkit/.env");
    write(".bkit/.env", ["BKIT_GH_TOKEN=real", "APP_URL=https://x"].join("\n"));
    const block = renderCloudEnvBlock(resolveCloudEnvVars(tmpDir));
    expect(block.split("\n")).toEqual(["BKIT_GH_TOKEN=real", "APP_URL=https://x"]);
  });

  it("emits a placeholder line for an absent baseline token", () => {
    write(".envrc", "dotenv_if_exists .bkit/.env");
    write(".bkit/.env", "APP_URL=https://x");
    const lines = renderCloudEnvBlock(resolveCloudEnvVars(tmpDir)).split("\n");
    expect(lines[0]).toBe("APP_URL=https://x");
    expect(lines[1]).toMatch(/^BKIT_GH_TOKEN=<PAT/);
    expect(lines).toHaveLength(2);
  });
});

describe("renderCloudEnvNotes", () => {
  it("summarises dropped/unset/empty/placeholder categories", () => {
    write(".envrc", ["dotenv_if_exists .bkit/.env", "unset SECRET_DROP"].join("\n"));
    write(
      ".bkit/.env",
      ["BKIT_GH_TOKEN=x", "BKIT_ANTHROPIC_API_KEY=y", "SECRET_DROP=z", "EMPTY="].join("\n"),
    );
    const notes = renderCloudEnvNotes(resolveCloudEnvVars(tmpDir));
    expect(notes).toContain("resolved");
    expect(notes).toContain("SECRET_DROP");
    expect(notes).toContain("BKIT_ANTHROPIC_API_KEY");
    expect(notes).toContain("EMPTY");
  });

  it("emits a no-.envrc message when none exists", () => {
    write("package.json", JSON.stringify({ name: "x" }));
    const notes = renderCloudEnvNotes(resolveCloudEnvVars(tmpDir));
    expect(notes).toContain("No `.envrc` found");
    expect(notes).toContain("Copy `.bkit/templates/.envrc` to the repo root");
    expect(notes).not.toContain("seeds one");
  });
});

// The generated .claude/bkit-cloud.md template carries the sentinels the module
// substitutes at install/upgrade time.
describe("template generation sentinels", () => {
  const pkgRoot = path.resolve(
    path.dirname(new URL(import.meta.url).pathname),
    "..",
    "..",
    "..",
    "..",
  );
  const template = fs.readFileSync(
    path.join(pkgRoot, ".bkit", "shared", ".claude", "bkit-cloud.md"),
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
    const jqIdx = template.indexOf("install -m 0755 jq-linux-amd64 /usr/local/bin/jq");
    expect(jqIdx).toBeGreaterThan(-1);
    expect(template.indexOf("@@CLOUD_WORKSPACE_TRUST@@")).toBeGreaterThan(jqIdx);
    expect(template.indexOf("@@CLOUD_USER_SETTINGS@@")).toBeGreaterThan(jqIdx);
  });

  it("cache-bust sentinel sits at the top of the setup script (after the shebang)", () => {
    expect(template).toContain("#!/bin/bash\n@@CLOUD_CACHE_BUST@@\n");
  });

  it("installs the pinned Node onto PATH before corepack runs", () => {
    const extractIdx = template.indexOf(
      'tar -xJf "node-v${NODE_VERSION}-linux-x64.tar.xz" -C /usr/local --strip-components=1',
    );
    const pathIdx = template.indexOf('export PATH="/usr/local/bin:$PATH"');
    expect(extractIdx).toBeGreaterThan(-1);
    expect(template).toContain(
      'echo "${NODE_SHA256}  node-v${NODE_VERSION}-linux-x64.tar.xz" | sha256sum -c -',
    );
    expect(pathIdx).toBeGreaterThan(extractIdx);
    expect(template.indexOf("@@CLOUD_COREPACK@@")).toBeGreaterThan(pathIdx);
  });

  it("pins a Node major that satisfies package.json engines.node", () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(pkgRoot, "package.json"), "utf-8")) as {
      engines: { node: string };
    };
    const minMajor = Number(/^>=(\d+)/.exec(pkg.engines.node)?.[1]);
    const nodeVersion = pins(template).get("NODE_VERSION");
    expect(minMajor).toBeGreaterThan(0);
    expect(Number(nodeVersion?.split(".")[0])).toBeGreaterThanOrEqual(minMajor);
  });

  it("pairs every download *_VERSION with a *_SHA256", () => {
    const dockerfile = fs.readFileSync(
      path.join(pkgRoot, ".bkit", "templates", ".cursor", "Dockerfile"),
      "utf-8",
    );
    for (const [name, text] of [
      ["bkit-cloud.md", template],
      ["Dockerfile", dockerfile],
    ]) {
      const downloads = parsePins(text).filter((p) => p.url !== null);
      expect(downloads.length, name).toBeGreaterThanOrEqual(3);
      expect(
        parsePins(text).filter((p) => p.problem !== null),
        name,
      ).toEqual([]);
    }
    const versionOnly = 'JQ_VERSION="1.8.2"\ncurl -fsSLO "https://e.test/jq-${JQ_VERSION}/jq"';
    expect(parsePins(versionOnly).map((p) => p.problem)).toEqual(["missing-sha256"]);
  });

  it("shares every version + sha256 pin with the Cursor Dockerfile template", () => {
    const dockerfile = fs.readFileSync(
      path.join(pkgRoot, ".bkit", "templates", ".cursor", "Dockerfile"),
      "utf-8",
    );
    const script = pins(template);
    const docker = pins(dockerfile);
    const shared = [...script.keys()].filter((key) => docker.has(key));
    expect(shared).toEqual(expect.arrayContaining(["NODE_SHA256", "GH_SHA256", "VALE_SHA256"]));
    for (const key of shared) expect(script.get(key), key).toBe(docker.get(key));
  });

  it("puts a renovate comment directly above every *_VERSION pin", () => {
    const lines = template.split("\n");
    const versionLines = lines
      .map((l, i) => [l, i] as const)
      .filter(([l]) => /^[A-Z]+_VERSION=/.test(l));
    expect(versionLines.length).toBeGreaterThanOrEqual(4);
    for (const [l, i] of versionLines) {
      expect(lines[i - 1], l).toMatch(/^# renovate: datasource=\S+ depName=\S+/);
    }
  });
});

/** `NAME_VERSION` / `NAME_SHA256` assignments, keyed by variable name. */
function pins(text: string): Map<string, string> {
  const out = new Map<string, string>();
  for (const p of parsePins(text)) {
    if (p.version !== null) out.set(`${p.tool}_VERSION`, p.version);
    if (p.sha256 !== null) out.set(`${p.tool}_SHA256`, p.sha256);
  }
  return out;
}

describe("extractContextFetchProvisionRecipes / renderCloudContextFetchProvision", () => {
  const MANAGED =
    "<!-- bkit:start -->\n# Config\n\n" +
    // A provision block INSIDE the managed block must be ignored (never run).
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
    expect(rendered).toContain("context-fetch provision recipes (from .agents/context.md)");
    // pnpm's global-bin dir must be on PATH before any `pnpm add -g` recipe, else it
    // aborts the setup script ("global bin directory … is not in PATH").
    expect(rendered).toContain('export PNPM_HOME="${PNPM_HOME:-$HOME/.local/share/pnpm}"');
    expect(rendered).toContain('export PATH="$PNPM_HOME:$PNPM_HOME/bin:$PATH"');
    // The PATH export must come BEFORE the first pnpm-add recipe.
    expect(rendered.indexOf("PNPM_HOME")).toBeLessThan(rendered.indexOf("pnpm add -g"));
    // Each recipe runs through the one runner, by its block name, with the script's
    // errexit off around them; the closing line reads $BKIT_UNAVAILABLE.
    expect(rendered.indexOf("set +e")).toBeLessThan(rendered.indexOf("pnpm add -g"));
    expect(rendered.match(/^bkit_provision\(\) \{$/gm)).toHaveLength(1);
    expect(rendered).toContain("bkit_provision 'vercel' bkit_provision_1");
    expect(rendered).toContain("bkit_provision 'supabase' bkit_provision_2");
    expect(rendered).toContain('BKIT_UNAVAILABLE=""');
    expect(rendered).toContain(`$REPO_ROOT/${UNAVAILABLE_RELPATH}`);
    expect(rendered.trimEnd().endsWith("\nset -e")).toBe(true);
  });

  it("names an unnamed provision block by its position", () => {
    write(
      ".agents/context.md",
      "<!-- bkit:end -->\n<!-- context-fetch:provision -->\n```bash\necho hi\n```\n<!-- context-fetch:end -->\n",
    );
    expect(renderCloudContextFetchProvision(tmpDir)).toContain(
      "bkit_provision '#1' bkit_provision_1",
    );
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
    write(".claude/bkit-cloud.md", "#!/bin/bash\n# cache-bust 2026-07-14-1\nset -euo pipefail\n");
    expect(renderCloudCacheBust(tmpDir, "2026-07-14")).toBe("# cache-bust 2026-07-14-2");
  });

  it("resets the counter to 1 when the prior doc is from an earlier date", () => {
    write(".claude/bkit-cloud.md", "#!/bin/bash\n# cache-bust 2026-07-13-5\nset -euo pipefail\n");
    expect(renderCloudCacheBust(tmpDir, "2026-07-14")).toBe("# cache-bust 2026-07-14-1");
  });

  it("starts at 1 when the prior doc has no cache-bust line (pre-feature doc)", () => {
    write(".claude/bkit-cloud.md", "#!/bin/bash\nset -euo pipefail\n");
    expect(renderCloudCacheBust(tmpDir, "2026-07-14")).toBe("# cache-bust 2026-07-14-1");
  });
});

describe("writeClaudeCloudDoc — end-to-end render (real template)", () => {
  const TOKENS: TokenMap = {
    DEFAULT_BRANCH: "main",
    PROJECT_NAME: "test-repo",
    REPO_SLUG: "acme/test-repo",
  };

  it("emits a cache-bust line and leaves NO unreplaced @@CLOUD_ sentinels", () => {
    expect(writeClaudeCloudDoc(tmpDir, TOKENS)).toBe(true);
    const out = fs.readFileSync(path.join(tmpDir, ".claude", "bkit-cloud.md"), "utf-8");
    // Cache-bust comment sits directly after the shebang, dated today, counter 1.
    expect(out).toMatch(/#!\/bin\/bash\n# cache-bust \d{4}-\d{2}-\d{2}-1\nset -euo pipefail\n/);
    // No sentinel leaks into the shipped paste doc.
    expect(out).not.toMatch(/@@CLOUD_/);
  });

  it("advances the counter on a same-day regeneration", () => {
    writeClaudeCloudDoc(tmpDir, TOKENS);
    writeClaudeCloudDoc(tmpDir, TOKENS);
    const out = fs.readFileSync(path.join(tmpDir, ".claude", "bkit-cloud.md"), "utf-8");
    expect(out).toMatch(/# cache-bust \d{4}-\d{2}-\d{2}-2\n/);
  });

  it("renders the always-Custom block with shipped hosts when no allowed-domains are declared", () => {
    writeClaudeCloudDoc(tmpDir, TOKENS);
    const out = fs.readFileSync(path.join(tmpDir, ".claude", "bkit-cloud.md"), "utf-8");
    // The tick instruction reaches the zero-declared path too. Without it a
    // zero-declaration consumer drops to a bare Custom list and loses PyPI, crates.io,
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
    const out = fs.readFileSync(path.join(tmpDir, ".claude", "bkit-cloud.md"), "utf-8");
    expect(out).toContain("Set to **Custom**");
    expect(out).toContain("Also include default list");
    expect(out).toMatch(/sentry\.io\n\*\.sentry\.io/);
    expect(out).toMatch(/vercel\.com\n\*\.vercel\.com/);
  });
});

describe("extractAllowedDomains / expandAllowedDomains / renderCloudNetworkAllowlist", () => {
  it("returns [] when context.md is absent or has no allowed-domains block", () => {
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
    // the pointer prose renders alongside the always-Custom block
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
// Cursor Background Agents — the twin of `.claude/bkit-cloud.md`. Same `.envrc`-following
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

describe("cloud setup scripts — the closing line names failed provision recipes", () => {
  const TOKENS: TokenMap = { DEFAULT_BRANCH: "main", PROJECT_NAME: "p", REPO_SLUG: "o/p" };

  it.each([
    [".claude", writeClaudeCloudDoc],
    [".codex", writeCodexCloudDoc],
  ] as const)("%s: closes with $BKIT_UNAVAILABLE, after the recipes run", (dir, render) => {
    write(
      ".agents/context.md",
      "<!-- bkit:end -->\n<!-- context-fetch:provision db -->\n```bash\ntrue\n```\n<!-- context-fetch:end -->\n",
    );
    render(tmpDir, TOKENS);
    const doc = fs.readFileSync(path.join(tmpDir, dir, "bkit-cloud.md"), "utf-8");
    const closing = doc.indexOf('echo "cloud setup done: ');
    expect(closing).toBeGreaterThan(doc.indexOf("bkit_provision 'db' bkit_provision_1"));
    expect(doc.slice(closing).split("\n")[0]).toContain(
      "${BKIT_UNAVAILABLE:+ — UNAVAILABLE: $BKIT_UNAVAILABLE",
    );
  });
});

describe("cloud docs — the env block never depends on the tracker", () => {
  const TOKENS: TokenMap = {
    DEFAULT_BRANCH: "main",
    PROJECT_NAME: "test-repo",
    REPO_SLUG: "acme/test-repo",
  };
  const docs = [
    [".claude", (cwd: string) => writeClaudeCloudDoc(cwd, TOKENS)],
    [".cursor", (cwd: string) => writeCursorCloudDoc(cwd, TOKENS)],
    [".codex", (cwd: string) => writeCodexCloudDoc(cwd, TOKENS)],
  ] as const;

  /** The first ```dotenv fence of a rendered doc — the paste block. */
  function envBlock(dir: string): string {
    const out = fs.readFileSync(path.join(tmpDir, dir, "bkit-cloud.md"), "utf-8");
    return /```dotenv\n([\s\S]*?)\n```/.exec(out)?.[1] ?? "";
  }

  it.each(docs)("%s: every tracker renders the same block for the same .envrc", (dir, render) => {
    write(".envrc", "dotenv_if_exists .bkit/.env");
    write(".bkit/.env", "BKIT_GH_TOKEN=real\nBKIT_LINEAR_API_KEY=lin\nBKIT_JIRA_API_KEY=jira\n");
    const blocks = ISSUE_TRACKERS.map((tracker) => {
      write("package.json", JSON.stringify({ name: "c", bkit: { tracker: { default: tracker } } }));
      expect(render(tmpDir)).toBe(true);
      return envBlock(dir);
    });
    expect(new Set(blocks).size).toBe(1);
    expect(blocks[0]!.split("\n")).toEqual([
      "BKIT_GH_TOKEN=real",
      "BKIT_LINEAR_API_KEY=lin",
      "BKIT_JIRA_API_KEY=jira",
    ]);
  });

  it.each(docs)("%s: no tracker key gets a placeholder; only BKIT_GH_TOKEN does", (dir, render) => {
    write("package.json", JSON.stringify({ name: "c", bkit: { tracker: { default: "linear" } } }));
    render(tmpDir);
    expect(
      envBlock(dir)
        .split("\n")
        .map((l) => l.split("=")[0]),
    ).toEqual(["BKIT_GH_TOKEN"]);
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
    expect(out).toContain("`vercel`");
    expect(out).toContain(".cursor/environment.json");
    expect(out).toContain("pnpm exec bkit context provision");
    expect(out).toContain(UNAVAILABLE_RELPATH);
  });
});

describe("renderCursorNetworkAllowlist", () => {
  it("no allowed-domains → still emits a fence carrying the shipped hosts (T13)", () => {
    const out = renderCursorNetworkAllowlist(tmpDir);
    expect(out).toContain("Security");
    expect(out).toMatch(/Allow all|Default \+ allowlist|Allowlist only/);
    expect(out).toContain("```text");
    // bkit's shipped entries are the exact hosts it calls, so they get no wildcard.
    expect(out).toContain("api.githubcopilot.com");
    expect(out).toContain("registry.npmjs.org");
    expect(out).not.toContain("*.githubcopilot.com");
  });

  it("declared domains → each as the domain and a *. wildcard, so its subdomains are reachable", () => {
    write(
      ".agents/context.md",
      "<!-- bkit:end -->\n## Cloud\n\n" +
        "<!-- allowed-domains:start -->\nsentry.io\nexample.com\n<!-- allowed-domains:end -->\n",
    );
    const fence = /```text\n([\s\S]*?)\n```/.exec(renderCursorNetworkAllowlist(tmpDir))![1];
    const lines = fence.split("\n");
    expect(lines).toEqual(expect.arrayContaining(["sentry.io", "*.sentry.io"]));
    expect(lines.indexOf("*.example.com")).toBe(lines.indexOf("example.com") + 1);
  });

  it("a declared shared hosting platform is widened too, with a note that it reaches every tenant", () => {
    write(
      ".agents/context.md",
      "<!-- bkit:end -->\n## Cloud\n\n" +
        "<!-- allowed-domains:start -->\nsupabase.co\nexample.com\n<!-- allowed-domains:end -->\n",
    );
    const out = renderCursorNetworkAllowlist(tmpDir);
    const lines = /```text\n([\s\S]*?)\n```/.exec(out)![1].split("\n");
    expect(lines).toEqual(expect.arrayContaining(["supabase.co", "*.supabase.co"]));
    expect(out).toContain("`supabase.co`: shared by many tenants");
    expect(out).not.toContain("`example.com`: shared");
  });
});

describe("cursor template generation sentinels", () => {
  const pkgRoot = path.resolve(
    path.dirname(new URL(import.meta.url).pathname),
    "..",
    "..",
    "..",
    "..",
  );
  const template = fs.readFileSync(
    path.join(pkgRoot, ".bkit", "shared", ".cursor", "bkit-cloud.md"),
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

  it("directs secrets to the Runtime Secret / Secrets-tab path, not the Environment Variables pane", () => {
    expect(template).toContain("Runtime Secret");
    expect(template).toContain("dashboard/cloud-agents");
    expect(template).not.toContain("Background Agents → Environment Variables");
  });
});

describe("writeCursorCloudDoc — end-to-end render (real template)", () => {
  const TOKENS: TokenMap = {
    DEFAULT_BRANCH: "main",
    PROJECT_NAME: "test-repo",
    REPO_SLUG: "acme/test-repo",
  };

  it("writes a sentinel-free, chmod-600 doc naming the repo", () => {
    write(".envrc", "dotenv_if_exists .bkit/.env");
    write(".bkit/.env", "BKIT_GH_TOKEN=real");
    expect(writeCursorCloudDoc(tmpDir, TOKENS)).toBe(true);
    const dst = path.join(tmpDir, ".cursor", "bkit-cloud.md");
    const out = fs.readFileSync(dst, "utf-8");
    expect(out).not.toMatch(/@@[A-Z_]+@@/);
    expect(out).toContain("test-repo");
    expect(out).toContain("BKIT_GH_TOKEN=real");
    expect(fs.statSync(dst).mode & 0o777).toBe(0o600);
  });
});

describe("extractCloudToolchainScript", () => {
  it("returns the pinned Node/vale/gh/jq installs from the Claude template, markers stripped", () => {
    const script = extractCloudToolchainScript();
    for (const key of ["NODE_SHA256", "VALE_SHA256", "GH_SHA256", "JQ_SHA256"]) {
      expect(script, key).toMatch(new RegExp(`^${key}="[0-9a-f]{64}"$`, "m"));
    }
    expect(script).toContain('export PATH="/usr/local/bin:$PATH"');
    expect(script).not.toContain("bkit-toolchain:");
    // Claude-only setup (workspace trust, user settings, cache bust) stays out.
    expect(script).not.toContain("hasTrustDialogAccepted");
    expect(script).not.toContain("cache-bust");
    expect(script).not.toContain("@@");
  });
});

describe("renderCodexNetworkAllowlist", () => {
  it("lists the same entries as the Cursor doc under the Codex internet-access toggles", () => {
    write(
      ".agents/context.md",
      "<!-- bkit:end -->\n## Cloud\n\n" +
        "<!-- allowed-domains:start -->\nsentry.io\nvercel.app\n<!-- allowed-domains:end -->\n",
    );
    const out = renderCodexNetworkAllowlist(tmpDir);
    const fence = (s: string) => /```text\n([\s\S]*?)\n```/.exec(s)![1];
    expect(out).toContain("Enable package manager domains");
    expect(out).toContain("Additional allowed domains");
    expect(fence(out)).toBe(fence(renderCursorNetworkAllowlist(tmpDir)));
    expect(fence(out).split("\n")).toEqual(
      expect.arrayContaining(["sentry.io", "*.sentry.io", "vercel.app", "*.vercel.app"]),
    );
    expect(out).toContain("`vercel.app`: shared by many tenants");
  });

  it("marks the *. entries untested on Codex and names the way around a blocked host", () => {
    const out = renderCodexNetworkAllowlist(tmpDir);
    expect(out).toContain("untested on Codex");
    expect(out).toContain("**Enable all public internet access**");
  });
});

/** The pasted list's line count and the numbers its count note gives. */
function readCountNote(out: string): {
  listed: number;
  total: number;
  shipped: number;
  added: number;
} {
  const fence = /```text\n([\s\S]*?)\n```/.exec(out);
  const note =
    /(\d+) (?:host\(s\)|domains|hosts and domains)[^:]*: (\d+) from bkit's shipped egress registry and (\d+) more from/.exec(
      out,
    );
  return {
    listed: fence === null ? 0 : fence[1].split("\n").length,
    total: Number(note?.[1]),
    shipped: Number(note?.[2]),
    added: Number(note?.[3]),
  };
}

describe("network allowlist count note", () => {
  // Pasted lines per counted entry: Claude widens every entry, Cursor and Codex only the
  // one declared entry they add.
  it.each([
    ["claude", renderCloudNetworkAllowlist, BKIT_SHIPPED_NETWORK_DOMAINS[0], (n: number) => n * 2],
    ["cursor", renderCursorNetworkAllowlist, BKIT_SHIPPED_NETWORK_HOSTS[0], (n: number) => n + 1],
    ["codex", renderCodexNetworkAllowlist, BKIT_SHIPPED_NETWORK_HOSTS[0], (n: number) => n + 1],
  ] as const)(
    "%s: a declared entry bkit already ships is counted once, and the numbers add up",
    (_host, render, alreadyShipped, linesFor) => {
      write(
        ".agents/context.md",
        "<!-- bkit:end -->\n<!-- allowed-domains:start -->\n" +
          `${alreadyShipped}\nnew-app.example\n<!-- allowed-domains:end -->\n`,
      );
      const out = render(tmpDir);
      const { listed, total, shipped, added } = readCountNote(out);
      expect(added).toBe(1);
      expect(total).toBe(shipped + added);
      expect(listed).toBe(linesFor(total));
      expect(out).toContain("(1 of its 2 entries already shipped)");
    },
  );

  it.each([
    ["claude", renderCloudNetworkAllowlist],
    ["cursor", renderCursorNetworkAllowlist],
    ["codex", renderCodexNetworkAllowlist],
  ] as const)("%s: no overlap note when every declared entry is new", (_host, render) => {
    write(
      ".agents/context.md",
      "<!-- bkit:end -->\n<!-- allowed-domains:start -->\nnew-app.example\n<!-- allowed-domains:end -->\n",
    );
    expect(render(tmpDir)).not.toContain("already shipped");
  });
});

describe("codex template generation sentinels", () => {
  const pkgRoot = path.resolve(
    path.dirname(new URL(import.meta.url).pathname),
    "..",
    "..",
    "..",
    "..",
  );
  const template = fs.readFileSync(
    path.join(pkgRoot, ".bkit", "shared", ".codex", "bkit-cloud.md"),
    "utf-8",
  );

  it("carries the sentinels writeCodexCloudDoc substitutes, and no Claude-only ones", () => {
    for (const s of [
      "@@CLOUD_ENV_VARS@@",
      "@@CLOUD_ENV_NOTES@@",
      "@@CODEX_NETWORK@@",
      "@@CODEX_TOOLCHAIN@@",
      "@@CLOUD_COREPACK@@",
      "@@CLOUD_CONTEXT_FETCH_PROVISION@@",
      "{{PROJECT_NAME}}",
    ]) {
      expect(template, s).toContain(s);
    }
    expect(template).not.toContain("@@CLOUD_CACHE_BUST@@");
    expect(template).not.toContain("@@CLOUD_WORKSPACE_TRUST@@");
    expect(template).not.toContain("@@CLOUD_USER_SETTINGS@@");
    // The toolchain pins live once, in the Claude template — never a third copy here.
    expect(template).not.toMatch(/_SHA256=/);
  });

  it("states the Codex mechanics: env vars vs network secrets, Personal vault, unproven hooks", () => {
    expect(template).toContain("Settings > Codex Cloud > Environments");
    expect(template).toContain("Install script");
    expect(template).toContain("Network secrets");
    expect(template).toContain("Allowed domains");
    expect(template).toContain("Personal vault");
    expect(template).toMatch(/hooks/i);
    expect(template).toContain("GateGuard");
  });
});

describe("writeCodexCloudDoc — end-to-end render (real template)", () => {
  const TOKENS: TokenMap = {
    DEFAULT_BRANCH: "main",
    PROJECT_NAME: "test-repo",
    REPO_SLUG: "acme/test-repo",
  };

  it("writes a sentinel-free, chmod-600 doc with the resolved env block", () => {
    write(".envrc", "dotenv_if_exists .bkit/.env");
    write(".bkit/.env", "BKIT_GH_TOKEN=real\nANTHROPIC_API_KEY=sk-drop");
    expect(writeCodexCloudDoc(tmpDir, TOKENS)).toBe(true);
    const dst = path.join(tmpDir, ".codex", "bkit-cloud.md");
    const out = fs.readFileSync(dst, "utf-8");
    expect(out).not.toMatch(/@@[A-Z_]+@@/);
    expect(out).toContain("test-repo");
    expect(out).toContain("BKIT_GH_TOKEN=real");
    expect(out).not.toContain("sk-drop");
    expect(fs.statSync(dst).mode & 0o777).toBe(0o600);
  });

  it("inlines the Claude template's toolchain pins and the consumer's corepack pnpm", () => {
    write("package.json", JSON.stringify({ name: "c", packageManager: "pnpm@10.34.3" }));
    writeCodexCloudDoc(tmpDir, TOKENS);
    const out = fs.readFileSync(path.join(tmpDir, ".codex", "bkit-cloud.md"), "utf-8");
    const claudePins = pins(extractCloudToolchainScript());
    expect(claudePins.size).toBeGreaterThanOrEqual(8);
    for (const [k, v] of claudePins) expect(pins(out).get(k), k).toBe(v);
    expect(out).toContain("pnpm@10.34.3");
    expect(out).toContain("pnpm install --frozen-lockfile");
  });

  it("bakes the consumer's context-fetch provision recipes into the install script", () => {
    write(
      ".agents/context.md",
      "<!-- bkit:end -->\n## Enabled\n\n" +
        "<!-- context-fetch:provision vercel -->\n```bash\ncommand -v vercel || pnpm add -g vercel\n```\n<!-- context-fetch:end -->\n",
    );
    writeCodexCloudDoc(tmpDir, TOKENS);
    const out = fs.readFileSync(path.join(tmpDir, ".codex", "bkit-cloud.md"), "utf-8");
    expect(out).toContain("command -v vercel || pnpm add -g vercel");
  });

  it("records the repo root before any toolchain step can leave it, and returns there", () => {
    writeCodexCloudDoc(tmpDir, TOKENS);
    const out = fs.readFileSync(path.join(tmpDir, ".codex", "bkit-cloud.md"), "utf-8");
    const script = String(/```bash\n(#!\/bin\/bash\n[\s\S]*?)```/.exec(out)?.[1]);
    expect(script.split("\n").slice(0, 3)).toEqual([
      "#!/bin/bash",
      "set -euo pipefail",
      'REPO_ROOT="$(git rev-parse --show-toplevel)"',
    ]);
    expect(script).not.toContain('cd "$(git rev-parse');
    // The toolchain's download steps `cd /tmp`; the repo install must come back first.
    expect(script.lastIndexOf("cd /tmp")).toBeLessThan(script.indexOf('cd "$REPO_ROOT"'));
    expect(script.indexOf('cd "$REPO_ROOT"')).toBeLessThan(script.indexOf("pnpm install"));
  });
});

describe("extractMcpServers / resolveClaudeDerivedAllows", () => {
  it("returns [] when context.md is absent or declares no mcp-servers block", () => {
    expect(extractMcpServers(tmpDir)).toEqual([]);
    write(".agents/context.md", "<!-- bkit:end -->\nno servers here\n");
    expect(extractMcpServers(tmpDir)).toEqual([]);
  });

  it("extracts names verbatim below bkit:end, deduped, comments and examples ignored", () => {
    write(
      ".agents/context.md",
      "<!-- mcp-servers:start -->\nexample\n<!-- mcp-servers:end -->\n" +
        "<!-- bkit:end -->\n<!-- mcp-servers:start -->\n# project\nsentry\n\n  Supabase  \nsentry\n" +
        "<!-- mcp-servers:end -->\n",
    );
    expect(extractMcpServers(tmpDir)).toEqual(["sentry", "Supabase"]);
  });

  it("an mcp-servers block does not leak into allowed-domains, nor the reverse", () => {
    write(
      ".agents/context.md",
      "<!-- bkit:end -->\n<!-- allowed-domains:start -->\nsentry.io\n<!-- allowed-domains:end -->\n" +
        "<!-- mcp-servers:start -->\nsentry\n<!-- mcp-servers:end -->\n",
    );
    expect(extractAllowedDomains(tmpDir)).toEqual(["sentry.io"]);
    expect(extractMcpServers(tmpDir)).toEqual(["sentry"]);
  });

  it("derives WebFetch grants, then both Claude MCP tool-id forms per server", () => {
    write(
      ".agents/context.md",
      "<!-- bkit:end -->\n<!-- mcp-servers:start -->\nSupabase\n<!-- mcp-servers:end -->\n",
    );
    const allows = resolveClaudeDerivedAllows(tmpDir);
    expect(allows).toContain("WebFetch(domain:github.com)");
    expect(allows.slice(-2)).toEqual(["mcp__Supabase__*", "mcp__claude_ai_Supabase__*"]);
  });
});

describe("writeCursorCliPermissionsArtifact — .cursor/cli.json writer", () => {
  const rel = path.join(".cursor", "cli.json");

  it("writes one Mcp(<server>:*) allow per declared server", () => {
    write(
      ".agents/context.md",
      "<!-- bkit:end -->\n<!-- mcp-servers:start -->\nsentry\nsupabase\n<!-- mcp-servers:end -->\n",
    );
    const res = writeCursorCliPermissionsArtifact(tmpDir, false);
    expect(res).toEqual({ path: rel, wrote: true });
    expect(JSON.parse(fs.readFileSync(path.join(tmpDir, rel), "utf-8"))).toEqual({
      permissions: { allow: ["Mcp(sentry:*)", "Mcp(supabase:*)"], deny: [] },
    });
  });

  it("writes an empty allow list when no servers are declared", () => {
    writeCursorCliPermissionsArtifact(tmpDir, false);
    const written = JSON.parse(fs.readFileSync(path.join(tmpDir, rel), "utf-8"));
    expect(written.permissions.allow).toEqual([]);
  });

  it("regenerates over a hand edit, and is a no-op once current", () => {
    write(rel, '{ "permissions": { "allow": ["Shell(ls)"] } }\n');
    expect(writeCursorCliPermissionsArtifact(tmpDir, false).wrote).toBe(true);
    expect(writeCursorCliPermissionsArtifact(tmpDir, false).wrote).toBe(false);
  });

  it("dry-run reports the pending write without touching disk", () => {
    expect(writeCursorCliPermissionsArtifact(tmpDir, true).wrote).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, rel))).toBe(false);
  });
});

describe("egress registry — completeness, invariants and the anti-widening gate", () => {
  const providerRows = BKIT_EGRESS_SOURCES.filter((r) => r.kind === "opencode-provider");

  /** True when `host` equals a base or is a subdomain of one. */
  function hostIsCovered(host: string, bases: readonly string[]): boolean {
    return bases.some((b) => host === b || host.endsWith(`.${b}`));
  }

  // T1 — every registry key has exactly one row, and every row is well-formed.
  it("T1: one opencode-provider row per provider key, ids unique, rows well-formed", () => {
    const providerKeys = Object.keys(OPENCODE_PROVIDER_DEFAULTS).sort();
    expect(providerRows.map((r) => r.id).sort()).toEqual(providerKeys);

    const ids = BKIT_EGRESS_SOURCES.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);

    // non-empty bases OR an explicit reason for having none
    const noBases = BKIT_EGRESS_SOURCES.filter((r) => r.bases.length === 0);
    expect(noBases.filter((r) => typeof r.reason !== "string").map((r) => r.id)).toEqual([]);
    // a row that grants bases must name the hosts those bases exist for
    const withBases = BKIT_EGRESS_SOURCES.filter((r) => r.bases.length > 0);
    expect(withBases.filter((r) => r.hosts.length === 0).map((r) => r.id)).toEqual([]);
  });

  // T1 (continued) — the tracker/updater sweep, asserting WHAT was skipped, not just the count.
  it("T1: every issue tracker but the 'none' sentinel has an mcp row, and 'none' was the only skip", () => {
    const skipped = ISSUE_TRACKERS.filter((tracker) => tracker === "none");
    expect(skipped).toEqual(["none"]);
    for (const tracker of ISSUE_TRACKERS.filter((t) => t !== "none")) {
      expect(BKIT_EGRESS_SOURCES.find((r) => r.id === `mcp-${tracker}`)?.kind).toBe("tracker-mcp");
    }
  });

  // T2 — the literals in the leaf are tied back to the provider baseURL they claim to derive from.
  it("T2: provider rows match their baseURL host, and every host is covered by a base", () => {
    expect(providerRows.filter((r) => !isOpencodeProvider(r.id)).map((r) => r.id)).toEqual([]);
    const withURLs = providerRows.map((row) => ({
      row,
      baseURL: OPENCODE_PROVIDER_DEFAULTS[row.id as OpencodeProvider].baseURL,
    }));
    const withBaseURL = withURLs.filter(({ baseURL }) => baseURL !== "");
    const builtins = withURLs.filter(({ baseURL }) => baseURL === "");
    expect(withBaseURL.length).toBeGreaterThan(0);
    for (const { row, baseURL } of withBaseURL) {
      // the derived literal must still equal what the provider's baseURL resolves to
      expect(row.hosts).toContain(new URL(baseURL).hostname);
      expect(row.bases).toContain(proposeEgressBase(baseURL));
    }
    for (const { row } of builtins) {
      // a builtin contributes no baseURL, so its row must say why it still carries hosts
      expect(typeof row.reason, row.id).toBe("string");
    }
    const withUncoveredHosts = BKIT_EGRESS_SOURCES.filter((row) =>
      row.hosts.some((h) => !hostIsCovered(h, row.bases)),
    );
    for (const row of withUncoveredHosts) expect(typeof row.reason, row.id).toBe("string");
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
    // linear.app is a company apex. dora.dev, google.dev and slsa.dev are audit anchor
    // publishers (DORA, the Gemini
    // prompting guide at ai.google.dev, SLSA): each is its owner's own apex, not a platform
    // that hosts other tenants.
    const ACCEPTED_SOFT_WARN = ["dora.dev", "google.dev", "linear.app", "models.dev", "slsa.dev"];
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
