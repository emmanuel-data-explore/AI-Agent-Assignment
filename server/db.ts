import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, subjects, topics, tasks, sessions } from "../drizzle/schema";
import { ENV } from "./_core/env";
let _db: ReturnType<typeof drizzle> | null = null;
export async function getDb(){ if(!_db && process.env.DATABASE_URL){ try{_db=drizzle(process.env.DATABASE_URL)}catch(error){console.warn("[Database] Failed to connect:",error);_db=null} } return _db; }
export async function upsertUser(user:InsertUser):Promise<void>{if(!user.openId)throw new Error("User openId is required for upsert");const db=await getDb();if(!db){console.warn("[Database] Cannot upsert user: database not available");return}const values:InsertUser={openId:user.openId,name:user.name??null,email:user.email??null,loginMethod:user.loginMethod??null,lastSignedIn:new Date()};await db.insert(users).values(values).onDuplicateKeyUpdate({set:{name:values.name,email:values.email,loginMethod:values.loginMethod,lastSignedIn:values.lastSignedIn}})}
export async function getUserByOpenId(openId:string){const db=await getDb();if(!db)return undefined;const result=await db.select().from(users).where(eq(users.openId,openId)).limit(1);return result[0]}
export async function listSubjects(userId:number){const db=await getDb();return db?db.select().from(subjects).where(eq(subjects.userId,userId)):[]}
export async function listTasks(userId:number){const db=await getDb();return db?db.select().from(tasks).where(eq(tasks.userId,userId)).orderBy(desc(tasks.createdAt)):[]}
export async function createTask(data:{userId:number;title:string;subjectId?:number;priority:"low"|"medium"|"high"}){const db=await getDb();if(!db)throw new Error("Database not available");await db.insert(tasks).values(data);return {success:true}}
export async function toggleTask(userId:number,id:number,completed:boolean){const db=await getDb();if(!db)throw new Error("Database not available");await db.update(tasks).set({completed}).where(eq(tasks.id,id))}
export async function addSession(data:{userId:number;subjectId?:number;minutes:number}){const db=await getDb();if(!db)throw new Error("Database not available");await db.insert(sessions).values(data);return {success:true}}
export async function listSessions(userId:number){const db=await getDb();return db?db.select().from(sessions).where(eq(sessions.userId,userId)).orderBy(desc(sessions.startedAt)):[]}
