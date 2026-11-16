// commands/workflow/tests-jump.ts — `bkit tests jump <run>`: move one waiting run to the front
// of the tests line.
//
// The verb asks bkit's own copy of the lock script (the template, never the consumer's copy) to
// write the jump marker: `bkit-machine-lock.sh jump --lock tests <run> [<checkout>]`. The lock's
// waiting helpers sort a ticket carrying the marker's line first and delete the marker once the
// run has the lock. The script never touches the lock, the holder file or a slot file, so the
// current holder keeps the lock. With no match the verb lists the queue (`queue --lock tests`).
import { spawnSync } from "node:child_process";
import * as path from "node:path";
import { CommandError, EXIT } from "../lib.js";
import { getTemplatesRoot } from "../../shared/package-roots.js";
/** Exit code: the lock script could not read the queue or write the jump marker. */
export const EXIT_JUMP_FAILED = 3;
/** Run a queue subcommand of the template's lock script on the tests lock. */
function lockScript(args) {
    const script = path.join(getTemplatesRoot(), "scripts", "ci", "bkit-machine-lock.sh");
    const res = spawnSync("bash", [script, args[0], "--lock", "tests", ...args.slice(1)], {
        encoding: "utf-8",
        stdio: ["ignore", "pipe", "pipe"],
    });
    if (res.error) {
        throw new CommandError(EXIT_JUMP_FAILED, `cannot run ${script}: ${res.error.message}`);
    }
    return { status: res.status ?? 1, stdout: res.stdout, stderr: res.stderr.trim() };
}
const lines = (text) => text.split("\n").filter((line) => line !== "");
export const testsJumpVerb = {
    summary: "Move the waiting run named <run> to the front of the tests line; the holder keeps the lock. Every use needs the human's approval, so ask them to approve it; exit 0 moved, 1 no single run matched, 3 the lock script failed.",
    use: "by-hand",
    flags: [
        {
            name: "run",
            type: "string",
            positional: true,
            required: true,
            help: "the waiting run's name, as the waiting note prints it",
        },
        {
            name: "checkout",
            type: "string",
            help: "the waiting run's checkout path, to pick one when several runs share the name",
        },
    ],
    output: {
        run: "the run name moved to the front",
        checkout: "the checkout path of the run moved",
    },
    exitCodes: {
        [EXIT_JUMP_FAILED]: "the lock script could not read the queue or write the jump marker",
    },
    run: (ctx) => {
        const run = String(ctx.flags.run);
        const wanted = typeof ctx.flags.checkout === "string" ? [ctx.flags.checkout] : [];
        const res = lockScript(["jump", run, ...wanted]);
        if (res.status === 1) {
            const waiting = lockScript(["queue"]);
            const queued = waiting.status === 0 ? lines(waiting.stdout) : [];
            throw new CommandError(EXIT.NO, `no run named ${run} waits for tests` +
                (queued.length > 0
                    ? `\nwaiting now:\n${queued.map((line) => `  ${line}`).join("\n")}`
                    : ""));
        }
        if (res.status === 3) {
            throw new CommandError(EXIT.NO, `several runs named ${run} wait for tests:\n${lines(res.stdout)
                .map((line) => `  ${line}`)
                .join("\n")}\npass --checkout <path> to pick one`);
        }
        if (res.status !== 0) {
            throw new CommandError(EXIT_JUMP_FAILED, res.stderr || `the lock script's jump exited ${res.status}`);
        }
        const line = lines(res.stdout)[0] ?? "";
        ctx.log(`${run} moves to the front of the tests line`);
        ctx.emit({ run, checkout: line.slice(`${run} — `.length) });
        return EXIT.OK;
    },
};
