import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { runCommand } from "../lib";
import { parsePlans, parseWorkstreams, plansCommand } from "./plans";
import { stampMarker } from "./tracker";

const dirs: string[] = [];
afterEach(() => {
  for (const d of dirs.splice(0)) fs.rmSync(d, { recursive: true, force: true });
});

async function run(argv: string[], file: string) {
  const dir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-plans-")));
  dirs.push(dir);
  fs.writeFileSync(path.join(dir, "organised.md"), file);
  const out: string[] = [];
  const err: string[] = [];
  const code = await runCommand(
    ["plans", ...argv, "--artifact=organised.md", "--json"],
    [plansCommand],
    {
      classicVerbs: new Set(),
      cwd: dir,
      io: { stdout: (t) => out.push(t), stderr: (t) => err.push(t) },
    },
  );
  return { code, json: out.length ? JSON.parse(out.join("")) : undefined, err: err.join("") };
}

/** The workstreams `@bkit-design-organise` writes (its prompt's Output format). */
const WORKSTREAMS = `Verdict: PASS

<!-- verdict:end -->

# Design

## Architecture

### WS-9: Not a workstream (design body, above the section)

## Suggested Workstreams

### WS-1: Data model

#### Scope

Tables and migrations. Requires: nothing from the UI.

#### Requires

[]

#### Rationale

Everything reads it.

### WS-2: API

#### Scope

Endpoints.

#### Requires

[WS-1]

#### Rationale

Needs the tables.

### WS-3: UI

#### Requires

[WS-1, WS-2]
`;

/** The plans section `@bkit-design-organise` appends after the workstreams. */
const PLANS = `
## Suggested Plans

### P-1: Storage and API

#### Deliverable

Items can be saved and read over the API.

#### Covers

[WS-1, WS-2]

#### Requires

[]

### P-2: UI

#### Deliverable

The item screen.

#### Covers

[WS-3]

#### Requires

[P-1]
`;

const ORGANISED = `${WORKSTREAMS}${PLANS}`;

describe("parseWorkstreams", () => {
  it("reads every WS block under the Suggested Workstreams heading, with its Requires", () => {
    expect(parseWorkstreams(ORGANISED)).toEqual([
      { id: "WS-1", n: 1, name: "Data model", requires: [], requiresText: "[]" },
      { id: "WS-2", n: 2, name: "API", requires: ["WS-1"], requiresText: "[WS-1]" },
      { id: "WS-3", n: 3, name: "UI", requires: ["WS-1", "WS-2"], requiresText: "[WS-1, WS-2]" },
    ]);
  });

  it("stops at the next level-2 heading", () => {
    const ws = parseWorkstreams(`${WORKSTREAMS}\n## Appendix\n\n### WS-7: After the section\n`);
    expect(ws.map((w) => w.id)).toEqual(["WS-1", "WS-2", "WS-3"]);
  });

  it("uses the last Suggested Workstreams section", () => {
    const md = `## Suggested Workstreams\n\n### WS-1: Old\n\n${WORKSTREAMS}`;
    expect(parseWorkstreams(md)[0]!.name).toBe("Data model");
  });

  it("reads an inline Requires line directly under the heading", () => {
    const md = "## Suggested Workstreams\n\n### WS-4: Jobs\n**Requires:** [WS-2]\n";
    expect(parseWorkstreams(md)).toEqual([
      { id: "WS-4", n: 4, name: "Jobs", requires: ["WS-2"], requiresText: "[WS-2]" },
    ]);
  });

  it("no section, or no blocks in it, is an empty list", () => {
    expect(parseWorkstreams("# Design\n")).toEqual([]);
    expect(parseWorkstreams("## Suggested Workstreams\n\nnone\n")).toEqual([]);
  });
});

