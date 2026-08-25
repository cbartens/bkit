// bkit-local-gate-audit.test.ts — #437.
//
// The gate command used to live inline in eight prompts and two workflows, each
// copy a slightly different `if [ -f turbo.json ] … else jq -e ".scripts[…]"`
// probe. Two consequences, both observed on this repo:
//
//   - a consumer whose toolchain matched none of the probed script names got
//     TEST_SCOPE="" -> `eval ""` -> exit 0, and the agent recorded the gate as
//     having run;
//   - the copies drifted (bkit-build-challenge-tests had the turbo branch and
//     NO fallback, so it did nothing at all in a single-package repo).
//
// Prompts and workflows now name a `bkit:gate*` script and `package.json`
// defines it. This audit keeps it that way: it is the guard that stops copy
// number four, since nothing else in the suite referenced the command at all.
//
// Deliberately narrow: PRESENCE of the indirection, not behaviour of the gate.
// What the scripts actually run is the consumer's, and is asserted where it is
// owned — BKIT_GATE_SCRIPTS (install default) and bkit-modules.integration.test.ts.

import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

import { BKIT_BUILD_GATES, BKIT_DEBUG_GATES, BKIT_GATE_SCRIPTS } from "./bkit-manifest.js";

const REPO_ROOT = path.resolve(__dirname, "../..");
const PROMPTS_DIR = path.resolve(REPO_ROOT, ".bkit/prompts");
const WORKFLOWS_DIR = path.resolve(REPO_ROOT, ".bkit/workflows");

// The canonical authoring surfaces. Host renders under .claude/ .cursor/
// .opencode/ are generated from these by `bkit install` and are not inspected:
// fixing a render without fixing its source would pass this audit and ship the
// old command anyway.
function canonicalFiles(): Array<{ rel: string; body: string }> {
  const out: Array<{ rel: string; body: string }> = [];
  for (const dir of [PROMPTS_DIR, WORKFLOWS_DIR]) {
    for (const name of fs.readdirSync(dir).filter((f) => f.endsWith(".md"))) {
      const abs = path.join(dir, name);
      out.push({ rel: path.relative(REPO_ROOT, abs), body: fs.readFileSync(abs, "utf-8") });
    }
  }
  for (const rel of [".bkit/workflows.md", ".bkit/prompts.md"]) {
    out.push({ rel, body: fs.readFileSync(path.join(REPO_ROOT, rel), "utf-8") });
  }
  return out;
}

// A toolchain command inlined at a call site. `--filter='...[origin/dev]'` is
// turbo's affected-package selector; `jq -e '.scripts[` is the probe half of the
// retired fallback. Either one reappearing means someone re-inlined the gate.
const BANNED = [
  { pattern: "pnpm turbo", why: "names a task runner instead of a bkit:gate* script" },
  { pattern: "--filter='...[origin/dev]'", why: "turbo affected-selector inlined at a call site" },
] as const;

// Occurrences that are NOT a re-inlined gate. Every entry must say why, and a
// NEW banned occurrence must be added here deliberately or the audit fails —
// never silently allowed. (Same discipline as EXEMPT_RAW_SLEEPS in
// bkit-runtime-prose-audit.test.ts.)
const EXEMPT: Array<{ rel: string; pattern: string; context: string }> = [
  {
    rel: ".bkit/workflows.md",
    pattern: "pnpm turbo",
    context:
      "§ Local gate scripts — shows the turbo form as an example of what a consumer PUTS IN the script value, which is the point of the indirection",
  },
  {
    rel: ".bkit/workflows.md",
    pattern: "--filter='...[origin/dev]'",
    context: "§ Local gate scripts — same example",
  },
];

function isExempt(rel: string, pattern: string): boolean {
  return EXEMPT.some((e) => e.rel === rel && e.pattern === pattern);
}

