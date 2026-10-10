// bkit-templates.test.ts — Task 22 (BAR-167 Phase 2)
//
// Marker presence enforcement tests for Group A + Group B templates.
// slop-scan.config.json required-rules enumeration (JSON deep-containment, no markers).
//
// These tests assert that the canonical template files in .bkit/templates/
// contain the correct bkit:start / bkit:end markers so that the install pass
// can correctly extract and manage the bkit-owned block.

import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";
import { extractManagedBlock } from "./bkit-markers";

const TEMPLATES_ROOT = path.resolve(".bkit/templates");

function templatePath(...parts: string[]): string {
  return path.join(TEMPLATES_ROOT, ...parts);
}

function readTemplate(...parts: string[]): string {
  return fs.readFileSync(templatePath(...parts), "utf-8");
}

// ---------------------------------------------------------------------------
// Helper: count occurrences of a pattern in a string
// ---------------------------------------------------------------------------

function countMatches(content: string, pattern: RegExp): number {
  return (content.match(pattern) ?? []).length;
}

// ---------------------------------------------------------------------------
// Group A — Full-ownership templates
// Each must contain exactly ONE bkit:start and ONE bkit:end marker.
// Audit templates are discovered from docs/templates/bkit-audit-*.md.
// ---------------------------------------------------------------------------

function listAuditTemplates(): string[] {
  return fs
    .readdirSync(templatePath("docs", "templates"))
    .filter((name) => name.startsWith("bkit-audit-") && name.endsWith(".md"))
    .sort()
    .map((name) => path.posix.join("docs/templates", name));
}

const GROUP_A_MD_FILES = [
  "AGENTS.md",
  "CLAUDE.md",
  ".agents/rules.md",
  ".agents/docs.md",
  ".agents/skills.md",
  "docs/templates/bkit-plan.md",
  ...listAuditTemplates(),
];

const GROUP_A_MDC_FILES = [".cursor/rules/00-shared-rules.mdc"];

const GROUP_A_YAML_FILES = [
  ".vale/styles/House/Filler.yml",
  ".vale/styles/House/Hedging.yml",
  ".vale/styles/House/LLMSlop.yml",
  ".vale/styles/House/Verbose.yml",
];

describe("audit templates — managed block plus consumer stub", () => {
  const audits = listAuditTemplates();

  it("ships the finished audit set", () => {
    expect(audits.length).toBeGreaterThan(0);
    expect(audits).toContain("docs/templates/bkit-audit-repo.md");
    expect(audits).toContain("docs/templates/bkit-audit-security.md");
    expect(audits).not.toContain("docs/templates/bkit-audit-test.md");
  });

  it.each(audits)("%s keeps project instructions outside the managed block", (relPath) => {
    const content = readTemplate(relPath);
    expect(content).toContain("{{BKIT_MANAGED_MARKER}}");
    expect(content).not.toContain("bkit:managed v");
    const end = content.indexOf("<!-- bkit:end -->");
    expect(content.slice(end + "<!-- bkit:end -->".length)).toBe("\n\n## Project Instructions\n");
  });

  // Below `bkit:end` is consumer-owned, and bkit is a consumer of its own templates:
  // its copy may carry Project Instructions (bkit-audit-generate also refines them each
  // run), so only the managed part has to match.
  it.each(audits)(
    "%s dogfood managed block differs only by the managed-version stamp",
    (relPath) => {
      const template = readTemplate(relPath);
      const dogfood = fs.readFileSync(path.resolve(relPath), "utf-8");
      const stamp = dogfood.match(
        /^<!-- bkit:managed v\S+ — do NOT edit; run `bkit upgrade` to refresh -->$/m,
      )?.[0];
      expect(stamp, relPath).toBeTruthy();
      const upToEnd = (s: string) => s.slice(0, s.indexOf("<!-- bkit:end -->"));
      expect(upToEnd(dogfood), relPath).toBe(
        upToEnd(template.replace("{{BKIT_MANAGED_MARKER}}", stamp!)),
      );
      expect(dogfood.slice(dogfood.indexOf("<!-- bkit:end -->")), relPath).toMatch(
        /^<!-- bkit:end -->\n\n## Project Instructions\n/,
      );
    },
  );
});

describe("Group A templates — html-comment markers (md/mdc files)", () => {
  for (const relPath of [...GROUP_A_MD_FILES, ...GROUP_A_MDC_FILES]) {
    it(`${relPath}: has exactly one <!-- bkit:start --> and one <!-- bkit:end -->`, () => {
      const content = readTemplate(relPath);
      expect(countMatches(content, /^<!-- bkit:start -->$/m)).toBe(1);
      expect(countMatches(content, /^<!-- bkit:end -->$/m)).toBe(1);
    });

    it(`${relPath}: bkit:start appears before bkit:end`, () => {
      const content = readTemplate(relPath);
      const startIdx = content.indexOf("<!-- bkit:start -->");
      const endIdx = content.indexOf("<!-- bkit:end -->");
      expect(startIdx).toBeGreaterThanOrEqual(0);
      expect(endIdx).toBeGreaterThan(startIdx);
    });

    it(`${relPath}: extractManagedBlock returns non-null non-empty content`, () => {
      const content = readTemplate(relPath);
      const block = extractManagedBlock(content, "html-comment");
      expect(block).not.toBeNull();
      expect(block!.length).toBeGreaterThan(0);
    });
  }
});

