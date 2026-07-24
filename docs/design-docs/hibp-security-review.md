# HIBP Pwned Passwords Security Review

Status: approved for the `hibp` tool only.

## Decision

Allow one cross-origin endpoint:

`GET https://api.pwnedpasswords.com/range/{first-five-SHA1-characters}`

The exception is limited to the Pwned Passwords range API. No other HIBP API,
host, path shape, method, or user-supplied URL is permitted.

## Data flow

1. The user enters a password and explicitly activates the check.
2. The browser hashes its UTF-8 bytes with SHA-1 locally.
3. Only the first five uppercase hexadecimal characters are placed in the URL.
4. The request sends `Add-Padding: true`, omits credentials and referrer, bypasses
   caches, and is abortable.
5. The response is parsed in memory. Only the exact remaining 35-character
   suffix is compared. Zero-count padding and unrelated suffixes are immediately
   discarded and never cached or persisted.

The cleartext password and full SHA-1 hash never enter a request, log, URL,
storage API, analytics system, or error message.

## Threats and mitigations

- **Password disclosure:** only a 20-bit prefix leaves the browser; the suffix
  comparison remains local.
- **Response-size observation:** padded responses are requested.
- **Incremental inference:** there is no request on input/change/blur; only an
  explicit button activation checks the complete password.
- **Credential/referrer leakage:** Fetch uses `credentials: "omit"` and
  `referrerPolicy: "no-referrer"`.
- **Stale/cross-user results:** Fetch uses `cache: "no-store"`; no Service Worker,
  application cache, or browser storage receives the response.
- **Unbounded/replayed traffic:** one request is issued per explicit activation;
  there are no retries, background polling, or batch checks.
- **Availability/rate limits:** abort, offline, 429, and 5xx states are presented
  as errors without weakening privacy or falling back to another service.
- **Misleading platform claims:** the tool catalog, route badge, group badge, and
  sidebar request count disclose the exception. Other tools remain local-only.

## CSP decision

Add `https://api.pwnedpasswords.com` to `connect-src`. Keep every other directive
unchanged. Runtime code also uses a constant URL origin so CSP is a second layer,
not the sole allowlist.

## Verification

- Unit-test prefix derivation and response matching.
- Component-test the exact request URL/options, explicit activation, abort, and
  secret clearing.
- In a real browser, confirm exactly one outbound range request, no password or
  full hash in request data, and no HIBP request from other routes.
- Re-review if HIBP changes its endpoint, response format, privacy model, terms,
  or padding behavior.

