import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  claudeSettingsHas,
  codexTopLevelHas,
  hasJsTestRunner,
  hasLintStagedConfig,
  hasMcpServer,
  hasTestLinter,
  listMcpServers,
  unlockedMcpServers,
} from "./detect";

let cwd: string;
const write = (rel: string, content: string) => {
  fs.mkdirSync(path.dirname(path.join(cwd, rel)), { recursive: true });
  fs.writeFileSync(path.join(cwd, rel), content);
};

beforeEach(() => {
  cwd = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-tips-detect-"));
});
afterEach(() => {
  fs.rmSync(cwd, { recursive: true, force: true });
});

describe("listMcpServers", () => {
  it("reads every host encoding", () => {
    write(".mcp.json", JSON.stringify({ mcpServers: { github: { url: "https://a" } } }));
    write(".cursor/mcp.json", JSON.stringify({ mcpServers: { serena: { command: "x" } } }));
    write(".opencode/opencode.json", JSON.stringify({ mcp: { vercel: { url: "https://v" } } }));
    write(
      ".codex/config.toml",
      'model = "x"\n[mcp_servers.sentry]\nurl = "https://s"\n[other]\nurl = "https://ignored"\n',
    );
    expect(listMcpServers(cwd)).toEqual([
      { file: ".mcp.json", name: "github", url: "https://a" },
      { file: ".cursor/mcp.json", name: "serena", url: null },
      { file: ".opencode/opencode.json", name: "vercel", url: "https://v" },
      { file: ".codex/config.toml", name: "sentry", url: "https://s" },
    ]);
    expect(hasMcpServer(cwd, "serena")).toBe(true);
    expect(hasMcpServer(cwd, "linear")).toBe(false);
  });

  it("skips malformed JSON instead of throwing", () => {
    write(".mcp.json", "{ not json");
    expect(listMcpServers(cwd)).toEqual([]);
  });
});

describe("unlockedMcpServers", () => {
  const servers = (urls: Record<string, string>) =>
    write(
      ".mcp.json",
      JSON.stringify({
        mcpServers: Object.fromEntries(Object.entries(urls).map(([k, url]) => [k, { url }])),
      }),
    );

  it("flags account-wide URLs of lockable services", () => {
    servers({
      sentry: "https://mcp.sentry.dev/mcp",
      supabase: "https://mcp.supabase.com/mcp?read_only=true",
      vercel: "https://mcp.vercel.com",
      github: "https://api.githubcopilot.com/mcp/",
      linear: "https://mcp.linear.app/mcp",
      jira: "https://mcp.atlassian.com/v2/mcp",
    });
    expect(unlockedMcpServers(cwd).map((s) => s.name)).toEqual(["sentry", "supabase", "vercel"]);
  });

  it("passes URLs locked to one project", () => {
    servers({
      sentry: "https://mcp.sentry.dev/mcp/acme/web",
      supabase: "https://mcp.supabase.com/mcp?project_ref=abc&read_only=true",
      vercel: "https://mcp.vercel.com/acme/web",
    });
    expect(unlockedMcpServers(cwd)).toEqual([]);
  });

  it("flags an org-only Sentry URL", () => {
    servers({ sentry: "https://mcp.sentry.dev/mcp/acme" });
    expect(unlockedMcpServers(cwd)).toHaveLength(1);
  });
});

describe("claudeSettingsHas", () => {
  it("reads the shared and the personal settings file", () => {
    expect(claudeSettingsHas(cwd, "autoCompactWindow")).toBe(false);
    write(".claude/settings.local.json", JSON.stringify({ autoCompactWindow: 300000 }));
    expect(claudeSettingsHas(cwd, "autoCompactWindow")).toBe(true);
  });

  it("counts an explicit false as set", () => {
    write(".claude/settings.json", JSON.stringify({ disableClaudeAiConnectors: false }));
    expect(claudeSettingsHas(cwd, "disableClaudeAiConnectors")).toBe(true);
  });
});

