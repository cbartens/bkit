/**
 * audits/repo/readme-models.test.ts — the README "Which model does each job" table agrees with
 * the pins and scores it summarises.
 *
 * Sources:
 *   - `prompts.md` § Models: the model each agent runs on, one column per provider.
 *   - `providers.md` § Agentic-coding parity board: each model's LiveBench Agentic Coding score.
 *   - `providers.md` § Per-tier lineup across providers: the Claude bar for each tier.
 *
 * The README has one row per § Models provider column and one column per Claude tier. A tier
 * is the set of agents pinned to one Claude model; the Claude Code row names that model. Each
 * cell lists every model its provider pins for that tier, each with its board score, or
 * `not measured` when the board has no row for it. The Claude Code row carries the bars.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";
import { parseModelLookupForColumn } from "../../render/models";
import { getBkitDocsRoot } from "../../shared/package-roots";

const REPO_ROOT = path.resolve(__dirname, "../../../../..");
const README = fs.readFileSync(path.join(REPO_ROOT, "README.md"), "utf-8");
const PROMPTS_MD_PATH = path.join(getBkitDocsRoot(), "prompts.md");
const PROVIDERS_MD = fs.readFileSync(path.join(getBkitDocsRoot(), "providers.md"), "utf-8");

/** README row label → § Models provider column. */
const README_ROWS: Record<string, string> = {
  "Claude Code": "Anthropic",
  Cursor: "Cursor",
  "opencode + OpenRouter": "OpenRouter",
  "opencode + Ollama": "Ollama",
  "opencode + OpenCode Zen": "OpenCode Zen",
  "opencode + OpenCode Go": "OpenCode Go",
  Codex: "OpenAI",
  "Google Antigravity": "Google",
};

/** Catalog id → the name the parity board lists the model under. */
const BOARD_NAME: Record<string, string> = {
  "cursor-grok-4.5-high": "grok-4.5",
};

/** Cells of the first markdown table after `heading`; header row first, separator row dropped. */
function tableAfter(content: string, heading: string): string[][] {
  const start = content.indexOf(`\n${heading}\n`);
  if (start === -1) throw new Error(`heading not found: ${heading}`);
  const rows: string[][] = [];
  for (const line of content.slice(start + heading.length + 2).split("\n")) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("|")) {
      if (rows.length > 0) break;
      continue;
    }
    const cells = trimmed
      .slice(1, -1)
      .split("|")
      .map((c) => c.trim());
    if (cells.every((c) => /^-+$/.test(c))) continue;
    rows.push(cells);
  }
  return rows;
}

const unquote = (cell: string): string => cell.replace(/^`|`$/g, "");

interface Entry {
  model: string;
  score: string;
  isBar: boolean;
}

/** Every "`model` · score" entry in a README cell; score is a number, `~N`, or `not measured`. */
function entries(cell: string): Entry[] {
  return Array.from(
    cell.matchAll(/`([^`]+)` · (?:bar \*\*(~?[\d.]+)\*\*|([\d.]+)|(not measured))/g),
  ).map((m) => ({
    model: m[1],
    score: m[2] ?? m[3] ?? m[4],
    isBar: m[2] !== undefined,
  }));
}

const readmeTable = tableAfter(README, "## Which model does each job");
const readmeBody = readmeTable.slice(1);
const claudeRow = readmeBody.find((r) => r[0] === "Claude Code");
if (!claudeRow) throw new Error("README models table has no Claude Code row");
/** README column index → the Claude model that defines its tier. */
const tierByColumn = claudeRow.slice(1).map((cell) => entries(cell)[0]?.model ?? "");

const modelsHeader = tableAfter(fs.readFileSync(PROMPTS_MD_PATH, "utf-8"), "## Models")[0];
const gatewayColumns = modelsHeader.slice(
  modelsHeader.indexOf("Anthropic"),
  modelsHeader.indexOf("Effort"),
);
const claudePins = parseModelLookupForColumn(PROMPTS_MD_PATH, "Anthropic");

/** Distinct models `column` pins across the agents whose Claude pin is `tier`. */
function pinned(column: string, tier: string): string[] {
  const pins = parseModelLookupForColumn(PROMPTS_MD_PATH, column);
  const models = [...claudePins]
    .filter(([, claude]) => claude === tier)
    .map(([name]) => pins.get(name));
  return [...new Set(models)].map(String).sort();
}

/** Parity board: model name → score, bold and dagger stripped. */
const boardScores = new Map(
  tableAfter(PROVIDERS_MD, "### Agentic-coding parity board")
    .slice(1)
    .filter((r) => /^`[^`]+`$/.test(r[0]))
    .map((r) => [unquote(r[0]), r[1].replace(/\*\*/g, "").replace(/\s*†$/, "")]),
);

