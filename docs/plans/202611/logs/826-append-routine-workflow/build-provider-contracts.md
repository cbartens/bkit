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
| Jira Rovo | The replacement credential succeeds with the existing Bearer endpoint and engine initialization handshake. The local environment uses the canonical `BKIT_JIRA_API_KEY` without an email. Created one disposable Task in the first writable project with Low priority and a test label. Created and edited only its generated test comment. `addOrEditJiraIssueComment` omits `commentId` for create and supplies the returned string ID for edit. Its MCP text parses to `{data:{message,commentId,body,appliedContentFormat,jsmCommentType}}`; the response has no author or timestamps. Direct `listJiraIssueComments` with `view: evidence` returns `{data:{startAt,maxResults,total,isLast,appliedContentFormat,comments:[{id,author:{accountId,displayName},body,created,updated,updateAuthor,jsdPublic}]}}`. Compact view omits the stable account ID. The observed times use ISO offsets such as `2026-11-03T11:43:17.402+1000`. Creation time and ID survived the edit; updated time changed. The mutation's normalized Markdown body exactly matched its post-edit list body, and two repeated evidence reads were identical. Markdown normalization adds blank lines, changes bullet markers and emphasis syntax; exact outgoing source must stay cached separately. Explicit HTML reads return `appliedContentFormat: html` and HTML headings that preserve the h6 generated/section markers, so that representation cannot be mistaken for Markdown fingerprint evidence. | Multi-page chronology, rich-content page switching, size boundaries and lost-response recovery remain acceptance work. No HTML write, unrelated issue mutation or cleanup was performed. |

Raw schema discovery and redacted comment observations are available locally in `tmp/826-provider-discovery.json`, `tmp/826-comment-evidence.json`, `tmp/826-linear-limits.json`, `tmp/826-linear-create-limits.json`, `tmp/826-github-id-evidence.json` and `tmp/826-github-rest-id-evidence.json`. Only generated probe body text and opaque or hashed author IDs were retained from comment responses. The first broad Linear mutation-introspection query exceeded its complexity budget; a narrowed field-name query succeeded.

The successful Jira run's raw responses are gitignored under `tmp/826-jira-*.json`, including tool schemas, project discovery, disposable issue identity, create/edit responses, evidence reads and the explicit HTML read. They contain private site/project/account identifiers and are not copied into tracked reports or test fixtures. The initial `invalid_token` diagnosis is superseded by the successful replacement credential; the transport contract did not change.

## Additional Jira test evidence

The separate test `edits Jira comments with verified preflight evidence` was added without changing the frozen Group 1 cases. Before supported Jira source changes, its targeted unit run failed with `TrackerError: jira: comment edit capability is unverified`; the local log is `tmp/826-jira-evidence-test-red.log`. It supplies the observed data-wrapped mutation and evidence-list shapes and checks the edited ID, stable author, revised timestamp and returned-body fingerprint.

The separate test `reads Jira ownership evidence and seals HTML or anonymous representations` covers direct evidence listing, stable account identity and conservative rejection of HTML or display-name-only ownership. Its first targeted run failed through the legacy issue-fetch sequence before direct evidence inspection existed; the local log is `tmp/826-jira-inspect-test-red.log`. These local runs document test development; the orchestrator owns formal red recording. Final test-file lint and formatting checks passed.

## Primary references

- [GitHub issue comment API](https://docs.github.com/en/rest/issues/comments) documents ID-based edits and raw Markdown representations.
- [Linear GraphQL](https://linear.app/developers/graphql) documents schema introspection and checking GraphQL errors.
- [Atlassian supported tools](https://developer.atlassian.com/cloud/rovo-mcp/guides/supported-tools/) lists `addOrEditJiraIssueComment`; a published tool name does not establish the deployed schema.
- The local `.bkit/trackers.md` § jira setup and the recorded Jira support and engine tracker decisions establish scoped **Atlassian MCP V2** tokens using Bearer without an email. An initial email request based on the generic [Atlassian API token authentication guide](https://developer.atlassian.com/cloud/rovo-mcp/guides/configuring-authentication-via-api-token/) was corrected after checking those records. No new credential path was implemented.
