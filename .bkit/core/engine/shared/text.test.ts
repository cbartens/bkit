// shared/text.test.ts — text rendering of engine output and the round-trip-checked markdown table.

import { describe, expect, it } from "vitest";

import {
  MISSING,
  checkedTable,
  markdownTable,
  parseMarkdownTable,
  parseText,
  renderText,
} from "./text";

describe("markdownTable", () => {
  it("renders a header, a separator and one line per row", () => {
    expect(
      markdownTable(
        ["Kind", "Rows"],
        [
          ["outcome", 2],
          ["friction", 1],
        ],
      ),
    ).toEqual(["| Kind | Rows |", "| --- | --- |", "| outcome | 2 |", "| friction | 1 |"]);
  });

  it("renders nothing for no rows", () => {
    expect(markdownTable(["Kind"], [])).toEqual([]);
  });

  it.each([
    ["a|b", "a\\|b"],
    ["back\\slash", "back\\\\slash"],
    ["two\nlines", "two\\nlines"],
    ["crlf\r\n", "crlf\\r\\n"],
  ])("escapes %j in a cell", (value, cell) => {
    expect(markdownTable(["v"], [[value]])[2]).toBe(`| ${cell} |`);
  });

  it("escapes header cells too", () => {
    expect(markdownTable(["a|b"], [["x"]])[0]).toBe("| a\\|b |");
  });

  it("prints a missing cell as an explicit dash, distinct from an empty string and a literal dash", () => {
    const lines = markdownTable(["a", "b", "c"], [[undefined, "", MISSING]]);
    expect(lines[2]).toBe(`| ${MISSING} |  | \\${MISSING} |`);
  });
});

describe("parseMarkdownTable", () => {
  it("reads rows back as records, leaving missing cells out", () => {
    const text = markdownTable(["a", "b"], [["1|x", undefined]]).join("\n");
    expect(parseMarkdownTable(text)).toEqual({ head: ["a", "b"], rows: [{ a: "1|x" }] });
  });

  it("returns null for text that is not a table", () => {
    expect(parseMarkdownTable("just text")).toBeNull();
    expect(parseMarkdownTable("| a |\n| b |")).toBeNull();
  });

  it("returns null when a row has the wrong number of cells", () => {
    expect(parseMarkdownTable("| a | b |\n| --- | --- |\n| 1 |")).toBeNull();
  });
});

describe("checkedTable", () => {
  /** The rows a checked table reads back as, typed, or the refusal reason. */
  const parsedBack = (rows: Record<string, unknown>[]) => {
    const res = checkedTable(rows);
    return res.ok ? parseText(`rows:\n${res.text}\n`)?.rows : res.reason;
  };
  /** The table's body lines (below the header and separator), or why it was refused. */
  const tableRows = (rows: Record<string, unknown>[]) => {
    const res = checkedTable(rows);
    return res.ok ? res.text.split("\n").slice(2) : res.reason;
  };
  it("tabulates an array of flat objects and round-trips it", () => {
    const rows = [
      { id: 1, name: "one", ok: true },
      { id: 2, name: "two", ok: false },
    ];
    expect(parsedBack(rows)).toEqual(rows);
  });

  it("round-trips values holding pipes, backslashes, line breaks, dashes and empty strings", () => {
    const rows = [
      { v: "a|b", w: "c\\d" },
      { v: "line\nbreak\r", w: "" },
      { v: MISSING, w: "\\|" },
      { v: " padded ", w: "|" },
    ];
    expect(parsedBack(rows)).toEqual(rows);
  });

  it("keeps types: a string that reads like null, a boolean, a number or a container stays a string", () => {
    const rows = [
      { v: null, w: 5, x: true, y: false },
      { v: "null", w: "5", x: "true", y: "false" },
      { v: "[]", w: "{}", x: '"quoted"', y: '"' },
      { v: "-1.5e3", w: -1.5e3, x: "007", y: 0 },
    ];
    expect(parsedBack(rows)).toEqual(rows);
    expect(tableRows([{ v: null }, { v: "null" }])).toEqual(["| null |", '| "null" |']);
  });

  it("tells an empty string from a missing cell", () => {
    expect(parsedBack([{ a: "", b: 1 }, { b: 2 }])).toEqual([{ a: "", b: 1 }, { b: 2 }]);
  });

  it("refuses a value that would not read back as itself", () => {
    expect(checkedTable([{ n: Number.NaN }])).toEqual({
      ok: false,
      reason: "table parses back to different rows",
    });
  });

  it("round-trips ragged rows: columns are the union of keys, holes stay holes", () => {
    const res = checkedTable([{ a: 1 }, { b: 2 }, { a: 3, c: null }]);
    expect(res).toEqual({
      ok: true,
      text: [
        "| a | b | c |",
        "| --- | --- | --- |",
        `| 1 | ${MISSING} | ${MISSING} |`,
        `| ${MISSING} | 2 | ${MISSING} |`,
        `| 3 | ${MISSING} | null |`,
      ].join("\n"),
    });
    expect(parsedBack([{ a: 1 }, { b: 2 }, { a: 3, c: null }])).toEqual([
      { a: 1 },
      { b: 2 },
      { a: 3, c: null },
    ]);
  });

  it.each([
    ["an empty array", []],
    ["not an array", { a: 1 }],
    ["a scalar item", [{ a: 1 }, 2]],
    ["a null item", [null]],
    ["an array item", [[1, 2]]],
    ["a nested object value", [{ a: { b: 1 } }]],
    ["a nested array value", [{ a: [1] }]],
    ["an object with no keys", [{}]],
  ])("refuses %s", (_label, value) => {
    expect(checkedTable(value)).toEqual({ ok: false, reason: expect.stringMatching(/./) });
  });
});

