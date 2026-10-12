import { describe, expect, it } from "vitest";

describe("Google Sheets server credentials", () => {
  it("can read the attached workbook metadata", async () => {
    const token = process.env.GOOGLE_SHEETS_ACCESS_TOKEN;
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID ?? "1WWuiGWjh3qv1Y-la8B72X8YFGl3TW40St10L5_v8g94";
    expect(token, "GOOGLE_SHEETS_ACCESS_TOKEN must be configured").toBeTruthy();
    const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?includeGridData=false`, { headers: { Authorization: `Bearer ${token!}` }, signal: AbortSignal.timeout(10000) });
    expect(response.status, `Google Sheets returned ${response.status}`).toBe(200);
    const data = await response.json() as { spreadsheetId?: string };
    expect(data.spreadsheetId).toBe(spreadsheetId);
  }, 15000);
});
