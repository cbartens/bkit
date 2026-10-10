// render/parts.test.ts — splicing the shared hook parts into host hook templates.
import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { listFilesRecursive } from "../commands/install/install";
import { getHookPartsRoot, getTemplatesRoot } from "../shared/package-roots";
import { readTemplate, renderParts } from "./parts";

const PART_LINE = /\{\{BKIT_PART /;

let tmp: string;
beforeEach(() => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-parts-"));
});
afterEach(() => fs.rmSync(tmp, { recursive: true, force: true }));

describe("renderParts", () => {
  it("replaces a JS or shell part line with the part's text, leaving every other line", () => {
    fs.writeFileSync(path.join(tmp, "a.js"), "const a = 1;\n");
    fs.writeFileSync(path.join(tmp, "b.sh"), "echo b\n");
    const out = renderParts(
      "head\n// {{BKIT_PART a.js}}\n  # {{BKIT_PART b.sh}}\ntail // {{BKIT_PART a.js}}\n",
      tmp,
    );
    expect(out).toBe("head\nconst a = 1;\necho b\ntail // {{BKIT_PART a.js}}\n");
  });

  it("leaves content without part lines byte-identical", () => {
    const text = "# <!-- bkit:start -->\n{{BKIT_MANAGED_MARKER}}\n";
    expect(renderParts(text, tmp)).toBe(text);
  });

  it("does not expand a part line inside a part", () => {
    fs.writeFileSync(path.join(tmp, "outer.js"), "// {{BKIT_PART inner.js}}\n");
    fs.writeFileSync(path.join(tmp, "inner.js"), "inner\n");
    expect(renderParts("// {{BKIT_PART outer.js}}\n", tmp)).toBe("// {{BKIT_PART inner.js}}\n");
  });

  it("throws on a missing part", () => {
    expect(() => renderParts("// {{BKIT_PART nope.js}}\n", tmp)).toThrow(/hook part not found/);
  });
});

describe("shipped hook templates", () => {
  const root = getTemplatesRoot();
  const partsDir = getHookPartsRoot();
  const templates = listFilesRecursive(root)
    .map((abs) => path.relative(root, abs))
    .filter((rel) => PART_LINE.test(readRaw(rel)));

  function readRaw(rel: string): string {
    return fs.readFileSync(path.join(root, rel), "utf-8");
  }

  it("the parts live outside the templates root, so install never copies them", () => {
    expect(path.relative(root, partsDir).startsWith("..")).toBe(true);
    expect(fs.existsSync(path.join(root, "hook-parts"))).toBe(false);
  });

  it("the hook templates that splice parts are the nine host hooks", () => {
    expect(templates.map((t) => t.split(path.sep).join("/")).sort()).toEqual([
      ".claude/hooks/gateguard.cjs",
      ".claude/hooks/guardrails.cjs",
      ".claude/hooks/preflight.sh",
      ".codex/hooks/gateguard.cjs",
      ".codex/hooks/guardrails.cjs",
      ".cursor/hooks/gateguard.cjs",
      ".cursor/hooks/guardrails.cjs",
      ".cursor/hooks/preflight.sh",
      ".opencode/plugin/gateguard.js",
    ]);
  });

  it("every part is used by at least two hosts, and no part line survives rendering", () => {
    const uses = new Map(fs.readdirSync(partsDir).map((p) => [p, 0]));
    for (const rel of templates) {
      for (const m of readRaw(rel).matchAll(/\{\{BKIT_PART ([A-Za-z0-9._-]+)\}\}/g)) {
        uses.set(m[1]!, (uses.get(m[1]!) ?? 0) + 1);
      }
      expect(readTemplate(path.join(root, rel)), rel).not.toMatch(PART_LINE);
    }
    for (const [part, n] of uses) expect(n, part).toBeGreaterThanOrEqual(2);
  });

  it("every part line sits inside the bkit-managed block", () => {
    for (const rel of templates) {
      const text = readRaw(rel);
      const start = text.search(/bkit:start/);
      const end = text.search(/bkit:end/);
      for (const m of text.matchAll(/\{\{BKIT_PART /g)) {
        expect(m.index!, rel).toBeGreaterThan(start);
        expect(m.index!, rel).toBeLessThan(end);
      }
    }
  });

  it("every generated hook parses: node --check for JS, bash -n for shell", () => {
    for (const rel of templates) {
      const isShell = rel.endsWith(".sh");
      // `.mjs` for the opencode plugin: an ES module with no package.json beside it.
      const out = path.join(tmp, path.basename(rel).replace(/\.js$/, ".mjs"));
      fs.writeFileSync(out, readTemplate(path.join(root, rel)));
      const res = isShell
        ? spawnSync("bash", ["-n", out], { encoding: "utf-8" })
        : spawnSync(process.execPath, ["--check", out], { encoding: "utf-8" });
      expect(res.status, `${rel}: ${res.stderr}`).toBe(0);
    }
  });
});
