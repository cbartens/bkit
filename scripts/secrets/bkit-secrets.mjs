#!/usr/bin/env node
// Example. Copy into the repo and own it.
// bkit install does not write this file and does not overwrite a copy.
// bkit-secrets.mjs — one source for every secret, every store kept in step. See .bkit/templates.md § Secrets sync.
//
//   node scripts/secrets/bkit-secrets.mjs sync --dry-run   what would change, nothing written
//   node scripts/secrets/bkit-secrets.mjs sync             write changed values, delete names not listed
//   node scripts/secrets/bkit-secrets.mjs drift            read-only: does every store hold the source value?
//   node scripts/secrets/bkit-secrets.mjs check [file]     local only: env files vs example, copy inventory
//     --allow-missing                                       a missing key warns; only an empty one fails (subset files, CI)
//   node scripts/secrets/bkit-secrets.mjs list [--store s] names each store receives, for repo tooling
//   --store <name>                                         narrow sync / drift / list to one store; always both environments
//
// Identical in every repo: bkit-secrets.config.mjs beside it holds the repo's scope.
// Needs Node >= 20 plus the CLI of each store it uses (gh, eas, gcloud); Vercel and Supabase use their REST APIs.
// Values are compared as SHA-256 fingerprints and never printed.
// Exit: 0 clean · 1 a store failed or could not be read · 2 drift, or `check` found a missing key.

import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const VERCEL_API = "https://api.vercel.com";
const SUPABASE_API = "https://api.supabase.com";
// Seconds a remote "last updated" may trail the recorded push before it counts as an outside write.
const CLOCK_SLACK = 120;
const STATE_FILE = "bkit-secrets-state.json";
const DRIFT = new Set(["missing", "differs", "not-pushed", "changed-elsewhere", "extra"]);

class Skip extends Error {}

const sha = (value) => createHash("sha256").update(value, "utf8").digest("hex");
const short = (fp) => fp.slice(0, 12);
const toArray = (v) => (v === undefined ? [] : Array.isArray(v) ? v : [v]);

// KEY=value lines, first occurrence wins, one pair of surrounding quotes stripped. No escapes, no inline comments.
export function parseEnv(text) {
  const out = new Map();
  for (const line of text.split(/\r?\n/)) {
    const m = /^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/.exec(line);
    if (!m || out.has(m[1])) continue;
    out.set(m[1], m[2].replace(/^"(.*)"$/s, "$1").replace(/^'(.*)'$/s, "$1"));
  }
  return out;
}

function readEnvFile(root, rel) {
  const p = path.resolve(root, rel);
  return fs.existsSync(p) ? parseEnv(fs.readFileSync(p, "utf8")) : null;
}

function which(cmd) {
  return (process.env.PATH ?? "")
    .split(path.delimiter)
    .some((dir) => dir && fs.existsSync(path.join(dir, cmd)));
}

function run(cmd, args, { input, env, cwd } = {}) {
  const r = spawnSync(cmd, args, {
    input,
    env: env ?? process.env,
    cwd,
    encoding: "utf8",
    maxBuffer: 64 << 20,
  });
  if (r.error) throw new Error(`${cmd}: ${r.error.message}`);
  if (r.status !== 0) {
    // CLIs lead with the cause (e.g. gcloud's "ERROR: … Please run: gcloud auth login"); keep the head.
    const head = (r.stderr || r.stdout || "")
      .trim()
      .split("\n")
      .filter((l) => l.trim())
      .slice(0, 3);
    throw new Error(
      `${cmd} ${args.slice(0, 2).join(" ")} failed (exit ${r.status}): ${head.join(" | ")}`,
    );
  }
  return r.stdout;
}

async function api(base, token, method, route, body) {
  const res = await fetch(base + route, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok)
    throw new Error(`${method} ${route.split("?")[0]} → HTTP ${res.status}: ${text.slice(0, 200)}`);
  return text ? JSON.parse(text) : null;
}

// ── Stores ────────────────────────────────────────────────────────────────────
// open(ctx) → { target, list(wanted), write(entries, onWritten), remove(names) }, or throws Skip.
// list → Map NAME → { readable, fp?, updated? }: readable=false is a write-only store (parity from
// the state file); readable with no fp means that value could not be read.