/** Lineup header: tier word (`opus` / `sonnet` / `haiku`) → Claude bar. */
const tierBars = new Map(
  tableAfter(PROVIDERS_MD, "### Per-tier lineup across providers")[0]
    .map((cell) => cell.match(/^(\w+) — target (~?[\d.]+)$/))
    .filter((m): m is RegExpMatchArray => m !== null)
    .map((m) => [m[1], m[2]]),
);

/** "`row` / `tier` tier" → the models a README cell lists, or (`fromPins`) § Models pins. */
function tierCells(fromPins: boolean): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const row of readmeBody) {
    tierByColumn.forEach((tier, i) => {
      out[`${row[0]} / ${tier} tier`] = fromPins
        ? pinned(README_ROWS[row[0]], tier)
        : [...new Set(entries(row[i + 1]).map((e) => e.model))].sort();
    });
  }
  return out;
}

/** README score as written: `bar N` on the Claude Code row, `N` or `not measured` elsewhere. */
const written = (e: Entry): string => (e.isBar ? `bar ${e.score}` : e.score);

const claudeEntries = claudeRow.slice(1).map((cell) => entries(cell)[0]);
const otherEntries = readmeBody
  .filter((r) => r !== claudeRow)
  .flatMap((r) => r.slice(1).flatMap((cell) => entries(cell).map((e) => [r[0], e] as const)));

/** Parity-board name for a pinned model id: provider prefix dropped, catalog aliases resolved. */
const boardName = (model: string): string => BOARD_NAME[model] ?? model.split("/").pop() ?? model;

/** Claude model → its README bar as written, or (`fromLineup`) the lineup's target for its tier. */
function claudeBars(fromLineup: boolean): Record<string, string> {
  return Object.fromEntries(
    claudeEntries.map((e) => [
      e.model,
      fromLineup
        ? `bar ${tierBars.get(e.model.match(/opus|sonnet|haiku/)?.[0] ?? "")}`
        : written(e),
    ]),
  );
}

/** "`row` / `model`" → its README score as written, or (`fromBoard`) its parity-board score. */
function otherScores(fromBoard: boolean): Record<string, string> {
  return Object.fromEntries(
    otherEntries.map(([row, e]) => [
      `${row} / ${e.model}`,
      fromBoard ? (boardScores.get(boardName(e.model)) ?? "not measured") : written(e),
    ]),
  );
}

describe("README § Which model does each job", () => {
  it("has one row per § Models provider column", () => {
    expect(readmeBody.map((r) => r[0])).toEqual(Object.keys(README_ROWS));
    expect(Object.values(README_ROWS).sort()).toEqual([...gatewayColumns].sort());
  });

  it("has one column per Claude tier", () => {
    expect([...tierByColumn].sort()).toEqual([...new Set(claudePins.values())].sort());
  });

  it("lists exactly the models each provider pins for each tier", () => {
    expect(tierCells(false)).toEqual(tierCells(true));
  });

  it("gives the Claude Code row the lineup's bar for each tier", () => {
    expect(tierBars.size).toBeGreaterThan(0);
    expect(claudeBars(false)).toEqual(claudeBars(true));
  });

  it("gives every other model its parity-board score, or `not measured` when the board has none", () => {
    expect(boardScores.size).toBeGreaterThan(0);
    expect(otherScores(false)).toEqual(otherScores(true));
  });
});
