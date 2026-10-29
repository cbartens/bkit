/**
 * commands/conventions.test.ts — every `bkit <noun> <verb>` command follows the conventions.
 *
 * Flag naming, output shape, and exit codes. The source folders are enumerated at run
 * time, so every command is covered; the engine's `shared/` helpers carry tests too.
 */

import * as fs from "node:fs";
import * as path from "node:path";

import { describe, expect, it } from "vitest";

import { CLASSIC_VERBS } from "../cli";
import {
  EXIT,
  OWN_EXIT_MAX,
  OWN_EXIT_MIN,
  SHARED_EXIT_CODES,
  commandHelp,
  runCommand,
  verbHelp,
  type CommandSpec,
} from "./lib";
import { COMMANDS } from "./registry";

const SRC = path.resolve(__dirname, "..");
const GROUPS = ["workflow", "ci", "setup"] as const;

const KEBAB = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
const CAMEL = /^[a-z][a-zA-Z0-9]*$/;

/** The codes a help text's `Exit codes:` table lists. */
function helpExitCodes(help: string): Set<number> {
  const lines = help.split("\n");
  const start = lines.indexOf("Exit codes:");
  const codes = new Set<number>();
  if (start === -1) return codes;
  for (const line of lines.slice(start + 1)) {
    if (line.trim() === "") break;
    const m = /^\s*(\d+)\s/.exec(line);
    if (m) codes.add(Number(m[1]));
  }
  return codes;
}

/**
 * Every way a spec can break the conventions; empty = conforms. `returned` = the own
 * exit codes the command's source can return: each must be in some verb's --help.
 */
function conventionProblems(cmd: CommandSpec, returned: number[] = []): string[] {
  const problems: string[] = [];
  const where = (verb?: string) => `bkit ${cmd.noun}${verb ? ` ${verb}` : ""}`;
  if (!KEBAB.test(cmd.noun)) problems.push(`${where()}: noun is not lowercase kebab-case`);
  if (Object.keys(cmd.verbs).length === 0) problems.push(`${where()}: no verbs`);
  const shared = Object.keys(SHARED_EXIT_CODES).map(Number);
  const commandCodes = helpExitCodes(commandHelp(cmd));
  for (const code of shared.filter((c) => !commandCodes.has(c)))
    problems.push(`${where()}: --help does not list shared exit code ${code}`);
  const listed = new Set<number>();
  for (const [verb, spec] of Object.entries(cmd.verbs)) {
    if (!KEBAB.test(verb)) problems.push(`${where(verb)}: verb is not lowercase kebab-case`);
    if (!spec.summary) problems.push(`${where(verb)}: no summary`);
    for (const f of spec.flags) {
      if (!KEBAB.test(f.name)) problems.push(`${where(verb)}: flag --${f.name} is not kebab-case`);
      if (!f.help) problems.push(`${where(verb)}: flag --${f.name} has no help`);
    }
    if (spec.flags.filter((f) => f.positional).length > 1)
      problems.push(`${where(verb)}: more than one positional flag`);
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
    const verbCodes = helpExitCodes(verbHelp(cmd, verb));
    for (const code of [...shared, ...Object.keys(spec.exitCodes ?? {}).map(Number)]) {
      if (!verbCodes.has(code))
        problems.push(`${where(verb)}: --help does not list exit code ${code}`);
    }
    for (const code of verbCodes) listed.add(code);
  }
  for (const code of returned.filter((c) => !listed.has(c)))
    problems.push(`${where()}: can exit ${code}, but no verb's --help lists it`);
  return problems;
}

/**
 * The own exit codes (3-79) a command source can return: every `EXIT_*` constant it
 * references, and every member it references of an exit-code map (`GATE.NO_RUN`) —
 * an object the file uses as an `exitCodes` key. Names resolve against the module's
 * own exports and the named imports from its relative imports.
 */
async function ownCodesReturned(rel: string): Promise<number[]> {
  const abs = path.join(SRC, rel);
  const text = fs.readFileSync(abs, "utf-8");
  const scope = new Map<string, unknown>(Object.entries(await import(abs)));
  for (const m of text.matchAll(/import\s*\{([^}]*)\}\s*from\s*"(\.[^"]+)"/g)) {
    const mod = (await import(
      path.resolve(path.dirname(abs), m[2]!.replace(/\.js$/, ".ts"))
    )) as Record<string, unknown>;
    for (const part of m[1]!.split(",")) {
      const [orig, alias] = part
        .trim()
        .replace(/^type\s+/, "")
        .split(/\s+as\s+/);
      if (orig && orig in mod) scope.set(alias ?? orig, mod[orig]);
    }
  }
  const codes = new Set<number>();
  for (const [, name] of text.matchAll(/\b(EXIT_[A-Z0-9_]+)\b/g)) {
    const v = scope.get(name!);
    if (typeof v === "number") codes.add(v);
  }
  const maps = new Set([...text.matchAll(/\[([A-Z][A-Z0-9_]*)\.[A-Z0-9_]+\]/g)].map((m) => m[1]!));
  for (const [, obj, key] of text.matchAll(/\b([A-Z][A-Z0-9_]*)\.([A-Z][A-Z0-9_]*)\b/g)) {
    const map = scope.get(obj!);
    if (!maps.has(obj!) || map === null || typeof map !== "object") continue;
    const v = (map as Record<string, unknown>)[key!];
    if (typeof v === "number") codes.add(v);
  }
  return [...codes].filter((c) => c >= OWN_EXIT_MIN && c <= OWN_EXIT_MAX).sort((a, b) => a - b);
}

