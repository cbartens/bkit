# Context-compression proxies for bkit: caveman vs Headroom

Investigation for #545 (caveman) and #538 (Headroom), run 2026-10-14. It answers one question: **would putting a context-compression proxy between bkit's agents and the model save meaningful tokens, and which one?**

## Answer

- **Neither proxy saves much on real bkit work.** On 456 real Claude Code transcripts from a bkit user repo, the safe settings save about **1–2%** of total token cost:
  - caveman 1.6% (95% range 1.1–2.2%);
  - Headroom with Kompress off 1.4% (0.8–2.1%);
  - Headroom with Kompress on 3.8% (3.4–4.3%), and it gets there by corrupting source code.
- **The ceiling is low.** Both proxies were run so that Claude's prompt cache keeps working, and set up that way a proxy only rewrites new tool results. Tool results big enough to compress are **26.9%** of cost; the other 73% (re-read history, system prompt, rules, tool definitions, the agent's own messages) is out of reach.
- **Headroom's default mode was not tested.** Headroom ships with `--mode token`, which also rewrites earlier turns and so can reach part of that 73%. It gives up prompt-cache stability to do so, and Headroom's own code names the cache mode used here `cost_savings`. Whether token mode saves or costs more on Claude is unmeasured. See [Limits](#limits).
- **Output compression is irrelevant.** Agent output is **3.8%** of cost, so caveman's terse voice can't move the total.
- **Both compressors are lossy in ways that hurt bkit.**
  - caveman's log compressor made an agent answer a factual question wrongly.
  - Headroom's text model, Kompress, rewrote code: `(preset) => void` came back as `(preset) void`.
  - caveman's code compressor replaces function bodies with a visible `/* caveman: body elided */` marker.
- **If a proxy is used at all, Headroom with Kompress off is the better fit for Claude Code.** It saves about as much as caveman, needs no agent changes, and handles the Claude Code proxy gotchas. Details in [Recommendation](#recommendation).
- **The larger, lossless savings are in bkit itself:**
  - #549: re-reading long contexts. The median request carries 228k tokens; subagents are 62.8% of cost.
  - #550: reading code. `sed`/`grep`/`cat` reads are about 60% of Bash cost, and 41% of file reads are repeats.

## Setup

<!-- prettier-ignore -->
| Item | Version / detail |
| --- | --- |
| Machine | macOS arm64, Node 24.16.0, uv 0.12.6 |
| caveman | CLI `@caveman-ai/cli` 4.0.1, runtime binaries `bin-v4.0.1` (signature-checked by `caveman setup --install`) |
| Headroom | `headroom-ai[all]` 0.40.0, Python 3.13 via `uv tool` |
| Agents | Claude Code (primary host in the bkit user repo), opencode 2.0.26 |
| Live model | `deepseek/deepseek-v4.1-flash` on OpenRouter |

Install commands used. The cooldown dates are the repo's 7-day minimum release age; caveman 4.0.1 was one day old and was used by explicit choice.

```bash
uv tool install --python 3.13 --exclude-newer 2026-10-07T00:00:00Z "headroom-ai[all]==0.40.0"
DO_NOT_TRACK=1 npm i -g --ignore-scripts @caveman-ai/cli@4.0.1   # no dependencies, no install scripts
caveman setup --install                                            # downloads + verifies runtime into ~/.caveman/bin only
caveman telemetry off                                              # Headroom: HEADROOM_BEACON=off at run time
```

**Isolation check.** Hashes of `~/.claude/settings.json`, `~/.claude.json`, `~/.claude/CLAUDE.md`, `~/.codex/config.toml` and the global opencode config were taken before and after `caveman setup --install`: identical. Neither tool was "enabled" for any agent. All wiring was per checkout and temporary (`bkit-compression-opencode-arm.sh`).

## Tests run

<!-- prettier-ignore -->
| # | Test | Script | What it shows |
| --- | --- | --- | --- |
| T1 | Tiny live request through each proxy | `bkit-compression-probe.py` (tiny payload) | Proxies reach OpenRouter; per-request overhead |
| T2 | Large real payloads through each proxy, live | `bkit-compression-probe.py` | Compression per content type, provider-reported tokens |
| T3 | End-to-end opencode session through each proxy | `bkit-compression-opencode-arm.sh`, `bkit-compression-opencode-tokens.py` | Real agent wiring, recovery, answer quality |
| T4 | Where Claude Code cost goes, from real transcripts | `bkit-compression-usage.py` | Ceiling for any proxy; which tool output matters |
| T5 | Offline replay of real tool results through both compressors | `bkit-compression-replay.py`, `bkit-compression-summary.py` | Expected savings on real bkit work, safety of the rewrites |
| T6 | Claude Code integration review (source reading) | none | Recovery, tool search, 1M context behind a proxy |

### T1: tiny request (direct vs proxies)

One-line prompt, `deepseek/deepseek-v4.1-flash`:

<!-- prettier-ignore -->
| Route | Non-streaming prompt tokens | Streaming prompt tokens |
| --- | --- | --- |
| Direct OpenRouter | 38 | 38 |
| caveman | **389** | 38 |
| Headroom | 38 | 38 |

caveman adds its server-side retrieve tool (about 350 tokens) to **non-streaming** API-key requests only. Claude Code and opencode stream, so they don't pay it.

### T2: large real payloads, live

Same streamed request, with the payload as the latest tool result, pinned to one OpenRouter host (`--host deepinfra`):

<!-- prettier-ignore -->
| Payload (real bkit data) | Direct | caveman | Headroom |
| --- | --- | --- | --- |
| opencode log, 150 KB | 55,588 | **17,254 (−69%)** | 46,078 (−17%) |
| `gh issue list --json` array, 53 KB | 18,813 | **16,595 (−12%)** | 17,987 (−4%) |
| `git log -n 40 --stat`, 125 KB | 37,183 | 37,241 (0%) | **32,241 (−13%)** |
| `git log -n 300 --stat`, 1.2 MB | 333,794 | 333,852 (0%) | **17,762 (−95%)** |
| issue thread JSON (prose), 38 KB | 10,764 | 10,822 (0%) | 10,764 (0%) |

caveman's +58 on rows it didn't compress is its retrieve tool's definition. Which tool wins depends on the content: caveman on logs and JSON, Headroom on large git output.

### T3: opencode end to end

Prompt: have the agent `cat` the 150 KB log, then answer "how many distinct log levels appear?" (correct answer: 3).

<!-- prettier-ignore -->
| Arm | Tokens in the request carrying the log | Answer |
| --- | --- | --- |
| Direct | 26.8k (opencode had already cut the log down) | 3 (correct) |
| Headroom | about 6% saved (3,592 tokens) | 3 (correct) |
| caveman | tool result 18,415 → 5,737; request 26.8k → **13.4k** | **"1 — only INFO" (wrong)** |

The agent answered from the compressed log and never fetched the original. This is the "lossy exact content" risk from #538 and #545, showing up on the first real try. It is one run, with a small model (`deepseek-v4.1-flash`) on opencode, not Claude: it shows the risk exists, not how often it happens.

### T4: where Claude Code cost goes (bkit user repo)

456 transcripts (86 sessions plus 370 subagent transcripts), 56,141 requests, 21 Aug to 14 Oct 2026. Cost is in input-price units: cache read 0.1, 1h cache write 2, 5m write 1.25, output 5. A tool result is costed as written once and then re-read by every later request in its transcript.

<!-- prettier-ignore -->
| Measure | Value |
| --- | --- |
| Cache-read tokens | 14.58 billion (writes 0.19 billion, output 0.014 billion) |
| Output share of cost | **3.8%** |
| All tool results | 34.2% of cost |
| Tool results ≥ 2 KB (what a proxy can compress) | **26.9%** of cost: Bash 23.5%, Read 3.0%, everything else below 0.2% |
| Bash output | 29.8% of cost: `sed` 29.9% of Bash cost, `grep` 16.9%, `cat` 12.8%, `gh issue view` 3.2%, `npx vitest` 0.8% |
| Context per request | median 228,040, p90 486,136, max 963,213 tokens |
| Subagents | 62.8% of cost, 84.4% of it cache re-reads |
| Repeat file reads | 41% (8,262 of 20,169) |
| Serena results | 40 in total, vs 9,848 `sed` reads |

### T5: offline replay of real tool results

Random, seeded sample of real tool results ≥ 2 KB: 250 Bash, 218 Read. Each was compressed as the latest tool result of a turn (what a proxy sees) and weighted by how many later requests re-read it. Headroom ran a second time with Kompress off, on the same files.

**Validation against the live proxies (T2):**

<!-- prettier-ignore -->
| Payload | caveman offline / live | Headroom offline / live |
| --- | --- | --- |
| opencode log | −72% / −69% | −16% / −17% |
| `gh issue list` JSON | −12% / −12% | −6% / −4% |
| `git log -n 300 --stat` | 0% / 0% | −94% / −95% |
| `git log -n 40 --stat` | 0% / 0% | 0% / −13% (offline understates Headroom here) |

**Results** (share of cache-weighted tokens removed; "hit" = samples changed):

<!-- prettier-ignore -->
| Tool | Samples | caveman | Headroom (full) | Headroom, Kompress off |
| --- | --- | --- | --- | --- |
| Bash | 250 | 4.9% (34 hit) | 14.1% (165 hit) | 5.2% (59 hit) |
| Read | 218 | 15.4% (53 hit) | 17.0% (161 hit) | 4.9% (5 hit) |

**Bash by content type** (caveman's classifier label):

<!-- prettier-ignore -->
| Content | Share of Bash ≥ 2 KB | caveman | Headroom | Headroom, Kompress off |
| --- | --- | --- | --- | --- |
| code | 63% | 4.5% | 14.5% | 2.5% |
| text | 28% | 3.1% | 13.9% | 10.3% |
| html | 3% | 14.5% | 15.8% | 0% |
| terminal | 2% | 16.7% | 6.9% | 6.9% |
| log | 2% | 18.8% | 13.4% | 18.8% |
| diff / search / tabular | 3% | 0–10% | 1–27% | 1–27% |

**Projected share of total cost saved:** pool share × savings rate, for Bash (23.5%) and Read (3.0%):

<!-- prettier-ignore -->
|  | caveman | Headroom (full) | Headroom, Kompress off |
| --- | --- | --- | --- |
| Total cost saved | **≈1.6%** | **≈3.8%** | **≈1.4%** |
| 95% range | 1.1–2.2% | 3.4–4.3% | 0.8–2.1% |

The range comes from resampling each tool's samples 2,000 times (`bkit-compression-summary.py --project`). No handful of samples drives the result: the five heaviest samples hold 13% of each tool's weight.

**What the rewrites do to code:**

- **Headroom with Kompress** on a real `cat` of a `.tsx` store file (−27%):
  - stripped all indentation and blank lines;
  - deleted words inside comments;
  - **changed syntax**: `setFilterPreset: (preset: CalendarFilterPreset) => void;` became `setFilterPreset: (preset: CalendarFilterPreset) void;`.

  The only signal is a footer: `[819 words compressed to 575 ... Retrieve more: hash=…]`. This is one example found while reading samples; how often Kompress changes syntax was not counted.

- **caveman** on a real test file (−91%): every `describe(...)` body became `{ /* caveman: body elided */ }`. Lossy, but visible to the agent.

### T6: Claude Code integration (from source)

<!-- prettier-ignore -->
| Concern | caveman 4.0.1 | Headroom 0.40.0 |
| --- | --- | --- |
| Getting the original back | The agent must call the MCP tool `mcp__caveman__caveman_retrieve`. On Pro/Max (subscription) traffic it compresses only if that tool is installed for the agent (`liveZoneCompressionAllowed`), and then compresses every request in the session, including subagents. bkit agents have explicit `tools:` lists, so all of them would need the tool added. | The proxy adds `headroom_retrieve` to each request and **answers the call itself**, streaming included (`ccr/response_handler.py`). Works for every subagent with no `tools:` changes. |
| Claude Code tool deferral behind `ANTHROPIC_BASE_URL` | Sets `ENABLE_TOOL_SEARCH` | Sets `ENABLE_TOOL_SEARCH` (`--tool-search`, on by default) |
| 1M context behind a proxy | No general handling found (only for its own Auto model) | `--1m` adds the `[1m]` model suffix so Claude Code keeps sending the 1M beta header |
| Which part of the request is rewritten | Anthropic: Claude Code's own `cache_control` breakpoints; nothing already cached is rewritten | `--mode cache` (used here): live zone only, prefix forwarded byte for byte. Default `--mode token`: also rewrites earlier turns, giving up prompt-cache stability; not tested |
| Defaults to switch off | voice (`output`), `scripts`, `waste-fixes` (sends extra cache-warming requests), `browse`, telemetry | Kompress (`--disable-kompress`), beacon |

## What went wrong, and how it was handled

<!-- prettier-ignore -->
| Problem | Effect | Handling |
| --- | --- | --- |
| caveman 4.0.1 was 1 day old; bkit's rule is a 7-day release age | Supply-chain risk on a tool that sees all LLM traffic | Explicit human choice to use it; Headroom's whole dependency tree capped with `uv --exclude-newer` |
| OpenRouter hosts report `prompt_tokens` inconsistently | Identical requests read 333,794 vs 667,787 tokens | Probe pins one host (`provider.only`, `--host`, default `deepinfra`) |
| caveman's opencode integration only reroutes the built-in `openai` / `anthropic` / `opencode-go` providers | bkit's agents use the custom `openrouter` provider, so nothing was compressed | compat mount `openrouter` (`bkit-compression-caveman.yaml`) plus a per-checkout `baseURL` edit |
| opencode 2.0.26 doesn't read `OPENCODE_CONFIG_CONTENT` or `OPENCODE_CONFIG` | `headroom wrap opencode` relies on it, so its routing is silently ignored | Same per-checkout config edit for Headroom |
| opencode 2 sends MCP tools behind one `execute` tool | caveman never sees its retrieve tool, so streamed requests stay raw (`compression_eligible = 0`) | Run `caveman-proxy` with `CAVEMAN_RECOVERY=mcp`; `caveman start` hard-codes no recovery (`startMcpRecoveryAvailable()` returns `false`) |
| caveman "raw pinning" | A conversation that once streamed raw stays raw | Fresh conversation per probe |
| Headroom's library protects the last 4 messages by default | The library compresses nothing the proxy would | `protect_recent=0` in the replay |
| Headroom's Kompress loads in the background | First replay run passed text through uncompressed, understating Headroom | `warm_kompress_model()` before replay |
| Kompress takes seconds per sample on CPU | Full replay was too slow | Stopped at 468 of 890 samples: Bash and Read are measured and are 26.5 of the 26.9 points of compressible cost |
| opencode truncates long tool output itself | Caps what either proxy can save on huge dumps | Noted; Claude Code also saves oversized output to a file instead of the context |
| `caveman setup --install --non-interactive` | Rejected (usage error) | Use `caveman setup --install` |

## Recommendation

1. **Don't make a compression proxy a priority.** About 1–2% safe saving doesn't justify the extra moving part in every Claude Code session.
2. **Do #549 and #550 first.** They act on the 73% no proxy can reach, and they lose nothing.
3. **If a proxy is still wanted, use Headroom with `--disable-kompress`, not caveman.**
   - Same savings as caveman.
   - Retrieval works for every bkit subagent with no `tools:` changes.
   - Explicit fixes for Claude Code's tool deferral and 1M window.
   - No code corruption.
4. **Turn off caveman's voice everywhere in bkit if caveman is used for anything.** Output is 3.8% of cost, and the voice harms bkit's written artifacts.

## How to replicate on your own sessions

Measure first (T4). It is free, offline, and tells you the ceiling for your workload.

### 1. Where your Claude Code cost goes

Claude Code keeps every session as JSONL under `~/.claude/projects/<slug>/`. The slug is the project path with `/` replaced by `-`. Subagent transcripts are in `<slug>/<session>/subagents/`.

```bash
python3 tests/compression/bkit-compression-usage.py "$HOME/.claude/projects/-Users-me-src-my-app*" --by-command --context
```

If "results ≥ 2 KB" is a small share of cost, no proxy can help you much; stop here.

### 2. Replay your own tool results (offline, no model calls)

Install the tools as in [Setup](#setup), then:

```bash
mkdir -p tmp/compression
python3 tests/compression/bkit-compression-usage.py "$HOME/.claude/projects/<slug>*" --dump tmp/compression/dump
HR=~/.local/share/uv/tools/headroom-ai/bin/python
$HR tests/compression/bkit-compression-replay.py tmp/compression/dump 250 tmp/compression/replay.jsonl
$HR tests/compression/bkit-compression-replay.py tmp/compression/dump 250 tmp/compression/replay-no-kompress.jsonl --no-kompress
python3 tests/compression/bkit-compression-summary.py tmp/compression/replay.jsonl --no-kompress tmp/compression/replay-no-kompress.jsonl
python3 tests/compression/bkit-compression-summary.py tmp/compression/replay.jsonl --no-kompress tmp/compression/replay-no-kompress.jsonl --by-type
python3 tests/compression/bkit-compression-summary.py tmp/compression/replay.jsonl --rows   # one line per sample
python3 tests/compression/bkit-compression-summary.py tmp/compression/replay.jsonl --no-kompress tmp/compression/replay-no-kompress.jsonl --project Bash=0.235,Read=0.030
```

Projected saving = each tool's "≥2KB share" (step 1) × its saving rate (this step), summed. `--project` does the sum and prints a 95% range; replace `0.235` and `0.030` with your own Bash and Read "≥2KB share" from step 1.

- **The dump holds raw tool output.** Keep it under the gitignored `tmp/` and delete it when done; it can contain secrets that agents read.
- **Allow time.** The Kompress pass takes a few seconds per sample (about an hour for 500 samples on CPU). Use a smaller sample size to get a first number.

### 3. Live probe (optional; costs cents on OpenRouter)

```bash
DO_NOT_TRACK=1 CAVEMAN_RECOVERY=mcp CAVEMAN_MODE=compress CAVEMAN_LISTEN=127.0.0.1:8787 \
  CAVEMAN_CONFIG=tests/compression/bkit-compression-caveman.yaml ~/.caveman/bin/caveman-proxy &
HEADROOM_BEACON=off OPENAI_TARGET_API_URL=https://openrouter.ai/api/v1 headroom proxy --port 8788 --mode cache &
python3 tests/compression/bkit-compression-probe.py <payload-file>    # needs BKIT_OPENROUTER_API_KEY
```

### 4. Real workflow A/B on opencode (optional)

Three worktrees from the same commit, one per arm, each running the same `/bkit-design` or `/bkit-plan`:

```bash
git worktree add ../bkit-test-caveman HEAD && cd ../bkit-test-caveman
../bkit/tests/compression/bkit-compression-opencode-arm.sh caveman    # or baseline / headroom; starts the proxy
opencode --standalone                                                  # must be a new opencode process
python3 ../bkit/tests/compression/bkit-compression-opencode-tokens.py --latest .
../bkit/tests/compression/bkit-compression-opencode-arm.sh baseline   # restore config; `stop` ends both proxies
```

**Read before trusting the numbers:**

- **Compare output quality, not just tokens.** T3 got a wrong answer at −50% tokens.
- **One run per arm is noisy.** Run the baseline twice to see the run-to-run spread.
- **Each arm is a real workflow run.** Tracker writes and commits happen once per arm.

## Files

<!-- prettier-ignore -->
| File | Purpose |
| --- | --- |
| `bkit-caveman-headroom-compression-proxy-comparison.md` | This report |
| `bkit-compression-usage.py` | T4: cost attribution from Claude Code transcripts; `--dump` feeds T5 |
| `bkit-compression-replay.py` | T5: offline replay through caveman and Headroom (run with Headroom's Python) |
| `bkit-compression-summary.py` | T5: per-tool and per-content-type savings; `--project` for the projected total with a 95% range |
| `bkit-compression-probe.py` | T1/T2: live direct vs caveman vs Headroom through OpenRouter |
| `bkit-compression-caveman.yaml` | caveman proxy config: compress mode plus an `openrouter` compat mount |
| `bkit-compression-opencode-arm.sh` | T3: switch a checkout between baseline / caveman / Headroom for opencode |
| `bkit-compression-opencode-tokens.py` | T3: tokens and cost for an opencode session tree |

## Limits

- **Headroom's default mode not tested.** Both proxies ran in cache-safe settings (Headroom `--mode cache`). Headroom's default `--mode token` also rewrites earlier turns, so the 73% "out of reach" share does not apply to it. It trades prompt-cache hits (0.1× input price) for cache writes (1.25–2×) on the rewritten part; whether that nets out as a saving on Claude is unmeasured.
- **One project.** The data comes from a single bkit user repo (an app monorepo), on the Claude subscription. Savings show up as quota and context headroom, not money. Most sessions were driven by hand, not by bkit workflows (#549). A workload heavy in logs, where caveman does well, would save more.
- **API price ratios.** Cost uses API list-price ratios (cache read 0.1, writes 1.25 / 2, output 5). How Anthropic counts cache reads against subscription quota isn't published, so the 27% / 73% split is in API-price terms.
- **Sampling error.** T5 uses 468 of 890 samples; the 95% ranges in T5 show the effect. Headroom's offline replay understated the live proxy on one payload (`git log -n 40`: 0% vs −13%), so its numbers may be a little low.
- **Single examples of harm.** The wrong answer (T3) is one run with a small model; the Kompress syntax change (T5) is one example. Neither has a measured rate.
- **Estimated tool-result tokens.** These are characters / 4 in T4. Request totals and the T1–T3 numbers are provider-reported.
- **Approximate re-read weighting.** The model assumes a tool result stays in context until its transcript ends; compaction can drop it earlier.
- **Costs not counted.** Fetching originals back, caveman's retrieve-tool definition and any cache disruption are left out. Each would lower the proxies' savings.
- **Projected savings, not live ones.** T5 projects savings from replay. The only full agent sessions run through a proxy were the T3 smoke tests, not a full bkit workflow.
