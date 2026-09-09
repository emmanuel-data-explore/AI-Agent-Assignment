import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { generateGroundedPlan } from "./plan-engine";
import { storeGeneratedPlan, supabaseConfigured } from "./supabase";

const subjectSchema = z.object({ id: z.string(), name: z.string(), topics: z.array(z.string()), difficulty: z.number().int().min(1).max(5), examDate: z.string().optional() });
const taskSchema = z.object({ id: z.string(), title: z.string(), subjectId: z.string(), due: z.string(), priority: z.enum(["low", "medium", "high"]), completed: z.boolean() });
const historySchema = z.object({ subjectId: z.string(), topic: z.string().optional(), minutes: z.number().int().positive(), date: z.string() });
const reviewSchema = z.object({ subjectId: z.string(), topic: z.string(), difficulty: z.number().int().min(1).max(5), mastery: z.number().min(0).max(1), intervalDays: z.number().int().positive(), streak: z.number().int().min(0), lastReviewed: z.string().optional(), nextReview: z.string() });
const calendarBlockSchema = z.object({ date: z.string(), startHour: z.number().min(0).max(23), endHour: z.number().min(0).max(23), title: z.string().optional() });
const planInputSchema = z.object({ kind: z.enum(["daily", "weekly"]), today: z.string(), subjects: z.array(subjectSchema).max(100), tasks: z.array(taskSchema).max(200), history: z.array(historySchema).max(500), reviews: z.array(reviewSchema).max(500), dailyMinutes: z.number().int().min(25).max(180), weeklyMinutes: z.number().int().min(25).max(1260), calendarBlocks: z.array(calendarBlockSchema).max(200) });
const sessionOutputSchema = z.object({ date: z.string(), startHour: z.number(), minutes: z.number(), subjectId: z.string(), topic: z.string(), taskId: z.string().optional(), reason: z.string() });

async function syncPlanToSheets(plan: { summary: string; kind: "daily" | "weekly"; sessions: Array<z.infer<typeof sessionOutputSchema>> }) {
  const token = process.env.GOOGLE_SHEETS_ACCESS_TOKEN ?? process.env.GOOGLE_WORKSPACE_ACCESS_TOKEN;
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  if (!token || !spreadsheetId) return { synced: false, reason: "Google Sheets credentials are not configured." };
  const planValues = plan.sessions.map((s) => [s.date, s.startHour, s.minutes, s.subjectId, s.topic, s.taskId ?? "", s.reason, "", "", plan.kind]);
  const taskValues = plan.sessions.map((s) => [s.date, s.subjectId, s.topic, s.minutes, "medium", "Open"]);
  const append = async (range: string, values: unknown[][]) => fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED`, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ values }) });
  const [planResponse, taskResponse] = await Promise.all([append("AI Plan!A5:J", planValues), append("Task!A3:F", taskValues)]);
  if (!planResponse.ok || !taskResponse.ok) throw new Error(`Google Sheets sync failed: ${planResponse.status}/${taskResponse.status}`);
  return { synced: true, spreadsheetId, tabs: ["AI Plan", "Task"] };
}

export const appRouter = router({
  system: systemRouter,
  auth: router({ me: publicProcedure.query((opts) => opts.ctx.user), logout: publicProcedure.mutation(({ ctx }) => { const cookieOptions = getSessionCookieOptions(ctx.req); ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 }); return { success: true } as const; }) }),
  study: router({
    subjects: protectedProcedure.query(({ ctx }) => db.listSubjects(ctx.user.id)),
    tasks: protectedProcedure.query(({ ctx }) => db.listTasks(ctx.user.id)),
    sessions: protectedProcedure.query(({ ctx }) => db.listSessions(ctx.user.id)),
    createTask: protectedProcedure.input(z.object({ title: z.string().min(1).max(255), subjectId: z.number().optional(), priority: z.enum(["low", "medium", "high"]).default("medium") })).mutation(({ ctx, input }) => db.createTask({ userId: ctx.user.id, ...input })),
    toggleTask: protectedProcedure.input(z.object({ id: z.number(), completed: z.boolean() })).mutation(({ ctx, input }) => db.toggleTask(ctx.user.id, input.id, input.completed)),
    addSession: protectedProcedure.input(z.object({ subjectId: z.number().optional(), minutes: z.number().int().positive() })).mutation(({ ctx, input }) => db.addSession({ userId: ctx.user.id, ...input })),
    generatePlan: protectedProcedure.input(planInputSchema).mutation(async ({ ctx, input }) => {
      if (!input.tasks.some((task) => !task.completed)) throw new Error("Add at least one incomplete task before generating a plan.");
      const plan = await generateGroundedPlan(input);
      if (!supabaseConfigured()) throw new Error("Supabase persistence is not configured. Add SUPABASE_SERVICE_ROLE_KEY to the server secrets before generating plans.");
      const persisted = await storeGeneratedPlan(ctx.user.openId, input.kind, plan.summary, plan.sessions);
      return { ...plan, id: persisted.planId, kind: input.kind, createdAt: new Date().toISOString(), persisted: true };
    }),
    calendarAvailability: protectedProcedure.input(z.object({ accessToken: z.string().min(20), startDate: z.string(), days: z.number().int().min(1).max(31).default(7) })).mutation(async ({ input }) => {
      const start = new Date(`${input.startDate}T00:00:00Z`); const end = new Date(start.getTime() + input.days * 86400000); const params = new URLSearchParams({ timeMin: start.toISOString(), timeMax: end.toISOString(), singleEvents: "true", orderBy: "startTime", maxResults: "250" });
      const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?${params.toString()}`, { headers: { Authorization: `Bearer ${input.accessToken}` } }); if (!response.ok) throw new Error(`Google Calendar availability failed: ${response.status}`);
      const data = await response.json() as { items?: Array<{ summary?: string; start?: { dateTime?: string }; end?: { dateTime?: string } }> }; const blocks = (data.items ?? []).filter((event) => event.start?.dateTime && event.end?.dateTime).map((event) => { const startTime = new Date(event.start!.dateTime!); const endTime = new Date(event.end!.dateTime!); return { date: startTime.toISOString().slice(0, 10), startHour: startTime.getUTCHours(), endHour: Math.max(startTime.getUTCHours() + 1, endTime.getUTCHours()), title: event.summary ?? "Busy" }; }); return { blocks, source: "Google Calendar" as const };
    }),
    syncPlanToSheets: protectedProcedure.input(z.object({ kind: z.enum(["daily", "weekly"]), summary: z.string(), sessions: z.array(sessionOutputSchema) })).mutation(({ input }) => syncPlanToSheets(input)),
    calendarStatus: protectedProcedure.query(() => ({ available: Boolean(process.env.GOOGLE_CALENDAR_ACCESS_TOKEN), source: process.env.GOOGLE_CALENDAR_ACCESS_TOKEN ? "Google Calendar" : "manual calendar blocks" })),
  }),
});
export type AppRouter = typeof appRouter;
