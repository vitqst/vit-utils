# vit.tools

[![CI](https://github.com/vitqst/Photo-picker-offline/actions/workflows/ci.yml/badge.svg)](https://github.com/vitqst/Photo-picker-offline/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Private-first, single-purpose browser tools for files, text, media, developer
workflows, and everyday tasks.

`vit.tools` is a static React application. Tools load only when opened, and
files and derived results stay in the browser. It has no application server,
database, analytics, advertising, or remote fonts.

## Highlights

- A catalog of focused tools for images, PDFs, data, text, generators, and
  developer workflows
- Browser-local processing with Web Workers for CPU-heavy transforms
- English and Vietnamese interfaces
- Keyboard-accessible, semantic controls
- Installable PWA behavior and offline support for previously opened tools
- Static per-tool pages and sitemap metadata generated from one typed registry

## Privacy model

The browser is the product boundary. User-selected files and derived results
remain in browser memory unless the user explicitly downloads them.

The only reviewed network exception is the Pwned Passwords integration. It
sends a five-character SHA-1 prefix to the Have I Been Pwned API and never sends
the source password or full hash. See the [security policy](docs/SECURITY.md)
and [HIBP security review](docs/design-docs/hibp-security-review.md).

Do not submit sensitive files, filenames, passwords, tokens, or personal data
in public issues.

## Getting started

Requirements:

- Node.js 22.12 or newer (Node.js 20.19 is also supported)
- npm

```sh
git clone https://github.com/vitqst/Photo-picker-offline.git
cd Photo-picker-offline
npm install
npm run dev
```

The development server prints the local URL. Production output is written to
`dist/`.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm test` | Run the Vitest suite once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run typecheck` | Run TypeScript project checks |
| `npm run build` | Create the production build |
| `npm run preview` | Preview the production build |
| `npm run check` | Run tests, typecheck, and build |
| `npm run deploy` | Verify and deploy the selected Firebase Hosting site |

## Deploy from your local machine

Install the Firebase CLI and authenticate once:

```sh
npm install --global firebase-tools
firebase login
```

Then select your Firebase project and map this repository's shared `app`
target to one Hosting site in that project:

```sh
firebase use --add
firebase target:apply hosting app YOUR_HOSTING_SITE_ID
npm run deploy
```

Use the Hosting **site ID**, not its domain name. You can list the projects
available to your account with `firebase projects:list` and the sites in the
selected project with `firebase hosting:sites:list`.

The commands create a local `.firebaserc` containing your project and site
mapping. That file is ignored by Git, so every contributor can deploy to their
own Firebase project and site without changing `firebase.json`. To switch to a
different site, run `firebase target:apply hosting app NEW_SITE_ID` again.

## Architecture

- `src/app/` contains the shared application shell.
- `src/registry/tool-catalog.ts` is the source of truth for discovery,
  navigation, static pages, and the sitemap.
- `src/tools/<id>/` contains lazy-loaded tool modules and their tests.
- `src/i18n/` contains shared English and Vietnamese shell copy.
- `public/` contains same-origin PWA assets.
- `docs/` contains product specs, design decisions, and execution plans.

Read [ARCHITECTURE.md](ARCHITECTURE.md) and the
[core beliefs](docs/design-docs/core-beliefs.md) before changing system
boundaries.

## Contributing

Issues and pull requests are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md)
and follow the [Code of Conduct](CODE_OF_CONDUCT.md). Report vulnerabilities
through the private process in [docs/SECURITY.md](docs/SECURITY.md), not a
public issue.

Maintainers preparing the public repository should also complete the
[open-source launch checklist](docs/OPEN_SOURCE_CHECKLIST.md).

## Development collaboration

The project is maintained by `vitqst` and developed with OpenAI Codex as an AI
coding collaborator. AI-assisted changes are reviewed and verified by the
maintainer. This acknowledgement does not imply sponsorship or endorsement by
OpenAI. See [AUTHORS.md](AUTHORS.md).

## License

Released under the [MIT License](LICENSE).
