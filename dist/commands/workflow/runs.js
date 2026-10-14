// bkit runs wait|dispatch|revalidate|gate|mirror|declared|context — CI runs on
// GitHub Actions, and the context an auto-routed run starts from.
//
// Three questions, answered against `gh`, never against prose:
//   wait      has a CI run appeared (or finished) yet? Bounded poll; a runtime
//             that cannot wait hands the poll back to the agent's turn loop.
//   dispatch  after build / debug's last push, did CI start on the pushed head?
//             The CI-Dispatch Gate: poll, one clean re-trigger, a named verdict.
//   gate      may ship merge? The capstone job must be present and green at the
//             head — one exit code per refusal reason, never collapsed. Ship's
//             post-merge check (`--capstone-only`) reads the capstone job alone.
// `revalidate` is ship's re-validation before the merge gate: pick the head CI must
// pass at, probe for a run there, dispatch only when none, wait for it. `mirror` is
// `gate` in a loop, for a release PR that copies the dev push run's verdict;
// `declared` says whether the repo has a CI workflow file at all; `context` is
// `/bkit-auto` Step 1.
//
// The CI workflow file and the capstone job come from `package.json` `bkit`
// (`shared/settings.ts`). The "did CI dispatch" probe matches the capstone's lane
// namespace (`bkit-tests-check` -> any check containing `bkit-tests`), not one lane
// name and not "any check".
import * as fs from "node:fs";
import * as path from "node:path";
import { statusTimestamp } from "../../ledgers/status.js";
import { bodySkipToken, commitMessage, CommandError, EXIT, git, parseJson, runGh, runGit, SKIP_CI_TOKEN, } from "../lib.js";
import { readBkitConfig } from "../../shared/settings.js";
import { TIMEOUTS } from "../../shared/timeouts.js";
import { FID_PATTERNS, fromBranch, fromMarker, issueIdOf, readIssueTracker } from "./fids.js";
import { AUTO_LABEL, AUTO_ROUTE_SUFFIX } from "./issues.js";
import { checkOnlyBookkeeping } from "./ledgers.js";
import { closeTransportRow, crossCheckFile, prRepoSlug, probePr } from "./prs.js";
import { resolveOwnerRepo, splitSlug } from "./repo.js";
import { extraField, str } from "./status.js";
import { writeStepRow } from "./steps.js";
const GH_MISSING = "gh is not on PATH — use the mapped GitHub MCP tool instead";
/** Not JSON reads as undefined: every caller treats that as an API error, distinct from an empty answer. */
function jsonOrUndefined(raw) {
    const parsed = parseJson(raw);
    return parsed.ok ? parsed.value : undefined;
}
const obj = (v) => v !== null && typeof v === "object" && !Array.isArray(v) ? v : {};
const arr = (v) => (Array.isArray(v) ? v : []);
const text = (v) => (typeof v === "string" ? v : "");
/** Keeps `/` readable (GitHub accepts it raw in a query value) and escapes the rest. */
const queryValue = (v) => encodeURIComponent(v).replace(/%2F/gi, "/");
// ---------------------------------------------------------------------------
// Config and repo facts
// ---------------------------------------------------------------------------
/** The checkout to read `package.json` and `.github/workflows/` from: the worktree top, or cwd outside git. */
const checkoutRoot = (cwd) => git(cwd, ["rev-parse", "--show-toplevel"]) ?? cwd;
/** The lane namespace the dispatch probe matches: the capstone minus its last `-segment`. */
export function checkNamespace(capstoneJob) {
    const i = capstoneJob.lastIndexOf("-");
    return i > 0 ? capstoneJob.slice(0, i) : capstoneJob;
}
/** Whether `.github/workflows/<bkit.ciWorkflow>` exists — the only honest ground for a `no-ci` pass. */
export function ciDeclared(root) {
    const { ciWorkflow } = readBkitConfig(root);
    const rel = path.join(".github", "workflows", ciWorkflow);
    return { declared: fs.existsSync(path.join(root, rel)), ciWorkflow, path: rel };
}
/** Skip-token scan of a landed commit's body (see `bodySkipToken`). */
export function scanBody(cwd, sha) {
    const token = bodySkipToken(cwd, sha);
    return token === undefined ? "error" : token ? "skip-token-found" : "clean";
}
/** One poll of `target`. PR targets read the PR's check rollup; run targets read the CI workflow's runs at a head. */
export function pollOnce(target, gh) {
    if (target.kind === "pr-present" || target.kind === "pr-completed") {
        const res = gh(["pr", "view", String(target.pr), "--json", "statusCheckRollup"]);
        if (res.missing)
            return { state: "missing" };
        const data = res.ok ? jsonOrUndefined(res.stdout) : undefined;
        if (data === undefined)
            return { state: "err" };
        const checks = arr(obj(data).statusCheckRollup).map(obj);
        if (target.kind === "pr-present") {
            const ns = target.namespace.toLowerCase();
            const hits = checks.filter((c) => text(c.name || c.context)
                .toLowerCase()
                .includes(ns));
            return { state: hits.length > 0 ? "found" : "none", checks: checks.length };
        }
        // A check is open while its run has not completed, or its commit status is pending.
        const open = checks.filter((c) => (text(c.status) || "COMPLETED") !== "COMPLETED" || text(c.state) === "PENDING");
        return { state: open.length === 0 ? "found" : "none", checks: checks.length };
    }
    const res = gh([
        "run",
        "list",
        "--branch",
        String(target.branch),
        "--workflow",
        target.ciWorkflow,
        "--limit",
        "20",
        "--json",
        "status,conclusion,headSha",
    ]);
    if (res.missing)
        return { state: "missing" };
    const data = res.ok ? jsonOrUndefined(res.stdout) : undefined;
    if (!Array.isArray(data))
        return { state: "err" };
    // Head-anchored: without it a completed run from a superseded head would pass.
    const atHead = data.map(obj).filter((r) => r.headSha === target.head);
    if (target.kind === "run-present")
        return { state: atHead.length > 0 ? "found" : "none" };
    const latest = atHead[0];
    return latest && latest.status === "completed"
        ? { state: "found", conclusion: text(latest.conclusion) || null }
        : { state: "none" };
}
/** Sleeps `ms` and returns how long it really took. */
export const realSleep = (ms) => new Promise((resolve) => {
    const t0 = Date.now();
    setTimeout(() => resolve(Date.now() - t0), ms);
});
/** Slack before a sleep counts as blocked (the shell wrapped each sleep in `timeout interval+5`). */
const SLEEP_SLACK_MS = 5000;
/**
 * Poll until found or the budget is spent: `ceil(budget / interval)` attempts,
 * no sleep after the last one. `once` polls a single time, for an agent turn loop.
 */
export async function waitLoop(opts, poll, sleep, log) {
    const out = {
        result: "none",
        attempts: 0,
        elapsedS: 0,
        allErrored: true,
        blocked: false,
        ghMissing: false,
        conclusion: null,
        checks: null,
    };
    const max = opts.once ? 1 : Math.max(1, Math.ceil(opts.budgetS / opts.intervalS));
    while (out.attempts < max) {
        out.attempts++;
        const p = poll();
        if (p.state === "missing") {
            out.ghMissing = true;
            out.result = "err";
            return out;
        }
        if (p.state !== "err")
            out.allErrored = false;
        if (p.checks !== undefined)
            out.checks = p.checks;
        log(`attempt ${out.attempts}: ${p.state} (elapsed ${out.elapsedS}s)`);
        if (p.state === "found") {
            out.result = "found";
            out.conclusion = p.conclusion ?? null;
            return out;
        }
        if (out.attempts >= max)
            break;
        const slept = await sleep(opts.intervalS * 1000);
        if (slept > opts.intervalS * 1000 + SLEEP_SLACK_MS) {
            log(`sleep did not return within ${opts.intervalS + 5}s — this runtime cannot wait here; resolve the poll in the agent turn loop`);
            out.blocked = true;
            out.result = "err";
            return out;
        }
        out.elapsedS += opts.intervalS;
    }
    out.result = out.allErrored ? "err" : "none";
    return out;
}
/** The open PR from the current branch into dev, or null. */
function currentPr(cwd, gh) {
    const branch = git(cwd, ["branch", "--show-current"]);
    if (!branch)
        return { pr: null, missing: false };
    const res = gh(["pr", "list", "--head", branch, "--base", "dev", "--json", "number"]);
    if (res.missing)
        return { pr: null, missing: true };
    const n = obj(arr(res.ok ? jsonOrUndefined(res.stdout) : undefined)[0]).number;
    return { pr: typeof n === "number" ? String(n) : null, missing: false };
}
/** Exit code: the re-trigger commit or its push failed. */
export const EXIT_RETRIGGER_FAILED = 6;
function pushCurrentBranch(cwd) {
    const branch = git(cwd, ["branch", "--show-current"]);
    if (!branch)
        return false;
    // Shared branches never force; a feature branch is rewritten only by this run.
    const args = branch === "dev" || branch === "main"
        ? ["push", "origin", branch]
        : ["push", "--force-with-lease", "origin", branch];
    return runGit(cwd, args).ok;
}
/**
 * The CI-Dispatch Gate after build / debug's last push. Never pushes after the
 * verdict: a later commit would move the PR head away from the run it proved.
 */