describe("renderText", () => {
  it("prints scalars as key: value lines", () => {
    expect(renderText({ fid: "F-467", count: 2, ok: true, none: null })).toBe(
      "fid: F-467\ncount: 2\nok: true\nnone: null\n",
    );
  });

  it("quotes a string that would read as another type", () => {
    expect(renderText({ fid: "467", n: "null", t: "true", l: "[]" })).toBe(
      'fid: "467"\nn: "null"\nt: "true"\nl: "[]"\n',
    );
  });

  it("leaves undefined keys out, as JSON does", () => {
    expect(renderText({ a: 1, b: undefined })).toBe("a: 1\n");
  });

  it("prints an empty string, escapes line breaks and backslashes", () => {
    expect(renderText({ e: "", m: "a\nb", p: "c\\d" })).toBe('e: ""\nm: a\\nb\np: c\\\\d\n');
  });

  it("prints empty arrays and objects explicitly", () => {
    expect(renderText({ list: [], obj: {} })).toBe("list: []\nobj: {}\n");
  });

  it("prints an array of flat objects as a table under its key", () => {
    expect(renderText({ rows: [{ id: 1 }, { id: 2, x: "a|b" }] })).toBe(
      ["rows:", "| id | x |", "| --- | --- |", `| 1 | ${MISSING} |`, "| 2 | a\\|b |", ""].join(
        "\n",
      ),
    );
  });

  it("prints nested objects as indented key: blocks", () => {
    expect(renderText({ run: { fid: "a1", time: { minutes: 3 } }, ok: true })).toBe(
      ["run:", "  fid: a1", "  time:", "    minutes: 3", "ok: true", ""].join("\n"),
    );
  });

  it("indents a table nested inside an object", () => {
    expect(renderText({ run: { steps: [{ n: 1 }] } })).toBe(
      ["run:", "  steps:", "  | n |", "  | --- |", "  | 1 |", ""].join("\n"),
    );
  });

  it("prints scalar arrays and mixed arrays as list items", () => {
    expect(renderText({ ids: ["a", 2], mixed: [{ a: { b: 1 } }, "x", [1]] })).toBe(
      [
        "ids:",
        "  - a",
        "  - 2",
        "mixed:",
        "  -",
        "    a:",
        "      b: 1",
        "  - x",
        "  -",
        "    - 1",
        "",
      ].join("\n"),
    );
  });

  it("prints every table it renders so that it parses back", () => {
    const payload = {
      rows: [{ a: "x|y", b: "line\nbreak" }, { a: MISSING }],
      nested: { rows: [{ c: "\\" }] },
    };
    const text = renderText(payload);
    const top = text.split("\n").slice(1, 5).join("\n");
    expect(parseMarkdownTable(top)?.rows).toEqual([{ a: "x|y", b: "line\nbreak" }, { a: MISSING }]);
  });

  it("prints empty containers inside a list explicitly", () => {
    expect(renderText({ items: [[], {}, ""] })).toBe('items:\n  - []\n  - {}\n  - ""\n');
  });

  it("quotes keys that would not read back as keys", () => {
    expect(renderText({ "a: b": 1, "-x": 2, "| y": 3, "": 4 })).toBe(
      '"a: b": 1\n"-x": 2\n"| y": 3\n"": 4\n',
    );
  });
});

describe("parseText", () => {
  /** What `--json` prints for the same payload. */
  const asJson = (payload: unknown) => JSON.parse(JSON.stringify(payload)) as unknown;

  it.each([
    ["scalars of every type", { s: "x", n: 1.5, z: 0, neg: -3, t: true, f: false, nul: null }],
    ["strings reading as other types", { a: "1", b: "null", c: "false", d: "[]", e: "{}" }],
    ["quotes and spaces", { q: '"x"', one: '"', sp: " lead", tr: "trail ", e: "" }],
    ["escapes", { nl: "a\nb", cr: "a\r", bs: "a\\nb", pipe: "a|b", dash: MISSING }],
    ["empty containers", { a: [], o: {}, nested: { a: [], o: {} } }],
    ["a table", { rows: [{ id: 1, v: "1" }, { id: 2 }, { id: 3, w: null }] }],
    ["a table inside an object", { run: { steps: [{ n: 1, ok: true }] }, after: "x" }],
    ["a table inside a list item", { items: [{ rows: [{ a: 1 }] }, { b: 2 }] }],
    ["lists", { ids: ["a", 2, null, true], deep: [[1, [2, []]], {}, { a: { b: [] } }] }],
    ["odd keys", { "a: b": { "-": 1 }, "| x": [], "": "", '"k"': 1 }],
    ["undefined values", { a: undefined, b: [undefined, 1], c: { d: undefined } }],
    ["a non-finite number", { n: Number.POSITIVE_INFINITY }],
    ["nothing", {}],
  ])("reads back %s as --json prints them", (_label, payload) => {
    expect(parseText(renderText(payload))).toEqual(asJson(payload));
  });

  it.each([
    ["a key with no value or block", "a:\n"],
    ["a bad escape", "a: x\\q\n"],
    ["a stray deeper line", "a: 1\n  b: 2\n"],
    ["a line with no key", "just text\n"],
  ])("returns null for %s", (_label, text) => {
    expect(parseText(text)).toBeNull();
  });
});
