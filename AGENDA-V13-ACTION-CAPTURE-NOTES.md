# Agenda v13 - isolated execution action fix

- Fixes agenda execution step clicks being intercepted by the legacy campaign task modal capture handler.
- Adds an agenda-only window capture handler for `source: agenda` execution tasks.
- Updates the exact task by `id/taskId` inside `marketing_campaigns.departmentTasks`.
- Does not modify `app.js`, `merged-patches.js`, campaign task handlers, or CSS.
- Saves top-level and nested execution progress, steps, state, and timestamps.
