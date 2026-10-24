// audits/workflows/local-gate-audit.test.ts
//
// Prompts and workflows name a `bkit:gate*` script and `package.json` defines it; no
// call site inlines a gate command (an `if [ -f turbo.json ] … else jq -e
// ".scripts[…]"` probe).
//
// Narrow: PRESENCE of the indirection, not behaviour of the gate.
// What the scripts actually run is the consumer's, and is asserted where it is
// owned — BKIT_GATE_SCRIPTS (install default) and install/modules/index.integration.test.ts.

import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

import { debugStart } from "../../commands/workflow/status.js";
import { BKIT_BUILD_GATES, BKIT_DEBUG_GATES, BKIT_GATE_SCRIPTS } from "../../install/manifest.js";
import { getPromptsRoot, getWorkflowsRoot } from "../../shared/package-roots";

const REPO_ROOT = path.resolve(__dirname, "../../../../..");
const PROMPTS_DIR = getPromptsRoot();
const WORKFLOWS_DIR = getWorkflowsRoot();

// The canonical authoring surfaces. Host renders under .claude/ .cursor/
// .opencode/ are generated from these by `bkit install` and are not inspected.
function canonicalFiles(): Array<{ rel: string; body: string }> {
  const out: Array<{ rel: string; body: string }> = [];
  for (const dir of [PROMPTS_DIR, WORKFLOWS_DIR]) {
    for (const name of fs.readdirSync(dir).filter((f) => f.endsWith(".md"))) {
      const abs = path.join(dir, name);
      out.push({ rel: path.relative(REPO_ROOT, abs), body: fs.readFileSync(abs, "utf-8") });
    }
  }
  for (const rel of [".bkit/core/.bkit/workflows.md", ".bkit/core/.bkit/prompts.md"]) {
    out.push({ rel, body: fs.readFileSync(path.join(REPO_ROOT, rel), "utf-8") });
  }
  return out;
}

// A toolchain command inlined at a call site. `--filter='...[origin/dev]'` is
// turbo's affected-package selector; `jq -e '.scripts[` is the probe half of an
// inlined script-name fallback. Either one reappearing means someone re-inlined the gate.
const BANNED = [
  { pattern: "pnpm turbo", why: "names a task runner instead of a bkit:gate* script" },
  { pattern: "--filter='...[origin/dev]'", why: "turbo affected-selector inlined at a call site" },
] as const;

// Occurrences that are NOT a re-inlined gate, each with its reason. Any other banned
// occurrence fails the audit.
const EXEMPT: Array<{ rel: string; pattern: string; context: string }> = [
  {
    rel: ".bkit/core/.bkit/workflows.md",
    pattern: "pnpm turbo",
    context:
      "§ Local gate scripts — shows the turbo form as an example of what a consumer PUTS IN the script value, which is the point of the indirection",
  },
  {
    rel: ".bkit/core/.bkit/workflows.md",
    pattern: "--filter='...[origin/dev]'",
    context: "§ Local gate scripts — same example",
  },
];

function isExempt(rel: string, pattern: string): boolean {
  return EXEMPT.some((e) => e.rel === rel && e.pattern === pattern);
}

/** Canonical files that contain a banned pattern without an exemption for it. */
function unexemptedHits(pattern: string): string[] {
  return canonicalFiles()
    .filter((f) => f.body.includes(pattern) && !isExempt(f.rel, pattern))
    .map((f) => f.rel);
}

/** The repo's own `package.json` scripts. */
function declaredScripts(): Record<string, string> {
  const pkg = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, "package.json"), "utf-8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

/**
 * `pnpm <script>` calls inside a seeded default gate (where this repo still runs bkit's
 * default) that name neither a pnpm subcommand, a script declared here, nor another gate.
 */
function unresolvedGateCalls(declared: Record<string, string>, subcommands: Set<string>): string[] {
  const out: string[] = [];
  for (const [name, value] of Object.entries(BKIT_GATE_SCRIPTS)) {
    // Only meaningful where this repo still runs bkit's default.
    const runsDefault = declared[name] === value;
    const called = [...value.matchAll(/\bpnpm ([\w:-]+)/g)].map((m) => m[1]!);
    for (const script of called.filter((c) => runsDefault && !subcommands.has(c))) {
      const known = script in declared || script in BKIT_GATE_SCRIPTS;
      if (!known)
        out.push(`${name} chains \`pnpm ${script}\`, which is neither declared nor a gate`);
    }
  }
  return out;
}

