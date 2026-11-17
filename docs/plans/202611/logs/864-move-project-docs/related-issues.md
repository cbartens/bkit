## #863 — Ship a purpose-based components document template (open)

### Narrative

Ship a reusable, purpose-based `docs/components.md` template and populate it for bkit. The document explains what the repository does without requiring a reader to inspect code. Its structure draws on a consumer's component document and bkit's existing `floorplan/` walkthrough.

The final overview includes the five development workflows; Core, Shared and Templates; multiple assistant hosts and model providers; and the core concepts explained in `DETAILS.md`. It contains **one Mermaid chart**. It references `docs/capabilities.md` without requiring matching component names, counts or boundaries.

### Success Criteria

- [x] Ship `.bkit/templates/docs/components.md` as a copy-and-own template and populate `docs/components.md` for bkit.
- [x] Explain Design, Plan, Build, Debug and Ship, including inputs, outcomes, direct entry points, Debug's recovery role and Auto's routing role.
- [x] Explain Core/Shared/Templates ownership and supported hosts/providers, with more detail for Shared and Templates while staying at the level of purpose.
- [x] Keep exactly one Mermaid chart; distinguish this view from architecture, the generated capability register and the interactive floorplan.
- [x] Integrate discovery/adoption documentation and verify packaging, formatting and preservation of adopted content.

### Completed Work

1. **Initial template and bkit overview**
   - Added a reusable template with purpose, responsibilities, relationships, journeys, shared foundations, scope and related views.
   - Populated bkit's document, read the consumer example after its path was supplied, and used its purpose groups and component breakdown as structural inspiration.
   - Added the template catalog entry and adoption instructions, regenerated the installed catalog mirror, registered the document in the project document index and linked it from architecture.
   - Extended the existing adoption audit to allow the populated body and removal of the template introduction while preserving the shared rules header.
2. **Lifecycle and ownership refinement**
   - Made all five workflows explicit, with a purpose/input/output table.
   - Added Core, Shared and Templates as delivery and ownership roles, including package-only sources, managed content and consumer-owned adopted copies.
   - Added generic primary-workflow and optional delivery/ownership prompts to the reusable template.
3. **Single chart and host/provider support**
   - Consolidated the lifecycle and supporting responsibilities into one Mermaid chart.
   - Explained the distinction between hosts and providers: Claude/Anthropic, Codex/OpenAI, Cursor/Cursor, Antigravity/Google, and OpenCode with OpenRouter, Ollama, Zen or Go.
   - Covered per-agent model/effort choices, multiple configured hosts, retained OpenCode provider configurations and saved-state continuation. Clarified that switching is configured rather than automatic request failover.
   - Linked the authoritative provider and agent catalogs and acknowledged host-specific tool/permission limits.
4. **Product concepts and expanded Shared/Templates**
   - Read `DETAILS.md` and brought out independent specialist review, completion checked by code, test-first evidence, human control, persistent project knowledge, focused resumable work and audits beyond existing tests.
   - Expanded Shared into project knowledge foundations, assistant/tool connections and environment/workspace conventions.
   - Expanded Templates into verification/delivery, cloud continuation/evidence, code understanding/work intake and security/repository upkeep.
   - Distinguished Core's installed audit checklists in `docs/templates/` from copy-and-own tools in `.bkit/templates/`.
   - Expanded the same single chart with these groups, independent review, owner decisions, knowledge upkeep and audit findings feeding Plan.
   - Kept detailed inventories, counts, benchmarks, model versions and setup recipes in their existing documentation.

### Files Changed

<!-- prettier-ignore -->
| File | Change |
| --- | --- |
| `.bkit/templates/docs/components.md` | New shipped template, refined through all follow-ups. |
| `docs/components.md` | Populated bkit overview and single integrated Mermaid chart. |
| `.bkit/core/.bkit/templates.md` | Canonical template catalog and adoption instructions. |
| `.bkit/templates.md` | Regenerated installed catalog. |
| `.agents/docs.md` | Project-owned document index entry. |
| `docs/architecture.md` | Link and boundary between purpose and implementation views. |
| `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` | Declared permitted adoption customizations. |
| `.bkit/version` | Installer-generated hashes for changed managed documents. |

Scratch smoke fixtures and the accumulating work record were kept under ignored `tmp/`; they are not shipped.

### Commits

These commits are present on local `dev`; **they have not been pushed**.

<!-- prettier-ignore -->
| Commit | Work |
| --- | --- |
| `19cb2d9b81cd061b175ad826a0002c8683f39d67` | Ship purpose-based repository overview and template integration. |
| `762e806681e5ff29a16409899b7460cfa627b724` | Explain lifecycle and content ownership. |
| `1951b1b4c092eee6b5e4e8b07d7b4fe733f0dc62` | Unify the diagram and explain providers. |
| `86dd0f383a63bb4cf1b73ba01a788201b4e64159` | Clarify core ideas and supporting roles from the product guide. |

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Outcome |
| --- | --- |
| No capability register or floorplan | Template identifies these as optional; the component document remains usable. |
| Components differ from generated capabilities | Explicitly allowed; no one-to-one mapping is required. |
| Install or upgrade after a consumer adopts the document | The template source refreshes and the adopted document remains unchanged. |
| Different assistant hosts/providers | The overview describes the shared process while linking host-specific limitations. |
| Workflow failure | Debug is a recovery path, not a mandatory phase after a successful build. |

### Derived Test Matrix

<!-- prettier-ignore -->
| Check | Type | Evidence |
| --- | --- | --- |
| Existing adoption, shipped-reference, branding, template-content, template-path and template-copy checks | Unit | Initial six-file run: 528 passed and one missing template-introduction failure; fixed the introduction, then both affected files passed all 173 tests. The other four files had passed all 356 tests. |
| Lifecycle refinement | Unit | 458 tests passed across three affected files. |
| Single-chart/provider refinement and final Shared/Templates refinement | Unit | Each follow-up passed all 173 tests across the adoption and template-content files. |
| Formatting, test-file lint, shared-instruction consistency, relative links and whitespace | Static | Passed for the applicable changed files. Exactly one Mermaid block was checked in each component document. |
| Build | Build | `pnpm build` passed; no compiled output changed. |
| Fresh consumer using built CLI, Claude and Codex selected | Smoke | Install copied the template byte-for-byte without creating an adopted `docs/components.md`. Repeat install and upgrade preserved a project-owned adopted document and refreshed the template source/catalog. |

Final targeted unit command:
```text
pnpm test .bkit/core/engine/audits/repo/dogfood-templates.test.ts .bkit/core/engine/audits/templates/templates-content.test.ts
```

Commit hooks passed and the working tree was clean after the last implementation commit. Catalog regeneration completed without conflicts. Existing setup advisories were outside this documentation change. The initial sandbox restriction on tsx's local socket was resolved through an approved rerun.

No integration, E2E or live tiers were run for this documentation change. Mermaid block count and document structure were checked; a rendered visual preview was not part of the recorded verification.

### Tasks

<!-- bkit:group 1 start -->
### TASK GROUP 1: Ship the purpose-based overview
<!-- bkit:task 1 start -->
- [x] **TASK 1:** Create the shipped template and populated bkit document.
  - **CREATE:** `.bkit/templates/docs/components.md`, `docs/components.md`.
  - **DONE WHEN:** Both describe responsibilities and relationships at the intended level.
  - **TEST FIRST:** n/a — documentation; existing unit audits and smoke checks above provide verification.
<!-- bkit:task 1 end -->
<!-- bkit:task 2 start -->
- [x] **TASK 2:** Integrate catalogs, discovery and adoption checks.
  - **UPDATE:** The six existing files listed in Files Changed.
  - **DEPENDS ON:** 1.
  - **DONE WHEN:** The template is discoverable, packaged and preserves adopted content.
  - **TEST FIRST:** n/a — documentation and adoption metadata; existing checks exercised.
<!-- bkit:task 2 end -->
<!-- bkit:task 3 start -->
- [x] **TASK 3:** Incorporate owner feedback and verify the final overview.
  - **UPDATE:** `docs/components.md`, `.bkit/templates/docs/components.md`.
  - **DEPENDS ON:** 1, 2.
  - **DONE WHEN:** The lifecycle, ownership, host/provider support and product concepts appear in a top-level overview with one Mermaid chart.
  - **TEST FIRST:** n/a — documentation refinements; verification recorded above.
<!-- bkit:task 3 end -->
<!-- bkit:group 1 end -->

### Open Questions & Assumptions

Implementation and local verification are complete. Push, pull request, release and human acceptance have not occurred. Keep the issue open in review with `next:ship`.

Priority: Medium under the documentation/copy ranking rule. Size: S, one documentation surface. No parent or blocking dependency.

### Breaking Changes & Naming

None. The adopted `docs/components.md` remains project-owned and independently maintained.

### Out of Scope

Runtime behavior changes, new workflow gates, floorplan regeneration, capability-register generation changes, publishing or release.

### References

- `DETAILS.md`
- `floorplan/README.md` and `floorplan/architecture.json`
- `docs/capabilities.md`
- `.bkit/providers.md`, `.bkit/prompts.md`, `.bkit/templates.md`

## #386 — Move managed-version markers; readable workflow descriptions (closed)

## Problem

Cursor shows the `<!-- bkit:managed vX.Y.Z … -->` HTML comment as the **workflow description** in the command picker / hover UI.

Repro (Cursor): hover `/bkit-plan` (or any `/bkit-*` command) → tooltip title is fine (`Bkit Plan`), but the description body is:

```text
<!-- bkit:managed v4.8.0 — do NOT edit; run `bkit upgrade` to refresh -->
```

instead of the real workflow summary (e.g. “Plan Feature — Autonomous plan generation”).

Screenshot: Cursor command hover showing the managed marker as the description.

### Why

