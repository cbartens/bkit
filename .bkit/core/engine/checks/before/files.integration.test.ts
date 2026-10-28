// checks/before/files.integration.test.ts — Integration tests for the Phase 1 managed-text and
// managed-JSON drift detectors.

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { WriteSet } from "../../install/write";
import type { ModuleContext } from "../../install/modules/index";
import { applyTokens } from "../../install/placeholders";
import { detectTier2JsonDrift, detectTier2TextDrift } from "./files";
import { findTemplateSource } from "../../shared/package-roots";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let tmpDir: string;

let originalCwd: string;

function makeWriteSet(): WriteSet {
  return { writes: [] };
}

function makeCtx(overrides: Partial<ModuleContext> = {}): ModuleContext {
  return {
    dryRun: false,
    tokens: {
      DEFAULT_BRANCH: "main",
      PROJECT_NAME: "test-project",
      REPO_SLUG: "acme/test-project",
    },
    modelLookup: new Map(),
    opencodeModelLookup: new Map(),
    effortMap: new Map(),
    advisories: [],
    ws: makeWriteSet(),
    logPrefix: "[bkit-install]",
    postDispatch: [],
    issueTracker: "none",
    ...overrides,
  };
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

describe("detectTier2JsonDrift advisory", () => {
  it("returns advisory when consumer is missing a template key", () => {
    const relPath = ".claude/settings.json";
    fs.mkdirSync(path.join(tmpDir, ".claude"), { recursive: true });
    // Consumer missing bkit-owned hooks.SessionStart
    fs.writeFileSync(
      path.join(tmpDir, relPath),
      JSON.stringify({ $schema: "x", hooks: {} }),
      "utf-8",
    );
    const result = detectTier2JsonDrift(tmpDir, relPath);
    expect(result).not.toBeNull();
    expect(result!.id).toBe("tier2-json-drift");
    expect(result!.severity).toBe("advisory");
  });

  it("returns null when consumer contains the full template scope", () => {
    const relPath = ".cursor/hooks.json";
    const templatePath = findTemplateSource(relPath)!;
    // Copy template as-is to consumer
    fs.mkdirSync(path.join(tmpDir, ".cursor"), { recursive: true });
    fs.copyFileSync(templatePath, path.join(tmpDir, relPath));
    const result = detectTier2JsonDrift(tmpDir, relPath);
    expect(result).toBeNull();
  });
});

describe("tier2-json-drift advisory on managed JSON, never on a template", () => {
  it("advisory surfaces when the consumer's opencode.json is missing template keys", () => {
    const relPath = path.join(".opencode", "opencode.json");
    fs.mkdirSync(path.join(tmpDir, ".opencode"), { recursive: true });
    // Consumer has none of the bkit-managed keys (permission / plugin / provider / mcp).
    fs.writeFileSync(path.join(tmpDir, relPath), JSON.stringify({ $schema: "x" }), "utf-8");

    const result = detectTier2JsonDrift(tmpDir, relPath);
    expect(result).not.toBeNull();
    expect(result!.id).toBe("tier2-json-drift");
    expect(result!.severity).toBe("advisory");
    expect(result!.detect).toContain(relPath);
  });

  it("no advisory for a copy-and-own template (slop-scan.config.json)", () => {
    // slop-scan.config.json ships as a template: install never writes or drift-checks a
    // consumer's copy, so the detector has no package source to compare against.
    const relPath = "slop-scan.config.json";
    fs.writeFileSync(path.join(tmpDir, relPath), JSON.stringify({ rules: {} }), "utf-8");
    expect(detectTier2JsonDrift(tmpDir, relPath)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Task 23 — detectTier2TextDrift block logic, on AGENTS.md (MARKERED_TEXT_DRIFT_PATHS).
// Only the lines inside bkit:start / bkit:end are compared, as a subset: every required
// template line must be present; comments, extras and the managed-version marker never
// count.
// ---------------------------------------------------------------------------

describe("Task 23 — detectTier2TextDrift block logic (AGENTS.md)", () => {
  const relPath = "AGENTS.md";
  const RULES_LINE = "- **Rules file:** Read `.agents/rules.md` → follow all rules.";
  const readRendered = (): string =>
    applyTokens(fs.readFileSync(findTemplateSource(relPath)!, "utf-8"), makeCtx().tokens);
  const writeConsumer = (content: string): void => {
    fs.writeFileSync(path.join(tmpDir, relPath), content, "utf-8");
  };

  it("no drift when the consumer file matches the rendered template", () => {
    writeConsumer(readRendered());
    expect(detectTier2TextDrift(tmpDir, relPath)).toBeNull();
  });

  it("no drift when content OUTSIDE the block changes (consumer owns it)", () => {
    writeConsumer(readRendered().replace("# AGENTS.md\n", "# Our agents\n") + "\n## Ours\n");
    expect(detectTier2TextDrift(tmpDir, relPath)).toBeNull();
  });

  it("no drift when the block carries a managed-version marker of another version", () => {
    writeConsumer(readRendered().replace(/bkit:managed v\S+/, "bkit:managed v0.0.1"));
    expect(detectTier2TextDrift(tmpDir, relPath)).toBeNull();
  });

  it("flags DRIFT when a bkit-owned line in the block is edited", () => {
    writeConsumer(readRendered().replace(RULES_LINE, "> consumer-hacked"));
    const drift = detectTier2TextDrift(tmpDir, relPath);
    expect(drift?.id).toBe("tier2-text-drift");
  });

  it("no drift when a consumer adds a comment annotation inside the block", () => {
    writeConsumer(
      readRendered().replace(RULES_LINE, `${RULES_LINE}\n<!-- consumer note: PROJ-42 -->`),
    );
    expect(detectTier2TextDrift(tmpDir, relPath)).toBeNull();
  });

  it("still flags DRIFT when a consumer comments OUT a required line", () => {
    writeConsumer(readRendered().replace(RULES_LINE, `<!-- ${RULES_LINE} -->`));
    expect(detectTier2TextDrift(tmpDir, relPath)?.id).toBe("tier2-text-drift");
  });

  it("no drift when a consumer adds an EXTRA line inside the block (subset — extras OK)", () => {
    writeConsumer(readRendered().replace(RULES_LINE, `${RULES_LINE}\n> Our extra rule.`));
    expect(detectTier2TextDrift(tmpDir, relPath)).toBeNull();
  });

  it("flags DRIFT when a consumer DROPS a required line from the block", () => {
    writeConsumer(readRendered().replace(`${RULES_LINE}\n`, ""));
    expect(detectTier2TextDrift(tmpDir, relPath)?.id).toBe("tier2-text-drift");
  });
});
