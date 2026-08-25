/**
 * bkit-leaf-rules.test.ts — every agent prompt routes to the central rule set.
 *
 * A subagent is spawned self-contained: it never inherits the orchestrator's
 * context, so a rule placed only in `.agents/rules.md` reaches the workflows and
 * no leaf. One bullet in the EXECUTION PROTOCOL block closes that.
 *
 * The bullet ADDS reach; it does not replace inlining. A prompt keeps its own
 * operational clauses verbatim and the same rules are ALSO stated centrally —
 * deliberate redundancy, because an execution surface has to stand alone when
 * the central read fails, truncates, or is deprioritised. What the bullet buys
 * is that a rule inlined NOWHERE still lands.
 *
 * The directory is enumerated at run time, so a prompt added tomorrow is covered
 * or this suite is red. There is no list to forget to update.
 *
 * `.agents/rules.md` is a 2x2: `bkit Rules` and `Project Rules` each split into
 * `Universal Rules` and `Orchestrator Rules`. The bullet cuts on the GROUP, not
 * the top-level section — follow every Universal, skip every Orchestrator.
 *
 * The `SKIP` half is load-bearing: `Orchestrator Rules` carries the git / CI /
 * merge / tracker rules a leaf must not act on, and one of them ("ALWAYS commit
 * early and often") is the direct inverse of the leaf's own `**No commits:**`
 * clause. Cutting by group rather than by section is what lets a consumer's own
 * universal rules reach leaves while their orchestrator-only rules do not — the
 * split under `Project Rules` is the consumer's declaration of which is which.
 *
 * Group-heading presence is asserted here rather than in `bkit-rules-sync.test.ts`
 * because the bullet names them: the heading and the reference to it are one
 * contract, and a rename that updated only the rules file would otherwise leave
 * every prompt pointing at a section that no longer exists.
 */

import * as fs from "node:fs";
import * as path from "node:path";

import { describe, expect, it } from "vitest";

const REPO_ROOT = path.resolve(__dirname, "../..");

const PROMPTS_DIR = path.join(REPO_ROOT, ".bkit/prompts");
const WORKFLOWS_DIR = path.join(REPO_ROOT, ".bkit/workflows");
const RULES_FILE = path.join(REPO_ROOT, ".agents/rules.md");

/** Byte-identical in every prompt — change here, change all. */
const RULES_BULLET =
  "> - **Rules:** Read `.agents/rules.md` → FOLLOW ALL `Universal Rules`; SKIP `Orchestrator Rules`.";

/**
 * Workflows are the orchestrators the skipped group is written for, so they take
 * both. The bare form is for the two worktree utilities, whose CAUTION block has
 * no bullet list to join — the same accommodation the untrusted-input bullet has.
 */
const WORKFLOW_RULES_BULLET = "> - **Rules:** Read `.agents/rules.md` → FOLLOW ALL rules.";
const WORKFLOW_RULES_BARE = WORKFLOW_RULES_BULLET.replace("> - ", "> ");

/**
 * Position is contract, not cosmetics. `Rules` leads so the central set frames
 * everything under it; `External input` trails so the untrusted-content fence is
 * the last thing read before the file's own instructions begin.
 */
const FIRST_LABEL = "Rules";
const LAST_LABEL = "External input";

/**
 * Block scaffolding, not a rule — excluded from the ordering contract. Nothing
 * else belongs here: a second labelled line above `Rules` fails the order check,
 * which is how a re-added standalone `.agents/rules.md` pointer surfaces.
 */
const SCAFFOLD = new Set(["EXECUTION PROTOCOL"]);

/**
 * Labelled rule lines of the whole header, in file order.
 *
 * The header is NOT one blockquote. A workflow's rules continue past the CAUTION
 * block through the `bkit:tracker` variant blocks to a final block, and end at
 * the `---` above the body — so scanning only the first block would read
 * `External input` as trailing when three more blocks follow it. A prompt has no
 * `---`; its header ends where the unquoted `**Contract:**` line begins.
 */
