# Agent Guide

This repository is `vit.tools`, a collection of private, single-purpose browser tools.

## Start here

1. Read `ARCHITECTURE.md`.
2. Read the relevant file under `docs/product-specs/`.
3. Check `docs/exec-plans/active/` and `docs/exec-plans/tech-debt-tracker.md`.
4. Preserve the invariants in `docs/design-docs/core-beliefs.md`.

## Required workflow

- Add or change behavior test-first.
- Keep tool metadata in `src/registry/tool-catalog.ts`; navigation, search, static pages, and the sitemap derive from it.
- Lazy-load every tool. Do not import tool implementations into the application shell.
- Keep user files and derived data in the browser. A network exception requires a product-spec and security review.
- Put CPU-heavy transforms in a Web Worker and keep a cancellation path.
- Add English and Vietnamese copy together.
- Use semantic controls and keyboard-accessible interactions.
- Record multi-file work in `docs/exec-plans/active/`; move the plan to `completed/` after verification.
- Never edit `docs/generated/` by hand unless the file explicitly says it is a placeholder.

## Commands

```sh
npm run dev
npm test
npm run typecheck
npm run build
npm run check
```

Production output is `dist/`. Firebase Hosting configuration lives in `firebase.json`.
