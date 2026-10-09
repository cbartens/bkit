// commands/registry.ts — every `bkit <noun> <verb>` command.
//
// Sources live in `commands/workflow/` (called by the phase workflows),
// `commands/ci/` (`bkit ci ...`) and `commands/setup/` (`bkit setup ...`).
// `bkit-commands.test.ts` fails on a source file in those folders that is not
// listed here, so a command cannot exist without being reachable.

import type { CommandSpec } from "./lib.js";

export const COMMANDS: readonly CommandSpec[] = [];
