# V38 - Campaign and Agenda draft save

- Added a `حفظ مسودة` action to campaign creation and agenda creation.
- Drafts are stored per signed-in user in `marketing_campaign_drafts` and `marketing_agenda_drafts`.
- Returning to either creation page restores the saved step and entered data automatically.
- Campaign draft attachments are uploaded once and kept with the restored draft.
- Creating the final campaign or agenda removes its saved builder draft.
- Built directly from v37 without applying an older patch package.