describe("Group A templates — hash-comment markers (YAML files)", () => {
  for (const relPath of GROUP_A_YAML_FILES) {
    it(`${relPath}: has exactly one # bkit:start and one # bkit:end`, () => {
      const content = readTemplate(relPath);
      expect(countMatches(content, /^# bkit:start$/m)).toBe(1);
      expect(countMatches(content, /^# bkit:end$/m)).toBe(1);
    });

    it(`${relPath}: bkit:start appears before bkit:end`, () => {
      const content = readTemplate(relPath);
      const startIdx = content.indexOf("# bkit:start");
      const endIdx = content.lastIndexOf("# bkit:end");
      expect(startIdx).toBeGreaterThanOrEqual(0);
      expect(endIdx).toBeGreaterThan(startIdx);
    });

    it(`${relPath}: extractManagedBlock returns non-null non-empty content`, () => {
      const content = readTemplate(relPath);
      const block = extractManagedBlock(content, "hash-comment");
      expect(block).not.toBeNull();
      expect(block!.length).toBeGreaterThan(0);
    });
  }
});

// ---------------------------------------------------------------------------
// Group B — Partial-ownership templates
// ci.yml: a template the consumer copies and owns. It carries NAMED blocks (`verbose-ci-env`,
//   `main-lag-warning`) as labels only; bkit never checks them. It carries no bare
//   whole-file `# bkit:start`/`# bkit:end` markers: consumers read those as "bkit
//   owns/syncs these steps".
// .vale.ini: markers wrap StylesPath, Packages, MinAlertLevel, House style enable
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Helper: extract content of the named verbose-ci-env block (ci.yml style).
// Marker is indented (4-space) so extractManagedBlock (which requires
// line-anchored col-0 or comment-prefix markers) cannot be used directly.
// ---------------------------------------------------------------------------

function extractCiYmlVerboseBlock(content: string): string | null {
  const startMarker = "    # bkit:start verbose-ci-env";
  const endMarker = "    # bkit:end verbose-ci-env";
  const startIdx = content.indexOf(startMarker);
  const endIdx = content.indexOf(endMarker);
  if (startIdx === -1 || endIdx === -1 || endIdx <= startIdx) return null;
  const startLineEnd = content.indexOf("\n", startIdx);
  if (startLineEnd === -1) return null;
  return content.slice(startLineEnd + 1, endIdx);
}

describe("Group B templates — ci.yml named verbose-ci-env block", () => {
  it("ci.yml has exactly one # bkit:start verbose-ci-env (4-space indent)", () => {
    const content = readTemplate(".github/workflows/ci.yml");
    expect(countMatches(content, /^    # bkit:start verbose-ci-env$/m)).toBe(1);
  });

  it("ci.yml has exactly one # bkit:end verbose-ci-env (4-space indent)", () => {
    const content = readTemplate(".github/workflows/ci.yml");
    expect(countMatches(content, /^    # bkit:end verbose-ci-env$/m)).toBe(1);
  });

  it("ci.yml carries no bare whole-file bkit markers", () => {
    const content = readTemplate(".github/workflows/ci.yml");
    expect(countMatches(content, /^\s*# bkit:start$/m)).toBe(0);
    expect(countMatches(content, /^\s*# bkit:end$/m)).toBe(0);
  });

  it("ci.yml verbose-ci-env block contains the verbose-CI env wiring", () => {
    const content = readTemplate(".github/workflows/ci.yml");
    const block = extractCiYmlVerboseBlock(content);
    expect(block).not.toBeNull();
    expect(block!).toContain("VERBOSE_CI");
    expect(block!).toContain("TURBO_LOG_LEVEL");
    expect(block!).toContain("BKIT_GH_TOKEN_INSTALL");
  });

  it("ci.yml install step writes the GH Packages auth token via pnpm config set (user-level, before install)", () => {
    const content = readTemplate(".github/workflows/ci.yml");
    expect(content).toMatch(
      /pnpm config set\s+"?\/\/npm\.pkg\.github\.com\/:_authToken=\$BKIT_GH_TOKEN_INSTALL/,
    );
  });
});

describe("Group B templates — .vale.ini partial-ownership markers", () => {
  it(".vale.ini has exactly one # bkit:start at column 0", () => {
    const content = readTemplate(".vale.ini");
    expect(countMatches(content, /^# bkit:start$/m)).toBe(1);
  });

  it(".vale.ini has exactly one # bkit:end at column 0", () => {
    const content = readTemplate(".vale.ini");
    expect(countMatches(content, /^# bkit:end$/m)).toBe(1);
  });

  it(".vale.ini marker block contains StylesPath", () => {
    const content = readTemplate(".vale.ini");
    const block = extractManagedBlock(content, "hash-comment");
    expect(block).not.toBeNull();
    expect(block!).toContain("StylesPath");
  });

  it(".vale.ini marker block contains Packages", () => {
    const content = readTemplate(".vale.ini");
    const block = extractManagedBlock(content, "hash-comment");
    expect(block!).toContain("Packages");
  });

  it(".vale.ini marker block contains MinAlertLevel", () => {
    const content = readTemplate(".vale.ini");
    const block = extractManagedBlock(content, "hash-comment");
    expect(block!).toContain("MinAlertLevel");
  });

  it(".vale.ini marker block contains House style enable ([.agents/**])", () => {
    const content = readTemplate(".vale.ini");
    const block = extractManagedBlock(content, "hash-comment");
    expect(block!).toContain("[.agents/**]");
    expect(block!).toContain("BasedOnStyles = House");
  });
});

// ---------------------------------------------------------------------------
// slop-scan.config.json — JSON deep-containment, NOT markers
// Eleven required rules must be present with enabled: true — the ten core
// built-ins plus the boundary/type-suppression plugin rule.
// ---------------------------------------------------------------------------

describe("slop-scan.config.json — required core rules (JSON deep-containment)", () => {
  const REQUIRED_RULES = [
    "comments.placeholder-comments",
    "structure.over-fragmentation",
    "structure.directory-fanout-hotspot",
    "structure.duplicate-function-signatures",
    "structure.barrel-density",
    "structure.pass-through-wrappers",
    "defensive.empty-catch",
    "defensive.error-swallowing",
    "defensive.error-obscuring",
    "defensive.async-noise",
    // Plugin rules (loaded via the `plugins.boundary` ref) — type-suppression flags
    // unsafe boundary casts + ts-suppression directives; gate-suppression flags skipped/
    // focused tests + blanket lint disables. Wiring asserted below.
    "boundary/type-suppression",
    "boundary/gate-suppression",
  ];

  it("template contains all 12 required rule keys", () => {
    const content = readTemplate("slop-scan.config.json");
    const data = JSON.parse(content) as { rules?: Record<string, { enabled?: boolean }> };
    const rules = data.rules ?? {};
    for (const key of REQUIRED_RULES) {
      expect(rules[key]).toBeDefined();
    }
  });

  it("all required rules have enabled: true", () => {
    const content = readTemplate("slop-scan.config.json");
    const data = JSON.parse(content) as { rules?: Record<string, { enabled?: boolean }> };
    const rules = data.rules ?? {};
    for (const key of REQUIRED_RULES) {
      expect(rules[key]?.enabled).toBe(true);
    }
  });

  it("comments.placeholder-comments has weight: 1.5", () => {
    const content = readTemplate("slop-scan.config.json");
    const data = JSON.parse(content) as {
      rules?: Record<string, { enabled?: boolean; weight?: number }>;
    };
    expect(data.rules?.["comments.placeholder-comments"]?.weight).toBe(1.5);
  });

  it("template has exactly 12 required rules (no extra bkit-mandated rules beyond the twelve)", () => {
    // This test documents the expected scope — if bkit adds a new required rule,
    // this test must be updated with the new rule's key.
    const content = readTemplate("slop-scan.config.json");
    const data = JSON.parse(content) as { rules?: Record<string, unknown> };
    const templateRuleKeys = Object.keys(data.rules ?? {});
    expect(templateRuleKeys.length).toBe(REQUIRED_RULES.length);
  });

  it("wires the boundary plugin so boundary/type-suppression can load (#263)", () => {
    // The rule is plugin-provided: without the plugins ref slop-scan throws on
    // load ("plugin not loaded"), wedging lint:slop. Guard rule+plugin together.
    const content = readTemplate("slop-scan.config.json");
    const data = JSON.parse(content) as { plugins?: Record<string, string> };
    expect(data.plugins?.boundary).toBe("./.bkit/scripts/bkit-slop-type-suppression.mjs");
  });
});

// ---------------------------------------------------------------------------
// .husky/pre-push and pre-commit are templates — no markers expected. They are
// full-file shell scripts the consumer owns.
// ---------------------------------------------------------------------------

describe("husky templates — no bkit markers in template content", () => {
  it(".husky/pre-push contains NO bkit:start/bkit:end markers", () => {
    const content = readTemplate(".husky/pre-push");
    expect(countMatches(content, /^# bkit:start$/m)).toBe(0);
    expect(countMatches(content, /^# bkit:end$/m)).toBe(0);
  });

  it(".husky/pre-commit contains NO bkit:start/bkit:end markers", () => {
    const content = readTemplate(".husky/pre-commit");
    expect(countMatches(content, /^# bkit:start$/m)).toBe(0);
    expect(countMatches(content, /^# bkit:end$/m)).toBe(0);
  });

  it(".husky/pre-push template still invokes pnpm at the script level", () => {
    const content = readTemplate(".husky/pre-push");
    expect(content).toContain("pnpm");
  });

  it(".husky/pre-commit template still invokes pnpm at the script level", () => {
    const content = readTemplate(".husky/pre-commit");
    expect(content).toContain("pnpm");
  });
});
