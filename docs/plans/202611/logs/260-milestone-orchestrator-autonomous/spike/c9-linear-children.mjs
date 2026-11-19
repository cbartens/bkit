// C9a probe: does Linear's live schema expose Issue.children with connection arguments,
// and does a real query return a parent's children? Reads BKIT_LINEAR_API_KEY; prints no secret.
const key = process.env.BKIT_LINEAR_API_KEY;
if (!key) {
  console.log("BKIT_LINEAR_API_KEY unset");
  process.exit(2);
}
async function gql(query, variables = {}) {
  const res = await fetch("https://api.linear.app/graphql", {
    method: "POST",
    headers: { authorization: key, "content-type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  const body = await res.json();
  return { status: res.status, body };
}
const intro = await gql(
  `{ __type(name: "Issue") { fields { name args { name } type { name kind ofType { name kind } } } } }`,
);
console.log("introspection http", intro.status);
if (intro.body.errors) console.log("errors", JSON.stringify(intro.body.errors));
const children = intro.body.data?.__type?.fields?.find((f) => f.name === "children");
console.log("Issue.children", JSON.stringify(children));
const parentField = intro.body.data?.__type?.fields?.find((f) => f.name === "parent");
console.log("Issue.parent", JSON.stringify(parentField && { name: parentField.name, type: parentField.type }));
const live = await gql(
  `{ issues(first: 1, filter: { children: { some: { id: { neq: null } } } }) { nodes { identifier children(first: 50) { nodes { identifier } pageInfo { hasNextPage } } } } }`,
);
console.log("live children query http", live.status);
if (live.body.errors) console.log("errors", JSON.stringify(live.body.errors));
console.log("live", JSON.stringify(live.body.data));
