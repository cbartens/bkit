/**
 * audits/workflows/text-omit-audit.test.ts
 *
 * A verb's `textOmit` keys are left out of its default text output (`--json` keeps
 * them), so no workflow or agent prompt may read one. This audit fails when a code span
 * in `.bkit/core/workflows/*.md` or `.bkit/core/prompts/*.md` names an omitted key: the
 * span is the key, starts with `key.`, holds `.key` as a dotted segment, or starts with
 * the key and an operator (`=`, `!=`, `:`, `<`, `>`). Each omitted key must also be one
 * of the verb's declared output keys.
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";
import { COMMANDS } from "../../commands/registry";
import { getCoreRoot } from "../../shared/package-roots";

/** `noun verb` → the keys its `textOmit` names. */
function omittedKeys(): Map<string, string[]> {
  const out = new Map<string, string[]>();
  for (const cmd of COMMANDS) {
    for (const [verb, spec] of Object.entries(cmd.verbs)) {
      const keys = (spec.textOmit ?? []).map((o) => (typeof o === "string" ? o : o.key));
      if (keys.length > 0) out.set(`${cmd.noun} ${verb}`, keys);
    }
  }
  return out;
}

/** True when code span `span` reads output key `key`. */
function spanNamesKey(span: string, key: string): boolean {
  const k = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`^${k}(?:$|\\.|\\s*(?:!=|=|:|<|>))|\\.${k}(?:$|\\.|\\b)`).test(span);
}

/** Every workflow and agent prompt source file. */
function proseFiles(): string[] {
  const root = getCoreRoot();
  return ["workflows", "prompts"].flatMap((dir) =>
    fs
      .readdirSync(path.join(root, dir))
      .filter((f) => f.endsWith(".md"))
      .map((f) => path.join(root, dir, f)),
  );
}

/** `noun verb: key` for each omitted key the verb's `output` does not declare. */
function undeclaredOmits(): string[] {
  return COMMANDS.flatMap((cmd) =>
    Object.entries(cmd.verbs).flatMap(([verb, spec]) =>
      (omittedKeys().get(`${cmd.noun} ${verb}`) ?? [])
        .filter((key) => !Object.hasOwn(spec.output, key))
        .map((key) => `${cmd.noun} ${verb}: ${key}`),
    ),
  );
}

/** `file:line \`span\` (key)` for each code span in `file` that names one of `keys`. */
function spanHits(file: string, keys: string[]): string[] {
  return fs
    .readFileSync(file, "utf-8")
    .split("\n")
    .flatMap((line, i) =>
      [...line.matchAll(/`([^`\n]+)`/g)].flatMap((m) =>
        keys
          .filter((key) => spanNamesKey(m[1]!, key))
          .map((key) => `${path.basename(file)}:${i + 1} \`${m[1]}\` (${key})`),
      ),
    );
}

describe("textOmit audit", () => {
  it("omits the keys the plan names", () => {
    const clamp = ["clamp"];
    expect(Object.fromEntries(omittedKeys())).toEqual({
      "steps finish": ["row", "checks"],
      "steps done": ["row"],
      "workflows start": ["row"],
      "workflows fail": ["row"],
      "workflows close": ["row", "counterRow", "outcomeRow"],
      "tests run": clamp,
      "context diff": clamp,
      "context run-block": clamp,
      "context ledger-scan": clamp,
      "context fetch": clamp,
    });
  });

  it("every omitted key is a declared output key", () => {
    expect(undeclaredOmits()).toEqual([]);
  });

  it("no workflow or prompt code span reads an omitted key", () => {
    const keys = [...new Set([...omittedKeys().values()].flat())];
    expect(proseFiles().flatMap((file) => spanHits(file, keys))).toEqual([]);
  });

  it.each([
    ["row", "row", true],
    ["row.parentSha", "row", true],
    ["written.row.fid", "row", true],
    ["checks: []", "checks", true],
    ["clamp != null", "clamp", true],
    ["rows", "row", false],
    ["transport-row", "row", false],
    ["bkit prs checks --number", "checks", false],
    ["parentSha", "row", false],
  ])("spanNamesKey(%j, %j) = %s", (span, key, want) => {
    expect(spanNamesKey(span, key)).toBe(want);
  });
});
