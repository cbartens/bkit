# Design Brainstorm & Ideas

Lens: Optimal trade-off — best long-term shape, legacy constraints set aside.

## Approach A — Shared policy evaluation with owned permission projections ⭐ Recommended

Resolve policy once, evaluate structured command facts through shared code, and treat each host's permissions as a projection whose bkit-owned entries have recorded ownership.

- **Complexity:** `MEDIUM`.
- **Extensibility:** Shared classification separates what a command does from what a host can enforce. A new host supplies its tool envelope and verdict mapping. Grant reconciliation follows the same ownership rule for each host, without forcing host-specific permission syntax into the classifier.
- **Risk:** A partial shell parser can misidentify a target, while a missing ownership record can make a generated grant indistinguishable from a user's entry. The accepted contract resolves uncertain download targets to refusal. The design should define a bounded supported curl/wget grammar, rather than imply complete shell or network isolation.
- **Maintenance:** Maintain one classification corpus and thin host adapters, plus explicit ownership reconciliation for generated permission entries. Keep the existing shared guard tiers and network resolver as the source of policy. Add only the OpenCode adapter and missing ownership state that the present outcomes require.
- **Friction vs ideal:** Extend `guardrails-tiers.js` and the existing guardrails shell helpers; add the owner-approved `bkit-guardrails.js` plugin; update OpenCode installation, upgrade and uninstall reconciliation; extend the existing `.bkit/version` ownership mechanism; connect the existing fingerprint generator to bootstrap reporting. Existing host permission tables and consumer-owned hook drivers constrain how completely one source can determine effective enforcement. Older OpenCode installations lack entry ownership, which needs an explicit compatibility treatment rather than a silent claim that matching keys prove bkit authorship.

The core distinctions are classification, enforcement and ownership. Codex can map the existing `key` classification to a real denial while leaving the `.env` classification advisory. The dedicated OpenCode plugin can reject curl/wget calls before execution using the shared parsed target check. Host glob rows then serve convenience and host-native defaults, not proof that a destination is approved. A pre-tool rejection must remain effective even if a native permission pattern would allow the command; that ordering needs host evidence.

These are deliberate departures from the recorded acceptance of unanchored OpenCode network globs and the advisory-only shell fetch policy: OpenCode downloads now have a parsed rejection boundary, and Codex private-key reads now deny. The shared classifier and the existing fail-open hook exception contract remain separate concerns. Refusing a recognized uncertain target does not by itself authorize changing every top-level hook error into a denial; that would need an explicit design decision with its availability cost stated.

Generated permission reconciliation should compute the next desired entries and compare them with the entries bkit previously wrote. Remove a former generated entry only when its current value still matches the recorded generated value. Preserve unrelated user entries and do not claim ownership of a pre-existing entry merely because its text matches a generated one. A consumer edit to a previously generated entry creates a conflict to explain, not a reason to delete that edit. Capture the recorded Claude derived grants before uninstall mutates the seed or version state. Existing `claudeAllowDerived` provides the pattern, but its exact preservation semantics need checking before reuse.

There is a necessary compatibility boundary: no algorithm can always distinguish a user-added grant from a generated grant when both have the same key and value and no ownership history exists. The design should surface that limit for older installations. It should not erase arbitrary curl/wget rows to make the first upgrade appear fully reconciled. A purpose-built migration requires owner confirmation under the project rules.

For cloud freshness, reuse `egressFingerprint()` for the same derived egress set it currently represents. `cloud-env.ts` documents that this fingerprint covers the derived set only; it is not the fingerprint of every consumer domain or a readback of the platform's actual network configuration. Print the expected fingerprint and compare it with an operator-supplied stamp accompanying the applied cloud configuration. A mismatch or absent stamp warns, gives concrete refresh instructions, and continues as accepted. Describe a match as matching stamps, not proof that the platform applied every setting. Expanding fingerprint scope would require a deliberate contract change.

## Approach B — Separate generated policy overlays from user configuration

