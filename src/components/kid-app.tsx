"use client";
import { useEffect, useMemo, useState } from "react";
import { ElfAvatar } from "@/components/elf-avatar";
import { Countdown, LetterBubble } from "@/components/magic";
import { api, when } from "@/lib/client-api";
import { BUBBLE_COLORS, BUBBLE_SHAPES, wallStyle, type WallLike } from "@/lib/walls";
import type { ElfAvatar as Avatar } from "@/db/schema";
type Elf = {
  id: number;
  name: string;
  gender: string;
  bio: string;
  personality: string;
  hobbies: string;
  christmasJob: string;
  favoriteTreat: string;
  funFact: string;
  avatar: Avatar;
};
type Wall = WallLike & { id: number; name: string };
type Letter = {
  id: number;
  fromRole: string;
  body: string;
  bubbleColor: string | null;
  bubbleShape: string | null;
  createdAt: string;
};
type Child = {
  id: number;
  firstName: string;
  age: number | null;
  favoriteColor: string | null;
  favoriteActivity: string | null;
  wallDesignId: number | null;
  bubbleColor: string | null;
  bubbleShape: string | null;
  onboardingComplete: boolean;
  christmasWish: string | null;
};
type Payload = {
  child: Child;
  elf: Elf | null;
  elves: Elf[];
  letters: Letter[];
  walls: Wall[];
  quote: { text: string; attribution: string | null } | null;
};
const stickers = ["🎄", "❄️", "🎁", "🦌", "⭐", "❤️", "🍪", "🎅", "🔔", "⛄", "✨", "🛷"];
export function KidApp() {
  const [data, setData] = useState<Payload | null>(null);
  const [tab, setTab] = useState<"home" | "write" | "inbox" | "elf" | "walls">("home");
  const [letter, setLetter] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  async function load() {
    const payload = await api<Payload>("/api/kid");
    setData(payload);
  }
  useEffect(() => {
    load().catch((err) => setError(err instanceof Error ? err.message : "Could not load."));
  }, []);
  const wall = useMemo(() => {
    if (!data) return null;
    return data.walls.find((item) => item.id === data.child.wallDesignId) ?? data.walls[0] ?? null;
  }, [data]);
  if (error) {
    return (
      <main className="px-4 py-20 text-center">
        <p>{error}</p>
        <a className="magic-btn mt-4 inline-flex" href="/kid/login">
          Kid login
        </a>
      </main>
    );
  }
  if (!data) return <main className="px-4 py-20 text-center text-2xl">Shaking the snow globe…</main>;
  const { child, elf, quote } = data;
  return (
    <main className="min-h-screen pb-24" style={wall ? wallStyle(wall) : undefined}>
      <div className="mx-auto w-full max-w-5xl px-4 pt-12">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-script text-3xl text-np-green">Hello, {child.firstName}!</p>
            <h1 className="font-display text-3xl text-np-cream">Your North Pole mailbox</h1>
          </div>
          <button
            className="magic-btn ghost text-sm"
            onClick={async () => {
              await api("/api/auth", { action: "logout" });
              window.location.href = "/";
            }}
          >
            Log out
          </button>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {(["home", "write", "inbox", "elf", "walls"] as const).map((item) => (
            <button
              key={item}
              className="tab-btn rounded-full border border-np-gold/40 bg-black/40 px-4 py-2 font-extrabold capitalize"
              data-active={tab === item}
              onClick={() => setTab(item)}
            >
              {item}
            </button>
          ))}
        </div>
        {tab === "home" ? (
          <section className="mt-6 grid gap-4 md:grid-cols-2">
            <article className="panel gold-border p-5">
              <p className="text-xs uppercase tracking-widest text-np-gold">Countdown to Christmas</p>
              <div className="mt-3">
                <Countdown />
              </div>
            </article>
            <article className="panel gold-border overflow-x-auto p-4">
              <p className="text-xs uppercase tracking-widest text-np-gold">Countdown to Christmas</p>
              <div className="mt-3">
                <Countdown />
              </div>
            </article>
            <article className="panel gold-border p-5 md:col-span-2">
              {elf ? (
                <div className="flex flex-wrap items-center gap-4">
                  <ElfAvatar avatar={elf.avatar} name={elf.name} size={110} />
                  <div>
                    <h2 className="font-display text-2xl text-np-gold">{elf.name} is waiting</h2>
                    <p className="text-sm text-np-cream/80">{elf.bio}</p>
                    <button className="magic-btn mt-4" onClick={() => setTab("write")}>
                      Send a letter
                    </button>
                  </div>
                </div>
              ) : (
                <a href="/kid/onboarding" className="magic-btn">
                  Choose your elf friend
                </a>
              )}
            </article>
          </section>
        ) : null}
        {tab === "write" ? (
          <section className="mt-6 grid gap-4 lg:grid-cols-2">
            <form
              className="panel gold-border p-5"
              onSubmit={async (e) => {
                e.preventDefault();
                setSending(true);
                try {
                  await api("/api/kid", { action: "send-letter", body: letter });
                  setLetter("");
                  await load();
                  setTab("inbox");
                } catch (err) {
                  setError(err instanceof Error ? err.message : "Could not send.");
                } finally {
                  setSending(false);
                }
              }}
            >
              <h2 className="font-display text-2xl text-np-gold">Dear {elf?.name ?? "Elf"},</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {stickers.map((sticker) => (
                  <button key={sticker} type="button" className="text-2xl" onClick={() => setLetter((v) => v + sticker)}>
                    {sticker}
                  </button>
                ))}
              </div>
              <textarea
                className="lined-paper mt-3 min-h-52 w-full rounded-2xl p-4 text-lg"
                value={letter}
                onChange={(e) => setLetter(e.target.value)}
                required
              />
              <div className="mt-3 flex flex-wrap gap-2">
                {BUBBLE_COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    className="h-8 w-8 rounded-full border border-white/40"
                    style={{ background: color.value }}
                    onClick={() => api("/api/kid", { action: "update-style", bubbleColor: color.value }).then(load)}
                    aria-label={color.name}
                  />
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {BUBBLE_SHAPES.map((shape) => (
                  <button
                    key={shape}
                    type="button"
                    className="rounded-full border border-np-gold/40 px-3 py-1 text-xs font-bold capitalize"
                    onClick={() => api("/api/kid", { action: "update-style", bubbleShape: shape }).then(load)}
                  >
                    {shape}
                  </button>
                ))}
              </div>
              <button className="magic-btn mt-4 w-full" disabled={sending}>
                {sending ? "Flying to the North Pole…" : "Send letter"}
              </button>
            </form>
            <div>
              <p className="mb-2 text-sm font-bold">Bubble preview</p>
              <LetterBubble
                body={letter || "Your letter will look like this!"}
                from={child.firstName}
                color={child.bubbleColor}
                shape={child.bubbleShape}
              />
            </div>
          </section>
        ) : null}
        {tab === "inbox" ? (
          <section className="mt-6 grid gap-3">
            {data.letters.map((item) => (
              <LetterBubble
                key={item.id}
                body={item.body}
                from={item.fromRole === "child" ? child.firstName : elf?.name || "Elf"}
                color={item.bubbleColor}
                shape={item.bubbleShape}
                at={when(item.createdAt)}
              />
            ))}
          </section>
        ) : null}
        {tab === "elf" && elf ? (
          <section className="panel gold-border mt-6 p-6">
            <ElfAvatar avatar={elf.avatar} name={elf.name} size={140} />
            <h2 className="font-display mt-3 text-3xl text-np-gold">{elf.name}</h2>
            <p>{elf.bio}</p>
            <dl className="mt-4 grid gap-2 text-sm md:grid-cols-2">
              <div><dt className="text-np-green">Personality</dt><dd>{elf.personality}</dd></div>
              <div><dt className="text-np-green">Hobbies</dt><dd>{elf.hobbies}</dd></div>
              <div><dt className="text-np-green">Christmas job</dt><dd>{elf.christmasJob}</dd></div>
              <div><dt className="text-np-green">Favorite treat</dt><dd>{elf.favoriteTreat}</dd></div>
              <div className="md:col-span-2"><dt className="text-np-green">Fun fact</dt><dd>{elf.funFact}</dd></div>
            </dl>
          </section>
        ) : null}
        {tab === "walls" ? (
          <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.walls.map((item) => (
              <button
                key={item.id}
                className="gold-border min-h-36 rounded-3xl p-4 text-left"
                style={wallStyle(item)}
                onClick={() => api("/api/kid", { action: "update-style", wallDesignId: item.id }).then(load)}
              >
                <span className="rounded-full bg-black/50 px-3 py-1 font-extrabold">{item.name}</span>
              </button>
            ))}
          </section>
        ) : null}
      </div>
    </main>
  );
}
export function KidOnboarding() {
  const [step, setStep] = useState<"profile" | "elf">("profile");
  const [elves, setElves] = useState<Elf[]>([]);
  const [firstName, setFirstName] = useState("");
  const [age, setAge] = useState("7");
  const [favoriteColor, setFavoriteColor] = useState("green");
  const [favoriteActivity, setFavoriteActivity] = useState("decorating cookies");
  const [error, setError] = useState("");
  useEffect(() => {
    api<Payload>("/api/kid")
      .then((payload) => {
        setFirstName(payload.child.firstName);
        setElves(payload.elves);
        if (payload.child.onboardingComplete) window.location.href = "/kid/app";
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Please log in."));
  }, []);
  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-14">
      <h1 className="font-display text-4xl text-np-gold">Let’s meet your elf friend</h1>
      {error ? <p className="mt-4">{error}</p> : null}
      {step === "profile" ? (
        <form
          className="panel gold-border mt-6 grid gap-4 p-6"
          onSubmit={async (e) => {
            e.preventDefault();
            await api("/api/kid", {
              action: "onboard",
              firstName,
              age: Number(age),
              favoriteColor,
              favoriteActivity,
            });
            setStep("elf");
          }}
        >
          <label className="font-bold">First name</label>
          <input className="kid-input" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
          <label className="font-bold">Age</label>
          <input className="kid-input" type="number" min={3} max={12} value={age} onChange={(e) => setAge(e.target.value)} required />
          <label className="font-bold">Favorite color</label>
          <input className="kid-input" value={favoriteColor} onChange={(e) => setFavoriteColor(e.target.value)} required />
          <label className="font-bold">Favorite Christmas activity</label>
          <input className="kid-input" value={favoriteActivity} onChange={(e) => setFavoriteActivity(e.target.value)} required />
          <button className="magic-btn mt-2" type="submit">
            Next: choose an elf
          </button>
        </form>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {elves.map((elf) => (
            <button
              key={elf.id}
              className="panel gold-border p-4 text-left"
              onClick={async () => {
                await api("/api/kid", { action: "choose-elf", elfId: elf.id });
                window.location.href = "/kid/app";
              }}
            >
              <ElfAvatar avatar={elf.avatar} name={elf.name} size={90} />
              <h2 className="font-display mt-2 text-xl text-np-gold">{elf.name}</h2>
              <p className="text-xs uppercase text-np-green">{elf.gender} elf</p>
              <p className="mt-2 line-clamp-4 text-sm">{elf.bio}</p>
              <p className="mt-2 text-xs text-np-cream/70">{elf.personality}</p>
            </button>
          ))}
        </div>
      )}
    </main>
  );
}