const STORES = {
  github: {
    label: "GitHub Actions secrets",
    perEnv: false,
    async open() {
      if (!which("gh")) throw new Skip("gh CLI missing");
      // A fine-grained PAT in GH_TOKEN 403s on /actions/secrets/public-key; use gh's stored login.
      const env = { ...process.env };
      delete env.GH_TOKEN;
      const gh = (args, input) => run("gh", args, { env, input });
      const repo = gh(["repo", "view", "--json", "nameWithOwner", "-q", ".nameWithOwner"]).trim();
      return {
        target: repo,
        list() {
          const out = gh([
            "api",
            "--paginate",
            `/repos/${repo}/actions/secrets`,
            "--jq",
            '.secrets[] | "\\(.name)\\t\\(.updated_at)"',
          ]);
          const live = new Map();
          for (const line of out.split("\n").filter(Boolean)) {
            const [name, ts] = line.split("\t");
            live.set(name, { readable: false, updated: Date.parse(ts) / 1000 });
          }
          return live;
        },
        write(entries, onWritten) {
          for (const e of entries) {
            gh(["secret", "set", e.name, "--repo", repo], e.value);
            onWritten(e.name);
          }
        },
        remove(names) {
          for (const n of names) gh(["secret", "remove", n, "--repo", repo]);
        },
      };
    },
  },

  vercel: {
    label: "Vercel env vars",
    perEnv: true,
    async open({ env, value, store, root }) {
      // Env files before the CLI login: the declared source, and a CLI login can expire unnoticed.
      const token = process.env.VERCEL_TOKEN || value("VERCEL_TOKEN") || vercelCliToken();
      const linked = readJson(path.resolve(root, store.project ?? ".vercel/project.json"));
      const team = linked?.orgId || value("VERCEL_ORG_ID");
      const project = linked?.projectId || value("VERCEL_PROJECT_ID");
      if (!token || !team || !project) {
        throw new Error(
          "need VERCEL_TOKEN (or `vercel login`) and .vercel/project.json, or VERCEL_ORG_ID + VERCEL_PROJECT_ID",
        );
      }
      const q = `teamId=${encodeURIComponent(team)}`;
      const call = (method, route, body) => api(VERCEL_API, token, method, route, body);
      // Branch-scoped preview vars (gitBranch set) are left alone.
      let entries = [];
      const dropTarget = (e) =>
        e.target.length > 1
          ? call("PATCH", `/v9/projects/${project}/env/${e.id}?${q}`, {
              target: e.target.filter((t) => t !== env),
            })
          : call("DELETE", `/v9/projects/${project}/env/${e.id}?${q}`);
      return {
        target: `${project}:${env}`,
        async list(wanted) {
          // The list endpoint returns encrypted values still encrypted (decrypt=true is ignored);
          // the per-variable endpoint decrypts. Read back only the values being compared.
          const data = await call("GET", `/v10/projects/${project}/env?${q}`);
          entries = (data.envs ?? data).filter(
            (e) => !e.gitBranch && (e.target ?? []).includes(env),
          );
          const live = new Map();
          for (const e of entries) {
            const updated = (e.updatedAt ?? 0) / 1000;
            // sensitive = write-only.
            if (e.type === "sensitive" || !wanted.has(e.key)) {
              live.set(e.key, { readable: e.type !== "sensitive", updated });
              continue;
            }
            const one =
              e.type === "plain"
                ? e
                : await call("GET", `/v1/projects/${project}/env/${e.id}?${q}`);
            // Trust a value only when the API says it decrypted it; anything else is unreadable, never "differs".
            const readable = one.type === "plain" || one.decrypted === true;
            live.set(
              e.key,
              readable ? { readable, fp: sha(one.value ?? ""), updated } : { readable, updated },
            );
          }
          return live;
        },
        async write(list, onWritten) {
          for (const e of list) {
            // An entry shared with other environments is split first, so this write touches only `env`.
            const shared = entries.find((x) => x.key === e.name && x.target.length > 1);
            if (shared) await dropTarget(shared);
            // type=encrypted: `vercel env add` makes type=sensitive, which `vercel env pull` returns empty.
            await call("POST", `/v10/projects/${project}/env?${q}&upsert=true`, {
              key: e.name,
              value: e.value,
              type: "encrypted",
              target: [env],
            });
            onWritten(e.name);
          }
        },
        async remove(names) {
          for (const e of entries.filter((x) => names.includes(x.key))) await dropTarget(e);
        },
      };
    },
  },

  supabase: {
    label: "Supabase Edge Function secrets",
    perEnv: true,
    // The platform's reserved namespace, auto-populated into every function.
    protects: (name) => name.startsWith("SUPABASE_"),
    async open({ value, store }) {
      const ref = value(store.ref ?? "SUPABASE_PROJECT_ID");
      const token = process.env.SUPABASE_ACCESS_TOKEN || value("SUPABASE_ACCESS_TOKEN");
      if (!ref || !token)
        throw new Error(
          `need ${store.ref ?? "SUPABASE_PROJECT_ID"} and SUPABASE_ACCESS_TOKEN in the env files`,
        );
      const call = (method, body) =>
        api(SUPABASE_API, token, method, `/v1/projects/${ref}/secrets`, body);
      return {
        target: ref,
        async list() {
          // The listed value is a server-side digest with no documented recipe: write-only.
          const live = new Map();
          for (const s of await call("GET")) {
            live.set(s.name, {
              readable: false,
              updated: s.updated_at ? Date.parse(s.updated_at) / 1000 : undefined,
            });
          }
          return live;
        },
        async write(list, onWritten) {
          for (let i = 0; i < list.length; i += 100) {
            const chunk = list.slice(i, i + 100);
            await call(
              "POST",
              chunk.map((e) => ({ name: e.name, value: e.value })),
            );
            chunk.forEach((e) => onWritten(e.name));
          }
        },
        async remove(names) {
          if (names.length) await call("DELETE", names);
        },
      };
    },
  },

  eas: {
    label: "EAS environment variables",
    perEnv: true,
    async open({ env, value, store, root }) {
      const dir = path.resolve(root, store.dir ?? "apps/mobile");
      if (!which("eas")) throw new Skip("eas CLI missing — npm i -g eas-cli");
      if (
        !/"projectId"/.test(
          fs.existsSync(path.join(dir, "app.json"))
            ? fs.readFileSync(path.join(dir, "app.json"), "utf8")
            : "",
        )
      ) {
        throw new Skip(
          `${path.relative(root, dir)} is not EAS-linked (no extra.eas.projectId) — run eas init`,
        );
      }
      const token = process.env.EXPO_TOKEN || value("EXPO_TOKEN");
      if (!token) throw new Error("EXPO_TOKEN not found in the env files");
      const eas = (args) =>
        run("eas", args, { cwd: dir, env: { ...process.env, EXPO_TOKEN: token } });
      const visibility = (option) => option ?? store.visibility ?? "sensitive";
      let secretNames = new Set();
      return {
        target: `eas:${env}`,
        setOptions(options) {
          secretNames = new Set(
            [...options].filter(([, o]) => visibility(o) === "secret").map(([n]) => n),
          );
        },
        list() {
          // `--format short` = NAME=value lines; `secret` visibility is masked, so treated as write-only.
          const live = new Map();
          for (const line of eas([
            "env:list",
            env,
            "--format",
            "short",
            "--include-sensitive",
          ]).split("\n")) {
            const m = /^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/.exec(line);
            if (!m) continue;
            const readable = !secretNames.has(m[1]);
            live.set(m[1], { readable, fp: readable ? sha(m[2]) : undefined });
          }
          return live;
        },
        write(list, onWritten) {
          for (const e of list) {
            eas([
              "env:set",
              "--name",
              e.name,
              "--value",
              e.value,
              "--visibility",
              visibility(e.option),
              "--environment",
              env,
              "--scope",
              "project",
              "--type",
              "string",
              "--json",
            ]);
            onWritten(e.name);
          }
        },
        remove(names) {
          for (const n of names)
            eas([
              "env:delete",
              "--variable-name",
              n,
              "--variable-environment",
              env,
              "--scope",
              "project",
              "--non-interactive",
            ]);
        },
      };
    },
  },

  gcp: {
    label: "GCP Secret Manager",
    perEnv: true,
    async open({ value, store }) {
      if (!which("gcloud")) throw new Skip("gcloud CLI missing");
      const project = value(store.project ?? "GCP_PROJECT_ID");
      if (!project)
        throw new Error(`${store.project ?? "GCP_PROJECT_ID"} not found in the env files`);
      const gcloud = (args, input) => run("gcloud", [...args, `--project=${project}`], { input });
      let names = new Set();
      return {
        target: project,
        list(wanted) {
          names = new Set(
            gcloud(["secrets", "list", "--format=value(name)"]).split("\n").filter(Boolean),
          );
          const live = new Map();
          for (const n of names) {
            if (!wanted.has(n)) {
              live.set(n, { readable: true });
              continue;
            }
            try {
              live.set(n, {
                readable: true,
                fp: sha(gcloud(["secrets", "versions", "access", "latest", `--secret=${n}`])),
              });
            } catch (err) {
              live.set(n, { readable: true, error: err.message });
            }
          }
          return live;
        },
        write(list, onWritten) {
          for (const e of list) {
            if (!names.has(e.name))
              gcloud(["secrets", "create", e.name, "--replication-policy=automatic"]);
            gcloud(["secrets", "versions", "add", e.name, "--data-file=-"], e.value);
            onWritten(e.name);
          }
        },
        remove(list) {
          for (const n of list) gcloud(["secrets", "delete", n, "--quiet"]);
        },
      };
    },
  },
};

