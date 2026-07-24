# Reliability

## Failure model

There is no application backend. Primary risks are browser capability differences, memory pressure from large photo sets, corrupt/unsupported files, stale offline assets, and deployment configuration.

## Controls

- Feature-detect directory picking and fall back to file input.
- Create object URLs on demand and revoke them.
- Virtualize large collections.
- Bound concurrent preview decoding and cached preview bytes.
- Cache only same-origin GET responses.
- Version service-worker caches and delete older versions on activation.
- Serve immutable hashed assets while serving `sw.js` with `no-cache`.

## Verification

Run:

```sh
npm run check
```

Before public launch, add browser automation for install/offline reload, direct navigation to every registry path, and a 5,000-file synthetic Photo Cure session.
