import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  ARCHIVE_SHARD_TEMPLATE,
  MAX_ROWS_BEFORE_ROLLUP,
  SEVERITY_KINDS,
  TRIAGE_STATUSES,
  VALID_KINDS,
  VALID_SEVERITIES,
  parseRemoteUrlToSlug,
  resolveGitSha,
  resolveRepoSlug,
  appendLine,
  buildSummary,
  fold,
  foldFrom,
  identity,
  parse,
  validate,
  type TelemetryEvent,
} from "./bkit-telemetry";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function baseEnvelope(
  kind: TelemetryEvent["kind"],
  overrides: Partial<TelemetryEvent> = {},
): TelemetryEvent {
  const base = {
    ts: 1_700_000_000_000,
    kind,
    repo: "cbartens/bkit",
    bkitVersion: "4.1.4",
    workflow: "build",
    step: "build-close-workflow",
  };
  return { ...base, ...overrides } as TelemetryEvent;
}

function complianceEvent(overrides: Partial<TelemetryEvent> = {}): TelemetryEvent {
  return {
    ...baseEnvelope("compliance"),
    rule: "no-mirror-edit",
    result: "pass",
    phase: "build",
    parentSha: "abc123",
    ...overrides,
  } as TelemetryEvent;
}

function outcomeEvent(overrides: Partial<TelemetryEvent> = {}): TelemetryEvent {
  return {
    ...baseEnvelope("outcome"),
    prNumber: 42,
    linesAdded: 100,
    linesDeleted: 20,
    linesChanged: 120,
    filesChanged: 5,
    taskCount: 9,
    durationSeconds: 3600,
    deferrals: 0,
    failures: 0,
    ...overrides,
  } as TelemetryEvent;
}

function counterEvent(overrides: Partial<TelemetryEvent> = {}): TelemetryEvent {
  return {
    ...baseEnvelope("counter"),
    counterName: "verifyAttempt",
    counterValue: 1,
    parentSha: "abc123",
    counterSource: "model-self-report" as const,
    ...overrides,
  } as TelemetryEvent;
}

function frictionEvent(key: string, overrides: Partial<TelemetryEvent> = {}): TelemetryEvent {
  return {
    ...baseEnvelope("friction"),
    key,
    category: "agent-rework" as const,
    scope: "bkit-repo" as const,
    severity: "MEDIUM" as const,
    description: "agent reworked step 3",
    ...overrides,
  } as TelemetryEvent;
}

function deferralEvent(key: string, overrides: Partial<TelemetryEvent> = {}): TelemetryEvent {
  return {
    ...baseEnvelope("deferral"),
    key,
    type: "issue" as const,
    category: "agentic",
    severity: "LOW" as const,
    description: "deferred for later",
    ...overrides,
  } as TelemetryEvent;
}

function failureEvent(key: string, overrides: Partial<TelemetryEvent> = {}): TelemetryEvent {
  return {
    ...baseEnvelope("failure"),
    key,
    severity: "HIGH" as const,
    description: "found a bug",
    ...overrides,
  } as TelemetryEvent;
}

function decisionEvent(key: string, overrides: Partial<TelemetryEvent> = {}): TelemetryEvent {
  return {
    ...baseEnvelope("decision"),
    key,
    summary: "chose the boring option",
    ...overrides,
  } as TelemetryEvent;
}

// ---------------------------------------------------------------------------
// identity() — per-kind composite tuple tests
// ---------------------------------------------------------------------------

describe("identity — per-kind composite tuples", () => {
  it("compliance: keyed by (repo, workflow, parentSha, rule)", () => {
    const e = complianceEvent();
    const id = identity(e);
    expect(id).toBe("compliance cbartens/bkit build abc123 no-mirror-edit");
  });

  it("outcome: keyed by (repo, prNumber)", () => {
    const e = outcomeEvent();
    expect(identity(e)).toBe("outcome cbartens/bkit 42");
  });

  it("counter: keyed by (repo, workflow, parentSha, counterName)", () => {
    const e = counterEvent();
    expect(identity(e)).toBe("counter cbartens/bkit build abc123 verifyAttempt");
  });

  it("friction: keyed by (kind, repo, key)", () => {
    const e = frictionEvent("friction-key-1");
    expect(identity(e)).toBe("friction cbartens/bkit friction-key-1");
  });

  it("deferral: keyed by (kind, repo, key)", () => {
    const e = deferralEvent("deferred-item-1");
    expect(identity(e)).toBe("deferral cbartens/bkit deferred-item-1");
  });

  it("failure: keyed by (kind, repo, key)", () => {
    const e = failureEvent("bug-key-1");
    expect(identity(e)).toBe("failure cbartens/bkit bug-key-1");
  });

  it("composite tuple is DISTINCT from bare ts — same ts, different key → different identity", () => {
    const ts = 1_700_000_000_000;
    const e1 = complianceEvent({ ts, rule: "no-mirror-edit" } as Partial<TelemetryEvent>);
    const e2 = complianceEvent({ ts, rule: "skip-ci-not-head" } as Partial<TelemetryEvent>);
    // Same ts, different composite key
    expect(e1.ts).toBe(e2.ts);
    expect(identity(e1)).not.toBe(identity(e2));
  });
});

