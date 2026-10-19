// shared/json.ts — `JSON.parse` without the throw, for consumer-authored input.
//
// Every read of a file bkit does not own (package.json, .mcp.json, settings JSON,
// .bkit/version) must fail open into a result the caller reports in its own terms,
// never abort install, upgrade or `bkit check`. One shape, one catch — so the
// defensive-slop gate reads a single documented fallback instead of one per caller.
// `audits/repo/json-parse-owner.test.ts` fails on a `JSON.parse` inside a `try` anywhere else.
import * as fs from "node:fs";
/** `JSON.parse(raw)` as a result: `{ ok: true, value }`, or `{ ok: false }` when not JSON. */
export function parseJson(raw) {
    try {
        return { ok: true, value: JSON.parse(raw) };
    }
    catch {
        // Not JSON: the result says so, and the caller reports it in its own terms.
        return { ok: false };
    }
}
/** `parseJson` over the file at `file`; `{ ok: false }` also when the file cannot be read. */
export function readJsonFile(file) {
    let raw;
    try {
        raw = fs.readFileSync(file, "utf-8");
    }
    catch {
        // Missing, unreadable or a directory: the result says so, like malformed JSON.
        return { ok: false };
    }
    return parseJson(raw);
}
