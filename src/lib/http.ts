import { ensureSeeded } from "@/lib/seed";
export function json(data: unknown, status = 200) {
  return Response.json(data, { status });
}
export async function readJson<T>(req: Request): Promise<T> {
  try {
    return (await req.json()) as T;
  } catch {
    return {} as T;
  }
}
export async function boot() {
  try {
    await ensureSeeded();
  } catch {
    // Schema may not be pushed yet; callers still run.
  }
}
export async function sendEmail(to: string, subject: string, text: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return;
  const from = process.env.EMAIL_FROM || "North Pole Pen Pals <noreply@northpole.app>";
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, text }),
  }).catch(() => undefined);
}
