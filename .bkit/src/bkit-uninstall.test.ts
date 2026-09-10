// bkit-uninstall.test.ts — P2.T3, P2.T5, P2.T7, P2.T8 — uninstall unit tests.
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  buildDecisionTable,
  formatDecisionTable,
  runUninstall,
  type UninstallContext,
  type FileSummary,
} from "./bkit-uninstall";
import { serializeBkitVersion, sha256, type BkitVersion } from "./bkit-version";
import { getTemplatesRoot } from "./bkit-paths";

let tmpDir: string;

function makeCtx(overrides: Partial<UninstallContext> = {}): UninstallContext {
  return {
    cwd: tmpDir,
    dryRun: false,
    force: false,
    nuke: false,
    yes: false,
    stripPackage: false,
    logPrefix: "[bkit-uninstall-test]",
    ...overrides,
  };
}

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-uninstall-test-"));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function writeFile(relPath: string, content: string): void {
  const absPath = path.join(tmpDir, relPath);
  fs.mkdirSync(path.dirname(absPath), { recursive: true });
  fs.writeFileSync(absPath, content, "utf-8");
}

function fileExists(relPath: string): boolean {
  return fs.existsSync(path.join(tmpDir, relPath));
}

function readFile(relPath: string): string {
  return fs.readFileSync(path.join(tmpDir, relPath), "utf-8");
}

function writeBkitVersionFile(v: BkitVersion): void {
  const versionFilePath = path.join(tmpDir, ".bkit", "version");
  fs.mkdirSync(path.dirname(versionFilePath), { recursive: true });
  fs.writeFileSync(versionFilePath, serializeBkitVersion(v), "utf-8");
}

// ---------------------------------------------------------------------------
// buildDecisionTable — json-format files (formerly Tier-1)
// ---------------------------------------------------------------------------

describe("buildDecisionTable — json format", () => {
  it("json file present → decision=strip-block (scope strip)", () => {
    writeFile(".claude/settings.json", '{"hooks":{}}');
    const table = buildDecisionTable(["claude"], makeCtx());
    const entry = table.find((r) => r.file === ".claude/settings.json");
    expect(entry).toBeDefined();
    expect(entry!.decision).toBe("strip-block");
    expect(entry!.format).toBe("json");
  });

  it("json file absent → decision=skip-absent", () => {
    const table = buildDecisionTable(["claude"], makeCtx());
    const entry = table.find((r) => r.file === ".claude/settings.json");
    expect(entry).toBeDefined();
    expect(entry!.decision).toBe("skip-absent");
  });
});

// ---------------------------------------------------------------------------
// buildDecisionTable — markered-text files (formerly Tier-2)
// ---------------------------------------------------------------------------

