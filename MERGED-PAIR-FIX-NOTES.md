# MZJ v760 merged patch - task pair fix

- Base: `MZJ-main-v760-one-merged-patch-trial`.
- No CSS changes.
- No dashboard layout changes.
- No extra runtime patch was appended.
- The existing final campaign `buildTasks` function was replaced in place.
- A unique Task Template is created for every:
  `creative + execution department + execution user + content user`.
- The execution task uses the same unique pair key, so approving one template releases only its matching execution task.
