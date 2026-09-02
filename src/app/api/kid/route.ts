import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  children,
  elves,
  letters,
  musicTracks,
  notifications,
  parents,
  quotes,
  subscriptions,
  wallDesigns,
} from "@/db/schema";
import { generateElfReply } from "@/lib/ai";
import { getSession, trackEvent } from "@/lib/auth";
import { boot, json, readJson, sendEmail } from "@/lib/http";
export const dynamic = "force-dynamic";
function activeSub(rows: { status: string; expiresAt: Date | null }[]) {
  const now = Date.now();
  return rows.some((row) => row.status === "active" && (!row.expiresAt || row.expiresAt.getTime() > now));
}
export async function GET() {
  await boot();
  const session = await getSession();
  if (!session?.childId || session.role !== "child") return json({ error: "Please log in with your secret code." }, 401);
  const [child] = await db.select().from(children).where(eq(children.id, session.childId)).limit(1);
  if (!child) return json({ error: "Child not found." }, 404);
  const [elf, walls, tracks, quoteRows, letterRows] = await Promise.all([
    child.elfId
      ? db.select().from(elves).where(eq(elves.id, child.elfId)).then((rows) => rows[0] ?? null)
      : Promise.resolve(null),
    db.select().from(wallDesigns).where(eq(wallDesigns.active, true)),
    db.select().from(musicTracks),
    db.select().from(quotes).where(eq(quotes.active, true)),
    db.select().from(letters).where(eq(letters.childId, child.id)).orderBy(desc(letters.createdAt)),
  ]);
  const unread = letterRows.filter((letter) => letter.fromRole === "elf" && !letter.readAt);
  if (unread.length) {
    await db
      .update(letters)
      .set({ readAt: new Date() })
      .where(and(eq(letters.childId, child.id), eq(letters.fromRole, "elf")));
  }
  const dayIndex = Math.floor(Date.now() / 86400000);
  const quote = quoteRows.length ? quoteRows[dayIndex % quoteRows.length] : null;
  const defaultTrack = tracks.find((track) => track.isDefault) ?? tracks[0] ?? null;
  return json({
    child,
    elf,
    elves: await db.select().from(elves).where(eq(elves.active, true)),
    letters: letterRows,
    walls,
    quote,
    music: defaultTrack,
  });
}
export async function POST(req: Request) {
  await boot();
  const session = await getSession();
  if (!session?.childId || session.role !== "child") return json({ error: "Please log in with your secret code." }, 401);
  const childId = session.childId;
  const [child] = await db.select().from(children).where(eq(children.id, childId)).limit(1);
  if (!child) return json({ error: "Child not found." }, 404);
  const body = await readJson<{
    action?: string;
    firstName?: string;
    age?: number;
    favoriteColor?: string;
    favoriteActivity?: string;
    birthday?: string;
    christmasWish?: string;
    elfId?: number;
    wallDesignId?: number;
    bubbleColor?: string;
    bubbleShape?: string;
    body?: string;
    insideJokes?: string;
  }>(req);
  const action = body.action || "";
  if (action === "onboard") {
    const firstName = body.firstName?.trim() || child.firstName;
    const age = body.age ? Number(body.age) : child.age;
    await db
      .update(children)
      .set({
        firstName,
        age,
        favoriteColor: body.favoriteColor?.trim() || child.favoriteColor,
        favoriteActivity: body.favoriteActivity?.trim() || child.favoriteActivity,
        birthday: body.birthday || child.birthday,
        christmasWish: body.christmasWish || child.christmasWish,
      })
      .where(eq(children.id, childId));
    return json({ ok: true, next: "elf" });
  }
  if (action === "choose-elf") {
    const elfId = Number(body.elfId);
    const [elf] = await db.select().from(elves).where(eq(elves.id, elfId)).limit(1);
    if (!elf) return json({ error: "That elf is wrapping presents right now." }, 404);
    await db
      .update(children)
      .set({ elfId: elf.id, onboardingComplete: true })
      .where(eq(children.id, childId));
    await db.insert(letters).values({
      childId,
      elfId: elf.id,
      fromRole: "elf",
      body: `Dear ${child.firstName || "friend"},\n\nIt is me, ${elf.name}! I picked your letter out of a swirl of snow and I am so happy we get to be pen pals. I ${elf.hobbies.split(",")[0].toLowerCase()} and my job is this: ${elf.christmasJob}.\n\nTell me your favorite things and I will remember them forever (or at least until next Christmas, which is also forever in elf years).\n\nYour new friend,\n${elf.name}`,
      bubbleColor: elf.avatar.outfit,
      bubbleShape: "round",
    });
    await trackEvent({
      eventType: "elf_chosen",
      role: "child",
      parentId: child.parentId,
      childId,
      metadata: { elf: elf.name },
    });
    return json({ ok: true, next: "/kid/app" });
  }
  if (action === "update-style") {
    await db
      .update(children)
      .set({
        wallDesignId: body.wallDesignId ? Number(body.wallDesignId) : child.wallDesignId,
        bubbleColor: body.bubbleColor || child.bubbleColor,
        bubbleShape: body.bubbleShape || child.bubbleShape,
      })
      .where(eq(children.id, childId));
    return json({ ok: true });
  }
  if (action === "send-letter") {
    const text = body.body?.trim() || "";
    if (!text) return json({ error: "Your letter needs a few words, superstar." }, 400);
    const subs = await db.select().from(subscriptions).where(eq(subscriptions.parentId, child.parentId));
    if (!activeSub(subs)) return json({ error: "The workshop pass needs a grown-up refresh." }, 403);
    if (!child.elfId) return json({ error: "Choose your elf friend first." }, 400);
    await db.insert(letters).values({
      childId,
      elfId: child.elfId,
      fromRole: "child",
      body: text,
      bubbleColor: child.bubbleColor,
      bubbleShape: child.bubbleShape,
    });
    const [parent] = await db.select().from(parents).where(eq(parents.id, child.parentId)).limit(1);
    await db.insert(notifications).values({
      parentId: child.parentId,
      childId,
      type: "letter",
      message: `${child.firstName} sent a letter to their elf.`,
    });
    if (parent) {
      await sendEmail(
        parent.email,
        `${child.firstName} sent North Pole mail`,
        `${child.firstName} wrote a new letter. Open your parent dashboard to read it.`,
      );
    }
    if (parent?.replyMode !== "parent") {
      const [elf] = await db.select().from(elves).where(eq(elves.id, child.elfId)).limit(1);
      const history = await db
        .select()
        .from(letters)
        .where(eq(letters.childId, childId))
        .orderBy(desc(letters.createdAt));
      if (elf) {
        const reply = await generateElfReply({
          elf,
          child,
          letter: text,
          history: history.map((row) => ({ fromRole: row.fromRole, body: row.body })),
        });
        await db.insert(letters).values({
          childId,
          elfId: elf.id,
          fromRole: "elf",
          body: reply,
          bubbleColor: elf.avatar.accent,
          bubbleShape: "round",
        });
        await db.insert(notifications).values({
          parentId: child.parentId,
          childId,
          type: "letter",
          message: `${child.firstName} received a new letter from ${elf.name}.`,
        });
        if (parent) {
          await sendEmail(
            parent.email,
            `New elf letter for ${child.firstName}`,
            `${elf.name} wrote back to ${child.firstName}.`,
          );
        }
      }
    }
    await trackEvent({
      eventType: "letter_sent",
      role: "child",
      parentId: child.parentId,
      childId,
    });
    return json({ ok: true });
  }
  return json({ error: "Unknown action" }, 400);
}
