// ledgers/journal.ts — the dispatch seam's row primitives.
//
// `commands/lib.ts` `runCommand` writes two kinds of row while a workflow run is
// active: an `engine-call` row in the run's `status.jsonl` (one per bkit command
// dispatched) and a `friction` row in the run's own `.bkit/friction.jsonl` (one per
// unexpected non-zero exit). This module builds and appends them. It is a leaf:
// it imports only `node:*`, `../shared/json.js`, `./status.js` and `./telemetry.js`, never a `commands/**`
// module, so `lib.ts` can import it without a cycle. The caller passes in the exit
// codes that are declared routing (`SHARED_EXIT_CODES` plus the verb's own).
//
// Every export is synchronous and never throws; a write returns a result object the
// caller logs and swallows, so the journal can never change a command's exit code.
import * as fs from "node:fs";
import * as path from "node:path";
import { parseJson } from "../shared/json.js";
import { appendLine, statusTimestamp } from "./status.js";
import { APPEND_LEDGERS, SCHEMA, mintTs, resolveRepoSlug, validate, writerProblem, } from "./telemetry.js";
/** The kill switch: `BKIT_ENGINE_JOURNAL=off` keeps the seam from writing any row. */
export function journalEnabled(env = process.env) {
    return env["BKIT_ENGINE_JOURNAL"] !== "off";
}
/** Flag names in `argv` (`--name=value` and `--name value` both give `name`); values are never kept. */
function flagNames(argv) {
    const names = argv
        .filter((arg) => arg.startsWith("--") && arg.length > 2)
        .map((arg) => {
        const eq = arg.indexOf("=");
        return arg.slice(2, eq === -1 ? undefined : eq);
    });
    return [...new Set(names)];
}
/** The `status.jsonl` row recording that a bkit command was dispatched. `flags` is the raw argv after the verb. */
export function engineCallRow(input) {
    return {
        type: "engine-call",
        workflow: input.workflow,
        at: input.at ?? statusTimestamp(),
        noun: input.noun,
        verb: input.verb,
        flags: flagNames(input.flags),
    };
}
/** True when `code` (null = the command threw) is not a declared routing exit. */
export function shouldRecordFriction(code, excludedCodes) {
    return code === null || !excludedCodes.has(code);
}
/**
 * Dedup key `<noun>-<verb>/<step>`. The identity-gated prune truncates a friction
 * key at about 68 characters, so two longer keys with one prefix collide; the key
 * stays under KEY_LIMIT by clipping the step.
 */
export function frictionKey(noun, verb, step) {
    const head = `${noun}-${verb}/`;
    return head + step.slice(0, Math.max(0, KEY_LIMIT - head.length));
}
const KEY_LIMIT = 60;
/** `bkit.version` from `<bookRoot>/.bkit/version`; "unknown" when unreadable. */
function pinnedVersion(bookRoot) {
    const file = path.join(bookRoot, ".bkit", "version");
    if (!fs.existsSync(file))
        return "unknown";
    const hit = /"pinnedVersion"\s*:\s*"([^"]+)"/.exec(fs.readFileSync(file, "utf-8"));
    return hit?.[1] ?? "unknown";
}
/**
 * The `tool-failure` friction row for an unexpected exit. `by.step` is the failing
 * command's own `--step=` value, else the `<noun>-<verb>` sentinel, so it is never
 * empty. `run` carries `parentSha` only when it resolved.
 */
export function frictionRow(input) {
    const step = input.step && input.step !== "" ? input.step : `${input.noun}-${input.verb}`;
    const how = input.code === null ? "threw an unhandled error" : `exited ${input.code}`;
    const row = {
        schema: SCHEMA,
        ts: mintTs(),
        kind: "friction",
        key: frictionKey(input.noun, input.verb, step),
        repo: resolveRepoSlug(input.bookRoot) || "unknown/repo",
        bkit: { version: pinnedVersion(input.bookRoot) },
        by: { workflow: input.workflow, step },
        category: "tool-failure",
        scope: "bkit-repo",
        severity: "MEDIUM",
        summary: `bkit ${input.noun} ${input.verb} ${how}`,
        description: `\`bkit ${input.noun} ${input.verb}\` ${how} at ${step}; the code is not one the command declares as routing.`,
        source: "orchestrator",
        status: "OPEN",
    };
    if (input.parentSha !== undefined && input.parentSha !== "") {
        row["run"] = { parentSha: input.parentSha };
    }
    return row;
}
/** Append one `engine-call` row to a run's `status.jsonl`. */
export function appendJournalRow(file, row) {
    try {
        fs.appendFileSync(file, appendLine(row));
        return { ok: true };
    }
    catch (err) {
        return { ok: false, error: err.message };
    }
}
/**
 * Append a friction row to `<bookRoot>/.bkit/friction.jsonl`, or raise the
 * `recurrenceCount` of the one existing same-`key` row in place.
 */
export function appendFrictionRow(bookRoot, row) {
    const checked = validate(row);
    if (!checked.ok)
        return { ok: false, error: checked.reason ?? "invalid friction row" };
    const who = writerProblem(row);
    if (who !== undefined)
        return { ok: false, error: who };
    const file = path.join(bookRoot, APPEND_LEDGERS.friction.file);
    try {
        fs.mkdirSync(path.dirname(file), { recursive: true });
        const text = fs.existsSync(file) ? fs.readFileSync(file, "utf-8") : "";
        const lines = text.split("\n");
        const at = lines.map((line) => sameKey(line, row["key"])).lastIndexOf(true);
        if (at === -1) {
            fs.appendFileSync(file, `${text !== "" && !text.endsWith("\n") ? "\n" : ""}${JSON.stringify(row)}\n`);
            return { ok: true };
        }
        const prior = readRow(lines[at]) ?? {};
        const count = typeof prior["recurrenceCount"] === "number" ? prior["recurrenceCount"] : 1;
        lines[at] = JSON.stringify({
            ...prior,
            recurrenceCount: count + 1,
            lastConfirmed: row["ts"],
        });
        const tmp = `${file}.${process.pid}.tmp`;
        fs.writeFileSync(tmp, lines.join("\n"));
        fs.renameSync(tmp, file);
        return { ok: true };
    }
    catch (err) {
        return { ok: false, error: err.message };
    }
}
/** True when `line` is a friction row with this `key`. */
function sameKey(line, key) {
    if (!line.includes(`"key":${JSON.stringify(key)}`))
        return false;
    const parsed = readRow(line);
    return parsed?.["kind"] === "friction" && parsed["key"] === key;
}
function readRow(line) {
    const parsed = parseJson(line);
    if (!parsed.ok)
        return undefined;
    const value = parsed.value;
    return value !== null && typeof value === "object" && !Array.isArray(value)
        ? value
        : undefined;
}
