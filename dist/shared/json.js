// shared/json.ts — `JSON.parse` without the throw, for consumer-authored input.
//
// Every read of a file bkit does not own (package.json, .mcp.json, settings JSON,
// .bkit/version) must fail open into a result the caller reports in its own terms,
// never abort install, upgrade or `bkit check`. One shape, one catch — so the
// defensive-slop gate reads a single documented fallback instead of one per caller.
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
