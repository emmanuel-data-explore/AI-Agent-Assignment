# SWEYY hybrid study-agent implementation

- [x] Choose safe defaults: hybrid autonomy, Supabase source of truth, two-way Sheets sync, approval for calendar creation and destructive changes.
- [x] Validate Supabase REST credentials when configured.
- [x] Validate Google Sheets workbook access when configured.
- [x] Restore subject CRUD and editable/deletable generated plan sessions.
- [x] Sync subjects, tasks, and generated plans to the attached workbook.
- [ ] Import Subject, Exam, Task, and Study Log tabs into the app with deduplication.
- [ ] Add an in-app "Import from Sheets" action and import result summary.
- [ ] Add an agent-run endpoint that imports source data, checks capacity, generates a grounded plan, and persists it.
- [ ] Add approval-gated calendar event creation; keep availability read-only by default.
- [ ] Add idempotent scheduled daily/weekly agent runs.
- [ ] Add two-way conflict records and audit history.
- [ ] Add notification preferences and background reminders.
- [ ] Run full tests, save checkpoint, and rebuild APK.

## Default policy

- Hybrid autonomy: routine imports and recommendations may run automatically; calendar creation and destructive changes require approval.
- Supabase is the durable source of truth; Google Sheets is an editable external workspace synchronized with explicit import/export actions.
- Never invent subjects, topics, exams, or deadlines.
- Never exceed available study capacity.
