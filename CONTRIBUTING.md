# Contributing to bkit

bkit is a one-maintainer project, and outside contributions are welcome: bug reports, fixes, docs and ideas. Two things differ from a typical open-source project, and both are explained below — every outside contribution needs a signed CLA first, and the licence is source-available, not open source.

## Sign the CLA before your first pull request

bkit is free under the PolyForm Noncommercial and Small Business licences, and larger companies can buy a commercial licence. That only works if we hold the rights needed to license every part of the code, so an outside pull request needs a signed Contributor Licence Agreement (CLA) before it can be merged.

The agreement, in full:

> You keep the copyright to your contribution. You grant Christian Bartens a perpetual, worldwide, non-exclusive, royalty-free and irrevocable licence to use, reproduce, modify, distribute and sublicense your contribution, including the right to offer it under any licence, commercial licences included. You also grant a patent licence for anything your contribution necessarily uses. You confirm the work is yours and that you have the right to grant this licence; if your employer owns it, you have their permission. You provide the work as is, with no support obligation.

**How to sign:** email [bkit@bartens.biz](mailto:bkit@bartens.biz) with your GitHub username and a line saying you agree to these terms. That email is the signature; we record the date and the username. One email covers all your future contributions.

## Start with an issue

- Small fixes and docs changes: open a pull request directly.
- Anything larger: open an issue first, so the approach can be agreed before you write code.

## Development setup

- Node.js `>=20`
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

Once signed, the CLA covers your contribution. Files live under the licence of the folder they land in: `.bkit/shared/` and `.bkit/templates/` are MIT-0; everything else is the PolyForm pair. Full terms: [LICENSE.md](LICENSE.md).

## Questions

Email [bkit@bartens.biz](mailto:bkit@bartens.biz).
