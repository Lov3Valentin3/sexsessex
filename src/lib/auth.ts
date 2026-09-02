import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { sessions } from "@/db/schema";
export const SESSION_COOKIE = "np_session";
export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}
export function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const test = scryptSync(password, salt, 64);
  const hashBuffer = Buffer.from(hash, "hex");
  if (test.length !== hashBuffer.length) return false;
  return timingSafeEqual(test, hashBuffer);
}
export function festiveCode() {
  const words = ["SNOW", "JINGLE", "HOLLY", "COCOA", "FROST", "BELLS", "STAR", "MINT"];
  const word = words[Math.floor(Math.random() * words.length)];
  const num = Math.floor(1000 + Math.random() * 9000);
  return `${word}${num}`;
}
export async function createSession(input: {
  role: "parent" | "child" | "admin";
  parentId?: number | null;
  childId?: number | null;
  adminId?: number | null;
}) {
  const id = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
  await db.insert(sessions).values({
    id,
    role: input.role,
    parentId: input.parentId ?? null,
    childId: input.childId ?? null,
    adminId: input.adminId ?? null,
    expiresAt,
  });
  const store = await cookies();
  store.set(SESSION_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
    secure: process.env.NODE_ENV === "production",
  });
  return id;
}
export async function getSession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const [row] = await db.select().from(sessions).where(eq(sessions.id, token)).limit(1);
  if (!row || row.expiresAt.getTime() < Date.now()) {
    if (row) await db.delete(sessions).where(eq(sessions.id, token));
    return null;
  }
  return row;
}
export async function clearSession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    await db.delete(sessions).where(eq(sessions.id, token));
  }
  store.delete(SESSION_COOKIE);
}
export async function trackEvent(input: {
  eventType: string;
  role?: string | null;
  parentId?: number | null;
  childId?: number | null;
  metadata?: Record<string, string | number | boolean | null>;
}) {
  const { analyticsEvents } = await import("@/db/schema");
  await db.insert(analyticsEvents).values({
    eventType: input.eventType,
    role: input.role ?? null,
    parentId: input.parentId ?? null,
    childId: input.childId ?? null,
    metadata: input.metadata ?? null,
  });
}