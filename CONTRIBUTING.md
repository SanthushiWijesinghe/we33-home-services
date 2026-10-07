# Contributing to HomeServices WE_33

This workspace currently has no Git repository. Initialize and push the common foundation before member feature work. A member's contribution is shown by their own implementation, commits, tests, pull request review and viva explanation; do not fabricate history or rewrite authorship.

## Branches

Central branches: `main` for stable releases, `develop` for integration. Member branches: `feature/m1-auth-admin`, `feature/m2-customer-profile`, `feature/m3-services-availability` (**proposed scope pending team confirmation**), and `feature/m4-bookings-reviews`.

## Workflow

1. Create the central GitHub repository and push this shared foundation.
2. Each member forks and clones their own fork.
3. Create the assigned feature branch from `develop`, implement only owned features and commit work incrementally.
4. Push to the member's GitHub account and open a pull request to central `develop` using `.github/pull_request_template.md`.
5. Review code, tests, prototype deviations and traceability. Resolve conflicts with the feature owners.
6. Run integration checks on `develop`. Merge a stable release to `main`.

Do not commit `.env`, keys, credentials, `node_modules`, Android build outputs or debug keystores. Use `.env.example`. Keep business rules in services, add server authorization and ownership checks, and record actual test evidence. Coordinate extraction of the existing shared `Pages.jsx`, `Dialogs.jsx` and `App.jsx` so ownership boundaries do not create merge conflicts.

## Starting commands

```sh
git init
git branch -M main
git add .
git commit -m "chore: establish HomeServices shared foundation"
git remote add origin <central-repository-url>
git push -u origin main
git switch -c develop
git push -u origin develop
```

The group should run these commands under its own accounts. The commands are instructions only; this assistant has not created contribution commits.
