# Open-source readiness design

## Purpose

Prepare `vit.tools` for a public GitHub repository with enough context for
people to understand, run, evaluate, and contribute to the project.

## Structure

Root-level files provide the project overview, MIT license, contributor
guidance, conduct expectations, and authorship. GitHub-specific templates and
automation live under `.github/`. Existing architecture, product, and security
documents remain the detailed source of truth and are linked rather than
duplicated.

The README describes the browser-local architecture accurately, including the
reviewed HIBP network exception. The package remains `"private": true` because
the repository is an application, not an npm package, while package metadata
declares the MIT license and repository.

## Collaboration attribution

`vitqst` remains the maintainer and MIT copyright holder. OpenAI Codex is
credited as an AI coding collaborator in `README.md` and `AUTHORS.md`.
Contributors may disclose AI assistance with an `Assisted-by:` commit trailer.
The wording explicitly avoids implying OpenAI sponsorship, endorsement,
maintainership, or copyright ownership.

## Community and automation

The repository will include bug and feature issue forms, a pull request
template, a concise code of conduct, contributor instructions, weekly
Dependabot configuration, and a CI workflow running the existing `npm run
check` gate. The existing security policy will be expanded with a private
reporting path and linked from the README.

