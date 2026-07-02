# Changelog

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
