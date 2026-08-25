# #341 Design addendum — spike outcomes + C1/C2 decisions

Date: 2026-07-22 · Branch: `spike/341-three-runtimes` · Supersedes design §4 (no-artifact-tool),
OQ1, §6c (toolset assumption), and the D26/§6 credential premise. Input for `/bkit-plan 341`.

## Spike outcomes (detail in `spike-findings.md`)

- **A — state model: SETTLED.** State dies across Bash calls (only cwd survives) → D21 stands
  (re-source shim per block; round-trip `GH_OK` through `status.jsonl`). Env-only re-derive = 0.5 ms/call,
  so the "×34 explodes cost" worry was overstated. _Sleep-block_ unobservable in mode 1 (deferred; D22
  `timeout` cap mitigates either way).
- **B — push_files: mechanics settled.** Append-only, **single-parent commit on head**, atomic
  multi-file, **full-content** payload. **Cannot express `merge --squash -X ours`** → as a shape-A close
  transport it _requires_ a dev-head-unmoved precondition (Risk 9 load-bearing). Reject-vs-clobber on a
  moved head is deferred (needs protected-dev test). "9 commits / non-atomic" worry applies only to the
  `create_or_update_file` split, not `push_files`.
- **C — static settled → C1/C2 below.** Live items deferred.

## Decision C1 — ENABLE the `actions` MCP toolset

**Decision:** add `actions` to `.mcp.json` `X-MCP-Toolsets`.

**Grounding** (verified against github/github-mcp-server, not assumed — §6c names were correct, just
not enabled):

<!-- prettier-ignore -->
| §6c gh command | real MCP tool | note |
| --- | --- | --- |
| `gh run list --branch X` | `actions_list` | list workflows/runs |
| `gh run view --json jobs` | `actions_get` | workflows/runs/jobs/artifacts |
| `gh run view --log-failed` | `get_job_logs` (`failed_only=true`) | failed-job logs |
| `gh run download -n playwright-report` | **`actions_get` → `download_workflow_run_artifact` method** | **exists — closes OQ1 / §4 seam** |

**Consequences:**

- CI-wait fallback (change #5) and debug-log fallback become reachable in the real failure mode
  (gh broken-but-token-present: TLS/proxy trust, env-precedence).
- **Closes OQ1 and §4's "no MCP artifact-download tool":** the Playwright report IS fetchable via MCP;
  drop the "job-logs-only" limitation (verify the method's output shape at build).
- Cost: marginal token surface (deferred-tool loading mitigates). `actions_run_trigger` is a write tool
  not needed here; presence doesn't force use (gh stays primary). Use the server's read-only mode if the
  hosted server supports it.

**Rejected alternative — gh-only CI:** leaves the mode-3 CI gate un-recoverable when gh breaks with the
token present; directly undermines #341's "run in all runtimes" goal.

## Decision C2 — DECOUPLE the fallback auth; loud dual-lane preflight; NO second token

**Problem (confirmed from source):** `.mcp.json:7` and `cloud-bootstrap.sh:61` both authenticate via
`${GH_BKIT_TOKEN}`. If mode 3 withholds it, gh AND the MCP fallback die together — `GH_OK=false → use MCP`
fails on its own trigger.

**Decision:**

1. **Prefer the platform proxy-brokered GitHub MCP in mode 3** (auth without in-sandbox token) if present
   — decouples the fallback from `GH_BKIT_TOKEN`. Confirm presence + exact tool names in the one live
   mode-3 session.
2. **Loud preflight over BOTH lanes.** If neither gh nor MCP can authenticate, **ABORT with a clear
   message** — never silently fall back to a lane that is also dead. This kills the D2 improvisation
   class, not just gh flakiness.
3. **No second explicit MCP token.** A token-withholding sandbox withholds it too; env-precedence
   misconfig is already handled by change #1 (gh hardening: prefer sanctioned `GH_TOKEN`, loud
   `gh auth status`). A second secret adds management surface for no gain.

**Net:** token-present → gh (hardened) primary + MCP fallback (same or proxy transport) works;
token-absent → hard-fail loudly, not silent degradation. The proxy-brokered built-in is a
live-confirmed upgrade to full decoupling.

## Residual live-mode-3 items (carry into plan as accepted risks, settled by WS-16)

- Sleep block-vs-error (D22) — `timeout` cap mitigates either way.
- Which MCP server mode 3 actually loads + is `GH_BKIT_TOKEN` in-sandbox — settles whether C2 lands as
  "decoupled/best" or "coupled/hard-fail" (behaviour is safe either way).
- push_files reject-vs-clobber on a moved head (Risk 9) — dev-head-unmoved precondition is the guard.

All three settle in the first real mode-3 run, which the design already accepts as unavoidable.

## Plan-readiness

Four "pre-build decisions" are now resolved or converted to named-and-mitigated risks. `/bkit-plan 341`
is unblocked. The plan should:

- Treat spikes **A and B as CLOSED** (fold findings; drop them from the WS spike list). Only the residual
  live items above remain, owned by WS-16.
- Implement **C1**: one-line `actions` toolset add; re-map §6c to the verified names above; drop the OQ1 /
  §4 artifact limitation.
- Implement **C2**: dual-lane loud preflight; prefer the proxy-brokered built-in in mode 3; keep a single
  shared token (no second secret).
- Keep **WS-16** as the single live-mode-3 validation that closes the residual items.
