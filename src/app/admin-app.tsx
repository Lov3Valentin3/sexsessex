"use client";
import { useEffect, useState } from "react";
import { ElfAvatar } from "@/components/elf-avatar";
import { BrandMark } from "@/components/magic";
import { api, when } from "@/lib/client-api";
import { wallStyle } from "@/lib/walls";
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
  active: boolean;
};
type Ticket = {
  id: number;
  email: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
  replies: { id: number; fromRole: string; message: string; createdAt: string }[];
};
type Payload = {
  stats: { parents: number; children: number; letters: number; openTickets: number; activeSubscriptions: number };
  elves: Elf[];
  quotes: { id: number; text: string; attribution: string | null; active: boolean }[];
  walls: { id: number; name: string; pattern: string; primaryColor: string; secondaryColor: string; accentColor: string }[];
  music: { id: number; title: string; url: string; isDefault: boolean }[];
  tickets: Ticket[];
  events: { id: number; eventType: string; createdAt: string; role: string | null }[];
  popularElves: { id: number; name: string; fans: number }[];
  lettersByDay: Record<string, number>;
  settings: Record<string, string>;
  patterns: string[];
  children: { id: number; firstName: string; elfId: number | null }[];
  subscriptions: { id: number; planCode: string; status: string; amountCents: number }[];
};
const tabs = ["Overview", "Mail", "Elves", "Quotes", "Walls", "Music", "Analytics"] as const;
export function AdminApp() {
  const [data, setData] = useState<Payload | null>(null);
  const [tab, setTab] = useState<(typeof tabs)[number]>("Overview");
  const [error, setError] = useState("");
  const [reply, setReply] = useState("");
  const [ticketId, setTicketId] = useState<number | null>(null);
  const [elfName, setElfName] = useState("");
  const [elfGender, setElfGender] = useState("girl");
  const [elfBio, setElfBio] = useState("");
  const [quoteText, setQuoteText] = useState("");
  const [wallName, setWallName] = useState("");
  const [wallPattern, setWallPattern] = useState("aurora");
  const [c1, setC1] = useState("#07040a");
  const [c2, setC2] = useState("#3dff8a");
  const [c3, setC3] = useState("#c4122f");
  const [musicTitle, setMusicTitle] = useState("");
  const [musicUrl, setMusicUrl] = useState("builtin:jingle");
  async function load() {
    setData(await api<Payload>("/api/admin"));
  }
  useEffect(() => {
    load().catch((err) => setError(err instanceof Error ? err.message : "Admin login required."));
  }, []);
  if (error) {
    return (
      <main className="px-4 py-20 text-center">
        <p>{error}</p>
        <a href="/admin/login" className="magic-btn mt-4 inline-flex">
          Admin login
        </a>
      </main>
    );
  }
  if (!data) return <main className="px-4 py-20 text-center">Counting gumdrops…</main>;
  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 pb-24 pt-12">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <BrandMark />
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
      <h1 className="font-display mt-6 text-3xl text-np-gold">Workshop control tower</h1>
      <div className="mt-4 flex flex-wrap gap-2">
        {tabs.map((item) => (
          <button key={item} className="tab-btn rounded-full border border-np-gold/30 px-4 py-2 text-sm font-extrabold" data-active={tab === item} onClick={() => setTab(item)}>
            {item}
          </button>
        ))}
      </div>
      {tab === "Overview" ? (
        <section className="mt-6 grid gap-4 md:grid-cols-5">
          {Object.entries(data.stats).map(([key, value]) => (
            <article key={key} className="panel gold-border p-4">
              <p className="text-xs uppercase tracking-widest text-np-green">{key}</p>
              <p className="font-display text-3xl text-np-gold">{value}</p>
            </article>
          ))}
          <article className="panel gold-border p-4 md:col-span-5">
            <h2 className="font-display text-xl">Kid login wall</h2>
            <div className="mt-3 flex flex-wrap gap-3">
              {data.walls.map((wall) => (
                <button
                  key={wall.id}
                  className="h-20 w-28 rounded-2xl border border-white/20"
                  style={wallStyle(wall)}
                  onClick={() => api("/api/admin", { action: "save-setting", key: "kid_login_wall_id", value: String(wall.id) }).then(load)}
                >
                  {wall.name}
                </button>
              ))}
            </div>
          </article>
        </section>
      ) : null}
      {tab === "Mail" ? (
        <section className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="grid gap-3">
            {data.tickets.map((ticket) => (
              <button key={ticket.id} className="panel gold-border p-4 text-left" onClick={() => setTicketId(ticket.id)}>
                <p className="text-xs uppercase text-np-green">{ticket.status} · {ticket.email}</p>
                <h3 className="font-display text-xl">{ticket.subject}</h3>
                <p className="text-sm">{ticket.message}</p>
                {ticket.replies.map((item) => (
                  <p key={item.id} className="mt-2 text-sm text-np-gold">{item.fromRole}: {item.message}</p>
                ))}
              </button>
            ))}
          </div>
          <form
            className="panel gold-border p-5"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!ticketId) return;
              await api("/api/admin", { action: "reply-ticket", ticketId, message: reply });
              setReply("");
              await load();
            }}
          >
            <h2 className="font-display text-2xl text-np-gold">Answer mail</h2>
            <p className="text-sm">Ticket #{ticketId ?? "—"}</p>
            <textarea className="input-dark mt-3 min-h-40" value={reply} onChange={(e) => setReply(e.target.value)} required />
            <button className="magic-btn mt-4" type="submit">
              Send reply
            </button>
            <button
              type="button"
              className="magic-btn ghost mt-3"
              onClick={async () => {
                if (!ticketId) return;
                await api("/api/admin", { action: "close-ticket", ticketId });
                await load();
              }}
            >
              Close ticket
            </button>
          </form>
        </section>
      ) : null}
      {tab === "Elves" ? (
        <section className="mt-6 grid gap-4 lg:grid-cols-2">
          <form
            className="panel gold-border grid gap-3 p-5"
            onSubmit={async (e) => {
              e.preventDefault();
              await api("/api/admin", {
                action: "save-elf",
                name: elfName,
                gender: elfGender,
                bio: elfBio,
                personality: "Kind and sparkly",
                hobbies: "Making toys",
                christmasJob: "Helping Santa",
                favoriteTreat: "Peppermint",
                funFact: "Brand new workshop recruit.",
              });
              setElfName("");
              setElfBio("");
              await load();
            }}
          >
            <h2 className="font-display text-2xl text-np-gold">Add an elf</h2>
            <input className="input-dark" placeholder="Name" value={elfName} onChange={(e) => setElfName(e.target.value)} required />
            <select className="input-dark" value={elfGender} onChange={(e) => setElfGender(e.target.value)}>
              <option value="girl">Girl elf</option>
              <option value="boy">Boy elf</option>
            </select>
            <textarea className="input-dark min-h-24" placeholder="Biography" value={elfBio} onChange={(e) => setElfBio(e.target.value)} required />
            <button className="magic-btn" type="submit">
              Add to workshop
            </button>
          </form>
          <div className="grid max-h-[32rem] gap-3 overflow-auto">
            {data.elves.map((elf) => (
              <article key={elf.id} className="panel gold-border flex gap-3 p-3">
                <ElfAvatar avatar={elf.avatar} name={elf.name} size={64} />
                <div>
                  <h3 className="font-display text-lg">{elf.name}</h3>
                  <p className="text-xs">{elf.gender} · {elf.christmasJob}</p>
                  <p className="line-clamp-2 text-sm text-np-cream/70">{elf.bio}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}
      {tab === "Quotes" ? (
        <section className="mt-6 grid gap-4 md:grid-cols-2">
          <form
            className="panel gold-border p-5"
            onSubmit={async (e) => {
              e.preventDefault();
              await api("/api/admin", { action: "save-quote", text: quoteText, attribution: "Workshop" });
              setQuoteText("");
              await load();
            }}
          >
            <h2 className="font-display text-2xl text-np-gold">Daily inspiration</h2>
            <textarea className="input-dark mt-3 min-h-24" value={quoteText} onChange={(e) => setQuoteText(e.target.value)} required />
            <button className="magic-btn mt-4" type="submit">
              Add quote
            </button>
          </form>
          <div className="grid gap-2">
            {data.quotes.map((quote) => (
              <button key={quote.id} className="panel gold-border p-3 text-left" onClick={() => api("/api/admin", { action: "toggle-quote", id: quote.id }).then(load)}>
                <p>{quote.text}</p>
                <p className="text-xs text-np-green">{quote.active ? "active" : "hidden"} · {quote.attribution}</p>
              </button>
            ))}
          </div>
        </section>
      ) : null}
      {tab === "Walls" ? (
        <section className="mt-6 grid gap-4 md:grid-cols-2">
          <form
            className="panel gold-border grid gap-3 p-5"
            onSubmit={async (e) => {
              e.preventDefault();
              await api("/api/admin", {
                action: "save-wall",
                name: wallName,
                pattern: wallPattern,
                primaryColor: c1,
                secondaryColor: c2,
                accentColor: c3,
              });
              setWallName("");
              await load();
            }}
          >
            <h2 className="font-display text-2xl text-np-gold">New wall design</h2>
            <input className="input-dark" placeholder="Name" value={wallName} onChange={(e) => setWallName(e.target.value)} required />
            <select className="input-dark" value={wallPattern} onChange={(e) => setWallPattern(e.target.value)}>
              {data.patterns.map((pattern) => (
                <option key={pattern}>{pattern}</option>
              ))}
            </select>
            <div className="flex gap-3">
              <input type="color" value={c1} onChange={(e) => setC1(e.target.value)} />
              <input type="color" value={c2} onChange={(e) => setC2(e.target.value)} />
              <input type="color" value={c3} onChange={(e) => setC3(e.target.value)} />
            </div>
            <div className="h-24 rounded-2xl" style={wallStyle({ pattern: wallPattern, primaryColor: c1, secondaryColor: c2, accentColor: c3 })} />
            <button className="magic-btn" type="submit">
              Save wall
            </button>
          </form>
          <div className="grid gap-3 sm:grid-cols-2">
            {data.walls.map((wall) => (
              <div key={wall.id} className="gold-border min-h-24 rounded-3xl p-3" style={wallStyle(wall)}>
                {wall.name}
              </div>
            ))}
          </div>
        </section>
      ) : null}
      {tab === "Music" ? (
        <section className="mt-6 grid gap-4 md:grid-cols-2">
          <form
            className="panel gold-border grid gap-3 p-5"
            onSubmit={async (e) => {
              e.preventDefault();
              await api("/api/admin", { action: "save-music", title: musicTitle, url: musicUrl, isDefault: true });
              setMusicTitle("");
              await load();
            }}
          >
            <h2 className="font-display text-2xl text-np-gold">Add music</h2>
            <input className="input-dark" placeholder="Title" value={musicTitle} onChange={(e) => setMusicTitle(e.target.value)} required />
            <input className="input-dark" placeholder="https://… or builtin:jingle" value={musicUrl} onChange={(e) => setMusicUrl(e.target.value)} required />
            <p className="text-xs text-np-cream/60">Use builtin:jingle, builtin:aurora, or a royalty-free audio URL.</p>
            <button className="magic-btn" type="submit">
              Save as default
            </button>
          </form>
          <div className="grid gap-2">
            {data.music.map((track) => (
              <article key={track.id} className="panel gold-border p-3">
                <p className="font-bold">{track.title}</p>
                <p className="text-xs">{track.url} {track.isDefault ? "· default" : ""}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}
      {tab === "Analytics" ? (
        <section className="mt-6 grid gap-4 md:grid-cols-2">
          <article className="panel gold-border p-5">
            <h2 className="font-display text-xl text-np-gold">Favorite elves</h2>
            {data.popularElves.sort((a, b) => b.fans - a.fans).map((elf) => (
              <p key={elf.id} className="mt-2 flex justify-between text-sm">
                <span>{elf.name}</span><span>{elf.fans} friends</span>
              </p>
            ))}
          </article>
          <article className="panel gold-border p-5">
            <h2 className="font-display text-xl text-np-gold">Letters by day</h2>
            {Object.entries(data.lettersByDay).slice(-10).map(([day, count]) => (
              <div key={day} className="mt-2">
                <p className="text-xs">{day} · {count}</p>
                <div className="h-2 rounded-full bg-black/40">
                  <div className="h-2 rounded-full bg-np-green" style={{ width: `${Math.min(100, count * 12)}%` }} />
                </div>
              </div>
            ))}
          </article>
          <article className="panel gold-border p-5 md:col-span-2">
            <h2 className="font-display text-xl text-np-gold">Live interactions</h2>
            {data.events.slice(0, 20).map((event) => (
              <p key={event.id} className="text-sm text-np-cream/80">
                {when(event.createdAt)} · {event.eventType} · {event.role}
              </p>
            ))}
            <p className="mt-4 text-sm text-np-cream/60">{data.subscriptions.length} subscription records in the ledger.</p>
          </article>
        </section>
      ) : null}
    </main>
  );
}