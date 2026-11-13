// vitest.child-deadline.ts — gives a synchronous child call the running test's remaining time.
//
// bkit-only (not shipped). `spawnSync`, `execSync` and `execFileSync` block the worker's event
// loop, so Vitest's own test timeout cannot fire while a child hangs. When the caller passes no
// `timeout`, the wrapper sets one to the time the running test has left; if that limit ends the
// child, SIGKILL ends it (a child that traps SIGTERM cannot outlive the limit) unless the caller set `killSignal`, and the call throws an Error naming the command, its arguments and the limit. A `timeout`
// the caller set is passed through untouched. No dependency on vitest: `vitest.setup.ts`
// supplies the remaining-time function.

type Fn = (...args: unknown[]) => unknown;
// Method syntax keeps parameter bivariance, so the real (overloaded) `node:child_process`
// module and a plain object of its functions both fit without a cast.
export type ChildFunctions = {
  spawnSync(...args: unknown[]): unknown;
  execSync(...args: unknown[]): unknown;
  execFileSync(...args: unknown[]): unknown;
};
type Options = { timeout?: number; killSignal?: unknown } & Record<string, unknown>;

function isOptions(value: unknown): value is Options {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function describeCall(command: unknown, args: unknown, limitMs: number): string {
  const argList = Array.isArray(args) ? ` ${args.map(String).join(" ")}` : "";
  return `${String(command)}${argList} did not finish within ${limitMs} ms (the running test's remaining time)`;
}

/** Wrap the three synchronous child functions on `target` in place. */
export function withChildDeadline(target: ChildFunctions, remainingMs: () => number): void {
  function wrap(name: "spawnSync" | "execSync" | "execFileSync", hasArgs: boolean): void {
    const original: Fn = target[name];
    if (typeof original !== "function") return;
    target[name] = function (this: unknown, ...callArgs: unknown[]): unknown {
      // Options sit last: after the command (execSync) or the argument list (the others).
      const optIndex = callArgs.findIndex((value, index) => index > 0 && isOptions(value));
      const existing = optIndex >= 0 ? (callArgs[optIndex] as Options) : undefined;
      if (existing && existing.timeout !== undefined) return original.apply(this, callArgs);
      const limitMs = Math.max(1, Math.floor(remainingMs()));
      const next = [...callArgs];
      if (existing) {
        next[optIndex] = {
          ...existing,
          timeout: limitMs,
          killSignal: existing.killSignal ?? "SIGKILL",
        };
      } else {
        // Without options the slot after the command (and its arg list) is free.
        const slot = hasArgs && Array.isArray(callArgs[1]) ? 2 : 1;
        next[slot] = { timeout: limitMs, killSignal: "SIGKILL" };
      }
      const args = hasArgs ? callArgs[1] : undefined;
      let result: unknown;
      try {
        result = original.apply(this, next);
      } catch (error) {
        if ((error as NodeJS.ErrnoException | undefined)?.code === "ETIMEDOUT") {
          throw new Error(describeCall(callArgs[0], args, limitMs), { cause: error });
        }
        throw error;
      }
      const err = (result as { error?: NodeJS.ErrnoException } | undefined)?.error;
      if (name === "spawnSync" && err?.code === "ETIMEDOUT") {
        throw new Error(describeCall(callArgs[0], args, limitMs), { cause: err });
      }
      return result;
    };
  }

  wrap("spawnSync", true);
  wrap("execSync", false);
  wrap("execFileSync", true);
}
