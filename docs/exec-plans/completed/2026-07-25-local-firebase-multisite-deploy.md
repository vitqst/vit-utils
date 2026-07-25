# Local Firebase multi-site deployment

## Goal

Allow each contributor to deploy the static app from their local machine to a
Hosting site they select, without committing a Firebase project ID or site ID.

## Work

1. Add a test for the shared Hosting target and local deploy command.
2. Replace the hard-coded Hosting site with a reusable target.
3. Ignore Firebase's local state and document one-time project/site setup.
4. Run the repository checks and move this plan to `completed/`.

## Verification

- `npm test -- src/security-policy.test.ts` — 2 tests passed.
- `npm run check` — 86 test files and 354 tests passed; typecheck and
  production build completed successfully.
- `git diff --check` — passed.
