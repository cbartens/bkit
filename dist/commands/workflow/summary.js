// The summary a phase workflow writes at its Summary step (`bkit workflows summary`):
// verdict, reasons and the recommended next command, from the run's status rows,
// its log files, the plan and the ledger rows it added. Pure: the caller reads the
// disk and passes `read` for the log files.
import { coversList } from "./plans.js";
import { issueIdOf } from "./fids.js";
import { parseDecisionItems } from "./decisions.js";
import { parsePlanBlocks } from "./plan-blocks.js";
import { parseJson } from "../../shared/json.js";
import { challengeResolution, taskVerified } from "./summary-findings.js";
export const SUMMARY_WORKFLOWS = ["plan", "design", "build", "debug", "ship"];
/** Per workflow and verdict, the next command the summary recommends. */
export const NEXT_STEP = {
    plan: {
        PASS: { command: "/bkit-build" },
        CONCERNS: { command: "/bkit-build", or: "/bkit-plan" },
        FAIL: { command: "/bkit-plan" },
    },
    design: {
        PASS: { command: "/bkit-plan" },
        CONCERNS: { command: "/bkit-plan", or: "/bkit-design" },
        FAIL: { command: "/bkit-design" },
    },
    debug: {
        PASS: { command: "/bkit-ship" },
        CONCERNS: { command: "/bkit-ship", or: "/bkit-debug" },
        FAIL: { line: "Manual handover — no bkit command; see the debug handover." },
    },
    build: {
        PASS: { command: "/bkit-ship" },
        CONCERNS: { command: "/bkit-ship" },
        FAIL: { command: "/bkit-debug" },
    },
    ship: {
        PASS: { line: "No further bkit command — feature shipped." },
        CONCERNS: { line: "No further bkit command — feature shipped." },
        FAIL: { command: "/bkit-ship" },
    },
};
/**
 * The issue reference a FID carries: `160-slug` → `#160`, `abc-123-slug` →
 * `ABC-123`; undefined when the FID has no issue segment for `tracker`.
 */
export function refOf(fid, tracker = "any") {
    const id = issueIdOf(fid, tracker);
    if (id === null)
        return undefined;
    return /^[0-9]+$/.test(id) ? `#${id}` : id;
}
/**
 * Review updates cover their review's findings. The same group's verification, or a
 * whole-plan verification, covers failed execution; a passing test run covers a failed
 * test-failure fix. None covers a remediation agent's separate warnings or flakes.
 */
const RESOLVED_BY = {
    "plan/plan-review": ["plan-apply-review"],
    "design/design-review": ["design-apply-review"],
    "build/build-plan-tasks": ["build-plan-verify", "build-plan-verify-holistic"],
    "build/build-plan-gaps-remediate": ["build-plan-verify", "build-plan-verify-holistic"],
    "build/build-plan-gaps-remediate-holistic": ["build-plan-verify-holistic"],
    "build/build-failure-remediate": ["build-run-tests"],
};
/** Steps that check the whole run, so they answer a failure in any task group. */
const WHOLE_RUN = new Set(["build-plan-verify-holistic", "build-run-tests"]);
const RUN_TESTS = new Set(["build-run-tests", "debug-run-tests"]);
const SEVERITY = /\*\*Severity:\*\*\s*(CRITICAL|HIGH|MEDIUM|LOW)\b/;
const TEST_EXCEPTION = "**TEST EXCEPTION:**";
const str = (v) => (typeof v === "string" ? v : undefined);
const artifactsOf = (r) => Array.isArray(r.artifacts) ? r.artifacts.filter((a) => typeof a === "string") : [];
/** A step row's task group (`group`, or debug's `subPlan`); undefined when it has none. */
const taskGroupOf = (r) => {
    const taskGroup = r.group ?? r.subPlan;
    return typeof taskGroup === "number" ? taskGroup : undefined;
};
const WARNING_FIELDS = [
    "topic",
    "gap",
    "recommendedPath",
    "alternativeEvidence",
    "action",
];
/** Raw inputs (`*-input-N.md`) are untrusted: never a source of warnings. */
const isRawInput = (rel) => /(^|\/)[a-z-]*-?input-[^/]*$/.test(rel) ||
    /(^|\/)related-(issues|failures|deferrals)\.md$/.test(rel) ||
    /(^|\/)context-related-[^/]*$/.test(rel);
