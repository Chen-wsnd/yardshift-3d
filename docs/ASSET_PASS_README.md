# YardShift Visual Pass Handoff

Current verified repo has YardShift v0.1 two-job gameplay on main but **not deployed**. Execution log is in GitHub `docs/EXECUTION_LOG.md`.

1. Read `ASSET_MATCHING.md` for verified candidate sources and mappings to existing `TargetKind` values.
2. Copy `CURSOR_VISUAL_PASS.md` and `ASSET_MATCHING.md` to the local repository's `docs/` directory. This is an **additive** handoff; do not overwrite existing execution files.
3. In Cursor Desktop LOCAL agent, instruct: `Read docs/ASSET_MATCHING.md and docs/CURSOR_VISUAL_PASS.md completely. Implement the full visual pass in one run, keep existing two-job gameplay intact, and push your verified feature branch.`
4. User needs to authenticate Vercel locally to enable public deployment: `npx vercel login` then deploy via Vercel from repo after QA. Login requires the user's action.
5. Optional premium Fab assets require user selection/purchase and explicit license review; current instructions deliver a fallback visual pass without premium assets.

This package includes **research and integration instructions, not licensed downloaded 3D asset binaries**. No remote repository changes have been made.
