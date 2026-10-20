// Example. Copy to ~/.config/bkit/disk-prune.mjs (`$XDG_CONFIG_HOME/bkit/` when set) and own
// it. bkit install does not write this file and does not overwrite a copy.
/**
 * disk-prune.mjs — this machine's cleanup steps for `bkit disk prune`: tools every repo on
 * the machine shares (Docker, the pnpm store, Xcode, Gradle, simulators). bkit deletes
 * nothing itself: it runs only the steps listed here and in each checkout's
 * `scripts/cleanup/bkit-disk-prune.mjs`.
 *
 * Steps run from the home folder, one at a time, with the same shape as the checkout file:
 * `name`, `mode` ("min" | "max"; `max` runs the `min` steps too), `run` (shell command or
 * function), optional `skip` and `paths` (what `--dry-run` sizes: the most the step can free;
 * leave it out when that misleads). A step whose tool is not installed skips itself.
 *
 * Keep a step only when what it deletes comes back by itself. Deliberately left out — add
 * them yourself only if you accept the cost:
 *   - Docker named volumes (`docker volume prune -a`): local databases live there
 *   - whole runtimes or SDKs (Xcode, Android system images, iOS simulator runtimes, Node
 *     versions): gigabytes to download and a manual step to reinstall
 *   - deleting the whole pnpm store: `node_modules` hard-link into it, so it frees nothing
 *     while any checkout is installed; `pnpm store prune` frees what can be freed
 */

import { spawnSync } from "node:child_process";
import os from "node:os";

/** True when `tool` is on PATH. */
const has = (tool) => spawnSync("sh", ["-c", `command -v ${tool}`]).status === 0;
/** True when a process whose full command line matches `pattern` is running. */
const running = (pattern) => spawnSync("pgrep", ["-f", pattern]).status === 0;
const missing = (tool) => !has(tool) && `${tool} is not installed`;
const dockerDown = () =>
  missing("docker") ||
  (spawnSync("docker", ["info"], { stdio: "ignore" }).status !== 0 && "Docker is not running");
const notMac = () => os.platform() !== "darwin" && "not macOS";

/** Docker's major version; 0 when unreadable. */
function dockerMajor() {
  const r = spawnSync("docker", ["version", "--format", "{{.Server.Version}}"], {
    encoding: "utf8",
  });
  return r.status === 0 ? Number(r.stdout.split(".")[0]) || 0 : 0;
}

// Name the simulators and emulators you can do without; empty = none deleted. Booted or
// running ones are skipped. Find names with `xcrun simctl list devices` and
// `emulator -list-avds`.
const SIMULATORS = [];
const EMULATORS = [];

