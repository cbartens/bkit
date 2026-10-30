// audits/hooks/gateguard-dogfood.integration.test.ts — the bkit-repo-only authoring advisories.
//
// Every agent-read file gets the rules of each `.bkit/authoring.md` section whose scope
// line names it, read from `.bkit/core/.bkit/authoring.md` at hook time. A rule with a
// `Checked by:` line is left out, because its test enforces it.
//
// This region lives OUTSIDE the bkit:start/bkit:end markers in this repo's four
// installed hooks. Asserted:
//   1. it survives `bkit install` / `bkit upgrade` (outside the managed block), and
//   2. it NEVER reaches a consumer — no template may contain it, since
//      `.bkit/core/workflows/` and `.bkit/core/prompts/` exist only in this repo.
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { describe, expect, it } from "vitest";

const CLAUDE = path.resolve(".claude/hooks/bkit-gateguard.cjs");
const CURSOR = path.resolve(".cursor/hooks/bkit-gateguard.cjs");
const OPENCODE = path.resolve(".opencode/plugin/bkit-gateguard.js");
const CODEX = path.resolve(".codex/hooks/bkit-gateguard.cjs");
const INSTALLED = { claude: CLAUDE, cursor: CURSOR, opencode: OPENCODE, codex: CODEX };

const TEMPLATES = [
  ".bkit/core/.claude/hooks/bkit-gateguard.cjs",
  ".bkit/core/.cursor/hooks/bkit-gateguard.cjs",
  ".bkit/core/.opencode/plugin/bkit-gateguard.js",
  ".bkit/core/.codex/hooks/bkit-gateguard.cjs",
];

let n = 0;
function session(): string {
  n += 1;
  return `dogfood-${process.pid}-${n}-${Math.random().toString(36).slice(2)}`;
}

function claudeAdvisory(file: string): string {
  const res = spawnSync("node", [CLAUDE], {
    input: JSON.stringify({
      tool_name: "Edit",
      tool_input: { file_path: file },
      session_id: session(),
    }),
    encoding: "utf-8",
  });
  const out = res.stdout.trim() ? JSON.parse(res.stdout.trim()) : {};
  return String(out.hookSpecificOutput?.additionalContext ?? "");
}

function cursorAdvisory(file: string): string {
  const res = spawnSync("node", [CURSOR], {
    input: JSON.stringify({
      tool_name: "Write",
      tool_input: { file_path: file },
      session_id: session(),
      workspace_roots: [process.cwd()],
    }),
    encoding: "utf-8",
  });
  const out = res.stdout.trim() ? JSON.parse(res.stdout.trim()) : {};
  return String(out.additional_context ?? "");
}

function codexAdvisory(file: string): string {
  const res = spawnSync("node", [CODEX], {
    input: JSON.stringify({
      tool_name: "apply_patch",
      tool_input: {
        command: `*** Begin Patch\n*** Update File: ${file}\n@@\n-a\n+b\n*** End Patch`,
      },
      session_id: session(),
      cwd: process.cwd(),
    }),
    encoding: "utf-8",
  });
  const out = res.stdout.trim() ? JSON.parse(res.stdout.trim()) : {};
  return String(out.hookSpecificOutput?.additionalContext ?? "");
}

function opencodeAdvisory(file: string): string {
  // The plugin is an ES module whose advisory rides the tool result: run it in a child
  // that drives execute.before (block/allow), then execute.after with a fresh result,
  // and prints the text the after hook appended to `result.content`. Driven as OpenCode
  // 2.0 does. (A deny-mode throw is printed instead, matching the host's error channel.)
  const code = [
    `const { default: plugin } = await import(${JSON.stringify(pathToFileURL(OPENCODE).href)});`,
    `const hooks = {};`,
    `await plugin.setup({ tool: { hook: async (n, f) => { hooks[n] = f; } } });`,
    `const event = { tool: "edit", sessionID: ${JSON.stringify(session())}, input: { path: ${JSON.stringify(file)} } };`,
    `const result = { content: [] };`,
    `try { if (hooks["execute.before"]) await hooks["execute.before"](event); } catch (e) { process.stdout.write(String((e && e.message) || e)); process.exit(0); }`,
    `if (hooks["execute.after"]) await hooks["execute.after"]({ ...event, status: "completed", result });`,
    `process.stdout.write(result.content.map((p) => p.text).join(""));`,
  ].join("\n");
  const res = spawnSync("node", ["--input-type=module", "-e", code], { encoding: "utf-8" });
  return res.stdout;
}

const RUNNERS: Record<string, (f: string) => string> = {
  claude: claudeAdvisory,
  cursor: cursorAdvisory,
  codex: codexAdvisory,
  opencode: opencodeAdvisory,
};

const AUTHORING_SOURCE = ".bkit/core/.bkit/authoring.md";
const REPO_AUTHORING =
  "- `.agents/rules.md` § Repo Authoring applies: authoring rules, index update in the same change.";
const FOOTER = "Advisory: proceed once satisfied.";