describe("buildDecisionTable — markered-text format", () => {
  it("markered-text file with html-comment markers → decision=strip-block", () => {
    writeFile(
      "AGENTS.md",
      "# Consumer content\n\n<!-- bkit:start -->\nbkit block\n<!-- bkit:end -->\n",
    );
    const table = buildDecisionTable(["core"], makeCtx());
    const entry = table.find((r) => r.file === "AGENTS.md");
    expect(entry).toBeDefined();
    expect(entry!.decision).toBe("strip-block");
    expect(entry!.format).toBe("markered-text");
  });

  it("markered-text file with hash-comment markers → decision=strip-block (use a Group A file, since .husky/* moved to byte-equal-text in v2.0.4)", () => {
    writeFile(".gitignore", "node_modules/\n# bkit:start\n.worktrees/\n# bkit:end\n");
    const table = buildDecisionTable(["core"], makeCtx());
    const entry = table.find((r) => r.file === ".gitignore");
    expect(entry).toBeDefined();
    expect(entry!.decision).toBe("strip-block");
  });

  it("markered-text file with no bkit markers → decision=preserve (100% consumer content)", () => {
    writeFile("AGENTS.md", "# Purely consumer content\n");
    const table = buildDecisionTable(["core"], makeCtx());
    const entry = table.find((r) => r.file === "AGENTS.md");
    expect(entry).toBeDefined();
    expect(entry!.decision).toBe("preserve");
  });

  it("markered-text file with comment-prefixed html markers (# <!-- bkit:start -->) → decision=strip-block", () => {
    // Regression: detectMarkerStyle required a bare `<!-- bkit:start -->` line and
    // missed the `# `-prefixed form used by shell hooks (preflight.sh), so the whole
    // file was preserved on uninstall instead of having its block stripped (leak).
    writeFile(
      ".claude/hooks/preflight.sh",
      "#!/usr/bin/env bash\n# header\n\n# <!-- bkit:start -->\nbkit hook body\n# <!-- bkit:end -->\n",
    );
    const table = buildDecisionTable(["claude"], makeCtx());
    const entry = table.find((r) => r.file === ".claude/hooks/preflight.sh");
    expect(entry).toBeDefined();
    expect(entry!.format).toBe("markered-text");
    expect(entry!.decision).toBe("strip-block");
  });

  it("markered-text file with slash-comment-prefixed html markers (// <!-- bkit:start -->) → classified html-comment, NOT slash-comment", () => {
    // The html-comment check must run FIRST: a `// <!-- bkit:start -->` line (JS/TS
    // file carrying an HTML marker) must not be misread as the bare `// bkit:start`
    // slash-comment style, or the block never resolves and the file is preserved
    // untouched instead of having its block stripped.
    writeFile(
      ".claude/hooks/gateguard.cjs",
      "#!/usr/bin/env node\n// header\n\n// <!-- bkit:start -->\nbkit hook body\n// <!-- bkit:end -->\nconst driver = true;\n",
    );
    const table = buildDecisionTable(["claude"], makeCtx());
    const entry = table.find((r) => r.file === ".claude/hooks/gateguard.cjs");
    expect(entry).toBeDefined();
    expect(entry!.format).toBe("markered-text");
    expect(entry!.decision).toBe("strip-block");
  });

  it("markered-text file with bare slash-comment markers (// bkit:start) → decision=strip-block", () => {
    writeFile(
      ".opencode/plugin/gateguard.js",
      "// header\n\n// bkit:start\nbkit plugin body\n// bkit:end\nexport default function plugin() {}\n",
    );
    const table = buildDecisionTable(["opencode"], makeCtx());
    const entry = table.find((r) => r.file === ".opencode/plugin/gateguard.js");
    expect(entry).toBeDefined();
    expect(entry!.format).toBe("markered-text");
    expect(entry!.decision).toBe("strip-block");
  });

  it("core .agents/ doctrine files get a strip-block entry (they install via the templates pass, not the manifest)", () => {
    // Regression: .agents/{config,docs,rules,skills}.md install via runCoreTemplates and were
    // in no manifest, so uninstall/--nuke could not remove them — a full uninstall orphaned
    // bkit's own doctrine. They carry a managed block, so strip-block (preserve consumer content
    // below bkit:end) is the treatment, matching AGENTS.md.
    for (const rel of [
      ".agents/context.md",
      ".agents/docs.md",
      ".agents/rules.md",
      ".agents/skills.md",
    ]) {
      writeFile(rel, "<!-- bkit:start -->\nbkit doctrine\n<!-- bkit:end -->\n# consumer note\n");
    }
    const table = buildDecisionTable(["core"], makeCtx());
    for (const rel of [
      ".agents/context.md",
      ".agents/docs.md",
      ".agents/rules.md",
      ".agents/skills.md",
    ]) {
      const entry = table.find((r) => r.file === rel);
      expect(entry, `${rel} should be in the decision table under core`).toBeDefined();
      expect(entry!.decision).toBe("strip-block");
      expect(entry!.format).toBe("markered-text");
    }
  });

  it("core .agents/ doctrine files are NOT swept by a targeted (non-core) uninstall", () => {
    // Core-gated: a `uninstall --claude` (no core) must leave the .agents/ doctrine untouched,
    // symmetric with how the core templates pass installs them.
    writeFile(".agents/rules.md", "<!-- bkit:start -->\nbkit doctrine\n<!-- bkit:end -->\n");
    const table = buildDecisionTable(["claude"], makeCtx());
    expect(table.find((r) => r.file === ".agents/rules.md")).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// buildDecisionTable — byte-equal-text files (formerly Tier-3)
// ---------------------------------------------------------------------------

describe("buildDecisionTable — byte-equal-text hash guard", () => {
  it("byte-equal-text file: unknown hash (no tier3Hashes entry) → skip-tier3-unknown", () => {
    writeFile(".cursor/environment.json", '{"build":{"dockerfile":"Dockerfile"}}\n');
    // No .bkit-version file → no hash recorded
    const table = buildDecisionTable(["cloud"], makeCtx());
    const entry = table.find((r) => r.file === ".cursor/environment.json");
    expect(entry).toBeDefined();
    expect(entry!.decision).toBe("skip-tier3-unknown");
  });

  it("byte-equal-text file: hash matches → decision=delete", () => {
    const content = '{"build":{"dockerfile":"Dockerfile"},"install":"pnpm install"}\n';
    writeFile(".cursor/environment.json", content);
    writeBkitVersionFile({
      pinnedVersion: "0.7.0",
      tier3Hashes: { ".cursor/environment.json": sha256(content) },
    });
    const table = buildDecisionTable(["cloud"], makeCtx());
    const entry = table.find((r) => r.file === ".cursor/environment.json");
    expect(entry).toBeDefined();
    expect(entry!.decision).toBe("delete");
  });

  it("byte-equal-text file: hash mismatch (consumer modified) → skip-tier3-modified", () => {
    const originalContent = '{"install":"pnpm install"}\n';
    const modifiedContent = '{"install":"pnpm install && pnpm build"}\n';
    writeFile(".cursor/environment.json", modifiedContent);
    writeBkitVersionFile({
      pinnedVersion: "0.7.0",
      tier3Hashes: { ".cursor/environment.json": sha256(originalContent) },
    });
    const table = buildDecisionTable(["cloud"], makeCtx());
    const entry = table.find((r) => r.file === ".cursor/environment.json");
    expect(entry).toBeDefined();
    expect(entry!.decision).toBe("skip-tier3-modified");
  });

  it("byte-equal-text with --force → decision=delete regardless of hash", () => {
    const originalContent = '{"install":"pnpm install"}\n';
    writeFile(".cursor/environment.json", '{"install":"consumer modified"}\n');
    writeBkitVersionFile({
      pinnedVersion: "0.7.0",
      tier3Hashes: { ".cursor/environment.json": sha256(originalContent) },
    });
    const table = buildDecisionTable(["cloud"], makeCtx({ force: true }));
    const entry = table.find((r) => r.file === ".cursor/environment.json");
    expect(entry).toBeDefined();
    expect(entry!.decision).toBe("delete");
    expect(entry!.reason).toContain("--force");
  });

  it("retro-fit: v0.6.x .bkit-version (plain text, no tier3Hashes) → skip-tier3-unknown", () => {
    writeFile(".cursor/environment.json", '{"install":"pnpm install"}\n');
    // Simulate v0.6.x plain-text .bkit-version
    const versionFilePath = path.join(tmpDir, ".bkit", "version");
    fs.mkdirSync(path.dirname(versionFilePath), { recursive: true });
    fs.writeFileSync(versionFilePath, "0.6.0\n", "utf-8");

    const table = buildDecisionTable(["cloud"], makeCtx());
    const entry = table.find((r) => r.file === ".cursor/environment.json");
    expect(entry).toBeDefined();
    expect(entry!.decision).toBe("skip-tier3-unknown");
  });
});

// ---------------------------------------------------------------------------
// buildDecisionTable — nuke mode
// ---------------------------------------------------------------------------

describe("buildDecisionTable — nuke mode", () => {
  it("--nuke makes all present files decision=delete", () => {
    writeFile(".claude/settings.json", '{"hooks":{}}');
    writeFile("AGENTS.md", "# Consumer\n\n<!-- bkit:start -->\nbkit\n<!-- bkit:end -->\n");
    writeFile(".cursor/Dockerfile", "consumer modified\n");
    writeBkitVersionFile({
      pinnedVersion: "0.7.0",
      tier3Hashes: { ".cursor/Dockerfile": sha256("different content\n") },
    });

    const table = buildDecisionTable(
      ["core", "claude", "cursor", "cloud"],
      makeCtx({ nuke: true }),
    );
    const decisions = table.filter((r) => r.decision !== "skip-absent").map((r) => r.decision);
    expect(decisions.every((d) => d === "delete")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// formatDecisionTable — dry-run output
// ---------------------------------------------------------------------------

describe("formatDecisionTable — P2.T7", () => {
  it("formats a non-empty table with FILE / DECISION / REASON header", () => {
    const table: FileSummary[] = [
      {
        file: "AGENTS.md",
        decision: "strip-block",
        reason: "markered-text managed",
        format: "markered-text",
      },
      {
        file: ".claude/settings.json",
        decision: "strip-block",
        reason: "json scope strip",
        format: "json",
      },
    ];
    const output = formatDecisionTable(table);
    expect(output).toContain("FILE");
    expect(output).toContain("DECISION");
    expect(output).toContain("REASON");
    expect(output).toContain("AGENTS.md");
    expect(output).toContain("strip-block");
    expect(output).toContain(".claude/settings.json");
  });

  it("returns informational message for empty table", () => {
    const output = formatDecisionTable([]);
    expect(output).toContain("No files to process");
  });

  it("dry-run snapshot: decision table is printed, nothing deleted", async () => {
    writeFile(".claude/settings.json", '{"hooks":{}}');
    writeFile("AGENTS.md", "# Consumer\n\n<!-- bkit:start -->\nbkit\n<!-- bkit:end -->\n");

    const ctx = makeCtx({ dryRun: true });
    const result = await runUninstall(["claude", "core"], ctx);

    expect(result.dryRun).toBe(true);
    expect(result.decisions.length).toBeGreaterThan(0);
    // Dry-run: nothing actually deleted from disk
    expect(fileExists(".claude/settings.json")).toBe(true);
    expect(fileExists("AGENTS.md")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// runUninstall — round-trip (P2.T5)
// ---------------------------------------------------------------------------

describe("runUninstall — round-trip", () => {
  it("strips bkit block from markered-text file, preserving consumer content", async () => {
    const consumer = "# Consumer heading\n\nConsumer rules.\n";
    const bkitBlock = "\n<!-- bkit:start -->\nbkit content\n<!-- bkit:end -->\n";
    writeFile("AGENTS.md", consumer + bkitBlock);

    await runUninstall(["core"], makeCtx());

    expect(fileExists("AGENTS.md")).toBe(true);
    const result = readFile("AGENTS.md");
    expect(result).toContain("Consumer heading");
    expect(result).toContain("Consumer rules.");
    expect(result).not.toContain("bkit content");
    expect(result).not.toContain("<!-- bkit:start -->");
  });

  it("deletes markered-text file when stripping leaves only whitespace", async () => {
    writeFile("AGENTS.md", "<!-- bkit:start -->\nbkit content\n<!-- bkit:end -->\n");
    await runUninstall(["core"], makeCtx());
    expect(fileExists("AGENTS.md")).toBe(false);
  });

  it("preserves markered-text file when no bkit markers present (100% consumer)", async () => {
    const consumerContent = "# Pure consumer content\n";
    writeFile("AGENTS.md", consumerContent);
    await runUninstall(["core"], makeCtx());
    expect(fileExists("AGENTS.md")).toBe(true);
    expect(readFile("AGENTS.md")).toBe(consumerContent);
  });

  it("preserves byte-equal-text file when hash unknown (no tier3Hashes)", async () => {
    writeFile(".cursor/environment.json", '{"install":"pnpm install"}\n');
    await runUninstall(["cloud"], makeCtx());
    expect(fileExists(".cursor/environment.json")).toBe(true);
  });

  it("deletes byte-equal-text file when hash matches install-time hash", async () => {
    const content = '{"install":"pnpm install"}\n';
    writeFile(".cursor/environment.json", content);
    writeBkitVersionFile({
      pinnedVersion: "0.7.0",
      tier3Hashes: { ".cursor/environment.json": sha256(content) },
    });
    await runUninstall(["cloud"], makeCtx());
    expect(fileExists(".cursor/environment.json")).toBe(false);
  });

  it("preserves byte-equal-text file when hash mismatches (consumer modified)", async () => {
    writeFile(".cursor/environment.json", '{"install":"consumer modified"}\n');
    writeBkitVersionFile({
      pinnedVersion: "0.7.0",
      tier3Hashes: { ".cursor/environment.json": sha256('{"install":"original"}\n') },
    });
    await runUninstall(["cloud"], makeCtx());
    expect(fileExists(".cursor/environment.json")).toBe(true);
    expect(readFile(".cursor/environment.json")).toBe('{"install":"consumer modified"}\n');
  });
});

// ---------------------------------------------------------------------------
// runUninstall — 100%-bkit residual delete + opencode scope render (4.6.2)
// ---------------------------------------------------------------------------

describe("runUninstall — 100%-bkit residual + opencode scope (4.6.2)", () => {
  const templatesRoot = getTemplatesRoot();
  // Exact rendered opencode.json a `--opencode=opencode-go --tracker=github` install writes.
  const RENDERED_OPENCODE =
    JSON.stringify(
      {
        mcp: {
          github: {
            type: "remote",
            url: "https://api.githubcopilot.com/mcp/",
            headers: {
              Authorization: "Bearer {env:GH_BKIT_TOKEN}",
              "X-MCP-Toolsets": "context,issues,pull_requests,repos,users,projects",
            },
          },
        },
        provider: {
          "opencode-go": {
            options: {
              apiKey: "{env:OPENCODE_API_KEY}",
            },
          },
        },
      },
      null,
      2,
    ) + "\n";

  it("deletes a 100%-bkit markered-text file (residual == shipped scaffold, not a dead husk)", () => {
    // .claude/hooks/preflight.sh is a shebang + bkit header wrapping a managed block — 100% bkit.
    // A pristine install strips to a residual identical to the template scaffold → delete.
    const rel = ".claude/hooks/preflight.sh";
    writeFile(rel, fs.readFileSync(path.join(templatesRoot, rel), "utf-8"));
    return runUninstall(["claude"], makeCtx()).then(() => {
      expect(fileExists(rel)).toBe(false);
    });
  });

  it("preserves a markered-text file when the consumer added content outside the block", () => {
    const rel = ".claude/hooks/preflight.sh";
    writeFile(
      rel,
      fs.readFileSync(path.join(templatesRoot, rel), "utf-8") + "\n# my custom check\n",
    );
    return runUninstall(["claude"], makeCtx()).then(() => {
      expect(fileExists(rel)).toBe(true);
      expect(readFile(rel)).toContain("my custom check");
    });
  });

  it("deletes opencode.json on full uninstall (renders @@sentinel@@ keys before strip-scope)", () => {
    const rel = ".opencode/opencode.json";
    writeFile(rel, RENDERED_OPENCODE);
    return runUninstall(["opencode"], makeCtx()).then(() => {
      expect(fileExists(rel)).toBe(false);
    });
  });

  it("preserves opencode.json when the consumer added their own key", () => {
    const rel = ".opencode/opencode.json";
    const withConsumerKey = JSON.parse(RENDERED_OPENCODE) as Record<string, unknown>;
    withConsumerKey.theme = "consumer-custom";
    writeFile(rel, JSON.stringify(withConsumerKey, null, 2) + "\n");
    return runUninstall(["opencode"], makeCtx()).then(() => {
      expect(fileExists(rel)).toBe(true);
      expect(readFile(rel)).toContain("consumer-custom");
    });
  });
});

// ---------------------------------------------------------------------------
// runUninstall — .bkit/version is bkit install-state, removed on full/core uninstall (4.6.3)
// ---------------------------------------------------------------------------

describe("runUninstall — .bkit/version install-state (4.6.3)", () => {
  it("deletes .bkit/version on a full/core uninstall (bkit install-state, zero-footprint)", () => {
    // .bkit/version records no hash for itself, so the generic byte-equal hash-guard used to
    // preserve it as "consumer-modified" — leaving bkit state behind after a full teardown.
    writeBkitVersionFile({ pinnedVersion: "1.0.0", tier3Hashes: {} });
    return runUninstall(["core"], makeCtx()).then(() => {
      expect(fileExists(".bkit/version")).toBe(false);
    });
  });

  it("keeps .bkit/version on a targeted (non-core) uninstall", () => {
    // It is `module: core`, so a `--claude`-only uninstall never sees it and bkit keeps working.
    writeBkitVersionFile({ pinnedVersion: "1.0.0", tier3Hashes: {} });
    return runUninstall(["claude"], makeCtx()).then(() => {
      expect(fileExists(".bkit/version")).toBe(true);
    });
  });

  it("strips package.json bkit install-state block on full/core uninstall", async () => {
    const pkgPath = path.join(tmpDir, "package.json");
    fs.writeFileSync(
      pkgPath,
      JSON.stringify(
        {
          name: "consumer",
          bkit: {
            issueTracker: "github",
            opencodeProvider: "opencode-zen",
            opencodeProviders: ["opencode-zen"],
            depUpdater: "renovate",
          },
        },
        null,
        2,
      ) + "\n",
      "utf-8",
    );
    await runUninstall(["core"], makeCtx());
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8")) as Record<string, unknown>;
    expect(pkg.bkit).toBeUndefined();
  });

  it("keeps package.json bkit block on targeted (non-core) uninstall", async () => {
    const pkgPath = path.join(tmpDir, "package.json");
    fs.writeFileSync(
      pkgPath,
      JSON.stringify({ name: "consumer", bkit: { issueTracker: "github" } }, null, 2) + "\n",
      "utf-8",
    );
    await runUninstall(["claude"], makeCtx());
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8")) as {
      bkit?: { issueTracker?: string };
    };
    expect(pkg.bkit?.issueTracker).toBe("github");
  });
});

// ---------------------------------------------------------------------------
// runUninstall — idempotency (P2.T8)
// ---------------------------------------------------------------------------

describe("runUninstall — idempotency", () => {
  it("running uninstall twice produces same result (no errors on second run)", async () => {
    writeFile(".claude/settings.json", '{"hooks":{}}');

    await runUninstall(["claude"], makeCtx());
    // After first run: json scope strip — if all keys are bkit-owned the file may be deleted
    // or stripped. Either way second run should not throw.
    const result2 = await runUninstall(["claude"], makeCtx());
    expect(result2.decisions.length).toBeGreaterThan(0);
  });

  it("strip-block is idempotent: running on already-stripped file no-ops", async () => {
    // File with ONLY consumer content (no bkit markers)
    const consumerContent = "# Consumer heading\n";
    writeFile("AGENTS.md", consumerContent);

    const result1 = await runUninstall(["core"], makeCtx());
    expect(result1.preserved).toContain("AGENTS.md");
    expect(readFile("AGENTS.md")).toBe(consumerContent);

    const result2 = await runUninstall(["core"], makeCtx());
    expect(result2.preserved).toContain("AGENTS.md");
    expect(readFile("AGENTS.md")).toBe(consumerContent);
  });
});

// ---------------------------------------------------------------------------
// runUninstall — --nuke with --yes (P2.T8)
// ---------------------------------------------------------------------------

describe("runUninstall — nuke", () => {
  it("--nuke --yes deletes all present files without interactive prompt", async () => {
    writeFile(".claude/settings.json", '{"hooks":{}}');
    writeFile("AGENTS.md", "# Consumer\n\n<!-- bkit:start -->\nbkit\n<!-- bkit:end -->\n");
    writeFile(".cursor/Dockerfile", "consumer modified\n");
    writeBkitVersionFile({
      pinnedVersion: "0.7.0",
      tier3Hashes: { ".cursor/Dockerfile": sha256("different\n") },
    });

    const result = await runUninstall(
      ["core", "claude", "cursor", "cloud"],
      makeCtx({ nuke: true, yes: true }),
    );

    // All present files should be deleted
    const deletes = result.deleted;
    expect(deletes.some((f) => f.includes("settings.json"))).toBe(true);
    expect(fileExists(".claude/settings.json")).toBe(false);
    expect(fileExists(".cursor/Dockerfile")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// stripTier2JsonScope — pure JSON uninstall helper (BAR-167 Phase 1)
// ---------------------------------------------------------------------------

import { stripTier2JsonScope } from "./bkit-uninstall";
import type { JsonValue } from "./bkit-tiers";

describe("stripTier2JsonScope", () => {
  it("leaf-deletion: removes template-owned leaf when equal to template", () => {
    const template: Record<string, JsonValue> = {
      hooks: { SessionStart: [{ command: "bash preflight.sh" }] },
    };
    const consumer: Record<string, JsonValue> = {
      hooks: { SessionStart: [{ command: "bash preflight.sh" }] },
    };
    const result = stripTier2JsonScope(consumer, template);
    // hooks.SessionStart removed (equal to template); hooks is empty intermediate → pruned
    expect(result.hooks).toBeUndefined();
  });

  it("consumer-only sibling preservation: consumer-only keys untouched", () => {
    const template: Record<string, JsonValue> = {
      hooks: { SessionStart: [{ command: "bash preflight.sh" }] },
    };
    const consumer: Record<string, JsonValue> = {
      hooks: {
        SessionStart: [{ command: "bash preflight.sh" }],
        Stop: [{ command: "echo consumer" }],
      },
      customKey: "keep-me",
    };
    const result = stripTier2JsonScope(consumer, template);
    // SessionStart removed (template-equal); Stop preserved (consumer-only sibling)
    expect((result.hooks as Record<string, JsonValue>).Stop).toBeDefined();
    // customKey preserved (consumer-only top-level)
    expect(result.customKey).toBe("keep-me");
    // SessionStart gone
    expect((result.hooks as Record<string, JsonValue>).SessionStart).toBeUndefined();
  });

  it("empty-intermediate pruning: prunes empty intermediate only where template populated it", () => {
    const template: Record<string, JsonValue> = {
      a: { b: { c: 1 } },
    };
    const consumer: Record<string, JsonValue> = {
      a: { b: { c: 1 } }, // exactly matches template
      other: "x",
    };
    const result = stripTier2JsonScope(consumer, template);
    // a.b.c removed; a.b empty → pruned; a empty → pruned
    expect(result.a).toBeUndefined();
    // other preserved
    expect(result.other).toBe("x");
  });

  it("array stripping is element-wise: template members go, consumer members stay", () => {
    const template: Record<string, JsonValue> = {
      permissions: { allow: ["Skill(*)"] },
    };
    const consumer: Record<string, JsonValue> = {
      permissions: { allow: ["Skill(*)", "Bash(*)"] }, // consumer extended the allow list
    };
    const result = stripTier2JsonScope(consumer, template);
    // Template member removed, consumer-added member kept — NOT whole-array preserve.
    expect((result.permissions as Record<string, JsonValue>).allow).toEqual(["Bash(*)"]);
  });

  it("array key is dropped when every member came from the template", () => {
    const template: Record<string, JsonValue> = {
      permissions: { deny: ["Bash(rm -rf /*)"] },
    };
    const consumer: Record<string, JsonValue> = {
      permissions: { deny: ["Bash(rm -rf /*)"] },
    };
    const result = stripTier2JsonScope(consumer, template);
    // deny fully template-owned → key removed, empty `permissions` pruned
    expect(result.permissions).toBeUndefined();
  });

  it("install-enriched allow list does not survive while deny/ask are stripped", () => {
    // Regression: install appends apex-domain WebFetch entries to `permissions.allow`
    // after rendering the template, so that array never equalled the template and the
    // old whole-array compare preserved it — while `deny`/`ask` (not enriched, so
    // byte-equal) were stripped. Uninstall then left the repo MORE permissive than it
    // found it. All three must strip together.
    const template: Record<string, JsonValue> = {
      permissions: {
        allow: ["Skill(*)", "Bash(*)", "WebFetch(domain:github.com)"],
        deny: ["Bash(git push --force)"],
        ask: ["Read(./.env)"],
      },
    };
    const consumer: Record<string, JsonValue> = {
      permissions: {
        // as written to disk by install: template members + enrichment
        allow: [
          "Skill(*)",
          "Bash(*)",
          "WebFetch(domain:github.com)",
          "WebFetch(domain:*.acme.dev)",
        ],
        deny: ["Bash(git push --force)"],
        ask: ["Read(./.env)"],
      },
    };
    const result = stripTier2JsonScope(consumer, template);
    const perms = result.permissions as Record<string, JsonValue> | undefined;
    // Only the enrichment entry survives — never `Bash(*)` with deny/ask gone.
    expect(perms?.allow).toEqual(["WebFetch(domain:*.acme.dev)"]);
    expect(perms?.deny).toBeUndefined();
    expect(perms?.ask).toBeUndefined();
  });

  it("does not mutate consumer", () => {
    const template: Record<string, JsonValue> = { a: 1 };
    const consumer: Record<string, JsonValue> = { a: 1, b: 2 };
    const consumerCopy = JSON.parse(JSON.stringify(consumer)) as Record<string, JsonValue>;
    stripTier2JsonScope(consumer, template);
    expect(consumer).toEqual(consumerCopy);
  });
});

// ---------------------------------------------------------------------------
// runUninstall — generated .claude/cloud.md cleanup (untracked secret-bearing file)
// ---------------------------------------------------------------------------

describe("runUninstall — .claude/settings.json leaves no grants behind", () => {
  it("strips allow/deny/ask together, including install's WebFetch enrichment", async () => {
    // Regression: the stripper compared whole arrays, so `permissions.allow` — which
    // install enriches with apex-domain WebFetch grants AFTER rendering the template —
    // never matched and was kept as consumer customisation, while `deny` and `ask`
    // stripped cleanly. A full uninstall left `Bash(*)` in place with the guardrails
    // gone: strictly more permissive than before bkit was installed.
    const templateRaw = fs.readFileSync(
      path.join(getTemplatesRoot(), ".claude", "settings.json"),
      "utf-8",
    );
    const template = JSON.parse(templateRaw) as {
      permissions: { allow: string[]; deny: string[]; ask: string[] };
    };
    // Simulate what install actually writes: the template plus enrichment.
    const onDisk = JSON.parse(templateRaw) as typeof template;
    onDisk.permissions.allow = [
      ...onDisk.permissions.allow,
      "WebFetch(domain:github.com)",
      "WebFetch(domain:npmjs.com)",
    ];
    writeFile(".claude/settings.json", JSON.stringify(onDisk, null, 2) + "\n");

    await runUninstall(["claude"], makeCtx());

    // Everything in the file was bkit's — template plus enrichment — so nothing is
    // left to keep and the file itself goes. Asserted unconditionally: an `if (exists)`
    // guard here would pass vacuously the moment the strip regressed to leaving a husk.
    expect(fileExists(".claude/settings.json")).toBe(false);
    expect(template.permissions.allow).toContain("Bash(*)");
  });

  it("preserves a permission the consumer added themselves", async () => {
    const templateRaw = fs.readFileSync(
      path.join(getTemplatesRoot(), ".claude", "settings.json"),
      "utf-8",
    );
    const onDisk = JSON.parse(templateRaw) as {
      permissions: { allow: string[]; deny: string[]; ask: string[] };
    };
    onDisk.permissions.allow = [...onDisk.permissions.allow, "Bash(terraform apply:*)"];
    writeFile(".claude/settings.json", JSON.stringify(onDisk, null, 2) + "\n");

    await runUninstall(["claude"], makeCtx());

    expect(fileExists(".claude/settings.json")).toBe(true);
    const left = JSON.parse(readFile(".claude/settings.json")) as {
      permissions?: { allow?: string[] };
    };
    expect(left.permissions?.allow).toEqual(["Bash(terraform apply:*)"]);
  });
});

describe("runUninstall — .claude/cloud.md cleanup", () => {
  it("deletes .claude/cloud.md when the claude host is uninstalled", async () => {
    writeFile(".claude/cloud.md", "# generated cloud doc\nGH_BKIT_TOKEN=secret\n");
    const result = await runUninstall(["claude"], makeCtx());
    expect(fileExists(".claude/cloud.md")).toBe(false);
    expect(result.deleted).toContain(path.join(".claude", "cloud.md"));
  });

  it("dry-run reports the deletion but leaves the file on disk", async () => {
    writeFile(".claude/cloud.md", "GH_BKIT_TOKEN=secret\n");
    const result = await runUninstall(["claude"], makeCtx({ dryRun: true }));
    expect(fileExists(".claude/cloud.md")).toBe(true);
    expect(result.deleted).toContain(path.join(".claude", "cloud.md"));
  });

  it("leaves .claude/cloud.md untouched when claude is NOT in the uninstall set", async () => {
    writeFile(".claude/cloud.md", "GH_BKIT_TOKEN=secret\n");
    await runUninstall(["core"], makeCtx());
    expect(fileExists(".claude/cloud.md")).toBe(true);
  });
});
