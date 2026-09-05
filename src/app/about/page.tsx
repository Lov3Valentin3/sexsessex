import { SiteFooter, SiteHeader } from "@/components/chrome";
export const metadata = {
  title: "About",
  description: "The story behind North Pole Pen Pals — a safe Christmas letter-writing world for kids and elves.",
};
export default function AboutPage() {
  return (
    <main className="min-h-screen">
      <SiteHeader />
      <section className="mx-auto grid w-full max-w-5xl gap-8 px-4 pb-16 lg:grid-cols-2">
        <div>
          <p className="font-script text-3xl text-np-green">Once upon a workshop</p>
          <h1 className="font-display text-4xl text-np-cream">Disney-level wonder, grown-up controls</h1>
          <p className="mt-4 text-np-cream/80">
            North Pole Pen Pals is a magical place where children build a real-feeling friendship with an elf through
            letters. Elves stay in character, remember favorite colors, birthdays, and inside jokes, and never ask for
            private details.
          </p>
          <p className="mt-4 text-np-cream/80">
            Parents buy the subscription, hold the secret codes, read every letter, and choose whether AI or a grown-up
            should reply. Workshop admins can add elves, quotes, music, and bedroom walls anytime.
          </p>
        </div>
        <img src="/images/workshop.jpg" alt="Santa’s workshop" className="gold-border rounded-[2rem] object-cover" />
      </section>
      <SiteFooter />
    </main>
  );
}