# GH_MCP_TOKEN Rename Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement task-by-task.

**Goal:** Rename the local/cloud MCP GitHub PAT from `GH_TOKEN` to `GH_MCP_TOKEN` so direnv no longer overrides `gh auth login` keyring auth (#287).

**Architecture:** MCP configs reference `${GH_MCP_TOKEN}`; `.bkit/.env.example` seeds the new name; preflight/postinstall advisories check `GH_MCP_TOKEN`. CI workflows keep `GH_TOKEN: ${{ github.token }}` unchanged (GHA convention for `gh` in Actions).

**Tech Stack:** TypeScript (bkit install engine), JSON templates, markdown docs.

**Issue:** https://github.com/cbartens/bkit/issues/287

---

## Task 1: Env templates

- [x] `.bkit/.env.example` — rename key + update comments (MCP-only; `gh` uses keyring)
- [x] `.bkit/templates/.bkit/.env.example` — mirror

## Task 2: MCP JSON templates

- [x] `.bkit/templates/.mcp.json` — `${GH_MCP_TOKEN}`
- [x] `.bkit/templates/.cursor/mcp.json` — `${GH_MCP_TOKEN}`

## Task 3: Install engine (`.bkit/src/`)

- [x] `bkit-postinstall.ts` — `detectShellGhMcpToken`, advisory IDs `gh-mcp-token-*`, project board copy
- [x] `bkit-preflight.ts` — `GH_MCP_TOKEN` in REQUIRED_KEYS; token prose; legacy `GH_TOKEN` migration advisory
- [x] `bkit-modules.ts` — OpenCode MCP entry, GUI-isolation, cloud env strings
- [x] `bkit-cli.ts` — `launchctl setenv GH_MCP_TOKEN`
- [x] `bkit-install.ts` — comment only

## Task 4: Tests

- [x] Update unit/integration tests + snapshot for env example string
- [x] Add test for legacy `GH_TOKEN` migration advisory

## Task 5: Docs

- [x] `docs/knowledge.md`, `.bkit/templates/docs/knowledge.md` — KN-CORE-1 + KN-CORE-8
- [x] `docs/setup.md`, `README.md`, `.bkit/cloud.md`, `.bkit/providers.md`, `.bkit/trackers.md`, `.bkit/README.md`
- [x] `CHANGELOG.md` — unreleased entry

## Task 6: Regenerate consumer mirrors

- [x] `pnpm build && node dist/bkit-install.js install` — refresh mirrors; seed-or-print MCP files merged manually
- [x] `pnpm vitest run` — full suite green

## Out of scope

- CI workflow `GH_TOKEN: ${{ github.token }}` blocks (unchanged)
- Historical `docs/plans/**` archives
- User's gitignored `.bkit/.env` (migration via advisory)
