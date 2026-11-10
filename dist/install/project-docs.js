// install/project-docs.ts — the ten project documents bkit recommends (`docs/architecture.md` …
// `docs/setup.md`): the topic catalog, the legacy-starter digests, the ownership migration for a
// document an older release installed as a managed block, and the `Project Documents` index
// (`.agents/docs.md`, below the closing `bkit:end`) that lists the project's own copies.
//
// The starters ship in `.bkit/templates/docs/`; the project copies a starter to `docs/` and owns
// it. Nothing here creates a project document. Every write is one of two surgical edits: removing
// the exact ownership-wrapper lines of a legacy managed document, or inserting a table row into
// `Project Documents`. Anything ambiguous or unsafe is left byte-for-byte and reported.
import * as crypto from "node:crypto";
import * as fs from "node:fs";
import * as path from "node:path";
import { LOG_PREFIX } from "../shared/log-prefix.js";
import { findLineAnchoredMarkers, stripManagedWrapper } from "./managed-block.js";
// ---------------------------------------------------------------------------
// Topic catalog
// ---------------------------------------------------------------------------
/** The ten topics, in index order. */
export const PROJECT_DOC_TOPICS = [
    "architecture",
    "technology",
    "security",
    "data-schema",
    "testing",
    "deployments",
    "observability",
    "design",
    "noise",
    "setup",
];
const TOPIC_INFO = {
    architecture: {
        phases: ["●", "●", "●", "○", "○"],
        scope: "System design — service boundaries, deployment topology, integration sketch.",
    },
    technology: {
        phases: ["●", "●", "○", "○", "○"],
        scope: "Chosen frameworks, libraries, styling systems, coding conventions. Why a choice was made goes in `decisions.jsonl`.",
    },
    security: {
        phases: ["●", "●", "●", "○", "○"],
        scope: "Authentication, authorization, input validation, rate limiting, secrets management, PII handling.",
    },
    "data-schema": {
        phases: ["○", "○", "●", "○", "○"],
        scope: "Active production database schema — entities / tables, fields, access policies (e.g. RLS), indices, functions, triggers.",
    },
    testing: {
        phases: ["○", "●", "●", "●", "—"],
        scope: "Testing strategy — tier boundaries, framework choices, naming conventions, CI lane graph (names, needs, when a lane runs).",
    },
    deployments: {
        phases: ["○", "○", "○", "●", "●"],
        scope: "Deployment / CI/CD — secrets, branch protection, one-run concurrency, push base, promote after the capstone.",
    },
    observability: {
        phases: ["○", "○", "●", "●", "○"],
        scope: "Logging architecture, correlation tracing, telemetry pipelines, log drains.",
    },
    design: {
        phases: ["○", "○", "○", "—", "—"],
        scope: "Design system — palette, typography, components, spacing, a11y, layout tokens.",
    },
    noise: {
        phases: ["—", "—", "○", "●", "○"],
        scope: "Registry of intentional signal downgrades — log levels, error-tracker archives / mutes, alert thresholds.",
    },
    setup: {
        phases: ["—", "—", "—", "—", "—"],
        scope: "Local dev — CLIs, configuration, secrets, troubleshooting. Humans only.",
    },
};
/** The recommended repo-relative path of a topic's project document. */
export function projectDocPath(topic) {
    return `docs/${topic}.md`;
}
/** Repo-relative path of the document index that holds the `Project Documents` table. */
export const PROJECT_INDEX_PATH = ".agents/docs.md";
/** Repo-relative path of a topic's starter copy under the consumer's `.bkit/`. */
export function starterPath(topic) {
    return `.bkit/templates/docs/${topic}.md`;
}
/** The topic a repo-relative path is the recommended document of, or null. */
export function topicOfPath(rel) {
    return PROJECT_DOC_TOPICS.find((t) => projectDocPath(t) === rel) ?? null;
}
// ---------------------------------------------------------------------------
// Legacy starter digests
//
// Releases up to 6.1.x installed these ten documents as managed blocks. Digests of that shipped
// text let a later check tell an untouched legacy starter from a document the project wrote.
//
//   Source revision : `.bkit/shared/docs/<topic>.md` as committed at 45f4254bd.
//   Rendering rules : install rendered `{{BKIT_MANAGED_MARKER}}` into the `bkit:managed` notice
//                     line and `{{DEFAULT_BRANCH}}` into the default branch (`main` here). The
//                     other `{{...}}` text in the sources is prose and stayed literal.
//   Normalization   : see `normalizeLegacyText`. Digests cover text a project may not have
//                     touched, never the ownership lines, line endings or blank-line runs.
//
// A copy rendered with another default branch does not match, so it reads as "differs", which
// callers treat as a candidate for assessment, never as proof of content.
// ---------------------------------------------------------------------------
/** Commit the legacy starter text was read from. */
export const LEGACY_STARTER_SOURCE_REVISION = "45f4254bd";
const LEGACY_NOTICE_RE = /^<!-- bkit:managed v\S+ — (?:.* — )?do (?:not|NOT) edit; run `bkit upgrade` to refresh -->$/;
const BRANCH = "[A-Za-z0-9._/-]+";
/** The contexts the shipped starters render the project's default branch into. */
const BRANCH_CONTEXTS = [
    [new RegExp(`(\`dev\`\\s*(?:/|or)\\s*\`)${BRANCH}(\`)`, "g"), "$1main$2"],
    [new RegExp(`(push to \`)${BRANCH}(\`)`, "g"), "$1main$2"],
    [new RegExp(`(refs/heads/)${BRANCH}(')`, "g"), "$1main$2"],
    [new RegExp(`((?:On|queues on) \`)${BRANCH}(\`)`, "g"), "$1main$2"],
];
/** A rendered default branch in a starter's known contexts, replaced by `main`. */
function anyBranch(line) {
    let out = line;
    for (const [re, to] of BRANCH_CONTEXTS)
        out = out.replace(re, to);
    return out;
}
/**
 * Normalize a document for comparison with a legacy starter: LF line endings, the former
 * ownership lines (`bkit:start`, `bkit:end`, the `bkit:managed` notice and the unrendered
 * `{{BKIT_MANAGED_MARKER}}` token) dropped, the default-branch token rendered as `main`,
 * trailing spaces trimmed and runs of blank lines collapsed.
 */
