inport { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  children,
  elves,
  letters,
  notifications,
  parents,
  subscriptions,
  ticketReplies,
  tickets,
} from "@/db/schema";
import { festiveCode, getSession, trackEvent } from "@/lib/auth";
import { boot, json, readJson, sendEmail } from "@/lib/http";
import { expiresFromPeriod, getPlan } from "@/lib/plans";
export const dynamic = "force-dynamic";
function activeSub(rows: { status: string; expiresAt: Date | null; childLimit: number; planCode: string }[]) {
  const now = Date.now();
  return rows.find((row) => row.status === "active" && (!row.expiresAt || row.expiresAt.getTime() > now)) ?? null;
}
export async function GET() {
  await boot();
  const session = await getSession();
  if (!session?.parentId || session.role !== "parent") return json({ error: "Please log in as a parent." }, 401);
  const [parent] = await db.select().from(parents).where(eq(parents.id, session.parentId)).limit(1);
  if (!parent) return json({ error: "Parent not found." }, 404);
  const [kids, elfRows, subs, notes, parentTickets] = await Promise.all([
    db.select().from(children).where(eq(children.parentId, parent.id)),
    db.select().from(elves),
    db.select().from(subscriptions).where(eq(subscriptions.parentId, parent.id)),
    db
      .select()
      .from(notifications)
      .where(eq(notifications.parentId, parent.id))
      .orderBy(desc(notifications.createdAt)),
    db.select().from(tickets).where(eq(tickets.parentId, parent.id)).orderBy(desc(tickets.createdAt)),
  ]);
  const kidIds = kids.map((k) => k.id);
  const allLetters =
    kidIds.length === 0
      ? []
      : await db.select().from(letters).orderBy(desc(letters.createdAt));
  const familyLetters = allLetters.filter((letter) => kidIds.includes(letter.childId));
  const replies =
    parentTickets.length === 0
      ? []
      : await db.select().from(ticketReplies);
  return json({
    parent: {
      id: parent.id,
      email: parent.email,
      name: parent.name,
      replyMode: parent.replyMode,
    },
    children: kids.map((kid) => ({
      ...kid,
      elf: elfRows.find((elf) => elf.id === kid.elfId) ?? null,
    })),
    elves: elfRows.filter((elf) => elf.active),
    letters: familyLetters,
    notifications: notes,
    subscription: activeSub(subs),
    subscriptions: subs,
    tickets: parentTickets.map((ticket) => ({
      ...ticket,
      replies: replies.filter((reply) => reply.ticketId === ticket.id),
    })),
  });
}
export async function POST(req: Request) {
  await boot();
  const session = await getSession();
  if (!session?.parentId || session.role !== "parent") return json({ error: "Please log in as a parent." }, 401);
  const parentId = session.parentId;
  const body = await readJson<{
    action?: string;
    firstName?: string;
    age?: number;
    childId?: number;
    replyMode?: string;
    planCode?: string;
    letterId?: number;
    body?: string;
    subject?: string;
    message?: string;
    birthday?: string;
  }>(req);
  const action = body.action || "";
  if (action === "add-child") {
    const subs = await db.select().from(subscriptions).where(eq(subscriptions.parentId, parentId));
    const sub = activeSub(subs);
    if (!sub) return json({ error: "Choose a subscription before adding children." }, 403);
    const kids = await db.select().from(children).where(eq(children.parentId, parentId));
    if (kids.length >= sub.childLimit) {
      return json({ error: "This plan is full. Upgrade to add more children." }, 403);
    }
    const firstName = body.firstName?.trim() || "";
    if (!firstName) return json({ error: "A first name is required." }, 400);
    const [kid] = await db
      .insert(children)
      .values({
        parentId,
        firstName,
        age: body.age ? Number(body.age) : null,
        secretCode: festiveCode(),
        onboardingComplete: false,
      })
      .returning();
    await trackEvent({ eventType: "child_added", role: "parent", parentId, childId: kid.id });
    return json({ ok: true, child: kid });
  }
  if (action === "update-reply-mode") {
    const replyMode = body.replyMode === "parent" ? "parent" : "ai";
    await db.update(parents).set({ replyMode }).where(eq(parents.id, parentId));
    return json({ ok: true, replyMode });
  }
  if (action === "subscribe") {
    const plan = getPlan(body.planCode || "");
    if (!plan) return json({ error: "Unknown plan." }, 400);
    await db
      .update(subscriptions)
      .set({ status: "canceled" })
      .where(and(eq(subscriptions.parentId, parentId), eq(subscriptions.status, "active")));
    const [sub] = await db
      .insert(subscriptions)
      .values({
        parentId,
        planCode: plan.code,
        status: "active",
        childLimit: plan.childLimit,
        period: plan.period,
        amountCents: plan.priceCents,
        expiresAt: expiresFromPeriod(plan.period),
      })
      .returning();
    await trackEvent({
      eventType: "subscribe",
      role: "parent",
      parentId,
      metadata: { plan: plan.code },
    });
    const [parent] = await db.select().from(parents).where(eq(parents.id, parentId)).limit(1);
    if (parent) {
      await sendEmail(
        parent.email,
        "Your North Pole subscription is glowing",
        `Welcome to ${plan.name}. Your children can now log in with their secret codes.`,
      );
    }
    return json({ ok: true, subscription: sub });
  }
  if (action === "reply-as-elf") {
    const childId = Number(body.childId);
    const text = body.body?.trim() || "";
    if (!childId || !text) return json({ error: "Letter is empty." }, 400);
    const [kid] = await db
      .select()
      .from(children)
      .where(and(eq(children.id, childId), eq(children.parentId, parentId)))
      .limit(1);
    if (!kid) return json({ error: "Child not found." }, 404);
    await db.insert(letters).values({
      childId: kid.id,
      elfId: kid.elfId,
      fromRole: "elf",
      body: text,
    });
    await db.insert(notifications).values({
      parentId,
      childId: kid.id,
      type: "letter",
      message: `${kid.firstName} received a letter from their elf (sent by you).`,
    });
    return json({ ok: true });
  }
  if (action === "mark-read") {
    await db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.parentId, parentId));
    return json({ ok: true });
  }
  if (action === "support") {
    const message = body.message?.trim() || "";
    const subject = body.subject?.trim() || "Parent question";
    if (!message) return json({ error: "Please write a message." }, 400);
    const [parent] = await db.select().from(parents).where(eq(parents.id, parentId)).limit(1);
    const [ticket] = await db
      .insert(tickets)
      .values({
        parentId,
        email: parent?.email || "unknown@northpole.app",
        subject,
        message,
        status: "open",
      })
      .returning();
    return json({ ok: true, ticket });
  }
  if (action === "update-child") {
    const childId = Number(body.childId);
    const [kid] = await db
      .select()
      .from(children)
      .where(and(eq(children.id, childId), eq(children.parentId, parentId)))
      .limit(1);
    if (!kid) return json({ error: "Child not found." }, 404);
    await db
      .update(children)
      .set({
        firstName: body.firstName?.trim() || kid.firstName,
        age: body.age ? Number(body.age) : kid.age,
        birthday: body.birthday ?? kid.birthday,
      })
      .where(eq(children.id, kid.id));
    return json({ ok: true });
  }
  return json({ error: "Unknown action" }, 400);
}