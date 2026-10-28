// audits/workflows/model-presets-parity.test.ts — the prose tables that restate model pins
// agree with the § Models table the installer actually reads.
//
// § Models is the only table parsed at install. § Model Presets (the OpenRouter options and
// their copy-paste override block), the § Orchestrators session-model table and the
// providers.md parity board each restate pins by hand; these tests check they name what
// § Models and the Option 2 override block emit.
import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";
import { parseModelLookupForColumn } from "../../render/models";
import { getBkitDocsRoot } from "../../shared/package-roots";

const PROMPTS_MD = path.join(getBkitDocsRoot(), "prompts.md");
const PROMPTS = fs.readFileSync(PROMPTS_MD, "utf-8");
const PROVIDERS = fs.readFileSync(path.join(getBkitDocsRoot(), "providers.md"), "utf-8");

const OPENCODE_COLUMNS = ["OpenRouter", "Ollama", "OpenCode Zen", "OpenCode Go"];

/** Text from the `heading` line up to the next heading of the same or higher level. */
function section(content: string, heading: string): string {
  const start = content.indexOf(`\n${heading}\n`);
  if (start === -1) throw new Error(`heading not found: ${heading}`);
  const level = heading.match(/^#+/)?.[0].length ?? 2;
  const rest = content.slice(start + heading.length + 2);
  const next = rest.search(new RegExp(`^#{1,${level}} `, "m"));
  return next === -1 ? rest : rest.slice(0, next);
}

/** Every markdown table in `text`, each as rows of cells; separator rows dropped. */
function tables(text: string): string[][][] {
  const out: string[][][] = [];
  let current: string[][] | null = null;
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("|")) {
      if (current) out.push(current);
      current = null;
      continue;
    }
    const cells = trimmed
      .slice(1, -1)
      .split("|")
      .map((c) => c.trim());
    if (cells.every((c) => /^-+$/.test(c))) continue;
    (current ??= []).push(cells);
  }
  if (current) out.push(current);
  return out;
}

/** A cell's model id: backticks and bold stripped, the vendor path dropped. */
const bareSlug = (cell: string): string =>
  cell.replace(/[`*]/g, "").trim().split("/").pop() ?? cell;

const presets = section(PROMPTS, "## Model Presets");
const [summaryTable, agentTable, overrideTable] = tables(presets);
const openrouter = parseModelLookupForColumn(PROMPTS_MD, "OpenRouter");
/** Option 2 override block: agent → model, as written (vendor-prefixed OpenRouter id). */
const option2 = new Map(overrideTable.slice(1).map((r) => [r[0], r[2]]));

/** Per-agent table cells that disagree with § Models (Shipped today, Option 1) or Option 2. */
function agentTableDrift(): string[] {
  const drift: string[] = [];
  for (const [agentCell, shipped, option1, option2Cell] of agentTable.slice(1)) {
    const agent = agentCell.replace(/`/g, "");
    const pinned = bareSlug(openrouter.get(agent) ?? "(no § Models row)");
    const spendMore = option2.has(agent) ? bareSlug(option2.get(agent)!) : pinned;
    if (bareSlug(shipped) !== pinned) drift.push(`${agent}: Shipped today ${shipped} != ${pinned}`);
    if (bareSlug(option1) !== pinned) drift.push(`${agent}: Option 1 ${option1} != ${pinned}`);
    if (bareSlug(option2Cell) !== spendMore) {
      drift.push(`${agent}: Option 2 ${option2Cell} != ${spendMore}`);
    }
  }
  return drift;
}

/** The summary table's judge cell for the preset row whose label contains `preset`. */
const judgeCell = (preset: string): string =>
  summaryTable.find((r) => r[0].includes(preset))?.[1] ?? "";

