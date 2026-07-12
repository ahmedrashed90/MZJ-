# Unified progress source fix

- Campaign management now reads the exact same campaign snapshot used by the readiness dashboard.
- Tracking page uses the same task list and the same per-task progress function.
- Released/published campaigns remain included in management and tracking metrics.
- Tracking statuses are progress-based only: 0 waiting, 1-99 active, 100 complete/approved.
- Campaign active count excludes campaigns whose unified progress is 100%.
- Publish-prep creative names remain the full selected creative names and are not merged.
- No CSS changes.
