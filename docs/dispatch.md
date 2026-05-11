<!-- bkit:start -->

# Dispatch

> [!CAUTION]
> **Purpose:** Claude Cowork Dispatch surfaces, venv handling, keep-awake, preflight interaction. Universal — not consumer-customised.
>
> **Rules:**
>
> - Token-efficient dense phrasing; agent readers only.
> - Dispatch is a Claude product (mobile → desktop hand-off). Cursor Cloud Agent is a separate product with its own model.
> - Preflight bypass: see `.claude/hooks/preflight.sh` § Dispatch bypass.

## Surfaces

Dispatch sessions execute on one of two surfaces; behaviour differs.

<!-- prettier-ignore -->
| Surface | Environment | Tooling rules |
| --- | --- | --- |
| **Cowork bash sandbox** | Isolated Ubuntu container, no host filesystem, no `brew`. | `pip install --break-system-packages` permitted. Host-built `.venv/` does NOT work — never reuse. Prefer `uv` over `venv` + `pip`. |
| **Computer use (macOS)** | Real macOS desktop, host filesystem visible. | Terminals are tier `click` — agent cannot type into them, so cannot `source venv/bin/activate` or run multi-line shell setup. Auto-activation must be pre-wired (direnv / mise). |

## Venv reproducibility

- NEVER commit `.venv/` (host venv is incompatible with sandbox; sandbox venv ephemeral).
- Commit `requirements.txt` / `pyproject.toml`; pin versions.
- Prefer `uv` (single-file, deterministic) over `python -m venv` + `pip`.

## Auto-activation requirement

Computer-use terminals are tier `click`: agent clicks but does not type. Anything requiring `source` / `eval` must be loaded by the shell on terminal start.

- Use `direnv` (`.envrc` per project) or `mise` (`mise.toml`).
- Verify: open a fresh terminal in the project, confirm `which python` resolves to the project venv without intervention.

### One-time setup (per consumer repo)

bkit ships `.envrc.example` and `.nvmrc` at `node_modules/@cbartens/bkit/.agents/templates/`. They are NOT auto-installed (they would overwrite consumer pins). Copy them manually when enabling Dispatch:

```sh
cp node_modules/@cbartens/bkit/.agents/templates/.envrc.example .envrc
cp node_modules/@cbartens/bkit/.agents/templates/.nvmrc .nvmrc   # only if no .nvmrc exists yet
direnv allow
```

## Keep-awake

Desktop must stay awake and online for the entire Dispatch session.

- Lid open, no display sleep, no system sleep.
- Network up — Dispatch streams via Cowork; loss of connection terminates the session.
- macOS: `caffeinate -di` covers display + idle sleep for ad-hoc sessions.

## Preflight interaction

`.claude/hooks/preflight.sh` runs on every SessionStart. Two BAR-186 changes affect Dispatch:

1. **Brew-bin check is Darwin-gated.** Linux sandbox passes through; macOS still verifies `gh jq vale pnpm bun`.
2. **`BKIT_PREFLIGHT_BYPASS=dispatch`** — set this env var to skip the Linear `Auto`-label / state guards. Required for phone-triggered sessions that have no Linear issue context. Destruction guards (paths, secrets, `.env`) remain in force.

Set the bypass per-session (Cowork session env) or globally in shell rc when Dispatch is the primary use case.

<!-- bkit:end -->