/** The first backticked model in a cell. */
const firstModel = (cell: string): string => cell.match(/`([^`]+)`/)?.[1] ?? "";

const openrouterIdsLine = presets.split("\n").find((l) => l.startsWith("OpenRouter IDs:")) ?? "";
/** `short` = `id` pairs on the OpenRouter IDs line. */
const openrouterIdPairs = [...openrouterIdsLine.matchAll(/`([^`]+)` = `([^`]+)`/g)].map(
  (m): [string, string] => [m[1], m[2]],
);
const knownOpenrouterIds = new Set([...openrouter.values(), ...option2.values()]);

const [orchestratorTable] = tables(section(PROMPTS, "### Orchestrators (slash commands)"));

/** Orchestrator rows whose OpenAI cell names a model the § Models OpenAI column never pins. */
function strayOrchestratorOpenaiCells(): string[][] {
  const col = orchestratorTable[0].indexOf("OpenAI");
  const pinned = new Set(parseModelLookupForColumn(PROMPTS_MD, "OpenAI").values());
  return orchestratorTable
    .slice(1)
    .map((r) => [r[0], r[col].replace(/`/g, "")])
    .filter(([, model]) => !pinned.has(model));
}

const roleBoard = tables(PROVIDERS).find(
  (t) => t[0][0] === "Model" && t[0].includes("Role in bkit"),
);

/** "`model` / `column`" for each board model whose role claims every opencode column but one lacks it. */
function unpinnedEveryColumnRoles(board: string[][]): string[] {
  const roleCol = board[0].indexOf("Role in bkit");
  const columns = OPENCODE_COLUMNS.map((c): [string, string[]] => [
    c,
    [...parseModelLookupForColumn(PROMPTS_MD, c).values()],
  ]);
  const unpinned: string[] = [];
  for (const row of board.slice(1)) {
    if (!row[roleCol].startsWith("every opencode column's")) continue;
    const model = row[0].replace(/`/g, "");
    for (const [column, pins] of columns) {
      if (!pins.some((p) => p.includes(model))) unpinned.push(`${model} / ${column}`);
    }
  }
  return unpinned;
}

describe("§ Model Presets", () => {
  it("has the summary, per-agent and Option 2 override tables", () => {
    expect(summaryTable[0][0]).toBe("Preset");
    expect(agentTable[0]).toEqual([
      "Agent",
      "Shipped today",
      "Option 1 — default",
      "Option 2 — spend more",
    ]);
    expect(overrideTable[0]).toEqual(["Prompt", "Provider", "Model"]);
    expect(overrideTable.slice(1).every((r) => r[1] === "openrouter")).toBe(true);
  });

  it("per-agent table agrees with § Models OpenRouter column and the Option 2 override block", () => {
    expect(agentTable.length - 1).toBe(openrouter.size);
    expect(agentTableDrift()).toEqual([]);
  });

  it("summary rows name the judge models Option 1 ships and Option 2 overrides to", () => {
    const option2Models = new Set([...option2.values()].map(bareSlug));
    const option1Judges = new Set([...option2.keys()].map((a) => bareSlug(openrouter.get(a)!)));
    expect(option2Models.size).toBe(1);
    expect(option1Judges.size).toBe(1);
    expect(firstModel(judgeCell("Option 1"))).toBe([...option1Judges][0]);
    expect(firstModel(judgeCell("Option 2"))).toBe([...option2Models][0]);
  });

  it("the OpenRouter IDs line names at least one id", () => {
    expect(openrouterIdPairs.length).toBeGreaterThan(0);
  });

  it.each(openrouterIdPairs)(
    "OpenRouter IDs line: `%s` = `%s` is a bare id the § Models cells or override block use",
    (short, id) => {
      expect(knownOpenrouterIds).toContain(id);
      expect(bareSlug(id)).toBe(short);
    },
  );
});

describe("§ Orchestrators session-model table", () => {
  it("OpenAI cells only name models the § Models OpenAI column pins", () => {
    expect(orchestratorTable[0].indexOf("OpenAI")).toBeGreaterThan(0);
    expect(strayOrchestratorOpenaiCells()).toEqual([]);
  });
});

describe("providers.md parity board — Role in bkit", () => {
  it("a model whose role names every opencode column is pinned on every opencode column", () => {
    expect(roleBoard).toBeDefined();
    expect(unpinnedEveryColumnRoles(roleBoard!)).toEqual([]);
  });
});
