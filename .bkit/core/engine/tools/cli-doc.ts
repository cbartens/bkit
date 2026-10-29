// tools/cli-doc.ts — check and sync the generated region of `.bkit/cli.md`.
//
// The region lists every `bkit <verb>` (`cli.ts` `CLASSIC_VERB_HELP`) and every
// `bkit <noun> <verb>` (`commands/registry.ts`), rendered from the same specs `--help`
// prints. Check mode runs in the test suite (`tools/cli-doc.test.ts`); write mode is
// `pnpm cli:sync`. Text outside the region is hand-written and kept as is.

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

import { CLASSIC_VERB_HELP } from "../cli.js";
import type { CommandSpec, FlagSpec } from "../commands/lib.js";
import { COMMANDS } from "../commands/registry.js";

export const DOC_PATH = path.join(".bkit", "core", ".bkit", "cli.md");
export const REGION_START = "<!-- cli:start -->";
export const REGION_END = "<!-- cli:end -->";

export const USE_LABEL = { "by-hand": "by hand", workflow: "workflow" } as const;

/** A markdown table cell: pipes escaped, newlines flattened, `—` when empty. */
const cell = (text: string) => text.replace(/\|/g, "\\|").replace(/\s*\n\s*/g, " ") || "—";

const flagCell = (flags: readonly FlagSpec[]) =>
  flags.map((f) => (f.required ? `**\`--${f.name}\`**` : `\`--${f.name}\``)).join(" ");

function table(head: string[], rows: string[][]): string[] {
  return [
    "<!-- prettier-ignore -->",
    `| ${head.join(" | ")} |`,
    `| ${head.map(() => "---").join(" | ")} |`,
    ...rows.map((r) => `| ${r.join(" | ")} |`),
  ];
}

function nounSection(cmd: CommandSpec): string[] {
  const rows = Object.entries(cmd.verbs).map(([verb, spec]) => [
    `\`${verb}\``,
    USE_LABEL[spec.use],
    cell(flagCell(spec.flags)),
    cell(spec.summary),
  ]);
  return [
    `### \`${cmd.noun}\``,
    "",
    cell(cmd.summary),
    "",
    ...table(["Verb", "Use", "Flags", "What it does"], rows),
    "",
  ];
}

/** The generated region, markers included. */
export function renderRegion(): string {
  const classic = CLASSIC_VERB_HELP.map(({ verb, args, flags, summary }) => [
    `\`${["bkit", verb, ...args.split(" ").filter((w) => /^[a-z]/.test(w))].join(" ")}\``,
    cell(flags.map((f) => `\`${f}\``).join(" ")),
    cell(summary),
  ]);
  const nouns = [...COMMANDS].sort((a, b) => a.noun.localeCompare(b.noun));
  return [
    REGION_START,
    "",
    "## Commands you run",
    "",
    ...table(["Command", "Flags", "What it does"], classic),
    "",
    "## Workflow commands",
    "",
    "Use: `by hand` = safe and useful outside a workflow run; `workflow` = a workflow step only (writes run state, takes locks, commits, pushes or posts). **Bold** flag = required.",
    "",
    ...nouns.flatMap(nounSection),
    REGION_END,
  ].join("\n");
}

/** Offset of `marker` standing alone on a line, else -1 (prose may quote the marker inline). */
function markerLine(text: string, marker: string): number {
  return new RegExp(`^${marker}$`, "m").exec(text)?.index ?? -1;
}

/** `text` with its generated region replaced by `renderRegion()`; throws when the markers are missing. */
export function syncDoc(text: string): string {
  const start = markerLine(text, REGION_START);
  const end = markerLine(text, REGION_END);
  if (start < 0 || end < start) {
    throw new Error(`${DOC_PATH}: missing ${REGION_START} / ${REGION_END}`);
  }
  return text.slice(0, start) + renderRegion() + text.slice(end + REGION_END.length);
}

function main(argv: string[]): number {
  const file = path.join(process.cwd(), DOC_PATH);
  const text = fs.readFileSync(file, "utf-8");
  const synced = syncDoc(text);
  if (synced === text) return 0;
  if (argv.includes("--write")) {
    fs.writeFileSync(file, synced, "utf-8");
    console.error(`[bkit-cli] rewrote ${DOC_PATH}`);
    return 0;
  }
  console.error(`[bkit-cli] ${DOC_PATH}: generated region stale (run pnpm cli:sync)`);
  return 1;
}

if (process.argv[1] && fs.existsSync(process.argv[1])) {
  if (fs.realpathSync(fileURLToPath(import.meta.url)) === fs.realpathSync(process.argv[1])) {
    process.exitCode = main(process.argv.slice(2));
  }
}
