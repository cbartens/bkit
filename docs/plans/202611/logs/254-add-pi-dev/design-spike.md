Verdict: FAIL

<!-- verdict:end -->

# Design Spike

## Claims

<!-- prettier-ignore -->
| Claim | Design dependency | Status |
| --- | --- | --- |
| S5. Forced cancellation stops Pi and its shell descendants by terminating the supervised Pi process group within the deadline. | Child supervision and worktree safety after interruption. | DISPROVEN on macOS. |
| S1. A failed or missing guard prevents the first provider request and any workflow mutation in every supported mode. | Mandatory parent entry and leaf readiness. | BLOCKED. An explicitly loaded failure handler exited before the provider hook in three modes. Missing-guard refusal and mutation gating remain unverified. |
| S2. A leaf loads only its required guard and capabilities. Forbidden direct tools, delegation, foreign extensions and indirect MCP/Codemode calls cannot execute. | Leaf tool policy and safeguard parity. | BLOCKED. The exact active tool list was observed with MCP and extension discovery disabled. Indirect reach and forbidden-tool execution were not exercised. |
| S6. Local JSON and print execution cannot ask, and bkit treats those invocations as headless. | Workflow decision and permission routing. | DISPROVEN for the current bkit runtime classifier. |
| S3. Default and overridden provider, model and thinking selections resolve exactly and complete a real tool call. | Model defaults and configurable providers. | BLOCKED for the full claim. All three current default OpenRouter pairs passed. A non-default provider and override remain unverified. |
| S4. The exact Codex exclusion preserves Pi and user skills through reload in a checkout and linked worktree, and the Pi skill expands by its explicit command. | Mixed-host discovery and independent workflow routing. | SETTLED for the tested Pi version and fixtures. |

## Method

The probes ran on macOS with Node.js 24.16.0 and Pi 1.5.0. The pinned package was `@earendil-works/pi-coding-agent@1.5.0` from npm. Its registry integrity matched the installed lock entry. All probe files, runtime files and fixture repositories lived in `spike/`. The installed runtime and generated fixtures were removed after the runs.

From `spike/`, provision the scoped runtime with these commands.

```sh
mkdir -p runtime
npm_config_cache="$PWD/runtime/npm-cache" npm_config_fetch_retries=0 timeout 12s npm view @earendil-works/pi-coding-agent@1.5.0 version dist.integrity --json
npm_config_cache="$PWD/runtime/npm-cache" npm_config_fetch_retries=0 timeout 70s npm install --prefix "$PWD/runtime" --ignore-scripts --no-audit --no-fund --save-exact @earendil-works/pi-coding-agent@1.5.0
```

- S5. Run `timeout 9s node runtime-probe.mjs cancel`. Start a detached Pi RPC process, issue its real `bash` RPC request with a bounded sleep, record the shell's process group, send `SIGKILL` to Pi's group and check the shell status. The probe then kills its own sleep if it survived. The sandbox denied `ps`, so the process inspection was retried with approval.
- S1 and S6. Run the block below from `spike/`. The explicit extension prints its mode and startup decision. An intentional refusal uses exit 78. The provider-request hook would print a separate marker if reached. The terminal run uses a pseudo-terminal and filters rendering control sequences out of the captured display.
- S2 and S3. Run `direnv exec ../../../../../.. node provider.mjs` from `spike/`. The probe passes the existing OpenRouter credential through the provider's environment to a child that sees only a harmless fixture. It requests one read, records Pi's active tools and effective model and thinking settings, and emits the selected terminal and tool-call fields. The sandbox attempt reported a connection error. The scoped network retry reached OpenRouter.
- S4. Run `direnv exec ../../../../../.. timeout 9s node runtime-probe.mjs resources` from `spike/`. Initialize a disposable repository and a linked orphan worktree. List skills through Pi RPC, add the exact exclusion, reload, list again and start the explicit Pi skill with an argument. The test extension exits 77 after observing the expanded skill and argument before sending any provider request.
- S6 engine check. From the design worktree root, run the last command below against the existing runtime implementation.

```sh
mkdir -p runtime/bootstrap
(
  cd runtime/bootstrap || exit 1
  export PI_CODING_AGENT_DIR="$PWD/../isolated-agent" PI_TELEMETRY=0 BKIT_PI_PROBE_REFUSE=1
  timeout 4s ../node_modules/.bin/pi --mode json --no-session --no-extensions --no-mcp --extension ../../lifecycle.mjs -- "Probe"
  printf 'json_exit=%s\n' "$?"
  timeout 4s ../node_modules/.bin/pi --print --no-session --no-extensions --no-mcp --extension ../../lifecycle.mjs -- "Probe"
  printf 'print_exit=%s\n' "$?"
  sleep 1 | timeout 4s script -q /dev/null ../node_modules/.bin/pi --no-session --no-extensions --no-mcp --extension ../../lifecycle.mjs -- "Probe" | rg -a -o '\{"probe":"startup"[^}]+\}'
  printf 'pipeline_exit=%s\n' "${pipestatus[*]}"
)
node --import tsx --input-type=module -e 'import { classify, headlessRun } from "./.bkit/core/engine/commands/workflow/runtime.ts"; const runtime = classify({}, process.cwd(), () => {}); console.log(JSON.stringify({runtime, runtimeHeadless: headlessRun(process.cwd())}));'
```

## Evidence

Pinned runtime:

