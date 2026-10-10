// audits/repo/dogfood-templates.test.ts — this repo adopts its own templates the way a consumer does.
//
// Every template (`isTemplate`) has an entry below. An adopted copy at the repo root must equal
// the template after applying that entry's edits, in order. Each edit is one of:
//   placeholder — a value `.bkit/templates.md` tells a consumer to fill;
//   adapt       — an adaptation `.bkit/templates.md` sanctions (app roots, rows, lanes, stubs);
//   bkit-only   — a need of this repo with no consumer equivalent.
// Any difference not listed here fails. Context-fetch files (`context/`) are pasted as blocks
// into `.agents/context.md`, not copied as files, so they have no entry.

import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";
import { isTemplate } from "../../install/modules/index";
import { listFilesRecursive, remapTemplateDest } from "../../commands/install/install";
import { getPkgRoot, getTemplatesRoot } from "../../shared/package-roots";

type Kind = "placeholder" | "adapt" | "bkit-only";

type Op =
  /** Exact text, replaced `count` times (default 1); the count must match. */
  | { fill: string; with: string; count?: number }
  /** A `      - name: <step>` workflow step with its trailing blank lines, `count` times. */
  | { dropStep: string; count?: number }
  /** A `# bkit-stub:<id> —` block, through the first blank line after its header. */
  | { dropStub: string }
  /**
   * Template text from `template[0]` (inclusive) up to `template[1]` (exclusive; null = end of
   * file) becomes the copy's text from `copy[0]` up to `copy[1]`. Equal template anchors mark an
   * insertion point.
   */
  | { region: { template: [string, string | null]; copy: [string, string | null] } };

type Edit = Op & { kind: Kind; what: string };

type Entry =
  | { status: "adopted"; edits: Edit[] }
  | { status: "not-adopted"; what: string }
  | { status: "generated"; what: string };

const identical: Entry = { status: "adopted", edits: [] };

const CI_UNIT_HEADER_TEMPLATE = `  # Unit lane. Parallel sibling of bkit-tests-static. Integration, E2E, deploy-await,
  # and remote db push move out of this job when you adopt the scaffold below.
  bkit-tests-unit:
    runs-on: ubuntu-latest
    # bkit-tests-check reads both: cache_skip (a SHA-cache short-circuit asserts no count)
    # and tests_ran (the executed-test count the Run Unit Tests step writes).
    outputs:
      cache_skip: \${{ steps.cache.outputs.skip }}
      tests_ran: \${{ steps.unit.outputs.ran }}
`;

const CI_UNIT_HEADER_COPY = `  # Unit lane. Parallel sibling of bkit-tests-static and bkit-tests-integration.
  bkit-tests-unit:
    needs: [bkit-tests-scope]
    if: fromJSON(needs.bkit-tests-scope.outputs.plan).run_level != 'none'
    runs-on: ubuntu-latest
    # Job-level permissions replace the workflow-level block: pull-requests: write posts
    # the coverage comment; actions: read keeps the SHA cache's \`gh run list\` working.
    permissions:
      actions: read
      contents: read
      pull-requests: write
    outputs:
      cache_skip: \${{ steps.cache.outputs.skip }}
      tests_ran: \${{ steps.vitest.outputs.ran }}
`;

const CHECKOUT =
  "      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1\n";