function readJson(p) {
  return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, "utf8")) : null;
}

function vercelCliToken() {
  const home = process.env.HOME ?? "";
  for (const p of [
    path.join(home, "Library/Application Support/com.vercel.cli/auth.json"),
    path.join(
      process.env.XDG_CONFIG_HOME ?? path.join(home, ".config"),
      "com.vercel.cli/auth.json",
    ),
  ]) {
    const token = readJson(p)?.token;
    if (token) return token;
  }
  return "";
}

// ── Config ────────────────────────────────────────────────────────────────────

const CONFIG_KEYS = new Set(["sources", "stores", "protected", "optional", "secrets"]);
const SECRET_KEYS = new Set(["to", "from", "derive", "manual"]);

// Validated config for repo tooling that needs the same scope (e.g. "which keys reach EAS"):
//   const cfg = await loadConfig("scripts/secrets"); secretsFor(cfg, "eas")
export async function loadConfig(dir) {
  const file = path.resolve(dir, "bkit-secrets.config.mjs");
  const cfg = (await import(`${pathToFileURL(file).href}?t=${Date.now()}`)).default;
  for (const k of Object.keys(cfg))
    if (!CONFIG_KEYS.has(k)) throw new Error(`bkit-secrets.config.mjs: unknown key "${k}"`);
  if (!cfg.sources?.preview)
    throw new Error("bkit-secrets.config.mjs: sources.preview is required");
  const stores = Object.entries(cfg.stores ?? {}).map(([name, opts]) => {
    const type = opts.type ?? name;
    if (!STORES[type])
      throw new Error(
        `bkit-secrets.config.mjs: store "${name}" has unknown type "${type}" (known: ${Object.keys(STORES).join(", ")})`,
      );
    return { name, opts, adapter: STORES[type] };
  });
  const secrets = Object.entries(cfg.secrets ?? {}).map(([name, spec]) => {
    const s = typeof spec === "string" || Array.isArray(spec) ? { to: spec } : spec;
    for (const k of Object.keys(s))
      if (!SECRET_KEYS.has(k))
        throw new Error(`bkit-secrets.config.mjs: ${name}: unknown key "${k}"`);
    const to = toArray(s.to).map((t) => {
      const [store, option] = t.split(":");
      if (!stores.some((x) => x.name === store))
        throw new Error(`bkit-secrets.config.mjs: ${name}: unknown store "${store}"`);
      return { store, option };
    });
    return { name, from: s.from ?? name, derive: s.derive, to, manual: toArray(s.manual) };
  });
  return {
    sources: cfg.sources,
    stores,
    secrets,
    protected: new Set(cfg.protected ?? []),
    optional: new Set(cfg.optional ?? []),
  };
}

