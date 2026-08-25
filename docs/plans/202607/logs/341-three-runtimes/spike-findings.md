# #341 Pre-build spike findings

Branch: `spike/341-three-runtimes` · Date: 2026-07-22 · Runtime of this session: **mode 1 (local laptop)**

Settles the three pre-build decision spikes named in the design summary. Some sub-questions are
mode-3-specific and are explicitly flagged as **NEEDS LIVE WEB SESSION** — a mode-1 session cannot
observe them.

---

## Spike A — shim state model + sleep semantics (WS-1)

**Method:** `bkit-runtime.sh` prototype (`bkit_runtime_detect`, env-only capability table) sourced in
one Bash call, read back in a separate Bash call. Timed x34. Foreground `sleep` attempted.

<!-- prettier-ignore -->
| Sub-question | Result | Status |
| --- | --- | --- |
| Does sourced state survive a Bash-call boundary? | **NO.** Separate call: `RUNTIME/CAN_*` all `UNSET`, `bkit_runtime_detect` `NOT DEFINED`. **cwd DID persist** (`/private/tmp/341-spike-a`). | ✅ **SETTLED** — confirms D21 exactly. |
| Per-block env-only re-derivation cost | **0.525 ms/call** (34 calls = 17.86 ms). Negligible. | ✅ **SETTLED** — the "re-probe x34 explodes cost" fear applies only to _network_ probes (`GH_OK`), which D21 already caches to the `runtime-resolved` row. Env-only re-derive per block is free. |
| Does mode-3 harness **error** or **block** on foreground `sleep`? | Mode 1: `sleep 3` **succeeded, exit 0** — no block here. The block is mode-3-only and unobservable locally. | ⚠️ **NEEDS LIVE WEB SESSION** |
| Does the harness inspect command strings (would a shim burying `sleep` evade a guard)? | Not observable in mode 1 (no guard fires here). | ⚠️ **NEEDS LIVE WEB SESSION** |

**Verdict:** The load-bearing question — the state model, called the "fulcrum of Layer 0/1" and the
highest discovery risk — is **definitively settled**: the shim must be **re-sourced per block**, and
probed flags must **round-trip through `status.jsonl`** (only cwd survives). D21 stands as written.
Design's cost worry is over-stated for env-only flags. Only the sleep-block confirmation is deferred
to a web session — and D22's `timeout`-wrapped cap is the mitigation regardless of block-vs-error.

---

## Spike C / D26 — which MCP server + tool names + credential coupling (WS-2)

**Method:** read shipped `.mcp.json` + `cloud-bootstrap.sh:61`; enumerate this session's
`mcp__github__*` toolset.

- **Server (shipped):** `.mcp.json` → `https://api.githubcopilot.com/mcp/` (GitHub's hosted remote MCP),
  `type: http`, `Authorization: Bearer ${GH_BKIT_TOKEN}`.
- **Toolset header:** `X-MCP-Toolsets: context,issues,pull_requests,repos,users,projects` —
  **NO `actions` toolset.**

### Finding C1 — the §6c CI/Actions fallback map has NO enabled MCP tool ⚠️

The shipped toolset excludes `actions`, and this session's `mcp__github__*` surface contains **no**
`actions_list` / `actions_get` / `get_job_logs`. So three §6c map rows are **unreachable as written**:

<!-- prettier-ignore -->
| §6c gh command | mapped MCP tool | reality |
| --- | --- | --- |
| `gh run list --branch X` | `actions_list` | **no such tool under current toolset** |
| `gh run view --log-failed` / `--json jobs` | `actions_get` / `get_job_logs` | **no such tool under current toolset** |
| `gh run download -n playwright-report` | — none — | (already known, §4) |
| **Consequence:** the CI-wait fallback (change #5) and the debug log-fetch fallback have **no MCP path**. |
| Fix is a one-line `X-MCP-Toolsets` addition (`actions`) IF the hosted server exposes it — **or** accept |
| that CI status/logs stay **gh-only** (no fallback: if gh is down in mode 3, CI polling can't recover). |

### Finding C2 — credential coupling CONFIRMED (the fallback-premise killer) ⚠️

`.mcp.json:7` Authorization = `${GH_BKIT_TOKEN}`; `cloud-bootstrap.sh:61` gh auth = **the same
`${GH_BKIT_TOKEN}`**. Both lanes read **one token**. So if mode 3 withholds `GH_BKIT_TOKEN` (the very
reason gh is flaky in §2), the MCP fallback dies **with** the thing it rescues — `GH_OK=false → use MCP`
fails on its own trigger. **This is a design-level defect in the §6 fallback premise, confirmed from
source.** It gates the whole centrepiece and should be resolved before much planning:
either a distinct MCP credential, or accept fallback is unavailable exactly when gh auth fails.

### Still needs a live web session ⚠️

Whether mode 3 actually loads this `.mcp.json` `github` server, or a **proxy-brokered built-in** with
different tool names (and whether `GH_BKIT_TOKEN` is present in-sandbox). Tool names in §6c stay
provisional until observed in mode 3.

---

## Spike B — push_files semantics (WS-3, REDUCED — no protected-dev conflict test)

**Method (per user choice "reduced, no new repo"):** `push_files` of a 2-file payload to throwaway
branch `spike/341-pf-probe` off `cbartens/bkit` `dev` (head `e97965dd`), `[skip ci]` message; observed
via `get_commit` + `get_file_contents`; branch deleted after.

<!-- prettier-ignore -->
| Sub-question | Result | Status |
| --- | --- | --- |
| Payload shape (D5 defect 1) | **`push_files.files[].content` is a full-content string, not a diff** (confirmed from tool schema). Token-bloat is real **by signature** — inlining the real 193 KB/9-file set is ~40-48k tokens per call. | ✅ **CONFIRMED** (mechanism; 193 KB API-acceptance not literally sent — it's a token-cost problem, not an API-limit one). |
| Commit parenting (design L399 assumption) | New commit `e17566f9` has **`parents = e97965dd`** — a **single parent = the branch head**, committer = token owner (not `web-flow`). A plain Git-Data-API commit stacked on head. | ✅ **CONFIRMED** — it **cannot express `merge --squash -X ours`**; it can only append. |
| Multi-file atomicity | 2 files → **1 atomic commit** (`+5` lines, both `added`). | ✅ **CONFIRMED** — the design's "9 calls / 9 commits / non-atomic" worry applies to the `create_or_update_file` **split** fallback, NOT to `push_files` itself. |
| Server-side assert | `get_file_contents` returned exact written content, SHA-addressed. | ✅ **CONFIRMED** — assert-with-`get_file_contents` (not local `git show`) works. |
| Conflict behaviour when dev head MOVED (Risk 9: reject vs clobber) | Not tested — needs a protected/scratch dev; the append-only parenting means it **requires a dev-head-unmoved precondition**, but reject-vs-clobber is unobserved. | ⚠️ **DEFERRED** (skipped by design of the reduced test). |

**Verdict:** `push_files` is confirmed **append-only, single-parent, atomic, full-content**. It is NOT a
merge and cannot replicate `-X ours` — so as a shape-A close transport it can only work when the dev
head is unmoved (Risk 9's precondition is load-bearing, not optional). The one thing still unobserved
is whether a moved-head push is safely **rejected** (fast-forward guard) or silently **clobbers** —
that needs the protected-dev test. Value remains conditional on **C2** (if `GH_BKIT_TOKEN` is withheld
in mode 3, this lane is unreachable regardless).