From [#256](https://github.com/cbartens/bkit/issues/256) / `stampManagedVersion` in `.bkit/src/bkit-version.ts`:

- With frontmatter → marker is inserted **immediately after** the closing `---` fence.
- **Without** frontmatter (Cursor / OpenCode commands, whose transforms **strip** YAML frontmatter including `description:`) → marker is **prepended at file top**.

So rendered `.cursor/commands/bkit-*.md` files look like:

```md
<!-- bkit:managed v4.8.0 — do NOT edit; run `bkit upgrade` to refresh -->

# Plan Feature (Workflow 2/6)
…
```

Cursor appears to use the first body line as the command description when there is no frontmatter `description`, so the managed marker wins.

Claude Code keeps frontmatter `description:` and puts the marker below it, so this is mainly a Cursor (and likely OpenCode) UX bug; stamping placement still needs a cross-provider fix.

## Suggested change

Keep the managed marker for `bkit check` drift detection, but **do not let it be the first human-visible / IDE-description line**.

Preferred approach:

1. **Relocate stamp placement** in `stampManagedVersion` (or a command-specific post-pass):
   - After the first meaningful heading / role block (e.g. after `# Plan Feature…` + blank line), **or**
   - After a short plain-text lead-in that Cursor can treat as the description.
2. Preserve `MANAGED_MARKER_LINE_RE` / `MANAGED_MARKER_VERSION_RE` semantics — marker can live anywhere in the file; detector already searches non-anchored.
3. Update unit tests in `bkit-version.test.ts` that currently assert top-of-file prepend for no-frontmatter content.
4. Re-render `.cursor/commands/` (and OpenCode equivalents) via `bkit upgrade` so shipped mirrors pick up the new placement.

### Alternatives considered

<!-- prettier-ignore -->
| Option | Pros | Cons |
| --- | --- | --- |
| **A. Move marker below H1 / lead description** (recommended) | Minimal change; keeps strip-frontmatter Cursor transforms; IDE shows real title/scope | Slightly less “first-line” visibility of version for humans skimming files |
| **B. Stop stripping Cursor command frontmatter `description`** | IDE gets canonical `description:` | May conflict with why T1 strip exists; need to verify Cursor frontmatter schema |
| **C. Duplicate a plain description line above the marker** | Keeps top-of-file stamp | Redundant with H1; easy to drift from real description |

Recommend **A** unless Cursor now reliably prefers YAML `description` even when frontmatter is present — then **B** is cleaner.

## Acceptance

- [ ] Hovering `/bkit-plan` (and other `/bkit-*` commands) in Cursor shows a human-readable description (title / role / template `description`), **not** the managed-version HTML comment.
- [ ] Managed marker still present in every rendered agent/command; `bkit check` still hard-fails on version drift.
- [ ] `stampManagedVersion` remains idempotent on re-stamp / version bump.
- [ ] Tests cover no-frontmatter placement (marker not first line when a heading/description exists).

## Out of scope

- Changing marker text / `bkit:managed` token shape.
- Removing managed-version stamping (#256).

<img width="613" height="213" alt="Image" src="https://github.com/user-attachments/assets/4df57d97-5f00-4986-a2a9-5c8f90f8c498" />

## Verification — 2026-08-24, `dev` @ `8af127a0` (bkit 4.10.0)

**Still reproduces. Nothing has been built for it** — no branch, no commit, no plan doc and no PR mentions #386.

### The bug is still in the code, exactly as described

`.bkit/src/bkit-version.ts:287` — the no-frontmatter branch still returns `marker + "\n\n" + body`, so the HTML comment lands on line 1.

Sixteen rendered files are affected, and it is only the commands:

<!-- prettier-ignore -->
| Mirror dir | Files whose line 1 is the marker |
| --- | --- |
| `.claude/commands` | 0 / 8 |
| `.claude/agents` | 0 / 49 |
| `.cursor/commands` | **8 / 8** |
| `.cursor/agents` | 0 / 49 |
| `.opencode/commands` | **8 / 8** |
| `.opencode/agents` | 0 / 49 |

Agents keep their frontmatter on every host, so their marker sits under it (`.cursor/agents/bkit-plan-generate.md:13`, `.opencode/agents/bkit-plan-generate.md:14`). Only commands lose it.

The cause is confirmed at source: `applyT1` (`.bkit/src/bkit-install.ts:698`) and `applyOpencodeCommand` (`.bkit/src/bkit-install.ts:688`) both strip the whole YAML block — `description:` included — before `stampManagedVersion` runs, so there is nothing above the marker for the IDE to read.

Current heads:

```md
# .cursor/commands/bkit-plan.md
<!-- bkit:managed v4.10.0 — do NOT edit; run `bkit upgrade` to refresh -->

# Plan Feature (Workflow 2/6)
```

```md
# .opencode/commands/bkit-plan.md
<!-- bkit:managed v4.10.0 — do NOT edit; run `bkit upgrade` to refresh -->

**Session prompt:**
```

Claude Code is unaffected, as the issue says:

```md
# .claude/commands/bkit-plan.md
---
description: "Plan Feature — Autonomous plan generation"
---
<!-- bkit:managed v4.10.0 — do NOT edit; run `bkit upgrade` to refresh -->
```

### Acceptance criteria as they stand

<!-- prettier-ignore -->
| Criterion | Status |
| --- | --- |
| Cursor hover shows a human-readable description | **Not met** — the marker is still the first body line |
| Marker present everywhere; `bkit check` hard-fails on drift | Met (untouched) |
| `stampManagedVersion` stays idempotent | Met (untouched) |
| Tests cover no-frontmatter placement | Met, but backwards — the test locks the buggy placement in |

`.bkit/src/bkit-version.test.ts:402` asserts `lines[0]` **is** the marker. I ran it (`npx vitest run .bkit/src/bkit-version.test.ts -t "stampManagedVersion"`): 6 passed. That is the proof no fix landed, rather than a fix having quietly regressed.

### Moving the marker is safe for the drift gate

- `detectRenderedPromptsStale` (`.bkit/src/bkit-postinstall.ts:2391-2411`) reads each whole file and matches with the non-anchored `MANAGED_MARKER_VERSION_RE`, so it does not care where the marker sits.
- `MANAGED_MARKER_LINE_RE` is `/m`-flagged and matches at any line start, so re-stamping still replaces rather than duplicates.
- No workflow or prompt source contains the literal text `bkit:managed` (enforced by `.bkit/src/bkit-prompt-notation.test.ts:273`), so there is no earlier false match for the non-anchored read to land on.
- Exactly one placement assertion exists in the whole suite: `bkit-version.test.ts:405`.
- All 8 sources in `.bkit/workflows/` carry an H1 on line 5 (`# Plan Feature (Workflow 2/6)`, `# Auto`, …), so a "sink below the first heading" rule has something to bite on in every single case.

### The one thing I could not settle

Whether Cursor now reads a `description` from frontmatter in `.cursor/commands/*.md` — the fact that would make **option B** the cleaner fix. Cursor's public commands documentation has been rewritten around Skills and no longer documents a command frontmatter schema, so I have no evidence either way and I am not going to reconstruct a plausible answer.

Related, and it settles the choice anyway: `.opencode/opencode.json` has no `command` block at all (its keys are `$schema`, `permission`, `mcp`, `plugin`, `provider`), so OpenCode has no config-side place to carry a description. Option B would need frontmatter preserved on that host too, which is a second unverified schema.

**So: option A.** Implementation plan in the next comment.

## Implementation plan — option A

Written to be executed end to end by an agent. Baseline: `dev` @ `8af127a0`, bkit 4.10.0. Work on a branch `fix/386-managed-marker-placement`, PR into `dev`.

### The change in one sentence

When rendered content has no frontmatter, sink the managed-version marker below the file's first Markdown heading instead of putting it on line 1; keep the top-prepend as the fallback when there is no heading.

That fallback is not a hedge — it is precisely what the acceptance criterion asks for: "marker not first line **when a heading/description exists**".

### Do not touch

The marker text, the `bkit:managed` token, `MANAGED_MARKER_LINE_RE`, `MANAGED_MARKER_VERSION_RE`, the frontmatter branch of `stampManagedVersion`, `applyT1`, `applyT2`, `applyOpencodeCommand`, or any agent render path. Agents keep their frontmatter on all three hosts and are already correct.

---

### Task 1 — relocate the stamp

**File:** `.bkit/src/bkit-version.ts`

Replace the final `return` of `stampManagedVersion` (currently line 287) with:

```ts
  // No frontmatter — the cursor/opencode command transforms strip it (applyT1 /
  // applyOpencodeCommand), taking `description:` with it. A marker on line 1 then
  // becomes the IDE-visible command description (#386), so sink it below the first
  // heading when the content has one.
  const heading = stripped.match(/^#{1,6} .*$/m);
  if (heading?.index !== undefined) {
    const cut = heading.index + heading[0].length;
    const head = stripped.slice(0, cut);
    const rest = stripped.slice(cut).replace(/^\n+/, "");
    return rest ? `${head}\n\n${marker}\n\n${rest}` : `${head}\n\n${marker}\n`;
  }
  return marker + "\n\n" + stripped.replace(/^\n+/, "");
```

**Idempotency is the thing to get right here.** Stripping an existing marker leaves a run of blank lines behind it, so the re-insert must collapse them — that is what `.replace(/^\n+/, "")` on `rest` does, and why the marker is re-emitted with exactly one blank line either side. The existing test at `.bkit/src/bkit-version.test.ts:410` already stamps `"# H\n\nbody\n"` twice and compares bytes, so it will catch a mistake here.

Also update the doc comment above the function (lines 269-277): the sentence "Falls back to a top prepend when the content has no frontmatter" is now only half true and must describe both branches.

### Task 2 — flip the placement test

**File:** `.bkit/src/bkit-version.test.ts`

Replace the test at line 402 ("prepends the marker + blank line when there is no frontmatter") with:

```ts
  it("sinks the marker below the first heading when there is no frontmatter (cursor command shape)", () => {
    const out = stampManagedVersion("# Ship Feature\n\nbody\n", "4.0.0");
    const lines = out.split("\n");
    expect(lines[0]).toBe("# Ship Feature");
    expect(lines[1]).toBe("");
    expect(lines[2]).toBe(managedVersionMarker("4.0.0"));
    expect(lines[3]).toBe("");
    expect(lines[4]).toBe("body");
  });

  it("sinks below the first heading even when a lead-in block precedes it (opencode anchor shape)", () => {
    const src = "**Session prompt:**\n\n$ARGUMENTS\n\n---\n\n# Plan Feature\n\nbody\n";
    const out = stampManagedVersion(src, "4.0.0");
    expect(out.split("\n")[0]).toBe("**Session prompt:**");
    expect(out).toContain(`# Plan Feature\n\n${managedVersionMarker("4.0.0")}\n\nbody`);
  });

  it("still prepends at top when there is no frontmatter AND no heading", () => {
    const out = stampManagedVersion("**Role:** hi\n", "4.0.0");
    expect(out.split("\n")[0]).toBe(managedVersionMarker("4.0.0"));
  });
```

Leave the idempotency, version-bump and blank-line tests as they are — they now exercise the new branch for free.

### Task 3 — a regression test on the composed render

**File:** `.bkit/src/bkit-install.test.ts` (it already owns `applyT1` / `applyT2` / `applyOpencodeCommand`; import `stampManagedVersion` from `./bkit-version`).

Compose the real render chains from `bkit-modules.ts:577` (cursor) and `bkit-modules.ts:639` (opencode) over every source in `.bkit/workflows/`, and assert the marker is never line 1 and never duplicated:

```ts
describe("#386: the managed marker is never the first line of a rendered command", () => {
  const src = path.join(REPO_ROOT, ".bkit/workflows");
  const files = fs.readdirSync(src).filter((f) => f.startsWith("bkit-") && f.endsWith(".md"));

  it("covers the whole workflow corpus", () => {
    expect(files.length).toBeGreaterThan(5);
  });

  for (const f of files) {
    const raw = fs.readFileSync(path.join(src, f), "utf-8");
    it(`cursor: ${f}`, () => {
      const out = stampManagedVersion(applyT2(applyT1(raw)), "9.9.9");
      expect(out.split("\n")[0]).not.toContain("bkit:managed");
      expect((out.match(/bkit:managed/g) ?? []).length).toBe(1);
    });
    it(`opencode: ${f}`, () => {
      const out = stampManagedVersion(applyOpencodeCommand(raw), "9.9.9");
      expect(out.split("\n")[0]).not.toContain("bkit:managed");
      expect((out.match(/bkit:managed/g) ?? []).length).toBe(1);
    });
  }
});
```

**Deliberately reads `.bkit/workflows/` and composes in memory — it must NOT read `.cursor/commands/` or `.opencode/commands/`.** Those mirrors are force-overwritten output of `bkit install`; gating CI on them holds the build red until someone re-renders, which is the exact anti-pattern `.bkit/src/bkit-block-locality-audit.test.ts:364-391` spells out. Fix the source, the mirror follows.

If `substituteWorkflow` is trivially importable, add it to the chains to match `bkit-modules.ts` exactly. It does not move headings, so its absence would not weaken the assertion — include it for fidelity, not correctness.

### Task 4 — docs, in the same change

**`.bkit/workflows.md:180`** states the old placement outright: "after frontmatter (claude) or top (cursor/opencode strips frontmatter)". Replace that clause with wording to the effect of:

> after frontmatter (claude), or below the first heading where the frontmatter was stripped (cursor/opencode)

**This file is shipped to consumers, so the replacement must not contain `#386`, `KN-*` or `DE-*`.** `.bkit/src/bkit-shipped-docs-refs.test.ts` scans every manifest-listed `.md` for `#` followed by two or more digits and will fail the build. State the rule, not the change.

Two files need checking but almost certainly no edit — confirm by reading rather than assuming:

- `.bkit/prompts.md:43` — describes agents only, which keep frontmatter. Should be unchanged.
- `docs/architecture.md:144` — describes drift detection, makes no placement claim. Should be unchanged.

Add a `### Fixed` entry under `## [Unreleased]` in `CHANGELOG.md` (create the heading if it is not there, keeping the Added/Changed/Fixed ordering used in released sections). Match the house style — a bold lead sentence, then what was wrong and what now holds. Something like:

> **The managed-version marker is no longer the command description Cursor shows.** Cursor and OpenCode command transforms strip YAML frontmatter, `description:` included, so the `<!-- bkit:managed vX.Y.Z … -->` comment stamped afterwards became line 1 — and Cursor, with no frontmatter `description` to read, showed the HTML comment as the command's description in the picker and hover. `stampManagedVersion` now sinks the marker below the file's first heading when there is no frontmatter, falling back to the old top-prepend only for headingless content. Agents are unaffected on every host: they keep their frontmatter, so their marker already sat below it. The marker text is unchanged and the drift gate reads position-independently, so `bkit check` still hard-fails on a stale render.

### Task 5 — rebuild, re-render, gates

Run in this order, once, at the end — not after each edit:

```bash
pnpm build                 # dist/ is committed and gated by pnpm check:dist
pnpm bkit upgrade          # re-render all mirrors + re-stamp .bkit/version
git config core.bare false # `bkit install`/`upgrade` flips this to true in this repo
pnpm typecheck
pnpm test
pnpm format
pnpm slop:delta
pnpm lint:prose
pnpm check:dist
pnpm bkit check
```

Then confirm the fix by hand:

```bash
head -3 .cursor/commands/bkit-plan.md
head -3 .opencode/commands/bkit-plan.md
for d in .cursor/commands .opencode/commands; do
  for f in $d/bkit-*.md; do head -1 "$f" | grep -q "bkit:managed" && echo "STILL BROKEN: $f"; done
done
```

The loop must print nothing. Expected heads:

```md
# .cursor/commands/bkit-plan.md
# Plan Feature (Workflow 2/6)

<!-- bkit:managed v4.10.0 — do NOT edit; run `bkit upgrade` to refresh -->
```

```md
# .opencode/commands/bkit-plan.md
**Session prompt:**

$ARGUMENTS
```

Commit the regenerated mirrors and `.bkit/version` alongside the source change — a source change without its render leaves `bkit check` hard-failing on `dev`.

### Task 6 — PR

Branch `fix/386-managed-marker-placement`, PR into `dev`, body referencing `#386` as a plain reference (no closing keyword needed here — this is a normal bug issue, not a standing tracker, so `Closes #386` is fine if you prefer).

CI does not fire automatically on branch pushes or `gh pr create` in this repo. Dispatch it: `gh workflow run ci.yml --ref fix/386-managed-marker-placement`. Do not let a `[skip ci]` commit be HEAD when the PR is created.

---

### Known residual, flagged not fixed