Store generated permissions in a bkit-owned configuration overlay and let each host combine that overlay with the user's independent configuration.

- **Complexity:** `MEDIUM` where the host supports deterministic configuration composition; `HIGH` across the full host set.
- **Extensibility:** Adding or removing a generated grant becomes regeneration of one owned overlay. Uninstall removes the overlay, and user-authored permissions retain their own home. This is the cleanest ownership model from first principles because provenance follows the file boundary.
- **Risk:** Merge precedence can allow a user's broad permission to weaken the generated overlay, and some hosts may not expose an adequate configuration include or overlay facility. A dedicated OpenCode guardrails plugin remains necessary for parsed target rejection.
- **Maintenance:** Fewer entry-level ownership comparisons, but host-specific overlay discovery, precedence and lifecycle behavior require ongoing verification. Shared classification and the advisory fingerprint mechanism from Approach A still apply.
- **Friction vs ideal:** This changes the consumer configuration topology, install manifest and host bootstrap paths. No supported overlay capability has been established for every host in this investigation, so feasibility is unproven. Moving existing entries into overlays would also need careful handling of consumer-owned edits and explicit approval for any migration. Prefer this only if host documentation demonstrates the composition contract; introducing a custom configuration loader would outweigh its ownership benefit for this scope.

## Approach C — Enforce through a constrained execution broker

Route key reads and downloads through one execution service that receives structured file paths and URLs, then issues narrowly scoped operations instead of inspecting arbitrary shell text.

- **Complexity:** `HIGH`.
- **Extensibility:** A structured execution boundary can validate the actual requested operation and could handle destination changes at execution time. Host integrations submit typed requests rather than maintaining separate command heuristics.
- **Risk:** Any remaining unrestricted shell or file tool bypasses the broker. Effective protection therefore depends on host or operating-system confinement, not simply adding a new plugin. A broker introduces a privileged component and its own availability failure modes.
- **Maintenance:** A service or process lifecycle, protocol compatibility, packaging and support matrix replace the current small hook surface. Permission ownership still matters wherever host grants remain installed.
- **Friction vs ideal:** This changes bkit from an install-time CLI and agent payload into an execution intermediary, conflicts with the current no-service architecture, and exceeds the requested guard-gap closure. It would require a new approval decision and a separate threat model. Do not adopt it for this change.

## Decisions

<!-- prettier-ignore -->
| Decided | Alternatives | Why |
| --- | --- | --- |
| Recommend Approach A for this design. | Separate overlays; execution broker. | It gives one policy meaning and explicit ownership while matching the accepted outcomes without adding a service or assuming undocumented host composition features. |
| Follow the accepted dedicated OpenCode guardrails plugin choice. | Extend `bkit-gateguard.js`. | Security verdicts and edit advisories have distinct responsibilities, and the plugin can share classification rather than duplicate it. |
| Keep command classification separate from host enforcement capability. | Let each adapter implement its own parser and policy. | Codex key denial and advisory env reads can differ intentionally while classification remains shared. |
| Refuse unresolved or unapproved download targets. | Prompt for ambiguous targets; allow with a note. | The owner accepted refusal. Conservative parsing gives a clear support boundary without claiming to emulate arbitrary shell execution. |
| Record generated grant ownership and preserve unrelated user permissions. | Replace permission maps; identify ownership from text alone. | The accepted preservation requirement cannot be met by destructive regeneration or by guessing authorship from an identical key. Missing historic provenance remains a real compatibility question. |
| Treat the cloud fingerprint as a scoped freshness signal. | Treat it as proof of live platform enforcement; block on mismatch. | The existing fingerprint covers derived egress, and the owner accepted warnings with refresh instructions and continued bootstrap for missing or mismatched stamps. |
| Keep existing advisory contracts on other hosts unless the design explicitly identifies a required departure. | Promote every fetch or secret verdict to denial across hosts. | The requested hard changes concern Codex keys and OpenCode downloads. Shared classification does not require silently changing every host's enforcement policy. |

