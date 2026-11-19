Status: DECIDED
Question: CHALLENGE
From: challenge
Pause step: 11
Plan: docs/plans/202611/985-install-settings-merge-plan.md

**Q1 — Task 7 (`.bkit/core/engine/install/write.ts:416`):** May a later bkit release take back a deny or ask rule it shipped? Taking back an allow rule only narrows what an agent may do. Taking back a deny or ask rule widens it, and an exact match cannot tell bkit's copy from an identical rule the person added themselves, so that person's own block would be deleted on upgrade. The owner's recorded decision says a person's own entries are never removed, and the accepted loss covers only the allow entry mcp__claude_ai_Linear__*. Issue #1006 plans to retire shipped permissions.deny patterns through this same list. Fix now limits the list to permissions.allow until a rule for deny and ask is decided; Accept leaves any path allowed.
A) Accept — the retired list keeps accepting any settings path, including permissions.deny and permissions.ask; the build moves on
B) Fix now — one more fix round limits RETIRED_SETTINGS_ENTRIES and pruneRetiredSettingsEntries to permissions.allow, refusing an entry on any other path, until a rule for deny and ask is decided
C) Stop — Stop — the run ends here with a handover; the next run resumes here
Recommended: none — It decides whether bkit may widen a project's permissions on upgrade, which the recorded owner decision does not cover; only the owner can settle that.
Default if unanswered: the run waits for you; the run stops when nobody can be asked
Decision: Fix now — assumed by the v6.3 orchestrator, not the owner's answer: limit the retired list to permissions.allow, refuse any other path loudly at build or test time and remove nothing for it; whether a release may ever take back a deny or ask rule stays an open owner question for issue 1006.
Fix task: 7

Reply with a letter per question, or "yes" to take every recommendation. "stop" ends here with a handover; the next run resumes here.
