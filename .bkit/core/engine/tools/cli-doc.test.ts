// tools/cli-doc.test.ts — `.bkit/cli.md`'s generated region matches the command specs.

import * as fs from "node:fs";
import * as path from "node:path";

import { describe, expect, it } from "vitest";

import { CLASSIC_VERB_HELP, CLASSIC_VERBS } from "../cli.js";
import { COMMANDS } from "../commands/registry.js";
import { DOC_PATH, REGION_END, REGION_START, USE_LABEL, renderRegion, syncDoc } from "./cli-doc.js";

describe("cli-doc", () => {
  it("the generated region of .bkit/cli.md is current (run pnpm cli:sync)", () => {
    const text = fs.readFileSync(path.join(process.cwd(), DOC_PATH), "utf-8");
    expect(syncDoc(text)).toBe(text);
  });

  it("lists every classic verb exactly once", () => {
    expect(CLASSIC_VERB_HELP.map((h) => h.verb).sort()).toEqual([...CLASSIC_VERBS].sort());
  });

  it("renders a row per command verb, with its use", () => {
    const region = renderRegion();
    for (const cmd of COMMANDS) {
      expect(region).toContain(`### \`${cmd.noun}\``);
      for (const [verb, spec] of Object.entries(cmd.verbs)) {
        expect(region).toContain(`| \`${verb}\` | ${USE_LABEL[spec.use]} |`);
      }
    }
  });

  it("writes an em dash in an empty table cell", () => {
    expect(renderRegion()).toContain("| `bkit check` | — |");
  });

  it("escapes a pipe inside a table cell", () => {
    expect(renderRegion()).toContain("`--auto=<claude\\|cursor\\|opencode>`");
  });

  it("replaces only the region between line-anchored markers", () => {
    const text = `intro \`${REGION_START}\` quoted\n${REGION_START}\nSTALE-REGION-BODY\n${REGION_END}\noutro\n`;
    const synced = syncDoc(text);
    expect(synced.startsWith(`intro \`${REGION_START}\` quoted\n`)).toBe(true);
    expect(synced).not.toContain("STALE-REGION-BODY");
    expect(synced.endsWith("\noutro\n")).toBe(true);
  });

  it("throws when the markers are missing", () => {
    expect(() => syncDoc("no region here\n")).toThrow(/missing/);
  });
});
