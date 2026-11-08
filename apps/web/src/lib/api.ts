const API = process.env.NEXT_PUBLIC_API_BASE_URL!;

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("sb_token");
}

export function setToken(token: string) {
  localStorage.setItem("sb_token", token);
}

export async function api<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(opts.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API}${path}`, { ...opts, headers });
  if (!res.ok) {
    let msg = `API error ${res.status}`;
    try {
      const j = await res.json();
      if (j?.message) msg = typeof j.message === "string" ? j.message : JSON.stringify(j.message);
    } catch {}
    const e = new Error(msg) as Error & { status?: number };
    e.status = res.status;
    throw e;
  }
  return res.json() as Promise<T>;
}
