// ledgers/journal.ts — the dispatch seam's row primitives.
//
// `commands/lib.ts` `runCommand` writes two kinds of row while a workflow run is
// active: an `engine-call` row in the run's `status.jsonl` (one per bkit command
// dispatched, except one git launched or one made while the run's repo has a rebase
// paused) and a `friction` row in the run's own `.bkit/friction.jsonl` (one per
// unexpected non-zero exit). `status row --type=owner-pause` writes a `human-confirm`
// friction row through the same append. This module builds and appends them. It is a leaf:
// it imports only `node:*`, `../shared/json.js`, `./status.js` and `./telemetry.js`, never a `commands/**`
// module, so `lib.ts` can import it without a cycle. The caller passes in the exit
// codes that are declared routing (`SHARED_EXIT_CODES` plus the verb's own).
//
// Every export is synchronous and never throws; a write returns a result object the
// caller logs and swallows, so the journal can never change a command's exit code.
import * as fs from "node:fs";
import * as path from "node:path";
import { parseJson } from "../shared/json.js";
import { appendLine, appendLocked, statusTimestamp } from "./status.js";
import { APPEND_LEDGERS, SCHEMA, compareTs, mintTs, resolveRepoSlug, validate, writerProblem, } from "./telemetry.js";
/** The kill switch: `BKIT_ENGINE_JOURNAL=off` keeps the seam from writing any row. */
export function journalEnabled(env = process.env) {
    return env["BKIT_ENGINE_JOURNAL"] !== "off";
}
/**
 * True when git launched this process: git exports `GIT_EXEC_PATH` to every hook
 * (pre-commit, commit-msg, post-commit, pre-push, post-checkout, post-merge, ...) and
 * to the children it spawns, and a plain shell does not set it.
 */
export function launchedByGit(env = process.env) {
    const value = env["GIT_EXEC_PATH"];
    return value !== undefined && value !== "";
}
/**
 * True while the repo holding `dir` has a rebase paused: its git dir holds `rebase-merge`
 * or `rebase-apply`. A worktree's `.git` file names its own git dir. A row appended then
 * leaves a tracked `status.jsonl` with an unstaged change, and `git rebase --continue`
 * refuses to go on.
 */
export function rebasePaused(dir) {
    for (let at = path.resolve(dir);; at = path.dirname(at)) {
        const dotGit = path.join(at, ".git");
        if (fs.existsSync(dotGit)) {
            let gitDir = dotGit;
            if (fs.statSync(dotGit).isFile()) {
                const named = /^gitdir:\s*(.+)$/m.exec(fs.readFileSync(dotGit, "utf-8"))?.[1]?.trim();
                if (named === undefined)
                    return false;
                gitDir = path.resolve(at, named);
            }
            return ["rebase-merge", "rebase-apply"].some((d) => fs.existsSync(path.join(gitDir, d)));
        }
        if (path.dirname(at) === at)
            return false;
    }
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
/**
 * The `human-confirm` friction row for an owner pause (`status row --type=owner-pause`).
 * `key` is `owner-pause/<workflow>.<reason>`, or `owner-pause/<workflow>` with no
 * reason, clipped to KEY_LIMIT. `run` carries `parentSha` only when it resolved.
 */
export function pauseFrictionRow(input) {
    const point = input.reason !== undefined && input.reason !== ""
        ? `${input.workflow}.${input.reason}`
        : input.workflow;
    const row = {
        schema: SCHEMA,
        ts: mintTs(),
        kind: "friction",
        key: `owner-pause/${point}`.slice(0, KEY_LIMIT),
        repo: resolveRepoSlug(input.bookRoot) || "unknown/repo",
        bkit: { version: pinnedVersion(input.bookRoot) },
        by: { workflow: input.workflow, step: "owner-pause" },
        category: "human-confirm",
        scope: "bkit-repo",
        severity: "LOW",
        summary: `${input.workflow} paused for the owner at ${point}`,
        description: `The ${input.workflow} workflow stopped and asked the owner (\`owner-pause\` at ${point}).`,
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
 * Append a friction row to `<bookRoot>/.bkit/friction.jsonl` with `recurrenceCount` 1.
 * A recurrence appends the same-`key` fold winner again with a later `ts`, its
 * `recurrenceCount` raised by one and `lastConfirmed` = that `ts`. No line is
 * ever rewritten, so a row another writer appends meanwhile is kept.
 */
export function appendFrictionRow(bookRoot, row, options = {}) {
    const checked = validate(row);
    if (!checked.ok)
        return { ok: false, error: checked.reason ?? "invalid friction row" };
    const who = writerProblem(row);
    if (who !== undefined)
        return { ok: false, error: who };
    const file = path.join(bookRoot, APPEND_LEDGERS.friction.file);
    try {
        // The recurrence is computed from the text read under the target lock, so a
        // competing writer can never invalidate the prepared offset or count.
        const landed = appendLocked(file, (text) => {
            const prior = latestSameKey(text, row["key"]);
            const next = prior === undefined ? { ...row, recurrenceCount: 1 } : recurrence(prior, row);
            return `${JSON.stringify(next)}\n`;
        }, { checkpoint: options.checkpoint });
        return { ok: true, receipt: { offset: landed.offset, bytes: landed.bytes } };
    }
    catch (err) {
        return { ok: false, error: err.message };
    }
}
/**
 * The row recording one more occurrence of `prior`: its fields with a `ts` later
 * than its own, the raised count and `lastConfirmed`. A `CLOSED` prior reopens with
 * `row`'s `status`, so a fixed failure that comes back reaches triage again. Falls
 * back to `row`'s fields when `prior`'s no longer validate.
 */
function recurrence(prior, row) {
    const count = typeof prior["recurrenceCount"] === "number" ? prior["recurrenceCount"] : 1;
    const ts = typeof prior["ts"] === "number" && row["ts"] <= prior["ts"]
        ? mintTs(prior["ts"])
        : row["ts"];
    const raised = { recurrenceCount: count + 1, lastConfirmed: ts };
    const reopened = prior["status"] === "CLOSED" ? { status: row["status"] } : {};
    const carried = { ...prior, ts, ...raised, ...reopened };
    return validate(carried).ok ? carried : { ...row, ts, ...raised };
}
/** The same-`key` friction row in `text` that `fold` keeps: highest `ts`, the later line on a tie. */
function latestSameKey(text, key) {
    let best;
    for (const line of text.split("\n")) {
        if (!line.includes(JSON.stringify(key)))
            continue;
        const parsed = readRow(line);
        if (parsed?.["kind"] !== "friction" || parsed["key"] !== key)
            continue;
        if (best === undefined || compareTs({ ts: parsed["ts"] }, { ts: best["ts"] }) >= 0) {
            best = parsed;
        }
    }
    return best;
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