export async function ciDispatchGate(o, deps) {
    const root = checkoutRoot(o.cwd);
    const { capstoneJob } = readBkitConfig(root);
    const declared = ciDeclared(root);
    const head = () => git(o.cwd, ["rev-parse", "HEAD"]) ?? "";
    const res = {
        phase: "done",
        handoff: 0,
        ciDispatch: null,
        head: head(),
        attempts: 0,
        retrigger: o.retriggered,
        ciWorkflow: declared.ciWorkflow,
    };
    const target = {
        kind: "pr-present",
        pr: o.pr ?? undefined,
        ciWorkflow: declared.ciWorkflow,
        namespace: checkNamespace(capstoneJob),
    };
    const poll = async (phase) => {
        // A supplied result answers only the poll that was handed off; later polls run fresh.
        if (o.supplied && (phase === "repoll") === o.retriggered) {
            deps.log(`poll result supplied by the agent turn loop: ${o.supplied.pollResult} (attempts ${o.supplied.attempts})`);
            return o.supplied;
        }
        // No PR to read is the shell's empty-PR poll: zero attempts, all errored.
        if (o.pr === null)
            return { pollResult: "err", attempts: 0, allErrored: true };
        deps.log(`polling for a ${target.namespace} check on PR #${o.pr} (budget ${o.budgetS}s, interval ${o.intervalS}s)`);
        const w = await waitLoop({ budgetS: o.budgetS, intervalS: o.intervalS, once: false }, () => pollOnce(target, deps.gh), deps.sleep, deps.log);
        if (w.blocked || w.ghMissing) {
            res.phase = phase;
            res.handoff = w.ghMissing ? EXIT.USE_MCP : EXIT.AGENT_WAIT;
            res.attempts += w.attempts;
            return null;
        }
        return { pollResult: w.result, attempts: w.attempts, allErrored: w.allErrored };
    };
    const verdict = (outcome, reason) => {
        res.ciDispatch = {
            outcome,
            head: res.head,
            attempts: res.attempts,
            retrigger: res.retrigger,
            ...(reason ? { reason } : {}),
        };
        deps.log(`verdict: ${outcome}${reason ? `(${reason})` : ""} head=${res.head} attempts=${res.attempts} retrigger=${res.retrigger}`);
        return res;
    };
    if (!o.retriggered) {
        const first = await poll("poll");
        if (first === null)
            return res;
        res.attempts = first.attempts;
        if (first.pollResult === "found")
            return verdict("dispatched");
        if (first.allErrored) {
            deps.log("unresolved(gh-error): every poll errored — gh unavailable or unauthenticated");
            return verdict("unresolved", "gh-error");
        }
        if (SKIP_CI_TOKEN.test(commitMessage(o.cwd, res.head) ?? "")) {
            deps.log("unresolved(timeout-dirty): no run and the pushed head carries a CI suppressor — not re-triggering a dirty head");
            return verdict("unresolved", "timeout-dirty");
        }
        const committed = runGit(o.cwd, [
            "commit",
            "--allow-empty",
            "-m",
            `chore(${o.fid}): re-trigger${o.autoRouteSuffix}`,
        ]).ok;
        if (!committed || !pushCurrentBranch(o.cwd)) {
            deps.log("re-trigger commit or push failed — no verdict; route to the Failure Path");
            res.phase = "repoll";
            res.handoff = EXIT_RETRIGGER_FAILED;
            return res;
        }
        res.retrigger = true;
        res.head = head();
        deps.log("re-trigger pushed; re-polling");
    }
    const prior = res.attempts;
    const second = await poll("repoll");
    if (second === null)
        return res;
    // A supplied re-poll carries the running total; a fresh one adds to the first poll.
    res.attempts = o.retriggered && o.supplied ? second.attempts : prior + second.attempts;
    res.head = head();
    if (SKIP_CI_TOKEN.test(commitMessage(o.cwd, res.head) ?? "")) {
        deps.log("unresolved(retrigger-suppressed): the re-trigger head carries a suppressor — cannot tell no-ci from suppression");
        return verdict("unresolved", "retrigger-suppressed");
    }
    if (second.pollResult === "found")
        return verdict("self-healed");
    if (second.allErrored) {
        deps.log("unresolved(gh-error): every re-poll errored — silence after the re-trigger proves nothing");
        return verdict("unresolved", "gh-error");
    }
    if (declared.declared) {
        deps.log(`unresolved(ci-declared-no-run): ${declared.path} exists but a clean re-trigger dispatched no check — look for a startup failure: gh run list --commit ${res.head}`);
        return verdict("unresolved", "ci-declared-no-run");
    }
    deps.log(`no-ci: a clean re-trigger dispatched nothing and ${declared.path} is absent — the repo has no CI workflow (logged pass)`);
    return verdict("no-ci");
}
// ---------------------------------------------------------------------------
// Ship merge gate
// ---------------------------------------------------------------------------
/** One exit code per refusal reason — callers route on them, so they never collapse. */
export const GATE = {
    /** No run of the CI workflow at the head. */
    NO_RUN: 10,
    /** Runs at the head, none completed — poll. */
    IN_PROGRESS: 11,
    /** The selected run, or its capstone, did not conclude success. */
    FAILED: 12,
    /** The selected run has no capstone job — never a vacuous pass. */
    NO_CAPSTONE: 13,
    /** No run at the head, but the branch's latest green is at a superseded head (needs --branch). */
    SUPERSEDED: 14,
    /** The selected run was cancelled. */
    CANCELLED: 15,
    /** A lane named in bkit.shipGateRequiredLanes concluded skipped. */
    LANE_SKIPPED: 16,
    /** --validated is not an ancestor of the head plus bookkeeping-only commits. */
    NOT_BOOKKEEPING: 17,
    /** --pr: the PR title carries a CI-suppressing token (its squash would skip CI on dev). */
    TITLE_SKIP: 18,
    /** API error, rate limit, or auth — distinct from "no run". */
    API_ERROR: 20,
};
/** Whether `to` is `from` plus bookkeeping-only commits. `outside` lists the other changed paths. */
export function onlyBookkeeping(root, o) {
    const check = checkOnlyBookkeeping(root, o);
    switch (check.kind) {
        case "ok":
            return { ok: true, outside: [], reason: "" };
        case "unknown-commit":
            return { ok: false, outside: [], reason: `unknown commit: ${check.ref}` };
        case "not-ancestor":
            return { ok: false, outside: [], reason: `${o.from} is not an ancestor of ${o.to}` };
        case "diff-failed":
            return { ok: false, outside: [], reason: `git diff failed for ${o.from}..${o.to}` };
        case "outside":
            return {
                ok: false,
                outside: check.outside,
                reason: `non-bookkeeping paths changed in ${o.from}..${o.to}`,
            };
    }
}
const toRun = (v) => {
    const r = obj(v);
    return {
        id: typeof r.id === "number" ? r.id : null,
        head_sha: text(r.head_sha),
        status: text(r.status),
        conclusion: text(r.conclusion),
        event: text(r.event),
        html_url: text(r.html_url),
        updated_at: text(r.updated_at),
    };
};
/** Latest by `updated_at`; ties keep list order, as jq's stable `sort_by | last` does. */
const latest = (runs) => runs.reduce((best, r) => (!best || r.updated_at >= best.updated_at ? r : best), undefined);
/**
 * Assert the capstone is present and green at the head. Returns the code; the
 * caller exits with it. Diagnostics go through `log`.
 */
