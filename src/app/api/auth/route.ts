import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { admins, children, parents, subscriptions } from "@/db/schema";
import {
  clearSession,
  createSession,
  getSession,
  trackEvent,
  verifyPassword,
  hashPassword,
} from "@/lib/auth";
import { boot, json, readJson } from "@/lib/http";
export const dynamic = "force-dynamic";
function hasActiveSub(
  rows: { status: string; expiresAt: Date | null }[],
) {
  const now = Date.now();
  return rows.some(
    (row) => row.status === "active" && (!row.expiresAt || row.expiresAt.getTime() > now),
  );
}
export async function GET() {
  await boot();
  const session = await getSession();
  if (!session) return json({ session: null });
  return json({
    session: {
      role: session.role,
      parentId: session.parentId,
      childId: session.childId,
      adminId: session.adminId,
    },
  });
}
export async function POST(req: Request) {
  await boot();
  const body = await readJson<{
    action?: string;
    email?: string;
    password?: string;
    name?: string;
    firstName?: string;
    secretCode?: string;
  }>(req);
  const action = body.action || "";
  if (action === "logout") {
    await clearSession();
    return json({ ok: true });
  }
  if (action === "register-parent") {
    const email = body.email?.trim().toLowerCase() || "";
    const password = body.password || "";
    const name = body.name?.trim() || "";
    if (!email || !password || !name) return json({ error: "Please fill every field." }, 400);
    if (password.length < 8) return json({ error: "Password must be at least 8 characters." }, 400);
    const existing = await db.select().from(parents).where(eq(parents.email, email)).limit(1);
    if (existing.length) return json({ error: "That email already has a workshop pass." }, 400);
    const [parent] = await db
      .insert(parents)
      .values({ email, passwordHash: hashPassword(password), name })
      .returning();
    await createSession({ role: "parent", parentId: parent.id });
    await trackEvent({ eventType: "parent_register", role: "parent", parentId: parent.id });
    return json({ ok: true, next: "/parent/app" });
  }
  if (action === "login-parent") {
    const email = body.email?.trim().toLowerCase() || "";
    const password = body.password || "";
    const [parent] = await db.select().from(parents).where(eq(parents.email, email)).limit(1);
    if (!parent || !verifyPassword(password, parent.passwordHash)) {
      return json({ error: "Those workshop keys did not match." }, 401);
    }
    await createSession({ role: "parent", parentId: parent.id });
    await trackEvent({ eventType: "parent_login", role: "parent", parentId: parent.id });
    return json({ ok: true, next: "/parent/app" });
  }
  if (action === "login-admin") {
    const email = body.email?.trim().toLowerCase() || "";
    const password = body.password || "";
    const [admin] = await db.select().from(admins).where(eq(admins.email, email)).limit(1);
    if (!admin || !verifyPassword(password, admin.passwordHash)) {
      return json({ error: "Admin keys did not match." }, 401);
    }
    await createSession({ role: "admin", adminId: admin.id });
    await trackEvent({ eventType: "admin_login", role: "admin" });
    return json({ ok: true, next: "/admin/app" });
  }
  if (action === "login-kid") {
    const firstName = body.firstName?.trim() || "";
    const secretCode = body.secretCode?.trim().toUpperCase() || "";
    if (!firstName || !secretCode) return json({ error: "Enter your name and secret code." }, 400);
    const matches = await db.select().from(children);
    const child = matches.find(
      (row) =>
        row.firstName.toLowerCase() === firstName.toLowerCase() &&
        row.secretCode.toUpperCase() === secretCode,
    );
    if (!child) return json({ error: "We could not find that North Pole mailbox." }, 401);
    const subs = await db
      .select()
      .from(subscriptions)
      .where(and(eq(subscriptions.parentId, child.parentId)));
    if (!hasActiveSub(subs)) {
      return json({ error: "Ask a grown-up to open a workshop subscription first." }, 403);
    }
    await createSession({ role: "child", parentId: child.parentId, childId: child.id });
    await trackEvent({
      eventType: "kid_login",
      role: "child",
      parentId: child.parentId,
      childId: child.id,
    });
    const next = child.onboardingComplete ? "/kid/app" : "/kid/onboarding";
    return json({ ok: true, next });
  }
  return json({ error: "Unknown action" }, 400);
}