// Call sites that MUST dispatch through a named gate, and which one.
const GATE_CALLERS: ReadonlyArray<readonly [string, string]> = [
  // Hooks run the same scripts as the agents.
  [".bkit/templates/.husky/pre-commit", "pnpm bkit:gate:format"],
  [".bkit/templates/.husky/pre-push", "pnpm bkit:gate:static-unit"],
  [".bkit/templates/.husky/pre-push", "pnpm bkit:gate:static"],
  [".bkit/templates/.husky/pre-push", "pnpm bkit:gate:min"],
  [".bkit/core/prompts/bkit-build-plan-execute.md", "pnpm bkit:gate:static"],
  [".bkit/core/prompts/bkit-build-plan-gaps-remediate.md", "pnpm bkit:gate:static-unit"],
  [".bkit/core/prompts/bkit-build-challenge-remediate.md", "pnpm bkit:gate:static-unit"],
  [".bkit/core/prompts/bkit-debug-failure-remediate.md", "pnpm bkit:gate:static-unit"],
  [".bkit/core/prompts/bkit-build-challenge-tests.md", "pnpm bkit:gate:static-unit"],
  [".bkit/core/prompts/bkit-build-plan-verify.md", "pnpm bkit:gate:static-unit"],
  [".bkit/core/prompts/bkit-ship-conflict-resolve.md", "pnpm bkit:gate:install-static-unit-build"],
  // bkit-build.md / bkit-debug.md are NOT listed: they run the gate through
  // `bkit tests run --gate=<candidate>...`, which picks the deepest declared
  // candidate itself. The PROBES block below covers them.
];

