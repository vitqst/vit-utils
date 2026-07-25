# Security

## Reporting a vulnerability

Use
[GitHub private vulnerability reporting](https://github.com/vitqst/Photo-picker-offline/security/advisories/new)
to report a suspected vulnerability. Do not open a public issue before a fix is
available.

Include the affected route, impact, reproduction steps, and browser version.
Use synthetic data only. Do not submit user files, filenames, passwords,
tokens, personal data, or production secrets.

The maintainer will acknowledge a report when practical, investigate it, and
coordinate disclosure after a fix is available. No fixed response or resolution
timeline is promised for this volunteer-maintained project.

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

For non-sensitive security questions, describe the browser, route, reproduction
steps, and observed network request in an issue. Never include user files,
filenames, passwords, tokens, or personal data.
