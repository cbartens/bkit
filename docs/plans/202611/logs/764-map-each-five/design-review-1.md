Verdict: PASS
Spike: false

<!-- verdict:end -->

# Design Review

Lens: Buildability — prior art, stack feasibility, library fit, integration risk.

## Prior Art Search

The review used the current source rules, the accepted interview, the design, the document index, relevant architecture/security/technology sections, the capability map and active decisions. No language-server tool is exposed in this session; bounded text searches supplied the symbol locations. The capability map confirmed the workflow modules but did not establish absence of other controls.

<!-- prettier-ignore -->
| Capability | Existing candidate and fit | Recommendation |
| --- | --- | --- |
| Complete enforcement inventory | `.bkit/core/.agents/rules.md` and the design's source-line crosswalk. An independent read-only count found 29 capital-bearing rule bullets, 38 clause rows, no unmapped source line and no extra source line. The current authoring rule defines the five capital words as hard-limit markers. | USE-AS-IS. Preserve the clause splits and explicit scope of the count. A five-row summary would lose exceptions. |
| Host command interception | Shared `guardrails-shell.js`, `guardrails-tiers.js` and `guardrails-read.js`; Cursor/Codex/Antigravity drivers; Claude/OpenCode native permission maps. These are established shipped mechanisms with existing integration and parity tests. | EXTEND-EXISTING. Reuse parsing and translation. No general policy interpreter is justified. The remaining gap is effective host/mode behavior, not another command parser. |
| Workflow push and merge boundaries | `commands/workflow/branches.ts:609`, `pushBranch`, and `commands/workflow/prs.ts:456`, `mergePr`. The push helper omits lease force for shared branches; the merge helper refuses a non-dev base and supplies an explicit empty body. They know targets but do not independently prove owner consent. | EXTEND-EXISTING. Put narrow checks beside these side effects and retain separate interception for direct routes. |
| Approval requests | Claude's documented pre-tool decision API supports ask/deny, while the shipped Codex adapter explicitly translates ask into advisory context. OpenCode's documented auto mode approves requests that are not denied. | ADAPT. Treat each host/mode separately; no source establishes one portable trusted workflow-authorization channel. G1 correctly keeps its automatic exception conditional. |
| Staged-content protection | The existing copy-and-own `.bkit/templates/.husky/pre-commit` delegates to the format gate; Git provides a pre-commit rejection point. The current template is not a secret scanner and is not installed automatically. | EXTEND-EXISTING. G3 needs the actual candidate index snapshot, installation prerequisites and explicit bypass limits. Keep the existing consumer-owned hook contract. |
| Bounded secret detection | The repository already ships a copy-and-own Trivy workflow with the secret scanner. Trivy supplies configurable built-in detection rules; Gitleaks supplies repository/file/stdin scanning. Neither existing CI scanning nor repository push protection covers arbitrary outgoing tracker/chat payloads. | ADAPT existing detector capabilities when G3/G4 choose an implementation. Reuse the existing bkit publication boundaries. The design selects no detector or custom regex engine, so it creates no unjustified NEW component. |
| Parsed contracts | Existing ledger validation, step/verdict readers, workflow-shape and notation audits, and instruction tests reject malformed data on their routes. | USE-AS-IS. Preserve the distinction between a test source, an executed test, a commit/CI gate and a runtime parser. |

Primary documentation inspected on 2026-11-03:

