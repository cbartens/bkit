// bkit tests run — run the deepest declared local gate, save its full output,
// and report the verdict.
//
// Candidates come in priority order, deepest first: the first one `package.json`
// declares is run, so a shallower gate never wins while a deeper one exists (the
// order is the contract). Nothing declared is its own exit code, never an empty
// command that exits 0 and reads as a clean run. A gate that exits 126 / 127 never
// ran (not executable / not found), so it is not recorded as a failing test.
// The failure count comes from the JUnit reports the gate's runners write into
// `{log}.reports/` (`BKIT_TEST_REPORT_DIR`), never from reading the log.
// bkit tests red / green — test-first evidence for build tasks. `red` runs every TEST FIRST
// test of one group's open tasks after the tests step wrote them and before any task code
// exists: one run per test file through the consumer's `bkit:test:file` script, each test
// judged by the JUnit report, never the exit code alone (a misspelled path, a syntax error
// and an import of unwritten code all exit non-zero exactly like a real failure). A red is
// the NAMED test failing, or its file failing to load; `green` reads the group's red row and
// needs the named test to run and pass.
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { BKIT_LINT_FILE_SCRIPT, BKIT_TEST_FILE_SCRIPT } from "../../install/manifest.js";
import { clampLogPath } from "../../ledgers/clamp-log.js";
import { appendLine, statusTimestamp, validateCiSelection, testRunProblem, } from "../../ledgers/status.js";
import { classifyLockExit, CommandError, EXIT, git, runGit, testsLockHolder, wholeNumber, } from "../lib.js";
import { parseJson } from "../../shared/json.js";
import { readPackageJson } from "../../shared/package-json.js";
import { COULD_NOT_RUN_EXIT_CODES, scriptCommand, testCommand, } from "../../shared/package-manager.js";
import { CONFIG_DEFAULTS, readBkitConfig } from "../../shared/settings.js";
import { FILE_FLAG, GROUP_FLAG, WORKFLOW_FLAG, positiveInt, readStatusRows, readRuns, statusFile, str, } from "./status.js";
import { NO_MARKERS_REASON, derivedTestMatrix, fenceNeverClosed, parsePlanBlocks, reuseInventory, supersessionInventory, } from "./plan-blocks.js";
import { writeStepRow } from "./steps.js";
import { appendRecord, clampFile } from "./context.js";
import { testsChangedVerb } from "./tests-changed.js";
/** Exit code: no candidate gate is declared in package.json. */
export const EXIT_NO_GATE = 3;
/** Exit code: the gate could not run (exit 126 / 127, or the package runner is missing). */
export const EXIT_COULD_NOT_RUN = 4;
/** Exit code: --artifact could not be written, trimmed or recorded. */
export const EXIT_ARTIFACT_STEP = 5;
/** The status row type `tests run --file` appends, one per run. */
export const TEST_RUN_ROW = "test-run";
/** The env var naming the folder every runner a gate calls writes its JUnit XML into. */
export const REPORT_DIR_ENV = "BKIT_TEST_REPORT_DIR";
export { classifyLockExit } from "../lib.js";
const NO_REPORT_HINT = `no JUnit report in $${REPORT_DIR_ENV} — failures unknown; turn on each test runner's JUnit ` +
    `reporter in the gate and point its output into $${REPORT_DIR_ENV} ` +
    "(.bkit/workflows.md § Local gate scripts)";
const DEFAULT_TAIL = 40;
const NO_GATE_HINT = "declare a bkit:gate:* script in package.json that runs your stack's checks " +
    "(.bkit/workflows.md § Local gate scripts lists the names and what each covers)";
/**
 * The first candidate `package.json` declares as a non-empty script, or null.
 * An empty script runs nothing and exits 0, which is the false green this guards.
 */
export function resolveGate(dir, candidates) {
    const read = readPackageJson(dir);
    const scripts = read.ok ? read.pkg.scripts : undefined;
    if (typeof scripts !== "object" || scripts === null)
        return null;
    const declared = scripts;
    return (candidates.find((g) => {
        const body = declared[g];
        return typeof body === "string" && body.trim() !== "";
    }) ?? null);
}
/** The scope string the status rows record: the package runner plus the script name. */
export const gateScope = (gate) => scriptCommand(gate).join(" ");
/**
 * Run argv with stdout and stderr interleaved into `log` (like `> log 2>&1`).
 * Exit 127 when the binary is missing; 128 + n when killed by signal n.
 */
export function runToLog(argv, cwd, log, env) {
    fs.mkdirSync(path.dirname(log), { recursive: true });
    const fd = fs.openSync(log, "w");
    const protectedArgv = testCommand(argv);
    const res = spawnSync(protectedArgv[0], protectedArgv.slice(1), {
        cwd,
        stdio: ["ignore", fd, fd],
        env: env === undefined ? process.env : { ...process.env, ...env },
    });
    fs.closeSync(fd);
    if (res.error) {
        fs.appendFileSync(log, `${argv[0]}: not found on PATH (${res.error.message})\n`);
        return 127;
    }
    if (res.status !== null)
        return res.status;
    return 128 + ((res.signal ? os.constants.signals[res.signal] : undefined) ?? 1);
}
/** `{log}.reports`, emptied: a previous attempt's reports never count toward this one. */
function freshReportDir(log) {
    const dir = `${log}.reports`;
    fs.rmSync(dir, { recursive: true, force: true });
    fs.mkdirSync(dir, { recursive: true });
    return dir;
}
/** Failing plus erroring test cases across every `*.xml` under `dir`; null when there is none. */
export function countReportFailures(dir) {
    const xml = fs.readdirSync(dir, { recursive: true }).filter((f) => f.endsWith(".xml") && fs.statSync(path.join(dir, f)).isFile());
    if (xml.length === 0)
        return null;
    return xml
        .flatMap((f) => parseJunit(fs.readFileSync(path.join(dir, f), "utf-8")))
        .filter((c) => c.state === "failure" || c.state === "error").length;
}
const tailLines = (file, n) => fs
    .readFileSync(file, "utf-8")
    .replace(/\r?\n$/, "")
    .split(/\r?\n/)
    .slice(-n);
/**
 * Append one `test-run` row to `file`. `run` numbers this step's test-run rows in the
 * workflow's active run (since its last workflow-started row), this one included, so a
 * gate re-run under the same attempt still shows.
 */
function appendTestRun(file, r) {
    const rows = readStatusRows(file);
    let start = -1;
    rows.forEach((x, i) => {
        if (x.type === "workflow-started" && x.workflow === r.workflow)
            start = i;
    });
    const run = rows
        .slice(start + 1)
        .filter((x) => x.type === TEST_RUN_ROW && x.workflow === r.workflow && x.step === r.step)
        .length + 1;
    const row = {
        type: TEST_RUN_ROW,
        workflow: r.workflow,
        at: statusTimestamp(),
        step: r.step,
        ...(r.attempt === undefined ? {} : { attempt: r.attempt }),
        run,
        verdict: r.verdict,
        exitCode: r.exitCode,
        failures: r.failures,
        scope: r.scope,
        log: r.log,
        ...(r.artifact === undefined ? {} : { artifact: r.artifact }),
        ...(r.source === undefined ? {} : { source: r.source }),
        ...r.evidence,
    };
    const problem = testRunProblem(row);
    if (problem !== null)
        throw new CommandError(EXIT.USAGE, problem);
    fs.appendFileSync(file, appendLine(row));
    return row;
}
// ---------------------------------------------------------------------------
// Test-first: JUnit reading, plan `Test first:` lines, red / green judgement
// ---------------------------------------------------------------------------
/** The env var naming the JUnit report path `bkit:test:file` must write. */
export const REPORT_ENV = "BKIT_TEST_REPORT";
/** The status row step a group's red writes: one row per `tests red` run, a state and blob per planned test. */
export const RED_STEP = "build-tests-red";
/**
 * The states that count as a red: the test failed, its file did not load, the tests step
 * vouched for its pass, or it is an existing test updated and passing, whose diff the
 * verifier judges (it may add expectations, never remove or loosen one).
 */
export const RED_PROVEN = new Set([
    "red",
    "red-not-loaded",
    "passed-accepted",
    "updated",
]);
/** The `build-tests-red` rows of `workflow` in status.jsonl, in file order; `group` narrows. */
function redRows(file, workflow, group) {
    if (!fs.existsSync(file))
        return [];
    return readStatusRows(file).filter((r) => r.type === "step-done" &&
        r.workflow === workflow &&
        r.step === RED_STEP &&
        typeof r.group === "number" &&
        (group === undefined || r.group === group));
}
/** A red row's `tests`, as written. */
export const redTestsOf = (row) => Array.isArray(row.tests) ? row.tests : [];
/** The key a planned test is looked up by: task numbers are unique across the plan. */
export const redKey = (task, test, name) => JSON.stringify([task, test, name]);
/** The number this group's next red row carries: its rows so far, plus one. */
function redAttempt(file, workflow, group) {
    if (!fs.existsSync(file))
        return 1;
    return (readStatusRows(file).filter((r) => {
        const row = r;
        return (row.type === "step-done" &&
            row.workflow === workflow &&
            row.step === RED_STEP &&
            row.group === group);
    }).length + 1);
}
/**
 * Every planned test the red rows recorded, keyed by task, file and name. A later row's entry
 * wins, so a retry or a later task of the group overrides only the tests it ran, except that a
 * proven red is never replaced by an unproven result for the same test lines. `group` narrows
 * to one group.
 */
export function redEntries(file, workflow, group) {
    const out = new Map();
    for (const row of redRows(file, workflow, group))
        for (const t of redTestsOf(row)) {
            const key = redKey(t.task, t.test, t.testName);
            const earlier = out.get(key);
            const keepsProof = earlier !== undefined &&
                RED_PROVEN.has(earlier.state) &&
                !RED_PROVEN.has(t.state) &&
                typeof earlier.block === "string" &&
                earlier.block === t.block;
            if (!keepsProof)
                out.set(key, t);
        }
    return out;
}
/**
 * The planned tests of `group` (every group when undefined) a code step changed since their red: a test whose own lines
 * (`testBlock`) no longer hash to the recorded block. A row with no block (written before
 * per-test locking, or when no line carried the name) derives the block from the recorded
 * blob; when that holds no block either, the whole file's blob is compared. Other edits to a
 * test file are free.
 */
export function touchedTests(top, file, workflow, group) {
    const touched = [];
    const texts = new Map();
    const textOf = (test) => {
        if (!texts.has(test)) {
            const abs = path.join(top, test);
            texts.set(test, fs.existsSync(abs) ? fs.readFileSync(abs, "utf-8") : null);
        }
        return texts.get(test);
    };
    for (const t of redEntries(file, workflow, group).values()) {
        let block = t.block ?? null;
        if (block === null)
            block = blockHash(blobText(top, t.blob), t.testName);
        if (block === null) {
            if (git(top, ["hash-object", "--", t.test]) !== t.blob)
                touched.push({ test: t.test, name: t.testName });
            continue;
        }
        if (blockHash(textOf(t.test), t.testName) !== block)
            touched.push({ test: t.test, name: t.testName });
    }
    return touched;
}
/** The text a recorded blob holds, untrimmed; null when the object store lacks it. */
function blobText(top, blob) {
    if (blob === null)
        return null;
    const res = spawnSync("git", ["cat-file", "-p", blob], { cwd: top, encoding: "utf-8" });
    return res.status === 0 ? res.stdout : null;
}
/** Leading whitespace width, a tab counting as one column. */
const indentOf = (line) => line.length - line.trimStart().length;
/** A line that only closes the block opened at its own indent. */
const CLOSER = /^(?:[)\]}]|end\b)/;
const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
/** A comment line: a name in it is prose, not the test. */
const COMMENT = /^(?:\/\/|\/\*|\*|#|--|<!--)/;
/** A line opening a suite (`describe`, `context`, `suite`, a class), not a test. */
const SUITE = /^(?:[\w$]+\.)?(?:describe|context|suite|class)\b/;
/**
 * The first line `matches` that is no comment and opens no suite; else the first matching
 * suite line, so a suite that alone carries the name still yields a block; else -1.
 */
function testStart(lines, matches) {
    let suite = -1;
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trimStart();
        if (!matches(lines[i]) || COMMENT.test(line))
            continue;
        if (!SUITE.test(line))
            return i;
        if (suite < 0)
            suite = i;
    }
    return suite;
}
/**
 * The lines of the test named `name` in `text`, or null when no line names it. The test
 * starts on the first line naming it as a quoted string (else as a whole word) that is no
 * comment and opens no suite, or on the line before when the name opens its line and that
 * line ends with `(`; it runs through every deeper-indented line after the start, and one
 * closing line (`}`, `)`, `]`, `end`) at the start's indent. Framework-agnostic: it needs
 * only a name and indentation.
 */
