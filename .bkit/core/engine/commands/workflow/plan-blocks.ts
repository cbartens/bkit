// The one reader of a plan's (or a change-shape issue's) task section: groups and
// task blocks between lowercase HTML-comment markers, each task's uppercase fields.
//
//   <!-- bkit:group N start -->
//   ### GROUP N: {title}
//   <!-- bkit:task M start -->
//   - [ ] **TASK M:** {title}
//     - **UPDATE:** `symbol` in `file`: what changes
//     - **DONE WHEN:** ...
//     - **TEST FIRST:**
//       - `test file` `test name` fails on ...
//   <!-- bkit:task M end -->
//   <!-- bkit:group N end -->
//
// Pure text in, groups / tasks / line-numbered errors out; no file-system access, so
// `tests`, `challenge` and the run facts share it. Fenced code is skipped. Task-like
// text outside every task block is an error of kind `stray`, never silently unread.

import * as path from "node:path";

/** The task fields, written in uppercase as `**LABEL:**`. */
export const PLAN_FIELDS = [
  "CREATE",
  "READ",
  "UPDATE",
  "DELETE",
  "DEPENDS ON",
  "DONE WHEN",
  "TEST FIRST",
  "TEST EXCEPTION",
] as const;
export type PlanField = (typeof PLAN_FIELDS)[number];

/** A CREATE / READ / UPDATE / DELETE line: `` `symbol` in `file`: what ``, or `` `file`: what ``. */
export interface PlanRef {
  /** Absent on the file-only form. A Markdown section is `§ heading text`. */
  symbol?: string;
  file: string;
  what: string;
  /** 1-based plan line. */
  line: number;
}

export interface PlanTest {
  test: string;
  name: string;
  line: number;
}

export interface PlanTestFirst {
  line: number;
  /** The `n/a — {reason}` reason, when the task names no test. */
  na?: string;
  tests: PlanTest[];
  /** 1-based lines of entries that are neither a test nor `n/a`. */
  malformed: number[];
}

/** An owner-accepted test-order gap: the tests it covers and its 1-based plan lines. */
export interface PlanTestException {
  tests: PlanTest[];
  lines: number[];
  /** The field's text, entries joined: the reason when the task names no test. */
  text: string;
}

export interface PlanTaskBlock {
  task: number;
  group: number;
  title: string;
  /** The task's box is ticked `[x]`. */
  done: boolean;
  /** 1-based lines of its start and end markers. */
  line: number;
  end: number;
  create: PlanRef[];
  read: PlanRef[];
  update: PlanRef[];
  delete: PlanRef[];
  dependsOn: number[];
  doneWhen?: string;
  testFirst?: PlanTestFirst;
  testException?: PlanTestException;
  /** The block's lines, markers included. */
  text: string;
}

export interface PlanGroup {
  group: number;
  title: string;
  line: number;
  end: number;
  tasks: PlanTaskBlock[];
}

export interface PlanBlockError {
  line: number;
  /** `format`: a malformed block; `stray`: task-like text outside every task block. */
  kind: "format" | "stray";
  message: string;
}

export interface PlanBlocks {
  groups: PlanGroup[];
  tasks: PlanTaskBlock[];
  errors: PlanBlockError[];
  /** 1-based line of a code fence that never closes: nothing after it is read. */
  fenceOpen?: number;
}

/** One Reuse Inventory row: the line as written, its `File` cell's paths and its `Decision` cell. */
export interface InventoryRow {
  line: string;
  files: string[];
  decision: string;
}

/** The Reuse Inventory table: its header and separator lines, and its rows. */
export interface ReuseInventory {
  head: string[];
  rows: InventoryRow[];
}

const tableCells = (row: string) =>
  row
    .split("|")
    .slice(1, -1)
    .map((c) => c.trim());

/**
 * The plan's Reuse Inventory: the first table under the first heading naming Reuse
 * Inventory, before the next heading of the same or a higher level. Each row's `File`
 * cell gives its backticked paths, normalised. No heading, table or `File` column → null.
 */