export function shipGate(o, gh, log) {
    const cfg = readBkitConfig(o.root);
    const r = {
        code: 0,
        passed: false,
        overridden: false,
        head: o.head,
        mergeHead: o.head,
        testedHead: null,
        runId: null,
        runUrl: null,
        conclusion: null,
        capstone: o.capstone || cfg.capstoneJob,
        ciWorkflow: o.ciWorkflow || cfg.ciWorkflow,
        repo: o.repo || null,
        skippedLanes: [],
        nonBookkeepingPaths: [],
        reason: "",
    };
    const requiredLanes = cfg.shipGateRequiredLanes;
    const refuse = (code, reason, runUrl) => {
        log(reason);
        log(`required head:  ${r.head}`);
        if (r.mergeHead !== r.head) {
            log(`merge head:     ${r.mergeHead}  (bookkeeping-only commits on top of the required head)`);
        }
        if (r.testedHead && r.testedHead !== r.head)
            log(`head tested:    ${r.testedHead}  (SUPERSEDED)`);
        if (runUrl)
            log(`run:            ${runUrl}`);
        r.code = code;
        r.reason = reason;
        if (o.override && o.override === r.head)
            return overrideRefusal();
        return r;
    };
    const overrideRefusal = () => {
        const row = JSON.stringify({
            type: "ship-gate-override",
            at: statusTimestamp(),
            head: r.head,
            assertedBy: "bkit runs gate",
        });
        let landed = false;
        if (o.statusFile) {
            try {
                fs.appendFileSync(o.statusFile, `${row}\n`);
                landed = true;
            }
            catch {
                // Unwritable status file: the row goes to stderr below, so the override is never invisible.
                landed = false;
            }
        }
        if (!landed) {
            log(`override audit row (status file unset/unwritable: '${o.statusFile ?? "<unset>"}'), emitting to stderr:`);
            log(row);
        }
        log(`override honoured for head ${r.head} (BKIT_SHIP_GATE_OVERRIDE matches refused head)`);
        r.overridden = true;
        r.passed = true;
        r.code = EXIT.OK;
        return r;
    };
    const apiError = (what, runUrl) => {
        const rate = gh(["api", "rate_limit"]);
        const rl = rate.ok ? obj(obj(jsonOrUndefined(rate.stdout)).rate) : undefined;
        let detail;
        if (!rl) {
            detail =
                "API error — rate_limit query also failed; auth / network / unknown API blip (distinct from 'no run')";
        }
        else if (rl.remaining === 0) {
            detail = `rate limit exhausted (remaining=0, reset at ${String(rl.reset ?? "")}) — dispatch, do not push`;
        }
        else {
            detail = `API error (rate remaining=${String(rl.remaining ?? "")}) — auth / network / unknown; distinct from 'no run'`;
        }
        log(what);
        return refuse(GATE.API_ERROR, detail, runUrl);
    };
    const ghMissing = () => {
        r.code = EXIT.USE_MCP;
        r.reason = GH_MISSING;
        log(GH_MISSING);
        return r;
    };
    /** The run's jobs, or the refusal. `--slurp` turns --paginate's one-document-per-page
     * stream into one array; without it a run with more than 100 jobs hides every page but the first. */
    const readJobs = (run) => {
        const jobsRes = gh([
            "api",
            `/repos/${r.repo}/actions/runs/${run.id}/jobs`,
            "--paginate",
            "--slurp",
        ]);
        if (jobsRes.missing)
            return ghMissing();
        if (!jobsRes.ok) {
            return apiError(`jobs query failed for run ${run.id} — API error (distinct from 'no capstone')`, run.html_url);
        }
        const jobsJson = jsonOrUndefined(jobsRes.stdout);
        if (jobsJson === undefined) {
            return refuse(GATE.API_ERROR, `jobs response for run ${run.id} is not valid JSON`, run.html_url);
        }
        const pages = Array.isArray(jobsJson) ? jobsJson : [jobsJson];
        return pages.flatMap((p) => arr(obj(p).jobs).map(obj));
    };
    /** Capstone-only verdict: the capstone job's own result, whatever the run and its other jobs did. */
    const capstoneVerdict = (run) => {
        const url = run.html_url;
        const jobs = readJobs(run);
        if (!Array.isArray(jobs))
            return jobs;
        const capstone = jobs.find((j) => j.name === r.capstone);
        if (!capstone && run.status !== "completed") {
            return refuse(GATE.IN_PROGRESS, `run ${run.id} at head ${r.head} is ${run.status || "unknown"} and has no capstone job yet — caller may poll`, url);
        }
        if (!capstone) {
            return refuse(GATE.NO_CAPSTONE, `capstone job '${r.capstone}' ABSENT from run ${run.id} at head ${r.head} — never vacuous pass`, url);
        }
        if (text(capstone.status) !== "completed") {
            return refuse(GATE.IN_PROGRESS, `capstone '${r.capstone}' is ${text(capstone.status) || "unknown"} at head ${r.head} — caller may poll`, url);
        }
        if (capstone.conclusion === "cancelled") {
            return refuse(GATE.CANCELLED, `capstone '${r.capstone}' was CANCELLED at head ${r.head}`, url);
        }
        if (capstone.conclusion !== "success") {
            return refuse(GATE.FAILED, `capstone '${r.capstone}' concluded '${text(capstone.conclusion)}' (not success) at head ${r.head}`, url);
        }
        r.passed = true;
        r.reason = `capstone ${r.capstone}=success at head ${r.head} (run ${run.id}, ${url}); other jobs not checked`;
        log(r.reason);
        return r;
    };
    if (!r.repo) {
        const view = gh(["repo", "view", "--json", "nameWithOwner", "--jq", ".nameWithOwner"]);
        if (view.missing)
            return ghMissing();
        r.repo = view.ok ? view.stdout.trim() || null : null;
        if (!r.repo) {
            return refuse(GATE.API_ERROR, "could not resolve repo (pass --repo <o/r> or run inside a gh-authenticated checkout)");
        }
    }
    // 0. Validated-head carry-forward: ship's own [skip ci] bookkeeping commits ride
    // on a head CI already passed, so CI is checked at the validated sha instead.
    if (o.validated && o.validated !== o.head) {
        if (!o.month || !o.fid) {
            throw new CommandError(EXIT.USAGE, "--validated needs --month and --fid (the bookkeeping allow-list is FID-scoped)");
        }
        const book = onlyBookkeeping(o.root, {
            month: o.month,
            fid: o.fid,
            from: o.validated,
            to: o.head,
        });
        if (!book.ok) {
            r.nonBookkeepingPaths = book.outside;
            for (const p of book.outside)
                log(`  ${p}`);
            return refuse(GATE.NOT_BOOKKEEPING, `head ${o.head} is not ${o.validated} plus bookkeeping only (${book.reason}) — re-validate at head`);
        }
        log(`head ${o.head} = validated ${o.validated} + bookkeeping only — checking CI at the validated sha`);
        r.head = o.validated;
    }
    // 1. Workflow-scoped, head-keyed run list. --event narrows it in the query AND
    // here, so an API that ignores the parameter still cannot hand back another event's run.
    const base = `/repos/${r.repo}/actions/workflows/${r.ciWorkflow}/runs`;
    const eventQuery = o.event ? `&event=${queryValue(o.event)}` : "";
    const eventLabel = o.event ? ` (event=${o.event})` : "";
    const keepEvent = (runs) => (o.event ? runs.filter((x) => x.event === o.event) : runs);
    const listed = gh(["api", `${base}?head_sha=${queryValue(r.head)}${eventQuery}`]);
    if (listed.missing)
        return ghMissing();
    if (!listed.ok) {
        return apiError(`workflow runs query failed for ${r.repo}/${r.ciWorkflow} at head ${r.head}`);
    }
    const listedJson = jsonOrUndefined(listed.stdout);
    if (listedJson === undefined) {
        log(`workflow runs response for ${r.repo}/${r.ciWorkflow} at head ${r.head} is not valid JSON`);
        return refuse(GATE.API_ERROR, "workflow runs response is not valid JSON");
    }
    const runs = keepEvent(arr(obj(listedJson).workflow_runs).map(toRun));
    const total = o.event ? runs.length : Number(obj(listedJson).total_count ?? 0) || 0;
    if (total === 0) {
        // The head query is filtered server-side, so a superseded head looks exactly
        // like one never validated; only a branch-scoped query tells them apart.
        if (o.branch) {
            const recent = gh([
                "api",
                `${base}?branch=${queryValue(o.branch)}&status=success&per_page=1${eventQuery}`,
            ]);
            const stale = recent.ok
                ? latest(keepEvent(arr(obj(jsonOrUndefined(recent.stdout)).workflow_runs).map(toRun)))
                : undefined;
            if (stale) {
                r.testedHead = stale.head_sha || null;
                return refuse(GATE.SUPERSEDED, `no run at head ${r.head}; latest green on ${o.branch} is at a SUPERSEDED head (${stale.head_sha}) — re-validate`, stale.html_url);
            }
        }
        return refuse(GATE.NO_RUN, `no run of ${r.ciWorkflow}${eventLabel} exists at head ${r.head} (total_count=0)`);
    }
    // 2. The most recent COMPLETED run at the head: a re-dispatch still in flight
    // is newer, and must not mask a run that has in fact completed here. Capstone-only
    // falls back to the run in flight, whose capstone may already have concluded.
    const atHead = runs.filter((x) => x.head_sha === r.head);
    const completed = latest(atHead.filter((x) => x.status === "completed"));
    const selected = completed ?? (o.capstoneOnly ? latest(atHead) : undefined);
    if (!selected) {
        const inFlight = latest(runs);
        return refuse(GATE.IN_PROGRESS, `runs exist at head ${r.head} but none completed (status=${inFlight?.status || "unknown"}) — caller may poll`, inFlight?.html_url);
    }
    r.runId = selected.id;
    r.runUrl = selected.html_url || null;
    r.conclusion = selected.conclusion || null;
    r.testedHead = selected.head_sha || null;
    const url = selected.html_url;
    if (o.capstoneOnly)
        return capstoneVerdict(selected);
    if (selected.conclusion === "failure") {
        return refuse(GATE.FAILED, `selected run concluded FAILURE at head ${r.head}`, url);
    }
    if (selected.conclusion === "cancelled") {
        return refuse(GATE.CANCELLED, `selected run was CANCELLED at head ${r.head} — dispatch, do not push`, url);
    }
    if (selected.conclusion !== "success") {
        return refuse(GATE.FAILED, `selected run concluded '${selected.conclusion}' at head ${r.head} — not validated`, url);
    }
    // 3. Capstone.
    const listedJobs = readJobs(selected);
    if (!Array.isArray(listedJobs))
        return listedJobs;
    const jobs = listedJobs;
    const capstone = jobs.find((j) => j.name === r.capstone);
    if (!capstone) {
        return refuse(GATE.NO_CAPSTONE, `capstone job '${r.capstone}' ABSENT from run ${selected.id} at head ${r.head} — never vacuous pass`, url);
    }
    if (capstone.conclusion !== "success") {
        return refuse(GATE.FAILED, `capstone '${r.capstone}' concluded '${text(capstone.conclusion)}' (not success) at head ${r.head}`, url);
    }
    // 4. Skipped lanes. The jobs API gives no reason for a skip; the capstone takes
    // every lane result as input and owns planned-vs-vacuous, so a skip is reported,
    // and refuses only for a lane the consumer declared required.
    r.skippedLanes = jobs
        .filter((j) => j.name !== r.capstone && j.conclusion === "skipped")
        .map((j) => text(j.name) || "<unnamed>");
    if (r.skippedLanes.length) {
        log(`note: ${r.skippedLanes.length} lane(s) concluded 'skipped' at head ${r.head}: ${r.skippedLanes.join(", ")}`);
        log(`note: capstone '${r.capstone}' is green and owns the planned-vs-vacuous judgement for those lanes`);
        const required = r.skippedLanes.filter((l) => requiredLanes.includes(l));
        if (required.length) {
            log(`declared in bkit.shipGateRequiredLanes: ${requiredLanes.join(",")}`);
            return refuse(GATE.LANE_SKIPPED, `required lane(s) concluded 'skipped' at head ${r.head} — vacuous green: ${required.join(", ")}`, url);
        }
    }
    r.passed = true;
    r.reason = `capstone ${r.capstone}=success at head ${r.head} (run ${selected.id}, ${url})`;
    log(r.reason);
    return r;
}
// ---------------------------------------------------------------------------
// Release-PR mirror
// ---------------------------------------------------------------------------
/** Exit codes of `mirror`. */
export const MIRROR = {
    /** No push run at the head after --absent-minutes. */
    ABSENT: 3,
    /** Still in progress at --max-minutes. */
    TIMED_OUT: 4,
    /** Three API errors in a row. */
    API_ERRORS: 20,
};
/**
 * Wait for the branch's push run at the head and copy its capstone verdict. The
 * gate owns run selection and its codes; this owns waiting. The override never
 * reaches the gate: it is a per-head escape for ship, never a way to green a required check.
 */