For OpenCode the first line becomes `**Session prompt:**` rather than a real description, because the `$ARGUMENTS` anchor has to stay at the top for slash-command args to survive. That is no longer an HTML comment, which is what the acceptance criterion asks for, but it is not a good description either. Whether OpenCode even reads a description from the file body is unverified, and `.opencode/opencode.json` has no `command` block to carry one. Leave it; raise a follow-up if it turns out to matter.

### Acceptance criteria this closes

<!-- prettier-ignore -->
| Criterion | How it is met |
| --- | --- |
| Cursor hover shows a human-readable description | Line 1 of every `.cursor/commands/bkit-*.md` becomes its H1, e.g. `# Plan Feature (Workflow 2/6)` — verify in Cursor before closing |
| Marker still present everywhere; `bkit check` hard-fails on drift | Unchanged: `detectRenderedPromptsStale` matches non-anchored over the whole file |
| `stampManagedVersion` stays idempotent | Blank-line collapse in Task 1, covered by the existing test at `bkit-version.test.ts:410` |
| Tests cover no-frontmatter placement | Tasks 2 and 3 |

The last one needs a human with Cursor open. Everything above it is machine-verifiable.

## Implementation plan v2 — SUPERSEDES the plan comment above

> The previous plan comment (`#issuecomment-5396270805`) is **stale — do not execute it**. It only sank the marker, which left Cursor showing `# Plan Feature (Workflow 2/6)`, hash and all. This comment replaces it in full and is self-contained.

### What changed and why

Cursor prints the **literal first line of the file** as the command description — that is what the screenshot shows, and it is the whole mechanism. So the fix is not just "get the marker off line 1", it is "put the right string on line 1".

Every workflow source already holds that string. `.bkit/workflows/bkit-plan.md:2` is `description: "Plan Feature — Autonomous plan generation"` — Claude Code gets it as frontmatter, and `applyT1` currently throws it away for Cursor. Emitting it as a plain first line is derived at render time, so it can never drift from what Claude shows. That kills the one objection listed against option C in the issue body.

Wrapping it in `<!-- -->` was considered and rejected: since Cursor prints the line raw, the picker would read `<!-- Plan Feature — Autonomous plan generation -->`. A comment only hides text when markdown is *rendered*, and nothing renders these files — the two readers are Cursor's picker (raw first line) and the agent (sees either). So the comment form costs visible angle brackets and buys nothing.

**OpenCode is deliberately left alone** beyond the marker move. Its first line stays `**Session prompt:**` because the `$ARGUMENTS` anchor must stay at the top, and whether OpenCode reads a body description at all is unverified.

### Decision summary

<!-- prettier-ignore -->
| Host | Line 1 after this change | How |
| --- | --- | --- |
| Claude Code | frontmatter `description:` (unchanged, already correct) | no change |
| Cursor | `Plan Feature — Autonomous plan generation` | `applyT1` emits the description instead of discarding it |
| OpenCode | `**Session prompt:**` | marker sink only — known residual, see bottom |

### Do not touch

Marker text, the `bkit:managed` token, `MANAGED_MARKER_LINE_RE`, `MANAGED_MARKER_VERSION_RE`, the frontmatter branch of `stampManagedVersion`, `applyT2`, `applyOpencodeCommand`, or any agent render path. Agents keep frontmatter on all three hosts and are already correct.

Baseline: `dev` @ `8af127a0`, bkit 4.10.0. Branch `fix/386-managed-marker-placement`, PR into `dev`.

---

### Task 1 — `applyT1` emits the description instead of dropping it

**File:** `.bkit/src/bkit-install.ts:698`

```ts
// T1: Replace the leading YAML frontmatter block with its `description:` value as a
// plain first line, for Cursor commands. Cursor prints a command file's literal first
// line as the description in the picker and hover, and it does not read frontmatter —
// hence the strip. Dropping the description outright left whatever came next (the
// managed-version marker) standing in as the description (#386). Derived from the
// frontmatter at render time, so it cannot drift from the value Claude Code shows.
// No frontmatter, or frontmatter without `description`, falls back to a plain strip.
export function applyT1(content: string): string {
  const fm = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!fm) return content;
  const body = content.slice(fm[0].length).replace(/^\n+/, "");
  const eol = fm[0].includes("\r\n") ? "\r\n" : "\n";
  const raw = parseFrontmatter(fm[1]).get("description")?.trim() ?? "";
  const description = raw.replace(/^(['"])([\s\S]*)\1$/, "$2").trim();
  return description ? `${description}${eol}${eol}${body}` : body;
}
```

Two gotchas that will bite if skipped:

- **`parseFrontmatter` does not strip quotes.** It returns the raw right-hand side, so `description: "Plan Feature — …"` comes back **with** the double quotes. That is what the `.replace(/^(['"])([\s\S]*)\1$/, "$2")` is for — without it the picker shows the quotes.
- **Line endings.** The existing passthrough test at `.bkit/src/bkit-install.test.ts:486` feeds CRLF and asserts byte-equality. Deriving `eol` from the matched frontmatter keeps that contract; hardcoding `\n` breaks it.

### Task 2 — sink the marker below the first heading

Still needed: with Task 1 alone, `stampManagedVersion` would put the marker back on line 1, above the new description.

**File:** `.bkit/src/bkit-version.ts` — replace the final `return` of `stampManagedVersion` (currently line 287) with:

```ts
  // No frontmatter — the cursor/opencode command transforms remove it (applyT1 /
  // applyOpencodeCommand). A marker on line 1 becomes the IDE-visible command
  // description (#386), so sink it below the first heading when there is one.
  const heading = stripped.match(/^#{1,6} .*$/m);
  if (heading?.index !== undefined) {
    const cut = heading.index + heading[0].length;
    const head = stripped.slice(0, cut);
    const rest = stripped.slice(cut).replace(/^\n+/, "");
    return rest ? `${head}\n\n${marker}\n\n${rest}` : `${head}\n\n${marker}\n`;
  }
  return marker + "\n\n" + stripped.replace(/^\n+/, "");
```

**Idempotency is the one real correctness risk here.** Stripping an existing marker leaves a run of blank lines behind it, so the re-insert must collapse them — that is what `.replace(/^\n+/, "")` on `rest` does, and why the marker is re-emitted with exactly one blank line either side. The existing test at `.bkit/src/bkit-version.test.ts:410` stamps `"# H\n\nbody\n"` twice and compares bytes, so it catches a mistake here.

Also update the function's doc comment (lines 269-277) — "Falls back to a top prepend when the content has no frontmatter" is now only half true and must describe both branches.

### Task 3 — update the tests that assert the old behaviour

**`.bkit/src/bkit-install.test.ts`**, describe block `T1 — strip command frontmatter` (line 69). Four expectations change; rename the describe to something like `T1 — command frontmatter → description line`:

<!-- prettier-ignore -->
| Line | Was | Becomes |
| --- | --- | --- |
| 71 | `toBe("# Body here\n")` | `toBe("Build Feature\n\n# Body here\n")` |
| 76 | `toBe("# Content\n")` | `toBe("foo\n\n# Content\n")` |
| 81 | `toBe(input)` — no frontmatter | **unchanged** |
| 86 | `toBe("body\n")` | `toBe("x\n\nbody\n")` |
| 486 | `toBe("body\r\n")` — CRLF | `toBe("foo\r\n\r\nbody\r\n")` |
| 493 | BOM case, key is `desc:` not `description:` | **unchanged** (no description → plain strip) |

Add one test for frontmatter present but no `description` key, asserting the plain-strip fallback.

**`.bkit/src/bkit-version.test.ts`** — replace the test at line 402 ("prepends the marker + blank line when there is no frontmatter") with:

```ts
  it("sinks the marker below the first heading when there is no frontmatter", () => {
    const out = stampManagedVersion("# Ship Feature\n\nbody\n", "4.0.0");
    const lines = out.split("\n");
    expect(lines[0]).toBe("# Ship Feature");
    expect(lines[1]).toBe("");
    expect(lines[2]).toBe(managedVersionMarker("4.0.0"));
    expect(lines[3]).toBe("");
    expect(lines[4]).toBe("body");
  });

  it("sinks below the first heading even when a lead-in block precedes it (cursor/opencode command shape)", () => {
    const src = "Plan Feature — Autonomous plan generation\n\n# Plan Feature\n\nbody\n";
    const out = stampManagedVersion(src, "4.0.0");
    expect(out.split("\n")[0]).toBe("Plan Feature — Autonomous plan generation");
    expect(out).toContain(`# Plan Feature\n\n${managedVersionMarker("4.0.0")}\n\nbody`);
  });

  it("still prepends at top when there is no frontmatter AND no heading", () => {
    const out = stampManagedVersion("**Role:** hi\n", "4.0.0");
    expect(out.split("\n")[0]).toBe(managedVersionMarker("4.0.0"));
  });
```

Leave the idempotency, version-bump and blank-line tests alone — they now exercise the new branch for free.

### Task 4 — regression test on the composed render

**File:** `.bkit/src/bkit-install.test.ts` (it already owns the T-transforms; import `stampManagedVersion` from `./bkit-version`).

Compose the real chains from `bkit-modules.ts:577` (cursor) and `bkit-modules.ts:639` (opencode) over every source in `.bkit/workflows/`:

```ts
describe("#386: line 1 of a rendered command is a description, never the marker", () => {
  const src = path.join(REPO_ROOT, ".bkit/workflows");
  const files = fs.readdirSync(src).filter((f) => f.startsWith("bkit-") && f.endsWith(".md"));

  it("covers the whole workflow corpus", () => {
    expect(files.length).toBeGreaterThan(5);
  });

  for (const f of files) {
    const raw = fs.readFileSync(path.join(src, f), "utf-8");
    // The description Claude Code renders into its frontmatter — Cursor must show the same string.
    const expected = raw.match(/^description:\s*"?(.+?)"?\s*$/m)?.[1];

    it(`cursor: ${f}`, () => {
      const out = stampManagedVersion(applyT2(applyT1(raw)), "9.9.9");
      const lines = out.split("\n");
      expect(expected).toBeTruthy();
      expect(lines[0]).toBe(expected);
      expect(lines[0]).not.toContain("bkit:managed");
      expect((out.match(/bkit:managed/g) ?? []).length).toBe(1);
    });

    it(`opencode: ${f}`, () => {
      const out = stampManagedVersion(applyOpencodeCommand(raw), "9.9.9");
      expect(out.split("\n")[0]).not.toContain("bkit:managed");
      expect((out.match(/bkit:managed/g) ?? []).length).toBe(1);
    });
  }
});
```

**This must read `.bkit/workflows/` and compose in memory — it must NOT read `.cursor/commands/` or `.opencode/commands/`.** Those mirrors are force-overwritten output of `bkit install`; gating CI on them holds the build red until someone re-renders, which is the anti-pattern `.bkit/src/bkit-block-locality-audit.test.ts:364-391` spells out. Fix the source, the mirror follows.

If `substituteWorkflow` is trivially importable, add it to the chains to match `bkit-modules.ts` exactly. It does not touch the description or headings, so its absence would not weaken the assertion — include it for fidelity, not correctness.

### Task 5 — docs, in the same change

**`.bkit/workflows.md:180`** states the old placement outright — "after frontmatter (claude) or top (cursor/opencode strips frontmatter)". It now needs to describe both the description line and the new marker position, to the effect of:

> after frontmatter (claude), or below the first heading where the frontmatter was replaced by its `description` value as the first line (cursor/opencode)

**That file ships to consumers, so the replacement must not contain `#386`, `KN-*` or `DE-*`.** `.bkit/src/bkit-shipped-docs-refs.test.ts` scans every manifest-listed `.md` for `#` followed by two or more digits and fails the build. State the rule, not the change.

Check these two by reading, not assuming — both should come out unchanged:

- `.bkit/prompts.md:43` — describes agents only, which keep their frontmatter.
- `docs/architecture.md:144` — describes drift detection, makes no placement claim.

If any doc describes T1 as "strips frontmatter" in a way that is now wrong, fix it there too.

Add a `### Fixed` entry under `## [Unreleased]` in `CHANGELOG.md` (create the heading if absent, keeping the Added/Changed/Fixed order used in released sections), in house style:

> **Cursor's command picker shows the workflow description, not the version stamp.** Cursor prints a command file's literal first line as its description and does not read frontmatter, which is why `applyT1` strips it — but it dropped the `description:` value outright, so the `<!-- bkit:managed vX.Y.Z … -->` comment stamped immediately afterwards stood in as the description for all eight `/bkit-*` commands. `applyT1` now replaces the frontmatter with its `description` value as a plain first line, derived at render time so it cannot drift from the string Claude Code shows, and `stampManagedVersion` sinks the marker below the file's first heading whenever there is no frontmatter, falling back to the old top-prepend only for headingless content. OpenCode keeps `**Session prompt:**` on line 1 — its `$ARGUMENTS` anchor has to stay at the top — but no longer leads with an HTML comment. Agents were never affected on any host: they keep their frontmatter, so their marker already sat below it. Marker text is unchanged and the drift gate reads position-independently, so `bkit check` still hard-fails on a stale render.

### Task 6 — rebuild, re-render, gates

Once, at the end — not after each edit:

