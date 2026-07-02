# Publishing Checklist

Use this before making the repository public.

## Repository

- [ ] Create the GitHub repository.
- [ ] Set the repository visibility intentionally.
- [ ] Add `origin`.
- [ ] Push `main` or rename `master` to `main` before pushing.
- [ ] Enable GitHub Actions.
- [ ] Confirm the Check workflow passes.

## Metadata

- [x] Update `package.json` with the final `repository`, `homepage`, and `bugs` URLs.
- [ ] Confirm `README.md` describes the supported platform and setup.
- [ ] Confirm `LICENSE`, `CONTRIBUTING.md`, `SECURITY.md`, `CHANGELOG.md`, and `ASSETS.md` are present.

## Privacy

- [ ] Confirm no private agmsg database, workspace logs, tokens, or account data are tracked.
- [ ] Confirm local project-ops files are ignored.
- [ ] Confirm generated avatar assets are intended for redistribution.

## Validation

```bash
npm test
npm pack --dry-run
git status --short
```
