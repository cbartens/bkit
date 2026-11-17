// Child process for c7 / c9: takes the real publication lock in repo argv[2], prints
// "HELD <path>", holds it for argv[3] ms, releases it and prints "RELEASED".
import {
  acquirePublicationLock,
  releasePublicationLock,
} from "../../../../../../.bkit/core/engine/commands/workflow/locks.ts";

const [repo, holdMs] = [process.argv[2]!, Number(process.argv[3])];
const lock = await acquirePublicationLock(repo, {
  target: "dev-landing",
  invocation: "local",
  timeoutMs: 5000,
});
if (!lock) {
  console.log("HOLDER-FAILED-TO-ACQUIRE");
  process.exit(2);
}
console.log(`HELD ${lock.path} pid=${process.pid}`);
await new Promise((r) => setTimeout(r, holdMs));
console.log(`RELEASED ${await releasePublicationLock(lock)}`);
