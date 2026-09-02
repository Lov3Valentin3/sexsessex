import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Cinzel_Decorative, Great_Vibes, Nunito } from "next/font/google";
import { ChristmasLights, MusicDock, Snowfall } from "@/components/magic";
import { db } from "@/db";
import { musicTracks } from "@/db/schema";
import { ensureSeeded } from "@/lib/seed";
import "./globals.css";
const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});
const cinzel = Cinzel_Decorative({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-display",
});
const vibes = Great_Vibes({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-script",
});
const site = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
export const metadata: Metadata = {
  metadataBase: new URL(site),
  title: {
    default: "North Pole Pen Pals | Magical Elf Letters for Kids",
    template: "%s | North Pole Pen Pals",
  },
  description:
    "A magical Christmas pen pal app where kids write letters to a North Pole elf. Safe, parent-controlled, AI-powered friendship from Santa’s workshop.",
  keywords: [
    "Elf Pen Pal",
    "Letters from the North Pole",
    "Santa Letters",
    "Christmas App for Kids",
    "Elf Friend",
    "Santa Pen Pal",
    "Christmas Magic",
    "North Pole Letters",
    "Elf Mail",
    "Santa's Workshop",
  ],
  authors: [{ name: "North Pole Pen Pals" }],
  applicationName: "North Pole Pen Pals",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: site,
    title: "North Pole Pen Pals | Magical Elf Letters for Kids",
    description:
      "Children build a lasting friendship with an elf from Santa’s workshop through letters, countdown magic, and parent-safe controls.",
    siteName: "North Pole Pen Pals",
    images: [{ url: "/images/og-share.jpg", width: 1200, height: 630, alt: "North Pole Pen Pals" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "North Pole Pen Pals | Elf Mail for Kids",
    description: "A magical North Pole pen pal for children ages 3–12. Safe, festive, and full of wonder.",
    images: ["/images/og-share.jpg"],
  },
  appleWebApp: {
    capable: true,
    title: "North Pole Pen Pals",
    statusBarStyle: "black-translucent",
  },
  robots: { index: true, follow: true },
  category: "KidsApplication",
};
export const viewport: Viewport = {
  themeColor: "#07040a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};
export default async function RootLayout({ children }: { children: ReactNode }) {
  let music = { title: "Workshop Bells", url: "builtin:jingle" };
  try {
    await ensureSeeded();
    const tracks = await db.select().from(musicTracks);
    const preferred = tracks.find((track) => track.isDefault) ?? tracks[0];
    if (preferred) music = { title: preferred.title, url: preferred.url };
  } catch {
    // Database may still be warming up.
  }
  return (
    <html lang="en">
      <body className={`${nunito.className} ${cinzel.variable} ${vibes.variable} aurora-bg grain antialiased`}>
        <ChristmasLights />
        <Snowfall />
        {children}
        <MusicDock title={music.title} url={music.url} />
      </body>
    </html>
  );
}
