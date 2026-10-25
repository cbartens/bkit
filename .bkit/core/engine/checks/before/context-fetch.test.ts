// checks/before/context-fetch.test.ts — Unit tests for the Phase 1 context-fetch detectors.

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  blockBoundsOutput,
  detectContextFetchMissing,
  detectContextFetchProvisionMissing,
  detectContextFetchContextMissing,
  detectContextFetchSourceNotEnabled,
  detectContextFetchUnbounded,
  parseContextFetchStart,
} from "./context-fetch";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let tmpDir: string;

let originalCwd: string;

beforeEach(() => {
  originalCwd = process.cwd();
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-preflight-test-"));
  process.chdir(tmpDir);
});

afterEach(() => {
  process.chdir(originalCwd);
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe("detectContextFetchMissing", () => {
  function writeConfig(content: string): void {
    const dir = path.join(tmpDir, ".agents");
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "context.md"), content, "utf-8");
  }

  const BKIT_BLOCK_WITH_EXAMPLE =
    "<!-- bkit:start -->\n" +
    "# Observability\n\n" +
    "<!-- context-fetch:start -->\n" +
    "```bash\ngcloud logging read ... --limit=50\n```\n" +
    "<!-- context-fetch:end -->\n\n" +
    "<!-- bkit:end -->\n";

  it("flags when bkit block present but no consumer-section context-fetch markers after bkit:end", () => {
    writeConfig(BKIT_BLOCK_WITH_EXAMPLE);
    const f = detectContextFetchMissing(tmpDir);
    expect(f).toBeDefined();
    expect(f?.id).toBe("context-fetch-missing");
    expect(f?.severity).toBe("advisory");
    expect(f?.detect).toContain(".agents/context.md");
    expect(f?.detect).toContain("context-fetch");
    expect(f?.action).toContain("after `<!-- bkit:end -->`");
    expect(f?.action).toContain("log backend");
  });

  it("does NOT flag when a customised context-fetch pair exists after bkit:end", () => {
    writeConfig(
      BKIT_BLOCK_WITH_EXAMPLE +
        "\n## Consumer\n\n" +
        "<!-- context-fetch:start -->\n" +
        "```bash\naws logs filter-log-events --log-group-name app --limit 50\n```\n" +
        "<!-- context-fetch:end -->\n",
    );
    const f = detectContextFetchMissing(tmpDir);
    expect(f).toBeNull();
  });

  it("does NOT flag when a NAMED context-fetch block exists after bkit:end", () => {
    writeConfig(
      BKIT_BLOCK_WITH_EXAMPLE +
        "\n## Consumer\n\n" +
        "<!-- context-fetch:start vercel -->\n" +
        "```bash\nvercel logs --scope acme --json\n```\n" +
        "<!-- context-fetch:end -->\n",
    );
    const f = detectContextFetchMissing(tmpDir);
    expect(f).toBeNull();
  });

  it("does NOT flag when .agents/context.md has no bkit-managed block (consumer-owned)", () => {
    writeConfig("# Observability\n\nFully consumer-managed file, no bkit markers here.\n");
    const f = detectContextFetchMissing(tmpDir);
    expect(f).toBeNull();
  });

  it("flags when only context-fetch:start exists after bkit:end (malformed/missing pair)", () => {
    writeConfig(BKIT_BLOCK_WITH_EXAMPLE + "\n<!-- context-fetch:start -->\n```bash\nfoo\n```\n");
    const f = detectContextFetchMissing(tmpDir);
    expect(f).toBeDefined();
    expect(f?.id).toBe("context-fetch-missing");
  });

  it("does NOT count context-fetch markers that appear only INSIDE the bkit-managed block", () => {
    // Markers only inside bkit block — workflow skips these, so detector must flag.
    writeConfig(BKIT_BLOCK_WITH_EXAMPLE);
    const f = detectContextFetchMissing(tmpDir);
    expect(f).toBeDefined();
    expect(f?.id).toBe("context-fetch-missing");
  });

  it("returns null when .agents/context.md does not exist", () => {
    const f = detectContextFetchMissing(tmpDir);
    expect(f).toBeNull();
  });
});

