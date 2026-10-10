// shared/log-prefix.ts — the log prefix every install-side message carries.
// The running verb sets it (setLogPrefix: "[bkit-check]" for `bkit check`, …) so log
// scanners can tell which verb actually ran.
export let LOG_PREFIX = "[bkit-install]";
export function setLogPrefix(prefix) {
    LOG_PREFIX = prefix;
}
