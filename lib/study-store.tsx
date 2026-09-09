import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Subject = { id: string; name: string; color: string; topics: string[]; difficulty: number; examDate?: string };
export type Task = { id: string; title: string; subjectId: string; due: string; completed: boolean; priority: "low" | "medium" | "high"; source?: "manual" | "ai" };
export type StudySession = { id: string; subjectId: string; topic?: string; minutes: number; date: string; source?: "timer" | "generated" };
export type CalendarBlock = { date: string; startHour: number; endHour: number; title?: string };
export type StudyProfile = { dailyMinutes: number; weeklyMinutes: number; calendarBlocks: CalendarBlock[] };
export type GeneratedPlanSession = { id: string; date: string; startHour: number; minutes: number; subjectId: string; topic: string; taskId?: string; reason: string };
export type GeneratedPlan = { id: string; kind: "daily" | "weekly"; createdAt: string; sessions: GeneratedPlanSession[]; summary: string; syncedSheetId?: string };
export type CsvExport = { id: string; month: string; filename: string; csv: string; createdAt: string; uri?: string };
type StudyState = { subjects: Subject[]; tasks: Task[]; sessions: StudySession[]; profile: StudyProfile; plans: GeneratedPlan[]; csvExports: CsvExport[] };
type StudyContextValue = StudyState & { addSubject: (name: string, topics?: string[], difficulty?: number, examDate?: string) => void; addTask: (title: string, subjectId: string, due: string, priority: Task["priority"], source?: Task["source"]) => void; addPlanTasks: (plan: GeneratedPlan) => void; toggleTask: (id: string) => void; addSession: (subjectId: string, minutes: number, topic?: string) => void; updateProfile: (profile: Partial<StudyProfile>) => void; addPlan: (plan: GeneratedPlan) => void; addCsvExport: (item: CsvExport) => void; deleteCsvExport: (id: string) => void; clearHistory: () => void };
const KEY = "sweyy-study-state-v3";
const initialState: StudyState = { subjects: [{ id: "math", name: "Mathematics", color: "#6C63FF", topics: ["Algebra", "Calculus"], difficulty: 4 }, { id: "physics", name: "Physics", color: "#00B8A9", topics: ["Mechanics", "Waves"], difficulty: 3 }, { id: "history", name: "History", color: "#F59E0B", topics: ["Modern Asia"], difficulty: 2 }], tasks: [{ id: "t1", title: "Review quadratic equations", subjectId: "math", due: "Today", completed: false, priority: "high", source: "manual" }, { id: "t2", title: "Read mechanics notes", subjectId: "physics", due: "Tomorrow", completed: false, priority: "medium", source: "manual" }, { id: "t3", title: "Make history flashcards", subjectId: "history", due: "Friday", completed: true, priority: "low", source: "manual" }], sessions: [], profile: { dailyMinutes: 90, weeklyMinutes: 450, calendarBlocks: [] }, plans: [], csvExports: [] };
const StudyContext = createContext<StudyContextValue | null>(null);
export function StudyProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<StudyState>(initialState); const [hydrated, setHydrated] = useState(false);
  useEffect(() => { AsyncStorage.getItem(KEY).then((raw) => { if (raw) setState({ ...initialState, ...JSON.parse(raw) }); setHydrated(true); }); }, []);
  useEffect(() => { if (hydrated) AsyncStorage.setItem(KEY, JSON.stringify(state)); }, [state, hydrated]);
  const value = useMemo<StudyContextValue>(() => ({ ...state,
    addSubject: (name, topics = [], difficulty = 3, examDate) => setState((s) => ({ ...s, subjects: [...s.subjects, { id: `${Date.now()}`, name, color: ["#6C63FF", "#00B8A9", "#F59E0B", "#EC4899"][s.subjects.length % 4], topics, difficulty, examDate }] })),
    addTask: (title, subjectId, due, priority, source = "manual") => setState((s) => ({ ...s, tasks: s.tasks.some((task) => task.title === title && !task.completed) ? s.tasks : [{ id: `${Date.now()}-${Math.random()}`, title, subjectId, due, completed: false, priority, source }, ...s.tasks] })),
    addPlanTasks: (plan) => setState((s) => { const newTasks = plan.sessions.filter((session) => !s.tasks.some((task) => task.title === `${session.topic} practice` && !task.completed)).map((session) => ({ id: `${Date.now()}-${Math.random()}`, title: `${session.topic} practice`, subjectId: session.subjectId, due: session.date, completed: false, priority: "medium" as const, source: "ai" as const })); return { ...s, tasks: [...newTasks, ...s.tasks] }; }),
    toggleTask: (id) => setState((s) => ({ ...s, tasks: s.tasks.map((t) => t.id === id ? { ...t, completed: !t.completed } : t) })),
    addSession: (subjectId, minutes, topic) => setState((s) => ({ ...s, sessions: [{ id: `${Date.now()}`, subjectId, topic, minutes, date: new Date().toISOString(), source: "timer" }, ...s.sessions] })),
    updateProfile: (profile) => setState((s) => ({ ...s, profile: { ...s.profile, ...profile } })),
    addPlan: (plan) => setState((s) => ({ ...s, plans: [plan, ...s.plans.filter((p) => p.id !== plan.id)] })),
    addCsvExport: (item) => setState((s) => ({ ...s, csvExports: [item, ...s.csvExports.filter((exported) => exported.id !== item.id)] })),
    deleteCsvExport: (id) => setState((s) => ({ ...s, csvExports: s.csvExports.filter((item) => item.id !== id) })),
    clearHistory: () => setState((s) => ({ ...s, sessions: [], plans: [], csvExports: [] })),
  }), [state]);
  return <StudyContext.Provider value={value}>{children}</StudyContext.Provider>;
}
export function useStudy() { const value = useContext(StudyContext); if (!value) throw new Error("useStudy must be used inside StudyProvider"); return value; }
