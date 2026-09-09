# SWEYY configuration

## 1. Configure Supabase persistence

1. Open the Supabase project connected to SWEYY.
2. Go to **Project Settings → API** and copy the server-only `service_role` key.
3. Add it as the WebDev/server secret `SUPABASE_SERVICE_ROLE_KEY`.
4. Set `SUPABASE_URL` to the project URL if it is not already configured.
5. Do not add this key to Expo public variables or commit it to Git.
6. Confirm that the `study_plans` and `study_plan_sessions` tables exist. Every generated plan session is written to these tables.

## 2. Configure Google Sheets

1. In Google Cloud Console, enable **Google Sheets API** and **Google Drive API**.
2. Create OAuth credentials for the Google account that owns the workbook.
3. Add the server secret `GOOGLE_SHEETS_ACCESS_TOKEN` or configure an OAuth token exchange that produces it.
4. Add the server secret `GOOGLE_SHEETS_SPREADSHEET_ID` with the ID of the `STUDY PLANNER` workbook.
5. Keep the existing `Subject`, `Exam`, `Task`, and `Study Log` tabs as source inputs. SWEYY writes generated rows to `AI Plan` and `Task`.
6. Use the **Sync Sheets** action after generating a plan.

## 3. Configure Calendar OAuth

1. Enable **Google Calendar API** in the same Google Cloud project.
2. Create Android, iOS, and Web OAuth client IDs.
3. Configure these Expo variables in the project environment:
   - `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID`
   - `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`
   - `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`
4. Use the read-only scope `https://www.googleapis.com/auth/calendar.readonly`.
5. Store tokens in device SecureStore only.
6. Connect Calendar in SWEYY before generating a plan. The planner subtracts timed calendar events from daily capacity. When disconnected, only manual availability blocks are used.

## 4. Generate plans

1. Enter real subjects, topics, difficulty, progress, exam dates, tasks, and study-log rows.
2. Set daily and weekly study capacity.
3. Connect Calendar if automatic availability is desired.
4. Select **Generate Today's Plan**, **Generate Weekly Plan**, or **Regenerate Plan**.
5. Review the sessions and generated AI to-dos, then select **Sync Sheets**.

SWEYY will not invent syllabus topics, exam dates, or calendar availability. If the source tabs are empty, it will explain what is missing instead of creating fictional sessions.
