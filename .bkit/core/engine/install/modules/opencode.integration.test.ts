// install/modules/opencode.integration.test.ts — Integration tests for the opencode module.

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { WriteSet } from "../write";
import { parseModelLookup, buildOpencodeModelLookup, parseEffortMap } from "../../render/models";
import type { PreflightFinding } from "../../checks/before/index";
import { runOpencodeModule, renderOpencodeJson, reconcileOpencodeJson } from "./opencode";
import type { ModuleContext } from "./index";
import { getBkitDocsRoot } from "../../shared/package-roots";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let tmpDir: string;

let originalCwd: string;

function makeWriteSet(): WriteSet {
  return { writes: [] };
}

beforeEach(() => {
  originalCwd = process.cwd();
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-modules-test-"));
  // Seed package.json so resolveTokens doesn't fail
  fs.writeFileSync(
    path.join(tmpDir, "package.json"),
    JSON.stringify({ name: "test-project", packageManager: "pnpm@10.4.1" }),
    "utf-8",
  );
  process.chdir(tmpDir);
});

afterEach(() => {
  process.chdir(originalCwd);
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

// ---------------------------------------------------------------------------
// runOpencodeModule — opt-in opencode host (Task 2.2 "Done when")
// ---------------------------------------------------------------------------

describe("runOpencodeModule — clean install writeset (Task 2.2)", () => {
  // Resolve the real opencode model lookup from prompts.md (same source used at install time)
  const PROMPTS_MD = path.join(getBkitDocsRoot(), "prompts.md");
  const CATALOG_MODEL_LOOKUP = parseModelLookup(PROMPTS_MD);
  const OPENCODE_MODEL_LOOKUP = buildOpencodeModelLookup(PROMPTS_MD, "opencode-zen");
  const EFFORT_MAP = parseEffortMap(PROMPTS_MD);
  const EXPECTED_AGENT_COUNT = CATALOG_MODEL_LOOKUP.size;

  function makeOpencodeCtx(overrides: Partial<ModuleContext> = {}): ModuleContext {
    return {
      dryRun: false,
      tokens: {
        DEFAULT_BRANCH: "main",
        PROJECT_NAME: "test-project",
        REPO_SLUG: "acme/test-project",
      },
      modelLookup: CATALOG_MODEL_LOOKUP,
      opencodeModelLookup: OPENCODE_MODEL_LOOKUP,
      effortMap: EFFORT_MAP,
      opencodeProvider: "ollama",
      advisories: [],
      ws: makeWriteSet(),
      logPrefix: "[bkit-install]",
      postDispatch: [],
      issueTracker: "none",
      ...overrides,
    };
  }

  it("clean install writes .opencode/agents/*.md (one per catalog agent)", () => {
    // Agent files are written via installFile and tracked in ws.writes so check exits 1 on drift.
    const ws = makeWriteSet();
    const ctx = makeOpencodeCtx({ ws });
    runOpencodeModule(ctx);

    expect(EXPECTED_AGENT_COUNT).toBeGreaterThan(0);

    const agentDir = path.join(tmpDir, ".opencode", "agents");
    expect(fs.existsSync(agentDir)).toBe(true);
    const agentFiles = fs.readdirSync(agentDir).filter((f) => f.endsWith(".md"));
    expect(agentFiles.length).toBe(EXPECTED_AGENT_COUNT);
    expect(ws.writes.filter((w) => w.path.includes(path.join(".opencode", "agents"))).length).toBe(
      EXPECTED_AGENT_COUNT,
    );

    // Verify agent files have opencode frontmatter
    for (const f of agentFiles) {
      const content = fs.readFileSync(path.join(agentDir, f), "utf-8");
      expect(content).toMatch(/^---\n/);
      expect(content).toContain("mode: subagent");
      expect(content).toContain("model:");
    }
  });

  it("clean install writes .opencode/commands/*.md (one per bkit workflow)", () => {
    // Command files are written via installFile and tracked in ws.writes so check exits 1 on drift.
    const ws = makeWriteSet();
    const ctx = makeOpencodeCtx({ ws });
    runOpencodeModule(ctx);

    const commandDir = path.join(tmpDir, ".opencode", "commands");
    expect(fs.existsSync(commandDir)).toBe(true);
    const commandFiles = fs.readdirSync(commandDir).filter((f) => f.endsWith(".md"));
    expect(
      ws.writes.filter((w) => w.path.includes(path.join(".opencode", "commands"))).length,
    ).toBe(commandFiles.length);
    expect(commandFiles.length).toBeGreaterThan(0);

    // Command files exist on disk
    for (const f of commandFiles) {
      expect(fs.existsSync(path.join(commandDir, f))).toBe(true);
    }
  });

  it("clean install writes .opencode/opencode.json", () => {
    const ws = makeWriteSet();
    const ctx = makeOpencodeCtx({ ws });
    runOpencodeModule(ctx);

    const jsonWrite = ws.writes.find((w) =>
      w.path.endsWith(path.join(".opencode", "opencode.json")),
    );
    expect(jsonWrite).toBeDefined();

    const jsonPath = path.join(tmpDir, ".opencode", "opencode.json");
    expect(fs.existsSync(jsonPath)).toBe(true);
    const parsed = JSON.parse(fs.readFileSync(jsonPath, "utf-8")) as Record<string, unknown>;
    // Must have permission + plugin blocks (no plaintext key material)
    expect(parsed).toHaveProperty("permission");
    expect(parsed).toHaveProperty("plugin");
    // No plaintext API key — provider key must be an env-var reference
    const jsonStr = JSON.stringify(parsed);
    expect(jsonStr).not.toMatch(/sk-[a-zA-Z0-9]{20,}/); // no raw API key
  });

  it("clean install writes .opencode/plugin/bkit-gateguard.js", () => {
    const ws = makeWriteSet();
    const ctx = makeOpencodeCtx({ ws });
    runOpencodeModule(ctx);

    const pluginWrite = ws.writes.find((w) =>
      w.path.endsWith(path.join(".opencode", "plugin", "bkit-gateguard.js")),
    );
    expect(pluginWrite).toBeDefined();
    expect(fs.existsSync(path.join(tmpDir, ".opencode", "plugin", "bkit-gateguard.js"))).toBe(true);
  });

  // Install is additive: a second provider install adds its block without
  // removing the first. Both openrouter + opencode blocks coexist after two installs.
  it("provider switch openrouter → opencode-go keeps both blocks (additive install)", () => {
    type OpencodeDoc = { provider?: Record<string, Record<string, unknown>> };
    const jsonPath = path.join(tmpDir, ".opencode", "opencode.json");

    runOpencodeModule(makeOpencodeCtx({ opencodeProvider: "openrouter" }));
    let parsed = JSON.parse(fs.readFileSync(jsonPath, "utf-8")) as OpencodeDoc;
    expect(
      parsed.provider?.openrouter,
      "openrouter provider seeded on first install",
    ).toBeDefined();
    expect(fs.readFileSync(jsonPath, "utf-8")).toContain("BKIT_OPENROUTER_API_KEY");

    // opencode-go renders a built-in block keyed `opencode-go` (apiKey only — no npm/baseURL).
    runOpencodeModule(makeOpencodeCtx({ opencodeProvider: "opencode-go" }));
    parsed = JSON.parse(fs.readFileSync(jsonPath, "utf-8")) as OpencodeDoc;
    // Additive: openrouter block is preserved alongside the new opencode-go block.
    expect(
      parsed.provider?.openrouter,
      "openrouter provider preserved (additive install)",
    ).toBeDefined();
    const go = parsed.provider?.["opencode-go"];
    expect((go?.options as Record<string, unknown>)?.apiKey).toBe("{env:BKIT_OPENCODE_API_KEY}");
    expect(go?.npm).toBeUndefined();
    expect((go?.options as Record<string, unknown>)?.baseURL).toBeUndefined();
  });

  it("reinstall heals a corrupted opencode-go block (strips hijacked npm/baseURL)", () => {
    type OpencodeDoc = { provider?: Record<string, Record<string, unknown>> };
    const jsonPath = path.join(tmpDir, ".opencode", "opencode.json");

    runOpencodeModule(makeOpencodeCtx({ opencodeProvider: "opencode-go" }));
    const doc = JSON.parse(fs.readFileSync(jsonPath, "utf-8")) as OpencodeDoc;
    // Consumer (or prior bug) hijacked the built-in with an ollama-shaped block.
    doc.provider!["opencode-go"] = {
      npm: "@ai-sdk/openai-compatible",
      name: "hijacked",
      options: {
        baseURL: "http://localhost:11434/v1",
        apiKey: "{env:BKIT_OPENCODE_API_KEY}",
      },
    };
    fs.writeFileSync(jsonPath, JSON.stringify(doc, null, 2) + "\n", "utf-8");

    runOpencodeModule(makeOpencodeCtx({ opencodeProvider: "opencode-go" }));
    const healed = JSON.parse(fs.readFileSync(jsonPath, "utf-8")) as OpencodeDoc;
    const block = healed.provider?.["opencode-go"];
    expect(block?.npm).toBeUndefined();
    expect(block?.name).toBeUndefined();
    expect((block?.options as Record<string, unknown>)?.baseURL).toBeUndefined();
    expect((block?.options as Record<string, unknown>)?.apiKey).toBe("{env:BKIT_OPENCODE_API_KEY}");
    expect(Object.keys(block ?? {})).toEqual(["options"]);
  });

  it("provider switch openrouter → openrouter keeps both provider blocks (additive install)", () => {
    type OpencodeDoc = { provider?: Record<string, unknown> };
    const jsonPath = path.join(tmpDir, ".opencode", "opencode.json");

    runOpencodeModule(makeOpencodeCtx({ opencodeProvider: "openrouter" }));
    runOpencodeModule(makeOpencodeCtx({ opencodeProvider: "openrouter" }));

    const parsed = JSON.parse(fs.readFileSync(jsonPath, "utf-8")) as OpencodeDoc;
    expect(parsed.provider?.openrouter, "openrouter provider present").toBeDefined();
    expect(
      parsed.provider?.openrouter,
      "openrouter provider preserved (additive install)",
    ).toBeDefined();
  });

  it("preserves both consumer-added and bkit provider blocks across a second install", () => {
    type OpencodeDoc = { provider?: Record<string, unknown> };
    const jsonPath = path.join(tmpDir, ".opencode", "opencode.json");

    runOpencodeModule(makeOpencodeCtx({ opencodeProvider: "openrouter" }));
    // Consumer adds their own provider under a key bkit never seeds.
    const doc = JSON.parse(fs.readFileSync(jsonPath, "utf-8")) as OpencodeDoc;
    (doc.provider as Record<string, unknown>)["my-custom"] = {
      npm: "@acme/driver",
      name: "my-custom",
      options: {},
    };
    fs.writeFileSync(jsonPath, JSON.stringify(doc, null, 2) + "\n", "utf-8");

    runOpencodeModule(makeOpencodeCtx({ opencodeProvider: "openrouter" }));
    const parsed = JSON.parse(fs.readFileSync(jsonPath, "utf-8")) as OpencodeDoc;
    expect(parsed.provider?.["my-custom"], "consumer provider preserved").toBeDefined();
    // Additive: the prior bkit openrouter block is also preserved.
    expect(
      parsed.provider?.openrouter,
      "prior bkit provider preserved (additive install)",
    ).toBeDefined();
    expect(parsed.provider?.openrouter, "new bkit provider present").toBeDefined();
  });

  it("additive install: openrouter then ollama → both provider blocks present", () => {
    type OpencodeDoc = { provider?: Record<string, unknown> };
    const jsonPath = path.join(tmpDir, ".opencode", "opencode.json");

    runOpencodeModule(makeOpencodeCtx({ opencodeProvider: "openrouter" }));
    runOpencodeModule(makeOpencodeCtx({ opencodeProvider: "ollama" }));

    const parsed = JSON.parse(fs.readFileSync(jsonPath, "utf-8")) as OpencodeDoc;
    expect(
      parsed.provider?.openrouter,
      "openrouter block present after additive install",
    ).toBeDefined();
    expect(
      parsed.provider?.["ollama"],
      "ollama block present after additive install",
    ).toBeDefined();
  });

  it("opencode setup advisory is emitted on --opencode=<provider> install (Task 2.2)", () => {
    const ctx = makeOpencodeCtx({ opencodeProvider: "openrouter" });
    runOpencodeModule(ctx);

    const advisory = ctx.advisories.find((a) => a.id === "opencode-setup");
    expect(advisory).toBeDefined();
    expect(advisory!.detect).toMatch(/opencode host installed/);
    // Advisory names the provider key env var
    expect(advisory!.action).toMatch(/BKIT_OPENROUTER_API_KEY/);
    // Advisory references bkit doctor/status
    expect(advisory!.action).toMatch(/bkit doctor/);
    expect(advisory!.action).toMatch(/bkit status/);
    // No plaintext API key echoed in advisory
    expect(advisory!.action).not.toMatch(/sk-[a-zA-Z0-9]{20,}/);
  });

  it("ollama advisory names its API key env var", () => {
    const ctx = makeOpencodeCtx({ opencodeProvider: "ollama" });
    runOpencodeModule(ctx);

    const advisory = ctx.advisories.find((a) => a.id === "opencode-setup");
    expect(advisory).toBeDefined();
    expect(advisory!.action).toMatch(/BKIT_OLLAMA_API_KEY/);
  });

  it("dry-run: no agent/command .md files written to disk, advisory still emitted", () => {
    const ws = makeWriteSet();
    const ctx = makeOpencodeCtx({ ws, dryRun: true });
    runOpencodeModule(ctx);

    // In dry-run: agent and command .md files must NOT exist on disk
    const agentDir = path.join(tmpDir, ".opencode", "agents");
    const commandDir = path.join(tmpDir, ".opencode", "commands");
    // Dirs may be created by ensureDir, but no .md files should be written
    if (fs.existsSync(agentDir)) {
      const agentFiles = fs.readdirSync(agentDir).filter((f) => f.endsWith(".md"));
      expect(agentFiles).toHaveLength(0);
    }
    if (fs.existsSync(commandDir)) {
      const commandFiles = fs.readdirSync(commandDir).filter((f) => f.endsWith(".md"));
      expect(commandFiles).toHaveLength(0);
    }
    // opencode.json and bkit-gateguard.js must not exist on disk
    expect(fs.existsSync(path.join(tmpDir, ".opencode", "opencode.json"))).toBe(false);
    expect(fs.existsSync(path.join(tmpDir, ".opencode", "plugin", "bkit-gateguard.js"))).toBe(
      false,
    );
    // Advisory still fired
    expect(ctx.advisories.find((a) => a.id === "opencode-setup")).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// runOpencodeModule — transactional-staging zero-footprint (KN-12, Task 2.2)
// ---------------------------------------------------------------------------

describe("runOpencodeModule — staging zero-footprint on failure (KN-12, Task 2.2)", () => {
  const PROMPTS_MD = path.join(getBkitDocsRoot(), "prompts.md");
  const OPENCODE_MODEL_LOOKUP = buildOpencodeModelLookup(PROMPTS_MD, "opencode-zen");
  const CATALOG_MODEL_LOOKUP = parseModelLookup(PROMPTS_MD);

  it("zero .opencode/ footprint before runOpencodeModule is called", () => {
    // Before any opencode install: .opencode/ must not exist in a fresh consumer dir
    expect(fs.existsSync(path.join(tmpDir, ".opencode"))).toBe(false);
  });

  it("after a successful install, .opencode/ exists; uninstalling leaves zero footprint", () => {
    const ws = makeWriteSet();
    const ctx = {
      dryRun: false,
      tokens: {
        DEFAULT_BRANCH: "main",
        PROJECT_NAME: "test-project",
        REPO_SLUG: "acme/test-project",
      },
      modelLookup: CATALOG_MODEL_LOOKUP,
      opencodeModelLookup: OPENCODE_MODEL_LOOKUP,
      effortMap: parseEffortMap(PROMPTS_MD),
      opencodeProvider: "ollama",
      advisories: [] as PreflightFinding[],
      ws,
      logPrefix: "[bkit-install]",
      postDispatch: [] as Array<() => void>,
      issueTracker: "none" as const,
    };

    runOpencodeModule(ctx);
    expect(fs.existsSync(path.join(tmpDir, ".opencode"))).toBe(true);

    // Simulate surgical removal: delete all .opencode/ bkit-prefix agent/command files
    const agentDir = path.join(tmpDir, ".opencode", "agents");
    const commandDir = path.join(tmpDir, ".opencode", "commands");
    const pluginDir = path.join(tmpDir, ".opencode", "plugin");

    if (fs.existsSync(agentDir)) fs.rmSync(agentDir, { recursive: true });
    if (fs.existsSync(commandDir)) fs.rmSync(commandDir, { recursive: true });
    if (fs.existsSync(pluginDir)) fs.rmSync(pluginDir, { recursive: true });
    const jsonPath = path.join(tmpDir, ".opencode", "opencode.json");
    if (fs.existsSync(jsonPath)) fs.rmSync(jsonPath);

    // After removal, agent/command/plugin dirs and json are gone
    expect(fs.existsSync(path.join(tmpDir, ".opencode", "opencode.json"))).toBe(false);
  });
});

describe("renderOpencodeJson — opencode custom-provider format", () => {
  const TEMPLATE = path.resolve(".bkit/shared/.opencode/opencode.json");
  // Resolved at collection time — the `it` bodies below run after a chdir into a temp repo.
  const CLAUDE_SETTINGS_TEMPLATE = path.resolve(".bkit/shared/.claude/settings.json");

  it("openrouter (remote): npm driver, aggregator baseURL, apiKey via {env:BKIT_OPENROUTER_API_KEY}", () => {
    const parsed = JSON.parse(renderOpencodeJson(TEMPLATE, "github", "openrouter"));
    const block = parsed.provider?.openrouter;
    expect(block).toBeTruthy();
    expect(block.npm).toBe("@ai-sdk/openai-compatible");
    expect(block.options.baseURL).toBe("https://openrouter.ai/api/v1");
    expect(block.options.apiKey).toBe("{env:BKIT_OPENROUTER_API_KEY}");
    expect(block.api).toBeUndefined(); // an "api" field makes opencode reject the whole config
    expect(JSON.stringify(block)).not.toContain("${");
  });

  it("github MCP: type 'remote' (not 'http') + {env:} header — opencode schema valid", () => {
    // type "http" is valid for Claude/Cursor but NOT in opencode's enum (["local","remote"]);
    // its presence makes opencode reject the whole config.
    const parsed = JSON.parse(renderOpencodeJson(TEMPLATE, "github", "openrouter"));
    const gh = parsed.mcp?.github;
    expect(gh.type).toBe("remote");
    expect(gh.headers.Authorization).toBe("Bearer {env:BKIT_GH_TOKEN}");
    expect(JSON.stringify(parsed.mcp)).not.toContain('"http"');
    expect(JSON.stringify(parsed.mcp)).not.toContain("${");
  });

  it("linear MCP: type 'remote' (not 'http')", () => {
    const parsed = JSON.parse(renderOpencodeJson(TEMPLATE, "linear", "openrouter"));
    expect(parsed.mcp?.linear?.type).toBe("remote");
  });

  it("uses the 'plugin' key (singular), not 'plugins' (opencode schema)", () => {
    const parsed = JSON.parse(renderOpencodeJson(TEMPLATE, "github", "openrouter"));
    expect(parsed.plugin).toContain("./plugin/bkit-gateguard.js");
    expect(parsed.plugins).toBeUndefined();
  });

  it("permission: opencode tool-keyed map (not Claude {rules:[...]}), force-push gated", () => {
    const parsed = JSON.parse(renderOpencodeJson(TEMPLATE, "github", "openrouter"));
    const perm = parsed.permission;
    expect(perm.rules).toBeUndefined(); // the Claude-style array that opencode rejects
    expect(perm.edit).toBe("allow");
    expect(perm.task).toBe("allow");
    expect(typeof perm.bash).toBe("object");
    expect(perm.bash["git push --force*"]).toBe("deny");
    expect(perm.bash["git push --force-with-lease*"]).toBe("allow");
    expect(perm.bash["rm -rf /*"]).toBe("deny");
    expect(perm.bash["chmod -R 777 /*"]).toBe("deny");
    expect(perm.bash["sudo *"]).toBe("ask");
    expect(perm.bash["curl *"]).toBe("ask");
    expect(perm.bash["wget *"]).toBe("ask");
    // Stack hosts (vercel/supabase/…) are NOT shipped — only tooling defaults +
    // consumer `.agents/context.md` allowed-domains (after bkit:end).
    expect(perm.bash["curl *vercel.com*"]).toBeUndefined();
    expect(perm.bash["curl *github.com*"]).toBe("allow");
    const curlAskIdx = Object.keys(perm.bash).indexOf("curl *");
    const curlGhIdx = Object.keys(perm.bash).indexOf("curl *github.com*");
    expect(curlGhIdx).toBeGreaterThan(curlAskIdx);
    expect(perm.websearch).toBe("allow");
    // webfetch is a URL-keyed map (opencode matches the resource against the requested
    // URL); the template seeds `{ "*": "ask" }` and the resolved allowlist is layered on
    // top (last-match-wins) — see injectOpencodeDerivedAllows.
    expect(perm.webfetch["*"]).toBe("ask");
    // Destructive-git + delete commands gated to parity with the Claude host
    // (.claude/settings.json ask-list); opencode is never weaker than the Claude peer.
    for (const cmd of [
      "git reset --hard*",
      "git clean -fd*",
      "git filter-branch*",
      "git checkout -- .*",
      "git restore .*",
      "git stash drop*",
      "git rebase -i*",
      "gh repo delete*",
      "gh pr close*",
      "gh release delete*",
    ]) {
      expect(perm.bash[cmd], `${cmd} must be gated 'ask'`).toBe("ask");
    }
    // last-match-wins: the --force-with-lease allow MUST come after the --force deny,
    // else force-with-lease (which matches "git push --force*") would be denied.
    const keys = Object.keys(perm.bash);
    expect(keys.indexOf("git push --force-with-lease*")).toBeGreaterThan(
      keys.indexOf("git push --force*"),
    );
  });

  // The other direction: the Claude side is never weaker than opencode.
  //
  // curl / wget are the documented exemption — see the KNOWN DIVERGENCE block in
  // install/modules/index.integration.test.ts. opencode gates them as `curl *: ask` and
  // layers `curl *{domain}*: allow` per allowlisted host (last-match-wins); Cursor parses
  // the URL host in bkit-guardrails.cjs; Claude runs them under `Bash(*)`.
  //
  // All three hosts run an allowlisted-host fetch unprompted. They differ only on an
  // UNDECLARED host, where Cursor and opencode ask and Claude does not.
  it("claude settings gate every bash class opencode gates (reverse-direction parity)", () => {
    const claudeSettings = JSON.parse(fs.readFileSync(CLAUDE_SETTINGS_TEMPLATE, "utf-8"));
    const gated = new Set<string>([
      ...claudeSettings.permissions.ask,
      ...claudeSettings.permissions.deny,
    ]);
    // opencode `"<cmd> *": "ask"|"deny"` ↔ claude `Bash(<cmd>:*)` / `Bash(<cmd> *)`.
    for (const cmd of [
      "sudo",
      "git reset --hard",
      "git clean -fd",
      "git filter-branch",
      "git checkout -- .",
      "git restore .",
      "git stash drop",
      "git rebase -i",
      "gh repo delete",
      "gh pr close",
      "gh release delete",
    ]) {
      const gatedHere = [...gated].some((p) => p.startsWith(`Bash(${cmd}`));
      expect(gatedHere, `Bash(${cmd}...) must be gated on the Claude host too`).toBe(true);
    }
    // The exemption is exactly two rules wide.
    for (const cmd of ["curl", "wget"]) {
      const gatedHere = [...gated].some((p) => p.startsWith(`Bash(${cmd}`));
      expect(gatedHere, `Bash(${cmd}...) is the documented exemption — should NOT be gated`).toBe(
        false,
      );
    }
  });

  it("injects consumer allowed-domains into both fetch surfaces (shell + fetch tool)", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-net-"));
    fs.mkdirSync(path.join(tmp, ".agents"), { recursive: true });
    fs.writeFileSync(
      path.join(tmp, ".agents", "context.md"),
      "<!-- bkit:end -->\n<!-- allowed-domains:start -->\nvercel.com\nsupabase.com\n<!-- allowed-domains:end -->\n",
      "utf-8",
    );
    const parsed = JSON.parse(renderOpencodeJson(TEMPLATE, "github", "openrouter", tmp));
    // Shell fetch.
    expect(parsed.permission.bash["curl *vercel.com*"]).toBe("allow");
    expect(parsed.permission.bash["wget *supabase.com*"]).toBe("allow");
    // Fetch tool — the same bases must reach the webfetch URL map, or a host on the
    // allowlist still prompts when the agent uses the fetch tool instead of a shell.
    expect(parsed.permission.webfetch["*vercel.com*"]).toBe("allow");
    expect(parsed.permission.webfetch["*supabase.com*"]).toBe("allow");
    // Last-match-wins: the catch-all ask must precede the derived allows.
    const wfKeys = Object.keys(parsed.permission.webfetch);
    expect(wfKeys.indexOf("*vercel.com*")).toBeGreaterThan(wfKeys.indexOf("*"));
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it("ollama: npm driver, cloud baseURL, apiKey via {env:BKIT_OLLAMA_API_KEY}", () => {
    const parsed = JSON.parse(renderOpencodeJson(TEMPLATE, "github", "ollama"));
    const block = parsed.provider?.["ollama"];
    expect(block).toBeTruthy();
    expect(block.api).toBeUndefined();
    expect(block.npm).toBe("@ai-sdk/openai-compatible");
    expect(block.options.baseURL).toBe("https://ollama.com/v1");
    expect(block.options.apiKey).toBe("{env:BKIT_OLLAMA_API_KEY}");
  });

  it("opencode-zen / opencode-go: built-in providers (apiKey only — no npm/baseURL)", () => {
    // OpenCode resolves Zen/Go from models.dev (per-model openai-compatible vs anthropic).
    // Seeding npm+baseURL forces every model through /chat/completions and breaks Qwen/MiniMax
    // (Anthropic /messages) → wrong-URL errors. Built-in shape: options.apiKey only.
    const cases = [
      ["opencode-zen", "opencode"],
      ["opencode-go", "opencode-go"],
    ] as const;
    for (const [cliKey, blockKey] of cases) {
      const parsed = JSON.parse(renderOpencodeJson(TEMPLATE, "github", cliKey));
      const block = parsed.provider?.[blockKey];
      expect(block, `${cliKey} → provider.${blockKey}`).toBeDefined();
      expect(block.api).toBeUndefined();
      expect(block.npm).toBeUndefined();
      expect(block.name).toBeUndefined();
      expect(block.options?.baseURL).toBeUndefined();
      expect(block.options?.apiKey).toBe("{env:BKIT_OPENCODE_API_KEY}");
      expect(Object.keys(block)).toEqual(["options"]);
      expect(parsed.plugin).toContain("./plugin/bkit-gateguard.js");
      expect(JSON.stringify(parsed)).not.toContain("@@OPENCODE");
    }
    // Zen CLI key must NOT invent a custom `opencode-zen` block — models.dev id is `opencode`.
    const zen = JSON.parse(renderOpencodeJson(TEMPLATE, "github", "opencode-zen"));
    expect(zen.provider?.["opencode-zen"]).toBeUndefined();
    expect(zen.provider?.opencode).toBeDefined();
  });
});

describe("reconcileOpencodeJson — preserves existing provider order", () => {
  const DST = path.join(".opencode", "opencode.json");

  function seed(providers: Record<string, unknown>): void {
    fs.mkdirSync(".opencode", { recursive: true });
    fs.writeFileSync(
      DST,
      JSON.stringify({ plugin: ["./plugin/bkit-gateguard.js"], provider: providers }, null, 2) +
        "\n",
      "utf-8",
    );
  }
  function providerOrder(): string[] {
    const parsed = JSON.parse(fs.readFileSync(DST, "utf-8")) as {
      provider: Record<string, unknown>;
    };
    return Object.keys(parsed.provider);
  }

  it("reconciling a LATER provider's block keeps the existing key order (upgrade path)", () => {
    seed({
      "opencode-go": { options: { apiKey: "{env:BKIT_OPENCODE_API_KEY}" } },
      openrouter: { npm: "@ai-sdk/openai-compatible", name: "OpenRouter", options: {} },
    });
    // The "additional provider" reconcile on upgrade seeds ONLY openrouter.
    const openrouterTemplate = JSON.stringify({
      provider: {
        openrouter: {
          npm: "@ai-sdk/openai-compatible",
          name: "OpenRouter",
          options: {
            baseURL: "https://integrate.api.openrouter.com/v1",
            apiKey: "{env:BKIT_OPENROUTER_API_KEY}",
          },
        },
      },
    });
    reconcileOpencodeJson(openrouterTemplate, DST, false, makeWriteSet());
    expect(providerOrder()).toEqual(["opencode-go", "openrouter"]);
  });

  it("appends a genuinely-new template provider AFTER the existing ones", () => {
    seed({ "opencode-go": { options: {} } });
    const ollamaTemplate = JSON.stringify({
      provider: { openrouter: { npm: "@ai-sdk/openai-compatible", name: "Ollama", options: {} } },
    });
    reconcileOpencodeJson(ollamaTemplate, DST, false, makeWriteSet());
    expect(providerOrder()).toEqual(["opencode-go", "openrouter"]);
  });
});

describe("reconcileOpencodeJson — tracker mcp entry keeps consumer extras (#613)", () => {
  const DST = path.join(".opencode", "opencode.json");
  const TEMPLATE = path.resolve(".bkit/shared/.opencode/opencode.json");
  const rendered = (): string => renderOpencodeJson(TEMPLATE, "github", "opencode-go");
  const templateGithub = (): { headers: Record<string, string> } & Record<string, unknown> =>
    JSON.parse(rendered()).mcp.github;
  const readGithub = (): { url: string; headers: Record<string, string> } =>
    JSON.parse(fs.readFileSync(DST, "utf-8")).mcp.github;

  it("an extra toolset is in sync → no write", () => {
    reconcileOpencodeJson(rendered(), DST, false, makeWriteSet());
    const doc = JSON.parse(fs.readFileSync(DST, "utf-8"));
    const sets = doc.mcp.github.headers["X-MCP-Toolsets"];
    doc.mcp.github.headers["X-MCP-Toolsets"] = `${sets},gists`;
    fs.writeFileSync(DST, JSON.stringify(doc, null, 2) + "\n", "utf-8");
    const ws = makeWriteSet();
    reconcileOpencodeJson(rendered(), DST, false, ws);
    expect(ws.writes).toEqual([]);
    expect(readGithub().headers["X-MCP-Toolsets"]).toBe(`${sets},gists`);
  });

  it("a missing template toolset is appended; an edited url is reset", () => {
    const tmpl = templateGithub();
    fs.mkdirSync(".opencode", { recursive: true });
    fs.writeFileSync(
      DST,
      JSON.stringify({
        mcp: {
          github: {
            ...tmpl,
            url: "https://edited",
            headers: { ...tmpl.headers, "X-MCP-Toolsets": "gists,issues" },
          },
        },
      }),
      "utf-8",
    );
    const ws = makeWriteSet();
    reconcileOpencodeJson(rendered(), DST, false, ws);
    const gh = readGithub();
    const rest = tmpl.headers["X-MCP-Toolsets"]!.split(",").filter((t) => t !== "issues");
    expect(gh.url).toBe(tmpl.url);
    expect(gh.headers["X-MCP-Toolsets"]).toBe(["gists", "issues", ...rest].join(","));
    expect(ws.writes).toEqual([{ path: DST, action: "update" }]);
  });
});