interface Rule {
  /** The advisory bullet: `- Lead: text`. */
  bullet: string;
  checkedBy: string | null;
}

/** Each `- **Lead:** text` rule of `.bkit/core/.bkit/authoring.md` § `heading`, with its `Checked by:` text. */
function sectionRules(heading: string): Rule[] {
  const lines = fs.readFileSync(AUTHORING_SOURCE, "utf-8").split("\n");
  const start = lines.indexOf(`## ${heading}`);
  expect(start, heading).toBeGreaterThanOrEqual(0);
  const rules: Rule[] = [];
  let current: Rule | null = null;
  for (const line of lines.slice(start + 1)) {
    if (line.startsWith("## ")) break;
    const lead = /^- \*\*([^*]+):\*\* (.*)$/.exec(line);
    const checked = /^\s+- Checked by: (.*)$/.exec(line);
    if (lead) {
      current = { bullet: `- ${lead[1]}: ${lead[2]}`, checkedBy: null };
      rules.push(current);
    } else if (checked && current) current.checkedBy = checked[1]!;
    else if (/^\S/.test(line)) current = null;
  }
  return rules;
}

const SECTIONS = [
  "All Agent-Read Files",
  "Docs",
  "Prompts and Workflows",
  "Output Formatting",
  "Prompts Only",
  "Doc Templates",
  "Workflows Only",
];

// One route per kind of agent-read file, with the sections whose scope line names it.
const ROUTES = [
  {
    label: ".bkit/core/workflows/*.md",
    files: [".bkit/core/workflows/bkit-build.md"],
    sections: [
      "All Agent-Read Files",
      "Prompts and Workflows",
      "Output Formatting",
      "Workflows Only",
    ],
  },
  {
    label: ".bkit/core/prompts/*.md",
    files: [".bkit/core/prompts/bkit-plan-generate.md"],
    sections: [
      "All Agent-Read Files",
      "Prompts and Workflows",
      "Output Formatting",
      "Prompts Only",
    ],
  },
  {
    label: "doc template",
    files: [".bkit/core/docs/templates/bkit-plan.md", "docs/templates/bkit-plan.md"],
    sections: ["All Agent-Read Files", "Output Formatting", "Doc Templates"],
  },
  {
    // The rule docs themselves (`.bkit/workflows.md`, `.bkit/prompts.md`, `.bkit/authoring.md`)
    // are docs, not the files their rules govern.
    label: "doc",
    files: [
      ".agents/rules.md",
      ".bkit/core/.agents/skills.md",
      ".bkit/workflows.md",
      ".bkit/prompts.md",
      ".bkit/authoring.md",
      ".bkit/core/.bkit/providers.md",
      "docs/testing.md",
      ".bkit/shared/docs/testing.md",
    ],
    sections: ["All Agent-Read Files", "Docs"],
  },
  {
    label: "agent-read file",
    files: [
      "docs/plans/202605/x-plan.md",
      ".bkit/shared/CLAUDE.md",
      "AGENTS.md",
      "CLAUDE.md",
      "GEMINI.md",
    ],
    sections: ["All Agent-Read Files"],
  },
];

const NOT_AGENT_READ = [
  "src/foo.ts",
  "README.md",
  ".bkit/version",
  ".bkit/core/engine/commands/install/install.ts",
  ".bkit/core/workflows/notes.txt",
  "docs/decisions.jsonl",
];

const header = (label: string) => `[bkit GateGuard] ${label} authoring:`;

describe("dogfood authoring advisories — each file gets the sections whose scope names it", () => {
  for (const [host, run] of Object.entries(RUNNERS)) {
    for (const route of ROUTES) {
      it(`${host}: ${route.label} gets § ${route.sections.join(", § ")}`, () => {
        const included = route.sections.flatMap(sectionRules);
        const quoted = included.filter((r) => !r.checkedBy);
        const left = included.filter((r) => r.checkedBy);
        const carried = new Set(included.map((r) => r.bullet));
        const excluded = SECTIONS.filter((s) => !route.sections.includes(s))
          .flatMap(sectionRules)
          .filter((r) => !carried.has(r.bullet));
        for (const f of route.files) {
          const a = run(f);
          expect(a, f).toContain(header(route.label));
          for (const other of ROUTES.filter((r) => r !== route)) {
            expect(a, f).not.toContain(header(other.label));
          }
          for (const r of quoted) expect(a, f).toContain(r.bullet);
          for (const r of left) expect(a, `${f} :: checked`).not.toContain(r.bullet);
          for (const r of excluded) expect(a, `${f} :: excluded`).not.toContain(r.bullet);
          expect(a, f).not.toContain("unreadable here");
          expect(a, f).toContain(REPO_AUTHORING);
          expect(a, f).toContain(FOOTER);
        }
      });
    }

    it(`${host}: files no agent reads get no authoring advisory`, () => {
      for (const f of NOT_AGENT_READ) {
        const a = run(f);
        for (const route of ROUTES) expect(a, f).not.toContain(header(route.label));
        expect(a, f).not.toContain(REPO_AUTHORING);
      }
    });
  }

  it("every Checked by: line names a test file that exists", () => {
    const checked = SECTIONS.flatMap(sectionRules).filter((r) => r.checkedBy);
    expect(checked.length).toBeGreaterThan(0);
    for (const r of checked) {
      const files = [...r.checkedBy!.matchAll(/`([^`]+\.test\.ts)`/g)].map((m) => m[1]!);
      expect(files.length, r.bullet).toBeGreaterThan(0);
      for (const file of files) expect(fs.existsSync(file), `${r.bullet} -> ${file}`).toBe(true);
    }
  });

  it("a hook that cannot read the doc still fires, naming where to read each section", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "gg-dogfood-"));
    try {
      const hook = path.join(tmp, ".claude", "hooks", "bkit-gateguard.cjs");
      fs.mkdirSync(path.dirname(hook), { recursive: true });
      fs.copyFileSync(CLAUDE, hook);
      const res = spawnSync("node", [hook], {
        input: JSON.stringify({
          tool_name: "Edit",
          tool_input: { file_path: ".bkit/core/prompts/x.md" },
          session_id: session(),
        }),
        encoding: "utf-8",
      });
      expect(res.status).toBe(0);
      const advisory = String(JSON.parse(res.stdout).hookSpecificOutput.additionalContext);
      for (const s of ROUTES[1]!.sections) {
        expect(advisory).toContain(
          `- § ${s}: unreadable here; read \`.bkit/authoring.md\` § ${s}.`,
        );
      }
      expect(advisory).toContain(REPO_AUTHORING);
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });
});

