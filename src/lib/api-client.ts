/** Client helper for /api/v1 JSON envelope. */
export async function api<T>(
  path: string,
  init?: RequestInit,
): Promise<{ data: T } | { error: { code: string; message: string } }> {
  const res = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const json = await res.json();
  if (!res.ok) {
    return {
      error: json.error ?? { code: "http_error", message: res.statusText },
    };
  }
  return json as { data: T };
}

export function slugifyCode(input: string, prefix = ""): string {
  const base = input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  const stamp = Date.now().toString(36).slice(-4);
  return `${prefix}${base || "item"}-${stamp}`;
}
