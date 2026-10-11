#!/usr/bin/env -S npx tsx
/**
 * Linear → GitHub importer for a single Linear project.
 *
 * - Reads issues from a CSV export (`docs/linear-issues.csv` by default).
 * - Creates matching GitHub issues in `--repo` (default: `cbartens/bkit`).
 * - Adds each issue to the named GitHub Projects v2 board (default `Roadmap`).
 * - Maps Linear status → board Status column.
 * - Maps Linear priority → board Priority column.
 * - Ports Linear labels (creating missing ones).
 * - Fetches Linear comments via the Linear GraphQL API and posts them as
 *   GitHub comments, prefixed with author/date for attribution.
 *
 * Idempotent: each created issue carries `<!-- linear-import: BAR-N -->` and
 * each ported comment carries `<!-- linear-comment: <uuid> -->`. Re-runs
 * skip already-imported issues and only post missing comments.
 *
 * Defaults to dry-run. Pass `--apply` to write.
 *
 * Required env:
 *   BKIT_LINEAR_API_KEY      Linear personal API key (loaded via direnv from .bkit/.env)
 *
 * Token resolution for GitHub:
 *   1. process.env.GH_PROJECT_TOKEN  (explicit override)
 *   2. `gh auth token`               (keyring; needs `project`, `repo` scopes)
 *
 * Usage:
 *   pnpm exec tsx scripts/linear/linear-to-github-import.ts             # dry-run
 *   pnpm exec tsx scripts/linear/linear-to-github-import.ts --apply
 *   pnpm exec tsx scripts/linear/linear-to-github-import.ts --only BAR-5,BAR-7 --apply
 *   pnpm exec tsx scripts/linear/linear-to-github-import.ts --limit 3   # dry-run first 3
 */

import { execSync } from "node:child_process";
import { readFile } from "node:fs/promises";

// ─────────────────────────────────────────────────────────────────────────────
// Args
// ─────────────────────────────────────────────────────────────────────────────

