import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { runCommand } from "../lib";
import { parseWorkstreams, workstreamsCommand } from "./workstreams";

const dirs: string[] = [];
afterEach(() => {
  for (const d of dirs.splice(0)) fs.rmSync(d, { recursive: true, force: true });
});

async function run(argv: string[], file: string) {
  const dir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-ws-")));
  dirs.push(dir);
  fs.writeFileSync(path.join(dir, "organised.md"), file);
  const out: string[] = [];
  const err: string[] = [];
  const code = await runCommand(
    ["workstreams", ...argv, "--artifact=organised.md"],
    [workstreamsCommand],
    {
      classicVerbs: new Set(),
      cwd: dir,
      io: { stdout: (t) => out.push(t), stderr: (t) => err.push(t) },
    },
  );
  return { code, json: out.length ? JSON.parse(out.join("")) : undefined, err: err.join("") };
}

/** The shape `@bkit-design-organise` writes (its prompt's Output format). */
const ORGANISED = `Verdict: PASS

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

describe("parseWorkstreams", () => {
  it("reads every WS block under the Suggested Workstreams heading, with its Requires", () => {
    expect(parseWorkstreams(ORGANISED)).toEqual([
      { id: "WS-1", n: 1, name: "Data model", requires: [], requiresText: "[]" },
      { id: "WS-2", n: 2, name: "API", requires: ["WS-1"], requiresText: "[WS-1]" },
      { id: "WS-3", n: 3, name: "UI", requires: ["WS-1", "WS-2"], requiresText: "[WS-1, WS-2]" },
    ]);
  });

  it("stops at the next level-2 heading", () => {
    const ws = parseWorkstreams(`${ORGANISED}\n## Appendix\n\n### WS-7: After the section\n`);
    expect(ws.map((w) => w.id)).toEqual(["WS-1", "WS-2", "WS-3"]);
  });

  it("uses the last Suggested Workstreams section", () => {
    const md = `## Suggested Workstreams\n\n### WS-1: Old\n\n${ORGANISED}`;
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

describe("bkit workstreams parse", () => {
  it("emits the workstreams", async () => {
    const r = await run(["parse"], ORGANISED);
    expect(r.code).toBe(0);
    expect(r.json.workstreams).toHaveLength(3);
  });

  it("zero workstreams exits 3 (the workflow's Failure Path)", async () => {
    const r = await run(["parse"], "# Design\n");
    expect(r.code).toBe(3);
    expect(r.err).toContain("Suggested Workstreams");
  });
});

describe("bkit workstreams comment", () => {
  it("builds the Step 11 comment body", async () => {
    const r = await run(
      ["comment", "--fid=12-csv", "--month=202610", "--owner-repo=acme/app"],
      ORGANISED,
    );
    expect(r.code).toBe(0);
    expect(r.json.comment).toBe(
      [
        "###### bkit:generated",
        "### Step 11 — Suggested Workstreams",
        "Advisory only. NEVER auto-trigger.",
        "- WS-1: Data model. Requires: []",
        "- WS-2: API. Requires: [WS-1]",
        "- WS-3: UI. Requires: [WS-1, WS-2]",
        "[docs/plans/202610/12-csv-design.md](https://github.com/acme/app/blob/dev/docs/plans/202610/12-csv-design.md)",
      ].join("\n"),
    );
  });

  it("needs --owner-repo", async () => {
    expect((await run(["comment", "--fid=1-x", "--month=202610"], ORGANISED)).code).toBe(2);
  });
});
