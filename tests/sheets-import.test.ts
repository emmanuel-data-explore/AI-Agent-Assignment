import { describe, expect, it } from "vitest";
import { parseStudySheets } from "../server/sheets-import";

describe("Google Sheets study import", () => {
  it("imports only real rows, merges topics, maps exams/tasks/logs, and deduplicates", () => {
    const result = parseStudySheets(
      [["SUBJECT", "UNIT", "TOPIC", "DIFFICULTY", "PROGRESS"], ["Enter only real subjects", "", "", "1-5", "0-100%"], ["Math", "Algebra", "Quadratics", "4", "30%"], ["Math", "Algebra", "Quadratics", "4", "30%"], ["Math", "Calculus", "Limits", "4", "30%"]],
      [["SUBJECT", "EXAM", "DATE", "IMPORTANCE"], ["Enter only real subject", "", "YYYY-MM-DD", ""], ["Math", "Final", "2026-12-10", "high"]],
      [["DATE", "SUBJECT", "TOPIC", "DURATION", "PRIORITY", "STATUS"], ["2026-10-12", "Math", "Quadratics", "45", "high", "Open"], ["2026-10-12", "Math", "Quadratics", "45", "high", "Open"]],
      [["DATE", "SUBJECT", "TOPIC", "MINUTE", "SCORE"], ["2026-10-11", "Math", "Quadratics", "30", "80"], ["2026-10-11", "Math", "Quadratics", "30", "80"]],
    );
    expect(result.subjects).toHaveLength(1); expect(result.subjects[0].topics).toEqual(["Quadratics", "Limits"]); expect(result.subjects[0].examDate).toBe("2026-12-10"); expect(result.tasks).toHaveLength(1); expect(result.sessions).toHaveLength(1); expect(result.warnings).toEqual([]);
  });
});
