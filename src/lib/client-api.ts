export async function api<T = Record<string, unknown>>(
  path: string,
  body?: Record<string, unknown>,
): Promise<T> {
  const res = await fetch(path, {
    method: body ? "POST" : "GET",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = (await res.json()) as T & { error?: string };
  if (!res.ok) throw new Error(data.error || "Something magical went sideways.");
  return data;
}
export function when(date?: string | Date | null) {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}