/** Text between the untrusted-content markers is external data: never a source of warnings. */
const stripUntrusted = (text) => {
    const open = /^[^\n]*={5} BEGIN UNTRUSTED ={5}/m.exec(text);
    if (!open)
        return text;
    // The fence ends at the LAST closing marker: any earlier closer inside the payload is forged.
    const closers = [...text.matchAll(/^[^\n]*={5} END UNTRUSTED ={5}[^\n]*(?:\r?\n|$)/gm)].filter((m) => m.index >= open.index + open[0].length);
    const last = closers.at(-1);
    const end = last ? last.index + last[0].length : text.length;
    return text.slice(0, open.index) + text.slice(end);
};
/**
 * The top-level `{...}` objects in a fence body, in order. Each may span several lines (prettier
 * rewrites a one-line record into that shape); braces inside strings are ignored. Text outside
 * an object and an unterminated object are dropped.
 */
function jsonObjectChunks(body) {
    const chunks = [];
    let depth = 0;
    let start = -1;
    let inString = false;
    let escaped = false;
    for (let i = 0; i < body.length; i++) {
        const ch = body[i];
        if (inString) {
            if (escaped)
                escaped = false;
            else if (ch === "\\")
                escaped = true;
            else if (ch === '"')
                inString = false;
            continue;
        }
        if (ch === '"' && depth > 0)
            inString = true;
        else if (ch === "{") {
            if (depth === 0)
                start = i;
            depth++;
        }
        else if (ch === "}" && depth > 0) {
            depth--;
            if (depth === 0)
                chunks.push(body.slice(start, i + 1));
        }
    }
    if (depth > 0) {
        // An unterminated object must not swallow the records after it: rescan after its first line.
        const nl = body.indexOf("\n", start);
        if (nl !== -1)
            chunks.push(...jsonObjectChunks(body.slice(nl + 1)));
    }
    return chunks;
}
/**
 * The structured records under `## Documentation Warnings` (JSON objects, one per line or pretty-printed, in a
 * `jsonl` fence) of the run's own step artifacts, merged by normalised topic and gap. A missing
 * section, a malformed line or a record without all five non-empty fields is skipped.
 */
