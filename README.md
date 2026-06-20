# companion-module-bmd-hyperdeck

See HELP.md and LICENSE

## Changes

## v3.0.0

- Update module api to v2.0
- Support expressions in many feedbacks and actions
- Add variable of all clip names
- Add presets for loading clips by name or index
- Add presets for setting the video format and selecting the active slot
- Add a feedback for the active video format
- Add a Record/Stop toggle action and preset (#135)
- Fix spurious drop-frame timecode errors at non drop-frame rates such as 1080p60 (#168)
- Fix the active clip name feedback never matching (#117)
- Add optional config setting to warn (connection status) when remote (REM) is disabled (#115)
- Fix audio channel cycle skipping 2ch when switching from AAC to PCM (#138)
- Fix Goto (TC) landing a few frames off in drop-frame video formats (#165)
- Fix "Set Shuttle Speed to 0" returning a syntax error (#123)
- Add a "Play single clip" preset (play one clip then stop) (#134)
- Add play range set (in/out) and clear actions (#87)