// Rows routed to one store: [{ name, from, derive, option }], option = the row's "store:option" suffix.
export function secretsFor(cfg, storeName) {
  return cfg.secrets.flatMap((s) =>
    s.to
      .filter((t) => t.store === storeName)
      .map((t) => ({ name: s.name, from: s.from, derive: s.derive, option: t.option })),
  );
}

function sourcesFor(root, cfg) {
  const overlays = toArray(cfg.sources.overlays).map((f) => readEnvFile(root, f) ?? new Map());
  const files = { preview: readEnvFile(root, cfg.sources.preview) };
  if (cfg.sources.production) files.production = readEnvFile(root, cfg.sources.production);
  const value = (key, env) => {
    for (const o of overlays) if (o.get(key)) return o.get(key);
    return files[env === "repo" ? "preview" : env]?.get(key) ?? "";
  };
  const resolve = (secret, env) =>
    secret.derive === undefined
      ? value(secret.from, env)
      : (() => {
          let empty = false;
          const out = secret.derive.replace(
            /\$\{([A-Za-z_][A-Za-z0-9_]*)\}/g,
            (_, k) => value(k, env) || ((empty = true), ""),
          );
          return empty ? "" : out;
        })();
  return { files, value, resolve };
}

// ── Engine ────────────────────────────────────────────────────────────────────

