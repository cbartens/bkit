Verdict: FAIL

<!-- verdict:end -->

# Design Spike

## Claims

Ordered by blast radius. Claims 1-3 touch every close; 4-9 touch recovery; 10-11 touch only `--stage=push`.

<!-- prettier-ignore -->
| # | Claim a probe could disprove | Design elements resting on it | Result |
| --- | --- | --- | --- |
| 1 | The automatic move refuses every unsafe case and keeps edits: a non-forced `fetch . <target>:refs/heads/dev` refuses a `dev` checked out in a linked worktree, a non-fast-forward and a backwards move; `merge --ff-only` on the main checkout refuses when an edit or untracked file would be overwritten, and keeps unrelated edits and staged changes. | `syncLocalDev` step 4; Decisions row "Keep the non-forced `fetch . <target>:refs/heads/dev` and `merge --ff-only` as the move"; SC1, SC3; edge cases "Two parallel closes", "`dev` checked out in a linked worktree", "Main checkout on `dev` with an edit". | SETTLED |
| 2 | The `blocked` reasons `occupied` and `edited-files` can be read from git's stderr text, whatever the user's locale. | `syncLocalDev` step 4 "classify stderr into `occupied` / `edited-files` / `git-refused`"; `LocalDevReason`; the `line` wording per reason. | DISPROVEN |
| 3 | The cheap tier's `git cherry origin/dev dev` count of `-` lines is the number of local-only commits already on GitHub as copies. | `LocalDevSync.copies`; the line "K of the N are already on GitHub as copies"; Decisions row "Line adds the `git cherry` count". | DISPROVEN |
| 4 | The full tier's two proofs (patch-id via `git cherry`, then "every touched path's blob equals `origin/dev`", generalised from `notOnDev`) never mark a merge commit, a commit that was empty from the start, or an unpublished deletion as already on GitHub. | `DevCommitProof.class`; full-tier classifier; SC4; which commits `--stage=prepare` leaves out of the replay. | DISPROVEN |
| 5 | `replayBuild`'s cherry-pick replays every unpublished local-only commit kind found on local `dev`, including a merge commit from `git pull`. | `dev-reconcile --stage=prepare` ("cherry-pick oldest first"); `replayBuild` drop-empty mode. | DISPROVEN |
| 6 | A drop-empty replay with `git cherry-pick --allow-empty --empty=drop` drops commits that become empty, keeps going on commits that were empty from the start, and each drop is visible because `HEAD` does not move. | `replayBuild` drop-empty mode; `ReconcilePrepared.droppedEmpty`; `empty-on-replay` class; Risks option A on the Q6 departure. | SETTLED |
| 7 | `cherry-pick --empty=drop` works on every git version the engine already assumes (`land.ts:102`: git >= 2.31). | `replayBuild` drop-empty mode as built on `--empty`. | DISPROVEN |
| 8 | `update-ref <ref> <new> <old>` is a compare-and-swap, `update-ref <ref> <v> ""` is create-only, and `update-ref` moves a branch checked out in a linked worktree without refusing. | Backup branch `dev-backup/{timestamp}` (create-only); `--stage=adopt` compare-and-swap; Decisions row rejecting `update-ref` for automatic sync and requiring an explicit "checked out nowhere" check. | SETTLED |
| 9 | The batched full tier (one `diff-tree -r --stdin`, one `cat-file --batch-check`, plus `git cherry`) classifies 200 local-only commits x 50 files within an interactive budget, taken here as under 5 s wall time (the design names no number). | Decisions row "Full-tier classification batched, with a named commit limit"; `DevStatus.partial`. | SETTLED |
| 10 | git's push report lets `--stage=push` tell a stale push (re-prepare) from a receive-side refusal, in any locale. | `--stage=push` `stale` route; the review's proposed `refused` outcome. | SETTLED |
| 11 | GitHub's refusal of a push to a protected `dev` (branch protection or ruleset) reaches the client as a `[remote rejected]` status, not `[rejected]`. | `--stage=push` `refused` vs `stale` routing on real GitHub. | BLOCKED |

## Method

All probes are POSIX `sh` scripts in `docs/plans/202611/logs/849-keep-local-dev/spike/`. Each builds its own scratch repos under `spike/_work/` (deleted after the runs), runs with `GIT_CONFIG_GLOBAL=/dev/null GIT_CONFIG_NOSYSTEM=1` so no user config leaks in, and writes its full output to the matching `spike/cN.out`. Host: Apple M5, macOS (Darwin 25.6.0), Homebrew git 2.56.0, run from the worktree root `/Users/christian/Documents/GitHub/bkit/.worktrees/849-keep-local-dev`. No bkit source was touched or imported.

