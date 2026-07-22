# Changelog

## Unreleased

- Opened the message DB with a busy timeout (`AGMSG_BUSY_TIMEOUT_MS`, default 2000ms) and busy retries so auto-refresh no longer fails with "database is locked" while the agmsg watcher is writing.
- Added a pair thread view: the sidebar lists agent pairs (e.g. Dove ⇄ Crow) with message counts, and selecting one filters the log to that pair's conversation in both directions.
- Added a `/api/pairs` endpoint and optional `a`/`b` pair parameters on `/api/history`.
- Documented spawn-based agent startup and pair-thread usage tips in the README.

## 0.1.0 - 2026-07-02

- Initial local agmsg messenger-style viewer.
- Added compact chat bubbles, generated avatars, emotion hints, and thinking indicators.
- Added configurable avatar images and bundled expression sets.
- Added collapsible sidebar and LINE-like new-message behavior.
- Added OSS readiness files and CI check workflow.
- Added a `/demo` capture route with looping fake messages that never reads real agmsg history.
- Aligned right-side message avatars with the left-side avatar baseline.
- Embedded minimal agmsg-compatible read logic with `node:sqlite`, removing the Git Bash/agmsg script dependency.
- Added third-party notices for MIT-licensed agmsg portions.
- Documented external agent billing responsibility and usage-credit checks.
- Added README demo media with a GIF preview and MP4 source.
- Renamed visible app copy to Bubblelog-focused wording.
- Aligned right-side avatars to the same grid row as their message bubbles.
- Added optional model labels for sender metadata.
- Removed small corner emotion badges from message bubbles.
- Added a 15-language UI selector while keeping log message bodies unchanged.
