# Provider contract discovery

> [!CAUTION]
> **Purpose:** Record the provider evidence available before adapter tests and implementation.
>
> **Rules:** Report observed contracts and leave unavailable verification explicit. Retain no credentials, personal names or raw foreign comments.

## Authorization

The owner authorized creating disposable test issues on all three platforms and using the updated local credentials. The GitHub disposable target is [#837 — Disposable workflow comment contract probe](https://github.com/cbartens/bkit/issues/837). Other target identifiers remain in the local, gitignored `tmp/826-live-targets.json`.

## Observed boundaries

<!-- prettier-ignore -->
| Provider | Observations | Remaining evidence |
| --- | --- | --- |
| GitHub | Created a comment, edited it by numeric ID using `PATCH /repos/{owner}/{repo}/issues/comments/{id}`, fetched it by ID, and inspected list pages with `per_page=1`. Responses expose `id`, `user.id`, `body`, `html_url`, `created_at` and `updated_at`. GraphQL comment `databaseId` matches REST `id`, and GraphQL `id` matches REST `node_id`. Actor fragments on `User` and `Bot` expose `id` and `databaseId`; the observed author IDs match REST `user.node_id` and `user.id`, respectively. The edited body exactly matched the submitted h6 markers and emoji. | Multi-page chronology with intervening comments, size boundaries and lost-response recovery remain for the acceptance probe. |
| Linear | Authenticated introspection verified `Comment`, `CommentCreateInput`, `CommentUpdateInput`, `IssueCreateInput` and `CommentConnection`. `commentCreate(input: CommentCreateInput!)` and `commentUpdate(id: String!, input: CommentUpdateInput!)` returned `success` and `comment { id body url createdAt updatedAt user { id } }`. Fetching `comment(id: String!)` returned the edited body exactly. `issue(id: String!) { comments(first: 1) { nodes { ... } pageInfo { hasNextPage endCursor } } }` returned cursor evidence. Both creates and updates with exactly 100,000 ASCII characters or 100,000 non-BMP emoji succeeded with exact returned bodies. Both 100,001-character forms were rejected with `INVALID_INPUT` and a `body` maximum-length constraint of 100,000 characters. The observed budget counts Unicode code points, rather than UTF-16 units or UTF-8 bytes. The original update probe body was restored, and accepted large create-probe bodies were replaced successfully with short test notes. | Multi-page ordering, external edit and lost-response cases remain unverified. |
| Jira Rovo | The updated configured credential was sent using the engine's Bearer authentication to `https://mcp.atlassian.com/v2/mcp`, including the engine's exact User-Agent and initialization payload. Initialization returned HTTP 401 with `invalid_token`, so no deployed tool schemas or issue mutations were obtained. A secret-safe comparison confirmed that the loaded credential matches the sole saved value and contains no surrounding whitespace. | The current credential is rejected by Rovo. All deployed schema, mutation, representation, paging and budget verification remains incomplete. |

Raw schema discovery and redacted comment observations are available locally in `tmp/826-provider-discovery.json`, `tmp/826-comment-evidence.json`, `tmp/826-linear-limits.json`, `tmp/826-linear-create-limits.json`, `tmp/826-github-id-evidence.json` and `tmp/826-github-rest-id-evidence.json`. Only generated probe body text and opaque or hashed author IDs were retained from comment responses. The first broad Linear mutation-introspection query exceeded its complexity budget; a narrowed field-name query succeeded.

## Primary references

- [GitHub issue comment API](https://docs.github.com/en/rest/issues/comments) documents ID-based edits and raw Markdown representations.
- [Linear GraphQL](https://linear.app/developers/graphql) documents schema introspection and checking GraphQL errors.
- [Atlassian supported tools](https://developer.atlassian.com/cloud/rovo-mcp/guides/supported-tools/) lists `addOrEditJiraIssueComment`; a published tool name does not establish the deployed schema.
- The local `.bkit/trackers.md` § jira setup and the recorded Jira support and engine tracker decisions establish scoped **Atlassian MCP V2** tokens using Bearer without an email. An initial email request based on the generic [Atlassian API token authentication guide](https://developer.atlassian.com/cloud/rovo-mcp/guides/configuring-authentication-via-api-token/) was corrected after checking those records. No new credential path was implemented.
