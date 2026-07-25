# Contributing

Thank you for helping improve `vit.tools`.

## Before starting

1. Search existing issues and pull requests.
2. Open an issue before large features or architecture changes.
3. Never attach private files, passwords, tokens, filenames, or personal data.
4. Read [ARCHITECTURE.md](ARCHITECTURE.md), the relevant
   [product specification](docs/product-specs/index.md), and the
   [core beliefs](docs/design-docs/core-beliefs.md).

Security vulnerabilities must follow the
[private reporting process](docs/SECURITY.md).

## Local setup

```sh
npm install
npm run dev
```

Before opening a pull request:

```sh
npm run check
```

## Development requirements

- Add or change behavior test-first.
- Keep tool metadata in `src/registry/tool-catalog.ts`.
- Lazy-load every tool; do not import tool implementations into the shell.
- Keep user files and derived data in the browser unless a reviewed product
  and security design explicitly permits a network request.
- Put CPU-heavy transforms in a Web Worker and retain cancellation.
- Add English and Vietnamese copy together.
- Use semantic controls and keyboard-accessible interactions.
- Record multi-file work under `docs/exec-plans/active/` and move the plan to
  `completed/` after verification.
- Do not edit `docs/generated/` unless a file explicitly says it is a
  placeholder.

## Pull requests

Keep each pull request focused. Explain the user-visible outcome, privacy or
security impact, and verification performed. Include screenshots for visual
changes and update the relevant product spec when behavior changes.

Use concise Conventional Commit messages when practical:

```text
feat(ids): add UUID v7 generation
fix(pdf): preserve page rotation
docs: clarify local setup
```

## AI-assisted contributions

AI assistance is welcome when the contributor reviews and takes responsibility
for the result. Disclose substantial assistance in the pull request. Commits
may identify the tool with a trailer:

```text
Assisted-by: OpenAI Codex
```

Do not list an AI tool as a copyright holder or human co-author.

By contributing, you agree that your contribution is licensed under the
[MIT License](LICENSE).