describe("codexTopLevelHas", () => {
  it("accepts the key above the first table header", () => {
    write(".codex/config.toml", "model_auto_compact_token_limit = 300000\n[mcp_servers.x]\n");
    expect(codexTopLevelHas(cwd, "model_auto_compact_token_limit")).toBe(true);
  });

  it("rejects the key inside a table, where Codex ignores it", () => {
    write(".codex/config.toml", "[profiles.x]\nmodel_auto_compact_token_limit = 300000\n");
    expect(codexTopLevelHas(cwd, "model_auto_compact_token_limit")).toBe(false);
  });

  it("is false with no config file", () => {
    expect(codexTopLevelHas(cwd, "model_auto_compact_token_limit")).toBe(false);
  });
});

describe("hasLintStagedConfig", () => {
  it("accepts a config file or the package.json key", () => {
    expect(hasLintStagedConfig(cwd)).toBe(false);
    write("package.json", JSON.stringify({ "lint-staged": { "*": "prettier -w" } }));
    expect(hasLintStagedConfig(cwd)).toBe(true);
  });

  it("accepts .lintstagedrc.json", () => {
    write(".lintstagedrc.json", "{}");
    expect(hasLintStagedConfig(cwd)).toBe(true);
  });
});

describe("hasJsTestRunner", () => {
  it.each([
    ["vitest", "devDependencies"],
    ["jest", "dependencies"],
    ["vitest", "peerDependencies"],
  ])("accepts %s under %s", (runner, field) => {
    expect(hasJsTestRunner(cwd)).toBe(false);
    write("package.json", JSON.stringify({ [field]: { [runner]: "*" } }));
    expect(hasJsTestRunner(cwd)).toBe(true);
  });

  it("rejects other dependencies, including names that merely contain a runner's", () => {
    write(
      "package.json",
      JSON.stringify({ devDependencies: { "jest-dom": "*", "vitest-x": "*" } }),
    );
    expect(hasJsTestRunner(cwd)).toBe(false);
  });
});

describe("hasTestLinter", () => {
  it("is false for a bare repo and for an ESLint config that names no test plugin", () => {
    expect(hasTestLinter(cwd)).toBe(false);
    write("eslint.config.mjs", "export default [{ rules: { semi: 'error' } }];\n");
    expect(hasTestLinter(cwd)).toBe(false);
  });

  it.each([[".oxlintrc.json"], ["oxlint.config.ts"], ["oxlint.config.mjs"]])(
    "accepts the Oxlint config %s",
    (file) => {
      write(file, "");
      expect(hasTestLinter(cwd)).toBe(true);
    },
  );

  it("accepts oxlint as a dependency", () => {
    write("package.json", JSON.stringify({ devDependencies: { oxlint: "^1.0.0" } }));
    expect(hasTestLinter(cwd)).toBe(true);
  });

  it.each([
    ["eslint.config.js", 'import vitest from "@vitest/eslint-plugin";'],
    ["eslint.config.mjs", 'import playwright from "eslint-plugin-playwright";'],
    [".eslintrc.json", '{ "plugins": ["testing-library"] }'],
    [".eslintrc.cjs", 'module.exports = { extends: ["plugin:jest/recommended"] };'],
  ])("accepts the ESLint config %s naming a test plugin", (file, content) => {
    write(file, content);
    expect(hasTestLinter(cwd)).toBe(true);
  });

  it("accepts a package.json eslintConfig naming a test plugin", () => {
    write("package.json", JSON.stringify({ eslintConfig: { plugins: ["vitest"] } }));
    expect(hasTestLinter(cwd)).toBe(true);
  });

  it("rejects a package.json eslintConfig naming none", () => {
    write("package.json", JSON.stringify({ eslintConfig: { extends: "eslint:recommended" } }));
    expect(hasTestLinter(cwd)).toBe(false);
  });
});
