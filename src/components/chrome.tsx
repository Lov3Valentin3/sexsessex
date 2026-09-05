import { BrandMark } from "@/components/magic";
export function SiteHeader() {
  return (
    <header className="relative z-20 mx-auto flex w-full max-w-6xl items-center justify-between px-4 pb-6 pt-12">
      <BrandMark />
      <nav className="hidden items-center gap-5 text-sm font-bold text-np-cream/80 md:flex">
        <a href="/pricing">Pricing</a>
        <a href="/about">About</a>
        <a href="/parent/login">Parents</a>
        <a href="/kid/login" className="magic-btn !py-2 !px-4 text-sm">
          Kid Login
        </a>
      </nav>
    </header>
  );
}
export function SiteFooter() {
  return (
    <footer className="relative z-10 mt-20 border-t border-np-gold/20 bg-black/40 px-4 py-10">
      <div className="mx-auto grid w-full max-w-6xl gap-8 md:grid-cols-4">
        <div>
          <BrandMark />
          <p className="mt-3 text-sm text-np-cream/70">
            Magical elf pen pals for children ages 3–12. Safe, parent-powered, and full of North Pole wonder.
          </p>
        </div>
        <div>
          <p className="font-display text-np-gold">Explore</p>
          <div className="mt-3 grid gap-2 text-sm">
            <a href="/pricing">Subscription plans</a>
            <a href="/about">Our workshop story</a>
            <a href="/#elves">Meet the elves</a>
            <a href="/parent/register">Start a family pass</a>
          </div>
        </div>
        <div>
          <p className="font-display text-np-gold">Grown-ups</p>
          <div className="mt-3 grid gap-2 text-sm">
            <a href="/parent/login">Parent login</a>
            <a href="/admin/login">Workshop admin</a>
            <a href="/privacy">Privacy</a>
            <a href="/terms">Terms</a>
          </div>
        </div>
        <div>
          <p className="font-display text-np-gold">Find us</p>
          <p className="mt-3 text-sm text-np-cream/70">
            Keywords: Elf Pen Pal, Letters from the North Pole, Santa Letters, Christmas App for Kids, Elf Mail,
            Santa’s Workshop.
          </p>
        </div>
      </div>
      <p className="mx-auto mt-8 max-w-6xl text-xs text-np-cream/50">
        © {new Date().getFullYear()} North Pole Pen Pals. Built for wonder, with grown-up controls in every snowflake.
      </p>
    </footer>
  );
}