export default [
  // --- min: stale, cheap ---------------------------------------------------
  {
    // Comes back: the next `docker build` or `docker pull`.
    name: "Docker dangling images",
    mode: "min",
    skip: dockerDown,
    run: "docker image prune -f",
  },
  {
    // Comes back: the next `docker build`, slower once.
    name: "Docker build cache older than 7 days",
    mode: "min",
    skip: dockerDown,
    run: "docker builder prune -f --filter until=168h",
  },
  {
    // Comes back: never needed — no container uses them. Docker 23+ prunes only anonymous
    // volumes; older Docker would also take named volumes, so the step skips there.
    name: "Docker anonymous volumes",
    mode: "min",
    skip: () => dockerDown() || (dockerMajor() < 23 && "Docker older than 23 prunes named volumes"),
    run: "docker volume prune -f",
  },
  {
    // Comes back: the next `pnpm install` that needs a removed package. No `paths`: the
    // store's size is far more than a prune frees.
    name: "pnpm store packages no project uses",
    mode: "min",
    skip: () =>
      missing("pnpm") || (running("pnpm (install|i|add|update)( |$)") && "pnpm is installing"),
    run: "pnpm store prune",
  },
  {
    // Comes back: never needed — these simulators belong to runtimes no longer installed.
    name: "iOS simulators whose runtime is gone",
    mode: "min",
    skip: () => notMac() || missing("xcrun"),
    run: "xcrun simctl delete unavailable",
  },
  {
    // Comes back: the next `npm install` that needs a removed entry.
    name: "npm cache: drop corrupt and unused entries",
    mode: "min",
    paths: ["~/.npm/_cacache"],
    skip: () => missing("npm"),
    run: "npm cache verify",
  },

  // --- max: everything that comes back by itself -------------------------
  {
    // Comes back: the next `docker pull` or `docker build`. Containers you have stopped
    // keep their images; `supabase stop` removes its containers, so its images go too and
    // `supabase start` pulls them again.
    name: "Docker images no container uses",
    mode: "max",
    skip: dockerDown,
    run: "docker image prune -a -f",
  },
  {
    // Comes back: the next `docker build`, slower once.
    name: "All of the Docker build cache",
    mode: "max",
    skip: dockerDown,
    run: "docker builder prune -a -f",
  },
  {
    // Comes back: the next Xcode build, slower once.
    name: "Xcode DerivedData",
    mode: "max",
    paths: ["~/Library/Developer/Xcode/DerivedData"],
    skip: () => notMac() || (running("xcodebuild") && "xcodebuild is running"),
    run: 'rm -rf "$HOME/Library/Developer/Xcode/DerivedData"',
  },
  {
    // Comes back: the next Gradle build downloads and rebuilds what it needs.
    name: "Gradle caches",
    mode: "max",
    paths: ["~/.gradle/caches"],
    skip: () => running("GradleDaemon") && "a Gradle daemon is running (`gradle --stop`)",
    run: 'rm -rf "$HOME/.gradle/caches"',
  },
  {
    // Comes back: an emulator cold-boots once, then saves a fresh snapshot.
    name: "Android emulator snapshots",
    mode: "max",
    paths: ["~/.android/avd/*.avd/snapshots"],
    skip: () => running("qemu-system") && "an Android emulator is running",
    run: 'rm -rf "$HOME"/.android/avd/*.avd/snapshots',
  },
  {
    // Comes back: recreate with `xcrun simctl create` (or Xcode → Devices) when needed.
    name: "iOS simulators named in SIMULATORS",
    mode: "max",
    skip: () => notMac() || missing("xcrun") || (SIMULATORS.length === 0 && "SIMULATORS is empty"),
    run: ({ log }) => {
      const booted = spawnSync("xcrun", ["simctl", "list", "devices", "booted"], {
        encoding: "utf8",
      }).stdout;
      for (const name of SIMULATORS) {
        if (booted.includes(`${name} (`)) {
          log(`kept ${name}: booted`);
          continue;
        }
        const r = spawnSync("xcrun", ["simctl", "delete", name], { encoding: "utf8" });
        log(`${name}: ${r.status === 0 ? "deleted" : "not deleted"}`);
      }
    },
  },
  {
    // Comes back: recreate with `avdmanager create avd` (or Android Studio) when needed.
    name: "Android emulators named in EMULATORS",
    mode: "max",
    skip: () => missing("avdmanager") || (EMULATORS.length === 0 && "EMULATORS is empty"),
    run: ({ log }) => {
      for (const name of EMULATORS) {
        if (running(`-avd ${name}( |$)`)) {
          log(`kept ${name}: running`);
          continue;
        }
        const r = spawnSync("avdmanager", ["delete", "avd", "-n", name], { encoding: "utf8" });
        log(`${name}: ${r.status === 0 ? "deleted" : "not deleted"}`);
      }
    },
  },
  {
    // Comes back: the next `npm install` / `npx` downloads what it needs.
    name: "All of the npm cache",
    mode: "max",
    paths: ["~/.npm/_cacache"],
    skip: () => missing("npm"),
    run: "npm cache clean --force",
  },
  {
    // Comes back: the next `uv` / `uvx` run downloads what it needs.
    name: "uv cache",
    mode: "max",
    skip: () => missing("uv"),
    run: "uv cache clean",
  },
  {
    // Comes back: Homebrew downloads again only to reinstall or upgrade.
    name: "Homebrew downloads and old versions",
    mode: "max",
    skip: () => missing("brew"),
    run: "brew cleanup --prune=all",
  },
];
