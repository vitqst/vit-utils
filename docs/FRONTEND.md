# Frontend

## Stack

- React 19
- Vite 7
- TypeScript and SWC
- Tailwind CSS 4
- Headless UI for accessible composite interactions
- Radix UI primitives for small interaction details
- Vitest and Testing Library

## Tool contract

Every registry item has:

```ts
{
  id,
  group,
  name: { en, vi },
  description: { en, vi },
  keywords: { en, vi },
  icon,
  path,
  privacy: "local-only",
  status: "ready",
  load: () => import("...")
}
```

The shell uses only this contract. A tool exports a default React component and owns its internal state, workers, and tests.

## Routing

The current router is deliberately tiny: stable registry paths use the History API and Firebase clean URLs. Do not introduce a routing dependency until nested routes, loaders, or route-level error boundaries justify it.

## State

- Tool state stays inside its tool module.
- Locale, favorites, and recents use namespaced `localStorage` keys.
- Do not persist file contents or object URLs.

## Testing

- Test user behavior, not component implementation.
- Registry tests enforce unique ids/paths and required metadata.
- Tool tests cover performance boundaries such as virtualization and decode concurrency.
- Run `npm run check` before moving an execution plan to completed.
