# YardShift — Start Here

## To start Cursor immediately

1. Keep Cursor Desktop open in the locally cloned `yardshift-3d` repository. Confirm the active agent is **Local**, not Cloud.
2. Copy `CURSOR_ONE_SHOT_BUILD.md` into the local repository as `docs/CURSOR_ONE_SHOT_BUILD.md` (or attach it to the local Cursor chat).
3. Send Cursor this one-sentence instruction:

   > Read `docs/CURSOR_ONE_SHOT_BUILD.md` completely and execute the entire full-MVP implementation in one autonomous local session. Preserve the existing Phase 0 and any unrelated changes. Do not stop between modules for approval. Keep `docs/EXECUTION_LOG.md` updated, test the two-job end-to-end gameplay, push verified code to GitHub, and report blockers and a deployment URL if successfully deployed.

4. Cursor builds, tests and pushes; return its checkpoint/log and final report to ChatGPT for architecture and UX review.

## Files
- `CURSOR_ONE_SHOT_BUILD.md`: complete implementation command for Cursor
- `PRODUCT_BLUEPRINT.md`: product and behavior specification
- `ASSET_SHORTLIST.md`: model and material options for later discussion
- `DECISIONS_AND_POLISH_BACKLOG.md`: design decisions deferred until the first complete build

## Guardrails
- Do not run multiple Cursor agents against the same working tree during this first full build.
- Do not change files under Cursor's active work area from another agent mid-run.
- The user remains the approval authority for major product scope changes and publication.
- No unknown asset license, forced Git push or fabricated tests/deployment results.
