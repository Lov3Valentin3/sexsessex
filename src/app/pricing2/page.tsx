import { SiteFooter, SiteHeader } from "@/components/chrome";
import { PLANS, formatPrice, periodLabel } from "@/lib/plans";
export const metadata = {
  title: "Pricing",
  description:
    "North Pole Pen Pals subscription plans for one child or four-plus kids — monthly, yearly, and annual magic passes.",
};
export default function PricingPage() {
  const one = PLANS.filter((plan) => plan.childLimit === 1);
  const family = PLANS.filter((plan) => plan.childLimit > 1);
  return (
    <main className="min-h-screen">
      <SiteHeader />
      <section className="mx-auto w-full max-w-6xl px-4 pb-16">
        <p className="font-script text-3xl text-np-green">Workshop tickets</p>
        <h1 className="font-display text-4xl text-np-cream md:text-5xl">Plans for one kid or a whole sleigh</h1>
        <p className="mt-3 max-w-2xl text-np-cream/75">
          Unlimited messaging on every plan. Parents keep full letter history, AI-or-human replies, and kid secret codes.
        </p>
        <h2 className="font-display mt-10 text-2xl text-np-gold">One child</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {one.map((plan) => (
            <article key={plan.code} className={`panel gold-border p-6 ${plan.featured ? "ring-2 ring-np-green" : ""}`}>
              <h3 className="font-display text-2xl text-np-gold">{plan.name}</h3>
              <p className="mt-2 text-3xl font-extrabold">
                {formatPrice(plan.priceCents)}
                <span className="text-sm text-np-cream/60">{periodLabel(plan.period)}</span>
              </p>
              <p className="mt-2 text-sm">{plan.tagline}</p>
              <ul className="mt-4 grid gap-1 text-sm text-np-cream/75">
                {plan.perks.map((perk) => (
                  <li key={perk}>{perk}</li>
                ))}
              </ul>
              <a href="/parent/register" className="magic-btn mt-5 w-full">
                Start
              </a>
            </article>
          ))}
        </div>
        <h2 className="font-display mt-12 text-2xl text-np-gold">Four or more children</h2>
        <div className="mt-4 grid 
