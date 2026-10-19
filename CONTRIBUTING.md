# Contributing to bkit

bkit is a one-maintainer project, and outside contributions are welcome: bug reports, fixes, docs and ideas.

## Start with an issue

- Small fixes and docs changes: open a pull request directly.
- Anything larger: open an issue first, so the approach can be agreed before you write code.

## Development setup

- Node.js `>=24`
- pnpm, via `corepack enable`
- Vale, for prose checks (`brew install vale`), then run `vale sync` once

```bash
corepack enable
pnpm install
```

## Checks before you push

```bash
pnpm typecheck
pnpm test
pnpm format:check   # pnpm format rewrites files
pnpm lint:prose
```

If you changed code under `.bkit/core/engine/`, rebuild the CLI and include the result:

```bash
pnpm build
```

CI runs the same checks.

## Commits and pull requests

- Commit messages follow `type(issue-number): summary` — for example `fix(408): publish to npmjs instead of GitHub Packages`. Types in use: `feat`, `fix`, `docs`, `test`, `chore`.
- Keep a pull request scoped to one issue, and link the issue in the description.
- Never commit secrets. `.bkit/.env` is gitignored for this reason.

## Licence of your contribution

By opening a pull request, you agree your contribution is licensed under the same MIT licence as the rest of bkit, and confirm the work is yours to license. Full terms: [LICENSE.md](LICENSE.md).

## Questions

Email [bkit@bartens.biz](mailto:bkit@bartens.biz).