```text
{"version":"1.5.0","resolved":"https://registry.npmjs.org/@earendil-works/pi-coding-agent/-/pi-coding-agent-1.5.0.tgz","integrity":"sha512-xNDZ5kqowO6Z03FS2gwAkPEGk1ssxVcYKQ6qZId84mFEvwACvvyc2l0vAMOS+c5zvxLRMLBE9r4y44IGYkMJaQ=="}
```

S5 process inspection, probe exit 0:

```text
{"platform":"darwin","childGroup":47308,"descendantGroup":47342,"result":{"code":null,"signal":"SIGKILL"},"descendantState":"Ss"}
```

S1 and S6 startup records and current bkit engine classification, classifier exit 0:

```text
{"probe":"startup","reason":"startup","mode":"json","hasUI":false,"trusted":true,"provider":"unknown","model":"unknown","thinking":"off","tools":["bash","edit","read","write"],"ownerDecision":"blocked","readiness":false}
json_exit=78
{"probe":"startup","reason":"startup","mode":"print","hasUI":false,"trusted":true,"provider":"unknown","model":"unknown","thinking":"off","tools":["bash","edit","read","write"],"ownerDecision":"blocked","readiness":false}
print_exit=78
{"probe":"startup","reason":"startup","mode":"tui","hasUI":true,"trusted":true,"provider":"unknown","model":"unknown","thinking":"off","tools":["bash","edit","read","write"],"ownerDecision":"interactive","readiness":false}
pipeline_exit=0 78 0
{"runtime":"LOCAL","runtimeHeadless":false}
```

S2 and S3 restricted child and live OpenRouter result, probe exit 0:

```text
{"probe":"startup","reason":"startup","mode":"json","hasUI":false,"trusted":false,"provider":"openrouter","model":"deepseek/deepseek-v4.1-flash-1017","thinking":"max","tools":["read"],"ownerDecision":"blocked","readiness":true}
{"probe":"provider_request"}
{"probe":"provider_request"}
{"selection":{"model":"deepseek/deepseek-v4.1-flash-1017","thinking":"max"},"readCalls":1,"stopReason":"stop","error":null,"exit":0}
{"probe":"startup","reason":"startup","mode":"json","hasUI":false,"trusted":false,"provider":"openrouter","model":"openai/gpt-6.1-sol","thinking":"medium","tools":["read"],"ownerDecision":"blocked","readiness":true}
{"probe":"provider_request"}
{"probe":"provider_request"}
{"selection":{"model":"openai/gpt-6.1-sol","thinking":"medium"},"readCalls":1,"stopReason":"stop","error":null,"exit":0}
{"probe":"startup","reason":"startup","mode":"json","hasUI":false,"trusted":false,"provider":"openrouter","model":"openai/gpt-6.1-sol","thinking":"high","tools":["read"],"ownerDecision":"blocked","readiness":true}
{"probe":"provider_request"}
{"probe":"provider_request"}
{"selection":{"model":"openai/gpt-6.1-sol","thinking":"high"},"readCalls":1,"stopReason":"stop","error":null,"exit":0}
```

S4 checkout and linked worktree, probe exit 0:

```text
{"label":"checkout","before":["skill:bkit-design","skill:bkit-pi-design","skill:user-skill"],"reloadSuccess":true,"after":["skill:bkit-pi-design","skill:user-skill"]}
{"label":"checkout","explicit":{"probe":"explicit_skill","expanded":true},"exit":77}
{"label":"worktree","before":["skill:bkit-design","skill:bkit-pi-design","skill:user-skill"],"reloadSuccess":true,"after":["skill:bkit-pi-design","skill:user-skill"]}
{"label":"worktree","explicit":{"probe":"explicit_skill","expanded":true},"exit":77}
```

## Design Impact

- S5. A signal to Pi's process group cannot enforce forced descendant cleanup. The observed shell had its own group and was still live after Pi exited. Require containment or descendant-aware termination that remains effective when Pi cannot run shutdown handlers. Verify normal and forced cancellation and coordinator death before permitting writes or worktree resume on a supported platform.
- S6. The current engine reports local execution as interactive even when Pi JSON and print have no UI. Pass actual owner-answer channel capability into bkit's runtime policy and verify blocked or deferred outcomes. Preserve worktree and push permissions independently of interactivity.
- S4. Use `-skills/bkit-design/SKILL.md` in the tested Pi setting shape, relative to `.agents/` for its discovered resources. The initial `-.agents/skills/bkit-design/SKILL.md` form left the Codex command present in both fixtures.

## Unsettled

- S1 needs a controlled entry and leaf handshake with missing and broken guard cases, a live provider-request observer, and a mutation sentinel. The explicit failure-handler result establishes a possible stop mechanism when the extension has loaded.
- S2 needs a foreign extension and a real native MCP service in a trusted fixture. Exercise forbidden direct tool calls, nested delegation and indirect Codemode reach, including the case where a leaf is intentionally granted a subset of MCP tools.
- S3 needs a configured non-default provider and a per-agent override through the actual bkit resolver. The observed thinking values are Pi's effective settings. The probe did not inspect a model provider's internal reasoning.
- S5 still needs validation of a corrected cancellation strategy and other claimed platforms. S6 still needs the corrected bkit decision and permission routing exercised in both modes.

## Verdict Reasoning

FAIL because the measured Pi process group did not contain its shell descendant and the current bkit classifier did not reflect Pi's local headless modes. These findings constrain the design's runtime contracts. The tested skill and default model selections remain usable within the observed scope.
