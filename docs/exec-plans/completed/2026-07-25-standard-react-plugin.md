# Use Vite's standard React plugin

Status: completed 2026-07-25.

## Goal

Replace `@vitejs/plugin-react-swc` with `@vitejs/plugin-react` now that Vite 8
provides the relevant React transforms and the project uses no SWC plugins.

## Work

- Replace the development dependency and refresh the lockfile.
- Update the Vite configuration import without changing plugin options.
- Confirm the Vite recommendation warning is absent.

## Verification

- `npm audit`
- `npm run check`
- `git diff --check`
