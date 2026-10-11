// audits/templates/templates.test.ts — Task 22 (BAR-167 Phase 2)
//
// Marker presence enforcement for the markdown files bkit writes from .bkit/templates/
// (Group A), content checks for templates bkit never writes (Group B: no markers), and
// slop-scan.config.json required-rules enumeration (JSON deep-containment, no markers).
//
// Group A files must contain the bkit:start / bkit:end markers so that the install pass
// can extract and manage the bkit-owned block.

import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";
import { extractManagedBlock } from "../../install/managed-block";

const TEMPLATES_ROOT = path.resolve(".bkit/templates");
const CORE_ROOT = path.resolve(".bkit/core");
const SHARED_ROOT = path.resolve(".bkit/shared");

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
    .readdirSync(path.join(CORE_ROOT, "docs", "templates"))
    .filter((name) => name.startsWith("bkit-audit-") && name.endsWith(".md"))
    .sort()
    .map((name) => path.posix.join("docs/templates", name));
}

const GROUP_A_MD_FILES: Array<[root: string, rel: string]> = [
  [CORE_ROOT, "AGENTS.md"],
  [SHARED_ROOT, "CLAUDE.md"],
  [CORE_ROOT, ".agents/rules.md"],
  [CORE_ROOT, ".agents/docs.md"],
  [CORE_ROOT, ".agents/skills.md"],
  [CORE_ROOT, "docs/templates/bkit-plan.md"],
  ...listAuditTemplates().map((rel): [string, string] => [CORE_ROOT, rel]),
];

const GROUP_A_MDC_FILES: Array<[root: string, rel: string]> = [
  [SHARED_ROOT, ".cursor/rules/bkit-rules.mdc"],
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
    const content = fs.readFileSync(path.join(CORE_ROOT, relPath), "utf-8");
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
      const template = fs.readFileSync(path.join(CORE_ROOT, relPath), "utf-8");
      const dogfood = fs.readFileSync(path.resolve(relPath), "utf-8");
      const stamp = dogfood.match(
        /^<!-- bkit:managed v\S+ — PolyForm Noncommercial 1\.0\.0 \/ Small Business 1\.0\.0 \(https:\/\/polyformproject\.org\/licenses\/\) — do not edit; run `bkit upgrade` to refresh -->$/m,
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
  for (const [root, relPath] of [...GROUP_A_MD_FILES, ...GROUP_A_MDC_FILES]) {
    const read = () => fs.readFileSync(path.join(root, relPath), "utf-8");
    it(`${relPath}: has exactly one <!-- bkit:start --> and one <!-- bkit:end -->`, () => {
      const content = read();
      expect(countMatches(content, /^<!-- bkit:start -->$/m)).toBe(1);
      expect(countMatches(content, /^<!-- bkit:end -->$/m)).toBe(1);
    });

    it(`${relPath}: bkit:start appears before bkit:end`, () => {
      const content = read();
      const startIdx = content.indexOf("<!-- bkit:start -->");
      const endIdx = content.indexOf("<!-- bkit:end -->");
      expect(startIdx).toBeGreaterThanOrEqual(0);
      expect(endIdx).toBeGreaterThan(startIdx);
    });

    it(`${relPath}: extractManagedBlock returns non-null non-empty content`, () => {
      const content = read();
      const block = extractManagedBlock(content, "html-comment");
      expect(block).not.toBeNull();
      expect(block!.length).toBeGreaterThan(0);
    });
  }
});

// ---------------------------------------------------------------------------
// Group B — templates bkit never writes (no markers; see audits/templates/templates-content.test.ts)
// ---------------------------------------------------------------------------

describe("Group B templates — bkit-ci.yml", () => {
  it("bkit-ci.yml bkit-tests-static job-level env carries the verbose-CI wiring", () => {
    const content = readTemplate(".github/workflows/bkit-ci.yml");
    const env = content.match(
      /^ {2}bkit-tests-static:\n[\s\S]*?^ {4}env:\n([\s\S]*?)^ {4}steps:/m,
    )?.[1];
    expect(env).toBeDefined();
    expect(env!).toContain("VERBOSE_CI");
    expect(env!).toContain("TURBO_LOG_LEVEL");
    expect(env!).not.toContain("BKIT_GH_TOKEN_INSTALL");
  });

  it("bkit-ci.yml install step runs a plain pnpm install (no GH Packages auth)", () => {
    const content = readTemplate(".github/workflows/bkit-ci.yml");
    expect(content).toContain("pnpm install --frozen-lockfile");
    expect(content).not.toMatch(/npm\.pkg\.github\.com/);
    expect(content).not.toContain("BKIT_GH_TOKEN_INSTALL");
  });
});

describe("Group B templates — .vale.ini", () => {
  it(".vale.ini sets StylesPath, Packages and MinAlertLevel and enables House on .agents/**", () => {
    const content = readTemplate(".vale.ini");
    expect(content).toContain("StylesPath");
    expect(content).toContain("Packages");
    expect(content).toContain("MinAlertLevel");
    expect(content).toMatch(/\[\.agents\/\*\*\]\nBasedOnStyles = House/);
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
    expect(data.plugins?.boundary).toBe("./scripts/slop/bkit-slop-type-suppression.mjs");
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