- **Claim 1** — `spike/c1-automatic-move.sh`: bare `origin`, main checkout, second clone advancing `origin/dev`. Cases A (linked worktree on `dev`), B / B1 (diverged, with and without `-q`), B2 (backwards target), C (behind only), D (edit on a changed path), E (edit on an unchanged path plus a staged new file), F (untracked file where the update adds one). Command: `sh c1-automatic-move.sh > c1.out 2>&1`.
- **Claim 2** — `spike/c6-locale-reasons.sh`: the occupied fetch and the edited-file `merge --ff-only` run under `LC_ALL=de_DE.UTF-8` and `LC_ALL=C`; each stderr is matched against the English phrases `checked out at` / `would be overwritten`; then the git-state alternative (`worktree list --porcelain`, overlap of `git diff --name-only HEAD` with `git diff --name-only HEAD <target>`) under the German locale. Command: `sh c6-locale-reasons.sh > c6.out 2>&1`.
- **Claims 3 and 4** — `spike/c3-classifier.sh`: the review's PoC fixture. Local `dev` holds L1 (copied upstream by cherry-pick), L2 + L3 (squashed upstream, L3's file later edited upstream), L4 (empty, like `retriggerCommit`), L5 (deletion also made upstream), L6 (deletion not made upstream), L7 (squashed upstream then reverted), a `git pull --no-rebase` merge, then L8 (new). Upstream also holds an empty re-trigger commit. Runs the cheap tier, `git cherry` on the pre-merge tip L7, `diff-tree` on the merge with and without `-m`, and a scripted full tier in two variants: touched paths with `--diff-filter=d` (as `notOnDev` does today) and all touched paths. Command: `sh c3-classifier.sh > c3.out 2>&1`.
- **Claims 5 and 6** — `spike/c4-replay-drop-empty.sh`: base with an upstream change U; local X1 (same change as U), X2 (empty from the start), X3 (real change), X4 (`merge --no-ff` of a side branch). Each case resets to a detached `HEAD` at U and runs one cherry-pick form, then reports whether `HEAD` moved and how many files each new commit touches. Case 8 is the no-`--empty` fallback: `--allow-empty`, check `CHERRY_PICK_HEAD`, `git cherry-pick --skip`. Command: `sh c4-replay-drop-empty.sh > c4.out 2>&1`.
- **Claim 7** — `spike/c5-min-git-version.sh` runs the claim-6 probe unchanged inside the official-tag images `alpine/git:v2.43.4` and `alpine/git:v2.45.1` (`docker run --rm -v "$S:/spike" --entrypoint sh alpine/git:<tag> /spike/c4-replay-drop-empty.sh`), cases 1-3 and 8. Images removed afterwards with `docker rmi`. Release-note text fetched with `curl -fsSL https://raw.githubusercontent.com/git/git/master/Documentation/RelNotes/2.45.0.adoc | grep -n -B1 -A3 'cherry-pick(1) to automatically'`. Command: `sh c5-min-git-version.sh > c5.out 2>&1`.
- **Claim 8** — `spike/c2-update-ref.sh`: CAS with a correct and a stale old value, create-only twice on one backup name, CAS while `dev` is checked out in a linked worktree, then `worktree list --porcelain`. The `run` helper prints `""` arguments as nothing, so the create-only lines show a trailing space where `""` was passed. Command: `sh c2-update-ref.sh > c2.out 2>&1`.
- **Claim 9** — `spike/c7-full-tier-cost.sh [commits] [files]`: `git fast-import` builds a 1000-file tree and N local-only commits touching 50 files each; `origin/dev` is a squash of the first half. Times the cheap tier (`rev-list --left-right --count`, `git cherry`) and the batched full tier (`rev-list | diff-tree -r --stdin --name-only`, one `cat-file --batch-check` over every `commit:path` and `origin/dev:path`, awk comparison) with `perl Time::HiRes`. Command: `for n in 200 1000; do sh c7-full-tier-cost.sh $n 50; done > c7.out 2>&1`.
- **Claim 10** — `spike/c8-push-refusal.sh`: bare `origin` with a real `pre-receive` hook that declines while a marker file exists. `git push --porcelain origin <sha>:refs/heads/dev` for: hook refusal (C and German locale), stale push without fetching the moved tip (C and German), stale push after fetching it. Command: `sh c8-push-refusal.sh > c8.out 2>&1`. The final case was appended to the script with a shell heredoc rather than the edit tool.
- **Claim 11** — not run. See Unsettled.

