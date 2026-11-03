# --- Rules-read advisory: the one session-start nudge (bkit renders it from this one
# source into each SessionStart host's hook). Advisory only: it names `.agents/rules.md`
# and no other file, never blocks a session and never changes the exit code. Needs
# `emit_context`, which the host's own code above defines.

BKIT_RULES_ADVISORY='[bkit] Required reading before any other action: read `.agents/rules.md` and follow every rule in it.'

emit_context "$BKIT_RULES_ADVISORY"
