<!-- bkit:start -->

{{BKIT_MANAGED_MARKER}}

# Setup

> [!CAUTION]
> **Purpose:** Local dev — CLIs, configuration, secrets, troubleshooting. Humans only.
>
> **Rules:**
>
> - Use dense token-efficient phrasing; NO filler / hedging / restating; tables > prose, bullets > paragraphs.
> - Notation: one job per mark — `.bkit/prompts.md` § `Notation`.
> - Describe current state / rules, NOT reasons / history; state what to do, NOT why.
> - Check `.agents/docs.md` index first and confirm topic belongs in THIS doc, not another.
> - Local seed / test fixtures must never run against remote projects.

## Templates

Optional, copy and own, never installed. Catalog and install steps: `.bkit/templates.md`.

## Agent hosts

Run each host (`claude`, `opencode`, `codex`) in its own terminal window — NOT inside an IDE or a desktop app.

- Separate processes: restart one host without quitting the others.
- Terminal sessions inherit the direnv-loaded `.bkit/.env`; GUI-launched apps do not (`.bkit/providers.md` § macOS GUI-isolation).
- macOS: [Ghostty](https://ghostty.org).

<!-- bkit:end -->
