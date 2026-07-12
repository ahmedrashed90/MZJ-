# Baseline unified metrics and publish-prep fix

- Publish Prep groups only the same creative instance (N01/N02/N03) inside a campaign.
- Different REEL creative instances are no longer merged together.
- Campaign progress is the equal-weight average of participating departments.
- Tracking and Campaign Management use the same campaign progress source as readiness dashboard.
- Tracking status counts are based on actual task progress: 0 waiting, 1-99 active, 100 completed/approved.
- No CSS changes.

## 2026-07-12 — Final consistency correction
- Campaign Management now consumes the exact same `campaignTasksSnapshot` used by the dashboard readiness card, with no secondary task de-duplication. Campaign task counts and progress therefore match the dashboard (example: 30 tasks / 58%).
- Tracking page now uses the same campaign snapshots and the same complete task list without dropping valid content/execution relationships. Overall campaign average is based on campaign progress values (example: 58% and 100% => 79%).
- Publish Preparation keeps every creative task independent and displays the full selected creative name (for example `REEL - معارضنا - SHOWROOM` and `REEL - اهم المواصفات - STUDIO`) instead of generic labels such as `REEL 1` and `REEL 2`.