describe("bkit-local-gate-audit (#437)", () => {
  describe("no toolchain command is inlined at a call site", () => {
    for (const { pattern, why } of BANNED) {
      it(`\`${pattern}\` appears nowhere unexempted — ${why}`, () => {
        expect(unexemptedHits(pattern)).toEqual([]);
      });
    }
  });

  describe("every call site dispatches through a named gate", () => {
    for (const [rel, call] of GATE_CALLERS) {
      it(`${rel} runs \`${call}\``, () => {
        const body = fs.readFileSync(path.join(REPO_ROOT, rel), "utf-8");
        expect(body).toContain(call);
      });
    }
  });

  it("every gate a call site names is one install actually seeds", () => {
    const seeded = new Set(Object.keys(BKIT_GATE_SCRIPTS));
    const named = new Set(GATE_CALLERS.map(([, call]) => call.replace(/^pnpm /, "")));
    for (const name of named) expect(seeded).toContain(name);
  });

  // Workflows never run a gate script themselves: `bkit tests run` owns the
  // descending probe, the saved log and the "nothing declared" refusal. A
  // workflow that runs `pnpm bkit:gate:*` or `eval`s a resolved command is the
  // copy this audit exists to stop — and `eval ""` exits 0, reading as a clean run.
  it("workflows run the local gate only through `bkit tests run`", () => {
    for (const name of fs.readdirSync(WORKFLOWS_DIR).filter((f) => f.endsWith(".md"))) {
      const body = fs.readFileSync(path.join(WORKFLOWS_DIR, name), "utf-8");
      expect(body, `${name} runs a gate script directly`).not.toMatch(/pnpm (run )?bkit:gate/);
      expect(body, `${name} evals a command`).not.toMatch(/(^|[;&|(\s])eval\s/m);
    }
  });

  // Both call sites share one contract: pass the candidates in descending depth,
  // and `bkit tests run` runs the first the consumer declares. Order IS the contract.
  const PROBES = [
    { workflow: "bkit-build.md", gates: BKIT_BUILD_GATES, stopsAt: "integration", sites: 2 },
    { workflow: "bkit-debug.md", gates: BKIT_DEBUG_GATES, stopsAt: "live", sites: 1 },
  ] as const;

  /** The ```bash blocks of a workflow that call `bkit tests run`. */
  const testBlocks = (body: string) =>
    [...body.matchAll(/```bash\n([\s\S]*?)```/g)]
      .map((m) => m[1]!)
      .filter((b) => /\btests run\b/.test(b));

  /** The candidate gates a block passes: either inline on the `tests run` line or via `set -- --gate=...`. */
  const gatesPassed = (block: string): string[] => {
    const line = block.split("\n").find((l) => l.includes("--gate=bkit:gate"));
    return [...(line ?? "").matchAll(/--gate=(\S+)/g)].map((m) => m[1]!);
  };

  /** A block's lines and the index of the `tests run` call within them. */
  const callPosition = (block: string) => {
    const lines = block.trimEnd().split("\n");
    return { lines, at: lines.findIndex((l) => /\btests run\b/.test(l)) };
  };

  for (const { workflow, gates, stopsAt, sites } of PROBES) {
    describe(`${workflow} runs the deepest declared gate (through ${stopsAt})`, () => {
      const body = fs.readFileSync(path.join(REPO_ROOT, ".bkit/core/workflows", workflow), "utf-8");
      const blocks = testBlocks(body);

      it(`passes every candidate, in descending depth, at each of its ${sites} call site(s)`, () => {
        expect(blocks).toHaveLength(sites);
        for (const block of blocks.filter((b) => !b.includes("{GATE_FLAGS}")))
          expect(gatesPassed(block)).toEqual([...gates]);
      });

      // Debug passes the list `status route --prompt-file` printed as `gates`.
      it.runIf(blocks.some((b) => b.includes("{GATE_FLAGS}")))(
        "routes the engine's gate list where a block passes {GATE_FLAGS}",
        () => {
          expect(body).toContain("`gates` as `{GATES}`");
          expect(debugStart([], "").gates).toEqual([...gates]);
        },
      );

      it("falls back to a gate install actually seeds, so the chain terminates", () => {
        expect(Object.keys(BKIT_GATE_SCRIPTS)).toContain(gates[gates.length - 1]);
      });

      it("never swallows a could-not-run exit, so an undeclared gate fails loud", () => {
        // `tests run` exits 3 when no candidate is declared and 4 when the gate
        // could not run (commands/workflow/tests.test.ts). Only 0 (PASS) and
        // 1 (FAIL) are verdicts; every other code must leave the block.
        for (const block of blocks) {
          const { lines, at } = callPosition(block);
          expect(lines[at]).not.toMatch(/\|\|\s*(true|:|echo)\b/);
        }
        // A call that is the block's last line has its exit AS the block's exit.
        const continuing = blocks
          .map(callPosition)
          .filter(({ lines, at }) => at !== lines.length - 1);
        for (const { lines, at } of continuing) {
          const rest = lines.slice(at).join("\n");
          const captured = /\b(\w+)=\$\?/.exec(rest)?.[1];
          expect(captured, "the exit code is captured right after the call").toBeDefined();
          expect(rest).toMatch(new RegExp(`exit "\\$${captured}"`));
        }
      });
    });
  }

  it("only debug reaches the live tier, and only its deepest gate carries the `live` word", () => {
    // bkit-debug.md greps the recorded scope for the WORD `live` to decide
    // testsLiveSkipped. `:` and `-` are not word characters, so `…-e2e-live`
    // matches and `…-e2e` does not — assert both halves, and that build's
    // candidates never reach live at all.
    const [deepest, ...rest] = BKIT_DEBUG_GATES;
    expect(/\blive\b/.test(deepest)).toBe(true);
    for (const g of rest) expect(/\blive\b/.test(g)).toBe(false);
    for (const g of BKIT_BUILD_GATES) expect(/\blive\b/.test(g)).toBe(false);
  });

  it("the seeded gates chain only scripts that exist here or are themselves gates", () => {
    // This repo IS a consumer of these defaults: every script a default chains is
    // declared here.
    const declared = declaredScripts();
    // Mirrors PNPM_NOT_A_SCRIPT in install/modules/core.ts: pnpm's own subcommands and
    // node_modules binaries pnpm resolves directly are not package.json scripts.
    const subcommands = new Set([
      "install",
      "run",
      "exec",
      "dlx",
      "audit",
      "outdated",
      "lint-staged",
    ]);
    expect(unresolvedGateCalls(declared, subcommands)).toEqual([]);
  });
});