export function normalizeLegacyText(text) {
    const kept = [];
    for (const raw of text.replace(/\r\n?/g, "\n").split("\n")) {
        const line = anyBranch(raw.replace(/\{\{DEFAULT_BRANCH\}\}/g, "main")).replace(/[ \t]+$/, "");
        if (line === "<!-- bkit:start -->" || line === "<!-- bkit:end -->")
            continue;
        if (line === "{{BKIT_MANAGED_MARKER}}" || LEGACY_NOTICE_RE.test(line))
            continue;
        kept.push(line);
    }
    return kept
        .join("\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
}
/** sha256 of the normalized text. */
export function legacyDigest(text) {
    return crypto.createHash("sha256").update(normalizeLegacyText(text)).digest("hex");
}
/** Digest of each topic's normalized legacy starter. */
export const LEGACY_STARTER_DIGESTS = {
    architecture: "b949b773e10f9d0a797189c942a5884a4c971805da43520883138118226ad845",
    technology: "723fd7fa4c001c1c3d562bd9de18f9830df3beebdcd45b54afeee159ce7bf2f0",
    security: "bdc2046e0f1b91a88fe272c8a1f5260429bb07ad548d57721b6a8b2fc623e345",
    "data-schema": "2cd1f2eedc508af1d609ce5b53b0e1836cc33c8fd4e67fb2ad4c821f83043c5f",
    testing: "075dec5a758e911f11077296eee0c6008be68415105a18df5cbdd76defb22bab",
    deployments: "723cedf74544ac377877a5ea9498622cadec41b81b8e8accd33cedf7eea44630",
    observability: "bebf67757c55db829ed4c429cefadf28b31175361f40e253b014d50e73dd5a65",
    design: "2e680b2857679af9672b1112cf06d7e1282c75c739e36428e49cf13be33bfc92",
    noise: "64ddcda2d9ee14efbe1a210c1f5177e6cc4dfa10417d410825d8765628307773",
    setup: "7da0f1a4e639ee2a2194c11a0ba762e9f4014826e1d01f7f61f9391de8c462a8",
};
/** Digests of every released shipped starter text per topic (each tag that installed .bkit/shared/docs/) plus the recorded revision. */
export const LEGACY_STARTER_DIGEST_HISTORY = {
    architecture: [
        "cba1e5a333c26b5a797c6b73aa1efd6d0d4644372482e5d8a697b34708257ac0",
        "1e52e99285ebe88454253965fedd92efad7e2c5fbfd95062f9dfecf77ac8995b",
        "b949b773e10f9d0a797189c942a5884a4c971805da43520883138118226ad845",
    ],
    technology: [
        "75446a8a702c822dfdfb24593c4807d30b0291e1e116b664ba7031f9af0530ba",
        "d8167d2e9ce3b1ab18fdeecf5f5b9480e4cac7361a9e7ace7e135ff4ec43f3a4",
        "723fd7fa4c001c1c3d562bd9de18f9830df3beebdcd45b54afeee159ce7bf2f0",
    ],
    security: [
        "be84dc3b19cc34a13cdfc58062970d00a3564eacbcf05a0336646efe84f54630",
        "752ae21e35128e17fc3a2fd6e009bf38751f6ccaa6c76d1723c1c99aff462335",
        "5627543777d4f0bd4b8885df23e32d9ff9cc03c8b706894943bb018ec71c8cab",
        "38bd66f0a66c7b2f3e454132df182b31538e045141f2fd6f761c57af2890c422",
        "040408ccd16e3872d5eced55d36172fc163dcde548e89f382eafa992282f027c",
        "26b8927e8df45b989422b417df8f406cd8b8c594811e42919756d26e807133c0",
        "c8b631886a5a748199e1d731eabf50de9a07738912ecae392b5bac4636b90806",
        "bdc2046e0f1b91a88fe272c8a1f5260429bb07ad548d57721b6a8b2fc623e345",
    ],
    "data-schema": [
        "cc8f7b971e1714b9dde60a89738495fdf30b112536a94cd45e94a2e2cc5cc155",
        "6af1f76b57568dd1bbd9bd48dd5fe55ffb64c08f12ac2e361576131a912be32e",
        "2cd1f2eedc508af1d609ce5b53b0e1836cc33c8fd4e67fb2ad4c821f83043c5f",
    ],
    testing: [
        "c20736efb9cf7b3e2b2aea237fb2ea902e83cba7c590402c3ebc3bbe9d00ad0a",
        "b4b7786ce58a4c20589246f9c3a6f3a6d391fb479dc20708eff638329c7769d0",
        "15a92687e35c1b902ff51c229e9b3abd821e3ceea0c1d7649b6ff4f977400940",
        "22c3d9df343affec39423f61f1943a8e5be29b9a109c8b20b1a52b01ee7a4ba9",
        "dc2b3553910be2879a15e379abd5e0718509bf7f690d31f1c8ba619857880433",
        "a99cc2244c94b52ebcc67110c2c12905941f26e885bf6f07557876f21e3dcbb6",
        "c96f8a8a1f2720c18915d9c24e0af28ad46a5d97814adaad3f7538f53e5ba6a2",
    ],
    deployments: [
        "46c46cd2c2bb97676c9e9ecfa16184913124e5d32f9433142a6a33782f63ab43",
        "9ccd487486549b5756401b2242d4a557a180f790bd43124800a33038ee116ecc",
        "cb90552aba937c04949d6ab881f07eee51eff7bdebf6af679fb351267489c17c",
        "09eec0a36879f31e18cae2c0669a81f4dac874cd530098bd2cbae65ac91e6463",
        "9313b73cd5ee572c9c8a655167d31e72b960a5e7dd06ccddb2f7cf6c2581ce28",
        "59e5a148c20d431b5fcf890f1a3848d80a6f599852042ae4e28f1887fb2fdbf9",
        "44a277e16553554bef3c986b6651fd329d51aaf285846fc39ca8d3bfeef18a96",
        "d337db11cbc8ab535db2a07fd06bf1c9d769f38b96c59b3485833997a318fe48",
        "ac5f9f45397d816e0780029c00e52a203a5676cc443dc4b06c342424343389df",
        "997062bf3456a3ce7cc7bb87c94dc04b64888f6f0c82c9e3c84109f6ad900335",
        "6b091b3f43af189e6818838a506511aa25fc2ba99e467dc513466ae7469423b7",
        "960a206511793814cef4d01db7a23f06fe0387dd7ee7d7d2b9fbb296b8303fcd",
    ],
    observability: [
        "3541333403d2f87f34c0846a533dbb2bd9d92af6e92937d094381bd25e3686c6",
        "793007002a287d51f77c4df4ec78ada5a04756d2047d938b315de51a491ec7f4",
        "bebf67757c55db829ed4c429cefadf28b31175361f40e253b014d50e73dd5a65",
    ],
    design: [
        "aba4ddee5522d53fa7f179d370bbab0764ee7f3976cf771f95ac008222926b34",
        "1b170ada4eafe88488f34e7f3ed943a6582948b642ecfcd72a6ded95ceb17c46",
        "2e680b2857679af9672b1112cf06d7e1282c75c739e36428e49cf13be33bfc92",
    ],
    noise: [
        "19506086100971104bb04f3a5fe7d1304f293193fa056d13d0bc1727af1f7f9f",
        "09d861b868b413f5d58edf097892f12d855aa72bae8ec5f02ed2bffb5d0aa2cb",
        "64ddcda2d9ee14efbe1a210c1f5177e6cc4dfa10417d410825d8765628307773",
    ],
    setup: [
        "b3827a1e70fcea5c9c12585a2e3f43cf895ad8eb3bf2bcf66ed8ac19783273b6",
        "d130a83010ddfb870f21f30a8b271880101ee2d103cc361d193262a1a3147e16",
        "a6114f7fc2a8d80460892d5892b6d9d2d59b6ed90974d094b0ddf9f68a2b26fa",
        "7da0f1a4e639ee2a2194c11a0ba762e9f4014826e1d01f7f61f9391de8c462a8",
    ],
};
/** The topic whose legacy starter `text` equals once normalized, or null. */
export function legacyStarterTopic(text) {
    const digest = legacyDigest(text);
    return PROJECT_DOC_TOPICS.find((t) => LEGACY_STARTER_DIGEST_HISTORY[t].includes(digest)) ?? null;
}
/**
 * Whether `rel` under `root` is a regular file bkit may read or edit. A symlink (to anywhere), a
 * directory, anything other than a regular file, and a path whose parent directory resolves
 * outside the repository are `unsafe` with the reason.
 */
export function inspectRepoFile(root, rel) {
    try {
        const abs = path.join(root, rel);
        const stat = fs.lstatSync(abs, { throwIfNoEntry: false });
        if (stat === undefined)
            return "absent";
        if (stat.isSymbolicLink())
            return { unsafe: "it is a symbolic link" };
        if (!stat.isFile())
            return { unsafe: "it is not a regular file" };
        const realRoot = fs.realpathSync(root);
        const realParent = fs.realpathSync(path.dirname(abs));
        if (realParent !== realRoot && !realParent.startsWith(realRoot + path.sep)) {
            return { unsafe: "it resolves outside the repository" };
        }
        return "regular";
    }
    catch (error) {
        return { unsafe: `it could not be inspected (${errorReason(error)})` };
    }
}
/** A short, path-free reason for a filesystem error. */
function errorReason(error) {
    const code = error?.code;
    return typeof code === "string" ? code : "filesystem error";
}
/** True when `rel` is a repo-relative path with no parent or absolute segments. */
export function isInTreePath(rel) {
    if (rel === "" || path.isAbsolute(rel) || /^[A-Za-z]:/.test(rel))
        return false;
    for (const ch of rel) {
        const code = ch.charCodeAt(0);
        if (code < 0x20 || code === 0x7f)
            return false;
    }
    return !rel.split(/[\\/]/).includes("..");
}
const ROW_RE = /^\|\s*`([^`]+)`\s*\|/;
/** The `Project Documents` table of the index: the heading below the last `bkit:end`, then the first table. */
export function readProjectIndex(root) {
    const state = inspectRepoFile(root, PROJECT_INDEX_PATH);
    if (state === "absent")
        return { status: "missing" };
    if (state !== "regular") {
        return { status: "unreadable", reason: `${PROJECT_INDEX_PATH} is not a safe regular file` };
    }
    let text;
    try {
        text = fs.readFileSync(path.join(root, PROJECT_INDEX_PATH), "utf-8");
    }
    catch (error) {
        return {
            status: "unreadable",
            reason: `${PROJECT_INDEX_PATH} could not be read (${errorReason(error)})`,
        };
    }
    const eol = text.includes("\r\n") ? "\r\n" : "\n";
    const ends = findLineAnchoredMarkers(text.replace(/\r/g, ""), "<!-- bkit:end -->");
    if (ends.length === 0) {
        return { status: "unreadable", reason: "no closing `bkit:end` marker above Project Documents" };
    }
    const lines = text.match(/[^\n]*\n|[^\n]+$/g) ?? [];
    let offset = 0;
    let afterEnd = false;
    let headingSeen = false;
    let tableStart = -1;
    let tableEnd = -1;
    let needsEol = false;
    const rows = [];
    for (const line of lines) {
        const bare = line.replace(/\r?\n$/, "");
        const lineEnd = offset + line.length;
        if (!afterEnd) {
            if (bare === "<!-- bkit:end -->")
                afterEnd = true;
        }
        else if (!headingSeen) {
            if (bare === "## Project Documents")
                headingSeen = true;
        }
        else if (tableEnd === -1) {
            if (bare.startsWith("|")) {
                if (tableStart === -1)
                    tableStart = offset;
                const match = ROW_RE.exec(bare);
                if (match && tableStart !== offset) {
                    const cells = bare.split("|");
                    rows.push({
                        path: match[1],
                        scope: (cells[cells.length - 2] ?? "").trim(),
                    });
                }
                needsEol = !line.endsWith("\n");
                // The table ends at the first non-table line, so keep scanning.
                offset = lineEnd;
                continue;
            }
            else if (tableStart !== -1) {
                tableEnd = offset;
            }
            else if (bare.startsWith("## ")) {
                break;
            }
        }
        offset = lineEnd;
    }
    if (!headingSeen || tableStart === -1) {
        return {
            status: "unreadable",
            reason: "no `## Project Documents` heading with a table below the closing `bkit:end`",
        };
    }
    if (tableEnd === -1)
        tableEnd = offset;
    return { status: "ok", text, eol, rows, insertAt: tableEnd, needsEol };
}
/** Row text for a project document, in the table's column order. */
export function projectDocRow(topic) {
    const info = TOPIC_INFO[topic];
    return `| \`${projectDocPath(topic)}\` | ${info.phases.join(" | ")} | ${info.scope} |`;
}
/**
 * The indexed document that already covers `topic` at another path: a same-basename row, or a
 * row whose Scope names the recommended path as its equivalent (`Equivalent to docs/x.md`).
 */
