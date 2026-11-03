import { parseFindings, mergeFindings, normalizeLocation, lowDeferralKey, } from "./challenge.js";
import { parseDecisionItems } from "./decisions.js";
const artifacts = (row) => Array.isArray(row.artifacts)
    ? row.artifacts.filter((p) => typeof p === "string")
    : [];
/** The latest assessment must cover this task, after its finding and last execution. */
export function taskVerified(input, task, after) {
    const assessments = input.rows
        .map((row, index) => ({ row, index }))
        .filter(({ row }) => row.type === "step-done" && row.step === "build-plan-verify" && row.group === task.group);
    const latest = assessments.at(-1);
    if (!task.done ||
        latest === undefined ||
        latest.index <= after ||
        latest.row.verdict !== "PASS" ||
        (latest.row.failures !== undefined && latest.row.failures !== 0))
        return false;
    if (input.rows
        .slice(latest.index + 1)
        .some((r) => r.type === "step-done" &&
        r.group === task.group &&
        (r.step === "build-plan-tasks" || r.step === "build-plan-gaps-remediate")))
        return false;
    return artifacts(latest.row).some((p) => {
        const header = (input.read(p) ?? "").split("<!-- verdict:end -->")[0];
        const numbers = /^Tasks:[ \t]*(.*)$/m
            .exec(header)?.[1]
            ?.split(",")
            .map((n) => Number(n.trim())) ?? [];
        return /^Verdict:[ \t]*PASS[ \t]*$/m.test(header) && numbers.includes(task.task);
    });
}
/** Unreadable or incomplete evidence leaves the recorded assessment unresolved. */
export function challengeResolution(input, row, index, tasks) {
    const paths = artifacts(row);
    const round = row.round;
    if (paths.length === 0 || typeof round !== "number")
        return undefined;
    const later = input.rows
        .slice(index + 1)
        .filter((r) => r.type === "step-done" && r.step === "build-challenge");
    if (row.challengeFindings === undefined &&
        later.some((r) => artifacts(r).some((p) => paths.includes(p)))) {
        const latest = later.at(-1);
        const roundTasks = tasks.filter((t) => (/\*\*Round:\*\*\s*([\d, ]+)/.exec(t.text)?.[1]?.split(",").map(Number) ?? []).includes(round));
        if (latest.verdict !== "PASS" ||
            !paths.every((p) => artifacts(latest).includes(p)) ||
            roundTasks.length === 0 ||
            !roundTasks.every((t) => taskVerified(input, t, index)))
            return undefined;
        return {
            resolved: [
                `build-challenge round ${round}, resolved by build-plan-verify and the later passing challenge covering the same reports`,
            ],
            failures: [],
            concerns: [],
        };
    }
    let findings;
    if (row.challengeFindings !== undefined) {
        const snapshot = row.challengeFindings;
        if (!Array.isArray(snapshot) ||
            !snapshot.every((f) => f !== null &&
                typeof f === "object" &&
                ["CRITICAL", "HIGH", "MEDIUM", "LOW"].includes(String(f.severity)) &&
                typeof f.location === "string" &&
                typeof f.title === "string"))
            return undefined;
        findings = snapshot;
    }
    else {
        const reports = paths.map((p) => input.read(p));
        if (reports.some((t) => t === null))
            return undefined;
        try {
            findings = mergeFindings(reports.map((t, i) => parseFindings(t, paths[i], input.root ?? process.cwd())), new Set()).findings;
        }
        catch (error) {
            return {
                resolved: [],
                failures: row.verdict === "FAIL" ? [`build-challenge FAIL: ${String(error)}`] : [],
                concerns: row.verdict === "CONCERNS" ? [`build-challenge CONCERNS: ${String(error)}`] : [],
            };
        }
    }
    if (findings.length === 0)
        return undefined;
    const result = { resolved: [], failures: [], concerns: [] };
    for (const f of findings) {
        const matches = tasks.filter((t) => {
            const location = /\*\*Location:\*\*\s*([^\n·]+)/.exec(t.text)?.[1];
            const severity = /\*\*Severity:\*\*\s*(\w+)/.exec(t.text)?.[1];
            const rounds = /\*\*Round:\*\*\s*([\d, ]+)/.exec(t.text)?.[1]?.split(",").map(Number) ?? [];
            return (location !== undefined &&
                normalizeLocation(location, input.root ?? process.cwd()) === f.location &&
                severity === f.severity &&
                rounds.includes(round));
        });
        const label = `build-challenge round ${round}: ${f.severity} ${f.location}`;
        const accepted = input.decisionFiles.some((p) => parseDecisionItems(input.read(p) ?? "").some((item) => /^Accept\b/.test(item.decision ?? "") &&
            [...item.text.matchAll(/(?<![\w@./-])[\w@./-]*[A-Za-z_][\w@./-]*:\d+/g)].some((m) => normalizeLocation(m[0], input.root ?? process.cwd()) === f.location)));
        const closed = f.severity === "LOW" &&
            input.deferrals.some((d) => d.status === "CLOSED" &&
                d.key === lowDeferralKey(input.fid, f.location) &&
                typeof d.source === "string" &&
                normalizeLocation(d.source, input.root ?? process.cwd()) === f.location);
        if (accepted)
            result.concerns.push(`${label}, accepted limitation`);
        else if (closed)
            result.resolved.push(`${label}, resolved by closed deferral`);
        else if (matches.length === 1 && taskVerified(input, matches[0], index))
            result.resolved.push(`${label}, resolved by build-plan-verify (group ${matches[0].group}, task ${matches[0].task})`);
        else
            (f.severity === "CRITICAL" ? result.failures : result.concerns).push(label);
    }
    return result;
}