```bash
pnpm build                 # dist/ is committed and gated by pnpm check:dist
pnpm bkit upgrade          # re-render all mirrors + re-stamp .bkit/version
git config core.bare false # bkit install/upgrade flips this to true in this repo
pnpm typecheck
pnpm test
pnpm format
pnpm slop:delta
pnpm lint:prose
pnpm check:dist
pnpm bkit check
```

Then verify by hand:

```bash
head -5 .cursor/commands/bkit-plan.md
head -5 .opencode/commands/bkit-plan.md
for f in .cursor/commands/bkit-*.md .opencode/commands/bkit-*.md; do
  head -1 "$f" | grep -q "bkit:managed" && echo "STILL BROKEN: $f"
done
```

The loop must print nothing. Expected:

```md
# .cursor/commands/bkit-plan.md
Plan Feature — Autonomous plan generation

# Plan Feature (Workflow 2/6)

<!-- bkit:managed v4.10.0 — do NOT edit; run `bkit upgrade` to refresh -->
```

```md
# .opencode/commands/bkit-plan.md
**Session prompt:**

$ARGUMENTS

---
```

Commit the regenerated mirrors and `.bkit/version` alongside the source change — a source change without its render leaves `bkit check` hard-failing on `dev`.

### Task 7 — PR

Branch `fix/386-managed-marker-placement`, PR into `dev`, referencing `#386`.

CI does not fire automatically on branch pushes or `gh pr create` in this repo — dispatch it: `gh workflow run ci.yml --ref fix/386-managed-marker-placement`. Do not let a `[skip ci]` commit be HEAD when the PR is created.

---

### Known residual, flagged not fixed

OpenCode's first line stays `**Session prompt:**`. It is no longer an HTML comment, which clears the acceptance criterion, but it is not a description either. Giving it one means putting a line above the `$ARGUMENTS` anchor, and it is unverified whether OpenCode reads a body description at all — `.opencode/opencode.json` has no `command` block to carry one either. Raise a follow-up if it turns out to matter in practice.

### Acceptance criteria this closes

<!-- prettier-ignore -->
| Criterion | How |
| --- | --- |
| Cursor hover shows a human-readable description | Line 1 of every `.cursor/commands/bkit-*.md` becomes the source `description:`, e.g. `Plan Feature — Autonomous plan generation` — the exact wording the issue asked for |
| Marker present everywhere; `bkit check` hard-fails on drift | Unchanged: `detectRenderedPromptsStale` matches non-anchored over the whole file |
| `stampManagedVersion` stays idempotent | Blank-line collapse in Task 2, covered by the existing byte-equality test at `bkit-version.test.ts:410` |
| Tests cover no-frontmatter placement | Tasks 3 and 4 |

Task 4 asserts the picker string mechanically, so the only thing left for a human is confirming Cursor's hover once after the render.

## Implemented — 2026-08-25, commit `5587d133` on `dev` (not pushed yet)

Followed plan v2 (the comment that supersedes the marker-only v1 plan), with one process deviation: committed directly to `dev` rather than a branch + PR, per instruction. Not pushed to `origin` yet.

### What changed

- **`.bkit/src/bkit-install.ts` — `applyT1`:** instead of just stripping the command's YAML frontmatter, it now pulls the `description:` value out of that frontmatter and writes it as the file's plain first line before the body. Cursor reads a command file's literal first line as its picker/hover description and never looks at frontmatter — so previously, once the description was thrown away, the next thing written to the file (the version-stamp comment) became the description by default. Now the same string Claude Code shows in its own frontmatter appears there instead, and it's derived at render time, so the two can't drift apart. Frontmatter with no `description:` key still falls back to a plain strip, same as before.
- **`.bkit/src/bkit-version.ts` — `stampManagedVersion`:** when there's no frontmatter to stamp after (the Cursor/OpenCode case), the version-stamp comment no longer lands on line 1. It now goes below the file's first Markdown heading instead, so it can never again stand in as the visible description. Content with neither frontmatter nor a heading still gets the old top-of-file behavior, since there's nothing else to anchor to.
- Tests updated/added in `bkit-install.test.ts` and `bkit-version.test.ts` for both of the above, plus a new regression suite that renders every real workflow source through the actual Cursor and OpenCode transform chains and asserts line 1 is never the marker (and for Cursor, is the exact description string).
- Docs (`.bkit/workflows.md`, `.bkit/providers.md`) and `CHANGELOG.md` updated to describe the new placement.
- Rebuilt (`pnpm build`), re-rendered all mirrors (`pnpm bkit upgrade`), and ran the full local gate stack (typecheck, full test suite — 3551 passed, format, slop:delta, lint:prose, check:dist, bkit check) — all clean.

### Verified by hand

```
$ head -6 .cursor/commands/bkit-plan.md
Plan Feature — Autonomous plan generation

# Plan Feature (Workflow 2/6)

<!-- bkit:managed v4.10.0 — do NOT edit; run `bkit upgrade` to refresh -->

$ head -8 .opencode/commands/bkit-plan.md
**Session prompt:**

$ARGUMENTS

---

# Plan Feature (Workflow 2/6)
```

Matches what the plan predicted. No file under `.cursor/commands/` or `.opencode/commands/` has the marker on line 1 anymore.

### Left as-is (per plan's own call)

OpenCode's first line stays `**Session prompt:**` — its `$ARGUMENTS` anchor has to stay at the top for slash-command args to survive, and it's unverified whether OpenCode even reads a body description. It's no longer an HTML comment (which is what the acceptance criteria ask for), just not a real description either.

### Still open

The one acceptance box that needs a human: actually hovering `/bkit-plan` (and the other `/bkit-*` commands) in Cursor to confirm the picker shows the description text rather than something else. Everything else in the acceptance criteria is machine-verified above.

## #489 — Own only what a workflow runs; ship the rest as templates (closed)

## Idea

Reduce install to the files a workflow step runs or parses. Everything a person or another tool runs ships as a copy-and-own template. Upgrade always carries the latest templates and an advisory that names which template paths changed. The user adopts or leaves them.

Seed-or-print goes away for that second set. The first write, the hash baseline, the upgrade conflict, and the uninstall reclaim exist so bkit can claim the file still matches the installed version. Once the user decides whether to adopt, that claim is gone and the machinery has nothing left to do.

## Boundary

<!-- prettier-ignore -->
| Owns, overwrite on install / upgrade | Template, never written |
| --- | --- |
| A workflow step runs or parses it | A person or another tool runs it |
| Command files, agent prompts, rules the router reads, `.bkit/scripts/` those commands execute | CI, Husky, Vale, lint-staged, slop-scan config, MCP config, env samples, Dependabot, Renovate, Serena, graphify |

Shared files stay marker blocks. `AGENTS.md`, `CLAUDE.md`, `rules.md`, `.gitignore`. Both sides write the same file. A whole-file adopt would replace the user's half.

## Advisory

On upgrade, list the template paths whose bytes changed since the installed version. The user diffs those against their copy.

A single line "templates were updated" on every release gets skipped. No per-file ownership record and no drift hash. The list is "these paths changed in this version," not "your copy is behind."

Install instructions for the template set live in `.bkit/tooling.md`. A flag stays only where the bytes are computed from choices already made (tracker, TypeScript or not) and a missing file means the thing just turned on is not there. That is the workflow-owned set, not the template set.

## Already this shape

Dependabot, Renovate, Serena, and graphify. Install and upgrade never write them. See #444.

## Cost

bkit stops promising that a consumer's CI, hooks, and prose-lint config match the version they installed. That is the cut. Workflows must not call those files.

Related 
Simplify process: less prose, more scripts, one wording file #467
Serena Graphify code graph templates #444

Key files / folder
.bkit/templates.md describes it all (not tooling.md?)
.bkit/templates/ sub folders contains all templates that can be copied incl. scripts, settings etc
we do not automatically update or track we just ship latest templates and advisory they were updated leaving user to adopt or not

ship gether secret sync and prettier ignore script as templates as well!

## Settled plan (2026-10-07)

This comment records what was decided in review. Where it differs from the issue body, this comment wins. The body's boundary table was too coarse: it put MCP config and the gate scripts on the template side, and it missed that workflows still call some "template" files.

### 1. Seed-or-print goes away completely

Nothing bkit ships will be "write once, record a hash, warn on upgrade conflict, print merge instructions, take back on uninstall" any more. Every file falls into one of four groups instead:

