import { describe, it, expect, afterAll } from "vitest";
import { execFileSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

// Behaviour test for the shipped `boundary/type-suppression` slop-scan plugin
// (.bkit/scripts/bkit-slop-type-suppression.mjs). It runs the REAL slop-scan
// against a temp corpus wired the way the shipped slop-scan.config.json wires it
// — a JSON config that loads the plugin by relative path — so the whole chain is
// exercised: plugin loads via slop-scan's loader, the JSON `plugins` ref
// resolves, the rule classifies casts AND ts-suppression directives, and
// `overrides` suppress the right files. String-presence on the config would prove
// none of that (project rule: validate shipped config with the real tool).

// The actual shipped plugin artifact, not a copy — the test guards the real file.
const PLUGIN_SRC = path.resolve(
  import.meta.dirname,
  "..",
  "scripts",
  "bkit-slop-type-suppression.mjs",
);

const tmpDirs: string[] = [];
afterAll(() => {
  for (const d of tmpDirs) fs.rmSync(d, { recursive: true, force: true });
});

const FIXTURES: Record<string, string> = {
  // object-literal target double cast — the Fraser #122 shape (highest signal)
  "src/obj.ts": "export const x = (foo as unknown as { a: string }).a;\n",
  // general double cast
  "src/dbl.ts": "export const y = foo as unknown as Bar;\n",
  // any cast
  "src/any.ts": "export const z = foo as any;\n",
  // ts-ignore directive — silences the next line's error
  "src/ignore.ts": "// @ts-ignore\nexport const a = boundary().x;\n",
  // ts-nocheck directive — disables the whole file
  "src/nocheck.ts": "// @ts-nocheck\nexport const b = 1;\n",
  // ts-expect-error directive
  "src/expect.ts": "// @ts-expect-error boundary drift\nexport const c = boundary();\n",
  // single ordinary cast — legitimate, must NOT be flagged
  "src/clean.ts": "export const w = foo as Bar;\n",
  // the cast token only appears in a comment — must NOT be flagged
  "src/comment.ts": "// note: do not reach for foo as any here\nexport const e = 1;\n",
  // a test-file suppression — the override disables the whole rule, not just casts
  "src/sample.test.ts": "// @ts-ignore\nexport const m = foo as any;\n",
};

// Fixtures for the sibling boundary/gate-suppression rule: skipped/focused tests and
// lint/format disable directives (the other gates), plus negatives that must NOT flag.
const GATE_FIXTURES: Record<string, string> = {
  // skipped test — disables this test
  "src/skip.ts": 'describe.skip("x", () => {});\n',
  // focused test — silently disables every sibling test
  "src/only.ts": 'it.only("x", () => {});\n',
  // x-prefixed skip global (Jasmine/Jest)
  "src/xit.ts": 'xit("x", () => {});\n',
  // f-prefixed focus global (Jasmine/Jest)
  "src/fdescribe.ts": 'fdescribe("x", () => {});\n',
  // BLANKET whole-file linter disable — a comment, so NOT comment-skipped
  "src/blanket.ts": "/* eslint-disable */\nexport const a = 1;\n",
  // TARGETED per-rule disable — the sanctioned opt-out, must NOT flag
  "src/targeted.ts": "// eslint-disable-next-line no-eval\nexport const b = 1;\n",
  // a real `.fit()` method call (not a focused test) — must NOT flag (lookbehind)
  "src/falsepos.ts": "export const c = arr.fit(x);\n",
  // the skip token only appears in a comment — must NOT flag
  "src/comment.ts": "// do not reach for it.skip here\nexport const d = 1;\n",
  // ordinary tests — must NOT flag
  "src/clean.ts": 'it("real", () => {});\ndescribe("real", () => {});\n',
};

/** Builds a temp corpus, runs the real slop-scan, returns flagged source paths. */
function scanFlagged(options: Record<string, unknown> = {}): string[] {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "slop-ts-"));
  tmpDirs.push(dir);
  fs.copyFileSync(PLUGIN_SRC, path.join(dir, "plugin.mjs"));
  const config = {
    plugins: { boundary: "./plugin.mjs" },
    rules: { "boundary/type-suppression": { enabled: true, options } },
    overrides: [
      { files: ["**/*.test.ts"], rules: { "boundary/type-suppression": { enabled: false } } },
      { files: ["plugin.mjs"], rules: { "boundary/type-suppression": { enabled: false } } },
    ],
  };
  fs.writeFileSync(path.join(dir, "slop-scan.config.json"), JSON.stringify(config, null, 2));
  for (const [rel, content] of Object.entries(FIXTURES)) {
    const dst = path.join(dir, rel);
    fs.mkdirSync(path.dirname(dst), { recursive: true });
    fs.writeFileSync(dst, content);
  }
  const out = execFileSync("npx", ["--no-install", "slop-scan", "scan", dir, "--json"], {
    encoding: "utf8",
  });
  const report = JSON.parse(out) as { findings: Array<{ ruleId: string; path: string }> };
  return report.findings
    .filter((f) => f.ruleId === "boundary/type-suppression")
    .map((f) => f.path)
    .sort();
}

