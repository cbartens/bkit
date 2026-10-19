/**
 * audits/templates/secrets-sync.integration.test.ts — the copy-and-own secrets sync template
 * (`.bkit/templates/scripts/secrets/bkit-secrets.mjs`).
 *
 * Boundary: the real script, run in-process against a fixture repo. CLI stores
 * (`gh`, `gcloud`, `eas`) are stub executables on PATH backed by a fixture
 * directory; REST stores (Vercel, Supabase) are an in-memory fake `fetch`.
 */

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { pathToFileURL } from "node:url";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const REPO_ROOT = path.resolve(import.meta.dirname, "..", "..", "..", "..", "..");
const TEMPLATE_DIR = path.join(REPO_ROOT, ".bkit", "templates", "scripts", "secrets");
const SECRET = "sk-test-NEVER-PRINT-ME";

const GH_STUB = `#!/bin/bash
S="$STUB_STORE/gh"; mkdir -p "$S"
case "$1 $2" in
  "repo view") echo "acme/app" ;;
  "secret set") cat > "$S/$3" ;;
  "secret remove") rm "$S/$3" ;;
  "api --paginate")
    for f in "$S"/*; do [ -e "$f" ] || continue; n="$(basename "$f")"
      printf '%s\\t%s\\n' "$n" "$(cat "$S/.$n.ts" 2>/dev/null || date -u +%Y-%m-%dT%H:%M:%SZ)"; done ;;
  *) echo "stub gh: unhandled $*" >&2; exit 9 ;;
esac
`;

const GCLOUD_STUB = `#!/bin/bash
P=""; for a in "$@"; do case "$a" in --project=*) P="\${a#--project=}" ;; esac; done
S="$STUB_STORE/gcp/$P"; mkdir -p "$S"
case "$1 $2 $3" in
  "secrets list "*) for f in "$S"/*; do [ -e "$f" ] && basename "$f"; done; true ;;
  "secrets create "*) : > "$S/$3" ;;
  "secrets versions add") cat > "$S/$4" ;;
  "secrets versions access") n="\${5#--secret=}"; cat "$S/$n" ;;
  "secrets delete "*) rm "$S/$3" ;;
  *) echo "stub gcloud: unhandled $*" >&2; exit 9 ;;
esac
`;

const CONFIG = `export default {
  sources: { overlays: [".bkit/.env"], preview: "app/.env.preview", production: "app/.env.production" },
  stores: { github: {}, vercel: {}, supabase: { protect: ["HAND_SET_FN"] }, eas: { dir: "mobile" }, gcp: {} },
  protected: ["HAND_SET"],
  optional: ["OPTIONAL_KEY"],
  secrets: {
    API_KEY: { to: "github", from: "LOCAL_API_KEY" },
    DEPLOY_ID: ["github", "eas"],
    DATABASE_URL: ["vercel", "gcp"],
    WEBHOOK_URL: { to: "supabase", derive: "\${APP_URL}/hooks" },
    STRIPE_WEBHOOK: { to: "vercel", manual: ["Stripe Dashboard → Webhooks"] },
  },
};
`;

const CURSOR_CONFIG = `export default {
  sources: { overlays: [".bkit/.env"], preview: "app/.env.preview" },
  stores: { cursor: { environment: "acme-web" } },
  secrets: { DATABASE_URL: "cursor", APP_URL: "cursor" },
};
`;

const CUSTOM_CONFIG = `export default {
  sources: { overlays: [".bkit/.env"], preview: "app/.env.preview" },
  stores: { files: { type: "custom", module: "./stores/file-store.mjs", dir: ".files" } },
  secrets: { DATABASE_URL: "files" },
};
`;

const FILE_STORE = `import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
const sha = (v) => createHash("sha256").update(v, "utf8").digest("hex");
export default {
  label: "File store",
  async open({ root, store }) {
    const dir = path.resolve(root, store.dir);
    const file = (n) => path.join(dir, n);
    return {
      target: store.dir,
      async list() {
        const live = new Map();
        if (fs.existsSync(dir))
          for (const n of fs.readdirSync(dir))
            live.set(n, { readable: true, fp: sha(fs.readFileSync(file(n), "utf8")) });
        return live;
      },
      async write(list, onWritten) {
        fs.mkdirSync(dir, { recursive: true });
        for (const e of list) {
          fs.writeFileSync(file(e.name), e.value);
          onWritten(e.name);
        }
      },
      async remove(names) {
        for (const n of names) fs.rmSync(file(n), { force: true });
      },
    };
  },
};
`;

