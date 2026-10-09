// bkit-gateguard-dogfood.integration.test.ts — the bkit-repo-only authoring advisories.
//
// `.bkit/workflows/*.md` and `.bkit/prompts/*.md` have authoring rules that keep
// getting ignored (see the sections in `.bkit/workflows.md` and `.bkit/prompts.md`).
// The hooks fire a path-scoped advisory at the moment of the edit, which a test
// cannot do — a test only complains afterwards.
//
// This region lives OUTSIDE the bkit:start/bkit:end markers in this repo's four
// installed hooks. It must therefore satisfy two opposite guarantees, both asserted
// here because nothing else can:
//   1. it survives `bkit install` / `bkit upgrade` (outside the managed block), and
//   2. it NEVER reaches a consumer — no template may contain it, since
//      `.bkit/workflows/` and `.bkit/prompts/` exist only in this repo.
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { describe, expect, it } from "vitest";

const CLAUDE = path.resolve(".claude/hooks/gateguard.cjs");
const CURSOR = path.resolve(".cursor/hooks/gateguard.cjs");
const OPENCODE = path.resolve(".opencode/plugin/gateguard.js");
const CODEX = path.resolve(".codex/hooks/gateguard.cjs");
const INSTALLED = { claude: CLAUDE, cursor: CURSOR, opencode: OPENCODE, codex: CODEX };

