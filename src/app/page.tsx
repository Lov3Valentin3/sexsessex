import { ElfAvatar } from "@/components/elf-avatar";
import { BrandMark, Countdown } from "@/components/magic";
import { SiteFooter, SiteHeader } from "@/components/chrome";
import { db } from "@/db";
import { elves, quotes } from "@/db/schema";
import { ELF_SEEDS } from "@/lib/elf-data";
import { PLANS, formatPrice, periodLabel } from "@/lib/plans";
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
      offers: {
        "@type": "AggregateOffer",
        lowPrice: "9.99",
        highPrice: "179.00",
        priceCurrency: "USD",
      },
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
  let elfList: Array<(typeof ELF_SEEDS)[number] & { id?: number }> = ELF_SEEDS;
  let quoteText = "Kindness is Christmas magic.";
  try {
    await ensureSeeded();
    const rows = await db.select().from(elves).where(eq(elves.active, true));
    if (rows.length) elfList = rows;
    const quoteRows = await db.select().from(quotes).where(eq(quotes.active, true));
    if (quoteRows.length) {
      quoteText = quoteRows[Math.floor(Date.now() / 86400000) % quoteRows.length].text;
    }
  } catch {
    elfList = ELF_SEEDS;
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
            Children ages 3–12 choose an elf pen pal, send cozy letters, and receive personalized replies all year.
            Parents keep the keys, the inbox, and the subscription.
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
            Register, pick a plan for one child or four-plus, and create secret codes.
          </p>
        </article>
        <article className="panel gold-border p-6">
          <p className="font-display text-np-gold">2. Kids choose an elf friend</p>
          <p className="mt-2 text-sm text-np-cream/75">
            Twenty unique elves—ten boy elves and ten girl elves—each with a job, treats, and a personality.
          </p>
        </article>
        <article className="panel gold-border p-6">
          <p className="font-display text-np-gold">3. Letters forever (almost)</p>
          <p className="mt-2 text-sm text-np-cream/75">
            Unlimited messages, a live Christmas countdown, daily inspiration, and an inbox of memories.
          </p>
        </article>
      </section>
      <section id="elves" className="mx-auto mt-16 w-full max-w-6xl px-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="font-script text-3xl text-np-green">Choose your elf friend</p>
            <h2 className="font-display text-3xl text-np-cream md:text-4xl">20 pen pals from the workshop</h2>
          </div>
          <Countdown />
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {elfList.map((elf, index) => (
            <article key={elf.name + index} className="panel gold-border p-4">
              <ElfAvatar avatar={elf.avatar} name={elf.name} size={88} />
              <h3 className="font-display mt-2 text-xl text-np-gold">{elf.name}</h3>
              <p className="text-xs uppercase tracking-widest text-np-green">{elf.gender} elf · {elf.christmasJob}</p>
              <p className="mt-2 line-clamp-3 text-sm text-np-cream/75">{elf.bio}</p>
              <p className="mt-2 text-xs text-np-cream/60">Loves {elf.hobbies.split(",")[0].toLowerCase()}</p>
            </article>
          ))}
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
            <li>Elves remember names, favorite things, birthdays, wishes, and inside jokes.</li>
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
        <h2 className="font-display text-3xl text-np-cream">Plans for one believer or a whole sleigh</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {PLANS.filter((plan) => plan.period !== "yearly").map((plan) => (
            <article key={plan.code} className={`panel gold-border p-6 ${plan.featured ? "ring-2 ring-np-green" : ""}`}>
              <p className="text-xs uppercase tracking-widest text-np-green">{plan.period}</p>
              <h3 className="font-display mt-1 text-2xl text-np-gold">{plan.name}</h3>
              <p className="mt-2 text-3xl font-extrabold">
                {formatPrice(plan.priceCents)}
                <span className="text-sm font-bold text-np-cream/60">{periodLabel(plan.period)}</span>
              </p>
              <p className="mt-2 text-sm text-np-cream/75">{plan.tagline}</p>
              <a href="/parent/register" className="magic-btn mt-5 w-full">
                Give the magic
              </a>
            </article>
          ))}
        </div>
        <p className="mt-4 text-sm text-np-cream/60">
          Yearly and annual passes are on the <a href="/pricing">full pricing page</a>.
        </p>
      </section>
      <section className="mx-auto mt-16 grid w-full max-w-6xl gap-6 px-4 lg:grid-cols-2">
        <article className="panel gold-border p-8">
          <h2 className="font-display text-2xl text-np-gold">Parents stay in the sleigh</h2>
          <ul className="mt-4 grid gap-2 text-sm text-np-cream/80">
            <li>Read every letter sent and received.</li>
            <li>Toggle AI elf replies or write as the elf yourself.</li>
            <li>Manage multiple children, favorite elves, and activity.</li>
            <li>Alerts when a new letter arrives.</li>
            <li>Share “My child has a magical North Pole pen pal!” graphics.</li>
          </ul>
        </article>
        <article className="panel gold-border overflow-hidden">
          <img src="/images/tree-sparkle.jpg" alt="Christmas tree sparkling with ornaments" className="h-52 w-full object-cover" />
          <div className="p-6">
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
