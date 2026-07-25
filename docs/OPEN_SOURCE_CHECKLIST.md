# Open-source launch checklist

These settings are not stored in the repository and must be reviewed on GitHub
before or immediately after making the repository public.

## Repository

- [ ] Confirm the default branch is `main`.
- [ ] Add the project description, website when canonical, topics, and social
      preview under repository settings.
- [ ] Enable Issues and keep the issue forms in `.github/ISSUE_TEMPLATE/`.
- [ ] Confirm GitHub detects the MIT license and completes the community
      profile.

## Branch protection

- [ ] Protect `main`.
- [ ] Require pull requests and the `CI / check` status check.
- [ ] Require branches to be current before merging.
- [ ] Prevent force pushes and branch deletion.

## Security

- [ ] Enable private vulnerability reporting before sharing the security
      reporting link.
- [ ] Enable Dependabot alerts and security updates.
- [ ] Enable secret scanning and push protection.
- [ ] Enable code scanning or configure an equivalent static-analysis workflow.
- [ ] Review repository history for secrets and private data before publishing;
      removing a file from the latest commit does not remove it from history.

## Release review

- [ ] Test a fresh clone with `npm ci` and `npm run check`.
- [ ] Confirm the production site contains no private configuration or test
      data.
- [ ] Review dependency licenses for compatibility with the MIT distribution.
- [ ] Confirm screenshots, issue examples, and documentation contain only
      synthetic data.