interface VercelEnv {
  id: string;
  key: string;
  value: string;
  type: string;
  target: string[];
  updatedAt: number;
  decrypted?: boolean;
}

let root: string;
let store: string;
let lines: string[];
let vercel: VercelEnv[];
let supabase: Map<string, { value: string; updated_at: string }>;
let supabaseOther: Map<string, Map<string, { value: string; updated_at: string }>>;
let cursorSecrets: {
  id: string;
  name: string;
  type: string;
  repos: string[];
  createdAt: string;
  value: string;
}[];
const savedEnv = { ...process.env };

function write(rel: string, content: string, mode = 0o644): void {
  const p = path.join(root, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content, { mode });
}

function fakeFetch(url: string, init: { method: string; body?: string }): Response {
  const u = new URL(url);
  const body = init.body ? JSON.parse(init.body) : undefined;
  const ok = (data: unknown) =>
    new Response(data === undefined ? "" : JSON.stringify(data), { status: 200 });
  if (u.host === "api.vercel.com") {
    const id = u.pathname.split("/env/")[1];
    // Like the real API: the list returns encrypted values encrypted; the per-variable GET decrypts.
    if (init.method === "GET" && id) {
      const one = vercel.find((e) => e.id === id);
      return ok({ ...one, decrypted: one?.type === "encrypted" });
    }
    if (init.method === "GET")
      return ok({ envs: vercel.map((e) => ({ ...e, value: `enc:${e.id}`, decrypted: false })) });
    if (init.method === "POST") {
      const existing = vercel.find(
        (e) => e.key === body.key && e.target.length === 1 && e.target[0] === body.target[0],
      );
      if (existing) Object.assign(existing, { value: body.value, updatedAt: Date.now() });
      else
        vercel.push({
          id: `env_${vercel.length + 1}_${Date.now()}`,
          ...body,
          updatedAt: Date.now(),
        });
      return ok({});
    }
    if (init.method === "PATCH") Object.assign(vercel.find((e) => e.id === id) ?? {}, body);
    if (init.method === "DELETE") vercel = vercel.filter((e) => e.id !== id);
    return ok({});
  }
  if (u.host === "api.supabase.com") {
    // /v1/projects/{ref}/secrets — one fake store per project ref; `supabase` is ref-dev.
    const ref = u.pathname.split("/")[3];
    const secrets = ref === "ref-dev" ? supabase : (supabaseOther.get(ref) ?? new Map());
    supabaseOther.set(ref, secrets);
    if (init.method === "GET")
      return ok([...secrets].map(([name, s]) => ({ name, value: "digest", ...s })));
    if (init.method === "POST")
      for (const s of body)
        secrets.set(s.name, { value: s.value, updated_at: new Date().toISOString() });
    if (init.method === "DELETE") for (const n of body) secrets.delete(n);
    return ok(undefined);
  }
  if (u.host === "api.cursor.com") {
    if (u.pathname === "/v1/environments")
      return ok({ items: [{ id: "env-1", name: "acme-web", owner: "personal", repos: [] }] });
    const m = /^\/v1\/environments\/([^/]+)\/secrets(?:\/(.+))?$/.exec(u.pathname);
    if (m) {
      const name = m[2] ? decodeURIComponent(m[2]) : undefined;
      const versions = cursorSecrets.filter((s) => s.name === name);
      if (init.method === "GET")
        return ok({
          items: cursorSecrets.map(({ id, name, type, repos, createdAt }) => ({
            id,
            name,
            type,
            repos,
            createdAt,
          })),
          nextCursor: null,
        });
      if ((init.method === "PUT" || init.method === "DELETE") && versions.length > 1)
        return new Response(
          JSON.stringify({
            error: { code: "secret_name_ambiguous", message: `${name} has several versions` },
          }),
          { status: 409 },
        );
      if (init.method === "PUT") {
        const existing = versions[0];
        if (existing) {
          existing.value = body.value;
          existing.type = body.type ?? existing.type;
          existing.createdAt = new Date().toISOString();
        } else
          cursorSecrets.push({
            id: `secv_${cursorSecrets.length}`,
            name: name!,
            type: body.type ?? "runtime_secret",
            repos: [],
            createdAt: new Date().toISOString(),
            value: body.value,
          });
        return ok({});
      }
      if (init.method === "DELETE") {
        cursorSecrets = cursorSecrets.filter((s) => s.name !== name);
        return ok({});
      }
    }
    return new Response("bad cursor route", { status: 404 });
  }
  return new Response("not found", { status: 404 });
}

