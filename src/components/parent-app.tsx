"use client";
import { useEffect, useMemo, useState } from "react";
import { ElfAvatar } from "@/components/elf-avatar";
import { BrandMark, LetterBubble } from "@/components/magic";
import { api, when } from "@/lib/client-api";
import { PLANS, formatPrice, periodLabel } from "@/lib/plans";
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
type Child = {
  id: number;
  firstName: string;
  age: number | null;
  secretCode: string;
  favoriteColor: string | null;
  favoriteActivity: string | null;
  elf: Elf | null;
  onboardingComplete: boolean;
};
type Letter = {
  id: number;
  childId: number;
  fromRole: string;
  body: string;
  bubbleColor: string | null;
  bubbleShape: string | null;
  createdAt: string;
};
type Ticket = {
  id: number;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
  replies: { id: number; fromRole: string; message: string; createdAt: string }[];
};
type Note = { id: number; message: string; read: boolean; createdAt: string };
type Payload = {
  parent: { id: number; name: string; email: string; replyMode: string };
  children: Child[];
  elves: Elf[];
  letters: Letter[];
  notifications: Note[];
  subscription: { planCode: string; status: string; childLimit: number; expiresAt: string | null } | null;
  tickets: Ticket[];
};
const tabs = ["Home", "Children", "Letters", "Prices", "Share", "Help"] as const;
export function ParentApp() {
  const [data, setData] = useState<Payload | null>(null);
  const [tab, setTab] = useState<(typeof tabs)[number]>("Home");
  const [error, setError] = useState("");
  const [firstName, setFirstName] = useState("");
  const [age, setAge] = useState("7");
  const [planCode, setPlanCode] = useState("one_monthly");
  const [replyBody, setReplyBody] = useState("");
  const [activeChild, setActiveChild] = useState<number | null>(null);
  const [subject, setSubject] = useState("Workshop question");
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);
  async function load() {
    const payload = await api<Payload>("/api/parent");
    setData(payload);
    if (payload.children[0] && activeChild == null) setActiveChild(payload.children[0].id);
  }
  useEffect(() => {
    load().catch((err) => setError(err instanceof Error ? err.message : "Could not load."));
  }, []);
  const kid = useMemo(
    () => data?.children.find((c) => c.id === activeChild) ?? data?.children[0],
    [data, activeChild],
  );
  if (error) {
    return (
      <main className="mx-auto max-w-lg px-4 py-20">
        <p>{error}</p>
        <a href="/parent/login" className="magic-btn mt-4">
          Parent login
        </a>
      </main>
    );
  }
  if (!data) return <main className="px-4 py-20 text-center">Warming the cocoa…</main>;
  const unread = data.notifications.filter((n) => !n.read).length;
  async function logout() {
    await api("/api/auth", { action: "logout" });
    window.location.href = "/";
  }
  return (
    <main className="relative mx-auto min-h-screen w-full max-w-6xl px-4 pb-24 pt-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <BrandMark />
        <div className="flex gap-2">
          <button className="magic-btn ghost !py-2 text-sm" onClick={() => void logout()}>
            Log out
          </button>
        </div>
      </div>
      <h1 className="font-display mt-6 text-3xl text-np-gold">Welcome, {data.parent.name}</h1>
      <p className="text-sm text-np-cream/70">
        {data.subscription
          ? `Plan ${data.subscription.planCode} · up to ${data.subscription.childLimit} children`
          : "No active subscription yet — choose a plan to unlock kid login."}
        {unread ? ` · ${unread} new alerts` : ""}
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        {tabs.map((item) => (
          <button
            key={item}
            className="tab-btn rounded-full border border-np-gold/30 px-4 py-2 text-sm font-extrabold"
            data-active={tab === item}
            onClick={() => setTab(item)}
          >
            {item}
          </button>
        ))}
      </div>
      {tab === "Home" ? (
        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <article className="panel gold-border p-6 md:col-span-3">
            <h2 className="font-display text-2xl text-np-gold">Parents stay in the sleigh</h2>
            <ul className="mt-4 grid gap-2 text-sm text-np-cream/80 md:grid-cols-2">
              <li>Read every letter sent and received.</li>
              <li>Toggle AI elf replies or write as the elf yourself.</li>
              <li>Manage multiple children, favorite elves, and activity.</li>
              <li>Alerts when a new letter arrives.</li>
              <li>Share “My child has a magical North Pole pen pal!” graphics.</li>
              <li>Prices live on the Prices tab — kids never see the checkout.</li>
            </ul>
          </article>
          {data.children.map((child) => (
            <article key={child.id} className="panel gold-border p-5">
              {child.elf ? <ElfAvatar avatar={child.elf.avatar} name={child.elf.name} size={72} /> : null}
              <h2 className="font-display text-2xl text-np-gold">{child.firstName}</h2>
              <p className="text-sm">Code: {child.secretCode}</p>
              <p className="text-sm text-np-cream/70">Elf: {child.elf?.name ?? "not chosen yet"}</p>
            </article>
          ))}
          <article className="panel gold-border p-5">
            <h2 className="font-display text-2xl text-np-gold">Reply style</h2>
            <p className="text-sm text-np-cream/70">AI can answer as the elf, or you can write every reply.</p>
            <button
              className="magic-btn mt-4"
              onClick={async () => {
                await api("/api/parent", {
                  action: "update-reply-mode",
                  replyMode: data.parent.replyMode === "ai" ? "parent" : "ai",
                });
                await load();
              }}
            >
              {data.parent.replyMode === "ai" ? "AI is replying — switch to me" : "You reply — switch to AI"}
            </button>
          </article>
          <article className="panel gold-border p-5 md:col-span-3">
            <h2 className="font-display text-2xl text-np-gold">Latest workshop mail</h2>
            <div className="mt-3 grid gap-2">
              {data.notifications.slice(0, 6).map((note) => (
                <p key={note.id} className="text-sm text-np-cream/80">
                  {when(note.createdAt)} · {note.message}
                </p>
              ))}
            </div>
            <button className="magic-btn ghost mt-4 text-sm" onClick={async () => { await api("/api/parent", { action: "mark-read" }); await load(); }}>
              Mark alerts read
            </button>
          </article>
        </section>
      ) : null}
      {tab === "Children" ? (
        <section className="mt-8 grid gap-6 md:grid-cols-2">
          <form
            className="panel gold-border p-5"
            onSubmit={async (e) => {
              e.preventDefault();
              await api("/api/parent", { action: "add-child", firstName, age: Number(age) });
              setFirstName("");
              await load();
            }}
          >
            <h2 className="font-display text-2xl text-np-gold">Add a child</h2>
            <input className="input-dark mt-4" placeholder="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
            <input className="input-dark mt-3" type="number" min={3} max={12} value={age} onChange={(e) => setAge(e.target.value)} />
            <button className="magic-btn mt-4" type="submit">
              Create secret code
            </button>
          </form>
          <div className="grid gap-3">
            {data.children.map((child) => (
              <article key={child.id} className="panel gold-border p-4">
                <h3 className="font-display text-xl">{child.firstName}</h3>
                <p>Age {child.age ?? "—"} · Code {child.secretCode}</p>
                <p className="text-sm text-np-cream/70">
                  {child.favoriteColor ? `Loves ${child.favoriteColor}` : "Still onboarding"} · {child.elf?.name ?? "no elf yet"}
                </p>
              </article>
            ))}
          </div>
        </section>
      ) : null}
      {tab === "Letters" ? (
        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <div>
            <div className="flex flex-wrap gap-2">
              {data.children.map((child) => (
                <button key={child.id} className="tab-btn rounded-full border border-np-gold/30 px-3 py-1 text-sm" data-active={kid?.id === child.id} onClick={() => setActiveChild(child.id)}>
                  {child.firstName}
                </button>
              ))}
            </div>
            <div className="mt-4 grid max-h-[28rem] gap-3 overflow-auto pr-2">
              {data.letters
                .filter((letter) => letter.childId === kid?.id)
                .map((letter) => (
                  <LetterBubble
                    key={letter.id}
                    body={letter.body}
                    from={letter.fromRole === "child" ? kid?.firstName || "Child" : kid?.elf?.name || "Elf"}
                    color={letter.bubbleColor}
                    shape={letter.bubbleShape}
                    at={when(letter.createdAt)}
                  />
                ))}
            </div>
          </div>
          <form
            className="panel gold-border p-5"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!kid) return;
              await api("/api/parent", { action: "reply-as-elf", childId: kid.id, body: replyBody });
              setReplyBody("");
              await load();
            }}
          >
            <h2 className="font-display text-2xl text-np-gold">Write as the elf</h2>
            <textarea className="input-dark mt-3 min-h-40" value={replyBody} onChange={(e) => setReplyBody(e.target.value)} required />
            <button className="magic-btn mt-4" type="submit">
              Send to {kid?.firstName ?? "child"}
            </button>
          </form>
        </section>
      ) : null}
      {tab === "Prices" ? (
        <section className="mt-8 grid gap-4 md:grid-cols-2">
          <article className="panel gold-border p-5 md:col-span-2">
            <h2 className="font-display text-2xl text-np-gold">Family prices</h2>
            <p className="text-sm text-np-cream/70">
              These plans are only visible to grown-ups. Kids never see checkout.
            </p>
          </article>
          {PLANS.map((plan) => (
            <article key={plan.code} className={`panel gold-border p-5 ${planCode === plan.code ? "ring-2 ring-np-green" : ""}`}>
              <h3 className="font-display text-xl text-np-gold">{plan.name}</h3>
              <p className="text-2xl font-extrabold">
                {formatPrice(plan.priceCents)} <span className="text-sm">{periodLabel(plan.period)}</span>
              </p>
              <ul className="mt-2 text-sm text-np-cream/75">
                {plan.perks.map((perk) => (
                  <li key={perk}>{perk}</li>
                ))}
              </ul>
              <button className="magic-btn mt-4 w-full" onClick={() => setPlanCode(plan.code)}>
                Select
              </button>
            </article>
          ))}
          <form
            className="panel gold-border p-5 md:col-span-2"
            onSubmit={async (e) => {
              e.preventDefault();
              await api("/api/parent", { action: "subscribe", planCode });
              await load();
              setTab("Children");
            }}
          >
            <h2 className="font-display text-2xl text-np-gold">Secure workshop checkout</h2>
            <p className="text-sm text-np-cream/70">
              Demo billing — no card is stored. In production this connects to your payment processor.
            </p>
            <input className="input-dark mt-3" placeholder="Name on sleigh-card" required />
            <input className="input-dark mt-3" placeholder="4242 4242 4242 4242" required />
            <button className="magic-btn gold mt-4" type="submit">
              Activate {planCode}
            </button>
          </form>
        </section>
      ) : null}
      {tab === "Share" ? (
        <section className="mt-8 grid gap-6 md:grid-cols-2">
          <img src="/images/og-share.jpg" alt="Share the magic graphic" className="gold-border rounded-[2rem]" />
          <div className="panel gold-border p-6">
            <h2 className="font-display text-2xl text-np-gold">Share the magic</h2>
            <p className="mt-2">My child has a magical North Pole pen pal!</p>
            <button
              className="magic-btn mt-4"
              onClick={async () => {
                const text = "My child has a magical North Pole pen pal!";
                if (navigator.share) await navigator.share({ title: "North Pole Pen Pals", text, url: window.location.origin });
                else {
                  await navigator.clipboard.writeText(`${text} ${window.location.origin}`);
                  setCopied(true);
                }
              }}
            >
              {copied ? "Copied!" : "Share"}
            </button>
            <a className="magic-btn green mt-3 inline-flex" href="/images/og-share.jpg" download>
              Download graphic
            </a>
          </div>
        </section>
      ) : null}
      {tab === "Help" ? (
        <section className="mt-8 grid gap-6 md:grid-cols-2">
          <form
            className="panel gold-border p-5"
            onSubmit={async (e) => {
              e.preventDefault();
              await api("/api/parent", { action: "support", subject, message });
              setMessage("");
              await load();
            }}
          >
            <h2 className="font-display text-2xl text-np-gold">Write the workshop</h2>
            <input className="input-dark mt-3" value={subject} onChange={(e) => setSubject(e.target.value)} />
            <textarea className="input-dark mt-3 min-h-32" value={message} onChange={(e) => setMessage(e.target.value)} required />
            <button className="magic-btn mt-4" type="submit">
              Send
            </button>
          </form>
          <div className="grid gap-3">
            {data.tickets.map((ticket) => (
              <article key={ticket.id} className="panel gold-border p-4">
                <p className="text-xs uppercase text-np-green">{ticket.status}</p>
                <h3 className="font-display text-xl">{ticket.subject}</h3>
                <p className="text-sm">{ticket.message}</p>
                {ticket.replies.map((reply) => (
                  <p key={reply.id} className="mt-2 text-sm text-np-gold">
                    Workshop: {reply.message}
                  </p>
                ))}
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
