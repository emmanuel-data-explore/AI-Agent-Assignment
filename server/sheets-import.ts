export type SheetRow = string[];
export type ImportedSubject = { id: string; name: string; color: string; topics: string[]; difficulty: number; examDate?: string };
export type ImportedTask = { id: string; title: string; subjectId: string; due: string; completed: boolean; priority: "low" | "medium" | "high"; source: "manual" };
export type ImportedSession = { id: string; subjectId: string; topic?: string; minutes: number; date: string; score?: number; source: "timer" };
export type SheetImport = { subjects: ImportedSubject[]; tasks: ImportedTask[]; sessions: ImportedSession[]; warnings: string[] };
const colors = ["#6C63FF", "#00B8A9", "#F59E0B", "#EC4899"];
const clean = (value?: string) => (value ?? "").trim();
const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const number = (value: string, fallback: number) => Math.max(1, Math.min(5, Number.parseInt(value, 10) || fallback));
const priority = (value: string): "low" | "medium" | "high" => ["low", "medium", "high"].includes(value.toLowerCase()) ? value.toLowerCase() as "low" | "medium" | "high" : "medium";
export function parseStudySheets(subjectRows: SheetRow[], examRows: SheetRow[], taskRows: SheetRow[], logRows: SheetRow[]): SheetImport {
  const warnings: string[] = []; const subjectsByName = new Map<string, ImportedSubject>();
  for (const row of subjectRows.slice(2)) { const name = clean(row[0]); const topic = clean(row[2]); if (!name || name.toLowerCase().startsWith("enter ")) continue; const key = name.toLowerCase(); const existing = subjectsByName.get(key); if (existing) { if (topic && !existing.topics.includes(topic)) existing.topics.push(topic); continue; } subjectsByName.set(key, { id: slug(name) || `subject-${subjectsByName.size}`, name, color: colors[subjectsByName.size % colors.length], topics: topic ? [topic] : [], difficulty: number(clean(row[3]), 3), }); }
  const subjects = [...subjectsByName.values()]; const byName = new Map(subjects.map((subject) => [subject.name.toLowerCase(), subject.id]));
  for (const row of examRows.slice(2)) { const subject = subjectsByName.get(clean(row[0]).toLowerCase()); const date = clean(row[2]); if (subject && /^\d{4}-\d{2}-\d{2}$/.test(date)) subject.examDate = subject.examDate ?? date; else if (clean(row[0]) && !subject) warnings.push(`Exam references unknown subject: ${clean(row[0])}`); }
  const tasks: ImportedTask[] = []; const taskKeys = new Set<string>();
  for (const row of taskRows.slice(2)) { const due = clean(row[0]); const subjectId = byName.get(clean(row[1]).toLowerCase()); const topic = clean(row[2]); if (!subjectId || !topic || !due || due.startsWith("YYYY")) continue; const key = `${due}|${subjectId}|${topic}`.toLowerCase(); if (taskKeys.has(key)) continue; taskKeys.add(key); tasks.push({ id: `sheet-task-${slug(key)}`, title: topic, subjectId, due, completed: clean(row[5]).toLowerCase() === "done", priority: priority(clean(row[4])), source: "manual" }); }
  const sessions: ImportedSession[] = []; const sessionKeys = new Set<string>();
  for (const row of logRows.slice(2)) { const date = clean(row[0]); const subjectId = byName.get(clean(row[1]).toLowerCase()); const topic = clean(row[2]); const minutes = Number.parseInt(clean(row[3]), 10); const score = Number.parseInt(clean(row[4]), 10); if (!subjectId || !topic || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(minutes) || minutes <= 0) continue; const key = `${date}|${subjectId}|${topic}|${minutes}`.toLowerCase(); if (sessionKeys.has(key)) continue; sessionKeys.add(key); sessions.push({ id: `sheet-session-${slug(key)}`, subjectId, topic, minutes, date, score: Number.isFinite(score) ? score : undefined, source: "timer" }); }
  return { subjects, tasks, sessions, warnings };
}