export async function mirrorPushRun(o, deps) {
    const start = deps.now();
    const out = {
        code: EXIT.NO,
        passed: false,
        gateCode: -1,
        polls: 0,
        elapsedMinutes: 0,
    };
    let apiErrors = 0;
    let lastState = "";
    for (;;) {
        const g = deps.gate();
        out.polls++;
        out.gateCode = g.code;
        out.elapsedMinutes = Math.floor((deps.now() - start) / 60000);
        const elapsed = out.elapsedMinutes;
        if (g.code === EXIT.OK) {
            deps.log(`${o.branch} push run at ${o.head} passed its capstone — release PR mirrors green.`);
            out.code = EXIT.OK;
            out.passed = true;
            return out;
        }
        if (g.code === GATE.IN_PROGRESS) {
            apiErrors = 0;
            if (lastState !== "running") {
                deps.log(`${o.branch} push run at ${o.head} is in progress — waiting (up to ${o.maxMinutes}m).`);
            }
            lastState = "running";
        }
        else if (g.code === GATE.NO_RUN || g.code === GATE.SUPERSEDED) {
            apiErrors = 0;
            if (elapsed >= o.absentMinutes) {
                deps.log(g.reason);
                deps.log(`no ${o.branch} push run exists at ${o.head} after ${elapsed}m. A [skip ci] commit at the ${o.branch} tip dispatches none: push a commit without it to ${o.branch}, then re-run this check.`);
                out.code = MIRROR.ABSENT;
                return out;
            }
            if (lastState !== "absent") {
                deps.log(`no ${o.branch} push run at ${o.head} yet — waiting up to ${o.absentMinutes}m for one to appear.`);
            }
            lastState = "absent";
        }
        else if (g.code === GATE.API_ERROR) {
            apiErrors++;
            if (apiErrors >= 3) {
                deps.log(g.reason);
                deps.log(`GitHub API failed ${apiErrors} times in a row — cannot read the ${o.branch} push run.`);
                out.code = MIRROR.API_ERRORS;
                return out;
            }
            deps.log(`GitHub API error (${apiErrors}/3) — retrying.`);
        }
        else {
            deps.log(g.reason);
            deps.log(`${o.branch} push run at ${o.head} is not green (gate exit ${g.code}) — fix ${o.branch}, or re-run the failed push run, then re-run this check.`);
            out.code = EXIT.NO;
            return out;
        }
        if (elapsed >= o.maxMinutes) {
            deps.log(`${o.branch} push run at ${o.head} still not finished after ${elapsed}m (limit ${o.maxMinutes}m).`);
            out.code = MIRROR.TIMED_OUT;
            return out;
        }
        await deps.sleep(o.intervalS * 1000);
    }
}
// ---------------------------------------------------------------------------
// Command
// ---------------------------------------------------------------------------
/** Exit code: `wait --dispatch-if-absent` found no run and `gh workflow run` failed. */
export const EXIT_TRIGGER_FAILED = 5;
/** Exit code: the dispatch verdict passed, but the pushed head's body carries a skip token. */
export const EXIT_SKIP_TOKEN = 4;
/** Exit code: the pushed head's commit message could not be read for the body scan. */
export const EXIT_SCAN_ERROR = 5;
const wholeNumber = (v, flag, fallback, min = 0) => {
    if (v === undefined)
        return fallback;
    const s = String(v);
    if (!/^[0-9]+$/.test(s) || Number(s) < min) {
        throw new CommandError(EXIT.USAGE, `--${flag} takes a whole number >= ${min} (got "${s}")`);
    }
    return Number(s);
};
const HEAD_FLAG = { name: "head", type: "string", help: "commit SHA" };
const REPO_FLAG = {
    name: "repo",
    type: "string",
    help: "owner/repo (default: gh repo view)",
};
const CI_WORKFLOW_FLAG = {
    name: "ci-workflow",
    type: "string",
    help: "CI workflow file (default: package.json bkit.ciWorkflow)",
};
const CAPSTONE_FLAG = {
    name: "capstone",
    type: "string",
    help: "capstone job name (default: package.json bkit.capstoneJob)",
};
const BUDGET_FLAG = { name: "budget-s", type: "string", help: "poll budget in seconds" };
const INTERVAL_FLAG = {
    name: "interval-s",
    type: "string",
    help: "seconds between polls (>= 1)",
};
/**
 * `gh` pinned to `repo`: `--repo` is appended to every subcommand that takes it.
 * `gh api` is left alone because its path already names the repo. No `repo` = `gh` unchanged.
 */
