# Open-source readiness

Status: completed 2026-07-25.

## Goal

Prepare `vit.tools` for a public GitHub release with an MIT license, clear
project documentation, contribution policies, community templates, and
automated verification.

## Work

- Add root project, license, authorship, contribution, and conduct files.
- Credit OpenAI Codex transparently as an AI coding collaborator.
- Expand the existing security reporting guidance.
- Add GitHub issue/PR templates, CI, and dependency update configuration.
- Add a maintainer checklist for GitHub settings that cannot be configured in
  source control.
- Add accurate npm package metadata while preventing accidental publication.

## Verification

- Validate JSON, YAML, and repository-local Markdown links.
- Run `npm run check`.
- Run `git diff --check`.
