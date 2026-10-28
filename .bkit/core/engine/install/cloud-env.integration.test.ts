// T4 — five-surface egress fan-out parity.
//
// One derived set reaches five places that encode it differently. This asserts the
// single derived union is present in every surface after a REAL install — no mocks at
// the install boundary.
//
// The flag set includes `--opencode=…`: `.opencode/opencode.json` `permission.bash`
// only exists when an opencode provider is installed.

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { spawnSync } from "node:child_process";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  BKIT_SHIPPED_NETWORK_DOMAINS,
  BKIT_SHIPPED_NETWORK_HOSTS,
  renderCloudContextFetchProvision,
  writeCodexCloudDoc,
} from "./cloud-env";
import { BKIT_EGRESS_SOURCES } from "../shared/egress";
import { requireTsx } from "../../../../vitest.tsx-bin";

let tmpDir: string;
let originalCwd: string;

beforeEach(() => {
  originalCwd = process.cwd();
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-egress-fanout-"));
  process.chdir(tmpDir);
});

afterEach(() => {
  process.chdir(originalCwd);
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

const here = path.dirname(new URL(import.meta.url).pathname);
const bkitInstallPath = path.resolve(here, "../cli.ts");
const read = (rel: string) => fs.readFileSync(path.join(tmpDir, rel), "utf-8");

describe("T4 — the derived egress set reaches all five surfaces", () => {
  it.each(["github", "linear", "jira"] as const)(
    "--tracker=%s: cloud paste, hook allowlist, claude WebFetch and opencode bash globs all name it",
    (tracker) => {
      fs.writeFileSync(
        path.join(tmpDir, "package.json"),
        JSON.stringify(
          { name: "fanout", version: "1.0.0", packageManager: "pnpm@10.34.3" },
          null,
          2,
        ),
      );
      fs.mkdirSync(path.join(tmpDir, ".git"), { recursive: true });

      const result = spawnSync(
        requireTsx(),
        [
          bkitInstallPath,
          "install",
          "--claude",
          "--cursor",
          "--codex",
          "--opencode=openrouter",
          `--tracker=${tracker}`,
        ],
        {
          cwd: tmpDir,
          encoding: "utf-8",
          env: { ...process.env, NODE_NO_WARNINGS: "1" },
          timeout: 120_000,
        },
      );
      expect(result.status, `install crashed:\n${result.stdout}\n${result.stderr}`).toBe(0);

      // A base only the registry derives, plus the installed tracker's MCP bases.
      const trackerBases = BKIT_EGRESS_SOURCES.find((r) => r.id === `mcp-${tracker}`)!.bases;
      const probes = ["models.dev", ...trackerBases];
      for (const probe of probes) expect(BKIT_SHIPPED_NETWORK_DOMAINS).toContain(probe);

      const claudeCloud = read(path.join(".claude", "bkit-cloud.md"));
      const cursorCloud = read(path.join(".cursor", "bkit-cloud.md"));
      const codexCloudAbs = path.join(tmpDir, ".codex", "bkit-cloud.md");
      expect(fs.statSync(codexCloudAbs).mode & 0o777).toBe(0o600);
      const codexCloud = read(path.join(".codex", "bkit-cloud.md"));
      const allowlist = JSON.parse(read(path.join(".bkit", "allowlist.json"))) as {
        domains: string[];
      };
      const settings = JSON.parse(read(path.join(".claude", "settings.json"))) as {
        permissions: { allow: string[] };
      };
      const opencode = read(path.join(".opencode", "opencode.json"));
      for (const probe of probes) {
        // 1 — Claude cloud paste fence (apex + wildcard)
        expect(claudeCloud).toContain(`\n${probe}\n`);
        expect(claudeCloud).toContain(`\n*.${probe}\n`);

        // 2 — Cursor cloud paste fence (exact hosts, no wildcard)
        expect(cursorCloud).toContain(probe);
        expect(cursorCloud).not.toContain(`*.${probe}`);

        // 2b — Codex cloud paste fence (exact hosts, no wildcard)
        expect(codexCloud).toContain(probe);
        expect(codexCloud).not.toContain(`*.${probe}`);

        // 3 — .bkit/allowlist.json domains (every host's guardrails hook)
        expect(allowlist.domains).toContain(probe);

        // 4 — .claude/settings.json WebFetch grants
        expect(settings.permissions.allow).toContain(`WebFetch(domain:${probe})`);

        // 5 — .opencode/opencode.json permission.bash curl globs
        expect(opencode).toContain(probe);
      }

      // The installed tracker's server is the one bkit entry in every MCP config.
      const mcpKeys = (rel: string, key: "mcpServers" | "mcp") =>
        Object.keys((JSON.parse(read(rel)) as Record<string, object>)[key]);
      expect(mcpKeys(".mcp.json", "mcpServers")).toEqual([tracker]);
      expect(mcpKeys(path.join(".cursor", "mcp.json"), "mcpServers")).toEqual([tracker]);
      expect(mcpKeys(path.join(".opencode", "opencode.json"), "mcp")).toEqual([tracker]);

      // Absence leg: the installed hook carries no domain array of its own (same as the
      // template assertion).
      const hook = read(path.join(".cursor", "hooks", "bkit-guardrails.cjs"));
      expect(hook).not.toContain("SHIPPED_NETWORK_BASES");

      // Every shipped HOST reaches the Cursor surfaces, not just the probes.
      for (const host of BKIT_SHIPPED_NETWORK_HOSTS) {
        expect(cursorCloud, `${host} missing from .cursor/bkit-cloud.md`).toContain(host);
        expect(codexCloud, `${host} missing from .codex/bkit-cloud.md`).toContain(host);
      }
    },
    180_000,
  );
});

// Provenance leg — claudeAllowDerived creates no drift: the check write-set is IDENTICAL
// with and without the provenance record.
describe("T14 — the provenance field contributes no bkit check drift", () => {
  it("check reports the same write set with and without claudeAllowDerived present", () => {
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ name: "drift", version: "1.0.0", packageManager: "pnpm@10.34.3" }, null, 2),
    );
    fs.mkdirSync(path.join(tmpDir, ".git"), { recursive: true });

    const run = (args: string[]) =>
      spawnSync(requireTsx(), [bkitInstallPath, ...args], {
        cwd: tmpDir,
        encoding: "utf-8",
        env: { ...process.env, NODE_NO_WARNINGS: "1" },
        timeout: 120_000,
      });

    expect(run(["install", "--claude"]).status).toBe(0);

    const writeCount = (out: string) => /(\d+) write\(s\) would occur/.exec(out)?.[1];

    const withField = writeCount(run(["check"]).stdout);
    expect(withField).toBeDefined();

    // strip the record and re-check: the count must not move
    const versionPath = path.join(tmpDir, ".bkit", "version");
    const v = JSON.parse(fs.readFileSync(versionPath, "utf-8")) as Record<string, unknown>;
    expect(Array.isArray(v.claudeAllowDerived)).toBe(true);
    expect((v.claudeAllowDerived as string[]).length).toBeGreaterThan(0);
    delete v.claudeAllowDerived;
    fs.writeFileSync(versionPath, JSON.stringify(v, null, 2) + "\n");

    expect(writeCount(run(["check"]).stdout)).toBe(withField);
  }, 180_000);
});

