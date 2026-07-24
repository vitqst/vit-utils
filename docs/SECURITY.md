# Security

## Data classification

- **User content:** files or text selected for a tool. Never persisted. The HIBP
  tool transmits only a disclosed five-character SHA-1 prefix, never the source
  password or full hash.
- **Derived content:** previews and tool results. Keep in memory unless the user explicitly downloads a result.
- **Preferences:** locale, favorite ids, and recent ids. May use `localStorage`.

## Browser policy

Firebase sends a Content Security Policy that permits same-origin scripts,
styles, workers, and blob/data images required by local tools. Cross-origin
connections are blocked except for the reviewed HIBP Pwned Passwords origin.
Framing, plugins, and remote fonts remain blocked.

## Dependency policy

- Keep production dependencies small and justified.
- Review `npm audit` findings for reachability rather than applying forced upgrades blindly.
- Do not add telemetry SDKs.
- Tools that intentionally call a remote service need a visible disclosure, minimized request data, and a dedicated CSP decision.
- The only approved exception is documented in
  [the HIBP security review](design-docs/hibp-security-review.md).

## Reporting

Do not include user files, filenames, tokens, or personal data in an issue. Describe the browser, route, reproduction steps, and observed network request instead.