const ADOPTED: Record<string, Entry> = {
  ".github/workflows/ci.yml": {
    status: "adopted",
    edits: [
      {
        kind: "placeholder",
        what: "default branch",
        fill: "branches: [{{DEFAULT_BRANCH}}, dev]",
        with: "branches: [main, dev]",
        count: 2,
      },
      {
        kind: "adapt",
        what: "pull-requests: read for the planner",
        fill: "permissions:\n  actions: read\n  contents: read\n\n",
        with: "permissions:\n  actions: read\n  contents: read\n  # bkit-tests-scope reads repos/{repo}/commits/{sha}/pulls.\n  pull-requests: read\n\n",
      },
      {
        kind: "adapt",
        what: "bkit-tests-scope lane (single-package planner)",
        region: {
          template: ["  # ── bkit-tests-static", "  # ── bkit-tests-static"],
          copy: ["  # ── bkit-tests-scope", "  # ── bkit-tests-static"],
        },
      },
      {
        kind: "adapt",
        what: "static lane waits on the planner",
        fill: "  bkit-tests-static:\n    runs-on: ubuntu-latest\n",
        with: "  bkit-tests-static:\n    needs: [bkit-tests-scope]\n    if: fromJSON(needs.bkit-tests-scope.outputs.plan).run_level != 'none'\n    runs-on: ubuntu-latest\n",
      },
      {
        kind: "placeholder",
        what: "Node version from .nvmrc",
        fill: "node-version: {{NODE_VERSION}}\n",
        with: "node-version-file: .nvmrc\n",
        count: 2,
      },
      {
        kind: "adapt",
        what: "the planner reads the markers; no turbo",
        dropStep: "Detect Direct Push",
        count: 2,
      },
      { kind: "adapt", what: "no migrations", dropStub: "migrations-immutable" },
      { kind: "adapt", what: "no E2E", dropStub: "auto-force-e2e" },
      { kind: "adapt", what: "no database", dropStub: "supabase-migrate" },
      { kind: "adapt", what: "no database", dropStub: "test-db" },
      { kind: "adapt", what: "single package", dropStub: "test-presence" },
      {
        kind: "adapt",
        what: "unit tests with coverage (coverage stub enabled), bats (bkit-only), the bkit-tests-integration lane, a capstone that also asserts the planner and integration; other stubs and the scaffold reference dropped",
        region: {
          template: ["      - name: Run Unit Tests\n", null],
          copy: ["      # Unit coverage:", null],
        },
      },
      {
        kind: "adapt",
        what: "no turbo",
        fill: "        env:\n          TURBO_FORCE: ${{ steps.detect.outputs.turbo_force }}\n",
        with: "",
        count: 2,
      },
      {
        kind: "bkit-only",
        what: "dist freshness and status-hole steps",
        region: {
          template: ["  # ── bkit-tests-unit", "  # ── bkit-tests-unit"],
          copy: ["      # bkit repo only: dist/ is committed", "  # ── bkit-tests-unit"],
        },
      },
      {
        kind: "adapt",
        what: "unit lane waits on the planner and posts coverage",
        fill: CI_UNIT_HEADER_TEMPLATE,
        with: CI_UNIT_HEADER_COPY,
      },
      {
        kind: "adapt",
        what: "unit lane needs no full history without E2E / database stubs",
        fill: `${CHECKOUT}        with:\n          # Full history needed for E2E / supabase stubs when enabled.\n          fetch-depth: 0\n`,
        with: CHECKOUT,
      },
    ],
  },
  ".github/workflows/bkit-cloud.yml": {
    status: "adopted",
    edits: [
      {
        kind: "placeholder",
        what: "runner",
        fill: "runs-on: {{CLOUD_RUNNER}}",
        with: "runs-on: ubuntu-latest",
        count: 3,
      },
    ],
  },
  ".github/workflows/renovate.yml": identical,
  ".github/renovate.json5": {
    status: "adopted",
    edits: [
      {
        kind: "bkit-only",
        what: "vite and pnpm majors held",
        region: {
          template: ["  ],\n\n  // Where to send PRs.", "  ],\n\n  // Where to send PRs."],
          copy: [
            `\n    // ${"─".repeat(69)}\n    // bkit repo only`,
            "  ],\n\n  // Where to send PRs.",
          ],
        },
      },
    ],
  },
  ".github/dependabot.yml": { status: "not-adopted", what: "this repo uses Renovate" },
  ".husky/pre-commit": {
    status: "adopted",
    edits: [
      {
        kind: "bkit-only",
        what: "dist freshness on a staged .bkit/core/engine change",
        region: {
          template: ["pnpm bkit:gate:format\n", null],
          copy: ["pnpm bkit:gate:format\n", null],
        },
      },
    ],
  },
  ".husky/pre-push": {
    status: "adopted",
    edits: [
      {
        kind: "bkit-only",
        what: "dist freshness and actionlint",
        region: {
          template: ["pnpm bkit check < /dev/null\n", null],
          copy: ["pnpm bkit check < /dev/null\n", null],
        },
      },
    ],
  },
  ".prettierignore": {
    status: "adopted",
    edits: [
      {
        kind: "bkit-only",
        what: ".bkit/templates/ is this repo's source, so prettier checks it",
        region: { template: ["# bkit's reference copies", null], copy: ["", ""] },
      },
    ],
  },
  ".lintstagedrc.json": identical,
  ".vale.ini": {
    status: "adopted",
    edits: [
      {
        kind: "bkit-only",
        what: ".bkit/templates/ is this repo's source, so Vale lints it",
        region: { template: ["\n# bkit's reference copies", null], copy: ["", ""] },
      },
    ],
  },
  ".vale/styles/House/Filler.yml": identical,
  ".vale/styles/House/Hedging.yml": identical,
  ".vale/styles/House/LLMSlop.yml": identical,
  ".vale/styles/House/Verbose.yml": identical,
  "slop-scan.config.json": {
    status: "adopted",
    edits: [
      {
        kind: "bkit-only",
        what: ".bkit/templates/ is this repo's source, so slop-scan scans it",
        fill: ',\n    "**/.bkit/templates/**"\n',
        with: "\n",
      },
      {
        kind: "bkit-only",
        what: "the template sources of the shipped hooks share their mirrors' opt-outs",
        fill: '"files": [".opencode/plugin/gateguard.js"]',
        with: '"files": [".bkit/templates/.opencode/plugin/gateguard.js", ".opencode/plugin/gateguard.js"]',
      },
      {
        kind: "bkit-only",
        what: "the template sources of the shipped hooks share their mirrors' opt-outs",
        fill: '      "files": [\n        "**/.claude/hooks/gateguard.cjs",\n',
        with: '      "files": [\n        ".bkit/templates/.claude/hooks/gateguard.cjs",\n        ".bkit/templates/.cursor/hooks/gateguard.cjs",\n        ".bkit/templates/.codex/hooks/gateguard.cjs",\n        ".bkit/templates/.opencode/plugin/gateguard.js",\n        ".bkit/core/hook-parts/gateguard-engine.js",\n        ".bkit/core/hook-parts/gateguard-edit-payload.js",\n        "**/.claude/hooks/gateguard.cjs",\n',
      },
      {
        kind: "bkit-only",
        what: "the template sources of the shipped hooks share their mirrors' opt-outs",
        fill: '      "files": [\n        "**/.claude/hooks/guardrails.cjs",\n',
        with: '      "files": [\n        ".bkit/templates/.claude/hooks/guardrails.cjs",\n        ".bkit/templates/.cursor/hooks/guardrails.cjs",\n        ".bkit/templates/.codex/hooks/guardrails.cjs",\n        ".bkit/core/hook-parts/guardrails-shell.js",\n        ".bkit/core/hook-parts/guardrails-tiers.js",\n        "**/.claude/hooks/guardrails.cjs",\n',
      },
      {
        kind: "bkit-only",
        what: "per-file opt-outs for .bkit/core/engine",
        region: {
          template: ["\n  ]\n}\n", null],
          copy: [
            ',\n    {\n      "files": [".bkit/core/engine/audits/templates/slop-type-suppression.integration.test.ts"]',
            null,
          ],
        },
      },
    ],
  },
  ".envrc": {
    status: "adopted",
    edits: [
      {
        kind: "adapt",
        what: "GRAPHIFY_OUT (graphify section) and an unset key",
        region: {
          template: ["dotenv_if_exists .bkit/.env\n", null],
          copy: ["dotenv_if_exists .bkit/.env\n", null],
        },
      },
    ],
  },
  ".cursor/settings.json": identical,
  ".cursor/environment.json": identical,
  ".cursor/Dockerfile": identical,
  ".graphifyignore": {
    status: "adopted",
    edits: [
      {
        kind: "bkit-only",
        what: ".bkit/core/engine and .bkit/scripts are source; dist/ is committed",
        fill: ".agents/skills/\n.bkit/\n",
        with: ".agents/skills/\n# bkit repo only: .bkit/core/engine and .bkit/scripts are source; the install payload and\n# the committed compiler output stay out.\n.bkit/templates/\ndist/\n",
      },
    ],
  },
  ".serena/project.yml": {
    status: "adopted",
    edits: [
      { kind: "placeholder", what: "project name", fill: '"your-repo"', with: '"bkit"' },
      {
        kind: "bkit-only",
        what: ".bkit/core/engine and .bkit/scripts are source",
        fill: '  - ".bkit/**"\n',
        with: '  # bkit repo only: .bkit/core/engine and .bkit/scripts are source; the install payload stays out.\n  - ".bkit/templates/**"\n',
      },
      {
        kind: "adapt",
        what: "this repo's committed compiler output",
        fill: '  - "apps/mobile/dist-plugins/**"\n',
        with: '  - "dist/**"\n',
      },
    ],
  },
  "docs/capabilities.md": { status: "generated", what: "pnpm graph:rollup writes it" },
  "scripts/graphify/bkit-graph-drift-rules.json": {
    status: "adopted",
    edits: [
      {
        kind: "adapt",
        what: "this repo's capability rules",
        region: { template: ['  "rules": [\n', "  ]\n}\n"], copy: ['  "rules": [\n', "  ]\n}\n"] },
      },
    ],
  },
  "scripts/graphify/bkit-graph-external-rules.json": {
    status: "adopted",
    edits: [
      {
        kind: "adapt",
        what: "this repo's providers",
        region: {
          template: ['  "providers": [\n', "  ]\n}\n"],
          copy: ['  "providers": [\n', "  ]\n}\n"],
        },
      },
    ],
  },
  "scripts/graphify/bkit-graph-drift.py": {
    status: "adopted",
    edits: [
      {
        kind: "adapt",
        what: "source roots",
        fill: 'ROOTS = ("apps", "packages", "tooling", "scripts")',
        with: 'ROOTS = (".bkit/core/engine", ".bkit/scripts", "scripts")',
      },
    ],
  },
  "scripts/graphify/bkit-graph-eager.py": {
    status: "adopted",
    edits: [
      {
        kind: "adapt",
        what: "source roots",
        fill: 'ROOTS = ("apps", "packages")',
        with: 'ROOTS = (".bkit/core/engine", "scripts")',
      },
    ],
  },
  "scripts/graphify/bkit-graph-imports.py": {
    status: "adopted",
    edits: [
      {
        kind: "adapt",
        what: "source roots",
        fill: 'DEFAULT_ROOTS = ("apps", "packages")',
        with: 'DEFAULT_ROOTS = (".bkit/core/engine", "scripts")',
      },
    ],
  },
  "scripts/graphify/bkit-graphify-rollup.py": {
    status: "adopted",
    edits: [
      {
        kind: "adapt",
        what: "package boxes",
        fill: 'r"(apps/[^/]+|packages/[^/]+|tooling/[^/]+|scripts|supabase)", p)',
        with: 'r"(\\.bkit/[^/]+|scripts/[^/]+)/", p)',
      },
      {
        kind: "adapt",
        what: "one module per file in .bkit/core/engine",
        fill: "def by_module(p):\n",
        with: 'def by_module(p):\n    # .bkit/core/engine: one module per file.\n    if p.startswith(".bkit/core/engine/"):\n        return re.sub(r"\\.[^./]+$", "", p)\n',
      },
    ],
  },
  "scripts/graphify/bkit-graphify.sh": {
    status: "adopted",
    edits: [
      {
        kind: "adapt",
        what: "Mermaid edge weight for one module per file",
        fill: 'MMD_MIN_WEIGHT="${MMD_MIN_WEIGHT:-12}"',
        with: '# bkit repo: one module per .bkit/core/engine file, so the default is 6.\nMMD_MIN_WEIGHT="${MMD_MIN_WEIGHT:-6}"',
      },
    ],
  },
  "scripts/graphify/bkit-graph-eager-rules.json": identical,
  "scripts/graphify/bkit-graph-pre-push.sh": identical,
  "scripts/graphify/bkit-graph-repair.py": identical,
  "scripts/graphify/bkit-graph-surface.py": identical,
  "scripts/graphify/bkit-graphify-graphml.py": identical,
  "scripts/prettier/bkit-insert-ignore.mjs": identical,
  "scripts/secrets/bkit-secrets.mjs": identical,
  "scripts/secrets/bkit-secrets.config.mjs": {
    status: "adopted",
    edits: [
      {
        kind: "adapt",
        what: "sources: .bkit/.env only, no production surface",
        region: {
          template: ['    preview: "apps/web/.env.preview",\n', "    // `check` reference file."],
          copy: ['    preview: ".bkit/.env",\n', "    // `check` reference file."],
        },
      },
      {
        kind: "adapt",
        what: "stores: GitHub only",
        region: {
          template: ["    github: {},\n", "  },\n\n  // Never written"],
          copy: ["    github: {},\n", "  },\n\n  // Never written"],
        },
      },
      {
        kind: "adapt",
        what: "protected, optional and secret rows",
        region: {
          template: ["  protected: [", "\n  // One row per secret"],
          copy: ["  // CLAUDE_CODE_OAUTH_TOKEN", "\n  // One row per secret"],
        },
      },
      {
        kind: "adapt",
        what: "secret rows",
        region: {
          template: ["  secrets: {\n", "  },\n};\n"],
          copy: ["  secrets: {\n", "  },\n};\n"],
        },
      },
    ],
  },
  "scripts/serena/bkit-serena-mcp.sh": identical,
  "scripts/serena/bkit-serena.mcp.json": identical,
};

