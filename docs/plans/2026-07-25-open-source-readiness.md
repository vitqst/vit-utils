# Open-source Readiness Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add the legal, project, contributor, and GitHub automation files needed for a clear public release.

**Architecture:** Keep project identity and policies at the repository root, platform automation under `.github/`, and detailed technical material under `docs/`. Link to existing sources of truth instead of duplicating architecture or security rules.

**Tech Stack:** Markdown, JSON, YAML, GitHub Actions, npm, Vite, Vitest, TypeScript

---

### Task 1: Project identity and license

**Files:**
- Create: `README.md`
- Create: `LICENSE`
- Create: `AUTHORS.md`
- Modify: `package.json`

**Steps:**
1. Write a README covering purpose, privacy boundaries, features, setup,
   scripts, architecture, contribution links, AI collaboration, and license.
2. Add the standard MIT license with `Copyright (c) 2026 vitqst`.
3. Add authorship that distinguishes the human maintainer from AI assistance.
4. Add description, license, repository, bugs, and author metadata to
   `package.json`, retaining `"private": true`.
5. Run `npm install --package-lock-only` and verify `npm pkg get`.

### Task 2: Contribution and community policies

**Files:**
- Create: `CONTRIBUTING.md`
- Create: `CODE_OF_CONDUCT.md`
- Modify: `docs/SECURITY.md`

**Steps:**
1. Document setup, test-first workflow, architecture invariants, bilingual and
   accessibility requirements, pull request expectations, and AI disclosure.
2. Add concise standards for respectful participation and enforcement.
3. Add private vulnerability reporting guidance while preserving the
   repository's data-handling warnings.
4. Check all relative Markdown links.

### Task 3: GitHub contributor workflows

**Files:**
- Create: `.github/ISSUE_TEMPLATE/bug_report.yml`
- Create: `.github/ISSUE_TEMPLATE/feature_request.yml`
- Create: `.github/ISSUE_TEMPLATE/config.yml`
- Create: `.github/pull_request_template.md`
- Create: `.github/workflows/ci.yml`
- Create: `.github/dependabot.yml`
- Create: `docs/OPEN_SOURCE_CHECKLIST.md`

**Steps:**
1. Add structured issue forms that request useful, non-sensitive reports.
2. Add a pull request checklist matching the repository's required workflow.
3. Add CI for install, tests, typecheck, and build through `npm run check`.
4. Add weekly npm dependency update checks.
5. Add a maintainer checklist for repository, branch, security, and release
   settings that cannot be stored in Git.
6. Parse all YAML files with the repository's `yaml` dependency.

### Task 4: Verification and handoff

**Files:**
- Create: `docs/exec-plans/active/open-source-readiness.md`
- Move after verification to:
  `docs/exec-plans/completed/2026-07-25-open-source-readiness.md`

**Steps:**
1. Record the multi-file execution work.
2. Run Markdown link and metadata validation.
3. Run `npm run check`.
4. Inspect `git diff --check` and the complete diff.
5. Move the execution plan to completed after all checks pass.
