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
- [x] Confirm `LICENSE`, `CONTRIBUTING.md`, `SECURITY.md`, `CHANGELOG.md`, and `ASSETS.md` are present.

## Privacy

- [x] Confirm no private agmsg database, workspace logs, tokens, or account data are tracked.
- [x] Confirm local project-ops files are ignored.
- [x] Confirm generated avatar assets are intended for redistribution.

## Validation

```bash
npm test
npm pack --dry-run
git status --short
```
