// render/parts.test.ts — splicing the shared hook parts into host hook templates.
import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { listFilesRecursive } from "../install/template-copies";
import { getCoreRoot, getHooksRoot } from "../shared/package-roots";
import { listCoreTemplateFiles } from "../install/modules/core";
import { readTemplate, renderParts } from "./parts";

const PART_LINE = /\{\{BKIT_PART /;

/** Syntax-check `file` as the template `rel`'s language: `bash -n` for shell, `node --check` for JS. */
function syntaxCheck(rel: string, file: string) {
  return rel.endsWith(".sh")
    ? spawnSync("bash", ["-n", file], { encoding: "utf-8" })
    : spawnSync(process.execPath, ["--check", file], { encoding: "utf-8" });
}

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
  const root = getCoreRoot();
  const partsDir = getHooksRoot();
  // The per-host hook sources; the part lines in prose (e.g. `.bkit/providers.md`)
  // are examples, not templates.
  const HOOK_DIRS = [
    ".claude/hooks",
    ".cursor/hooks",
    ".codex/hooks",
    ".opencode/plugin",
    ".agents/plugins/bkit/hooks",
  ];
  const templates = listFilesRecursive(root)
    .map((abs) => path.relative(root, abs))
    .filter((rel) => HOOK_DIRS.some((d) => rel.startsWith(d + path.sep)))
    .filter((rel) => PART_LINE.test(readRaw(rel)));

  function readRaw(rel: string): string {
    return fs.readFileSync(path.join(root, rel), "utf-8");
  }

  it("the parts sit outside the copied payload, so install never copies them", () => {
    const copied = listCoreTemplateFiles(root).map((f) => path.relative(root, f.src));
    expect(copied.some((rel) => rel.startsWith("hooks" + path.sep))).toBe(false);
    expect(fs.existsSync(partsDir)).toBe(true);
  });

  it("the hook templates that splice parts are the sixteen host hooks", () => {
    expect(templates.map((t) => t.split(path.sep).join("/")).sort()).toEqual([
      ".agents/plugins/bkit/hooks/bkit-gateguard.cjs",
      ".agents/plugins/bkit/hooks/bkit-guardrails.cjs",
      ".agents/plugins/bkit/hooks/bkit-readguard.cjs",
      ".claude/hooks/bkit-gateguard.cjs",
      ".claude/hooks/bkit-guardrails.cjs",
      ".claude/hooks/bkit-preflight.sh",
      ".claude/hooks/bkit-readguard.cjs",
      ".codex/hooks/bkit-gateguard.cjs",
      ".codex/hooks/bkit-guardrails.cjs",
      ".codex/hooks/bkit-readguard.cjs",
      ".cursor/hooks/bkit-gateguard.cjs",
      ".cursor/hooks/bkit-guardrails.cjs",
      ".cursor/hooks/bkit-preflight.sh",
      ".cursor/hooks/bkit-readguard.cjs",
      ".opencode/plugin/bkit-gateguard.js",
      ".opencode/plugin/bkit-readguard.js",
    ]);
  });

  it("every part is used by at least two hosts, and no part line survives rendering", () => {
    const referenced = templates.flatMap((rel) =>
      [...readRaw(rel).matchAll(/\{\{BKIT_PART ([A-Za-z0-9._-]+)\}\}/g)].map((m) => m[1]!),
    );
    for (const rel of templates) {
      expect(readTemplate(path.join(root, rel)), rel).not.toMatch(PART_LINE);
    }
    // Every part on disk, plus any part a template names that is not on disk.
    for (const part of new Set([...fs.readdirSync(partsDir), ...referenced])) {
      const n = referenced.filter((name) => name === part).length;
      expect(n, part).toBeGreaterThanOrEqual(2);
    }
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
      // `.mjs` for the opencode plugin: an ES module with no package.json beside it.
      const out = path.join(tmp, path.basename(rel).replace(/\.js$/, ".mjs"));
      fs.writeFileSync(out, readTemplate(path.join(root, rel)));
      const res = syntaxCheck(rel, out);
      expect(res.status, `${rel}: ${res.stderr}`).toBe(0);
    }
  });
});
