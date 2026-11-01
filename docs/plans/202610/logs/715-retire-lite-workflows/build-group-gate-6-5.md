
> @cbartens/bkit@6.0.0 bkit:gate:static-unit /Users/christian/Documents/GitHub/bkit/.worktrees/715-retire-lite-workflows
> pnpm bkit:gate:static && pnpm test:coverage:unit && pnpm bkit:test:bats


> @cbartens/bkit@6.0.0 bkit:gate:static /Users/christian/Documents/GitHub/bkit/.worktrees/715-retire-lite-workflows
> pnpm typecheck && pnpm lint && pnpm format:check && pnpm format:tables:check && pnpm lint:prose && pnpm slop:delta


> @cbartens/bkit@6.0.0 typecheck /Users/christian/Documents/GitHub/bkit/.worktrees/715-retire-lite-workflows
> tsc --noEmit && pnpm bkit:typecheck:tests


> @cbartens/bkit@6.0.0 bkit:typecheck:tests /Users/christian/Documents/GitHub/bkit/.worktrees/715-retire-lite-workflows
> tsc -p tsconfig.test.json

.bkit/core/engine/commands/analysis.test.ts(566,7): error TS2322: Type '{ schema: typeof SCHEMA | 2; ts: number; firstTs?: number; updates?: number; kind: TelemetryKind; key?: string; repo: string; bkit: BkitBlock; references?: string[]; ... 12 more ...; by: { ...; }; }' is not assignable to type 'TelemetryEvent'.
  Type '{ schema: typeof SCHEMA | 2; ts: number; firstTs?: number; updates?: number; kind: TelemetryKind; key?: string; repo: string; bkit: BkitBlock; references?: string[]; ... 12 more ...; by: { ...; }; }' is not assignable to type 'TelemetryEnvelope & { kind: "run"; } & RunPayload'.
    Type '{ schema: typeof SCHEMA | 2; ts: number; firstTs?: number; updates?: number; kind: TelemetryKind; key?: string; repo: string; bkit: BkitBlock; references?: string[]; ... 12 more ...; by: { ...; }; }' is not assignable to type '{ kind: "run"; }'.
      Types of property 'kind' are incompatible.
        Type 'TelemetryKind' is not assignable to type '"run"'.
          Type '"chat"' is not assignable to type '"run"'.
 ELIFECYCLE  Command failed with exit code 1.
 ELIFECYCLE  Command failed with exit code 1.
 ELIFECYCLE  Command failed with exit code 1.
 ELIFECYCLE  Command failed with exit code 1.
