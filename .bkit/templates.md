# Templates — copy and own

> [!CAUTION]
> **Purpose:** Every template bkit ships and never installs — what each does, where to copy it, how to install the tool behind it.
>
> **Rules:**
>
> - Use dense token-efficient phrasing; NO filler / hedging / restating; tables > prose, bullets > paragraphs.
> - Describe current state / rules, NOT reasons / history; state what to do, NOT why.
> - `bkit install` and `bkit upgrade` never write these files and never overwrite a copy.
> - Adapt app roots, workspace package scope, rules JSON. Examples use `apps/web`, `apps/mobile`, `packages/api`, `@scope`.

## Contract

<!-- prettier-ignore -->
| Tool | Copy from | To | Output you commit |
| --- | --- | --- | --- |
| Renovate rules | `.bkit/templates/.github/renovate.json5` | `.github/renovate.json5` | that file |
| Renovate self-hosted runner | `.bkit/templates/.github/workflows/renovate.yml` | `.github/workflows/renovate.yml` | that file |
| Dependabot | `.bkit/templates/.github/dependabot.yml` | `.github/dependabot.yml` | that file |
| Serena | `.bkit/templates/scripts/serena/`, `.bkit/templates/.serena/project.yml` | `scripts/serena/`, `.serena/project.yml`, merge `bkit-serena.mcp.json` into `.mcp.json` | `project.yml` only |
| graphify | `.bkit/templates/scripts/graphify/`, `.bkit/templates/.graphifyignore`, `.bkit/templates/docs/capabilities.md` | same paths at the repo root | `docs/capabilities.md` |
| Secrets sync | `.bkit/templates/scripts/secrets/` | `scripts/secrets/` | both files; never `bkit-secrets-state.json` |
| Prettier tables | `.bkit/templates/scripts/prettier/bkit-insert-ignore.mjs` | `scripts/prettier/` | that file |

- `bkit.depUpdater: "none"` → skips install-time absence advisory for updaters.
- No manifest key for Serena / graphify / secrets sync / prettier tables.

## Dependabot and Renovate

- Use one.
- Examples already exclude `.github/workflows/bkit-cloud.yml`.
- `enabled: false` on a Renovate package rule does not stop digest pinning.
- Land config on default branch before bot runs. Examples set `baseBranchPatterns: ["dev"]`.
- App install, self-hosted token, private-package host rule, CVE handling → `docs/deployments.md` § Dependency updaters.

## Serena — symbol lookup

Local language server, wired as MCP server; agents use it. Does not rewrite `CLAUDE.md` / `.claude/settings.json`.

```bash
brew install uv
uv tool install serena
```

- Set `project_name`, `typescript_version` in `.serena/project.yml`. `typescript_version` must match `package.json`, not Serena's bundled compiler.
- `.mcp.json` (Claude Code) calls `scripts/serena/bkit-serena-mcp.sh` → finds binary when GUI app has no login-shell `PATH`.
- Cursor's `.cursor/mcp.json` cannot use that wrapper → point `command` at `${HOME}/.local/bin/serena`, pass `--context ide`.

`.gitignore`:

```
.serena/*
!.serena/project.yml
```

- Keep `read_only: true` and `added_modes: ["no-memories"]` from example.
- Small / empty answer for an exported symbol = query did not resolve, NOT "nothing uses it" → corroborate with grep.
- pnpm monorepo: cross-package references need `composite` + `references` in TypeScript project graph before language server follows them.

## graphify — map

On-demand, humans only — not an agent tool, CI job, or git hook. Only tracked output: `docs/capabilities.md`. Mermaid views: `docs/graphify-out/reports/graph-packages.mmd`, `graph-modules.mmd`.

```bash
uv tool install "graphifyy[sql]"
```

PyPI name `graphifyy`, CLI `graphify`. `[sql]` adds `.sql` files to corpus.

`package.json` scripts:

```json
{
  "graph": "bash scripts/graphify/bkit-graphify.sh build",
  "graph:check": "bash scripts/graphify/bkit-graphify.sh check",
  "graph:clean": "bash scripts/graphify/bkit-graphify.sh clean",
  "graph:graphml": "bash scripts/graphify/bkit-graphify.sh graphml",
  "graph:rollup": "bash scripts/graphify/bkit-graphify.sh rollup",
  "graph:scoped": "bash scripts/graphify/bkit-graphify.sh scoped",
  "graph:tree": "bash scripts/graphify/bkit-graphify.sh tree",
  "graph:update": "bash scripts/graphify/bkit-graphify.sh update"
}
```

`.envrc`:

```
export GRAPHIFY_OUT=docs/graphify-out
```

`.gitignore` (no leading slash):

```
graphify-out/
```

- Paste `scripts/graphify/bkit-graph-pre-push.sh` below bkit block in `.husky/pre-push`. Warn-only: does not run graphify, does not block push.
- `.graphifyignore` merges `.gitignore`.
- Keep `package.json` in corpus — excluding it drops workspace `name` fields graphify resolves package imports with; graph still looks complete.
- Keep `tsconfig.json` out; graphify reads `paths` regardless.
- Always run `scripts/graphify/bkit-graphify.sh` — passes `--code-only`, `--no-label`, unsets API keys. No persistent LLM-off setting.

<!-- prettier-ignore -->
| Command | Does |
| --- | --- |
| `pnpm graph` | Extract + cluster. Local. No API key. |
| `pnpm graph:clean` | Same, after deleting `docs/graphify-out/`. Required after any tsconfig `paths` change. `--force` does not invalidate the module-resolution cache. |
| `pnpm graph:update` | Re-extract changed files, then recluster. |
| `pnpm graph:rollup` | Package and module views, plus `docs/capabilities.md`. |
| `pnpm graph:check` | Rebuild and fail if `docs/capabilities.md` is not what this tree produces. Run from a clean checkout before the dev → main PR. |
| `pnpm graph:scoped [path]` | One subtree. Default `apps/web/src`. |
| `pnpm graph:graphml` | Opt-in GraphML for Gephi / yEd. |

- `docs/graphify-out/` = raw `graph.json`; `docs/graphify-out/reports/` = derived views.
- Copy `.bkit/templates/docs/capabilities.md` → `docs/capabilities.md` before first rollup (Overrides block must exist) → `pnpm graph:rollup` rewrites it after.
- Add capability → rule in `bkit-graph-drift-rules.json`: lane, owner module, one literal marker. Shipped rules JSON = one example row; replace it.

`MMD_MIN_WEIGHT` (default 12) drops light edges from `.mmd` files only. Iterate in mermaid.live; render internal-architecture diagram locally:

```bash
npx -y @mermaid-js/mermaid-cli -i docs/graphify-out/reports/graph-packages.mmd -o tmp/graph-packages.svg
```

- `bkit-graph-repair.py` runs between extract and cluster: restores `.js` specifiers pointing at `.tsx` files and workspace subpaths through an `exports` map. Bare `graphify update` drops that injection; `pnpm graph:update` restores it.
- `bkit-graph-surface.py` = route layer. Assumes `apps/web` / `apps/mobile` page routes, `packages/api/src/v1.ts`, workspace scope `@scope/services/`. Replace `@scope` and route globs or section stays empty. Route reachability runs only when `scripts/ci/guards/assert-routes-reachable.mjs` exists; else skipped.
- `bkit-graph-imports.py` picks `react-native` vs `default` export conditions from importer path (`apps/mobile` vs `apps/web`). Change prefixes if app roots differ.

Do not run:

<!-- prettier-ignore -->
| Command | Effect |
| --- | --- |
| `graphify claude install` | Writes `CLAUDE.md` and `.claude/settings.json`. Next `bkit install` clobbers both. |
| `graphify install --project` | Writes a skill. `/bkit-ship` removes skills not named in `.agents/skills.md`. |
| `graphify hook install` | Rebuilds on every commit. bkit commits many times per workflow run. |

- Code-graph answer confirms what is present; does not prove what is absent. Missing edge looks like a real gap.
- Ignore rules are load-bearing: a noise-only pattern can drop edges the tool needs; output still looks plausible → re-measure after changing `.graphifyignore`.

## Secrets sync — one source, every store