// The generated install-script pieces, executed by a real bash — string checks alone
// passed while a fresh Codex install silently skipped `pnpm install`.
describe("cloud install script pieces, run by bash", () => {
  const writeFile = (rel: string, content: string, mode = 0o644) => {
    const abs = path.join(tmpDir, rel);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, content, { encoding: "utf-8", mode });
  };
  const bash = (script: string, env: NodeJS.ProcessEnv = process.env) =>
    spawnSync("bash", ["-c", script], { cwd: tmpDir, encoding: "utf-8", env, timeout: 30_000 });
  const block = (name: string, body: string) =>
    `<!-- context-fetch:provision ${name} -->\n\`\`\`bash\n${body}\n\`\`\`\n<!-- context-fetch:end -->\n`;

  it("Codex: the dependency install runs in the repo after a download step leaves it", () => {
    const { GIT_DIR: _dir, GIT_WORK_TREE: _tree, GIT_INDEX_FILE: _index, ...env } = process.env;
    expect(spawnSync("git", ["init", "-q"], { cwd: tmpDir, env }).status).toBe(0);
    writeFile("pnpm-lock.yaml", "");
    writeFile("bin/pnpm", '#!/bin/bash\necho "pnpm $* in $(pwd -P)"\n', 0o755);
    writeCodexCloudDoc(tmpDir, { DEFAULT_BRANCH: "main", PROJECT_NAME: "p", REPO_SLUG: "o/p" });
    const doc = read(".codex/bkit-cloud.md");
    const lines = String(/```bash\n(#!\/bin\/bash\n[\s\S]*?)```/.exec(doc)?.[1]).split("\n");
    const from = lines.indexOf('cd "$REPO_ROOT"');
    const to = lines.findIndex((l) => l.includes("pnpm install --frozen-lockfile"));
    expect(from).toBeGreaterThan(0);
    // The script's own opening lines, a download step's `cd /tmp`, then its repo step.
    const script = [...lines.slice(0, 3), "cd /tmp", ...lines.slice(from, to + 1)].join("\n");
    const res = bash(script, { ...env, PATH: `${path.join(tmpDir, "bin")}:${env.PATH}` });
    expect(res.status).toBe(0);
    expect(res.stdout).toContain(`pnpm install --frozen-lockfile in ${fs.realpathSync(tmpDir)}`);
  });

  it("names each failing provision block, keeps going, and never fails the install", () => {
    writeFile(
      ".agents/context.md",
      "<!-- bkit:end -->\n" +
        block("fails-first", "false\necho fails-first-kept-going") +
        block("good", "echo good-ran") +
        block("fails-last", "exit 3"),
    );
    const region = renderCloudContextFetchProvision(tmpDir);
    const res = bash(`set -euo pipefail\n${region}\necho after-region`, {
      ...process.env,
      HOME: tmpDir,
    });
    expect(res.status).toBe(0);
    expect(res.stdout).toContain("good-ran");
    expect(res.stdout).toContain("after-region");
    // `false` stops its own block, even though the block's last command would succeed.
    expect(res.stdout).not.toContain("fails-first-kept-going");
    expect(res.stderr).toContain("context-fetch provision 'fails-first' failed");
    expect(res.stderr).toContain("context-fetch provision 'fails-last' failed");
    expect(res.stderr).not.toContain("'good' failed");
  });

  it("switches stop-on-error back on after the provision block", () => {
    writeFile(".agents/context.md", "<!-- bkit:end -->\n" + block("good", "echo good-ran"));
    const region = renderCloudContextFetchProvision(tmpDir);
    const res = bash(`set -euo pipefail\n${region}\nfalse\necho not-reached`, {
      ...process.env,
      HOME: tmpDir,
    });
    expect(res.status).not.toBe(0);
    expect(res.stdout).not.toContain("not-reached");
  });

  describe("Claude session hook: context-fetch provisioning", () => {
    const hook = path.resolve(
      path.dirname(new URL(import.meta.url).pathname),
      "../../../templates/.claude/hooks/bkit-cloud-bootstrap.sh",
    );
    const runHook = (listBlocks: object) => {
      writeFile(".agents/context.md", "<!-- bkit:end -->\n");
      writeFile("list-blocks.json", JSON.stringify(listBlocks));
      writeFile("node_modules/.bin/bkit", `#!/bin/bash\ncat "${tmpDir}/list-blocks.json"\n`, 0o755);
      const {
        GH_TOKEN: _gh,
        GITHUB_TOKEN: _github,
        BKIT_GH_TOKEN: _bkit,
        GIT_DIR: _dir,
        GIT_WORK_TREE: _tree,
        GIT_INDEX_FILE: _index,
        ...env
      } = process.env;
      return spawnSync("bash", [hook], {
        cwd: tmpDir,
        encoding: "utf-8",
        input: "{}",
        timeout: 30_000,
        env: { ...env, HOME: tmpDir, CLAUDE_CODE_REMOTE: "true", CLAUDE_PROJECT_DIR: tmpDir },
      });
    };

    it("names each failing recipe and still runs the rest", () => {
      const res = runHook({
        provisionBlocks: [
          { name: "fails-first", body: "false\necho fails-first-kept-going" },
          { name: "good", body: "echo good-ran" },
          { name: "", body: "exit 3" },
        ],
      });
      expect(res.status).toBe(0);
      expect(res.stdout).toContain("good-ran");
      // `false` stops its own recipe, even though the recipe's last command would succeed.
      expect(res.stdout).not.toContain("fails-first-kept-going");
      expect(res.stderr).toContain("context-fetch provision 'fails-first' failed");
      expect(res.stderr).toContain("context-fetch provision '#3' failed");
      expect(res.stderr).not.toContain("'good' failed");
    });

    it("runs the unnamed recipes of a bkit whose list-blocks has no provisionBlocks", () => {
      const res = runHook({ provision: ["echo old-shape-ran", "exit 4"] });
      expect(res.status).toBe(0);
      expect(res.stdout).toContain("old-shape-ran");
      expect(res.stderr).toContain("context-fetch provision '#2' failed");
    });
  });
});
