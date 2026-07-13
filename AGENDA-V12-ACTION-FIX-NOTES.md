# Agenda v12 - Exact execution action update

- Agenda execution actions now update the clicked task strictly by `id/taskId` inside `marketing_campaigns.departmentTasks`.
- Pair keys and linked template IDs are treated as relationships, not task identity.
- Added an agenda-specific persistence bridge for task progress, steps, status, receive/upload actions that call `updateTaskOnFirebase`.
- Added an exact owner fallback for agenda execution users.
- The in-memory campaign and Firestore document are updated together, then dashboard/task views refresh.
- Existing non-agenda campaign tasks continue through the original functions.
- Bumped `agenda.js` cache version to `v12-action-fix`.
