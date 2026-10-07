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

- `bkit.depUpdater: "none"` → skips install-time absence advisory for updaters.
- No manifest key for Serena / graphify.

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