function compare(fp, live, rec) {
  if (!live) return ["missing", "set in source, absent remotely"];
  if (live.readable) {
    if (live.fp === undefined)
      return [
        "unverified",
        `remote value could not be read${live.error ? ` (${live.error})` : ""}`,
      ];
    return live.fp === fp
      ? ["same", ""]
      : ["differs", `remote ${short(live.fp)} vs source ${short(fp)}`];
  }
  if (!rec) return ["unverified", "write-only store, no recorded push"];
  if (rec.fp !== fp) return ["not-pushed", "source changed since the last push"];
  if (live.updated && live.updated > rec.at + CLOCK_SLACK)
    return ["changed-elsewhere", "remote updated after the last push"];
  return ["same", "matches last push"];
}

async function runTarget({ mode, store, env, cfg, src, state, root, log }) {
  const { adapter, name: storeName, opts } = store;
  const isProtected = (n) =>
    cfg.protected.has(n) || toArray(opts.protect).includes(n) || Boolean(adapter.protects?.(n));
  const scoped = cfg.secrets.filter((s) => s.to.some((t) => t.store === storeName));
  const value = (k) => src.value(k, env);
  let handle;
  try {
    handle = await adapter.open({ env, value, store: opts, root });
  } catch (err) {
    if (err instanceof Skip) {
      log(
        `── ${adapter.label}${adapter.perEnv ? ` (${env})` : ""} ──\n  ⚠️  Skipped — ${err.message}\n`,
      );
      return "skipped";
    }
    throw err;
  }
  log(`── ${adapter.label} → ${handle.target}${adapter.perEnv ? ` (${env})` : ""} ──`);

  const desired = [];
  for (const s of scoped) {
    const option = s.to.find((t) => t.store === storeName).option;
    if (isProtected(s.name)) {
      log(`  ⚠️  ${s.name} — listed but protected here; never written`);
      continue;
    }
    const v = src.resolve(s, env);
    if (!v) {
      log(
        `  ⚠️  ${s.name} — empty in source; ${mode === "drift" ? "sync deletes it here" : "deleted here if present"}`,
      );
      continue;
    }
    desired.push({ name: s.name, value: v, fp: sha(v), option });
  }
  handle.setOptions?.(new Map(desired.map((d) => [d.name, d.option])));
  const live = await handle.list(new Set(desired.map((d) => d.name)));
  const key = (n) => `${storeName}|${handle.target}|${n}`;

  const rows = desired.map((d) => [d, ...compare(d.fp, live.get(d.name), state[key(d.name)])]);
  const extras = [...live.keys()]
    .filter((n) => !isProtected(n) && !desired.some((d) => d.name === n))
    .sort();

  if (mode === "drift") {
    let drifted = 0;
    for (const [d, status, note] of rows) {
      if (status === "same") log(`  ✅ ${d.name}${note ? ` — ${note}` : ""}`);
      else if (status === "unverified") log(`  ❔ ${d.name} — ${note}`);
      else log(`  ❌ ${d.name} — ${status}: ${note}`);
      if (DRIFT.has(status)) drifted++;
    }
    for (const n of extras) log(`  ❌ ${n} — extra: remote only, sync deletes it`);
    drifted += extras.length;
    log("");
    return drifted ? "drift" : "ok";
  }

  const dry = mode === "dry-run";
  const writes = rows.filter(([, status]) => status !== "same");
  for (const [d, status, note] of rows) {
    if (status === "same") log(`  ✅ ${d.name} — unchanged`);
    else
      log(
        `  ⬆️  ${d.name} — ${dry ? "would write" : "write"} (${status}${note ? `: ${note}` : ""})`,
      );
  }
  // Nothing resolved usually means a broken env file, not "delete everything".
  const deletes = desired.length === 0 && scoped.length > 0 ? [] : extras;
  if (deletes !== extras && extras.length)
    log(`  ⚠️  No listed key resolved to a value — deletes skipped`);
  for (const n of deletes)
    log(
      `  🗑️  ${n} — ${dry ? "would delete" : "delete"} (not listed for this store, or empty in source)`,
    );
  if (dry) {
    log("");
    return "ok";
  }
  const at = Math.floor(Date.now() / 1000);
  try {
    await handle.write(
      writes.map(([d]) => d),
      (n) => (state[key(n)] = { fp: desired.find((d) => d.name === n).fp, at }),
    );
  } catch (err) {
    log(`  ❌ write failed — deletes skipped: ${err.message}\n`);
    return "failed";
  }
  await handle.remove(deletes);
  for (const n of deletes) delete state[key(n)];
  log("");
  return "ok";
}