Local gitignored env files = source of truth; `bkit-secrets.mjs sync` makes every store match, `drift` proves it. Needs Node >= 20 plus the CLI of each store used (`gh`, `eas`, `gcloud`); Vercel and Supabase go through their REST APIs.

- Copy both files. Edit `bkit-secrets.config.mjs` only; `bkit-secrets.mjs` stays byte-identical across repos.
- Config = one row per secret naming every store holding a copy: `DATABASE_URL: ["vercel", "gcp"]`. Options per row: `from` (env key differs from store name), `derive` (`"${APP_URL}/path"`), `manual` (copies no API reaches), `"eas:secret"` (per-store option).
- Delete unused entries under `stores`; a store no row names is skipped.
- `.gitignore`: `scripts/secrets/bkit-secrets-state.json`.
- `.bkit/.env` overlay → agent / bkit tooling secrets only; app and stack credentials stay in app env files.

<!-- prettier-ignore -->
| Command (`node scripts/secrets/bkit-secrets.mjs …`) | Does |
| --- | --- |
| `sync --dry-run` | Writes and deletes it would make; no value printed. |
| `sync` | Writes values that differ or cannot be proven equal; deletes names not listed for a store, or empty in source. |
| `drift` | Read-only. Per store and environment: `missing`, `extra`, `differs`, `not-pushed`, `changed-elsewhere`. Exit 2 on drift. |
| `check [file]` | Local only: sources, env file vs example (exit 2 on a missing required key), every copy of every secret. |
| `--store <name>` | Narrow `sync` / `drift` / `list` to one store. Every run covers both environments; no per-environment option. |

`sync` deletes every live name not listed for that store → `--dry-run` before every sync. No listed key resolving to a value skips deletes for that store.

How `drift` proves a value without printing it:

<!-- prettier-ignore -->
| Store | Read back | Proof |
| --- | --- | --- |
| Vercel (encrypted / plain) | per-variable API read (the list endpoint stays encrypted) | SHA-256 of live value vs source |
| GCP Secret Manager | latest version | SHA-256 of live value vs source |
| EAS (plaintext / sensitive) | `env:list --include-sensitive` | SHA-256 of live value vs source |
| GitHub Actions, Supabase, Vercel sensitive, EAS `secret` | write-only | state-file fingerprint vs source (`not-pushed`); store's last-updated time after recorded push (`changed-elsewhere`) |

- No recorded push → `unverified`, never `ok`. First sync records one.
- `bkit-secrets-state.json` = fingerprints + times only, per machine. Push from another machine or by hand → `changed-elsewhere` until next sync here.
- `manual` copies listed on every `check` / `drift`; update by hand on rotation.
- Vercel: branch-scoped preview vars left alone; an entry shared across environments is split before a write.

New store type → entry in `STORES` of the template's `bkit-secrets.mjs` (`open` → `list` / `write` / `remove`; contract above it), never in a copy only.

## Prettier tables — keep table diffs to the changed row

Prettier aligns markdown tables with no config toggle; one edited cell re-pads every row. `bkit-insert-ignore.mjs` puts `<!-- prettier-ignore -->` directly above each table head (no blank line between), strips cell padding, normalises separators to `---`. Idempotent. Node >= 20, no dependencies.

<!-- prettier-ignore -->
| Command | Does |
| --- | --- |
| `node scripts/prettier/bkit-insert-ignore.mjs` | Rewrite `.agents/`, `docs/`, `README.md` (or the paths given). |
| `node scripts/prettier/bkit-insert-ignore.mjs --check` | Write nothing; exit 1 if any file would change. Gate form. |

- Walks skip `skills/` trees (vendored), `docs/audits/`, `docs/plans/` (records, kept as written). A file named on the command line is always processed.
- Skips tables inside ``` / ~~~ fences and tables already wrapped.
- A pipe inside an inline-code span is escaped to `\|` only when that restores the separator's column count; an existing `\|` stays literal.
- Exit 1 on damage it cannot repair, with or without `--check`: `truncated-row` (more cells than the separator; GFM drops the overflow) and `unrendered-table` (header ≠ separator count; GFM renders raw text). A bare pipe in cell prose is indistinguishable from a delimiter → escape it as `\|` by hand.