export function repoScopedGh(gh, repo) {
    if (repo === undefined)
        return gh;
    return (args) => (args[0] === "api" ? gh(args) : gh([...args, "--repo", repo]));
}
/** Whether `--repo` names a repo other than the checkout's own (local git then describes the wrong repo). */
function isForeignRepo(cwd, repo) {
    return (repo !== undefined && resolveOwnerRepo(cwd)?.ownerRepo.toLowerCase() !== repo.toLowerCase());
}
const deps = (ctx, repo) => ({
    gh: repoScopedGh((args) => runGh(ctx.cwd, args), repo),
    sleep: realSleep,
    log: ctx.log,
});
/** Defaults per wait target: the dispatch probe's 60/10, ship's probe and CI-completion budgets. */
const WAIT_DEFAULTS = {
    "pr-present": { budgetS: 60, intervalS: 10 },
    "pr-completed": {
        budgetS: TIMEOUTS.SHIP_CI_WAIT_TIMEOUT_S,
        intervalS: TIMEOUTS.SHIP_POLL_INTERVAL_S,
    },
    "run-present": {
        budgetS: TIMEOUTS.SHIP_PROBE_ATTEMPTS * TIMEOUTS.SHIP_PROBE_INTERVAL_S,
        intervalS: TIMEOUTS.SHIP_PROBE_INTERVAL_S,
    },
    "run-completed": {
        budgetS: TIMEOUTS.SHIP_CI_WAIT_TIMEOUT_S,
        intervalS: TIMEOUTS.SHIP_POLL_INTERVAL_S,
    },
};
/** One bounded wait (`runs wait`), its exit code and printed object. */
async function waitFor(cwd, i, d) {
    const { pr, head, branch } = i;
    if (pr === "" || head === "")
        throw new CommandError(EXIT.USAGE, "--pr / --head must not be empty");
    if ((pr === undefined) === (head === undefined)) {
        throw new CommandError(EXIT.USAGE, "give exactly one of --pr or --head");
    }
    if (head !== undefined && !branch)
        throw new CommandError(EXIT.USAGE, "--head needs --branch");
    const until = i.until ?? "present";
    if (until !== "present" && until !== "completed") {
        throw new CommandError(EXIT.USAGE, "--until must be present or completed");
    }
    const kind = `${pr !== undefined ? "pr" : "run"}-${until}`;
    if (i.dispatchIfAbsent && (kind !== "run-present" || i.once === true)) {
        // One turn-loop poll is not a probe: dispatching on it would duplicate a run still registering.
        throw new CommandError(EXIT.USAGE, "--dispatch-if-absent needs --head --branch --until=present, without --once");
    }
    const cfg = readBkitConfig(checkoutRoot(cwd));
    const ciWorkflow = cfg.ciWorkflow;
    const target = {
        kind,
        pr,
        head,
        branch,
        ciWorkflow,
        namespace: checkNamespace(cfg.capstoneJob),
    };
    const budgetS = wholeNumber(i.budgetS, "budget-s", WAIT_DEFAULTS[kind].budgetS);
    const intervalS = wholeNumber(i.intervalS, "interval-s", WAIT_DEFAULTS[kind].intervalS, 1);
    const w = await waitLoop({ budgetS, intervalS, once: i.once === true }, () => pollOnce(target, d.gh), d.sleep, d.log);
    let dispatched = false;
    if (i.dispatchIfAbsent && w.result !== "found" && !w.blocked && !w.ghMissing) {
        d.log(`no run at ${head} after ${w.attempts} probes (probe=${w.result}) — dispatching ${ciWorkflow} on ${branch}`);
        const run = d.gh(["workflow", "run", ciWorkflow, "--ref", String(branch)]);
        if (run.missing)
            w.ghMissing = true;
        else if (!run.ok) {
            d.log(`gh workflow run failed (403 = actions:write scope): ${run.stderr.trim()}`);
            return { code: EXIT_TRIGGER_FAILED, out: { ...waitOutput(w, kind), dispatched } };
        }
        else
            dispatched = true;
    }
    const out = { ...waitOutput(w, kind), dispatched };
    if (w.ghMissing) {
        d.log(GH_MISSING);
        return { code: EXIT.USE_MCP, out };
    }
    if (w.result === "found" || dispatched)
        return { code: EXIT.OK, out };
    if (w.blocked || i.once === true)
        return { code: EXIT.AGENT_WAIT, out };
    return { code: EXIT.NO, out };
}
async function runWait(ctx) {
    const f = ctx.flags;
    const r = await waitFor(ctx.cwd, {
        pr: str(f.pr),
        head: str(f.head),
        branch: str(f.branch),
        until: str(f.until),
        budgetS: f.budgetS,
        intervalS: f.intervalS,
        once: f.once === true,
        dispatchIfAbsent: f.dispatchIfAbsent === true,
    }, deps(ctx));
    ctx.emit(r.out);
    return r.code;
}
const waitOutput = (w, kind) => ({
    result: w.result,
    target: kind,
    attempts: w.attempts,
    elapsedS: w.elapsedS,
    allErrored: w.allErrored,
    blocked: w.blocked,
    conclusion: w.conclusion,
    checks: w.checks,
});
async function runDispatch(ctx) {
    const f = ctx.flags;
    const d = deps(ctx);
    // An empty --pr is the workflow's unresolved PR_NUMBER: derive it, as if omitted.
    let pr = str(f.pr) || null;
    if (pr === null) {
        const found = currentPr(ctx.cwd, d.gh);
        if (found.missing) {
            ctx.log(GH_MISSING);
            return EXIT.USE_MCP;
        }
        pr = found.pr;
    }
    const pollResult = str(f.pollResult);
    if (pollResult !== undefined && !["found", "none", "err"].includes(pollResult)) {
        throw new CommandError(EXIT.USAGE, "--poll-result must be found, none, or err");
    }
    if (pollResult === undefined && (f.attempts !== undefined || f.allErrored === true)) {
        throw new CommandError(EXIT.USAGE, "--attempts / --all-errored go with --poll-result");
    }
    const r = await ciDispatchGate({
        cwd: ctx.cwd,
        pr,
        fid: String(f.fid),
        autoRouteSuffix: (f.label ?? []).includes(AUTO_LABEL)
            ? AUTO_ROUTE_SUFFIX
            : "",
        budgetS: wholeNumber(f.budgetS, "budget-s", 60),
        intervalS: wholeNumber(f.intervalS, "interval-s", 10, 1),
        supplied: pollResult === undefined
            ? undefined
            : {
                pollResult: pollResult,
                attempts: wholeNumber(f.attempts, "attempts", 0),
                allErrored: f.allErrored === true,
            },
        retriggered: f.retriggered === true,
    }, d);
    const scanResult = r.ciDispatch && r.ciDispatch.outcome !== "unresolved" ? scanBody(ctx.cwd, r.head) : null;
    // With --file / --step: the verdict lands on the step's row, and a passed one is
    // cross-checked and recorded as the close transport.
    const file = str(f.file);
    const step = str(f.step);
    if ((file === undefined) !== (step === undefined))
        throw new CommandError(EXIT.USAGE, "--file and --step go together");
    let row = null;
    let transport = null;
    const code = dispatchCode(r, pr, scanResult, ctx.log);
    if (file !== undefined && r.ciDispatch !== null) {
        const status = path.resolve(ctx.cwd, file);
        row = writeStepRow(ctx.cwd, {
            file: status,
            workflow: String(f.workflow ?? "build"),
            step: step,
            artifacts: f.artifact ?? [],
            extras: {
                ...Object.fromEntries((f.field ?? []).map(extraField)),
                ciDispatch: r.ciDispatch,
            },
            commit: "none",
        }, ctx.log).row;
        if (code === EXIT.OK || code === EXIT_SKIP_TOKEN) {
            const check = crossCheckFile(status, "gh", ctx.log);
            if (!check.ok) {
                ctx.log("close transport cross-check failed");
                ctx.emit({
                    ciDispatch: r.ciDispatch,
                    phase: r.phase,
                    pr,
                    head: r.head,
                    attempts: r.attempts,
                    retrigger: r.retrigger,
                    scanResult,
                    ciWorkflow: r.ciWorkflow,
                    row,
                    transport,
                });
                return EXIT.NO;
            }
            transport = closeTransportRow(status, {
                shape: "push",
                sha: r.head,
                scanResult: scanResult ?? "clean",
            });
        }
    }
    ctx.emit({
        ciDispatch: r.ciDispatch,
        phase: r.phase,
        pr,
        head: r.head,
        attempts: r.attempts,
        retrigger: r.retrigger,
        scanResult,
        ciWorkflow: r.ciWorkflow,
        row,
        transport,
    });
    return code;
}
/** The dispatch verdict as an exit code, with its log line. */
function dispatchCode(r, pr, scanResult, log) {
    if (r.handoff === EXIT.AGENT_WAIT || r.handoff === EXIT.USE_MCP) {
        const again = r.phase === "repoll" ? " --retriggered" : "";
        log(`${r.handoff === EXIT.USE_MCP ? GH_MISSING : "this runtime cannot wait"}: resolve the ${r.phase} each turn with \`bkit runs wait --pr=${pr ?? "<n>"} --once\`, then re-run with --poll-result=<found|none|err> --attempts=<total>${again}`);
        return r.handoff;
    }
    if (r.handoff !== 0)
        return r.handoff;
    if (r.ciDispatch?.outcome === "unresolved") {
        log("unresolved verdict — recorded; route to the Failure Path");
        return EXIT.NO;
    }
    if (scanResult === "error") {
        log(`post-close body scan could not read ${r.head}`);
        return EXIT_SCAN_ERROR;
    }
    if (scanResult === "skip-token-found") {
        log(`landed commit ${r.head} inherited a CI-suppression token in its body`);
        return EXIT_SKIP_TOKEN;
    }
    return EXIT.OK;
}
/** Append one typed audit row (ship's gate refusal / merge CI / re-validate rows). */
function auditRow(file, type, fields) {
    if (!fs.existsSync(file))
        throw new CommandError(EXIT.USAGE, `${file} does not exist`);
    fs.appendFileSync(file, `${JSON.stringify({ type, workflow: "ship", at: statusTimestamp(), ...fields })}\n`);
}
/**
 * Log where a `--pr` resolved so a `--repo` naming a repo other than the checkout
 * is visible; the PR URL names the repo `gh` actually read from.
 */
