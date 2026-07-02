# Publishing Checklist

Use this before making the repository public.

## Repository

- [x] Create the GitHub repository.
- [x] Set the repository visibility intentionally.
- [x] Add `origin`.
- [x] Push `main` or rename `master` to `main` before pushing.
- [x] Enable GitHub Actions.
- [x] Confirm the Check workflow passes.

## Metadata

- [x] Update `package.json` with the final `repository`, `homepage`, and `bugs` URLs.
- [x] Confirm `README.md` describes the supported platform and setup.
- [x] Confirm `LICENSE`, `THIRD_PARTY_NOTICES.md`, `CONTRIBUTING.md`, `SECURITY.md`, `CHANGELOG.md`, and `ASSETS.md` are present.

## Privacy

- [x] Confirm no private agmsg database, workspace logs, tokens, or account data are tracked.
- [x] Confirm local project-ops files are ignored.
- [x] Confirm generated avatar assets are intended for redistribution.
- [x] Confirm README warns that external agent CLI billing and usage-credit settings are the user's responsibility.

## Validation

```bash
npm test
npm pack --dry-run
git status --short
```
