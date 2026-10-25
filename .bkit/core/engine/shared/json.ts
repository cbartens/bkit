// shared/json.ts — `JSON.parse` and file reads without the throw, for consumer-authored input.
//
// Every read of a file bkit does not own (package.json, .mcp.json, settings JSON,
// .bkit/version) must fail open into a result the caller reports in its own terms,
// never abort install, upgrade or `bkit check`. One shape, one catch — so the
// defensive-slop gate reads a single documented fallback instead of one per caller.
// `audits/repo/json-parse-owner.test.ts` fails on a `JSON.parse` inside a `try` anywhere else.

import * as fs from "node:fs";

export type JsonRead = { ok: true; value: unknown } | { ok: false };

/** `JSON.parse(raw)` as a result: `{ ok: true, value }`, or `{ ok: false }` when not JSON. */
export function parseJson(raw: string): JsonRead {
  try {
    return { ok: true, value: JSON.parse(raw) as unknown };
  } catch {
    // Not JSON: the result says so, and the caller reports it in its own terms.
    return { ok: false };
  }
}

export type TextRead = { ok: true; text: string } | { ok: false };

/** The file at `file` as UTF-8 text, or `{ ok: false }` when it cannot be read. */
export function readTextFile(file: string): TextRead {
  try {
    return { ok: true, text: fs.readFileSync(file, "utf-8") };
  } catch {
    // Missing, unreadable or a directory: the result says so, and the caller reports it.
    return { ok: false };
  }
}

export type DirRead = { ok: true; names: string[] } | { ok: false };

/** The entry names of the directory `dir`, or `{ ok: false }` when it cannot be read. */
export function readDirNames(dir: string): DirRead {
  try {
    return { ok: true, names: fs.readdirSync(dir) };
  } catch {
    // Missing, unreadable or not a directory: the result says so, and the caller reports it.
    return { ok: false };
  }
}

/** `parseJson` over the file at `file`; `{ ok: false }` also when the file cannot be read. */
export function readJsonFile(file: string): JsonRead {
  const read = readTextFile(file);
  return read.ok ? parseJson(read.text) : { ok: false };
}
