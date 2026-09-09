import { describe, expect, it, vi } from "vitest";
vi.mock("../server/_core/llm", () => ({ invokeLLM: vi.fn().mockRejectedValue(new Error("offline")) }));
import { generateGroundedPlan } from "../server/plan-engine";
const base = { kind: "weekly" as const, today: "2026-09-10", subjects: [{ id: "math", name: "Math", topics: ["Algebra"], difficulty: 5, examDate: "2026-09-20" }], tasks: [{ id: "task-1", title: "Revise algebra", subjectId: "math", due: "Sunday", priority: "high" as const, completed: false }], history: [], reviews: [], dailyMinutes: 60, weeklyMinutes: 180, calendarBlocks: [] };
describe("grounded plan engine", () => {
  it("only schedules supplied topics and tasks", async () => { const result = await generateGroundedPlan(base); expect(result.sessions.length).toBeGreaterThan(0); expect(result.sessions.every((s) => s.subjectId === "math" && s.topic === "Algebra" && s.taskId === "task-1")).toBe(true); });
  it("does not exceed weekly capacity or create short impossible sessions", async () => { const result = await generateGroundedPlan({ ...base, weeklyMinutes: 120 }); expect(result.sessions.reduce((sum, s) => sum + s.minutes, 0)).toBeLessThanOrEqual(120); expect(result.sessions.every((s) => s.minutes >= 25 && s.minutes <= 180)).toBe(true); });
  it("subtracts calendar-blocked time from the day", async () => { const result = await generateGroundedPlan({ ...base, kind: "daily", dailyMinutes: 60, weeklyMinutes: 60, calendarBlocks: [{ date: "2026-09-10", startHour: 16, endHour: 18 }] }); expect(result.sessions.length).toBe(0); });
});
