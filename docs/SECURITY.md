# Security

## Data classification

- **User content:** files selected for a tool. Never persisted or transmitted by the platform.
- **Derived content:** previews and tool results. Keep in memory unless the user explicitly downloads a result.
- **Preferences:** locale, favorite ids, and recent ids. May use `localStorage`.

## Browser policy

Firebase sends a Content Security Policy that permits same-origin scripts, styles, connections, workers, and blob/data images required by local file tools. It blocks framing, plugins, remote fonts, and cross-origin connections.

## Dependency policy

- Keep production dependencies small and justified.
- Review `npm audit` findings for reachability rather than applying forced upgrades blindly.
- Do not add telemetry SDKs.
- Tools that intentionally call a remote service need a visible disclosure, minimized request data, and a dedicated CSP decision.

## Reporting

Do not include user files, filenames, tokens, or personal data in an issue. Describe the browser, route, reproduction steps, and observed network request instead.
