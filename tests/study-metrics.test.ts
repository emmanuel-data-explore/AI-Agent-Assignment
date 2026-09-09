import { describe, expect, it } from "vitest";
import { completedTaskCount, subjectCompletion, totalStudyMinutes } from "../lib/study-metrics";
const subject = { id: "math", name: "Math", color: "#6C63FF", topics: [] } as any;
const tasks = [{ id: "1", title: "A", subjectId: "math", due: "Today", completed: true, priority: "medium" }, { id: "2", title: "B", subjectId: "math", due: "Tomorrow", completed: false, priority: "low" }, { id: "3", title: "C", subjectId: "history", due: "Friday", completed: true, priority: "low" }] as const;
describe("study metrics", () => { it("counts completed tasks", () => expect(completedTaskCount(tasks as any)).toBe(2)); it("sums recorded minutes", () => expect(totalStudyMinutes([{ id: "1", subjectId: "math", minutes: 25, date: "2026-09-09" }, { id: "2", subjectId: "math", minutes: 40, date: "2026-09-09" }])).toBe(65)); it("calculates subject completion", () => expect(subjectCompletion(subject, tasks as any)).toBe(0.5)); });
