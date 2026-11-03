diff --git a/.agents/plugins/bkit/skills/bkit-build/SKILL.md b/.agents/plugins/bkit/skills/bkit-build/SKILL.md
index c22a577ba..a81fccfbe 100644
--- a/.agents/plugins/bkit/skills/bkit-build/SKILL.md
+++ b/.agents/plugins/bkit/skills/bkit-build/SKILL.md
@@ -712,7 +712,7 @@ Each task group gets its own pass of Steps 7-9, in group order. Step 7 briefs th
    Update: the tests named, `docs/plans/{YYYYMM}/logs/{FID}/build-plan-tests-{GROUP}-log.md`.
    Record the restore. The command reads the group's `TEST FIRST` files from the plan and commits the diff:
    ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-plan-tests --file="{STATUS}" --attempt-of=build-plan-tests:next --group={GROUP} --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --agent=bkit-build-plan-tests --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-tests-{GROUP}-log.md --number=9 --post --title="Plan Gaps Remediate — tests restored" --message="chore({FID}): plan-tests group {GROUP} attempt <attempt>"
+   "{BKIT}" steps finish --workflow=build --step=build-plan-tests --file="{STATUS}" --attempt-of=build-plan-tests:next --group={GROUP} --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --agent=bkit-build-plan-tests --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-tests-{GROUP}-log.md --number=7 --post --title="Plan Execute — tests restored" --message="chore({FID}): plan-tests group {GROUP} attempt <attempt>"
    ```
    **If** exit 15 → the diff changes a file no `TEST FIRST` line of the group names (`source`): invoke `@bkit-build-plan-tests` again with `"<problem> Undo your edits to each file in <source>: restore it to its committed content, or delete it when you created it. Write no source code."` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**.
    Record the group's red again:
diff --git a/.agents/skills/bash-defensive-patterns/SKILL.md b/.agents/skills/bash-defensive-patterns/SKILL.md
new file mode 100644
index 000000000..1cb79f636
--- /dev/null
+++ b/.agents/skills/bash-defensive-patterns/SKILL.md
@@ -0,0 +1,40 @@
+---
+name: bash-defensive-patterns
+description: Master defensive Bash programming techniques for production-grade scripts. Use when writing robust shell scripts, CI/CD pipelines, or system utilities requiring fault tolerance and safety.
+---
+
+# Bash Defensive Patterns
+
+Comprehensive guidance for writing production-ready Bash scripts using defensive programming techniques, error handling, and safety best practices to prevent common pitfalls and ensure reliability.
+
+## When to Use This Skill
+
+- Writing production automation scripts
+- Building CI/CD pipeline scripts
+- Creating system administration utilities
+- Developing error-resilient deployment automation
+- Writing scripts that must handle edge cases safely
+- Building maintainable shell script libraries
+- Implementing comprehensive logging and monitoring
+- Creating scripts that must work across different platforms
+
+## Detailed patterns and worked examples
+
+Detailed pattern documentation lives in `references/details.md`. Read that file when the navigation tier above is insufficient.
+
+## Best Practices Summary
+
+1. **Always use strict mode** - `set -Eeuo pipefail`
+2. **Quote all variables** - `"$variable"` prevents word splitting
+3. **Use [[]] conditionals** - More robust than [ ]
+4. **Implement error trapping** - Catch and handle errors gracefully
+5. **Validate all inputs** - Check file existence, permissions, formats
+6. **Use functions for reusability** - Prefix with meaningful names
+7. **Implement structured logging** - Include timestamps and levels
+8. **Support dry-run mode** - Allow users to preview changes
+9. **Handle temporary files safely** - Use mktemp, cleanup with trap
+10. **Design for idempotency** - Scripts should be safe to rerun
+11. **Document requirements** - List dependencies and minimum versions
+12. **Test error paths** - Ensure error handling works correctly
+13. **Use `command -v`** - Safer than `which` for checking executables
+14. **Prefer printf over echo** - More predictable across systems
diff --git a/.agents/skills/bash-defensive-patterns/references/details.md b/.agents/skills/bash-defensive-patterns/references/details.md
new file mode 100644
index 000000000..742ccf274
--- /dev/null
+++ b/.agents/skills/bash-defensive-patterns/references/details.md
@@ -0,0 +1,504 @@
+# bash-defensive-patterns — detailed patterns and worked examples
+
+## Core Defensive Principles
+
+### 1. Strict Mode
+
+Enable bash strict mode at the start of every script to catch errors early.
+
+```bash
+#!/bin/bash
+set -Eeuo pipefail  # Exit on error, unset variables, pipe failures
+```
+
+**Key flags:**
+
+- `set -E`: Inherit ERR trap in functions
+- `set -e`: Exit on any error (command returns non-zero)
+- `set -u`: Exit on undefined variable reference
+- `set -o pipefail`: Pipe fails if any command fails (not just last)
+
+### 2. Error Trapping and Cleanup
+
+Implement proper cleanup on script exit or error.
+
+```bash
+#!/bin/bash
+set -Eeuo pipefail
+
+trap 'echo "Error on line $LINENO"' ERR
+TMPDIR=$(mktemp -d)
+trap 'echo "Cleaning up..."; rm -rf "$TMPDIR"' EXIT
+
+# Script code here
+```
+
+### 3. Variable Safety
+
+Always quote variables to prevent word splitting and globbing issues.
+
+```bash
+# Wrong - unsafe
+cp $source $dest
+
+# Correct - safe
+cp "$source" "$dest"
+
+# Required variables - fail with message if unset
+: "${REQUIRED_VAR:?REQUIRED_VAR is not set}"
+```
+
+### 4. Array Handling
+
+Use arrays safely for complex data handling.
+
+```bash
+# Safe array iteration
+declare -a items=("item 1" "item 2" "item 3")
+
+for item in "${items[@]}"; do
+    echo "Processing: $item"
+done
+
+# Reading output into array safely
+mapfile -t lines < <(some_command)
+readarray -t numbers < <(seq 1 10)
+```
+
+### 5. Conditional Safety
+
+Use `[[ ]]` for Bash-specific features, `[ ]` for POSIX.
+
+```bash
+# Bash - safer
+if [[ -f "$file" && -r "$file" ]]; then
+    content=$(<"$file")
+fi
+
+# POSIX - portable
+if [ -f "$file" ] && [ -r "$file" ]; then
+    content=$(cat "$file")
+fi
+
+# Test for existence before operations
+if [[ -z "${VAR:-}" ]]; then
+    echo "VAR is not set or is empty"
+fi
+```
+
+## Fundamental Patterns
+
+### Pattern 1: Safe Script Directory Detection
+
+```bash
+#!/bin/bash
+set -Eeuo pipefail
+
+# Correctly determine script directory
+SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
+SCRIPT_NAME="$(basename -- "${BASH_SOURCE[0]}")"
+
+echo "Script location: $SCRIPT_DIR/$SCRIPT_NAME"
+```
+
+### Pattern 2: Comprehensive Function Templat
+
+```bash
+#!/bin/bash
+set -Eeuo pipefail
+
+# Prefix for functions: handle_*, process_*, check_*, validate_*
+# Include documentation and error handling
+
+validate_file() {
+    local -r file="$1"
+    local -r message="${2:-File not found: $file}"
+
+    if [[ ! -f "$file" ]]; then
+        echo "ERROR: $message" >&2
+        return 1
+    fi
+    return 0
+}
+
+process_files() {
+    local -r input_dir="$1"
+    local -r output_dir="$2"
+
+    # Validate inputs
+    [[ -d "$input_dir" ]] || { echo "ERROR: input_dir not a directory" >&2; return 1; }
+
+    # Create output directory if needed
+    mkdir -p "$output_dir" || { echo "ERROR: Cannot create output_dir" >&2; return 1; }
+
+    # Process files safely
+    while IFS= read -r -d '' file; do
+        echo "Processing: $file"
+        # Do work
+    done < <(find "$input_dir" -maxdepth 1 -type f -print0)
+
+    return 0
+}
+```
+
+### Pattern 3: Safe Temporary File Handling
+
+```bash
+#!/bin/bash
+set -Eeuo pipefail
+
+# Create temporary directory
+TMPDIR=$(mktemp -d) || { echo "ERROR: Failed to create temp directory" >&2; exit 1; }
+trap 'rm -rf -- "$TMPDIR"' EXIT
+
+# Create temporary files in directory
+TMPFILE1="$TMPDIR/temp1.txt"
+TMPFILE2="$TMPDIR/temp2.txt"
+
+# Use temporary files
+touch "$TMPFILE1" "$TMPFILE2"
+
+echo "Temp files created in: $TMPDIR"
+```
+
+### Pattern 4: Robust Argument Parsing
+
+```bash
+#!/bin/bash
+set -Eeuo pipefail
+
+# Default values
+VERBOSE=false
+DRY_RUN=false
+OUTPUT_FILE=""
+THREADS=4
+
+usage() {
+    cat <<EOF
+Usage: $0 [OPTIONS]
+
+Options:
+    -v, --verbose       Enable verbose output
+    -d, --dry-run       Run without making changes
+    -o, --output FILE   Output file path
+    -j, --jobs NUM      Number of parallel jobs
+    -h, --help          Show this help message
+EOF
+    exit "${1:-0}"
+}
+
+# Parse arguments
+while [[ $# -gt 0 ]]; do
+    case "$1" in
+        -v|--verbose)
+            VERBOSE=true
+            shift
+            ;;
+        -d|--dry-run)
+            DRY_RUN=true
+            shift
+            ;;
+        -o|--output)
+            OUTPUT_FILE="$2"
+            shift 2
+            ;;
+        -j|--jobs)
+            THREADS="$2"
+            shift 2
+            ;;
+        -h|--help)
+            usage 0
+            ;;
+        --)
+            shift
+            break
+            ;;
+        *)
+            echo "ERROR: Unknown option: $1" >&2
+            usage 1
+            ;;
+    esac
+done
+
+# Validate required arguments
+[[ -n "$OUTPUT_FILE" ]] || { echo "ERROR: -o/--output is required" >&2; usage 1; }
+```
+
+### Pattern 5: Structured Logging
+
+```bash
+#!/bin/bash
+set -Eeuo pipefail
+
+# Logging functions
+log_info() {
+    echo "[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $*" >&2
+}
+
+log_warn() {
+    echo "[$(date +'%Y-%m-%d %H:%M:%S')] WARN: $*" >&2
+}
+
+log_error() {
+    echo "[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $*" >&2
+}
+
+log_debug() {
+    if [[ "${DEBUG:-0}" == "1" ]]; then
+        echo "[$(date +'%Y-%m-%d %H:%M:%S')] DEBUG: $*" >&2
+    fi
+}
+
+# Usage
+log_info "Starting script"
+log_debug "Debug information"
+log_warn "Warning message"
+log_error "Error occurred"
+```
+
+### Pattern 6: Process Orchestration with Signals
+
+```bash
+#!/bin/bash
+set -Eeuo pipefail
+
+# Track background processes
+PIDS=()
+
+cleanup() {
+    log_info "Shutting down..."
+
+    # Terminate all background processes
+    for pid in "${PIDS[@]}"; do
+        if kill -0 "$pid" 2>/dev/null; then
+            kill -TERM "$pid" 2>/dev/null || true
+        fi
+    done
+
+    # Wait for graceful shutdown
+    for pid in "${PIDS[@]}"; do
+        wait "$pid" 2>/dev/null || true
+    done
+}
+
+trap cleanup SIGTERM SIGINT
+
+# Start background tasks
+background_task &
+PIDS+=($!)
+
+another_task &
+PIDS+=($!)
+
+# Wait for all background processes
+wait
+```
+
+### Pattern 7: Safe File Operations
+
+```bash
+#!/bin/bash
+set -Eeuo pipefail
+
+# Use -i flag to move safely without overwriting
+safe_move() {
+    local -r source="$1"
+    local -r dest="$2"
+
+    if [[ ! -e "$source" ]]; then
+        echo "ERROR: Source does not exist: $source" >&2
+        return 1
+    fi
+
+    if [[ -e "$dest" ]]; then
+        echo "ERROR: Destination already exists: $dest" >&2
+        return 1
+    fi
+
+    mv "$source" "$dest"
+}
+
+# Safe directory cleanup
+safe_rmdir() {
+    local -r dir="$1"
+
+    if [[ ! -d "$dir" ]]; then
+        echo "ERROR: Not a directory: $dir" >&2
+        return 1
+    fi
+
+    # Use -I flag to prompt before rm (BSD/GNU compatible)
+    rm -rI -- "$dir"
+}
+
+# Atomic file writes
+atomic_write() {
+    local -r target="$1"
+    local tmpfile
+    # Temp file in the target's directory, so the rename stays on one filesystem
+    tmpfile=$(mktemp "$(dirname -- "$target")/.atomic_write.XXXXXX") || return 1
+
+    # Write to temp file first; on failure leave the target untouched
+    if ! cat > "$tmpfile"; then
+        rm -f -- "$tmpfile"
+        return 1
+    fi
+
+    # Atomic rename
+    if ! mv -- "$tmpfile" "$target"; then
+        rm -f -- "$tmpfile"
+        return 1
+    fi
+}
+```
+
+### Pattern 8: Idempotent Script Design
+
+```bash
+#!/bin/bash
+set -Eeuo pipefail
+
+# Check if resource already exists
+ensure_directory() {
+    local -r dir="$1"
+
+    if [[ -d "$dir" ]]; then
+        log_info "Directory already exists: $dir"
+        return 0
+    fi
+
+    mkdir -p "$dir" || {
+        log_error "Failed to create directory: $dir"
+        return 1
+    }
+
+    log_info "Created directory: $dir"
+}
+
+# Ensure configuration state
+ensure_config() {
+    local -r config_file="$1"
+    local -r default_value="$2"
+
+    if [[ ! -f "$config_file" ]]; then
+        echo "$default_value" > "$config_file"
+        log_info "Created config: $config_file"
+    fi
+}
+
+# Rerunning script multiple times should be safe
+ensure_directory "/var/cache/myapp"
+ensure_config "/etc/myapp/config" "DEBUG=false"
+```
+
+### Pattern 9: Safe Command Substitution
+
+```bash
+#!/bin/bash
+set -Eeuo pipefail
+
+# Use $() instead of backticks
+name=$(<"$file")  # Modern, safe variable assignment from file
+output=$(command -v python3)  # Get command location safely
+
+# Handle command substitution with error checking
+result=$(command -v node) || {
+    log_error "node command not found"
+    return 1
+}
+
+# For multiple lines
+mapfile -t lines < <(grep "pattern" "$file")
+
+# NUL-safe iteration
+while IFS= read -r -d '' file; do
+    echo "Processing: $file"
+done < <(find /path -type f -print0)
+```
+
+### Pattern 10: Dry-Run Support
+
+```bash
+#!/bin/bash
+set -Eeuo pipefail
+
+DRY_RUN="${DRY_RUN:-false}"
+
+run_cmd() {
+    if [[ "$DRY_RUN" == "true" ]]; then
+        echo "[DRY RUN] Would execute: $*"
+        return 0
+    fi
+
+    "$@"
+}
+
+# Usage
+run_cmd cp "$source" "$dest"
+run_cmd rm "$file"
+run_cmd chown "$owner" "$target"
+```
+
+## Advanced Defensive Techniques
+
+### Named Parameters Pattern
+
+```bash
+#!/bin/bash
+set -Eeuo pipefail
+
+process_data() {
+    local input_file=""
+    local output_dir=""
+    local format="json"
+
+    # Parse named parameters
+    while [[ $# -gt 0 ]]; do
+        case "$1" in
+            --input=*)
+                input_file="${1#*=}"
+                ;;
+            --output=*)
+                output_dir="${1#*=}"
+                ;;
+            --format=*)
+                format="${1#*=}"
+                ;;
+            *)
+                echo "ERROR: Unknown parameter: $1" >&2
+                return 1
+                ;;
+        esac
+        shift
+    done
+
+    # Validate required parameters
+    [[ -n "$input_file" ]] || { echo "ERROR: --input is required" >&2; return 1; }
+    [[ -n "$output_dir" ]] || { echo "ERROR: --output is required" >&2; return 1; }
+}
+```
+
+### Dependency Checking
+
+```bash
+#!/bin/bash
+set -Eeuo pipefail
+
+check_dependencies() {
+    local -a missing_deps=()
+    local -a required=("jq" "curl" "git")
+
+    for cmd in "${required[@]}"; do
+        if ! command -v "$cmd" &>/dev/null; then
+            missing_deps+=("$cmd")
+        fi
+    done
+
+    if [[ ${#missing_deps[@]} -gt 0 ]]; then
+        echo "ERROR: Missing required commands: ${missing_deps[*]}" >&2
+        return 1
+    fi
+}
+
+check_dependencies
+```
diff --git a/.agents/skills/bkit-build/SKILL.md b/.agents/skills/bkit-build/SKILL.md
index 9971585e2..4ec497dc7 100644
--- a/.agents/skills/bkit-build/SKILL.md
+++ b/.agents/skills/bkit-build/SKILL.md
@@ -712,7 +712,7 @@ Each task group gets its own pass of Steps 7-9, in group order. Step 7 briefs th
    Update: the tests named, `docs/plans/{YYYYMM}/logs/{FID}/build-plan-tests-{GROUP}-log.md`.
    Record the restore. The command reads the group's `TEST FIRST` files from the plan and commits the diff:
    ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-plan-tests --file="{STATUS}" --attempt-of=build-plan-tests:next --group={GROUP} --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --agent=bkit-build-plan-tests --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-tests-{GROUP}-log.md --number=9 --post --title="Plan Gaps Remediate — tests restored" --message="chore({FID}): plan-tests group {GROUP} attempt <attempt>"
+   "{BKIT}" steps finish --workflow=build --step=build-plan-tests --file="{STATUS}" --attempt-of=build-plan-tests:next --group={GROUP} --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --agent=bkit-build-plan-tests --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-tests-{GROUP}-log.md --number=7 --post --title="Plan Execute — tests restored" --message="chore({FID}): plan-tests group {GROUP} attempt <attempt>"
    ```
    **If** exit 15 → the diff changes a file no `TEST FIRST` line of the group names (`source`): invoke `@bkit-build-plan-tests` again with `"<problem> Undo your edits to each file in <source>: restore it to its committed content, or delete it when you created it. Write no source code."` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**.
    Record the group's red again:
diff --git a/.agents/skills/perl-patterns/SKILL.md b/.agents/skills/perl-patterns/SKILL.md
new file mode 100644
index 000000000..a2aaa8621
--- /dev/null
+++ b/.agents/skills/perl-patterns/SKILL.md
@@ -0,0 +1,505 @@
+---
+name: perl-patterns
+description: Modern Perl 5.36+ idioms, best practices, and conventions for building robust, maintainable Perl applications. Use when writing or reviewing modern Perl 5.36+ code.
+metadata:
+  origin: ECC
+---
+
+# Modern Perl Development Patterns
+
+Idiomatic Perl 5.36+ patterns and best practices for building robust, maintainable applications.
+
+## When to Activate
+
+- Writing new Perl code or modules
+- Reviewing Perl code for idiom compliance
+- Refactoring legacy Perl to modern standards
+- Designing Perl module architecture
+- Migrating pre-5.36 code to modern Perl
+
+## How It Works
+
+Apply these patterns as a bias toward modern Perl 5.36+ defaults: signatures, explicit modules, focused error handling, and testable boundaries. The examples below are meant to be copied as starting points, then tightened for the actual app, dependency stack, and deployment model in front of you.
+
+## Core Principles
+
+### 1. Use `v5.36` Pragma
+
+A single `use v5.36` replaces the old boilerplate and enables strict, warnings, and subroutine signatures.
+
+```perl
+# Good: Modern preamble
+use v5.36;
+
+sub greet($name) {
+    say "Hello, $name!";
+}
+
+# Bad: Legacy boilerplate
+use strict;
+use warnings;
+use feature 'say', 'signatures';
+no warnings 'experimental::signatures';
+
+sub greet {
+    my ($name) = @_;
+    say "Hello, $name!";
+}
+```
+
+### 2. Subroutine Signatures
+
+Use signatures for clarity and automatic arity checking.
+
+```perl
+use v5.36;
+
+# Good: Signatures with defaults
+sub connect_db($host, $port = 5432, $timeout = 30) {
+    # $host is required, others have defaults
+    return DBI->connect("dbi:Pg:host=$host;port=$port", undef, undef, {
+        RaiseError => 1,
+        PrintError => 0,
+    });
+}
+
+# Good: Slurpy parameter for variable args
+sub log_message($level, @details) {
+    say "[$level] " . join(' ', @details);
+}
+
+# Bad: Manual argument unpacking
+sub connect_db {
+    my ($host, $port, $timeout) = @_;
+    $port    //= 5432;
+    $timeout //= 30;
+    # ...
+}
+```
+
+### 3. Context Sensitivity
+
+Understand scalar vs list context — a core Perl concept.
+
+```perl
+use v5.36;
+
+my @items = (1, 2, 3, 4, 5);
+
+my @copy  = @items;            # List context: all elements
+my $count = @items;            # Scalar context: count (5)
+say "Items: " . scalar @items; # Force scalar context
+```
+
+### 4. Postfix Dereferencing
+
+Use postfix dereference syntax for readability with nested structures.
+
+```perl
+use v5.36;
+
+my $data = {
+    users => [
+        { name => 'Alice', roles => ['admin', 'user'] },
+        { name => 'Bob',   roles => ['user'] },
+    ],
+};
+
+# Good: Postfix dereferencing
+my @users = $data->{users}->@*;
+my @roles = $data->{users}[0]{roles}->@*;
+my %first = $data->{users}[0]->%*;
+
+# Bad: Circumfix dereferencing (harder to read in chains)
+my @users = @{ $data->{users} };
+my @roles = @{ $data->{users}[0]{roles} };
+```
+
+### 5. The `isa` Operator (5.32+)
+
+Infix type-check — replaces `blessed($o) && $o->isa('X')`.
+
+```perl
+use v5.36;
+if ($obj isa 'My::Class') { $obj->do_something }
+```
+
+## Error Handling
+
+### eval/die Pattern
+
+```perl
+use v5.36;
+
+sub parse_config($path) {
+    my $content = eval { path($path)->slurp_utf8 };
+    die "Config error: $@" if $@;
+    return decode_json($content);
+}
+```
+
+### Try::Tiny (Reliable Exception Handling)
+
+```perl
+use v5.36;
+use Try::Tiny;
+
+sub fetch_user($id) {
+    my $user = try {
+        $db->resultset('User')->find($id)
+            // die "User $id not found\n";
+    }
+    catch {
+        warn "Failed to fetch user $id: $_";
+        undef;
+    };
+    return $user;
+}
+```
+
+### Native try/catch (5.40+)
+
+```perl
+use v5.40;
+
+sub divide($x, $y) {
+    try {
+        die "Division by zero" if $y == 0;
+        return $x / $y;
+    }
+    catch ($e) {
+        warn "Error: $e";
+        return;
+    }
+}
+```
+
+## Modern OO with Moo
+
+Prefer Moo for lightweight, modern OO. Use Moose only when its metaprotocol is needed.
+
+```perl
+# Good: Moo class
+package User;
+use Moo;
+use Types::Standard qw(Str Int ArrayRef);
+use namespace::autoclean;
+
+has name  => (is => 'ro', isa => Str, required => 1);
+has email => (is => 'ro', isa => Str, required => 1);
+has age   => (is => 'ro', isa => Int, default  => sub { 0 });
+has roles => (is => 'ro', isa => ArrayRef[Str], default => sub { [] });
+
+sub is_admin($self) {
+    return grep { $_ eq 'admin' } $self->roles->@*;
+}
+
+sub greet($self) {
+    return "Hello, I'm " . $self->name;
+}
+
+1;
+
+# Usage
+my $user = User->new(
+    name  => 'Alice',
+    email => 'alice@example.com',
+    roles => ['admin', 'user'],
+);
+
+# Bad: Blessed hashref (no validation, no accessors)
+package User;
+sub new {
+    my ($class, %args) = @_;
+    return bless \%args, $class;
+}
+sub name { return $_[0]->{name} }
+1;
+```
+
+### Moo Roles
+
+```perl
+package Role::Serializable;
+use Moo::Role;
+use JSON::MaybeXS qw(encode_json);
+requires 'TO_HASH';
+sub to_json($self) { encode_json($self->TO_HASH) }
+1;
+
+package User;
+use Moo;
+with 'Role::Serializable';
+has name  => (is => 'ro', required => 1);
+has email => (is => 'ro', required => 1);
+sub TO_HASH($self) { { name => $self->name, email => $self->email } }
+1;
+```
+
+### Native `class` Keyword (5.38+, Corinna)
+
+```perl
+use v5.38;
+use feature 'class';
+no warnings 'experimental::class';
+
+class Point {
+    field $x :param;
+    field $y :param;
+    method magnitude() { sqrt($x**2 + $y**2) }
+}
+
+my $p = Point->new(x => 3, y => 4);
+say $p->magnitude;  # 5
+```
+
+## Regular Expressions
+
+### Named Captures and `/x` Flag
+
+```perl
+use v5.36;
+
+# Good: Named captures with /x for readability
+my $log_re = qr{
+    ^ (?<timestamp> \d{4}-\d{2}-\d{2} \s \d{2}:\d{2}:\d{2} )
+    \s+ \[ (?<level> \w+ ) \]
+    \s+ (?<message> .+ ) $
+}x;
+
+if ($line =~ $log_re) {
+    say "Time: $+{timestamp}, Level: $+{level}";
+    say "Message: $+{message}";
+}
+
+# Bad: Positional captures (hard to maintain)
+if ($line =~ /^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\s+\[(\w+)\]\s+(.+)$/) {
+    say "Time: $1, Level: $2";
+}
+```
+
+### Precompiled Patterns
+
+```perl
+use v5.36;
+
+# Good: Compile once, use many
+my $email_re = qr/^[A-Za-z0-9._%+-]+\@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
+
+sub validate_emails(@emails) {
+    return grep { $_ =~ $email_re } @emails;
+}
+```
+
+## Data Structures
+
+### References and Safe Deep Access
+
+```perl
+use v5.36;
+
+# Hash and array references
+my $config = {
+    database => {
+        host => 'localhost',
+        port => 5432,
+        options => ['utf8', 'sslmode=require'],
+    },
+};
+
+# Safe deep access (returns undef if any level missing)
+my $port = $config->{database}{port};           # 5432
+my $missing = $config->{cache}{host};           # undef, no error
+
+# Hash slices
+my %subset;
+@subset{qw(host port)} = @{$config->{database}}{qw(host port)};
+
+# Array slices
+my @first_two = $config->{database}{options}->@[0, 1];
+
+# Multi-variable for loop (experimental in 5.36, stable in 5.40)
+use feature 'for_list';
+no warnings 'experimental::for_list';
+for my ($key, $val) (%$config) {
+    say "$key => $val";
+}
+```
+
+## File I/O
+
+### Three-Argument Open
+
+```perl
+use v5.36;
+
+# Good: Three-arg open with autodie (core module, eliminates 'or die')
+use autodie;
+
+sub read_file($path) {
+    open my $fh, '<:encoding(UTF-8)', $path;
+    local $/;
+    my $content = <$fh>;
+    close $fh;
+    return $content;
+}
+
+# Bad: Two-arg open (shell injection risk, see perl-security)
+open FH, $path;            # NEVER do this
+open FH, "< $path";        # Still bad — user data in mode string
+```
+
+### Path::Tiny for File Operations
+
+```perl
+use v5.36;
+use Path::Tiny;
+
+my $file = path('config', 'app.json');
+my $content = $file->slurp_utf8;
+$file->spew_utf8($new_content);
+
+# Iterate directory
+for my $child (path('src')->children(qr/\.pl$/)) {
+    say $child->basename;
+}
+```
+
+## Module Organization
+
+### Standard Project Layout
+
+```text
+MyApp/
+├── lib/
+│   └── MyApp/
+│       ├── App.pm           # Main module
+│       ├── Config.pm        # Configuration
+│       ├── DB.pm            # Database layer
+│       └── Util.pm          # Utilities
+├── bin/
+│   └── myapp                # Entry-point script
+├── t/
+│   ├── 00-load.t            # Compilation tests
+│   ├── unit/                # Unit tests
+│   └── integration/         # Integration tests
+├── cpanfile                 # Dependencies
+├── Makefile.PL              # Build system
+└── .perlcriticrc            # Linting config
+```
+
+### Exporter Patterns
+
+```perl
+package MyApp::Util;
+use v5.36;
+use Exporter 'import';
+
+our @EXPORT_OK   = qw(trim);
+our %EXPORT_TAGS = (all => \@EXPORT_OK);
+
+sub trim($str) { $str =~ s/^\s+|\s+$//gr }
+
+1;
+```
+
+## Tooling
+
+### perltidy Configuration (.perltidyrc)
+
+```text
+-i=4        # 4-space indent
+-l=100      # 100-char line length
+-ci=4       # continuation indent
+-ce         # cuddled else
+-bar        # opening brace on same line
+-nolq       # don't outdent long quoted strings
+```
+
+### perlcritic Configuration (.perlcriticrc)
+
+```ini
+severity = 3
+theme = core + pbp + security
+
+[InputOutput::RequireCheckedSyscalls]
+functions = :builtins
+exclude_functions = say print
+
+[Subroutines::ProhibitExplicitReturnUndef]
+severity = 4
+
+[ValuesAndExpressions::ProhibitMagicNumbers]
+allowed_values = 0 1 2 -1
+```
+
+### Dependency Management (cpanfile + carton)
+
+```bash
+cpanm App::cpanminus Carton   # Install tools
+carton install                 # Install deps from cpanfile
+carton exec -- perl bin/myapp  # Run with local deps
+```
+
+```perl
+# cpanfile
+requires 'Moo', '>= 2.005';
+requires 'Path::Tiny';
+requires 'JSON::MaybeXS';
+requires 'Try::Tiny';
+
+on test => sub {
+    requires 'Test2::V0';
+    requires 'Test::MockModule';
+};
+```
+
+## Quick Reference: Modern Perl Idioms
+
+| Legacy Pattern | Modern Replacement |
+|---|---|
+| `use strict; use warnings;` | `use v5.36;` |
+| `my ($x, $y) = @_;` | `sub foo($x, $y) { ... }` |
+| `@{ $ref }` | `$ref->@*` |
+| `%{ $ref }` | `$ref->%*` |
+| `open FH, "< $file"` | `open my $fh, '<:encoding(UTF-8)', $file` |
+| `blessed hashref` | `Moo` class with types |
+| `$1, $2, $3` | `$+{name}` (named captures) |
+| `eval { }; if ($@)` | `Try::Tiny` or native `try/catch` (5.40+) |
+| `BEGIN { require Exporter; }` | `use Exporter 'import';` |
+| Manual file ops | `Path::Tiny` |
+| `blessed($o) && $o->isa('X')` | `$o isa 'X'` (5.32+) |
+| `builtin::true / false` | `use builtin 'true', 'false';` (5.36+, experimental) |
+
+## Anti-Patterns
+
+```perl
+# 1. Two-arg open (security risk)
+open FH, $filename;                     # NEVER
+
+# 2. Indirect object syntax (ambiguous parsing)
+my $obj = new Foo(bar => 1);            # Bad
+my $obj = Foo->new(bar => 1);           # Good
+
+# 3. Excessive reliance on $_
+map { process($_) } grep { validate($_) } @items;  # Hard to follow
+my @valid = grep { validate($_) } @items;           # Better: break it up
+my @results = map { process($_) } @valid;
+
+# 4. Disabling strict refs
+no strict 'refs';                        # Almost always wrong
+${"My::Package::$var"} = $value;         # Use a hash instead
+
+# 5. Global variables as configuration
+our $TIMEOUT = 30;                       # Bad: mutable global
+use constant TIMEOUT => 30;              # Better: constant
+# Best: Moo attribute with default
+
+# 6. String eval for module loading
+eval "require $module";                  # Bad: code injection risk
+eval "use $module";                      # Bad
+use Module::Runtime 'require_module';    # Good: safe module loading
+require_module($module);
+```
+
+**Remember**: Modern Perl is clean, readable, and safe. Let `use v5.36` handle the boilerplate, use Moo for objects, and prefer CPAN's battle-tested modules over hand-rolled solutions.
diff --git a/.agents/skills/typescript-pro/SKILL.md b/.agents/skills/typescript-pro/SKILL.md
new file mode 100644
index 000000000..c38d542a8
--- /dev/null
+++ b/.agents/skills/typescript-pro/SKILL.md
@@ -0,0 +1,150 @@
+---
+name: typescript-pro
+description: Implements advanced TypeScript type systems, creates custom type guards, utility types, and branded types, and configures tRPC for end-to-end type safety. Use when building TypeScript applications requiring advanced generics, conditional or mapped types, discriminated unions, monorepo setup, or full-stack type safety with tRPC.
+license: MIT
+metadata:
+  author: https://github.com/Jeffallan
+  company: https://synergetic.solutions
+  version: "1.1.0"
+  domain: language
+  triggers: TypeScript, generics, type safety, conditional types, mapped types, tRPC, tsconfig, type guards, discriminated unions
+  role: specialist
+  scope: implementation
+  output-format: code
+  related-skills: fullstack-guardian, api-designer
+---
+
+# TypeScript Pro
+
+## Core Workflow
+
+1. **Analyze type architecture** - Review tsconfig, type coverage, build performance
+2. **Design type-first APIs** - Create branded types, generics, utility types
+3. **Implement with type safety** - Write type guards, discriminated unions, conditional types; run `tsc --noEmit` to catch type errors before proceeding
+4. **Optimize build** - Configure project references, incremental compilation, tree shaking; re-run `tsc --noEmit` to confirm zero errors after changes
+5. **Test types** - Confirm type coverage with a tool like `type-coverage`; validate that all public APIs have explicit return types; iterate on steps 3–4 until all checks pass
+
+## Reference Guide
+
+Load detailed guidance based on context:
+
+| Topic | Reference | Load When |
+|-------|-----------|-----------|
+| Advanced Types | `references/advanced-types.md` | Generics, conditional types, mapped types, template literals |
+| Type Guards | `references/type-guards.md` | Type narrowing, discriminated unions, assertion functions |
+| Utility Types | `references/utility-types.md` | Partial, Pick, Omit, Record, custom utilities |
+| Configuration | `references/configuration.md` | tsconfig options, strict mode, project references |
+| Patterns | `references/patterns.md` | Builder pattern, factory pattern, type-safe APIs |
+
+## Code Examples
+
+### Branded Types
+```typescript
+// Branded type for domain modeling
+type Brand<T, B extends string> = T & { readonly __brand: B };
+type UserId  = Brand<string, "UserId">;
+type OrderId = Brand<number, "OrderId">;
+
+const toUserId  = (id: string): UserId  => id as UserId;
+const toOrderId = (id: number): OrderId => id as OrderId;
+
+// Usage — prevents accidental id mix-ups at compile time
+function getOrder(userId: UserId, orderId: OrderId) { /* ... */ }
+```
+
+### Discriminated Unions & Type Guards
+```typescript
+type LoadingState = { status: "loading" };
+type SuccessState = { status: "success"; data: string[] };
+type ErrorState   = { status: "error";   error: Error };
+type RequestState = LoadingState | SuccessState | ErrorState;
+
+// Type predicate guard
+function isSuccess(state: RequestState): state is SuccessState {
+  return state.status === "success";
+}
+
+// Exhaustive switch with discriminated union
+function renderState(state: RequestState): string {
+  switch (state.status) {
+    case "loading": return "Loading…";
+    case "success": return state.data.join(", ");
+    case "error":   return state.error.message;
+    default: {
+      const _exhaustive: never = state;
+      throw new Error(`Unhandled state: ${_exhaustive}`);
+    }
+  }
+}
+```
+
+### Custom Utility Types
+```typescript
+// Deep readonly — immutable nested objects
+type DeepReadonly<T> = {
+  readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K];
+};
+
+// Require exactly one of a set of keys
+type RequireExactlyOne<T, Keys extends keyof T = keyof T> =
+  Pick<T, Exclude<keyof T, Keys>> &
+  { [K in Keys]-?: Required<Pick<T, K>> & Partial<Record<Exclude<Keys, K>, never>> }[Keys];
+```
+
+### Recommended tsconfig.json
+```json
+{
+  "compilerOptions": {
+    "target": "ES2022",
+    "module": "NodeNext",
+    "moduleResolution": "NodeNext",
+    "strict": true,
+    "noUncheckedIndexedAccess": true,
+    "noImplicitOverride": true,
+    "exactOptionalPropertyTypes": true,
+    "isolatedModules": true,
+    "declaration": true,
+    "declarationMap": true,
+    "incremental": true,
+    "skipLibCheck": false
+  }
+}
+```
+
+## Constraints
+
+### MUST DO
+- Enable strict mode with all compiler flags
+- Use type-first API design
+- Implement branded types for domain modeling
+- Use `satisfies` operator for type validation
+- Create discriminated unions for state machines
+- Use `Annotated` pattern with type predicates
+- Generate declaration files for libraries
+- Optimize for type inference
+
+### MUST NOT DO
+- Use explicit `any` without justification
+- Skip type coverage for public APIs
+- Mix type-only and value imports
+- Disable strict null checks
+- Use `as` assertions without necessity
+- Ignore compiler performance warnings
+- Skip declaration file generation
+- Use enums (prefer const objects with `as const`)
+
+## Output Templates
+
+When implementing TypeScript features, provide:
+1. Type definitions (interfaces, types, generics)
+2. Implementation with type guards
+3. tsconfig configuration if needed
+4. Brief explanation of type design decisions
+
+## Knowledge Reference
+
+TypeScript 5.0+, generics, conditional types, mapped types, template literal types, discriminated unions, type guards, branded types, tRPC, project references, incremental compilation, declaration files, const assertions, satisfies operator
+
+Maintained by [@jeffallan](https://github.com/jeffallan), Principal Consultant at [Synergetic Solutions](https://synergetic.solutions)
+
+[Documentation](https://jeffallan.github.io/claude-skills/skills/language/typescript-pro/)
diff --git a/.agents/skills/typescript-pro/references/advanced-types.md b/.agents/skills/typescript-pro/references/advanced-types.md
new file mode 100644
index 000000000..c7f8cc47c
--- /dev/null
+++ b/.agents/skills/typescript-pro/references/advanced-types.md
@@ -0,0 +1,259 @@
+# Advanced Types
+
+## Generic Constraints
+
+```typescript
+// Basic constraint
+function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
+  return obj[key];
+}
+
+// Multiple constraints
+interface HasId { id: number; }
+interface HasName { name: string; }
+
+function merge<T extends HasId, U extends HasName>(obj1: T, obj2: U): T & U {
+  return { ...obj1, ...obj2 };
+}
+
+// Generic constraint with default
+type ApiResponse<T = unknown, E = Error> =
+  | { success: true; data: T }
+  | { success: false; error: E };
+
+// Constraint with infer
+type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;
+type Result = UnwrapPromise<Promise<string>>; // string
+```
+
+## Conditional Types
+
+```typescript
+// Basic conditional type
+type IsString<T> = T extends string ? true : false;
+
+// Distributive conditional types
+type ToArray<T> = T extends any ? T[] : never;
+type StringOrNumberArray = ToArray<string | number>; // string[] | number[]
+
+// Non-distributive (use tuple)
+type ToArrayNonDist<T> = [T] extends [any] ? T[] : never;
+type BothArray = ToArrayNonDist<string | number>; // (string | number)[]
+
+// Nested conditionals for type extraction
+type Flatten<T> = T extends Array<infer U>
+  ? U extends Array<infer V>
+    ? Flatten<V>
+    : U
+  : T;
+
+type Nested = Flatten<string[][][]>; // string
+
+// Exclude null/undefined
+type NonNullable<T> = T extends null | undefined ? never : T;
+```
+
+## Mapped Types
+
+```typescript
+// Basic mapped type
+type ReadOnly<T> = {
+  readonly [K in keyof T]: T[K];
+};
+
+// Optional properties
+type Partial<T> = {
+  [K in keyof T]?: T[K];
+};
+
+// Required properties
+type Required<T> = {
+  [K in keyof T]-?: T[K]; // Remove optional modifier
+};
+
+// Key remapping with 'as'
+type Getters<T> = {
+  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
+};
+
+interface Person {
+  name: string;
+  age: number;
+}
+
+type PersonGetters = Getters<Person>;
+// { getName: () => string; getAge: () => number; }
+
+// Filtering keys
+type PickByType<T, U> = {
+  [K in keyof T as T[K] extends U ? K : never]: T[K];
+};
+
+type StringFields = PickByType<Person, string>; // { name: string }
+```
+
+## Template Literal Types
+
+```typescript
+// Basic template literal
+type EmailLocale = 'en' | 'es' | 'fr';
+type EmailType = 'welcome' | 'reset-password';
+type EmailTemplate = `${EmailLocale}_${EmailType}`;
+// 'en_welcome' | 'en_reset-password' | 'es_welcome' | ...
+
+// Intrinsic string manipulation
+type Uppercase<S extends string> = intrinsic;
+type Lowercase<S extends string> = intrinsic;
+type Capitalize<S extends string> = intrinsic;
+type Uncapitalize<S extends string> = intrinsic;
+
+type EventName<T extends string> = `on${Capitalize<T>}`;
+type ClickEvent = EventName<'click'>; // 'onClick'
+
+// Template literal with mapped types
+type CSSProperties = {
+  [K in 'color' | 'background' | 'border' as `--${K}`]: string;
+};
+// { '--color': string; '--background': string; '--border': string }
+
+// Pattern matching with infer
+type ExtractRouteParams<T extends string> =
+  T extends `${infer _Start}/:${infer Param}/${infer Rest}`
+    ? Param | ExtractRouteParams<`/${Rest}`>
+    : T extends `${infer _Start}/:${infer Param}`
+    ? Param
+    : never;
+
+type Params = ExtractRouteParams<'/users/:id/posts/:postId'>; // 'id' | 'postId'
+```
+
+## Higher-Kinded Types (Simulation)
+
+```typescript
+// Type-level function simulation
+interface TypeClass<F> {
+  map: <A, B>(f: (a: A) => B, fa: any) => any;
+}
+
+// Functor pattern
+type Maybe<T> = { type: 'just'; value: T } | { type: 'nothing' };
+
+const MaybeFunctor: TypeClass<Maybe<any>> = {
+  map: <A, B>(f: (a: A) => B, ma: Maybe<A>): Maybe<B> => {
+    return ma.type === 'just'
+      ? { type: 'just', value: f(ma.value) }
+      : { type: 'nothing' };
+  }
+};
+
+// Builder pattern with generics
+type Builder<T, K extends keyof T = never> = {
+  with<P extends Exclude<keyof T, K>>(
+    key: P,
+    value: T[P]
+  ): Builder<T, K | P>;
+  build(): K extends keyof T ? T : never;
+};
+```
+
+## Recursive Types
+
+```typescript
+// JSON type
+type JSONValue =
+  | string
+  | number
+  | boolean
+  | null
+  | JSONValue[]
+  | { [key: string]: JSONValue };
+
+// Deep partial
+type DeepPartial<T> = T extends object ? {
+  [K in keyof T]?: DeepPartial<T[K]>;
+} : T;
+
+// Deep readonly
+type DeepReadonly<T> = T extends object ? {
+  readonly [K in keyof T]: DeepReadonly<T[K]>;
+} : T;
+
+// Path type for nested objects
+type PathsToProps<T> = T extends object ? {
+  [K in keyof T]: K extends string
+    ? T[K] extends object
+      ? K | `${K}.${PathsToProps<T[K]>}`
+      : K
+    : never;
+}[keyof T] : never;
+
+interface User {
+  profile: {
+    name: string;
+    settings: {
+      theme: string;
+    };
+  };
+}
+
+type UserPaths = PathsToProps<User>;
+// 'profile' | 'profile.name' | 'profile.settings' | 'profile.settings.theme'
+```
+
+## Variance and Contravariance
+
+```typescript
+// Covariance (return types)
+type Producer<T> = () => T;
+let stringProducer: Producer<string> = () => 'hello';
+let objectProducer: Producer<object> = stringProducer; // OK: string is object
+
+// Contravariance (parameter types)
+type Consumer<T> = (value: T) => void;
+let objectConsumer: Consumer<object> = (obj) => console.log(obj);
+let stringConsumer: Consumer<string> = objectConsumer; // OK in strict mode
+
+// Invariance (mutable properties)
+interface Box<T> {
+  value: T;
+  setValue(v: T): void;
+}
+
+let stringBox: Box<string> = { value: '', setValue: (v) => {} };
+// let objectBox: Box<object> = stringBox; // Error: invariant
+```
+
+## Type-Level Programming
+
+```typescript
+// Type-level addition (limited)
+type Length<T extends any[]> = T['length'];
+type Concat<A extends any[], B extends any[]> = [...A, ...B];
+
+// Type-level conditionals
+type If<Condition extends boolean, Then, Else> =
+  Condition extends true ? Then : Else;
+
+// Type-level equality
+type Equal<X, Y> =
+  (<T>() => T extends X ? 1 : 2) extends
+  (<T>() => T extends Y ? 1 : 2) ? true : false;
+
+// Assert equal types (for testing)
+type Assert<T extends true> = T;
+type Test = Assert<Equal<1 | 2, 2 | 1>>; // OK
+```
+
+## Quick Reference
+
+| Pattern | Use Case |
+|---------|----------|
+| `T extends U ? X : Y` | Conditional type logic |
+| `infer R` | Extract types from patterns |
+| `K in keyof T` | Iterate over object keys |
+| `as NewKey` | Remap keys in mapped types |
+| Template literals | String pattern types |
+| `T extends any` | Distributive conditionals |
+| `[T] extends [any]` | Non-distributive check |
+| `-?` modifier | Remove optional |
+| `readonly` modifier | Make immutable |
diff --git a/.agents/skills/typescript-pro/references/configuration.md b/.agents/skills/typescript-pro/references/configuration.md
new file mode 100644
index 000000000..87574fbd4
--- /dev/null
+++ b/.agents/skills/typescript-pro/references/configuration.md
@@ -0,0 +1,445 @@
+# TypeScript Configuration
+
+## Strict Mode Configuration
+
+```json
+{
+  "compilerOptions": {
+    // Strict type checking
+    "strict": true,
+    "noImplicitAny": true,
+    "strictNullChecks": true,
+    "strictFunctionTypes": true,
+    "strictBindCallApply": true,
+    "strictPropertyInitialization": true,
+    "noImplicitThis": true,
+    "alwaysStrict": true,
+
+    // Additional checks
+    "noUnusedLocals": true,
+    "noUnusedParameters": true,
+    "noImplicitReturns": true,
+    "noFallthroughCasesInSwitch": true,
+    "noUncheckedIndexedAccess": true,
+    "noImplicitOverride": true,
+    "noPropertyAccessFromIndexSignature": true,
+
+    // Module resolution
+    "module": "ESNext",
+    "moduleResolution": "bundler",
+    "resolveJsonModule": true,
+    "allowImportingTsExtensions": true,
+
+    // Emit
+    "declaration": true,
+    "declarationMap": true,
+    "sourceMap": true,
+    "removeComments": false,
+    "importHelpers": true,
+
+    // Interop
+    "esModuleInterop": true,
+    "allowSyntheticDefaultImports": true,
+    "forceConsistentCasingInFileNames": true,
+
+    // Target
+    "target": "ES2022",
+    "lib": ["ES2022", "DOM", "DOM.Iterable"],
+
+    // Skip checking
+    "skipLibCheck": true
+  }
+}
+```
+
+## Project References
+
+```json
+// Root tsconfig.json
+{
+  "files": [],
+  "references": [
+    { "path": "./packages/shared" },
+    { "path": "./packages/frontend" },
+    { "path": "./packages/backend" }
+  ]
+}
+
+// packages/shared/tsconfig.json
+{
+  "compilerOptions": {
+    "composite": true,
+    "outDir": "./dist",
+    "rootDir": "./src",
+    "declaration": true,
+    "declarationMap": true
+  },
+  "include": ["src/**/*"]
+}
+
+// packages/frontend/tsconfig.json
+{
+  "compilerOptions": {
+    "composite": true,
+    "outDir": "./dist",
+    "rootDir": "./src"
+  },
+  "references": [
+    { "path": "../shared" }
+  ],
+  "include": ["src/**/*"]
+}
+```
+
+## Module Resolution Strategies
+
+```json
+// Node16/NodeNext (recommended for Node.js)
+{
+  "compilerOptions": {
+    "module": "NodeNext",
+    "moduleResolution": "NodeNext",
+    "esModuleInterop": true
+  }
+}
+
+// Bundler (for bundlers like Vite, esbuild)
+{
+  "compilerOptions": {
+    "module": "ESNext",
+    "moduleResolution": "bundler",
+    "allowImportingTsExtensions": true,
+    "moduleDetection": "force"
+  }
+}
+
+// Classic (legacy, avoid)
+{
+  "compilerOptions": {
+    "module": "CommonJS",
+    "moduleResolution": "node"
+  }
+}
+```
+
+## Path Mapping
+
+```json
+{
+  "compilerOptions": {
+    "baseUrl": ".",
+    "paths": {
+      "@/*": ["src/*"],
+      "@components/*": ["src/components/*"],
+      "@utils/*": ["src/utils/*"],
+      "@shared/*": ["../shared/src/*"],
+      "@types": ["src/types/index.ts"]
+    }
+  }
+}
+```
+
+```typescript
+// Usage with path mapping
+import { Button } from '@components/Button';
+import { formatDate } from '@utils/date';
+import type { User } from '@types';
+```
+
+## Incremental Compilation
+
+```json
+{
+  "compilerOptions": {
+    "incremental": true,
+    "tsBuildInfoFile": "./dist/.tsbuildinfo",
+    "composite": true
+  }
+}
+```
+
+## Declaration Files
+
+```json
+{
+  "compilerOptions": {
+    // Generate .d.ts files
+    "declaration": true,
+    "declarationMap": true,
+    "emitDeclarationOnly": false,
+
+    // Bundle declarations
+    "declarationDir": "./types",
+
+    // For libraries
+    "stripInternal": true
+  }
+}
+```
+
+```typescript
+// Using JSDoc for .d.ts generation
+/**
+ * Creates a user
+ * @param name - User's name
+ * @param email - User's email
+ * @returns The created user
+ * @example
+ * ```ts
+ * const user = createUser('John', 'john@example.com');
+ * ```
+ */
+export function createUser(name: string, email: string): User {
+  return { id: generateId(), name, email };
+}
+```
+
+## Build Optimization
+
+```json
+{
+  "compilerOptions": {
+    // Performance
+    "skipLibCheck": true,
+    "skipDefaultLibCheck": true,
+
+    // Faster builds
+    "incremental": true,
+    "assumeChangesOnlyAffectDirectDependencies": true,
+
+    // Smaller output
+    "removeComments": true,
+    "importHelpers": true,
+
+    // Tree shaking support
+    "module": "ESNext",
+    "target": "ES2020"
+  }
+}
+```
+
+## Multiple Configurations
+
+```json
+// tsconfig.json (base)
+{
+  "compilerOptions": {
+    "strict": true,
+    "target": "ES2022"
+  }
+}
+
+// tsconfig.build.json (production)
+{
+  "extends": "./tsconfig.json",
+  "compilerOptions": {
+    "sourceMap": false,
+    "removeComments": true,
+    "declaration": true
+  },
+  "exclude": ["**/*.test.ts", "**/*.spec.ts"]
+}
+
+// tsconfig.test.json (testing)
+{
+  "extends": "./tsconfig.json",
+  "compilerOptions": {
+    "types": ["jest", "node"],
+    "esModuleInterop": true
+  },
+  "include": ["src/**/*.test.ts", "src/**/*.spec.ts"]
+}
+```
+
+## Framework-Specific Configs
+
+```json
+// React + Vite
+{
+  "compilerOptions": {
+    "target": "ES2020",
+    "module": "ESNext",
+    "lib": ["ES2020", "DOM", "DOM.Iterable"],
+    "jsx": "react-jsx",
+    "moduleResolution": "bundler",
+    "allowImportingTsExtensions": true,
+    "resolveJsonModule": true,
+    "isolatedModules": true,
+    "noEmit": true,
+    "strict": true
+  }
+}
+
+// Next.js
+{
+  "compilerOptions": {
+    "target": "ES2022",
+    "lib": ["dom", "dom.iterable", "esnext"],
+    "allowJs": true,
+    "skipLibCheck": true,
+    "strict": true,
+    "forceConsistentCasingInFileNames": true,
+    "noEmit": true,
+    "esModuleInterop": true,
+    "module": "esnext",
+    "moduleResolution": "bundler",
+    "resolveJsonModule": true,
+    "isolatedModules": true,
+    "jsx": "preserve",
+    "incremental": true,
+    "plugins": [{ "name": "next" }],
+    "paths": { "@/*": ["./src/*"] }
+  },
+  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
+  "exclude": ["node_modules"]
+}
+
+// Node.js + Express
+{
+  "compilerOptions": {
+    "target": "ES2022",
+    "module": "NodeNext",
+    "moduleResolution": "NodeNext",
+    "lib": ["ES2022"],
+    "outDir": "./dist",
+    "rootDir": "./src",
+    "strict": true,
+    "esModuleInterop": true,
+    "skipLibCheck": true,
+    "forceConsistentCasingInFileNames": true,
+    "resolveJsonModule": true,
+    "declaration": true,
+    "sourceMap": true
+  }
+}
+```
+
+## Custom Type Definitions
+
+```typescript
+// src/types/global.d.ts
+declare global {
+  interface Window {
+    myApp: {
+      version: string;
+      config: AppConfig;
+    };
+  }
+
+  namespace NodeJS {
+    interface ProcessEnv {
+      DATABASE_URL: string;
+      API_KEY: string;
+      NODE_ENV: 'development' | 'production' | 'test';
+    }
+  }
+}
+
+export {};
+
+// src/types/modules.d.ts
+declare module '*.svg' {
+  const content: string;
+  export default content;
+}
+
+declare module '*.css' {
+  const classes: { [key: string]: string };
+  export default classes;
+}
+
+declare module 'untyped-library' {
+  export function doSomething(value: string): number;
+}
+```
+
+## Compiler API Usage
+
+```typescript
+// programmatic compilation
+import ts from 'typescript';
+
+function compile(fileNames: string[], options: ts.CompilerOptions): void {
+  const program = ts.createProgram(fileNames, options);
+  const emitResult = program.emit();
+
+  const allDiagnostics = ts
+    .getPreEmitDiagnostics(program)
+    .concat(emitResult.diagnostics);
+
+  allDiagnostics.forEach(diagnostic => {
+    if (diagnostic.file) {
+      const { line, character } = ts.getLineAndCharacterOfPosition(
+        diagnostic.file,
+        diagnostic.start!
+      );
+      const message = ts.flattenDiagnosticMessageText(
+        diagnostic.messageText,
+        '\n'
+      );
+      console.log(
+        `${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`
+      );
+    } else {
+      console.log(
+        ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')
+      );
+    }
+  });
+
+  const exitCode = emitResult.emitSkipped ? 1 : 0;
+  console.log(`Process exiting with code '${exitCode}'.`);
+  process.exit(exitCode);
+}
+
+compile(['src/index.ts'], {
+  noEmitOnError: true,
+  target: ts.ScriptTarget.ES2022,
+  module: ts.ModuleKind.ES2022,
+  strict: true
+});
+```
+
+## Performance Monitoring
+
+```json
+{
+  "compilerOptions": {
+    "diagnostics": true,
+    "extendedDiagnostics": true,
+    "generateCpuProfile": "profile.cpuprofile",
+    "explainFiles": true
+  }
+}
+```
+
+```bash
+# Run with diagnostics
+tsc --diagnostics
+
+# Extended diagnostics
+tsc --extendedDiagnostics
+
+# Generate trace
+tsc --generateTrace trace
+
+# Analyze with @typescript/analyze-trace
+npx @typescript/analyze-trace trace
+```
+
+## Quick Reference
+
+| Option | Purpose |
+|--------|---------|
+| `strict` | Enable all strict checks |
+| `composite` | Enable project references |
+| `incremental` | Enable incremental compilation |
+| `skipLibCheck` | Skip .d.ts checking for faster builds |
+| `esModuleInterop` | Better CommonJS interop |
+| `moduleResolution` | How modules are resolved |
+| `paths` | Path mapping for imports |
+| `declaration` | Generate .d.ts files |
+| `sourceMap` | Generate source maps |
+| `noEmit` | Don't emit output (type check only) |
+| `isolatedModules` | Each file can be transpiled separately |
+| `allowImportingTsExtensions` | Import .ts files directly |
diff --git a/.agents/skills/typescript-pro/references/patterns.md b/.agents/skills/typescript-pro/references/patterns.md
new file mode 100644
index 000000000..d88258d8b
--- /dev/null
+++ b/.agents/skills/typescript-pro/references/patterns.md
@@ -0,0 +1,484 @@
+# TypeScript Patterns
+
+## Builder Pattern
+
+```typescript
+// Type-safe builder with progressive types
+class UserBuilder {
+  private data: Partial<User> = {};
+
+  setName(name: string): this {
+    this.data.name = name;
+    return this;
+  }
+
+  setEmail(email: string): this {
+    this.data.email = email;
+    return this;
+  }
+
+  setAge(age: number): this {
+    this.data.age = age;
+    return this;
+  }
+
+  build(): User {
+    if (!this.data.name || !this.data.email) {
+      throw new Error('Name and email are required');
+    }
+    return this.data as User;
+  }
+}
+
+// Fluent API with type safety
+const user = new UserBuilder()
+  .setName('John')
+  .setEmail('john@example.com')
+  .setAge(30)
+  .build();
+
+// Advanced builder with compile-time validation
+type Builder<T, K extends keyof T = never> = {
+  [P in keyof T as `set${Capitalize<string & P>}`]: (
+    value: T[P]
+  ) => Builder<T, K | P>;
+} & {
+  build: K extends keyof T ? () => T : never;
+};
+
+function createBuilder<T>(): Builder<T> {
+  const data = {} as T;
+
+  return new Proxy({} as Builder<T>, {
+    get(_, prop: string) {
+      if (prop === 'build') {
+        return () => data;
+      }
+      if (prop.startsWith('set')) {
+        const key = prop.slice(3).toLowerCase();
+        return (value: any) => {
+          (data as any)[key] = value;
+          return this;
+        };
+      }
+    }
+  });
+}
+```
+
+## Factory Pattern
+
+```typescript
+// Abstract factory with type safety
+interface Logger {
+  log(message: string): void;
+}
+
+class ConsoleLogger implements Logger {
+  log(message: string): void {
+    console.log(message);
+  }
+}
+
+class FileLogger implements Logger {
+  constructor(private filename: string) {}
+
+  log(message: string): void {
+    // Write to file
+  }
+}
+
+type LoggerType = 'console' | 'file';
+type LoggerConfig<T extends LoggerType> = T extends 'file'
+  ? { type: T; filename: string }
+  : { type: T };
+
+class LoggerFactory {
+  static create<T extends LoggerType>(config: LoggerConfig<T>): Logger {
+    switch (config.type) {
+      case 'console':
+        return new ConsoleLogger();
+      case 'file':
+        return new FileLogger(config.filename);
+      default:
+        throw new Error('Unknown logger type');
+    }
+  }
+}
+
+const consoleLogger = LoggerFactory.create({ type: 'console' });
+const fileLogger = LoggerFactory.create({ type: 'file', filename: 'app.log' });
+
+// Generic factory with dependency injection
+type Constructor<T> = new (...args: any[]) => T;
+
+class Container {
+  private instances = new Map<Constructor<any>, any>();
+
+  register<T>(token: Constructor<T>, instance: T): void {
+    this.instances.set(token, instance);
+  }
+
+  resolve<T>(token: Constructor<T>): T {
+    const instance = this.instances.get(token);
+    if (!instance) {
+      throw new Error(`No instance registered for ${token.name}`);
+    }
+    return instance;
+  }
+}
+```
+
+## Repository Pattern
+
+```typescript
+// Type-safe repository with generic CRUD
+interface Entity {
+  id: string | number;
+}
+
+interface Repository<T extends Entity> {
+  find(id: T['id']): Promise<T | null>;
+  findAll(): Promise<T[]>;
+  create(data: Omit<T, 'id'>): Promise<T>;
+  update(id: T['id'], data: Partial<Omit<T, 'id'>>): Promise<T>;
+  delete(id: T['id']): Promise<void>;
+}
+
+class UserRepository implements Repository<User> {
+  async find(id: User['id']): Promise<User | null> {
+    // Database query
+    return null;
+  }
+
+  async findAll(): Promise<User[]> {
+    return [];
+  }
+
+  async create(data: Omit<User, 'id'>): Promise<User> {
+    // Insert into database
+    return { id: 1, ...data };
+  }
+
+  async update(id: User['id'], data: Partial<Omit<User, 'id'>>): Promise<User> {
+    // Update database
+    return { id, name: '', email: '', ...data };
+  }
+
+  async delete(id: User['id']): Promise<void> {
+    // Delete from database
+  }
+}
+
+// Query builder with type safety
+class QueryBuilder<T> {
+  private conditions: Array<(item: T) => boolean> = [];
+
+  where<K extends keyof T>(key: K, value: T[K]): this {
+    this.conditions.push(item => item[key] === value);
+    return this;
+  }
+
+  execute(items: T[]): T[] {
+    return items.filter(item =>
+      this.conditions.every(condition => condition(item))
+    );
+  }
+}
+
+const query = new QueryBuilder<User>()
+  .where('email', 'john@example.com')
+  .where('age', 30);
+```
+
+## Type-Safe API Client
+
+```typescript
+// REST API client with type safety
+type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
+
+type ApiEndpoints = {
+  '/users': {
+    GET: { response: User[] };
+    POST: { body: CreateUserDto; response: User };
+  };
+  '/users/:id': {
+    GET: { params: { id: string }; response: User };
+    PUT: { params: { id: string }; body: UpdateUserDto; response: User };
+    DELETE: { params: { id: string }; response: void };
+  };
+  '/posts': {
+    GET: { query: { userId?: string }; response: Post[] };
+    POST: { body: CreatePostDto; response: Post };
+  };
+};
+
+type ExtractParams<T extends string> =
+  T extends `${infer _Start}/:${infer Param}/${infer Rest}`
+    ? { [K in Param]: string } & ExtractParams<`/${Rest}`>
+    : T extends `${infer _Start}/:${infer Param}`
+    ? { [K in Param]: string }
+    : {};
+
+class ApiClient {
+  async request<
+    Path extends keyof ApiEndpoints,
+    Method extends keyof ApiEndpoints[Path]
+  >(
+    method: Method,
+    path: Path,
+    options?: ApiEndpoints[Path][Method] extends { body: infer B }
+      ? { body: B }
+      : ApiEndpoints[Path][Method] extends { params: infer P }
+      ? { params: P }
+      : ApiEndpoints[Path][Method] extends { query: infer Q }
+      ? { query: Q }
+      : never
+  ): Promise<
+    ApiEndpoints[Path][Method] extends { response: infer R } ? R : never
+  > {
+    // Make HTTP request
+    return null as any;
+  }
+}
+
+const client = new ApiClient();
+
+// Type-safe API calls
+const users = await client.request('GET', '/users');
+const user = await client.request('GET', '/users/:id', { params: { id: '1' } });
+const newUser = await client.request('POST', '/users', {
+  body: { name: 'John', email: 'john@example.com' }
+});
+```
+
+## State Machine Pattern
+
+```typescript
+// Type-safe state machine
+type State = 'idle' | 'loading' | 'success' | 'error';
+
+type Event =
+  | { type: 'FETCH' }
+  | { type: 'SUCCESS'; data: any }
+  | { type: 'ERROR'; error: Error }
+  | { type: 'RETRY' };
+
+type StateMachine = {
+  [S in State]: {
+    [E in Event['type']]?: State;
+  };
+};
+
+const machine: StateMachine = {
+  idle: { FETCH: 'loading' },
+  loading: { SUCCESS: 'success', ERROR: 'error' },
+  success: { FETCH: 'loading' },
+  error: { RETRY: 'loading' }
+};
+
+class StateManager<S extends string, E extends { type: string }> {
+  constructor(
+    private state: S,
+    private transitions: Record<S, Partial<Record<E['type'], S>>>
+  ) {}
+
+  getState(): S {
+    return this.state;
+  }
+
+  dispatch(event: E): S {
+    const nextState = this.transitions[this.state][event.type];
+    if (nextState === undefined) {
+      throw new Error(`Invalid transition from ${this.state} on ${event.type}`);
+    }
+    this.state = nextState;
+    return this.state;
+  }
+}
+
+const manager = new StateManager<State, Event>('idle', machine);
+manager.dispatch({ type: 'FETCH' }); // 'loading'
+manager.dispatch({ type: 'SUCCESS', data: {} }); // 'success'
+```
+
+## Decorator Pattern
+
+```typescript
+// Method decorators with type safety
+function Log(
+  target: any,
+  propertyKey: string,
+  descriptor: PropertyDescriptor
+) {
+  const originalMethod = descriptor.value;
+
+  descriptor.value = function (...args: any[]) {
+    console.log(`Calling ${propertyKey} with`, args);
+    const result = originalMethod.apply(this, args);
+    console.log(`Result:`, result);
+    return result;
+  };
+
+  return descriptor;
+}
+
+function Memoize(
+  target: any,
+  propertyKey: string,
+  descriptor: PropertyDescriptor
+) {
+  const originalMethod = descriptor.value;
+  const cache = new Map<string, any>();
+
+  descriptor.value = function (...args: any[]) {
+    const key = JSON.stringify(args);
+    if (cache.has(key)) {
+      return cache.get(key);
+    }
+    const result = originalMethod.apply(this, args);
+    cache.set(key, result);
+    return result;
+  };
+
+  return descriptor;
+}
+
+class Calculator {
+  @Log
+  @Memoize
+  fibonacci(n: number): number {
+    if (n <= 1) return n;
+    return this.fibonacci(n - 1) + this.fibonacci(n - 2);
+  }
+}
+```
+
+## Result/Either Pattern
+
+```typescript
+// Type-safe error handling
+type Result<T, E = Error> =
+  | { success: true; value: T }
+  | { success: false; error: E };
+
+function ok<T>(value: T): Result<T, never> {
+  return { success: true, value };
+}
+
+function err<E>(error: E): Result<never, E> {
+  return { success: false, error };
+}
+
+async function fetchUser(id: string): Promise<Result<User, string>> {
+  try {
+    const response = await fetch(`/api/users/${id}`);
+    if (!response.ok) {
+      return err('User not found');
+    }
+    const user = await response.json();
+    return ok(user);
+  } catch (error) {
+    return err('Network error');
+  }
+}
+
+// Usage with pattern matching
+const result = await fetchUser('123');
+if (result.success) {
+  console.log(result.value.name); // Type-safe access
+} else {
+  console.error(result.error); // Type-safe error
+}
+
+// Either monad
+class Either<L, R> {
+  private constructor(
+    private readonly value: L | R,
+    private readonly isRight: boolean
+  ) {}
+
+  static left<L, R>(value: L): Either<L, R> {
+    return new Either<L, R>(value, false);
+  }
+
+  static right<L, R>(value: R): Either<L, R> {
+    return new Either<L, R>(value, true);
+  }
+
+  map<T>(fn: (value: R) => T): Either<L, T> {
+    if (this.isRight) {
+      return Either.right(fn(this.value as R));
+    }
+    return Either.left(this.value as L);
+  }
+
+  flatMap<T>(fn: (value: R) => Either<L, T>): Either<L, T> {
+    if (this.isRight) {
+      return fn(this.value as R);
+    }
+    return Either.left(this.value as L);
+  }
+
+  getOrElse(defaultValue: R): R {
+    return this.isRight ? (this.value as R) : defaultValue;
+  }
+}
+```
+
+## Singleton Pattern
+
+```typescript
+// Type-safe singleton
+class Database {
+  private static instance: Database;
+  private constructor() {
+    // Private constructor prevents instantiation
+  }
+
+  static getInstance(): Database {
+    if (!Database.instance) {
+      Database.instance = new Database();
+    }
+    return Database.instance;
+  }
+
+  query<T>(sql: string): Promise<T[]> {
+    // Execute query
+    return Promise.resolve([]);
+  }
+}
+
+const db = Database.getInstance();
+
+// Generic singleton factory
+function singleton<T>(factory: () => T): () => T {
+  let instance: T | undefined;
+  return () => {
+    if (!instance) {
+      instance = factory();
+    }
+    return instance;
+  };
+}
+
+const getConfig = singleton(() => ({
+  apiUrl: process.env.API_URL,
+  apiKey: process.env.API_KEY
+}));
+```
+
+## Quick Reference
+
+| Pattern | Use Case |
+|---------|----------|
+| Builder | Construct complex objects step by step |
+| Factory | Create objects without specifying exact class |
+| Repository | Abstract data access layer |
+| API Client | Type-safe HTTP requests |
+| State Machine | Manage state transitions |
+| Decorator | Add behavior to methods |
+| Result/Either | Type-safe error handling |
+| Singleton | Ensure single instance |
+| Query Builder | Type-safe database queries |
+| Container | Dependency injection |
diff --git a/.agents/skills/typescript-pro/references/type-guards.md b/.agents/skills/typescript-pro/references/type-guards.md
new file mode 100644
index 000000000..f45469f9c
--- /dev/null
+++ b/.agents/skills/typescript-pro/references/type-guards.md
@@ -0,0 +1,352 @@
+# Type Guards and Narrowing
+
+## Type Predicates
+
+```typescript
+// Basic type predicate
+function isString(value: unknown): value is string {
+  return typeof value === 'string';
+}
+
+function processValue(value: string | number) {
+  if (isString(value)) {
+    console.log(value.toUpperCase()); // value is string
+  } else {
+    console.log(value.toFixed(2)); // value is number
+  }
+}
+
+// Generic type predicate
+function isArray<T>(value: T | T[]): value is T[] {
+  return Array.isArray(value);
+}
+
+// Narrowing to specific interface
+interface User {
+  type: 'user';
+  name: string;
+  email: string;
+}
+
+interface Admin {
+  type: 'admin';
+  name: string;
+  permissions: string[];
+}
+
+function isAdmin(account: User | Admin): account is Admin {
+  return account.type === 'admin';
+}
+```
+
+## Discriminated Unions
+
+```typescript
+// Tagged union pattern
+type Result<T, E = Error> =
+  | { status: 'success'; data: T }
+  | { status: 'error'; error: E }
+  | { status: 'loading' };
+
+function handleResult<T>(result: Result<T>) {
+  switch (result.status) {
+    case 'success':
+      console.log(result.data); // Narrowed to success
+      break;
+    case 'error':
+      console.error(result.error); // Narrowed to error
+      break;
+    case 'loading':
+      console.log('Loading...'); // Narrowed to loading
+      break;
+  }
+}
+
+// Complex discriminated union
+type Shape =
+  | { kind: 'circle'; radius: number }
+  | { kind: 'rectangle'; width: number; height: number }
+  | { kind: 'triangle'; base: number; height: number };
+
+function getArea(shape: Shape): number {
+  switch (shape.kind) {
+    case 'circle':
+      return Math.PI * shape.radius ** 2;
+    case 'rectangle':
+      return shape.width * shape.height;
+    case 'triangle':
+      return (shape.base * shape.height) / 2;
+  }
+}
+
+// Exhaustive checking
+function assertNever(x: never): never {
+  throw new Error('Unexpected value: ' + x);
+}
+
+function processShape(shape: Shape): number {
+  switch (shape.kind) {
+    case 'circle':
+      return shape.radius;
+    case 'rectangle':
+      return shape.width;
+    case 'triangle':
+      return shape.base;
+    default:
+      return assertNever(shape); // Compile error if not exhaustive
+  }
+}
+```
+
+## Built-in Type Guards
+
+```typescript
+// typeof narrowing
+function printValue(value: string | number | boolean) {
+  if (typeof value === 'string') {
+    console.log(value.toUpperCase());
+  } else if (typeof value === 'number') {
+    console.log(value.toFixed(2));
+  } else {
+    console.log(value ? 'yes' : 'no');
+  }
+}
+
+// instanceof narrowing
+class Dog {
+  bark() { console.log('woof'); }
+}
+
+class Cat {
+  meow() { console.log('meow'); }
+}
+
+function makeSound(animal: Dog | Cat) {
+  if (animal instanceof Dog) {
+    animal.bark();
+  } else {
+    animal.meow();
+  }
+}
+
+// in operator narrowing
+type Fish = { swim: () => void };
+type Bird = { fly: () => void };
+
+function move(animal: Fish | Bird) {
+  if ('swim' in animal) {
+    animal.swim();
+  } else {
+    animal.fly();
+  }
+}
+
+// Truthiness narrowing
+function printLength(value: string | null | undefined) {
+  if (value) {
+    console.log(value.length); // Narrowed to string
+  }
+}
+
+// Equality narrowing
+function compare(x: string | number, y: string | boolean) {
+  if (x === y) {
+    // x and y are both string
+    console.log(x.toUpperCase(), y.toUpperCase());
+  }
+}
+```
+
+## Assertion Functions
+
+```typescript
+// Basic assertion function
+function assert(condition: unknown, message?: string): asserts condition {
+  if (!condition) {
+    throw new Error(message || 'Assertion failed');
+  }
+}
+
+function processUser(user: unknown) {
+  assert(typeof user === 'object' && user !== null);
+  assert('name' in user && typeof user.name === 'string');
+  console.log(user.name.toUpperCase()); // user is narrowed
+}
+
+// Type assertion function
+function assertIsString(value: unknown): asserts value is string {
+  if (typeof value !== 'string') {
+    throw new Error('Value is not a string');
+  }
+}
+
+function greet(name: unknown) {
+  assertIsString(name);
+  console.log(`Hello, ${name.toUpperCase()}`); // name is string
+}
+
+// Generic assertion function
+function assertIsDefined<T>(value: T): asserts value is NonNullable<T> {
+  if (value === null || value === undefined) {
+    throw new Error('Value is null or undefined');
+  }
+}
+
+function processValue(value: string | null) {
+  assertIsDefined(value);
+  console.log(value.length); // value is string
+}
+
+// Assert with type predicate
+function assertIsUser(value: unknown): asserts value is User {
+  if (
+    typeof value !== 'object' ||
+    value === null ||
+    !('type' in value) ||
+    value.type !== 'user'
+  ) {
+    throw new Error('Not a user');
+  }
+}
+```
+
+## Control Flow Analysis
+
+```typescript
+// Assignment narrowing
+let x: string | number = Math.random() > 0.5 ? 'hello' : 42;
+
+if (typeof x === 'string') {
+  x; // string
+} else {
+  x; // number
+}
+
+// Return statement narrowing
+function getValue(flag: boolean): string | number {
+  if (flag) {
+    return 'hello';
+  }
+  return 42; // TypeScript knows this must be number
+}
+
+// Throw statement narrowing
+function processValue(value: string | null) {
+  if (!value) {
+    throw new Error('Value is required');
+  }
+  console.log(value.length); // value is string (null thrown above)
+}
+
+// Type guards in array methods
+const mixed: (string | number)[] = ['a', 1, 'b', 2];
+const strings = mixed.filter((x): x is string => typeof x === 'string');
+// strings is string[]
+```
+
+## Branded Types
+
+```typescript
+// Nominal typing with branded types
+type Brand<K, T> = K & { __brand: T };
+
+type UserId = Brand<string, 'UserId'>;
+type Email = Brand<string, 'Email'>;
+type Url = Brand<string, 'Url'>;
+
+// Constructor functions
+function createUserId(id: string): UserId {
+  return id as UserId;
+}
+
+function createEmail(email: string): Email {
+  if (!email.includes('@')) {
+    throw new Error('Invalid email');
+  }
+  return email as Email;
+}
+
+// Usage prevents mixing
+const userId: UserId = createUserId('user-123');
+const email: Email = createEmail('user@example.com');
+
+// const wrongAssignment: UserId = email; // Error!
+
+// Type guard for branded types
+function isUserId(value: string): value is UserId {
+  return /^user-\d+$/.test(value);
+}
+
+// Branded numbers
+type Positive = Brand<number, 'Positive'>;
+type Integer = Brand<number, 'Integer'>;
+
+function createPositive(n: number): Positive {
+  if (n <= 0) throw new Error('Must be positive');
+  return n as Positive;
+}
+
+function createInteger(n: number): Integer {
+  if (!Number.isInteger(n)) throw new Error('Must be integer');
+  return n as Integer;
+}
+```
+
+## Advanced Narrowing Patterns
+
+```typescript
+// Array.isArray with generics
+function processInput<T>(input: T | T[]): T[] {
+  return Array.isArray(input) ? input : [input];
+}
+
+// Object key narrowing
+function getProperty<T extends object, K extends keyof T>(
+  obj: T,
+  key: K
+): T[K] {
+  return obj[key];
+}
+
+// Mapped type narrowing
+type Nullable<T> = { [K in keyof T]: T[K] | null };
+
+function isComplete<T extends object>(
+  obj: Nullable<T>
+): obj is T {
+  return Object.values(obj).every((v) => v !== null);
+}
+
+// Custom narrowing with type maps
+type TypeMap = {
+  string: string;
+  number: number;
+  boolean: boolean;
+};
+
+function is<K extends keyof TypeMap>(
+  type: K,
+  value: unknown
+): value is TypeMap[K] {
+  return typeof value === type;
+}
+
+if (is('string', someValue)) {
+  someValue.toUpperCase(); // someValue is string
+}
+```
+
+## Quick Reference
+
+| Pattern | Use Case |
+|---------|----------|
+| `value is Type` | Type predicate function |
+| `asserts condition` | Assertion function |
+| `asserts value is Type` | Type assertion function |
+| Discriminated union | Tagged union with literal type |
+| `typeof` guard | Primitive type checking |
+| `instanceof` guard | Class instance checking |
+| `in` operator | Property existence check |
+| `assertNever` | Exhaustive switch checking |
+| Branded types | Nominal typing simulation |
+| `NonNullable<T>` | Remove null/undefined |
diff --git a/.agents/skills/typescript-pro/references/utility-types.md b/.agents/skills/typescript-pro/references/utility-types.md
new file mode 100644
index 000000000..5c59c8c98
--- /dev/null
+++ b/.agents/skills/typescript-pro/references/utility-types.md
@@ -0,0 +1,329 @@
+# Utility Types
+
+## Built-in Utility Types
+
+```typescript
+// Partial - All properties optional
+interface User {
+  id: number;
+  name: string;
+  email: string;
+}
+
+type PartialUser = Partial<User>;
+// { id?: number; name?: string; email?: string; }
+
+function updateUser(id: number, updates: Partial<User>) {
+  // Only pass fields to update
+}
+
+// Required - All properties required
+type RequiredUser = Required<PartialUser>;
+// { id: number; name: string; email: string; }
+
+// Readonly - All properties readonly
+type ReadonlyUser = Readonly<User>;
+// { readonly id: number; readonly name: string; readonly email: string; }
+
+// Pick - Select specific properties
+type UserSummary = Pick<User, 'id' | 'name'>;
+// { id: number; name: string; }
+
+// Omit - Exclude specific properties
+type UserWithoutEmail = Omit<User, 'email'>;
+// { id: number; name: string; }
+
+// Record - Create object type with specific keys
+type UserRoles = Record<string, 'admin' | 'user' | 'guest'>;
+// { [key: string]: 'admin' | 'user' | 'guest' }
+
+type PageInfo = Record<'home' | 'about' | 'contact', { title: string }>;
+// { home: { title: string }, about: { title: string }, contact: { title: string } }
+```
+
+## Type Extraction Utilities
+
+```typescript
+// Extract - Extract types from union
+type AllTypes = 'a' | 'b' | 'c' | 1 | 2 | 3;
+type StringTypes = Extract<AllTypes, string>; // 'a' | 'b' | 'c'
+type NumberTypes = Extract<AllTypes, number>; // 1 | 2 | 3
+
+// Exclude - Remove types from union
+type WithoutNumbers = Exclude<AllTypes, number>; // 'a' | 'b' | 'c'
+
+// NonNullable - Remove null and undefined
+type MaybeString = string | null | undefined;
+type DefiniteString = NonNullable<MaybeString>; // string
+
+// ReturnType - Extract function return type
+function getUser() {
+  return { id: 1, name: 'John' };
+}
+
+type User = ReturnType<typeof getUser>; // { id: number; name: string }
+
+// Parameters - Extract function parameter types
+function createUser(name: string, age: number) {
+  return { name, age };
+}
+
+type CreateUserParams = Parameters<typeof createUser>; // [string, number]
+
+// ConstructorParameters - Extract constructor parameters
+class Point {
+  constructor(public x: number, public y: number) {}
+}
+
+type PointParams = ConstructorParameters<typeof Point>; // [number, number]
+
+// InstanceType - Extract instance type from constructor
+type PointInstance = InstanceType<typeof Point>; // Point
+```
+
+## Custom Utility Types
+
+```typescript
+// DeepPartial - Recursive partial
+type DeepPartial<T> = T extends object ? {
+  [K in keyof T]?: DeepPartial<T[K]>;
+} : T;
+
+interface Config {
+  database: {
+    host: string;
+    port: number;
+    credentials: {
+      username: string;
+      password: string;
+    };
+  };
+}
+
+type PartialConfig = DeepPartial<Config>;
+// All nested properties are optional
+
+// DeepReadonly - Recursive readonly
+type DeepReadonly<T> = T extends object ? {
+  readonly [K in keyof T]: DeepReadonly<T[K]>;
+} : T;
+
+// Mutable - Remove readonly
+type Mutable<T> = {
+  -readonly [K in keyof T]: T[K];
+};
+
+type MutableUser = Mutable<ReadonlyUser>;
+
+// PickByType - Pick properties by value type
+type PickByType<T, U> = {
+  [K in keyof T as T[K] extends U ? K : never]: T[K];
+};
+
+interface Mixed {
+  id: number;
+  name: string;
+  age: number;
+  email: string;
+}
+
+type StringProps = PickByType<Mixed, string>; // { name: string; email: string }
+type NumberProps = PickByType<Mixed, number>; // { id: number; age: number }
+
+// OmitByType - Omit properties by value type
+type OmitByType<T, U> = {
+  [K in keyof T as T[K] extends U ? never : K]: T[K];
+};
+
+type NoStrings = OmitByType<Mixed, string>; // { id: number; age: number }
+```
+
+## Function Utilities
+
+```typescript
+// Promisify - Convert sync to async
+type Promisify<T extends (...args: any[]) => any> = (
+  ...args: Parameters<T>
+) => Promise<ReturnType<T>>;
+
+function syncFunction(x: number): string {
+  return x.toString();
+}
+
+type AsyncVersion = Promisify<typeof syncFunction>;
+// (x: number) => Promise<string>
+
+// Awaited - Unwrap promise type
+type AwaitedString = Awaited<Promise<string>>; // string
+type DeepAwaited = Awaited<Promise<Promise<number>>>; // number
+
+// ThisParameterType - Extract this parameter
+function greet(this: User, message: string) {
+  return `${this.name}: ${message}`;
+}
+
+type ThisType = ThisParameterType<typeof greet>; // User
+
+// OmitThisParameter - Remove this parameter
+type GreetFunction = OmitThisParameter<typeof greet>;
+// (message: string) => string
+```
+
+## Advanced Custom Utilities
+
+```typescript
+// Nullable - Add null and undefined
+type Nullable<T> = T | null | undefined;
+
+// ValueOf - Get union of all property values
+type ValueOf<T> = T[keyof T];
+
+interface Codes {
+  success: 200;
+  notFound: 404;
+  error: 500;
+}
+
+type StatusCode = ValueOf<Codes>; // 200 | 404 | 500
+
+// RequireAtLeastOne - Require at least one property
+type RequireAtLeastOne<T, Keys extends keyof T = keyof T> =
+  Pick<T, Exclude<keyof T, Keys>> &
+  {
+    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
+  }[Keys];
+
+interface Options {
+  id?: number;
+  name?: string;
+  email?: string;
+}
+
+type AtLeastOne = RequireAtLeastOne<Options>;
+// Must have at least one of id, name, or email
+
+// RequireOnlyOne - Require exactly one property
+type RequireOnlyOne<T, Keys extends keyof T = keyof T> =
+  Pick<T, Exclude<keyof T, Keys>> &
+  {
+    [K in Keys]-?:
+      Required<Pick<T, K>> &
+      Partial<Record<Exclude<Keys, K>, undefined>>;
+  }[Keys];
+
+type OnlyOne = RequireOnlyOne<Options>;
+// Must have exactly one of id, name, or email
+
+// Merge - Deep merge two types
+type Merge<T, U> = Omit<T, keyof U> & U;
+
+interface Base {
+  id: number;
+  name: string;
+}
+
+interface Extension {
+  name: string; // Override
+  email: string; // Add
+}
+
+type Combined = Merge<Base, Extension>;
+// { id: number; name: string; email: string }
+
+// ConditionalKeys - Get keys matching condition
+type ConditionalKeys<T, Condition> = {
+  [K in keyof T]: T[K] extends Condition ? K : never;
+}[keyof T];
+
+type FunctionKeys = ConditionalKeys<typeof Math, Function>;
+// 'abs' | 'acos' | 'sin' | ...
+```
+
+## Tuple Utilities
+
+```typescript
+// First - Get first element type
+type First<T extends any[]> = T extends [infer F, ...any[]] ? F : never;
+
+type FirstType = First<[string, number, boolean]>; // string
+
+// Last - Get last element type
+type Last<T extends any[]> = T extends [...any[], infer L] ? L : never;
+
+type LastType = Last<[string, number, boolean]>; // boolean
+
+// Tail - Remove first element
+type Tail<T extends any[]> = T extends [any, ...infer Rest] ? Rest : never;
+
+type TailTypes = Tail<[string, number, boolean]>; // [number, boolean]
+
+// Prepend - Add element to beginning
+type Prepend<T extends any[], U> = [U, ...T];
+
+type WithString = Prepend<[number, boolean], string>; // [string, number, boolean]
+
+// Reverse - Reverse tuple
+type Reverse<T extends any[]> =
+  T extends [infer First, ...infer Rest]
+    ? [...Reverse<Rest>, First]
+    : [];
+
+type Reversed = Reverse<[1, 2, 3]>; // [3, 2, 1]
+```
+
+## String Utilities
+
+```typescript
+// Split - Split string into tuple
+type Split<S extends string, D extends string> =
+  S extends `${infer T}${D}${infer U}`
+    ? [T, ...Split<U, D>]
+    : [S];
+
+type Parts = Split<'a-b-c', '-'>; // ['a', 'b', 'c']
+
+// Join - Join tuple into string
+type Join<T extends string[], D extends string> =
+  T extends [infer F extends string, ...infer R extends string[]]
+    ? R extends []
+      ? F
+      : `${F}${D}${Join<R, D>}`
+    : '';
+
+type Joined = Join<['a', 'b', 'c'], '-'>; // 'a-b-c'
+
+// Replace - Replace substring
+type Replace<
+  S extends string,
+  From extends string,
+  To extends string
+> = S extends `${infer L}${From}${infer R}`
+  ? `${L}${To}${R}`
+  : S;
+
+type Replaced = Replace<'hello world', 'world', 'TypeScript'>;
+// 'hello TypeScript'
+
+// TrimLeft - Remove leading whitespace
+type TrimLeft<S extends string> =
+  S extends ` ${infer Rest}` ? TrimLeft<Rest> : S;
+
+type Trimmed = TrimLeft<'  hello'>; // 'hello'
+```
+
+## Quick Reference
+
+| Utility | Purpose |
+|---------|---------|
+| `Partial<T>` | Make all properties optional |
+| `Required<T>` | Make all properties required |
+| `Readonly<T>` | Make all properties readonly |
+| `Pick<T, K>` | Select subset of properties |
+| `Omit<T, K>` | Remove subset of properties |
+| `Record<K, T>` | Create object type with keys K |
+| `Extract<T, U>` | Extract types assignable to U |
+| `Exclude<T, U>` | Remove types assignable to U |
+| `NonNullable<T>` | Remove null and undefined |
+| `ReturnType<T>` | Extract function return type |
+| `Parameters<T>` | Extract function parameters |
+| `Awaited<T>` | Unwrap Promise type |
diff --git a/.agents/skills/vitest/GENERATION.md b/.agents/skills/vitest/GENERATION.md
new file mode 100644
index 000000000..4dba9c6a8
--- /dev/null
+++ b/.agents/skills/vitest/GENERATION.md
@@ -0,0 +1,5 @@
+# Generation Info
+
+- **Source:** `sources/vitest`
+- **Git SHA:** `a5022655de04ec3581026dac16b11251e4b6d40d`
+- **Generated:** 2026-10-23
diff --git a/.agents/skills/vitest/SKILL.md b/.agents/skills/vitest/SKILL.md
new file mode 100644
index 000000000..605bd03cc
--- /dev/null
+++ b/.agents/skills/vitest/SKILL.md
@@ -0,0 +1,55 @@
+---
+name: vitest
+description: Vitest fast unit testing framework powered by Vite with Jest-compatible API. Use when writing tests, mocking, configuring coverage, or working with test filtering and fixtures.
+metadata:
+  author: Anthony Fu
+  version: "2026.10.23"
+  source: Generated from https://github.com/vitest-dev/vitest, scripts located at https://github.com/antfu/skills
+---
+
+Vitest is a next-generation testing framework powered by Vite. It provides a Jest-compatible API with native ESM, TypeScript, and JSX support out of the box. Vitest shares the same config, transformers, resolvers, and plugins with your Vite app.
+
+**Key Features:**
+- Vite-native: Uses Vite's transformation pipeline for fast HMR-like test updates
+- Jest-compatible: Drop-in replacement for most Jest test suites
+- Smart watch mode: Only reruns affected tests based on module graph
+- Native ESM, TypeScript, JSX support without configuration
+- Multi-threaded workers for parallel test execution
+- Built-in coverage via V8 or Istanbul
+- Snapshot testing, mocking, and spy utilities
+
+> The skill is based on Vitest 5.1.0-beta.1, generated at 2026-10-23.
+
+## Core
+
+| Topic | Description | Reference |
+|-------|-------------|-----------|
+| Configuration | Vitest and Vite config integration, defineConfig usage | [core-config](references/core-config.md) |
+| CLI | Command line interface, commands and options | [core-cli](references/core-cli.md) |
+| Test API | test/it function, modifiers like skip, only, concurrent | [core-test-api](references/core-test-api.md) |
+| Describe API | describe/suite for grouping tests and nested suites | [core-describe](references/core-describe.md) |
+| Expect API | Assertions with toBe, toEqual, matchers and asymmetric matchers | [core-expect](references/core-expect.md) |
+| Hooks | beforeEach, afterEach, beforeAll, afterAll, aroundEach | [core-hooks](references/core-hooks.md) |
+
+## Features
+
+| Topic | Description | Reference |
+|-------|-------------|-----------|
+| Mocking | Mock functions, modules, timers, dates with vi utilities | [features-mocking](references/features-mocking.md) |
+| Snapshots | Snapshot testing with toMatchSnapshot and inline snapshots | [features-snapshots](references/features-snapshots.md) |
+| Coverage | Code coverage with V8 or Istanbul providers | [features-coverage](references/features-coverage.md) |
+| Test Context | Test fixtures, context.expect, test.extend for custom fixtures | [features-context](references/features-context.md) |
+| Concurrency | Concurrent tests, parallel execution, sharding | [features-concurrency](references/features-concurrency.md) |
+| Filtering | Filter tests by name, file patterns, tags | [features-filtering](references/features-filtering.md) |
+| Test Tags | Label tests with tags to filter runs and apply shared options | [features-test-tags](references/features-test-tags.md) |
+| Reporters | Built-in reporters, default selection, CI/output config | [features-reporters](references/features-reporters.md) |
+| Benchmarking | Write benchmarks with the bench fixture (Tinybench) | [features-benchmarking](references/features-benchmarking.md) |
+
+## Advanced
+
+| Topic | Description | Reference |
+|-------|-------------|-----------|
+| Vi Utilities | vi helper: mock, spyOn, fake timers, hoisted, waitFor | [advanced-vi](references/advanced-vi.md) |
+| Environments | Test environments: node, jsdom, happy-dom, custom | [advanced-environments](references/advanced-environments.md) |
+| Type Testing | Type-level testing with expectTypeOf and assertType | [advanced-type-testing](references/advanced-type-testing.md) |
+| Projects | Multi-project workspaces, different configs per project | [advanced-projects](references/advanced-projects.md) |
diff --git a/.agents/skills/vitest/references/advanced-environments.md b/.agents/skills/vitest/references/advanced-environments.md
new file mode 100644
index 000000000..ded10d39b
--- /dev/null
+++ b/.agents/skills/vitest/references/advanced-environments.md
@@ -0,0 +1,272 @@
+---
+name: test-environments
+description: Configure environments like jsdom, happy-dom for browser APIs
+---
+
+# Test Environments
+
+## Available Environments
+
+- `node` (default) - Node.js environment
+- `jsdom` - Browser-like with DOM APIs
+- `happy-dom` - Faster alternative to jsdom
+- `edge-runtime` - Vercel Edge Runtime
+
+## Configuration
+
+```ts
+// vitest.config.ts
+defineConfig({
+  test: {
+    environment: 'jsdom',
+    
+    // Environment-specific options
+    environmentOptions: {
+      jsdom: {
+        url: 'http://localhost',
+      },
+    },
+  },
+})
+```
+
+## Installing Environment Packages
+
+```bash
+# jsdom
+npm i -D jsdom
+
+# happy-dom (faster, fewer APIs)
+npm i -D happy-dom
+```
+
+## Per-File Environment
+
+Use magic comment at top of file:
+
+```ts
+// @vitest-environment jsdom
+
+import { expect, test } from 'vitest'
+
+test('DOM test', () => {
+  const div = document.createElement('div')
+  expect(div).toBeInstanceOf(HTMLDivElement)
+})
+```
+
+## jsdom Environment
+
+Full browser environment simulation:
+
+```ts
+// @vitest-environment jsdom
+
+test('DOM manipulation', () => {
+  document.body.innerHTML = '<div id="app"></div>'
+  
+  const app = document.getElementById('app')
+  app.textContent = 'Hello'
+  
+  expect(app.textContent).toBe('Hello')
+})
+
+test('window APIs', () => {
+  expect(window.location.href).toBeDefined()
+  expect(localStorage).toBeDefined()
+})
+```
+
+### jsdom Options
+
+```ts
+defineConfig({
+  test: {
+    environmentOptions: {
+      jsdom: {
+        url: 'http://localhost:3000',
+        html: '<!DOCTYPE html><html><body></body></html>',
+        userAgent: 'custom-agent',
+        resources: 'usable',
+      },
+    },
+  },
+})
+```
+
+## happy-dom Environment
+
+Faster but fewer APIs:
+
+```ts
+// @vitest-environment happy-dom
+
+test('basic DOM', () => {
+  const el = document.createElement('div')
+  el.className = 'test'
+  expect(el.className).toBe('test')
+})
+```
+
+## Multiple Environments per Project
+
+Use projects for different environments:
+
+```ts
+defineConfig({
+  test: {
+    projects: [
+      {
+        test: {
+          name: 'unit',
+          include: ['tests/unit/**/*.test.ts'],
+          environment: 'node',
+        },
+      },
+      {
+        test: {
+          name: 'dom',
+          include: ['tests/dom/**/*.test.ts'],
+          environment: 'jsdom',
+        },
+      },
+    ],
+  },
+})
+```
+
+## Custom Environment
+
+Create custom environment package:
+
+```ts
+// vitest-environment-custom/index.ts
+import type { Environment } from 'vitest/runtime'
+
+export default <Environment>{
+  name: 'custom',
+  viteEnvironment: 'ssr', // or 'client'
+  
+  setup() {
+    // Setup global state
+    globalThis.myGlobal = 'value'
+    
+    return {
+      teardown() {
+        delete globalThis.myGlobal
+      },
+    }
+  },
+}
+```
+
+Use with:
+
+```ts
+defineConfig({
+  test: {
+    environment: 'custom',
+  },
+})
+```
+
+## Environment with VM
+
+For full isolation:
+
+```ts
+export default <Environment>{
+  name: 'isolated',
+  viteEnvironment: 'ssr',
+  
+  async setupVM() {
+    const vm = await import('node:vm')
+    const context = vm.createContext()
+    
+    return {
+      getVmContext() {
+        return context
+      },
+      teardown() {},
+    }
+  },
+  
+  setup() {
+    return { teardown() {} }
+  },
+}
+```
+
+## Browser Mode (Separate from Environments)
+
+For real browser testing, use Vitest Browser Mode. In **v4 the provider is an object** (not a string), and the context imports from `vitest/browser`:
+
+```ts
+import { playwright } from '@vitest/browser-playwright'
+
+defineConfig({
+  test: {
+    browser: {
+      enabled: true,
+      provider: playwright({ launchOptions: { slowMo: 100 } }),
+      instances: [{ browser: 'chromium' }], // or 'firefox', 'webkit'
+    },
+  },
+})
+```
+
+```ts
+import { page } from 'vitest/browser' // v4: was '@vitest/browser/context'
+```
+
+> v5: DOM-environment global assignments (e.g. `window.innerWidth`) now propagate to the underlying jsdom/happy-dom implementation. Locators are exact/strict by default (`getByText('Item')` no longer matches `Item 1`). `browser.api` is deprecated — move it to the top-level `api` option. Browser mode adds a built-in Trace View (`browser.traceView: true`).
+
+## CSS and Assets
+
+In jsdom/happy-dom, configure CSS handling:
+
+```ts
+defineConfig({
+  test: {
+    css: true, // Process CSS
+    
+    // Or with options
+    css: {
+      include: /\.module\.css$/,
+      modules: {
+        classNameStrategy: 'non-scoped',
+      },
+    },
+  },
+})
+```
+
+## Fixing External Dependencies
+
+If external deps fail with CSS/asset errors:
+
+```ts
+defineConfig({
+  test: {
+    server: {
+      deps: {
+        inline: ['problematic-package'],
+      },
+    },
+  },
+})
+```
+
+## Key Points
+
+- Default is `node` - no browser APIs
+- Use `jsdom` for full browser simulation
+- Use `happy-dom` for faster tests with basic DOM
+- Per-file environment via `// @vitest-environment` comment
+- Use projects for multiple environment configurations
+- Browser Mode is for real browser testing, not environment
+
+<!-- 
+Source references:
+- https://vitest.dev/guide/environment.html
+-->
diff --git a/.agents/skills/vitest/references/advanced-projects.md b/.agents/skills/vitest/references/advanced-projects.md
new file mode 100644
index 000000000..b9534f5a1
--- /dev/null
+++ b/.agents/skills/vitest/references/advanced-projects.md
@@ -0,0 +1,341 @@
+---
+name: projects-workspaces
+description: Multi-project configuration for monorepos and different test types
+---
+
+# Projects
+
+Run different test configurations in the same Vitest process.
+
+## v5 Config Inheritance & Nested Projects
+
+- **Inline projects inherit the root config by default** — `extends` now defaults to `true`, so root Vite options (`plugins`, `resolve.alias`) and test options are inherited. Arrays like `setupFiles` are appended, not replaced. Opt out with `extends: false`, or inherit from another file with `extends: './vitest.shared.ts'`. Projects referenced as config files/directories still don't inherit the root.
+- **Referenced config files can declare their own `projects`** — such a config acts as a container providing *nested projects* named `app (unit)`, `app (e2e)`, etc. In v4 a referenced config's `projects` field was silently ignored, so audit merged configs that pull one in.
+- **Inline projects share the declaring config's Vite server by default** ([`sharedViteServer`](core-config.md)) — the declaring config runs once, so plugin `config` hooks no longer run per project. A project gets its own server only when it changes the Vite config (`plugins`, `alias`, `css`, `deps.optimizer`, `root`, `browser`, `mode`). Set `sharedViteServer: false` if a plugin must be re-instantiated per project.
+
+```ts
+import { defineConfig } from 'vitest/config'
+import react from '@vitejs/plugin-react'
+
+export default defineConfig({
+  plugins: [react()], // inherited by every inline project (v4 needed extends: true)
+  test: {
+    projects: [
+      { test: { name: 'unit', include: ['**/*.unit.test.ts'] } },
+      // a package that declares its own projects becomes a nested container:
+      './packages/app/vitest.config.ts', // -> "app (unit)", "app (e2e)", ...
+    ],
+  },
+})
+```
+
+## Basic Projects Setup
+
+```ts
+// vitest.config.ts
+defineConfig({
+  test: {
+    projects: [
+      // Glob patterns for config files
+      'packages/*',
+      
+      // Inline config
+      {
+        test: {
+          name: 'unit',
+          include: ['tests/unit/**/*.test.ts'],
+          environment: 'node',
+        },
+      },
+      {
+        test: {
+          name: 'integration',
+          include: ['tests/integration/**/*.test.ts'],
+          environment: 'jsdom',
+        },
+      },
+    ],
+  },
+})
+```
+
+## Monorepo Pattern
+
+```ts
+defineConfig({
+  test: {
+    projects: [
+      // Each package has its own vitest.config.ts
+      'packages/core',
+      'packages/cli',
+      'packages/utils',
+    ],
+  },
+})
+```
+
+Package config:
+
+```ts
+// packages/core/vitest.config.ts
+import { defineConfig } from 'vitest/config'
+
+export default defineConfig({
+  test: {
+    name: 'core',
+    include: ['src/**/*.test.ts'],
+    environment: 'node',
+  },
+})
+```
+
+## Different Environments
+
+Run same tests in different environments:
+
+```ts
+defineConfig({
+  test: {
+    projects: [
+      {
+        test: {
+          name: 'happy-dom',
+          root: './shared-tests',
+          environment: 'happy-dom',
+          setupFiles: ['./setup.happy-dom.ts'],
+        },
+      },
+      {
+        test: {
+          name: 'node',
+          root: './shared-tests',
+          environment: 'node',
+          setupFiles: ['./setup.node.ts'],
+        },
+      },
+    ],
+  },
+})
+```
+
+## Browser + Node Projects
+
+```ts
+defineConfig({
+  test: {
+    projects: [
+      {
+        test: {
+          name: 'unit',
+          include: ['tests/unit/**/*.test.ts'],
+          environment: 'node',
+        },
+      },
+      {
+        test: {
+          name: 'browser',
+          include: ['tests/browser/**/*.test.ts'],
+          browser: {
+            enabled: true,
+            name: 'chromium',
+            provider: 'playwright',
+          },
+        },
+      },
+    ],
+  },
+})
+```
+
+## Shared Configuration
+
+```ts
+// vitest.shared.ts
+export const sharedConfig = {
+  testTimeout: 10000,
+  setupFiles: ['./tests/setup.ts'],
+}
+
+// vitest.config.ts
+import { sharedConfig } from './vitest.shared'
+
+defineConfig({
+  test: {
+    projects: [
+      {
+        test: {
+          ...sharedConfig,
+          name: 'unit',
+          include: ['tests/unit/**/*.test.ts'],
+        },
+      },
+      {
+        test: {
+          ...sharedConfig,
+          name: 'e2e',
+          include: ['tests/e2e/**/*.test.ts'],
+        },
+      },
+    ],
+  },
+})
+```
+
+## Project-Specific Dependencies
+
+Each project can have different dependencies inlined:
+
+```ts
+defineConfig({
+  test: {
+    projects: [
+      {
+        test: {
+          name: 'project-a',
+          server: {
+            deps: {
+              inline: ['package-a'],
+            },
+          },
+        },
+      },
+    ],
+  },
+})
+```
+
+## Running Specific Projects
+
+```bash
+# Run specific project (v5 adds the -p shorthand)
+vitest --project unit
+vitest -p integration
+
+# Multiple projects / wildcards
+vitest --project unit --project e2e
+vitest --project="packages*"
+
+# Exclude a project
+vitest --project="!browser"
+
+# Nested projects: --project matches the prefix
+vitest -p app                 # every project of the "app" config
+vitest -p "app (unit)"        # just one nested project
+```
+
+## Providing Values to Projects
+
+Share values from config to tests:
+
+```ts
+// vitest.config.ts
+defineConfig({
+  test: {
+    projects: [
+      {
+        test: {
+          name: 'staging',
+          provide: {
+            apiUrl: 'https://staging.api.com',
+            debug: true,
+          },
+        },
+      },
+      {
+        test: {
+          name: 'production',
+          provide: {
+            apiUrl: 'https://api.com',
+            debug: false,
+          },
+        },
+      },
+    ],
+  },
+})
+
+// In tests, use inject
+import { inject } from 'vitest'
+
+test('uses correct api', () => {
+  const url = inject('apiUrl')
+  expect(url).toContain('api.com')
+})
+```
+
+## With Fixtures
+
+```ts
+const test = base.extend({
+  apiUrl: ['/default', { injected: true }],
+})
+
+test('uses injected url', ({ apiUrl }) => {
+  // apiUrl comes from project's provide config
+})
+```
+
+## Per-Project Pool & Isolation (v4)
+
+Since the v4 pool rework, isolation, parallelism, and Node CLI options can be set **per project**:
+
+```ts
+defineConfig({
+  test: {
+    projects: [
+      {
+        test: {
+          name: 'unit',
+          isolate: false,                 // fast, non-isolated unit tests
+          exclude: ['**/*.integration.test.ts'],
+        },
+      },
+      {
+        test: {
+          name: 'sequential',
+          include: ['**/*.sequential.test.ts'],
+          fileParallelism: false,         // run these files one at a time
+        },
+      },
+      {
+        test: {
+          name: 'staging',
+          execArgv: ['--env-file=.env.staging'], // per-project Node flags
+        },
+      },
+    ],
+  },
+})
+```
+
+## Global Setup per Project
+
+```ts
+defineConfig({
+  test: {
+    projects: [
+      {
+        test: {
+          name: 'with-db',
+          globalSetup: ['./tests/db-setup.ts'],
+        },
+      },
+    ],
+  },
+})
+```
+
+## Key Points
+
+- Projects run in same Vitest process (replaces the removed `workspace` option)
+- Each project can have different environment, pool, isolation, and config
+- Use glob patterns for monorepo packages
+- Run specific projects with `--project` (supports wildcards and `!` exclusion)
+- Use `provide` to inject config values into tests
+- Inline projects inherit root config by default (v5 `extends: true`); set `extends: false` to opt out
+- Referenced configs that declare `projects` provide nested projects (`name (child)`)
+
+<!-- 
+Source references:
+- https://vitest.dev/guide/projects.html
+-->
diff --git a/.agents/skills/vitest/references/advanced-type-testing.md b/.agents/skills/vitest/references/advanced-type-testing.md
new file mode 100644
index 000000000..3b583d122
--- /dev/null
+++ b/.agents/skills/vitest/references/advanced-type-testing.md
@@ -0,0 +1,239 @@
+---
+name: type-testing
+description: Test TypeScript types with expectTypeOf and assertType
+---
+
+# Type Testing
+
+Test TypeScript types without runtime execution.
+
+## Setup
+
+Type tests use `.test-d.ts` extension:
+
+```ts
+// math.test-d.ts
+import { expectTypeOf } from 'vitest'
+import { add } from './math'
+
+test('add returns number', () => {
+  expectTypeOf(add).returns.toBeNumber()
+})
+```
+
+## Configuration
+
+```ts
+defineConfig({
+  test: {
+    typecheck: {
+      enabled: true,
+      
+      // Only type check
+      only: false,
+      
+      // Checker: 'tsc' or 'vue-tsc'
+      checker: 'tsc',
+      
+      // Include patterns
+      include: ['**/*.test-d.ts'],
+      
+      // tsconfig to use
+      tsconfig: './tsconfig.json',
+    },
+  },
+})
+```
+
+## expectTypeOf API
+
+```ts
+import { expectTypeOf } from 'vitest'
+
+// Basic type checks
+expectTypeOf<string>().toBeString()
+expectTypeOf<number>().toBeNumber()
+expectTypeOf<boolean>().toBeBoolean()
+expectTypeOf<null>().toBeNull()
+expectTypeOf<undefined>().toBeUndefined()
+expectTypeOf<void>().toBeVoid()
+expectTypeOf<never>().toBeNever()
+expectTypeOf<any>().toBeAny()
+expectTypeOf<unknown>().toBeUnknown()
+expectTypeOf<object>().toBeObject()
+expectTypeOf<Function>().toBeFunction()
+expectTypeOf<[]>().toBeArray()
+expectTypeOf<symbol>().toBeSymbol()
+```
+
+## Value Type Checking
+
+```ts
+const value = 'hello'
+expectTypeOf(value).toBeString()
+
+const obj = { name: 'test', count: 42 }
+expectTypeOf(obj).toExtend<{ name: string }>()
+expectTypeOf(obj).toHaveProperty('name')
+```
+
+## Function Types
+
+```ts
+function greet(name: string): string {
+  return `Hello, ${name}`
+}
+
+expectTypeOf(greet).toBeFunction()
+expectTypeOf(greet).parameters.toEqualTypeOf<[string]>()
+expectTypeOf(greet).returns.toBeString()
+
+// Parameter checking
+expectTypeOf(greet).parameter(0).toBeString()
+```
+
+## Object Types
+
+```ts
+interface User {
+  id: number
+  name: string
+  email?: string
+}
+
+expectTypeOf<User>().toHaveProperty('id')
+expectTypeOf<User>().toHaveProperty('name').toBeString()
+
+// Check shape
+expectTypeOf({ id: 1, name: 'test' }).toExtend<User>()
+```
+
+## Equality vs Matching
+
+`toMatchTypeOf` is **deprecated** (expect-type v1.2+) — use `toExtend` for subset matching:
+
+```ts
+interface A { x: number }
+interface B { x: number; y: string }
+
+// toExtend - subset matching (replaces toMatchTypeOf)
+expectTypeOf<B>().toExtend<A>()  // B extends A
+
+// toEqualTypeOf - exact match
+expectTypeOf<A>().not.toEqualTypeOf<B>()  // Not exact match
+expectTypeOf<A>().toEqualTypeOf<{ x: number }>()  // Exact match
+```
+
+## Branded Types
+
+```ts
+type UserId = number & { __brand: 'UserId' }
+type PostId = number & { __brand: 'PostId' }
+
+expectTypeOf<UserId>().not.toEqualTypeOf<PostId>()
+expectTypeOf<UserId>().not.toEqualTypeOf<number>()
+```
+
+## Generic Types
+
+```ts
+function identity<T>(value: T): T {
+  return value
+}
+
+expectTypeOf(identity<string>).returns.toBeString()
+expectTypeOf(identity<number>).returns.toBeNumber()
+```
+
+## Nullable Types
+
+```ts
+type MaybeString = string | null | undefined
+
+expectTypeOf<MaybeString>().toBeNullable()
+expectTypeOf<string>().not.toBeNullable()
+```
+
+## assertType
+
+Assert a value matches a type (no assertion at runtime):
+
+```ts
+import { assertType } from 'vitest'
+
+function getUser(): User | null {
+  return { id: 1, name: 'test' }
+}
+
+test('returns user', () => {
+  const result = getUser()
+  
+  // @ts-expect-error - should fail type check
+  assertType<string>(result)
+  
+  // Correct type
+  assertType<User | null>(result)
+})
+```
+
+## Using @ts-expect-error
+
+Test that code produces type error:
+
+```ts
+test('rejects wrong types', () => {
+  function requireString(s: string) {}
+  
+  // @ts-expect-error - number not assignable to string
+  requireString(123)
+})
+```
+
+## Running Type Tests
+
+```bash
+# Run type tests
+vitest typecheck
+
+# Run alongside unit tests
+vitest --typecheck
+
+# Type tests only
+vitest --typecheck.only
+```
+
+## Mixed Test Files
+
+Combine runtime and type tests:
+
+```ts
+// user.test.ts
+import { describe, expect, expectTypeOf, test } from 'vitest'
+import { createUser } from './user'
+
+describe('createUser', () => {
+  test('runtime: creates user', () => {
+    const user = createUser('John')
+    expect(user.name).toBe('John')
+  })
+
+  test('types: returns User type', () => {
+    expectTypeOf(createUser).returns.toExtend<{ name: string }>()
+  })
+})
+```
+
+## Key Points
+
+- Use `.test-d.ts` for type-only tests
+- `expectTypeOf` for type assertions
+- `toExtend` for subset matching (`toMatchTypeOf` is deprecated)
+- `toEqualTypeOf` for exact type matching
+- Use `@ts-expect-error` to test type errors
+- Run with `vitest typecheck` or `--typecheck`
+
+<!-- 
+Source references:
+- https://vitest.dev/guide/testing-types.html
+- https://vitest.dev/api/expect-typeof.html
+-->
diff --git a/.agents/skills/vitest/references/advanced-vi.md b/.agents/skills/vitest/references/advanced-vi.md
new file mode 100644
index 000000000..bcd38e823
--- /dev/null
+++ b/.agents/skills/vitest/references/advanced-vi.md
@@ -0,0 +1,290 @@
+---
+name: vi-utilities
+description: vi helper for mocking, timers, utilities
+---
+
+# Vi Utilities
+
+The `vi` helper provides mocking and utility functions.
+
+```ts
+import { vi } from 'vitest'
+```
+
+## Mock Functions
+
+```ts
+// Create mock
+const fn = vi.fn()
+const fnWithImpl = vi.fn((x) => x * 2)
+
+// Check if mock
+vi.isMockFunction(fn) // true
+
+// Mock methods
+fn.mockReturnValue(42)
+fn.mockReturnValueOnce(1)
+fn.mockResolvedValue(data)
+fn.mockRejectedValue(error)
+fn.mockImplementation(() => 'result')
+fn.mockImplementationOnce(() => 'once')
+
+// Clear/reset
+fn.mockClear()    // Clear call history
+fn.mockReset()    // Clear history + implementation
+fn.mockRestore()  // Restore original (for spies)
+```
+
+## Spying
+
+```ts
+const obj = { method: () => 'original' }
+
+const spy = vi.spyOn(obj, 'method')
+obj.method()
+
+expect(spy).toHaveBeenCalled()
+
+// Mock implementation
+spy.mockReturnValue('mocked')
+
+// Spy on getter/setter
+vi.spyOn(obj, 'prop', 'get').mockReturnValue('value')
+```
+
+## Module Mocking
+
+```ts
+// Hoisted to top of file
+vi.mock('./module', () => ({
+  fn: vi.fn(),
+}))
+
+// Partial mock
+vi.mock('./module', async (importOriginal) => ({
+  ...(await importOriginal()),
+  specificFn: vi.fn(),
+}))
+
+// Spy mode - keep implementation
+vi.mock('./module', { spy: true })
+
+// Import actual module inside mock
+const actual = await vi.importActual('./module')
+
+// Import as mock
+const mocked = await vi.importMock('./module')
+```
+
+## Dynamic Mocking
+
+```ts
+// Not hoisted - use with dynamic imports
+vi.doMock('./config', () => ({ key: 'value' }))
+const config = await import('./config')
+
+// Unmock
+vi.doUnmock('./config')
+vi.unmock('./module') // Hoisted
+```
+
+## Conditional Mocking — vi.when (v5)
+
+Argument-specific spy behaviors:
+
+```ts
+vi.when(spy)
+  .calledWith(1).thenReturn('one')
+  .calledWith(2).thenReturn('two')
+
+// then* actions: thenReturn / thenThrow / thenResolve / thenReject (+ *Once)
+// options: { times }, second arg { onUnmatched: 'throw' | 'passthrough' | fn }
+
+vi.isWhenChain(w)  // type guard for a When chain
+```
+
+See [features-mocking](features-mocking.md) for FIFO/LIFO matching and `toHaveBeenExhausted`.
+
+## Assertion Helpers — vi.defineHelper (4.1+)
+
+Wrap reusable assertion functions so failures point at the **call site**, not inside the helper:
+
+```ts
+const expectValidUser = vi.defineHelper((user: unknown) => {
+  expect(user).toHaveProperty('id')
+  expect(user).toHaveProperty('email')
+})
+
+test('returns a valid user', async () => {
+  expectValidUser(await fetchUser('alice')) // failures reported here
+})
+```
+
+## Reset Modules
+
+```ts
+// Clear module cache
+vi.resetModules()
+
+// Wait for dynamic imports
+await vi.dynamicImportSettled()
+```
+
+## Fake Timers
+
+```ts
+vi.useFakeTimers()
+
+// Choose which timers to fake (toFake and toNotFake are mutually exclusive)
+vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
+vi.useFakeTimers({ toNotFake: ['setInterval'] })
+
+// v5: Temporal is faked alongside Date when present on globalThis;
+// exclude it with toNotFake: ['Temporal']
+
+setTimeout(() => console.log('done'), 1000)
+
+// Advance time
+vi.advanceTimersByTime(1000)
+vi.advanceTimersByTimeAsync(1000)  // For async callbacks
+vi.advanceTimersToNextTimer()
+vi.advanceTimersToNextFrame()      // requestAnimationFrame
+
+// Run all timers
+vi.runAllTimers()
+vi.runAllTimersAsync()
+vi.runOnlyPendingTimers()
+
+// Clear timers
+vi.clearAllTimers()
+
+// Check state
+vi.getTimerCount()
+vi.isFakeTimers()
+
+// Restore
+vi.useRealTimers()
+```
+
+## Mock Date/Time
+
+```ts
+vi.setSystemTime(new Date('2024-01-01'))
+expect(new Date().getFullYear()).toBe(2024)
+// v5: also drives Temporal.Now when Temporal is available
+
+vi.getMockedSystemTime()  // Get mocked date
+vi.getRealSystemTime()    // Get real time (ms)
+```
+
+## Global/Env Mocking
+
+```ts
+// Stub global
+vi.stubGlobal('fetch', vi.fn())
+vi.unstubAllGlobals()
+
+// Stub environment
+vi.stubEnv('API_KEY', 'test')
+vi.stubEnv('NODE_ENV', 'test')
+vi.unstubAllEnvs()
+```
+
+## Hoisted Code
+
+Run code before imports:
+
+```ts
+const mock = vi.hoisted(() => vi.fn())
+
+vi.mock('./module', () => ({
+  fn: mock, // Can reference hoisted variable
+}))
+```
+
+## Waiting Utilities
+
+```ts
+// Wait for callback to succeed
+await vi.waitFor(async () => {
+  const el = document.querySelector('.loaded')
+  expect(el).toBeTruthy()
+}, { timeout: 5000, interval: 100 })
+
+// Wait for truthy value
+const element = await vi.waitUntil(
+  () => document.querySelector('.loaded'),
+  { timeout: 5000 }
+)
+```
+
+## Mock Object
+
+Mock all methods of an object:
+
+```ts
+const original = {
+  method: () => 'real',
+  nested: { fn: () => 'nested' },
+}
+
+const mocked = vi.mockObject(original)
+mocked.method()  // undefined (mocked)
+mocked.method.mockReturnValue('mocked')
+
+// Spy mode
+const spied = vi.mockObject(original, { spy: true })
+spied.method()  // 'real'
+expect(spied.method).toHaveBeenCalled()
+```
+
+## Test Configuration
+
+```ts
+vi.setConfig({
+  testTimeout: 10_000,
+  hookTimeout: 10_000,
+})
+
+vi.resetConfig()
+```
+
+## Global Mock Management
+
+```ts
+vi.clearAllMocks()   // Clear all mock call history
+vi.resetAllMocks()   // Reset + clear implementation
+vi.restoreAllMocks() // Restore originals (spies)
+```
+
+## vi.mocked Type Helper
+
+TypeScript helper for mocked values:
+
+```ts
+import { myFn } from './module'
+vi.mock('./module')
+
+// Type as mock
+vi.mocked(myFn).mockReturnValue('typed')
+
+// Deep mocking
+vi.mocked(myModule, { deep: true })
+
+// Partial mock typing
+vi.mocked(fn, { partial: true }).mockResolvedValue({ ok: true })
+```
+
+## Key Points
+
+- `vi.mock` is hoisted - use `vi.doMock` for dynamic mocking
+- `vi.hoisted` lets you reference variables in mock factories
+- Use `vi.spyOn` to spy on existing methods (v4: supports constructors)
+- Use `vi.when` for argument-specific behaviors and `vi.defineHelper` for assertion helpers
+- Fake timers require explicit setup and teardown
+- `vi.waitFor` retries until assertion passes
+
+<!-- 
+Source references:
+- https://vitest.dev/api/vi.html
+-->
diff --git a/.agents/skills/vitest/references/core-cli.md b/.agents/skills/vitest/references/core-cli.md
new file mode 100644
index 000000000..a75bed42b
--- /dev/null
+++ b/.agents/skills/vitest/references/core-cli.md
@@ -0,0 +1,191 @@
+---
+name: vitest-cli
+description: Command line interface commands and options
+---
+
+# Command Line Interface
+
+## Commands
+
+### `vitest`
+
+Start Vitest in watch mode (dev) or run mode (CI):
+
+```bash
+vitest                    # Watch mode in dev, run mode in CI
+vitest foobar             # Run tests containing "foobar" in path
+vitest basic/foo.test.ts:10  # Run specific test by file and line number
+```
+
+### `vitest run`
+
+Run tests once without watch mode:
+
+```bash
+vitest run
+vitest run --coverage
+```
+
+### `vitest watch`
+
+Explicitly start watch mode:
+
+```bash
+vitest watch
+```
+
+### `vitest related`
+
+Run tests that import specific files (useful with lint-staged):
+
+```bash
+vitest related src/index.ts src/utils.ts --run
+```
+
+### `vitest bench`
+
+Run only benchmark tests:
+
+```bash
+vitest bench
+```
+
+### `vitest list`
+
+List all matching tests without running them:
+
+```bash
+vitest list                    # List test names
+vitest list --json             # Output as JSON
+vitest list --filesOnly        # List only test files
+```
+
+> v5: `list` parses test files **statically** instead of running them. Pass `--no-static-parse` to run them; tune with `--static-parse-concurrency`.
+
+### `vitest doctor` (v5)
+
+Run the suite under alternative configs and recommend faster options (e.g. a different `pool`, `isolate: false`, `fsModuleCache`, lower `maxWorkers`). Needs a passing baseline; takes several times a normal run:
+
+```bash
+vitest doctor
+```
+
+### `vitest init`
+
+Initialize project setup:
+
+```bash
+vitest init browser            # Set up browser testing
+```
+
+### `vitest --list-tags`
+
+List tags defined in config without running tests:
+
+```bash
+vitest --list-tags             # Human-readable list
+vitest --list-tags=json        # JSON output
+```
+
+## Common Options
+
+```bash
+# Configuration
+--config <path>           # Path to config file
+--project, -p <name>      # Run specific project (v5 adds the -p shorthand)
+
+# Filtering
+--testNamePattern, -t     # Run tests matching pattern
+--tagsFilter <expr>       # Run tests by tag expression, e.g. "db && !flaky"
+--changed                 # Run tests for changed files
+--changed HEAD~1          # Tests for last commit changes
+--since-last-run         # (5.1, experimental) Tests whose loaded files changed since their last run
+--last-failed             # (5.1) Only tests that failed in the last run (from results cache)
+--dir <path>              # Limit test discovery to a directory
+
+# Reporters
+--reporter <name>         # default, verbose, tree, dot, json, html, junit, minimal, blob
+--reporter=json --outputFile=report.json
+
+# Coverage
+--coverage                # Enable coverage
+--coverage.provider v8    # Use v8 provider
+--coverage.reporter text,html
+
+# Execution
+--shard <index>/<count>   # Split tests across machines
+--bail <n>                # Stop after n failures
+--retry <n>               # Retry failed tests n times
+--repeats <n>             # v5: repeat every test n times (hunt flaky tests)
+--shuffle                 # Randomize test order
+--no-file-parallelism     # Run test files one at a time
+
+# Watch mode
+--no-watch                # Disable watch mode
+--standalone              # Start without running (v4: runs matched files if a filter is passed)
+
+# Environment
+--environment <env>       # jsdom, happy-dom, node
+--globals                 # Enable global APIs
+
+# Debugging
+--inspect                 # Enable Node inspector
+--inspect-brk             # Break on start
+
+# Output
+--silent                  # Suppress console output
+--no-color                # Disable colors
+```
+
+## Package.json Scripts
+
+```json
+{
+  "scripts": {
+    "test": "vitest",
+    "test:run": "vitest run",
+    "test:ui": "vitest --ui",
+    "coverage": "vitest run --coverage"
+  }
+}
+```
+
+## Sharding for CI
+
+Split tests across multiple machines. The blob reporter writes to `.vitest/blob/` by default:
+
+```bash
+# Machine 1
+vitest run --shard=1/3 --reporter=blob --outputFile=reports/blob-1.json
+
+# Machine 2
+vitest run --shard=2/3 --reporter=blob --outputFile=reports/blob-2.json
+
+# Merge all blobs into a final report
+vitest --merge-reports=reports --reporter=junit --reporter=default
+```
+
+## Watch Mode Keyboard Shortcuts
+
+In watch mode, press:
+- `a` - Run all tests
+- `f` - Run only failed tests
+- `u` - Update snapshots
+- `p` - Filter by filename pattern
+- `t` - Filter by test name pattern
+- `q` - Quit
+
+## Key Points
+
+- Watch mode is default in dev, run mode in CI (when `process.env.CI` is set)
+- Use `--run` flag to ensure single run (important for lint-staged)
+- Both camelCase (`--testTimeout`) and kebab-case (`--test-timeout`) work
+- Boolean options can be negated with `--no-` prefix
+- Filter tests by tag with `--tagsFilter` (tags must be declared in config) — see [features-test-tags](features-test-tags.md)
+- `--merge-reports` and `--reporter=blob` do not work in watch mode (`--merge-reports` now handles non-sharded multi-environment runs)
+- v5: use `-p` as shorthand for `--project`; `vitest doctor` suggests faster config
+
+<!-- 
+Source references:
+- https://vitest.dev/guide/cli.html
+-->
diff --git a/.agents/skills/vitest/references/core-config.md b/.agents/skills/vitest/references/core-config.md
new file mode 100644
index 000000000..764b9cdea
--- /dev/null
+++ b/.agents/skills/vitest/references/core-config.md
@@ -0,0 +1,226 @@
+---
+name: vitest-configuration
+description: Configure Vitest with vite.config.ts or vitest.config.ts
+---
+
+# Configuration
+
+Vitest reads configuration from `vitest.config.ts` or `vite.config.ts`. It shares the same config format as Vite.
+
+## Basic Setup
+
+```ts
+// vitest.config.ts
+import { defineConfig } from 'vitest/config'
+
+export default defineConfig({
+  test: {
+    // test options
+  },
+})
+```
+
+## Using with Existing Vite Config
+
+Add Vitest types reference and use the `test` property:
+
+```ts
+// vite.config.ts
+/// <reference types="vitest/config" />
+import { defineConfig } from 'vite'
+
+export default defineConfig({
+  test: {
+    globals: true,
+    environment: 'jsdom',
+  },
+})
+```
+
+## Merging Configs
+
+If you have separate config files, use `mergeConfig`:
+
+```ts
+// vitest.config.ts
+import { defineConfig, mergeConfig } from 'vitest/config'
+import viteConfig from './vite.config'
+
+export default mergeConfig(viteConfig, defineConfig({
+  test: {
+    environment: 'jsdom',
+  },
+}))
+```
+
+## Common Options
+
+```ts
+defineConfig({
+  test: {
+    // Enable global APIs (describe, it, expect) without imports
+    globals: true,
+    
+    // Test environment: 'node', 'jsdom', 'happy-dom'
+    environment: 'node',
+    
+    // Setup files to run before each test file
+    setupFiles: ['./tests/setup.ts'],
+    
+    // Include patterns for test files
+    include: ['**/*.{test,spec}.{js,ts,jsx,tsx}'],
+    
+    // Exclude patterns
+    exclude: ['**/node_modules/**', '**/dist/**'],
+    
+    // Limit test discovery to a directory (faster than broad excludes)
+    dir: './src',
+
+    // Test timeout in ms
+    testTimeout: 5000,
+    
+    // Hook timeout in ms
+    hookTimeout: 10000,
+    
+    // Coverage configuration (v4+: define `include`, no more `all`)
+    coverage: {
+      provider: 'v8', // or 'istanbul'
+      reporter: ['text', 'html'],
+      include: ['src/**/*.ts'],
+    },
+    
+    // Run each file in an isolated module graph (threads/forks pools only)
+    isolate: true,
+    
+    // Pool: 'forks' (default), 'threads', 'vmForks', 'vmThreads'
+    pool: 'forks',
+    
+    // v4+: pool options are top-level (poolOptions was removed)
+    maxWorkers: 4,
+    fileParallelism: true,
+    
+    // Clear mock call history before each test (v5: defaults to true)
+    clearMocks: true,
+    
+    // Restore spies created with vi.spyOn between tests
+    restoreMocks: true,
+    
+    // Retry failed tests
+    retry: 0,
+    
+    // Stop after first failure
+    bail: 0,
+
+    // v5: repeat every test N times regardless of result (flaky-hunting)
+    repeats: 0,
+  },
+})
+```
+
+## v5 Performance Config
+
+```ts
+defineConfig({
+  test: {
+    // Persist transformed modules on disk, reused across reruns AND separate
+    // processes (stable in v5; was experimental.fsModuleCache). Cache lives in
+    // node_modules by default; clear with `vitest --clearCache`. Not for browser.
+    fsModuleCache: true,
+
+    // Inline projects that don't change the Vite config reuse the declaring
+    // config's Vite server (default true) — shared files transformed once.
+    // Set false if a plugin must be re-instantiated per project.
+    sharedViteServer: true,
+
+    // Inject CJS globals (module/exports/require/__filename/__dirname) into
+    // every module (default true). Set false for stricter ESM-like scope.
+    injectCjsGlobals: false,
+
+    // Detect async resources leaking past a test file (slow; debugging only)
+    detectAsyncLeaks: false,
+  },
+})
+```
+
+## v4/v5 Config Changes
+
+- **v5 requires Vite >= 6.4.0 and Node >= 22.12.0.** `vite` is now a required peer dependency (Yarn users must `yarn add -D vite`).
+- **`clearMocks` defaults to `true`** in v5 — `vi.clearAllMocks()` runs before every test (history cleared, implementations kept). Set `clearMocks: false` for the old behavior.
+- **Inline projects inherit the root config by default** (`extends` defaults to `true`) — including Vite `plugins`/`resolve.alias`. Set `extends: false` to opt out. See [advanced-projects](advanced-projects.md).
+- **`testNamePattern` (`-t`) matches the `>`-joined full name** (`'math > adds'`), not the space-joined Jest form.
+- **`vi.mock`/`vi.unmock`/`vi.hoisted` must be at the top level** — nested calls now throw (they were only warned before).
+- **Pool default is `forks`** (child processes), not `threads`.
+- **`poolOptions` removed** — `maxThreads`/`maxForks` are now top-level `maxWorkers`; `singleThread`/`singleFork` become `maxWorkers: 1, isolate: false`; VM `memoryLimit` is `vmMemoryLimit`. `minWorkers` was removed.
+- **`workspace` removed** — use [`projects`](advanced-projects.md). `vitest.workspace.ts` no longer supported.
+- **`coverage.all` and `coverage.extensions` removed** — by default only covered files are reported; set `coverage.include` explicitly.
+- **Simplified `exclude`** — only `node_modules`/`.git` excluded by default. Use `test.dir` to scope discovery, or spread `configDefaults.exclude`.
+- **Config not looked up from parent dirs** — pass `--config` explicitly when running from a subdirectory.
+- **`.vitest` artifact dir** — blob reports (`.vitest/blob/`), attachments (`.vitest/attachments/`), and the `html`/`json`/`junit` reporters now all live under a single `.vitest/` directory; add one entry to `.gitignore`.
+- **`test.sequential`/`describe.sequential`/`sequential` removed** — use `{ concurrent: false }`.
+- `deps.optimizer.web` renamed to `deps.optimizer.client`; `deps.inline`/`deps.external` moved under `server.deps`.
+
+## v5.1 Additions
+
+- **`cache`** (default `true`) stores per-file results (failed/duration/last run) used to run failed and slow files first and by `--last-failed`; `cache.dir` is a no-op — use `cacheDir`.
+- **`experimental.recordDependencies`** + **`experimental.vcsProvider: 'mtime'`** back `--since-last-run` (see [features-filtering](features-filtering.md)). `vcsProvider` also accepts `'git'` or a custom `VCSProvider`, whose `findChangedFiles` now receives `resolver.getDependencies()`.
+- **`ui: { enabled, theme: 'auto' | 'light' | 'dark' }`** — `ui: true` is shorthand for `{ enabled: true }`; `theme` also applies to the Browser Mode UI.
+- **`fakeTimers.fakeNodeBuiltins`** fakes `node:timers` and `node:timers/promises`.
+- **`coverage.ignoreNode(node, type)`** (v8) skips generated code by AST node; return `true`, or `'ignore-this-and-nested-nodes'`.
+- In multi-project runs `process.cwd()` stays where Vitest started, regardless of project `root`; use `pool: 'forks'` plus a project `setupFiles` calling `process.chdir()` if tests need it.
+- In Browser Mode each browser instance counts as a worker for `maxWorkers`.
+
+## Conditional Configuration
+
+Use `mode` or `process.env.VITEST` for test-specific config:
+
+```ts
+export default defineConfig(({ mode }) => ({
+  plugins: mode === 'test' ? [] : [myPlugin()],
+  test: {
+    // test options
+  },
+}))
+```
+
+## Projects (Monorepos)
+
+Run different configurations in the same Vitest process:
+
+```ts
+defineConfig({
+  test: {
+    projects: [
+      'packages/*',
+      {
+        test: {
+          name: 'unit',
+          include: ['tests/unit/**/*.test.ts'],
+          environment: 'node',
+        },
+      },
+      {
+        test: {
+          name: 'integration',
+          include: ['tests/integration/**/*.test.ts'],
+          environment: 'jsdom',
+        },
+      },
+    ],
+  },
+})
+```
+
+## Key Points
+
+- Vitest uses Vite's transformation pipeline - same `resolve.alias`, plugins work
+- `vitest.config.ts` takes priority over `vite.config.ts`
+- Use `--config` flag to specify a custom config path (required from subdirectories in v5)
+- `process.env.VITEST` is set to `true` when running tests
+- Test config uses `test` property, rest is Vite config
+- v5 requires **Vite >= 6.4.0** and **Node >= 22.12.0**; `vite` is a required peer dependency
+
+<!-- 
+Source references:
+- https://vitest.dev/guide/#configuring-vitest
+- https://vitest.dev/config/
+-->
diff --git a/.agents/skills/vitest/references/core-describe.md b/.agents/skills/vitest/references/core-describe.md
new file mode 100644
index 000000000..d8ea086fd
--- /dev/null
+++ b/.agents/skills/vitest/references/core-describe.md
@@ -0,0 +1,195 @@
+---
+name: describe-api
+description: describe/suite for grouping tests into logical blocks
+---
+
+# Describe API
+
+Group related tests into suites for organization and shared setup.
+
+## Basic Usage
+
+```ts
+import { describe, expect, test } from 'vitest'
+
+describe('Math', () => {
+  test('adds numbers', () => {
+    expect(1 + 1).toBe(2)
+  })
+
+  test('subtracts numbers', () => {
+    expect(3 - 1).toBe(2)
+  })
+})
+
+// Alias: suite
+import { suite } from 'vitest'
+suite('equivalent to describe', () => {})
+```
+
+## Nested Suites
+
+```ts
+describe('User', () => {
+  describe('when logged in', () => {
+    test('shows dashboard', () => {})
+    test('can update profile', () => {})
+  })
+
+  describe('when logged out', () => {
+    test('shows login page', () => {})
+  })
+})
+```
+
+## Suite Options
+
+```ts
+// All tests inherit options
+describe('slow tests', { timeout: 30_000 }, () => {
+  test('test 1', () => {}) // 30s timeout
+  test('test 2', () => {}) // 30s timeout
+})
+```
+
+## Suite Modifiers
+
+### Skip Suites
+
+```ts
+describe.skip('skipped suite', () => {
+  test('wont run', () => {})
+})
+
+// Conditional
+describe.skipIf(process.env.CI)('not in CI', () => {})
+describe.runIf(!process.env.CI)('only local', () => {})
+```
+
+### Focus Suites
+
+```ts
+describe.only('only this suite runs', () => {
+  test('runs', () => {})
+})
+```
+
+### Todo Suites
+
+```ts
+describe.todo('implement later')
+```
+
+### Concurrent Suites
+
+```ts
+// All tests run in parallel
+describe.concurrent('parallel tests', () => {
+  test('test 1', async ({ expect }) => {})
+  test('test 2', async ({ expect }) => {})
+})
+```
+
+### Opt Out of Concurrency
+
+`describe.sequential` was **removed in v5**. Use `{ concurrent: false }` to opt a suite out of inherited/global concurrency:
+
+```ts
+describe.concurrent('parallel', () => {
+  test('concurrent 1', async () => {})
+
+  describe('must be sequential', { concurrent: false }, () => {
+    test('step 1', async () => {})
+    test('step 2', async () => {})
+  })
+})
+```
+
+### Shuffle Tests
+
+```ts
+describe.shuffle('random order', () => {
+  test('test 1', () => {})
+  test('test 2', () => {})
+  test('test 3', () => {})
+})
+
+// Or with option
+describe('random', { shuffle: true }, () => {})
+```
+
+## Parameterized Suites
+
+### describe.each
+
+```ts
+describe.each([
+  { name: 'Chrome', version: 100 },
+  { name: 'Firefox', version: 90 },
+])('$name browser', ({ name, version }) => {
+  test('has version', () => {
+    expect(version).toBeGreaterThan(0)
+  })
+})
+```
+
+### describe.for
+
+```ts
+describe.for([
+  ['Chrome', 100],
+  ['Firefox', 90],
+])('%s browser', ([name, version]) => {
+  test('has version', () => {
+    expect(version).toBeGreaterThan(0)
+  })
+})
+```
+
+## Hooks in Suites
+
+```ts
+describe('Database', () => {
+  let db
+
+  beforeAll(async () => {
+    db = await createDb()
+  })
+
+  afterAll(async () => {
+    await db.close()
+  })
+
+  beforeEach(async () => {
+    await db.clear()
+  })
+
+  test('insert works', async () => {
+    await db.insert({ name: 'test' })
+    expect(await db.count()).toBe(1)
+  })
+})
+```
+
+## Modifier Combinations
+
+Modifiers can be chained:
+
+```ts
+describe.skip.concurrent('skipped concurrent', () => {})
+describe.only.shuffle('only and shuffled', () => {})
+```
+
+## Key Points
+
+- Top-level tests belong to an implicit file suite
+- Nested suites inherit parent's options (timeout, retry, concurrency, etc.)
+- Hooks are scoped to their suite and nested suites
+- Use `describe.concurrent` with context's `expect` for snapshots
+- Shuffle order depends on `sequence.seed` config
+- `describe.sequential` was removed in v5 — use `{ concurrent: false }`
+
+<!-- 
+Source references:
+- https://vitest.dev/api/describe.html
+-->
diff --git a/.agents/skills/vitest/references/core-expect.md b/.agents/skills/vitest/references/core-expect.md
new file mode 100644
index 000000000..b352d17eb
--- /dev/null
+++ b/.agents/skills/vitest/references/core-expect.md
@@ -0,0 +1,326 @@
+---
+name: expect-api
+description: Assertions with matchers, asymmetric matchers, and custom matchers
+---
+
+# Expect API
+
+Vitest uses Chai assertions with Jest-compatible API.
+
+## Basic Assertions
+
+```ts
+import { expect, test } from 'vitest'
+
+test('assertions', () => {
+  // Equality
+  expect(1 + 1).toBe(2)              // Strict equality (===)
+  expect({ a: 1 }).toEqual({ a: 1 }) // Deep equality
+
+  // Truthiness
+  expect(true).toBeTruthy()
+  expect(false).toBeFalsy()
+  expect(null).toBeNull()
+  expect(undefined).toBeUndefined()
+  expect('value').toBeDefined()
+
+  // Numbers
+  expect(10).toBeGreaterThan(5)
+  expect(10).toBeGreaterThanOrEqual(10)
+  expect(5).toBeLessThan(10)
+  expect(0.1 + 0.2).toBeCloseTo(0.3, 5)
+
+  // Strings
+  expect('hello world').toMatch(/world/)
+  expect('hello').toContain('ell')
+
+  // Arrays
+  expect([1, 2, 3]).toContain(2)
+  expect([{ a: 1 }]).toContainEqual({ a: 1 })
+  expect([1, 2, 3]).toHaveLength(3)
+
+  // Objects
+  expect({ a: 1, b: 2 }).toHaveProperty('a')
+  expect({ a: 1, b: 2 }).toHaveProperty('a', 1)
+  expect({ a: { b: 1 } }).toHaveProperty('a.b', 1)
+  expect({ a: 1 }).toMatchObject({ a: 1 })
+
+  // Types
+  expect('string').toBeTypeOf('string')
+  expect(new Date()).toBeInstanceOf(Date)
+})
+```
+
+## Negation
+
+```ts
+expect(1).not.toBe(2)
+expect({ a: 1 }).not.toEqual({ a: 2 })
+```
+
+## Error Assertions
+
+```ts
+// Sync errors - wrap in function
+expect(() => throwError()).toThrow()
+expect(() => throwError()).toThrow('message') // string = substring of the message
+expect(() => throwError()).toThrow(/pattern/)
+expect(() => throwError()).toThrow(CustomError)
+
+// v5: toThrow('') matches ANY message (empty string is a substring of all).
+// To assert an empty message, match the pattern: .toThrow(/^$/)
+
+// Async errors - use rejects
+await expect(asyncThrow()).rejects.toThrow('error')
+```
+
+## Promise Assertions
+
+```ts
+// Resolves
+await expect(Promise.resolve(1)).resolves.toBe(1)
+await expect(fetchData()).resolves.toEqual({ data: true })
+
+// Rejects
+await expect(Promise.reject('error')).rejects.toBe('error')
+await expect(failingFetch()).rejects.toThrow()
+```
+
+> **v5:** unawaited async assertions (`resolves`, `rejects`, `toMatchFileSnapshot`) now **fail the test** — v4 only printed a warning and auto-awaited at the end. Always `await` them.
+
+## Spy/Mock Assertions
+
+```ts
+const fn = vi.fn()
+fn('arg1', 'arg2')
+fn('arg3')
+
+expect(fn).toHaveBeenCalled()
+expect(fn).toHaveBeenCalledTimes(2)
+expect(fn).toHaveBeenCalledWith('arg1', 'arg2')
+expect(fn).toHaveBeenLastCalledWith('arg3')
+expect(fn).toHaveBeenNthCalledWith(1, 'arg1', 'arg2')
+
+expect(fn).toHaveReturned()
+expect(fn).toHaveReturnedWith(value)
+
+// v4 additions
+expect(fn).toHaveBeenCalledExactlyOnceWith('arg1', 'arg2')
+expect(fnA).toHaveBeenCalledBefore(fnB)
+expect(fnA).toHaveBeenCalledAfter(fnB)
+```
+
+### Chai-Style Spy Assertions (4.1+)
+
+Sinon-chai-compatible aliases, useful when migrating from Sinon:
+
+```ts
+expect(spy).to.have.been.called
+expect(spy).to.have.been.calledOnce
+expect(spy).to.have.been.calledWith('arg1', 'arg2')
+expect(spy).to.have.been.calledOnceWith('arg')
+```
+
+### Conditional Mock Exhaustion (v5)
+
+Assert every `vi.when` behavior was consumed:
+
+```ts
+const w = vi.when(spy).calledWith(1).thenReturnOnce('a')
+spy(1)
+expect(w).toHaveBeenExhausted()
+```
+
+## Asymmetric Matchers
+
+Use inside `toEqual`, `toHaveBeenCalledWith`, etc:
+
+```ts
+expect({ id: 1, name: 'test' }).toEqual({
+  id: expect.any(Number),
+  name: expect.any(String),
+})
+
+expect({ a: 1, b: 2, c: 3 }).toEqual(
+  expect.objectContaining({ a: 1 })
+)
+
+expect([1, 2, 3, 4]).toEqual(
+  expect.arrayContaining([1, 3])
+)
+
+expect('hello world').toEqual(
+  expect.stringContaining('world')
+)
+
+expect('hello world').toEqual(
+  expect.stringMatching(/world$/)
+)
+
+expect({ value: null }).toEqual({
+  value: expect.anything() // Matches anything except null/undefined
+})
+
+// Negate with expect.not
+expect([1, 2]).toEqual(
+  expect.not.arrayContaining([3])
+)
+
+// toBeOneOf - value matches any option (great for optional props)
+expect(user).toEqual({
+  name: expect.any(String),
+  middleName: expect.toBeOneOf([expect.any(String), undefined]),
+})
+
+// schemaMatching (4.0+) - matches any Standard Schema (Zod, Valibot, ArkType)
+import { z } from 'zod'
+expect(payload).toEqual({
+  email: expect.schemaMatching(z.string().email()),
+})
+expect(repo.save).toHaveBeenCalledWith(expect.schemaMatching(UserSchema))
+```
+
+## Soft Assertions
+
+Prefer `expect.soft` for **non-critical assertions** — it marks the test failed but continues so all failures are reported together:
+
+```ts
+expect.soft(response.status).toBe(200) // non-critical, keeps going
+expect.soft(response.headers.get('x-id')).toBeTruthy()
+expect(response.body).toBeDefined() // critical: hard expect stops on failure
+```
+
+## Type-Narrowing Assertions (4.0+)
+
+`expect.assert` throws at runtime **and** narrows the TypeScript type (unlike `toBeTruthy`/`toBeDefined`, which return `void`):
+
+```ts
+const user = cache.get('alice') // { id, name } | undefined
+expect.assert(user)             // throws if undefined, narrows below
+expect(user.name).toBe('Alice') // no `!`, no `as`
+
+// Narrows typeof / instanceof too
+expect.assert(typeof input === 'string')
+input.toUpperCase()
+
+// Chai assert helpers via the same namespace
+expect.assert.isDefined(maybeUser)
+expect.assert.instanceOf(error, MyError)
+```
+
+### `expect.unreachable`
+
+Type is `(message?: string) => never`, so a plain `if` guard narrows discriminated unions without `assert` helpers:
+
+```ts
+const result = v.safeParse(UserSchema, input) // { success: true, output } | { success: false, ... }
+if (!result.success)
+  expect.unreachable('should parse')
+expect(result.output.age).toBe(25) // narrowed to the success branch
+```
+
+Also use it to mark branches that must not run, e.g. after an `await` that should throw, or a `default` case in an exhaustive `switch`.
+
+## Poll Assertions
+
+Retry until passes (with fake timers on, timers are auto-advanced by `interval` after each failed attempt):
+
+```ts
+await expect.poll(() => fetchStatus()).toBe('ready')
+
+await expect.poll(
+  () => document.querySelector('.element'),
+  { interval: 100, timeout: 5000 }
+).toBeTruthy()
+```
+
+> **v5:** `expect.poll` now **rejects when it times out** (v4 could still pass on a late attempt). The callback receives an `AbortSignal` that aborts on timeout so you can cancel in-flight work:
+
+```ts
+await expect.poll(async ({ signal }) => {
+  const res = await fetch('/api/status', { signal })
+  return res.status
+}, { timeout: 1000 }).toBe(200)
+```
+
+## Assertion Count
+
+```ts
+test('async assertions', async () => {
+  expect.assertions(2) // Exactly 2 assertions must run
+  
+  await doAsync((data) => {
+    expect(data).toBeDefined()
+    expect(data.id).toBe(1)
+  })
+})
+
+test('at least one', () => {
+  expect.hasAssertions() // At least 1 assertion must run
+})
+```
+
+## Extending Matchers
+
+```ts
+expect.extend({
+  toBeWithinRange(received, floor, ceiling) {
+    const pass = received >= floor && received <= ceiling
+    return {
+      pass,
+      message: () => 
+        `expected ${received} to be within range ${floor} - ${ceiling}`,
+    }
+  },
+})
+
+test('custom matcher', () => {
+  expect(100).toBeWithinRange(90, 110)
+})
+```
+
+Inside a matcher, `this.equals(a, b, customTesters)` doesn't compare `Map`/`Set` contents; to match `toEqual`, pass `[...this.customTesters, this.utils.iterableEquality]` as the third argument.
+
+### TypeScript Declarations (v5)
+
+The `Matchers` interface now takes the **return type first** (`R`) and the received type second (`T`). `R` is `void` synchronously, `Promise<void>` through `.resolves`/`.rejects`/`expect.poll`/`expect.element`:
+
+```ts
+import 'vitest'
+
+declare module 'vitest' {
+  interface Matchers<R, T> {
+    toBeFoo: () => R
+    toEqualTyped: (expected: T) => R // T mirrors the received value's type
+  }
+}
+```
+
+Referencing assertion types directly also needs the return type first: `Assertion<void, string>` (sync) / `Assertion<Promise<void>, string>` (async). v5 no longer reads matchers from the global `jest.Matchers` interface — augment `vitest.Matchers` separately.
+
+## Snapshot Assertions
+
+```ts
+expect(data).toMatchSnapshot()
+expect(data).toMatchInlineSnapshot(`{ "id": 1 }`)
+await expect(result).toMatchFileSnapshot('./expected.json')
+
+expect(() => throw new Error('fail')).toThrowErrorMatchingSnapshot()
+```
+
+## Key Points
+
+- Use `toBe` for primitives, `toEqual` for objects/arrays
+- `toStrictEqual` checks undefined properties and array sparseness
+- Always `await` async assertions (`resolves`, `rejects`, `poll`)
+- Use context's `expect` in concurrent tests for correct tracking
+- `toThrow` requires wrapping sync code in a function
+- Use `expect.soft` for non-critical assertions; reserve hard `expect` for must-pass conditions
+- Use `expect.assert` (not `toBeTruthy`) when you also need TypeScript narrowing
+
+<!-- 
+Source references:
+- https://vitest.dev/api/expect.html
+- https://vitest.dev/guide/recipes/type-narrowing
+- https://vitest.dev/guide/recipes/schema-matching
+-->
diff --git a/.agents/skills/vitest/references/core-hooks.md b/.agents/skills/vitest/references/core-hooks.md
new file mode 100644
index 000000000..453fa141d
--- /dev/null
+++ b/.agents/skills/vitest/references/core-hooks.md
@@ -0,0 +1,244 @@
+---
+name: lifecycle-hooks
+description: beforeEach, afterEach, beforeAll, afterAll, and around hooks
+---
+
+# Lifecycle Hooks
+
+## Basic Hooks
+
+```ts
+import { afterAll, afterEach, beforeAll, beforeEach, test } from 'vitest'
+
+beforeAll(async () => {
+  // Runs once before all tests in file/suite
+  await setupDatabase()
+})
+
+afterAll(async () => {
+  // Runs once after all tests in file/suite
+  await teardownDatabase()
+})
+
+beforeEach(async () => {
+  // Runs before each test
+  await clearTestData()
+})
+
+afterEach(async () => {
+  // Runs after each test
+  await cleanupMocks()
+})
+```
+
+## Cleanup Return Pattern
+
+Return cleanup function from `before*` hooks:
+
+```ts
+beforeAll(async () => {
+  const server = await startServer()
+  
+  // Returned function runs as afterAll
+  return async () => {
+    await server.close()
+  }
+})
+
+beforeEach(async () => {
+  const connection = await connect()
+  
+  // Runs as afterEach
+  return () => connection.close()
+})
+```
+
+## Scoped Hooks
+
+Hooks apply to current suite and nested suites:
+
+```ts
+describe('outer', () => {
+  beforeEach(() => console.log('outer before'))
+  
+  test('test 1', () => {}) // outer before → test
+  
+  describe('inner', () => {
+    beforeEach(() => console.log('inner before'))
+    
+    test('test 2', () => {}) // outer before → inner before → test
+  })
+})
+```
+
+## Hook Timeout
+
+```ts
+beforeAll(async () => {
+  await slowSetup()
+}, 30_000) // 30 second timeout
+```
+
+## Around Hooks
+
+Wrap tests with setup/teardown context:
+
+```ts
+import { aroundEach, test } from 'vitest'
+
+// Wrap each test in database transaction
+aroundEach(async (runTest) => {
+  await db.beginTransaction()
+  await runTest() // Must be called!
+  await db.rollback()
+})
+
+test('insert user', async () => {
+  await db.insert({ name: 'Alice' })
+  // Automatically rolled back after test
+})
+```
+
+### aroundAll
+
+Wrap entire suite:
+
+```ts
+import { aroundAll, test } from 'vitest'
+
+aroundAll(async (runSuite) => {
+  console.log('before all tests')
+  await runSuite() // Must be called!
+  console.log('after all tests')
+})
+```
+
+### Multiple Around Hooks
+
+Nested like onion layers:
+
+```ts
+aroundEach(async (runTest) => {
+  console.log('outer before')
+  await runTest()
+  console.log('outer after')
+})
+
+aroundEach(async (runTest) => {
+  console.log('inner before')
+  await runTest()
+  console.log('inner after')
+})
+
+// Order: outer before → inner before → test → inner after → outer after
+```
+
+## Test Hooks
+
+Inside test body:
+
+```ts
+import { onTestFailed, onTestFinished, test } from 'vitest'
+
+test('with cleanup', () => {
+  const db = connect()
+  
+  // Runs after test finishes (pass or fail)
+  onTestFinished(() => db.close())
+  
+  // Only runs if test fails
+  onTestFailed(({ task }) => {
+    console.log('Failed:', task.result?.errors)
+  })
+  
+  db.query('SELECT * FROM users')
+})
+```
+
+### Reusable Cleanup Pattern
+
+```ts
+function useTestDb() {
+  const db = connect()
+  onTestFinished(() => db.close())
+  return db
+}
+
+test('query users', () => {
+  const db = useTestDb()
+  expect(db.query('SELECT * FROM users')).toBeDefined()
+})
+
+test('query orders', () => {
+  const db = useTestDb() // Fresh connection, auto-closed
+  expect(db.query('SELECT * FROM orders')).toBeDefined()
+})
+```
+
+## Concurrent Test Hooks
+
+For concurrent tests, use context's hooks:
+
+```ts
+test.concurrent('concurrent', ({ onTestFinished }) => {
+  const resource = allocate()
+  onTestFinished(() => resource.release())
+})
+```
+
+## Extended Test Hooks
+
+With `test.extend`, hooks are type-aware and must be called on the extended `test`:
+
+```ts
+const test = base
+  .extend('db', { scope: 'file' }, async ({}, { onCleanup }) => {
+    const db = await createDb()
+    onCleanup(() => db.close())
+    return db
+  })
+
+// Test-level hooks see fixtures
+test.beforeEach(({ db }) => db.seed())
+test.afterEach(({ db }) => db.clear())
+
+// Suite-level hooks (4.1+) can access file/worker-scoped fixtures
+test.beforeAll(({ db }) => db.createUsers())
+test.aroundAll(async (runSuite, { db }) => db.transaction(runSuite))
+```
+
+Suite-level hooks (`beforeAll`/`afterAll`/`aroundAll`) only see **file/worker-scoped** fixtures, and the **global** `beforeAll`/`afterAll` cannot access custom fixtures — use `test.beforeAll` etc.
+
+## Hook Execution Order
+
+Default order (stack):
+1. `beforeAll` (in order)
+2. `beforeEach` (in order)
+3. Test
+4. `afterEach` (reverse order)
+5. `afterAll` (reverse order)
+
+Configure with `sequence.hooks`:
+
+```ts
+defineConfig({
+  test: {
+    sequence: {
+      hooks: 'list', // 'stack' (default), 'list', 'parallel'
+    },
+  },
+})
+```
+
+## Key Points
+
+- Hooks are not called during type checking
+- Return cleanup function from `before*` to avoid `after*` duplication
+- `aroundEach`/`aroundAll` must call `runTest()`/`runSuite()`
+- `onTestFinished` always runs, even if test fails
+- Use context hooks for concurrent tests
+
+<!-- 
+Source references:
+- https://vitest.dev/api/hooks.html
+-->
diff --git a/.agents/skills/vitest/references/core-test-api.md b/.agents/skills/vitest/references/core-test-api.md
new file mode 100644
index 000000000..347632df4
--- /dev/null
+++ b/.agents/skills/vitest/references/core-test-api.md
@@ -0,0 +1,267 @@
+---
+name: test-api
+description: test/it function for defining tests with modifiers
+---
+
+# Test API
+
+## Basic Test
+
+```ts
+import { expect, test } from 'vitest'
+
+test('adds numbers', () => {
+  expect(1 + 1).toBe(2)
+})
+
+// Alias: it
+import { it } from 'vitest'
+
+it('works the same', () => {
+  expect(true).toBe(true)
+})
+```
+
+## Async Tests
+
+```ts
+test('async test', async () => {
+  const result = await fetchData()
+  expect(result).toBeDefined()
+})
+
+// Promises are automatically awaited
+test('returns promise', () => {
+  return fetchData().then(result => {
+    expect(result).toBeDefined()
+  })
+})
+```
+
+## Test Options
+
+```ts
+// Timeout (default: 5000ms)
+test('slow test', async () => {
+  // ...
+}, 10_000)
+
+// Or with options object
+test('with options', { timeout: 10_000, retry: 2 }, async () => {
+  // ...
+})
+```
+
+## Test Modifiers
+
+### Skip Tests
+
+```ts
+test.skip('skipped test', () => {
+  // Won't run
+})
+
+// Conditional skip
+test.skipIf(process.env.CI)('not in CI', () => {})
+test.runIf(process.env.CI)('only in CI', () => {})
+
+// Dynamic skip via context
+test('dynamic skip', ({ skip }) => {
+  skip(someCondition, 'reason')
+  // ...
+})
+```
+
+### Focus Tests
+
+```ts
+test.only('only this runs', () => {
+  // Other tests in file are skipped
+})
+```
+
+### Todo Tests
+
+```ts
+test.todo('implement later')
+
+test.todo('with body', () => {
+  // Not run, shows in report
+})
+```
+
+### Failing Tests
+
+```ts
+test.fails('expected to fail', () => {
+  expect(1).toBe(2) // Test passes because assertion fails
+})
+```
+
+### Concurrent Tests
+
+```ts
+// Run tests in parallel
+test.concurrent('test 1', async ({ expect }) => {
+  // Use context.expect for concurrent tests
+  expect(await fetch1()).toBe('result')
+})
+
+test.concurrent('test 2', async ({ expect }) => {
+  expect(await fetch2()).toBe('result')
+})
+```
+
+### Opt Out of Concurrency
+
+`test.sequential` was **removed in v5**. Use `concurrent: false` to opt a test out of inherited or globally configured concurrency:
+
+```ts
+test('must run alone', { concurrent: false }, async () => {})
+```
+
+## Parameterized Tests
+
+### test.each
+
+```ts
+test.each([
+  [1, 1, 2],
+  [1, 2, 3],
+  [2, 1, 3],
+])('add(%i, %i) = %i', (a, b, expected) => {
+  expect(a + b).toBe(expected)
+})
+
+// With objects
+test.each([
+  { a: 1, b: 1, expected: 2 },
+  { a: 1, b: 2, expected: 3 },
+])('add($a, $b) = $expected', ({ a, b, expected }) => {
+  expect(a + b).toBe(expected)
+})
+
+// Template literal
+test.each`
+  a    | b    | expected
+  ${1} | ${1} | ${2}
+  ${1} | ${2} | ${3}
+`('add($a, $b) = $expected', ({ a, b, expected }) => {
+  expect(a + b).toBe(expected)
+})
+```
+
+### test.for
+
+Preferred over `.each` - doesn't spread arrays:
+
+```ts
+test.for([
+  [1, 1, 2],
+  [1, 2, 3],
+])('add(%i, %i) = %i', ([a, b, expected], { expect }) => {
+  // Second arg is TestContext
+  expect(a + b).toBe(expected)
+})
+```
+
+> **v5:** titles are formatted with `pretty-format`, and a string interpolated through a `$` placeholder is **no longer quoted** (`case $id` → `case a1`, not `case 'a1'`). Interpolated-value length is capped by `taskTitleValueFormatTruncate` (default 40).
+
+## Test Context
+
+First argument provides context utilities:
+
+```ts
+test('with context', ({ expect, skip, task, signal, annotate }) => {
+  console.log(task.name)        // Test metadata
+  skip(someCondition, 'reason') // Skip dynamically
+  expect(1).toBe(1)             // Context-bound expect
+})
+
+// signal (3.2+): AbortSignal aborted on timeout/cancel/bail
+test('aborts on timeout', async ({ signal }) => {
+  await fetch('/resource', { signal })
+}, 2000)
+
+// annotate (3.2+): attach notes shown by the reporter
+test('annotated', async ({ annotate }) => {
+  await annotate('see issue #123', 'issues')
+})
+```
+
+## Custom Test with Fixtures
+
+Prefer the **builder pattern** (4.1+) for automatic type inference:
+
+```ts
+import { test as base } from 'vitest'
+
+const test = base
+  .extend('db', async ({}, { onCleanup }) => {
+    const db = await createDb()
+    onCleanup(() => db.close()) // runs after the test/scope
+    return db
+  })
+
+test('query', async ({ db }) => {
+  const users = await db.query('SELECT * FROM users')
+  expect(users).toBeDefined()
+})
+```
+
+See [features-context](features-context.md) for fixture scopes, `test.override`, and the Playwright-compatible object syntax.
+
+## Retry Configuration
+
+```ts
+test('flaky test', { retry: 3 }, async () => {
+  // Retries up to 3 times on failure
+})
+
+// Advanced retry options
+test('with delay', {
+  retry: {
+    count: 3,
+    delay: 1000,
+    condition: /timeout/i, // Only retry on timeout errors
+  },
+}, async () => {})
+```
+
+## Tags
+
+Tags must be declared in config first, then applied to tests (4.1+):
+
+```ts
+test('database test', { tags: ['db', 'slow'] }, async () => {})
+
+// Run with a tag expression:
+// vitest --tagsFilter "db && !flaky"
+```
+
+See [features-test-tags](features-test-tags.md) for defining tags and filter syntax.
+
+## Benchmarks (v5)
+
+`bench` is no longer a top-level import — it is a [test-context fixture](features-benchmarking.md) used inside `test()`:
+
+```ts
+// file must match benchmark.include (e.g. *.bench.ts)
+test('sort', async ({ bench }) => {
+  await bench('Array.sort', () => [3, 1, 2].sort()).run()
+})
+```
+
+## Key Points
+
+- Pass options as the **second argument**; the 3rd-arg options object was removed in v4 (a trailing timeout number is still allowed)
+- Tests with no body are marked as `todo`
+- `test.only` throws in CI unless `allowOnly: true`
+- Use context's `expect` for concurrent tests and snapshots
+- Function name is used as test name if passed as first arg
+- `test.sequential` was removed in v5 — use `{ concurrent: false }`
+
+<!-- 
+Source references:
+- https://vitest.dev/api/test.html
+-->
diff --git a/.agents/skills/vitest/references/features-benchmarking.md b/.agents/skills/vitest/references/features-benchmarking.md
new file mode 100644
index 000000000..e2074f45d
--- /dev/null
+++ b/.agents/skills/vitest/references/features-benchmarking.md
@@ -0,0 +1,100 @@
+---
+name: benchmarking
+description: Write benchmarks with the v5 bench test-context fixture (Tinybench)
+---
+
+# Benchmarking (v5)
+
+In v5 the benchmark API was rewritten: `bench` is **no longer a top-level import**. It is a [test-context fixture](features-context.md) used inside a regular `test()`, available only in files matched by `benchmark.include` (default `**/*.{bench,benchmark}.?(c|m)[jt]s?(x)`). Benchmarks are powered by [Tinybench](https://github.com/tinylibs/tinybench).
+
+## Defining & Running
+
+```ts
+import { expect, test } from 'vitest'
+
+test('parse performance', async ({ bench }) => {
+  // bench() registers; .run() executes and returns the result
+  const result = await bench('parse', () => {
+    const data = JSON.parse('{"key":"value"}')
+    use(data) // consume the result — engines may eliminate dead code
+  }).run()
+
+  expect(result.throughput.mean).toBeGreaterThan(10_000)
+})
+```
+
+Run benchmarks:
+
+```bash
+vitest bench           # only benchmarks (implicitly enables them)
+vitest bench parser    # filter by filename
+vitest bench -t JSON   # filter by test name
+```
+
+Set `benchmark: { enabled: true }` to run them alongside regular tests in a separate isolated group.
+
+## Comparing Implementations
+
+```ts
+test('compare parsers', async ({ bench }) => {
+  const result = await bench.compare(
+    bench('JSON.parse', () => { JSON.parse(input) }),
+    bench('custom', { beforeEach: () => reset() }, () => { customParse(input) }),
+    { iterations: 100, time: 1000 }, // shared Tinybench options (last arg)
+  )
+
+  // Assertion matchers (delta avoids flaky failures)
+  expect(result.get('JSON.parse')).toBeFasterThan(result.get('custom'), { delta: 0.1 })
+  expect(result.get('custom')).toBeSlowerThan(result.get('JSON.parse'))
+})
+```
+
+`bench.compare` interleaves iterations to reduce environmental bias and prints a comparison table after the test.
+
+## Storing & Replaying Baselines
+
+```ts
+test('compare against baseline', async ({ bench }) => {
+  await bench.compare(
+    bench('current', { writeResult: './benchmarks/parse.json' }, () => parse(input)),
+    bench.from('previous', './benchmarks/parse.json'),       // reads a stored result, no run
+    bench.from('remote', () => fetch(url).then(r => r.json())),
+  )
+})
+```
+
+- `writeResult` overwrites the JSON file on every successful run (no skip-when-cached).
+- `bench.from(name, source)` reads a stored result without invoking any function.
+- For multi-project workspaces, pass `{ perProject: true }` and use `${projectName}` in `writeResult` paths to collect a cross-project comparison table.
+
+## Stability Notes
+
+- Benchmark files run sequentially and never in parallel; `retry` and the `delta` option reduce flakiness.
+- Consume the result inside the bench fn — JS engines eliminate side-effect-free code.
+- In Node mode every imported binding goes through Vite's module-runner getter; store hot references locally (`const _parse = parse`), benchmark the built package, or disable `experimental.viteModuleRunner` for the bench project.
+
+## Custom Provider (experimental)
+
+Replace the built-in Tinybench engine by pointing `benchmark.provider` at a module whose default export implements `BenchmarkProvider`:
+
+```ts
+defineConfig({ test: { benchmark: { provider: './benchmark-provider.ts' } } })
+```
+
+## v5 Migration
+
+- `bench` top-level import → `({ bench })` from the test context
+- `bench.skip/only/todo` removed → use `test.skip/only/todo` on the surrounding test
+- `benchmark.reporters`/`outputFile`/`compare`/`outputJson` and `--compare`/`--outputJson` removed → use `--reporter=json --outputFile` (JSON now has a `benchmarks` field)
+
+## Key Points
+
+- Benchmarks live in `*.bench.ts` files and run inside `test()` via `{ bench }`
+- Use `bench.compare` + `toBeFasterThan`/`toBeSlowerThan` (with `delta`) for relative perf
+- Persist baselines with `writeResult` and replay with `bench.from`
+
+<!--
+Source references:
+- https://vitest.dev/guide/benchmarking
+- https://vitest.dev/guide/test-context#bench
+-->
diff --git a/.agents/skills/vitest/references/features-concurrency.md b/.agents/skills/vitest/references/features-concurrency.md
new file mode 100644
index 000000000..cff37cc4a
--- /dev/null
+++ b/.agents/skills/vitest/references/features-concurrency.md
@@ -0,0 +1,223 @@
+---
+name: concurrency-parallelism
+description: Concurrent tests, parallel execution, and sharding
+---
+
+# Concurrency & Parallelism
+
+## File Parallelism
+
+By default, Vitest runs test files in parallel across workers:
+
+```ts
+defineConfig({
+  test: {
+    // Run files in parallel (default: true)
+    fileParallelism: true,
+    
+    // Max concurrent workers (v4: replaces maxThreads/maxForks; minWorkers removed)
+    maxWorkers: 4,
+    
+    // Pool type: 'forks' (default), 'threads', 'vmForks', 'vmThreads'
+    pool: 'forks',
+  },
+})
+```
+
+> **v4 pool rework:** `poolOptions` was removed — all pool settings are now top-level. `singleThread`/`singleFork` become `maxWorkers: 1, isolate: false`. VM `memoryLimit` is `vmMemoryLimit`. These can now be set **per project**.
+
+## Concurrent Tests
+
+Run tests within a file in parallel:
+
+```ts
+// Individual concurrent tests
+test.concurrent('test 1', async ({ expect }) => {
+  expect(await fetch1()).toBe('result')
+})
+
+test.concurrent('test 2', async ({ expect }) => {
+  expect(await fetch2()).toBe('result')
+})
+
+// All tests in suite concurrent
+describe.concurrent('parallel suite', () => {
+  test('test 1', async ({ expect }) => {})
+  test('test 2', async ({ expect }) => {})
+})
+```
+
+**Important:** Use `{ expect }` from context for concurrent tests.
+
+## Opting Out of Concurrency
+
+`test.sequential`/`describe.sequential` were **removed in v5**. Use `{ concurrent: false }`:
+
+```ts
+describe.concurrent('mostly parallel', () => {
+  test('parallel 1', async () => {})
+
+  // Opt this test out of inherited concurrency
+  test('must run alone', { concurrent: false }, async () => {})
+})
+
+// Or an entire suite
+describe('sequential suite', { concurrent: false }, () => {
+  test('first', () => {})
+  test('second', () => {})
+})
+```
+
+Set `sequence.concurrent: true` to make all tests concurrent by default.
+
+## Max Concurrency
+
+Limit concurrent tests:
+
+```ts
+defineConfig({
+  test: {
+    maxConcurrency: 5, // Max concurrent tests per file
+  },
+})
+```
+
+## Isolation
+
+Each file runs in isolated environment by default:
+
+```ts
+defineConfig({
+  test: {
+    // Disable isolation for faster runs (less safe)
+    isolate: false,
+  },
+})
+```
+
+## Sharding
+
+Split tests across machines:
+
+```bash
+# Machine 1
+vitest run --shard=1/3
+
+# Machine 2
+vitest run --shard=2/3
+
+# Machine 3
+vitest run --shard=3/3
+```
+
+### CI Example (GitHub Actions)
+
+```yaml
+jobs:
+  test:
+    strategy:
+      matrix:
+        shard: [1, 2, 3]
+    steps:
+      - run: vitest run --shard=${{ matrix.shard }}/3 --reporter=blob
+      
+  merge:
+    needs: test
+    steps:
+      - run: vitest --merge-reports --reporter=junit
+```
+
+### Merge Reports
+
+```bash
+# Each shard outputs blob
+vitest run --shard=1/3 --reporter=blob --coverage
+vitest run --shard=2/3 --reporter=blob --coverage
+
+# Merge all blobs
+vitest --merge-reports --reporter=json --coverage
+```
+
+## Test Sequence
+
+Control test order:
+
+```ts
+defineConfig({
+  test: {
+    sequence: {
+      // Run tests in random order
+      shuffle: true,
+      
+      // Seed for reproducible shuffle
+      seed: 12345,
+      
+      // Hook execution order
+      hooks: 'stack', // 'stack', 'list', 'parallel'
+      
+      // All tests concurrent by default
+      concurrent: true,
+
+      // Order projects/groups run in (3.2+); lower runs first
+      groupOrder: 0,
+    },
+  },
+})
+```
+
+## Shuffle Tests
+
+Randomize to catch hidden dependencies:
+
+```ts
+// Via CLI
+vitest --shuffle
+
+// Per suite
+describe.shuffle('random order', () => {
+  test('test 1', () => {})
+  test('test 2', () => {})
+  test('test 3', () => {})
+})
+```
+
+## Pools (v4)
+
+`poolOptions` was removed; pool settings are now top-level and can be set per project:
+
+```ts
+defineConfig({
+  test: {
+    pool: 'forks',     // 'forks' (default) | 'threads' | 'vmForks' | 'vmThreads'
+    maxWorkers: 8,
+    isolate: true,     // threads/forks only; vm* pools are always isolated
+    vmMemoryLimit: '512MB',
+  },
+})
+```
+
+For per-project parallelism/isolation settings, see [advanced-projects](advanced-projects.md).
+
+## Bail on Failure
+
+Stop after first failure:
+
+```bash
+vitest --bail 1    # Stop after 1 failure
+vitest --bail      # Stop on first failure (same as --bail 1)
+```
+
+## Key Points
+
+- Files run in parallel by default (`pool: 'forks'`); tests within a file run sequentially unless `.concurrent`
+- `concurrent` only speeds up tests that **await** (I/O, timers); pure sync tests still block the thread
+- Always use context's `expect` in concurrent tests
+- Use `{ concurrent: false }` (not `.sequential`) to opt out
+- `maxWorkers` (not `maxThreads`/`maxForks`); `poolOptions` removed in v4
+- Sharding splits tests across CI machines; `--merge-reports` combines blob results
+
+<!-- 
+Source references:
+- https://vitest.dev/guide/parallelism.html
+- https://vitest.dev/guide/improving-performance.html
+-->
diff --git a/.agents/skills/vitest/references/features-context.md b/.agents/skills/vitest/references/features-context.md
new file mode 100644
index 000000000..08a089587
--- /dev/null
+++ b/.agents/skills/vitest/references/features-context.md
@@ -0,0 +1,163 @@
+---
+name: test-context-fixtures
+description: Test context, custom fixtures with test.extend (builder pattern), scopes, and test.override
+---
+
+# Test Context & Fixtures
+
+## Built-in Context
+
+Every test receives context as its first argument:
+
+```ts
+test('context', ({ task, expect, skip, signal, annotate }) => {
+  console.log(task.name)        // Test metadata (readonly)
+  expect(1).toBe(1)             // Expect bound to this test
+  skip(condition, 'reason')     // Skip dynamically
+})
+```
+
+Properties:
+- `task` — test metadata (name, file, etc.)
+- `expect` — expect bound to this test (required for concurrent snapshot tests)
+- `skip(condition?, message?)` — skip the test
+- `signal` (3.2+) — `AbortSignal` aborted on timeout/cancel/bail
+- `annotate(message, type?, attachment?)` (3.2+) — attach reporter annotations
+- `onTestFinished(fn)` / `onTestFailed(fn)` — per-test cleanup/handlers
+- `bench` (v5) — benchmark fixture (only in `*.bench.ts` files)
+
+## Custom Fixtures — Builder Pattern (4.1+, recommended)
+
+`.extend(name, options?, fixture)` infers types automatically. Use `onCleanup` for teardown:
+
+```ts
+import { test as baseTest } from 'vitest'
+
+export const test = baseTest
+  // Plain value — type inferred as { port: number; host: string }
+  .extend('config', { port: 3000, host: 'localhost' })
+  // Function fixture — can read previously defined fixtures
+  .extend('server', async ({ config }, { onCleanup }) => {
+    const server = await startServer(config)
+    onCleanup(() => server.close()) // runs after test/scope ends
+    return server
+  })
+
+test('uses server', ({ config, server }) => {
+  expect(server.url).toContain(String(config.port))
+})
+```
+
+> `onCleanup` can be called **once per fixture**. For multiple resources, split into separate fixtures.
+
+### Fixture Options
+
+```ts
+const test = baseTest
+  .extend('metrics', { auto: true }, () => new Metrics())       // runs for every test
+  .extend('config', { scope: 'worker' }, () => loadConfig())    // once per worker
+  .extend('db', { scope: 'file' }, async ({ config }, { onCleanup }) => {
+    const db = await createDatabase(config)
+    onCleanup(() => db.close())
+    return db
+  })
+  .extend('baseUrl', { injected: true }, () => 'http://localhost:3000') // overridable via config
+```
+
+## Object Syntax (Playwright-compatible)
+
+Uses the `use()` callback; types must be declared manually:
+
+```ts
+const test = baseTest.extend<{ page: Page; baseUrl: string }>({
+  page: async ({}, use) => {
+    const page = await browser.newPage()
+    await use(page)        // test runs here
+    await page.close()     // cleanup after
+  },
+  baseUrl: 'http://localhost:3000',
+})
+```
+
+Tuple form sets options: `fixture: [async ({}, use) => {…}, { scope: 'file' }]`.
+
+## Fixture Scopes (3.2+)
+
+| Scope | Lifetime | Can access |
+|-------|----------|------------|
+| `test` (default) | each test | worker + file + test fixtures + built-in context |
+| `file` | once per file | worker + file fixtures |
+| `worker` | once per worker process | only worker fixtures |
+
+Only `test`-scoped fixtures can access the built-in context (`task`, `expect`, …). In file/worker fixtures use `expect.getState().testPath` for the file path. By default every file is its own worker, so `file` and `worker` behave the same unless [isolation is disabled](features-concurrency.md).
+
+## Injected Fixtures (per-project values)
+
+```ts
+// fixtures.ts
+const test = baseTest.extend('url', { injected: true }, '/default')
+
+// vitest.config.ts — provide per project
+defineConfig({
+  test: {
+    projects: [
+      { test: { name: 'prod', provide: { url: 'https://prod' } } },
+    ],
+  },
+})
+```
+
+Read raw provided values without fixtures via `import { inject } from 'vitest'`.
+
+## Overriding Fixtures — test.override (4.1+)
+
+`test.override` replaces fixture values for a suite and its children (replaces the deprecated `test.scoped`):
+
+```ts
+describe('production', () => {
+  test
+    .override('config', { port: 8080, host: 'api.example.com' })
+    .override('debug', false)        // chainable
+
+  test('uses prod config', ({ server }) => {
+    expect(server.url).toBe('http://api.example.com:8080')
+  })
+})
+
+// Function override (reads other fixtures) with cleanup
+test.override('db', async ({ config }, { onCleanup }) => {
+  const db = await createTestDatabase(config)
+  onCleanup(() => db.drop())
+  return db
+})
+```
+
+You cannot introduce new fixtures or change `scope`/`auto` via `override`; use `test.extend` for new fixtures.
+
+## Composing & Hooks
+
+Extend an already-extended test, and use type-aware hooks on the extended `test`:
+
+```ts
+import { test as dbTest } from './db-test'
+
+export const test = dbTest.extend('user', ({ db }) => db.createUser())
+
+test.beforeEach(({ db }) => db.seed())            // sees fixtures
+test.beforeAll(({ db }) => db.migrate())          // file/worker fixtures only (4.1+)
+test.aroundAll(async (run, { db }) => db.tx(run))
+```
+
+## Key Points
+
+- Prefer the **builder pattern** — types are inferred, cleanup via `onCleanup`
+- Fixtures are lazy — only initialized when destructured
+- Always destructure `{ db }` (not `context.db`)
+- Use `{ scope: 'file' | 'worker' }` for expensive shared resources
+- Use `test.override` (not `test.scoped`) to vary fixture values per suite
+- Use `{ injected: true }` + project `provide` for per-project values
+
+<!-- 
+Source references:
+- https://vitest.dev/guide/test-context.html
+-->
diff --git a/.agents/skills/vitest/references/features-coverage.md b/.agents/skills/vitest/references/features-coverage.md
new file mode 100644
index 000000000..4aef2a363
--- /dev/null
+++ b/.agents/skills/vitest/references/features-coverage.md
@@ -0,0 +1,226 @@
+---
+name: code-coverage
+description: Code coverage with V8 or Istanbul providers
+---
+
+# Code Coverage
+
+## Setup
+
+```bash
+# Run tests with coverage
+vitest run --coverage
+```
+
+## Configuration
+
+```ts
+// vitest.config.ts
+defineConfig({
+  test: {
+    coverage: {
+      // Provider: 'v8' (default, faster) or 'istanbul' (more compatible)
+      provider: 'v8',
+      
+      // Enable coverage
+      enabled: true,
+      
+      // Reporters
+      reporter: ['text', 'json', 'html'],
+      
+      // v4: define `include` to report uncovered files too.
+      // Without it, only files loaded during the run are reported.
+      include: ['src/**/*.{ts,tsx}'],
+      
+      // Exclusion is applied to files matched by `include`
+      exclude: [
+        '**/*.d.ts',
+        '**/*.test.ts',
+      ],
+      
+      // Thresholds
+      thresholds: {
+        lines: 80,
+        functions: 80,
+        branches: 80,
+        statements: 80,
+      },
+
+      // v5 (v8 only): also cover node:child_process / node:worker_threads
+      // spawned during the run (adds overhead via NODE_V8_COVERAGE)
+      autoAttachSubprocess: false,
+    },
+  },
+})
+```
+
+## Providers
+
+### V8 (Default)
+
+```bash
+npm i -D @vitest/coverage-v8
+```
+
+- Faster, no pre-instrumentation
+- Uses V8's native coverage
+- v4 uses **AST-based remapping** (as accurate as Istanbul); expect coverage numbers to shift when upgrading from v3
+- Recommended for most projects
+
+### Istanbul
+
+```bash
+npm i -D @vitest/coverage-istanbul
+```
+
+- Pre-instruments code
+- Works in any JS runtime
+- More overhead but widely compatible
+
+## Reporters
+
+```ts
+coverage: {
+  reporter: [
+    'text',           // Terminal output
+    'text-summary',   // Summary only
+    'json',           // JSON file
+    'html',           // HTML report
+    'lcov',           // For CI tools
+    'cobertura',      // XML format
+  ],
+  reportsDirectory: './coverage',
+}
+```
+
+## Thresholds
+
+Fail tests if coverage is below threshold:
+
+```ts
+coverage: {
+  thresholds: {
+    // Global thresholds
+    lines: 80,
+    functions: 75,
+    branches: 70,
+    statements: 80,
+    
+    // Per-file thresholds
+    perFile: true,
+    
+    // Auto-update thresholds (for gradual improvement)
+    // v5: a function receives (newThreshold, previousThreshold)
+    autoUpdate: true,
+
+    // v5: glob thresholds no longer inherit top-level `perFile` — set it per glob
+    'src/utils/**': { lines: 80, perFile: true },
+  },
+}
+```
+
+## Ignoring Code
+
+### V8
+
+```ts
+/* v8 ignore next -- @preserve */
+function ignored() {
+  return 'not covered'
+}
+
+/* v8 ignore start -- @preserve */
+// All code here ignored
+/* v8 ignore stop -- @preserve */
+```
+
+### Istanbul
+
+```ts
+/* istanbul ignore next -- @preserve */
+function ignored() {}
+
+/* istanbul ignore if -- @preserve */
+if (condition) {
+  // ignored
+}
+```
+
+Note: `@preserve` keeps comments through esbuild.
+
+## Package.json Scripts
+
+```json
+{
+  "scripts": {
+    "test": "vitest",
+    "test:coverage": "vitest run --coverage",
+    "test:coverage:watch": "vitest --coverage"
+  }
+}
+```
+
+## Vitest UI Coverage
+
+Enable HTML coverage in Vitest UI:
+
+```ts
+coverage: {
+  enabled: true,
+  reporter: ['text', 'html'],
+}
+```
+
+Run with `vitest --ui` to view coverage visually.
+
+## CI Integration
+
+```yaml
+# GitHub Actions
+- name: Run tests with coverage
+  run: npm run test:coverage
+
+- name: Upload coverage to Codecov
+  uses: codecov/codecov-action@v3
+  with:
+    files: ./coverage/lcov.info
+```
+
+## Coverage with Sharding
+
+Merge coverage from sharded runs (blobs default to `.vitest/blob/`):
+
+```bash
+vitest run --shard=1/3 --coverage --reporter=blob
+vitest run --shard=2/3 --coverage --reporter=blob
+vitest run --shard=3/3 --coverage --reporter=blob
+
+vitest --merge-reports --coverage --reporter=json
+```
+
+## v5 Changes
+
+- **`include`/`exclude` match relative paths** (not absolute-with-`contains`), so patterns catch fewer files than v4 — a wildcard-free pattern like `'src'` means `src/**`. Re-verify the reported file set after upgrading.
+- **Glob thresholds don't inherit top-level `perFile`** — set `perFile` on each glob that needs it.
+- **`coverage.autoAttachSubprocess`** (v8) tracks child-process/worker-thread coverage.
+- **Istanbul moved to the maintained [`@vitest/istanbuljs`](https://github.com/vitest-dev/istanbuljs) fork**; the v8 provider merges reports with bounded memory.
+
+## v4 Changes
+
+- **`coverage.all` and `coverage.extensions` removed** — only covered files are reported unless `coverage.include` is set.
+- **`coverage.ignoreEmptyLines` removed**; lines without runtime code are no longer counted.
+- **`coverage.experimentalAstAwareRemapping` removed** — AST remapping is the default and only mode for V8.
+- Programmatic coverage APIs moved from `vitest/coverage` to `vitest/node`.
+
+## Key Points
+
+- V8 is faster, Istanbul is more compatible
+- Use `--coverage` flag or `coverage.enabled: true`
+- Define `coverage.include` to report uncovered source files
+- Set thresholds to enforce minimum coverage
+- Use `@preserve` comment to keep ignore hints (e.g. `/* v8 ignore next -- @preserve */`)
+
+<!-- 
+Source references:
+- https://vitest.dev/guide/coverage.html
+-->
diff --git a/.agents/skills/vitest/references/features-filtering.md b/.agents/skills/vitest/references/features-filtering.md
new file mode 100644
index 000000000..97010ad83
--- /dev/null
+++ b/.agents/skills/vitest/references/features-filtering.md
@@ -0,0 +1,226 @@
+---
+name: test-filtering
+description: Filter tests by name, file patterns, and tags
+---
+
+# Test Filtering
+
+## CLI Filtering
+
+### By File Path
+
+```bash
+# Run files containing "user"
+vitest user
+
+# Multiple patterns
+vitest user auth
+
+# Specific file
+vitest src/user.test.ts
+
+# By line number
+vitest src/user.test.ts:25
+```
+
+### By Test Name
+
+```bash
+# Tests matching pattern
+vitest -t "login"
+vitest --testNamePattern "should.*work"
+
+# Regex patterns
+vitest -t "/user|auth/"
+```
+
+## Changed Files
+
+```bash
+# Uncommitted changes
+vitest --changed
+
+# Since specific commit
+vitest --changed HEAD~1
+vitest --changed abc123
+
+# Since branch
+vitest --changed origin/main
+```
+
+## Since Last Run / Last Failed (5.1)
+
+```bash
+# Tests whose loaded files have a newer mtime than the test's last run (no Git needed)
+vitest run --since-last-run
+
+# Only tests that failed last time (read from the results cache; needs `cache` enabled)
+vitest run --last-failed
+vitest run --last-failed -t login   # combinable with other filters
+```
+
+`--since-last-run` enables `changed`, `experimental.recordDependencies` and the `mtime` VCS provider (`experimental.vcsProvider: 'mtime'`); the first run runs everything and records the loaded files (imports, mocks, setup files, snapshots) in `dependencies.json` in `cacheDir`. It cannot see files a test never loaded (new `.env`/`__mocks__` files) or mtimes set in the past by checkouts/archives. Good fit for agents: run `vitest run --since-last-run` after each edit and a full `vitest run` before finishing. Use `--changed <ref>` when the baseline must be shared (PR vs `origin/main`, CI).
+
+## Related Files
+
+Run tests that import specific files:
+
+```bash
+vitest related src/utils.ts src/api.ts --run
+```
+
+Useful with lint-staged:
+
+```js
+// .lintstagedrc.js
+export default {
+  '*.{ts,tsx}': 'vitest related --run',
+}
+```
+
+## Focus Tests (.only)
+
+```ts
+test.only('only this runs', () => {})
+
+describe.only('only this suite', () => {
+  test('runs', () => {})
+})
+```
+
+In CI, `.only` throws error unless configured:
+
+```ts
+defineConfig({
+  test: {
+    allowOnly: true, // Allow .only in CI
+  },
+})
+```
+
+## Skip Tests
+
+```ts
+test.skip('skipped', () => {})
+
+// Conditional
+test.skipIf(process.env.CI)('not in CI', () => {})
+test.runIf(!process.env.CI)('local only', () => {})
+
+// Dynamic skip
+test('dynamic', ({ skip }) => {
+  skip(someCondition, 'reason')
+})
+```
+
+## Tags
+
+Tags must be declared in config, then applied to tests/suites and filtered with a tag expression:
+
+```ts
+// vitest.config.ts
+defineConfig({
+  test: {
+    tags: [{ name: 'db' }, { name: 'slow' }, { name: 'flaky' }],
+  },
+})
+
+// test file
+test('database test', { tags: ['db'] }, () => {})
+```
+
+```bash
+vitest --tagsFilter "db && !flaky"
+vitest --tagsFilter "unit || e2e"
+vitest --list-tags            # show defined tags
+```
+
+Full syntax, priority, and per-tag options: see [features-test-tags](features-test-tags.md).
+
+## Include/Exclude Patterns
+
+```ts
+defineConfig({
+  test: {
+    // Test file patterns
+    include: ['**/*.{test,spec}.{ts,tsx}'],
+    
+    // Exclude patterns
+    exclude: [
+      '**/node_modules/**',
+      '**/e2e/**',
+      '**/*.skip.test.ts',
+    ],
+    
+    // Include source for in-source testing
+    includeSource: ['src/**/*.ts'],
+
+    // Scope discovery to a directory (faster than broad excludes)
+    dir: './src',
+  },
+})
+```
+
+> v4 simplified default `exclude` to only `node_modules`/`.git`. Prefer `test.dir` to limit where tests are found; spread `configDefaults.exclude` to restore the old excludes.
+
+## Watch Mode Filtering
+
+In watch mode, press:
+- `p` - Filter by filename pattern
+- `t` - Filter by test name pattern
+- `a` - Run all tests
+- `f` - Run only failed tests
+
+## Projects Filtering
+
+Run specific project:
+
+```bash
+vitest --project unit
+vitest --project integration --project e2e
+```
+
+## Environment-based Filtering
+
+```ts
+const isDev = process.env.NODE_ENV === 'development'
+const isCI = process.env.CI
+
+describe.skipIf(isCI)('local only tests', () => {})
+describe.runIf(isDev)('dev tests', () => {})
+```
+
+## Combining Filters
+
+```bash
+# File pattern + test name + changed
+vitest user -t "login" --changed
+
+# Related files + run mode
+vitest related src/auth.ts --run
+```
+
+## List Tests Without Running
+
+```bash
+vitest list                 # Show all test names
+vitest list -t "user"       # Filter by name
+vitest list --filesOnly     # Show only file paths
+vitest list --json          # JSON output
+```
+
+## Key Points
+
+- Use `-t` for test name pattern filtering
+- `--changed` runs only tests affected by changes
+- `--related` runs tests importing specific files
+- `--since-last-run` (5.1, experimental) / `--last-failed` (5.1) select by previous run state
+- Tags provide semantic test grouping
+- Use `.only` for debugging, but configure CI to reject it
+- Watch mode has interactive filtering
+
+<!-- 
+Source references:
+- https://vitest.dev/guide/filtering.html
+- https://vitest.dev/guide/cli.html
+-->
diff --git a/.agents/skills/vitest/references/features-mocking.md b/.agents/skills/vitest/references/features-mocking.md
new file mode 100644
index 000000000..785475adb
--- /dev/null
+++ b/.agents/skills/vitest/references/features-mocking.md
@@ -0,0 +1,356 @@
+---
+name: mocking
+description: Mock functions, modules, timers, and dates with vi utilities
+---
+
+# Mocking
+
+## Mock Functions
+
+```ts
+import { expect, vi } from 'vitest'
+
+// Create mock function
+const fn = vi.fn()
+fn('hello')
+
+expect(fn).toHaveBeenCalled()
+expect(fn).toHaveBeenCalledWith('hello')
+
+// With implementation
+const add = vi.fn((a, b) => a + b)
+expect(add(1, 2)).toBe(3)
+
+// Mock return values
+fn.mockReturnValue(42)
+fn.mockReturnValueOnce(1).mockReturnValueOnce(2)
+fn.mockResolvedValue({ data: true })
+fn.mockRejectedValue(new Error('fail'))
+
+// Mock implementation
+fn.mockImplementation((x) => x * 2)
+fn.mockImplementationOnce(() => 'first call')
+```
+
+`fn.mock.instances` (and `contexts`) has one entry per call: `this` for plain calls, or the object `new` returned (`undefined` if the constructor threw). `mockReturnValue`/`mockResolvedValue` etc. throw when the mock is called with `new`; use `mockImplementation` for classes.
+
+`fn.mock.calls` stores arguments **by reference**. If the argument is mutated after the call, assertions see the mutated value; clone at call time (e.g. `mockImplementation(arg => calls.push(structuredClone(arg)))`) when you need the pre-mutation state.
+
+## Spying on Objects
+
+```ts
+const cart = {
+  getTotal: () => 100,
+}
+
+const spy = vi.spyOn(cart, 'getTotal')
+cart.getTotal()
+
+expect(spy).toHaveBeenCalled()
+
+// Mock implementation
+spy.mockReturnValue(200)
+expect(cart.getTotal()).toBe(200)
+
+// Restore original
+spy.mockRestore()
+```
+
+Since v4, `vi.spyOn`/`vi.fn` can mock **constructors** — provide a `function` or `class` implementation (an arrow function throws "not a constructor"):
+
+```ts
+const Spy = vi.spyOn(cart, 'Apples').mockImplementation(class {
+  getApples() { return 0 }
+})
+const instance = new Spy()
+```
+
+## Conditional Mocking with vi.when (v5)
+
+Define per-argument behaviors without writing `if`/`switch` in `mockImplementation`:
+
+```ts
+vi.when(db.findById)
+  .calledWith(1)
+  .thenResolve({ id: 1, name: 'Ella' })
+  .calledWith(2)
+  .thenResolve({ id: 2, name: 'Gracie' })
+
+// Actions: thenReturn / thenThrow / thenResolve / thenReject (+ *Once variants)
+// `calledWith` supports asymmetric matchers
+vi.when(sendEmail).calledWith(expect.stringContaining('@')).thenReturn({ ok: true })
+```
+
+- Behaviors match **first-in-first-out** (register specific before broad); stacked actions on one behavior consume **last-in-first-out**, with `{ times }` to limit.
+- Handle unmatched calls with `{ onUnmatched: 'throw' | fn }` (default falls through to the original implementation).
+- Assert all behaviors ran with `expect(w).toHaveBeenExhausted()`.
+
+## Auto-Cleanup with `using`
+
+In runtimes with Explicit Resource Management (Node 24+, TS 5.2+), declare spies/mocks with `using` to auto-restore when the block exits — works with `vi.spyOn`, `vi.fn`, `vi.doMock`, and `vi.when`:
+
+```ts
+it('mocks console only here', () => {
+  using spy = vi.spyOn(console, 'log').mockImplementation(() => {})
+  debug('message')
+  expect(spy).toHaveBeenCalled()
+} ) // console.log restored automatically — no afterEach
+```
+
+## Module Mocking
+
+`vi.mock`, `vi.unmock`, and `vi.hoisted` are hoisted to the top of the file. In v5 calling them inside a function, block, or `describe`/`test` callback **throws** (it only warned before) — keep them at the module top level. Use `vi.doMock`/`vi.doUnmock` for non-hoisted, in-scope mocking.
+
+```ts
+// vi.mock is hoisted to top of file
+vi.mock('./api', () => ({
+  fetchUser: vi.fn(() => ({ id: 1, name: 'Mock' })),
+}))
+
+import { fetchUser } from './api'
+
+test('mocked module', () => {
+  expect(fetchUser()).toEqual({ id: 1, name: 'Mock' })
+})
+```
+
+### Typed Mocks with `import()`
+
+Pass `import('./db.js')` instead of a string. TypeScript infers the module type, so the factory's return value is type-checked and `importOriginal` is typed. IDE renames/moves also update the path.
+
+```ts
+vi.mock(import('./db.js'), () => ({
+  getUser: vi.fn(),
+}))
+```
+
+### Partial Mock
+
+```ts
+vi.mock(import('./utils'), async (importOriginal) => {
+  const actual = await importOriginal()
+  return {
+    ...actual,
+    specificFunction: vi.fn(),
+  }
+})
+```
+
+### Auto-mock with Spy
+
+```ts
+// Keep implementation but spy on calls
+vi.mock('./calculator', { spy: true })
+
+import { add } from './calculator'
+
+test('spy on module', () => {
+  const result = add(1, 2) // Real implementation
+  expect(result).toBe(3)
+  expect(add).toHaveBeenCalledWith(1, 2)
+})
+```
+
+### Manual Mocks (__mocks__)
+
+```
+src/
+  __mocks__/
+    axios.ts      # Mocks 'axios'
+  api/
+    __mocks__/
+      client.ts   # Mocks './client'
+    client.ts
+```
+
+```ts
+// Just call vi.mock with no factory
+vi.mock('axios')
+vi.mock('./api/client')
+```
+
+## Dynamic Mocking (vi.doMock)
+
+Not hoisted - use for dynamic imports:
+
+```ts
+test('dynamic mock', async () => {
+  vi.doMock('./config', () => ({
+    apiUrl: 'http://test.local',
+  }))
+  
+  const { apiUrl } = await import('./config')
+  expect(apiUrl).toBe('http://test.local')
+  
+  vi.doUnmock('./config')
+})
+```
+
+## Mock Timers
+
+```ts
+import { afterEach, beforeEach, vi } from 'vitest'
+
+beforeEach(() => {
+  vi.useFakeTimers()
+})
+
+afterEach(() => {
+  vi.useRealTimers()
+})
+
+test('timers', () => {
+  const fn = vi.fn()
+  setTimeout(fn, 1000)
+  
+  expect(fn).not.toHaveBeenCalled()
+  
+  vi.advanceTimersByTime(1000)
+  expect(fn).toHaveBeenCalled()
+})
+
+// Other timer methods
+vi.runAllTimers()           // Run all pending timers
+vi.runOnlyPendingTimers()   // Run only currently pending
+vi.advanceTimersToNextTimer() // Advance to next timer
+```
+
+### Async Timer Methods
+
+```ts
+test('async timers', async () => {
+  vi.useFakeTimers()
+  
+  let resolved = false
+  setTimeout(() => Promise.resolve().then(() => { resolved = true }), 100)
+  
+  await vi.advanceTimersByTimeAsync(100)
+  expect(resolved).toBe(true)
+})
+```
+
+## Mock Dates
+
+```ts
+vi.setSystemTime(new Date('2024-01-01'))
+expect(new Date().getFullYear()).toBe(2024)
+
+vi.useRealTimers() // Restore
+```
+
+v5 fake timers (and `vi.setSystemTime` used without them) also mock `Temporal` when it's on the global object, not just `Date`:
+
+```ts
+vi.setSystemTime(0)
+Temporal.Now.instant().epochMilliseconds // 0
+
+// keep Temporal native:
+vi.useFakeTimers({ toNotFake: ['Temporal'] })
+```
+
+### Auto-advancing and Tick Modes
+
+While fake timers are on, `vi.waitFor`/`vi.waitUntil` advance timers by `interval` before each check, and `expect.poll` advances by `interval` after each failed attempt, so they don't hang. `vi.setTimerTickMode('interval' | 'nextTimerAsync')` makes timers advance by themselves: `interval` steps fake time on a real-time interval (for state with a limited lifetime), `nextTimerAsync` fires the next pending timer after each macrotask (for code that eventually settles).
+
+`vi.setSystemTime` and the `now` option of `vi.useFakeTimers` also accept `Temporal.Instant`/`Temporal.ZonedDateTime`. Set `fakeTimers.fakeNodeBuiltins: true` to also fake `node:timers` and `node:timers/promises`.
+
+## Mock Globals
+
+```ts
+vi.stubGlobal('fetch', vi.fn(() => 
+  Promise.resolve({ json: () => ({ data: 'mock' }) })
+))
+
+// Restore
+vi.unstubAllGlobals()
+```
+
+## Mock Environment Variables
+
+```ts
+vi.stubEnv('API_KEY', 'test-key')
+expect(import.meta.env.API_KEY).toBe('test-key')
+
+// Restore
+vi.unstubAllEnvs()
+```
+
+## Clearing Mocks
+
+```ts
+const fn = vi.fn()
+fn()
+
+fn.mockClear()       // Clear call history
+fn.mockReset()       // Clear history + implementation
+fn.mockRestore()     // Restore original (for spies)
+
+// Global
+vi.clearAllMocks()
+vi.resetAllMocks()
+vi.restoreAllMocks()
+```
+
+## Config Auto-Reset
+
+```ts
+// vitest.config.ts
+defineConfig({
+  test: {
+    clearMocks: true,    // Clear call history before each test — v5 DEFAULT
+    mockReset: true,     // Reset before each test
+    restoreMocks: true,  // Restore after each test
+    unstubEnvs: true,    // Restore env vars
+    unstubGlobals: true, // Restore globals
+  },
+})
+```
+
+> **v5:** `clearMocks` defaults to `true`, so mock call history no longer leaks between tests. Mocks set up outside the test body (setup files, module top level, `beforeAll`) are most affected — their recorded calls are cleared before the asserting test runs. Set `clearMocks: false` to restore the old behavior.
+
+## Hoisted Variables for Mocks
+
+```ts
+const mockFn = vi.hoisted(() => vi.fn())
+
+vi.mock('./module', () => ({
+  getData: mockFn,
+}))
+
+import { getData } from './module'
+
+test('hoisted mock', () => {
+  mockFn.mockReturnValue('test')
+  expect(getData()).toBe('test')
+})
+```
+
+## v5 Behavior Changes
+
+- **Class mocks keep prototype methods.** `vi.fn(Dog)`, `vi.spyOn(obj, 'Dog')`, and `.mockImplementation(class …)` now chain the mock's `prototype` to the implementation's, so instance methods work and `instanceof Dog` passes. `mockReset` reverts the chain.
+- **Automocked modules stay automocked in the browser** — their exports return `undefined` unless you pass `{ spy: true }` or a factory.
+
+## v4 Behavior Changes
+
+- `vi.fn().getMockName()` returns `'vi.fn()'` (was `'spy'`); snapshots show `[MockFunction]` instead of `[MockFunction spy]`.
+- `vi.restoreAllMocks` (and `restoreMocks: true`) now **only restore `vi.spyOn` spies**; automocks are unaffected. `.mockRestore` still resets a mock's implementation/state.
+- `vi.fn().mock.invocationCallOrder` starts at `1` (Jest parity).
+- Automocked getters return `undefined` by default; automocked methods can't be restored.
+
+## Key Points
+
+- Prefer `vi.mock` for module mocking (hoisted - called before imports)
+- Use `vi.doMock` for dynamic, non-hoisted mocking
+- Use `vi.when` for argument-specific behaviors; `using` for scoped auto-restore
+- Use `{ spy: true }` to keep implementation but track calls
+- `vi.hoisted` lets you reference variables in mock factories
+- Prefer `vi.mock(import('./mod'), factory)` over a string path for type-checked factories
+
+<!-- 
+Source references:
+- https://vitest.dev/guide/mocking.html
+- https://vitest.dev/guide/learn/mock-functions
+- https://vitest.dev/api/vi.html
+- https://vitest.dev/guide/recipes/conditional-mocking
+- https://vitest.dev/guide/recipes/explicit-resources
+-->
diff --git a/.agents/skills/vitest/references/features-reporters.md b/.agents/skills/vitest/references/features-reporters.md
new file mode 100644
index 000000000..4b293b011
--- /dev/null
+++ b/.agents/skills/vitest/references/features-reporters.md
@@ -0,0 +1,110 @@
+---
+name: reporters
+description: Built-in reporters, default selection, and CI/output configuration
+---
+
+# Reporters
+
+Select reporters via `--reporter` or `reporters` config. Configuring `reporters` **replaces** the default list — spread `configDefaults.reporters` to keep them.
+
+```ts
+import { configDefaults, defineConfig } from 'vitest/config'
+
+export default defineConfig({
+  test: {
+    reporters: ['verbose', ['junit', { suiteName: 'UI tests' }]],
+    // keep defaults and add one:
+    // reporters: ['json', ...configDefaults.reporters],
+  },
+})
+```
+
+## Default Selection
+
+When `reporters` is unset, Vitest auto-selects:
+
+- `default` for normal terminal runs
+- **`minimal` (alias `agent`)** when it detects an **AI coding agent** — only failed tests + errors, no summary or passing logs, optimized to cut token usage
+- `github-actions` is added when `process.env.GITHUB_ACTIONS === 'true'`
+
+## Built-in Reporters
+
+| Reporter | Use |
+|----------|-----|
+| `default` | Summary + collapses passing files; prints full tree for single/failing file |
+| `verbose` | One line per finished test (flat list in v4); only reporter that shows annotations on pass |
+| `tree` | Like `default` but always shows each test (the old v3 verbose) |
+| `dot` | One dot per test; details only for failures |
+| `minimal` / `agent` | Failures only; best for AI/LLM workflows |
+| `junit` | JUnit XML (templated, see below) |
+| `json` | Jest-compatible JSON; includes `coverageMap` when coverage enabled |
+| `tap` / `tap-flat` | TAP (nested / flat) |
+| `html` | Interactive UI report (needs `@vitest/ui`) |
+| `blob` | Serialized results for `--merge-reports` |
+| `github-actions` | Workflow annotations + job summary |
+| `hanging-process` | Lists processes preventing exit (debugging) |
+
+> v4 removed the `basic` reporter (equivalent to `['default', { summary: false }]`). The old `verbose` flat behavior moved here; use `tree` for the nested view.
+
+## Output Files
+
+> **v5:** the `json` and `junit` reporters now **write to a file by default** (`.vitest/json/output.json`, `.vitest/junit/output.xml`) instead of stdout. If you piped output (`vitest --reporter=json | jq`), read the artifact instead or opt back in with `reporters: [['json', { stdout: true }]]`. An explicit `outputFile` is still respected.
+
+```bash
+vitest --reporter=json --outputFile=./test-output.json
+```
+
+```ts
+defineConfig({
+  test: {
+    reporters: ['junit', 'json'],
+    outputFile: { junit: './junit.xml', json: './report.json' },
+  },
+})
+```
+
+## JUnit Templating
+
+```ts
+reporters: [['junit', {
+  suiteNameTemplate: '{title}',     // {title} {filename} {basename} {displayName}
+  classnameTemplate: '{classname}', // {classname} {title} {suitename} {filename} ...
+  titleTemplate: '{title}',
+  ancestorSeparator: ' > ',
+  addFileAttribute: true,
+}]]
+```
+
+`{filename}` is the **relative** path (use `{basename}` for the bare name). Templates can also be functions receiving all variables.
+
+## HTML Report (v5 paths)
+
+The HTML reporter writes a directory via `outputDir` (default `.vitest`); the entry is `<outputDir>/index.html`. Use `singleFile: true` for a self-contained shareable file (large; coverage not inlined).
+
+```ts
+reporters: [['html', { singleFile: true }]]
+```
+
+## Blob & Merge (CI/sharding)
+
+Blobs default to `.vitest/blob/`. Label environments with `VITEST_BLOB_LABEL` or the reporter `label` option:
+
+```bash
+vitest run --reporter=blob --outputFile=reports/blob-1.json
+vitest --merge-reports=reports --reporter=junit --reporter=default
+```
+
+Blob reports don't include file attachments — merge `attachmentsDir` (`.vitest/attachments/`) separately. `--reporter=blob`/`--merge-reports` don't work in watch mode.
+
+## Key Points
+
+- Configuring `reporters` replaces defaults — spread `configDefaults.reporters` to keep them
+- The `minimal`/`agent` reporter is auto-selected for AI agents and minimizes token usage
+- Use `tree` for the nested per-test view (old v3 `verbose`)
+- v5 artifacts (blob, attachments, HTML) live under `.vitest/`
+
+<!--
+Source references:
+- https://vitest.dev/guide/reporters
+- https://vitest.dev/config/reporters
+-->
diff --git a/.agents/skills/vitest/references/features-snapshots.md b/.agents/skills/vitest/references/features-snapshots.md
new file mode 100644
index 000000000..60d3d5e2e
--- /dev/null
+++ b/.agents/skills/vitest/references/features-snapshots.md
@@ -0,0 +1,253 @@
+---
+name: snapshot-testing
+description: Snapshot testing with file, inline, and file snapshots
+---
+
+# Snapshot Testing
+
+Snapshot tests capture output and compare against stored references.
+
+## Basic Snapshot
+
+```ts
+import { expect, test } from 'vitest'
+
+test('snapshot', () => {
+  const result = generateOutput()
+  expect(result).toMatchSnapshot()
+})
+```
+
+First run creates `.snap` file:
+
+```js
+// __snapshots__/test.spec.ts.snap
+exports['snapshot 1'] = `
+{
+  "id": 1,
+  "name": "test"
+}
+`
+```
+
+## Inline Snapshots
+
+Stored directly in test file:
+
+```ts
+test('inline snapshot', () => {
+  const data = { foo: 'bar' }
+  expect(data).toMatchInlineSnapshot()
+})
+```
+
+Vitest updates the test file:
+
+```ts
+test('inline snapshot', () => {
+  const data = { foo: 'bar' }
+  expect(data).toMatchInlineSnapshot(`
+    {
+      "foo": "bar",
+    }
+  `)
+})
+```
+
+## File Snapshots
+
+Compare against explicit file:
+
+```ts
+test('render html', async () => {
+  const html = renderComponent()
+  await expect(html).toMatchFileSnapshot('./expected/component.html')
+})
+```
+
+## Snapshot Hints
+
+Add descriptive hints:
+
+```ts
+test('multiple snapshots', () => {
+  expect(header).toMatchSnapshot('header')
+  expect(body).toMatchSnapshot('body content')
+  expect(footer).toMatchSnapshot('footer')
+})
+```
+
+## Object Shape Matching
+
+Match partial structure:
+
+```ts
+test('shape snapshot', () => {
+  const data = { 
+    id: Math.random(), 
+    created: new Date(),
+    name: 'test' 
+  }
+  
+  expect(data).toMatchSnapshot({
+    id: expect.any(Number),
+    created: expect.any(Date),
+  })
+})
+```
+
+## Error Snapshots
+
+```ts
+test('error message', () => {
+  expect(() => {
+    throw new Error('Something went wrong')
+  }).toThrowErrorMatchingSnapshot()
+})
+
+test('inline error', () => {
+  expect(() => {
+    throw new Error('Bad input')
+  }).toThrowErrorMatchingInlineSnapshot(`[Error: Bad input]`)
+})
+```
+
+## Updating Snapshots
+
+```bash
+# Update all snapshots
+vitest -u
+vitest --update
+
+# In watch mode, press 'u' to update failed snapshots
+```
+
+In CI (`process.env.CI`), Vitest **never writes** snapshots: mismatches, missing snapshots, and **obsolete snapshots** (entries no longer matching any test) all fail the run.
+
+## Visual & ARIA Snapshots (Browser Mode)
+
+```ts
+import { expect, test } from 'vitest'
+import { page } from 'vitest/browser' // v4: import from 'vitest/browser'
+
+test('button looks correct', async () => {
+  await expect(page.getByRole('button')).toMatchScreenshot('primary-button')
+})
+
+// ARIA snapshot — assert the accessibility tree (4.1+, experimental)
+test('nav structure', async () => {
+  await expect.element(page.getByRole('navigation')).toMatchAriaInlineSnapshot(`
+    - navigation "Main":
+      - link "Home"
+  `)
+})
+```
+
+## Custom Snapshot Matchers (4.1+)
+
+Build matchers on the composable `Snapshots` helpers from `vitest` (replaces importing from `jest-snapshot`):
+
+```ts
+import { expect, Snapshots } from 'vitest'
+
+const { toMatchSnapshot, toMatchInlineSnapshot } = Snapshots
+
+expect.extend({
+  toMatchTrimmedSnapshot(received: string, length: number) {
+    return toMatchSnapshot.call(this, received.slice(0, length))
+  },
+  toMatchTrimmedInlineSnapshot(received: string, inlineSnapshot?: string) {
+    return toMatchInlineSnapshot.call(this, received.slice(0, 10), inlineSnapshot)
+  },
+})
+```
+
+The inline snapshot string must be the **last** argument. File snapshot matchers must be `async`.
+
+## Custom Serializers
+
+Add custom snapshot formatting:
+
+```ts
+expect.addSnapshotSerializer({
+  test(val) {
+    return val && typeof val.toJSON === 'function'
+  },
+  serialize(val, config, indentation, depth, refs, printer) {
+    return printer(val.toJSON(), config, indentation, depth, refs)
+  },
+})
+```
+
+Or via config:
+
+```ts
+// vitest.config.ts
+defineConfig({
+  test: {
+    snapshotSerializers: ['./my-serializer.ts'],
+  },
+})
+```
+
+## Snapshot Format Options
+
+```ts
+defineConfig({
+  test: {
+    snapshotFormat: {
+      printBasicPrototype: false, // Don't print Array/Object prototypes (Vitest default)
+      escapeString: false,
+      printShadowRoot: true,      // v4 default: custom elements print their shadow root
+    },
+  },
+})
+```
+
+## Concurrent Test Snapshots
+
+Use context's expect:
+
+```ts
+test.concurrent('concurrent 1', async ({ expect }) => {
+  expect(await getData()).toMatchSnapshot()
+})
+
+test.concurrent('concurrent 2', async ({ expect }) => {
+  expect(await getOther()).toMatchSnapshot()
+})
+```
+
+## Snapshot File Location
+
+Default: `__snapshots__/<test-file>.snap`
+
+Customize:
+
+```ts
+defineConfig({
+  test: {
+    resolveSnapshotPath: (testPath, snapExtension) => {
+      return testPath.replace('__tests__', '__snapshots__') + snapExtension
+    },
+  },
+})
+```
+
+## Key Points
+
+- Commit snapshot files to version control
+- Review snapshot changes in code review
+- Use hints for multiple snapshots in one test
+- Use `toMatchFileSnapshot` for large outputs (HTML, JSON)
+- Inline snapshots auto-update in test file
+- Use context's `expect` for concurrent tests
+- CI fails on obsolete snapshots; clean them with `--update`
+- v4 prints custom-element shadow roots; disable via `snapshotFormat.printShadowRoot: false`
+
+<!-- 
+Source references:
+- https://vitest.dev/guide/snapshot.html
+- https://vitest.dev/api/expect.html#tomatchsnapshot
+- https://vitest.dev/guide/browser/aria-snapshots
+-->
diff --git a/.agents/skills/vitest/references/features-test-tags.md b/.agents/skills/vitest/references/features-test-tags.md
new file mode 100644
index 000000000..d7671c1f6
--- /dev/null
+++ b/.agents/skills/vitest/references/features-test-tags.md
@@ -0,0 +1,123 @@
+---
+name: test-tags
+description: Label tests with tags to filter runs and apply shared runner options
+---
+
+# Test Tags (4.1+)
+
+Tags label tests so you can filter what runs and apply shared options (timeout, retry) to a *category* of tests that span many files. Reach for tags over projects when the category needs different timeouts/retries (not different pools/environments).
+
+## Defining Tags
+
+Tags **must be declared in config** — using an undefined tag throws unless `strictTags: false`. Each tag can carry options applied to every test marked with it:
+
+```ts
+// vitest.config.ts
+import { defineConfig } from 'vitest/config'
+
+export default defineConfig({
+  test: {
+    tags: [
+      { name: 'frontend', description: 'Frontend tests.' },
+      { name: 'db', description: 'Database queries.', timeout: 60_000 },
+      {
+        name: 'flaky',
+        retry: process.env.CI ? 3 : 0,
+        timeout: 30_000,
+        priority: 1, // lower priority number wins on conflicts
+      },
+    ],
+    strictTags: true, // default: error on unknown tags
+  },
+})
+```
+
+Type-safe tag names (augment `TestTags`, include the file in your tsconfig):
+
+```ts
+import 'vitest'
+
+declare module 'vitest' {
+  interface TestTags {
+    tags: 'frontend' | 'backend' | 'db' | 'flaky'
+  }
+}
+```
+
+## Applying Tags
+
+```ts
+import { describe, test } from 'vitest'
+
+test('renders homepage', { tags: ['frontend'] }, () => {})
+
+// Tags inherit from the parent suite
+describe('API endpoints', { tags: ['backend'] }, () => {
+  test('validates input', { tags: ['validation'] }, () => {
+    // has both "backend" (inherited) and "validation"
+  })
+})
+```
+
+Tag every test in a file with a JSDoc `@module-tag` at the top of the file (applies to **all** tests in the file, not just the next one):
+
+```ts
+/**
+ * @module-tag admin/pages/dashboard
+ */
+test('dashboard renders', () => {})
+```
+
+### Option conflict resolution
+
+When several tags set the same option on a test, `priority` wins first (lower number), then array order. Options on the test itself always win:
+
+```ts
+test('flaky db test', { tags: ['flaky', 'db'] }) // timeout 30_000 (flaky priority 1), retry 3
+test('override', { tags: ['flaky', 'db'], timeout: 120_000 }) // timeout 120_000, retry 3
+```
+
+## Filtering by Tag
+
+Use `--tagsFilter` with an expression:
+
+```bash
+vitest --tagsFilter "frontend"
+vitest --tagsFilter "db && !flaky"
+vitest --tagsFilter "(unit || e2e) && !slow"
+vitest --tagsFilter "api/*"            # wildcard
+vitest --list-tags                     # list defined tags (=json for JSON)
+```
+
+Operators: `and`/`&&`, `or`/`||`, `not`/`!`, `*` wildcard, `()` grouping. Precedence: `not` > `and` > `or`. Multiple `--tagsFilter` flags combine with AND. Tag names can't be `and`/`or`/`not` or contain special chars/spaces.
+
+Programmatic: pass `tagsFilter: ['frontend and backend']` to `startVitest`/`createVitest`.
+
+## Checking the Filter at Runtime
+
+Skip expensive setup when no matching tests are scheduled:
+
+```ts
+import { beforeAll, TestRunner } from 'vitest'
+
+beforeAll(async () => {
+  if (TestRunner.matchesTags(['db'])) {
+    await seedDatabase()
+  }
+})
+```
+
+Returns `true` when the active `--tagsFilter` would include a test with those tags (or when no filter is active).
+
+## Key Points
+
+- Tags must be declared in config; the CLI filter is `--tagsFilter` (not `--tags`)
+- Tags inherit from parent suites and `@module-tag` JSDoc comments
+- Use tags for cross-cutting categories with shared timeout/retry; use [projects](advanced-projects.md) for different pools/environments
+- `TestRunner.matchesTags` gates expensive `globalSetup`/`beforeAll` work
+
+<!--
+Source references:
+- https://vitest.dev/guide/test-tags
+- https://vitest.dev/config/tags
+-->
diff --git a/.bkit/core/.bkit/templates.md b/.bkit/core/.bkit/templates.md
index 562ceaec8..5ba0a451a 100644
--- a/.bkit/core/.bkit/templates.md
+++ b/.bkit/core/.bkit/templates.md
@@ -13,7 +13,7 @@
 
 ## What each template is for
 
-The adoption order is the `bkit tips` order. The local stack lock has no tip, because nothing in a repo shows a stack that every worktree shares, so adopt it once a second worktree touches that stack. The health check has no tip either: the `bkit-stub-health` advisory raises it while your CI copy keeps that stub. The sections below give each template's install steps and traps.
+The adoption order is the `bkit tips` order. The machine lock has no tip, so adopt it when test gates or local services need to run one at a time across checkouts. The health check has no tip either: the `bkit-stub-health` advisory raises it while your CI copy keeps that stub. The sections below give each template's install steps and traps.
 
 <!-- prettier-ignore -->
 | Template | What it's for | Skip it and |
@@ -38,7 +38,7 @@ The adoption order is the `bkit tips` order. The local stack lock has no tip, be
 | Prettier tables | One edited cell = one changed row in the diff. | A one-word table edit diffs as the whole table. |
 | tmp/ prune | Each push deletes scratch files agents left in `tmp/` untouched for a week. | `tmp/` keeps growing; old logs and scratch files are never cleared. |
 | Disk prune | Your own cleanup steps (build caches, Docker, simulators) run on commit, on push, and before a worktree is made on a low disk. bkit deletes nothing itself. | Caches fill the disk until no worktree can be made; every workflow stops. |
-| Local stack lock | One run at a time on local services every worktree shares (Docker database, emulator); a second run waits and names the run holding them. | A reset or stop from one worktree wipes the stack under another worktree's test run; the failures look like real bugs. |
+| Machine lock | Named locks run one gate at a time across repositories; the unnamed lock protects local services every worktree shares. A second run waits and names the holder. | Test gates compete for CPU, or a reset stops the stack under another worktree's test run. |
 | Cursor editor + cloud agent | Format-on-save, recommended extensions, Cursor cloud-agent image. | Cursor edits miss project formatting; no Cursor cloud agent. |
 | Launchd GUI env | macOS apps opened from the Dock get the same tokens as the terminal. | Dock-launched editors start signed out. |
 
@@ -71,7 +71,7 @@ The adoption order is the `bkit tips` order. The local stack lock has no tip, be
 | Prettier tables | `.bkit/templates/scripts/prettier/bkit-insert-ignore.mjs` | `scripts/prettier/` | that file |
 | tmp/ prune | `.bkit/templates/scripts/cleanup/bkit-tmp-prune.mjs` | `scripts/cleanup/` | that file |
 | Disk prune | `.bkit/templates/scripts/cleanup/bkit-disk-prune.mjs`, `bkit-disk-prune.machine.mjs` | `scripts/cleanup/bkit-disk-prune.mjs`, `~/.config/bkit/disk-prune.mjs` | `scripts/cleanup/bkit-disk-prune.mjs` only |
-| Local stack lock | `.bkit/templates/scripts/ci/bkit-local-stack-lock.sh` | `scripts/ci/` | that file |
+| Machine lock | `.bkit/templates/scripts/ci/bkit-machine-lock.sh` | `scripts/ci/` | that file |
 | Context-fetch blocks | `.bkit/templates/context/bkit-<provider>.md` | below `<!-- bkit:end -->` in `.agents/context.md` | the blocks you use |
 | Cloud SessionStart hook | `.bkit/templates/.claude/hooks/bkit-cloud-bootstrap.sh` | `.claude/hooks/bkit-cloud-bootstrap.sh` | that file |
 
@@ -622,7 +622,7 @@ Issues are the first input every workflow reads. There is one form per way work
 
 graphify runs on demand only. It is not an installed skill or git hook. graphify ships an MCP server (`graphify-mcp`, stdio default). That server stays unwired, because its answers come from the `graph.json` snapshot, and build / debug agents invalidate the graph faster than it rebuilds. Serena, which has no index to go stale, owns the agent surface.
 
-Two gates keep `docs/capabilities.md` current on dev: the pre-push block below, which blocks a stale push to dev or to a branch with an open PR into dev, and a self-skipping CI step on every push. Agents read `docs/capabilities.md`. Audit templates that need the graph build it via `scripts/graphify/bkit-graphify.sh`. The only tracked output is `docs/capabilities.md`. The Mermaid views are `docs/graphify-out/reports/graph-packages.mmd` and `graph-modules.mmd`. Reference: https://github.com/Graphify-Labs/graphify.
+Two gates keep `docs/capabilities.md` current on dev: the pre-push block below, which blocks a stale push to dev or to a branch with an open PR into dev, and a self-skipping CI step on every push. Agents read `docs/capabilities.md`. Audit templates that need the graph build it via `scripts/graphify/bkit-graphify.sh`. The tracked outputs are `docs/capabilities.md` and any copies of its packages diagram (below). The Mermaid views are `docs/graphify-out/reports/graph-packages.mmd` and `graph-modules.mmd`. Reference: https://github.com/Graphify-Labs/graphify.
 
 ```bash
 uv tool install "$(bash scripts/graphify/bkit-graphify.sh spec)"
@@ -679,10 +679,10 @@ graphify-out/
 | `pnpm graph` | Extract + cluster. Local. No API key. |
 | `pnpm graph:clean` | Same, after deleting `docs/graphify-out/`. Required after any tsconfig `paths` change. `--force` does not invalidate the module-resolution cache. |
 | `pnpm graph:update` | Re-extract changed files, then recluster. |
-| `pnpm graph:rollup` | Package and module views, plus `docs/capabilities.md`. |
-| `pnpm graph:check` | Rebuild and fail if `docs/capabilities.md` is not what this tree produces. Reads uncommitted edits. Shipped as a self-skipping CI step (every push and pull request; on a PR, GitHub's test merge into the base); enabled in bkit's own CI. |
+| `pnpm graph:rollup` | Package and module views, plus `docs/capabilities.md` and its diagram copies. |
+| `pnpm graph:check` | Rebuild and fail if `docs/capabilities.md` is not what this tree produces, or a diagram copy differs from it. Reads uncommitted edits. Shipped as a self-skipping CI step (every push and pull request; on a PR, GitHub's test merge into the base); enabled in bkit's own CI. |
 | `bash scripts/graphify/bkit-graphify.sh check-at <rev>` | `check` in a throwaway checkout of `<rev>` (default HEAD); pre-push gate runs it on the commit pushed to dev. |
-| `pnpm graph:refresh` | Rebuild register in a throwaway checkout of the staged files (the index) → copy over `docs/capabilities.md`. Stage the change first, so a run before its commit builds the new state. Fixes a red gate; commit result. |
+| `pnpm graph:refresh` | Rebuild register in a throwaway checkout of the staged files (the index) → copy over `docs/capabilities.md` → rewrite the diagram copies. Stage the change first, so a run before its commit builds the new state. Fixes a red gate; commit result. |
 | `pnpm graph:scoped [path]` | One subtree. Default `apps/web/src`. |
 | `pnpm graph:graphml` | Opt-in GraphML for Gephi / yEd. |
 
@@ -696,6 +696,14 @@ graphify-out/
 - **If** the repo has one module per file → edges are thinner, so lower the default in your copy.
 - An env override changes `docs/capabilities.md` per shell, and fails `pnpm graph:check`.
 
+To show the packages diagram in another doc, such as your `README.md`, copy `scripts/graphify/bkit-graph-embed.py`:
+
+- Put one `<!-- graph:packages:start -->` and one `<!-- graph:packages:end -->` line in the doc, where the diagram goes.
+- Add the doc's path to `GRAPH_EMBED_DOCS` in `bkit-graphify.sh`. Separate several paths with spaces.
+- `rollup`, `register` and `refresh` rewrite the block from `docs/capabilities.md`, so commit the doc with the register.
+- `check` fails when a copy differs from the register, so the pre-push block and CI gate the copies too.
+- **If** a listed doc lacks exactly one marker pair → the run exits 2.
+
 Iterate in mermaid.live, and render the internal-architecture diagram locally:
 
 ```bash
@@ -716,6 +724,8 @@ npx -y @mermaid-js/mermaid-cli -i docs/graphify-out/reports/graph-packages.mmd -
   - `by_package` / `by_module` in `bkit-graphify-rollup.py` (the diagram boxes)
 - **If** the repo has another layout → adapt all five. Otherwise capabilities read `gap`, and the diagrams come out empty.
 - **If** the repo has one flat source folder → `by_module` gives one node per file.
+- **If** the repo is a single package → have `by_package` return its top-level source folders, so each package box is one part of the codebase.
+- The packages diagram groups package boxes by their parent folder and gives each group one colour, so the keys `by_package` returns decide the groups.
 - **If** there are no web routes, or no imports between top-level folders → the route and package diagrams stay empty. That is the answer, not a fault.
 - The extract warning `had syntax errors and may be partially extracted` can fire on valid code. The symbols after that line are then missing from the graph, so treat that file as unmapped.
 
@@ -878,14 +888,14 @@ Every worktree of a repo uses the same local services when their names and ports
 
 ```bash
 mkdir -p scripts/ci
-cp .bkit/templates/scripts/ci/bkit-local-stack-lock.sh scripts/ci/
+cp .bkit/templates/scripts/ci/bkit-machine-lock.sh scripts/ci/
 ```
 
 <!-- prettier-ignore -->
 | Wire into | How | Holds the lock |
 | --- | --- | --- |
-| `package.json` scripts that start / reset / stop the stack | `"db:reset": "bash scripts/ci/bkit-local-stack-lock.sh run db:reset -- <reset command>"` | for the command; its exit status passes on |
-| local runners that test against the stack | `. scripts/ci/bkit-local-stack-lock.sh`, then `take_local_stack_lock "<who>"` before the first stack command; non-zero → exit | until the runner exits or calls `release_local_stack_lock` |
+| `package.json` scripts that start / reset / stop the stack | `"db:reset": "bash scripts/ci/bkit-machine-lock.sh run db:reset -- <reset command>"` | for the command; its exit status passes on |
+| local runners that test against the stack | `. scripts/ci/bkit-machine-lock.sh`, then `take_local_stack_lock "<who>"` before the first stack command; non-zero → exit | until the runner exits or calls `release_local_stack_lock` |
 
 - Functions (all safe under `set -e`):
   - `take_local_stack_lock` waits.
diff --git a/.bkit/core/.bkit/workflows.md b/.bkit/core/.bkit/workflows.md
index e8565ddc3..c1dc74b2c 100644
--- a/.bkit/core/.bkit/workflows.md
+++ b/.bkit/core/.bkit/workflows.md
@@ -33,7 +33,7 @@ The source files live in `.bkit/core/workflows/`. `bkit install` regenerates `.c
 | --- | --- | --- | --- |
 | `/bkit-design` | yes | yes | `docs/plans/{YYYYMM}/{FID}-design.md` |
 | `/bkit-plan` | yes | yes | `docs/plans/{YYYYMM}/{FID}-plan.md` |
-| `/bkit-build` | yes | no — CI continues | PR to `dev` with plan-link URL; with `publish=false` (local only), no push or PR: the build is held on `feat/{FID}` for `/bkit-ship` |
+| `/bkit-build` | yes | no — CI continues | PR to `dev` with plan-link URL; restored tests post under Plan Execute (step 7). With `publish=false` (local only), no push or PR: the build is held on `feat/{FID}` for `/bkit-ship` |
 | `/bkit-debug` | yes | no | Remediated commit pushed to feature branch |
 | `/bkit-ship` | yes | yes | Squash-merged PR; plans canonical at `docs/plans/{YYYYMM}/` (no archive move — `{YYYYMM}` = creation month); worktree gone |
 | `/bkit-auto` | args `{PHASE} {ARG}` (`{ARG}` = PR number **or** FID slug for ship / debug, issue for design/plan/build) | n/a (dispatches into the matching `/bkit-{phase}`) | Phase-routed; same session continues into the dispatched skill |
diff --git a/.bkit/core/engine/audits/repo/dogfood-templates.test.ts b/.bkit/core/engine/audits/repo/dogfood-templates.test.ts
index 84f58e214..638e68b2f 100644
--- a/.bkit/core/engine/audits/repo/dogfood-templates.test.ts
+++ b/.bkit/core/engine/audits/repo/dogfood-templates.test.ts
@@ -343,10 +343,7 @@ const ADOPTED: Record<string, Entry> = {
     status: "not-adopted",
     what: "ships with the opt-in guard",
   },
-  "scripts/ci/bkit-local-stack-lock.sh": {
-    status: "not-adopted",
-    what: "this repo starts no local service that its worktrees share",
-  },
+  "scripts/ci/bkit-machine-lock.sh": identical,
   "scripts/ci/bkit-check-capstone.mjs": identical,
   "scripts/ci/bkit-check-capstone.test.mjs": identical,
   "scripts/ci/bkit-check-dependency-audit.mjs": identical,
diff --git a/.bkit/core/engine/audits/templates/local-stack-lock.integration.test.ts b/.bkit/core/engine/audits/templates/local-stack-lock.integration.test.ts
deleted file mode 100644
index a7ab1247d..000000000
--- a/.bkit/core/engine/audits/templates/local-stack-lock.integration.test.ts
+++ /dev/null
@@ -1,264 +0,0 @@
-// audits/templates/local-stack-lock.integration.test.ts — the local stack lock bkit ships as a
-// copy-and-own template, run for real: real bash, real perl holder, real flock. Each test points
-// XDG_CACHE_HOME at its own folder, so a real run on this machine is never touched or waited on.
-
-import { type ChildProcess, spawn, spawnSync } from "node:child_process";
-import * as fs from "node:fs";
-import * as os from "node:os";
-import * as path from "node:path";
-
-import { afterEach, beforeEach, describe, expect, it } from "vitest";
-
-const SCRIPT = path.resolve(".bkit/templates/scripts/ci/bkit-local-stack-lock.sh");
-const CHECKOUT = spawnSync("git", ["-C", path.dirname(SCRIPT), "rev-parse", "--show-toplevel"], {
-  encoding: "utf-8",
-}).stdout.trim();
-
-interface Result {
-  status: number | null;
-  stdout: string;
-  stderr: string;
-  ms: number;
-}
-
-let tmp: string;
-let cache: string;
-let children: ChildProcess[];
-
-beforeEach(() => {
-  tmp = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-stack-lock-")));
-  cache = path.join(tmp, "cache");
-  children = [];
-});
-afterEach(() => {
-  for (const child of children) child.kill("SIGKILL");
-  fs.rmSync(tmp, { recursive: true, force: true });
-});
-
-/** The test's own lock folder; CI, an inherited owner and a stack name are cleared so the lock really runs. */
-function envFor(extra: Record<string, string> = {}): NodeJS.ProcessEnv {
-  const env: NodeJS.ProcessEnv = { ...process.env, XDG_CACHE_HOME: cache };
-  delete env.CI;
-  delete env.LOCAL_STACK_LOCK_OWNER;
-  delete env.BKIT_LOCAL_STACK;
-  return { ...env, ...extra };
-}
-
-/** Runs a bash snippet with `script` sourced. */
-function run(snippet: string, env: NodeJS.ProcessEnv, script = SCRIPT): Result {
-  const started = Date.now();
-  const r = spawnSync("bash", ["-c", `. "${script}"; ${snippet}`], {
-    env,
-    encoding: "utf-8",
-    timeout: 30_000,
-  });
-  return { status: r.status, stdout: r.stdout, stderr: r.stderr, ms: Date.now() - started };
-}
-
-/** A run that takes the lock and holds it `holdS` seconds; `locked` resolves once it holds it. */
-function hold(who: string, holdS: number, env: NodeJS.ProcessEnv, script = SCRIPT) {
-  const child = spawn(
-    "bash",
-    ["-c", `. "${script}"; take_local_stack_lock "${who}" || exit 1; echo locked; sleep ${holdS}`],
-    { env, stdio: ["ignore", "pipe", "pipe"] },
-  );
-  children.push(child);
-  const done = new Promise<void>((resolve) => child.on("exit", () => resolve()));
-  const locked = new Promise<void>((resolve, reject) => {
-    child.stdout.on("data", (d: Buffer) => {
-      if (String(d).includes("locked")) resolve();
-    });
-    child.on("exit", (code) => reject(new Error(`holder exited ${code} before taking the lock`)));
-  });
-  return { child, locked, done };
-}
-
-/** git in `cwd`, failing the test on a non-zero exit. */
-function git(cwd: string, args: string[]): void {
-  const r = spawnSync(
-    "git",
-    ["-c", "user.email=t@t", "-c", "user.name=t", "-c", "commit.gpgsign=false", ...args],
-    { cwd, encoding: "utf-8" },
-  );
-  expect(r.status, `git ${args.join(" ")}: ${r.stderr}`).toBe(0);
-}
-
-describe("bkit-local-stack-lock.sh", () => {
-  it("a second run cannot take the lock while the first holds it, and is told who holds it", async () => {
-    const env = envFor();
-    const first = hold("first run", 10, env);
-    await first.locked;
-    const second = run(`try_local_stack_lock "second run"`, env);
-    expect(second.status).toBe(1);
-    expect(second.stderr).toContain("first run");
-    expect(second.stderr).toContain(CHECKOUT);
-  });
-
-  it("a killed holder leaves no stale lock", async () => {
-    const env = envFor({ LOCAL_STACK_LOCK_WAIT_S: "10" });
-    const first = hold("killed run", 60, env);
-    await first.locked;
-    first.child.kill("SIGKILL");
-    await first.done;
-    const after = run(`take_local_stack_lock "next run" && echo got-it`, env);
-    expect(after.stdout, after.stderr).toContain("got-it");
-    expect(after.status).toBe(0);
-    expect(after.ms).toBeLessThan(8_000);
-  });
-
-  it("a waiting run starts as soon as the holder finishes, having said who it waits for", async () => {
-    const env = envFor({ LOCAL_STACK_LOCK_WAIT_S: "20" });
-    const first = hold("short run", 2, env);
-    await first.locked;
-    const second = run(`take_local_stack_lock "waiting run" && echo got-it`, env);
-    await first.done;
-    expect(second.stdout, second.stderr).toContain("got-it");
-    expect(second.stderr).toContain("waiting run is waiting for the local stack");
-    expect(second.stderr).toContain("in use by short run");
-    expect(second.ms).toBeGreaterThanOrEqual(1_000);
-  });
-
-  it("the wait gives up at LOCAL_STACK_LOCK_WAIT_S, naming the holder", async () => {
-    const env = envFor();
-    const first = hold("long run", 30, env);
-    await first.locked;
-    const second = run(`take_local_stack_lock "impatient run"`, {
-      ...env,
-      LOCAL_STACK_LOCK_WAIT_S: "2",
-    });
-    expect(second.status).toBe(1);
-    expect(second.stderr).toMatch(/impatient run gave up after 2s .*long run/);
-  });
-
-  it("release frees the lock before the caller exits", () => {
-    const r = run(
-      `take_local_stack_lock a || exit 1
-       release_local_stack_lock
-       bash -c '. "${SCRIPT}"; try_local_stack_lock b' || exit 9
-       echo released`,
-      envFor(),
-    );
-    expect(r.stdout, r.stderr).toContain("released");
-    expect(r.status).toBe(0);
-  });
-
-  it("a caller under `set -e` survives a refused try", async () => {
-    const env = envFor();
-    const first = hold("busy run", 30, env);
-    await first.locked;
-    const busy = run(`set -e; if try_local_stack_lock a; then :; fi; echo after-busy`, env);
-    expect(busy.stdout, busy.stderr).toContain("after-busy");
-  });
-
-  it("a caller under `set -e` survives releasing a holder that is already gone", () => {
-    const gone = run(
-      `set -e; take_local_stack_lock a; kill "$LOCAL_STACK_LOCK_PID"; sleep 0.3; release_local_stack_lock; echo after-release`,
-      envFor({ LOCAL_STACK_LOCK_WAIT_S: "10" }),
-    );
-    expect(gone.stdout, gone.stderr).toContain("after-release");
-  });
-
-  it("a runner started by the holder does not wait on its parent", () => {
-    const r = run(
-      `take_local_stack_lock parent || exit 1
-       LOCAL_STACK_LOCK_WAIT_S=2 bash -c '. "${SCRIPT}"; take_local_stack_lock child' && echo nested-ok`,
-      envFor(),
-    );
-    expect(r.stdout, r.stderr).toContain("nested-ok");
-    expect(r.stderr).not.toContain("waiting");
-  });
-
-  it("a stack named by BKIT_LOCAL_STACK never waits on the shared one", async () => {
-    const env = envFor();
-    const first = hold("shared run", 30, env);
-    await first.locked;
-    const r = run(`try_local_stack_lock throwaway && local_stack_lock_file`, {
-      ...env,
-      BKIT_LOCAL_STACK: "throwaway-test",
-    });
-    expect(r.status, r.stderr).toBe(0);
-    expect(r.stdout.trim()).toBe(
-      path.join(cache, "bkit", "local-stack-lock", "throwaway-test.lock"),
-    );
-  });
-
-  it("every worktree of one repo resolves the main checkout's lock, and waits on it", async () => {
-    const main = path.join(tmp, "app-main");
-    const worktree = path.join(tmp, "app-feature");
-    fs.mkdirSync(path.join(main, "scripts", "ci"), { recursive: true });
-    fs.copyFileSync(SCRIPT, path.join(main, "scripts", "ci", "bkit-local-stack-lock.sh"));
-    git(tmp, ["init", "-q", "-b", "dev", main]);
-    git(main, ["add", "."]);
-    git(main, ["commit", "-q", "-m", "init"]);
-    git(main, ["worktree", "add", "-q", "-b", "feat", worktree]);
-    const inMain = path.join(main, "scripts", "ci", "bkit-local-stack-lock.sh");
-    const inWorktree = path.join(worktree, "scripts", "ci", "bkit-local-stack-lock.sh");
-    const env = envFor();
-
-    const lockFile = path.join(cache, "bkit", "local-stack-lock", "app-main.lock");
-    expect(run("local_stack_lock_file", env, inMain).stdout.trim()).toBe(lockFile);
-    expect(run("local_stack_lock_file", env, inWorktree).stdout.trim()).toBe(lockFile);
-
-    const first = hold("main run", 30, env, inMain);
-    await first.locked;
-    const second = run(`try_local_stack_lock "worktree run"`, env, inWorktree);
-    expect(second.status).toBe(1);
-    expect(second.stderr).toContain(`main run — ${main}`);
-  });
-
-  it("outside a git checkout with no BKIT_LOCAL_STACK it refuses, saying why", () => {
-    const loose = path.join(tmp, "loose");
-    fs.mkdirSync(loose);
-    fs.copyFileSync(SCRIPT, path.join(loose, "bkit-local-stack-lock.sh"));
-    const r = run(
-      `take_local_stack_lock "loose run"`,
-      envFor({ GIT_CEILING_DIRECTORIES: tmp }),
-      path.join(loose, "bkit-local-stack-lock.sh"),
-    );
-    expect(r.status).toBe(1);
-    expect(r.stderr).toContain("cannot name the local stack");
-    expect(fs.existsSync(path.join(cache, "bkit"))).toBe(false);
-  });
-
-  it("a holder that stops before it answers fails the take at once instead of hanging", () => {
-    const broken = path.join(tmp, "broken-lock.sh");
-    const text = fs.readFileSync(SCRIPT, "utf-8");
-    expect(text).toContain("/usr/bin/perl -e '\n");
-    fs.writeFileSync(broken, text.replace("/usr/bin/perl -e '\n", "/usr/bin/perl -e 'exit 1;\n"));
-    const r = run(`take_local_stack_lock "doomed run"`, envFor({ BKIT_LOCAL_STACK: "x" }), broken);
-    expect(r.status).toBe(1);
-    expect(r.stderr).toContain("stopped before it answered");
-    expect(r.ms).toBeLessThan(10_000);
-  });
-
-  it.each(["true", "1"])("CI=%s is a no-op that creates no lock file", (ci) => {
-    const r = run(`take_local_stack_lock ci-run && echo ok`, envFor({ CI: ci }));
-    expect(r.stdout, r.stderr).toContain("ok");
-    expect(r.status).toBe(0);
-    expect(fs.existsSync(path.join(cache, "bkit"))).toBe(false);
-  });
-
-  it("`run` holds the lock for the command and passes its exit status on", () => {
-    const r = spawnSync(
-      "bash",
-      [
-        SCRIPT,
-        "run",
-        "pkg script",
-        "--",
-        "bash",
-        "-c",
-        'cat "$XDG_CACHE_HOME"/bkit/local-stack-lock/*.holder; exit 3',
-      ],
-      { env: envFor(), encoding: "utf-8" },
-    );
-    expect(r.status, r.stderr).toBe(3);
-    expect(r.stdout).toContain("pkg script");
-  });
-
-  it("`run` with no arguments prints usage and exits 2", () => {
-    const r = spawnSync("bash", [SCRIPT], { env: envFor(), encoding: "utf-8" });
-    expect(r.status).toBe(2);
-    expect(r.stderr).toContain("usage");
-  });
-});
diff --git a/.bkit/core/engine/audits/templates/machine-lock.integration.test.ts b/.bkit/core/engine/audits/templates/machine-lock.integration.test.ts
new file mode 100644
index 000000000..f585cf497
--- /dev/null
+++ b/.bkit/core/engine/audits/templates/machine-lock.integration.test.ts
@@ -0,0 +1,613 @@
+// audits/templates/machine-lock.integration.test.ts — the local stack lock bkit ships as a
+// copy-and-own template, run for real: real bash, real perl holder, real flock. Each test points
+// XDG_CACHE_HOME at its own folder, so a real run on this machine is never touched or waited on.
+
+import { type ChildProcess, spawn, spawnSync } from "node:child_process";
+import * as fs from "node:fs";
+import * as os from "node:os";
+import * as path from "node:path";
+import { setTimeout as delay } from "node:timers/promises";
+
+import { afterEach, beforeEach, describe, expect, it } from "vitest";
+
+import { tierTimeouts } from "../../../../../vitest.timeout-budget";
+
+const OLD_SCRIPT = path.resolve("tests/fixtures/machine-lock/stack-lock-6.0.0.sh");
+const BUDGET = tierTimeouts(true);
+
+const SCRIPT = path.resolve(".bkit/templates/scripts/ci/bkit-machine-lock.sh");
+const CHECKOUT = spawnSync("git", ["-C", path.dirname(SCRIPT), "rev-parse", "--show-toplevel"], {
+  encoding: "utf-8",
+}).stdout.trim();
+
+interface Result {
+  status: number | null;
+  stdout: string;
+  stderr: string;
+  ms: number;
+}
+
+let tmp: string;
+let cache: string;
+let children: ChildProcess[];
+
+beforeEach(() => {
+  tmp = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-stack-lock-")));
+  cache = path.join(tmp, "cache");
+  children = [];
+});
+afterEach(() => {
+  for (const child of children) child.kill("SIGKILL");
+  fs.rmSync(tmp, { recursive: true, force: true });
+});
+
+/** The test's own lock folder; CI, an inherited owner and a stack name are cleared so the lock really runs. */
+function envFor(extra: Record<string, string> = {}): NodeJS.ProcessEnv {
+  const env: NodeJS.ProcessEnv = { ...process.env, XDG_CACHE_HOME: cache };
+  delete env.CI;
+  for (const key of Object.keys(env)) {
+    if (key.startsWith("LOCAL_STACK_LOCK_OWNER") || key.startsWith("LOCAL_STACK_LOCK_PID")) {
+      delete env[key];
+    }
+  }
+  delete env.BKIT_TEST_SLOTS;
+  delete env.BKIT_LOCAL_STACK;
+  return { ...env, ...extra };
+}
+
+/** Runs a bash snippet with `script` sourced. */
+function run(
+  snippet: string,
+  env: NodeJS.ProcessEnv,
+  script = SCRIPT,
+  cwd = process.cwd(),
+): Result {
+  const started = Date.now();
+  const r = spawnSync("bash", ["-c", `. "${script}"; ${snippet}`], {
+    env,
+    cwd,
+    encoding: "utf-8",
+    timeout: BUDGET.testTimeout,
+  });
+  return { status: r.status, stdout: r.stdout, stderr: r.stderr, ms: Date.now() - started };
+}
+
+/** A run that takes the lock and holds it `holdS` seconds; `locked` resolves once it holds it. */
+function hold(
+  who: string,
+  holdS: number,
+  env: NodeJS.ProcessEnv,
+  script = SCRIPT,
+  cwd = process.cwd(),
+) {
+  const child = spawn(
+    "bash",
+    ["-c", `. "${script}"; take_local_stack_lock "${who}" || exit 1; echo locked; sleep ${holdS}`],
+    { env, cwd, stdio: ["ignore", "pipe", "pipe"] },
+  );
+  children.push(child);
+  const done = new Promise<void>((resolve) => child.on("exit", () => resolve()));
+  const lockFile = run("local_stack_lock_file", env, script, cwd);
+  const locked = waitForHolder(lockFile.stdout.trim() + ".holder", who, child);
+  return { child, locked, done };
+}
+
+/** git in `cwd`, failing the test on a non-zero exit. */
+function git(cwd: string, args: string[]): void {
+  const r = spawnSync(
+    "git",
+    ["-c", "user.email=t@t", "-c", "user.name=t", "-c", "commit.gpgsign=false", ...args],
+    { cwd, encoding: "utf-8" },
+  );
+  expect(r.status, `git ${args.join(" ")}: ${r.stderr}`).toBe(0);
+}
+
+async function waitForHolder(file: string, who: string, child: ChildProcess): Promise<void> {
+  const until = Date.now() + BUDGET.hookTimeout;
+  while (Date.now() < until) {
+    if (fs.existsSync(file) && fs.readFileSync(file, "utf-8").includes(who)) return;
+    if (child.exitCode !== null || child.signalCode !== null) {
+      throw new Error("holder " + who + " exited before writing " + file);
+    }
+    await delay(25);
+  }
+  throw new Error("holder " + who + " did not write " + file);
+}
+
+function holdNamed(
+  who: string,
+  name: string,
+  env: NodeJS.ProcessEnv,
+  script = SCRIPT,
+  holdS = 30,
+  cwd = process.cwd(),
+) {
+  const child = spawn(
+    "bash",
+    [
+      "-c",
+      '. "' +
+        script +
+        '"; take_local_stack_lock "' +
+        who +
+        '" "' +
+        name +
+        '" || exit 1; sleep ' +
+        holdS,
+    ],
+    { env, cwd, stdio: ["ignore", "pipe", "pipe"] },
+  );
+  children.push(child);
+  const done = new Promise<void>((resolve) => child.on("exit", () => resolve()));
+  const locked = waitForHolder(
+    path.join(cache, "bkit", "machine-lock", name + ".lock.holder"),
+    who,
+    child,
+  );
+  return { child, locked, done };
+}
+
+function checkout(name: string): { root: string; script: string } {
+  const root = path.join(tmp, name);
+  const script = path.join(root, "scripts", "ci", "bkit-machine-lock.sh");
+  fs.mkdirSync(path.dirname(script), { recursive: true });
+  fs.copyFileSync(SCRIPT, script);
+  git(tmp, ["init", "-q", "-b", "dev", root]);
+  return { root, script };
+}
+
+function commandRun(
+  args: string[],
+  env: NodeJS.ProcessEnv,
+  script = SCRIPT,
+  cwd = process.cwd(),
+): Result {
+  const started = Date.now();
+  const result = spawnSync("bash", [script, "run", ...args], {
+    env,
+    cwd,
+    encoding: "utf-8",
+    timeout: BUDGET.testTimeout,
+  });
+  return {
+    status: result.status,
+    stdout: result.stdout,
+    stderr: result.stderr,
+    ms: Date.now() - started,
+  };
+}
+
+describe("bkit-machine-lock.sh", { timeout: BUDGET.testTimeout }, () => {
+  it("punctuation in distinct named locks keeps acquisition and release state separate", () => {
+    const result = run(
+      'take_local_stack_lock "hyphen holder" a-b || exit 11\n' +
+        'take_local_stack_lock "underscore holder" a_b || exit 12\n' +
+        "local_stack_lock_holder a-b\nlocal_stack_lock_holder a_b\n" +
+        "release_local_stack_lock a-b\n" +
+        'printf "remaining: "; local_stack_lock_holder a_b\n' +
+        "release_local_stack_lock a_b",
+      envFor(),
+    );
+    expect(result.status, result.stderr).toBe(0);
+    expect(result.stdout).toContain("hyphen holder");
+    expect(result.stdout).toContain("underscore holder");
+    expect(result.stdout).toContain("remaining: underscore holder");
+  });
+
+  it.each(["", "tests", "a-b"])("unset owner state is safe under bash -eu for lock %j", (name) => {
+    const result = spawnSync(
+      "bash",
+      [
+        "-eu",
+        "-c",
+        '. "$1"; take_local_stack_lock "strict caller" "$2"; local_stack_lock_holder "$2"; release_local_stack_lock "$2"; release_local_stack_lock "$2"',
+        "strict-lock",
+        SCRIPT,
+        name,
+      ],
+      {
+        env: envFor({ BKIT_LOCAL_STACK: "strict-stack" }),
+        encoding: "utf-8",
+        timeout: BUDGET.testTimeout,
+      },
+    );
+    expect(result.status, result.stderr).toBe(0);
+    expect(result.stdout).toContain("strict caller");
+    expect(result.stderr).not.toContain("unbound variable");
+  });
+
+  it("a second run cannot take the lock while the first holds it, and is told who holds it", async () => {
+    const env = envFor();
+    const first = hold("first run", 10, env);
+    await first.locked;
+    const second = run(`try_local_stack_lock "second run"`, env);
+    expect(second.status).toBe(1);
+    expect(second.stderr).toContain("first run");
+    expect(second.stderr).toContain(CHECKOUT);
+  });
+
+  it("a killed holder leaves no stale lock", async () => {
+    const env = envFor({ LOCAL_STACK_LOCK_WAIT_S: "10" });
+    const first = hold("killed run", 60, env);
+    await first.locked;
+    first.child.kill("SIGKILL");
+    await first.done;
+    const after = run(`take_local_stack_lock "next run" && echo got-it`, env);
+    expect(after.stdout, after.stderr).toContain("got-it");
+    expect(after.status).toBe(0);
+    expect(after.ms).toBeLessThan(8_000);
+  });
+
+  it("a waiting run starts as soon as the holder finishes, having said who it waits for", async () => {
+    const env = envFor({ LOCAL_STACK_LOCK_WAIT_S: "20" });
+    const first = hold("short run", 2, env);
+    await first.locked;
+    const second = run(`take_local_stack_lock "waiting run" && echo got-it`, env);
+    await first.done;
+    expect(second.stdout, second.stderr).toContain("got-it");
+    expect(second.stderr).toContain("waiting run is waiting for the local stack");
+    expect(second.stderr).toContain("in use by short run");
+    expect(second.ms).toBeGreaterThanOrEqual(1_000);
+  });
+
+  it("the wait gives up at LOCAL_STACK_LOCK_WAIT_S, naming the holder", async () => {
+    const env = envFor();
+    const first = hold("long run", 30, env);
+    await first.locked;
+    const second = run(`take_local_stack_lock "impatient run"`, {
+      ...env,
+      LOCAL_STACK_LOCK_WAIT_S: "2",
+    });
+    expect(second.status).toBe(1);
+    expect(second.stderr).toMatch(/impatient run gave up after 2s .*long run/);
+  });
+
+  it("release frees the lock before the caller exits", () => {
+    const r = run(
+      `take_local_stack_lock a || exit 1
+       release_local_stack_lock
+       bash -c '. "${SCRIPT}"; try_local_stack_lock b' || exit 9
+       echo released`,
+      envFor(),
+    );
+    expect(r.stdout, r.stderr).toContain("released");
+    expect(r.status).toBe(0);
+  });
+
+  it("a caller under `set -e` survives a refused try", async () => {
+    const env = envFor();
+    const first = hold("busy run", 30, env);
+    await first.locked;
+    const busy = run(`set -e; if try_local_stack_lock a; then :; fi; echo after-busy`, env);
+    expect(busy.stdout, busy.stderr).toContain("after-busy");
+  });
+
+  it("a caller under `set -e` survives releasing a holder that is already gone", () => {
+    const gone = run(
+      `set -e; take_local_stack_lock a; kill "$LOCAL_STACK_LOCK_PID"; sleep 0.3; release_local_stack_lock; echo after-release`,
+      envFor({ LOCAL_STACK_LOCK_WAIT_S: "10" }),
+    );
+    expect(gone.stdout, gone.stderr).toContain("after-release");
+  });
+
+  it("a runner started by the holder does not wait on its parent", () => {
+    const r = run(
+      `take_local_stack_lock parent || exit 1
+       LOCAL_STACK_LOCK_WAIT_S=2 bash -c '. "${SCRIPT}"; take_local_stack_lock child' && echo nested-ok`,
+      envFor(),
+    );
+    expect(r.stdout, r.stderr).toContain("nested-ok");
+    expect(r.stderr).not.toContain("waiting");
+  });
+
+  it("a stack named by BKIT_LOCAL_STACK never waits on the shared one", async () => {
+    const env = envFor();
+    const first = hold("shared run", 30, env);
+    await first.locked;
+    const r = run(`try_local_stack_lock throwaway && local_stack_lock_file`, {
+      ...env,
+      BKIT_LOCAL_STACK: "throwaway-test",
+    });
+    expect(r.status, r.stderr).toBe(0);
+    expect(r.stdout.trim()).toBe(
+      path.join(cache, "bkit", "local-stack-lock", "throwaway-test.lock"),
+    );
+  });
+
+  it("every worktree of one repo resolves the main checkout's lock, and waits on it", async () => {
+    const main = path.join(tmp, "app-main");
+    const worktree = path.join(tmp, "app-feature");
+    fs.mkdirSync(path.join(main, "scripts", "ci"), { recursive: true });
+    fs.copyFileSync(SCRIPT, path.join(main, "scripts", "ci", "bkit-machine-lock.sh"));
+    git(tmp, ["init", "-q", "-b", "dev", main]);
+    git(main, ["add", "."]);
+    git(main, ["commit", "-q", "-m", "init"]);
+    git(main, ["worktree", "add", "-q", "-b", "feat", worktree]);
+    const inMain = path.join(main, "scripts", "ci", "bkit-machine-lock.sh");
+    const inWorktree = path.join(worktree, "scripts", "ci", "bkit-machine-lock.sh");
+    const env = envFor();
+
+    const lockFile = path.join(cache, "bkit", "local-stack-lock", "app-main.lock");
+    expect(run("local_stack_lock_file", env, inMain, main).stdout.trim()).toBe(lockFile);
+    expect(run("local_stack_lock_file", env, inWorktree, worktree).stdout.trim()).toBe(lockFile);
+
+    const first = hold("main run", 30, env, inMain, main);
+    await first.locked;
+    const second = run(`try_local_stack_lock "worktree run"`, env, inWorktree, worktree);
+    expect(second.status).toBe(1);
+    expect(second.stderr).toContain(`main run — ${main}`);
+  });
+
+  it("outside a git checkout with no BKIT_LOCAL_STACK it refuses, saying why", () => {
+    const loose = path.join(tmp, "loose");
+    fs.mkdirSync(loose);
+    fs.copyFileSync(SCRIPT, path.join(loose, "bkit-machine-lock.sh"));
+    const r = run(
+      `take_local_stack_lock "loose run"`,
+      envFor({ GIT_CEILING_DIRECTORIES: tmp }),
+      path.join(loose, "bkit-machine-lock.sh"),
+      loose,
+    );
+    expect(r.status).toBe(1);
+    expect(r.stderr).toContain("cannot name the local stack");
+    expect(fs.existsSync(path.join(cache, "bkit"))).toBe(false);
+  });
+
+  it("a holder that stops before it answers fails the take at once instead of hanging", () => {
+    const broken = path.join(tmp, "broken-lock.sh");
+    const text = fs.readFileSync(SCRIPT, "utf-8");
+    expect(text).toContain("/usr/bin/perl -e '\n");
+    fs.writeFileSync(broken, text.replace("/usr/bin/perl -e '\n", "/usr/bin/perl -e 'exit 1;\n"));
+    const r = run(`take_local_stack_lock "doomed run"`, envFor({ BKIT_LOCAL_STACK: "x" }), broken);
+    expect(r.status).toBe(1);
+    expect(r.stderr).toContain("stopped before it answered");
+    expect(r.ms).toBeLessThan(10_000);
+  });
+
+  it.each(["true", "1"])("CI=%s is a no-op that creates no lock file", (ci) => {
+    const r = run(`take_local_stack_lock ci-run && echo ok`, envFor({ CI: ci }));
+    expect(r.stdout, r.stderr).toContain("ok");
+    expect(r.status).toBe(0);
+    expect(fs.existsSync(path.join(cache, "bkit"))).toBe(false);
+  });
+
+  it("`run` holds the lock for the command and passes its exit status on", () => {
+    const r = spawnSync(
+      "bash",
+      [
+        SCRIPT,
+        "run",
+        "pkg script",
+        "--",
+        "bash",
+        "-c",
+        'cat "$XDG_CACHE_HOME"/bkit/local-stack-lock/*.holder; exit 3',
+      ],
+      { env: envFor(), encoding: "utf-8" },
+    );
+    expect(r.status, r.stderr).toBe(3);
+    expect(r.stdout).toContain("pkg script");
+  });
+
+  it("`run` with no arguments prints usage and exits 2", () => {
+    const r = spawnSync("bash", [SCRIPT], { env: envFor(), encoding: "utf-8" });
+    expect(r.status).toBe(2);
+    expect(r.stderr).toContain("usage");
+  });
+
+  it("a named lock is machine-wide: checkouts of two different repos wait on the same named lock", async () => {
+    const firstRepo = checkout("first-repo");
+    const secondRepo = checkout("second-repo");
+    const env = envFor({ LOCAL_STACK_LOCK_WAIT_S: "10" });
+    const first = holdNamed("first repo gate", "tests", env, firstRepo.script, 2, firstRepo.root);
+    await first.locked;
+    const second = run(
+      'take_local_stack_lock "second repo gate" tests && echo acquired',
+      env,
+      secondRepo.script,
+      secondRepo.root,
+    );
+    await first.done;
+    expect(second.status, second.stderr).toBe(0);
+    expect(second.stdout).toContain("acquired");
+    expect(second.stderr).toContain("first repo gate");
+    expect(second.stderr).toContain(firstRepo.root);
+    expect(second.ms).toBeGreaterThanOrEqual(1_000);
+    expect(
+      run("local_stack_lock_file tests", env, firstRepo.script, firstRepo.root).stdout.trim(),
+    ).toBe(path.join(cache, "bkit", "machine-lock", "tests.lock"));
+    expect(
+      run("local_stack_lock_file tests", env, secondRepo.script, secondRepo.root).stdout.trim(),
+    ).toBe(path.join(cache, "bkit", "machine-lock", "tests.lock"));
+  });
+
+  it("copied-repository lock helpers execute in the requested caller checkout", () => {
+    const copied = checkout("requested-caller");
+    const env = envFor();
+    const sourced = run("pwd -P", env, copied.script, copied.root);
+    const command = commandRun(
+      ["caller cwd probe", "--lock", "cwd-probe", "--", "bash", "-c", "pwd -P"],
+      env,
+      copied.script,
+      copied.root,
+    );
+    expect(sourced.status, sourced.stderr).toBe(0);
+    expect(sourced.stdout.trim()).toBe(copied.root);
+    expect(command.status, command.stderr).toBe(0);
+    expect(command.stdout.trim()).toBe(copied.root);
+  });
+
+  it("one process holds a named lock and the unnamed stack lock side by side", () => {
+    const result = run(
+      'take_local_stack_lock "named run" example || exit 11\n' +
+        'take_local_stack_lock "stack run" || exit 12\n' +
+        "local_stack_lock_holder example\n" +
+        "local_stack_lock_holder\n" +
+        "release_local_stack_lock example\n" +
+        "local_stack_lock_holder\n" +
+        "release_local_stack_lock\n" +
+        "echo both-released",
+      envFor(),
+    );
+    expect(result.status, result.stderr).toBe(0);
+    expect(result.stdout.match(/named run/g)).toHaveLength(1);
+    expect(result.stdout.match(/stack run/g)).toHaveLength(2);
+    expect(result.stdout).toContain("both-released");
+  });
+
+  it("a runner started by a named-lock holder does not wait on that named lock", () => {
+    const result = run(
+      'take_local_stack_lock "parent named run" tests || exit 11\n' +
+        "LOCAL_STACK_LOCK_WAIT_S=0 bash -c '. \"" +
+        SCRIPT +
+        '"; take_local_stack_lock "child named run" tests && local_stack_lock_holder tests\'',
+      envFor(),
+    );
+    expect(result.status, result.stderr).toBe(0);
+    expect(result.stdout).toContain("parent named run");
+    expect(result.stdout).not.toContain("child named run");
+    expect(result.stderr).not.toContain("waiting");
+    expect(result.stderr).not.toContain("gave up");
+  });
+
+  it("the unnamed stack lock keeps its lock file path, so an older copy and this one exclude each other", async () => {
+    const env = envFor({ BKIT_LOCAL_STACK: "compat-stack", LOCAL_STACK_LOCK_WAIT_S: "10" });
+    const expected = path.join(cache, "bkit", "local-stack-lock", "compat-stack.lock");
+    expect(run("local_stack_lock_file", env).stdout.trim()).toBe(expected);
+    expect(run("local_stack_lock_file", env, OLD_SCRIPT).stdout.trim()).toBe(expected);
+    const older = hold("older stack run", 30, env, OLD_SCRIPT);
+    await older.locked;
+    const current = run('try_local_stack_lock "current stack run"', env);
+    expect(current.status).toBe(1);
+    expect(current.stderr).toContain("older stack run");
+    older.child.kill("SIGKILL");
+    await older.done;
+    const newer = hold("newer stack run", 30, env);
+    await newer.locked;
+    const oldWaiter = run('try_local_stack_lock "older waiter"', env, OLD_SCRIPT);
+    expect(oldWaiter.status).toBe(1);
+    expect(oldWaiter.stderr).toContain("newer stack run");
+  });
+
+  it("run --lock holds the named lock for the command and passes its exit status on", () => {
+    const result = commandRun(
+      [
+        "named package script",
+        "--lock",
+        "tests",
+        "--",
+        "bash",
+        "-c",
+        '. "' + SCRIPT + '"; local_stack_lock_holder tests; exit 7',
+      ],
+      envFor(),
+    );
+    expect(result.status, result.stderr).toBe(7);
+    expect(result.stdout).toContain("named package script");
+    expect(result.stdout).toContain(CHECKOUT);
+    expect(result.stdout).toMatch(/pid \d+/);
+  });
+
+  it("run exits 75 when the wait gives up, distinct from the command's own failure", async () => {
+    const env = envFor({ LOCAL_STACK_LOCK_WAIT_S: "0" });
+    const holder = holdNamed("blocking tests gate", "tests", env);
+    await holder.locked;
+    const waiting = commandRun(
+      ["waiting tests gate", "--lock", "tests", "--", "bash", "-c", "echo should-not-run"],
+      env,
+    );
+    expect(waiting.status, waiting.stderr).toBe(75);
+    expect(waiting.stdout).not.toContain("should-not-run");
+    expect(waiting.stderr).toContain("waiting tests gate");
+    expect(waiting.stderr).toContain("tests");
+    expect(waiting.stderr).toContain("blocking tests gate");
+    const commandFailure = commandRun(
+      ["other named gate", "--lock", "another", "--", "bash", "-c", "echo command-ran; exit 75"],
+      env,
+    );
+    expect(commandFailure.status, commandFailure.stderr).toBe(75);
+    expect(commandFailure.stdout).toContain("command-ran");
+    expect(commandFailure.stderr).not.toContain("gave up");
+  });
+
+  it("run exits 73 naming the path when the lock dir cannot be written", () => {
+    const notDirectory = path.join(tmp, "cache-is-a-file");
+    fs.writeFileSync(notDirectory, "this blocks mkdir");
+    const result = commandRun(
+      ["unwritable gate", "--lock", "tests", "--", "bash", "-c", "echo should-not-run"],
+      envFor({ XDG_CACHE_HOME: notDirectory }),
+    );
+    expect(result.status).toBe(73);
+    expect(result.stdout).not.toContain("should-not-run");
+    expect(result.stderr).toContain(notDirectory);
+    expect(result.stderr).toContain("tests");
+    expect(result.stderr).toMatch(/cannot|could not|not a directory/i);
+  });
+
+  it("run exits 73 naming /usr/bin/perl when perl is missing", () => {
+    const broken = path.join(tmp, "no-perl-machine-lock.sh");
+    const missingPerl = path.join(tmp, "missing-perl");
+    const text = fs.readFileSync(SCRIPT, "utf-8");
+    expect(text).toContain("/usr/bin/perl");
+    fs.writeFileSync(broken, text.replaceAll("/usr/bin/perl", missingPerl));
+    const result = commandRun(
+      ["no perl gate", "--lock", "tests", "--", "bash", "-c", "echo should-not-run"],
+      envFor(),
+      broken,
+    );
+    expect(result.status).toBe(73);
+    expect(result.stdout).not.toContain("should-not-run");
+    expect(result.stderr).toContain(missingPerl);
+    expect(result.stderr).toContain("tests");
+    expect(result.stderr).toMatch(/not found|missing|not executable/);
+  });
+
+  it("a runner started by a tests-lock holder still waits on a held unnamed stack lock, under this script and under an older copy", async () => {
+    const env = envFor({ LOCAL_STACK_LOCK_WAIT_S: "0", BKIT_LOCAL_STACK: "shared-stack" });
+    const stack = hold("separate stack holder", 30, env);
+    await stack.locked;
+    const current = run(
+      'take_local_stack_lock "tests parent" tests || exit 11\n' +
+        "bash -c '. \"" +
+        SCRIPT +
+        '"; take_local_stack_lock "current child" && echo stack-was-skipped\'\n' +
+        'child_status=$?; release_local_stack_lock tests; exit "$child_status"',
+      env,
+    );
+    expect(current.status).toBe(1);
+    expect(current.stdout).not.toContain("stack-was-skipped");
+    expect(current.stderr).toContain("separate stack holder");
+    const older = run(
+      'take_local_stack_lock "tests parent" tests || exit 11\n' +
+        "bash -c '. \"" +
+        OLD_SCRIPT +
+        '"; take_local_stack_lock "older child" && echo stack-was-skipped\'\n' +
+        'child_status=$?; release_local_stack_lock tests; exit "$child_status"',
+      env,
+    );
+    expect(older.status).toBe(1);
+    expect(older.stdout).not.toContain("stack-was-skipped");
+    expect(older.stderr).toContain("separate stack holder");
+  });
+
+  it("run with no who names the run from LOCAL_STACK_LOCK_WHO, else the package.json script name", () => {
+    const command = '. "' + SCRIPT + '"; local_stack_lock_holder tests';
+    const fromEnvironment = commandRun(
+      ["--lock", "tests", "--", "bash", "-c", command],
+      envFor({
+        LOCAL_STACK_LOCK_WHO: "workflow tests run",
+        npm_lifecycle_event: "test:integration",
+      }),
+    );
+    expect(fromEnvironment.status, fromEnvironment.stderr).toBe(0);
+    expect(fromEnvironment.stdout).toContain("workflow tests run");
+    expect(fromEnvironment.stdout).not.toContain("test:integration");
+    const fromPackage = commandRun(
+      ["--lock", "tests", "--", "bash", "-c", command],
+      envFor({ LOCAL_STACK_LOCK_WHO: "", npm_lifecycle_event: "test:integration" }),
+    );
+    expect(fromPackage.status, fromPackage.stderr).toBe(0);
+    expect(fromPackage.stdout).toContain("test:integration");
+    expect(fromPackage.stdout).not.toContain("--lock");
+  });
+});
diff --git a/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt b/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt
index f6b5779c0..cdbbf30a5 100644
--- a/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt
+++ b/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt
@@ -89,7 +89,7 @@ _No tracker connected, skip step._
 2. Write `{OUTBOX}/decision-items.json` = one JSON object per item, in item order — `{"title", "question", "options", "recommended", "reason"}`, or a hard blocker `{"title", "question", "options", "noRecommendation"}` (why no agent can settle it); never a recommendation on a hard blocker. Per `question`: word each so "yes" accepts the recommendation. State what the owner must decide and what each option does, in plain English, before naming any file, test or identifier. Items:
    - **If** `PAUSE_QUESTION` = `VERIFY_GAPS` → write one item per `Identified Gaps Log` line of `build-plan-verify-{GROUP}-{VERIFY_ATTEMPT}.md`. Add the gap's last `BLOCKED` reason from `build-plan-gaps-remediate-{GROUP}-*-log.md` when it has one.
      - A fixable gap → options `["Accept", "Fix now"]`, with a recommendation per item.
-     - Any unfixable gap (`no-test-first`, `test-first-malformed`, `test-first-unread`, `exception-refused`) → a hard blocker with options `["Accept", "Fix now", "Stop"]`.
+     - Any unfixable gap (`no-test-first`, `test-first-malformed`, `test-first-unread`, `exception-refused`, `test-loosened` logged `Fixable: false`) → a hard blocker with options `["Accept", "Fix now", "Stop"]`.
      - A group-gate failure is never an item, because it is always fixed.
    - **If** `PAUSE_QUESTION` = `CHALLENGE`:
      - **If** `CHALLENGE_OVERFLOW` is set → the merge wrote nothing to the plan. Write one item per `Location` of each `CRITICAL`, `HIGH` or `MEDIUM` finding in the merged reports: `build-challenge-2.md`, plus `build-challenge-1.md` when the change is large.
@@ -579,7 +579,7 @@ Each task group gets its own pass of Steps 7-9, in group order. Step 7 briefs th
    ```bash
    "{BKIT}" steps finish --workflow=build --step=build-plan-verify --file="{STATUS}" --attempt-of=build-plan-verify:next --group={GROUP} --agent=bkit-build-plan-verify --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-{GROUP}-<attempt>.md" --number=8 --post --title="Plan Verify" --message="chore({FID}): plan-verify group {GROUP} attempt <attempt>"
    ```
-   Hold `verdict` as `VERIFY_VERDICT`, `failures` as `VERIFY_FAILURES`, `fields.Fixable` as `VERIFY_FIXABLE`, `fields.Tasks` as `VERIFIED_TASKS`.
+   Hold `verdict` as `VERIFY_VERDICT`, `failures` as `VERIFY_FAILURES`, `fields.Fixable` as `VERIFY_FIXABLE`, `fields.Tasks` as `VERIFIED_TASKS`, `fields.Loosened` as `VERIFY_LOOSENED`.
 6. Tick the satisfied tasks in the plan. A task that the test-first report lists as a gap stays open:
    ```bash
    "{BKIT}" tasks tick --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --group={GROUP} --tasks="{VERIFIED_TASKS}" --green="docs/plans/{YYYYMM}/logs/{FID}/build-tests-green-{GROUP}-{VERIFY_ATTEMPT}.md"
@@ -654,25 +654,46 @@ Each task group gets its own pass of Steps 7-9, in group order. Step 7 briefs th
    ```bash
    "{BKIT}" status route --file="{STATUS}" --workflow=build --step=build-plan-verify --group={GROUP} --require=verdict
    ```
-   Hold `verdict` as `VERIFY_VERDICT`.
+   Hold `verdict` as `VERIFY_VERDICT`. Read the `Loosened:` line of `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-{GROUP}-{VERIFY_ATTEMPT}.md`'s header and hold its value as `VERIFY_LOOSENED`.
    **If** `docs/plans/{YYYYMM}/logs/{FID}/build-group-gate-{GROUP}-{VERIFY_ATTEMPT}.md` does not exist → `GATE_VERDICT` = SKIPPED.
    **Else** → read the group gate's verdict:
    ```bash
    "{BKIT}" status route --file="{STATUS}" --workflow=build --step=build-group-gate --group={GROUP} --require=verdict
    ```
    Hold `verdict` as `GATE_VERDICT`.
-2. **Subagent:** Invoke `@bkit-build-plan-gaps-remediate` using `Agent` tool:
+2. **If** `VERIFY_LOOSENED` != `none` → the tests step removed or loosened an expectation of an existing test (each `test-loosened` gap of the verify report, `Fixable: true`). The tests step restores it, because no code step may rewrite a planned test; no fixer runs this round:
+   **Subagent:** Invoke `@bkit-build-plan-tests` using `Agent` tool:
+   Context: You are a subagent in the Build phase. Restore these tests of group `{GROUP}`, which verify logged `test-loosened`: `{VERIFY_LOOSENED}`. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows. Plan caps (`bkit.workflows.tasks`): {MAX_TASKS_PER_GROUP} tasks and {MAX_TESTS_PER_GROUP} `TEST FIRST` tests per group; {MAX_TESTS_PER_TASK} tests across {MAX_TEST_FILES_PER_TASK} test files per task.
+   Read: `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-{GROUP}-{VERIFY_ATTEMPT}.md`, `docs/plans/{YYYYMM}/logs/{FID}/build-tests-green-{GROUP}-{VERIFY_ATTEMPT}.md`, `docs/plans/{YYYYMM}/logs/{FID}/build-plan-tests-{GROUP}-log.md`.
+   Update: the tests named, `docs/plans/{YYYYMM}/logs/{FID}/build-plan-tests-{GROUP}-log.md`.
+   Record the restore. The command reads the group's `TEST FIRST` files from the plan and commits the diff:
+   ```bash
+   "{BKIT}" steps finish --workflow=build --step=build-plan-tests --file="{STATUS}" --attempt-of=build-plan-tests:next --group={GROUP} --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --agent=bkit-build-plan-tests --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-tests-{GROUP}-log.md --number=7 --post --title="Plan Execute — tests restored" --message="chore({FID}): plan-tests group {GROUP} attempt <attempt>"
+   ```
+   **If** exit 15 → the diff changes a file no `TEST FIRST` line of the group names (`source`): invoke `@bkit-build-plan-tests` again with `"<problem> Undo your edits to each file in <source>: restore it to its committed content, or delete it when you created it. Write no source code."` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**.
+   Record the group's red again:
+   ```bash
+   "{BKIT}" counters derive --file="{STATUS}" --workflow=build --step=build-tests-red --group={GROUP} --position=next
+   ```
+   Hold `value` as `RED_ATTEMPT`.
+   ```bash
+   "{BKIT}" tests red --file="{STATUS}" --workflow=build --group={GROUP} --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --log="docs/plans/{YYYYMM}/logs/{FID}/build-tests-red-{GROUP}-{RED_ATTEMPT}.md" --writer-log="docs/plans/{YYYYMM}/logs/{FID}/build-plan-tests-{GROUP}-log.md"
+   ```
+   Route — first match wins:
+   - **If** exit 0, 1 or 3 → re-run Step 8: the next verify round judges the restored diff, and a test the restore left unproven waits for Step 15 like any other.
+   - **Else** → **Failure Path**.
+3. **Subagent:** Invoke `@bkit-build-plan-gaps-remediate` using `Agent` tool:
    Context: You are a subagent in the Build phase. Group `{GROUP}`, attempt `{VERIFY_ATTEMPT}`. `Strategy`: `{STRATEGY}`. **If** `GATE_VERDICT` = FAIL → add `Group gate`: `"{BKIT}" tests run --gate=bkit:gate:static-unit --log="{OUTBOX}/build-plan-gaps-remediate-{GROUP}-{VERIFY_ATTEMPT}-gate.log"`. **If** `VERIFY_VERDICT` = FAIL → add `Scope`: `fixable only`. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows.
    Read: glob `docs/plans/{YYYYMM}/logs/{FID}/build-brief-{GROUP}-*.md`, `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`, `docs/plans/{YYYYMM}/logs/{FID}/build-plan-verify-{GROUP}-{VERIFY_ATTEMPT}.md`, `docs/plans/{YYYYMM}/logs/{FID}/build-group-gate-{GROUP}-{VERIFY_ATTEMPT}.md` (if present), `docs/plans/{YYYYMM}/logs/{FID}/build-tests-green-{GROUP}-{VERIFY_ATTEMPT}.md`, `docs/plans/{YYYYMM}/logs/{FID}/build-plan-tests-{GROUP}-log.md` (if present), glob `docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-{GROUP}-*-log.md`, glob `docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-*.md` (highest number, if present).
    Update: Source files.
    Create: `docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-{GROUP}-{VERIFY_ATTEMPT}-log.md`.
-3. Finish. The command records the header's `Strategy`:
+4. Finish. The command records the header's `Strategy`:
    ```bash
    "{BKIT}" steps finish --workflow=build --step=build-plan-gaps-remediate --file="{STATUS}" --attempt-of=build-plan-verify:current --group={GROUP} --agent=bkit-build-plan-gaps-remediate --artifact="docs/plans/{YYYYMM}/logs/{FID}/build-plan-gaps-remediate-{GROUP}-<attempt>-log.md" --number=9 --post --title="Plan Gaps Remediate" --message="chore({FID}): plan-gaps-remediate group {GROUP} attempt <attempt>"
    ```
    **If** exit 11 → the fix edited a planned test case the tests step recorded (`tests`; the engine logs an `agent-rework` friction row): invoke `@bkit-build-plan-gaps-remediate` again with `"<problem> Put each test in <tests> back as the tests step left it; your other edits to those files stay. Correct the Fixed count and verdict in your log to match."` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**.
    Hold `fields.Fixed` as `VERIFY_FIXED`. Nothing routes on `verdict`: it only goes on the step's row. Step 8 runs again and judges the fixes, and a later non-FAIL verify of the group answers a gaps-fix FAIL in the summary.
-4. Check that the attempt changed source files, not only logs and ledgers:
+5. Check that the attempt changed source files, not only logs and ledgers:
    ```bash
    cd "{WORKTREE_PATH}" && "{BKIT}" branches scan-diff --base=HEAD~1 --code >/dev/null
    ```
diff --git a/.bkit/core/workflows/bkit-build.md b/.bkit/core/workflows/bkit-build.md
index d57e964eb..c348ad4d7 100644
--- a/.bkit/core/workflows/bkit-build.md
+++ b/.bkit/core/workflows/bkit-build.md
@@ -753,7 +753,7 @@ Each task group gets its own pass of Steps 7-9, in group order. Step 7 briefs th
    Update: the tests named, `docs/plans/{YYYYMM}/logs/{FID}/build-plan-tests-{GROUP}-log.md`.
    Record the restore. The command reads the group's `TEST FIRST` files from the plan and commits the diff:
    ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-plan-tests --file="{STATUS}" --attempt-of=build-plan-tests:next --group={GROUP} --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --agent=bkit-build-plan-tests --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-tests-{GROUP}-log.md --number=9 --post --title="Plan Gaps Remediate — tests restored" --message="chore({FID}): plan-tests group {GROUP} attempt <attempt>"
+   "{BKIT}" steps finish --workflow=build --step=build-plan-tests --file="{STATUS}" --attempt-of=build-plan-tests:next --group={GROUP} --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --agent=bkit-build-plan-tests --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-tests-{GROUP}-log.md --number=7 --post --title="Plan Execute — tests restored" --message="chore({FID}): plan-tests group {GROUP} attempt <attempt>"
    ```
    **If** exit 15 → the diff changes a file no `TEST FIRST` line of the group names (`source`): invoke `@bkit-build-plan-tests` again with `"<problem> Undo your edits to each file in <source>: restore it to its committed content, or delete it when you created it. Write no source code."` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**.
    Record the group's red again:
diff --git a/.bkit/friction.jsonl b/.bkit/friction.jsonl
index f194b9661..34a1d46eb 100644
--- a/.bkit/friction.jsonl
+++ b/.bkit/friction.jsonl
@@ -21,3 +21,15 @@
 {"schema":3,"ts":1793517758819,"kind":"friction","key":"ship-update-docs-changelog-outside-pr-scope","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"ship","step":"ship-bookkeeping-push"},"references":["699-engine-run-completeness","https://github.com/cbartens/bkit/pull/786"],"category":"workflow","scope":"universal","severity":"MEDIUM","status":"OPEN","summary":"ship-update-docs edits CHANGELOG.md but ledgers commit --scope=pr does not stage it, so the docs sync's changelog entry is left uncommitted","description":"Step 6's docs agent added an [Unreleased] bullet to the root CHANGELOG.md. Step 8's ledgers commit --scope=pr allow-list covers docs/*.md, ledgers and skills but not CHANGELOG.md, so the bullet stayed dirty in the worktree and does not ride the PR.","remediation":"Either add CHANGELOG.md to the --scope=pr pathspecs (and the runs gate bookkeeping allow-list), or tell bkit-ship-update-docs not to edit files outside docs/.","source":".bkit/core/engine/commands/workflow/ledgers.ts:99"}
 {"schema":3,"ts":1793538646877,"kind":"friction","key":"ship-worktree-setup-adopts-when-run-inside-feature-worktree","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"ship","step":"ship-start-workflow"},"references":["715-retire-lite-workflows"],"category":"workflow","scope":"universal","severity":"MEDIUM","status":"OPEN","summary":"ship worktrees setup run from inside the feature's own worktree picks adopt mode and exits 7","description":"Step 1 sub-step 7 ran from .worktrees/715-retire-lite-workflows, whose current branch is the ship target, so worktrees setup chose adopt mode (session branch = target), tried to switch the main checkout onto feat/715-retire-lite-workflows, and git refused because the worktree already holds that branch. It exits 7, which the workflow routes as a ship of dev or main and stops. Re-running the same block from the repo root resumed the worktree.","remediation":"In worktrees setup, treat a session already inside the target's registered worktree as resumed, or give this refusal its own exit code."}
 {"schema":3,"ts":1793539461063,"kind":"friction","key":"ship-docs-sync-leaves-padded-table-row","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"ship","step":"ship-bookkeeping-push"},"references":["715-retire-lite-workflows"],"category":"workflow","scope":"universal","severity":"MEDIUM","status":"OPEN","summary":"ship docs sync edits a docs table row with padding, so the Step 8 bookkeeping push is refused by format:tables:check","description":"The ship update-docs agent rewrote a row of a prettier-ignore table in docs/testing.md with fixed-width padding. ledgers commit committed it, and the pre-push gate's format:tables:check refused the push (branches push exit 8). Step 8 has no route for a refused push, so the only written path is the Failure Path, which would end the run over a whitespace fix. The orchestrator ran bkit-insert-ignore.mjs on the file, committed it, and re-ran the push.","remediation":"Run the table formatter on docs the ship docs agent touched before ledgers commit, or give Step 8 a route for a hook-refused push: fix what the hook names, commit, re-run the push."}
+{"schema":3,"ts":1793607339720,"kind":"friction","key":"owner-pause/design.grill","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"design","step":"owner-pause"},"category":"human-confirm","scope":"bkit-repo","severity":"LOW","summary":"design paused for the owner at design.grill","description":"The design workflow stopped and asked the owner (`owner-pause` at design.grill).","source":"orchestrator","status":"OPEN","run":{"parentSha":"c7bd209c17f9759595e5e44035319304e2a37fb3"},"recurrenceCount":1}
+{"schema":3,"ts":1793607623357,"kind":"friction","key":"owner-pause/design.draft","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"design","step":"owner-pause"},"category":"human-confirm","scope":"bkit-repo","severity":"LOW","summary":"design paused for the owner at design.draft","description":"The design workflow stopped and asked the owner (`owner-pause` at design.draft).","source":"orchestrator","status":"OPEN","run":{"parentSha":"c7bd209c17f9759595e5e44035319304e2a37fb3"},"recurrenceCount":1}
+{"schema":3,"ts":1793607841514,"kind":"friction","key":"design-language-server-ignored-worktree","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"design","step":"design-brainstorm-ideate"},"references":["787-show-authoring-rules"],"category":"tool-failure","scope":"bkit-repo","severity":"LOW","summary":"Language-server lookup rejects the design worktree","description":"Two design agents reported that Serena was active on the parent checkout and rejected the ignored .worktrees path. They continued with scoped text searches and bounded source reads in the assigned worktree.","remediation":"Make language-server project selection support the assigned workflow worktree.","status":"OPEN"}
+{"schema":3,"ts":1793609342251,"kind":"friction","key":"design-live-host-spike-unavailable","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"design","step":"design-spike"},"references":["787-show-authoring-rules","docs/plans/202611/logs/787-show-authoring-rules/design-spike.md"],"category":"tool-failure","scope":"bkit-repo","severity":"MEDIUM","summary":"Live host advisory delivery could not be verified","description":"Codex completed a confined sentinel edit but the scratch hook fired zero times. Cursor could not authenticate in the bounded probe, and automatic approval review rejected authenticated retries because the external destination and workspace-scoped prompt were not authorized. Both delivery claims remain BLOCKED; no timing or visibility result is inferred.","remediation":"Use an explicitly authorized host test environment for a future live delivery check; preserve the unverified boundary in the design.","status":"OPEN"}
+{"schema":3,"ts":1793605765314,"kind":"friction","key":"owner-pause/design.grill","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"design","step":"owner-pause"},"category":"human-confirm","scope":"bkit-repo","severity":"LOW","summary":"design paused for the owner at design.grill","description":"The design workflow stopped and asked the owner (`owner-pause` at design.grill).","source":"orchestrator","status":"OPEN","run":{"parentSha":"e0e15abe2432b4908f2b123851ab4969c08519a0"},"recurrenceCount":1}
+{"schema":3,"ts":1793606530222,"kind":"friction","key":"owner-pause/design.draft","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"design","step":"owner-pause"},"category":"human-confirm","scope":"bkit-repo","severity":"LOW","summary":"design paused for the owner at design.draft","description":"The design workflow stopped and asked the owner (`owner-pause` at design.draft).","source":"orchestrator","status":"OPEN","run":{"parentSha":"e0e15abe2432b4908f2b123851ab4969c08519a0"},"recurrenceCount":1}
+{"schema":3,"ts":1793607326794,"kind":"friction","key":"826-design-tracker-auth-retries","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"design","step":"design-start-workflow"},"category":"tool-failure","scope":"bkit-repo","severity":"LOW","description":"Tracker setup returned gh HTTP 401 and the connected GitHub plugin returned HTTP 403 on repeated label and comment writes. The owner refreshed BKIT_GH_TOKEN; the next engine labels and board write and the grill comment succeeded.","remediation":"Authentication restored by owner; use engine tracker verbs.","status":"CLOSED"}
+{"schema":3,"ts":1793609381497,"kind":"friction","key":"826-spike-relative-import-rework","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"design","step":"design-spike"},"category":"agent-rework","scope":"bkit-repo","severity":"LOW","description":"The bkit-design-spike subagent (model gpt-6.1-sol) initially hit ERR_MODULE_NOT_FOUND in its disposable GitHub metadata probe because its relative import was incorrect. It corrected the import and reran the read-only probe successfully. The orchestrator records this observation; subagents are not permitted friction writers.","status":"CLOSED"}
+{"schema":3,"ts":1793609789094,"kind":"friction","key":"826-design-friction-writer-repair","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"design","step":"design-worktree-setup"},"category":"agent-rework","scope":"bkit-repo","severity":"LOW","description":"Adding the spike model exposed the separate writer constraint: subagents cannot author friction rows. The orchestrator corrected by to its own workflow and step, retained the spike agent name and model in the description, and successfully appended the row.","status":"CLOSED"}
+{"schema":3,"ts":1793609789095,"kind":"friction","key":"826-design-update-header-spacing","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"design","step":"design-apply-review"},"category":"agent-rework","scope":"bkit-repo","severity":"LOW","description":"The design-update agent corrected a missing blank line after the generated verdict header, then reran its header check successfully. The workflow finish gate returned PASS.","status":"CLOSED"}
+{"schema":3,"ts":1793605813975,"kind":"friction","key":"build-724-tracker-auth-and-handover-drift","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-convert"},"references":["docs/plans/202610/logs/724-machine-wide-test/build-plan-check.md"],"category":"tool-failure","scope":"bkit-repo","severity":"HIGH","summary":"Build tracker writes failed and failure record push was blocked","description":"GitHub CLI issue requests returned 401 Bad credentials; GitHub connector writes returned 403 Resource not accessible by integration. Plan check refused TASK 11 with three format problems and one missing reuse inventory row. Failure handover push was rejected by pre-push bkit check: generated .bkit/templates.md drift (2 writes would occur).","status":"OPEN"}
+{"schema":3,"ts":1793610048113,"kind":"friction","key":"owner-pause/build.decision","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"owner-pause"},"category":"human-confirm","scope":"bkit-repo","severity":"LOW","summary":"build paused for the owner at build.decision","description":"The build workflow stopped and asked the owner (`owner-pause` at build.decision).","source":"orchestrator","status":"OPEN","run":{"parentSha":"ff8d9e7f31a912126c2afc5d464e79dda471b56a"},"recurrenceCount":1}
diff --git a/.bkit/issues.jsonl b/.bkit/issues.jsonl
index a09992fd8..05e8eccb6 100644
--- a/.bkit/issues.jsonl
+++ b/.bkit/issues.jsonl
@@ -67,3 +67,5 @@
 {"schema":3,"ts":1793539288121,"firstTs":1793507950218,"updates":2,"kind":"feature","key":"715-retire-lite-workflows","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"ship","step":"ship-update-docs"},"category":"agentic","description":"Ship closed for 715-retire-lite-workflows","status":"SHIPPED"}
 {"schema":3,"ts":1793575645147,"firstTs":1793507950218,"updates":3,"kind":"feature","key":"715-retire-lite-workflows","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"ship","step":"ship-update-docs"},"category":"agentic","description":"Ship closed for 715-retire-lite-workflows","status":"SHIPPED"}
 {"schema":3,"ts":1793603451032,"firstTs":1793324492581,"updates":2,"kind":"feature","key":"748-brand-every-consumer","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-close-workflow"},"category":"agentic","description":"Build closed for 748-brand-every-consumer","status":"BUILT"}
+{"schema":3,"ts":1793609906429,"firstTs":1793609906429,"updates":1,"kind":"feature","key":"787-show-authoring-rules","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"design","step":"design-close-workflow"},"category":"agentic","description":"Design closed for 787-show-authoring-rules","status":"DESIGNED"}
+{"schema":3,"ts":1793610124288,"firstTs":1793610124288,"updates":1,"kind":"feature","key":"826-append-routine-workflow","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"design","step":"design-close-workflow"},"category":"agentic","description":"Design closed for 826-append-routine-workflow","status":"DESIGNED"}
diff --git a/.bkit/stats.jsonl b/.bkit/stats.jsonl
index 2406dfe2a..d9ad86dfc 100644
--- a/.bkit/stats.jsonl
+++ b/.bkit/stats.jsonl
@@ -173,3 +173,11 @@
 {"schema":3,"ts":1793576466710,"kind":"compliance","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"ship","step":"ship-close-workflow"},"run":{"parentSha":"eba3de0d13c7d921a5d7a1a9dff8ca105daac78d"},"rule":{"id":"skip-ci-not-head","verdict":"pass"}}
 {"schema":3,"ts":1793576466867,"kind":"counter","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"ship","step":"ship-close-workflow"},"run":{"parentSha":"eba3de0d13c7d921a5d7a1a9dff8ca105daac78d"},"counter":{"name":"SHIP_ATTEMPT","value":3,"source":"shell-bus"}}
 {"schema":3,"ts":1793576466868,"kind":"outcome","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"ship","step":"ship-close-workflow"},"run":{"parentSha":"eba3de0d13c7d921a5d7a1a9dff8ca105daac78d","pr":790},"time":{"start":1793574715000,"end":1793576466000,"totalMinutes":29.2},"ending":"done","lines":{"total":{"added":4212,"deleted":890,"changed":5102,"files":134},"code":{"added":1456,"deleted":268,"files":46},"tests":{"added":1825,"deleted":119,"files":29},"docs":{"added":931,"deleted":503,"files":59},"merges":0},"steps":{"total":{"n":11,"totalMinutes":20.1},"byStep":{"ship-start-workflow":{"n":1,"totalMinutes":0},"ship-worktree-setup":{"n":1,"totalMinutes":0.4},"ship-regression-guard":{"n":1,"totalMinutes":0},"ship-deferred-sweep":{"n":1,"totalMinutes":14.4},"ship-update-docs":{"n":1,"totalMinutes":0.7},"ship-summary":{"n":1,"totalMinutes":0.1},"ship-prune-skills":{"n":1,"totalMinutes":0},"ship-bookkeeping-push":{"n":1,"totalMinutes":0.1},"ship-merge-pr":{"n":1,"totalMinutes":4.2},"ship-switch-to-dev":{"n":1,"totalMinutes":0.1},"ship-close-workflow":{"n":1,"totalMinutes":0.1}}},"ledgers":{"deferrals":{"repo":170,"added":0},"failures":{"repo":119,"added":0},"friction":{"added":0}},"plan":{"source":"converted","total":{"tasks":20,"kb":138},"groups":[{"tasks":[{"tests":5,"testFiles":1},{"tests":2,"testFiles":1},{"tests":6,"testFiles":2}]},{"tasks":[{"tests":7,"testFiles":1},{"tests":5,"testFiles":2}]},{"tasks":[{"tests":4,"testFiles":1},{"tests":10,"testFiles":2},{"tests":1,"testFiles":1}]},{"tasks":[{"tests":0,"testFiles":0},{"tests":1,"testFiles":1}]},{"tasks":[{"tests":6,"testFiles":2},{"tests":5,"testFiles":3}]},{"tasks":[{"tests":10,"testFiles":3},{"tests":4,"testFiles":2}]},{"tasks":[{"tests":5,"testFiles":3},{"tests":3,"testFiles":1}]},{"tasks":[{"tests":0,"testFiles":0}]},{"tasks":[{"tests":1,"testFiles":1},{"tests":1,"testFiles":1}]},{"tasks":[{"tests":1,"testFiles":1}]}]},"context":{"host":"claude-code","byAgent":{"bkit-ship-deferred-sweep":{"peak":155265,"runs":1},"bkit-ship-update-docs":{"peak":48364,"runs":1}}},"ship":{"coverage":{"unit":{"lines":90.85,"branches":82.55,"functions":94.86,"statements":89.56}}}}
+{"schema":3,"ts":1793609887767,"kind":"compliance","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"design","step":"design-close-workflow"},"run":{"parentSha":"d91c59c278a050414539e499167c4858168699b1"},"rule":{"id":"no-mirror-edit","verdict":"pass"}}
+{"schema":3,"ts":1793609887768,"kind":"compliance","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"design","step":"design-close-workflow"},"run":{"parentSha":"d91c59c278a050414539e499167c4858168699b1"},"rule":{"id":"skip-ci-not-head","verdict":"pass"}}
+{"schema":3,"ts":1793609887877,"kind":"counter","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"design","step":"design-close-workflow"},"run":{"parentSha":"d91c59c278a050414539e499167c4858168699b1"},"counter":{"name":"DESIGN_ATTEMPT","value":1,"source":"shell-bus"}}
+{"schema":3,"ts":1793609887878,"kind":"outcome","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"design","step":"design-close-workflow"},"run":{"parentSha":"d91c59c278a050414539e499167c4858168699b1"},"time":{"start":1793607293000,"end":1793609887000,"totalMinutes":43.2},"ending":"done","lines":{"total":{"added":0,"deleted":0,"changed":0,"files":0},"code":{"added":0,"deleted":0,"files":0},"tests":{"added":0,"deleted":0,"files":0},"docs":{"added":0,"deleted":0,"files":0},"merges":0},"steps":{"total":{"n":12,"totalMinutes":43},"byStep":{"design-start-workflow":{"n":1,"totalMinutes":0.2},"design-worktree-setup":{"n":1,"totalMinutes":0},"design-grill":{"n":1,"totalMinutes":6.9},"design-brainstorm-ideate":{"n":1,"totalMinutes":5.3},"design-generate":{"n":1,"totalMinutes":7},"design-review":{"n":1,"totalMinutes":6.6},"design-spike":{"n":1,"totalMinutes":7.5},"design-apply-review":{"n":1,"totalMinutes":4.7},"design-organise":{"n":1,"totalMinutes":3},"design-summary":{"n":1,"totalMinutes":0.3},"design-workstream-suggest":{"n":1,"totalMinutes":1.1},"design-close-workflow":{"n":1,"totalMinutes":0.4}}},"ledgers":{"deferrals":{"repo":171,"added":1},"failures":{"repo":120,"added":0},"friction":{"added":4}}}
+{"schema":3,"ts":1793610103594,"kind":"compliance","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"design","step":"design-close-workflow"},"run":{"parentSha":"e19f3a3ace0d83658f41a07c6a2d6bece071182d"},"rule":{"id":"no-mirror-edit","verdict":"pass"}}
+{"schema":3,"ts":1793610103595,"kind":"compliance","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"design","step":"design-close-workflow"},"run":{"parentSha":"e19f3a3ace0d83658f41a07c6a2d6bece071182d"},"rule":{"id":"skip-ci-not-head","verdict":"pass"}}
+{"schema":3,"ts":1793610103720,"kind":"counter","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"design","step":"design-close-workflow"},"run":{"parentSha":"e19f3a3ace0d83658f41a07c6a2d6bece071182d"},"counter":{"name":"DESIGN_ATTEMPT","value":2,"source":"shell-bus"}}
+{"schema":3,"ts":1793610103721,"kind":"outcome","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"design","step":"design-close-workflow"},"run":{"parentSha":"e19f3a3ace0d83658f41a07c6a2d6bece071182d"},"time":{"start":1793609326000,"end":1793610103000,"totalMinutes":13},"ending":"done","lines":{"total":{"added":0,"deleted":0,"changed":0,"files":0},"code":{"added":0,"deleted":0,"files":0},"tests":{"added":0,"deleted":0,"files":0},"docs":{"added":0,"deleted":0,"files":0},"merges":0},"steps":{"total":{"n":12,"totalMinutes":13.1},"byStep":{"design-start-workflow":{"n":1,"totalMinutes":0.3},"design-worktree-setup":{"n":1,"totalMinutes":0},"design-grill":{"n":1,"totalMinutes":0.9},"design-brainstorm-ideate":{"n":1,"totalMinutes":0.1},"design-generate":{"n":1,"totalMinutes":0.1},"design-review":{"n":1,"totalMinutes":0.1},"design-spike":{"n":1,"totalMinutes":0.1},"design-apply-review":{"n":1,"totalMinutes":5.7},"design-organise":{"n":1,"totalMinutes":3.3},"design-summary":{"n":1,"totalMinutes":0.5},"design-workstream-suggest":{"n":1,"totalMinutes":1.7},"design-close-workflow":{"n":1,"totalMinutes":0.3}}},"ledgers":{"deferrals":{"repo":170,"added":0},"failures":{"repo":120,"added":0},"friction":{"added":3}}}
diff --git a/.bkit/templates.md b/.bkit/templates.md
index 0c791ff00..254491301 100644
--- a/.bkit/templates.md
+++ b/.bkit/templates.md
@@ -13,7 +13,7 @@
 
 ## What each template is for
 
-The adoption order is the `bkit tips` order. The local stack lock has no tip, because nothing in a repo shows a stack that every worktree shares, so adopt it once a second worktree touches that stack. The health check has no tip either: the `bkit-stub-health` advisory raises it while your CI copy keeps that stub. The sections below give each template's install steps and traps.
+The adoption order is the `bkit tips` order. The machine lock has no tip, so adopt it when test gates or local services need to run one at a time across checkouts. The health check has no tip either: the `bkit-stub-health` advisory raises it while your CI copy keeps that stub. The sections below give each template's install steps and traps.
 
 <!-- prettier-ignore -->
 | Template | What it's for | Skip it and |
@@ -38,7 +38,7 @@ The adoption order is the `bkit tips` order. The local stack lock has no tip, be
 | Prettier tables | One edited cell = one changed row in the diff. | A one-word table edit diffs as the whole table. |
 | tmp/ prune | Each push deletes scratch files agents left in `tmp/` untouched for a week. | `tmp/` keeps growing; old logs and scratch files are never cleared. |
 | Disk prune | Your own cleanup steps (build caches, Docker, simulators) run on commit, on push, and before a worktree is made on a low disk. bkit deletes nothing itself. | Caches fill the disk until no worktree can be made; every workflow stops. |
-| Local stack lock | One run at a time on local services every worktree shares (Docker database, emulator); a second run waits and names the run holding them. | A reset or stop from one worktree wipes the stack under another worktree's test run; the failures look like real bugs. |
+| Machine lock | Named locks run one gate at a time across repositories; the unnamed lock protects local services every worktree shares. A second run waits and names the holder. | Test gates compete for CPU, or a reset stops the stack under another worktree's test run. |
 | Cursor editor + cloud agent | Format-on-save, recommended extensions, Cursor cloud-agent image. | Cursor edits miss project formatting; no Cursor cloud agent. |
 | Launchd GUI env | macOS apps opened from the Dock get the same tokens as the terminal. | Dock-launched editors start signed out. |
 
@@ -71,7 +71,7 @@ The adoption order is the `bkit tips` order. The local stack lock has no tip, be
 | Prettier tables | `.bkit/templates/scripts/prettier/bkit-insert-ignore.mjs` | `scripts/prettier/` | that file |
 | tmp/ prune | `.bkit/templates/scripts/cleanup/bkit-tmp-prune.mjs` | `scripts/cleanup/` | that file |
 | Disk prune | `.bkit/templates/scripts/cleanup/bkit-disk-prune.mjs`, `bkit-disk-prune.machine.mjs` | `scripts/cleanup/bkit-disk-prune.mjs`, `~/.config/bkit/disk-prune.mjs` | `scripts/cleanup/bkit-disk-prune.mjs` only |
-| Local stack lock | `.bkit/templates/scripts/ci/bkit-local-stack-lock.sh` | `scripts/ci/` | that file |
+| Machine lock | `.bkit/templates/scripts/ci/bkit-machine-lock.sh` | `scripts/ci/` | that file |
 | Context-fetch blocks | `.bkit/templates/context/bkit-<provider>.md` | below `<!-- bkit:end -->` in `.agents/context.md` | the blocks you use |
 | Cloud SessionStart hook | `.bkit/templates/.claude/hooks/bkit-cloud-bootstrap.sh` | `.claude/hooks/bkit-cloud-bootstrap.sh` | that file |
 
@@ -888,14 +888,14 @@ Every worktree of a repo uses the same local services when their names and ports
 
 ```bash
 mkdir -p scripts/ci
-cp .bkit/templates/scripts/ci/bkit-local-stack-lock.sh scripts/ci/
+cp .bkit/templates/scripts/ci/bkit-machine-lock.sh scripts/ci/
 ```
 
 <!-- prettier-ignore -->
 | Wire into | How | Holds the lock |
 | --- | --- | --- |
-| `package.json` scripts that start / reset / stop the stack | `"db:reset": "bash scripts/ci/bkit-local-stack-lock.sh run db:reset -- <reset command>"` | for the command; its exit status passes on |
-| local runners that test against the stack | `. scripts/ci/bkit-local-stack-lock.sh`, then `take_local_stack_lock "<who>"` before the first stack command; non-zero → exit | until the runner exits or calls `release_local_stack_lock` |
+| `package.json` scripts that start / reset / stop the stack | `"db:reset": "bash scripts/ci/bkit-machine-lock.sh run db:reset -- <reset command>"` | for the command; its exit status passes on |
+| local runners that test against the stack | `. scripts/ci/bkit-machine-lock.sh`, then `take_local_stack_lock "<who>"` before the first stack command; non-zero → exit | until the runner exits or calls `release_local_stack_lock` |
 
 - Functions (all safe under `set -e`):
   - `take_local_stack_lock` waits.
diff --git a/.bkit/templates/scripts/ci/bkit-machine-lock.sh b/.bkit/templates/scripts/ci/bkit-machine-lock.sh
new file mode 100644
index 000000000..cf85fc2be
--- /dev/null
+++ b/.bkit/templates/scripts/ci/bkit-machine-lock.sh
@@ -0,0 +1,246 @@
+#!/bin/bash
+# Example. Copy into scripts/ci/ and own it.
+# bkit install does not write this file and does not overwrite a copy.
+#
+# bkit-machine-lock.sh — machine-wide named locks and the checkout's shared stack lock.
+#
+#   . scripts/ci/bkit-machine-lock.sh
+#   take_local_stack_lock "<who>" [name]    # waits, returns 1 on refusal
+#   try_local_stack_lock "<who>" [name]     # returns 1 immediately while busy
+#   release_local_stack_lock [name]        # optional; caller exit also frees the lock
+#   local_stack_lock_holder [name]
+#   local_stack_lock_file [name]
+#
+# package.json: wrap test gates with
+#   bash scripts/ci/bkit-machine-lock.sh run --lock tests -- <gate command> [args…]
+# run ["<who>"] [--lock <name>] -- <command> exits with the command's status:
+# 2 usage, 73 the lock could not be taken, 75 the wait gave up.
+# The run name defaults to LOCAL_STACK_LOCK_WHO, npm_lifecycle_event, then run.
+#
+# Named locks live in ${XDG_CACHE_HOME:-$HOME/.cache}/bkit/machine-lock/ with no
+# repository prefix. The unnamed stack lock keeps its local-stack-lock/ path and
+# LOCAL_STACK_LOCK_OWNER / LOCAL_STACK_LOCK_PID names, so adopted copies still work.
+# Named owners use LOCAL_STACK_LOCK_OWNER_<key> and LOCAL_STACK_LOCK_PID_<key>.
+# Each holder records its checkout, process id and start time.
+#
+# Take locks in this order: tests, other named locks, then the unnamed stack lock.
+# A child reuses only the named or unnamed lock its live parent holds.
+# CI=true / CI=1 is a no-op. LOCAL_STACK_LOCK_WAIT_S caps the wait (default 3600).
+# A Perl flock holder exits within a second of its caller; killed callers leave no stale lock.
+# Requires Bash 3.2+ and /usr/bin/perl.
+
+_LOCAL_STACK_LOCK_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
+_LOCAL_STACK_LOCK_ROOT="$(git -C "$_LOCAL_STACK_LOCK_DIR" rev-parse --show-toplevel 2>/dev/null || echo "$_LOCAL_STACK_LOCK_DIR")"
+LOCAL_STACK_LOCK_PID="${LOCAL_STACK_LOCK_PID:-}"
+_LOCAL_STACK_LOCK_EXIT=73
+
+# The stack's name: BKIT_LOCAL_STACK, else the main checkout's folder name, the same from every
+# worktree. Characters outside A-Z a-z 0-9 . _ - become _.
+local_stack_lock_name() {
+  _lsl_name="${BKIT_LOCAL_STACK:-}"
+  if [ -z "$_lsl_name" ]; then
+    _lsl_common="$(git -C "$_LOCAL_STACK_LOCK_DIR" rev-parse --path-format=absolute --git-common-dir 2>/dev/null)" || return 1
+    [ -n "$_lsl_common" ] || return 1
+    case "$(basename "$_lsl_common")" in
+      .git) _lsl_name="$(basename "$(dirname "$_lsl_common")")" ;;
+      *) _lsl_name="$(basename "$_lsl_common" .git)" ;;
+    esac
+  fi
+  printf '%s\n' "$_lsl_name" | LC_ALL=C tr -c 'A-Za-z0-9._\n-' '_'
+}
+
+# A named lock has one machine-wide path; the unnamed path remains stack-scoped.
+local_stack_lock_file() {
+  local _lsl_stack
+  if [ -n "${1:-}" ]; then
+    _lsl_stack="$(printf '%s' "$1" | LC_ALL=C tr -c 'A-Za-z0-9._-' '_')"
+    echo "${XDG_CACHE_HOME:-$HOME/.cache}/bkit/machine-lock/${_lsl_stack}.lock"
+  else
+    _lsl_stack="$(local_stack_lock_name)" || return 1
+    echo "${XDG_CACHE_HOME:-$HOME/.cache}/bkit/local-stack-lock/${_lsl_stack}.lock"
+  fi
+}
+
+# "<who> — <checkout> (pid N, since HH:MM:SS)" for the run holding the lock.
+local_stack_lock_holder() {
+  local _lsl_held
+  _lsl_held="$(local_stack_lock_file "${1:-}")" || return 0
+  cat "${_lsl_held}.holder" 2>/dev/null
+  return 0
+}
+
+_local_stack_lock_vars() {
+  local _lsl_key
+  _lsl_key="$(printf '%s' "${1:-}" | LC_ALL=C tr -c 'A-Za-z0-9._-' '_')"
+  _lsl_key="${_lsl_key//_/__}"
+  _lsl_key="${_lsl_key//-/_h}"
+  _lsl_key="${_lsl_key//./_d}"
+  _lsl_pid_var="LOCAL_STACK_LOCK_PID"
+  _lsl_owner_var="LOCAL_STACK_LOCK_OWNER"
+  if [ -n "${1:-}" ]; then
+    _lsl_pid_var="${_lsl_pid_var}_${_lsl_key}"
+    _lsl_owner_var="${_lsl_owner_var}_${_lsl_key}"
+  fi
+}
+
+_local_stack_lock() {
+  local _lsl_mode="$1" _lsl_who="$2" _lsl_name="${3:-}"
+  local _lsl_pid_var _lsl_owner_var _lsl_owner _lsl_existing
+  local _lsl_file _lsl_label _lsl_fifo _lsl_pid _lsl_reply _lsl_checkout
+  _LOCAL_STACK_LOCK_EXIT=73
+  _local_stack_lock_vars "$_lsl_name"
+  _lsl_owner="${!_lsl_owner_var:-}"
+  _lsl_existing="${!_lsl_pid_var:-}"
+  if [ "${CI:-}" = "true" ] || [ "${CI:-}" = "1" ]; then return 0; fi
+  if [ -n "$_lsl_owner" ] && kill -0 "$_lsl_owner" 2>/dev/null; then return 0; fi
+  if [ -n "$_lsl_existing" ] && kill -0 "$_lsl_existing" 2>/dev/null; then return 0; fi
+
+  if ! _lsl_file="$(local_stack_lock_file "$_lsl_name")"; then
+    echo "[machine-lock] ❌ cannot name the local stack: run inside a git checkout, or set BKIT_LOCAL_STACK" >&2
+    return 1
+  fi
+  _lsl_label="the local stack $(basename "$_lsl_file" .lock)"
+  _lsl_checkout="$_LOCAL_STACK_LOCK_ROOT"
+  if [ -n "$_lsl_name" ]; then
+    _lsl_label="$_lsl_name"
+    _lsl_checkout="$(git -C "$PWD" rev-parse --show-toplevel 2>/dev/null || printf '%s' "$PWD")"
+  fi
+  if [ ! -x /usr/bin/perl ]; then
+    echo "[machine-lock] ❌ could not take the lock for $_lsl_label: /usr/bin/perl not found" >&2
+    return 1
+  fi
+  if ! mkdir -p "$(dirname "$_lsl_file")"; then
+    echo "[machine-lock] ❌ could not take the lock for $_lsl_label: cannot create $(dirname "$_lsl_file")" >&2
+    return 1
+  fi
+  _lsl_fifo="$(mktemp -u "${TMPDIR:-/tmp}/local-stack-lock.XXXXXX")"
+  mkfifo "$_lsl_fifo" || return 1
+
+  # The holder answers on the fifo once: ok, busy <holder>, timeout <holder> or error <why>.
+  /usr/bin/perl -e '
+    use strict;
+    use Fcntl qw(:flock);
+    use POSIX qw(strftime);
+    my ($file, $owner, $who, $checkout, $fifo, $wait_s, $mode, $label) = @ARGV;
+    # The caller is the parent of this process. When it exits, this process goes to init (or a
+    # subreaper) at once, while `kill 0` would still find it until whoever started it reaps it.
+    my $parent = getppid();
+    my $caller_alive = sub { getppid() == $parent };
+    open(my $out, ">", $fifo) or exit 1;
+    $out->autoflush(1);
+    my $holder = sub { open(my $h, "<", "$file.holder") or return "another run"; my $l = <$h>; chomp $l; $l };
+    my $lock;
+    open($lock, ">>", $file) or do { print $out "error cannot open $file: $!\n"; exit 1 };
+    my $start = time;
+    my $next_note = 0;
+    until (flock($lock, LOCK_EX | LOCK_NB)) {
+      exit 0 unless $caller_alive->();
+      if ($mode eq "try") { print $out "busy " . $holder->() . "\n"; exit 0 }
+      if (time - $start >= $wait_s) { print $out "timeout " . $holder->() . "\n"; exit 0 }
+      if (time >= $next_note) {
+        my $m = int((time - $start) / 60);
+        my $so_far = $m ? " (still, $m min so far)" : "";
+        print STDERR "[machine-lock] ⏳ $who is waiting for $label$so_far: in use by " . $holder->() . "\n";
+        $next_note = time + 60;
+      }
+      sleep 1;
+    }
+    $SIG{TERM} = $SIG{INT} = $SIG{HUP} = sub { unlink "$file.holder"; exit 0 };
+    if (open(my $h, ">", "$file.holder")) {
+      print $h "$who — $checkout (pid $owner, since " . strftime("%H:%M:%S", localtime) . ")\n";
+      close $h;
+    }
+    print $out "ok\n";
+    close $out;
+    sleep 1 while $caller_alive->();
+    unlink "$file.holder";
+  ' "$_lsl_file" "$$" "$_lsl_who" "$_lsl_checkout" "$_lsl_fifo" "${LOCAL_STACK_LOCK_WAIT_S:-3600}" "$_lsl_mode" "$_lsl_label" </dev/null >/dev/null &
+  _lsl_pid=$!
+  # The fifo is opened read-write, so the read never blocks on a holder that died before it
+  # answered (a failed fork under load, a killed perl): the loop stops once it is gone.
+  _lsl_reply="$(
+    exec 3<>"$_lsl_fifo"
+    while :; do
+      if IFS= read -r -t 1 _lsl_line <&3; then
+        printf '%s' "$_lsl_line"
+        break
+      fi
+      if ! kill -0 "$_lsl_pid" 2>/dev/null; then
+        # The holder may have answered and exited between the read timing out and this check.
+        if IFS= read -r -t 1 _lsl_line <&3; then printf '%s' "$_lsl_line"; fi
+        break
+      fi
+    done
+  )" || true
+  rm -f "$_lsl_fifo"
+
+  case "$_lsl_reply" in
+    ok)
+      printf -v "$_lsl_pid_var" '%s' "$_lsl_pid"
+      printf -v "$_lsl_owner_var" '%s' "$$"
+      export "$_lsl_owner_var"
+      return 0
+      ;;
+    busy\ *)
+      _LOCAL_STACK_LOCK_EXIT=75
+      echo "[machine-lock] $_lsl_label is in use by ${_lsl_reply#busy }" >&2
+      ;;
+    timeout\ *)
+      _LOCAL_STACK_LOCK_EXIT=75
+      echo "[machine-lock] ❌ $_lsl_who gave up after ${LOCAL_STACK_LOCK_WAIT_S:-3600}s waiting for $_lsl_label, in use by ${_lsl_reply#timeout }" >&2
+      echo "[machine-lock]    Let that run finish, or stop it. LOCAL_STACK_LOCK_WAIT_S sets how long to wait." >&2
+      ;;
+    "")
+      echo "[machine-lock] ❌ could not take the lock for $_lsl_label: the perl process holding it stopped before it answered" >&2
+      ;;
+    *)
+      echo "[machine-lock] ❌ could not take the lock for $_lsl_label: ${_lsl_reply#error }" >&2
+      ;;
+  esac
+  wait "$_lsl_pid" 2>/dev/null || true
+  return 1
+}
+
+take_local_stack_lock() { _local_stack_lock wait "$1" "${2:-}"; }
+try_local_stack_lock() { _local_stack_lock try "$1" "${2:-}"; }
+
+release_local_stack_lock() {
+  local _lsl_pid_var _lsl_owner_var _lsl_release_pid
+  _local_stack_lock_vars "${1:-}"
+  _lsl_release_pid="${!_lsl_pid_var:-}"
+  [ -n "$_lsl_release_pid" ] || return 0
+  kill "$_lsl_release_pid" 2>/dev/null || true
+  wait "$_lsl_release_pid" 2>/dev/null || true
+  printf -v "$_lsl_pid_var" '%s' ""
+  unset "$_lsl_owner_var"
+  return 0
+}
+
+if [ "${BASH_SOURCE[0]}" = "$0" ]; then
+  _lsl_run_usage() {
+    echo 'usage: bash scripts/ci/bkit-machine-lock.sh run ["<who>"] [--lock <name>] -- <command> [args…]' >&2
+    exit 2
+  }
+  [ "${1:-}" = run ] || _lsl_run_usage
+  shift
+  _lsl_run_who="${LOCAL_STACK_LOCK_WHO:-${npm_lifecycle_event:-run}}"
+  _lsl_run_name=""
+  case "${1:-}" in
+    --lock|--) ;;
+    "") _lsl_run_usage ;;
+    *) _lsl_run_who="$1"; shift ;;
+  esac
+  if [ "${1:-}" = --lock ]; then
+    [ -n "${2:-}" ] && [ "$2" != -- ] || _lsl_run_usage
+    _lsl_run_name="$2"
+    shift 2
+  fi
+  [ "${1:-}" = -- ] || _lsl_run_usage
+  shift
+  [ "$#" -gt 0 ] || _lsl_run_usage
+  take_local_stack_lock "$_lsl_run_who" "$_lsl_run_name" || exit "$_LOCAL_STACK_LOCK_EXIT"
+  "$@"
+  _lsl_run_status=$?
+  release_local_stack_lock "$_lsl_run_name"
+  exit "$_lsl_run_status"
+fi
diff --git a/.bkit/version b/.bkit/version
index bb513f267..4797dd929 100644
--- a/.bkit/version
+++ b/.bkit/version
@@ -3,7 +3,7 @@
   "canonicalHashes": {
     ".cursor/mcp.json": "355e01cadabed3b924ebe339dc07ecbf7179397ebc9accf8618d5d7d6af6c438",
     "docs/deployments.md": "b7a8014afb7da246d615894519d87d5def6d0c6c7be8e714fb634157cdd7580f",
-    "docs/testing.md": "04d591fb6ab9f66ad269a58d457d03a38a15b6c5c6d7e3a8af51d31feb697320",
+    "docs/testing.md": "7b60ce0e300e1438f965c06e5de4077262b73361e7dd3a46776571218e7f4793",
     ".claude/settings.json": "f6c41bd5f3d1f6a10d456543c0653a82c9432bd6f3a6a8aa1b3e9a78eb72a3b7",
     ".agents/context.md": "5cf54b91ffaa5d9372415a24dd1acfe0910c7def1f4434e25ccf110e3eaed013",
     ".agents/docs.md": "bfbddbf98bc4238c6a01dbd68fbe515ba01db2371c440d868fe12a8db6c96df0",
@@ -22,9 +22,9 @@
     "docs/technology.md": "69f00bc76a6546c98d6ee6a3fc21808ccbcc81909d0ee1ff9c1dd9f7b8cb2c58",
     ".bkit/.env.example": "3eae6dd3d96a33aed1745fc6b069000ae7272fbdab99617250015e9c233e6200",
     ".opencode/opencode.json": "06b3702dcb8968463c164b36fbc340428591f6601420cb48e95371db1d1ac958",
-    "docs/design.md": "1dc7f8c63d8252c763a8d01e09a81a715b84677e3de404416ac7f2c79a0d7644",
+    "docs/design.md": "05d888d6188c44f518bd1d10b4c01ae6af373a6ce79da72fbaf10d5d45154e15",
     ".claude/commands/bkit-auto.md": "260073c68e7557e6b3477b5dd0f56427a74993877dcd3cfada11d65be2ea85f4",
-    ".claude/commands/bkit-build.md": "3d031b48f7639e32162638702afe9b9a18620427c01d133b6d89e72f6e068ea5",
+    ".claude/commands/bkit-build.md": "c40d7ce9ebabee268d3162fef41459fe06b2c4a165276cb009a86fbdceb606b0",
     ".claude/commands/bkit-debug.md": "1a59a2c43d718d9d71b67219848d56a72aa91779fa3aac656c5ab0721318dab8",
     ".claude/commands/bkit-design.md": "f1bdf372f6226877037902ba395d5bc01b9aca784cef3f1e0cbbb9939c068a8c",
     ".claude/commands/bkit-plan.md": "0e6ce306b016e4241d16379638a0ca776358d8b1b209202d7b6075092f19b7b3",
@@ -56,7 +56,7 @@
     ".claude/agents/bkit-utility-compress-markdown.md": "b43e14949abd2218e1407fa587ee542bd5951caf543c4bd0718b7a78eea128c7",
     ".claude/agents/bkit-utility-update-documentation.md": "0b3d4145acaf8ce46ace5328fe2e13f904d3c8aba8823aa1c2bff6a4cc5f7d3e",
     ".cursor/commands/bkit-auto.md": "dd1637833fa6c64e05678a6357d1d3f322e782e668d56d423f170f08218f374d",
-    ".cursor/commands/bkit-build.md": "8b16b3b7388af311af94069f5744982f4a5465454139f2f19293e1fbb8169831",
+    ".cursor/commands/bkit-build.md": "984d8d56ddb67968862c703d331aadcac114bf11661c9e7cf27038638be0a580",
     ".cursor/commands/bkit-debug.md": "f457c40362c2817c3950352932f5c7b7b341a3dbda291908031d3824896cbc62",
     ".cursor/commands/bkit-design.md": "6fc9344768b275f1f76585a816d4fa7775b789edd3085a87056abbea789c2b50",
     ".cursor/commands/bkit-plan.md": "c2580c73e36848a5f7a830ebf1491daf97400ab90cc9934eac9341f242ce3c93",
@@ -114,7 +114,7 @@
     ".opencode/agents/bkit-utility-compress-markdown.md": "8265357e11e5bd3d358281b2f712e09dff81cb5d278436ab7584355784b09f7f",
     ".opencode/agents/bkit-utility-update-documentation.md": "e494bd347aa52ca97786a094d9083721ad264070f1e3a0c90efeac23789dcc2a",
     ".opencode/commands/bkit-auto.md": "aaaa897a5cd1766f875ce084fdd89ab97282d78ec0b3fe6fd66e790e96f3c047",
-    ".opencode/commands/bkit-build.md": "00630c4db1b38568dc81ae8a070e20cc68ffc44cd95b322d23fa1ea93a941589",
+    ".opencode/commands/bkit-build.md": "e44c5272f6a12c3355af0111a6610779e642ace02687a3814258feeab3cf1294",
     ".opencode/commands/bkit-debug.md": "007252b0514f6ba49df2a1938fd4c0170f3523af918734d39957976771a01d38",
     ".opencode/commands/bkit-design.md": "741a2ac077cdfb19c79146314fd32ae2961d930ccff9563df81ebc90bdbb81f1",
     ".opencode/commands/bkit-plan.md": "afa884bb468e4411e9914be71e3783b906c53734f9dede7af92b0c98af89bd76",
@@ -215,7 +215,7 @@
     ".cursor/agents/bkit-utility-update-roadmap.md": "ea7081672a0fe44a1d2eaf40958c008a7631d329345d11d6a7ca4439a156bf25",
     "docs/templates/bkit-audit-agents.md": "39f34db396db4e50742d230304ecdeb0ceb367ee99e03aaba740872ff8fdd858",
     "docs/templates/bkit-audit-prompts.md": "3323a98811ad65da0fc30d5e52f2a48cd09872dc490fcac0008adba097c37e0a",
-    ".bkit/templates.md": "7986d00edacb0facd8da603afe5540a890ca62901a19a505021ebdf378f20de8",
+    ".bkit/templates.md": "47cc7dbe0c5411d1bf138b7b53eb7d7a5348905e0e2eb35dbd097e52b141ef6d",
     "docs/templates/bkit-audit-adoption.md": "09fa8636f0529f95ab7a46f4c74727da85fde7180d43979e74cdbb3ea3557794",
     ".bkit/cloud.md": "7594f46d9003bcf77650cf57c3ff934278690187434e58bc57159ccbd1c52524",
     ".bkit/comparison.md": "1ab7924388e037438a73a87c1826f5846f7ae38a5a41479eb6bb7454ae782d07",
@@ -224,7 +224,7 @@
     ".bkit/providers.md": "f55e9e3e06f53afec0ba2aed6d0981307469cfc4c1aba7b99f176cc3a8cde6eb",
     ".bkit/prompts.md": "05bef1112ac15f6ffdb8877f132d0b85e2718ca682be4dca0a7dbebdd798ab05",
     ".bkit/trackers.md": "3a3b60d2de7e69a8a59a7567159457afa6c5787a1f066b1399f6ed7499b49d96",
-    ".bkit/workflows.md": "30a29709cfc5eccc30d47103d8a57112d93bbf3f98f8cebfce97b987b9fc292a",
+    ".bkit/workflows.md": "ae27e98559f30fa343cf9a2c8e794f449af22a3c2b2e2c660464e6d0896c967c",
     ".bkit/README.md": "1037df0251190241d83d900a9e3e5e2bf8e6dbfd3d9cb7d5f7948a73ab9732a4",
     ".cursor/rules/bkit-rules.mdc": "164c1bc7aed517d5eca01abac2f0c0e87a1102ceb1700eae02e340ef6f9ce797",
     ".claude/hooks/bkit-gateguard.cjs": "e13200a179c654f32e2a91f79be766c1755dd814d7d025bffd707ba6e91b965e",
diff --git a/.bkit/workflows.md b/.bkit/workflows.md
index a74ba4cbd..0f42060f1 100644
--- a/.bkit/workflows.md
+++ b/.bkit/workflows.md
@@ -33,7 +33,7 @@ The source files live in `.bkit/core/workflows/`. `bkit install` regenerates `.c
 | --- | --- | --- | --- |
 | `/bkit-design` | yes | yes | `docs/plans/{YYYYMM}/{FID}-design.md` |
 | `/bkit-plan` | yes | yes | `docs/plans/{YYYYMM}/{FID}-plan.md` |
-| `/bkit-build` | yes | no — CI continues | PR to `dev` with plan-link URL; with `publish=false` (local only), no push or PR: the build is held on `feat/{FID}` for `/bkit-ship` |
+| `/bkit-build` | yes | no — CI continues | PR to `dev` with plan-link URL; restored tests post under Plan Execute (step 7). With `publish=false` (local only), no push or PR: the build is held on `feat/{FID}` for `/bkit-ship` |
 | `/bkit-debug` | yes | no | Remediated commit pushed to feature branch |
 | `/bkit-ship` | yes | yes | Squash-merged PR; plans canonical at `docs/plans/{YYYYMM}/` (no archive move — `{YYYYMM}` = creation month); worktree gone |
 | `/bkit-auto` | args `{PHASE} {ARG}` (`{ARG}` = PR number **or** FID slug for ship / debug, issue for design/plan/build) | n/a (dispatches into the matching `/bkit-{phase}`) | Phase-routed; same session continues into the dispatched skill |
diff --git a/.claude/commands/bkit-build.md b/.claude/commands/bkit-build.md
index 0da7136ed..2b85c7145 100644
--- a/.claude/commands/bkit-build.md
+++ b/.claude/commands/bkit-build.md
@@ -711,7 +711,7 @@ Each task group gets its own pass of Steps 7-9, in group order. Step 7 briefs th
    Update: the tests named, `docs/plans/{YYYYMM}/logs/{FID}/build-plan-tests-{GROUP}-log.md`.
    Record the restore. The command reads the group's `TEST FIRST` files from the plan and commits the diff:
    ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-plan-tests --file="{STATUS}" --attempt-of=build-plan-tests:next --group={GROUP} --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --agent=bkit-build-plan-tests --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-tests-{GROUP}-log.md --number=9 --post --title="Plan Gaps Remediate — tests restored" --message="chore({FID}): plan-tests group {GROUP} attempt <attempt>"
+   "{BKIT}" steps finish --workflow=build --step=build-plan-tests --file="{STATUS}" --attempt-of=build-plan-tests:next --group={GROUP} --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --agent=bkit-build-plan-tests --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-tests-{GROUP}-log.md --number=7 --post --title="Plan Execute — tests restored" --message="chore({FID}): plan-tests group {GROUP} attempt <attempt>"
    ```
    **If** exit 15 → the diff changes a file no `TEST FIRST` line of the group names (`source`): invoke `@bkit-build-plan-tests` again with `"<problem> Undo your edits to each file in <source>: restore it to its committed content, or delete it when you created it. Write no source code."` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**.
    Record the group's red again:
diff --git a/.cursor/commands/bkit-build.md b/.cursor/commands/bkit-build.md
index f8fb5df29..ad6c15d8b 100644
--- a/.cursor/commands/bkit-build.md
+++ b/.cursor/commands/bkit-build.md
@@ -710,7 +710,7 @@ Each task group gets its own pass of Steps 7-9, in group order. Step 7 briefs th
    Update: the tests named, `docs/plans/{YYYYMM}/logs/{FID}/build-plan-tests-{GROUP}-log.md`.
    Record the restore. The command reads the group's `TEST FIRST` files from the plan and commits the diff:
    ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-plan-tests --file="{STATUS}" --attempt-of=build-plan-tests:next --group={GROUP} --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --agent=bkit-build-plan-tests --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-tests-{GROUP}-log.md --number=9 --post --title="Plan Gaps Remediate — tests restored" --message="chore({FID}): plan-tests group {GROUP} attempt <attempt>"
+   "{BKIT}" steps finish --workflow=build --step=build-plan-tests --file="{STATUS}" --attempt-of=build-plan-tests:next --group={GROUP} --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --agent=bkit-build-plan-tests --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-tests-{GROUP}-log.md --number=7 --post --title="Plan Execute — tests restored" --message="chore({FID}): plan-tests group {GROUP} attempt <attempt>"
    ```
    **If** exit 15 → the diff changes a file no `TEST FIRST` line of the group names (`source`): invoke `@bkit-build-plan-tests` again with `"<problem> Undo your edits to each file in <source>: restore it to its committed content, or delete it when you created it. Write no source code."` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**.
    Record the group's red again:
diff --git a/.opencode/commands/bkit-build.md b/.opencode/commands/bkit-build.md
index 79aa342c8..434a5dabd 100644
--- a/.opencode/commands/bkit-build.md
+++ b/.opencode/commands/bkit-build.md
@@ -714,7 +714,7 @@ Each task group gets its own pass of Steps 7-9, in group order. Step 7 briefs th
    Update: the tests named, `docs/plans/{YYYYMM}/logs/{FID}/build-plan-tests-{GROUP}-log.md`.
    Record the restore. The command reads the group's `TEST FIRST` files from the plan and commits the diff:
    ```bash
-   "{BKIT}" steps finish --workflow=build --step=build-plan-tests --file="{STATUS}" --attempt-of=build-plan-tests:next --group={GROUP} --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --agent=bkit-build-plan-tests --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-tests-{GROUP}-log.md --number=9 --post --title="Plan Gaps Remediate — tests restored" --message="chore({FID}): plan-tests group {GROUP} attempt <attempt>"
+   "{BKIT}" steps finish --workflow=build --step=build-plan-tests --file="{STATUS}" --attempt-of=build-plan-tests:next --group={GROUP} --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --agent=bkit-build-plan-tests --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-tests-{GROUP}-log.md --number=7 --post --title="Plan Execute — tests restored" --message="chore({FID}): plan-tests group {GROUP} attempt <attempt>"
    ```
    **If** exit 15 → the diff changes a file no `TEST FIRST` line of the group names (`source`): invoke `@bkit-build-plan-tests` again with `"<problem> Undo your edits to each file in <source>: restore it to its committed content, or delete it when you created it. Write no source code."` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**.
    Record the group's red again:
diff --git a/README.md b/README.md
index da886380e..564e4e1be 100644
--- a/README.md
+++ b/README.md
@@ -354,7 +354,7 @@ config:
     useMaxWidth: false
 ---
 flowchart LR
-  %% Generated by bkit-graphify-rollup.py from 6af3da0add44a098ea842cdeaa98d4623f9f7c8e — do not edit
+  %% Generated by bkit-graphify-rollup.py from dd6536fd685f2be0049ae5fe3c197dfc16ca18ff — do not edit
   subgraph gn_bkit_core_engine[".bkit/core/engine"]
     n_bkit_core_engine_checks["checks<br/>248 symbols · 18 files"]
     n_bkit_core_engine_cli["cli<br/>33 symbols · 1 files"]
diff --git a/docs/capabilities.md b/docs/capabilities.md
index df6dbcde9..4a16c3587 100644
--- a/docs/capabilities.md
+++ b/docs/capabilities.md
@@ -30,7 +30,7 @@
 > - `budgeted` = solid amber border + a faint amber box. Still drawn, because a declared bypass is still a bypass, but it is settled, not an open question.
 > - Which status is which: `split` fine dash · `bypassed` long dash · `dead` even dash · `gap` dotted · `budgeted` no dash.
 > - A fetched URL is a STRING, never an edge, because the reachability scan (§ Unreachable API calls) is the only check that sees it.
-> - Table rescanned every run, never stale. Diagrams from `graph.json` @ `6af3da0ad`; when that differs from HEAD ⇒ run `pnpm graph:update` first.
+> - Table rescanned every run, never stale. Diagrams from `graph.json` @ `dd6536fd6`; when that differs from HEAD ⇒ run `pnpm graph:update` first.
 > - Detail-level module graph → `pnpm graph`. This doc is the altitude above that: capabilities, not files.
 
 ## Status Vocabulary
@@ -159,7 +159,7 @@ config:
     useMaxWidth: false
 ---
 flowchart LR
-  %% Generated by bkit-graphify-rollup.py from 6af3da0add44a098ea842cdeaa98d4623f9f7c8e — do not edit
+  %% Generated by bkit-graphify-rollup.py from dd6536fd685f2be0049ae5fe3c197dfc16ca18ff — do not edit
   subgraph gn_bkit_core_engine[".bkit/core/engine"]
     n_bkit_core_engine_checks["checks<br/>248 symbols · 18 files"]
     n_bkit_core_engine_cli["cli<br/>33 symbols · 1 files"]
@@ -248,7 +248,7 @@ config:
     useMaxWidth: false
 ---
 flowchart LR
-  %% Generated by bkit-graphify-rollup.py from 6af3da0add44a098ea842cdeaa98d4623f9f7c8e — do not edit
+  %% Generated by bkit-graphify-rollup.py from dd6536fd685f2be0049ae5fe3c197dfc16ca18ff — do not edit
   subgraph gncustom_health_checks["Health checks"]
     n_bkit_core_engine_checks_after_index[".bkit/core/engine/checks/after/index<br/>11 symbols · 1 files"]
     n_bkit_core_engine_checks_before_index[".bkit/core/engine/checks/before/index<br/>4 symbols · 1 files"]
diff --git a/docs/deferrals.jsonl b/docs/deferrals.jsonl
index b62f99754..b38de77c5 100644
--- a/docs/deferrals.jsonl
+++ b/docs/deferrals.jsonl
@@ -191,3 +191,4 @@
 {"schema":3,"ts":1793583541553,"firstTs":1792985807437,"updates":2,"kind":"deferral","key":"700-first-action-deny-gate","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"utility","step":"manual"},"references":["#700","docs/plans/202610/700-session-start-nudge-plan.md § Out of Scope","docs/plans/202610/logs/700-session-start-nudge/build-input-1.md § Out of Scope"],"type":"feature","category":"agentic","severity":"LOW","reason":"scope-declared","status":"OPEN","summary":"First-action deny gate: deny Edit / Write / Bash until a read of `.agents/rules.md` is observed","description":"Idea 2 from #700. A hard guarantee across hosts, built on the GateGuard before-hook plus ReadGuard's per-session read log (`.bkit/core/hooks/gateguard-engine.js`, `.bkit/core/hooks/readguard-engine.js`). Blocked by Claude Code `SessionStart` being unable to block and by the absence of a shared gate across every host.","remediation":"Needs a cross-host gate primitive and a per-session read log of `.agents/rules.md`; design as its own feature."}
 {"schema":3,"ts":1793583541554,"firstTs":1792985807438,"updates":2,"kind":"deferral","key":"700-rules-content-hash-acknowledgement","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"utility","step":"manual"},"references":["#700","docs/plans/202610/700-session-start-nudge-plan.md § Out of Scope","docs/plans/202610/logs/700-session-start-nudge/build-input-1.md § Out of Scope"],"type":"feature","category":"agentic","severity":"LOW","reason":"scope-declared","status":"OPEN","summary":"Content-hash acknowledgement: stamp the `.agents/rules.md` hash at read time and force a re-read when it changes","description":"Idea 3 from #700. Records the read's hash so a changed rules file invalidates the acknowledgement. Pairs with the first-action deny gate (`700-first-action-deny-gate`) and needs the same per-session read log.","remediation":"Depends on the deny-gate's per-session read log; design together with that feature."}
 {"schema":3,"ts":1793583541555,"firstTs":1792985807439,"updates":2,"kind":"deferral","key":"700-provider-auto-load-rules","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"utility","step":"manual"},"references":["#700","docs/plans/202610/700-session-start-nudge-plan.md § Out of Scope","docs/plans/202610/logs/700-session-start-nudge/build-input-1.md § Out of Scope"],"type":"feature","category":"agentic","severity":"LOW","reason":"scope-declared","status":"OPEN","summary":"Provider auto-load: include `.agents/rules.md` as context via host config (opencode `instructions`, `CLAUDE.md` `@` import)","description":"Idea 4 from #700. The most reliable 'read' but spends context budget on every session, on top of the advisory this plan adds.","remediation":"Measure the per-session context cost on each host before adopting; design as its own feature."}
+{"schema":3,"ts":1793608434054,"firstTs":1793608434054,"updates":1,"kind":"deferral","key":"787-file-type-specific-authoring-advisories","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"design","step":"design-generate","subagent":"bkit-design-generate","model":"gpt-6.1-sol"},"references":["787-show-authoring-rules","https://github.com/cbartens/bkit/issues/787","docs/plans/202611/logs/787-show-authoring-rules/design-grill-1.md § Settled (Q1, Q3)","docs/plans/202611/787-show-authoring-rules-design.md § Trade-offs Accepted / Out of scope"],"type":"feature","category":"agentic","severity":"LOW","reason":"scope-declared","summary":"Consider authoring advisories that select sections by file type","description":"The owner chose one general authoring advisory for shell edits and edit tools in Q1 B and Q3 A, and explicitly asked to record file-type-specific section selection as future work. Automatic section selection or quoting is outside this design.","remediation":"In a separate owner-approved change, assess whether the shared GateGuard advisory should select authoring sections by file type for both edit channels.","status":"OPEN"}
diff --git a/docs/knowledge.jsonl b/docs/knowledge.jsonl
index 45761c0a6..caf31b9e6 100644
--- a/docs/knowledge.jsonl
+++ b/docs/knowledge.jsonl
@@ -133,3 +133,5 @@
 {"schema":3,"ts":1793523381121,"firstTs":1793004573756,"updates":2,"kind":"knowledge","key":"bkit-tests-red-snapshot-accepts-added-lines-only","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"utility","step":"manual"},"references":[".bkit/core/engine/commands/workflow/tests.ts",".bkit/core/engine/audits/workflows/question-option-format.test.ts","#796"],"summary":"`bkit tests green` reads a test file as unchanged only when it keeps every snapshot line in order, so a fix to a rule after its recorded red must be pure addition","description":"- **Category:** tooling\n- **Symptom:** `bkit tests green` reports `changed: yes` and a `test-changed` gap for a test that passed its recorded red, with a `Diff since red` block, after the rule under test was corrected.\n- **Root cause:** `bkit tests red` copies the test file beside its log as `<log>.snapshot` and stores its blob; the green audit compares that snapshot with the current file through `onlyAddsLines`, which walks the snapshot's non-blank, whitespace-stripped lines as a subsequence of the current file. Inserted lines anywhere pass (`added lines only`); any modified or removed line fails. A red cannot simply be re-recorded, because `bkit tests red` refuses `passed` for a named test that now succeeds.\n- **Fix or rule:** correct a red-flagged rule by adding lines — a normalisation pass appended inside the existing function, for instance — never by editing the lines the red validated; add the new behaviour as a separate pass over the existing output and leave the old lines in order. A `TEST EXCEPTION` committed by a human is the only other way past a test-order gap.\n- **Type:** gotcha\n- **Confidence:** high\n- **Severity:** medium\n- **Scope:** bkit-repo\n- **Source:** agent","rootCause":"`onlyAddsLines` is a subsequence test over the snapshot's normalised lines, so the red evidence pins the exact byte order of the old lines: an edit breaks it, an insertion does not. `bkit tests red` will not re-record a red for a named test that now passes.","remediation":"Superseded by `steps-finish-refuses-a-code-step-whose-planned-test-file-changed` (#796): no edit to a planned test file is accepted after its red, additive or not; the code step is refused instead.","status":"SUPERSEDED"}
 {"schema":3,"ts":1793523381122,"firstTs":1793100920719,"updates":2,"kind":"knowledge","key":"prettier-write-after-a-red-breaks-the-test-first-audit","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"utility","step":"manual"},"references":[".bkit/core/engine/commands/workflow/tests.ts",".bkit/core/prompts/bkit-build-plan-verify.md","#796"],"summary":"Format a test file before recording its red; a later `prettier --write` moves a line and the green audit then reports `test-changed` with `changed: yes`","description":"- **Category:** tooling\n- **Symptom:** `bkit tests green` reports one `test-changed` gap per planned test in a file whose reds were all recorded, with `Changed since red` = `yes` and a diff that removes a single line (a wrapped `expect(…)` joined into one line) and adds the task's new tests.\n- **Root cause:** `onlyAddsLines` walks the red snapshot's whitespace-stripped, non-blank lines as a subsequence of the current file, so a prettier pass that joins a wrapped call, or splits a long one, removes a line the snapshot holds and turns the row from `added lines only` into `yes`. `bkit tests red` cannot re-record the red once the named test passes.\n- **Fix or rule:** run `prettier --write` on the test file before recording its reds, and after every later test edit check the row with `bkit tests green`: an additions-only diff keeps the row at `added lines only`, whose prompt rule clears added lines outside every planned test.\n- **Type:** gotcha\n- **Confidence:** high\n- **Severity:** medium\n- **Scope:** bkit-repo\n- **Source:** agent","rootCause":"Red evidence pins the snapshot's line sequence; the formatter is the usual second writer of a test file after its red, and the red cannot be re-recorded once the test passes.","remediation":"Superseded by `steps-finish-refuses-a-code-step-whose-planned-test-file-changed` (#796): the tests step formats the file before the red; a `prettier --write` in the code step is refused by `steps finish`, not reported at green.","status":"SUPERSEDED"}
 {"schema":3,"ts":1793524772549,"firstTs":1793524772549,"updates":1,"kind":"knowledge","key":"escaped-backticks-inside-a-code-span-are-retokenised-by-prettier","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"utility","step":"manual"},"references":["#796",".bkit/core/prompts/bkit-build-plan-tests.md",".bkit/core/engine/audits/workflows/prompt-notation.test.ts"],"summary":"A markdown code span that escapes inner backticks (`` `PASSES — TASK {N}: \\`{file}\\`` `` style) is re-tokenised by `prettier --write`: the spaces around the words after it vanish, the line no longer matches its `.bkit/instructions.md` entry and `instructions-coverage.test.ts` fails","description":"- **Category:** tooling\n- **Symptom:** after the format gate a prompt line reads `...{why}`with Bash`echo >>`` and the coverage test reports both `no entry` and `local entry no longer in the file` for it.\n- **Cause:** prettier parses the escaped backticks as span boundaries and rewrites the line; the instructions store still holds the pre-format text.","remediation":"Write a code span that must show backticks as a double-backtick span: ``PASSES — TASK {N}: `{file}` `{name}`: {reason}``. Prettier leaves it alone and `prompt-notation.test.ts` reads it as one span.","status":"ACTIVE"}
+{"schema":3,"ts":1793609535806,"firstTs":1793609535806,"updates":1,"kind":"knowledge","key":"machine-lock-dynamic-state-must-preserve-name-identity","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-gaps-remediate","subagent":"bkit-build-plan-gaps-remediate","model":"gpt-6.1-sol"},"references":[".bkit/templates/scripts/ci/bkit-machine-lock.sh",".bkit/core/engine/audits/templates/machine-lock.integration.test.ts"],"summary":"Named-lock owner and PID keys must preserve the normalized lock file identity","rootCause":"Replacing hyphens and dots with underscores only in the dynamic variable key makes distinct lock files share live-owner state, so the second take falsely succeeds without acquiring its lock.","remediation":"Escape underscores before encoding hyphens and dots in owner/PID keys. Keep simple names such as tests unchanged, and verify acquisition plus release of both distinct locks with real holder files.","status":"ACTIVE"}
+{"schema":3,"ts":1793609535807,"firstTs":1793609535807,"updates":1,"kind":"knowledge","key":"machine-lock-indirect-state-needs-unset-defaults","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-gaps-remediate","subagent":"bkit-build-plan-gaps-remediate","model":"gpt-6.1-sol"},"references":[".bkit/templates/scripts/ci/bkit-machine-lock.sh",".bkit/core/engine/audits/templates/machine-lock.integration.test.ts"],"summary":"Bash indirect owner/PID reads require defaults for source callers using nounset","rootCause":"A sourced helper reading an unset dynamic variable through indirect expansion aborts bash -u before its normal empty-state check.","remediation":"Use unset-safe defaults on each indirect state read, including release; verify both named and unnamed take/release calls in a real bash -eu subprocess.","status":"ACTIVE"}
diff --git a/docs/roadmap.md b/docs/roadmap.md
index 841871e65..4174fa259 100644
--- a/docs/roadmap.md
+++ b/docs/roadmap.md
@@ -23,7 +23,7 @@ _(above the bkit list — yours, never overwritten)_
 
 ## bkit
 
-_(refreshed 2026-11-02T07:10:51Z)_
+_(refreshed 2026-11-02T09:02:04Z)_
 
 ### Design
 
@@ -31,7 +31,9 @@ _(refreshed 2026-11-02T07:10:51Z)_
 | FID | Title | Last-transition (ts) |
 | --- | --- | --- |
 | 546-knowledge-store-ledger | 546-knowledge-store-ledger | 1793515836097 |
+| 787-show-authoring-rules | 787-show-authoring-rules | 1793609906429 |
 | 80-audit-workflow | 80-audit-workflow | 1785311294164 |
+| 826-append-routine-workflow | 826-append-routine-workflow | 1793610124288 |
 
 ### Plan
 
diff --git a/docs/testing.md b/docs/testing.md
index 1c268740d..e2904aced 100644
--- a/docs/testing.md
+++ b/docs/testing.md
@@ -661,6 +661,8 @@ Replay a stored verdict: each `completeness` row carries `sourceSha` (the sha256
 
 ## Key test files
 
+The machine-lock integration tests in `audits/templates/machine-lock.integration.test.ts` run real Bash and Perl holders against isolated cache folders. `tests/fixtures/machine-lock/stack-lock-6.0.0.sh` freezes the older stack-lock script for compatibility checks.
+
 <!-- prettier-ignore -->
 | File | Tier | Scope |
 | --- | --- | --- |
diff --git a/scripts/ci/bkit-machine-lock.sh b/scripts/ci/bkit-machine-lock.sh
new file mode 100644
index 000000000..cf85fc2be
--- /dev/null
+++ b/scripts/ci/bkit-machine-lock.sh
@@ -0,0 +1,246 @@
+#!/bin/bash
+# Example. Copy into scripts/ci/ and own it.
+# bkit install does not write this file and does not overwrite a copy.
+#
+# bkit-machine-lock.sh — machine-wide named locks and the checkout's shared stack lock.
+#
+#   . scripts/ci/bkit-machine-lock.sh
+#   take_local_stack_lock "<who>" [name]    # waits, returns 1 on refusal
+#   try_local_stack_lock "<who>" [name]     # returns 1 immediately while busy
+#   release_local_stack_lock [name]        # optional; caller exit also frees the lock
+#   local_stack_lock_holder [name]
+#   local_stack_lock_file [name]
+#
+# package.json: wrap test gates with
+#   bash scripts/ci/bkit-machine-lock.sh run --lock tests -- <gate command> [args…]
+# run ["<who>"] [--lock <name>] -- <command> exits with the command's status:
+# 2 usage, 73 the lock could not be taken, 75 the wait gave up.
+# The run name defaults to LOCAL_STACK_LOCK_WHO, npm_lifecycle_event, then run.
+#
+# Named locks live in ${XDG_CACHE_HOME:-$HOME/.cache}/bkit/machine-lock/ with no
+# repository prefix. The unnamed stack lock keeps its local-stack-lock/ path and
+# LOCAL_STACK_LOCK_OWNER / LOCAL_STACK_LOCK_PID names, so adopted copies still work.
+# Named owners use LOCAL_STACK_LOCK_OWNER_<key> and LOCAL_STACK_LOCK_PID_<key>.
+# Each holder records its checkout, process id and start time.
+#
+# Take locks in this order: tests, other named locks, then the unnamed stack lock.
+# A child reuses only the named or unnamed lock its live parent holds.
+# CI=true / CI=1 is a no-op. LOCAL_STACK_LOCK_WAIT_S caps the wait (default 3600).
+# A Perl flock holder exits within a second of its caller; killed callers leave no stale lock.
+# Requires Bash 3.2+ and /usr/bin/perl.
+
+_LOCAL_STACK_LOCK_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
+_LOCAL_STACK_LOCK_ROOT="$(git -C "$_LOCAL_STACK_LOCK_DIR" rev-parse --show-toplevel 2>/dev/null || echo "$_LOCAL_STACK_LOCK_DIR")"
+LOCAL_STACK_LOCK_PID="${LOCAL_STACK_LOCK_PID:-}"
+_LOCAL_STACK_LOCK_EXIT=73
+
+# The stack's name: BKIT_LOCAL_STACK, else the main checkout's folder name, the same from every
+# worktree. Characters outside A-Z a-z 0-9 . _ - become _.
+local_stack_lock_name() {
+  _lsl_name="${BKIT_LOCAL_STACK:-}"
+  if [ -z "$_lsl_name" ]; then
+    _lsl_common="$(git -C "$_LOCAL_STACK_LOCK_DIR" rev-parse --path-format=absolute --git-common-dir 2>/dev/null)" || return 1
+    [ -n "$_lsl_common" ] || return 1
+    case "$(basename "$_lsl_common")" in
+      .git) _lsl_name="$(basename "$(dirname "$_lsl_common")")" ;;
+      *) _lsl_name="$(basename "$_lsl_common" .git)" ;;
+    esac
+  fi
+  printf '%s\n' "$_lsl_name" | LC_ALL=C tr -c 'A-Za-z0-9._\n-' '_'
+}
+
+# A named lock has one machine-wide path; the unnamed path remains stack-scoped.
+local_stack_lock_file() {
+  local _lsl_stack
+  if [ -n "${1:-}" ]; then
+    _lsl_stack="$(printf '%s' "$1" | LC_ALL=C tr -c 'A-Za-z0-9._-' '_')"
+    echo "${XDG_CACHE_HOME:-$HOME/.cache}/bkit/machine-lock/${_lsl_stack}.lock"
+  else
+    _lsl_stack="$(local_stack_lock_name)" || return 1
+    echo "${XDG_CACHE_HOME:-$HOME/.cache}/bkit/local-stack-lock/${_lsl_stack}.lock"
+  fi
+}
+
+# "<who> — <checkout> (pid N, since HH:MM:SS)" for the run holding the lock.
+local_stack_lock_holder() {
+  local _lsl_held
+  _lsl_held="$(local_stack_lock_file "${1:-}")" || return 0
+  cat "${_lsl_held}.holder" 2>/dev/null
+  return 0
+}
+
+_local_stack_lock_vars() {
+  local _lsl_key
+  _lsl_key="$(printf '%s' "${1:-}" | LC_ALL=C tr -c 'A-Za-z0-9._-' '_')"
+  _lsl_key="${_lsl_key//_/__}"
+  _lsl_key="${_lsl_key//-/_h}"
+  _lsl_key="${_lsl_key//./_d}"
+  _lsl_pid_var="LOCAL_STACK_LOCK_PID"
+  _lsl_owner_var="LOCAL_STACK_LOCK_OWNER"
+  if [ -n "${1:-}" ]; then
+    _lsl_pid_var="${_lsl_pid_var}_${_lsl_key}"
+    _lsl_owner_var="${_lsl_owner_var}_${_lsl_key}"
+  fi
+}
+
+_local_stack_lock() {
+  local _lsl_mode="$1" _lsl_who="$2" _lsl_name="${3:-}"
+  local _lsl_pid_var _lsl_owner_var _lsl_owner _lsl_existing
+  local _lsl_file _lsl_label _lsl_fifo _lsl_pid _lsl_reply _lsl_checkout
+  _LOCAL_STACK_LOCK_EXIT=73
+  _local_stack_lock_vars "$_lsl_name"
+  _lsl_owner="${!_lsl_owner_var:-}"
+  _lsl_existing="${!_lsl_pid_var:-}"
+  if [ "${CI:-}" = "true" ] || [ "${CI:-}" = "1" ]; then return 0; fi
+  if [ -n "$_lsl_owner" ] && kill -0 "$_lsl_owner" 2>/dev/null; then return 0; fi
+  if [ -n "$_lsl_existing" ] && kill -0 "$_lsl_existing" 2>/dev/null; then return 0; fi
+
+  if ! _lsl_file="$(local_stack_lock_file "$_lsl_name")"; then
+    echo "[machine-lock] ❌ cannot name the local stack: run inside a git checkout, or set BKIT_LOCAL_STACK" >&2
+    return 1
+  fi
+  _lsl_label="the local stack $(basename "$_lsl_file" .lock)"
+  _lsl_checkout="$_LOCAL_STACK_LOCK_ROOT"
+  if [ -n "$_lsl_name" ]; then
+    _lsl_label="$_lsl_name"
+    _lsl_checkout="$(git -C "$PWD" rev-parse --show-toplevel 2>/dev/null || printf '%s' "$PWD")"
+  fi
+  if [ ! -x /usr/bin/perl ]; then
+    echo "[machine-lock] ❌ could not take the lock for $_lsl_label: /usr/bin/perl not found" >&2
+    return 1
+  fi
+  if ! mkdir -p "$(dirname "$_lsl_file")"; then
+    echo "[machine-lock] ❌ could not take the lock for $_lsl_label: cannot create $(dirname "$_lsl_file")" >&2
+    return 1
+  fi
+  _lsl_fifo="$(mktemp -u "${TMPDIR:-/tmp}/local-stack-lock.XXXXXX")"
+  mkfifo "$_lsl_fifo" || return 1
+
+  # The holder answers on the fifo once: ok, busy <holder>, timeout <holder> or error <why>.
+  /usr/bin/perl -e '
+    use strict;
+    use Fcntl qw(:flock);
+    use POSIX qw(strftime);
+    my ($file, $owner, $who, $checkout, $fifo, $wait_s, $mode, $label) = @ARGV;
+    # The caller is the parent of this process. When it exits, this process goes to init (or a
+    # subreaper) at once, while `kill 0` would still find it until whoever started it reaps it.
+    my $parent = getppid();
+    my $caller_alive = sub { getppid() == $parent };
+    open(my $out, ">", $fifo) or exit 1;
+    $out->autoflush(1);
+    my $holder = sub { open(my $h, "<", "$file.holder") or return "another run"; my $l = <$h>; chomp $l; $l };
+    my $lock;
+    open($lock, ">>", $file) or do { print $out "error cannot open $file: $!\n"; exit 1 };
+    my $start = time;
+    my $next_note = 0;
+    until (flock($lock, LOCK_EX | LOCK_NB)) {
+      exit 0 unless $caller_alive->();
+      if ($mode eq "try") { print $out "busy " . $holder->() . "\n"; exit 0 }
+      if (time - $start >= $wait_s) { print $out "timeout " . $holder->() . "\n"; exit 0 }
+      if (time >= $next_note) {
+        my $m = int((time - $start) / 60);
+        my $so_far = $m ? " (still, $m min so far)" : "";
+        print STDERR "[machine-lock] ⏳ $who is waiting for $label$so_far: in use by " . $holder->() . "\n";
+        $next_note = time + 60;
+      }
+      sleep 1;
+    }
+    $SIG{TERM} = $SIG{INT} = $SIG{HUP} = sub { unlink "$file.holder"; exit 0 };
+    if (open(my $h, ">", "$file.holder")) {
+      print $h "$who — $checkout (pid $owner, since " . strftime("%H:%M:%S", localtime) . ")\n";
+      close $h;
+    }
+    print $out "ok\n";
+    close $out;
+    sleep 1 while $caller_alive->();
+    unlink "$file.holder";
+  ' "$_lsl_file" "$$" "$_lsl_who" "$_lsl_checkout" "$_lsl_fifo" "${LOCAL_STACK_LOCK_WAIT_S:-3600}" "$_lsl_mode" "$_lsl_label" </dev/null >/dev/null &
+  _lsl_pid=$!
+  # The fifo is opened read-write, so the read never blocks on a holder that died before it
+  # answered (a failed fork under load, a killed perl): the loop stops once it is gone.
+  _lsl_reply="$(
+    exec 3<>"$_lsl_fifo"
+    while :; do
+      if IFS= read -r -t 1 _lsl_line <&3; then
+        printf '%s' "$_lsl_line"
+        break
+      fi
+      if ! kill -0 "$_lsl_pid" 2>/dev/null; then
+        # The holder may have answered and exited between the read timing out and this check.
+        if IFS= read -r -t 1 _lsl_line <&3; then printf '%s' "$_lsl_line"; fi
+        break
+      fi
+    done
+  )" || true
+  rm -f "$_lsl_fifo"
+
+  case "$_lsl_reply" in
+    ok)
+      printf -v "$_lsl_pid_var" '%s' "$_lsl_pid"
+      printf -v "$_lsl_owner_var" '%s' "$$"
+      export "$_lsl_owner_var"
+      return 0
+      ;;
+    busy\ *)
+      _LOCAL_STACK_LOCK_EXIT=75
+      echo "[machine-lock] $_lsl_label is in use by ${_lsl_reply#busy }" >&2
+      ;;
+    timeout\ *)
+      _LOCAL_STACK_LOCK_EXIT=75
+      echo "[machine-lock] ❌ $_lsl_who gave up after ${LOCAL_STACK_LOCK_WAIT_S:-3600}s waiting for $_lsl_label, in use by ${_lsl_reply#timeout }" >&2
+      echo "[machine-lock]    Let that run finish, or stop it. LOCAL_STACK_LOCK_WAIT_S sets how long to wait." >&2
+      ;;
+    "")
+      echo "[machine-lock] ❌ could not take the lock for $_lsl_label: the perl process holding it stopped before it answered" >&2
+      ;;
+    *)
+      echo "[machine-lock] ❌ could not take the lock for $_lsl_label: ${_lsl_reply#error }" >&2
+      ;;
+  esac
+  wait "$_lsl_pid" 2>/dev/null || true
+  return 1
+}
+
+take_local_stack_lock() { _local_stack_lock wait "$1" "${2:-}"; }
+try_local_stack_lock() { _local_stack_lock try "$1" "${2:-}"; }
+
+release_local_stack_lock() {
+  local _lsl_pid_var _lsl_owner_var _lsl_release_pid
+  _local_stack_lock_vars "${1:-}"
+  _lsl_release_pid="${!_lsl_pid_var:-}"
+  [ -n "$_lsl_release_pid" ] || return 0
+  kill "$_lsl_release_pid" 2>/dev/null || true
+  wait "$_lsl_release_pid" 2>/dev/null || true
+  printf -v "$_lsl_pid_var" '%s' ""
+  unset "$_lsl_owner_var"
+  return 0
+}
+
+if [ "${BASH_SOURCE[0]}" = "$0" ]; then
+  _lsl_run_usage() {
+    echo 'usage: bash scripts/ci/bkit-machine-lock.sh run ["<who>"] [--lock <name>] -- <command> [args…]' >&2
+    exit 2
+  }
+  [ "${1:-}" = run ] || _lsl_run_usage
+  shift
+  _lsl_run_who="${LOCAL_STACK_LOCK_WHO:-${npm_lifecycle_event:-run}}"
+  _lsl_run_name=""
+  case "${1:-}" in
+    --lock|--) ;;
+    "") _lsl_run_usage ;;
+    *) _lsl_run_who="$1"; shift ;;
+  esac
+  if [ "${1:-}" = --lock ]; then
+    [ -n "${2:-}" ] && [ "$2" != -- ] || _lsl_run_usage
+    _lsl_run_name="$2"
+    shift 2
+  fi
+  [ "${1:-}" = -- ] || _lsl_run_usage
+  shift
+  [ "$#" -gt 0 ] || _lsl_run_usage
+  take_local_stack_lock "$_lsl_run_who" "$_lsl_run_name" || exit "$_LOCAL_STACK_LOCK_EXIT"
+  "$@"
+  _lsl_run_status=$?
+  release_local_stack_lock "$_lsl_run_name"
+  exit "$_lsl_run_status"
+fi
diff --git a/skills-lock.json b/skills-lock.json
index cff06f0ee..f4f8457ad 100644
--- a/skills-lock.json
+++ b/skills-lock.json
@@ -1,11 +1,35 @@
 {
   "version": 1,
   "skills": {
+    "bash-defensive-patterns": {
+      "source": "wshobson/agents",
+      "sourceType": "github",
+      "skillPath": "plugins/shell-scripting/skills/bash-defensive-patterns/SKILL.md",
+      "computedHash": "991522cad769b74711aea3fe3330e032bd63bc27b754ee26205207c0e056d4e6"
+    },
     "find-skills": {
       "source": "vercel-labs/skills",
       "sourceType": "github",
       "skillPath": "skills/find-skills/SKILL.md",
       "computedHash": "9e1c8b3103f92fa8092568a44fe64858de7c5c9dc65ce4bea8f168080e889cfd"
+    },
+    "perl-patterns": {
+      "source": "affaan-m/ecc",
+      "sourceType": "github",
+      "skillPath": "skills/perl-patterns/SKILL.md",
+      "computedHash": "f7bcd324ffed5ab7369e82dec6219096e1c12d0f1475d5b7559a87e6e546ae1d"
+    },
+    "typescript-pro": {
+      "source": "jeffallan/claude-skills",
+      "sourceType": "github",
+      "skillPath": "skills/typescript-pro/SKILL.md",
+      "computedHash": "6751e2000c6359db46852d754d4bc246061ac05229e8a9b95a5ec0667a053834"
+    },
+    "vitest": {
+      "source": "antfu/skills",
+      "sourceType": "github",
+      "skillPath": "skills/vitest/SKILL.md",
+      "computedHash": "90f1cee9326269c91b46a601b3a575491505d8e771009dacff01329381d45291"
     }
   }
 }
diff --git a/.bkit/templates/scripts/ci/bkit-local-stack-lock.sh b/tests/fixtures/machine-lock/stack-lock-6.0.0.sh
old mode 100755
new mode 100644
similarity index 97%
rename from .bkit/templates/scripts/ci/bkit-local-stack-lock.sh
rename to tests/fixtures/machine-lock/stack-lock-6.0.0.sh
index fc8109764..ee750f6bf
--- a/.bkit/templates/scripts/ci/bkit-local-stack-lock.sh
+++ b/tests/fixtures/machine-lock/stack-lock-6.0.0.sh
@@ -140,11 +140,7 @@ _local_stack_lock() {
         printf '%s' "$_lsl_line"
         break
       fi
-      if ! kill -0 "$_lsl_pid" 2>/dev/null; then
-        # The holder may have answered and exited between the read timing out and this check.
-        if IFS= read -r -t 1 _lsl_line <&3; then printf '%s' "$_lsl_line"; fi
-        break
-      fi
+      kill -0 "$_lsl_pid" 2>/dev/null || break
     done
   )" || true
   rm -f "$_lsl_fifo"
