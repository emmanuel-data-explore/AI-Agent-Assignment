type SupabaseRow = Record<string, unknown>;
const url = (process.env.SUPABASE_URL ?? "https://nrjsyonjgjujklzfqdtz.supabase.co").replace(/\/$/, "");
const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY;
export function supabaseConfigured() { return Boolean(key); }
async function insert(table: string, rows: SupabaseRow[]) { if (!key) throw new Error("Supabase service key is not configured for the server runtime"); const response = await fetch(`${url}/rest/v1/${table}`, { method: "POST", headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", Prefer: "return=representation" }, body: JSON.stringify(rows) }); if (!response.ok) throw new Error(`Supabase insert failed: ${response.status}`); return response.json(); }
export async function storeGeneratedPlan(userRef: string, kind: "daily" | "weekly", summary: string, sessions: Array<{ date: string; startHour: number; minutes: number; subjectId: string; topic: string; taskId?: string; reason: string }>) {
  const plans = await insert("study_plans", [{ user_ref: userRef, title: `${kind === "daily" ? "Today's" : "Weekly"} study plan`, plan_json: { kind, summary, sessions } }]); const planId = (plans as Array<{ id: string }>)[0]?.id; if (!planId) throw new Error("Supabase did not return a plan id");
  await insert("study_plan_sessions", sessions.map((session) => ({ plan_id: planId, user_ref: userRef, scheduled_for: session.date, start_hour: session.startHour, minutes: session.minutes, subject_ref: session.subjectId, topic: session.topic, task_ref: session.taskId ?? null, reason: session.reason }))); return { planId };
}