async function cli(...argv: string[]): Promise<{ status: number; out: string }> {
  const file = path.join(root, "scripts/secrets/bkit-secrets.mjs");
  const mod = await import(`${pathToFileURL(file).href}?t=${Math.random()}`);
  lines = [];
  const status = await mod.main(argv, { root, log: (l: string) => lines.push(l) });
  return { status, out: lines.join("\n") };
}

const ghFile = (n: string) => path.join(store, "gh", n);

beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-secrets-"));
  store = path.join(root, ".store");
  fs.mkdirSync(path.join(root, "scripts/secrets"), { recursive: true });
  fs.copyFileSync(
    path.join(TEMPLATE_DIR, "bkit-secrets.mjs"),
    path.join(root, "scripts/secrets/bkit-secrets.mjs"),
  );
  write("scripts/secrets/bkit-secrets.config.mjs", CONFIG);
  write(".bkit/.env", `LOCAL_API_KEY=${SECRET}\nVERCEL_TOKEN=tok\nSUPABASE_ACCESS_TOKEN=sbp\n`);
  write(
    "app/.env.preview",
    "DEPLOY_ID=dep_1\nVERCEL_ORG_ID=team_1\nVERCEL_PROJECT_ID=prj_1\nGCP_PROJECT_ID=gcp-dev\nSUPABASE_PROJECT_ID=ref-dev\nAPP_URL=https://dev.example\nDATABASE_URL=postgres://dev\n",
  );
  write(
    "app/.env.production",
    "VERCEL_ORG_ID=team_1\nVERCEL_PROJECT_ID=prj_1\nGCP_PROJECT_ID=gcp-prod\nSUPABASE_PROJECT_ID=ref-prod\nAPP_URL=https://example\nDATABASE_URL=postgres://prod\n",
  );
  write("bin/gh", GH_STUB, 0o755);
  write("bin/gcloud", GCLOUD_STUB, 0o755);
  fs.mkdirSync(path.join(store, "gh"), { recursive: true });
  fs.writeFileSync(ghFile("HAND_SET"), "x");
  fs.writeFileSync(ghFile("OLD_NAME"), "x");
  vercel = [];
  supabaseOther = new Map();
  supabase = new Map([
    ["SUPABASE_URL", { value: "x", updated_at: "2026-01-01T00:00:00Z" }],
    ["HAND_SET_FN", { value: "x", updated_at: "2026-01-01T00:00:00Z" }],
  ]);
  cursorSecrets = [];
  process.env.PATH = `${path.join(root, "bin")}:/usr/bin:/bin`;
  process.env.HOME = root;
  process.env.STUB_STORE = store;
  for (const k of [
    "GH_TOKEN",
    "VERCEL_TOKEN",
    "SUPABASE_ACCESS_TOKEN",
    "EXPO_TOKEN",
    "XDG_CONFIG_HOME",
    "CURSOR_API_KEY",
  ])
    delete process.env[k];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, init: { method: string; body?: string }) => fakeFetch(url, init)),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
  process.env = { ...savedEnv };
  fs.rmSync(root, { recursive: true, force: true });
});

