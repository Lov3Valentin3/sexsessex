import type { ElfAvatar } from "@/db/schema";
export type ElfVoice = {
  name: string;
  personality: string;
  hobbies: string;
  christmasJob: string;
  favoriteTreat: string;
  funFact: string;
  bio: string;
  avatar?: ElfAvatar;
};
export type ChildMemory = {
  firstName: string;
  age?: number | null;
  favoriteColor?: string | null;
  favoriteActivity?: string | null;
  birthday?: string | null;
  christmasWish?: string | null;
  insideJokes?: string | null;
};
export type HistoryLetter = {
  fromRole: string;
  body: string;
};
function ageBand(age?: number | null) {
  if (!age || age <= 5) return "little";
  if (age <= 8) return "middle";
  return "big";
}
function birthdaySoon(birthday?: string | null) {
  if (!birthday) return false;
  const now = new Date();
  const parts = birthday.split("-");
  if (parts.length < 2) return false;
  const month = Number(parts[parts.length === 3 ? 1 : 0]);
  const day = Number(parts[parts.length === 3 ? 2 : 1]);
  if (!month || !day) return false;
  return now.getMonth() + 1 === month && Math.abs(now.getDate() - day) <= 3;
}
function pick<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)];
}
function simplify(text: string, band: string) {
  if (band !== "little") return text;
  return text
    .replaceAll("wonderful", "great")
    .replaceAll("magnificent", "super")
    .replaceAll("imagination", "big ideas");
}
export function localElfReply(input: {
  elf: ElfVoice;
  child: ChildMemory;
  letter: string;
  history: HistoryLetter[];
}) {
  const { elf, child, letter } = input;
  const band = ageBand(child.age);
  const name = child.firstName || "friend";
  const color = child.favoriteColor || "sparkly gold";
  const activity = child.favoriteActivity || "making Christmas magic";
  const wish = child.christmasWish;
  const joke = child.insideJokes;
  const lower = letter.toLowerCase();
  const snippets: string[] = [];
  if (lower.includes("reindeer") || lower.includes("rudolph")) {
    snippets.push(`The reindeer heard you mention them and did a happy little hoof-tap. ${elf.name} even saved them an extra carrot.`);
  }
  if (lower.includes("cookie") || lower.includes("bake")) {
    snippets.push(`Your cookie talk made the whole kitchen smell like cinnamon. ${elf.name} may have taste-tested one. Or four.`);
  }
  if (lower.includes("sad") || lower.includes("scared") || lower.includes("lonely")) {
    snippets.push(`If today felt a little stormy, imagine ${elf.name} wrapping a warm scarf of starlight around your shoulders. You are never alone.`);
  }
  if (lower.includes("wish") || lower.includes("want") || lower.includes("santa")) {
    snippets.push(`Clara helped file your hopes near the top of the nice-and-kind list. Wishes grown with kindness glow the brightest.`);
  }
  if (lower.includes("draw") || lower.includes("picture") || lower.includes("color")) {
    snippets.push(`A ${color} crayon just rolled across the workshop table as if it heard you. Art is a letter that sparkles.`);
  }
  if (birthdaySoon(child.birthday)) {
    snippets.push(`Pssst… the workshop bells have been practicing a birthday song with your name in it, ${name}.`);
  }
  const prevChild = input.history.filter((h) => h.fromRole === "child").slice(-2);
  if (prevChild.length) {
    snippets.push(`I still remember what you wrote before, and it made my hat-bell tingle all over again.`);
  }
  const openers = [
    `Dear ${name},`,
    `Snowy hello, ${name}!`,
    `${name}! Your letter landed right on my workbench.`,
    `To my favorite pen pal ${name},`,
  ];
  const middles = [
    `Life up here is extra ${elf.personality.split(",")[0].toLowerCase()} today. My job is ${elf.christmasJob.toLowerCase()}, and I thought of you the whole time.`,
    `I squeezed in a bit of ${elf.hobbies.split(",")[0].toLowerCase()} after work and pretended you were right beside me.`,
    `A snowflake landed on my nose while I read your words. It tasted like ${elf.favoriteTreat.toLowerCase()}—or maybe I was just hungry.`,
  ];
  const personal = [
    `How is ${activity} going? I bet it looks amazing in ${color}.`,
    `If I painted a toy just for you, it would definitely be ${color} and excellent at ${activity}.`,
    `Whenever I see something ${color}, I whisper, “That’s a ${name} color!”`,
  ];
  const closers = [
    `Write again soon—your letters keep the Northern Lights extra bright.\nHugs and holly,\n${elf.name}`,
    `I’m already saving a peppermint for your next envelope.\nYour friend at the North Pole,\n${elf.name}`,
    `Keep believing. The impossible is just a snowball’s toss away.\nJingle-hugs,\n${elf.name}`,
  ];
  const fun = `Fun fact from me: ${elf.funFact}`;
  const wishLine = wish ? `I’m still cheering for your Christmas wish: ${wish}.` : "";
  const jokeLine = joke ? `Inside joke status: ${joke} — still hilarious.` : "";
  const body = [
    pick(openers),
    "",
    pick(middles),
    pick(personal),
    snippets[0] ?? `Your letter was full of ${band === "little" ? "happy sparkles" : "wonder"}. I read it twice (okay, three times).`,
    snippets[1] ?? "",
    wishLine,
    jokeLine,
    fun,
    "",
    pick(closers),
  ]
    .filter(Boolean)
    .join("\n");
  if (band === "little") {
    return simplify(
      `Hi ${name}!\n\nI got your letter! It made me smile so big.\nI love ${activity}. My favorite color today is ${color} too.\nI had ${elf.favoriteTreat.toLowerCase()} and thought of you.\nYou are a great friend.\n\nLove,\n${elf.name}\n`,
      band,
    );
  }
  return body;
}
export async function generateElfReply(input: {
  elf: ElfVoice;
  child: ChildMemory;
  letter: string;
  history: HistoryLetter[];
}) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return localElfReply(input);
  const historyText = input.history
    .slice(-8)
    .map((h) => `${h.fromRole}: ${h.body}`)
    .join("\n");
  const system = `You are ${input.elf.name}, an elf living at Santa's North Pole workshop. Never break character. Never mention being an AI.
Personality: ${input.elf.personality}
Bio: ${input.elf.bio}
Hobbies: ${input.elf.hobbies}
Christmas job: ${input.elf.christmasJob}
Favorite treat: ${input.elf.favoriteTreat}
Fun fact: ${input.elf.funFact}
Write a warm pen-pal letter to a child. Be personalized, friendly, encouraging, funny, imaginative, and age-appropriate.
Use the child's name naturally. Remember favorite things, previous letters, inside jokes, birthdays, and Christmas wishes when provided.
Keep it under 220 words. Sign as ${input.elf.name}. No scary content. No asking for addresses, last names, school names, or personal data.`;
  const user = `Child name: ${input.child.firstName}
Age: ${input.child.age ?? "unknown"}
Favorite color: ${input.child.favoriteColor ?? "unknown"}
Favorite Christmas activity: ${input.child.favoriteActivity ?? "unknown"}
Birthday: ${input.child.birthday ?? "unknown"}
Christmas wish: ${input.child.christmasWish ?? "unknown"}
Inside jokes: ${input.child.insideJokes ?? "none yet"}
Previous letters:
${historyText || "(none yet)"}
Latest letter from the child:
${input.letter}`;
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        temperature: 0.9,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });
    if (!res.ok) return localElfReply(input);
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = data.choices?.[0]?.message?.content?.trim();
    return content || localElfReply(input);
  } catch {
    return localElfReply(input);
  }
}
export const DEFAULT_QUOTES = [
  { text: "Kindness is Christmas magic.", attribution: "Santa’s Workshop" },
  { text: "Believe in the impossible.", attribution: "The North Pole" },
  { text: "Every act of kindness helps Santa.", attribution: "Holly the Elf" },
  { text: "A letter is a hug that can travel through snow.", attribution: "Jingle" },
  { text: "The best presents are the ones you wrap in love.", attribution: "Mrs. Claus" },
  { text: "Shine like a tree full of lights.", attribution: "Twinkle" },
  { text: "Friends make ordinary days sparkle.", attribution: "Cocoa" },
  { text: "Courage is just a jingle bell away.", attribution: "Ruby" },
  { text: "Share your cocoa. Share your joy.", attribution: "Biscuit" },
  { text: "Even the tiniest snowflake changes the sky.", attribution: "Snowflake" },
  { text: "Hope is a lantern that never blows out.", attribution: "Ember" },
  { text: "Today is a wonderful day to be gentle.", attribution: "Belle" },
];