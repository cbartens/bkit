Verdict: CONCERNS

<!-- verdict:end -->

# Design Spike

## Claims

<!-- prettier-ignore -->
| Claim | Design dependency | Result |
| --- | --- | --- |
| S1: On supported OpenCode V1/V2 runtimes, a loaded dedicated pre-tool guard refuses a shell call despite native allow, refuses its identical retry, and permits a positive control. A fresh Codex session likewise enforces denial for a dummy private-key read. | Host adapter enforcement and the native convenience-allow strategy. | BLOCKED |
| S2: The complete accepted lexical and URL profile identifies the same destination in Node, curl and GNU Wget, with config and redirect controls. | Shared target parser and the supported download success path. | BLOCKED |
| S3: On this local filesystem, exclusive file creation excludes a cooperating second process, and atomic rename preserves readable recovery intent through process interruption before or after settings replacement; a third hash remains a conflict. | Proposed lock and recovery primitives. | SETTLED |

The claims are ordered by enforcement blast radius. S3 is a primitive claim; it does not claim production integration, stale-lock recovery or power-loss durability.

## Method

All programs and their generated scratch fixtures stayed in `docs/plans/202611/logs/803-close-codex-opencode/spike/`. The programs removed their scratch runtime directories. No dependency, build output, production source or manifest was added.

- S1: `node docs/plans/202611/logs/803-close-codex-opencode/spike/host-prerequisites.mjs`. Discover real installed host versions with XDG runtime directories isolated under the spike. The first direct OpenCode version call was denied when it attempted to open the user's log. Its isolated retry succeeded through the host approval mechanism. Version discovery is prerequisite evidence only.
- S2: `node docs/plans/202611/logs/803-close-codex-opencode/spike/download-clients.mjs`. Use two real loopback HTTP listeners and the installed curl binary. Supply a synthetic default curl configuration containing an extra URL, then use curl's first `-q` flag. Exercise a literal URL, shell-quoted semicolon/ampersand, two URLs, and an HTTP redirect without `-L`. No external destination was contacted. The sandbox refused the initial loopback bind; the same program succeeded on its single approved retry.
- S3: `node docs/plans/202611/logs/803-close-codex-opencode/spike/recovery-primitives.mjs`. Use a real child process for lock contention and real child process exits after intent or settings replacement. Restart classification reads persisted JSON and hashes. This is throwaway primitive code, not the eventual installer implementation.

