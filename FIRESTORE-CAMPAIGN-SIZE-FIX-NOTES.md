# Firestore campaign size fix v27

- Rebuilt from the user-uploaded source, not from the broken v26 package.
- Keeps visible Task Template fields inline in campaign tasks.
- Stores heavy workbook/file payloads in `campaign_task_templates` and `campaign_structure_uploads`.
- Hydrates older v26 pointer-only tasks from the independent collections so uploaded data appears again.
- Does not replace the in-memory task with a blank pointer after upload.
- Compaction is staged and only becomes aggressive when the campaign is still close to Firestore's 1 MiB limit.