describe("parseContextFetchStart", () => {
  it("defaults to context=runtime so pre-context consumer blocks keep working untouched", () => {
    expect(parseContextFetchStart("<!-- context-fetch:start vercel -->")).toEqual({
      name: "vercel",
      context: "runtime",
    });
    expect(parseContextFetchStart("<!-- context-fetch:start -->")).toEqual({
      name: "",
      context: "runtime",
    });
  });

  it("reads context= in either attribute order", () => {
    expect(parseContextFetchStart("<!-- context-fetch:start github context=ci -->")).toEqual({
      name: "github",
      context: "ci",
    });
    expect(parseContextFetchStart("<!-- context-fetch:start context=ci github -->")).toEqual({
      name: "github",
      context: "ci",
    });
  });

  it("accepts a context with no block name", () => {
    expect(parseContextFetchStart("<!-- context-fetch:start context=e2e -->")).toEqual({
      name: "",
      context: "e2e",
    });
  });

  it("rejects non-start and non-line-anchored markers", () => {
    expect(parseContextFetchStart("<!-- context-fetch:end -->")).toBeNull();
    expect(parseContextFetchStart("<!-- context-fetch:provision vercel -->")).toBeNull();
    expect(parseContextFetchStart("  <!-- context-fetch:start vercel -->")).toBeNull();
    expect(
      parseContextFetchStart("prose about <!-- context-fetch:start vercel --> inline"),
    ).toBeNull();
  });
});

describe("detectContextFetchContextMissing", () => {
  function writeConfig(content: string): void {
    const dir = path.join(tmpDir, ".agents");
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "context.md"), content, "utf-8");
  }

  const MANAGED = "<!-- bkit:start -->\n# Config\n\n<!-- bkit:end -->\n";
  const RUNTIME_BLOCK =
    "<!-- context-fetch:start vercel -->\n" +
    "```bash\nvercel logs --scope acme --json\n```\n" +
    "<!-- context-fetch:end -->\n";
  const block = (context: string): string =>
    `<!-- context-fetch:start src context=${context} -->\n` +
    "```bash\necho evidence\n```\n" +
    "<!-- context-fetch:end -->\n";

  it("flags a runtime-only consumer section — the shape every pre-context upgrade inherits", () => {
    writeConfig(MANAGED + "\n## Enabled\n\n" + RUNTIME_BLOCK);
    const f = detectContextFetchContextMissing(tmpDir);
    expect(f?.id).toBe("context-fetch-context-missing");
    expect(f?.severity).toBe("advisory");
    expect(f?.detect).toContain("context=ci");
    expect(f?.detect).toContain("context=diff");
    expect(f?.detect).toContain("context=e2e");
    // Must not imply the unfetched evidence was clean.
    expect(f?.detect).toContain("never fetched");
  });

  it("names only the contexts actually missing", () => {
    writeConfig(MANAGED + "\n" + RUNTIME_BLOCK + block("ci") + block("diff"));
    const f = detectContextFetchContextMissing(tmpDir);
    expect(f?.detect).toContain("context=e2e");
    expect(f?.detect).not.toContain("context=ci");
    expect(f?.detect).not.toContain("context=diff");
  });

  it("does NOT flag once every evidence context has a block", () => {
    writeConfig(MANAGED + "\n" + RUNTIME_BLOCK + block("ci") + block("diff") + block("e2e"));
    expect(detectContextFetchContextMissing(tmpDir)).toBeNull();
  });

  it("does NOT require a runtime block — runtime absence is the other advisory's job", () => {
    writeConfig(MANAGED + "\n" + block("ci") + block("diff") + block("e2e"));
    expect(detectContextFetchContextMissing(tmpDir)).toBeNull();
  });

  it("defers to context-fetch-missing when the consumer section is empty", () => {
    writeConfig(MANAGED);
    expect(detectContextFetchContextMissing(tmpDir)).toBeNull();
  });

  it("is dismissed by the context-fetch:none opt-out marker", () => {
    writeConfig(MANAGED + "\n<!-- context-fetch:none intentional -->\n" + RUNTIME_BLOCK);
    expect(detectContextFetchContextMissing(tmpDir)).toBeNull();
  });

  it("ignores context blocks that sit INSIDE the managed block (never run)", () => {
    writeConfig(
      "<!-- bkit:start -->\n" +
        block("ci") +
        block("diff") +
        block("e2e") +
        "<!-- bkit:end -->\n\n" +
        RUNTIME_BLOCK,
    );
    const f = detectContextFetchContextMissing(tmpDir);
    expect(f?.id).toBe("context-fetch-context-missing");
  });

  it("returns null when .agents/context.md has no bkit-managed block (consumer-owned)", () => {
    writeConfig("# Config\n\nNo bkit markers here.\n");
    expect(detectContextFetchContextMissing(tmpDir)).toBeNull();
  });

  it("returns null when .agents/context.md does not exist", () => {
    expect(detectContextFetchContextMissing(tmpDir)).toBeNull();
  });
});