// ---------------------------------------------------------------------------
// validate() — A2-mandatory fields + kind validation
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// severity — required on the triaged kinds, rejected elsewhere (#234)
//
// Regression guard: severity was specified in the #234 issue body AND design
// (line 401, "MUST carry"), reached zero of the five plan files, and shipped as
// a dead optional envelope field no writer ever emitted. These tests are what
// make its absence loud instead of silent.
// ---------------------------------------------------------------------------

describe("severity — per-kind requirement + closed enum", () => {
  it.each(["friction", "deferral", "failure"] as const)("%s carries severity", (kind) => {
    expect(SEVERITY_KINDS.has(kind)).toBe(true);
  });

  it.each(["compliance", "outcome", "counter", "knowledge", "decision"] as const)(
    "%s does NOT carry severity",
    (kind) => {
      expect(SEVERITY_KINDS.has(kind)).toBe(false);
    },
  );

  it("VALID_SEVERITIES is exactly CRITICAL|HIGH|MEDIUM|LOW", () => {
    expect([...VALID_SEVERITIES].sort()).toEqual(["CRITICAL", "HIGH", "LOW", "MEDIUM"]);
  });

  it.each(["CRITICAL", "HIGH", "MEDIUM", "LOW"] as const)("accepts severity %s", (severity) => {
    expect(validate(deferralEvent("k", { severity } as Partial<TelemetryEvent>)).ok).toBe(true);
  });

  it.each(["friction", "deferral", "failure"] as const)(
    "rejects a %s row with severity missing",
    (kind) => {
      const e = { ...baseEnvelope(kind), key: "k", description: "d" } as TelemetryEvent;
      const r = validate(e);
      expect(r.ok).toBe(false);
      expect(r.reason).toContain("severity");
    },
  );

  // The old critical|normal|low scale is retired — accepting it would silently
  // resurrect the vocabulary whose distribution collapsed to its default.
  it.each(["low", "normal", "critical", "blocker", "advisory", "Critical", ""])(
    "rejects off-enum severity %j",
    (severity) => {
      const r = validate({ ...deferralEvent("k"), severity });
      expect(r.ok).toBe(false);
    },
  );

  it("rejects severity on a kind that must not carry it", () => {
    const r = validate({ ...complianceEvent(), severity: "HIGH" });
    expect(r.ok).toBe(false);
    expect(r.reason).toContain("do not carry severity");
  });

  it.each(["OPEN", "TRIAGED", "CLOSED"])("accepts triage status %j on the severity kinds", (s) => {
    expect(validate({ ...deferralEvent("k"), status: s }).ok).toBe(true);
  });

  // The free-text statuses the legacy corpus carried (`WORKED_AROUND`, `Resolving`,
  // a whole sentence) are exactly what this gate stops being written again.
  it.each(["WORKED_AROUND", "Resolving", "resolved", "open", "ACTIVE", ""])(
    "rejects off-ladder status %j on a severity kind",
    (status) => {
      const r = validate({ ...deferralEvent("k"), status });
      expect(r.ok).toBe(false);
      expect(r.reason).toContain("OPEN|TRIAGED|CLOSED");
    },
  );

  // decision is a different axis — the triage ladder must not leak onto it.
  it.each(["ACTIVE", "SUPERSEDED"])("accepts decision status %j", (s) => {
    expect(validate({ ...decisionEvent("k"), status: s }).ok).toBe(true);
  });

  it.each(["OPEN", "CLOSED", "TRIAGED"])("rejects triage status %j on a decision", (status) => {
    const r = validate({ ...decisionEvent("k"), status });
    expect(r.ok).toBe(false);
    expect(r.reason).toContain("ACTIVE|SUPERSEDED");
  });

  it("rejects status on a kind that must not carry it", () => {
    const r = validate({ ...complianceEvent(), status: "OPEN" });
    expect(r.ok).toBe(false);
    expect(r.reason).toContain("do not carry status");
  });

  // parse() stays tolerant: 3 legacy rows carry free-text statuses and must still read.
  it("parse still reads legacy free-text status rows", () => {
    const legacy = JSON.stringify({
      ts: 1_700_000_000_000,
      kind: "friction",
      repo: "cbartens/bkit",
      bkitVersion: "4.2.2",
      step: "bkit-telemetry-migrate",
      key: "legacy-free-text-status",
      description: "d",
      status: "WORKED_AROUND",
    });
    const res = parse(legacy);
    expect(res.malformedLineCount).toBe(0);
    expect(res.events).toHaveLength(1);
  });

  // parse() must stay tolerant: the 44 rows written before this landed have no
  // severity and must still read. validate() gates writes only (appendLine).
  it("parse still reads pre-severity rows", () => {
    const legacy = JSON.stringify({
      ts: 1_700_000_000_000,
      kind: "deferral",
      repo: "cbartens/bkit",
      bkitVersion: "4.2.2",
      workflow: "migrate",
      step: "bkit-telemetry-migrate",
      key: "pending-factory-reset-uninstall-mode",
      type: "feature",
      category: "agentic",
      description: "Factory-reset uninstall mode",
      status: "OPEN",
    });
    const res = parse(legacy);
    expect(res.malformedLineCount).toBe(0);
    expect(res.events).toHaveLength(1);
    expect(res.events[0]!.key).toBe("pending-factory-reset-uninstall-mode");
  });
});

