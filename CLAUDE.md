# CLAUDE.md

Personal site (chris.koro.si): React 17 + TypeScript + Vite, SCSS modules, deployed by GitHub Actions to a VPS. See README.md for the overview.

## Commands

- `npm ci` then `npm run dev` / `npm run build` / `npm run serve` / `npm start`.
- `npm run build` runs `tsc --noEmit` first; there is no separate lint or test setup, so a green build is the check. Run it before finishing any change.
- Use Node 24 (`.nvmrc`). Install in CI with `--ignore-scripts`; the build must keep working without install scripts.

## Code conventions

- TypeScript strict; prefer `undefined` over `null`; no `any`, no type casts unless unavoidable.
- Files kebab-case, components/types PascalCase, variables and functions camelCase.
- No nested conditions or loops; chain native array methods; no single-use variables unless they add meaning.
- Styles are SCSS modules (`index.module.scss`); the only global stylesheet is `src/clients/default/index.scss`.
- The icons are passed to `FontAwesomeIcon` as imported objects. Keep `@fortawesome/*` packages on the same major version (6.x), otherwise their types stop matching.

## Things that are easy to break

- `src/components/background`: each logo position is an object with `x`/`y` **getters** that advance the animation on every read. Define them with `Object.defineProperties`; `Object.assign` copies the getter's value once and freezes the logos. `drawImages` must read each of `x` and `y` once per frame.
- Logos are loaded with `import.meta.glob` from `src/assets/images/logos/*.svg` (28 files, order = file name).
- `index.html` uses root-relative paths (`/favicon/...`, `/manifest.json`); the files live in `public/`.
- `serverConfig.js` is CommonJS and read by the web server on the VPS (root: `build`). Do not set `"type": "module"` in `package.json`.
- `nws.config.cjs` is only for local serving of `dist/` (port 8080).
- `build/` and `dist/` are git-ignored build output; never commit them.

## CI and deployment

- `main` is protected: open a PR; the required check is **CI gate** in `.github/workflows/ci.yml`. When adding a CI job, add it to the gate's `needs` list.
- Merging to `main` runs `.github/workflows/deploy.yml` (build, then `Koeroesi86/deploy-action`). It uses the `production` environment variables and secrets; never put hosts, keys or paths in the repo.
- Workflows: top-level `permissions: contents: read`, `persist-credentials: false` on checkout, and every action pinned to a commit SHA with the version in a comment (Dependabot updates them). The repo only allows GitHub's own actions plus `Koeroesi86/deploy-action` and `zizmorcore/zizmor-action`; a new third-party action must be added to the allowlist in the repository settings first.
- zizmor runs on the workflows and fails the gate on findings; fix them rather than suppressing.

## Local-only files

`.claude/settings.local.json` is git-ignored and holds personal permissions; do not commit it.