## Evidence

Quoted from the `spike/cN.out` files. `[...]` marks lines left out here; the `.out` file holds them.

**Claim 1** (`c1.out`, script exit 0):

```text
target=6f7a7952d1a7e09ade24a87f546a4eaa1aa47f9b old-dev=2db629f678605d442d89efc223369562ce70e9f2
== A: dev checked out in a linked worktree, main checkout on feat ==
$ git fetch -q . 6f7a7952d1a7e09ade24a87f546a4eaa1aa47f9b:refs/heads/dev
fatal: refusing to fetch into branch 'refs/heads/dev' checked out at '/Users/christian/Documents/GitHub/bkit/.worktrees/849-keep-local-dev/docs/plans/202611/logs/849-keep-local-dev/spike/_work/c1/wt'
[exit 128]
dev after: 2db629f678605d442d89efc223369562ce70e9f2 (unchanged: yes)
== B: dev diverged (local commit), not checked out ==
$ git fetch -q . 6f7a7952d1a7e09ade24a87f546a4eaa1aa47f9b:refs/heads/dev
[exit 1]
dev after: 055bf287d2563339bbce4a8169629f5f12710d9b (unchanged: yes)
== B1: same as B without -q ==
$ git fetch . 6f7a7952d1a7e09ade24a87f546a4eaa1aa47f9b:refs/heads/dev
From .
 ! [rejected] 6f7a7952d1a7e09ade24a87f546a4eaa1aa47f9b -> dev  (non-fast-forward)
[exit 1]
== B2: target is an ancestor of dev (move would go backwards) ==
$ git fetch -q . 2db629f678605d442d89efc223369562ce70e9f2:refs/heads/dev
[exit 1]
dev after: 055bf287d2563339bbce4a8169629f5f12710d9b (unchanged: yes)
== C: dev behind only, not checked out ==
$ git fetch -q . 6f7a7952d1a7e09ade24a87f546a4eaa1aa47f9b:refs/heads/dev
[exit 0]
dev after: 6f7a7952d1a7e09ade24a87f546a4eaa1aa47f9b (equals target: yes)
== D: main checkout on dev, uncommitted edit to a.txt (a path the update changes) ==
$ git merge --ff-only -q 6f7a7952d1a7e09ade24a87f546a4eaa1aa47f9b
error: Your local changes to the following files would be overwritten by merge:
	a.txt
Please commit your changes or stash them before you merge.
Aborting
[exit 1]
dev after: 2db629f678605d442d89efc223369562ce70e9f2 (unchanged: yes); a.txt now: my edit
== E: main checkout on dev, uncommitted edit to b.txt + staged new s.txt (paths the update does not change) ==
$ git merge --ff-only -q 6f7a7952d1a7e09ade24a87f546a4eaa1aa47f9b
[exit 0]
dev after: 6f7a7952d1a7e09ade24a87f546a4eaa1aa47f9b (equals target: yes); b.txt now: my b edit; staged: s.txt 
== F: main checkout on dev, untracked n.txt where the update adds n.txt ==
$ git merge --ff-only -q 471e5816786cc70934c59ef71eb6a483685b40f9
error: The following untracked working tree files would be overwritten by merge:
	n.txt
Please move or remove them before you merge.
Aborting
[exit 1]
dev after: 2db629f678605d442d89efc223369562ce70e9f2 (unchanged: yes); n.txt now: mine
```

Every refusal left `dev` and the edit in place. With `-q` (cases B and B2) the non-fast-forward refusal prints nothing on stderr; only the exit code 1 shows it.

**Claim 2** (`c6.out`, script exit 0):

