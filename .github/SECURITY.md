# Security Policy

## Supported versions

| Version                                | Supported |
| -------------------------------------- | --------- |
| Latest `5.x` release on npm (`latest`) | Yes       |
| Anything older                         | No        |

Fixes ship as a new patch release of the latest `5.x` line. Upgrade with `pnpm add -D @cbartens/bkit@latest && pnpm exec bkit install`.

## Reporting a vulnerability

Report privately through GitHub: [open a private vulnerability report](https://github.com/cbartens/bkit/security/advisories/new). Do not open a public issue, pull request or discussion.

Include the affected version, what an attacker can do, and steps to reproduce.

## What to expect

| Step                                    | Target                        |
| --------------------------------------- | ----------------------------- |
| Acknowledge the report                  | 7 days                        |
| Confirm or decline, with reasoning      | 14 days                       |
| Fixed release, critical severity        | 7 days after confirmation     |
| Fixed release, high severity            | 30 days after confirmation    |
| Fixed release, medium or low severity   | Next regular release          |
| Public GitHub Security Advisory (+ CVE) | When the fixed release is out |

bkit has one maintainer, so these are targets, not guarantees. You are credited in the advisory unless you ask not to be.

## Scope

In scope: the `@cbartens/bkit` npm package and this repository (the CLI, the install engine, the files `bkit install` writes, the release workflow).

Out of scope: files a project copied from `.bkit/templates/` and now owns, the app stacks bkit is installed into, and the third-party tools and agents bkit configures. Report those to their owners.

## Verifying a release

Every release is published from `.github/workflows/release.yml` with npm provenance. `npm audit signatures` in a project that installs bkit checks it; the full check is in [`docs/security.md` § Verify a published version](https://github.com/cbartens/bkit/blob/main/docs/security.md#verify-a-published-version).