export function findIndexedEquivalent(rows, topic, usable = () => true) {
    const recommended = projectDocPath(topic);
    const base = `${topic}.md`;
    for (const row of rows) {
        if (row.path === recommended || !usable(row.path))
            continue;
        if (path.posix.basename(row.path) === base)
            return row.path;
        const mentions = new RegExp(`equivalent\\s+to\\s+\`?${recommended.replace(".", "\\.")}\`?`, "i");
        if (mentions.test(row.scope))
            return row.path;
    }
    return null;
}
const PROBLEM_TEXT = {
    "missing-partner": "one of `bkit:start` / `bkit:end` is missing",
    inverted: "`bkit:end` comes before `bkit:start`",
    multiple: "more than one `bkit:start` / `bkit:end` marker",
    "inside-fence": "a marker line sits inside a code fence",
    "multiple-notices": "more than one generated `bkit:managed` notice",
};
/**
 * Bring the project documents under the project's ownership and into its index, for install
 * and upgrade. Per present default document:
 *   1. a legacy `bkit:start` / `bkit:end` wrapper and its `bkit:managed` notice are removed,
 *      every other byte kept; an unclear wrapper is left as it is and reported;
 *   2. the path gets a `Project Documents` row when no row names that exact path, unless a
 *      different indexed document already covers the topic. A document migrated in this run
 *      gets its own row either way.
 * Missing documents stay missing. An index that cannot be read as a table is left untouched and
 * reported. A dry run writes nothing and prints what a real run would do. Safe to repeat.
 */
