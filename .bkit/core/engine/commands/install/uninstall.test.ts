// commands/install/uninstall.test.ts — P2.T3, P2.T5, P2.T7, P2.T8 — uninstall unit tests.
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  buildDecisionTable,
  formatDecisionTable,
  removeUnusedTrackerMcpEntries,
  runUninstall,
  uninstallSummaryLine,
  type UninstallContext,
  type FileSummary,
} from "./uninstall";
import {
  readBkitVersion,
  serializeBkitVersion,
  sha256,
  type BkitVersion,
} from "../../install/version-file";
import { findTemplateSource, getSharedRoot } from "../../shared/package-roots";
import { renderOpencodeJson } from "../../install/modules/opencode";
import type { WriteSet } from "../../install/write";

let tmpDir: string;

function makeCtx(overrides: Partial<UninstallContext> = {}): UninstallContext {
  return {
    cwd: tmpDir,
    dryRun: false,
    force: false,
    nuke: false,
    yes: false,
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

/** The docs/*.md files the shared templates ship; capabilities.md is a template bkit does not install. */
function shippedDocNames(): string[] {
  return fs
    .readdirSync(path.join(getSharedRoot(), "docs"))
    .filter((f) => f.endsWith(".md") && f !== "capabilities.md");
}

function writeBkitVersionFile(v: BkitVersion): void {
  const versionFilePath = path.join(tmpDir, ".bkit", "version");
  fs.mkdirSync(path.dirname(versionFilePath), { recursive: true });
  fs.writeFileSync(versionFilePath, serializeBkitVersion(v), "utf-8");
}

// ---------------------------------------------------------------------------
// buildDecisionTable — json-format files
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
// buildDecisionTable — markered-text files
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

  it("markered-text file with `# `-prefixed markers → decision=strip-block (Group A file)", () => {
    writeFile(
      ".gitignore",
      "node_modules/\n# <!-- bkit:start -->\n.worktrees/\n# <!-- bkit:end -->\n",
    );
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
    // detectMarkerStyle recognises the `# `-prefixed form used by shell hooks
    // (bkit-preflight.sh), so uninstall strips its block.
    writeFile(
      ".claude/hooks/bkit-preflight.sh",
      "#!/usr/bin/env bash\n# header\n\n# <!-- bkit:start -->\nbkit hook body\n# <!-- bkit:end -->\n",
    );
    const table = buildDecisionTable(["claude"], makeCtx());
    const entry = table.find((r) => r.file === ".claude/hooks/bkit-preflight.sh");
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
      ".claude/hooks/bkit-gateguard.cjs",
      "#!/usr/bin/env node\n// header\n\n// <!-- bkit:start -->\nbkit hook body\n// <!-- bkit:end -->\nconst driver = true;\n",
    );
    const table = buildDecisionTable(["claude"], makeCtx());
    const entry = table.find((r) => r.file === ".claude/hooks/bkit-gateguard.cjs");
    expect(entry).toBeDefined();
    expect(entry!.format).toBe("markered-text");
    expect(entry!.decision).toBe("strip-block");
  });

  it("markered-text file with bare slash-comment markers (// bkit:start) → decision=strip-block", () => {
    writeFile(
      ".opencode/plugin/bkit-gateguard.js",
      "// header\n\n// bkit:start\nbkit plugin body\n// bkit:end\nexport default function plugin() {}\n",
    );
    const table = buildDecisionTable(["opencode"], makeCtx());
    const entry = table.find((r) => r.file === ".opencode/plugin/bkit-gateguard.js");
    expect(entry).toBeDefined();
    expect(entry!.format).toBe("markered-text");
    expect(entry!.decision).toBe("strip-block");
  });

  it("core .agents/ doctrine files get a strip-block entry (they install via the templates pass, not the manifest)", () => {
    // .agents/{docs,rules}.md install via runCoreTemplates (no manifest entry); a full
    // uninstall strip-blocks them (consumer content below bkit:end preserved), matching
    // AGENTS.md.
    for (const rel of [".agents/docs.md", ".agents/rules.md"]) {
      writeFile(rel, "<!-- bkit:start -->\nbkit doctrine\n<!-- bkit:end -->\n# consumer note\n");
    }
    const table = buildDecisionTable(["core"], makeCtx());
    for (const rel of [".agents/docs.md", ".agents/rules.md"]) {
      const entry = table.find((r) => r.file === rel);
      expect(entry, `${rel} should be in the decision table under core`).toBeDefined();
      expect(entry!.decision).toBe("strip-block");
      expect(entry!.format).toBe("markered-text");
    }
  });

  it("strips only the managed blocks of .agents/context.md and .agents/skills.md, marker included", async () => {
    const marker = "<!-- bkit:managed v4.0.0 — do not edit; run `bkit upgrade` to refresh -->";
    const consumer = "## Project Skills\n\nour own skills\n";
    for (const rel of [".agents/context.md", ".agents/skills.md"]) {
      writeFile(
        rel,
        `<!-- bkit:start -->\n\n${marker}\n\nbkit rules\n\n<!-- bkit:end -->\n${consumer}`,
      );
    }
    const table = buildDecisionTable(["core"], makeCtx());
    await runUninstall(["core"], makeCtx());
    for (const rel of [".agents/context.md", ".agents/skills.md"]) {
      expect(table.find((r) => r.file === rel)?.decision).toBe("strip-block");
      const after = readFile(rel);
      expect(after).not.toContain("bkit rules");
      expect(after).not.toContain("bkit:managed");
      expect(after).toBe(consumer);
    }
  });

  describe("docs/", () => {
    const marker = "<!-- bkit:managed v4.0.0 — do not edit; run `bkit upgrade` to refresh -->";
    const block = `<!-- bkit:start -->\n\n${marker}\n\n# Testing\n\nbkit doctrine\n\n<!-- bkit:end -->\n`;

    it("strips bkit's block, managed marker included, from docs/*.md and keeps the consumer's content", async () => {
      const consumer = "## Project Testing\n\nour own notes\n";
      writeFile("docs/testing.md", `${block}${consumer}`);
      writeFile("docs/security.md", `${block}`);
      const table = buildDecisionTable(["core"], makeCtx());
      expect(table.find((r) => r.file === "docs/testing.md")?.decision).toBe("strip-block");
      const r = await runUninstall(["core"], makeCtx());
      expect(readFile("docs/testing.md")).toBe(consumer);
      expect(readFile("docs/testing.md")).not.toContain("bkit:managed");
      // Nothing but bkit's block → the file goes.
      expect(fileExists("docs/security.md")).toBe(false);
      expect(r.stripped).toContain("docs/testing.md");
      expect(r.deleted).toContain("docs/security.md");
    });

    it("deletes the owned docs/templates/bkit-*.md and keeps the consumer's own templates", async () => {
      writeFile("docs/templates/bkit-plan.md", `${block}`);
      writeFile("docs/templates/bkit-audit-security.md", `${block}our edits below\n`);
      writeFile("docs/templates/our-template.md", "ours\n");
      const table = buildDecisionTable(["core"], makeCtx());
      expect(table.find((r) => r.file === "docs/templates/bkit-plan.md")?.decision).toBe("delete");
      await runUninstall(["core"], makeCtx());
      expect(fileExists("docs/templates/bkit-plan.md")).toBe(false);
      expect(fileExists("docs/templates/bkit-audit-security.md")).toBe(false);
      expect(readFile("docs/templates/our-template.md")).toBe("ours\n");
    });

    it("prunes docs/templates when only bkit's files were in it", async () => {
      writeFile("docs/templates/bkit-plan.md", `${block}`);
      writeFile("docs/roadmap.md", "# Roadmap\n");
      await runUninstall(["core"], makeCtx());
      expect(fileExists("docs/templates")).toBe(false);
      expect(readFile("docs/roadmap.md")).toBe("# Roadmap\n");
    });

    it("leaves docs/ alone on a targeted (non-core) uninstall, and on a dry run", async () => {
      writeFile("docs/testing.md", `${block}`);
      writeFile("docs/templates/bkit-plan.md", `${block}`);
      const targeted = buildDecisionTable(["claude"], makeCtx());
      expect(targeted.some((r) => r.file.startsWith("docs/"))).toBe(false);
      await runUninstall(["core"], makeCtx({ dryRun: true }));
      expect(readFile("docs/testing.md")).toBe(block);
      expect(fileExists("docs/templates/bkit-plan.md")).toBe(true);
    });

    it("never touches docs/capabilities.md, which is a template bkit does not install", () => {
      writeFile("docs/capabilities.md", `${block}`);
      const table = buildDecisionTable(["core"], makeCtx());
      expect(table.some((r) => r.file === "docs/capabilities.md")).toBe(false);
    });

    it("covers every docs/*.md the templates ship", () => {
      const shipped = shippedDocNames();
      expect(shipped.length).toBeGreaterThan(0);
      for (const f of shipped) writeFile(path.join("docs", f), block);
      const table = buildDecisionTable(["core"], makeCtx());
      for (const f of shipped) {
        expect(table.find((r) => r.file === path.join("docs", f))?.decision, f).toBe("strip-block");
      }
    });
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
// buildDecisionTable — byte-equal-text files (owned, hash-guarded)
// ---------------------------------------------------------------------------

describe("buildDecisionTable — byte-equal-text hash guard", () => {
  // `.bkit/.env.example` is an owned byte-equal-text file (claude module).
  const OWNED = ".bkit/.env.example";
  const version = (canonicalHashes: Record<string, string>): BkitVersion => ({
    pinnedVersion: "5.0.0",
    canonicalHashes,
    claudeAllowDerived: [],
  });

  it("byte-equal-text file: no recorded hash → skip-unknown", () => {
    writeFile(OWNED, "BKIT_GH_TOKEN=\n");
    // No .bkit/version file → no hash recorded
    const table = buildDecisionTable(["claude"], makeCtx());
    expect(table.find((r) => r.file === OWNED)!.decision).toBe("skip-unknown");
  });

  it("byte-equal-text file: canonical hash matches → decision=delete", () => {
    const content = "BKIT_GH_TOKEN=\n";
    writeFile(OWNED, content);
    writeBkitVersionFile(version({ [OWNED]: sha256(content) }));
    const table = buildDecisionTable(["claude"], makeCtx());
    expect(table.find((r) => r.file === OWNED)!.decision).toBe("delete");
  });

  it("byte-equal-text file: hash mismatch (consumer modified) → skip-modified", () => {
    writeFile(OWNED, "BKIT_GH_TOKEN=consumer\n");
    writeBkitVersionFile(version({ [OWNED]: sha256("BKIT_GH_TOKEN=\n") }));
    const table = buildDecisionTable(["claude"], makeCtx());
    expect(table.find((r) => r.file === OWNED)!.decision).toBe("skip-modified");
  });

  it("byte-equal-text with --force → decision=delete regardless of hash", () => {
    writeFile(OWNED, "BKIT_GH_TOKEN=consumer\n");
    writeBkitVersionFile(version({ [OWNED]: sha256("BKIT_GH_TOKEN=\n") }));
    const table = buildDecisionTable(["claude"], makeCtx({ force: true }));
    const entry = table.find((r) => r.file === OWNED)!;
    expect(entry.decision).toBe("delete");
    expect(entry.reason).toContain("--force");
  });

  it("retro-fit: v0.6.x .bkit-version (plain text, no hashes) → skip-unknown", () => {
    writeFile(OWNED, "BKIT_GH_TOKEN=\n");
    const versionFilePath = path.join(tmpDir, ".bkit", "version");
    fs.mkdirSync(path.dirname(versionFilePath), { recursive: true });
    fs.writeFileSync(versionFilePath, "0.6.0\n", "utf-8");
    const table = buildDecisionTable(["claude"], makeCtx());
    expect(table.find((r) => r.file === OWNED)!.decision).toBe("skip-unknown");
  });

  it("an adopted template is never in the table, whatever its content", () => {
    writeFile(".cursor/Dockerfile", "FROM node:22\n");
    writeFile(".github/workflows/bkit-ci.yml", "name: bkit-ci\n");
    const table = buildDecisionTable(["core", "claude", "cursor", "cloud"], makeCtx());
    expect(table.find((r) => r.file === ".cursor/Dockerfile")).toBeUndefined();
    expect(table.find((r) => r.file === ".github/workflows/bkit-ci.yml")).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// buildDecisionTable — nuke mode
// ---------------------------------------------------------------------------

describe("buildDecisionTable — nuke mode", () => {
  it("--nuke makes all present files decision=delete", () => {
    writeFile(".claude/settings.json", '{"hooks":{}}');
    writeFile("AGENTS.md", "# Consumer\n\n<!-- bkit:start -->\nbkit\n<!-- bkit:end -->\n");
    writeFile(".bkit/.env.example", "consumer modified\n");
    writeBkitVersionFile({
      pinnedVersion: "0.7.0",
      canonicalHashes: { ".bkit/.env.example": sha256("different content\n") },
      claudeAllowDerived: [],
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
// runUninstall — files already absent are counted apart from preserved ones
// ---------------------------------------------------------------------------

describe("runUninstall — already-absent files", () => {
  it("reports skip-absent files as absent, never as preserved", async () => {
    writeFile(".claude/settings.json", '{"hooks":{}}');
    const logs: string[] = [];
    const spy = vi.spyOn(console, "log").mockImplementation((m: unknown) => {
      logs.push(String(m));
    });
    try {
      const r = await runUninstall(["claude"], makeCtx());
      const absent = r.decisions.filter((d) => d.decision === "skip-absent").map((d) => d.file);
      expect(absent.length).toBeGreaterThan(0);
      expect(r.absent).toEqual(absent);
      for (const file of absent) {
        expect(r.preserved).not.toContain(file);
        expect(logs).not.toContain(
          `[bkit-uninstall-test] preserve: ${file} (file not found — nothing to do)`,
        );
      }
    } finally {
      spy.mockRestore();
    }
  });

  it("summary line counts already-absent files apart from preserved ones", () => {
    const line = uninstallSummaryLine(
      {
        deleted: ["a"],
        stripped: ["b"],
        preserved: ["c"],
        absent: ["d", "e"],
        decisions: [],
        dryRun: false,
      },
      "[bkit]",
    );
    expect(line).toBe("[bkit] Done. Deleted: 1, stripped: 1, preserved: 1, already absent: 2");
    const dry = uninstallSummaryLine(
      { deleted: [], stripped: [], preserved: ["c"], absent: ["d"], decisions: [], dryRun: true },
      "[bkit]",
    );
    expect(dry).toBe("[bkit] [dry-run] Would delete: 0, strip: 0, preserve: 1, already absent: 1");
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

  it("preserves byte-equal-text file when hash unknown", async () => {
    writeFile(".bkit/.env.example", "BKIT_GH_TOKEN=\n");
    await runUninstall(["claude"], makeCtx());
    expect(fileExists(".bkit/.env.example")).toBe(true);
  });

  it("reclaims an unedited owned byte-equal file via canonicalHashes", async () => {
    const content = "BKIT_GH_TOKEN=\n";
    writeFile(".bkit/.env.example", content);
    writeBkitVersionFile({
      pinnedVersion: "5.0.0",
      canonicalHashes: { ".bkit/.env.example": sha256(content) },
      claudeAllowDerived: [],
    });
    await runUninstall(["claude"], makeCtx());
    expect(fileExists(".bkit/.env.example")).toBe(false);
  });

  it("preserves byte-equal-text file when hash mismatches (consumer modified)", async () => {
    writeFile(".bkit/.env.example", "BKIT_GH_TOKEN=consumer\n");
    writeBkitVersionFile({
      pinnedVersion: "5.0.0",
      canonicalHashes: { ".bkit/.env.example": sha256("BKIT_GH_TOKEN=\n") },
      claudeAllowDerived: [],
    });
    await runUninstall(["claude"], makeCtx());
    expect(readFile(".bkit/.env.example")).toBe("BKIT_GH_TOKEN=consumer\n");
  });
});

// ---------------------------------------------------------------------------
// runUninstall — .mcp.json / .cursor/mcp.json: only bkit's tracker entry goes
// ---------------------------------------------------------------------------

describe("runUninstall — MCP config keeps the consumer's servers", () => {
  const templatesRoot = getSharedRoot();
  const trackerEntry = (rel: string, tracker: string): unknown =>
    (
      JSON.parse(fs.readFileSync(path.join(templatesRoot, rel), "utf-8")) as {
        mcpServers: Record<string, unknown>;
      }
    ).mcpServers[tracker];

  it.each(["github", "linear", "jira"])(
    "removes bkit's %s entry and keeps a consumer server and top-level key",
    async (tracker) => {
      const rel = ".mcp.json";
      const consumer = { type: "stdio", command: "my-mcp" };
      writeFile(
        rel,
        JSON.stringify(
          { mcpServers: { [tracker]: trackerEntry(rel, tracker), mine: consumer }, extra: true },
          null,
          2,
        ) + "\n",
      );
      await runUninstall(["claude"], makeCtx());
      expect(JSON.parse(readFile(rel))).toEqual({ mcpServers: { mine: consumer }, extra: true });
    },
  );

  it.each(["github", "linear", "jira"])(
    "deletes the file when bkit's %s entry was all it held",
    async (tracker) => {
      const rel = path.join(".cursor", "mcp.json");
      writeFile(
        rel,
        JSON.stringify({ mcpServers: { [tracker]: trackerEntry(rel, tracker) } }, null, 2) + "\n",
      );
      await runUninstall(["cursor"], makeCtx());
      expect(fileExists(rel)).toBe(false);
    },
  );
});

describe("removeUnusedTrackerMcpEntries — tracker switch", () => {
  const templatesRoot = getSharedRoot();
  const templateServers = (rel: string): Record<string, unknown> =>
    (
      JSON.parse(fs.readFileSync(path.join(templatesRoot, rel), "utf-8")) as {
        mcpServers: Record<string, unknown>;
      }
    ).mcpServers;
  const cursorRel = path.join(".cursor", "mcp.json");
  const opencodeRel = path.join(".opencode", "opencode.json");
  const opencodeDoc = (tracker: "linear" | "jira"): Record<string, unknown> => {
    const templatePath = findTemplateSource(opencodeRel);
    if (templatePath === null) throw new Error("opencode.json template missing");
    return JSON.parse(renderOpencodeJson(templatePath, tracker, "openrouter", tmpDir)) as Record<
      string,
      unknown
    >;
  };

  // github is never removed: the workflows' gh MCP fallback calls it under every tracker.
  it.each([
    ["linear", "github"],
    ["jira", "github"],
    ["linear", "jira"],
    ["jira", "linear"],
  ] as const)(
    "removes an unedited %s entry from all three files on a switch to %s and keeps github and a consumer server",
    (from, to) => {
      const servers = templateServers(".mcp.json");
      const consumer = { type: "stdio", command: "my-mcp" };
      writeFile(
        ".mcp.json",
        JSON.stringify({ mcpServers: { [from]: servers[from], github: servers.github } }, null, 2),
      );
      writeFile(
        cursorRel,
        JSON.stringify({
          mcpServers: { [from]: templateServers(cursorRel)[from], mine: consumer },
        }),
      );
      writeFile(opencodeRel, JSON.stringify(opencodeDoc(from), null, 2));

      const ws: WriteSet = { writes: [] };
      const log = vi.spyOn(console, "log").mockImplementation(() => {});
      const written = removeUnusedTrackerMcpEntries(tmpDir, to, false, ws, "[t]");
      const logs = log.mock.calls.map((c) => String(c[0]));
      log.mockRestore();

      expect(written).toHaveLength(3);
      expect(ws.writes.map((w) => w.path)).toEqual(written);
      expect(logs.some((l) => l.includes(`removed .mcp.json mcpServers.${from}`))).toBe(true);
      expect(JSON.parse(readFile(".mcp.json"))).toEqual({ mcpServers: { github: servers.github } });
      expect(JSON.parse(readFile(cursorRel))).toEqual({ mcpServers: { mine: consumer } });
      const opencode = JSON.parse(readFile(opencodeRel)) as Record<string, unknown>;
      expect(opencode).not.toHaveProperty("mcp");
      expect(opencode).toHaveProperty("permission");
    },
  );

  it.each(["linear", "jira"])("keeps an emptied mcpServers map in .mcp.json (%s)", (from) => {
    writeFile(
      ".mcp.json",
      JSON.stringify({ mcpServers: { [from]: templateServers(".mcp.json")[from] } }),
    );
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    removeUnusedTrackerMcpEntries(tmpDir, "none", false, { writes: [] }, "[t]");
    log.mockRestore();
    expect(JSON.parse(readFile(".mcp.json"))).toEqual({ mcpServers: {} });
  });

  it.each(["linear", "jira"])("keeps a consumer-edited %s entry and warns about it", (from) => {
    const edited = { ...(templateServers(".mcp.json")[from] as object), headers: { X: "1" } };
    const before = JSON.stringify({ mcpServers: { [from]: edited } }, null, 2);
    writeFile(".mcp.json", before);
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const written = removeUnusedTrackerMcpEntries(tmpDir, "github", false, { writes: [] }, "[t]");
    const warnings = warn.mock.calls.map((c) => String(c[0]));
    warn.mockRestore();

    expect(written).toEqual([]);
    expect(readFile(".mcp.json")).toBe(before);
    expect(warnings.some((w) => w.includes(`.mcp.json mcpServers.${from}: edited`))).toBe(true);
  });

  it("dry-run reports the write but leaves the file untouched", () => {
    const before = JSON.stringify({ mcpServers: { linear: templateServers(".mcp.json").linear } });
    writeFile(".mcp.json", before);
    const ws: WriteSet = { writes: [] };
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    removeUnusedTrackerMcpEntries(tmpDir, "github", true, ws, "[t]");
    log.mockRestore();
    expect(ws.writes).toHaveLength(1);
    expect(readFile(".mcp.json")).toBe(before);
  });

  it.each(["linear", "jira"] as const)("switching to %s removes nothing", (to) => {
    const servers = templateServers(".mcp.json");
    const before = JSON.stringify({ mcpServers: { github: servers.github, [to]: servers[to] } });
    writeFile(".mcp.json", before);
    expect(removeUnusedTrackerMcpEntries(tmpDir, to, false, { writes: [] }, "[t]")).toEqual([]);
    expect(readFile(".mcp.json")).toBe(before);
  });
});

// ---------------------------------------------------------------------------
// runUninstall — 100%-bkit residual delete + opencode scope render (4.6.2)
// ---------------------------------------------------------------------------

describe("runUninstall — 100%-bkit residual + opencode scope (4.6.2)", () => {
  // Exact rendered opencode.json a `--opencode=opencode-go --tracker=github` install writes.
  const RENDERED_OPENCODE =
    JSON.stringify(
      {
        mcp: {
          github: {
            type: "remote",
            url: "https://api.githubcopilot.com/mcp/",
            oauth: false,
            headers: {
              Authorization: "Bearer {env:BKIT_GH_TOKEN}",
              "X-MCP-Toolsets": "context,issues,pull_requests,repos,users,projects,actions",
            },
          },
        },
        provider: {
          "opencode-go": {
            options: {
              apiKey: "{env:BKIT_OPENCODE_API_KEY}",
            },
          },
        },
      },
      null,
      2,
    ) + "\n";

  it("deletes a 100%-bkit markered-text file (residual == shipped scaffold, not a dead husk)", () => {
    // .claude/hooks/bkit-preflight.sh is a shebang + bkit header wrapping a managed block — 100% bkit.
    // A pristine install strips to a residual identical to the template scaffold → delete.
    const rel = ".claude/hooks/bkit-preflight.sh";
    writeFile(rel, fs.readFileSync(findTemplateSource(rel)!, "utf-8"));
    return runUninstall(["claude"], makeCtx()).then(() => {
      expect(fileExists(rel)).toBe(false);
    });
  });

  it("preserves a markered-text file when the consumer added content outside the block", () => {
    const rel = ".claude/hooks/bkit-preflight.sh";
    writeFile(rel, fs.readFileSync(findTemplateSource(rel)!, "utf-8") + "\n# my custom check\n");
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

  // What three installs (`--opencode=openrouter`, `ollama`, `opencode-zen`) across three trackers
  // (`linear`, `jira`, then `github`) leave: install keeps every earlier provider block and
  // tracker entry.
  function multiInstallOpencodeJson(): Record<string, Record<string, unknown>> {
    const tpl = findTemplateSource(".opencode/opencode.json")!;
    const render = (tracker: "github" | "linear" | "jira" | "none", provider: string) =>
      JSON.parse(renderOpencodeJson(tpl, tracker, provider, tmpDir)) as Record<
        string,
        Record<string, unknown>
      >;
    const doc = render("github", "openrouter");
    doc.mcp = {
      ...doc.mcp,
      ...render("linear", "openrouter").mcp,
      ...render("jira", "openrouter").mcp,
    };
    doc.provider = {
      ...doc.provider,
      ...render("none", "ollama").provider,
      ...render("none", "opencode-zen").provider,
    };
    return doc;
  }

  it("deletes opencode.json holding every provider block and tracker entry earlier installs left", async () => {
    const rel = ".opencode/opencode.json";
    const doc = multiInstallOpencodeJson();
    expect(Object.keys(doc.provider)).toEqual(["openrouter", "ollama", "opencode"]);
    expect(Object.keys(doc.mcp)).toEqual(["github", "linear", "jira"]);
    writeFile(rel, JSON.stringify(doc, null, 2) + "\n");
    await runUninstall(["opencode"], makeCtx());
    expect(fileExists(rel)).toBe(false);
  });

  it.each(["github", "linear", "jira"])(
    "keeps a provider block and a %s tracker entry the consumer edited, whole, and their own entries",
    async (tracker) => {
      const rel = ".opencode/opencode.json";
      const doc = multiInstallOpencodeJson();
      const ollama = doc.provider.ollama as { options: { baseURL: string } };
      ollama.options.baseURL = "http://localhost:11434/v1";
      (doc.mcp[tracker] as { url: string }).url = `https://mcp.example.com/${tracker}`;
      doc.mcp.sentry = { type: "remote", url: "https://mcp.sentry.dev/mcp" };
      doc.provider.mine = { options: { apiKey: "{env:MINE}" } };
      writeFile(rel, JSON.stringify(doc, null, 2) + "\n");
      await runUninstall(["opencode"], makeCtx());
      const after = JSON.parse(readFile(rel)) as Record<string, Record<string, unknown>>;
      expect(Object.keys(after).sort()).toEqual(["mcp", "provider"]);
      expect(after.provider).toEqual({ ollama: doc.provider.ollama, mine: doc.provider.mine });
      expect(after.mcp).toEqual({ [tracker]: doc.mcp[tracker], sentry: doc.mcp.sentry });
    },
  );

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
    // .bkit/version records no hash for itself, so the generic byte-equal hash-guard would
    // preserve it as "consumer-modified" — leaving bkit state behind after a full teardown.
    writeBkitVersionFile({ pinnedVersion: "1.0.0", canonicalHashes: {}, claudeAllowDerived: [] });
    return runUninstall(["core"], makeCtx()).then(() => {
      expect(fileExists(".bkit/version")).toBe(false);
    });
  });

  it("keeps .bkit/version on a targeted (non-core) uninstall", () => {
    // It is `module: core`, so a `--claude`-only uninstall never sees it and bkit keeps working.
    writeBkitVersionFile({ pinnedVersion: "1.0.0", canonicalHashes: {}, claudeAllowDerived: [] });
    return runUninstall(["claude"], makeCtx()).then(() => {
      expect(fileExists(".bkit/version")).toBe(true);
    });
  });

  it("prunes deleted paths from .bkit/version on a targeted (non-core) uninstall", async () => {
    // A targeted uninstall deletes the module's files but leaves .bkit/version in place. Its
    // canonicalHashes must not keep listing the now-absent paths, or the next `bkit check`
    // (whose dry-run install prunes them) reports write-drift and fails the CI gate.
    const owned = ".claude/agents/bkit-foo.md";
    const kept = ".claude/keep.md";
    writeFile(owned, "bkit agent\n");
    writeFile(kept, "consumer file\n");
    writeBkitVersionFile({
      pinnedVersion: "5.0.1",
      canonicalHashes: { [owned]: sha256("bkit agent\n"), [kept]: sha256("consumer file\n") },
      claudeAllowDerived: [],
    });

    const result = await runUninstall(["claude"], makeCtx());

    expect(result.deleted).toContain(owned);
    expect(fileExists(owned)).toBe(false);
    const recorded = readBkitVersion(path.join(tmpDir, ".bkit", "version"));
    expect(recorded).not.toBeNull();
    expect(recorded!.pinnedVersion).toBe("5.0.1");
    expect(recorded!.canonicalHashes[owned]).toBeUndefined();
    // A path still on disk (consumer content) keeps its recorded hash.
    expect(recorded!.canonicalHashes[kept]).toBe(sha256("consumer file\n"));
  });

  it("leaves .bkit/version byte-identical on a targeted uninstall that prunes nothing", async () => {
    writeFile(".claude/keep.md", "consumer file\n");
    writeBkitVersionFile({
      pinnedVersion: "5.0.1",
      canonicalHashes: { ".claude/keep.md": sha256("consumer file\n") },
      claudeAllowDerived: [],
    });
    const before = readFile(".bkit/version");

    await runUninstall(["claude"], makeCtx());

    expect(readFile(".bkit/version")).toBe(before);
  });

  it("a targeted dry-run prints the same version-pin update line as the real run", async () => {
    const owned = ".claude/agents/bkit-foo.md";
    const seed = (): void => {
      writeFile(owned, "bkit agent\n");
      writeBkitVersionFile({
        pinnedVersion: "5.0.1",
        canonicalHashes: { [owned]: sha256("bkit agent\n") },
        claudeAllowDerived: [],
      });
    };
    const pinLine = async (dryRun: boolean): Promise<string | undefined> => {
      const logs: string[] = [];
      const spy = vi.spyOn(console, "log").mockImplementation((m: unknown) => {
        logs.push(String(m));
      });
      try {
        await runUninstall(["claude"], makeCtx({ dryRun }));
      } finally {
        spy.mockRestore();
      }
      return logs.find((l) => l.includes("update version pin"));
    };

    seed();
    const dry = await pinLine(true);
    const real = await pinLine(false);

    expect(dry).toContain("[dry-run]");
    expect(dry).toContain("(pruned 1)");
    expect(real).toContain("(pruned 1)");
    expect(dry?.replace(" [dry-run]", "")).toBe(real);
  });

  it("does not rewrite .bkit/version on a targeted dry-run (no writes)", async () => {
    const owned = ".claude/agents/bkit-foo.md";
    writeFile(owned, "bkit agent\n");
    writeBkitVersionFile({
      pinnedVersion: "5.0.1",
      canonicalHashes: { [owned]: sha256("bkit agent\n") },
      claudeAllowDerived: [],
    });
    const before = readFile(".bkit/version");

    await runUninstall(["claude"], makeCtx({ dryRun: true }));

    expect(readFile(".bkit/version")).toBe(before);
    expect(fileExists(owned)).toBe(true);
  });

  // The bkit block a consumer holds for each tracker, its tracker config included.
  const TRACKER_BKIT_BLOCKS = [
    ["github", { tracker: { default: "github" } }],
    ["linear", { tracker: { default: "linear", linear: { team: "ENG", review: "In Review" } } }],
    [
      "jira",
      {
        tracker: { default: "jira", jira: { site: "https://acme.atlassian.net", project: "PROJ" } },
      },
    ],
  ] as const;

  it.each(TRACKER_BKIT_BLOCKS)(
    "strips package.json bkit install-state block on full/core uninstall (%s)",
    async (_tracker, trackerBlock) => {
      const pkgPath = path.join(tmpDir, "package.json");
      fs.writeFileSync(
        pkgPath,
        JSON.stringify(
          {
            name: "consumer",
            bkit: {
              ...trackerBlock,
              providers: { opencode: { default: "opencode-zen", installed: ["opencode-zen"] } },
              dependencies: { updater: "renovate" },
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
    },
  );

  it.each(TRACKER_BKIT_BLOCKS)(
    "keeps package.json bkit block on targeted (non-core) uninstall (%s)",
    async (_tracker, trackerBlock) => {
      const pkgPath = path.join(tmpDir, "package.json");
      fs.writeFileSync(
        pkgPath,
        JSON.stringify({ name: "consumer", bkit: trackerBlock }, null, 2) + "\n",
        "utf-8",
      );
      await runUninstall(["claude"], makeCtx());
      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8")) as { bkit?: unknown };
      expect(pkg.bkit).toEqual(trackerBlock);
    },
  );
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
    writeFile(".bkit/.env.example", "consumer modified\n");
    writeBkitVersionFile({
      pinnedVersion: "0.7.0",
      canonicalHashes: { ".bkit/.env.example": sha256("different\n") },
      claudeAllowDerived: [],
    });

    const result = await runUninstall(
      ["core", "claude", "cursor", "cloud"],
      makeCtx({ nuke: true, yes: true }),
    );

    // All present files should be deleted
    const deletes = result.deleted;
    expect(deletes.some((f) => f.includes("settings.json"))).toBe(true);
    expect(fileExists(".claude/settings.json")).toBe(false);
    expect(fileExists(".bkit/.env.example")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// stripTier2JsonScope — pure JSON uninstall helper (BAR-167 Phase 1)
// ---------------------------------------------------------------------------

import { stripTier2JsonScope } from "./uninstall";
import type { JsonValue } from "../../install/write";

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
    // Install appends apex-domain WebFetch entries to `permissions.allow` after rendering
    // the template; `allow`, `deny` and `ask` all strip together.
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
// runUninstall — generated .claude/bkit-cloud.md cleanup (untracked secret-bearing file)
// ---------------------------------------------------------------------------

describe("runUninstall — .claude/settings.json leaves no grants behind", () => {
  it("strips allow/deny/ask together, including install's WebFetch enrichment", async () => {
    // `permissions.allow` (enriched with apex-domain WebFetch grants AFTER rendering the
    // template) strips element-wise like `deny` and `ask`; no `Bash(*)` is left behind.
    const templateRaw = fs.readFileSync(
      path.join(getSharedRoot(), ".claude", "settings.json"),
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
    // left to keep and the file itself goes. Asserted unconditionally.
    expect(fileExists(".claude/settings.json")).toBe(false);
    expect(template.permissions.allow).toContain("Bash(*)");
  });

  it("preserves a permission the consumer added themselves", async () => {
    const templateRaw = fs.readFileSync(
      path.join(getSharedRoot(), ".claude", "settings.json"),
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

describe("runUninstall — .claude/bkit-cloud.md cleanup", () => {
  it("deletes .claude/bkit-cloud.md when the claude host is uninstalled", async () => {
    writeFile(".claude/bkit-cloud.md", "# generated cloud doc\nBKIT_GH_TOKEN=secret\n");
    const result = await runUninstall(["claude"], makeCtx());
    expect(fileExists(".claude/bkit-cloud.md")).toBe(false);
    expect(result.deleted).toContain(path.join(".claude", "bkit-cloud.md"));
  });

  it("dry-run reports the deletion but leaves the file on disk", async () => {
    writeFile(".claude/bkit-cloud.md", "BKIT_GH_TOKEN=secret\n");
    const result = await runUninstall(["claude"], makeCtx({ dryRun: true }));
    expect(fileExists(".claude/bkit-cloud.md")).toBe(true);
    expect(result.deleted).toContain(path.join(".claude", "bkit-cloud.md"));
  });

  it("leaves .claude/bkit-cloud.md untouched when claude is NOT in the uninstall set", async () => {
    writeFile(".claude/bkit-cloud.md", "BKIT_GH_TOKEN=secret\n");
    await runUninstall(["core"], makeCtx());
    expect(fileExists(".claude/bkit-cloud.md")).toBe(true);
  });
});
