#!/usr/bin/env node
// Example. Copy into scripts/ci/ and own it. bkit install does not write this file
// and does not overwrite a copy.
/**
 * check-capstone.mjs — the decision behind the `bkit-tests-check` capstone.
 *
 * Reads the capstone's `needs` context from the environment and reds when green would prove
 * nothing. It fails when:
 *   - a lane's result is not `success` (failed, skipped or cancelled),
 *   - a lane ran although the plan said skip (`run_level` is `none`),
 *   - a lane succeeded having executed 0 tests, or reports a count that is not a number,
 *   - the plan does not parse (not JSON, not an object, or no `run_level`),
 *   - the planner job (`SCOPE_RESULT`) did not succeed,
 *   - no lane is named, or a lane's result was never wired in.
 * It asserts nothing about a skipped lane when `run_level` is `none`.
 *
 * Environment:
 *   LANES                 comma-separated lane names, e.g. `static,unit`. The job named
 *                         `bkit-tests-<lane>` is read from `<LANE>_RESULT` (name upper-cased,
 *                         `-` becomes `_`: `e2e-web` reads `E2E_WEB_RESULT`).
 *   <LANE>_RESULT         `needs.<job>.result`.
 *   <LANE>_RAN            `needs.<job>.outputs.tests_ran`. Setting the variable (even empty)
 *                         makes the lane counted: it must report a number above 0. A lane
 *                         with no such variable is not count-checked.
 *   PLAN                  optional planner JSON (`needs.bkit-tests-scope.outputs.plan`). Unset
 *                         means every listed lane is expected to run. Set, it must parse and
 *                         carry a `run_level`; `none` expects every lane to be skipped.
 *   SCOPE_RESULT          optional `needs.bkit-tests-scope.result`; must be `success`.
 *   EMPTY_COUNT           `warn` turns a lane that reports no count yet into a warning. Any
 *                         other value fails it. A count of 0 or a non-number always fails.
 *
 * Usage:  node scripts/ci/check-capstone.mjs
 * Exit:   0 = every expectation met, 1 = at least one failure.
 */

import path from "node:path";
import { fileURLToPath } from "node:url";

const LANE_NAME = /^[a-z][a-z0-9-]*$/i;
const PREFIX = (lane) => lane.toUpperCase().replace(/-/g, "_");

/** The planner's `run_level` from `raw`, or why `raw` is not a usable plan. */
function readPlan(raw) {
  let plan;
  try {
    plan = JSON.parse(raw);
  } catch (err) {
    return { runLevel: null, problem: err.message };
  }
  if (plan === null || typeof plan !== "object" || Array.isArray(plan)) {
    return { runLevel: null, problem: "not a JSON object" };
  }
  if (typeof plan.run_level !== "string" || plan.run_level === "") {
    return { runLevel: null, problem: "no run_level" };
  }
  return { runLevel: plan.run_level, problem: null };
}

/**
 * Judge the capstone from its environment.
 * @param {Record<string, string | undefined>} env
 * @returns {{ errors: string[], warnings: string[], summary: string }}
 */
export function checkCapstone(env) {
  const errors = [];
  const warnings = [];

  const lanes = (env.LANES ?? "")
    .split(",")
    .map((l) => l.trim())
    .filter(Boolean);
  if (lanes.length === 0) {
    errors.push("LANES names no lane — a capstone that watches nothing proves nothing.");
  }

  if (env.SCOPE_RESULT !== undefined && env.SCOPE_RESULT !== "success") {
    errors.push(`bkit-tests-scope did not succeed (result=${env.SCOPE_RESULT})`);
  }

  let runLevel = null;
  if (env.PLAN !== undefined) {
    const plan = readPlan(env.PLAN);
    runLevel = plan.runLevel;
    if (plan.problem !== null) {
      errors.push(
        `the plan does not parse (${plan.problem}) — expected a JSON object with a run_level, got ${JSON.stringify(env.PLAN.slice(0, 80))}`,
      );
    }
  }
  const expectSkip = runLevel === "none";
  const why = runLevel === null ? "" : `plan.run_level=${runLevel} but `;

  const parts = [];
  for (const lane of lanes) {
    const job = `bkit-tests-${lane}`;
    if (!LANE_NAME.test(lane)) {
      errors.push(`LANES entry '${lane}' is not a lane name (letters, digits and '-').`);
      continue;
    }
    const prefix = PREFIX(lane);
    const result = env[`${prefix}_RESULT`];
    if (result === undefined) {
      errors.push(`${prefix}_RESULT is not set — the capstone cannot read ${job}'s result.`);
      continue;
    }

    if (expectSkip) {
      if (result !== "skipped") {
        errors.push(
          `plan.run_level=none says skip but ${job} ran (result=${result}) — plan and lane disagree.`,
        );
      }
      parts.push(`${lane}=${result}`);
      continue;
    }

    if (result !== "success") {
      errors.push(
        runLevel === null
          ? `${job} result=${result} (expected success)`
          : `${why}${job} result=${result}`,
      );
      parts.push(`${lane}=${result}`);
      continue;
    }

    const ranKey = `${prefix}_RAN`;
    const counted = Object.hasOwn(env, ranKey);
    if (!counted) {
      parts.push(`${lane}=${result}`);
      continue;
    }

    const ran = env[ranKey] ?? "";
    if (ran === "" && env.EMPTY_COUNT === "warn") {
      warnings.push(
        `${job} writes no executed-test count — green does not prove tests ran (see its test step).`,
      );
      parts.push(`${lane}=${result} (count unreported)`);
    } else if (!/^[0-9]+$/.test(ran)) {
      errors.push(
        `${job} succeeded but its executed-test count is non-numeric ('${ran}') — cannot confirm tests ran.`,
      );
      parts.push(`${lane}=${result}`);
    } else if (Number(ran) === 0) {
      errors.push(`${job} succeeded but executed 0 tests — vacuous green (expected >0).`);
      parts.push(`${lane}=${result} (0 tests)`);
    } else {
      parts.push(`${lane}=${result} (${Number(ran)} tests)`);
    }
  }

  const level = runLevel === null ? "" : `, run_level=${runLevel}`;
  return {
    errors,
    warnings,
    summary: `bkit-tests-check passed — ${parts.join(", ")}${level}.`,
  };
}

function main() {
  const { errors, warnings, summary } = checkCapstone(process.env);
  for (const w of warnings) console.log(`::warning::${w}`);
  for (const e of errors) console.log(`::error::${e}`);
  if (errors.length > 0) {
    console.log("::error::bkit-tests-check FAILED — see above.");
    process.exit(1);
  }
  console.log(`✅ ${summary}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