export function syncProjectDocs(root, opts) {
    const report = {
        migrated: [],
        ambiguous: [],
        unsafe: [],
        registered: [],
        equivalent: [],
        indexProblem: null,
    };
    const tag = opts.dryRun ? "[dry-run] " : "";
    const present = [];
    for (const topic of PROJECT_DOC_TOPICS) {
        const rel = projectDocPath(topic);
        const state = inspectRepoFile(root, rel);
        if (state === "absent")
            continue;
        if (state !== "regular") {
            report.unsafe.push({ path: rel, reason: state.unsafe });
            continue;
        }
        const abs = path.join(root, rel);
        try {
            const before = fs.readFileSync(abs, "utf-8");
            const result = stripManagedWrapper(before);
            present.push(topic);
            if (result.status === "ambiguous") {
                report.ambiguous.push({ path: rel, problem: result.problem });
            }
            else if (result.status === "removed") {
                if (!opts.dryRun)
                    fs.writeFileSync(abs, result.content, "utf-8");
                report.migrated.push(rel);
            }
        }
        catch (error) {
            const at = present.indexOf(topic);
            if (at !== -1)
                present.splice(at, 1);
            report.unsafe.push({
                path: rel,
                reason: `it could not be read or written (${errorReason(error)})`,
            });
        }
    }
    let index = readProjectIndex(root);
    const edits = [];
    const migrated = new Set(report.migrated);
    for (const topic of present) {
        const rel = projectDocPath(topic);
        if (report.ambiguous.some((a) => a.path === rel))
            continue;
        if (index.status === "ok") {
            if (index.rows.some((r) => r.path === rel))
                continue;
            const indexed = findIndexedEquivalent(index.rows, topic, (row) => isInTreePath(row) && inspectRepoFile(root, row) === "regular");
            if (indexed !== null && !migrated.has(rel)) {
                report.equivalent.push({ path: rel, indexed });
                continue;
            }
        }
        edits.push(rel);
    }
    if (edits.length > 0) {
        if (index.status !== "ok") {
            report.indexProblem =
                index.status === "missing"
                    ? `${PROJECT_INDEX_PATH} does not exist`
                    : `${PROJECT_INDEX_PATH} has no readable Project Documents table (${index.reason})`;
        }
        else {
            const rows = edits.map((rel) => projectDocRow(topicOfPath(rel)));
            const insertion = (index.needsEol ? index.eol : "") + rows.join(index.eol) + index.eol;
            const next = index.text.slice(0, index.insertAt) + insertion + index.text.slice(index.insertAt);
            try {
                if (!opts.dryRun)
                    fs.writeFileSync(path.join(root, PROJECT_INDEX_PATH), next, "utf-8");
                report.registered.push(...edits);
                index = { ...index, text: next };
            }
            catch (error) {
                report.indexProblem = `${PROJECT_INDEX_PATH} could not be written (${errorReason(error)})`;
            }
        }
    }
    logReport(report, tag);
    return report;
}
function logReport(report, tag) {
    for (const rel of report.migrated) {
        console.log(`${LOG_PREFIX} ${tag}migrate: ${rel} — removed the bkit ownership wrapper, now a project document (text inside and outside the wrapper kept)`);
    }
    for (const rel of report.registered) {
        console.log(`${LOG_PREFIX} ${tag}register: ${rel} in ${PROJECT_INDEX_PATH} (Project Documents)`);
    }
    for (const e of report.equivalent) {
        console.log(`${LOG_PREFIX} ${tag}skip: ${e.path} — ${PROJECT_INDEX_PATH} already lists ${e.indexed} for this topic, so no row was added. Add a row by hand if both documents matter.`);
    }
    for (const a of report.ambiguous) {
        console.warn(`${LOG_PREFIX} ${a.path}: left as it is — ${PROBLEM_TEXT[a.problem]}, so bkit cannot tell its wrapper from your text. Delete any \`bkit:start\` / \`bkit:end\` / \`bkit:managed\` lines by hand; the file is yours.`);
    }
    for (const u of report.unsafe) {
        console.warn(`${LOG_PREFIX} ${u.path}: skipped — ${u.reason}. bkit neither reads nor indexes it.`);
    }
    if (report.indexProblem !== null) {
        console.warn(`${LOG_PREFIX} ${PROJECT_INDEX_PATH}: not edited — ${report.indexProblem}. Add a row for ${report.migrated.length + report.registered.length > 0 ? "each project document" : "the project documents you copied"} under a \`## Project Documents\` table below \`<!-- bkit:end -->\` by hand.`);
    }
}