- [Git hooks](https://git-scm.com/docs/githooks) documents that pre-commit can reject a commit and that `--no-verify` bypasses it; the hook runs before the proposed commit message is obtained.
- [Claude Code hooks](https://code.claude.com/docs/en/hooks) documents pre-tool permission decisions. That available API does not imply that bkit's current advisory-only Claude shell driver uses it.
- [OpenCode permissions](https://opencode.ai/docs/permissions/) explicitly distinguishes interactive ask from automatic approval under `--auto`; deny remains a block.
- [Trivy secret scanning](https://trivy.dev/docs/latest/guide/scanner/secret/) documents built-in/custom rules and allow rules. Coverage and false-positive treatment need deliberate configuration.
- [Gitleaks](https://github.com/gitleaks/gitleaks/blob/master/README.md) documents stdin and repository/file scanning; its current maintenance notice says future releases are security patches only. It is a comparison candidate, not a selected dependency.
- [GitHub push protection](https://docs.github.com/en/code-security/concepts/secret-security/push-protection) is complementary protection for supported secrets on enabled repositories, not a replacement for a pre-publication tracker-payload check.

Searches included Git's built-in hook/index mechanism, native host permission APIs, current secret-scanning practice, and the repository's existing secret/scan, push, merge and worktree helpers. Third-party search results containing behavioral directives were ignored; only primary sources support this review.

## Stack Feasibility

Feasible for the requested decision-only scope. The deliverable is a complete evidence map with dispositions and separate future guard proposals. It introduces no runtime schema, service, installation change or code. The existing Node/TypeScript CLI, shared JavaScript hook parts, native host settings and Git hooks provide credible extension points for G2-G4 and the interception portion of G1.

G1 is a conditional proposal, not a proven cross-host approval implementation. The design expressly rejects writable status/locks/environment variables as proof of consent and allows a sourced limitation where no reliable route is available. That matches the owner's reliability condition. Implementation must establish the owner-controlled channel before promising an automatic workflow exception; the current map can be accepted without pretending that experiment has already succeeded.

The count and classifications are appropriately bounded to shipped source and documented behavior. Source adapters confirm Codex's advisory ask, native-map differences and the lease exception. Live-host behavior was not exercised here, and the design does not claim otherwise.

## Library / API Evaluation

No new library is selected. The existing package is MIT-licensed, runs on Node >=24, uses TypeScript, and has no runtime package dependency. The design therefore adds no measured binary, image or bundle footprint.

Git's hook API is mature and already adopted, but it is optional, locally configurable and bypassable. A pre-commit hook receives no proposed commit-message argument, so G3's index scanning and G4's message/payload scanning need distinct existing boundaries. Host permission APIs expose different JSON contracts and operating modes; compile-time types or fixture parity cannot prove that the live host honors an emitted result.

Trivy and Gitleaks are established external scanner candidates, not drop-in Node built-ins. If a later proposal selects one, it must evaluate the exact pinned version's license, distribution footprint, startup cost, supported input route, redaction and maintenance posture. This review does not infer those measurements or approve adding either package. Existing GitHub push protection is service-side and configuration-dependent, so it cannot meet a stack-agnostic local payload requirement by itself.

## Integration Risk

The present change affects documentation only. Subsequent changes touch high-impact shared components: three parsed-command adapters, two native permission maps, generated host copies, bkit's Git/tracker helpers and optional consumer-owned hooks. A successful source fixture is not proof that every installed host/version has equivalent behavior.

The design correctly identifies the major boundaries: direct shell versus child process, ordinary push versus an explicitly authorized workflow action, branch/ref resolution, direct MCP publication versus bkit-owned payloads, and index content versus working-tree content. It also preserves the existing fail-open contract unless a future change explicitly revises it. No monorepo or database boundary is introduced.

The main integration constraint for G3 is deployment: changing a copy-and-own template does not retrofit an existing consumer hook. The main constraint for G1 is authorization provenance: removing a prompt based solely on agent-writable coordination state would violate the accepted condition. Both are already bounded in the draft; the optional clarifications below make the later proposals harder to misread.

## PoC Approach

No code probe is needed to accept this inventory and the decision to propose four follow-ups. For later guard work, use temporary repositories with synthetic secret-shaped values and a fake publication sink. Verify a clean operation, a blocked operation, reordered flags, destination-ref mapping, a changed staged snapshot and redacted failure output. Run each host adapter fixture, then a live host/mode probe to verify the observed stop or approval. For G1, attempt to forge the proposed authorization using only the agent's writable state; reject the mechanism if that succeeds. These experiments belong to the selected guard's design/build acceptance and must not be reported as already performed.

## Unknowns & Blockers

None that require code execution before this decision-only design proceeds. Current classification, source coverage and the stated limitations can be checked from source and primary documentation.

G1's trusted approval route, G2's full target-resolution coverage, G3/G4 detector behavior and live host compatibility remain evidence requirements of their separate follow-ups. The draft neither chooses an unproven authorization implementation nor claims those future guards already work. Consequently `Spike` is false for this workflow.

## Verdict Reasoning

PASS. The inventory is complete for its explicit hard-limit definition, its evidence levels distinguish source from runtime observation, and the four follow-ups reuse credible existing boundaries without expanding this issue into implementation. No settled owner answer is silently changed. No NEW component is selected over a covering in-repo candidate. The remaining suggestions improve future proposal precision but do not prevent completion of the requested enforcement map.

## CRITICAL

None.

## OPTIONAL

1. In G3, qualify “commit/publication is the durable stop” as the covered commit path, and name `git commit --no-verify`, disabled hooks and commits produced through other plumbing as bypasses. Git documents the bypass, and current policy G2 only hardens push `--no-verify`. This avoids implying that every later push is rescanned for secrets.
2. In G3's later acceptance criteria, require the scan to cover the candidate snapshot after any formatter or other hook mutates the index, including alternate-index and partial-commit flows where supported. The existing pre-commit template invokes a formatting gate; checking only a pre-format working-tree snapshot is insufficient.
3. In G1's follow-up proposal, make capability validation an explicit first deliverable: identify the owner-controlled approval channel and supported host modes before promising an automatic exception. A limitation/fallback is an acceptable outcome under the accepted Q1 condition, but it must not be disguised as implemented parity.
4. Add the existing Trivy template and repository push protection as complementary prior art with their distinct timing and installation/configuration limits. They do not replace G3/G4, but the current reuse table's ignored-path/read-gate examples understate existing detection options.

## OUT OF SCOPE

Building or installing guards, changing host permission settings, choosing a scanner dependency, retrofitting consumer-owned hooks, creating tracker issues and running live host experiments. No new out-of-scope feature is proposed by this review.
