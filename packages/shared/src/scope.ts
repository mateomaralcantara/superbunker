/**
 * Utilidades de alcance de red para el escáner del rango.
 * Solo IPv4 + "localhost". Deny-by-default: nada se escanea si no está en la
 * allowlist (lista de CIDRs autorizados del rango).
 */

export function ipToInt(ip: string): number | null {
  const m = ip.trim().match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!m) return null;
  const o = m.slice(1).map(Number);
  if (o.some((n) => n > 255)) return null;
  return (((o[0] << 24) >>> 0) + (o[1] << 16) + (o[2] << 8) + o[3]) >>> 0;
}

/** Normaliza un objetivo a IPv4 literal; "localhost" -> 127.0.0.1. null si no es válido. */
export function normalizeTarget(target: string): string | null {
  const t = target.trim().toLowerCase();
  if (t === "localhost") return "127.0.0.1";
  return ipToInt(t) !== null ? t : null;
}

/** ¿Está la IP dentro de alguno de los CIDRs autorizados? */
export function inScope(ip: string, allowlist: string[]): boolean {
  const ipInt = ipToInt(ip);
  if (ipInt === null) return false;
  return allowlist.some((cidr) => {
    const [base, bitsStr] = cidr.trim().split("/");
    const baseInt = ipToInt(base);
    if (baseInt === null) return false;
    const bits = bitsStr === undefined ? 32 : parseInt(bitsStr, 10);
    if (Number.isNaN(bits) || bits < 0 || bits > 32) return false;
    const mask = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0;
    return (ipInt & mask) === (baseInt & mask);
  });
}

/** Parsea "22,80,443,8000-8010" -> lista de puertos (máx. 256). */
export function parsePorts(spec: string): number[] {
  const set = new Set<number>();
  for (const part of spec.split(",")) {
    const p = part.trim();
    if (!p) continue;
    const range = p.match(/^(\d+)-(\d+)$/);
    if (range) {
      let a = Number(range[1]);
      let b = Number(range[2]);
      if (a > b) [a, b] = [b, a];
      for (let i = a; i <= b && set.size < 256; i++) if (i >= 1 && i <= 65535) set.add(i);
    } else if (/^\d+$/.test(p)) {
      const n = Number(p);
      if (n >= 1 && n <= 65535) set.add(n);
    }
  }
  return Array.from(set).slice(0, 256);
}

/** Lee la allowlist de un string separado por comas. */
export function parseAllowlist(raw: string): string[] {
  return raw.split(",").map((s) => s.trim()).filter(Boolean);
}
