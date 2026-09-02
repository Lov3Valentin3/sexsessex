import { eq } from "drizzle-orm";
import { db } from "@/db";
import {
  admins,
  children,
  elves,
  letters,
  musicTracks,
  notifications,
  parents,
  quotes,
  siteSettings,
  subscriptions,
  tickets,
  wallDesigns,
} from "@/db/schema";
import { hashPassword } from "@/lib/auth";
import { ELF_SEEDS } from "@/lib/elf-data";
import { DEFAULT_QUOTES } from "@/lib/ai";
import { DEFAULT_WALLS } from "@/lib/walls";
let seedPromise: Promise<void> | null = null;
async function seed() {
  const existingElves = await db.select({ id: elves.id }).from(elves).limit(1);
  if (existingElves.length === 0) {
    await db.insert(elves).values(ELF_SEEDS);
    await db.insert(quotes).values(DEFAULT_QUOTES);
    await db.insert(wallDesigns).values(DEFAULT_WALLS);
    await db.insert(musicTracks).values([
      {
        title: "Workshop Bells (built-in)",
        url: "builtin:jingle",
        isDefault: true,
      },
      {
        title: "Aurora Lullaby (built-in)",
        url: "builtin:aurora",
        isDefault: false,
      },
    ]);
    await db.insert(siteSettings).values([
      { key: "kid_login_wall_id", value: "1" },
      { key: "site_name", value: "North Pole Pen Pals" },
    ]);
  }
  const existingAdmin = await db
    .select({ id: admins.id })
    .from(admins)
    .where(eq(admins.email, "admin@northpole.app"))
    .limit(1);
  if (existingAdmin.length === 0) {
    await db.insert(admins).values({
      email: "admin@northpole.app",
      passwordHash: hashPassword("MagicAdmin2026!"),
      name: "Workshop Admin",
    });
  }
  const existingParent = await db
    .select({ id: parents.id })
    .from(parents)
    .where(eq(parents.email, "parent@northpole.app"))
    .limit(1);
  if (existingParent.length === 0) {
    const [parent] = await db
      .insert(parents)
      .values({
        email: "parent@northpole.app",
        passwordHash: hashPassword("ChristmasMagic!"),
        name: "Alex Holiday",
        replyMode: "ai",
      })
      .returning();
    const allElves = await db.select().from(elves);
    const holly = allElves.find((e) => e.name === "Holly") ?? allElves[10];
    const walls = await db.select().from(wallDesigns);
    const wall = walls[0];
    await db.insert(subscriptions).values({
      parentId: parent.id,
      planCode: "family_annual",
      status: "active",
      childLimit: 12,
      period: "annual",
      amountCents: 17900,
      expiresAt: new Date(new Date().getFullYear() + 1, 11, 26),
    });
    const [emma] = await db
      .insert(children)
      .values({
        parentId: parent.id,
        firstName: "Emma",
        age: 7,
        favoriteColor: "emerald green",
        favoriteActivity: "decorating cookies",
        birthday: "12-20",
        secretCode: "SNOWFLAKE",
        elfId: holly?.id ?? null,
        wallDesignId: wall?.id ?? null,
        bubbleColor: "#c4122f",
        bubbleShape: "cloud",
        onboardingComplete: true,
        christmasWish: "a sled and extra kindness for everyone",
        insideJokes: "the marshmallow that tried to escape the cocoa",
      })
      .returning();
    await db.insert(letters).values([
      {
        childId: emma.id,
        elfId: holly?.id ?? null,
        fromRole: "elf",
        body: `Dear Emma,\n\nWelcome to the North Pole post! I am Holly, and I already braided a tiny green ribbon with your name on it. The reindeer say hello (Dasher tried to eat the ribbon—rude).\n\nI heard you love decorating cookies and the color emerald green. Tonight I painted a cookie with the same glow as the aurora just for you.\n\nWrite to me anytime. Your letters keep our workshop lights extra bright.\n\nHugs and holly,\nHolly`,
        bubbleColor: "#15803d",
        bubbleShape: "round",
      },
      {
        childId: emma.id,
        elfId: holly?.id ?? null,
        fromRole: "child",
        body: "Hi Holly! I am Emma. I like green and decorating cookies with my dad. Do the reindeer like cookies too?",
        bubbleColor: "#c4122f",
        bubbleShape: "cloud",
      },
      {
        childId: emma.id,
        elfId: holly?.id ?? null,
        fromRole: "elf",
        body: `Dear Emma,\n\nThe reindeer LOVE cookies—especially the ones with gumdrop buttons. Comet pretends to be picky, but I have seen him nibble a candy cane like a flute.\n\nTell your dad the North Pole approves of cookie teamwork. If you ever invent a new frosting swirl, I want the secret recipe.\n\nYour friend,\nHolly`,
        bubbleColor: "#15803d",
        bubbleShape: "round",
      },
    ]);
    await db.insert(notifications).values({
      parentId: parent.id,
      childId: emma.id,
      type: "letter",
      message: "Emma received a new letter from Holly.",
    });
    await db.insert(tickets).values({
      email: "parent@northpole.app",
      parentId: parent.id,
      subject: "Is the demo working?",
      message: "Just checking that workshop support can see family questions.",
      status: "open",
    });
  }
}
export function ensureSeeded() {
  if (!seedPromise) {
    seedPromise = seed().catch((error) => {
      seedPromise = null;
      throw error;
    });
  }
  return seedPromise;
}