describe("bkit-secrets.mjs", () => {
  it("drift before any sync: missing and extra drift, protected and reserved names do not", async () => {
    const r = await cli("drift");
    expect(r.status).toBe(2);
    expect(r.out).toMatch(/API_KEY — missing/);
    expect(r.out).toMatch(/OLD_NAME — extra/);
    expect(r.out).not.toMatch(/HAND_SET|SUPABASE_URL/);
    expect(r.out).toMatch(/eas \(preview\)\s+⚠️ {2}skipped — not checked/);
  });

  it("dry run writes nothing and prints no value", async () => {
    const r = await cli("sync", "--dry-run");
    expect(r.status).toBe(0);
    expect(r.out).toMatch(/OLD_NAME — would delete/);
    expect(r.out).not.toContain(SECRET);
    expect(fs.readdirSync(path.join(store, "gh")).sort()).toEqual(["HAND_SET", "OLD_NAME"]);
    expect(vercel).toEqual([]);
    expect(fs.existsSync(path.join(root, "scripts/secrets/bkit-secrets-state.json"))).toBe(false);
  });

  it("sync writes mapped and derived values, deletes unlisted names, keeps protected; then drift is clean and a re-sync writes nothing", async () => {
    expect((await cli("sync")).status).toBe(0);
    expect(fs.readFileSync(ghFile("API_KEY"), "utf-8")).toBe(SECRET);
    expect(fs.existsSync(ghFile("OLD_NAME"))).toBe(false);
    expect(fs.existsSync(ghFile("HAND_SET"))).toBe(true);
    expect(supabase.get("WEBHOOK_URL")?.value).toBe("https://dev.example/hooks");
    expect(supabase.has("SUPABASE_URL")).toBe(true);
    expect(supabase.has("HAND_SET_FN")).toBe(true);
    expect(vercel.map((e) => `${e.key}:${e.target.join()}:${e.type}`).sort()).toEqual([
      "DATABASE_URL:preview:encrypted",
      "DATABASE_URL:production:encrypted",
    ]);
    expect(fs.readFileSync(path.join(store, "gcp/gcp-prod/DATABASE_URL"), "utf-8")).toBe(
      "postgres://prod",
    );
    const state = fs.readFileSync(
      path.join(root, "scripts/secrets/bkit-secrets-state.json"),
      "utf-8",
    );
    expect(state).not.toContain(SECRET);

    const d = await cli("drift");
    expect(d.status).toBe(0);
    const again = await cli("sync");
    expect(again.out).not.toMatch(/⬆️/);
  });

  it("drift catches a stale write-only copy, an outside write, and differing readable copies, without printing values", async () => {
    expect((await cli("sync")).status).toBe(0);
    write(
      ".bkit/.env",
      "LOCAL_API_KEY=rotated-locally\nVERCEL_TOKEN=tok\nSUPABASE_ACCESS_TOKEN=sbp\n",
    );
    fs.writeFileSync(
      path.join(store, "gh", ".DEPLOY_ID.ts"),
      new Date(Date.now() + 3_600_000).toISOString(),
    );
    fs.writeFileSync(path.join(store, "gcp/gcp-dev/DATABASE_URL"), "postgres://changed");
    vercel.find((e) => e.target[0] === "production")!.value = "postgres://other";
    const d = await cli("drift");
    expect(d.status).toBe(2);
    expect(d.out).toMatch(/API_KEY — not-pushed/);
    expect(d.out).toMatch(/DEPLOY_ID — changed-elsewhere/);
    expect(d.out.match(/DATABASE_URL — differs/g)).toHaveLength(2);
    expect(d.out).not.toMatch(/postgres:|rotated-locally/);
  });

  it("a write-only copy with no recorded push is unverifiable, never ok", async () => {
    fs.writeFileSync(ghFile("API_KEY"), SECRET);
    const d = await cli("drift", "--store", "github");
    expect(d.out).toMatch(/❔ API_KEY — write-only store, no recorded push/);
    expect(d.out).not.toMatch(/✅ API_KEY/);
  });

  it("an empty listed key is deleted; nothing resolved deletes nothing", async () => {
    expect((await cli("sync")).status).toBe(0);
    write(
      "app/.env.preview",
      fs
        .readFileSync(path.join(root, "app/.env.preview"), "utf-8")
        .replace("DEPLOY_ID=dep_1", "DEPLOY_ID="),
    );
    expect((await cli("sync", "--store", "github")).status).toBe(0);
    expect(fs.existsSync(ghFile("DEPLOY_ID"))).toBe(false);
    write(".bkit/.env", "VERCEL_TOKEN=tok\n");
    const r = await cli("sync", "--store", "github");
    expect(r.out).toMatch(/No listed key resolved to a value — deletes skipped/);
    expect(fs.existsSync(ghFile("API_KEY"))).toBe(true);
  });

  it("a Vercel entry shared across environments is split, so each environment keeps its own value", async () => {
    vercel.push({
      id: "env_shared",
      key: "DATABASE_URL",
      value: "old",
      type: "encrypted",
      target: ["preview", "production"],
      updatedAt: 0,
    });
    expect((await cli("sync", "--store", "vercel")).status).toBe(0);
    expect(
      vercel
        .filter((e) => e.key === "DATABASE_URL")
        .map((e) => `${e.target.join()}=${e.value}`)
        .sort(),
    ).toEqual(["preview=postgres://dev", "production=postgres://prod"]);
  });

  it("check flags a required example key and lists every copy, including hand-set ones", async () => {
    write("app/.env.example", "DEPLOY_ID=\nMISSING_KEY=\nOPTIONAL_KEY=\n");
    const r = await cli("check");
    expect(r.status).toBe(2);
    expect(r.out).toMatch(/MISSING_KEY — missing/);
    expect(r.out).not.toMatch(/OPTIONAL_KEY/);
    expect(r.out).toMatch(/STRIPE_WEBHOOK → vercel · by hand: Stripe Dashboard → Webhooks/);
  });

  it("list names what each store receives, without env files or store access", async () => {
    fs.rmSync(path.join(root, "app"), { recursive: true });
    const one = await cli("list", "--store", "eas");
    expect(one).toEqual({ status: 0, out: "DEPLOY_ID" });
    const all = await cli("list");
    expect(all.out.split("\n")).toContain("supabase\tWEBHOOK_URL");
    expect((await cli("list", "--store", "nope")).status).toBe(1);
  });

  it("refuses an unknown option rather than ignoring it (no per-environment runs)", async () => {
    const r = await cli("sync", "--env", "preview");
    expect(r.status).toBe(1);
    expect(r.out).toMatch(/unknown option --env/);
    expect(vercel).toEqual([]);
  });

  it("rejects a config typo instead of syncing a partial scope", async () => {
    write(
      "scripts/secrets/bkit-secrets.config.mjs",
      CONFIG.replace('DEPLOY_ID: ["github", "eas"]', 'DEPLOY_ID: "githbu"'),
    );
    await expect(cli("drift")).rejects.toThrow(/unknown store "githbu"/);
  });

  it("custom store adapter: a repo-local module syncs with no engine change", async () => {
    write("scripts/secrets/bkit-secrets.config.mjs", CUSTOM_CONFIG);
    write("scripts/secrets/stores/file-store.mjs", FILE_STORE);
    const r = await cli("sync", "--store", "files");
    expect(r.status).toBe(0);
    expect(fs.readFileSync(path.join(root, ".files/DATABASE_URL"), "utf-8")).toBe("postgres://dev");
    const d = await cli("drift", "--store", "files");
    expect(d.status).toBe(0);
    expect(d.out).toMatch(/✅ DATABASE_URL/);
  });

  it("custom store adapter: a module missing the contract fails at load, naming the member", async () => {
    write("scripts/secrets/bkit-secrets.config.mjs", CUSTOM_CONFIG);
    write("scripts/secrets/stores/file-store.mjs", "export default { label: 'x' };\n");
    await expect(cli("drift", "--store", "files")).rejects.toThrow(/needs an "open" function/);
  });

  it("custom store adapter: a handle missing the contract fails at run", async () => {
    write("scripts/secrets/bkit-secrets.config.mjs", CUSTOM_CONFIG);
    write(
      "scripts/secrets/stores/file-store.mjs",
      "export default { label: 'Broken', async open() { return { target: 'x', list: async () => new Map(), write: async () => {} }; } };\n",
    );
    const r = await cli("sync", "--store", "files");
    expect(r.status).toBe(1);
    expect(r.out).toMatch(/Broken: open\(\) must return a "remove" function/);
  });

  it("cursor: syncs into a Cloud Agents environment and proves write-only parity from state", async () => {
    write("scripts/secrets/bkit-secrets.config.mjs", CURSOR_CONFIG);
    process.env.CURSOR_API_KEY = "cur";
    const r = await cli("sync", "--store", "cursor");
    expect(r.status).toBe(0);
    expect(cursorSecrets.map((s) => `${s.name}:${s.type}:${s.value}`).sort()).toEqual([
      "APP_URL:runtime_secret:https://dev.example",
      "DATABASE_URL:runtime_secret:postgres://dev",
    ]);
    expect(r.out).not.toContain("postgres://");
    const d = await cli("drift", "--store", "cursor");
    expect(d.status).toBe(0);
    expect(d.out).toMatch(/✅ DATABASE_URL/);
  });

  it("cursor: a build_secret name is never written and is surfaced, not silently skipped", async () => {
    write("scripts/secrets/bkit-secrets.config.mjs", CURSOR_CONFIG);
    process.env.CURSOR_API_KEY = "cur";
    cursorSecrets.push({
      id: "secv_b",
      name: "DATABASE_URL",
      type: "build_secret",
      repos: [],
      createdAt: "2026-01-01T00:00:00Z",
      value: "old",
    });
    const r = await cli("sync", "--store", "cursor");
    expect(r.out).toMatch(/DATABASE_URL — listed but protected here; never written/);
    expect(cursorSecrets.find((s) => s.name === "DATABASE_URL")?.type).toBe("build_secret");
  });

  it("cursor: a name with several versions fails with a clear error, not a raw 409", async () => {
    write("scripts/secrets/bkit-secrets.config.mjs", CURSOR_CONFIG);
    process.env.CURSOR_API_KEY = "cur";
    for (const [i, repo] of ["a", "b"].entries())
      cursorSecrets.push({
        id: `secv_${i}`,
        name: "DATABASE_URL",
        type: "runtime_secret",
        repos: [repo],
        createdAt: "2026-01-01T00:00:00Z",
        value: "x",
      });
    const r = await cli("sync", "--store", "cursor");
    expect(r.status).toBe(1);
    expect(r.out).toMatch(/several Cursor versions share this name/);
  });
});