function check({ cfg, src, root, file, allowMissing, log }) {
  let problems = 0;
  log("── Sources ──");
  for (const [label, rel] of [
    ...toArray(cfg.sources.overlays).map((f) => ["overlay", f]),
    ["preview", cfg.sources.preview],
    ...(cfg.sources.production ? [["production", cfg.sources.production]] : []),
  ]) {
    const env = readEnvFile(root, rel);
    log(env ? `  ✅ ${label}: ${rel} (${env.size} keys)` : `  ⚠️  ${label}: ${rel} not found`);
  }

  const exampleRel =
    cfg.sources.example ?? path.join(path.dirname(cfg.sources.preview), ".env.example");
  const example = readEnvFile(root, exampleRel);
  const targets = file
    ? [file]
    : [...new Set([cfg.sources.preview, cfg.sources.production].filter(Boolean))];
  if (example) {
    for (const rel of targets) {
      const env = readEnvFile(root, rel);
      if (!env && file) {
        log(`\n  ❌ ${rel} not found`);
        problems++;
      }
      if (!env || rel === exampleRel) continue;
      log(`\n── ${rel} vs ${exampleRel} ──`);
      let flagged = 0;
      for (const k of example.keys()) {
        if (cfg.optional.has(k) || cfg.protected.has(k)) continue;
        if (!env.has(k)) {
          // --allow-missing: a file holding a subset by design (e.g. CI's pulled env) fails on empty only.
          log(`  ${allowMissing ? "⚠️ " : "❌"} ${k} — missing`);
          if (allowMissing) continue;
        } else if (!env.get(k)) log(`  ❌ ${k} — empty`);
        else continue;
        flagged++;
      }
      log(flagged ? `  ${flagged} key(s) need a value` : "  ✅ every required key set");
      problems += flagged;
    }
  }

  log("\n── Copies of each secret ──");
  for (const s of cfg.secrets) {
    const envs = src.files.production ? ["preview", "production"] : ["preview"];
    const empty = envs.filter((e) => !src.resolve(s, e));
    const where = [
      ...s.to.map((t) => t.store + (t.option ? `:${t.option}` : "")),
      ...s.manual.map((m) => `by hand: ${m}`),
    ];
    log(
      `  ${empty.length ? "⚠️ " : "✅"} ${s.name} → ${where.join(" · ") || "no store"}${empty.length ? ` (empty in ${empty.join(", ")})` : ""}`,
    );
  }
  return problems ? 2 : 0;
}