describe("boundary/type-suppression slop rule (.bkit/scripts/bkit-slop-type-suppression.mjs)", () => {
  it("flags casts and ts-suppression directives; ignores single casts, comments, and test files", () => {
    expect(scanFlagged()).toEqual([
      "src/any.ts",
      "src/dbl.ts",
      "src/expect.ts",
      "src/ignore.ts",
      "src/nocheck.ts",
      "src/obj.ts",
    ]);
  });

  it("objectShapeOnly narrows to the object-literal double cast (no other casts, no directives)", () => {
    expect(scanFlagged({ objectShapeOnly: true })).toEqual(["src/obj.ts"]);
  });

  it("includeAnyCast:false drops the any-cast but keeps double casts and directives", () => {
    expect(scanFlagged({ includeAnyCast: false })).toEqual([
      "src/dbl.ts",
      "src/expect.ts",
      "src/ignore.ts",
      "src/nocheck.ts",
      "src/obj.ts",
    ]);
  });

  it("includeTsSuppress:false drops the directives but keeps the casts", () => {
    expect(scanFlagged({ includeTsSuppress: false })).toEqual([
      "src/any.ts",
      "src/dbl.ts",
      "src/obj.ts",
    ]);
  });
});

/** Builds a temp corpus, runs the real slop-scan, returns paths flagged by gate-suppression. */
function scanGateFlagged(): string[] {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "slop-gate-"));
  tmpDirs.push(dir);
  fs.copyFileSync(PLUGIN_SRC, path.join(dir, "plugin.mjs"));
  const config = {
    plugins: { boundary: "./plugin.mjs" },
    rules: { "boundary/gate-suppression": { enabled: true } },
    // Self-override so the plugin's own pattern literals never flag (matches shipped config).
    overrides: [
      { files: ["plugin.mjs"], rules: { "boundary/gate-suppression": { enabled: false } } },
    ],
  };
  fs.writeFileSync(path.join(dir, "slop-scan.config.json"), JSON.stringify(config, null, 2));
  for (const [rel, content] of Object.entries(GATE_FIXTURES)) {
    const dst = path.join(dir, rel);
    fs.mkdirSync(path.dirname(dst), { recursive: true });
    fs.writeFileSync(dst, content);
  }
  const out = execFileSync("npx", ["--no-install", "slop-scan", "scan", dir, "--json"], {
    encoding: "utf8",
  });
  const report = JSON.parse(out) as { findings: Array<{ ruleId: string; path: string }> };
  return report.findings
    .filter((f) => f.ruleId === "boundary/gate-suppression")
    .map((f) => f.path)
    .sort();
}

describe("boundary/gate-suppression slop rule (.bkit/scripts/bkit-slop-type-suppression.mjs)", () => {
  it("flags skipped/focused tests and blanket lint disables; ignores targeted disables, .fit(), comments, and clean tests", () => {
    expect(scanGateFlagged()).toEqual([
      "src/blanket.ts",
      "src/fdescribe.ts",
      "src/only.ts",
      "src/skip.ts",
      "src/xit.ts",
    ]);
  });
});
