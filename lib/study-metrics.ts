import type { Task, StudySession, Subject } from "./study-store";
export function completedTaskCount(tasks: Task[]) { return tasks.filter((task) => task.completed).length; }
export function totalStudyMinutes(sessions: StudySession[]) { return sessions.reduce((total, session) => total + session.minutes, 0); }
export function subjectCompletion(subject: Subject, tasks: Task[]) { const subjectTasks = tasks.filter((task) => task.subjectId === subject.id); return subjectTasks.length === 0 ? 0 : subjectTasks.filter((task) => task.completed).length / subjectTasks.length; }
