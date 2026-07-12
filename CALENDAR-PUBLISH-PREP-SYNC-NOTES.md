# Calendar and Publish Prep synchronization

- The campaign publishing schedule remains the initial source for creative, platforms, post types, dates, caption and hashtags.
- Publish Prep loads the complete schedule data for the matching creative, including per-platform post types and dates.
- Any data saved from Publish Prep becomes the latest authoritative version for Calendar.
- Calendar excludes the matching original campaign schedule row when a Publish Prep task exists, preventing stale or duplicated entries.
- Publish Prep edits support platform-specific date/time and multiple post types.
- Creative matching now prefers creative/product IDs and the full creative name before fuzzy type matching.
- No CSS, task distribution, execution workflow, or progress logic was changed.
