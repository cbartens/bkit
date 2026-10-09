import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { readPackageJson } from "./package-json";

const dirs: string[] = [];
afterEach(() => {
  for (const d of dirs.splice(0)) fs.rmSync(d, { recursive: true, force: true });
});

function dir(body?: string) {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-pkg-"));
  dirs.push(d);
  if (body !== undefined) fs.writeFileSync(path.join(d, "package.json"), body);
  return d;
}

describe("readPackageJson", () => {
  it("returns the parsed object", () => {
    expect(readPackageJson(dir('{"scripts":{"a":"b"}}'))).toEqual({
      ok: true,
      pkg: { scripts: { a: "b" } },
    });
  });

  it.each([
    ["no file", undefined, "missing"],
    ["not JSON", "{oops", "unparseable"],
    ["JSON but not an object", "[1]", "unparseable"],
    ["JSON null", "null", "unparseable"],
  ])("%s -> %s", (_, body, reason) => {
    expect(readPackageJson(dir(body))).toEqual({ ok: false, reason });
  });
});
