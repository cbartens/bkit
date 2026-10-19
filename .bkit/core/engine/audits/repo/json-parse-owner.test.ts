// audits/repo/json-parse-owner.test.ts — a failed JSON parse is caught in one place: shared/json.ts.
//
// Engine code that reads JSON bkit does not author goes through `parseJson` / `readJsonFile`, which
// turn "not JSON" into a result the caller reports. A `JSON.parse` anywhere inside a `try`
// statement (its block, `catch` or `finally`) is a second copy of that catch. An unguarded
// `JSON.parse` (deep clone, bkit-owned template, fail-closed teardown) is not reported.
//
// TypeScript 7 ships no JS compiler API, so prettier's bundled TypeScript parser reads the sources.

import * as fs from "node:fs";
import * as path from "node:path";
import { format, type Plugin } from "prettier";
import * as typescriptPlugin from "prettier/plugins/typescript";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const ENGINE = path.join(ROOT, ".bkit", "core", "engine");
const OWNER = path.join(ENGINE, "shared", "json.ts");

interface AstNode {
  type: string;
  loc: { start: { line: number } };
  computed?: boolean;
  name?: string;
  object?: AstNode;
  property?: AstNode;
}

const NON_CHILD_KEYS = new Set(["loc", "range", "tokens", "comments"]);

function isNode(value: unknown): value is AstNode {
  return (
    typeof value === "object" && value !== null && "type" in value && typeof value.type === "string"
  );
}

function isJsonParse(node: AstNode): boolean {
  return (
    node.type === "MemberExpression" &&
    node.computed === false &&
    node.object?.type === "Identifier" &&
    node.object.name === "JSON" &&
    node.property?.name === "parse"
  );
}

function collectJsonParseInTry(node: unknown, inTry: boolean, lines: number[]): void {
  if (Array.isArray(node)) {
    for (const child of node) collectJsonParseInTry(child, inTry, lines);
    return;
  }
  if (!isNode(node)) return;
  const guarded = inTry || node.type === "TryStatement";
  if (guarded && isJsonParse(node)) lines.push(node.loc.start.line);
  for (const [key, child] of Object.entries(node)) {
    if (!NON_CHILD_KEYS.has(key)) collectJsonParseInTry(child, guarded, lines);
  }
}

/** Line of every `JSON.parse` reference that sits inside a `try` statement of `source`. */
async function jsonParseInTry(source: string, file: string): Promise<number[]> {
  const lines: number[] = [];
  const typescript = typescriptPlugin.parsers.typescript;
  // prettier hands its own parser options to a plugin parser. The collector returns an empty
  // program (no comments to attach) and prints nothing.
  const collector: Plugin = {
    parsers: {
      "json-parse-owner": {
        ...typescript,
        astFormat: "json-parse-owner",
        async parse(text, options) {
          collectJsonParseInTry(await typescript.parse(text, options), false, lines);
          return { type: "Program", body: [] };
        },
      },
    },
    printers: { "json-parse-owner": { print: () => "" } },
  };
  await format(source, { parser: "json-parse-owner", filepath: file, plugins: [collector] });
  return lines.sort((a, b) => a - b);
}

function engineSources(): string[] {
  return fs
    .readdirSync(ENGINE, { recursive: true, encoding: "utf-8" })
    .filter((rel) => rel.endsWith(".ts") && !rel.endsWith(".test.ts"))
    .map((rel) => path.join(ENGINE, rel))
    .filter((file) => file !== OWNER);
}

describe("JSON.parse inside a try statement belongs to shared/json.ts", () => {
  it("no engine source parses JSON inside its own try", { timeout: 60_000 }, async () => {
    const sources = engineSources();
    expect(sources.length).toBeGreaterThan(50);
    const findings: string[] = [];
    for (const file of sources) {
      for (const line of await jsonParseInTry(fs.readFileSync(file, "utf-8"), file)) {
        findings.push(`${path.relative(ROOT, file)}:${line}`);
      }
    }
    expect(findings).toEqual([]);
  });

  it("CONTROL — the owner's own parse is found, so the scan is not vacuous", async () => {
    const lines = await jsonParseInTry(fs.readFileSync(OWNER, "utf-8"), OWNER);
    expect(lines.length).toBeGreaterThan(0);
  });

  it("CONTROL — a parse in the try block, the catch block or a closure inside the try is found", async () => {
    const source = [
      "try {",
      "  JSON.parse(a);",
      "} catch {",
      "  JSON.parse(b);",
      "} finally {",
      "  const read = () => JSON.parse(c);",
      "}",
    ].join("\n");
    expect(await jsonParseInTry(source, "control.ts")).toEqual([2, 4, 6]);
  });

  it("CONTROL — an unguarded parse and a parseJson inside a try are not found", async () => {
    const source = [
      "const a = JSON.parse(x);",
      "const b = JSON.parse(JSON.stringify(a));",
      "try {",
      "  parseJson(y);",
      "} catch {}",
    ].join("\n");
    expect(await jsonParseInTry(source, "control.ts")).toEqual([]);
  });
});
