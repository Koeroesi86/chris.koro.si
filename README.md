# chris.koro.si

Source of [chris.koro.si](https://chris.koro.si), the personal site of Krisztián Kőrösi: a single React page with a drifting logo canvas over a background image, link buttons and a collapsible contact panel.

The original source was lost and recreated from the deployed webpack bundle and its CSS sourcemap. It is now a Vite + TypeScript project.

## Stack

- React 17, TypeScript (strict), Vite
- SCSS modules (`index.module.scss` next to each component)
- Font Awesome (React) for the icons
- Served on the VPS by [`@koeroesi86/node-webserver-cli`](https://www.npmjs.com/package/@koeroesi86/node-webserver-cli)

## Getting started

Needs Node 24 (see `.nvmrc`).

```sh
npm ci
npm run dev        # Vite dev server with hot reload
npm run build      # type check, bundle to dist/, then prerender dist/index.html
npm run serve      # serve dist/ on http://localhost:8080 the way the VPS does
npm start          # build, then serve
```

## Project layout

```
src/
  index.tsx                    browser entry: hydrates the prerendered page (renders from scratch in dev)
  entry-server.tsx             build-time entry: page markup, meta tags and JSON-LD
  site.ts                      site data (name, links, contacts, logos)
  components/app/              page layout and contact panel
  components/background/       canvas animation (bouncing logos) and background image
  clients/default/index.scss   global styles (reset, body, fonts)
  assets/                      fonts, images, and the 28 logo SVGs (assets/images/logos)
  unregister-service-worker.ts removes service workers from earlier versions
scripts/prerender.mjs          writes the server-rendered markup into dist/index.html
public/                        favicons and manifest.json, copied as-is
index.html                     Vite entry page (head tags, analytics)
serverConfig.js                node-webserver server definition used on the VPS (root: build)
nws.config.cjs                 local node-webserver config that serves dist/
```

## Deployment

Merging to `main` deploys automatically (`.github/workflows/deploy.yml`):

1. `build`: `npm ci --ignore-scripts` and `npm run build`, then uploads `dist` as an artifact.
2. `deploy`: ships that exact artifact with [`Koeroesi86/deploy-action`](https://github.com/Koeroesi86/deploy-action) over SSH. It creates `build.<timestamp>` next to `serverConfig.js` on the server, verifies checksums, switches the `build` symlink atomically and keeps the last five releases. After the switch it checks `https://chris.koro.si` and rolls back to the previous release if that fails.

The deploy job runs in the `production` environment, which only accepts the `main` branch. It needs these settings there:

| Kind | Name |
| --- | --- |
| Variable | `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_PATH` |
| Secret | `DEPLOY_SSH_KEY`, `DEPLOY_KNOWN_HOSTS` |

Releases are in `<DEPLOY_PATH>/build.<timestamp>`, the history is in `<DEPLOY_PATH>/.deploy-log`. To roll back by hand, point the `build` symlink at an earlier release (the deploy action also ships a `rollback` sub-action you can wire into a manual workflow).

## Contributing and checks

`main` is protected: changes go through a pull request, and the single required check is **CI gate** (`.github/workflows/ci.yml`). It passes only when all of these pass:

- type check and build
- CodeQL for JavaScript/TypeScript and for the GitHub Actions workflows
- `npm audit` (high severity) and `npm audit signatures`
- dependency review of the PR
- [zizmor](https://github.com/zizmorcore/zizmor) security lint of the workflows

The workflow also runs weekly. Dependabot opens weekly updates for npm and for the pinned actions, with a 7 day cooldown. All actions are pinned to commit SHAs.

Found a security problem? Use the repository's private vulnerability reporting (Security tab).
