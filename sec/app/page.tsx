import { BrandMark, Countdown } from "@/components/magic";
import { SiteFooter, SiteHeader } from "@/components/chrome";
import { db } from "@/db";
import { quotes } from "@/db/schema";
import { ensureSeeded } from "@/lib/seed";
import { eq } from "drizzle-orm";
export const dynamic = "force-dynamic";
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      name: "North Pole Pen Pals",
      applicationCategory: "KidsApplication",
      operatingSystem: "iOS, Android, Web",
      description:
        "Magical Christmas pen pal app where children write letters to an elf at the North Pole with parent controls and AI-powered replies.",
      keywords:
        "Elf Pen Pal, Letters from the North Pole, Santa Letters, Christmas App for Kids, Elf Friend, Santa Pen Pal, Elf Mail",
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Is North Pole Pen Pals safe for kids?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Parents create accounts, buy a subscription, and receive every letter. Kids log in with a first name and secret code.",
          },
        },
        {
          "@type": "Question",
          name: "Can I reply instead of the elf AI?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Parents can toggle AI replies or write as the elf themselves from the family dashboard.",
          },
        },
      ],
    },
  ],
};
export default async function HomePage() {
  let quoteText = "Kindness is Christmas magic.";
  try {
    await ensureSeeded();
    const quoteRows = await db.select().from(quotes).where(eq(quotes.active, true));
    if (quoteRows.length) {
      quoteText = quoteRows[Math.floor(Date.now() / 86400000) % quoteRows.length].text;
    }
  } catch {
    // Workshop tables may still be warming up.
  }
  return (
    <main className="relative min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SiteHeader />
      <section className="relative mx-auto grid w-full max-w-6xl items-center gap-10 px-4 pb-16 pt-4 lg:grid-cols-2">
        <div>
          <p className="font-script text-3xl text-np-green">A friendship from Santa’s workshop</p>
          <h1 className="font-display mt-2 text-4xl leading-tight text-np-cream md:text-6xl">
            Write letters to a <span className="shimmer-text">magical elf</span> at the North Pole
          </h1>
          <p className="mt-5 max-w-xl text-lg text-np-cream/80">
            Children ages 3–12 send cozy letters and receive personalized replies all year. Parents keep the keys, the
            inbox, and the subscription.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a href="/parent/login" className="magic-btn">
              Parent Login
            </a>
            <a href="/parent/register" className="magic-btn green">
              Parent Register
            </a>
            <a href="/kid/login" className="magic-btn gold">
              Kid Login
            </a>
          </div>
          <p className="mt-5 text-sm text-np-gold">{quoteText}</p>
        </div>
        <div className="relative">
          <img
            src="/images/hero-north-pole.jpg"
            alt="North Pole village glowing under an emerald aurora"
            className="gold-border floaty w-full rounded-[2rem] object-cover"
          />
          <img
            src="/images/mailbox.jpg"
            alt="Magical red North Pole mailbox in the snow"
            className="absolute -bottom-8 -left-4 hidden w-40 rounded-3xl border border-np-gold/50 shadow-2xl md:block"
          />
        </div>
      </section>
      <section className="mx-auto grid w-full max-w-6xl gap-6 px-4 md:grid-cols-3">
        <article className="panel gold-border p-6">
          <p className="font-display text-np-gold">1. Grown-ups open the gate</p>
          <p className="mt-2 text-sm text-np-cream/75">
            Register, pick a plan, and create secret codes for each child.
          </p>
        </article>
        <article className="panel gold-border p-6">
          <p className="font-display text-np-gold">2. A surprise elf friend</p>
          <p className="mt-2 text-sm text-np-cream/75">
            After login, your child privately chooses their pen pal. The workshop keeps that moment a surprise.
          </p>
        </article>
        <article className="panel gold-border p-6">
          <p className="font-display text-np-gold">3. Letters forever (almost)</p>
          <p className="mt-2 text-sm text-np-cream/75">
            Unlimited messages, a live Christmas countdown, daily inspiration, and an inbox of memories.
          </p>
        </article>
      </section>
      <section className="mx-auto mt-16 w-full max-w-6xl px-4">
        <div className="panel gold-border flex flex-col items-start justify-between gap-6 p-8 md:flex-row md:items-center">
          <div>
            <p className="font-script text-3xl text-np-green">The big night is coming</p>
            <h2 className="font-display text-3xl text-np-cream">Countdown to Christmas</h2>
          </div>
          <Countdown />
        </div>
      </section>
      <section className="mx-auto mt-16 grid w-full max-w-6xl items-center gap-8 px-4 lg:grid-cols-2">
        <img
          src="/images/workshop.jpg"
          alt="Santa’s workshop interior with toys and lantern light"
          className="gold-border w-full rounded-[2rem] object-cover"
        />
        <div>
          <h2 className="font-display text-3xl text-np-cream">Designed like a Christmas wonderland</h2>
          <ul className="mt-4 grid gap-2 text-np-cream/80">
            <li>Black, bright green, deep red, and gold—dark, festive, and playful.</li>
            <li>Falling snow, twinkling lights, and optional workshop music.</li>
            <li>Custom letter bubbles: colors and shapes kids can pick.</li>
            <li>Changeable bedroom walls, with new designs added by workshop admins.</li>
          </ul>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <img src="/images/letter-desk.jpg" alt="Cozy letter writing desk" className="h-32 w-full rounded-2xl object-cover" />
            <img src="/images/reindeer-aurora.jpg" alt="Reindeer under the aurora" className="h-32 w-full rounded-2xl object-cover" />
            <img src="/images/candy-lane.jpg" alt="Candy cane lane at night" className="h-32 w-full rounded-2xl object-cover" />
            <img src="/images/cocoa.jpg" alt="Hot cocoa and holiday treats" className="h-32 w-full rounded-2xl object-cover" />
          </div>
        </div>
      </section>
      <section className="mx-auto mt-16 w-full max-w-6xl px-4">
        <article className="panel gold-border p-8 text-center">
          <p className="font-script text-3xl text-np-green">Workshop tickets</p>
          <h2 className="font-display text-3xl text-np-cream">Price is here</h2>
          <p className="mx-auto mt-3 max-w-xl text-np-cream/75">
            Plan details live in the parent dashboard. Log in as a grown-up to see monthly, yearly, and annual passes
            for one child or four-plus kids.
          </p>
          <a href="/parent/login" className="magic-btn mt-6">
            Parent login to view prices
          </a>
        </article>
      </section>
      <section className="mx-auto mt-16 w-full max-w-6xl px-4">
        <article className="panel gold-border overflow-hidden lg:grid lg:grid-cols-2">
          <img src="/images/tree-sparkle.jpg" alt="Christmas tree sparkling with ornaments" className="h-52 w-full object-cover lg:h-full" />
          <div className="p-8">
            <h2 className="font-display text-2xl text-np-gold">Works on iPhone, Android, and web</h2>
            <p className="mt-2 text-sm text-np-cream/75">
              Add it to the home screen for a mobile-app feel. Everything syncs through the workshop cloud so letters
              follow your family from tablet to laptop.
            </p>
          </div>
        </article>
      </section>
      <section className="mx-auto my-16 w-full max-w-3xl px-4">
        <div className="panel gold-border p-8 text-center">
          <BrandMark large />
          <p className="font-script mt-4 text-3xl text-np-green">Begin the friendship</p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <a href="/parent/register" className="magic-btn">
              Parent Register
            </a>
            <a href="/kid/login" className="magic-btn gold">
              Kid Login
            </a>
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