function headerLabels(file: string): string[] {
  const lines = fs.readFileSync(file, "utf-8").split("\n");
  const start = lines.findIndex((l) => l.startsWith("> [!CAUTION]"));
  if (start === -1) return [];
  const labels: string[] = [];
  for (let i = start; i < lines.length; i++) {
    const line = lines[i];
    if (line === "---" || /^\*\*/.test(line)) break;
    const label = line.match(/^> (?:- )?\*\*([^*]+):\*\*/)?.[1];
    if (label && !SCAFFOLD.has(label)) labels.push(label);
  }
  return labels;
}

/** The headings the bullet routes by. A rename must move both together. */
const UNIVERSAL_HEADING = "### Universal Rules";
const ORCHESTRATOR_HEADING = "### Orchestrator Rules";
const BKIT_HEADING = "## bkit Rules";
const MANAGED_END = "<!-- bkit:end -->";

const countOf = (haystack: string, needle: string) => haystack.split(`\n${needle}\n`).length - 1;

const markdownIn = (dir: string) =>
  fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => path.join(dir, f));

const PROMPTS = markdownIn(PROMPTS_DIR);
const WORKFLOWS = markdownIn(WORKFLOWS_DIR);

describe("every workflow routes to the central rule set", () => {
  it("finds workflows to check", () => {
    expect(WORKFLOWS.length, `no workflows enumerated from ${WORKFLOWS_DIR}`).toBeGreaterThan(0);
  });

  it("every workflow carries the orchestrator rules line verbatim", () => {
    const missing = WORKFLOWS.filter((file) => {
      const body = fs.readFileSync(file, "utf-8");
      return !body.includes(WORKFLOW_RULES_BULLET) && !body.includes(WORKFLOW_RULES_BARE);
    }).map((file) => path.relative(REPO_ROOT, file));

    expect(
      missing,
      `${missing.length} gap(s). Add to the CAUTION block:\n${WORKFLOW_RULES_BULLET}\n\n${missing.join("\n")}`,
    ).toEqual([]);
  });

  it("workflows take both groups — they are what Orchestrator Rules is written for", () => {
    // A workflow carrying the leaf bullet would skip the git / CI / merge rules
    // it is the only thing entitled to run.
    const leafBulleted = WORKFLOWS.filter((file) =>
      fs.readFileSync(file, "utf-8").includes(RULES_BULLET),
    ).map((file) => path.relative(REPO_ROOT, file));

    expect(leafBulleted, "workflow(s) carrying the leaf SKIP bullet").toEqual([]);
  });
});

describe("Rules leads and External input trails in every header", () => {
  for (const [label, files] of [
    ["prompt", PROMPTS],
    ["workflow", WORKFLOWS],
  ] as const) {
    it(`every ${label} opens with ${FIRST_LABEL} and closes with ${LAST_LABEL}`, () => {
      const wrong: string[] = [];
      for (const file of files) {
        const labels = headerLabels(file);
        const rel = path.relative(REPO_ROOT, file);
        if (labels.length === 0) {
          wrong.push(`${rel} — no labelled rules in its header`);
          continue;
        }
        if (labels[0] !== FIRST_LABEL) wrong.push(`${rel} — opens with "${labels[0]}"`);
        if (labels[labels.length - 1] !== LAST_LABEL) {
          wrong.push(`${rel} — closes with "${labels[labels.length - 1]}"`);
        }
      }
      expect(wrong, `${wrong.length} ordering break(s)`).toEqual([]);
    });

    it(`no ${label} carries either anchor twice`, () => {
      const dupes = files
        .map((file) => ({ file, labels: headerLabels(file) }))
        .filter(
          ({ labels }) =>
            labels.filter((l) => l === FIRST_LABEL).length > 1 ||
            labels.filter((l) => l === LAST_LABEL).length > 1,
        )
        .map(({ file }) => path.relative(REPO_ROOT, file));

      expect(dupes, `${label}(s) with a duplicated anchor clause`).toEqual([]);
    });
  }
});