describe("dogfood region — placement guarantees", () => {
  const REGION_SYMBOLS = [
    "isBkitWorkflowPath",
    "isBkitPromptPath",
    "isDocTemplatePath",
    "isBkitDocPath",
    "isAgentReadPath",
    "authoringRules",
    "AUTHORING_KINDS",
    "dogfoodAuthoringAdvisory",
  ];

  for (const [host, file] of Object.entries(INSTALLED)) {
    it(`${host}: the region sits AFTER bkit:end, so install/upgrade cannot overwrite it`, () => {
      const src = fs.readFileSync(file, "utf-8");
      const end = src.indexOf("// bkit:end");
      const region = src.indexOf("DOGFOOD ONLY");
      expect(end).toBeGreaterThanOrEqual(0);
      expect(region).toBeGreaterThan(end);
    });

    it(`${host}: the path predicates, rule reader and dispatcher are present`, () => {
      const src = fs.readFileSync(file, "utf-8");
      for (const sym of REGION_SYMBOLS) expect(src).toContain(sym);
    });
  }

  it("the dogfood region calls NOTHING from inside the managed block", () => {
    // Strict separation: the region must keep working whatever changes inside the
    // markers, so it carries its own predicates and its own advisory text.
    const BLOCK_SYMBOLS = [
      "docAuthoringAdvisory(",
      "isDocsPath(",
      "isGateConfig(",
      "investigationChecklist(",
      "reuseChecklist(",
      "configAdvisory(",
    ];
    for (const file of Object.values(INSTALLED)) {
      const src = fs.readFileSync(file, "utf-8");
      const region = src.slice(src.indexOf("// DOGFOOD ONLY"));
      const code = region
        .split("\n")
        .filter((l) => !l.trim().startsWith("//"))
        .join("\n");
      for (const sym of BLOCK_SYMBOLS) {
        expect(code, `${file} :: ${sym}`).not.toContain(sym);
      }
    }
  });

  it("the four installed copies carry byte-identical dogfood regions", () => {
    const region = (f: string) => {
      const s = fs.readFileSync(f, "utf-8");
      return s.slice(s.indexOf("// DOGFOOD ONLY"), s.indexOf("function dogfoodAuthoringAdvisory"));
    };
    expect(region(CURSOR)).toBe(region(CLAUDE));
    expect(region(OPENCODE)).toBe(region(CLAUDE));
    expect(region(CODEX)).toBe(region(CLAUDE));
  });

  it("NO template contains it — it must never reach a consumer install", () => {
    for (const t of TEMPLATES) {
      const src = fs.readFileSync(t, "utf-8");
      expect(src).not.toContain("DOGFOOD ONLY");
      for (const sym of REGION_SYMBOLS) expect(src, `${t} :: ${sym}`).not.toContain(sym);
    }
  });
});

describe("dogfood advisories — .agents/rules.md § Repo Authoring", () => {
  it("every file and section the Repo Authoring rules name exists", () => {
    const rules = fs.readFileSync(".agents/rules.md", "utf-8");
    expect(rules).toContain("#### Repo Authoring");
    const authoring = fs.readFileSync(AUTHORING_SOURCE, "utf-8");
    expect(rules).toContain("`.bkit/authoring.md` § ");
    for (const heading of [
      "All Agent-Read Files",
      "Docs",
      "Prompts and Workflows",
      "Prompts Only",
      "Workflows Only",
    ]) {
      expect(rules).toContain(`§ ${heading}`);
      expect(authoring).toContain(`\n## ${heading}\n`);
    }
  });
});