function documentationWarnings(rows, read) {
    const merged = new Map();
    const seenFiles = new Set();
    for (const row of rows) {
        if (row.type !== "step-done")
            continue;
        for (const rel of artifactsOf(row)) {
            if (!rel.endsWith(".md") || isRawInput(rel) || seenFiles.has(rel))
                continue;
            seenFiles.add(rel);
            const raw = read(rel);
            if (raw === null)
                continue;
            const text = stripUntrusted(raw);
            const section = /^## Documentation Warnings[ \t]*\r?\n([\s\S]*?)(?=^## |(?![\s\S]))/m.exec(text);
            const fence = section === null
                ? null
                : /```jsonl[ \t]*\r?\n([\s\S]*?)(?:```|(?![\s\S]))/.exec(section[1]);
            if (fence === null)
                continue;
            for (const chunk of jsonObjectChunks(fence[1])) {
                const parsed = parseJson(chunk);
                if (!parsed.ok)
                    continue;
                const value = parsed.value;
                if (typeof value !== "object" || value === null || Array.isArray(value))
                    continue;
                const rec = value;
                const fields = WARNING_FIELDS.map((f) => rec[f]);
                if (!fields.every((f) => typeof f === "string" && f.trim() !== ""))
                    continue;
                const [topic, gap, recommendedPath, evidence, action] = fields.map((f) => f.trim());
                const key = `${topic.toLowerCase()}\u0000${gap.toLowerCase()}`;
                const found = merged.get(key) ?? {
                    topic: topic.toLowerCase(),
                    gap: gap.toLowerCase(),
                    recommendedPath: recommendedPath,
                    evidence: [],
                    actions: [],
                };
                if (!found.evidence.includes(evidence))
                    found.evidence.push(evidence);
                if (!found.actions.includes(action))
                    found.actions.push(action);
                merged.set(key, found);
            }
        }
    }
    return [...merged.values()];
}
/** The run's step rows grouped per step (and task group), in first-seen order. */
function stepGroups(rows) {
    const groups = new Map();
    rows.forEach((row, index) => {
        const step = str(row.step);
        if (row.type !== "step-done" || step === undefined)
            return;
        const sub = taskGroupOf(row);
        const scope = sub === undefined ? step : `${step}#${sub}`;
        const key = step === "build-challenge" && typeof row.round === "number" ? `${scope}@${row.round}` : scope;
        const g = groups.get(key) ?? {
            label: sub === undefined ? step : `${step} (group ${sub})`,
            key,
            step,
            rows: [],
        };
        g.rows.push({ row, index });
        groups.set(key, g);
    });
    return [...groups.values()];
}
const lastOf = (g) => g.rows.at(-1);
/** A level-2 section whose heading matches `title`, minus the template's non-content subsections. */
function planSection(text, title) {
    const lines = text.split("\n");
    const start = lines.findIndex((l) => /^## /.test(l) && title.test(l));
    if (start < 0)
        return undefined;
    const out = [];
    let skip = false;
    for (const line of lines.slice(start + 1)) {
        if (/^## /.test(line))
            break;
        if (/^### /.test(line))
            skip = /Derived Test Matrix|Human Confirmation/.test(line);
        if (!skip)
            out.push(line);
    }
    return out.join("\n").trim();
}
/**
 * A TEST EXCEPTION field's entries from its 1-based plan `fieldLines` (`plan-blocks.ts`):
 * the label line's inline value and each sub-bullet, continuation lines joined to the entry above.
 */
function exceptionEntries(lines, fieldLines) {
    const out = [];
    for (const n of fieldLines) {
        const raw = lines[n - 1] ?? "";
        const label = raw.indexOf(TEST_EXCEPTION);
        const bullet = /^\s*- (.*)$/.exec(raw);
        const text = (label >= 0 ? raw.slice(label + TEST_EXCEPTION.length) : (bullet?.[1] ?? raw)).trim();
        if (text === "")
            continue;
        if (label < 0 && bullet === null && out.length > 0)
            out[out.length - 1] += ` ${text}`;
        else
            out.push(text);
    }
    return out;
}
export function buildSummary(input) {
    const { workflow } = input;
    const groups = stepGroups(input.rows);
    const fails = [];
    const concerns = [];
    const resolved = new Map();
    const resolvedFindings = [];
    const reassessed = [];
    const read = (rel) => input.read(rel);
    // Debug: a reproduce step that could not reproduce is a re-run, not a failure.
    const reproduce = groups.find((g) => g.step === "debug-failure-reproduce");
    const reproText = reproduce ? read(artifactsOf(lastOf(reproduce).row)[0] ?? "") : null;
    const notReproduced = reproText !== null && /^Reproduced:\s*NO\b/m.test(reproText);
    if (notReproduced)
        concerns.push("Reproduced: NO");
    // Plan tasks: every unticked task of the plan files; a build always has a plan.
    const tasks = input.plans.flatMap((p) => parsePlanBlocks(p.text).tasks.map((t) => ({ ...t, path: p.path })));
    if (workflow === "build" && input.plans.length === 0)
        fails.push("No plan file");
    if (workflow === "build")
        for (const t of tasks.filter((x) => !x.done)) {
            const sev = SEVERITY.exec(t.text)?.[1];
            fails.push(`Task ${t.task} not done (${t.path})${sev === undefined ? "" : ` — ${sev} challenge finding`}`);
        }
    for (const g of groups) {
        const { row, index } = lastOf(g);
        if (g.step === `${workflow}-summary`)
            continue;
        if (RUN_TESTS.has(g.step)) {
            if (row.verdict === "FAIL")
                fails.push(`${g.label} FAIL`);
            continue;
        }
        if (row.verdict !== "FAIL" && row.verdict !== "CONCERNS")
            continue;
        if (g.step === "debug-failure-reproduce" && notReproduced)
            continue;
        if (workflow === "build" && g.step === "build-challenge") {
            const assessment = challengeResolution(input, row, index, tasks);
            if (assessment !== undefined) {
                fails.push(...assessment.failures);
                concerns.push(...assessment.concerns);
                resolvedFindings.push(...assessment.resolved);
                continue;
            }
        }
        if (workflow === "build" &&
            g.step === "build-plan-current" &&
            tasks.length > 0 &&
            tasks.every((t) => taskVerified(input, t, index))) {
            resolved.set(g.key, "build-plan-verify");
            continue;
        }
        const review = g.step === `${workflow}-review`;
        const spike = workflow === "design" && g.step === "design-spike";
        const answers = spike
            ? ["design-apply-review"]
            : review || row.verdict === "FAIL"
                ? (RESOLVED_BY[`${workflow}/${g.step}`] ?? [])
                : [];
        const sub = taskGroupOf(row);
        const answer = groups
            .map(lastOf)
            .find(({ row: r, index: i }) => i > index &&
            answers.includes(String(r.step)) &&
            (r.verdict === "PASS" || (review && r.verdict === "CONCERNS")) &&
            (r.failures === undefined || r.failures === 0) &&
            (WHOLE_RUN.has(String(r.step)) || taskGroupOf(r) === sub) &&
            (!review || r.attempt === row.attempt));
        if (answer !== undefined && spike) {
            const reports = artifactsOf(row).map((p) => read(p));
            const unsettled = reports.map((report) => report === null ? undefined : planSection(report, /^## Unsettled\s*$/));
            if (unsettled.length > 0 &&
                unsettled.every((section) => section !== undefined && section !== "")) {
                if (unsettled.every((section) => /^None\.?$/i.test(section)))
                    resolved.set(g.key, String(answer.row.step));
                else {
                    concerns.push("design-spike: unsettled claims remain");
                    reassessed.push("design-spike: design impact addressed by design-apply-review; unsettled claims remain");
                }
                continue;
            }
        }
        if (answer !== undefined && !spike && answer.row.verdict === "CONCERNS")
            reassessed.push(`${g.label} ${String(row.verdict)}, remaining findings assessed by ${String(answer.row.step)}`);
        else if (answer !== undefined && !spike)
            resolved.set(g.key, String(answer.row.step));
        else if (row.verdict === "FAIL")
            fails.push(`${g.label} FAIL`);
        else
            concerns.push(`${g.label} CONCERNS`);
    }
    // The Decision Pause: accepted items in this run's decision files.
    const decided = groups
        .filter((g) => g.step === "build-decision")
        .flatMap((g) => g.rows.flatMap(({ row }) => artifactsOf(row)));
    const acceptItems = decided.flatMap((rel) => parseDecisionItems(read(rel) ?? "")
        .filter((i) => /^Accept\b/.test(i.decision ?? ""))
        .map((i) => ({ assumed: i.assumed, line: `${rel}: Decision: ${i.decision}` })));
    // `Accept (assumed)`: taken without the owner (`ask: false` or headless); ship asks to confirm.
    const assumed = acceptItems.filter((a) => a.assumed).map((a) => a.line);
    const accepted = acceptItems.filter((a) => !a.assumed).map((a) => a.line);
    if (accepted.length > 0)
        concerns.push(`${accepted.length} item(s) accepted at the Decision Pause`);
    if (assumed.length > 0)
        concerns.push(`${assumed.length} item(s) accepted without the owner (assumed; ship asks to confirm)`);
    // Ship: assumed Accepts the owner rejected or never confirmed; ship merged anyway.
    const unconfirmed = workflow === "ship"
        ? input.decisionFiles.flatMap((rel) => parseDecisionItems(read(rel) ?? "")
            .filter((i) => i.assumed)
            .map((i) => `\`${rel}\` Q${i.n} — ${i.title}${i.rejected ? " (rejected)" : ""}`))
        : [];
    if (unconfirmed.length > 0)
        concerns.push(`shipped with ${unconfirmed.length} assumed item(s) the owner did not confirm`);
    if (input.deferralsAdded > 0)
        concerns.push(`${input.deferralsAdded} deferral(s) from this run remain open`);
    const verdict = fails.length > 0 ? "FAIL" : concerns.length > 0 ? "CONCERNS" : "PASS";
    const reasons = [...fails, ...concerns];
    // Next step.
    const step = NEXT_STEP[workflow][verdict];
    const withRef = (cmd) => (input.ref === undefined ? cmd : `${cmd} ${input.ref}`);
    let nextStep = step.command === undefined ? (step.line ?? "") : withRef(step.command);
    if (workflow === "debug" && notReproduced)
        nextStep = `${withRef("/bkit-debug")} [repro]`;
    const suggested = input.suggestedPlans ?? [];
    if (workflow === "design" && step.command === "/bkit-plan" && suggested.length > 1)
        nextStep = "File the Suggested Plans issues, then /bkit-plan <first root plan's new issue>";
    // Sections.
    const out = [
        `Verdict: ${verdict}`,
        `Failures: ${fails.length}`,
        "<!-- verdict:end -->",
        "",
        `# ${workflow[0].toUpperCase()}${workflow.slice(1)} Summary`,
        "",
        "## Verdict",
        "",
        verdict,
        "",
        ...(reasons.length > 0
            ? reasons.map((r) => `- ${r}`)
            : [
                "- No unresolved finding, failing check, open task, accepted limitation or open deferral.",
            ]),
    ];
    if (workflow === "build")
        out.push("", input.plans.length === 0
            ? "Plan tasks: no plan file."
            : `Plan tasks: ${tasks.filter((t) => t.done).length} of ${tasks.length} ticked in ${input.plans.map((p) => `\`${p.path}\``).join(", ")}.`, "", input.publish === false ? "Publish: held" : "Publish: pr", ...(input.publish === false ? ["", "Docs: not synced (ship syncs on landing)"] : []));
    out.push("", "## Steps", "", "| Step | Verdict | Failures | Attempts | Artifact |", "| --- | --- | --- | --- | --- |");
    for (const g of groups) {
        const { row } = lastOf(g);
        const artifact = artifactsOf(row)
            .map((a) => `\`${a}\``)
            .join(", ");
        out.push(`| ${g.label} | ${str(row.verdict) ?? "-"} | ${typeof row.failures === "number" ? row.failures : "-"} | ${g.rows.length} | ${artifact || "-"} |`);
    }
    out.push("", "## Resolved Findings", "");
    const resolutions = groups
        .filter((g) => resolved.has(g.key))
        .map((g) => `- ${g.label} ${String(lastOf(g).row.verdict)}, resolved by ${resolved.get(g.key)}`);
    resolutions.push(...resolvedFindings.map((r) => `- ${r}`));
    out.push(...(resolutions.length > 0 ? resolutions : ["None"]));
    if (reassessed.length > 0)
        out.push("", "## Reassessed Findings", "", ...reassessed.map((r) => `- ${r}`));
    out.push("", "## Assessment History", "", "| Step | Verdict | Attempt | Artifact |", "| --- | --- | --- | --- |");
    for (const { g, row } of groups
        .flatMap((g) => g.rows.map(({ row, index }) => ({ g, row, index })))
        .sort((a, b) => a.index - b.index)) {
        out.push(`| ${g.label} | ${str(row.verdict) ?? "-"} | ${String(row.attempt ?? "-")} | ${artifactsOf(row)
            .map((a) => `\`${a}\``)
            .join(", ") || "-"} |`);
    }
    if (workflow === "build") {
        const appended = tasks.filter((t) => SEVERITY.test(t.text));
        const low = input.deferrals.filter((r) => r.by?.step === "build-challenge");
        const gate = input.rows.filter((r) => r.type === "challenge-gate").at(-1);
        const skipped = gate?.skipped === true;
        out.push("", "## Challenge", "");
        if (skipped)
            out.push(`- challenge-1 skipped: small change (${String(gate.linesChanged)} lines, ${String(gate.filesChanged)} files)`);
        if (appended.length === 0 && low.length === 0 && !skipped)
            out.push("None");
        for (const t of appended)
            out.push(`- Task ${t.task} — ${SEVERITY.exec(t.text)[1]} — ${t.done ? "ticked" : "not ticked"} (\`${t.path}\`)`);
        for (const r of low)
            out.push(`- LOW, ${r.status === "CLOSED" ? "closed" : "deferred"}: ${String(r.key ?? "")} — ${String(r.description ?? "")}`);
    }
    if (workflow === "build" || workflow === "debug") {
        const runs = groups.filter((g) => RUN_TESTS.has(g.step)).flatMap((g) => g.rows);
        out.push("", "## Tests", "");
        if (runs.length === 0)
            out.push("None recorded.");
        for (const { row } of runs)
            out.push(`- Attempt ${String(row.attempt ?? "?")}: ${str(row.verdict) ?? "-"}, failures ${typeof row.failures === "number" ? row.failures : "-"}, ran \`${str(row.scope) ?? "unknown"}\``);
    }
    if (workflow === "plan") {
        const final = input.plans.at(-1)?.text ?? "";
        out.push("", "## Acceptance Scenario", "", planSection(final, /Acceptance Scenario/) || "None", "", "## Open Questions", "", planSection(final, /Open Questions/) || "None");
    }
    if (workflow === "design") {
        out.push("", "## Suggested Plans", "");
        if (suggested.length === 0)
            out.push("None");
        for (const p of suggested)
            out.push(`### ${p.id}: ${p.name}`, "", `Covers: ${coversList(p, input.workstreams ?? []) || "None"}`, `Requires: ${p.requiresText || "None"}`, "");
        out.push("", "## Open Questions", "", planSection(input.organised ?? "", /Risks & Open Questions/) || "None");
    }
    if (workflow === "ship" && input.pr !== undefined) {
        const pr = input.pr;
        out.push("", "## Pull Request", "", `PR #${pr.number}: +${pr.additions} / -${pr.deletions} lines across ${pr.changedFiles} files.`);
    }
    if (unconfirmed.length > 0)
        out.push("", "## Ship Completed with Assumed Items", "", "Accepted without the owner and not confirmed; each is a `needs-decision` deferral.", "", ...unconfirmed.map((u) => `- ${u}`));
    // Documentation warnings: advisory only, never part of the verdict.
    const docWarnings = documentationWarnings(input.rows, read);
    if (docWarnings.length > 0) {
        out.push("", "## Documentation Warnings", "");
        for (const w of docWarnings) {
            out.push(`- **${w.topic}** (${w.gap}) — \`${w.recommendedPath}\``);
            for (const e of w.evidence)
                out.push(`  - Evidence: ${e}`);
            for (const a of w.actions)
                out.push(`  - Action: ${a}`);
        }
    }
    // Risks and action items.
    const items = [];
    for (const g of groups) {
        if (resolved.has(g.key))
            continue;
        for (const rel of artifactsOf(lastOf(g).row).filter((a) => a.endsWith("-log.md"))) {
            const dispositions = new Map();
            for (const line of (read(rel) ?? "").split("\n")) {
                const entry = /^(BLOCKED|DONE)\s*—\s*((?:task|step|gap)\s+\d+)\b/i.exec(line);
                if (entry !== null)
                    dispositions.set(entry[2].toLowerCase(), line);
                else if (/^BLOCKED\b/.test(line))
                    dispositions.set(line, line);
            }
            for (const line of [...dispositions.values()].filter((l) => /^BLOCKED\b/.test(l)))
                items.push(`- ${line} (\`${rel}\`)`);
        }
    }
    items.push(...accepted.map((a) => `- Accepted: ${a}`));
    items.push(...assumed.map((a) => `- Assumed, not confirmed: ${a}`));
    for (const rel of workflow === "build" ? input.decisionFiles : []) {
        if (!/^Decision:/m.test(read(rel) ?? ""))
            items.push(`- \`${rel}\`: no decision recorded`);
    }
    for (const p of input.plans) {
        const lines = p.text.split(/\r?\n/);
        const covered = new Set();
        for (const t of tasks.filter((x) => x.path === p.path && x.testException !== undefined)) {
            const fieldLines = t.testException.lines;
            for (const n of fieldLines)
                covered.add(n);
            const entries = exceptionEntries(lines, fieldLines);
            for (const e of entries.length > 0 ? entries : ["no reason recorded"])
                items.push(`- TEST EXCEPTION, task ${t.task}: ${e} (\`${p.path}\`)`);
        }
        lines.forEach((l, i) => {
            if (l.includes(TEST_EXCEPTION) && !covered.has(i + 1))
                items.push(`- \`${p.path}\`: ${l.trim()}`);
        });
    }
    out.push("", "## Risks and Action Items", "", ...(items.length > 0 ? items : ["None"]));
    out.push("", "## Recommended Next Step", "", "```text", nextStep, "```");
    if (step.or !== undefined && !notReproduced)
        out.push("", `Or, to address the reasons first: \`${withRef(step.or)}\``);
    return { verdict, failures: fails.length, reasons, nextStep, markdown: `${out.join("\n")}\n` };
}
