# Agenda v11 — Same Campaign Task Flow

- Agenda task generation now matches the current campaign flow.
- Every creative × execution department × execution user × content user relation creates one Task Template and one matching execution task.
- Each pair has unique IDs and matching `contentExecutionPairKey` / `linkedExecutionPairKey` values.
- Creation is blocked when content, execution users, or links are incomplete.
- Agenda and campaign documents are committed in one Firestore batch.
- The review screen shows creatives, relationships, and the actual task count.
- The ZIP exports one Task Template sheet per independent relation.
- Agenda CSS was consolidated into one final scoped stylesheet.
- Cache versions were updated to v11.

Tests passed: 5 relations = 5 templates + 5 execution tasks, optional departments, unlinked-user validation, atomic batch creation, and JavaScript syntax checks.