describe("parsePlans", () => {
  it("reads Covers and Requires per plan", () => {
    expect(parsePlans(ORGANISED)).toEqual([
      {
        id: "P-1",
        n: 1,
        name: "Storage and API",
        covers: ["WS-1", "WS-2"],
        requires: [],
        requiresText: "[]",
      },
      { id: "P-2", n: 2, name: "UI", covers: ["WS-3"], requires: ["P-1"], requiresText: "[P-1]" },
    ]);
  });

  it("reads inline Covers and Requires lines directly under the heading", () => {
    const md = `${WORKSTREAMS}\n## Suggested Plans\n\n### P-1: All\n**Covers:** [WS-1, WS-2, WS-3]\n**Requires:** []\n`;
    expect(parsePlans(md)).toEqual([
      {
        id: "P-1",
        n: 1,
        name: "All",
        covers: ["WS-1", "WS-2", "WS-3"],
        requires: [],
        requiresText: "[]",
      },
    ]);
  });

  it("falls back to one plan per workstream", () => {
    expect(parsePlans(WORKSTREAMS)).toEqual([
      { id: "P-1", n: 1, name: "Data model", covers: ["WS-1"], requires: [], requiresText: "[]" },
      { id: "P-2", n: 2, name: "API", covers: ["WS-2"], requires: ["P-1"], requiresText: "[P-1]" },
      {
        id: "P-3",
        n: 3,
        name: "UI",
        covers: ["WS-3"],
        requires: ["P-1", "P-2"],
        requiresText: "[P-1, P-2]",
      },
    ]);
  });

  it("stops at the next level-2 heading", () => {
    const md = `${ORGANISED}\n## Appendix\n\n### P-7: After the section\n`;
    expect(parsePlans(md).map((p) => p.id)).toEqual(["P-1", "P-2"]);
  });
});

describe("bkit plans parse", () => {
  it("emits the plans and the workstreams", async () => {
    const r = await run(["parse"], ORGANISED);
    expect(r.code).toBe(0);
    expect(r.json.plans.map((p: { id: string }) => p.id)).toEqual(["P-1", "P-2"]);
    expect(r.json.workstreams).toHaveLength(3);
  });

  it("zero workstreams exits 3 (the workflow's Failure Path)", async () => {
    const r = await run(["parse"], "# Design\n");
    expect(r.code).toBe(3);
    expect(r.err).toContain("Suggested Workstreams");
  });
});

describe("bkit plans comment", () => {
  const LINK =
    "[docs/plans/202610/12-csv-design.md](https://github.com/acme/app/blob/dev/docs/plans/202610/12-csv-design.md)";
  const body = (comment: string) =>
    comment.replace(/^(###### bkit:generated) [0-9a-f]{12}\n/, "$1\n");

  it("comment lists plans and their covered workstreams", async () => {
    const r = await run(
      ["comment", "--fid=12-csv", "--month=202610", "--owner-repo=acme/app"],
      ORGANISED,
    );
    expect(r.code).toBe(0);
    expect(fs.readFileSync(r.json.commentFile, "utf-8")).toBe(r.json.comment);
    expect(stampMarker(r.json.comment)).toBe(r.json.comment);
    expect(body(r.json.comment)).toBe(
      [
        "###### bkit:generated",
        "### Step 11 — Suggested Plans",
        "Advisory only. NEVER auto-trigger.",
        "- P-1: Storage and API. Covers: WS-1 (Data model), WS-2 (API). Requires: []",
        "- P-2: UI. Covers: WS-3 (UI). Requires: [P-1]",
        "Filing one issue per plan: put `**Parent design:** [12-csv-design.md](https://github.com/acme/app/blob/dev/docs/plans/202610/12-csv-design.md)` and `**Workstreams:** {its Covers ids}` in its body, and list the plan issues it requires in a blocked-by block (.bkit/trackers.md § Issue shapes).",
        LINK,
      ].join("\n"),
    );
    expect(r.json.comment).not.toContain("one issue per workstream");
  });

  it("one plan is planned on this issue, with no filing line", async () => {
    const md = `${WORKSTREAMS}\n## Suggested Plans\n\n### P-1: All\n\n#### Covers\n\n[WS-1, WS-2, WS-3]\n\n#### Requires\n\n[]\n`;
    const r = await run(["comment", "--fid=12-csv", "--month=202610", "--owner-repo=acme/app"], md);
    expect(r.code).toBe(0);
    expect(body(r.json.comment)).toBe(
      [
        "###### bkit:generated",
        "### Step 11 — Suggested Plans",
        "Advisory only. NEVER auto-trigger.",
        "- P-1: All. Covers: WS-1 (Data model), WS-2 (API), WS-3 (UI). Requires: []",
        "One plan covers every workstream: plan it on this issue, no new issue.",
        LINK,
      ].join("\n"),
    );
  });

  it("needs --owner-repo", async () => {
    expect((await run(["comment", "--fid=1-x", "--month=202610"], ORGANISED)).code).toBe(2);
  });
});
