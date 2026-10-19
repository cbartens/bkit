import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import {
  readDependencyNames,
  readDependencySpec,
  readInstallingVersion,
  readPackageJson,
} from "./package-json";
import { getPkgRoot } from "./package-roots";

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

describe("readDependencyNames", () => {
  it("lists the names across all four dependency fields", () => {
    const body = JSON.stringify({
      dependencies: { a: "1" },
      devDependencies: { b: "1" },
      optionalDependencies: { c: "1" },
      peerDependencies: { d: "1" },
      scripts: { e: "x" },
    });
    expect(readDependencyNames(dir(body))).toEqual(["a", "b", "c", "d"]);
  });

  it.each([
    ["no file", undefined],
    ["not JSON", "{oops"],
    ["no dependency fields", '{"name":"x"}'],
    ["a dependency field that is not an object", '{"dependencies":"a"}'],
  ])("%s -> no names", (_, body) => {
    expect(readDependencyNames(dir(body))).toEqual([]);
  });
});

describe("readDependencySpec", () => {
  it("reads the spec from dependencies, devDependencies or optionalDependencies", () => {
    for (const field of ["dependencies", "devDependencies", "optionalDependencies"]) {
      const d = dir(JSON.stringify({ [field]: { "@cbartens/bkit": "file:../bkit.tgz" } }));
      expect(readDependencySpec(d, "@cbartens/bkit")).toBe("file:../bkit.tgz");
    }
  });

  it("returns null when undeclared, peer-only, or package.json is unreadable", () => {
    expect(readDependencySpec(dir("{}"), "x")).toBeNull();
    expect(readDependencySpec(dir('{"peerDependencies":{"x":"^1"}}'), "x")).toBeNull();
    expect(readDependencySpec(dir("{oops"), "x")).toBeNull();
    expect(readDependencySpec(dir(), "x")).toBeNull();
  });
});

describe("readInstallingVersion", () => {
  it("returns the semver of the running bkit package by default", () => {
    expect(readInstallingVersion()).toMatch(/^\d+\.\d+\.\d+/);
  });

  it("defaults to the package root", () => {
    expect(readInstallingVersion()).toBe(readInstallingVersion(getPkgRoot()));
  });

  it("returns the version of the package at the given root", () => {
    expect(readInstallingVersion(dir('{"name":"x","version":"9.8.7"}'))).toBe("9.8.7");
  });

  it("throws, naming the file, when package.json is missing", () => {
    const d = dir();
    expect(() => readInstallingVersion(d)).toThrow(
      `bkit's own package.json is missing (${path.join(d, "package.json")}); reinstall @cbartens/bkit.`,
    );
  });

  it.each([
    ["not JSON", "{oops"],
    ["a JSON array", "[1]"],
    ["JSON null", "null"],
  ])("throws when package.json is %s", (_, body) => {
    expect(() => readInstallingVersion(dir(body))).toThrow("is not a JSON object");
  });

  it.each([
    ["no version", '{"name":"x"}'],
    ["a non-string version", '{"version":5}'],
    ["a null version", '{"version":null}'],
    ["an empty version", '{"version":""}'],
  ])("throws when package.json has %s", (_, body) => {
    expect(() => readInstallingVersion(dir(body))).toThrow('has no string "version"');
  });
});
