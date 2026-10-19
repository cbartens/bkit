import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { parseJson, readJsonFile } from "./json";

describe("parseJson", () => {
  it("returns the parsed value for any valid JSON", () => {
    expect(parseJson('{"a":1}')).toEqual({ ok: true, value: { a: 1 } });
    expect(parseJson("[1,2]")).toEqual({ ok: true, value: [1, 2] });
    expect(parseJson("null")).toEqual({ ok: true, value: null });
    expect(parseJson("123")).toEqual({ ok: true, value: 123 });
  });

  it("returns { ok: false } for input that is not JSON", () => {
    expect(parseJson("")).toEqual({ ok: false });
    expect(parseJson("{ not json")).toEqual({ ok: false });
    expect(parseJson("0.5.0")).toEqual({ ok: false });
  });

  it("never throws, whatever the input", () => {
    expect(() => parseJson("{{{")).not.toThrow();
    expect(() => parseJson('{"a":')).not.toThrow();
  });
});

describe("readJsonFile", () => {
  const dirs: string[] = [];
  afterEach(() => {
    for (const d of dirs.splice(0)) fs.rmSync(d, { recursive: true, force: true });
  });

  function dir(): string {
    const d = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-json-"));
    dirs.push(d);
    return d;
  }

  it("returns the parsed value of a JSON file", () => {
    const file = path.join(dir(), "a.json");
    fs.writeFileSync(file, '{"a":1}');
    expect(readJsonFile(file)).toEqual({ ok: true, value: { a: 1 } });
  });

  it("returns { ok: false } for a file that is not JSON", () => {
    const file = path.join(dir(), "a.json");
    fs.writeFileSync(file, "{ not json");
    expect(readJsonFile(file)).toEqual({ ok: false });
  });

  it("returns { ok: false } for a missing file", () => {
    expect(readJsonFile(path.join(dir(), "missing.json"))).toEqual({ ok: false });
  });

  it("returns { ok: false } when the path is a directory", () => {
    expect(readJsonFile(dir())).toEqual({ ok: false });
  });
});
