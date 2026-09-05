import { AuthScreen } from "@/components/auth-screen";
import { db } from "@/db";
import { siteSettings, wallDesigns } from "@/db/schema";
import { ensureSeeded } from "@/lib/seed";
import { wallStyle } from "@/lib/walls";
export const dynamic = "force-dynamic";
export default async function KidLoginPage() {
  let style = wallStyle({
    pattern: "night-sky",
    primaryColor: "#07040a",
    secondaryColor: "#3dff8a",
    accentColor: "#c4122f",
  });
  try {
    await ensureSeeded();
    const [settings, walls] = await Promise.all([db.select().from(siteSettings), db.select().from(wallDesigns)]);
    const selected = settings.find((row) => row.key === "kid_login_wall_id")?.value;
    const wall = walls.find((row) => String(row.id) === selected) ?? walls[0];
    if (wall) style = wallStyle(wall);
  } catch {
    // keep default wall
  }
  return (
    <div className="min-h-screen" style={style}>
      <AuthScreen mode="kid" />
    </div>
  );
}
