// The clamp record log: one JSON line per artifact `bkit context clamp` trimmed,
// read back into the step's status row (`clamped`) by `bkit context finalise` and
// `bkit steps finish --clamp-log`. Lives outside commands/workflow so both read it
// without importing each other.
import * as fs from "node:fs";
import * as path from "node:path";
import { git, parseJson } from "../commands/lib.js";
/** `tmp/bkit-clamp-{fid}-{step}[-{attempt}].jsonl` in the checkout `cwd` sits in. */
export function clampLogPath(cwd, fid, step, attempt) {
    const top = git(cwd, ["rev-parse", "--show-toplevel"]) ?? cwd;
    return path.join(top, "tmp", `bkit-clamp-${fid}-${step}${attempt ? `-${attempt}` : ""}.jsonl`);
}
/** Every record in the log; reading never drains it, so a retried status block sees the same array. */
export function readRecords(log, onBad = () => undefined) {
    if (!fs.existsSync(log))
        return [];
    return fs
        .readFileSync(log, "utf-8")
        .split("\n")
        .filter((l) => l.trim() !== "")
        .flatMap((l) => {
        const parsed = parseJson(l);
        if (!parsed.ok)
            onBad(l);
        return parsed.ok ? [parsed.value] : [];
    });
}