function logResolvedPrRepo(repoFlag, prNumber, pr, log) {
    if (repoFlag === undefined)
        return;
    const resolved = prRepoSlug(pr?.url);
    if (resolved === undefined) {
        log(`PR ${prNumber}: could not read the resolved repo from its URL (--repo ${repoFlag})`);
    }
    else if (resolved !== repoFlag) {
        log(`PR ${prNumber} resolved in ${resolved} — --repo names ${repoFlag}`);
    }
    else {
        log(`PR ${prNumber} resolved in ${repoFlag}`);
    }
}
function runGate(ctx) {
    const f = ctx.flags;
    const given = [f.head, f.pr, f.squashOf].filter((v) => v !== undefined).length;
    if (given !== 1)
        throw new CommandError(EXIT.USAGE, "give exactly one of --head, --pr, --squash-of");
    const root = checkoutRoot(ctx.cwd);
    const gh = (args) => runGh(ctx.cwd, args);
    const record = str(f.record);
    const recordFile = record === undefined ? undefined : path.resolve(ctx.cwd, record);
    const prNumber = str(f.pr) ?? str(f.squashOf);
    // The head: given, the PR's current head, or the PR's squash commit.
    let head = str(f.head) ?? "";
    let pr;
    if (prNumber !== undefined) {
        if (!/^[1-9][0-9]*$/.test(prNumber))
            throw new CommandError(EXIT.USAGE, "--pr / --squash-of take a PR number");
        pr = probePr(ctx.cwd, { number: prNumber, state: "open", repo: str(f.repo) });
        if (pr.kind === "unavailable") {
            ctx.log(pr.message);
            return EXIT.USE_MCP;
        }
        const info = pr.kind === "ok" ? pr.pr : undefined;
        logResolvedPrRepo(str(f.repo), prNumber, info, ctx.log);
        head = (f.squashOf !== undefined ? info?.mergeCommit?.oid : info?.headRefOid) ?? "";
        if (head === "") {
            ctx.log(`cannot read the ${f.squashOf !== undefined ? "squash commit" : "head"} of PR ${prNumber}`);
            ctx.emit({
                code: GATE.API_ERROR,
                passed: false,
                head: null,
                mergeHead: null,
                reason: "PR unreadable",
            });
            return GATE.API_ERROR;
        }
    }
    if (head === "")
        throw new CommandError(EXIT.USAGE, "--head needs a non-empty value");
    // The pre-merge snapshot, written BEFORE the gate decides.
    const snapshot = str(f.snapshot);
    if (snapshot !== undefined) {
        const info = pr?.kind === "ok" ? pr.pr : undefined;
        const repoFlag = str(f.repo);
        const foreign = isForeignRepo(ctx.cwd, repoFlag);
        // A foreign repo's dev and ancestry come from the API: the checkout's origin/dev is another repo's.
        let dev;
        let ancestor;
        if (foreign && repoFlag !== undefined) {
            const devRes = gh(["api", `repos/${repoFlag}/commits/dev`, "--jq", ".sha"]);
            dev = devRes.ok ? devRes.stdout.trim() : "";
            const cmp = gh(["api", `repos/${repoFlag}/compare/dev...${head}`, "--jq", ".status"]);
            ancestor = cmp.ok && ["ahead", "identical"].includes(cmp.stdout.trim());
        }
        else {
            dev = git(ctx.cwd, ["rev-parse", "origin/dev"]) ?? "";
            ancestor = runGit(ctx.cwd, ["merge-base", "--is-ancestor", "origin/dev", head]).ok;
        }
        const ciWorkflow = readBkitConfig(root).ciWorkflow;
        const runs = repoScopedGh(gh, repoFlag)([
            "run",
            "list",
            "--branch",
            String(f.branch ?? info?.headRefName ?? ""),
            "--workflow",
            ciWorkflow,
            "--limit",
            "1",
            "--json",
            "databaseId,url",
        ]);
        const capstone = obj(arr(runs.ok ? jsonOrUndefined(runs.stdout) : undefined)[0]);
        const file = path.resolve(ctx.cwd, snapshot);
        fs.mkdirSync(path.dirname(file), { recursive: true });
        fs.appendFileSync(file, `${JSON.stringify({
            type: "ship-pre-merge-snapshot",
            workflow: "ship",
            gateHead: head,
            validatedHead: str(f.validated) ?? "",
            devSha: dev,
            ancestor: String(ancestor),
            capstone,
            mergeable: info?.mergeable ?? "",
        })}\n`);
    }
    // A title carrying a skip token would squash into a dev commit CI never runs on.
    const title = pr?.kind === "ok" ? (pr.pr?.title ?? "") : "";
    const titleToken = f.pr !== undefined ? SKIP_CI_TOKEN.exec(title)?.[0] : undefined;
    const r = titleToken !== undefined
        ? {
            code: GATE.TITLE_SKIP,
            passed: false,
            overridden: false,
            head,
            mergeHead: head,
            testedHead: null,
            runId: null,
            runUrl: null,
            conclusion: null,
            capstone: "",
            ciWorkflow: "",
            repo: str(f.repo) ?? null,
            skippedLanes: [],
            nonBookkeepingPaths: [],
            reason: `PR title '${title}' contains the CI-suppressing token ${titleToken}`,
        }
        : shipGate({
            root,
            head,
            validated: str(f.validated),
            month: str(f.month),
            fid: str(f.fid),
            repo: str(f.repo),
            branch: str(f.branch),
            event: str(f.event),
            capstoneOnly: f.capstoneOnly === true,
            override: process.env.BKIT_SHIP_GATE_OVERRIDE || undefined,
            statusFile: f.file === undefined ? undefined : path.resolve(ctx.cwd, String(f.file)),
        }, gh, ctx.log);
    if (titleToken !== undefined)
        ctx.log(r.reason);
    if (recordFile !== undefined && r.code !== EXIT.USE_MCP) {
        if (f.capstoneOnly === true) {
            const verdict = r.code === EXIT.OK ? "PASS" : "FAIL";
            auditRow(recordFile, "ship-merge-ci", {
                sha: head,
                run: String(r.runId ?? ""),
                verdict,
                reason: verdict === "PASS" ? "" : r.reason,
            });
        }
        else if (r.code !== EXIT.OK) {
            auditRow(recordFile, "ship-gate-refusal", { exitCode: r.code, head: r.mergeHead });
        }
    }
    ctx.emit({ ...r });
    return r.code;
}
// ---------------------------------------------------------------------------
// revalidate
// ---------------------------------------------------------------------------
/** Whether dev demands status checks (ruleset or branch protection): CI must then pass at the PR head. */
function devRequiresChecks(gh, repo) {
    const rules = gh(["api", `repos/${repo}/rules/branches/dev`]);
    const list = rules.ok ? arr(jsonOrUndefined(rules.stdout)) : [];
    if (list.some((r) => obj(r).type === "required_status_checks"))
        return true;
    return gh(["api", `repos/${repo}/branches/dev/protection/required_status_checks`]).ok;
}
async function runRevalidate(ctx) {
    const f = ctx.flags;
    const repoFlag = str(f.repo);
    const d = deps(ctx, repoFlag);
    const foreign = isForeignRepo(ctx.cwd, repoFlag);
    const branch = String(f.branch);
    const entry = String(f.entryHead);
    const codeHead = String(f.codeHead);
    const reason = str(f.reason) || "head-move";
    if (!["head-move", "gate-refusal"].includes(reason))
        throw new CommandError(EXIT.USAGE, "--reason must be head-move or gate-refusal");
    const status = path.resolve(ctx.cwd, String(f.file));
    if (!foreign)
        runGit(ctx.cwd, ["fetch", "origin", branch]);
    const pr = probePr(ctx.cwd, { number: String(f.pr), state: "open", repo: repoFlag });
    if (pr.kind === "unavailable") {
        ctx.log(pr.message);
        return EXIT.USE_MCP;
    }
    logResolvedPrRepo(str(f.repo), String(f.pr), pr.kind === "ok" ? pr.pr : undefined, ctx.log);
    const current = pr.kind === "ok" ? (pr.pr?.headRefOid ?? "") : "";
    if (current === "") {
        ctx.log("cannot read the PR head — query failed (403 = PAT scope)");
        return EXIT.NO;
    }
    // CI must pass at the code head while the PR head adds bookkeeping only and dev
    // demands no status checks; otherwise at the PR head.
    let validated = codeHead;
    if (foreign) {
        // The bookkeeping diff reads the checkout's git, which is not the named repo's history.
        ctx.log(`--repo ${repoFlag} is not this checkout's repo — bookkeeping diff skipped, validating at the PR head ${current}`);
        validated = current;
    }
    else {
        const book = onlyBookkeeping(checkoutRoot(ctx.cwd), {
            month: String(f.month),
            fid: String(f.fid),
            from: codeHead,
            to: current,
        });
        if (!book.ok)
            validated = current;
    }
    const repo = repoFlag ?? resolveOwnerRepo(ctx.cwd)?.ownerRepo;
    if (repo !== undefined && devRequiresChecks(d.gh, repo)) {
        ctx.log(`dev requires status checks — validating at the PR head ${current}`);
        validated = current;
    }
    const out = {
        validatedHead: validated,
        currentHead: current,
        revalidated: false,
        probe: null,
        dispatched: false,
        wait: null,
    };
    if (validated !== entry || reason === "gate-refusal") {
        out.revalidated = true;
        // Probe first: a run may already exist at this head; dispatch only on none.
        const probe = await waitFor(ctx.cwd, { head: validated, branch, until: "present", dispatchIfAbsent: true }, d);
        if (probe.code !== EXIT.OK) {
            ctx.emit({ ...out, probe: probe.out });
            return probe.code;
        }
        if (probe.out.dispatched === true) {
            validated = current;
            ctx.log(`no run at the validated head — dispatched at ${current}`);
        }
        else {
            ctx.log(`run already present at ${validated} — not dispatching a duplicate`);
        }
        auditRow(status, "ship-revalidate-dispatch", {
            head: validated,
            probe: probe.out.result,
            reason,
            dispatched: probe.out.dispatched,
            attempts: probe.out.attempts,
        });
        const wait = await waitFor(ctx.cwd, { head: validated, branch, until: "completed" }, d);
        if (wait.code === EXIT.NO) {
            auditRow(status, "ship-revalidate-timeout", {
                attempt: wait.out.attempts,
                timeout_s: wait.out.elapsedS,
            });
            ctx.log(`CI did not complete at ${validated}`);
        }
        Object.assign(out, {
            validatedHead: validated,
            probe: probe.out,
            dispatched: probe.out.dispatched,
            wait: wait.out,
        });
        if (wait.code !== EXIT.OK) {
            ctx.emit(out);
            return wait.code;
        }
    }
    ctx.emit(out);
    return EXIT.OK;
}
// ---------------------------------------------------------------------------
// context (/bkit-auto Step 1)
// ---------------------------------------------------------------------------
/** `{PHASE}` as dispatched: CI verdict words map onto ship / debug. */
const PHASES = {
    ship: { phase: "ship", mode: "CI" },
    success: { phase: "ship", mode: "CI" },
    pass: { phase: "ship", mode: "CI" },
    debug: { phase: "debug", mode: "CI" },
    failure: { phase: "debug", mode: "CI" },
    fail: { phase: "debug", mode: "CI" },
    design: { phase: "design", mode: "BRIEF" },
    plan: { phase: "plan", mode: "BRIEF" },
    build: { phase: "build", mode: "BRIEF" },
};
/** Exit code (context): the phase word is not one bkit dispatches. */
export const EXIT_UNKNOWN_PHASE = 3;
/** Exit code (context): the CI PR is not OPEN. */
export const EXIT_PR_NOT_OPEN = 7;
/** Exit code (context): no CI run at the PR head. */
export const EXIT_NO_RUN_ID = 8;
/** Exit code (context): no FID from the marker, the branch, or the slug. */
export const EXIT_NO_FID = 9;
async function runContext(ctx) {
    const phaseArg = String(ctx.flags.phase);
    const arg = String(ctx.flags.arg);
    const chosen = PHASES[phaseArg.toLowerCase()];
    if (!chosen) {
        ctx.log(`Unrecognised PHASE: ${phaseArg}`);
        return EXIT_UNKNOWN_PHASE;
    }
    const resolved = resolveOwnerRepo(ctx.cwd);
    const slug = resolved ? splitSlug(resolved.ownerRepo) : null;
    if (!resolved || !slug) {
        ctx.log("could not resolve owner/repo from gh or the origin remote");
        return EXIT.USAGE;
    }
    const out = {
        phase: chosen.phase,
        mode: chosen.mode,
        ownerRepo: resolved.ownerRepo,
        owner: slug.owner,
        repo: slug.repo,
        issueId: null,
        fid: null,
        prNumber: null,
        branch: null,
        headSha: null,
        prUrl: null,
        prState: null,
        runId: null,
    };
    if (chosen.mode === "BRIEF") {
        ctx.emit({ ...out, issueId: arg });
        return EXIT.OK;
    }
    const tracker = readIssueTracker(ctx.cwd);
    if (!/^[0-9]+$/.test(arg)) {
        // CI_DEV: a post-merge dev failure names the FID slug; checked before any path sees it.
        if (!FID_PATTERNS.any.test(arg)) {
            ctx.log(`Invalid CI_DEV FID: ${arg}`);
            return EXIT_NO_FID;
        }
        ctx.emit({
            ...out,
            mode: "CI_DEV",
            fid: arg,
            issueId: tracker === "none" ? null : issueIdOf(arg, "any"),
            branch: "dev",
            headSha: git(ctx.cwd, ["rev-parse", "origin/dev"]) ?? "",
        });
        return EXIT.OK;
    }
    const view = runGh(ctx.cwd, [
        "pr",
        "view",
        arg,
        "--json",
        "headRefName,headRefOid,state,url,body",
    ]);
    if (view.missing || view.status === 4) {
        ctx.log(GH_MISSING);
        return EXIT.USE_MCP;
    }
    const pr = obj(view.ok ? jsonOrUndefined(view.stdout) : undefined);
    const branch = text(pr.headRefName);
    const headSha = text(pr.headRefOid);
    Object.assign(out, {
        prNumber: arg,
        branch,
        headSha,
        prUrl: text(pr.url),
        prState: text(pr.state).toUpperCase(),
    });
    if (!branch || !headSha || !text(pr.url)) {
        ctx.log(`could not read PR ${arg}`);
        ctx.emit(out);
        return EXIT.NO;
    }
    if (out.prState !== "OPEN") {
        ctx.log(`PR ${arg} is ${String(out.prState)}, not OPEN`);
        ctx.emit(out);
        return EXIT_PR_NOT_OPEN;
    }
    const runs = runGh(ctx.cwd, [
        "run",
        "list",
        "--branch",
        branch,
        "--limit",
        "5",
        "--json",
        "databaseId,headSha",
    ]);
    const run = arr(runs.ok ? jsonOrUndefined(runs.stdout) : undefined)
        .map(obj)
        .find((r) => r.headSha === headSha);
    out.runId = run?.databaseId === undefined ? null : String(run.databaseId);
    if (out.runId === null) {
        ctx.log(`no CI run at ${headSha} on ${branch}`);
        ctx.emit(out);
        return EXIT_NO_RUN_ID;
    }
    // The PR-body marker first, the feat/{FID} branch as the fallback.
    const markerTracker = tracker;
    const viaMarker = fromMarker(str(ctx.flags.marker) ?? text(pr.body), markerTracker);
    const viaBranch = viaMarker ? null : fromBranch(branch, markerTracker);
    const parsed = viaMarker ?? (viaBranch?.ok ? viaBranch.parsed : null);
    if (!parsed) {
        ctx.log(viaBranch && !viaBranch.ok ? viaBranch.why : "no FID in the PR-body marker or the branch");
        ctx.emit(out);
        return EXIT_NO_FID;
    }
    ctx.emit({ ...out, fid: parsed.fid, issueId: parsed.issueId });
    return EXIT.OK;
}
async function runMirror(ctx) {
    const f = ctx.flags;
    const head = String(f.head);
    const branch = str(f.branch) ?? "dev";
    if (!branch)
        throw new CommandError(EXIT.USAGE, "--branch must not be empty");
    const o = {
        head,
        branch,
        absentMinutes: wholeNumber(f.absentMinutes, "absent-minutes", 10),
        maxMinutes: wholeNumber(f.maxMinutes, "max-minutes", 170),
        intervalS: wholeNumber(f.intervalS, "interval-s", 30),
    };
    const root = checkoutRoot(ctx.cwd);
    const repo = str(f.repo) ?? (process.env.GITHUB_REPOSITORY || undefined);
    const gh = (args) => runGh(ctx.cwd, args);
    const r = await mirrorPushRun(o, {
        // Each poll's diagnostics are dropped; the mirror logs the gate's reason when it stops on it.
        gate: () => shipGate({
            root,
            head,
            branch,
            event: "push",
            repo,
            ciWorkflow: str(f.ciWorkflow),
            capstone: str(f.capstone),
        }, gh, () => undefined),
        sleep: realSleep,
        now: Date.now,
        log: ctx.log,
    });
    ctx.emit({ ...r });
    return r.code;
}
export const runsCommand = {
    noun: "runs",
    summary: "CI runs: wait for one, prove one was dispatched, re-validate and gate a merge on one; auto's start context.",
    verbs: {
        wait: {
            summary: "Bounded poll for a CI check on a PR (--pr) or a CI run at a head (--head --branch), present or completed.",
            flags: [
                { name: "pr", type: "string", help: "PR number: read its check rollup" },
                { ...HEAD_FLAG, help: "commit SHA: read the CI workflow's runs at it (with --branch)" },
                { name: "branch", type: "string", help: "branch the runs are on (with --head)" },
                {
                    name: "until",
                    type: "string",
                    help: "present (a check / run exists, default) | completed (PR: no open checks; run: completed)",
                },
                BUDGET_FLAG,
                INTERVAL_FLAG,
                {
                    name: "once",
                    type: "boolean",
                    help: "poll once, for an agent turn loop; not found exits 81 (end the turn, call again)",
                },
                {
                    name: "dispatch-if-absent",
                    type: "boolean",
                    help: "with --head --until=present: no run after the budget -> gh workflow run <ciWorkflow> --ref <branch>",
                },
            ],
            output: {
                result: "found | none | err (err: every poll errored, gh absent, or the sleep was blocked)",
                target: "pr-present | pr-completed | run-present | run-completed",
                attempts: "polls run",
                elapsedS: "seconds slept",
                allErrored: "every poll errored",
                blocked: "a sleep overran its window: resolve the poll in the agent turn loop",
                conclusion: "the run's conclusion (run-completed when found), else null",
                checks: "checks in the PR rollup (PR targets), else null",
                dispatched: "--dispatch-if-absent ran gh workflow run",
            },
            exitCodes: { [EXIT_TRIGGER_FAILED]: "--dispatch-if-absent: gh workflow run failed" },
            run: runWait,
        },
        dispatch: {
            summary: "CI-Dispatch Gate after the last push: poll, one clean re-trigger, the ciDispatch verdict, and the body scan.",
            flags: [
                {
                    name: "pr",
                    type: "string",
                    help: "PR number (default: the open PR from this branch into dev)",
                },
                {
                    name: "fid",
                    type: "string",
                    required: true,
                    help: "feature id, for the re-trigger commit subject",
                },
                {
                    name: "label",
                    type: "string",
                    repeatable: true,
                    help: "a label the issue carries now (as the tracker MCP read returned it): bkit:auto adds ` bkit [auto route]` to the re-trigger subject",
                },
                {
                    name: "file",
                    type: "string",
                    help: "status.jsonl: write the --step row carrying ciDispatch once a verdict exists; a passed verdict is cross-checked and recorded as the close transport",
                },
                { name: "workflow", type: "string", help: "with --file: build | debug (default build)" },
                { name: "step", type: "string", help: "with --file: the step the row records" },
                {
                    name: "artifact",
                    type: "string",
                    repeatable: true,
                    help: "with --file: an artifact on the row (the created PR's URL)",
                },
                {
                    name: "field",
                    type: "string",
                    repeatable: true,
                    help: "with --file: an extra row field key=value",
                },
                { ...BUDGET_FLAG, help: "poll budget in seconds (default 60)" },
                { ...INTERVAL_FLAG, help: "seconds between polls (default 10)" },
                {
                    name: "poll-result",
                    type: "string",
                    help: "re-entry after a hand-off: found | none | err, as the agent turn loop resolved it",
                },
                {
                    name: "attempts",
                    type: "string",
                    help: "re-entry: total poll attempts so far (hand-off attempts + turns)",
                },
                { name: "all-errored", type: "boolean", help: "re-entry: every turn-loop poll errored" },
                {
                    name: "retriggered",
                    type: "boolean",
                    help: "re-entry: the hand-off was in the re-poll (re-trigger already pushed)",
                },
            ],
            output: {
                ciDispatch: "{outcome, head, attempts, retrigger, reason?} — record with `bkit steps done --field ciDispatch=…` (local only, never pushed); null on a hand-off",
                phase: "done | poll | repoll (which poll was handed to the agent)",
                pr: "PR number polled (null when none was found)",
                head: "the pushed head (the re-trigger commit after a re-trigger)",
                attempts: "poll attempts so far",
                retrigger: "a re-trigger commit was pushed",
                scanResult: "clean | skip-token-found | error — the pushed head's BODY scan; null when unresolved",
                ciWorkflow: "the CI workflow file the no-ci check looked for",
                row: "--file: the step-done row written (null on a hand-off)",
                transport: "--file: the close-transport row written for a passed verdict, else null",
            },
            exitCodes: {
                [EXIT_SKIP_TOKEN]: "the pushed head's body carries a CI-suppression token",
                [EXIT_SCAN_ERROR]: "the pushed head's commit message could not be read",
                [EXIT_RETRIGGER_FAILED]: "the re-trigger commit or push failed (no verdict)",
            },
            run: runDispatch,
        },
        gate: {
            summary: "Ship merge gate: the capstone job present and green at the head (exit 0), or why not.",
            flags: [
                { ...HEAD_FLAG, help: "the PR head to merge (or --pr / --squash-of)" },
                {
                    name: "pr",
                    type: "string",
                    help: "the PR number: gate its current head, refusing a title that carries a skip token (18)",
                },
                {
                    name: "squash-of",
                    type: "string",
                    help: "the merged PR number: gate its squash commit (ship's post-merge check, with --capstone-only)",
                },
                {
                    name: "snapshot",
                    type: "string",
                    help: "with --pr: append the pre-merge snapshot row to this file before gating",
                },
                {
                    name: "record",
                    type: "string",
                    help: "status.jsonl: append ship-gate-refusal on a refusal, or ship-merge-ci with --capstone-only",
                },
                {
                    name: "validated",
                    type: "string",
                    help: "an ancestor CI passed at; checked instead when only bookkeeping changed since (needs --month --fid)",
                },
                { name: "month", type: "string", help: "YYYYMM, for the bookkeeping allow-list" },
                { name: "fid", type: "string", help: "feature id, for the bookkeeping allow-list" },
                REPO_FLAG,
                {
                    name: "branch",
                    type: "string",
                    help: "PR branch: tells a superseded head (14) from no run (10)",
                },
                {
                    name: "event",
                    type: "string",
                    help: "count only runs fired by this event (push, pull_request)",
                },
                {
                    name: "file",
                    type: "string",
                    help: "status.jsonl for the BKIT_SHIP_GATE_OVERRIDE audit row (stderr when absent or unwritable)",
                },
                {
                    name: "capstone-only",
                    type: "boolean",
                    help: "pass or fail on the capstone job's result alone; the run's conclusion, other jobs and required lanes do not count (ship post-merge)",
                },
            ],
            output: {
                code: "the exit code",
                passed: "merge may proceed (green, or override honoured)",
                overridden: "BKIT_SHIP_GATE_OVERRIDE equalled the refused head",
                head: "head CI was checked at (--validated when the carry-forward applied)",
                mergeHead: "--head",
                testedHead: "head the selected (or superseded) run tested",
                runId: "selected run id",
                runUrl: "selected run URL",
                conclusion: "selected run conclusion",
                capstone: "capstone job name",
                ciWorkflow: "CI workflow file",
                repo: "owner/repo",
                skippedLanes: "lanes that concluded skipped (reported, refuse only when required)",
                nonBookkeepingPaths: "paths past --validated outside the allow-list (code 17)",
                reason: "why — the refusal or pass line",
            },
            exitCodes: {
                [GATE.NO_RUN]: "no run of the CI workflow at the head",
                [GATE.IN_PROGRESS]: "runs at the head, none completed; --capstone-only: capstone not completed (poll)",
                [GATE.FAILED]: "selected run or its capstone did not conclude success (--capstone-only: the capstone)",
                [GATE.NO_CAPSTONE]: "selected run has no capstone job",
                [GATE.SUPERSEDED]: "green run only at a superseded head (needs --branch)",
                [GATE.CANCELLED]: "selected run was cancelled",
                [GATE.LANE_SKIPPED]: "a required lane concluded skipped",
                [GATE.NOT_BOOKKEEPING]: "non-bookkeeping change past --validated, or not its descendant",
                [GATE.TITLE_SKIP]: "--pr: the PR title carries a CI-suppressing token",
                [GATE.API_ERROR]: "API error / rate limit / auth, or the PR head / squash commit unreadable",
            },
            run: runGate,
        },
        revalidate: {
            summary: "Ship: pick the head CI must pass at, probe for a run there, dispatch only when none, wait for it to complete.",
            flags: [
                { name: "pr", type: "string", required: true, help: "the PR number" },
                { name: "entry-head", type: "string", required: true, help: "the PR head read at Step 2" },
                {
                    name: "code-head",
                    type: "string",
                    required: true,
                    help: "the head before ship's bookkeeping commit (Step 8)",
                },
                { name: "branch", type: "string", required: true, help: "the PR branch" },
                {
                    name: "month",
                    type: "string",
                    required: true,
                    help: "YYYYMM, for the bookkeeping allow-list",
                },
                {
                    name: "fid",
                    type: "string",
                    required: true,
                    help: "feature id, for the bookkeeping allow-list",
                },
                {
                    name: "file",
                    type: "string",
                    required: true,
                    help: "status.jsonl for the ship-revalidate-dispatch / -timeout rows",
                },
                {
                    name: "reason",
                    type: "string",
                    help: "head-move (default) | gate-refusal (re-validate even when the head did not move)",
                },
                REPO_FLAG,
            ],
            output: {
                validatedHead: "the head CI was (or must be) checked at",
                currentHead: "the PR head now",
                revalidated: "a probe / wait ran (the head moved, or a gate refusal re-entered)",
                probe: "the presence probe's wait result, or null",
                dispatched: "the probe found no run and dispatched one",
                wait: "the completion wait's result, or null",
            },
            exitCodes: { [EXIT_TRIGGER_FAILED]: "no run and gh workflow run failed" },
            run: runRevalidate,
        },
        mirror: {
            summary: "Release PR: wait for the branch's push run at the head and copy its capstone verdict.",
            flags: [
                { ...HEAD_FLAG, required: true, help: "the PR head (same SHA the push run tests)" },
                { name: "branch", type: "string", help: "branch whose push run to mirror (default dev)" },
                { ...REPO_FLAG, help: "owner/repo (default: $GITHUB_REPOSITORY, then gh repo view)" },
                CI_WORKFLOW_FLAG,
                CAPSTONE_FLAG,
                {
                    name: "absent-minutes",
                    type: "string",
                    help: "how long no push run may exist (default 10)",
                },
                {
                    name: "max-minutes",
                    type: "string",
                    help: "how long to wait in total (default 170; keep below the job's timeout-minutes)",
                },
                { name: "interval-s", type: "string", help: "seconds between polls (default 30)" },
            ],
            output: {
                code: "the exit code",
                passed: "the push run's capstone passed",
                gateCode: "the last gate code",
                polls: "gate calls made",
                elapsedMinutes: "minutes waited",
            },
            exitCodes: {
                [MIRROR.ABSENT]: "no push run at the head after --absent-minutes ([skip ci] at the tip?)",
                [MIRROR.TIMED_OUT]: "push run still in progress at --max-minutes",
                [MIRROR.API_ERRORS]: "three GitHub API errors in a row",
            },
            run: runMirror,
        },
        context: {
            summary: "/bkit-auto Step 1: the phase and mode, the repo, and the issue / FID / PR / run the dispatch carries.",
            flags: [
                {
                    name: "phase",
                    type: "string",
                    required: true,
                    help: "ship | success | pass | debug | failure | fail | design | plan | build",
                },
                {
                    name: "arg",
                    type: "string",
                    required: true,
                    help: "CI: the PR number, or (CI_DEV) the FID slug; BRIEF: the issue",
                },
                {
                    name: "marker",
                    type: "string",
                    help: "the PR body (default: read with gh) — its bkit:fid marker names the FID",
                },
            ],
            output: {
                phase: "ship | debug | design | plan | build",
                mode: "CI | CI_DEV | BRIEF",
                ownerRepo: "owner/repo",
                owner: "owner half",
                repo: "repo half",
                issueId: "the issue (BRIEF: the arg; CI: from the marker or branch; null under no tracker)",
                fid: "the FID (CI / CI_DEV), else null",
                prNumber: "the PR (CI), else null",
                branch: "the PR head branch (CI), dev (CI_DEV), else null",
                headSha: "the PR head (CI) or origin/dev (CI_DEV), else null",
                prUrl: "the PR URL (CI), else null",
                prState: "the PR state (CI), else null",
                runId: "the CI run at the PR head (CI), else null",
            },
            exitCodes: {
                [EXIT_UNKNOWN_PHASE]: "the phase word is not one bkit dispatches",
                [EXIT_PR_NOT_OPEN]: "the PR is not OPEN",
                [EXIT_NO_RUN_ID]: "no CI run at the PR head",
                [EXIT_NO_FID]: "no valid FID (CI_DEV slug off the allowlist, or no marker / feat/{FID} branch)",
            },
            run: runContext,
        },
        declared: {
            summary: "Whether the repo declares a CI workflow: .github/workflows/<bkit.ciWorkflow> exists (exit 0) or not (exit 1).",
            flags: [],
            output: {
                declared: "the workflow file exists",
                ciWorkflow: "the workflow file name checked",
                path: "its path relative to the checkout",
            },
            run: (ctx) => {
                const d = ciDeclared(checkoutRoot(ctx.cwd));
                ctx.emit({ ...d });
                return d.declared ? EXIT.OK : EXIT.NO;
            },
        },
    },
};
