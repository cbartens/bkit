// audits/templates/branding.test.ts — every name a consumer types or sees carries the bkit
// brand (#748). The checks are pure functions over text and paths, so each rule also runs on a
// seeded negative.

import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";
import { listFilesRecursive } from "../../install/template-copies";
import { getBkitDocsRoot } from "../../shared/package-roots";

const PREFIX = "bkit-";
const SCRIPT_PREFIX = "bkit:";

/** Every `package.json` scripts block in the json fences of `templates.md`, merged. */
function scriptsInJsonBlocks(doc: string): Record<string, string> {
  const merged: Record<string, string> = {};
  for (const m of doc.matchAll(/```json\n([\s\S]*?)\n```/g)) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(m[1] ?? "");
    } catch {
      continue;
    }
    if (parsed === null || typeof parsed !== "object") continue;
    for (const [name, value] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof value === "string") merged[name] = value;
    }
  }
  return merged;
}

/** Whether a script value runs bkit code: the `bkit` CLI or a shipped `scripts/<dir>/bkit-*` file. */
function runsBkitCode(value: string): boolean {
  return /^bkit\s/.test(value) || /scripts\/[\w-]+\/bkit-/.test(value);
}

/** Script names whose value runs bkit code and which lack the `bkit:` prefix. */
function unprefixedScriptNames(scripts: Record<string, string>): string[] {
  return Object.entries(scripts)
    .filter(([name, value]) => runsBkitCode(value) && !name.startsWith(SCRIPT_PREFIX))
    .map(([name]) => name);
}

/** Template files (relative to a root dir) whose base name lacks `bkit-`. */
function unprefixedFileNames(relPaths: string[]): string[] {
  return relPaths.filter((rel) => !path.basename(rel).startsWith(PREFIX));
}

describe("consumer-facing names carry the bkit prefix", () => {
  const doc = fs.readFileSync(path.join(getBkitDocsRoot(), "templates.md"), "utf-8");
  const templatesRoot = path.resolve(".bkit/templates");

  it("template script names that run bkit code", () => {
    const scripts = scriptsInJsonBlocks(doc);
    expect(Object.keys(scripts).length).toBeGreaterThan(0);
    expect(unprefixedScriptNames(scripts)).toEqual([]);
  });

  it("flags a seeded unprefixed script name that runs bkit code", () => {
    const seeded = {
      graph: "bash scripts/graphify/bkit-graphify.sh build",
      "lint:prose": "bkit ci prose",
      "bkit:graph": "bash scripts/graphify/bkit-graphify.sh build",
      typecheck: "tsc --noEmit",
    };
    expect(unprefixedScriptNames(seeded)).toEqual(["graph", "lint:prose"]);
  });

  it("template file names", () => {
    const rels = ["scripts", "context"].flatMap((dir) =>
      listFilesRecursive(path.join(templatesRoot, dir)).map((abs) =>
        path.relative(templatesRoot, abs),
      ),
    );
    expect(rels.length).toBeGreaterThan(0);
    expect(unprefixedFileNames(rels)).toEqual([]);
    expect(unprefixedFileNames([...rels, "scripts/foo.sh"])).toEqual(["scripts/foo.sh"]);
  });
});