```text
=== LC_ALL=de_DE.UTF-8 ===
occupied case [exit 128]: Schwerwiegend: Anfordern in Branch 'refs/heads/dev' verweigert, ausgecheckt in '/Users/christian/Documents/GitHub/bkit/.worktrees/849-keep-local-dev/docs/plans/202611/logs/849-keep-local-dev/spike/_work/c6/wt'
classified: git-refused (no English pattern matched)
edited case [exit 1]: Fehler: Ihre lokalen Änderungen in den folgenden Dateien würden durch den Merge
überschrieben werden:
	a.txt
Bitte committen oder stashen Sie Ihre Änderungen, bevor Sie mergen.
Abbruch
classified: git-refused (no English pattern matched)
=== LC_ALL=C ===
occupied case [exit 128]: fatal: refusing to fetch into branch 'refs/heads/dev' checked out at '/Users/christian/Documents/GitHub/bkit/.worktrees/849-keep-local-dev/docs/plans/202611/logs/849-keep-local-dev/spike/_work/c6/wt'
classified: occupied
edited case [exit 1]: error: Your local changes to the following files would be overwritten by merge:
	a.txt
Please commit your changes or stash them before you merge.
Aborting
classified: edited-files
=== git-state alternative, LC_ALL=de_DE.UTF-8 ===
occupied: 1 worktree(s) have refs/heads/dev
edited paths: a.txt; paths the update changes: a.txt; overlap: a.txt
```

**Claims 3 and 4** (`c3.out`, script exit 0):

```text
== cheap tier ==
$ git rev-list --left-right --count origin/dev...dev
2	9
$ git cherry -v origin/dev dev
+ 80a664b75079d23a572c5020f56a8dcbe63c2298 L1 copy
+ 3eb89d6f131f05d9aaff8448fb896735bfa028b7 L2 squash part 1
+ 06fc3b8460d71ea126768b7ec317f8ef3daad5ad L3 squash part 2
+ 35ea4909d410ef7cec7a5fd795660b353a6fc2d8 L4 empty retrigger
+ 5945b218432cbe4432a2208b8e2a534656ab42be L5 delete e (published)
+ 3225a2af7065a7299f30dc3ace09f4c11ed3946f L6 delete f (unpublished)
+ cee1151eef6e91eae93d36babaaf4253906c1033 L7 edit d (later reverted upstream)
+ 84f969c77162a8fee76bec2bae5b5ce995353e1d L8 new file
[exit 0]
copies=0
$ git cherry -v origin/dev L7   (local dev as it was before the pull merge)
- 80a664b75079d23a572c5020f56a8dcbe63c2298 L1 copy
+ 3eb89d6f131f05d9aaff8448fb896735bfa028b7 L2 squash part 1
+ 06fc3b8460d71ea126768b7ec317f8ef3daad5ad L3 squash part 2
- 35ea4909d410ef7cec7a5fd795660b353a6fc2d8 L4 empty retrigger
+ 5945b218432cbe4432a2208b8e2a534656ab42be L5 delete e (published)
+ 3225a2af7065a7299f30dc3ace09f4c11ed3946f L6 delete f (unpublished)
+ cee1151eef6e91eae93d36babaaf4253906c1033 L7 edit d (later reverted upstream)
[exit 0]
== merge commit paths ==
$ git diff-tree -r --no-commit-id --name-only M
[exit 0, lines=0]
$ git diff-tree -r -m --no-commit-id --name-only M
f.txt 
$ git diff-tree -r --no-commit-id --name-only L4
[lines=0]
$ git diff-tree -r --diff-filter=d --no-commit-id --name-only L6
[lines=0]
fork point=U3 empty retrigger
== full tier vs truth ==
commit                                 | truth       | rule, notOnDev filter=d  | rule, all paths          | contested paths
L1 copy                                | published   | content-match            | content-match            | 
L2 squash part 1                       | published   | content-match            | content-match            | 
L3 squash part 2                       | published   | unpublished              | unpublished              | c.txt 
L4 empty retrigger                     | empty       | content-match            | content-match            | 
L5 delete e (published)                | published   | content-match            | content-match            | 
L6 delete f (unpublished)              | unpublished | content-match            | unpublished              | 
L7 edit d (later reverted upstream)    | unpublished | unpublished              | unpublished              | d.txt 
Merge branch 'dev' of /Users/christian/Documents/GitHub/bkit/.worktrees/849-keep-local-dev/docs/plans/202611/logs/849-keep-local-dev/spike/_work/c3/origin into dev | merge       | content-match            | content-match            | 
L8 new file                            | unpublished | unpublished              | unpublished              |
```

Read against the claims:

- Claim 3: L1 is a real copy on `origin/dev`, but once local `dev` holds the `git pull` merge, `git cherry` marks it `+` and `copies=0`. On the pre-merge tip it marks L1 `-`, and also marks the empty L4 `-` only because `origin/dev` has an unrelated empty commit. `git cherry` lists 8 commits while `rev-list` counts 9 ahead: it never lists the merge.
- Claim 4: L4 (empty) and the merge both come out `content-match` in both variants, because `diff-tree` gives them zero paths. L6 (an unpublished deletion) comes out `content-match` under `--diff-filter=d`, and `unpublished` only when deletions are compared.

