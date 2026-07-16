# Firestore campaign document size fix

- Keeps `marketing_campaigns` below Firestore's 1 MiB document limit.
- Before any campaign task write, large Task Template and structure payloads are copied to the existing independent collections:
  - `campaign_task_templates`
  - `campaign_structure_uploads`
- The campaign document keeps lightweight pointers, task states, actions, owners, dates and file links.
- Existing large campaigns are compacted automatically for management/admin users after loading.
- Existing external upload listeners continue to hydrate the full Task Template/structure data in task details.
- No campaign, task, attachment or final-file record is deleted.
- Removed one corrupted-name duplicate of `campaign-logic-template.xlsx` to prevent Windows `Path too long` extraction errors.
