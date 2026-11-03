// commands/registry.ts — every `bkit <noun> <verb>` command.
//
// Sources live in `commands/workflow/` (called by the phase workflows),
// `commands/ci/` (`bkit ci ...`) and `commands/setup/` (`bkit setup ...`).
// `commands/conventions.test.ts` fails on a source file in those folders that is not
// listed here, so a command cannot exist without being reachable.
import { ciCommand } from "./ci/ci.js";
import { setupCommand } from "./setup/setup.js";
import { branchesCommand } from "./workflow/branches.js";
import { challengeCommand } from "./workflow/challenge.js";
import { completenessCommand } from "./workflow/completeness.js";
import { contextCommand } from "./workflow/context.js";
import { countersCommand } from "./workflow/counters.js";
import { decisionsCommand } from "./workflow/decisions.js";
import { diskCommand } from "./workflow/disk.js";
import { fidsCommand } from "./workflow/fids.js";
import { issuesCommand } from "./workflow/issues.js";
import { ledgersCommand } from "./workflow/ledgers.js";
import { locksCommand } from "./workflow/locks.js";
import { plansCommand } from "./workflow/plans.js";
import { prsCommand } from "./workflow/prs.js";
import { repoCommand } from "./workflow/repo.js";
import { roadmapCommand } from "./workflow/roadmap.js";
import { runsCommand } from "./workflow/runs.js";
import { runtimeCommand } from "./workflow/runtime.js";
import { skillsCommand } from "./workflow/skills.js";
import { statusCommand } from "./workflow/status.js";
import { stepsCommand } from "./workflow/steps.js";
import { tasksCommand } from "./workflow/tasks.js";
import { testsCommand } from "./workflow/tests.js";
import { workflowsCommand } from "./workflow/workflows.js";
import { worktreesCommand } from "./workflow/worktrees.js";
export const COMMANDS = [
    statusCommand,
    countersCommand,
    stepsCommand,
    tasksCommand,
    runtimeCommand,
    repoCommand,
    fidsCommand,
    testsCommand,
    challengeCommand,
    decisionsCommand,
    locksCommand,
    workflowsCommand,
    worktreesCommand,
    diskCommand,
    branchesCommand,
    skillsCommand,
    prsCommand,
    issuesCommand,
    runsCommand,
    ledgersCommand,
    contextCommand,
    roadmapCommand,
    plansCommand,
    completenessCommand,
    ciCommand,
    setupCommand,
];
