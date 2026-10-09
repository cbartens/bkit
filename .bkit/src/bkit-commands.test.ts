/**
 * bkit-commands.test.ts — every `bkit <noun> <verb>` command follows the conventions.
 *
 * Fixed up front because there is no pilot command to settle them: a mistake in
 * flag naming, output shape, or exit codes would otherwise be copied into every
 * command. The source folders are enumerated at run time, so a command added
 * tomorrow is covered or this suite is red.
 */

import * as fs from "node:fs";
import * as path from "node:path";

import { describe, expect, it } from "vitest";

import { CLASSIC_VERBS } from "./bkit-cli";
import {
  EXIT,
  OWN_EXIT_MAX,
  OWN_EXIT_MIN,
  commandHelp,
  runCommand,
  verbHelp,
  type CommandSpec,
} from "./commands/lib";
import { COMMANDS } from "./commands/registry";

const SRC = path.resolve(__dirname);
const GROUPS = ["workflow", "ci", "setup"] as const;

const KEBAB = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
const CAMEL = /^[a-z][a-zA-Z0-9]*$/;

/** Every way a spec can break the conventions; empty = conforms. */
function conventionProblems(cmd: CommandSpec): string[] {
  const problems: string[] = [];
  const where = (verb?: string) => `bkit ${cmd.noun}${verb ? ` ${verb}` : ""}`;
  if (!KEBAB.test(cmd.noun)) problems.push(`${where()}: noun is not lowercase kebab-case`);
  if (Object.keys(cmd.verbs).length === 0) problems.push(`${where()}: no verbs`);
  if (!commandHelp(cmd).includes("Exit codes:"))
    problems.push(`${where()}: --help lists no exit codes`);
  for (const [verb, spec] of Object.entries(cmd.verbs)) {
    if (!KEBAB.test(verb)) problems.push(`${where(verb)}: verb is not lowercase kebab-case`);
    if (!spec.summary) problems.push(`${where(verb)}: no summary`);
    for (const f of spec.flags) {
      if (!KEBAB.test(f.name)) problems.push(`${where(verb)}: flag --${f.name} is not kebab-case`);
      if (!f.help) problems.push(`${where(verb)}: flag --${f.name} has no help`);
    }
    if (Object.keys(spec.output).length === 0)
      problems.push(`${where(verb)}: declares no output keys`);
    for (const key of Object.keys(spec.output)) {
      if (!CAMEL.test(key)) problems.push(`${where(verb)}: output key "${key}" is not camelCase`);
    }
    for (const code of Object.keys(spec.exitCodes ?? {}).map(Number)) {
      if (code < OWN_EXIT_MIN || code > OWN_EXIT_MAX) {
        problems.push(
          `${where(verb)}: own exit code ${code} outside ${OWN_EXIT_MIN}-${OWN_EXIT_MAX}`,
        );
      }
    }
    if (!verbHelp(cmd, verb).includes("Exit codes:"))
      problems.push(`${where(verb)}: --help lists no exit codes`);
  }
  return problems;
}

/** Command sources: every non-test `.ts` in the group folders. */
function commandSources(): string[] {
  return GROUPS.flatMap((g) => {
    const dir = path.join(SRC, "commands", g);
    if (!fs.existsSync(dir)) return [];
    return fs
      .readdirSync(dir)
      .filter((f) => f.endsWith(".ts") && !f.endsWith(".test.ts"))
      .map((f) => path.join("commands", g, f));
  });
}

describe("registered commands", () => {
  it("follow the conventions", () => {
    expect(COMMANDS.flatMap(conventionProblems)).toEqual([]);
  });

  it("have unique nouns", () => {
    const nouns = COMMANDS.map((c) => c.noun);
    expect(nouns.filter((n, i) => nouns.indexOf(n) !== i)).toEqual([]);
  });

  it("are reachable: bkit <noun> <verb> --help routes to the command", async () => {
    for (const cmd of COMMANDS) {
      for (const verb of Object.keys(cmd.verbs)) {
        const out: string[] = [];
        const code = await runCommand([cmd.noun, verb, "--help"], COMMANDS, {
          classicVerbs: CLASSIC_VERBS,
          io: { stdout: (t) => out.push(t), stderr: () => undefined },
        });
        expect(code, `bkit ${cmd.noun} ${verb} --help`).toBe(EXIT.OK);
        expect(out.join("")).toBe(verbHelp(cmd, verb));
      }
    }
  });
});

describe("command sources", () => {
  const sources = commandSources();
  const registry = fs.readFileSync(path.join(SRC, "commands", "registry.ts"), "utf-8");

  it("are all imported by the registry", () => {
    const unlisted = sources.filter((s) => {
      const spec = `./${path.relative("commands", s).replace(/\.ts$/, ".js")}`;
      return !registry.includes(`"${spec}"`);
    });
    expect(unlisted).toEqual([]);
  });

  it("each have a test file next to them", () => {
    const untested = sources.filter(
      (s) => !fs.existsSync(path.join(SRC, s.replace(/\.ts$/, ".test.ts"))),
    );
    expect(untested).toEqual([]);
  });

  it("write only through ctx.log / ctx.emit, so stderr is always tagged [bkit-<noun>]", () => {
    const direct = sources.filter((s) =>
      /\bconsole\.(log|error|warn|info)\b|process\.(stdout|stderr)\.write/.test(
        fs.readFileSync(path.join(SRC, s), "utf-8"),
      ),
    );
    expect(direct).toEqual([]);
  });
});

describe("the convention checker rejects what it should", () => {
  const good: CommandSpec = {
    noun: "widgets",
    summary: "Count widgets.",
    verbs: {
      count: {
        summary: "Count them.",
        flags: [{ name: "sub-plan", type: "string", help: "which sub-plan" }],
        output: { subPlan: "echoed" },
        exitCodes: { 3: "none found" },
        run: () => EXIT.OK,
      },
    },
  };

  it("accepts a conforming command", () => {
    expect(conventionProblems(good)).toEqual([]);
  });

  it.each([
    [
      "a camelCase flag",
      { flags: [{ name: "subPlan", type: "string" as const, help: "x" }] },
      "not kebab-case",
    ],
    ["a snake_case output key", { output: { sub_plan: "x" } }, "not camelCase"],
    ["no output keys", { output: {} }, "declares no output keys"],
    ["a shared-range exit code", { exitCodes: { 80: "mine" } }, "outside 3-79"],
  ])("rejects %s", (_, override, problem) => {
    const bad: CommandSpec = { ...good, verbs: { count: { ...good.verbs.count!, ...override } } };
    expect(conventionProblems(bad).join("\n")).toContain(problem);
  });

  it("rejects an uppercase noun", () => {
    expect(conventionProblems({ ...good, noun: "Widgets" }).join("\n")).toContain("kebab-case");
  });
});
