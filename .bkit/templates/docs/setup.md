> Starter document. `bkit install` does not write this file and does not overwrite a copy. Copy it to `docs/setup.md`, fill it in, then delete this introduction.
>
> **Fill these first:** `docs/technology.md`.
>
> **Finish against:** `docs/architecture.md` for `## Local services`, and `docs/security.md` for `## Environment variables`; both sections wait for the secrets and services those docs name.
>
> **Where the facts come from:** the package manifests and their scripts, the example environment file, the local service configuration, the CI configuration and a clean checkout run on a fresh machine.
>
> **Fill in:**
>
> 1. Copy this starter to `docs/setup.md`.
> 2. Fill `## Prerequisites` with the tools a developer installs first, and name the file that holds each required version.
> 3. Run the setup on a clean checkout, and write each command into `## First-time setup` in the order that worked.
> 4. Fill `## Environment variables` with what a developer sets on their own machine. Write names and where each value comes from, and never a secret value.
> 5. Fill `## Local services` with each local service, its start command and its reset command. An integration test run needs both.
> 6. Fill `## Everyday commands` with the commands a developer runs most, read from the manifest scripts.
> 7. Fill `## Troubleshooting` with the failures new contributors hit and the fix for each.
> 8. Record unresolved facts under `## Open questions`.
> 9. Add this row to the `## Project Documents` table in `.agents/docs.md`: | `docs/setup.md` | — | — | ○ | ○ | — | How a developer sets up and runs the project locally: prerequisites, first-time setup, environment variables, local services, everyday commands and troubleshooting. |
> 10. Check the document against each completion check, then delete this introduction.
>
> **If it does not apply:** write `Not applicable: {reason}` under a section that does not apply, such as `## Local services` for a project with none.
>
> **Completion checks:**
>
> - The first-time commands ran in order on a clean checkout.
> - Every local service has a start command and a reset command.
> - No secret value appears in the document.
> - No example row remains.

# Setup

> [!CAUTION]
> **Purpose:** How a developer sets up and runs the project locally: prerequisites, first-time setup, environment variables, local services, everyday commands and troubleshooting.
>
> **Rules:**
>
> - Follow `.bkit/authoring.md` § Docs when you edit this file.
> - Never write a secret value. Write its name and where it comes from.
> - Local seed data and test fixtures must NEVER run against a remote project.
>
> **Not here:** Secret names, stores and rotation go in `docs/security.md` § Secrets. How a deployed environment gets its configuration goes in `docs/deployments.md` § Secrets and env config. Agent host and remote access setup is in `.bkit/install.md`.
>
> **Update when:** A prerequisite, a setup command, an environment variable, a local service or a script changes.

## Prerequisites

<!-- prettier-ignore -->
| Tool | Needed for | Version from |
| --- | --- | --- |
| [Tool] | [What it is used for.] | [File that holds the version.] |
| [e.g., Language runtime] | Running and testing the project. | The version file in the repository root. |

## First-time setup

1. [The first command, and what it does.]
2. [The next command, and what it does.]

## Environment variables

<!-- prettier-ignore -->
| Variable | Used by | Where the value comes from |
| --- | --- | --- |
| [Variable name] | [What reads it.] | [Where a developer gets the value.] |
| [e.g., DATABASE_URL] | The local database client. | The example environment file. |

## Local services

<!-- prettier-ignore -->
| Service | Start command | Reset command |
| --- | --- | --- |
| [Service] | [Command that starts it.] | [Command that resets it to a clean state.] |
| [e.g., Local database] | The project's start script. | The project's reset script. |

## Everyday commands

<!-- prettier-ignore -->
| Task | Command |
| --- | --- |
| [Task] | [Command.] |
| [e.g., Run the unit tests] | The project's test script. |

## Troubleshooting

<!-- prettier-ignore -->
| Symptom | Cause | Fix |
| --- | --- | --- |
| [What the developer sees.] | [Why it happens.] | [What to do.] |
| [e.g., The database connection is refused] | The local database is not running. | Start the local services. |

## Open questions

[Each unresolved fact, who can answer it and which section it affects.]
