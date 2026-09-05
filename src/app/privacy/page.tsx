import { SiteFooter, SiteHeader } from "@/components/chrome";
export const metadata = {
  title: "Privacy",
  description: "How North Pole Pen Pals protects family data, children’s letters, and parent accounts.",
};
export default function PrivacyPage() {
  return (
    <main className="min-h-screen">
      <SiteHeader />
      <article className="panel gold-border mx-auto mb-16 w-full max-w-3xl p-8">
        <h1 className="font-display text-3xl text-np-gold">Privacy</h1>
        <p className="mt-4 text-sm leading-7 text-np-cream/80">
          We collect parent emails, child first names, ages, preferences, and letters so the elf friendship can feel
          personal. Kids never need a last name, school, or home address. Parents can read every message. We do not sell
          children’s data. Passwords are hashed. Sessions use httpOnly cookies. Payment details in this demo are not
          stored. If you connect Stripe, Resend, or OpenAI in production, their processing terms also apply.
        </p>
      </article>
      <SiteFooter />
    </main>
  );
}