const TEMPLATES = [
  ".bkit/templates/.claude/hooks/gateguard.cjs",
  ".bkit/templates/.cursor/hooks/gateguard.cjs",
  ".bkit/templates/.opencode/plugin/gateguard.js",
  ".bkit/templates/.codex/hooks/gateguard.cjs",
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
  // The plugin is an ES module whose advisory channel is stderr: run it in a child
  // that captures stderr and prints it to stdout.
  const code = [
    `const { default: plugin } = await import(${JSON.stringify(pathToFileURL(OPENCODE).href)});`,
    `let out = "";`,
    `process.stderr.write = (s) => { out += s; return true; };`,
    `await plugin({})["tool.execute.before"]({ tool: "edit", sessionID: ${JSON.stringify(session())} }, { args: { path: ${JSON.stringify(file)} } });`,
    `process.stdout.write(out);`,
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

describe("dogfood authoring advisories — fire on the right paths", () => {
  for (const [host, run] of Object.entries(RUNNERS)) {
    it(`${host}: a .bkit/workflows/ file gets the workflow advisory`, () => {
      const a = run(".bkit/workflows/bkit-build.md");
      expect(a).toContain(".bkit/workflows/*.md authoring");
      expect(a).toContain("Cross-workflow alignment");
      expect(a).not.toContain(".bkit/prompts/*.md authoring");
    });

    it(`${host}: a .bkit/prompts/ file gets the prompt advisory`, () => {
      const a = run(".bkit/prompts/bkit-plan-generate.md");
      expect(a).toContain(".bkit/prompts/*.md authoring");
      expect(a).toContain("Cross-prompt alignment");
      expect(a).not.toContain(".bkit/workflows/*.md authoring");
    });

    it(`${host}: the rule files themselves get neither`, () => {
      // The trailing slash in the `.bkit/workflows/` prefix is what excludes
      // `.bkit/workflows.md` — the doc that STATES the rules is not authored under them.
      // They now DO get the bkit doc advisory — they are bkit docs. What they must
      // never get is the execution-surface advisory: the file STATING the rules is
      // not itself authored under them. The trailing slash in the prefix is what
      // separates `.bkit/workflows.md` from `.bkit/workflows/`.
      for (const f of [".bkit/workflows.md", ".bkit/prompts.md"]) {
        const a = run(f);
        expect(a, f).not.toContain(".bkit/workflows/*.md authoring");
        expect(a, f).not.toContain(".bkit/prompts/*.md authoring");
      }
    });

    it(`${host}: unrelated paths get neither`, () => {
      for (const f of ["src/foo.ts", "docs/architecture.md", ".bkit/src/bkit-install.ts"]) {
        const a = run(f);
        expect(a).not.toContain(".bkit/workflows/*.md authoring");
        expect(a).not.toContain(".bkit/prompts/*.md authoring");
      }
    });

    it(`${host}: a non-.md file under those dirs gets neither`, () => {
      expect(run(".bkit/workflows/notes.txt")).not.toContain("authoring:");
    });
  }
});

describe("dogfood advisory — bkit's own .md docs", () => {
  // `.bkit/**` and `.agents/**` markdown carries the same header contract as
  // `docs/**`, but `isDocsPath` does not reach it, so the shipped advisory never
  // fires there. The dogfood region widens the path set and reuses the same text.
  const HITS = [
    ".bkit/providers.md",
    ".bkit/workflows.md",
    ".agents/rules.md",
    ".agents/docs.md",
    ".bkit/templates/.agents/skills.md",
    ".bkit/templates/CLAUDE.md",
  ];

  for (const host of Object.keys(RUNNERS)) {
    it(`${host}: bkit and .agents markdown gets the doc advisory, relabelled`, () => {
      for (const f of HITS) {
        const a = RUNNERS[host]!(f);
        expect(a, f).toContain("bkit `.md` doc authoring");
        expect(a, f).toContain("Use dense token-efficient phrasing");
      }
    });

    it(`${host}: docs/** keeps the shipped label, never the dogfood one`, () => {
      for (const f of ["docs/architecture.md", ".bkit/templates/docs/testing.md"]) {
        const a = RUNNERS[host]!(f);
        expect(a, f).toContain("docs/*.md authoring");
        expect(a, f).not.toContain("bkit `.md` doc authoring");
      }
    });

    it(`${host}: the execution surfaces keep their own advisory, no double-fire`, () => {
      for (const f of [".bkit/workflows/bkit-build.md", ".bkit/prompts/bkit-plan-generate.md"]) {
        expect(RUNNERS[host]!(f), f).not.toContain("bkit `.md` doc authoring");
      }
    });

    it(`${host}: non-markdown under .bkit/ gets nothing`, () => {
      for (const f of [".bkit/src/bkit-install.ts", ".bkit/version"]) {
        expect(RUNNERS[host]!(f), f).not.toContain("bkit `.md` doc authoring");
      }
    });
  }
});

describe("dogfood region — placement guarantees", () => {
  for (const [host, file] of Object.entries(INSTALLED)) {
    it(`${host}: the region sits AFTER bkit:end, so install/upgrade cannot overwrite it`, () => {
      const src = fs.readFileSync(file, "utf-8");
      const end = src.indexOf("// bkit:end");
      const region = src.indexOf("DOGFOOD ONLY");
      expect(end).toBeGreaterThanOrEqual(0);
      expect(region).toBeGreaterThan(end);
    });

    it(`${host}: both advisory builders and the dispatcher are present`, () => {
      const src = fs.readFileSync(file, "utf-8");
      for (const sym of [
        "isBkitWorkflowPath",
        "isBkitPromptPath",
        "isBkitDocPath",
        "bkitDocAuthoringAdvisory",
        "workflowAuthoringAdvisory",
        "promptAuthoringAdvisory",
        "dogfoodAuthoringAdvisory",
      ]) {
        expect(src).toContain(sym);
      }
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

  it("the copied doc-advisory text still agrees with the shipped one", () => {
    // bkitDocAuthoringAdvisory is a deliberate COPY of docAuthoringAdvisory, so the
    // two can drift. They may differ only in the header label.
    const src = fs.readFileSync(CLAUDE, "utf-8");
    const bullets = (fn: string) => {
      const from = src.indexOf(`function ${fn}()`);
      expect(from, fn).toBeGreaterThanOrEqual(0);
      const body = src.slice(from, src.indexOf("\n}", from));
      return body
        .split("\n")
        .filter((l) => l.includes('"- ') || l.includes("`- "))
        .map((l) => l.trim().replace(/^[`"]|[`"] \+$/g, ""));
    };
    // One deliberate omission: `.agents/docs.md` indexes `docs/` and `.agents/` for a
    // consumer repo. bkit's own reference docs under `.bkit/` are not in that index,
    // so "check the index first" is guidance the reader cannot act on.
    const OMITTED = [
      "- Check .agents/docs.md index first and confirm topic belongs in THIS doc, not another.\\n",
    ];
    const shipped = bullets("docAuthoringAdvisory").filter((b) => !OMITTED.includes(b));
    expect(bullets("bkitDocAuthoringAdvisory")).toEqual(shipped);
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
    // `.bkit/workflows/` and `.bkit/prompts/` do not exist outside this repo, so a
    // consumer would get an advisory naming directories they do not have.
    for (const t of TEMPLATES) {
      const src = fs.readFileSync(t, "utf-8");
      expect(src).not.toContain("DOGFOOD ONLY");
      expect(src).not.toContain("isBkitWorkflowPath");
      expect(src).not.toContain("isBkitDocPath");
      expect(src).not.toContain("bkitDocAuthoringAdvisory");
      expect(src).not.toContain("dogfoodAuthoringAdvisory");
    }
  });
});

describe("dogfood advisories — carry EVERY rule from their source section", () => {
  // The advisories used to quote three bullets and point at the section "for the
  // rest", which is why the rules kept getting ignored: the pointer is a second
  // fetch the agent never makes. Every rule now travels in the advisory itself, and
  // these tests fail if a rule is added upstream without being carried across.
  function sectionLeads(doc: string, heading: string): string[] {
    const src = fs.readFileSync(doc, "utf-8");
    const start = src.indexOf(`## ${heading}`);
    expect(start).toBeGreaterThanOrEqual(0);
    const rest = src.slice(start + heading.length);
    const end = rest.indexOf("\n## ");
    const body = end >= 0 ? rest.slice(0, end) : rest;
    // Depth 0 and 1 only. The doc re-parents rules under the advisory's five leads,
    // so a rule one level deep is still a rule; depth 2+ is worked examples of the
    // rule above it (the three Output-section-shape cases), not separate rules.
    return [...body.matchAll(/^ {0,2}- \*\*(.+?):?\*\*/gm)]
      .map((m) => m[1]!.replace(/:$/, ""))
      .filter((lead) => !NOT_A_RULE.has(lead));
  }

  // Compare on words only: the advisory backticks field names the doc leaves bare
  // (`Context:`, `Lens:`), which is formatting, not a different rule.
  const words = (s: string) =>
    s
      .replace(/`/g, "")
      .replace(/[^a-z0-9 ]/gi, " ")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();

  // Rules a test already enforces are deliberately NOT in the advisory: a test is a
  // harder gate than a nudge and costs no tokens per edit. Each exemption names the
  // test that replaces it, and the test file must exist — delete the test and this
  // fails, so a rule can never fall through the gap between the two.
  const ENFORCED_BY: Record<string, string> = {
    "No internal labels, no coined guard names": "bkit-shipped-docs-refs.test.ts",
    "Untrusted content is fenced at the write": "bkit-untrusted-fence.test.ts",
    "Variable references": "bkit-block-locality-audit.test.ts",
    "No step numbers": "bkit-shipped-docs-refs.test.ts",
    // the same test encodes the exclusion twice: FENCED_WORKFLOWS lists only
    // bkit-debug.md, and UNTRUSTED_ARTIFACTS excludes tracker dumps by lookahead
    "Tracker content is NOT fenced": "bkit-untrusted-fence.test.ts",
    // dropped from the advisory, so the invariant moved into a test instead of
    // vanishing: source prompts must carry no bkit:managed marker
    "Managed-version marker": "bkit-prompt-notation.test.ts",
  };

  it("every exempted rule's enforcing test still exists", () => {
    for (const [rule, testFile] of Object.entries(ENFORCED_BY)) {
      expect(fs.existsSync(path.join(".bkit/src", testFile)), `${rule} -> ${testFile}`).toBe(true);
    }
  });

  // Rules the master rule subsumes: `grep` the corpus and copy the closest case and
  // you get these right, because the corpus SHOWS them. What copying cannot show you
  // is an absence ("never bold for emphasis" — emphasis-bold is not there to see) or
  // a threshold ("2+ branches switch shape" — you copy whichever example you landed
  // on). Those stay named in the advisory; these do not.
  const SUBSUMED_BY_MASTER = new Set([
    "Procedural conditionals",
    "Gate items",
    "Sibling-blind subagent Context",
    "Generic Role, specific Process",
    // named as dimensions in the master rule's copy-these list, which turns each
    // from an absence you cannot see into a lookup against the existing cases
    "Bold is structural",
    "Bold in body",
    "ASCII operators",
    "Slash separator",
    "Output Lens line",
    // a sibling prompt shows the Contract clauses and Read-path inputs; copying one
    // yields a standalone-runnable prompt
    "Standalone-runnable",
    // the master rule names "output format blocks" as a repeated section to copy
    "Output section shape",
  ]);

  // One lead is deliberately reworded. Recorded with its reason, so a rule added
  // upstream without being carried across still fails.
  const ALIASES: Record<string, string> = {
    // "here" means the doc you are reading; an advisory has to name the file.
    "Rationale lives here": "commentary lives in",
    // Promoted to the advisory's MASTER rule: the corpus is its own template, and
    // every shape rule below it (bold, conditionals, ASCII operators, gate items,
    // slash separator, output shape) is an example of following it.
    "Reuse wording and formatting": "copy shapes verbatim",
    // the master rule states the threshold in the singular
    "Labeled decision blocks": "labeled decision",
    // the advisory reads only the parent Self-contained line, which carries this
    // sub-rule as its supplied-template exception
    "Template owns its rules": "carry their own rules",
  };

  // Navigational headings and illustrations the doc adds for readers. They carry no
  // rule of their own, so the advisory has nothing to carry across.
  const NOT_A_RULE = new Set(["Banned shapes", "External content handling", "Enforced elsewhere"]);

  const cases = [
    {
      host: ".bkit/workflows/bkit-build.md",
      doc: ".bkit/workflows.md",
      heading: "Workflow Authoring Rules",
    },
    {
      host: ".bkit/prompts/bkit-plan-generate.md",
      doc: ".bkit/prompts.md",
      heading: "Prompt Authoring Rules",
    },
  ];

  for (const c of cases) {
    it(`${c.doc}: every § ${c.heading} rule appears in the advisory`, () => {
      const advisory = claudeAdvisory(c.host);
      const haystack = words(advisory);
      const missing = sectionLeads(c.doc, c.heading)
        .filter((lead) => !(lead in ENFORCED_BY))
        .filter((lead) => !SUBSUMED_BY_MASTER.has(lead))
        .filter((lead) => {
          const needle = ALIASES[lead] ?? lead.split(/[,(]/)[0]!.trim();
          return !haystack.includes(words(needle));
        });
      expect(missing).toEqual([]);
    });

    it(`${c.doc}: the advisory does NOT defer to the section`, () => {
      const advisory = claudeAdvisory(c.host);
      expect(advisory).not.toContain("for the rest");
      expect(advisory).not.toContain("See .bkit/");
    });
  }

  it("both advisories carry the cost reminder and the advisory footer", () => {
    for (const f of [".bkit/workflows/bkit-build.md", ".bkit/prompts/bkit-plan-generate.md"]) {
      const a = claudeAdvisory(f);
      expect(a).toContain("Every byte is paid on every run");
      expect(a).toContain("Advisory — proceed once satisfied.");
    }
  });
});

describe("dogfood advisories — shared rules read from their section at hook time", () => {
  const SHARED = [
    {
      host: ".bkit/workflows/bkit-build.md",
      doc: ".bkit/workflows.md",
      leads: [
        "Dense instructions only",
        "Cross-workflow alignment",
        "Self-contained",
        "Removal = delete",
      ],
    },
    {
      host: ".bkit/prompts/bkit-plan-generate.md",
      doc: ".bkit/prompts.md",
      leads: [
        "Dense instructions only",
        "Cross-prompt alignment",
        "Self-contained",
        "Removal = delete",
      ],
    },
  ];

  for (const c of SHARED) {
    for (const [host, run] of Object.entries(RUNNERS)) {
      it(`${host}: ${c.host} carries each shared rule exactly as ${c.doc} states it`, () => {
        const advisory = run(c.host);
        const src = fs.readFileSync(c.doc, "utf-8");
        for (const lead of c.leads) {
          const prefix = `- **${lead}:** `;
          const line = src.split("\n").find((l) => l.startsWith(prefix));
          expect(line, `${c.doc} :: ${lead}`).toBeTruthy();
          expect(advisory, lead).toContain(`- ${lead}: ${line!.slice(prefix.length)}`);
        }
      });
    }
  }

  it("a hook that cannot read the doc still fires, naming where to read the rule", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "gg-dogfood-"));
    try {
      const hook = path.join(tmp, ".claude", "hooks", "gateguard.cjs");
      fs.mkdirSync(path.dirname(hook), { recursive: true });
      fs.copyFileSync(CLAUDE, hook);
      const res = spawnSync("node", [hook], {
        input: JSON.stringify({
          tool_name: "Edit",
          tool_input: { file_path: ".bkit/prompts/x.md" },
          session_id: session(),
        }),
        encoding: "utf-8",
      });
      expect(res.status).toBe(0);
      const advisory = String(JSON.parse(res.stdout).hookSpecificOutput.additionalContext);
      expect(advisory).toContain(
        "- Self-contained: unreadable here; read `.bkit/prompts.md` § Prompt Authoring Rules.",
      );
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });
});

describe("dogfood advisories — .agents/rules.md § Repo Authoring", () => {
  const REPO_AUTHORING = "`.agents/rules.md` § Repo Authoring applies";

  for (const [host, run] of Object.entries(RUNNERS)) {
    it(`${host}: every Prose edits path gets the prose advisory`, () => {
      for (const f of [
        ".agents/rules.md",
        ".bkit/README.md",
        "docs/testing.md",
        "docs/plans/202605/x-plan.md",
        ".bkit/templates/docs/testing.md",
        "AGENTS.md",
        "CLAUDE.md",
      ]) {
        expect(run(f), f).toContain("[bkit GateGuard] prose authoring:");
      }
    });

    it(`${host}: workflow and prompt advisories carry the reference inline, no second block`, () => {
      for (const f of [".bkit/workflows/bkit-build.md", ".bkit/prompts/bkit-plan-generate.md"]) {
        const a = run(f);
        expect(a, f).toContain(REPO_AUTHORING);
        expect(a, f).not.toContain("prose authoring:");
      }
    });

    it(`${host}: non-markdown gets no prose advisory`, () => {
      for (const f of ["src/foo.ts", ".bkit/version", "docs/decisions.jsonl"]) {
        expect(run(f), f).not.toContain(REPO_AUTHORING);
      }
    });
  }

  it("every file and section the Repo Authoring rules name exists", () => {
    const rules = fs.readFileSync(".agents/rules.md", "utf-8");
    expect(rules).toContain("#### Repo Authoring");
    for (const [doc, heading] of [
      [".bkit/workflows.md", "Workflow Authoring Rules"],
      [".bkit/prompts.md", "Prompt Authoring Rules"],
    ]) {
      expect(rules).toContain(`\`${doc}\` § ${heading}`);
      expect(fs.readFileSync(doc!, "utf-8")).toContain(`\n## ${heading}\n`);
    }
    const compress = ".bkit/prompts/bkit-utility-compress-markdown.md";
    expect(rules).toContain(`\`${compress}\``);
    expect(fs.existsSync(compress)).toBe(true);
  });
});
