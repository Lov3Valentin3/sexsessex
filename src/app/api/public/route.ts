import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { elves, musicTracks, quotes, siteSettings, tickets, wallDesigns } from "@/db/schema";
import { ELF_SEEDS } from "@/lib/elf-data";
import { PLANS } from "@/lib/plans";
import { boot, json, readJson, sendEmail } from "@/lib/http";
export const dynamic = "force-dynamic";
export async function GET(req: Request) {
  await boot();
  const resource = new URL(req.url).searchParams.get("resource") || "home";
  if (resource === "plans") return json({ plans: PLANS });
  try {
    if (resource === "elves") {
      const rows = await db.select().from(elves).where(eq(elves.active, true));
      return json({ elves: rows.length ? rows : ELF_SEEDS });
    }
    if (resource === "quotes") {
      const rows = await db.select().from(quotes).where(eq(quotes.active, true));
      return json({ quotes: rows });
    }
    if (resource === "walls") {
      const rows = await db.select().from(wallDesigns).where(eq(wallDesigns.active, true));
      return json({ walls: rows });
    }
    if (resource === "music") {
      const rows = await db.select().from(musicTracks);
      return json({ tracks: rows });
    }
    if (resource === "settings") {
      const rows = await db.select().from(siteSettings);
      const settings = Object.fromEntries(rows.map((row) => [row.key, row.value]));
      return json({ settings });
    }
    const [elfRows, quoteRows, wallRows, musicRows, settingRows] = await Promise.all([
      db.select().from(elves).where(eq(elves.active, true)),
      db.select().from(quotes).where(eq(quotes.active, true)),
      db.select().from(wallDesigns).where(eq(wallDesigns.active, true)),
      db.select().from(musicTracks),
      db.select().from(siteSettings),
    ]);
    return json({
      elves: elfRows,
      quotes: quoteRows,
      walls: wallRows,
      tracks: musicRows,
      settings: Object.fromEntries(settingRows.map((row) => [row.key, row.value])),
      plans: PLANS,
    });
  } catch {
    return json({ elves: ELF_SEEDS, quotes: [], walls: [], tracks: [], settings: {}, plans: PLANS });
  }
}
export async function POST(req: Request) {
  await boot();
  const body = await readJson<{
    email?: string;
    subject?: string;
    message?: string;
  }>(req);
  const email = body.email?.trim().toLowerCase() || "";
  const subject = body.subject?.trim() || "Workshop question";
  const message = body.message?.trim() || "";
  if (!email || !message) return json({ error: "Email and message are required." }, 400);
  const [ticket] = await db
    .insert(tickets)
    .values({ email, subject, message, status: "open" })
    .returning();
  await sendEmail(
    "admin@northpole.app",
    `New workshop mail: ${subject}`,
    `${email} wrote:\n\n${message}`,
  );
  return json({ ok: true, ticketId: ticket.id });
}
export async function PUT() {
  const latest = await db.select().from(quotes).orderBy(desc(quotes.createdAt)).limit(1);
  return json({ ok: true, latest });
}