export async function main(
  argv,
  {
    root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../.."),
    log = console.log,
  } = {},
) {
  const args = [...argv];
  const take = (flag) => {
    const i = args.indexOf(flag);
    return i === -1 ? undefined : args.splice(i, 2)[1];
  };
  const onlyStore = take("--store");
  const dry = args.includes("--dry-run");
  const allowMissing = args.includes("--allow-missing");
  const [cmd = "help", file] = args.filter((a) => a !== "--dry-run" && a !== "--allow-missing");
  // An ignored flag reads as obeyed: `--env preview` would sync both environments silently.
  const unknown = args.filter(
    (a) => a.startsWith("--") && a !== "--dry-run" && a !== "--allow-missing",
  );
  if (unknown.length) {
    log(
      `❌ unknown option ${unknown.join(" ")} — every run covers both environments; narrow with --store only`,
    );
    return 1;
  }
  const usage = () => {
    log(
      fs
        .readFileSync(fileURLToPath(import.meta.url), "utf8")
        .split("\n")
        .slice(3, 12)
        .map((l) => l.replace(/^\/\/ ?/, ""))
        .join("\n"),
    );
    return cmd === "help" ? 0 : 1;
  };
  if (!["sync", "drift", "check", "list"].includes(cmd)) return usage();

  const dir = path.join(root, "scripts", "secrets");
  const cfg = await loadConfig(dir);
  const src = sourcesFor(root, cfg);
  if (cmd === "check") return check({ cfg, src, root, file, allowMissing, log });
  if (cmd === "list") {
    if (onlyStore && !cfg.stores.some((s) => s.name === onlyStore)) {
      log(
        `❌ unknown store "${onlyStore}" (configured: ${cfg.stores.map((s) => s.name).join(", ")})`,
      );
      return 1;
    }
    for (const s of cfg.stores.filter((x) => !onlyStore || x.name === onlyStore))
      for (const r of secretsFor(cfg, s.name)) log(onlyStore ? r.name : `${s.name}\t${r.name}`);
    return 0;
  }
  if (!src.files.preview) {
    log(`❌ ${cfg.sources.preview} not found`);
    return 1;
  }
  if (cfg.sources.production && !src.files.production) {
    log(`❌ ${cfg.sources.production} not found`);
    return 1;
  }
  if (onlyStore && !cfg.stores.some((s) => s.name === onlyStore)) {
    log(
      `❌ unknown store "${onlyStore}" (configured: ${cfg.stores.map((s) => s.name).join(", ")})`,
    );
    return 1;
  }

  const mode = cmd === "drift" ? "drift" : dry ? "dry-run" : "sync";
  const statePath = path.join(dir, STATE_FILE);
  const state = readJson(statePath) ?? {};
  const envs = src.files.production ? ["preview", "production"] : ["preview"];
  log(
    mode === "drift"
      ? "🔎 Drift: every store vs source (read-only)\n"
      : `🔄 Sync${mode === "dry-run" ? " — DRY RUN, nothing written" : ""}\n`,
  );

  const results = [];
  for (const store of cfg.stores.filter((s) => !onlyStore || s.name === onlyStore)) {
    if (!cfg.secrets.some((s) => s.to.some((t) => t.store === store.name))) continue;
    for (const env of store.adapter.perEnv ? envs : ["repo"]) {
      let result;
      try {
        result = await runTarget({ mode, store, env, cfg, src, state, root, log });
      } catch (err) {
        log(`  ❌ ${err.message}\n`);
        result = "failed";
      }
      results.push([`${store.name}${store.adapter.perEnv ? ` (${env})` : ""}`, result]);
    }
  }
  if (mode === "sync")
    fs.writeFileSync(statePath, `${JSON.stringify(state, null, 2)}\n`, { mode: 0o600 });

  const manual = cfg.secrets.filter((s) => s.manual.length);
  if (manual.length) {
    log("❔ Copies no API reaches — update by hand on every rotation:");
    for (const s of manual) for (const m of s.manual) log(`  ❔ ${s.name} — ${m}`);
    log("");
  }
  const glyph = {
    ok: "✅ ok",
    drift: "❌ drift",
    failed: "❌ failed",
    skipped: "⚠️  skipped — not checked",
  };
  for (const [label, result] of results) log(`  ${label.padEnd(24)} ${glyph[result]}`);
  return results.some(([, r]) => r === "failed")
    ? 1
    : results.some(([, r]) => r === "drift")
      ? 2
      : 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(fs.realpathSync(process.argv[1])).href) {
  process.exitCode = await main(process.argv.slice(2));
}