export function reuseInventory(text: string): ReuseInventory | null {
  const lines = text.split(/\r?\n/);
  const start = lines.findIndex((l) => /^#{2,4} .*Reuse Inventory/i.test(l));
  if (start < 0) return null;
  const level = /^#+/.exec(lines[start]!)![0].length;
  const ends = (l: string) => new RegExp(`^#{1,${level}} `).test(l);
  let head = -1;
  for (let i = start + 1; i < lines.length && !ends(lines[i]!); i++)
    if (/^\s*\|/.test(lines[i]!)) {
      head = i;
      break;
    }
  if (head < 0) return null;
  const cols = tableCells(lines[head]!);
  const file = cols.findIndex((c) => /^file\b/i.test(c));
  const decision = cols.findIndex((c) => /^decision\b/i.test(c));
  if (file < 0) return null;
  const rows: InventoryRow[] = [];
  for (let i = head + 2; i < lines.length && /^\s*\|/.test(lines[i]!); i++) {
    const cells = tableCells(lines[i]!);
    rows.push({
      line: lines[i]!,
      files: [...(cells[file] ?? "").matchAll(/`([^`]+)`/g)].map((m) =>
        path.posix.normalize(m[1]!),
      ),
      decision: decision < 0 ? "" : (cells[decision] ?? ""),
    });
  }
  return { head: lines.slice(head, head + 2), rows };
}

/** The error for a code fence opened at `line` and never closed. */
export const fenceNeverClosed = (line: number) =>
  `the code fence at line ${line} is never closed; nothing after it is read`;

/** The fields a task writes at most once; CREATE / READ / UPDATE / DELETE repeat, one line per ref. */
const SINGLE_FIELDS: ReadonlySet<PlanField> = new Set([
  "DEPENDS ON",
  "DONE WHEN",
  "TEST FIRST",
  "TEST EXCEPTION",
]);

const MARKER = /^\s*<!--\s*bkit:(group|task)\s+(\d+)\s+(start|end)\s*-->\s*$/;
const GROUP_HEAD = /^###\s+GROUP\s+(\d+):\s*(.*)$/;
const TASK_HEAD = /^\s*- \[([ xX])\] \*\*TASK (\d+):\*\*\s*(.*)$/;
const LABEL_LINE = /^(\s*)(?:- )?\*\*([A-Za-z][A-Za-z -]*?):\*\*\s*(.*)$/;
const SUB_BULLET = /^(\s*)- (.*)$/;
const FENCE = /^\s*(`{3,}|~{3,})/;
const FENCE_CLOSE = /^\s*(`{3,}|~{3,})\s*$/;
const STRAY_TASK = /\*\*\s*task\s+\d+/i;
/** A bold `**TASK N:**` inside a task block other than its own task line. */
const INNER_TASK = /(?<!\S)\*\*task\s+\d+\s*:?\s*\*\*/i;
const STRAY_FIELD = new RegExp(
  String.raw`\*\*\s*(${[...PLAN_FIELDS, "TEST-ORDER EXCEPTION"].join("|")})\s*(?::\*\*|\*\*\s*:)`,
  "i",
);

/** `text` with inline code spans removed: prose naming a label is not the label. */
const withoutCode = (text: string) => text.replace(/(`+)[\s\S]*?\1/g, "");

const spansOf = (text: string) => [...text.matchAll(/`([^`]+)`/g)].map((m) => m[1]!.trim());

/** A CREATE / READ / UPDATE / DELETE value, or null when it is none of the forms. */
export function parseRef(value: string, line: number): PlanRef | null {
  const v = value.trim();
  const sym = /^`([^`]+)`\s+in\s+`([^`]+)`\s*(?::\s*([\s\S]*))?$/.exec(v);
  if (sym)
    return { symbol: sym[1]!.trim(), file: sym[2]!.trim(), what: (sym[3] ?? "").trim(), line };
  const section = /^(§[^`]*?)\s+in\s+`([^`]+)`\s*(?::\s*([\s\S]*))?$/.exec(v);
  if (section)
    return {
      symbol: section[1]!.trim(),
      file: section[2]!.trim(),
      what: (section[3] ?? "").trim(),
      line,
    };
  const file = /^`([^`]+)`\s*(?::\s*([\s\S]*))?$/.exec(v);
  if (file) return { file: file[1]!.trim(), what: (file[2] ?? "").trim(), line };
  return null;
}

interface FieldEntry {
  label: PlanField;
  line: number;
  value: string;
  indent: number;
  items: Array<{ line: number; text: string }>;
  last: number;
}

const testOf = (text: string, line: number): PlanTest | null => {
  const spans = spansOf(text);
  return spans.length >= 2
    ? { test: path.posix.normalize(spans[0]!), name: spans[1]!, line }
    : null;
};

/** One task's fields from its entries; format errors are pushed to `errors`. */
function taskFromFields(
  head: { task: number; group: number; title: string; done: boolean; line: number; end: number },
  fields: FieldEntry[],
  text: string,
  errors: PlanBlockError[],
): PlanTaskBlock {
  const t: PlanTaskBlock = {
    ...head,
    create: [],
    read: [],
    update: [],
    delete: [],
    dependsOn: [],
    text,
  };
  const refs: Record<string, PlanRef[]> = {
    CREATE: t.create,
    READ: t.read,
    UPDATE: t.update,
    DELETE: t.delete,
  };
  for (const f of fields) {
    const entries = [
      ...(f.value.trim() === "" ? [] : [{ line: f.line, text: f.value }]),
      ...f.items,
    ];
    if (f.label in refs) {
      if (entries.length === 0)
        errors.push({
          line: f.line,
          kind: "format",
          message: `TASK ${t.task}: ${f.label} is empty`,
        });
      for (const e of entries) {
        const ref = parseRef(e.text, e.line);
        if (ref === null)
          errors.push({
            line: e.line,
            kind: "format",
            message: `TASK ${t.task}: ${f.label} is neither \`symbol\` in \`file\`: what nor \`file\`: what`,
          });
        else refs[f.label]!.push(ref);
      }
    } else if (f.label === "DEPENDS ON") {
      // `TASK N` names when the entry has them, else bare numbers as the template writes them;
      // an entry starting `none` names no task, whatever follows it. `GROUP N` numbers name
      // groups, never tasks.
      for (const e of entries) {
        if (/^none\b/i.test(e.text.trim())) continue;
        const text = e.text.replace(/\bGROUPS?\s+\d+(?:\s*(?:,|&|-|–|and)\s*\d+)*/gi, "");
        const named = [...text.matchAll(/TASK\s+(\d+)/gi)];
        const nums = named.length > 0 ? named : [...text.matchAll(/\b(\d+)\b/g)];
        for (const m of nums) t.dependsOn.push(Number(m[1]));
      }
    } else if (f.label === "DONE WHEN") {
      t.doneWhen = entries.map((e) => e.text.trim()).join(" ");
    } else if (f.label === "TEST FIRST") {
      const tf: PlanTestFirst = { line: f.line, tests: [], malformed: [] };
      for (const e of entries) {
        if (/^n\/a\b/i.test(e.text.trim())) {
          tf.na = e.text.trim().replace(/^n\/a\s*[—–-]?\s*/i, "");
          continue;
        }
        const test = testOf(e.text, e.line);
        if (test === null) tf.malformed.push(e.line);
        else tf.tests.push(test);
      }
      t.testFirst = tf;
    } else {
      const tests = entries.map((e) => testOf(e.text, e.line)).filter((x) => x !== null);
      const lines = Array.from({ length: f.last - f.line + 1 }, (_, k) => f.line + k);
      t.testException = { tests, lines, text: entries.map((e) => e.text.trim()).join(" ") };
    }
  }
  return t;
}

/** Groups, tasks and errors of a plan's (or issue's) task section. */
export function parsePlanBlocks(text: string): PlanBlocks {
  const lines = text.split(/\r?\n/);
  const errors: PlanBlockError[] = [];
  const groups: PlanGroup[] = [];
  const tasks: PlanTaskBlock[] = [];
  const groupSeen = new Map<number, number>();
  const taskSeen = new Map<number, number>();
  const err = (line: number, message: string) => errors.push({ line, kind: "format", message });
  /**
   * Group numbers ascend through the file: the build runs groups in file order. Task numbers
   * ascend within a group, so a Decision Pause task numbered above the plan's highest can join
   * the paused group.
   */
  let lastGroup = 0;
  let lastTask = 0;
  const numbered = (kind: "GROUP" | "TASK", no: number, last: number, n: number) => {
    if (no === 0) err(n, `${kind} 0: ${kind.toLowerCase()} numbers start at 1`);
    else if (no <= last)
      err(
        n,
        `${kind} ${no} comes after ${kind} ${last}; number ${kind.toLowerCase()}s in ascending order`,
      );
  };

  let fence: string | null = null;
  let fenceLine = 0;
  let group: PlanGroup | null = null;
  let task: {
    task: number;
    line: number;
    head: RegExpExecArray | null;
    fields: FieldEntry[];
    /** The field later lines continue; null after a line that is no field. */
    current: FieldEntry | null;
    counted: boolean;
  } | null = null;
  /** The marker whose next non-blank line must be its heading. */
  let expect: { kind: "group" | "task"; n: number; line: number } | null = null;

  const closeTask = (end: number) => {
    const open = task!;
    task = null;
    if (!open.counted) return;
    const block = taskFromFields(
      {
        task: open.task,
        group: group?.group ?? 0,
        title: (open.head?.[3] ?? "").trim(),
        done: open.head !== null && open.head[1] !== " ",
        line: open.line,
        end,
      },
      open.fields,
      lines.slice(open.line - 1, end).join("\n"),
      errors,
    );
    tasks.push(block);
    group?.tasks.push(block);
  };

  for (const [i, raw] of lines.entries()) {
    const n = i + 1;
    const fenceMark = FENCE.exec(raw)?.[1];
    // A closing fence carries no info string: only the fence characters and spaces.
    const closes = fence !== null && fenceMark?.startsWith(fence) === true && FENCE_CLOSE.test(raw);
    if (fenceMark !== undefined && (fence === null || closes)) {
      fence = fence === null ? fenceMark : null;
      fenceLine = n;
      continue;
    }
    if (fence !== null) continue;

    if (expect !== null && raw.trim() !== "") {
      const want = expect;
      expect = null;
      if (want.kind === "group") {
        const h = GROUP_HEAD.exec(raw);
        if (h === null)
          err(
            n,
            `GROUP ${want.n} (line ${want.line}) is not followed by \`### GROUP ${want.n}: {title}\``,
          );
        else if (Number(h[1]) !== want.n)
          err(
            n,
            `heading says GROUP ${h[1]}, its marker at line ${want.line} says GROUP ${want.n}`,
          );
        else if (group !== null) group.title = h[2]!.trim();
        if (h !== null) continue;
      } else {
        const h = TASK_HEAD.exec(raw);
        if (h === null)
          err(
            n,
            `TASK ${want.n} (line ${want.line}) is not followed by \`- [ ] **TASK ${want.n}:** {title}\``,
          );
        else if (Number(h[2]) !== want.n)
          err(
            n,
            `task line says TASK ${h[2]}, its marker at line ${want.line} says TASK ${want.n}`,
          );
        else if (task !== null) task.head = h;
        if (h !== null) continue;
      }
    }

    const marker = MARKER.exec(raw);
    if (marker) {
      const kind = marker[1] === "group" ? "group" : "task";
      const edge = marker[3];
      const no = Number(marker[2]);
      if (kind === "group" && edge === "start") {
        if (task !== null) {
          err(n, `GROUP ${no} starts inside TASK ${task.task} (line ${task.line})`);
          closeTask(n - 1);
        }
        if (group !== null)
          err(n, `GROUP ${no} starts inside GROUP ${group.group} (line ${group.line})`);
        if (groupSeen.has(no)) err(n, `GROUP ${no} is already used at line ${groupSeen.get(no)}`);
        else {
          groupSeen.set(no, n);
          numbered("GROUP", no, lastGroup, n);
          lastGroup = no;
        }
        lastTask = 0;
        group = { group: no, title: "", line: n, end: n, tasks: [] };
        groups.push(group);
        expect = { kind, n: no, line: n };
      } else if (kind === "task" && edge === "start") {
        if (task !== null) {
          err(n, `TASK ${no} starts inside TASK ${task.task} (line ${task.line})`);
          closeTask(n - 1);
        }
        if (group === null)
          err(n, `TASK ${no} starts outside a group: wrap it in \`<!-- bkit:group N start -->\``);
        const dup = taskSeen.has(no);
        if (dup)
          err(
            n,
            `TASK ${no} is already used at line ${taskSeen.get(no)}; task numbers are unique in the plan`,
          );
        else {
          taskSeen.set(no, n);
          numbered("TASK", no, lastTask, n);
          lastTask = no;
        }
        task = {
          task: no,
          line: n,
          head: null,
          fields: [],
          current: null,
          counted: group !== null && !dup,
        };
        expect = { kind, n: no, line: n };
      } else if (kind === "task") {
        if (task === null) err(n, `\`<!-- bkit:task ${no} end -->\` has no open TASK ${no}`);
        else {
          if (task.task !== no)
            err(
              n,
              `\`<!-- bkit:task ${no} end -->\` closes TASK ${task.task}, opened at line ${task.line}`,
            );
          closeTask(n);
        }
      } else {
        if (task !== null) {
          err(n, `GROUP ${no} ends inside TASK ${task.task} (line ${task.line})`);
          closeTask(n - 1);
        }
        if (group === null) err(n, `\`<!-- bkit:group ${no} end -->\` has no open GROUP ${no}`);
        else {
          if (group.group !== no)
            err(
              n,
              `\`<!-- bkit:group ${no} end -->\` closes GROUP ${group.group}, opened at line ${group.line}`,
            );
          group.end = n;
          group = null;
        }
      }
      continue;
    }

    if (task !== null) {
      if (INNER_TASK.test(withoutCode(raw))) {
        err(
          n,
          `TASK ${task.task}: a second task line inside its block; give that task its own \`<!-- bkit:task N start -->\` block`,
        );
        task.current = null;
        continue;
      }
      const label = LABEL_LINE.exec(raw);
      if (label) {
        const name = label[2]!.trim();
        const known = PLAN_FIELDS.find((f) => f === name);
        const first = task.fields.find((f) => f.label === known);
        if (known !== undefined && SINGLE_FIELDS.has(known) && first !== undefined) {
          err(
            n,
            `TASK ${task.task}: **${known}:** is written twice (first at line ${first.line}); write each field once`,
          );
          task.current = null;
          continue;
        }
        if (known !== undefined) {
          task.current = {
            label: known,
            line: n,
            value: label[3]!,
            indent: label[1]!.length,
            items: [],
            last: n,
          };
          task.fields.push(task.current);
          continue;
        }
        if (PLAN_FIELDS.some((f) => f === name.toUpperCase()))
          err(n, `TASK ${task.task}: write the label in uppercase: **${name.toUpperCase()}:**`);
        else if (/^[A-Z][A-Z -]*$/.test(name))
          err(
            n,
            `TASK ${task.task}: unknown label **${name}:** (fields: ${PLAN_FIELDS.join(", ")})`,
          );
        task.current = null;
        continue;
      }
      const field = task.current;
      if (field === null || raw.trim() === "") continue;
      const bullet = SUB_BULLET.exec(raw);
      if (bullet && bullet[1]!.length <= field.indent) task.current = null;
      else {
        if (bullet) field.items.push({ line: n, text: bullet[2]! });
        else if (field.items.length > 0) field.items.at(-1)!.text += ` ${raw.trim()}`;
        else field.value += ` ${raw.trim()}`;
        field.last = n;
      }
      continue;
    }

    if (raw.trim() === "") continue;
    const prose = withoutCode(raw);
    if (STRAY_TASK.test(prose) || STRAY_FIELD.test(prose))
      errors.push({
        line: n,
        kind: "stray",
        message: `task-like text outside every task block: ${raw.trim()}`,
      });
  }

  if (fence !== null) err(fenceLine, fenceNeverClosed(fenceLine));
  if (task !== null) {
    const open = task as { task: number; line: number };
    err(open.line, `TASK ${open.task} has no \`<!-- bkit:task ${open.task} end -->\``);
    closeTask(lines.length);
  }
  if (group !== null) {
    const open = group as PlanGroup;
    err(open.line, `GROUP ${open.group} has no \`<!-- bkit:group ${open.group} end -->\``);
    open.end = lines.length;
  }
  if (expect !== null) {
    const want = expect as { kind: string; n: number; line: number };
    err(want.line, `${want.kind.toUpperCase()} ${want.n} has no heading line`);
  }
  errors.sort((a, b) => a.line - b.line);
  return fence === null
    ? { groups, tasks, errors }
    : { groups, tasks, errors, fenceOpen: fenceLine };
}
