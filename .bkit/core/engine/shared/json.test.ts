import { describe, expect, it } from "vitest";

import { parseJson } from "./json";

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