// Call sites that MUST dispatch through a named gate, and which one. Guards the
// drift half: a prompt silently losing its gate call is the bkit-build-challenge-tests
// failure mode, and greps for "no banned string" would not catch it.
const GATE_CALLERS: ReadonlyArray<readonly [string, string]> = [
  // Hooks run the same scripts as the agents. If these drift back to their own
  // command lists, a green `git push` and a green agent gate stop meaning the
  // same thing — silently, since both still pass.
  [".bkit/templates/.husky/pre-commit", "pnpm bkit:gate:format"],
  [".bkit/templates/.husky/pre-push", "pnpm bkit:gate:static-unit"],
  [".bkit/templates/.husky/pre-push", "pnpm bkit:gate:static"],
  [".bkit/prompts/bkit-build-plan-execute.md", "pnpm bkit:gate:static"],
  [".bkit/prompts/bkit-build-plan-gaps-remediate.md", "pnpm bkit:gate:static-unit"],
  [".bkit/prompts/bkit-build-challenge-remediate.md", "pnpm bkit:gate:static-unit"],
  [".bkit/prompts/bkit-debug-failure-remediate.md", "pnpm bkit:gate:static-unit"],
  [".bkit/prompts/bkit-build-challenge-tests.md", "pnpm bkit:gate:static-unit"],
  [".bkit/prompts/bkit-build-plan-verify.md", "pnpm bkit:gate:static-unit"],
  [".bkit/prompts/bkit-ship-conflict-resolve.md", "pnpm bkit:gate:install-static-unit-build"],
  // bkit-build.md / bkit-debug.md are NOT listed: they build the call from the
  // descending probe (`TEST_SCOPE="pnpm $g"`), so no literal appears. The PROBES
  // block below covers them, including the fail-loud branch.
];

describe("bkit-local-gate-audit (#437)", () => {
  describe("no toolchain command is inlined at a call site", () => {
    for (const { pattern, why } of BANNED) {
      it(`\`${pattern}\` appears nowhere unexempted — ${why}`, () => {
        const hits = canonicalFiles()
          .filter((f) => f.body.includes(pattern) && !isExempt(f.rel, pattern))
          .map((f) => f.rel);
        expect(hits).toEqual([]);
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

  // Both loops share one contract: probe candidates in descending depth, run the
  // first the consumer declares. Order IS the contract — a shallower gate winning
  // while a deeper one is declared means the workflow silently under-tests and then
  // records a scope claiming it did more.
  const PROBES = [
    { workflow: "bkit-build.md", gates: BKIT_BUILD_GATES, stopsAt: "integration" },
    { workflow: "bkit-debug.md", gates: BKIT_DEBUG_GATES, stopsAt: "live" },
  ] as const;

  for (const { workflow, gates, stopsAt } of PROBES) {
    describe(`${workflow} runs the deepest declared gate (through ${stopsAt})`, () => {
      const body = fs.readFileSync(path.join(REPO_ROOT, ".bkit/workflows", workflow), "utf-8");

      it("names every candidate, in descending depth", () => {
        const positions = gates.map((g) => body.indexOf(g));
        for (const pos of positions) expect(pos).toBeGreaterThanOrEqual(0);
        expect(positions).toEqual([...positions].sort((a, b) => a - b));
      });

      it("falls back to a gate install actually seeds, so the chain terminates", () => {
        expect(Object.keys(BKIT_GATE_SCRIPTS)).toContain(gates[gates.length - 1]);
      });

      it("fails loud when no candidate is declared, never silently skipping", () => {
        // The defect this whole issue exists to kill: an unresolved gate must not
        // reach `eval ""`, which exits 0 and reads as a clean run.
        expect(body).toContain('[ -n "$TEST_SCOPE" ] ||');
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
    // This repo IS a consumer of these defaults. If a default chains a script
    // bkit does not declare, bkit's own /bkit-build breaks — the regression the
    // gate-missing-called-scripts advisory warns other consumers about.
    const pkg = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, "package.json"), "utf-8")) as {
      scripts?: Record<string, string>;
    };
    const declared = pkg.scripts ?? {};
    // Mirrors PNPM_NOT_A_SCRIPT in runLintModule: pnpm's own subcommands and
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
    for (const [name, value] of Object.entries(BKIT_GATE_SCRIPTS)) {
      // Only meaningful where this repo still runs bkit's default.
      if (declared[name] !== value) continue;
      for (const [, called] of value.matchAll(/\bpnpm ([\w:-]+)/g)) {
        if (subcommands.has(called)) continue;
        expect(called in declared || called in BKIT_GATE_SCRIPTS).toBe(true);
      }
    }
  });
});