function countOf(text: string, needle: string): number {
  return needle === "" ? 0 : text.split(needle).length - 1;
}

// Text from `from` (inclusive) to `to` (exclusive; null = end), searched after `from`.
function span(text: string, from: string, to: string | null, label: string): [number, number] {
  expect(countOf(text, from), `${label}: anchor ${JSON.stringify(from)} once`).toBe(1);
  const start = text.indexOf(from);
  if (to === null) return [start, text.length];
  const end = text.indexOf(to, start);
  expect(end, `${label}: anchor ${JSON.stringify(to)} after ${JSON.stringify(from)}`).not.toBe(-1);
  return [start, end];
}

function apply(template: string, copy: string, edits: Edit[], rel: string): string {
  let text = template;
  for (const edit of edits) {
    const label = `${rel} — ${edit.what}`;
    if ("fill" in edit) {
      expect(countOf(text, edit.fill), `${label}: occurrences`).toBe(edit.count ?? 1);
      text = text.split(edit.fill).join(edit.with);
    } else if ("dropStep" in edit) {
      const name = edit.dropStep.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const step = new RegExp(`^      - name: ${name}\\n(?:(?: {8,}.*|)\\n)*`, "gm");
      expect(text.match(step)?.length ?? 0, `${label}: steps`).toBe(edit.count ?? 1);
      text = text.replace(step, "");
    } else if ("dropStub" in edit) {
      const stub = new RegExp(`^[ \\t]*# bkit-stub:${edit.dropStub} —.*\\n(?:.+\\n)*\\n`, "gm");
      expect(text.match(stub)?.length ?? 0, `${label}: stub blocks`).toBe(1);
      text = text.replace(stub, "");
    } else {
      const [ts, te] = span(text, edit.region.template[0], edit.region.template[1], label);
      const [cs, ce] =
        edit.region.copy[0] === "" ? [0, 0] : span(copy, ...edit.region.copy, `${label} (copy)`);
      text = text.slice(0, ts) + copy.slice(cs, ce) + text.slice(te);
    }
  }
  return text;
}

function templatePaths(): string[] {
  const root = getTemplatesRoot();
  return listFilesRecursive(root)
    .map((abs) => remapTemplateDest(path.relative(root, abs)).split(path.sep).join("/"))
    .filter((rel) => isTemplate(rel) && !rel.startsWith("context/"))
    .sort();
}

describe("this repo adopts its own templates", () => {
  const repo = getPkgRoot();
  const templatesRoot = getTemplatesRoot();

  it("every template has an entry, and every entry is a template", () => {
    expect(Object.keys(ADOPTED).sort()).toEqual(templatePaths());
  });

  it.each(Object.entries(ADOPTED))("%s", (rel, entry) => {
    const copyPath = path.join(repo, rel);
    if (entry.status === "not-adopted") {
      expect(fs.existsSync(copyPath), `${rel}: ${entry.what}`).toBe(false);
      return;
    }
    expect(fs.existsSync(copyPath), rel).toBe(true);
    if (entry.status === "generated") return;
    const template = fs.readFileSync(path.join(templatesRoot, rel), "utf-8");
    const copy = fs.readFileSync(copyPath, "utf-8");
    expect(copy).toBe(apply(template, copy, entry.edits, rel));
  });
});