const argv = process.argv.slice(2);
function flag(name: string): string | undefined {
  const eq = argv.find((a) => a.startsWith(`${name}=`));
  if (eq) return eq.slice(name.length + 1);
  const idx = argv.indexOf(name);
  if (idx >= 0 && argv[idx + 1] && !argv[idx + 1].startsWith("--")) return argv[idx + 1];
  return undefined;
}
const APPLY = argv.includes("--apply");
const CSV_PATH = flag("--csv") ?? "docs/linear-issues.csv";
const REPO = flag("--repo") ?? "cbartens/bkit";
const PROJECT_TITLE = flag("--project") ?? "bkit";
const LINEAR_PROJECT = flag("--linear-project") ?? "bkit";
const ONLY = (flag("--only") ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const LIMIT = Number(flag("--limit") ?? Number.POSITIVE_INFINITY);
const VERBOSE = argv.includes("--verbose");

const [OWNER, REPO_NAME] = REPO.split("/");
if (!OWNER || !REPO_NAME) die(`--repo must be owner/name, got ${REPO}`);

// ─────────────────────────────────────────────────────────────────────────────
// Tokens
// ─────────────────────────────────────────────────────────────────────────────

const BKIT_LINEAR_API_KEY = process.env.BKIT_LINEAR_API_KEY;
if (!BKIT_LINEAR_API_KEY) die("BKIT_LINEAR_API_KEY missing — load .bkit/.env via direnv");

function resolveGhToken(): string {
  if (process.env.GH_PROJECT_TOKEN) return process.env.GH_PROJECT_TOKEN;
  // Then the keyring token (`--secure-storage`), then whatever `gh auth token`
  // resolves. The token needs `project` and `repo` scopes.
  for (const cmd of ["gh auth token --secure-storage", "gh auth token"]) {
    try {
      const tok = execSync(cmd, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
      if (tok) return tok;
    } catch {}
  }
  die("No GH token: set GH_PROJECT_TOKEN or run `gh auth login` (need project+repo scopes)");
}
const GH_TOKEN = resolveGhToken();

// ─────────────────────────────────────────────────────────────────────────────
// Mappings
// ─────────────────────────────────────────────────────────────────────────────

type StatusMap = { gh: string; close?: "completed" | "not_planned" };
const STATUS_MAP: Record<string, StatusMap> = {
  Backlog: { gh: "Backlog" },
  Todo: { gh: "Ready" },
  "In Progress": { gh: "In progress" },
  "In Review": { gh: "In review" },
  Done: { gh: "Done", close: "completed" },
  Canceled: { gh: "Done", close: "not_planned" },
};

const PRIORITY_MAP: Record<string, string | null> = {
  Urgent: "P0",
  High: "P0",
  Medium: "P1",
  Low: "P2",
  "No priority": null,
};

// Labels not ported: the Linear project label (the GH board holds the project).
const LABEL_SKIPLIST = new Set(["cbartens/bkit"]);

// ─────────────────────────────────────────────────────────────────────────────
// CSV (RFC4180 with multi-line quoted fields)
// ─────────────────────────────────────────────────────────────────────────────

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i++;
        } else inQuotes = false;
      } else cell += c;
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ",") {
        row.push(cell);
        cell = "";
      } else if (c === "\n") {
        row.push(cell);
        rows.push(row);
        row = [];
        cell = "";
      } else if (c === "\r") {
        // skip
      } else cell += c;
    }
  }
  if (cell.length || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

type CsvRow = Record<string, string>;
function csvToObjects(rows: string[][]): CsvRow[] {
  const [header, ...body] = rows;
  if (!header) return [];
  return body
    .filter((r) => r.length === header.length || r.some((c) => c.length > 0))
    .map((r) => {
      const o: CsvRow = {};
      header.forEach((h, i) => (o[h] = r[i] ?? ""));
      return o;
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// HTTP helpers
// ─────────────────────────────────────────────────────────────────────────────

async function gh<T = any>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${GH_TOKEN}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`GH ${res.status} ${init.method ?? "GET"} ${path}: ${body.slice(0, 400)}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

async function ghGraphql<T = any>(
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T> {
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${GH_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });
  const json: any = await res.json();
  if (json.errors) throw new Error(`GH GraphQL: ${JSON.stringify(json.errors)}`);
  return json.data as T;
}

async function linearGraphql<T = any>(
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T> {
  const res = await fetch("https://api.linear.app/graphql", {
    method: "POST",
    headers: {
      Authorization: BKIT_LINEAR_API_KEY!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });
  const json: any = await res.json();
  if (json.errors) throw new Error(`Linear GraphQL: ${JSON.stringify(json.errors)}`);
  return json.data as T;
}

// ─────────────────────────────────────────────────────────────────────────────
// Discovery
// ─────────────────────────────────────────────────────────────────────────────

type ProjectMeta = {
  id: string;
  url: string;
  statusFieldId: string;
  statusOptions: Map<string, string>; // name → id
  priorityFieldId: string | null;
  priorityOptions: Map<string, string>;
};

async function findProject(): Promise<ProjectMeta> {
  const data = await ghGraphql<any>(`
    query {
      viewer {
        projectsV2(first: 50) {
          nodes {
            id title url
            fields(first: 30) {
              nodes {
                ... on ProjectV2SingleSelectField {
                  id name options { id name }
                }
              }
            }
          }
        }
      }
    }`);
  const proj = data.viewer.projectsV2.nodes.find((p: any) => p?.title === PROJECT_TITLE);
  if (!proj) die(`Project "${PROJECT_TITLE}" not found on viewer`);
  const fields = proj.fields.nodes.filter((f: any) => f?.options);
  const statusField = fields.find((f: any) => f.name === "Status");
  const priorityField = fields.find((f: any) => f.name === "Priority");
  if (!statusField) die(`Project "${PROJECT_TITLE}" has no Status field`);
  const toMap = (opts: any[]) => new Map(opts.map((o) => [o.name, o.id]));
  return {
    id: proj.id,
    url: proj.url,
    statusFieldId: statusField.id,
    statusOptions: toMap(statusField.options),
    priorityFieldId: priorityField?.id ?? null,
    priorityOptions: priorityField ? toMap(priorityField.options) : new Map(),
  };
}

type LinearOrg = { urlKey: string };
async function findLinearOrg(): Promise<LinearOrg> {
  const data = await linearGraphql<any>(`query { organization { urlKey } }`);
  return { urlKey: data.organization.urlKey };
}

// ─────────────────────────────────────────────────────────────────────────────
// GitHub label management
// ─────────────────────────────────────────────────────────────────────────────

const labelCache = new Map<string, true>();
async function ensureLabel(name: string): Promise<void> {
  if (labelCache.has(name)) return;
  try {
    await gh(`/repos/${OWNER}/${REPO_NAME}/labels/${encodeURIComponent(name)}`);
    labelCache.set(name, true);
    return;
  } catch {
    // not found → create
  }
  if (!APPLY) {
    labelCache.set(name, true);
    return;
  }
  await gh(`/repos/${OWNER}/${REPO_NAME}/labels`, {
    method: "POST",
    body: JSON.stringify({ name, color: "ededed" }),
  });
  labelCache.set(name, true);
}

// ─────────────────────────────────────────────────────────────────────────────
// Existing issues map (idempotency)
// ─────────────────────────────────────────────────────────────────────────────

type GhIssueLite = {
  number: number;
  body: string;
  nodeId: string;
  state: "open" | "closed";
  milestoneNumber: number | null;
};
const importedByLinearId = new Map<string, GhIssueLite>();

async function scanExistingIssues(): Promise<void> {
  let page = 1;
  while (true) {
    const issues = await gh<any[]>(
      `/repos/${OWNER}/${REPO_NAME}/issues?state=all&per_page=100&page=${page}`,
    );
    if (!issues.length) break;
    for (const i of issues) {
      if (i.pull_request) continue;
      const m = (i.body ?? "").match(/<!--\s*linear-import:\s*([A-Z]+-\d+)\s*-->/);
      if (m) {
        importedByLinearId.set(m[1], {
          number: i.number,
          body: i.body,
          nodeId: i.node_id,
          state: i.state,
          milestoneNumber: i.milestone?.number ?? null,
        });
      }
    }
    if (issues.length < 100) break;
    page++;
  }
}

type ImportedGhComment = { numericId: number; uuid: string; body: string };

async function existingLinearComments(issueNumber: number): Promise<ImportedGhComment[]> {
  const out: ImportedGhComment[] = [];
  let page = 1;
  while (true) {
    const comments = await gh<any[]>(
      `/repos/${OWNER}/${REPO_NAME}/issues/${issueNumber}/comments?per_page=100&page=${page}`,
    );
    if (!comments.length) break;
    for (const c of comments) {
      const m = (c.body ?? "").match(/<!--\s*linear-comment:\s*([0-9a-f-]+)\s*-->/);
      if (m) out.push({ numericId: c.id, uuid: m[1], body: c.body });
    }
    if (comments.length < 100) break;
    page++;
  }
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// Linear comments fetch
// ─────────────────────────────────────────────────────────────────────────────

type LinearComment = {
  id: string;
  body: string;
  createdAt: string;
  user: { name?: string; displayName?: string; email?: string } | null;
};

async function fetchLinearComments(issueUuid: string): Promise<LinearComment[]> {
  const data = await linearGraphql<any>(
    `query($id: String!) {
      issue(id: $id) {
        comments(first: 100) {
          nodes { id body createdAt user { name displayName email } }
        }
      }
    }`,
    { id: issueUuid },
  );
  if (!data.issue) return [];
  return data.issue.comments.nodes;
}

// ─────────────────────────────────────────────────────────────────────────────
// Linear extras: milestone, parent, relations (blocks/related/duplicate)
// ─────────────────────────────────────────────────────────────────────────────

type LinearRelation = {
  type: "blocks" | "related" | "duplicate" | string;
  identifier: string;
  title: string;
  direction: "out" | "in";
};

type LinearExtras = {
  parent: string | null;
  milestone: string | null;
  relations: LinearRelation[];
};

async function fetchLinearExtras(issueUuid: string): Promise<LinearExtras> {
  const data = await linearGraphql<any>(
    `query($id: String!) {
      issue(id: $id) {
        parent { identifier }
        projectMilestone { name }
        relations(first: 50) {
          nodes { type relatedIssue { identifier title } }
        }
        inverseRelations(first: 50) {
          nodes { type issue { identifier title } }
        }
      }
    }`,
    { id: issueUuid },
  );
  if (!data.issue) return { parent: null, milestone: null, relations: [] };
  const relations: LinearRelation[] = [];
  for (const r of data.issue.relations?.nodes ?? []) {
    if (r.relatedIssue) {
      relations.push({
        type: r.type,
        identifier: r.relatedIssue.identifier,
        title: r.relatedIssue.title,
        direction: "out",
      });
    }
  }
  for (const r of data.issue.inverseRelations?.nodes ?? []) {
    if (r.issue) {
      relations.push({
        type: r.type,
        identifier: r.issue.identifier,
        title: r.issue.title,
        direction: "in",
      });
    }
  }
  return {
    parent: data.issue.parent?.identifier ?? null,
    milestone: data.issue.projectMilestone?.name ?? null,
    relations,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Body / comment formatting
// ─────────────────────────────────────────────────────────────────────────────

function fmtDate(iso: string): string {
  // CSV format: "Mon Apr 27 2026 05:01:03 GMT+0000 (GMT+00:00)" or ISO.
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toISOString().slice(0, 10);
}

function buildIssueBody(row: CsvRow, linearUrlKey: string, parentGhNumber: number | null): string {
  const id = row.ID;
  const linearUrl = `https://linear.app/${linearUrlKey}/issue/${id}`;
  const meta: string[] = [
    `**Linear:** [${id}](${linearUrl})`,
    `**Created:** ${fmtDate(row.Created)}`,
  ];
  if (row.Assignee) meta.push(`**Linear assignee:** ${row.Assignee}`);
  if (row.Creator && row.Creator !== row.Assignee) meta.push(`**Linear creator:** ${row.Creator}`);
  if (row["Parent issue"]) {
    const ref = parentGhNumber ? `#${parentGhNumber}` : row["Parent issue"];
    meta.push(`**Parent:** ${ref}`);
  }
  if (row["Cycle Name"]) meta.push(`**Cycle:** ${row["Cycle Name"]}`);
  if (row["Due Date"]) meta.push(`**Due:** ${row["Due Date"]}`);

  return [
    `<!-- linear-import: ${id} -->`,
    meta.join(" · "),
    "",
    "---",
    "",
    row.Description?.trim() || "_(no description)_",
  ].join("\n");
}

function buildCommentBody(c: LinearComment): string {
  const who = c.user?.displayName ?? c.user?.name ?? c.user?.email ?? "unknown";
  return [
    `<!-- linear-comment: ${c.id} -->`,
    `**@${who} (Linear, ${fmtDate(c.createdAt)}):**`,
    "",
    c.body.trim(),
  ].join("\n");
}

// ─────────────────────────────────────────────────────────────────────────────
// Links block — embeds Linear blocks/blocked-by/related/duplicate refs in body
// between idempotency markers so re-runs replace cleanly.
// ─────────────────────────────────────────────────────────────────────────────

const LINKS_START = "<!-- linear-links-start -->";
const LINKS_END = "<!-- linear-links-end -->";
const LINKS_STRIP_RE = /\n*<!-- linear-links-start -->[\s\S]*?<!-- linear-links-end -->\n*/g;

function renderLinksBlock(
  relations: LinearRelation[],
  identifierToGh: Map<string, GhIssueLite>,
  linearUrlKey: string,
): string | null {
  if (!relations.length) return null;
  const buckets: Record<string, Array<{ identifier: string; title: string }>> = {
    Blocks: [],
    "Blocked by": [],
    Related: [],
    "Duplicate of": [],
    "Duplicated by": [],
  };
  for (const r of relations) {
    let bucket: string | null = null;
    if (r.type === "blocks") bucket = r.direction === "out" ? "Blocks" : "Blocked by";
    else if (r.type === "related") bucket = "Related";
    else if (r.type === "duplicate")
      bucket = r.direction === "out" ? "Duplicate of" : "Duplicated by";
    if (!bucket) continue;
    if (!buckets[bucket].some((e) => e.identifier === r.identifier)) {
      buckets[bucket].push({ identifier: r.identifier, title: r.title });
    }
  }
  const lines: string[] = [];
  for (const [label, items] of Object.entries(buckets)) {
    if (!items.length) continue;
    const refs = items
      .sort((a, b) => a.identifier.localeCompare(b.identifier))
      .map((i) => {
        const ghRef = identifierToGh.get(i.identifier);
        const linearUrl = `https://linear.app/${linearUrlKey}/issue/${i.identifier}`;
        return ghRef
          ? `#${ghRef.number} ([${i.identifier}](${linearUrl}))`
          : `[${i.identifier}](${linearUrl}) _(not imported)_`;
      });
    lines.push(`- **${label}:** ${refs.join(", ")}`);
  }
  if (!lines.length) return null;
  return [LINKS_START, "**Links:**", "", ...lines, LINKS_END].join("\n");
}

function applyLinksBlock(
  body: string,
  block: string | null,
  transformBase?: (s: string) => string,
): string {
  let cleaned = body.replace(LINKS_STRIP_RE, "\n").trimEnd();
  if (transformBase) cleaned = transformBase(cleaned);
  if (!block) return cleaned;
  return `${cleaned}\n\n${block}\n`;
}

// Rewrite Linear BAR-N references to GitHub `#N` cross-refs where the target
// is already imported. Handles three forms:
//   1. `[BAR-N](https://linear.app/...)` — markdown link rendered from Linear export
//   2. `<issue id="…">BAR-N</issue>` — Linear's raw API tag form
//   3. bare `BAR-N` text
// Skips: HTML comments (so `<!-- linear-import: BAR-N -->` markers survive),
//        fenced + inline code blocks, the row's own self-reference.
// Unimported references keep their original Linear link (markdown form) or
// fall back to plain `BAR-N` (tag form stripped of XML wrapper).
function rewriteBarRefs(
  text: string,
  importedByLinearId: Map<string, GhIssueLite>,
  currentId: string | null,
): string {
  if (!text) return text;
  const masks: string[] = [];
  const mask = (m: string) => {
    masks.push(m);
    return `\x00M${masks.length - 1}\x00`;
  };
  let out = text;
  out = out.replace(/<!--[\s\S]*?-->/g, mask);
  out = out.replace(/```[\s\S]*?```/g, mask);
  out = out.replace(/`[^`\n]+`/g, mask);

  const sub = (barId: string, original: string, fallback?: string): string => {
    if (barId === currentId) return original;
    const gh = importedByLinearId.get(barId);
    if (gh) return `#${gh.number}`;
    return fallback ?? original;
  };

  out = out.replace(/\[(BAR-\d+)\]\(https:\/\/linear\.app\/[^)]+\)/g, (m, barId) => sub(barId, m));
  out = out.replace(/<issue\s+id="[^"]+">(BAR-\d+)<\/issue>/g, (m, barId) => sub(barId, m, barId));
  out = out.replace(/(?<![/\w])(BAR-\d+)(?!\w)/g, (m, barId) => sub(barId, m));

  // Collapse `#N (#N)` (e.g. "**Parent:** #80 (BAR-199)" → "#80 (#80)" after
  // rewrite) to `#N`.
  out = out.replace(/#(\d+)\s*\(\s*#\1\s*\)/g, "#$1");

  out = out.replace(/\x00M(\d+)\x00/g, (_, i) => masks[Number(i)]);
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// GH writes
// ─────────────────────────────────────────────────────────────────────────────

async function createIssue(
  title: string,
  body: string,
  labels: string[],
  milestone: number | null,
): Promise<{ number: number; nodeId: string }> {
  const payload: Record<string, unknown> = { title, body, labels };
  if (milestone !== null) payload.milestone = milestone;
  const resp = await gh<any>(`/repos/${OWNER}/${REPO_NAME}/issues`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return { number: resp.number, nodeId: resp.node_id };
}

async function closeIssue(issueNumber: number, reason: "completed" | "not_planned"): Promise<void> {
  try {
    await gh(`/repos/${OWNER}/${REPO_NAME}/issues/${issueNumber}`, {
      method: "PATCH",
      body: JSON.stringify({ state: "closed", state_reason: reason }),
    });
  } catch (err) {
    // The project's "Auto-close issue" workflow may already have closed the
    // issue when we set Status=Done, which makes our PATCH return a benign
    // 422. Re-fetch the issue; if it's already in the target state, succeed.
    const cur = await gh<any>(`/repos/${OWNER}/${REPO_NAME}/issues/${issueNumber}`);
    if (cur.state === "closed" && cur.state_reason === reason) return;
    throw err;
  }
}

async function postComment(issueNumber: number, body: string): Promise<void> {
  await gh(`/repos/${OWNER}/${REPO_NAME}/issues/${issueNumber}/comments`, {
    method: "POST",
    body: JSON.stringify({ body }),
  });
}

async function patchComment(commentId: number, body: string): Promise<void> {
  await gh(`/repos/${OWNER}/${REPO_NAME}/issues/comments/${commentId}`, {
    method: "PATCH",
    body: JSON.stringify({ body }),
  });
}

async function patchIssue(issueNumber: number, payload: Record<string, unknown>): Promise<void> {
  await gh(`/repos/${OWNER}/${REPO_NAME}/issues/${issueNumber}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

const milestoneCache = new Map<string, number>();
let milestonesLoaded = false;
async function loadMilestones(): Promise<void> {
  if (milestonesLoaded) return;
  let page = 1;
  while (true) {
    const list = await gh<any[]>(
      `/repos/${OWNER}/${REPO_NAME}/milestones?state=all&per_page=100&page=${page}`,
    );
    for (const m of list) milestoneCache.set(m.title, m.number);
    if (list.length < 100) break;
    page++;
  }
  milestonesLoaded = true;
}

async function ensureMilestone(title: string): Promise<number | null> {
  await loadMilestones();
  if (milestoneCache.has(title)) return milestoneCache.get(title)!;
  if (!APPLY) return null;
  const created = await gh<any>(`/repos/${OWNER}/${REPO_NAME}/milestones`, {
    method: "POST",
    body: JSON.stringify({ title }),
  });
  milestoneCache.set(title, created.number);
  return created.number;
}

async function addSubIssueLink(
  parentNodeId: string,
  childNodeId: string,
): Promise<"added" | "already" | "unsupported"> {
  try {
    await ghGraphql(
      `mutation($parent: ID!, $child: ID!) {
        addSubIssue(input: { issueId: $parent, subIssueId: $child }) {
          issue { id }
        }
      }`,
      { parent: parentNodeId, child: childNodeId },
    );
    return "added";
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    // Idempotency: already linked → fine.
    if (/already/i.test(msg)) return "already";
    // Repo may not have sub-issues enabled (older repos / certain plans).
    if (/not.*support|disabled|unknown.*type|addSubIssue/i.test(msg) && /not/i.test(msg))
      return "unsupported";
    throw err;
  }
}

async function addToProject(project: ProjectMeta, issueNodeId: string): Promise<string> {
  const data = await ghGraphql<any>(
    `mutation($projectId: ID!, $contentId: ID!) {
      addProjectV2ItemById(input: { projectId: $projectId, contentId: $contentId }) {
        item { id }
      }
    }`,
    { projectId: project.id, contentId: issueNodeId },
  );
  return data.addProjectV2ItemById.item.id;
}

async function setSingleSelect(
  project: ProjectMeta,
  itemId: string,
  fieldId: string,
  optionId: string,
): Promise<void> {
  await ghGraphql(
    `mutation($projectId: ID!, $itemId: ID!, $fieldId: ID!, $optionId: String!) {
      updateProjectV2ItemFieldValue(input: {
        projectId: $projectId, itemId: $itemId, fieldId: $fieldId,
        value: { singleSelectOptionId: $optionId }
      }) { projectV2Item { id } }
    }`,
    { projectId: project.id, itemId, fieldId, optionId },
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────

function die(msg: string): never {
  console.error(`✗ ${msg}`);
  process.exit(1);
}

function log(msg: string): void {
  console.log(msg);
}

async function main(): Promise<void> {
  log(`mode: ${APPLY ? "APPLY (writes)" : "DRY-RUN"}`);
  log(
    `repo: ${REPO}   project: ${PROJECT_TITLE}   linear-project: ${LINEAR_PROJECT}   csv: ${CSV_PATH}`,
  );

  const csvText = await readFile(CSV_PATH, "utf8");
  const allRows = csvToObjects(parseCsv(csvText));
  // Linear CSV exports leave Project blank on sub-issues that inherit their
  // project from a parent. Walks the parent chain so every descendant of a
  // LINEAR_PROJECT issue is included.
  const includedIds = new Set<string>(
    allRows.filter((r) => r.Project === LINEAR_PROJECT).map((r) => r.ID),
  );
  const directMatchCount = includedIds.size;
  let added = true;
  while (added) {
    added = false;
    for (const r of allRows) {
      if (includedIds.has(r.ID)) continue;
      const parent = r["Parent issue"];
      if (parent && includedIds.has(parent)) {
        includedIds.add(r.ID);
        added = true;
      }
    }
  }
  const inheritedCount = includedIds.size - directMatchCount;
  let rows = allRows.filter((r) => includedIds.has(r.ID));
  if (ONLY.length) rows = rows.filter((r) => ONLY.includes(r.ID));
  rows.sort((a, b) => barNum(a.ID) - barNum(b.ID));
  if (Number.isFinite(LIMIT)) rows = rows.slice(0, LIMIT);
  log(
    `rows to process: ${rows.length} (direct Project=${LINEAR_PROJECT}: ${directMatchCount}, inherited via parent: ${inheritedCount})\n`,
  );

  log("discovering GH project + Linear org…");
  const [project, linearOrg] = await Promise.all([findProject(), findLinearOrg()]);
  log(`  project: ${project.url}`);
  log(`  status options: ${[...project.statusOptions.keys()].join(", ")}`);
  log(`  priority options: ${[...project.priorityOptions.keys()].join(", ") || "(none)"}`);
  log(`  linear org urlKey: ${linearOrg.urlKey}\n`);

  log("scanning existing GH issues for prior imports…");
  await scanExistingIssues();
  log(`  already imported: ${importedByLinearId.size}\n`);

  // Pre-validate status mappings
  for (const [linearStatus, m] of Object.entries(STATUS_MAP)) {
    if (!project.statusOptions.has(m.gh)) {
      die(
        `Status mapping ${linearStatus}→${m.gh} not found on board (options: ${[...project.statusOptions.keys()].join(", ")})`,
      );
    }
  }

  // Collect labels to ensure
  const allLabelsNeeded = new Set<string>();
  for (const r of rows) {
    for (const lbl of (r.Labels || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)) {
      if (LABEL_SKIPLIST.has(lbl)) continue;
      allLabelsNeeded.add(lbl);
    }
  }
  log(`labels to ensure: ${[...allLabelsNeeded].join(", ") || "(none)"}`);
  for (const lbl of allLabelsNeeded) await ensureLabel(lbl);
  log("");

  let createdCount = 0;
  let skippedCount = 0;
  let commentsAdded = 0;
  let commentsPatched = 0;
  let subIssueLinksAdded = 0;
  let milestonesAssigned = 0;
  let bodiesPatched = 0;
  let failed: { id: string; err: string }[] = [];

  for (const row of rows) {
    const id = row.ID;
    const statusMap = STATUS_MAP[row.Status];
    if (!statusMap) {
      log(`[${id}] ⚠ unknown Linear status "${row.Status}" — skipping`);
      continue;
    }
    const ghStatus = statusMap.gh;
    const closeReason = statusMap.close;
    const priorityName = PRIORITY_MAP[row.Priority] ?? null;
    const labels = (row.Labels || "")
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s && !LABEL_SKIPLIST.has(s));

    const existing = importedByLinearId.get(id);
    const action = existing ? "SYNC" : "CREATE";

    log(`[${id}] ${row.Title}`);
    log(`  status: ${row.Status} → ${ghStatus}${closeReason ? ` (close: ${closeReason})` : ""}`);
    log(`  priority: ${row.Priority} → ${priorityName ?? "(unset)"}`);
    log(`  labels: ${labels.join(", ") || "(none)"}`);
    log(`  action: ${action}${existing ? ` (issue #${existing.number})` : ""}`);

    try {
      let issueNumber: number;
      let issueNodeId: string;

      // Fetch Linear extras early — used for milestone (create-time) and
      // links block (body composition).
      const extras = await fetchLinearExtras(row.UUID);
      const milestoneNumber = extras.milestone ? await ensureMilestone(extras.milestone) : null;
      log(`  milestone: ${extras.milestone ?? "(none)"}`);
      if (extras.relations.length) {
        const summary = extras.relations
          .map((r) => `${r.type}${r.direction === "in" ? "←" : "→"}${r.identifier}`)
          .join(", ");
        log(`  relations: ${summary}`);
      }

      const parentGh = row["Parent issue"] ? importedByLinearId.get(row["Parent issue"]) : null;
      const baseBody = buildIssueBody(row, linearOrg.urlKey, parentGh?.number ?? null);
      const linksBlock = renderLinksBlock(extras.relations, importedByLinearId, linearOrg.urlKey);
      const rewriteFn = (s: string) => rewriteBarRefs(s, importedByLinearId, id);

      if (existing) {
        issueNumber = existing.number;
        issueNodeId = existing.nodeId;
        skippedCount++;
        // Body: preserve any post-import edits — only rewrite BAR refs (outside
        // code blocks + HTML comments + the row's own self-reference) and
        // replace the links block. Anything else the user edited survives.
        const desiredBody = applyLinksBlock(existing.body, linksBlock, rewriteFn);
        if (APPLY && desiredBody !== existing.body) {
          await patchIssue(issueNumber, { body: desiredBody });
          existing.body = desiredBody;
          bodiesPatched++;
          log(`  → patched body (links block / BAR refs)`);
        }
        // Milestone: only set when Linear has one AND it differs from current.
        if (APPLY && milestoneNumber !== null && existing.milestoneNumber !== milestoneNumber) {
          await patchIssue(issueNumber, { milestone: milestoneNumber });
          existing.milestoneNumber = milestoneNumber;
          milestonesAssigned++;
          log(`  → set milestone "${extras.milestone}"`);
        }
      } else if (APPLY) {
        const fullBody = applyLinksBlock(baseBody, linksBlock, rewriteFn);
        const created = await createIssue(row.Title, fullBody, labels, milestoneNumber);
        issueNumber = created.number;
        issueNodeId = created.nodeId;
        importedByLinearId.set(id, {
          number: issueNumber,
          body: fullBody,
          nodeId: issueNodeId,
          state: "open",
          milestoneNumber,
        });
        if (milestoneNumber !== null) milestonesAssigned++;
        const itemId = await addToProject(project, issueNodeId);
        await setSingleSelect(
          project,
          itemId,
          project.statusFieldId,
          project.statusOptions.get(ghStatus)!,
        );
        if (priorityName && project.priorityFieldId && project.priorityOptions.has(priorityName)) {
          await setSingleSelect(
            project,
            itemId,
            project.priorityFieldId,
            project.priorityOptions.get(priorityName)!,
          );
        }
        if (closeReason) await closeIssue(issueNumber, closeReason);
        createdCount++;
        log(`  → created #${issueNumber}`);
      } else {
        log(
          `  → would create issue, add to project, set Status=${ghStatus}` +
            (priorityName ? `, Priority=${priorityName}` : "") +
            (closeReason ? `, close as ${closeReason}` : "") +
            (milestoneNumber !== null ? `, milestone=${extras.milestone}` : ""),
        );
        issueNumber = -1;
        issueNodeId = "";
      }

      // Sub-issue link to parent (idempotent — re-runs no-op).
      const parentEntry = extras.parent ? importedByLinearId.get(extras.parent) : null;
      if (parentEntry && APPLY && issueNumber > 0 && issueNodeId) {
        const result = await addSubIssueLink(parentEntry.nodeId, issueNodeId);
        if (result === "added") {
          subIssueLinksAdded++;
          log(`  → linked as sub-issue of #${parentEntry.number}`);
        } else if (result === "unsupported" && VERBOSE) {
          log(`  (sub-issues not supported on this repo)`);
        }
      } else if (extras.parent && !parentEntry) {
        log(`  ⚠ parent ${extras.parent} not imported — sub-issue link skipped`);
      } else if (extras.parent && !APPLY) {
        log(
          `  → would link as sub-issue of ${extras.parent} (#${importedByLinearId.get(extras.parent)?.number ?? "?"})`,
        );
      }

      // Comments
      const linearComments = await fetchLinearComments(row.UUID);
      let existingComments: ImportedGhComment[] = [];
      if (issueNumber > 0) existingComments = await existingLinearComments(issueNumber);
      const existingUuids = new Set(existingComments.map((c) => c.uuid));
      const toPost = linearComments.filter((c) => !existingUuids.has(c.id));
      log(`  comments: ${linearComments.length} total, ${toPost.length} to post`);
      if (APPLY && issueNumber > 0) {
        for (const c of toPost) {
          await postComment(issueNumber, rewriteFn(buildCommentBody(c)));
          commentsAdded++;
        }
        if (toPost.length) log(`  → posted ${toPost.length} comments`);
        // Back-fill BAR-ref rewrites on previously-imported comments.
        for (const c of existingComments) {
          const rewritten = rewriteFn(c.body);
          if (rewritten !== c.body) {
            await patchComment(c.numericId, rewritten);
            c.body = rewritten;
            commentsPatched++;
          }
        }
      } else if (toPost.length && VERBOSE) {
        for (const c of toPost)
          log(
            `    [comment] ${fmtDate(c.createdAt)} ${c.user?.displayName ?? c.user?.name ?? "?"}: ${c.body.slice(0, 60).replace(/\n/g, " ")}…`,
          );
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      log(`  ✗ ERROR: ${msg}`);
      failed.push({ id, err: msg });
    }
    log("");
  }

  log("─".repeat(60));
  log(`summary: ${APPLY ? "APPLIED" : "DRY-RUN"}`);
  log(`  created: ${createdCount}`);
  log(`  already-imported (skipped create): ${skippedCount}`);
  log(`  sub-issue links added: ${subIssueLinksAdded}`);
  log(`  milestones assigned: ${milestonesAssigned}`);
  log(`  bodies patched (links block / BAR refs): ${bodiesPatched}`);
  log(`  comments posted: ${commentsAdded}`);
  log(`  comments patched (BAR refs): ${commentsPatched}`);
  log(`  failed: ${failed.length}`);
  for (const f of failed) log(`    - ${f.id}: ${f.err}`);
  if (!APPLY) log(`\n(run with --apply to write)`);
}

function barNum(id: string): number {
  const m = id.match(/(\d+)$/);
  return m ? Number(m[1]) : 0;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