**Claim 5** (`c4.out`, git 2.56.0, script exit 0):

```text
-- 6 merge commit, --allow-empty --empty=drop
$ git cherry-pick --allow-empty --empty=drop 17f89152d1935b0b3d14838cd52af3f1339e32ca
error: commit 17f89152d1935b0b3d14838cd52af3f1339e32ca is a merge but no -m option was given.
fatal: cherry-pick failed
[exit 128]
HEAD moved: no
-- 7 merge commit, -m 1 --allow-empty --empty=drop
$ git cherry-pick -m 1 --allow-empty --empty=drop 17f89152d1935b0b3d14838cd52af3f1339e32ca
[detached HEAD 90dc08f] Merge branch 'side' into dev
 Date: Mon Nov 9 20:41:49 2026 +1000
 1 file changed, 1 insertion(+)
 create mode 100644 c.txt
[exit 0]
HEAD moved: 1 commit(s): Merge branch 'side' into dev=1; 
```

**Claim 6** (`c4.out`, git 2.56.0):

```text
-- 1 empty-from-start, --empty=drop alone
$ git cherry-pick --empty=drop 0c61b8352486f3d9bf67e98fb916ee55b7a051dc
The previous cherry-pick is now empty, possibly due to conflict resolution.
[...]
[exit 1]
HEAD moved: no
-- 2 empty-from-start, --allow-empty --empty=drop
$ git cherry-pick --allow-empty --empty=drop 0c61b8352486f3d9bf67e98fb916ee55b7a051dc
[detached HEAD 9937034] X2 empty from the start
 Date: Mon Nov 9 20:41:49 2026 +1000
[exit 0]
HEAD moved: 1 commit(s): X2 empty from the start=0; 
-- 3 becomes-empty, --allow-empty --empty=drop
$ git cherry-pick --allow-empty --empty=drop 0e14ce85133ec698044b680a54640f13b21c6e83
dropping 0e14ce85133ec698044b680a54640f13b21c6e83 X1 becomes empty on replay -- patch contents already upstream
[exit 0]
HEAD moved: no
-- 4 X1 X2 X3 in one call, --allow-empty --empty=drop
$ git cherry-pick --allow-empty --empty=drop 0e14ce85133ec698044b680a54640f13b21c6e83 0c61b8352486f3d9bf67e98fb916ee55b7a051dc 4495fa21efaf3633184754458989cac4dcea3024
dropping 0e14ce85133ec698044b680a54640f13b21c6e83 X1 becomes empty on replay -- patch contents already upstream
[detached HEAD 9937034] X2 empty from the start
 Date: Mon Nov 9 20:41:49 2026 +1000
[detached HEAD 78b961e] X3 real change
 Date: Mon Nov 9 20:41:49 2026 +1000
 1 file changed, 1 insertion(+), 1 deletion(-)
[exit 0]
HEAD moved: 2 commit(s): X3 real change=1; X2 empty from the start=0; 
-- 5 becomes-empty, today's --allow-empty --keep-redundant-commits
$ git cherry-pick --allow-empty --keep-redundant-commits 0e14ce85133ec698044b680a54640f13b21c6e83
[detached HEAD 633b4b4] X1 becomes empty on replay
 Date: Mon Nov 9 20:41:49 2026 +1000
[exit 0]
HEAD moved: 1 commit(s): X1 becomes empty on replay=0; 
```

Case 2 and case 4 show that `--allow-empty` replays the empty-from-start X2 as an empty commit (0 files), so it would reach `dev` unless the classifier leaves it out (claim 4).

**Claim 7** (`c5.out`, script exit 0; usage text after its first line left out):

