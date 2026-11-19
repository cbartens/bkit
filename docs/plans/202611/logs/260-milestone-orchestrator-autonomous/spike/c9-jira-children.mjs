// C9b probe: can the Atlassian MCP endpoint the adapter uses list a parent's children with
// JQL `parent = KEY`? Same transport as JiraSession in tracker.ts. Reads BKIT_JIRA_API_KEY;
// prints no secret. Usage: node c9-jira-children.mjs <site-host>
const key = process.env.BKIT_JIRA_API_KEY;
const site = process.argv[2];
if (!key || !site) {
  console.log("need BKIT_JIRA_API_KEY and a site argument");
  process.exit(2);
}
const URL = "https://mcp.atlassian.com/v2/mcp";
let session = null;
let id = 0;
async function post(body) {
  const headers = {
    authorization: `Bearer ${key}`,
    accept: "application/json, text/event-stream",
    "content-type": "application/json",
    ...(session ? { "mcp-session-id": session } : {}),
  };
  const res = await fetch(URL, { method: "POST", headers, body: JSON.stringify(body) });
  const text = await res.text();
  if (!session) session = res.headers.get("mcp-session-id");
  const json = text.startsWith("{")
    ? text
    : text
        .split("\n")
        .filter((l) => l.startsWith("data:"))
        .map((l) => l.slice(5).trim())
        .pop();
  return { status: res.status, msg: json ? JSON.parse(json) : null, raw: text.slice(0, 300) };
}
const init = await post({
  jsonrpc: "2.0",
  id: ++id,
  method: "initialize",
  params: { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "bkit-spike", version: "0" } },
});
console.log("initialize http", init.status, init.msg?.error ? JSON.stringify(init.msg.error) : "ok");
if (init.status !== 200) {
  console.log("raw", init.raw);
  process.exit(1);
}
await post({ jsonrpc: "2.0", method: "notifications/initialized" });
const list = await post({ jsonrpc: "2.0", id: ++id, method: "tools/list", params: {} });
const names = (list.msg?.result?.tools ?? []).map((t) => t.name);
const search = names.find((n) => /jql/i.test(n));
console.log("search tool", search);
async function jql(q) {
  const r = await post({
    jsonrpc: "2.0",
    id: ++id,
    method: "tools/call",
    params: { name: search, arguments: { cloudId: site, jql: q, maxResults: 50, fields: ["summary", "parent"] } },
  });
  if (r.msg?.error) return { error: r.msg.error };
  const text = r.msg?.result?.content?.[0]?.text ?? "";
  try {
    return JSON.parse(text);
  } catch {
    return { text: text.slice(0, 300), isError: r.msg?.result?.isError };
  }
}
const anyChild = await jql("parent is not EMPTY ORDER BY created DESC");
const issues = anyChild.issues ?? anyChild.nodes ?? [];
console.log("child issues found", Array.isArray(issues) ? issues.length : JSON.stringify(anyChild).slice(0, 300));
const parentKey = issues[0]?.fields?.parent?.key;
console.log("first child", issues[0]?.key, "parent", parentKey);
if (parentKey) {
  const kids = await jql(`parent = ${parentKey}`);
  const list2 = kids.issues ?? [];
  console.log(`parent = ${parentKey} ->`, list2.map((i) => i.key).join(","), "count", list2.length);
}