// The spec previously said "skip if an identity-matching row already exists",
// which forbade the same-key append the instinct loop is built on — so no ledger
// ever accumulated a second same-key row and confidence/lastConfirmed/
// recurrenceCount stayed permanently unpopulated. Updating is an APPEND.
describe("updating a row — supersede by same-key append", () => {
  it("a later same-key row wins the fold; the earlier one stays as history", () => {
    const logged = frictionEvent("ship-blocked-by-hook", {
      ts: 1_700_000_000_000,
      status: "OPEN",
    } as Partial<TelemetryEvent>);
    const closed = frictionEvent("ship-blocked-by-hook", {
      ts: 1_700_000_009_999,
      status: "CLOSED",
      remediation: "commit via a temp branch, then FF-merge dev",
      recurrenceCount: 2,
    } as Partial<TelemetryEvent>);

    const state = fold([logged, closed]);
    expect(state.size).toBe(1);
    const current = [...state.values()][0] as TelemetryEvent & {
      status?: string;
      remediation?: string;
    };
    expect(current.status).toBe("CLOSED");
    expect(current.remediation).toBe("commit via a temp branch, then FF-merge dev");
    // both rows remain on disk — the history the instinct loop folds over
    expect([logged, closed]).toHaveLength(2);
  });

  it("fold is last-wins by ts, not by file order", () => {
    const newer = frictionEvent("k", { ts: 2_000, status: "CLOSED" } as Partial<TelemetryEvent>);
    const older = frictionEvent("k", { ts: 1_000, status: "OPEN" } as Partial<TelemetryEvent>);
    // pass out of order — ts must decide, not array position
    const state = fold([newer, older]);
    const current = [...state.values()][0] as TelemetryEvent & { status?: string };
    expect(current.status).toBe("CLOSED");
  });

  it("a reworded key forks the entry instead of updating it", () => {
    const a = frictionEvent("ship-blocked-by-hook", { ts: 1_000 } as Partial<TelemetryEvent>);
    const b = frictionEvent("ship-blocked-by-precommit-hook", {
      ts: 2_000,
    } as Partial<TelemetryEvent>);
    expect(fold([a, b]).size).toBe(2);
  });
});

// TRIAGED = analysed, disposition known, NOT fixed. It rides on exactly the kinds
// that carry severity, because both express the same property: these three describe
// open work someone triages. The trap it guards is a reader testing status=="OPEN"
// and silently retiring everything the moment a sweep looks at it.
describe("triage ladder — OPEN -> TRIAGED -> CLOSED", () => {
  it("TRIAGE_STATUSES is exactly OPEN|TRIAGED|CLOSED", () => {
    expect([...TRIAGE_STATUSES].sort()).toEqual(["CLOSED", "OPEN", "TRIAGED"]);
  });

  it("the triaged kinds are exactly the severity-carrying kinds", () => {
    // Same trio by construction — if these ever diverge, one of the two concepts
    // has been extended without the other and the spec is lying.
    expect([...SEVERITY_KINDS].sort()).toEqual(["deferral", "failure", "friction"]);
  });

  it("a triage sweep appends TRIAGED, and the entry stays open", () => {
    const raised = deferralEvent("k", { ts: 1_000, status: "OPEN" } as Partial<TelemetryEvent>);
    const triaged = deferralEvent("k", {
      ts: 2_000,
      status: "TRIAGED",
      references: ["#412"],
    } as Partial<TelemetryEvent>);
    const current = [...fold([raised, triaged]).values()][0] as TelemetryEvent & {
      status?: string;
    };
    expect(current.status).toBe("TRIAGED");
    expect(current.references).toEqual(["#412"]);
  });
});

