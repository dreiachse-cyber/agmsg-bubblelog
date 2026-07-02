# Assets

This repository includes bundled avatar images under `public/avatars/`.

The initial bundled avatar assets were generated for this project by the maintainer and are distributed with this repository for use in agmsg-bubblelog. Before replacing or adding assets, make sure you have the right to redistribute them in a public repository.

Recommended asset rules:

- Use small PNG or WebP files suitable for circular avatars.
- Keep one neutral expression as the fallback.
- If adding expression sets, use these names where possible: `thinking`, `sad`, `happy`, `neutral`, `calm`, and `talk`.
- Add bundled avatar sets to `public/avatar-catalog.json` so the in-app picker can show them.
- Keep `public/agent-icons.json` for default agent assignments. User picker choices are stored in browser `localStorage`.
- Avoid adding private, licensed, or third-party character art unless the license explicitly allows redistribution.