describe("detectContextFetchSourceNotEnabled", () => {
  function writeConfig(content: string): void {
    const dir = path.join(tmpDir, ".agents");
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "context.md"), content, "utf-8");
  }
  function writeSupabaseConfig(): void {
    const dir = path.join(tmpDir, "supabase");
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "config.toml"), 'project_id = "x"\n', "utf-8");
  }
  function writeVercelJson(): void {
    fs.writeFileSync(path.join(tmpDir, "vercel.json"), "{}\n", "utf-8");
  }
  function writePackageJson(obj: unknown): void {
    fs.writeFileSync(path.join(tmpDir, "package.json"), JSON.stringify(obj), "utf-8");
  }

  // The managed block carries rules only; the named sources come from the shipped
  // `.bkit/templates/context/` files (vercel.md, supabase.md, …).
  const MANAGED = "<!-- bkit:start -->\n# Config\n\n<!-- bkit:end -->\n";
  // Consumer-section blocks.
  const UNNAMED_VERCEL_BLOCK =
    "\n## Consumer\n\n" +
    "<!-- context-fetch:start -->\n" +
    "```bash\nvercel logs --scope acme --json\n```\n" +
    "<!-- context-fetch:end -->\n";
  const NAMED_SUPABASE_BLOCK =
    "\n<!-- context-fetch:start supabase -->\n" +
    "```bash\ncurl https://api.supabase.com/v1/projects/y/...\n```\n" +
    "<!-- context-fetch:end -->\n";
  const UNNAMED_AWS_BLOCK =
    "\n## Consumer\n\n" +
    "<!-- context-fetch:start -->\n" +
    "```bash\naws logs filter-log-events --log-group-name app --limit 50\n```\n" +
    "<!-- context-fetch:end -->\n";

  it("flags supabase when repo uses supabase but only a legacy vercel block is enabled (consumer case)", () => {
    writeSupabaseConfig();
    writeVercelJson();
    writeConfig(MANAGED + UNNAMED_VERCEL_BLOCK);
    const f = detectContextFetchSourceNotEnabled(tmpDir);
    expect(f).toBeDefined();
    expect(f?.id).toBe("context-fetch-source-not-enabled");
    expect(f?.severity).toBe("advisory");
    expect(f?.detect).toContain("supabase");
    // vercel IS enabled (its name appears in the unnamed block body) — not named.
    expect(f?.detect).not.toContain("vercel");
    expect(f?.action).toContain("context-fetch:none intentional");
    expect(f?.action).toContain(".bkit/templates/context/bkit-supabase.md");
  });

  it("detects supabase use via an @supabase/* dependency (no config.toml)", () => {
    writePackageJson({ dependencies: { "@supabase/supabase-js": "^2" } });
    writeConfig(MANAGED + UNNAMED_VERCEL_BLOCK);
    const f = detectContextFetchSourceNotEnabled(tmpDir);
    expect(f?.id).toBe("context-fetch-source-not-enabled");
    expect(f?.detect).toContain("supabase");
  });

  it("does NOT flag a backend the repo does not use (no supabase evidence)", () => {
    writeVercelJson(); // vercel-only repo
    writeConfig(
      MANAGED +
        "\n<!-- context-fetch:start vercel -->\n```bash\nvercel logs --json\n```\n<!-- context-fetch:end -->\n",
    );
    const f = detectContextFetchSourceNotEnabled(tmpDir);
    expect(f).toBeNull();
  });

  it("does NOT flag when the used backend's block is already enabled", () => {
    writeSupabaseConfig();
    writeConfig(MANAGED + UNNAMED_VERCEL_BLOCK + NAMED_SUPABASE_BLOCK);
    const f = detectContextFetchSourceNotEnabled(tmpDir);
    expect(f).toBeNull();
  });

  it("is dismissed by a <!-- context-fetch:none --> marker", () => {
    writeSupabaseConfig();
    writeVercelJson();
    writeConfig(MANAGED + UNNAMED_VERCEL_BLOCK + "\n<!-- context-fetch:none intentional -->\n");
    const f = detectContextFetchSourceNotEnabled(tmpDir);
    expect(f).toBeNull();
  });

  it("does NOT fire when the consumer section has zero blocks (missing advisory owns that case)", () => {
    writeSupabaseConfig();
    writeConfig(MANAGED + "\n## Consumer\n\nNo blocks here yet.\n");
    expect(detectContextFetchSourceNotEnabled(tmpDir)).toBeNull();
    // The generic missing advisory still covers it.
    expect(detectContextFetchMissing(tmpDir)?.id).toBe("context-fetch-missing");
  });

  it("flags both backends (plural) when both are used and neither name appears below bkit:end", () => {
    writeSupabaseConfig();
    writeVercelJson();
    writeConfig(MANAGED + UNNAMED_AWS_BLOCK);
    const f = detectContextFetchSourceNotEnabled(tmpDir);
    expect(f?.id).toBe("context-fetch-source-not-enabled");
    expect(f?.detect).toContain("vercel");
    expect(f?.detect).toContain("supabase");
    expect(f?.detect).toContain("those backends");
  });

  it("returns null when .agents/context.md does not exist", () => {
    expect(detectContextFetchSourceNotEnabled(tmpDir)).toBeNull();
  });
});

