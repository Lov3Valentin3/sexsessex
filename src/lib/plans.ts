export type Plan = {
  code: string;
  name: string;
  tagline: string;
  priceCents: number;
  period: "monthly" | "yearly" | "annual";
  childLimit: number;
  featured?: boolean;
  perks: string[];
};
export const PLANS: Plan[] = [
  {
    code: "one_monthly",
    name: "1 Child · Monthly",
    tagline: "Unlimited letters for one little believer.",
    priceCents: 999,
    period: "monthly",
    childLimit: 1,
    perks: [
      "Unlimited elf messaging",
      "1 child profile",
      "Inbox + Christmas countdown",
      "Parent letter review",
    ],
  },
  {
    code: "one_yearly",
    name: "1 Child · Yearly",
    tagline: "A full year of North Pole friendship.",
    priceCents: 7900,
    period: "yearly",
    childLimit: 1,
    perks: [
      "2 months free vs monthly",
      "Unlimited elf messaging",
      "Birthday celebrations",
      "Printable letter keepsakes",
    ],
  },
  {
    code: "one_annual",
    name: "1 Child · Annual Magic Pass",
    tagline: "The deluxe season pass with extra sparkle.",
    priceCents: 9900,
    period: "annual",
    childLimit: 1,
    featured: true,
    perks: [
      "Everything in Yearly",
      "Premium wall designs",
      "Priority elf replies",
      "Festive share graphics",
    ],
  },
  {
    code: "family_monthly",
    name: "4+ Children · Monthly",
    tagline: "A whole workshop of pen pals.",
    priceCents: 1999,
    period: "monthly",
    childLimit: 12,
    perks: [
      "Up to 12 children",
      "Unlimited messaging each",
      "Switch child profiles",
      "Shared parent controls",
    ],
  },
  {
    code: "family_yearly",
    name: "4+ Children · Yearly",
    tagline: "Cousins, siblings, and snow-day magic.",
    priceCents: 14900,
    period: "yearly",
    childLimit: 12,
    perks: [
      "Up to 12 children",
      "Best yearly family rate",
      "Activity tracking",
      "Favorite-elf insights",
    ],
  },
  {
    code: "family_annual",
    name: "4+ Children · Annual Magic Pass",
    tagline: "Santa’s favorite family plan.",
    priceCents: 17900,
    period: "annual",
    childLimit: 12,
    featured: true,
    perks: [
      "Everything in Family Yearly",
      "Premium walls & music",
      "Priority workshop support",
      "Share-the-magic studio",
    ],
  },
];
export function getPlan(code: string) {
  return PLANS.find((plan) => plan.code === code) ?? null;
}
export function formatPrice(cents: number) {
  return `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`;
}
export function periodLabel(period: Plan["period"]) {
  if (period === "monthly") return "/ month";
  if (period === "yearly") return "/ year";
  return "/ annual pass";
}
export function expiresFromPeriod(period: Plan["period"], from = new Date()) {
  const next = new Date(from);
  if (period === "monthly") {
    next.setMonth(next.getMonth() + 1);
  } else {
    next.setFullYear(next.getFullYear() + 1);
  }
  return next;
}