// The spec's examples are what agents copy — they are the schema in practice.
// An example that silently drifts from the codec teaches the wrong shape to every
// writer, which is precisely how `severity` and `references` were lost: present in
// the type, absent from what anyone read. Validate them through the REAL codec
// rather than eyeballing, so the examples cannot rot again.
describe("jsonl.md examples — validated against the codec", () => {
  const SPEC = path.resolve(import.meta.dirname, "..", "jsonl.md");

  /** Pull every balanced JSON object out of the spec's ```jsonl fences. */
  function specExamples(): Array<Record<string, unknown>> {
    const src = fs.readFileSync(SPEC, "utf-8");
    const fences = [...src.matchAll(/```jsonl\n([\s\S]*?)```/g)].map((m) => m[1] ?? "");
    const out: Array<Record<string, unknown>> = [];
    for (const fence of fences) {
      let depth = 0;
      let buf = "";
      for (const ch of fence) {
        if (ch === "{") depth++;
        if (depth > 0) buf += ch;
        if (ch === "}") {
          depth--;
          if (depth === 0) {
            out.push(JSON.parse(buf) as Record<string, unknown>);
            buf = "";
          }
        }
      }
    }
    return out;
  }

  it("every full example row is a valid event", () => {
    const examples = specExamples();
    expect(examples.length).toBeGreaterThan(5);
    for (const ex of examples) {
      // The § Updating a Row walkthrough trims the envelope for readability and
      // says so; only full rows are held to validate().
      if (!ex["repo"]) continue;
      const r = validate(ex);
      expect(r.ok, `${String(ex["kind"])} example invalid: ${r.reason}`).toBe(true);
    }
  });

  it("every kind has a worked example", () => {
    const kinds = new Set(specExamples().map((e) => e["kind"]));
    for (const kind of VALID_KINDS) expect(kinds, `no example for kind: ${kind}`).toContain(kind);
  });

  // step = WHERE, subagent = WHO, model = the subagent's own pin. They were
  // collapsed: `step` held agent names on most rows while `subagent` sat empty on
  // all 141, costing the harvest two of its five dimensions.
  it("no example puts an agent name in step", () => {
    for (const ex of specExamples()) {
      const step = ex["step"];
      if (typeof step !== "string") continue;
      expect(step.startsWith("bkit-"), `step "${step}" is an agent name, not a step`).toBe(false);
    }
  });

  it("model appears exactly where subagent does — never on an orchestrator row", () => {
    for (const ex of specExamples()) {
      if (!ex["repo"]) continue;
      expect(Boolean(ex["model"]), `${String(ex["kind"])}: model must be set iff subagent is`).toBe(
        Boolean(ex["subagent"]),
      );
    }
  });

  it("the triaged kinds' examples carry severity and references", () => {
    for (const ex of specExamples()) {
      const kind = ex["kind"] as string;
      if (!ex["repo"] || !SEVERITY_KINDS.has(kind)) continue;
      expect(ex["severity"], `${kind} example lacks severity`).toBeDefined();
      // references is the one cross-entry pointer — an example omitting it teaches
      // writers to omit it, which is how the Related: graph evaporated.
      expect(ex["references"], `${kind} example lacks references`).toBeDefined();
    }
  });
});

// `repo` is in identity() for EVERY kind, so a respelled repo forks the entity —
// the same power `key` has, except `repo` is derived, not authored, so nobody
// notices. It was derived three different ways: package.json `name` (an npm name:
// `@cbartens/bkit`, one char off the slug), the filesystem path (making the owner
// a folder on the operator's laptop), and freehand by orchestrators.
describe("repo slug — one resolver, from the git remote", () => {
  it.each([
    ["https://github.com/owner/repo.git", "owner/repo"],
    ["https://github.com/owner/repo", "owner/repo"],
    ["git@github.com:owner/repo.git", "owner/repo"],
    ["ssh://git@github.com/owner/repo.git", "owner/repo"],
    ["  https://github.com/owner/repo.git\n", "owner/repo"],
  ])("parses %j -> %j", (url, slug) => {
    expect(parseRemoteUrlToSlug(url)).toBe(slug);
  });

  it.each(["", "not-a-url", "https://github.com/", "reponame"])(
    "returns empty rather than guessing for %j",
    (url) => {
      expect(parseRemoteUrlToSlug(url)).toBe("");
    },
  );

  // The report's two named regression vectors.
  it("a scoped npm package name must NEVER become the slug", () => {
    // `@cbartens/bkit` is package.json `name`. It is not a slug, and it is one
    // character from the real one — so the two spellings fork every entity.
    expect(parseRemoteUrlToSlug("@cbartens/bkit")).toBe("");
    expect(parseRemoteUrlToSlug("https://github.com/cbartens/bkit.git")).toBe("cbartens/bkit");
  });

  it("resolves this repo's real slug from its remote", () => {
    const root = path.resolve(import.meta.dirname, "..", "..");
    // Skip gracefully where there is no remote (fresh clone in CI without origin).
    const slug = resolveRepoSlug(root);
    if (!slug) return;
    expect(slug).toMatch(/^[^/@]+\/[^/]+$/);
    expect(slug.startsWith("@")).toBe(false);
  });

  it("returns empty for a directory that is not a git repo", () => {
    expect(resolveRepoSlug(os.tmpdir())).toBe("");
  });
});