```text
=== alpine/git:v2.43.4 ===
git 2.43.4
-- 1 empty-from-start, --empty=drop alone
$ git cherry-pick --empty=drop a3c30324add61ec3683d85a3ce745d0453834794
usage: git cherry-pick [--edit] [-n] [-m <parent-number>] [-s] [-x] [--ff]
[exit 129]
HEAD moved: no
-- 2 empty-from-start, --allow-empty --empty=drop
$ git cherry-pick --allow-empty --empty=drop a3c30324add61ec3683d85a3ce745d0453834794
usage: git cherry-pick [--edit] [-n] [-m <parent-number>] [-s] [-x] [--ff]
[exit 129]
HEAD moved: no
-- 3 becomes-empty, --allow-empty --empty=drop
$ git cherry-pick --allow-empty --empty=drop d315f34edcb5f480fdf1999826e31055c5c03268
usage: git cherry-pick [--edit] [-n] [-m <parent-number>] [-s] [-x] [--ff]
[exit 129]
HEAD moved: no
-- 8 fallback without --empty: becomes-empty, --allow-empty only
$ git cherry-pick --allow-empty d315f34edcb5f480fdf1999826e31055c5c03268
HEAD detached at 9c8eca6
The previous cherry-pick is now empty, possibly due to conflict resolution.
[...]
[exit 1]
HEAD moved: no
sequencer state: stopped
$ git cherry-pick --skip
[exit 0]
HEAD after --skip equals base: yes
[docker exit 0]
=== alpine/git:v2.45.1 ===
git 2.45.1
[...]
-- 3 becomes-empty, --allow-empty --empty=drop
$ git cherry-pick --allow-empty --empty=drop d315f34edcb5f480fdf1999826e31055c5c03268
dropping d315f34edcb5f480fdf1999826e31055c5c03268 X1 becomes empty on replay -- patch contents already upstream
[exit 0]
HEAD moved: no
```

Git 2.45.1 accepted the same three commands that 2.43.4 rejected with exit 129 (cases 1-3 above for 2.45.1 match `c4.out`). Case 8 gave the same result on git 2.56.0 (`c4.out`). Release notes, `Documentation/RelNotes/2.45.0.adoc`:

```text
63: * Allow git-cherry-pick(1) to automatically drop redundant commits via
64-   a new `--empty` option, similar to the `--empty` options for
65-   git-rebase(1) and git-am(1). Includes a soft deprecation of
66-   `--keep-redundant-commits` as well as some related docs changes and
```

**Claim 8** (`c2.out`, script exit 0):

```text
== A: CAS with correct old value, dev checked out nowhere ==
$ git update-ref refs/heads/dev 49db5f388be783b0fcd2da9c0c8f366e0aeb6889 a501290288aa8aadfe3344f3592c072865e1c847
[exit 0]
dev=49db5f388be783b0fcd2da9c0c8f366e0aeb6889
== B: CAS with stale old value ==
$ git update-ref refs/heads/dev b8e37b792d0e7d52f9501934b7980f3ce1aee7dd a501290288aa8aadfe3344f3592c072865e1c847
fatal: update_ref failed for ref 'refs/heads/dev': cannot lock ref 'refs/heads/dev': is at 49db5f388be783b0fcd2da9c0c8f366e0aeb6889 but expected a501290288aa8aadfe3344f3592c072865e1c847
[exit 128]
dev=49db5f388be783b0fcd2da9c0c8f366e0aeb6889
== C: create-only (empty old) on a new name, then the same name again ==
$ git update-ref refs/heads/dev-backup/20261109-120000 a501290288aa8aadfe3344f3592c072865e1c847 
[exit 0]
$ git update-ref refs/heads/dev-backup/20261109-120000 49db5f388be783b0fcd2da9c0c8f366e0aeb6889 
fatal: update_ref failed for ref 'refs/heads/dev-backup/20261109-120000': cannot lock ref 'refs/heads/dev-backup/20261109-120000': reference already exists
[exit 128]
backup=a501290288aa8aadfe3344f3592c072865e1c847
== D: CAS while dev is checked out in a linked worktree ==
$ git update-ref refs/heads/dev b8e37b792d0e7d52f9501934b7980f3ce1aee7dd 49db5f388be783b0fcd2da9c0c8f366e0aeb6889
[exit 0]
dev=b8e37b792d0e7d52f9501934b7980f3ce1aee7dd; linked worktree HEAD=b8e37b792d0e7d52f9501934b7980f3ce1aee7dd; a.txt in worktree=a3
linked worktree status:
M  a.txt
== E: occupancy as git state ==
branch refs/heads/main-co
branch refs/heads/dev
```

**Claim 9** (`c7.out`, both runs exit 0):

