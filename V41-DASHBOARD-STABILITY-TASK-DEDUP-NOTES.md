# V41 Dashboard stability and task deduplication

- Preserves expanded dashboard campaign/department sections during live Firestore refreshes.
- Delays dashboard redraw briefly while a user is opening or closing a section, preventing the open-close flicker.
- Uses a semantic task identity instead of document ID alone when rendering task lists.
- Prevents duplicate campaign and agenda tasks during creation.
- Deduplicates `departmentTasks` before campaign writes and repairs existing duplicate records without changing task workflow logic.
