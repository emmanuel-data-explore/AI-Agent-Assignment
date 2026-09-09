import { describe, expect, it, vi } from "vitest";
vi.mock("../server/_core/llm", () => ({ invokeLLM: vi.fn().mockRejectedValue(new Error("offline")) }));
import { generateGroundedPlan } from "../server/plan-engine";
describe("spaced repetition planning", () => {
  it("schedules due reviews only when the topic is known", async () => {
    const result = await generateGroundedPlan({ kind: "daily", today: "2026-09-10", subjects: [{ id: "math", name: "Math", topics: ["Algebra"], difficulty: 4 }], tasks: [], history: [], reviews: [{ subjectId: "math", topic: "Algebra", difficulty: 4, mastery: 0.35, intervalDays: 1, streak: 0, nextReview: "2026-09-09" }, { subjectId: "math", topic: "Geometry", difficulty: 4, mastery: 0.2, intervalDays: 1, streak: 0, nextReview: "2026-09-09" }], dailyMinutes: 50, weeklyMinutes: 50, calendarBlocks: [] });
    expect(result.sessions).toHaveLength(1); expect(result.sessions[0].topic).toBe("Algebra"); expect(result.sessions[0].reason).toContain("adaptive spaced review");
  });
});
