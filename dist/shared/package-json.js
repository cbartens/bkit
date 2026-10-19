// shared/package-json.ts — read a checkout's `package.json`, saying why when it cannot.
//
// Commands that look up a script or a `bkit` setting need to tell "no file" and
// "file is not JSON" apart from "key absent", so a broken manifest is named in the
// message instead of reading as an empty one.
//
// `readInstallingVersion` reads the same file for the bkit package doing the install.
import * as fs from "node:fs";
import * as path from "node:path";
import { parseJson } from "./json.js";
import { getPkgRoot } from "./package-roots.js";
/** `dir/package.json` as an object, or why it could not be read as one. */
export function readPackageJson(dir) {
    const file = path.join(dir, "package.json");
    if (!fs.existsSync(file))
        return { ok: false, reason: "missing" };
    const parsed = parseJson(fs.readFileSync(file, "utf-8"));
    if (!parsed.ok ||
        typeof parsed.value !== "object" ||
        parsed.value === null ||
        Array.isArray(parsed.value)) {
        return { ok: false, reason: "unparseable" };
    }
    return { ok: true, pkg: parsed.value };
}
/**
 * The version of the bkit package doing the install, read from that package's own
 * `package.json` (`root` defaults to the package root; never the consumer's file).
 * Throws when the file is missing, is not a JSON object, or has no non-empty string
 * `version`: the value is stamped into every managed file and the `.bkit/version` pin,
 * so a damaged package stops the command instead of writing a guessed version.
 */
export function readInstallingVersion(root = getPkgRoot()) {
    const file = path.join(root, "package.json");
    const read = readPackageJson(root);
    if (!read.ok) {
        const state = read.reason === "missing" ? "is missing" : "is not a JSON object";
        throw new Error(`bkit's own package.json ${state} (${file}); reinstall @cbartens/bkit.`);
    }
    const version = read.pkg["version"];
    if (typeof version !== "string" || version === "") {
        throw new Error(`bkit's own package.json has no string "version" (${file}); reinstall @cbartens/bkit.`);
    }
    return version;
}