export function testBlock(text, name) {
    if (text === null)
        return null;
    const span = testSpan(text, name);
    return span === null
        ? null
        : text
            .split("\n")
            .slice(span.start - 1, span.end)
            .join("\n");
}
/**
 * The 1-based first and last line of the test named `name` in `text` (the lines
 * `testBlock` returns), or null when no line names it.
 */
export function testSpan(text, name) {
    const lines = text.split("\n");
    const quoted = [`"${name}"`, `'${name}'`, `\`${name}\``];
    let at = testStart(lines, (l) => quoted.some((q) => l.includes(q)));
    if (at < 0) {
        const word = new RegExp(`(^|[^\\w])${escapeRegExp(name)}([^\\w]|$)`);
        at = testStart(lines, (l) => word.test(l));
    }
    if (at < 0) {
        // A suite path (`suite > test`, as a JUnit report names it): the last segment is the test.
        const last = name.split(" > ").pop();
        return last === name ? null : testSpan(text, last);
    }
    let start = at;
    while (start > 0 &&
        /^["'`]/.test(lines[start].trimStart()) &&
        /\($/.test(lines[start - 1].trimEnd()))
        start -= 1;
    const base = indentOf(lines[start]);
    let end = start;
    for (let i = start + 1; i < lines.length; i++) {
        const line = lines[i];
        if (line.trim() === "")
            continue;
        if (indentOf(line) > base) {
            end = i;
            continue;
        }
        if (indentOf(line) === base && CLOSER.test(line.trimStart()))
            end = i;
        break;
    }
    return { start: start + 1, end: end + 1 };
}
/**
 * The line diff of a test's own lines, `before` to `after`: unified lines (` `, `-`, `+`)
 * over a longest common subsequence, and the counts of lines removed and added. A change
 * that removes no line cannot have dropped an expectation; it can still have disabled one,
 * which only a read of the added lines tells.
 */
export function lineDiff(before, after) {
    const a = before.split("\n");
    const b = after.split("\n");
    const lcs = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
    for (let i = a.length - 1; i >= 0; i--)
        for (let j = b.length - 1; j >= 0; j--)
            lcs[i][j] =
                a[i] === b[j] ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
    const out = [];
    let removed = 0;
    let added = 0;
    let i = 0;
    let j = 0;
    while (i < a.length || j < b.length) {
        if (i < a.length && j < b.length && a[i] === b[j]) {
            out.push(` ${a[i]}`);
            i++;
            j++;
        }
        else if (i < a.length && (j >= b.length || lcs[i + 1][j] >= lcs[i][j + 1])) {
            out.push(`-${a[i]}`);
            removed++;
            i++;
        }
        else {
            out.push(`+${b[j]}`);
            added++;
            j++;
        }
    }
    return { text: out.join("\n"), removed, added };
}
/** The sha-1 of a test's own lines (`testBlock`), or null when `text` holds no such test. */
export function blockHash(text, name) {
    const block = testBlock(text, name);
    return block === null ? null : createHash("sha1").update(block).digest("hex");
}
/** The commit the group started at: its `build-group-start` row's `parentSha`. */
function groupStartSha(file, workflow, group) {
    if (!fs.existsSync(file))
        return undefined;
    const row = readStatusRows(file)
        .filter((r) => r.type === "step-done" &&
        r.workflow === workflow &&
        r.step === "build-group-start" &&
        r.group === group)
        .at(-1);
    return typeof row?.parentSha === "string" ? row.parentSha : undefined;
}
const NO_TEST_FILE_HINT = `declare "${BKIT_TEST_FILE_SCRIPT}" in package.json: it runs the one test file passed as its ` +
    `argument and writes a JUnit report to $${REPORT_ENV} ` +
    "(.bkit/workflows.md § Local gate scripts)";
const XML_ENTITIES = {
    amp: "&",
    lt: "<",
    gt: ">",
    quot: '"',
    apos: "'",
};
function decodeXml(s) {
    return s.replace(/&(#x[0-9a-f]+|#[0-9]+|[a-z]+);/gi, (whole, e) => {
        if (!e.startsWith("#"))
            return XML_ENTITIES[e.toLowerCase()] ?? whole;
        const cp = /^#x/i.test(e) ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
        return cp >= 0 && cp <= 0x10ffff ? String.fromCodePoint(cp) : whole;
    });
}
const ATTRS = String.raw `((?:\s+[\w:.-]+\s*=\s*(?:"[^"]*"|'[^']*'))*)`;
function attr(attrs, name) {
    const m = new RegExp(String.raw `\s${name}\s*=\s*(?:"([^"]*)"|'([^']*)')`).exec(attrs);
    return m ? decodeXml(m[1] ?? m[2] ?? "") : undefined;
}
/** CDATA text as escaped character data, so a tag inside it never ends an element early. */
const escapeCdata = (xml) => xml.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, (_, text) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"));
/** Every `<testcase>` in a JUnit report: its name, outcome, first failure message and detail. */
export function parseJunit(xml) {
    const body = escapeCdata(xml).replace(/<!--[\s\S]*?-->/g, "");
    const cases = [];
    const testcase = new RegExp(String.raw `<testcase${ATTRS}\s*(?:\/>|>([\s\S]*?)<\/testcase>)`, "g");
    const outcome = new RegExp(String.raw `<(failure|error|skipped)${ATTRS}\s*(?:\/>|>([\s\S]*?)<\/\1>)`);
    for (const m of body.matchAll(testcase)) {
        const child = outcome.exec(m[2] ?? "");
        cases.push({
            name: attr(m[1] ?? "", "name") ?? "",
            state: child ? child[1] : "passed",
            message: child ? (attr(child[2] ?? "", "message") ?? "") : "",
            detail: child ? decodeXml((child[3] ?? "").replace(/<[^>]*>/g, "")).trim() : "",
        });
    }
    return cases;
}
/** A report case is the named test when its name is the name, or ends with it as the last segment. */
export const isNamedCase = (caseName, want) => caseName === want || caseName.endsWith(` ${want}`);
const caseNames = (cases) => cases.length === 0
    ? "the report holds no tests"
    : `the report holds ${cases
        .slice(0, 5)
        .map((c) => `"${c.name}"`)
        .join(", ")}${cases.length > 5 ? ", …" : ""}`;
/** The stem a load error names: the test file's base name without its extension. */
const fileStem = (file) => path.posix.basename(file).replace(/\.[^.]*$/, "");
/**
 * How `want` stood in a red run of `file`, from its JUnit report: `red` (the named test
 * failed or errored), `red-not-loaded` (the file ran no test, or the only cases are failures
 * named after the file itself: a load error, which an import of unwritten code is),
 * `vacuous` (the named test passed, so it proves nothing before the task's code), `missing`
 * (it did not run, or was skipped) or `no-report`.
 */
export function judgeRed(cases, want, file) {
    if (cases === null)
        return {
            state: "no-report",
            detail: `no JUnit report at $${REPORT_ENV} — ${BKIT_TEST_FILE_SCRIPT} must write one`,
        };
    const named = cases.filter((c) => isNamedCase(c.name, want));
    if (named.length === 0) {
        const stem = fileStem(file);
        if (cases.length === 0 || cases.every((c) => c.state !== "passed" && c.name.includes(stem)))
            return {
                state: "red-not-loaded",
                detail: `\`${file}\` did not load${cases[0]?.message ? `: ${cases[0].message}` : ""}`,
            };
        return { state: "missing", detail: `"${want}" did not run; ${caseNames(cases)}` };
    }
    if (named.some((c) => c.state === "passed"))
        return {
            state: "vacuous",
            detail: `"${want}" passes at its red, so it proves nothing`,
        };
    if (named.some((c) => c.state === "skipped"))
        return { state: "missing", detail: `"${want}" was skipped, not run` };
    const failed = named.find((c) => c.state !== "passed");
    return { state: "red", detail: `${failed.state}${failed.message ? `: ${failed.message}` : ""}` };
}
/** Why a run is not green for `want`, or null when every case of the named test passed. */
export function judgeGreen(cases, want) {
    if (cases === null)
        return `no JUnit report at $${REPORT_ENV} — ${BKIT_TEST_FILE_SCRIPT} must write one`;
    const named = cases.filter((c) => isNamedCase(c.name, want));
    if (named.length === 0)
        return `the named test "${want}" did not run; ${caseNames(cases)}`;
    const bad = named.find((c) => c.state !== "passed");
    return bad === undefined
        ? null
        : `"${want}" ${bad.state}${bad.message ? `: ${bad.message}` : ""}`;
}
/** The task field naming a task's tests, and the one recording an accepted missing red. */
export const TEST_FIRST = "**TEST FIRST:**";
export const TEST_EXCEPTION = "**TEST EXCEPTION:**";
/** The plan caps `package.json` `bkit.workflows.tasks` sets for the checkout `cwd` sits in. */
export const planCaps = (cwd) => readBkitConfig(toplevel(cwd)).tasks;
/** The caps as the plan-check report and help state them. */
export const capsText = (c) => `${c.maxPerGroup} tasks and ${c.maxTestsPerGroup} TEST FIRST tests per group; ${c.maxTestsPerTask} tests across ${c.maxTestFilesPerTask} test files per task`;
/** A task block's TEST FIRST read as one `TestFirst`; a TEST EXCEPTION with no TEST FIRST is its `n/a`. */
/**
 * Planned tests of open tasks whose name a test in their file already carries: the tests
 * step cannot write a new test under that name, so it either updates the existing one or
 * finds it passing. Reported only — the plan names the update, or a new name.
 */
function existingTestNames(text, top) {
    const out = [];
    for (const t of parsePlanBlocks(text).tasks) {
        if (t.done)
            continue;
        const s = testFirstOf(t);
        if (s.kind !== "test")
            continue;
        for (const x of s.tests) {
            const abs = path.join(top, x.test);
            if (!fs.existsSync(abs))
                continue;
            if (testBlock(fs.readFileSync(abs, "utf-8"), x.name) !== null)
                out.push({ line: t.testFirst?.line ?? t.line, task: t.task, test: x.test, name: x.name });
        }
    }
    return out;
}
function testFirstOf(t) {
    const { task, testFirst: tf, testException: exc } = t;
    const plain = (tests) => tests.map(({ test, name }) => ({ test, name }));
    if (tf === undefined)
        return exc === undefined ? { task, kind: "missing" } : { task, kind: "na", reason: exc.text };
    if (tf.malformed.length > 0 || (tf.tests.length === 0 && tf.na === undefined))
        return { task, kind: "malformed" };
    if (tf.tests.length === 0)
        return { task, kind: "na", reason: tf.na };
    const tests = plain(tf.tests);
    return exc === undefined || exc.tests.length === 0
        ? { task, kind: "test", tests }
        : { task, kind: "test", tests, exception: { tests: plain(exc.tests), lines: exc.lines } };
}
/**
 * Each task block's TEST FIRST field (`plan-blocks.ts`): one test per sub-bullet (first
 * backticked span = file, second = test name), `n/a — {reason}`, missing, or malformed
 * (an entry with fewer than two spans, or no entry). A TEST EXCEPTION field names, in
 * the same entry form, the tests whose missing reds it accepts. `group` narrows to
 * one group's tasks.
 */
export function readTestFirst(plan, group) {
    return parsePlanBlocks(plan)
        .tasks.filter((t) => group === undefined || t.group === group)
        .map(testFirstOf);
}
/** Per task, the planned tests and distinct test files it names (`n/a`, missing and malformed count 0). */
export const taskSizes = (specs) => specs.map((s) => s.kind === "test"
    ? { task: s.task, tests: s.tests.length, files: new Set(s.tests.map((t) => t.test)).size }
    : { task: s.task, tests: 0, files: 0 });
/**
 * Files with a NEW row in the plan's Reuse Inventory table (`reuseInventory`): the
 * paths in the `File` cell of each row whose `Decision` cell reads NEW.
 */
export function inventoryNewFiles(text) {
    const rows = reuseInventory(text)?.rows ?? [];
    return new Set(rows.filter((r) => /^\**new\b/i.test(r.decision)).flatMap((r) => r.files));
}
const kb1 = (bytes) => Math.round((bytes / 1024) * 10) / 10;
/**
 * One plan's groups and tasks against the caps and the block format: parse errors and
 * task-like text outside every block, a task without DONE WHEN or without TEST FIRST and
 * TEST EXCEPTION, a malformed TEST FIRST, a DEPENDS ON naming a missing task or one in a
 * later group, a group or task over a cap in `caps`, a CREATE file with no NEW Reuse
 * Inventory row, a `Derived Test Matrix` row naming no task / an undefined task / two
 * tasks or a test-bearing task no row names, and a DELETE file with no Supersession row.
 */
export function checkPlanText(text, caps = CONFIG_DEFAULTS.tasks) {
    const blocks = parsePlanBlocks(text);
    const lines = text.split(/\r?\n/);
    const problems = blocks.errors.map((e) => ({
        line: e.line,
        kind: e.kind,
        message: e.message,
    }));
    if (blocks.tasks.length === 0 && blocks.fenceOpen === undefined)
        problems.push({
            line: 1,
            kind: "markers",
            message: "no task markers: write each task as a `<!-- bkit:task N start -->` block inside a `<!-- bkit:group N start -->` block",
        });
    const specs = new Map(blocks.tasks.map((t) => [t.task, testFirstOf(t)]));
    const sizes = blocks.tasks.map((t) => {
        const s = specs.get(t.task);
        const tests = s.kind === "test" ? s.tests : [];
        return {
            task: t.task,
            group: t.group,
            tests: tests.length,
            files: new Set(tests.map((x) => x.test)).size,
        };
    });
    const overCap = sizes.filter((t) => t.tests > caps.maxTestsPerTask || t.files > caps.maxTestFilesPerTask);
    const byTask = new Map(blocks.tasks.map((t) => [t.task, t]));
    const newFiles = inventoryNewFiles(text);
    for (const t of blocks.tasks) {
        const field = (message, line = t.line) => problems.push({ line, kind: "field", message: `TASK ${t.task}: ${message}` });
        if (t.doneWhen === undefined || t.doneWhen === "")
            field("has no **DONE WHEN:** field");
        const s = specs.get(t.task);
        if (s.kind === "missing")
            field("has neither **TEST FIRST:** nor **TEST EXCEPTION:**");
        for (const line of t.testFirst?.malformed ?? [])
            field("TEST FIRST entry is neither `test file` `test name` nor `n/a — {reason}`", line);
        if (s.kind === "malformed" && (t.testFirst?.malformed.length ?? 0) === 0)
            field("TEST FIRST names no test", t.testFirst.line);
        for (const d of t.dependsOn) {
            const dep = byTask.get(d);
            const message = d === t.task
                ? `TASK ${t.task} depends on itself`
                : dep === undefined
                    ? `TASK ${t.task} depends on TASK ${d}, but TASK ${d} does not exist`
                    : dep.group > t.group
                        ? `TASK ${t.task} depends on TASK ${d}, which is in a later group (GROUP ${dep.group}); groups build in order`
                        : undefined;
            if (message !== undefined)
                problems.push({ line: t.line, kind: "depends", message });
        }
        const size = sizes.find((x) => x.task === t.task);
        if (size.tests > caps.maxTestsPerTask)
            problems.push({
                line: t.line,
                kind: "cap",
                message: `TASK ${t.task} names ${size.tests} TEST FIRST tests, over the cap of ${caps.maxTestsPerTask}`,
            });
        if (size.files > caps.maxTestFilesPerTask)
            problems.push({
                line: t.line,
                kind: "cap",
                message: `TASK ${t.task} names ${size.files} test files, over the cap of ${caps.maxTestFilesPerTask}`,
            });
        for (const c of t.create)
            if (!newFiles.has(path.posix.normalize(c.file)))
                problems.push({
                    line: c.line,
                    kind: "inventory",
                    message: `TASK ${t.task}: CREATE in \`${c.file}\` has no NEW row naming it in the Reuse Inventory's File column`,
                });
    }
    // The matrix maps each row to one task and each test-bearing task to a row. A plan with no
    // matrix section yields no problem: the refusal is on a row, and issue-form plans carry none.
    const matrix = derivedTestMatrix(text);
    if (matrix !== null) {
        const expected = "Test description | Type | Target file | Task";
        const header = (matrix.head[0] ?? "")
            .split("|")
            .slice(1, -1)
            .map((c) => c.trim().toLowerCase())
            .join(" | ");
        if (header !== expected.toLowerCase())
            problems.push({
                line: matrix.line,
                kind: "matrix",
                message: `the Derived Test Matrix header must be exactly \`${expected}\`, in that order with no other columns`,
            });
        if (matrix.taskColumn !== null) {
            const mapped = new Set();
            for (const row of matrix.rows) {
                const named = row.tasks.map((n) => `TASK ${n}`);
                const taskCell = (row.cells[matrix.taskColumn] ?? "").trim();
                if (row.cells.length !== 4 ||
                    (taskCell !== "" &&
                        !/^(?:task\s*)?\d+(?:\s*(?:,|and)\s*(?:task\s*)?\d+)*$/i.test(taskCell)))
                    problems.push({
                        line: row.number,
                        kind: "matrix",
                        message: `Derived Test Matrix row must have 4 cells in the template's order, with only task numbers (\`N\` or \`TASK N\`) in its \`Task\` cell`,
                    });
                else if (row.tasks.length === 0)
                    problems.push({
                        line: row.number,
                        kind: "matrix",
                        message: `Derived Test Matrix row maps to no task: name one in its \`Task\` cell`,
                    });
                else if (row.tasks.length > 1)
                    problems.push({
                        line: row.number,
                        kind: "matrix",
                        message: `Derived Test Matrix row maps to ${named.join(" and ")}; name exactly one task`,
                    });
                else {
                    const n = row.tasks[0];
                    if (!byTask.has(n))
                        problems.push({
                            line: row.number,
                            kind: "matrix",
                            message: `Derived Test Matrix row maps to TASK ${n}, which the plan does not define`,
                        });
                    mapped.add(n);
                }
            }
            for (const t of blocks.tasks)
                if (specs.get(t.task).kind === "test" && !mapped.has(t.task))
                    problems.push({
                        line: t.line,
                        kind: "matrix",
                        message: `TASK ${t.task} names TEST FIRST tests but no Derived Test Matrix row maps to it`,
                    });
        }
    }
    const superseded = new Set((supersessionInventory(text) ?? []).flatMap((r) => r.files));
    for (const t of blocks.tasks)
        for (const d of t.delete)
            if (!superseded.has(path.posix.normalize(d.file)))
                problems.push({
                    line: d.line,
                    kind: "supersession",
                    message: `TASK ${t.task}: DELETE in \`${d.file}\` has no row naming it in the Supersession Inventory`,
                });
    const groups = blocks.groups.map((g) => {
        const tests = sizes.filter((s) => s.group === g.group).reduce((n, s) => n + s.tests, 0);
        const bytes = Buffer.byteLength(lines.slice(g.line - 1, g.end).join("\n"));
        return { group: g.group, title: g.title, tasks: g.tasks.length, tests, kb: kb1(bytes) };
    });
    for (const g of groups) {
        const at = blocks.groups.find((x) => x.group === g.group).line;
        if (g.tasks > caps.maxPerGroup)
            problems.push({
                line: at,
                kind: "cap",
                message: `GROUP ${g.group} has ${g.tasks} tasks, over the cap of ${caps.maxPerGroup}`,
            });
        if (g.tests > caps.maxTestsPerGroup)
            problems.push({
                line: at,
                kind: "cap",
                message: `GROUP ${g.group} has ${g.tests} TEST FIRST tests, over the cap of ${caps.maxTestsPerGroup}`,
            });
    }
    problems.sort((a, b) => a.line - b.line);
    return { groups, sizes, overCap, problems };
}
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const wordIn = (body, word) => new RegExp(`(?<![\\w$])${escapeRe(word)}(?![\\w$])`).test(body);
/** The 1-based lines of `body` that are a Markdown heading reading exactly `heading`. */
const headingLines = (body, heading) => body.split(/\r?\n/).flatMap((l, i) => {
    const h = /^#{1,6}\s+(.*?)(?:\s+#+)?\s*$/.exec(l);
    return h !== null && h[1].trim() === heading ? [i + 1] : [];
});
/** A key path's segments nested in indented `key:` lines (YAML): each one inside the block of the one before. */
function nestedKeys(body, segs) {
    const lines = body.split(/\r?\n/);
    const indent = (l) => /^\s*/.exec(l)[0].length;
    const walk = (from, to, k, above) => {
        const key = new RegExp(`^\\s*["']?${escapeRe(segs[k])}["']?\\s*:`);
        for (let i = from; i < to; i++) {
            const l = lines[i];
            if (l.trim() === "" || indent(l) <= above || !key.test(l))
                continue;
            if (k === segs.length - 1)
                return true;
            let end = i + 1;
            while (end < to && (lines[end].trim() === "" || indent(lines[end]) > indent(l)))
                end++;
            if (walk(i + 1, end, k + 1, indent(l)))
                return true;
        }
        return false;
    };
    return walk(0, lines.length, 0, -1);
}
/** A key path as a `[table]` header holding its first segments and a `key =` line for the rest (TOML). */
function tableKey(body, segs) {
    const lines = body.split(/\r?\n/);
    for (let k = 1; k < segs.length; k++) {
        const table = segs.slice(0, k).join(".");
        const key = segs.slice(k).join(".");
        const start = lines.findIndex((l) => l.trim() === `[${table}]`);
        if (start < 0)
            continue;
        const end = lines.findIndex((l, i) => i > start && /^\s*\[/.test(l));
        const keyRe = new RegExp(`^\\s*${escapeRe(key)}\\s*=`);
        if (lines.slice(start + 1, end < 0 ? undefined : end).some((l) => keyRe.test(l)))
            return true;
    }
    return false;
}
/** Config files whose dotted keys must be there as the whole key path. */
const CONFIG_EXTS = new Set([".json", ".jsonc", ".yaml", ".yml", ".toml"]);
/** Whether parsed JSON `value` holds `segs` as nested object keys. */
function jsonPath(value, segs) {
    let at = value;
    for (const s of segs) {
        if (typeof at !== "object" || at === null || Array.isArray(at) || !Object.hasOwn(at, s))
            return false;
        at = at[s];
    }
    return true;
}
/**
 * Whether config `body` of `file` holds the dotted key `bare` as the whole key path: a
 * `.json` file that parses is walked as JSON; otherwise the key is written whole, nested
 * in indented `key:` / `"key":` lines (YAML, indented JSON), or a `[table]` and its
 * `key =` line (TOML).
 */
function hasDottedKey(file, body, bare) {
    const segs = bare.split(".");
    const json = path.posix.extname(file).toLowerCase() === ".json" ? parseJson(body) : { ok: false };
    if (json.ok)
        return jsonPath(json.value, segs);
    return wordIn(body, bare) || nestedKeys(body, segs) || tableKey(body, segs);
}
/**
 * Each READ / UPDATE / DELETE line of an unticked task whose file or symbol is not
 * there, read from `root`: a plain word-boundary search in the named file. `§ heading`
 * must equal one of the file's heading lines; a dotted key in a config file (`CONFIG_EXTS`)
 * must be there as the whole key path, and in any other file matches on its last segment;
 * a file-only line checks the file exists. A line naming
 * what the task itself or a task it DEPENDS ON creates is not checked: it does not
 * exist yet.
 */
export function planExistence(text, root) {
    const blocks = parsePlanBlocks(text);
    const byTask = new Map(blocks.tasks.map((t) => [t.task, t]));
    const out = [];
    const cache = new Map();
    const read = (file) => {
        if (!cache.has(file)) {
            const abs = path.resolve(root, file);
            const inside = !path.relative(root, abs).startsWith("..");
            cache.set(file, inside && fs.statSync(abs, { throwIfNoEntry: false })?.isFile()
                ? fs.readFileSync(abs, "utf-8")
                : null);
        }
        return cache.get(file);
    };
    for (const t of blocks.tasks) {
        if (t.done)
            continue;
        const created = [t, ...t.dependsOn.map((d) => byTask.get(d)).filter((d) => d !== undefined)]
            .flatMap((d) => d.create)
            .map((c) => ({ file: path.posix.normalize(c.file), symbol: c.symbol }));
        for (const ref of [...t.read, ...t.update, ...t.delete]) {
            const file = path.posix.normalize(ref.file);
            if (created.some((c) => c.file === file && (c.symbol === undefined || c.symbol === ref.symbol)))
                continue;
            const body = read(file);
            const miss = (message) => out.push({ line: ref.line, task: t.task, message });
            if (body === null) {
                miss(`TASK ${t.task}: \`${ref.file}\` does not exist`);
                continue;
            }
            if (ref.symbol === undefined)
                continue;
            if (ref.symbol.startsWith("§")) {
                const heading = ref.symbol.replace(/^§\s*/, "").trim();
                if (headingLines(body, heading).length === 0)
                    miss(`TASK ${t.task}: no heading \`${heading}\` in \`${ref.file}\``);
                continue;
            }
            const bare = ref.symbol.replace(/\(\)$/, "");
            const key = bare.split(".").at(-1);
            if (bare.includes(".") && CONFIG_EXTS.has(path.posix.extname(file).toLowerCase())) {
                if (!hasDottedKey(file, body, bare))
                    miss(`TASK ${t.task}: \`${bare}\` is not in \`${ref.file}\``);
            }
            else if (!wordIn(body, key))
                miss(key === bare
                    ? `TASK ${t.task}: \`${key}\` is not in \`${ref.file}\``
                    : `TASK ${t.task}: \`${key}\` (last segment of \`${ref.symbol}\`) is not in \`${ref.file}\``);
        }
    }
    return out.sort((a, b) => a.line - b.line);
}
/** Run one test file through `bkit:test:file`; the report is read and removed. */
function runTestFile(top, test, log) {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-test-report-"));
    const report = path.join(dir, "junit.xml");
    const exitCode = runToLog([...scriptCommand(BKIT_TEST_FILE_SCRIPT), test], top, log, {
        [REPORT_ENV]: report,
    });
    const cases = fs.existsSync(report) ? parseJunit(fs.readFileSync(report, "utf-8")) : null;
    fs.rmSync(dir, { recursive: true, force: true });
    return { exitCode, cases };
}
const couldNotRunMessage = (exitCode) => `${gateScope(BKIT_TEST_FILE_SCRIPT)} could not run (exit ${exitCode}: ${exitCode === 126 ? "not executable" : "command not found"}) — no test executed`;
const toplevel = (cwd) => git(cwd, ["rev-parse", "--show-toplevel"]) ?? cwd;
/** A fence longer than any backtick run in `text`. */
const fenceFor = (text) => "`".repeat(Math.max(3, ...[...text.matchAll(/`+/g)].map((m) => m[0].length + 1)));
/**
 * Every gap the audit emits, and the verifier's `Fixable` for it: `null` = the
 * answer needs a diff read, which only the verifier can make. A test with no proven red
 * is no gap: the audit lists it as unproven, and the owner answers every unproven test
 * once, at the end of the build.
 */
const GAP_FIXABLE = {
    "not-green": true,
    "delete-still-referenced": null,
    "no-test-first": false,
    "test-first-malformed": false,
    "test-first-unread": false,
    "exception-refused": false,
};
/** One gap, with the `fixable` its kind settles and the ready-to-append log line. */
function gapOf(task, kind, detail, test) {
    const fixable = GAP_FIXABLE[kind];
    const subject = test === undefined ? "" : `\`${test.file}\` \`${test.name}\` — `;
    return {
        task,
        kind,
        detail,
        fixable,
        logLine: `${task === null ? "Plan" : `TASK ${task}`}: ${subject}${kind} — Fixable: ${fixable}`,
    };
}
/** The report's verdict from its gaps: a decision one gap still needs (`null`) outranks one it refuses. */
const verdictOf = (gaps) => gaps.length === 0
    ? "PASS"
    : gaps.some((g) => g.fixable === null)
        ? null
        : gaps.some((g) => g.fixable === false)
            ? "FAIL"
            : "CONCERNS";
/** The gap for a task whose only test field is a TEST EXCEPTION that is not honoured. */
export const EXCEPTION_REFUSED = "exception-refused";
/** The status row step plan-execute's finish writes; its commit carries the code of each task its log records DONE. */
export const PLAN_TASKS_STEP = "build-plan-tasks";
const repoRel = (top, cwd, p) => path.relative(top, path.resolve(cwd, p)).split(path.sep).join("/");
/**
 * The task numbers a plan-execute log records `DONE — TASK N` for, in log order. `verbs`
 * widens the reader to the log's other closing lines (`BLOCKED`), so one parser serves
 * every caller; the default reads `DONE` only, which is what "the task is done" means.
 */
export function doneTasks(log, verbs = ["DONE"]) {
    const closing = verbs.map((v) => v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
    return [...log.matchAll(new RegExp(`^(?:${closing})\\s*[—–-]+\\s*TASK\\s+(\\d+)\\b`, "gim"))].map((m) => Number(m[1]));
}
/**
 * Why a task's `TEST EXCEPTION` lines do not count, or null when they do: every
 * line committed, and last changed by a commit that does not write the status file.
 * Every workflow step commit writes it, so a line riding one is refused; agents are
 * barred from committing, so the remaining commits are human-made.
 */
function exceptionRefusal(top, plan, lines, statusRel) {
    const blame = git(top, ["blame", "--porcelain", "-L", `${lines[0]},${lines.at(-1)}`, "--", plan]);
    if (blame === null)
        return "the plan file is not committed";
    const shas = new Set([...blame.matchAll(/^([0-9a-f]{40}) \d+ \d+/gm)].map((m) => m[1]));
    if ([...shas].some((s) => /^0+$/.test(s)))
        return "the line is not committed — a human commits it before the build re-runs";
    for (const sha of shas) {
        const files = git(top, ["show", "--name-only", "--format=", sha])?.split("\n") ?? [];
        if (files.includes(statusRel))
            return `last changed by ${sha.slice(0, 7)}, a workflow step commit (it also writes \`${statusRel}\`) — commit the line in a commit that does not touch it`;
    }
    return null;
}
const withoutExt = (p) => p.replace(/\.[^./]*$/, "");
/**
 * Whether a grep hit for `stem` in `file` refers to something other than the files of
 * `targets` (repo-relative): false for a hit inside a target, or a line whose every
 * path-like mention of `stem` resolves to a target. A `./` or `../` path resolves
 * against `file`'s folder; any other path with a `/` matches a target ending in it.
 */
function namesOldPath(stem, targets) {
    const bare = targets.map(withoutExt);
    const isTarget = (token, file) => {
        const t = withoutExt(token);
        if (t.startsWith("./") || t.startsWith("../"))
            return bare.includes(path.posix.join(path.posix.dirname(file), t));
        return t.includes("/") && bare.some((b) => b === t || b.endsWith(`/${t}`));
    };
    return (file, text) => {
        if (targets.includes(file))
            return false;
        const mentions = text
            .split(/[^\w./@-]+/)
            .filter((tok) => path.posix.basename(withoutExt(tok)) === stem);
        return mentions.length === 0 || mentions.some((tok) => !isTarget(tok, file));
    };
}
/** The gap for a DELETE line whose file or symbol the tree still holds or refers to. */
export const DELETE_STILL_REFERENCED = "delete-still-referenced";
/**
 * One `delete-still-referenced` gap per DELETE line of `tasks` the tree at `top` still
 * holds: a file-only line whose file exists, or whose file name (no extension) a tracked
 * or untracked file names as a word; a symbol (a dotted key's last segment) named as a
 * word; a `§ heading` written as `§ heading`, or still a heading of its file. The plan
 * file and the folder it sits in are not searched. A line naming what a task of
 * `planTasks` CREATEs is a move, not checked. A file-only line whose file name a CREATE
 * of `planTasks` reuses is a file move: the created file, and lines whose every mention
 * of the name is a path to the created file, are not references. A word search hits
 * other things of the same name, so this is a gap for verify to judge, never a refusal.
 */
function deleteGaps(top, planRel, tasks, planTasks) {
    const created = planTasks.flatMap((t) => t.create);
    const planDir = path.posix.dirname(planRel);
    const excludes = [`:(exclude)${planRel}`, ...(planDir === "." ? [] : [`:(exclude)${planDir}`])];
    const grep = (term, word, keep) => {
        const res = spawnSync("git", [
            "grep",
            "-n",
            "-z",
            "-I",
            "--untracked",
            ...(word ? ["-w"] : []),
            "-F",
            "-e",
            term,
            "--",
            ".",
            ...excludes,
        ], { cwd: top, encoding: "utf-8" });
        if (res.status === 1)
            return { hits: [] };
        if (res.status !== 0)
            return {
                failed: `git grep exited ${res.status ?? res.signal}: ${(res.stderr ?? "").trim()}`,
            };
        const hits = res.stdout
            .split("\n")
            .filter(Boolean)
            .map((l) => l.split("\0"))
            .filter(([file, , text]) => keep === undefined || keep(file, text ?? ""))
            .map((parts) => parts.slice(0, 2).join(":"));
        return { hits };
    };
    const listed = (hits) => hits
        .slice(0, 5)
        .map((h) => `\`${h}\``)
        .join(", ") + (hits.length > 5 ? `, and ${hits.length - 5} more` : "");
    const gaps = [];
    for (const t of tasks)
        for (const ref of t.delete) {
            const file = path.posix.normalize(ref.file);
            const moved = created.some((c) => ref.symbol === undefined ? path.posix.normalize(c.file) === file : c.symbol === ref.symbol);
            if (moved)
                continue;
            const movedTo = ref.symbol === undefined
                ? created
                    .filter((c) => c.symbol === undefined &&
                    path.posix.basename(path.posix.normalize(c.file)) === path.posix.basename(file))
                    .map((c) => path.posix.normalize(c.file))
                : [];
            const gap = (detail) => gaps.push(gapOf(t.task, DELETE_STILL_REFERENCED, detail));
            const abs = path.join(top, file);
            const exists = fs.statSync(abs, { throwIfNoEntry: false })?.isFile() === true;
            let what;
            let found;
            if (ref.symbol === undefined) {
                if (exists) {
                    gap(`DELETE \`${ref.file}\`: the file still exists`);
                    continue;
                }
                const stem = path.posix.basename(file).replace(/\.[^.]*$/, "");
                what = `DELETE \`${ref.file}\` is still referenced as \`${stem}\``;
                found = grep(stem, true, movedTo.length === 0 ? undefined : namesOldPath(stem, movedTo));
            }
            else if (ref.symbol.startsWith("§")) {
                const heading = ref.symbol.replace(/^§\s*/, "").trim();
                what = `DELETE ${ref.symbol} in \`${ref.file}\` is still referenced`;
                found = grep(`§ ${heading}`, false);
                if (exists && found.hits !== undefined)
                    found.hits.push(...headingLines(fs.readFileSync(abs, "utf-8"), heading).map((n) => `${file}:${n}`));
            }
            else {
                const bare = ref.symbol.replace(/\(\)$/, "");
                what = `DELETE \`${ref.symbol}\` in \`${ref.file}\` is still referenced`;
                found = grep(bare.split(".").at(-1), true);
            }
            if (found.failed !== undefined)
                gap(`${what.replace(/ is still referenced.*$/, "")}: references not checked — ${found.failed}`);
            else if (found.hits.length > 0)
                gap(`${what}: ${listed([...new Set(found.hits)].sort())}`);
        }
    return gaps;
}
/** The `Updated` entry for a planned test: its own lines at `base` against the file now. */
function updatedEntry(top, task, t, base) {
    const entry = { task, test: t.test, name: t.name, base, additive: null, diff: null };
    if (base === null)
        return entry;
    const shown = runGit(top, ["show", `${base}:${t.test}`]);
    const abs = path.join(top, t.test);
    if (!shown.ok || !fs.existsSync(abs))
        return entry;
    const was = testBlock(shown.stdout, t.name);
    const now = testBlock(fs.readFileSync(abs, "utf-8"), t.name);
    if (was === null || now === null)
        return entry;
    const d = lineDiff(was, now);
    return { ...entry, additive: d.removed === 0, diff: d.text };
}
/** Every PASSES line of a tests step's log: the tests the writer saw passing and vouches for. */
function passesLines(log) {
    return [
        ...log.matchAll(/^PASSES\s*[—–-]+\s*TASK\s+(\d+):\s*`([^`]+)`\s+`([^`]+)`\s*:\s*(.+)$/gm),
    ].map((m) => ({
        task: Number(m[1]),
        test: m[2].trim(),
        name: m[3].trim(),
        reason: m[4].trim(),
    }));
}
/** Why a plan cannot be read for its tests (no file, no task markers, a fence never closed), or undefined. */
const planRefusal = (plan, parsed) => plan === undefined
    ? `no plan file; ${NO_MARKERS_REASON}`
    : parsed.tasks.length === 0
        ? parsed.fenceOpen === undefined
            ? NO_MARKERS_REASON
            : fenceNeverClosed(parsed.fenceOpen)
        : undefined;
/** A table cell: pipes escaped, line breaks folded. */
const cell = (s) => s.replace(/\s+/g, " ").replace(/\|/g, "\\|").trim();
function writeRedReport(log, o) {
    const red = o.tests.filter((t) => t.state === "red" || t.state === "red-not-loaded").length;
    const accepted = o.tests.filter((t) => t.state === "passed-accepted").length;
    const updated = o.tests.filter((t) => t.state === "updated").length;
    const out = [
        `Enforced: ${o.enforced}`,
        `Red: ${red}`,
        `Accepted: ${accepted}`,
        `Updated: ${updated}`,
        `Gaps: ${o.gaps.length}`,
        "",
        "<!-- verdict:end -->",
        "",
        `# Tests Red — group ${o.group}, attempt ${o.attempt}`,
        "",
    ];
    if (o.plan)
        out.push(`Plan: \`${o.plan}\``, "");
    if (!o.enforced)
        out.push(`Not enforced: ${o.reason}.`, "");
    if (o.tests.length > 0) {
        out.push("| Task | Test | State | Detail |", "| --- | --- | --- | --- |");
        for (const t of o.tests)
            out.push(`| ${t.task} | \`${t.test}\` "${cell(t.testName)}" | ${t.state} | ${cell(o.details.get(t) ?? "")} |`);
        out.push("");
    }
    out.push("## Gaps", "");
    if (o.gaps.length === 0)
        out.push("None.");
    for (const g of o.gaps)
        out.push(`- TASK ${g.task} \`${g.test}\` "${g.name}" \`${g.kind}\` — ${g.detail}`);
    for (const t of o.outputs) {
        const fence = fenceFor(t.text);
        out.push("", `## ${t.title}`, "", fence, t.text.replace(/\n$/, ""), fence);
    }
    fs.mkdirSync(path.dirname(log), { recursive: true });
    fs.writeFileSync(log, `${out.join("\n")}\n`);
}
function writeAuditReport(log, o) {
    const out = [
        `Enforced: ${o.enforced}`,
        `Verdict: ${o.verdict}`,
        `Gaps: ${o.gaps.length}`,
        `Unproven: ${o.unproven.length}`,
        "",
        "<!-- verdict:end -->",
        "",
    ];
    out.push("# Test-First Audit", "");
    if (o.plan)
        out.push(`Plan: \`${o.plan}\``, "");
    if (!o.enforced)
        out.push(`Not enforced: ${o.reason}.`, "");
    if (o.rows.length > 0) {
        out.push("| Task | Test | Red | Green |", "| --- | --- | --- | --- |");
        for (const r of o.rows)
            out.push(`| ${r.task} | ${r.test} | ${r.red} | ${r.green} |`);
        out.push("");
    }
    out.push("## Gaps", "");
    if (o.gaps.length === 0)
        out.push("None.");
    for (const g of o.gaps)
        out.push(`- ${g.task === null ? "Plan" : `Task ${g.task}`} \`${g.kind}\` — ${g.detail} — Fixable: ${g.fixable} — log: ${g.logLine}`);
    if (o.exceptions.length > 0)
        out.push("", "## Test exceptions", "");
    for (const e of o.exceptions)
        out.push(e.refusal === null
            ? `- Task ${e.task} — honoured; cleared ${e.cleared.length > 0 ? e.cleared.join(", ") : "nothing"}`
            : `- Task ${e.task} — not honoured: ${e.refusal}`);
    if (o.landed.length > 0)
        out.push("", "## Already landed", "");
    for (const l of o.landed)
        out.push(`- Task ${l.task} \`${l.test}\` "${l.name}" — passed at the group's red, and the tests step accepted it: ${l.reason}; no red is due`);
    if (o.updated.length > 0)
        out.push("", "## Updated tests", "");
    for (const u of o.updated) {
        const since = u.base === null ? "" : ` since \`${u.base.slice(0, 9)}\``;
        const judged = u.additive === null
            ? "its lines at the base commit could not be read, so read the group diff"
            : u.additive
                ? "additive: no line of the test was removed, so no expectation was dropped — read the added lines for one that disables an earlier expectation"
                : "not additive: a line of the test was removed or changed — read the diff for an expectation removed or loosened";
        out.push(`- Task ${u.task} \`${u.test}\` "${u.name}" — an existing test the tests step changed${since}; the update may add expectations, never remove or loosen one. ${judged}`);
        if (u.diff !== null) {
            const fence = fenceFor(u.diff);
            out.push("", `  ${fence}diff`, ...u.diff.split("\n").map((l) => `  ${l}`), `  ${fence}`, "");
        }
    }
    if (o.unproven.length > 0)
        out.push("", "## Unproven", "");
    for (const u of o.unproven)
        out.push(`- Task ${u.task} \`${u.test}\` "${u.name}" — ${u.detail}; the owner answers it at the end of the build`);
    for (const t of o.outputs) {
        const fence = fenceFor(t.tail);
        out.push("", `## Runner output — \`${t.test}\``, "", fence, t.tail, fence);
    }
    fs.mkdirSync(path.dirname(log), { recursive: true });
    fs.writeFileSync(log, `${out.join("\n")}\n`);
}
export const testsCommand = {
    noun: "tests",
    summary: "Run the deepest declared local gate, or one test file to record a red and audit a green.",
    verbs: {
        changed: testsChangedVerb,
        run: {
            summary: "Run the first declared --gate, and with --file append a test-run status row for the run; exit 0 PASS, 1 FAIL, 4 could not run, 81 tests lock held.",
            use: "by-hand",
            flags: [
                {
                    name: "gate",
                    type: "string",
                    required: true,
                    repeatable: true,
                    help: "candidate package.json script, deepest first; the first declared one runs",
                },
                {
                    name: "log",
                    type: "string",
                    required: true,
                    help: "file the full test output is saved to (directories are created)",
                },
                {
                    name: "tail",
                    type: "string",
                    help: `lines of the log echoed to stderr afterwards (default ${DEFAULT_TAIL}; 0 for none)`,
                },
                {
                    name: "lock-wait-s",
                    type: "string",
                    help: "whole-number lock wait >= 0, passed as LOCAL_STACK_LOCK_WAIT_S (default BKIT_LOCK_WAIT_S, else 60)",
                },
                {
                    name: "artifact",
                    type: "string",
                    help: "copy the log here, trim the copy (debug-evidence) and record the clamp; needs --fid and --step",
                },
                { name: "fid", type: "string", help: "--artifact: feature id, for the clamp log" },
                {
                    name: "step",
                    type: "string",
                    help: "step name: the test-run row's (--file) and the clamp log's (--artifact)",
                },
                {
                    name: "attempt",
                    type: "string",
                    help: "attempt: on the test-run row (--file) and in the clamp log's name (--artifact)",
                },
                {
                    name: "file",
                    type: "string",
                    help: "status.jsonl: append one test-run row for this run, pass or fail; needs --workflow and --step",
                },
                { name: "workflow", type: "string", help: "--file: workflow name, for the test-run row" },
                { name: "ci-run", type: "string", help: "selected GitHub evidence run ID" },
                { name: "ci-url", type: "string", help: "selected GitHub evidence attempt URL" },
            ],
            output: {
                source: "ci for pinned red evidence; local for every executed gate",
                runAttempt: "selected CI attempt for a CI evidence round",
                ciGeneration: "active selection generation for a CI evidence round",
                ciRun: "selected CI run ID for a CI evidence round",
                ciUrl: "selected CI attempt URL for a CI evidence round",
                repo: "selected repository for a CI evidence round",
                workflowId: "selected workflow ID for a CI evidence round",
                workflowPath: "selected workflow path for a CI evidence round",
                headSha: "selected commit for a CI evidence round",
                verdict: "PASS | FAIL (null when the gate could not run)",
                exitCode: "the gate's exit code",
                gate: "the script that ran",
                scope: "the command that ran, as status rows record it",
                failures: `0 on PASS; on FAIL the failing + erroring test cases in the JUnit reports, or null when no report counts any (unknown, never 0)`,
                reports: `{log}.reports — emptied before the run and passed to the gate as $${REPORT_DIR_ENV}`,
                log: "where the full output was saved (as given); the untouched original",
                logBytes: "size of the saved output",
                artifact: "--artifact as given, else null",
                clamp: "the artifact's clamp record (raw = the log, source = scope), else null",
                row: `the ${TEST_RUN_ROW} row appended to --file ({type, workflow, at, step, attempt?, run, verdict, exitCode, failures, scope, log, artifact?}; run = this step's test-run rows in the workflow's active run, this one included), else null; a tests-lock wait writes no row`,
                lockHolder: "tests-lock holder when the wait gave up, else null",
            },
            textOmit: ["clamp", "row"],
            exitCodes: {
                [EXIT_NO_GATE]: "no candidate gate is declared in package.json",
                [EXIT_COULD_NOT_RUN]: "the gate could not run (exit 126 / 127): not a test failure",
                [EXIT_ARTIFACT_STEP]: "--artifact could not be written, trimmed or recorded",
            },
            run: (ctx) => {
                const waitSource = ctx.flags.lockWaitS ?? process.env.BKIT_LOCK_WAIT_S;
                const waitS = wholeNumber(waitSource, ctx.flags.lockWaitS === undefined && process.env.BKIT_LOCK_WAIT_S !== undefined
                    ? "lock-wait-s (BKIT_LOCK_WAIT_S)"
                    : "lock-wait-s", 60);
                const candidates = ctx.flags.gate;
                const logArg = String(ctx.flags.log);
                if (logArg === "")
                    throw new CommandError(EXIT.USAGE, "--log must be non-empty");
                const artifact = str(ctx.flags.artifact);
                const fid = str(ctx.flags.fid);
                const step = str(ctx.flags.step);
                const attempt = positiveInt(ctx.flags.attempt, "attempt");
                if (artifact !== undefined && (!fid || !step))
                    throw new CommandError(EXIT.USAGE, "--artifact needs --fid and --step");
                const statusArg = str(ctx.flags.file);
                const workflow = str(ctx.flags.workflow);
                if (statusArg !== undefined && (!workflow || !step))
                    throw new CommandError(EXIT.USAGE, "--file needs --workflow and --step");
                const status = statusArg === undefined ? undefined : path.resolve(ctx.cwd, statusArg);
                if (status !== undefined && !fs.existsSync(status))
                    throw new CommandError(EXIT.USAGE, `--file ${statusArg} does not exist (a test-run row never starts a log)`);
                if (ctx.flags.ciRun !== undefined || ctx.flags.ciUrl !== undefined) {
                    const active = status === undefined ? undefined : readRuns(status).at(-1);
                    const selection = active?.ciSelection;
                    if (!status ||
                        workflow !== "debug" ||
                        active?.workflow !== "debug" ||
                        active.status !== "IN_PROGRESS" ||
                        !validateCiSelection(selection) ||
                        selection.mode !== "ci" ||
                        ctx.flags.ciRun !== selection.runId ||
                        ctx.flags.ciUrl !== selection.runUrl ||
                        !Number.isSafeInteger(active.ciGeneration) ||
                        Number(active.ciGeneration) < 1 ||
                        !artifact)
                        throw new CommandError(EXIT.USAGE, "CI round needs an active matching debug selection and artifact");
                    const fixed = active.steps.some((s) => s.status === "DONE" &&
                        s.ciGeneration === active.ciGeneration &&
                        ["debug-failure-remediate", "debug-failure-soak"].includes(s.step));
                    if (!fixed) {
                        const scope = `ci:${selection.runId}`;
                        const text = [
                            "Verdict: FAIL",
                            "Source: ci",
                            `Scope: ${scope}`,
                            `Repository: ${selection.repo}`,
                            `Workflow: ${selection.workflowPath} (${selection.workflowId})`,
                            `Run: ${selection.runId}`,
                            `Run attempt: ${selection.runAttempt}`,
                            `CI generation: ${active.ciGeneration}`,
                            `Commit: ${selection.headSha}`,
                            `URL: ${selection.runUrl}`,
                            "",
                            "<!-- verdict:end -->",
                            "",
                            "# CI evidence",
                            "",
                            "The local gate was not run.",
                            "",
                        ].join("\n");
                        for (const dest of new Set([artifact, logArg])) {
                            const out = path.resolve(ctx.cwd, dest);
                            fs.mkdirSync(path.dirname(out), { recursive: true });
                            fs.writeFileSync(out, text);
                        }
                        const evidence = {
                            gate: null,
                            ciRun: selection.runId,
                            ciUrl: selection.runUrl,
                            runAttempt: selection.runAttempt,
                            ciGeneration: active.ciGeneration,
                            repo: selection.repo,
                            workflowId: selection.workflowId,
                            workflowPath: selection.workflowPath,
                            headSha: selection.headSha,
                        };
                        const row = appendTestRun(status, {
                            workflow,
                            step: step,
                            attempt,
                            source: "ci",
                            verdict: "FAIL",
                            exitCode: null,
                            failures: null,
                            scope,
                            log: logArg,
                            artifact,
                            evidence,
                        });
                        ctx.emit({
                            source: "ci",
                            verdict: "FAIL",
                            scope,
                            exitCode: null,
                            failures: null,
                            ...evidence,
                            artifact,
                            log: logArg,
                            logBytes: Buffer.byteLength(text),
                            reports: null,
                            clamp: null,
                            row,
                        });
                        return EXIT.NO;
                    }
                }
                const tailRaw = str(ctx.flags.tail) ?? String(DEFAULT_TAIL);
                if (!/^[0-9]+$/.test(tailRaw)) {
                    throw new CommandError(EXIT.USAGE, `--tail must be a non-negative integer, got "${tailRaw}"`);
                }
                // Gates are declared and run at the top of the checkout being tested (the
                // feature worktree), wherever in it the caller happens to stand.
                const top = git(ctx.cwd, ["rev-parse", "--show-toplevel"]) ?? ctx.cwd;
                const gate = resolveGate(top, candidates);
                if (gate === null) {
                    const read = readPackageJson(top);
                    if (!read.ok)
                        ctx.log(`package.json at ${top} is ${read.reason}`);
                    ctx.log(`no bkit:gate:* script declared (looked for ${candidates.join(", ")}) — ${NO_GATE_HINT}`);
                    return EXIT_NO_GATE;
                }
                const scope = gateScope(gate);
                const log = path.resolve(ctx.cwd, logArg);
                const reports = freshReportDir(log);
                ctx.log(`running ${scope} — full output in ${logArg}`);
                const fetchedAt = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
                const who = ["bkit tests run", gate, fid, step].filter(Boolean).join(" ");
                const exitCode = runToLog(scriptCommand(gate), top, log, {
                    [REPORT_DIR_ENV]: reports,
                    LOCAL_STACK_LOCK_WAIT_S: String(waitS),
                    LOCAL_STACK_LOCK_WHO: who,
                });
                const logText = fs.readFileSync(log, "utf-8");
                const lockExit = classifyLockExit({ exitCode, log: logText, who });
                const lockWait = lockExit === "lock-wait";
                const lockHolder = lockWait ? testsLockHolder(logText, who) : null;
                const lines = lockExit === "gate"
                    ? Number(tailRaw) > 0
                        ? tailLines(log, Number(tailRaw))
                        : []
                    : logText.split(/\r?\n/).filter((line) => line.startsWith("[machine-lock]"));
                for (const line of lines)
                    ctx.log(line);
                const couldNotRun = lockExit === "could-not-run" || COULD_NOT_RUN_EXIT_CODES.has(exitCode);
                const verdict = couldNotRun || lockWait ? null : exitCode === 0 ? "PASS" : "FAIL";
                const counted = lockExit === "gate" ? countReportFailures(reports) : null;
                if (counted === null && lockExit === "gate")
                    ctx.log(NO_REPORT_HINT);
                else if (verdict === "FAIL" && counted === 0)
                    ctx.log(`the JUnit reports in $${REPORT_DIR_ENV} hold no failing case — the gate failed outside its reported tests; failures unknown`);
                const failures = verdict === "PASS" ? 0 : counted !== null && counted > 0 ? counted : null;
                let clamp = null;
                let artifactFailed = null;
                if (artifact !== undefined && !lockWait) {
                    try {
                        const out = path.resolve(ctx.cwd, artifact);
                        fs.mkdirSync(path.dirname(out), { recursive: true });
                        fs.copyFileSync(log, out);
                        const clampLog = clampLogPath(ctx.cwd, fid, step, attempt);
                        fs.mkdirSync(path.dirname(clampLog), { recursive: true });
                        fs.writeFileSync(clampLog, "");
                        clamp = clampFile(out, "debug-evidence", artifact, {
                            rawDir: null,
                            source: scope,
                            fetchedAt,
                            original: log,
                        });
                        appendRecord(clampLog, clamp);
                    }
                    catch (err) {
                        // The verdict stands; the step's artifact is what failed.
                        clamp = null;
                        artifactFailed = err.message;
                    }
                }
                const row = status === undefined || lockWait
                    ? null
                    : appendTestRun(status, {
                        workflow: workflow,
                        step: step,
                        attempt,
                        verdict,
                        exitCode,
                        failures,
                        scope,
                        log: logArg,
                        artifact,
                        source: "local",
                    });
                ctx.emit({
                    source: "local",
                    verdict,
                    exitCode,
                    gate,
                    scope,
                    failures,
                    reports: `${logArg}.reports`,
                    log: logArg,
                    logBytes: fs.statSync(log).size,
                    artifact: lockWait ? null : (artifact ?? null),
                    clamp,
                    row,
                    lockHolder,
                });
                if (artifactFailed !== null) {
                    ctx.log(`--artifact ${artifact}: ${artifactFailed}`);
                    return EXIT_ARTIFACT_STEP;
                }
                if (lockWait)
                    return EXIT.AGENT_WAIT;
                if (couldNotRun) {
                    ctx.log(`${scope} could not run (exit ${exitCode}: ${lockExit === "could-not-run" ? "tests lock refused" : exitCode === 126 ? "not executable" : "command not found"}) — no tests executed; this is not a FAIL verdict`);
                    return EXIT_COULD_NOT_RUN;
                }
                ctx.log(`verdict ${verdict} (exit ${exitCode})`);
                return verdict === "PASS" ? EXIT.OK : EXIT.NO;
            },
        },
        red: {
            summary: "Run every TEST FIRST test of one group's open tasks before any task code exists, and write one build-tests-red row holding a state and blob per planned test; a test an earlier row of the group proved red, its file unchanged since, is not run again. Exit 0 every test red, 1 a gap (a test passing, absent from its report, failing lint, or its file missing), 3 bkit:test:file undeclared (blobs recorded, nothing ran), 4 a script could not run.",
            use: "workflow",
            flags: [
                FILE_FLAG,
                WORKFLOW_FLAG,
                {
                    ...GROUP_FLAG,
                    required: true,
                    help: "the group whose planned tests run (positive integer)",
                },
                {
                    name: "plan",
                    type: "string",
                    required: true,
                    repeatable: true,
                    help: "candidate plan file; the first that exists is read",
                },
                {
                    name: "log",
                    type: "string",
                    required: true,
                    help: "file the red report is written to (directories are created)",
                },
                {
                    name: "writer-log",
                    type: "string",
                    help: "the tests step's log: a `PASSES — TASK N: `file` `name`: reason` line there accepts that test's pass as passed-accepted",
                },
            ],
            output: {
                enforced: "false when bkit:test:file is not declared (the row records the blobs, every state unknown, exit 3) or the plan could not be read (no row, exit 1)",
                reason: "why test-first is not enforced",
                attempt: "this group's build-tests-red rows so far, this one included",
                tests: "[{task, test, testName, state, blob, reason?}] in plan order, the tests run now: state red | red-not-loaded | passed-accepted | vacuous | missing | no-report | lint | unknown; blob the test file's git blob as it stood (null when the file is missing); reason the tests step's, on passed-accepted",
                skipped: "planned tests an earlier row of the group proved red, their file unchanged since: not run again, and not on this row",
                gaps: "[{task, test, name, kind, detail}]: every planned test whose state is not red, red-not-loaded or passed-accepted; kind is the state",
                row: "the build-tests-red row written",
                log: "where the report was written (as given)",
            },
            exitCodes: {
                [EXIT_NO_GATE]: `${BKIT_TEST_FILE_SCRIPT} is not declared in package.json: the row holds the blobs with enforced false, and no test ran`,
                [EXIT_COULD_NOT_RUN]: "bkit:lint:file or bkit:test:file could not run (exit 126 / 127); nothing written",
            },
            run: (ctx) => {
                const workflow = String(ctx.flags.workflow);
                const group = positiveInt(ctx.flags.group, "group");
                const logArg = String(ctx.flags.log);
                if (logArg === "")
                    throw new CommandError(EXIT.USAGE, "--log must be non-empty");
                const log = path.resolve(ctx.cwd, logArg);
                const top = toplevel(ctx.cwd);
                const exists = (p) => fs.existsSync(path.resolve(ctx.cwd, p));
                const plan = ctx.flags.plan.find(exists);
                const planText = plan ? fs.readFileSync(path.resolve(ctx.cwd, plan), "utf-8") : "";
                const parsed = parsePlanBlocks(planText);
                const status = statusFile(ctx);
                const attempt = redAttempt(status, workflow, group);
                const refusal = planRefusal(plan, parsed);
                if (refusal !== undefined) {
                    writeRedReport(log, {
                        enforced: false,
                        reason: refusal,
                        plan,
                        group,
                        attempt,
                        tests: [],
                        details: new Map(),
                        gaps: [],
                        outputs: [],
                    });
                    ctx.emit({ enforced: false, reason: refusal, attempt, tests: [], gaps: [], log: logArg });
                    ctx.log(`test-first not enforced: ${refusal}`);
                    return EXIT.NO;
                }
                const g = parsed.groups.find((x) => x.group === group);
                if (g === undefined)
                    throw new CommandError(EXIT.USAGE, `the plan has no GROUP ${group}`);
                if (g.tasks.length === 0)
                    throw new CommandError(EXIT.USAGE, `GROUP ${group} has no tasks; nothing to run`);
                const done = new Set(parsed.tasks.filter((t) => t.done).map((t) => t.task));
                // A red an earlier row proved stands while the test's own lines are unchanged, so a
                // retry, a handover or a task added to the group runs only what is left, and an edit
                // to another test of the same file costs no proof. A test whose lines could not be
                // found, and rows from before per-test locking, stand while the whole file is unchanged.
                const proven = redEntries(status, workflow, group);
                const textOf = (test) => {
                    const abs = path.join(top, test);
                    return fs.existsSync(abs) ? fs.readFileSync(abs, "utf-8") : null;
                };
                const standing = (t) => {
                    const earlier = proven.get(redKey(t.task, t.test, t.testName));
                    if (earlier === undefined || !RED_PROVEN.has(earlier.state))
                        return false;
                    if (earlier.block === undefined || earlier.block === null)
                        return git(top, ["hash-object", "--", t.test]) === earlier.blob;
                    return blockHash(textOf(t.test), t.testName) === earlier.block;
                };
                const startSha = groupStartSha(status, workflow, group);
                /** The test's lines at the group's start commit: it existed before this group's tests step. */
                const blockAtStart = (t) => {
                    if (startSha === undefined)
                        return null;
                    const shown = runGit(top, ["show", `${startSha}:${t.test}`]);
                    return shown.ok ? blockHash(shown.stdout, t.testName) : null;
                };
                const tests = [];
                let skipped = 0;
                for (const s of readTestFirst(planText, group)) {
                    if (s.kind !== "test" || done.has(s.task))
                        continue;
                    for (const t of s.tests) {
                        const planned = {
                            task: s.task,
                            test: t.test,
                            testName: t.name,
                            state: "unknown",
                            blob: null,
                        };
                        if (standing(planned))
                            skipped += 1;
                        else
                            tests.push(planned);
                    }
                }
                if (skipped > 0)
                    ctx.log(`tests red: ${skipped} planned test(s) already red, not run again`);
                const enforced = resolveGate(top, [BKIT_TEST_FILE_SCRIPT]) !== null;
                const lint = resolveGate(top, [BKIT_LINT_FILE_SCRIPT]) !== null;
                if (enforced && !lint && tests.length > 0)
                    ctx.log(`${BKIT_LINT_FILE_SCRIPT} is not declared — the tests are not linted before their red`);
                const writerLog = str(ctx.flags.writerLog);
                const writerPath = writerLog === undefined ? undefined : path.resolve(ctx.cwd, writerLog);
                const passes = writerPath !== undefined && fs.existsSync(writerPath)
                    ? passesLines(fs.readFileSync(writerPath, "utf-8"))
                    : [];
                const details = new Map();
                const outputs = [];
                const couldNotRun = (script, exitCode) => `${gateScope(script)} could not run (exit ${exitCode}: ${exitCode === 126 ? "not executable" : "command not found"}) — no test executed`;
                const dir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-tests-red-"));
                try {
                    for (const file of [...new Set(tests.map((t) => t.test))]) {
                        const mine = tests.filter((t) => t.test === file);
                        if (!fs.existsSync(path.join(top, file))) {
                            for (const t of mine) {
                                t.state = "missing";
                                details.set(t, `\`${file}\` does not exist`);
                            }
                            continue;
                        }
                        // `-w` stores the file in git: green and `steps finish` read the blob back later.
                        const blob = git(top, ["hash-object", "-w", "--", file]);
                        const text = textOf(file);
                        for (const t of mine) {
                            t.blob = blob;
                            t.block = blockHash(text, t.testName);
                        }
                        if (!enforced)
                            continue;
                        const runLog = path.join(dir, "run.log");
                        if (lint) {
                            const linted = runToLog([...scriptCommand(BKIT_LINT_FILE_SCRIPT), file], top, runLog);
                            outputs.push({
                                title: `Lint output — \`${file}\``,
                                text: fs.readFileSync(runLog, "utf-8"),
                            });
                            if (COULD_NOT_RUN_EXIT_CODES.has(linted)) {
                                ctx.log(couldNotRun(BKIT_LINT_FILE_SCRIPT, linted));
                                return EXIT_COULD_NOT_RUN;
                            }
                            if (linted !== 0) {
                                for (const t of mine) {
                                    t.state = "lint";
                                    details.set(t, `${BKIT_LINT_FILE_SCRIPT} exited ${linted} on \`${file}\`: fix the test until it lints clean (output below)`);
                                }
                                continue;
                            }
                        }
                        const { exitCode, cases } = runTestFile(top, file, runLog);
                        outputs.push({
                            title: `Runner output — \`${file}\``,
                            text: fs.readFileSync(runLog, "utf-8"),
                        });
                        if (COULD_NOT_RUN_EXIT_CODES.has(exitCode)) {
                            ctx.log(couldNotRun(BKIT_TEST_FILE_SCRIPT, exitCode));
                            return EXIT_COULD_NOT_RUN;
                        }
                        for (const t of mine) {
                            const judged = judgeRed(cases, t.testName, file);
                            const accepted = judged.state === "vacuous"
                                ? passes.find((p) => p.task === t.task && p.test === t.test && p.name === t.testName)
                                : undefined;
                            const before = judged.state === "vacuous" ? blockAtStart(t) : null;
                            if (accepted !== undefined) {
                                t.state = "passed-accepted";
                                t.reason = accepted.reason;
                                details.set(t, `passes; accepted by the tests step: ${accepted.reason}`);
                            }
                            else if (before !== null && before !== t.block) {
                                t.state = "updated";
                                t.base = startSha;
                                details.set(t, `an existing test, changed since the group started (\`${startSha.slice(0, 9)}\`) and passing: the verifier judges its diff — it may add expectations, never remove or loosen one`);
                            }
                            else {
                                t.state = judged.state;
                                details.set(t, judged.detail);
                            }
                        }
                    }
                }
                finally {
                    fs.rmSync(dir, { recursive: true, force: true });
                }
                const gaps = [];
                for (const t of tests) {
                    if (RED_PROVEN.has(t.state) || t.state === "unknown")
                        continue;
                    const gap = {
                        task: t.task,
                        test: t.test,
                        name: t.testName,
                        kind: t.state,
                        detail: details.get(t) ?? t.state,
                    };
                    gaps.push(gap);
                    ctx.log(`not a red (${gap.kind}): TASK ${gap.task} \`${gap.test}\` "${gap.name}" — ${gap.detail}`);
                }
                writeRedReport(log, {
                    enforced,
                    reason: enforced
                        ? undefined
                        : `\`${BKIT_TEST_FILE_SCRIPT}\` is not declared in package.json`,
                    plan,
                    group,
                    attempt,
                    tests,
                    details,
                    gaps,
                    outputs,
                });
                const written = writeStepRow(ctx.cwd, {
                    file: status,
                    workflow,
                    step: RED_STEP,
                    group,
                    attempt,
                    artifacts: [path.relative(ctx.cwd, log)],
                    extras: { enforced, tests },
                    commit: "none",
                }, ctx.log);
                ctx.emit({ enforced, attempt, tests, skipped, gaps, row: written.row, log: logArg });
                if (gaps.length > 0) {
                    ctx.log(`tests red: ${gaps.length} gap(s) — report in ${logArg}`);
                    return EXIT.NO;
                }
                if (!enforced) {
                    ctx.log(`${BKIT_TEST_FILE_SCRIPT} is not declared — ${NO_TEST_FILE_HINT}`);
                    return EXIT_NO_GATE;
                }
                ctx.log(`tests red: ${tests.length} planned test(s) red — report in ${logArg}`);
                return EXIT.OK;
            },
        },
        green: {
            summary: "Audit a plan's test-first evidence (each TEST FIRST test red at its group's tests step, by the build-tests-red row, or accepted there as passing before any task code; the named test passing now); exit 0 no gaps, 1 gaps or a plan with no task markers.",
            use: "workflow",
            flags: [
                FILE_FLAG,
                WORKFLOW_FLAG,
                { ...GROUP_FLAG, help: "audit only this task group's tasks (positive integer)" },
                {
                    name: "plan",
                    type: "string",
                    required: true,
                    repeatable: true,
                    help: "candidate plan file; the first that exists is audited",
                },
                {
                    name: "log",
                    type: "string",
                    required: true,
                    help: "file the audit report is written to (directories are created)",
                },
            ],
            output: {
                enforced: "false when the audit could not run: no plan file, a plan with no task markers (exit 1), or the test-file script undeclared (exit 0)",
                reason: "why test-first is not enforced",
                plan: "the plan file audited",
                verdict: "PASS no gaps | FAIL a gap's fixable is false | CONCERNS every gap's fixable is true | null when a gap needs a diff read, or the audit could not run",
                gaps: "[{task, kind, detail, fixable, logLine}]: no-test-first | test-first-malformed | test-first-unread (task null: a plan-level format problem) | not-green | exception-refused (a task whose only test field is a TEST EXCEPTION not honoured) | delete-still-referenced (a DELETE line's file still exists, or its name is still found in the tree); fixable is null when the gap needs a diff read; logLine is the line the verifier appends",
                alreadyLanded: "[{task, test, name, reason}]: tests the tests step accepted as passing before any task code (passed-accepted on the red row); no red is due for them",
                unproven: "[{task, test, name, detail}]: tests with no proven red (no build-tests-red row, or a state other than red, red-not-loaded, updated or passed-accepted) and no honoured TEST EXCEPTION; never a gap — the owner answers them once, at the end of the build",
                updated: "[{task, test, name, base, additive, diff}]: existing tests the tests step changed (updated on the red row); base is the group's start commit; additive = the test's own lines since base gained lines and lost none (null when a side cannot be read), diff = their unified line diff; the verifier judges each diff — it may add expectations, never remove or loosen one",
                log: "where the report was written (as given)",
            },
            exitCodes: {
                [EXIT_COULD_NOT_RUN]: `${BKIT_TEST_FILE_SCRIPT} could not run (exit 126 / 127)`,
            },
            run: (ctx) => {
                const workflow = String(ctx.flags.workflow);
                const group = positiveInt(ctx.flags.group, "group");
                const logArg = String(ctx.flags.log);
                if (logArg === "")
                    throw new CommandError(EXIT.USAGE, "--log must be non-empty");
                const log = path.resolve(ctx.cwd, logArg);
                const top = toplevel(ctx.cwd);
                const exists = (p) => fs.existsSync(path.resolve(ctx.cwd, p));
                const plan = ctx.flags.plan.find(exists);
                const planText = plan ? fs.readFileSync(path.resolve(ctx.cwd, plan), "utf-8") : "";
                const parsed = parsePlanBlocks(planText);
                const specs = readTestFirst(planText, group);
                // A plan with no task markers is an old-format plan: nothing it says can be audited,
                // and passing it would let its tests go unchecked.
                const refusal = planRefusal(plan, parsed);
                if (refusal === undefined && group !== undefined) {
                    const g = parsed.groups.find((x) => x.group === group);
                    if (g === undefined)
                        throw new CommandError(EXIT.USAGE, `the plan has no GROUP ${group}`);
                    if (g.tasks.length === 0)
                        throw new CommandError(EXIT.USAGE, `GROUP ${group} has no tasks; nothing to audit`);
                }
                const reason = refusal ??
                    (resolveGate(top, [BKIT_TEST_FILE_SCRIPT]) === null
                        ? `\`${BKIT_TEST_FILE_SCRIPT}\` is not declared in package.json`
                        : undefined);
                const empty = {
                    verdict: null,
                    rows: [],
                    gaps: [],
                    exceptions: [],
                    landed: [],
                    unproven: [],
                    updated: [],
                    outputs: [],
                };
                if (reason !== undefined) {
                    writeAuditReport(log, { enforced: false, reason, plan, ...empty });
                    ctx.emit({
                        enforced: false,
                        reason,
                        plan: plan ?? null,
                        verdict: null,
                        gaps: [],
                        alreadyLanded: [],
                        unproven: [],
                        updated: [],
                        log: logArg,
                    });
                    ctx.log(`test-first not enforced: ${reason}`);
                    return refusal === undefined ? EXIT.OK : EXIT.NO;
                }
                const reds = redEntries(statusFile(ctx), workflow);
                const groupOf = (task) => parsed.tasks.find((b) => b.task === task)?.group;
                const landed = [];
                const unproven = [];
                const updated = [];
                const statusRel = repoRel(top, ctx.cwd, statusFile(ctx));
                const exceptions = [];
                const gaps = [];
                const rows = [];
                const outputs = [];
                const greens = new Map();
                /** One run per test file; null when the script could not run. */
                const greenRun = (test) => {
                    const cached = greens.get(test);
                    if (cached !== undefined)
                        return cached;
                    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-test-green-"));
                    const runLog = path.join(dir, "output.log");
                    const { exitCode, cases } = runTestFile(top, test, runLog);
                    const tail = tailLines(runLog, DEFAULT_TAIL).join("\n");
                    fs.rmSync(dir, { recursive: true, force: true });
                    if (COULD_NOT_RUN_EXIT_CODES.has(exitCode)) {
                        ctx.log(couldNotRunMessage(exitCode));
                        return null;
                    }
                    const run = { cases, tail };
                    greens.set(test, run);
                    return run;
                };
                for (const s of specs) {
                    if (s.kind === "na") {
                        const block = parsed.tasks.find((t) => t.task === s.task);
                        if (block.testFirst !== undefined || block.testException === undefined)
                            continue;
                        const refused = exceptionRefusal(top, repoRel(top, ctx.cwd, plan), block.testException.lines, statusRel);
                        exceptions.push({
                            task: s.task,
                            refusal: refused,
                            cleared: refused === null ? ["the task's `TEST FIRST` check"] : [],
                        });
                        if (refused !== null)
                            gaps.push(gapOf(s.task, EXCEPTION_REFUSED, `the task's only test field is a \`**TEST EXCEPTION:**\`, not honoured: ${refused}`));
                        continue;
                    }
                    if (s.kind !== "test") {
                        gaps.push(gapOf(s.task, s.kind === "missing" ? "no-test-first" : "test-first-malformed", s.kind === "missing"
                            ? "the task has neither a `**TEST FIRST:**` nor a `**TEST EXCEPTION:**` field"
                            : "`**TEST FIRST:**` is neither `n/a — {reason}` nor one sub-bullet per test naming a backticked test file and test name"));
                        continue;
                    }
                    const excepted = s.exception;
                    const exception = excepted === undefined
                        ? undefined
                        : {
                            task: s.task,
                            refusal: exceptionRefusal(top, repoRel(top, ctx.cwd, plan), excepted.lines, statusRel),
                            cleared: [],
                        };
                    if (exception !== undefined)
                        exceptions.push(exception);
                    for (const t of s.tests) {
                        const row = {
                            task: s.task,
                            test: `\`${t.test}\` "${t.name}"`,
                            red: "no row",
                            green: "—",
                        };
                        rows.push(row);
                        const clearing = exception?.refusal === null &&
                            excepted.tests.some((e) => e.test === t.test && e.name === t.name)
                            ? exception
                            : undefined;
                        const gap = (kind, detail) => gaps.push(gapOf(s.task, kind, detail, { file: t.test, name: t.name }));
                        const noRed = (detail) => {
                            if (clearing !== undefined)
                                clearing.cleared.push(`the red for \`${t.test}\` "${t.name}"`);
                            else
                                unproven.push({ task: s.task, test: t.test, name: t.name, detail });
                        };
                        const red = reds.get(redKey(s.task, t.test, t.name));
                        if (red === undefined)
                            noRed(`no tests step recorded a red for it (\`bkit tests red --group=${groupOf(s.task) ?? "N"}\`)`);
                        else if (red.state === "passed-accepted") {
                            row.red = red.state;
                            landed.push({ task: s.task, test: t.test, name: t.name, reason: red.reason ?? "" });
                        }
                        else if (RED_PROVEN.has(red.state)) {
                            row.red = red.state;
                            if (red.state === "updated")
                                updated.push(updatedEntry(top, s.task, t, red.base ?? null));
                        }
                        else {
                            row.red = red.state;
                            noRed(`the tests step left it as \`${red.state}\`, not red`);
                        }
                        if (!fs.existsSync(path.join(top, t.test))) {
                            row.green = "file missing";
                            gap("not-green", `\`${t.test}\` does not exist`);
                            continue;
                        }
                        const green = greenRun(t.test);
                        if (green === null)
                            return EXIT_COULD_NOT_RUN;
                        const why = judgeGreen(green.cases, t.name);
                        row.green = why === null ? "passed" : "not passed";
                        if (why !== null) {
                            gap("not-green", why);
                            if (!outputs.some((o) => o.test === t.test))
                                outputs.push({ test: t.test, tail: green.tail });
                        }
                    }
                }
                gaps.push(...deleteGaps(top, repoRel(top, ctx.cwd, plan), parsed.tasks.filter((t) => group === undefined || t.group === group), parsed.tasks));
                for (const e of parsed.errors)
                    gaps.push(gapOf(null, "test-first-unread", `\`${plan}:${e.line}\` ${e.message} — tests there were not audited; the plan's blocks need fixing`));
                const verdict = verdictOf(gaps);
                writeAuditReport(log, {
                    enforced: true,
                    plan,
                    verdict,
                    rows,
                    gaps,
                    exceptions,
                    landed,
                    unproven,
                    updated,
                    outputs,
                });
                ctx.emit({
                    enforced: true,
                    plan,
                    verdict,
                    gaps,
                    alreadyLanded: landed,
                    unproven,
                    updated,
                    log: logArg,
                });
                ctx.log(`test-first audit: ${gaps.length} gap(s), ${unproven.length} unproven — report in ${logArg}`);
                return gaps.length === 0 ? EXIT.OK : EXIT.NO;
            },
        },
        "plan-check": {
            summary: `Check a plan's group and task blocks: the block format, DONE WHEN and TEST FIRST on every task, DEPENDS ON order, the caps from package.json \`bkit.workflows.tasks\` (defaults: ${capsText(CONFIG_DEFAULTS.tasks)}), a Reuse Inventory NEW row per CREATE file, a Supersession Inventory row per DELETE, a \`Task\` on every Derived Test Matrix row and a row per test-bearing task, and that each READ / UPDATE / DELETE file and symbol exists; exit 0 no problems, 1 refused.`,
            use: "by-hand",
            flags: [
                {
                    name: "plan",
                    type: "string",
                    required: true,
                    help: "the plan file checked",
                },
                {
                    name: "existence",
                    type: "string",
                    help: "refuse (default): a missing READ / UPDATE / DELETE file or symbol refuses the plan; report: it is listed only",
                },
                {
                    name: "log",
                    type: "string",
                    required: true,
                    help: "file the report is written to, `Problems:` header first (directories are created)",
                },
            ],
            output: {
                plan: "the plan file checked (as given)",
                groups: "[{group, title, tasks, tests, kb}]: each group's tasks, planned TEST FIRST tests and size",
                tasks: "[{task, group, tests, files}]: each task's planned tests and distinct test files",
                problems: "[{line, kind, message}]: format | stray | field | depends | cap | inventory | matrix | supersession | markers — each refuses the plan",
                existence: "[{line, task, message}]: READ / UPDATE / DELETE files or symbols not found; refuses only with --existence=refuse",
                existing: "[{line, task, test, name}]: planned tests of open tasks whose name a test in their file already carries; reported only, never refuses",
                log: "where the report was written (as given)",
            },
            run: (ctx) => {
                const logArg = String(ctx.flags.log);
                if (logArg === "")
                    throw new CommandError(EXIT.USAGE, "--log must be non-empty");
                const existenceArg = str(ctx.flags.existence) ?? "refuse";
                if (existenceArg !== "refuse" && existenceArg !== "report")
                    throw new CommandError(EXIT.USAGE, `--existence must be refuse or report, got "${existenceArg}"`);
                const plan = String(ctx.flags.plan);
                const planAbs = path.resolve(ctx.cwd, plan);
                if (!fs.statSync(planAbs, { throwIfNoEntry: false })?.isFile())
                    throw new CommandError(EXIT.USAGE, `--plan ${plan} does not exist`);
                const text = fs.readFileSync(planAbs, "utf-8");
                const caps = planCaps(ctx.cwd);
                const { groups, sizes, problems } = checkPlanText(text, caps);
                const existence = planExistence(text, toplevel(ctx.cwd));
                const existing = existingTestNames(text, toplevel(ctx.cwd));
                const refused = problems.length > 0 || (existenceArg === "refuse" && existence.length > 0);
                const out = [
                    `Problems: ${problems.length}`,
                    `Existence: ${existence.length}`,
                    "",
                    "<!-- verdict:end -->",
                    "",
                    "# Plan Check",
                    "",
                    `Plan: \`${plan}\`. Caps: ${capsText(caps)}.`,
                    "",
                    "## Groups",
                    "",
                ];
                if (groups.length === 0)
                    out.push("No group blocks read.");
                else {
                    out.push("| Group | Title | Tasks | TEST FIRST tests | KB |", "| --- | --- | --- | --- | --- |");
                    for (const g of groups)
                        out.push(`| ${g.group} | ${g.title} | ${g.tasks} | ${g.tests} | ${g.kb.toFixed(1)} |`);
                }
                if (sizes.length > 0) {
                    out.push("", "## Tasks", "", "| Task | Group | Tests | Test files |", "| --- | --- | --- | --- |");
                    for (const t of sizes)
                        out.push(`| ${t.task} | ${t.group} | ${t.tests} | ${t.files} |`);
                }
                out.push("", "## Problems", "");
                if (problems.length === 0)
                    out.push("None.");
                for (const p of problems)
                    out.push(`- \`${plan}:${p.line}\` \`${p.kind}\` — ${p.message}`);
                out.push("", `## Existence (${existenceArg === "refuse" ? "refuses the plan" : "reported only"})`, "");
                if (existence.length === 0)
                    out.push("None.");
                for (const e of existence)
                    out.push(`- \`${plan}:${e.line}\` — ${e.message}`);
                if (existing.length > 0)
                    out.push("", "## Planned test names already in use (reported only)", "");
                for (const e of existing)
                    out.push(`- \`${plan}:${e.line}\` TASK ${e.task}: \`${e.test}\` already holds a test named "${e.name}" — name the update to it in TEST FIRST, or give the new test a new name`);
                const log = path.resolve(ctx.cwd, logArg);
                fs.mkdirSync(path.dirname(log), { recursive: true });
                fs.writeFileSync(log, `${out.join("\n")}\n`);
                ctx.emit({ plan, groups, tasks: sizes, problems, existence, existing, log: logArg });
                ctx.log(`plan check: ${problems.length} problem(s), ${existence.length} existence finding(s)${refused ? " — refused" : ""}; report in ${logArg}`);
                return refused ? EXIT.NO : EXIT.OK;
            },
        },
    },
};
