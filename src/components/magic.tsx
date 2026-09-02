"use client";
import { useEffect, useMemo, useRef, useState } from "react";
const BULB_COLORS = ["#e11d48", "#3dff8a", "#f0c75e", "#38bdf8", "#fb7185"];
export function Snowfall() {
  const flakes = useMemo(
    () =>
      Array.from({ length: 42 }, (_, i) => ({
        id: i,
        left: `${(i * 97) % 100}%`,
        delay: `${(i % 12) * 0.45}s`,
        duration: `${9 + (i % 8)}s`,
        size: `${10 + (i % 10)}px`,
        drift: `${-30 + (i % 9) * 8}px`,
        char: i % 5 === 0 ? "✦" : "❄",
      })),
    [],
  );
  return (
    <div className="snow-layer" aria-hidden>
      {flakes.map((flake) => (
        <span
          key={flake.id}
          className="snowflake"
          style={{
            left: flake.left,
            fontSize: flake.size,
            animationDelay: flake.delay,
            animationDuration: flake.duration,
            ["--drift" as string]: flake.drift,
          }}
        >
          {flake.char}
        </span>
      ))}
    </div>
  );
}
export function ChristmasLights() {
  return (
    <div className="lights" aria-hidden>
      {Array.from({ length: 18 }, (_, i) => (
        <span
          key={i}
          className="bulb"
          style={{
            color: BULB_COLORS[i % BULB_COLORS.length],
            background: BULB_COLORS[i % BULB_COLORS.length],
            animationDelay: `${(i % 6) * 0.18}s`,
          }}
        />
      ))}
    </div>
  );
}
function playTune(kind: "jingle" | "aurora") {
  const ctx = new AudioContext();
  const now = ctx.currentTime;
  const notes =
    kind === "jingle"
      ? [659, 659, 659, 523, 659, 784, 392, 523, 587, 659]
      : [523, 587, 659, 784, 659, 587, 523, 392];
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = kind === "jingle" ? "triangle" : "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.08, now + i * 0.28 + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.28 + 0.26);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + i * 0.28);
    osc.stop(now + i * 0.28 + 0.3);
  });
  window.setTimeout(() => ctx.close(), 5000);
}
export function MusicDock({
  title,
  url,
}: {
  title?: string;
  url?: string;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (!on) {
      audioRef.current?.pause();
      return;
    }
    if (url && !url.startsWith("builtin:")) {
      if (!audioRef.current) audioRef.current = new Audio(url);
      audioRef.current.loop = true;
      void audioRef.current.play().catch(() => undefined);
      return;
    }
    const kind = url === "builtin:aurora" ? "aurora" : "jingle";
    playTune(kind);
    const id = window.setInterval(() => playTune(kind), 5200);
    return () => window.clearInterval(id);
  }, [on, url]);
  return (
    <button
      type="button"
      onClick={() => setOn((v) => !v)}
      className="fixed bottom-4 right-4 z-50 magic-btn gold text-sm"
      aria-pressed={on}
    >
      {on ? "♪ Music on" : "♫ Play music"}
      <span className="hidden sm:inline opacity-80">{title ? ` · ${title}` : ""}</span>
    </button>
  );
}
export function BrandMark({ large = false }: { large?: boolean }) {
  return (
    <a href="/" className="inline-flex items-center gap-3 no-underline">
      <img
        src="/images/app-icon.png"
        alt="North Pole Pen Pals elf icon"
        width={large ? 64 : 44}
        height={large ? 64 : 44}
        className="rounded-2xl border border-np-gold/50"
      />
      <span>
        <span className={`block font-display leading-none text-np-gold ${large ? "text-3xl" : "text-lg"}`}>
          North Pole Pen Pals
        </span>
        <span className="font-script text-xl text-np-green">letters from Santa’s workshop</span>
      </span>
    </a>
  );
}
export function christmasCountdown(now = new Date()) {
  const year = now.getMonth() === 11 && now.getDate() > 25 ? now.getFullYear() + 1 : now.getFullYear();
  const target = new Date(year, 11, 25, 0, 0, 0);
  const diff = Math.max(0, target.getTime() - now.getTime());
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return { days, hours, minutes, seconds, year };
}
export function Countdown() {
  const [time, setTime] = useState(christmasCountdown());
  useEffect(() => {
    const id = window.setInterval(() => setTime(christmasCountdown()), 1000);
    return () => window.clearInterval(id);
  }, []);
  const cells = [
    [time.days, "Days"],
    [time.hours, "Hours"],
    [time.minutes, "Minutes"],
    [time.seconds, "Seconds"],
  ] as const;
  return (
    <div className="flex flex-wrap gap-3">
      {cells.map(([value, label]) => (
        <div key={label} className="ornament-number px-3 py-3 text-center">
          <div className="font-display text-3xl text-black">{value}</div>
          <div className="text-[11px] font-extrabold uppercase tracking-widest text-black/80">{label}</div>
        </div>
      ))}
    </div>
  );
}
export function LetterBubble({
  body,
  from,
  color,
  shape,
  at,
}: {
  body: string;
  from: string;
  color?: string | null;
  shape?: string | null;
  at?: string;
}) {
  const cls =
    shape === "cloud"
      ? "letter-cloud"
      : shape === "ornament"
        ? "letter-ornament"
        : shape === "present"
          ? "letter-present"
          : shape === "star"
            ? "letter-star"
            : shape === "scallop"
              ? "letter-scallop"
              : "letter-round";
  const dark = color === "#f8fafc" || color === "#f0c75e" || color === "#3dff8a";
  return (
    <article className={`max-w-xl p-5 ${cls}`} style={{ background: color || "#c4122f" }}>
      <p className={`text-xs font-extrabold uppercase tracking-widest ${dark ? "text-black/70" : "text-white/70"}`}>
        {from} {at ? `· ${at}` : ""}
      </p>
      <p className={`mt-2 whitespace-pre-wrap text-base leading-relaxed ${dark ? "text-black" : "text-white"}`}>
        {body}
      </p>
    </article>
  );
}
