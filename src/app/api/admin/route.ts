import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  analyticsEvents,
  children,
  elves,
  letters,
  musicTracks,
  parents,
  quotes,
  siteSettings,
  subscriptions,
  ticketReplies,
  tickets,
  wallDesigns,
  type ElfAvatar,
} from "@/db/schema";
import { getSession, trackEvent } from "@/lib/auth";
import { boot, json, readJson, sendEmail } from "@/lib/http";
import { WALL_PATTERNS } from "@/lib/walls";
export const dynamic = "force-dynamic";
export async function GET() {
  await boot();
  const session = await getSession();
  if (!session?.adminId || session.role !== "admin") return json({ error: "Admin login required." }, 401);
  const [
    parentRows,
    childRows,
    letterRows,
    elfRows,
    quoteRows,
    wallRows,
    musicRows,
    ticketRows,
    replyRows,
    subRows,
    events,
    settingRows,
  ] = await Promise.all([
    db.select().from(parents),
    db.select().from(children),
    db.select().from(letters),
    db.select().from(elves),
    db.select().from(quotes),
    db.select().from(wallDesigns),
    db.select().from(musicTracks),
    db.select().from(tickets).orderBy(desc(tickets.createdAt)),
    db.select().from(ticketReplies),
    db.select().from(subscriptions),
    db.select().from(analyticsEvents).orderBy(desc(analyticsEvents.createdAt)).limit(120),
    db.select().from(siteSettings),
  ]);
  const popularElves = elfRows.map((elf) => ({
    id: elf.id,
    name: elf.name,
    fans: childRows.filter((child) => child.elfId === elf.id).length,
  }));
  const lettersByDay: Record<string, number> = {};
  for (const letter of letterRows) {
    const key = letter.createdAt.toISOString().slice(0, 10);
    lettersByDay[key] = (lettersByDay[key] || 0) + 1;
  }
  return json({
    stats: {
      parents: parentRows.length,
      children: childRows.length,
      letters: letterRows.length,
      openTickets: ticketRows.filter((t) => t.status === "open").length,
      activeSubscriptions: subRows.filter((s) => s.status === "active").length,
    },
    elves: elfRows,
    quotes: quoteRows,
    walls: wallRows,
    music: musicRows,
    tickets: ticketRows.map((ticket) => ({
      ...ticket,
      replies: replyRows.filter((reply) => reply.ticketId === ticket.id),
    })),
    subscriptions: subRows,
    children: childRows,
    parents: parentRows.map((p) => ({ id: p.id, email: p.email, name: p.name, replyMode: p.replyMode })),
    events,
    popularElves,
    lettersByDay,
    settings: Object.fromEntries(settingRows.map((row) => [row.key, row.value])),
    patterns: WALL_PATTERNS,
  });
}
export async function POST(req: Request) {
  await boot();
  const session = await getSession();
  if (!session?.adminId || session.role !== "admin") return json({ error: "Admin login required." }, 401);
  const body = await readJson<{
    action?: string;
    ticketId?: number;
    message?: string;
    id?: number;
    name?: string;
    gender?: string;
    bio?: string;
    personality?: string;
    hobbies?: string;
    christmasJob?: string;
    favoriteTreat?: string;
    funFact?: string;
    avatar?: ElfAvatar;
    text?: string;
    attribution?: string;
    pattern?: string;
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
    title?: string;
    url?: string;
    isDefault?: boolean;
    key?: string;
    value?: string;
    active?: boolean;
  }>(req);
  const action = body.action || "";
  if (action === "reply-ticket") {
    const ticketId = Number(body.ticketId);
    const message = body.message?.trim() || "";
    if (!ticketId || !message) return json({ error: "Reply cannot be empty." }, 400);
    const [ticket] = await db.select().from(tickets).where(eq(tickets.id, ticketId)).limit(1);
    if (!ticket) return json({ error: "Ticket not found." }, 404);
    await db.insert(ticketReplies).values({ ticketId, fromRole: "admin", message });
    await db.update(tickets).set({ status: "answered" }).where(eq(tickets.id, ticketId));
    await sendEmail(ticket.email, `Re: ${ticket.subject}`, message);
    await trackEvent({ eventType: "admin_ticket_reply", role: "admin" });
    return json({ ok: true });
  }
  if (action === "close-ticket") {
    await db.update(tickets).set({ status: "closed" }).where(eq(tickets.id, Number(body.ticketId)));
    return json({ ok: true });
  }
  if (action === "save-elf") {
    const avatar: ElfAvatar = body.avatar || {
      skin: "#f3c7a3",
      hat: "#c4122f",
      hair: "#3b2416",
      outfit: "#0f8a4b",
      accent: "#f0c75e",
      eye: "#2a1a12",
      accessory: "none",
    };
    const payload = {
      name: body.name?.trim() || "New Elf",
      gender: body.gender === "girl" ? "girl" : "boy",
      bio: body.bio?.trim() || "A brand-new friend from the workshop.",
      personality: body.personality?.trim() || "Kind and sparkly",
      hobbies: body.hobbies?.trim() || "Making toys",
      christmasJob: body.christmasJob?.trim() || "Helping Santa",
      favoriteTreat: body.favoriteTreat?.trim() || "Peppermint",
      funFact: body.funFact?.trim() || "Loves snow.",
      avatar,
      active: body.active !== false,
    };
    if (body.id) {
      await db.update(elves).set(payload).where(eq(elves.id, body.id));
    } else {
      await db.insert(elves).values(payload);
    }
    return json({ ok: true });
  }
  if (action === "save-quote") {
    if (body.id) {
      await db
        .update(quotes)
        .set({
          text: body.text?.trim() || "",
          attribution: body.attribution || "North Pole",
          active: body.active !== false,
        })
        .where(eq(quotes.id, body.id));
    } else {
      await db.insert(quotes).values({
        text: body.text?.trim() || "Believe.",
        attribution: body.attribution || "North Pole",
      });
    }
    return json({ ok: true });
  }
  if (action === "save-wall") {
    const payload = {
      name: body.name?.trim() || "New Wall",
      pattern: body.pattern || "solid",
      primaryColor: body.primaryColor || "#07040a",
      secondaryColor: body.secondaryColor || "#3dff8a",
      accentColor: body.accentColor || "#c4122f",
      active: body.active !== false,
    };
    if (body.id) {
      await db.update(wallDesigns).set(payload).where(eq(wallDesigns.id, body.id));
    } else {
      await db.insert(wallDesigns).values(payload);
    }
    return json({ ok: true });
  }
  if (action === "save-music") {
    if (body.isDefault) {
      await db.update(musicTracks).set({ isDefault: false });
    }
    const payload = {
      title: body.title?.trim() || "Untitled carol",
      url: body.url?.trim() || "builtin:jingle",
      isDefault: Boolean(body.isDefault),
    };
    if (body.id) {
      await db.update(musicTracks).set(payload).where(eq(musicTracks.id, body.id));
    } else {
      await db.insert(musicTracks).values(payload);
    }
    return json({ ok: true });
  }
  if (action === "save-setting") {
    const key = body.key?.trim() || "";
    const value = body.value ?? "";
    if (!key) return json({ error: "Missing setting key." }, 400);
    await db
      .insert(siteSettings)
      .values({ key, value })
      .onConflictDoUpdate({ target: siteSettings.key, set: { value } });
    return json({ ok: true });
  }
  if (action === "toggle-quote") {
    const [row] = await db.select().from(quotes).where(eq(quotes.id, Number(body.id))).limit(1);
    if (row) await db.update(quotes).set({ active: !row.active }).where(eq(quotes.id, row.id));
    return json({ ok: true });
  }
  return json({ error: "Unknown action", hint: sql`select 1`.queryChunks.length }, 400);
}