describe("detectContextFetchProvisionMissing", () => {
  function writeConfig(content: string): void {
    const dir = path.join(tmpDir, ".agents");
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "context.md"), content, "utf-8");
  }

  const MANAGED = "<!-- bkit:start -->\n# Config\n<!-- bkit:end -->\n";

  // A vercel fetch block that self-guards on the `vercel` CLI (stack CLI).
  const VERCEL_FETCH =
    "\n<!-- context-fetch:start vercel -->\n" +
    "```bash\n" +
    'command -v vercel >/dev/null && [ -n "${VERCEL_TOKEN:-}" ] || { echo skipped >&2; exit 0; }\n' +
    "vercel logs --json\n" +
    "```\n" +
    "<!-- context-fetch:end -->\n";
  const VERCEL_PROVISION =
    "\n<!-- context-fetch:provision vercel -->\n" +
    "```bash\ncommand -v vercel >/dev/null 2>&1 || pnpm add -g vercel\n```\n" +
    "<!-- context-fetch:end -->\n";
  // A curl+jq block — no stack-CLI self-guard, so it must NEVER be flagged.
  const SENTRY_FETCH =
    "\n<!-- context-fetch:start sentry -->\n" +
    "```bash\n" +
    '[ -n "${SENTRY_AUTH_TOKEN:-}" ] || { echo skipped >&2; exit 0; }\n' +
    "curl -s https://de.sentry.io/api/0/... | jq '.[]'\n" +
    "```\n" +
    "<!-- context-fetch:end -->\n";

  it("flags a stack-CLI fetch block with no matching provision block", () => {
    writeConfig(MANAGED + VERCEL_FETCH);
    const f = detectContextFetchProvisionMissing(tmpDir);
    expect(f).toBeDefined();
    expect(f?.id).toBe("context-fetch-provision-missing");
    expect(f?.severity).toBe("advisory");
    expect(f?.detect).toContain("vercel");
    expect(f?.detect).toContain("`vercel`");
    expect(f?.action).toContain("context-fetch:provision");
    expect(f?.action).toContain("bkit install");
  });

  it("does NOT flag when the matching provision block is present", () => {
    writeConfig(MANAGED + VERCEL_FETCH + VERCEL_PROVISION);
    expect(detectContextFetchProvisionMissing(tmpDir)).toBeNull();
  });

  it("does NOT flag curl/jq blocks that self-guard only on tokens (no stack CLI)", () => {
    writeConfig(MANAGED + SENTRY_FETCH);
    expect(detectContextFetchProvisionMissing(tmpDir)).toBeNull();
  });

  it("does NOT flag a block whose only command -v guard is a base tool (jq)", () => {
    writeConfig(
      MANAGED +
        "\n<!-- context-fetch:start foo -->\n" +
        "```bash\ncommand -v jq >/dev/null || exit 0\ncurl -s x | jq .\n```\n" +
        "<!-- context-fetch:end -->\n",
    );
    expect(detectContextFetchProvisionMissing(tmpDir)).toBeNull();
  });

  it("accepts a provision recipe matched by CLI name even under a different block name", () => {
    writeConfig(
      MANAGED +
        VERCEL_FETCH +
        "\n<!-- context-fetch:provision clis -->\n" +
        "```bash\ncommand -v vercel >/dev/null 2>&1 || pnpm add -g vercel\n```\n" +
        "<!-- context-fetch:end -->\n",
    );
    expect(detectContextFetchProvisionMissing(tmpDir)).toBeNull();
  });

  it("flags only the unprovisioned block when mixed with provisioned + curl blocks", () => {
    writeConfig(MANAGED + SENTRY_FETCH + VERCEL_FETCH);
    const f = detectContextFetchProvisionMissing(tmpDir);
    expect(f?.detect).toContain("vercel");
    expect(f?.detect).not.toContain("sentry");
  });

  it("does NOT flag when the context-fetch:none opt-out marker is present", () => {
    writeConfig(MANAGED + "\n<!-- context-fetch:none intentional -->\n" + VERCEL_FETCH);
    expect(detectContextFetchProvisionMissing(tmpDir)).toBeNull();
  });

  it("returns null when no bkit-managed block is present (consumer-owned)", () => {
    writeConfig("# Config\nfully consumer-owned\n" + VERCEL_FETCH);
    expect(detectContextFetchProvisionMissing(tmpDir)).toBeNull();
  });

  it("returns null when .agents/context.md does not exist", () => {
    expect(detectContextFetchProvisionMissing(tmpDir)).toBeNull();
  });
});

