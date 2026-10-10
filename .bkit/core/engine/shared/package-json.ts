// shared/package-json.ts — read a checkout's `package.json`, saying why when it cannot.
//
// Commands that look up a script or a `bkit` setting need to tell "no file" and
// "file is not JSON" apart from "key absent", so a broken manifest is named in the
// message instead of reading as an empty one.

import * as fs from "node:fs";
import * as path from "node:path";

import { parseJson } from "../commands/lib.js";

export type PackageJsonRead =
  { ok: true; pkg: Record<string, unknown> } | { ok: false; reason: "missing" | "unparseable" };

/** `dir/package.json` as an object, or why it could not be read as one. */
export function readPackageJson(dir: string): PackageJsonRead {
  const file = path.join(dir, "package.json");
  if (!fs.existsSync(file)) return { ok: false, reason: "missing" };
  const parsed = parseJson(fs.readFileSync(file, "utf-8"));
  if (
    !parsed.ok ||
    typeof parsed.value !== "object" ||
    parsed.value === null ||
    Array.isArray(parsed.value)
  ) {
    return { ok: false, reason: "unparseable" };
  }
  return { ok: true, pkg: parsed.value as Record<string, unknown> };
}
