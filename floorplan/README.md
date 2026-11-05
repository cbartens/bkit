# Repository floorplan

This directory contains the repository's interactive architecture map, generated with [Floorplan 0.6.3](https://github.com/haydenschmitty/floorplan). The owner has chosen to version the map despite the plugin's default local-only policy.

Open `index.html` directly for offline browsing. From the repository root, run `node floorplan/serve.mjs` for the local viewer and its Ask bar. The Ask bar uses the developer's own Codex or Claude sign-in.

## Files

<!-- prettier-ignore -->
| Files | Purpose |
| - | - |
| `architecture.json` | Editable system boundaries, guided flows, tour and annotations. |
| `descriptions/*.json` | Editable names and descriptions for individual files and requests. |
| `graph.json`, `index.html` | Generated map snapshot and self-contained viewer. |
| `query.mjs`, `serve.mjs` | Generated query helper and local viewer server. |
| `recent-work.json` | Highlights for the latest mapped work. |
| `licenses/` | Upstream notices for Floorplan and the viewer's bundled libraries and fonts. |

## Refreshing and committing

Ask Codex to “update the floorplan” with the Floorplan plugin enabled. Review the regenerated map before committing it. The snapshot records the source revision and the generating checkout's path; refresh it in a new checkout before using editor links.

The plugin rewrites `.gitignore` to ignore this entire directory on every build. Git continues tracking files already committed, so its warning about tracked map files is expected here. Keep them tracked. Explicitly force-add new description files when a refresh creates them.

For a complete map update, use these scoped paths:

```sh
git add -f -- floorplan/.gitignore floorplan/README.md floorplan/architecture.json floorplan/descriptions floorplan/graph.json floorplan/index.html floorplan/query.mjs floorplan/serve.mjs floorplan/recent-work.json floorplan/licenses
```

Keep `.cache/`, logs, server tokens and process state untracked. Do not force-add the whole directory. Generated viewer files retain the plugin's formatting because its export reader depends on an exact embedded-data marker.

The Health panel is an automatic check, not a security audit. This snapshot flags large source files as a maintainability concern.