describe("blockBoundsOutput", () => {
  it.each([
    ["a gh --limit", ["gh run list --branch main --limit 1 --json databaseId"]],
    ["a tail -n cap", ["gh run view 1 --job 2 --log-failed | tail -n 2000"]],
    ["a head -n cap", ["head -n 300 report.txt"]],
    ["a head -c cap", ['jq -r .err "$RESP" | head -c 140']],
    ["a git --stat-count cap", ["git diff A..HEAD --stat --stat-count=200"]],
    ["an API max_results cap", ['-d \'{"query":"x","max_results":5}\'']],
    ["an API limit param", ["curl 'https://api.example/v1/events?limit=100'"]],
    ["a SQL limit clause", ["select count() from logs group by hour limit 1000"]],
    ["a *_MAX_PAGES loop cap", ['while [ "$PAGES" -lt "${VERCEL_MAX_PAGES:-20}" ]; do']],
    ["an E2E_MAX_* file cap", ['printf "%s\\n" "$E2E_FILES" | head -n "$E2E_MAX_FILES"']],
    ["a *_N count knob", ['SENTRY_N="${SENTRY_N:-25}"']],
    ["a --since window", ['vercel logs --since "${SINCE:-4h}"']],
    ["a --until window", ['vercel logs --until "$UNTIL"']],
    ["a --freshness window", ['gcloud logging read "x" --freshness="${SINCE:-4h}"']],
    ["a SINCE_ISO window", ['SUPA_FROM=$(jq -rn --arg t "${SINCE_ISO:-}" .)']],
    ["a statsPeriod window", ["?statsPeriod=${SENTRY_SINCE:-24h}&sort=date"]],
    // Bounds a real block carries that the first cut did not recognise (false positives).
    ["a gh api per_page cap", ['gh api "repos/$R/actions/runs?per_page=20"']],
    ["a gh api jq slice cap", ['gh api "repos/$R/issues" --jq ".[0:10]"']],
    ["a grep -m cap", ['grep -m 20 -E "error" app.log']],
    ["a grep --max-count cap", ["grep --max-count=50 -r error ."]],
    ["a sed -n range cap", ["sed -n '1,200p' big.log"]],
    ["an awk NR cap", ["awk 'NR<=500' big.log"]],
    ["a docker --tail cap", ["docker logs --tail 100 c"]],
    ["an uppercase SQL LIMIT", ["select * from logs LIMIT 1000"]],
    ["a shell loop -lt bound", ['PAGES=0; while [ "$PAGES" -lt 20 ]; do echo x; done']],
    ["a request body size cap", ['-d \'{"query":"x","size":10}\'']],
    ["a --max-rows cap", ["mytool --max-rows 100"]],
    // A severity filter bounds like the window filters already accepted.
    ["a gcloud severity filter", ["gcloud logging read 'severity>=ERROR'"]],
    ["a --severity flag", ["kubectl logs --severity=ERROR pod"]],
    ["a --level flag", ["vercel logs --level error --level fatal"]],
    ["a jq level filter", ['jq -c \'select(.level == "error")\' "$RESP"']],
  ] as const)("accepts %s", (_label, body) => {
    expect(blockBoundsOutput(body)).toBe(true);
  });

  it("rejects a body that bounds nothing", () => {
    expect(blockBoundsOutput(["# Whole-run dump.", 'gh run view "$RUN_ID" --log'])).toBe(false);
  });

  it("ignores a bound named only in a full-line comment", () => {
    expect(
      blockBoundsOutput(["# Customise: raise --limit as needed.", 'gh run view "$RUN_ID" --log']),
    ).toBe(false);
  });

  it("ignores a bound named only in a trailing comment", () => {
    expect(
      blockBoundsOutput(['gh run view "$RUN_ID" --log  # Customise: raise --limit as needed']),
    ).toBe(false);
  });

  it("does not treat a `#` inside quotes as a comment start", () => {
    // The quoted `#` is data; the real bound (`grep -m 3`) sits after it and must survive.
    expect(blockBoundsOutput(['printf "%s" "# not a comment"; grep -m 3 -E err app.log'])).toBe(
      true,
    );
  });
});

