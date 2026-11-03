const credentialNames = ["BKIT_GH_TOKEN", "BKIT_LINEAR_API_KEY", "BKIT_JIRA_API_KEY"];
for (const name of credentialNames) {
  console.log(`${name}=${process.env[name] ? "set" : "unset"}`);
}
console.log("jira_live_roundtrip=blocked_without_key_and_disposable_issue");
console.log("linear_live_roundtrip=blocked_without_key_and_disposable_issue");
console.log("github_mutation_roundtrip=blocked_by_read_only_probe_scope");
console.log("provider_boundary_writes=not_attempted");