<!-- prettier-ignore -->
| Group | Install / upgrade | Uninstall | What's in it |
| --- | --- | --- | --- |
| **Owned file** | Overwrites | Removes | `.bkit/workflows/`, `.bkit/prompts/`, agent and command copies, `docs/templates/bkit-plan.md` and `docs/templates/bkit-audit-*.md`, `.bkit/.env.example`, the remaining `.bkit/scripts/` files (only the slop plugin once #467 lands), and the **hook scripts**: `.claude/hooks/{preflight.sh,gateguard.cjs,guardrails.cjs,cloud-bootstrap.sh}`, `.codex/hooks/*`, `.cursor/hooks/*`, `.opencode/plugin/gateguard.js` |
| **Owned part of a shared file** | Rewrites only its part | Removes only its part | Markdown between `bkit:start` and `bkit:end`: `AGENTS.md`, `CLAUDE.md`, `.agents/rules.md`, `.agents/docs.md`, `docs/*.md`, `gitignore`, `.gitattributes`. JSON keys: hook entries and permissions in `.claude/settings.json`; `hooks.json` for Cursor and Codex; `permission`, `plugin`, `mcp` and `provider` in `.opencode/opencode.json`; the tracker entry under `mcpServers` in `.mcp.json` and `.cursor/mcp.json` |
| **Create if missing** | Writes once if absent, never again. No hash, no message | Leaves it | The record files (`docs/failures.jsonl`, `docs/deferrals.jsonl`, `docs/roadmap.md`, `.bkit/issues.jsonl`, `.bkit/friction.jsonl`, `.bkit/stats.jsonl`), `.agents/context.md`, `.agents/skills.md`, and the `bkit:gate:*` script **names** in `package.json` (the user owns what each one runs) |
| **Template** | Never applied. Reference copies refresh in `.bkit/templates/` (section 3) | Leaves the user's copies | Section 2 |

**Why the hooks and JSON keys stay bkit-managed, not templates:**
- **The hooks are part of the workflows.** They enforce what the workflows and prompts forbid (force push, `--no-verify`, `git reset --hard`), and they change in step with them. A stale copy means workflows run under old guards and nothing says so.
- **The JSON configs are generated from install choices.** `.bkit/templates/.opencode/opencode.json` carries `@@OPENCODE_TRACKER_MCP@@` and `@@OPENCODE_PROVIDER_KEY@@`, which install fills in. That is the body's own test for staying bkit-written.
- **The tracker MCP entry is what makes tracker steps work.** Tracker writes go only through MCP.
- **They change often.** Recent examples: #441, #458, #394, #381, #435. #381 already records exactly which keys bkit granted so uninstall can take them back, which is the mechanism this needs.

`.mcp.json` and `.cursor/mcp.json` are the one real change of kind. Today they are seed-or-print. They become "bkit owns its tracker entry, the user owns the rest of the file", using the same per-key replace `opencode.json` already uses (`.bkit/src/bkit-modules.ts:1930`).

### 2. What becomes a template

<!-- prettier-ignore -->
| Template | Copy to | Note |
| --- | --- | --- |
| `.github/workflows/ci.yml` | same path | Only after the #467 prerequisites (section 7) |
| `.github/workflows/bkit-cloud.yml` | same path | **Riskiest one.** Nothing in the workflows starts it, but it runs bkit and `bkit-counter-bus-config.sh:25` counts its runs. If bkit changes how it is called, an adopted copy breaks with only the changed-paths message as warning |
| `.github/workflows/renovate.yml`, `.github/renovate.json5`, `.github/dependabot.yml` | same paths | Already templates |
| `.husky/pre-commit`, `.husky/pre-push` | same paths | Workflows ban `--no-verify`, so every workflow commit runs the user's hooks. A failing hook blocks a workflow. That is the user's call |
| `.vale.ini`, `.vale/styles/House/*.yml` | same paths | Workflows only reach Vale through the user's `bkit:gate:*` scripts |
| `.lintstagedrc.json`, `slop-scan.config.json`, `.prettierignore`, `.envrc` | same paths | Same reasoning as Vale |
| `.cursor/settings.json`, `.cursor/environment.json`, `.cursor/Dockerfile` | same paths | Editor and cloud settings for the user's stack |
| `.serena/project.yml`, `.graphifyignore`, `docs/capabilities.md` | same paths | Already templates (#444). `.graphifyignore` stays at the repo root because graphify reads it there, the way git reads `.gitignore`. No `.graphify/` folder |
| `scripts/graphify/`, `scripts/serena/` | same paths | Already templates (#444). Moved from `scripts/tooling/<tool>/`. The `tooling/` level is gone |
| `scripts/secrets/` | same path | New: the gether secret sync script, labelled as an example |
| `scripts/prettier/` | same path | New: today's bkit-repo-only `scripts/tooling/insert-prettier-ignore.py` |

`isCopyPasteExample` (`.bkit/src/bkit-modules.ts:289`) now treats everything under the templates' root `scripts/` as a template. bkit's own scripts live under `.bkit/scripts/`, so new `scripts/<tool>/` folders are covered with no code change.

### 3. Where templates live and how upgrades announce them

- **Install copies the template set into the consumer's own `.bkit/templates/`.** It is bkit's folder, so this doesn't break "never write the user's files". Today templates exist only under `node_modules/@cbartens/bkit/.bkit/templates/` (checked in app-gether-life), so the "copy from `.bkit/templates/…`" paths in `.bkit/tooling.md` are wrong for consumers.
- **Upgrade overwrites `.bkit/templates/`.** The upgrade commit's `git diff` on that folder is the changelog.
- **The changed-paths message costs nothing.** Upgrade compares the old copy on disk with the new one before overwriting. No hash record and no release-time list are needed. The user or their agents diff and adopt, or don't.

### 4. `.bkit/templates.md` replaces `.bkit/tooling.md`

One document for the whole template set. Per template:
- what it does, and whether any bkit workflow cares (almost none do)
- where to copy it from and to
- how to install the tool behind it: install command, `package.json` scripts to add, `.gitignore` lines
- what to adapt for the repo
- known traps (e.g. graphify ignore rules can silently stop it resolving imports, from #444)

The install message becomes one line pointing to `templates.md`. The upgrade message lists the changed template paths plus the same pointer.

### 5. Rules point at the gate scripts, not at tools

`.agents/rules.md` stops listing tools and names the `package.json` gate scripts instead. `package.json` then becomes the one place that defines what "the checks" are. Workflows, pre-push and the rules all point at it. The shipped `docs/testing.md:227` already describes gates this way.

<!-- prettier-ignore -->
| Line | Change |
| --- | --- |
| `:103` Local pre-push | "`pnpm bkit:gate:static-unit`, then `bkit check`. Gate scripts MUST NOT run tests needing a deployed boundary / backing service." `bkit check` stays outside the gate, because it is bkit's own drift check and must not be removable |
| `:98` Fix code not gates | "(lint / format / types / test / slop)" becomes "anything a `bkit:gate:*` script runs" |
| `:107` Slop gate | Becomes conditional: "When the gate runs `slop:delta`: …". It stays in `rules.md`, because agents never read `templates.md` |

**The accepted cost:** if a user's `bkit:gate:static` is `echo ok`, every agent run and push goes green. Section 6 is how that gets noticed. Ignoring the finding is the user's recorded choice.

### 6. The gates audit checks every `bkit:gate:*` script

Edited in `.bkit/templates/docs/templates/bkit-audit-gates.md` and its installed copy `docs/templates/bkit-audit-gates.md`. Not committed yet.

- **Repo Gates scope** now names "every `bkit:gate:*` script in `package.json`".
- **Step 12 (Health)** treats each `bkit:gate:*` script as a landed gate. The audit follows every nested `pnpm <script>` down to the real commands and lists them.
  - Missing, empty, or can't fail (`echo`, `true`, `|| exit 0`): `CRITICAL`.
  - A command that exits 0 when its tool isn't installed: `HIGH`, with the tool and install step named.
  - One `Health` row per gate script, listing every command and which ones can skip.
- **Ignoring a finding** means a REJECT row in `docs/decisions.jsonl`, through the audit's existing Step 10. That is the "knowingly" record.
- **This repo will be flagged too.** `bkit:test:bats` and `bkit:lint:workflows` (`package.json:55,58`) print "skipping" and pass when their tool is missing.

**Audit cadence:** the gates audit runs when asked. The roadmap suggests it from time to time, and bkit does nothing more than that.

### 7. Prerequisites, done in #467 first

Workflows still depend on files in section 2. #467 rewrites exactly those lines, so the fixes belong there and #489 must not edit them separately:

- `bkit-ship.md:659,670,764` hardcode `ci.yml`. `bkit.ciWorkflow` already exists and `bkit-ship-gate.sh:142` reads it.
- `bkit-build.md:54` and `bkit-debug.md:54` hardcode the check-name pattern `bkit-tests|decide`. `bkit.capstoneJob` already exists and `bkit-ship-gate.sh:137` and `bkit-protect-main.sh:47` read it.
- Worktree setup hardcodes `.env .env.local apps/web/.env.preview apps/web/.env.production` (`bkit-ship.md:414` and the same step in build, debug, design and plan) and the Vale styles copy. #467 already plans `bkit.worktree.copy` / `bkit.worktree.install`.

### 8. What changes in code

- **Delete:** `writeTier3`, `tier3Hashes`, the merge-instruction text blocks (`bkit-modules.ts:2130` onward), the uninstall rule that takes back unchanged seeded files, and the upgrade conflict messages for template paths.
- **Modules:** the `ci` and git-hooks modules stop writing files. The lint module keeps only the owned slop plugin. The `--ci` flag goes.
- **Existing installs:** add every newly-template path to `RETIRED_MANAGED_PATHS`, so upgrade drops their hashes and keeps the user's files. Uninstall then leaves a user's `ci.yml` in place where today it may take an unchanged one back. Say so in the release notes.
- **Hashes stay for owned files.** #467 needs them to delete retired scripts only when the user hasn't edited them. Only template-set hashes go.
- **`.mcp.json` / `.cursor/mcp.json`:** switch to per-key replace of the tracker entry.
- **Install / upgrade:** copy `.bkit/templates/` into the consumer and print the changed-paths list.
- **`bkit check`:** assert the owned hook files exist. The hook commands are `test -f … && node … || true` (e.g. `.claude/settings.json:73,82`), so a missing `guardrails.cjs` silently turns the guard off.
- **Closing test:** no workflow or prompt names a template path.

### 9. Order

1. #444: commit and close (templates already in place, moved to `scripts/<tool>/`).
2. #467: including the section 7 prerequisites.
3. #489: mostly deletion in install code, plus `templates.md`, the `rules.md` edits, the gates-audit edit, the copy-to-`.bkit/templates/` step, and the closing test.

### 10. Proposed, not yet confirmed

**Source layout in the bkit package:**

```
.bkit/
├── templates.md      ← was tooling.md
├── workflows/  prompts/  src/
├── install/          ← NEW: what install writes (groups 1–3 above); the owned half of today's templates/
└── templates/        ← copy-and-own only (section 2), copied to the consumer's .bkit/templates/
```

Splitting today's `.bkit/templates/` means changing every install path constant and test fixture that names it. The cheaper option is to leave owned sources where they are and call the template folder `examples/`, but that goes against the "`.bkit/templates/` holds all templates" comment above.

---
_Generated by [Claude Code](https://claude.ai/code)_

## Build plan (2026-10-09)

The 2026-10-07 settled plan still stands. This comment records what has landed since, two new findings, the answer on converting scripts to Node, and the order of work. **#467 lands first.** Its build plan is on #467.

### 1. Already done

<!-- prettier-ignore -->
| Settled-plan item | Landed in |
| --- | --- |
| Section 4: `.bkit/templates.md` replaces `tooling.md`, and install copies it into the consumer's `.bkit/` | #444, 1ce3bc4b |
| Section 2: `scripts/graphify/`, `scripts/serena/`, `.serena/project.yml`, `.graphifyignore`, `docs/capabilities.md` | #444, 1ce3bc4b |
| Section 2: `scripts/secrets/` (Node) | 415b28aa |
| Section 2: `scripts/prettier/` (Node, replaces the Python original) | e89d09af |
| Section 6: the gates audit checks every `bkit:gate:*` script | 3a6561b6 |
| `isCopyPasteExample` covers everything under the templates' `scripts/` | #444, 1ce3bc4b |

### 2. Converting scripts to Node: one rule for templates

- **Rule:** a template is written in Node unless the tool it wraps already needs another runtime. It goes in `.bkit/templates.md` § Contract.
- **graphify and Serena stay as they are** (Python, plus shell launchers). Both tools are Python, so porting the helpers removes no dependency.
- **bkit's own `.bkit/scripts/*.sh` become TypeScript commands in #467**, not here.
- **The hook scripts stay shell and stay owned** (`preflight.sh`, `cloud-bootstrap.sh`).
- **bkit-repo leftover:** `scripts/tooling/linear-to-github-import.ts` and its README are the last files under `scripts/tooling/`. The README also names the wrong path (`scripts/linear-to-github-import.ts`). They move to `scripts/linear/`, with the README paths fixed. They are not a template.

### 3. New findings

- **Templates call bkit scripts.** `bkit-cloud.yml` sources `bkit-counter-bus-config.sh`, and `package.json` `slop:delta` runs `bkit-slop-delta.sh`. #467 switches these to `bkit` commands before retiring the scripts (#467 plan, section 2). After that, templates touch bkit only through the `bkit` command. That also lowers the `bkit-cloud.yml` risk from settled-plan section 2: a stable command name replaces a script path that could move.
- **Template headers still say "Tier-3 seed-or-print".** Eight files: `.envrc`, `.husky/pre-commit`, `.husky/pre-push`, `.prettierignore`, `.github/workflows/ci.yml`, `docs/deployments.md`, `docs/templates/bkit-audit-agents.md`, `.bkit/.env.example`.
  - Template files get the one-line header the graphify and Serena files use: "Example. Copy into the repo and own it."
  - Owned files (`.bkit/.env.example`, the audit template, the `docs/deployments.md` block) lose the seed-or-print wording.
- **`ci.yml:159` claims `bkit check` warns when its promotion-lag block drifts.** No such check exists in `.bkit/src/`. The comment is wrong today. As a template, the block is plain content and the comment goes.
- **`templates.md` has no install lines or tool links yet.** Settled-plan section 4 requires both for every template.

### 4. Where the consumer's templates come from (settles section 10)

**Decided (2026-10-09): copy only the template set, and leave the package layout alone.**

- Install and upgrade copy into the consumer's `.bkit/templates/` exactly the paths `isCopyPasteExample` matches.
- So the consumer's folder holds only templates. Owned sources never land there.
- The package's own `.bkit/templates/` stays mixed. Only bkit sees it, so no path constant or test fixture has to move.
- `isCopyPasteExample` gets renamed `isTemplate`. Its exact-path list grows by the section-2 rows still to convert: `ci.yml`, `bkit-cloud.yml`, `.husky/*`, `.vale.ini`, `.vale/styles/House/*`, `.lintstagedrc.json`, `slop-scan.config.json`, `.prettierignore`, `.envrc`, `.cursor/{settings.json,environment.json,Dockerfile}`.

The full `install/` + `templates/` split proposed on 2026-10-07 would buy the same result for consumers at the cost of moving every install path. Rejected.

**Also decided (2026-10-09), on #467:** no shim scripts when #467 retires a script. The upgrade message names each consumer file that still calls a retired path.

### 5. Order of work

Each wave is its own commit on `dev`, green before the next.

**Wave 1: templates are templates**
- Grow `isTemplate` to the full section-2 list.
- Install and upgrade copy that set into the consumer's `.bkit/templates/`. Upgrade first compares old and new bytes, then prints the changed paths plus a pointer to `.bkit/templates.md`.
- Add every newly-template path to `RETIRED_MANAGED_PATHS`. Upgrade drops their hashes and keeps the user's files.
- Rewrite the template headers (section 3).
- Release note: uninstall now leaves a consumer's `ci.yml` and hooks in place.

**Wave 2: delete seed-or-print**
- Delete `writeTier3`, `tier3Hashes`, the merge-instruction blocks, the uninstall reclaim for seeded files, and the upgrade conflict messages for template paths.
- The `ci` and git-hooks modules stop writing files. The lint module keeps only the owned slop plugin. The `--ci` flag goes.
- `canonicalHashes` stays for owned files, because #467's retire step uses it.
- The record files, `.agents/context.md`, `.agents/skills.md` and the `bkit:gate:*` script names become create-if-missing: written once, no hash, no message.

**Wave 3: shared files**
- `.mcp.json` and `.cursor/mcp.json`: bkit replaces only its tracker entry under `mcpServers`, the same per-key replace `opencode.json` uses.
- `bkit check` fails when an owned hook file is missing. The hook commands are `test -f … && node … || true`, so today a missing `guardrails.cjs` turns the guard off without a word.

**Wave 4: rules and docs**
- `.agents/rules.md`, all still unchanged:
  - `:103` Local pre-push: "`pnpm bkit:gate:static-unit`, then `bkit check`".
  - `:98` Fix code not gates: "anything a `bkit:gate:*` script runs".
  - `:107` Slop gate: "When the gate runs `slop:delta`: …".
- `.bkit/templates.md` gets a section for every section-2 template: what it does, copy from and to, install command and tool link, `package.json` scripts, `.gitignore` lines, what to adapt, known traps.
- Move `scripts/tooling/linear-to-github-import.*` to `scripts/linear/`.
- Refresh this repo's own adopted copies so they match the templates byte for byte, unless a difference is a deliberate repo adaptation.

**Wave 5: close**
- The closing test is #467's (no workflow or prompt names a template path). #489 adds one test: install writes nothing outside `.bkit/` for a template path, and upgrade never touches a consumer's adopted copy.
- Dogfood: install, upgrade and uninstall from a packed tarball in a clean folder, plus `bkit upgrade` on this repo.

---
_Generated by [Claude Code](https://claude.ai/code)_

## Proposal: ship context-fetch blocks as templates (2026-10-10)

### The need

app-gether-life has built up a lot of working debug context in `.agents/config.md`:

- **14 fetch blocks** below `bkit:end`, which are what `/bkit-debug` runs: GitHub CI failures, diff against the last green run, Playwright, Maestro iOS, Tavily, Sentry, Vercel, Supabase, Stripe, Resend, Inngest, Cloud Run, Expo builds and Expo workflows.
- **4 cloud provision blocks** (vercel, serena, cloudrun, expo). These install a block's CLI in cloud sessions.
- **About 140 lines of allowed domains** for the cloud egress proxy.
- **An `mcp-servers` list.**

bkit ships only 6 examples (github ci, github diff, playwright, vercel, supabase, tavily), and they sit *inside* the managed block of `.agents/context.md`. A new consumer starts nearly from scratch, and gether's blocks show the proven shape: self-gating, bounded output, region hosts, and the empty-result-is-not-clean warnings.

### A problem this exposed in #489 as built

Wave 2a (ef1f09a7) made `.agents/context.md` **create-if-missing**, as the settled plan grouped it: written once, never touched again. But the managed half of that file is not just examples. It is the **rules** that `/bkit-debug` and `bkit install` parse against:

- the `context-fetch:start`, `:provision`, `allowed-domains` and `mcp-servers` marker formats;
- the self-skip contract;
- the apex-domain rule.

With create-if-missing, those rules freeze at the version a consumer first installed, while the code that reads the blocks keeps moving. That is the "stale doc agents act on" failure.

**Recommendation:** `.agents/context.md` goes back to **owned part of a shared file**. bkit rewrites the block between `bkit:start` and `bkit:end` on install and upgrade, and never touches anything below `bkit:end`. That is how it worked before Wave 2a, and it is the same rule as `AGENTS.md`, `rules.md` and the `docs/*.md` blocks. The plan's create-if-missing group then holds only `.agents/skills.md` and the `bkit:gate:*` names.

### Suggested approach

1. **One template file per provider** in `.bkit/templates/context-fetch/<name>.md`, holding everything that provider needs in one place:
   - the fetch block, plus its provision sibling if it has a CLI;
   - the env vars, split into secret (from env or dashboard) and non-secret (set inline so cloud agents inherit it);
   - the `allowed-domains` lines it needs (only hosts bkit's egress registry does not already derive);
   - the `mcp-servers` names, if it has an MCP;
   - its `# Customise:` knobs.

   Install copies them raw into the consumer's `.bkit/templates/`, and upgrade lists the ones that changed, like every other template.
2. **Move the 6 examples out of the managed block** into that folder. The managed block keeps only the rules and points at `.bkit/templates.md`, which makes it short and stable.
3. **Scrub gether specifics into placeholders**, in the same style as `{{CLOUD_RUNNER}}`:
   - org and project slugs (`bartens`, `gether-life`);
   - GCP project ids;
   - app domains (`gether.life`);
   - the Sentry EU region host, which becomes a commented option.

   Marker names use the current `context-fetch` spelling; gether is still on `debug-fetch` in `config.md`.
4. **`.bkit/templates.md` § Context-fetch blocks.** One table row per provider (context, what it fetches, env vars, domains, CLI), plus the adoption steps:
   - copy the block below `bkit:end`;
   - add its domains and MCP names to your lists;
   - set the env vars.
5. **No separate allowed-domains or MCP template.** The domains and servers a block needs travel with that block. The consumer's own app domains stay theirs.
6. **Test the mechanics:** every template file has matched marker pairs, and run with its env unset, each block exits 0 with a `[context-fetch:<name>] skipped —` line on stderr.

### Scope

This uses the template mechanism #489 just built, and the context.md grouping fix above corrects a #489 decision. So I suggest doing it in #489 as a wave before the close wave, rather than as a separate issue. Separately, gether should then upgrade, so that the existing `config.md` → `context.md` migration runs.

---
_Generated by [Claude Code](https://claude.ai/code)_

## Decided (2026-10-10): context-fetch templates and context.md ownership

The proposal above is agreed, with one change:

- **Folder:** `.bkit/templates/context/`, one file per provider. Each file holds the fetch block, its cloud provision block, its env vars, the domains it needs and its MCP server names.
- **`.agents/context.md` goes back to owned part of a shared file.** bkit keeps the block between `bkit:start` and `bkit:end` current and never touches anything below `bkit:end`. Only `.agents/skills.md` and the `bkit:gate:*` names are create-if-missing.
- **Order:** both land as one more #489 wave before the close wave.

---
_Generated by [Claude Code](https://claude.ai/code)_

## Done (2026-10-10)

bkit now writes only the files its workflows actually run. Everything else ships as a template: a reference copy the consumer reads and adopts by hand.

### What landed (on `dev`, 605051db..64fa2dc9)

- **Templates are templates.** Install and upgrade never write a template file into the repo. A raw copy of every template goes to the consumer's `.bkit/templates/`, and upgrade prints which template paths changed. `.bkit/templates.md` has one section per template, covering what it is for, its placeholders, and how to adopt it.
- **Seed-or-print is gone.** Gate tool scripts, their devDependencies and the husky `prepare` script are templates now. Core still seeds the `bkit:gate:*` script names into `package.json`, but only when they are missing, and warns when a gate has nothing behind it.
- **Removed:** the `--ci` flag, the ci and git-hooks modules, `bkit.runners`, `uninstall --package` and `--keep-tooling`, and `.bkitignore` (along with its picomatch dependency).
- **What bkit owns in shared files is narrower.**
  - In `.mcp.json` and `.cursor/mcp.json`, bkit owns only its tracker entry.
  - `.agents/context.md` keeps a block between the bkit markers that bkit owns and refreshes. Everything below the end marker belongs to the consumer.
  - `.agents/skills.md` works the same way: bkit refreshes its block, and the consumer's skills below the end marker are never touched.
- **Context-fetch blocks ship as templates.** There are 13 provider files in `.bkit/templates/context/`, one per provider: github, expo, maestro (iOS and Android), playwright, sentry, vercel, supabase, stripe, resend, inngest, cloudrun, tavily and serena. Each has its block, its allowed domains and its MCP names. The § Context-fetch blocks table in `.bkit/templates.md` lists them all.
- **`bkit check` fails when a hook file bkit owns is missing.** `cloud-bootstrap.sh` counts as missing only when cloud agents are set to claude.
- **Gateguard skips `.bkit/templates/` in consumer repos**, so editing a reference copy does not trip the gate.
- **Comments, docs and templates describe how things work now.** The reasons that used to sit in comments are decision rows in `docs/decisions.jsonl`.
- **Fixed on the way (#467):** `bkit ci slop` was reading only about 64 KB of slop-scan's report, so the gate failed on large changes even when the scan passed. It now reads the whole report.

Checks: 4914 tests pass, slop:delta, format and graph:check pass, and `bkit check` reports 0 writes. Dogfood from a packed tarball passed a fresh install, adoption, an upgrade from the published 4.12.0 and an uninstall.

### Release notes

- Uninstall deletes `.bkit/templates/` and leaves anything adopted from a template in place.
- Whole-repo gates (lint, format, spell check) should ignore `.bkit/templates/`, because those files are reference copies.
- `.bkit/.env.example` is owned by bkit; edits to it are overwritten on upgrade.
- `.bkit/version` has no `tier3Hashes` field, and upgrade does not read one. The two existing installs get their `.bkit/version` fixed by hand.
- Removed flags: `--ci`, `--tooling`, `uninstall --package`, `uninstall --keep-tooling`. The `bkit.runners` key is removed.
- Install no longer adds tool scripts or devDependencies to `package.json`; adopt them from `.bkit/templates.md` § Gate tool scripts.

## Templates: what #489 did (2026-10-10)

A **template** is a file bkit ships but never writes into your repo. You copy it, edit it, and own it from then on. bkit keeps the latest version beside your copy, so you can see what changed.

### How templates reach a consumer

- **Install and upgrade never write a template into the repo, and never overwrite your copy.**
- **Every install and upgrade copies the full set to your `.bkit/templates/`, unchanged.** No placeholders are filled in, so the copy is exactly what bkit ships. That makes `git diff .bkit/templates` on an upgrade commit the list of template changes.
- **Upgrade lists the template paths that changed, were added or were removed,** so you know which of your copies to compare.
- **Templates that leave the set are deleted from `.bkit/templates/`,** and `bkit check` flags a copy that is out of date.
- **`.bkit/templates.md` is the index.** For each template it says what it does, where to copy it, its placeholders, and how to install the tool behind it.
- **The rule for what counts as a template is `isTemplate`** (`.bkit/src/bkit-modules.ts`): a fixed list of paths, plus everything under `scripts/`, `.vale/styles/House/` and `context/`.
- **Templates carry no `bkit:start`/`bkit:end` blocks.** Only files bkit writes have them, so a block always means bkit refreshes that part.

### Files bkit used to write that are now templates

- **CI and cloud:** `.github/workflows/ci.yml`, `.github/workflows/bkit-cloud.yml`.
- **Dependency updates:** `.github/workflows/renovate.yml`, `.github/renovate.json5`, `.github/dependabot.yml`.
- **Git hooks:** `.husky/pre-commit`, `.husky/pre-push`.
- **Formatting and lint config:** `.prettierignore`, `.lintstagedrc.json`, `.vale.ini` and the four Vale House styles, `slop-scan.config.json`.
- **Editor and environment:** `.envrc`, `.cursor/settings.json`, `.cursor/environment.json`, `.cursor/Dockerfile`.
- **Code-map and symbol tools:** `.graphifyignore`, `.serena/project.yml`, `docs/capabilities.md`.
- **Per-tool scripts** under `scripts/`: graphify, prettier, secrets, serena.

**On upgrade, your existing copy of any of these stays where it is.** bkit drops only its recorded hash for the file (`RETIRED_MANAGED_PATHS`). Without that, an old hash could exempt the file from checks.

**bkit spots an adopted `ci.yml` by its job names.** The CI advisories (missing actionlint, run-step injection, capstone contract) look for `bkit-tests` / `bkit-tests-<lane>` jobs, not for markers.

### `package.json` is no longer edited for tooling

- **No tool scripts, devDependencies or husky `prepare` are added.** `.bkit/templates.md` § Gate tool scripts lists them for you to add.
- **bkit adds only the `bkit:gate:*` script names, and only if they are missing.** `bkit check` warns when a gate name has nothing behind it.
- **Uninstall never touches `package.json` scripts or devDependencies.**

### Context-fetch blocks (`.bkit/templates/context/`)

A context-fetch block is a shell snippet in `.agents/context.md` that pulls evidence for an agent, such as a failing CI log, an e2e report or production errors. There is **one file per provider** (13):

<!-- prettier-ignore -->
| File | Blocks |
| --- | --- |
| `github.md` | the failing CI run (`context=ci`); the diff since the last green CI run (`context=diff`) |
| `expo.md` | runtime (`context=runtime`); EAS workflow e2e evidence (`context=e2e`), each with its own install step and allowed domains |
| `maestro.md` | every failed Maestro job in the run, for iOS and Android lanes (`context=e2e`) |
| `playwright.md` | e2e report artifact |
| `sentry.md`, `vercel.md`, `supabase.md`, `stripe.md`, `resend.md`, `inngest.md`, `cloudrun.md` | that service's errors and logs |
| `tavily.md` | web search |
| `serena.md` | install step for the Serena symbol server |

- **Each file holds** its block or blocks, any install step, the allowed domains bkit doesn't already add, and any MCP server names.
- **Each block skips itself with a log line** when its tool or token is missing. A test runs every block with no tokens set to prove it.
- **No app-specific value is left in them.** Project names, domains and IDs are placeholders listed in `.bkit/templates.md`.
- **Adopting one:** copy a block below `<!-- bkit:end -->` in `.agents/context.md`, add its domains and MCP names to your lists, and set its environment variables.

### Files bkit keeps current

- **`.agents/context.md` and `.agents/skills.md`:** bkit refreshes only the block between its markers. Everything below `bkit:end` is yours: your fetch blocks, and your project skills.
- **There is no longer a "write once" group.** Every shipped file is either kept current by bkit (the whole file or its block) or a template.
- **Every file and block bkit writes carries a version marker,** `bkit:managed vX.Y.Z — do NOT edit; run bkit upgrade to refresh`, in that file's comment style:
  - markdown: `<!-- … -->`;
  - shell, `.gitignore`, `.gitattributes`, `.env.example`: `# <!-- … -->`;
  - JS hooks and scripts: `// …`.

  JSON files can't hold comments, so they carry none.
- **`bkit check` flags any marker left at an older version** (`bkit-managed-stale`). That catches a bkit update that was never re-applied. It blocks on main/dev and is advisory on feature branches. It replaces `bkit-rendered-prompts-stale` and `bkit-managed-docs-stale`.
- **The list of checked files is worked out from what install writes,** and a test fails if any written file lacks the marker.
- **Every release touches every managed file,** because the marker carries the version.

### Template contents

- **Template comments say what each part does**, never why or what came before. The reasons are recorded in `docs/decisions.jsonl`.
- **The repo's own copies follow the templates.** bkit's `.github/workflows/renovate.yml`, `.vale.ini`, the House styles and `.prettierignore` match their templates byte for byte. `bkit-cloud.yml` differs only in its runner label, plus its `bkit:start`/`bkit:end` lines, which are still there pending sign-off.
- **Gateguard (the hook that asks an agent to justify a new file) skips anything under `.bkit/templates/`** in a consumer repo, so editing a reference copy doesn't trip it.

## Work after the close (2026-10-10)

What landed on `dev` after the closing comment, plus the two pieces still running. The template details are in the "Templates: what #489 did" comment above. This comment covers everything, so nothing is missing from the record.

### Comments describe current state only (e4d5b78f, 53447d4f, 64fa2dc9)

- **Code comments say what the code does,** never why, what came before, or which issue changed it. This covers 173 source, hook, template and test files, plus the CI workflows (`ci.yml`, `bkit-cloud.yml`, `renovate.yml`) and their templates.
- **Every reason taken out of a comment is a row in `docs/decisions.jsonl`:** 20 from the source pass, 12 from the follow-up, and 27 from the workflows. Where no reason had ever been written down, the row says so.
- **Two workflow comments described the wrong behaviour and are corrected:**
  - unit coverage leaves out five files, not one;
  - a dropped dev dispatch is reported in the job summary, not `status.jsonl`.
- **`.agents/rules.md` (and its template) says "Comments explain what, not why".**
- **Leftovers fixed:**
  - a parity test now actually injects a mismatch;
  - two duplicate tests are removed;
  - `cloud-bootstrap.sh` messages point at `.bkit/cloud.md` instead of bkit's private tracker.

### Context-fetch templates: one file per provider (33d73e55, 8d5cc16d)

- **`.bkit/templates/context/` has 13 files, one per provider.**
  - `github.md` holds the failing-CI block (`context=ci`) and the diff-since-green block (`context=diff`).
  - `expo.md` holds the runtime block and the EAS e2e block, each with its own install step and allowed domains.
  - `maestro.md` covers iOS and Android lanes.
- **The `maestro` block prints every failed Maestro job in the run,** each under its own heading, so iOS and Android failing together both reach the agent. `MAESTRO_JOB_RE` names the lanes. The block name is `maestro`, and the variables are `MAESTRO_*`.
- Block code is unchanged except for maestro's loop over jobs. Tested against a fake `gh`: it prints failed iOS and Android jobs, leaves out a web lane and a lane that passed, and skips cleanly with the placeholder name.

### Version marker on every file bkit writes (802d94f4)

- **Every file and block bkit writes or refreshes carries `bkit:managed vX.Y.Z — do NOT edit; run bkit upgrade to refresh`,** in the file's comment style. JSON files carry none, because JSON can't hold comments. That is 290 files in a fresh all-hosts install.
- **`bkit check` reports `bkit-managed-stale` for any marker at an older version.** It blocks on main/dev and is advisory on feature branches. It replaces `bkit-rendered-prompts-stale` and `bkit-managed-docs-stale`.
- **The list of checked files comes from what install writes** (`listStampedFiles`). An integration test fails if any written file lacks the marker. It also sets every marker back to an older version and checks that `check` flags them all and `upgrade` restamps them with no conflicts.
- **Found and fixed on the way:**
  - Codex agent files were never stamped, and Codex skill files were stamped but never checked.
  - A fresh install of `cloud-bootstrap.sh` never exactly matched its refreshed version, because blank lines were missing in its block.
- **`.agents/skills.md` is a block bkit refreshes,** like `.agents/context.md`. The write-once group (`CREATE_IF_MISSING_PATHS`, `writeIfAbsent`) is deleted.
- **Templates carry no `bkit:start`/`bkit:end` blocks.** The CI advisories recognise an adopted `ci.yml` by its `bkit-tests` jobs.

### This repo's own workflows (8daf4992)

- **`.github/workflows/bkit-cloud.yml` is the template with `ubuntu-latest` as the runner,** and nothing else differs.
- **`ci.yml` no longer names a template block.**

### Ledgers

- **Decision rows:**
  - one each for the marker, the derived check list, the token in bkit's own source docs, templates without blocks, and `skills.md` as a block;
  - updated rows for the three file groups (owned file, owned block, template) and for the context templates.
- **Deferral:** the #467 untrusted-input render-time deferral is closed (2a21a2be).

### Checks at 8daf4992

- All 4876 tests pass, and format, slop, graph and actionlint pass.
- Upgrading this repo gives 0 conflicts, and `bkit check` reports 0 writes.
- Tarball dogfood:
  - fresh install, then `check` at 0 writes;
  - three markers set back are flagged as 3 of 290;
  - upgrade fixes them with no conflicts;
  - uninstall keeps the consumer's lines.

### In progress

- **Full dogfood.** Every file this repo copied from a template becomes that template with only the adaptations `.bkit/templates.md` allows. Where the repo's copy is better, the improvement moves into the template. `ci.yml` is rebuilt from the template. A test will check every adopted copy.
- **Dead-code removal.** A whole-repo scan, removing unused features, code, tests and docs. The first known cases are named blocks and the `optional` block flag, which no shipped file uses since templates lost their blocks.

This comment will be updated when both land.

## Review of what landed (2026-10-10)

**Short answer: #489 is done in substance, and nothing from the plan is missing outright.** The gaps are wording that still describes the old install, one release note and one decision row that disagree with the code, a closing test that covers less than it claims, and a few weak tests. The #467 review comment covers the workflows and commands; this one covers only #489's own scope.

**How this was checked.** I compared HEAD (`8daf4992`) with every commitment in the 2026-10-07, 2026-10-09 and 2026-10-10 comments. A reviewer read the source, ran the template and context tests (109 pass) and the 7 #489 upgrade integration tests, and dogfooded the committed `dist/` in a fresh repo: install, adopt a template, check, upgrade, check, uninstall. The results:
- install wrote 52 template copies and nothing outside `.bkit/templates/`;
- upgrade printed the changed template path and left the adopted `ci.yml` alone;
- the second check reported 0 writes;
- uninstall kept the adopted `ci.yml`, `.husky/pre-push` and the `bkit:gate:*` scripts, and removed `.bkit/templates/`.

Items marked ✔ I re-checked myself. The live working tree has another session's in-progress dogfood and dead-code edits, so this review doesn't cover them. Item 6 may already be fixed there.

### Done as planned

All of this is in the code:
- seed-or-print and `tier3Hashes` are gone; only the one-time fold on first upgrade remains;
- `--ci`, the ci and git-hooks modules, `bkit.runners`, the uninstall flags and `.bkitignore` are gone;
- `isTemplate` and the template copy step are in place;
- bkit owns only its tracker entry in `.mcp.json` and `.cursor/mcp.json`;
- the newly-template paths are in `RETIRED_MANAGED_PATHS`;
- the three `.agents/rules.md` edits landed;
- `bkit check` checks that the hook files bkit owns exist;
- gateguard skips `.bkit/templates/`;
- the linear import script is in `scripts/linear/`;
- every file and block bkit writes carries the version marker, and `bkit-managed-stale` flags old ones;
- the gates audit checks every `bkit:gate:*` script;
- the 13 context-fetch templates exist, with the test that each block skips itself when its env vars are unset.

Two things were decided differently from the plan, and both have decision rows:
- `.agents/context.md` and `.agents/skills.md` are blocks bkit refreshes, and the write-once group is deleted (`docs/decisions.jsonl` lines 276 and 281).
- The record files are created by the commands that first write to them, not by install (lines 195 and 211).

### Wrong or stale now

<!-- prettier-ignore -->
| # | What's wrong | Where |
| --- | --- | --- |
| 1 ✔ | **The install advisory still talks about "the seeded ci.yml install step".** bkit no longer writes a `ci.yml`, and the dogfood install printed this into a repo that has none. | `.bkit/src/bkit-postinstall.ts:1978-1979`, `:1288` |
| 2 ✔ | **The release note in the "Done" comment is wrong about uninstall.** It says uninstall "leaves template copies … in place". The code deletes `.bkit/templates/` whole (`bkit-uninstall.ts:751-761`). `.bkit/templates.md:47` and `.bkit/install.md:430,467` describe the code correctly. What uninstall does leave is anything *adopted* from a template. There is also no #489 CHANGELOG entry yet. | issue comment, CHANGELOG |
| 3 ✔ | **Decision row `489-own-only-what-a-workflow-runs-four-file-groups` disagrees with uninstall.** It says uninstall removes the owned `docs/templates/bkit-*.md` files and strips the `docs/*.md` blocks. Uninstall never touches `docs/`, and `.bkit/install.md:467` says that is deliberate. Either the row or the code has to change. Nothing written down says which is intended. | `docs/decisions.jsonl:275` |
| 4 ✔ | **The closing test doesn't take its list from `isTemplate`.** The #467 comment says "the names come from the templates folder, so a new template is covered automatically". In fact `bkit-template-path-refs.test.ts:21-33` reads only `.github/workflows/`, `scripts/` and `context/`, plus a hand-written list. It misses `.prettierignore`, `.cursor/*`, `.serena/project.yml`, `.graphifyignore`, `docs/capabilities.md`, `.github/renovate.json5` and `.github/dependabot.yml`. So it can't see that `.bkit/prompts/bkit-design-review-1.md:48` reads `docs/capabilities.md` "when present". That may be an acceptable read, since it's optional, but the test should be the one deciding. | `.bkit/src/bkit-template-path-refs.test.ts` |
| 5 | **"`bkit check` warns when a gate has nothing behind it" is narrower than it sounds.** It warns only when a gate still has bkit's default value and a script that value calls is missing (`bkit-modules.ts:1057`). A gate set to `""` or `echo ok` gets no warning. The gates audit catches that case, but `bkit check` doesn't. | release note, `bkit-modules.ts:1057` |
| 6 | **The "byte for byte" claim isn't true yet.** This repo's `.vale.ini` and `.prettierignore` both lack the `.bkit/templates/` exclusion their templates have. The repo's `.cursor/Dockerfile` still has `bkit:start`/`bkit:end` markers. This is the dogfood work marked in progress, so it may already be fixed in the working tree. | repo root |
| 7 | **`templates.md` is missing tool links** for Dependabot, Renovate, Serena, graphify and opencode, and install commands for Dependabot and Renovate. The 2026-10-07 plan asked for both on every template. | `.bkit/templates.md` |

### Old wording left behind

- `templates/scripts/graphify/bkit-graph-pre-push.sh:2` and `.bkit/templates.md:318` say to paste "below the bkit-managed block in `.husky/pre-push`". The pre-push template has no block any more.
- `templates/scripts/serena/bkit-serena-mcp.sh:14` still names `.agents/config.md` and the old `debug-fetch:provision` marker.
- User-facing text still says "Debug-fetch" (`bkit-postinstall.ts:1903`, `bkit-cloud-env.ts:847`) and "## Debug Fetch" (`templates/.agents/context.md:17`).
- `.claude/agents/utility-pre-release-check.md:52` still lists a "seed-once" file class. That agent is hand-written, so no mirror regeneration will fix it.
- `bkit-telemetry.ts:47` names app-gether-life in a comment.

### Weak tests

- **Both #489 upgrade integration tests return early, and so pass, when `tsx` is missing** (`bkit-upgrade.integration.test.ts:581,604`). They ran in this review, but nothing stops a machine without `tsx` from skipping them silently.
- **The context-template test's `/gether|bartens/i` check also matches "together".** It will fail falsely the day a template uses that word. A word-boundary match would fix it.
- **Not confirmed, medium confidence:** the Vale advisory tells a consumer with no `.vale.ini` to run `vale sync`, which fails without a config.

### Dropped with no decision recorded

- Uninstall removing the `docs/**` files bkit owns (item 3).
- The CHANGELOG release note (item 2).
- The full "warn when a gate is empty" check (item 5).
- Tool links and install commands for every template (item 7).

### Suggested fixes

1. Correct the release note here (uninstall removes `.bkit/templates/` and keeps adopted copies), and add the CHANGELOG entry.
2. Decide item 3. Leaving `docs/` alone on uninstall matches `install.md`, so I'd change the decision row rather than the code.
3. Build the closing test's list from `isTemplate`, so a new template really is covered automatically.
4. Sweep the old wording above and add the missing `templates.md` links. Both are mechanical.
5. Make the two integration tests fail, not return, when `tsx` is missing.

---
_Generated by [Claude Code](https://claude.ai/code)_

## Review fixes and migration removal (2026-10-10)

This comment covers the fixes for the [review](https://github.com/cbartens/bkit/issues/489#issuecomment-6095032420) and the removal of all migration code. Commits on `dev`:
- `359035ff`: review wording, links and the closing test;
- `8badea26`: code;
- `8c52183e`: mirrors and the capability register;
- `b4573cfe`: the new project rule and decision rows.

Nothing is pushed yet. **Tests were written or edited but not run**, because the owner asked for the test pass to come later. `pnpm build` compiled cleanly.

### Review items
- **Item 1, fixed.** The install advisories describe `ci.yml` as a template the consumer adopts. Three places still talked about a seeded install step.
- **Item 2, fixed.** The "Done" comment's release notes now say uninstall deletes `.bkit/templates/` and keeps what was adopted. Its stale lines are corrected too: the `tier3Hashes` fold, the 15 context files and the written-once `skills.md`. `CHANGELOG.md` has an Unreleased entry for #489.
- **Item 3, waiting for your call.** The decision row says uninstall removes bkit's `docs/` files; the code leaves `docs/` alone. The reviewer suggests changing the row.
- **Item 4, fixed.** The closing test takes its names from every file `isTemplate` accepts. That covers the seven templates it missed. The `docs/capabilities.md` read in `bkit-design-review-1` is held as one narrow allowance, because it is optional ("when present").
- **Item 5, waiting for your call.** `bkit check` still warns about a gate only when the gate has bkit's default value and a script behind it is missing.
- **Item 6, no change needed.** `.cursor/Dockerfile` is identical to its template. `.vale.ini` and `.prettierignore` leave out the `.bkit/templates/` exclusion on purpose, because here that folder is source. The dogfood test records both.
- **Item 7, fixed.** `templates.md` links Dependabot, Renovate, Serena, graphify and opencode, and has install commands for Dependabot and Renovate. **Real bug found:** the Serena install command installed an unrelated PyPI package called `serena`. It is now `uv tool install -p 3.13 serena-agent`.
- **Old wording, fixed:**
  - the graphify pre-push and Serena scripts (template and this repo's copy);
  - "Debug-fetch" is now "Context-fetch", and "## Debug Fetch" is now "## Context Fetch";
  - `.agents/context.md`'s `# Config` heading is now `# Context`;
  - `utility-pre-release-check` lists the three file groups;
  - the app-gether-life name is gone from the `bkit-telemetry.ts` comment.
- **Weak tests, fixed:**
  - the five tests that need `tsx` fail instead of returning early when it is missing;
  - the name check uses word boundaries, so "together" no longer matches.
- **Vale advisory, fixed.** It was confirmed to say `vale sync` without a `.vale.ini`. It now says to copy the `.vale.ini` template first.

### Migration code removed

Only two installs exist and we control both, so code that carries old installs forward is dead (decision `489-no-migration-code`). About 10,900 lines are gone, mostly tests and fixtures.
- **Deleted modules:** `bkit-retire`, `bkit-package-json`, `bkit-context-migrate`, and telemetry `migrate`, `validate`, `normalise` and `lint`.
- **Removed inside surviving files:**
  - the `tier3Hashes` fold;
  - the envelope readers;
  - the `# bkit:start` marker style;
  - the opencode provider aliases;
  - the `status.json` rewrite and fallback;
  - old-layout handling;
  - the legacy advisories.
- **Bug found:** the version downgrade and stale-pin detectors read `.bkit/version` as plain text, so they never fired. They now read `pinnedVersion`.
- **Kept, because the input exists today:**
  - the `.npmrc` `_authToken` advisory: GitHub's docs tell people to write that line, and it breaks pnpm >=10.34.3;
  - tolerant reading of old ledger rows: app-gether-life's append-only ledgers contain them.
- **New project rule** in `.agents/rules.md`: agents never add migration code unasked. They suggest it and list the manual fixes instead.

**Other fixes from the same pass:**
- `.gitignore` is drift-checked against the `gitignore` template;
- `bkit comply` uses `resolveRepoSlug`;
- test-only flags are removed, along with `bkit status fold`;
- there is one context list and one start-line parser;
- the `bkit-tests-scope` advisory points at the template;
- `templates.md` uses `{{DEFAULT_BRANCH}}`.

**Template `ci.yml`:** it ships the `bkit-tests-check` capstone, so `/bkit-ship` works on the template as shipped. It ships no planner, because no bkit command reads one.

### app-gether-life: fixes by hand before its next upgrade
1. Rename `.agents/config.md` to `.agents/context.md`, and change every `debug-fetch:` marker to `context-fetch:`. That covers 21 fetch blocks, 6 provision blocks and 2 opt-out markers.
2. Move `docs/warnings.md` to `docs/noise.md`.
3. Run `pnpm bkit telemetry migrate` with the bkit 4.12.0 that is still installed, before upgrading, so `docs/completed.md` becomes `.bkit/issues.jsonl`. Otherwise the roadmap board comes out empty.
4. Change `package.json` `slop:delta` to `bkit ci slop`.
5. Take the current template's `bkit-cloud.yml`. Lines 235 and 620 source a retired script.
6. Delete the 12 retired `.bkit/scripts/*.sh` files. Keep `bkit-slop-type-suppression.mjs`.
7. Remove `Bash(curl:*)` and `Bash(wget:*)` from `.claude/settings.json` `permissions.ask`.
8. Rename `GH_BKIT_TOKEN_INSTALL` / `GH_BKIT_TOKEN` to `BKIT_GH_TOKEN_INSTALL` / `BKIT_GH_TOKEN` everywhere: `.bkit/.env`, the CI secret, Vercel, `pnpm config set` and the Renovate secret.
9. Optional: tidy the stale keys in `.bkit/version`.

### Still open
- Items 3 and 5 above need your call.
- **Upgrade in this repo reports a conflict on `LICENSE.md`.** The #506 licence commit added `.bkit/templates/LICENSE.md`, and today the engine treats that as a file it writes to the repo root. The licence files stay as they are. The conflict goes away once #507 leaves only templates in `.bkit/templates/`.
- Two stale `status.json` mentions remain in `.bkit/templates/.github/workflows/bkit-cloud.yml:66` and this repo's copy. They need CI-file sign-off.
- **Tests still to write:**
  - a drifted `.gitignore` block;
  - the comply repo slug;
  - the ship gate run against the template's job names;
  - actionlint on the filled-in template;
  - a replacement for the `status fold` malformed-line test.
  Then the full suite, `bkit check` and a tarball dogfood run.

Next: #507, the file and folder reorganisation.

---
_Generated by [Claude Code](https://claude.ai/code)_

## Dogfood verification — bkit installing itself in the #489 format

Verified the repo's own install against #489 (own only what a workflow runs; ship the rest as templates) and #467.

**Green**

- `pnpm bkit check` → exit 0, `0 write(s) would occur` — owned, shared, rendered and managed-block files all current.
- `pnpm bkit:check:dist` → clean; committed `dist/` matches source.
- `pnpm test` → 156 files / 5029 tests pass; `audits/*` → 61 files / 1970 pass.
- Templates are word-for-word: `audits/repo/dogfood-templates.test.ts` maps **every** template path to a root copy and asserts equality after only the declared edits; `dogfood-noop.test.ts` covers the byte-identity mirrors. No orphan or old copies; no leftover bkit placeholders (the `{{ … }}` in the workflows are GitHub Actions expressions, not install tokens).
- `docs/templates/bkit-audit-*.md` and `.bkit/*.md` mirrors match source modulo the managed stamp; every `bkit:managed` marker is `v4.12.0` (850 occurrences, one version).

**Finding — stale template hashes in `.bkit/version`**

`canonicalHashes` still records 10 paths that are template-set files (a template is never written, so it must carry no hash):

```
scripts/graphify/bkit-graph-{drift,eager,imports,repair,surface}.py
scripts/graphify/bkit-graphify-{graphml,rollup}.py
scripts/graphify/bkit-graphify.sh
scripts/graphify/bkit-graph-pre-push.sh
scripts/serena/bkit-serena-mcp.sh
```

- Each maps to a live file under `.bkit/templates/` (graphify / Serena, per `.bkit/templates.md` § Contract), and each recorded hash **no longer matches disk**.
- Root cause: `mergeCanonicalHashes` (`install/version-file.ts:160`) prunes only entries whose path is **absent**. An entry whose path is still on disk but no longer owned survives. The mechanism the settled plan named — "add every newly-template path to `RETIRED_MANAGED_PATHS` so upgrade drops their hashes" — does not exist in the engine.
- Impact: contradicts "Only template-set hashes go", and bkit's own `docs/templates/bkit-audit-adoption.md` Step 2 lists "canonicalHashes entry the package no longer ships" as a finding — so the adoption audit would flag this repo. Invisible to `bkit check` (it diffs rendered writes, not the hash map) and inert to `bkit upgrade` (these paths are not in the owned set). Wrong state, no runtime effect.

**Fix applied (working tree, not committed)**

- Removed the 10 entries from `.bkit/version`.
- Added `audits/repo/version-hashes.test.ts`: asserts no `canonicalHashes` key maps to a `.bkit/templates/` path. It fails on HEAD with exactly these 10 and passes now; full audit suite 62 files / 1971 tests green.

Caveat: unrelated in-progress edits landed in the working tree during this session (Notation/wording docs, opencode GateGuard), so a later `bkit check` reports drift from those — out of scope for this finding.

## #460 — Rename warnings.md to noise.md and widen file scope (closed)

Retrospective record — the work is already done and sits uncommitted in the working tree on `dev`. Filed so the rename, the scope widening and the consumer migration have a tracked home.

## Problem

`docs/warnings.md` was scoped to one thing: "Registry of intentional log-level downgrades with rationale." That covers an `error` demoted to `warn` in application code, and nothing else.

The same decision gets made in at least two other places and had nowhere to go. Archiving or muting an issue in the error tracker is the same call — a known, expected trigger that we have decided should stop shouting — and so is raising an alert threshold. Both were being made with no recorded trigger and no rationale, because the one doc that exists for that kind of decision said "log-level" in its purpose line and agents route off `.agents/docs.md`.

Two smaller problems came with it:

- The name described the symptom (`warnings`), not the subject. Every other doc in the index is named for its subject — `architecture`, `observability`, `security`.
- `docs/notes.md` (human scratchpad) had gone unused for a long time.

## What changed

**1. `docs/warnings.md` → `docs/noise.md`, scope widened.** New purpose line:

> Registry of intentional signal downgrades — log-level reductions, error-tracker issue archives / mutes, alert-threshold raises — with trigger and rationale.

Rules gained two lines. Entries now cover a "downgraded file / line, archived issue, or raised threshold", and the old rule

> Never silence — log at lower level.

became

> Never silence at source — log at lower level; archive / mute only what stays captured somewhere.

That rewrite is load-bearing, not cosmetic. An error-tracker archive **is** an off switch — the issue stops surfacing entirely — so the old wording would have forbidden the thing the widened doc now hosts. The new wording keeps the doctrine (never lose the signal) while permitting the archive.

The doc says "error-tracker", never "Sentry". Shipped surface stays stack-independent.

**2. Index row widened, and Ship added.** `.agents/docs.md:35` and its template twin. Phase columns went from `— — ○ ● —` to `— — ○ ● ○` — Ship picked up a `○` because post-deploy log audits are where issues actually get archived, and the row previously told a Ship agent the doc was irrelevant.

**3. `docs/notes.md` deleted**, along with its Vale exemption block (`[**/docs/notes.md]`, informal-scratchpad prose rules off) in both `.vale.ini` and the shipped `.bkit/templates/.vale.ini`. Its `.agents/docs.md` Project Documents row was already gone in an unrelated in-flight edit.

Consumer-visible consequence, called out because it is a behaviour change beyond the ask: a consumer who keeps their own personal `docs/notes.md` loses the prose-lint exemption on it. New seeds only — `.vale.ini` is `seedOrPrint`, so existing consumers are untouched until they reseed. Easy to put back if we would rather keep the exemption for them.

## Consumer migration — the part that is not just a rename

Consumers keep their own downgrade entries **below** `<!-- bkit:end -->`. Renaming only the template would have written them a fresh empty `docs/noise.md` on upgrade and stranded every recorded entry in an orphaned `docs/warnings.md`. The file has to move, not reseed.

`migrateWarningsToNoise` — `.bkit/src/bkit-upgrade.ts:574`, wired into upgrade at `.bkit/src/bkit-install.ts:2267` alongside `migrateStrayGitattributes`, whose shape it follows.

- Moves `docs/warnings.md` → `docs/noise.md`. The upgrade walk that runs next block-merges the new managed header in, so consumer entries below the marker survive untouched.
- Never clobbers an existing `docs/noise.md` — warns and leaves both files for a manual merge.
- Drops the stale `docs/warnings.md` key from `canonicalHashes`; the walk reseeds `docs/noise.md`.
- Dry-run aware, idempotent, no-op on fresh installs.

No code hardcoded `warnings.md` anywhere. `docs/` templates are directory-walked via `CORE_TEMPLATE_DIRS` (`.bkit/src/bkit-modules.ts:243`), so renaming the template file was the whole of the wiring change.

## Verification

- 3745 tests pass. Four new cases under `describe("migrateWarningsToNoise")` — `.bkit/src/bkit-upgrade-preservation.integration.test.ts:320` — cover move-with-entries-intact, refuse-to-clobber, dry-run, and no-op.
- Ran the migration live against the built `dist/` on a synthetic consumer tree: file moved, entries below the marker intact, stale hash key gone.
- `pnpm build` clean, `pnpm bkit check` exit 0 with no drift, `pnpm lint:prose` 0 errors (2 pre-existing warnings elsewhere, untouched), `slop:delta` net 0, prettier clean.

## Files touched

`docs/noise.md` (from `docs/warnings.md`), `.bkit/templates/docs/noise.md` (same), `docs/notes.md` (deleted), `.agents/docs.md`, `.bkit/templates/.agents/docs.md`, `.vale.ini`, `.bkit/templates/.vale.ini`, `.bkit/src/bkit-upgrade.ts`, `.bkit/src/bkit-install.ts`, `.bkit/src/bkit-upgrade-preservation.integration.test.ts`, `.bkit/version`.

Ships in the release after 4.12.0.