/** The CommandSpecs a module exports: objects with a `noun` and `verbs`. */
async function exportedCommands(rel: string): Promise<CommandSpec[]> {
  const mod = (await import(path.join(SRC, rel))) as Record<string, unknown>;
  return Object.values(mod).filter(
    (v): v is CommandSpec => v !== null && typeof v === "object" && "noun" in v && "verbs" in v,
  );
}

/** The non-test `.ts` files directly inside `dir`. */
function sourceFiles(dir: string): string[] {
  return fs.readdirSync(dir).filter((f) => f.endsWith(".ts") && !f.endsWith(".test.ts"));
}

/** Command sources: every non-test `.ts` in the group folders. */
function commandSources(): string[] {
  return GROUPS.flatMap((g) => {
    const dir = path.join(SRC, "commands", g);
    if (!fs.existsSync(dir)) return [];
    return sourceFiles(dir).map((f) => path.join("commands", g, f));
  });
}

/**
 * Group-folder sources that export no command, by file: helpers shared by the
 * commands next to them. Each still needs its test file.
 */
const HELPER_SOURCES = new Set([
  // The measured blocks of a run's outcome row, shared by `workflows close` and `runs dispatch`.
  path.join("commands", "workflow", "run-facts.ts"),
  // The engine's tracker client, shared by every verb that reads or writes the issue.
  path.join("commands", "workflow", "tracker.ts"),
  // The summary `workflows summary` writes: verdict rules, next step, markdown.
  path.join("commands", "workflow", "summary.ts"),
  // Each workflow's ordered steps and resume rule, read by `status resume`.
  path.join("commands", "workflow", "step-table.ts"),
  // The newest numbered draft in a run's log folder, read by `workflow promote` and run-facts.
  path.join("commands", "workflow", "plan-versions.ts"),
  // The plan's group and task blocks, read by `tests`, `challenge`, the summary and run-facts.
  path.join("commands", "workflow", "plan-blocks.ts"),
  // Where a named test sits in its file and what it runs, read by `tests` and `branches`.
  path.join("commands", "workflow", "test-blocks.ts"),
]);

/** Every way a command source breaks "exports a command, and each is in COMMANDS"; empty = conforms. */
async function exportProblems(rel: string): Promise<string[]> {
  const cmds = await exportedCommands(rel);
  const problems =
    cmds.length === 0 && !HELPER_SOURCES.has(rel) ? [`${rel}: exports no command`] : [];
  for (const cmd of cmds) {
    if (!COMMANDS.includes(cmd)) problems.push(`${rel}: bkit ${cmd.noun} is not in COMMANDS`);
  }
  return problems;
}

describe("registered commands", () => {
  it("follow the conventions, and list every exit code their source can return", async () => {
    const problems: string[] = [];
    for (const rel of commandSources()) {
      const returned = await ownCodesReturned(rel);
      for (const cmd of await exportedCommands(rel))
        problems.push(...conventionProblems(cmd, returned));
    }
    expect(problems).toEqual([]);
    // Every registered command came from a scanned source.
    const scanned = (await Promise.all(commandSources().map(exportedCommands))).flat();
    expect(COMMANDS.filter((c) => !scanned.includes(c)).map((c) => c.noun)).toEqual([]);
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

  it("each export a command, and every exported command is in COMMANDS (reachable)", async () => {
    const problems: string[] = [];
    for (const rel of sources) problems.push(...(await exportProblems(rel)));
    expect(problems).toEqual([]);
  });

  it("each have a test file next to them", () => {
    const untested = sources.filter(
      (s) => !fs.existsSync(path.join(SRC, s.replace(/\.ts$/, ".test.ts"))),
    );
    expect(untested).toEqual([]);
  });

  it("the engine's shared/ helpers each have a test file next to them", () => {
    const dir = path.join(SRC, "shared");
    const untested = sourceFiles(dir).filter(
      (f) => !fs.existsSync(path.join(dir, f.replace(/\.ts$/, ".test.ts"))),
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
        use: "workflow",
        flags: [{ name: "verify-attempt", type: "string", help: "which verify attempt" }],
        output: { verifyAttempt: "echoed" },
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
      { flags: [{ name: "verifyAttempt", type: "string" as const, help: "x" }] },
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

  it("rejects a command whose source can exit with a code no --help lists", () => {
    expect(conventionProblems(good, [3])).toEqual([]);
    expect(conventionProblems(good, [3, 7]).join("\n")).toContain(
      "bkit widgets: can exit 7, but no verb's --help lists it",
    );
  });

  it("reads the exit codes a help text actually lists, so the help check can fail", () => {
    expect([...helpExitCodes(verbHelp(good, "count"))].sort((a, b) => a - b)).toEqual([
      0, 1, 2, 3, 80, 81, 82,
    ]);
    expect(helpExitCodes("Exit codes:\n  0  ok\n\nmore")).toEqual(new Set([0]));
    expect(helpExitCodes("no table here")).toEqual(new Set());
  });

  it("finds the own exit codes a real source can return, through constants and exit-code maps", async () => {
    const runs = await ownCodesReturned(path.join("commands", "workflow", "runs.ts"));
    // GATE.* members (an exitCodes map) and EXIT_* constants; TIMEOUTS.* never counts.
    expect(runs).toEqual(expect.arrayContaining([3, 4, 5, 10, 11, 12, 13, 14, 15, 16, 17, 20]));
    expect(runs).not.toContain(30);
  });
});