// parentSha reached rows as the LITERAL "HEAD~1" on every compliance row bkit ever
// wrote. Two failures at once: the grader's diff guard rejects non-hex and returns
// an EMPTY diff (so every diff-based rule passed vacuously while the row still said
// "pass"), and parentSha is in identity(), so successive runs shared one identity
// and folded into each other.
describe("resolveGitSha — parentSha must be a real SHA before it reaches a row", () => {
  const REPO = path.resolve(import.meta.dirname, "..", "..");

  it("resolves a rev to a hex SHA the grader's guard accepts", () => {
    const sha = resolveGitSha("HEAD", REPO);
    if (!sha) return; // no commits (fresh CI clone) — nothing to assert
    expect(sha).toMatch(/^[0-9a-f]{7,40}$/);
  });

  it("never returns the rev it was given", () => {
    const sha = resolveGitSha("HEAD~1", REPO);
    if (!sha) return;
    expect(sha).not.toBe("HEAD~1");
  });

  it("gives DIFFERENT SHAs for different revs — so identity cannot collapse runs", () => {
    const head = resolveGitSha("HEAD", REPO);
    const parent = resolveGitSha("HEAD~1", REPO);
    if (!head || !parent) return;
    expect(head).not.toBe(parent);
  });

  it.each(["no-such-rev", "HEAD~99999", ""])("returns empty for unresolvable %j", (rev) => {
    expect(resolveGitSha(rev, REPO)).toBe("");
  });

  it("returns empty outside a git repo rather than throwing", () => {
    expect(resolveGitSha("HEAD", os.tmpdir())).toBe("");
  });
});

// ONE summary, called by every workflow close step via `bkit telemetry summary`.
// The five workflows each carried their own bash copy and every one was wrong:
//   grep -cvE '…' || echo 0   -> prints "0\n0" when NOTHING is malformed, because
//                                grep -c exits 1 on zero matches (the common case)
//   jq '.bkitVersion // "unknown"' -> buckets "" under an EMPTY key, since jq's //
//                                substitutes only on null/false
//   wc -l                     -> counts lines, not parsed rows
describe("buildSummary — the one telemetry summary", () => {
  let dir: string;
  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-summary-"));
  });
  afterEach(() => {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  function write(rows: TelemetryEvent[], extraLines: string[] = []): string {
    const p = path.join(dir, "stats.jsonl");
    fs.writeFileSync(p, [...rows.map((r) => JSON.stringify(r)), ...extraLines].join("\n") + "\n");
    return p;
  }

  it("names the unknown-version bucket instead of leaving it empty", () => {
    const s = buildSummary(
      foldFrom([
        write([
          counterEvent({ bkitVersion: "4.5.0", parentSha: "aaa" } as Partial<TelemetryEvent>),
          counterEvent({ bkitVersion: "", parentSha: "bbb" } as Partial<TelemetryEvent>),
        ]),
      ]),
    );
    // The bash printed `versions: =1, 4.5.0=1` — a nameless bucket.
    expect(s.versionCounts["unknown"]).toBe(1);
    expect(s.lines[0]).toContain("unknown=1");
    expect(s.lines[0]).not.toMatch(/versions: =/);
  });

  it("reports 0 malformed as a single 0 when nothing is malformed", () => {
    const s = buildSummary(foldFrom([write([counterEvent({ parentSha: "aaa" })])]));
    expect(s.malformedLineCount).toBe(0);
    expect(s.lines[0]).toContain("malformed: 0");
    expect(s.lines[0]).not.toContain("\n"); // the bash emitted "0\n0" here
  });

  it("counts malformed lines by parsing, not by regex", () => {
    // `{}` matches the bash guard /^\{.*\}$/ and would be counted VALID, but it is
    // not a telemetry row; a truncated line is what the count is actually for.
    const s = buildSummary(
      foldFrom([write([counterEvent({ parentSha: "aaa" })], ['{"ts":1,"kind":"coun'])]),
    );
    expect(s.malformedLineCount).toBe(1);
  });

  it("counts per-workflow ENTITIES, so an updated row is not counted twice", () => {
    const p = write([
      frictionEvent("k", { ts: 1_000, workflow: "ship" } as Partial<TelemetryEvent>),
      frictionEvent("k", {
        ts: 2_000,
        workflow: "ship",
        status: "CLOSED",
      } as Partial<TelemetryEvent>),
    ]);
    const s = buildSummary(foldFrom([p]), "ship");
    expect(s.rowCount).toBe(2); // two lines on disk
    expect(s.workflowCounts["ship"]).toBe(1); // one entity
    expect(s.lines.at(-1)).toContain("ship: 1");
  });

  it("omits the chain line when no workflow is given", () => {
    const s = buildSummary(foldFrom([write([counterEvent({ parentSha: "aaa" })])]));
    expect(s.lines.some((l) => l.includes("chain total"))).toBe(false);
  });
});

