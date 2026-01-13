# Repository Guidelines

## Project Structure & Module Organization
- `src/` contains the React app. Key areas include `src/components/` (views and UI), `src/store/` (state and reducers), `src/hooks/`, `src/constants/`, and `src/utils/`.
- `public/` holds static assets; `src/assets/` holds app-specific assets.
- `doc/` contains product and architecture specs; treat these as required reading for design and behavior changes.
- `dist/` is the generated build output, with `index.html` and `vite.config.js` at the root.

## Build, Test, and Development Commands
- `npm install` installs dependencies.
- `npm run dev` starts the Vite dev server.
- `npm run build` creates a production bundle in `dist/`.
- `npm run preview` serves the built output locally.
- `npm run lint` runs ESLint across the project.

## Coding Style & Naming Conventions
- React 19 + Vite, ES modules, JSX in `.jsx` files.
- Match existing formatting: 2-space indentation, single quotes, and semicolons.
- Components use `PascalCase.jsx` (e.g., `MacroView.jsx`); hooks use `use*` naming (e.g., `usePersistence.js`).
- Prefer the `@/` import alias for `src` paths (e.g., `@/components/views/MicroView`).
- Linting uses `eslint.config.js` with React Hooks and React Refresh plugins.

## Testing Guidelines
- No automated test runner or coverage target is configured yet.
- If you add tests, use explicit names like `*.test.jsx` and add the corresponding `npm run test` script.

## Commit & Pull Request Guidelines
- Commit messages follow Conventional Commits (e.g., `feat:`, `fix:`, `docs:`).
- PRs should include a concise summary, link relevant issues, and add screenshots/gifs for UI changes.
- If you introduce new interaction patterns or architecture decisions, update the relevant `doc/` specs and reference them in the PR description.