describe("every prompt routes to the central rule set", () => {
  it("finds prompts to check", () => {
    // Asserted before the loop: an empty glob would otherwise pass everything.
    expect(PROMPTS.length, `no prompts enumerated from ${PROMPTS_DIR}`).toBeGreaterThan(0);
  });

  it("every prompt carries the rules bullet verbatim", () => {
    const missing = PROMPTS.filter(
      (file) => !fs.readFileSync(file, "utf-8").includes(RULES_BULLET),
    ).map((file) => path.relative(REPO_ROOT, file));

    expect(
      missing,
      `${missing.length} gap(s). Append to the EXECUTION PROTOCOL block:\n${RULES_BULLET}\n\n${missing.join("\n")}`,
    ).toEqual([]);
  });

  it("no prompt carries it twice", () => {
    const duplicated = PROMPTS.filter(
      (file) => fs.readFileSync(file, "utf-8").split(RULES_BULLET).length > 2,
    ).map((file) => path.relative(REPO_ROOT, file));

    expect(duplicated, "prompt(s) carrying the rules bullet more than once").toEqual([]);
  });
});

describe("the rule groups the bullet names exist", () => {
  const rules = fs.readFileSync(RULES_FILE, "utf-8");
  // Scope is the bkit-managed block ONLY. Everything below `bkit:end` is
  // consumer-owned — `bkit install` never writes it and `bkit check` ignores its
  // drift — so asserting its shape here would fail a consumer for their own file.
  const managed = rules.slice(0, rules.indexOf(MANAGED_END));

  it("both rule groups appear under bkit Rules", () => {
    // The bullet routes by group name, so a missing heading means every prompt
    // points at a section that is not there.
    expect(countOf(managed, UNIVERSAL_HEADING), `missing ${UNIVERSAL_HEADING}`).toBe(1);
    expect(countOf(managed, ORCHESTRATOR_HEADING), `missing ${ORCHESTRATOR_HEADING}`).toBe(1);
  });

  it("bkit Rules sits inside the managed block", () => {
    expect(rules.indexOf(MANAGED_END), `missing ${MANAGED_END}`).toBeGreaterThan(-1);
    expect(managed.indexOf(`\n${BKIT_HEADING}\n`), `missing ${BKIT_HEADING}`).toBeGreaterThan(-1);
  });

  it("Universal Rules precedes Orchestrator Rules", () => {
    // Ordering is what makes "SKIP EVERY Orchestrator Rules" readable as a tail
    // cut, not a section a leaf seeks past to reach its own rules.
    expect(managed.indexOf(UNIVERSAL_HEADING), "groups out of order").toBeLessThan(
      managed.indexOf(ORCHESTRATOR_HEADING),
    );
  });

  it("every Orchestrator subsection name is shared with Universal, never a synonym", () => {
    // The two groups must not invent different names for the same topic — a leaf
    // reading "Plans & Process" in one group and "Trackers" in the other cannot
    // tell they are the same shelf.
    const h4 = (slice: string) => [...slice.matchAll(/^#### (.+)$/gm)].map((m) => m[1]);
    const orchStart = managed.indexOf(ORCHESTRATOR_HEADING);

    const universalNames = new Set(h4(managed.slice(0, orchStart)));
    const unshared = h4(managed.slice(orchStart)).filter((n) => !universalNames.has(n));

    expect(unshared, `orchestrator subsection(s) with no universal counterpart`).toEqual([]);
  });
});

describe("the matcher itself rejects weakened text", () => {
  // Asserts the gate, not the corpus. Without these, a matcher loosened until it
  // stopped failing would look exactly like a matcher that passes honestly.
  it("dropping the SKIP clause fails", () => {
    const weakened =
      "> - **Rules:** Read `.agents/rules.md` → follow EVERY `Universal Rules` section.";
    expect(weakened).not.toContain(RULES_BULLET);
  });

  it("dropping EVERY narrows the bullet to one group and fails", () => {
    // Without EVERY a leaf can read it as "the first Universal Rules I find",
    // which silently drops the consumer's own universal project rules.
    const weakened =
      "> - **Rules:** Read `.agents/rules.md` → follow `Universal Rules`; SKIP `Orchestrator Rules`.";
    expect(weakened).not.toContain(RULES_BULLET);
  });

  it("a prompt with no bullet at all fails", () => {
    expect("> - **Order:** Execute Process steps sequentially.").not.toContain(RULES_BULLET);
  });
});