```text
### run N=200
fixture: 200 local-only commits, 50 files each, 1000 files in tree
left/right counts: 1	200; copies (git cherry -): 0
path lookups: 10000 commit:path pairs, 20000 batch-check answers
full tier: content-match=20 unpublished=180
git processes: cheap tier 2, full tier 3 (rev-list, diff-tree --stdin, cat-file --batch-check)
cheap tier seconds: .082
full tier seconds (excluding cheap tier): 2.167
total seconds: 2.249
[script exit 0]
### run N=1000
fixture: 1000 local-only commits, 50 files each, 1000 files in tree
left/right counts: 1	1000; copies (git cherry -): 0
path lookups: 50000 commit:path pairs, 100000 batch-check answers
full tier: content-match=20 unpublished=980
git processes: cheap tier 2, full tier 3 (rev-list, diff-tree --stdin, cat-file --batch-check)
cheap tier seconds: .206
full tier seconds (excluding cheap tier): 11.963
total seconds: 12.169
[script exit 0]
```

**Claim 10** (`c8.out`, script exit 0):

```text
=== LC_ALL=C: server refusal (pre-receive hook declines a fast-forward push) ===
[...]
!	32e0880e671a1ccb34e69c53f7793abe0861fd84:refs/heads/dev	[remote rejected] (pre-receive hook declined)
Done
[exit 1]
=== LC_ALL=de_DE.UTF-8: server refusal (pre-receive hook declines a fast-forward push) ===
$ git push --porcelain origin 32e0880e671a1ccb34e69c53f7793abe0861fd84:refs/heads/dev
remote: dev is protected        
Fehler: Fehler beim Versenden einiger Referenzen nach '/Users/christian/Documents/GitHub/bkit/.worktrees/849-keep-local-dev/docs/plans/202611/logs/849-keep-local-dev/spike/_work/c8/origin.git'
[...]
!	32e0880e671a1ccb34e69c53f7793abe0861fd84:refs/heads/dev	[remote rejected] (pre-receive hook declined)
Done
[exit 1]
=== LC_ALL=C: stale (origin/dev moved; push is not a fast-forward) ===
[...]
!	32e0880e671a1ccb34e69c53f7793abe0861fd84:refs/heads/dev	[rejected] (fetch first)
Done
[exit 1]
=== LC_ALL=de_DE.UTF-8: stale (origin/dev moved; push is not a fast-forward) ===
[...]
!	32e0880e671a1ccb34e69c53f7793abe0861fd84:refs/heads/dev	[rejected] (fetch first)
Done
[exit 1]
=== LC_ALL=C: stale after fetching the moved origin/dev first ===
[...]
!	32e0880e671a1ccb34e69c53f7793abe0861fd84:refs/heads/dev	[rejected] (non-fast-forward)
Done
[exit 1]
```

Both routes exit 1. The porcelain status line separates them in both locales: `[remote rejected]` for the receive-side refusal, `[rejected]` for stale. The stale reason is `(fetch first)` when the pusher has not fetched the moved tip, and `(non-fast-forward)` when it has.

**Claim 11**: no evidence captured.

## Design Impact

- **Claim 2 (stderr reasons) invalidates** `syncLocalDev` step 4's "classify stderr into `occupied` / `edited-files` / `git-refused`". Under `LC_ALL=de_DE.UTF-8` both refusals fell through to `git-refused`. The evidence supports either of:
  - Derive the reason from git state, which held under the German locale: a `branch refs/heads/dev` line in `git worktree list --porcelain` means `occupied`; a non-empty overlap of `git diff --name-only HEAD` with `git diff --name-only HEAD <target>` means `edited-files`. That overlap check does not cover claim 1's case F (an untracked file at a path the update adds), which `merge --ff-only` also refuses; the design needs a rule for that case. The untracked check itself was not probed.
  - Run the two refusing calls with `LC_ALL=C`; then git printed the English text in this probe.
  - Also: with `-q`, the non-fast-forward refusal of `fetch . <target>:refs/heads/dev` prints nothing (claim 1, cases B and B2), so that refusal can only be read from the exit code and a re-read of `dev`, as step 4's re-read already does.
- **Claim 3 (cheap-tier `copies`) invalidates** the `copies` count and the line "K of the N are already on GitHub as copies" as computed by `git cherry origin/dev dev`.
  - Once local `dev` holds a `git pull` merge of `origin/dev`, a real copy (L1) was counted `+` and `copies=0`. On the pre-merge tip the same copy was counted `-`.
  - An empty local commit was counted `-` only because `origin/dev` held an unrelated empty commit.
  - `git cherry` never lists merge commits, so its lines do not add up to `rev-list`'s ahead count (8 lines against 9 ahead).
  - The evidence supports: leave empty commits and merges out of the count, and do not present the count as complete when local `dev` holds a merge. In the fixture, the content check (claim 4, all-paths variant) found L1 when `git cherry` did not. Whether a cheap-tier content check fits the close-time budget was not measured.
