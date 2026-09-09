import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Subject = { id: string; name: string; color: string; topics: string[] };
export type Task = { id: string; title: string; subjectId: string; due: string; completed: boolean; priority: "low" | "medium" | "high" };
export type StudySession = { id: string; subjectId: string; minutes: number; date: string };
type StudyState = { subjects: Subject[]; tasks: Task[]; sessions: StudySession[] };

type StudyContextValue = StudyState & {
  addSubject: (name: string, topics?: string[]) => void;
  addTask: (title: string, subjectId: string, due: string, priority: Task["priority"]) => void;
  toggleTask: (id: string) => void;
  addSession: (subjectId: string, minutes: number) => void;
};

const KEY = "studyflow-state-v1";
const initialState: StudyState = {
  subjects: [
    { id: "math", name: "Mathematics", color: "#6C63FF", topics: ["Algebra", "Calculus"] },
    { id: "physics", name: "Physics", color: "#00B8A9", topics: ["Mechanics", "Waves"] },
    { id: "history", name: "History", color: "#F59E0B", topics: ["Modern Asia"] },
  ],
  tasks: [
    { id: "t1", title: "Review quadratic equations", subjectId: "math", due: "Today", completed: false, priority: "high" },
    { id: "t2", title: "Read mechanics notes", subjectId: "physics", due: "Tomorrow", completed: false, priority: "medium" },
    { id: "t3", title: "Make history flashcards", subjectId: "history", due: "Friday", completed: true, priority: "low" },
  ],
  sessions: [],
};

const StudyContext = createContext<StudyContextValue | null>(null);
export function StudyProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<StudyState>(initialState);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => { AsyncStorage.getItem(KEY).then((raw) => { if (raw) setState(JSON.parse(raw)); setHydrated(true); }); }, []);
  useEffect(() => { if (hydrated) AsyncStorage.setItem(KEY, JSON.stringify(state)); }, [state, hydrated]);
  const value = useMemo<StudyContextValue>(() => ({
    ...state,
    addSubject: (name, topics = []) => setState((s) => ({ ...s, subjects: [...s.subjects, { id: `${Date.now()}`, name, color: ["#6C63FF", "#00B8A9", "#F59E0B", "#EC4899"][s.subjects.length % 4], topics }] })),
    addTask: (title, subjectId, due, priority) => setState((s) => ({ ...s, tasks: [{ id: `${Date.now()}`, title, subjectId, due, completed: false, priority }, ...s.tasks] })),
    toggleTask: (id) => setState((s) => ({ ...s, tasks: s.tasks.map((t) => t.id === id ? { ...t, completed: !t.completed } : t) })),
    addSession: (subjectId, minutes) => setState((s) => ({ ...s, sessions: [{ id: `${Date.now()}`, subjectId, minutes, date: new Date().toISOString() }, ...s.sessions] })),
  }), [state]);
  return <StudyContext.Provider value={value}>{children}</StudyContext.Provider>;
}
export function useStudy() { const value = useContext(StudyContext); if (!value) throw new Error("useStudy must be used inside StudyProvider"); return value; }