describe("detectContextFetchUnbounded", () => {
  function writeConfig(content: string): void {
    const dir = path.join(tmpDir, ".agents");
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "context.md"), content, "utf-8");
  }

  const MANAGED = "<!-- bkit:start -->\n# Config\n<!-- bkit:end -->\n";
  // `gh run view --log` with no cap and no window: a whole-run dump.
  const UNBOUNDED =
    "\n<!-- context-fetch:start gh-dump context=ci -->\n" +
    "```bash\n" +
    "command -v gh >/dev/null 2>&1 || exit 0\n" +
    'gh run view "$RUN_ID" --log\n' +
    "```\n" +
    "<!-- context-fetch:end -->\n";
  const BOUNDED =
    "\n<!-- context-fetch:start aws context=runtime -->\n" +
    "```bash\n" +
    "aws logs filter-log-events --log-group-name app --limit 50\n" +
    "```\n" +
    "<!-- context-fetch:end -->\n";

  it("flags an enabled block that bounds nothing, naming its block and context", () => {
    writeConfig(MANAGED + UNBOUNDED);
    const f = detectContextFetchUnbounded(tmpDir);
    expect(f).toBeDefined();
    expect(f?.id).toBe("context-fetch-unbounded");
    expect(f?.severity).toBe("advisory");
    expect(f?.detect).toContain("gh-dump");
    expect(f?.detect).toContain("context=ci");
    // The action inlines the fix — never a docs link.
    expect(f?.action).toContain("--limit");
    expect(f?.action).not.toContain("docs/");
  });

  it("does NOT flag a block that caps its rows", () => {
    writeConfig(MANAGED + BOUNDED);
    expect(detectContextFetchUnbounded(tmpDir)).toBeNull();
  });

  it("flags a block whose bound-like words sit only in its `# Customise:` comment", () => {
    writeConfig(
      MANAGED +
        "\n<!-- context-fetch:start dump context=ci -->\n" +
        "```bash\n" +
        "# Customise: raise --limit as needed.\n" +
        'gh run view "$RUN_ID" --log\n' +
        "```\n" +
        "<!-- context-fetch:end -->\n",
    );
    const f = detectContextFetchUnbounded(tmpDir);
    expect(f?.id).toBe("context-fetch-unbounded");
    expect(f?.detect).toContain("dump");
  });

  it("does NOT flag the bound shape of any real shipped block family", () => {
    const shipped: string[] = [
      // github ci — --limit + tail-bounded logs
      'gh run list --branch main --limit 1 --json databaseId\nCI_LOG_TAIL=2000\ngh run view "$RUN_ID" --job "$JOB" --log-failed | tail -n "$CI_LOG_TAIL"',
      // github diff — --stat-count
      'git diff "$LAST_PASS_SHA..HEAD" --stat --stat-count="${DIFF_STAT_N:-200}"',
      // tavily — max_results + head -c
      "jq -nc '{query:$q, max_results:5}' | head -c 140",
      // vercel — VERCEL_MAX_PAGES + --limit + --since
      'while [ "$VERCEL_PAGES" -lt "${VERCEL_MAX_PAGES:-20}" ]; do vercel logs --limit 50 --since "${SINCE:-4h}"; done',
      // supabase — SQL limit + SINCE_ISO window
      'select count() from logs group by hour limit 1000\nSUPA_FROM=$(jq -rn --arg t "${SINCE_ISO:-}" .)',
      // sentry — statsPeriod + limit
      "?statsPeriod=${SENTRY_SINCE:-24h}&sort=date&limit=${SENTRY_N:-25}",
      // cloudrun — --freshness + --limit
      'gcloud logging read "$GCP_FILTER" --freshness="${SINCE:-4h}" --limit="${GCP_N:-50}"',
      // playwright — head -n
      'printf "%s\\n" "$E2E_FILES" | head -n "$E2E_MAX_FILES"',
      // maestro — tail -n
      'grep -F "$STEP" "$JOB_LOG" | tail -n "$MAESTRO_LOG_TAIL"',
      // inngest — INNGEST_MAX_PAGES + received_after
      'while :; do [ "$INNGEST_PAGES" -lt "${INNGEST_MAX_PAGES:-40}" ] || break; done',
      // expo / expo-workflows — --limit + tail/head
      'eas build:list --limit "${EAS_N:-50}" --json; tail -n "${EAS_LOG_N:-80}"',
    ];
    for (const [i, body] of shipped.entries()) {
      writeConfig(
        MANAGED +
          `\n<!-- context-fetch:start src${i} context=runtime -->\n` +
          "```bash\n" +
          body +
          "\n```\n<!-- context-fetch:end -->\n",
      );
      expect(detectContextFetchUnbounded(tmpDir), `shipped block shape ${i}`).toBeNull();
    }
  });

  it("flags only the unbounded block when a bounded one sits beside it", () => {
    writeConfig(MANAGED + BOUNDED + UNBOUNDED);
    const f = detectContextFetchUnbounded(tmpDir);
    expect(f?.detect).toContain("gh-dump");
    expect(f?.detect).not.toContain("aws");
  });

  it("checks unnamed blocks too", () => {
    writeConfig(
      MANAGED +
        "\n<!-- context-fetch:start -->\n```bash\ngcloud logging read ... --limit=50\n```\n<!-- context-fetch:end -->\n" +
        "\n<!-- context-fetch:start -->\n```bash\nfull dump\n```\n<!-- context-fetch:end -->\n",
    );
    const f = detectContextFetchUnbounded(tmpDir);
    expect(f?.id).toBe("context-fetch-unbounded");
    expect(f?.detect).toContain("(unnamed)");
  });

  it("is dismissed by the context-fetch:none opt-out marker", () => {
    writeConfig(MANAGED + "\n<!-- context-fetch:none intentional -->\n" + UNBOUNDED);
    expect(detectContextFetchUnbounded(tmpDir)).toBeNull();
  });

  it("does NOT fire when the consumer section has zero fetch blocks (missing owns it)", () => {
    writeConfig(
      MANAGED +
        "\n<!-- context-fetch:provision serena -->\n" +
        "```bash\ncommand -v serena >/dev/null 2>&1 || true\n```\n<!-- context-fetch:end -->\n",
    );
    expect(detectContextFetchUnbounded(tmpDir)).toBeNull();
    // The generic missing advisory still covers it.
    expect(detectContextFetchMissing(tmpDir)?.id).toBe("context-fetch-missing");
  });

  it("ignores blocks that sit INSIDE the managed block (never run)", () => {
    writeConfig("<!-- bkit:start -->\n" + UNBOUNDED.trim() + "\n<!-- bkit:end -->\n" + BOUNDED);
    expect(detectContextFetchUnbounded(tmpDir)).toBeNull();
  });

  it("returns null when .agents/context.md has no bkit-managed block (consumer-owned)", () => {
    writeConfig("# Config\nfully consumer-owned\n" + UNBOUNDED);
    expect(detectContextFetchUnbounded(tmpDir)).toBeNull();
  });

  it("returns null when .agents/context.md does not exist", () => {
    expect(detectContextFetchUnbounded(tmpDir)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// process.env snapshot and restore around each test
// ---------------------------------------------------------------------------

let originalEnv: NodeJS.ProcessEnv;

beforeEach(() => {
  originalEnv = { ...process.env };
});

afterEach(() => {
  process.env = originalEnv;
});
