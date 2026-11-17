diff --git a/.bkit/core/engine/commands/workflow/tracker.test.ts b/.bkit/core/engine/commands/workflow/tracker.test.ts
index e7f06371e..8251acd02 100644
--- a/.bkit/core/engine/commands/workflow/tracker.test.ts
+++ b/.bkit/core/engine/commands/workflow/tracker.test.ts
@@ -278,6 +278,25 @@ describe("trackerTarget", () => {
 // ---------------------------------------------------------------------------
 
 describe("splitAt", () => {
+  it("budgets continuation headers beyond ninety nine parts", () => {
+    const body = stampMarker(`###### bkit:generated\n${"x".repeat(10_000)}`);
+    const parts = splitAt(body, 100);
+    expect(parts.length).toBeGreaterThan(99);
+    expect(parts.every((part) => part.length <= 100)).toBe(true);
+    expect(parts.map((part) => part.split("\n").slice(2).join("\n")).join("")).toBe(
+      "x".repeat(10_000),
+    );
+    expect(splitAt(body, 100)).toEqual(parts);
+  });
+
+  it("refuses aggregation with an unverified provider budget", () => {
+    const render: (body: string, limit: number, options: { verifiedBudget: boolean }) => string[] =
+      splitAt;
+    const body = stampMarker(`###### bkit:generated\n${"😀".repeat(100)}`);
+    expect(render(body, 101, { verifiedBudget: false })).toEqual([body]);
+    expect(render(body, 101, { verifiedBudget: true }).length).toBeGreaterThan(1);
+  });
+
   it("budgets the entire encoded body at limit and overflow", () => {
     const limit = JIRA_COMMENT_LIMIT;
     const marker = stampMarker("###### bkit:generated\nreport").split("\n")[0]!;
@@ -333,6 +352,347 @@ describe("splitAt", () => {
 });
 
 describe("progress inspection", () => {
+  it("rejects inconclusive Linear creation order before selecting recent comments", async () => {
+    process.env.BKIT_LINEAR_API_KEY = "linear-test-key";
+    const target = trackerTarget(linear(), { issue: "ENG-4" });
+    for (const createdAt of [undefined, "invalid-date"]) {
+      vi.stubGlobal(
+        "fetch",
+        vi.fn().mockResolvedValue(
+          new Response(
+            JSON.stringify({
+              data: {
+                issue: {
+                  comments: {
+                    nodes: [
+                      {
+                        id: "own",
+                        body: "own",
+                        createdAt: "2026-11-01T00:00:00Z",
+                        updatedAt: "2026-11-01T00:00:00Z",
+                        user: { id: "owner" },
+                      },
+                      {
+                        id: "foreign",
+                        body: "foreign",
+                        createdAt,
+                        updatedAt: "2026-11-02T00:00:00Z",
+                        user: { id: "human" },
+                      },
+                    ],
+                    pageInfo: { hasNextPage: false },
+                  },
+                },
+              },
+            }),
+            { headers: { "content-type": "application/json" } },
+          ),
+        ),
+      );
+      await expect(recentComments(target, 1)).rejects.toBeInstanceOf(TrackerError);
+    }
+  });
+
+  it("orders Linear comments by creation instant across timestamp offsets", async () => {
+    process.env.BKIT_LINEAR_API_KEY = "linear-test-key";
+    const target = trackerTarget(linear(), { issue: "ENG-4" });
+    vi.stubGlobal(
+      "fetch",
+      vi.fn().mockResolvedValue(
+        new Response(
+          JSON.stringify({
+            data: {
+              issue: {
+                comments: {
+                  nodes: [
+                    {
+                      id: "newer",
+                      body: "newer",
+                      createdAt: "2026-11-01T01:00:00Z",
+                      updatedAt: "2026-11-01T01:00:00Z",
+                      user: { id: "owner" },
+                    },
+                    {
+                      id: "older",
+                      body: "older",
+                      createdAt: "2026-11-01T02:00:00+02:00",
+                      updatedAt: "2026-11-01T02:00:00+02:00",
+                      user: { id: "human" },
+                    },
+                  ],
+                  pageInfo: { hasNextPage: false },
+                },
+              },
+            },
+          }),
+          { headers: { "content-type": "application/json" } },
+        ),
+      ),
+    );
+    expect((await recentComments(target, 1)).map((comment) => comment.body)).toEqual(["newer"]);
+  });
+
+  it("reads Jira ownership evidence and seals HTML or anonymous representations", async () => {
+    process.env.BKIT_JIRA_API_KEY = "jira-test-key";
+    const target = trackerTarget(jira(), { issue: "PROJ-12" });
+    const body = "###### bkit:generated\n\nowned report\n\n";
+    const comment = {
+      id: "101",
+      author: { accountId: "account-7", displayName: "Test author" },
+      body,
+      created: "2026-11-03T11:43:17.402+1000",
+      updated: "2026-11-03T11:44:17.402+1000",
+      updateAuthor: { accountId: "account-7", displayName: "Test author" },
+      jsdPublic: true,
+    };
+    const page = (comments: unknown[], appliedContentFormat: string) => ({
+      startAt: 0,
+      maxResults: 1,
+      total: 1,
+      isLast: true,
+      appliedContentFormat,
+      comments,
+    });
+    const calls = jiraMcp({ data: page([comment], "markdown") });
+    const inspected = await recentComments(target, 1);
+    expect(bodyOf(calls[2]!.init).params).toMatchObject({
+      name: "listJiraIssueComments",
+      arguments: {
+        cloudId: "https://acme.atlassian.net",
+        issueIdOrKey: "PROJ-12",
+        view: "evidence",
+        responseContentFormat: "markdown",
+      },
+    });
+    expect(inspected[0]?.evidence).toMatchObject({
+      id: "101",
+      authorId: "account-7",
+      createdAt: comment.created,
+      updatedAt: comment.updated,
+      fingerprint: actionHash(body),
+      representation: "markdown",
+    });
+    jiraMcp({
+      data: page([{ ...comment, body: "<h6>bkit:generated</h6><p>owned report</p>" }], "html"),
+    });
+    expect((await recentComments(target, 1))[0]?.evidence).toBeUndefined();
+    jiraMcp({ data: page([{ ...comment, author: { displayName: "Test author" } }], "markdown") });
+    expect((await recentComments(target, 1))[0]?.evidence).toBeUndefined();
+  });
+
+  it("edits Jira comments with verified preflight evidence", async () => {
+    process.env.BKIT_JIRA_API_KEY = "jira-test-key";
+    const target = trackerTarget(jira(), { issue: "PROJ-12" });
+    const body = stampMarker("###### bkit:generated\nupdated section 😀");
+    const returnedBody = `${body.split("\n")[0]}\n\nupdated section 😀\n\n`;
+    const evidence = {
+      id: "101",
+      authorId: "account-7",
+      createdAt: "2026-11-03T11:43:17.402+1000",
+      updatedAt: "2026-11-03T11:43:17.402+1000",
+      fingerprint: actionHash("previous returned body"),
+      representation: "markdown" as const,
+      sectionIds: [],
+    };
+    const calls = jiraMcp(
+      {
+        data: {
+          commentId: "101",
+          body: returnedBody,
+          appliedContentFormat: "markdown",
+          jsmCommentType: "publicComment",
+        },
+      },
+      {
+        data: {
+          startAt: 0,
+          maxResults: 1,
+          total: 1,
+          isLast: true,
+          appliedContentFormat: "markdown",
+          comments: [
+            {
+              id: "101",
+              author: { accountId: "account-7", displayName: "Test author" },
+              body: returnedBody,
+              created: evidence.createdAt,
+              updated: "2026-11-03T11:44:17.402+1000",
+              updateAuthor: { accountId: "account-7", displayName: "Test author" },
+              jsdPublic: true,
+            },
+          ],
+        },
+      },
+    );
+    const edit: (
+      t: Parameters<typeof postComment>[0],
+      text: string,
+      options: { commentId: string; evidence: typeof evidence },
+    ) => ReturnType<typeof postComment> = postComment;
+    const result = await edit(target, body, { commentId: "101", evidence });
+    expect(bodyOf(calls[2]!.init).params).toMatchObject({
+      name: "addOrEditJiraIssueComment",
+      arguments: {
+        cloudId: "https://acme.atlassian.net",
+        issueIdOrKey: "PROJ-12",
+        commentId: "101",
+        commentBody: body,
+      },
+    });
+    expect(result.url).toBe("https://acme.atlassian.net/browse/PROJ-12?focusedCommentId=101");
+    expect(result.evidence).toMatchObject({
+      id: "101",
+      authorId: "account-7",
+      createdAt: evidence.createdAt,
+      updatedAt: "2026-11-03T11:44:17.402+1000",
+      fingerprint: actionHash(returnedBody),
+      representation: "markdown",
+    });
+  });
+
+  it("edits by verified comment id through each existing transport", async () => {
+    const edit: (
+      target: Parameters<typeof postComment>[0],
+      body: string,
+      options: { commentId: string },
+    ) => ReturnType<typeof postComment> = postComment;
+    const body = stampMarker("###### bkit:generated\nupdated section 😀");
+    gh.resp(
+      "repos/o/r/issues/comments/101",
+      JSON.stringify({
+        id: 101,
+        body,
+        html_url: "https://github.com/o/r/issues/12#issuecomment-101",
+        user: { id: 7 },
+        created_at: "2026-11-01T01:01:00Z",
+        updated_at: "2026-11-01T01:02:00Z",
+      }),
+    );
+    const edited = await edit(trackerTarget(github(), { issue: "12" }), body, {
+      commentId: "101",
+    });
+    expect(gh.calls()).toEqual(["api repos/o/r/issues/comments/101 --method PATCH --input -"]);
+    expect(JSON.parse(gh.stdin(1))).toEqual({ body });
+    expect(edited.evidence).toMatchObject({ id: "101", fingerprint: actionHash(body) });
+
+    process.env.BKIT_LINEAR_API_KEY = "linear-test-key";
+    const calls = stubFetch(
+      json({
+        data: {
+          commentUpdate: {
+            success: true,
+            comment: {
+              id: "comment-101",
+              body,
+              url: "https://linear.app/issue/comment-101",
+              user: { id: "author-7" },
+              createdAt: "2026-11-01T01:01:00Z",
+              updatedAt: "2026-11-01T01:02:00Z",
+            },
+          },
+        },
+      }),
+    );
+    const linearEdited = await edit(trackerTarget(linear(), { issue: "ENG-12" }), body, {
+      commentId: "comment-101",
+    });
+    const request = bodyOf(calls[0]!.init);
+    expect(request.query).toContain("commentUpdate");
+    expect(request.query).not.toContain("commentCreate");
+    expect(request.variables).toEqual({ id: "comment-101", input: { body } });
+    expect(linearEdited.evidence).toMatchObject({
+      id: "comment-101",
+      fingerprint: actionHash(body),
+    });
+
+    process.env.BKIT_JIRA_API_KEY = "jira-test-key";
+    const unsupportedCalls = stubFetch();
+    await expect(
+      edit(trackerTarget(jira(), { issue: "PROJ-12" }), body, { commentId: "101" }),
+    ).rejects.toBeInstanceOf(TrackerError);
+    expect(unsupportedCalls).toHaveLength(0);
+  });
+
+  it("seals unavailable or unstable representation evidence", async () => {
+    const f = progressFixture();
+    const stable = {
+      id: "IC_101",
+      databaseId: 101,
+      body: f.body,
+      url: f.url,
+      author: { __typename: "Bot", id: "U_7", databaseId: 7 },
+      createdAt: "2026-11-01T01:01:00Z",
+      updatedAt: "2026-11-01T01:01:00Z",
+    };
+    const unavailable = [
+      { ...stable, createdAt: null },
+      { ...stable, updatedAt: null },
+      { ...stable, updatedAt: "not-a-timestamp" },
+      { ...stable, body: null },
+    ];
+    for (const node of unavailable) {
+      gh.resp(
+        "graphql",
+        JSON.stringify({
+          data: {
+            repository: {
+              issue: {
+                comments: {
+                  nodes: [node],
+                  pageInfo: { hasPreviousPage: false },
+                },
+              },
+            },
+          },
+        }),
+      );
+      const inspected = await recentComments(f.target, 1);
+      expect(inspected).toHaveLength(1);
+      expect(inspected[0]?.evidence).toBeUndefined();
+    }
+    expect(gh.calls().every((call) => !call.includes("--method PATCH"))).toBe(true);
+  });
+
+  it("uses accepted final preflight eligibility without provider atomicity", async () => {
+    const f = progressFixture();
+    const node = {
+      id: "IC_101",
+      databaseId: 101,
+      body: f.body,
+      url: f.url,
+      author: { __typename: "Bot", id: "U_7", databaseId: 7 },
+      createdAt: "2026-11-01T01:01:00Z",
+      updatedAt: "2026-11-01T01:01:00Z",
+    };
+    const page = (author: unknown) =>
+      JSON.stringify({
+        data: {
+          repository: {
+            issue: {
+              comments: {
+                nodes: [{ ...node, author }],
+                pageInfo: { hasPreviousPage: false },
+              },
+            },
+          },
+        },
+      });
+    gh.resp("graphql", page(node.author));
+    const inspected = await recentComments(f.target, 1);
+    expect(inspected[0]?.evidence).toMatchObject({
+      id: "101",
+      authorId: "7",
+      createdAt: node.createdAt,
+      updatedAt: node.updatedAt,
+      fingerprint: actionHash(f.body),
+      representation: "markdown",
+    });
+    gh.resp("graphql", page({ login: "engine" }));
+    const unknownOwner = await recentComments(f.target, 1);
+    expect(unknownOwner[0]?.evidence?.authorId).toBeNull();
+    expect(gh.calls().every((call) => !call.includes("--method PATCH"))).toBe(true);
+  });
+
   it("rejects marker preserving external edits", async () => {
     const f = progressFixture();
     const original = await recentComments(f.target, 1);
@@ -1367,7 +1727,12 @@ describe("postCommentOnce: re-runs compare the marker hash, never the rewritten
           issue: {
             title: "T",
             comments: {
-              nodes: [{ body: `###### bkit:generated ${h}\n\n* a\n* _b_`, createdAt: "x" }],
+              nodes: [
+                {
+                  body: `###### bkit:generated ${h}\n\n* a\n* _b_`,
+                  createdAt: "2026-11-01T00:00:00Z",
+                },
+              ],
               pageInfo: { hasNextPage: false, endCursor: null },
             },
           },
@@ -1385,28 +1750,17 @@ describe("postCommentOnce: re-runs compare the marker hash, never the rewritten
   it("jira: a split `_(part i/n)_` comment and an HTML page both dedup on the marker", async () => {
     process.env.BKIT_JIRA_API_KEY = "k";
     const t = trackerTarget(jira(), { fid: "proj-9-x" });
-    const calls = jiraMcp(
-      { key: "PROJ-9", fields: { summary: "S" } },
-      {
-        comments: [{ body: `###### bkit:generated ${h}\n_(part 1/2)_\n* a`, created: "x" }],
-        isLast: true,
-      },
-    );
+    const calls = jiraMcp({
+      comments: [{ body: `###### bkit:generated ${h}\n_(part 1/2)_\n* a`, created: "x" }],
+      isLast: true,
+    });
     expect(await postCommentOnce(t, body, { recent: 5, log })).toMatchObject({ deduped: true });
-    expect(calls).toHaveLength(4);
-    jiraMcp(
-      { key: "PROJ-9", fields: { summary: "S" } },
-      {
-        comments: [{ body: `<h6>bkit:generated ${h}</h6><ul><li>a</li></ul>`, created: "x" }],
-        appliedContentFormat: "html",
-        isLast: true,
-      },
-      {
-        comments: [{ body: `<h6>bkit:generated ${h}</h6><ul><li>a</li></ul>`, created: "x" }],
-        appliedContentFormat: "html",
-        isLast: true,
-      },
-    );
+    expect(calls).toHaveLength(3);
+    jiraMcp({
+      comments: [{ body: `<h6>bkit:generated ${h}</h6><ul><li>a</li></ul>`, created: "x" }],
+      appliedContentFormat: "html",
+      isLast: true,
+    });
     expect(await postCommentOnce(t, body, { recent: 5, log })).toMatchObject({ deduped: true });
   });
 
diff --git a/.bkit/core/engine/commands/workflow/tracker.ts b/.bkit/core/engine/commands/workflow/tracker.ts
index 0131ddfa5..e1d0e43bd 100644
--- a/.bkit/core/engine/commands/workflow/tracker.ts
+++ b/.bkit/core/engine/commands/workflow/tracker.ts
@@ -411,37 +411,52 @@ export function writeBodyFile(cwd: string, kind: "comment" | "pr-body", body: st
  * a split body opens with the body's first line when it is the generated marker,
  * then `_(part i/n)_`; a single line longer than a part is cut hard.
  */
-export function splitAt(body: string, limit: number): string[] {
+export function splitAt(
+  body: string,
+  limit: number,
+  opts: { verifiedBudget?: boolean } = {},
+): string[] {
+  if (opts.verifiedBudget === false) return [body];
   if (body.length <= limit) return [body];
   const lines = body.split("\n");
   const marker = lines[0]?.startsWith("###### ") ? lines.shift()! : null;
-  const headerRoom = (marker ? marker.length + 1 : 0) + "_(part 99/99)_\n".length;
-  const room = limit - headerRoom;
-  const chunks: string[] = [];
-  let cur = "";
-  const flush = () => {
-    if (cur !== "") chunks.push(cur);
-    cur = "";
-  };
-  for (const raw of lines) {
-    let line = raw;
-    while (line.length > room) {
-      flush();
-      const cut = room > 0 && /[\uD800-\uDBFF]/.test(line[room - 1] ?? "") ? room - 1 : room;
-      if (cut <= 0) throw new TrackerError("http-400", "comment limit cannot fit one code point");
-      chunks.push(line.slice(0, cut));
-      line = line.slice(cut);
+  let digits = 2;
+  for (;;) {
+    const widestPart = "9".repeat(digits);
+    const headerRoom =
+      (marker ? marker.length + 1 : 0) + `_(part ${widestPart}/${widestPart})_\n`.length;
+    const room = limit - headerRoom;
+    const chunks: string[] = [];
+    let cur = "";
+    const flush = () => {
+      if (cur !== "") chunks.push(cur);
+      cur = "";
+    };
+    for (const raw of lines) {
+      let line = raw;
+      while (line.length > room) {
+        flush();
+        const cut = room > 0 && /[\uD800-\uDBFF]/.test(line[room - 1] ?? "") ? room - 1 : room;
+        if (cut <= 0) throw new TrackerError("http-400", "comment limit cannot fit one code point");
+        chunks.push(line.slice(0, cut));
+        line = line.slice(cut);
+      }
+      const next = cur === "" ? line : `${cur}\n${line}`;
+      if (next.length > room) {
+        flush();
+        cur = line;
+      } else cur = next;
+    }
+    flush();
+    const requiredDigits = String(chunks.length).length;
+    if (requiredDigits > digits) {
+      digits = requiredDigits;
+      continue;
     }
-    const next = cur === "" ? line : `${cur}\n${line}`;
-    if (next.length > room) {
-      flush();
-      cur = line;
-    } else cur = next;
+    return chunks.map((c, i) =>
+      [...(marker ? [marker] : []), `_(part ${i + 1}/${chunks.length})_`, c].join("\n"),
+    );
   }
-  flush();
-  return chunks.map((c, i) =>
-    [...(marker ? [marker] : []), `_(part ${i + 1}/${chunks.length})_`, c].join("\n"),
-  );
 }
 
 export interface PostedComment {
@@ -464,20 +479,26 @@ export interface CommentEvidence {
 function commentEvidence(raw: Record<string, unknown>): CommentEvidence | undefined {
   const author = asRecord(raw.user ?? raw.author);
   const id = raw.databaseId ?? raw.id;
-  const authorId = author.databaseId ?? author.id;
-  const createdAt = raw.created_at ?? raw.createdAt;
-  const updatedAt = raw.updated_at ?? raw.updatedAt;
+  const authorId = author.databaseId ?? author.accountId ?? author.id;
+  const createdAt = raw.created_at ?? raw.createdAt ?? raw.created;
+  const updatedAt = raw.updated_at ?? raw.updatedAt ?? raw.updated;
   if (
     (typeof id !== "string" && typeof id !== "number") ||
+    String(id).trim() === "" ||
     typeof createdAt !== "string" ||
     typeof updatedAt !== "string" ||
+    !Number.isFinite(Date.parse(createdAt)) ||
+    !Number.isFinite(Date.parse(updatedAt)) ||
     typeof raw.body !== "string"
   )
     return undefined;
   return {
     id: String(id),
     authorId:
-      typeof authorId === "string" || typeof authorId === "number" ? String(authorId) : null,
+      (typeof authorId === "string" || typeof authorId === "number") &&
+      String(authorId).trim() !== ""
+        ? String(authorId)
+        : null,
     createdAt,
     updatedAt,
     fingerprint: actionHash(raw.body),
@@ -488,17 +509,23 @@ function commentEvidence(raw: Record<string, unknown>): CommentEvidence | undefi
   };
 }
 
-/** Post `body` as a new comment on the target issue. Throws `TrackerError` on failure. */
-export async function postComment(t: TrackerTarget, body: string): Promise<PostedComment> {
+/** Create a comment, or edit the supplied verified ID. Throws `TrackerError` on failure. */
+export async function postComment(
+  t: TrackerTarget,
+  body: string,
+  opts: { commentId?: string; evidence?: CommentEvidence } = {},
+): Promise<PostedComment> {
   if (t.issue === null) throw new TrackerError("not-found", "no issue");
   if (t.tracker === "github") {
     const out = gh(
       t,
       [
         "api",
-        `repos/${t.ownerRepo}/issues/${t.issue}/comments`,
+        opts.commentId
+          ? `repos/${t.ownerRepo}/issues/comments/${encodeURIComponent(opts.commentId)}`
+          : `repos/${t.ownerRepo}/issues/${t.issue}/comments`,
         "--method",
-        "POST",
+        opts.commentId ? "PATCH" : "POST",
         "--input",
         "-",
       ],
@@ -516,12 +543,16 @@ export async function postComment(t: TrackerTarget, body: string): Promise<Poste
   }
   if (t.tracker === "linear") {
     const data = await linearGql(
-      "mutation($input: CommentCreateInput!) { commentCreate(input: $input) { success comment { id body url createdAt updatedAt user { id } } } }",
-      { input: { issueId: t.issue, body } },
+      opts.commentId
+        ? "mutation($id: String!, $input: CommentUpdateInput!) { commentUpdate(id: $id, input: $input) { success comment { id body url createdAt updatedAt user { id } } } }"
+        : "mutation($input: CommentCreateInput!) { commentCreate(input: $input) { success comment { id body url createdAt updatedAt user { id } } } }",
+      opts.commentId
+        ? { id: opts.commentId, input: { body } }
+        : { input: { issueId: t.issue, body } },
     );
-    const created = asRecord(data.commentCreate);
+    const created = asRecord(opts.commentId ? data.commentUpdate : data.commentCreate);
     if (created.success !== true)
-      throw new TrackerError("http-400", "linear: commentCreate failed");
+      throw new TrackerError("http-400", "linear: comment mutation failed");
     const raw = asRecord(created.comment);
     const url = raw.url;
     const evidence = commentEvidence(raw);
@@ -532,23 +563,71 @@ export async function postComment(t: TrackerTarget, body: string): Promise<Poste
     };
   }
   if (t.tracker === "jira") {
+    if (
+      opts.commentId &&
+      (!opts.evidence ||
+        opts.evidence.id !== opts.commentId ||
+        !opts.evidence.authorId ||
+        opts.evidence.representation !== "markdown" ||
+        !/^[a-f0-9]{64}$/.test(opts.evidence.fingerprint) ||
+        !Number.isFinite(Date.parse(opts.evidence.createdAt)) ||
+        !Number.isFinite(Date.parse(opts.evidence.updatedAt)))
+    )
+      throw new TrackerError("unsupported", "jira: comment edit requires verified evidence");
     const site = jiraSite(t);
     const jira = JiraSession.open();
     const parts = splitAt(body, JIRA_COMMENT_LIMIT);
+    if (opts.commentId && parts.length !== 1)
+      throw new TrackerError("unsupported", "jira: split bodies require new comments");
     let id: unknown;
+    let observed = false;
+    let returnedBody: string | undefined;
     for (const part of parts) {
-      const res = await jira.call(JIRA_TOOLS.comment, {
-        cloudId: site,
-        issueIdOrKey: t.issue,
-        commentBody: part,
-      });
-      id = asRecord(res).id;
+      const res = asRecord(
+        await jira.call(JIRA_TOOLS.comment, {
+          cloudId: site,
+          issueIdOrKey: t.issue,
+          commentBody: part,
+          ...(opts.commentId
+            ? {
+                commentId: opts.commentId,
+                contentFormat: "markdown",
+                responseContentFormat: "markdown",
+              }
+            : {}),
+        }),
+      );
+      const raw = res.data === undefined ? res : asRecord(res.data);
+      id = raw.commentId ?? raw.id;
+      observed = typeof raw.commentId === "string";
+      returnedBody =
+        raw.appliedContentFormat === "markdown" && typeof raw.body === "string"
+          ? raw.body
+          : undefined;
     }
     const base = `${site}/browse/${t.issue}`;
-    return {
+    const posted = {
       url: id === undefined ? base : `${base}?focusedCommentId=${String(id)}`,
       parts: parts.length,
     };
+    if (observed && parts.length === 1) {
+      try {
+        const latest = await jiraComments(t, 1, jira);
+        const evidence = latest.find(
+          (comment) =>
+            comment.evidence !== undefined &&
+            comment.evidence.id === id &&
+            returnedBody !== undefined &&
+            comment.evidence.fingerprint === actionHash(returnedBody) &&
+            (!opts.evidence || comment.evidence.authorId === opts.evidence.authorId),
+        )?.evidence;
+        return { ...posted, ...(evidence ? { evidence } : {}) };
+      } catch {
+        // An acknowledged mutation stays successful when optional evidence is unavailable.
+        return posted;
+      }
+    }
+    return posted;
   }
   throw new TrackerError("not-found", "issue tracker none");
 }
@@ -558,7 +637,7 @@ export async function recentComments(
   t: TrackerTarget,
   n: number,
 ): Promise<Array<{ body: string; url: string | null; evidence?: CommentEvidence }>> {
-  if (t.issue === null) return [];
+  if (t.issue === null || !Number.isInteger(n) || n <= 0) return [];
   if (t.tracker === "github") {
     const [owner, name] = t.ownerRepo.split("/");
     const nodes: unknown[] = [];
@@ -626,11 +705,17 @@ export async function recentComments(
       cursors.add(cursor);
       after = cursor;
     }
-    return nodes
-      .map((raw) => asRecord(raw))
-      .sort((a, b) => str(a.createdAt).localeCompare(str(b.createdAt)))
+    const ordered = nodes.map((raw) => {
+      const comment = asRecord(raw);
+      const created = typeof comment.createdAt === "string" ? Date.parse(comment.createdAt) : NaN;
+      if (!Number.isFinite(created))
+        throw new TrackerError("http-200", "linear: comment creation ordering is incomplete");
+      return { comment, created };
+    });
+    return ordered
+      .sort((a, b) => a.created - b.created)
       .slice(-n)
-      .map((raw) => {
+      .map(({ comment: raw }) => {
         const evidence = commentEvidence(raw);
         return {
           body: str(raw.body),
@@ -639,8 +724,50 @@ export async function recentComments(
         };
       });
   }
-  const issue = await fetchIssue(t);
-  return issue.comments.slice(-n).map((c) => ({ body: c.body, url: null }));
+  if (t.tracker === "jira") return jiraComments(t, n, JiraSession.open());
+  return [];
+}
+
+async function jiraComments(
+  t: TrackerTarget,
+  n: number,
+  jira: JiraSession,
+): Promise<Array<{ body: string; url: string | null; evidence?: CommentEvidence }>> {
+  const site = jiraSite(t);
+  const comments: Array<{ body: string; url: string | null; evidence?: CommentEvidence }> = [];
+  for (let page = 0; page < 10; page++) {
+    const response = asRecord(
+      await jira.call(JIRA_TOOLS.comments, {
+        cloudId: site,
+        issueIdOrKey: t.issue,
+        startAt: comments.length,
+        maxResults: Math.min(n - comments.length, 100),
+        orderBy: "-created",
+        responseContentFormat: "markdown",
+        view: "evidence",
+      }),
+    );
+    const data = response.data === undefined ? response : asRecord(response.data);
+    if (!Array.isArray(data.comments))
+      throw new TrackerError("http-200", "jira: comment page returned no comments");
+    for (const item of data.comments) {
+      const raw = asRecord(item);
+      const candidate = data.appliedContentFormat === "markdown" ? commentEvidence(raw) : undefined;
+      const evidence = candidate?.authorId ? candidate : undefined;
+      comments.push({
+        body: textOf(raw.body),
+        url:
+          typeof raw.id === "string"
+            ? `${site}/browse/${t.issue}?focusedCommentId=${raw.id}`
+            : null,
+        ...(evidence ? { evidence } : {}),
+      });
+    }
+    if (data.isLast !== false || comments.length >= n) return comments.slice(0, n).reverse();
+    if (data.comments.length === 0)
+      throw new TrackerError("http-200", "jira: comment pagination is incomplete");
+  }
+  throw new TrackerError("http-200", "jira: comment pagination is incomplete");
 }
 
 export interface FetchedIssue {
diff --git a/README.md b/README.md
index 9b8bd9d1f..e524de325 100644
--- a/README.md
+++ b/README.md
@@ -354,19 +354,19 @@ config:
     useMaxWidth: false
 ---
 flowchart LR
-  %% Generated by bkit-graphify-rollup.py from a5e3d68d01b595bc6836c74d77227037c6a1093d — do not edit
+  %% Generated by bkit-graphify-rollup.py from 63ba6c36060e1e0f7a25d538e51dd031a0ac4598 — do not edit
   subgraph gn_bkit_core_engine[".bkit/core/engine"]
     n_bkit_core_engine_checks["checks<br/>248 symbols · 18 files"]
     n_bkit_core_engine_cli["cli<br/>33 symbols · 1 files"]
-    n_bkit_core_engine_commands["commands<br/>1652 symbols · 49 files"]
+    n_bkit_core_engine_commands["commands<br/>1660 symbols · 49 files"]
     n_bkit_core_engine_install["install<br/>280 symbols · 19 files"]
     n_bkit_core_engine_ledgers["ledgers<br/>183 symbols · 6 files"]
     n_bkit_core_engine_render["render<br/>62 symbols · 4 files"]
     n_bkit_core_engine_shared["shared<br/>149 symbols · 13 files<br/>1 open finding"]
   end
   nscripts_harvest["scripts/harvest<br/>199 symbols · 2 files"]
-  n_bkit_core_engine_commands -->|351| n_bkit_core_engine_ledgers
-  n_bkit_core_engine_commands -->|351| n_bkit_core_engine_shared
+  n_bkit_core_engine_commands -->|355| n_bkit_core_engine_ledgers
+  n_bkit_core_engine_commands -->|353| n_bkit_core_engine_shared
   n_bkit_core_engine_commands -->|198| n_bkit_core_engine_install
   n_bkit_core_engine_install -->|157| n_bkit_core_engine_shared
   n_bkit_core_engine_checks -->|131| n_bkit_core_engine_shared
diff --git a/dist/commands/workflow/tracker.js b/dist/commands/workflow/tracker.js
index 0df2ed194..fed974d2f 100644
--- a/dist/commands/workflow/tracker.js
+++ b/dist/commands/workflow/tracker.js
@@ -353,55 +353,72 @@ export function writeBodyFile(cwd, kind, body) {
  * a split body opens with the body's first line when it is the generated marker,
  * then `_(part i/n)_`; a single line longer than a part is cut hard.
  */
-export function splitAt(body, limit) {
+export function splitAt(body, limit, opts = {}) {
+    if (opts.verifiedBudget === false)
+        return [body];
     if (body.length <= limit)
         return [body];
     const lines = body.split("\n");
     const marker = lines[0]?.startsWith("###### ") ? lines.shift() : null;
-    const headerRoom = (marker ? marker.length + 1 : 0) + "_(part 99/99)_\n".length;
-    const room = limit - headerRoom;
-    const chunks = [];
-    let cur = "";
-    const flush = () => {
-        if (cur !== "")
-            chunks.push(cur);
-        cur = "";
-    };
-    for (const raw of lines) {
-        let line = raw;
-        while (line.length > room) {
-            flush();
-            const cut = room > 0 && /[\uD800-\uDBFF]/.test(line[room - 1] ?? "") ? room - 1 : room;
-            if (cut <= 0)
-                throw new TrackerError("http-400", "comment limit cannot fit one code point");
-            chunks.push(line.slice(0, cut));
-            line = line.slice(cut);
+    let digits = 2;
+    for (;;) {
+        const widestPart = "9".repeat(digits);
+        const headerRoom = (marker ? marker.length + 1 : 0) + `_(part ${widestPart}/${widestPart})_\n`.length;
+        const room = limit - headerRoom;
+        const chunks = [];
+        let cur = "";
+        const flush = () => {
+            if (cur !== "")
+                chunks.push(cur);
+            cur = "";
+        };
+        for (const raw of lines) {
+            let line = raw;
+            while (line.length > room) {
+                flush();
+                const cut = room > 0 && /[\uD800-\uDBFF]/.test(line[room - 1] ?? "") ? room - 1 : room;
+                if (cut <= 0)
+                    throw new TrackerError("http-400", "comment limit cannot fit one code point");
+                chunks.push(line.slice(0, cut));
+                line = line.slice(cut);
+            }
+            const next = cur === "" ? line : `${cur}\n${line}`;
+            if (next.length > room) {
+                flush();
+                cur = line;
+            }
+            else
+                cur = next;
         }
-        const next = cur === "" ? line : `${cur}\n${line}`;
-        if (next.length > room) {
-            flush();
-            cur = line;
+        flush();
+        const requiredDigits = String(chunks.length).length;
+        if (requiredDigits > digits) {
+            digits = requiredDigits;
+            continue;
         }
-        else
-            cur = next;
+        return chunks.map((c, i) => [...(marker ? [marker] : []), `_(part ${i + 1}/${chunks.length})_`, c].join("\n"));
     }
-    flush();
-    return chunks.map((c, i) => [...(marker ? [marker] : []), `_(part ${i + 1}/${chunks.length})_`, c].join("\n"));
 }
 function commentEvidence(raw) {
     const author = asRecord(raw.user ?? raw.author);
     const id = raw.databaseId ?? raw.id;
-    const authorId = author.databaseId ?? author.id;
-    const createdAt = raw.created_at ?? raw.createdAt;
-    const updatedAt = raw.updated_at ?? raw.updatedAt;
+    const authorId = author.databaseId ?? author.accountId ?? author.id;
+    const createdAt = raw.created_at ?? raw.createdAt ?? raw.created;
+    const updatedAt = raw.updated_at ?? raw.updatedAt ?? raw.updated;
     if ((typeof id !== "string" && typeof id !== "number") ||
+        String(id).trim() === "" ||
         typeof createdAt !== "string" ||
         typeof updatedAt !== "string" ||
+        !Number.isFinite(Date.parse(createdAt)) ||
+        !Number.isFinite(Date.parse(updatedAt)) ||
         typeof raw.body !== "string")
         return undefined;
     return {
         id: String(id),
-        authorId: typeof authorId === "string" || typeof authorId === "number" ? String(authorId) : null,
+        authorId: (typeof authorId === "string" || typeof authorId === "number") &&
+            String(authorId).trim() !== ""
+            ? String(authorId)
+            : null,
         createdAt,
         updatedAt,
         fingerprint: actionHash(raw.body),
@@ -411,16 +428,18 @@ function commentEvidence(raw) {
         ].map((match) => match[1]),
     };
 }
-/** Post `body` as a new comment on the target issue. Throws `TrackerError` on failure. */
-export async function postComment(t, body) {
+/** Create a comment, or edit the supplied verified ID. Throws `TrackerError` on failure. */
+export async function postComment(t, body, opts = {}) {
     if (t.issue === null)
         throw new TrackerError("not-found", "no issue");
     if (t.tracker === "github") {
         const out = gh(t, [
             "api",
-            `repos/${t.ownerRepo}/issues/${t.issue}/comments`,
+            opts.commentId
+                ? `repos/${t.ownerRepo}/issues/comments/${encodeURIComponent(opts.commentId)}`
+                : `repos/${t.ownerRepo}/issues/${t.issue}/comments`,
             "--method",
-            "POST",
+            opts.commentId ? "PATCH" : "POST",
             "--input",
             "-",
         ], JSON.stringify({ body }));
@@ -435,10 +454,14 @@ export async function postComment(t, body) {
         };
     }
     if (t.tracker === "linear") {
-        const data = await linearGql("mutation($input: CommentCreateInput!) { commentCreate(input: $input) { success comment { id body url createdAt updatedAt user { id } } } }", { input: { issueId: t.issue, body } });
-        const created = asRecord(data.commentCreate);
+        const data = await linearGql(opts.commentId
+            ? "mutation($id: String!, $input: CommentUpdateInput!) { commentUpdate(id: $id, input: $input) { success comment { id body url createdAt updatedAt user { id } } } }"
+            : "mutation($input: CommentCreateInput!) { commentCreate(input: $input) { success comment { id body url createdAt updatedAt user { id } } } }", opts.commentId
+            ? { id: opts.commentId, input: { body } }
+            : { input: { issueId: t.issue, body } });
+        const created = asRecord(opts.commentId ? data.commentUpdate : data.commentCreate);
         if (created.success !== true)
-            throw new TrackerError("http-400", "linear: commentCreate failed");
+            throw new TrackerError("http-400", "linear: comment mutation failed");
         const raw = asRecord(created.comment);
         const url = raw.url;
         const evidence = commentEvidence(raw);
@@ -449,29 +472,71 @@ export async function postComment(t, body) {
         };
     }
     if (t.tracker === "jira") {
+        if (opts.commentId &&
+            (!opts.evidence ||
+                opts.evidence.id !== opts.commentId ||
+                !opts.evidence.authorId ||
+                opts.evidence.representation !== "markdown" ||
+                !/^[a-f0-9]{64}$/.test(opts.evidence.fingerprint) ||
+                !Number.isFinite(Date.parse(opts.evidence.createdAt)) ||
+                !Number.isFinite(Date.parse(opts.evidence.updatedAt))))
+            throw new TrackerError("unsupported", "jira: comment edit requires verified evidence");
         const site = jiraSite(t);
         const jira = JiraSession.open();
         const parts = splitAt(body, JIRA_COMMENT_LIMIT);
+        if (opts.commentId && parts.length !== 1)
+            throw new TrackerError("unsupported", "jira: split bodies require new comments");
         let id;
+        let observed = false;
+        let returnedBody;
         for (const part of parts) {
-            const res = await jira.call(JIRA_TOOLS.comment, {
+            const res = asRecord(await jira.call(JIRA_TOOLS.comment, {
                 cloudId: site,
                 issueIdOrKey: t.issue,
                 commentBody: part,
-            });
-            id = asRecord(res).id;
+                ...(opts.commentId
+                    ? {
+                        commentId: opts.commentId,
+                        contentFormat: "markdown",
+                        responseContentFormat: "markdown",
+                    }
+                    : {}),
+            }));
+            const raw = res.data === undefined ? res : asRecord(res.data);
+            id = raw.commentId ?? raw.id;
+            observed = typeof raw.commentId === "string";
+            returnedBody =
+                raw.appliedContentFormat === "markdown" && typeof raw.body === "string"
+                    ? raw.body
+                    : undefined;
         }
         const base = `${site}/browse/${t.issue}`;
-        return {
+        const posted = {
             url: id === undefined ? base : `${base}?focusedCommentId=${String(id)}`,
             parts: parts.length,
         };
+        if (observed && parts.length === 1) {
+            try {
+                const latest = await jiraComments(t, 1, jira);
+                const evidence = latest.find((comment) => comment.evidence !== undefined &&
+                    comment.evidence.id === id &&
+                    returnedBody !== undefined &&
+                    comment.evidence.fingerprint === actionHash(returnedBody) &&
+                    (!opts.evidence || comment.evidence.authorId === opts.evidence.authorId))?.evidence;
+                return { ...posted, ...(evidence ? { evidence } : {}) };
+            }
+            catch {
+                // An acknowledged mutation stays successful when optional evidence is unavailable.
+                return posted;
+            }
+        }
+        return posted;
     }
     throw new TrackerError("not-found", "issue tracker none");
 }
 /** The issue's latest `n` comments (body + url), newest last. */
 export async function recentComments(t, n) {
-    if (t.issue === null)
+    if (t.issue === null || !Number.isInteger(n) || n <= 0)
         return [];
     if (t.tracker === "github") {
         const [owner, name] = t.ownerRepo.split("/");
@@ -535,11 +600,17 @@ export async function recentComments(t, n) {
             cursors.add(cursor);
             after = cursor;
         }
-        return nodes
-            .map((raw) => asRecord(raw))
-            .sort((a, b) => str(a.createdAt).localeCompare(str(b.createdAt)))
+        const ordered = nodes.map((raw) => {
+            const comment = asRecord(raw);
+            const created = typeof comment.createdAt === "string" ? Date.parse(comment.createdAt) : NaN;
+            if (!Number.isFinite(created))
+                throw new TrackerError("http-200", "linear: comment creation ordering is incomplete");
+            return { comment, created };
+        });
+        return ordered
+            .sort((a, b) => a.created - b.created)
             .slice(-n)
-            .map((raw) => {
+            .map(({ comment: raw }) => {
             const evidence = commentEvidence(raw);
             return {
                 body: str(raw.body),
@@ -548,8 +619,44 @@ export async function recentComments(t, n) {
             };
         });
     }
-    const issue = await fetchIssue(t);
-    return issue.comments.slice(-n).map((c) => ({ body: c.body, url: null }));
+    if (t.tracker === "jira")
+        return jiraComments(t, n, JiraSession.open());
+    return [];
+}
+async function jiraComments(t, n, jira) {
+    const site = jiraSite(t);
+    const comments = [];
+    for (let page = 0; page < 10; page++) {
+        const response = asRecord(await jira.call(JIRA_TOOLS.comments, {
+            cloudId: site,
+            issueIdOrKey: t.issue,
+            startAt: comments.length,
+            maxResults: Math.min(n - comments.length, 100),
+            orderBy: "-created",
+            responseContentFormat: "markdown",
+            view: "evidence",
+        }));
+        const data = response.data === undefined ? response : asRecord(response.data);
+        if (!Array.isArray(data.comments))
+            throw new TrackerError("http-200", "jira: comment page returned no comments");
+        for (const item of data.comments) {
+            const raw = asRecord(item);
+            const candidate = data.appliedContentFormat === "markdown" ? commentEvidence(raw) : undefined;
+            const evidence = candidate?.authorId ? candidate : undefined;
+            comments.push({
+                body: textOf(raw.body),
+                url: typeof raw.id === "string"
+                    ? `${site}/browse/${t.issue}?focusedCommentId=${raw.id}`
+                    : null,
+                ...(evidence ? { evidence } : {}),
+            });
+        }
+        if (data.isLast !== false || comments.length >= n)
+            return comments.slice(0, n).reverse();
+        if (data.comments.length === 0)
+            throw new TrackerError("http-200", "jira: comment pagination is incomplete");
+    }
+    throw new TrackerError("http-200", "jira: comment pagination is incomplete");
 }
 const str = (v) => (typeof v === "string" ? v : "");
 // ADF nodes whose children are inline text; every other node's children are blocks, one per line.
diff --git a/docs/capabilities.md b/docs/capabilities.md
index 30e0d867a..dc0345401 100644
--- a/docs/capabilities.md
+++ b/docs/capabilities.md
@@ -30,7 +30,7 @@
 > - `budgeted` = solid amber border + a faint amber box. Still drawn, because a declared bypass is still a bypass, but it is settled, not an open question.
 > - Which status is which: `split` fine dash · `bypassed` long dash · `dead` even dash · `gap` dotted · `budgeted` no dash.
 > - A fetched URL is a STRING, never an edge, because the reachability scan (§ Unreachable API calls) is the only check that sees it.
-> - Table rescanned every run, never stale. Diagrams from `graph.json` @ `a5e3d68d0`; when that differs from HEAD ⇒ run `pnpm graph:update` first.
+> - Table rescanned every run, never stale. Diagrams from `graph.json` @ `63ba6c360`; when that differs from HEAD ⇒ run `pnpm graph:update` first.
 > - Detail-level module graph → `pnpm graph`. This doc is the altitude above that: capabilities, not files.
 
 ## Status Vocabulary
@@ -159,19 +159,19 @@ config:
     useMaxWidth: false
 ---
 flowchart LR
-  %% Generated by bkit-graphify-rollup.py from a5e3d68d01b595bc6836c74d77227037c6a1093d — do not edit
+  %% Generated by bkit-graphify-rollup.py from 63ba6c36060e1e0f7a25d538e51dd031a0ac4598 — do not edit
   subgraph gn_bkit_core_engine[".bkit/core/engine"]
     n_bkit_core_engine_checks["checks<br/>248 symbols · 18 files"]
     n_bkit_core_engine_cli["cli<br/>33 symbols · 1 files"]
-    n_bkit_core_engine_commands["commands<br/>1652 symbols · 49 files"]
+    n_bkit_core_engine_commands["commands<br/>1660 symbols · 49 files"]
     n_bkit_core_engine_install["install<br/>280 symbols · 19 files"]
     n_bkit_core_engine_ledgers["ledgers<br/>183 symbols · 6 files"]
     n_bkit_core_engine_render["render<br/>62 symbols · 4 files"]
     n_bkit_core_engine_shared["shared<br/>149 symbols · 13 files<br/>1 open finding"]
   end
   nscripts_harvest["scripts/harvest<br/>199 symbols · 2 files"]
-  n_bkit_core_engine_commands -->|351| n_bkit_core_engine_ledgers
-  n_bkit_core_engine_commands -->|351| n_bkit_core_engine_shared
+  n_bkit_core_engine_commands -->|355| n_bkit_core_engine_ledgers
+  n_bkit_core_engine_commands -->|353| n_bkit_core_engine_shared
   n_bkit_core_engine_commands -->|198| n_bkit_core_engine_install
   n_bkit_core_engine_install -->|157| n_bkit_core_engine_shared
   n_bkit_core_engine_checks -->|131| n_bkit_core_engine_shared
@@ -248,7 +248,7 @@ config:
     useMaxWidth: false
 ---
 flowchart LR
-  %% Generated by bkit-graphify-rollup.py from a5e3d68d01b595bc6836c74d77227037c6a1093d — do not edit
+  %% Generated by bkit-graphify-rollup.py from 63ba6c36060e1e0f7a25d538e51dd031a0ac4598 — do not edit
   subgraph gncustom_health_checks["Health checks"]
     n_bkit_core_engine_checks_after_index[".bkit/core/engine/checks/after/index<br/>11 symbols · 1 files"]
     n_bkit_core_engine_checks_before_index[".bkit/core/engine/checks/before/index<br/>4 symbols · 1 files"]
@@ -330,7 +330,7 @@ flowchart LR
         n_bkit_core_engine_commands_workflow_tasks["tasks<br/>11 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_tests["tests<br/>108 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_tests_changed["tests-changed<br/>5 symbols · 1 files"]
-        n_bkit_core_engine_commands_workflow_tracker["tracker<br/>72 symbols · 1 files"]
+        n_bkit_core_engine_commands_workflow_tracker["tracker<br/>80 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_workflows["workflows<br/>86 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_worktrees["worktrees<br/>55 symbols · 1 files"]
       end
@@ -399,6 +399,7 @@ flowchart LR
   n_bkit_core_engine_commands_workflow_branches -->|18| n_bkit_core_engine_commands_workflow_status
   n_bkit_core_engine_commands_workflow_prs -->|18| n_bkit_core_engine_ledgers_status
   n_bkit_core_engine_commands_workflow_roadmap -->|18| n_bkit_core_engine_commands_lib
+  n_bkit_core_engine_commands_workflow_tracker -->|18| n_bkit_core_engine_ledgers_status
   n_bkit_core_engine_commands_workflow_branches -->|17| n_bkit_core_engine_commands_workflow_worktrees
   n_bkit_core_engine_commands_workflow_steps -->|17| n_bkit_core_engine_ledgers_status
   n_bkit_core_engine_ledgers_journal -->|17| n_bkit_core_engine_ledgers_telemetry
@@ -422,7 +423,6 @@ flowchart LR
   n_bkit_core_engine_commands_install_install -->|14| n_bkit_core_engine_render_models
   n_bkit_core_engine_commands_install_upgrade -->|14| n_bkit_core_engine_install_version_file
   n_bkit_core_engine_commands_workflow_branches -->|14| n_bkit_core_engine_commands_workflow_prs
-  n_bkit_core_engine_commands_workflow_tracker -->|14| n_bkit_core_engine_ledgers_status
   nscripts_harvest -->|14| n_bkit_core_engine_ledgers_telemetry
   n_bkit_core_engine_checks_after_index -->|13| n_bkit_core_engine_checks_after_github
   n_bkit_core_engine_commands_workflow_context -->|13| n_bkit_core_engine_commands_workflow_status
@@ -440,6 +440,8 @@ flowchart LR
   n_bkit_core_engine_commands_workflow_runs -->|12| n_bkit_core_engine_ledgers_status
   n_bkit_core_engine_commands_workflow_runs -->|12| n_bkit_core_engine_commands_workflow_status
   n_bkit_core_engine_commands_workflow_runtime -->|12| n_bkit_core_engine_commands_lib
+  n_bkit_core_engine_commands_workflow_tracker -->|12| n_bkit_core_engine_commands_lib
+  n_bkit_core_engine_commands_workflow_tracker -->|12| n_bkit_core_engine_shared_json
   n_bkit_core_engine_checks_after_index -->|11| n_bkit_core_engine_checks_after_tools
   n_bkit_core_engine_commands_analysis -->|11| n_bkit_core_engine_ledgers_telemetry
   n_bkit_core_engine_commands_install_uninstall -->|11| n_bkit_core_engine_shared_package_roots
@@ -447,7 +449,6 @@ flowchart LR
   n_bkit_core_engine_commands_workflow_branches -->|11| n_bkit_core_engine_commands_workflow_ledgers
   n_bkit_core_engine_commands_workflow_steps -->|11| n_bkit_core_engine_commands_workflow_ledgers
   n_bkit_core_engine_commands_workflow_tests -->|11| n_bkit_core_engine_commands_lib
-  n_bkit_core_engine_commands_workflow_tracker -->|11| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_install_modules_opencode -->|11| n_bkit_core_engine_render_models
   n_bkit_core_engine_install_modules_opencode -->|11| n_bkit_core_engine_shared_package_roots
   n_bkit_core_engine_shared_settings -->|11| n_bkit_core_engine_install_manifest
@@ -457,7 +458,6 @@ flowchart LR
   n_bkit_core_engine_commands_workflow_context -->|10| n_bkit_core_engine_commands_workflow_plan_blocks
   n_bkit_core_engine_commands_workflow_issues -->|10| n_bkit_core_engine_commands_workflow_status
   n_bkit_core_engine_commands_workflow_runs -->|10| n_bkit_core_engine_commands_workflow_fids
-  n_bkit_core_engine_commands_workflow_tracker -->|10| n_bkit_core_engine_shared_json
   n_bkit_core_engine_commands_workflow_workflows -->|10| n_bkit_core_engine_commands_workflow_branches
   n_bkit_core_engine_commands_workflow_workflows -->|10| n_bkit_core_engine_checks_status_holes
   n_bkit_core_engine_commands_workflow_workflows -->|10| n_bkit_core_engine_commands_land
@@ -557,6 +557,7 @@ flowchart LR
   n_bkit_core_engine_commands_workflow_issues -->|6| n_bkit_core_engine_shared_settings
   n_bkit_core_engine_commands_workflow_plans -->|6| n_bkit_core_engine_commands_workflow_tracker
   n_bkit_core_engine_commands_workflow_steps -->|6| n_bkit_core_engine_commands_workflow_tests
+  n_bkit_core_engine_commands_workflow_tracker -->|6| n_bkit_core_engine_commands_workflow_fids
   n_bkit_core_engine_commands_workflow_workflows -->|6| n_bkit_core_engine_commands_workflow_prs
   n_bkit_core_engine_commands_workflow_workflows -->|6| n_bkit_core_engine_commands_workflow_steps
   n_bkit_core_engine_commands_workflow_workflows -->|6| n_bkit_core_engine_commands_workflow_plans
@@ -739,8 +740,8 @@ flowchart LR
   linkStyle 68 stroke:#59636e,stroke-width:6px
   linkStyle 69 stroke:#59636e,stroke-width:6px
   linkStyle 70 stroke:#59636e,stroke-width:6px
-  linkStyle 71 stroke:#59636eb3,stroke-width:3px
-  linkStyle 72 stroke:#59636eb3,stroke-width:3px
+  linkStyle 71 stroke:#59636e,stroke-width:6px
+  linkStyle 72 stroke:#59636e,stroke-width:6px
   linkStyle 73 stroke:#59636eb3,stroke-width:3px
   linkStyle 74 stroke:#59636eb3,stroke-width:3px
   linkStyle 75 stroke:#59636eb3,stroke-width:3px
@@ -799,45 +800,45 @@ flowchart LR
   linkStyle 128 stroke:#59636eb3,stroke-width:3px
   linkStyle 129 stroke:#59636eb3,stroke-width:3px
   linkStyle 130 stroke:#59636eb3,stroke-width:3px
-  linkStyle 131 stroke:#59636e80,stroke-width:2px
-  linkStyle 132 stroke:#59636e80,stroke-width:2px
-  linkStyle 133 stroke:#59636e80,stroke-width:2px
-  linkStyle 134 stroke:#59636e80,stroke-width:2px
-  linkStyle 135 stroke:#59636e80,stroke-width:2px
-  linkStyle 136 stroke:#59636e80,stroke-width:2px
-  linkStyle 137 stroke:#59636e80,stroke-width:2px
-  linkStyle 138 stroke:#59636e80,stroke-width:2px
-  linkStyle 139 stroke:#59636e80,stroke-width:2px
-  linkStyle 140 stroke:#59636e80,stroke-width:2px
-  linkStyle 141 stroke:#59636e80,stroke-width:2px
-  linkStyle 142 stroke:#59636e80,stroke-width:2px
-  linkStyle 143 stroke:#59636e80,stroke-width:2px
-  linkStyle 144 stroke:#59636e80,stroke-width:2px
-  linkStyle 145 stroke:#59636e80,stroke-width:2px
-  linkStyle 146 stroke:#59636e80,stroke-width:2px
-  linkStyle 147 stroke:#59636e80,stroke-width:2px
-  linkStyle 148 stroke:#59636e80,stroke-width:2px
-  linkStyle 149 stroke:#59636e80,stroke-width:2px
-  linkStyle 150 stroke:#59636e80,stroke-width:2px
-  linkStyle 151 stroke:#59636e80,stroke-width:2px
-  linkStyle 152 stroke:#59636e80,stroke-width:2px
-  linkStyle 153 stroke:#59636e80,stroke-width:2px
-  linkStyle 154 stroke:#59636e80,stroke-width:2px
-  linkStyle 155 stroke:#59636e80,stroke-width:2px
-  linkStyle 156 stroke:#59636e80,stroke-width:2px
-  linkStyle 157 stroke:#59636e80,stroke-width:2px
-  linkStyle 158 stroke:#59636e80,stroke-width:2px
-  linkStyle 159 stroke:#59636e80,stroke-width:2px
-  linkStyle 160 stroke:#59636e80,stroke-width:2px
-  linkStyle 161 stroke:#59636e80,stroke-width:2px
-  linkStyle 162 stroke:#59636e80,stroke-width:2px
-  linkStyle 163 stroke:#59636e80,stroke-width:2px
-  linkStyle 164 stroke:#59636e80,stroke-width:2px
-  linkStyle 165 stroke:#59636e80,stroke-width:2px
-  linkStyle 166 stroke:#59636e80,stroke-width:2px
-  linkStyle 167 stroke:#59636e80,stroke-width:2px
-  linkStyle 168 stroke:#59636e80,stroke-width:2px
-  linkStyle 169 stroke:#59636e80,stroke-width:2px
+  linkStyle 131 stroke:#59636eb3,stroke-width:3px
+  linkStyle 132 stroke:#59636eb3,stroke-width:3px
+  linkStyle 133 stroke:#59636eb3,stroke-width:3px
+  linkStyle 134 stroke:#59636eb3,stroke-width:3px
+  linkStyle 135 stroke:#59636eb3,stroke-width:3px
+  linkStyle 136 stroke:#59636eb3,stroke-width:3px
+  linkStyle 137 stroke:#59636eb3,stroke-width:3px
+  linkStyle 138 stroke:#59636eb3,stroke-width:3px
+  linkStyle 139 stroke:#59636eb3,stroke-width:3px
+  linkStyle 140 stroke:#59636eb3,stroke-width:3px
+  linkStyle 141 stroke:#59636eb3,stroke-width:3px
+  linkStyle 142 stroke:#59636eb3,stroke-width:3px
+  linkStyle 143 stroke:#59636eb3,stroke-width:3px
+  linkStyle 144 stroke:#59636eb3,stroke-width:3px
+  linkStyle 145 stroke:#59636eb3,stroke-width:3px
+  linkStyle 146 stroke:#59636eb3,stroke-width:3px
+  linkStyle 147 stroke:#59636eb3,stroke-width:3px
+  linkStyle 148 stroke:#59636eb3,stroke-width:3px
+  linkStyle 149 stroke:#59636eb3,stroke-width:3px
+  linkStyle 150 stroke:#59636eb3,stroke-width:3px
+  linkStyle 151 stroke:#59636eb3,stroke-width:3px
+  linkStyle 152 stroke:#59636eb3,stroke-width:3px
+  linkStyle 153 stroke:#59636eb3,stroke-width:3px
+  linkStyle 154 stroke:#59636eb3,stroke-width:3px
+  linkStyle 155 stroke:#59636eb3,stroke-width:3px
+  linkStyle 156 stroke:#59636eb3,stroke-width:3px
+  linkStyle 157 stroke:#59636eb3,stroke-width:3px
+  linkStyle 158 stroke:#59636eb3,stroke-width:3px
+  linkStyle 159 stroke:#59636eb3,stroke-width:3px
+  linkStyle 160 stroke:#59636eb3,stroke-width:3px
+  linkStyle 161 stroke:#59636eb3,stroke-width:3px
+  linkStyle 162 stroke:#59636eb3,stroke-width:3px
+  linkStyle 163 stroke:#59636eb3,stroke-width:3px
+  linkStyle 164 stroke:#59636eb3,stroke-width:3px
+  linkStyle 165 stroke:#59636eb3,stroke-width:3px
+  linkStyle 166 stroke:#59636eb3,stroke-width:3px
+  linkStyle 167 stroke:#59636eb3,stroke-width:3px
+  linkStyle 168 stroke:#59636eb3,stroke-width:3px
+  linkStyle 169 stroke:#59636eb3,stroke-width:3px
   linkStyle 170 stroke:#59636e80,stroke-width:2px
   linkStyle 171 stroke:#59636e80,stroke-width:2px
   linkStyle 172 stroke:#59636e80,stroke-width:2px
@@ -864,4 +865,5 @@ flowchart LR
   linkStyle 193 stroke:#59636e80,stroke-width:2px
   linkStyle 194 stroke:#59636e80,stroke-width:2px
   linkStyle 195 stroke:#59636e80,stroke-width:2px
+  linkStyle 196 stroke:#59636e80,stroke-width:2px
 ```
diff --git a/docs/failures.jsonl b/docs/failures.jsonl
index eed79155d..b9c516d43 100644
--- a/docs/failures.jsonl
+++ b/docs/failures.jsonl
@@ -146,3 +146,4 @@
 {"schema":3,"ts":1793662725520,"firstTs":1793662725520,"updates":1,"kind":"failure","key":"test-timeout-a9b674d15883354c","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-abort-handover"},"category":"testing","severity":"MEDIUM","summary":".bkit/core/engine/shared/bkit-latest.test.ts > lookupLatestPublished > is null when pnpm fails or prints something that is not a version timed out under the pre-push gate","description":"Re-observed while publishing the 826-append-routine-workflow aborted-build handover: .bkit/core/engine/shared/bkit-latest.test.ts > lookupLatestPublished > is null when pnpm fails or prints something that is not a version timed out at 5000ms. The pre-push unit tier had 6976 passes, 3 timeout failures and 2 skips, and refused the record push. These cases passed in preceding related or named checks; current contention/root cause is not independently proven. Evidence: tmp/pre-push.log. No retry or timeout weakening was performed.","status":"OPEN"}
 {"schema":3,"ts":1793662725521,"firstTs":1792642025299,"updates":4,"kind":"failure","key":"runs-wait-cli-found-flaky-under-full-gate","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-abort-handover"},"category":"testing","severity":"LOW","summary":"runs.test.ts \"CLI: found exits 0; --once not found exits 81\" failed once under the full static-unit gate, passed on rerun","description":"Re-observed 2026-10-26 in the plan workflow for 701-engine-work-build, Step 7's `bkit branches push --mode=feature` pre-push gate: 'Test timed out in 5000ms' at `.bkit/core/engine/commands/workflow/runs.test.ts:1228`. The gate ran again and passed; the push landed. Same machine and time window as the other runs.test.ts flake recorded here (a concurrent session's vitest run in `.worktrees/700-session-start-nudge`).\n\nRe-observed while publishing the 826-append-routine-workflow aborted-build handover: .bkit/core/engine/commands/workflow/runs.test.ts > bkit runs wait > CLI: found exits 0; --once not found exits 81 (end the turn, call again) timed out at 5000ms. The pre-push unit tier had 6976 passes, 3 timeout failures and 2 skips, and refused the record push. These cases passed in preceding related or named checks; current contention/root cause is not independently proven. Evidence: tmp/pre-push.log. No retry or timeout weakening was performed.","rootCause":"full-gate load exceeds a test budget that the load factor does not raise: loadFactor (vitest.timeout-budget.ts) is loadAverage / cores floored at 1, so a loaded 10-core machine keeps the idle budget","status":"TRIAGED"}
 {"schema":3,"ts":1793662725522,"firstTs":1793662725522,"updates":1,"kind":"failure","key":"test-timeout-06d2e77b1cb732ed","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-abort-handover"},"category":"testing","severity":"MEDIUM","summary":".bkit/core/engine/commands/workflow/runs.test.ts > bkit runs revalidate > exits 1 when the PR head cannot be read, 80 when gh needs auth timed out under the pre-push gate","description":"Re-observed while publishing the 826-append-routine-workflow aborted-build handover: .bkit/core/engine/commands/workflow/runs.test.ts > bkit runs revalidate > exits 1 when the PR head cannot be read, 80 when gh needs auth timed out at 5000ms. The pre-push unit tier had 6976 passes, 3 timeout failures and 2 skips, and refused the record push. These cases passed in preceding related or named checks; current contention/root cause is not independently proven. Evidence: tmp/pre-push.log. No retry or timeout weakening was performed.","status":"OPEN"}
+{"schema":3,"ts":1793672039969,"firstTs":1793662207897,"updates":2,"kind":"failure","key":"test-timeout-6ecf352330ade053","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-gaps-remediate","subagent":"bkit-build-plan-gaps-remediate","model":"gpt-6.1-sol"},"category":"testing","severity":"MEDIUM","summary":".bkit/core/engine/commands/workflow/runs.test.ts > bkit runs context > prints ref (#N on GitHub) and the labels the engine reads; a failed read is null timed out under the changed-file gate","description":"The Group 1 gap-remediation changed gate ended with this single 5000ms timeout. Related tests passed 2364 cases; named tests passed 3589 cases with this one timeout. Five Bats tests, lint, formatting and both TypeScript projects passed. Evidence: tmp/826-group1-gap-changed.log. No retry was performed; the owner's explicit instruction to ignore timeouts makes this nonblocking for this build.","status":"OPEN"}
diff --git a/docs/knowledge.jsonl b/docs/knowledge.jsonl
index 92acda321..cba839b06 100644
--- a/docs/knowledge.jsonl
+++ b/docs/knowledge.jsonl
@@ -134,3 +134,6 @@
 {"schema":3,"ts":1793523381122,"firstTs":1793100920719,"updates":2,"kind":"knowledge","key":"prettier-write-after-a-red-breaks-the-test-first-audit","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"utility","step":"manual"},"references":[".bkit/core/engine/commands/workflow/tests.ts",".bkit/core/prompts/bkit-build-plan-verify.md","#796"],"summary":"Format a test file before recording its red; a later `prettier --write` moves a line and the green audit then reports `test-changed` with `changed: yes`","description":"- **Category:** tooling\n- **Symptom:** `bkit tests green` reports one `test-changed` gap per planned test in a file whose reds were all recorded, with `Changed since red` = `yes` and a diff that removes a single line (a wrapped `expect(…)` joined into one line) and adds the task's new tests.\n- **Root cause:** `onlyAddsLines` walks the red snapshot's whitespace-stripped, non-blank lines as a subsequence of the current file, so a prettier pass that joins a wrapped call, or splits a long one, removes a line the snapshot holds and turns the row from `added lines only` into `yes`. `bkit tests red` cannot re-record the red once the named test passes.\n- **Fix or rule:** run `prettier --write` on the test file before recording its reds, and after every later test edit check the row with `bkit tests green`: an additions-only diff keeps the row at `added lines only`, whose prompt rule clears added lines outside every planned test.\n- **Type:** gotcha\n- **Confidence:** high\n- **Severity:** medium\n- **Scope:** bkit-repo\n- **Source:** agent","rootCause":"Red evidence pins the snapshot's line sequence; the formatter is the usual second writer of a test file after its red, and the red cannot be re-recorded once the test passes.","remediation":"Superseded by `steps-finish-refuses-a-code-step-whose-planned-test-file-changed` (#796): the tests step formats the file before the red; a `prettier --write` in the code step is refused by `steps finish`, not reported at green.","status":"SUPERSEDED"}
 {"schema":3,"ts":1793524772549,"firstTs":1793524772549,"updates":1,"kind":"knowledge","key":"escaped-backticks-inside-a-code-span-are-retokenised-by-prettier","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"utility","step":"manual"},"references":["#796",".bkit/core/prompts/bkit-build-plan-tests.md",".bkit/core/engine/audits/workflows/prompt-notation.test.ts"],"summary":"A markdown code span that escapes inner backticks (`` `PASSES — TASK {N}: \\`{file}\\`` `` style) is re-tokenised by `prettier --write`: the spaces around the words after it vanish, the line no longer matches its `.bkit/instructions.md` entry and `instructions-coverage.test.ts` fails","description":"- **Category:** tooling\n- **Symptom:** after the format gate a prompt line reads `...{why}`with Bash`echo >>`` and the coverage test reports both `no entry` and `local entry no longer in the file` for it.\n- **Cause:** prettier parses the escaped backticks as span boundaries and rewrites the line; the instructions store still holds the pre-format text.","remediation":"Write a code span that must show backticks as a double-backtick span: ``PASSES — TASK {N}: `{file}` `{name}`: {reason}``. Prettier leaves it alone and `prompt-notation.test.ts` reads it as one span.","status":"ACTIVE"}
 {"schema":3,"ts":1793623927140,"firstTs":1793623927140,"updates":1,"kind":"knowledge","key":"status-ci-evidence-identity-needs-generation-with-second-resolution-timestamps","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-tasks","subagent":"bkit-build-plan-tasks","model":"gpt-6.1-sol"},"references":[".bkit/core/engine/ledgers/status.ts",".bkit/core/engine/commands/workflow/status.test.ts"],"summary":"Include evidence identity and generation in status event deduplication when selections can change within one second.","description":"Status timestamps have second resolution. Multiple atomic selection writes or distinct generation-specific step outcomes can share a timestamp, so the generic timestamp tuple would discard a later selection or DONE result as a duplicate.","rootCause":"The fold deduplicates before applying append order; a timestamp alone does not distinguish new evidence at the same instant.","remediation":"Keep selection and generation in workflow-meta identity, and generation and outcome in CI step identity. Preserve the existing identity for ordinary step rows. The atomic selection and current-generation fix tests cover these collisions.","status":"ACTIVE"}
+{"schema":3,"ts":1793670586017,"firstTs":1793670586017,"updates":1,"kind":"knowledge","key":"jira-rovo-comment-evidence-needs-data-envelope-and-evidence-view","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-tasks","subagent":"bkit-build-plan-tasks","model":"gpt-6.1-sol"},"references":[".bkit/core/engine/commands/workflow/tracker.ts","docs/plans/202611/logs/826-append-routine-workflow/build-provider-contracts.md"],"summary":"Read Rovo comment mutation and inspection data envelopes, and use evidence view for stable author identity.","description":"A successful Rovo mutation can return commentId and a normalized body without author or revision timestamps. Compact inspection may expose a display name without a stable accountId.","rootCause":"Mutation acknowledgement and edit-eligibility evidence have different shapes; legacy flat id fixtures do not establish the deployed envelope or ownership contract.","remediation":"Use the observed data envelope and bounded evidence-view inspection. Preserve acknowledged success if postflight evidence fails, and retain append evidence only when the stable author and returned fingerprint remain conclusive. See the provider contract report for verified schemas.","status":"ACTIVE"}
+{"schema":3,"ts":1793672019120,"firstTs":1793672019120,"updates":1,"kind":"knowledge","key":"comment-split-header-part-count-digits","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-gaps-remediate","subagent":"bkit-build-plan-gaps-remediate","model":"gpt-6.1-sol"},"summary":"Continuation header budgets must grow with the total part count","rootCause":"A fixed two-digit part-label reservation undercounts fully rendered headers after splitting produces at least 100 parts.","remediation":"Recompute chunk capacity when the actual total-part digit width exceeds the reserved width, then render only after it stabilizes. Assert every rendered part against the budget across digit boundaries.","status":"ACTIVE"}
+{"schema":3,"ts":1793672019121,"firstTs":1793672019121,"updates":1,"kind":"knowledge","key":"linear-comments-validate-order-before-slicing","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-gaps-remediate","subagent":"bkit-build-plan-gaps-remediate","model":"gpt-6.1-sol"},"summary":"Validate all Linear creation-order candidates before selecting recent comments","rootCause":"Sorting timestamp strings and taking the tail can discard undated candidates and misorder valid timestamps with different timezone offsets.","remediation":"Require parseable creation timestamps for every fetched candidate before slicing, and sort parsed instants numerically. Inconclusive creation ordering cannot authorize an edit.","status":"ACTIVE"}