Primary references: [OpenCode V2 hooks](https://opencode.ai/v2/docs/build/plugins/server/), [OpenCode V2 CLI](https://opencode.ai/v2/docs/cli/), [OpenCode V2 session shell API](https://opencode.ai/v2/docs/api), and [curl URL syntax](https://curl.se/docs/url-syntax.html). The API's direct session shell route is a different entry path from a model's tool call; it was not substituted for the required tool-hook experiment. No fetched directive was executed.

## Evidence

### S1: Real host discovery

Program exit: 0.

```text
{"program":"opencode","status":0,"stdout":"opencode v2.1.4","stderr":""}
{"program":"codex","status":0,"stdout":"codex-cli 0.165.0","stderr":""}
S1 BLOCKED: no supported-version matrix or V1 binary supplied; no loaded dedicated probe plugin, shell positive control or repeated-denial session executed. Version discovery is not enforcement proof.
```

The name-only credential preflight printed:

```text
BKIT_OPENCODE_API_KEY=unset
BKIT_OPENROUTER_API_KEY=set
BKIT_OLLAMA_API_KEY=unset
OPENAI_API_KEY=unset
BKIT_OPENAI_API_KEY=unset
```

The existing project configuration projection printed:

```json
{"providers":["openrouter","opencode-go"],"agents":[]}
```

No default model is configured. No model or authentication session was started. No private-key fixture was read. A configured OpenRouter token's presence does not prove a selected model, fresh trust or hook execution.

### S2: Initial sandbox denial

Program exit: 1.

```text
node:events:487
      throw er; // Unhandled 'error' event
      ^

Error: listen EPERM: operation not permitted 127.0.0.1
    at Server.setupListenHandle [as _listen2] (node:net:1986:21)
    at listenInCluster (node:net:2065:12)
    at node:net:2274:7
    at process.processTicksAndRejections (node:internal/process/task_queues:90:21)
Emitted 'error' event on Server instance at:
    at emitErrorNT (node:net:2044:8)
    at process.processTicksAndRejections (node:internal/process/task_queues:90:21) {
  code: 'EPERM',
  errno: -1,
  syscall: 'listen',
  address: '127.0.0.1'
}

Node.js v24.16.0
```

### S2: Approved local retry

Program exit: 0.

```text
node=v24.16.0
curl 8.7.1 (x86_64-apple-darwin25.0) libcurl/8.7.1 (SecureTransport) LibreSSL/3.3.6 zlib/1.2.12 nghttp2/1.68.1
{"nodeAuthority":"127.0.0.1:63459"}
{"case":"ordinary-and-default-config-disabled","status":0,"stdout":"first","stderr":"","requests":["first:/ok"]}
{"case":"quoted-separators","status":0,"stdout":"first","stderr":"","requests":["first:/a;b?x=1&y=2"]}
{"case":"multiple-targets","status":0,"stdout":"firstfirst","stderr":"","requests":["first:/one","first:/two"]}
{"case":"redirect-not-followed","status":0,"stdout":"first","stderr":"","requests":["first:/redirect"]}
{"program":"wget","status":null,"error":"ENOENT"}
S2 BLOCKED: curl controls above observed locally; GNU Wget is unavailable and no completed bounded bkit lexer/profile exists to compare. No agreement is claimed for untested authorities or options.
```

The ordinary request omitted the synthetic configuration's `/hidden` target. The quoted separators remained in one request. Both explicit targets were requested. The redirect destination listener received no request. These observations cover only the listed curl cases.

### S3: Recovery primitives

Program exit: 0.

```text
{"case":"exclusive-lock","status":0,"stdout":"competing lock=EEXIST","stderr":""}
{"case":"before","interruptedExit":17,"recovery":"not-landed","intentPresent":true,"ownedEntries":1}
{"case":"after","interruptedExit":17,"recovery":"landed","intentPresent":true,"ownedEntries":1}
{"case":"conflict","interruptedExit":17,"recovery":"conflict-preserved","intentPresent":true,"ownedEntries":1}
S3 SETTLED for process-interruption primitives on this local filesystem only; production state writers, stale-lock recovery, unrelated editors and power-loss durability were not tested.
```

## Design Impact

None. No claim is DISPROVEN. Successful primitive and curl observations do not establish the complete host or parser contract.

## Unsettled

- S1 needs concrete supported V1/V2 versions, a real V1 binary, a selected supported model/provider and fresh trusted fixture sessions that load the dedicated plugin and Codex hook. Record actual tool IDs, plugin load evidence, the native allow configuration, an executing positive control, and two refused side-effect attempts. Existing V2 and Codex binaries are available, but version discovery is not that proof. Preparing and driving those separate host sessions exceeds this bounded prerequisite probe; the caller explicitly accepted this limit. No direct shell API or manual callback is accepted as replacement evidence.
- S2 needs GNU Wget and the completed bounded lexer/option/raw-authority profile. This run neither installed nor simulated the missing executable. Compare the complete accepted corpus with both clients, including configuration, redirect, wrapper and authority edge cases. The current probe supplies partial curl evidence only.
- S3 leaves installer-wide state writers, the exact stale-holder lifecycle, crash recovery after each finalization step, and non-cooperating editors for implementation verification. A process exit test does not prove power-loss durability; no fsync guarantee is inferred.
- Historic grant authorship remains a design/owner-policy decision. No experiment can recover provenance that was never recorded.

## Verdict Reasoning

CONCERNS because S1 and S2 remain BLOCKED and none is DISPROVEN. S3 held for the stated local process-interruption primitive contract. The revised design must carry the unresolved host/client evidence as explicit completion gates rather than report them as proven.