describe("validate — A2-mandatory envelope fields", () => {
  it("accepts a valid compliance event", () => {
    expect(validate(complianceEvent()).ok).toBe(true);
  });

  it("accepts a valid outcome event", () => {
    expect(validate(outcomeEvent()).ok).toBe(true);
  });

  it("accepts an outcome event with valid per-tier coverage", () => {
    const e = outcomeEvent({
      coverage: {
        unit: { lines: 83.1, branches: 71.2, functions: 78.4, statements: 82.7 },
        e2e: { branches: 40.1 },
      },
    } as Partial<TelemetryEvent>);
    expect(validate(e).ok).toBe(true);
  });

  it("rejects an outcome event with non-object coverage", () => {
    const bad: unknown = { coverage: 71 };
    const e = outcomeEvent(bad as Partial<TelemetryEvent>);
    expect(validate(e).ok).toBe(false);
  });

  it("rejects an outcome event with a non-numeric coverage metric", () => {
    const bad: unknown = { coverage: { unit: { branches: "high" } } };
    const e = outcomeEvent(bad as Partial<TelemetryEvent>);
    expect(validate(e).ok).toBe(false);
  });

  it("accepts a valid counter event", () => {
    expect(validate(counterEvent()).ok).toBe(true);
  });

  it("accepts a valid friction event", () => {
    expect(validate(frictionEvent("key-1")).ok).toBe(true);
  });

  it("accepts a valid deferral event", () => {
    expect(validate(deferralEvent("key-1")).ok).toBe(true);
  });

  it("accepts a valid failure event", () => {
    expect(validate(failureEvent("key-1")).ok).toBe(true);
  });

  // Per-field drop tests — each mandatory field individually removed
  for (const field of ["ts", "kind", "repo", "bkitVersion", "step"] as const) {
    it(`rejects event missing mandatory field: ${field}`, () => {
      const e = { ...complianceEvent() };
      delete (e as Record<string, unknown>)[field];
      const r = validate(e);
      expect(r.ok).toBe(false);
      expect(r.reason).toContain(field);
    });
  }

  it("rejects unknown kind", () => {
    const e = { ...complianceEvent(), kind: "unknown-kind" };
    const r = validate(e);
    expect(r.ok).toBe(false);
    expect(r.reason).toContain("unknown kind");
  });

  it("rejects non-object input", () => {
    expect(validate(null).ok).toBe(false);
    expect(validate("string").ok).toBe(false);
    expect(validate(42).ok).toBe(false);
  });

  it("rejects counter with invalid counterSource", () => {
    const e = { ...counterEvent(), counterSource: "bad-source" };
    expect(validate(e).ok).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// fold() — dedup by composite identity, last-ts-wins
// ---------------------------------------------------------------------------

describe("fold — composite-identity dedup", () => {
  it("folds same-key compliance rows to latest (higher ts)", () => {
    const e1 = complianceEvent({ ts: 1000 } as Partial<TelemetryEvent>);
    const e2 = complianceEvent({ ts: 2000, result: "fail" } as Partial<TelemetryEvent>);
    const state = fold([e1, e2]);
    expect(state.size).toBe(1);
    const val = state.get(identity(e1));
    expect(val).toBeDefined();
    expect((val as typeof e2).result).toBe("fail");
  });

  it("two same-ts same-key rows (merge=union duplicate) fold to ONE via composite identity", () => {
    const ts = 1_700_000_000_000;
    const e1 = complianceEvent({ ts } as Partial<TelemetryEvent>);
    const e2 = complianceEvent({ ts } as Partial<TelemetryEvent>);
    // Both have identical ts AND identical composite key
    expect(identity(e1)).toBe(identity(e2));
    const state = fold([e1, e2]);
    expect(state.size).toBe(1);
  });

  it("two same-ts DIFFERENT-key rows (same ts, different rule) → TWO entries", () => {
    const ts = 1_700_000_000_000;
    const e1 = complianceEvent({ ts, rule: "no-mirror-edit" } as Partial<TelemetryEvent>);
    const e2 = complianceEvent({ ts, rule: "skip-ci-not-head" } as Partial<TelemetryEvent>);
    // Same ts but different composite key — proves dedup is composite, NOT bare ts
    expect(e1.ts).toBe(e2.ts);
    expect(identity(e1)).not.toBe(identity(e2));
    const state = fold([e1, e2]);
    expect(state.size).toBe(2);
  });

  it("folds outcome rows by (repo, prNumber)", () => {
    const e1 = outcomeEvent({ ts: 1000, prNumber: 10 } as Partial<TelemetryEvent>);
    const e2 = outcomeEvent({
      ts: 2000,
      prNumber: 10,
      linesAdded: 999,
    } as Partial<TelemetryEvent>);
    const e3 = outcomeEvent({ ts: 3000, prNumber: 11 } as Partial<TelemetryEvent>);
    const state = fold([e1, e2, e3]);
    expect(state.size).toBe(2);
    const pr10 = state.get("outcome cbartens/bkit 10");
    expect((pr10 as typeof e2).linesAdded).toBe(999);
  });

  it("folds friction rows by (kind, repo, key)", () => {
    const e1 = frictionEvent("key-1", { ts: 1000, status: "OPEN" } as Partial<TelemetryEvent>);
    const e2 = frictionEvent("key-1", { ts: 2000, status: "RECOVERED" } as Partial<TelemetryEvent>);
    const state = fold([e1, e2]);
    expect(state.size).toBe(1);
    expect((state.get("friction cbartens/bkit key-1") as typeof e2).status).toBe("RECOVERED");
  });

  it("empty events → empty state", () => {
    expect(fold([]).size).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// parse() — tolerant reader (per-line try/catch, never throws)
// ---------------------------------------------------------------------------

describe("parse — tolerant reader", () => {
  it("parses valid NDJSON lines", () => {
    const e = complianceEvent();
    const raw = appendLine(e) + "\n" + appendLine(outcomeEvent());
    const result = parse(raw);
    expect(result.events).toHaveLength(2);
    expect(result.malformedLineCount).toBe(0);
  });

  it("skips blank lines, does NOT count them as malformed", () => {
    const raw = "\n\n" + appendLine(complianceEvent()) + "\n\n";
    const result = parse(raw);
    expect(result.events).toHaveLength(1);
    expect(result.malformedLineCount).toBe(0);
  });

  it("counts a malformed (truncated trailing) line via malformedLineCount, does NOT throw", () => {
    const raw = appendLine(complianceEvent()) + "\n" + '{"ts":123,"kind":"compliance"'; // truncated
    const result = parse(raw);
    expect(result.events).toHaveLength(1);
    expect(result.malformedLineCount).toBe(1);
  });

  it("counts a malformed line in the MIDDLE of the file, does NOT throw", () => {
    const raw = appendLine(complianceEvent()) + "\n" + "NOT_JSON\n" + appendLine(outcomeEvent());
    const result = parse(raw);
    expect(result.events).toHaveLength(2);
    expect(result.malformedLineCount).toBe(1);
  });

  it("parses empty string → zero events, zero malformed", () => {
    const result = parse("");
    expect(result.events).toHaveLength(0);
    expect(result.malformedLineCount).toBe(0);
  });

  it("NEVER throws on any input (fuzz)", () => {
    const inputs = ["completely garbage", "{broken json", '{"ts":1}' + "\n" + "bad\n", ""];
    for (const input of inputs) {
      expect(() => parse(input)).not.toThrow();
    }
  });

  it("keeps ALL well-formed rows regardless of bkitVersion (no version gating)", () => {
    const newer = { ...complianceEvent(), bkitVersion: "9.9.9" };
    const current = complianceEvent();
    const raw = JSON.stringify(newer) + "\n" + appendLine(current);
    const result = parse(raw);
    expect(result.events).toHaveLength(2);
  });
});

// ---------------------------------------------------------------------------
// outcome shape + parity test
// ---------------------------------------------------------------------------

describe("outcome — shape and inline-jq parity", () => {
  it("close-gate-shaped outcome validates successfully", () => {
    const e = outcomeEvent();
    expect(validate(e).ok).toBe(true);
  });

  it("folds outcome by (repo, prNumber)", () => {
    const e = outcomeEvent();
    const state = fold([e]);
    const key = identity(e);
    expect(state.get(key)).toStrictEqual(e);
  });

  it("inline-jq parity: jq-shaped row parses identically under parse()", () => {
    // Simulate what `jq -nc '... | .ts = (now*1000|floor)'` would produce:
    // A plain JSON object with ms ts (integer) and all required fields.
    const jqRow = {
      ts: Math.floor(Date.now()),
      kind: "outcome",
      repo: "cbartens/bkit",
      bkitVersion: "4.1.4",
      workflow: "ship",
      step: "ship-close-gate",
      prNumber: 100,
      linesAdded: 50,
      linesDeleted: 10,
      linesChanged: 60,
      filesChanged: 3,
      taskCount: 5,
      durationSeconds: 1800,
      deferrals: 0,
      failures: 0,
    };
    const raw = JSON.stringify(jqRow);
    const result = parse(raw);
    expect(result.events).toHaveLength(1);
    expect(result.malformedLineCount).toBe(0);
    expect(result.events[0].ts).toBe(jqRow.ts);
    expect(result.events[0].kind).toBe("outcome");
    // Validate the parsed row
    expect(validate(result.events[0]).ok).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// appendLine
// ---------------------------------------------------------------------------

describe("appendLine", () => {
  it("serializes event to JSON string parseable back to same shape", () => {
    const e = complianceEvent();
    const line = appendLine(e);
    expect(typeof line).toBe("string");
    expect(JSON.parse(line)).toStrictEqual(e);
  });
});

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

describe("constants", () => {
  it("MAX_ROWS_BEFORE_ROLLUP is a concrete number (not TODO)", () => {
    expect(typeof MAX_ROWS_BEFORE_ROLLUP).toBe("number");
    expect(MAX_ROWS_BEFORE_ROLLUP).toBeGreaterThan(0);
  });

  it("ARCHIVE_SHARD_TEMPLATE contains {basename} and {YYYYMM}", () => {
    expect(ARCHIVE_SHARD_TEMPLATE).toContain("{basename}");
    expect(ARCHIVE_SHARD_TEMPLATE).toContain("{YYYYMM}");
  });
});

// ---------------------------------------------------------------------------
// foldFrom — reads hot file + synthetic archive shard
// ---------------------------------------------------------------------------

describe("foldFrom — synthetic archive shard", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-telemetry-test-"));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("reads hot file and returns rowCount", () => {
    const hotPath = path.join(tmpDir, "stats.jsonl");
    const e1 = complianceEvent({ ts: 1000 } as Partial<TelemetryEvent>);
    const e2 = complianceEvent({ ts: 2000, rule: "skip-ci-not-head" } as Partial<TelemetryEvent>);
    fs.writeFileSync(hotPath, appendLine(e1) + "\n" + appendLine(e2) + "\n");

    const result = foldFrom([hotPath]);
    expect(result.rowCount).toBe(2);
    expect(result.state.size).toBe(2);
    expect(result.malformedLineCount).toBe(0);
    expect(result.maxRowsWarning).toBe(false);
  });

  it("reads archive shard alongside hot file and folds combined", () => {
    const hotPath = path.join(tmpDir, "stats.jsonl");
    const archivePath = path.join(tmpDir, "stats.202606.jsonl"); // simulates the template pattern

    const archiveEvent = complianceEvent({
      ts: 500,
      rule: "archive-rule",
    } as Partial<TelemetryEvent>);
    const hotEvent = complianceEvent({ ts: 1000, rule: "hot-rule" } as Partial<TelemetryEvent>);

    fs.writeFileSync(archivePath, appendLine(archiveEvent) + "\n");
    fs.writeFileSync(hotPath, appendLine(hotEvent) + "\n");

    const result = foldFrom([archivePath, hotPath]);
    expect(result.rowCount).toBe(2);
    expect(result.state.size).toBe(2);
  });

  it("missing paths are silently skipped", () => {
    const result = foldFrom([path.join(tmpDir, "nonexistent.jsonl")]);
    expect(result.rowCount).toBe(0);
    expect(result.state.size).toBe(0);
  });

  it("emits maxRowsWarning when rowCount exceeds MAX_ROWS_BEFORE_ROLLUP", () => {
    const hotPath = path.join(tmpDir, "stats.jsonl");
    const lines: string[] = [];
    for (let i = 0; i <= MAX_ROWS_BEFORE_ROLLUP; i++) {
      // Each row has unique rule so they're all distinct
      lines.push(
        appendLine(complianceEvent({ ts: i, rule: `rule-${i}` } as Partial<TelemetryEvent>)),
      );
    }
    fs.writeFileSync(hotPath, lines.join("\n") + "\n");

    const result = foldFrom([hotPath]);
    expect(result.maxRowsWarning).toBe(true);
    expect(result.rowCount).toBeGreaterThan(MAX_ROWS_BEFORE_ROLLUP);
  });

  it("surfaces malformedLineCount from hot file", () => {
    const hotPath = path.join(tmpDir, "stats.jsonl");
    fs.writeFileSync(hotPath, appendLine(complianceEvent()) + "\n" + "GARBAGE\n");

    const result = foldFrom([hotPath]);
    expect(result.malformedLineCount).toBe(1);
    expect(result.rowCount).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// buildSummary — per-workflow summary signals
// ---------------------------------------------------------------------------

describe("buildSummary — per-workflow summary signals", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-summary-test-"));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("produces lines with rowCount, malformed, and per-version counts", () => {
    const hotPath = path.join(tmpDir, "stats.jsonl");
    fs.writeFileSync(hotPath, appendLine(complianceEvent()) + "\n");

    const foldResult = foldFrom([hotPath]);
    const summary = buildSummary(foldResult);
    expect(summary.rowCount).toBe(1);
    expect(summary.malformedLineCount).toBe(0);
    expect(summary.versionCounts["4.1.4"]).toBe(1);
    expect(summary.maxRowsWarning).toBe(false);
    expect(summary.lines.length).toBeGreaterThan(0);
    expect(summary.lines[0]).toContain("[bkit-telemetry]");
    expect(summary.lines[0]).toContain("versions: 4.1.4=1");
  });

  it("emits grep-able [bkit-telemetry] MAX_ROWS_BEFORE_ROLLUP WARNING when exceeded", () => {
    const hotPath = path.join(tmpDir, "stats.jsonl");
    const lines: string[] = [];
    for (let i = 0; i <= MAX_ROWS_BEFORE_ROLLUP; i++) {
      lines.push(
        appendLine(complianceEvent({ ts: i, rule: `rule-${i}` } as Partial<TelemetryEvent>)),
      );
    }
    fs.writeFileSync(hotPath, lines.join("\n") + "\n");

    const foldResult = foldFrom([hotPath]);
    const summary = buildSummary(foldResult);
    expect(summary.maxRowsWarning).toBe(true);
    const warningLine = summary.lines.find(
      (l) => l.includes("[bkit-telemetry]") && l.includes("MAX_ROWS_BEFORE_ROLLUP"),
    );
    expect(warningLine).toBeDefined();
    expect(warningLine).toContain("WARNING");
  });
});