- **Claim 4 (full-tier proofs) invalidates** the two-proof classifier as written, for three commit kinds:
  - The empty L4 and the merge both came out `content-match`, because `diff-tree` gives them zero touched paths. Without `-m` the merge shows no paths; with `-m` it shows `f.txt`.
  - The unpublished deletion L6 came out `content-match` under `notOnDev`'s `--diff-filter=d`. It came out `unpublished` only when deletions are compared as "path absent on `origin/dev`".
  - The evidence supports the review's rule: a named `empty` class and a merge class, neither counted as already on GitHub, and deletions compared on absence.
  - Side observation: after the pull merge, the fork point became the merged `origin/dev` tip (`fork point=U3 empty retrigger`). `contested` then covers only `origin/dev` changes made after the pull.
- **Claim 5 (merge replay) invalidates** `--stage=prepare` replaying every unpublished commit. A merge commit stops the cherry-pick with `error: commit … is a merge but no -m option was given.` (exit 128).
  - With `-m 1`, git replayed the merge as one ordinary commit carrying the side branch's change.
  - The evidence supports leaving merges out of the replay, or flattening them with `-m 1`. Which one is a design decision. Leaving them out is safe only if their non-merge parents carry every change, and this spike did not test that.
- **Claim 7 (git version) invalidates** building the drop-empty mode on `--empty=drop` while the engine assumes git >= 2.31.
  - git 2.43.4 rejects `--empty` with usage text and exit 129. git 2.45.1 accepts it. The 2.45.0 release notes introduce the option.
  - The evidence supports the stop-detect fallback, which behaved the same on git 2.43.4 and 2.56.0: `cherry-pick --allow-empty`, exit 1 with `CHERRY_PICK_HEAD` present, `git cherry-pick --skip`, `HEAD` back at the base.
  - Not probed: telling that "now empty" stop apart from a conflict stop. Both leave `CHERRY_PICK_HEAD`; unmerged index entries are the likely discriminator.
  - The other route is to declare git >= 2.45 as a minimum. The review lists a documented minimum as out of scope.

## Unsettled

- **Claim 11 (GitHub's refusal shape).**
  - **Needs:** a GitHub repository with `dev` protected by a branch protection rule or ruleset, plus credentials allowed to push to it but blocked by the rule. Then capture `git push --porcelain origin <sha>:refs/heads/dev` output. This run did not create or push to a GitHub repository, because that publishes.
  - **What is known:** claim 10 shows that git's client reports a receive-side refusal as `[remote rejected]` and a stale push as `[rejected]`, in both locales. It does not show which status GitHub's protection uses.
  - **Risk:** if GitHub reports a protected-branch refusal in a form the stage reads as `stale`, `--stage=push` sends the owner into a re-prepare and re-ask loop that can never succeed.

## Verdict Reasoning

`FAIL`, because five claims are `DISPROVEN` (2, 3, 4, 5, 7) and one is `BLOCKED` (11).

- **What held.** The load-bearing safety mechanics are sound:
  - The automatic move refused every unsafe case and kept edits and staged changes (claim 1).
  - `update-ref` behaves as the backup and adoption steps need, and does move a branch checked out elsewhere, so the explicit occupancy check is required (claim 8).
  - `--allow-empty --empty=drop` drops became-empty commits visibly (claim 6).
  - Batched classification of 200 x 50 took 2.249 s. 1000 x 50 took 12.169 s, which bounds where the commit limit can sit (claim 9).
  - git's push report separates stale from refused (claim 10).
- **What failed.** The design's reading of git is wrong in four places that cost real outcomes:
  - Refusal reasons from stderr text collapse to `git-refused` on a German git (claim 2).
  - The `copies` count reads 0 after a `git pull` merge, and pairs unrelated empty commits (claim 3).
  - Empty commits, merges and unpublished deletions pass as already on GitHub (claim 4). An unpublished deletion would be left out of the replay.
  - The replay stops on any merge commit (claim 5).
  - `--empty=drop` needs git 2.45, above the engine's assumed 2.31 (claim 7).
- **Damage limits.** None of these failures loses data outright: the automatic move never runs on these results, and the backup branch keeps every commit. They do make the line wrong and the recovery wrong or stuck. Each needs a design change, listed in Design Impact.
